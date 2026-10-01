-- =============================================================================
-- Comunidades, publicações, reações, comentários, posts salvos e feed.
-- =============================================================================

create type public.community_status as enum ('pendente', 'ativa', 'suspensa');
create type public.post_type as enum ('receita', 'experiencia', 'pergunta', 'geral');
create type public.post_audience as enum ('publico', 'amigos');
create type public.reaction_kind as enum ('curtir', 'apoiar', 'preparei');

-- ---------------------------------------------------------------------------
-- Comunidades
-- ---------------------------------------------------------------------------
-- pendente: criada, aguardando um profissional aceitar ser admin (não aparece para todos)
-- ativa:    tem admin usuário e admin profissional
-- suspensa: perdeu um dos dois admins
create table public.communities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,60}$'),
  name text not null check (length(trim(name)) between 3 and 80),
  description text not null default '',
  category text not null,
  objective text,
  cover_image_url text,
  created_by uuid references public.profiles (id) on delete set null,
  admin_user_id uuid references public.profiles (id) on delete set null,
  professional_id uuid references public.professionals (user_id) on delete set null,
  former_professional_ids uuid[] not null default '{}',
  status public.community_status not null default 'pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger communities_updated_at before update on public.communities
  for each row execute function public.set_updated_at();
create index communities_category_idx on public.communities (category);
create index communities_search_idx on public.communities
  using gin (public.search_norm(name || ' ' || description) extensions.gin_trgm_ops);

create table public.community_members (
  community_id uuid not null references public.communities (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);
create index community_members_user_idx on public.community_members (user_id);

create or replace function public.is_community_admin(p_community uuid, p_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.communities
     where id = p_community and (admin_user_id = p_user or professional_id = p_user)
  );
$$;

create or replace function public.is_community_member(p_community uuid, p_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.community_members where community_id = p_community and user_id = p_user
  );
$$;

create or replace function public.community_is_visible(p_community uuid, p_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.communities c
     where c.id = p_community
       and (
         c.status <> 'pendente'
         or c.created_by = p_user
         or public.is_platform_admin(p_user)
         -- Profissionais veem as pendentes para poder aceitar a administração.
         or public.is_verified_professional(p_user)
       )
  );
$$;

alter table public.communities enable row level security;
alter table public.community_members enable row level security;

create policy "communities: leitura" on public.communities
  for select to authenticated using (public.community_is_visible(id));
create policy "communities: admins editam" on public.communities
  for update to authenticated
  using (public.is_community_admin(id) or public.is_platform_admin())
  with check (public.is_community_admin(id) or public.is_platform_admin());
revoke update on public.communities from authenticated, anon;
grant update (name, description, objective, category, cover_image_url) on public.communities to authenticated;

create policy "community_members: leitura" on public.community_members
  for select to authenticated using (public.community_is_visible(community_id));
create policy "community_members: entrar" on public.community_members
  for insert to authenticated with check (
    user_id = auth.uid()
    and exists (select 1 from public.communities c where c.id = community_id and c.status <> 'pendente')
  );
-- Admins precisam deixar a administração antes de sair.
create policy "community_members: sair" on public.community_members
  for delete to authenticated using (
    user_id = auth.uid() and not public.is_community_admin(community_id)
  );

create or replace function public.unique_slug(p_name text)
returns text language plpgsql volatile set search_path = public as $$
declare
  base text := trim(both '-' from regexp_replace(public.search_norm(p_name), '[^a-z0-9]+', '-', 'g'));
  candidate text;
  n integer := 1;
begin
  base := left(coalesce(nullif(base, ''), 'comunidade'), 50);
  if length(base) < 3 then base := base || '-nc'; end if;
  candidate := base;
  while exists (select 1 from public.communities where slug = candidate) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  return candidate;
end;
$$;

-- Qualquer pessoa cria; vira admin usuário e a comunidade espera um profissional.
create or replace function public.create_community(
  p_name text, p_description text, p_category text,
  p_objective text default null, p_cover_image_url text default null
)
returns public.communities
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  c public.communities;
begin
  if me is null then raise exception 'É preciso estar logado' using errcode = '42501'; end if;
  if exists (select 1 from public.communities where admin_user_id = me) then
    raise exception 'Você já administra uma comunidade. Cada pessoa administra uma por vez.';
  end if;
  insert into public.communities (slug, name, description, category, objective, cover_image_url,
                                   created_by, admin_user_id, status)
  values (public.unique_slug(p_name), trim(p_name), coalesce(trim(p_description), ''), p_category,
          nullif(trim(p_objective), ''), p_cover_image_url, me, me, 'pendente')
  returning * into c;
  insert into public.community_members (community_id, user_id) values (c.id, me);
  return c;
end;
$$;

-- Profissional verificado aceita ser o admin profissional.
create or replace function public.accept_community_professional(p_community uuid)
returns public.communities
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  c public.communities;
begin
  if not public.is_verified_professional(me) then
    raise exception 'Apenas profissionais verificados podem administrar comunidades.';
  end if;
  update public.communities
     set professional_id = me,
         status = case when admin_user_id is not null then 'ativa'::public.community_status else 'suspensa' end
   where id = p_community and professional_id is null and not (me = any (former_professional_ids))
  returning * into c;
  if c.id is null then raise exception 'Esta comunidade não está disponível para você.'; end if;
  insert into public.community_members (community_id, user_id) values (c.id, me) on conflict do nothing;
  return c;
end;
$$;

create or replace function public.leave_community_admin(p_community uuid)
returns public.communities
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  c public.communities;
begin
  update public.communities
     set admin_user_id = case when admin_user_id = me then null else admin_user_id end,
         professional_id = case when professional_id = me then null else professional_id end,
         former_professional_ids = case when professional_id = me
           then array_append(former_professional_ids, me) else former_professional_ids end,
         status = case when status = 'pendente' then status else 'suspensa' end
   where id = p_community and (admin_user_id = me or professional_id = me)
  returning * into c;
  if c.id is null then raise exception 'Você não administra esta comunidade.'; end if;
  return c;
end;
$$;

-- Admin da plataforma indica um membro como admin usuário.
create or replace function public.designate_community_admin_user(p_community uuid, p_user uuid)
returns public.communities
language plpgsql security definer set search_path = public as $$
declare
  c public.communities;
begin
  if not public.is_platform_admin() then
    raise exception 'Apenas administradores da plataforma.' using errcode = '42501';
  end if;
  if not public.is_community_member(p_community, p_user) then
    raise exception 'A pessoa precisa ser membro da comunidade.';
  end if;
  if exists (select 1 from public.communities where admin_user_id = p_user and id <> p_community) then
    raise exception 'Esta pessoa já administra outra comunidade.';
  end if;
  update public.communities
     set admin_user_id = p_user,
         status = case when professional_id is not null then 'ativa'::public.community_status else status end
   where id = p_community
  returning * into c;
  return c;
end;
$$;

-- ---------------------------------------------------------------------------
-- Publicações
-- ---------------------------------------------------------------------------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  community_id uuid references public.communities (id) on delete cascade,
  type public.post_type not null default 'geral',
  title text,
  body text not null default '',
  image_url text,
  tags text[] not null default '{}',
  audience public.post_audience not null default 'publico',
  -- { prepTime, servings, difficulty, ingredients[], steps[], category }
  recipe jsonb,
  block_order text[],
  theme_id uuid,
  pinned boolean not null default false,
  hidden boolean not null default false,
  publish_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(body)) > 0 or image_url is not null or title is not null)
);
create trigger posts_updated_at before update on public.posts
  for each row execute function public.set_updated_at();
create index posts_feed_idx on public.posts (publish_at desc);
create index posts_author_idx on public.posts (author_id, publish_at desc);
create index posts_community_idx on public.posts (community_id, publish_at desc);
create index posts_tags_idx on public.posts using gin (tags);
create index posts_search_idx on public.posts
  using gin (public.search_norm(coalesce(title, '') || ' ' || body) extensions.gin_trgm_ops);

-- Regra única de visibilidade (usada por posts, reações e comentários).
create or replace function public.post_is_visible(
  p_author uuid, p_community uuid, p_audience public.post_audience,
  p_hidden boolean, p_publish_at timestamptz, p_viewer uuid default auth.uid()
)
returns boolean language sql stable security definer set search_path = public as $$
  select p_author = p_viewer
      or public.is_platform_admin(p_viewer)
      or (
        not p_hidden
        and p_publish_at <= now()
        and not public.is_blocked_between(p_author, p_viewer)
        and case
          when p_community is not null then public.community_is_visible(p_community, p_viewer)
          when p_audience = 'amigos' then public.are_friends(p_author, p_viewer)
          else public.can_view_profile_content(p_author, p_viewer)
        end
      );
$$;

create or replace function public.can_view_post(p_post uuid, p_viewer uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.posts p
     where p.id = p_post
       and public.post_is_visible(p.author_id, p.community_id, p.audience, p.hidden, p.publish_at, p_viewer)
  );
$$;

-- Só profissionais agendam; posts em comunidade exigem ser membro.
create or replace function public.check_post_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.publish_at > now() + interval '1 minute' and not public.is_verified_professional(new.author_id) then
    raise exception 'Apenas profissionais podem agendar publicações.';
  end if;
  if tg_op = 'INSERT' then
    new.pinned := false;
    new.hidden := false;
    if new.community_id is not null and not public.is_community_member(new.community_id, new.author_id) then
      raise exception 'Entre na comunidade para publicar nela.';
    end if;
  end if;
  return new;
end;
$$;
create trigger posts_check_write before insert or update of publish_at on public.posts
  for each row execute function public.check_post_write();

alter table public.posts enable row level security;
create policy "posts: leitura" on public.posts
  for select to authenticated using (
    public.post_is_visible(author_id, community_id, audience, hidden, publish_at)
  );
create policy "posts: autor publica" on public.posts
  for insert to authenticated with check (author_id = auth.uid());
create policy "posts: autor edita" on public.posts
  for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "posts: remoção" on public.posts
  for delete to authenticated using (
    author_id = auth.uid()
    or public.is_platform_admin()
    or (community_id is not null and public.is_community_admin(community_id))
  );
revoke update on public.posts from authenticated, anon;
grant update (type, title, body, image_url, tags, audience, recipe, block_order, theme_id, publish_at)
  on public.posts to authenticated;

-- Fixar no topo da comunidade (admins da comunidade).
create or replace function public.toggle_post_pin(p_post uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v boolean;
begin
  update public.posts set pinned = not pinned
   where id = p_post and community_id is not null and public.is_community_admin(community_id)
  returning pinned into v;
  if v is null then raise exception 'Apenas admins da comunidade podem fixar.'; end if;
  return v;
end;
$$;

-- ---------------------------------------------------------------------------
-- Reações, comentários e posts salvos
-- ---------------------------------------------------------------------------
create table public.post_reactions (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind public.reaction_kind not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id, kind)
);
create index post_reactions_user_idx on public.post_reactions (user_id);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 2000),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index comments_post_idx on public.comments (post_id, created_at);

create table public.saved_posts (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

alter table public.post_reactions enable row level security;
alter table public.comments enable row level security;
alter table public.saved_posts enable row level security;

create policy "post_reactions: leitura" on public.post_reactions
  for select to authenticated using (public.can_view_post(post_id));
create policy "post_reactions: reagir" on public.post_reactions
  for insert to authenticated with check (user_id = auth.uid() and public.can_view_post(post_id));
create policy "post_reactions: desfazer" on public.post_reactions
  for delete to authenticated using (user_id = auth.uid());

create policy "comments: leitura" on public.comments
  for select to authenticated using (
    public.can_view_post(post_id)
    and (not hidden or author_id = auth.uid() or public.is_platform_admin())
    and not public.is_blocked_between(author_id, auth.uid())
  );
create policy "comments: comentar" on public.comments
  for insert to authenticated with check (author_id = auth.uid() and public.can_view_post(post_id));
create policy "comments: remoção" on public.comments
  for delete to authenticated using (
    author_id = auth.uid()
    or public.is_platform_admin()
    or exists (
      select 1 from public.posts p
       where p.id = post_id
         and (p.author_id = auth.uid()
              or (p.community_id is not null and public.is_community_admin(p.community_id)))
    )
  );
revoke update on public.comments from authenticated, anon;

create policy "saved_posts: dono" on public.saved_posts
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.can_view_post(post_id));

-- ---------------------------------------------------------------------------
-- Feed: posts visíveis + autor, comunidade, reações, comentários e "salvo".
-- security invoker: o RLS de cada tabela continua valendo.
-- ---------------------------------------------------------------------------
create or replace function public.get_feed(
  p_scope text default 'todos',          -- todos | amigos | seguindo | comunidades | comunidade | autor | salvos | agendados | tema
  p_community uuid default null,
  p_author uuid default null,
  p_type public.post_type default null,
  p_query text default null,
  p_theme uuid default null,
  p_before timestamptz default null,
  p_limit integer default 20
)
returns table (
  id uuid, author_id uuid, author_name text, author_username text, author_avatar text,
  author_role public.app_role, community_id uuid, community_slug text, community_name text,
  type public.post_type, title text, body text, image_url text, tags text[],
  audience public.post_audience, recipe jsonb, block_order text[], theme_id uuid,
  pinned boolean, hidden boolean, publish_at timestamptz, created_at timestamptz,
  likes uuid[], supports uuid[], prepared uuid[], comments jsonb, saved boolean
)
language sql stable set search_path = public as $$
  select p.id, p.author_id, a.name, a.username, a.avatar_url, a.role,
         p.community_id, c.slug, c.name,
         p.type, p.title, p.body, p.image_url, p.tags, p.audience, p.recipe, p.block_order,
         p.theme_id, p.pinned, p.hidden, p.publish_at, p.created_at,
         coalesce((select array_agg(r.user_id) from public.post_reactions r where r.post_id = p.id and r.kind = 'curtir'), '{}'),
         coalesce((select array_agg(r.user_id) from public.post_reactions r where r.post_id = p.id and r.kind = 'apoiar'), '{}'),
         coalesce((select array_agg(r.user_id) from public.post_reactions r where r.post_id = p.id and r.kind = 'preparei'), '{}'),
         coalesce((
           select jsonb_agg(jsonb_build_object(
                    'id', cm.id, 'author_id', cm.author_id, 'author_name', ca.name,
                    'author_username', ca.username, 'author_avatar', ca.avatar_url,
                    'body', cm.body, 'created_at', cm.created_at) order by cm.created_at)
             from public.comments cm
             join public.profiles ca on ca.id = cm.author_id
            where cm.post_id = p.id
         ), '[]'::jsonb),
         exists (select 1 from public.saved_posts s where s.post_id = p.id and s.user_id = auth.uid())
    from public.posts p
    join public.profiles a on a.id = p.author_id
    left join public.communities c on c.id = p.community_id
   where (p_before is null or p.publish_at < p_before)
     and (p_type is null or p.type = p_type)
     and (p_query is null or public.search_norm(coalesce(p.title, '') || ' ' || p.body || ' ' || array_to_string(p.tags, ' '))
                              like '%' || public.search_norm(p_query) || '%')
     and case coalesce(p_scope, 'todos')
       when 'todos' then p.publish_at <= now()
       when 'amigos' then p.publish_at <= now()
         and (p.author_id = auth.uid() or p.author_id in (select public.friend_ids(auth.uid())))
       when 'seguindo' then p.publish_at <= now()
         and p.author_id in (select followee_id from public.follows where follower_id = auth.uid())
       when 'comunidades' then p.publish_at <= now()
         and p.community_id in (select community_id from public.community_members where user_id = auth.uid())
       when 'comunidade' then p.community_id = p_community and p.publish_at <= now()
       when 'autor' then p.author_id = p_author and (p.publish_at <= now() or p.author_id = auth.uid())
       when 'salvos' then exists (select 1 from public.saved_posts s where s.post_id = p.id and s.user_id = auth.uid())
       when 'agendados' then p.author_id = auth.uid() and p.publish_at > now()
       when 'tema' then p.theme_id = p_theme and p.publish_at <= now()
       else false
     end
   order by (p_scope = 'comunidade' and p.pinned) desc, p.publish_at desc
   limit least(greatest(coalesce(p_limit, 20), 1), 100);
$$;

-- ---------------------------------------------------------------------------
-- Imagens (buckets públicos; cada pessoa escreve na própria pasta)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('post-images', 'post-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('community-covers', 'community-covers', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "post-images: leitura" on storage.objects
  for select to anon, authenticated using (bucket_id in ('post-images', 'community-covers'));
create policy "post-images: dono envia" on storage.objects
  for insert to authenticated with check (
    bucket_id in ('post-images', 'community-covers') and public.storage_owner(name) = auth.uid()
  );
create policy "post-images: dono apaga" on storage.objects
  for delete to authenticated using (
    bucket_id in ('post-images', 'community-covers') and public.storage_owner(name) = auth.uid()
  );

alter publication supabase_realtime add table public.posts, public.comments, public.post_reactions;

revoke execute on function public.create_community(text, text, text, text, text) from public, anon;
revoke execute on function public.accept_community_professional(uuid) from public, anon;
revoke execute on function public.leave_community_admin(uuid) from public, anon;
revoke execute on function public.designate_community_admin_user(uuid, uuid) from public, anon;
revoke execute on function public.toggle_post_pin(uuid) from public, anon;
revoke execute on function public.get_feed(text, uuid, uuid, public.post_type, text, uuid, timestamptz, integer) from public, anon;

-- =============================================================================
-- Rede social: @username, privacidade, configurações, bloqueios, amizades,
-- seguir profissionais e pesquisa de usuários.
--
-- Regras de relacionamento:
--   usuário comum ↔ usuário comum  → amizade (pedido + aceite)
--   qualquer pessoa → profissional  → seguir (sem aprovação)
--   profissional → usuário comum    → não existe (contato só pelo vínculo clínico)
-- =============================================================================

create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- unaccent não é IMMUTABLE; este wrapper permite usá-lo em índices.
create or replace function public.f_unaccent(text)
returns text language sql immutable parallel safe strict
set search_path = public, extensions as $$
  select extensions.unaccent('extensions.unaccent'::regdictionary, $1);
$$;

create or replace function public.search_norm(text)
returns text language sql immutable parallel safe strict as $$
  select lower(public.f_unaccent(trim($1)));
$$;

-- ---------------------------------------------------------------------------
-- @username e perfil privado
-- ---------------------------------------------------------------------------
alter table public.profiles add column username text;
alter table public.profiles add column is_private boolean not null default false;
alter table public.profiles
  add constraint profiles_username_format check (username ~ '^[a-z0-9_.]{3,30}$');

-- Gera um @ livre a partir do nome (ou do e-mail): "Maria Lorena" → "maria.lorena", "maria.lorena2"...
create or replace function public.generate_username(p_name text, p_email text default null)
returns text language plpgsql volatile set search_path = public as $$
declare
  base text;
  candidate text;
  n integer := 1;
begin
  base := regexp_replace(public.search_norm(coalesce(nullif(p_name, ''), split_part(p_email, '@', 1), 'usuario')),
                         '[^a-z0-9]+', '.', 'g');
  base := trim(both '.' from base);
  base := left(base, 24);
  if length(base) < 3 then
    base := rpad(coalesce(nullif(base, ''), 'user'), 3, '0');
  end if;
  candidate := base;
  while exists (select 1 from public.profiles where username = candidate) loop
    n := n + 1;
    candidate := left(base, 24) || n::text;
  end loop;
  return candidate;
end;
$$;

update public.profiles p
   set username = public.generate_username(p.name, v.email)
  from public.profile_private v
 where v.id = p.id and p.username is null;
update public.profiles set username = public.generate_username(name) where username is null;

alter table public.profiles alter column username set not null;
create unique index profiles_username_key on public.profiles (username);
create index profiles_name_search_idx on public.profiles
  using gin (public.search_norm(name) extensions.gin_trgm_ops);
create index profiles_username_search_idx on public.profiles
  using gin (username extensions.gin_trgm_ops);

-- @ é editável pelo dono (com o formato validado pelo check).
grant update (username, is_private) on public.profiles to authenticated;

-- Novos usuários ganham @ automaticamente.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  display_name text := coalesce(nullif(meta ->> 'name', ''), split_part(new.email, '@', 1));
begin
  insert into public.profiles (id, name, username, goal, journey_goal)
  values (
    new.id,
    display_name,
    public.generate_username(display_name, new.email),
    nullif(meta ->> 'goal', ''),
    coalesce(nullif(meta ->> 'journey_goal', ''), nullif(meta ->> 'goal', ''))
  );
  insert into public.profile_private (id, email, phone, cpf, birth_date)
  values (
    new.id,
    new.email,
    nullif(meta ->> 'phone', ''),
    nullif(meta ->> 'cpf', ''),
    nullif(meta ->> 'birth_date', '')::date
  );
  insert into public.user_settings (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Configurações pessoais (privacidade fina, notificações, aparência, idioma)
-- ---------------------------------------------------------------------------
create table public.user_settings (
  id uuid primary key references public.profiles (id) on delete cascade,
  show_email boolean not null default false,
  show_phone boolean not null default false,
  -- { "social": true, "clinical": true, "achievements": true, "theme": true }
  notification_prefs jsonb not null default '{}'::jsonb,
  appearance jsonb,
  locale text check (locale in ('pt-BR', 'en', 'es', 'fr')),
  updated_at timestamptz not null default now()
);
create trigger user_settings_updated_at before update on public.user_settings
  for each row execute function public.set_updated_at();
insert into public.user_settings (id) select id from public.profiles on conflict do nothing;

alter table public.user_settings enable row level security;
create policy "user_settings: dono" on public.user_settings
  for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- Bloqueios
-- ---------------------------------------------------------------------------
create table public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index blocks_blocked_idx on public.blocks (blocked_id);
alter table public.blocks enable row level security;
create policy "blocks: dono lê" on public.blocks
  for select to authenticated using (blocker_id = auth.uid());
create policy "blocks: dono bloqueia" on public.blocks
  for insert to authenticated with check (blocker_id = auth.uid());
create policy "blocks: dono desbloqueia" on public.blocks
  for delete to authenticated using (blocker_id = auth.uid());

create or replace function public.is_blocked_between(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.blocks
     where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;

-- ---------------------------------------------------------------------------
-- Amizades (só entre usuários comuns)
-- ---------------------------------------------------------------------------
create type public.friendship_status as enum ('pendente', 'aceita', 'recusada');

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status public.friendship_status not null default 'pendente',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (requester_id <> addressee_id)
);
-- Um registro por par, independentemente de quem pediu.
create unique index friendships_pair_key on public.friendships
  (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index friendships_addressee_idx on public.friendships (addressee_id, status);

alter table public.friendships enable row level security;
create policy "friendships: participantes leem" on public.friendships
  for select to authenticated using (requester_id = auth.uid() or addressee_id = auth.uid());

create or replace function public.are_friends(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.friendships
     where status = 'aceita'
       and least(requester_id, addressee_id) = least(a, b)
       and greatest(requester_id, addressee_id) = greatest(a, b)
  );
$$;

create or replace function public.friend_ids(p_user uuid default auth.uid())
returns setof uuid language sql stable security definer set search_path = public as $$
  select case when requester_id = p_user then addressee_id else requester_id end
    from public.friendships
   where status = 'aceita' and (requester_id = p_user or addressee_id = p_user);
$$;

create or replace function public.request_friendship(p_user uuid)
returns public.friendships
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  f public.friendships;
begin
  if me is null then raise exception 'É preciso estar logado' using errcode = '42501'; end if;
  if p_user = me then raise exception 'Você não pode adicionar a si mesmo.'; end if;
  if public.is_verified_professional(me) or public.is_verified_professional(p_user) then
    raise exception 'Amizades são entre usuários; profissionais podem ser seguidos.';
  end if;
  if public.is_blocked_between(me, p_user) then
    raise exception 'Não é possível adicionar esta pessoa.';
  end if;

  select * into f from public.friendships
   where least(requester_id, addressee_id) = least(me, p_user)
     and greatest(requester_id, addressee_id) = greatest(me, p_user)
   for update;

  if f.id is null then
    insert into public.friendships (requester_id, addressee_id)
    values (me, p_user) returning * into f;
  elsif f.status = 'aceita' then
    return f;
  elsif f.status = 'pendente' and f.addressee_id = me then
    -- A outra pessoa já tinha pedido: aceita.
    update public.friendships set status = 'aceita', responded_at = now()
     where id = f.id returning * into f;
  else
    -- Pedido recusado antes (ou repetido): reabre como novo pedido meu.
    update public.friendships
       set requester_id = me, addressee_id = p_user, status = 'pendente',
           created_at = now(), responded_at = null
     where id = f.id returning * into f;
  end if;
  return f;
end;
$$;

create or replace function public.respond_friendship(p_friendship uuid, p_accept boolean)
returns public.friendships
language plpgsql security definer set search_path = public as $$
declare
  f public.friendships;
begin
  update public.friendships
     set status = case when p_accept then 'aceita'::public.friendship_status else 'recusada' end,
         responded_at = now()
   where id = p_friendship and addressee_id = auth.uid() and status = 'pendente'
  returning * into f;
  if f.id is null then raise exception 'Pedido não encontrado.'; end if;
  return f;
end;
$$;

-- Desfaz amizade, cancela pedido enviado ou recusa silenciosamente.
create or replace function public.remove_friendship(p_user uuid)
returns void language sql security definer set search_path = public as $$
  delete from public.friendships
   where least(requester_id, addressee_id) = least(auth.uid(), p_user)
     and greatest(requester_id, addressee_id) = greatest(auth.uid(), p_user);
$$;

-- ---------------------------------------------------------------------------
-- Seguir profissionais
-- ---------------------------------------------------------------------------
create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followee_id uuid not null references public.professionals (user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);
create index follows_followee_idx on public.follows (followee_id);
alter table public.follows enable row level security;
create policy "follows: leitura" on public.follows
  for select to authenticated using (true);
create policy "follows: seguir" on public.follows
  for insert to authenticated with check (
    follower_id = auth.uid() and not public.is_blocked_between(follower_id, followee_id)
  );
create policy "follows: deixar de seguir" on public.follows
  for delete to authenticated using (follower_id = auth.uid());

-- Bloquear desfaz amizade e seguidas entre as duas pessoas.
create or replace function public.on_block_cleanup()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from public.friendships
   where least(requester_id, addressee_id) = least(new.blocker_id, new.blocked_id)
     and greatest(requester_id, addressee_id) = greatest(new.blocker_id, new.blocked_id);
  delete from public.follows
   where (follower_id = new.blocker_id and followee_id = new.blocked_id)
      or (follower_id = new.blocked_id and followee_id = new.blocker_id);
  return new;
end;
$$;
create trigger blocks_cleanup after insert on public.blocks
  for each row execute function public.on_block_cleanup();

-- ---------------------------------------------------------------------------
-- Quem pode ver o conteúdo (jornada, posts) de um perfil
-- ---------------------------------------------------------------------------
create or replace function public.can_view_profile_content(p_owner uuid, p_viewer uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select p_owner = p_viewer
      or public.is_platform_admin(p_viewer)
      or (
        not public.is_blocked_between(p_owner, p_viewer)
        and (
          not coalesce((select is_private from public.profiles where id = p_owner), false)
          or public.are_friends(p_owner, p_viewer)
        )
      );
$$;

-- Contato público (e-mail/telefone) conforme as preferências do dono.
create or replace function public.get_profile_contact(p_user uuid)
returns table (email text, phone text)
language sql stable security definer set search_path = public as $$
  select case when p_user = auth.uid() or public.is_platform_admin() or public.has_active_link(p_user)
                or (s.show_email and public.can_view_profile_content(p_user)) then v.email end,
         case when p_user = auth.uid() or public.is_platform_admin() or public.has_active_link(p_user)
                or (s.show_phone and public.can_view_profile_content(p_user)) then v.phone end
    from public.profile_private v
    left join public.user_settings s on s.id = v.id
   where v.id = p_user;
$$;

-- Relação entre quem vê e outra pessoa (para botões e pesquisa).
create or replace function public.relationship_with(p_user uuid)
returns text language sql stable security definer set search_path = public as $$
  select case
    when p_user = auth.uid() then 'eu'
    when exists (select 1 from public.blocks where blocker_id = auth.uid() and blocked_id = p_user) then 'bloqueado'
    when exists (select 1 from public.follows where follower_id = auth.uid() and followee_id = p_user) then 'seguindo'
    when public.are_friends(auth.uid(), p_user) then 'amigo'
    when exists (select 1 from public.friendships where requester_id = auth.uid() and addressee_id = p_user and status = 'pendente') then 'pedido_enviado'
    when exists (select 1 from public.friendships where requester_id = p_user and addressee_id = auth.uid() and status = 'pendente') then 'pedido_recebido'
    else null
  end;
$$;

-- ---------------------------------------------------------------------------
-- Pesquisa de usuários
-- ---------------------------------------------------------------------------
create or replace function public.search_users(
  p_query text default '',
  p_role public.app_role default null,
  p_profession text default null,
  p_specialty text default null,
  p_uf text default null,
  p_verified_only boolean default false,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  id uuid,
  name text,
  username text,
  avatar_url text,
  role public.app_role,
  is_private boolean,
  bio text,
  profession text,
  council text,
  registration text,
  uf text,
  specialties text[],
  verified boolean,
  relationship text,
  mutual_friends integer,
  followers integer
)
language plpgsql stable security definer set search_path = public, extensions as $$
declare
  me uuid := auth.uid();
  raw text := trim(coalesce(p_query, ''));
  by_handle boolean := left(raw, 1) = '@';
  q text := public.search_norm(ltrim(raw, '@'));
begin
  if me is null then raise exception 'É preciso estar logado' using errcode = '42501'; end if;

  return query
  with candidates as (
    select p.*, pr.user_id is not null as is_pro, pr.profession as pro_profession,
           pr.council as pro_council, pr.registration as pro_registration, pr.uf as pro_uf,
           pr.specialties as pro_specialties,
           case
             when q = '' then 0
             when p.username = q then 1
             when p.username like q || '%' then 0.9
             when not by_handle and public.search_norm(p.name) like q || '%' then 0.85
             when not by_handle and public.search_norm(p.name) like '% ' || q || '%' then 0.8
             else greatest(
               similarity(p.username, q),
               case when by_handle then 0 else word_similarity(q, public.search_norm(p.name)) end
             )
           end as score
      from public.profiles p
      left join public.professionals pr on pr.user_id = p.id
     where p.id <> me
       and not public.is_blocked_between(p.id, me)
       and (p_role is null or p.role = p_role)
       and (p_profession is null or pr.profession = p_profession)
       and (p_specialty is null or p_specialty = any (pr.specialties))
       and (p_uf is null or pr.uf = p_uf)
       and (not p_verified_only or pr.user_id is not null)
       and (
         q = ''
         or p.username like '%' || q || '%'
         or (not by_handle and public.search_norm(p.name) like '%' || q || '%')
         or similarity(p.username, q) > 0.3
         or (not by_handle and word_similarity(q, public.search_norm(p.name)) > 0.4)
       )
  )
  select c.id, c.name, c.username, c.avatar_url, c.role,
         c.is_private and not public.are_friends(c.id, me),
         case when c.is_private and not public.are_friends(c.id, me) then null else c.bio end,
         c.pro_profession, c.pro_council, c.pro_registration, c.pro_uf, c.pro_specialties,
         c.is_pro,
         public.relationship_with(c.id),
         (select count(*)::integer from public.friend_ids(c.id) f
           where f in (select public.friend_ids(me))),
         (select count(*)::integer from public.follows fo where fo.followee_id = c.id)
    from candidates c
   order by c.score desc, c.is_pro desc, c.name
   limit least(greatest(p_limit, 1), 50) offset greatest(p_offset, 0);
end;
$$;

-- Perfil público por id ou @username (com contadores e relação), respeitando privacidade.
create or replace function public.get_public_profile(p_key text)
returns table (
  id uuid, name text, username text, avatar_url text, bio text, role public.app_role,
  is_private boolean, can_view_content boolean, relationship text,
  friends_count integer, followers_count integer, following_count integer,
  created_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select p.id, p.name, p.username, p.avatar_url,
         case when public.can_view_profile_content(p.id) then p.bio else null end,
         p.role, p.is_private, public.can_view_profile_content(p.id),
         public.relationship_with(p.id),
         (select count(*)::integer from public.friend_ids(p.id)),
         (select count(*)::integer from public.follows where followee_id = p.id),
         (select count(*)::integer from public.follows where follower_id = p.id),
         p.created_at
    from public.profiles p
   where (p.id::text = p_key or p.username = lower(ltrim(p_key, '@')))
     and not public.is_blocked_between(p.id, auth.uid());
$$;

revoke execute on function public.request_friendship(uuid) from public, anon;
revoke execute on function public.respond_friendship(uuid, boolean) from public, anon;
revoke execute on function public.remove_friendship(uuid) from public, anon;
revoke execute on function public.search_users(text, public.app_role, text, text, text, boolean, integer, integer) from public, anon;
revoke execute on function public.get_public_profile(text) from public, anon;
revoke execute on function public.get_profile_contact(uuid) from public, anon;

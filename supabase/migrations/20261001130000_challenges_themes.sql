-- =============================================================================
-- Desafios (criados pelo profissional-admin da comunidade), tema da semana com
-- enquete e o monitoramento anônimo de buscas que alimenta o tema.
--
-- Ciclo do tema: buscas de domingo a sexta → sábado a IA gera a PRÉVIA (os
-- profissionais são avisados e podem agendar posts) → domingo vira ATIVO.
-- =============================================================================

create type public.theme_status as enum ('previa', 'ativo', 'encerrado');

-- ---------------------------------------------------------------------------
-- Tema da semana
-- ---------------------------------------------------------------------------
create table public.weekly_themes (
  id uuid primary key default gen_random_uuid(),
  week_start date not null unique check (extract(dow from week_start) = 0), -- domingo
  status public.theme_status not null default 'previa',
  title text not null,
  subtitle text,
  description text not null,
  badge text,
  question text,
  poll_question text,
  -- { "en": { title, subtitle, description, badge, question, poll_question }, "es": {...}, "fr": {...} }
  translations jsonb not null default '{}'::jsonb,
  source text not null default 'ia' check (source in ('ia', 'sazonal', 'admin', 'seed')),
  -- Termos mais buscados que originaram o tema: [{ "term": "...", "hits": 12 }]
  source_terms jsonb not null default '[]'::jsonb,
  featured_post_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  edited_by uuid references public.profiles (id) on delete set null,
  edited_at timestamptz
);
-- Só um tema ativo por vez.
create unique index weekly_themes_one_active on public.weekly_themes ((status)) where status = 'ativo';

create table public.theme_poll_options (
  id uuid primary key default gen_random_uuid(),
  theme_id uuid not null references public.weekly_themes (id) on delete cascade,
  position integer not null default 0,
  text text not null,
  translations jsonb not null default '{}'::jsonb  -- { "en": "...", "es": "...", "fr": "..." }
);
create index theme_poll_options_theme_idx on public.theme_poll_options (theme_id, position);

create table public.theme_poll_votes (
  theme_id uuid not null references public.weekly_themes (id) on delete cascade,
  option_id uuid not null references public.theme_poll_options (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (theme_id, user_id)
);
create index theme_poll_votes_option_idx on public.theme_poll_votes (option_id);

alter table public.posts
  add constraint posts_theme_id_fkey foreign key (theme_id) references public.weekly_themes (id) on delete set null;
create index posts_theme_idx on public.posts (theme_id, publish_at desc);

alter table public.weekly_themes enable row level security;
alter table public.theme_poll_options enable row level security;
alter table public.theme_poll_votes enable row level security;

-- Prévia: só profissionais e admins. Ativo/encerrado: todos.
create or replace function public.can_view_theme(p_theme uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.weekly_themes t
     where t.id = p_theme
       and (t.status <> 'previa' or public.is_verified_professional() or public.is_platform_admin())
  );
$$;

create policy "weekly_themes: leitura" on public.weekly_themes
  for select to anon, authenticated using (
    status <> 'previa' or public.is_verified_professional() or public.is_platform_admin()
  );
create policy "weekly_themes: admin edita" on public.weekly_themes
  for update to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());
create policy "weekly_themes: admin cria" on public.weekly_themes
  for insert to authenticated with check (public.is_platform_admin());

create policy "theme_poll_options: leitura" on public.theme_poll_options
  for select to anon, authenticated using (public.can_view_theme(theme_id));
create policy "theme_poll_options: admin gerencia" on public.theme_poll_options
  for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy "theme_poll_votes: leitura" on public.theme_poll_votes
  for select to authenticated using (public.can_view_theme(theme_id));
create policy "theme_poll_votes: votar" on public.theme_poll_votes
  for insert to authenticated with check (
    user_id = auth.uid()
    and exists (select 1 from public.weekly_themes t where t.id = theme_id and t.status = 'ativo')
    and exists (select 1 from public.theme_poll_options o where o.id = option_id and o.theme_id = theme_id)
  );
create policy "theme_poll_votes: mudar voto" on public.theme_poll_votes
  for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.theme_poll_options o where o.id = option_id and o.theme_id = theme_id)
  );
create policy "theme_poll_votes: retirar voto" on public.theme_poll_votes
  for delete to authenticated using (user_id = auth.uid());

-- Edição pelo admin registra autoria.
create or replace function public.mark_theme_edit()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null then
    new.edited_by := auth.uid();
    new.edited_at := now();
  end if;
  return new;
end;
$$;
create trigger weekly_themes_mark_edit before update on public.weekly_themes
  for each row when (old.title is distinct from new.title or old.description is distinct from new.description
                     or old.subtitle is distinct from new.subtitle or old.question is distinct from new.question
                     or old.poll_question is distinct from new.poll_question)
  execute function public.mark_theme_edit();

-- Domingo de manhã: a prévia da semana vira o tema ativo.
create or replace function public.activate_weekly_theme()
returns uuid language plpgsql security definer set search_path = public as $$
declare
  this_sunday date := (now() at time zone 'America/Sao_Paulo')::date
                      - extract(dow from (now() at time zone 'America/Sao_Paulo'))::integer;
  next_id uuid;
begin
  select id into next_id from public.weekly_themes
   where week_start = this_sunday and status = 'previa';
  if next_id is null then
    -- Sem prévia (falha da geração): o tema anterior continua valendo.
    return null;
  end if;
  update public.weekly_themes set status = 'encerrado' where status = 'ativo';
  update public.weekly_themes set status = 'ativo', activated_at = now() where id = next_id;
  return next_id;
end;
$$;

-- Tema atual (o ativo) e a prévia da próxima semana, se houver.
create or replace view public.current_theme
with (security_invoker = true) as
select * from public.weekly_themes where status = 'ativo';

-- Resultado da enquete.
create or replace function public.theme_poll_results(p_theme uuid)
returns table (option_id uuid, votes integer, mine boolean)
language sql stable security definer set search_path = public as $$
  select o.id,
         (select count(*)::integer from public.theme_poll_votes v where v.option_id = o.id),
         exists (select 1 from public.theme_poll_votes v where v.option_id = o.id and v.user_id = auth.uid())
    from public.theme_poll_options o
   where o.theme_id = p_theme and public.can_view_theme(p_theme)
   order by o.position;
$$;

-- ---------------------------------------------------------------------------
-- Monitoramento de buscas (anônimo e agregado: sem saber quem buscou)
-- ---------------------------------------------------------------------------
create table public.search_term_stats (
  term text not null,
  day date not null default (now() at time zone 'America/Sao_Paulo')::date,
  hits integer not null default 1,
  primary key (term, day)
);
alter table public.search_term_stats enable row level security;
create policy "search_term_stats: admins leem" on public.search_term_stats
  for select to authenticated using (public.is_platform_admin());

-- Chamado pela busca de conteúdo (não pela busca de pessoas). Ignora termos que
-- parecem dado pessoal (e-mail, telefone, CPF) ou muito curtos/longos.
create or replace function public.log_search(p_term text)
returns void language plpgsql security definer set search_path = public as $$
declare
  t text := regexp_replace(public.search_norm(coalesce(p_term, '')), '\s+', ' ', 'g');
begin
  if length(t) < 3 or length(t) > 60 or t ~ '@' or t ~ '\d{4,}' or t ~ '^\W+$' then
    return;
  end if;
  insert into public.search_term_stats (term) values (t)
  on conflict (term, day) do update set hits = public.search_term_stats.hits + 1;
end;
$$;

-- Termos mais buscados num período (usado pela Edge Function do tema).
create or replace function public.top_search_terms(p_from date, p_to date, p_limit integer default 30)
returns table (term text, hits bigint)
language sql stable security definer set search_path = public as $$
  select term, sum(hits) from public.search_term_stats
   where day between p_from and p_to
   group by term
   order by sum(hits) desc, term
   limit p_limit;
$$;

-- ---------------------------------------------------------------------------
-- Desafios
-- ---------------------------------------------------------------------------
create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  -- null = desafio da plataforma (conteúdo inicial); os novos nascem em comunidades.
  community_id uuid references public.communities (id) on delete cascade,
  created_by uuid references public.professionals (user_id) on delete set null,
  title text not null,
  description text not null,
  category text not null,
  badge_icon text not null default '🏅',
  badge_label text not null,
  duration text not null,
  steps text[] not null check (array_length(steps, 1) between 1 and 30),
  tips text[] not null default '{}',
  theme_id uuid references public.weekly_themes (id) on delete set null,
  position integer not null default 0,
  required_challenge_id uuid references public.challenges (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger challenges_updated_at before update on public.challenges
  for each row execute function public.set_updated_at();
create index challenges_community_idx on public.challenges (community_id, position);
create index challenges_search_idx on public.challenges
  using gin (public.search_norm(title || ' ' || description) extensions.gin_trgm_ops);

create table public.challenge_participants (
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  completed_steps integer[] not null default '{}',
  completed_at timestamptz,
  primary key (challenge_id, user_id)
);
create index challenge_participants_user_idx on public.challenge_participants (user_id);

create table public.challenge_tips (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index challenge_tips_challenge_idx on public.challenge_tips (challenge_id, created_at);

-- Conclusão: quando todos os passos foram marcados.
create or replace function public.update_challenge_completion()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  total integer;
begin
  select array_length(steps, 1) into total from public.challenges where id = new.challenge_id;
  new.completed_steps := array(select distinct unnest(new.completed_steps) order by 1);
  if total is not null and cardinality(new.completed_steps) >= total then
    new.completed_at := coalesce(new.completed_at, now());
  else
    new.completed_at := null;
  end if;
  return new;
end;
$$;
create trigger challenge_participants_completion
  before insert or update of completed_steps on public.challenge_participants
  for each row execute function public.update_challenge_completion();

alter table public.challenges enable row level security;
alter table public.challenge_participants enable row level security;
alter table public.challenge_tips enable row level security;

create policy "challenges: leitura" on public.challenges
  for select to authenticated using (community_id is null or public.community_is_visible(community_id));
-- Profissional admin da comunidade cria/edita; admins da plataforma criam globais.
create policy "challenges: profissional da comunidade cria" on public.challenges
  for insert to authenticated with check (
    (community_id is not null and created_by = auth.uid()
      and exists (select 1 from public.communities c where c.id = community_id and c.professional_id = auth.uid()))
    or public.is_platform_admin()
  );
create policy "challenges: autor edita" on public.challenges
  for update to authenticated
  using (created_by = auth.uid() or public.is_platform_admin())
  with check (created_by = auth.uid() or public.is_platform_admin());
create policy "challenges: autor remove" on public.challenges
  for delete to authenticated using (created_by = auth.uid() or public.is_platform_admin());

create policy "challenge_participants: leitura" on public.challenge_participants
  for select to authenticated using (true);
create policy "challenge_participants: participar" on public.challenge_participants
  for insert to authenticated with check (user_id = auth.uid());
create policy "challenge_participants: progresso" on public.challenge_participants
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "challenge_participants: sair" on public.challenge_participants
  for delete to authenticated using (user_id = auth.uid());

create policy "challenge_tips: leitura" on public.challenge_tips
  for select to authenticated using (not public.is_blocked_between(author_id, auth.uid()));
create policy "challenge_tips: dar dica" on public.challenge_tips
  for insert to authenticated with check (author_id = auth.uid());
create policy "challenge_tips: remover" on public.challenge_tips
  for delete to authenticated using (author_id = auth.uid() or public.is_platform_admin());

revoke execute on function public.activate_weekly_theme() from public, anon, authenticated;
revoke execute on function public.top_search_terms(date, date, integer) from public, anon, authenticated;
revoke execute on function public.log_search(text) from public;

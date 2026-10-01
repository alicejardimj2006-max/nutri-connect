-- =============================================================================
-- Trilhas de aprendizado: perfis (adulto + infantis), progresso, XP diário e
-- ranking semanal entre amigos. O conteúdo das lições continua no código.
-- =============================================================================

create type public.trail_profile_kind as enum ('adult', 'kid');

create table public.trail_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  kind public.trail_profile_kind not null,
  name text not null check (length(trim(name)) between 1 and 40),
  avatar text,                       -- personagem escolhido (perfis infantis)
  created_at timestamptz not null default now()
);
-- Um perfil adulto por conta.
create unique index trail_profiles_one_adult on public.trail_profiles (owner_id) where kind = 'adult';
create index trail_profiles_owner_idx on public.trail_profiles (owner_id);

-- Estado completo (formato TrailProgress do app) + colunas resumidas para consulta.
create table public.trail_progress (
  profile_id uuid primary key references public.trail_profiles (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  total_xp integer not null default 0 check (total_xp >= 0),
  streak integer not null default 0 check (streak >= 0),
  last_active_day date,
  updated_at timestamptz not null default now()
);
create trigger trail_progress_updated_at before update on public.trail_progress
  for each row execute function public.set_updated_at();

create table public.trail_xp_daily (
  profile_id uuid not null references public.trail_profiles (id) on delete cascade,
  day date not null,
  xp integer not null default 0 check (xp >= 0),
  primary key (profile_id, day)
);

create or replace function public.owns_trail_profile(p_profile uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.trail_profiles where id = p_profile and owner_id = auth.uid());
$$;

alter table public.trail_profiles enable row level security;
alter table public.trail_progress enable row level security;
alter table public.trail_xp_daily enable row level security;

create policy "trail_profiles: dono" on public.trail_profiles
  for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "trail_progress: dono" on public.trail_progress
  for all to authenticated using (public.owns_trail_profile(profile_id))
  with check (public.owns_trail_profile(profile_id));
create policy "trail_xp_daily: dono" on public.trail_xp_daily
  for all to authenticated using (public.owns_trail_profile(profile_id))
  with check (public.owns_trail_profile(profile_id));

-- Garante o perfil adulto (criado no primeiro acesso às trilhas).
create or replace function public.ensure_adult_trail_profile()
returns public.trail_profiles
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  tp public.trail_profiles;
begin
  if me is null then raise exception 'É preciso estar logado' using errcode = '42501'; end if;
  select * into tp from public.trail_profiles where owner_id = me and kind = 'adult';
  if tp.id is null then
    insert into public.trail_profiles (owner_id, kind, name)
    values (me, 'adult', (select split_part(name, ' ', 1) from public.profiles where id = me))
    returning * into tp;
    insert into public.trail_progress (profile_id) values (tp.id);
  end if;
  return tp;
end;
$$;

-- Salva o progresso e soma o XP ganho ao dia (no fuso de São Paulo).
create or replace function public.save_trail_progress(p_profile uuid, p_data jsonb, p_xp_gained integer default 0)
returns void language plpgsql security definer set search_path = public as $$
declare
  today date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  if not public.owns_trail_profile(p_profile) then
    raise exception 'Perfil de trilha não encontrado.' using errcode = '42501';
  end if;
  insert into public.trail_progress (profile_id, data, total_xp, streak, last_active_day)
  values (p_profile, p_data,
          coalesce((p_data ->> 'totalXP')::integer, 0),
          coalesce((p_data ->> 'streak')::integer, 0),
          nullif(p_data ->> 'lastActiveDay', '')::date)
  on conflict (profile_id) do update
     set data = excluded.data, total_xp = excluded.total_xp,
         streak = excluded.streak, last_active_day = excluded.last_active_day;
  if coalesce(p_xp_gained, 0) > 0 then
    insert into public.trail_xp_daily (profile_id, day, xp) values (p_profile, today, least(p_xp_gained, 1000))
    on conflict (profile_id, day) do update set xp = public.trail_xp_daily.xp + least(excluded.xp, 1000);
  end if;
end;
$$;

-- Ranking da semana (domingo a sábado) entre você e seus amigos; só perfis adultos.
create or replace function public.friends_weekly_ranking(p_week_start date default null)
returns table (
  user_id uuid, name text, username text, avatar_url text, xp integer, streak integer,
  "position" integer, is_me boolean
)
language sql stable security definer set search_path = public as $$
  with week as (
    select coalesce(p_week_start,
             (now() at time zone 'America/Sao_Paulo')::date
             - extract(dow from (now() at time zone 'America/Sao_Paulo'))::integer) as start
  ),
  people as (
    select auth.uid() as uid
    union
    select public.friend_ids(auth.uid())
  ),
  scores as (
    select pe.uid,
           coalesce(sum(x.xp), 0)::integer as xp,
           coalesce(max(tp.streak), 0)::integer as streak
      from people pe
      left join public.trail_profiles t on t.owner_id = pe.uid and t.kind = 'adult'
      left join public.trail_progress tp on tp.profile_id = t.id
      left join public.trail_xp_daily x on x.profile_id = t.id
        and x.day between (select start from week) and (select start from week) + 6
     group by pe.uid
  )
  select s.uid, p.name, p.username, p.avatar_url, s.xp, s.streak,
         (rank() over (order by s.xp desc))::integer, s.uid = auth.uid()
    from scores s
    join public.profiles p on p.id = s.uid
   order by s.xp desc, p.name;
$$;

revoke execute on function public.ensure_adult_trail_profile() from public, anon;
revoke execute on function public.save_trail_progress(uuid, jsonb, integer) from public, anon;
revoke execute on function public.friends_weekly_ranking(date) from public, anon;

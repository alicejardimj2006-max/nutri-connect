-- =============================================================================
-- NutriConnect — núcleo: perfis, verificação profissional, vínculo de cuidado,
-- agenda, pagamentos e configurações da plataforma.
-- =============================================================================

create extension if not exists btree_gist with schema extensions;

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type public.app_role as enum ('paciente', 'profissional');
create type public.verification_status as enum ('em_analise', 'aprovado', 'recusado');
create type public.link_status as enum ('pendente', 'ativo', 'recusado', 'encerrado');
create type public.link_origin as enum ('solicitacao', 'convite', 'comunidade', 'agendamento');
create type public.appointment_status as enum (
  'aguardando_pagamento', 'agendada', 'confirmada', 'realizada', 'cancelada', 'faltou'
);
create type public.appointment_modality as enum ('presencial', 'online');
create type public.payment_status as enum (
  'pendente', 'em_processamento', 'aprovado', 'recusado', 'reembolsado', 'cancelado'
);

-- ---------------------------------------------------------------------------
-- Utilitários
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Perfis
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  bio text not null default '',
  avatar_url text,
  role public.app_role not null default 'paciente',
  goal text,
  journey_goal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Dados pessoais sensíveis: só o dono, admins e profissionais com vínculo ativo.
create table public.profile_private (
  id uuid primary key references public.profiles (id) on delete cascade,
  email text,
  phone text,
  cpf text,
  birth_date date,
  sex text check (sex in ('feminino', 'masculino')),
  updated_at timestamptz not null default now()
);
create trigger profile_private_updated_at before update on public.profile_private
  for each row execute function public.set_updated_at();

create table public.platform_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.platform_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
insert into public.platform_settings (key, value) values
  ('platform_fee_percent', '10'::jsonb),
  ('payment_hold_minutes', '30'::jsonb),
  ('min_booking_notice_hours', '2'::jsonb);

-- Profissional verificado (criado/atualizado ao aprovar uma verificação).
create table public.professionals (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  profession text not null,
  council text not null,
  registration text not null,
  uf text not null,
  specialties text[] not null default '{}',
  verified_at timestamptz not null default now(),
  -- Configurações de atendimento (editáveis pelo profissional).
  headline text,
  accepting_patients boolean not null default true,
  consultation_price_cents integer not null default 0 check (consultation_price_cents >= 0),
  consultation_duration_min integer not null default 60
    check (consultation_duration_min between 15 and 240),
  offers_presential boolean not null default true,
  offers_online boolean not null default true,
  address text,
  online_instructions text,
  timezone text not null default 'America/Sao_Paulo',
  -- Mercado Pago (tokens ficam em professional_mp_accounts, fora do alcance do cliente).
  mp_connected boolean not null default false,
  updated_at timestamptz not null default now()
);
create trigger professionals_updated_at before update on public.professionals
  for each row execute function public.set_updated_at();

-- Tokens OAuth do Mercado Pago: RLS ativo e nenhuma policy → só service_role.
create table public.professional_mp_accounts (
  professional_id uuid primary key references public.professionals (user_id) on delete cascade,
  mp_user_id text not null,
  access_token text not null,
  refresh_token text,
  public_key text,
  live_mode boolean not null default false,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  full_name text not null,
  profession text not null,
  council text not null,
  registration text not null,
  uf text not null,
  specialties text[] not null default '{}',
  bio text,
  public_lookup_url text,
  document_path text not null,
  selfie_path text not null,
  status public.verification_status not null default 'em_analise',
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id),
  rejection_reason text
);
create index verification_requests_user_idx on public.verification_requests (user_id);
create unique index verification_requests_one_open
  on public.verification_requests (user_id) where status = 'em_analise';

-- ---------------------------------------------------------------------------
-- Vínculo paciente ↔ profissional
-- ---------------------------------------------------------------------------
create table public.care_links (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  professional_id uuid not null references public.professionals (user_id) on delete cascade,
  status public.link_status not null default 'pendente',
  origin public.link_origin not null default 'solicitacao',
  -- Comunidades ainda vivem no cliente; guardamos o slug como referência.
  community_slug text,
  message text,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  ended_at timestamptz,
  ended_by uuid references public.profiles (id),
  check (patient_id <> professional_id)
);
create unique index care_links_one_open
  on public.care_links (patient_id, professional_id) where status in ('pendente', 'ativo');
create index care_links_professional_idx on public.care_links (professional_id, status);
create index care_links_patient_idx on public.care_links (patient_id, status);

create table public.care_invites (
  code text primary key default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  professional_id uuid not null references public.professionals (user_id) on delete cascade,
  invitee_name text,
  invitee_email text,
  note text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days',
  used_by uuid references public.profiles (id),
  used_at timestamptz,
  revoked_at timestamptz
);
create index care_invites_professional_idx on public.care_invites (professional_id);

-- ---------------------------------------------------------------------------
-- Funções de autorização (security definer evita recursão de RLS)
-- ---------------------------------------------------------------------------
create or replace function public.is_platform_admin(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.platform_admins where user_id = uid);
$$;

create or replace function public.is_verified_professional(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.professionals where user_id = uid);
$$;

create or replace function public.has_active_link(p_patient uuid, p_professional uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.care_links
    where patient_id = p_patient and professional_id = p_professional and status = 'ativo'
  );
$$;

-- Qualquer vínculo (inclusive encerrado): o profissional mantém leitura do que registrou.
create or replace function public.ever_linked(p_patient uuid, p_professional uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.care_links
    where patient_id = p_patient and professional_id = p_professional
      and status in ('ativo', 'encerrado')
  );
$$;

create or replace function public.setting_int(p_key text, p_default integer)
returns integer language sql stable security definer set search_path = public as $$
  select coalesce((select (value #>> '{}')::integer from public.platform_settings where key = p_key), p_default);
$$;

-- ---------------------------------------------------------------------------
-- Novo usuário → perfil + dados privados (metadata vinda do signUp)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, name, goal, journey_goal)
  values (
    new.id,
    coalesce(nullif(meta ->> 'name', ''), split_part(new.email, '@', 1)),
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
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Agenda
-- ---------------------------------------------------------------------------
create table public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (user_id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6), -- 0 = domingo
  start_time time not null,
  end_time time not null,
  modality text not null default 'ambos' check (modality in ('presencial', 'online', 'ambos')),
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);
create index availability_rules_pro_idx on public.availability_rules (professional_id, weekday);

-- Bloqueios pontuais (férias, feriados, compromissos).
create table public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (user_id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index availability_blocks_pro_idx on public.availability_blocks (professional_id, starts_at);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (user_id) on delete cascade,
  patient_id uuid not null references public.profiles (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  modality public.appointment_modality not null,
  status public.appointment_status not null default 'agendada',
  location text,
  meeting_url text,
  price_cents integer not null default 0 check (price_cents >= 0),
  hold_expires_at timestamptz,
  patient_notes text,
  -- Resumo/orientações que o paciente vê após a consulta (notas clínicas ficam em clinical_notes).
  summary_for_patient text,
  cancel_reason text,
  cancelled_by uuid references public.profiles (id),
  cancelled_at timestamptz,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (patient_id <> professional_id),
  constraint appointments_no_overlap exclude using gist (
    professional_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status in ('aguardando_pagamento', 'agendada', 'confirmada', 'realizada'))
);
create trigger appointments_updated_at before update on public.appointments
  for each row execute function public.set_updated_at();
create index appointments_pro_idx on public.appointments (professional_id, starts_at);
create index appointments_patient_idx on public.appointments (patient_id, starts_at);

-- ---------------------------------------------------------------------------
-- Pagamentos
-- ---------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  patient_id uuid not null references public.profiles (id) on delete cascade,
  professional_id uuid not null references public.professionals (user_id) on delete cascade,
  amount_cents integer not null check (amount_cents >= 0),
  platform_fee_cents integer not null default 0 check (platform_fee_cents >= 0),
  status public.payment_status not null default 'pendente',
  -- 'mercado_pago' ou pagamento registrado manualmente pelo profissional.
  provider text not null default 'mercado_pago' check (provider in ('mercado_pago', 'manual')),
  method text, -- pix, credit_card, dinheiro, ...
  mp_preference_id text,
  mp_payment_id text unique,
  checkout_url text,
  paid_at timestamptz,
  refunded_at timestamptz,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger payments_updated_at before update on public.payments
  for each row execute function public.set_updated_at();
create index payments_appointment_idx on public.payments (appointment_id);
create index payments_pro_idx on public.payments (professional_id, created_at);
create index payments_patient_idx on public.payments (patient_id, created_at);

-- ---------------------------------------------------------------------------
-- RLS — perfis e verificação
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.profile_private enable row level security;
alter table public.platform_admins enable row level security;
alter table public.platform_settings enable row level security;
alter table public.professionals enable row level security;
alter table public.professional_mp_accounts enable row level security;
alter table public.verification_requests enable row level security;
alter table public.care_links enable row level security;
alter table public.care_invites enable row level security;
alter table public.availability_rules enable row level security;
alter table public.availability_blocks enable row level security;
alter table public.appointments enable row level security;
alter table public.payments enable row level security;

-- Perfis públicos (nome, bio, avatar, papel) visíveis a todos.
create policy "profiles: leitura pública" on public.profiles
  for select to anon, authenticated using (true);
create policy "profiles: dono atualiza" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
-- Papel só muda pela aprovação da verificação.
revoke update on public.profiles from authenticated, anon;
grant update (name, bio, avatar_url, goal, journey_goal) on public.profiles to authenticated;

create policy "profile_private: dono, admin ou profissional vinculado" on public.profile_private
  for select to authenticated using (
    id = auth.uid() or public.is_platform_admin() or public.has_active_link(id)
  );
create policy "profile_private: dono atualiza" on public.profile_private
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profile_private from authenticated, anon;
grant update (phone, cpf, birth_date, sex) on public.profile_private to authenticated;

create policy "platform_admins: próprio registro" on public.platform_admins
  for select to authenticated using (user_id = auth.uid());

create policy "platform_settings: leitura" on public.platform_settings
  for select to anon, authenticated using (true);
create policy "platform_settings: admin altera" on public.platform_settings
  for update to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy "professionals: leitura pública" on public.professionals
  for select to anon, authenticated using (true);
create policy "professionals: dono atualiza atendimento" on public.professionals
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke update on public.professionals from authenticated, anon;
grant update (
  headline, accepting_patients, consultation_price_cents, consultation_duration_min,
  offers_presential, offers_online, address, online_instructions, timezone, specialties
) on public.professionals to authenticated;

create policy "verification: dono ou admin lê" on public.verification_requests
  for select to authenticated using (user_id = auth.uid() or public.is_platform_admin());
create policy "verification: dono envia" on public.verification_requests
  for insert to authenticated with check (user_id = auth.uid() and status = 'em_analise');

-- Aprovação/recusa de verificação (admin).
create or replace function public.review_verification(p_request uuid, p_approve boolean, p_reason text default null)
returns public.verification_requests
language plpgsql security definer set search_path = public as $$
declare
  req public.verification_requests;
begin
  if not public.is_platform_admin() then
    raise exception 'Apenas administradores podem revisar verificações' using errcode = '42501';
  end if;

  update public.verification_requests
     set status = case when p_approve then 'aprovado'::public.verification_status else 'recusado' end,
         reviewed_at = now(),
         reviewed_by = auth.uid(),
         rejection_reason = case when p_approve then null else p_reason end
   where id = p_request and status = 'em_analise'
  returning * into req;

  if req.id is null then
    raise exception 'Pedido não encontrado ou já revisado';
  end if;

  if p_approve then
    insert into public.professionals (user_id, profession, council, registration, uf, specialties, verified_at)
    values (req.user_id, req.profession, req.council, req.registration, req.uf, req.specialties, now())
    on conflict (user_id) do update
      set profession = excluded.profession, council = excluded.council,
          registration = excluded.registration, uf = excluded.uf,
          specialties = excluded.specialties, verified_at = excluded.verified_at;
    update public.profiles
       set role = 'profissional',
           bio = case when coalesce(bio, '') = '' then coalesce(req.bio, '') else bio end
     where id = req.user_id;
  end if;

  return req;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS — vínculos e convites
-- ---------------------------------------------------------------------------
create policy "care_links: participantes leem" on public.care_links
  for select to authenticated using (patient_id = auth.uid() or professional_id = auth.uid());
-- Paciente solicita acompanhamento (vínculo nasce pendente).
create policy "care_links: paciente solicita" on public.care_links
  for insert to authenticated with check (
    patient_id = auth.uid() and status = 'pendente'
    and origin in ('solicitacao', 'comunidade')
    and public.is_verified_professional(professional_id)
  );

create policy "care_invites: profissional gerencia" on public.care_invites
  for all to authenticated
  using (professional_id = auth.uid())
  with check (professional_id = auth.uid() and public.is_verified_professional());

-- Profissional aceita/recusa; qualquer lado encerra.
create or replace function public.respond_care_link(p_link uuid, p_accept boolean)
returns public.care_links
language plpgsql security definer set search_path = public as $$
declare
  l public.care_links;
begin
  update public.care_links
     set status = case when p_accept then 'ativo'::public.link_status else 'recusado' end,
         responded_at = now()
   where id = p_link and professional_id = auth.uid() and status = 'pendente'
  returning * into l;
  if l.id is null then
    raise exception 'Solicitação não encontrada';
  end if;
  return l;
end;
$$;

create or replace function public.end_care_link(p_link uuid)
returns public.care_links
language plpgsql security definer set search_path = public as $$
declare
  l public.care_links;
begin
  update public.care_links
     set status = case when status = 'pendente' then 'recusado'::public.link_status else 'encerrado' end,
         ended_at = now(), ended_by = auth.uid()
   where id = p_link and status in ('pendente', 'ativo')
     and (patient_id = auth.uid() or professional_id = auth.uid())
  returning * into l;
  if l.id is null then
    raise exception 'Vínculo não encontrado';
  end if;
  return l;
end;
$$;

-- Dados públicos de um convite (para a tela de aceite, antes de logar ou aceitar).
create or replace function public.get_care_invite(p_code text)
returns table (code text, professional_id uuid, professional_name text, invitee_name text, valid boolean)
language sql stable security definer set search_path = public as $$
  select i.code, i.professional_id, p.name, i.invitee_name,
         (i.used_at is null and i.revoked_at is null and i.expires_at > now()) as valid
    from public.care_invites i
    join public.profiles p on p.id = i.professional_id
   where i.code = upper(trim(p_code));
$$;

create or replace function public.accept_care_invite(p_code text)
returns public.care_links
language plpgsql security definer set search_path = public as $$
declare
  inv public.care_invites;
  l public.care_links;
begin
  if auth.uid() is null then
    raise exception 'É preciso estar logado' using errcode = '42501';
  end if;

  select * into inv from public.care_invites
   where code = upper(trim(p_code)) for update;
  if inv.code is null or inv.used_at is not null or inv.revoked_at is not null or inv.expires_at <= now() then
    raise exception 'Convite inválido ou expirado';
  end if;
  if inv.professional_id = auth.uid() then
    raise exception 'Você não pode aceitar o próprio convite';
  end if;

  update public.care_invites set used_by = auth.uid(), used_at = now() where code = inv.code;

  -- Se já havia pedido pendente, ativa; senão cria o vínculo ativo.
  update public.care_links
     set status = 'ativo', responded_at = now()
   where patient_id = auth.uid() and professional_id = inv.professional_id and status = 'pendente'
  returning * into l;

  if l.id is null then
    select * into l from public.care_links
     where patient_id = auth.uid() and professional_id = inv.professional_id and status = 'ativo';
  end if;

  if l.id is null then
    insert into public.care_links (patient_id, professional_id, status, origin, responded_at)
    values (auth.uid(), inv.professional_id, 'ativo', 'convite', now())
    returning * into l;
  end if;

  return l;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS — agenda
-- ---------------------------------------------------------------------------
create policy "availability_rules: leitura" on public.availability_rules
  for select to anon, authenticated using (true);
create policy "availability_rules: profissional gerencia" on public.availability_rules
  for all to authenticated
  using (professional_id = auth.uid()) with check (professional_id = auth.uid());

create policy "availability_blocks: profissional gerencia" on public.availability_blocks
  for all to authenticated
  using (professional_id = auth.uid()) with check (professional_id = auth.uid());

create policy "appointments: participantes leem" on public.appointments
  for select to authenticated using (patient_id = auth.uid() or professional_id = auth.uid());
-- Profissional registra consultas de pacientes vinculados (inclusive retroativas).
create policy "appointments: profissional cria" on public.appointments
  for insert to authenticated with check (
    professional_id = auth.uid() and created_by = auth.uid()
    and public.has_active_link(patient_id)
    and status <> 'aguardando_pagamento'
  );
create policy "appointments: profissional atualiza" on public.appointments
  for update to authenticated using (professional_id = auth.uid()) with check (professional_id = auth.uid());
revoke update on public.appointments from authenticated, anon;
grant update (
  starts_at, ends_at, modality, status, location, meeting_url, price_cents,
  summary_for_patient, cancel_reason, cancelled_by, cancelled_at
) on public.appointments to authenticated;

create policy "payments: participantes leem" on public.payments
  for select to authenticated using (patient_id = auth.uid() or professional_id = auth.uid());

-- Horários livres de um profissional num intervalo de datas (no fuso do profissional).
create or replace function public.get_available_slots(p_professional uuid, p_from date, p_to date)
returns table (starts_at timestamptz, ends_at timestamptz, modality text)
language sql stable security definer set search_path = public as $$
  with pro as (
    select p.timezone as tz,
           make_interval(mins => p.consultation_duration_min) as dur
      from public.professionals p
     where p.user_id = p_professional and p.accepting_patients
  ),
  days as (
    select d::date as day
      from pro, generate_series(p_from, least(p_to, p_from + 62), interval '1 day') d
  ),
  slots as (
    select (local_ts at time zone pro.tz) as s,
           ((local_ts + pro.dur) at time zone pro.tz) as e,
           r.modality
      from pro
      cross join days
      join public.availability_rules r
        on r.professional_id = p_professional and r.weekday = extract(dow from days.day)
      cross join lateral generate_series(
        days.day + r.start_time,
        days.day + r.end_time - pro.dur,
        pro.dur
      ) as local_ts
  )
  select distinct on (s.s) s.s, s.e, s.modality
    from slots s
   where s.s >= now() + make_interval(hours => public.setting_int('min_booking_notice_hours', 2))
     and not exists (
       select 1 from public.availability_blocks b
        where b.professional_id = p_professional
          and tstzrange(b.starts_at, b.ends_at) && tstzrange(s.s, s.e)
     )
     and not exists (
       select 1 from public.appointments a
        where a.professional_id = p_professional
          and tstzrange(a.starts_at, a.ends_at) && tstzrange(s.s, s.e)
          and (
            a.status in ('agendada', 'confirmada', 'realizada')
            or (a.status = 'aguardando_pagamento' and a.hold_expires_at > now())
          )
     )
   order by s.s;
$$;

-- Libera horários presos em pagamentos não concluídos.
create or replace function public.expire_payment_holds(p_professional uuid default null)
returns integer language plpgsql security definer set search_path = public as $$
declare
  n integer;
begin
  with expired as (
    update public.appointments
       set status = 'cancelada', cancel_reason = 'Pagamento não concluído a tempo', cancelled_at = now()
     where status = 'aguardando_pagamento' and hold_expires_at <= now()
       and (p_professional is null or professional_id = p_professional)
    returning id
  )
  select count(*) into n from expired;
  update public.payments set status = 'cancelado'
   where status in ('pendente', 'em_processamento')
     and appointment_id in (
       select id from public.appointments
        where status = 'cancelada' and cancel_reason = 'Pagamento não concluído a tempo'
     );
  return n;
end;
$$;

-- Paciente agenda uma consulta num horário livre.
create or replace function public.book_appointment(
  p_professional uuid,
  p_starts_at timestamptz,
  p_modality public.appointment_modality,
  p_notes text default null,
  p_community_slug text default null
)
returns public.appointments
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  pro public.professionals;
  slot record;
  appt public.appointments;
  needs_payment boolean;
begin
  if me is null then
    raise exception 'É preciso estar logado' using errcode = '42501';
  end if;
  if me = p_professional then
    raise exception 'Você não pode agendar consigo mesmo';
  end if;

  select * into pro from public.professionals where user_id = p_professional;
  if pro.user_id is null or not pro.accepting_patients then
    raise exception 'Este profissional não está recebendo agendamentos';
  end if;
  if (p_modality = 'online' and not pro.offers_online)
     or (p_modality = 'presencial' and not pro.offers_presential) then
    raise exception 'Modalidade indisponível para este profissional';
  end if;

  perform public.expire_payment_holds(p_professional);

  select * into slot
    from public.get_available_slots(
      p_professional,
      (p_starts_at at time zone pro.timezone)::date,
      (p_starts_at at time zone pro.timezone)::date
    ) s
   where s.starts_at = p_starts_at
     and s.modality in ('ambos', p_modality::text);
  if slot.starts_at is null then
    raise exception 'Horário indisponível. Escolha outro horário.';
  end if;

  needs_payment := pro.consultation_price_cents > 0 and pro.mp_connected;

  insert into public.appointments (
    professional_id, patient_id, starts_at, ends_at, modality, status,
    location, price_cents, hold_expires_at, patient_notes, created_by
  ) values (
    p_professional, me, slot.starts_at, slot.ends_at, p_modality,
    case when needs_payment then 'aguardando_pagamento'::public.appointment_status else 'agendada' end,
    case when p_modality = 'presencial' then pro.address end,
    pro.consultation_price_cents,
    case when needs_payment
      then now() + make_interval(mins => public.setting_int('payment_hold_minutes', 30)) end,
    nullif(trim(p_notes), ''),
    me
  ) returning * into appt;

  -- Agendar também abre (ou mantém) o pedido de acompanhamento.
  insert into public.care_links (patient_id, professional_id, status, origin, community_slug)
  values (me, p_professional, 'pendente',
          case when p_community_slug is not null then 'comunidade'::public.link_origin else 'agendamento' end,
          p_community_slug)
  on conflict (patient_id, professional_id) where status in ('pendente', 'ativo') do nothing;

  return appt;
end;
$$;

-- Cancelamento (paciente ou profissional). Estorno de pagamento é feito pela Edge Function.
create or replace function public.cancel_appointment(p_appointment uuid, p_reason text default null)
returns public.appointments
language plpgsql security definer set search_path = public as $$
declare
  appt public.appointments;
begin
  update public.appointments
     set status = 'cancelada', cancel_reason = nullif(trim(p_reason), ''),
         cancelled_by = auth.uid(), cancelled_at = now()
   where id = p_appointment
     and (patient_id = auth.uid() or professional_id = auth.uid())
     and status in ('aguardando_pagamento', 'agendada', 'confirmada')
  returning * into appt;
  if appt.id is null then
    raise exception 'Consulta não encontrada ou não pode mais ser cancelada';
  end if;
  update public.payments set status = 'cancelado'
   where appointment_id = appt.id and status in ('pendente', 'em_processamento');
  return appt;
end;
$$;

-- Paciente remarca para outro horário livre (mantém pagamento já feito).
create or replace function public.reschedule_appointment(p_appointment uuid, p_starts_at timestamptz)
returns public.appointments
language plpgsql security definer set search_path = public as $$
declare
  appt public.appointments;
  pro public.professionals;
  slot record;
begin
  select * into appt from public.appointments
   where id = p_appointment and (patient_id = auth.uid() or professional_id = auth.uid())
     and status in ('agendada', 'confirmada')
   for update;
  if appt.id is null then
    raise exception 'Consulta não encontrada ou não pode ser remarcada';
  end if;
  select * into pro from public.professionals where user_id = appt.professional_id;

  -- Solta o horário atual durante a checagem.
  update public.appointments set status = 'cancelada' where id = appt.id;
  select * into slot
    from public.get_available_slots(
      appt.professional_id,
      (p_starts_at at time zone pro.timezone)::date,
      (p_starts_at at time zone pro.timezone)::date
    ) s
   where s.starts_at = p_starts_at and s.modality in ('ambos', appt.modality::text);
  if slot.starts_at is null then
    raise exception 'Horário indisponível. Escolha outro horário.';
  end if;

  update public.appointments
     set starts_at = slot.starts_at, ends_at = slot.ends_at, status = 'agendada'
   where id = appt.id
  returning * into appt;
  return appt;
end;
$$;

-- Profissional confirma consulta → ativa o vínculo pendente com o paciente.
create or replace function public.activate_link_on_confirm()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status in ('confirmada', 'realizada') and old.status is distinct from new.status then
    update public.care_links
       set status = 'ativo', responded_at = now()
     where patient_id = new.patient_id and professional_id = new.professional_id
       and status = 'pendente';
  end if;
  return new;
end;
$$;
create trigger appointments_activate_link after update of status on public.appointments
  for each row execute function public.activate_link_on_confirm();

-- Pagamento registrado manualmente pelo profissional (Pix direto, dinheiro...).
create or replace function public.register_manual_payment(p_appointment uuid, p_method text, p_amount_cents integer default null)
returns public.payments
language plpgsql security definer set search_path = public as $$
declare
  appt public.appointments;
  pay public.payments;
begin
  select * into appt from public.appointments
   where id = p_appointment and professional_id = auth.uid();
  if appt.id is null then
    raise exception 'Consulta não encontrada';
  end if;
  insert into public.payments (
    appointment_id, patient_id, professional_id, amount_cents, platform_fee_cents,
    status, provider, method, paid_at
  ) values (
    appt.id, appt.patient_id, appt.professional_id,
    coalesce(p_amount_cents, appt.price_cents), 0, 'aprovado', 'manual', p_method, now()
  ) returning * into pay;
  if appt.status = 'aguardando_pagamento' then
    update public.appointments set status = 'agendada', hold_expires_at = null where id = appt.id;
  end if;
  return pay;
end;
$$;

-- ---------------------------------------------------------------------------
-- Diretório de profissionais (busca pública)
-- ---------------------------------------------------------------------------
create or replace view public.professional_directory
with (security_invoker = true) as
select p.id, p.name, p.bio, p.avatar_url,
       pr.profession, pr.council, pr.registration, pr.uf, pr.specialties, pr.headline,
       pr.accepting_patients, pr.consultation_price_cents, pr.consultation_duration_min,
       pr.offers_presential, pr.offers_online, pr.mp_connected, pr.verified_at
  from public.profiles p
  join public.professionals pr on pr.user_id = p.id;

grant select on public.professional_directory to anon, authenticated;

-- Execução das RPCs só para usuários logados (listagem de horários também para visitantes).
revoke execute on function public.review_verification(uuid, boolean, text) from public, anon;
revoke execute on function public.respond_care_link(uuid, boolean) from public, anon;
revoke execute on function public.end_care_link(uuid) from public, anon;
revoke execute on function public.accept_care_invite(text) from public, anon;
revoke execute on function public.book_appointment(uuid, timestamptz, public.appointment_modality, text, text) from public, anon;
revoke execute on function public.cancel_appointment(uuid, text) from public, anon;
revoke execute on function public.reschedule_appointment(uuid, timestamptz) from public, anon;
revoke execute on function public.register_manual_payment(uuid, text, integer) from public, anon;
revoke execute on function public.expire_payment_holds(uuid) from public, anon;

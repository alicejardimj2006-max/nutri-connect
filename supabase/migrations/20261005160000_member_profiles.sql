-- =============================================================================
-- Perfil de membros: assinatura mensal paga a um profissional, com conteúdo exclusivo e desconto
-- em consultas. Parte do valor fica com a plataforma (a taxa cai com o nível do profissional:
-- ver pro_membership_fee_percent). Só profissionais com a função "perfil_membros" liberada
-- (nível 3 ou mais) criam um plano.
--
-- A cobrança acontece no Stripe (Connect, com divisão automática). O banco guarda o plano, quem
-- assina, as faturas e o conteúdo exclusivo; as Edge Functions member-* falam com o Stripe e
-- gravam aqui pelo service_role.
-- =============================================================================

-- ─── Conta de recebimento (Stripe Connect) ───────────────────────────────────

create table public.pro_stripe_accounts (
  professional_id uuid primary key references public.professionals (user_id) on delete cascade,
  stripe_account_id text not null unique,
  charges_enabled boolean not null default false,
  payouts_enabled boolean not null default false,
  details_submitted boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.pro_stripe_accounts enable row level security;
create policy "pro_stripe_accounts: dono e admin leem" on public.pro_stripe_accounts
  for select to authenticated using (professional_id = auth.uid() or public.is_platform_admin());
-- Sem políticas de escrita: só o service_role (Edge Function member-connect).

-- ─── Plano ───────────────────────────────────────────────────────────────────

create table public.member_plans (
  professional_id uuid primary key references public.professionals (user_id) on delete cascade,
  title text not null default 'Perfil de membros' check (length(trim(title)) between 1 and 80),
  description text not null default '' check (length(description) <= 1000),
  -- Mensalidade entre R$ 10 e R$ 500.
  price_cents integer not null check (price_cents between 1000 and 50000),
  -- Desconto nas consultas do profissional para quem é membro.
  consult_discount_percent integer not null default 0 check (consult_discount_percent between 0 and 50),
  benefits text[] not null default '{}' check (cardinality(benefits) <= 8),
  active boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.member_plans enable row level security;
create policy "member_plans: leitura" on public.member_plans
  for select to authenticated using (active or professional_id = auth.uid() or public.is_platform_admin());
-- Escrita só por save_member_plan().

-- ─── Assinaturas e faturas ───────────────────────────────────────────────────

create table public.member_subscriptions (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (user_id) on delete cascade,
  member_id uuid not null references public.profiles (id) on delete cascade,
  status text not null check (status in ('ativa', 'inadimplente', 'cancelando', 'cancelada')),
  price_cents integer not null check (price_cents > 0),
  stripe_subscription_id text unique,
  stripe_customer_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  canceled_at timestamptz,
  check (professional_id <> member_id)
);
-- Uma assinatura em andamento por par profissional/membro.
create unique index member_subscriptions_live_idx on public.member_subscriptions (professional_id, member_id)
  where status in ('ativa', 'inadimplente', 'cancelando');
create index member_subscriptions_member_idx on public.member_subscriptions (member_id);
alter table public.member_subscriptions enable row level security;
create policy "member_subscriptions: partes e admin leem" on public.member_subscriptions
  for select to authenticated
  using (member_id = auth.uid() or professional_id = auth.uid() or public.is_platform_admin());

create table public.member_invoices (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.member_subscriptions (id) on delete cascade,
  professional_id uuid not null,
  member_id uuid not null,
  stripe_invoice_id text not null unique,
  amount_cents integer not null,
  platform_fee_cents integer not null,
  fee_percent integer not null,
  paid_at timestamptz not null default now()
);
create index member_invoices_pro_idx on public.member_invoices (professional_id, paid_at desc);
alter table public.member_invoices enable row level security;
create policy "member_invoices: partes e admin leem" on public.member_invoices
  for select to authenticated
  using (member_id = auth.uid() or professional_id = auth.uid() or public.is_platform_admin());

-- Membro de verdade: assinatura em dia, ou cancelada mas ainda dentro do período já pago.
create or replace function public.is_member(p_pro uuid, p_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.member_subscriptions s
     where s.professional_id = p_pro and s.member_id = p_user
       and s.status in ('ativa', 'cancelando')
       and (s.current_period_end is null or s.current_period_end > now())
  );
$$;

-- ─── Conteúdo exclusivo ──────────────────────────────────────────────────────

create table public.member_content (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (user_id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 120),
  body text not null check (length(trim(body)) between 1 and 8000),
  image_url text,
  created_at timestamptz not null default now()
);
create index member_content_pro_idx on public.member_content (professional_id, created_at desc);
alter table public.member_content enable row level security;
create policy "member_content: dono, membros e admin leem" on public.member_content
  for select to authenticated
  using (professional_id = auth.uid() or public.is_member(professional_id) or public.is_platform_admin());
create policy "member_content: dono apaga" on public.member_content
  for delete to authenticated using (professional_id = auth.uid());
-- Publicar só por publish_member_content() (exige o nível).

-- ─── Funções para o app ──────────────────────────────────────────────────────

create or replace function public.save_member_plan(
  p_title text, p_description text, p_price_cents integer,
  p_discount integer, p_benefits text[], p_active boolean
)
returns void language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
begin
  if me is null or not public.pro_has_feature(me, 'perfil_membros') then
    raise exception 'O perfil de membros é liberado a partir do nível Destaque.' using errcode = '42501';
  end if;
  if p_active and not coalesce((select charges_enabled from public.pro_stripe_accounts where professional_id = me), false) then
    raise exception 'Conecte sua conta de recebimento antes de ativar o perfil de membros.';
  end if;
  insert into public.member_plans (professional_id, title, description, price_cents, consult_discount_percent, benefits, active)
  values (me, coalesce(nullif(trim(p_title), ''), 'Perfil de membros'), coalesce(p_description, ''), p_price_cents,
          coalesce(p_discount, 0), coalesce(p_benefits, '{}'), coalesce(p_active, false))
  on conflict (professional_id) do update
    set title = excluded.title, description = excluded.description, price_cents = excluded.price_cents,
        consult_discount_percent = excluded.consult_discount_percent, benefits = excluded.benefits,
        active = excluded.active, updated_at = now();
end;
$$;

-- Plano de um profissional: só aparece se estiver ativo e o profissional ainda tiver a função liberada.
create or replace function public.get_member_plan(p_pro uuid)
returns table (
  professional_id uuid, title text, description text, price_cents integer,
  consult_discount_percent integer, benefits text[], active boolean,
  content_count integer, is_member boolean, fee_percent integer, charges_enabled boolean
)
language sql stable security definer set search_path = public as $$
  select m.professional_id, m.title, m.description, m.price_cents, m.consult_discount_percent, m.benefits,
         m.active and public.pro_has_feature(m.professional_id, 'perfil_membros'),
         (select count(*)::integer from public.member_content c where c.professional_id = m.professional_id),
         public.is_member(m.professional_id),
         case when m.professional_id = auth.uid() or public.is_platform_admin()
              then public.pro_membership_fee_percent(m.professional_id) end,
         case when m.professional_id = auth.uid() or public.is_platform_admin()
              then coalesce((select a.charges_enabled from public.pro_stripe_accounts a where a.professional_id = m.professional_id), false) end
    from public.member_plans m
   where m.professional_id = p_pro
     and auth.uid() is not null
     and ((m.active and public.pro_has_feature(m.professional_id, 'perfil_membros'))
          or m.professional_id = auth.uid() or public.is_platform_admin())
     and not public.is_blocked_between(m.professional_id, auth.uid());
$$;

create or replace function public.publish_member_content(p_title text, p_body text, p_image_url text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  new_id uuid;
begin
  if me is null or not public.pro_has_feature(me, 'conteudo_exclusivo') then
    raise exception 'O conteúdo exclusivo é liberado a partir do nível Destaque.' using errcode = '42501';
  end if;
  insert into public.member_content (professional_id, title, body, image_url)
  values (me, trim(p_title), trim(p_body), nullif(trim(p_image_url), ''))
  returning id into new_id;
  return new_id;
end;
$$;

-- Assinaturas da própria pessoa (como membro).
create or replace function public.my_member_subscriptions()
returns table (
  id uuid, professional_id uuid, professional_name text, status text, price_cents integer,
  current_period_end timestamptz, created_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select s.id, s.professional_id, p.name, s.status, s.price_cents, s.current_period_end, s.created_at
    from public.member_subscriptions s
    join public.profiles p on p.id = s.professional_id
   where s.member_id = auth.uid()
   order by s.created_at desc;
$$;

-- Quem assina o profissional (nome, @ e foto, mesmo de perfil privado: a pessoa escolheu assinar).
create or replace function public.my_subscribers()
returns table (
  id uuid, member_id uuid, name text, username text, avatar_url text, status text,
  price_cents integer, current_period_end timestamptz, created_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select s.id, s.member_id, p.name, p.username, p.avatar_url, s.status, s.price_cents, s.current_period_end, s.created_at
    from public.member_subscriptions s
    join public.profiles p on p.id = s.member_id
   where s.professional_id = auth.uid() and public.is_verified_professional(auth.uid())
   order by s.created_at desc;
$$;

-- Resumo financeiro do profissional (fica com o valor menos a parte da plataforma).
create or replace function public.my_member_earnings(p_days integer default 30)
returns table (gross_cents bigint, fee_cents bigint, net_cents bigint, invoices bigint)
language sql stable security definer set search_path = public as $$
  select coalesce(sum(amount_cents), 0), coalesce(sum(platform_fee_cents), 0),
         coalesce(sum(amount_cents - platform_fee_cents), 0), count(*)
    from public.member_invoices
   where professional_id = auth.uid() and paid_at > now() - make_interval(days => least(greatest(coalesce(p_days, 30), 1), 365));
$$;

-- ─── Gravação pelo servidor (Edge Functions, service_role) ───────────────────

create or replace function public.upsert_member_subscription(
  p_pro uuid, p_member uuid, p_status text, p_price_cents integer,
  p_stripe_subscription text, p_stripe_customer text, p_period_end timestamptz
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  sid uuid;
  is_new boolean := false;
begin
  select id into sid from public.member_subscriptions where stripe_subscription_id = p_stripe_subscription;
  if sid is null then
    is_new := true;
    insert into public.member_subscriptions (professional_id, member_id, status, price_cents, stripe_subscription_id, stripe_customer_id, current_period_end)
    values (p_pro, p_member, p_status, p_price_cents, p_stripe_subscription, p_stripe_customer, p_period_end)
    returning id into sid;
  else
    update public.member_subscriptions
       set status = p_status, current_period_end = coalesce(p_period_end, current_period_end),
           canceled_at = case when p_status = 'cancelada' then coalesce(canceled_at, now()) else canceled_at end
     where id = sid;
  end if;
  if is_new and p_status = 'ativa' then
    perform public.notify(p_pro, 'membro_novo', p_member, 'subscription', sid::text);
  end if;
  return sid;
end;
$$;

create or replace function public.record_member_invoice(
  p_stripe_subscription text, p_stripe_invoice text, p_amount_cents integer, p_fee_cents integer
)
returns void language plpgsql security definer set search_path = public as $$
declare
  s public.member_subscriptions;
begin
  select * into s from public.member_subscriptions where stripe_subscription_id = p_stripe_subscription;
  if s.id is null then return; end if;
  insert into public.member_invoices (subscription_id, professional_id, member_id, stripe_invoice_id, amount_cents, platform_fee_cents, fee_percent)
  values (s.id, s.professional_id, s.member_id, p_stripe_invoice, p_amount_cents, p_fee_cents,
          case when p_amount_cents > 0 then round(p_fee_cents * 100.0 / p_amount_cents)::integer else 0 end)
  on conflict (stripe_invoice_id) do nothing;
end;
$$;

-- ─── Desconto nas consultas para membros ─────────────────────────────────────

create or replace function public.apply_member_discount()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  d integer;
begin
  if new.price_cents <= 0 or not public.is_member(new.professional_id, new.patient_id) then
    return new;
  end if;
  select consult_discount_percent into d
    from public.member_plans
   where professional_id = new.professional_id and active
     and public.pro_has_feature(new.professional_id, 'desconto_membros');
  if coalesce(d, 0) <= 0 then return new; end if;
  new.price_cents := round(new.price_cents * (100 - d) / 100.0)::integer;
  -- Consulta que ficou de graça não espera pagamento.
  if new.price_cents = 0 and new.status = 'aguardando_pagamento' then
    new.status := 'agendada';
    new.hold_expires_at := null;
  end if;
  return new;
end;
$$;
create trigger appointments_member_discount before insert on public.appointments
  for each row execute function public.apply_member_discount();

-- ─── Permissões ──────────────────────────────────────────────────────────────

revoke execute on function public.is_member(uuid, uuid) from public, anon;
revoke execute on function public.save_member_plan(text, text, integer, integer, text[], boolean) from public, anon;
revoke execute on function public.get_member_plan(uuid) from public, anon;
revoke execute on function public.publish_member_content(text, text, text) from public, anon;
revoke execute on function public.my_member_subscriptions() from public, anon;
revoke execute on function public.my_subscribers() from public, anon;
revoke execute on function public.my_member_earnings(integer) from public, anon;
revoke execute on function public.upsert_member_subscription(uuid, uuid, text, integer, text, text, timestamptz) from public, anon, authenticated;
revoke execute on function public.record_member_invoice(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.is_member(uuid, uuid) to authenticated;
grant execute on function public.save_member_plan(text, text, integer, integer, text[], boolean) to authenticated;
grant execute on function public.get_member_plan(uuid) to authenticated;
grant execute on function public.publish_member_content(text, text, text) to authenticated;
grant execute on function public.my_member_subscriptions() to authenticated;
grant execute on function public.my_subscribers() to authenticated;
grant execute on function public.my_member_earnings(integer) to authenticated;

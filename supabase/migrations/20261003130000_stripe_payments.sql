-- =============================================================================
-- Pagamentos pelo Stripe (conta da plataforma).
--   * payments.provider passa a aceitar 'stripe' (os registros antigos do Mercado Pago ficam);
--   * toda profissional pode receber consultas pagas pelo app, sem conectar conta própria:
--     mp_connected passa a significar "aceita pagamento on-line" e fica sempre verdadeiro.
-- =============================================================================

alter table public.payments drop constraint if exists payments_provider_check;
alter table public.payments
  add constraint payments_provider_check check (provider in ('stripe', 'mercado_pago', 'manual'));

comment on column public.professionals.mp_connected is
  'Aceita pagamento on-line pelo app (Stripe, conta da plataforma). Nome histórico do Mercado Pago.';

alter table public.professionals alter column mp_connected set default true;
update public.professionals set mp_connected = true where not mp_connected;

create or replace function public.force_online_payments()
returns trigger language plpgsql as $$
begin
  new.mp_connected := true;
  return new;
end;
$$;

drop trigger if exists professionals_force_online_payments on public.professionals;
create trigger professionals_force_online_payments before insert or update on public.professionals
  for each row execute function public.force_online_payments();

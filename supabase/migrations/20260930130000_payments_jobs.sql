-- Regras de pagamento e job de limpeza de reservas não pagas.

insert into public.platform_settings (key, value) values
  ('refund_min_notice_hours', '24'::jsonb)
on conflict (key) do nothing;

-- Libera a cada 5 minutos os horários reservados cujo pagamento não foi concluído.
-- pg_cron existe no Supabase hospedado e na imagem local; se faltar, a limpeza
-- continua acontecendo sob demanda (a cada novo agendamento e checkout).
do $$
begin
  create extension if not exists pg_cron;
  perform cron.unschedule(jobid) from cron.job where jobname = 'nutriconnect-expire-payment-holds';
  perform cron.schedule(
    'nutriconnect-expire-payment-holds',
    '*/5 * * * *',
    'select public.expire_payment_holds()'
  );
exception when others then
  raise notice 'pg_cron indisponível: %', sqlerrm;
end;
$$;

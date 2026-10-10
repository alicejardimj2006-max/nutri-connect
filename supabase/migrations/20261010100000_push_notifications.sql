-- Notificações push (app instalável): aparelhos inscritos, preferências de push, lembretes e a fila
-- dos avisos do site. A Edge Function push-send (chamada pelo pg_cron a cada minuto) pede a
-- public.push_claim() o que está na hora de enviar e entrega aos aparelhos de cada pessoa.

-- ---------------------------------------------------------------------------
-- Aparelhos inscritos (um por navegador/app instalado)
-- ---------------------------------------------------------------------------
create table public.push_subscriptions (
  endpoint text primary key check (endpoint ~ '^https://' and length(endpoint) <= 1000),
  user_id uuid not null references public.profiles (id) on delete cascade,
  p256dh text not null check (length(p256dh) <= 200),
  auth text not null check (length(auth) <= 100),
  user_agent text check (length(user_agent) <= 300),
  created_at timestamptz not null default now(),
  last_success_at timestamptz,
  failures integer not null default 0
);
create index push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;
create policy "push_subscriptions: dono lê" on public.push_subscriptions
  for select to authenticated using (user_id = auth.uid());
create policy "push_subscriptions: dono apaga" on public.push_subscriptions
  for delete to authenticated using (user_id = auth.uid());
-- A inscrição passa por push_subscribe(): o mesmo aparelho pode trocar de conta.

-- ---------------------------------------------------------------------------
-- Preferências de push (o que chega no celular)
-- ---------------------------------------------------------------------------
create table public.push_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  -- Minutos de antecedência do aviso de consulta (0 = sem aviso).
  appointment_lead_min integer not null default 60 check (appointment_lead_min between 0 and 1440),
  -- { "social": false, ... }: categoria em false não vira push (o aviso continua no site).
  categories jsonb not null default '{}'::jsonb check (pg_column_size(categories) < 2000),
  -- Horário de silêncio (horas cheias, no fuso da pessoa). Nulo = sem silêncio.
  quiet_from smallint check (quiet_from between 0 and 23),
  quiet_to smallint check (quiet_to between 0 and 23),
  -- Desligado, o push não mostra o conteúdo (só "Você tem um novo aviso").
  show_preview boolean not null default true,
  timezone text not null default 'America/Sao_Paulo',
  updated_at timestamptz not null default now()
);

create or replace function public.push_settings_check()
returns trigger language plpgsql set search_path = public as $$
begin
  if not exists (select 1 from pg_timezone_names where name = new.timezone) then
    raise exception 'Fuso horário inválido.';
  end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger push_settings_check before insert or update on public.push_settings
  for each row execute function public.push_settings_check();

alter table public.push_settings enable row level security;
create policy "push_settings: dono lê" on public.push_settings
  for select to authenticated using (user_id = auth.uid());
create policy "push_settings: dono cria" on public.push_settings
  for insert to authenticated with check (user_id = auth.uid());
create policy "push_settings: dono altera" on public.push_settings
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Lembretes agendados pela pessoa (refeições, desafio do dia, água, personalizados)
-- ---------------------------------------------------------------------------
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('refeicao', 'desafio', 'agua', 'personalizado')),
  title text not null check (length(title) between 1 and 80),
  body text check (length(body) <= 200),
  time_of_day time not null,
  -- Dias da semana (0 = domingo … 6 = sábado).
  days smallint[] not null default '{0,1,2,3,4,5,6}'
    check (days <@ '{0,1,2,3,4,5,6}'::smallint[] and cardinality(days) between 1 and 7),
  active boolean not null default true,
  -- Página aberta ao tocar no aviso.
  url text check (url ~ '^/[A-Za-z0-9/_?=&.-]*$' and length(url) <= 200),
  last_sent_on date,
  created_at timestamptz not null default now()
);
create index reminders_user_idx on public.reminders (user_id);
create index reminders_active_idx on public.reminders (time_of_day) where active;

create or replace function public.reminders_limit()
returns trigger language plpgsql set search_path = public as $$
begin
  if (select count(*) from public.reminders where user_id = new.user_id) >= 40 then
    raise exception 'Limite de 40 lembretes.';
  end if;
  return new;
end;
$$;
create trigger reminders_limit before insert on public.reminders
  for each row execute function public.reminders_limit();

alter table public.reminders enable row level security;
create policy "reminders: dono lê" on public.reminders
  for select to authenticated using (user_id = auth.uid());
create policy "reminders: dono cria" on public.reminders
  for insert to authenticated with check (user_id = auth.uid());
create policy "reminders: dono altera" on public.reminders
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "reminders: dono apaga" on public.reminders
  for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Fila dos avisos do site que viram push, e registro dos avisos de consulta já enviados
-- (só a Edge Function, com a chave de serviço, mexe nestas tabelas)
-- ---------------------------------------------------------------------------
create table public.push_queue (
  id bigserial primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  notification_id uuid not null references public.notifications (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.push_queue enable row level security;

create table public.push_appointment_log (
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  sent_at timestamptz not null default now(),
  primary key (appointment_id, user_id)
);
alter table public.push_appointment_log enable row level security;

-- Todo aviso novo do site entra na fila se a pessoa tem aparelho inscrito e não desligou o push
-- da categoria. Conquistas acontecem com o site aberto (já têm aviso no próprio navegador).
create or replace function public.trg_notification_push()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  cat text := public.notification_category(new.type);
begin
  if new.type = 'conquista' then return new; end if;
  if not exists (select 1 from public.push_subscriptions where user_id = new.user_id) then
    return new;
  end if;
  if coalesce(
       (select (categories ->> cat)::boolean from public.push_settings where user_id = new.user_id),
       true
     ) = false then
    return new;
  end if;
  insert into public.push_queue (user_id, notification_id) values (new.user_id, new.id);
  return new;
end;
$$;
create trigger notification_push after insert on public.notifications
  for each row execute function public.trg_notification_push();

-- ---------------------------------------------------------------------------
-- Funções chamadas pelo app
-- ---------------------------------------------------------------------------
create or replace function public.push_subscribe(
  p_endpoint text, p_p256dh text, p_auth text, p_user_agent text default null
)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'É preciso estar logado.' using errcode = '42501';
  end if;
  insert into public.push_subscriptions (endpoint, user_id, p256dh, auth, user_agent)
  values (p_endpoint, auth.uid(), p_p256dh, p_auth, left(p_user_agent, 300))
  on conflict (endpoint) do update
    set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth,
        user_agent = excluded.user_agent, failures = 0;
  insert into public.push_settings (user_id) values (auth.uid()) on conflict do nothing;
end;
$$;

create or replace function public.push_unsubscribe(p_endpoint text)
returns void language sql security definer set search_path = public as $$
  delete from public.push_subscriptions where endpoint = p_endpoint and user_id = auth.uid();
$$;

revoke execute on function public.push_subscribe(text, text, text, text) from public, anon;
revoke execute on function public.push_unsubscribe(text) from public, anon;
grant execute on function public.push_subscribe(text, text, text, text) to authenticated;
grant execute on function public.push_unsubscribe(text) to authenticated;

-- ---------------------------------------------------------------------------
-- O que está na hora de enviar (só a Edge Function push-send chama)
-- ---------------------------------------------------------------------------
create or replace function public.push_in_quiet(p_from smallint, p_to smallint, p_hour integer)
returns boolean language sql immutable as $$
  select case
    when p_from is null or p_to is null or p_from = p_to then false
    when p_from < p_to then p_hour >= p_from and p_hour < p_to
    else p_hour >= p_from or p_hour < p_to
  end;
$$;

create or replace function public.push_claim()
returns table (user_id uuid, kind text, payload jsonb)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  r record;
  local_ts timestamp;
  minutes integer;
begin
  -- 1) Lembretes na hora (janela de 20 min para não perder nenhum se uma rodada atrasar).
  for r in
    select rm.id, rm.user_id as uid, rm.kind as rkind, rm.title, rm.body, rm.url, rm.days,
           rm.time_of_day, rm.last_sent_on,
           coalesce(ps.timezone, 'America/Sao_Paulo') as tz, ps.quiet_from, ps.quiet_to,
           coalesce(ps.show_preview, true) as preview,
           coalesce(us.locale, 'pt-BR') as locale
      from public.reminders rm
      left join public.push_settings ps on ps.user_id = rm.user_id
      left join public.user_settings us on us.id = rm.user_id
     where rm.active
       and exists (select 1 from public.push_subscriptions s where s.user_id = rm.user_id)
     for update of rm skip locked
  loop
    local_ts := now() at time zone r.tz;
    if extract(dow from local_ts)::smallint = any (r.days)
       and r.time_of_day <= local_ts::time
       and r.time_of_day > (local_ts - interval '20 minutes')::time
       and r.last_sent_on is distinct from local_ts::date then
      update public.reminders set last_sent_on = local_ts::date where id = r.id;
      if not public.push_in_quiet(r.quiet_from, r.quiet_to, extract(hour from local_ts)::integer) then
        user_id := r.uid;
        kind := 'lembrete';
        payload := jsonb_build_object(
          'kind', r.rkind, 'title', r.title, 'body', r.body,
          'url', coalesce(r.url, case r.rkind
                                   when 'refeicao' then '/acompanhamento/plano'
                                   when 'desafio' then '/desafios'
                                   when 'agua' then '/acompanhamento'
                                   else '/espaco' end),
          'tag', 'lembrete-' || r.id, 'preview', r.preview, 'locale', r.locale);
        return next;
      end if;
    end if;
  end loop;

  -- 2) Consultas que começam dentro da antecedência escolhida (paciente e profissional).
  --    O aviso de consulta ignora o horário de silêncio: é um compromisso marcado.
  for r in
    select a.id as appt, a.starts_at, u.uid, other.name as other_name,
           coalesce(ps.show_preview, true) as preview, coalesce(us.locale, 'pt-BR') as locale
      from public.appointments a
      cross join lateral (values (a.patient_id, a.professional_id), (a.professional_id, a.patient_id))
        as u (uid, other_id)
      left join public.push_settings ps on ps.user_id = u.uid
      left join public.user_settings us on us.id = u.uid
      left join public.profiles other on other.id = u.other_id
     where a.status in ('agendada', 'confirmada')
       and a.starts_at > now()
       and a.starts_at <= now() + interval '1441 minutes'
       and coalesce(ps.appointment_lead_min, 60) > 0
       and a.starts_at <= now() + make_interval(mins => coalesce(ps.appointment_lead_min, 60))
       and not exists (
         select 1 from public.push_appointment_log l where l.appointment_id = a.id and l.user_id = u.uid)
       and exists (select 1 from public.push_subscriptions s where s.user_id = u.uid)
  loop
    insert into public.push_appointment_log (appointment_id, user_id) values (r.appt, r.uid)
    on conflict do nothing;
    minutes := greatest(1, ceil(extract(epoch from (r.starts_at - now())) / 60)::integer);
    user_id := r.uid;
    kind := 'consulta';
    payload := jsonb_build_object(
      'minutes', minutes, 'starts_at', r.starts_at, 'other', r.other_name,
      'url', '/consulta/' || r.appt, 'tag', 'consulta-' || r.appt,
      'preview', r.preview, 'locale', r.locale);
    return next;
  end loop;

  -- 3) Avisos do site na fila.
  delete from public.push_queue where created_at < now() - interval '1 day';
  for r in
    select q.id as qid, n.id as nid, n.user_id as uid, n.type, n.entity_id, n.actor_id, n.data,
           p.name as actor_name,
           coalesce(ps.timezone, 'America/Sao_Paulo') as tz, ps.quiet_from, ps.quiet_to,
           coalesce(ps.show_preview, true) as preview, coalesce(us.locale, 'pt-BR') as locale,
           exists (select 1 from public.professionals pr where pr.user_id = n.user_id) as is_pro
      from public.push_queue q
      join public.notifications n on n.id = q.notification_id
      left join public.profiles p on p.id = n.actor_id
      left join public.push_settings ps on ps.user_id = q.user_id
      left join public.user_settings us on us.id = q.user_id
     order by q.id
     limit 500
     for update of q skip locked
  loop
    delete from public.push_queue where id = r.qid;
    local_ts := now() at time zone r.tz;
    continue when public.push_in_quiet(r.quiet_from, r.quiet_to, extract(hour from local_ts)::integer);
    user_id := r.uid;
    kind := 'aviso';
    payload := jsonb_build_object(
      'type', r.type, 'actor', r.actor_name, 'data', r.data,
      'url', case
        when r.type in ('reacao', 'comentario', 'conteudo_liberado') and r.entity_id is not null
          then '/explorar?post=' || r.entity_id
        when r.type in ('seguidor', 'amizade_pedido') and r.actor_id is not null
          then '/perfil/' || r.actor_id
        when r.type = 'amizade_aceita' then '/perfil/' || coalesce(r.entity_id, r.actor_id::text)
        when r.type = 'consulta_sala' and r.entity_id is not null then '/consulta/' || r.entity_id
        when r.type like 'consulta_%' then
          case when r.is_pro then '/painel/agenda' else '/acompanhamento/consultas' end
        when r.type = 'mensagem' then
          case when r.is_pro then '/painel/mensagens' else '/acompanhamento/mensagens' end
        when r.type in ('plano_publicado', 'plano_cuidado') then '/acompanhamento/plano'
        when r.type = 'avaliacao_registrada' then '/acompanhamento/evolucao'
        when r.type = 'diario_comentario' then '/acompanhamento/diario'
        when r.type = 'acompanhamento_pedido' then '/convites'
        when r.type = 'convite_aceito' then '/painel/pacientes'
        when r.type = 'acompanhamento_aceito' then '/acompanhamento'
        when r.type in ('tema_previa', 'tema_ativo') then '/tema-da-semana'
        else '/notificacoes'
      end,
      'tag', 'aviso-' || r.nid, 'preview', r.preview, 'locale', r.locale);
    return next;
  end loop;
end;
$$;
revoke execute on function public.push_claim() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Agendamento: a cada minuto o pg_cron chama a Edge Function push-send. Usa os mesmos segredos
-- do Vault do tema da semana (nutriconnect_functions_url e nutriconnect_cron_secret).
-- ---------------------------------------------------------------------------
create or replace function public.request_push_send()
returns bigint language plpgsql security definer set search_path = public as $$
declare
  fn_url text;
  secret text;
  req bigint;
begin
  -- Nada para fazer: nem chama a função.
  if not exists (select 1 from public.push_subscriptions) then
    return null;
  end if;
  begin
    select decrypted_secret into fn_url from vault.decrypted_secrets where name = 'nutriconnect_functions_url';
    select decrypted_secret into secret from vault.decrypted_secrets where name = 'nutriconnect_cron_secret';
  exception when others then
    raise notice 'Vault indisponível: %', sqlerrm;
    return null;
  end;
  if fn_url is null or secret is null then
    raise notice 'Segredos das notificações não configurados no Vault.';
    return null;
  end if;
  execute 'select net.http_post(url := $1, headers := $2, body := $3, timeout_milliseconds := 55000)'
    into req
    using fn_url || '/push-send',
          jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', secret),
          '{}'::jsonb;
  return req;
end;
$$;
revoke execute on function public.request_push_send() from public, anon, authenticated;

do $$
begin
  create extension if not exists pg_cron;
  perform cron.unschedule(jobid) from cron.job where jobname = 'nutriconnect-push-send';
  perform cron.schedule('nutriconnect-push-send', '* * * * *', 'select public.request_push_send()');
exception when others then
  raise notice 'pg_cron indisponível: %', sqlerrm;
end;
$$;

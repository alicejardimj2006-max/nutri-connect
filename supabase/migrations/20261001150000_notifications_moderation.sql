-- =============================================================================
-- Notificações (geradas por triggers), denúncias com ocultação automática,
-- mensagens de contato e agendamentos do tema da semana.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Notificações
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  actor_id uuid references public.profiles (id) on delete cascade,
  entity_type text,      -- post | comment | appointment | message | care_link | meal_plan | theme | friendship | profile
  entity_id text,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);
create index notifications_unread_idx on public.notifications (user_id) where read_at is null;

alter table public.notifications enable row level security;
create policy "notifications: dono lê" on public.notifications
  for select to authenticated using (user_id = auth.uid());
create policy "notifications: dono marca como lida" on public.notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications: dono apaga" on public.notifications
  for delete to authenticated using (user_id = auth.uid());
-- Conquistas das trilhas são registradas pelo próprio app.
create policy "notifications: conquistas" on public.notifications
  for insert to authenticated with check (user_id = auth.uid() and type = 'conquista' and actor_id is null);
revoke update on public.notifications from authenticated, anon;
grant update (read_at) on public.notifications to authenticated;

-- Categoria de cada tipo (para as preferências em user_settings.notification_prefs).
create or replace function public.notification_category(p_type text)
returns text language sql immutable as $$
  select case
    when p_type in ('reacao', 'comentario', 'amizade_pedido', 'amizade_aceita', 'seguidor') then 'social'
    when p_type in ('tema_previa', 'tema_ativo') then 'theme'
    when p_type = 'conquista' then 'achievements'
    when p_type = 'conteudo_oculto' then 'system'
    else 'clinical'
  end;
$$;

create or replace function public.notify(
  p_user uuid, p_type text, p_actor uuid, p_entity_type text, p_entity_id text,
  p_data jsonb default '{}'::jsonb
)
returns void language plpgsql security definer set search_path = public as $$
declare
  cat text := public.notification_category(p_type);
begin
  if p_user is null or p_user = p_actor then return; end if;
  if p_actor is not null and public.is_blocked_between(p_user, p_actor) then return; end if;
  if cat <> 'system' and coalesce(
       (select (notification_prefs ->> cat)::boolean from public.user_settings where id = p_user), true
     ) = false then
    return;
  end if;
  insert into public.notifications (user_id, type, actor_id, entity_type, entity_id, data)
  values (p_user, p_type, p_actor, p_entity_type, p_entity_id, coalesce(p_data, '{}'::jsonb));
end;
$$;
revoke execute on function public.notify(uuid, text, uuid, text, text, jsonb) from public, anon, authenticated;

create or replace function public.mark_all_notifications_read()
returns void language sql security definer set search_path = public as $$
  update public.notifications set read_at = now() where user_id = auth.uid() and read_at is null;
$$;

-- Social -------------------------------------------------------------------
create or replace function public.trg_notify_reaction()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  p public.posts;
begin
  select * into p from public.posts where id = new.post_id;
  perform public.notify(p.author_id, 'reacao', new.user_id, 'post', p.id::text,
    jsonb_build_object('kind', new.kind, 'title', coalesce(p.title, left(p.body, 80))));
  return new;
end;
$$;
create trigger post_reactions_notify after insert on public.post_reactions
  for each row execute function public.trg_notify_reaction();

create or replace function public.trg_notify_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  p public.posts;
begin
  select * into p from public.posts where id = new.post_id;
  perform public.notify(p.author_id, 'comentario', new.author_id, 'post', p.id::text,
    jsonb_build_object('comment', left(new.body, 120), 'title', coalesce(p.title, left(p.body, 80))));
  return new;
end;
$$;
create trigger comments_notify after insert on public.comments
  for each row execute function public.trg_notify_comment();

create or replace function public.trg_notify_friendship()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'pendente' and (tg_op = 'INSERT' or old.status is distinct from 'pendente'
                                  or old.requester_id is distinct from new.requester_id) then
    perform public.notify(new.addressee_id, 'amizade_pedido', new.requester_id, 'friendship', new.id::text);
  elsif new.status = 'aceita' and (tg_op = 'INSERT' or old.status is distinct from 'aceita') then
    perform public.notify(new.requester_id, 'amizade_aceita', new.addressee_id, 'profile', new.addressee_id::text);
  end if;
  return new;
end;
$$;
create trigger friendships_notify after insert or update on public.friendships
  for each row execute function public.trg_notify_friendship();

create or replace function public.trg_notify_follow()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify(new.followee_id, 'seguidor', new.follower_id, 'profile', new.follower_id::text);
  return new;
end;
$$;
create trigger follows_notify after insert on public.follows
  for each row execute function public.trg_notify_follow();

-- Clínico ------------------------------------------------------------------
create or replace function public.trg_notify_appointment()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  other uuid;
  info jsonb := jsonb_build_object('starts_at', new.starts_at, 'modality', new.modality);
begin
  if tg_op = 'INSERT' then
    if new.status = 'aguardando_pagamento' then return new; end if;
    other := case when new.created_by = new.patient_id then new.professional_id else new.patient_id end;
    perform public.notify(other, 'consulta_agendada', new.created_by, 'appointment', new.id::text, info);
    return new;
  end if;

  if old.status = 'aguardando_pagamento' and new.status = 'agendada' then
    perform public.notify(new.professional_id, 'consulta_agendada', new.patient_id, 'appointment', new.id::text, info);
  elsif new.status = 'confirmada' and old.status is distinct from 'confirmada' then
    perform public.notify(new.patient_id, 'consulta_confirmada', new.professional_id, 'appointment', new.id::text, info);
  elsif new.status = 'cancelada' and old.status is distinct from 'cancelada' and new.cancelled_by is not null then
    other := case when new.cancelled_by = new.patient_id then new.professional_id else new.patient_id end;
    perform public.notify(other, 'consulta_cancelada', new.cancelled_by, 'appointment', new.id::text,
      info || jsonb_build_object('reason', new.cancel_reason));
  elsif new.starts_at is distinct from old.starts_at and new.status in ('agendada', 'confirmada') then
    perform public.notify(new.professional_id, 'consulta_remarcada', new.patient_id, 'appointment', new.id::text, info);
    perform public.notify(new.patient_id, 'consulta_remarcada', new.professional_id, 'appointment', new.id::text, info);
  end if;
  return new;
end;
$$;
create trigger appointments_notify after insert or update on public.appointments
  for each row execute function public.trg_notify_appointment();

-- Mensagens: várias seguidas do mesmo remetente viram um único aviso não lido.
create or replace function public.trg_notify_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  recipient uuid := case when new.sender_id = new.patient_id then new.professional_id else new.patient_id end;
  existing uuid;
begin
  select id into existing from public.notifications
   where user_id = recipient and type = 'mensagem' and actor_id = new.sender_id and read_at is null
   limit 1;
  if existing is not null then
    update public.notifications
       set created_at = now(),
           data = jsonb_build_object('preview', left(new.body, 120),
                                     'count', coalesce((data ->> 'count')::integer, 1) + 1)
     where id = existing;
  else
    perform public.notify(recipient, 'mensagem', new.sender_id, 'message', new.patient_id::text || ':' || new.professional_id::text,
      jsonb_build_object('preview', left(new.body, 120), 'count', 1));
  end if;
  return new;
end;
$$;
create trigger messages_notify after insert on public.messages
  for each row execute function public.trg_notify_message();

create or replace function public.trg_notify_care_link()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'pendente' then
      perform public.notify(new.professional_id, 'acompanhamento_pedido', new.patient_id, 'care_link', new.id::text,
        jsonb_build_object('message', new.message));
    elsif new.status = 'ativo' then
      perform public.notify(new.professional_id, 'convite_aceito', new.patient_id, 'care_link', new.id::text);
    end if;
  elsif new.status = 'ativo' and old.status = 'pendente' then
    perform public.notify(new.patient_id, 'acompanhamento_aceito', new.professional_id, 'care_link', new.id::text);
  end if;
  return new;
end;
$$;
create trigger care_links_notify after insert or update on public.care_links
  for each row execute function public.trg_notify_care_link();

create or replace function public.trg_notify_diary_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  patient uuid;
begin
  select patient_id into patient from public.diary_entries where id = new.entry_id;
  perform public.notify(patient, 'diario_comentario', new.author_id, 'diary', new.entry_id::text,
    jsonb_build_object('comment', left(new.body, 120)));
  return new;
end;
$$;
create trigger diary_comments_notify after insert on public.diary_comments
  for each row execute function public.trg_notify_diary_comment();

create or replace function public.trg_notify_meal_plan()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'ativo' and old.status is distinct from 'ativo' then
    perform public.notify(new.patient_id, 'plano_publicado', new.professional_id, 'meal_plan', new.id::text,
      jsonb_build_object('title', new.title));
  end if;
  return new;
end;
$$;
create trigger meal_plans_notify after update on public.meal_plans
  for each row execute function public.trg_notify_meal_plan();

-- Tema da semana: a prévia avisa todos os profissionais.
create or replace function public.trg_notify_theme_preview()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'previa' and (tg_op = 'INSERT' or old.status is distinct from 'previa') then
    insert into public.notifications (user_id, type, entity_type, entity_id, data)
    select pr.user_id, 'tema_previa', 'theme', new.id::text,
           jsonb_build_object('title', new.title, 'week_start', new.week_start)
      from public.professionals pr
      left join public.user_settings s on s.id = pr.user_id
     where coalesce((s.notification_prefs ->> 'theme')::boolean, true);
  end if;
  return new;
end;
$$;
create trigger weekly_themes_notify after insert or update of status on public.weekly_themes
  for each row execute function public.trg_notify_theme_preview();

-- ---------------------------------------------------------------------------
-- Denúncias
-- ---------------------------------------------------------------------------
create type public.report_target as enum ('post', 'comment', 'user');
create type public.report_status as enum ('pendente', 'procedente', 'improcedente');

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type public.report_target not null,
  target_id uuid not null,
  reason text not null check (reason in ('spam', 'desinformacao', 'ofensivo', 'assedio', 'inadequado', 'outro')),
  details text,
  status public.report_status not null default 'pendente',
  created_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  unique (reporter_id, target_type, target_id)
);
create index reports_target_idx on public.reports (target_type, target_id, status);

alter table public.reports enable row level security;
create policy "reports: denunciar" on public.reports
  for insert to authenticated with check (reporter_id = auth.uid() and status = 'pendente');
create policy "reports: leitura" on public.reports
  for select to authenticated using (reporter_id = auth.uid() or public.is_platform_admin());

-- 3 denúncias pendentes de pessoas diferentes ocultam o post/comentário até um admin decidir.
create or replace function public.trg_report_auto_hide()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  n integer;
  author uuid;
begin
  if new.target_type = 'user' then return new; end if;
  select count(distinct reporter_id) into n from public.reports
   where target_type = new.target_type and target_id = new.target_id and status = 'pendente';
  if n < 3 then return new; end if;

  if new.target_type = 'post' then
    update public.posts set hidden = true where id = new.target_id and not hidden returning author_id into author;
  else
    update public.comments set hidden = true where id = new.target_id and not hidden returning author_id into author;
  end if;
  if author is not null then
    perform public.notify(author, 'conteudo_oculto', null, new.target_type::text, new.target_id::text);
  end if;
  return new;
end;
$$;
create trigger reports_auto_hide after insert on public.reports
  for each row execute function public.trg_report_auto_hide();

-- Admin decide: mantém oculto (procedente) ou restaura (improcedente).
create or replace function public.resolve_reports(
  p_target_type public.report_target, p_target_id uuid, p_hide boolean
)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Apenas administradores da plataforma.' using errcode = '42501';
  end if;
  if p_target_type = 'post' then
    update public.posts set hidden = p_hide where id = p_target_id;
  elsif p_target_type = 'comment' then
    update public.comments set hidden = p_hide where id = p_target_id;
  end if;
  update public.reports
     set status = case when p_hide then 'procedente'::public.report_status else 'improcedente' end,
         reviewed_by = auth.uid(), reviewed_at = now()
   where target_type = p_target_type and target_id = p_target_id and status = 'pendente';
end;
$$;

-- Fila de moderação para o /admin.
create or replace function public.moderation_queue()
returns table (
  target_type public.report_target, target_id uuid, reports integer, reasons text[],
  last_report_at timestamptz, hidden boolean, preview text, author_id uuid, author_name text
)
language sql stable security definer set search_path = public as $$
  select r.target_type, r.target_id, count(*)::integer, array_agg(distinct r.reason), max(r.created_at),
         coalesce(po.hidden, co.hidden, false),
         coalesce(left(coalesce(po.title, po.body), 160), left(co.body, 160), u.name),
         coalesce(po.author_id, co.author_id, u.id),
         coalesce(pa.name, ca.name, u.name)
    from public.reports r
    left join public.posts po on r.target_type = 'post' and po.id = r.target_id
    left join public.profiles pa on pa.id = po.author_id
    left join public.comments co on r.target_type = 'comment' and co.id = r.target_id
    left join public.profiles ca on ca.id = co.author_id
    left join public.profiles u on r.target_type = 'user' and u.id = r.target_id
   where r.status = 'pendente' and public.is_platform_admin()
   group by r.target_type, r.target_id, po.hidden, co.hidden, po.title, po.body, co.body, u.name,
            po.author_id, co.author_id, u.id, pa.name, ca.name
   order by count(*) desc, max(r.created_at) desc;
$$;

-- ---------------------------------------------------------------------------
-- Fale conosco
-- ---------------------------------------------------------------------------
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  name text not null check (length(trim(name)) between 2 and 120),
  email text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text,
  subject text not null,
  message text not null check (length(trim(message)) between 5 and 5000),
  status text not null default 'novo' check (status in ('novo', 'em_atendimento', 'resolvido')),
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
create policy "contact_messages: enviar" on public.contact_messages
  for insert to anon, authenticated with check (
    status = 'novo' and (user_id is null or user_id = auth.uid())
  );
create policy "contact_messages: admins leem" on public.contact_messages
  for select to authenticated using (public.is_platform_admin());
create policy "contact_messages: admins atualizam" on public.contact_messages
  for update to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table
  public.notifications, public.friendships, public.follows, public.weekly_themes;

-- ---------------------------------------------------------------------------
-- Agendamentos do tema da semana (pg_cron + pg_net)
--   Sábado 09:00 e 17:00 (Brasília): pede a prévia à Edge Function weekly-theme
--   Domingo 00:05 (Brasília): a prévia vira o tema ativo
-- A chamada usa dois segredos do Vault (ver docs/banco-completo.md):
--   nutriconnect_functions_url  → https://<projeto>.supabase.co/functions/v1
--   nutriconnect_cron_secret    → o mesmo valor de CRON_SECRET da Edge Function
-- ---------------------------------------------------------------------------
create or replace function public.request_weekly_theme_generation()
returns bigint language plpgsql security definer set search_path = public as $$
declare
  local_today date := (now() at time zone 'America/Sao_Paulo')::date;
  next_sunday date := local_today + (7 - extract(dow from local_today)::integer);
  fn_url text;
  secret text;
  req bigint;
begin
  if exists (select 1 from public.weekly_themes where week_start = next_sunday) then
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
    raise notice 'Segredos do tema da semana não configurados no Vault.';
    return null;
  end if;
  execute 'select net.http_post(url := $1, headers := $2, body := $3, timeout_milliseconds := 120000)'
    into req
    using fn_url || '/weekly-theme',
          jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', secret),
          jsonb_build_object('week_start', next_sunday);
  return req;
end;
$$;
revoke execute on function public.request_weekly_theme_generation() from public, anon, authenticated;

do $$
begin
  create extension if not exists pg_net;
exception when others then
  raise notice 'pg_net indisponível: %', sqlerrm;
end;
$$;

do $$
begin
  create extension if not exists pg_cron;
  perform cron.unschedule(jobid) from cron.job
   where jobname in ('nutriconnect-theme-preview', 'nutriconnect-theme-preview-retry', 'nutriconnect-theme-activate');
  -- Horários em UTC (Brasília = UTC-3).
  perform cron.schedule('nutriconnect-theme-preview', '0 12 * * 6', 'select public.request_weekly_theme_generation()');
  perform cron.schedule('nutriconnect-theme-preview-retry', '0 20 * * 6', 'select public.request_weekly_theme_generation()');
  perform cron.schedule('nutriconnect-theme-activate', '5 3 * * 0', 'select public.activate_weekly_theme()');
exception when others then
  raise notice 'pg_cron indisponível: %', sqlerrm;
end;
$$;

revoke execute on function public.resolve_reports(public.report_target, uuid, boolean) from public, anon;
revoke execute on function public.moderation_queue() from public, anon;
revoke execute on function public.mark_all_notifications_read() from public, anon;

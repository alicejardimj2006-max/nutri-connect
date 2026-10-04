-- =============================================================================
-- Console de administração: tudo que o /admin precisa, sempre restrito a administradores da
-- plataforma e com registro de auditoria.
--   * profiles.suspended_at: conta suspensa não publica nem comenta (o gatilho barra);
--   * admin_audit_log: quem fez o quê, quando (só admins leem; só as funções gravam);
--   * announcements: avisos que aparecem para todo mundo no topo do site;
--   * admin_overview / admin_search_users / admin_search_posts / admin_payments / admin_ai_stats:
--     leituras agregadas para os painéis;
--   * admin_set_suspended / admin_set_admin / admin_set_post_* / admin_set_setting /
--     admin_save_announcement: ações, todas auditadas;
--   * ai_consume passa a respeitar os limites diários definidos em platform_settings.
-- =============================================================================

alter table public.profiles add column suspended_at timestamptz;

-- ─── Auditoria ────────────────────────────────────────────────────────────────
create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles (id) on delete set null,
  admin_name text not null default '',
  action text not null,
  target_type text,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index admin_audit_log_created_idx on public.admin_audit_log (created_at desc);
alter table public.admin_audit_log enable row level security;
create policy "admin_audit_log: admins leem" on public.admin_audit_log
  for select to authenticated using (public.is_platform_admin());

create or replace function public._admin_guard()
returns void language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Apenas administradores da plataforma.' using errcode = '42501';
  end if;
end;
$$;

create or replace function public._admin_log(p_action text, p_type text, p_id text, p_details jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.admin_audit_log (admin_id, admin_name, action, target_type, target_id, details)
  values (auth.uid(), coalesce((select name from public.profiles where id = auth.uid()), ''), p_action, p_type, p_id, coalesce(p_details, '{}'::jsonb));
end;
$$;
revoke execute on function public._admin_guard() from public, anon;
revoke execute on function public._admin_log(text, text, text, jsonb) from public, anon, authenticated;

-- Registro de ações feitas direto pelo painel (temas, mensagens do Fale conosco…).
create or replace function public.admin_log(p_action text, p_type text, p_id text, p_details jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._admin_guard();
  perform public._admin_log(left(p_action, 80), left(p_type, 40), left(p_id, 80), p_details);
end;
$$;

-- ─── Avisos para todos ────────────────────────────────────────────────────────
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 120),
  body text not null default '' check (length(body) <= 600),
  level text not null default 'info' check (level in ('info', 'aviso', 'sucesso')),
  link_url text check (link_url is null or link_url ~ '^(https?://|/)'),
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.announcements enable row level security;
create policy "announcements: leitura" on public.announcements
  for select to authenticated using (
    public.is_platform_admin()
    or (active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()))
  );

create or replace function public.admin_save_announcement(
  p_id uuid, p_title text, p_body text, p_level text, p_link text,
  p_active boolean, p_starts timestamptz, p_ends timestamptz
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  rid uuid := p_id;
begin
  perform public._admin_guard();
  if rid is null then
    insert into public.announcements (title, body, level, link_url, active, starts_at, ends_at, created_by)
    values (trim(p_title), coalesce(p_body, ''), p_level, nullif(trim(coalesce(p_link, '')), ''), p_active, p_starts, p_ends, auth.uid())
    returning id into rid;
    perform public._admin_log('anuncio_criado', 'announcement', rid::text, jsonb_build_object('title', p_title));
  else
    update public.announcements
       set title = trim(p_title), body = coalesce(p_body, ''), level = p_level,
           link_url = nullif(trim(coalesce(p_link, '')), ''), active = p_active,
           starts_at = p_starts, ends_at = p_ends
     where id = rid;
    perform public._admin_log('anuncio_editado', 'announcement', rid::text, jsonb_build_object('title', p_title, 'active', p_active));
  end if;
  return rid;
end;
$$;

create or replace function public.admin_delete_announcement(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._admin_guard();
  delete from public.announcements where id = p_id;
  perform public._admin_log('anuncio_apagado', 'announcement', p_id::text);
end;
$$;

-- Avisos da moderação/administração nunca dependem das preferências de notificação.
create or replace function public.notification_category(p_type text)
returns text language sql immutable as $$
  select case
    when p_type in ('reacao', 'comentario', 'amizade_pedido', 'amizade_aceita', 'seguidor') then 'social'
    when p_type in ('tema_previa', 'tema_ativo') then 'theme'
    when p_type = 'conquista' then 'achievements'
    when p_type in ('conteudo_oculto', 'conta_suspensa', 'conta_reativada') then 'system'
    else 'clinical'
  end;
$$;

-- ─── Conta suspensa não publica nem comenta ───────────────────────────────────
create or replace function public.is_suspended(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select suspended_at is not null from public.profiles where id = uid), false);
$$;

create or replace function public.check_post_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.publish_at > now() + interval '1 minute' and not public.is_verified_professional(new.author_id) then
    raise exception 'Apenas profissionais podem agendar publicações.';
  end if;
  if tg_op = 'INSERT' then
    if public.is_suspended(new.author_id) then
      raise exception 'Sua conta está suspensa e não pode publicar. Fale com a equipe pelo Fale conosco.' using errcode = '42501';
    end if;
    new.pinned := false;
    new.hidden := false;
    new.pending_review := false;
    if new.community_id is not null and not public.is_community_member(new.community_id, new.author_id) then
      raise exception 'Entre na comunidade para publicar nela.';
    end if;
    if auth.uid() is not null and not public.is_platform_admin(new.author_id) then
      delete from public.content_approvals
       where id = (
         select a.id from public.content_approvals a
          where a.user_id = new.author_id and a.kind = 'post' and a.expires_at > now()
            and a.title is not distinct from new.title
            and a.body = new.body
            and a.image_url is not distinct from new.image_url
            and a.tags = coalesce(new.tags, '{}')
            and a.recipe is not distinct from new.recipe
          limit 1
       );
      if not found then
        raise exception 'Este conteúdo precisa ser analisado pela IA antes de ser publicado.'
          using errcode = '42501';
      end if;
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.check_comment_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_suspended(new.author_id) then
    raise exception 'Sua conta está suspensa e não pode comentar. Fale com a equipe pelo Fale conosco.' using errcode = '42501';
  end if;
  new.hidden := false;
  new.pending_review := false;
  if auth.uid() is not null and not public.is_platform_admin(new.author_id) then
    delete from public.content_approvals
     where id = (
       select a.id from public.content_approvals a
        where a.user_id = new.author_id and a.kind = 'comment' and a.expires_at > now()
          and a.post_id = new.post_id and a.body = new.body
        limit 1
     );
    if not found then
      raise exception 'Este comentário precisa ser analisado pela IA antes de ser publicado.'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

-- ─── Limites da IA definidos no painel ────────────────────────────────────────
alter table public.ai_usage drop constraint if exists ai_usage_kind_check;
alter table public.ai_usage add constraint ai_usage_kind_check
  check (kind in ('nina', 'summary', 'moderation'));

insert into public.platform_settings (key, value) values
  ('ai_limit_nina', '20'::jsonb),
  ('ai_limit_summary', '30'::jsonb),
  ('ai_limit_moderation', '120'::jsonb)
on conflict (key) do nothing;

create or replace function public.ai_consume(p_kind text, p_limit integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  today date := (now() at time zone 'America/Sao_Paulo')::date;
  used integer;
  lim integer := coalesce(
    (select (value #>> '{}')::integer from public.platform_settings where key = 'ai_limit_' || p_kind),
    p_limit
  );
begin
  if me is null then
    raise exception 'É preciso estar logado.' using errcode = '42501';
  end if;
  insert into public.ai_usage (user_id, day, kind, count) values (me, today, p_kind, 1)
  on conflict (user_id, day, kind) do update set count = public.ai_usage.count + 1
    where public.ai_usage.count < lim
  returning count into used;
  return used is not null;
end;
$$;

-- ─── Visão geral ──────────────────────────────────────────────────────────────
create or replace function public.admin_overview()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  today date := (now() at time zone 'America/Sao_Paulo')::date;
  result jsonb;
begin
  perform public._admin_guard();
  select jsonb_build_object(
    'users_total', (select count(*) from public.profiles),
    'users_7d', (select count(*) from public.profiles where created_at > now() - interval '7 days'),
    'users_30d', (select count(*) from public.profiles where created_at > now() - interval '30 days'),
    'pros', (select count(*) from public.professionals),
    'admins', (select count(*) from public.platform_admins),
    'suspended', (select count(*) from public.profiles where suspended_at is not null),
    'posts_total', (select count(*) from public.posts),
    'posts_today', (select count(*) from public.posts where created_at >= now() - interval '1 day'),
    'posts_7d', (select count(*) from public.posts where created_at > now() - interval '7 days'),
    'posts_hidden', (select count(*) from public.posts where hidden),
    'comments_7d', (select count(*) from public.comments where created_at > now() - interval '7 days'),
    'reports_pending', (select count(*) from public.reports where status = 'pendente'),
    'reports_ai_pending', (select count(*) from public.reports where status = 'pendente' and source = 'ia'),
    'verifications_pending', (select count(*) from public.verification_requests where status = 'em_analise'),
    'communities_total', (select count(*) from public.communities),
    'communities_attention', (select count(*) from public.communities where status <> 'ativa'),
    'appointments_7d', (select count(*) from public.appointments where created_at > now() - interval '7 days'),
    'appointments_upcoming', (select count(*) from public.appointments where starts_at > now() and status in ('agendada', 'confirmada')),
    'paid_cents', (select coalesce(sum(amount_cents), 0) from public.payments where status = 'aprovado'),
    'fees_cents', (select coalesce(sum(platform_fee_cents), 0) from public.payments where status = 'aprovado'),
    'refunded_cents', (select coalesce(sum(amount_cents), 0) from public.payments where status = 'reembolsado'),
    'contact_new', (select count(*) from public.contact_messages where status = 'novo'),
    'nina_today', (select coalesce(sum(count), 0) from public.ai_usage where day = today and kind = 'nina'),
    'summary_today', (select coalesce(sum(count), 0) from public.ai_usage where day = today and kind = 'summary'),
    'moderation_today', (select coalesce(sum(count), 0) from public.ai_usage where day = today and kind = 'moderation'),
    'signups', (
      select coalesce(jsonb_agg(jsonb_build_object('day', d.day, 'n', coalesce(c.n, 0)) order by d.day), '[]'::jsonb)
        from (select generate_series(current_date - 29, current_date, interval '1 day')::date as day) d
        left join (select created_at::date as day, count(*) as n from public.profiles
                    where created_at >= current_date - 29 group by 1) c on c.day = d.day
    ),
    'posts_series', (
      select coalesce(jsonb_agg(jsonb_build_object('day', d.day, 'n', coalesce(c.n, 0)) order by d.day), '[]'::jsonb)
        from (select generate_series(current_date - 29, current_date, interval '1 day')::date as day) d
        left join (select created_at::date as day, count(*) as n from public.posts
                    where created_at >= current_date - 29 group by 1) c on c.day = d.day
    )
  ) into result;
  return result;
end;
$$;

-- ─── Usuários ─────────────────────────────────────────────────────────────────
create or replace function public.admin_search_users(
  p_query text default '', p_filter text default 'todos', p_limit integer default 25, p_offset integer default 0
)
returns table (
  id uuid, name text, username text, email text, role public.app_role, is_admin boolean, verified boolean,
  suspended_at timestamptz, created_at timestamptz, posts_count bigint, reports_pending bigint, total bigint
)
language plpgsql stable security definer set search_path = public as $$
declare
  q text := '%' || lower(trim(coalesce(p_query, ''))) || '%';
begin
  perform public._admin_guard();
  return query
  select p.id, p.name, p.username, pp.email, p.role,
         exists (select 1 from public.platform_admins a where a.user_id = p.id),
         exists (select 1 from public.professionals pr where pr.user_id = p.id),
         p.suspended_at, p.created_at,
         (select count(*) from public.posts x where x.author_id = p.id),
         (select count(*) from public.reports r
           where r.status = 'pendente'
             and ((r.target_type = 'user' and r.target_id = p.id)
               or (r.target_type = 'post' and r.target_id in (select y.id from public.posts y where y.author_id = p.id))
               or (r.target_type = 'comment' and r.target_id in (select c.id from public.comments c where c.author_id = p.id)))),
         count(*) over ()
    from public.profiles p
    left join public.profile_private pp on pp.id = p.id
   where (trim(coalesce(p_query, '')) = ''
          or lower(p.name) like q or lower(p.username) like q or lower(coalesce(pp.email, '')) like q)
     and case coalesce(p_filter, 'todos')
           when 'profissionais' then exists (select 1 from public.professionals pr where pr.user_id = p.id)
           when 'pacientes' then not exists (select 1 from public.professionals pr where pr.user_id = p.id)
           when 'admins' then exists (select 1 from public.platform_admins a where a.user_id = p.id)
           when 'suspensos' then p.suspended_at is not null
           else true
         end
   order by p.created_at desc
   limit greatest(1, least(coalesce(p_limit, 25), 100)) offset greatest(0, coalesce(p_offset, 0));
end;
$$;

create or replace function public.admin_set_suspended(p_user uuid, p_suspend boolean, p_reason text default '')
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._admin_guard();
  if p_user = auth.uid() then
    raise exception 'Você não pode suspender a própria conta.';
  end if;
  if public.is_platform_admin(p_user) then
    raise exception 'Remova a função de administrador antes de suspender esta conta.';
  end if;
  update public.profiles set suspended_at = case when p_suspend then now() else null end where id = p_user;
  perform public._admin_log(case when p_suspend then 'conta_suspensa' else 'conta_reativada' end, 'user', p_user::text,
    jsonb_build_object('reason', left(coalesce(p_reason, ''), 300)));
  perform public.notify(p_user, case when p_suspend then 'conta_suspensa' else 'conta_reativada' end, null, 'user', p_user::text,
    jsonb_build_object('reason', left(coalesce(p_reason, ''), 300)));
end;
$$;

create or replace function public.admin_set_admin(p_user uuid, p_make boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._admin_guard();
  if p_make then
    insert into public.platform_admins (user_id) values (p_user) on conflict do nothing;
  else
    if (select count(*) from public.platform_admins) <= 1 then
      raise exception 'A plataforma precisa de pelo menos um administrador.';
    end if;
    delete from public.platform_admins where user_id = p_user;
  end if;
  perform public._admin_log(case when p_make then 'admin_concedido' else 'admin_removido' end, 'user', p_user::text);
end;
$$;

-- ─── Conteúdo ─────────────────────────────────────────────────────────────────
create or replace function public.admin_search_posts(
  p_query text default '', p_status text default 'todos', p_limit integer default 25, p_offset integer default 0
)
returns table (
  id uuid, author_id uuid, author_name text, author_username text, type public.post_type, title text,
  body text, image_url text, hidden boolean, pinned boolean, created_at timestamptz,
  reports_pending bigint, reactions bigint, comments bigint, total bigint
)
language plpgsql stable security definer set search_path = public as $$
declare
  q text := '%' || lower(trim(coalesce(p_query, ''))) || '%';
begin
  perform public._admin_guard();
  return query
  select x.id, x.author_id, a.name, a.username, x.type, x.title, left(x.body, 400), x.image_url, x.hidden, x.pinned, x.created_at,
         (select count(*) from public.reports r where r.target_type = 'post' and r.target_id = x.id and r.status = 'pendente'),
         (select count(*) from public.post_reactions pr where pr.post_id = x.id),
         (select count(*) from public.comments c where c.post_id = x.id),
         count(*) over ()
    from public.posts x
    join public.profiles a on a.id = x.author_id
   where (trim(coalesce(p_query, '')) = ''
          or lower(coalesce(x.title, '')) like q or lower(x.body) like q or lower(a.name) like q or lower(a.username) like q)
     and case coalesce(p_status, 'todos')
           when 'ocultos' then x.hidden
           when 'fixados' then x.pinned
           when 'denunciados' then exists (select 1 from public.reports r where r.target_type = 'post' and r.target_id = x.id and r.status = 'pendente')
           else true
         end
   order by x.created_at desc
   limit greatest(1, least(coalesce(p_limit, 25), 100)) offset greatest(0, coalesce(p_offset, 0));
end;
$$;

create or replace function public.admin_set_post_hidden(p_post uuid, p_hidden boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._admin_guard();
  update public.posts set hidden = p_hidden, pending_review = false where id = p_post;
  perform public._admin_log(case when p_hidden then 'post_ocultado' else 'post_restaurado' end, 'post', p_post::text);
end;
$$;

create or replace function public.admin_set_post_pinned(p_post uuid, p_pinned boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._admin_guard();
  update public.posts set pinned = p_pinned where id = p_post;
  perform public._admin_log(case when p_pinned then 'post_fixado' else 'post_desafixado' end, 'post', p_post::text);
end;
$$;

create or replace function public.admin_delete_post(p_post uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._admin_guard();
  delete from public.posts where id = p_post;
  perform public._admin_log('post_apagado', 'post', p_post::text);
end;
$$;

-- ─── Financeiro ───────────────────────────────────────────────────────────────
create or replace function public.admin_payments(
  p_status text default 'todos', p_limit integer default 25, p_offset integer default 0
)
returns table (
  id uuid, patient_name text, professional_name text, amount_cents integer, platform_fee_cents integer,
  status public.payment_status, provider text, method text, created_at timestamptz, paid_at timestamptz,
  refunded_at timestamptz, total bigint
)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._admin_guard();
  return query
  select pay.id, pa.name, pr.name, pay.amount_cents, pay.platform_fee_cents, pay.status, pay.provider, pay.method,
         pay.created_at, pay.paid_at, pay.refunded_at, count(*) over ()
    from public.payments pay
    join public.profiles pa on pa.id = pay.patient_id
    join public.profiles pr on pr.id = pay.professional_id
   where coalesce(p_status, 'todos') = 'todos' or pay.status::text = p_status
   order by pay.created_at desc
   limit greatest(1, least(coalesce(p_limit, 25), 100)) offset greatest(0, coalesce(p_offset, 0));
end;
$$;

-- ─── IA ───────────────────────────────────────────────────────────────────────
create or replace function public.admin_ai_stats(p_days integer default 14)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  days integer := greatest(1, least(coalesce(p_days, 14), 90));
  today date := (now() at time zone 'America/Sao_Paulo')::date;
  result jsonb;
begin
  perform public._admin_guard();
  select jsonb_build_object(
    'by_day', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'day', d.day,
               'nina', coalesce(u.nina, 0), 'summary', coalesce(u.summary, 0), 'moderation', coalesce(u.moderation, 0)
             ) order by d.day), '[]'::jsonb)
        from (select generate_series(today - (days - 1), today, interval '1 day')::date as day) d
        left join (
          select day,
                 sum(count) filter (where kind = 'nina') as nina,
                 sum(count) filter (where kind = 'summary') as summary,
                 sum(count) filter (where kind = 'moderation') as moderation
            from public.ai_usage where day >= today - (days - 1) group by day
        ) u on u.day = d.day
    ),
    'users_today', (select count(distinct user_id) from public.ai_usage where day = today),
    'top_today', (
      select coalesce(jsonb_agg(jsonb_build_object('name', x.name, 'count', x.n) order by x.n desc), '[]'::jsonb)
        from (select p.name, sum(a.count) as n from public.ai_usage a join public.profiles p on p.id = a.user_id
               where a.day = today group by p.name order by n desc limit 5) x
    ),
    'flagged_total', (select count(*) from public.reports where source = 'ia' and created_at >= now() - make_interval(days => days)),
    'flagged_pending', (select count(*) from public.reports where source = 'ia' and status = 'pendente'),
    'upheld', (select count(*) from public.reports where source = 'ia' and status = 'procedente' and created_at >= now() - make_interval(days => days)),
    'overturned', (select count(*) from public.reports where source = 'ia' and status = 'improcedente' and created_at >= now() - make_interval(days => days)),
    'nina_messages', (select count(*) from public.nina_messages where created_at >= now() - make_interval(days => days))
  ) into result;
  return result;
end;
$$;

-- ─── Configurações da plataforma ──────────────────────────────────────────────
create or replace function public.admin_set_setting(p_key text, p_value jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  n numeric;
  lo numeric;
  hi numeric;
begin
  perform public._admin_guard();
  n := (p_value #>> '{}')::numeric;
  case p_key
    when 'platform_fee_percent' then lo := 0; hi := 50;
    when 'payment_hold_minutes' then lo := 5; hi := 240;
    when 'min_booking_notice_hours' then lo := 0; hi := 168;
    when 'ai_limit_nina' then lo := 0; hi := 500;
    when 'ai_limit_summary' then lo := 0; hi := 500;
    when 'ai_limit_moderation' then lo := 0; hi := 2000;
    else raise exception 'Configuração desconhecida.';
  end case;
  if n is null or n < lo or n > hi then
    raise exception 'Valor fora do permitido (% a %).', lo, hi;
  end if;
  insert into public.platform_settings (key, value, updated_at) values (p_key, to_jsonb(case when p_key like 'ai_limit_%' then round(n) else n end), now())
  on conflict (key) do update set value = excluded.value, updated_at = now();
  perform public._admin_log('configuracao_alterada', 'setting', p_key, jsonb_build_object('value', n));
end;
$$;

-- Permissões: as funções do painel só rodam para quem está logado (e cada uma confere o admin por dentro).
do $$
declare
  fn text;
begin
  foreach fn in array array[
    'admin_log(text, text, text, jsonb)',
    'admin_save_announcement(uuid, text, text, text, text, boolean, timestamptz, timestamptz)',
    'admin_delete_announcement(uuid)',
    'admin_overview()',
    'admin_search_users(text, text, integer, integer)',
    'admin_set_suspended(uuid, boolean, text)',
    'admin_set_admin(uuid, boolean)',
    'admin_search_posts(text, text, integer, integer)',
    'admin_set_post_hidden(uuid, boolean)',
    'admin_set_post_pinned(uuid, boolean)',
    'admin_delete_post(uuid)',
    'admin_payments(text, integer, integer)',
    'admin_ai_stats(integer)',
    'admin_set_setting(text, jsonb)'
  ] loop
    execute format('revoke execute on function public.%s from public, anon', fn);
    execute format('grant execute on function public.%s to authenticated', fn);
  end loop;
end;
$$;

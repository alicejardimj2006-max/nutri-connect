-- =============================================================================
-- IA: limite diário por usuário, histórico da Nina (90 dias) e moderação
-- automática de posts/comentários (oculta e abre denúncia).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Limite diário de uso da IA (por usuário, por função)
-- O contador é separado do histórico: apagar a conversa não zera o limite.
-- ---------------------------------------------------------------------------
create table public.ai_usage (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null default ((now() at time zone 'America/Sao_Paulo')::date),
  kind text not null check (kind in ('nina', 'summary')),
  count integer not null default 0,
  primary key (user_id, day, kind)
);
alter table public.ai_usage enable row level security;
-- Sem políticas: só as funções abaixo (security definer) leem e gravam.

-- Consome 1 uso; false quando o limite do dia já foi atingido.
create or replace function public.ai_consume(p_kind text, p_limit integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  today date := (now() at time zone 'America/Sao_Paulo')::date;
  used integer;
begin
  if me is null then
    raise exception 'É preciso estar logado.' using errcode = '42501';
  end if;
  insert into public.ai_usage (user_id, day, kind, count) values (me, today, p_kind, 1)
  on conflict (user_id, day, kind) do update set count = public.ai_usage.count + 1
    where public.ai_usage.count < p_limit
  returning count into used;
  return used is not null;
end;
$$;

-- Quantos usos o usuário já fez hoje.
create or replace function public.ai_usage_today(p_kind text)
returns integer language sql stable security definer set search_path = public as $$
  select coalesce(
    (select count from public.ai_usage
      where user_id = auth.uid() and kind = p_kind
        and day = (now() at time zone 'America/Sao_Paulo')::date),
    0);
$$;

revoke execute on function public.ai_consume(text, integer) from public, anon;
revoke execute on function public.ai_usage_today(text) from public, anon;
grant execute on function public.ai_consume(text, integer) to authenticated;
grant execute on function public.ai_usage_today(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Histórico da conversa com a Nina
-- ---------------------------------------------------------------------------
create table public.nina_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (length(content) between 1 and 8000),
  created_at timestamptz not null default now()
);
create index nina_messages_user_idx on public.nina_messages (user_id, created_at);

alter table public.nina_messages enable row level security;
create policy "nina_messages: dono lê" on public.nina_messages
  for select to authenticated using (user_id = auth.uid());
create policy "nina_messages: dono grava" on public.nina_messages
  for insert to authenticated with check (user_id = auth.uid());
create policy "nina_messages: dono apaga" on public.nina_messages
  for delete to authenticated using (user_id = auth.uid());

-- Retenção de 90 dias.
create or replace function public.purge_nina_messages()
returns integer language plpgsql security definer set search_path = public as $$
declare
  n integer;
begin
  delete from public.nina_messages where created_at < now() - interval '90 days';
  get diagnostics n = row_count;
  return n;
end;
$$;
revoke execute on function public.purge_nina_messages() from public, anon, authenticated;

do $$
begin
  create extension if not exists pg_cron;
  perform cron.unschedule(jobid) from cron.job where jobname = 'nutriconnect-nina-purge';
  -- 06:00 UTC = 03:00 em Brasília.
  perform cron.schedule('nutriconnect-nina-purge', '0 6 * * *', 'select public.purge_nina_messages()');
exception when others then
  raise notice 'pg_cron indisponível: %', sqlerrm;
end;
$$;

-- ---------------------------------------------------------------------------
-- Moderação automática por IA
--   Cada post/comentário novo é enviado (sem bloquear a publicação) à Edge Function
--   moderate-content. Se a IA marcar como problemático, ai_flag_content() oculta o
--   conteúdo, abre uma denúncia (source = 'ia') para o /admin e avisa o autor.
--   Se a IA falhar, o conteúdo continua visível (falha aberta).
-- ---------------------------------------------------------------------------
alter table public.reports alter column reporter_id drop not null;
alter table public.reports
  add column source text not null default 'usuario' check (source in ('usuario', 'ia'));
alter table public.reports
  add constraint reports_reporter_required check (source = 'ia' or reporter_id is not null);

create or replace function public.ai_flag_content(
  p_type public.report_target, p_id uuid, p_reason text, p_details text
)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  author uuid;
begin
  if p_type = 'post' then
    update public.posts set hidden = true where id = p_id and not hidden returning author_id into author;
  elsif p_type = 'comment' then
    update public.comments set hidden = true where id = p_id and not hidden returning author_id into author;
  else
    return false;
  end if;
  if author is null then return false; end if;

  insert into public.reports (reporter_id, source, target_type, target_id, reason, details)
  values (null, 'ia', p_type, p_id,
          case when p_reason in ('spam', 'desinformacao', 'ofensivo', 'assedio', 'inadequado') then p_reason else 'outro' end,
          left(p_details, 500));
  perform public.notify(author, 'conteudo_oculto', null, p_type::text, p_id::text);
  return true;
end;
$$;
revoke execute on function public.ai_flag_content(public.report_target, uuid, text, text) from public, anon, authenticated;
grant execute on function public.ai_flag_content(public.report_target, uuid, text, text) to service_role;

-- Pede a análise à Edge Function (mesmos segredos do Vault do tema da semana).
create or replace function public.trg_ai_moderation()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  fn_url text;
  secret text;
  kind text := case tg_table_name when 'posts' then 'post' else 'comment' end;
begin
  begin
    select decrypted_secret into fn_url from vault.decrypted_secrets where name = 'nutriconnect_functions_url';
    select decrypted_secret into secret from vault.decrypted_secrets where name = 'nutriconnect_cron_secret';
    if fn_url is null or secret is null then return new; end if;
    execute 'select net.http_post(url := $1, headers := $2, body := $3, timeout_milliseconds := 60000)'
      using fn_url || '/moderate-content',
            jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', secret),
            jsonb_build_object('type', kind, 'id', new.id);
  exception when others then
    -- Nunca impede alguém de publicar.
    raise notice 'Moderação por IA indisponível: %', sqlerrm;
  end;
  return new;
end;
$$;
revoke execute on function public.trg_ai_moderation() from public, anon, authenticated;

create trigger posts_ai_moderation after insert on public.posts
  for each row execute function public.trg_ai_moderation();
create trigger comments_ai_moderation after insert on public.comments
  for each row execute function public.trg_ai_moderation();

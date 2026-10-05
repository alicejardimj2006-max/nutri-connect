-- =============================================================================
-- Moderação ANTES de publicar: todo post e comentário novo nasce oculto ("pending_review") e só
-- aparece para os outros depois que a IA aprova (moderate-content -> ai_approve_content).
--   * quem escreve vê o próprio conteúdo normalmente, com o aviso "em análise";
--   * IA reprova -> continua oculto, abre denúncia (source = 'ia') e avisa o autor;
--   * IA indisponível -> um job tenta de novo a cada 2 minutos; depois de 30 minutos a pendência
--     vai para a fila humana do /admin (nunca fica preso para sempre);
--   * a regra vive no banco (gatilho), então não dá para burlar chamando a API direto.
-- Administradores da plataforma publicam sem esperar.
-- =============================================================================

alter table public.posts add column pending_review boolean not null default false;
alter table public.comments add column pending_review boolean not null default false;

create index posts_pending_idx on public.posts (created_at) where pending_review;
create index comments_pending_idx on public.comments (created_at) where pending_review;

-- Posts: o que o autor manda nasce oculto, aguardando a IA.
create or replace function public.check_post_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.publish_at > now() + interval '1 minute' and not public.is_verified_professional(new.author_id) then
    raise exception 'Apenas profissionais podem agendar publicações.';
  end if;
  if tg_op = 'INSERT' then
    new.pinned := false;
    new.hidden := not public.is_platform_admin(new.author_id);
    new.pending_review := new.hidden;
    if new.community_id is not null and not public.is_community_member(new.community_id, new.author_id) then
      raise exception 'Entre na comunidade para publicar nela.';
    end if;
  end if;
  return new;
end;
$$;

-- Comentários: mesmo fluxo.
create or replace function public.check_comment_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.hidden := not public.is_platform_admin(new.author_id);
  new.pending_review := new.hidden;
  return new;
end;
$$;
drop trigger if exists comments_check_write on public.comments;
create trigger comments_check_write before insert on public.comments
  for each row execute function public.check_comment_write();

-- Só avisa o dono do post depois que o comentário for aprovado (ver ai_approve_content).
create or replace function public.trg_notify_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  p public.posts;
begin
  if new.hidden then return new; end if;
  select * into p from public.posts where id = new.post_id;
  perform public.notify(p.author_id, 'comentario', new.author_id, 'post', p.id::text,
    jsonb_build_object('comment', left(new.body, 120), 'title', coalesce(p.title, left(p.body, 80))));
  return new;
end;
$$;

-- IA aprovou: publica.
create or replace function public.ai_approve_content(p_type public.report_target, p_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  c public.comments;
  p public.posts;
begin
  if p_type = 'post' then
    update public.posts set hidden = false, pending_review = false
     where id = p_id and pending_review;
    return found;
  elsif p_type = 'comment' then
    update public.comments set hidden = false, pending_review = false
     where id = p_id and pending_review returning * into c;
    if c.id is null then return false; end if;
    select * into p from public.posts where id = c.post_id;
    perform public.notify(p.author_id, 'comentario', c.author_id, 'post', p.id::text,
      jsonb_build_object('comment', left(c.body, 120), 'title', coalesce(p.title, left(p.body, 80))));
    return true;
  end if;
  return false;
end;
$$;
revoke execute on function public.ai_approve_content(public.report_target, uuid) from public, anon, authenticated;
grant execute on function public.ai_approve_content(public.report_target, uuid) to service_role;

-- IA reprovou: mantém oculto (também quando ainda estava pendente), denuncia e avisa o autor.
create or replace function public.ai_flag_content(
  p_type public.report_target, p_id uuid, p_reason text, p_details text
)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  author uuid;
begin
  if p_type = 'post' then
    update public.posts set hidden = true, pending_review = false
     where id = p_id and (not hidden or pending_review) returning author_id into author;
  elsif p_type = 'comment' then
    update public.comments set hidden = true, pending_review = false
     where id = p_id and (not hidden or pending_review) returning author_id into author;
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

-- Decisão de um admin também encerra a pendência.
create or replace function public.resolve_reports(
  p_target_type public.report_target, p_target_id uuid, p_hide boolean
)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Apenas administradores da plataforma.' using errcode = '42501';
  end if;
  if p_target_type = 'post' then
    update public.posts set hidden = p_hide, pending_review = false where id = p_target_id;
  elsif p_target_type = 'comment' then
    update public.comments set hidden = p_hide, pending_review = false where id = p_target_id;
  end if;
  update public.reports
     set status = case when p_hide then 'procedente'::public.report_status else 'improcedente' end,
         reviewed_by = auth.uid(), reviewed_at = now()
   where target_type = p_target_type and target_id = p_target_id and status = 'pendente';
end;
$$;

-- Tenta de novo o que a IA não conseguiu analisar e, passados 30 minutos, manda para a fila humana.
create or replace function public.retry_pending_moderation()
returns integer language plpgsql security definer set search_path = public as $$
declare
  fn_url text;
  secret text;
  r record;
  n integer := 0;
begin
  select decrypted_secret into fn_url from vault.decrypted_secrets where name = 'nutriconnect_functions_url';
  select decrypted_secret into secret from vault.decrypted_secrets where name = 'nutriconnect_cron_secret';

  if fn_url is not null and secret is not null then
    for r in
      select 'post' as kind, id from public.posts
       where pending_review and created_at < now() - interval '1 minute'
         and created_at > now() - interval '30 minutes'
      union all
      select 'comment', id from public.comments
       where pending_review and created_at < now() - interval '1 minute'
         and created_at > now() - interval '30 minutes'
      limit 50
    loop
      perform net.http_post(
        url := fn_url || '/moderate-content',
        headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', secret),
        body := jsonb_build_object('type', r.kind, 'id', r.id),
        timeout_milliseconds := 60000
      );
      n := n + 1;
    end loop;
  end if;

  -- Há 30 minutos sem análise da IA: um(a) admin decide em /admin -> Denúncias.
  insert into public.reports (reporter_id, source, target_type, target_id, reason, details)
  select null, 'ia', x.kind::public.report_target, x.id, 'outro',
         'Aguardando revisão humana: a IA não conseguiu analisar a tempo.'
    from (
      select 'post' as kind, id from public.posts
       where pending_review and created_at <= now() - interval '30 minutes'
      union all
      select 'comment', id from public.comments
       where pending_review and created_at <= now() - interval '30 minutes'
    ) x
   where not exists (
     select 1 from public.reports rp
      where rp.target_type = x.kind::public.report_target and rp.target_id = x.id and rp.status = 'pendente'
   );
  return n;
end;
$$;
revoke execute on function public.retry_pending_moderation() from public, anon, authenticated;

do $$
begin
  create extension if not exists pg_cron;
  perform cron.unschedule(jobid) from cron.job where jobname = 'nutriconnect-moderation-retry';
  perform cron.schedule('nutriconnect-moderation-retry', '*/2 * * * *', 'select public.retry_pending_moderation()');
exception when others then
  raise notice 'pg_cron indisponível: %', sqlerrm;
end;
$$;

-- =============================================================================
-- O que a IA barra antes de publicar passa a ficar visível para a administração.
--   * ai_rejections: quem tentou publicar/comentar, o conteúdo, o motivo e a foto (num bucket
--     PRIVADO, ai-rejections). Só administradores leem. Tudo some depois de 30 dias.
--   * A Edge Function check-content grava a linha quando a IA reprova (a pessoa não vê diferença).
--   * admin_ai_rejections: lista para o painel; admin_ai_rejection_decide: "manter" (a IA acertou)
--     ou "liberar" (a IA errou: a publicação/comentário vai ao ar em nome da pessoa).
-- =============================================================================

create table public.ai_rejections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('post', 'comment')),
  post_id uuid,
  title text,
  body text not null default '',
  tags text[] not null default '{}',
  recipe jsonb,
  -- Campos da publicação que a IA não analisa (tipo, público, comunidade, tema, ordem dos blocos).
  context jsonb not null default '{}'::jsonb,
  image_path text,
  code text not null,
  message text not null default '',
  status text not null default 'pendente' check (status in ('pendente', 'mantida', 'liberada')),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  published_id uuid,
  created_at timestamptz not null default now()
);
create index ai_rejections_created_idx on public.ai_rejections (created_at desc);
create index ai_rejections_status_idx on public.ai_rejections (status, created_at desc);
alter table public.ai_rejections enable row level security;
create policy "ai_rejections: admins leem" on public.ai_rejections
  for select to authenticated using (public.is_platform_admin());
-- Sem políticas de escrita: só a Edge Function (service_role) e as funções abaixo gravam.

-- Fotos barradas: bucket privado; o painel abre com link assinado.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('ai-rejections', 'ai-rejections', false, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;
create policy "ai-rejections: admins leem" on storage.objects
  for select to authenticated using (bucket_id = 'ai-rejections' and public.is_platform_admin());

-- ─── Leitura para o painel ───────────────────────────────────────────────────
create or replace function public.admin_ai_rejections(
  p_status text default null, p_code text default null, p_search text default '',
  p_limit integer default 30, p_offset integer default 0
)
returns table (
  id uuid, user_id uuid, user_name text, user_username text, kind text, post_id uuid,
  title text, body text, tags text[], recipe jsonb, context jsonb, community_name text, image_path text, code text, message text,
  status text, reviewed_by_name text, reviewed_at timestamptz, published_id uuid,
  created_at timestamptz, user_rejections_30d bigint, total bigint
)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._admin_guard();
  return query
  with base as (
    select r.*, p.name as u_name, p.username as u_username, rv.name as rv_name
      from public.ai_rejections r
      join public.profiles p on p.id = r.user_id
      left join public.profiles rv on rv.id = r.reviewed_by
     where (p_status is null or r.status = p_status)
       and (p_code is null or r.code = p_code)
       and (coalesce(p_search, '') = ''
            or r.body ilike '%' || p_search || '%'
            or coalesce(r.title, '') ilike '%' || p_search || '%'
            or p.name ilike '%' || p_search || '%'
            or p.username ilike '%' || p_search || '%')
  )
  select b.id, b.user_id, b.u_name, b.u_username, b.kind, b.post_id, b.title, b.body, b.tags,
         b.recipe, b.context,
         (select c.name from public.communities c where c.id = nullif(b.context->>'communityId', '')::uuid),
         b.image_path, b.code, b.message, b.status, b.rv_name, b.reviewed_at,
         b.published_id, b.created_at,
         (select count(*) from public.ai_rejections x where x.user_id = b.user_id),
         count(*) over ()
    from base b
   order by b.created_at desc
   limit least(greatest(p_limit, 1), 100) offset greatest(p_offset, 0);
end;
$$;

create or replace function public.admin_ai_rejections_summary()
returns table (pending bigint, today bigint, last_7d bigint, by_code jsonb)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._admin_guard();
  return query
  select
    (select count(*) from public.ai_rejections where status = 'pendente'),
    (select count(*) from public.ai_rejections where created_at >= date_trunc('day', now())),
    (select count(*) from public.ai_rejections where created_at >= now() - interval '7 days'),
    coalesce((select jsonb_object_agg(code, n) from (
      select code, count(*) as n from public.ai_rejections
       where created_at >= now() - interval '30 days' group by code) c), '{}'::jsonb);
end;
$$;

-- ─── Decisão: manter ou liberar ──────────────────────────────────────────────
-- Liberar publica em nome da pessoa: cria a aprovação exata que o gatilho exige e insere o conteúdo.
-- p_image_url: foto já copiada pelo painel para o bucket público (ou null).
create or replace function public.admin_ai_rejection_decide(p_id uuid, p_release boolean, p_image_url text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  r public.ai_rejections%rowtype;
  new_id uuid;
begin
  perform public._admin_guard();
  select * into r from public.ai_rejections where id = p_id for update;
  if not found then raise exception 'Registro não encontrado (pode ter passado de 30 dias).'; end if;
  if r.status <> 'pendente' then raise exception 'Este conteúdo já foi revisado.'; end if;

  if not p_release then
    update public.ai_rejections set status = 'mantida', reviewed_by = auth.uid(), reviewed_at = now() where id = p_id;
    perform public._admin_log('ia_barrado_mantido', 'ai_rejection', p_id::text, jsonb_build_object('code', r.code));
    return null;
  end if;

  if r.kind = 'post' then
    insert into public.content_approvals (user_id, kind, title, body, image_url, tags, recipe)
    values (r.user_id, 'post', r.title, r.body, p_image_url, r.tags, r.recipe);
    insert into public.posts (author_id, type, audience, title, body, image_url, tags, recipe, block_order, theme_id, community_id)
    values (
      r.user_id,
      coalesce(nullif(r.context->>'type', ''), 'geral')::public.post_type,
      coalesce(nullif(r.context->>'audience', ''), 'publico')::public.post_audience,
      r.title, r.body, p_image_url, r.tags, r.recipe,
      case when jsonb_typeof(r.context->'blockOrder') = 'array'
           then array(select jsonb_array_elements_text(r.context->'blockOrder')) end,
      nullif(r.context->>'themeId', '')::uuid,
      nullif(r.context->>'communityId', '')::uuid
    )
    returning id into new_id;
  else
    if r.post_id is null or not exists (select 1 from public.posts where id = r.post_id) then
      raise exception 'A publicação deste comentário não existe mais.';
    end if;
    insert into public.content_approvals (user_id, kind, post_id, body)
    values (r.user_id, 'comment', r.post_id, r.body);
    insert into public.comments (post_id, author_id, body)
    values (r.post_id, r.user_id, r.body)
    returning id into new_id;
  end if;

  update public.ai_rejections
     set status = 'liberada', reviewed_by = auth.uid(), reviewed_at = now(), published_id = new_id
   where id = p_id;
  insert into public.notifications (user_id, type, entity_type, entity_id, data)
  values (r.user_id, 'conteudo_liberado', case when r.kind = 'post' then 'post' else 'comment' end,
          coalesce(r.post_id, new_id)::text, jsonb_build_object('kind', r.kind));
  perform public._admin_log('ia_barrado_liberado', 'ai_rejection', p_id::text,
                            jsonb_build_object('code', r.code, 'published_id', new_id));
  return new_id;
end;
$$;

revoke execute on function public.admin_ai_rejections(text, text, text, integer, integer) from public, anon;
revoke execute on function public.admin_ai_rejections_summary() from public, anon;
revoke execute on function public.admin_ai_rejection_decide(uuid, boolean, text) from public, anon;

-- ─── Limpeza: 30 dias ────────────────────────────────────────────────────────
-- Linhas sem foto saem pelo agendamento; as com foto saem pela Edge Function, que apaga o arquivo
-- junto (o banco não deve apagar arquivos do Storage direto).
create or replace function public.purge_ai_rejections()
returns void language sql security definer set search_path = public as $$
  delete from public.ai_rejections where image_path is null and created_at < now() - interval '30 days';
$$;
revoke execute on function public.purge_ai_rejections() from public, anon, authenticated;

do $$
begin
  create extension if not exists pg_cron;
  perform cron.unschedule(jobid) from cron.job where jobname = 'nutriconnect-ai-rejections-purge';
  perform cron.schedule('nutriconnect-ai-rejections-purge', '23 3 * * *', 'select public.purge_ai_rejections()');
exception when others then
  raise notice 'pg_cron indisponível: %', sqlerrm;
end;
$$;

-- Aviso de conteúdo liberado pela moderação é do sistema (não depende das preferências).
create or replace function public.notification_category(p_type text)
returns text language sql immutable as $$
  select case
    when p_type in ('reacao', 'comentario', 'amizade_pedido', 'amizade_aceita', 'seguidor') then 'social'
    when p_type in ('tema_previa', 'tema_ativo') then 'theme'
    when p_type = 'conquista' then 'achievements'
    when p_type in ('conteudo_oculto', 'conteudo_liberado', 'conta_suspensa', 'conta_reativada') then 'system'
    else 'clinical'
  end;
$$;

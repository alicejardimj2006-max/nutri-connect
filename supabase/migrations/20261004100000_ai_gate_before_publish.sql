-- =============================================================================
-- A IA analisa ANTES de o conteúdo existir. Nada é salvo "oculto" para depois ser decidido:
--   * o app manda título, texto, tags, receita e foto para a Edge Function check-content;
--   * se a IA reprovar (fora do tema, foto que não combina com o texto, spam, ofensa…), nada é
--     gravado e a foto nem chega ao Storage; a pessoa recebe o motivo na hora;
--   * se aprovar, a função grava uma "aprovação" ligada ao conteúdo exato e à pessoa
--     (content_approvals, válida por 15 minutos e de uso único);
--   * o gatilho do banco só aceita o post/comentário se existir essa aprovação, então não dá
--     para publicar chamando a API direto, nem trocar a foto/texto depois de aprovado.
-- Administradores da plataforma publicam sem passar pela análise. Chamadas sem usuário
-- (service_role: seeds, tema da semana) também não precisam dela.
-- =============================================================================

alter table public.ai_usage drop constraint if exists ai_usage_kind_check;
alter table public.ai_usage add constraint ai_usage_kind_check
  check (kind in ('nina', 'summary', 'moderation'));

create table public.content_approvals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('post', 'comment')),
  post_id uuid,                                  -- só comentários
  title text,
  body text not null default '',
  image_url text,
  tags text[] not null default '{}',
  recipe jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '15 minutes'
);
create index content_approvals_lookup_idx on public.content_approvals (user_id, kind, expires_at);
alter table public.content_approvals enable row level security;
-- Sem políticas: só a Edge Function (service_role) grava e só os gatilhos (security definer) leem.

-- Posts: sem aprovação da IA não entra; com ela, já nasce publicado.
create or replace function public.check_post_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.publish_at > now() + interval '1 minute' and not public.is_verified_professional(new.author_id) then
    raise exception 'Apenas profissionais podem agendar publicações.';
  end if;
  if tg_op = 'INSERT' then
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

-- Comentários: mesma regra.
create or replace function public.check_comment_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
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

-- A análise acontece antes: os gatilhos antigos (análise depois de salvar) saem de posts e comentários.
-- Os de foto de perfil e capa de comunidade continuam.
drop trigger if exists posts_ai_moderation on public.posts;
drop trigger if exists posts_ai_moderation_image on public.posts;
drop trigger if exists comments_ai_moderation on public.comments;

-- Quem escreve não pode mexer, pela API, no que a IA aprovou nem no que a moderação decidiu.
create or replace function public.guard_post_update()
returns trigger language plpgsql set search_path = public as $$
begin
  if auth.uid() is not null and current_user in ('authenticated', 'anon')
     and not public.is_platform_admin() then
    if (new.author_id, new.community_id, new.title, new.body, new.image_url, new.tags, new.recipe,
        new.hidden, new.pending_review, new.pinned)
       is distinct from
       (old.author_id, old.community_id, old.title, old.body, old.image_url, old.tags, old.recipe,
        old.hidden, old.pending_review, old.pinned) then
      raise exception 'Uma publicação não pode ser alterada depois de analisada. Apague e publique de novo.'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists posts_guard_update on public.posts;
create trigger posts_guard_update before update on public.posts
  for each row execute function public.guard_post_update();

-- Aprovações vencidas não servem para nada.
create or replace function public.purge_content_approvals()
returns void language sql security definer set search_path = public as $$
  delete from public.content_approvals where expires_at < now() - interval '1 hour';
$$;
revoke execute on function public.purge_content_approvals() from public, anon, authenticated;

do $$
begin
  create extension if not exists pg_cron;
  perform cron.unschedule(jobid) from cron.job where jobname = 'nutriconnect-approvals-purge';
  perform cron.schedule('nutriconnect-approvals-purge', '17 * * * *', 'select public.purge_content_approvals()');
exception when others then
  raise notice 'pg_cron indisponível: %', sqlerrm;
end;
$$;

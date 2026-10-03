-- =============================================================================
-- Moderação automática de IMAGENS públicas: foto de post, foto de perfil e capa de comunidade.
--   * posts: a imagem já vai junto com o texto na análise do post (trigger de insert existente);
--     agora também quando a imagem de um post é trocada.
--   * perfis e comunidades: novos gatilhos chamam a Edge Function moderate-content.
--   Fotos privadas (diário, exames, anexos do chat, documentos de verificação) NUNCA são enviadas
--   à IA. Se a IA falhar, o conteúdo continua visível (falha aberta).
-- =============================================================================

-- Remove a foto de perfil/capa marcada pela IA, abre denúncia (source = 'ia') e avisa a pessoa.
create or replace function public.ai_flag_image(
  p_kind text, p_id uuid, p_reason text, p_details text
)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  owner uuid;
  reason text := case when p_reason in ('spam', 'desinformacao', 'ofensivo', 'assedio', 'inadequado')
                      then p_reason else 'outro' end;
begin
  if p_kind = 'avatar' then
    update public.profiles set avatar_url = null
     where id = p_id and avatar_url is not null returning id into owner;
  elsif p_kind = 'cover' then
    update public.communities set cover_image_url = null
     where id = p_id and cover_image_url is not null returning created_by into owner;
  else
    return false;
  end if;
  if owner is null then return false; end if;

  insert into public.reports (reporter_id, source, target_type, target_id, reason, details)
  values (null, 'ia', 'user', owner, reason, left(p_details, 500));
  perform public.notify(owner, 'conteudo_oculto', null, 'user', owner::text);
  return true;
end;
$$;
revoke execute on function public.ai_flag_image(text, uuid, text, text) from public, anon, authenticated;
grant execute on function public.ai_flag_image(text, uuid, text, text) to service_role;

-- O gatilho de moderação passa a conhecer perfis e comunidades.
create or replace function public.trg_ai_moderation()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  fn_url text;
  secret text;
  kind text := case tg_table_name
    when 'posts' then 'post'
    when 'comments' then 'comment'
    when 'profiles' then 'avatar'
    else 'cover'
  end;
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

drop trigger if exists posts_ai_moderation_image on public.posts;
create trigger posts_ai_moderation_image after update of image_url on public.posts
  for each row when (new.image_url is not null and new.image_url is distinct from old.image_url)
  execute function public.trg_ai_moderation();

drop trigger if exists profiles_ai_moderation on public.profiles;
create trigger profiles_ai_moderation after update of avatar_url on public.profiles
  for each row when (new.avatar_url is not null and new.avatar_url is distinct from old.avatar_url)
  execute function public.trg_ai_moderation();

drop trigger if exists communities_ai_moderation on public.communities;
create trigger communities_ai_moderation after insert on public.communities
  for each row when (new.cover_image_url is not null)
  execute function public.trg_ai_moderation();

drop trigger if exists communities_ai_moderation_cover on public.communities;
create trigger communities_ai_moderation_cover after update of cover_image_url on public.communities
  for each row when (new.cover_image_url is not null and new.cover_image_url is distinct from old.cover_image_url)
  execute function public.trg_ai_moderation();

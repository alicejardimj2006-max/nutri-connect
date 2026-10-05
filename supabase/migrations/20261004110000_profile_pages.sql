-- =============================================================================
-- Perfil personalizável: cada pessoa monta o próprio perfil (blocos com posição, tamanho e
-- conteúdo + tema visual) e quem visita vê exatamente o que ela montou.
--   * profiles.banner_url: a capa do perfil (a foto de perfil já existia, mas sem tela para trocar);
--   * profile_pages: o layout e o tema, gravados SÓ pela Edge Function profile-page (que valida e
--     analisa os textos com IA antes de salvar). Ninguém grava essa tabela direto pela API;
--   * profile_media: fotos aprovadas pela Edge Function profile-image (só estas podem entrar na página);
--   * get_profile_page(): leitura que respeita bloqueios e perfil privado.
-- =============================================================================

alter table public.profiles add column banner_url text;
grant update (banner_url) on public.profiles to authenticated;

create table public.profile_pages (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  page jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.profile_pages enable row level security;
-- A própria pessoa pode ler (o editor); a gravação é só da Edge Function (service_role).
create policy "profile_pages: dono le" on public.profile_pages
  for select to authenticated using (user_id = auth.uid());

create table public.profile_media (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  url text not null,
  kind text not null check (kind in ('avatar', 'banner', 'image')),
  created_at timestamptz not null default now(),
  unique (user_id, url)
);
create index profile_media_user_idx on public.profile_media (user_id, kind);
alter table public.profile_media enable row level security;
create policy "profile_media: dono le" on public.profile_media
  for select to authenticated using (user_id = auth.uid());

-- Perfil de alguém: capa, layout e tema. Bloqueio -> nada. Perfil privado de quem não é amigo -> só o
-- tema e a capa (o conteúdo dos blocos fica escondido, como o resto do perfil).
create or replace function public.get_profile_page(p_user uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  banner text;
  pg jsonb;
  can_view boolean;
begin
  if me is null then return null; end if;
  if p_user <> me and public.is_blocked_between(p_user, me) then return null; end if;
  select p.banner_url into banner from public.profiles p where p.id = p_user;
  if not found then return null; end if;
  select page into pg from public.profile_pages where user_id = p_user;
  can_view := p_user = me or public.can_view_profile_content(p_user);
  if pg is null then pg := '{}'::jsonb; end if;
  if not can_view then pg := pg - 'layout'; end if;
  return jsonb_build_object('banner_url', banner, 'page', pg, 'can_view_content', can_view);
end;
$$;
revoke execute on function public.get_profile_page(uuid) from public, anon;
grant execute on function public.get_profile_page(uuid) to authenticated;

-- Moderação da capa: mesmo fluxo da foto de perfil (análise logo depois do envio; reprovada, é removida).
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
  elsif p_kind = 'banner' then
    update public.profiles set banner_url = null
     where id = p_id and banner_url is not null returning id into owner;
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

-- O gatilho aceita o tipo como argumento (os já existentes seguem sem argumento).
create or replace function public.trg_ai_moderation()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  fn_url text;
  secret text;
  kind text := coalesce(nullif(tg_argv[0], ''), case tg_table_name
    when 'posts' then 'post'
    when 'comments' then 'comment'
    when 'profiles' then 'avatar'
    else 'cover'
  end);
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
    -- Nunca impede alguém de usar o site.
    raise notice 'Moderação por IA indisponível: %', sqlerrm;
  end;
  return new;
end;
$$;
revoke execute on function public.trg_ai_moderation() from public, anon, authenticated;

drop trigger if exists profiles_ai_moderation_banner on public.profiles;
create trigger profiles_ai_moderation_banner after update of banner_url on public.profiles
  for each row when (new.banner_url is not null and new.banner_url is distinct from old.banner_url)
  execute function public.trg_ai_moderation('banner');

-- Portabilidade (LGPD): a página do perfil e as fotos enviadas entram na exportação.
create or replace function public.export_my_data()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  result jsonb;
  spec record;
begin
  if me is null then
    raise exception 'É preciso estar logado.' using errcode = '42501';
  end if;

  result := jsonb_build_object(
    'gerado_em', now(),
    'conta', (select jsonb_build_object('email', u.email, 'criada_em', u.created_at)
                from auth.users u where u.id = me),
    'perfil', (select to_jsonb(p) from public.profiles p where p.id = me),
    'pagina_do_perfil', (select to_jsonb(g) from public.profile_pages g where g.user_id = me),
    'dados_pessoais', (select to_jsonb(p) from public.profile_private p where p.id = me),
    'configuracoes', (select to_jsonb(s) from public.user_settings s where s.id = me)
  );

  for spec in
    select * from (values
      ('publicacoes', 'posts', array['author_id']),
      ('comentarios', 'comments', array['author_id']),
      ('reacoes', 'post_reactions', array['user_id']),
      ('posts_salvos', 'saved_posts', array['user_id']),
      ('seguindo', 'follows', array['follower_id']),
      ('amizades', 'friendships', array['requester_id', 'addressee_id']),
      ('bloqueios', 'blocks', array['blocker_id']),
      ('comunidades', 'community_members', array['user_id']),
      ('desafios_participacao', 'challenge_participants', array['user_id']),
      ('desafios_dicas', 'challenge_tips', array['author_id']),
      ('votos_enquete', 'theme_poll_votes', array['user_id']),
      ('conversas_nina', 'nina_messages', array['user_id']),
      ('notificacoes', 'notifications', array['user_id']),
      ('mensagens_fale_conosco', 'contact_messages', array['user_id']),
      ('denuncias_feitas', 'reports', array['reporter_id']),
      ('diario_alimentar', 'diary_entries', array['patient_id']),
      ('diario_comentarios', 'diary_comments', array['author_id']),
      ('metas', 'goals', array['patient_id']),
      ('metas_checkins', 'goal_checkins', array['patient_id']),
      ('anamneses', 'anamneses', array['patient_id']),
      ('antropometria', 'anthropometrics', array['patient_id']),
      ('planos_alimentares', 'meal_plans', array['patient_id']),
      ('consultas', 'appointments', array['patient_id']),
      ('pagamentos', 'payments', array['patient_id']),
      ('mensagens_acompanhamento', 'messages', array['patient_id', 'sender_id']),
      ('vinculos_profissionais', 'care_links', array['patient_id']),
      ('documentos_enviados', 'patient_documents', array['patient_id']),
      ('perfis_da_trilha', 'trail_profiles', array['owner_id']),
      ('verificacoes_profissionais', 'verification_requests', array['user_id']),
      ('cadastro_profissional', 'professionals', array['user_id']),
      ('fotos_do_perfil', 'profile_media', array['user_id']),
      ('consentimentos', 'consents', array['user_id'])
    ) as v(label, tbl, cols)
  loop
    result := result || jsonb_build_object(spec.label, public._export_rows(spec.tbl, spec.cols, me));
  end loop;

  return result;
end;
$$;
revoke execute on function public.export_my_data() from public, anon;

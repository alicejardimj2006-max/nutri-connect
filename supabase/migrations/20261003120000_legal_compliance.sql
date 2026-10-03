-- =============================================================================
-- Adequação legal (LGPD, Marco Civil, ECA Digital):
--   * consents: registro de aceite dos Termos/Política e do consentimento para dados de saúde
--     (prova do consentimento e da revogação, art. 8º e 11 da LGPD);
--   * export_my_data(): acesso e portabilidade dos dados do titular (art. 18 da LGPD);
--   * enforce_adult_signup: o NutriConnect é para maiores de 18 anos; crianças usam a conta do
--     responsável em perfis infantis, que não têm rede social.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Consentimentos (log só de inserção: a revogação é uma nova linha com granted = false)
-- ---------------------------------------------------------------------------
create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('termos', 'saude')),
  version text not null check (length(version) between 1 and 40),
  granted boolean not null default true,
  created_at timestamptz not null default now()
);
create index consents_user_kind_idx on public.consents (user_id, kind, created_at desc);

alter table public.consents enable row level security;
create policy "consents: dono lê" on public.consents
  for select to authenticated using (user_id = auth.uid());
-- Sem política de escrita: só record_consent() grava.

create or replace function public.record_consent(
  p_kind text, p_version text, p_granted boolean default true
)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'É preciso estar logado.' using errcode = '42501';
  end if;
  if p_kind not in ('termos', 'saude') then
    raise exception 'Tipo de consentimento inválido.' using errcode = '22023';
  end if;
  -- Os Termos não podem ser "revogados" por aqui: quem não concorda encerra a conta.
  if p_kind = 'termos' and not p_granted then
    raise exception 'Para não aceitar os Termos, exclua a conta.' using errcode = '22023';
  end if;
  insert into public.consents (user_id, kind, version, granted)
  values (auth.uid(), p_kind, left(p_version, 40), p_granted);
end;
$$;
revoke execute on function public.record_consent(text, text, boolean) from public, anon;
grant execute on function public.record_consent(text, text, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- Exportação dos dados do titular (JSON)
--   Fica de fora clinical_notes: são anotações privadas do profissional.
-- ---------------------------------------------------------------------------
create or replace function public._export_rows(p_table text, p_cols text[], p_user uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  result jsonb;
  cond text;
begin
  select string_agg(format('t.%I = $1', c), ' or ') into cond from unnest(p_cols) c;
  execute format(
    'select coalesce(jsonb_agg(to_jsonb(t)), ''[]''::jsonb) from public.%I t where %s', p_table, cond
  ) into result using p_user;
  return result;
end;
$$;
revoke execute on function public._export_rows(text, text[], uuid) from public, anon, authenticated;

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
      ('consentimentos', 'consents', array['user_id'])
    ) as v(label text, tbl text, cols text[])
  loop
    result := result || jsonb_build_object(spec.label, public._export_rows(spec.tbl, spec.cols, me));
  end loop;

  return result;
end;
$$;
revoke execute on function public.export_my_data() from public, anon;
grant execute on function public.export_my_data() to authenticated;

-- ---------------------------------------------------------------------------
-- Idade mínima: 18 anos para criar conta
-- ---------------------------------------------------------------------------
create or replace function public.enforce_adult_signup()
returns trigger language plpgsql set search_path = public as $$
declare
  born date;
begin
  begin
    born := nullif(new.raw_user_meta_data ->> 'birth_date', '')::date;
  exception when others then
    born := null;
  end;
  if born is null or born < date '1900-01-01' or born > (current_date - interval '18 years')::date then
    raise exception 'O NutriConnect é para maiores de 18 anos. Informe uma data de nascimento válida.'
      using errcode = '22023';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_adult_signup on auth.users;
create trigger enforce_adult_signup before insert on auth.users
  for each row execute function public.enforce_adult_signup();

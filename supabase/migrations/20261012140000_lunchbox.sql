-- Lancheira da semana (N8): lanche escolar de segunda a sexta para cada perfil infantil da trilha.
-- O responsável guarda o que a Nina precisa saber da criança (faixa etária, alergias, o que não
-- gosta, regras da escola, 1 ou 2 lanches por dia); a Nina completa a semana (uso de IA
-- "lunchbox") ou o responsável usa ideias prontas; a criança vê o lanche do dia na trilha e avalia.

-- Perfil infantil do próprio dono.
create or replace function public.owns_kid_profile(p_profile uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.trail_profiles
     where id = p_profile and owner_id = auth.uid() and kind = 'kid'
  );
$$;
revoke execute on function public.owns_kid_profile(uuid) from public, anon;
grant execute on function public.owns_kid_profile(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Sobre a criança (só o responsável vê)
-- ---------------------------------------------------------------------------
create table public.lunchbox_profiles (
  profile_id uuid primary key references public.trail_profiles (id) on delete cascade,
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  age_range text not null default '4-6' check (age_range in ('1-3', '4-6', '7-10', '11-14')),
  snacks smallint not null default 1 check (snacks in (1, 2)),
  allergies text not null default '' check (length(allergies) <= 300),
  dislikes text not null default '' check (length(dislikes) <= 300),
  school_rules text not null default '' check (length(school_rules) <= 300),
  updated_at timestamptz not null default now()
);
create trigger lunchbox_profiles_updated_at before update on public.lunchbox_profiles
  for each row execute function public.set_updated_at();

alter table public.lunchbox_profiles enable row level security;
create policy "lunchbox_profiles: responsável" on public.lunchbox_profiles
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and public.owns_kid_profile(profile_id));

-- ---------------------------------------------------------------------------
-- Lancheiras da semana
-- ---------------------------------------------------------------------------
create table public.lunchboxes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.trail_profiles (id) on delete cascade,
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  -- Segunda-feira da semana.
  week_start date not null check (extract(isodow from week_start) = 1),
  -- { "0-manha": { title, items[], prep, tip, emojis, source, rating }, ... }
  snacks jsonb not null default '{}'::jsonb
    check (jsonb_typeof(snacks) = 'object' and pg_column_size(snacks) < 50000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, week_start)
);
create index lunchboxes_owner_idx on public.lunchboxes (owner_id, week_start desc);
create trigger lunchboxes_updated_at before update on public.lunchboxes
  for each row execute function public.set_updated_at();

alter table public.lunchboxes enable row level security;
create policy "lunchboxes: responsável" on public.lunchboxes
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and public.owns_kid_profile(profile_id));

create or replace function public.lunchboxes_limit()
returns trigger language plpgsql set search_path = public as $$
begin
  if (select count(*) from public.lunchboxes where profile_id = new.profile_id) >= 120 then
    raise exception 'Limite de 120 lancheiras guardadas por criança.';
  end if;
  return new;
end;
$$;
create trigger lunchboxes_limit before insert on public.lunchboxes
  for each row execute function public.lunchboxes_limit();

-- ---------------------------------------------------------------------------
-- Uso de IA da lancheira
-- ---------------------------------------------------------------------------
alter table public.ai_usage drop constraint if exists ai_usage_kind_check;
alter table public.ai_usage add constraint ai_usage_kind_check
  check (kind in ('nina', 'summary', 'moderation', 'label', 'diary', 'fridge', 'menu', 'lunchbox'));

-- ─── Exportação de dados (LGPD) inclui a lancheira das crianças ───────────────
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
      ('avaliacoes_clinicas', 'clinical_assessments', array['patient_id']),
      ('planos_de_cuidado', 'care_plans', array['patient_id']),
      ('planos_de_cuidado_checkins', 'care_plan_checkins', array['patient_id']),
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
      ('consentimentos', 'consents', array['user_id']),
      ('lembretes', 'reminders', array['user_id']),
      ('preferencias_push', 'push_settings', array['user_id']),
      ('aparelhos_push', 'push_subscriptions', array['user_id']),
      ('agua_meta', 'water_settings', array['user_id']),
      ('agua_dias', 'water_days', array['user_id']),
      ('rotulos_lidos', 'label_scans', array['user_id']),
      ('receitas_guardadas', 'saved_recipes', array['user_id']),
      ('lista_de_compras', 'shopping_items', array['user_id']),
      ('cardapios_da_semana', 'weekly_menus', array['user_id']),
      ('lancheira_sobre_criancas', 'lunchbox_profiles', array['owner_id']),
      ('lancheiras', 'lunchboxes', array['owner_id'])
    ) as v(label, tbl, cols)
  loop
    result := result || jsonb_build_object(spec.label, public._export_rows(spec.tbl, spec.cols, me));
  end loop;

  return result;
end;
$$;
revoke execute on function public.export_my_data() from public, anon;
grant execute on function public.export_my_data() to authenticated;

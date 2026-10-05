-- Ferramentas da consulta, para todas as profissões da plataforma (nutrição, medicina, psicologia,
-- educação física, fisioterapia e enfermagem). O que é registrado na consulta fica no acompanhamento:
--
--  • clinical_assessments: avaliações com data e pontuação — sinais vitais, dor (EVA), questionários
--    validados (PHQ-9, GAD-7, PAR-Q…), testes funcionais. Podem ser respondidos pelo próprio paciente
--    durante a chamada. O paciente vê as que forem compartilhadas com ele.
--  • care_plans: planos de cuidado que o paciente segue em casa — treino, exercícios domiciliares,
--    tarefas entre sessões, cuidados, orientações e medicações em uso.
--  • care_plan_checkins: o paciente marca "feito hoje" e o profissional acompanha a adesão.

-- ─── Avaliações ──────────────────────────────────────────────────────────────
create table public.clinical_assessments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  professional_id uuid not null references public.professionals (user_id) on delete cascade,
  appointment_id uuid references public.appointments (id) on delete set null,
  kind text not null check (kind ~ '^[a-z0-9_]{2,30}$'),
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) < 20000),
  score numeric(7, 2),
  severity text check (severity is null or char_length(severity) <= 40),
  answered_by_patient boolean not null default false,
  shared_with_patient boolean not null default true,
  created_at timestamptz not null default now()
);
create index clinical_assessments_patient_idx
  on public.clinical_assessments (patient_id, kind, created_at desc);

alter table public.clinical_assessments enable row level security;
create policy "clinical_assessments: leitura" on public.clinical_assessments
  for select to authenticated using (
    professional_id = auth.uid() or (patient_id = auth.uid() and shared_with_patient)
  );
create policy "clinical_assessments: profissional registra" on public.clinical_assessments
  for insert to authenticated with check (
    professional_id = auth.uid() and public.has_active_link(patient_id)
  );
create policy "clinical_assessments: autor edita" on public.clinical_assessments
  for update to authenticated
  using (professional_id = auth.uid() and public.has_active_link(patient_id))
  with check (professional_id = auth.uid());
create policy "clinical_assessments: autor apaga" on public.clinical_assessments
  for delete to authenticated using (professional_id = auth.uid() and public.has_active_link(patient_id));

-- ─── Planos de cuidado ───────────────────────────────────────────────────────
create table public.care_plans (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  professional_id uuid not null references public.professionals (user_id) on delete cascade,
  appointment_id uuid references public.appointments (id) on delete set null,
  kind text not null check (kind in ('treino', 'exercicios', 'tarefas', 'cuidados', 'orientacoes', 'medicacoes')),
  title text not null check (char_length(title) between 1 and 120),
  notes text check (notes is null or char_length(notes) <= 4000),
  -- [{ "name": "...", "details": "3x12 / 20 min / 1 comprimido", "frequency": "3x por semana", "notes": "..." }]
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array' and pg_column_size(items) < 40000),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index care_plans_patient_idx on public.care_plans (patient_id, active, created_at desc);
create trigger care_plans_updated_at before update on public.care_plans
  for each row execute function public.set_updated_at();

alter table public.care_plans enable row level security;
-- Paciente, autor e os demais profissionais vinculados (cuidado em equipe) leem.
create policy "care_plans: leitura" on public.care_plans
  for select to authenticated using (
    patient_id = auth.uid() or professional_id = auth.uid() or public.has_active_link(patient_id)
  );
create policy "care_plans: profissional cria" on public.care_plans
  for insert to authenticated with check (
    professional_id = auth.uid() and public.has_active_link(patient_id)
  );
create policy "care_plans: autor edita" on public.care_plans
  for update to authenticated
  using (professional_id = auth.uid() and public.has_active_link(patient_id))
  with check (professional_id = auth.uid());
create policy "care_plans: autor apaga" on public.care_plans
  for delete to authenticated using (professional_id = auth.uid() and public.has_active_link(patient_id));

create table public.care_plan_checkins (
  plan_id uuid not null references public.care_plans (id) on delete cascade,
  patient_id uuid not null references public.profiles (id) on delete cascade,
  day date not null default current_date,
  created_at timestamptz not null default now(),
  primary key (plan_id, day)
);
alter table public.care_plan_checkins enable row level security;
create policy "care_plan_checkins: leitura" on public.care_plan_checkins
  for select to authenticated using (
    patient_id = auth.uid()
    or exists (select 1 from public.care_plans p where p.id = plan_id and p.professional_id = auth.uid())
  );
create policy "care_plan_checkins: paciente marca" on public.care_plan_checkins
  for insert to authenticated with check (
    patient_id = auth.uid()
    and exists (select 1 from public.care_plans p where p.id = plan_id and p.patient_id = auth.uid() and p.active)
  );
create policy "care_plan_checkins: paciente desmarca" on public.care_plan_checkins
  for delete to authenticated using (patient_id = auth.uid());

-- ─── Avisos ──────────────────────────────────────────────────────────────────
create or replace function public.trg_notify_care_plan()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.active and (tg_op = 'INSERT' or not old.active) then
    perform public.notify(new.patient_id, 'plano_cuidado', new.professional_id, 'care_plan', new.id::text,
      jsonb_build_object('title', new.title, 'kind', new.kind));
  end if;
  return new;
end;
$$;
create trigger care_plans_notify after insert or update of active on public.care_plans
  for each row execute function public.trg_notify_care_plan();

create or replace function public.trg_notify_assessment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.shared_with_patient and not new.answered_by_patient then
    perform public.notify(new.patient_id, 'avaliacao_registrada', new.professional_id, 'assessment', new.id::text,
      jsonb_build_object('kind', new.kind));
  end if;
  return new;
end;
$$;
create trigger clinical_assessments_notify after insert on public.clinical_assessments
  for each row execute function public.trg_notify_assessment();

-- ─── Exportação de dados (LGPD) inclui as tabelas novas ──────────────────────
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
      ('consentimentos', 'consents', array['user_id'])
    ) as v(label, tbl, cols)
  loop
    result := result || jsonb_build_object(spec.label, public._export_rows(spec.tbl, spec.cols, me));
  end loop;

  return result;
end;
$$;
revoke execute on function public.export_my_data() from public, anon;
grant execute on function public.export_my_data() to authenticated;

-- Realtime: as telas do acompanhamento se atualizam quando a outra ponta registra algo.
do $$
begin
  begin
    alter publication supabase_realtime add table public.clinical_assessments;
  exception when others then null;
  end;
  begin
    alter publication supabase_realtime add table public.care_plans;
  exception when others then null;
  end;
end $$;

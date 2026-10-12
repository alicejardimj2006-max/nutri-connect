-- Painel do profissional (M3): adesão dos pacientes (semáforo da semana e relatório de 30 dias),
-- quem está sem registrar há 7 dias e modelos de plano alimentar.

-- ---------------------------------------------------------------------------
-- Adesão: sinais da semana de cada paciente com vínculo ativo
-- ---------------------------------------------------------------------------
create or replace function public.adherence_overview(p_days integer default 7)
returns table (
  patient_id uuid,
  last_activity date,
  diary_days integer,
  goals_active integer,
  goal_days integer,
  water_days integer,
  care_active integer,
  care_days integer
)
language sql stable security definer set search_path = public as $$
  with params as (
    select (now() at time zone 'America/Sao_Paulo')::date as today,
           least(greatest(coalesce(p_days, 7), 1), 90) as days
  ),
  patients as (
    select distinct l.patient_id
      from public.care_links l
     where l.professional_id = auth.uid() and l.status = 'ativo'
  ),
  since as (select today - days + 1 as day from params)
  select p.patient_id,
         greatest(
           (select max((d.eaten_at at time zone 'America/Sao_Paulo')::date)
              from public.diary_entries d where d.patient_id = p.patient_id),
           (select max(c.day) from public.goal_checkins c
             where c.patient_id = p.patient_id and c.value > 0),
           (select max(w.day) from public.water_days w
             where w.user_id = p.patient_id and w.glasses > 0),
           (select max(k.day) from public.care_plan_checkins k where k.patient_id = p.patient_id)
         ) as last_activity,
         (select count(distinct (d.eaten_at at time zone 'America/Sao_Paulo')::date)::integer
            from public.diary_entries d
           where d.patient_id = p.patient_id
             and (d.eaten_at at time zone 'America/Sao_Paulo')::date >= (select day from since)),
         (select count(*)::integer from public.goals g
           where g.patient_id = p.patient_id and g.active),
         (select count(distinct c.day)::integer
            from public.goal_checkins c join public.goals g on g.id = c.goal_id
           where c.patient_id = p.patient_id and g.active
             and c.value >= g.target_value and c.day >= (select day from since)),
         (select count(*)::integer from public.water_days w
           where w.user_id = p.patient_id and w.glasses >= w.goal
             and w.day >= (select day from since)),
         (select count(*)::integer from public.care_plans cp
           where cp.patient_id = p.patient_id and cp.professional_id = auth.uid() and cp.active),
         (select count(distinct k.day)::integer
            from public.care_plan_checkins k join public.care_plans cp on cp.id = k.plan_id
           where k.patient_id = p.patient_id and cp.professional_id = auth.uid()
             and k.day >= (select day from since))
    from patients p;
$$;
revoke execute on function public.adherence_overview(integer) from public, anon;
grant execute on function public.adherence_overview(integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Adesão dia a dia de um paciente (relatório)
-- ---------------------------------------------------------------------------
create or replace function public.adherence_daily(p_patient uuid, p_days integer default 30)
returns table (
  day date,
  diary integer,
  goals_done integer,
  goals_total integer,
  water_glasses integer,
  water_goal integer,
  care integer
)
language plpgsql stable security definer set search_path = public as $$
declare
  today date := (now() at time zone 'America/Sao_Paulo')::date;
  n integer := least(greatest(coalesce(p_days, 30), 7), 90);
begin
  if not public.has_active_link(p_patient) then
    raise exception 'Sem vínculo ativo com este paciente.' using errcode = '42501';
  end if;
  return query
  select s.day::date,
         (select count(*)::integer from public.diary_entries d
           where d.patient_id = p_patient
             and (d.eaten_at at time zone 'America/Sao_Paulo')::date = s.day::date),
         (select count(*)::integer
            from public.goal_checkins c join public.goals g on g.id = c.goal_id
           where c.patient_id = p_patient and c.day = s.day::date and g.active
             and c.value >= g.target_value),
         (select count(*)::integer from public.goals g
           where g.patient_id = p_patient and g.active),
         coalesce((select w.glasses::integer from public.water_days w
                    where w.user_id = p_patient and w.day = s.day::date), 0),
         (select w.goal::integer from public.water_days w
           where w.user_id = p_patient and w.day = s.day::date),
         (select count(*)::integer
            from public.care_plan_checkins k join public.care_plans cp on cp.id = k.plan_id
           where k.patient_id = p_patient and k.day = s.day::date
             and cp.professional_id = auth.uid())
    from generate_series(today - n + 1, today, interval '1 day') as s(day)
   order by 1;
end;
$$;
revoke execute on function public.adherence_daily(uuid, integer) from public, anon;
grant execute on function public.adherence_daily(uuid, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Modelos de plano alimentar (do profissional, sem dados do paciente)
-- ---------------------------------------------------------------------------
create table public.meal_plan_templates (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null default auth.uid()
    references public.professionals (user_id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 120),
  target_kcal integer,
  target_protein_g integer,
  target_carbs_g integer,
  target_fat_g integer,
  guidelines text check (guidelines is null or length(guidelines) <= 4000),
  -- [{ name, time_of_day, position, notes, items: [{ key, substitute_of, food_id, food_name,
  --    quantity_g, household_measure, kcal, protein_g, carbs_g, fat_g, position, notes }] }]
  meals jsonb not null default '[]'::jsonb
    check (jsonb_typeof(meals) = 'array' and pg_column_size(meals) < 200000),
  created_at timestamptz not null default now()
);
create index meal_plan_templates_pro_idx on public.meal_plan_templates (professional_id, created_at desc);

alter table public.meal_plan_templates enable row level security;
create policy "meal_plan_templates: dono lê" on public.meal_plan_templates
  for select to authenticated using (professional_id = auth.uid());
create policy "meal_plan_templates: dono renomeia" on public.meal_plan_templates
  for update to authenticated using (professional_id = auth.uid())
  with check (professional_id = auth.uid());
create policy "meal_plan_templates: dono apaga" on public.meal_plan_templates
  for delete to authenticated using (professional_id = auth.uid());
-- Criação só pela função abaixo (copia o plano com segurança).

-- Salva um plano do próprio profissional como modelo.
create or replace function public.save_meal_plan_template(p_plan uuid, p_title text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  src public.meal_plans;
  new_id uuid;
begin
  select * into src from public.meal_plans where id = p_plan and professional_id = auth.uid();
  if src.id is null then
    raise exception 'Plano não encontrado.' using errcode = '42501';
  end if;
  if (select count(*) from public.meal_plan_templates where professional_id = auth.uid()) >= 100 then
    raise exception 'Limite de 100 modelos.';
  end if;
  insert into public.meal_plan_templates (
    professional_id, title, target_kcal, target_protein_g, target_carbs_g, target_fat_g,
    guidelines, meals
  ) values (
    auth.uid(), left(coalesce(nullif(trim(p_title), ''), src.title), 120), src.target_kcal,
    src.target_protein_g, src.target_carbs_g, src.target_fat_g, src.guidelines,
    coalesce((
      select jsonb_agg(jsonb_build_object(
               'name', m.name, 'time_of_day', m.time_of_day, 'position', m.position,
               'notes', m.notes,
               'items', coalesce((
                 select jsonb_agg(jsonb_build_object(
                          'key', i.id, 'substitute_of', i.substitute_of, 'food_id', i.food_id,
                          'food_name', i.food_name, 'quantity_g', i.quantity_g,
                          'household_measure', i.household_measure, 'kcal', i.kcal,
                          'protein_g', i.protein_g, 'carbs_g', i.carbs_g, 'fat_g', i.fat_g,
                          'position', i.position, 'notes', i.notes)
                        order by (i.substitute_of is not null), i.position)
                   from public.meal_plan_items i where i.meal_id = m.id), '[]'::jsonb))
             order by m.position)
        from public.meal_plan_meals m where m.plan_id = p_plan), '[]'::jsonb)
  ) returning id into new_id;
  return new_id;
end;
$$;
revoke execute on function public.save_meal_plan_template(uuid, text) from public, anon;
grant execute on function public.save_meal_plan_template(uuid, text) to authenticated;

-- Cria um plano (rascunho) para um paciente a partir de um modelo do profissional.
create or replace function public.create_plan_from_template(
  p_template uuid, p_patient uuid, p_title text default null
)
returns public.meal_plans
language plpgsql security definer set search_path = public as $$
declare
  tpl public.meal_plan_templates;
  dst public.meal_plans;
  meal jsonb;
  it jsonb;
  new_meal uuid;
  new_item uuid;
  item_map jsonb := '{}'::jsonb;
begin
  select * into tpl from public.meal_plan_templates
   where id = p_template and professional_id = auth.uid();
  if tpl.id is null then
    raise exception 'Modelo não encontrado.' using errcode = '42501';
  end if;
  if not public.has_active_link(p_patient) then
    raise exception 'Sem vínculo ativo com este paciente.' using errcode = '42501';
  end if;

  insert into public.meal_plans (
    patient_id, professional_id, title, status, target_kcal, target_protein_g, target_carbs_g,
    target_fat_g, guidelines
  ) values (
    p_patient, auth.uid(), left(coalesce(nullif(trim(p_title), ''), tpl.title), 120), 'rascunho',
    tpl.target_kcal, tpl.target_protein_g, tpl.target_carbs_g, tpl.target_fat_g, tpl.guidelines
  ) returning * into dst;

  for meal in select * from jsonb_array_elements(tpl.meals) loop
    insert into public.meal_plan_meals (plan_id, name, time_of_day, position, notes)
    values (dst.id, meal ->> 'name', (meal ->> 'time_of_day')::time,
            coalesce((meal ->> 'position')::integer, 0), meal ->> 'notes')
    returning id into new_meal;
    -- Itens principais vêm antes das substituições (ordem salva no modelo).
    for it in select * from jsonb_array_elements(coalesce(meal -> 'items', '[]'::jsonb)) loop
      insert into public.meal_plan_items (
        meal_id, substitute_of, food_id, food_name, quantity_g, household_measure,
        kcal, protein_g, carbs_g, fat_g, position, notes
      ) values (
        new_meal, (item_map ->> (it ->> 'substitute_of'))::uuid,
        (select fo.id from public.foods fo where fo.id = (it ->> 'food_id')::bigint),
        it ->> 'food_name', (it ->> 'quantity_g')::numeric,
        it ->> 'household_measure', coalesce((it ->> 'kcal')::numeric, 0),
        coalesce((it ->> 'protein_g')::numeric, 0), coalesce((it ->> 'carbs_g')::numeric, 0),
        coalesce((it ->> 'fat_g')::numeric, 0), coalesce((it ->> 'position')::integer, 0),
        it ->> 'notes'
      ) returning id into new_item;
      item_map := item_map || jsonb_build_object(it ->> 'key', new_item);
    end loop;
  end loop;
  return dst;
end;
$$;
revoke execute on function public.create_plan_from_template(uuid, uuid, text) from public, anon;
grant execute on function public.create_plan_from_template(uuid, uuid, text) to authenticated;

-- ─── Exportação de dados (LGPD) inclui os modelos de plano do profissional ───────────────
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
      ('lancheiras', 'lunchboxes', array['owner_id']),
      ('modelos_de_plano', 'meal_plan_templates', array['professional_id'])
    ) as v(label, tbl, cols)
  loop
    result := result || jsonb_build_object(spec.label, public._export_rows(spec.tbl, spec.cols, me));
  end loop;

  return result;
end;
$$;
revoke execute on function public.export_my_data() from public, anon;
grant execute on function public.export_my_data() to authenticated;

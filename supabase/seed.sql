-- =============================================================================
-- NutriConnect — dados de demonstração.
-- Todas as contas usam a senha: NutriDemo@2026
--
--   admin@nutriconnect.com.br                 admin da plataforma
--   maria.lorena@demo.nutriconnect.com.br     nutricionista (CRN-3)
--   pedro.costa@demo.nutriconnect.com.br      nutricionista (CRN-4)
--   helena.souza@demo.nutriconnect.com.br     psicóloga (CRP)
--   ana.prado@demo.nutriconnect.com.br        paciente (Maria + Helena)
--   carlos.eduardo@demo.nutriconnect.com.br   paciente (Pedro)
--   beatriz.lima@demo.nutriconnect.com.br     paciente (pedido pendente com Maria)
--
-- Os UUIDs fixos batem com os ids usados pelos dados locais de comunidades
-- (ver SEED_USER_IDS em src/lib/community.ts).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Contas
-- ---------------------------------------------------------------------------
with demo (id, email, name, meta) as (values
  ('00000000-0000-4000-a000-000000000900'::uuid, 'admin@nutriconnect.com.br', 'Equipe NutriConnect', '{}'::jsonb),
  ('00000000-0000-4000-a000-000000000001'::uuid, 'maria.lorena@demo.nutriconnect.com.br', 'Maria Lorena', '{}'::jsonb),
  ('00000000-0000-4000-a000-000000000002'::uuid, 'pedro.costa@demo.nutriconnect.com.br', 'Pedro Costa', '{}'::jsonb),
  ('00000000-0000-4000-a000-000000000003'::uuid, 'helena.souza@demo.nutriconnect.com.br', 'Helena Souza', '{}'::jsonb),
  ('00000000-0000-4000-a000-000000000101'::uuid, 'ana.prado@demo.nutriconnect.com.br', 'Ana Prado',
    '{"goal": "Emagrecimento consciente", "phone": "(11) 98888-1234", "birth_date": "1996-04-12"}'::jsonb),
  ('00000000-0000-4000-a000-000000000102'::uuid, 'carlos.eduardo@demo.nutriconnect.com.br', 'Carlos Eduardo',
    '{"goal": "Ganho de massa muscular", "phone": "(21) 97777-4321", "birth_date": "1990-09-03"}'::jsonb),
  ('00000000-0000-4000-a000-000000000103'::uuid, 'beatriz.lima@demo.nutriconnect.com.br', 'Beatriz Lima',
    '{"goal": "Qualidade de vida", "birth_date": "2001-01-20"}'::jsonb)
)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000', id, 'authenticated', 'authenticated', email,
  extensions.crypt('NutriDemo@2026', extensions.gen_salt('bf')), now() - interval '120 days',
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  meta || jsonb_build_object('name', name),
  now() - interval '120 days', now(), '', '', '', ''
from demo
on conflict (id) do nothing;

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text,
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
       'email', now(), now(), now()
  from auth.users u
 where u.id::text like '00000000-0000-4000-a000-%'
   and not exists (select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email');

insert into public.platform_admins (user_id)
values ('00000000-0000-4000-a000-000000000900') on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Perfis (o trigger handle_new_user já criou as linhas)
-- ---------------------------------------------------------------------------
update public.profiles p set bio = v.bio, role = v.role::public.app_role
from (values
  ('00000000-0000-4000-a000-000000000001'::uuid, 'Apaixonada por descomplicar a cozinha e criar relações pacíficas com o prato.', 'profissional'),
  ('00000000-0000-4000-a000-000000000002'::uuid, 'Focado em alimentação para o dia a dia moderno, rotina ativa e planejamento realista para quem não tem tempo a perder.', 'profissional'),
  ('00000000-0000-4000-a000-000000000003'::uuid, 'Psicóloga com foco em comportamento alimentar, fome emocional e uma relação mais gentil com a comida.', 'profissional'),
  ('00000000-0000-4000-a000-000000000101'::uuid, 'Em busca de mais calma à mesa, testando receitas simples e construindo novos hábitos passo a passo.', 'paciente'),
  ('00000000-0000-4000-a000-000000000102'::uuid, 'Testando receitas práticas para a semana e trocando ideias com a comunidade.', 'paciente'),
  ('00000000-0000-4000-a000-000000000103'::uuid, 'Aprendendo a comer com atenção e a escutar os sinais do corpo, sem culpa.', 'paciente')
) as v (id, bio, role)
where p.id = v.id;

update public.profile_private set sex = 'feminino'
 where id in ('00000000-0000-4000-a000-000000000101', '00000000-0000-4000-a000-000000000103');
update public.profile_private set sex = 'masculino'
 where id = '00000000-0000-4000-a000-000000000102';

insert into public.professionals (
  user_id, profession, council, registration, uf, specialties, verified_at, headline,
  consultation_price_cents, consultation_duration_min, offers_presential, offers_online, address, online_instructions
) values
  ('00000000-0000-4000-a000-000000000001', 'Nutricionista', 'CRN-3', '12345', 'SP',
   array['Educação alimentar', 'Alimentação em família'], now() - interval '60 days',
   'Nutrição comportamental sem terrorismo nutricional', 18000, 60, true, true,
   'Rua Augusta, 1500, sala 32 — Consolação, São Paulo/SP',
   'Você receberá o link da chamada de vídeo no dia da consulta.'),
  ('00000000-0000-4000-a000-000000000002', 'Nutricionista', 'CRN-4', '23456', 'RJ',
   array['Cozinha do dia a dia', 'Saúde e condições clínicas'], now() - interval '45 days',
   'Nutrição esportiva e rotina corrida', 20000, 50, true, true,
   'Av. Rio Branco, 156, sala 1210 — Centro, Rio de Janeiro/RJ',
   'Atendimento on-line pelo Google Meet.'),
  ('00000000-0000-4000-a000-000000000003', 'Psicóloga', 'CRP', '06/54321', 'SP',
   array['Relação com a comida', 'Bem-estar e sono'], now() - interval '30 days',
   'Comportamento alimentar e fome emocional', 15000, 50, false, true, null,
   'Sessões on-line; o link chega por mensagem.')
on conflict (user_id) do nothing;

insert into public.verification_requests (
  user_id, full_name, profession, council, registration, uf, specialties,
  document_path, selfie_path, status, submitted_at, reviewed_at, reviewed_by
)
select p.user_id, pr.name, p.profession, p.council, p.registration, p.uf, p.specialties,
       p.user_id || '/documento.jpg', p.user_id || '/selfie.jpg', 'aprovado',
       p.verified_at - interval '2 days', p.verified_at, '00000000-0000-4000-a000-000000000900'
  from public.professionals p
  join public.profiles pr on pr.id = p.user_id
 where p.user_id::text like '00000000-0000-4000-a000-%'
   and not exists (select 1 from public.verification_requests v where v.user_id = p.user_id);

-- ---------------------------------------------------------------------------
-- Agenda semanal
-- ---------------------------------------------------------------------------
insert into public.availability_rules (professional_id, weekday, start_time, end_time, modality)
select * from (values
  ('00000000-0000-4000-a000-000000000001'::uuid, 1, time '08:00', time '12:00', 'ambos'),
  ('00000000-0000-4000-a000-000000000001'::uuid, 2, time '14:00', time '18:00', 'online'),
  ('00000000-0000-4000-a000-000000000001'::uuid, 3, time '08:00', time '12:00', 'ambos'),
  ('00000000-0000-4000-a000-000000000001'::uuid, 4, time '14:00', time '18:00', 'online'),
  ('00000000-0000-4000-a000-000000000001'::uuid, 5, time '08:00', time '12:00', 'presencial'),
  ('00000000-0000-4000-a000-000000000002'::uuid, 1, time '09:00', time '17:20', 'ambos'),
  ('00000000-0000-4000-a000-000000000002'::uuid, 3, time '09:00', time '17:20', 'ambos'),
  ('00000000-0000-4000-a000-000000000002'::uuid, 5, time '09:00', time '12:20', 'online'),
  ('00000000-0000-4000-a000-000000000003'::uuid, 2, time '10:00', time '16:40', 'online'),
  ('00000000-0000-4000-a000-000000000003'::uuid, 4, time '10:00', time '16:40', 'online')
) as v
where not exists (select 1 from public.availability_rules r where r.professional_id::text like '00000000-0000-4000-a000-%');

-- ---------------------------------------------------------------------------
-- Tudo o que é clínico só entra uma vez
-- ---------------------------------------------------------------------------
do $seed$
declare
  maria constant uuid := '00000000-0000-4000-a000-000000000001';
  pedro constant uuid := '00000000-0000-4000-a000-000000000002';
  helena constant uuid := '00000000-0000-4000-a000-000000000003';
  ana constant uuid := '00000000-0000-4000-a000-000000000101';
  carlos constant uuid := '00000000-0000-4000-a000-000000000102';
  bea constant uuid := '00000000-0000-4000-a000-000000000103';
  tz constant text := 'America/Sao_Paulo';
  today date := (now() at time zone 'America/Sao_Paulo')::date;
  a1 uuid; a2 uuid; a3 uuid; a4 uuid; c1 uuid; c2 uuid;
  plan uuid; main uuid;
  g_water uuid; g_fruit uuid; g_walk uuid;
  e1 uuid;
  d integer;
begin
  if exists (select 1 from public.care_links where patient_id = ana) then
    raise notice 'Seed clínico já aplicado; pulando.';
    return;
  end if;

  -- Vínculos ------------------------------------------------------------------
  insert into public.care_links (patient_id, professional_id, status, origin, created_at, responded_at) values
    (ana, maria, 'ativo', 'convite', now() - interval '90 days', now() - interval '90 days'),
    (ana, helena, 'ativo', 'comunidade', now() - interval '20 days', now() - interval '19 days'),
    (carlos, pedro, 'ativo', 'solicitacao', now() - interval '40 days', now() - interval '39 days');
  insert into public.care_links (patient_id, professional_id, status, origin, community_slug, message, created_at) values
    (bea, maria, 'pendente', 'comunidade', 'educacao-alimentar',
     'Oi, Maria! Te acompanho na comunidade e queria começar um acompanhamento para organizar a alimentação da família.',
     now() - interval '1 day');

  insert into public.care_invites (code, professional_id, invitee_name, note)
  values ('MARIA2026', maria, 'Novo paciente', 'Convite de demonstração');

  -- Consultas (horários no fuso de São Paulo) ---------------------------------
  insert into public.appointments (professional_id, patient_id, starts_at, ends_at, modality, status, location, price_cents,
    summary_for_patient, created_by, created_at)
  values (maria, ana, ((today - 84) + time '09:00') at time zone tz, ((today - 84) + time '10:00') at time zone tz,
    'presencial', 'realizada', 'Rua Augusta, 1500, sala 32', 18000,
    'Primeira consulta! Combinamos começar pelo café da manhã e pela água. Seu plano alimentar já está no app.',
    maria, now() - interval '90 days')
  returning id into a1;
  insert into public.appointments (professional_id, patient_id, starts_at, ends_at, modality, status, meeting_url, price_cents,
    summary_for_patient, created_by, created_at)
  values (maria, ana, ((today - 56) + time '15:00') at time zone tz, ((today - 56) + time '16:00') at time zone tz,
    'online', 'realizada', 'https://meet.google.com/demo-ana-2', 18000,
    'Ótima evolução! Mantivemos o plano e acrescentamos a meta de caminhada.',
    ana, now() - interval '63 days')
  returning id into a2;
  insert into public.appointments (professional_id, patient_id, starts_at, ends_at, modality, status, location, price_cents,
    summary_for_patient, created_by, created_at)
  values (maria, ana, ((today - 28) + time '09:00') at time zone tz, ((today - 28) + time '10:00') at time zone tz,
    'presencial', 'realizada', 'Rua Augusta, 1500, sala 32', 18000,
    'Ajustamos o jantar para ficar mais prático nos dias corridos. Novo plano publicado.',
    ana, now() - interval '35 days')
  returning id into a3;
  insert into public.appointments (professional_id, patient_id, starts_at, ends_at, modality, status, meeting_url, price_cents,
    patient_notes, created_by, created_at)
  values (maria, ana, ((today + 3) + time '15:00') at time zone tz, ((today + 3) + time '16:00') at time zone tz,
    'online', 'confirmada', 'https://meet.google.com/demo-ana-4', 18000,
    'Queria conversar sobre lanches para levar ao trabalho.', ana, now() - interval '5 days')
  returning id into a4;

  insert into public.appointments (professional_id, patient_id, starts_at, ends_at, modality, status, meeting_url, price_cents, created_by, created_at)
  values (helena, ana, ((today - 14) + time '11:00') at time zone tz, ((today - 14) + time '11:50') at time zone tz,
    'online', 'realizada', 'https://meet.google.com/demo-helena', 15000, ana, now() - interval '19 days');

  insert into public.appointments (professional_id, patient_id, starts_at, ends_at, modality, status, location, price_cents,
    summary_for_patient, created_by, created_at)
  values (pedro, carlos, ((today - 35) + time '10:00') at time zone tz, ((today - 35) + time '10:50') at time zone tz,
    'presencial', 'realizada', 'Av. Rio Branco, 156, sala 1210', 20000,
    'Distribuímos a proteína ao longo do dia e montamos o pré-treino.', carlos, now() - interval '40 days')
  returning id into c1;
  insert into public.appointments (professional_id, patient_id, starts_at, ends_at, modality, status, meeting_url, price_cents,
    created_by, created_at)
  values (pedro, carlos, ((today - 7) + time '14:00') at time zone tz, ((today - 7) + time '14:50') at time zone tz,
    'online', 'faltou', 'https://meet.google.com/demo-carlos-2', 20000, carlos, now() - interval '12 days');
  insert into public.appointments (professional_id, patient_id, starts_at, ends_at, modality, status, meeting_url, price_cents,
    created_by, created_at)
  values (pedro, carlos, ((today + 6) + time '09:00') at time zone tz, ((today + 6) + time '09:50') at time zone tz,
    'online', 'agendada', 'https://meet.google.com/demo-carlos-3', 20000, carlos, now() - interval '2 days')
  returning id into c2;

  insert into public.appointments (professional_id, patient_id, starts_at, ends_at, modality, status, price_cents,
    patient_notes, created_by, created_at)
  values (maria, bea, ((today + 8) + time '10:00') at time zone tz, ((today + 8) + time '11:00') at time zone tz,
    'presencial', 'agendada', 18000, 'Primeira consulta. Tenho dois filhos pequenos.', bea, now() - interval '1 day');

  -- Pagamentos ----------------------------------------------------------------
  insert into public.payments (appointment_id, patient_id, professional_id, amount_cents, platform_fee_cents,
    status, provider, method, paid_at, created_at)
  select a.id, a.patient_id, a.professional_id, a.price_cents,
         case when a.created_by = a.patient_id then round(a.price_cents * 0.10) else 0 end,
         'aprovado',
         case when a.created_by = a.patient_id then 'mercado_pago' else 'manual' end,
         case when a.created_by = a.patient_id then 'pix' else 'dinheiro' end,
         a.created_at + interval '10 minutes', a.created_at
    from public.appointments a
   where a.patient_id in (ana, carlos) and a.status in ('realizada', 'confirmada', 'faltou');
  insert into public.payments (appointment_id, patient_id, professional_id, amount_cents, status, provider, created_at)
  values (c2, carlos, pedro, 20000, 'pendente', 'mercado_pago', now() - interval '2 days');

  -- Anamnese ------------------------------------------------------------------
  insert into public.anamneses (patient_id, professional_id, data, created_at) values (ana, maria, '{
    "chiefComplaint": "Ganho de peso nos últimos 2 anos e muita fome à noite.",
    "goals": "Perder peso sem dieta restritiva e ter mais disposição.",
    "clinicalHistory": {
      "conditions": ["Resistência à insulina (em acompanhamento)"],
      "surgeries": "",
      "medications": "Anticoncepcional oral",
      "supplements": "Vitamina D 2.000 UI/dia",
      "allergies": "",
      "intolerances": "Desconforto com leite integral"
    },
    "familyHistory": "Mãe com diabetes tipo 2; pai hipertenso.",
    "lifestyle": {
      "occupation": "Analista administrativa (home office 3x por semana)",
      "physicalActivity": "Sedentária; começou caminhadas leves",
      "sleepHours": 6,
      "sleepQuality": "Acorda cansada",
      "waterLiters": 0.8,
      "smoking": false,
      "alcohol": "Vinho aos fins de semana",
      "bowel": "Intestino preso (a cada 2 dias)",
      "stress": "Alto no trabalho"
    },
    "eating": {
      "mealsPerDay": 3,
      "whoCooks": "Ela mesma, aos fins de semana",
      "eatsOut": "Delivery 3 a 4 vezes por semana",
      "preferences": "Massas, frango, frutas vermelhas",
      "aversions": "Fígado, jiló",
      "cravings": "Doces à noite",
      "recall24h": "Café preto às 9h; almoço às 14h (marmita de arroz, feijão e frango); pacote de biscoito às 17h; pizza às 21h."
    },
    "labNotes": "Glicemia de jejum 102 mg/dL; insulina 18 µUI/mL; vitamina D 24 ng/mL.",
    "notes": "Motivada, mas com histórico de dietas restritivas abandonadas."
  }'::jsonb, now() - interval '84 days');

  -- Evolução clínica ----------------------------------------------------------
  insert into public.clinical_notes (patient_id, professional_id, appointment_id, subjective, objective, assessment, plan, created_at) values
    (ana, maria, a1,
     'Relata fome intensa à noite e pular o café da manhã. Muito cansaço.',
     'Peso 78,4 kg; IMC 28,8; cintura 92 cm; %G 34,1 (JP3).',
     'Sobrepeso com adiposidade central; padrão de restrição diurna e compensação noturna.',
     'Estruturar café da manhã e lanche da tarde; meta de água; plano de 1.600 kcal. Retorno em 4 semanas.',
     now() - interval '84 days'),
    (ana, maria, a2,
     'Conseguiu tomar café da manhã quase todos os dias. Menos beliscos à noite.',
     'Peso 76,9 kg (−1,5 kg); cintura 90 cm.',
     'Boa adesão; ainda pouca ingestão de água.',
     'Manter plano; incluir caminhada 3x/semana; reforçar hidratação.',
     now() - interval '56 days'),
    (ana, maria, a3,
     'Dias corridos dificultam o jantar. Intestino melhorou.',
     'Peso 75,8 kg; cintura 88 cm; %G 32,4.',
     'Evolução consistente (−2,6 kg em 8 semanas).',
     'Jantar mais prático com substituições; nova versão do plano publicada (1.500 kcal).',
     now() - interval '28 days');

  insert into public.clinical_notes (patient_id, professional_id, appointment_id, subjective, assessment, plan, created_at)
  select carlos, pedro, c1,
         'Treina musculação 5x/semana, sente pouca energia no treino da noite.',
         'Baixa ingestão proteica no café e lanche.',
         'Plano de 2.800 kcal com 1,8 g/kg de proteína; pré-treino com carboidrato.',
         now() - interval '35 days';

  -- Antropometria -------------------------------------------------------------
  insert into public.anthropometrics (patient_id, professional_id, appointment_id, measured_at, weight_kg, height_cm,
    circumferences, skinfolds, body_fat_protocol, body_fat_pct, activity_factor, bmr_formula, bmr_kcal, tdee_kcal, created_at) values
    (ana, maria, a1, today - 84, 78.4, 165.0, '{"waist": 92, "hip": 108, "arm": 32, "neck": 34}',
     '{"triceps": 28, "suprailiac": 30, "thigh": 36}', 'jp3', 34.1, 1.40, 'mifflin', 1504, 2106, now() - interval '84 days'),
    (ana, maria, a2, today - 56, 76.9, 165.0, '{"waist": 90, "hip": 106, "arm": 31.5, "neck": 34}',
     '{"triceps": 27, "suprailiac": 28, "thigh": 35}', 'jp3', 33.3, 1.40, 'mifflin', 1489, 2085, now() - interval '56 days'),
    (ana, maria, a3, today - 28, 75.8, 165.0, '{"waist": 88, "hip": 105, "arm": 31, "neck": 33.5}',
     '{"triceps": 25, "suprailiac": 26, "thigh": 33}', 'jp3', 32.4, 1.55, 'mifflin', 1478, 2291, now() - interval '28 days');
  insert into public.anthropometrics (patient_id, measured_at, weight_kg, circumferences, notes, created_at) values
    (ana, today - 14, 75.3, '{}', 'Balança de casa, em jejum', now() - interval '14 days'),
    (ana, today - 2, 74.9, '{"waist": 87}', 'Balança de casa, em jejum', now() - interval '2 days');
  insert into public.anthropometrics (patient_id, professional_id, appointment_id, measured_at, weight_kg, height_cm,
    circumferences, body_fat_protocol, body_fat_pct, activity_factor, bmr_formula, bmr_kcal, tdee_kcal, created_at) values
    (carlos, pedro, c1, today - 35, 72.0, 178.0, '{"waist": 80, "arm": 33, "chest": 98}', 'bioimpedancia', 15.2,
     1.725, 'mifflin', 1698, 2929, now() - interval '35 days');

  -- Plano alimentar -----------------------------------------------------------
  create temporary table seed_items (meal_pos int, meal_name text, meal_time time, food text, grams numeric,
    measure text, item_pos int, sub_of_pos int) on commit drop;
  insert into seed_items values
    (0, 'Café da manhã', '07:30', 'Pão, trigo, forma, integral', 50, '2 fatias', 0, null),
    (0, 'Café da manhã', '07:30', 'Aveia, flocos, crua', 30, '3 colheres de sopa', 1, 0),
    (0, 'Café da manhã', '07:30', 'Ovo, de galinha, inteiro, cozido/10minutos', 50, '1 unidade', 2, null),
    (0, 'Café da manhã', '07:30', 'Queijo, minas, frescal', 30, '1 fatia média', 3, null),
    (0, 'Café da manhã', '07:30', 'Banana, prata, crua', 70, '1 unidade', 4, null),
    (0, 'Café da manhã', '07:30', 'Café, infusão 10%', 100, '1 xícara', 5, null),
    (1, 'Lanche da manhã', '10:00', 'Maçã, Fuji, com casca, crua', 130, '1 unidade média', 0, null),
    (1, 'Lanche da manhã', '10:00', 'Castanha-do-Brasil, crua', 8, '2 unidades', 1, null),
    (2, 'Almoço', '12:30', 'Arroz, integral, cozido', 100, '4 colheres de sopa', 0, null),
    (2, 'Almoço', '12:30', 'Batata, doce, cozida', 150, '1 unidade média', 1, 0),
    (2, 'Almoço', '12:30', 'Feijão, carioca, cozido', 86, '1 concha média', 2, null),
    (2, 'Almoço', '12:30', 'Frango, peito, sem pele, grelhado', 100, '1 filé médio', 3, null),
    (2, 'Almoço', '12:30', 'Brócolis, cozido', 60, '3 ramos', 4, null),
    (2, 'Almoço', '12:30', 'Alface, crespa, crua', 30, '5 folhas', 5, null),
    (2, 'Almoço', '12:30', 'Tomate, com semente, cru', 50, '4 fatias', 6, null),
    (2, 'Almoço', '12:30', 'Azeite, de oliva, extra virgem', 5, '1 colher de chá', 7, null),
    (3, 'Lanche da tarde', '16:00', 'Iogurte, natural, desnatado', 170, '1 pote', 0, null),
    (3, 'Lanche da tarde', '16:00', 'Aveia, flocos, crua', 15, '1 colher de sopa cheia', 1, null),
    (3, 'Lanche da tarde', '16:00', 'Banana, prata, crua', 70, '1 unidade', 2, null),
    (4, 'Jantar', '19:30', 'Arroz, integral, cozido', 80, '3 colheres de sopa', 0, null),
    (4, 'Jantar', '19:30', 'Frango, peito, sem pele, grelhado', 100, '1 filé médio', 1, null),
    (4, 'Jantar', '19:30', 'Ovo, de galinha, inteiro, cozido/10minutos', 100, '2 unidades', 2, 1),
    (4, 'Jantar', '19:30', 'Abobrinha, italiana, cozida', 80, '4 colheres de sopa', 3, null),
    (4, 'Jantar', '19:30', 'Cenoura, crua', 40, '2 colheres de sopa ralada', 4, null),
    (4, 'Jantar', '19:30', 'Azeite, de oliva, extra virgem', 5, '1 colher de chá', 5, null);

  insert into public.meal_plans (patient_id, professional_id, title, status, starts_on, target_kcal,
    target_protein_g, target_carbs_g, target_fat_g, guidelines, published_at, created_at)
  values (ana, maria, 'Plano alimentar — fase 2', 'ativo', today - 28, 1500, 105, 180, 42,
    E'• Beba pelo menos 2 litros de água por dia; deixe uma garrafa sempre por perto.\n• Mastigue devagar e faça as refeições sem telas sempre que possível.\n• Os itens com "ou" podem ser trocados entre si na mesma refeição.\n• Fim de semana: uma refeição livre, sem culpa.',
    now() - interval '28 days', now() - interval '28 days')
  returning id into plan;

  declare
    m record;
    it record;
    meal_id uuid;
    ids uuid[];
  begin
    for m in select distinct meal_pos, meal_name, meal_time from seed_items order by meal_pos loop
      insert into public.meal_plan_meals (plan_id, name, time_of_day, position)
      values (plan, m.meal_name, m.meal_time, m.meal_pos)
      returning id into meal_id;
      ids := array[]::uuid[];
      for it in
        select s.*, f.id as food_id, f.kcal, f.protein_g, f.carbs_g, f.fat_g
          from seed_items s join public.foods f on f.source = 'TACO' and f.name = s.food
         where s.meal_pos = m.meal_pos
         order by s.item_pos
      loop
        insert into public.meal_plan_items (meal_id, substitute_of, food_id, food_name, quantity_g, household_measure,
          kcal, protein_g, carbs_g, fat_g, position)
        values (meal_id, case when it.sub_of_pos is not null then ids[it.sub_of_pos + 1] end,
          it.food_id, it.food, it.grams, it.measure,
          round(it.kcal * it.grams / 100, 1), round(it.protein_g * it.grams / 100, 1),
          round(it.carbs_g * it.grams / 100, 1), round(it.fat_g * it.grams / 100, 1), it.item_pos)
        returning id into main;
        ids := ids || main;
      end loop;
    end loop;
  end;

  -- Primeira versão (arquivada), para mostrar o histórico.
  insert into public.meal_plans (patient_id, professional_id, title, status, starts_on, ends_on, target_kcal,
    target_protein_g, target_carbs_g, target_fat_g, guidelines, published_at, created_at)
  values (ana, maria, 'Plano alimentar — fase 1', 'arquivado', today - 84, today - 29, 1600, 95, 200, 48,
    'Foco em estruturar café da manhã e lanche da tarde.', now() - interval '84 days', now() - interval '84 days');

  -- Metas e check-ins ---------------------------------------------------------
  insert into public.goals (patient_id, professional_id, title, description, icon, target_value, unit, created_at)
  values (ana, maria, 'Beber água', 'Pelo menos 8 copos de 250 ml', '💧', 8, 'copos', now() - interval '84 days')
  returning id into g_water;
  insert into public.goals (patient_id, professional_id, title, description, icon, target_value, unit, created_at)
  values (ana, maria, 'Comer frutas', '3 porções ao longo do dia', '🍎', 3, 'porções', now() - interval '84 days')
  returning id into g_fruit;
  insert into public.goals (patient_id, professional_id, title, description, icon, target_value, unit, created_at)
  values (ana, maria, 'Caminhar', '30 minutos de caminhada', '🚶‍♀️', 30, 'min', now() - interval '56 days')
  returning id into g_walk;
  insert into public.goals (patient_id, title, icon, target_value, unit, created_at)
  values (ana, 'Dormir antes das 23h', '🌙', 1, 'vez', now() - interval '10 days');

  for d in 1..14 loop
    insert into public.goal_checkins (goal_id, patient_id, day, value) values
      (g_water, ana, today - d, 5 + (d * 7 % 4)),
      (g_fruit, ana, today - d, 1 + (d * 5 % 3));
    if d % 2 = 0 or d % 3 = 0 then
      insert into public.goal_checkins (goal_id, patient_id, day, value) values (g_walk, ana, today - d, 30);
    end if;
  end loop;
  insert into public.goal_checkins (goal_id, patient_id, day, value) values
    (g_water, ana, today, 3), (g_fruit, ana, today, 1);

  insert into public.goals (patient_id, professional_id, title, icon, target_value, unit, created_at) values
    (carlos, pedro, 'Proteína no café da manhã', '🍳', 1, 'vez', now() - interval '35 days'),
    (carlos, pedro, 'Beber água', '💧', 3, 'litros', now() - interval '35 days');

  -- Diário alimentar ----------------------------------------------------------
  insert into public.diary_entries (patient_id, eaten_at, meal_type, description, hunger_before, satiety_after, mood, followed_plan)
  values (ana, ((today - 1) + time '07:40') at time zone tz, 'cafe_da_manha',
    'Pão integral com ovo e queijo, banana e café.', 3, 4, 'Tranquila', true)
  returning id into e1;
  insert into public.diary_entries (patient_id, eaten_at, meal_type, description, hunger_before, satiety_after, mood, followed_plan) values
    (ana, ((today - 1) + time '12:50') at time zone tz, 'almoco',
     'Arroz integral, feijão, frango grelhado e salada. Esqueci o brócolis.', 4, 4, 'Com pressa', true),
    (ana, ((today - 1) + time '16:10') at time zone tz, 'lanche_da_tarde',
     'Iogurte com aveia.', 3, 3, 'Ok', true),
    (ana, ((today - 1) + time '20:30') at time zone tz, 'jantar',
     'Pedi um hambúrguer, estava muito cansada.', 5, 5, 'Cansada', false),
    (ana, (today + time '07:30') at time zone tz, 'cafe_da_manha',
     'Aveia com banana e café.', 3, 4, 'Animada', true);
  insert into public.diary_comments (entry_id, author_id, body, created_at) values
    (e1, maria, 'Café da manhã perfeito, Ana! Isso ajuda muito a controlar a fome à noite. 👏', now() - interval '20 hours');
  insert into public.diary_comments (entry_id, author_id, body, created_at)
  select id, maria,
         'Tudo bem ter dias assim! Da próxima vez, que tal deixar uma marmita congelada para os dias cansativos? Conversamos na consulta.',
         now() - interval '12 hours'
    from public.diary_entries where patient_id = ana and meal_type = 'jantar' limit 1;

  -- Mensagens -----------------------------------------------------------------
  insert into public.messages (patient_id, professional_id, sender_id, body, created_at, read_at) values
    (ana, maria, ana, 'Oi, Maria! Posso trocar o iogurte do lanche por uma fruta com castanhas?', now() - interval '3 days', now() - interval '3 days'),
    (ana, maria, maria, 'Pode sim, Ana! 1 fruta + 2 castanhas-do-pará é uma ótima troca.', now() - interval '3 days' + interval '2 hours', now() - interval '2 days'),
    (ana, maria, ana, 'Perfeito, obrigada! 😊', now() - interval '2 days', now() - interval '2 days'),
    (ana, maria, maria, 'Vi seu diário de ontem. Está indo super bem! Nos vemos na consulta.', now() - interval '6 hours', null),
    (carlos, pedro, carlos, 'Pedro, perdi a consulta da semana passada, desculpa! Já remarquei.', now() - interval '2 days', now() - interval '1 day'),
    (carlos, pedro, pedro, 'Sem problemas, Carlos. Te vejo na próxima!', now() - interval '1 day', null);
end;
$seed$;

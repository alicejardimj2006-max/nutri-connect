-- Cardápio da semana (N3): almoço e jantar de segunda a domingo, montados pela Nina (uso de IA
-- "menu", com limite diário) e ajustados pela pessoa, com faixa de orçamento. A lista de compras
-- única junta os ingredientes da semana, agrupados por seção, na mesma lista da conta (N4).

-- ---------------------------------------------------------------------------
-- Cardápios (privados)
-- ---------------------------------------------------------------------------
create table public.weekly_menus (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- Segunda-feira da semana.
  week_start date not null check (extract(isodow from week_start) = 1),
  budget text not null default 'economico' check (budget in ('economico', 'moderado', 'livre')),
  -- { "0-almoco": { title, prepTime, servings, ingredients[], steps[], tip, source }, ... }
  meals jsonb not null default '{}'::jsonb
    check (jsonb_typeof(meals) = 'object' and pg_column_size(meals) < 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);
create trigger weekly_menus_updated_at before update on public.weekly_menus
  for each row execute function public.set_updated_at();

alter table public.weekly_menus enable row level security;
create policy "weekly_menus: dono lê" on public.weekly_menus
  for select to authenticated using (user_id = auth.uid());
create policy "weekly_menus: dono cria" on public.weekly_menus
  for insert to authenticated with check (user_id = auth.uid());
create policy "weekly_menus: dono altera" on public.weekly_menus
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "weekly_menus: dono apaga" on public.weekly_menus
  for delete to authenticated using (user_id = auth.uid());

create or replace function public.weekly_menus_limit()
returns trigger language plpgsql set search_path = public as $$
begin
  if (select count(*) from public.weekly_menus where user_id = new.user_id) >= 120 then
    raise exception 'Limite de 120 cardápios guardados.';
  end if;
  return new;
end;
$$;
create trigger weekly_menus_limit before insert on public.weekly_menus
  for each row execute function public.weekly_menus_limit();

-- ---------------------------------------------------------------------------
-- Seção do mercado na lista de compras
-- ---------------------------------------------------------------------------
alter table public.shopping_items add column section text
  check (section in ('hortifruti', 'acougue', 'laticinios', 'padaria', 'mercearia', 'outros'));

-- ---------------------------------------------------------------------------
-- Uso de IA do cardápio (semana, trocas e lista)
-- ---------------------------------------------------------------------------
alter table public.ai_usage drop constraint if exists ai_usage_kind_check;
alter table public.ai_usage add constraint ai_usage_kind_check
  check (kind in ('nina', 'summary', 'moderation', 'label', 'diary', 'fridge', 'menu'));

-- ─── Exportação de dados (LGPD) inclui os cardápios da semana ───────────────
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
      ('cardapios_da_semana', 'weekly_menus', array['user_id'])
    ) as v(label, tbl, cols)
  loop
    result := result || jsonb_build_object(spec.label, public._export_rows(spec.tbl, spec.cols, me));
  end loop;

  return result;
end;
$$;
revoke execute on function public.export_my_data() from public, anon;
grant execute on function public.export_my_data() to authenticated;

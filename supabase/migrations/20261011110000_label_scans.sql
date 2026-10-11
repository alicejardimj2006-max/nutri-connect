-- Leitor de rótulos completo (M1): histórico dos produtos lidos (código de barras pelo Open Food
-- Facts ou foto lida pela Nina), para rever e comparar. Só a própria pessoa vê o histórico.

create table public.label_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  source text not null check (source in ('codigo', 'foto')),
  barcode text check (barcode ~ '^[0-9]{6,14}$'),
  name text not null check (length(name) between 1 and 200),
  brand text check (length(brand) <= 120),
  image_url text check (image_url ~ '^https://' and length(image_url) <= 500),
  -- Grupo NOVA (1 a 4) quando conhecido.
  nova smallint check (nova between 1 and 4),
  -- Lupa "ALTO EM" (Anvisa): {"acucar": true, "gordura_saturada": false, "sodio": true}.
  alto_em jsonb not null default '{}'::jsonb check (pg_column_size(alto_em) < 500),
  -- Valores por 100 g ou 100 ml (kcal, acucares, gordura_saturada, sodio_mg, fibras, proteinas...).
  nutrients jsonb not null default '{}'::jsonb check (pg_column_size(nutrients) < 2000),
  liquid boolean not null default false,
  -- Resposta da Nina (leitura por foto).
  summary text check (length(summary) <= 3000),
  created_at timestamptz not null default now()
);
create index label_scans_user_idx on public.label_scans (user_id, created_at desc);

alter table public.label_scans enable row level security;
create policy "label_scans: dono lê" on public.label_scans
  for select to authenticated using (user_id = auth.uid());
create policy "label_scans: dono cria" on public.label_scans
  for insert to authenticated with check (user_id = auth.uid());
create policy "label_scans: dono apaga" on public.label_scans
  for delete to authenticated using (user_id = auth.uid());

-- Guarda os 200 mais recentes; o mesmo código lido de novo sobe para o topo (sem duplicar).
create or replace function public.trg_label_scans_trim()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.barcode is not null then
    delete from public.label_scans
     where user_id = new.user_id and barcode = new.barcode and id <> new.id;
  end if;
  delete from public.label_scans
   where id in (
     select id from public.label_scans where user_id = new.user_id
      order by created_at desc offset 200);
  return null;
end;
$$;
create trigger label_scans_trim after insert on public.label_scans
  for each row execute function public.trg_label_scans_trim();

-- ─── Exportação de dados (LGPD) inclui o histórico de rótulos ───────────────
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
      ('rotulos_lidos', 'label_scans', array['user_id'])
    ) as v(label, tbl, cols)
  loop
    result := result || jsonb_build_object(spec.label, public._export_rows(spec.tbl, spec.cols, me));
  end loop;

  return result;
end;
$$;
revoke execute on function public.export_my_data() from public, anon;
grant execute on function public.export_my_data() to authenticated;

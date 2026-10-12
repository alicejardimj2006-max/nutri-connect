-- "O que tem na geladeira?" (N4): receitas com o que há em casa. A Nina sugere ideias (uso de IA
-- "fridge", com limite diário), a comunidade entra com as receitas que usam os mesmos
-- ingredientes, e a pessoa guarda receitas e manda o que falta para a lista de compras, que agora
-- fica na conta (vale em todos os aparelhos; a N3 reaproveita).

-- ---------------------------------------------------------------------------
-- Minhas receitas (privadas)
-- ---------------------------------------------------------------------------
create table public.saved_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  source text not null check (source in ('nina', 'comunidade')),
  post_id uuid references public.posts (id) on delete cascade,
  title text not null check (length(title) between 1 and 150),
  -- { prepTime, servings, utensils[], ingredients[], missing[], steps[], tip }
  recipe jsonb not null default '{}'::jsonb check (pg_column_size(recipe) < 20000),
  created_at timestamptz not null default now(),
  check ((source = 'comunidade') = (post_id is not null))
);
create index saved_recipes_user_idx on public.saved_recipes (user_id, created_at desc);
create unique index saved_recipes_post_once on public.saved_recipes (user_id, post_id)
  where post_id is not null;

alter table public.saved_recipes enable row level security;
create policy "saved_recipes: dono lê" on public.saved_recipes
  for select to authenticated using (user_id = auth.uid());
create policy "saved_recipes: dono cria" on public.saved_recipes
  for insert to authenticated with check (user_id = auth.uid());
create policy "saved_recipes: dono apaga" on public.saved_recipes
  for delete to authenticated using (user_id = auth.uid());

create or replace function public.saved_recipes_limit()
returns trigger language plpgsql set search_path = public as $$
begin
  if (select count(*) from public.saved_recipes where user_id = new.user_id) >= 200 then
    raise exception 'Limite de 200 receitas guardadas.';
  end if;
  return new;
end;
$$;
create trigger saved_recipes_limit before insert on public.saved_recipes
  for each row execute function public.saved_recipes_limit();

-- ---------------------------------------------------------------------------
-- Lista de compras na conta
-- ---------------------------------------------------------------------------
create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  text text not null check (length(text) between 1 and 80),
  done boolean not null default false,
  -- De onde veio: digitado, faltante de uma receita, plano alimentar (N3)...
  source text not null default 'manual' check (source in ('manual', 'geladeira', 'plano', 'cardapio')),
  created_at timestamptz not null default now()
);
create index shopping_items_user_idx on public.shopping_items (user_id, created_at desc);

alter table public.shopping_items enable row level security;
create policy "shopping_items: dono lê" on public.shopping_items
  for select to authenticated using (user_id = auth.uid());
create policy "shopping_items: dono cria" on public.shopping_items
  for insert to authenticated with check (user_id = auth.uid());
create policy "shopping_items: dono altera" on public.shopping_items
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "shopping_items: dono apaga" on public.shopping_items
  for delete to authenticated using (user_id = auth.uid());

create or replace function public.shopping_items_limit()
returns trigger language plpgsql set search_path = public as $$
begin
  if (select count(*) from public.shopping_items where user_id = new.user_id) >= 200 then
    raise exception 'Limite de 200 itens na lista de compras.';
  end if;
  return new;
end;
$$;
create trigger shopping_items_limit before insert on public.shopping_items
  for each row execute function public.shopping_items_limit();

-- ---------------------------------------------------------------------------
-- Receitas da comunidade que usam os ingredientes (respeita quem pode ver cada post)
-- ---------------------------------------------------------------------------
create or replace function public.recipes_with_ingredients(p_terms text[], p_limit integer default 6)
returns table (id uuid, title text, image_url text, author_id uuid, recipe jsonb, matches integer)
language sql stable security definer set search_path = public as $$
  with terms as (
    select distinct lower(trim(t)) as term
      from unnest(coalesce(p_terms, '{}'::text[])) t
     where length(trim(t)) between 2 and 40
     limit 20
  ),
  candidates as (
    select p.id, p.title, p.image_url, p.author_id, p.recipe,
           (select count(*)::integer from terms
             where exists (
               select 1 from jsonb_array_elements_text(coalesce(p.recipe -> 'ingredients', '[]'::jsonb)) i
                where lower(i) like '%' || terms.term || '%')) as matches
      from public.posts p
     where p.type = 'receita'
       and p.recipe is not null
       and public.post_is_visible(p.author_id, p.community_id, p.audience, p.hidden, p.publish_at)
  )
  select c.id, c.title, c.image_url, c.author_id, c.recipe, c.matches
    from candidates c
   where c.matches > 0
   order by c.matches desc, c.id
   limit least(greatest(coalesce(p_limit, 6), 1), 20);
$$;
revoke execute on function public.recipes_with_ingredients(text[], integer) from public, anon;
grant execute on function public.recipes_with_ingredients(text[], integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Uso de IA da geladeira (foto e receitas)
-- ---------------------------------------------------------------------------
alter table public.ai_usage drop constraint if exists ai_usage_kind_check;
alter table public.ai_usage add constraint ai_usage_kind_check
  check (kind in ('nina', 'summary', 'moderation', 'label', 'diary', 'fridge'));

-- ─── Exportação de dados (LGPD) inclui receitas guardadas e a lista de compras ───────────────
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
      ('lista_de_compras', 'shopping_items', array['user_id'])
    ) as v(label, tbl, cols)
  loop
    result := result || jsonb_build_object(spec.label, public._export_rows(spec.tbl, spec.cols, me));
  end loop;

  return result;
end;
$$;
revoke execute on function public.export_my_data() from public, anon;
grant execute on function public.export_my_data() to authenticated;

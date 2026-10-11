-- Água do dia (N2): copos registrados em um toque, meta ajustável (pela pessoa ou pelo profissional
-- que a acompanha), lembretes de água que se calam quando a meta do dia já foi batida.
-- O registro vai para o servidor para valer em todos os aparelhos e aparecer para o profissional
-- vinculado (has_active_link), como as metas.

-- ---------------------------------------------------------------------------
-- Meta e tamanho do copo
-- ---------------------------------------------------------------------------
create table public.water_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  goal_glasses smallint not null default 8 check (goal_glasses between 1 and 20),
  glass_ml smallint not null default 250 check (glass_ml between 100 and 1000),
  -- Profissional que definiu a meta (nulo = a própria pessoa).
  goal_set_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.water_settings enable row level security;
create policy "water_settings: leitura" on public.water_settings
  for select to authenticated using (user_id = auth.uid() or public.has_active_link(user_id));
-- Escrita só pelas funções abaixo.

-- ---------------------------------------------------------------------------
-- Copos de cada dia (data local da pessoa)
-- ---------------------------------------------------------------------------
create table public.water_days (
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null,
  glasses smallint not null default 0 check (glasses between 0 and 40),
  -- Meta que valia naquele dia (o histórico não muda quando a meta muda).
  goal smallint not null check (goal between 1 and 20),
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

alter table public.water_days enable row level security;
create policy "water_days: leitura" on public.water_days
  for select to authenticated using (user_id = auth.uid() or public.has_active_link(user_id));

create or replace function public._water_goal(p_user uuid)
returns smallint language sql stable security definer set search_path = public as $$
  select coalesce((select goal_glasses from public.water_settings where user_id = p_user), 8::smallint);
$$;
revoke execute on function public._water_goal(uuid) from public, anon, authenticated;

-- A data vem do aparelho (dia local). Aceita só de anteontem a amanhã, para cobrir fusos e
-- registros esquecidos sem permitir reescrever o histórico.
create or replace function public._water_check_day(p_day date)
returns void language plpgsql immutable as $$
begin
  if p_day is null or p_day < current_date - 2 or p_day > current_date + 1 then
    raise exception 'Dia inválido.' using errcode = '22023';
  end if;
end;
$$;

/** Soma (ou tira) copos no dia. Devolve o total do dia. */
create or replace function public.water_add(p_day date, p_delta integer)
returns smallint language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  total smallint;
begin
  if me is null then
    raise exception 'É preciso estar logado.' using errcode = '42501';
  end if;
  perform public._water_check_day(p_day);
  if p_delta is null or p_delta not between -40 and 40 then
    raise exception 'Quantidade inválida.' using errcode = '22023';
  end if;
  insert into public.water_days as w (user_id, day, glasses, goal)
  values (me, p_day, greatest(0, least(40, p_delta)), public._water_goal(me))
  on conflict (user_id, day) do update
    set glasses = greatest(0, least(40, w.glasses + p_delta)), updated_at = now()
  returning glasses into total;
  return total;
end;
$$;

/** Define o total de copos do dia (tocar num copo do meio). */
create or replace function public.water_set(p_day date, p_glasses integer)
returns smallint language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  total smallint;
begin
  if me is null then
    raise exception 'É preciso estar logado.' using errcode = '42501';
  end if;
  perform public._water_check_day(p_day);
  if p_glasses is null or p_glasses not between 0 and 40 then
    raise exception 'Quantidade inválida.' using errcode = '22023';
  end if;
  insert into public.water_days as w (user_id, day, glasses, goal)
  values (me, p_day, p_glasses, public._water_goal(me))
  on conflict (user_id, day) do update set glasses = excluded.glasses, updated_at = now()
  returning glasses into total;
  return total;
end;
$$;

/**
 * Meta diária (copos) e tamanho do copo. p_user nulo = a própria pessoa; com p_user, só o
 * profissional com vínculo ativo, e só a meta (o tamanho do copo é escolha de quem bebe).
 */
create or replace function public.water_set_goal(
  p_goal integer, p_glass_ml integer default null, p_user uuid default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  target uuid := coalesce(p_user, auth.uid());
  by_pro boolean := p_user is not null and p_user <> auth.uid();
begin
  if me is null then
    raise exception 'É preciso estar logado.' using errcode = '42501';
  end if;
  if by_pro and not public.has_active_link(target, me) then
    raise exception 'Sem vínculo ativo com esta pessoa.' using errcode = '42501';
  end if;
  if p_goal is null or p_goal not between 1 and 20 then
    raise exception 'A meta deve ficar entre 1 e 20 copos.' using errcode = '22023';
  end if;
  if p_glass_ml is not null and p_glass_ml not between 100 and 1000 then
    raise exception 'Tamanho de copo inválido.' using errcode = '22023';
  end if;
  insert into public.water_settings as s (user_id, goal_glasses, glass_ml, goal_set_by)
  values (target, p_goal, coalesce(case when by_pro then null else p_glass_ml end, 250),
          case when by_pro then me end)
  on conflict (user_id) do update
    set goal_glasses = excluded.goal_glasses,
        glass_ml = case when by_pro or p_glass_ml is null then s.glass_ml else p_glass_ml end,
        goal_set_by = case when by_pro then me else null end,
        updated_at = now();
  -- A meta nova já vale para hoje (no fuso de São Paulo, o padrão do app).
  update public.water_days set goal = p_goal
   where user_id = target and day >= (now() at time zone 'America/Sao_Paulo')::date - 1;
end;
$$;

revoke execute on function public.water_add(date, integer) from public, anon;
revoke execute on function public.water_set(date, integer) from public, anon;
revoke execute on function public.water_set_goal(integer, integer, uuid) from public, anon;
grant execute on function public.water_add(date, integer) to authenticated;
grant execute on function public.water_set(date, integer) to authenticated;
grant execute on function public.water_set_goal(integer, integer, uuid) to authenticated;

-- Avisa a pessoa quando o profissional muda a meta de água.
create or replace function public.trg_water_goal_notify()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.goal_set_by is not null
     and (tg_op = 'INSERT' or new.goal_glasses is distinct from old.goal_glasses) then
    perform public.notify(new.user_id, 'meta_agua', new.goal_set_by, 'water', new.user_id::text,
                          jsonb_build_object('goal', new.goal_glasses));
  end if;
  return new;
end;
$$;

create trigger water_goal_notify after insert or update of goal_glasses on public.water_settings
  for each row execute function public.trg_water_goal_notify();

-- Realtime: o profissional vê a água do dia se atualizar.
do $$
begin
  alter publication supabase_realtime add table public.water_days;
exception when others then null;
end $$;

-- ─── Exportação de dados (LGPD) inclui água, lembretes e push ───────────────
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
      ('agua_dias', 'water_days', array['user_id'])
    ) as v(label, tbl, cols)
  loop
    result := result || jsonb_build_object(spec.label, public._export_rows(spec.tbl, spec.cols, me));
  end loop;

  return result;
end;
$$;
revoke execute on function public.export_my_data() from public, anon;
grant execute on function public.export_my_data() to authenticated;
-- ---------------------------------------------------------------------------
-- Lembrete de água: não toca se a meta do dia já foi batida
-- ---------------------------------------------------------------------------
create or replace function public.push_claim()
returns table (user_id uuid, kind text, payload jsonb)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  r record;
  local_ts timestamp;
  minutes integer;
begin
  -- 1) Lembretes na hora (janela de 20 min para não perder nenhum se uma rodada atrasar).
  for r in
    select rm.id, rm.user_id as uid, rm.kind as rkind, rm.title, rm.body, rm.url, rm.days,
           rm.time_of_day, rm.last_sent_on,
           coalesce(ps.timezone, 'America/Sao_Paulo') as tz, ps.quiet_from, ps.quiet_to,
           coalesce(ps.show_preview, true) as preview,
           coalesce(us.locale, 'pt-BR') as locale
      from public.reminders rm
      left join public.push_settings ps on ps.user_id = rm.user_id
      left join public.user_settings us on us.id = rm.user_id
     where rm.active
       and exists (select 1 from public.push_subscriptions s where s.user_id = rm.user_id)
     for update of rm skip locked
  loop
    local_ts := now() at time zone r.tz;
    if extract(dow from local_ts)::smallint = any (r.days)
       and r.time_of_day <= local_ts::time
       and r.time_of_day > (local_ts - interval '20 minutes')::time
       and r.last_sent_on is distinct from local_ts::date then
      update public.reminders set last_sent_on = local_ts::date where id = r.id;
      continue when public.push_in_quiet(r.quiet_from, r.quiet_to, extract(hour from local_ts)::integer);
      -- Água: meta do dia batida, sem lembrete.
      continue when r.rkind = 'agua' and exists (
        select 1 from public.water_days w
         where w.user_id = r.uid and w.day = local_ts::date and w.glasses >= w.goal);
      user_id := r.uid;
      kind := 'lembrete';
      payload := jsonb_build_object(
        'kind', r.rkind, 'title', r.title, 'body', r.body,
        'url', coalesce(r.url, case r.rkind
                                 when 'refeicao' then '/acompanhamento/plano'
                                 when 'desafio' then '/desafios'
                                 when 'agua' then '/acompanhamento'
                                 else '/espaco' end),
        'tag', 'lembrete-' || r.id, 'preview', r.preview, 'locale', r.locale);
      return next;
    end if;
  end loop;

  -- 2) Consultas que começam dentro da antecedência escolhida (paciente e profissional).
  --    O aviso de consulta ignora o horário de silêncio: é um compromisso marcado.
  for r in
    select a.id as appt, a.starts_at, u.uid, other.name as other_name,
           coalesce(ps.show_preview, true) as preview, coalesce(us.locale, 'pt-BR') as locale
      from public.appointments a
      cross join lateral (values (a.patient_id, a.professional_id), (a.professional_id, a.patient_id))
        as u (uid, other_id)
      left join public.push_settings ps on ps.user_id = u.uid
      left join public.user_settings us on us.id = u.uid
      left join public.profiles other on other.id = u.other_id
     where a.status in ('agendada', 'confirmada')
       and a.starts_at > now()
       and a.starts_at <= now() + interval '1441 minutes'
       and coalesce(ps.appointment_lead_min, 60) > 0
       and a.starts_at <= now() + make_interval(mins => coalesce(ps.appointment_lead_min, 60))
       and not exists (
         select 1 from public.push_appointment_log l where l.appointment_id = a.id and l.user_id = u.uid)
       and exists (select 1 from public.push_subscriptions s where s.user_id = u.uid)
  loop
    insert into public.push_appointment_log (appointment_id, user_id) values (r.appt, r.uid)
    on conflict do nothing;
    minutes := greatest(1, ceil(extract(epoch from (r.starts_at - now())) / 60)::integer);
    user_id := r.uid;
    kind := 'consulta';
    payload := jsonb_build_object(
      'minutes', minutes, 'starts_at', r.starts_at, 'other', r.other_name,
      'url', '/consulta/' || r.appt, 'tag', 'consulta-' || r.appt,
      'preview', r.preview, 'locale', r.locale);
    return next;
  end loop;

  -- 3) Avisos do site na fila.
  delete from public.push_queue where created_at < now() - interval '1 day';
  for r in
    select q.id as qid, n.id as nid, n.user_id as uid, n.type, n.entity_id, n.actor_id, n.data,
           p.name as actor_name,
           coalesce(ps.timezone, 'America/Sao_Paulo') as tz, ps.quiet_from, ps.quiet_to,
           coalesce(ps.show_preview, true) as preview, coalesce(us.locale, 'pt-BR') as locale,
           exists (select 1 from public.professionals pr where pr.user_id = n.user_id) as is_pro
      from public.push_queue q
      join public.notifications n on n.id = q.notification_id
      left join public.profiles p on p.id = n.actor_id
      left join public.push_settings ps on ps.user_id = q.user_id
      left join public.user_settings us on us.id = q.user_id
     order by q.id
     limit 500
     for update of q skip locked
  loop
    delete from public.push_queue where id = r.qid;
    local_ts := now() at time zone r.tz;
    continue when public.push_in_quiet(r.quiet_from, r.quiet_to, extract(hour from local_ts)::integer);
    user_id := r.uid;
    kind := 'aviso';
    payload := jsonb_build_object(
      'type', r.type, 'actor', r.actor_name, 'data', r.data,
      'url', case
        when r.type in ('reacao', 'comentario', 'conteudo_liberado') and r.entity_id is not null
          then '/explorar?post=' || r.entity_id
        when r.type in ('seguidor', 'amizade_pedido') and r.actor_id is not null
          then '/perfil/' || r.actor_id
        when r.type = 'amizade_aceita' then '/perfil/' || coalesce(r.entity_id, r.actor_id::text)
        when r.type = 'consulta_sala' and r.entity_id is not null then '/consulta/' || r.entity_id
        when r.type like 'consulta_%' then
          case when r.is_pro then '/painel/agenda' else '/acompanhamento/consultas' end
        when r.type = 'mensagem' then
          case when r.is_pro then '/painel/mensagens' else '/acompanhamento/mensagens' end
        when r.type in ('plano_publicado', 'plano_cuidado') then '/acompanhamento/plano'
        when r.type = 'avaliacao_registrada' then '/acompanhamento/evolucao'
        when r.type = 'diario_comentario' then '/acompanhamento/diario'
        when r.type = 'acompanhamento_pedido' then '/convites'
        when r.type = 'convite_aceito' then '/painel/pacientes'
        when r.type = 'acompanhamento_aceito' then '/acompanhamento'
        when r.type = 'meta_agua' then '/acompanhamento/metas'
        when r.type in ('tema_previa', 'tema_ativo') then '/tema-da-semana'
        else '/notificacoes'
      end,
      'tag', 'aviso-' || r.nid, 'preview', r.preview, 'locale', r.locale);
    return next;
  end loop;
end;
$$;
revoke execute on function public.push_claim() from public, anon, authenticated;

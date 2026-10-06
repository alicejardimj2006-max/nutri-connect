-- =============================================================================
-- Pontuação, níveis e funções liberadas dos profissionais
--
-- Cada profissional verificado acumula pontos conforme participa (publicar, responder perguntas,
-- tema da semana, apoios recebidos, consultas realizadas) e perde pontos com denúncias procedentes,
-- cancelamentos em cima da hora, suspensão e ausência. O nível (1 a 5) vem da pontuação e libera
-- funções (por exemplo o perfil de membros, pago) e reduz a parte da plataforma nas assinaturas.
--
-- Tudo é um registro de eventos (só inserção) gravado por gatilhos do banco: nada vem do navegador.
-- As regras (pontos, tetos diários, níveis, funções, taxas) ficam em tabelas de configuração que
-- a administração pode ajustar sem publicar código novo.
-- =============================================================================

-- ─── Configuração ────────────────────────────────────────────────────────────

create table public.pro_levels (
  level integer primary key check (level between 1 and 10),
  code text not null unique,
  min_score integer not null check (min_score >= 0),
  -- Parte da plataforma sobre as assinaturas do perfil de membros neste nível.
  membership_fee_percent integer not null check (membership_fee_percent between 0 and 100),
  -- Exige 90 dias sem denúncia procedente (selo de excelência).
  requires_clean_record boolean not null default false
);

insert into public.pro_levels (level, code, min_score, membership_fee_percent, requires_clean_record) values
  (1, 'iniciante',  0,    20, false),
  (2, 'ativo',      100,  18, false),
  (3, 'destaque',   300,  15, false),
  (4, 'referencia', 700,  12, false),
  (5, 'excelencia', 1500, 10, true);

create table public.pro_score_rules (
  kind text primary key,
  points integer not null,
  -- Quantos eventos deste tipo contam por dia (fuso de São Paulo); vazio = sem teto.
  daily_cap integer check (daily_cap is null or daily_cap > 0),
  -- Conta como presença na plataforma (quem fica sem nenhuma por 14 dias perde pontos).
  counts_as_activity boolean not null default false,
  active boolean not null default true,
  description text not null
);

insert into public.pro_score_rules (kind, points, daily_cap, counts_as_activity, description) values
  ('verificacao',          20, null, false, 'Perfil profissional verificado pela plataforma'),
  ('post_publicado',        5, 3,    true,  'Publicação (até 3 por dia)'),
  ('receita_publicada',     8, 3,    true,  'Receita publicada (até 3 por dia)'),
  ('resposta_pergunta',     4, 5,    true,  'Resposta a uma pergunta de outra pessoa (até 5 por dia)'),
  ('comentario',            1, 5,    true,  'Comentário em publicação de outra pessoa (até 5 por dia)'),
  ('tema_post',            10, null, true,  'Publicação no tema da semana (uma vez por tema)'),
  ('tema_voto',             2, null, true,  'Voto na enquete do tema da semana (uma vez por tema)'),
  ('apoio_recebido',        1, 10,   false, 'Apoio de outra pessoa a uma publicação sua (até 10 por dia)'),
  ('consulta_realizada',   10, null, true,  'Consulta marcada como realizada'),
  ('denuncia_procedente', -30, null, false, 'Denúncia julgada procedente contra conteúdo ou conta'),
  ('cancelamento_tardio',  -8, null, false, 'Consulta cancelada pelo profissional com menos de 24 h de antecedência'),
  ('ausencia',             -5, null, false, 'Semana sem nenhuma atividade, depois de 14 dias de ausência (máx. -20 em 28 dias)'),
  ('conta_suspensa',     -100, null, false, 'Conta suspensa pela administração'),
  ('ajuste_admin',          0, null, false, 'Ajuste manual da administração (com justificativa)');

create table public.pro_features (
  feature text primary key,
  min_level integer not null references public.pro_levels (level),
  description text not null
);

insert into public.pro_features (feature, min_level, description) values
  ('comunidade_admin',  2, 'Ser indicado como administrador profissional de comunidades'),
  ('perfil_membros',    3, 'Perfil de membros: assinatura paga com conteúdo exclusivo'),
  ('conteudo_exclusivo',3, 'Publicar conteúdo exclusivo para membros'),
  ('desconto_membros',  3, 'Oferecer desconto em consultas para membros'),
  ('destaque_busca',    4, 'Destaque nas buscas e nas sugestões de profissionais'),
  ('selo_excelencia',   5, 'Selo de excelência no perfil');

alter table public.pro_levels enable row level security;
alter table public.pro_score_rules enable row level security;
alter table public.pro_features enable row level security;
create policy "pro_levels: leitura" on public.pro_levels for select to authenticated using (true);
create policy "pro_score_rules: leitura" on public.pro_score_rules for select to authenticated using (true);
create policy "pro_features: leitura" on public.pro_features for select to authenticated using (true);
create policy "pro_levels: admin altera" on public.pro_levels
  for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());
create policy "pro_score_rules: admin altera" on public.pro_score_rules
  for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());
create policy "pro_features: admin altera" on public.pro_features
  for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

-- ─── Registro de eventos e pontuação atual ───────────────────────────────────

create table public.pro_score_events (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (user_id) on delete cascade,
  kind text not null references public.pro_score_rules (kind),
  points integer not null,
  ref_type text not null,
  ref_id uuid not null,
  note text,
  created_at timestamptz not null default now(),
  -- O mesmo fato nunca pontua duas vezes.
  unique (professional_id, kind, ref_type, ref_id)
);
create index pro_score_events_pro_idx on public.pro_score_events (professional_id, created_at desc);

create table public.pro_scores (
  professional_id uuid primary key references public.professionals (user_id) on delete cascade,
  score integer not null default 0 check (score >= 0),
  level integer not null default 1 references public.pro_levels (level),
  updated_at timestamptz not null default now()
);

alter table public.pro_score_events enable row level security;
alter table public.pro_scores enable row level security;
create policy "pro_score_events: dono e admin leem" on public.pro_score_events
  for select to authenticated using (professional_id = auth.uid() or public.is_platform_admin());
-- A pontuação exata é privada; o nível aparece para todos por get_pro_status().
create policy "pro_scores: dono e admin leem" on public.pro_scores
  for select to authenticated using (professional_id = auth.uid() or public.is_platform_admin());
-- Sem políticas de escrita: só as funções abaixo (security definer) gravam.

-- ─── Cálculo ─────────────────────────────────────────────────────────────────

-- Nível de uma pontuação. O nível de excelência exige 90 dias sem denúncia procedente.
create or replace function public.pro_level_for(p_pro uuid, p_score integer)
returns integer language sql stable security definer set search_path = public as $$
  select coalesce(max(l.level), 1)
    from public.pro_levels l
   where p_score >= l.min_score
     and (
       not l.requires_clean_record
       or not exists (
         select 1 from public.pro_score_events e
          where e.professional_id = p_pro and e.kind = 'denuncia_procedente'
            and e.created_at > now() - interval '90 days'
       )
     );
$$;

-- Aplica uma variação de pontos e atualiza o nível (avisa quando sobe).
create or replace function public._pro_apply(p_pro uuid, p_points integer)
returns void language plpgsql security definer set search_path = public as $$
declare
  old_level integer;
  new_score integer;
  new_level integer;
begin
  insert into public.pro_scores (professional_id) values (p_pro) on conflict do nothing;
  select level into old_level from public.pro_scores where professional_id = p_pro for update;
  update public.pro_scores
     set score = greatest(0, score + p_points), updated_at = now()
   where professional_id = p_pro
  returning score into new_score;
  new_level := public.pro_level_for(p_pro, new_score);
  update public.pro_scores set level = new_level where professional_id = p_pro;
  if new_level > old_level then
    perform public.notify(p_pro, 'conquista', null, 'profile', p_pro::text,
      jsonb_build_object('title', (select code from public.pro_levels where level = new_level)));
  end if;
end;
$$;

-- Registra um evento (respeitando teto diário e a regra de não pontuar duas vezes o mesmo fato).
create or replace function public._pro_award(
  p_pro uuid, p_kind text, p_ref_type text, p_ref uuid,
  p_note text default null, p_points integer default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  r public.pro_score_rules;
  pts integer;
  n integer;
begin
  if p_pro is null or not public.is_verified_professional(p_pro) then return; end if;
  select * into r from public.pro_score_rules where kind = p_kind and active;
  if not found then return; end if;
  pts := coalesce(p_points, r.points);
  if pts = 0 then return; end if;
  if r.daily_cap is not null then
    select count(*) into n from public.pro_score_events
     where professional_id = p_pro and kind = p_kind
       and (created_at at time zone 'America/Sao_Paulo')::date = (now() at time zone 'America/Sao_Paulo')::date;
    if n >= r.daily_cap then return; end if;
  end if;
  insert into public.pro_score_events (professional_id, kind, points, ref_type, ref_id, note)
  values (p_pro, p_kind, pts, p_ref_type, p_ref, p_note)
  on conflict (professional_id, kind, ref_type, ref_id) do nothing;
  if not found then return; end if;
  perform public._pro_apply(p_pro, pts);
end;
$$;

-- ─── Gatilhos: o que pontua ──────────────────────────────────────────────────

-- Verificação aprovada (linha nova em professionals).
create or replace function public.trg_pro_verified()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public._pro_award(new.user_id, 'verificacao', 'professional', new.user_id);
  return new;
end;
$$;
create trigger pro_score_verified after insert on public.professionals
  for each row execute function public.trg_pro_verified();

-- Publicações (e participação no tema da semana).
create or replace function public.trg_pro_post()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.hidden or new.publish_at > now() + interval '1 minute' then return new; end if;
  perform public._pro_award(
    new.author_id,
    case when new.type = 'receita' then 'receita_publicada' else 'post_publicado' end,
    'post', new.id
  );
  if new.theme_id is not null
     and exists (select 1 from public.weekly_themes where id = new.theme_id and status = 'ativo') then
    perform public._pro_award(new.author_id, 'tema_post', 'theme', new.theme_id);
  end if;
  return new;
end;
$$;
create trigger pro_score_post after insert on public.posts
  for each row execute function public.trg_pro_post();

-- Comentários: responder a uma pergunta vale mais.
create or replace function public.trg_pro_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  p public.posts;
begin
  if new.hidden then return new; end if;
  select * into p from public.posts where id = new.post_id;
  if not found or p.author_id = new.author_id then return new; end if;
  perform public._pro_award(
    new.author_id,
    case when p.type = 'pergunta' then 'resposta_pergunta' else 'comentario' end,
    'comment', new.id
  );
  return new;
end;
$$;
create trigger pro_score_comment after insert on public.comments
  for each row execute function public.trg_pro_comment();

-- Apoios recebidos (de outras pessoas).
create or replace function public.trg_pro_reaction()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  author uuid;
begin
  if new.kind <> 'apoiar' then return new; end if;
  select author_id into author from public.posts where id = new.post_id;
  if author is null or author = new.user_id then return new; end if;
  perform public._pro_award(author, 'apoio_recebido', 'reaction', md5(new.post_id::text || new.user_id::text)::uuid);
  return new;
end;
$$;
create trigger pro_score_reaction after insert on public.post_reactions
  for each row execute function public.trg_pro_reaction();

-- Voto na enquete do tema da semana.
create or replace function public.trg_pro_vote()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public._pro_award(new.user_id, 'tema_voto', 'theme', new.theme_id);
  return new;
end;
$$;
create trigger pro_score_vote after insert on public.theme_poll_votes
  for each row execute function public.trg_pro_vote();

-- Consultas: realizada soma; cancelada pelo profissional em cima da hora tira pontos.
create or replace function public.trg_pro_appointment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = old.status then return new; end if;
  if new.status = 'realizada' then
    perform public._pro_award(new.professional_id, 'consulta_realizada', 'appointment', new.id);
  elsif new.status = 'cancelada'
        and new.cancelled_by = new.professional_id
        and old.status in ('agendada', 'confirmada')
        and new.starts_at - now() < interval '24 hours' then
    perform public._pro_award(new.professional_id, 'cancelamento_tardio', 'appointment', new.id);
  end if;
  return new;
end;
$$;
create trigger pro_score_appointment after update of status on public.appointments
  for each row execute function public.trg_pro_appointment();

-- Denúncia julgada procedente contra um profissional (conteúdo ou conta).
create or replace function public.trg_pro_report()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  author uuid;
begin
  if new.status <> 'procedente' then return new; end if;
  author := case new.target_type
    when 'post' then (select author_id from public.posts where id = new.target_id)
    when 'comment' then (select author_id from public.comments where id = new.target_id)
    else new.target_id
  end;
  perform public._pro_award(author, 'denuncia_procedente', 'report', new.id);
  return new;
end;
$$;
create trigger pro_score_report after update of status on public.reports
  for each row when (old.status = 'pendente' and new.status = 'procedente')
  execute function public.trg_pro_report();

-- Conta suspensa pela administração.
create or replace function public.trg_pro_suspended()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public._pro_award(new.id, 'conta_suspensa', 'profile', md5(new.id::text || new.suspended_at::text)::uuid);
  return new;
end;
$$;
create trigger pro_score_suspended after update of suspended_at on public.profiles
  for each row when (old.suspended_at is null and new.suspended_at is not null)
  execute function public.trg_pro_suspended();

-- ─── Ausência ────────────────────────────────────────────────────────────────

-- Semanalmente: quem ficou 14 dias sem nenhuma atividade perde 5 pontos (no máximo 20 em 28 dias).
-- Também reavalia os níveis (o selo de excelência volta quando os 90 dias sem denúncia passam).
create or replace function public.apply_pro_inactivity()
returns integer language plpgsql security definer set search_path = public as $$
declare
  pro uuid;
  applied integer := 0;
begin
  for pro in
    select user_id from public.professionals where verified_at < now() - interval '14 days'
  loop
    continue when exists (
      select 1 from public.pro_score_events e
        join public.pro_score_rules r on r.kind = e.kind and r.counts_as_activity
       where e.professional_id = pro and e.created_at > now() - interval '14 days'
    );
    continue when (
      select coalesce(sum(points), 0) from public.pro_score_events
       where professional_id = pro and kind = 'ausencia' and created_at > now() - interval '28 days'
    ) <= -20;
    perform public._pro_award(pro, 'ausencia', 'week', md5(pro::text || to_char(now(), 'IYYY-IW'))::uuid);
    applied := applied + 1;
  end loop;

  update public.pro_scores s
     set level = public.pro_level_for(s.professional_id, s.score), updated_at = now()
   where s.level <> public.pro_level_for(s.professional_id, s.score);
  return applied;
end;
$$;
revoke execute on function public.apply_pro_inactivity() from public, anon, authenticated;

do $$
begin
  create extension if not exists pg_cron;
  perform cron.unschedule(jobid) from cron.job where jobname = 'nutriconnect-pro-inactivity';
  perform cron.schedule('nutriconnect-pro-inactivity', '0 7 * * 1', 'select public.apply_pro_inactivity()');
exception when others then
  raise notice 'pg_cron indisponível: %', sqlerrm;
end;
$$;

-- ─── Consultas públicas e da administração ───────────────────────────────────

-- A pessoa tem a função liberada pelo nível?
create or replace function public.pro_has_feature(p_pro uuid, p_feature text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
      from public.pro_features f
      join public.pro_levels l on l.level = f.min_level
     where f.feature = p_feature
       and public.is_verified_professional(p_pro)
       and coalesce((select s.level from public.pro_scores s where s.professional_id = p_pro), 1) >= f.min_level
  );
$$;

-- Parte da plataforma nas assinaturas de membros deste profissional (cai com o nível).
create or replace function public.pro_membership_fee_percent(p_pro uuid)
returns integer language sql stable security definer set search_path = public as $$
  select l.membership_fee_percent
    from public.pro_levels l
   where l.level = coalesce((select s.level from public.pro_scores s where s.professional_id = p_pro), 1);
$$;

-- Nível e selo são públicos; a pontuação exata e o que falta para subir são só do dono e da administração.
create or replace function public.get_pro_status(p_pro uuid default auth.uid())
returns table (
  professional_id uuid, level integer, level_code text, excellence boolean,
  score integer, next_level integer, next_level_code text, next_level_score integer,
  fee_percent integer, features text[]
)
language sql stable security definer set search_path = public as $$
  with me as (
    select p_pro as id,
           coalesce(s.level, 1) as level,
           coalesce(s.score, 0) as score,
           (p_pro = auth.uid() or public.is_platform_admin()) as private_ok
      from public.professionals pr
      left join public.pro_scores s on s.professional_id = pr.user_id
     where pr.user_id = p_pro and auth.uid() is not null
  )
  select me.id, me.level, l.code,
         (select count(*) > 0 from public.pro_levels x where x.level = me.level and x.requires_clean_record),
         case when me.private_ok then me.score end,
         case when me.private_ok then n.level end,
         case when me.private_ok then n.code end,
         case when me.private_ok then n.min_score end,
         l.membership_fee_percent,
         coalesce((select array_agg(f.feature order by f.feature) from public.pro_features f where f.min_level <= me.level), '{}')
    from me
    join public.pro_levels l on l.level = me.level
    left join public.pro_levels n on n.level = (select min(x.level) from public.pro_levels x where x.level > me.level);
$$;

-- Histórico de pontos da própria pessoa.
create or replace function public.get_my_pro_events(p_limit integer default 30)
returns table (id uuid, kind text, points integer, note text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select e.id, e.kind, e.points, e.note, e.created_at
    from public.pro_score_events e
   where e.professional_id = auth.uid()
   order by e.created_at desc
   limit least(greatest(coalesce(p_limit, 30), 1), 100);
$$;

-- Regras completas, para a tela explicar como pontuar.
create or replace function public.get_pro_rules()
returns jsonb language sql stable security definer set search_path = public as $$
  select case when auth.uid() is null then null else jsonb_build_object(
    'levels', (select jsonb_agg(to_jsonb(l) order by l.level) from public.pro_levels l),
    'rules', (select jsonb_agg(to_jsonb(r) order by r.points desc) from public.pro_score_rules r where r.active and r.kind <> 'ajuste_admin'),
    'features', (select jsonb_agg(to_jsonb(f) order by f.min_level, f.feature) from public.pro_features f)
  ) end;
$$;

-- Ajuste manual (com justificativa obrigatória), só da administração.
create or replace function public.admin_adjust_pro_score(p_pro uuid, p_points integer, p_note text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then
    raise exception 'Apenas a administração ajusta pontuações.' using errcode = '42501';
  end if;
  if coalesce(trim(p_note), '') = '' then
    raise exception 'Informe o motivo do ajuste.';
  end if;
  if p_points is null or p_points = 0 or abs(p_points) > 1000 then
    raise exception 'Ajuste entre -1000 e 1000 pontos, diferente de zero.';
  end if;
  perform public._pro_award(p_pro, 'ajuste_admin', 'admin', gen_random_uuid(), trim(p_note), p_points);
end;
$$;

revoke execute on function public.pro_level_for(uuid, integer) from public, anon, authenticated;
revoke execute on function public._pro_apply(uuid, integer) from public, anon, authenticated;
revoke execute on function public._pro_award(uuid, text, text, uuid, text, integer) from public, anon, authenticated;
revoke execute on function public.pro_has_feature(uuid, text) from public, anon;
revoke execute on function public.pro_membership_fee_percent(uuid) from public, anon;
revoke execute on function public.get_pro_status(uuid) from public, anon;
revoke execute on function public.get_my_pro_events(integer) from public, anon;
revoke execute on function public.get_pro_rules() from public, anon;
revoke execute on function public.admin_adjust_pro_score(uuid, integer, text) from public, anon;
grant execute on function public.pro_has_feature(uuid, text) to authenticated;
grant execute on function public.pro_membership_fee_percent(uuid) to authenticated;
grant execute on function public.get_pro_status(uuid) to authenticated;
grant execute on function public.get_my_pro_events(integer) to authenticated;
grant execute on function public.get_pro_rules() to authenticated;
grant execute on function public.admin_adjust_pro_score(uuid, integer, text) to authenticated;

-- Quem já era profissional começa com os pontos da verificação (sem pontuar o passado).
insert into public.pro_score_events (professional_id, kind, points, ref_type, ref_id)
select user_id, 'verificacao', 20, 'professional', user_id from public.professionals
on conflict do nothing;
insert into public.pro_scores (professional_id, score, level)
select user_id, 20, 1 from public.professionals
on conflict do nothing;

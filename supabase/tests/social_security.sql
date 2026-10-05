-- =============================================================================
-- Testes de segurança da rede social (RLS, RPCs e privacidade).
--
-- Como rodar (nada é gravado: tudo acontece numa transação que é desfeita):
--   npx supabase db query --linked -f supabase/tests/social_security.sql
--
-- O script cria usuários de teste, simula cada papel (anon / authenticated com
-- um uid) e termina de propósito com um erro "RESULTADOS: [...]" que contém o
-- relatório em JSON. O erro faz o Postgres desfazer tudo (rollback).
-- Cada item tem { teste, ok, obtido }. ok = false indica um furo ou regressão.
-- =============================================================================

do $test$
declare
  a uuid := 'ffffffff-0000-4000-a000-00000000000a'; -- usuário comum
  b uuid := 'ffffffff-0000-4000-a000-00000000000b'; -- amigo de A
  c uuid := 'ffffffff-0000-4000-a000-00000000000c'; -- perfil PRIVADO
  d uuid := 'ffffffff-0000-4000-a000-00000000000d'; -- bloqueado por A
  e uuid := 'ffffffff-0000-4000-a000-00000000000e'; -- usado no fluxo de pedido
  f uuid := 'ffffffff-0000-4000-a000-00000000000f'; -- estranho
  p uuid := 'ffffffff-0000-4000-a000-000000000010'; -- profissional verificado
  post_amigos uuid;
  post_publico_c uuid;
  post_oculto uuid;
  post_f uuid;
  post_p uuid;
  q uuid := 'ffffffff-0000-4000-a000-000000000011'; -- profissional que atua no tema da comunidade
  cid uuid;
  cid2 uuid;
  ch uuid;
  tp uuid;
  th uuid;
  th_old uuid;
  th_prev uuid;
  opt1 uuid;
  opt2 uuid;
  kid uuid := 'ffffffff-0000-4000-a000-0000000000b1';
  g uuid := 'ffffffff-0000-4000-a000-000000000012'; -- admin da plataforma
  res jsonb := '[]'::jsonb;
  r text;
  tbl text;
begin
  -- Executa sql como um papel. SELECT devolve as linhas em texto; DML devolve OK:<linhas>.
  create function pg_temp.as_user(uid uuid, rl text, q text) returns text language plpgsql as $f$
  declare outv text; n bigint;
  begin
    perform set_config('request.jwt.claims',
      case when uid is null then '' else json_build_object('sub', uid, 'role', rl)::text end, true);
    perform set_config('request.jwt.claim.sub', coalesce(uid::text, ''), true);
    execute format('set local role %I', rl);
    begin
      if lower(left(trim(q), 6)) = 'select' then
        -- x::text devolve "(valor)"; os parênteses externos são removidos para comparar o valor puro.
        execute format('select coalesce(string_agg(regexp_replace(x::text, ''^\((.*)\)$'', ''\1''), '' | ''), ''<vazio>'') from (%s) x', q) into outv;
      else
        execute q;
        get diagnostics n = row_count;
        outv := 'OK:' || n;
      end if;
    exception when others then
      outv := 'ERRO: ' || sqlerrm;
    end;
    reset role;
    -- Sem sessão depois da chamada: as inserções diretas do teste valem como a plataforma (sem a trava de IA).
    perform set_config('request.jwt.claims', '', true);
    perform set_config('request.jwt.claim.sub', '', true);
    return outv;
  end $f$;

  -- ---------------------------------------------------------------- dados
  insert into auth.users (id, aud, role, email, raw_user_meta_data) values
    (a, 'authenticated', 'authenticated', 'zzqx.a@teste.invalid', '{"name":"Zzqx Alice","birth_date":"1990-01-01","goal":"Objetivo secreto A"}'),
    (b, 'authenticated', 'authenticated', 'zzqx.b@teste.invalid', '{"name":"Zzqx Bruno","birth_date":"1990-01-01"}'),
    (c, 'authenticated', 'authenticated', 'zzqx.c@teste.invalid', '{"name":"Zzqx Carla","birth_date":"1990-01-01","goal":"Objetivo privado da Carla"}'),
    (d, 'authenticated', 'authenticated', 'zzqx.d@teste.invalid', '{"name":"Zzqx Daniel","birth_date":"1990-01-01"}'),
    (e, 'authenticated', 'authenticated', 'zzqx.e@teste.invalid', '{"name":"Zzqx Eva","birth_date":"1990-01-01"}'),
    (f, 'authenticated', 'authenticated', 'zzqx.f@teste.invalid', '{"name":"Zzqx Fabio","birth_date":"1990-01-01"}'),
    (p, 'authenticated', 'authenticated', 'zzqx.p@teste.invalid', '{"name":"Zzqxprof Hélena","birth_date":"1990-01-01"}');
  insert into public.professionals (user_id, profession, council, registration, uf)
    values (p, 'Nutricionista', 'CRN-3', 'TESTE', 'SP');
  insert into auth.users (id, aud, role, email, raw_user_meta_data)
    values (q, 'authenticated', 'authenticated', 'zzqx.q@teste.invalid', '{"name":"Zzqxprof Quirino","birth_date":"1990-01-01"}');
  insert into public.professionals (user_id, profession, council, registration, uf, specialties)
    values (q, 'Nutricionista', 'CRN-3', 'TESTE2', 'SP', array['Zzqx Tema']);
  insert into auth.users (id, aud, role, email, raw_user_meta_data)
    values (g, 'authenticated', 'authenticated', 'zzqx.g@teste.invalid', '{"name":"Zzqx Gestora","birth_date":"1990-01-01"}');
  insert into public.platform_admins (user_id) values (g);
  update public.profiles set is_private = true, bio = 'Bio privada da Carla' where id = c;
  insert into public.friendships (requester_id, addressee_id, status) values
    (a, b, 'aceita'), (b, c, 'aceita');
  insert into public.blocks (blocker_id, blocked_id) values (a, d);
  insert into public.care_links (patient_id, professional_id) values (c, p); -- p atende c (pendente)

  insert into public.posts (author_id, body, audience) values (a, 'post só para amigos de A', 'amigos')
    returning id into post_amigos;
  insert into public.posts (author_id, body, audience) values (c, 'post público de perfil privado', 'publico')
    returning id into post_publico_c;
  insert into public.posts (author_id, body, hidden) values (b, 'post oculto por moderação', false)
    returning id into post_oculto;
  update public.posts set hidden = true where id = post_oculto;
  insert into public.posts (author_id, body) values (f, 'post público de F') returning id into post_f;
  insert into public.posts (author_id, body) values (p, 'post público do profissional') returning id into post_p;
  insert into public.comments (post_id, author_id, body) values (post_f, c, 'comentário da Carla (perfil privado)');

  -- --------------------------------------------------------------- ANÔNIMO
  foreach tbl in array array['profile_private','professionals','posts','comments','friendships',
                             'follows','blocks','notifications','user_settings','post_reactions',
                             'saved_posts','care_links','messages','reports','profiles',
                             'professional_directory'] loop
    r := pg_temp.as_user(null, 'anon', format('select * from public.%I limit 3', tbl));
    res := res || jsonb_build_object('teste', 'anon não lê ' || tbl,
      'ok', (r = '<vazio>' or r like 'ERRO%'), 'obtido', left(r, 80));
  end loop;

  r := pg_temp.as_user(null, 'anon',
    format('select name, bio, goal, journey_goal from public.profiles where id = %L', c));
  res := res || jsonb_build_object('teste', 'anon NÃO lê bio/objetivo de perfil privado direto em profiles',
    'ok', (r = '<vazio>' or r like 'ERRO%'), 'obtido', left(r, 160));

  r := pg_temp.as_user(a, 'authenticated',
    format('select name, bio, goal, journey_goal from public.profiles where id = %L', c));
  res := res || jsonb_build_object('teste', 'estranho NÃO lê bio/objetivo de perfil privado direto em profiles',
    'ok', (r = '<vazio>' or r like 'ERRO%' or (r not like '%Bio privada%' and r not like '%Objetivo privado%')),
    'obtido', left(r, 160));

  r := pg_temp.as_user(null, 'anon', format('select * from public.friend_ids(%L)', a));
  res := res || jsonb_build_object('teste', 'anon NÃO consegue listar amigos de alguém (friend_ids)',
    'ok', (r not like '%' || b::text || '%'), 'obtido', left(r, 80));

  r := pg_temp.as_user(null, 'anon', format('select public.are_friends(%L, %L)', a, b));
  res := res || jsonb_build_object('teste', 'anon NÃO consegue sondar amizade (are_friends)',
    'ok', (r <> 't'), 'obtido', left(r, 80));

  r := pg_temp.as_user(null, 'anon', format('select public.is_blocked_between(%L, %L)', a, d));
  res := res || jsonb_build_object('teste', 'anon NÃO consegue sondar bloqueios (is_blocked_between)',
    'ok', (r <> 't'), 'obtido', left(r, 80));

  r := pg_temp.as_user(null, 'anon', format('select public.can_view_post(%L, %L)', post_amigos, b));
  res := res || jsonb_build_object('teste', 'anon NÃO consegue sondar visibilidade de post (can_view_post)',
    'ok', (r <> 't'), 'obtido', left(r, 80));

  r := pg_temp.as_user(null, 'anon', 'select public.log_search(''zzqx abuso'')');
  res := res || jsonb_build_object('teste', 'anon NÃO pode alimentar as buscas do tema da semana (log_search)',
    'ok', (r like 'ERRO%'), 'obtido', left(r, 80));

  -- --------------------------------------------- AMIZADE / SEGUIR / BLOQUEIO
  r := pg_temp.as_user(a, 'authenticated', format('select public.request_friendship(%L)', p));
  res := res || jsonb_build_object('teste', 'usuário comum NÃO pede amizade a profissional',
    'ok', (r like 'ERRO%'), 'obtido', left(r, 100));

  r := pg_temp.as_user(p, 'authenticated', format('select public.request_friendship(%L)', a));
  res := res || jsonb_build_object('teste', 'profissional NÃO pede amizade a usuário comum',
    'ok', (r like 'ERRO%'), 'obtido', left(r, 100));

  r := pg_temp.as_user(d, 'authenticated', format('select public.request_friendship(%L)', a));
  res := res || jsonb_build_object('teste', 'bloqueado NÃO consegue pedir amizade a quem o bloqueou',
    'ok', (r like 'ERRO%'), 'obtido', left(r, 100));

  r := pg_temp.as_user(a, 'authenticated', format('select status from public.request_friendship(%L)', e));
  res := res || jsonb_build_object('teste', 'pedido de amizade A→E fica pendente',
    'ok', (r = 'pendente'), 'obtido', r);

  r := pg_temp.as_user(f, 'authenticated',
    format('select public.respond_friendship(id, true) from public.friendships where requester_id = %L', a));
  res := res || jsonb_build_object('teste', 'terceiro (F) NÃO consegue aceitar pedido alheio',
    'ok', (r like 'ERRO%' or r = '<vazio>'), 'obtido', left(r, 100));

  r := pg_temp.as_user(e, 'authenticated',
    format('select status from public.respond_friendship((select id from public.friendships where requester_id = %L and addressee_id = %L), true)', a, e));
  res := res || jsonb_build_object('teste', 'destinatário (E) aceita o pedido',
    'ok', (r = 'aceita'), 'obtido', r);

  r := pg_temp.as_user(a, 'authenticated', format('insert into public.friendships (requester_id, addressee_id, status) values (%L, %L, ''aceita'')', a, f));
  res := res || jsonb_build_object('teste', 'usuário NÃO cria amizade já aceita direto na tabela',
    'ok', (r like 'ERRO%'), 'obtido', left(r, 100));

  r := pg_temp.as_user(a, 'authenticated', format('insert into public.follows (follower_id, followee_id) values (%L, %L)', a, p));
  res := res || jsonb_build_object('teste', 'usuário segue profissional', 'ok', (r = 'OK:1'), 'obtido', r);

  r := pg_temp.as_user(p, 'authenticated', format('insert into public.follows (follower_id, followee_id) values (%L, %L)', p, a));
  res := res || jsonb_build_object('teste', 'profissional NÃO segue usuário comum',
    'ok', (r like 'ERRO%'), 'obtido', left(r, 100));

  r := pg_temp.as_user(d, 'authenticated', format('insert into public.follows (follower_id, followee_id) values (%L, %L)', d, p));
  res := res || jsonb_build_object('teste', 'D segue profissional (D não bloqueou ninguém além de A)', 'ok', (r = 'OK:1'), 'obtido', r);

  -- ----------------------------------------------------- PRIVACIDADE / POSTS
  r := pg_temp.as_user(b, 'authenticated', format('select count(*) from public.posts where id = %L', post_amigos));
  res := res || jsonb_build_object('teste', 'amigo (B) vê post só-amigos de A', 'ok', (r = '1'), 'obtido', r);

  r := pg_temp.as_user(f, 'authenticated', format('select count(*) from public.posts where id = %L', post_amigos));
  res := res || jsonb_build_object('teste', 'estranho (F) NÃO vê post só-amigos de A', 'ok', (r = '0'), 'obtido', r);

  r := pg_temp.as_user(d, 'authenticated', format('select count(*) from public.posts where id = %L', post_amigos));
  res := res || jsonb_build_object('teste', 'bloqueado (D) NÃO vê post de A', 'ok', (r = '0'), 'obtido', r);

  r := pg_temp.as_user(a, 'authenticated', format('select count(*) from public.posts where id = %L', post_publico_c));
  res := res || jsonb_build_object('teste', 'não-amigo NÃO vê post de perfil privado (C)', 'ok', (r = '0'), 'obtido', r);

  r := pg_temp.as_user(b, 'authenticated', format('select count(*) from public.posts where id = %L', post_publico_c));
  res := res || jsonb_build_object('teste', 'amigo de C (B) vê post do perfil privado', 'ok', (r = '1'), 'obtido', r);

  r := pg_temp.as_user(a, 'authenticated', format('select count(*) from public.posts where id = %L', post_oculto));
  res := res || jsonb_build_object('teste', 'post ocultado por moderação some para os outros', 'ok', (r = '0'), 'obtido', r);

  r := pg_temp.as_user(a, 'authenticated',
    format('insert into public.comments (post_id, author_id, body) values (%L, %L, ''oi'')', post_publico_c, a));
  res := res || jsonb_build_object('teste', 'NÃO comenta em post que não pode ver', 'ok', (r like 'ERRO%'), 'obtido', left(r, 100));

  r := pg_temp.as_user(a, 'authenticated',
    format('insert into public.post_reactions (post_id, user_id, kind) values (%L, %L, ''curtir'')', post_publico_c, a));
  res := res || jsonb_build_object('teste', 'NÃO reage a post que não pode ver', 'ok', (r like 'ERRO%'), 'obtido', left(r, 100));

  r := pg_temp.as_user(a, 'authenticated',
    format('insert into public.comments (post_id, author_id, body) values (%L, %L, ''oi'')', post_amigos, b));
  res := res || jsonb_build_object('teste', 'NÃO comenta fingindo ser outra pessoa', 'ok', (r like 'ERRO%'), 'obtido', left(r, 100));

  r := pg_temp.as_user(f, 'authenticated', format('delete from public.posts where id = %L', post_amigos));
  res := res || jsonb_build_object('teste', 'estranho NÃO apaga post alheio', 'ok', (r like 'ERRO%' or r = 'OK:0'), 'obtido', r);

  r := pg_temp.as_user(a, 'authenticated', format('update public.posts set hidden = true where id = %L', post_amigos));
  res := res || jsonb_build_object('teste', 'autor NÃO altera o campo hidden (moderação)', 'ok', (r like 'ERRO%'), 'obtido', left(r, 100));

  r := pg_temp.as_user(a, 'authenticated',
    'insert into public.posts (author_id, body, publish_at) values (''' || a || ''', ''agendado'', now() + interval ''2 days'')');
  res := res || jsonb_build_object('teste', 'usuário comum NÃO agenda post', 'ok', (r like 'ERRO%'), 'obtido', left(r, 100));

  -- A trava de IA exige uma aprovação do mesmo conteúdo antes de cada publicação.
  insert into public.content_approvals (user_id, kind, body) values (p, 'post', 'agendado');
  r := pg_temp.as_user(p, 'authenticated',
    'insert into public.posts (author_id, body, publish_at) values (''' || p || ''', ''agendado'', now() + interval ''2 days'')');
  res := res || jsonb_build_object('teste', 'profissional agenda post', 'ok', (r = 'OK:1'), 'obtido', r);

  -- -------------------------------------------------- DADOS PRIVADOS / PODER
  r := pg_temp.as_user(a, 'authenticated', format('select email from public.profile_private where id = %L', b));
  res := res || jsonb_build_object('teste', 'NÃO lê e-mail/CPF/telefone de outra pessoa', 'ok', (r = '<vazio>'), 'obtido', left(r, 80));

  r := pg_temp.as_user(a, 'authenticated', format('select * from public.user_settings where id = %L', b));
  res := res || jsonb_build_object('teste', 'NÃO lê configurações de outra pessoa', 'ok', (r = '<vazio>'), 'obtido', left(r, 80));

  r := pg_temp.as_user(a, 'authenticated', format('update public.profiles set role = ''profissional'' where id = %L', a));
  res := res || jsonb_build_object('teste', 'usuário NÃO vira "profissional" sozinho', 'ok', (r like 'ERRO%'), 'obtido', left(r, 100));

  r := pg_temp.as_user(a, 'authenticated', format('update public.profiles set name = ''hackeado'' where id = %L', b));
  res := res || jsonb_build_object('teste', 'usuário NÃO edita perfil alheio', 'ok', (r = 'OK:0' or r like 'ERRO%'), 'obtido', r);

  r := pg_temp.as_user(a, 'authenticated', format('insert into public.platform_admins (user_id) values (%L)', a));
  res := res || jsonb_build_object('teste', 'usuário NÃO se torna admin da plataforma', 'ok', (r like 'ERRO%'), 'obtido', left(r, 100));

  r := pg_temp.as_user(a, 'authenticated', format('insert into public.professionals (user_id, profession, council, registration, uf) values (%L, ''X'', ''Y'', ''Z'', ''SP'')', a));
  res := res || jsonb_build_object('teste', 'usuário NÃO se auto-verifica como profissional', 'ok', (r like 'ERRO%'), 'obtido', left(r, 100));

  r := pg_temp.as_user(a, 'authenticated',
    format('insert into public.notifications (user_id, type, actor_id) values (%L, ''curtida'', %L)', b, a));
  res := res || jsonb_build_object('teste', 'usuário NÃO cria notificação para outra pessoa', 'ok', (r like 'ERRO%'), 'obtido', left(r, 100));

  r := pg_temp.as_user(a, 'authenticated', format('select * from public.professional_mp_accounts limit 3'));
  res := res || jsonb_build_object('teste', 'NÃO lê contas do Mercado Pago de profissionais', 'ok', (r = '<vazio>' or r like 'ERRO%'), 'obtido', left(r, 80));

  -- ------------------------------------------------------------- PESQUISA
  r := pg_temp.as_user(a, 'authenticated', 'select name from public.search_users(''zzqx'', null, null, null, null, false, 50, 0)');
  res := res || jsonb_build_object('teste', 'pesquisa NÃO mostra quem A bloqueou (D)', 'ok', (r not like '%Daniel%'), 'obtido', left(r, 160));
  res := res || jsonb_build_object('teste', 'pesquisa mostra o profissional', 'ok', (r like '%Hélena%'), 'obtido', left(r, 160));

  r := pg_temp.as_user(a, 'authenticated', 'select name from public.search_users(''zzqxprof helena'', null, null, null, null, false, 50, 0)');
  res := res || jsonb_build_object('teste', 'pesquisa ignora acento ("helena" acha "Hélena")', 'ok', (r like '%Hélena%'), 'obtido', left(r, 120));

  r := pg_temp.as_user(a, 'authenticated', 'select name from public.search_users(''zzqxprof helna'', null, null, null, null, false, 50, 0)');
  res := res || jsonb_build_object('teste', 'pesquisa tolera erro de digitação ("helna")', 'ok', (r like '%Hélena%'), 'obtido', left(r, 120));

  r := pg_temp.as_user(a, 'authenticated', 'select name, bio, is_private from public.search_users(''zzqx carla'', null, null, null, null, false, 5, 0)');
  res := res || jsonb_build_object('teste', 'pesquisa esconde a bio de perfil privado', 'ok', (r like '%Carla%' and r not like '%Bio privada%'), 'obtido', left(r, 160));

  r := pg_temp.as_user(d, 'authenticated', 'select name from public.search_users(''zzqx alice'', null, null, null, null, false, 5, 0)');
  res := res || jsonb_build_object('teste', 'quem foi bloqueado NÃO encontra o bloqueador na pesquisa', 'ok', (r not like '%Alice%'), 'obtido', left(r, 120));

  r := pg_temp.as_user(null, 'anon', 'select * from public.search_users(''zzqx'')');
  res := res || jsonb_build_object('teste', 'anon NÃO usa a pesquisa de usuários', 'ok', (r like 'ERRO%'), 'obtido', left(r, 80));

  r := pg_temp.as_user(a, 'authenticated', format('select can_view_content, bio from public.get_public_profile(%L)', c));
  res := res || jsonb_build_object('teste', 'get_public_profile nega conteúdo de perfil privado a não-amigo',
    'ok', (r like 'f%' and r not like '%Bio privada%'), 'obtido', left(r, 120));

  -- ---------------------------- OPERAÇÕES LEGÍTIMAS (usadas por src/lib/social/api.ts)
  r := pg_temp.as_user(a, 'authenticated', format('update public.profiles set is_private = true where id = %L', a));
  res := res || jsonb_build_object('teste', 'dono liga o próprio perfil privado', 'ok', (r = 'OK:1'), 'obtido', r);

  r := pg_temp.as_user(a, 'authenticated', format('update public.user_settings set show_email = true, notification_prefs = ''{"social": false}'' where id = %L', a));
  res := res || jsonb_build_object('teste', 'dono altera as próprias configurações', 'ok', (r = 'OK:1'), 'obtido', r);

  r := pg_temp.as_user(a, 'authenticated', format('select status from public.request_friendship(%L)', f));
  res := res || jsonb_build_object('teste', 'pedido A→F fica pendente', 'ok', (r = 'pendente'), 'obtido', r);

  r := pg_temp.as_user(f, 'authenticated', format('select count(*) from public.friendships where addressee_id = %L and status = ''pendente''', f));
  res := res || jsonb_build_object('teste', 'destinatário lista seus pedidos pendentes', 'ok', (r = '1'), 'obtido', r);

  r := pg_temp.as_user(a, 'authenticated', format('insert into public.blocks (blocker_id, blocked_id) values (%L, %L)', a, f));
  res := res || jsonb_build_object('teste', 'dono bloqueia alguém', 'ok', (r = 'OK:1'), 'obtido', r);

  r := pg_temp.as_user(a, 'authenticated', format('select count(*) from public.friendships where addressee_id = %L', f));
  res := res || jsonb_build_object('teste', 'bloquear cancela o pedido pendente', 'ok', (r = '0'), 'obtido', r);

  r := pg_temp.as_user(a, 'authenticated', format('delete from public.blocks where blocker_id = %L and blocked_id = %L', a, f));
  res := res || jsonb_build_object('teste', 'dono desbloqueia', 'ok', (r = 'OK:1'), 'obtido', r);

  r := pg_temp.as_user(f, 'authenticated', format('delete from public.blocks where blocker_id = %L and blocked_id = %L', a, c));
  res := res || jsonb_build_object('teste', 'terceiro NÃO apaga bloqueio alheio', 'ok', (r = 'OK:0' or r like 'ERRO%'), 'obtido', r);

  -- ------------------------------------------------ LEITURA DE PERFIS (profiles)
  -- (neste ponto A está com perfil privado e não tem vínculo com P)
  r := pg_temp.as_user(b, 'authenticated', format('select name from public.profiles where id = %L', c));
  res := res || jsonb_build_object('teste', 'amigo lê a linha de um perfil privado', 'ok', (r like '%Carla%'), 'obtido', r);

  r := pg_temp.as_user(p, 'authenticated', format('select name from public.profiles where id = %L', c));
  res := res || jsonb_build_object('teste', 'profissional com vínculo lê o paciente privado', 'ok', (r like '%Carla%'), 'obtido', r);

  r := pg_temp.as_user(p, 'authenticated', format('select name from public.profiles where id = %L', a));
  res := res || jsonb_build_object('teste', 'profissional SEM vínculo NÃO lê perfil privado', 'ok', (r = '<vazio>'), 'obtido', r);

  r := pg_temp.as_user(f, 'authenticated', format('select name from public.profiles where id = %L', e));
  res := res || jsonb_build_object('teste', 'logado lê perfil não privado', 'ok', (r like '%Eva%'), 'obtido', r);

  r := pg_temp.as_user(c, 'authenticated', format('select name from public.profiles where id = %L', c));
  res := res || jsonb_build_object('teste', 'dono sempre lê o próprio perfil privado', 'ok', (r like '%Carla%'), 'obtido', r);

  r := pg_temp.as_user(d, 'authenticated', format('select name from public.profiles where id = %L', a));
  res := res || jsonb_build_object('teste', 'bloqueado NÃO lê a linha de quem o bloqueou', 'ok', (r = '<vazio>'), 'obtido', r);

  r := pg_temp.as_user(a, 'authenticated', 'select count(*) from public.professionals');
  res := res || jsonb_build_object('teste', 'logado lê a vitrine de profissionais', 'ok', (r::bigint >= 1), 'obtido', r);

  r := pg_temp.as_user(a, 'authenticated', 'select count(*) from public.professional_directory');
  res := res || jsonb_build_object('teste', 'logado lê professional_directory', 'ok', (r::bigint >= 1), 'obtido', r);

  r := pg_temp.as_user(a, 'authenticated', format('select name, username from public.person_cards(array[%L::uuid])', c));
  res := res || jsonb_build_object('teste', 'person_cards mostra nome e @ de perfil privado', 'ok', (r like '%Carla%'), 'obtido', r);

  r := pg_temp.as_user(a, 'authenticated', format('select bio from public.person_cards(array[%L::uuid])', c));
  res := res || jsonb_build_object('teste', 'person_cards NÃO tem coluna bio', 'ok', (r like 'ERRO%'), 'obtido', left(r, 80));

  r := pg_temp.as_user(a, 'authenticated', format('select name from public.person_cards(array[%L::uuid])', d));
  res := res || jsonb_build_object('teste', 'person_cards não devolve quem tem bloqueio com A', 'ok', (r = '<vazio>'), 'obtido', r);

  r := pg_temp.as_user(null, 'anon', format('select name from public.person_cards(array[%L::uuid])', c));
  res := res || jsonb_build_object('teste', 'anon NÃO usa person_cards', 'ok', (r like 'ERRO%'), 'obtido', left(r, 80));

  r := pg_temp.as_user(a, 'authenticated', 'select name from public.list_my_blocks()');
  res := res || jsonb_build_object('teste', 'list_my_blocks mostra o bloqueado com nome', 'ok', (r like '%Daniel%'), 'obtido', r);

  r := pg_temp.as_user(f, 'authenticated', 'select name from public.list_my_blocks()');
  res := res || jsonb_build_object('teste', 'list_my_blocks NÃO mostra bloqueios de outras pessoas', 'ok', (r = '<vazio>'), 'obtido', r);

  r := pg_temp.as_user(null, 'anon', 'select * from public.list_my_blocks()');
  res := res || jsonb_build_object('teste', 'anon NÃO usa list_my_blocks', 'ok', (r like 'ERRO%'), 'obtido', left(r, 80));

  -- ------------------------------------------------ log_search e privacidade
  perform pg_temp.as_user(a, 'authenticated', 'select public.log_search(''marmita zzqx fit'')');
  perform pg_temp.as_user(a, 'authenticated', 'select public.log_search(''zzqx bruno'')');
  perform pg_temp.as_user(a, 'authenticated', 'select public.log_search(''zzqx.bruno'')');
  perform pg_temp.as_user(a, 'authenticated', 'select public.log_search(''zzqx'')');
  res := res || jsonb_build_object('teste', 'log_search registra assunto comum',
    'ok', exists (select 1 from public.search_term_stats where term = 'marmita zzqx fit'),
    'obtido', 'verificado como superusuário');
  res := res || jsonb_build_object('teste', 'log_search IGNORA o nome completo de uma pessoa',
    'ok', not exists (select 1 from public.search_term_stats where term = 'zzqx bruno'),
    'obtido', 'verificado como superusuário');
  res := res || jsonb_build_object('teste', 'log_search IGNORA o @ de uma pessoa',
    'ok', not exists (select 1 from public.search_term_stats where term = 'zzqx.bruno'),
    'obtido', 'verificado como superusuário');
  res := res || jsonb_build_object('teste', 'log_search registra termo de uma palavra que não é nome completo',
    'ok', exists (select 1 from public.search_term_stats where term = 'zzqx'),
    'obtido', 'verificado como superusuário');

  -- ------------------------------------------------------------------ get_feed
  r := pg_temp.as_user(a, 'authenticated', format('select author_name from public.get_feed(p_scope := ''todos'') where id = %L', post_f));
  res := res || jsonb_build_object('teste', 'feed mostra o autor de um post público', 'ok', (r like '%Fabio%'), 'obtido', r);

  r := pg_temp.as_user(a, 'authenticated', format('select comments -> 0 ->> ''author_name'' from public.get_feed(p_scope := ''todos'') where id = %L', post_f));
  res := res || jsonb_build_object('teste', 'comentário de autor PRIVADO continua no feed (nome do cartão)', 'ok', (r like '%Carla%'), 'obtido', r);

  r := pg_temp.as_user(a, 'authenticated', format('select count(*) from public.get_feed(p_scope := ''post'', p_post := %L)', post_f));
  res := res || jsonb_build_object('teste', 'escopo post devolve a publicação pedida', 'ok', (r = '1'), 'obtido', r);

  r := pg_temp.as_user(f, 'authenticated', format('select count(*) from public.get_feed(p_scope := ''post'', p_post := %L)', post_amigos));
  res := res || jsonb_build_object('teste', 'escopo post NÃO devolve post que a pessoa não pode ver', 'ok', (r = '0'), 'obtido', r);

  r := pg_temp.as_user(b, 'authenticated', format('select count(*) from public.get_feed(p_scope := ''amigos'') where id = %L', post_amigos));
  res := res || jsonb_build_object('teste', 'escopo amigos mostra post de amigo', 'ok', (r = '1'), 'obtido', r);

  r := pg_temp.as_user(f, 'authenticated', format('select count(*) from public.get_feed(p_scope := ''amigos'') where id = %L', post_amigos));
  res := res || jsonb_build_object('teste', 'escopo amigos NÃO mostra post de quem não é amigo', 'ok', (r = '0'), 'obtido', r);

  r := pg_temp.as_user(a, 'authenticated', format('select count(*) from public.get_feed(p_scope := ''seguindo'') where id = %L', post_p));
  res := res || jsonb_build_object('teste', 'escopo seguindo mostra post de profissional seguido', 'ok', (r = '1'), 'obtido', r);

  r := pg_temp.as_user(f, 'authenticated', format('select count(*) from public.get_feed(p_scope := ''seguindo'') where id = %L', post_p));
  res := res || jsonb_build_object('teste', 'escopo seguindo NÃO mostra profissional que não sigo', 'ok', (r = '0'), 'obtido', r);

  r := pg_temp.as_user(a, 'authenticated', format('insert into public.post_reactions (post_id, user_id, kind) values (%L, %L, ''apoiar'')', post_f, a));
  res := res || jsonb_build_object('teste', 'pessoa apoia um post público', 'ok', (r = 'OK:1'), 'obtido', r);

  r := pg_temp.as_user(b, 'authenticated', format('select cardinality(supports) from public.get_feed(p_scope := ''todos'') where id = %L', post_f));
  res := res || jsonb_build_object('teste', 'feed reflete o apoio de outra pessoa', 'ok', (r = '1'), 'obtido', r);

  r := pg_temp.as_user(d, 'authenticated', format('select count(*) from public.get_feed(p_scope := ''todos'') where id = %L', post_amigos));
  res := res || jsonb_build_object('teste', 'feed NÃO mostra post de quem bloqueou o leitor', 'ok', (r = '0'), 'obtido', r);

  r := pg_temp.as_user(null, 'anon', 'select count(*) from public.get_feed()');
  res := res || jsonb_build_object('teste', 'anon NÃO usa o feed', 'ok', (r like 'ERRO%'), 'obtido', left(r, 80));

  r := pg_temp.as_user(a, 'authenticated', format('select count(*) from public.get_feed(p_scope := ''todos'', p_query := ''PÚBLICO do profissional'') where id = %L', post_p));
  res := res || jsonb_build_object('teste', 'busca no feed ignora acento e caixa', 'ok', (r = '1'), 'obtido', r);

  -- ------------------------------------------------------------------ publicar
  insert into public.content_approvals (user_id, kind, title, body, tags, recipe)
    values (f, 'post', 'Bolo', 'modo de fazer', array['bolo'], '{"prepTime":"30 min","servings":"4","difficulty":"Fácil","ingredients":["ovo"],"steps":["misturar"],"category":"Doces"}'::jsonb);
  r := pg_temp.as_user(f, 'authenticated', format(
    'insert into public.posts (author_id, type, title, body, tags, audience, recipe, block_order) values (%L, ''receita'', ''Bolo'', ''modo de fazer'', array[''bolo''], ''amigos'', ''{"prepTime":"30 min","servings":"4","difficulty":"Fácil","ingredients":["ovo"],"steps":["misturar"],"category":"Doces"}''::jsonb, array[''title'',''image'',''text'',''recipe''])', f));
  res := res || jsonb_build_object('teste', 'pessoa publica receita só para amigos (recipe + block_order)', 'ok', (r = 'OK:1'), 'obtido', r);

  r := pg_temp.as_user(a, 'authenticated', format('insert into public.posts (author_id, body) values (%L, ''fingindo ser B'')', b));
  res := res || jsonb_build_object('teste', 'NÃO publica como outra pessoa', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));

  insert into public.content_approvals (user_id, kind, body) values (a, 'post', 'tentando forçar');
  r := pg_temp.as_user(a, 'authenticated', format('insert into public.posts (author_id, body, hidden, pinned) values (%L, ''tentando forçar'', true, true)', a));
  res := res || jsonb_build_object('teste', 'publicação nasce sem hidden/pinned mesmo se a pessoa tentar forçar', 'ok', (r = 'OK:1'
    and not exists (select 1 from public.posts where body = 'tentando forçar' and (hidden or pinned))), 'obtido', r);

  r := pg_temp.as_user(a, 'authenticated', format('insert into storage.objects (bucket_id, name, owner) values (''post-images'', ''%s/foto.jpg'', %L)', a, a));
  res := res || jsonb_build_object('teste', 'pessoa envia imagem para a PRÓPRIA pasta', 'ok', (r = 'OK:1'), 'obtido', left(r, 90));

  r := pg_temp.as_user(a, 'authenticated', format('insert into storage.objects (bucket_id, name, owner) values (''post-images'', ''%s/foto.jpg'', %L)', b, a));
  res := res || jsonb_build_object('teste', 'pessoa NÃO envia imagem para a pasta de outra', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));

  r := pg_temp.as_user(null, 'anon', format('insert into storage.objects (bucket_id, name) values (''post-images'', ''%s/x.jpg'')', a));
  res := res || jsonb_build_object('teste', 'anon NÃO envia imagem', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));

  r := pg_temp.as_user(a, 'authenticated', format('select count(*) from public.get_feed(p_scope := ''autor'', p_author := %L, p_type := ''receita'')', f));
  res := res || jsonb_build_object('teste', 'receita só-amigos de F NÃO aparece para A (não são amigos)', 'ok', (r = '0'), 'obtido', r);

  -- ------------------------------------------------------- escopo preparados
  r := pg_temp.as_user(a, 'authenticated', format('insert into public.post_reactions (post_id, user_id, kind) values (%L, %L, ''preparei'')', post_f, a));
  res := res || jsonb_build_object('teste', 'pessoa marca "Eu preparei"', 'ok', (r = 'OK:1'), 'obtido', r);

  r := pg_temp.as_user(b, 'authenticated', format('select count(*) from public.get_feed(p_scope := ''preparados'', p_author := %L) where id = %L', a, post_f));
  res := res || jsonb_build_object('teste', 'escopo preparados lista o que A preparou (visto por B)', 'ok', (r = '1'), 'obtido', r);

  r := pg_temp.as_user(b, 'authenticated', format('select count(*) from public.get_feed(p_scope := ''preparados'', p_author := %L)', f));
  res := res || jsonb_build_object('teste', 'escopo preparados NÃO lista quem F não preparou', 'ok', (r = '0'), 'obtido', r);

  r := pg_temp.as_user(d, 'authenticated', format('select count(*) from public.get_feed(p_scope := ''preparados'', p_author := %L)', a));
  res := res || jsonb_build_object('teste', 'escopo preparados respeita bloqueio (D não vê nada de A)', 'ok', (r = '0' or r like 'ERRO%'), 'obtido', r);

  -- ------------------------------------------------------------- comunidades
  r := pg_temp.as_user(p, 'authenticated', 'select public.create_community(''Zzqx Prof'', ''x'', ''Zzqx Tema'')');
  res := res || jsonb_build_object('teste', 'profissional NÃO cria comunidade', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
  r := pg_temp.as_user(e, 'authenticated', 'select status from public.create_community(''Zzqx Comunidade'', ''teste'', ''Zzqx Tema'')');
  res := res || jsonb_build_object('teste', 'usuário cria comunidade (nasce pendente)', 'ok', (r = 'pendente'), 'obtido', r);
  select id into cid from public.communities where name = 'Zzqx Comunidade';
  r := pg_temp.as_user(e, 'authenticated', 'select public.create_community(''Zzqx Segunda'', ''x'', ''Zzqx Tema'')');
  res := res || jsonb_build_object('teste', 'quem já administra NÃO cria outra', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
  r := pg_temp.as_user(f, 'authenticated', format('select count(*) from public.communities where id = %L', cid));
  res := res || jsonb_build_object('teste', 'comunidade pendente NÃO aparece para qualquer pessoa', 'ok', (r = '0'), 'obtido', r);
  r := pg_temp.as_user(p, 'authenticated', format('select count(*) from public.communities where id = %L', cid));
  res := res || jsonb_build_object('teste', 'profissional vê a comunidade pendente', 'ok', (r = '1'), 'obtido', r);
  r := pg_temp.as_user(f, 'authenticated', format('insert into public.community_members (community_id, user_id) values (%L, %L)', cid, f));
  res := res || jsonb_build_object('teste', 'NÃO entra em comunidade pendente', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
  r := pg_temp.as_user(q, 'authenticated', 'select count(*) from public.my_community_invites() where name like ''Zzqx%''');
  res := res || jsonb_build_object('teste', 'profissional do tema recebe o convite', 'ok', (r = '1'), 'obtido', r);
  r := pg_temp.as_user(p, 'authenticated', 'select count(*) from public.my_community_invites() where name like ''Zzqx%''');
  res := res || jsonb_build_object('teste', 'profissional de outro tema NÃO é convidado (há quem atue no tema)', 'ok', (r = '0'), 'obtido', r);
  r := pg_temp.as_user(f, 'authenticated', format('select count(*) from public.community_candidates(%L)', cid));
  res := res || jsonb_build_object('teste', 'estranho NÃO vê a lista de convidados', 'ok', (r = '0'), 'obtido', r);
  r := pg_temp.as_user(e, 'authenticated', format('select count(*) from public.community_candidates(%L) where user_id = %L', cid, q));
  res := res || jsonb_build_object('teste', 'quem criou vê os convidados', 'ok', (r = '1'), 'obtido', r);
  r := pg_temp.as_user(p, 'authenticated', format('select public.accept_community_professional(%L)', cid));
  res := res || jsonb_build_object('teste', 'profissional NÃO convidado não aceita', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
  r := pg_temp.as_user(f, 'authenticated', format('select public.accept_community_professional(%L)', cid));
  res := res || jsonb_build_object('teste', 'usuário comum NÃO aceita ser admin profissional', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
  r := pg_temp.as_user(q, 'authenticated', format('select status from public.accept_community_professional(%L)', cid));
  res := res || jsonb_build_object('teste', 'profissional convidado aceita e a comunidade fica ativa', 'ok', (r = 'ativa'), 'obtido', r);
  r := pg_temp.as_user(d, 'authenticated', 'select status from public.create_community(''Zzqx Outra'', ''x'', ''Zzqx Tema'')');
  res := res || jsonb_build_object('teste', 'outro usuário cria uma segunda comunidade', 'ok', (r = 'pendente'), 'obtido', r);
  select id into cid2 from public.communities where name = 'Zzqx Outra';
  r := pg_temp.as_user(q, 'authenticated', format('select public.accept_community_professional(%L)', cid2));
  res := res || jsonb_build_object('teste', 'profissional que já administra NÃO aceita outra', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
  r := pg_temp.as_user(d, 'authenticated', format('select id from public.leave_community_admin(%L)', cid2));
  res := res || jsonb_build_object('teste', 'admin que sai de comunidade PENDENTE cancela a comunidade', 'ok', (r <> '<vazio>' and not exists (select 1 from public.communities where id = cid2)), 'obtido', r);
  insert into public.content_approvals (user_id, kind, body) values (e, 'post', 'post na comunidade');
  r := pg_temp.as_user(e, 'authenticated', format('insert into public.posts (author_id, body, community_id) values (%L, ''post na comunidade'', %L)', e, cid));
  res := res || jsonb_build_object('teste', 'membro publica em comunidade ativa', 'ok', (r = 'OK:1'), 'obtido', r);
  r := pg_temp.as_user(f, 'authenticated', format('insert into public.posts (author_id, body, community_id) values (%L, ''sem ser membro'', %L)', f, cid));
  res := res || jsonb_build_object('teste', 'não-membro NÃO publica na comunidade', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
  r := pg_temp.as_user(f, 'authenticated', format('insert into public.community_members (community_id, user_id) values (%L, %L)', cid, f));
  res := res || jsonb_build_object('teste', 'pessoa entra em comunidade ativa', 'ok', (r = 'OK:1'), 'obtido', r);
  r := pg_temp.as_user(f, 'authenticated', format('select member_count || '' | '' || is_member || '' | '' || admin_name from public.get_communities(p_slug := (select slug from public.communities where id = %L))', cid));
  res := res || jsonb_build_object('teste', 'get_communities traz contagem, participação e admin', 'ok', (r like '%3 | true | Zzqx Eva%'), 'obtido', r);
  r := pg_temp.as_user(f, 'authenticated', format('select count(*) from public.get_community_members(%L)', cid));
  res := res || jsonb_build_object('teste', 'lista de membros com cartão', 'ok', (r = '3'), 'obtido', r);
  r := pg_temp.as_user(e, 'authenticated', format('select public.toggle_post_pin(id) from public.posts where body = ''post na comunidade'' and community_id = %L', cid));
  res := res || jsonb_build_object('teste', 'admin da comunidade fixa um post', 'ok', (r in ('t', 'true')), 'obtido', r);
  r := pg_temp.as_user(f, 'authenticated', format('select public.toggle_post_pin(id) from public.posts where body = ''post na comunidade'' and community_id = %L', cid));
  res := res || jsonb_build_object('teste', 'membro comum NÃO fixa post', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
  r := pg_temp.as_user(q, 'authenticated', format('select status from public.leave_community_admin(%L)', cid));
  res := res || jsonb_build_object('teste', 'profissional deixa a administração: comunidade suspensa', 'ok', (r = 'suspensa'), 'obtido', r);
  r := pg_temp.as_user(e, 'authenticated', format('insert into public.posts (author_id, body, community_id) values (%L, ''na suspensa'', %L)', e, cid));
  res := res || jsonb_build_object('teste', 'comunidade suspensa NÃO aceita publicação', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
  r := pg_temp.as_user(q, 'authenticated', 'select count(*) from public.my_community_invites() where name like ''Zzqx%''');
  res := res || jsonb_build_object('teste', 'quem saiu NÃO é convidado de volta', 'ok', (r = '0'), 'obtido', r);
  r := pg_temp.as_user(e, 'authenticated', format('select count(*) from public.community_candidates(%L) where user_id <> %L', cid, q));
  res := res || jsonb_build_object('teste', 'sem quem atue no tema, o convite vai para outros candidatos (nunca para quem saiu)', 'ok', (r::integer >= 1), 'obtido', r);
  r := pg_temp.as_user(f, 'authenticated', format('delete from public.community_members where community_id = %L and user_id = %L', cid, f));
  res := res || jsonb_build_object('teste', 'membro comum sai da comunidade', 'ok', (r = 'OK:1'), 'obtido', r);
  r := pg_temp.as_user(e, 'authenticated', format('delete from public.community_members where community_id = %L and user_id = %L', cid, e));
  res := res || jsonb_build_object('teste', 'admin NÃO sai sem deixar a administração', 'ok', (r = 'OK:0' or r like 'ERRO%'), 'obtido', r);

  -- ----------------------------------------------- membros engajados (plataforma)
  insert into public.community_members (community_id, user_id) values (cid, f) on conflict do nothing;
  r := pg_temp.as_user(g, 'authenticated', format('select name from public.community_engaged_members(%L)', cid));
  res := res || jsonb_build_object('teste', 'plataforma vê os membros engajados (sem admin nem profissional)', 'ok', (r like '%Fabio%' and r not like '%Eva%' and r not like '%Quirino%'), 'obtido', r);
  r := pg_temp.as_user(a, 'authenticated', format('select count(*) from public.community_engaged_members(%L)', cid));
  res := res || jsonb_build_object('teste', 'usuário comum NÃO vê os membros engajados', 'ok', (r = '0'), 'obtido', r);
  r := pg_temp.as_user(g, 'authenticated', format('select count(*) from public.communities where id = %L', cid));
  res := res || jsonb_build_object('teste', 'plataforma enxerga qualquer comunidade', 'ok', (r = '1'), 'obtido', r);
  r := pg_temp.as_user(g, 'authenticated', format('select status from public.designate_community_admin_user(%L, %L)', cid, f));
  res := res || jsonb_build_object('teste', 'plataforma indica um membro como admin usuário', 'ok', (r in ('suspensa', 'ativa')), 'obtido', r);
  r := pg_temp.as_user(f, 'authenticated', format('select public.designate_community_admin_user(%L, %L)', cid, f));
  res := res || jsonb_build_object('teste', 'usuário comum NÃO indica admin', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));

  -- ------------------------------------------------------------------ desafios
  insert into public.challenges (title, description, category, badge_label, duration, steps)
    values ('Zzqx Desafio', 'teste', 'Zzqx Tema', 'Selo de teste', '3 dias', array['um', 'dois', 'três']) returning id into ch;
  r := pg_temp.as_user(a, 'authenticated', format('insert into public.challenge_participants (challenge_id, user_id) values (%L, %L)', ch, a));
  res := res || jsonb_build_object('teste', 'pessoa entra num desafio', 'ok', (r = 'OK:1'), 'obtido', r);
  r := pg_temp.as_user(b, 'authenticated', format('insert into public.challenge_participants (challenge_id, user_id) values (%L, %L)', ch, a));
  res := res || jsonb_build_object('teste', 'NÃO inscreve outra pessoa no desafio', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
  r := pg_temp.as_user(a, 'authenticated', format('update public.challenge_participants set completed_steps = array[0, 1] where challenge_id = %L and user_id = %L', ch, a));
  res := res || jsonb_build_object('teste', 'marca passos do desafio', 'ok', (r = 'OK:1' and not exists (select 1 from public.challenge_participants where challenge_id = ch and user_id = a and completed_at is not null)), 'obtido', r);
  r := pg_temp.as_user(a, 'authenticated', format('update public.challenge_participants set completed_steps = array[0, 1, 2] where challenge_id = %L and user_id = %L', ch, a));
  res := res || jsonb_build_object('teste', 'todos os passos concluem o desafio', 'ok', (r = 'OK:1' and exists (select 1 from public.challenge_participants where challenge_id = ch and user_id = a and completed_at is not null)), 'obtido', r);
  r := pg_temp.as_user(b, 'authenticated', format('update public.challenge_participants set completed_steps = array[0] where challenge_id = %L and user_id = %L', ch, a));
  res := res || jsonb_build_object('teste', 'NÃO altera o progresso de outra pessoa', 'ok', (r = 'OK:0' or r like 'ERRO%'), 'obtido', r);
  r := pg_temp.as_user(a, 'authenticated', format('select participant_count || '' | '' || completed_count || '' | '' || joined || '' | '' || cardinality(my_steps) from public.get_challenges(p_id := %L)', ch));
  res := res || jsonb_build_object('teste', 'get_challenges traz contagens e meu progresso', 'ok', (r like '%1 | 1 | true | 3%'), 'obtido', r);
  r := pg_temp.as_user(f, 'authenticated', format('select joined from public.get_challenges(p_id := %L)', ch));
  res := res || jsonb_build_object('teste', 'quem não entrou vê joined = falso', 'ok', (r in ('f', 'false')), 'obtido', r);
  r := pg_temp.as_user(null, 'anon', 'select count(*) from public.get_challenges()');
  res := res || jsonb_build_object('teste', 'anon NÃO lista desafios', 'ok', (r like 'ERRO%'), 'obtido', left(r, 80));
  r := pg_temp.as_user(c, 'authenticated', format('insert into public.challenge_participants (challenge_id, user_id) values (%L, %L)', ch, c));
  res := res || jsonb_build_object('teste', 'perfil privado também entra no desafio', 'ok', (r = 'OK:1'), 'obtido', r);
  r := pg_temp.as_user(f, 'authenticated', format('select count(*) from public.get_challenge_participants(%L) where name like ''%%Carla%%''', ch));
  res := res || jsonb_build_object('teste', 'perfil privado de não-amigo NÃO aparece na lista de participantes', 'ok', (r = '0'), 'obtido', r);
  r := pg_temp.as_user(b, 'authenticated', format('select count(*) from public.get_challenge_participants(%L) where name like ''%%Carla%%''', ch));
  res := res || jsonb_build_object('teste', 'amigo vê o perfil privado na lista de participantes', 'ok', (r = '1'), 'obtido', r);
  r := pg_temp.as_user(f, 'authenticated', format('select count(*) from public.user_challenges(%L)', c));
  res := res || jsonb_build_object('teste', 'desafios de perfil privado: não-amigo não vê', 'ok', (r = '0'), 'obtido', r);
  r := pg_temp.as_user(b, 'authenticated', format('select count(*) from public.user_challenges(%L)', c));
  res := res || jsonb_build_object('teste', 'desafios de perfil privado: amigo vê', 'ok', (r = '1'), 'obtido', r);
  r := pg_temp.as_user(a, 'authenticated', format('select completed from public.user_challenges() where challenge_id = %L', ch));
  res := res || jsonb_build_object('teste', 'minha lista de desafios mostra o concluído', 'ok', (r in ('t', 'true')), 'obtido', r);
  r := pg_temp.as_user(a, 'authenticated', format('insert into public.challenge_tips (challenge_id, author_id, body) values (%L, %L, ''beba água'')', ch, a));
  res := res || jsonb_build_object('teste', 'pessoa dá uma dica no desafio', 'ok', (r = 'OK:1'), 'obtido', r);
  r := pg_temp.as_user(b, 'authenticated', format('insert into public.challenge_tips (challenge_id, author_id, body) values (%L, %L, ''fingindo'')', ch, a));
  res := res || jsonb_build_object('teste', 'NÃO dá dica no nome de outra pessoa', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
  r := pg_temp.as_user(b, 'authenticated', format('select author_name from public.get_challenge_tips(%L)', ch));
  res := res || jsonb_build_object('teste', 'dicas trazem o nome de quem escreveu', 'ok', (r like '%Alice%'), 'obtido', r);
  r := pg_temp.as_user(d, 'authenticated', format('select count(*) from public.get_challenge_tips(%L)', ch));
  res := res || jsonb_build_object('teste', 'bloqueado NÃO vê as dicas de quem o bloqueou', 'ok', (r = '0'), 'obtido', r);
  r := pg_temp.as_user(a, 'authenticated', 'insert into public.challenges (title, description, category, badge_label, duration, steps) values (''Zzqx Meu'', ''x'', ''x'', ''x'', ''x'', array[''a''])');
  res := res || jsonb_build_object('teste', 'usuário comum NÃO cria desafio', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
  r := pg_temp.as_user(a, 'authenticated', format('delete from public.challenge_participants where challenge_id = %L and user_id = %L', ch, a));
  res := res || jsonb_build_object('teste', 'pessoa sai do desafio', 'ok', (r = 'OK:1'), 'obtido', r);

  -- ------------------------------------------------------------------- trilhas
  r := pg_temp.as_user(a, 'authenticated', 'select kind from public.ensure_adult_trail_profile()');
  res := res || jsonb_build_object('teste', 'cria o perfil adulto da trilha', 'ok', (r = 'adult'), 'obtido', r);
  select id into tp from public.trail_profiles where owner_id = a and kind = 'adult';
  r := pg_temp.as_user(a, 'authenticated', 'select kind from public.ensure_adult_trail_profile()');
  res := res || jsonb_build_object('teste', 'perfil adulto é criado uma só vez', 'ok', (r = 'adult' and (select count(*) from public.trail_profiles where owner_id = a and kind = 'adult') = 1), 'obtido', r);
  r := pg_temp.as_user(a, 'authenticated', format('select public.save_trail_progress(%L, ''{"totalXP": 120, "streak": 3, "lastActiveDay": "2026-10-02", "stops": {}}''::jsonb, 120)', tp));
  res := res || jsonb_build_object('teste', 'salva o progresso da trilha', 'ok', (r <> '<vazio>' and r not like 'ERRO%' and (select total_xp from public.trail_progress where profile_id = tp) = 120 and (select streak from public.trail_progress where profile_id = tp) = 3), 'obtido', r);
  res := res || jsonb_build_object('teste', 'soma o XP ganho no dia', 'ok', ((select coalesce(sum(xp), 0) from public.trail_xp_daily where profile_id = tp) = 120), 'obtido', 'verificado como superusuário');
  r := pg_temp.as_user(a, 'authenticated', format('select public.save_trail_progress(%L, ''{"totalXP": 5000}''::jsonb, 5000)', tp));
  res := res || jsonb_build_object('teste', 'XP ganho de uma vez é limitado a 1000', 'ok', ((select coalesce(sum(xp), 0) from public.trail_xp_daily where profile_id = tp) = 1120), 'obtido', 'verificado como superusuário');
  r := pg_temp.as_user(b, 'authenticated', format('select public.save_trail_progress(%L, ''{"totalXP": 9999}''::jsonb, 1)', tp));
  res := res || jsonb_build_object('teste', 'NÃO salva no perfil de trilha de outra pessoa', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
  r := pg_temp.as_user(b, 'authenticated', format('select count(*) from public.trail_progress where profile_id = %L', tp));
  res := res || jsonb_build_object('teste', 'NÃO lê o progresso de trilha de outra pessoa', 'ok', (r = '0'), 'obtido', r);
  r := pg_temp.as_user(a, 'authenticated', format('insert into public.trail_profiles (id, owner_id, kind, name, avatar) values (%L, %L, ''kid'', ''Lia'', ''lipe'')', kid, a));
  res := res || jsonb_build_object('teste', 'cria perfil infantil com id do próprio app', 'ok', (r = 'OK:1'), 'obtido', r);
  r := pg_temp.as_user(a, 'authenticated', format('insert into public.trail_profiles (owner_id, kind, name) values (%L, ''adult'', ''Outro'')', a));
  res := res || jsonb_build_object('teste', 'NÃO cria um segundo perfil adulto', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
  r := pg_temp.as_user(b, 'authenticated', format('insert into public.trail_profiles (owner_id, kind, name) values (%L, ''kid'', ''Intruso'')', a));
  res := res || jsonb_build_object('teste', 'NÃO cria perfil de trilha em nome de outra pessoa', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
  r := pg_temp.as_user(a, 'authenticated', 'select name || '' '' || xp || '' '' || "position" from public.friends_weekly_ranking() where is_me');
  res := res || jsonb_build_object('teste', 'ranking entre amigos traz o meu XP da semana', 'ok', (r like '%1120%'), 'obtido', r);
  r := pg_temp.as_user(f, 'authenticated', 'select count(*) from public.friends_weekly_ranking()');
  res := res || jsonb_build_object('teste', 'ranking de quem não tem amigos só tem a própria pessoa', 'ok', (r = '1'), 'obtido', r);
  r := pg_temp.as_user(a, 'authenticated', format('delete from public.trail_profiles where id = %L', kid));
  res := res || jsonb_build_object('teste', 'remove o perfil infantil', 'ok', (r = 'OK:1'), 'obtido', r);

  -- ------------------------------------------------------------ tema da semana
  -- tema ativo próprio do teste (o de produção, se existir, é encerrado dentro da transação)
  update public.weekly_themes set status = 'encerrado' where status = 'ativo';
  insert into public.weekly_themes (week_start, status, title, description, question, poll_question)
    values ((date '2026-10-04' + 7 * 3000), 'ativo', 'Zzqx Tema Ativo', 'descrição', 'pergunta?', 'enquete?') returning id into th;
  insert into public.theme_poll_options (theme_id, position, text) values (th, 0, 'Opção um') returning id into opt1;
  insert into public.theme_poll_options (theme_id, position, text) values (th, 1, 'Opção dois') returning id into opt2;
  insert into public.weekly_themes (week_start, status, title, description) values ((date '2026-10-04' + 7 * 3001), 'previa', 'Zzqx Prévia', 'segredo') returning id into th_prev;
  insert into public.weekly_themes (week_start, status, title, description) values ((date '2026-10-04' - 7 * 3000), 'encerrado', 'Zzqx Tema Antigo', 'antigo') returning id into th_old;
  insert into public.posts (author_id, body, type, theme_id) values (f, 'receita do tema antigo', 'receita', th_old);
  r := pg_temp.as_user(a, 'authenticated', 'select title from public.get_weekly_theme()');
  res := res || jsonb_build_object('teste', 'traz o tema ativo', 'ok', (r like '%Zzqx Tema Ativo%'), 'obtido', r);
  r := pg_temp.as_user(a, 'authenticated', 'select jsonb_array_length(poll) from public.get_weekly_theme()');
  res := res || jsonb_build_object('teste', 'o tema ativo traz as opções da enquete', 'ok', (r = '2'), 'obtido', r);
  r := pg_temp.as_user(a, 'authenticated', 'select title from public.get_weekly_theme(p_status := ''previa'')');
  res := res || jsonb_build_object('teste', 'usuário comum NÃO vê a prévia do próximo tema', 'ok', (r = '<vazio>'), 'obtido', r);
  r := pg_temp.as_user(p, 'authenticated', 'select title from public.get_weekly_theme(p_status := ''previa'')');
  res := res || jsonb_build_object('teste', 'profissional vê a prévia', 'ok', (r like '%Zzqx Prévia%'), 'obtido', r);
  r := pg_temp.as_user(null, 'anon', 'select title from public.get_weekly_theme()');
  res := res || jsonb_build_object('teste', 'anon NÃO usa get_weekly_theme', 'ok', (r like 'ERRO%'), 'obtido', left(r, 80));
  r := pg_temp.as_user(a, 'authenticated', format('insert into public.theme_poll_votes (theme_id, option_id, user_id) values (%L, %L, %L)', th, opt1, a));
  res := res || jsonb_build_object('teste', 'pessoa vota na enquete', 'ok', (r = 'OK:1'), 'obtido', r);
  r := pg_temp.as_user(a, 'authenticated', format('update public.theme_poll_votes set option_id = %L where theme_id = %L and user_id = %L', opt2, th, a));
  res := res || jsonb_build_object('teste', 'pessoa muda o voto', 'ok', (r = 'OK:1'), 'obtido', r);
  r := pg_temp.as_user(b, 'authenticated', format('insert into public.theme_poll_votes (theme_id, option_id, user_id) values (%L, %L, %L)', th, opt2, a));
  res := res || jsonb_build_object('teste', 'NÃO vota em nome de outra pessoa', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
  r := pg_temp.as_user(b, 'authenticated', format('select count(*) from public.theme_poll_votes where theme_id = %L', th));
  res := res || jsonb_build_object('teste', 'NÃO lê os votos das outras pessoas', 'ok', (r = '0'), 'obtido', r);
  r := pg_temp.as_user(b, 'authenticated', 'select (poll -> 1 ->> ''votes'') || '' '' || (poll -> 1 ->> ''mine'') from public.get_weekly_theme()');
  res := res || jsonb_build_object('teste', 'o resultado agregado aparece sem expor quem votou', 'ok', (r like '%1 false%'), 'obtido', r);
  r := pg_temp.as_user(a, 'authenticated', 'select (poll -> 1 ->> ''mine'') from public.get_weekly_theme()');
  res := res || jsonb_build_object('teste', 'o resultado marca o meu voto', 'ok', (r in ('t', 'true')), 'obtido', r);
  r := pg_temp.as_user(a, 'authenticated', format('insert into public.theme_poll_votes (theme_id, option_id, user_id) values (%L, %L, %L)', th_old, opt1, a));
  res := res || jsonb_build_object('teste', 'NÃO vota em tema encerrado', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
  r := pg_temp.as_user(a, 'authenticated', 'select title || '' '' || recipes_count || '' '' || posts_count from public.theme_history() where title = ''Zzqx Tema Antigo''');
  res := res || jsonb_build_object('teste', 'histórico traz o tema encerrado com as contagens', 'ok', (r like '%Zzqx Tema Antigo 1 1%'), 'obtido', r);
  r := pg_temp.as_user(a, 'authenticated', 'select count(*) from public.theme_history() where title like ''%Prévia%'' or title = ''Zzqx Tema Ativo''');
  res := res || jsonb_build_object('teste', 'histórico NÃO traz prévia nem tema ativo', 'ok', (r = '0'), 'obtido', r);
  r := pg_temp.as_user(a, 'authenticated', format('update public.weekly_themes set title = ''hackeado'' where id = %L', th));
  res := res || jsonb_build_object('teste', 'usuário comum NÃO edita o tema', 'ok', (r = 'OK:0' or r like 'ERRO%'), 'obtido', r);
  r := pg_temp.as_user(g, 'authenticated', format('update public.weekly_themes set title = ''Zzqx Editado'' where id = %L', th_prev));
  res := res || jsonb_build_object('teste', 'admin da plataforma edita o tema', 'ok', (r = 'OK:1'), 'obtido', r);

  -- ------------------------------------------------------------- notificações
  r := pg_temp.as_user(e, 'authenticated', 'select actor_name from public.get_notifications() where type = ''amizade_pedido''');
  res := res || jsonb_build_object('teste', 'pedido de amizade gera notificação com o nome de quem pediu', 'ok', (r like '%Alice%'), 'obtido', r);
  r := pg_temp.as_user(a, 'authenticated', 'select count(*) from public.get_notifications() where type = ''amizade_aceita''');
  res := res || jsonb_build_object('teste', 'amizade aceita notifica quem pediu', 'ok', (r::integer >= 1), 'obtido', r);
  r := pg_temp.as_user(f, 'authenticated', format('select count(*) from public.notifications where user_id = %L', e));
  res := res || jsonb_build_object('teste', 'NÃO lê notificações de outra pessoa', 'ok', (r = '0'), 'obtido', r);
  r := pg_temp.as_user(null, 'anon', 'select count(*) from public.get_notifications()');
  res := res || jsonb_build_object('teste', 'anon NÃO usa get_notifications', 'ok', (r like 'ERRO%'), 'obtido', left(r, 80));
  r := pg_temp.as_user(e, 'authenticated', 'select count(*) from public.notifications where read_at is null');
  res := res || jsonb_build_object('teste', 'há notificações não lidas antes de marcar', 'ok', (r::integer >= 1), 'obtido', r);
  r := pg_temp.as_user(e, 'authenticated', 'select public.mark_all_notifications_read()');
  res := res || jsonb_build_object('teste', 'marcar tudo como lido funciona', 'ok', (r not like 'ERRO%'), 'obtido', left(r, 80));
  r := pg_temp.as_user(e, 'authenticated', 'select count(*) from public.notifications where read_at is null');
  res := res || jsonb_build_object('teste', 'depois de marcar, não restam não lidas', 'ok', (r = '0'), 'obtido', r);
  r := pg_temp.as_user(e, 'authenticated', 'update public.notifications set type = ''conquista''');
  res := res || jsonb_build_object('teste', 'a pessoa só altera read_at da notificação (não o conteúdo)', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
  r := pg_temp.as_user(e, 'authenticated', format('insert into public.notifications (user_id, type) values (%L, ''conquista'')', b));
  res := res || jsonb_build_object('teste', 'NÃO cria notificação para outra pessoa', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));

  -- ---------------------------------------------- BLOQUEAR LIMPA RELAÇÕES
  r := pg_temp.as_user(b, 'authenticated', format('insert into public.blocks (blocker_id, blocked_id) values (%L, %L)', b, a));
  res := res || jsonb_build_object('teste', 'B bloqueia A', 'ok', (r = 'OK:1'), 'obtido', r);
  res := res || jsonb_build_object('teste', 'bloquear desfaz a amizade',
    'ok', not exists (select 1 from public.friendships where least(requester_id, addressee_id) = least(a, b)
                                                         and greatest(requester_id, addressee_id) = greatest(a, b)),
    'obtido', 'verificado como superusuário');

  -- ------------------------------------------------- PONTUAÇÃO DOS PROFISSIONAIS
  declare
    s0 integer; s1 integer; ask uuid; rep uuid;
  begin
    -- Verificação já deu os pontos iniciais.
    res := res || jsonb_build_object('teste', 'profissional verificado já tem pontuação inicial',
      'ok', coalesce((select score from public.pro_scores where professional_id = p), 0) >= 20,
      'obtido', (select score::text from public.pro_scores where professional_id = p));
    res := res || jsonb_build_object('teste', 'usuário comum NÃO tem pontuação', 'ok',
      not exists (select 1 from public.pro_scores where professional_id = a), 'obtido', 'verificado como superusuário');

    -- Publicar soma, com teto de 3 por dia.
    s0 := (select score from public.pro_scores where professional_id = p);
    insert into public.posts (author_id, body) values (p, 'pro 1'), (p, 'pro 2'), (p, 'pro 3'), (p, 'pro 4'), (p, 'pro 5');
    s1 := (select score from public.pro_scores where professional_id = p);
    res := res || jsonb_build_object('teste', 'publicações do profissional pontuam, com teto diário',
      'ok', (s1 - s0) between 5 and 15, 'obtido', (s1 - s0)::text);

    -- Responder pergunta de outra pessoa vale 4; comentar na própria publicação não vale nada.
    insert into public.posts (author_id, body, type) values (a, 'como assar pão?', 'pergunta') returning id into ask;
    s0 := (select score from public.pro_scores where professional_id = p);
    insert into public.comments (post_id, author_id, body) values (ask, p, 'use forno bem quente');
    s1 := (select score from public.pro_scores where professional_id = p);
    res := res || jsonb_build_object('teste', 'responder pergunta soma 4', 'ok', (s1 - s0 = 4), 'obtido', (s1 - s0)::text);
    insert into public.posts (author_id, body, type) values (p, 'minha pergunta', 'pergunta') returning id into ask;
    s0 := (select score from public.pro_scores where professional_id = p);
    insert into public.comments (post_id, author_id, body) values (ask, p, 'resposta a mim mesmo');
    s1 := (select score from public.pro_scores where professional_id = p);
    res := res || jsonb_build_object('teste', 'comentar na própria publicação NÃO pontua', 'ok', (s1 = s0), 'obtido', (s1 - s0)::text);

    -- Apoio recebido soma.
    s0 := (select score from public.pro_scores where professional_id = p);
    insert into public.post_reactions (post_id, user_id, kind) values (ask, a, 'apoiar');
    s1 := (select score from public.pro_scores where professional_id = p);
    res := res || jsonb_build_object('teste', 'apoio recebido soma 1', 'ok', (s1 - s0 = 1), 'obtido', (s1 - s0)::text);

    -- Denúncia procedente tira 30 (e só uma vez).
    s0 := (select score from public.pro_scores where professional_id = p);
    insert into public.reports (reporter_id, target_type, target_id, reason) values (a, 'post', ask, 'ofensivo') returning id into rep;
    update public.reports set status = 'procedente' where id = rep;
    s1 := (select score from public.pro_scores where professional_id = p);
    res := res || jsonb_build_object('teste', 'denúncia procedente tira 30 pontos', 'ok', (s0 - s1 = 30), 'obtido', (s0 - s1)::text);
    update public.reports set status = 'improcedente' where id = rep;
    update public.reports set status = 'procedente' where id = rep;
    res := res || jsonb_build_object('teste', 'a mesma denúncia NÃO desconta duas vezes',
      'ok', ((select score from public.pro_scores where professional_id = p) = s1), 'obtido', 'idempotente');

    -- Piso em zero e níveis.
    perform public._pro_award(p, 'ajuste_admin', 'admin', gen_random_uuid(), 'teste', -5000);
    res := res || jsonb_build_object('teste', 'pontuação nunca fica negativa',
      'ok', ((select score from public.pro_scores where professional_id = p) = 0 and (select level from public.pro_scores where professional_id = p) = 1),
      'obtido', (select score::text from public.pro_scores where professional_id = p));
    res := res || jsonb_build_object('teste', 'nível 1 não libera o perfil de membros', 'ok', not public.pro_has_feature(p, 'perfil_membros'), 'obtido', 'nível 1');
    res := res || jsonb_build_object('teste', 'nível 1 cobra 20% das assinaturas', 'ok', (public.pro_membership_fee_percent(p) = 20), 'obtido', public.pro_membership_fee_percent(p)::text);
    perform public._pro_award(p, 'ajuste_admin', 'admin', gen_random_uuid(), 'teste', 350);
    res := res || jsonb_build_object('teste', '350 pontos levam ao nível 3 (destaque)',
      'ok', ((select level from public.pro_scores where professional_id = p) = 3), 'obtido', (select level::text from public.pro_scores where professional_id = p));
    res := res || jsonb_build_object('teste', 'nível 3 libera o perfil de membros', 'ok', public.pro_has_feature(p, 'perfil_membros'), 'obtido', 'nível 3');
    res := res || jsonb_build_object('teste', 'nível 3 cobra 15% das assinaturas', 'ok', (public.pro_membership_fee_percent(p) = 15), 'obtido', public.pro_membership_fee_percent(p)::text);
    res := res || jsonb_build_object('teste', 'nível 3 ainda não tem selo de excelência', 'ok', not public.pro_has_feature(p, 'selo_excelencia'), 'obtido', 'nível 3');

    -- Excelência exige 90 dias sem denúncia procedente (a de agora conta).
    perform public._pro_award(p, 'ajuste_admin', 'admin', gen_random_uuid(), 'teste', 2500);
    res := res || jsonb_build_object('teste', 'denúncia procedente recente segura o nível abaixo da excelência',
      'ok', ((select level from public.pro_scores where professional_id = p) = 4), 'obtido', (select level::text from public.pro_scores where professional_id = p));
    update public.pro_score_events set created_at = now() - interval '120 days' where professional_id = p and kind = 'denuncia_procedente';
    perform public.apply_pro_inactivity();
    res := res || jsonb_build_object('teste', 'passados 90 dias a excelência é liberada na reavaliação semanal',
      'ok', ((select level from public.pro_scores where professional_id = p) = 5), 'obtido', (select level::text from public.pro_scores where professional_id = p));

    -- Visibilidade e permissões.
    r := pg_temp.as_user(p, 'authenticated', format('select score from public.get_pro_status(%L)', p));
    res := res || jsonb_build_object('teste', 'o profissional vê a própria pontuação', 'ok', (r ~ '^[0-9]+$'), 'obtido', r);
    r := pg_temp.as_user(a, 'authenticated', format('select coalesce(score::text, ''oculta'') from public.get_pro_status(%L)', p));
    res := res || jsonb_build_object('teste', 'outras pessoas NÃO veem a pontuação exata', 'ok', (r = 'oculta'), 'obtido', r);
    r := pg_temp.as_user(a, 'authenticated', format('select level_code from public.get_pro_status(%L)', p));
    res := res || jsonb_build_object('teste', 'o nível (selo) é público', 'ok', (r = 'excelencia'), 'obtido', r);
    r := pg_temp.as_user(a, 'authenticated', format('select count(*) from public.pro_score_events where professional_id = %L', p));
    res := res || jsonb_build_object('teste', 'outras pessoas NÃO leem o histórico de pontos', 'ok', (r = '0'), 'obtido', r);
    r := pg_temp.as_user(p, 'authenticated', 'select count(*) from public.get_my_pro_events()');
    res := res || jsonb_build_object('teste', 'o profissional lê o próprio histórico', 'ok', (r::integer > 0), 'obtido', r);
    r := pg_temp.as_user(p, 'authenticated', format('insert into public.pro_score_events (professional_id, kind, points, ref_type, ref_id) values (%L, ''ajuste_admin'', 999, ''x'', gen_random_uuid())', p));
    res := res || jsonb_build_object('teste', 'NÃO dá pontos a si mesmo direto na tabela', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
    r := pg_temp.as_user(p, 'authenticated', format('select public.admin_adjust_pro_score(%L, 500, ''quero mais'')', p));
    res := res || jsonb_build_object('teste', 'profissional NÃO ajusta a própria pontuação', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
    r := pg_temp.as_user(g, 'authenticated', format('select public.admin_adjust_pro_score(%L, -10, ''teste de ajuste'')', p));
    res := res || jsonb_build_object('teste', 'administração ajusta a pontuação com motivo', 'ok', (r not like 'ERRO%'), 'obtido', left(r, 90));
    r := pg_temp.as_user(g, 'authenticated', format('select public.admin_adjust_pro_score(%L, -10, '''')', p));
    res := res || jsonb_build_object('teste', 'ajuste sem motivo é recusado', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
    r := pg_temp.as_user(null, 'anon', 'select public.get_pro_rules()');
    res := res || jsonb_build_object('teste', 'anon NÃO lê as regras', 'ok', (r like 'ERRO%'), 'obtido', left(r, 80));

    -- Ausência: quem some por 14 dias perde 5 por semana; não duplica na mesma semana.
    update public.professionals set verified_at = now() - interval '60 days' where user_id = q;
    delete from public.pro_score_events where professional_id = q;
    delete from public.pro_scores where professional_id = q;
    perform public._pro_award(q, 'ajuste_admin', 'admin', gen_random_uuid(), 'base', 50);
    update public.pro_score_events set created_at = now() - interval '30 days' where professional_id = q;
    s0 := (select score from public.pro_scores where professional_id = q);
    perform public.apply_pro_inactivity();
    perform public.apply_pro_inactivity();
    s1 := (select score from public.pro_scores where professional_id = q);
    res := res || jsonb_build_object('teste', 'ausência tira 5 pontos uma vez por semana', 'ok', (s0 - s1 = 5), 'obtido', (s0 - s1)::text);
  end;

  -- ------------------------------------------------------------ PERFIL DE MEMBROS
  declare
    mc uuid; appt_id uuid; price integer;
  begin
    -- p está no nível 5 (testes de pontuação); q ficou no nível 1.
    r := pg_temp.as_user(q, 'authenticated',
      'select public.save_member_plan(''Plano'', ''desc'', 2500, 10, array[''a''], false)');
    res := res || jsonb_build_object('teste', 'nível 1 NÃO cria perfil de membros', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
    r := pg_temp.as_user(p, 'authenticated',
      'select public.save_member_plan(''Plano da Hélena'', ''conteúdo e desconto'', 2500, 20, array[''Receitas exclusivas'', ''Lives''], true)');
    res := res || jsonb_build_object('teste', 'ativar sem conta de recebimento é recusado', 'ok', (r like 'ERRO%'), 'obtido', left(r, 100));
    r := pg_temp.as_user(p, 'authenticated',
      'select public.save_member_plan(''Plano da Hélena'', ''conteúdo e desconto'', 500, 20, array[''x''], false)');
    res := res || jsonb_build_object('teste', 'mensalidade abaixo de R$ 10 é recusada', 'ok', (r like 'ERRO%'), 'obtido', left(r, 100));
    insert into public.pro_stripe_accounts (professional_id, stripe_account_id, charges_enabled) values (p, 'acct_zzqx', true);
    r := pg_temp.as_user(p, 'authenticated',
      'select public.save_member_plan(''Plano da Hélena'', ''conteúdo e desconto'', 2500, 20, array[''Receitas exclusivas'', ''Lives''], true)');
    res := res || jsonb_build_object('teste', 'com conta conectada e nível, o plano é ativado', 'ok', (r not like 'ERRO%'), 'obtido', left(r, 100));

    r := pg_temp.as_user(a, 'authenticated', format('select price_cents || ''/'' || coalesce(fee_percent::text, '''') from public.get_member_plan(%L)', p));
    res := res || jsonb_build_object('teste', 'visitante vê o plano ativo, sem a taxa', 'ok', (r = '2500/'), 'obtido', r);
    r := pg_temp.as_user(p, 'authenticated', format('select fee_percent from public.get_member_plan(%L)', p));
    res := res || jsonb_build_object('teste', 'o dono vê a taxa do nível (10% no nível 5)', 'ok', (r = '10'), 'obtido', r);

    -- Conteúdo exclusivo.
    r := pg_temp.as_user(p, 'authenticated', 'select public.publish_member_content(''Cardápio da semana'', ''Só para membros'', null) is not null');
    res := res || jsonb_build_object('teste', 'profissional de nível 3+ publica conteúdo exclusivo', 'ok', (r in ('t', 'true')), 'obtido', r);
    r := pg_temp.as_user(q, 'authenticated', 'select public.publish_member_content(''x'', ''y'', null)');
    res := res || jsonb_build_object('teste', 'nível 1 NÃO publica conteúdo exclusivo', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
    r := pg_temp.as_user(a, 'authenticated', format('select count(*) from public.member_content where professional_id = %L', p));
    res := res || jsonb_build_object('teste', 'quem não é membro NÃO lê o conteúdo exclusivo', 'ok', (r = '0'), 'obtido', r);
    r := pg_temp.as_user(a, 'authenticated', format('select content_count from public.get_member_plan(%L)', p));
    res := res || jsonb_build_object('teste', 'o visitante vê só quantos conteúdos existem', 'ok', (r = '1'), 'obtido', r);

    -- Assinatura em dia libera conteúdo e dá desconto.
    insert into public.member_subscriptions (professional_id, member_id, status, price_cents, stripe_subscription_id, current_period_end)
      values (p, a, 'ativa', 2500, 'sub_zzqx_a', now() + interval '20 days');
    r := pg_temp.as_user(a, 'authenticated', format('select count(*) from public.member_content where professional_id = %L', p));
    res := res || jsonb_build_object('teste', 'membro lê o conteúdo exclusivo', 'ok', (r = '1'), 'obtido', r);
    r := pg_temp.as_user(b, 'authenticated', format('select count(*) from public.member_content where professional_id = %L', p));
    res := res || jsonb_build_object('teste', 'outro usuário continua sem acesso', 'ok', (r = '0'), 'obtido', r);
    r := pg_temp.as_user(a, 'authenticated', format('select count(*) from public.member_subscriptions where professional_id = %L', p));
    res := res || jsonb_build_object('teste', 'membro vê a própria assinatura', 'ok', (r = '1'), 'obtido', r);
    r := pg_temp.as_user(b, 'authenticated', format('select count(*) from public.member_subscriptions where professional_id = %L', p));
    res := res || jsonb_build_object('teste', 'outros NÃO veem assinaturas alheias', 'ok', (r = '0'), 'obtido', r);
    r := pg_temp.as_user(p, 'authenticated', 'select count(*) from public.my_subscribers()');
    res := res || jsonb_build_object('teste', 'o profissional vê seus assinantes', 'ok', (r = '1'), 'obtido', r);
    r := pg_temp.as_user(a, 'authenticated', 'select count(*) from public.my_subscribers()');
    res := res || jsonb_build_object('teste', 'quem não é o profissional não vê assinantes de ninguém', 'ok', (r = '0'), 'obtido', r);

    -- Desconto de 20% numa consulta de preço 20000.
    update public.professionals set consultation_price_cents = 20000, accepting_patients = true where user_id = p;
    insert into public.appointments (professional_id, patient_id, starts_at, ends_at, modality, status, price_cents, hold_expires_at, created_by)
      values (p, a, now() + interval '9 days', now() + interval '9 days 1 hour', 'online', 'aguardando_pagamento', 20000, now() + interval '30 minutes', a)
      returning id, price_cents into appt_id, price;
    res := res || jsonb_build_object('teste', 'membro paga 20% a menos na consulta', 'ok', (price = 16000), 'obtido', price::text);
    insert into public.appointments (professional_id, patient_id, starts_at, ends_at, modality, status, price_cents, hold_expires_at, created_by)
      values (p, b, now() + interval '10 days', now() + interval '10 days 1 hour', 'online', 'aguardando_pagamento', 20000, now() + interval '30 minutes', b)
      returning price_cents into price;
    res := res || jsonb_build_object('teste', 'quem não é membro paga o preço cheio', 'ok', (price = 20000), 'obtido', price::text);

    -- Assinatura cancelada fora do período perde o acesso; cancelando ainda vale até o fim do período.
    update public.member_subscriptions set status = 'cancelando' where stripe_subscription_id = 'sub_zzqx_a';
    res := res || jsonb_build_object('teste', 'assinatura cancelando mantém o acesso até o fim do período', 'ok', public.is_member(p, a), 'obtido', 'cancelando');
    update public.member_subscriptions set current_period_end = now() - interval '1 day' where stripe_subscription_id = 'sub_zzqx_a';
    res := res || jsonb_build_object('teste', 'período vencido encerra o acesso', 'ok', not public.is_member(p, a), 'obtido', 'vencida');
    update public.member_subscriptions set status = 'inadimplente', current_period_end = now() + interval '5 days' where stripe_subscription_id = 'sub_zzqx_a';
    res := res || jsonb_build_object('teste', 'inadimplente NÃO tem acesso', 'ok', not public.is_member(p, a), 'obtido', 'inadimplente');

    -- Nada de gravar assinatura pelo app.
    r := pg_temp.as_user(b, 'authenticated', format('insert into public.member_subscriptions (professional_id, member_id, status, price_cents) values (%L, %L, ''ativa'', 100)', p, b));
    res := res || jsonb_build_object('teste', 'NÃO cria assinatura direto pelo app', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));
    r := pg_temp.as_user(b, 'authenticated', format('select public.upsert_member_subscription(%L, %L, ''ativa'', 100, ''sub_x'', ''cus_x'', now())', p, b));
    res := res || jsonb_build_object('teste', 'NÃO chama a gravação do servidor pelo app', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));

    -- Faturas e divisão.
    perform public.record_member_invoice('sub_zzqx_a', 'in_zzqx_1', 2500, 250);
    perform public.record_member_invoice('sub_zzqx_a', 'in_zzqx_1', 2500, 250);
    r := pg_temp.as_user(p, 'authenticated', 'select gross_cents || ''/'' || fee_cents || ''/'' || net_cents || ''/'' || invoices from public.my_member_earnings(30)');
    res := res || jsonb_build_object('teste', 'ganhos: valor, parte da plataforma e líquido (fatura não duplica)', 'ok', (r = '2500/250/2250/1'), 'obtido', r);
    r := pg_temp.as_user(b, 'authenticated', 'select invoices from public.my_member_earnings(30)');
    res := res || jsonb_build_object('teste', 'outro usuário não tem ganhos', 'ok', (r = '0'), 'obtido', r);

    -- Perder o nível desativa a oferta.
    perform public._pro_award(p, 'ajuste_admin', 'admin', gen_random_uuid(), 'teste', -5000);
    r := pg_temp.as_user(a, 'authenticated', format('select count(*) from public.get_member_plan(%L)', p));
    res := res || jsonb_build_object('teste', 'ao perder o nível, o plano deixa de ser oferecido', 'ok', (r = '0'), 'obtido', r);
  end;

  -- ------------------------------------------------ ABA PROFISSIONAIS DO FEED
  r := pg_temp.as_user(a, 'authenticated', format('select count(*) from public.get_feed(''profissionais'', null, null, null, null, null, null, 100) where author_id = %L', p));
  res := res || jsonb_build_object('teste', 'escopo profissionais traz as publicações de profissionais', 'ok', (r::integer >= 1), 'obtido', r);
  r := pg_temp.as_user(a, 'authenticated', format('select count(*) from public.get_feed(''profissionais'', null, null, null, null, null, null, 100) where author_id <> all (select user_id from public.professionals)'));
  res := res || jsonb_build_object('teste', 'escopo profissionais NÃO traz publicações de quem não é profissional', 'ok', (r = '0'), 'obtido', r);

  -- Relatório (o erro desfaz toda a transação).
  raise exception 'RESULTADOS:%', jsonb_pretty(res);
end
$test$;

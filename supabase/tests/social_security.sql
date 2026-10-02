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
    return outv;
  end $f$;

  -- ---------------------------------------------------------------- dados
  insert into auth.users (id, aud, role, email, raw_user_meta_data) values
    (a, 'authenticated', 'authenticated', 'zzqx.a@teste.invalid', '{"name":"Zzqx Alice","goal":"Objetivo secreto A"}'),
    (b, 'authenticated', 'authenticated', 'zzqx.b@teste.invalid', '{"name":"Zzqx Bruno"}'),
    (c, 'authenticated', 'authenticated', 'zzqx.c@teste.invalid', '{"name":"Zzqx Carla","goal":"Objetivo privado da Carla"}'),
    (d, 'authenticated', 'authenticated', 'zzqx.d@teste.invalid', '{"name":"Zzqx Daniel"}'),
    (e, 'authenticated', 'authenticated', 'zzqx.e@teste.invalid', '{"name":"Zzqx Eva"}'),
    (f, 'authenticated', 'authenticated', 'zzqx.f@teste.invalid', '{"name":"Zzqx Fabio"}'),
    (p, 'authenticated', 'authenticated', 'zzqx.p@teste.invalid', '{"name":"Zzqxprof Hélena"}');
  insert into public.professionals (user_id, profession, council, registration, uf)
    values (p, 'Nutricionista', 'CRN-3', 'TESTE', 'SP');
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
  r := pg_temp.as_user(f, 'authenticated', format(
    'insert into public.posts (author_id, type, title, body, tags, audience, recipe, block_order) values (%L, ''receita'', ''Bolo'', ''modo de fazer'', array[''bolo''], ''amigos'', ''{"prepTime":"30 min","servings":"4","difficulty":"Fácil","ingredients":["ovo"],"steps":["misturar"],"category":"Doces"}''::jsonb, array[''title'',''image'',''text'',''recipe''])', f));
  res := res || jsonb_build_object('teste', 'pessoa publica receita só para amigos (recipe + block_order)', 'ok', (r = 'OK:1'), 'obtido', r);

  r := pg_temp.as_user(a, 'authenticated', format('insert into public.posts (author_id, body) values (%L, ''fingindo ser B'')', b));
  res := res || jsonb_build_object('teste', 'NÃO publica como outra pessoa', 'ok', (r like 'ERRO%'), 'obtido', left(r, 90));

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

  -- ---------------------------------------------- BLOQUEAR LIMPA RELAÇÕES
  r := pg_temp.as_user(b, 'authenticated', format('insert into public.blocks (blocker_id, blocked_id) values (%L, %L)', b, a));
  res := res || jsonb_build_object('teste', 'B bloqueia A', 'ok', (r = 'OK:1'), 'obtido', r);
  res := res || jsonb_build_object('teste', 'bloquear desfaz a amizade',
    'ok', not exists (select 1 from public.friendships where least(requester_id, addressee_id) = least(a, b)
                                                         and greatest(requester_id, addressee_id) = greatest(a, b)),
    'obtido', 'verificado como superusuário');

  -- Relatório (o erro desfaz toda a transação).
  raise exception 'RESULTADOS:%', jsonb_pretty(res);
end
$test$;

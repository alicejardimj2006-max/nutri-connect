-- Fecha o acesso de visitantes sem login (anon) às funções internas.
--
-- O Supabase concede EXECUTE a anon/public em toda função nova. Várias funções
-- SECURITY DEFINER do schema social ignoram o RLS e aceitam qualquer uuid, então
-- um visitante sem login conseguia:
--   * listar os amigos de qualquer pessoa (friend_ids);
--   * sondar amizades, bloqueios e a visibilidade de posts (are_friends,
--     is_blocked_between, can_view_post, ...);
--   * gravar buscas e manipular o tema da semana (log_search).
-- Usuários logados (authenticated) e o service_role continuam com acesso.
-- Coberto por supabase/tests/social_security.sql.

do $$
declare
  r record;
begin
  -- Funções chamadas pelo app / pelo RLS: só quem está logado.
  for r in
    select p.oid::regprocedure as sig
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.proname = any (array[
         'friend_ids', 'are_friends', 'is_blocked_between', 'relationship_with',
         'can_view_profile_content', 'can_view_post', 'post_is_visible',
         'community_is_visible', 'is_community_admin', 'is_community_member',
         'is_platform_admin', 'has_active_link', 'ever_linked',
         'can_read_meal_plan', 'can_edit_meal_plan', 'diary_entry_patient',
         'meal_plan_of_meal', 'owns_trail_profile', 'log_search'
       ])
  loop
    execute format('revoke execute on function %s from public, anon', r.sig);
    execute format('grant execute on function %s to authenticated, service_role', r.sig);
  end loop;

  -- Funções de trigger: o Postgres não exige EXECUTE para disparar um trigger,
  -- então ninguém precisa poder chamá-las diretamente.
  for r in
    select p.oid::regprocedure as sig
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.prorettype = 'pg_catalog.trigger'::regtype
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', r.sig);
  end loop;
end;
$$;

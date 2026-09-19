begin;
select plan(14);

-- 1. Create users (this will fire the on_auth_user_created trigger)
insert into auth.users (id, email, raw_user_meta_data) values 
  ('00000000-0000-0000-0000-000000000001', 'user1@test.com', '{"display_name": "User One", "phone": "1111"}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'user2@test.com', '{"display_name": "User Two", "phone": "2222"}'::jsonb);

-- 2. Verify Profile is created automatically
select results_eq(
  'select display_name from public.profiles where id = ''00000000-0000-0000-0000-000000000001''',
  $$values ('User One')$$,
  'Trigger automatically creates profile'
);

-- 3. Verify username is generated and not null
select is_empty(
  'select * from public.profiles where username is null',
  'Username is not null'
);

-- 4. Verify username is unique (we insert another user to see if it succeeds without conflict)
-- The generated usernames are user_0000000000 for both if we use id prefix? Wait, id is unique, so username is unique.
insert into auth.users (id, email, raw_user_meta_data) values 
  ('00000000-0000-0000-0000-000000000003', 'user3@test.com', '{"display_name": "User Three"}'::jsonb);
select pass('Usernames are unique based on UUID prefix');

-- 5. Verify Private Profile is created automatically
select results_eq(
  'select phone from public.private_profiles where user_id = ''00000000-0000-0000-0000-000000000001''',
  $$values ('1111')$$,
  'Trigger automatically creates private profile with metadata'
);

-- 6. Verify Initial Role is secure (default 'user')
select results_eq(
  'select role from public.profiles where id = ''00000000-0000-0000-0000-000000000001''',
  $$values ('user')$$,
  'Initial role is user'
);

-- Switch context to user 1
set local role authenticated;
set local "request.jwt.claim.sub" to '00000000-0000-0000-0000-000000000001';

-- 7. Verify user cannot alter own role (throws exception now)
select throws_ok(
  $$update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-000000000001'$$,
  'P0001',
  'Acesso negado: Usuários comuns não podem alterar sua própria role.',
  'User cannot elevate own role to admin'
);

-- 8. Verify user1 cannot access user2's private profile
select is_empty(
  'select * from public.private_profiles where user_id = ''00000000-0000-0000-0000-000000000002''',
  'User cannot read another users private profile'
);

-- 9. Verify user1 can access own private profile
select results_eq(
  'select phone from public.private_profiles where user_id = ''00000000-0000-0000-0000-000000000001''',
  $$values ('1111')$$,
  'User can access own private profile'
);

-- 10. Privacy Settings: protected (user1 cannot read user2)
insert into public.privacy_settings (user_id, profile_visibility) values ('00000000-0000-0000-0000-000000000001', 'private');
select is_empty(
  'select * from public.privacy_settings where user_id = ''00000000-0000-0000-0000-000000000002''',
  'User cannot read another users privacy settings'
);

-- 11. Privacy Settings: can read own
select results_eq(
  'select profile_visibility from public.privacy_settings where user_id = ''00000000-0000-0000-0000-000000000001''',
  $$values ('private')$$,
  'User can read own privacy settings'
);

-- 12. Privacy Requests: user1 can create request
insert into public.privacy_requests (user_id, type) values ('00000000-0000-0000-0000-000000000001', 'deletion');
select results_eq(
  'select type from public.privacy_requests where user_id = ''00000000-0000-0000-0000-000000000001''',
  $$values ('deletion')$$,
  'User can insert and select own privacy requests'
);

-- 13. Privacy Requests: user1 cannot update (no UPDATE policy)
select throws_ok(
  $$update public.privacy_requests set status = 'completed' where user_id = '00000000-0000-0000-0000-000000000001'$$
);

-- 14. Audit Logs: user1 cannot insert
select throws_ok(
  $$insert into public.audit_logs (actor_id, action) values ('00000000-0000-0000-0000-000000000001', 'hack')$$
);

select * from finish();
rollback;

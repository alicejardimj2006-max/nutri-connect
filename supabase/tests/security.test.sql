begin;
select plan(11);

-- Mock authenticated user 'user1' and 'user2'
insert into auth.users (id, email) values ('00000000-0000-0000-0000-000000000001', 'user1@test.com');
insert into auth.users (id, email) values ('00000000-0000-0000-0000-000000000002', 'user2@test.com');

-- 1. Profiles: user1 can read all profiles (public)
set local role authenticated;
set local "request.jwt.claim.sub" to '00000000-0000-0000-0000-000000000001';

-- Should succeed
insert into public.profiles (id, display_name) values ('00000000-0000-0000-0000-000000000001', 'User One');
select results_eq(
  'select display_name from public.profiles where id = ''00000000-0000-0000-0000-000000000001''',
  $$values ('User One')$$,
  'User can insert and read own profile'
);

-- 2. Profiles: user1 cannot insert for user2
select throws_ok(
  $$insert into public.profiles (id, display_name) values ('00000000-0000-0000-0000-000000000002', 'User Two')$$
);

-- 3. Profiles: user1 cannot update role to admin
update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-000000000001';
select results_eq(
  'select role from public.profiles where id = ''00000000-0000-0000-0000-000000000001''',
  $$values ('user')$$,
  'User cannot elevate own role to admin'
);

-- 4. Private Profiles: user1 can insert own
insert into public.private_profiles (user_id, email, phone) values ('00000000-0000-0000-0000-000000000001', 'user1@test.com', '123456');
select results_eq(
  'select phone from public.private_profiles where user_id = ''00000000-0000-0000-0000-000000000001''',
  $$values ('123456')$$,
  'User can insert and access own private profile'
);

-- 5. Private Profiles: user1 cannot access user2's private profile
set local role authenticated;
set local "request.jwt.claim.sub" to '00000000-0000-0000-0000-000000000002';
select is_empty(
  'select * from public.private_profiles where user_id = ''00000000-0000-0000-0000-000000000001''',
  'User cannot read another users private profile'
);

-- 6. Privacy Settings: user2 can insert own
insert into public.privacy_settings (user_id, profile_visibility) values ('00000000-0000-0000-0000-000000000002', 'private');
select results_eq(
  'select profile_visibility from public.privacy_settings where user_id = ''00000000-0000-0000-0000-000000000002''',
  $$values ('private')$$,
  'User can insert and select own privacy settings'
);

-- 7. Privacy Settings: user2 cannot read user1
select is_empty(
  'select * from public.privacy_settings where user_id = ''00000000-0000-0000-0000-000000000001''',
  'User cannot read another users privacy settings'
);

-- 8. Privacy Requests: user2 can create request
insert into public.privacy_requests (user_id, type) values ('00000000-0000-0000-0000-000000000002', 'deletion');
select results_eq(
  'select type from public.privacy_requests where user_id = ''00000000-0000-0000-0000-000000000002''',
  $$values ('deletion')$$,
  'User can insert and select own privacy requests'
);

-- 9. Privacy Requests: user2 cannot update admin fields (RLS prevents UPDATE entirely)
select throws_ok(
  $$update public.privacy_requests set status = 'completed' where user_id = '00000000-0000-0000-0000-000000000002'$$
);

-- 10. Audit Logs: user2 cannot insert directly
select throws_ok(
  $$insert into public.audit_logs (actor_id, action) values ('00000000-0000-0000-0000-000000000002', 'hack')$$
);

-- 11. Audit Logs: user2 cannot read
select is_empty(
  'select * from public.audit_logs',
  'User cannot read audit logs'
);

select * from finish();
rollback;


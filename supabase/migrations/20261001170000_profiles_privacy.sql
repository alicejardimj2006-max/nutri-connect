-- Privacidade de perfis e fim da leitura anônima.
--
-- Antes: "profiles: leitura pública" liberava TODAS as linhas de profiles (bio, objetivo e
-- objetivo de jornada incluídos) para qualquer pessoa, até sem login; isso derrubava o
-- "perfil privado" e expunha metas de saúde. O mesmo valia para professionals e para a view
-- professional_directory.
--
-- Agora (decisões do produto):
--   * ninguém sem login vê perfis;
--   * perfil PRIVADO: só a própria pessoa, admins, amigos e o profissional com vínculo
--     clínico leem a linha; os demais veem só nome, @, foto e papel, por person_cards();
--   * quem bloqueou (ou foi bloqueado) deixa de ver a linha do outro.
-- Coberto por supabase/tests/social_security.sql.

drop policy if exists "profiles: leitura pública" on public.profiles;
create policy "profiles: leitura" on public.profiles
  for select to authenticated using (
    id = auth.uid()
    or public.is_platform_admin()
    or (
      not public.is_blocked_between(id, auth.uid())
      and (
        not is_private
        or public.is_verified_professional(id)
        or public.are_friends(id, auth.uid())
        or exists (
          select 1 from public.care_links cl
           where cl.patient_id = profiles.id and cl.professional_id = auth.uid()
        )
      )
    )
  );

drop policy if exists "professionals: leitura pública" on public.professionals;
create policy "professionals: leitura" on public.professionals
  for select to authenticated using (true);

-- Defesa em profundidade: sem login, nem os grants existem.
revoke select on public.profiles from anon;
revoke select on public.professionals from anon;
revoke select on public.professional_directory from anon;

-- Cartão mínimo (nome, @, foto, papel), inclusive de perfis privados.
-- Só recusa quem tem bloqueio com a pessoa logada.
create or replace function public.person_cards(p_ids uuid[])
returns table (id uuid, name text, username text, avatar_url text, role public.app_role, is_private boolean)
language sql stable security definer set search_path = public as $$
  select p.id, p.name, p.username, p.avatar_url, p.role, p.is_private
    from public.profiles p
   where auth.uid() is not null
     and p.id = any (p_ids)
     and not public.is_blocked_between(p.id, auth.uid());
$$;

-- Quem a pessoa logada bloqueou (a linha do bloqueado fica oculta pelo RLS acima).
create or replace function public.list_my_blocks()
returns table (
  id uuid, name text, username text, avatar_url text, role public.app_role,
  is_private boolean, blocked_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select p.id, p.name, p.username, p.avatar_url, p.role, p.is_private, b.created_at
    from public.blocks b
    join public.profiles p on p.id = b.blocked_id
   where b.blocker_id = auth.uid()
   order by b.created_at desc;
$$;

revoke execute on function public.person_cards(uuid[]) from public, anon;
revoke execute on function public.list_my_blocks() from public, anon;
grant execute on function public.person_cards(uuid[]) to authenticated, service_role;
grant execute on function public.list_my_blocks() to authenticated, service_role;

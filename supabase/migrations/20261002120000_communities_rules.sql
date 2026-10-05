-- Comunidades: alinha o banco às regras do produto e adiciona as consultas que o app precisa.
--
-- Regras:
--   * só usuários criam comunidades; profissionais entram como admin profissional;
--   * convites: até 5 profissionais ranqueados (quem atua na categoria da comunidade primeiro,
--     depois quem mais publica); só eles podem aceitar;
--   * um profissional não administra duas comunidades; quem já saiu não é convidado de volta;
--   * admin usuário que sai de uma comunidade ainda pendente cancela a comunidade;
--   * só se publica em comunidade ativa (com admin usuário e profissional).
-- Também deixa vagas as comunidades de demonstração, cujos admins foram desativados.

-- ---------------------------------------------------------------------------
-- Criar: só usuários
-- ---------------------------------------------------------------------------
create or replace function public.create_community(
  p_name text, p_description text, p_category text,
  p_objective text default null, p_cover_image_url text default null
)
returns public.communities
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  c public.communities;
begin
  if me is null then raise exception 'É preciso estar logado' using errcode = '42501'; end if;
  if public.is_verified_professional(me) then
    raise exception 'Profissionais não criam comunidades: eles entram como administradores profissionais das criadas pelos usuários.';
  end if;
  if exists (select 1 from public.communities where admin_user_id = me) then
    raise exception 'Você já administra uma comunidade. Cada pessoa administra uma por vez.';
  end if;
  insert into public.communities (slug, name, description, category, objective, cover_image_url,
                                   created_by, admin_user_id, status)
  values (public.unique_slug(p_name), trim(p_name), coalesce(trim(p_description), ''), p_category,
          nullif(trim(p_objective), ''), p_cover_image_url, me, me, 'pendente')
  returning * into c;
  insert into public.community_members (community_id, user_id) values (c.id, me);
  return c;
end;
$$;
-- ---------------------------------------------------------------------------
-- Candidatos a admin profissional (o "convite")
-- ---------------------------------------------------------------------------
-- Elegíveis: profissionais verificados, com conta ativa, que não administram outra comunidade e não saíram desta.
-- Quem atua na categoria vem primeiro (desempate por atividade, até 20 posts). Se ninguém atua
-- no tema, entram os mais ativos, para a comunidade não ficar parada. No máximo 5.
-- Quem pode ver a lista: o próprio candidato, quem criou ou administra a comunidade e a plataforma.
create or replace function public.community_candidates(p_community uuid)
returns table (user_id uuid, score integer, matches_topic boolean)
language sql stable security definer set search_path = public as $$
  with c as (select * from public.communities where id = p_community),
  elig as (
    select pr.user_id,
           coalesce(c.category = any (pr.specialties), false) as m,
           ((case when c.category = any (pr.specialties) then 100 else 0 end)
             + least(20, (select count(*) from public.posts po where po.author_id = pr.user_id)))::integer as score
      from public.professionals pr, c
     where not (pr.user_id = any (c.former_professional_ids))
       -- contas desativadas (ex.: demonstração) não ocupam vaga entre os convidados
       and exists (
         select 1 from auth.users u
          where u.id = pr.user_id and (u.banned_until is null or u.banned_until < now())
       )
       and not exists (
         select 1 from public.communities o
          where o.professional_id = pr.user_id or o.admin_user_id = pr.user_id
       )
  ),
  topic as (select exists (select 1 from elig where m) as any_match)
  select e.user_id, e.score, e.m
    from elig e, topic t, c
   where (not t.any_match or e.m)
     and (
       e.user_id = auth.uid()
       or c.created_by = auth.uid()
       or c.admin_user_id = auth.uid()
       or public.is_platform_admin()
     )
   order by e.score desc, e.user_id
   limit 5;
$$;
-- Comunidades que estão convidando a pessoa logada para ser admin profissional.
create or replace function public.my_community_invites()
returns setof public.communities
language sql stable set search_path = public as $$
  select c.*
    from public.communities c
   where c.professional_id is null
     and c.status in ('pendente', 'suspensa')
     and exists (select 1 from public.community_candidates(c.id) k where k.user_id = auth.uid())
   order by c.created_at;
$$;
-- Profissional aceita: precisa estar entre os candidatos (isso já garante verificado, sem outra
-- comunidade e sem ter saído desta).
create or replace function public.accept_community_professional(p_community uuid)
returns public.communities
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  c public.communities;
begin
  if not public.is_verified_professional(me) then
    raise exception 'Apenas profissionais verificados podem administrar comunidades.';
  end if;
  if exists (select 1 from public.communities where professional_id = me or admin_user_id = me) then
    raise exception 'Você já administra uma comunidade. Cada pessoa administra uma por vez.';
  end if;
  if not exists (select 1 from public.community_candidates(p_community) k where k.user_id = me) then
    raise exception 'Você não está entre os convidados desta comunidade.';
  end if;
  update public.communities
     set professional_id = me,
         status = case when admin_user_id is not null then 'ativa'::public.community_status else 'suspensa' end
   where id = p_community and professional_id is null and status in ('pendente', 'suspensa')
  returning * into c;
  if c.id is null then raise exception 'Esta comunidade não está mais procurando um profissional.'; end if;
  insert into public.community_members (community_id, user_id) values (c.id, me) on conflict do nothing;
  return c;
end;
$$;
-- ---------------------------------------------------------------------------
-- Deixar a administração
-- ---------------------------------------------------------------------------
-- Admin usuário de comunidade ainda pendente: a comunidade é cancelada (a linha apagada é devolvida).
-- Nos demais casos a comunidade fica suspensa até repor o admin.
create or replace function public.leave_community_admin(p_community uuid)
returns public.communities
language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  c public.communities;
begin
  delete from public.communities
   where id = p_community and admin_user_id = me and status = 'pendente'
  returning * into c;
  if c.id is not null then return c; end if;

  update public.communities
     set admin_user_id = case when admin_user_id = me then null else admin_user_id end,
         professional_id = case when professional_id = me then null else professional_id end,
         former_professional_ids = case when professional_id = me
           then array_append(former_professional_ids, me) else former_professional_ids end,
         status = case when status = 'pendente' then status else 'suspensa' end
   where id = p_community and (admin_user_id = me or professional_id = me)
  returning * into c;
  if c.id is null then raise exception 'Você não administra esta comunidade.'; end if;
  return c;
end;
$$;
-- ---------------------------------------------------------------------------
-- Publicar: só em comunidade ativa
-- ---------------------------------------------------------------------------
create or replace function public.check_post_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.publish_at > now() + interval '1 minute' and not public.is_verified_professional(new.author_id) then
    raise exception 'Apenas profissionais podem agendar publicações.';
  end if;
  if tg_op = 'INSERT' then
    new.pinned := false;
    new.hidden := false;
    if new.community_id is not null then
      if not public.is_community_member(new.community_id, new.author_id) then
        raise exception 'Entre na comunidade para publicar nela.';
      end if;
      if not exists (select 1 from public.communities where id = new.community_id and status = 'ativa') then
        raise exception 'Esta comunidade está pausada ou aguardando administradores: por enquanto só dá para ler.';
      end if;
    end if;
  end if;
  return new;
end;
$$;
-- ---------------------------------------------------------------------------
-- Consultas para o app
-- ---------------------------------------------------------------------------
-- Comunidades com contagens, papéis dos admins e se a pessoa logada é membro.
-- security invoker: o RLS decide quais comunidades a pessoa vê (pendentes só para quem pode).
create or replace function public.get_communities(p_slug text default null, p_only_mine boolean default false)
returns table (
  id uuid, slug text, name text, description text, category text, objective text,
  cover_image_url text, status public.community_status, created_at timestamptz,
  created_by uuid, admin_user_id uuid, admin_name text, admin_username text,
  professional_id uuid, professional_name text, professional_username text,
  former_professional_ids uuid[], member_count integer, post_count integer, is_member boolean
)
language sql stable set search_path = public as $$
  select c.id, c.slug, c.name, c.description, c.category, c.objective, c.cover_image_url,
         c.status, c.created_at, c.created_by,
         c.admin_user_id, au.name, au.username,
         c.professional_id, pu.name, pu.username,
         c.former_professional_ids,
         (select count(*)::integer from public.community_members m where m.community_id = c.id),
         (select count(*)::integer from public.posts p where p.community_id = c.id and not p.hidden),
         exists (select 1 from public.community_members m where m.community_id = c.id and m.user_id = auth.uid())
    from public.communities c
    left join lateral public.person_cards(array[c.admin_user_id]) au on true
    left join lateral public.person_cards(array[c.professional_id]) pu on true
   where (p_slug is null or c.slug = p_slug)
     and (not p_only_mine or exists (
           select 1 from public.community_members m where m.community_id = c.id and m.user_id = auth.uid()))
   order by c.created_at desc;
$$;
-- Membros de uma comunidade (cartão mínimo, inclusive de perfil privado).
create or replace function public.get_community_members(p_community uuid)
returns table (id uuid, name text, username text, avatar_url text, role public.app_role, joined_at timestamptz)
language sql stable set search_path = public as $$
  select pc.id, pc.name, pc.username, pc.avatar_url, pc.role, m.joined_at
    from public.community_members m
    join lateral public.person_cards(array[m.user_id]) pc on true
   where m.community_id = p_community
   order by m.joined_at;
$$;
revoke execute on function public.community_candidates(uuid) from public, anon;
revoke execute on function public.my_community_invites() from public, anon;
revoke execute on function public.get_communities(text, boolean) from public, anon;
revoke execute on function public.get_community_members(uuid) from public, anon;
grant execute on function public.community_candidates(uuid) to authenticated, service_role;
grant execute on function public.my_community_invites() to authenticated, service_role;
grant execute on function public.get_communities(text, boolean) to authenticated, service_role;
grant execute on function public.get_community_members(uuid) to authenticated, service_role;
-- ---------------------------------------------------------------------------
-- Comunidades de demonstração: os admins (contas desativadas) saem; ficam suspensas e
-- vagas, com membros e posts preservados, para a plataforma indicar admins reais.
-- ---------------------------------------------------------------------------
update public.communities
   set admin_user_id = null,
       professional_id = null,
       former_professional_ids = '{}',
       status = 'suspensa'
 where admin_user_id in (select id from auth.users where banned_until is not null)
    or professional_id in (select id from auth.users where banned_until is not null);

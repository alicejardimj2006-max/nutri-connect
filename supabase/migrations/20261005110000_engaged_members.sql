-- Membros mais engajados de uma comunidade: candidatos a novo admin usuário quando ela fica
-- suspensa sem um. Só a plataforma consulta. Entram membros que não são profissionais e não
-- administram outra comunidade; a pontuação é posts x3 + comentários x2 + apoios x1 (como no app).

create or replace function public.community_engaged_members(p_community uuid)
returns table (
  id uuid, name text, username text, avatar_url text,
  posts integer, comments integer, supports integer, score integer
)
language sql stable security definer set search_path = public as $$
  select s.id, s.name, s.username, s.avatar_url, s.posts, s.comments, s.supports,
         (s.posts * 3 + s.comments * 2 + s.supports)::integer as score
    from (
      select pc.id, pc.name, pc.username, pc.avatar_url,
             (select count(*)::integer from public.posts p
               where p.community_id = p_community and p.author_id = m.user_id) as posts,
             (select count(*)::integer from public.comments c
                join public.posts p on p.id = c.post_id
               where p.community_id = p_community and c.author_id = m.user_id) as comments,
             (select count(*)::integer from public.post_reactions r
                join public.posts p on p.id = r.post_id
               where p.community_id = p_community and r.user_id = m.user_id and r.kind = 'apoiar') as supports
        from public.community_members m
        join lateral public.person_cards(array[m.user_id]) pc on true
       where m.community_id = p_community
         and public.is_platform_admin()
         and not public.is_verified_professional(m.user_id)
         and not exists (
           select 1 from public.communities o
            where o.admin_user_id = m.user_id or o.professional_id = m.user_id
         )
    ) s
   order by score desc, s.name
   limit 5;
$$;

revoke execute on function public.community_engaged_members(uuid) from public, anon;
grant execute on function public.community_engaged_members(uuid) to authenticated, service_role;

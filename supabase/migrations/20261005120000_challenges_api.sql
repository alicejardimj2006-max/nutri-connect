-- Desafios: consultas para o app e privacidade da participação.
--
-- * get_challenges: desafios visíveis, com contagens, comunidade, criador e o progresso de quem consulta.
-- * get_challenge_participants: quem participa (cartão mínimo) e quantos passos já fez.
-- * get_challenge_tips: dicas da comunidade, com o cartão de quem escreveu.
-- * user_challenges: desafios de uma pessoa (perfil), só se o conteúdo do perfil puder ser visto.
-- * A leitura de challenge_participants deixa de ser aberta a todos: perfil privado de quem não é
--   amigo e bloqueios passam a valer também para a participação em desafios.

drop policy if exists "challenge_participants: leitura" on public.challenge_participants;
create policy "challenge_participants: leitura" on public.challenge_participants
  for select to authenticated using (
    user_id = auth.uid() or public.can_view_profile_content(user_id)
  );

create or replace function public.get_challenges(p_id uuid default null, p_community uuid default null)
returns table (
  id uuid, community_id uuid, community_slug text, community_name text,
  created_by uuid, created_by_name text,
  title text, description text, category text, badge_icon text, badge_label text,
  duration text, steps text[], tips text[], theme_id uuid,
  "position" integer, required_challenge_id uuid, created_at timestamptz,
  participant_count integer, completed_count integer,
  joined boolean, my_steps integer[], my_completed_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select c.id, c.community_id, co.slug, co.name, c.created_by, cb.name,
         c.title, c.description, c.category, c.badge_icon, c.badge_label,
         c.duration, c.steps, c.tips, c.theme_id,
         c.position, c.required_challenge_id, c.created_at,
         (select count(*)::integer from public.challenge_participants p where p.challenge_id = c.id),
         (select count(*)::integer from public.challenge_participants p
           where p.challenge_id = c.id and p.completed_at is not null),
         exists (select 1 from public.challenge_participants p
                  where p.challenge_id = c.id and p.user_id = auth.uid()),
         coalesce((select p.completed_steps from public.challenge_participants p
                    where p.challenge_id = c.id and p.user_id = auth.uid()), '{}'),
         (select p.completed_at from public.challenge_participants p
           where p.challenge_id = c.id and p.user_id = auth.uid())
    from public.challenges c
    left join public.communities co on co.id = c.community_id
    left join lateral public.person_cards(array[c.created_by]) cb on true
   where auth.uid() is not null
     and (c.community_id is null or public.community_is_visible(c.community_id))
     and (p_id is null or c.id = p_id)
     and (p_community is null or c.community_id = p_community)
   order by c.position, c.created_at;
$$;

create or replace function public.get_challenge_participants(p_challenge uuid)
returns table (
  id uuid, name text, username text, avatar_url text,
  steps_done integer, completed boolean, joined_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select pc.id, pc.name, pc.username, pc.avatar_url,
         cardinality(p.completed_steps), p.completed_at is not null, p.joined_at
    from public.challenge_participants p
    join public.challenges c on c.id = p.challenge_id
    join lateral public.person_cards(array[p.user_id]) pc on true
   where p.challenge_id = p_challenge
     and auth.uid() is not null
     and (c.community_id is null or public.community_is_visible(c.community_id))
     -- perfil privado de quem não é amigo não aparece na lista de participantes
     and (p.user_id = auth.uid() or public.can_view_profile_content(p.user_id))
   order by cardinality(p.completed_steps) desc, p.joined_at
   limit 60;
$$;

create or replace function public.get_challenge_tips(p_challenge uuid)
returns table (
  id uuid, author_id uuid, author_name text, author_username text, body text, created_at timestamptz
)
language sql stable set search_path = public as $$
  select t.id, t.author_id, a.name, a.username, t.body, t.created_at
    from public.challenge_tips t
    join lateral public.person_cards(array[t.author_id]) a on true
   where t.challenge_id = p_challenge
   order by t.created_at;
$$;

create or replace function public.user_challenges(p_user uuid default auth.uid())
returns table (
  challenge_id uuid, title text, category text, badge_icon text, badge_label text,
  steps_total integer, steps_done integer, completed boolean,
  completed_at timestamptz, joined_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select c.id, c.title, c.category, c.badge_icon, c.badge_label,
         cardinality(c.steps), cardinality(p.completed_steps), p.completed_at is not null,
         p.completed_at, p.joined_at
    from public.challenge_participants p
    join public.challenges c on c.id = p.challenge_id
   where p.user_id = p_user
     and auth.uid() is not null
     and (p_user = auth.uid() or public.can_view_profile_content(p_user))
     and (c.community_id is null or public.community_is_visible(c.community_id))
   order by p.joined_at desc;
$$;

revoke execute on function public.get_challenges(uuid, uuid) from public, anon;
revoke execute on function public.get_challenge_participants(uuid) from public, anon;
revoke execute on function public.get_challenge_tips(uuid) from public, anon;
revoke execute on function public.user_challenges(uuid) from public, anon;
grant execute on function public.get_challenges(uuid, uuid) to authenticated, service_role;
grant execute on function public.get_challenge_participants(uuid) to authenticated, service_role;
grant execute on function public.get_challenge_tips(uuid) to authenticated, service_role;
grant execute on function public.user_challenges(uuid) to authenticated, service_role;

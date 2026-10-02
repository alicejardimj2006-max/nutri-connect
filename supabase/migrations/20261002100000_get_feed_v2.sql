-- get_feed v2.
--
-- 1) Autor e autor de comentário vinham de um INNER JOIN em profiles. Depois da privacidade de
--    perfis (20261001170000), uma pessoa com perfil privado que o leitor não vê "sumia": o post
--    (ou o comentário) desaparecia do feed em vez de mostrar só nome, @ e foto. Agora o autor
--    vem de person_cards(), que devolve o cartão mínimo mesmo de perfil privado.
-- 2) Novo parâmetro p_post e escopo 'post': busca uma publicação por id (página da receita).
--
-- Escopos: todos | amigos | seguindo | comunidades | comunidade | autor | salvos | agendados
--          | tema | post
-- A visibilidade continua sendo a do RLS (security invoker).

drop function if exists public.get_feed(text, uuid, uuid, public.post_type, text, uuid, timestamptz, integer);

create or replace function public.get_feed(
  p_scope text default 'todos',
  p_community uuid default null,
  p_author uuid default null,
  p_type public.post_type default null,
  p_query text default null,
  p_theme uuid default null,
  p_before timestamptz default null,
  p_limit integer default 20,
  p_post uuid default null
)
returns table (
  id uuid, author_id uuid, author_name text, author_username text, author_avatar text,
  author_role public.app_role, community_id uuid, community_slug text, community_name text,
  type public.post_type, title text, body text, image_url text, tags text[],
  audience public.post_audience, recipe jsonb, block_order text[], theme_id uuid,
  pinned boolean, hidden boolean, publish_at timestamptz, created_at timestamptz,
  likes uuid[], supports uuid[], prepared uuid[], comments jsonb, saved boolean
)
language sql stable set search_path = public as $$
  select p.id, p.author_id, a.name, a.username, a.avatar_url, a.role,
         p.community_id, c.slug, c.name,
         p.type, p.title, p.body, p.image_url, p.tags, p.audience, p.recipe, p.block_order,
         p.theme_id, p.pinned, p.hidden, p.publish_at, p.created_at,
         coalesce((select array_agg(r.user_id) from public.post_reactions r where r.post_id = p.id and r.kind = 'curtir'), '{}'),
         coalesce((select array_agg(r.user_id) from public.post_reactions r where r.post_id = p.id and r.kind = 'apoiar'), '{}'),
         coalesce((select array_agg(r.user_id) from public.post_reactions r where r.post_id = p.id and r.kind = 'preparei'), '{}'),
         coalesce((
           select jsonb_agg(jsonb_build_object(
                    'id', cm.id, 'author_id', cm.author_id, 'author_name', ca.name,
                    'author_username', ca.username, 'author_avatar', ca.avatar_url,
                    'body', cm.body, 'created_at', cm.created_at) order by cm.created_at)
             from public.comments cm
             join lateral public.person_cards(array[cm.author_id]) ca on true
            where cm.post_id = p.id
         ), '[]'::jsonb),
         exists (select 1 from public.saved_posts s where s.post_id = p.id and s.user_id = auth.uid())
    from public.posts p
    left join lateral public.person_cards(array[p.author_id]) a on true
    left join public.communities c on c.id = p.community_id
   where (p_before is null or p.publish_at < p_before)
     and (p_type is null or p.type = p_type)
     and (p_query is null or public.search_norm(coalesce(p.title, '') || ' ' || p.body || ' ' || array_to_string(p.tags, ' '))
                              like '%' || public.search_norm(p_query) || '%')
     and case coalesce(p_scope, 'todos')
       when 'todos' then p.publish_at <= now()
       when 'amigos' then p.publish_at <= now()
         and (p.author_id = auth.uid() or p.author_id in (select public.friend_ids(auth.uid())))
       when 'seguindo' then p.publish_at <= now()
         and p.author_id in (select followee_id from public.follows where follower_id = auth.uid())
       when 'comunidades' then p.publish_at <= now()
         and p.community_id in (select community_id from public.community_members where user_id = auth.uid())
       when 'comunidade' then p.community_id = p_community and p.publish_at <= now()
       when 'autor' then p.author_id = p_author and (p.publish_at <= now() or p.author_id = auth.uid())
       when 'salvos' then exists (select 1 from public.saved_posts s where s.post_id = p.id and s.user_id = auth.uid())
       when 'agendados' then p.author_id = auth.uid() and p.publish_at > now()
       when 'tema' then p.theme_id = p_theme and p.publish_at <= now()
       when 'post' then p.id = p_post and (p.publish_at <= now() or p.author_id = auth.uid())
       else false
     end
   order by (p_scope = 'comunidade' and p.pinned) desc, p.publish_at desc, p.created_at desc
   limit least(greatest(coalesce(p_limit, 20), 1), 100);
$$;

revoke execute on function public.get_feed(text, uuid, uuid, public.post_type, text, uuid, timestamptz, integer, uuid) from public, anon;
grant execute on function public.get_feed(text, uuid, uuid, public.post_type, text, uuid, timestamptz, integer, uuid) to authenticated, service_role;

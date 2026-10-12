-- Feed com algoritmo (abas Geral, Amigos e Profissionais do Espaço), calculado no banco, sem IA.
--
-- Só as publicações dos últimos 7 dias são ordenadas pela pontuação; as mais antigas o app busca
-- depois com get_feed, por ordem de data. A pontuação soma:
--   * proximidade: amigo (+3), comunidade de que a pessoa participa (+2), profissional que ela
--     segue (+3) e, na aba Geral, profissional verificado (+1);
--   * engajamento: 2·ln(1 + curtir + 1,5·apoiar + 3·preparei + 2·comentários + 2,5·salvos);
--   * interesses: tags que a pessoa curtiu, salvou ou usou nos próprios posts (até +3);
-- e cai pela metade a cada ~33 h (exp(-horas/48)). Variedade: cada publicação a mais do mesmo
-- autor vale 0,6× a anterior, e da mesma comunidade, 0,8×.
-- O post que a própria pessoa publicou há menos de 1 hora fica no topo do feed dela.
--
-- p_now congela o "agora" da primeira página, para as páginas seguintes continuarem a mesma ordem.
-- Nada é gravado sobre o que a pessoa viu.

create index if not exists saved_posts_post_idx on public.saved_posts (post_id);

-- Ordem dos ids (security definer só para contar reações, comentários e salvos de todo mundo;
-- a visibilidade é conferida explicitamente com post_is_visible).
create or replace function public.feed_rank_ids(
  p_scope text default 'todos',
  p_now timestamptz default null,
  p_offset integer default 0,
  p_limit integer default 20
)
returns table (post_id uuid, ord integer)
language sql stable security definer set search_path = public as $$
  with ctx as (
    select auth.uid() as uid, least(coalesce(p_now, now()), now()) as t
  ),
  friends as (
    select f as id from ctx, public.friend_ids(ctx.uid) f
  ),
  followed as (
    select fo.followee_id as id from public.follows fo, ctx where fo.follower_id = ctx.uid
  ),
  my_tags as (
    select lower(tag) as tag, count(*)::numeric as w
      from (
        select unnest(p.tags) as tag
          from public.post_reactions r join public.posts p on p.id = r.post_id, ctx
         where r.user_id = ctx.uid and r.created_at > ctx.t - interval '60 days'
        union all
        select unnest(p.tags)
          from public.saved_posts s join public.posts p on p.id = s.post_id, ctx
         where s.user_id = ctx.uid and s.created_at > ctx.t - interval '60 days'
        union all
        select unnest(p.tags)
          from public.posts p, ctx
         where p.author_id = ctx.uid and p.created_at > ctx.t - interval '90 days'
      ) x
     group by lower(tag)
  ),
  cand as (
    select p.id, p.author_id, p.community_id, p.publish_at, p.tags
      from public.posts p, ctx
     where ctx.uid is not null
       and p.publish_at <= ctx.t
       and p.publish_at > ctx.t - interval '7 days'
       and public.post_is_visible(p.author_id, p.community_id, p.audience, p.hidden, p.publish_at, ctx.uid)
       and case coalesce(p_scope, 'todos')
         when 'todos' then true
         when 'amigos' then p.author_id = ctx.uid or p.author_id in (select id from friends)
         when 'seguindo' then p.author_id in (select id from followed)
         when 'profissionais' then exists (select 1 from public.professionals pr where pr.user_id = p.author_id)
         else false
       end
  ),
  scored as (
    select c.id, c.author_id, c.community_id, c.publish_at,
           (c.author_id = ctx.uid and c.publish_at > ctx.t - interval '1 hour') as fresh_own,
           extract(epoch from (ctx.t - c.publish_at)) / 3600.0 as age_h,
           (case when c.author_id in (select id from friends) then 3 else 0 end
            + case when c.community_id is not null then 2 else 0 end
            + case when c.author_id in (select id from followed) then 3 else 0 end
            + case when coalesce(p_scope, 'todos') = 'todos'
                    and public.is_verified_professional(c.author_id) then 1 else 0 end
           )::numeric as prox,
           2 * ln(1
             + coalesce((select sum(case r.kind when 'curtir' then 1 when 'apoiar' then 1.5 else 3 end)
                           from public.post_reactions r where r.post_id = c.id), 0)
             + 2 * (select count(*) from public.comments cm where cm.post_id = c.id and not cm.hidden)
             + 2.5 * (select count(*) from public.saved_posts s where s.post_id = c.id)
           ) as eng,
           least(3, coalesce((select sum(least(mt.w, 3)) / 3 from my_tags mt
                               where mt.tag in (select lower(t) from unnest(c.tags) t)), 0)) as interest
      from cand c, ctx
  ),
  base as (
    select s.id, s.author_id, s.community_id, s.fresh_own, s.publish_at,
           (1 + s.prox + s.eng + s.interest) * exp(-s.age_h / 48.0) as score
      from scored s
  ),
  diverse as (
    select b.id, b.fresh_own, b.publish_at,
           b.score
             * power(0.6, (row_number() over (partition by b.author_id order by b.score desc, b.id)) - 1)
             * case when b.community_id is null then 1
                    else power(0.8, (row_number() over (partition by b.community_id order by b.score desc, b.id)) - 1)
               end as final
      from base b
  ),
  ranked as (
    select d.id,
           row_number() over (
             order by d.fresh_own desc,
                      case when d.fresh_own then d.publish_at end desc nulls last,
                      d.final desc, d.publish_at desc, d.id
           )::integer as ord
      from diverse d
  )
  select r.id, r.ord
    from ranked r
   order by r.ord
  offset greatest(coalesce(p_offset, 0), 0)
   limit least(greatest(coalesce(p_limit, 20), 1), 50);
$$;

-- Mesmas colunas de get_feed, na ordem do algoritmo. Sem security definer: a leitura das
-- publicações e dos comentários continua passando pelo RLS.
create or replace function public.get_feed_ranked(
  p_scope text default 'todos',
  p_now timestamptz default null,
  p_offset integer default 0,
  p_limit integer default 20
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
    from public.feed_rank_ids(p_scope, p_now, p_offset, p_limit) k
    join public.posts p on p.id = k.post_id
    left join lateral public.person_cards(array[p.author_id]) a on true
    left join public.communities c on c.id = p.community_id
   order by k.ord;
$$;

revoke execute on function public.feed_rank_ids(text, timestamptz, integer, integer) from public, anon;
grant execute on function public.feed_rank_ids(text, timestamptz, integer, integer) to authenticated, service_role;
revoke execute on function public.get_feed_ranked(text, timestamptz, integer, integer) from public, anon;
grant execute on function public.get_feed_ranked(text, timestamptz, integer, integer) to authenticated, service_role;

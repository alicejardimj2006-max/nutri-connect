-- Comunidades privadas: as publicações de uma comunidade só são vistas por quem participa dela
-- (ou a administra). Quem não participa vê só a vitrine (nome, descrição, regras, membros) e o
-- botão de entrar, que continua livre.
-- Comentários, reações, salvos, busca, get_feed e recipes_with_ingredients já passam por
-- post_is_visible / can_view_post, então a regra vale para todos eles.

create or replace function public.post_is_visible(
  p_author uuid, p_community uuid, p_audience public.post_audience,
  p_hidden boolean, p_publish_at timestamptz, p_viewer uuid default auth.uid()
)
returns boolean language sql stable security definer set search_path = public as $$
  select p_author = p_viewer
      or public.is_platform_admin(p_viewer)
      or (
        not p_hidden
        and p_publish_at <= now()
        and not public.is_blocked_between(p_author, p_viewer)
        and case
          when p_community is not null then
            public.community_is_visible(p_community, p_viewer)
            and (public.is_community_member(p_community, p_viewer)
                 or public.is_community_admin(p_community, p_viewer))
          when p_audience = 'amigos' then public.are_friends(p_author, p_viewer)
          else public.can_view_profile_content(p_author, p_viewer)
        end
      );
$$;

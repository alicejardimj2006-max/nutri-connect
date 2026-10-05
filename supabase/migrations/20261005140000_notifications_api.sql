-- Notificações: lista da pessoa logada com o cartão de quem a causou (nome, @ e foto).
-- O RLS de notifications já limita à própria pessoa; person_cards omite quem tem bloqueio.

create or replace function public.get_notifications(p_limit integer default 30, p_before timestamptz default null)
returns table (
  id uuid, type text, actor_id uuid, actor_name text, actor_username text, actor_avatar text,
  entity_type text, entity_id text, data jsonb, read_at timestamptz, created_at timestamptz
)
language sql stable set search_path = public as $$
  select n.id, n.type, n.actor_id, a.name, a.username, a.avatar_url,
         n.entity_type, n.entity_id, n.data, n.read_at, n.created_at
    from public.notifications n
    left join lateral public.person_cards(array[n.actor_id]) a on true
   where n.user_id = auth.uid()
     and (p_before is null or n.created_at < p_before)
   order by n.created_at desc
   limit least(greatest(coalesce(p_limit, 30), 1), 100);
$$;

revoke execute on function public.get_notifications(integer, timestamptz) from public, anon;
grant execute on function public.get_notifications(integer, timestamptz) to authenticated, service_role;
revoke execute on function public.mark_all_notifications_read() from public, anon;
grant execute on function public.mark_all_notifications_read() to authenticated, service_role;

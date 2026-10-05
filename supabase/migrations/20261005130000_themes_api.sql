-- Tema da semana: consultas para o app e privacidade dos votos.
--
-- * Os votos deixam de ser legíveis por todos (quem votou em quê é dado da pessoa); o resultado
--   agregado continua vindo de theme_poll_results().
-- * get_weekly_theme: o tema (ativo ou a prévia), com a enquete, o resultado e o meu voto.
-- * theme_history: temas encerrados, com quantas receitas e publicações tiveram.

drop policy if exists "theme_poll_votes: leitura" on public.theme_poll_votes;
create policy "theme_poll_votes: leitura" on public.theme_poll_votes
  for select to authenticated using (user_id = auth.uid());

-- p_status: 'ativo' (padrão) ou 'previa' (só profissionais e admins; can_view_theme decide).
create or replace function public.get_weekly_theme(p_id uuid default null, p_status text default 'ativo')
returns table (
  id uuid, week_start date, status public.theme_status,
  title text, subtitle text, description text, badge text, question text, poll_question text,
  translations jsonb, source text, activated_at timestamptz, poll jsonb
)
language sql stable security definer set search_path = public as $$
  select t.id, t.week_start, t.status, t.title, t.subtitle, t.description, t.badge, t.question,
         t.poll_question, t.translations, t.source, t.activated_at,
         coalesce((
           select jsonb_agg(jsonb_build_object(
                    'id', o.id, 'position', o.position, 'text', o.text, 'translations', o.translations,
                    'votes', (select count(*) from public.theme_poll_votes v where v.option_id = o.id),
                    'mine', exists (select 1 from public.theme_poll_votes v
                                     where v.option_id = o.id and v.user_id = auth.uid())
                  ) order by o.position)
             from public.theme_poll_options o where o.theme_id = t.id
         ), '[]'::jsonb)
    from public.weekly_themes t
   where auth.uid() is not null
     and public.can_view_theme(t.id)
     and (
       (p_id is not null and t.id = p_id)
       or (p_id is null and t.status = case when p_status = 'previa' then 'previa'::public.theme_status
                                            else 'ativo'::public.theme_status end)
     )
   order by t.week_start desc
   limit 1;
$$;

create or replace function public.theme_history(p_limit integer default 6)
returns table (
  id uuid, week_start date, title text, subtitle text, description text, translations jsonb,
  recipes_count integer, posts_count integer
)
language sql stable security definer set search_path = public as $$
  select t.id, t.week_start, t.title, t.subtitle, t.description, t.translations,
         (select count(*)::integer from public.posts p
           where p.theme_id = t.id and p.type = 'receita' and not p.hidden
             and p.audience = 'publico' and p.community_id is null),
         (select count(*)::integer from public.posts p
           where p.theme_id = t.id and not p.hidden and p.audience = 'publico' and p.community_id is null)
    from public.weekly_themes t
   where auth.uid() is not null and t.status = 'encerrado'
   order by t.week_start desc
   limit least(greatest(coalesce(p_limit, 6), 1), 24);
$$;

revoke execute on function public.get_weekly_theme(uuid, text) from public, anon;
revoke execute on function public.theme_history(integer) from public, anon;
grant execute on function public.get_weekly_theme(uuid, text) to authenticated, service_role;
grant execute on function public.theme_history(integer) to authenticated, service_role;

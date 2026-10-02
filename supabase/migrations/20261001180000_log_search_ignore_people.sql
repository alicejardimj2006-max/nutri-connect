-- A busca de pessoas não deve alimentar o tema da semana. O app não registra buscas feitas na
-- aba "Pessoas", mas quem digita um nome em outra aba ainda chegaria aqui. Por isso o
-- log_search também ignora termos que coincidem com o @ ou com o nome completo de alguém
-- (ou com o começo de um nome completo, quando o termo já tem duas palavras ou mais).
-- Termos de uma palavra só (ex.: "aveia", "maria") continuam valendo como assunto.

create or replace function public.log_search(p_term text)
returns void language plpgsql security definer set search_path = public as $$
declare
  t text := regexp_replace(public.search_norm(coalesce(p_term, '')), '\s+', ' ', 'g');
begin
  if length(t) < 3 or length(t) > 60 or t ~ '@' or t ~ '\d{4,}' or t ~ '^\W+$' then
    return;
  end if;
  if exists (
    select 1 from public.profiles p
     where p.username = t
        or public.search_norm(p.name) = t
        or (t like '% %' and public.search_norm(p.name) like t || '%')
  ) then
    return;
  end if;
  insert into public.search_term_stats (term) values (t)
  on conflict (term, day) do update set hits = public.search_term_stats.hits + 1;
end;
$$;

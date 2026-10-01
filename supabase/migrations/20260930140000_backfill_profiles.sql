-- Contas que já existiam no Auth antes deste schema não passaram pelo trigger
-- handle_new_user: cria o perfil delas e, se houver, aproveita os dados da
-- tabela antiga (public.profiles_legacy).

insert into public.profiles (id, name, goal, journey_goal)
select u.id,
       coalesce(nullif(u.raw_user_meta_data ->> 'name', ''),
                nullif(u.raw_user_meta_data ->> 'full_name', ''),
                split_part(u.email, '@', 1)),
       nullif(u.raw_user_meta_data ->> 'goal', ''),
       nullif(u.raw_user_meta_data ->> 'goal', '')
  from auth.users u
on conflict (id) do nothing;

insert into public.profile_private (id, email)
select u.id, u.email
  from auth.users u
on conflict (id) do nothing;

do $$
declare
  r record;
  birth date;
begin
  if to_regclass('public.profiles_legacy') is null then
    return;
  end if;

  -- Nome da tabela antiga, quando o perfil novo só tem o prefixo do e-mail.
  execute $sql$
    update public.profiles p
       set name = trim(l.full_name)
      from public.profiles_legacy l
      join auth.users u on u.id::text = l.user_id::text
     where p.id = u.id
       and coalesce(trim(l.full_name), '') <> ''
       and p.name = split_part(u.email, '@', 1)
  $sql$;

  -- Dados pessoais: preenche só o que ainda estiver vazio. Linha a linha, para
  -- que um valor inválido (ex.: data impossível) não impeça o resto.
  for r in execute $sql$
    select u.id as uid, l.cpf::text as cpf, l.phone::text as phone,
           l.birth::text as birth, lower(l.gender::text) as gender
      from public.profiles_legacy l
      join auth.users u on u.id::text = l.user_id::text
  $sql$
  loop
    begin
      birth := case
        when r.birth ~ '^\d{4}-\d{2}-\d{2}' then substr(r.birth, 1, 10)::date
        when r.birth ~ '^\d{2}/\d{2}/\d{4}$' then to_date(r.birth, 'DD/MM/YYYY')
      end;
    exception when others then
      birth := null;
    end;
    update public.profile_private v
       set cpf = coalesce(v.cpf, nullif(trim(r.cpf), '')),
           phone = coalesce(v.phone, nullif(trim(r.phone), '')),
           birth_date = coalesce(v.birth_date, birth),
           sex = coalesce(v.sex, case
             when r.gender in ('feminino', 'f', 'female', 'mulher') then 'feminino'
             when r.gender in ('masculino', 'm', 'male', 'homem') then 'masculino'
           end)
     where v.id = r.uid;
  end loop;
end;
$$;

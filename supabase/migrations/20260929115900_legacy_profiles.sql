-- Bancos criados antes deste schema têm uma tabela public.profiles própria
-- (id bigint, user_id, full_name, cpf, phone, birth, gender). Ela é preservada
-- como public.profiles_legacy e seus dados são copiados para o schema novo em
-- 20260930140000_backfill_profiles.sql. Em bancos novos, nada acontece.

do $$
declare
  r record;
begin
  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'profiles' and column_name = 'user_id'
  ) then
    return;
  end if;

  alter table public.profiles rename to profiles_legacy;

  -- Constraints com índice (pk/unique) viram relações com nome global no schema.
  for r in
    select conname from pg_constraint
     where conrelid = 'public.profiles_legacy'::regclass and conname like 'profiles\_%'
  loop
    execute format(
      'alter table public.profiles_legacy rename constraint %I to %I',
      r.conname, 'profiles_legacy_' || substr(r.conname, length('profiles_') + 1)
    );
  end loop;

  for r in
    select c.relname from pg_index i join pg_class c on c.oid = i.indexrelid
     where i.indrelid = 'public.profiles_legacy'::regclass and c.relname like 'profiles\_%'
       -- Índices de pk/unique já foram renomeados junto com a constraint.
       and c.relname not like 'profiles\_legacy\_%'
  loop
    execute format(
      'alter index public.%I rename to %I',
      r.relname, 'profiles_legacy_' || substr(r.relname, length('profiles_') + 1)
    );
  end loop;

  for r in
    select c.relname from pg_class c
      join pg_depend d on d.objid = c.oid and d.deptype in ('a', 'i')
     where c.relkind = 'S' and d.refobjid = 'public.profiles_legacy'::regclass
       and c.relname like 'profiles\_%'
  loop
    execute format(
      'alter sequence public.%I rename to %I',
      r.relname, 'profiles_legacy_' || substr(r.relname, length('profiles_') + 1)
    );
  end loop;

  raise notice 'public.profiles antiga preservada como public.profiles_legacy';
end;
$$;

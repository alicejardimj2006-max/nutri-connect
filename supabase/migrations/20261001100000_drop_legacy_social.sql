-- Tabelas criadas à mão no início do projeto (antes das migrations): nomes com
-- erros de digitação, sem relações nem RLS, e não usadas pelo app. O schema novo
-- recria tudo (communities, posts, comments, post_reactions, challenges, ...).
--
-- Segurança: só toca tabelas no formato antigo (id numérico). Vazias são
-- apagadas; com dados, viram <nome>_legacy (com índices/constraints renomeados).

do $$
declare
  t text;
  n bigint;
  r record;
begin
  foreach t in array array[
    'accept', 'ask', 'coments', 'comunities', 'conversations', 'likes', 'posts',
    'challenges', 'contact_us'
  ] loop
    if to_regclass(format('public.%I', t)) is null then
      continue;
    end if;
    if not exists (
      select 1 from information_schema.columns
       where table_schema = 'public' and table_name = t and column_name = 'id'
         and data_type in ('bigint', 'integer', 'smallint')
    ) then
      continue;
    end if;

    execute format('select count(*) from public.%I', t) into n;
    if n = 0 then
      execute format('drop table public.%I cascade', t);
      raise notice 'tabela antiga % (vazia) removida', t;
      continue;
    end if;

    execute format('alter table public.%I rename to %I', t, t || '_legacy');
    for r in
      select conname from pg_constraint
       where conrelid = format('public.%I', t || '_legacy')::regclass
         and conname like t || '\_%' and conname not like t || '\_legacy\_%'
    loop
      execute format('alter table public.%I rename constraint %I to %I',
        t || '_legacy', r.conname, t || '_legacy_' || substr(r.conname, length(t) + 2));
    end loop;
    for r in
      select c.relname from pg_index i join pg_class c on c.oid = i.indexrelid
       where i.indrelid = format('public.%I', t || '_legacy')::regclass
         and c.relname like t || '\_%' and c.relname not like t || '\_legacy\_%'
    loop
      execute format('alter index public.%I rename to %I',
        r.relname, t || '_legacy_' || substr(r.relname, length(t) + 2));
    end loop;
    for r in
      select c.relname from pg_class c
        join pg_depend d on d.objid = c.oid and d.deptype in ('a', 'i')
       where c.relkind = 'S' and d.refobjid = format('public.%I', t || '_legacy')::regclass
         and c.relname not like t || '\_legacy\_%'
    loop
      execute format('alter sequence public.%I rename to %I',
        r.relname, t || '_legacy_' || substr(r.relname, length(t) + 2));
    end loop;
    raise notice 'tabela antiga % tinha % linha(s): preservada como %_legacy', t, n, t;
  end loop;
end;
$$;

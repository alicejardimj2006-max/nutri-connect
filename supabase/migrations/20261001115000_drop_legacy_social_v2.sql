-- Correção de 20261001100000_drop_legacy_social: no banco do projeto as tabelas
-- antigas usam id uuid (não numérico), então aquela migration não as reconheceu.
-- Aqui elas são identificadas pela estrutura:
--   * accept, ask, coments, comunities, conversations, likes, contact_us: nomes
--     que o schema novo não usa → sempre são as antigas;
--   * posts: a antiga tem a coluna "context" (a nova tem "body");
--   * challenges: a antiga não tem "badge_label".
-- Vazias são apagadas; com dados, viram <nome>_legacy (índices e constraints renomeados).

do $$
declare
  t text;
  n bigint;
  r record;
  is_legacy boolean;
  has_col boolean;
begin
  foreach t in array array[
    'likes', 'coments', 'accept', 'conversations', 'ask', 'posts', 'challenges', 'comunities', 'contact_us'
  ] loop
    if to_regclass(format('public.%I', t)) is null then
      continue;
    end if;

    is_legacy := case t
      when 'posts' then
        exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'posts' and column_name = 'context')
        and not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'posts' and column_name = 'body')
      when 'challenges' then
        not exists (select 1 from information_schema.columns
                     where table_schema = 'public' and table_name = 'challenges' and column_name = 'badge_label')
      else true
    end;
    if not is_legacy then
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
    raise notice 'tabela antiga % tinha % linha(s): preservada como %_legacy', t, n, t;
  end loop;
end;
$$;

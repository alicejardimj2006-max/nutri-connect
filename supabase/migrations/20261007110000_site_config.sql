-- =============================================================================
-- Configurações do site controladas pela administração (cards das laterais, textos, aparência,
-- funcionalidades). Ficam em platform_settings com chaves "site_*", que todos já podem ler.
-- Só esta função grava (cria ou atualiza), e cada mudança entra na auditoria.
-- =============================================================================

create or replace function public.admin_set_site_config(p_key text, p_value jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._admin_guard();
  if p_key !~ '^site_[a-z_]{2,40}$' then
    raise exception 'Chave de configuração inválida.';
  end if;
  if pg_column_size(p_value) > 262144 then
    raise exception 'Configuração grande demais.';
  end if;
  if p_value is null or p_value = 'null'::jsonb then
    delete from public.platform_settings where key = p_key;
  else
    insert into public.platform_settings (key, value, updated_at) values (p_key, p_value, now())
    on conflict (key) do update set value = excluded.value, updated_at = now();
  end if;
  perform public._admin_log('site_config_alterado', 'site_config', p_key);
end;
$$;
revoke execute on function public.admin_set_site_config(text, jsonb) from public, anon;

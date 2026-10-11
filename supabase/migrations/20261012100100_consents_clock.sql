-- Consentimentos: grava o instante exato (clock_timestamp) para que duas decisões seguidas na
-- mesma transação não empatem no created_at — a última decisão é sempre a que vale.

create or replace function public.record_consent(
  p_kind text, p_version text, p_granted boolean default true
)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'É preciso estar logado.' using errcode = '42501';
  end if;
  if p_kind not in ('termos', 'saude', 'nina_acompanhamento') then
    raise exception 'Tipo de consentimento inválido.' using errcode = '22023';
  end if;
  -- Os Termos não podem ser "revogados" por aqui: quem não concorda encerra a conta.
  if p_kind = 'termos' and not p_granted then
    raise exception 'Para não aceitar os Termos, exclua a conta.' using errcode = '22023';
  end if;
  insert into public.consents (user_id, kind, version, granted, created_at)
  values (auth.uid(), p_kind, left(p_version, 40), p_granted, clock_timestamp());
end;
$$;
revoke execute on function public.record_consent(text, text, boolean) from public, anon;
grant execute on function public.record_consent(text, text, boolean) to authenticated;

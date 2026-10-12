-- Nina que conhece o acompanhamento (M2): com a permissão da pessoa (consentimento
-- "nina_acompanhamento", revogável), a Nina usa o plano alimentar, as metas, a água, o plano de
-- cuidado, o diário recente e as restrições da anamnese para responder. As conversas continuam
-- privadas; a nutri vinculada só vê se a permissão está ligada.

alter table public.consents drop constraint if exists consents_kind_check;
alter table public.consents add constraint consents_kind_check
  check (kind in ('termos', 'saude', 'nina_acompanhamento'));

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
  insert into public.consents (user_id, kind, version, granted)
  values (auth.uid(), p_kind, left(p_version, 40), p_granted);
end;
$$;
revoke execute on function public.record_consent(text, text, boolean) from public, anon;
grant execute on function public.record_consent(text, text, boolean) to authenticated;

/** Última decisão da pessoa sobre a Nina usar o acompanhamento (false se nunca decidiu). */
create or replace function public.nina_care_allowed(p_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((
    select c.granted from public.consents c
     where c.user_id = p_user and c.kind = 'nina_acompanhamento'
     order by c.created_at desc limit 1
  ), false)
  -- Só a própria pessoa ou o profissional com vínculo ativo pode perguntar.
  and (p_user = auth.uid() or public.has_active_link(p_user));
$$;
revoke execute on function public.nina_care_allowed(uuid) from public, anon;
grant execute on function public.nina_care_allowed(uuid) to authenticated;

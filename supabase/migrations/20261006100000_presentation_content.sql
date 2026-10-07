-- =============================================================================
-- Apresentação editável pelo painel de administração (/admin → Apresentação).
--   * presentation_docs: uma linha por idioma ('pt-BR', 'en', 'es', 'fr') e uma para o layout
--     ('layout': ordem e slides escondidos). Cada linha tem rascunho e versão publicada, em JSON.
--     Só o publicado é lido pelos visitantes; o rascunho fica restrito a administradores.
--   * presentation-photos: bucket público com as fotos da equipe (só administradores enviam).
--   * Toda gravação, rascunho ou publicação entra no admin_audit_log.
-- =============================================================================

create table public.presentation_docs (
  key text primary key check (key in ('pt-BR', 'en', 'es', 'fr', 'layout')),
  draft jsonb not null default '{}'::jsonb check (pg_column_size(draft) <= 262144),
  published jsonb not null default '{}'::jsonb check (pg_column_size(published) <= 262144),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);
alter table public.presentation_docs enable row level security;
create policy "presentation_docs: admins leem" on public.presentation_docs
  for select to authenticated using (public.is_platform_admin());

insert into public.presentation_docs (key) values ('pt-BR'), ('en'), ('es'), ('fr'), ('layout')
on conflict (key) do nothing;

-- Visitantes (inclusive sem conta) leem só a versão publicada, por esta função.
create or replace function public.presentation_published()
returns table (key text, published jsonb)
language sql stable security definer set search_path = public as $$
  select d.key, d.published from public.presentation_docs d;
$$;
grant execute on function public.presentation_published() to anon, authenticated;

create or replace function public.admin_presentation_get()
returns table (key text, draft jsonb, published jsonb, updated_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public._admin_guard();
  return query select d.key, d.draft, d.published, d.updated_at from public.presentation_docs d;
end;
$$;

create or replace function public.admin_presentation_save_draft(p_key text, p_draft jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._admin_guard();
  if p_key not in ('pt-BR', 'en', 'es', 'fr', 'layout') then
    raise exception 'Idioma ou seção desconhecida.';
  end if;
  update public.presentation_docs
     set draft = coalesce(p_draft, '{}'::jsonb), updated_at = now(), updated_by = auth.uid()
   where key = p_key;
  perform public._admin_log('apresentacao_rascunho', 'presentation', p_key);
end;
$$;

create or replace function public.admin_presentation_publish(p_key text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._admin_guard();
  if p_key not in ('pt-BR', 'en', 'es', 'fr', 'layout') then
    raise exception 'Idioma ou seção desconhecida.';
  end if;
  update public.presentation_docs
     set published = draft, updated_at = now(), updated_by = auth.uid()
   where key = p_key;
  perform public._admin_log('apresentacao_publicada', 'presentation', p_key);
end;
$$;

create or replace function public.admin_presentation_discard(p_key text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._admin_guard();
  update public.presentation_docs
     set draft = published, updated_at = now(), updated_by = auth.uid()
   where key = p_key;
  perform public._admin_log('apresentacao_rascunho_descartado', 'presentation', p_key);
end;
$$;

-- ─── Fotos da equipe ──────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('presentation-photos', 'presentation-photos', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "presentation-photos: leitura" on storage.objects
  for select to anon, authenticated using (bucket_id = 'presentation-photos');
create policy "presentation-photos: admins enviam" on storage.objects
  for insert to authenticated with check (bucket_id = 'presentation-photos' and public.is_platform_admin());
create policy "presentation-photos: admins apagam" on storage.objects
  for delete to authenticated using (bucket_id = 'presentation-photos' and public.is_platform_admin());

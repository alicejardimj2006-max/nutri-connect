-- Quem enviou um arquivo (ex.: o profissional que anexou um exame ou foto no chat)
-- também pode removê-lo, além do dono da pasta.

drop policy if exists "patient-files: remoção" on storage.objects;
create policy "patient-files: remoção" on storage.objects
  for delete to authenticated using (
    bucket_id in ('patient-files', 'diary-photos')
    and (public.storage_owner(name) = auth.uid() or owner_id = auth.uid()::text)
  );

create policy "chat-attachments: autor remove" on storage.objects
  for delete to authenticated using (
    bucket_id = 'chat-attachments' and owner_id = auth.uid()::text
  );

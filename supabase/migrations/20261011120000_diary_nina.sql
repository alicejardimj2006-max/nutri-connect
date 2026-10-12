-- Diário com foto comentada pela Nina (M7): comentário educativo (sem calorias) guardado na própria
-- entrada do diário, visível para a pessoa e para o profissional que a acompanha. Uso de IA com
-- limite diário próprio ("diary", ver a Edge Function ai-chat).

alter table public.diary_entries
  add column if not exists nina_comment text check (length(nina_comment) <= 2000),
  add column if not exists nina_commented_at timestamptz;

alter table public.ai_usage drop constraint if exists ai_usage_kind_check;
alter table public.ai_usage add constraint ai_usage_kind_check
  check (kind in ('nina', 'summary', 'moderation', 'label', 'diary'));

-- Leitor de rótulos com IA: tipo de uso próprio ("label"), com limite diário separado das perguntas
-- da Nina (o limite fica na Edge Function ai-chat).
alter table public.ai_usage drop constraint if exists ai_usage_kind_check;
alter table public.ai_usage add constraint ai_usage_kind_check
  check (kind in ('nina', 'summary', 'moderation', 'label'));

# Roadmap

## Em andamento
- [ ] Aplicar as migrations pendentes no banco: `20261003120000_legal_compliance` e `20261003130000_stripe_payments` (`npx supabase db push`)
- [ ] Criar o webhook no painel do Stripe e salvar `STRIPE_WEBHOOK_SECRET` (passos em docs/painel-clinico.md)
- [ ] Testar o fluxo de pagamento com cartão de teste e, depois, trocar para as chaves reais
- [ ] Remover do Supabase as funções antigas `mp-*` (`npx supabase functions delete <nome>`) e a tabela `professional_mp_accounts`
- [ ] Preencher os dados da empresa em `src/lib/legal.ts` (ver docs/conformidade-legal.md)

## Feito
- [x] Checkout, webhook e estorno do Stripe como Edge Functions (`stripe-checkout`, `stripe-webhook`, `stripe-refund`), já publicadas
- [x] Mercado Pago removido do app
- [x] Chave secreta do Stripe salva (integração BYOK habilitada)
- [x] Gerar nova LOVABLE_API_KEY e salvar no Supabase (rotacionada + sincronizada; gateway respondeu 200)
- [x] IA (Nina, resumo clínico e moderação) via Edge Functions `ai-chat` e `moderate-content`
- [x] Adequação à LGPD, Marco Civil e ECA Digital (docs/conformidade-legal.md)

# Roadmap

## Em andamento
- [ ] Integrar pagamento das consultas com Stripe (conta do usuário): checkout, webhook de confirmação, estorno
- [ ] Implantar funções stripe-checkout, stripe-webhook, stripe-refund no Supabase
- [ ] Configurar STRIPE_WEBHOOK_SECRET após deploy (usuário cria no painel do Stripe)
- [ ] Atualizar src/lib/clinical/payments.ts para usar Stripe em vez de Mercado Pago

## Feito
- [x] Chave secreta do Stripe salva (integração BYOK habilitada)
- [x] Gerar nova LOVABLE_API_KEY e salvar no Supabase (rotacionada + sincronizada; gateway respondeu 200)

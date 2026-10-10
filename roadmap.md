# Roadmap

## Em andamento

- [x] Criar o webhook no painel do Stripe e salvar `STRIPE_WEBHOOK_SECRET` (passos em docs/painel-clinico.md)
- [x] Testar o fluxo de pagamento com cartão de teste e, depois, trocar para as chaves reais
- [x] Remover do Supabase as funções antigas `mp-*` (`npx supabase functions delete <nome>`) e a tabela `professional_mp_accounts`
- [ ] Preencher os dados da empresa em `src/lib/legal.ts` (ver docs/conformidade-legal.md)

## Próximas funções (aprovadas em 09/10/2026, nesta ordem)

Cada item ganha o próprio commit depois de testado.

1. [ ] N1 — App instalável (PWA) + notificações (lembretes de refeição, água, consulta, desafio)
2. [ ] N2 — Água do dia (registro em um toque, com lembretes)
3. [ ] M5 — Metas com sequência gentil (sem culpa) e gráficos de progresso
4. [ ] M1 — Leitor de rótulos completo: código de barras (Open Food Facts), lupa "ALTO EM" da Anvisa, grupo NOVA, histórico e comparação
5. [ ] M7 — Diário com foto comentada pela Nina (educativo, sem calorias)
6. [ ] N7 — Modo sem números (fome, saciedade e emoção; sinais de alerta → ajuda profissional)
7. [ ] M2 — Nina que conhece o acompanhamento (plano e metas, com permissão do paciente)
8. [ ] N4 — "O que tem na geladeira?" (receitas com o que há em casa, aproveitamento integral)
9. [ ] N3 — Cardápio semanal com orçamento e lista de compras única
10. [ ] N5 — Calendário da feira (frutas e verduras da estação por região)
11. [ ] N8 — Lancheira da semana (lanche escolar, ligada aos perfis infantis)
12. [ ] M3 — Painel do profissional: relatório de adesão, paciente sem registrar há 7 dias, modelos de plano
13. [ ] N9 — Relatório "Minha evolução" (PDF mensal)
14. [ ] M4 — Verificação com e-Nutricionista para teleconsulta (Resolução CFN 760/23)
15. [ ] N12 — Descobrir a nutri ideal (questionário de compatibilidade)
16. [ ] M6 — Trilhas com certificado e revisão espaçada
17. [ ] N6 — Parceiro de jornada (dupla de apoio com check-in diário)
18. [ ] M8 — Eventos ao vivo nas comunidades ("Pergunte à nutri": perguntas antes, votação, respostas fixadas)
19. [ ] N11 — Nina por voz (falar e ouvir as respostas)
20. [ ] N10 — Loja de programas dos profissionais (Stripe; taxa igual à das assinaturas de membros, de 20% a 10% pelo nível)

## Feito
- [x] Todas as migrations foram aplicadas no banco remoto com sucesso.
- [x] Checkout, webhook e estorno do Stripe como Edge Functions (`stripe-checkout`, `stripe-webhook`, `stripe-refund`), já publicadas
- [x] Mercado Pago removido do app
- [x] Chave secreta do Stripe salva (integração BYOK habilitada)
- [x] Gerar nova LOVABLE_API_KEY e salvar no Supabase (rotacionada + sincronizada; gateway respondeu 200)
- [x] IA (Nina, resumo clínico e moderação) via Edge Functions `ai-chat` e `moderate-content`
- [x] Adequação à LGPD, Marco Civil e ECA Digital (docs/conformidade-legal.md)

# Roadmap

## Em andamento

- [x] Criar o webhook no painel do Stripe e salvar `STRIPE_WEBHOOK_SECRET` (passos em docs/painel-clinico.md)
- [x] Testar o fluxo de pagamento com cartão de teste e, depois, trocar para as chaves reais
- [x] Remover do Supabase as funções antigas `mp-*` (`npx supabase functions delete <nome>`) e a tabela `professional_mp_accounts`
- [ ] Preencher os dados da empresa em `src/lib/legal.ts` (ver docs/conformidade-legal.md)

## App Android (aprovado em 11/10/2026, antes da N9)

App nativo com Capacitor (pasta `mobile/`), ID `br.com.nutriconnect.app`, APK gerado no GitHub Actions.

1. [ ] A1 — App base: ícone, abertura, barra de status, voltar, tela sem conexão, APK de teste
2. [ ] A2 — Notificações nativas (Firebase Cloud Messaging)
3. [ ] A3 — Câmera e código de barras nativos (ML Kit)
4. [ ] A4 — Compartilhar do Android, links que abrem o app, vibração
5. [ ] A5 — Publicação no Google Play (assinatura, ficha da loja, segurança dos dados, teste fechado)

## Próximas funções (aprovadas em 09/10/2026, nesta ordem)

Cada item ganha o próprio commit depois de testado.

1. [x] N1 — App instalável (PWA) + notificações (lembretes de refeição, água, consulta, desafio)
2. [x] N2 — Água do dia (registro em um toque, com lembretes)
3. [x] M5 — Metas com sequência gentil (sem culpa) e gráficos de progresso
4. [x] M1 — Leitor de rótulos completo: código de barras (Open Food Facts), lupa "ALTO EM" da Anvisa, grupo NOVA, histórico e comparação
5. [x] M7 — Diário com foto comentada pela Nina (educativo, sem calorias)
6. [x] N7 — Modo sem números (fome, saciedade e emoção; sinais de alerta → ajuda profissional)
7. [x] M2 — Nina que conhece o acompanhamento (plano e metas, com permissão do paciente)
8. [x] N4 — "O que tem na geladeira?" (receitas com o que há em casa, aproveitamento integral)
9. [x] N3 — Cardápio semanal com orçamento e lista de compras única
10. [x] N5 — Calendário da feira (frutas e verduras da estação por região)
11. [x] N8 — Lancheira da semana (lanche escolar, ligada aos perfis infantis)
12. [x] M3 — Painel do profissional: relatório de adesão, paciente sem registrar há 7 dias, modelos de plano
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

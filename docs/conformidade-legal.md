# Conformidade legal (Brasil)

Resumo do que o site faz hoje e do que ainda depende de decisão ou revisão da empresa.
**Os textos jurídicos foram redigidos como base técnica; peça revisão a um(a) advogado(a)
especialista em LGPD/direito digital antes de divulgar o site.**

## Leis consideradas
- **LGPD** (Lei 13.709/2018): bases legais, dados sensíveis de saúde (art. 11), direitos do titular
  (art. 18), encarregado (art. 41), transferência internacional (art. 33), crianças (art. 14).
- **Marco Civil da Internet** (Lei 12.965/2014): guarda de registros de acesso por 6 meses (art. 15),
  retirada de conteúdo por notificação/ordem judicial (art. 19).
- **ECA Digital** (Lei 15.211/2025): conta só para maiores de 18 anos, perfis infantis sem rede social,
  canal de denúncia, proteção de crianças e adolescentes.
- **CDC** (Lei 8.078/1990) e **Decreto 7.962/2013**: identificação do fornecedor, informação clara,
  direito de arrependimento (art. 49), proibição de publicidade enganosa.
- **Ética profissional (CFN)**: publicidade sem promessa de resultado; verificação do registro (CRN).

## O que foi implementado
| Tema | Onde |
| --- | --- |
| Termos de Uso, Política de Privacidade, Diretrizes | `/termos`, `/privacidade`, `/diretrizes` |
| Dados da empresa e do encarregado (DPO) | `src/lib/legal.ts` (aparecem no rodapé e nas páginas) |
| Rodapé com links legais | `site-footer.tsx` (páginas públicas), tela de login/cadastro, Configurações |
| Aceite no cadastro + data de nascimento obrigatória + 18 anos | `cadastro.tsx`, `legal.ts` |
| Aceite versionado (conta nova e antiga) + consentimento de saúde | `consent-gate.tsx`, tabela `consents` |
| Revogar consentimento, baixar dados, excluir conta | Configurações → Privacidade e Conta |
| Exportação completa dos dados (acesso/portabilidade) | RPC `export_my_data()` |
| Trava de 18 anos no banco | trigger `enforce_adult_signup` em `auth.users` |
| Denunciar publicação/comentário | `report-button.tsx` |
| Fila de moderação (denúncias de pessoas e da IA) | `/admin` → aba Denúncias |
| Fale conosco funcionando (LGPD, denúncia, revisão de moderação) | `contato.tsx` → `contact_messages` |
| Removidas alegações falsas (45 mil membros, 98,4% de satisfação, equipe e CRNs inventados, telefones e endereço de exemplo) | `sobre.tsx`, `contato.tsx` |

A migration `20261003120000_legal_compliance.sql` precisa estar aplicada no banco
(`npx supabase db push`) para o aceite, a exportação e a trava de idade funcionarem.

## Pendências (precisam da empresa)
1. Preencher `COMPANY` em `src/lib/legal.ts`: razão social, CNPJ, endereço, nome do encarregado e
   um e-mail de privacidade próprio (hoje usa o e-mail de suporte).
2. Revisão jurídica dos três textos. Mudou algo relevante? Altere `LEGAL_VERSION` para pedir novo aceite.
3. Confirmar os provedores citados na Política (Supabase, Stripe, gateway de IA) e
   assinar os contratos/DPAs com eles.
4. Definir o prazo real de guarda de prontuário e de dados fiscais com o contador/jurídico.
5. Documentar um plano de resposta a incidentes (comunicação à ANPD em até 3 dias úteis) e um
   Relatório de Impacto (RIPD), recomendado por tratar dados de saúde.
6. A idade é **autodeclarada**. O ECA Digital pede mecanismos confiáveis de verificação; avaliar um
   serviço de verificação de idade se o risco de acesso por menores for relevante.
7. Stripe: confirmar o contrato e o repasse aos profissionais (a Política e os Termos já citam o Stripe).
8. Ativar no painel do Supabase: proteção contra senhas vazadas (Auth).
9. Exclusão de conta não apaga arquivos do Storage (fotos, documentos): criar rotina de limpeza.
10. O consentimento de saúde é registrado e revogável, mas as telas clínicas ainda não o exigem.

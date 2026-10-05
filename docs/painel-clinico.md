# Painel clínico e acompanhamento nutricional

Módulo que liga pacientes e profissionais verificados: agenda, consultas, prontuário,
plano alimentar, diário, metas, mensagens, exames e pagamentos pelo Stripe.

## O que existe

| Área | Rotas | Quem usa |
| --- | --- | --- |
| Diretório e agendamento | `/profissionais`, `/profissionais/:id`, `/convite/:code` | todos |
| Acompanhamento do paciente | `/acompanhamento` (início, plano, diário, metas, evolução, consultas, mensagens, exames) | pacientes |
| Painel clínico | `/painel` (visão geral, agenda, pacientes, ficha do paciente, planos, mensagens, financeiro, atendimento) | profissionais verificados |

**O que mudou fora do módulo:** login, cadastro, recuperação de senha e perfis agora usam o
**Supabase Auth**. As contas antigas, que ficavam no `localStorage`, deixaram de valer. Quem se
cadastrou antes precisa criar a conta de novo. Comunidades, feed, trilhas e desafios continuam no
`localStorage` e recebem os perfis do Supabase por `src/lib/profile-sync.ts`.

### Onde está o código

- `supabase/migrations/`: schema, RLS, RPCs (agendar, remarcar, cancelar, convites, publicar
  plano…), Storage, Realtime, base TACO (597 alimentos) e job `pg_cron`.
- `supabase/seed.sql`: contas de demonstração e histórico clínico de exemplo.
- `supabase/functions/`: Edge Functions de pagamento do Stripe (`stripe-*`).
- `src/lib/clinical/`: acesso a dados (`api`, `records`, `care`, `finance`), React Query
  (`queries`), cálculos (`calc`), PDF (`plan-pdf`) e textos (`i18n`).
- `src/components/clinical/`: componentes. `src/lib/i18n/clinical-*.ts`: textos em pt-BR, en, es
  e fr. O build falha se faltar uma chave.

### Contas de demonstração (senha `NutriDemo@2026`)

| E-mail | Papel |
| --- | --- |
| `admin@nutriconnect.com.br` | admin da plataforma (aprova CRN em `/admin`) |
| `maria.lorena@demo.nutriconnect.com.br` | nutricionista, com pacientes e plano publicado |
| `pedro.costa@demo.nutriconnect.com.br` | nutricionista |
| `helena.souza@demo.nutriconnect.com.br` | psicóloga |
| `ana.prado@demo.nutriconnect.com.br` | paciente com histórico completo |
| `carlos.eduardo@demo.nutriconnect.com.br` | paciente |
| `beatriz.lima@demo.nutriconnect.com.br` | paciente com pedido pendente |

## Rodar localmente

Pré-requisitos: Docker Desktop aberto e Node.

```bash
npx supabase start          # sobe Postgres, Auth, Storage e Realtime e aplica migrations + seed
npm run dev
```

Crie um `.env.local` (ele já está no `.gitignore`) para o app usar o Supabase local em vez do remoto:

```bash
VITE_SUPABASE_URL="http://127.0.0.1:54321"
VITE_SUPABASE_PUBLISHABLE_KEY="<PUBLISHABLE_KEY que o supabase start mostra>"
SUPABASE_URL="http://127.0.0.1:54321"
SUPABASE_PUBLISHABLE_KEY="<a mesma chave>"
```

> Com o `.env.local` presente, o app fala **só** com o banco local. Apague o arquivo para voltar
> ao Supabase do `.env`.

Outros comandos úteis:

- `npx supabase db reset`: recria o banco local do zero, com migrations e seed.
- `npx supabase functions serve --env-file <arquivo>`: roda as Edge Functions localmente.
- Os e-mails locais (confirmação e recuperação de senha) aparecem em http://127.0.0.1:54324.

## Publicar no Supabase do projeto

1. **Ligar o CLI ao projeto** (pede a senha do banco):

   ```bash
   npx supabase login
   npx supabase link --project-ref pdotnqmmtskjxysvsgxj
   ```

2. **Aplicar o schema:**

   ```bash
   npx supabase db push
   ```

   O banco do projeto já tinha tabelas criadas à mão, entre elas uma `profiles` em outro
   formato. A migration `20260929115900_legacy_profiles.sql` a renomeia para `profiles_legacy`
   sem apagar nada. A `20260930140000_backfill_profiles.sql` cria o perfil novo de cada conta que
   já existia no Auth e copia nome, CPF, telefone, nascimento e gênero da tabela antiga. Qualquer
   código que ainda leia a `profiles` antiga precisa passar a usar `profiles_legacy` ou os perfis
   novos. As outras tabelas antigas (`posts`, `coments`, `conversations`…) não foram tocadas.

   Para ter as contas de demonstração no banco remoto (útil na apresentação), rode
   `npx supabase db push --include-seed`. **Não faça isso num banco com usuários reais:** o seed
   cria contas com senha conhecida.

3. **Edge Functions e segredos:**

   ```bash
   npx supabase secrets set \
     STRIPE_SECRET_KEY=sk_... STRIPE_WEBHOOK_SECRET=whsec_... \
     APP_URL=https://<domínio-do-site>
   npx supabase functions deploy
   ```

   `stripe-webhook` é pública (a assinatura do Stripe garante a origem); `stripe-checkout` e `stripe-refund` validam o login dentro da função. As três usam `verify_jwt = false` em `supabase/config.toml`.

4. **Auth (no painel do Supabase):**
   - *Authentication → URL Configuration*: coloque o domínio do site em **Site URL** e adicione
     `https://<domínio>/**` em **Redirect URLs**.
   - *Authentication → Email Templates → Reset Password*: cole o conteúdo de
     `supabase/templates/recovery.html`. A tela de recuperação pede o código de 6 dígitos
     (`{{ .Token }}`), e o template padrão só tem o link.
   - Se a confirmação de e-mail estiver ligada, o cadastro avisa a pessoa para confirmar antes de
     entrar.

5. **Regenerar os tipos**, caso o schema mude depois:

   ```bash
   npx supabase gen types typescript --linked --schema public > src/integrations/supabase/types.ts
   ```

## Stripe (pagamento das consultas)

O pagamento cai na conta Stripe da plataforma, que repassa o valor ao profissional fora do app. A
taxa da plataforma é registrada em `payments.platform_fee_cents` e definida em
`platform_settings.platform_fee_percent` (padrão 10%).

1. No painel do Stripe (Developers → Webhooks), crie um endpoint apontando para
   `https://pdotnqmmtskjxysvsgxj.supabase.co/functions/v1/stripe-webhook` com os eventos
   `checkout.session.completed` e `charge.refunded`.
2. Copie o *Signing secret* (`whsec_...`) e salve:
   `npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`.
3. A `STRIPE_SECRET_KEY` também fica nos secrets do Supabase. Use chaves de teste (`sk_test_`)
   até validar o fluxo com o cartão `4242 4242 4242 4242`.

Regras implementadas:

- Ao agendar com um profissional que cobra acima de R$ 0, o horário fica
  reservado por 30 minutos (`payment_hold_minutes`) aguardando o pagamento. Um job `pg_cron`
  libera as reservas vencidas a cada 5 minutos.
- O webhook confirma a consulta quando o pagamento é aprovado. Se o pagamento chegar depois de o
  horário ter sido ocupado por outra pessoa, o valor é estornado.
- Estorno ao cancelar: quando o profissional cancela, o estorno é integral. Quando o paciente
  cancela, o estorno só acontece com pelo menos 24 horas de antecedência
  (`refund_min_notice_hours`).
- Pagamentos feitos fora do app (dinheiro, Pix direto) são registrados manualmente na
  consulta (Pix, dinheiro, cartão ou transferência).

## Segurança e privacidade

- Todas as tabelas têm RLS. O profissional só acessa dados de pacientes com vínculo **ativo**.
  Depois que o vínculo é encerrado, ele mantém apenas a leitura do que ele mesmo registrou (guarda
  de prontuário).
- As notas de evolução (SOAP) são visíveis só para o profissional que as escreveu.
- Fotos do diário, exames, anexos do chat e documentos de verificação de CRN ficam em buckets
  privados e são abertos por links assinados que valem 1 hora.
- A tabela `professional_mp_accounts` (tokens do Mercado Pago, antigo provedor) não é mais usada;
  não tem nenhuma policy e pode ser removida.

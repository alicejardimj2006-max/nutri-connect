# Painel clínico e acompanhamento nutricional

Módulo que liga pacientes e profissionais verificados: agenda, consultas, prontuário,
plano alimentar, diário, metas, mensagens, exames e pagamentos pelo Mercado Pago.

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
- `supabase/functions/`: Edge Functions do Mercado Pago (`mp-*`).
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

   Para ter as contas de demonstração no banco remoto (útil na apresentação), rode
   `npx supabase db push --include-seed`. **Não faça isso num banco com usuários reais:** o seed
   cria contas com senha conhecida.

3. **Edge Functions e segredos:**

   ```bash
   npx supabase secrets set \
     MP_CLIENT_ID=... MP_CLIENT_SECRET=... MP_WEBHOOK_SECRET=... \
     APP_URL=https://<domínio-do-site>
   npx supabase functions deploy
   ```

   `mp-webhook` e `mp-oauth-callback` são públicas (`verify_jwt = false` em `supabase/config.toml`).

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

## Mercado Pago (split de pagamentos)

Cada profissional conecta a própria conta Mercado Pago e recebe direto. A plataforma retém uma
taxa, definida em `platform_settings.platform_fee_percent` (padrão 10%).

1. Em https://www.mercadopago.com.br/developers/panel, crie uma aplicação do tipo
   **Pagamentos on-line → Checkout Pro**, com o modelo **marketplace / split de pagamentos**.
2. Em *Redirect URL* (OAuth), cadastre
   `https://pdotnqmmtskjxysvsgxj.supabase.co/functions/v1/mp-oauth-callback`.
3. Em *Webhooks*, cadastre a URL
   `https://pdotnqmmtskjxysvsgxj.supabase.co/functions/v1/mp-webhook`, evento **Pagamentos**. Copie
   a *assinatura secreta* para `MP_WEBHOOK_SECRET`.
4. Copie *Client ID* e *Client Secret* para `MP_CLIENT_ID` e `MP_CLIENT_SECRET`.
5. Para testar, use as **contas de teste** do painel: uma vendedora (para o profissional
   conectar) e uma compradora (para o paciente pagar). Enquanto a conta conectada for de teste, o
   checkout abre em modo sandbox.

Regras implementadas:

- Ao agendar com um profissional que tem Mercado Pago e cobra acima de R$ 0, o horário fica
  reservado por 30 minutos (`payment_hold_minutes`) aguardando o pagamento. Um job `pg_cron`
  libera as reservas vencidas a cada 5 minutos.
- O webhook confirma a consulta quando o pagamento é aprovado. Se o pagamento chegar depois de o
  horário ter sido ocupado por outra pessoa, o valor é estornado.
- Estorno ao cancelar: quando o profissional cancela, o estorno é integral. Quando o paciente
  cancela, o estorno só acontece com pelo menos 24 horas de antecedência
  (`refund_min_notice_hours`).
- Profissionais sem Mercado Pago continuam atendendo e registram o pagamento manualmente na
  consulta (Pix, dinheiro, cartão ou transferência).

## Segurança e privacidade

- Todas as tabelas têm RLS. O profissional só acessa dados de pacientes com vínculo **ativo**.
  Depois que o vínculo é encerrado, ele mantém apenas a leitura do que ele mesmo registrou (guarda
  de prontuário).
- As notas de evolução (SOAP) são visíveis só para o profissional que as escreveu.
- Fotos do diário, exames, anexos do chat e documentos de verificação de CRN ficam em buckets
  privados e são abertos por links assinados que valem 1 hora.
- Os tokens do Mercado Pago ficam em `professional_mp_accounts`, que não tem nenhuma policy.
  Só o `service_role` das Edge Functions acessa essa tabela.

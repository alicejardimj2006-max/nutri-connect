# Banco completo (rede social + tema da semana)

Complementa o [guia do painel clínico](painel-clinico.md). Depois destas migrations, o app inteiro
fica no Supabase: pessoas, relações, comunidades, feed, desafios, tema da semana, trilhas,
notificações, denúncias, contato e configurações.

## O que existe no banco

| Área | Tabelas e funções principais |
| --- | --- |
| Perfis e pesquisa | `profiles.username` (@ único), `profiles.is_private`, `search_users()`, `get_public_profile()` |
| Relações | `friendships` (usuário comum ↔ usuário comum, com aceite), `follows` (qualquer pessoa → profissional), `blocks` |
| Comunidades | `communities`, `community_members`, `create_community()`, `accept_community_professional()`, `leave_community_admin()`, `designate_community_admin_user()` |
| Feed | `posts` (público ou só amigos, agendável por profissionais), `post_reactions`, `comments`, `saved_posts`, `get_feed()` |
| Desafios | `challenges` (criados pelo profissional que administra a comunidade), `challenge_participants`, `challenge_tips` |
| Tema da semana | `weekly_themes` (prévia → ativo → encerrado, com traduções), `theme_poll_options`, `theme_poll_votes`, `search_term_stats` (anônimo), `log_search()` |
| Trilhas | `trail_profiles` (adulto e infantis), `trail_progress`, `trail_xp_daily`, `friends_weekly_ranking()` |
| Sistema | `notifications` (geradas por triggers), `reports` (3 denúncias ocultam o conteúdo), `moderation_queue()`, `contact_messages`, `user_settings` |

### Regras de relacionamento

- **Usuário comum ↔ usuário comum:** amizade. Um pede e o outro aceita.
- **Qualquer pessoa → profissional:** seguir, sem aprovação. Entre profissionais também é seguir.
- **Profissional → usuário comum:** não há; o contato é só pelo convite de acompanhamento clínico.
- **Perfil privado:** só amigos veem publicações e jornada. Os demais veem nome, @ e foto.
- **Bloquear** desfaz amizade e seguidas, e esconde a pessoa da pesquisa e do feed nos dois sentidos.

### Ciclo do tema da semana

1. **De domingo a sexta**, a busca de conteúdo chama `log_search()`. O banco guarda só o termo
   normalizado e a contagem do dia, sem saber quem buscou, e descarta termos que parecem e-mail,
   telefone ou CPF. A busca de pessoas não é registrada.
2. **No sábado às 9h** (com nova tentativa às 17h), o `pg_cron` chama a Edge Function
   `weekly-theme`. A IA (gateway do Lovable) escreve tema, descrição, pergunta e enquete em pt-BR,
   en, es e fr. Com menos de 20 buscas na semana, ela usa contexto sazonal e evita repetir os
   últimos 8 temas. Se a IA falhar, entra um tema sazonal pronto.
3. **A prévia** fica visível só para profissionais e admins. Os profissionais recebem uma
   notificação e já podem agendar posts ligados ao novo tema. Admins podem editar a prévia, mas
   não é obrigatório.
4. **No domingo às 0h05**, `activate_weekly_theme()` transforma a prévia em tema ativo. Se não
   houver prévia, o tema anterior continua valendo.

Um admin também pode gerar ou refazer a prévia na hora, chamando a função com o próprio login e
`{ "force": true }`.

## Publicar

### 1. Migrations

```bash
npx supabase db push
```

Use `npx supabase db push --include-seed` só em banco de desenvolvimento. As contas de
demonstração usam uma senha pública (está no `seed.sql`): se o seed for aplicado em um banco com
usuários reais, troque as senhas do admin e dos profissionais demo e desative as demais contas
imediatamente.

As tabelas antigas criadas à mão são tratadas automaticamente. As vazias são apagadas. As que
tiverem dados viram `<nome>_legacy` sem perder nada: é o caso da `profiles`, cujos dados são
copiados para os perfis novos.

### 2. Edge Functions e segredos

Gere um segredo para o cron (qualquer texto longo e aleatório):

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

```bash
npx supabase secrets set CRON_SECRET=<segredo-gerado> LOVABLE_API_KEY=<sua-chave-do-gateway-de-ia>
npx supabase functions deploy
```

Opcionais: `THEME_AI_MODEL` (padrão `google/gemini-2.5-flash`) e `THEME_MIN_SEARCHES` (padrão 20).

### 3. Segredos do agendamento (Vault)

No painel do Supabase, em **SQL Editor**, rode uma vez, usando o mesmo segredo do passo anterior:

```sql
select vault.create_secret('https://pdotnqmmtskjxysvsgxj.supabase.co/functions/v1', 'nutriconnect_functions_url');
select vault.create_secret('<segredo-gerado>', 'nutriconnect_cron_secret');
```

Para testar sem esperar o sábado:

```sql
select public.request_weekly_theme_generation();
```

Isso só gera a prévia se ainda não existir uma para o próximo domingo.

## Testes feitos

Tudo foi aplicado sobre uma cópia local do banco remoto: as 10 tabelas antigas, a `profiles` com
dados e uma `posts` antiga com uma linha. As 14 migrations e o seed rodaram sem erro. Também foram
verificados:

- **Pesquisa:** ignora acentos ("hélena"), tolera erro de digitação ("beatris"), aceita `@`, tem
  filtros de profissional e respeita perfis privados e bloqueios.
- **Relações e privacidade:** paciente não pede amizade a profissional, profissional não segue
  paciente, perfil privado só aparece para amigos e só profissionais agendam posts.
- **Moderação e buscas:** 3 denúncias ocultam o post e avisam o autor; a busca não registra
  e-mail nem telefone.
- **Tema da semana:** a cadeia completa funcionou (cron → Vault → `pg_net` → Edge Function →
  prévia), e a ativação de domingo também.

O caminho que usa a IA de verdade só roda com a `LOVABLE_API_KEY` configurada.

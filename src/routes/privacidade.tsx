import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalLayout, LegalList, LegalSection } from "@/components/legal-layout";
import { COMPANY } from "@/lib/legal";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — NutriConnect" },
      {
        name: "description",
        content:
          "Como o NutriConnect coleta, usa, compartilha e protege seus dados pessoais, e como exercer seus direitos pela LGPD.",
      },
    ],
  }),
  component: Privacidade,
});

function Privacidade() {
  const controller = COMPANY.legalName || COMPANY.name;
  return (
    <LegalLayout
      title="Política de Privacidade"
      intro="Esta política explica, em linguagem simples, quais dados pessoais o NutriConnect trata, para que usamos cada um, com quem compartilhamos e como você exerce os direitos previstos na Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD)."
    >
      <LegalSection id="controlador" title="1. Quem é o responsável pelos seus dados">
        <p>
          O controlador dos dados é <strong>{controller}</strong>
          {COMPANY.cnpj && <> (CNPJ {COMPANY.cnpj})</>}, operadora da plataforma NutriConnect
          {COMPANY.address && <>, com sede em {COMPANY.address}</>}.
        </p>
        <p>
          <strong>Encarregado pelo tratamento de dados (DPO):</strong>{" "}
          {COMPANY.dpoName && <>{COMPANY.dpoName} — </>}
          <a className="text-primary underline" href={`mailto:${COMPANY.dpoEmail}`}>
            {COMPANY.dpoEmail}
          </a>
          . Você também pode usar o <Link to="/contato" className="text-primary underline">Fale conosco</Link>{" "}
          escolhendo o assunto “Privacidade e dados pessoais (LGPD)”.
        </p>
      </LegalSection>

      <LegalSection id="dados" title="2. Quais dados tratamos">
        <LegalList
          items={[
            <>
              <strong>Cadastro:</strong> nome, e-mail, telefone, data de nascimento e senha (guardada
              de forma criptografada). O CPF é opcional.
            </>,
            <>
              <strong>Perfil e conteúdo:</strong> foto, biografia, objetivos, publicações,
              comentários, reações, comunidades, desafios, itens salvos, amizades, seguidores e
              bloqueios.
            </>,
            <>
              <strong>Dados de saúde (sensíveis):</strong> quando você usa o acompanhamento com um(a)
              profissional — diário alimentar e fotos, metas, medidas, anamnese, planos alimentares,
              exames e documentos enviados, consultas e mensagens trocadas com o(a) profissional.
            </>,
            <>
              <strong>Pagamentos:</strong> valor, status e identificadores da transação. Os dados do
              cartão são digitados no ambiente do provedor de pagamento e não passam pelos nossos
              servidores.
            </>,
            <>
              <strong>Assistente Nina (IA):</strong> as perguntas e respostas da conversa, guardadas
              por até 90 dias.
            </>,
            <>
              <strong>Uso e segurança:</strong> termos pesquisados na plataforma (sem e-mail ou
              telefone), notificações, denúncias, registros de aceite dos Termos e, como exige o
              Marco Civil da Internet, registros de acesso (IP, data e hora), mantidos por 6 meses.
            </>,
            <>
              <strong>Profissionais:</strong> número de registro no conselho (CRN/CRM etc.),
              documentos de verificação, especialidades e dados de atendimento e recebimento.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection id="finalidades" title="3. Para que usamos e em quais bases legais">
        <LegalList
          items={[
            <>
              <strong>Criar e manter sua conta, entregar a rede social</strong> (publicar, comentar,
              participar de comunidades e desafios) — execução do contrato (art. 7º, V).
            </>,
            <>
              <strong>Acompanhamento nutricional com profissional</strong> e agendamento de
              consultas — execução do contrato e tutela da saúde, em procedimento realizado por
              profissionais de saúde (art. 7º, V, e art. 11, II, “f”).
            </>,
            <>
              <strong>Tratar seus dados de saúde</strong> na plataforma — seu consentimento
              específico e destacado (art. 11, I), que você pode revogar a qualquer momento em
              Configurações → Privacidade.
            </>,
            <>
              <strong>Pagamentos e estornos</strong> — execução do contrato e cumprimento de
              obrigação legal e fiscal.
            </>,
            <>
              <strong>Moderação e segurança</strong> (detectar spam, golpes, desinformação perigosa,
              assédio, fraudes e abusos) — legítimo interesse (art. 7º, IX) e cumprimento de
              obrigação legal.
            </>,
            <>
              <strong>Responder pedidos, dúvidas e denúncias</strong> — execução do contrato e
              cumprimento de obrigação legal.
            </>,
            <>
              <strong>Registros de acesso</strong> — obrigação legal (Marco Civil da Internet, art.
              15).
            </>,
          ]}
        />
        <p>
          Não vendemos seus dados, não os usamos para publicidade direcionada e não fazemos
          decisões que produzam efeitos relevantes sobre você apenas por IA sem possibilidade de
          revisão humana (veja o item 6).
        </p>
      </LegalSection>

      <LegalSection id="saude" title="4. Dados de saúde">
        <p>
          Dados de saúde são dados pessoais sensíveis. Só os tratamos para prestar o acompanhamento
          que você pediu, e eles ficam visíveis apenas para você e para o(a) profissional com quem
          você tem um vínculo ativo. Ao encerrar o vínculo, o acesso do(a) profissional ao seu
          histórico é interrompido, observados os prazos de guarda do prontuário previstos nas
          normas do conselho profissional.
        </p>
        <p>
          Você pode revogar o consentimento para dados de saúde em Configurações → Privacidade. A
          revogação não afeta o que foi tratado antes dela, e algumas funções do acompanhamento
          podem deixar de estar disponíveis.
        </p>
      </LegalSection>

      <LegalSection id="compartilhamento" title="5. Com quem compartilhamos">
        <LegalList
          items={[
            <>
              <strong>Outras pessoas na plataforma</strong>, conforme suas configurações de
              privacidade (perfil público, amigos ou privado).
            </>,
            <>
              <strong>Profissionais vinculados a você</strong>, para o acompanhamento.
            </>,
            <>
              <strong>Operadores que nos prestam serviço:</strong> hospedagem, banco de dados e
              armazenamento de arquivos (Supabase); hospedagem do site; provedores de pagamento
              (Stripe); e provedor de inteligência artificial (gateway Lovable
              AI, que roda modelos do Google Gemini).
            </>,
            <>
              <strong>Autoridades</strong>, quando houver ordem judicial ou obrigação legal.
            </>,
          ]}
        />
        <p>
          Ao usar a IA, enviamos apenas o texto necessário: sua pergunta e o histórico recente da
          conversa com a Nina; o texto de publicações e comentários e as imagens públicas (fotos de posts, de perfil e capas de comunidades) para moderação — as fotos privadas do diário, os exames e os anexos do chat <strong>nunca</strong> são enviados à IA; e, no resumo
          clínico, os registros do paciente <strong>sem nome, e-mail ou telefone</strong>; nas ferramentas de rascunho do(a) profissional, o texto das anotações que ele(a) cola e as últimas mensagens do chat com o paciente (o texto pode conter dados que as próprias pessoas escreveram). Os rascunhos da IA só são salvos ou enviados depois da revisão do(a) profissional. Evite
          colocar dados pessoais de terceiros nas suas perguntas à Nina.
        </p>
      </LegalSection>

      <LegalSection id="ia" title="6. IA, moderação automática e revisão humana">
        <p>
          Usamos IA para (a) responder dúvidas de alimentação na Nina, (b) ajudar profissionais a
          resumir registros de pacientes e (c) sinalizar publicações e comentários suspeitos. A IA
          não prescreve dietas nem toma decisões clínicas.
        </p>
        <p>
          Quando a moderação automática oculta um conteúdo, você é avisado(a) e a decisão fica
          disponível para <strong>revisão por uma pessoa</strong> da equipe. Para pedir revisão,
          use o <Link to="/contato" className="text-primary underline">Fale conosco</Link> (art. 20 da
          LGPD).
        </p>
      </LegalSection>

      <LegalSection id="internacional" title="7. Transferência internacional">
        <p>
          Nossos provedores podem armazenar e processar dados fora do Brasil (por exemplo, o banco
          de dados está em data center no Canadá e o provedor de IA pode processar dados em outros
          países). Essas transferências ocorrem para prestadores com medidas de segurança adequadas e
          cláusulas contratuais que exigem proteção compatível com a LGPD (art. 33).
        </p>
      </LegalSection>

      <LegalSection id="retencao" title="8. Por quanto tempo guardamos">
        <LegalList
          items={[
            "Conta e conteúdo: enquanto a conta existir. Ao excluir a conta, apagamos seus dados pessoais, salvo o que a lei nos obriga a manter.",
            "Conversas com a Nina: 90 dias (você pode apagá-las antes).",
            "Registros de acesso: 6 meses (Marco Civil da Internet).",
            "Dados de pagamento e fiscais: pelo prazo exigido pela legislação tributária e contábil.",
            "Prontuário e registros clínicos feitos por profissionais: pelos prazos das normas do respectivo conselho profissional.",
          ]}
        />
      </LegalSection>

      <LegalSection id="direitos" title="9. Seus direitos">
        <p>Pela LGPD (art. 18) você pode, a qualquer momento:</p>
        <LegalList
          items={[
            "confirmar que tratamos seus dados e acessá-los;",
            "corrigir dados incompletos, inexatos ou desatualizados;",
            "pedir anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desacordo com a lei;",
            "pedir a portabilidade dos seus dados;",
            "pedir a eliminação dos dados tratados com base no seu consentimento;",
            "saber com quem compartilhamos seus dados;",
            "ser informado(a) sobre a possibilidade de não consentir e suas consequências;",
            "revogar consentimentos e pedir revisão de decisões automatizadas.",
          ]}
        />
        <p>
          Você exerce a maior parte desses direitos sozinho(a), em{" "}
          <Link to="/perfil/configuracoes/privacidade" className="text-primary underline">
            Configurações → Privacidade
          </Link>
          : baixar uma cópia dos seus dados (arquivo JSON), revogar o consentimento de saúde e
          excluir a conta. Para os demais pedidos, escreva ao encarregado (item 1). Respondemos em
          até 15 dias.
        </p>
        <p>
          Se não ficar satisfeito(a), você pode reclamar à Autoridade Nacional de Proteção de Dados
          (ANPD) em <span className="font-medium">gov.br/anpd</span>.
        </p>
      </LegalSection>

      <LegalSection id="menores" title="10. Crianças e adolescentes">
        <p>
          A conta no NutriConnect é só para maiores de 18 anos: pedimos a data de nascimento no
          cadastro e não permitimos contas de menores. Responsáveis podem criar{" "}
          <strong>perfis infantis</strong> na trilha de aprendizado de alimentação. Esses perfis
          usam a conta do responsável, <strong>não têm rede social, mensagens nem perfil público</strong>{" "}
          e guardam apenas nome do perfil, avatar e progresso no próprio navegador do dispositivo — não
          enviamos esses dados aos nossos servidores. Se você identificar uma conta de menor de
          idade, avise-nos pelo Fale conosco para que ela seja removida.
        </p>
      </LegalSection>

      <LegalSection id="seguranca" title="11. Segurança">
        <p>
          Usamos conexão criptografada (HTTPS), controle de acesso por usuário no banco de dados
          (cada pessoa só enxerga o que lhe pertence ou foi compartilhado), arquivos de saúde em
          áreas privadas. Nenhum sistema é totalmente imune; em
          caso de incidente com risco relevante, comunicaremos você e a ANPD, como determina a LGPD.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="12. Cookies e armazenamento no navegador">
        <p>
          Usamos apenas armazenamento <strong>essencial</strong> no seu navegador: manter você
          conectado(a), lembrar idioma e aparência, guardar o progresso da trilha e perfis
          infantis. Não usamos cookies de publicidade, rastreamento nem ferramentas de análise de
          terceiros. As fontes de texto são carregadas do Google Fonts, o que expõe seu endereço IP
          ao Google.
        </p>
      </LegalSection>

      <LegalSection id="alteracoes" title="13. Mudanças nesta política">
        <p>
          Quando houver mudança relevante, atualizamos a data acima e pedimos que você leia e aceite
          novamente. Versões anteriores ficam disponíveis mediante solicitação ao encarregado.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalLayout, LegalList, LegalSection } from "@/components/legal-layout";

export const Route = createFileRoute("/diretrizes")({
  head: () => ({
    meta: [
      { title: "Diretrizes da Comunidade — NutriConnect" },
      {
        name: "description",
        content:
          "As regras de convivência do NutriConnect, como denunciar e como funciona a moderação de conteúdo.",
      },
    ],
  }),
  component: Diretrizes,
});

function Diretrizes() {
  return (
    <LegalLayout
      title="Diretrizes da Comunidade"
      intro="O NutriConnect é um espaço acolhedor para falar de comida sem culpa nem julgamento. Estas regras valem para publicações, comentários, comunidades, mensagens e perfis."
    >
      <LegalSection id="respeito" title="1. Respeito acima de tudo">
        <LegalList
          items={[
            "Não ofenda, humilhe, ameace nem assedie ninguém. Críticas educadas são bem-vindas.",
            "Sem discriminação por corpo, peso, raça, gênero, orientação sexual, religião, deficiência ou origem. Comentários sobre o corpo de outras pessoas não são permitidos.",
            "Não exponha dados pessoais, fotos ou informações de saúde de outras pessoas.",
          ]}
        />
      </LegalSection>

      <LegalSection id="saude" title="2. Saúde e alimentação com responsabilidade">
        <LegalList
          items={[
            "Não divulgue curas milagrosas, “detox” que prometem tratar doenças nem dietas com resultado garantido.",
            "Não incentive jejuns extremos, purgação, uso de laxantes ou diuréticos para emagrecer, nem qualquer comportamento de transtorno alimentar.",
            "Não aconselhe ninguém a abandonar tratamento, medicamento ou acompanhamento médico.",
            "Relatos pessoais são bem-vindos, mas deixe claro que são a sua experiência e não uma recomendação para todos.",
            "Se você ou alguém que conhece está sofrendo, procure ajuda: CVV 188 (24 h) ou, em emergência, SAMU 192.",
          ]}
        />
      </LegalSection>

      <LegalSection id="golpes" title="3. Sem spam, golpes ou venda enganosa">
        <LegalList
          items={[
            "Não faça propaganda disfarçada, correntes, venda de suplementos ou produtos sem identificação clara de que é publicidade.",
            "Profissionais devem seguir o código de ética do seu conselho: sem promessa de resultado, sem “antes e depois” sensacionalista e sem exposição de pacientes.",
            "Não se passe por outra pessoa nem use registro profissional que não é seu.",
          ]}
        />
      </LegalSection>

      <LegalSection id="criancas" title="4. Proteção de crianças e adolescentes">
        <p>
          A plataforma é para maiores de 18 anos. Conteúdo sexual, violento ou que explore, exponha
          ou coloque em risco crianças e adolescentes é proibido e será removido imediatamente, com
          comunicação às autoridades quando necessário.
        </p>
        <p>
          Se você encontrar conteúdo desse tipo, denuncie na plataforma e também ao{" "}
          <strong>Disque 100</strong> ou à <strong>SaferNet</strong> (denuncia.saferNet.org.br).
        </p>
      </LegalSection>

      <LegalSection id="denunciar" title="5. Como denunciar">
        <p>
          Use o botão de denúncia no conteúdo ou no perfil, escolha o motivo e, se quiser, explique.
          Também é possível escrever pelo{" "}
          <Link to="/contato" className="text-primary underline">
            Fale conosco
          </Link>{" "}
          (assunto “Denúncia de conteúdo”), indicando o link do material. Denúncias podem ser feitas
          por qualquer pessoa logada, e quem denuncia não é identificado(a) ao autor.
        </p>
      </LegalSection>

      <LegalSection id="moderacao" title="6. Como moderamos">
        <LegalList
          items={[
            "Toda publicação e todo comentário passam por uma análise de inteligência artificial ANTES de ir ao ar. Os posts precisam tratar de alimentação, nutrição, saúde e bem-estar, e a foto precisa ter relação com o tema e combinar com o título e a descrição. O que fugir disso, ou for spam, ofensivo ou impróprio, não é publicado (nada fica salvo) e você vê o motivo na hora para poder ajustar.",
            "Conteúdos denunciados por várias pessoas são ocultados temporariamente até a análise.",
            "A foto de perfil, a capa e a página personalizada do seu perfil também passam pela análise antes de serem salvas. Ali o assunto é livre, mas valem as mesmas regras: sem spam, golpes, ofensas, conteúdo impróprio ou dados pessoais de outras pessoas.",
            "A equipe decide se o conteúdo volta ou é removido. O autor é avisado e pode pedir revisão por uma pessoa pelo Fale conosco.",
            "Em caso de violações graves ou repetidas, podemos advertir, suspender ou encerrar a conta. Decisões judiciais são cumpridas.",
          ]}
        />
      </LegalSection>

      <LegalSection id="mais" title="7. Mais informações">
        <p>
          Veja também os{" "}
          <Link to="/termos" className="text-primary underline">
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link to="/privacidade" className="text-primary underline">
            Política de Privacidade
          </Link>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

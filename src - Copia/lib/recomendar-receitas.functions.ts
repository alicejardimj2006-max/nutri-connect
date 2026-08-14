import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const InputSchema = z.object({
  objetivo: z.string().min(1),
  cid: z.string(),
  condicoesMedicas: z.string(),
  estadoPsicologico: z.string(),
  restricoes: z.string(),
  preferencias: z.string(),
  observacoes: z.string(),
});

const ReceitaSchema = z.object({
  receitas: z.array(
    z.object({
      nome: z.string(),
      refeicao: z.string(),
      descricao: z.string(),
      beneficios: z.string(),
      ingredientes: z.array(z.string()),
      modoPreparo: z.array(z.string()),
      tempoPreparo: z.string(),
      porcoes: z.string(),
      calorias: z.string(),
    }),
  ),
  analise: z.string(),
  recomendacoesGerais: z.array(z.string()),
});

export type RecomendacaoReceitas = z.infer<typeof ReceitaSchema>;

export const recomendarReceitas = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const prompt = `Você é uma nutricionista clínica especializada em nutrição comportamental e conhecedora da Classificação Internacional de Doenças (CID-10/CID-11). Com base no(s) código(s) CID informado(s), na análise médica e no estado psicológico do paciente abaixo, elabore uma análise nutricional integrada e recomende 5 receitas específicas, saudáveis e adequadas ao caso.

DADOS DO PACIENTE:
- Objetivo: ${data.objetivo}
- Código(s) CID: ${data.cid || "não informado"}
- Condições médicas / análise clínica: ${data.condicoesMedicas || "não informado"}
- Estado psicológico / emocional: ${data.estadoPsicologico || "não informado"}
- Restrições alimentares e alergias: ${data.restricoes || "nenhuma"}
- Preferências alimentares: ${data.preferencias || "nenhuma"}
- Observações adicionais: ${data.observacoes || "nenhuma"}

Instruções:
1. Interprete o(s) código(s) CID informado(s): explique brevemente o diagnóstico associado e as implicações nutricionais relevantes.
2. Faça uma análise breve (2-4 parágrafos) considerando o quadro clínico (CID + análise médica) e emocional, e como a alimentação pode ajudar.
3. Sugira 5 receitas específicas, distribuídas entre refeições (café da manhã, lanche, almoço, jantar, ceia), adequadas ao(s) CID(s) informado(s).
4. Para cada receita: nome, refeição, descrição curta, benefícios (relacionados diretamente ao quadro/CID do paciente), lista de ingredientes com quantidades, modo de preparo passo a passo, tempo de preparo, porções e calorias aproximadas por porção.
5. Ao final, dê 4-6 recomendações gerais alinhadas ao(s) CID(s).
Responda em português do Brasil.`;

    try {
      const { output } = await generateText({
        model,
        output: Output.object({ schema: ReceitaSchema }),
        prompt,
      });
      return output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        throw new Error("Não foi possível gerar as recomendações. Tente novamente.");
      }
      throw error;
    }
  });

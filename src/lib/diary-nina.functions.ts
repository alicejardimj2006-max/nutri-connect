// Diário com foto comentada pela Nina (M7): a Nina olha a foto da refeição e comenta de forma
// educativa, sem calorias, sem julgamento e sem prescrever dieta. O comentário fica na entrada do
// diário (o profissional que acompanha também vê). Limite diário próprio ("diary").
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const DIARY_DAILY_LIMIT = 8;

const LANGUAGE: Record<string, string> = {
  "pt-BR": "português do Brasil",
  en: "English",
  es: "español",
  fr: "français",
};

const MEALS: Record<string, string> = {
  cafe_da_manha: "café da manhã",
  lanche_da_manha: "lanche da manhã",
  almoco: "almoço",
  lanche_da_tarde: "lanche da tarde",
  jantar: "jantar",
  ceia: "ceia",
  outro: "refeição",
};

const system = (lang: string) => `Você é a Nina, assistente de educação alimentar do NutriConnect.
A pessoa registrou no diário a foto de uma refeição e quer um olhar educativo sobre ela.
Regras firmes:
- NUNCA fale de calorias, peso, "engordar", "emagrecer", porções em gramas ou números de nutrientes.
- Sem julgamento ("certo/errado", "saudável/não saudável", "proibido", "besteira"). Sem culpa.
- Não prescreva dieta nem dê conselho médico.
- Baseie-se no Guia Alimentar para a População Brasileira: valorize comida de verdade, variedade
  de cores e grupos (cereais, feijões, legumes, verduras, frutas, carnes/ovos, leite), preparo
  caseiro e o contexto da refeição (comer com calma, em companhia).
Responda em ${lang}, em até 90 palavras, em tom acolhedor, neste formato:
**O que eu vi** — uma frase descrevendo o prato.
**Destaques** — 1 ou 2 itens com "•" sobre o que a refeição tem de bom.
**Ideia para a próxima** — uma sugestão gentil e opcional (por exemplo, incluir uma cor ou textura).
Se a foto não mostrar comida, diga isso com leveza em uma frase.
Se a descrição sugerir sofrimento com a comida (culpa intensa, compulsão, restrição severa,
vômitos), acolha e sugira conversar com um(a) nutricionista ou psicólogo(a).`;

const schema = z.object({
  entryId: z.string().uuid(),
  locale: z.enum(["pt-BR", "en", "es", "fr"]).default("pt-BR"),
});

export type DiaryNinaError = "limit" | "unavailable" | "photo" | "failed";
export type DiaryNinaReply =
  { comment: string; used: number } | { error: DiaryNinaError; used?: number };

/** Bytes → base64 sem depender de Buffer (o servidor pode rodar fora do Node). */
function toBase64(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

export const commentDiaryPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }): Promise<DiaryNinaReply> => {
    const supabase = context.supabase;
    // Só a dona do diário pede o comentário (o RLS também protege a leitura).
    const { data: entry } = await supabase
      .from("diary_entries")
      .select("id, patient_id, meal_type, description, photo_path, mood")
      .eq("id", data.entryId)
      .maybeSingle();
    if (!entry || entry.patient_id !== context.userId || !entry.photo_path)
      return { error: "photo" };

    const { data: blob, error: dlError } = await supabase.storage
      .from("diary-photos")
      .download(entry.photo_path);
    if (dlError || !blob) return { error: "photo" };
    const type = blob.type && /^image\/(jpeg|png|webp)$/.test(blob.type) ? blob.type : "image/jpeg";
    const bytes = new Uint8Array(await blob.arrayBuffer());
    if (bytes.length > 2_900_000) return { error: "photo" };
    const image = `data:${type};base64,${toBase64(bytes)}`;

    const { aiChat } = await import("./ai-gateway.server");
    const prompt = [
      `Refeição: ${MEALS[entry.meal_type] ?? "refeição"}.`,
      entry.description ? `O que a pessoa escreveu: "${entry.description.slice(0, 500)}"` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const result = await aiChat({
      kind: "diary",
      system: system(LANGUAGE[data.locale]),
      messages: [{ role: "user", content: `${prompt}\nComente a foto, por favor.` }],
      image,
      temperature: 0.4,
    });
    const { data: used } = await supabase.rpc("ai_usage_today", { p_kind: "diary" });
    if (!result.ok) {
      const error: DiaryNinaError = result.limit
        ? "limit"
        : [400, 402, 403, 503].includes(result.status)
          ? "unavailable"
          : "failed";
      return { error, used: used ?? undefined };
    }
    const comment = result.text.trim().slice(0, 2000);
    const { error: saveError } = await supabase
      .from("diary_entries")
      .update({ nina_comment: comment, nina_commented_at: new Date().toISOString() })
      .eq("id", entry.id);
    if (saveError) console.error("diary nina", saveError.message);
    return { comment, used: used ?? 0 };
  });

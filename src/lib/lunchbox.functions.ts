// Lancheira da semana (N8): a Nina sugere lanches escolares de segunda a sexta para uma criança,
// respeitando idade, alergias, o que ela não gosta, regras da escola e as avaliações dela.
// Limite diário próprio ("lunchbox").
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { errorOf, LANGUAGE, parseJson, strList, type FridgeError } from "@/lib/fridge.functions";
import { AGE_RANGES, allergensIn } from "@/lib/lunchbox-ideas";

export const LUNCHBOX_DAILY_LIMIT = 8;

export const SNACK_SLOTS = ["manha", "tarde"] as const;
export type SnackSlot = (typeof SNACK_SLOTS)[number];

export interface LunchSnack {
  title: string;
  /** O que vai na lancheira. */
  items: string[];
  /** Preparo rápido (pode ficar vazio). */
  prep: string;
  /** Dica de conservação ou praticidade. */
  tip: string;
  /** 2 ou 3 emojis para a criança reconhecer o lanche. */
  emojis: string;
  source: "nina" | "ideia" | "manual";
  /** Avaliação da criança. */
  rating?: "gostei" | "nao_gostei";
}

export type LunchboxError = FridgeError;

const DAYS_PT = ["segunda", "terça", "quarta", "quinta", "sexta"];
const text = (max: number) => z.string().trim().max(max).default("");
const shortList = (max: number) => z.array(z.string().trim().min(1).max(120)).max(max).default([]);

const schema = z.object({
  slots: z
    .array(z.object({ day: z.number().int().min(0).max(4), slot: z.enum(SNACK_SLOTS) }))
    .min(1)
    .max(10),
  snacksPerDay: z.union([z.literal(1), z.literal(2)]),
  age: z.enum(AGE_RANGES),
  allergies: text(300),
  dislikes: text(300),
  schoolRules: text(300),
  liked: shortList(10),
  disliked: shortList(10),
  keep: shortList(10),
  season: shortList(40),
  wish: text(200),
  locale: z.enum(["pt-BR", "en", "es", "fr"]).default("pt-BR"),
});

export type LunchboxReply =
  | { snacks: { day: number; slot: SnackSlot; snack: LunchSnack }[]; used: number }
  | { error: LunchboxError; used?: number };

export const suggestLunchbox = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }): Promise<LunchboxReply> => {
    const { aiChat } = await import("./ai-gateway.server");
    const slotName = (s: SnackSlot) =>
      data.snacksPerDay === 1 ? "recreio" : s === "manha" ? "lanche da manhã" : "lanche da tarde";
    const slots = data.slots.map((s) => `${DAYS_PT[s.day]} ${slotName(s.slot)}`);
    const small = data.age === "1-3";

    const system = `Você é a Nina, assistente de educação alimentar do NutriConnect, montando a
lancheira escolar de uma criança de ${data.age} anos, no espírito do Guia Alimentar para a
População Brasileira e do PNAE.
Regras:
- Comida de verdade. Nada de ultraprocessados: refrigerante, suco de caixinha, achocolatado
  pronto, biscoito recheado, salgadinho de pacote, embutidos (salsicha, presunto, nuggets).
- Sempre uma fruta; água para beber. ${small ? "Sem açúcar nem mel para menores de 2 anos." : "Pouco ou nenhum açúcar."}
- Aguenta 4 horas fora da geladeira ou vai com gelo reutilizável (diga quando precisar).
- Prático: pronto em até 15 minutos ou feito na véspera; aproveite sobras do jantar.
- Porções e texturas para a idade.${small ? " Risco de engasgo: uva e tomate-cereja cortados em 4, nada de pipoca, castanhas inteiras ou salsicha." : ""}
- Varie ao longo da semana. Sem julgamento, sem calorias, sem falar de peso.
- NUNCA inclua alimentos que a criança é alérgica, nem ingredientes proibidos pela escola.
Responda em ${LANGUAGE[data.locale]}, SOMENTE com um JSON, uma entrada por lanche pedido, na mesma
ordem:
{"snacks": [{"slot": "segunda recreio", "title": "...", "items": ["1 banana", "..."],
"prep": "...", "tip": "...", "emojis": "🍌🧀🍞"}]}
"items": no máximo 4, com a quantidade. "prep": 1 ou 2 frases. "emojis": 2 ou 3 emojis de comida.`;

    const user = [
      `Lanches para montar: ${slots.join("; ")}.`,
      data.allergies ? `ALERGIAS (nunca inclua, nem traços): ${data.allergies}.` : "",
      data.schoolRules ? `Regras da escola: ${data.schoolRules}.` : "",
      data.dislikes ? `Não gosta de: ${data.dislikes}.` : "",
      data.liked.length ? `Gostou de: ${data.liked.join("; ")}.` : "",
      data.disliked.length ? `Não gostou de: ${data.disliked.join("; ")}.` : "",
      data.keep.length ? `Já estão na semana (não repita): ${data.keep.join("; ")}.` : "",
      data.season.length ? `Frutas e legumes da estação: ${data.season.join(", ")}.` : "",
      data.wish ? `Pedido do responsável: ${data.wish}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const result = await aiChat({
      kind: "lunchbox",
      system,
      messages: [{ role: "user", content: user.slice(0, 7900) }],
      temperature: 0.8,
    });
    const { data: used } = await context.supabase.rpc("ai_usage_today", { p_kind: "lunchbox" });
    if (!result.ok) return { error: errorOf(result), used: used ?? undefined };

    // Segurança: descarta qualquer lanche que cite um alergênico da criança ou proibido pela escola.
    const avoid = new Set(allergensIn(`${data.allergies} ${data.schoolRules}`));
    const parsed = parseJson(result.text) as { snacks?: unknown } | null;
    const list = Array.isArray(parsed?.snacks) ? (parsed.snacks as Record<string, unknown>[]) : [];
    const snacks = data.slots
      .map((slot, i) => {
        const r = list[i];
        const title = typeof r?.title === "string" ? r.title.trim().slice(0, 120) : "";
        const items = strList(r?.items, 5, 120);
        if (!title || !items.length) return null;
        if (allergensIn(`${title} ${items.join(" ")}`, true).some((a) => avoid.has(a))) return null;
        const snack: LunchSnack = {
          title,
          items,
          prep: typeof r.prep === "string" ? r.prep.slice(0, 300) : "",
          tip: typeof r.tip === "string" ? r.tip.slice(0, 200) : "",
          emojis: typeof r.emojis === "string" ? [...r.emojis.trim()].slice(0, 6).join("") : "",
          source: "nina",
        };
        return { ...slot, snack };
      })
      .filter((s): s is NonNullable<typeof s> => !!s);
    if (!snacks.length) return { error: "failed", used: used ?? 0 };
    return { snacks, used: used ?? 0 };
  });

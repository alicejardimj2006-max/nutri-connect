// "O que tem na geladeira?" (N4): a Nina reconhece ingredientes numa foto e sugere 3 receitas
// com o que há em casa, com aproveitamento integral. Sem calorias. Limite diário próprio ("fridge"),
// que conta a foto e o pedido de receitas.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const FRIDGE_DAILY_LIMIT = 8;

export const LANGUAGE: Record<string, string> = {
  "pt-BR": "português do Brasil",
  en: "English",
  es: "español",
  fr: "français",
};

export interface FridgeRecipe {
  title: string;
  prepTime: string;
  servings: string;
  utensils: string[];
  /** Ingredientes com medida caseira. */
  ingredients: string[];
  /** O que falta em casa (pode ficar vazio). */
  missing: string[];
  steps: string[];
  /** Dica de aproveitamento integral (talos, cascas, sementes, sobras). */
  tip: string;
}

export type FridgeError = "limit" | "unavailable" | "image" | "failed";

const locale = z.enum(["pt-BR", "en", "es", "fr"]).default("pt-BR");

/** Pega o primeiro JSON da resposta (a IA às vezes embrulha em ```json). */
export function parseJson(text: string): unknown {
  const clean = text.replace(/```(?:json)?/gi, "").trim();
  const start = clean.search(/[[{]/);
  if (start < 0) return null;
  const end = Math.max(clean.lastIndexOf("]"), clean.lastIndexOf("}"));
  try {
    return JSON.parse(clean.slice(start, end + 1));
  } catch {
    return null;
  }
}

export const strList = (v: unknown, max: number, len: number) =>
  Array.isArray(v)
    ? v
        .filter((x): x is string => typeof x === "string" && !!x.trim())
        .map((x) => x.trim().slice(0, len))
        .slice(0, max)
    : [];

export function errorOf(result: { limit?: boolean; status: number }): FridgeError {
  if (result.limit) return "limit";
  return [400, 402, 403, 503].includes(result.status) ? "unavailable" : "failed";
}

// ---------------------------------------------------------------------------
// Foto da geladeira → ingredientes
// ---------------------------------------------------------------------------

const photoSchema = z.object({
  image: z
    .string()
    .regex(/^data:image\/(jpeg|png|webp);base64,/)
    .max(4_000_000),
  locale,
});

export type FridgePhotoReply =
  { items: string[]; used: number } | { error: FridgeError; used?: number };

export const readFridgePhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => photoSchema.parse(data))
  .handler(async ({ data, context }): Promise<FridgePhotoReply> => {
    const { aiChat } = await import("./ai-gateway.server");
    const result = await aiChat({
      kind: "fridge",
      system: `Você identifica alimentos em fotos de geladeira, despensa ou bancada.
Liste só os alimentos que dá para ver com segurança, em ${LANGUAGE[data.locale]}, no singular e
com nomes simples do dia a dia (ex.: "ovo", "tomate", "cenoura", "arroz cozido", "iogurte natural").
Não invente o que não aparece. Ignore embalagens que não dá para identificar.
Responda SOMENTE com um JSON: {"items": ["...", "..."]} (no máximo 30 itens).
Se a foto não mostrar comida, responda {"items": []}.`,
      messages: [{ role: "user", content: "Quais alimentos aparecem nesta foto?" }],
      image: data.image,
      temperature: 0.2,
    });
    const { data: used } = await context.supabase.rpc("ai_usage_today", { p_kind: "fridge" });
    if (!result.ok) {
      const badImage = result.status === 400 && /imagem/i.test(result.message ?? "");
      return { error: badImage ? "image" : errorOf(result), used: used ?? undefined };
    }
    const parsed = parseJson(result.text) as { items?: unknown } | null;
    return { items: strList(parsed?.items, 30, 40), used: used ?? 0 };
  });

// ---------------------------------------------------------------------------
// Ingredientes → 3 receitas
// ---------------------------------------------------------------------------

const recipesSchema = z.object({
  ingredients: z.array(z.string().trim().min(1).max(40)).min(1).max(30),
  locale,
});

export type FridgeRecipesReply =
  { recipes: FridgeRecipe[]; used: number } | { error: FridgeError; used?: number };

export const suggestFridgeRecipes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => recipesSchema.parse(data))
  .handler(async ({ data, context }): Promise<FridgeRecipesReply> => {
    const { aiChat } = await import("./ai-gateway.server");
    const { buildRestrictions } = await import("./nina-care-context.server");
    const restrictions = await buildRestrictions(context.supabase, context.userId).catch(
      () => null,
    );

    const system = `Você é a Nina, assistente de educação alimentar do NutriConnect.
A pessoa disse o que tem em casa. Sugira 3 receitas caseiras, simples e baratas, que usem
PRINCIPALMENTE esses ingredientes (pode supor que há sal, água e óleo). Prefira comida de verdade,
no espírito do Guia Alimentar para a População Brasileira. Ordene da que usa só o que a pessoa tem
para a que precisaria de mais coisas; no máximo 3 itens faltando por receita.
Regras: nunca cite calorias, gramas de nutrientes, peso ou "emagrecer"; sem julgamento; use
medidas caseiras ("1 xícara", "2 colheres de sopa"). Cada receita traz uma dica de
aproveitamento integral (talos, cascas, sementes, sobras) ou de conservação.
${restrictions ? `\n${restrictions}\n` : ""}
Responda em ${LANGUAGE[data.locale]}, SOMENTE com um JSON neste formato:
{"recipes": [{"title": "...", "prepTime": "20 min", "servings": "2 porções",
"utensils": ["frigideira"], "ingredients": ["2 ovos", "1 tomate picado"],
"missing": ["alho"], "steps": ["...", "..."], "tip": "..."}]}`;

    const result = await aiChat({
      kind: "fridge",
      system,
      messages: [{ role: "user", content: `Tenho em casa: ${data.ingredients.join(", ")}.` }],
      temperature: 0.7,
    });
    const { data: used } = await context.supabase.rpc("ai_usage_today", { p_kind: "fridge" });
    if (!result.ok) return { error: errorOf(result), used: used ?? undefined };

    const parsed = parseJson(result.text) as { recipes?: unknown } | null;
    const recipes = (Array.isArray(parsed?.recipes) ? parsed.recipes : [])
      .slice(0, 3)
      .map((r: Record<string, unknown>): FridgeRecipe | null => {
        const title = typeof r?.title === "string" ? r.title.trim().slice(0, 120) : "";
        const steps = strList(r?.steps, 12, 400);
        if (!title || !steps.length) return null;
        return {
          title,
          prepTime: typeof r.prepTime === "string" ? r.prepTime.slice(0, 30) : "",
          servings: typeof r.servings === "string" ? r.servings.slice(0, 30) : "",
          utensils: strList(r.utensils, 8, 40),
          ingredients: strList(r.ingredients, 20, 80),
          missing: strList(r.missing, 3, 40),
          steps,
          tip: typeof r.tip === "string" ? r.tip.slice(0, 300) : "",
        };
      })
      .filter((r): r is FridgeRecipe => !!r);
    if (!recipes.length) return { error: "failed", used: used ?? 0 };
    return { recipes, used: used ?? 0 };
  });

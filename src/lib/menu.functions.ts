// Cardápio da semana (N3): a Nina monta almoço e jantar dentro de uma faixa de orçamento (ou só as
// refeições pedidas, para trocar uma) e junta os ingredientes da semana numa lista de compras
// agrupada por seção. Sem calorias. Limite diário próprio ("menu").
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { errorOf, LANGUAGE, parseJson, strList, type FridgeError } from "@/lib/fridge.functions";

export const MENU_DAILY_LIMIT = 10;

export const MEALS = ["almoco", "jantar"] as const;
export type MealKey = (typeof MEALS)[number];
export const BUDGETS = ["economico", "moderado", "livre"] as const;
export type Budget = (typeof BUDGETS)[number];
export const SECTIONS = [
  "hortifruti",
  "acougue",
  "laticinios",
  "padaria",
  "mercearia",
  "outros",
] as const;
export type Section = (typeof SECTIONS)[number];

export interface MenuMeal {
  title: string;
  prepTime: string;
  servings: string;
  ingredients: string[];
  steps: string[];
  tip: string;
  /** Quem preencheu: a Nina, uma receita guardada ou a própria pessoa. */
  source: "nina" | "minhas" | "manual";
}

export type MenuError = FridgeError;

const DAYS_PT = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"];
const MEAL_PT: Record<MealKey, string> = { almoco: "almoço", jantar: "jantar" };
const BUDGET_PT: Record<Budget, string> = {
  economico:
    "ECONÔMICO: ingredientes baratos (arroz, feijão, ovos, legumes e frutas da estação, frango, sardinha), reaproveitando sobras de um dia no outro",
  moderado: "MODERADO: comida do dia a dia, sem ingredientes caros ou importados",
  livre: "SEM LIMITE: pode variar mais nos ingredientes, ainda com comida de verdade",
};

const locale = z.enum(["pt-BR", "en", "es", "fr"]).default("pt-BR");
const shortList = (max: number) => z.array(z.string().trim().min(1).max(80)).max(max).default([]);

// ---------------------------------------------------------------------------
// Refeições da semana
// ---------------------------------------------------------------------------

const menuSchema = z.object({
  slots: z
    .array(z.object({ day: z.number().int().min(0).max(6), meal: z.enum(MEALS) }))
    .min(1)
    .max(14),
  budget: z.enum(BUDGETS),
  /** Pedido livre ("sem carne na segunda", "marmita para o trabalho"). */
  wish: z.string().trim().max(200).default(""),
  /** O que já tem em casa (Geladeira). */
  have: shortList(30),
  /** Pratos que já estão na semana (para não repetir). */
  keep: shortList(14),
  /** Frutas, legumes e verduras da estação na região (Calendário da feira). */
  season: shortList(40),
  locale,
});

export type MenuReply =
  | { meals: { day: number; meal: MealKey; recipe: MenuMeal }[]; used: number }
  | { error: MenuError; used?: number };

export const suggestMenu = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => menuSchema.parse(data))
  .handler(async ({ data, context }): Promise<MenuReply> => {
    const { aiChat } = await import("./ai-gateway.server");
    const { buildMenuContext } = await import("./nina-care-context.server");
    const care = await buildMenuContext(context.supabase, context.userId).catch(() => null);

    const slots = data.slots.map((s) => `${DAYS_PT[s.day]} ${MEAL_PT[s.meal]}`);
    const system = `Você é a Nina, assistente de educação alimentar do NutriConnect.
Monte refeições caseiras para o cardápio da semana de uma pessoa, no espírito do Guia Alimentar
para a População Brasileira: comida de verdade, prato colorido, arroz e feijão bem-vindos.
Orçamento: ${BUDGET_PT[data.budget]}.
Regras: nunca cite calorias, gramas de nutrientes, peso ou "emagrecer"; sem julgamento; medidas
caseiras ("1 xícara", "2 colheres de sopa"); varie as proteínas e os legumes ao longo da semana;
aproveite o que a pessoa já tem em casa e as sobras (o jantar pode virar a marmita do dia
seguinte); receitas simples, de até 45 minutos. Cada refeição traz uma dica curta de
aproveitamento integral, preparo antecipado ou conservação.
Se houver um plano alimentar da nutri, siga as refeições e substituições dele e nunca o
contradiga; respeite sempre as restrições.
Responda em ${LANGUAGE[data.locale]}, SOMENTE com um JSON neste formato, uma entrada por refeição
pedida, na mesma ordem:
{"meals": [{"slot": "segunda almoço", "title": "...", "prepTime": "30 min",
"servings": "2 porções", "ingredients": ["1 xícara de arroz"], "steps": ["...", "..."],
"tip": "..."}]}
No máximo 10 ingredientes e 6 passos curtos por refeição.`;

    const user = [
      `Refeições para montar: ${slots.join("; ")}.`,
      data.have.length ? `Tenho em casa: ${data.have.join(", ")}.` : "",
      data.keep.length ? `Já estão na semana (não repita): ${data.keep.join("; ")}.` : "",
      data.season.length
        ? `Da estação na minha região (prefira, são mais baratos e saborosos): ${data.season.join(", ")}.`
        : "",
      data.wish ? `Meu pedido: ${data.wish}` : "",
      care ? `\n${care}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const result = await aiChat({
      kind: "menu",
      system,
      messages: [{ role: "user", content: user.slice(0, 7900) }],
      temperature: 0.8,
    });
    const { data: used } = await context.supabase.rpc("ai_usage_today", { p_kind: "menu" });
    if (!result.ok) return { error: errorOf(result), used: used ?? undefined };

    const parsed = parseJson(result.text) as { meals?: unknown } | null;
    const list = Array.isArray(parsed?.meals) ? (parsed.meals as Record<string, unknown>[]) : [];
    const meals = data.slots
      .map((slot, i) => {
        const r = list[i];
        const title = typeof r?.title === "string" ? r.title.trim().slice(0, 120) : "";
        const steps = strList(r?.steps, 8, 300);
        if (!title || !steps.length) return null;
        const recipe: MenuMeal = {
          title,
          prepTime: typeof r.prepTime === "string" ? r.prepTime.slice(0, 30) : "",
          servings: typeof r.servings === "string" ? r.servings.slice(0, 30) : "",
          ingredients: strList(r.ingredients, 14, 80),
          steps,
          tip: typeof r.tip === "string" ? r.tip.slice(0, 300) : "",
          source: "nina",
        };
        return { ...slot, recipe };
      })
      .filter((m): m is NonNullable<typeof m> => !!m);
    if (!meals.length) return { error: "failed", used: used ?? 0 };
    return { meals, used: used ?? 0 };
  });

// ---------------------------------------------------------------------------
// Lista de compras única
// ---------------------------------------------------------------------------

const listSchema = z.object({
  ingredients: z.array(z.string().trim().min(1).max(80)).min(1).max(200),
  have: shortList(30),
  locale,
});

export type ShoppingListReply =
  | { items: { text: string; section: Section }[]; used: number }
  | { error: MenuError; used?: number };

export const buildShoppingList = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => listSchema.parse(data))
  .handler(async ({ data, context }): Promise<ShoppingListReply> => {
    const { aiChat } = await import("./ai-gateway.server");
    const result = await aiChat({
      kind: "menu",
      system: `Você monta a lista de compras da semana a partir dos ingredientes de várias receitas.
Junte o que se repete numa linha só, somando as quantidades em medidas de mercado
("1 dúzia de ovos", "1 kg de arroz", "3 tomates", "1 maço de couve"). Tire o que a pessoa já
tem em casa e o básico que toda casa tem (sal, água, óleo). Escreva em ${LANGUAGE[data.locale]}.
Classifique cada item numa seção: "hortifruti" (frutas, verduras, legumes, temperos frescos),
"acougue" (carnes, frango, peixe, ovos), "laticinios" (leite, queijo, iogurte, manteiga),
"padaria" (pães), "mercearia" (grãos, massas, enlatados, temperos secos, farinhas) ou "outros".
Responda SOMENTE com um JSON: {"items": [{"text": "...", "section": "hortifruti"}]}`,
      messages: [
        {
          role: "user",
          content: [
            `Ingredientes das receitas:\n${data.ingredients.join("\n")}`,
            data.have.length ? `Já tenho em casa: ${data.have.join(", ")}.` : "",
          ]
            .filter(Boolean)
            .join("\n\n")
            .slice(0, 7900),
        },
      ],
      temperature: 0.2,
    });
    const { data: used } = await context.supabase.rpc("ai_usage_today", { p_kind: "menu" });
    if (!result.ok) return { error: errorOf(result), used: used ?? undefined };

    const parsed = parseJson(result.text) as { items?: unknown } | null;
    const seen = new Set<string>();
    const items = (Array.isArray(parsed?.items) ? (parsed.items as Record<string, unknown>[]) : [])
      .map((i) => ({
        text: typeof i?.text === "string" ? i.text.trim().slice(0, 80) : "",
        section: (SECTIONS as readonly string[]).includes(i?.section as string)
          ? (i.section as Section)
          : "outros",
      }))
      .filter((i) => i.text && !seen.has(i.text.toLowerCase()) && seen.add(i.text.toLowerCase()))
      .slice(0, 80);
    if (!items.length) return { error: "failed", used: used ?? 0 };
    return { items, used: used ?? 0 };
  });

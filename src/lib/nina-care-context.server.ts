// Resumo do acompanhamento para a Nina (M2). Roda no servidor, com o login da própria pessoa (o
// RLS garante que só entram os dados dela), e só quando ela autorizou (nina_care_allowed).
// Regras: medidas caseiras em vez de gramas, nunca calorias, nada de peso nem das anotações
// clínicas do profissional.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Db = SupabaseClient<Database>;

const MEALS: Record<string, string> = {
  cafe_da_manha: "café da manhã",
  lanche_da_manha: "lanche da manhã",
  almoco: "almoço",
  lanche_da_tarde: "lanche da tarde",
  jantar: "jantar",
  ceia: "ceia",
  outro: "outra refeição",
};
const HUNGER = ["sem fome", "pouca fome", "fome", "bastante fome", "muita fome"];
const SATIETY = [
  "ainda com fome",
  "quase satisfeita(o)",
  "satisfeita(o)",
  "bem cheia(o)",
  "cheia(o) demais",
];
const CARE_KIND: Record<string, string> = {
  treino: "treino",
  exercicios: "exercícios",
  tarefas: "tarefas",
  cuidados: "cuidados",
  orientacoes: "orientações",
  medicacoes: "medicações (só para contexto; não oriente sobre remédios)",
};
const ALERTS = new Set(["culpa", "compulsao", "escondido", "compensar", "restricao", "purgar"]);

const clip = (s: string | null | undefined, n: number) => {
  const t = (s ?? "").replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
};

/** Frequência em palavras (sem números), a partir de dias cumpridos em 7. */
function weekWords(days: number) {
  if (days >= 6) return "quase todos os dias";
  if (days >= 4) return "na maioria dos dias";
  if (days >= 2) return "em alguns dias";
  if (days === 1) return "em um dia";
  return "ainda sem registros nesta semana";
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

async function mealPlan(db: Db, userId: string) {
  const { data } = await db
    .from("meal_plans")
    .select(
      "title, guidelines, professional_id, meal_plan_meals(name, time_of_day, position, notes, meal_plan_items(id, substitute_of, food_name, household_measure))",
    )
    .eq("patient_id", userId)
    .eq("status", "ativo")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const lines = [`PLANO ALIMENTAR ATIVO: "${clip(data.title, 80)}"`];
  const meals = [...(data.meal_plan_meals ?? [])].sort((a, b) => a.position - b.position);
  for (const m of meals.slice(0, 10)) {
    const items = m.meal_plan_items ?? [];
    const main = items.filter((i) => !i.substitute_of);
    const parts = main.slice(0, 12).map((i) => {
      const subs = items
        .filter((s) => s.substitute_of === i.id)
        .slice(0, 4)
        .map((s) => clip(s.food_name, 50));
      const measure = i.household_measure ? ` (${clip(i.household_measure, 40)})` : "";
      return `${clip(i.food_name, 60)}${measure}${subs.length ? ` — pode trocar por: ${subs.join(", ")}` : ""}`;
    });
    const time = m.time_of_day ? ` às ${m.time_of_day.slice(0, 5)}` : "";
    lines.push(`- ${clip(m.name, 40)}${time}: ${parts.join("; ") || "sem itens"}`);
    if (m.notes) lines.push(`  Observação: ${clip(m.notes, 200)}`);
  }
  if (data.guidelines) lines.push(`Orientações da nutri: ${clip(data.guidelines, 600)}`);
  return { text: lines.join("\n"), professionalId: data.professional_id };
}

async function goalsAndWater(db: Db, userId: string) {
  const since = isoDay(new Date(Date.now() - 6 * 86_400_000));
  const [{ data: goals }, { data: checkins }, { data: water }] = await Promise.all([
    db
      .from("goals")
      .select("id, title, unit")
      .eq("patient_id", userId)
      .eq("active", true)
      .limit(10),
    db
      .from("goal_checkins")
      .select("goal_id, day, value")
      .eq("patient_id", userId)
      .gte("day", since),
    db
      .from("water_days")
      .select("day, glasses, goal")
      .eq("user_id", userId)
      .order("day", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  const lines: string[] = [];
  if (goals?.length) {
    lines.push("METAS ATIVAS (como foi a última semana):");
    for (const g of goals) {
      const days = (checkins ?? []).filter((c) => c.goal_id === g.id && Number(c.value) > 0).length;
      lines.push(`- ${clip(g.title, 80)}: ${weekWords(days)}`);
    }
  }
  if (water) {
    const today = water.day === isoDay(new Date());
    const status =
      water.glasses >= water.goal
        ? "meta de água batida"
        : water.glasses > 0
          ? "bebendo água ao longo do dia"
          : "ainda sem registro de água";
    lines.push(`ÁGUA ${today ? "HOJE" : "NO ÚLTIMO REGISTRO"}: ${status}`);
  }
  return lines.join("\n") || null;
}

async function carePlans(db: Db, userId: string) {
  const { data } = await db
    .from("care_plans")
    .select("kind, title, notes, items")
    .eq("patient_id", userId)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(5);
  if (!data?.length) return null;
  const lines = ["PLANO DE CUIDADO:"];
  for (const p of data) {
    const items = Array.isArray(p.items)
      ? (p.items as { name?: string; frequency?: string }[])
          .filter((i) => typeof i?.name === "string")
          .slice(0, 8)
          .map((i) => `${clip(i.name, 60)}${i.frequency ? ` (${clip(i.frequency, 40)})` : ""}`)
      : [];
    lines.push(
      `- ${CARE_KIND[p.kind] ?? p.kind}: ${clip(p.title, 80)}${items.length ? ` — ${items.join("; ")}` : ""}`,
    );
    if (p.notes) lines.push(`  ${clip(p.notes, 200)}`);
  }
  return lines.join("\n");
}

async function diary(db: Db, userId: string) {
  const { data } = await db
    .from("diary_entries")
    .select("eaten_at, meal_type, description, hunger_before, satiety_after, feelings")
    .eq("patient_id", userId)
    .gte("eaten_at", new Date(Date.now() - 7 * 86_400_000).toISOString())
    .order("eaten_at", { ascending: false })
    .limit(6);
  if (!data?.length) return null;
  const lines = ["DIÁRIO (últimas refeições registradas):"];
  let alert = false;
  for (const e of data) {
    const bits = [
      e.hunger_before ? `antes: ${HUNGER[e.hunger_before - 1]}` : "",
      e.satiety_after ? `depois: ${SATIETY[e.satiety_after - 1]}` : "",
      e.feelings?.length ? `sentiu: ${e.feelings.join(", ")}` : "",
    ].filter(Boolean);
    if (e.feelings?.some((f) => ALERTS.has(f))) alert = true;
    lines.push(
      `- ${MEALS[e.meal_type] ?? "refeição"} (${e.eaten_at.slice(0, 10)}): ${clip(e.description, 140) || "sem descrição"}${bits.length ? ` [${bits.join("; ")}]` : ""}`,
    );
  }
  if (alert)
    lines.push(
      "ATENÇÃO: há sinais de sofrimento com a comida no diário. Acolha com delicadeza, sem julgamento, e incentive conversar com a nutri ou um(a) psicólogo(a).",
    );
  return lines.join("\n");
}

async function restrictions(db: Db, userId: string) {
  const { data } = await db.from("anamneses").select("data").eq("patient_id", userId);
  const pick = (path: [string, string]) =>
    (data ?? [])
      .map((a) => {
        const group = (a.data as Record<string, Record<string, unknown>> | null)?.[path[0]];
        const v = group?.[path[1]];
        return typeof v === "string" ? clip(v, 200) : "";
      })
      .filter(Boolean)
      .join("; ");
  const rows = [
    ["Alergias", pick(["clinicalHistory", "allergies"])],
    ["Intolerâncias", pick(["clinicalHistory", "intolerances"])],
    ["Preferências", pick(["eating", "preferences"])],
    ["Não gosta de", pick(["eating", "aversions"])],
  ].filter(([, v]) => v);
  if (!rows.length) return null;
  return [
    "RESTRIÇÕES E PREFERÊNCIAS (nunca sugira o que a pessoa não pode comer):",
    ...rows.map(([k, v]) => `- ${k}: ${v}`),
  ].join("\n");
}

/** Só alergias, intolerâncias, preferências e aversões (geladeira), com a mesma permissão. */
export async function buildRestrictions(db: Db, userId: string): Promise<string | null> {
  const { data: allowed } = await db.rpc("nina_care_allowed");
  if (!allowed) return null;
  return restrictions(db, userId).catch(() => null);
}

/** Plano alimentar ativo e restrições (cardápio da semana), com a mesma permissão. */
export async function buildMenuContext(db: Db, userId: string): Promise<string | null> {
  const { data: allowed } = await db.rpc("nina_care_allowed");
  if (!allowed) return null;
  const [plan, limits] = await Promise.all([
    mealPlan(db, userId).catch(() => null),
    restrictions(db, userId).catch(() => null),
  ]);
  const blocks = [plan?.text, limits].filter(Boolean);
  return blocks.length ? blocks.join("\n\n") : null;
}

/**
 * Texto com o acompanhamento da pessoa para o system prompt, ou null se ela não autorizou ou
 * não há nada para contar. Falhas de leitura não impedem a resposta da Nina.
 */
export async function buildCareContext(db: Db, userId: string): Promise<string | null> {
  const { data: allowed } = await db.rpc("nina_care_allowed");
  if (!allowed) return null;
  const settled = await Promise.allSettled([
    mealPlan(db, userId),
    goalsAndWater(db, userId),
    carePlans(db, userId),
    diary(db, userId),
    restrictions(db, userId),
  ]);
  const [plan, ...rest] = settled.map((r) => (r.status === "fulfilled" ? r.value : null));
  let proName: string | null = null;
  const planInfo = plan as Awaited<ReturnType<typeof mealPlan>>;
  if (planInfo?.professionalId) {
    const { data } = await db.rpc("person_cards", { p_ids: [planInfo.professionalId] });
    proName = data?.[0]?.name ?? null;
  }
  const blocks = [planInfo?.text, ...(rest as (string | null)[])].filter(Boolean);
  if (!blocks.length) return null;
  return [
    `ACOMPANHAMENTO DA PESSOA (ela autorizou você a usar)${proName ? ` — nutri responsável: ${proName}` : ""}:`,
    ...blocks,
  ].join("\n\n");
}

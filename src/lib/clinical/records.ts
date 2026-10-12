// Prontuário: anamnese, evolução (SOAP), antropometria, alimentos, plano alimentar e metas.

import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { blockInDemo, demo, demoActive } from "./demo";

export type ClinicalNote = Tables<"clinical_notes">;
export type Anthropometric = Tables<"anthropometrics">;
export type Food = Tables<"foods">;
export type MealPlan = Tables<"meal_plans">;
export type MealPlanMeal = Tables<"meal_plan_meals">;
export type MealPlanItem = Tables<"meal_plan_items">;
export type Goal = Tables<"goals">;
export type GoalCheckin = Tables<"goal_checkins">;

export interface MealWithItems extends MealPlanMeal {
  items: MealPlanItem[];
}
export interface FullMealPlan extends MealPlan {
  meals: MealWithItems[];
}

/** Estrutura da anamnese (guardada em anamneses.data). */
export interface AnamnesisData {
  /** Campos da anamnese específica da profissão (médica, psicológica, de treino…). */
  especifica?: Record<string, string>;
  chiefComplaint?: string;
  goals?: string;
  clinicalHistory?: {
    conditions?: string[];
    surgeries?: string;
    medications?: string;
    supplements?: string;
    allergies?: string;
    intolerances?: string;
  };
  familyHistory?: string;
  lifestyle?: {
    occupation?: string;
    physicalActivity?: string;
    sleepHours?: number | null;
    sleepQuality?: string;
    waterLiters?: number | null;
    smoking?: boolean;
    alcohol?: string;
    bowel?: string;
    stress?: string;
  };
  eating?: {
    mealsPerDay?: number | null;
    whoCooks?: string;
    eatsOut?: string;
    preferences?: string;
    aversions?: string;
    cravings?: string;
    recall24h?: string;
  };
  labNotes?: string;
  notes?: string;
}

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

async function me(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? "";
}

// ---------------------------------------------------------------------------
// Anamnese
// ---------------------------------------------------------------------------

export async function getAnamnesis(patientId: string, professionalId: string) {
  if (demoActive()) return demo.getAnamnesis(patientId, professionalId);
  const { data, error } = await supabase
    .from("anamneses")
    .select("*")
    .eq("patient_id", patientId)
    .eq("professional_id", professionalId)
    .maybeSingle();
  fail(error);
  return data ? { ...data, data: data.data as AnamnesisData } : null;
}

export async function saveAnamnesis(patientId: string, data: AnamnesisData) {
  blockInDemo();
  const professionalId = await me();
  const { error } = await supabase
    .from("anamneses")
    .upsert(
      { patient_id: patientId, professional_id: professionalId, data: data as NonNullable<Json> },
      { onConflict: "patient_id,professional_id" },
    );
  fail(error);
}

// ---------------------------------------------------------------------------
// Evolução clínica
// ---------------------------------------------------------------------------

export async function listNotes(patientId: string): Promise<ClinicalNote[]> {
  if (demoActive()) return demo.listNotes(patientId);
  const { data, error } = await supabase
    .from("clinical_notes")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  fail(error);
  return data ?? [];
}

export async function saveNote(
  note: Omit<TablesInsert<"clinical_notes">, "professional_id"> & { id?: string },
) {
  if (demoActive()) return demo.saveNote(note);
  if (note.id) {
    const { id, ...patch } = note;
    const { error } = await supabase.from("clinical_notes").update(patch).eq("id", id);
    fail(error);
    return;
  }
  const { error } = await supabase
    .from("clinical_notes")
    .insert({ ...note, professional_id: await me() });
  fail(error);
}

export async function deleteNote(id: string) {
  if (demoActive()) return demo.deleteNote(id);
  const { error } = await supabase.from("clinical_notes").delete().eq("id", id);
  fail(error);
}

// ---------------------------------------------------------------------------
// Antropometria
// ---------------------------------------------------------------------------

export async function listAnthropometrics(patientId: string): Promise<Anthropometric[]> {
  if (demoActive()) return demo.listAnthropometrics(patientId);
  const { data, error } = await supabase
    .from("anthropometrics")
    .select("*")
    .eq("patient_id", patientId)
    .order("measured_at", { ascending: true })
    .order("created_at", { ascending: true });
  fail(error);
  return data ?? [];
}

export async function addAnthropometric(
  row: Omit<TablesInsert<"anthropometrics">, "professional_id">,
  asProfessional: boolean,
) {
  blockInDemo();
  const { error } = await supabase
    .from("anthropometrics")
    .insert({ ...row, professional_id: asProfessional ? await me() : null });
  fail(error);
}

export async function deleteAnthropometric(id: string) {
  blockInDemo();
  const { error } = await supabase.from("anthropometrics").delete().eq("id", id);
  fail(error);
}

// ---------------------------------------------------------------------------
// Alimentos
// ---------------------------------------------------------------------------

export async function searchFoods(query: string): Promise<Food[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  // Cada palavra precisa aparecer no nome ("arroz integral" acha "Arroz, integral, cozido").
  let req = supabase.from("foods").select("*");
  for (const word of q.split(/\s+/).slice(0, 4)) {
    req = req.ilike("name", `%${word.replace(/[%_]/g, "")}%`);
  }
  const { data, error } = await req.order("source", { ascending: false }).order("name").limit(30);
  fail(error);
  return data ?? [];
}

export async function createCustomFood(
  food: Pick<
    TablesInsert<"foods">,
    "name" | "category" | "kcal" | "protein_g" | "carbs_g" | "fat_g" | "fiber_g"
  >,
): Promise<Food> {
  blockInDemo();
  const { data, error } = await supabase
    .from("foods")
    .insert({ ...food, source: "custom", owner_id: await me() })
    .select()
    .single();
  fail(error);
  return data as Food;
}

// ---------------------------------------------------------------------------
// Plano alimentar
// ---------------------------------------------------------------------------

export async function listMealPlans(patientId: string): Promise<MealPlan[]> {
  if (demoActive()) return demo.listMealPlans(patientId);
  const { data, error } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  fail(error);
  return data ?? [];
}

export async function getMealPlan(planId: string): Promise<FullMealPlan | null> {
  if (demoActive()) return demo.getMealPlan(planId);
  const { data: plan, error } = await supabase
    .from("meal_plans")
    .select("*")
    .eq("id", planId)
    .maybeSingle();
  fail(error);
  if (!plan) return null;
  const { data: meals, error: e2 } = await supabase
    .from("meal_plan_meals")
    .select("*, items:meal_plan_items(*)")
    .eq("plan_id", planId)
    .order("position");
  fail(e2);
  return {
    ...plan,
    meals: (meals ?? []).map((m) => ({
      ...m,
      items: [...(m.items ?? [])].sort((a, b) => a.position - b.position),
    })),
  };
}

/** Plano ativo do paciente (com um ou mais profissionais, o mais recente). */
export async function getActivePlan(patientId: string): Promise<FullMealPlan | null> {
  if (demoActive()) return demo.getActivePlan(patientId);
  const { data, error } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("patient_id", patientId)
    .eq("status", "ativo")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  fail(error);
  return data ? getMealPlan(data.id) : null;
}

const DEFAULT_MEALS: { name: string; time: string }[] = [
  { name: "Café da manhã", time: "07:30" },
  { name: "Lanche da manhã", time: "10:00" },
  { name: "Almoço", time: "12:30" },
  { name: "Lanche da tarde", time: "16:00" },
  { name: "Jantar", time: "19:30" },
];

export async function createMealPlan(input: {
  patientId: string;
  title: string;
  targetKcal?: number | null;
  mealNames?: { name: string; time: string }[];
}): Promise<MealPlan> {
  blockInDemo();
  const { data, error } = await supabase
    .from("meal_plans")
    .insert({
      patient_id: input.patientId,
      professional_id: await me(),
      title: input.title,
      target_kcal: input.targetKcal ?? null,
    })
    .select()
    .single();
  fail(error);
  const plan = data as MealPlan;
  const meals = (input.mealNames ?? DEFAULT_MEALS).map((m, i) => ({
    plan_id: plan.id,
    name: m.name,
    time_of_day: m.time,
    position: i,
  }));
  const { error: e2 } = await supabase.from("meal_plan_meals").insert(meals);
  fail(e2);
  return plan;
}

export async function updateMealPlan(id: string, patch: TablesUpdate<"meal_plans">) {
  blockInDemo();
  const { error } = await supabase.from("meal_plans").update(patch).eq("id", id);
  fail(error);
}

export async function deleteMealPlan(id: string) {
  blockInDemo();
  const { error } = await supabase.from("meal_plans").delete().eq("id", id);
  fail(error);
}

export async function publishMealPlan(id: string) {
  blockInDemo();
  const { error } = await supabase.rpc("publish_meal_plan", { p_plan: id });
  fail(error);
}

export async function duplicateMealPlan(id: string): Promise<MealPlan> {
  blockInDemo();
  const { data, error } = await supabase.rpc("duplicate_meal_plan", { p_plan: id });
  fail(error);
  return data as MealPlan;
}

export async function addMeal(planId: string, name: string, time: string | null, position: number) {
  blockInDemo();
  const { error } = await supabase
    .from("meal_plan_meals")
    .insert({ plan_id: planId, name, time_of_day: time, position });
  fail(error);
}

export async function updateMeal(id: string, patch: TablesUpdate<"meal_plan_meals">) {
  blockInDemo();
  const { error } = await supabase.from("meal_plan_meals").update(patch).eq("id", id);
  fail(error);
}

export async function deleteMeal(id: string) {
  blockInDemo();
  const { error } = await supabase.from("meal_plan_meals").delete().eq("id", id);
  fail(error);
}

export async function addItem(item: TablesInsert<"meal_plan_items">) {
  blockInDemo();
  const { error } = await supabase.from("meal_plan_items").insert(item);
  fail(error);
}

export async function updateItem(id: string, patch: TablesUpdate<"meal_plan_items">) {
  blockInDemo();
  const { error } = await supabase.from("meal_plan_items").update(patch).eq("id", id);
  fail(error);
}

export async function deleteItem(id: string) {
  blockInDemo();
  const { error } = await supabase.from("meal_plan_items").delete().eq("id", id);
  fail(error);
}

// ---------------------------------------------------------------------------
// Metas
// ---------------------------------------------------------------------------

export async function listGoals(patientId: string): Promise<Goal[]> {
  if (demoActive()) return demo.listGoals(patientId);
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("patient_id", patientId)
    .order("active", { ascending: false })
    .order("created_at");
  fail(error);
  return data ?? [];
}

export async function saveGoal(
  goal: Omit<TablesInsert<"goals">, "professional_id"> & { id?: string },
  asProfessional: boolean,
) {
  if (demoActive()) return demo.saveGoal(goal, asProfessional);
  if (goal.id) {
    const { id, ...patch } = goal;
    const { error } = await supabase.from("goals").update(patch).eq("id", id);
    fail(error);
    return;
  }
  const { error } = await supabase
    .from("goals")
    .insert({ ...goal, professional_id: asProfessional ? await me() : null });
  fail(error);
}

export async function deleteGoal(id: string) {
  if (demoActive()) return demo.deleteGoal(id);
  const { error } = await supabase.from("goals").delete().eq("id", id);
  fail(error);
}

export async function listCheckins(patientId: string, fromDay: string): Promise<GoalCheckin[]> {
  if (demoActive()) return demo.listCheckins(patientId, fromDay);
  const { data, error } = await supabase
    .from("goal_checkins")
    .select("*")
    .eq("patient_id", patientId)
    .gte("day", fromDay)
    .order("day");
  fail(error);
  return data ?? [];
}

export async function setCheckin(goalId: string, patientId: string, day: string, value: number) {
  if (demoActive()) return demo.setCheckin(goalId, patientId, day, value);
  const { error } = await supabase
    .from("goal_checkins")
    .upsert(
      { goal_id: goalId, patient_id: patientId, day, value, updated_at: new Date().toISOString() },
      { onConflict: "goal_id,day" },
    );
  fail(error);
}

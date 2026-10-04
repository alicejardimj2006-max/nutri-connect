// Planos de cuidado: o que o paciente segue em casa entre as consultas (treino, exercícios,
// tarefas entre sessões, cuidados, orientações e medicações em uso). O paciente marca "feito hoje".
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";
import type { CarePlanKind } from "./professions";
import { useClinicalMutation } from "./queries";

export type CarePlan = Tables<"care_plans">;
export interface CareItem {
  name: string;
  details?: string;
  frequency?: string;
  notes?: string;
}

export const itemsOf = (p: CarePlan): CareItem[] =>
  Array.isArray(p.items)
    ? (p.items as unknown as CareItem[]).filter((i) => i && typeof i.name === "string")
    : [];

const fail = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

export const carePlansKey = (patientId: string) => ["clinical", "care-plans", patientId] as const;
export const careCheckinsKey = (patientId: string) =>
  ["clinical", "care-checkins", patientId] as const;

export async function listCarePlans(patientId: string): Promise<CarePlan[]> {
  const { data, error } = await supabase
    .from("care_plans")
    .select("*")
    .eq("patient_id", patientId)
    .order("active", { ascending: false })
    .order("created_at", { ascending: false });
  fail(error);
  return data ?? [];
}

export async function saveCarePlan(input: {
  id?: string;
  patientId: string;
  professionalId: string;
  appointmentId?: string | null;
  kind: CarePlanKind;
  title: string;
  notes?: string | null;
  items: CareItem[];
  active?: boolean;
}) {
  const items = input.items
    .map((i) => ({
      name: i.name.trim().slice(0, 160),
      details: i.details?.trim().slice(0, 400) || undefined,
      frequency: i.frequency?.trim().slice(0, 120) || undefined,
      notes: i.notes?.trim().slice(0, 400) || undefined,
    }))
    .filter((i) => i.name);
  const row = {
    kind: input.kind,
    title: input.title.trim().slice(0, 120),
    notes: input.notes?.trim() || null,
    items: items as unknown as Json,
    active: input.active ?? true,
  };
  if (input.id) {
    const { error } = await supabase.from("care_plans").update(row).eq("id", input.id);
    fail(error);
    return;
  }
  const { error } = await supabase.from("care_plans").insert({
    ...row,
    patient_id: input.patientId,
    professional_id: input.professionalId,
    appointment_id: input.appointmentId ?? null,
  });
  fail(error);
}

export async function setCarePlanActive(id: string, active: boolean) {
  const { error } = await supabase.from("care_plans").update({ active }).eq("id", id);
  fail(error);
}

export async function deleteCarePlan(id: string) {
  const { error } = await supabase.from("care_plans").delete().eq("id", id);
  fail(error);
}

/** Dias (últimos 30) em que o paciente marcou cada plano como feito. */
export async function listCareCheckins(patientId: string): Promise<Tables<"care_plan_checkins">[]> {
  const from = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("care_plan_checkins")
    .select("*")
    .eq("patient_id", patientId)
    .gte("day", from);
  fail(error);
  return data ?? [];
}

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export async function toggleCareCheckin(planId: string, patientId: string, done: boolean) {
  const day = todayKey();
  if (done) {
    const { error } = await supabase
      .from("care_plan_checkins")
      .insert({ plan_id: planId, patient_id: patientId, day });
    fail(error);
  } else {
    const { error } = await supabase
      .from("care_plan_checkins")
      .delete()
      .eq("plan_id", planId)
      .eq("day", day);
    fail(error);
  }
}

export function useCarePlans(patientId: string) {
  return useQuery({
    queryKey: carePlansKey(patientId),
    queryFn: () => listCarePlans(patientId),
    enabled: !!patientId,
  });
}

export function useCareCheckins(patientId: string) {
  return useQuery({
    queryKey: careCheckinsKey(patientId),
    queryFn: () => listCareCheckins(patientId),
    enabled: !!patientId,
  });
}

export function useToggleCareCheckin(patientId: string) {
  return useClinicalMutation(
    ({ planId, done }: { planId: string; done: boolean }) =>
      toggleCareCheckin(planId, patientId, done),
    { invalidate: [careCheckinsKey(patientId)] },
  );
}

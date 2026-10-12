// Acesso ao Supabase do módulo clínico. Tudo aqui respeita o RLS do banco:
// cada função devolve apenas o que a pessoa logada pode ver.

import { supabase } from "@/integrations/supabase/client";
import type { Database, Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { ct } from "./i18n";
import { blockInDemo, demo, demoActive, demoPeople, isDemoId } from "./demo";

export type AppointmentStatus = Database["public"]["Enums"]["appointment_status"];
export type AppointmentModality = Database["public"]["Enums"]["appointment_modality"];
export type LinkStatus = Database["public"]["Enums"]["link_status"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];

export type Appointment = Tables<"appointments">;
export type CareLink = Tables<"care_links">;
export type CareInvite = Tables<"care_invites">;
export type AvailabilityRule = Tables<"availability_rules">;
export type AvailabilityBlock = Tables<"availability_blocks">;
export type Professional = Tables<"professionals">;
export type Payment = Tables<"payments">;
export type DirectoryEntry = Database["public"]["Views"]["professional_directory"]["Row"];

export interface PersonSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string;
}

export interface Slot {
  starts_at: string;
  ends_at: string;
  modality: "presencial" | "online" | "ambos";
}

/** Erros do banco → mensagem legível (as RPCs já levantam textos em português). */
function fail(error: { message: string } | null): never | void {
  if (error) throw new Error(error.message);
}

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error(ct("errors.sessionExpired"));
  return id;
}

// ---------------------------------------------------------------------------
// Pessoas
// ---------------------------------------------------------------------------

export async function fetchPeople(ids: string[]): Promise<Map<string, PersonSummary>> {
  const map0 = new Map<string, PersonSummary>();
  // Pessoas do modo demonstração vêm de exemplo; as demais, do banco.
  for (const p of demoPeople(ids)) map0.set(p.id, p);
  const unique = [...new Set(ids.filter((id) => id && !isDemoId(id)))];
  const map = map0;
  if (!unique.length) return map;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, avatar_url, bio")
    .in("id", unique);
  fail(error);
  for (const p of data ?? []) {
    map.set(p.id, { id: p.id, name: p.name, avatarUrl: p.avatar_url, bio: p.bio });
  }
  return map;
}

export async function fetchPatientPrivate(patientId: string) {
  if (demoActive()) return demo.fetchPatientPrivate(patientId);
  const { data, error } = await supabase
    .from("profile_private")
    .select("*")
    .eq("id", patientId)
    .maybeSingle();
  fail(error);
  return data;
}

// ---------------------------------------------------------------------------
// Diretório de profissionais
// ---------------------------------------------------------------------------

export async function listDirectory(): Promise<DirectoryEntry[]> {
  const { data, error } = await supabase.from("professional_directory").select("*").order("name");
  fail(error);
  return data ?? [];
}

export async function getDirectoryEntry(id: string): Promise<DirectoryEntry | null> {
  if (demoActive()) return demo.getDirectoryEntry(id);
  const { data, error } = await supabase
    .from("professional_directory")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  fail(error);
  return data;
}

export async function getProfessional(id: string): Promise<Professional | null> {
  if (demoActive()) return demo.getProfessional(id);
  const { data, error } = await supabase
    .from("professionals")
    .select("*")
    .eq("user_id", id)
    .maybeSingle();
  fail(error);
  return data;
}

export async function updateProfessionalSettings(
  id: string,
  patch: TablesUpdate<"professionals">,
): Promise<void> {
  blockInDemo();
  const { error } = await supabase.from("professionals").update(patch).eq("user_id", id);
  fail(error);
}

// ---------------------------------------------------------------------------
// Agenda
// ---------------------------------------------------------------------------

export async function getSlots(professionalId: string, from: string, to: string): Promise<Slot[]> {
  const { data, error } = await supabase.rpc("get_available_slots", {
    p_professional: professionalId,
    p_from: from,
    p_to: to,
  });
  fail(error);
  return (data ?? []) as Slot[];
}

export async function bookAppointment(input: {
  professionalId: string;
  startsAt: string;
  modality: AppointmentModality;
  notes?: string;
  communitySlug?: string;
}): Promise<Appointment> {
  blockInDemo();
  const { data, error } = await supabase.rpc("book_appointment", {
    p_professional: input.professionalId,
    p_starts_at: input.startsAt,
    p_modality: input.modality,
    p_notes: input.notes || undefined,
    p_community_slug: input.communitySlug || undefined,
  });
  fail(error);
  return data as Appointment;
}

export async function cancelAppointment(id: string, reason?: string): Promise<void> {
  blockInDemo();
  const { error } = await supabase.rpc("cancel_appointment", {
    p_appointment: id,
    p_reason: reason || undefined,
  });
  fail(error);
}

export async function rescheduleAppointment(id: string, startsAt: string): Promise<void> {
  blockInDemo();
  const { error } = await supabase.rpc("reschedule_appointment", {
    p_appointment: id,
    p_starts_at: startsAt,
  });
  fail(error);
}

export async function updateAppointment(
  id: string,
  patch: TablesUpdate<"appointments">,
): Promise<void> {
  blockInDemo();
  const { error } = await supabase.from("appointments").update(patch).eq("id", id);
  fail(error);
}

/** Profissional registra uma consulta para um paciente vinculado. */
export async function createAppointmentAsProfessional(
  input: Omit<TablesInsert<"appointments">, "professional_id" | "created_by">,
): Promise<void> {
  blockInDemo();
  const me = await currentUserId();
  const { error } = await supabase
    .from("appointments")
    .insert({ ...input, professional_id: me, created_by: me });
  if (error?.message.includes("appointments_no_overlap")) {
    throw new Error(ct("errors.overlap"));
  }
  fail(error);
}

export async function listAppointments(opts: {
  role: "patient" | "professional";
  from?: string;
  to?: string;
  patientId?: string;
  professionalId?: string;
  limit?: number;
  ascending?: boolean;
}): Promise<Appointment[]> {
  if (demoActive()) return demo.listAppointments(opts);
  const me = await currentUserId();
  let q = supabase.from("appointments").select("*");
  q = opts.role === "patient" ? q.eq("patient_id", me) : q.eq("professional_id", me);
  if (opts.patientId) q = q.eq("patient_id", opts.patientId);
  if (opts.professionalId) q = q.eq("professional_id", opts.professionalId);
  if (opts.from) q = q.gte("starts_at", opts.from);
  if (opts.to) q = q.lt("starts_at", opts.to);
  q = q.order("starts_at", { ascending: opts.ascending ?? true });
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  fail(error);
  return data ?? [];
}

export async function listAvailabilityRules(professionalId: string): Promise<AvailabilityRule[]> {
  const { data, error } = await supabase
    .from("availability_rules")
    .select("*")
    .eq("professional_id", professionalId)
    .order("weekday")
    .order("start_time");
  fail(error);
  return data ?? [];
}

export async function addAvailabilityRule(
  rule: Omit<TablesInsert<"availability_rules">, "professional_id">,
): Promise<void> {
  blockInDemo();
  const me = await currentUserId();
  const { error } = await supabase
    .from("availability_rules")
    .insert({ ...rule, professional_id: me });
  fail(error);
}

export async function deleteAvailabilityRule(id: string): Promise<void> {
  blockInDemo();
  const { error } = await supabase.from("availability_rules").delete().eq("id", id);
  fail(error);
}

export async function listAvailabilityBlocks(professionalId: string): Promise<AvailabilityBlock[]> {
  const { data, error } = await supabase
    .from("availability_blocks")
    .select("*")
    .eq("professional_id", professionalId)
    .gte("ends_at", new Date().toISOString())
    .order("starts_at");
  fail(error);
  return data ?? [];
}

export async function addAvailabilityBlock(
  block: Omit<TablesInsert<"availability_blocks">, "professional_id">,
): Promise<void> {
  blockInDemo();
  const me = await currentUserId();
  const { error } = await supabase
    .from("availability_blocks")
    .insert({ ...block, professional_id: me });
  fail(error);
}

export async function deleteAvailabilityBlock(id: string): Promise<void> {
  blockInDemo();
  const { error } = await supabase.from("availability_blocks").delete().eq("id", id);
  fail(error);
}

// ---------------------------------------------------------------------------
// Vínculos e convites
// ---------------------------------------------------------------------------

export async function listLinks(role: "patient" | "professional"): Promise<CareLink[]> {
  if (demoActive()) return demo.listLinks(role);
  const me = await currentUserId();
  const { data, error } = await supabase
    .from("care_links")
    .select("*")
    .eq(role === "patient" ? "patient_id" : "professional_id", me)
    .order("created_at", { ascending: false });
  fail(error);
  return data ?? [];
}

export async function requestLink(input: {
  professionalId: string;
  message?: string;
  communitySlug?: string;
}): Promise<void> {
  blockInDemo();
  const me = await currentUserId();
  const { error } = await supabase.from("care_links").insert({
    patient_id: me,
    professional_id: input.professionalId,
    status: "pendente",
    origin: input.communitySlug ? "comunidade" : "solicitacao",
    community_slug: input.communitySlug ?? null,
    message: input.message?.trim() || null,
  });
  if (error?.code === "23505") throw new Error(ct("errors.linkExists"));
  fail(error);
}

export async function respondLink(id: string, accept: boolean): Promise<void> {
  blockInDemo();
  const { error } = await supabase.rpc("respond_care_link", { p_link: id, p_accept: accept });
  fail(error);
}

export async function endLink(id: string): Promise<void> {
  blockInDemo();
  const { error } = await supabase.rpc("end_care_link", { p_link: id });
  fail(error);
}

export async function listInvites(): Promise<CareInvite[]> {
  if (demoActive()) return demo.listInvites();
  const me = await currentUserId();
  const { data, error } = await supabase
    .from("care_invites")
    .select("*")
    .eq("professional_id", me)
    .order("created_at", { ascending: false });
  fail(error);
  return data ?? [];
}

export async function createInvite(input: {
  inviteeName?: string;
  inviteeEmail?: string;
  note?: string;
}): Promise<CareInvite> {
  blockInDemo();
  const me = await currentUserId();
  const { data, error } = await supabase
    .from("care_invites")
    .insert({
      professional_id: me,
      invitee_name: input.inviteeName?.trim() || null,
      invitee_email: input.inviteeEmail?.trim() || null,
      note: input.note?.trim() || null,
    })
    .select()
    .single();
  fail(error);
  return data as CareInvite;
}

export async function revokeInvite(code: string): Promise<void> {
  blockInDemo();
  const { error } = await supabase
    .from("care_invites")
    .update({ revoked_at: new Date().toISOString() })
    .eq("code", code);
  fail(error);
}

export async function getInvite(code: string) {
  const { data, error } = await supabase.rpc("get_care_invite", { p_code: code });
  fail(error);
  return data?.[0] ?? null;
}

export async function acceptInvite(code: string): Promise<CareLink> {
  blockInDemo();
  const { data, error } = await supabase.rpc("accept_care_invite", { p_code: code });
  fail(error);
  return data as CareLink;
}

// ---------------------------------------------------------------------------
// Pagamentos (registro manual; o checkout do Stripe vem das Edge Functions)
// ---------------------------------------------------------------------------

export async function listPaymentsForAppointments(ids: string[]): Promise<Payment[]> {
  if (demoActive()) return demo.listPaymentsForAppointments(ids);
  if (!ids.length) return [];
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .in("appointment_id", ids)
    .order("created_at", { ascending: false });
  fail(error);
  return data ?? [];
}

export async function registerManualPayment(
  appointmentId: string,
  method: string,
  amountCents?: number,
): Promise<void> {
  blockInDemo();
  const { error } = await supabase.rpc("register_manual_payment", {
    p_appointment: appointmentId,
    p_method: method,
    p_amount_cents: amountCents,
  });
  fail(error);
}

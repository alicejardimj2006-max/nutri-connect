// Acompanhamento do dia a dia: diário alimentar, mensagens e documentos/exames.
// Arquivos ficam em buckets privados; a exibição usa links assinados temporários.

import { supabase } from "@/integrations/supabase/client";
import type { Database, Tables } from "@/integrations/supabase/types";
import { fileToDataUrl } from "@/lib/image";
import { ct } from "./i18n";
import { blockInDemo, demo, demoActive, demoFileUrl, isDemoPath } from "./demo";

export type DiaryEntry = Tables<"diary_entries">;
export type DiaryComment = Tables<"diary_comments">;
export type Message = Tables<"messages">;
export type PatientDocument = Tables<"patient_documents">;
export type DocumentKind = Database["public"]["Enums"]["document_kind"];
export type Bucket = "diary-photos" | "patient-files" | "chat-attachments" | "avatars";

export const MEAL_TYPES = [
  "cafe_da_manha",
  "lanche_da_manha",
  "almoco",
  "lanche_da_tarde",
  "jantar",
  "ceia",
  "outro",
] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

async function me(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? "";
}

function safeName(name: string) {
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot).toLowerCase() : "";
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .normalize("NFD")
    .replace(/[^\w-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
  return `${Date.now()}-${base || "arquivo"}${ext}`;
}

/** Fotos viram JPEG reduzido (até 1600 px) antes do upload. */
async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;
  const dataUrl = await fileToDataUrl(file, 1600, 0.82);
  return (await fetch(dataUrl)).blob();
}

export async function uploadFile(bucket: Bucket, folder: string, file: File, compress = false) {
  blockInDemo();
  if (file.size > MAX_UPLOAD_BYTES) throw new Error(ct("errors.fileTooLarge"));
  const body = compress ? await compressImage(file) : file;
  const name = compress ? safeName(file.name).replace(/\.[^.]+$/, ".jpg") : safeName(file.name);
  const path = `${folder}/${name}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, body, { contentType: compress ? "image/jpeg" : file.type || undefined });
  fail(error);
  return { path, size: body.size, type: compress ? "image/jpeg" : file.type };
}

export async function signedUrls(
  bucket: Bucket,
  paths: string[],
  ttl = 3600,
): Promise<Record<string, string>> {
  // Arquivos do modo demonstração são gerados no navegador.
  const out: Record<string, string> = {};
  for (const p of paths) if (p && isDemoPath(p)) out[p] = demoFileUrl(p);
  const unique = [...new Set(paths.filter((p) => p && !isDemoPath(p)))];
  if (!unique.length) return out;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrls(unique, ttl);
  fail(error);
  for (const d of data ?? []) if (d.path && d.signedUrl) out[d.path] = d.signedUrl;
  return out;
}

// ---------------------------------------------------------------------------
// Diário alimentar
// ---------------------------------------------------------------------------

export async function listDiary(patientId: string, limit = 60): Promise<DiaryEntry[]> {
  if (demoActive()) return demo.listDiary(patientId, limit);
  const { data, error } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("patient_id", patientId)
    .order("eaten_at", { ascending: false })
    .limit(limit);
  fail(error);
  return data ?? [];
}

export async function addDiaryEntry(input: {
  eatenAt: string;
  mealType: MealType;
  description: string;
  photo?: File | null;
  hungerBefore?: number | null;
  satietyAfter?: number | null;
  mood?: string | null;
  followedPlan?: boolean | null;
}) {
  if (demoActive()) return demo.addDiaryEntry(input);
  const patientId = await me();
  const photo = input.photo ? await uploadFile("diary-photos", patientId, input.photo, true) : null;
  const { error } = await supabase.from("diary_entries").insert({
    patient_id: patientId,
    eaten_at: input.eatenAt,
    meal_type: input.mealType,
    description: input.description.trim(),
    photo_path: photo?.path ?? null,
    hunger_before: input.hungerBefore ?? null,
    satiety_after: input.satietyAfter ?? null,
    mood: input.mood?.trim() || null,
    followed_plan: input.followedPlan ?? null,
  });
  fail(error);
}

export async function deleteDiaryEntry(entry: DiaryEntry) {
  if (demoActive()) return demo.deleteDiaryEntry(entry);
  const { error } = await supabase.from("diary_entries").delete().eq("id", entry.id);
  fail(error);
  if (entry.photo_path) await supabase.storage.from("diary-photos").remove([entry.photo_path]);
}

export async function listDiaryComments(entryIds: string[]): Promise<DiaryComment[]> {
  if (demoActive()) return demo.listDiaryComments(entryIds);
  if (!entryIds.length) return [];
  const { data, error } = await supabase
    .from("diary_comments")
    .select("*")
    .in("entry_id", entryIds)
    .order("created_at");
  fail(error);
  return data ?? [];
}

export async function addDiaryComment(entryId: string, body: string) {
  if (demoActive()) return demo.addDiaryComment(entryId, body);
  const { error } = await supabase
    .from("diary_comments")
    .insert({ entry_id: entryId, author_id: await me(), body: body.trim() });
  fail(error);
}

export async function deleteDiaryComment(id: string) {
  if (demoActive()) return demo.deleteDiaryComment(id);
  const { error } = await supabase.from("diary_comments").delete().eq("id", id);
  fail(error);
}

// ---------------------------------------------------------------------------
// Mensagens
// ---------------------------------------------------------------------------

export async function listMessages(patientId: string, professionalId: string): Promise<Message[]> {
  if (demoActive()) return demo.listMessages(patientId, professionalId);
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("patient_id", patientId)
    .eq("professional_id", professionalId)
    .order("created_at")
    .limit(500);
  fail(error);
  return data ?? [];
}

/** Última mensagem e não lidas de cada conversa da pessoa logada. */
export async function listConversationSummaries(): Promise<
  { patientId: string; professionalId: string; last: Message; unread: number }[]
> {
  if (demoActive()) return demo.listConversationSummaries();
  const uid = await me();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`patient_id.eq.${uid},professional_id.eq.${uid}`)
    .order("created_at", { ascending: false })
    .limit(1000);
  fail(error);
  const map = new Map<
    string,
    { patientId: string; professionalId: string; last: Message; unread: number }
  >();
  for (const m of data ?? []) {
    const key = `${m.patient_id}:${m.professional_id}`;
    const entry = map.get(key) ?? {
      patientId: m.patient_id,
      professionalId: m.professional_id,
      last: m,
      unread: 0,
    };
    if (!m.read_at && m.sender_id !== uid) entry.unread++;
    map.set(key, entry);
  }
  return [...map.values()];
}

export async function sendMessage(input: {
  patientId: string;
  professionalId: string;
  body: string;
  file?: File | null;
}) {
  if (demoActive()) return demo.sendMessage(input);
  const uid = await me();
  const attachment = input.file
    ? await uploadFile(
        "chat-attachments",
        `${input.patientId}/${input.professionalId}`,
        input.file,
        input.file.type.startsWith("image/"),
      )
    : null;
  const { error } = await supabase.from("messages").insert({
    patient_id: input.patientId,
    professional_id: input.professionalId,
    sender_id: uid,
    body: input.body.trim(),
    attachment_path: attachment?.path ?? null,
    attachment_name: input.file?.name ?? null,
  });
  fail(error);
}

export async function markConversationRead(patientId: string, professionalId: string) {
  if (demoActive()) return demo.markConversationRead(patientId, professionalId);
  const uid = await me();
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("patient_id", patientId)
    .eq("professional_id", professionalId)
    .neq("sender_id", uid)
    .is("read_at", null);
  fail(error);
}

// ---------------------------------------------------------------------------
// Documentos e exames
// ---------------------------------------------------------------------------

export async function listDocuments(patientId: string): Promise<PatientDocument[]> {
  if (demoActive()) return demo.listDocuments(patientId);
  const { data, error } = await supabase
    .from("patient_documents")
    .select("*")
    .eq("patient_id", patientId)
    .order("document_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  fail(error);
  return data ?? [];
}

export async function uploadDocument(input: {
  patientId: string;
  title: string;
  kind: DocumentKind;
  file: File;
  documentDate?: string | null;
  notes?: string | null;
}) {
  blockInDemo();
  const uploaded = await uploadFile("patient-files", input.patientId, input.file);
  const { error } = await supabase.from("patient_documents").insert({
    patient_id: input.patientId,
    uploaded_by: await me(),
    kind: input.kind,
    title: input.title.trim(),
    file_path: uploaded.path,
    mime_type: uploaded.type || null,
    size_bytes: uploaded.size,
    document_date: input.documentDate || null,
    notes: input.notes?.trim() || null,
  });
  if (error) {
    await supabase.storage.from("patient-files").remove([uploaded.path]);
    throw new Error(error.message);
  }
}

export async function deleteDocument(doc: PatientDocument) {
  blockInDemo();
  await supabase.storage.from("patient-files").remove([doc.file_path]);
  const { error } = await supabase.from("patient_documents").delete().eq("id", doc.id);
  fail(error);
}

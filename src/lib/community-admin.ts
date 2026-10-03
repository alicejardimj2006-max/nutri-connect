import { t } from "./i18n";
// Verificação de profissionais. A administração das comunidades (convites, candidatos,
// indicação de admin) mora no banco: ver src/lib/social/communities.ts.

import type { VerificationRequest } from "@/lib/community";
import type { AuthUser } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const PROFESSIONS = [
  { label: "Nutricionista", council: "CRN" },
  { label: "Médico(a)", council: "CRM" },
  { label: "Psicólogo(a)", council: "CRP" },
  { label: "Educador(a) físico(a)", council: "CREF" },
  { label: "Fisioterapeuta", council: "CREFITO" },
  { label: "Enfermeiro(a)", council: "COREN" },
] as const;

export const BR_STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

/** Administradores da plataforma (tabela platform_admins no Supabase). */
export function isPlatformAdmin(user: Pick<AuthUser, "isAdmin"> | null | undefined): boolean {
  return !!user?.isAdmin;
}

// ---------------------------------------------------------------------------
// Pedidos de verificação
// ---------------------------------------------------------------------------

/** Pedido mais recente de uma pessoa. */
export function getLatestVerification(
  verifications: VerificationRequest[],
  userId: string,
): VerificationRequest | undefined {
  return verifications
    .filter((v) => v.userId === userId)
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))[0];
}

export type VerificationInput = Omit<
  VerificationRequest,
  "id" | "status" | "submittedAt" | "reviewedAt" | "reviewedById" | "rejectionReason"
>;

function dataUrlToBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(",");
  const mime = /data:([^;]+)/.exec(head)?.[1] ?? "image/jpeg";
  const bytes = atob(body);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

async function uploadVerificationImage(userId: string, name: string, dataUrl: string) {
  const blob = dataUrlToBlob(dataUrl);
  const ext = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
  const path = `${userId}/${Date.now()}-${name}.${ext}`;
  const { error } = await supabase.storage
    .from("verification-docs")
    .upload(path, blob, { contentType: blob.type, upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

/** Envia o pedido (imagens vão para o bucket privado verification-docs). */
export async function submitVerification(input: VerificationInput) {
  // O banco recusa pedido repetido em análise e de quem já é profissional (erro 23505 abaixo).
  const { data: already } = await supabase
    .from("professionals")
    .select("user_id")
    .eq("user_id", input.userId)
    .maybeSingle();
  if (already) throw new Error(t("err.alreadyPro"));
  const [documentPath, selfiePath] = await Promise.all([
    uploadVerificationImage(input.userId, "documento", input.documentImage),
    uploadVerificationImage(input.userId, "selfie", input.selfieImage),
  ]);
  const { error } = await supabase.from("verification_requests").insert({
    user_id: input.userId,
    full_name: input.fullName,
    profession: input.profession,
    council: input.council,
    registration: input.registration,
    uf: input.uf,
    specialties: input.specialties,
    bio: input.bio ?? null,
    public_lookup_url: input.publicLookupUrl ?? null,
    document_path: documentPath,
    selfie_path: selfiePath,
  });
  if (error) {
    throw new Error(error.code === "23505" ? t("err.pendingRequest") : error.message);
  }
}

/** Aprova ou recusa um pedido. Aprovado, o perfil vira profissional verificado. */
export async function reviewVerification(input: {
  requestId: string;
  reviewer: { id: string; name: string };
  approve: boolean;
  reason?: string;
}) {
  const { error } = await supabase.rpc("review_verification", {
    p_request: input.requestId,
    p_approve: input.approve,
    p_reason: input.approve ? undefined : input.reason?.trim() || undefined,
  });
  if (error) throw new Error(error.message);
}

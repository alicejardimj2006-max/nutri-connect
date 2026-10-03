// Profissionais verificados e pedidos de verificação: leitura direta do banco.
// Substitui o espelho em localStorage (profile-sync) que as telas usavam até a Etapa 7.

import { supabase } from "@/integrations/supabase/client";
import type { ProfessionalInfo, VerificationRequest } from "@/lib/community";

const SIGNED_URL_TTL = 60 * 60; // 1 h

export interface VerifiedProfessional {
  userId: string;
  name: string;
  avatarUrl?: string;
  info: ProfessionalInfo;
}

/** Todos os profissionais verificados (a tabela é legível por quem está logado). */
export async function fetchProfessionals(): Promise<VerifiedProfessional[]> {
  const { data: pros, error } = await supabase
    .from("professionals")
    .select("user_id, profession, council, registration, uf, specialties, verified_at")
    .limit(2000);
  if (error) throw new Error(error.message);
  const rows = pros ?? [];
  if (rows.length === 0) return [];

  const { data: cards, error: cardsError } = await supabase.rpc("person_cards", {
    p_ids: rows.map((r) => r.user_id),
  });
  if (cardsError) throw new Error(cardsError.message);
  const byId = new Map((cards ?? []).map((c) => [c.id, c]));

  // Quem não tem cartão (bloqueio entre as partes) não aparece.
  return rows.flatMap((r) => {
    const card = byId.get(r.user_id);
    if (!card) return [];
    return [
      {
        userId: r.user_id,
        name: card.name,
        avatarUrl: card.avatar_url ?? undefined,
        info: {
          profession: r.profession,
          council: r.council,
          registration: r.registration,
          uf: r.uf,
          specialties: r.specialties,
          verifiedAt: r.verified_at,
        },
      },
    ];
  });
}

async function signed(path: string): Promise<string> {
  const { data } = await supabase.storage
    .from("verification-docs")
    .createSignedUrl(path, SIGNED_URL_TTL);
  return data?.signedUrl ?? "";
}

/**
 * Pedidos de verificação visíveis à pessoa (os próprios; todos, para admins).
 * Com withImages, gera links temporários só para os pedidos ainda em análise.
 */
export async function fetchVerifications(withImages = false): Promise<VerificationRequest[]> {
  const { data, error } = await supabase
    .from("verification_requests")
    .select("*, profiles!verification_requests_user_id_fkey(name)")
    .order("submitted_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);

  return Promise.all(
    (data ?? []).map(async (v) => ({
      id: v.id,
      userId: v.user_id,
      userName: v.profiles?.name ?? v.full_name,
      fullName: v.full_name,
      profession: v.profession,
      council: v.council,
      registration: v.registration,
      uf: v.uf,
      specialties: v.specialties,
      bio: v.bio ?? undefined,
      publicLookupUrl: v.public_lookup_url ?? undefined,
      documentImage: withImages && v.status === "em_analise" ? await signed(v.document_path) : "",
      selfieImage: withImages && v.status === "em_analise" ? await signed(v.selfie_path) : "",
      status: v.status,
      submittedAt: v.submitted_at,
      reviewedAt: v.reviewed_at ?? undefined,
      reviewedById: v.reviewed_by ?? undefined,
      rejectionReason: v.rejection_reason ?? undefined,
    })),
  );
}

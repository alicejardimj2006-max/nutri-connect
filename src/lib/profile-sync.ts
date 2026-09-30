// Ponte entre o Supabase (fonte da verdade de perfis, profissionais verificados
// e pedidos de verificação) e o estado local das comunidades, que ainda vive no
// navegador. Os componentes de comunidade continuam lendo `profiles` e
// `verifications` do useCommunity; aqui mantemos esses campos espelhados.

import { supabase } from "@/integrations/supabase/client";
import {
  loadState,
  saveState,
  type PublicProfile,
  type VerificationRequest,
} from "@/lib/community";

const SIGNED_URL_TTL = 60 * 60; // 1 h

type ProfessionalRow = {
  user_id: string;
  profession: string;
  council: string;
  registration: string;
  uf: string;
  specialties: string[];
  verified_at: string;
};

/** Perfis públicos + profissionais verificados → state.profiles. */
export async function syncRemoteProfiles(): Promise<void> {
  const [profiles, pros] = await Promise.all([
    supabase.from("profiles").select("id, name, bio, role").limit(2000),
    supabase
      .from("professionals")
      .select("user_id, profession, council, registration, uf, specialties, verified_at")
      .limit(2000),
  ]);
  if (profiles.error || pros.error) return;

  const proById = new Map<string, ProfessionalRow>(
    (pros.data ?? []).map((p) => [p.user_id, p as ProfessionalRow]),
  );
  const remote: PublicProfile[] = (profiles.data ?? []).map((p) => {
    const pro = proById.get(p.id);
    return {
      userId: p.id,
      name: p.name,
      bio: p.bio,
      role: pro ? "profissional" : "paciente",
      professional: pro
        ? {
            profession: pro.profession,
            council: pro.council,
            registration: pro.registration,
            uf: pro.uf,
            specialties: pro.specialties,
            verifiedAt: pro.verified_at,
          }
        : undefined,
    };
  });

  const state = loadState();
  const remoteIds = new Set(remote.map((p) => p.userId));
  const merged = [
    ...state.profiles
      .filter((p) => !remoteIds.has(p.userId))
      // Perfis locais não podem se declarar profissionais sem verificação real.
      .map((p) => ({ ...p, role: "paciente" as const, professional: undefined })),
    ...remote,
  ];
  saveState({ ...state, profiles: merged });
}

async function signed(path: string): Promise<string> {
  const { data } = await supabase.storage
    .from("verification-docs")
    .createSignedUrl(path, SIGNED_URL_TTL);
  return data?.signedUrl ?? "";
}

/**
 * Pedidos de verificação visíveis ao usuário (os próprios; todos, para admins).
 * Com withImages, gera links temporários só para os pedidos ainda em análise.
 */
export async function syncVerifications(withImages = false): Promise<void> {
  const { data, error } = await supabase
    .from("verification_requests")
    .select("*, profiles!verification_requests_user_id_fkey(name)")
    .order("submitted_at", { ascending: false })
    .limit(500);
  if (error) return;

  const verifications: VerificationRequest[] = await Promise.all(
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

  const state = loadState();
  saveState({ ...state, verifications });
}

let started: Promise<void> | null = null;

/** Sincronização inicial, uma vez por carregamento da página (e após login). */
export function syncCommunityWithRemote(force = false): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (started && !force) return started;
  started = Promise.all([syncRemoteProfiles(), syncVerifications()])
    .then(() => undefined)
    .catch((err) => console.error("[profile-sync]", err));
  return started;
}

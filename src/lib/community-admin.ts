import { t } from "./i18n";
// Governança: verificação de profissionais e administração das comunidades
// (um admin usuário + um admin profissional, sempre os dois).

import {
  loadState,
  saveState,
  isCommunityAdmin,
  type Actor,
  type Community,
  type CommunityState,
  type ProfessionalInfo,
  type PublicProfile,
  type VerificationRequest,
} from "@/lib/community";
import type { AuthUser } from "@/lib/auth";

/** Quantos profissionais (os mais habilitados) recebem o convite de uma comunidade. */
export const INVITE_LIMIT = 5;
/** Quantos membros mais engajados a plataforma considera ao indicar um novo admin usuário. */
export const CANDIDATE_LIMIT = 5;

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

/**
 * Administradores da plataforma (quem analisa as verificações e indica admins).
 * Configurável por VITE_PLATFORM_ADMIN_EMAILS (e-mails separados por vírgula).
 */
const ADMIN_EMAILS = (
  (import.meta.env?.VITE_PLATFORM_ADMIN_EMAILS as string | undefined) ?? "admin@nutriconnect.com.br"
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isPlatformAdmin(user: Pick<AuthUser, "email"> | null | undefined): boolean {
  return !!user && ADMIN_EMAILS.includes(user.email.toLowerCase().trim());
}

function update(fn: (state: CommunityState) => CommunityState) {
  saveState(fn(loadState()));
}

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

// ---------------------------------------------------------------------------
// Perfil profissional e verificação
// ---------------------------------------------------------------------------

export function isVerifiedProfessional(profiles: PublicProfile[], userId: string): boolean {
  return profiles.find((p) => p.userId === userId)?.role === "profissional";
}

export function getProfessionalInfo(
  profiles: PublicProfile[],
  userId: string,
): ProfessionalInfo | undefined {
  return profiles.find((p) => p.userId === userId)?.professional;
}

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

export function submitVerification(input: VerificationInput) {
  const state = loadState();
  if (isVerifiedProfessional(state.profiles, input.userId)) {
    throw new Error(t("err.alreadyPro"));
  }
  if (getLatestVerification(state.verifications, input.userId)?.status === "em_analise") {
    throw new Error(t("err.pendingRequest"));
  }
  const request: VerificationRequest = {
    ...input,
    id: newId(),
    status: "em_analise",
    submittedAt: new Date().toISOString(),
  };
  saveState({ ...state, verifications: [request, ...state.verifications] });
  return request;
}

/** Aprova ou recusa um pedido. Aprovado, o perfil vira profissional verificado. */
export function reviewVerification(input: {
  requestId: string;
  reviewer: Actor;
  approve: boolean;
  reason?: string;
}) {
  update((s) => {
    const request = s.verifications.find((v) => v.id === input.requestId);
    if (!request || request.status !== "em_analise") return s;

    const now = new Date().toISOString();
    const verifications = s.verifications.map((v) =>
      v.id === request.id
        ? {
            ...v,
            status: input.approve ? ("aprovado" as const) : ("recusado" as const),
            reviewedAt: now,
            reviewedById: input.reviewer.id,
            rejectionReason: input.approve ? undefined : input.reason?.trim() || undefined,
          }
        : v,
    );

    let profiles = s.profiles;
    if (input.approve) {
      const existing = profiles.find((p) => p.userId === request.userId);
      const verified: PublicProfile = {
        userId: request.userId,
        name: existing?.name ?? request.userName,
        bio: existing?.bio || request.bio || "Profissional verificado da comunidade NutriConnect.",
        role: "profissional",
        professional: {
          profession: request.profession,
          council: request.council,
          registration: request.registration,
          uf: request.uf,
          specialties: request.specialties,
          verifiedAt: now,
        },
      };
      profiles = existing
        ? profiles.map((p) => (p.userId === request.userId ? { ...p, ...verified } : p))
        : [...profiles, verified];
    }
    return { ...s, verifications, profiles };
  });
}

// ---------------------------------------------------------------------------
// Administração das comunidades
// ---------------------------------------------------------------------------

export function needsProfessional(c: Community): boolean {
  return !c.professionalId && (c.status === "pendente" || c.status === "suspensa");
}

export function needsAdminUser(c: Community): boolean {
  return !c.adminUserId && c.status === "suspensa";
}

export function getAdministeredCommunity(
  userId: string,
  communities: Community[],
): Community | undefined {
  return communities.find((c) => c.adminUserId === userId || c.professionalId === userId);
}

export interface RankedProfessional {
  profile: PublicProfile;
  score: number;
  matchesTopic: boolean;
}

/**
 * Profissionais mais habilitados para o tema de uma comunidade: quem atua na
 * categoria dela vem primeiro (desempate por atividade na rede). Só entram
 * profissionais verificados que ainda não administram outra comunidade. Se
 * ninguém atua no tema, a plataforma indica os mais ativos, para a comunidade
 * não ficar parada.
 */
export function rankProfessionalsFor(
  community: Community,
  state: Pick<CommunityState, "profiles" | "communities" | "posts">,
): RankedProfessional[] {
  const eligible = state.profiles
    .filter((p) => p.role === "profissional")
    .filter((p) => !isCommunityAdmin(p.userId, state.communities))
    .filter((p) => !community.formerProfessionalIds?.includes(p.userId))
    .map((profile) => {
      const matchesTopic = !!profile.professional?.specialties.includes(community.category);
      const activity = Math.min(
        20,
        state.posts.filter((post) => post.authorId === profile.userId).length,
      );
      return { profile, matchesTopic, score: (matchesTopic ? 100 : 0) + activity };
    })
    .sort((a, b) => b.score - a.score);

  const matching = eligible.filter((r) => r.matchesTopic);
  return (matching.length > 0 ? matching : eligible).slice(0, INVITE_LIMIT);
}

/** Comunidades que estão convidando este profissional para ser admin profissional. */
export function getProfessionalInvites(
  userId: string,
  state: Pick<CommunityState, "profiles" | "communities" | "posts">,
): Community[] {
  return state.communities.filter(
    (c) =>
      needsProfessional(c) &&
      rankProfessionalsFor(c, state).some((r) => r.profile.userId === userId),
  );
}

function reactivateIfComplete(c: Community): Community {
  return c.adminUserId && c.professionalId ? { ...c, status: "ativa" } : c;
}

/** O profissional aceita ser admin: se a comunidade estava completa de novo, ela passa a existir. */
export function acceptProfessionalInvite(communityId: string, actor: Actor) {
  const state = loadState();
  const community = state.communities.find((c) => c.id === communityId);
  if (!community || !needsProfessional(community)) {
    throw new Error(t("err.noLongerSeeking"));
  }
  if (!isVerifiedProfessional(state.profiles, actor.id)) {
    throw new Error(t("err.onlyVerified"));
  }
  if (isCommunityAdmin(actor.id, state.communities)) {
    throw new Error(t("err.alreadyAdmin"));
  }
  if (!rankProfessionalsFor(community, state).some((r) => r.profile.userId === actor.id)) {
    throw new Error(t("err.notInvited"));
  }

  saveState({
    ...state,
    communities: state.communities.map((c) =>
      c.id === communityId
        ? reactivateIfComplete({
            ...c,
            professionalId: actor.id,
            professionalName: actor.name,
            members: c.members.some((m) => m.userId === actor.id)
              ? c.members
              : [
                  ...c.members,
                  { userId: actor.id, name: actor.name, joinedAt: new Date().toISOString() },
                ],
          })
        : c,
    ),
  });
}

/**
 * Admin deixa a administração (e a comunidade).
 * - Admin usuário de uma comunidade ainda pendente: a comunidade é cancelada.
 * - Caso contrário a comunidade fica suspensa até a plataforma repor o admin.
 */
export function leaveAsAdmin(communityId: string, actor: Actor) {
  update((s) => {
    const community = s.communities.find((c) => c.id === communityId);
    if (!community) return s;
    const isUser = community.adminUserId === actor.id;
    const isPro = community.professionalId === actor.id;
    if (!isUser && !isPro) return s;

    if (isUser && community.status === "pendente") {
      return { ...s, communities: s.communities.filter((c) => c.id !== communityId) };
    }

    return {
      ...s,
      communities: s.communities.map((c) =>
        c.id === communityId
          ? {
              ...c,
              adminUserId: isUser ? undefined : c.adminUserId,
              adminUserName: isUser ? undefined : c.adminUserName,
              professionalId: isPro ? undefined : c.professionalId,
              professionalName: isPro ? undefined : c.professionalName,
              formerProfessionalIds: isPro
                ? [...(c.formerProfessionalIds ?? []), actor.id]
                : c.formerProfessionalIds,
              status: "suspensa" as const,
              members: c.members.filter((m) => m.userId !== actor.id),
            }
          : c,
      ),
    };
  });
}

export interface EngagedMember {
  userId: string;
  name: string;
  score: number;
  posts: number;
  comments: number;
  supports: number;
}

/** Membros mais engajados da comunidade (candidatos a novo admin usuário). */
export function rankEngagedMembers(
  community: Community,
  state: Pick<CommunityState, "profiles" | "communities" | "posts">,
): EngagedMember[] {
  const communityPosts = state.posts.filter((p) => p.communityId === community.id);
  return community.members
    .filter((m) => !isVerifiedProfessional(state.profiles, m.userId))
    .filter((m) => !isCommunityAdmin(m.userId, state.communities))
    .map((m) => {
      const posts = communityPosts.filter((p) => p.authorId === m.userId).length;
      const comments = communityPosts.reduce(
        (n, p) => n + p.comments.filter((c) => c.authorId === m.userId).length,
        0,
      );
      const supports = communityPosts.filter((p) => p.supports.includes(m.userId)).length;
      return {
        userId: m.userId,
        name: m.name,
        posts,
        comments,
        supports,
        score: posts * 3 + comments * 2 + supports,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, CANDIDATE_LIMIT);
}

/** A plataforma indica o novo admin usuário de uma comunidade suspensa. */
export function designateAdminUser(communityId: string, userId: string) {
  const state = loadState();
  const community = state.communities.find((c) => c.id === communityId);
  if (!community || !needsAdminUser(community)) {
    throw new Error(t("err.noNewAdmin"));
  }
  const candidate = rankEngagedMembers(community, state).find((m) => m.userId === userId);
  if (!candidate) {
    throw new Error(t("err.notEligible"));
  }
  saveState({
    ...state,
    communities: state.communities.map((c) =>
      c.id === communityId
        ? reactivateIfComplete({
            ...c,
            adminUserId: candidate.userId,
            adminUserName: candidate.name,
          })
        : c,
    ),
  });
}

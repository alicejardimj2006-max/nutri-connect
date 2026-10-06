// Desafios de hábito no Supabase: lista, participação, passos, dicas e resumo de uma pessoa.
// O que cada pessoa vê (comunidade, perfil privado, bloqueios) é decidido no banco.

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Fns = Database["public"]["Functions"];
type ChallengeRow = Fns["get_challenges"]["Returns"][number];

export interface RemoteChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  badgeIcon: string;
  badgeLabel: string;
  duration: string;
  steps: string[];
  /** Dicas fixas do desafio (as da comunidade vêm de fetchTips). */
  tips: string[];
  communityId?: string;
  communitySlug?: string;
  communityName?: string;
  createdById?: string;
  createdByName?: string;
  themeId?: string;
  /** Posição na trilha de desafios (menor = mais cedo). */
  order: number;
  /** Desafio que precisa ser concluído antes deste. */
  requiredChallengeId?: string;
  participantCount: number;
  completedCount: number;
  /** A pessoa logada participa. */
  joined: boolean;
  /** Passos já concluídos pela pessoa logada. */
  mySteps: number[];
  /** A pessoa logada concluiu. */
  completed: boolean;
}

export interface ChallengeParticipant {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  stepsDone: number;
  completed: boolean;
  joinedAt: string;
}

export interface ChallengeTip {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  text: string;
  createdAt: string;
}

/** Resumo de um desafio na vida de uma pessoa (perfil). */
export interface UserChallenge {
  challengeId: string;
  title: string;
  category: string;
  badgeIcon: string;
  badgeLabel: string;
  stepsTotal: number;
  stepsDone: number;
  completed: boolean;
  completedAt?: string;
  joinedAt: string;
}

function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error("É preciso estar logado.");
  return id;
}

function toChallenge(row: ChallengeRow): RemoteChallenge {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    badgeIcon: row.badge_icon,
    badgeLabel: row.badge_label,
    duration: row.duration,
    steps: row.steps ?? [],
    tips: row.tips ?? [],
    communityId: row.community_id ?? undefined,
    communitySlug: row.community_slug ?? undefined,
    communityName: row.community_name ?? undefined,
    createdById: row.created_by ?? undefined,
    createdByName: row.created_by_name ?? undefined,
    themeId: row.theme_id ?? undefined,
    order: row.position,
    requiredChallengeId: row.required_challenge_id ?? undefined,
    participantCount: row.participant_count,
    completedCount: row.completed_count,
    joined: row.joined,
    mySteps: row.my_steps ?? [],
    completed: !!row.my_completed_at,
  };
}

// ── Leitura ──────────────────────────────────────────────────────────────────

export async function fetchChallenges(communityId?: string): Promise<RemoteChallenge[]> {
  const { data, error } = await supabase.rpc("get_challenges", { p_community: communityId });
  fail(error);
  return (data ?? []).map(toChallenge);
}

export async function fetchChallenge(id: string): Promise<RemoteChallenge | null> {
  const { data, error } = await supabase.rpc("get_challenges", { p_id: id });
  fail(error);
  const row = (data ?? [])[0];
  return row ? toChallenge(row) : null;
}

export async function fetchParticipants(challengeId: string): Promise<ChallengeParticipant[]> {
  const { data, error } = await supabase.rpc("get_challenge_participants", {
    p_challenge: challengeId,
  });
  fail(error);
  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    username: p.username,
    avatarUrl: p.avatar_url,
    stepsDone: p.steps_done,
    completed: p.completed,
    joinedAt: p.joined_at,
  }));
}

export async function fetchTips(challengeId: string): Promise<ChallengeTip[]> {
  const { data, error } = await supabase.rpc("get_challenge_tips", { p_challenge: challengeId });
  fail(error);
  return (data ?? []).map((t) => ({
    id: t.id,
    authorId: t.author_id,
    authorName: t.author_name,
    authorUsername: t.author_username,
    text: t.body,
    createdAt: t.created_at,
  }));
}

/** Desafios de uma pessoa (vazio se o perfil dela for privado e a pessoa logada não for amiga). */
export async function fetchUserChallenges(userId: string): Promise<UserChallenge[]> {
  const { data, error } = await supabase.rpc("user_challenges", { p_user: userId });
  fail(error);
  return (data ?? []).map((c) => ({
    challengeId: c.challenge_id,
    title: c.title,
    category: c.category,
    badgeIcon: c.badge_icon,
    badgeLabel: c.badge_label,
    stepsTotal: c.steps_total,
    stepsDone: c.steps_done,
    completed: c.completed,
    completedAt: c.completed_at ?? undefined,
    joinedAt: c.joined_at,
  }));
}

// ── Participar e avançar ─────────────────────────────────────────────────────

export async function joinChallenge(challengeId: string): Promise<void> {
  const me = await currentUserId();
  const { error } = await supabase
    .from("challenge_participants")
    .insert({ challenge_id: challengeId, user_id: me });
  fail(error);
}

export async function leaveChallenge(challengeId: string): Promise<void> {
  const me = await currentUserId();
  const { error } = await supabase
    .from("challenge_participants")
    .delete()
    .eq("challenge_id", challengeId)
    .eq("user_id", me);
  fail(error);
}

/** Marca ou desmarca um passo. O banco conclui o desafio quando todos os passos estão marcados. */
export async function setStep(
  challengeId: string,
  currentSteps: number[],
  stepIndex: number,
  done: boolean,
): Promise<void> {
  const me = await currentUserId();
  const next = done
    ? [...new Set([...currentSteps, stepIndex])].sort((a, b) => a - b)
    : currentSteps.filter((i) => i !== stepIndex);
  const { error } = await supabase
    .from("challenge_participants")
    .update({ completed_steps: next })
    .eq("challenge_id", challengeId)
    .eq("user_id", me);
  fail(error);
}

export async function addTip(challengeId: string, text: string): Promise<void> {
  const me = await currentUserId();
  const body = text.trim();
  if (!body) throw new Error("Escreva uma dica.");
  const { error } = await supabase
    .from("challenge_tips")
    .insert({ challenge_id: challengeId, author_id: me, body });
  fail(error);
}

export async function deleteTip(tipId: string): Promise<void> {
  const { error } = await supabase.from("challenge_tips").delete().eq("id", tipId);
  fail(error);
}

// Gamificação dos desafios: XP, nível, medalhas, ofensiva e desbloqueio. Cálculos puros sobre
// os desafios que vieram do banco (cada um já traz o progresso da pessoa logada).

import { CHALLENGE_BADGE_TIERS, type ChallengeBadgeTier } from "@/lib/community";
import type { RemoteChallenge } from "./challenges";

const XP_PER_CHALLENGE = 100;
const XP_PER_STEP = 15;

/** XP da pessoa logada nos desafios: 100 por desafio concluído + 15 por passo marcado. */
export function challengeXP(challenges: RemoteChallenge[]): number {
  return challenges.reduce((xp, c) => {
    if (!c.joined) return xp;
    return xp + (c.completed ? XP_PER_CHALLENGE : 0) + c.mySteps.length * XP_PER_STEP;
  }, 0);
}

export function completedCount(challenges: RemoteChallenge[]): number {
  return challenges.filter((c) => c.completed).length;
}

/** Ofensiva simplificada: 2 dias por desafio concluído (+1), no máximo 30; 1 se só participa. */
export function challengeStreak(challenges: RemoteChallenge[]): number {
  const done = completedCount(challenges);
  if (done > 0) return Math.min(done * 2 + 1, 30);
  return challenges.some((c) => c.joined) ? 1 : 0;
}

export interface EarnedBadge extends ChallengeBadgeTier {
  achieved: boolean;
}

/** Medalhas por quantidade de desafios concluídos (todas, marcando as já conquistadas). */
export function earnedBadges(challenges: RemoteChallenge[]): EarnedBadge[] {
  const done = completedCount(challenges);
  return CHALLENGE_BADGE_TIERS.map((tier) => ({ ...tier, achieved: done >= tier.count }));
}

/** Desafios da trilha, do primeiro ao último. */
export function trailChallenges(challenges: RemoteChallenge[]): RemoteChallenge[] {
  return [...challenges].sort((a, b) => a.order - b.order);
}

/** Um desafio está liberado quando o exigido antes dele (se houver) já foi concluído. */
export function isUnlocked(challenge: RemoteChallenge, challenges: RemoteChallenge[]): boolean {
  if (!challenge.requiredChallengeId) return true;
  const required = challenges.find((c) => c.id === challenge.requiredChallengeId);
  if (!required) return true;
  return required.completed;
}

import { loadLocale, localeMeta } from "./i18n";
import { applyRegion } from "./region";
// Tipos e funções puras da camada social (a fonte dos dados é o Supabase: ver src/lib/social/).

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export type PostType = "receita" | "experiencia" | "pergunta" | "geral";

export interface RecipeData {
  prepTime: string;
  servings: string;
  difficulty: "Fácil" | "Médio" | "Difícil";
  ingredients: string[];
  steps: string[];
  category: string;
}

export type PostBlock = "image" | "title" | "text" | "recipe";

/** Ordem dos campos de um post; o título sempre vem antes do texto. */
export function normalizeBlockOrder(order: PostBlock[] | undefined, fallback: PostBlock[]) {
  const result = (order ?? fallback).filter((b, i, arr) => arr.indexOf(b) === i);
  for (const b of fallback) if (!result.includes(b)) result.push(b);
  const t = result.indexOf("title");
  const x = result.indexOf("text");
  if (t !== -1 && x !== -1 && t > x) {
    result.splice(t, 1);
    result.splice(x, 0, "title");
  }
  return result;
}

export interface Post {
  id: string;
  communityId?: string;
  type: PostType;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title?: string;
  text: string;
  image?: string;
  tags: string[];
  createdAt: string;
  pinned: boolean;
  likes: string[]; // retrocompatibilidade
  supports: string[]; // userIds que apoiaram ("Apoiar")
  preparedBy: string[]; // userIds que prepararam a receita ("Eu preparei")
  comments: Comment[];
  themeId?: string;
  recipeData?: RecipeData;
  blockOrder?: PostBlock[];
  // Campos que só vêm do banco (feed real); nos posts locais de comunidade ficam vazios.
  /** Quem pode ver: público ou só amigos. */
  audience?: "publico" | "amigos";
  authorUsername?: string;
  authorRole?: "paciente" | "profissional";
  /** Quando o post vira visível (posts agendados de profissionais). */
  publishAt?: string;
  /** A pessoa logada salvou este post. */
  saved?: boolean;
  /** Oculto para os outros: aguardando a moderação ou reprovado (o autor ainda o vê). */
  hidden?: boolean;
}

/**
 * pendente: criada, aguardando um profissional aceitar ser admin (ainda não existe publicamente).
 * ativa: tem admin usuário e admin profissional.
 * suspensa: já foi ativa, mas perdeu um dos dois admins.
 */
export type CommunityStatus = "pendente" | "ativa" | "suspensa";

export type ProfileRole = "paciente" | "profissional";

/** Dados de um profissional já verificado pela plataforma. */
export interface ProfessionalInfo {
  profession: string;
  council: string;
  registration: string;
  uf: string;
  /** Áreas de atuação, no vocabulário de CATEGORIES (usadas para indicar comunidades). */
  specialties: string[];
  verifiedAt: string;
}

export type VerificationStatus = "em_analise" | "aprovado" | "recusado";

/** Pedido de verificação de perfil profissional, analisado pelos administradores da plataforma. */
export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  fullName: string;
  profession: string;
  council: string;
  registration: string;
  uf: string;
  specialties: string[];
  bio?: string;
  publicLookupUrl?: string;
  /** Foto da carteira/registro profissional (data URL). */
  documentImage: string;
  /** Selfie segurando o documento (data URL). */
  selfieImage: string;
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedById?: string;
  rejectionReason?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  votedUsers: string[];
}

export interface ChallengeTip {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface ChallengeBadgeTier {
  count: number;
  icon: string;
  label: string;
}

/** Distintivos conquistados conforme a quantidade de desafios concluídos. */
export const CHALLENGE_BADGE_TIERS: ChallengeBadgeTier[] = [
  { count: 1, icon: "🥉", label: "Primeiro Passo" },
  { count: 3, icon: "🥈", label: "Constância em Construção" },
  { count: 5, icon: "🥇", label: "Mestre dos Hábitos" },
];

export const JOURNEY_GOALS = [
  "Comer melhor e com prazer",
  "Melhorar minha rotina alimentar",
  "Cozinhar mais em casa",
  "Aprender receitas práticas",
  "Organização de marmitas",
  "Alimentação vegetariana",
  "Ganho de massa muscular",
  "Emagrecimento consciente",
  "Qualidade de vida",
] as const;

export const CATEGORIES = [
  "Educação alimentar",
  "Relação com a comida",
  "Cozinha do dia a dia",
  "Bem-estar e sono",
  "Alimentação em família",
  "Saúde e condições clínicas",
] as const;

export const RECIPE_CATEGORIES = [
  "Todas",
  "Café da manhã",
  "Almoço e Jantar",
  "Lanches práticos",
  "Sobremesas saudáveis",
  "Vegetariano & Vegano",
] as const;

export function formatDate(iso: string) {
  const [loc, options] = applyRegion(localeMeta(loadLocale()).tag, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return new Intl.DateTimeFormat(loc, options).format(new Date(iso));
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Foto de perfil: a enviada pela pessoa ou a das contas de demonstração, quando existir. */
const SEED_AVATARS: Record<string, string> = {
  "00000000-0000-4000-a000-000000000001": "/images/professionals/prof-1.jpg",
  "00000000-0000-4000-a000-000000000002": "/images/professionals/prof-2.jpg",
};

export function getAvatarSrc(userId: string, explicit?: string): string | undefined {
  return explicit ?? SEED_AVATARS[userId];
}

/** Nível do usuário baseado no XP acumulado. */
export function getUserLevel(xp: number): {
  level: number;
  label: string;
  xpForNext: number;
  xpInLevel: number;
} {
  const levels = [
    { threshold: 0, label: "Semente" },
    { threshold: 150, label: "Broto" },
    { threshold: 400, label: "Folha" },
    { threshold: 700, label: "Flor" },
    { threshold: 1100, label: "Fruto" },
    { threshold: 1600, label: "Árvore" },
    { threshold: 2200, label: "Floresta" },
  ];
  let current = levels[0];
  let next = levels[1];
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].threshold) {
      current = levels[i];
      next = levels[i + 1] || { threshold: current.threshold + 500, label: "Mestre" };
      break;
    }
  }
  const level = levels.indexOf(current) + 1;
  const xpInLevel = xp - current.threshold;
  const xpForNext = next.threshold - current.threshold;
  return { level, label: current.label, xpForNext, xpInLevel };
}

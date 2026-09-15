// Comunidades — armazenamento local (mock), pronto para futura integração com banco.
// Esquema espelha as tabelas planejadas: Communities, Community_Members, Posts,
// Comments e Responsible_Professional.

import type { UserRole } from "@/lib/auth";

export interface CommunityMember {
  userId: string;
  name: string;
  role: UserRole;
  joinedAt: string;
}

export interface ResponsibleProfessional {
  userId: string;
  name: string;
  credential: string;
  acceptedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  image?: string;
  createdAt: string;
  pinned: boolean;
  likes: string[];
  comments: Comment[];
}

export interface Community {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  createdById: string;
  createdByName: string;
  createdByRole: UserRole;
  status: "ativa" | "aguardando";
  responsible: ResponsibleProfessional | null;
  members: CommunityMember[];
  createdAt: string;
}

export interface PublicProfile {
  userId: string;
  name: string;
  role: UserRole;
  bio: string;
  credential?: string;
}

export interface CommunityState {
  communities: Community[];
  posts: Post[];
  profiles: PublicProfile[];
}

export const CATEGORIES = [
  "Educação alimentar",
  "Relação com a comida",
  "Cozinha do dia a dia",
  "Bem-estar e sono",
  "Alimentação em família",
  "Saúde e condições clínicas",
] as const;

const KEY = "nutriconnect_community";
const EVENT = "community-change";

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function id() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

const NUTRI_ID = "seed-nutri-maria";
const PAC_ID = "seed-paciente-ana";

function seed(): CommunityState {
  const now = Date.now();
  const iso = (minus: number) => new Date(now - minus).toISOString();

  const nutri: ResponsibleProfessional = {
    userId: NUTRI_ID,
    name: "Dra. Maria Lorena",
    credential: "CRN-3 12345",
    acceptedAt: iso(86400000 * 20),
  };

  const communities: Community[] = [
    {
      id: "c-educacao",
      slug: "educacao-alimentar",
      name: "Educação Alimentar no dia a dia",
      description:
        "Um espaço para aprender sobre alimentos, rótulos e escolhas possíveis — sem culpa e sem regras rígidas.",
      category: "Educação alimentar",
      createdById: NUTRI_ID,
      createdByName: "Dra. Maria Lorena",
      createdByRole: "nutricionista",
      status: "ativa",
      responsible: nutri,
      members: [
        { userId: NUTRI_ID, name: "Dra. Maria Lorena", role: "nutricionista", joinedAt: iso(86400000 * 20) },
        { userId: PAC_ID, name: "Ana Prado", role: "paciente", joinedAt: iso(86400000 * 12) },
      ],
      createdAt: iso(86400000 * 20),
    },
    {
      id: "c-relacao",
      slug: "relacao-com-a-comida",
      name: "Relação saudável com a comida",
      description:
        "Conversas acolhedoras sobre comer com atenção, fome emocional e autocuidado. Moderado por profissional.",
      category: "Relação com a comida",
      createdById: NUTRI_ID,
      createdByName: "Dra. Maria Lorena",
      createdByRole: "nutricionista",
      status: "ativa",
      responsible: nutri,
      members: [
        { userId: NUTRI_ID, name: "Dra. Maria Lorena", role: "nutricionista", joinedAt: iso(86400000 * 15) },
      ],
      createdAt: iso(86400000 * 15),
    },
    {
      id: "c-cozinha",
      slug: "cozinha-de-domingo",
      name: "Cozinha de domingo",
      description:
        "Receitas simples, preparo da semana e trocas de ideias sobre o que colocar no prato.",
      category: "Cozinha do dia a dia",
      createdById: PAC_ID,
      createdByName: "Ana Prado",
      createdByRole: "paciente",
      status: "aguardando",
      responsible: null,
      members: [{ userId: PAC_ID, name: "Ana Prado", role: "paciente", joinedAt: iso(86400000 * 3) }],
      createdAt: iso(86400000 * 3),
    },
  ];

  const posts: Post[] = [
    {
      id: "p-1",
      communityId: "c-educacao",
      authorId: NUTRI_ID,
      authorName: "Dra. Maria Lorena",
      authorRole: "nutricionista",
      text: "Orientação fixada: aqui falamos de comida como cuidado. Evitamos classificar alimentos como bons ou ruins e não compartilhamos números de peso ou calorias.",
      createdAt: iso(86400000 * 10),
      pinned: true,
      likes: [PAC_ID],
      comments: [],
    },
    {
      id: "p-2",
      communityId: "c-educacao",
      authorId: PAC_ID,
      authorName: "Ana Prado",
      authorRole: "paciente",
      text: "Comecei a montar meu prato com metade de vegetais e me sinto mais satisfeita durante a tarde. Alguém mais testou isso?",
      createdAt: iso(86400000 * 2),
      pinned: false,
      likes: [NUTRI_ID],
      comments: [
        {
          id: "cm-1",
          postId: "p-2",
          authorId: NUTRI_ID,
          authorName: "Dra. Maria Lorena",
          authorRole: "nutricionista",
          text: "Que bom te ler, Ana. Variar cores e texturas costuma ajudar bastante na saciedade.",
          createdAt: iso(86400000),
        },
      ],
    },
    {
      id: "p-3",
      communityId: "c-relacao",
      authorId: NUTRI_ID,
      authorName: "Dra. Maria Lorena",
      authorRole: "nutricionista",
      text: "Convite da semana: antes de comer, respire fundo três vezes e observe como você está se sentindo. Sem cobrança, só observação.",
      createdAt: iso(86400000 * 4),
      pinned: false,
      likes: [],
      comments: [],
    },
  ];

  const profiles: PublicProfile[] = [
    {
      userId: NUTRI_ID,
      name: "Dra. Maria Lorena",
      role: "nutricionista",
      bio: "Nutricionista clínica há 10 anos, com foco em educação alimentar e cuidado sem julgamento.",
      credential: "CRN-3 12345",
    },
    {
      userId: PAC_ID,
      name: "Ana Prado",
      role: "paciente",
      bio: "Aprendendo a cozinhar mais em casa e a ouvir meus sinais de fome e saciedade.",
    },
  ];

  return { communities, posts, profiles };
}

export function loadState(): CommunityState {
  if (typeof window === "undefined") return { communities: [], posts: [], profiles: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const initial = seed();
      localStorage.setItem(KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw) as CommunityState;
  } catch {
    return seed();
  }
}

export function saveState(state: CommunityState) {
  localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(EVENT));
}

export const COMMUNITY_EVENT = EVENT;

function update(fn: (state: CommunityState) => CommunityState) {
  saveState(fn(loadState()));
}

export interface Actor {
  id: string;
  name: string;
  role: UserRole;
}

export function createCommunity(input: {
  name: string;
  description: string;
  category: string;
  actor: Actor;
  credential?: string;
}) {
  const community: Community = {
    id: id(),
    slug: slugify(input.name) || id(),
    name: input.name,
    description: input.description,
    category: input.category,
    createdById: input.actor.id,
    createdByName: input.actor.name,
    createdByRole: input.actor.role,
    status: input.actor.role === "nutricionista" ? "ativa" : "aguardando",
    responsible:
      input.actor.role === "nutricionista"
        ? {
            userId: input.actor.id,
            name: input.actor.name,
            credential: input.credential ?? "Profissional verificado",
            acceptedAt: new Date().toISOString(),
          }
        : null,
    members: [
      { userId: input.actor.id, name: input.actor.name, role: input.actor.role, joinedAt: new Date().toISOString() },
    ],
    createdAt: new Date().toISOString(),
  };
  update((s) => ({ ...s, communities: [community, ...s.communities] }));
  return community;
}

export function assumeResponsibility(communityId: string, actor: Actor, credential = "Profissional verificado") {
  update((s) => ({
    ...s,
    communities: s.communities.map((c) =>
      c.id !== communityId || c.responsible
        ? c
        : {
            ...c,
            status: "ativa",
            responsible: {
              userId: actor.id,
              name: actor.name,
              credential,
              acceptedAt: new Date().toISOString(),
            },
            members: c.members.some((m) => m.userId === actor.id)
              ? c.members
              : [...c.members, { userId: actor.id, name: actor.name, role: actor.role, joinedAt: new Date().toISOString() }],
          },
    ),
  }));
}

export function toggleMembership(communityId: string, actor: Actor) {
  update((s) => ({
    ...s,
    communities: s.communities.map((c) => {
      if (c.id !== communityId) return c;
      const isMember = c.members.some((m) => m.userId === actor.id);
      return {
        ...c,
        members: isMember
          ? c.members.filter((m) => m.userId !== actor.id)
          : [...c.members, { userId: actor.id, name: actor.name, role: actor.role, joinedAt: new Date().toISOString() }],
      };
    }),
  }));
}

export function createPost(input: { communityId: string; actor: Actor; text: string; image?: string }) {
  const post: Post = {
    id: id(),
    communityId: input.communityId,
    authorId: input.actor.id,
    authorName: input.actor.name,
    authorRole: input.actor.role,
    text: input.text,
    ...(input.image ? { image: input.image } : {}),
    createdAt: new Date().toISOString(),
    pinned: false,
    likes: [],
    comments: [],
  };
  update((s) => ({ ...s, posts: [post, ...s.posts] }));
  return post;
}

export function toggleLike(postId: string, userId: string) {
  update((s) => ({
    ...s,
    posts: s.posts.map((p) =>
      p.id === postId
        ? { ...p, likes: p.likes.includes(userId) ? p.likes.filter((u) => u !== userId) : [...p.likes, userId] }
        : p,
    ),
  }));
}

export function addComment(postId: string, actor: Actor, text: string) {
  update((s) => ({
    ...s,
    posts: s.posts.map((p) =>
      p.id === postId
        ? {
            ...p,
            comments: [
              ...p.comments,
              {
                id: id(),
                postId,
                authorId: actor.id,
                authorName: actor.name,
                authorRole: actor.role,
                text,
                createdAt: new Date().toISOString(),
              },
            ],
          }
        : p,
    ),
  }));
}

export function removeComment(postId: string, commentId: string) {
  update((s) => ({
    ...s,
    posts: s.posts.map((p) =>
      p.id === postId ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) } : p,
    ),
  }));
}

export function removePost(postId: string) {
  update((s) => ({ ...s, posts: s.posts.filter((p) => p.id !== postId) }));
}

export function togglePin(postId: string) {
  update((s) => ({
    ...s,
    posts: s.posts.map((p) => (p.id === postId ? { ...p, pinned: !p.pinned } : p)),
  }));
}

export function upsertProfile(profile: PublicProfile) {
  update((s) => ({
    ...s,
    profiles: s.profiles.some((p) => p.userId === profile.userId)
      ? s.profiles.map((p) => (p.userId === profile.userId ? { ...p, ...profile } : p))
      : [...s.profiles, profile],
  }));
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

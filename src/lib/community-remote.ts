// Comunidades, desafios e Tema da Semana vindos do banco (Supabase). Os dados chegam no mesmo
// formato que as telas já usavam quando tudo vivia no navegador (src/lib/community.ts), então as
// telas continuam iguais — mas agora o que uma pessoa faz (entrar numa comunidade, participar de um
// desafio, votar na enquete) é visto por todos e não some ao trocar de aparelho.
import { supabase } from "@/integrations/supabase/client";
import type { Challenge, ChallengeTip, Community, PollOption, WeeklyTheme } from "@/lib/community";

/** Avisa as telas para buscarem de novo depois de uma ação. */
export const COMMUNITY_REMOTE_EVENT = "nc-community-remote";
const changed = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(COMMUNITY_REMOTE_EVENT));
};

const fail = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

async function names(ids: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter(Boolean))];
  const map = new Map<string, string>();
  if (!unique.length) return map;
  const { data } = await supabase.from("profiles").select("id, name").in("id", unique);
  for (const p of data ?? []) map.set(p.id, p.name);
  return map;
}

/** Capas padrão quando a comunidade não tem foto própria. */
const COVERS = [
  "/images/communities/friends-dinner.jpg",
  "/images/experiences/cooking.jpg",
  "/images/hero/kitchen-prep.jpg",
];
export function communityCover(c: Pick<Community, "coverImage" | "slug">) {
  if (c.coverImage) return c.coverImage;
  let h = 0;
  for (const ch of c.slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return COVERS[h % COVERS.length];
}

export interface CommunityData {
  communities: Community[];
  challenges: Challenge[];
}

export async function fetchCommunityData(): Promise<CommunityData> {
  const [comms, members, challenges, participants, tips] = await Promise.all([
    supabase.rpc("get_communities", {}),
    supabase.from("community_members").select("community_id, user_id, joined_at").limit(5000),
    supabase.from("challenges").select("*").order("position", { ascending: true }),
    supabase
      .from("challenge_participants")
      .select("challenge_id, user_id, completed_steps, completed_at")
      .limit(10000),
    supabase
      .from("challenge_tips")
      .select("id, challenge_id, author_id, body, created_at")
      .order("created_at", { ascending: false })
      .limit(2000),
  ]);
  fail(comms.error);
  fail(challenges.error);

  const people = await names([
    ...(members.data ?? []).map((m) => m.user_id),
    ...(tips.data ?? []).map((t) => t.author_id),
    ...(comms.data ?? []).map((c) => c.created_by),
    ...(challenges.data ?? []).map((c) => c.created_by ?? ""),
  ]);

  const byCommunity = new Map<string, Community["members"]>();
  for (const m of members.data ?? []) {
    const list = byCommunity.get(m.community_id) ?? [];
    list.push({
      userId: m.user_id,
      name: people.get(m.user_id) || "Membro",
      joinedAt: m.joined_at,
    });
    byCommunity.set(m.community_id, list);
  }

  const communities: Community[] = (comms.data ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description ?? "",
    category: c.category,
    objective: c.objective ?? undefined,
    coverImage: c.cover_image_url ?? undefined,
    createdById: c.created_by ?? "",
    createdByName: people.get(c.created_by) ?? "",
    adminUserId: c.admin_user_id ?? undefined,
    adminUserName: c.admin_name ?? undefined,
    professionalId: c.professional_id ?? undefined,
    professionalName: c.professional_name ?? undefined,
    formerProfessionalIds: c.former_professional_ids ?? [],
    status: c.status,
    members: byCommunity.get(c.id) ?? [],
    postCount: c.post_count ?? 0,
    createdAt: c.created_at,
  }));

  const partsBy = new Map<string, NonNullable<typeof participants.data>>();
  for (const p of participants.data ?? []) {
    const list = partsBy.get(p.challenge_id) ?? [];
    list.push(p);
    partsBy.set(p.challenge_id, list);
  }
  const tipsBy = new Map<string, ChallengeTip[]>();
  for (const t of tips.data ?? []) {
    const list = tipsBy.get(t.challenge_id) ?? [];
    list.push({
      id: t.id,
      authorId: t.author_id,
      authorName: people.get(t.author_id) ?? "",
      text: t.body,
      createdAt: t.created_at,
    });
    tipsBy.set(t.challenge_id, list);
  }

  const list: Challenge[] = (challenges.data ?? []).map((c) => {
    const parts = partsBy.get(c.id) ?? [];
    const progress: Record<string, number[]> = {};
    for (const p of parts) progress[p.user_id] = p.completed_steps ?? [];
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      badgeIcon: c.badge_icon,
      badgeLabel: c.badge_label,
      duration: c.duration,
      steps: c.steps ?? [],
      tips: c.tips ?? [],
      participants: parts.map((p) => p.user_id),
      completedBy: parts.filter((p) => p.completed_at).map((p) => p.user_id),
      progress,
      communityTips: tipsBy.get(c.id) ?? [],
      themeId: c.theme_id ?? undefined,
      order: c.position,
      requiredChallengeId: c.required_challenge_id ?? undefined,
      communityId: c.community_id ?? undefined,
      createdByProfessionalId: c.created_by ?? undefined,
      createdByProfessionalName: c.created_by ? people.get(c.created_by) : undefined,
    };
  });

  return { communities, challenges: list };
}

// ─── Tema da semana ──────────────────────────────────────────────────────────

type Translations = Record<string, Record<string, string> | undefined>;

function weekLabel(weekStart: string, locale: string) {
  const start = new Date(`${weekStart}T12:00:00`);
  const end = new Date(start.getTime() + 6 * 86_400_000);
  const fmt = (d: Date, withMonth: boolean) =>
    d.toLocaleDateString(
      locale,
      withMonth ? { day: "numeric", month: "long" } : { day: "numeric" },
    );
  const sameMonth = start.getMonth() === end.getMonth();
  const prefix =
    { "pt-BR": "Semana de", en: "Week of", es: "Semana del", fr: "Semaine du" }[locale] ??
    "Semana de";
  const join = { "pt-BR": "a", en: "–", es: "al", fr: "au" }[locale] ?? "a";
  return `${prefix} ${fmt(start, !sameMonth)} ${join} ${fmt(end, true)}`;
}

export interface PastTheme {
  id: string;
  title: string;
  week: string;
  summary: string;
  recipesCount: number;
  reflectionsCount: number;
}

export interface ThemeData {
  current: WeeklyTheme | null;
  past: PastTheme[];
}

export async function fetchThemeData(
  locale: string,
  userId: string | undefined,
  withPast = false,
): Promise<ThemeData> {
  const { data: themes, error } = await supabase
    .from("weekly_themes")
    .select(
      "id, week_start, status, title, subtitle, description, badge, question, poll_question, translations, featured_post_ids",
    )
    .in("status", ["ativo", "encerrado"])
    .order("week_start", { ascending: false })
    .limit(4);
  fail(error);
  const tx = (t: { translations: unknown }, key: string, base: string | null) => {
    if (locale === "pt-BR") return base ?? "";
    return (t.translations as Translations | null)?.[locale]?.[key] || base || "";
  };

  const active = (themes ?? []).find((t) => t.status === "ativo") ?? null;
  let current: WeeklyTheme | null = null;
  if (active) {
    const [opts, results, challenge] = await Promise.all([
      supabase
        .from("theme_poll_options")
        .select("id, text, translations, position")
        .eq("theme_id", active.id)
        .order("position"),
      supabase.rpc("theme_poll_results", { p_theme: active.id }),
      supabase.from("challenges").select("id").eq("theme_id", active.id).limit(1).maybeSingle(),
    ]);
    const resultBy = new Map((results.data ?? []).map((r) => [r.option_id, r]));
    const options: PollOption[] = (opts.data ?? []).map((o) => {
      const r = resultBy.get(o.id);
      const own =
        locale === "pt-BR"
          ? undefined
          : (o.translations as Record<string, string> | null)?.[locale];
      return {
        id: o.id,
        text: own || o.text,
        votes: r?.votes ?? 0,
        votedUsers: r?.mine && userId ? [userId] : [],
      };
    });
    current = {
      id: active.id,
      title: tx(active, "title", active.title),
      subtitle: tx(active, "subtitle", active.subtitle),
      description: tx(active, "description", active.description),
      badge: tx(active, "badge", active.badge),
      currentWeek: weekLabel(active.week_start, locale),
      questionOfTheWeek: tx(active, "question", active.question),
      poll: { id: active.id, question: tx(active, "poll_question", active.poll_question), options },
      challengeId: challenge.data?.id,
      featuredRecipeIds: active.featured_post_ids ?? [],
    };
  }

  const pastRows = withPast
    ? (themes ?? []).filter((t) => t.status === "encerrado").slice(0, 3)
    : [];
  const past: PastTheme[] = await Promise.all(
    pastRows.map(async (t) => {
      // Contagens são um detalhe: se falharem, o tema aparece mesmo assim.
      const count = (q: PromiseLike<{ count: number | null }>) =>
        Promise.resolve(q).then(
          (r) => r.count ?? 0,
          () => 0,
        );
      const [recipesN, othersN] = await Promise.all([
        count(
          supabase
            .from("posts")
            .select("id", { count: "exact", head: true })
            .eq("theme_id", t.id)
            .eq("type", "receita"),
        ),
        count(
          supabase
            .from("posts")
            .select("id", { count: "exact", head: true })
            .eq("theme_id", t.id)
            .neq("type", "receita"),
        ),
      ]);
      return {
        id: t.id,
        title: tx(t, "title", t.title),
        week: weekLabel(t.week_start, locale),
        summary: tx(t, "description", t.description),
        recipesCount: recipesN,
        reflectionsCount: othersN,
      };
    }),
  );
  return { current, past };
}

// ─── Ações ───────────────────────────────────────────────────────────────────

async function run(fn: () => PromiseLike<{ error: { message: string } | null }>) {
  const { error } = await fn();
  fail(error);
  changed();
}

export const joinCommunity = (communityId: string, userId: string) =>
  run(() =>
    supabase.from("community_members").insert({ community_id: communityId, user_id: userId }),
  );

export const leaveCommunity = (communityId: string, userId: string) =>
  run(() =>
    supabase
      .from("community_members")
      .delete()
      .eq("community_id", communityId)
      .eq("user_id", userId),
  );

/** Envia a capa (data URL do editor de imagem) ao Storage e devolve o endereço público. */
async function uploadCover(dataUrl: string): Promise<string> {
  const { data: auth } = await supabase.auth.getSession();
  const uid = auth.session?.user.id;
  if (!uid) throw new Error("É preciso estar logado.");
  const [head, body] = dataUrl.split(",");
  const mime = /data:([^;]+)/.exec(head)?.[1] ?? "image/jpeg";
  const bytes = atob(body);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  const path = `${uid}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("community-covers")
    .upload(path, new Blob([arr], { type: mime }), { contentType: mime, upsert: false });
  fail(error);
  return supabase.storage.from("community-covers").getPublicUrl(path).data.publicUrl;
}

export async function createCommunityRemote(input: {
  name: string;
  description: string;
  category: string;
  objective?: string;
  coverImage?: string;
}) {
  const cover = input.coverImage?.startsWith("data:")
    ? await uploadCover(input.coverImage)
    : input.coverImage;
  const { data, error } = await supabase.rpc("create_community", {
    p_name: input.name,
    p_description: input.description,
    p_category: input.category,
    p_objective: input.objective || undefined,
    p_cover_image_url: cover || undefined,
  });
  fail(error);
  changed();
  return data as { id: string; slug: string } | null;
}

export const acceptCommunityInvite = (communityId: string) =>
  run(() => supabase.rpc("accept_community_professional", { p_community: communityId }));

export const leaveCommunityAdmin = (communityId: string) =>
  run(() => supabase.rpc("leave_community_admin", { p_community: communityId }));

export const designateCommunityAdmin = (communityId: string, userId: string) =>
  run(() =>
    supabase.rpc("designate_community_admin_user", { p_community: communityId, p_user: userId }),
  );

export async function myCommunityInvites(): Promise<string[]> {
  const { data, error } = await supabase.rpc("my_community_invites");
  fail(error);
  return ((data ?? []) as { id: string }[]).map((c) => c.id);
}

export async function communityCandidates(communityId: string) {
  const { data, error } = await supabase.rpc("community_candidates", { p_community: communityId });
  fail(error);
  return (data ?? []) as { user_id: string; score: number; matches_topic: boolean }[];
}

export const joinChallenge = (challengeId: string, userId: string) =>
  run(() =>
    supabase.from("challenge_participants").insert({ challenge_id: challengeId, user_id: userId }),
  );

export const leaveChallenge = (challengeId: string, userId: string) =>
  run(() =>
    supabase
      .from("challenge_participants")
      .delete()
      .eq("challenge_id", challengeId)
      .eq("user_id", userId),
  );

export const setChallengeSteps = (challengeId: string, userId: string, steps: number[]) =>
  run(() =>
    supabase
      .from("challenge_participants")
      .update({ completed_steps: [...new Set(steps)].sort((a, b) => a - b) })
      .eq("challenge_id", challengeId)
      .eq("user_id", userId),
  );

export const addChallengeTipRemote = (challengeId: string, userId: string, text: string) =>
  run(() =>
    supabase
      .from("challenge_tips")
      .insert({ challenge_id: challengeId, author_id: userId, body: text.trim().slice(0, 1000) }),
  );

export const votePoll = (themeId: string, optionId: string, userId: string) =>
  run(() =>
    supabase
      .from("theme_poll_votes")
      .upsert(
        { theme_id: themeId, option_id: optionId, user_id: userId },
        { onConflict: "theme_id,user_id" },
      ),
  );

export const togglePostPin = (postId: string) =>
  run(() => supabase.rpc("toggle_post_pin", { p_post: postId }));

/** Marca/desmarca um passo; quem ainda não participava entra no desafio junto. */
export async function toggleChallengeStepRemote(
  challengeId: string,
  userId: string,
  current: number[],
  index: number,
  joined: boolean,
) {
  const next = current.includes(index) ? current.filter((i) => i !== index) : [...current, index];
  if (joined) return setChallengeSteps(challengeId, userId, next);
  return run(() =>
    supabase
      .from("challenge_participants")
      .insert({ challenge_id: challengeId, user_id: userId, completed_steps: next }),
  );
}

/** Mensagem de erro amigável para os toasts. */
export const errorText = (err: unknown) => (err instanceof Error ? err.message : String(err));

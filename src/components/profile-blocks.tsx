// Os blocos que cada pessoa pode colocar na própria página de perfil. Cada bloco só mostra dados
// que a pessoa já tem direito de exibir (a privacidade continua valendo: perfil privado não mostra
// blocos de conteúdo para quem não é amigo).
import { Link } from "@tanstack/react-router";
import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import {
  Award,
  CalendarCheck,
  ChefHat,
  ExternalLink,
  Flame,
  Heart,
  ImageIcon,
  Link2,
  MessageSquareQuote,
  Quote,
  Smile,
  Sparkles,
  Stethoscope,
  StickyNote,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PostCard } from "@/components/community-cards";
import { useTr } from "@/components/appearance-editor";
import { useI18n } from "@/hooks/use-i18n";
import { td } from "@/lib/i18n/data";
import { LEVEL_LABEL_KEYS } from "@/lib/i18n/content";
import { getUserLevel, type Challenge, type Community, type Post } from "@/lib/community";
import type { getProfessionalInfo } from "@/lib/community-admin";
import type { PublicProfile } from "@/lib/social/api";
import type { Names } from "@/lib/appearance-data";
import { BLOCK_SIZES, type Block, type BlockType } from "@/lib/profile-page";

/** Tudo que os blocos precisam saber sobre o perfil que está sendo exibido. */
export interface ProfileData {
  userId: string;
  name: string;
  bio: string;
  isSelf: boolean;
  isProfessional: boolean;
  remote: PublicProfile | null;
  posts: Post[];
  recipes: Post[];
  challenges: Challenge[];
  communities: Community[];
  xp: number;
  streak: number;
  professionalInfo: ReturnType<typeof getProfessionalInfo> | null;
}

const DataContext = createContext<ProfileData | null>(null);
export const ProfileDataProvider = DataContext.Provider;
function useData() {
  const d = useContext(DataContext);
  if (!d) throw new Error("ProfileDataProvider ausente");
  return d;
}

// ── Catálogo (usado no menu "Adicionar bloco" e para o título padrão) ───────────────────────────

export const BLOCK_INFO: Record<BlockType, { icon: LucideIcon; name: Names; hint: Names }> = {
  stats: {
    icon: Sparkles,
    name: ["Números", "Numbers", "Números", "Chiffres"],
    hint: ["Receitas, desafios, publicações e conexões.", "Recipes, challenges, posts and connections.", "Recetas, desafíos, publicaciones y conexiones.", "Recettes, défis, publications et liens."],
  },
  posts: {
    icon: Sparkles,
    name: ["Publicações", "Posts", "Publicaciones", "Publications"],
    hint: ["Suas últimas publicações no Espaço.", "Your latest posts.", "Tus últimas publicaciones.", "Vos dernières publications."],
  },
  recipes: {
    icon: ChefHat,
    name: ["Receitas preparadas", "Recipes made", "Recetas preparadas", "Recettes préparées"],
    hint: ["Receitas que você preparou.", "Recipes you made.", "Recetas que preparaste.", "Recettes que vous avez préparées."],
  },
  challenges: {
    icon: Award,
    name: ["Desafios", "Challenges", "Desafíos", "Défis"],
    hint: ["Desafios em andamento.", "Challenges in progress.", "Desafíos en curso.", "Défis en cours."],
  },
  communities: {
    icon: Users,
    name: ["Comunidades", "Communities", "Comunidades", "Communautés"],
    hint: ["Comunidades de que você participa.", "Communities you are part of.", "Comunidades de las que participas.", "Communautés dont vous faites partie."],
  },
  level: {
    icon: Flame,
    name: ["Nível e sequência", "Level and streak", "Nivel y racha", "Niveau et série"],
    hint: ["Seu nível, experiência e dias seguidos.", "Your level, XP and streak.", "Tu nivel, experiencia y racha.", "Votre niveau, XP et série."],
  },
  pro: {
    icon: Stethoscope,
    name: ["Profissional", "Professional", "Profesional", "Professionnel"],
    hint: ["Registro, especialidades e agendamento.", "Registration, specialties and booking.", "Registro, especialidades y reservas.", "Inscription, spécialités et réservation."],
  },
  about: {
    icon: User,
    name: ["Sobre mim", "About me", "Sobre mí", "À propos de moi"],
    hint: ["Conte sua história com suas palavras.", "Tell your story in your own words.", "Cuenta tu historia con tus palabras.", "Racontez votre histoire."],
  },
  text: {
    icon: StickyNote,
    name: ["Texto livre", "Free text", "Texto libre", "Texte libre"],
    hint: ["Um espaço para escrever o que quiser.", "A space to write anything.", "Un espacio para escribir lo que quieras.", "Un espace pour écrire ce que vous voulez."],
  },
  quote: {
    icon: Quote,
    name: ["Frase", "Quote", "Frase", "Citation"],
    hint: ["Uma frase que te representa.", "A quote that represents you.", "Una frase que te representa.", "Une citation qui vous représente."],
  },
  image: {
    icon: ImageIcon,
    name: ["Foto", "Photo", "Foto", "Photo"],
    hint: ["Uma foto com legenda.", "A photo with a caption.", "Una foto con leyenda.", "Une photo avec légende."],
  },
  links: {
    icon: Link2,
    name: ["Links", "Links", "Enlaces", "Liens"],
    hint: ["Seus sites e redes.", "Your sites and networks.", "Tus sitios y redes.", "Vos sites et réseaux."],
  },
  favorites: {
    icon: Heart,
    name: ["Favoritos", "Favorites", "Favoritos", "Favoris"],
    hint: ["Alimentos, pratos e coisas que você ama.", "Foods, dishes and things you love.", "Alimentos, platos y cosas que amas.", "Aliments, plats et choses que vous aimez."],
  },
  sticker: {
    icon: Smile,
    name: ["Adesivo", "Sticker", "Adhesivo", "Autocollant"],
    hint: ["Um emoji grande para decorar.", "A big emoji to decorate.", "Un emoji grande para decorar.", "Un grand emoji pour décorer."],
  },
};

/** Blocos sem título visível por natureza. */
const NO_TITLE: BlockType[] = ["stats", "quote", "image", "sticker"];

// ── Moldura comum ───────────────────────────────────────────────────────────────────────────────

const PAD = { p: "p-3", m: "p-5", g: "p-7" } as const;

function frameStyle(block: Block): CSSProperties {
  const s = block.style;
  const style: CSSProperties = {};
  // Fundo: cor própria (com transparência) ou o cartão do tema (também com transparência).
  const base = s.bg ?? "var(--card)";
  style.background =
    s.bgOpacity >= 100 ? base : `color-mix(in srgb, ${base} ${s.bgOpacity}%, transparent)`;
  if (s.radius !== null) style.borderRadius = s.radius;
  if (s.textColor) style.color = s.textColor;
  if (s.border === "none") style.borderColor = "transparent";
  else if (s.border === "accent") style.borderColor = "var(--accent)";
  style.textAlign = s.align;
  return style;
}

export function BlockFrame({ block, children }: { block: Block; children: ReactNode }) {
  const tr = useTr();
  const info = BLOCK_INFO[block.type];
  const showTitle = !NO_TITLE.includes(block.type) && !block.opts.hideTitle;
  const title = block.title || tr(info.name);
  const border =
    block.style.border === "none"
      ? "border"
      : block.style.border === "dashed"
        ? "border border-dashed"
        : block.style.border === "accent"
          ? "border-2"
          : "border";
  return (
    <section
      className={`profile-block flex h-full min-h-0 w-full flex-col overflow-hidden ${border} border-border/80 ${
        block.style.radius === null ? "rounded-3xl" : ""
      } ${block.style.shadow ? "shadow-xs" : ""} ${PAD[block.style.pad]}`}
      style={frameStyle(block)}
    >
      {showTitle && (
        <h3 className="mb-3 flex shrink-0 items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground [color:inherit]">
          <info.icon className="h-4 w-4 shrink-0 text-accent" />
          <span className="truncate">{title}</span>
        </h3>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin]">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="py-3 text-center text-xs text-muted-foreground">{children}</p>;
}

// ── Blocos ─────────────────────────────────────────────────────────────────────────────────────

function StatsBlock() {
  const d = useData();
  const { t } = useI18n();
  const tr = useTr();
  const tiles: { label: string; value: number | string; icon: LucideIcon }[] = [
    { label: t("profile.stat.recipes"), value: d.recipes.length, icon: ChefHat },
    { label: t("profile.stat.challenges"), value: d.challenges.length, icon: Award },
    { label: t("profile.stat.shares"), value: d.posts.length, icon: Sparkles },
    d.isProfessional
      ? { label: tr(["Seguidores", "Followers", "Seguidores", "Abonnés"]), value: d.remote?.followers_count ?? 0, icon: Users }
      : { label: tr(["Amigos", "Friends", "Amigos", "Amis"]), value: d.remote?.friends_count ?? 0, icon: Users },
  ];
  return (
    <div className="grid h-full grid-cols-2 items-center gap-3 sm:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="min-w-0 rounded-2xl bg-secondary/50 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[11px] font-medium text-muted-foreground">{tile.label}</span>
            <tile.icon className="h-4 w-4 shrink-0 text-accent" />
          </div>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">{tile.value}</p>
        </div>
      ))}
    </div>
  );
}

function PostList({ posts, block, empty }: { posts: Post[]; block: Block; empty: string }) {
  if (posts.length === 0) return <Empty>{empty}</Empty>;
  const list = posts.slice(0, block.opts.count);
  return (
    <div className={block.opts.view === "grid" ? "grid gap-4 xl:grid-cols-2" : "space-y-4"}>
      {list.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  );
}

function ChallengesBlock({ block }: { block: Block }) {
  const d = useData();
  const { t } = useI18n();
  if (d.challenges.length === 0) return <Empty>{d.isSelf ? t("profile.noChallengesSelf") : t("profile.noChallengesOther")}</Empty>;
  return (
    <div className="space-y-3">
      {d.challenges.slice(0, block.opts.count).map((c) => {
        const done = (c.progress?.[d.userId] || []).length;
        const total = c.steps.length;
        return (
          <Link
            key={c.id}
            to="/desafios/$challengeId"
            params={{ challengeId: c.id }}
            className="block rounded-xl bg-secondary/50 p-3 text-xs transition hover:bg-secondary"
          >
            <div className="flex items-center justify-between gap-2 font-bold text-foreground">
              <span className="truncate">
                {c.badgeIcon} {c.title}
              </span>
              {c.completedBy.includes(d.userId) && <Award className="h-3.5 w-3.5 shrink-0 text-primary" />}
            </div>
            {total > 0 && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-card">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((done / total) * 100)}%` }} />
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}

function CommunitiesBlock({ block }: { block: Block }) {
  const d = useData();
  const { t } = useI18n();
  if (d.communities.length === 0) return <Empty>{t("hub.noCommunities")}</Empty>;
  return (
    <ul className="space-y-1.5">
      {d.communities.slice(0, block.opts.count + 4).map((c) => (
        <li key={c.id}>
          <Link
            to="/comunidades/$slug"
            params={{ slug: c.slug }}
            className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-secondary"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              <Users className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">{c.name}</span>
              <span className="block text-[11px] text-muted-foreground">
                {c.members.length} {t("comunidades.members")}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function LevelBlock() {
  const d = useData();
  const { t } = useI18n();
  const lvl = getUserLevel(d.xp);
  const pct = Math.min(100, Math.round((lvl.xpInLevel / lvl.xpForNext) * 100));
  return (
    <div>
      <p className="font-display text-2xl font-bold text-foreground">{t("hub.level").replace("{n}", String(lvl.level))}</p>
      <p className="text-xs text-muted-foreground">{t(LEVEL_LABEL_KEYS[lvl.label] ?? "hub.level.1")}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {lvl.xpInLevel}/{lvl.xpForNext} XP
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-accent">
          <Flame className="h-3.5 w-3.5" /> {d.streak} {t("hub.streakDays")}
        </span>
      </div>
    </div>
  );
}

function ProBlock() {
  const d = useData();
  const { t } = useI18n();
  const tr = useTr();
  if (!d.isProfessional || !d.professionalInfo) {
    return <Empty>{tr(["Este bloco aparece para profissionais verificados.", "This block is for verified professionals.", "Este bloque es para profesionales verificados.", "Ce bloc est réservé aux professionnels vérifiés."])}</Empty>;
  }
  const info = d.professionalInfo;
  return (
    <div>
      <p className="text-xs font-semibold text-accent">
        {td(info.profession)} · {info.council} {info.registration}/{info.uf}
      </p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {info.specialties.map((sp) => (
          <li key={sp} className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium text-secondary-foreground">
            {td(sp)}
          </li>
        ))}
      </ul>
      {!d.isSelf && (
        <Link
          to="/profissionais/$professionalId"
          params={{ professionalId: d.userId }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90"
        >
          <CalendarCheck className="h-4 w-4" /> {t("profile.bookConsultation")}
        </Link>
      )}
    </div>
  );
}

function TextBody({ block, placeholder }: { block: Block; placeholder: string }) {
  const d = useData();
  const text = block.text || (block.type === "about" ? d.bio : "");
  if (!text) return <Empty>{placeholder}</Empty>;
  return <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{text}</p>;
}

function QuoteBlock({ block }: { block: Block }) {
  const tr = useTr();
  return (
    <figure className="flex h-full flex-col justify-center gap-2">
      <MessageSquareQuote
        className={`h-6 w-6 shrink-0 text-accent ${block.style.align === "center" ? "self-center" : block.style.align === "right" ? "self-end" : "self-start"}`}
      />
      <blockquote className="break-words font-display text-xl font-semibold leading-snug">
        {block.text || tr(["Escreva uma frase que te represente.", "Write a quote that represents you.", "Escribe una frase que te represente.", "Écrivez une citation qui vous représente."])}
      </blockquote>
      {block.title && <figcaption className="text-xs opacity-70">— {block.title}</figcaption>}
    </figure>
  );
}

function ImageBlock({ block }: { block: Block }) {
  const tr = useTr();
  if (!block.image) {
    return (
      <div className="grid h-full place-items-center rounded-2xl bg-secondary/40 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          {tr(["Sem foto ainda", "No photo yet", "Aún sin foto", "Pas encore de photo"])}
        </span>
      </div>
    );
  }
  return (
    <figure className="flex h-full flex-col gap-2">
      <img src={block.image} alt={block.text || ""} className="min-h-0 w-full flex-1 rounded-xl object-cover" loading="lazy" />
      {block.text && <figcaption className="shrink-0 text-xs opacity-80">{block.text}</figcaption>}
    </figure>
  );
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function LinksBlock({ block }: { block: Block }) {
  const tr = useTr();
  const items = block.items.filter((i) => i.url);
  if (items.length === 0) return <Empty>{tr(["Adicione seus links.", "Add your links.", "Añade tus enlaces.", "Ajoutez vos liens."])}</Empty>;
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i}>
          <a
            href={it.url}
            target="_blank"
            rel="noopener noreferrer nofollow ugc"
            className="flex items-center gap-3 rounded-xl bg-secondary/50 px-3 py-2.5 text-sm font-semibold transition hover:bg-secondary"
          >
            <span className="text-lg">{it.emoji || "🔗"}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate">{it.label || hostOf(it.url)}</span>
              <span className="block truncate text-[11px] font-normal opacity-60">{hostOf(it.url)}</span>
            </span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60" />
          </a>
        </li>
      ))}
    </ul>
  );
}

function FavoritesBlock({ block }: { block: Block }) {
  const tr = useTr();
  if (block.items.length === 0) return <Empty>{tr(["Adicione o que você ama.", "Add what you love.", "Añade lo que amas.", "Ajoutez ce que vous aimez."])}</Empty>;
  return (
    <ul className="flex flex-wrap gap-2" style={{ justifyContent: block.style.align === "center" ? "center" : block.style.align === "right" ? "flex-end" : "flex-start" }}>
      {block.items.map((it, i) => (
        <li key={i} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
          <span>{it.emoji}</span>
          {it.label}
        </li>
      ))}
    </ul>
  );
}

function StickerBlock({ block }: { block: Block }) {
  return (
    <div className="grid h-full place-items-center overflow-hidden" style={{ fontSize: Math.max(28, Math.min(block.h * 40 * 0.62, block.w * 52)) }}>
      <span className="leading-none">{block.opts.emoji || "🥑"}</span>
    </div>
  );
}

/** O conteúdo de um bloco, já dentro da moldura. */
export function BlockView({ block }: { block: Block }) {
  const d = useData();
  const { t } = useI18n();
  const tr = useTr();
  let body: ReactNode;
  switch (block.type) {
    case "stats":
      body = <StatsBlock />;
      break;
    case "posts":
      body = <PostList posts={d.posts} block={block} empty={d.isSelf ? t("profile.noPostsSelf") : t("profile.noPostsOther")} />;
      break;
    case "recipes":
      body = <PostList posts={d.recipes} block={block} empty={d.isSelf ? t("profile.noRecipesSelf") : t("profile.noRecipesOther")} />;
      break;
    case "challenges":
      body = <ChallengesBlock block={block} />;
      break;
    case "communities":
      body = <CommunitiesBlock block={block} />;
      break;
    case "level":
      body = <LevelBlock />;
      break;
    case "pro":
      body = <ProBlock />;
      break;
    case "about":
      body = <TextBody block={block} placeholder={tr(["Conte um pouco sobre você.", "Tell a little about yourself.", "Cuenta un poco sobre ti.", "Parlez un peu de vous."])} />;
      break;
    case "text":
      body = <TextBody block={block} placeholder={tr(["Escreva aqui o que quiser.", "Write whatever you like here.", "Escribe aquí lo que quieras.", "Écrivez ici ce que vous voulez."])} />;
      break;
    case "quote":
      body = <QuoteBlock block={block} />;
      break;
    case "image":
      body = <ImageBlock block={block} />;
      break;
    case "links":
      body = <LinksBlock block={block} />;
      break;
    case "favorites":
      body = <FavoritesBlock block={block} />;
      break;
    case "sticker":
      body = <StickerBlock block={block} />;
      break;
  }
  return <BlockFrame block={block}>{body}</BlockFrame>;
}

/** Tamanho mínimo de cada tipo (usado ao redimensionar). */
export const minSize = (type: BlockType) => ({ w: BLOCK_SIZES[type].minW, h: BLOCK_SIZES[type].minH });

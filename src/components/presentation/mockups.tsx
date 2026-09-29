import { useState } from "react";
import {
  Award,
  BadgeCheck,
  Bell,
  BookOpen,
  Check,
  Crown,
  Flame,
  Heart,
  Home,
  Lock,
  MessageCircle,
  Moon,
  Plus,
  Search,
  Share2,
  Star,
  Sun,
  Users,
} from "lucide-react";
import { Mascot } from "@/components/mascots";
import { useI18n } from "@/hooks/use-i18n";
import { ACCENT_PRESETS, HEADING_FONTS } from "@/lib/appearance";
import type { DictKey } from "@/lib/i18n";
import type { PresentationCopy } from "@/lib/i18n/presentation";

// Mini-versões das telas do NutriConnect usadas no tour da apresentação. São estáticas (sem dados
// do usuário) para funcionar antes do login, mas usam as mesmas cores, fontes e textos do site.

type Mock = PresentationCopy["mock"];

/** Moldura de celular. */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[248px] shrink-0 rounded-[2.4rem] border-[9px] border-[#2b2620] bg-[#2b2620] shadow-2xl sm:w-[268px]">
      <div className="absolute left-1/2 top-1.5 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-[#2b2620]" />
      <div className="relative flex h-[480px] flex-col overflow-hidden rounded-[1.8rem] bg-background text-left sm:h-[520px]">
        {children}
      </div>
    </div>
  );
}

/** Moldura de navegador (telas de computador). */
export function BrowserFrame({ children, url }: { children: React.ReactNode; url: string }) {
  return (
    <div className="mx-auto w-full max-w-[560px] overflow-hidden rounded-2xl border border-border bg-card text-left shadow-2xl">
      <div className="flex items-center gap-2 border-b border-border bg-secondary px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#e0685a]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#e5b64a]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#7fb35a]" />
        <span className="ml-2 flex-1 truncate rounded-full bg-background px-3 py-0.5 text-[10px] text-muted-foreground">
          nutriconnect.app/{url}
        </span>
      </div>
      <div className="bg-background">{children}</div>
    </div>
  );
}

function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-logo-serif font-bold tracking-tight text-foreground ${className}`}>
      Nutri<span className="text-accent">Connect</span>
    </span>
  );
}

function AppTopBar() {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4 pt-3">
      <Bell className="h-4 w-4 text-foreground" />
      <Logo className="text-sm" />
      <Search className="h-4 w-4 text-foreground" />
    </div>
  );
}

function AppBottomBar({ active }: { active: "home" | "communities" | "challenges" }) {
  const cls = (on: boolean) =>
    `flex flex-1 flex-col items-center gap-0.5 py-2 ${on ? "text-accent" : "text-muted-foreground"}`;
  return (
    <div className="mt-auto flex shrink-0 items-center border-t border-border bg-background/95 text-[8px] font-medium">
      <span className={cls(active === "home")}>
        <Home className="h-4 w-4" />
      </span>
      <span className={cls(active === "communities")}>
        <Users className="h-4 w-4" />
      </span>
      <span className="flex flex-1 justify-center">
        <span className="grid h-9 w-9 -translate-y-2 place-items-center rounded-full bg-accent text-accent-foreground shadow-soft">
          <Plus className="h-4 w-4" />
        </span>
      </span>
      <span className={cls(active === "challenges")}>
        <Award className="h-4 w-4" />
      </span>
      <span className={cls(false)}>
        <span className="grid h-4 w-4 place-items-center rounded-full bg-primary-soft text-[8px] font-bold text-primary">
          J
        </span>
      </span>
    </div>
  );
}

function Avatar({ letter, tone = "primary" }: { letter: string; tone?: "primary" | "accent" }) {
  return (
    <span
      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
        tone === "primary" ? "bg-primary-soft text-primary" : "bg-accent-soft text-accent"
      }`}
    >
      {letter}
    </span>
  );
}

// ───────────────────────── Espaço de Hoje ─────────────────────────

export function FeedMock({ mock }: { mock: Mock }) {
  const { t } = useI18n();
  const [liked, setLiked] = useState(false);
  const tabs: DictKey[] = ["espaco.tab.geral", "espaco.tab.amigos", "espaco.tab.profissionais"];
  return (
    <PhoneFrame>
      <AppTopBar />
      <div className="flex gap-1 px-3 py-2">
        {tabs.map((k, i) => (
          <span
            key={k}
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
              i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {t(k)}
          </span>
        ))}
      </div>
      <div className="flex-1 space-y-3 overflow-hidden px-3">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center gap-2 p-2.5">
            <Avatar letter="A" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold leading-tight">{mock.post1Name}</p>
              <p className="text-[9px] text-muted-foreground">{mock.post1Time}</p>
            </div>
          </div>
          <img src="/images/experiences/cooking.jpg" alt="" className="h-28 w-full object-cover" />
          <p className="px-2.5 pt-2 text-[10px] leading-snug">{mock.post1Text}</p>
          <div className="flex items-center gap-3 px-2.5 py-2 text-[10px] text-muted-foreground">
            <button
              type="button"
              onClick={() => setLiked((v) => !v)}
              className={`flex items-center gap-1 transition ${liked ? "text-accent" : ""}`}
            >
              <Heart className={`h-3.5 w-3.5 ${liked ? "nc-pop fill-current" : ""}`} />
              {liked ? 25 : 24}
            </button>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" /> 6
            </span>
            <Share2 className="ml-auto h-3.5 w-3.5" />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-2.5 shadow-card">
          <div className="flex items-center gap-2">
            <Avatar letter="C" tone="accent" />
            <div className="min-w-0">
              <p className="flex items-center gap-1 text-[11px] font-semibold leading-tight">
                {mock.post2Name}
                <BadgeCheck className="h-3 w-3 text-accent" aria-label={t("profile.verifiedPro")} />
              </p>
              <p className="text-[9px] text-muted-foreground">{mock.post2Time}</p>
            </div>
          </div>
          <p className="mt-2 text-[10px] leading-snug">{mock.post2Text}</p>
        </div>
      </div>
      <AppBottomBar active="home" />
    </PhoneFrame>
  );
}

// ───────────────────────── Perfil e níveis ─────────────────────────

const LEVEL_ICONS = ["🌰", "🌱", "🍃", "🌸", "🍎", "🌳", "🌲", "👑"];

export function ProfileMock({ mock }: { mock: Mock }) {
  const { t } = useI18n();
  const current = 3;
  return (
    <BrowserFrame url="perfil">
      <div className="h-16 bg-gradient-to-r from-primary to-chart-5" />
      <div className="px-5 pb-5">
        <div className="flex items-start gap-3">
          <span className="-mt-7 grid h-14 w-14 shrink-0 place-items-center rounded-full border-4 border-background bg-primary-soft text-xl font-bold text-primary">
            J
          </span>
          <div className="min-w-0 pt-2">
            <p className="font-display text-base font-bold leading-tight">{mock.profileName}</p>
            <p className="truncate text-[11px] text-muted-foreground">{mock.profileBio}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-[10px] text-muted-foreground">
              {t("hub.level").replace("{n}", String(current))}
            </p>
            <p className="font-display text-sm font-bold">
              {LEVEL_ICONS[current - 1]} {t("hub.level.3")}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="flex items-center gap-1 text-sm font-bold text-accent">
              <Flame className="nc-flame h-4 w-4" /> 12
            </p>
            <p className="text-[10px] text-muted-foreground">{t("hub.streakDays")}</p>
          </div>
          <div className="col-span-2 rounded-xl border border-border bg-card p-3 sm:col-span-1">
            <p className="text-sm font-bold">18</p>
            <p className="text-[10px] text-muted-foreground">{t("profile.stat.recipes")}</p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-border bg-card p-3">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>
              {mock.nextLevel}: {t("hub.level.4")}
            </span>
            <span>640 / 900 XP</span>
          </div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-secondary">
            <div className="nc-stripes h-full w-[71%] rounded-full bg-accent" />
          </div>
          <div className="mt-3 flex justify-between">
            {LEVEL_ICONS.map((icon, i) => (
              <span
                key={icon}
                title={t(`hub.level.${i + 1}` as DictKey)}
                className={`grid h-7 w-7 place-items-center rounded-full text-sm ${
                  i < current ? "bg-primary-soft" : "bg-secondary opacity-50 grayscale"
                } ${i === current - 1 ? "ring-2 ring-accent" : ""}`}
              >
                {icon}
              </span>
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

// ───────────────────────── Personalização ─────────────────────────

const PREVIEW_FONTS = HEADING_FONTS.filter((f) =>
  ["classica", "elegante", "suave", "marcante"].includes(f.id),
);

/** Painel interativo: as escolhas mudam só a pré-visualização, nunca o tema do site. */
export function AppearanceMock({
  mock,
  accent: controlledAccent,
  onAccent,
}: {
  mock: Mock;
  /** Opcional: o slide acompanha a cor escolhida para tingir o fundo. */
  accent?: string;
  onAccent?: (value: string) => void;
}) {
  const [ownAccent, setOwnAccent] = useState<string>(ACCENT_PRESETS[0].value);
  const accent = controlledAccent ?? ownAccent;
  const setAccent = onAccent ?? setOwnAccent;
  const [font, setFont] = useState(PREVIEW_FONTS[0].id);
  const [dark, setDark] = useState(false);
  const fontCss =
    PREVIEW_FONTS.find((f) => f.id === font)?.css ??
    '"Libre Baskerville", ui-serif, Georgia, serif';
  const bg = dark ? "#1f1b15" : "#faf7f0";
  const fg = dark ? "#f4eee2" : "#342d24";
  const card = dark ? "#27221b" : "#fffdfa";

  return (
    <div className="mx-auto grid w-full max-w-[560px] gap-4 sm:grid-cols-[1fr_1.1fr]">
      <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-card">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">
          {mock.tryIt}
        </p>
        <div>
          <p className="mb-2 text-xs font-semibold">{mock.accentLabel}</p>
          <div className="flex flex-wrap gap-2">
            {ACCENT_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setAccent(p.value)}
                aria-label={p.name}
                aria-pressed={accent === p.value}
                title={p.name}
                className={`h-7 w-7 rounded-full transition hover:scale-110 ${
                  accent === p.value ? "ring-2 ring-foreground ring-offset-2 ring-offset-card" : ""
                }`}
                style={{ background: p.value }}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold">{mock.fontLabel}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {PREVIEW_FONTS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFont(f.id)}
                aria-pressed={font === f.id}
                className={`rounded-lg border px-2 py-1.5 text-sm transition ${
                  font === f.id
                    ? "border-accent bg-accent-soft"
                    : "border-border hover:bg-secondary"
                }`}
                style={{ fontFamily: f.css ?? '"Libre Baskerville", ui-serif, Georgia, serif' }}
              >
                Aa
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold">{mock.modeLabel}</p>
          <div className="flex rounded-full bg-secondary p-1 text-xs">
            <button
              type="button"
              onClick={() => setDark(false)}
              aria-pressed={!dark}
              className={`flex flex-1 items-center justify-center gap-1 rounded-full py-1.5 ${
                !dark ? "bg-card font-semibold shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Sun className="h-3.5 w-3.5" /> {mock.light}
            </button>
            <button
              type="button"
              onClick={() => setDark(true)}
              aria-pressed={dark}
              className={`flex flex-1 items-center justify-center gap-1 rounded-full py-1.5 ${
                dark ? "bg-card font-semibold shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Moon className="h-3.5 w-3.5" /> {mock.dark}
            </button>
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl border border-border p-4 shadow-card transition-colors duration-300"
        style={{ background: bg, color: fg }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider opacity-60">
          {mock.preview}
        </p>
        <p
          className="mt-2 text-xl font-bold leading-tight"
          style={{ fontFamily: fontCss, color: fg }}
        >
          Nutri<span style={{ color: accent }}>Connect</span>
        </p>
        <div className="mt-3 rounded-xl p-3" style={{ background: card }}>
          <div className="flex items-center gap-2">
            <span
              className="grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold text-white"
              style={{ background: accent }}
            >
              J
            </span>
            <span className="text-xs font-semibold" style={{ fontFamily: fontCss }}>
              {mock.profileName}
            </span>
          </div>
          <p className="mt-2 text-[11px] leading-snug opacity-80">{mock.previewText}</p>
          <span
            className="mt-3 inline-block rounded-full px-3 py-1.5 text-[11px] font-semibold text-white transition-colors"
            style={{ background: accent }}
          >
            {mock.previewButton}
          </span>
        </div>
        <div className="mt-3 flex gap-1.5">
          {[0.9, 0.6, 0.35].map((o) => (
            <span
              key={o}
              className="h-1.5 flex-1 rounded-full"
              style={{ background: accent, opacity: o }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Trilhas ─────────────────────────

export function TrailMock({ mock }: { mock: Mock }) {
  const [kid, setKid] = useState(false);
  // Deslocamento horizontal de cada parada (caminho em zigue-zague, como no mapa real).
  const offsets = [0, 46, 0, -46];
  return (
    <PhoneFrame>
      <AppTopBar />
      <div className="flex items-center gap-1.5 px-3 pt-2">
        <button
          type="button"
          onClick={() => setKid(false)}
          aria-pressed={!kid}
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
            !kid ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}
        >
          {mock.adultProfile}
        </button>
        <button
          type="button"
          onClick={() => setKid(true)}
          aria-pressed={kid}
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
            kid ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}
        >
          {mock.kidProfile}
        </button>
        <span className="ml-auto flex items-center gap-2 text-[10px] font-bold">
          <span className="flex items-center gap-0.5 text-accent">
            <Flame className="h-3 w-3" /> 12
          </span>
          <span className="flex items-center gap-0.5 text-rose-500" title={mock.lives}>
            <Heart className="h-3 w-3 fill-current" /> 5
          </span>
        </span>
      </div>
      <div className="mx-3 mt-2 rounded-xl bg-primary px-3 py-2 text-primary-foreground">
        <p className="text-[10px] font-semibold opacity-90">{mock.trailUnit}</p>
      </div>
      <div
        className={`relative flex-1 overflow-hidden transition-colors duration-500 ${
          kid ? "bg-[#e7f4dc]" : "bg-[#f1ecdf]"
        }`}
      >
        <div className="flex flex-col items-center gap-4 pt-5">
          {mock.trailStops.map((name, i) => {
            const done = i < 2;
            const current = i === 2;
            const golden = i === 0;
            return (
              <div
                key={name}
                className="flex flex-col items-center"
                style={{ transform: `translateX(${offsets[i]}px)` }}
              >
                <span
                  className={`relative grid h-12 w-12 place-items-center rounded-full border-b-4 text-white ${
                    golden
                      ? "nc-gold-shine border-[#b45309] bg-[#f5b82e]"
                      : done
                        ? "border-[#3f4726] bg-primary"
                        : current
                          ? "border-[#984420] bg-accent"
                          : "border-[#b9b0a0] bg-[#d6cfc2]"
                  }`}
                >
                  {current && (
                    <span className="nc-ring absolute inset-0 rounded-full bg-accent/50" />
                  )}
                  {golden ? (
                    <Crown className="h-5 w-5" />
                  ) : done ? (
                    <Check className="h-5 w-5" />
                  ) : current ? (
                    <Star className="h-5 w-5 fill-current" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                </span>
                <span className="mt-1 max-w-[90px] truncate text-center text-[9px] font-semibold text-[#4a4033]">
                  {name}
                </span>
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-2 right-1">
          <Mascot id={kid ? "lipe" : "nina"} mood="talk" size={kid ? 58 : 64} key={String(kid)} />
        </div>
      </div>
      <AppBottomBar active="challenges" />
    </PhoneFrame>
  );
}

// ───────────────────────── Comunidades ─────────────────────────

const COMMUNITY_IMAGES = [
  "/images/communities/friends-dinner.jpg",
  "/images/hero/kitchen-prep.jpg",
  "/images/recipes/default-recipe.jpg",
];

export function CommunitiesMock({ mock }: { mock: Mock }) {
  const [joined, setJoined] = useState<number[]>([0]);
  const toggle = (i: number) =>
    setJoined((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));
  return (
    <BrowserFrame url="comunidades">
      <div className="grid gap-3 p-4 sm:grid-cols-3">
        {mock.communities.map((c, i) => {
          const on = joined.includes(i);
          return (
            <div
              key={c.name}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-card"
            >
              <img src={COMMUNITY_IMAGES[i]} alt="" className="h-20 w-full object-cover" />
              <div className="p-3">
                <p className="font-display text-xs font-bold leading-tight">{c.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Users className="h-3 w-3" /> {c.members}
                </p>
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-pressed={on}
                  className={`mt-2 w-full rounded-full py-1.5 text-[10px] font-semibold transition ${
                    on
                      ? "bg-primary-soft text-primary"
                      : "bg-accent text-accent-foreground hover:bg-accent/90"
                  }`}
                >
                  {on ? `✓ ${mock.joined}` : mock.join}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </BrowserFrame>
  );
}

// ───────────────────────── Desafios ─────────────────────────

export function ChallengesMock({ mock }: { mock: Mock }) {
  const [checked, setChecked] = useState(false);
  const doneDays = checked ? 4 : 3;
  return (
    <PhoneFrame>
      <AppTopBar />
      <div className="flex-1 space-y-3 overflow-hidden p-3">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <img
            src="/images/challenges/salad-bowl.jpg"
            alt=""
            className="h-24 w-full object-cover"
          />
          <div className="p-3">
            <p className="font-display text-sm font-bold leading-tight">{mock.challengeTitle}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {mock.challengeParticipants} · +50 XP
            </p>
            <div className="mt-3 flex justify-between">
              {mock.days.map((d, i) => (
                <span key={i} className="flex flex-col items-center gap-1">
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold transition ${
                      i < doneDays
                        ? "bg-primary text-primary-foreground"
                        : i === doneDays
                          ? "border-2 border-dashed border-accent text-accent"
                          : "bg-secondary text-muted-foreground"
                    } ${checked && i === 3 ? "nc-pop" : ""}`}
                  >
                    {i < doneDays ? <Check className="h-3.5 w-3.5" /> : "💧"}
                  </span>
                  <span className="text-[8px] text-muted-foreground">{d}</span>
                </span>
              ))}
            </div>
            <p className="mt-3 text-[10px] font-semibold text-primary">{mock.challengeProgress}</p>
            <button
              type="button"
              onClick={() => setChecked(true)}
              disabled={checked}
              className={`mt-2 w-full rounded-full py-2 text-[11px] font-semibold transition ${
                checked
                  ? "bg-primary-soft text-primary"
                  : "bg-accent text-accent-foreground hover:bg-accent/90"
              }`}
            >
              {checked ? `🎉 ${mock.checkedIn}` : mock.checkIn}
            </button>
          </div>
        </div>
        <div className="flex -space-x-2">
          {["A", "B", "C", "D", "E"].map((l, i) => (
            <span
              key={l}
              className={`grid h-7 w-7 place-items-center rounded-full border-2 border-background text-[10px] font-bold ${
                i % 2 ? "bg-accent-soft text-accent" : "bg-primary-soft text-primary"
              }`}
            >
              {l}
            </span>
          ))}
          <span className="grid h-7 place-items-center rounded-full border-2 border-background bg-secondary px-2 text-[9px] font-semibold text-muted-foreground">
            +233
          </span>
        </div>
      </div>
      <AppBottomBar active="challenges" />
    </PhoneFrame>
  );
}

// ───────────────────────── Receitas, Explorar e Tema da Semana ─────────────────────────

export function DiscoverMock({ mock }: { mock: Mock }) {
  const { t } = useI18n();
  const [prepared, setPrepared] = useState(false);
  const [vote, setVote] = useState<number | null>(null);
  const base = [42, 35, 23];
  const votes = base.map((v, i) => v + (vote === i ? 1 : 0));
  const total = votes.reduce((a, b) => a + b, 0);
  return (
    <BrowserFrame url="explorar">
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-[11px] text-muted-foreground">
          <Search className="h-3.5 w-3.5" /> {mock.search}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
            <img
              src="/images/recipes/roasted-veg.jpg"
              alt=""
              className="h-24 w-full object-cover"
            />
            <div className="p-3">
              <p className="font-display text-xs font-bold">{mock.recipeTitle}</p>
              <p className="text-[10px] text-muted-foreground">{mock.recipeMeta}</p>
              <button
                type="button"
                onClick={() => setPrepared((v) => !v)}
                aria-pressed={prepared}
                className={`mt-2 w-full rounded-full py-1.5 text-[10px] font-semibold transition ${
                  prepared
                    ? "bg-primary-soft text-primary"
                    : "bg-accent text-accent-foreground hover:bg-accent/90"
                }`}
              >
                {prepared ? t("recipes.iPreparedDone") : t("recipes.iPrepared")}
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 shadow-card">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
              <BookOpen className="h-3 w-3" /> {mock.weekly}
            </p>
            <p className="mt-1.5 font-display text-xs font-bold leading-snug">
              {mock.pollQuestion}
            </p>
            <div className="mt-2 space-y-1.5">
              {mock.pollOptions.map((opt, i) => {
                const pct = Math.round((votes[i] / total) * 100);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setVote(i)}
                    aria-pressed={vote === i}
                    className={`relative block w-full overflow-hidden rounded-lg border px-2 py-1.5 text-left text-[10px] transition ${
                      vote === i ? "border-accent" : "border-border hover:bg-secondary"
                    }`}
                  >
                    {vote !== null && (
                      <span
                        className="absolute inset-y-0 left-0 bg-accent-soft transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    )}
                    <span className="relative flex justify-between gap-2">
                      <span>{opt}</span>
                      {vote !== null && <span className="font-semibold">{pct}%</span>}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[9px] text-muted-foreground">
              {total} {t("theme.votes")}
            </p>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

import { ArrowLeft, ChevronRight, Palette, RotateCcw, Type, Volume2 } from "lucide-react";
import { Accessibility, LayoutDashboard, Shapes, UserSquare } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useAppearance } from "@/hooks/use-appearance";
import { useI18n } from "@/hooks/use-i18n";
import type { DictKey } from "@/lib/i18n";
import { DEFAULT_APPEARANCE, type Appearance } from "@/lib/appearance";
import {
  AccessSection,
  ColorsSection,
  LayoutSection,
  ProfileSection,
  ShapesSection,
  SoundsSection,
  TextSection,
} from "./personalization-sections";

export const CARD_IDS = [
  "cores",
  "texto",
  "formatos",
  "sons",
  "layout",
  "acessibilidade",
  "perfil",
] as const;
export type CardId = (typeof CARD_IDS)[number];

interface CardDef {
  id: CardId;
  icon: ComponentType<{ className?: string }>;
  title: DictKey;
  hint: DictKey;
  section: ComponentType;
  summary: (a: Appearance, t: (k: DictKey) => string) => ReactNode;
}

const chip = "rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-foreground";

const CARDS: CardDef[] = [
  {
    id: "cores",
    icon: Palette,
    title: "pz.card.colors",
    hint: "pz.card.colorsHint",
    section: ColorsSection,
    summary: (a, t) => (
      <>
        <span className="h-5 w-5 rounded-full border border-border" style={{ background: a.accent }} />
        <span className="h-5 w-5 rounded-full border border-border" style={{ background: a.primary }} />
        <span className={chip}>{t(`ap.mode.${a.mode}` as DictKey)}</span>
      </>
    ),
  },
  {
    id: "texto",
    icon: Type,
    title: "pz.card.text",
    hint: "pz.card.textHint",
    section: TextSection,
    summary: (a) => <span className={chip}>Aa · {a.textScale}%</span>,
  },
  {
    id: "formatos",
    icon: Shapes,
    title: "pz.card.shapes",
    hint: "pz.card.shapesHint",
    section: ShapesSection,
    summary: (a) => (
      <>
        <span
          className="h-5 w-8 border-2 border-foreground/40 bg-secondary"
          style={{ borderRadius: `${a.cornerRadius / 2}px` }}
        />
        <span className={chip}>{a.cornerRadius}px</span>
      </>
    ),
  },
  {
    id: "sons",
    icon: Volume2,
    title: "pz.card.sounds",
    hint: "pz.card.soundsHint",
    section: SoundsSection,
    summary: (a, t) => <span className={chip}>{a.soundsOn ? t("pz.on") : t("pz.off")}</span>,
  },
  {
    id: "layout",
    icon: LayoutDashboard,
    title: "pz.card.layout",
    hint: "pz.card.layoutHint",
    section: LayoutSection,
    summary: (a, t) => (
      <>
        <span className={chip}>{t(`pz.layout.${a.contentWidth}` as DictKey)}</span>
        <span className={chip}>{t(`pz.home.${a.homePage}` as DictKey)}</span>
      </>
    ),
  },
  {
    id: "acessibilidade",
    icon: Accessibility,
    title: "pz.card.access",
    hint: "pz.card.accessHint",
    section: AccessSection,
    summary: (a, t) => {
      const active = [
        a.reduceMotion,
        a.highContrast,
        a.readableFont,
        a.strongFocus,
        a.underlineLinks,
        a.letterSpacing > 0,
        a.lineHeight > 0,
      ].filter(Boolean).length;
      return <span className={chip}>{active > 0 ? `${active} ${t("pz.active")}` : t("pz.default")}</span>;
    },
  },
  {
    id: "perfil",
    icon: UserSquare,
    title: "pz.card.profile",
    hint: "pz.card.profileHint",
    section: ProfileSection,
    summary: (a, t) => (
      <>
        <span className={chip}>{t(a.cardStyle === "compact" ? "pz.profile.compact" : "pz.profile.classic")}</span>
        <span className={chip}>{t(a.avatarShape === "square" ? "pz.profile.square" : "pz.profile.round")}</span>
      </>
    ),
  },
];

/** Prévia ao vivo: usa as mesmas variáveis que o site inteiro, então reflete cada mudança. */
function Preview() {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {t("ap.preview")}
      </p>
      <h3 className="mt-1 font-display text-lg font-bold text-foreground">{t("ap.previewTitle")}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t("ap.previewText")}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground">
          {t("ap.accentButton")}
        </span>
        <span className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">
          {t("ap.primaryColorSample")}
        </span>
        <span className="rounded-full bg-accent-soft px-4 py-1.5 text-xs font-semibold text-accent">
          {t("ap.softDetail")}
        </span>
        <span className="avatar-shape grid h-8 w-8 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
          NC
        </span>
      </div>
    </div>
  );
}

/**
 * Painel de personalização em cartões por tipo. Sem cartão escolhido mostra a grade; com um
 * cartão escolhido mostra as opções dele. As escolhas valem na hora e ficam salvas na conta.
 */
export function PersonalizationPanel({
  card,
  onSelect,
}: {
  card: CardId | undefined;
  onSelect: (id: CardId | undefined) => void;
}) {
  const { appearance: a, reset } = useAppearance();
  const { t } = useI18n();
  const isDefault = JSON.stringify(a) === JSON.stringify(DEFAULT_APPEARANCE);
  const current = CARDS.find((c) => c.id === card);

  return (
    <div className="space-y-5">
      <Preview />

      {current ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onSelect(undefined)}
              className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> {t("pz.back")}
            </button>
            <p className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
              <current.icon className="h-4 w-4 text-accent" /> {t(current.title)}
            </p>
          </div>
          <current.section />
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">{t("pz.synced")}</p>
            <button
              type="button"
              onClick={reset}
              disabled={isDefault}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:cursor-default disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t("ap.restore")}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CARDS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                className="group flex cursor-pointer flex-col gap-3 rounded-2xl border border-border/70 bg-card p-5 text-left shadow-xs transition hover:border-accent/50 hover:shadow-card"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent">
                    <c.icon className="h-5 w-5" />
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5" />
                </div>
                <div>
                  <p className="font-display text-base font-bold text-foreground">{t(c.title)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t(c.hint)}</p>
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-1.5">{c.summary(a, t)}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

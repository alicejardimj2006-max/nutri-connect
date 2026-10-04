import {
  Accessibility,
  ArrowLeft,
  ChevronRight,
  Copy,
  LayoutDashboard,
  Palette,
  RotateCcw,
  Shapes,
  Type,
  UserSquare,
  Volume2,
} from "lucide-react";
import { useState, type ComponentType, type ReactNode } from "react";
import { toast } from "sonner";
import { useAppearance } from "@/hooks/use-appearance";
import { useI18n } from "@/hooks/use-i18n";
import type { DictKey } from "@/lib/i18n";
import {
  DEFAULT_APPEARANCE,
  sanitizeAppearance,
  saveAppearance,
  type Appearance,
} from "@/lib/appearance";
import { pickName, type Names } from "@/lib/appearance-data";
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

type Summary = (a: Appearance, t: (k: DictKey) => string, tr: (n: Names) => string) => ReactNode;

interface CardDef {
  id: CardId;
  icon: ComponentType<{ className?: string }>;
  title: DictKey;
  hint: DictKey;
  section: ComponentType;
  summary: Summary;
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
        <span
          className="h-5 w-5 rounded-full border border-border"
          style={{ background: a.accent }}
        />
        <span
          className="h-5 w-5 rounded-full border border-border"
          style={{ background: a.primary }}
        />
        <span className={chip}>
          {t(`ap.mode.${a.mode === "schedule" ? "system" : a.mode}` as DictKey)}
        </span>
      </>
    ),
  },
  {
    id: "texto",
    icon: Type,
    title: "pz.card.text",
    hint: "pz.card.textHint",
    section: TextSection,
    summary: (a) => (
      <>
        <span className={chip}>Aa · {a.textScale}%</span>
        <span className={chip}>{a.headingFont}</span>
      </>
    ),
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
        <span className={chip}>{a.buttonShape}</span>
      </>
    ),
  },
  {
    id: "sons",
    icon: Volume2,
    title: "pz.card.sounds",
    hint: "pz.card.soundsHint",
    section: SoundsSection,
    summary: (a, t) => (
      <>
        <span className={chip}>{a.soundsOn ? t("pz.on") : t("pz.off")}</span>
        {a.soundsOn && <span className={chip}>{a.soundVolume}%</span>}
      </>
    ),
  },
  {
    id: "layout",
    icon: LayoutDashboard,
    title: "pz.card.layout",
    hint: "pz.card.layoutHint",
    section: LayoutSection,
    summary: (a, t) => (
      <>
        <span className={chip}>
          {a.contentMaxPx > 0 ? `${a.contentMaxPx}px` : t(`pz.layout.${a.contentWidth}` as DictKey)}
        </span>
        <span className={chip}>{a.homePage}</span>
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
        a.bigCursor,
        a.largeTargets,
        a.readingGuide,
        a.speakSelection,
        a.letterSpacing > 0,
        a.wordSpacing > 0,
        a.lineHeight > 0,
        a.colorFilter !== "none",
      ].filter(Boolean).length;
      return (
        <span className={chip}>{active > 0 ? `${active} ${t("pz.active")}` : t("pz.default")}</span>
      );
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
        <span className={chip}>
          {t(a.cardStyle === "compact" ? "pz.profile.compact" : "pz.profile.classic")}
        </span>
        <span className={chip}>
          {t(a.avatarShape === "square" ? "pz.profile.square" : "pz.profile.round")}
        </span>
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
      <h3 className="mt-1 font-display text-lg font-bold text-foreground">
        {t("ap.previewTitle")}
      </h3>
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
        <input
          readOnly
          value="Campo de texto"
          aria-label="preview field"
          className="w-36 rounded-xl border border-input bg-background px-3 py-1.5 text-xs text-foreground"
        />
      </div>
    </div>
  );
}

/** Copiar e colar o estilo inteiro (para usar em outro aparelho ou compartilhar). */
function ShareStyle() {
  const { appearance: a } = useAppearance();
  const { locale } = useI18n();
  const tr = (names: Names) => pickName(names, locale);
  const [text, setText] = useState("");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(a));
      toast.success(tr(["Estilo copiado!", "Style copied!", "¡Estilo copiado!", "Style copié !"]));
    } catch {
      toast.error(
        tr([
          "Não foi possível copiar.",
          "Could not copy.",
          "No se pudo copiar.",
          "Copie impossible.",
        ]),
      );
    }
  };

  const apply = () => {
    try {
      saveAppearance(sanitizeAppearance(JSON.parse(text)));
      setText("");
      toast.success(
        tr(["Estilo aplicado!", "Style applied!", "¡Estilo aplicado!", "Style appliqué !"]),
      );
    } catch {
      toast.error(
        tr(["Estilo inválido.", "Invalid style.", "Estilo no válido.", "Style invalide."]),
      );
    }
  };

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
      <h2 className="font-display text-base font-bold text-foreground">
        {tr([
          "Compartilhar meu estilo",
          "Share my style",
          "Compartir mi estilo",
          "Partager mon style",
        ])}
      </h2>
      <p className="text-[11px] text-muted-foreground">
        {tr([
          "Copie todas as suas escolhas e cole em outra conta, ou cole aqui o estilo de alguém.",
          "Copy all your choices and paste them into another account, or paste someone else's style here.",
          "Copia todas tus elecciones y pégalas en otra cuenta, o pega aquí el estilo de otra persona.",
          "Copiez tous vos choix et collez-les dans un autre compte, ou collez ici le style de quelqu'un.",
        ])}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-secondary"
        >
          <Copy className="h-3.5 w-3.5" />
          {tr(["Copiar meu estilo", "Copy my style", "Copiar mi estilo", "Copier mon style"])}
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder={tr([
          "Cole um estilo aqui…",
          "Paste a style here…",
          "Pega un estilo aquí…",
          "Collez un style ici…",
        ])}
        className="mt-3 w-full resize-none rounded-xl border border-input bg-background px-3 py-2 font-mono text-[11px] text-foreground outline-none focus:border-accent"
      />
      <button
        type="button"
        onClick={apply}
        disabled={!text.trim()}
        className="mt-2 cursor-pointer rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground disabled:opacity-50"
      >
        {tr(["Aplicar estilo", "Apply style", "Aplicar estilo", "Appliquer le style"])}
      </button>
    </section>
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
  const { t, locale } = useI18n();
  const tr = (names: Names) => pickName(names, locale);
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
                <div className="mt-auto flex flex-wrap items-center gap-1.5">
                  {c.summary(a, t, tr)}
                </div>
              </button>
            ))}
          </div>

          <ShareStyle />
        </>
      )}
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-chrome";
import { useI18n } from "@/hooks/use-i18n";
import type { DictKey } from "@/lib/i18n";
import { SiteFooter } from "@/components/site-footer";
import { Heart, ShieldCheck, Zap, Users, TrendingUp, Sparkles, Globe2 } from "lucide-react";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre Nós — NutriConnect" },
      {
        name: "description",
        content:
          "Conheça a história da NutriConnect, nossa missão de humanizar e conectar pessoas em torno da alimentação através de uma rede social acolhedora.",
      },
      { property: "og:title", content: "Sobre Nós — NutriConnect" },
      {
        property: "og:description",
        content: "Uma rede social sobre alimentação, humanizada e conectada.",
      },
    ],
  }),
  component: Sobre,
});

const values: { icon: typeof Heart; title: DictKey; desc: DictKey }[] = [
  { icon: Heart, title: "about.val1.title", desc: "about.val1.desc" },
  { icon: ShieldCheck, title: "about.val2.title", desc: "about.val2.desc" },
  { icon: Zap, title: "about.val3.title", desc: "about.val3.desc" },
  { icon: Users, title: "about.val4.title", desc: "about.val4.desc" },
];

function Sobre() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative bg-gradient-to-b from-secondary/50 to-background py-16 md:py-24">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft/50 px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-4 w-4" /> {t("about.badge")}
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {t("about.hero1")} <br />
              <span className="text-primary">{t("about.hero2")}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground leading-relaxed">
              {t("about.heroText")}
            </p>
          </div>
        </section>

        {/* MISSION & VISION CARDS */}
        <section className="mx-auto max-w-5xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-3xl border bg-card p-8 shadow-card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Globe2 className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold">{t("about.mission")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("about.missionText")}
              </p>
            </div>

            <div className="rounded-3xl border bg-card p-8 shadow-card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <TrendingUp className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold">{t("about.vision")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t("about.visionText")}
              </p>
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold">{t("about.valuesTitle")}</h2>
            <p className="mt-2 text-muted-foreground">{t("about.valuesHint")}</p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-3xl border bg-card p-6 shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                    <v.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold">{t(v.title)}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t(v.desc)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* JOIN US CTA */}
        <section className="mx-auto max-w-5xl px-4 py-16 text-center">
          <div className="rounded-3xl border bg-gradient-to-b from-secondary/60 to-background p-10 md:p-14 shadow-lg">
            <h2 className="font-display text-3xl font-bold">{t("about.join")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              {t("about.joinText")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/cadastro"
                className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary-hover"
              >
                {t("about.createFree")}
              </Link>
              <Link
                to="/contato"
                className="rounded-full border border-border bg-card px-8 py-3 text-sm font-semibold text-foreground hover:bg-secondary"
              >
                {t("about.contactUs")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

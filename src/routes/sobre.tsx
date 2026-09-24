import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-chrome";
import { useI18n } from "@/hooks/use-i18n";
import type { DictKey } from "@/lib/i18n";
import {
  Heart,
  ShieldCheck,
  Zap,
  Users,
  Award,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Globe2,
  Calendar,
} from "lucide-react";

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

const stats: { label: DictKey; value: string; hint: DictKey }[] = [
  { label: "about.stat1.label", value: "+45.000", hint: "about.stat1.hint" },
  { label: "about.stat2.label", value: "+1.200", hint: "about.stat2.hint" },
  { label: "about.stat3.label", value: "+180.000", hint: "about.stat3.hint" },
  { label: "about.stat4.label", value: "98.4%", hint: "about.stat4.hint" },
];

const timeline: { year: string; title: DictKey; desc: DictKey }[] = [
  { year: "2023", title: "about.tl1.title", desc: "about.tl1.desc" },
  { year: "2024", title: "about.tl2.title", desc: "about.tl2.desc" },
  { year: "2025", title: "about.tl3.title", desc: "about.tl3.desc" },
  { year: "2026", title: "about.tl4.title", desc: "about.tl4.desc" },
];

const values: { icon: typeof Heart; title: DictKey; desc: DictKey }[] = [
  { icon: Heart, title: "about.val1.title", desc: "about.val1.desc" },
  { icon: ShieldCheck, title: "about.val2.title", desc: "about.val2.desc" },
  { icon: Zap, title: "about.val3.title", desc: "about.val3.desc" },
  { icon: Users, title: "about.val4.title", desc: "about.val4.desc" },
];

const team: { name: string; role: DictKey; bio: DictKey; crn: string }[] = [
  {
    name: "Dra. Camila Jardim",
    role: "about.team1.role",
    bio: "about.team1.bio",
    crn: "CRN-3 48921",
  },
  {
    name: "Eng. Lucas Silveira",
    role: "about.team2.role",
    bio: "about.team2.bio",
    crn: "Ex-Google Health",
  },
  {
    name: "Dra. Beatriz Santos",
    role: "about.team3.role",
    bio: "about.team3.bio",
    crn: "CRN-3 32109",
  },
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

        {/* IMPACT STATS */}
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-3xl border bg-card p-6 shadow-card text-center">
                <div className="font-display text-4xl font-extrabold text-primary">{s.value}</div>
                <div className="mt-2 text-sm font-semibold text-foreground">{t(s.label)}</div>
                <div className="mt-1 text-xs text-muted-foreground">{t(s.hint)}</div>
              </div>
            ))}
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

        {/* TIMELINE */}
        <section className="bg-secondary/30 py-16 border-y">
          <div className="mx-auto max-w-4xl px-4">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Calendar className="h-4 w-4" /> {t("about.trajectory")}
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold">{t("about.howWeGotHere")}</h2>
            </div>

            <div className="mt-12 space-y-8 relative before:absolute before:left-4 md:before:left-1/2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {timeline.map((item, idx) => (
                <div
                  key={item.year}
                  className={`relative flex flex-col md:flex-row items-start ${
                    idx % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-md z-10">
                    {item.year.slice(2)}
                  </div>
                  <div className="ml-12 md:ml-0 md:w-1/2 md:px-8">
                    <div className="rounded-2xl border bg-card p-6 shadow-card">
                      <span className="text-xs font-bold text-primary">{item.year}</span>
                      <h3 className="mt-1 font-display text-lg font-bold">{t(item.title)}</h3>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        {t(item.desc)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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

        {/* TEAM */}
        <section className="bg-card border-t py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent">
                <Award className="h-4 w-4" /> {t("about.leadership")}
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold">
                {t("about.whoMakesItHappen")}
              </h2>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {team.map((member) => (
                <div
                  key={member.name}
                  className="rounded-3xl border bg-background p-6 shadow-card text-center"
                >
                  <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-tr from-primary to-accent-soft p-1">
                    <div className="h-full w-full rounded-full bg-secondary flex items-center justify-center font-display font-extrabold text-2xl text-primary">
                      {member.name.split(" ")[1]?.[0] ?? "N"}
                    </div>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold">{member.name}</h3>
                  <div className="text-xs font-semibold text-primary">{t(member.role)}</div>
                  <span className="mt-1 inline-block rounded-full bg-secondary px-3 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {member.crn}
                  </span>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {t(member.bio)}
                  </p>
                </div>
              ))}
            </div>
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
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-chrome";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/hooks/use-i18n";
import type { DictKey } from "@/lib/i18n";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Fale Conosco — NutriConnect" },
      {
        name: "description",
        content:
          "Precisa de ajuda ou tem dúvidas sobre a plataforma NutriConnect? Entre em contato com nosso time de atendimento.",
      },
      { property: "og:title", content: "Fale Conosco — NutriConnect" },
      {
        property: "og:description",
        content: "Estamos aqui para ajudar você a ter a melhor experiência.",
      },
    ],
  }),
  component: Contato,
});

const contactChannels: { icon: typeof Mail; title: DictKey; value: string; hint: DictKey }[] = [
  {
    icon: Mail,
    title: "contact.ch1.title",
    value: "suporte@nutriconnect.com.br",
    hint: "contact.ch1.hint",
  },
  {
    icon: Phone,
    title: "contact.ch2.title",
    value: "0800 770 9988 / (11) 4002-8922",
    hint: "contact.ch2.hint",
  },
  {
    icon: MessageCircle,
    title: "contact.ch3.title",
    value: "+55 (11) 98888-2026",
    hint: "contact.ch3.hint",
  },
  {
    icon: MapPin,
    title: "contact.ch4.title",
    value: "Av. Paulista, 1000, Cj. 1402 — São Paulo/SP",
    hint: "contact.ch4.hint",
  },
];

function Contato() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [subject, setSubject] = useState("duvida-geral");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success(t("contact.ticketSent") + " #NC-" + Math.floor(1000 + Math.random() * 9000));
    }, 1000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* HERO HEADER */}
        <section className="bg-gradient-to-b from-secondary/60 to-background py-14">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft/50 px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-4 w-4" /> {t("contact.badge")}
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              {t("contact.title")}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">{t("contact.subtitle")}</p>
          </div>
        </section>

        {/* CONTENT GRID */}
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
            {/* CHANNELS & STATUS */}
            <div className="space-y-6">
              {/* LIVE STATUS CARD */}
              <div className="rounded-3xl border bg-card p-6 shadow-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                  </span>
                  <div>
                    <div className="text-sm font-bold">{t("contact.live")}</div>
                    <div className="text-xs text-muted-foreground">{t("contact.wait")}</div>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {t("contact.online")}
                </span>
              </div>

              {/* CHANNELS LIST */}
              <div className="space-y-4">
                {contactChannels.map((c) => (
                  <div
                    key={c.title}
                    className="flex items-start gap-4 rounded-3xl border bg-card p-5 shadow-card hover:border-primary/40 transition"
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {t(c.title)}
                      </div>
                      <div className="text-sm font-bold text-foreground mt-0.5">{c.value}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{t(c.hint)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* HOURS CARD */}
              <div className="rounded-3xl border bg-secondary/40 p-6">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Clock className="h-4 w-4 text-primary" /> {t("contact.hours")}
                </div>
                <div className="mt-3 text-xs text-muted-foreground space-y-1.5">
                  <div className="flex justify-between">
                    <span>{t("contact.weekdays")}</span>
                    <span className="font-semibold text-foreground">
                      {t("contact.weekdaysTime")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("contact.saturdays")}</span>
                    <span className="font-semibold text-foreground">
                      {t("contact.saturdaysTime")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("contact.sundays")}</span>
                    <span className="font-semibold text-foreground">NutriAI 24h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FORM */}
            <div className="rounded-3xl border bg-card p-8 shadow-xl">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="font-display text-2xl font-bold">{t("contact.received")}</h3>
                  <p className="mx-auto max-w-md text-sm text-muted-foreground">
                    {t("contact.receivedText")}
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 rounded-full border border-border bg-secondary px-6 py-2.5 text-xs font-semibold hover:bg-secondary/80"
                  >
                    {t("contact.sendAnother")}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="font-display text-2xl font-bold">{t("contact.formTitle")}</h2>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t("contact.fullName")}>
                      <Input required placeholder={t("contact.namePlaceholder")} />
                    </Field>
                    <Field label={t("auth.email")}>
                      <Input required type="email" placeholder="voce@exemplo.com" />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t("contact.phone")}>
                      <Input placeholder="(11) 99999-9999" />
                    </Field>
                    <Field label={t("contact.subject")}>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary outline-none"
                      >
                        <option value="duvida-geral">{t("contact.subject.general")}</option>
                        <option value="suporte-conta">{t("contact.subject.account")}</option>
                        <option value="parcerias">{t("contact.subject.partners")}</option>
                        <option value="imprensa">{t("contact.subject.press")}</option>
                      </select>
                    </Field>
                  </div>

                  <Field label={t("contact.message")}>
                    <Textarea
                      required
                      rows={5}
                      className="resize-none"
                      placeholder={t("contact.messagePlaceholder")}
                    />
                  </Field>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary-hover disabled:opacity-50"
                  >
                    {loading ? (
                      <span>{t("contact.sending")}</span>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> {t("contact.send")}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}

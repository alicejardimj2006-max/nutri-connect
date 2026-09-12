import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, CheckCircle2, HelpCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
      { property: "og:description", content: "Estamos aqui para ajudar você a ter a melhor experiência." },
    ],
  }),
  component: Contato,
});

const contactChannels = [
  {
    icon: Mail,
    title: "E-mail de Suporte",
    value: "suporte@nutriconnect.com.br",
    hint: "Respondemos em até 2 horas úteis",
  },
  {
    icon: Phone,
    title: "Atendimento Telefônico",
    value: "0800 770 9988 / (11) 4002-8922",
    hint: "Seg à Sex das 08h às 19h",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Oficial",
    value: "+55 (11) 98888-2026",
    hint: "Atendimento rápido via mensagens",
  },
  {
    icon: MapPin,
    title: "Sede Corporativa",
    value: "Av. Paulista, 1000, Cj. 1402 — São Paulo/SP",
    hint: "CEP 01310-100",
  },
];

function Contato() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [subject, setSubject] = useState("duvida-geral");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Mensagem enviada com sucesso! Código do ticket: #NC-" + Math.floor(1000 + Math.random() * 9000));
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
              <Sparkles className="h-4 w-4" /> Estamos online e prontos para ajudar
            </span>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              Fale com a gente
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Dúvidas, suporte técnico, sugestões ou parcerias? Envie sua mensagem para nossa equipe.
            </p>
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
                    <div className="text-sm font-bold">Suporte em Tempo Real</div>
                    <div className="text-xs text-muted-foreground">Tempo médio de espera: ~10 minutos</div>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Online
                </span>
              </div>

              {/* CHANNELS LIST */}
              <div className="space-y-4">
                {contactChannels.map((c) => (
                  <div key={c.title} className="flex items-start gap-4 rounded-3xl border bg-card p-5 shadow-card hover:border-primary/40 transition">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{c.title}</div>
                      <div className="text-sm font-bold text-foreground mt-0.5">{c.value}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{c.hint}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* HOURS CARD */}
              <div className="rounded-3xl border bg-secondary/40 p-6">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Clock className="h-4 w-4 text-primary" /> Horário de Atendimento
                </div>
                <div className="mt-3 text-xs text-muted-foreground space-y-1.5">
                  <div className="flex justify-between">
                    <span>Segunda a Sexta:</span>
                    <span className="font-semibold text-foreground">08:00 às 20:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sábados:</span>
                    <span className="font-semibold text-foreground">09:00 às 15:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domingos e Feriados:</span>
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
                  <h3 className="font-display text-2xl font-bold">Mensagem Recebida!</h3>
                  <p className="mx-auto max-w-md text-sm text-muted-foreground">
                    Obrigado por entrar em contato. Um de nossos especialistas analisará sua solicitação e enviará uma resposta para o seu e-mail em breve.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 rounded-full border border-border bg-secondary px-6 py-2.5 text-xs font-semibold hover:bg-secondary/80"
                  >
                    Enviar Outra Mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="font-display text-2xl font-bold">Envie sua mensagem</h2>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nome Completo">
                      <Input required placeholder="Ex: Maria Silva" />
                    </Field>
                    <Field label="E-mail">
                      <Input required type="email" placeholder="voce@exemplo.com" />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Telefone / WhatsApp">
                      <Input placeholder="(11) 99999-9999" />
                    </Field>
                    <Field label="Assunto">
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary outline-none"
                      >
                        <option value="duvida-geral">Dúvida Geral</option>
                        <option value="suporte-paciente">Suporte ao Paciente</option>
                        <option value="sou-nutricionista">Sou Nutricionista (Parceria)</option>
                        <option value="financeiro">Financeiro e Planos</option>
                        <option value="imprensa">Imprensa e Mídia</option>
                      </select>
                    </Field>
                  </div>

                  <Field label="Sua Mensagem">
                    <Textarea
                      required
                      rows={5}
                      className="resize-none"
                      placeholder="Descreva detalhadamente como podemos te ajudar..."
                    />
                  </Field>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary-hover disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Enviando...</span>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Enviar Mensagem
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
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


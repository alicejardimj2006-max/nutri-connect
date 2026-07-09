import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, UtensilsCrossed, LineChart, UserPlus, Search, CalendarDays, Salad, Activity, ArrowRight, Sparkles } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-soft/40 via-background to-background" />
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24 md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                <Sparkles className="h-3.5 w-3.5" /> Plataforma para nutricionistas e pacientes
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
                Cuidar da sua alimentação nunca foi tão fácil.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Conectamos pacientes e nutricionistas para um acompanhamento completo e personalizado.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/cadastro"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90"
                >
                  Começar agora <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/servicos"
                  className="inline-flex items-center rounded-full border px-6 py-3 text-sm font-semibold hover:bg-muted"
                >
                  Ver serviços
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
                <div><span className="text-2xl font-bold text-foreground">+500</span><br />nutricionistas</div>
                <div className="h-8 w-px bg-border" />
                <div><span className="text-2xl font-bold text-foreground">+10k</span><br />pacientes</div>
                <div className="h-8 w-px bg-border" />
                <div><span className="text-2xl font-bold text-foreground">4.9★</span><br />avaliação</div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-primary to-primary-soft p-1 shadow-soft">
                <div className="flex h-full flex-col justify-between rounded-[calc(1.5rem-4px)] bg-card p-6">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft"><Salad className="h-5 w-5 text-primary" /></div>
                    <div>
                      <div className="text-sm font-semibold">Plano de hoje</div>
                      <div className="text-xs text-muted-foreground">Segunda, 09 nov</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { t: "07:30", n: "Café da manhã", d: "Iogurte + granola + banana" },
                      { t: "12:30", n: "Almoço", d: "Arroz integral, frango grelhado, salada" },
                      { t: "16:00", n: "Lanche", d: "Fruta + castanhas" },
                    ].map((m) => (
                      <div key={m.t} className="flex items-center gap-3 rounded-xl bg-secondary p-3">
                        <div className="w-14 text-sm font-semibold text-primary">{m.t}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{m.n}</div>
                          <div className="truncate text-xs text-muted-foreground">{m.d}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border bg-accent p-3 text-xs text-accent-foreground">
                    Sua próxima consulta é <b>quinta, 14:00</b>.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: CalendarCheck, title: "Agendamento online", desc: "Marque consultas em segundos com seu nutricionista favorito." },
              { icon: UtensilsCrossed, title: "Plano alimentar personalizado", desc: "Cardápios sob medida para seu objetivo, rotina e preferências." },
              { icon: LineChart, title: "Acompanhamento da evolução", desc: "Gráficos de peso, IMC e metas atualizados a cada consulta." },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border bg-card p-6 shadow-card transition hover:shadow-soft">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                  <c.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Como funciona */}
        <section className="bg-secondary/60 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">Como funciona</h2>
              <p className="mt-3 text-muted-foreground">Cinco passos simples entre você e uma vida mais saudável.</p>
            </div>
            <ol className="mt-10 grid gap-4 md:grid-cols-5">
              {[
                { icon: UserPlus, t: "Cadastre-se" },
                { icon: Search, t: "Escolha um nutricionista" },
                { icon: CalendarDays, t: "Agende sua consulta" },
                { icon: Salad, t: "Receba seu plano alimentar" },
                { icon: Activity, t: "Acompanhe sua evolução" },
              ].map((s, i) => (
                <li key={s.t} className="rounded-2xl border bg-card p-5 text-center shadow-card">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-3 text-xs font-semibold text-primary">Passo {i + 1}</div>
                  <div className="mt-1 text-sm font-medium">{s.t}</div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

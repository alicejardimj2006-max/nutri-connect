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
        <section className="relative overflow-hidden bg-primary text-primary-foreground">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary via-primary to-primary/90" />
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24 md:items-center">
            <div>
            
              <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
                Sua alimentação
                <br></br>do seu jeito
              </h1>
              <p className="mt-5 max-w-xl text-lg text-white/90">
                Conectamos pacientes e nutricionistas para
                <br></br>um acompanhamento completo e personalizado
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/cadastro"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg transition hover:bg-white/90"
                >
                  Começar minha jornada <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/servicos"
                  className="inline-flex items-center rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-xs transition hover:bg-white/20 shadow-lg"
                >
                  Serviços
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm text-white/80">
                <div><span className="text-2xl font-bold text-white">+500</span><br />nutricionistas</div>
                <div className="h-8 w-px bg-white/25" />
                <div><span className="text-2xl font-bold text-white">+10k</span><br />pacientes</div>
                <div className="h-8 w-px bg-white/25" />
                <div><span className="text-2xl font-bold text-white">4.9★</span><br />avaliação</div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl bg-white/20 p-1 shadow-2xl backdrop-blur-xs">
                <div className="flex h-full flex-col justify-between rounded-[calc(1.5rem-4px)] bg-card p-6 text-card-foreground shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft"><Salad className="h-5 w-5 text-primary" /></div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">Cardápio para hoje</div>
                      <div className="text-xs text-muted-foreground">Segunda, 09 nov</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { t: "07:30", n: "Café da manhã", d: "01 laranja pequena + 02 colheres(chá) de requeijão light + chá ou café + 02 torradas integral" },
                      { t: "10:00", n: "Lanche da manhã", d: "01 banana prata" },
                      { t: "12:30", n: "Almoço", d: "Vegetais crus á vontade + 02 colheres (sopa) de arroz + 02 colheres (sopa) de feijão + frango grelhado + salada á vontade " },
                      { t: "16:00", n: "Lanche", d: "01 barra de cereal até 90 calorias + 15g de carboidrato" },
                    ].map((m) => (
                      <div key={m.t} className="flex items-center gap-3 rounded-xl bg-secondary p-3">
                        <div className="w-14 text-sm font-semibold text-primary">{m.t}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground">{m.n}</div>
                          <div className="truncate text-xs text-muted-foreground">{m.d}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border bg-accent p-3 text-xs text-accent-foreground">
                    Sua próxima consulta está marcada para <b>quinta, ás 14:00</b>.
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
              { icon: CalendarCheck, title: "Agendamento online", desc: "Marque seu horário em instantes com o nutricionista que mais combina com você" },
              { icon: UtensilsCrossed, title: "Plano alimentar personalizado", desc: "Um cardápio feito no seu ritmo, pensado para sua rotina e seus gostos" },
              { icon: LineChart, title: "Acompanhamento da evolução", desc: "Acompanhe suas conquistas, expansão de cardápio e objetivos a cada reencontro" },
            ].map((c) => (
              <div key={c.title} className=" shadow-lg rounded-2xl border bg-card p-6 shadow-card transition hover:shadow-soft">
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
              <p className="mt-3 text-muted-foreground">Cinco passos para uma alimentação do seu jeito, leve e saudável.</p>
            </div>
            <ol className="mt-10 grid gap-4 md:grid-cols-5">
              {[
                { icon: UserPlus, t: "Cadastre-se" },
                { icon: Search, t: "Escolha um nutricionista" },
                { icon: CalendarDays, t: "Agende sua consulta" },
                { icon: Salad, t: "Receba seu plano alimentar" },
                { icon: Activity, t: "Acompanhe sua evolução" },
              ].map((s, i) => (
                <li key={s.t} className="shadow-lg transition hover:shadow-soft rounded-2xl border bg-card p-5 text-center shadow-card">
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

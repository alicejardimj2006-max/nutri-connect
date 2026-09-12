import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, CalendarCheck, CalendarDays, UserPlus, Sparkles, MessageSquareHeart, Compass, ArrowRight } from "lucide-react";
import { StatCard, Section } from "@/components/dashboard-shell";
import { MiniCalendar } from "./paciente.agendamentos";
import { useAuth } from "@/hooks/use-auth";
import { getWeeklyThemes } from "@/lib/community";
import { ShareModal } from "@/components/share-modal";

export const Route = createFileRoute("/nutricionista/dashboard")({
  component: NutriDash,
});

const atendimentos = [
  { m: "Jun", v: 42 }, { m: "Jul", v: 55 }, { m: "Ago", v: 61 },
  { m: "Set", v: 58 }, { m: "Out", v: 72 }, { m: "Nov", v: 80 },
];

const proximas = [
  { h: "09:00", p: "Ana Souza", tipo: "Retorno" },
  { h: "10:30", p: "Bruno Lima", tipo: "Avaliação" },
  { h: "14:00", p: "Cainã Lopes de Andrade", tipo: "Retorno" },
  { h: "15:30", p: "Carla Mendes", tipo: "Retorno" },
];

function NutriDash() {
  const { user } = useAuth();
  const activeTheme = getWeeklyThemes()[0];
  const displayName = user?.name || "Nutricionista";

  return (
    <div className="space-y-6">
      {/* Banner de Presença na Comunidade */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Presença Profissional na Comunidade
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {displayName}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Compartilhe artigos educativos, dicas sem julgamento e receitas nutritivas no Espaço de Hoje para fortalecer sua conexão com os pacientes.
              {activeTheme && (
                <span className="block mt-1 text-primary font-medium">
                  Tema da Semana: {activeTheme.title}
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ShareModal
              triggerButton={
                <button className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90">
                  <MessageSquareHeart className="h-4 w-4" />
                  Publicar na Comunidade
                </button>
              }
            />
            <Link
              to="/espaco"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card/80 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Ver Espaço de Hoje
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Consultas de hoje" value="6" icon={CalendarCheck} />
        <StatCard label="Consultas da semana" value="28" icon={CalendarDays} />
        <StatCard label="Total de pacientes" value="142" icon={Users} />
        <StatCard label="Novos pacientes" value="+9" hint="Este mês" icon={UserPlus} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Section title="Calendário"><MiniCalendar /></Section>
        <Section title="Atendimentos mensais">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={atendimentos}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Bar dataKey="v" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <Section title="Próximas consultas">
        <ul className="divide-y">
          {proximas.map((c) => (
            <li key={c.h + c.p} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <div className="w-16 text-sm font-semibold text-primary">{c.h}</div>
                <div>
                  <div className="text-sm font-medium">{c.p}</div>
                  <div className="text-xs text-muted-foreground">{c.tipo}</div>
                </div>
              </div>
              <button className="rounded-full border px-3 py-1 text-xs font-semibold hover:bg-muted">Abrir</button>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}


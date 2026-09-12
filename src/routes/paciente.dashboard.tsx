import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  Scale,
  Target,
  Clock,
  ArrowRight,
  Salad,
  MessageSquare,
  CalendarPlus,
  Compass,
  Sparkles,
  Flame,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StatCard, Section } from "@/components/dashboard-shell";
import { useAuth } from "@/hooks/use-auth";
import { getWeeklyThemes, getChallenges } from "@/lib/community";
import { WeeklyThemeCard, ChallengeCard } from "@/components/community-cards";

export const Route = createFileRoute("/paciente/dashboard")({
  component: Dashboard,
});

const weightData = [
  { m: "Jun", peso: 82 },
  { m: "Jul", peso: 80.5 },
  { m: "Ago", peso: 79.2 },
  { m: "Set", peso: 78 },
  { m: "Out", peso: 76.8 },
  { m: "Nov", peso: 75.4 },
];

const proximas = [
  { data: "Qui, 14 nov · 14:00", nutri: "Dra. Maria Lorena", tipo: "Retorno" },
  { data: "Qua, 28 nov · 10:30", nutri: "Dra. Maria Lorena", tipo: "Avaliação" },
];

function Dashboard() {
  const { user } = useAuth();
  const activeTheme = getWeeklyThemes()[0];
  const challenges = getChallenges();
  const activeChallenge = challenges.length > 0 ? challenges[0] : null;
  const firstName = user?.name?.split(" ")[0] || "Paciente";

  return (
    <div className="space-y-6">
      {/* Banner de Boas-Vindas e Conexão com a Jornada */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Sua jornada em evolução
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Olá, {firstName}!
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Além do acompanhamento clínico com seu nutricionista, você faz parte de uma comunidade
              que troca experiências reais sem neuras.
              {activeTheme && (
                <span className="block mt-1 text-primary font-medium">
                  Tema da Semana: {activeTheme.title}
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/minha-jornada"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              <Compass className="h-4 w-4" />
              Minha Jornada
            </Link>
            <Link
              to="/espaco"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card/80 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Espaço de Hoje
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Próxima consulta"
          value="14 nov"
          hint="Quinta · 14:00"
          icon={CalendarCheck}
        />
        <StatCard label="Peso atual" value="75,4 kg" hint="-6,6 kg desde jun" icon={Scale} />
        <StatCard
          label="Meta"
          value={user?.goal || "Equilíbrio & Rotina"}
          hint="Foco pessoal"
          icon={Target}
        />
        <StatCard label="Última atualização" value="há 3 dias" hint="09 nov" icon={Clock} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Section title="Evolução do peso">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  domain={["dataMin - 1", "dataMax + 1"]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "var(--primary)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Próximas consultas">
          <ul className="space-y-3">
            {proximas.map((c) => (
              <li key={c.data} className="rounded-xl border bg-secondary/50 p-3">
                <div className="text-sm font-semibold">{c.data}</div>
                <div className="text-xs text-muted-foreground">
                  {c.nutri} · {c.tipo}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {activeTheme && (
          <Section title="O Pulso da Comunidade">
            <WeeklyThemeCard theme={activeTheme} compact={true} />
          </Section>
        )}

        {activeChallenge && (
          <Section title="Seu Desafio Atual">
            <ChallengeCard challenge={activeChallenge} />
          </Section>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Ações rápidas
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Shortcut to="/paciente/agendamentos" icon={CalendarPlus} label="Agendar consulta" />
          <Shortcut to="/paciente/plano-alimentar" icon={Salad} label="Ver plano alimentar" />
          <Shortcut to="/paciente/mensagens" icon={MessageSquare} label="Mensagem ao nutri" />
          <Shortcut to="/minha-jornada" icon={Flame} label="Metas & Desafios" />
        </div>
      </div>
    </div>
  );
}

function Shortcut({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-2xl border bg-card p-4 shadow-card transition hover:border-primary hover:shadow-soft"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

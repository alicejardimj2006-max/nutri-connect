import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, Scale, Target, Clock, ArrowRight, Salad, MessageSquare, CalendarPlus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StatCard, Section } from "@/components/dashboard-shell";

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
  { data: "Qui, 14 nov · 14:00", nutri: "Dra. Marina Alves", tipo: "Retorno" },
  { data: "Qua, 28 nov · 10:30", nutri: "Dra. Marina Alves", tipo: "Avaliação" },
];

function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Próxima consulta" value="14 nov" hint="Quinta · 14:00" icon={CalendarCheck} />
        <StatCard label="Peso atual" value="75,4 kg" hint="-6,6 kg desde jun" icon={Scale} />
        <StatCard label="Meta" value="72 kg" hint="3,4 kg restantes" icon={Target} />
        <StatCard label="Última atualização" value="há 3 dias" hint="09 nov" icon={Clock} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Section title="Evolução do peso">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={["dataMin - 1", "dataMax + 1"]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Line type="monotone" dataKey="peso" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: "var(--primary)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Próximas consultas">
          <ul className="space-y-3">
            {proximas.map((c) => (
              <li key={c.data} className="rounded-xl border bg-secondary/50 p-3">
                <div className="text-sm font-semibold">{c.data}</div>
                <div className="text-xs text-muted-foreground">{c.nutri} · {c.tipo}</div>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Shortcut to="/paciente/agendamentos" icon={CalendarPlus} label="Agendar consulta" />
        <Shortcut to="/paciente/plano-alimentar" icon={Salad} label="Ver plano alimentar" />
        <Shortcut to="/paciente/mensagens" icon={MessageSquare} label="Enviar mensagem" />
      </div>
    </div>
  );
}

function Shortcut({ to, icon: Icon, label }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Link to={to} className="flex items-center justify-between rounded-2xl border bg-card p-4 shadow-card transition hover:border-primary hover:shadow-soft">
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

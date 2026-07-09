import { createFileRoute } from "@tanstack/react-router";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, CalendarCheck, CalendarDays, UserPlus } from "lucide-react";
import { StatCard, Section } from "@/components/dashboard-shell";
import { MiniCalendar } from "./paciente.agendamentos";

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
  { h: "14:00", p: "João Silva", tipo: "Retorno" },
  { h: "15:30", p: "Carla Mendes", tipo: "Retorno" },
];

function NutriDash() {
  return (
    <div className="space-y-6">
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

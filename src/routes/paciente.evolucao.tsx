import { createFileRoute } from "@tanstack/react-router";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StatCard, Section } from "@/components/dashboard-shell";
import { Scale, Target, Activity } from "lucide-react";

export const Route = createFileRoute("/paciente/evolucao")({
  component: Evolucao,
});

const peso = [
  { m: "Jun", v: 82 }, { m: "Jul", v: 80.5 }, { m: "Ago", v: 79.2 },
  { m: "Set", v: 78 }, { m: "Out", v: 76.8 }, { m: "Nov", v: 75.4 },
];
const imc = peso.map((p) => ({ m: p.m, v: +(p.v / (1.75 * 1.75)).toFixed(1) }));

function Evolucao() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard label="Peso atual" value="75,4 kg" icon={Scale} />
        <StatCard label="Meta" value="72 kg" hint="3,4 kg restantes" icon={Target} />
        <StatCard label="IMC" value="24,6" hint="Peso saudável" icon={Activity} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Peso (kg)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={peso}>
                <defs>
                  <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={["dataMin - 1", "dataMax + 1"]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Area type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={3} fill="url(#gP)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>
        <Section title="IMC">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={imc}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={["dataMin - 1", "dataMax + 1"]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Line type="monotone" dataKey="v" stroke="var(--chart-3)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>
      <Section title="Histórico de medidas">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr><th className="pb-2">Mês</th><th>Peso (kg)</th><th>IMC</th><th>Variação</th></tr>
            </thead>
            <tbody className="divide-y">
              {peso.map((p, i) => {
                const diff = i === 0 ? 0 : +(p.v - peso[i - 1].v).toFixed(1);
                return <tr key={p.m}><td className="py-2.5">{p.m}</td><td>{p.v}</td><td>{imc[i].v}</td><td className={diff < 0 ? "text-primary" : diff > 0 ? "text-destructive" : "text-muted-foreground"}>{diff > 0 ? "+" : ""}{diff}</td></tr>;
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

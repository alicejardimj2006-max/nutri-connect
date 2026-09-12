import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StatCard, Section } from "@/components/dashboard-shell";
import { Scale, Target, Activity, Plus, TrendingDown, Calendar, Camera } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/paciente/evolucao")({
  component: Evolucao,
});

interface RecordEntry {
  m: string;
  peso: number;
  imc: number;
  gordura: number;
  cintura: number;
  quadril: number;
}

const initialHistory: RecordEntry[] = [
  { m: "15 Jun", peso: 82.0, imc: 26.8, gordura: 28.5, cintura: 88, quadril: 104 },
  { m: "02 Jul", peso: 80.5, imc: 26.3, gordura: 27.2, cintura: 86, quadril: 102 },
  { m: "20 Ago", peso: 79.2, imc: 25.9, gordura: 26.0, cintura: 84, quadril: 101 },
  { m: "10 Set", peso: 78.0, imc: 25.5, gordura: 25.1, cintura: 83, quadril: 99 },
  { m: "28 Out", peso: 76.8, imc: 25.1, gordura: 24.3, cintura: 81, quadril: 98 },
  { m: "15 Nov", peso: 75.4, imc: 24.6, gordura: 23.2, cintura: 79, quadril: 96 },
];

function Evolucao() {
  const [history, setHistory] = useState<RecordEntry[]>(initialHistory);
  const [showModal, setShowModal] = useState(false);
  const [newPeso, setNewPeso] = useState("");
  const [newCintura, setNewCintura] = useState("");

  const current = history[history.length - 1];
  const initial = history[0];
  const diffPeso = +(current.peso - initial.peso).toFixed(1);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeso) return toast.error("Informe ao menos o seu peso atual.");

    const val = parseFloat(newPeso);
    const imcVal = +(val / (1.75 * 1.75)).toFixed(1);
    const newEntry: RecordEntry = {
      m: "Hoje",
      peso: val,
      imc: imcVal,
      gordura: +(current.gordura - 0.4).toFixed(1),
      cintura: newCintura ? parseInt(newCintura) : current.cintura,
      quadril: current.quadril,
    };

    setHistory([...history, newEntry]);
    setShowModal(false);
    setNewPeso("");
    setNewCintura("");
    toast.success("Nova medição registrada no seu histórico!");
  };

  return (
    <div className="space-y-6">
      {/* CABEÇALHO COM BOTÃO DE REGISTRO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Evolução & Bioimpedância</h1>
          <p className="text-xs text-muted-foreground">
            Acompanhe seu progresso de saúde ao longo do tempo
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary-hover transition"
        >
          <Plus className="h-4 w-4" /> Registrar Medição
        </button>
      </div>

      {/* CARDS DE ESTATÍSTICA */}
      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard
          label="Peso atual"
          value={`${current.peso} kg`}
          hint={`${diffPeso} kg no total`}
          icon={Scale}
        />
        <StatCard
          label="Meta Estabelecida"
          value="72,0 kg"
          hint={`${+(current.peso - 72).toFixed(1)} kg restantes`}
          icon={Target}
        />
        <StatCard
          label="IMC Atual"
          value={`${current.imc}`}
          hint="Faixa de peso saudável"
          icon={Activity}
        />
      </div>

      {/* GRÁFICOS RECHARTS */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Evolução de Peso (kg)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  domain={["dataMin - 2", "dataMax + 2"]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="peso"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  fill="url(#gP)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="% de Gordura Corporal ( Bioimpedância )">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
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
                  dataKey="gordura"
                  stroke="var(--accent)"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      {/* TABELA DE HISTÓRICO COMPLETO */}
      <Section title="Histórico Detalhado de Medidas">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground border-b pb-2">
              <tr>
                <th className="pb-3">Data</th>
                <th className="pb-3">Peso (kg)</th>
                <th className="pb-3">IMC</th>
                <th className="pb-3">% Gordura</th>
                <th className="pb-3">Cintura (cm)</th>
                <th className="pb-3">Quadril (cm)</th>
                <th className="pb-3">Variação</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {history.map((p, i) => {
                const diff = i === 0 ? 0 : +(p.peso - history[i - 1].peso).toFixed(1);
                return (
                  <tr key={i} className="hover:bg-secondary/30 transition">
                    <td className="py-3 font-semibold">{p.m}</td>
                    <td className="py-3 font-bold text-foreground">{p.peso} kg</td>
                    <td className="py-3">{p.imc}</td>
                    <td className="py-3 text-accent font-semibold">{p.gordura}%</td>
                    <td className="py-3">{p.cintura} cm</td>
                    <td className="py-3">{p.quadril} cm</td>
                    <td
                      className={`py-3 font-bold ${diff < 0 ? "text-emerald-600" : diff > 0 ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      {diff > 0 ? `+${diff}` : diff} kg
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* MODAL REGISTRAR MEDIÇÃO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-xl">
            <h3 className="font-display text-xl font-bold">Nova Medição de Progresso</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Registre seus novos dados de balança e fita métrica.
            </p>

            <form onSubmit={handleAddEntry} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Peso Atual (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="Ex: 75.0"
                  value={newPeso}
                  onChange={(e) => setNewPeso(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Circunferência de Cintura (cm)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 79"
                  value={newCintura}
                  onChange={(e) => setNewCintura(e.target.value)}
                  className="input"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 rounded-full border bg-background py-2.5 text-xs font-semibold hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 rounded-full bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover"
                >
                  Salvar Medição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

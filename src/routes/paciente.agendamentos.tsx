import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Section } from "@/components/dashboard-shell";

export const Route = createFileRoute("/paciente/agendamentos")({
  component: Agendamentos,
});

const horarios = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];
const nutris = ["Dra. Marina Alves", "Dr. Pedro Costa", "Dra. Camila Ribeiro"];
const historico = [
  { d: "05 out 2026", nutri: "Dra. Marina Alves", tipo: "Retorno", status: "Concluída" },
  { d: "12 set 2026", nutri: "Dra. Marina Alves", tipo: "Retorno", status: "Concluída" },
  { d: "20 ago 2026", nutri: "Dra. Marina Alves", tipo: "Avaliação inicial", status: "Concluída" },
];

function Agendamentos() {
  const [nutri, setNutri] = useState(nutris[0]);
  const [esp, setEsp] = useState("Clínica");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("14:00");

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Section title="Nova consulta">
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Nutricionista">
              <select className="input" value={nutri} onChange={(e) => setNutri(e.target.value)}>
                {nutris.map((n) => <option key={n}>{n}</option>)}
              </select>
            </F>
            <F label="Especialidade">
              <select className="input" value={esp} onChange={(e) => setEsp(e.target.value)}>
                <option>Clínica</option><option>Esportiva</option><option>Materno-infantil</option>
              </select>
            </F>
            <F label="Data">
              <input type="date" className="input" value={data} onChange={(e) => setData(e.target.value)} />
            </F>
            <F label="Horário">
              <select className="input" value={hora} onChange={(e) => setHora(e.target.value)}>
                {horarios.map((h) => <option key={h}>{h}</option>)}
              </select>
            </F>
          </div>
          <button
            onClick={() => { if (!data) return toast.error("Selecione uma data."); toast.success(`Consulta com ${nutri} confirmada para ${data} às ${hora}.`); }}
            className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90"
          >
           <b>Confirmar agendamento</b>
          </button>
        </Section>

        <Section title="Calendário">
          <MiniCalendar />
        </Section>
      </div>

      <Section title="Histórico de consultas">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr><th className="pb-2">Data</th><th className="pb-2">Nutricionista</th><th className="pb-2">Tipo</th><th className="pb-2">Status</th></tr>
            </thead>
            <tbody className="divide-y">
              {historico.map((h) => (
                <tr key={h.d}><td className="py-2.5">{h.d}</td><td>{h.nutri}</td><td>{h.tipo}</td><td><span className="rounded-full bg-primary-soft/50 px-2 py-0.5 text-xs font-medium text-primary">{h.status}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <style>{`.input{width:100%;border:1px solid var(--border);background:var(--background);border-radius:0.65rem;padding:0.55rem 0.75rem;font-size:0.875rem;outline:none} .input:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in oklch, var(--primary) 20%, transparent)}`}</style>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}

export function MiniCalendar() {
  const now = new Date();
  const monthName = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const today = now.getDate();
  const marcados = new Set([today + 5, today + 12].filter((d) => d <= daysInMonth));

  return (
    <div>
      <div className="mb-3 text-sm font-semibold capitalize">{monthName}</div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => <div key={i} className="py-1 font-semibold">{d}</div>)}
        {cells.map((d, i) => (
          <div key={i} className={`aspect-square grid place-items-center rounded-lg text-sm ${
            d === null ? "" : d === today ? "bg-primary font-bold text-primary-foreground" : marcados.has(d) ? "bg-primary-soft/50 font-semibold text-primary" : "hover:bg-secondary"
          }`}>{d}</div>
        ))}
      </div>
    </div>
  );
}

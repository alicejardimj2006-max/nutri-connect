import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Section } from "@/components/dashboard-shell";
import { MiniCalendar } from "./paciente.agendamentos";

export const Route = createFileRoute("/nutricionista/agenda")({
  component: Agenda,
});

const horarios = [
  { h: "08:00", p: "Livre" },
  { h: "09:00", p: "Ana Souza" },
  { h: "10:00", p: "Livre" },
  { h: "10:30", p: "Bruno Lima" },
  { h: "14:00", p: "João Silva" },
  { h: "15:30", p: "Carla Mendes" },
  { h: "16:30", p: "Livre" },
];

function Agenda() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => toast.success("Nova consulta criada!")} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nova consulta
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Section title="Calendário mensal"><MiniCalendar /></Section>
        <Section title="Horários de hoje">
          <ul className="divide-y">
            {horarios.map((s) => (
              <li key={s.h} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-4">
                  <div className="w-14 text-sm font-semibold text-primary">{s.h}</div>
                  <span className={`text-sm ${s.p === "Livre" ? "text-muted-foreground" : "font-medium"}`}>{s.p}</span>
                </div>
                {s.p !== "Livre" ? (
                  <div className="flex gap-1.5">
                    <button onClick={() => toast("Consulta reagendada")} className="rounded-full border px-3 py-1 text-xs hover:bg-muted">Reagendar</button>
                    <button onClick={() => toast.error("Consulta cancelada")} className="rounded-full border px-3 py-1 text-xs text-destructive hover:bg-destructive/10">Cancelar</button>
                  </div>
                ) : (
                  <button className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">Disponível</button>
                )}
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}

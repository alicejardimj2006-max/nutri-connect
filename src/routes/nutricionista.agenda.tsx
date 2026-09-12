import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Plus,
  Video,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Lock,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Section } from "@/components/dashboard-shell";
import { MiniCalendar } from "./paciente.agendamentos";

export const Route = createFileRoute("/nutricionista/agenda")({
  component: Agenda,
});

interface Slot {
  id: string;
  h: string;
  p: string;
  status: "Ocupado" | "Livre" | "Bloqueado";
  tipo?: string;
  modalidade?: "Online" | "Presencial";
}

const initialSlots: Slot[] = [
  { id: "1", h: "08:00", p: "Livre", status: "Livre" },
  {
    id: "2",
    h: "09:00",
    p: "Ana Souza",
    status: "Ocupado",
    tipo: "Primeira Consulta",
    modalidade: "Online",
  },
  { id: "3", h: "10:00", p: "Livre", status: "Livre" },
  {
    id: "4",
    h: "10:30",
    p: "Bruno Lima",
    status: "Ocupado",
    tipo: "Retorno",
    modalidade: "Presencial",
  },
  { id: "5", h: "12:00", p: "Horário de Almoço", status: "Bloqueado" },
  {
    id: "6",
    h: "14:00",
    p: "Cainã Lopes",
    status: "Ocupado",
    tipo: "Acompanhamento",
    modalidade: "Online",
  },
  {
    id: "7",
    h: "15:30",
    p: "Carla Mendes",
    status: "Ocupado",
    tipo: "Retorno",
    modalidade: "Online",
  },
  { id: "8", h: "16:30", p: "Livre", status: "Livre" },
];

function Agenda() {
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [showModal, setShowModal] = useState(false);
  const [newPaciente, setNewPaciente] = useState("");
  const [newHora, setNewHora] = useState("10:00");
  const [newTipo, setNewTipo] = useState("Retorno");

  const handleToggleLock = (id: string) => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        if (s.status === "Bloqueado") return { ...s, p: "Livre", status: "Livre" };
        return { ...s, p: "Bloqueado pelo Profissional", status: "Bloqueado" };
      }),
    );
    toast.info("Status do horário atualizado.");
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaciente) return toast.error("Informe o nome do paciente.");

    const newSlot: Slot = {
      id: Date.now().toString(),
      h: newHora,
      p: newPaciente,
      status: "Ocupado",
      tipo: newTipo,
      modalidade: "Online",
    };

    setSlots([...slots, newSlot].sort((a, b) => a.h.localeCompare(b.h)));
    setShowModal(false);
    setNewPaciente("");
    toast.success(`Consulta agendada para ${newPaciente} às ${newHora}!`);
  };

  return (
    <div className="space-y-6">
      {/* HEADER E AÇÕES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Gestão de Agenda & Consultas</h1>
          <p className="text-xs text-muted-foreground">
            Visualize e gerencie os horários do seu consultório
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary-hover transition cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Novo Agendamento
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <Section title="Calendário Geral">
          <MiniCalendar />
        </Section>

        <Section title="Grade de Horários do Dia">
          <ul className="divide-y divide-border/60">
            {slots.map((s) => (
              <li
                key={s.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-2"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 rounded-lg bg-primary-soft/60 px-2 py-1 text-center font-extrabold text-xs text-primary">
                    {s.h}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{s.p}</div>
                    {s.tipo && (
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span>{s.tipo}</span>
                        <span>•</span>
                        <span className="text-accent font-semibold">{s.modalidade}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {s.status === "Ocupado" && s.modalidade === "Online" && (
                    <button
                      onClick={() => toast.success("Iniciando sala virtual HD do NutriConnect...")}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-500/20"
                    >
                      <Video className="h-3.5 w-3.5" /> Abrir Sala
                    </button>
                  )}

                  {s.status === "Ocupado" && (
                    <button
                      onClick={() =>
                        setSlots((prev) =>
                          prev.map((x) =>
                            x.id === s.id ? { ...x, p: "Livre", status: "Livre" } : x,
                          ),
                        )
                      }
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
                    >
                      Cancelar
                    </button>
                  )}

                  {s.status === "Livre" && (
                    <button
                      onClick={() => handleToggleLock(s.id)}
                      className="rounded-full bg-accent px-3.5 py-1 text-xs font-semibold text-accent-foreground shadow-xs hover:bg-accent-hover"
                    >
                      Disponível
                    </button>
                  )}

                  {s.status === "Bloqueado" && (
                    <button
                      onClick={() => handleToggleLock(s.id)}
                      className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary"
                    >
                      Desbloquear
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* MODAL ADICIONAR CONSULTA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-xl">
            <h3 className="font-display text-xl font-bold">Agendar Nova Consulta</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Insira os dados do paciente para encaixe ou consulta.
            </p>

            <form onSubmit={handleAddSlot} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Nome do Paciente *</label>
                <input
                  required
                  placeholder="Ex: Carlos Eduardo"
                  value={newPaciente}
                  onChange={(e) => setNewPaciente(e.target.value)}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Horário</label>
                  <select
                    value={newHora}
                    onChange={(e) => setNewHora(e.target.value)}
                    className="input"
                  >
                    <option value="08:00">08:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:30">11:30</option>
                    <option value="14:30">14:30</option>
                    <option value="16:30">16:30</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Tipo</label>
                  <select
                    value={newTipo}
                    onChange={(e) => setNewTipo(e.target.value)}
                    className="input"
                  >
                    <option value="Retorno">Retorno</option>
                    <option value="Primeira Consulta">Primeira Consulta</option>
                    <option value="Acompanhamento">Acompanhamento</option>
                  </select>
                </div>
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
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

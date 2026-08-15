import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Section, StatCard } from "@/components/dashboard-shell";
import {
  Calendar as CalendarIcon,
  User,
  CheckCircle2,
  Video,
  MapPin,
  PlusCircle,
  XCircle,
} from "lucide-react";

export const Route = createFileRoute("/paciente/agendamentos")({
  component: Agendamentos,
});

export const horarios = [
  "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30"
];
export const nutris = ["Dra. Marina Alves", "Dr. Pedro Costa", "Dra. Camila Ribeiro"];
export const historico = [
  { id: "1", d: "05 out 2026", hora: "14:00", nutri: "Dra. Marina Alves", especialidade: "Clínica", tipo: "Retorno", modalidade: "Online", status: "Concluída" },
  { id: "2", d: "12 set 2026", hora: "10:00", nutri: "Dra. Marina Alves", especialidade: "Clínica", tipo: "Retorno", modalidade: "Presencial", status: "Concluída" },
  { id: "3", d: "20 ago 2026", hora: "09:00", nutri: "Dra. Marina Alves", especialidade: "Clínica", tipo: "Avaliação inicial", modalidade: "Online", status: "Concluída" },
];

export interface AgendamentoItem {
  id: string;
  d: string;
  hora: string;
  nutri: string;
  especialidade: string;
  tipo: string;
  modalidade: string;
  status: "Agendada" | "Concluída" | "Cancelada";
  obs?: string;
}

function Agendamentos() {
  const [consultas, setConsultas] = useState<AgendamentoItem[]>([
    {
      id: "4",
      d: "25 out 2026",
      hora: "15:00",
      nutri: "Dra. Marina Alves",
      especialidade: "Esportiva",
      tipo: "Acompanhamento",
      modalidade: "Online",
      status: "Agendada",
    },
    ...historico.map((h) => ({ ...h, status: h.status as "Concluída" })),
  ]);

  const [nutri, setNutri] = useState(nutris[0]);
  const [esp, setEsp] = useState("Clínica");
  const [tipo, setTipo] = useState("Retorno");
  const [modalidade, setModalidade] = useState("Online");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("14:00");
  const [obs, setObs] = useState("");
  const [filtro, setFiltro] = useState<"Todas" | "Agendadas" | "Concluídas" | "Canceladas">("Todas");

  const handleConfirmar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) {
      toast.error("Selecione uma data para o agendamento.");
      return;
    }

    const dateParts = data.split("-");
    const year = dateParts[0];
    const monthIndex = parseInt(dateParts[1], 10) - 1;
    const day = dateParts[2];
    const monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    const formattedDate = `${day} ${monthNames[monthIndex]} ${year}`;

    const novaConsulta: AgendamentoItem = {
      id: Date.now().toString(),
      d: formattedDate,
      hora,
      nutri,
      especialidade: esp,
      tipo,
      modalidade,
      status: "Agendada",
      obs,
    };

    setConsultas([novaConsulta, ...consultas]);
    toast.success(`Consulta com ${nutri} confirmada para ${formattedDate} às ${hora}!`);
    setObs("");
  };

  const handleCancelar = (id: string) => {
    setConsultas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Cancelada" as const } : c))
    );
    toast.info("Agendamento cancelado com sucesso.");
  };

  const agendadasCount = consultas.filter((c) => c.status === "Agendada").length;
  const concluidasCount = consultas.filter((c) => c.status === "Concluída").length;

  const consultasFiltradas = consultas.filter((c) => {
    if (filtro === "Todas") return true;
    if (filtro === "Agendadas") return c.status === "Agendada";
    if (filtro === "Concluídas") return c.status === "Concluída";
    if (filtro === "Canceladas") return c.status === "Cancelada";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Cards estatísticos */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Próximas Consultas"
          value={agendadasCount.toString()}
          hint="Agendamentos confirmados"
          icon={CalendarIcon}
        />
        <StatCard
          label="Consultas Realizadas"
          value={concluidasCount.toString()}
          hint="Histórico de atendimentos"
          icon={CheckCircle2}
        />
        <StatCard
          label="Nutricionista Principal"
          value={nutris[0]}
          hint="Especialista em Nutrição Clínica"
          icon={User}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Section title="Nova consulta">
          <form onSubmit={handleConfirmar} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <F label="Nutricionista">
                <select className="input" value={nutri} onChange={(e) => setNutri(e.target.value)}>
                  {nutris.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </F>

              <F label="Especialidade">
                <select className="input" value={esp} onChange={(e) => setEsp(e.target.value)}>
                  <option value="Clínica">Clínica</option>
                  <option value="Esportiva">Esportiva</option>
                  <option value="Materno-infantil">Materno-infantil</option>
                  <option value="Comportamental">Comportamental</option>
                </select>
              </F>

              <F label="Tipo de Consulta">
                <select className="input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  <option value="Avaliação inicial">Avaliação inicial</option>
                  <option value="Retorno">Retorno</option>
                  <option value="Acompanhamento">Acompanhamento mensal</option>
                </select>
              </F>

              <F label="Modalidade">
                <select className="input" value={modalidade} onChange={(e) => setModalidade(e.target.value)}>
                  <option value="Online">Online (Teleconsulta)</option>
                  <option value="Presencial">Presencial (Consultório)</option>
                </select>
              </F>

              <F label="Data da Consulta">
                <input
                  type="date"
                  className="input"
                  value={data}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setData(e.target.value)}
                />
              </F>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Horário Disponível ({horarios.length} horários)
                </label>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-7">
                  {horarios.map((h) => {
                    const isSelected = hora === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHora(h)}
                        className={`rounded-lg py-2 text-xs font-semibold transition-all ${isSelected
                          ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30 scale-105"
                          : "bg-secondary/60 text-secondary-foreground hover:bg-secondary"
                          }`}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <F label="Observações (Opcional)">
              <input
                type="text"
                className="input"
                placeholder="Ex: Gostaria de focar em hipertrofia ou reeducação alimentar..."
                value={obs}
                onChange={(e) => setObs(e.target.value)}
              />
            </F>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              Confirmar agendamento
            </button>
          </form>
        </Section>

        <Section title="Calendário">
          <MiniCalendar onSelectDate={(dateStr) => setData(dateStr)} />
        </Section>
      </div>

      <Section
        title="Minhas Consultas"
        action={
          <div className="flex items-center gap-1 rounded-lg bg-secondary p-1 text-xs">
            {(["Todas", "Agendadas", "Concluídas", "Canceladas"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFiltro(f)}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${filtro === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto">
          {consultasFiltradas.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma consulta encontrada com o filtro selecionado.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="pb-3 pt-1">Data / Hora</th>
                  <th className="pb-3 pt-1">Nutricionista</th>
                  <th className="pb-3 pt-1">Tipo / Especialidade</th>
                  <th className="pb-3 pt-1">Modalidade</th>
                  <th className="pb-3 pt-1">Status</th>
                  <th className="pb-3 pt-1 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {consultasFiltradas.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <div>{item.d}</div>
                          <div className="text-xs text-muted-foreground">{item.hora}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="font-medium">{item.nutri}</div>
                    </td>
                    <td className="py-3">
                      <div>{item.tipo}</div>
                      <div className="text-xs text-muted-foreground">{item.especialidade}</div>
                    </td>
                    <td className="py-3">
                      <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        {item.modalidade === "Online" ? (
                          <>
                            <Video className="h-3.5 w-3.5 text-blue-500" /> Online
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3.5 w-3.5 text-emerald-500" /> Presencial
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.status === "Agendada"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                          : item.status === "Concluída"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                          }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {item.status === "Agendada" && (
                        <button
                          type="button"
                          onClick={() => handleCancelar(item.id)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Section>

      <style>{`.input{width:100%;border:1px solid var(--border);background:var(--background);border-radius:0.65rem;padding:0.55rem 0.75rem;font-size:0.875rem;outline:none} .input:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in oklch, var(--primary) 20%, transparent)}`}</style>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function MiniCalendar({ onSelectDate }: { onSelectDate?: (dateStr: string) => void }) {
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

  const handleCellClick = (d: number | null) => {
    if (!d || !onSelectDate) return;
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(d).padStart(2, "0");
    onSelectDate(`${year}-${month}-${day}`);
    toast.info(`Data ${day}/${month}/${year} selecionada no formulário.`);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm font-semibold capitalize">
        <span>{monthName}</span>
        <span className="text-xs font-normal text-muted-foreground">Clique para escolher</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <div key={i} className="py-1 font-semibold">
            {d}
          </div>
        ))}
        {cells.map((d, i) => (
          <button
            type="button"
            key={i}
            disabled={d === null}
            onClick={() => handleCellClick(d)}
            className={`aspect-square grid place-items-center rounded-lg text-sm transition-all ${d === null
              ? "cursor-default opacity-0"
              : d === today
                ? "bg-primary font-bold text-primary-foreground shadow-sm"
                : marcados.has(d)
                  ? "bg-primary-soft/50 font-semibold text-primary"
                  : "hover:bg-secondary cursor-pointer"
              }`}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-4 border-t pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-primary" /> Hoje
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-primary-soft/50" /> Agendado
        </div>
      </div>
    </div>
  );
}


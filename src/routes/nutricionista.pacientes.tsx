import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  Plus,
  MessageSquare,
  UtensilsCrossed,
  LineChart,
  FileText,
  UserPlus,
  Phone,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { Section } from "@/components/dashboard-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/nutricionista/pacientes")({
  component: Pacientes,
});

interface PacienteItem {
  id: number;
  nome: string;
  obj: string;
  peso: string;
  altura: string;
  ultima: string;
  status: "Ativo" | "Novo" | "Em Risco";
  email: string;
  tel: string;
}

const initialPacientes: PacienteItem[] = [
  {
    id: 1,
    nome: "Ana Souza",
    obj: "Perda de peso",
    peso: "68 kg",
    altura: "1,65 m",
    ultima: "05 nov",
    status: "Ativo",
    email: "ana.souza@gmail.com",
    tel: "(11) 98888-1234",
  },
  {
    id: 2,
    nome: "Bruno Lima",
    obj: "Ganho de massa",
    peso: "72 kg",
    altura: "1,78 m",
    ultima: "02 nov",
    status: "Ativo",
    email: "bruno.lima@hotmail.com",
    tel: "(11) 97777-5678",
  },
  {
    id: 3,
    nome: "Cainã Lopes de Andrade",
    obj: "Perda de peso",
    peso: "75,4 kg",
    altura: "1,75 m",
    ultima: "09 nov",
    status: "Ativo",
    email: "caina.lopes@gmail.com",
    tel: "(11) 99999-4321",
  },
  {
    id: 4,
    nome: "Carla Mendes",
    obj: "Manutenção",
    peso: "60 kg",
    altura: "1,68 m",
    ultima: "28 out",
    status: "Em Risco",
    email: "carla.mendes@yahoo.com",
    tel: "(11) 96666-8765",
  },
];

function Pacientes() {
  const [list, setList] = useState<PacienteItem[]>(initialPacientes);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<PacienteItem | null>(initialPacientes[0]);
  const [showModal, setShowModal] = useState(false);

  // Modal Form State
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novoObj, setNovoObj] = useState("Reeducação Alimentar");

  const filtered = list.filter((p) => p.nome.toLowerCase().includes(q.toLowerCase()));

  const handleAddPaciente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome) return toast.error("Informe o nome do paciente.");

    const newP: PacienteItem = {
      id: Date.now(),
      nome: novoNome,
      obj: novoObj,
      peso: "70 kg",
      altura: "1,70 m",
      ultima: "Hoje",
      status: "Novo",
      email: novoEmail || "paciente@email.com",
      tel: "(11) 99999-0000",
    };

    setList([newP, ...list]);
    setSel(newP);
    setShowModal(false);
    setNovoNome("");
    setNovoEmail("");
    toast.success(`Paciente ${novoNome} cadastrado(a) com sucesso!`);
  };

  return (
    <div className="space-y-6">
      {/* HEADER DE PACIENTES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Gestão de Pacientes</h1>
          <p className="text-xs text-muted-foreground">
            Acompanhe prontuários, evoluções e planos cadastrados
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary-hover transition cursor-pointer"
        >
          <UserPlus className="h-4 w-4" /> Cadastrar Novo Paciente
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        {/* LISTA DE PACIENTES */}
        <Section title="Meus Pacientes Cadastrados">
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar paciente por nome..."
              className="w-full rounded-full border bg-background py-2 pl-10 pr-4 text-xs outline-none focus:border-primary"
            />
          </div>

          <ul className="divide-y divide-border/60">
            {filtered.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => setSel(p)}
                  className={`w-full py-3.5 px-3 rounded-2xl text-left transition ${
                    sel?.id === p.id ? "bg-primary-soft/50 font-semibold" : "hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {p.nome
                          .split(" ")
                          .map((s) => s[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">{p.nome}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.obj} • Última: {p.ultima}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        p.status === "Ativo"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : p.status === "Novo"
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Section>

        {/* PRONTUÁRIO / FICHA DO PACIENTE SELECIONADO */}
        <Section
          title={sel ? `Ficha: ${sel.nome}` : "Selecione um paciente"}
          action={
            sel && (
              <button
                onClick={() => toast.info("Edição de cadastro do paciente.")}
                className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold hover:bg-secondary"
              >
                Editar Ficha
              </button>
            )
          }
        >
          {sel ? (
            <div className="space-y-6">
              {/* DADOS RÁPIDOS */}
              <div className="grid gap-3 sm:grid-cols-3">
                <Info l="Peso Atual" v={sel.peso} />
                <Info l="Altura" v={sel.altura} />
                <Info l="Foco Principal" v={sel.obj} />
              </div>

              {/* CONTATO */}
              <div className="rounded-2xl border bg-secondary/30 p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Mail className="h-3.5 w-3.5 text-primary" /> {sel.email}
                </div>
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Phone className="h-3.5 w-3.5 text-primary" /> {sel.tel}
                </div>
              </div>

              {/* HISTÓRICO DE CONSULTAS */}
              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Histórico Recente no Prontuário
                </h4>
                <ul className="space-y-2 text-xs">
                  <li className="rounded-xl border bg-card p-3 shadow-xs">
                    <span className="font-bold text-primary">05 nov</span> • Retorno Presencial —
                    Paciente reportou ótima disposição. Redução de 1.2kg.
                  </li>
                  <li className="rounded-xl border bg-card p-3 shadow-xs">
                    <span className="font-bold text-primary">12 out</span> • Ajuste de Plano
                    Alimentar — Incremento de proteína na ceia.
                  </li>
                  <li className="rounded-xl border bg-card p-3 shadow-xs">
                    <span className="font-bold text-primary">20 set</span> • Consulta de Anamnese
                    Inicial — Criação de metas.
                  </li>
                </ul>
              </div>

              {/* AÇÕES RÁPIDAS DO PACIENTE */}
              <div className="grid gap-2 sm:grid-cols-3 border-t pt-4">
                <Link
                  to="/nutricionista/planos"
                  className="rounded-full bg-primary px-4 py-2.5 text-center text-xs font-semibold text-primary-foreground hover:bg-primary-hover flex items-center justify-center gap-1.5"
                >
                  <UtensilsCrossed className="h-3.5 w-3.5" /> Plano Alimentar
                </Link>
                <Link
                  to="/nutricionista/mensagens"
                  className="rounded-full border border-border bg-background px-4 py-2.5 text-center text-xs font-semibold text-foreground hover:bg-secondary flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Enviar Mensagem
                </Link>
                <button
                  onClick={() =>
                    toast.success("Acessando gráficos de bioimpedância de " + sel.nome)
                  }
                  className="rounded-full border border-border bg-background px-4 py-2.5 text-center text-xs font-semibold text-foreground hover:bg-secondary flex items-center justify-center gap-1.5"
                >
                  <LineChart className="h-3.5 w-3.5" /> Ver Evolução
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">
              Escolha um paciente na lista ao lado para visualizar o prontuário.
            </p>
          )}
        </Section>
      </div>

      {/* MODAL NOVO PACIENTE */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-xl">
            <h3 className="font-display text-xl font-bold">Cadastrar Novo Paciente</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Preencha os dados básicos para iniciar o acompanhamento.
            </p>

            <form onSubmit={handleAddPaciente} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Nome Completo *</label>
                <input
                  required
                  placeholder="Ex: Fernanda Lima"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">E-mail do Paciente</label>
                <input
                  type="email"
                  placeholder="paciente@exemplo.com"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Objetivo da Nutrição</label>
                <select
                  value={novoObj}
                  onChange={(e) => setNovoObj(e.target.value)}
                  className="input"
                >
                  <option value="Reeducação Alimentar">Reeducação Alimentar</option>
                  <option value="Perda de Gordura">Perda de Gordura</option>
                  <option value="Hipertrofia">Hipertrofia</option>
                  <option value="Saúde Gastrointestinal">Saúde Gastrointestinal</option>
                </select>
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
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="text-[11px] font-semibold text-muted-foreground">{l}</div>
      <div className="mt-1 text-sm font-bold text-foreground">{v}</div>
    </div>
  );
}

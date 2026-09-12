import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Section } from "@/components/dashboard-shell";
import { toast } from "sonner";
import { User, Calendar, Bell, CreditCard, ShieldCheck, Save, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/nutricionista/configuracoes")({
  component: Config,
});

function Config() {
  const [tab, setTab] = useState<"perfil" | "agenda" | "notificacoes" | "financeiro" | "seguranca">("perfil");

  // Form State
  const [nome, setNome] = useState("Dra. Camila Jardim");
  const [crn, setCrn] = useState("CRN-3 48921");
  const [especialidade, setEspecialidade] = useState("Nutrição Clínica e Esportiva");
  const [valorConsulta, setValorConsulta] = useState("250");
  const [duracaoSessao, setDuracaoSessao] = useState("50");

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifWhatsapp, setNotifWhatsapp] = useState(true);
  const [confirmAuto, setConfirmAuto] = useState(true);

  const [pixKey, setPixKey] = useState("camila.jardim@nutriconnect.com.br");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Configurações atualizadas com sucesso!");
  };

  return (
    <div className="space-y-6">
      {/* TÍTULO E NAVEGAÇÃO POR ABAS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Configurações do Consultório</h1>
          <p className="text-xs text-muted-foreground">Gerencie seus dados profissionais, agenda, valores e segurança</p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary-hover transition"
        >
          <Save className="h-4 w-4" /> Salvar Alterações
        </button>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl bg-secondary/50 p-1.5 border">
        {[
          { id: "perfil", label: "Perfil Profissional", icon: User },
          { id: "agenda", label: "Agenda & Valores", icon: Calendar },
          { id: "notificacoes", label: "Notificações", icon: Bell },
          { id: "financeiro", label: "Recebimentos & PIX", icon: CreditCard },
          { id: "seguranca", label: "Segurança & Dados", icon: ShieldCheck },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              tab === t.id ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:bg-background hover:text-foreground"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* CONTEÚDO DAS ABAS */}
      {tab === "perfil" && (
        <Section title="Dados do Perfil e Registro Profissional">
          <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold mb-1">Nome Completo</label>
              <input value={nome} onChange={(e) => setNome(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Número do CRN (com Região)</label>
              <input value={crn} onChange={(e) => setCrn(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Especialidade Principal</label>
              <input value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">E-mail Profissional</label>
              <input value="dra.camila@nutriconnect.com.br" disabled className="input opacity-70 bg-secondary/30" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold mb-1">Biografia Resumida</label>
              <textarea
                rows={3}
                defaultValue="Especialista em Reeducação Alimentar e Nutrição Esportiva de Alta Performance com 12 anos de consultório."
                className="input resize-none"
              />
            </div>
          </form>
        </Section>
      )}

      {tab === "agenda" && (
        <Section title="Regras de Agendamento e Atendimento">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Valor Padrão da Consulta (R$)</label>
                <input
                  type="number"
                  value={valorConsulta}
                  onChange={(e) => setValorConsulta(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Duração Padrão por Atendimento</label>
                <select
                  value={duracaoSessao}
                  onChange={(e) => setDuracaoSessao(e.target.value)}
                  className="input"
                >
                  <option value="30">30 minutos (Express)</option>
                  <option value="45">45 minutos</option>
                  <option value="50">50 minutos (Padrão)</option>
                  <option value="60">60 minutos (Primeira Consulta)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold">Automação de Horários</label>
              <Toggle
                label="Confirmar agendamentos automaticamente se houver vaga"
                checked={confirmAuto}
                onChange={setConfirmAuto}
              />
              <Toggle
                label="Bloquear agendamento com menos de 24h de antecedência"
                checked={true}
                onChange={() => {}}
              />
              <Toggle
                label="Permitir reagendamento pelo próprio paciente até 12h antes"
                checked={true}
                onChange={() => {}}
              />
            </div>
          </div>
        </Section>
      )}

      {tab === "notificacoes" && (
        <Section title="Canais de Notificação">
          <div className="space-y-4 max-w-xl">
            <Toggle
              label="Receber alerta de novas consultas por e-mail"
              checked={notifEmail}
              onChange={setNotifEmail}
            />
            <Toggle
              label="Enviar lembrete automático no WhatsApp do paciente 24h antes"
              checked={notifWhatsapp}
              onChange={setNotifWhatsapp}
            />
            <Toggle
              label="Notificações push no navegador para novas mensagens de pacientes"
              checked={true}
              onChange={() => {}}
            />
          </div>
        </Section>
      )}

      {tab === "financeiro" && (
        <Section title="Dados Financeiros e Recebimentos via PIX">
          <div className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold mb-1">Chave PIX para Recebimentos Diretos</label>
              <input value={pixKey} onChange={(e) => setPixKey(e.target.value)} className="input" />
            </div>

            <div className="rounded-2xl border bg-secondary/30 p-4 space-y-2 text-xs">
              <div className="font-bold text-foreground">Repasse Automático da Plataforma</div>
              <p className="text-muted-foreground">
                As consultas pagas via cartão de crédito na plataforma são repassadas semanalmente todas as terças-feiras diretamente para sua conta cadastrada.
              </p>
            </div>
          </div>
        </Section>
      )}

      {tab === "seguranca" && (
        <Section title="Segurança da Conta e Privacidade LGPD">
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <div className="text-sm font-semibold">Alterar Senha de Acesso</div>
                <div className="text-xs text-muted-foreground">Última alteração há 30 dias</div>
              </div>
              <button
                onClick={() => toast.success("Link para alteração de senha enviado ao seu e-mail!")}
                className="rounded-full border px-4 py-1.5 text-xs font-semibold hover:bg-secondary"
              >
                Alterar
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <div className="text-sm font-semibold">Exportação Completa de Dados (LGPD)</div>
                <div className="text-xs text-muted-foreground">Baixar arquivo ZIP com todos os prontuários e receitas</div>
              </div>
              <button
                onClick={() => toast.success("Iniciando exportação de dados em segundo plano...")}
                className="rounded-full border px-4 py-1.5 text-xs font-semibold hover:bg-secondary"
              >
                Exportar
              </button>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-2xl border bg-card p-4 cursor-pointer hover:border-primary/40 transition">
      <span className="text-xs font-semibold text-foreground pr-4">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-muted transition checked:bg-primary relative before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition checked:before:translate-x-4 shrink-0"
      />
    </label>
  );
}


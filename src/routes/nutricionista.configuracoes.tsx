import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/dashboard-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/nutricionista/configuracoes")({
  component: Config,
});

function Config() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Preferências">
        <div className="space-y-4">
          <Toggle label="Notificações por e-mail" defaultChecked />
          <Toggle label="Notificações no navegador" />
          <Toggle label="Confirmar consultas automaticamente" defaultChecked />
        </div>
      </Section>
      <Section title="Conta">
        <div className="space-y-3 text-sm">
          <button onClick={() => toast("Senha alterada")} className="w-full rounded-lg border px-4 py-2.5 text-left hover:bg-muted">Alterar senha</button>
          <button onClick={() => toast("Dados exportados")} className="w-full rounded-lg border px-4 py-2.5 text-left hover:bg-muted">Exportar dados</button>
          <button onClick={() => toast.error("Ação irreversível — em breve")} className="w-full rounded-lg border border-destructive/30 px-4 py-2.5 text-left text-destructive hover:bg-destructive/10">Excluir conta</button>
        </div>
      </Section>
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between rounded-lg border bg-secondary/40 p-3">
      <span className="text-sm">{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-muted transition checked:bg-primary relative before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition checked:before:translate-x-4" />
    </label>
  );
}

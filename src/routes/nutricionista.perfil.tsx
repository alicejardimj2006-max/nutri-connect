import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Section } from "@/components/dashboard-shell";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/nutricionista/perfil")({
  component: Perfil,
});

function Perfil() {
  const { user } = useAuth();
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <Section title="Foto">
        <div className="flex flex-col items-center">
          <div className="grid h-32 w-32 place-items-center rounded-full bg-primary-soft text-3xl font-bold text-primary">
            {user?.name.split(" ").map((s) => s[0]).slice(0, 2).join("") ?? "MA"}
          </div>
          <button className="mt-4 rounded-full border px-4 py-1.5 text-xs font-semibold hover:bg-muted">Alterar foto</button>
        </div>
      </Section>
      <Section title="Dados profissionais">
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Nome"><input className="input" defaultValue={user?.name ?? "Dra. Maria Lorena"} /></F>
          <F label="CRN"><input className="input" defaultValue="CRN-3 12345" /></F>
          <F label="Especialidade"><select className="input"><option>Clínica</option><option>Esportiva</option><option>Materno-infantil</option></select></F>
          <F label="Telefone"><input className="input" defaultValue="(11) 98888-7777" /></F>
          <F label="E-mail"><input className="input" defaultValue={user?.email ?? "marina@nutriconnect.com"} /></F>
          <F label="Horário de atendimento"><input className="input" defaultValue="Seg–Sex, 08h–18h" /></F>
        </div>
        <F label="Biografia" className="mt-4">
          <textarea rows={4} className="input resize-none" defaultValue="Nutricionista clínica há 10 anos, com foco em reeducação alimentar e emagrecimento saudável." />
        </F>
        <button onClick={() => toast.success("Perfil atualizado!")} className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90">
          Editar perfil
        </button>
        <style>{`.input{width:100%;border:1px solid var(--border);background:var(--background);border-radius:0.65rem;padding:0.55rem 0.75rem;font-size:0.875rem;outline:none} .input:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in oklch, var(--primary) 20%, transparent)}`}</style>
      </Section>
    </div>
  );
}

function F({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className ?? ""}`}><span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}

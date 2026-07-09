import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Section } from "@/components/dashboard-shell";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/paciente/perfil")({
  component: Perfil,
});

function Perfil() {
  const { user } = useAuth();
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <Section title="Foto">
        <div className="flex flex-col items-center">
          <div className="grid h-32 w-32 place-items-center rounded-full bg-primary-soft text-3xl font-bold text-primary">
            {user?.name.split(" ").map((s) => s[0]).slice(0, 2).join("") ?? "JS"}
          </div>
          <button className="mt-4 rounded-full border px-4 py-1.5 text-xs font-semibold hover:bg-muted">Alterar foto</button>
        </div>
      </Section>
      <Section title="Meus dados">
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Nome"><input className="input" defaultValue={user?.name ?? "João Silva"} /></F>
          <F label="Telefone"><input className="input" defaultValue="(11) 99999-9999" /></F>
          <F label="E-mail"><input className="input" defaultValue={user?.email ?? "joao@email.com"} /></F>
          <F label="Objetivo"><select className="input"><option>Perda de peso</option><option>Ganho de massa</option><option>Manutenção</option></select></F>
          <F label="Restrições alimentares"><input className="input" placeholder="Ex: sem glúten, sem lactose" /></F>
          <F label="Alergias"><input className="input" placeholder="Ex: amendoim" /></F>
        </div>
        <button onClick={() => toast.success("Perfil atualizado!")} className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90">
          Editar perfil
        </button>
        <style>{`.input{width:100%;border:1px solid var(--border);background:var(--background);border-radius:0.65rem;padding:0.55rem 0.75rem;font-size:0.875rem;outline:none} .input:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in oklch, var(--primary) 20%, transparent)}`}</style>
      </Section>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}

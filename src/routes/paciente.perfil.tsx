import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Section } from "@/components/dashboard-shell";
import { useAuth } from "@/hooks/use-auth";
import { updateCurrentUser } from "@/lib/auth";

export const Route = createFileRoute("/paciente/perfil")({
  component: Perfil,
});

function Perfil() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    goal: "Perda de peso",
    dietaryRestrictions: "",
    allergies: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? "",
        phone: user.phone ?? "",
        email: user.email ?? "",
        goal: user.goal ?? "Perda de peso",
        dietaryRestrictions: user.dietaryRestrictions ?? "",
        allergies: user.allergies ?? "",
      });
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("O nome não pode ficar vazio.");
    updateCurrentUser({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      goal: form.goal,
      dietaryRestrictions: form.dietaryRestrictions.trim(),
      allergies: form.allergies.trim(),
    });
    toast.success("Perfil atualizado com sucesso!");
  };

  const initials = user?.name?.trim()
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "PA";

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <Section title="Foto">
        <div className="flex flex-col items-center">
          <div className="grid h-32 w-32 place-items-center rounded-full bg-primary-soft text-3xl font-bold text-primary">
            {initials}
          </div>
          <button
            type="button"
            onClick={() => toast.info("Funcionalidade de upload em breve!")}
            className="mt-4 rounded-full border px-4 py-1.5 text-xs font-semibold hover:bg-muted"
          >
            Alterar foto
          </button>
        </div>
      </Section>
      <Section title="Meus dados">
        <form onSubmit={handleSave}>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Nome">
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Seu nome completo"
              />
            </F>
            <F label="Telefone">
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </F>
            <F label="E-mail">
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="seu@email.com"
              />
            </F>
            <F label="Objetivo">
              <select
                className="input"
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
              >
                <option value="Perda de peso">Perda de peso</option>
                <option value="Ganho de Massa">Ganho de Massa</option>
                <option value="Manutenção">Manutenção</option>
                <option value="Reeducação Alimentar">Reeducação Alimentar</option>
              </select>
            </F>
            <F label="Restrições alimentares">
              <input
                className="input"
                value={form.dietaryRestrictions}
                onChange={(e) => setForm({ ...form, dietaryRestrictions: e.target.value })}
                placeholder="Ex: sem glúten, sem lactose"
              />
            </F>
            <F label="Alergias">
              <input
                className="input"
                value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                placeholder="Ex: amendoim, frutos do mar"
              />
            </F>
          </div>
          <button
            type="submit"
            className="mt-5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90"
          >
            Salvar alterações
          </button>
        </form>
        <style>{`.input{width:100%;border:1px solid var(--border);background:var(--background);border-radius:0.65rem;
        padding:0.55rem 0.75rem;font-size:0.875rem;outline:none} .input:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-
        mix(in oklch, var(--primary) 20%, transparent)}`}</style>
      </Section>
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

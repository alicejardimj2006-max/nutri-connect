import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Section } from "@/components/dashboard-shell";
import { useAuth } from "@/hooks/use-auth";
import { updateCurrentUser } from "@/lib/auth";

export const Route = createFileRoute("/nutricionista/perfil")({
  component: Perfil,
});

function Perfil() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    crn: "",
    specialty: "Clínica",
    phone: "",
    email: "",
    attendanceHours: "Seg–Sex, 08h–18h",
    bio: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? "",
        crn: user.crn ?? "",
        specialty: user.specialty ?? "Clínica",
        phone: user.phone ?? "",
        email: user.email ?? "",
        attendanceHours: user.attendanceHours ?? "Seg–Sex, 08h–18h",
        bio: user.bio ?? "",
      });
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("O nome não pode ficar vazio.");
    updateCurrentUser({
      name: form.name.trim(),
      crn: form.crn.trim(),
      specialty: form.specialty,
      phone: form.phone.trim(),
      email: form.email.trim(),
      attendanceHours: form.attendanceHours.trim(),
      bio: form.bio.trim(),
    });
    toast.success("Perfil profissional atualizado com sucesso!");
  };

  const initials = user?.name?.trim()
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "NU";

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
            className="mt-4 rounded-full border px-5 py-1.5 text-xs font-semibold hover:bg-muted shadow-sm"
          >
            Alterar foto
          </button>
        </div>
      </Section>
      <Section title="Dados profissionais">
        <form onSubmit={handleSave}>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Nome">
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Dra. Maria Souza"
              />
            </F>
            <F label="CRN">
              <input
                className="input"
                value={form.crn}
                onChange={(e) => setForm({ ...form, crn: e.target.value })}
                placeholder="Ex: CRN-3 12345"
              />
            </F>
            <F label="Especialidade">
              <select
                className="input"
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              >
                <option value="Clínica">Clínica</option>
                <option value="Esportiva">Esportiva</option>
                <option value="Materno-infantil">Materno-infantil</option>
                <option value="Comportamental">Comportamental</option>
                <option value="Funcional">Funcional</option>
              </select>
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
            <F label="Horário de atendimento">
              <input
                className="input"
                value={form.attendanceHours}
                onChange={(e) => setForm({ ...form, attendanceHours: e.target.value })}
                placeholder="Ex: Seg–Sex, 08h–18h"
              />
            </F>
          </div>
          <F label="Biografia" className="mt-4">
            <textarea
              rows={4}
              className="input resize-none"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Descreva sua experiência, especializações e metodologia..."
            />
          </F>
          <button
            type="submit"
            className="mt-5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90"
          >
            Salvar alterações
          </button>
        </form>
        <style>{`.input{width:100%;border:1px solid var(--border);background:var(--background);border-radius:0.65rem;padding:0.55rem 0.75rem;font-size:0.875rem;outline:none} .input:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in oklch, var(--primary) 20%, transparent)}`}</style>
      </Section>
    </div>
  );
}

function F({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

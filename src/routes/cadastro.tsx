import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { mockLogin, type UserRole } from "@/lib/auth";
import { AuthLayout, Field, RoleTabs } from "./login";

export const Route = createFileRoute("/cadastro")({
  head: () => ({ meta: [{ title: "Criar conta — NutriConnect" }] }),
  component: Cadastro,
});

function Cadastro() {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("paciente");
  const [form, setForm] = useState({ nome: "", cpf: "", nasc: "", tel: "", email: "", senha: "", conf: "" });

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(form).some((v) => !v)) return toast.error("Preencha todos os campos.");
    if (form.senha !== form.conf) return toast.error("As senhas não coincidem.");
    if (form.senha.length < 6) return toast.error("A senha deve ter ao menos 6 caracteres.");
    mockLogin(form.email, role);
    toast.success("Conta criada com sucesso!");
    navigate({ to: role === "nutricionista" ? "/nutricionista/dashboard" : "/paciente/dashboard" });
  };

  return (
    <AuthLayout title="Criar conta" subtitle="Comece sua jornada com a NutriConnect.">
      <form onSubmit={submit} className="space-y-4">
        <RoleTabs role={role} onChange={setRole} />
        <Field label="Nome completo"><input className="input" value={form.nome} onChange={upd("nome")} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="CPF"><input className="input" value={form.cpf} onChange={upd("cpf")} placeholder="000.000.000-00" /></Field>
          <Field label="Data de nascimento"><input type="date" className="input" value={form.nasc} onChange={upd("nasc")} /></Field>
        </div>
        <Field label="Telefone"><input className="input" value={form.tel} onChange={upd("tel")} placeholder="(11) 99999-9999" /></Field>
        <Field label="E-mail"><input type="email" className="input" value={form.email} onChange={upd("email")} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Senha"><input type="password" className="input" value={form.senha} onChange={upd("senha")} /></Field>
          <Field label="Confirmar senha"><input type="password" className="input" value={form.conf} onChange={upd("conf")} /></Field>
        </div>
        <button className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90">
          Criar conta
        </button>
        <p className="text-center text-sm text-muted-foreground">
          Já possui conta? <Link to="/login" className="text-primary hover:underline">Entrar</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

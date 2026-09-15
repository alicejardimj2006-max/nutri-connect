import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { registerUser, type UserRole } from "@/lib/auth";
import { AuthLayout, Field, RoleTabs } from "./login";

export const Route = createFileRoute("/cadastro")({
  head: () => ({ meta: [{ title: "Criar conta — NutriConnect" }] }),
  component: Cadastro,
});

function Cadastro() {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("paciente");
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    nasc: "",
    tel: "",
    email: "",
    senha: "",
    conf: "",
    crn: "",
    especialidade: "",
  });
  const [selectedGoal, setSelectedGoal] = useState("Comer melhor e com prazer");

  const GOALS = [
    "Comer melhor e com prazer",
    "Melhorar minha rotina alimentar",
    "Cozinhar mais em casa",
    "Aprender receitas práticas",
    "Organização de marmitas",
    "Alimentação vegetariana",
    "Ganho de massa muscular",
    "Emagrecimento consciente",
    "Qualidade de vida",
  ];

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNome = form.nome.trim();
    const cleanEmail = form.email.trim();
    const cleanTel = form.tel.trim();
    const cleanSenha = form.senha;
    const cleanConf = form.conf;

    if (!cleanNome) return toast.error("Preencha seu nome.");
    if (!cleanEmail) return toast.error("Preencha seu e-mail.");
    if (!/\S+@\S+\.\S+/.test(cleanEmail)) return toast.error("E-mail inválido.");
    if (!cleanTel) return toast.error("Preencha seu telefone.");
    if (!cleanSenha) return toast.error("Preencha sua senha.");
    if (cleanSenha.length < 6) return toast.error("A senha deve ter ao menos 6 caracteres.");
    if (cleanSenha !== cleanConf) return toast.error("As senhas não coincidem.");

    try {
      registerUser({
        name: cleanNome,
        email: cleanEmail,
        role,
        phone: cleanTel,
        cpf: form.cpf,
        birthDate: form.nasc,
        password: cleanSenha,
        goal: role === "paciente" ? selectedGoal : undefined,
        journeyGoal: role === "paciente" ? selectedGoal : undefined,
        crn: role === "nutricionista" ? form.crn : undefined,
        specialty: role === "nutricionista" ? form.especialidade : undefined,
      });
      toast.success("Conta criada com sucesso! Bem-vindo à comunidade.");
      navigate({ to: role === "nutricionista" ? "/nutricionista/dashboard" : "/minha-jornada" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar conta.");
    }
  };

  return (
    <AuthLayout
      title="Começar minha jornada"
      subtitle="Faça parte de uma comunidade que cuida da alimentação de verdade."
    >
      <form onSubmit={submit} className="space-y-4">
        <RoleTabs role={role} onChange={setRole} />
        <Field label="Nome completo">
          <input
            className="input"
            value={form.nome}
            onChange={upd("nome")}
            placeholder="Como gostaria de ser chamado(a)?"
          />
        </Field>

        {/* Objetivos da jornada para membros comuns */}
        {role === "paciente" && (
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-foreground">
              Qual o foco da sua caminhada alimentar?
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 rounded-xl border border-border/80 bg-secondary/30">
              {GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGoal(g)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer ${
                    selectedGoal === g
                      ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                      : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {role === "nutricionista" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="CRN">
              <input
                className="input"
                value={form.crn}
                onChange={upd("crn")}
                placeholder="00000/UF"
              />
            </Field>
            <Field label="Especialidade Principal">
              <input
                className="input"
                value={form.especialidade}
                onChange={upd("especialidade")}
                placeholder="Ex: Esportiva, Clínica"
              />
            </Field>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label={role === "nutricionista" ? "CPF" : "CPF (Opcional)"}>
            <input
              className="input"
              value={form.cpf}
              onChange={upd("cpf")}
              placeholder="000.000.000-00"
            />
          </Field>
          <Field label="Data de nascimento">
            <input type="date" className="input" value={form.nasc} onChange={upd("nasc")} />
          </Field>
        </div>
        <Field label="Telefone">
          <input
            className="input"
            value={form.tel}
            onChange={upd("tel")}
            placeholder="(11) 99999-9999"
          />
        </Field>
        <Field label="E-mail">
          <input
            type="email"
            className="input"
            value={form.email}
            onChange={upd("email")}
            placeholder="seu@email.com"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Senha">
            <input
              type="password"
              className="input"
              value={form.senha}
              onChange={upd("senha")}
              placeholder="Mínimo 6 caracteres"
            />
          </Field>
          <Field label="Confirmar senha">
            <input
              type="password"
              className="input"
              value={form.conf}
              onChange={upd("conf")}
              placeholder="Repita a senha"
            />
          </Field>
        </div>
        <button className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-soft hover:bg-accent/90 transition">
          Criar minha conta e começar
        </button>
        <p className="text-center text-sm text-muted-foreground">
          Já possui conta?{" "}
          <Link to="/login" className="text-accent hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

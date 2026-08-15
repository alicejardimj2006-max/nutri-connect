import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { useState } from "react";
import { mockLogin, type UserRole } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — NutriConnect" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("paciente");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Preencha e-mail e senha.");
    mockLogin(email, role);
    toast.success("Bem-vindo(a) de volta!");
    navigate({ to: role === "nutricionista" ? "/nutricionista/dashboard" : "/paciente/dashboard" });
  };

  return (
    <AuthLayout title="Entrar" subtitle="Acesse sua conta NutriConnect.">
      <form onSubmit={submit} className="space-y-4">
        <RoleTabs role={role} onChange={setRole} />
        <Field label="E-mail">
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
        </Field>
        <Field label="Senha">
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </Field>
        <button className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90">
          Entrar
        </button>
        <div className="flex items-center justify-between text-sm">
          <Link to="/recuperar-senha" className="text-primary hover:underline">Esqueceu a senha?</Link>
          <Link to="/cadastro" className="text-muted-foreground hover:text-foreground">Criar uma conta</Link>
        </div>
      </form>
    </AuthLayout>
  );
}

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-secondary/40">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary to-primary-soft p-12 text-primary-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 backdrop-blur">
            <Leaf className="h-5 w-5" />
          </span>
          NutriConnect
        </Link>
        <div>
          <h2 className="text-4xl font-extrabold leading-tight">Nutrição personalizada conforme sua rotina.</h2>
          <p className="mt-4 max-w-md text-white/90">
            Acompanhe sua evolução, converse com seu nutricionista, receba planos alimentares sob medida e dicas de receitas.
          </p>
        </div>
        <p className="text-sm text-white/80">© {new Date().getFullYear()} NutriConnect</p>
      </div>
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground lg:hidden">
            <Leaf className="h-4 w-4 text-primary" /> NutriConnect
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
          <div className="mt-8 rounded-2xl border bg-card p-6 shadow-card">{children}</div>
        </div>
      </div>
      <style>{`.input{width:100%;border:1px solid var(--border);background:var(--background);border-radius:0.75rem;padding:0.65rem 0.9rem;font-size:0.875rem;outline:none;transition:all .15s} .input:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in oklch, var(--primary) 20%, transparent)}`}</style>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

export function RoleTabs({ role, onChange }: { role: UserRole; onChange: (r: UserRole) => void }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-full bg-secondary p-1">
      {(["paciente", "nutricionista"] as const).map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
            role === r ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

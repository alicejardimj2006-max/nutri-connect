import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Leaf, Sparkles, Users, ChefHat, Award, Compass } from "lucide-react";
import { useState } from "react";
import { loginUser } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — NutriConnect" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return toast.error("Preencha seu e-mail.");
    if (!password) return toast.error("Preencha sua senha.");

    try {
      loginUser(cleanEmail, password);
      toast.success("Bem-vindo(a) de volta à sua jornada!");
      navigate({ to: "/espaco" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao fazer login.");
    }
  };
  return (
    <AuthLayout title="Bem-vindo de volta" subtitle="Entre na sua conta para continuar sua jornada.">
      <form onSubmit={submit} className="space-y-5">
        <Field label="E-mail">
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
          />
        </Field>
        <Field label="Senha">
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        <button className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90 cursor-pointer">
          Entrar na comunidade
        </button>
        <div className="flex items-center justify-between text-sm">
          <Link to="/recuperar-senha" className="text-accent hover:underline">
            Esqueceu a senha?
          </Link>
          <Link to="/cadastro" className="text-muted-foreground hover:text-foreground">
            Criar uma conta
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

const FEATURES = [
  { icon: Users, label: "Comunidades temáticas para trocar experiências" },
  { icon: ChefHat, label: "Receitas de verdade compartilhadas pela comunidade" },
  { icon: Award, label: "Desafios de hábitos, no seu próprio ritmo" },
  { icon: Compass, label: "Um feed diário com histórias reais, sem julgamento" },
];

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-secondary/40">
      {/* Landing — apresentação da rede (metade esquerda) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-10 sm:p-14 text-primary-foreground lg:flex">
        <img
          src="/images/hero/hero-table.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary/95 to-primary" />
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute bottom-0 -left-10 h-56 w-56 rounded-full bg-chart-4/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2 text-lg font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
            <Leaf className="h-5 w-5" />
          </span>
          NutriConnect
        </div>

        <div className="relative z-10 space-y-7">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Rede social de alimentação
            </span>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight font-display">
              Sua alimentação.
              <br />
              Sua jornada.
              <br />
              <span className="text-accent-soft">Sua rede.</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85">
              Compartilhe receitas, participe de comunidades temáticas e desafios de hábitos — e
              construa uma relação mais leve com a comida, junto com outras pessoas.
            </p>
          </div>

          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-3 text-sm text-white/90">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur">
                  <f.icon className="h-4 w-4" />
                </span>
                <span>{f.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/70">
          © {new Date().getFullYear()} NutriConnect. Sua caminhada, no seu ritmo.
        </p>
      </div>

      {/* Cadastro / Login (metade direita) */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-foreground lg:hidden">
            <Leaf className="h-4 w-4 text-primary" /> NutriConnect
          </div>
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

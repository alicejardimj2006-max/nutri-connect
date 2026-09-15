import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout, Field } from "./login";
import { KeyRound, Mail, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({ meta: [{ title: "Recuperar Senha — NutriConnect" }] }),
  component: Recuperar,
});

function Recuperar() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [conf, setConf] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Informe o seu e-mail cadastrado.");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Código de 6 dígitos enviado para " + email);
      setStep(2);
    }, 800);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4) return toast.error("Por favor, digite o código completo.");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Código validado com sucesso!");
      setStep(3);
    }, 800);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== conf) return toast.error("As senhas não coincidem.");
    if (novaSenha.length < 6) return toast.error("A senha deve ter no mínimo 6 caracteres.");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Sua senha foi redefinida!");
      setStep(4);
    }, 800);
  };

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle={
        step === 1
          ? "Enviaremos um código de verificação para o seu e-mail."
          : step === 2
            ? `Digite o código enviado para ${email}`
            : step === 3
              ? "Crie uma nova senha segura para sua conta."
              : "Tudo pronto!"
      }
    >
      {/* INDICADOR DE PASSOS */}
      <div className="mb-6 flex items-center justify-between border-b pb-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                step === s
                  ? "bg-primary text-primary-foreground"
                  : step > s
                    ? "bg-emerald-500 text-white"
                    : "bg-secondary text-muted-foreground"
              }`}
            >
              {step > s ? "✓" : s}
            </span>
            <span className="text-xs font-medium hidden sm:inline">
              {s === 1 ? "E-mail" : s === 2 ? "Código" : "Nova Senha"}
            </span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <form onSubmit={handleSendEmail} className="space-y-4">
          <Field label="Seu e-mail cadastrado">
            <div className="relative">
              <input
                type="email"
                required
                className="input pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
              />
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover transition disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar código de verificação"}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Lembrou a senha?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Voltar ao login
            </Link>
          </p>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <Field label="Código de 6 dígitos">
            <input
              type="text"
              required
              maxLength={6}
              className="input tracking-[0.5em] text-center text-xl font-bold uppercase"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="123456"
            />
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover transition disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Verificar Código"}
          </button>
          <div className="flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-muted-foreground hover:text-foreground"
            >
              Trocar e-mail
            </button>
            <button
              type="button"
              onClick={() => toast.success("Novo código reenviado!")}
              className="text-primary font-semibold hover:underline"
            >
              Reenviar código
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Field label="Nova Senha">
            <input
              type="password"
              required
              minLength={6}
              className="input"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="••••••••"
            />
          </Field>
          <Field label="Confirmar Nova Senha">
            <input
              type="password"
              required
              className="input"
              value={conf}
              onChange={(e) => setConf(e.target.value)}
              placeholder="••••••••"
            />
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary-hover transition disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Redefinir Senha"}
          </button>
        </form>
      )}

      {step === 4 && (
        <div className="py-6 text-center space-y-4">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="font-display text-xl font-bold">Senha alterada com sucesso!</h3>
          <p className="text-xs text-muted-foreground">
            Sua conta já está segura com a nova senha. Clique abaixo para fazer login.
          </p>
          <button
            onClick={() => navigate({ to: "/login" })}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Ir para o Login <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </AuthLayout>
  );
}

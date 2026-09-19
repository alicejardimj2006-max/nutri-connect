import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthLayout, Field } from "./login";
import { KeyRound, Mail, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({ meta: [{ title: "Recuperar Senha • NutriConnect" }] }),
  component: Recuperar,
});

function Recuperar() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [conf, setConf] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Escuta evento de recuperacao de senha do Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setStep(3);
      }
    });

    // Fallback verificando hash na URL
    if (window.location.hash.includes("type=recovery")) {
      setStep(3);
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Informe o seu e-mail cadastrado.");

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/recuperar-senha`,
    });
    setLoading(false);

    if (error) {
      if (error.message.includes("rate limit")) {
        toast.error("Muitas tentativas. Tente novamente mais tarde.");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("E-mail de recuperação enviado para " + email);
      setStep(2);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== conf) return toast.error("As senhas não coincidem.");
    if (novaSenha.length < 6) return toast.error("A senha deve ter no mínimo 6 caracteres.");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Sua senha foi redefinida!");
      setStep(4);
      // Força logout para obrigar login limpo com a nova senha
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle={
        step === 1
          ? "Enviaremos um link de recuperação para o seu e-mail."
          : step === 2
            ? `Verifique sua caixa de entrada no e-mail ${email}`
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
              {s === 1 ? "E-mail" : s === 2 ? "Aviso" : "Nova Senha"}
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
            {loading ? "Enviando..." : "Enviar link de recuperação"}
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
        <div className="space-y-4 text-center py-4">
          <Mail className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
          <p className="text-sm text-muted-foreground">
            Enviamos um link de recuperação para o seu e-mail. Por favor, verifique sua caixa de
            entrada e clique no link para redefinir sua senha.
          </p>
          <div className="pt-4 flex flex-col gap-2 justify-center items-center text-xs">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-muted-foreground hover:text-foreground"
            >
              Tentar outro e-mail
            </button>
          </div>
        </div>
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

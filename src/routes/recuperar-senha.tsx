import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout, Field } from "./login";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({ meta: [{ title: "Recuperar senha — NutriConnect" }] }),
  component: Recuperar,
});

function Recuperar() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [conf, setConf] = useState("");

  return (
    <AuthLayout title="Recuperar senha" subtitle={step === 1 ? "Enviaremos um código para o seu e-mail." : step === 2 ? "Digite o código recebido." : "Defina sua nova senha."}>
      {step === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); if (!email) return toast.error("Informe o e-mail."); toast.success("Código enviado!"); setStep(2); }} className="space-y-4">
          <Field label="E-mail"><input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <button className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90">Enviar código</button>
          <p className="text-center text-sm"><Link to="/login" className="text-muted-foreground hover:text-foreground">Voltar ao login</Link></p>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); if (code.length < 4) return toast.error("Código inválido."); setStep(3); }} className="space-y-4">
          <Field label="Código de verificação"><input className="input tracking-[0.5em] text-center text-lg font-semibold" value={code} onChange={(e) => setCode(e.target.value)} placeholder="0000" maxLength={6} /></Field>
          <button className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90">Verificar código</button>
        </form>
      )}
      {step === 3 && (
        <form onSubmit={(e) => { e.preventDefault(); if (novaSenha !== conf) return toast.error("Senhas não coincidem."); if (novaSenha.length < 6) return toast.error("Mínimo 6 caracteres."); toast.success("Senha alterada!"); }} className="space-y-4">
          <Field label="Nova senha"><input type="password" className="input" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} /></Field>
          <Field label="Confirmar senha"><input type="password" className="input" value={conf} onChange={(e) => setConf(e.target.value)} /></Field>
          <button className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90">Alterar senha</button>
        </form>
      )}
    </AuthLayout>
  );
}

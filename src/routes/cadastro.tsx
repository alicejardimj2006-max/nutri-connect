import { td } from "@/lib/i18n/data";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { registerUser } from "@/lib/auth";
import { JOURNEY_GOALS } from "@/lib/community";
import { AuthLayout, Field } from "./login";
import { useI18n } from "@/hooks/use-i18n";

export const Route = createFileRoute("/cadastro")({
  head: () => ({ meta: [{ title: "Criar conta — NutriConnect" }] }),
  component: Cadastro,
});

function Cadastro() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    nasc: "",
    tel: "",
    email: "",
    senha: "",
    conf: "",
  });
  const [selectedGoal, setSelectedGoal] = useState<string>(JOURNEY_GOALS[0]);

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNome = form.nome.trim();
    const cleanEmail = form.email.trim();
    const cleanTel = form.tel.trim();
    const cleanSenha = form.senha;
    const cleanConf = form.conf;

    if (!cleanNome) return toast.error(t("signup.fillName"));
    if (!cleanEmail) return toast.error(t("auth.fillEmail"));
    if (!/\S+@\S+\.\S+/.test(cleanEmail)) return toast.error(t("signup.invalidEmail"));
    if (!cleanTel) return toast.error(t("signup.fillPhone"));
    if (!cleanSenha) return toast.error(t("auth.fillPassword"));
    if (cleanSenha.length < 6) return toast.error(t("signup.shortPassword"));
    if (cleanSenha !== cleanConf) return toast.error(t("signup.mismatch"));

    try {
      registerUser({
        name: cleanNome,
        email: cleanEmail,
        phone: cleanTel,
        cpf: form.cpf,
        birthDate: form.nasc,
        password: cleanSenha,
        goal: selectedGoal,
        journeyGoal: selectedGoal,
      });
      toast.success(t("signup.success"));
      navigate({ to: "/espaco" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("signup.error"));
    }
  };

  return (
    <AuthLayout title={t("signup.title")} subtitle={t("signup.subtitle")}>
      <form onSubmit={submit} className="space-y-4">
        <Field label={t("signup.fullName")}>
          <input
            className="input"
            value={form.nome}
            onChange={upd("nome")}
            placeholder={t("signup.namePlaceholder")}
          />
        </Field>

        <div>
          <span className="mb-1.5 block text-xs font-semibold text-foreground">
            {t("signup.goalQuestion")}
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 rounded-xl border border-border/80 bg-secondary/30">
            {JOURNEY_GOALS.map((g) => (
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
                {td(g)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={`${t("settings.account.cpf")} (${t("common.optional")})`}>
            <input
              className="input"
              value={form.cpf}
              onChange={upd("cpf")}
              placeholder="000.000.000-00"
            />
          </Field>
          <Field label={t("signup.birthDate")}>
            <input type="date" className="input" value={form.nasc} onChange={upd("nasc")} />
          </Field>
        </div>
        <Field label={t("signup.phone")}>
          <input
            className="input"
            value={form.tel}
            onChange={upd("tel")}
            placeholder="(11) 99999-9999"
          />
        </Field>
        <Field label={t("auth.email")}>
          <input
            type="email"
            className="input"
            value={form.email}
            onChange={upd("email")}
            placeholder="seu@email.com"
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={t("auth.password")}>
            <input
              type="password"
              className="input"
              value={form.senha}
              onChange={upd("senha")}
              placeholder={t("signup.passwordPlaceholder")}
            />
          </Field>
          <Field label={t("signup.confirmPassword")}>
            <input
              type="password"
              className="input"
              value={form.conf}
              onChange={upd("conf")}
              placeholder={t("signup.confirmPlaceholder")}
            />
          </Field>
        </div>
        <button className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-soft hover:bg-accent/90 transition">
          {t("signup.submit")}
        </button>
        <p className="text-center text-sm text-muted-foreground">
          {t("signup.haveAccount")}{" "}
          <Link to="/login" className="text-accent hover:underline font-medium">
            {t("signup.signIn")}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

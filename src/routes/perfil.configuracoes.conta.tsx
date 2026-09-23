import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Download, Pencil, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { changePassword, deleteAccount, updateCurrentUser } from "@/lib/auth";
import { Field } from "./login";

export const Route = createFileRoute("/perfil/configuracoes/conta")({
  head: () => ({ meta: [{ title: "Conta e segurança — NutriConnect" }] }),
  component: ContaPage,
});

function ContaPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [phone, setPhone] = useState(user?.phone ?? "");
  const [cpf, setCpf] = useState(user?.cpf ?? "");
  const [birthDate, setBirthDate] = useState(user?.birthDate ?? "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!user) return null;

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({ phone: phone.trim(), cpf: cpf.trim(), birthDate });
    toast.success(t("settings.account.contactInfo.saved"));
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error(t("settings.account.password.tooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("settings.account.password.mismatch"));
      return;
    }
    try {
      changePassword(currentPassword, newPassword);
      toast.success(t("settings.account.password.success"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error(t("settings.account.password.wrongCurrent"));
    }
  };

  const handleExportData = () => {
    const blob = new Blob([JSON.stringify(user, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nutriconnect-meus-dados.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    deleteAccount();
    toast.success(t("settings.account.danger.delete.success"));
    navigate({ to: "/login" });
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-8">
      <Link
        to="/perfil/configuracoes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{t("settings.account.back")}</span>
      </Link>

      <h1 className="text-3xl font-extrabold font-display text-foreground mb-8">
        {t("settings.account.title")}
      </h1>

      <div className="space-y-6">
        {/* Informações pessoais */}
        <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <h2 className="text-sm font-bold font-display text-foreground">
            {t("settings.account.personalInfo.title")}
          </h2>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {t("settings.account.personalInfo.hint")}
          </p>
          <Link
            to="/perfil/editar"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary"
          >
            <Pencil className="h-3.5 w-3.5" />
            {t("settings.account.personalInfo.editLink")}
          </Link>
        </section>

        {/* Contato e documento */}
        <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <h2 className="text-sm font-bold font-display text-foreground mb-4">
            {t("settings.account.contactInfo.title")}
          </h2>
          <form onSubmit={handleSaveContact} className="space-y-3">
            <Field label={t("settings.account.email")}>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full rounded-xl border border-border bg-secondary/30 px-3.5 py-2.5 text-sm text-muted-foreground"
              />
            </Field>
            <Field label={t("settings.account.phone")}>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("settings.account.phone.placeholder")}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground"
              />
            </Field>
            <Field label={`${t("settings.account.cpf")} (${t("common.optional")})`}>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder={t("settings.account.cpf.placeholder")}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground"
              />
            </Field>
            <Field label={t("settings.account.birthDate")}>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground"
              />
            </Field>
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              {t("common.save")}
            </button>
          </form>
        </section>

        {/* Senha */}
        <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <h2 className="text-sm font-bold font-display text-foreground mb-4">
            {t("settings.account.password.title")}
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <Field label={t("settings.account.password.current")}>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground"
              />
            </Field>
            <Field label={t("settings.account.password.new")}>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground"
              />
            </Field>
            <Field label={t("settings.account.password.confirm")}>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground"
              />
            </Field>
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              {t("settings.account.password.submit")}
            </button>
          </form>
        </section>

        {/* Meus dados */}
        <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <h2 className="text-sm font-bold font-display text-foreground">
            {t("settings.account.data.title")}
          </h2>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {t("settings.account.data.exportHint")}
          </p>
          <button
            type="button"
            onClick={handleExportData}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary"
          >
            <Download className="h-3.5 w-3.5" />
            {t("settings.account.data.export")}
          </button>
        </section>

        {/* Zona de risco */}
        <section className="rounded-2xl border border-destructive/40 bg-destructive/5 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <h2 className="text-sm font-bold font-display text-destructive">
              {t("settings.account.danger.title")}
            </h2>
          </div>
          <p className="mt-3 text-sm font-semibold text-foreground">
            {t("settings.account.danger.delete.title")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("settings.account.danger.delete.hint")}
          </p>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-4 rounded-full border border-destructive/50 px-5 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
            >
              {t("settings.account.danger.delete.button")}
            </button>
          ) : (
            <div className="mt-4 rounded-xl border border-destructive/30 bg-card p-4">
              <p className="text-sm font-bold text-foreground">
                {t("settings.account.danger.delete.confirmTitle")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("settings.account.danger.delete.confirmHint")}
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={t("settings.account.danger.delete.confirmPlaceholder")}
                className="mt-3 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground"
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={
                    deleteConfirmText.trim().toLowerCase() !==
                    t("settings.account.danger.delete.confirmPlaceholder")
                  }
                  onClick={handleDeleteAccount}
                  className="rounded-full bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t("settings.account.danger.delete.confirmButton")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText("");
                  }}
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Download, Pencil, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { changePassword, deleteAccount, updateCurrentUser } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Field } from "./login";
import { buttonClass, useTr } from "@/components/settings-ui";

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

  const tr = useTr();
  const [newEmail, setNewEmail] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Preenche os campos quando a sessão termina de carregar.
  useEffect(() => {
    if (!user) return;
    setPhone(user.phone ?? "");
    setCpf(user.cpf ?? "");
    setBirthDate(user.birthDate ?? "");
  }, [user]);

  if (!user) return null;

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error(
        tr([
          "Informe um e-mail válido.",
          "Enter a valid email.",
          "Introduce un correo válido.",
          "Saisissez un e-mail valide.",
        ]),
      );
      return;
    }
    const { error } = await supabase.auth.updateUser({ email });
    if (error) {
      toast.error(
        tr([
          "Não foi possível trocar o e-mail agora.",
          "Could not change the email right now.",
          "No se pudo cambiar el correo ahora.",
          "Impossible de changer l'e-mail pour le moment.",
        ]),
      );
      return;
    }
    setNewEmail("");
    toast.success(
      tr([
        "Enviamos um link de confirmação. O e-mail só muda depois que você confirmar.",
        "We sent a confirmation link. The email only changes after you confirm it.",
        "Enviamos un enlace de confirmación. El correo solo cambia después de confirmarlo.",
        "Nous avons envoyé un lien de confirmation. L'e-mail ne change qu'après confirmation.",
      ]),
      { duration: 8000 },
    );
  };

  const handleSignOutEverywhere = async () => {
    if (
      !window.confirm(
        tr([
          "Sair de todos os aparelhos, inclusive este?",
          "Sign out of all devices, including this one?",
          "¿Cerrar sesión en todos los dispositivos, incluido este?",
          "Se déconnecter de tous les appareils, y compris celui-ci ?",
        ]),
      )
    )
      return;
    await supabase.auth.signOut({ scope: "global" });
    navigate({ to: "/login" });
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCurrentUser({ phone: phone.trim(), cpf: cpf.trim(), birthDate });
      toast.success(t("settings.account.contactInfo.saved"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("reset.error"));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
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
      await changePassword(currentPassword, newPassword);
      toast.success(t("settings.account.password.success"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error(t("settings.account.password.wrongCurrent"));
    }
  };

  const handleExportData = async () => {
    const { data, error } = await supabase.rpc("export_my_data");
    if (error || !data) return void toast.error(t("reset.error"));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nutriconnect-meus-dados.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      toast.success(t("settings.account.danger.delete.success"));
      navigate({ to: "/login" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("reset.error"));
    }
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

      <h1 className="sr-only">{t("settings.account.title")}</h1>

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

        {/* Acesso e segurança */}
        <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <h2 className="text-sm font-bold font-display text-foreground">
            {tr([
              "Acesso e segurança",
              "Access and security",
              "Acceso y seguridad",
              "Accès et sécurité",
            ])}
          </h2>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {tr([
              "E-mail de acesso atual:",
              "Current sign-in email:",
              "Correo de acceso actual:",
              "E-mail de connexion actuel :",
            ])}{" "}
            <span className="font-semibold text-foreground">{user.email}</span>
          </p>
          <form onSubmit={handleChangeEmail} className="mt-4 flex flex-wrap items-center gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder={tr(["Novo e-mail", "New email", "Nuevo correo", "Nouvel e-mail"])}
              className="min-w-0 flex-1 rounded-xl border border-input bg-background px-3.5 py-2 text-sm outline-none focus:border-accent"
            />
            <button type="submit" disabled={!newEmail.trim()} className={buttonClass}>
              {tr(["Trocar e-mail", "Change email", "Cambiar correo", "Changer l'e-mail"])}
            </button>
          </form>
          <div className="mt-5 border-t border-border/60 pt-4">
            <p className="text-xs text-muted-foreground">
              {tr([
                "Perdeu um aparelho ou entrou num computador de outra pessoa? Encerre todas as sessões abertas.",
                "Lost a device or signed in on someone else's computer? End all open sessions.",
                "¿Perdiste un dispositivo o entraste en el ordenador de otra persona? Cierra todas las sesiones abiertas.",
                "Perdu un appareil ou connecté sur l'ordinateur de quelqu'un ? Fermez toutes les sessions ouvertes.",
              ])}
            </p>
            <button
              type="button"
              onClick={handleSignOutEverywhere}
              className={`${buttonClass} mt-3`}
            >
              {tr([
                "Sair de todos os aparelhos",
                "Sign out of all devices",
                "Cerrar sesión en todos los dispositivos",
                "Se déconnecter de tous les appareils",
              ])}
            </button>
          </div>
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

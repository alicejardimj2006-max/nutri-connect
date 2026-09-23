import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Ban } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_PRIVACY,
  loadBlockedUsers,
  loadPrivacySettings,
  savePrivacySettings,
  unblockUser,
  type BlockedUser,
  type PrivacySettings,
} from "@/lib/settings";

export const Route = createFileRoute("/perfil/configuracoes/privacidade")({
  head: () => ({ meta: [{ title: "Privacidade — NutriConnect" }] }),
  component: PrivacidadePage,
});

function Row({
  title,
  hint,
  checked,
  onChange,
}: {
  title: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function PrivacidadePage() {
  const { user } = useAuth();
  const { t } = useI18n();

  const [privacy, setPrivacy] = useState<PrivacySettings>(DEFAULT_PRIVACY);
  const [blocked, setBlocked] = useState<BlockedUser[]>([]);

  useEffect(() => {
    if (!user) return;
    setPrivacy(loadPrivacySettings(user.id));
    setBlocked(loadBlockedUsers(user.id));
  }, [user]);

  if (!user) return null;

  const update = (patch: Partial<PrivacySettings>) => {
    const next = { ...privacy, ...patch };
    setPrivacy(next);
    savePrivacySettings(user.id, next);
  };

  const handleUnblock = (targetId: string) => {
    unblockUser(user.id, targetId);
    setBlocked((prev) => prev.filter((b) => b.userId !== targetId));
    toast.success(t("settings.privacy.blocked.unblocked"));
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
        {t("settings.privacy.title")}
      </h1>

      <div className="space-y-6">
        <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <h2 className="text-sm font-bold font-display text-foreground">
            {t("settings.privacy.profile.title")}
          </h2>
          <div className="mt-2 divide-y divide-border/60">
            <Row
              title={t("settings.privacy.profile.private")}
              hint={t("settings.privacy.profile.privateHint")}
              checked={privacy.privateProfile}
              onChange={(v) => update({ privateProfile: v })}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <h2 className="text-sm font-bold font-display text-foreground">
            {t("settings.privacy.contact.title")}
          </h2>
          <div className="mt-2 divide-y divide-border/60">
            <Row
              title={t("settings.privacy.contact.showEmail")}
              hint=""
              checked={privacy.showEmail}
              onChange={(v) => update({ showEmail: v })}
            />
            <Row
              title={t("settings.privacy.contact.showPhone")}
              hint=""
              checked={privacy.showPhone}
              onChange={(v) => update({ showPhone: v })}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <h2 className="text-sm font-bold font-display text-foreground">
            {t("settings.privacy.blocked.title")}
          </h2>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {t("settings.privacy.blocked.hint")}
          </p>
          {blocked.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {t("settings.privacy.blocked.empty")}
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {blocked.map((b) => (
                <li
                  key={b.userId}
                  className="flex items-center justify-between gap-3 rounded-xl bg-secondary/40 px-3.5 py-2.5"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Ban className="h-3.5 w-3.5 text-destructive" />
                    {b.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUnblock(b.userId)}
                    className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"
                  >
                    {t("settings.privacy.blocked.unblock")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

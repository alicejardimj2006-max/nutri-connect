import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { toast } from "sonner";
import { AuthGateLoading, SiteHeader } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { formatDate, initials } from "@/lib/community";
import type { DictKey } from "@/lib/i18n";
import type { AppNotification } from "@/lib/social/notifications";
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useNotificationsRealtime,
} from "@/lib/social/notifications-queries";
import {
  useIncomingRequests,
  useRemoveFriendship,
  useRespondFriendship,
} from "@/lib/social/queries";

export const Route = createFileRoute("/notificacoes")({
  head: () => ({
    meta: [
      { title: "Notificações — NutriConnect" },
      {
        name: "description",
        content: "Acompanhe as atualizações da sua rede no NutriConnect.",
      },
    ],
  }),
  component: NotificacoesPage,
});

// Texto de cada tipo de notificação (os tipos vêm dos gatilhos do banco).
const TYPE_KEYS: Record<string, DictKey> = {
  reacao: "notif.type.reacao",
  comentario: "notif.type.comentario",
  amizade_pedido: "notif.type.amizade_pedido",
  amizade_aceita: "notif.type.amizade_aceita",
  seguidor: "notif.type.seguidor",
  tema_previa: "notif.type.tema_previa",
  tema_ativo: "notif.type.tema_ativo",
  consulta_agendada: "notif.type.consulta_agendada",
  consulta_confirmada: "notif.type.consulta_confirmada",
  consulta_cancelada: "notif.type.consulta_cancelada",
  consulta_remarcada: "notif.type.consulta_remarcada",
  mensagem: "notif.type.mensagem",
  acompanhamento_pedido: "notif.type.acompanhamento_pedido",
  convite_aceito: "notif.type.convite_aceito",
  acompanhamento_aceito: "notif.type.acompanhamento_aceito",
  diario_comentario: "notif.type.diario_comentario",
  plano_publicado: "notif.type.plano_publicado",
  conteudo_oculto: "notif.type.conteudo_oculto",
  conquista: "notif.type.conquista",
};

function NotificacoesPage() {
  const { user, hydrated: authHydrated } = useRequireAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const requests = useIncomingRequests();
  const respond = useRespondFriendship();
  const decline = useRemoveFriendship();
  const notifications = useNotifications(!!user);
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  useNotificationsRealtime(user?.id);

  if (!authHydrated || !user) return <AuthGateLoading />;

  const pending = requests.data ?? [];
  const busy = respond.isPending || decline.isPending;
  // Os pedidos de amizade aparecem acima, com Aceitar/Recusar; não se repetem na lista.
  const list = (notifications.data ?? []).filter((n) => n.type !== "amizade_pedido");
  const unread = list.filter((n) => !n.read).length;

  const messageOf = (n: AppNotification) => {
    const key = TYPE_KEYS[n.type] ?? "notif.type.other";
    return t(key)
      .replace("{name}", n.actorName ?? "")
      .replace("{title}", String(n.data.title ?? ""))
      .replace("{comment}", String(n.data.comment ?? ""))
      .trim();
  };

  /** Abre o assunto da notificação (e a marca como lida). */
  const open = (n: AppNotification) => {
    if (!n.read) markRead.mutate(n.id);
    const pro = !!user.professional;
    switch (n.type) {
      case "reacao":
      case "comentario":
        return navigate({ to: "/perfil/$userId", params: { userId: user.id } });
      case "amizade_aceita":
      case "seguidor":
        return n.entityId
          ? navigate({ to: "/perfil/$userId", params: { userId: n.entityId } })
          : undefined;
      case "tema_previa":
      case "tema_ativo":
        return navigate({ to: "/tema-da-semana" });
      case "conquista":
        return navigate({ to: "/desafios" });
      case "consulta_agendada":
      case "consulta_confirmada":
      case "consulta_cancelada":
      case "consulta_remarcada":
        return navigate({ to: pro ? "/painel/agenda" : "/acompanhamento/consultas" });
      case "mensagem":
        return navigate({ to: pro ? "/painel/mensagens" : "/acompanhamento/mensagens" });
      case "acompanhamento_pedido":
      case "convite_aceito":
        return navigate({ to: "/painel/pacientes" });
      case "acompanhamento_aceito":
        return navigate({ to: "/acompanhamento" });
      case "diario_comentario":
        return navigate({ to: "/acompanhamento/diario" });
      case "plano_publicado":
        return navigate({ to: "/acompanhamento/plano" });
      default:
        return undefined;
    }
  };

  const empty = pending.length === 0 && list.length === 0 && !notifications.isLoading;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-8">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-foreground">
              {t("notif.title")}
            </h1>
            {unread > 0 && (
              <button
                type="button"
                disabled={markAll.isPending}
                onClick={() => markAll.mutate()}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary disabled:opacity-60 cursor-pointer"
              >
                <CheckCheck className="h-4 w-4" /> {t("notif.markAll")}
              </button>
            )}
          </div>

          {pending.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-sm font-bold font-display text-foreground">
                {t("notif.friendRequests.title")} ({pending.length})
              </h2>
              <ul className="space-y-2">
                {pending.map((req) => (
                  <li
                    key={req.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        navigate({ to: "/perfil/$userId", params: { userId: req.from.id } })
                      }
                      className="flex min-w-0 items-center gap-3 text-left cursor-pointer"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary text-sm font-extrabold text-primary-foreground">
                        {req.from.avatarUrl ? (
                          <img
                            src={req.from.avatarUrl}
                            alt={req.from.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initials(req.from.name)
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {req.from.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          @{req.from.username} · {t("notif.friendRequests.wants")}
                        </span>
                      </span>
                    </button>
                    <span className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          respond.mutate(
                            { friendshipId: req.id, accept: true },
                            { onSuccess: () => toast.success(t("profile.friendAcceptedToast")) },
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-full bg-accent px-3.5 py-2 text-xs font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90 disabled:opacity-60 cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" /> {t("profile.acceptRequest")}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        aria-label={t("profile.declineRequest")}
                        title={t("profile.declineRequest")}
                        onClick={() =>
                          decline.mutate(req.from.id, {
                            onSuccess: () => toast.success(t("notif.friendRequests.declined")),
                          })
                        }
                        className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card text-foreground transition hover:bg-secondary disabled:opacity-60 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {list.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold font-display text-foreground">
                {t("notif.recent")}
              </h2>
              <ul className="space-y-2">
                {list.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => open(n)}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left shadow-xs transition hover:bg-secondary/60 cursor-pointer ${
                        n.read ? "border-border bg-card" : "border-accent/40 bg-accent-soft/30"
                      }`}
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-soft text-xs font-bold text-primary">
                        {n.actorAvatar ? (
                          <img src={n.actorAvatar} alt="" className="h-full w-full object-cover" />
                        ) : n.actorName ? (
                          initials(n.actorName)
                        ) : (
                          <Bell className="h-4 w-4" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-foreground">{messageOf(n)}</span>
                        <span className="block text-[11px] text-muted-foreground">
                          {formatDate(n.createdAt)}
                        </span>
                      </span>
                      {!n.read && (
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" aria-hidden />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {notifications.isLoading && pending.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">{t("common.loading")}</p>
          )}

          {empty && (
            <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center">
              <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-base text-muted-foreground font-medium">{t("notif.empty")}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

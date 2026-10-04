import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bell,
  BellRing,
  BookOpen,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Check,
  CheckCheck,
  ChevronDown,
  ClipboardList,
  HeartPulse,
  Inbox,
  Info,
  MessageCircle,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  Trash2,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  X,
  ChefHat,
  Video,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AuthGateLoading, SiteHeader } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { initials } from "@/lib/community";
import { pickName, type Names } from "@/lib/appearance-data";
import { respondLink } from "@/lib/clinical/api";
import { useClinicalMutation, useLinks, usePeople } from "@/lib/clinical/queries";
import {
  useClearResolved,
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useNotificationsRealtime,
  type NotificationRow,
} from "@/lib/social/notifications";
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

// ── Tipos de notificação ─────────────────────────────────────────────────────

type CategoryId = "social" | "clinical" | "achievements" | "moderation" | "system";

interface Category {
  id: CategoryId;
  title: Names;
  hint: Names;
  icon: LucideIcon;
  /** Cor do cartão (claro, escuro). */
  color: [string, string];
}

const CATEGORIES: Category[] = [
  {
    id: "social",
    title: ["Social", "Social", "Social", "Social"],
    hint: ["Reações, comentários, amizades e seguidores", "Reactions, comments, friendships and followers", "Reacciones, comentarios, amistades y seguidores", "Réactions, commentaires, amitiés et abonnés"],
    icon: Users,
    color: ["#3b7bbf", "#6aa6e6"],
  },
  {
    id: "clinical",
    title: ["Acompanhamento", "Follow-up", "Seguimiento", "Suivi"],
    hint: ["Consultas, mensagens, planos e vínculos", "Appointments, messages, plans and links", "Consultas, mensajes, planes y vínculos", "Consultations, messages, plans et liens"],
    icon: HeartPulse,
    color: ["#0f9aa8", "#4fc3cf"],
  },
  {
    id: "achievements",
    title: ["Conquistas e temas", "Achievements and themes", "Logros y temas", "Succès et thèmes"],
    hint: ["Medalhas da trilha e tema da semana", "Trail badges and the weekly theme", "Medallas de la ruta y tema de la semana", "Badges du parcours et thème de la semaine"],
    icon: Trophy,
    color: ["#c58a12", "#e8b13b"],
  },
  {
    id: "moderation",
    title: ["Moderação", "Moderation", "Moderación", "Modération"],
    hint: ["Avisos sobre o seu conteúdo", "Notices about your content", "Avisos sobre tu contenido", "Avis sur votre contenu"],
    icon: ShieldAlert,
    color: ["#d6456b", "#ef7a98"],
  },
  {
    id: "system",
    title: ["Outros avisos", "Other notices", "Otros avisos", "Autres avis"],
    hint: ["Atualizações do NutriConnect", "NutriConnect updates", "Novedades de NutriConnect", "Actualités NutriConnect"],
    icon: Info,
    color: ["#6b7280", "#9ca3af"],
  },
];

function categoryOf(type: string): CategoryId {
  if (["reacao", "comentario", "seguidor", "amizade_pedido", "amizade_aceita"].includes(type)) return "social";
  if (
    type.startsWith("consulta_") ||
    type.startsWith("acompanhamento_") ||
    ["mensagem", "convite_aceito", "diario_comentario", "plano_publicado", "pagamento"].includes(type) ||
    type.startsWith("pagamento")
  ) {
    return "clinical";
  }
  if (type === "conquista" || type.startsWith("tema_")) return "achievements";
  if (type === "conteudo_oculto" || type === "conta_suspensa" || type === "conta_reativada") return "moderation";
  return "system";
}

type Data = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : "");

interface Shown {
  icon: LucideIcon;
  text: string;
  detail?: string;
  /** Destino ao clicar. */
  go: { to: string; params?: Record<string, string>; search?: Record<string, string> };
}

function describe(n: NotificationRow, locale: string, isPro: boolean, tr: (names: Names) => string): Shown {
  const name = n.actor?.name ?? tr(["Alguém", "Someone", "Alguien", "Quelqu'un"]);
  const data = n.data as Data;
  const fill = (names: Names) => tr(names).replace("{name}", name);
  const who = n.actor_id ?? n.entity_id ?? "";
  const profile = { to: "/perfil/$userId", params: { userId: who } };
  const post = { to: "/explorar", search: { post: n.entity_id ?? "" } };
  const quote = (v: unknown) => (str(v) ? `“${str(v)}”` : undefined);

  switch (n.type) {
    case "reacao":
      return {
        icon: str(data.kind) === "preparei" ? ChefHat : Sparkles,
        text: fill(
          str(data.kind) === "preparei"
            ? ["{name} preparou a sua receita", "{name} made your recipe", "{name} preparó tu receta", "{name} a préparé votre recette"]
            : ["{name} apoiou a sua publicação", "{name} supported your post", "{name} apoyó tu publicación", "{name} a soutenu votre publication"],
        ),
        detail: str(data.title),
        go: post,
      };
    case "comentario":
      return {
        icon: MessageCircle,
        text: fill(["{name} comentou na sua publicação", "{name} commented on your post", "{name} comentó tu publicación", "{name} a commenté votre publication"]),
        detail: quote(data.comment),
        go: post,
      };
    case "seguidor":
      return { icon: UserPlus, text: fill(["{name} começou a seguir você", "{name} started following you", "{name} empezó a seguirte", "{name} a commencé à vous suivre"]), go: profile };
    case "amizade_pedido":
      return { icon: UserPlus, text: fill(["{name} quer ser seu amigo(a)", "{name} wants to be your friend", "{name} quiere ser tu amigo(a)", "{name} veut devenir votre ami(e)"]), go: profile };
    case "amizade_aceita":
      return { icon: UserCheck, text: fill(["{name} aceitou o seu pedido de amizade", "{name} accepted your friend request", "{name} aceptó tu solicitud de amistad", "{name} a accepté votre demande d'ami"]), go: { to: "/perfil/$userId", params: { userId: n.entity_id ?? who } } };
    case "consulta_agendada":
      return { icon: CalendarClock, text: fill(["{name} agendou uma consulta", "{name} booked an appointment", "{name} agendó una consulta", "{name} a réservé une consultation"]), detail: dateOf(data.starts_at, locale), go: { to: isPro ? "/painel/agenda" : "/acompanhamento/consultas" } };
    case "consulta_confirmada":
      return { icon: CalendarCheck, text: fill(["{name} confirmou a sua consulta", "{name} confirmed your appointment", "{name} confirmó tu consulta", "{name} a confirmé votre consultation"]), detail: dateOf(data.starts_at, locale), go: { to: isPro ? "/painel/agenda" : "/acompanhamento/consultas" } };
    case "consulta_cancelada":
      return { icon: CalendarX, text: fill(["{name} cancelou a consulta", "{name} cancelled the appointment", "{name} canceló la consulta", "{name} a annulé la consultation"]), detail: str(data.reason) || dateOf(data.starts_at, locale), go: { to: isPro ? "/painel/agenda" : "/acompanhamento/consultas" } };
    case "consulta_sala":
      return { icon: Video, text: fill(["{name} entrou na sala da consulta", "{name} joined the appointment room", "{name} entró a la sala de la consulta", "{name} est entré(e) dans la salle"]), detail: dateOf(data.starts_at, locale), go: n.entity_id ? { to: "/consulta/$appointmentId", params: { appointmentId: n.entity_id } } : { to: isPro ? "/painel/agenda" : "/acompanhamento/consultas" } };
    case "consulta_remarcada":
      return { icon: CalendarClock, text: fill(["{name} remarcou a consulta", "{name} rescheduled the appointment", "{name} reprogramó la consulta", "{name} a reprogrammé la consultation"]), detail: dateOf(data.starts_at, locale), go: { to: isPro ? "/painel/agenda" : "/acompanhamento/consultas" } };
    case "mensagem": {
      const count = Number(data.count ?? 1);
      return {
        icon: MessageSquare,
        text: fill(
          count > 1
            ? ["{name} enviou novas mensagens", "{name} sent new messages", "{name} envió nuevos mensajes", "{name} a envoyé de nouveaux messages"]
            : ["{name} enviou uma mensagem", "{name} sent a message", "{name} envió un mensaje", "{name} a envoyé un message"],
        ),
        detail: quote(data.preview),
        go: { to: isPro ? "/painel/mensagens" : "/acompanhamento/mensagens" },
      };
    }
    case "acompanhamento_pedido":
      return { icon: Inbox, text: fill(["{name} pediu para ser acompanhado(a) por você", "{name} asked you to follow their care", "{name} pidió que lo(a) acompañes", "{name} vous demande de suivre son parcours"]), go: { to: "/convites" } };
    case "convite_aceito":
      return { icon: UserCheck, text: fill(["{name} aceitou o seu convite", "{name} accepted your invitation", "{name} aceptó tu invitación", "{name} a accepté votre invitation"]), go: { to: "/painel/pacientes" } };
    case "acompanhamento_aceito":
      return { icon: UserCheck, text: fill(["{name} passou a acompanhar você", "{name} is now following your care", "{name} ahora te acompaña", "{name} vous accompagne désormais"]), go: { to: "/acompanhamento" } };
    case "diario_comentario":
      return { icon: BookOpen, text: fill(["{name} comentou no seu diário alimentar", "{name} commented on your food diary", "{name} comentó tu diario alimentario", "{name} a commenté votre journal alimentaire"]), detail: quote(data.comment), go: { to: "/acompanhamento/diario" } };
    case "plano_publicado":
      return { icon: ClipboardList, text: fill(["{name} publicou um plano alimentar para você", "{name} published a meal plan for you", "{name} publicó un plan alimentario para ti", "{name} a publié un plan alimentaire pour vous"]), detail: str(data.title), go: { to: "/acompanhamento/plano" } };
    case "conteudo_oculto":
      return { icon: ShieldAlert, text: tr(["Um conteúdo seu foi ocultado pela moderação", "One of your items was hidden by moderation", "Un contenido tuyo fue ocultado por moderación", "L'un de vos contenus a été masqué par la modération"]), detail: tr(["Veja as regras da comunidade", "See the community guidelines", "Mira las normas de la comunidad", "Voir les règles de la communauté"]), go: { to: "/diretrizes" } };
    case "conta_suspensa":
      return { icon: ShieldAlert, text: tr(["Sua conta foi suspensa", "Your account was suspended", "Tu cuenta fue suspendida", "Votre compte a été suspendu"]), detail: str(data.reason) || undefined, go: { to: "/contato" } };
    case "conta_reativada":
      return { icon: UserCheck, text: tr(["Sua conta foi reativada", "Your account was reactivated", "Tu cuenta fue reactivada", "Votre compte a été réactivé"]), go: { to: "/espaco" } };
    case "tema_previa":
    case "tema_ativo":
      return { icon: Sparkles, text: tr(n.type === "tema_previa" ? ["Nova prévia do tema da semana", "New weekly theme preview", "Nueva vista previa del tema de la semana", "Nouvel aperçu du thème de la semaine"] : ["O tema da semana começou", "The weekly theme has started", "Comenzó el tema de la semana", "Le thème de la semaine a commencé"]), detail: str(data.title), go: { to: "/tema-da-semana" } };
    case "conquista":
      return { icon: Trophy, text: str(data.title) || tr(["Você ganhou uma conquista", "You earned an achievement", "Ganaste un logro", "Vous avez obtenu un succès"]), detail: str(data.description) || undefined, go: { to: "/desafios" } };
    default:
      return { icon: Bell, text: tr(["Você tem uma novidade", "You have an update", "Tienes una novedad", "Vous avez une nouveauté"]), go: { to: "/notificacoes" } };
  }
}

function dateOf(value: unknown, locale: string): string | undefined {
  const s = str(value);
  if (!s) return undefined;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return undefined;
  return new Intl.DateTimeFormat(locale, { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(d);
}

function ago(iso: string, locale: string): string {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const abs = Math.abs(diff);
  if (abs < 60) return rtf.format(0, "second");
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), "day");
  return rtf.format(Math.round(diff / (86400 * 30)), "month");
}

// ── Página ───────────────────────────────────────────────────────────────────

type Filter = "todas" | "nao-lidas" | CategoryId;

function useDark() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("dark");
}

function NotificacoesPage() {
  const { user, hydrated: authHydrated } = useRequireAuth();
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const tr = (names: Names) => pickName(names, locale);
  const dark = useDark();
  const isPro = !!user?.professional;

  const list = useNotifications(!!user);
  useNotificationsRealtime(user?.id);
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const clearResolved = useClearResolved();

  const requests = useIncomingRequests();
  const respond = useRespondFriendship();
  const decline = useRemoveFriendship();

  // Pedidos de acompanhamento (para profissionais).
  const links = useLinks("professional", isPro);
  const pendingLinks = (links.data ?? []).filter((l) => l.status === "pendente");
  const linkPeople = usePeople(pendingLinks.map((l) => l.patient_id));
  const answerLink = useClinicalMutation(({ id, accept }: { id: string; accept: boolean }) => respondLink(id, accept), {
    success: tr(["Resposta enviada.", "Reply sent.", "Respuesta enviada.", "Réponse envoyée."]),
  });

  const [filter, setFilter] = useState<Filter>("todas");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [showResolved, setShowResolved] = useState(false);

  const all = list.data ?? [];
  const unread = all.filter((n) => !n.read_at);
  const resolved = all.filter((n) => !!n.read_at);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const weekAgo = Date.now() - 7 * 86400000;
  const today = all.filter((n) => new Date(n.created_at) >= startOfToday).length;
  const week = all.filter((n) => new Date(n.created_at).getTime() >= weekAgo).length;

  const pendingFriends = requests.data ?? [];
  const pendingCount = pendingFriends.length + pendingLinks.length;
  const busy = respond.isPending || decline.isPending || answerLink.isPending;

  const byCategory = useMemo(() => {
    const map = new Map<CategoryId, NotificationRow[]>();
    for (const n of unread) {
      const id = categoryOf(n.type);
      map.set(id, [...(map.get(id) ?? []), n]);
    }
    return map;
  }, [unread]);

  if (!authHydrated || !user) return <AuthGateLoading />;

  const color = (c: Category) => (dark ? c.color[1] : c.color[0]);
  const openItem = (n: NotificationRow) => {
    if (!n.read_at) markRead.mutate([n.id]);
    const shown = describe(n, locale, isPro, tr);
    void navigate(shown.go as never);
  };

  const Avatar = ({ n, Icon }: { n: NotificationRow; Icon: LucideIcon }) => (
    <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary-soft text-xs font-extrabold text-primary">
      {n.actor?.avatar_url ? (
        <img src={n.actor.avatar_url} alt="" className="h-full w-full object-cover" />
      ) : n.actor ? (
        initials(n.actor.name)
      ) : (
        <Icon className="h-4 w-4" />
      )}
    </span>
  );

  const Item = ({ n, accent }: { n: NotificationRow; accent: string }) => {
    const shown = describe(n, locale, isPro, tr);
    const Icon = shown.icon;
    const isNew = !n.read_at;
    return (
      <li>
        <button
          type="button"
          onClick={() => openItem(n)}
          className="group flex w-full cursor-pointer items-start gap-3 rounded-2xl px-2.5 py-2.5 text-left transition hover:bg-secondary/60"
        >
          <Avatar n={n} Icon={Icon} />
          <span className="min-w-0 flex-1">
            <span className={`block text-sm leading-snug text-foreground ${isNew ? "font-semibold" : ""}`}>{shown.text}</span>
            {shown.detail && <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{shown.detail}</span>}
            <span className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Icon className="h-3 w-3" style={{ color: accent }} />
              {ago(n.created_at, locale)}
            </span>
          </span>
          {isNew && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: accent }} aria-label={tr(["Não lida", "Unread", "No leída", "Non lue"])} />}
        </button>
      </li>
    );
  };

  const pills: { id: Filter; label: string; count?: number }[] = [
    { id: "todas", label: tr(["Todas", "All", "Todas", "Toutes"]), count: all.length },
    { id: "nao-lidas", label: tr(["Não lidas", "Unread", "No leídas", "Non lues"]), count: unread.length },
    ...CATEGORIES.filter((c) => (byCategory.get(c.id)?.length ?? 0) > 0).map((c) => ({
      id: c.id as Filter,
      label: tr(c.title),
      count: byCategory.get(c.id)?.length,
    })),
  ];

  const showCategory = (id: CategoryId) => filter === "todas" || filter === "nao-lidas" || filter === id;
  const showActions = filter === "todas" || filter === "nao-lidas" || filter === "social" || filter === "clinical";
  const showResolvedCard = filter === "todas" || filter === "nao-lidas" ? true : false;

  const stats: { label: string; value: number; icon: LucideIcon; color: string; onClick?: () => void }[] = [
    { label: tr(["Não lidas", "Unread", "No leídas", "Non lues"]), value: unread.length, icon: BellRing, color: dark ? "#ef7a98" : "#d6456b", onClick: () => setFilter("nao-lidas") },
    { label: tr(["Precisam de resposta", "Need a reply", "Necesitan respuesta", "Attendent une réponse"]), value: pendingCount, icon: Inbox, color: dark ? "#e8b13b" : "#c58a12" },
    { label: tr(["Hoje", "Today", "Hoy", "Aujourd'hui"]), value: today, icon: Bell, color: dark ? "#6aa6e6" : "#3b7bbf" },
    { label: tr(["Nos últimos 7 dias", "Last 7 days", "Últimos 7 días", "7 derniers jours"]), value: week, icon: Check, color: dark ? "#78b873" : "#4f8a4b", onClick: () => setFilter("todas") },
  ];

  const empty = all.length === 0 && pendingCount === 0 && !list.isLoading;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <h1 className="sr-only">{t("notif.title")}</h1>

        {/* Resumo */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <button
              key={s.label}
              type="button"
              disabled={!s.onClick}
              onClick={s.onClick}
              className="flex items-center gap-3 rounded-3xl border border-border/80 bg-card p-4 text-left shadow-xs transition enabled:cursor-pointer enabled:hover:shadow-soft"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl" style={{ background: `color-mix(in srgb, ${s.color} 16%, transparent)`, color: s.color }}>
                <s.icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-2xl font-bold leading-none text-foreground">{s.value}</span>
                <span className="mt-1 block text-xs leading-tight text-muted-foreground">{s.label}</span>
              </span>
            </button>
          ))}
        </section>

        {/* Filtros e ações */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="no-scrollbar flex max-w-full gap-1.5 overflow-x-auto">
            {pills.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={filter === p.id}
                onClick={() => setFilter(p.id)}
                className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  filter === p.id ? "border-accent bg-accent-soft text-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
                {typeof p.count === "number" && p.count > 0 && <span className="ml-1.5 opacity-70">{p.count}</span>}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={unread.length === 0 || markAll.isPending}
              onClick={() => markAll.mutate(undefined, { onSuccess: () => toast.success(tr(["Tudo marcado como lido.", "All marked as read.", "Todo marcado como leído.", "Tout est marqué comme lu."])) })}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {tr(["Marcar tudo como lido", "Mark all as read", "Marcar todo como leído", "Tout marquer comme lu"])}
            </button>
          </div>
        </div>

        {/* Precisa da sua ação */}
        {showActions && pendingCount > 0 && (
          <section className="mt-5 rounded-3xl border-2 p-4 shadow-xs sm:p-5" style={{ borderColor: dark ? "#e8b13b" : "#c58a12", background: `color-mix(in srgb, ${dark ? "#e8b13b" : "#c58a12"} 8%, var(--card))` }}>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: dark ? "#e8b13b" : "#c58a12" }}>
                <Inbox className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-base font-bold text-foreground">{tr(["Precisa da sua resposta", "Needs your reply", "Necesita tu respuesta", "Attend votre réponse"])}</h2>
                <p className="text-[11px] text-muted-foreground">{tr(["Pedidos que ainda esperam por você", "Requests still waiting for you", "Solicitudes que esperan por ti", "Demandes qui vous attendent"])}</p>
              </div>
            </div>
            <ul className="space-y-2">
              {pendingFriends.map((req) => (
                <li key={req.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3">
                  <Link to="/perfil/$userId" params={{ userId: req.from.id }} className="flex min-w-0 items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary text-sm font-extrabold text-primary-foreground">
                      {req.from.avatarUrl ? <img src={req.from.avatarUrl} alt={req.from.name} className="h-full w-full object-cover" /> : initials(req.from.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-foreground">{req.from.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">@{req.from.username} · {t("notif.friendRequests.wants")}</span>
                    </span>
                  </Link>
                  <span className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => respond.mutate({ friendshipId: req.id, accept: true }, { onSuccess: () => toast.success(t("profile.friendAcceptedToast")) })}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-accent px-3.5 py-2 text-xs font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90 disabled:opacity-60"
                    >
                      <Check className="h-3.5 w-3.5" /> {t("profile.acceptRequest")}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      aria-label={t("profile.declineRequest")}
                      title={t("profile.declineRequest")}
                      onClick={() => decline.mutate(req.from.id, { onSuccess: () => toast.success(t("notif.friendRequests.declined")) })}
                      className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-border bg-card text-foreground transition hover:bg-secondary disabled:opacity-60"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </li>
              ))}
              {pendingLinks.map((l) => {
                const person = linkPeople.data?.get?.(l.patient_id);
                const name = person?.name ?? tr(["Paciente", "Patient", "Paciente", "Patient"]);
                return (
                  <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary text-sm font-extrabold text-primary-foreground">
                        {person?.avatarUrl ? <img src={person.avatarUrl} alt={name} className="h-full w-full object-cover" /> : initials(name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">{name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {l.message || tr(["Pediu para ser acompanhado(a) por você", "Asked you to follow their care", "Pidió que lo(a) acompañes", "Demande à être suivi(e) par vous"])}
                        </span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => answerLink.mutate({ id: l.id, accept: true })}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-accent px-3.5 py-2 text-xs font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90 disabled:opacity-60"
                      >
                        <Check className="h-3.5 w-3.5" /> {tr(["Aceitar", "Accept", "Aceptar", "Accepter"])}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        aria-label={tr(["Recusar", "Decline", "Rechazar", "Refuser"])}
                        onClick={() => answerLink.mutate({ id: l.id, accept: false })}
                        className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-border bg-card text-foreground transition hover:bg-secondary disabled:opacity-60"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Um cartão por tipo de notificação */}
        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          {CATEGORIES.filter((c) => showCategory(c.id)).map((c) => {
            const items = byCategory.get(c.id) ?? [];
            if (items.length === 0) return null;
            const accent = color(c);
            const expanded = open[c.id];
            const visible = expanded ? items : items.slice(0, 5);
            return (
              <article key={c.id} className="rounded-3xl border-2 bg-card p-4 shadow-xs sm:p-5" style={{ borderColor: accent, background: `color-mix(in srgb, ${accent} 5%, var(--card))` }}>
                <header className="mb-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white" style={{ background: accent }}>
                      <c.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-display text-base font-bold text-foreground">
                        {tr(c.title)} <span className="text-sm font-semibold text-muted-foreground">({items.length})</span>
                      </h2>
                      <p className="text-[11px] text-muted-foreground">{tr(c.hint)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => markRead.mutate(items.map((n) => n.id))}
                    className="shrink-0 cursor-pointer rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground transition hover:bg-secondary"
                  >
                    {tr(["Marcar como lidas", "Mark as read", "Marcar como leídas", "Marquer comme lues"])}
                  </button>
                </header>
                <ul className="divide-y divide-border/50">
                  {visible.map((n) => (
                    <Item key={n.id} n={n} accent={accent} />
                  ))}
                </ul>
                {items.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setOpen((o) => ({ ...o, [c.id]: !expanded }))}
                    className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold hover:underline"
                    style={{ color: accent }}
                  >
                    {expanded ? tr(["Mostrar menos", "Show less", "Mostrar menos", "Voir moins"]) : `${tr(["Ver mais", "See more", "Ver más", "Voir plus"])} (${items.length - 5})`}
                    <ChevronDown className={`h-3.5 w-3.5 transition ${expanded ? "rotate-180" : ""}`} />
                  </button>
                )}
              </article>
            );
          })}
        </section>

        {/* Tudo em dia */}
        {unread.length === 0 && pendingCount === 0 && !list.isLoading && (
          <div className="mt-5 rounded-3xl border border-dashed border-border bg-card/40 p-10 text-center">
            <CheckCheck className="mx-auto mb-3 h-9 w-9 text-accent" />
            <p className="text-base font-semibold text-foreground">
              {empty ? t("notif.empty") : tr(["Tudo em dia! Nenhuma notificação nova.", "All caught up! No new notifications.", "¡Todo al día! Sin notificaciones nuevas.", "Tout est à jour ! Aucune nouvelle notification."])}
            </p>
          </div>
        )}

        {/* Resolvidas */}
        {showResolvedCard && resolved.length > 0 && (
          <section className="mt-5 rounded-3xl border border-border/80 bg-card p-4 shadow-xs sm:p-5">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={() => setShowResolved((v) => !v)} className="flex cursor-pointer items-center gap-2.5 text-left" aria-expanded={showResolved}>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-muted-foreground">
                  <CheckCheck className="h-4 w-4" />
                </span>
                <span>
                  <span className="block font-display text-base font-bold text-foreground">
                    {tr(["Resolvidas", "Resolved", "Resueltas", "Résolues"])} <span className="text-sm font-semibold text-muted-foreground">({resolved.length})</span>
                  </span>
                  <span className="block text-[11px] text-muted-foreground">{tr(["O que você já viu e tratou", "What you have already seen and handled", "Lo que ya viste y atendiste", "Ce que vous avez déjà vu et traité"])}</span>
                </span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition ${showResolved ? "rotate-180" : ""}`} />
              </button>
              {showResolved && (
                <button
                  type="button"
                  disabled={clearResolved.isPending}
                  onClick={() => {
                    if (window.confirm(tr(["Apagar todas as notificações resolvidas?", "Delete all resolved notifications?", "¿Borrar todas las notificaciones resueltas?", "Supprimer toutes les notifications résolues ?"]))) {
                      clearResolved.mutate(user.id, { onSuccess: () => toast.success(tr(["Resolvidas apagadas.", "Resolved notifications deleted.", "Resueltas borradas.", "Résolues supprimées."])) });
                    }
                  }}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {tr(["Limpar resolvidas", "Clear resolved", "Limpiar resueltas", "Vider les résolues"])}
                </button>
              )}
            </header>
            {showResolved && (
              <ul className="mt-3 grid gap-x-6 divide-y divide-border/50 md:grid-cols-2 md:divide-y-0">
                {resolved.slice(0, 30).map((n) => (
                  <Item key={n.id} n={n} accent={color(CATEGORIES.find((c) => c.id === categoryOf(n.type)) ?? CATEGORIES[4])} />
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

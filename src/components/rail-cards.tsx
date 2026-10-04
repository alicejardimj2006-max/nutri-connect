// Cards das laterais das páginas (colunas esquerda e direita em telas largas). Cada página escolhe
// os seus em rails-pages.tsx; aqui ficam todos, com dados reais do próprio site.
import { td } from "@/lib/i18n/data";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Bell,
  CalendarClock,
  ChefHat,
  Compass,
  CreditCard,
  Database,
  FileText,
  Flame,
  Globe,
  Heart,
  Home,
  KeyRound,
  Mail,
  MessageCircle,
  Palette,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
} from "lucide-react";
import { Mascot } from "@/components/mascots";
import { useAuth } from "@/hooks/use-auth";
import { useCommunity } from "@/hooks/use-community";
import { useI18n } from "@/hooks/use-i18n";
import { supabase } from "@/integrations/supabase/client";
import { getUserLevel, getUserStreak, getUserXP, initials } from "@/lib/community";
import { getProfessionalInfo } from "@/lib/community-admin";
import { formatDate, formatTime } from "@/lib/clinical/format";
import { useAppointments } from "@/lib/clinical/queries";
import { LEVEL_LABEL_KEYS } from "@/lib/i18n/content";
import {
  TRAIL_CHANGE_EVENT,
  getActiveStreak,
  getCurrentStopId,
  getTrailSummary,
  getTrails,
  loadTrailProgress,
  setTrailScope,
  type TrailProgress,
} from "@/lib/learning-trail";
import { pickName, type Names } from "@/lib/appearance-data";
import { COMPANY } from "@/lib/legal";
import { useFeed } from "@/lib/social/feed-queries";
import { useFriends } from "@/lib/social/queries";
import { ADULT_PROFILE_ID } from "@/lib/trail-profiles";

/** Moldura padrão de um card lateral. */
export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl border border-border/80 bg-card p-5 shadow-xs ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Texto no idioma atual. */
function useTr() {
  const { locale } = useI18n();
  return (names: Names) => pickName(names, locale);
}

const linkRow =
  "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium text-foreground transition hover:bg-secondary";
const smallLink = "text-[11px] font-semibold text-primary hover:underline";

function useAdultTrailProgress(userId: string | undefined) {
  const [progress, setProgress] = useState<TrailProgress | null>(null);
  useEffect(() => {
    if (!userId) return;
    const load = () => {
      setTrailScope(userId, ADULT_PROFILE_ID);
      setProgress(loadTrailProgress());
    };
    load();
    window.addEventListener(TRAIL_CHANGE_EVENT, load);
    return () => window.removeEventListener(TRAIL_CHANGE_EVENT, load);
  }, [userId]);
  return progress;
}

// ───────────────────────────── Cards de perfil e rede ─────────────────────────────

/** Quem sou eu na rede: nível, experiência e sequência. */
export function ProfileCard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { challenges } = useCommunity();
  const trailProgress = useAdultTrailProgress(user?.id);
  if (!user) return null;

  const xp = getUserXP(user.id, challenges) + (trailProgress?.totalXP ?? 0);
  const lvl = getUserLevel(xp);
  const streak = Math.max(
    getUserStreak(user.id, challenges),
    trailProgress ? getActiveStreak(trailProgress) : 0,
  );
  const pct = Math.min(100, Math.round((lvl.xpInLevel / lvl.xpForNext) * 100));

  return (
    <section className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs">
      <div className="h-16 bg-gradient-to-br from-primary to-accent/80" />
      <div className="-mt-8 px-5 pb-5">
        <Link
          to="/perfil/$userId"
          params={{ userId: user.id }}
          className="grid h-16 w-16 place-items-center rounded-2xl border-4 border-card bg-primary text-xl font-extrabold text-primary-foreground shadow-card"
        >
          {initials(user.name)}
        </Link>
        <p className="mt-2 truncate font-display text-base font-bold text-foreground">{user.name}</p>
        <p className="text-xs text-muted-foreground">
          {t("hub.level").replace("{n}", String(lvl.level))} ·{" "}
          {t(LEVEL_LABEL_KEYS[lvl.label] ?? "hub.level.1")}
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {lvl.xpInLevel}/{lvl.xpForNext} XP
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-accent">
            <Flame className="h-3.5 w-3.5" /> {streak} {t("hub.streakDays")}
          </span>
        </div>
      </div>
    </section>
  );
}

export function MyCommunitiesCard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { communities } = useCommunity();
  const mine = useMemo(
    () => (user ? communities.filter((c) => c.members.some((m) => m.userId === user.id)) : []),
    [communities, user],
  );
  if (!user) return null;
  return (
    <Panel
      title={t("hub.myCommunities")}
      action={
        <Link to="/comunidades" className={smallLink}>
          {t("profile.seeAll")}
        </Link>
      }
    >
      {mine.length > 0 ? (
        <ul className="space-y-1">
          {mine.slice(0, 5).map((c) => (
            <li key={c.id}>
              <Link
                to="/comunidades/$slug"
                params={{ slug: c.slug }}
                className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-secondary"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Users className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">{c.name}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {c.members.length} {t("comunidades.members")}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-2 text-center">
          <p className="text-xs text-muted-foreground">{t("hub.noCommunities")}</p>
          <Link to="/comunidades" className="mt-2 inline-block text-xs font-semibold text-accent hover:underline">
            {t("hub.exploreCommunities")}
          </Link>
        </div>
      )}
    </Panel>
  );
}

/** A Nina chamando para a trilha de aprendizado. */
export function TrailCard() {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const trailProgress = useAdultTrailProgress(user?.id);

  const trail = useMemo(() => {
    const trails = getTrails("adult", locale);
    if (!trailProgress) return { trail: trails[0], stopTitle: null as string | null, pct: 0, started: false };
    for (const tr of trails) {
      const id = getCurrentStopId(trailProgress, tr.units);
      if (id) {
        const stop = tr.units.flatMap((u) => u.stops).find((s) => s.id === id);
        const summary = getTrailSummary(trailProgress, tr);
        return { trail: tr, stopTitle: stop?.title ?? null, pct: summary.pct, started: summary.levels > 0 };
      }
    }
    return { trail: trails[0], stopTitle: null, pct: 100, started: true };
  }, [trailProgress, locale]);

  if (!user) return null;
  return (
    <section className="@container relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent-soft via-card to-primary-soft p-5 shadow-card">
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-accent/20 blur-2xl" />
      {/* Em colunas estreitas a Nina fica em cima e o balão embaixo, com a largura toda. */}
      <div className="flex flex-col-reverse items-center gap-2 @[17rem]:flex-row @[17rem]:items-end @[17rem]:gap-3">
        <Mascot id="nina" size={92} mood="talk" />
        <div className="relative w-full min-w-0 flex-1 rounded-2xl rounded-bl-sm border border-border/70 bg-card/95 p-3 shadow-xs @max-[17rem]:rounded-bl-2xl">
          <p className="text-left text-sm font-bold leading-snug text-foreground [hyphens:none] @max-[17rem]:text-center">
            {trail.started ? t("hub.trail.ninaContinue") : t("hub.trail.ninaStart")}
          </p>
        </div>
      </div>
      {trail.trail && (
        <div className="mt-7">
          <p className="truncate text-xs font-bold uppercase tracking-wider text-accent">{trail.trail.title}</p>
          {trail.stopTitle && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {t("hub.trail.next")} {trail.stopTitle}
            </p>
          )}
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card/80">
            <div className="h-full rounded-full bg-accent" style={{ width: `${trail.pct}%` }} />
          </div>
        </div>
      )}
      <Link
        to="/desafios"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground shadow-soft transition hover:bg-accent/90"
      >
        {trail.started ? t("hub.trail.cta.continue") : t("hub.trail.cta.start")}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

export function WeeklyThemeCard() {
  const { t } = useI18n();
  const { weeklyTheme, hydrated } = useCommunity();
  if (!hydrated || !weeklyTheme) return null;
  return (
    <Panel title={weeklyTheme.badge || t("weekly.badge")}>
      <p className="font-display text-base font-bold leading-snug text-foreground">{weeklyTheme.title}</p>
      {weeklyTheme.questionOfTheWeek && (
        <p className="mt-2 rounded-xl bg-secondary/50 p-3 text-xs italic text-foreground/85">
          “{weeklyTheme.questionOfTheWeek}”
        </p>
      )}
      <Link to="/tema-da-semana" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline">
        {t("hub.weekly.cta")} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </Panel>
  );
}

export function MyChallengesCard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { challenges } = useCommunity();
  const mine = useMemo(
    () =>
      user
        ? challenges.filter((c) => c.participants.includes(user.id) && !c.completedBy.includes(user.id))
        : [],
    [challenges, user],
  );
  if (!user) return null;
  return (
    <Panel
      title={t("profile.activeChallenges")}
      action={
        <Link to="/desafios" className={smallLink}>
          {t("profile.seeAll")}
        </Link>
      }
    >
      {mine.length > 0 ? (
        <ul className="space-y-2">
          {mine.slice(0, 3).map((c) => {
            const done = (c.progress?.[user.id] || []).length;
            const total = c.steps.length;
            return (
              <li key={c.id}>
                <Link
                  to="/desafios/$challengeId"
                  params={{ challengeId: c.id }}
                  className="block rounded-xl bg-secondary/50 p-3 transition hover:bg-secondary"
                >
                  <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <span>{c.badgeIcon}</span>
                    <span className="truncate">{c.title}</span>
                  </span>
                  {total > 0 && (
                    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-card">
                      <span
                        className="block h-full rounded-full bg-primary"
                        style={{ width: `${Math.round((done / total) * 100)}%` }}
                      />
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <Link to="/desafios" className="block py-2 text-center text-xs font-semibold text-accent hover:underline">
          {t("profile.pickChallenge")}
        </Link>
      )}
    </Panel>
  );
}

export function SuggestedCommunitiesCard({ limit = 3 }: { limit?: number }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const { communities } = useCommunity();
  const suggested = useMemo(
    () => (user ? communities.filter((c) => !c.members.some((m) => m.userId === user.id)) : []),
    [communities, user],
  );
  if (suggested.length === 0) return null;
  return (
    <Panel title={t("hub.suggested")}>
      <ul className="space-y-1">
        {suggested.slice(0, limit).map((c) => (
          <li key={c.id}>
            <Link
              to="/comunidades/$slug"
              params={{ slug: c.slug }}
              className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-secondary"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                <MessageCircle className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">{c.name}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{td(c.category)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function ProfessionalsCard({ limit = 3 }: { limit?: number }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const { profiles } = useCommunity();
  const pros = useMemo(
    () => profiles.filter((p) => p.role === "profissional" && p.userId !== user?.id).slice(0, limit),
    [profiles, user, limit],
  );
  if (pros.length === 0) return null;
  return (
    <Panel
      title={t("hub.professionals")}
      action={
        <Link to="/profissionais" className={smallLink}>
          {t("profile.seeAll")}
        </Link>
      }
    >
      <ul className="space-y-1">
        {pros.map((p) => {
          const info = getProfessionalInfo(profiles, p.userId);
          return (
            <li key={p.userId}>
              <Link
                to="/perfil/$userId"
                params={{ userId: p.userId }}
                className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-secondary"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full avatar-shape bg-primary-soft text-xs font-bold text-primary">
                  {initials(p.name)}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
                    <span className="truncate">{p.name}</span>
                    <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-accent" />
                  </span>
                  {info && <span className="block truncate text-[11px] text-muted-foreground">{td(info.profession)}</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

// ───────────────────────────── Navegação e ajuda ─────────────────────────────

type LinkItem = { to: string; icon: ComponentType<{ className?: string }>; names: Names };

function LinkList({ title, items }: { title: Names; items: LinkItem[] }) {
  const tr = useTr();
  return (
    <Panel title={tr(title)}>
      <ul className="grid gap-0.5">
        {items.map((s) => (
          <li key={s.to}>
            <Link to={s.to} className={linkRow} activeProps={{ className: "bg-primary-soft text-primary" }}>
              <s.icon className="h-4 w-4 text-accent" />
              {tr(s.names)}
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function ShortcutsCard() {
  return (
    <LinkList
      title={["Atalhos", "Shortcuts", "Atajos", "Raccourcis"]}
      items={[
        { to: "/espaco", icon: Home, names: ["Espaço", "Space", "Espacio", "Espace"] },
        { to: "/receitas", icon: ChefHat, names: ["Receitas", "Recipes", "Recetas", "Recettes"] },
        { to: "/explorar", icon: Compass, names: ["Explorar", "Explore", "Explorar", "Explorer"] },
        { to: "/comunidades", icon: Users, names: ["Comunidades", "Communities", "Comunidades", "Communautés"] },
        { to: "/desafios", icon: Award, names: ["Desafios", "Challenges", "Desafíos", "Défis"] },
        { to: "/tema-da-semana", icon: Sparkles, names: ["Tema da semana", "Weekly theme", "Tema de la semana", "Thème de la semaine"] },
        { to: "/notificacoes", icon: Bell, names: ["Notificações", "Notifications", "Notificaciones", "Notifications"] },
      ]}
    />
  );
}

export function SettingsNavCard() {
  return (
    <LinkList
      title={["Configurações", "Settings", "Ajustes", "Réglages"]}
      items={[
        { to: "/perfil/configuracoes/conta", icon: UserCog, names: ["Conta e segurança", "Account and security", "Cuenta y seguridad", "Compte et sécurité"] },
        { to: "/perfil/configuracoes/privacidade", icon: ShieldCheck, names: ["Privacidade", "Privacy", "Privacidad", "Confidentialité"] },
        { to: "/perfil/configuracoes/notificacoes", icon: Bell, names: ["Notificações", "Notifications", "Notificaciones", "Notifications"] },
        { to: "/perfil/personalizacao", icon: Palette, names: ["Personalização", "Personalization", "Personalización", "Personnalisation"] },
        { to: "/perfil/configuracoes/idioma", icon: Globe, names: ["Idioma e região", "Language and region", "Idioma y región", "Langue et région"] },
        { to: "/perfil/configuracoes/dados", icon: Database, names: ["Dados e histórico", "Data and history", "Datos e historial", "Données et historique"] },
        { to: "/perfil/configuracoes", icon: Settings, names: ["Todas as configurações", "All settings", "Todos los ajustes", "Tous les réglages"] },
      ]}
    />
  );
}

export function LegalLinksCard() {
  return (
    <LinkList
      title={["Sobre e documentos", "About and documents", "Acerca de y documentos", "À propos et documents"]}
      items={[
        { to: "/sobre", icon: Heart, names: ["Sobre o NutriConnect", "About NutriConnect", "Acerca de NutriConnect", "À propos de NutriConnect"] },
        { to: "/termos", icon: FileText, names: ["Termos de Uso", "Terms of Use", "Términos de Uso", "Conditions d'utilisation"] },
        { to: "/privacidade", icon: ShieldCheck, names: ["Política de Privacidade", "Privacy Policy", "Política de Privacidad", "Politique de confidentialité"] },
        { to: "/diretrizes", icon: Users, names: ["Diretrizes da Comunidade", "Community Guidelines", "Normas de la comunidad", "Règles de la communauté"] },
        { to: "/contato", icon: Mail, names: ["Fale conosco", "Contact us", "Contáctanos", "Nous contacter"] },
      ]}
    />
  );
}

export function ContactCard() {
  const tr = useTr();
  return (
    <Panel title={tr(["Precisa de ajuda?", "Need help?", "¿Necesitas ayuda?", "Besoin d'aide ?"])}>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {tr([
          "Dúvidas, denúncias de conteúdo e pedidos sobre seus dados pessoais (LGPD) chegam à nossa equipe pelo Fale conosco.",
          "Questions, content reports and requests about your personal data reach our team through Contact us.",
          "Dudas, denuncias de contenido y solicitudes sobre tus datos personales llegan a nuestro equipo por Contáctanos.",
          "Questions, signalements de contenu et demandes sur vos données personnelles arrivent à notre équipe via Nous contacter.",
        ])}
      </p>
      <a href={`mailto:${COMPANY.supportEmail}`} className="mt-3 block truncate text-xs font-bold text-accent hover:underline">
        {COMPANY.supportEmail}
      </a>
      <Link to="/contato" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
        {tr(["Abrir o Fale conosco", "Open Contact us", "Abrir Contáctanos", "Ouvrir Nous contacter"])}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </Panel>
  );
}

export function SecurityTipsCard() {
  const tr = useTr();
  const tips: Names[] = [
    ["Use uma senha única, longa e que só você conheça.", "Use a unique, long password that only you know.", "Usa una contraseña única, larga y que solo tú conozcas.", "Utilisez un mot de passe unique, long et que vous seul connaissez."],
    ["Entrou em um computador de outra pessoa? Encerre todas as sessões na Conta.", "Signed in on someone else's computer? End all sessions in Account.", "¿Entraste en el ordenador de otra persona? Cierra todas las sesiones en Cuenta.", "Connecté sur l'ordinateur de quelqu'un ? Fermez toutes les sessions dans Compte."],
    ["Desconfie de mensagens pedindo senha ou pagamento fora do site.", "Be wary of messages asking for a password or payment outside the site.", "Desconfía de mensajes que piden contraseña o pago fuera del sitio.", "Méfiez-vous des messages demandant mot de passe ou paiement hors du site."],
  ];
  return (
    <Panel title={tr(["Dicas de segurança", "Security tips", "Consejos de seguridad", "Conseils de sécurité"])}>
      <ul className="space-y-2.5">
        {tips.map((tip, i) => (
          <li key={i} className="flex gap-2.5 text-xs leading-relaxed text-muted-foreground">
            <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            {tr(tip)}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function CommunityRulesCard() {
  const tr = useTr();
  const rules: Names[] = [
    ["Quem cria uma comunidade é uma pessoa usuária; profissionais verificados entram como administradores.", "A community is created by a user; verified professionals join as administrators.", "Una comunidad la crea una persona usuaria; los profesionales verificados entran como administradores.", "Une communauté est créée par un utilisateur ; les professionnels vérifiés rejoignent comme administrateurs."],
    ["Só se publica em comunidades ativas, com administração completa.", "You can only post in active communities, with full administration.", "Solo se publica en comunidades activas, con administración completa.", "On ne publie que dans les communautés actives, avec administration complète."],
    ["Conteúdo denunciado por várias pessoas fica oculto até a equipe revisar.", "Content reported by several people stays hidden until the team reviews it.", "El contenido denunciado por varias personas queda oculto hasta que el equipo lo revise.", "Le contenu signalé par plusieurs personnes reste masqué jusqu'à examen par l'équipe."],
  ];
  return (
    <Panel
      title={tr(["Como funcionam as comunidades", "How communities work", "Cómo funcionan las comunidades", "Comment fonctionnent les communautés"])}
      action={
        <Link to="/diretrizes" className={smallLink}>
          {tr(["Diretrizes", "Guidelines", "Normas", "Règles"])}
        </Link>
      }
    >
      <ul className="space-y-2.5">
        {rules.map((r, i) => (
          <li key={i} className="flex gap-2.5 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            {tr(r)}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function HowBookingCard() {
  const tr = useTr();
  const steps: Names[] = [
    ["Escolha um(a) profissional verificado(a) e um horário.", "Pick a verified professional and a time slot.", "Elige un profesional verificado y un horario.", "Choisissez un professionnel vérifié et un créneau."],
    ["O horário fica reservado por 30 minutos enquanto você paga.", "The slot is held for 30 minutes while you pay.", "El horario queda reservado 30 minutos mientras pagas.", "Le créneau est réservé 30 minutes pendant le paiement."],
    ["Cancelando com 24 h de antecedência, o estorno é integral.", "Cancelling 24 h ahead gives a full refund.", "Cancelando con 24 h de antelación, el reembolso es íntegro.", "En annulant 24 h à l'avance, le remboursement est intégral."],
  ];
  return (
    <Panel title={tr(["Como funciona o agendamento", "How booking works", "Cómo funciona la reserva", "Comment fonctionne la réservation"])}>
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-xs leading-relaxed text-muted-foreground">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
              {i + 1}
            </span>
            {tr(s)}
          </li>
        ))}
      </ol>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <CreditCard className="h-3.5 w-3.5" />
        {tr(["Pagamento seguro pelo Stripe.", "Secure payment by Stripe.", "Pago seguro con Stripe.", "Paiement sécurisé par Stripe."])}
      </p>
    </Panel>
  );
}

export function EducationalNoticeCard() {
  const tr = useTr();
  return (
    <Panel title={tr(["Conteúdo educativo", "Educational content", "Contenido educativo", "Contenu éducatif"])}>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {tr([
          "As informações do NutriConnect têm caráter educativo e não substituem a avaliação de um(a) nutricionista ou médico(a). Em urgências, procure atendimento imediato.",
          "NutriConnect information is educational and does not replace an assessment by a nutritionist or doctor. In emergencies, seek immediate care.",
          "La información de NutriConnect es educativa y no sustituye la evaluación de un nutricionista o médico. En urgencias, busca atención inmediata.",
          "Les informations de NutriConnect sont éducatives et ne remplacent pas l'avis d'un nutritionniste ou d'un médecin. En urgence, consultez immédiatement.",
        ])}
      </p>
      <Link to="/termos" className="mt-3 inline-block text-xs font-bold text-accent hover:underline">
        {tr(["Ler os Termos de Uso", "Read the Terms of Use", "Leer los Términos de Uso", "Lire les Conditions d'utilisation"])}
      </Link>
    </Panel>
  );
}

// ───────────────────────────── Cards de dados da rede ─────────────────────────────

export function FriendsCard() {
  const tr = useTr();
  const friends = useFriends();
  const list = friends.data ?? [];
  return (
    <Panel
      title={tr(["Amigos", "Friends", "Amigos", "Amis"])}
      action={
        <Link to="/explorar" className={smallLink}>
          {tr(["Encontrar", "Find", "Encontrar", "Trouver"])}
        </Link>
      }
    >
      {list.length > 0 ? (
        <ul className="space-y-1">
          {list.slice(0, 5).map((f) => (
            <li key={f.id}>
              <Link to="/perfil/$userId" params={{ userId: f.id }} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-secondary">
                <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full avatar-shape bg-primary-soft text-xs font-bold text-primary">
                  {f.avatarUrl ? <img src={f.avatarUrl} alt="" className="h-full w-full object-cover" /> : initials(f.name)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">{f.name}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">@{f.username}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-2 text-center">
          <p className="text-xs text-muted-foreground">
            {tr(["Você ainda não tem amigos por aqui.", "You don't have friends here yet.", "Aún no tienes amigos aquí.", "Vous n'avez pas encore d'amis ici."])}
          </p>
          <Link to="/explorar" className="mt-2 inline-block text-xs font-semibold text-accent hover:underline">
            {tr(["Encontrar pessoas", "Find people", "Encontrar personas", "Trouver des personnes"])}
          </Link>
        </div>
      )}
    </Panel>
  );
}

/** Receitas mais preparadas e apoiadas da rede. */
export function TopRecipesCard() {
  const tr = useTr();
  const feed = useFeed({ scope: "todos", type: "receita", limit: 30 });
  const top = useMemo(
    () =>
      [...(feed.data ?? [])]
        .sort((a, b) => b.preparedBy.length + b.supports.length - (a.preparedBy.length + a.supports.length))
        .slice(0, 5),
    [feed.data],
  );
  if (top.length === 0) return null;
  return (
    <Panel
      title={tr(["Receitas em alta", "Trending recipes", "Recetas en alza", "Recettes tendance"])}
      action={
        <Link to="/receitas" className={smallLink}>
          {tr(["Ver todas", "See all", "Ver todas", "Tout voir"])}
        </Link>
      }
    >
      <ul className="space-y-1">
        {top.map((r) => (
          <li key={r.id}>
            <Link to="/receitas/$id" params={{ id: r.id }} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-secondary">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                <ChefHat className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">{r.title || "—"}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {r.preparedBy.length} {tr(["preparos", "made it", "preparaciones", "préparations"])} · {r.authorName}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/** Próximas consultas de quem está logado (paciente ou profissional). */
export function UpcomingAppointmentsCard() {
  const { user } = useAuth();
  const { locale } = useI18n();
  const tr = useTr();
  const role = user?.professional ? "professional" : "patient";
  const from = useMemo(() => new Date().toISOString(), []);
  const appts = useAppointments({ role, from, ascending: true, limit: 6 }, !!user);
  const next = (appts.data ?? [])
    .filter((a) => ["aguardando_pagamento", "agendada", "confirmada"].includes(a.status))
    .slice(0, 3);
  if (!user) return null;
  const to = role === "professional" ? "/painel/agenda" : "/acompanhamento/consultas";
  return (
    <Panel
      title={tr(["Próximas consultas", "Upcoming appointments", "Próximas consultas", "Prochaines consultations"])}
      action={
        <Link to={to} className={smallLink}>
          {tr(["Ver", "View", "Ver", "Voir"])}
        </Link>
      }
    >
      {next.length > 0 ? (
        <ul className="space-y-2">
          {next.map((a) => (
            <li key={a.id} className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3">
              <CalendarClock className="h-4 w-4 shrink-0 text-accent" />
              <span className="min-w-0 text-xs">
                <span className="block font-semibold capitalize text-foreground">
                  {formatDate(a.starts_at, locale, { weekday: "short", day: "numeric", month: "short" })}
                </span>
                <span className="text-muted-foreground">
                  {formatTime(a.starts_at, locale)} ·{" "}
                  {a.modality === "online" ? tr(["On-line", "Online", "En línea", "En ligne"]) : tr(["Presencial", "In person", "Presencial", "En personne"])}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-2 text-center">
          <p className="text-xs text-muted-foreground">
            {tr(["Nenhuma consulta marcada.", "No appointments booked.", "Ninguna consulta reservada.", "Aucune consultation prévue."])}
          </p>
          <Link to="/profissionais" className="mt-2 inline-block text-xs font-semibold text-accent hover:underline">
            {tr(["Encontrar profissional", "Find a professional", "Encontrar profesional", "Trouver un professionnel"])}
          </Link>
        </div>
      )}
    </Panel>
  );
}

// ───────────────────────────── Comunidades e desafios ─────────────────────────────

export function CommunityAboutCard({ slug }: { slug: string }) {
  const tr = useTr();
  const { communities } = useCommunity();
  const c = communities.find((x) => x.slug === slug);
  if (!c) return null;
  return (
    <Panel title={tr(["Sobre a comunidade", "About the community", "Sobre la comunidad", "À propos de la communauté"])}>
      <p className="text-sm font-bold text-foreground">{c.name}</p>
      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-accent">{td(c.category)}</p>
      {c.description && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.description}</p>}
      {c.objective && (
        <p className="mt-2 rounded-xl bg-secondary/50 p-3 text-xs italic text-foreground/85">{c.objective}</p>
      )}
      <dl className="mt-3 space-y-1.5 text-xs">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{tr(["Membros", "Members", "Miembros", "Membres"])}</dt>
          <dd className="font-semibold text-foreground">{c.members.length}</dd>
        </div>
        {c.adminUserName && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{tr(["Administração", "Admin", "Administración", "Administration"])}</dt>
            <dd className="truncate font-semibold text-foreground">{c.adminUserName}</dd>
          </div>
        )}
        {c.professionalName && (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{tr(["Profissional", "Professional", "Profesional", "Professionnel"])}</dt>
            <dd className="flex items-center gap-1 truncate font-semibold text-foreground">
              {c.professionalName} <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-accent" />
            </dd>
          </div>
        )}
      </dl>
    </Panel>
  );
}

export function CommunityMembersCard({ slug }: { slug: string }) {
  const tr = useTr();
  const { communities } = useCommunity();
  const c = communities.find((x) => x.slug === slug);
  if (!c || c.members.length === 0) return null;
  return (
    <Panel title={`${tr(["Membros", "Members", "Miembros", "Membres"])} (${c.members.length})`}>
      <ul className="space-y-1">
        {c.members.slice(0, 8).map((m) => (
          <li key={m.userId}>
            <Link to="/perfil/$userId" params={{ userId: m.userId }} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-secondary">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full avatar-shape bg-primary-soft text-[11px] font-bold text-primary">
                {initials(m.name)}
              </span>
              <span className="truncate text-sm font-medium text-foreground">{m.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function ChallengeStatsCard() {
  const { user } = useAuth();
  const tr = useTr();
  const { challenges } = useCommunity();
  if (!user) return null;
  const joined = challenges.filter((c) => c.participants.includes(user.id));
  const done = challenges.filter((c) => c.completedBy.includes(user.id));
  const stats: [Names, number][] = [
    [["Participando", "Taking part", "Participando", "En cours"], joined.length - done.length],
    [["Concluídos", "Completed", "Completados", "Terminés"], done.length],
    [["Disponíveis", "Available", "Disponibles", "Disponibles"], challenges.length],
  ];
  return (
    <Panel title={tr(["Seus desafios", "Your challenges", "Tus desafíos", "Vos défis"])}>
      <div className="grid grid-cols-3 gap-2 text-center">
        {stats.map(([label, value]) => (
          <div key={label[0]} className="rounded-xl bg-secondary/50 p-2.5">
            <p className="font-display text-xl font-extrabold text-foreground">{Math.max(0, value)}</p>
            <p className="text-[10px] font-medium text-muted-foreground">{tr(label)}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function ChallengeInfoCard({ id }: { id: string }) {
  const tr = useTr();
  const { challenges } = useCommunity();
  const c = challenges.find((x) => x.id === id);
  if (!c) return null;
  return (
    <Panel title={tr(["Sobre o desafio", "About the challenge", "Sobre el desafío", "À propos du défi"])}>
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-2xl">{c.badgeIcon}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">{c.badgeLabel}</p>
          <p className="text-[11px] text-muted-foreground">{c.duration}</p>
        </div>
      </div>
      <dl className="mt-3 space-y-1.5 text-xs">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{tr(["Passos", "Steps", "Pasos", "Étapes"])}</dt>
          <dd className="font-semibold text-foreground">{c.steps.length}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{tr(["Participantes", "Participants", "Participantes", "Participants"])}</dt>
          <dd className="font-semibold text-foreground">{c.participants.length}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">{tr(["Concluíram", "Completed it", "Lo completaron", "L'ont terminé"])}</dt>
          <dd className="font-semibold text-foreground">{c.completedBy.length}</dd>
        </div>
      </dl>
    </Panel>
  );
}

// ───────────────────────────── Nina e notificações ─────────────────────────────

const NINA_TOPICS: Names[] = [
  ["Como montar um prato equilibrado no almoço?", "How do I build a balanced lunch plate?", "¿Cómo armar un plato equilibrado en el almuerzo?", "Comment composer une assiette équilibrée au déjeuner ?"],
  ["Quais lanches rápidos posso levar para o trabalho?", "What quick snacks can I take to work?", "¿Qué meriendas rápidas puedo llevar al trabajo?", "Quelles collations rapides emporter au travail ?"],
  ["O que são alimentos ultraprocessados?", "What are ultra-processed foods?", "¿Qué son los alimentos ultraprocesados?", "Que sont les aliments ultra-transformés ?"],
  ["Como ler o rótulo de um alimento?", "How do I read a food label?", "¿Cómo leer la etiqueta de un alimento?", "Comment lire l'étiquette d'un aliment ?"],
  ["Dicas para beber mais água ao longo do dia", "Tips to drink more water through the day", "Consejos para beber más agua durante el día", "Conseils pour boire plus d'eau dans la journée"],
  ["Como planejar as compras da semana?", "How do I plan the weekly grocery shop?", "¿Cómo planificar las compras de la semana?", "Comment planifier les courses de la semaine ?"],
];

/** Perguntas prontas: o clique preenche a conversa da Nina. */
export function NinaTopicsCard() {
  const tr = useTr();
  return (
    <Panel title={tr(["Pergunte à Nina", "Ask Nina", "Pregunta a Nina", "Demandez à Nina"])}>
      <ul className="space-y-1.5">
        {NINA_TOPICS.map((q, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("nina:prompt", { detail: tr(q) }))}
              className="w-full cursor-pointer rounded-xl bg-secondary/50 px-3 py-2 text-left text-xs font-medium text-foreground transition hover:bg-secondary"
            >
              {tr(q)}
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function NinaUsageCard() {
  const { user } = useAuth();
  const tr = useTr();
  const used = useQuery({
    queryKey: ["nina", "usage-card", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.rpc("ai_usage_today", { p_kind: "nina" });
      return data ?? 0;
    },
  });
  if (!user) return null;
  const count = used.data ?? 0;
  const pct = Math.min(100, Math.round((count / 20) * 100));
  return (
    <Panel title={tr(["Uso de hoje", "Today's usage", "Uso de hoy", "Utilisation du jour"])}>
      <p className="font-display text-2xl font-extrabold text-foreground">
        {count}
        <span className="text-sm font-semibold text-muted-foreground"> / 20</span>
      </p>
      <p className="text-[11px] text-muted-foreground">{tr(["perguntas feitas à Nina hoje", "questions asked to Nina today", "preguntas hechas a Nina hoy", "questions posées à Nina aujourd'hui"])}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <Link to="/perfil/configuracoes/dados" className="mt-3 inline-block text-[11px] font-semibold text-primary hover:underline">
        {tr(["Gerenciar minhas conversas", "Manage my conversations", "Gestionar mis conversaciones", "Gérer mes conversations"])}
      </Link>
    </Panel>
  );
}

export function NotificationsHelpCard() {
  const tr = useTr();
  return (
    <Panel title={tr(["Controle seus avisos", "Control your alerts", "Controla tus avisos", "Contrôlez vos alertes"])}>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {tr([
          "Escolha quais tipos de aviso receber, defina um horário de silêncio e decida se o texto aparece nos avisos do navegador.",
          "Choose which kinds of alerts to receive, set quiet hours and decide whether text shows in browser alerts.",
          "Elige qué tipos de aviso recibir, define un horario de silencio y decide si el texto aparece en los avisos del navegador.",
          "Choisissez les types d'alertes, définissez des heures de silence et décidez si le texte apparaît dans les alertes du navigateur.",
        ])}
      </p>
      <Link to="/perfil/configuracoes/notificacoes" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline">
        {tr(["Abrir notificações", "Open notifications", "Abrir notificaciones", "Ouvrir les notifications"])}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </Panel>
  );
}

export function SearchTipsCard() {
  const tr = useTr();
  const tips: Names[] = [
    ["Busque por nome, @usuário, receita ou tema.", "Search by name, @username, recipe or topic.", "Busca por nombre, @usuario, receta o tema.", "Cherchez par nom, @utilisateur, recette ou thème."],
    ["A busca ignora acentos e tolera pequenos erros de digitação.", "Search ignores accents and tolerates small typos.", "La búsqueda ignora acentos y tolera pequeños errores.", "La recherche ignore les accents et tolère les petites fautes."],
    ["Use os filtros para achar profissionais verificados por especialidade.", "Use filters to find verified professionals by specialty.", "Usa los filtros para hallar profesionales verificados por especialidad.", "Utilisez les filtres pour trouver des professionnels vérifiés par spécialité."],
  ];
  return (
    <Panel title={tr(["Dicas de busca", "Search tips", "Consejos de búsqueda", "Conseils de recherche"])}>
      <ul className="space-y-2.5">
        {tips.map((tip, i) => (
          <li key={i} className="flex gap-2.5 text-xs leading-relaxed text-muted-foreground">
            <Search className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            {tr(tip)}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

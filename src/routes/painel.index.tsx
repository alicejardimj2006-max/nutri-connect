import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Circle,
  Inbox,
  MessageCircle,
  Users,
} from "lucide-react";
import { AppointmentCard } from "@/components/clinical/appointment-card";
import { LinkRequests } from "@/components/clinical/link-requests";
import {
  Avatar,
  Card,
  EmptyState,
  Loading,
  PageHeader,
  Stat,
  buttonGhost,
} from "@/components/clinical/ui";
import { lastSeen } from "@/components/clinical/adherence-ui";
import { useTr } from "@/components/settings-ui";
import { needsAttention, nudgeText, useAdherence } from "@/lib/clinical/adherence";
import { useAuth } from "@/hooks/use-auth";
import {
  useAppointments,
  useAvailabilityRules,
  useLinks,
  usePayments,
  usePeople,
  useProfessional,
} from "@/lib/clinical/queries";
import { addDays, formatDate, isSameDay, startOfDay, startOfWeek } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { cn } from "@/lib/utils";
import { ProScoreCard } from "@/components/pro-score-card";

export const Route = createFileRoute("/painel/")({
  component: PanelOverview,
});

const ACTIVE = ["aguardando_pagamento", "agendada", "confirmada"];

/** Pacientes há 7 dias ou mais sem registrar, com mensagem pronta (o profissional revisa). */
function AttentionCard() {
  const tr = useTr();
  const { locale } = useClinicalI18n();
  const adherence = useAdherence(7);
  const rows = (adherence.data ?? []).filter(needsAttention);
  const people = usePeople(rows.map((r) => r.patient_id));
  if (!rows.length) return null;

  return (
    <Card
      title={tr(["Precisam de atenção", "Need attention", "Necesitan atención", "À surveiller"])}
      className="mt-4"
      action={
        <Link to="/painel/adesao" className={buttonGhost}>
          {tr(["Ver adesão", "See adherence", "Ver adherencia", "Voir l'adhésion"])}
        </Link>
      }
    >
      <ul className="space-y-2">
        {rows.slice(0, 5).map((r) => {
          const person = people.data?.get(r.patient_id);
          return (
            <li key={r.patient_id} className="flex flex-wrap items-center gap-3">
              <Avatar name={person?.name ?? "…"} url={person?.avatarUrl} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {person?.name ?? "…"}
                </p>
                <p className="text-xs text-muted-foreground">{lastSeen(r, tr)}</p>
              </div>
              <Link
                to="/painel/mensagens"
                search={{
                  com: r.patient_id,
                  texto: nudgeText((person?.name ?? "").split(" ")[0], locale),
                }}
                className={buttonGhost}
              >
                <MessageCircle className="h-4 w-4" />
                {tr(["Mandar mensagem", "Send message", "Enviar mensaje", "Envoyer un message"])}
              </Link>
            </li>
          );
        })}
      </ul>
      {rows.length > 5 && (
        <p className="mt-2 text-xs text-muted-foreground">
          {tr([
            `e mais ${rows.length - 5}`,
            `and ${rows.length - 5} more`,
            `y ${rows.length - 5} más`,
            `et ${rows.length - 5} de plus`,
          ])}
        </p>
      )}
    </Card>
  );
}

function PanelOverview() {
  const { user } = useAuth();
  const { t, locale } = useClinicalI18n();
  const today = useMemo(() => startOfDay(new Date()), []);
  const weekStart = startOfWeek(today);
  const range = {
    from: weekStart.toISOString(),
    to: addDays(today, 14).toISOString(),
  };
  const appts = useAppointments({ role: "professional", ...range });
  const links = useLinks("professional");
  const rules = useAvailabilityRules(user?.id);
  const pro = useProfessional(user?.id);

  const list = appts.data ?? [];
  const todays = list.filter(
    (a) => isSameDay(new Date(a.starts_at), today) && a.status !== "cancelada",
  );
  const thisWeek = list.filter(
    (a) => new Date(a.starts_at) < addDays(weekStart, 7) && a.status !== "cancelada",
  );
  const upcoming = list.filter(
    (a) => new Date(a.ends_at).getTime() >= Date.now() && ACTIVE.includes(a.status),
  );
  const toConfirm = upcoming.filter((a) => a.status === "agendada").length;
  const activePatients = (links.data ?? []).filter((l) => l.status === "ativo").length;
  const pending = (links.data ?? []).filter((l) => l.status === "pendente");

  const people = usePeople(upcoming.map((a) => a.patient_id));
  const payments = usePayments(upcoming.filter((a) => a.price_cents > 0).map((a) => a.id));

  const setup = [
    {
      done: (rules.data?.length ?? 0) > 0,
      label: t("overview.setupHours"),
      to: "/painel/agenda" as const,
    },
    {
      done:
        !!pro.data &&
        (pro.data.consultation_price_cents > 0 || !!pro.data.address || !!pro.data.headline),
      label: t("overview.setupSettings"),
      to: "/painel/configuracoes" as const,
    },
    {
      done: activePatients > 0,
      label: t("overview.setupPatients"),
      to: "/painel/pacientes" as const,
    },
  ];
  const setupDone = setup.every((s) => s.done);

  return (
    <>
      <PageHeader
        title={t("overview.hello", { name: user?.name.split(" ")[0] ?? "" })}
        subtitle={formatDate(today, locale, { weekday: "long", day: "numeric", month: "long" })}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={CalendarCheck} label={t("overview.today")} value={todays.length} />
        <Stat
          icon={CalendarDays}
          label={t("overview.thisWeek")}
          value={thisWeek.length}
          hint={toConfirm ? t("overview.toConfirm", { n: toConfirm }) : undefined}
        />
        <Stat icon={Users} label={t("overview.activePatients")} value={activePatients} />
        <Stat icon={Inbox} label={t("overview.requests")} value={pending.length} />
      </div>

      {user && (
        <div className="mt-4">
          <ProScoreCard professionalId={user.id} />
        </div>
      )}

      <AttentionCard />

      {!setupDone && !rules.isLoading && (
        <Card title={t("overview.setupTitle")} className="mt-4">
          <ul className="space-y-2">
            {setup.map((s) => (
              <li key={s.label}>
                <Link to={s.to} className="flex items-center gap-2 text-sm hover:underline">
                  {s.done ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={cn(s.done && "text-muted-foreground line-through")}>
                    {s.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card
          title={t("overview.upcoming")}
          action={
            <Link to="/painel/agenda" className={buttonGhost}>
              {t("overview.openSchedule")}
            </Link>
          }
        >
          {appts.isLoading ? (
            <Loading />
          ) : upcoming.length === 0 ? (
            <EmptyState icon={CalendarDays} title={t("overview.noUpcoming")} />
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 8).map((a) => (
                <AppointmentCard
                  key={a.id}
                  appt={a}
                  role="professional"
                  person={people.data?.get(a.patient_id)}
                  payment={payments.data?.find((p) => p.appointment_id === a.id)}
                  compact
                />
              ))}
            </div>
          )}
        </Card>

        <Card title={t("overview.requestsTitle")}>
          {links.isLoading ? <Loading /> : <LinkRequests links={links.data ?? []} />}
        </Card>
      </div>
    </>
  );
}

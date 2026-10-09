import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, HeartHandshake, MessageCircle, Stethoscope, Utensils } from "lucide-react";
import { AppointmentCard } from "@/components/clinical/appointment-card";
import { TodayGoals } from "@/components/clinical/goals-today";
import { LabelReaderCard } from "@/components/clinical/label-reader-card";
import { NextMeal } from "@/components/clinical/next-meal";
import {
  Avatar,
  Card,
  EmptyState,
  LinkStatusBadge,
  Loading,
  PageHeader,
  buttonGhost,
  buttonPrimary,
} from "@/components/clinical/ui";
import { useAuth } from "@/hooks/use-auth";
import * as api from "@/lib/clinical/api";
import {
  useActivePlan,
  useAppointments,
  useClinicalMutation,
  useConversations,
  useLinks,
  usePeople,
} from "@/lib/clinical/queries";
import { formatDate } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";

export const Route = createFileRoute("/acompanhamento/")({
  component: PatientHome,
});

function PatientHome() {
  const { user } = useAuth();
  const { t, locale } = useClinicalI18n();
  const links = useLinks("patient");
  const nowIso = useMemo(() => new Date().toISOString(), []);
  const upcoming = useAppointments({ role: "patient", from: nowIso, limit: 5 });

  const visibleLinks = (links.data ?? []).filter(
    (l) => l.status === "ativo" || l.status === "pendente",
  );
  const next = (upcoming.data ?? []).find((a) =>
    ["aguardando_pagamento", "agendada", "confirmada"].includes(a.status),
  );
  const people = usePeople([
    ...visibleLinks.map((l) => l.professional_id),
    ...(next ? [next.professional_id] : []),
  ]);

  const end = useClinicalMutation((id: string) => api.endLink(id), {
    success: t("link.ended"),
  });

  const firstName = user?.name.split(" ")[0] ?? "";
  const plan = useActivePlan(user?.id);
  const conversations = useConversations(!!user);
  const unread = (conversations.data ?? [])
    .filter((c) => c.patientId === user?.id)
    .reduce((a, c) => a + c.unread, 0);
  const hasCare = visibleLinks.some((l) => l.status === "ativo");

  return (
    <>
      <PageHeader
        title={t("patientHome.hello", { name: firstName })}
        subtitle={t("patientHome.subtitle")}
      />

      {hasCare && user && (
        <div className="mb-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card
            title={t("patientHome.today")}
            action={
              <Link to="/acompanhamento/plano" className={buttonGhost}>
                <Utensils className="h-4 w-4" /> {t("patientHome.fullPlan")}
              </Link>
            }
          >
            {plan.data ? (
              <NextMeal plan={plan.data} />
            ) : (
              <p className="text-sm text-muted-foreground">{t("patientHome.noPlanYet")}</p>
            )}
            {unread > 0 && (
              <Link
                to="/acompanhamento/mensagens"
                className="mt-3 flex items-center gap-2 rounded-xl bg-primary-soft px-4 py-3 text-sm font-semibold text-primary hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" /> {t("patientHome.unread", { n: unread })}
              </Link>
            )}
          </Card>
          <Card
            title={t("patientHome.goalsToday")}
            action={
              <Link to="/acompanhamento/metas" className={buttonGhost}>
                {t("common.seeAll")}
              </Link>
            }
          >
            <TodayGoals patientId={user.id} compact />
          </Card>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card
          title={t("patientHome.nextAppointment")}
          action={
            <Link to="/acompanhamento/consultas" className={buttonGhost}>
              {t("common.seeAll")}
            </Link>
          }
        >
          {upcoming.isLoading ? (
            <Loading />
          ) : next ? (
            <AppointmentCard
              appt={next}
              role="patient"
              person={people.data?.get(next.professional_id)}
              compact
            />
          ) : (
            <EmptyState
              icon={CalendarDays}
              title={t("patientHome.noAppointment")}
              action={
                <Link to="/profissionais" className={buttonPrimary}>
                  {t("patientAppts.book")}
                </Link>
              }
            />
          )}
        </Card>

        <LabelReaderCard />

        <Card title={t("patientHome.myProfessionals")}>
          {links.isLoading ? (
            <Loading />
          ) : visibleLinks.length === 0 ? (
            <EmptyState
              icon={HeartHandshake}
              title={t("patientHome.noProfessionals")}
              text={t("patientHome.noProfessionalsText")}
              action={
                <Link to="/profissionais" className={buttonPrimary}>
                  <Stethoscope className="h-4 w-4" /> {t("patientNav.findProfessional")}
                </Link>
              }
            />
          ) : (
            <ul className="space-y-3">
              {visibleLinks.map((l) => {
                const person = people.data?.get(l.professional_id);
                return (
                  <li key={l.id} className="flex items-center gap-3">
                    <Avatar name={person?.name ?? "…"} url={person?.avatarUrl} />
                    <div className="min-w-0 flex-1">
                      <Link
                        to="/profissionais/$professionalId"
                        params={{ professionalId: l.professional_id }}
                        className="block truncate text-sm font-semibold text-foreground hover:underline"
                      >
                        {person?.name ?? "…"}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {l.status === "ativo"
                          ? t("patientHome.since", {
                              date: formatDate(l.responded_at ?? l.created_at, locale),
                            })
                          : t("link.pendingText")}
                      </p>
                    </div>
                    <LinkStatusBadge status={l.status} />
                    <button
                      type="button"
                      className={buttonGhost}
                      disabled={end.isPending}
                      onClick={() => {
                        if (
                          window.confirm(
                            l.status === "ativo" ? t("link.endConfirm") : t("link.withdrawConfirm"),
                          )
                        )
                          end.mutate(l.id);
                      }}
                    >
                      {l.status === "ativo" ? t("link.end") : t("link.withdraw")}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

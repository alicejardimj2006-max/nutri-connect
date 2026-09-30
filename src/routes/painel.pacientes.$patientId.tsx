import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Mail, Phone, Plus } from "lucide-react";
import { AppointmentCard } from "@/components/clinical/appointment-card";
import { NewAppointmentDialog } from "@/components/clinical/new-appointment-dialog";
import {
  Avatar,
  Card,
  EmptyState,
  LinkStatusBadge,
  Loading,
  Tabs,
  buttonGhost,
  buttonPrimary,
} from "@/components/clinical/ui";
import { useAuth } from "@/hooks/use-auth";
import * as api from "@/lib/clinical/api";
import {
  useAppointments,
  useClinicalMutation,
  useLinks,
  usePatientPrivate,
  usePayments,
  usePeople,
} from "@/lib/clinical/queries";
import { ageFrom, formatDate } from "@/lib/clinical/format";
import { useClinicalI18n, type ClinicalKey } from "@/lib/clinical/i18n";

export const Route = createFileRoute("/painel/pacientes/$patientId")({
  component: PatientRecordPage,
});

type RecordTab = "consultas";

function PatientRecordPage() {
  const { patientId } = Route.useParams();
  const { user } = useAuth();
  const { t, locale } = useClinicalI18n();
  const [tab, setTab] = useState<RecordTab>("consultas");
  const [creating, setCreating] = useState(false);

  const people = usePeople([patientId]);
  const person = people.data?.get(patientId);
  const priv = usePatientPrivate(patientId);
  const links = useLinks("professional");
  const link = (links.data ?? []).find((l) => l.patient_id === patientId);
  const isActive = link?.status === "ativo";

  const end = useClinicalMutation((id: string) => api.endLink(id), { success: t("link.ended") });

  if (people.isLoading || links.isLoading) return <Loading />;
  if (!link) {
    return <EmptyState icon={CalendarDays} title={t("record.notFound")} />;
  }

  const age = ageFrom(priv.data?.birth_date);

  return (
    <>
      <Link
        to="/painel/pacientes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("record.back")}
      </Link>

      <Card className="mb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar name={person?.name ?? "…"} url={person?.avatarUrl} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-extrabold text-foreground">
                {person?.name}
              </h1>
              <LinkStatusBadge status={link.status} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {[
                age !== null && t("record.age", { n: age }),
                priv.data?.sex && t(`record.sex.${priv.data.sex}` as ClinicalKey),
                t("patientHome.since", {
                  date: formatDate(link.responded_at ?? link.created_at, locale),
                }),
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {priv.data?.email && (
                <a
                  href={`mailto:${priv.data.email}`}
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  <Mail className="h-3.5 w-3.5" /> {priv.data.email}
                </a>
              )}
              {priv.data?.phone && (
                <a
                  href={`tel:${priv.data.phone}`}
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  <Phone className="h-3.5 w-3.5" /> {priv.data.phone}
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {isActive && (
              <button type="button" className={buttonPrimary} onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4" /> {t("schedule.new")}
              </button>
            )}
            {isActive && (
              <button
                type="button"
                className={buttonGhost}
                disabled={end.isPending}
                onClick={() => window.confirm(t("record.endConfirm")) && end.mutate(link.id)}
              >
                {t("link.end")}
              </button>
            )}
          </div>
        </div>
        {!isActive && (
          <p className="mt-3 rounded-xl bg-secondary px-3 py-2 text-xs text-muted-foreground">
            {t("record.readOnly")}
          </p>
        )}
      </Card>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[{ value: "consultas", label: t("record.tab.appointments") }]}
      />

      {tab === "consultas" && <PatientAppointments patientId={patientId} />}

      {creating && user && (
        <NewAppointmentDialog
          professionalId={user.id}
          defaultPatientId={patientId}
          onClose={() => setCreating(false)}
        />
      )}
    </>
  );
}

function PatientAppointments({ patientId }: { patientId: string }) {
  const { t } = useClinicalI18n();
  const appts = useAppointments({ role: "professional", patientId, ascending: false });
  const people = usePeople([patientId]);
  const payments = usePayments(
    (appts.data ?? []).filter((a) => a.price_cents > 0).map((a) => a.id),
  );

  if (appts.isLoading) return <Loading />;
  if (!appts.data?.length)
    return <EmptyState icon={CalendarDays} title={t("record.noAppointments")} />;
  return (
    <div className="space-y-3">
      {appts.data.map((a) => (
        <AppointmentCard
          key={a.id}
          appt={a}
          role="professional"
          person={people.data?.get(patientId)}
          payment={payments.data?.find((p) => p.appointment_id === a.id)}
        />
      ))}
    </div>
  );
}

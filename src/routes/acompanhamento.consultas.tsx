import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { AppointmentCard } from "@/components/clinical/appointment-card";
import { EmptyState, Loading, PageHeader, Tabs, buttonPrimary } from "@/components/clinical/ui";
import type { Appointment } from "@/lib/clinical/api";
import { useAppointments, usePayments, usePeople } from "@/lib/clinical/queries";
import { startCheckout } from "@/lib/clinical/payments";
import { useClinicalI18n } from "@/lib/clinical/i18n";

export const Route = createFileRoute("/acompanhamento/consultas")({
  component: PatientAppointmentsPage,
});

function PatientAppointmentsPage() {
  const { t } = useClinicalI18n();
  const [tab, setTab] = useState<"proximas" | "anteriores">("proximas");
  const { data, isLoading } = useAppointments({ role: "patient", ascending: true });

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const all = data ?? [];
    return {
      upcoming: all.filter(
        (a) =>
          new Date(a.ends_at).getTime() >= now &&
          ["aguardando_pagamento", "agendada", "confirmada"].includes(a.status),
      ),
      past: all
        .filter(
          (a) =>
            new Date(a.ends_at).getTime() < now ||
            !["aguardando_pagamento", "agendada", "confirmada"].includes(a.status),
        )
        .reverse(),
    };
  }, [data]);

  const people = usePeople((data ?? []).map((a) => a.professional_id));
  const payments = usePayments((data ?? []).filter((a) => a.price_cents > 0).map((a) => a.id));
  const paymentFor = (id: string) => payments.data?.find((p) => p.appointment_id === id);

  const pay = async (appt: Appointment) => {
    try {
      window.location.href = await startCheckout(appt.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  };

  const list = tab === "proximas" ? upcoming : past;

  return (
    <>
      <PageHeader
        title={t("patientAppts.title")}
        subtitle={t("patientAppts.subtitle")}
        action={
          <Link to="/profissionais" className={buttonPrimary}>
            {t("patientAppts.book")}
          </Link>
        }
      />
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "proximas", label: t("patientAppts.upcoming"), count: upcoming.length },
          { value: "anteriores", label: t("patientAppts.past"), count: past.length },
        ]}
      />
      {isLoading ? (
        <Loading />
      ) : list.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={tab === "proximas" ? t("patientAppts.emptyUpcoming") : t("patientAppts.emptyPast")}
          text={tab === "proximas" ? t("patientAppts.emptyUpcomingText") : undefined}
        />
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <AppointmentCard
              key={a.id}
              appt={a}
              role="patient"
              person={people.data?.get(a.professional_id)}
              payment={paymentFor(a.id)}
              onPay={pay}
            />
          ))}
        </div>
      )}
    </>
  );
}

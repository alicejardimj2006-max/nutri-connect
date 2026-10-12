import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ChevronRight, MessageCircle } from "lucide-react";
import {
  Avatar,
  Card,
  EmptyState,
  Loading,
  PageHeader,
  buttonGhost,
} from "@/components/clinical/ui";
import { useTr } from "@/components/settings-ui";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { usePeople } from "@/lib/clinical/queries";
import {
  lightOf,
  needsAttention,
  nudgeText,
  useAdherence,
  type Light,
} from "@/lib/clinical/adherence";
import { LIGHT_NAMES, LIGHT_STYLE, lastSeen } from "@/components/clinical/adherence-ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/adesao/")({
  component: AdherencePage,
});

const ORDER: Record<Light, number> = { vermelho: 0, amarelo: 1, verde: 2 };

function AdherencePage() {
  const tr = useTr();
  const { locale } = useClinicalI18n();
  const adherence = useAdherence(7);
  const rows = useMemo(
    () =>
      (adherence.data ?? [])
        .map((r) => ({ row: r, ...lightOf(r) }))
        .sort((a, b) => ORDER[a.light] - ORDER[b.light] || a.score - b.score),
    [adherence.data],
  );
  const people = usePeople(rows.map((r) => r.row.patient_id));

  const signal = (label: string, value: number, of = 7) => (
    <span className="whitespace-nowrap">
      {label} <strong className="text-foreground">{value}</strong>/{of}
    </span>
  );

  return (
    <>
      <PageHeader
        title={tr([
          "Adesão dos pacientes",
          "Patient adherence",
          "Adherencia de pacientes",
          "Adhésion des patients",
        ])}
        subtitle={tr([
          "Últimos 7 dias: diário, metas cumpridas, água e plano de cuidado. Quem está há 7 dias sem registrar aparece primeiro.",
          "Last 7 days: diary, goals met, water and care plan. Anyone 7 days without logging comes first.",
          "Últimos 7 días: diario, metas cumplidas, agua y plan de cuidado. Quien lleva 7 días sin registrar aparece primero.",
          "7 derniers jours : journal, objectifs atteints, eau et plan de soins. Les patients sans saisie depuis 7 jours d'abord.",
        ])}
      />
      <Card padded={false}>
        {adherence.isLoading ? (
          <Loading />
        ) : rows.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Activity}
              title={tr([
                "Nenhum paciente ativo",
                "No active patients",
                "Ningún paciente activo",
                "Aucun patient actif",
              ])}
            />
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {rows.map(({ row, light }) => {
              const person = people.data?.get(row.patient_id);
              const first = (person?.name ?? "").split(" ")[0];
              return (
                <li key={row.patient_id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span
                    className={cn("h-3 w-3 shrink-0 rounded-full", LIGHT_STYLE[light])}
                    title={tr(LIGHT_NAMES[light])}
                    aria-label={tr(LIGHT_NAMES[light])}
                  />
                  <Avatar name={person?.name ?? "…"} url={person?.avatarUrl} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {person?.name ?? "…"}
                    </p>
                    <p className="text-xs text-muted-foreground">{lastSeen(row, tr)}</p>
                    <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                      {signal(tr(["Diário", "Diary", "Diario", "Journal"]), row.diary_days)}
                      {row.goals_active > 0 &&
                        signal(tr(["Metas", "Goals", "Metas", "Objectifs"]), row.goal_days)}
                      {signal(tr(["Água", "Water", "Agua", "Eau"]), row.water_days)}
                      {row.care_active > 0 &&
                        signal(tr(["Cuidado", "Care", "Cuidado", "Soins"]), row.care_days)}
                    </p>
                  </div>
                  {needsAttention(row) && (
                    <Link
                      to="/painel/mensagens"
                      search={{ com: row.patient_id, texto: nudgeText(first, locale) }}
                      className={buttonGhost}
                    >
                      <MessageCircle className="h-4 w-4" />
                      {tr([
                        "Mandar mensagem",
                        "Send message",
                        "Enviar mensaje",
                        "Envoyer un message",
                      ])}
                    </Link>
                  )}
                  <Link
                    to="/painel/adesao/$patientId"
                    params={{ patientId: row.patient_id }}
                    className={buttonGhost}
                  >
                    {tr(["Relatório", "Report", "Informe", "Rapport"])}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      <p className="mt-3 text-[11px] text-muted-foreground">
        {tr([
          "Em dia: registra na maioria dos dias. Oscilando: em alguns dias. Precisa de atenção: poucos registros ou 7 dias sem registrar. A água aparece como informação e não pesa no semáforo.",
          "On track: logs most days. Wavering: some days. Needs attention: few logs or 7 days without logging. Water is shown for information and doesn't count toward the light.",
          "Al día: registra la mayoría de los días. Oscilando: algunos días. Necesita atención: pocos registros o 7 días sin registrar. El agua es informativa y no cuenta en el semáforo.",
          "À jour : note la plupart des jours. Irrégulier : certains jours. À surveiller : peu de saisies ou 7 jours sans rien. L'eau est indicative et ne compte pas.",
        ])}
      </p>
    </>
  );
}

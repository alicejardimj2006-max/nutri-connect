import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Droplet, HeartPulse, Printer, Target } from "lucide-react";
import {
  Card,
  Loading,
  PageHeader,
  Stat,
  buttonGhost,
  buttonSecondary,
} from "@/components/clinical/ui";
import { useTr } from "@/components/settings-ui";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { usePeople } from "@/lib/clinical/queries";
import { formatDate } from "@/lib/clinical/format";
import { useAdherenceDaily, type AdherenceDay } from "@/lib/clinical/adherence";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/adesao/$patientId")({
  component: AdherenceReport,
});

const DAYS = 30;

/** "AAAA-MM-DD" como data local (sem virar o dia anterior no fuso do Brasil). */
const local = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// Na impressão, só o relatório aparece (o menu e as colunas do painel somem).
const PRINT_CSS = `@media print {
  body * { visibility: hidden !important; }
  #relatorio-adesao, #relatorio-adesao * { visibility: visible !important; }
  #relatorio-adesao { position: absolute; inset: 0 auto auto 0; width: 100%; padding: 24px; }
  .no-print { display: none !important; }
}`;

type Row = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Intensidade de 0 a 1 do dia (0 = nada). */
  level: (d: AdherenceDay) => number;
  title: (d: AdherenceDay) => string;
};

function AdherenceReport() {
  const tr = useTr();
  const { locale } = useClinicalI18n();
  const { patientId } = Route.useParams();
  const daily = useAdherenceDaily(patientId, DAYS);
  const people = usePeople([patientId]);
  const person = people.data?.get(patientId);
  const days = daily.data ?? [];

  const hasGoals = days.some((d) => d.goals_total > 0);
  const hasCare = days.some((d) => d.care > 0);
  const count = (f: (d: AdherenceDay) => boolean) => days.filter(f).length;
  const diaryDays = count((d) => d.diary > 0);
  const goalDays = count((d) => d.goals_total > 0 && d.goals_done > 0);
  const waterDays = count((d) => d.water_goal !== null && d.water_glasses >= d.water_goal);
  const careDays = count((d) => d.care > 0);

  const rows: Row[] = [
    {
      key: "diario",
      label: tr(["Diário", "Diary", "Diario", "Journal"]),
      icon: BookOpen,
      level: (d) => Math.min(1, d.diary / 3),
      title: (d) =>
        tr([
          `${d.diary} refeição(ões)`,
          `${d.diary} meal(s)`,
          `${d.diary} comida(s)`,
          `${d.diary} repas`,
        ]),
    },
    ...(hasGoals
      ? [
          {
            key: "metas",
            label: tr(["Metas", "Goals", "Metas", "Objectifs"]),
            icon: Target,
            level: (d: AdherenceDay) => (d.goals_total ? d.goals_done / d.goals_total : 0),
            title: (d: AdherenceDay) => `${d.goals_done}/${d.goals_total}`,
          },
        ]
      : []),
    {
      key: "agua",
      label: tr(["Água", "Water", "Agua", "Eau"]),
      icon: Droplet,
      level: (d) => (d.water_goal ? Math.min(1, d.water_glasses / d.water_goal) : 0),
      title: (d) => (d.water_goal ? `${d.water_glasses}/${d.water_goal}` : "—"),
    },
    ...(hasCare
      ? [
          {
            key: "cuidado",
            label: tr(["Plano de cuidado", "Care plan", "Plan de cuidado", "Plan de soins"]),
            icon: HeartPulse,
            level: (d: AdherenceDay) => (d.care > 0 ? 1 : 0),
            title: (d: AdherenceDay) => (d.care > 0 ? "✓" : "—"),
          },
        ]
      : []),
  ];

  // Semana a semana (do mais antigo ao mais recente).
  const weeks: AdherenceDay[][] = [];
  for (let i = days.length; i > 0; i -= 7) weeks.unshift(days.slice(Math.max(0, i - 7), i));

  const period =
    days.length > 0
      ? `${formatDate(local(days[0].day), locale)} – ${formatDate(local(days[days.length - 1].day), locale)}`
      : "";

  return (
    <div id="relatorio-adesao">
      <style>{PRINT_CSS}</style>
      <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-2">
        <Link to="/painel/adesao" className={buttonGhost}>
          <ArrowLeft className="h-4 w-4" />
          {tr(["Adesão", "Adherence", "Adherencia", "Adhésion"])}
        </Link>
        <button type="button" onClick={() => window.print()} className={buttonSecondary}>
          <Printer className="h-4 w-4" />
          {tr([
            "Imprimir ou salvar PDF",
            "Print or save PDF",
            "Imprimir o guardar PDF",
            "Imprimer ou PDF",
          ])}
        </button>
      </div>

      <PageHeader
        title={tr([
          `Relatório de adesão — ${person?.name ?? "…"}`,
          `Adherence report — ${person?.name ?? "…"}`,
          `Informe de adherencia — ${person?.name ?? "…"}`,
          `Rapport d'adhésion — ${person?.name ?? "…"}`,
        ])}
        subtitle={period}
      />

      {daily.isLoading ? (
        <Loading />
      ) : daily.isError ? (
        <Card>
          <p className="text-sm text-muted-foreground">{(daily.error as Error).message}</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat
              icon={BookOpen}
              label={tr([
                "Dias com diário",
                "Days with diary",
                "Días con diario",
                "Jours avec journal",
              ])}
              value={`${diaryDays}/${DAYS}`}
            />
            {hasGoals && (
              <Stat
                icon={Target}
                label={tr([
                  "Dias com meta cumprida",
                  "Days with a goal met",
                  "Días con meta cumplida",
                  "Jours avec objectif atteint",
                ])}
                value={`${goalDays}/${DAYS}`}
              />
            )}
            <Stat
              icon={Droplet}
              label={tr([
                "Dias com água na meta",
                "Days hitting water goal",
                "Días con agua en la meta",
                "Jours objectif d'eau atteint",
              ])}
              value={`${waterDays}/${DAYS}`}
            />
            {hasCare && (
              <Stat
                icon={HeartPulse}
                label={tr([
                  "Dias com plano de cuidado",
                  "Days with care plan",
                  "Días con plan de cuidado",
                  "Jours avec plan de soins",
                ])}
                value={`${careDays}/${DAYS}`}
              />
            )}
          </div>

          <Card
            title={tr(["Dia a dia", "Day by day", "Día a día", "Jour par jour"])}
            className="mt-4"
          >
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-0.5 text-[10px]">
                <thead>
                  <tr>
                    <th />
                    {days.map((d) => (
                      <th key={d.day} className="font-normal text-muted-foreground">
                        {Number(d.day.slice(8, 10))}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.key}>
                      <th className="whitespace-nowrap pr-2 text-left text-xs font-semibold text-foreground">
                        <r.icon className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
                        {r.label}
                      </th>
                      {days.map((d) => {
                        const level = r.level(d);
                        return (
                          <td
                            key={d.day}
                            title={`${formatDate(local(d.day), locale)}: ${r.title(d)}`}
                            className={cn(
                              "h-5 min-w-4 rounded",
                              level === 0 ? "bg-secondary" : "bg-primary",
                            )}
                            style={level > 0 ? { opacity: 0.3 + 0.7 * level } : undefined}
                          />
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {tr([
                "Quanto mais escuro, mais completo o dia. Passe o mouse sobre um dia para ver os números.",
                "The darker, the more complete the day. Hover a day to see the numbers.",
                "Cuanto más oscuro, más completo el día. Pasa el ratón sobre un día para ver los números.",
                "Plus c'est foncé, plus la journée est complète. Survolez un jour pour voir les chiffres.",
              ])}
            </p>
          </Card>

          <Card
            title={tr([
              "Semana a semana",
              "Week by week",
              "Semana a semana",
              "Semaine par semaine",
            ])}
            className="mt-4"
          >
            <ul className="space-y-1.5 text-sm text-foreground">
              {weeks.map((w) => (
                <li key={w[0].day} className="flex flex-wrap gap-x-4 gap-y-0.5">
                  <span className="w-36 font-semibold">
                    {formatDate(local(w[0].day), locale)} –{" "}
                    {formatDate(local(w[w.length - 1].day), locale)}
                  </span>
                  <span>
                    {tr(["Diário", "Diary", "Diario", "Journal"])}:{" "}
                    {w.filter((d) => d.diary > 0).length}/{w.length}
                  </span>
                  {hasGoals && (
                    <span>
                      {tr(["Metas", "Goals", "Metas", "Objectifs"])}:{" "}
                      {w.filter((d) => d.goals_done > 0).length}/{w.length}
                    </span>
                  )}
                  <span>
                    {tr(["Água", "Water", "Agua", "Eau"])}:{" "}
                    {
                      w.filter((d) => d.water_goal !== null && d.water_glasses >= d.water_goal)
                        .length
                    }
                    /{w.length}
                  </span>
                  {hasCare && (
                    <span>
                      {tr(["Cuidado", "Care", "Cuidado", "Soins"])}:{" "}
                      {w.filter((d) => d.care > 0).length}/{w.length}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Card>

          <p className="mt-4 text-[11px] text-muted-foreground">
            {tr([
              "Gerado pelo NutriConnect. Os números mostram registros feitos pelo paciente no app; dias sem registro não significam, necessariamente, que o plano não foi seguido.",
              "Generated by NutriConnect. Numbers reflect what the patient logged in the app; days without logs don't necessarily mean the plan wasn't followed.",
              "Generado por NutriConnect. Los números reflejan lo que el paciente registró en la app; días sin registro no significan, necesariamente, que no siguió el plan.",
              "Généré par NutriConnect. Les chiffres reflètent les saisies du patient dans l'appli ; un jour sans saisie ne signifie pas forcément que le plan n'a pas été suivi.",
            ])}
          </p>
        </>
      )}
    </div>
  );
}

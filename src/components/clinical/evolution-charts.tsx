import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import type { Anthropometric } from "@/lib/clinical/records";
import { formatDate, formatNumber, parseDate } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Point {
  t: number;
  value: number;
  self: boolean;
}

interface Metric {
  key: "weight" | "bodyFat" | "waist";
  unit: string;
  digits: number;
  pick: (a: Anthropometric) => number | null;
}

const METRICS: Metric[] = [
  { key: "weight", unit: "kg", digits: 1, pick: (a) => (a.weight_kg ? Number(a.weight_kg) : null) },
  {
    key: "bodyFat",
    unit: "%",
    digits: 1,
    pick: (a) => (a.body_fat_pct ? Number(a.body_fat_pct) : null),
  },
  {
    key: "waist",
    unit: "cm",
    digits: 1,
    pick: (a) => {
      const w = (a.circumferences as Record<string, number> | null)?.waist;
      return w ? Number(w) : null;
    },
  },
];

/** Evolução em gráficos pequenos lado a lado — uma medida por gráfico, cada um com seu eixo. */
export function EvolutionCharts({ rows }: { rows: Anthropometric[] }) {
  const { t, locale } = useClinicalI18n();
  const series = useMemo(
    () =>
      METRICS.map((m) => ({
        metric: m,
        points: rows
          .map((r) => ({
            t: parseDate(r.measured_at).getTime(),
            value: m.pick(r),
            self: !r.professional_id,
          }))
          .filter((p): p is Point => p.value !== null),
      })).filter((s) => s.points.length > 0),
    [rows],
  );

  if (!series.length) return null;

  const hasSelf = series.some((s) => s.points.some((p) => p.self));

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {series.map(({ metric, points }) => (
          <MetricChart
            key={metric.key}
            title={t(`evolution.${metric.key}`)}
            unit={metric.unit}
            digits={metric.digits}
            points={points}
            locale={locale}
          />
        ))}
      </div>
      {hasSelf && (
        <p className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />{" "}
            {t("evolution.byProfessional")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-primary bg-card" />{" "}
            {t("evolution.selfReported")}
          </span>
        </p>
      )}
    </div>
  );
}

function MetricChart({
  title,
  unit,
  digits,
  points,
  locale,
}: {
  title: string;
  unit: string;
  digits: number;
  points: Point[];
  locale: Locale;
}) {
  const { t } = useClinicalI18n();
  const first = points[0];
  const last = points[points.length - 1];
  const delta = last.value - first.value;
  const values = points.map((p) => p.value);
  const pad = Math.max(1, (Math.max(...values) - Math.min(...values)) * 0.25);

  return (
    <figure className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
      <figcaption className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        {points.length > 1 && (
          <span
            className={cn(
              "text-xs font-semibold",
              delta === 0 ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {delta > 0 ? "+" : ""}
            {formatNumber(delta, locale, digits)} {unit}
          </span>
        )}
      </figcaption>
      <p className="font-display text-2xl font-bold text-foreground">
        {formatNumber(last.value, locale, digits)}
        <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>
      </p>
      <div
        className="mt-2 h-32"
        aria-label={`${title}: ${points.map((p) => formatNumber(p.value, locale, digits)).join(", ")} ${unit}`}
        role="img"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid
              vertical={false}
              stroke="var(--color-border)"
              strokeDasharray="0"
              strokeOpacity={0.6}
            />
            <XAxis
              dataKey="t"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(v: number) =>
                formatDate(new Date(v), locale, { day: "numeric", month: "short" })
              }
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
              padding={{ left: 8, right: 8 }}
            />
            <YAxis
              domain={[Math.floor(Math.min(...values) - pad), Math.ceil(Math.max(...values) + pad)]}
              tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              width={44}
              tickCount={4}
            />
            <Tooltip
              cursor={{ stroke: "var(--color-muted-foreground)", strokeDasharray: "3 3" }}
              content={(props: TooltipProps<number, string>) => {
                const p = props.payload?.[0]?.payload as Point | undefined;
                if (!props.active || !p) return null;
                return (
                  <div className="rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
                    <p className="font-semibold text-foreground">
                      {formatNumber(p.value, locale, digits)} {unit}
                    </p>
                    <p className="text-muted-foreground">
                      {formatDate(new Date(p.t), locale)} ·{" "}
                      {p.self ? t("evolution.selfReported") : t("evolution.byProfessional")}
                    </p>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-primary)"
              strokeWidth={2}
              isAnimationActive={false}
              dot={(props: { cx?: number; cy?: number; payload?: Point; index?: number }) => (
                <circle
                  key={props.index}
                  cx={props.cx}
                  cy={props.cy}
                  r={4.5}
                  strokeWidth={2}
                  stroke="var(--color-primary)"
                  fill={props.payload?.self ? "var(--color-card)" : "var(--color-primary)"}
                />
              )}
              activeDot={{
                r: 6,
                stroke: "var(--color-card)",
                strokeWidth: 2,
                fill: "var(--color-primary)",
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

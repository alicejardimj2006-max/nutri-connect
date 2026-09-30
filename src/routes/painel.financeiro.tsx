import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Download,
  Percent,
  Receipt,
  Wallet,
} from "lucide-react";
import { ManageAppointmentDialog } from "@/components/clinical/appointment-card";
import {
  Card,
  EmptyState,
  Loading,
  PageHeader,
  PaymentStatusBadge,
  Stat,
  buttonGhost,
  buttonSecondary,
} from "@/components/clinical/ui";
import { useAuth } from "@/hooks/use-auth";
import type { Appointment } from "@/lib/clinical/api";
import {
  downloadCsv,
  listProfessionalPayments,
  monthRange,
  monthlyNet,
  counts,
  netOf,
  paymentDate,
  summarize,
  toCsv,
} from "@/lib/clinical/finance";
import { methodLabel } from "@/lib/clinical/labels";
import { useAppointments, usePeople } from "@/lib/clinical/queries";
import { formatDate, formatMoney } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";

export const Route = createFileRoute("/painel/financeiro")({
  component: FinancePage,
});

const HISTORY_MONTHS = 6;

function FinancePage() {
  const { user } = useAuth();
  const { t, locale } = useClinicalI18n();
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const range = monthRange(cursor.y, cursor.m);
  const since = useMemo(
    () => new Date(now.getFullYear(), now.getMonth() - (HISTORY_MONTHS - 1), 1),
    [],
  ); // eslint-disable-line react-hooks/exhaustive-deps
  const historyStart = range.from < since ? range.from : since;

  const payments = useQuery({
    queryKey: ["clinical", "payments", "finance", user?.id, historyStart.toISOString()],
    queryFn: () => listProfessionalPayments(user!.id, historyStart),
    enabled: !!user,
  });
  const appts = useAppointments({
    role: "professional",
    from: range.from.toISOString(),
    to: range.to.toISOString(),
  });
  const [managing, setManaging] = useState<Appointment | null>(null);

  const summary = useMemo(
    () => summarize(payments.data ?? [], appts.data ?? [], range),
    [payments.data, appts.data, range.from.getTime()], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const monthly = useMemo(
    () => monthlyNet(payments.data ?? [], HISTORY_MONTHS, new Date(cursor.y, cursor.m, 1)),
    [payments.data, cursor],
  );
  const monthPayments = (payments.data ?? []).filter((p) => {
    const d = new Date(paymentDate(p));
    return d >= range.from && d < range.to;
  });
  const people = usePeople([
    ...monthPayments.map((p) => p.patient_id),
    ...summary.receivable.map((a) => a.patient_id),
  ]);

  const shift = (delta: number) => {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };
  const isCurrentMonth = cursor.y === now.getFullYear() && cursor.m === now.getMonth();
  const monthLabel = formatDate(range.from, locale, { month: "long", year: "numeric" });
  const money = (c: number) => formatMoney(c, locale);

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      [
        t("finance.csv.date"),
        t("finance.csv.patient"),
        t("finance.csv.method"),
        t("finance.csv.status"),
        t("finance.csv.gross"),
        t("finance.csv.fee"),
        t("finance.csv.net"),
      ],
      ...monthPayments.map((p) => [
        formatDate(paymentDate(p), locale, { day: "2-digit", month: "2-digit", year: "numeric" }),
        people.data?.get(p.patient_id)?.name ?? "",
        p.provider === "manual"
          ? `${methodLabel(p.method ?? "", t)} (${t("finance.manual")})`
          : `Mercado Pago · ${methodLabel(p.method ?? "", t)}`,
        t(`payment.status.${p.status}`),
        (p.amount_cents / 100).toFixed(2).replace(".", ","),
        (p.platform_fee_cents / 100).toFixed(2).replace(".", ","),
        ((counts(p) ? netOf(p) : 0) / 100).toFixed(2).replace(".", ","),
      ]),
    ];
    downloadCsv(
      `nutriconnect-financeiro-${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}.csv`,
      toCsv(rows),
    );
  };

  return (
    <>
      <PageHeader
        title={t("finance.title")}
        subtitle={t("finance.subtitle")}
        action={
          <button
            type="button"
            className={buttonSecondary}
            onClick={exportCsv}
            disabled={!monthPayments.length}
          >
            <Download className="h-4 w-4" /> CSV
          </button>
        }
      />

      <div className="mb-4 flex items-center gap-1">
        <button
          type="button"
          className={buttonGhost}
          aria-label={t("finance.prevMonth")}
          onClick={() => shift(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-40 text-center text-sm font-semibold text-foreground first-letter:uppercase">
          {monthLabel}
        </span>
        <button
          type="button"
          className={buttonGhost}
          aria-label={t("finance.nextMonth")}
          disabled={isCurrentMonth}
          onClick={() => shift(1)}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {payments.isLoading || appts.isLoading ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat
              icon={Wallet}
              label={t("finance.net")}
              value={money(summary.net)}
              hint={t("finance.netHint", { n: summary.approved.length })}
            />
            <Stat
              icon={CircleDollarSign}
              label={t("finance.gross")}
              value={money(summary.gross)}
              hint={
                summary.averageTicket
                  ? t("finance.ticket", { value: money(summary.averageTicket) })
                  : undefined
              }
            />
            <Stat
              icon={Percent}
              label={t("finance.fees")}
              value={money(summary.fees)}
              hint={
                summary.refundedCents
                  ? t("finance.refunded", { value: money(summary.refundedCents) })
                  : undefined
              }
            />
            <Stat
              icon={Clock}
              label={t("finance.receivable")}
              value={money(summary.receivableCents)}
              hint={t("finance.receivableHint", { n: summary.receivable.length })}
            />
          </div>

          <Card title={t("finance.chartTitle")} className="mt-4">
            <div
              className="h-56"
              role="img"
              aria-label={monthly
                .map((m) => `${formatDate(m.month, locale, { month: "short" })}: ${money(m.cents)}`)
                .join(", ")}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthly.map((m) => ({ ...m, value: m.cents / 100 }))}
                  margin={{ top: 22, right: 8, bottom: 0, left: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--color-border)"
                    strokeOpacity={0.6}
                  />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(d: Date) => formatDate(d, locale, { month: "short" })}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(v: number) =>
                      new Intl.NumberFormat(locale, {
                        notation: "compact",
                        style: "currency",
                        currency: "BRL",
                      }).format(v)
                    }
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    width={64}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--color-secondary)", opacity: 0.6 }}
                    content={({ active, payload }) => {
                      const p = payload?.[0]?.payload as { month: Date; cents: number } | undefined;
                      if (!active || !p) return null;
                      return (
                        <div className="rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
                          <p className="font-semibold text-foreground">{money(p.cents)}</p>
                          <p className="text-muted-foreground first-letter:uppercase">
                            {formatDate(p.month, locale, { month: "long", year: "numeric" })}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                    isAnimationActive={false}
                  >
                    {monthly.map((m, i) => (
                      <Cell
                        key={i}
                        fill="var(--color-primary)"
                        fillOpacity={i === monthly.length - 1 ? 1 : 0.45}
                      />
                    ))}
                    <LabelList
                      dataKey="cents"
                      position="top"
                      content={(props) => {
                        const { x, y, width, index, value } = props as {
                          x: number;
                          y: number;
                          width: number;
                          index: number;
                          value: number;
                        };
                        if (index !== monthly.length - 1 || !value) return null;
                        return (
                          <text
                            x={x + width / 2}
                            y={y - 6}
                            textAnchor="middle"
                            fontSize={11}
                            fontWeight={700}
                            fill="var(--color-foreground)"
                          >
                            {money(value)}
                          </text>
                        );
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t("finance.chartHint")}</p>
          </Card>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <Card title={t("finance.payments")} padded={false}>
              {monthPayments.length === 0 ? (
                <div className="p-4">
                  <EmptyState icon={Receipt} title={t("finance.noPayments")} />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead>
                      <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
                        <th className="px-4 py-2 font-medium">{t("finance.csv.date")}</th>
                        <th className="px-2 py-2 font-medium">{t("finance.csv.patient")}</th>
                        <th className="px-2 py-2 font-medium">{t("finance.csv.method")}</th>
                        <th className="px-2 py-2 text-right font-medium">{t("finance.csv.net")}</th>
                        <th className="px-4 py-2 text-right font-medium">
                          {t("finance.csv.status")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthPayments.map((p) => (
                        <tr key={p.id} className="border-b border-border/40 last:border-0">
                          <td className="px-4 py-2 text-muted-foreground">
                            {formatDate(paymentDate(p), locale, { day: "numeric", month: "short" })}
                          </td>
                          <td className="px-2 py-2 text-foreground">
                            {people.data?.get(p.patient_id)?.name ?? "…"}
                          </td>
                          <td className="px-2 py-2 text-muted-foreground">
                            {p.provider === "manual" ? t("finance.manual") : "Mercado Pago"}
                            {p.method ? ` · ${methodLabel(p.method, t)}` : ""}
                          </td>
                          <td className="px-2 py-2 text-right tabular-nums text-foreground">
                            {counts(p) ? money(netOf(p)) : "—"}
                            {counts(p) && p.platform_fee_cents > 0 && (
                              <span className="block text-[11px] text-muted-foreground">
                                {t("finance.feeShort", { value: money(p.platform_fee_cents) })}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <PaymentStatusBadge status={p.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card title={t("finance.toReceive")}>
              {summary.receivable.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("finance.allPaid")}</p>
              ) : (
                <ul className="space-y-2">
                  {summary.receivable.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center gap-3 rounded-xl bg-secondary/60 px-3 py-2 text-sm"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-foreground">
                          {people.data?.get(a.patient_id)?.name ?? "…"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(a.starts_at, locale, { day: "numeric", month: "short" })} ·{" "}
                          {t(`appt.status.${a.status}`)}
                        </span>
                      </span>
                      <span className="tabular-nums text-foreground">{money(a.price_cents)}</span>
                      <button type="button" className={buttonGhost} onClick={() => setManaging(a)}>
                        {t("finance.register")}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}

      {managing && (
        <ManageAppointmentDialog
          appt={managing}
          person={people.data?.get(managing.patient_id)}
          onClose={() => setManaging(null)}
        />
      )}
    </>
  );
}

// Financeiro do profissional: pagamentos recebidos e consultas a receber.

import { supabase } from "@/integrations/supabase/client";
import type { Appointment, Payment } from "./api";

export interface MonthRange {
  from: Date;
  to: Date;
}

export function monthRange(year: number, month: number): MonthRange {
  return { from: new Date(year, month, 1), to: new Date(year, month + 1, 1) };
}

/** Líquido que fica com o profissional (manual: tudo; Mercado Pago: menos a taxa). */
export const netOf = (p: Payment) => p.amount_cents - p.platform_fee_cents;

/** Só pagamentos aprovados geram receita. */
export const counts = (p: Payment) => p.status === "aprovado";

/** Data em que o dinheiro entrou (ou a criação, para pagamentos ainda não aprovados). */
export const paymentDate = (p: Payment) => p.paid_at ?? p.created_at;

export async function listProfessionalPayments(
  professionalId: string,
  since: Date,
): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("professional_id", professionalId)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export function summarize(payments: Payment[], appointments: Appointment[], range: MonthRange) {
  const inRange = (iso: string) => {
    const d = new Date(iso);
    return d >= range.from && d < range.to;
  };
  const approved = payments.filter((p) => p.status === "aprovado" && inRange(paymentDate(p)));
  const refunded = payments.filter(
    (p) => p.status === "reembolsado" && inRange(p.refunded_at ?? p.created_at),
  );
  const paidIds = new Set(
    payments.filter((p) => p.status === "aprovado").map((p) => p.appointment_id),
  );
  const receivable = appointments.filter(
    (a) =>
      a.price_cents > 0 &&
      inRange(a.starts_at) &&
      ["agendada", "confirmada", "realizada"].includes(a.status) &&
      !paidIds.has(a.id),
  );
  const gross = approved.reduce((s, p) => s + p.amount_cents, 0);
  const fees = approved.reduce((s, p) => s + p.platform_fee_cents, 0);
  return {
    approved,
    refunded,
    receivable,
    gross,
    fees,
    net: gross - fees,
    receivableCents: receivable.reduce((s, a) => s + a.price_cents, 0),
    refundedCents: refunded.reduce((s, p) => s + p.amount_cents, 0),
    averageTicket: approved.length ? Math.round(gross / approved.length) : 0,
  };
}

/** Líquido recebido por mês (últimos N meses, do mais antigo ao atual). */
export function monthlyNet(payments: Payment[], months: number, ref = new Date()) {
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(ref.getFullYear(), ref.getMonth() - (months - 1 - i), 1);
    const range = monthRange(d.getFullYear(), d.getMonth());
    const cents = payments
      .filter((p) => p.status === "aprovado")
      .filter((p) => {
        const at = new Date(paymentDate(p));
        return at >= range.from && at < range.to;
      })
      .reduce((s, p) => s + netOf(p), 0);
    return { month: d, cents };
  });
}

export function toCsv(rows: (string | number)[][]): string {
  return rows
    .map((r) =>
      r
        .map((v) => (typeof v === "string" && /[";\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v))
        .join(";"),
    )
    .join("\n");
}

export function downloadCsv(name: string, csv: string) {
  // BOM para o Excel abrir com acentos corretos.
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

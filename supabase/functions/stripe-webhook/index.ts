// Webhook do Stripe. Público (verify_jwt = false): a autenticidade vem da assinatura
// Stripe-Signature, verificada com STRIPE_WEBHOOK_SECRET.
// Eventos tratados: checkout.session.completed (confirma a consulta) e charge.refunded
// (estorno feito direto no painel do Stripe).
import { json, serve } from "../_shared/http.ts";
import { createRefund, verifyWebhookSignature } from "../_shared/stripe.ts";
import { adminClient } from "../_shared/supabase.ts";

interface StripeEvent {
  type?: string;
  data?: { object?: Record<string, unknown> };
}

serve(async (req) => {
  const rawBody = await req.text();
  if (!(await verifyWebhookSignature(req, rawBody))) {
    return json({ error: "assinatura inválida" }, 401);
  }
  const event = JSON.parse(rawBody) as StripeEvent;
  const db = adminClient();

  if (event.type === "charge.refunded") {
    const charge = event.data?.object as { payment_intent?: string } | undefined;
    if (charge?.payment_intent) {
      await db
        .from("payments")
        .update({ status: "reembolsado", refunded_at: new Date().toISOString() })
        .eq("provider", "stripe")
        .eq("mp_payment_id", charge.payment_intent);
    }
    return json({ ok: true });
  }

  if (event.type !== "checkout.session.completed") return json({ ignored: true });

  const session = event.data?.object as {
    id?: string;
    payment_intent?: string;
    payment_status?: string;
    amount_total?: number;
    metadata?: { appointment_id?: string };
  };
  const appointmentId = session?.metadata?.appointment_id;
  if (!appointmentId || session.payment_status !== "paid") return json({ ignored: true });

  const { data: appt } = await db
    .from("appointments")
    .select("*")
    .eq("id", appointmentId)
    .maybeSingle();
  if (!appt) return json({ ignored: "consulta inexistente" });

  let status = "aprovado";
  const patch: Record<string, unknown> = {
    status,
    mp_payment_id: session.payment_intent ?? null, // payment_intent do Stripe
    method: null,
    paid_at: new Date().toISOString(),
    raw: session,
  };

  if (appt.status === "aguardando_pagamento") {
    await db
      .from("appointments")
      .update({ status: "agendada", hold_expires_at: null })
      .eq("id", appt.id);
  } else if (
    appt.status === "cancelada" &&
    appt.cancel_reason === "Pagamento não concluído a tempo"
  ) {
    // Pagou depois de o horário expirar: tenta recuperar a reserva; se já foi ocupada, estorna.
    const { error } = await db
      .from("appointments")
      .update({
        status: "agendada",
        hold_expires_at: null,
        cancel_reason: null,
        cancelled_at: null,
      })
      .eq("id", appt.id);
    if (error && session.payment_intent) {
      await createRefund(session.payment_intent);
      status = "reembolsado";
      patch.status = status;
      patch.refunded_at = new Date().toISOString();
    }
  }

  const { data: existing } = await db
    .from("payments")
    .select("id")
    .eq("appointment_id", appt.id)
    .eq("provider", "stripe")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing) {
    await db.from("payments").update(patch).eq("id", existing.id);
  } else {
    await db.from("payments").insert({
      ...patch,
      appointment_id: appt.id,
      patient_id: appt.patient_id,
      professional_id: appt.professional_id,
      amount_cents: session.amount_total ?? appt.price_cents,
      provider: "stripe",
      mp_preference_id: session.id ?? null,
    });
  }
  return json({ ok: true, status });
});

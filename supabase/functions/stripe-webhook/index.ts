// Webhook do Stripe. Público (verify_jwt = false): a autenticidade vem da assinatura
// Stripe-Signature, verificada com STRIPE_WEBHOOK_SECRET.
// Eventos tratados: checkout.session.completed (confirma a consulta) e charge.refunded
// (estorno feito direto no painel do Stripe).
import { json, serve } from "../_shared/http.ts";
import {
  createRefund,
  getSubscription,
  periodEnd,
  updateSubscription,
  verifyWebhookSignature,
} from "../_shared/stripe.ts";
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

  // ── Perfil de membros (assinaturas) ──────────────────────────────────────
  if (event.type?.startsWith("customer.subscription.") || event.type?.startsWith("invoice.")) {
    return await handleMemberEvent(event, db);
  }

  if (event.type !== "checkout.session.completed") return json({ ignored: true });

  const sessionObj = event.data?.object as {
    mode?: string;
    subscription?: string;
    metadata?: Record<string, string>;
  };
  if (sessionObj?.mode === "subscription" && sessionObj.metadata?.kind === "member") {
    const subId = sessionObj.subscription;
    if (!subId) return json({ ignored: "sem assinatura" });
    const sub = await getSubscription(subId);
    const price = sub.items?.data?.[0]?.price?.unit_amount ?? 0;
    await db.rpc("upsert_member_subscription", {
      p_pro: sessionObj.metadata.professional_id,
      p_member: sessionObj.metadata.member_id,
      p_status: "ativa",
      p_price_cents: price,
      p_stripe_subscription: subId,
      p_stripe_customer: sub.customer ?? null,
      p_period_end: periodEnd(sub),
    });
    return json({ ok: true, member: true });
  }

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

// Eventos de assinatura: status, fim do período, faturas e a taxa do nível atual.
async function handleMemberEvent(event: StripeEvent, db: ReturnType<typeof adminClient>) {
  const obj = event.data?.object as Record<string, unknown>;

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = obj as { id: string; status?: string; cancel_at_period_end?: boolean };
    const { data: row } = await db
      .from("member_subscriptions")
      .select("id, professional_id, member_id, price_cents")
      .eq("stripe_subscription_id", sub.id)
      .maybeSingle();
    if (!row) return json({ ignored: "assinatura desconhecida" });
    const status =
      event.type === "customer.subscription.deleted" || sub.status === "canceled"
        ? "cancelada"
        : sub.status === "past_due" || sub.status === "unpaid"
          ? "inadimplente"
          : sub.cancel_at_period_end
            ? "cancelando"
            : "ativa";
    await db.rpc("upsert_member_subscription", {
      p_pro: row.professional_id,
      p_member: row.member_id,
      p_status: status,
      p_price_cents: row.price_cents,
      p_stripe_subscription: sub.id,
      p_stripe_customer: null,
      p_period_end: periodEnd(obj as never),
    });
    return json({ ok: true, status });
  }

  const invoice = obj as {
    id: string;
    subscription?: string;
    parent?: { subscription_details?: { subscription?: string } };
    amount_paid?: number;
    billing_reason?: string;
    application_fee_amount?: number;
  };
  const subId = invoice.subscription ?? invoice.parent?.subscription_details?.subscription;
  if (!subId) return json({ ignored: "fatura sem assinatura" });

  if (event.type === "invoice.created" && invoice.billing_reason === "subscription_cycle") {
    // A taxa acompanha o nível atual do profissional: atualiza antes de a fatura ser cobrada.
    const { data: row } = await db
      .from("member_subscriptions")
      .select("professional_id")
      .eq("stripe_subscription_id", subId)
      .maybeSingle();
    if (row) {
      const { data: fee } = await db.rpc("pro_membership_fee_percent", { p_pro: row.professional_id });
      if (fee != null) await updateSubscription(subId, { application_fee_percent: Number(fee) });
    }
    return json({ ok: true, fee: true });
  }

  if (event.type === "invoice.paid") {
    const amount = invoice.amount_paid ?? 0;
    const { data: row } = await db
      .from("member_subscriptions")
      .select("professional_id, status")
      .eq("stripe_subscription_id", subId)
      .maybeSingle();
    if (!row) return json({ ignored: "assinatura desconhecida" });
    const { data: feePct } = await db.rpc("pro_membership_fee_percent", { p_pro: row.professional_id });
    const fee = invoice.application_fee_amount ?? Math.round((amount * Number(feePct ?? 20)) / 100);
    await db.rpc("record_member_invoice", {
      p_stripe_subscription: subId,
      p_stripe_invoice: invoice.id,
      p_amount_cents: amount,
      p_fee_cents: fee,
    });
    // Pagamento em dia tira a assinatura da inadimplência e renova o período.
    const sub = await getSubscription(subId);
    await db
      .from("member_subscriptions")
      .update({
        status: sub.cancel_at_period_end ? "cancelando" : "ativa",
        current_period_end: periodEnd(sub),
      })
      .eq("stripe_subscription_id", subId);
    return json({ ok: true, invoice: true });
  }

  if (event.type === "invoice.payment_failed") {
    await db.from("member_subscriptions").update({ status: "inadimplente" }).eq("stripe_subscription_id", subId);
    return json({ ok: true });
  }

  return json({ ignored: true });
}

// Notificações do Mercado Pago. Público (verify_jwt = false): a autenticidade vem
// da assinatura x-signature e, principalmente, da consulta à API do próprio MP.
import { json, serve } from "../_shared/http.ts";
import { getPayment, mapStatus, refundPayment, sellerToken, verifyWebhook } from "../_shared/mp.ts";
import { adminClient } from "../_shared/supabase.ts";

serve(async (req) => {
  const url = new URL(req.url);
  const body = (await req.json().catch(() => ({}))) as {
    type?: string;
    topic?: string;
    data?: { id?: string | number };
  };
  const type =
    body.type ?? body.topic ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const paymentId = String(
    body.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "",
  );
  const appointmentId = url.searchParams.get("appointment");

  if (type !== "payment" || !paymentId || !appointmentId) return json({ ignored: true });
  if (!(await verifyWebhook(req, paymentId))) return json({ error: "assinatura inválida" }, 401);

  const db = adminClient();
  const { data: appt } = await db
    .from("appointments")
    .select("*")
    .eq("id", appointmentId)
    .maybeSingle();
  if (!appt) return json({ ignored: "consulta inexistente" });

  const token = await sellerToken(appt.professional_id);
  const payment = await getPayment(token, paymentId);
  // O pagamento precisa ser mesmo desta consulta (evita notificações forjadas).
  if (payment.external_reference !== appt.id) return json({ ignored: "referência diferente" });

  let status = mapStatus(payment.status);
  const patch: Record<string, unknown> = {
    status,
    mp_payment_id: String(payment.id),
    method: payment.payment_type_id ?? payment.payment_method_id ?? null,
    paid_at: payment.date_approved ?? null,
    raw: payment,
  };

  if (status === "aprovado") {
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
      if (error) {
        await refundPayment(token, String(payment.id));
        status = "reembolsado";
        patch.status = status;
        patch.refunded_at = new Date().toISOString();
      }
    }
  }

  const { data: existing } = await db
    .from("payments")
    .select("id")
    .eq("appointment_id", appt.id)
    .eq("provider", "mercado_pago")
    .or(`mp_payment_id.eq.${payment.id},mp_payment_id.is.null`)
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
      amount_cents: Math.round((payment.transaction_amount ?? appt.price_cents / 100) * 100),
      provider: "mercado_pago",
    });
  }
  return json({ ok: true, status });
});

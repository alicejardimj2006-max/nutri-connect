// Webhook do Stripe. Rota pública para chamador externo: a autenticidade vem
// da assinatura Stripe-Signature verificada com STRIPE_WEBHOOK_SECRET.
import { createFileRoute } from "@tanstack/react-router";
import { createRefund, verifyWebhookSignature } from "@/lib/stripe.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const valid = await verifyWebhookSignature(
          request.headers.get("Stripe-Signature"),
          rawBody,
        );
        if (!valid) return Response.json({ error: "assinatura inválida" }, { status: 401 });

        const event = JSON.parse(rawBody) as {
          type?: string;
          data?: { object?: Record<string, unknown> };
        };
        if (event.type !== "checkout.session.completed") return Response.json({ ignored: true });

        const session = event.data?.object as {
          id?: string;
          payment_intent?: string;
          payment_status?: string;
          amount_total?: number;
          metadata?: { appointment_id?: string };
        };
        const appointmentId = session?.metadata?.appointment_id;
        if (!appointmentId || session.payment_status !== "paid") {
          return Response.json({ ignored: true });
        }

        const { data: appt } = await supabaseAdmin
          .from("appointments")
          .select("*")
          .eq("id", appointmentId)
          .maybeSingle();
        if (!appt) return Response.json({ ignored: "consulta inexistente" });

        let status = "aprovado";
        const patch: Record<string, unknown> = {
          status,
          mp_payment_id: session.payment_intent ?? null, // payment_intent do Stripe
          method: "stripe_checkout",
          paid_at: new Date().toISOString(),
          raw: session,
        };

        if (appt.status === "aguardando_pagamento") {
          await supabaseAdmin
            .from("appointments")
            .update({ status: "agendada", hold_expires_at: null })
            .eq("id", appt.id);
        } else if (
          appt.status === "cancelada" &&
          appt.cancel_reason === "Pagamento não concluído a tempo"
        ) {
          // Pagou depois de o horário expirar: tenta recuperar a reserva; se já
          // foi ocupada por outra pessoa, estorna.
          const { error } = await supabaseAdmin
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

        const { data: existing } = await supabaseAdmin
          .from("payments")
          .select("id")
          .eq("appointment_id", appt.id)
          .eq("provider", "stripe")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (existing) {
          await supabaseAdmin.from("payments").update(patch).eq("id", existing.id);
        } else {
          await supabaseAdmin.from("payments").insert({
            ...patch,
            appointment_id: appt.id,
            patient_id: appt.patient_id,
            professional_id: appt.professional_id,
            amount_cents: session.amount_total ?? appt.price_cents,
            provider: "stripe",
            mp_preference_id: session.id ?? null,
          });
        }
        return Response.json({ ok: true, status });
      },
    },
  },
});

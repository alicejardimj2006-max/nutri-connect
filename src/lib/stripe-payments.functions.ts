// Pagamentos das consultas via Stripe (conta da plataforma). O checkout é
// criado aqui; a confirmação chega pelo webhook em /api/public/stripe-webhook.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const FEE_FALLBACK = 10;

type AdminClient = Awaited<
  typeof import("@/integrations/supabase/client.server")
>["supabaseAdmin"];

async function settingInt(admin: AdminClient, key: string, fallback: number): Promise<number> {
  const { data } = await admin
    .from("platform_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  const n = Number(data?.value);
  return Number.isFinite(n) ? n : fallback;
}

/** Cria (ou reaproveita) o Checkout do Stripe de uma consulta aguardando pagamento. */
export const startStripeCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { appointmentId: string; origin: string }) =>
    z
      .object({ appointmentId: z.string().uuid(), origin: z.string().url() })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { createCheckoutSession } = await import("./stripe.server");

    const { data: appt } = await supabaseAdmin
      .from("appointments")
      .select("*")
      .eq("id", data.appointmentId)
      .maybeSingle();
    if (!appt || appt.patient_id !== context.userId) throw new Error("Consulta não encontrada.");
    if (appt.status !== "aguardando_pagamento")
      throw new Error("Esta consulta não está aguardando pagamento.");
    if (!appt.hold_expires_at || new Date(appt.hold_expires_at) <= new Date()) {
      await supabaseAdmin.rpc("expire_payment_holds", { p_professional: appt.professional_id });
      throw new Error("O tempo para pagar expirou e o horário foi liberado. Agende novamente.");
    }

    const { data: pro } = await supabaseAdmin
      .from("profiles")
      .select("name")
      .eq("id", appt.professional_id)
      .single();

    const feePercent = await platformFeePercent(supabaseAdmin);
    const amount = appt.price_cents;
    const fee = Math.round((amount * feePercent) / 100);

    // Reaproveita a sessão pendente, se houver.
    const { data: existing } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("appointment_id", appt.id)
      .eq("provider", "stripe")
      .in("status", ["pendente", "em_processamento"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing?.checkout_url && existing.amount_cents === amount) {
      return { checkoutUrl: existing.checkout_url };
    }

    const when = new Date(appt.starts_at).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      dateStyle: "short",
      timeStyle: "short",
    });
    const back = (status: string) => `${data.origin}/acompanhamento/consultas?pagamento=${status}`;

    const session = await createCheckoutSession({
      mode: "payment",
      success_url: back("sucesso"),
      cancel_url: back("falha"),
      customer_email: context.claims.email,
      client_reference_id: appt.id,
      metadata: { appointment_id: appt.id },
      payment_intent_data: { metadata: { appointment_id: appt.id } },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "brl",
            unit_amount: amount,
            product_data: {
              name: `Consulta com ${pro?.name ?? "profissional"}`,
              description: `${appt.modality === "online" ? "On-line" : "Presencial"} · ${when}`,
            },
          },
        },
      ],
      expires_at: Math.min(
        Math.floor(new Date(appt.hold_expires_at).getTime() / 1000),
        Math.floor(Date.now() / 1000) + 23 * 3600, // limite máximo do Stripe: 24 h
      ),
    });
    if (!session.url) throw new Error("O Stripe não devolveu a URL de pagamento.");

    const row = {
      appointment_id: appt.id,
      patient_id: appt.patient_id,
      professional_id: appt.professional_id,
      amount_cents: amount,
      platform_fee_cents: fee,
      status: "pendente",
      provider: "stripe",
      mp_preference_id: session.id, // sessão do Stripe
      checkout_url: session.url,
    };
    const { error } = existing
      ? await supabaseAdmin.from("payments").update(row).eq("id", existing.id)
      : await supabaseAdmin.from("payments").insert(row);
    if (error) throw new Error(error.message);

    return { checkoutUrl: session.url };
  });

/** Pede o estorno de uma consulta cancelada (aplica a regra de prazo). */
export const requestStripeRefund = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { appointmentId: string }) =>
    z.object({ appointmentId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { createRefund } = await import("./stripe.server");

    const { data: appt } = await supabaseAdmin
      .from("appointments")
      .select("*")
      .eq("id", data.appointmentId)
      .maybeSingle();
    if (!appt || (appt.patient_id !== context.userId && appt.professional_id !== context.userId)) {
      throw new Error("Consulta não encontrada.");
    }
    if (appt.status !== "cancelada") throw new Error("A consulta não está cancelada.");

    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("appointment_id", appt.id)
      .eq("provider", "stripe")
      .eq("status", "aprovado")
      .maybeSingle();
    if (!payment?.mp_payment_id) {
      return { refunded: false, reason: "sem pagamento on-line" as const };
    }

    const minHours = await (async () => {
      const { data: s } = await supabaseAdmin
        .from("platform_settings")
        .select("value")
        .eq("key", "refund_min_notice_hours")
        .maybeSingle();
      const n = Number(s?.value);
      return Number.isFinite(n) ? n : 24;
    })();
    const byProfessional = appt.cancelled_by === appt.professional_id;
    const notice =
      new Date(appt.starts_at).getTime() - new Date(appt.cancelled_at ?? Date.now()).getTime();
    if (!byProfessional && notice < minHours * 3_600_000) {
      return { refunded: false, reason: "fora do prazo" as const, minHours };
    }

    await createRefund(payment.mp_payment_id);
    await supabaseAdmin
      .from("payments")
      .update({ status: "reembolsado", refunded_at: new Date().toISOString() })
      .eq("id", payment.id);
    return { refunded: true };
  });

// Cria (ou reaproveita) o Checkout do Stripe de uma consulta aguardando pagamento. O formulário é
// embutido na página /pagamento/:id do site (Embedded Checkout): a função devolve o clientSecret
// da sessão e a chave publicável, e o navegador monta o formulário.
// O pagamento cai na conta da plataforma; a taxa fica registrada em payments.platform_fee_cents
// e o repasse ao profissional é feito fora do app.
//
// Segredos: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY. Opcional: APP_URL (senão usa a origem
// enviada pelo app).
import { HttpError, env, json, serve } from "../_shared/http.ts";
import { createCheckoutSession, expireSession } from "../_shared/stripe.ts";
import { adminClient, requireUser, settingInt } from "../_shared/supabase.ts";

serve(async (req) => {
  const user = await requireUser(req);
  const { appointmentId, origin } = (await req.json().catch(() => ({}))) as {
    appointmentId?: string;
    origin?: string;
  };
  if (!appointmentId) throw new HttpError(400, "Consulta não informada.");
  const appUrl = Deno.env.get("APP_URL") ?? (origin && /^https?:\/\//.test(origin) ? origin : "");
  if (!appUrl) throw new HttpError(400, "Origem inválida.");

  const db = adminClient();
  const { data: appt } = await db
    .from("appointments")
    .select("*")
    .eq("id", appointmentId)
    .maybeSingle();
  if (!appt || appt.patient_id !== user.id) throw new HttpError(404, "Consulta não encontrada.");
  if (appt.status !== "aguardando_pagamento") {
    throw new HttpError(409, "Esta consulta não está aguardando pagamento.");
  }
  if (!appt.hold_expires_at || new Date(appt.hold_expires_at) <= new Date()) {
    await db.rpc("expire_payment_holds", { p_professional: appt.professional_id });
    throw new HttpError(
      410,
      "O tempo para pagar expirou e o horário foi liberado. Agende novamente.",
    );
  }

  const { data: pro } = await db
    .from("profiles")
    .select("name")
    .eq("id", appt.professional_id)
    .single();

  const feePercent = await settingInt("platform_fee_percent", 10);
  const amount = appt.price_cents;
  const fee = Math.round((amount * feePercent) / 100);

  // Reaproveita a sessão pendente, se houver.
  const { data: existing } = await db
    .from("payments")
    .select("*")
    .eq("appointment_id", appt.id)
    .eq("provider", "stripe")
    .in("status", ["pendente", "em_processamento"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const publishableKey = env("STRIPE_PUBLISHABLE_KEY");
  // Sempre cria uma sessão nova (assim o formulário reflete a versão atual) e encerra a anterior.
  if (existing?.mp_preference_id) {
    await expireSession(existing.mp_preference_id).catch(() => null);
  }

  // O Stripe exige que a sessão dure pelo menos 30 min. Se o pagamento sair depois do horário
  // reservado, o webhook tenta recuperar a vaga ou estorna.
  const now = Math.floor(Date.now() / 1000);
  const holdEnd = Math.floor(new Date(appt.hold_expires_at).getTime() / 1000);
  const session = await createCheckoutSession({
    mode: "payment",
    ui_mode: "embedded_page",
    locale: "pt-BR",
    // Só cartão: o formulário fica curto (sem o convite para salvar dados no Link) e cabe na tela.
    payment_method_types: ["card"],
    return_url: `${appUrl}/acompanhamento/consultas?pagamento=sucesso`,
    custom_text: {
      submit: {
        message: "Ao pagar, você aceita os Termos de Uso do NutriConnect.",
      },
    },
    customer_email: user.email,
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
          },
        },
      },
    ],
    expires_at: Math.min(Math.max(holdEnd, now + 31 * 60), now + 23 * 3600),
  });
  if (!session.client_secret) throw new HttpError(502, "O Stripe não devolveu o formulário de pagamento.");

  const row = {
    appointment_id: appt.id,
    patient_id: appt.patient_id,
    professional_id: appt.professional_id,
    amount_cents: amount,
    platform_fee_cents: fee,
    status: "pendente",
    provider: "stripe",
    mp_preference_id: session.id, // id da sessão do Stripe
    checkout_url: `${appUrl}/pagamento/${appt.id}`,
  };
  const { error } = existing
    ? await db.from("payments").update(row).eq("id", existing.id)
    : await db.from("payments").insert(row);
  if (error) throw new HttpError(500, error.message);

  return json({ clientSecret: session.client_secret, publishableKey });
});

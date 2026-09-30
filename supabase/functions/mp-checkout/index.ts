// Cria (ou reaproveita) o Checkout Pro de uma consulta aguardando pagamento.
// O pagamento cai na conta do profissional; a plataforma retém marketplace_fee.
import { HttpError, env, json, serve } from "../_shared/http.ts";
import { createPreference, sellerToken } from "../_shared/mp.ts";
import { adminClient, requireUser, settingInt } from "../_shared/supabase.ts";

const functionsBase = () =>
  Deno.env.get("PUBLIC_FUNCTIONS_URL") ?? `${env("SUPABASE_URL")}/functions/v1`;

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
  const { data: appt } = await db.from("appointments").select("*").eq("id", appointmentId).maybeSingle();
  if (!appt || appt.patient_id !== user.id) throw new HttpError(404, "Consulta não encontrada.");
  if (appt.status !== "aguardando_pagamento") throw new HttpError(409, "Esta consulta não está aguardando pagamento.");
  if (!appt.hold_expires_at || new Date(appt.hold_expires_at) <= new Date()) {
    await db.rpc("expire_payment_holds", { p_professional: appt.professional_id });
    throw new HttpError(410, "O tempo para pagar expirou e o horário foi liberado. Agende novamente.");
  }

  const [{ data: pro }, { data: account }] = await Promise.all([
    db.from("profiles").select("name").eq("id", appt.professional_id).single(),
    db.from("professional_mp_accounts").select("live_mode").eq("professional_id", appt.professional_id).maybeSingle(),
  ]);
  const token = await sellerToken(appt.professional_id);

  const feePercent = await settingInt("platform_fee_percent", 10);
  const amount = appt.price_cents;
  const fee = Math.round((amount * feePercent) / 100);

  // Reaproveita a preferência pendente, se houver.
  const { data: existing } = await db
    .from("payments")
    .select("*")
    .eq("appointment_id", appt.id)
    .eq("provider", "mercado_pago")
    .in("status", ["pendente", "em_processamento"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing?.checkout_url && existing.amount_cents === amount) {
    return json({ checkoutUrl: existing.checkout_url });
  }

  const when = new Date(appt.starts_at).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  });
  const back = (status: string) => `${appUrl}/acompanhamento/consultas?pagamento=${status}`;
  const preference = await createPreference(token, {
    items: [
      {
        id: appt.id,
        title: `Consulta com ${pro?.name ?? "profissional"}`,
        description: `${appt.modality === "online" ? "On-line" : "Presencial"} · ${when}`,
        quantity: 1,
        currency_id: "BRL",
        unit_price: amount / 100,
      },
    ],
    marketplace_fee: fee / 100,
    external_reference: appt.id,
    notification_url: `${functionsBase()}/mp-webhook?appointment=${appt.id}`,
    back_urls: { success: back("sucesso"), pending: back("pendente"), failure: back("falha") },
    auto_return: "approved",
    payer: user.email ? { email: user.email } : undefined,
    statement_descriptor: "NUTRICONNECT",
    expires: true,
    expiration_date_from: new Date().toISOString(),
    expiration_date_to: new Date(appt.hold_expires_at).toISOString(),
  });
  const checkoutUrl = account?.live_mode
    ? preference.init_point
    : (preference.sandbox_init_point ?? preference.init_point);

  const row = {
    appointment_id: appt.id,
    patient_id: appt.patient_id,
    professional_id: appt.professional_id,
    amount_cents: amount,
    platform_fee_cents: fee,
    status: "pendente",
    provider: "mercado_pago",
    mp_preference_id: preference.id,
    checkout_url: checkoutUrl,
  };
  const { error } = existing
    ? await db.from("payments").update(row).eq("id", existing.id)
    : await db.from("payments").insert(row);
  if (error) throw new HttpError(500, error.message);

  return json({ checkoutUrl });
});

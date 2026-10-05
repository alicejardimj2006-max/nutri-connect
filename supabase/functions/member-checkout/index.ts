// Cria o Checkout (assinatura mensal) do perfil de membros de um profissional. A cobrança vai para
// a conta Stripe do profissional (Connect) e a plataforma retém a parte do nível dele
// (application_fee_percent = pro_membership_fee_percent).
// Entrada: { professionalId, origin }. Saída: { clientSecret, publishableKey }.
import { HttpError, env, json, serve } from "../_shared/http.ts";
import { createCheckoutSession } from "../_shared/stripe.ts";
import { adminClient, requireUser } from "../_shared/supabase.ts";

serve(async (req) => {
  const user = await requireUser(req);
  const { professionalId, origin } = (await req.json().catch(() => ({}))) as {
    professionalId?: string;
    origin?: string;
  };
  if (!professionalId) throw new HttpError(400, "Profissional não informado.");
  if (professionalId === user.id) throw new HttpError(400, "Você não pode assinar o próprio perfil.");
  const appUrl = Deno.env.get("APP_URL") ?? (origin && /^https?:\/\//.test(origin) ? origin : "");
  if (!appUrl) throw new HttpError(400, "Origem inválida.");

  const db = adminClient();
  const [{ data: plan }, { data: allowed }, { data: acct }, { data: blocked }] = await Promise.all([
    db.from("member_plans").select("*").eq("professional_id", professionalId).maybeSingle(),
    db.rpc("pro_has_feature", { p_pro: professionalId, p_feature: "perfil_membros" }),
    db
      .from("pro_stripe_accounts")
      .select("stripe_account_id, charges_enabled")
      .eq("professional_id", professionalId)
      .maybeSingle(),
    db.rpc("is_blocked_between", { a: professionalId, b: user.id }),
  ]);
  if (!plan?.active || !allowed || !acct?.charges_enabled || blocked) {
    throw new HttpError(409, "Este perfil de membros não está disponível agora.");
  }
  if (await db.rpc("is_member", { p_pro: professionalId, p_user: user.id }).then((r) => r.data)) {
    throw new HttpError(409, "Você já é membro deste perfil.");
  }
  const { data: live } = await db
    .from("member_subscriptions")
    .select("id")
    .eq("professional_id", professionalId)
    .eq("member_id", user.id)
    .in("status", ["ativa", "inadimplente", "cancelando"])
    .maybeSingle();
  if (live) throw new HttpError(409, "Você já tem uma assinatura em andamento com este profissional.");

  const { data: feeRaw } = await db.rpc("pro_membership_fee_percent", { p_pro: professionalId });
  const fee = Number(feeRaw ?? 20);
  const { data: pro } = await db.from("profiles").select("name").eq("id", professionalId).single();
  const meta = { kind: "member", professional_id: professionalId, member_id: user.id };

  const session = await createCheckoutSession({
    mode: "subscription",
    ui_mode: "embedded_page",
    locale: "pt-BR",
    payment_method_types: ["card"],
    return_url: `${appUrl}/profissionais/${professionalId}?assinatura=sucesso`,
    custom_text: {
      submit: { message: "Cobrança mensal, cancele quando quiser. Você aceita os Termos de Uso do NutriConnect." },
    },
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: meta,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "brl",
          unit_amount: plan.price_cents,
          recurring: { interval: "month" },
          product_data: { name: `${plan.title} — ${pro?.name ?? "profissional"}` },
        },
      },
    ],
    subscription_data: {
      application_fee_percent: fee,
      transfer_data: { destination: acct.stripe_account_id },
      metadata: meta,
    },
  });
  if (!session.client_secret) throw new HttpError(502, "O Stripe não devolveu o formulário de pagamento.");
  return json({ clientSecret: session.client_secret, publishableKey: env("STRIPE_PUBLISHABLE_KEY") });
});

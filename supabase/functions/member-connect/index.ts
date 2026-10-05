// Conta de recebimento (Stripe Connect Express) do profissional que oferece o perfil de membros.
//   { action: "onboard", origin } -> cria a conta (se preciso) e devolve o link de cadastro do Stripe
//   { action: "status" }          -> atualiza e devolve o estado da conta (pode receber? pode sacar?)
// Só quem tem a função "perfil_membros" liberada (nível 3+) pode conectar.
import { HttpError, json, serve } from "../_shared/http.ts";
import { createAccountLink, createConnectAccount, getConnectAccount } from "../_shared/stripe.ts";
import { adminClient, requireUser } from "../_shared/supabase.ts";

serve(async (req) => {
  const user = await requireUser(req);
  const { action, origin } = (await req.json().catch(() => ({}))) as {
    action?: "onboard" | "status";
    origin?: string;
  };
  const db = adminClient();

  const { data: allowed } = await db.rpc("pro_has_feature", {
    p_pro: user.id,
    p_feature: "perfil_membros",
  });
  if (!allowed) throw new HttpError(403, "O perfil de membros é liberado a partir do nível Destaque.");

  const { data: row } = await db
    .from("pro_stripe_accounts")
    .select("stripe_account_id")
    .eq("professional_id", user.id)
    .maybeSingle();

  const save = async (acct: { id: string; charges_enabled?: boolean; payouts_enabled?: boolean; details_submitted?: boolean }) => {
    const { error } = await db.from("pro_stripe_accounts").upsert({
      professional_id: user.id,
      stripe_account_id: acct.id,
      charges_enabled: !!acct.charges_enabled,
      payouts_enabled: !!acct.payouts_enabled,
      details_submitted: !!acct.details_submitted,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new HttpError(500, error.message);
    // Conta que deixou de poder receber desativa a oferta.
    if (!acct.charges_enabled) {
      await db.from("member_plans").update({ active: false }).eq("professional_id", user.id);
    }
    return {
      connected: true,
      chargesEnabled: !!acct.charges_enabled,
      payoutsEnabled: !!acct.payouts_enabled,
      detailsSubmitted: !!acct.details_submitted,
    };
  };

  if (action === "status") {
    if (!row) return json({ connected: false });
    return json(await save(await getConnectAccount(row.stripe_account_id)));
  }

  if (action === "onboard") {
    const appUrl = Deno.env.get("APP_URL") ?? (origin && /^https?:\/\//.test(origin) ? origin : "");
    if (!appUrl) throw new HttpError(400, "Origem inválida.");
    let accountId = row?.stripe_account_id;
    if (!accountId) {
      const acct = await createConnectAccount({
        type: "express",
        country: "BR",
        email: user.email,
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        business_type: "individual",
        metadata: { professional_id: user.id },
      });
      accountId = acct.id;
      await save(acct);
    }
    const link = await createAccountLink({
      account: accountId,
      type: "account_onboarding",
      refresh_url: `${appUrl}/painel/membros?conexao=refazer`,
      return_url: `${appUrl}/painel/membros?conexao=ok`,
    });
    return json({ url: link.url });
  }

  throw new HttpError(400, "Ação inválida.");
});

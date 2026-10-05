// O membro cancela a própria assinatura: continua com acesso até o fim do período já pago.
// Entrada: { subscriptionId }.
import { HttpError, json, serve } from "../_shared/http.ts";
import { periodEnd, updateSubscription } from "../_shared/stripe.ts";
import { adminClient, requireUser } from "../_shared/supabase.ts";

serve(async (req) => {
  const user = await requireUser(req);
  const { subscriptionId } = (await req.json().catch(() => ({}))) as { subscriptionId?: string };
  if (!subscriptionId) throw new HttpError(400, "Assinatura não informada.");

  const db = adminClient();
  const { data: sub } = await db
    .from("member_subscriptions")
    .select("*")
    .eq("id", subscriptionId)
    .eq("member_id", user.id)
    .maybeSingle();
  if (!sub || !sub.stripe_subscription_id) throw new HttpError(404, "Assinatura não encontrada.");
  if (!["ativa", "inadimplente"].includes(sub.status)) {
    throw new HttpError(409, "Esta assinatura não pode ser cancelada.");
  }

  const stripeSub = await updateSubscription(sub.stripe_subscription_id, { cancel_at_period_end: true });
  await db
    .from("member_subscriptions")
    .update({ status: "cancelando", current_period_end: periodEnd(stripeSub) ?? sub.current_period_end })
    .eq("id", sub.id);
  return json({ ok: true });
});

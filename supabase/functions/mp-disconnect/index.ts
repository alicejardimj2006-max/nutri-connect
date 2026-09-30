// Desconecta a conta Mercado Pago do profissional (novas consultas deixam de exigir pagamento on-line).
import { json, serve } from "../_shared/http.ts";
import { adminClient, requireUser } from "../_shared/supabase.ts";

serve(async (req) => {
  const user = await requireUser(req);
  const db = adminClient();
  await db.from("professional_mp_accounts").delete().eq("professional_id", user.id);
  await db.from("professionals").update({ mp_connected: false }).eq("user_id", user.id);
  return json({ ok: true });
});

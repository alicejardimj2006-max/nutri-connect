// Inicia a conexão da conta Mercado Pago do profissional (OAuth de marketplace).
import { HttpError, env, json, serve } from "../_shared/http.ts";
import { authUrl, signState } from "../_shared/mp.ts";
import { adminClient, requireUser } from "../_shared/supabase.ts";

function callbackUrl() {
  return (
    Deno.env.get("MP_REDIRECT_URI") ?? `${env("SUPABASE_URL")}/functions/v1/mp-oauth-callback`
  );
}

serve(async (req) => {
  const user = await requireUser(req);
  const { data: pro } = await adminClient()
    .from("professionals")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!pro) throw new HttpError(403, "Apenas profissionais verificados podem receber pagamentos.");

  const { origin } = (await req.json().catch(() => ({}))) as { origin?: string };
  const returnTo = Deno.env.get("APP_URL") ?? (origin && /^https?:\/\//.test(origin) ? origin : "");
  if (!returnTo) throw new HttpError(400, "Origem inválida.");

  const params = new URLSearchParams({
    client_id: env("MP_CLIENT_ID"),
    response_type: "code",
    platform_id: "mp",
    state: await signState({ uid: user.id, returnTo }),
    redirect_uri: callbackUrl(),
  });
  return json({ url: `${authUrl()}?${params}` });
});

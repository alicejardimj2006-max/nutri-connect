// Retorno do OAuth do Mercado Pago: troca o código pelo token do profissional.
// Público (verify_jwt = false): a identidade vem do "state" assinado.
import { env, redirect, serve } from "../_shared/http.ts";
import { exchangeCode, saveAccount, verifyState } from "../_shared/mp.ts";

const callbackUrl = () =>
  Deno.env.get("MP_REDIRECT_URI") ?? `${env("SUPABASE_URL")}/functions/v1/mp-oauth-callback`;

serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") ?? "";
  let returnTo = Deno.env.get("APP_URL") ?? "";
  try {
    const { uid, returnTo: fromState } = await verifyState(state);
    returnTo = fromState || returnTo;
    if (!code) throw new Error(url.searchParams.get("error") ?? "sem código");
    await saveAccount(uid, await exchangeCode(code, callbackUrl()));
    return redirect(`${returnTo}/painel/configuracoes?mp=conectado`);
  } catch (err) {
    console.error("mp-oauth-callback", err);
    return redirect(`${returnTo}/painel/configuracoes?mp=erro`);
  }
});

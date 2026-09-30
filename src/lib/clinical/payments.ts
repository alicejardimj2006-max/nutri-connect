// Pagamentos online (Mercado Pago). Tudo que usa credenciais roda em Edge
// Functions: conexão da conta do profissional (OAuth), checkout e estornos.

import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { ct } from "./i18n";

/** Chama uma Edge Function e devolve a mensagem de erro do servidor, se houver. */
async function invoke<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });
  if (error) {
    let message = ct("errors.payment");
    if (error instanceof FunctionsHttpError) {
      const payload = await error.context.json().catch(() => null);
      if (payload?.error) message = payload.error;
    }
    throw new Error(message);
  }
  return data as T;
}

/** Cria (ou reaproveita) o checkout de uma consulta e devolve a URL de pagamento. */
export async function startCheckout(appointmentId: string): Promise<string> {
  const data = await invoke<{ checkoutUrl?: string }>("mp-checkout", {
    appointmentId,
    origin: window.location.origin,
  });
  if (!data?.checkoutUrl) throw new Error(ct("errors.checkout"));
  return data.checkoutUrl;
}

/** Leva o profissional à tela de autorização do Mercado Pago. */
export async function connectMercadoPago(): Promise<void> {
  const data = await invoke<{ url: string }>("mp-oauth-start", { origin: window.location.origin });
  window.location.href = data.url;
}

export async function disconnectMercadoPago(): Promise<void> {
  await invoke("mp-disconnect", {});
}

/** Pede o estorno de uma consulta cancelada (a Edge Function aplica a regra de prazo). */
export async function requestRefund(
  appointmentId: string,
): Promise<{ refunded: boolean; reason?: string; minHours?: number }> {
  return invoke("mp-refund", { appointmentId });
}

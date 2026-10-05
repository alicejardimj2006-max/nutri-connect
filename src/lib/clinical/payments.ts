// Pagamentos online (Stripe). Tudo que usa credenciais roda em Edge Functions:
// checkout, webhook e estornos.

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

/** Página do site onde o pagamento acontece (o formulário do Stripe fica embutido nela). */
export async function startCheckout(appointmentId: string): Promise<string> {
  return `/pagamento/${appointmentId}`;
}

/** Cria (ou reaproveita) a sessão de checkout e devolve o que o navegador precisa para montá-la. */
export async function createCheckoutSession(
  appointmentId: string,
): Promise<{ clientSecret: string; publishableKey: string }> {
  const data = await invoke<{ clientSecret?: string; publishableKey?: string }>("stripe-checkout", {
    appointmentId,
    origin: window.location.origin,
  });
  if (!data?.clientSecret || !data.publishableKey) throw new Error(ct("errors.checkout"));
  return { clientSecret: data.clientSecret, publishableKey: data.publishableKey };
}

/** Pede o estorno de uma consulta cancelada (a Edge Function aplica a regra de prazo). */
export async function requestRefund(
  appointmentId: string,
): Promise<{ refunded: boolean; reason?: string; minHours?: number }> {
  return invoke("stripe-refund", { appointmentId });
}

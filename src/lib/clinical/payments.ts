// Pagamentos online (Mercado Pago). A criação do checkout acontece numa Edge
// Function, que usa o token OAuth do profissional e aplica a taxa da plataforma.

import { supabase } from "@/integrations/supabase/client";
import { ct } from "./i18n";

/** Cria (ou reaproveita) o checkout de uma consulta e devolve a URL de pagamento. */
export async function startCheckout(appointmentId: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ checkoutUrl: string }>("mp-checkout", {
    body: { appointmentId, origin: window.location.origin },
  });
  if (error || !data?.checkoutUrl) {
    throw new Error(ct("errors.checkout"));
  }
  return data.checkoutUrl;
}

// Cliente mínimo da API do Stripe (fetch puro, sem SDK) para o runtime de
// servidor do app. A conta usada é a da plataforma: o pagamento cai nela e o
// repasse ao profissional é feito fora do app (a taxa fica registrada em
// payments.platform_fee_cents).

const API = "https://api.stripe.com/v1";

function stripeKey(): string {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) throw new Error("Configuração ausente: STRIPE_SECRET_KEY");
  return key;
}

/** Codifica params no formato form-urlencoded aninhado que o Stripe espera. */
function encode(params: Record<string, unknown>, prefix = ""): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    const name = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => parts.push(encode(item as Record<string, unknown>, `${name}[${i}]`)));
    } else if (typeof v === "object") {
      parts.push(encode(v as Record<string, unknown>, name));
    } else {
      parts.push(`${encodeURIComponent(name)}=${encodeURIComponent(String(v))}`);
    }
  }
  return parts.filter(Boolean).join("&");
}

async function call<T>(method: string, path: string, params?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${stripeKey()}`,
      ...(params ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: params ? encode(params) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: { message?: string } };
  if (!res.ok) {
    console.error("[stripe]", res.status, data?.error?.message);
    throw new Error("Falha ao falar com o Stripe. Tente novamente.");
  }
  return data;
}

export interface StripeSession {
  id: string;
  url?: string | null;
  payment_intent?: string | null;
  payment_status?: string;
  amount_total?: number | null;
  metadata?: Record<string, string>;
}

export function createCheckoutSession(params: Record<string, unknown>): Promise<StripeSession> {
  return call<StripeSession>("POST", "/checkout/sessions", params);
}

export function createRefund(paymentIntent: string): Promise<{ id: string; status?: string }> {
  return call("POST", "/refunds", { payment_intent: paymentIntent });
}

/** Verifica a assinatura Stripe-Signature do webhook (HMAC-SHA256). */
export async function verifyWebhookSignature(
  signatureHeader: string | null,
  rawBody: string,
): Promise<boolean> {
  const secret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!secret || !signatureHeader) return false;
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((kv) => kv.split("=") as [string, string]),
  );
  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;

  // Rejeita eventos com mais de 5 minutos (proteção contra replay).
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const keyData = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign(
    "HMAC",
    keyData,
    new TextEncoder().encode(`${timestamp}.${rawBody}`),
  );
  const expected = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expected === signature;
}

// Cliente mínimo da API do Stripe (fetch puro, sem SDK) para as Edge Functions.
// A conta usada é a da plataforma: o pagamento cai nela e o repasse ao
// profissional é feito fora do app (a taxa da plataforma fica registrada em
// payments.platform_fee_cents).
import { HttpError, env } from "./http.ts";

const API = "https://api.stripe.com/v1";

function key(): string {
  return env("STRIPE_SECRET_KEY");
}

async function call<T>(method: string, path: string, params?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key()}`,
      ...(params ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: params ? encode(params) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: { message?: string } };
  if (!res.ok) {
    throw new HttpError(502, data?.error?.message ?? "Falha ao falar com o Stripe.");
  }
  return data;
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

export interface StripeSession {
  id: string;
  url?: string;
  payment_intent?: string;
  payment_status?: string;
  metadata?: Record<string, string>;
  amount_total?: number;
}

export function createCheckoutSession(params: Record<string, unknown>): Promise<StripeSession> {
  return call<StripeSession>("POST", "/checkout/sessions", params);
}

export function getSession(id: string): Promise<StripeSession> {
  return call<StripeSession>("GET", `/checkout/sessions/${id}`);
}

export function createRefund(paymentIntent: string): Promise<{ id: string; status?: string }> {
  return call("POST", "/refunds", { payment_intent: paymentIntent });
}

/** Verifica a assinatura Stripe-Signature do webhook (HMAC-SHA256). */
export async function verifyWebhookSignature(req: Request, rawBody: string): Promise<boolean> {
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secret) return false;
  const header = req.headers.get("Stripe-Signature") ?? "";
  const parts = Object.fromEntries(
    header.split(",").map((kv) => kv.split("=") as [string, string]),
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

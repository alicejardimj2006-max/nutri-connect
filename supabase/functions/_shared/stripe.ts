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
      v.forEach((item, i) =>
        parts.push(
          item !== null && typeof item === "object"
            ? encode(item as Record<string, unknown>, `${name}[${i}]`)
            : `${encodeURIComponent(`${name}[${i}]`)}=${encodeURIComponent(String(item))}`,
        ),
      );
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
  client_secret?: string;
  status?: string;
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

/** Encerra uma sessão de checkout ainda aberta (o cliente não consegue mais pagar por ela). */
export function expireSession(id: string): Promise<StripeSession> {
  return call<StripeSession>("POST", `/checkout/sessions/${id}/expire`, {});
}

export function createRefund(paymentIntent: string): Promise<{ id: string; status?: string }> {
  return call("POST", "/refunds", { payment_intent: paymentIntent });
}

// ── Stripe Connect e assinaturas (perfil de membros) ────────────────────────

export interface StripeAccount {
  id: string;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
}

/** Conta Express do profissional: ele cadastra os dados e o Stripe repassa a parte dele. */
export function createConnectAccount(params: Record<string, unknown>): Promise<StripeAccount> {
  return call<StripeAccount>("POST", "/accounts", params);
}

export function getConnectAccount(id: string): Promise<StripeAccount> {
  return call<StripeAccount>("GET", `/accounts/${id}`);
}

export function createAccountLink(params: Record<string, unknown>): Promise<{ url: string }> {
  return call<{ url: string }>("POST", "/account_links", params);
}

export interface StripeSubscription {
  id: string;
  status?: string;
  customer?: string;
  cancel_at_period_end?: boolean;
  current_period_end?: number;
  items?: { data?: { current_period_end?: number; price?: { unit_amount?: number } }[] };
  metadata?: Record<string, string>;
}

export function getSubscription(id: string): Promise<StripeSubscription> {
  return call<StripeSubscription>("GET", `/subscriptions/${id}`);
}

export function updateSubscription(
  id: string,
  params: Record<string, unknown>,
): Promise<StripeSubscription> {
  return call<StripeSubscription>("POST", `/subscriptions/${id}`, params);
}

/** Fim do período corrente de uma assinatura (o campo mudou de lugar entre versões da API). */
export function periodEnd(sub: StripeSubscription): string | null {
  const ts = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end;
  return ts ? new Date(ts * 1000).toISOString() : null;
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

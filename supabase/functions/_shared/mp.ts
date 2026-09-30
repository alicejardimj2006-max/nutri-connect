// Cliente mínimo da API do Mercado Pago (Checkout Pro + OAuth de marketplace).
// Docs: https://www.mercadopago.com.br/developers/pt/docs/split-payments
//
// Variáveis de ambiente:
//   MP_CLIENT_ID, MP_CLIENT_SECRET  — credenciais da aplicação (marketplace)
//   MP_WEBHOOK_SECRET               — assinatura secreta das notificações (recomendado)
//   MP_API_BASE                     — opcional; padrão https://api.mercadopago.com
//   MP_AUTH_URL                     — opcional; padrão https://auth.mercadopago.com.br/authorization
//   APP_URL                         — URL pública do site (retorno do OAuth)

import { HttpError, env } from "./http.ts";
import { adminClient } from "./supabase.ts";

const apiBase = () => Deno.env.get("MP_API_BASE") ?? "https://api.mercadopago.com";
export const authUrl = () =>
  Deno.env.get("MP_AUTH_URL") ?? "https://auth.mercadopago.com.br/authorization";

async function mpFetch<T>(path: string, token: string | null, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) {
    console.error("Mercado Pago", res.status, path, text.slice(0, 500));
    throw new HttpError(502, body?.message ?? `Mercado Pago respondeu ${res.status}`);
  }
  return body as T;
}

// ---------------------------------------------------------------------------
// OAuth
// ---------------------------------------------------------------------------

export interface OAuthToken {
  access_token: string;
  refresh_token?: string;
  public_key?: string;
  user_id: number | string;
  expires_in?: number;
  live_mode?: boolean;
}

export function exchangeCode(code: string, redirectUri: string) {
  return mpFetch<OAuthToken>("/oauth/token", null, {
    method: "POST",
    body: JSON.stringify({
      client_id: env("MP_CLIENT_ID"),
      client_secret: env("MP_CLIENT_SECRET"),
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });
}

function refreshToken(refresh: string) {
  return mpFetch<OAuthToken>("/oauth/token", null, {
    method: "POST",
    body: JSON.stringify({
      client_id: env("MP_CLIENT_ID"),
      client_secret: env("MP_CLIENT_SECRET"),
      grant_type: "refresh_token",
      refresh_token: refresh,
    }),
  });
}

export async function saveAccount(professionalId: string, token: OAuthToken) {
  const db = adminClient();
  const { error } = await db.from("professional_mp_accounts").upsert({
    professional_id: professionalId,
    mp_user_id: String(token.user_id),
    access_token: token.access_token,
    refresh_token: token.refresh_token ?? null,
    public_key: token.public_key ?? null,
    live_mode: !!token.live_mode,
    expires_at: token.expires_in ? new Date(Date.now() + token.expires_in * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new HttpError(500, error.message);
  await db.from("professionals").update({ mp_connected: true }).eq("user_id", professionalId);
}

/** Token de acesso válido do profissional (renova se estiver perto de expirar). */
export async function sellerToken(professionalId: string): Promise<string> {
  const { data } = await adminClient()
    .from("professional_mp_accounts")
    .select("*")
    .eq("professional_id", professionalId)
    .maybeSingle();
  if (!data) throw new HttpError(409, "O profissional não conectou o Mercado Pago.");
  const expiring = data.expires_at && new Date(data.expires_at).getTime() < Date.now() + 86_400_000;
  if (expiring && data.refresh_token) {
    const fresh = await refreshToken(data.refresh_token);
    await saveAccount(professionalId, fresh);
    return fresh.access_token;
  }
  return data.access_token;
}

// ---------------------------------------------------------------------------
// Estado do OAuth assinado (liga o retorno ao profissional que iniciou)
// ---------------------------------------------------------------------------

const enc = new TextEncoder();
const b64url = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

async function hmac(secret: string, message: string): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", key, enc.encode(message));
}

const stateSecret = () => Deno.env.get("MP_STATE_SECRET") ?? env("SUPABASE_SERVICE_ROLE_KEY");

export async function signState(payload: { uid: string; returnTo: string }): Promise<string> {
  const body = b64url(enc.encode(JSON.stringify({ ...payload, exp: Date.now() + 15 * 60_000 })));
  return `${body}.${b64url(await hmac(stateSecret(), body))}`;
}

export async function verifyState(state: string): Promise<{ uid: string; returnTo: string }> {
  const [body, sig] = state.split(".");
  if (!body || !sig || b64url(await hmac(stateSecret(), body)) !== sig) {
    throw new HttpError(400, "Estado inválido.");
  }
  const json = JSON.parse(atob(body.replace(/-/g, "+").replace(/_/g, "/")));
  if (json.exp < Date.now()) throw new HttpError(400, "A conexão expirou. Tente de novo.");
  return json;
}

// ---------------------------------------------------------------------------
// Checkout, pagamentos e estornos
// ---------------------------------------------------------------------------

export interface Preference {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
}

export function createPreference(token: string, body: Record<string, unknown>) {
  return mpFetch<Preference>("/checkout/preferences", token, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export interface MpPayment {
  id: number | string;
  status: string;
  status_detail?: string;
  external_reference?: string;
  transaction_amount?: number;
  payment_type_id?: string;
  payment_method_id?: string;
  date_approved?: string | null;
}

export function getPayment(token: string, id: string) {
  return mpFetch<MpPayment>(`/v1/payments/${id}`, token);
}

export function refundPayment(token: string, id: string) {
  return mpFetch<{ id: number | string; status: string }>(`/v1/payments/${id}/refunds`, token, {
    method: "POST",
    headers: { "X-Idempotency-Key": `refund-${id}` },
    body: "{}",
  });
}

/** Status do Mercado Pago → status interno do pagamento. */
export function mapStatus(status: string) {
  switch (status) {
    case "approved":
      return "aprovado";
    case "pending":
    case "in_process":
    case "authorized":
      return "em_processamento";
    case "rejected":
      return "recusado";
    case "refunded":
    case "charged_back":
      return "reembolsado";
    case "cancelled":
      return "cancelado";
    default:
      return "pendente";
  }
}

/**
 * Valida o cabeçalho x-signature das notificações (quando MP_WEBHOOK_SECRET existe).
 * Manifesto: "id:{data.id};request-id:{x-request-id};ts:{ts};"
 */
export async function verifyWebhook(req: Request, dataId: string): Promise<boolean> {
  const secret = Deno.env.get("MP_WEBHOOK_SECRET");
  if (!secret) {
    console.warn("MP_WEBHOOK_SECRET não configurado: assinatura do webhook não verificada.");
    return true;
  }
  const header = req.headers.get("x-signature") ?? "";
  const requestId = req.headers.get("x-request-id") ?? "";
  const parts = Object.fromEntries(header.split(",").map((p) => p.trim().split("=") as [string, string]));
  if (!parts.ts || !parts.v1) return false;
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const digest = Array.from(new Uint8Array(await hmac(secret, manifest)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return digest === parts.v1;
}

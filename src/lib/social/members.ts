// Perfil de membros: plano pago de um profissional, assinaturas, conteúdo exclusivo e ganhos.
// Regras, divisão e acesso ficam no banco (migração 20261005160000_member_profiles.sql) e no
// Stripe (Edge Functions member-*); aqui só lemos e chamamos.

import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface MemberPlan {
  professionalId: string;
  title: string;
  description: string;
  priceCents: number;
  discountPercent: number;
  benefits: string[];
  /** Oferta disponível para assinar (ativa e com o nível ainda liberado). */
  active: boolean;
  contentCount: number;
  /** A pessoa logada é membro. */
  isMember: boolean;
  /** Só o dono e a administração veem a taxa da plataforma e o estado da conta de recebimento. */
  feePercent?: number;
  chargesEnabled?: boolean;
}

export interface MemberContent {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  createdAt: string;
}

export interface MySubscription {
  id: string;
  professionalId: string;
  professionalName: string;
  status: string;
  priceCents: number;
  currentPeriodEnd?: string;
  createdAt: string;
}

export interface Subscriber {
  id: string;
  memberId: string;
  name: string;
  username: string;
  avatarUrl?: string;
  status: string;
  priceCents: number;
  currentPeriodEnd?: string;
  createdAt: string;
}

export interface Earnings {
  grossCents: number;
  feeCents: number;
  netCents: number;
  invoices: number;
}

export interface ConnectStatus {
  connected: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
}

export interface PlanInput {
  title: string;
  description: string;
  priceCents: number;
  discountPercent: number;
  benefits: string[];
  active: boolean;
}

function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

async function invoke<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });
  if (error) {
    let message = "Não foi possível concluir agora. Tente de novo em instantes.";
    if (error instanceof FunctionsHttpError) {
      const payload = await error.context.json().catch(() => null);
      if (payload?.error) message = payload.error;
    }
    throw new Error(message);
  }
  return data as T;
}

export async function fetchMemberPlan(professionalId: string): Promise<MemberPlan | null> {
  const { data, error } = await supabase.rpc("get_member_plan", { p_pro: professionalId });
  fail(error);
  const row = data?.[0];
  if (!row) return null;
  return {
    professionalId: row.professional_id,
    title: row.title,
    description: row.description,
    priceCents: row.price_cents,
    discountPercent: row.consult_discount_percent,
    benefits: row.benefits,
    active: row.active,
    contentCount: row.content_count,
    isMember: row.is_member,
    feePercent: row.fee_percent ?? undefined,
    chargesEnabled: row.charges_enabled ?? undefined,
  };
}

export async function saveMemberPlan(input: PlanInput): Promise<void> {
  const { error } = await supabase.rpc("save_member_plan", {
    p_title: input.title,
    p_description: input.description,
    p_price_cents: input.priceCents,
    p_discount: input.discountPercent,
    p_benefits: input.benefits,
    p_active: input.active,
  });
  fail(error);
}

/** Conteúdo exclusivo: o banco só devolve a quem é o dono, membro ou administração. */
export async function fetchMemberContent(professionalId: string): Promise<MemberContent[]> {
  const { data, error } = await supabase
    .from("member_content")
    .select("id, title, body, image_url, created_at")
    .eq("professional_id", professionalId)
    .order("created_at", { ascending: false })
    .limit(50);
  fail(error);
  return (data ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    body: c.body,
    imageUrl: c.image_url ?? undefined,
    createdAt: c.created_at,
  }));
}

export async function publishMemberContent(input: { title: string; body: string }): Promise<void> {
  const { error } = await supabase.rpc("publish_member_content", {
    p_title: input.title,
    p_body: input.body,
  });
  fail(error);
}

export async function deleteMemberContent(id: string): Promise<void> {
  const { error } = await supabase.from("member_content").delete().eq("id", id);
  fail(error);
}

export async function fetchMySubscriptions(): Promise<MySubscription[]> {
  const { data, error } = await supabase.rpc("my_member_subscriptions");
  fail(error);
  return (data ?? []).map((s) => ({
    id: s.id,
    professionalId: s.professional_id,
    professionalName: s.professional_name,
    status: s.status,
    priceCents: s.price_cents,
    currentPeriodEnd: s.current_period_end ?? undefined,
    createdAt: s.created_at,
  }));
}

export async function fetchSubscribers(): Promise<Subscriber[]> {
  const { data, error } = await supabase.rpc("my_subscribers");
  fail(error);
  return (data ?? []).map((s) => ({
    id: s.id,
    memberId: s.member_id,
    name: s.name,
    username: s.username,
    avatarUrl: s.avatar_url ?? undefined,
    status: s.status,
    priceCents: s.price_cents,
    currentPeriodEnd: s.current_period_end ?? undefined,
    createdAt: s.created_at,
  }));
}

export async function fetchEarnings(days = 30): Promise<Earnings> {
  const { data, error } = await supabase.rpc("my_member_earnings", { p_days: days });
  fail(error);
  const row = data?.[0];
  return {
    grossCents: Number(row?.gross_cents ?? 0),
    feeCents: Number(row?.fee_cents ?? 0),
    netCents: Number(row?.net_cents ?? 0),
    invoices: Number(row?.invoices ?? 0),
  };
}

// ── Stripe (Edge Functions) ──────────────────────────────────────────────────

export function connectStatus(): Promise<ConnectStatus> {
  return invoke<ConnectStatus>("member-connect", { action: "status" });
}

export async function startConnectOnboarding(): Promise<string> {
  const data = await invoke<{ url?: string }>("member-connect", {
    action: "onboard",
    origin: window.location.origin,
  });
  if (!data?.url) throw new Error("O Stripe não devolveu o link de cadastro.");
  return data.url;
}

export async function createMemberCheckout(
  professionalId: string,
): Promise<{ clientSecret: string; publishableKey: string }> {
  const data = await invoke<{ clientSecret?: string; publishableKey?: string }>("member-checkout", {
    professionalId,
    origin: window.location.origin,
  });
  if (!data?.clientSecret || !data.publishableKey) {
    throw new Error("Não foi possível abrir o pagamento.");
  }
  return { clientSecret: data.clientSecret, publishableKey: data.publishableKey };
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await invoke("member-cancel", { subscriptionId });
}

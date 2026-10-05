// Acesso ao banco para o console de administração. Todas as funções (RPC) conferem, dentro do banco,
// que quem chama é administrador da plataforma; aqui só chamamos e tratamos o erro.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type RpcClient = {
  rpc: (
    name: string,
    args?: Record<string, unknown>,
  ) => PromiseLike<{
    data: unknown;
    error: { message: string; code?: string } | null;
  }>;
};

/** O banco ainda não tem as funções do painel (falta aplicar a migration). */
export class AdminSetupError extends Error {
  constructor() {
    super("As funções do painel ainda não foram instaladas no banco.");
    this.name = "AdminSetupError";
  }
}

export async function adminRpc<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await (supabase as unknown as RpcClient).rpc(name, args);
  if (error) {
    // 42883 = função inexistente; PGRST202 = a API não conhece a função.
    if (
      error.code === "42883" ||
      error.code === "PGRST202" ||
      /could not find the function/i.test(error.message)
    ) {
      throw new AdminSetupError();
    }
    throw new Error(error.message);
  }
  return data as T;
}

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface SeriesPoint {
  day: string;
  n: number;
}

export interface Overview {
  users_total: number;
  users_7d: number;
  users_30d: number;
  pros: number;
  admins: number;
  suspended: number;
  posts_total: number;
  posts_today: number;
  posts_7d: number;
  posts_hidden: number;
  comments_7d: number;
  reports_pending: number;
  reports_ai_pending: number;
  verifications_pending: number;
  communities_total: number;
  communities_attention: number;
  appointments_7d: number;
  appointments_upcoming: number;
  paid_cents: number;
  fees_cents: number;
  refunded_cents: number;
  contact_new: number;
  nina_today: number;
  summary_today: number;
  moderation_today: number;
  signups: SeriesPoint[];
  posts_series: SeriesPoint[];
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string | null;
  role: "paciente" | "profissional";
  is_admin: boolean;
  verified: boolean;
  suspended_at: string | null;
  created_at: string;
  posts_count: number;
  reports_pending: number;
  total: number;
}

export interface AdminPost {
  id: string;
  author_id: string;
  author_name: string;
  author_username: string;
  type: "receita" | "experiencia" | "pergunta" | "geral";
  title: string | null;
  body: string;
  image_url: string | null;
  hidden: boolean;
  pinned: boolean;
  created_at: string;
  reports_pending: number;
  reactions: number;
  comments: number;
  total: number;
}

export interface AdminPayment {
  id: string;
  patient_name: string;
  professional_name: string;
  amount_cents: number;
  platform_fee_cents: number;
  status: "pendente" | "em_processamento" | "aprovado" | "recusado" | "reembolsado" | "cancelado";
  provider: string;
  method: string | null;
  created_at: string;
  paid_at: string | null;
  refunded_at: string | null;
  total: number;
}

export interface AiStats {
  by_day: { day: string; nina: number; summary: number; moderation: number }[];
  users_today: number;
  top_today: { name: string; count: number }[];
  flagged_total: number;
  flagged_pending: number;
  upheld: number;
  overturned: number;
  nina_messages: number;
}

export interface AuditEntry {
  id: string;
  admin_id: string | null;
  admin_name: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  level: "info" | "aviso" | "sucesso";
  link_url: string | null;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export interface ThemeRow {
  id: string;
  week_start: string;
  status: "previa" | "ativo" | "encerrado";
  title: string;
  subtitle: string | null;
  description: string;
  badge: string | null;
  question: string | null;
  poll_question: string | null;
  source: string;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "novo" | "em_atendimento" | "resolvido";
  created_at: string;
}

// ── Consultas ────────────────────────────────────────────────────────────────

const key = (...parts: unknown[]) => ["admin", ...parts] as const;

export function useOverview() {
  return useQuery({
    queryKey: key("overview"),
    queryFn: () => adminRpc<Overview>("admin_overview"),
    staleTime: 30_000,
    retry: false,
  });
}

export function useAdminUsers(params: {
  query: string;
  filter: string;
  offset: number;
  limit: number;
}) {
  return useQuery({
    queryKey: key("users", params),
    queryFn: () =>
      adminRpc<AdminUser[]>("admin_search_users", {
        p_query: params.query,
        p_filter: params.filter,
        p_limit: params.limit,
        p_offset: params.offset,
      }),
    placeholderData: (prev) => prev,
    retry: false,
  });
}

export function useAdminPosts(params: {
  query: string;
  status: string;
  offset: number;
  limit: number;
}) {
  return useQuery({
    queryKey: key("posts", params),
    queryFn: () =>
      adminRpc<AdminPost[]>("admin_search_posts", {
        p_query: params.query,
        p_status: params.status,
        p_limit: params.limit,
        p_offset: params.offset,
      }),
    placeholderData: (prev) => prev,
    retry: false,
  });
}

export function useAdminPayments(params: { status: string; offset: number; limit: number }) {
  return useQuery({
    queryKey: key("payments", params),
    queryFn: () =>
      adminRpc<AdminPayment[]>("admin_payments", {
        p_status: params.status,
        p_limit: params.limit,
        p_offset: params.offset,
      }),
    placeholderData: (prev) => prev,
    retry: false,
  });
}

export function useAiStats(days: number) {
  return useQuery({
    queryKey: key("ai", days),
    queryFn: () => adminRpc<AiStats>("admin_ai_stats", { p_days: days }),
    retry: false,
  });
}

export function useAuditLog() {
  return useQuery({
    queryKey: key("audit"),
    retry: false,
    queryFn: async () => {
      const res = await supabase
        .from("admin_audit_log" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);
      if (res.error) throw new Error(res.error.message);
      return (res.data ?? []) as unknown as AuditEntry[];
    },
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: key("announcements"),
    retry: false,
    queryFn: async () => {
      const res = await supabase
        .from("announcements" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (res.error) throw new Error(res.error.message);
      return (res.data ?? []) as unknown as Announcement[];
    },
  });
}

export function useThemes() {
  return useQuery({
    queryKey: key("themes"),
    queryFn: async () => {
      const res = await supabase
        .from("weekly_themes")
        .select("*")
        .order("week_start", { ascending: false })
        .limit(40);
      if (res.error) throw new Error(res.error.message);
      return (res.data ?? []) as unknown as ThemeRow[];
    },
  });
}

export function useContactMessages() {
  return useQuery({
    queryKey: key("contact"),
    queryFn: async () => {
      const res = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(150);
      if (res.error) throw new Error(res.error.message);
      return (res.data ?? []) as unknown as ContactMessage[];
    },
  });
}

export function useSettings() {
  return useQuery({
    queryKey: key("settings"),
    queryFn: async () => {
      const res = await supabase.from("platform_settings").select("key, value");
      if (res.error) throw new Error(res.error.message);
      const out: Record<string, number> = {};
      for (const row of res.data ?? []) out[row.key] = Number(row.value);
      return out;
    },
  });
}

// ── Ações ────────────────────────────────────────────────────────────────────

/** Executa uma ação do painel, mostra o resultado e atualiza tudo que depende dela. */
export function useAdminAction<TVars>(fn: (vars: TVars) => Promise<unknown>, success?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin"] });
      if (success) toast.success(success);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : String(err)),
  });
}

export const adminActions = {
  setSuspended: (p: { user: string; suspend: boolean; reason: string }) =>
    adminRpc("admin_set_suspended", { p_user: p.user, p_suspend: p.suspend, p_reason: p.reason }),
  setAdmin: (p: { user: string; make: boolean }) =>
    adminRpc("admin_set_admin", { p_user: p.user, p_make: p.make }),
  postHidden: (p: { post: string; hidden: boolean }) =>
    adminRpc("admin_set_post_hidden", { p_post: p.post, p_hidden: p.hidden }),
  postPinned: (p: { post: string; pinned: boolean }) =>
    adminRpc("admin_set_post_pinned", { p_post: p.post, p_pinned: p.pinned }),
  deletePost: (post: string) => adminRpc("admin_delete_post", { p_post: post }),
  setSetting: (p: { key: string; value: number }) =>
    adminRpc("admin_set_setting", { p_key: p.key, p_value: p.value }),
  saveAnnouncement: (a: Partial<Announcement> & { title: string }) =>
    adminRpc<string>("admin_save_announcement", {
      p_id: a.id ?? null,
      p_title: a.title,
      p_body: a.body ?? "",
      p_level: a.level ?? "info",
      p_link: a.link_url ?? "",
      p_active: a.active ?? true,
      p_starts: a.starts_at ?? null,
      p_ends: a.ends_at ?? null,
    }),
  deleteAnnouncement: (id: string) => adminRpc("admin_delete_announcement", { p_id: id }),
  log: (action: string, type: string, id: string, details: Record<string, unknown> = {}) =>
    adminRpc("admin_log", { p_action: action, p_type: type, p_id: id, p_details: details }),
};

// ── Utilidades ───────────────────────────────────────────────────────────────

export const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((cents || 0) / 100);

/** Baixa uma lista como planilha (CSV com ; e BOM, abre direto no Excel em português). */
export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    toast.info("Não há dados para exportar.");
    return;
  }
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s =
      v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [cols.join(";"), ...rows.map((r) => cols.map((c) => esc(r[c])).join(";"))].join(
    "\r\n",
  );
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

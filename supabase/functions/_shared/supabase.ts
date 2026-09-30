import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { HttpError, env } from "./http.ts";

/** Cliente com service_role: ignora RLS. Use só depois de validar quem chama. */
export function adminClient(): SupabaseClient {
  return createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Usuário autenticado a partir do header Authorization (JWT do Supabase Auth). */
export async function requireUser(req: Request): Promise<{ id: string; email?: string }> {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) throw new HttpError(401, "É preciso estar logado.");
  const { data, error } = await adminClient().auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, "Sessão inválida. Entre novamente.");
  return { id: data.user.id, email: data.user.email ?? undefined };
}

export async function settingInt(key: string, fallback: number): Promise<number> {
  const { data } = await adminClient()
    .from("platform_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  const n = Number(data?.value);
  return Number.isFinite(n) ? n : fallback;
}

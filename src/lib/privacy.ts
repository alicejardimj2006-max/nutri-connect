import { supabase } from "@/integrations/supabase/client";

export type PrivacyProfileVisibility = "public" | "private" | "friends";
export type PrivacyDiscoverability = "everyone" | "contacts_only" | "nobody";
export type PrivacyMessageAllowance = "everyone" | "friends" | "nobody";

export interface PrivacySettings {
  user_id: string;
  profile_visibility: PrivacyProfileVisibility;
  discoverability: PrivacyDiscoverability;
  message_allowance: PrivacyMessageAllowance;
  show_location: boolean;
  use_location_for_features: boolean;
}

export type PrivacyRequestType =
  "access" | "correction" | "portability" | "deletion" | "consent_revoke" | "information" | "other";

export interface PrivacyRequest {
  id: string;
  user_id: string;
  type: PrivacyRequestType;
  status: "submitted" | "received" | "in_review" | "completed" | "rejected" | "cancelled";
  created_at: string;
}

const defaultSettings: PrivacySettings = {
  user_id: "",
  profile_visibility: "public",
  discoverability: "everyone",
  message_allowance: "everyone",
  show_location: false,
  use_location_for_features: true,
};

export async function getPrivacySettings(): Promise<PrivacySettings | null> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError) throw new Error("Erro ao obter sessão: " + sessionError.message);
  if (!session) return null;

  const { data, error } = await supabase
    .from("privacy_settings")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Record not found: attempt to create it securely
      const { data: inserted, error: insertError } = await supabase
        .from("privacy_settings")
        .insert({ ...defaultSettings, user_id: session.user.id })
        .select()
        .single();

      if (insertError)
        throw new Error(
          "Falha ao criar configurações de privacidade padrão: " + insertError.message,
        );
      return inserted as PrivacySettings;
    }

    // Bubble up other DB errors, network errors or permission errors
    throw new Error("Erro ao carregar configurações de privacidade: " + error.message);
  }

  return data as PrivacySettings;
}

export async function updatePrivacySettings(updates: Partial<Omit<PrivacySettings, "user_id">>) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Não autenticado");

  // Use upsert to guarantee a row exists when updating
  const { error } = await supabase.from("privacy_settings").upsert(
    {
      user_id: session.user.id,
      ...updates,
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) throw new Error("Erro ao atualizar configurações: " + error.message);
}

export async function requestDataExport() {
  await submitPrivacyRequest("portability");
}

export async function requestAccountDeletion() {
  await submitPrivacyRequest("deletion");
  await supabase.auth.signOut();
}

export async function getPrivacyRequests(): Promise<PrivacyRequest[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from("privacy_requests")
    .select("id, user_id, type, status, created_at")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Erro ao consultar solicitações: " + error.message);
  return (data as PrivacyRequest[]) || [];
}

export async function submitPrivacyRequest(type: PrivacyRequestType) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Não autenticado");

  const { error } = await supabase.from("privacy_requests").insert({
    user_id: session.user.id,
    type,
    // explicitly NOT sending administrative fields (status, internal_notes, etc)
  });

  if (error) throw new Error("Falha ao registrar solicitação: " + error.message);
}

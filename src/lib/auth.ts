import { t } from "./i18n";
import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";
import { syncCommunityWithRemote } from "./profile-sync";
import type { ProfessionalInfo, ProfileRole } from "./community";

// Autenticação via Supabase Auth. O usuário logado (perfil + dados privados)
// fica num cache em memória para que getUser() continue síncrono; mudanças
// disparam o evento "auth-change", que o hook useAuth escuta.

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  sex?: "feminino" | "masculino";
  bio?: string;
  goal?: string;
  journeyGoal?: string;
  avatarUrl?: string;
  role: ProfileRole;
  isAdmin: boolean;
  /** Presente quando o perfil profissional foi verificado. */
  professional?: ProfessionalInfo;
}

export const AUTH_EVENT = "auth-change";

let currentUser: AuthUser | null = null;
let ready = false;
let initPromise: Promise<void> | null = null;

function emit() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_EVENT));
}

export function getUser(): AuthUser | null {
  return currentUser;
}

/** true depois que a sessão inicial foi verificada (logado ou não). */
export function isAuthReady(): boolean {
  return ready;
}

async function fetchAuthUser(id: string, email: string): Promise<AuthUser | null> {
  const [profile, priv, admin, pro] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
    supabase.from("profile_private").select("*").eq("id", id).maybeSingle(),
    supabase.from("platform_admins").select("user_id").eq("user_id", id).maybeSingle(),
    supabase.from("professionals").select("*").eq("user_id", id).maybeSingle(),
  ]);
  if (!profile.data) return null;
  const p = profile.data;
  const v = priv.data;
  return {
    id,
    email: v?.email ?? email,
    name: p.name,
    bio: p.bio || undefined,
    goal: p.goal ?? undefined,
    journeyGoal: p.journey_goal ?? p.goal ?? undefined,
    avatarUrl: p.avatar_url ?? undefined,
    phone: v?.phone ?? undefined,
    cpf: v?.cpf ?? undefined,
    birthDate: v?.birth_date ?? undefined,
    sex: (v?.sex as AuthUser["sex"]) ?? undefined,
    role: p.role,
    isAdmin: !!admin.data,
    professional: pro.data
      ? {
          profession: pro.data.profession,
          council: pro.data.council,
          registration: pro.data.registration,
          uf: pro.data.uf,
          specialties: pro.data.specialties,
          verifiedAt: pro.data.verified_at,
        }
      : undefined,
  };
}

async function loadSessionUser() {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  currentUser = session?.user
    ? await fetchAuthUser(session.user.id, session.user.email ?? "")
    : null;
}

/** Carrega a sessão uma única vez e passa a acompanhar login/logout. */
export function initAuth(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      await loadSessionUser();
    } catch (err) {
      console.error("[auth] falha ao carregar sessão", err);
      currentUser = null;
    }
    ready = true;
    emit();
    void syncCommunityWithRemote();
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") return;
      // Não usar await dentro do callback (trava o cliente do Supabase).
      setTimeout(async () => {
        currentUser = session?.user
          ? await fetchAuthUser(session.user.id, session.user.email ?? "")
          : null;
        emit();
        void syncCommunityWithRemote(true);
      }, 0);
    });
  })();
  return initPromise;
}

/** Recarrega o usuário do banco (após editar perfil, virar profissional etc.). */
export async function refreshUser(): Promise<AuthUser | null> {
  await loadSessionUser();
  emit();
  return currentUser;
}

function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return t("err.invalidCredentials");
  if (m.includes("already registered") || m.includes("already been registered"))
    return t("err.emailTaken");
  if (m.includes("email not confirmed")) return t("err.emailNotConfirmed");
  if (m.includes("password")) return t("err.weakPassword");
  return message;
}

export async function registerUser(data: {
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  password?: string;
  goal?: string;
  journeyGoal?: string;
}): Promise<{ user: AuthUser | null; needsConfirmation: boolean }> {
  const { data: res, error } = await supabase.auth.signUp({
    email: data.email.toLowerCase().trim(),
    password: data.password ?? "",
    options: {
      emailRedirectTo: typeof window !== "undefined" ? `${location.origin}/espaco` : undefined,
      data: {
        name: data.name.trim(),
        phone: data.phone?.trim() || "",
        cpf: data.cpf?.trim() || "",
        birth_date: data.birthDate || "",
        goal: data.goal || "Comer melhor e com prazer",
        journey_goal: data.journeyGoal || data.goal || "Comer melhor e com prazer",
      },
    },
  });
  if (error) throw new Error(translateAuthError(error.message));
  // Com confirmação de e-mail ligada, o Supabase devolve usuário sem sessão
  // (e, se o e-mail já existe, um usuário sem identidades).
  if (res.user && res.user.identities?.length === 0) throw new Error(t("err.emailTaken"));
  if (!res.session) return { user: null, needsConfirmation: true };
  await refreshUser();
  return { user: currentUser, needsConfirmation: false };
}

export async function loginUser(email: string, password?: string): Promise<AuthUser> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password: password ?? "",
  });
  if (error) throw new Error(translateAuthError(error.message));
  const user = await refreshUser();
  if (!user) throw new Error(t("auth.loginError"));
  return user;
}

export async function signOut() {
  await supabase.auth.signOut();
  currentUser = null;
  emit();
}

export async function updateCurrentUser(
  updates: Partial<
    Pick<
      AuthUser,
      "name" | "bio" | "goal" | "journeyGoal" | "avatarUrl" | "phone" | "cpf" | "birthDate" | "sex"
    >
  >,
): Promise<AuthUser | null> {
  const current = currentUser;
  if (!current) return null;

  const profile: TablesUpdate<"profiles"> = {};
  if (updates.name !== undefined) profile.name = updates.name;
  if (updates.bio !== undefined) profile.bio = updates.bio;
  if (updates.goal !== undefined) profile.goal = updates.goal;
  if (updates.journeyGoal !== undefined) profile.journey_goal = updates.journeyGoal;
  if (updates.avatarUrl !== undefined) profile.avatar_url = updates.avatarUrl || null;

  const priv: TablesUpdate<"profile_private"> = {};
  if (updates.phone !== undefined) priv.phone = updates.phone || null;
  if (updates.cpf !== undefined) priv.cpf = updates.cpf || null;
  if (updates.birthDate !== undefined) priv.birth_date = updates.birthDate || null;
  if (updates.sex !== undefined) priv.sex = updates.sex || null;

  const ops = [];
  if (Object.keys(profile).length)
    ops.push(supabase.from("profiles").update(profile).eq("id", current.id));
  if (Object.keys(priv).length)
    ops.push(supabase.from("profile_private").update(priv).eq("id", current.id));
  const results = await Promise.all(ops);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);

  return refreshUser();
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const current = currentUser;
  if (!current) throw new Error(t("err.noAccount"));
  // Confirma a senha atual antes de trocar.
  const check = await supabase.auth.signInWithPassword({
    email: current.email,
    password: currentPassword,
  });
  if (check.error) throw new Error(t("err.wrongCurrent"));
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(translateAuthError(error.message));
}

export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
    redirectTo: typeof window !== "undefined" ? `${location.origin}/recuperar-senha` : undefined,
  });
  if (error) throw new Error(translateAuthError(error.message));
}

/** Valida o código de 6 dígitos do e-mail de recuperação (abre uma sessão de recuperação). */
export async function verifyRecoveryCode(email: string, code: string) {
  const { error } = await supabase.auth.verifyOtp({
    email: email.toLowerCase().trim(),
    token: code.trim(),
    type: "recovery",
  });
  if (error) throw new Error(t("reset.invalidCode"));
}

/** Define a nova senha na sessão de recuperação aberta pelo link do e-mail. */
export async function setNewPassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(translateAuthError(error.message));
}

export async function deleteAccount() {
  const { error } = await supabase.rpc("delete_my_account");
  if (error) throw new Error(error.message);
  await supabase.auth.signOut();
  currentUser = null;
  emit();
}

/** Contato de outra pessoa — só retorna algo quando o RLS permite (vínculo ativo/admin). */
export async function fetchContactInfo(
  userId: string,
): Promise<{ email?: string; phone?: string } | null> {
  const { data } = await supabase
    .from("profile_private")
    .select("email, phone")
    .eq("id", userId)
    .maybeSingle();
  return data ? { email: data.email ?? undefined, phone: data.phone ?? undefined } : null;
}

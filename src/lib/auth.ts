import { supabase } from "@/integrations/supabase/client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  bio?: string;
  goal?: string;
  journeyGoal?: string;
  role?: string;
}

export async function getUser(): Promise<AuthUser | null> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("Erro ao obter sessão:", sessionError);
    return null;
  }

  if (!session) {
    return null;
  }

  // Try to get profile from DB
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    // PGRST116 is "Row not found", which can happen initially before trigger or insert finishes.
    // If it's a real error, we shouldn't swallow it.
    console.error("Erro ao carregar profile:", profileError);
  }

  const { data: privateData, error: privError } = await supabase
    .from("private_profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  if (privError && privError.code !== "PGRST116") {
    console.error("Erro ao carregar private_profile:", privError);
  }

  const metadataName = session.user.user_metadata?.display_name;

  return {
    id: session.user.id,
    name: profile?.display_name || metadataName || session.user.email?.split("@")[0] || "Usuário",
    email: session.user.email || "",
    role: profile?.role || "user",
    bio: profile?.bio || "",
    phone: privateData?.phone || "",
    cpf: privateData?.cpf || "",
    birthDate: privateData?.birth_date || "",
    journeyGoal: session.user.user_metadata?.journeyGoal || "",
    goal: session.user.user_metadata?.goal || "",
  };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Erro ao fazer logout:", error);
    throw error;
  }
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
}) {
  const cleanEmail = data.email.toLowerCase().trim();
  if (!data.password) throw new Error("Senha obrigatória");

  // Attempt Supabase Auth Sign Up
  // The Postgres trigger 'on_auth_user_created' handles inserting into profiles and private_profiles
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: cleanEmail,
    password: data.password,
    options: {
      data: {
        display_name: data.name.trim(),
        journeyGoal: data.goal || data.journeyGoal || "",
        phone: data.phone || null,
        cpf: data.cpf || null,
        birthDate: data.birthDate || null,
      },
    },
  });

  if (authError) {
    console.error("Supabase Signup Error:", authError);
    if (authError.message.includes("rate limit")) {
      throw new Error("Limite de cadastros atingido pelo provedor. Tente novamente mais tarde.");
    }
    throw new Error(authError.message);
  }

  if (!authData.user) throw new Error("Erro desconhecido ao criar usuário");

  return getUser();
}

export async function loginUser(email: string, password?: string) {
  const cleanEmail = email.toLowerCase().trim();
  if (!password) throw new Error("Senha obrigatória.");

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (error) {
    console.error("Supabase Login Error:", error);
    throw new Error(
      error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message,
    );
  }

  return getUser();
}

export async function updateCurrentUser(updates: Partial<AuthUser>) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error("Erro de sessão: Sessão não encontrada ou expirada.");
  }

  if (updates.name !== undefined || updates.bio !== undefined) {
    const { error: pError } = await supabase
      .from("profiles")
      .update({
        display_name: updates.name,
        bio: updates.bio,
      })
      .eq("id", session.user.id);

    if (pError) throw new Error(`Erro ao atualizar perfil público: ${pError.message}`);
  }

  if (updates.cpf !== undefined || updates.phone !== undefined || updates.birthDate !== undefined) {
    const { error: prError } = await supabase
      .from("private_profiles")
      .update({
        cpf: updates.cpf,
        phone: updates.phone,
        birth_date: updates.birthDate,
      })
      .eq("user_id", session.user.id);

    if (prError) throw new Error(`Erro ao atualizar perfil privado: ${prError.message}`);
  }

  // Update Auth JWT metadata for goal
  if (updates.goal !== undefined || updates.journeyGoal !== undefined) {
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        journeyGoal: updates.journeyGoal || updates.goal || "",
      },
    });
    if (authError) throw new Error(`Erro ao atualizar metadados da conta: ${authError.message}`);
  }

  return getUser();
}

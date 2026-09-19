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
    throw new Error("Erro ao obter sessão: " + sessionError.message);
  }

  if (!session) {
    return null;
  }

  // Obter profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (profileError) {
    if (profileError.code === "PGRST116") {
      throw new Error("PROFILE_MISSING");
    }
    throw new Error("Erro de banco ao carregar profile: " + profileError.message);
  }

  // Obter private_profile
  const { data: privateData, error: privError } = await supabase
    .from("private_profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  if (privError) {
    if (privError.code === "PGRST116") {
      throw new Error("PRIVATE_PROFILE_MISSING");
    }
    throw new Error("Erro de banco ao carregar private_profile: " + privError.message);
  }

  return {
    id: session.user.id,
    name: profile.display_name,
    email: session.user.email || "",
    role: profile.role,
    bio: profile.bio || "",
    phone: privateData.phone || "",
    cpf: privateData.cpf || "",
    birthDate: privateData.birth_date || "",
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
    if (authError.message.includes("rate limit")) {
      throw new Error("Limite de cadastros atingido pelo provedor. Tente novamente mais tarde.");
    }
    throw new Error(authError.message);
  }

  if (!authData.user) throw new Error("Erro desconhecido ao criar usuário");

  if (!authData.session) {
    // Requires email confirmation or session not established
    return null;
  }

  try {
    const user = await getUser();
    return user;
  } catch (err: any) {
    if (err.message === "PROFILE_MISSING" || err.message === "PRIVATE_PROFILE_MISSING") {
      throw new Error(
        "Falha crítica: O perfil não foi gerado automaticamente pelo banco de dados.",
      );
    }
    throw err;
  }
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

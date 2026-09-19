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

export interface StoredAccount extends AuthUser {
  password?: string; // Legacy only
}

const AUTH_KEY = "nutriconnect_auth";
const USERS_DB_KEY = "nutriconnect_users_db";

export function getStoredUsers(): Record<string, StoredAccount> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getLegacyUserByEmail(email: string): AuthUser | null {
  const users = getStoredUsers();
  return users[email] || null;
}

export async function getUser(): Promise<AuthUser | null> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // Graceful fallback for completely offline/legacy mode if no session exists at all
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(AUTH_KEY);
        if (raw) return JSON.parse(raw) as AuthUser;
      } catch {}
    }
    return null;
  }
  
  // Try to get profile from DB, but don't fail if table doesn't exist
  let profile = null;
  let privateData = null;

  try {
    const { data: pData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    profile = pData;
  } catch (e) {
    console.warn("Profiles table not ready", e);
  }

  try {
    const { data: prData } = await supabase.from("private_profiles").select("*").eq("user_id", session.user.id).single();
    privateData = prData;
  } catch (e) {
    console.warn("Private Profiles table not ready", e);
  }

  // Se o banco não tem a tabela ainda, usamos o metadata do JWT ou legacy
  const metadataName = session.user.user_metadata?.display_name;
  const legacyFallback = getLegacyUserByEmail(session.user.email || "");

  return {
    id: session.user.id,
    name: profile?.display_name || metadataName || legacyFallback?.name || session.user.email?.split("@")[0] || "Usuário",
    email: session.user.email || "",
    role: profile?.role || legacyFallback?.role || "user",
    bio: profile?.bio || legacyFallback?.bio,
    phone: privateData?.phone || legacyFallback?.phone,
    cpf: privateData?.cpf || legacyFallback?.cpf,
    birthDate: privateData?.birth_date || legacyFallback?.birthDate,
  };
}

export async function signOut() {
  await supabase.auth.signOut();
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
    window.dispatchEvent(new Event("auth-change"));
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
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: cleanEmail,
    password: data.password,
    options: {
      data: {
        display_name: data.name.trim(),
      }
    }
  });

  if (authError) {
    console.error("Supabase Signup Error:", authError);
    if (authError.message.includes("rate limit")) {
      throw new Error("Limite de cadastros atingido pelo provedor. Tente novamente mais tarde.");
    }
    throw new Error(authError.message);
  }

  if (!authData.user) throw new Error("Erro desconhecido ao criar usuário");

  // Attempt to insert profiles (silently fail if tables don't exist yet)
  try {
    await supabase.from("profiles").upsert({
      id: authData.user.id,
      display_name: data.name.trim(),
      username: cleanEmail.split("@")[0] + Math.floor(Math.random() * 1000),
    });

    await supabase.from("private_profiles").upsert({
      user_id: authData.user.id,
      email: cleanEmail,
      full_name: data.name.trim(),
      cpf: data.cpf || null,
      phone: data.phone || null,
      birth_date: data.birthDate || null,
    });
  } catch (e) {
    console.warn("Could not insert profile data because tables are not ready.", e);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth-change"));
  }

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
    // Legacy fallback migration
    const legacyUsers = getStoredUsers();
    const legacyUser = legacyUsers[cleanEmail];
    
    if (legacyUser && legacyUser.password === password) {
      // Tentar migrar conta para Supabase Auth
      const { error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { display_name: legacyUser.name } }
      });
      
      if (!signUpError || signUpError.message.includes("already registered")) {
        // Tenta logar de novo
        const retry = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (!retry.error && retry.data.user) {
          try {
            await supabase.from("profiles").upsert({
              id: retry.data.user.id,
              display_name: legacyUser.name,
              username: cleanEmail.split("@")[0] + Math.floor(Math.random() * 1000),
              bio: legacyUser.bio,
            });

            await supabase.from("private_profiles").upsert({
              user_id: retry.data.user.id,
              email: cleanEmail,
              full_name: legacyUser.name,
              phone: legacyUser.phone,
              cpf: legacyUser.cpf,
              birth_date: legacyUser.birthDate,
            });
          } catch(e) {
            console.warn("Legacy profile data could not be saved to DB yet.", e);
          }

          // Segurana: Remover senha legada do local storage
          delete legacyUser.password;
          localStorage.setItem(USERS_DB_KEY, JSON.stringify(legacyUsers));
          
          window.dispatchEvent(new Event("auth-change"));
          return getUser();
        }
      }
      
      // Se a migração falhou por rate limit ou erro de rede, permite login legado temporário
      console.warn("Supabase Auth falhou, usando autenticação legada como fallback.");
      localStorage.setItem(AUTH_KEY, JSON.stringify(legacyUser));
      window.dispatchEvent(new Event("auth-change"));
      return legacyUser;
    }

    throw new Error(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error.message);
  }

  window.dispatchEvent(new Event("auth-change"));
  return getUser();
}

export async function updateCurrentUser(updates: Partial<AuthUser>) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // Legacy offline update
    const current = await getUser();
    if (current && typeof window !== 'undefined') {
       const updated = { ...current, ...updates };
       localStorage.setItem(AUTH_KEY, JSON.stringify(updated));
       
       const users = getStoredUsers();
       if (users[updated.email]) {
         users[updated.email] = { ...users[updated.email], ...updated };
         localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
       }
       
       window.dispatchEvent(new Event("auth-change"));
       return updated;
    }
    return null;
  }

  try {
    if (updates.name || updates.bio) {
      await supabase.from("profiles").update({
        display_name: updates.name,
        bio: updates.bio,
      }).eq("id", session.user.id);
    }

    if (updates.cpf || updates.phone || updates.birthDate) {
      await supabase.from("private_profiles").update({
        cpf: updates.cpf,
        phone: updates.phone,
        birth_date: updates.birthDate,
      }).eq("user_id", session.user.id);
    }
  } catch (e) {
    console.warn("Could not update DB profiles", e);
  }

  window.dispatchEvent(new Event("auth-change"));
  return getUser();
}

// Para testes locais
export async function mockLogin(email: string) {
  return loginUser(email, "123456"); 
}


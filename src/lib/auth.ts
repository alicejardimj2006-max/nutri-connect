// Frontend auth stored in localStorage.
// Ready for future API/DB integration.

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
}

export interface StoredAccount extends AuthUser {
  password?: string;
}

const AUTH_KEY = "nutriconnect_auth";
const USERS_DB_KEY = "nutriconnect_users_db";

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("auth-change"));
}

export function signOut() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event("auth-change"));
}

export function getStoredUsers(): Record<string, StoredAccount> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredUser(account: StoredAccount) {
  if (typeof window === "undefined") return;
  const users = getStoredUsers();
  users[account.email.toLowerCase().trim()] = account;
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

export function registerUser(data: {
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  password?: string;
  goal?: string;
  journeyGoal?: string;
}): AuthUser {
  const cleanEmail = data.email.toLowerCase().trim();

  const existingUsers = getStoredUsers();
  if (existingUsers[cleanEmail]) {
    throw new Error("E-mail já cadastrado");
  }

  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  const newUser: StoredAccount = {
    id,
    name: data.name.trim(),
    email: cleanEmail,
    phone: data.phone?.trim() || "",
    cpf: data.cpf?.trim() || "",
    birthDate: data.birthDate || "",
    password: data.password,
    goal: data.goal || "Comer melhor e com prazer",
    journeyGoal: data.journeyGoal || data.goal || "Comer melhor e com prazer",
  };

  saveStoredUser(newUser);
  setUser(newUser);
  return newUser;
}

export function loginUser(email: string, password?: string): AuthUser {
  const cleanEmail = email.toLowerCase().trim();
  const users = getStoredUsers();
  const existing = users[cleanEmail];

  if (!existing) {
    throw new Error("E-mail não encontrado. Verifique ou crie sua conta.");
  }

  if (existing.password !== password) {
    throw new Error("Senha incorreta.");
  }

  const activeUser: AuthUser = {
    ...existing,
  };

  setUser(activeUser);
  return activeUser;
}

export function updateCurrentUser(updates: Partial<AuthUser>): AuthUser | null {
  const current = getUser();
  if (!current) return null;

  const updated: AuthUser = {
    ...current,
    ...updates,
  };

  setUser(updated);

  // Sync with stored users database
  const users = getStoredUsers();
  const key = current.email.toLowerCase().trim();
  const existing = users[key] || {};
  users[key] = {
    ...existing,
    ...updated,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  }

  return updated;
}

export function mockLogin(email: string): AuthUser {
  return loginUser(email);
}

// Frontend auth stored in localStorage.
// Ready for future API/DB integration.

export type UserRole = "paciente" | "nutricionista";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  crn?: string;
  specialty?: string;
  bio?: string;
  goal?: string;
  dietaryRestrictions?: string;
  allergies?: string;
  attendanceHours?: string;
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
  role: UserRole;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  password?: string;
  goal?: string;
  crn?: string;
  specialty?: string;
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
    role: data.role,
    phone: data.phone?.trim() || "",
    cpf: data.cpf?.trim() || "",
    birthDate: data.birthDate || "",
    password: data.password,
    goal: data.role === "paciente" ? data.goal || "Comer melhor e com prazer" : undefined,
    crn: data.crn?.trim() || "",
    specialty: data.role === "nutricionista" ? data.specialty || "Clínica" : undefined,
    attendanceHours: data.role === "nutricionista" ? "Seg–Sex, 08h–18h" : undefined,
  };

  saveStoredUser(newUser);
  setUser(newUser);
  return newUser;
}

export function loginUser(email: string, role: UserRole, password?: string): AuthUser {
  const cleanEmail = email.toLowerCase().trim();
  const users = getStoredUsers();
  const existing = users[cleanEmail];

  if (!existing) {
    throw new Error("E-mail não encontrado. Verifique ou crie sua conta.");
  }

  // Se a conta tiver senha (é uma conta real criada via cadastro), precisamos validar
  if (existing.password && existing.password !== password) {
    throw new Error("Senha incorreta.");
  }

  if (existing.role !== role) {
    throw new Error(`Esta conta está registrada como ${existing.role}.`);
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

export function mockLogin(email: string, role: UserRole): AuthUser {
  return loginUser(email, role);
}

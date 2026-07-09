// Frontend-only mock auth stored in localStorage.
// Structure ready for future API/DB integration.

export type UserRole = "paciente" | "nutricionista";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

const KEY = "nutriconnect_auth";

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser) {
  localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("auth-change"));
}

export function signOut() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("auth-change"));
}

export function mockLogin(email: string, role: UserRole): AuthUser {
  const user: AuthUser = {
    id: crypto.randomUUID(),
    name: role === "nutricionista" ? "Dra. Marina Alves" : "João Silva",
    email,
    role,
  };
  setUser(user);
  return user;
}

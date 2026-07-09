import { useEffect, useState } from "react";
import { getUser, type AuthUser } from "@/lib/auth";

export function useAuth() {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUserState(getUser());
    setHydrated(true);
    const onChange = () => setUserState(getUser());
    window.addEventListener("auth-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("auth-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return { user, hydrated };
}

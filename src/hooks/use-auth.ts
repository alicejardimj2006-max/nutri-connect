import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
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

/**
 * Gate for pages that belong to the social network: the whole app is only
 * reachable after login, so this redirects to /login as soon as we know
 * (post-hydration) that there is no signed-in user.
 */
export function useRequireAuth() {
  const { user, hydrated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && !user) {
      navigate({ to: "/login" });
    }
  }, [hydrated, user, navigate]);

  return { user, hydrated };
}

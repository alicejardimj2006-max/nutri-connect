import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AUTH_EVENT, getUser, initAuth, isAuthReady, type AuthUser } from "@/lib/auth";

export function useAuth() {
  const [user, setUserState] = useState<AuthUser | null>(getUser);
  const [hydrated, setHydrated] = useState<boolean>(isAuthReady);

  useEffect(() => {
    const sync = () => {
      setUserState(getUser());
      setHydrated(isAuthReady());
    };
    sync();
    window.addEventListener(AUTH_EVENT, sync);
    void initAuth().then(sync);
    return () => window.removeEventListener(AUTH_EVENT, sync);
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

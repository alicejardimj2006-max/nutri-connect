import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { getUser, type AuthUser } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const u = await getUser();
        if (mounted) {
          setUserState(u);
          setHydrated(true);
        }
      } catch (e) {
        if (mounted) setHydrated(true);
      }
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        loadUser();
      }
    });

    const onCustomChange = () => loadUser();
    window.addEventListener("auth-change", onCustomChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener("auth-change", onCustomChange);
    };
  }, []);

  return { user, hydrated };
}

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

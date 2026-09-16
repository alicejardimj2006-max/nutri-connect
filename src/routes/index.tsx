import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthGateLoading } from "@/components/site-chrome";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NutriConnect — Uma rede social sobre alimentação" },
      {
        name: "description",
        content:
          "Uma rede social para descobrir receitas, compartilhar experiências, participar de comunidades e construir hábitos alimentares junto com outras pessoas.",
      },
    ],
  }),
  component: HomeGate,
});

function HomeGate() {
  const { user, hydrated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      navigate({ to: "/perfil/$userId", params: { userId: user.id } });
    } else {
      navigate({ to: "/login" });
    }
  }, [hydrated, user, navigate]);

  return <AuthGateLoading />;
}

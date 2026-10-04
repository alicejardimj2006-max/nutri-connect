import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthGateLoading } from "@/components/site-chrome";
import { Landing } from "@/components/landing";
import { useAuth } from "@/hooks/use-auth";
import { HOME_ROUTES, loadAppearance } from "@/lib/appearance";

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
    if (user) navigate({ to: (HOME_ROUTES[loadAppearance().homePage] ?? "/espaco") as "/espaco" });
  }, [hydrated, user, navigate]);

  // Quem não entrou vê a página que apresenta o site (sem acesso ao conteúdo).
  if (hydrated && !user) return <Landing />;
  return <AuthGateLoading />;
}

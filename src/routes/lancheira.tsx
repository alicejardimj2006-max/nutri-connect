import { createFileRoute } from "@tanstack/react-router";
import { AppScreen } from "@/components/app-screen";
import { LunchboxPanel } from "@/components/lunchbox-panel";
import { AuthGateLoading } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/lancheira")({
  head: () => ({
    meta: [
      { title: "Lancheira da semana — NutriConnect" },
      {
        name: "description",
        content:
          "Lanches escolares de segunda a sexta, com comida de verdade e seguros para cada criança.",
      },
    ],
  }),
  component: LancheiraPage,
});

function LancheiraPage() {
  const { user, hydrated } = useRequireAuth();
  if (!hydrated || !user) return <AuthGateLoading />;
  return (
    <AppScreen>
      <LunchboxPanel />
    </AppScreen>
  );
}

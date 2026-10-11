import { createFileRoute } from "@tanstack/react-router";
import { AppScreen } from "@/components/app-screen";
import { FridgePanel } from "@/components/fridge-panel";
import { AuthGateLoading } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/geladeira")({
  head: () => ({
    meta: [
      { title: "O que tem na geladeira? — NutriConnect" },
      {
        name: "description",
        content:
          "Receitas simples com o que você tem em casa, com aproveitamento integral dos alimentos.",
      },
    ],
  }),
  component: GeladeiraPage,
});

function GeladeiraPage() {
  const { user, hydrated } = useRequireAuth();
  if (!hydrated || !user) return <AuthGateLoading />;
  return (
    <AppScreen>
      <FridgePanel />
    </AppScreen>
  );
}

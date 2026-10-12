import { createFileRoute } from "@tanstack/react-router";
import { AppScreen } from "@/components/app-screen";
import { MenuPanel } from "@/components/menu-panel";
import { AuthGateLoading } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/cardapio")({
  head: () => ({
    meta: [
      { title: "Cardápio da semana — NutriConnect" },
      {
        name: "description",
        content:
          "Almoço e jantar da semana dentro do seu orçamento, com uma lista de compras só, agrupada por seção.",
      },
    ],
  }),
  component: CardapioPage,
});

function CardapioPage() {
  const { user, hydrated } = useRequireAuth();
  if (!hydrated || !user) return <AuthGateLoading />;
  return (
    <AppScreen>
      <MenuPanel />
    </AppScreen>
  );
}

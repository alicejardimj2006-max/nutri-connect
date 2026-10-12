import { createFileRoute } from "@tanstack/react-router";
import { AppScreen } from "@/components/app-screen";
import { SeasonPanel } from "@/components/season-panel";
import { AuthGateLoading } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/feira")({
  head: () => ({
    meta: [
      { title: "Calendário da feira — NutriConnect" },
      {
        name: "description",
        content:
          "Frutas, legumes e verduras da estação no seu estado, com dicas para escolher, conservar e aproveitar.",
      },
    ],
  }),
  component: FeiraPage,
});

function FeiraPage() {
  const { user, hydrated } = useRequireAuth();
  if (!hydrated || !user) return <AuthGateLoading />;
  return (
    <AppScreen>
      <SeasonPanel />
    </AppScreen>
  );
}

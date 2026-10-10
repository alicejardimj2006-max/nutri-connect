import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthGateLoading } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";
import { AppScreen } from "@/components/app-screen";

export const Route = createFileRoute("/perfil/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — NutriConnect" }] }),
  component: ConfiguracoesLayout,
});

function ConfiguracoesLayout() {
  const { user, hydrated } = useRequireAuth();

  if (!hydrated || !user) return <AuthGateLoading />;

  return (
    <AppScreen>
      <Outlet />
    </AppScreen>
  );
}

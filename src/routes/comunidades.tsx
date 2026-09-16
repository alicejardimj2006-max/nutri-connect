import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthGateLoading, SiteHeader, SiteFooter } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/comunidades")({
  component: ComunidadesLayout,
});

function ComunidadesLayout() {
  const { user, hydrated } = useRequireAuth();

  if (!hydrated || !user) return <AuthGateLoading />;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

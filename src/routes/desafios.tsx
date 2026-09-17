import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthGateLoading, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/desafios")({
  component: DesafiosLayout,
});

function DesafiosLayout() {
  const { user, hydrated } = useRequireAuth();

  if (!hydrated || !user) return <AuthGateLoading />;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

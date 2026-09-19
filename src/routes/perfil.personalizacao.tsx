import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AuthGateLoading, SiteHeader } from "@/components/site-chrome";
import { AppearanceEditor } from "@/components/appearance-editor";
import { useRequireAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/perfil/personalizacao")({
  head: () => ({ meta: [{ title: "Personalização — NutriConnect" }] }),
  component: PersonalizationPage,
});

function PersonalizationPage() {
  const { user, hydrated } = useRequireAuth();

  if (!hydrated || !user) return <AuthGateLoading />;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <Link
          to="/perfil/configuracoes"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para as configurações</span>
        </Link>

        <h1 className="mb-1 font-display text-3xl font-extrabold text-foreground">
          Personalização
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Monte o seu estilo: cores, fontes, formas e mais. As mudanças aparecem na hora e ficam
          salvas neste aparelho.
        </p>

        <AppearanceEditor />
      </main>
    </div>
  );
}

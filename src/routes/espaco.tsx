import { createFileRoute } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { AuthGateLoading, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";
import { useCommunity } from "@/hooks/use-community";
import { PostCard } from "@/components/community-cards";
import { ShareModal } from "@/components/share-modal";

export const Route = createFileRoute("/espaco")({
  head: () => ({
    meta: [
      { title: "Espaço de Hoje | NutriConnect" },
      {
        name: "description",
        content: "Receitas e experiências compartilhadas pela comunidade NutriConnect.",
      },
      { property: "og:title", content: "Espaço de Hoje | NutriConnect" },
      {
        property: "og:description",
        content: "Acompanhe o feed diário da comunidade NutriConnect.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EspacoDeHojePage,
});

function EspacoDeHojePage() {
  const { user, hydrated: authHydrated } = useRequireAuth();
  const { posts, hydrated } = useCommunity();

  if (!authHydrated || !user) return <AuthGateLoading />;

  // Ordem: destaque (geral), receita, experiencia, pergunta
  const destaque = posts.find((p) => p.type === "geral") || null;
  const receita = posts.find((p) => p.type === "receita") || null;
  const experiencia = posts.find((p) => p.type === "experiencia") || null;
  const pergunta = posts.find((p) => p.type === "pergunta") || null;

  // Add rest of the posts in case there are more
  const rest = posts.filter(
    (p) => p !== destaque && p !== receita && p !== experiencia && p !== pergunta,
  );

  const displayedPosts = [destaque, receita, experiencia, pergunta, ...rest].filter(
    Boolean,
  ) as typeof posts;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-8">
        {/* Feed centralizado */}
        <div className="mx-auto w-full max-w-2xl space-y-6">
          {/* Lista de Cards */}
          {!hydrated ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Carregando o Espaço de Hoje…
            </div>
          ) : displayedPosts.length > 0 ? (
            <div className="space-y-8">
              {displayedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center max-w-lg mx-auto">
              <Compass className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-base text-muted-foreground font-medium mb-6">
                Nenhuma publicação encontrada nesta categoria ainda.
              </p>
              <ShareModal
                triggerButton={
                  <button className="rounded-full bg-secondary border border-border px-6 py-2.5 text-sm font-bold text-foreground hover:bg-muted transition">
                    Fazer primeira publicação
                  </button>
                }
              />
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

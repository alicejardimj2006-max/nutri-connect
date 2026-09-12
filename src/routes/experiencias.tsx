import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Plus, Heart, MessageSquare } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useCommunity } from "@/hooks/use-community";
import { PostCard } from "@/components/community-cards";
import { ShareModal } from "@/components/share-modal";

export const Route = createFileRoute("/experiencias")({
  head: () => ({
    meta: [
      { title: "Experiências e Relatos — NutriConnect" },
      {
        name: "description",
        content: "Espaço acolhedor para compartilhar conquistas da rotina, descobertas na cozinha e aprendizados sem julgamento estético ou números de balança.",
      },
    ],
  }),
  component: ExperienciasPage,
});

function ExperienciasPage() {
  const { posts, hydrated } = useCommunity();

  const experiences = posts.filter((p) => p.type === "experiencia");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6 py-8">
        {/* Cabeçalho */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Vozes da Comunidade</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-foreground">
              Minhas Experiências
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Celebramos a vida real: uma refeição cozinhada em casa, um momento de paz com o prato,
              uma vitória sobre a correria. Sem comparações corporais, apenas passos de cada jornada.
            </p>
          </div>

          <ShareModal
            triggerButton={
              <button
                type="button"
                className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Contar minha experiência</span>
              </button>
            }
          />
        </div>

        {/* Manifesto de Acolhimento */}
        <div className="rounded-2xl border border-primary/20 bg-primary-soft/40 p-5 mb-8 text-xs text-foreground/90 flex items-center gap-3 shadow-xs">
          <span className="text-2xl">🌿</span>
          <p className="leading-relaxed">
            <b>Nosso pacto comunitário:</b> aqui valorizamos o bem-estar, a consistência e a relação afetiva com a comida. Não compartilhamos comparações de antes/depois ou números restritivos de calorias.
          </p>
        </div>

        {/* Lista de Experiências */}
        {!hydrated ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Carregando experiências…
          </div>
        ) : experiences.length > 0 ? (
          <div className="space-y-6">
            {experiences.map((exp) => (
              <PostCard key={exp.id} post={exp} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center max-w-md mx-auto">
            <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-bold text-foreground font-display">
              Nenhuma experiência compartilhada ainda
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Como foi sua alimentação hoje? Conte uma pequena vitória ou desafio superado!
            </p>
            <div className="mt-4">
              <ShareModal />
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

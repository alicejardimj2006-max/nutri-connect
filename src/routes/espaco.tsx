import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Compass, ChefHat, Sparkles, BookOpen, HelpCircle, Plus, Search } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useCommunity } from "@/hooks/use-community";
import { PostCard, WeeklyThemeCard } from "@/components/community-cards";
import { ShareModal } from "@/components/share-modal";

export const Route = createFileRoute("/espaco")({
  head: () => ({
    title: "Espaço de Hoje | NutriConnect",
  }),
  component: EspacoDeHojePage,
});

type FilterTab = "tudo" | "receita" | "experiencia" | "especialista" | "pergunta";

function EspacoDeHojePage() {
  const { posts, weeklyTheme, challenges, hydrated } = useCommunity();
  const [currentTab, setCurrentTab] = useState<FilterTab>("tudo");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBySearch = posts.filter((p) =>
    searchQuery ? p.content.toLowerCase().includes(searchQuery.toLowerCase()) : true,
  );

  let displayedPosts = filteredBySearch;

  if (currentTab === "tudo") {
    // Ordem: destaque (geral), receita, experiencia, especialista, pergunta
    const destaque = filteredBySearch.find((p) => p.type === "geral") || null;
    const receita = filteredBySearch.find((p) => p.type === "receita") || null;
    const experiencia = filteredBySearch.find((p) => p.type === "experiencia") || null;
    const especialista = filteredBySearch.find((p) => p.type === "especialista") || null;
    const pergunta = filteredBySearch.find((p) => p.type === "pergunta") || null;

    // Add rest of the posts in case there are more
    const rest = filteredBySearch.filter(
      (p) =>
        p !== destaque &&
        p !== receita &&
        p !== experiencia &&
        p !== especialista &&
        p !== pergunta,
    );

    displayedPosts = [destaque, receita, experiencia, especialista, pergunta, ...rest].filter(
      Boolean,
    ) as typeof posts;
  } else {
    displayedPosts = filteredBySearch.filter((p) => p.type === currentTab);
  }

  const tabs: {
    id: FilterTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "tudo", label: "Tudo no Espaço", icon: Compass },
    { id: "receita", label: "Receitas", icon: ChefHat },
    { id: "experiencia", label: "Experiências", icon: Sparkles },
    { id: "especialista", label: "Especialistas", icon: BookOpen },
    { id: "pergunta", label: "Perguntas & Dúvidas", icon: HelpCircle },
  ];

  const getEmptyStateMessage = () => {
    if (searchQuery) return "Não encontramos publicações para a sua busca.";
    if (currentTab === "receita") return "Não encontramos receitas para este filtro ainda.";
    if (currentTab === "experiencia")
      return "A comunidade ainda não compartilhou experiências aqui.";
    if (currentTab === "pergunta") return "Seja a primeira pessoa a abrir uma conversa.";
    if (currentTab === "especialista") return "Os especialistas ainda não publicaram por aqui.";
    return "Nenhuma publicação encontrada nesta categoria ainda.";
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-8">
        {/* Cabeçalho do Espaço de Hoje */}
        <div className="flex flex-col gap-6 border-b border-border/70 pb-8 mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-foreground mb-2">
                Espaço de Hoje
              </h1>
              <p className="text-base text-muted-foreground">
                Veja o que a comunidade está preparando, aprendendo e compartilhando.
              </p>
            </div>

            <ShareModal
              triggerButton={
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Compartilhar na comunidade</span>
                </button>
              }
            />
          </div>

          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquise por ingredientes, dúvidas, histórias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-border rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* Layout de duas colunas */}
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Coluna Principal */}
          <div className="flex-1 w-full min-w-0 space-y-6">
            {/* Abas de Filtragem do Feed */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCurrentTab(tab.id)}
                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap transition cursor-pointer shrink-0 ${
                      isActive
                        ? "bg-accent text-accent-foreground font-bold shadow-xs"
                        : "bg-card border border-border text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

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
                  {getEmptyStateMessage()}
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

          {/* Barra Lateral: Tema da Semana e Desafios */}
          <aside className="lg:w-[380px] shrink-0 space-y-8 flex flex-col">
            {/* Widget do Tema da Semana */}
            {weeklyTheme && (
              <div className="rounded-3xl bg-secondary/30 border border-border overflow-hidden">
                <WeeklyThemeCard theme={weeklyTheme} compact={true} />
              </div>
            )}

            {/* Widget de Desafio Destaque */}
            {challenges.length > 0 && (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-soft rounded-bl-full -z-10 opacity-50" />
                <h3 className="text-base font-bold font-display text-foreground mb-1">
                  Quer dar um pequeno passo hoje?
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                  A constância constrói a sua jornada. Participe com a comunidade.
                </p>

                <div className="rounded-2xl bg-secondary/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{challenges[0].badgeIcon}</span>
                    <span className="font-bold text-sm text-foreground">{challenges[0].title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {challenges[0].description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      👥 {challenges[0].participants.length} participando
                    </span>
                    <Link
                      to="/desafios"
                      className="text-xs font-bold text-accent hover:underline bg-accent-soft/30 px-3 py-1.5 rounded-full"
                    >
                      Ver desafio
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Dica da Comunidade */}
            <div className="rounded-3xl border border-primary/20 bg-primary-soft/20 p-6 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🌱</span>
                <span className="font-bold text-primary">Descubra seu ritmo</span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm">
                O Espaço de Hoje não é uma lista de tarefas, é uma janela para o que está
                acontecendo agora. Inspire-se nas histórias, teste uma nova receita ou apenas apoie
                quem está começando.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

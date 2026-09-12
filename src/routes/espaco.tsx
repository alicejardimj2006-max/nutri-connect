import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkles,
  ChefHat,
  BookOpen,
  HelpCircle,
  Plus,
  Compass,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useCommunity } from "@/hooks/use-community";
import { useAuth } from "@/hooks/use-auth";
import { PostCard, WeeklyThemeCard, ChallengeCard } from "@/components/community-cards";
import { ShareModal } from "@/components/share-modal";

export const Route = createFileRoute("/espaco")({
  head: () => ({
    meta: [
      { title: "Espaço de Hoje — NutriConnect" },
      {
        name: "description",
        content: "Descubra receitas preparadas pela comunidade, relatos de experiências, dicas de especialistas e conversas reais sobre alimentação.",
      },
    ],
  }),
  component: EspacoPage,
});

type FilterTab = "tudo" | "receita" | "experiencia" | "especialista" | "pergunta";

function EspacoPage() {
  const { posts, weeklyTheme, challenges, hydrated } = useCommunity();
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<FilterTab>("tudo");

  const filteredPosts = posts.filter((p) => {
    if (currentTab === "tudo") return true;
    return p.type === currentTab;
  });

  const tabs: { id: FilterTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "tudo", label: "Tudo no Espaço", icon: Compass },
    { id: "receita", label: "Receitas", icon: ChefHat },
    { id: "experiencia", label: "Experiências", icon: Sparkles },
    { id: "especialista", label: "Especialistas", icon: BookOpen },
    { id: "pergunta", label: "Perguntas & Dúvidas", icon: HelpCircle },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-8">
        {/* Cabeçalho do Espaço de Hoje */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent mb-2">
              <Compass className="h-3.5 w-3.5" />
              <span>O Pulso de Hoje</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-foreground">
              Espaço de Hoje
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              O que a comunidade está preparando, aprendendo e compartilhando neste momento.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ShareModal
              triggerButton={
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Compartilhar na comunidade</span>
                </button>
              }
            />
          </div>
        </div>

        {/* Layout de duas colunas: Feed principal + Barra lateral comunitária */}
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Coluna Principal */}
          <div className="space-y-6">
            {/* Caixa rápida de compartilhamento */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                  {user ? user.name.charAt(0).toUpperCase() : "🌱"}
                </span>
                <span className="text-sm text-muted-foreground truncate">
                  {user
                    ? `Olá, ${user.name.split(" ")[0]}! Como está sua alimentação hoje?`
                    : "Compartilhe uma receita, relato ou dúvida com a comunidade..."}
                </span>
              </div>
              <ShareModal
                triggerButton={
                  <button
                    type="button"
                    className="shrink-0 rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
                  >
                    Publicar
                  </button>
                }
              />
            </div>

            {/* Abas de Filtragem do Feed */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-border/60">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCurrentTab(tab.id)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
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
            ) : filteredPosts.length > 0 ? (
              <div className="space-y-5">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhuma publicação encontrada nesta categoria ainda.
                </p>
                <div className="mt-4">
                  <ShareModal />
                </div>
              </div>
            )}
          </div>

          {/* Barra Lateral: Tema da Semana e Desafios */}
          <aside className="space-y-6">
            {/* Widget do Tema da Semana */}
            {weeklyTheme && (
              <WeeklyThemeCard theme={weeklyTheme} compact={true} />
            )}

            {/* Widget de Desafios Ativos */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold font-display text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <span>Desafios em Andamento</span>
                </h3>
                <Link to="/desafios" className="text-xs text-primary font-semibold hover:underline">
                  Ver todos
                </Link>
              </div>

              <div className="space-y-3">
                {challenges.slice(0, 2).map((c) => (
                  <div key={c.id} className="rounded-xl bg-secondary/40 p-3 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <span>{c.badgeIcon}</span> {c.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{c.duration}</span>
                    </div>
                    <p className="text-muted-foreground line-clamp-2 mt-0.5">{c.description}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-border/50">
                      <span className="text-muted-foreground">👥 {c.participants.length} participantes</span>
                      <Link to="/desafios" className="font-semibold text-accent hover:underline">
                        Acessar
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dica da Comunidade */}
            <div className="rounded-2xl border border-primary/20 bg-primary-soft/30 p-4 text-xs text-foreground/90">
              <p className="font-semibold text-primary mb-1">🌱 Caminhada sem pressa</p>
              <p className="text-muted-foreground leading-relaxed">
                Você não precisa transformar toda a sua rotina de uma vez. Escolha um único hábito pequeno para cultivar esta semana.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

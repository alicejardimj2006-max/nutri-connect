import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChefHat, Clock, Plus, Search, Filter, Sparkles, Heart } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useCommunity } from "@/hooks/use-community";
import { RECIPE_CATEGORIES, togglePrepared, toggleSupport } from "@/lib/community";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { ShareModal } from "@/components/share-modal";

export const Route = createFileRoute("/receitas")({
  head: () => ({
    meta: [
      { title: "Receitas da Comunidade — NutriConnect" },
      {
        name: "description",
        content: "Receitas saudáveis, simples e afetivas compartilhadas por membros e nutricionistas da comunidade NutriConnect.",
      },
    ],
  }),
  component: ReceitasPage,
});

function ReceitasPage() {
  const { posts, hydrated } = useCommunity();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");

  const recipes = posts.filter((p) => p.type === "receita");

  const filteredRecipes = recipes.filter((r) => {
    const matchesCategory =
      selectedCategory === "Todas" || r.recipeData?.category === selectedCategory;
    const matchesSearch =
      r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handlePrepared = (postId: string, hasPrepared: boolean) => {
    if (!user) {
      toast.info("Faça login para registrar que preparou esta receita.");
      return;
    }
    togglePrepared(postId, user.id);
    if (!hasPrepared) {
      toast.success("Que delícia! Registrado na sua jornada com sucesso.");
    }
  };

  const currentUserId = user?.id || "guest";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-8">
        {/* Cabeçalho de Receitas */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent mb-2">
              <ChefHat className="h-3.5 w-3.5" />
              <span>Cozinha Compartilhada</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-foreground">
              Receitas da Comunidade
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Comida de verdade, feita no dia a dia. Descubra o que outras pessoas estão preparando,
              inspire-se e registre o que você já levou para a sua mesa.
            </p>
          </div>

          <ShareModal
            triggerButton={
              <button
                type="button"
                className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Compartilhar minha receita</span>
              </button>
            }
          />
        </div>

        {/* Filtros e Busca */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, ingrediente ou tag (ex: aveia, maçã, legumes)..."
                className="w-full rounded-full border border-border bg-card pl-10 pr-4 py-2.5 text-xs text-foreground outline-none focus:border-accent shadow-xs"
              />
            </div>
          </div>

          {/* Categorias de Receita */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {RECIPE_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    active
                      ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                      : "bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid de Receitas */}
        {!hydrated ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Carregando receitas…
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map((recipe) => {
              const hasPrep = (recipe.preparedBy || []).includes(currentUserId);
              const prepCount = (recipe.preparedBy || []).length;
              return (
                <div
                  key={recipe.id}
                  className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between transition hover:shadow-sm"
                >
                  <div>
                    {/* Topo do Card */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="rounded-full bg-accent-soft px-3 py-0.5 text-xs font-semibold text-accent">
                        {recipe.recipeData?.category || "Receita"}
                      </span>
                      {recipe.recipeData?.prepTime && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{recipe.recipeData.prepTime}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold font-display text-foreground leading-snug">
                      {recipe.title || "Receita da Comunidade"}
                    </h3>

                    <p className="mt-2 text-xs text-foreground/80 line-clamp-3 leading-relaxed">
                      {recipe.text}
                    </p>

                    {/* Destaque de Ingredientes */}
                    {recipe.recipeData?.ingredients && (
                      <div className="mt-4 rounded-2xl bg-secondary/40 p-3 text-xs">
                        <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider mb-1.5">
                          Ingredientes principais:
                        </p>
                        <ul className="space-y-0.5 text-foreground">
                          {recipe.recipeData.ingredients.slice(0, 3).map((ing, i) => (
                            <li key={i} className="truncate">
                              • {ing}
                            </li>
                          ))}
                          {recipe.recipeData.ingredients.length > 3 && (
                            <li className="text-[11px] text-muted-foreground font-medium">
                              + mais {recipe.recipeData.ingredients.length - 3} itens
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Por <b>{recipe.authorName}</b></span>
                      <span>Dificuldade: <b>{recipe.recipeData?.difficulty || "Fácil"}</b></span>
                    </div>
                  </div>

                  {/* Rodapé do Card com ação Eu Preparei */}
                  <div className="mt-5 border-t border-border/60 pt-4 flex items-center justify-between gap-2">
                    <div className="text-xs">
                      <span className="font-semibold text-foreground">
                        {prepCount} {prepCount === 1 ? "preparo" : "preparos"}
                      </span>
                      <span className="text-muted-foreground text-[11px] block">na comunidade</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePrepared(recipe.id, hasPrep)}
                        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                          hasPrep
                            ? "bg-primary-soft text-primary font-bold shadow-xs"
                            : "bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs"
                        }`}
                        title="Registrar que você preparou esta receita"
                      >
                        <ChefHat className="h-3.5 w-3.5" />
                        <span>{hasPrep ? "Eu preparei ✓" : "Eu preparei"}</span>
                      </button>

                      <Link
                        to="/receitas/$id"
                        params={{ id: recipe.id }}
                        className="rounded-full border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                        title="Ver receita completa"
                      >
                        <Search className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center max-w-md mx-auto">
            <ChefHat className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-bold text-foreground font-display">Nenhuma receita encontrada</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Tente buscar por outro termo ou seja a primeira pessoa a compartilhar nesta categoria!
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

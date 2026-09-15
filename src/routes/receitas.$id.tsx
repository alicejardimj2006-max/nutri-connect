import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChefHat,
  Clock,
  Users,
  ArrowLeft,
  Check,
  Heart,
  MessageSquare,
  Send,
  Sparkles,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useCommunity } from "@/hooks/use-community";
import { useAuth } from "@/hooks/use-auth";
import { togglePrepared, toggleSupport, addComment, formatDate, initials } from "@/lib/community";
import { toast } from "sonner";

export const Route = createFileRoute("/receitas/$id")({
  head: () => ({
    meta: [
      { title: "Detalhe da Receita — NutriConnect" },
      {
        name: "description",
        content:
          "Ingredientes, modo de preparo passo a passo e relatos de quem já preparou esta receita na comunidade.",
      },
    ],
  }),
  component: ReceitaDetalhePage,
});

function ReceitaDetalhePage() {
  const { id } = useParams({ from: "/receitas/$id" });
  const { posts, hydrated } = useCommunity();
  const { user } = useAuth();

  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [commentText, setCommentText] = useState("");

  const recipe = posts.find((p) => p.id === id && p.type === "receita");

  const currentUserId = user?.id || "guest";
  const hasPrepared = (recipe?.preparedBy || []).includes(currentUserId);
  const prepCount = (recipe?.preparedBy || []).length;
  const hasSupported = (recipe?.supports || []).includes(currentUserId);
  const supportCount = (recipe?.supports || []).length;

  if (!hydrated) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16 text-center text-sm text-muted-foreground">
          Carregando receita…
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 text-center">
          <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h1 className="text-2xl font-bold font-display text-foreground">
            Receita não encontrada
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A receita que você procura pode ter sido removida ou o link está incorreto.
          </p>
          <div className="mt-6">
            <Link
              to="/receitas"
              className="rounded-full bg-accent px-6 py-2.5 text-xs font-semibold text-accent-foreground inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar para o catálogo de receitas
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const handleToggleIngredient = (index: number) => {
    setCheckedIngredients((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handlePrepared = () => {
    if (!user) {
      toast.info("Faça login para registrar que preparou esta receita.");
      return;
    }
    togglePrepared(recipe.id, user.id);
    if (!hasPrepared) {
      toast.success("Que maravilha! Registramos esse preparo na sua jornada.");
    }
  };

  const handleSupport = () => {
    if (!user) {
      toast.info("Faça login para apoiar esta receita.");
      return;
    }
    toggleSupport(recipe.id, user.id);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info("Faça login para comentar.");
      return;
    }
    if (!commentText.trim()) return;
    addComment(recipe.id, { id: user.id, name: user.name, role: user.role }, commentText.trim());
    setCommentText("");
    toast.success("Dica ou comentário publicado!");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6 py-8">
        {/* Navegação de retorno */}
        <Link
          to="/receitas"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para todas as receitas</span>
        </Link>

        {/* Card Principal da Receita */}
        <article className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-card">
          {/* Cabeçalho */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="rounded-full bg-accent-soft px-3.5 py-1 text-xs font-bold text-accent">
              {recipe.recipeData?.category || "Receita da Comunidade"}
            </span>

            {/* Contador comunitário */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrepared}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                  hasPrepared
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-accent text-accent-foreground hover:bg-accent/90 shadow-soft"
                }`}
              >
                <ChefHat className="h-4 w-4" />
                <span>
                  {hasPrepared ? "Eu preparei esta receita ✓" : "Eu preparei esta receita"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSupport}
                className={`rounded-full p-2 border transition cursor-pointer ${
                  hasSupported
                    ? "bg-accent-soft border-accent text-accent"
                    : "border-border text-muted-foreground hover:bg-secondary"
                }`}
                title="Apoiar"
              >
                <Heart className={`h-4 w-4 ${hasSupported ? "fill-accent text-accent" : ""}`} />
              </button>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-foreground leading-tight">
            {recipe.title || "Receita sem título"}
          </h1>

          <p className="mt-3 text-base text-foreground/85 leading-relaxed">{recipe.text}</p>

          {/* Dados do Autor e Métricas */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-border/80 py-4 text-xs">
            <div className="flex items-center gap-3">
              <Link
                to="/perfil/$userId"
                params={{ userId: recipe.authorId }}
                className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft font-bold text-primary"
              >
                {initials(recipe.authorName)}
              </Link>
              <div>
                <p className="font-semibold text-foreground">{recipe.authorName}</p>
                <p className="text-muted-foreground">
                  {recipe.authorSpecialty ||
                    (recipe.authorRole === "nutricionista"
                      ? "Nutricionista"
                      : "Membro da comunidade")}
                  {" · "}
                  {formatDate(recipe.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-accent" />
                <span>{recipe.recipeData?.prepTime || "20 min"}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-accent" />
                <span>{recipe.recipeData?.servings || "2 porções"}</span>
              </span>
              <span className="rounded-md bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground">
                Dificuldade: {recipe.recipeData?.difficulty || "Fácil"}
              </span>
            </div>
          </div>

          {/* Selo Comunitário: Eu Preparei */}
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-accent-soft/40 to-primary-soft/30 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs text-foreground font-medium">
              <span className="text-xl">👩‍🍳</span>
              <span>
                <b>{prepCount} pessoas</b> desta comunidade já prepararam esta receita e
                compartilharam a experiência.
              </span>
            </div>
            <button
              type="button"
              onClick={handlePrepared}
              className="text-xs font-bold text-accent hover:underline shrink-0"
            >
              {hasPrepared ? "Desmarcar" : "Já preparei também!"}
            </button>
          </div>

          {/* Grid: Ingredientes + Modo de Preparo */}
          <div className="mt-8 grid gap-8 md:grid-cols-[1fr_1.3fr]">
            {/* Checklist de Ingredientes */}
            <div className="rounded-2xl border border-border/90 bg-secondary/30 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-display">
                  Ingredientes
                </h2>
                <span className="text-[11px] text-muted-foreground">Marque o que já tem</span>
              </div>

              {recipe.recipeData?.ingredients && recipe.recipeData.ingredients.length > 0 ? (
                <ul className="space-y-2 text-xs">
                  {recipe.recipeData.ingredients.map((ing, i) => {
                    const isChecked = checkedIngredients[i];
                    return (
                      <li
                        key={i}
                        onClick={() => handleToggleIngredient(i)}
                        className={`flex items-start gap-2.5 p-2 rounded-xl transition cursor-pointer ${
                          isChecked
                            ? "bg-card/70 line-through text-muted-foreground"
                            : "hover:bg-card/40 text-foreground"
                        }`}
                      >
                        <span
                          className={`grid h-4 w-4 shrink-0 place-items-center rounded border mt-0.5 ${
                            isChecked
                              ? "bg-accent border-accent text-accent-foreground"
                              : "border-border bg-background"
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3" />}
                        </span>
                        <span className="leading-snug">{ing}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">Ingredientes simples e a gosto.</p>
              )}
            </div>

            {/* Modo de Preparo */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-display">
                Modo de Preparo
              </h2>

              {recipe.recipeData?.steps && recipe.recipeData.steps.length > 0 ? (
                <ol className="space-y-3 text-xs">
                  {recipe.recipeData.steps.map((step, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5 shadow-xs"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                        {i + 1}
                      </span>
                      <p className="text-foreground/90 leading-relaxed text-sm pt-0.5">{step}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-xs text-muted-foreground">Preparo simples no seu ritmo.</p>
              )}
            </div>
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="mt-8 pt-4 border-t border-border flex flex-wrap gap-2">
              {recipe.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Seção de Comentários e Dicas da Comunidade */}
        <section className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xs">
          <h3 className="text-lg font-bold font-display text-foreground mb-1">
            Conversa & Dicas da Comunidade
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Testou alguma substituição de ingrediente? Deixe sua dica para inspirar os próximos
            preparos.
          </p>

          <form onSubmit={handleAddComment} className="flex gap-2 mb-6">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Compartilhe como ficou a sua receita ou faça uma pergunta..."
              className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-xs text-foreground outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="rounded-full bg-accent px-5 py-2.5 text-xs font-semibold text-accent-foreground hover:bg-accent/90 shadow-xs flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Enviar</span>
            </button>
          </form>

          <div className="space-y-3">
            {recipe.comments && recipe.comments.length > 0 ? (
              recipe.comments.map((c) => (
                <div key={c.id} className="rounded-2xl bg-secondary/40 p-3.5 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-foreground">{c.authorName}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-foreground/90 leading-relaxed">{c.text}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                Ainda não há comentários. Prepare a receita e venha contar como foi!
              </p>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

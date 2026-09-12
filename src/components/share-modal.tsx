import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, ChefHat, HelpCircle, BookOpen, Plus, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { createCommunityPost, RECIPE_CATEGORIES, type PostType } from "@/lib/community";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function ShareModal({ triggerButton }: { triggerButton?: React.ReactNode }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const [type, setType] = useState<PostType>("experiencia");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  // Campos específicos de receita
  const [prepTime, setPrepTime] = useState("20 min");
  const [servings, setServings] = useState("2 porções");
  const [difficulty, setDifficulty] = useState<"Fácil" | "Médio" | "Difícil">("Fácil");
  const [recipeCategory, setRecipeCategory] = useState("Café da manhã");
  const [ingredientsText, setIngredientsText] = useState("");
  const [stepsText, setStepsText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Você precisa estar conectado para compartilhar.");
      return;
    }
    if (!text.trim() && !title.trim()) {
      toast.error("Escreva uma mensagem para a comunidade.");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    let recipeData;
    if (type === "receita") {
      const ingredients = ingredientsText
        .split("\n")
        .map((i) => i.trim())
        .filter(Boolean);
      const steps = stepsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      recipeData = {
        prepTime,
        servings,
        difficulty,
        category: recipeCategory,
        ingredients: ingredients.length > 0 ? ingredients : ["Ingredientes a gosto"],
        steps: steps.length > 0 ? steps : ["Misture com carinho e saboreie com calma."],
      };
    }

    createCommunityPost({
      type,
      actor: {
        id: user.id,
        name: user.name,
        role: user.role,
        specialty: user.specialty ? `${user.specialty} · ${user.crn || ""}` : undefined,
      },
      title: title.trim() || undefined,
      text: text.trim(),
      tags: tags.length > 0 ? tags : [type],
      recipeData,
    });

    toast.success("Publicado com sucesso no Espaço de Hoje!");
    setOpen(false);
    setTitle("");
    setText("");
    setTagsInput("");
    setIngredientsText("");
    setStepsText("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Compartilhar</span>
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-display text-foreground">
            Compartilhar com a Comunidade
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Contribua para a jornada de outras pessoas sem cobranças ou comparações.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          {/* Seletor de Tipo */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              O que você gostaria de compartilhar?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setType("experiencia")}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium transition cursor-pointer ${
                  type === "experiencia"
                    ? "border-accent bg-accent-soft text-accent font-bold"
                    : "border-border hover:bg-secondary text-muted-foreground"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>Experiência</span>
              </button>

              <button
                type="button"
                onClick={() => setType("receita")}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium transition cursor-pointer ${
                  type === "receita"
                    ? "border-accent bg-accent-soft text-accent font-bold"
                    : "border-border hover:bg-secondary text-muted-foreground"
                }`}
              >
                <ChefHat className="h-4 w-4" />
                <span>Receita</span>
              </button>

              <button
                type="button"
                onClick={() => setType("pergunta")}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium transition cursor-pointer ${
                  type === "pergunta"
                    ? "border-accent bg-accent-soft text-accent font-bold"
                    : "border-border hover:bg-secondary text-muted-foreground"
                }`}
              >
                <HelpCircle className="h-4 w-4" />
                <span>Pergunta</span>
              </button>

              {user?.role === "nutricionista" && (
                <button
                  type="button"
                  onClick={() => setType("especialista")}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium transition cursor-pointer ${
                    type === "especialista"
                      ? "border-primary bg-primary-soft text-primary font-bold"
                      : "border-border hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Especialista</span>
                </button>
              )}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Título acolhedor (opcional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === "receita"
                  ? "Ex: Panqueca de banana com 3 ingredientes"
                  : type === "experiencia"
                  ? "Ex: O que aprendi cozinhando minhas refeições da semana"
                  : "Ex: Como vocês lidam com a vontade de comer doce à noite?"
              }
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          {/* Texto principal */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Relato ou descrição
            </label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Compartilhe como foi sua experiência, dicas ou reflexões..."
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-accent resize-none"
              required
            />
          </div>

          {/* Campos específicos de receita */}
          {type === "receita" && (
            <div className="rounded-xl border border-border/80 bg-secondary/30 p-3.5 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">Tempo</label>
                  <input
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    placeholder="Ex: 25 min"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">Rendimento</label>
                  <input
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    placeholder="Ex: 2 porções"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">Dificuldade</label>
                  <select
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                  >
                    <option value="Fácil">Fácil</option>
                    <option value="Médio">Médio</option>
                    <option value="Difícil">Difícil</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">Categoria</label>
                  <select
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
                    value={recipeCategory}
                    onChange={(e) => setRecipeCategory(e.target.value)}
                  >
                    {RECIPE_CATEGORIES.filter((c) => c !== "Todas").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Ingredientes (um por linha)
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs resize-none"
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  placeholder={"1 xícara de aveia\n1 maçã picada\n1 colher de canela"}
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Modo de preparo (um passo por linha)
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs resize-none"
                  value={stepsText}
                  onChange={(e) => setStepsText(e.target.value)}
                  placeholder={"Misture os ingredientes secos\nAdicione o líquido aos poucos\nCozinhe por 5 minutos"}
                />
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Tags separadas por vírgula (ex: Rotina, Marmitas, Sem glúten)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Café da manhã, Fibras, Praticidade"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-full bg-accent px-5 py-2 text-xs font-semibold text-accent-foreground hover:bg-accent/90 shadow-xs"
            >
              Publicar no Espaço de Hoje
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

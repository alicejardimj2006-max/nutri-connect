import { useRef, useState } from "react";
import { toast } from "sonner";
import { Sparkles, ChefHat, HelpCircle, Plus, ImagePlus, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { createCommunityPost, initials, RECIPE_CATEGORIES, type PostType } from "@/lib/community";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const TYPE_OPTIONS: {
  id: PostType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "experiencia", label: "Experiência", icon: Sparkles },
  { id: "receita", label: "Receita", icon: ChefHat },
  { id: "pergunta", label: "Pergunta", icon: HelpCircle },
];

export function ShareModal({ triggerButton }: { triggerButton?: React.ReactNode }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<PostType>("experiencia");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);

  // Campos específicos de receita
  const [prepTime, setPrepTime] = useState("20 min");
  const [servings, setServings] = useState("2 porções");
  const [difficulty, setDifficulty] = useState<"Fácil" | "Médio" | "Difícil">("Fácil");
  const [recipeCategory, setRecipeCategory] = useState("Café da manhã");
  const [ingredientsText, setIngredientsText] = useState("");
  const [stepsText, setStepsText] = useState("");

  const resetForm = () => {
    setTitle("");
    setText("");
    setTagsInput("");
    setImage(undefined);
    setIngredientsText("");
    setStepsText("");
    setType("experiencia");
    setPrepTime("20 min");
    setServings("2 porções");
    setDifficulty("Fácil");
  };

  const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

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

    try {
      createCommunityPost({
        type,
        actor: {
          id: user.id,
          name: user.name,
        },
        title: title.trim() || undefined,
        text: text.trim(),
        tags: tags.length > 0 ? tags : [type],
        image,
        recipeData,
      });

      toast.success("Publicado com sucesso no Espaço de Hoje!");
      setOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao publicar no Espaço de Hoje.");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

      <DialogContent className="w-full max-w-2xl gap-0 rounded-3xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-border/70 text-left space-y-0">
          <div className="flex items-center gap-3.5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary-soft text-base font-bold text-primary">
              {initials(user?.name || "Você")}
            </span>
            <div>
              <DialogTitle className="text-xl font-bold font-display text-foreground">
                Compartilhar com a comunidade
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Contribua para a jornada de outras pessoas sem cobranças ou comparações.
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
            {/* Seletor de Tipo */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2.5">
                O que você gostaria de compartilhar?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {TYPE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = type === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setType(opt.id)}
                      className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-medium transition cursor-pointer ${
                        active
                          ? "border-accent bg-accent-soft text-accent font-bold shadow-xs"
                          : "border-border hover:bg-secondary text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`grid h-10 w-10 place-items-center rounded-full transition ${
                          active ? "bg-accent text-accent-foreground" : "bg-secondary"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Título */}
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
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
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent transition"
              />
            </div>

            {/* Texto principal */}
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Relato ou descrição
              </label>
              <textarea
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Compartilhe como foi sua experiência, dicas ou reflexões..."
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent transition resize-none"
                required
              />
            </div>

            {/* Imagem */}
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Foto (opcional)
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePickImage}
              />
              {image ? (
                <div className="relative overflow-hidden rounded-2xl border border-border">
                  <img
                    src={image}
                    alt="Prévia da imagem da publicação"
                    className="max-h-72 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImage(undefined)}
                    className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white transition hover:bg-black/80 cursor-pointer"
                    aria-label="Remover imagem"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-8 text-sm font-medium text-muted-foreground transition hover:border-accent/60 hover:bg-secondary/40 hover:text-foreground cursor-pointer"
                >
                  <ImagePlus className="h-6 w-6 text-accent" />
                  <span>Adicionar uma foto</span>
                </button>
              )}
            </div>

            {/* Campos específicos de receita */}
            {type === "receita" && (
              <div className="rounded-2xl border border-border/80 bg-secondary/30 p-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Tempo
                    </label>
                    <input
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
                      value={prepTime}
                      onChange={(e) => setPrepTime(e.target.value)}
                      placeholder="Ex: 25 min"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Rendimento
                    </label>
                    <input
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
                      value={servings}
                      onChange={(e) => setServings(e.target.value)}
                      placeholder="Ex: 2 porções"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Dificuldade
                    </label>
                    <select
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
                      value={difficulty}
                      onChange={(e) =>
                        setDifficulty(e.target.value as "Fácil" | "Médio" | "Difícil")
                      }
                    >
                      <option value="Fácil">Fácil</option>
                      <option value="Médio">Médio</option>
                      <option value="Difícil">Difícil</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Categoria
                    </label>
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
                    placeholder={
                      "Misture os ingredientes secos\nAdicione o líquido aos poucos\nCozinhe por 5 minutos"
                    }
                  />
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">
                Tags separadas por vírgula (ex: Rotina, Marmitas, Sem glúten)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Café da manhã, Fibras, Praticidade"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent transition"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 sm:px-8 py-4 border-t border-border/70 bg-secondary/20">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90 shadow-soft transition cursor-pointer"
            >
              Publicar no Espaço de Hoje
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

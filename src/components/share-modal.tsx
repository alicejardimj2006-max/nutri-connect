import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  ChefHat,
  HelpCircle,
  Plus,
  ImagePlus,
  X,
  Type,
  AlignLeft,
  Tag,
  Layers,
  Send,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { createCommunityPost, initials, RECIPE_CATEGORIES, type PostType } from "@/lib/community";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const THEMES = {
  accent: {
    wash: "from-accent/35 via-accent-soft to-card",
    border: "border-accent/60",
    tape: "bg-accent",
    badge: "bg-accent text-accent-foreground",
    active: "border-accent bg-accent text-accent-foreground shadow-md",
    solid: "bg-accent",
  },
  primary: {
    wash: "from-primary/35 via-primary-soft to-card",
    border: "border-primary/60",
    tape: "bg-primary",
    badge: "bg-primary text-primary-foreground",
    active: "border-primary bg-primary text-primary-foreground shadow-md",
    solid: "bg-primary",
  },
  olive: {
    wash: "from-chart-3/45 via-chart-3/15 to-card",
    border: "border-chart-3/60",
    tape: "bg-chart-3",
    badge: "bg-chart-3 text-white",
    active: "border-chart-3 bg-chart-3 text-white shadow-md",
    solid: "bg-chart-3",
  },
  sand: {
    wash: "from-chart-4/45 via-chart-4/15 to-card",
    border: "border-chart-4/60",
    tape: "bg-chart-4",
    badge: "bg-chart-4 text-white",
    active: "border-chart-4 bg-chart-4 text-white shadow-md",
    solid: "bg-chart-4",
  },
  sage: {
    wash: "from-chart-5/45 via-chart-5/15 to-card",
    border: "border-chart-5/60",
    tape: "bg-chart-5",
    badge: "bg-chart-5 text-white",
    active: "border-chart-5 bg-chart-5 text-white shadow-md",
    solid: "bg-chart-5",
  },
  warning: {
    wash: "from-warning/45 via-warning/15 to-card",
    border: "border-warning/60",
    tape: "bg-warning",
    badge: "bg-warning text-warning-foreground",
    active: "border-warning bg-warning text-warning-foreground shadow-md",
    solid: "bg-warning",
  },
} as const;

type ThemeKey = keyof typeof THEMES;

const TYPE_OPTIONS: {
  id: PostType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  theme: ThemeKey;
}[] = [
  { id: "experiencia", label: "Experiência", icon: Sparkles, theme: "accent" },
  { id: "receita", label: "Receita", icon: ChefHat, theme: "primary" },
  { id: "pergunta", label: "Pergunta", icon: HelpCircle, theme: "sage" },
];

/** Um "recorte" independente preso ao mural — não uma linha de formulário. */
function PinnedCard({
  icon: Icon,
  theme,
  label,
  hint,
  rotate = "rotate-0",
  className = "",
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  theme: ThemeKey;
  label: string;
  hint?: string;
  rotate?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const t = THEMES[theme];
  return (
    <div
      className={`relative rounded-[1.75rem] border-2 ${t.border} bg-gradient-to-br ${t.wash} p-5 shadow-md transition-all duration-300 hover:z-10 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-xl ${rotate} ${className}`}
    >
      <span
        className={`absolute -top-2.5 left-9 h-5 w-11 -rotate-6 rounded-[3px] ${t.tape} opacity-90 shadow-sm`}
      />
      <div className="flex items-center gap-2.5 mb-3.5">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${t.badge} shadow-xs`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold font-display text-foreground">{label}</p>
          {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

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

      {/* O "mural": um quadro amplo, não um formulário estreito e empilhado */}
      <DialogContent className="w-[95vw] max-w-6xl h-[92vh] max-h-[880px] gap-0 rounded-[2.5rem] border-border/50 p-0 overflow-hidden bg-background">
        {/* Backgrounds coloridos com padrão de pontos separados para não sobrepor */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/25 via-accent-soft to-chart-4/25" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_1px_1px,var(--color-border)_1px,transparent_0)] [background-size:22px_22px]" />
        
        <DialogTitle className="sr-only">Nova publicação para a comunidade</DialogTitle>

        <form
          onSubmit={handleSubmit}
          className="relative z-10 h-full overflow-y-auto px-5 sm:px-10 py-8 sm:py-10"
        >
          {/* Cabeçalho solto, sem caixa própria */}
          <div className="mb-8 flex items-center gap-3.5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary-soft text-base font-bold text-primary shadow-md ring-4 ring-card">
              {initials(user?.name || "Você")}
            </span>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-foreground leading-tight">
                O que você quer compartilhar hoje?
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Cada ideia é um recorte no mural — sem cobranças, sem comparações.
              </p>
            </div>
          </div>

          {/* Mural de recortes coloridos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {/* Tipo */}
            <PinnedCard
              icon={Layers}
              theme="sage"
              label="Tipo de publicação"
              rotate="-rotate-1"
              className="sm:col-span-2"
            >
              <div className="grid grid-cols-3 gap-2.5">
                {TYPE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const t = THEMES[opt.theme];
                  const active = type === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setType(opt.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
                        active
                          ? `${t.active} scale-[1.04] font-bold`
                          : "border-border/70 bg-card/60 text-muted-foreground hover:bg-card"
                      }`}
                    >
                      <span
                        className={`grid h-8 w-8 place-items-center rounded-full transition-colors ${
                          active ? t.solid + " text-white" : "bg-secondary"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </PinnedCard>

            {/* Título */}
            <PinnedCard
              icon={Type}
              theme="olive"
              label="Título"
              hint="Opcional, mas acolhedor"
              rotate="rotate-1"
              className="sm:col-span-2"
            >
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
                className="w-full rounded-xl border border-border bg-card/80 px-4 py-2.5 text-sm outline-none focus:border-chart-3 transition"
              />
            </PinnedCard>

            {/* Foto */}
            <PinnedCard
              icon={ImagePlus}
              theme="sand"
              label="Foto"
              hint="Opcional"
              rotate="rotate-2"
              className="sm:col-span-2"
            >
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
                    className="max-h-56 w-full object-cover"
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
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-chart-4/50 bg-card/40 py-7 text-sm font-medium text-muted-foreground transition hover:border-chart-4 hover:bg-card/70 hover:text-foreground cursor-pointer"
                >
                  <ImagePlus className="h-6 w-6 text-chart-4" />
                  <span>Adicionar uma foto</span>
                </button>
              )}
            </PinnedCard>

            {/* Texto principal */}
            <PinnedCard
              icon={AlignLeft}
              theme="primary"
              label="Relato ou descrição"
              hint="O coração da sua publicação"
              rotate="-rotate-2"
              className="sm:col-span-2"
            >
              <textarea
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Compartilhe como foi sua experiência, dicas ou reflexões..."
                className="w-full rounded-xl border border-border bg-card/80 px-4 py-3 text-sm outline-none focus:border-primary transition resize-none"
                required
              />
            </PinnedCard>

            {/* Campos específicos de receita */}
            {type === "receita" && (
              <PinnedCard
                icon={ChefHat}
                theme="accent"
                label="Detalhes da receita"
                hint="Ajude a comunidade a reproduzir"
                rotate="rotate-1"
                className="sm:col-span-2 lg:col-span-4"
              >
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                        Tempo
                      </label>
                      <input
                        className="w-full rounded-lg border border-border bg-card/80 px-2.5 py-1.5 text-xs"
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
                        className="w-full rounded-lg border border-border bg-card/80 px-2.5 py-1.5 text-xs"
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
                        className="w-full rounded-lg border border-border bg-card/80 px-2.5 py-1.5 text-xs"
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
                        className="w-full rounded-lg border border-border bg-card/80 px-2.5 py-1.5 text-xs"
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

                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                        Ingredientes (um por linha)
                      </label>
                      <textarea
                        rows={3}
                        className="w-full rounded-lg border border-border bg-card/80 px-2.5 py-1.5 text-xs resize-none"
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
                        className="w-full rounded-lg border border-border bg-card/80 px-2.5 py-1.5 text-xs resize-none"
                        value={stepsText}
                        onChange={(e) => setStepsText(e.target.value)}
                        placeholder={
                          "Misture os ingredientes secos\nAdicione o líquido aos poucos\nCozinhe por 5 minutos"
                        }
                      />
                    </div>
                  </div>
                </div>
              </PinnedCard>
            )}

            {/* Tags */}
            <PinnedCard
              icon={Tag}
              theme="warning"
              label="Tags"
              hint="Separadas por vírgula"
              rotate="rotate-2"
              className="sm:col-span-2 lg:col-span-2"
            >
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Café da manhã, Fibras, Praticidade"
                className="w-full rounded-xl border border-border bg-card/80 px-4 py-2.5 text-sm outline-none focus:border-warning transition"
              />
            </PinnedCard>

            {/* Ação: o próprio "publicar" é um recorte do mural */}
            <div
              className={`relative rounded-[1.75rem] border-2 border-accent/30 bg-gradient-to-br from-accent to-accent/80 p-5 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-xl -rotate-1 sm:col-span-2 lg:col-span-2 flex flex-col items-center justify-center text-center gap-3`}
            >
              <span className="absolute -top-2.5 left-9 h-5 w-11 -rotate-6 rounded-[3px] bg-card/90 opacity-90 shadow-sm" />
              <p className="text-sm font-bold text-accent-foreground">
                Pronto para compartilhar? 🌱
              </p>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-white/95 px-6 py-2.5 text-sm font-bold text-accent shadow-soft transition-transform hover:scale-[1.04] cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Publicar no Espaço de Hoje</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="text-xs font-medium text-accent-foreground/80 hover:text-accent-foreground underline-offset-2 hover:underline cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

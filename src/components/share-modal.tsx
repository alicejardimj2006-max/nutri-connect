import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  SlidersHorizontal,
  Eye,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCommunity } from "@/hooks/use-community";
import {
  CATEGORIES,
  createCommunity,
  createCommunityPost,
  initials,
  isCommunityAdmin,
  normalizeBlockOrder,
  type Post,
  type PostBlock,
  RECIPE_CATEGORIES,
  type PostType,
} from "@/lib/community";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageEditor, type ImageEdits } from "@/components/image-editor";
import { PostCard } from "@/components/community-cards";

const THEMES = {
  accent: {
    wash: "from-[color-mix(in_oklab,var(--color-accent)_38%,var(--color-card))] to-card",
    border: "border-accent",
    tape: "bg-accent",
    badge: "bg-accent text-accent-foreground",
    active: "border-accent bg-accent text-accent-foreground shadow-md",
    solid: "bg-accent",
  },
  primary: {
    wash: "from-[color-mix(in_oklab,var(--color-primary)_38%,var(--color-card))] to-card",
    border: "border-primary",
    tape: "bg-primary",
    badge: "bg-primary text-primary-foreground",
    active: "border-primary bg-primary text-primary-foreground shadow-md",
    solid: "bg-primary",
  },
  olive: {
    wash: "from-[color-mix(in_oklab,var(--color-chart-3)_48%,var(--color-card))] to-card",
    border: "border-chart-3",
    tape: "bg-chart-3",
    badge: "bg-chart-3 text-white",
    active: "border-chart-3 bg-chart-3 text-white shadow-md",
    solid: "bg-chart-3",
  },
  sand: {
    wash: "from-[color-mix(in_oklab,var(--color-chart-4)_48%,var(--color-card))] to-card",
    border: "border-chart-4",
    tape: "bg-chart-4",
    badge: "bg-chart-4 text-white",
    active: "border-chart-4 bg-chart-4 text-white shadow-md",
    solid: "bg-chart-4",
  },
  sage: {
    wash: "from-[color-mix(in_oklab,var(--color-chart-5)_48%,var(--color-card))] to-card",
    border: "border-chart-5",
    tape: "bg-chart-5",
    badge: "bg-chart-5 text-white",
    active: "border-chart-5 bg-chart-5 text-white shadow-md",
    solid: "bg-chart-5",
  },
  warning: {
    wash: "from-[color-mix(in_oklab,var(--color-warning)_48%,var(--color-card))] to-card",
    border: "border-warning",
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

const COMMUNITY_OPTION = {
  id: "comunidade",
  label: "Comunidade",
  icon: Users,
  theme: "olive",
} as const;

interface SortProps {
  block: PostBlock;
  dragging: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerEnd: (e: React.PointerEvent<HTMLDivElement>) => void;
}

/** Ordem inicial dos campos do post (título sempre antes do texto). */
/** Tempo mínimo segurando o card, no toque, para começar a arrastar. */
const LONG_PRESS_MS = 350;

const DEFAULT_ORDER: PostBlock[] = ["title", "image", "text", "recipe"];

/** Move `block` para a posição de `target`, mantendo o título antes do texto. */
function reorder(order: PostBlock[], block: PostBlock, target: PostBlock): PostBlock[] {
  if (block === target) return order;
  const next = order.filter((b) => b !== block);
  next.splice(order.indexOf(target), 0, block);
  if (block === "text" && next.indexOf("text") < next.indexOf("title")) {
    // O texto nunca passa à frente do título: fica logo depois dele.
    next.splice(next.indexOf("text"), 1);
    next.splice(next.indexOf("title") + 1, 0, "text");
  }
  return normalizeBlockOrder(next, DEFAULT_ORDER);
}

/** Largura da coluna do feed (max-w-2xl), em px: o card da prévia é montado nela e depois reduzido. */
const FEED_COLUMN_W = 672;

/** Mostra o conteúdo na largura real do feed, reduzido por `scale` (mesmas regras e proporções, em tamanho menor). */
function ScaledPreview({ children }: { children: React.ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [scale, setScale] = useState(0.7);
  // No celular o feed já tem a largura da tela: o card aparece em tamanho normal, sem redução.
  const [mobile, setMobile] = useState(() => window.innerWidth < 640);

  useLayoutEffect(() => {
    const update = () => {
      setMobile(window.innerWidth < 640);
      setScale(Math.min(0.7, (window.innerWidth - 48) / FEED_COLUMN_W));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setHeight(el.offsetHeight));
    observer.observe(el);
    setHeight(el.offsetHeight);
    return () => observer.disconnect();
  }, []);

  if (mobile) return <div className="w-[calc(100vw-2rem)]">{children}</div>;

  return (
    <div style={{ width: FEED_COLUMN_W * scale, height: height * scale }}>
      <div
        ref={innerRef}
        style={{ width: FEED_COLUMN_W, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {children}
      </div>
    </div>
  );
}

/** Um "recorte" independente preso ao mural — não uma linha de formulário. */
function PinnedCard({
  icon: Icon,
  theme,
  label,
  hint,
  rotate = "rotate-0",
  className = "",
  order,
  sort,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  theme: ThemeKey;
  label: string;
  hint?: string;
  rotate?: string;
  className?: string;
  /** Posição visual no mural (CSS order). */
  order?: number;
  /** Quando presente, o card pode ser arrastado (pela alça) para reordenar. */
  sort?: SortProps;
  children: React.ReactNode;
}) {
  const t = THEMES[theme];
  return (
    <div
      data-block={sort?.block}
      style={order === undefined ? undefined : { order }}
      onPointerDown={sort?.onPointerDown}
      onPointerMove={sort?.onPointerMove}
      onPointerUp={sort?.onPointerEnd}
      onPointerCancel={sort?.onPointerEnd}
      onContextMenu={sort ? (e) => e.preventDefault() : undefined}
      className={`relative rounded-[1.75rem] border-2 ${t.border} bg-gradient-to-br ${t.wash} p-5 shadow-md transition-all duration-300 hover:z-10 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-xl ${rotate} ${className} ${
        sort
          ? sort.dragging
            ? "z-30 cursor-grabbing select-none shadow-2xl"
            : "cursor-grab [-webkit-touch-callout:none]"
          : ""
      }`}
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
  const { communities, profiles } = useCommunity();
  const [open, setOpen] = useState(false);

  // Só usuários criam comunidades, e cada pessoa administra uma por vez.
  const isProfessional = profiles.find((p) => p.userId === user?.id)?.role === "profissional";
  const alreadyAdmin = !!user && isCommunityAdmin(user.id, communities);
  const communityBlockReason = isProfessional
    ? "Profissionais não criam comunidades: recebem convites para ser admin profissional."
    : alreadyAdmin
      ? "Você já administra uma comunidade. Cada pessoa administra uma por vez."
      : null;
  const fileRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<PostType>("experiencia");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  // Foto original + ajustes: permitem reabrir o editor sem perder qualidade.
  const [imageOriginal, setImageOriginal] = useState<string | undefined>(undefined);
  const [imageEdits, setImageEdits] = useState<ImageEdits | undefined>(undefined);
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [isCommunity, setIsCommunity] = useState(false);

  // Ordem em que título, foto, texto e detalhes da receita aparecem na publicação
  const [blockOrder, setBlockOrder] = useState<PostBlock[]>(DEFAULT_ORDER);
  const formRef = useRef<HTMLFormElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [draggingBlock, setDraggingBlock] = useState<PostBlock | null>(null);
  const drag = useRef<{
    block: PostBlock;
    el: HTMLElement;
    sx: number;
    sy: number;
    gx: number;
    gy: number;
    px: number;
    py: number;
    active: boolean;
    lastSwap: number;
    timer?: number;
  } | null>(null);
  const snapshot = useRef<Map<HTMLElement, DOMRect> | null>(null);

  /** Mantém o card arrastado sob o cursor, mesmo depois que o layout muda. */
  const placeDragged = () => {
    const d = drag.current;
    if (!d?.active) return;
    d.el.style.transform = "";
    const r = d.el.getBoundingClientRect();
    d.el.style.transform = `translate(${d.px - d.gx - r.left}px, ${d.py - d.gy - r.top}px) scale(1.03)`;
  };

  // Os outros cards deslizam até o novo lugar quando a ordem muda ("empurrados").
  useLayoutEffect(() => {
    const before = snapshot.current;
    snapshot.current = null;
    if (before) {
      gridRef.current?.querySelectorAll<HTMLElement>("[data-block]").forEach((el) => {
        const old = before.get(el);
        if (!old || drag.current?.el === el) return;
        el.getAnimations().forEach((a) => a.cancel());
        const now = el.getBoundingClientRect();
        const dx = old.left - now.left;
        const dy = old.top - now.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        el.animate(
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }],
          { duration: 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        );
      });
    }
    placeDragged();
  }, [blockOrder]);

  /** Guarda a posição atual (visual) dos cards antes de reordenar, para animar a troca. */
  const captureRects = () => {
    const rects = new Map<HTMLElement, DOMRect>();
    gridRef.current
      ?.querySelectorAll<HTMLElement>("[data-block]")
      .forEach((el) => rects.set(el, el.getBoundingClientRect()));
    snapshot.current = rects;
  };

  /** Inicia o arrasto: o card passa a seguir o cursor/dedo. */
  const activateDrag = (d: NonNullable<typeof drag.current>) => {
    const r = d.el.getBoundingClientRect();
    d.gx = d.px - r.left;
    d.gy = d.py - r.top;
    d.active = true;
    d.el.getAnimations().forEach((a) => a.cancel());
    d.el.style.transition = "none";
    setDraggingBlock(d.block);
  };

  // Depois do toque longo, o dedo arrasta o card em vez de rolar o modal.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const block = (e: TouchEvent) => {
      if (drag.current?.active && e.cancelable) e.preventDefault();
    };
    grid.addEventListener("touchmove", block, { passive: false });
    return () => grid.removeEventListener("touchmove", block);
  }, [open]);

  const sortFor = (block: PostBlock): SortProps | undefined =>
    isCommunity
      ? undefined
      : {
          block,
          dragging: draggingBlock === block,
          onPointerDown: (e) => {
            if (e.button !== 0) return;
            const target = e.target as HTMLElement;
            if (target.closest("input, textarea, select, label, a, button")) return;
            const d = {
              block,
              el: e.currentTarget,
              sx: e.clientX,
              sy: e.clientY,
              gx: 0,
              gy: 0,
              px: e.clientX,
              py: e.clientY,
              active: false,
              lastSwap: 0,
              timer: undefined as number | undefined,
            };
            drag.current = d;
            e.currentTarget.setPointerCapture(e.pointerId);
            // No toque, é preciso segurar o card por um instante (senão o gesto é rolagem).
            if (e.pointerType === "touch") {
              d.timer = window.setTimeout(() => {
                if (drag.current !== d) return;
                navigator.vibrate?.(15);
                activateDrag(d);
                placeDragged();
              }, LONG_PRESS_MS);
            }
          },
          onPointerMove: (e) => {
            const d = drag.current;
            if (!d || d.block !== block) return;
            d.px = e.clientX;
            d.py = e.clientY;
            if (!d.active) {
              const moved = Math.hypot(d.px - d.sx, d.py - d.sy);
              if (e.pointerType === "touch") {
                // Mexeu o dedo antes do tempo: é rolagem, não arrasto.
                if (moved > 8) {
                  window.clearTimeout(d.timer);
                  drag.current = null;
                }
                return;
              }
              if (moved < 6) return;
              activateDrag(d);
            }
            const form = formRef.current;
            if (form) {
              const fr = form.getBoundingClientRect();
              if (d.py < fr.top + 60) form.scrollBy(0, -14);
              else if (d.py > fr.bottom - 60) form.scrollBy(0, 14);
            }
            placeDragged();
            if (Date.now() - d.lastSwap < 150) return;
            const over = Array.from(
              gridRef.current?.querySelectorAll<HTMLElement>("[data-block]") ?? [],
            ).find((el) => {
              if (el === d.el) return false;
              const r = el.getBoundingClientRect();
              return d.px >= r.left && d.px <= r.right && d.py >= r.top && d.py <= r.bottom;
            });
            if (over) {
              d.lastSwap = Date.now();
              captureRects();
              setBlockOrder((o) => reorder(o, block, over.dataset.block as PostBlock));
            }
          },
          onPointerEnd: () => {
            const d = drag.current;
            if (!d || d.block !== block) return;
            window.clearTimeout(d.timer);
            drag.current = null;
            if (!d.active) return;
            const el = d.el;
            const from = el.style.transform;
            el.style.transition = "";
            el.style.transform = "";
            el.animate([{ transform: from || "none" }, { transform: "translate(0, 0)" }], {
              duration: 240,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            });
            setDraggingBlock(null);
          },
        };
  const orderOf = (block: PostBlock) => blockOrder.indexOf(block);

  // Modo "Comunidade": reaproveita título (nome), texto (descrição) e foto (capa)
  const [communityCategory, setCommunityCategory] = useState<string>(CATEGORIES[0]);
  const [objective, setObjective] = useState("");

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
    setImageOriginal(undefined);
    setImageEdits(undefined);
    setEditorOpen(false);
    setPreviewOpen(false);
    setBlockOrder(DEFAULT_ORDER);
    setIngredientsText("");
    setStepsText("");
    setType("experiencia");
    setIsCommunity(false);
    setObjective("");
    setCommunityCategory(CATEGORIES[0]);
    setPrepTime("20 min");
    setServings("2 porções");
    setDifficulty("Fácil");
  };

  const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      setImageOriginal(src);
      setImageEdits(undefined);
      setImage(src);
      setEditorOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const buildRecipeData = () => {
    if (type !== "receita") return undefined;
    const lines = (value: string) =>
      value
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
    const ingredients = lines(ingredientsText);
    const steps = lines(stepsText);
    return {
      prepTime,
      servings,
      difficulty,
      category: recipeCategory,
      ingredients: ingredients.length > 0 ? ingredients : ["Ingredientes a gosto"],
      steps: steps.length > 0 ? steps : ["Misture com carinho e saboreie com calma."],
    };
  };

  /** Post fictício com o que está no formulário, para a pré-visualização. */
  const buildPreviewPost = (): Post => ({
    id: "preview",
    type,
    authorId: user?.id ?? "guest",
    authorName: user?.name ?? "Você",
    title: title.trim() || undefined,
    text: text.trim() || "Aqui vai aparecer o seu relato…",
    image,
    tags: [],
    createdAt: new Date().toISOString(),
    pinned: false,
    likes: [],
    supports: [],
    preparedBy: [],
    comments: [],
    recipeData: buildRecipeData(),
    blockOrder: normalizeBlockOrder(blockOrder, DEFAULT_ORDER),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Você precisa estar conectado para compartilhar.");
      return;
    }
    if (isCommunity) {
      if (!title.trim() || !text.trim()) {
        toast.error("Preencha o nome e a descrição da comunidade.");
        return;
      }
      try {
        createCommunity({
          name: title.trim(),
          description: text.trim(),
          objective: objective.trim(),
          coverImage: image ?? "",
          category: communityCategory,
          actor: { id: user.id, name: user.name },
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Não foi possível criar a comunidade.");
        return;
      }
      toast.success(
        "Comunidade enviada! Ela passa a existir quando um profissional aceitar ser o admin profissional.",
      );
      setOpen(false);
      resetForm();
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

    const recipeData = buildRecipeData();

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
        blockOrder: normalizeBlockOrder(blockOrder, DEFAULT_ORDER),
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
      <DialogContent className="w-[95vw] max-w-6xl h-[92vh] max-h-[880px] gap-0 rounded-[2.5rem] border-border/50 p-0 overflow-hidden bg-gradient-to-br from-[color-mix(in_oklab,var(--color-primary)_20%,var(--color-background))] via-[color-mix(in_oklab,var(--color-accent)_14%,var(--color-background))] to-[color-mix(in_oklab,var(--color-chart-4)_20%,var(--color-background))]">
        {/* Padrão de pontos sutil para textura, sem lavar as cores do mural */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_1px_1px,var(--color-border)_1px,transparent_0)] [background-size:22px_22px]" />

        <DialogTitle className="sr-only">
          {isCommunity ? "Nova comunidade" : "Nova publicação para a comunidade"}
        </DialogTitle>

        <form
          ref={formRef}
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
                {isCommunity ? "Vamos criar uma comunidade?" : "O que você quer compartilhar hoje?"}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {isCommunity
                  ? "Sua comunidade é criada e ativada na hora."
                  : "Cada ideia é um recorte no mural — sem cobranças, sem comparações."}
              </p>
            </div>
          </div>

          {/* Mural de recortes coloridos */}
          <div
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10"
          >
            {/* Tipo */}
            <PinnedCard
              icon={Layers}
              theme="sage"
              label="O que criar"
              rotate="-rotate-1"
              className="sm:col-span-2"
              order={-1}
            >
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {[...TYPE_OPTIONS, COMMUNITY_OPTION].map((opt) => {
                  const Icon = opt.icon;
                  const t = THEMES[opt.theme];
                  const active =
                    opt.id === "comunidade" ? isCommunity : !isCommunity && type === opt.id;
                  const blocked = opt.id === "comunidade" && !!communityBlockReason;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={blocked}
                      title={blocked ? (communityBlockReason ?? undefined) : undefined}
                      onClick={() => {
                        if (opt.id === "comunidade") {
                          setIsCommunity(true);
                        } else {
                          setIsCommunity(false);
                          setType(opt.id);
                        }
                      }}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs font-medium transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                        active
                          ? `${t.active} scale-[1.04] font-bold`
                          : "border-border bg-card text-muted-foreground hover:bg-secondary"
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
              {communityBlockReason && (
                <p className="mt-2.5 text-[11px] leading-snug text-muted-foreground">
                  {communityBlockReason}
                </p>
              )}
            </PinnedCard>

            {/* Título */}
            <PinnedCard
              icon={Type}
              theme="olive"
              label={isCommunity ? "Nome da comunidade" : "Título"}
              hint={isCommunity ? "Como ela vai aparecer para todos" : "Opcional, mas acolhedor"}
              rotate="rotate-1"
              className="sm:col-span-2"
              order={orderOf("title")}
              sort={sortFor("title")}
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required={isCommunity}
                placeholder={
                  isCommunity
                    ? "Ex: Café da manhã sem pressa"
                    : type === "receita"
                      ? "Ex: Panqueca de banana com 3 ingredientes"
                      : type === "experiencia"
                        ? "Ex: O que aprendi cozinhando minhas refeições da semana"
                        : "Ex: Como vocês lidam com a vontade de comer doce à noite?"
                }
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-chart-3 transition"
              />
            </PinnedCard>

            {/* Foto */}
            <PinnedCard
              icon={ImagePlus}
              theme="sand"
              label={isCommunity ? "Capa" : "Foto"}
              hint="Opcional"
              rotate="rotate-2"
              className="sm:col-span-2"
              order={orderOf("image")}
              sort={sortFor("image")}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePickImage}
              />
              {image ? (
                <div className="relative mx-auto w-fit max-w-full overflow-hidden rounded-2xl border border-border">
                  <img
                    src={image}
                    alt="Prévia da imagem da publicação"
                    className="block h-auto max-h-72 w-auto max-w-full"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditorOpen(true)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full bg-black/60 px-3 text-xs font-medium text-white transition hover:bg-black/80 cursor-pointer"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" /> Ajustar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImage(undefined);
                        setImageOriginal(undefined);
                        setImageEdits(undefined);
                      }}
                      className="grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white transition hover:bg-black/80 cursor-pointer"
                      aria-label="Remover imagem"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-chart-4 bg-card py-7 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground cursor-pointer"
                >
                  <ImagePlus className="h-6 w-6 text-chart-4" />
                  <span>{isCommunity ? "Adicionar uma capa" : "Adicionar uma foto"}</span>
                </button>
              )}
            </PinnedCard>

            {/* Texto principal */}
            <PinnedCard
              icon={AlignLeft}
              theme="primary"
              label={isCommunity ? "Descrição" : "Relato ou descrição"}
              hint={
                isCommunity ? "Sobre o que a comunidade conversa?" : "O coração da sua publicação"
              }
              rotate="-rotate-2"
              className="sm:col-span-2"
              order={orderOf("text")}
              sort={sortFor("text")}
            >
              <textarea
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  isCommunity
                    ? "Explique o tema e para quem é esta comunidade..."
                    : "Compartilhe como foi sua experiência, dicas ou reflexões..."
                }
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary transition resize-none"
                required
              />
            </PinnedCard>

            {/* Campos específicos de receita */}
            {!isCommunity && type === "receita" && (
              <PinnedCard
                icon={ChefHat}
                theme="accent"
                label="Detalhes da receita"
                hint="Ajude a comunidade a reproduzir"
                rotate="rotate-1"
                className="sm:col-span-2 lg:col-span-4"
                order={orderOf("recipe")}
                sort={sortFor("recipe")}
              >
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                        Tempo
                      </label>
                      <input
                        className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs"
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
                        className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs"
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
                        className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs"
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
                        className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs"
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
                        className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs resize-none"
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
                        className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs resize-none"
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

            {isCommunity ? (
              <>
                <PinnedCard
                  icon={Layers}
                  theme="warning"
                  label="Categoria"
                  hint="Ajuda as pessoas a encontrarem a comunidade"
                  rotate="rotate-2"
                  className="sm:col-span-2 lg:col-span-2"
                  order={10}
                >
                  <select
                    value={communityCategory}
                    onChange={(e) => setCommunityCategory(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-warning transition"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </PinnedCard>

                <PinnedCard
                  icon={Sparkles}
                  theme="accent"
                  label="Objetivo"
                  hint="Opcional"
                  rotate="-rotate-1"
                  className="sm:col-span-2 lg:col-span-2"
                  order={10}
                >
                  <textarea
                    rows={3}
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="Qual o objetivo prático desta comunidade?"
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-accent transition resize-none"
                  />
                </PinnedCard>
              </>
            ) : (
              <PinnedCard
                icon={Tag}
                theme="warning"
                label="Tags"
                hint="Separadas por vírgula"
                rotate="rotate-2"
                className="sm:col-span-2 lg:col-span-2"
                order={10}
              >
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Café da manhã, Fibras, Praticidade"
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-warning transition"
                />
              </PinnedCard>
            )}

            {/* Ação: o próprio "publicar" é um recorte do mural */}
            <div
              className={`relative rounded-[1.75rem] border-2 border-accent bg-gradient-to-br from-accent to-[color-mix(in_oklab,var(--color-accent)_70%,black)] p-5 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-xl -rotate-1 sm:col-span-2 lg:col-span-2 flex flex-col items-center justify-center text-center gap-3`}
              style={{ order: 11 }}
            >
              <span className="absolute -top-2.5 left-9 h-5 w-11 -rotate-6 rounded-[3px] bg-card shadow-sm" />
              <p className="text-sm font-bold text-accent-foreground">
                {isCommunity ? "Pronto para criar? 🌱" : "Pronto para compartilhar? 🌱"}
              </p>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-accent shadow-soft transition-transform hover:scale-[1.04] cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>{isCommunity ? "Criar comunidade" : "Publicar no Espaço de Hoje"}</span>
              </button>
              {!isCommunity && (
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/70 px-5 py-2 text-xs font-bold text-accent-foreground transition hover:bg-white/15 cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                  <span>Pré-visualizar</span>
                </button>
              )}
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

        {/* Fora do <form>/mural: eventos dos diálogos não devem chegar aos cards */}
        {imageOriginal && (
          <ImageEditor
            open={editorOpen}
            src={imageOriginal}
            initial={imageEdits}
            onCancel={() => setEditorOpen(false)}
            onApply={(dataUrl, edits) => {
              setImage(dataUrl);
              setImageEdits(edits);
              setEditorOpen(false);
            }}
          />
        )}

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          {/* Sem moldura: só o card, montado na largura do feed e reduzido */}
          <DialogContent className="max-h-[94dvh] w-fit max-w-[calc(100vw-2rem)] gap-2 overflow-y-auto border-0 bg-transparent p-0 shadow-none sm:rounded-none sm:p-1 [&>button.absolute]:hidden">
            <div className="flex items-center justify-between gap-3 px-1 text-white">
              <DialogTitle className="text-sm font-bold">Pré-visualização</DialogTitle>
              <DialogDescription className="sr-only">
                Assim a publicação vai aparecer no feed.
              </DialogDescription>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium transition hover:bg-white/25 cursor-pointer"
              >
                Fechar
              </button>
            </div>
            {previewOpen && (
              <div
                className="select-none"
                onClickCapture={(e) => {
                  // Só o "Ver mais/Ver menos" funciona; links e ações não fazem nada na prévia.
                  const target = e.target as HTMLElement;
                  if (target.closest("[aria-expanded]")) return;
                  if (target.closest("a, button")) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              >
                <ScaledPreview>
                  <PostCard post={buildPreviewPost()} />
                </ScaledPreview>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

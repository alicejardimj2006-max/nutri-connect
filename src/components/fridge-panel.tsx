// "O que tem na geladeira?" (N4): ingredientes (digitados, de um toque ou pela foto), 3 ideias da
// Nina com aproveitamento integral, receitas da comunidade com os mesmos ingredientes e
// "Minhas receitas". O que falta vai para a lista de compras da conta.
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  BookmarkPlus,
  CalendarDays,
  Camera,
  ChefHat,
  Clock,
  Leaf,
  Loader2,
  Plus,
  Share2,
  ShoppingBasket,
  Sparkles,
  Sprout,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { ShareModal } from "@/components/share-modal";
import { useTr } from "@/components/settings-ui";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { fileToDataUrl } from "@/lib/image";
import { cn } from "@/lib/utils";
import {
  COMMON_INGREDIENTS,
  fridgeItemsKey,
  readFridgeItems,
  useAddShoppingItems,
  useCommunityRecipes,
  useDeleteSavedRecipe,
  useSaveRecipe,
  useSavedRecipes,
  type CommunityRecipe,
  type SavedRecipe,
} from "@/lib/fridge";
import {
  FRIDGE_DAILY_LIMIT,
  readFridgePhoto,
  suggestFridgeRecipes,
  type FridgeError,
  type FridgeRecipe,
} from "@/lib/fridge.functions";
import type { Names } from "@/lib/appearance-data";
import { useSeasonUf } from "@/lib/season";
import { seasonFoods } from "@/lib/season-data";

const card = "rounded-3xl border border-border/70 bg-card p-5 shadow-xs";
const chip =
  "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition";
const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50";
const btnSoft =
  "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-secondary disabled:opacity-50";

const ERRORS: Record<FridgeError, Names> = {
  limit: [
    `A Nina já ajudou ${FRIDGE_DAILY_LIMIT} vezes na cozinha hoje. Amanhã tem mais!`,
    `Nina has helped ${FRIDGE_DAILY_LIMIT} times in the kitchen today. More tomorrow!`,
    `Nina ya ayudó ${FRIDGE_DAILY_LIMIT} veces en la cocina hoy. ¡Mañana hay más!`,
    `Nina a déjà aidé ${FRIDGE_DAILY_LIMIT} fois en cuisine aujourd'hui. À demain !`,
  ],
  unavailable: [
    "A Nina não está disponível agora.",
    "Nina isn't available right now.",
    "Nina no está disponible ahora.",
    "Nina n'est pas disponible pour le moment.",
  ],
  image: [
    "Não deu para usar essa foto. Tente outra.",
    "This photo couldn't be used. Try another.",
    "No se pudo usar esta foto. Prueba otra.",
    "Cette photo n'a pas pu être utilisée. Essayez-en une autre.",
  ],
  failed: [
    "A Nina não conseguiu montar as receitas. Tente de novo.",
    "Nina couldn't put the recipes together. Try again.",
    "Nina no pudo armar las recetas. Inténtalo de nuevo.",
    "Nina n'a pas pu préparer les recettes. Réessayez.",
  ],
};

/** Lista de ingredientes guardada neste aparelho (comodidade: volta como estava). */
function useIngredients(userId: string | undefined) {
  const [items, setItems] = useState<string[]>([]);
  useEffect(() => {
    if (userId) setItems(readFridgeItems(userId));
  }, [userId]);
  const save = (next: string[]) => {
    setItems(next);
    if (!userId) return;
    try {
      window.localStorage.setItem(fridgeItemsKey(userId), JSON.stringify(next));
    } catch {
      /* sem armazenamento */
    }
  };
  const add = (texts: string[]) => {
    const seen = new Set(items.map((i) => i.toLowerCase()));
    const fresh = texts
      .map((t) => t.trim().toLowerCase().slice(0, 40))
      .filter((t) => t && !seen.has(t) && (seen.add(t), true));
    if (fresh.length) save([...items, ...fresh].slice(0, 30));
    return fresh.length;
  };
  const remove = (t: string) => save(items.filter((i) => i !== t));
  return { items, add, remove, clear: () => save([]) };
}

// ───────────────────────────── Receita da Nina ─────────────────────────────

function RecipeCard({
  recipe,
  onSave,
  saved,
}: {
  recipe: FridgeRecipe;
  onSave: () => void;
  saved: boolean;
}) {
  const tr = useTr();
  const { user } = useAuth();
  const addShopping = useAddShoppingItems(user?.id);

  const sendMissing = () =>
    addShopping.mutate(
      { texts: recipe.missing, source: "geladeira" },
      {
        onSuccess: (n) =>
          toast.success(
            n
              ? tr([
                  `${n} item(ns) na sua lista de compras.`,
                  `${n} item(s) added to your shopping list.`,
                  `${n} artículo(s) en tu lista de compras.`,
                  `${n} article(s) ajouté(s) à votre liste de courses.`,
                ])
              : tr([
                  "Esses itens já estavam na lista.",
                  "Those items were already on the list.",
                  "Esos artículos ya estaban en la lista.",
                  "Ces articles étaient déjà dans la liste.",
                ]),
          ),
        onError: (err) => toast.error((err as Error).message),
      },
    );

  return (
    <article className={cn(card, "flex flex-col")}>
      <h3 className="text-base font-bold text-foreground">{recipe.title}</h3>
      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        {recipe.prepTime && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {recipe.prepTime}
          </span>
        )}
        {recipe.servings && (
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {recipe.servings}
          </span>
        )}
        {recipe.utensils.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <ChefHat className="h-3.5 w-3.5" /> {recipe.utensils.join(", ")}
          </span>
        )}
      </p>

      {recipe.missing.length === 0 ? (
        <p className="mt-3 rounded-xl bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary">
          {tr([
            "Dá para fazer só com o que você tem!",
            "You can make it with what you have!",
            "¡Se puede hacer solo con lo que tienes!",
            "Faisable avec ce que vous avez !",
          ])}
        </p>
      ) : (
        <p className="mt-3 rounded-xl bg-secondary/60 px-3 py-1.5 text-[11px] text-foreground">
          {tr(["Faltaria: ", "You'd need: ", "Faltaría: ", "Il manquerait : "])}
          <strong>{recipe.missing.join(", ")}</strong>
        </p>
      )}

      <h4 className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {tr(["Ingredientes", "Ingredients", "Ingredientes", "Ingrédients"])}
      </h4>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-foreground">
        {recipe.ingredients.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>

      <h4 className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {tr(["Modo de preparo", "Method", "Preparación", "Préparation"])}
      </h4>
      <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-foreground">
        {recipe.steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>

      {recipe.tip && (
        <p className="mt-4 flex gap-2 rounded-2xl bg-accent-soft/50 px-3 py-2 text-xs leading-relaxed text-foreground">
          <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          {recipe.tip}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2 pt-1">
        <button type="button" onClick={onSave} disabled={saved} className={btnSoft}>
          <BookmarkPlus className="h-4 w-4" />
          {saved
            ? tr(["Guardada", "Saved", "Guardada", "Enregistrée"])
            : tr(["Guardar", "Save", "Guardar", "Enregistrer"])}
        </button>
        <ShareModal
          initialRecipe={{
            title: recipe.title,
            text: recipe.tip,
            prepTime: recipe.prepTime,
            servings: recipe.servings,
            ingredients: recipe.ingredients,
            steps: recipe.steps,
          }}
          triggerButton={
            <button type="button" className={btnSoft}>
              <Share2 className="h-4 w-4" />
              {tr(["Publicar", "Publish", "Publicar", "Publier"])}
            </button>
          }
        />
        {recipe.missing.length > 0 && (
          <button
            type="button"
            onClick={sendMissing}
            disabled={addShopping.isPending}
            className={btnSoft}
          >
            <ShoppingBasket className="h-4 w-4" />
            {tr([
              "Faltantes → lista de compras",
              "Missing → shopping list",
              "Faltantes → lista de compras",
              "Manquants → liste de courses",
            ])}
          </button>
        )}
      </div>
    </article>
  );
}

// ───────────────────────────── Comunidade ─────────────────────────────

function CommunityList({ terms }: { terms: string[] }) {
  const tr = useTr();
  const { user } = useAuth();
  const recipes = useCommunityRecipes(terms, !!user);
  const saved = useSavedRecipes(!!user);
  const save = useSaveRecipe(user?.id);
  const savedPosts = new Set((saved.data ?? []).map((s) => s.post_id).filter(Boolean));

  if (!terms.length) return null;
  const list = recipes.data ?? [];

  return (
    <section className="mt-8">
      <h2 className="text-sm font-bold font-display text-foreground">
        {tr([
          "Receitas da comunidade com o que você tem",
          "Community recipes with what you have",
          "Recetas de la comunidad con lo que tienes",
          "Recettes de la communauté avec ce que vous avez",
        ])}
      </h2>
      {recipes.isLoading ? (
        <Loader2 className="mt-3 h-5 w-5 animate-spin text-muted-foreground" />
      ) : list.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {tr([
            "Ainda não há receitas publicadas com esses ingredientes. Que tal ser a primeira pessoa?",
            "No published recipes with these ingredients yet. Why not be the first?",
            "Aún no hay recetas publicadas con estos ingredientes. ¿Por qué no ser la primera persona?",
            "Pas encore de recettes publiées avec ces ingrédients. Et si vous étiez le premier ?",
          ])}
        </p>
      ) : (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((r: CommunityRecipe) => (
            <li key={r.id} className={cn(card, "flex gap-3 p-3")}>
              {r.image_url ? (
                <img
                  src={r.image_url}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground">
                  <ChefHat className="h-6 w-6" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <Link
                  to="/explorar"
                  search={{ post: r.id }}
                  className="line-clamp-2 text-sm font-semibold text-foreground hover:underline"
                >
                  {r.title || tr(["Receita", "Recipe", "Receta", "Recette"])}
                </Link>
                <p className="text-[11px] text-muted-foreground">
                  {tr([
                    `usa ${r.matches} dos seus ingredientes`,
                    `uses ${r.matches} of your ingredients`,
                    `usa ${r.matches} de tus ingredientes`,
                    `utilise ${r.matches} de vos ingrédients`,
                  ])}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    save.mutate(
                      { source: "comunidade", post: r },
                      { onError: (err) => toast.error((err as Error).message) },
                    )
                  }
                  disabled={savedPosts.has(r.id) || save.isPending}
                  className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline disabled:text-muted-foreground disabled:no-underline"
                >
                  <BookmarkPlus className="h-3.5 w-3.5" />
                  {savedPosts.has(r.id)
                    ? tr(["Guardada", "Saved", "Guardada", "Enregistrée"])
                    : tr(["Guardar", "Save", "Guardar", "Enregistrer"])}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ───────────────────────────── Minhas receitas ─────────────────────────────

function SavedList() {
  const tr = useTr();
  const saved = useSavedRecipes();
  const remove = useDeleteSavedRecipe();
  const [open, setOpen] = useState<string | null>(null);
  const list = saved.data ?? [];

  if (saved.isLoading) return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
  if (!list.length)
    return (
      <p className={cn(card, "text-center text-sm text-muted-foreground")}>
        {tr([
          "Você ainda não guardou receitas. As que guardar aparecem aqui.",
          "You haven't saved any recipes yet. Saved ones show up here.",
          "Aún no guardaste recetas. Las que guardes aparecen aquí.",
          "Vous n'avez pas encore enregistré de recettes. Elles apparaîtront ici.",
        ])}
      </p>
    );

  return (
    <ul className="space-y-3">
      {list.map((s: SavedRecipe) => {
        const r = (s.recipe ?? {}) as Partial<FridgeRecipe>;
        const expanded = open === s.id;
        return (
          <li key={s.id} className={card}>
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : s.id)}
                className="min-w-0 flex-1 text-left"
                aria-expanded={expanded}
              >
                <p className="text-sm font-bold text-foreground">{s.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {s.source === "nina"
                    ? tr(["Ideia da Nina", "Nina's idea", "Idea de Nina", "Idée de Nina"])
                    : tr([
                        "Da comunidade",
                        "From the community",
                        "De la comunidad",
                        "De la communauté",
                      ])}
                  {r.prepTime ? ` · ${r.prepTime}` : ""}
                </p>
              </button>
              {s.post_id && (
                <Link
                  to="/explorar"
                  search={{ post: s.post_id }}
                  className="text-[11px] font-semibold text-accent hover:underline"
                >
                  {tr(["Abrir", "Open", "Abrir", "Ouvrir"])}
                </Link>
              )}
              <button
                type="button"
                onClick={() => remove.mutate(s.id)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label={tr(["Apagar", "Delete", "Borrar", "Supprimer"])}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {expanded && (
              <div className="mt-3 space-y-3 text-sm text-foreground">
                {!!r.ingredients?.length && (
                  <ul className="list-disc space-y-0.5 pl-5">
                    {r.ingredients.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                )}
                {!!r.steps?.length && (
                  <ol className="list-decimal space-y-1 pl-5">
                    {r.steps.map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ol>
                )}
                {r.tip && (
                  <p className="flex gap-2 rounded-2xl bg-accent-soft/50 px-3 py-2 text-xs">
                    <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {r.tip}
                  </p>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ───────────────────────────── Página ─────────────────────────────

export function FridgePanel() {
  const tr = useTr();
  const { locale } = useI18n();
  const { user } = useAuth();
  const ingredients = useIngredients(user?.id);
  const [tab, setTab] = useState<"ideias" | "guardadas">("ideias");
  const [draft, setDraft] = useState("");
  const [recipes, setRecipes] = useState<FridgeRecipe[]>([]);
  const [searched, setSearched] = useState<string[]>([]);
  const [busy, setBusy] = useState<"foto" | "receitas" | null>(null);
  const [used, setUsed] = useState<number | null>(null);
  const [savedTitles, setSavedTitles] = useState<Set<string>>(new Set());
  const save = useSaveRecipe(user?.id);
  const photo = useRef<HTMLInputElement>(null);

  const common = COMMON_INGREDIENTS.map((n) => tr(n).toLowerCase());
  const season = useSeasonUf();
  const seasonal = season.region
    ? seasonFoods(season.region, new Date().getMonth() + 1)
        .filter((x) => x.phase !== "ano-todo")
        .map((x) =>
          tr(x.food.name)
            .replace(/\s*\(.*\)$/, "")
            .toLowerCase(),
        )
        .filter((n) => !common.includes(n))
    : [];

  const addTyped = (e: FormEvent) => {
    e.preventDefault();
    ingredients.add(draft.split(/[,;\n]/));
    setDraft("");
  };

  const fromPhoto = async (file: File | undefined) => {
    if (photo.current) photo.current.value = "";
    if (!file) return;
    setBusy("foto");
    try {
      const image = await fileToDataUrl(file, 1280, 0.8);
      const res = await readFridgePhoto({ data: { image, locale } });
      if (res.used !== undefined) setUsed(res.used);
      if ("error" in res) toast.error(tr(ERRORS[res.error]));
      else if (!res.items.length)
        toast.error(
          tr([
            "Não encontrei alimentos na foto. Tente mais perto ou digite.",
            "No food found in the photo. Try closer or type them.",
            "No encontré alimentos en la foto. Prueba más cerca o escríbelos.",
            "Aucun aliment trouvé sur la photo. Rapprochez-vous ou saisissez-les.",
          ]),
        );
      else {
        const n = ingredients.add(res.items);
        toast.success(
          tr([
            `A Nina encontrou ${n} item(ns). Confira a lista antes de pedir as receitas.`,
            `Nina found ${n} item(s). Check the list before asking for recipes.`,
            `Nina encontró ${n} artículo(s). Revisa la lista antes de pedir recetas.`,
            `Nina a trouvé ${n} article(s). Vérifiez la liste avant de demander des recettes.`,
          ]),
        );
      }
    } catch (err) {
      console.error("geladeira foto", err);
      toast.error(tr(ERRORS.failed));
    } finally {
      setBusy(null);
    }
  };

  const ask = async () => {
    if (!ingredients.items.length) return;
    setBusy("receitas");
    try {
      const res = await suggestFridgeRecipes({ data: { ingredients: ingredients.items, locale } });
      if (res.used !== undefined) setUsed(res.used);
      if ("error" in res) toast.error(tr(ERRORS[res.error]));
      else {
        setRecipes(res.recipes);
        setSearched(ingredients.items);
        setSavedTitles(new Set());
      }
    } catch (err) {
      console.error("geladeira receitas", err);
      toast.error(tr(ERRORS.failed));
    } finally {
      setBusy(null);
    }
  };

  const saveNina = (r: FridgeRecipe) =>
    save.mutate(
      { source: "nina", recipe: r },
      {
        onSuccess: () => {
          setSavedTitles((s) => new Set(s).add(r.title));
          toast.success(
            tr(["Receita guardada.", "Recipe saved.", "Receta guardada.", "Recette enregistrée."]),
          );
        },
        onError: (err) => toast.error((err as Error).message),
      },
    );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-foreground">
            {tr([
              "O que tem na geladeira?",
              "What's in the fridge?",
              "¿Qué hay en la nevera?",
              "Qu'y a-t-il dans le frigo ?",
            ])}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {tr([
              "Conte o que você tem em casa e a Nina sugere receitas simples, aproveitando tudo: talos, cascas e sobras.",
              "Tell what you have at home and Nina suggests simple recipes that use everything: stems, peels and leftovers.",
              "Cuenta lo que tienes en casa y Nina sugiere recetas simples aprovechándolo todo: tallos, cáscaras y sobras.",
              "Dites ce que vous avez et Nina propose des recettes simples qui utilisent tout : tiges, épluchures et restes.",
            ])}
          </p>
          <Link
            to="/cardapio"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
          >
            <CalendarDays className="h-4 w-4" />
            {tr([
              "Planejar a semana no Cardápio →",
              "Plan the week in the Menu →",
              "Planear la semana en el Menú →",
              "Planifier la semaine dans le Menu →",
            ])}
          </Link>
        </div>
        <div className="flex gap-1 rounded-full border border-border/60 bg-card p-1">
          {(
            [
              ["ideias", ["Ideias", "Ideas", "Ideas", "Idées"]],
              ["guardadas", ["Minhas receitas", "My recipes", "Mis recetas", "Mes recettes"]],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition",
                tab === id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tr(label)}
            </button>
          ))}
        </div>
      </header>

      {tab === "guardadas" ? (
        <SavedList />
      ) : (
        <>
          <section className={card}>
            <h2 className="text-sm font-bold text-foreground">
              {tr([
                "O que você tem em casa",
                "What you have at home",
                "Lo que tienes en casa",
                "Ce que vous avez",
              ])}
            </h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {ingredients.items.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  {tr([
                    "Toque nos itens abaixo, digite ou tire uma foto.",
                    "Tap the items below, type or take a photo.",
                    "Toca los artículos de abajo, escribe o toma una foto.",
                    "Touchez les éléments ci-dessous, saisissez ou prenez une photo.",
                  ])}
                </span>
              )}
              {ingredients.items.map((i) => (
                <span key={i} className={cn(chip, "border-accent bg-accent-soft text-foreground")}>
                  {i}
                  <button
                    type="button"
                    onClick={() => ingredients.remove(i)}
                    aria-label={tr(["Tirar", "Remove", "Quitar", "Retirer"])}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              {ingredients.items.length > 1 && (
                <button
                  type="button"
                  onClick={ingredients.clear}
                  className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                >
                  {tr(["Limpar", "Clear", "Limpiar", "Effacer"])}
                </button>
              )}
            </div>

            <form onSubmit={addTyped} className="mt-4 flex flex-wrap gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={200}
                placeholder={tr([
                  "Ex.: abóbora, espinafre, sobra de arroz",
                  "E.g. pumpkin, spinach, leftover rice",
                  "Ej.: calabaza, espinaca, arroz sobrante",
                  "Ex. : potiron, épinards, reste de riz",
                ])}
                className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              />
              <button type="submit" className={btnSoft} disabled={!draft.trim()}>
                <Plus className="h-4 w-4" /> {tr(["Adicionar", "Add", "Agregar", "Ajouter"])}
              </button>
              <button
                type="button"
                className={btnSoft}
                onClick={() => photo.current?.click()}
                disabled={busy !== null}
              >
                {busy === "foto" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                {tr(["Foto da geladeira", "Fridge photo", "Foto de la nevera", "Photo du frigo"])}
              </button>
              <input
                ref={photo}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                className="hidden"
                onChange={(e) => void fromPhoto(e.target.files?.[0])}
              />
            </form>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {common
                .filter((c) => !ingredients.items.includes(c))
                .map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => ingredients.add([c])}
                    className={cn(
                      chip,
                      "border-dashed border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Plus className="h-3 w-3" /> {c}
                  </button>
                ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                <Sprout className="h-3.5 w-3.5 text-primary" />
                {tr(["Da estação:", "In season:", "De temporada:", "De saison :"])}
              </span>
              {season.region ? (
                seasonal
                  .filter((c) => !ingredients.items.includes(c))
                  .map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => ingredients.add([c])}
                      className={cn(
                        chip,
                        "border-dashed border-primary/40 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Plus className="h-3 w-3" /> {c}
                    </button>
                  ))
              ) : (
                <Link to="/feira" className="text-[11px] font-semibold text-accent hover:underline">
                  {tr([
                    "escolha seu estado no Calendário da feira →",
                    "pick your state in the Market calendar →",
                    "elige tu estado en el Calendario de feria →",
                    "choisissez votre État dans le Calendrier du marché →",
                  ])}
                </Link>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border/60 pt-4">
              <button
                type="button"
                onClick={() => void ask()}
                disabled={!ingredients.items.length || busy !== null}
                className={btnPrimary}
              >
                {busy === "receitas" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {busy === "receitas"
                  ? tr([
                      "A Nina está pensando…",
                      "Nina is thinking…",
                      "Nina está pensando…",
                      "Nina réfléchit…",
                    ])
                  : tr([
                      "Pedir ideias à Nina",
                      "Ask Nina for ideas",
                      "Pedir ideas a Nina",
                      "Demander des idées à Nina",
                    ])}
              </button>
              <span className="text-[11px] text-muted-foreground">
                {used !== null &&
                  `${used}/${FRIDGE_DAILY_LIMIT} ${tr(["hoje", "today", "hoy", "aujourd'hui"])} · `}
                {tr([
                  "Sem calorias. Se você autorizou a Nina, ela respeita suas alergias e restrições.",
                  "No calories. If you allowed Nina, she respects your allergies and restrictions.",
                  "Sin calorías. Si autorizaste a Nina, respeta tus alergias y restricciones.",
                  "Sans calories. Si vous l'avez autorisée, Nina respecte vos allergies et restrictions.",
                ])}
              </span>
            </div>
          </section>

          {recipes.length > 0 && (
            <section className="mt-6 grid gap-4 lg:grid-cols-3">
              {recipes.map((r) => (
                <RecipeCard
                  key={r.title}
                  recipe={r}
                  onSave={() => saveNina(r)}
                  saved={savedTitles.has(r.title)}
                />
              ))}
            </section>
          )}

          <CommunityList terms={searched.length ? searched : ingredients.items} />
        </>
      )}
    </div>
  );
}

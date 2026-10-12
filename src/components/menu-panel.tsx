// Cardápio da semana (N3): a Nina monta almoço e jantar de segunda a domingo dentro de uma faixa
// de orçamento, a pessoa troca o que quiser (outra ideia, uma receita guardada ou escrevendo) e a
// semana vira uma lista de compras única, agrupada por seção, na lista da conta.
import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Backpack,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Leaf,
  Loader2,
  Pencil,
  Refrigerator,
  RefreshCw,
  ShoppingBasket,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useTr } from "@/components/settings-ui";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";
import { useSeasonNow } from "@/lib/season";
import type { Names } from "@/lib/appearance-data";
import {
  readFridgeItems,
  useAddShoppingItems,
  useDeleteShoppingItems,
  useSavedRecipes,
  useShoppingItems,
  useUpdateShoppingItem,
  type SavedRecipe,
} from "@/lib/fridge";
import {
  BUDGETS,
  MEALS,
  MENU_DAILY_LIMIT,
  SECTIONS,
  buildShoppingList,
  suggestMenu,
  type Budget,
  type MealKey,
  type MenuError,
  type MenuMeal,
  type Section,
} from "@/lib/menu.functions";
import {
  BUDGET_NAMES,
  DAY_NAMES,
  MEAL_NAMES,
  SECTION_NAMES,
  addWeeks,
  dayDate,
  mondayOf,
  slotKey,
  useSaveMenu,
  menuKey,
  useWeeklyMenu,
  type WeeklyMenu,
  type MenuMeals,
} from "@/lib/menu";

const card = "rounded-3xl border border-border/70 bg-card p-5 shadow-xs";
const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50";
const btnSoft =
  "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-secondary disabled:opacity-50";
const iconBtn =
  "rounded-full p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-50";

const ERRORS: Record<MenuError, Names> = {
  limit: [
    `A Nina já ajudou ${MENU_DAILY_LIMIT} vezes com o cardápio hoje. Amanhã tem mais!`,
    `Nina has helped ${MENU_DAILY_LIMIT} times with the menu today. More tomorrow!`,
    `Nina ya ayudó ${MENU_DAILY_LIMIT} veces con el menú hoy. ¡Mañana hay más!`,
    `Nina a déjà aidé ${MENU_DAILY_LIMIT} fois pour le menu aujourd'hui. À demain !`,
  ],
  unavailable: [
    "A Nina não está disponível agora.",
    "Nina isn't available right now.",
    "Nina no está disponible ahora.",
    "Nina n'est pas disponible pour le moment.",
  ],
  image: [
    "A Nina não conseguiu responder. Tente de novo.",
    "Nina couldn't answer. Try again.",
    "Nina no pudo responder. Inténtalo de nuevo.",
    "Nina n'a pas pu répondre. Réessayez.",
  ],
  failed: [
    "A Nina não conseguiu montar agora. Tente de novo.",
    "Nina couldn't put it together. Try again.",
    "Nina no pudo armarlo ahora. Inténtalo de nuevo.",
    "Nina n'a pas pu le préparer. Réessayez.",
  ],
};

/** Receita guardada (da Nina ou da comunidade) no formato do cardápio. */
function fromSaved(s: SavedRecipe): MenuMeal {
  const r = (s.recipe ?? {}) as Record<string, unknown>;
  const list = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  const text = (v: unknown) => (typeof v === "string" ? v : "");
  return {
    title: s.title,
    prepTime: text(r.prepTime),
    servings: text(r.servings),
    ingredients: list(r.ingredients),
    steps: list(r.steps),
    tip: text(r.tip),
    source: "minhas",
  };
}

// ───────────────────────────── Uma refeição ─────────────────────────────

function SlotCard({
  label,
  meal,
  busy,
  disabled,
  saved,
  onAsk,
  onSet,
}: {
  label: string;
  meal: MenuMeal | undefined;
  busy: boolean;
  disabled: boolean;
  saved: SavedRecipe[];
  onAsk: () => void;
  onSet: (meal: MenuMeal | null) => void;
}) {
  const tr = useTr();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"ver" | "escrever" | "minhas" | null>(null);
  const [draft, setDraft] = useState("");

  const write = (e: FormEvent) => {
    e.preventDefault();
    const title = draft.trim().slice(0, 120);
    if (!title) return;
    onSet({
      title,
      prepTime: "",
      servings: "",
      ingredients: [],
      steps: [],
      tip: "",
      source: "manual",
    });
    setDraft("");
    setMode(null);
  };

  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-border/60 bg-background/60 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      {busy ? (
        <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {tr([
            "A Nina está pensando…",
            "Nina is thinking…",
            "Nina está pensando…",
            "Nina réfléchit…",
          ])}
        </p>
      ) : meal ? (
        <>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="mt-1 text-left text-sm font-semibold text-foreground hover:underline"
          >
            {meal.title}
          </button>
          {meal.prepTime && (
            <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" /> {meal.prepTime}
            </p>
          )}
          {open && (meal.ingredients.length > 0 || meal.steps.length > 0) && (
            <div className="mt-2 space-y-2 text-xs text-foreground">
              {meal.ingredients.length > 0 && (
                <ul className="list-disc space-y-0.5 pl-4">
                  {meal.ingredients.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              )}
              {meal.steps.length > 0 && (
                <ol className="list-decimal space-y-0.5 pl-4">
                  {meal.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
              )}
              {meal.tip && (
                <p className="flex gap-1.5 rounded-xl bg-accent-soft/50 px-2 py-1.5">
                  <Leaf className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                  {meal.tip}
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">
          {tr(["Ainda vazio", "Still empty", "Aún vacío", "Encore vide"])}
        </p>
      )}

      {mode === "escrever" && (
        <form onSubmit={write} className="mt-2 flex gap-1.5">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={120}
            placeholder={tr([
              "Ex.: arroz, feijão e omelete",
              "E.g. rice, beans and omelette",
              "Ej.: arroz, frijoles y tortilla",
              "Ex. : riz, haricots et omelette",
            ])}
            className="min-w-0 flex-1 rounded-full border border-border bg-background px-3 py-1 text-xs"
          />
          <button type="submit" className={btnSoft} disabled={!draft.trim()}>
            OK
          </button>
        </form>
      )}
      {mode === "minhas" && (
        <select
          autoFocus
          defaultValue=""
          onChange={(e) => {
            const s = saved.find((x) => x.id === e.target.value);
            if (s) onSet(fromSaved(s));
            setMode(null);
          }}
          className="mt-2 w-full rounded-full border border-border bg-background px-3 py-1 text-xs"
          aria-label={tr(["Minhas receitas", "My recipes", "Mis recetas", "Mes recettes"])}
        >
          <option value="" disabled>
            {saved.length
              ? tr([
                  "Escolha uma receita guardada",
                  "Pick a saved recipe",
                  "Elige una receta guardada",
                  "Choisissez une recette",
                ])
              : tr([
                  "Nenhuma receita guardada ainda",
                  "No saved recipes yet",
                  "Aún no hay recetas guardadas",
                  "Aucune recette enregistrée",
                ])}
          </option>
          {saved.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-0.5 pt-2">
        <button
          type="button"
          onClick={onAsk}
          disabled={disabled}
          className={iconBtn}
          title={tr([
            "Outra ideia da Nina",
            "Another idea from Nina",
            "Otra idea de Nina",
            "Une autre idée de Nina",
          ])}
          aria-label={tr([
            "Outra ideia da Nina",
            "Another idea from Nina",
            "Otra idea de Nina",
            "Une autre idée de Nina",
          ])}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "minhas" ? null : "minhas")}
          className={iconBtn}
          title={tr([
            "Das minhas receitas",
            "From my recipes",
            "De mis recetas",
            "De mes recettes",
          ])}
          aria-label={tr([
            "Das minhas receitas",
            "From my recipes",
            "De mis recetas",
            "De mes recettes",
          ])}
        >
          <BookOpen className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "escrever" ? null : "escrever")}
          className={iconBtn}
          title={tr(["Escrever", "Write", "Escribir", "Écrire"])}
          aria-label={tr(["Escrever", "Write", "Escribir", "Écrire"])}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        {meal && (
          <button
            type="button"
            onClick={() => onSet(null)}
            className={iconBtn}
            title={tr(["Tirar", "Remove", "Quitar", "Retirer"])}
            aria-label={tr(["Tirar", "Remove", "Quitar", "Retirer"])}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ───────────────────────────── Lista de compras ─────────────────────────────

/** Junta ingredientes (do cardápio ou da lancheira) numa lista de compras agrupada por seção. */
export function ShoppingSection({ ingredients }: { ingredients: string[] }) {
  const tr = useTr();
  const { locale } = useI18n();
  const { user } = useAuth();
  const list = useShoppingItems(user?.id);
  const add = useAddShoppingItems(user?.id);
  const update = useUpdateShoppingItem();
  const remove = useDeleteShoppingItems();
  const [preview, setPreview] = useState<{ text: string; section: Section; on: boolean }[]>([]);
  const [busy, setBusy] = useState(false);

  const items = list.data ?? [];
  const done = items.filter((i) => i.done);

  const generate = async () => {
    setBusy(true);
    try {
      const res = await buildShoppingList({
        data: { ingredients: ingredients.slice(0, 200), have: readFridgeItems(user?.id), locale },
      });
      if ("error" in res) toast.error(tr(ERRORS[res.error]));
      else setPreview(res.items.map((i) => ({ ...i, on: true })));
    } catch (err) {
      console.error("cardápio lista", err);
      toast.error(tr(ERRORS.failed));
    } finally {
      setBusy(false);
    }
  };

  const send = () => {
    const chosen = preview.filter((p) => p.on);
    add.mutate(
      { texts: chosen.map(({ text, section }) => ({ text, section })), source: "cardapio" },
      {
        onSuccess: (n) => {
          setPreview([]);
          toast.success(
            tr([
              `${n} item(ns) na sua lista de compras.`,
              `${n} item(s) added to your shopping list.`,
              `${n} artículo(s) en tu lista de compras.`,
              `${n} article(s) ajouté(s) à votre liste de courses.`,
            ]),
          );
        },
        onError: (err) => toast.error((err as Error).message),
      },
    );
  };

  const bySection = (rows: { section: string | null }[]) =>
    SECTIONS.map((s) => ({
      section: s,
      rows: rows.filter((r) => (r.section ?? "outros") === s),
    })).filter((g) => g.rows.length);

  return (
    <section className={cn(card, "mt-8")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <ShoppingBasket className="h-4 w-4 text-accent" />
          {tr(["Lista de compras", "Shopping list", "Lista de compras", "Liste de courses"])}
        </h2>
        <button
          type="button"
          onClick={() => void generate()}
          disabled={busy || !ingredients.length}
          className={btnSoft}
          title={
            ingredients.length
              ? undefined
              : tr([
                  "Monte o cardápio primeiro",
                  "Plan the menu first",
                  "Arma el menú primero",
                  "Préparez d'abord le menu",
                ])
          }
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {tr([
            "Juntar os ingredientes da semana",
            "Gather the week's ingredients",
            "Juntar los ingredientes de la semana",
            "Rassembler les ingrédients de la semaine",
          ])}
        </button>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        {tr([
          "A Nina soma o que se repete e tira o que você marcou na Geladeira. Confira antes de mandar.",
          "Nina adds up repeats and skips what you marked in the Fridge. Check before sending.",
          "Nina suma lo repetido y quita lo que marcaste en la Nevera. Revisa antes de enviar.",
          "Nina regroupe les doublons et retire ce que vous avez noté dans le Frigo. Vérifiez avant d'envoyer.",
        ])}
      </p>

      {preview.length > 0 && (
        <div className="mt-4 rounded-2xl border border-accent/40 bg-accent-soft/30 p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bySection(preview).map((g) => (
              <div key={g.section}>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {tr(SECTION_NAMES[g.section])}
                </h3>
                <ul className="mt-1 space-y-1">
                  {(g.rows as typeof preview).map((p) => (
                    <li key={p.text}>
                      <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground">
                        <input
                          type="checkbox"
                          checked={p.on}
                          onChange={() =>
                            setPreview((list) =>
                              list.map((x) => (x.text === p.text ? { ...x, on: !x.on } : x)),
                            )
                          }
                        />
                        {p.text}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={send}
              disabled={add.isPending || !preview.some((p) => p.on)}
              className={btnPrimary}
            >
              <ShoppingBasket className="h-4 w-4" />
              {tr([
                "Mandar para a lista",
                "Send to the list",
                "Enviar a la lista",
                "Envoyer à la liste",
              ])}
            </button>
            <button type="button" onClick={() => setPreview([])} className={btnSoft}>
              {tr(["Cancelar", "Cancel", "Cancelar", "Annuler"])}
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">
          {tr([
            "Sua lista está vazia.",
            "Your list is empty.",
            "Tu lista está vacía.",
            "Votre liste est vide.",
          ])}
        </p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bySection(items).map((g) => (
            <div key={g.section}>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {tr(SECTION_NAMES[g.section])}
              </h3>
              <ul className="mt-1 space-y-0.5">
                {(g.rows as typeof items).map((it) => (
                  <li key={it.id} className="group flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => update.mutate({ id: it.id, done: !it.done })}
                      aria-pressed={it.done}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <CheckCircle2
                        className={cn(
                          "h-4 w-4 shrink-0",
                          it.done ? "text-accent" : "text-muted-foreground/50",
                        )}
                      />
                      <span
                        className={cn(
                          "truncate text-xs",
                          it.done ? "text-muted-foreground line-through" : "text-foreground",
                        )}
                      >
                        {it.text}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => remove.mutate([it.id])}
                      className="text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100 focus:opacity-100"
                      aria-label={tr(["Remover", "Remove", "Quitar", "Retirer"])}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {done.length > 0 && (
        <button
          type="button"
          onClick={() => remove.mutate(done.map((i) => i.id))}
          className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {tr(["Limpar comprados", "Clear bought", "Quitar comprados", "Retirer les achats"])}
        </button>
      )}
    </section>
  );
}

// ───────────────────────────── Página ─────────────────────────────

export function MenuPanel() {
  const tr = useTr();
  const { locale } = useI18n();
  const { user } = useAuth();
  const [week, setWeek] = useState(() => mondayOf());
  const qc = useQueryClient();
  const menu = useWeeklyMenu(user?.id, week);
  const save = useSaveMenu(user?.id, week);
  const savedRecipes = useSavedRecipes(!!user);
  const season = useSeasonNow();
  const [wish, setWish] = useState("");
  const [busy, setBusy] = useState<string[]>([]);
  const [used, setUsed] = useState<number | null>(null);

  const meals = (menu.data?.meals ?? {}) as MenuMeals;
  const budget = (menu.data?.budget ?? "economico") as Budget;
  const allSlots = [0, 1, 2, 3, 4, 5, 6].flatMap((day) => MEALS.map((meal) => ({ day, meal })));
  const empty = allSlots.filter((s) => !meals[slotKey(s.day, s.meal)]);
  const thisWeek = mondayOf();

  const persist = (next: MenuMeals, nextBudget = budget) =>
    save.mutate(
      { budget: nextBudget, meals: next },
      { onError: (err) => toast.error((err as Error).message) },
    );

  const ask = async (slots: { day: number; meal: MealKey }[]) => {
    if (!slots.length) return;
    const keys = slots.map((s) => slotKey(s.day, s.meal));
    setBusy(keys);
    try {
      const keep = Object.entries(meals)
        .filter(([k, m]) => m && !keys.includes(k))
        .map(([, m]) => m!.title)
        .slice(0, 14);
      const res = await suggestMenu({
        data: { slots, budget, wish, have: readFridgeItems(user?.id), keep, season, locale },
      });
      if (res.used !== undefined) setUsed(res.used);
      if ("error" in res) {
        toast.error(tr(ERRORS[res.error]));
        return;
      }
      // Lê o cardápio mais recente (a pessoa pode ter mexido enquanto a Nina pensava).
      const latest = qc.getQueryData<WeeklyMenu | null>(menuKey(week));
      const current = { ...((latest?.meals ?? {}) as MenuMeals) };
      for (const m of res.meals) current[slotKey(m.day, m.meal)] = m.recipe;
      persist(current);
    } catch (err) {
      console.error("cardápio", err);
      toast.error(tr(ERRORS.failed));
    } finally {
      setBusy([]);
    }
  };

  const redoAll = () => {
    if (
      !window.confirm(
        tr([
          "Trocar todas as refeições da semana por novas ideias da Nina?",
          "Replace every meal this week with new ideas from Nina?",
          "¿Cambiar todas las comidas de la semana por nuevas ideas de Nina?",
          "Remplacer tous les repas de la semaine par de nouvelles idées de Nina ?",
        ]),
      )
    )
      return;
    void ask(allSlots);
  };

  const setSlot = (key: string, meal: MenuMeal | null) => {
    const next = { ...meals };
    if (meal) next[key] = meal;
    else delete next[key];
    persist(next);
  };

  const dateFmt = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit" });
  const weekLabel =
    week === thisWeek
      ? tr(["Esta semana", "This week", "Esta semana", "Cette semaine"])
      : week === addWeeks(thisWeek, 1)
        ? tr(["Próxima semana", "Next week", "Próxima semana", "La semaine prochaine"])
        : `${dateFmt.format(dayDate(week, 0))} – ${dateFmt.format(dayDate(week, 6))}`;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-foreground">
            {tr(["Cardápio da semana", "Weekly menu", "Menú semanal", "Menu de la semaine"])}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {tr([
              "A Nina monta almoço e jantar cabendo no seu bolso, você troca o que quiser e a semana vira uma lista de compras só.",
              "Nina plans lunch and dinner within your budget, you swap anything, and the week becomes a single shopping list.",
              "Nina arma almuerzo y cena según tu presupuesto, cambias lo que quieras y la semana se vuelve una sola lista de compras.",
              "Nina prépare déjeuners et dîners selon votre budget, vous changez ce que vous voulez et la semaine devient une seule liste de courses.",
            ])}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border/60 bg-card p-1">
          <button
            type="button"
            onClick={() => setWeek(addWeeks(week, -1))}
            className={iconBtn}
            aria-label={tr([
              "Semana anterior",
              "Previous week",
              "Semana anterior",
              "Semaine précédente",
            ])}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-28 text-center text-xs font-semibold text-foreground">
            {weekLabel}
          </span>
          <button
            type="button"
            onClick={() => setWeek(addWeeks(week, 1))}
            className={iconBtn}
            aria-label={tr(["Próxima semana", "Next week", "Próxima semana", "Semaine suivante"])}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <section className={card}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-foreground">
            {tr(["Orçamento:", "Budget:", "Presupuesto:", "Budget :"])}
          </span>
          {BUDGETS.map((b) => (
            <button
              key={b}
              type="button"
              aria-pressed={budget === b}
              onClick={() => persist(meals, b)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                budget === b
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {tr(BUDGET_NAMES[b])}
            </button>
          ))}
        </div>
        <input
          value={wish}
          onChange={(e) => setWish(e.target.value)}
          maxLength={200}
          placeholder={tr([
            "Pedido para a Nina (opcional): ex.: sem carne na segunda, marmita para o trabalho",
            "Request for Nina (optional): e.g. meatless Monday, lunchbox for work",
            "Pedido para Nina (opcional): ej.: sin carne el lunes, táper para el trabajo",
            "Demande à Nina (facultatif) : ex. sans viande lundi, gamelle pour le travail",
          ])}
          className="mt-3 w-full rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground"
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {empty.length > 0 ? (
            <button
              type="button"
              onClick={() => void ask(empty)}
              disabled={busy.length > 0 || menu.isLoading}
              className={btnPrimary}
            >
              {busy.length > 1 ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {empty.length === allSlots.length
                ? tr([
                    "Montar a semana com a Nina",
                    "Plan the week with Nina",
                    "Armar la semana con Nina",
                    "Préparer la semaine avec Nina",
                  ])
                : tr([
                    `Completar com a Nina (${empty.length})`,
                    `Fill in with Nina (${empty.length})`,
                    `Completar con Nina (${empty.length})`,
                    `Compléter avec Nina (${empty.length})`,
                  ])}
            </button>
          ) : (
            <button type="button" onClick={redoAll} disabled={busy.length > 0} className={btnSoft}>
              {busy.length > 1 ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {tr(["Refazer a semana", "Redo the week", "Rehacer la semana", "Refaire la semaine"])}
            </button>
          )}
          <span className="text-[11px] text-muted-foreground">
            {used !== null &&
              `${used}/${MENU_DAILY_LIMIT} ${tr(["hoje", "today", "hoy", "aujourd'hui"])} · `}
            {tr([
              "Sem calorias. Com sua permissão, a Nina segue o plano da sua nutri e suas restrições.",
              "No calories. With your permission, Nina follows your dietitian's plan and your restrictions.",
              "Sin calorías. Con tu permiso, Nina sigue el plan de tu nutri y tus restricciones.",
              "Sans calories. Avec votre accord, Nina suit le plan de votre diététicien(ne) et vos restrictions.",
            ])}
          </span>
        </div>
        <Link
          to="/geladeira"
          className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-accent hover:underline"
        >
          <Refrigerator className="h-3.5 w-3.5" />
          {tr([
            "Marque o que já tem em casa na Geladeira: a Nina aproveita e tira da lista.",
            "Mark what you already have in the Fridge: Nina uses it and skips it on the list.",
            "Marca lo que ya tienes en la Nevera: Nina lo aprovecha y lo quita de la lista.",
            "Notez ce que vous avez dans le Frigo : Nina l'utilise et le retire de la liste.",
          ])}
        </Link>
        <Link
          to="/lancheira"
          className="ml-4 mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-accent hover:underline"
        >
          <Backpack className="h-3.5 w-3.5" />
          {tr([
            "Lancheira das crianças →",
            "Kids' lunchbox →",
            "Lonchera de los niños →",
            "Boîte à goûter des enfants →",
          ])}
        </Link>
      </section>

      {menu.isLoading ? (
        <Loader2 className="mt-6 h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <ol className="mt-6 space-y-3">
          {DAY_NAMES.map((name, day) => (
            <li key={day} className={cn(card, "p-4")}>
              <p className="mb-2 text-sm font-bold text-foreground">
                {tr(name)}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  {dateFmt.format(dayDate(week, day))}
                </span>
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {MEALS.map((meal) => {
                  const key = slotKey(day, meal);
                  return (
                    <SlotCard
                      key={key}
                      label={tr(MEAL_NAMES[meal])}
                      meal={meals[key]}
                      busy={busy.includes(key)}
                      disabled={busy.length > 0}
                      saved={savedRecipes.data ?? []}
                      onAsk={() => void ask([{ day, meal }])}
                      onSet={(m) => setSlot(key, m)}
                    />
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
      )}

      <ShoppingSection ingredients={Object.values(meals).flatMap((m) => m?.ingredients ?? [])} />
    </div>
  );
}

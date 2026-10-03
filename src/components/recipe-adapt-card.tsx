import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { adaptRecipe, RECIPE_GOALS, type RecipeGoal } from "@/lib/recipe-ai.functions";
import { useI18n } from "@/hooks/use-i18n";
import type { DictKey } from "@/lib/i18n";

const LABELS: Record<RecipeGoal, DictKey> = {
  gluten_free: "recipe.adapt.glutenFree",
  lactose_free: "recipe.adapt.lactoseFree",
  vegan: "recipe.adapt.vegan",
  vegetarian: "recipe.adapt.vegetarian",
  egg_free: "recipe.adapt.eggFree",
  faster: "recipe.adapt.faster",
  servings: "recipe.adapt.servings",
};

/** Pede à Nina uma versão adaptada da receita. Só exibe: nada é salvo nem publicado. */
export function RecipeAdaptCard({ recipeId }: { recipeId: string }) {
  const { t, locale } = useI18n();
  const [goal, setGoal] = useState<RecipeGoal>("gluten_free");
  const [servings, setServings] = useState(4);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adaptRecipe({
        data: {
          recipeId,
          goal,
          locale,
          ...(goal === "servings" ? { servings } : {}),
        },
      });
      if ("text" in res) setText(res.text);
      else setError(res.error);
    } catch {
      setError(t("recipe.adapt.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-8 rounded-2xl border border-accent/30 bg-accent-soft/30 p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
        <Sparkles className="h-4 w-4 text-accent" /> {t("recipe.adapt.title")}
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">{t("recipe.adapt.hint")}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {RECIPE_GOALS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGoal(g)}
            disabled={loading}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              goal === g
                ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                : "bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {t(LABELS[g])}
          </button>
        ))}
      </div>

      {goal === "servings" && (
        <label className="mt-3 flex items-center gap-2 text-xs font-medium text-foreground">
          {t("recipe.adapt.servingsLabel")}
          <input
            type="number"
            min={1}
            max={50}
            value={servings}
            onChange={(e) => setServings(Math.min(50, Math.max(1, Number(e.target.value) || 1)))}
            className="w-20 rounded-lg border border-input bg-background px-2 py-1 text-sm"
          />
        </label>
      )}

      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90 disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? t("recipe.adapt.generating") : t("recipe.adapt.generate")}
      </button>

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {text && (
        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-accent">
            {t("recipe.adapt.result")}
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{text}</p>
          <p className="mt-3 text-[11px] text-muted-foreground">{t("recipe.adapt.disclaimer")}</p>
        </div>
      )}
    </section>
  );
}

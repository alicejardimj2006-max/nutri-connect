import { useEffect, useState } from "react";
import { Loader2, Plus, Search, X } from "lucide-react";
import * as records from "@/lib/clinical/records";
import type { Food } from "@/lib/clinical/records";
import { portion } from "@/lib/clinical/calc";
import { useClinicalMutation, useFoodSearch } from "@/lib/clinical/queries";
import { formatNumber } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { cn } from "@/lib/utils";
import { Field, buttonGhost, buttonPrimary, buttonSecondary, inputClass } from "./ui";

export interface FoodChoice {
  food: Food;
  grams: number;
  measure: string;
}

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

/** Busca na TACO (e nos alimentos próprios) + quantidade/medida caseira. */
export function FoodSearch({
  onPick,
  onCancel,
  placeholder,
}: {
  onPick: (choice: FoodChoice) => void;
  onCancel?: () => void;
  placeholder?: string;
}) {
  const { t, locale } = useClinicalI18n();
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query, 250);
  const results = useFoodSearch(debounced);
  const [selected, setSelected] = useState<Food | null>(null);
  const [grams, setGrams] = useState("100");
  const [measure, setMeasure] = useState("");
  const [creating, setCreating] = useState(false);

  if (creating) {
    return (
      <CustomFoodForm
        initialName={query}
        onCancel={() => setCreating(false)}
        onCreated={(food) => {
          setCreating(false);
          setSelected(food);
        }}
      />
    );
  }

  if (selected) {
    const g = Number(grams.replace(",", ".")) || 0;
    const m = portion(selected, g);
    return (
      <div className="rounded-xl border border-primary/30 bg-primary-soft/40 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{selected.name}</p>
          <button
            type="button"
            className={buttonGhost}
            aria-label={t("common.back")}
            onClick={() => setSelected(null)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-[110px_1fr_auto] sm:items-end">
          <Field label={t("plan.grams")}>
            <input
              autoFocus
              inputMode="decimal"
              className={inputClass}
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
            />
          </Field>
          <Field label={t("plan.measure")} hint={t("common.optional")}>
            <input
              className={inputClass}
              value={measure}
              onChange={(e) => setMeasure(e.target.value)}
              placeholder={t("plan.measurePlaceholder")}
            />
          </Field>
          <button
            type="button"
            className={buttonPrimary}
            disabled={g <= 0}
            onClick={() => {
              onPick({ food: selected, grams: g, measure: measure.trim() });
              setSelected(null);
              setQuery("");
              setGrams("100");
              setMeasure("");
            }}
          >
            {t("common.add")}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground tabular-nums">
          {formatNumber(m.kcal, locale, 0)} kcal · P {formatNumber(m.protein_g, locale)} g · C{" "}
          {formatNumber(m.carbs_g, locale)} g · G {formatNumber(m.fat_g, locale)} g
        </p>
      </div>
    );
  }

  const list = results.data ?? [];
  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
        <input
          autoFocus
          className={cn(inputClass, "pl-10 pr-10")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder ?? t("plan.searchFood")}
          aria-label={t("plan.searchFood")}
          onKeyDown={(e) => e.key === "Escape" && onCancel?.()}
        />
        {results.isFetching && (
          <Loader2 className="absolute right-3.5 top-3 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      {debounced.trim().length >= 2 && !results.isFetching && (
        <ul className="mt-1 max-h-72 overflow-y-auto rounded-xl border border-border bg-popover shadow-lg">
          {list.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => setSelected(f)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-secondary"
              >
                <span className="min-w-0">
                  <span className="block truncate text-foreground">{f.name}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {f.source === "custom" ? t("plan.customFood") : f.category}
                  </span>
                </span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {formatNumber(Number(f.kcal), locale, 0)} kcal/100 g
                </span>
              </button>
            </li>
          ))}
          {list.length === 0 && (
            <li className="px-3 py-2 text-sm text-muted-foreground">{t("plan.noFood")}</li>
          )}
          <li className="border-t border-border/60">
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-accent hover:bg-secondary"
            >
              <Plus className="h-4 w-4" /> {t("plan.createFood")}
            </button>
          </li>
        </ul>
      )}
      {onCancel && (
        <button type="button" className={cn(buttonGhost, "mt-1")} onClick={onCancel}>
          {t("common.cancel")}
        </button>
      )}
    </div>
  );
}

function CustomFoodForm({
  initialName,
  onCancel,
  onCreated,
}: {
  initialName: string;
  onCancel: () => void;
  onCreated: (food: Food) => void;
}) {
  const { t } = useClinicalI18n();
  const [form, setForm] = useState({
    name: initialName,
    kcal: "",
    protein: "",
    carbs: "",
    fat: "",
    fiber: "",
  });
  const n = (v: string) => Number(v.replace(",", ".")) || 0;
  const create = useClinicalMutation(
    () =>
      records.createCustomFood({
        name: form.name.trim(),
        category: t("plan.customFood"),
        kcal: n(form.kcal),
        protein_g: n(form.protein),
        carbs_g: n(form.carbs),
        fat_g: n(form.fat),
        fiber_g: form.fiber ? n(form.fiber) : null,
      }),
    { success: t("plan.foodCreated"), invalidate: [["clinical", "foods"]], onSuccess: onCreated },
  );
  const field = (key: keyof typeof form, label: string) => (
    <Field label={label}>
      <input
        inputMode="decimal"
        className={inputClass}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      />
    </Field>
  );
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="mb-2 text-sm font-semibold">{t("plan.createFood")}</p>
      <p className="mb-3 text-xs text-muted-foreground">{t("plan.createFoodHint")}</p>
      <div className="grid gap-2 sm:grid-cols-6">
        <Field label={t("plan.foodName")} className="sm:col-span-6">
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </Field>
        {field("kcal", "kcal")}
        {field("protein", t("plan.protein"))}
        {field("carbs", t("plan.carbs"))}
        {field("fat", t("plan.fat"))}
        {field("fiber", t("plan.fiber"))}
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" className={buttonSecondary} onClick={onCancel}>
          {t("common.cancel")}
        </button>
        <button
          type="button"
          className={buttonPrimary}
          disabled={!form.name.trim() || !form.kcal || create.isPending}
          onClick={() => create.mutate(undefined)}
        >
          {t("common.save")}
        </button>
      </div>
    </div>
  );
}

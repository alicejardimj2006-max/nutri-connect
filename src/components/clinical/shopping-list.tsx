// Lista de compras gerada do plano alimentar: soma as quantidades diárias de cada alimento (sem as
// substituições) para o número de dias escolhido. O que já foi comprado fica marcado neste aparelho.
import { useEffect, useMemo, useState } from "react";
import { Check, ShoppingBasket, Trash2 } from "lucide-react";
import { useTr } from "@/components/appearance-editor";
import { Card, buttonGhost } from "./ui";
import type { FullMealPlan } from "@/lib/clinical/records";
import { cn } from "@/lib/utils";

interface ShoppingItem {
  id: string;
  name: string;
  gramsPerDay: number;
  measures: string[];
}

const DAYS = [1, 3, 7] as const;

const storageKey = (planId: string) => `nc-compras-${planId}`;

function readChecked(planId: string): Record<string, boolean> {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey(planId)) ?? "{}") ?? {};
  } catch {
    return {};
  }
}

function writeChecked(planId: string, value: Record<string, boolean>) {
  try {
    if (Object.keys(value).length)
      window.localStorage.setItem(storageKey(planId), JSON.stringify(value));
    else window.localStorage.removeItem(storageKey(planId));
  } catch {
    // sem armazenamento: as marcações valem só nesta visita
  }
}

const formatAmount = (grams: number) =>
  grams >= 1000
    ? `${(grams / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`
    : `${Math.round(grams)} g`;

export function ShoppingList({ plan }: { plan: FullMealPlan }) {
  const tr = useTr();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [days, setDays] = useState<(typeof DAYS)[number]>(7);

  useEffect(() => setChecked(readChecked(plan.id)), [plan.id]);

  const update = (next: Record<string, boolean>) => {
    setChecked(next);
    writeChecked(plan.id, next);
  };

  const items = useMemo(() => {
    const map = new Map<string, ShoppingItem>();
    for (const meal of plan.meals) {
      // Substituições são alternativas: não entram na lista.
      for (const item of meal.items.filter((i) => !i.substitute_of)) {
        const name = item.food_name.trim();
        const key = name.toLocaleLowerCase();
        const measure = item.household_measure?.trim() ?? "";
        const found = map.get(key);
        if (found) {
          found.gramsPerDay += item.quantity_g;
          if (measure && !found.measures.includes(measure)) found.measures.push(measure);
        } else {
          map.set(key, {
            id: key,
            name,
            gramsPerDay: item.quantity_g,
            measures: measure ? [measure] : [],
          });
        }
      }
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [plan]);

  if (items.length === 0) return null;

  const done = items.filter((i) => checked[i.id]).length;
  const progress = Math.round((done / items.length) * 100);

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <ShoppingBasket className="h-5 w-5 text-accent" />
          <span>
            {tr(["Lista de compras", "Shopping list", "Lista de compras", "Liste de courses"])}
          </span>
        </div>
      }
      action={
        done > 0 && (
          <button
            type="button"
            className={cn(buttonGhost, "h-8 px-2 text-xs text-muted-foreground")}
            onClick={() => {
              if (
                window.confirm(
                  tr([
                    "Desmarcar todos os itens?",
                    "Uncheck all items?",
                    "¿Desmarcar todos los ítems?",
                    "Décocher tous les articles ?",
                  ]),
                )
              )
                update({});
            }}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            {tr(["Desmarcar", "Uncheck", "Desmarcar", "Décocher"])}
          </button>
        )
      }
      className="relative border-t-8 border-t-accent/80"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          {tr(["Quantidade para", "Amount for", "Cantidad para", "Quantité pour"])}
        </span>
        {DAYS.map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={days === d}
            onClick={() => setDays(d)}
            className={cn(
              "cursor-pointer rounded-full px-3 py-1 text-xs font-bold transition",
              days === d
                ? "bg-accent text-accent-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {d === 1
              ? tr(["1 dia", "1 day", "1 día", "1 jour"])
              : tr([`${d} dias`, `${d} days`, `${d} días`, `${d} jours`])}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>
            {tr([
              `${done} de ${items.length} itens comprados`,
              `${done} of ${items.length} items bought`,
              `${done} de ${items.length} ítems comprados`,
              `${done} sur ${items.length} articles achetés`,
            ])}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/80">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ul className="space-y-2">
        {items.map((item) => {
          const on = !!checked[item.id];
          return (
            <li key={item.id}>
              <label
                className={cn(
                  "group flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-all duration-300",
                  on
                    ? "border-primary/20 bg-primary/5 opacity-60"
                    : "border-border/50 bg-card/60 hover:border-primary/30 hover:shadow-sm",
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={on}
                  onChange={() => update({ ...checked, [item.id]: !on })}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors",
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 group-hover:border-primary/50",
                  )}
                >
                  {on && <Check className="h-3 w-3" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn("block text-sm font-bold text-foreground", on && "line-through")}
                  >
                    {item.name}
                  </span>
                  <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
                    {formatAmount(item.gramsPerDay * days)}
                    {item.measures.length > 0 && (
                      <span className="ml-1 opacity-80">
                        · {tr(["por dia:", "per day:", "por día:", "par jour :"])}{" "}
                        {item.measures.join(", ")}
                      </span>
                    )}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

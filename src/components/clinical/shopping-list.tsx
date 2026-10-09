import { useMemo, useState, useEffect } from "react";
import { Check, ShoppingBasket, ShoppingCart, Trash2 } from "lucide-react";
import { Card, EmptyState, buttonGhost } from "./ui";
import type { FullMealPlan } from "@/lib/clinical/records";
import { cn } from "@/lib/utils";

interface ShoppingItem {
  id: string;
  name: string;
  totalGrams: number;
  measures: string[];
}

export function ShoppingList({ plan }: { plan: FullMealPlan }) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Load saved checklist state from localStorage based on plan ID
  useEffect(() => {
    const saved = localStorage.getItem(`shopping_list_${plan.id}`);
    if (saved) {
      try {
        setCheckedItems(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, [plan.id]);

  // Save checklist state to localStorage
  const toggleCheck = (id: string) => {
    const next = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(next);
    localStorage.setItem(`shopping_list_${plan.id}`, JSON.stringify(next));
  };

  const clearChecklist = () => {
    if (window.confirm("Deseja limpar todos os itens marcados?")) {
      setCheckedItems({});
      localStorage.removeItem(`shopping_list_${plan.id}`);
    }
  };

  const items = useMemo(() => {
    const map = new Map<string, ShoppingItem>();

    for (const meal of plan.meals) {
      for (const item of meal.items) {
        const name = item.food_name.trim();
        const existing = map.get(name);
        
        const measure = item.household_measure?.trim() || "";

        if (existing) {
          existing.totalGrams += item.quantity_g;
          if (measure && !existing.measures.includes(measure)) {
            existing.measures.push(measure);
          }
        } else {
          map.set(name, {
            id: `food_${name}`,
            name,
            totalGrams: item.quantity_g,
            measures: measure ? [measure] : [],
          });
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [plan]);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Lista vazia"
        text="Seu plano alimentar não possui itens."
      />
    );
  }

  const checkedCount = items.filter(i => checkedItems[i.id]).length;
  const progress = Math.round((checkedCount / items.length) * 100);

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <ShoppingBasket className="h-5 w-5 text-accent" />
          <span>Lista de Compras</span>
        </div>
      }
      action={
        checkedCount > 0 && (
          <button
            type="button"
            className={cn(buttonGhost, "h-8 px-2 text-xs text-muted-foreground")}
            onClick={clearChecklist}
            title="Limpar marcados"
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" /> Limpar
          </button>
        )
      }
      className="relative border-t-8 border-t-accent/80"
    >
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-1.5">
          <span>{checkedCount} de {items.length} itens comprados</span>
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
          const isChecked = !!checkedItems[item.id];
          return (
            <li key={item.id}>
              <label
                className={cn(
                  "group flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-all duration-300",
                  isChecked 
                    ? "border-primary/20 bg-primary/5 opacity-60" 
                    : "border-border/50 bg-card/60 hover:border-primary/30 hover:shadow-sm"
                )}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isChecked}
                  onChange={() => toggleCheck(item.id)}
                />
                <div 
                  className={cn(
                    "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors",
                    isChecked 
                      ? "border-primary bg-primary text-primary-foreground" 
                      : "border-muted-foreground/30 group-hover:border-primary/50"
                  )}
                >
                  {isChecked && <Check className="h-3 w-3" />}
                </div>
                
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    "text-sm font-bold text-foreground transition-all",
                    isChecked && "line-through"
                  )}>
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                    {Math.round(item.totalGrams)}g total
                    {item.measures.length > 0 && (
                      <span className="ml-1 opacity-80">
                        ({item.measures.join(", ")})
                      </span>
                    )}
                  </p>
                </div>
              </label>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

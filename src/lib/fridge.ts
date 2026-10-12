// Geladeira (N4) e lista de compras na conta: receitas guardadas, receitas da comunidade pelos
// ingredientes e itens de compra (valem em todos os aparelhos).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables, TablesInsert } from "@/integrations/supabase/types";
import type { FridgeRecipe } from "@/lib/fridge.functions";

export type SavedRecipe = Tables<"saved_recipes">;
export type ShoppingItem = Tables<"shopping_items">;
export type CommunityRecipe = {
  id: string;
  title: string | null;
  image_url: string | null;
  author_id: string;
  recipe: Json;
  matches: number;
};

const fail = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

export const fridgeKeys = {
  saved: ["fridge", "saved"] as const,
  shopping: ["shopping"] as const,
  community: (terms: string[]) => ["fridge", "community", terms] as const,
};

/** Ingredientes que a pessoa marcou na Geladeira (guardados neste aparelho). */
export const fridgeItemsKey = (userId: string) => `nc_fridge_items_${userId}`;

export function readFridgeItems(userId: string | undefined): string[] {
  if (!userId) return [];
  try {
    const raw = window.localStorage.getItem(fridgeItemsKey(userId));
    const list = raw ? (JSON.parse(raw) as unknown[]) : [];
    return list.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Ingredientes comuns (um toque)
// ---------------------------------------------------------------------------

export const COMMON_INGREDIENTS: [string, string, string, string][] = [
  ["arroz", "rice", "arroz", "riz"],
  ["feijão", "beans", "frijoles", "haricots"],
  ["ovo", "egg", "huevo", "œuf"],
  ["tomate", "tomato", "tomate", "tomate"],
  ["cebola", "onion", "cebolla", "oignon"],
  ["alho", "garlic", "ajo", "ail"],
  ["batata", "potato", "papa", "pomme de terre"],
  ["cenoura", "carrot", "zanahoria", "carotte"],
  ["abobrinha", "zucchini", "calabacín", "courgette"],
  ["frango", "chicken", "pollo", "poulet"],
  ["banana", "banana", "plátano", "banane"],
  ["aveia", "oats", "avena", "flocons d'avoine"],
  ["leite", "milk", "leche", "lait"],
  ["queijo", "cheese", "queso", "fromage"],
  ["pão", "bread", "pan", "pain"],
  ["macarrão", "pasta", "pasta", "pâtes"],
];

// ---------------------------------------------------------------------------
// Receitas guardadas
// ---------------------------------------------------------------------------

export function useSavedRecipes(enabled = true) {
  return useQuery({
    queryKey: fridgeKeys.saved,
    enabled,
    queryFn: async (): Promise<SavedRecipe[]> => {
      const { data, error } = await supabase
        .from("saved_recipes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      fail(error);
      return data ?? [];
    },
  });
}

export function useSaveRecipe(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input:
        { source: "nina"; recipe: FridgeRecipe } | { source: "comunidade"; post: CommunityRecipe },
    ) => {
      const row: TablesInsert<"saved_recipes"> =
        input.source === "nina"
          ? {
              user_id: userId!,
              source: "nina",
              title: input.recipe.title,
              recipe: input.recipe as unknown as Json,
            }
          : {
              user_id: userId!,
              source: "comunidade",
              post_id: input.post.id,
              title: (input.post.title || "Receita").slice(0, 150),
              recipe: input.post.recipe,
            };
      const { error } = await supabase.from("saved_recipes").insert(row);
      fail(error);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: fridgeKeys.saved }),
  });
}

export function useDeleteSavedRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("saved_recipes").delete().eq("id", id);
      fail(error);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: fridgeKeys.saved }),
  });
}

// ---------------------------------------------------------------------------
// Receitas da comunidade
// ---------------------------------------------------------------------------

export function useCommunityRecipes(terms: string[], enabled: boolean) {
  return useQuery({
    queryKey: fridgeKeys.community(terms),
    enabled: enabled && terms.length > 0,
    queryFn: async (): Promise<CommunityRecipe[]> => {
      const { data, error } = await supabase.rpc("recipes_with_ingredients", {
        p_terms: terms,
        p_limit: 6,
      });
      fail(error);
      return (data ?? []) as CommunityRecipe[];
    },
  });
}

// ---------------------------------------------------------------------------
// Lista de compras na conta
// ---------------------------------------------------------------------------

export function useShoppingItems(userId: string | undefined) {
  return useQuery({
    queryKey: fridgeKeys.shopping,
    enabled: !!userId,
    queryFn: async (): Promise<ShoppingItem[]> => {
      const { data, error } = await supabase
        .from("shopping_items")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      fail(error);
      return data ?? [];
    },
  });
}

/** Item para a lista: só o texto ou o texto com a seção do mercado. */
export type ShoppingEntry = string | { text: string; section?: string | null };

/** Adiciona itens (sem repetir o que já está na lista e ainda não foi comprado). */
export async function addShoppingItems(
  userId: string,
  entries: ShoppingEntry[],
  source: ShoppingItem["source"] = "manual",
  current: ShoppingItem[] = [],
) {
  const open = new Set(current.filter((i) => !i.done).map((i) => i.text.trim().toLowerCase()));
  const seen = new Set<string>();
  const rows = entries
    .map((e) => (typeof e === "string" ? { text: e } : e))
    .map((e) => ({ text: e.text.trim().slice(0, 80), section: e.section ?? null }))
    .filter((e) => {
      const k = e.text.toLowerCase();
      if (!e.text || open.has(k) || seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .map((e) => ({ user_id: userId, text: e.text, section: e.section, source }));
  if (!rows.length) return 0;
  const { error } = await supabase.from("shopping_items").insert(rows);
  fail(error);
  return rows.length;
}

export function useAddShoppingItems(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ texts, source }: { texts: ShoppingEntry[]; source?: ShoppingItem["source"] }) =>
      addShoppingItems(
        userId!,
        texts,
        source,
        qc.getQueryData<ShoppingItem[]>(fridgeKeys.shopping) ?? [],
      ),
    onSettled: () => qc.invalidateQueries({ queryKey: fridgeKeys.shopping }),
  });
}

export function useUpdateShoppingItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const { error } = await supabase.from("shopping_items").update({ done }).eq("id", id);
      fail(error);
    },
    onMutate: ({ id, done }) =>
      qc.setQueryData<ShoppingItem[]>(fridgeKeys.shopping, (old) =>
        old?.map((i) => (i.id === id ? { ...i, done } : i)),
      ),
    onSettled: () => qc.invalidateQueries({ queryKey: fridgeKeys.shopping }),
  });
}

/** Apaga itens (um, os comprados ou todos). */
export function useDeleteShoppingItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!ids.length) return;
      const { error } = await supabase.from("shopping_items").delete().in("id", ids);
      fail(error);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: fridgeKeys.shopping }),
  });
}

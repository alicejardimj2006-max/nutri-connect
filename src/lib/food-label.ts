// Leitor de rótulos completo (M1): busca pelo código de barras no Open Food Facts (base aberta e
// colaborativa), lupa "ALTO EM" da Anvisa (RDC 429/2020 e IN 75/2020), grupo NOVA e histórico.

import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";

export type LabelScan = Tables<"label_scans">;

/** Valores por 100 g (sólidos) ou 100 ml (líquidos). Ausente = o rótulo não informou. */
export interface Nutrients {
  kcal?: number;
  carboidratos?: number;
  acucares?: number;
  acucares_adicionados?: number;
  gorduras?: number;
  gordura_saturada?: number;
  gordura_trans?: number;
  fibras?: number;
  proteinas?: number;
  sodio_mg?: number;
}

export type AltoEmKey = "acucar" | "gordura_saturada" | "sodio";
export type AltoEm = Partial<Record<AltoEmKey, boolean>>;

export interface Product {
  barcode: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  quantity: string | null;
  nova: 1 | 2 | 3 | 4 | null;
  liquid: boolean;
  nutrients: Nutrients;
  ingredients: string | null;
  additives: number;
}

// ---------------------------------------------------------------------------
// Anvisa: limites da lupa "ALTO EM" (por 100 g ou 100 ml)
// ---------------------------------------------------------------------------

export const ALTO_EM_LIMITS: Record<AltoEmKey, { solid: number; liquid: number }> = {
  acucar: { solid: 15, liquid: 7.5 }, // açúcares adicionados (g)
  gordura_saturada: { solid: 6, liquid: 3 }, // g
  sodio: { solid: 600, liquid: 300 }, // mg
};

/**
 * Calcula a lupa a partir dos valores. Sem o dado de açúcar ADICIONADO, usa o açúcar total como
 * estimativa (e `sugarEstimated` avisa). Campo ausente = sem selo (não dá para afirmar).
 */
export function altoEm(n: Nutrients, liquid: boolean) {
  const lim = (k: AltoEmKey) => (liquid ? ALTO_EM_LIMITS[k].liquid : ALTO_EM_LIMITS[k].solid);
  const sugar = n.acucares_adicionados ?? n.acucares;
  const result: AltoEm = {};
  if (sugar !== undefined) result.acucar = sugar >= lim("acucar");
  if (n.gordura_saturada !== undefined)
    result.gordura_saturada = n.gordura_saturada >= lim("gordura_saturada");
  if (n.sodio_mg !== undefined) result.sodio = n.sodio_mg >= lim("sodio");
  return {
    altoEm: result,
    sugarEstimated: n.acucares_adicionados === undefined && n.acucares !== undefined,
  };
}

// ---------------------------------------------------------------------------
// Open Food Facts
// ---------------------------------------------------------------------------

const FIELDS = [
  "code",
  "product_name",
  "product_name_pt",
  "brands",
  "image_front_small_url",
  "quantity",
  "product_quantity_unit",
  "nutrition_data_per",
  "nova_group",
  "nutriments",
  "ingredients_text_pt",
  "ingredients_text",
  "additives_tags",
].join(",");

interface OffProduct {
  code?: string;
  product_name?: string;
  product_name_pt?: string;
  brands?: string;
  image_front_small_url?: string;
  quantity?: string;
  product_quantity_unit?: string;
  nutrition_data_per?: string;
  nova_group?: number;
  nutriments?: Record<string, number | string | undefined>;
  ingredients_text_pt?: string;
  ingredients_text?: string;
  additives_tags?: string[];
}

const num = (v: unknown) => {
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 10) / 10 : undefined;
};

export function normalizeBarcode(raw: string) {
  return raw.replace(/\D/g, "");
}

export function isValidBarcode(code: string) {
  return /^[0-9]{6,14}$/.test(code);
}

/** Busca o produto. `null` = código não encontrado na base. */
export async function fetchProduct(barcode: string): Promise<Product | null> {
  const res = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=${FIELDS}`,
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Open Food Facts ${res.status}`);
  const body = (await res.json()) as { status?: number; product?: OffProduct };
  if (body.status !== 1 || !body.product) return null;
  const p = body.product;
  const n = p.nutriments ?? {};
  const sodium = num(n["sodium_100g"]);
  const salt = num(n["salt_100g"]);
  const nutrients: Nutrients = {
    kcal: num(n["energy-kcal_100g"]),
    carboidratos: num(n["carbohydrates_100g"]),
    acucares: num(n["sugars_100g"]),
    acucares_adicionados: num(n["added-sugars_100g"]),
    gorduras: num(n["fat_100g"]),
    gordura_saturada: num(n["saturated-fat_100g"]),
    gordura_trans: num(n["trans-fat_100g"]),
    fibras: num(n["fiber_100g"]),
    proteinas: num(n["proteins_100g"]),
    // O Open Food Facts guarda sódio em g; sem sódio, deriva do sal (sal = sódio × 2,5).
    sodio_mg:
      sodium !== undefined
        ? Math.round(sodium * 1000)
        : salt !== undefined
          ? Math.round((salt / 2.5) * 1000)
          : undefined,
  };
  for (const k of Object.keys(nutrients) as (keyof Nutrients)[])
    if (nutrients[k] === undefined) delete nutrients[k];
  const nova = Number(p.nova_group);
  return {
    barcode: p.code ?? barcode,
    name: (p.product_name_pt || p.product_name || "").trim() || barcode,
    brand: p.brands?.split(",")[0]?.trim() || null,
    imageUrl: p.image_front_small_url?.startsWith("https://") ? p.image_front_small_url : null,
    quantity: p.quantity || null,
    nova: nova >= 1 && nova <= 4 ? (nova as 1 | 2 | 3 | 4) : null,
    liquid:
      p.product_quantity_unit?.toLowerCase() === "ml" ||
      (p.nutrition_data_per ?? "").toLowerCase().includes("ml") ||
      /\d\s*(ml|l)\b/i.test(p.quantity ?? ""),
    nutrients,
    ingredients: (p.ingredients_text_pt || p.ingredients_text || "").trim() || null,
    additives: p.additives_tags?.length ?? 0,
  };
}

/** Página do produto no Open Food Facts (para completar ou corrigir dados). */
export const offUrl = (barcode: string) => `https://br.openfoodfacts.org/produto/${barcode}`;

// ---------------------------------------------------------------------------
// Leitura do código pela câmera (BarcodeDetector, quando o navegador tem)
// ---------------------------------------------------------------------------

interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect: (source: CanvasImageSource | Blob | ImageBitmap) => Promise<DetectedBarcode[]>;
}
type BarcodeDetectorCtor = new (opts?: { formats?: string[] }) => BarcodeDetectorLike;

const FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e"];

export function hasBarcodeDetector() {
  return typeof window !== "undefined" && "BarcodeDetector" in window;
}

export function createBarcodeDetector(): BarcodeDetectorLike | null {
  if (!hasBarcodeDetector()) return null;
  const Ctor = (window as unknown as { BarcodeDetector: BarcodeDetectorCtor }).BarcodeDetector;
  try {
    return new Ctor({ formats: FORMATS });
  } catch {
    return null;
  }
}

/** Procura um código de barras numa foto (para quem não tem câmera ao vivo). */
export async function barcodeFromImage(file: Blob): Promise<string | null> {
  const detector = createBarcodeDetector();
  if (!detector) return null;
  const bitmap = await createImageBitmap(file);
  try {
    const found = await detector.detect(bitmap);
    const code = found.map((f) => normalizeBarcode(f.rawValue)).find(isValidBarcode);
    return code ?? null;
  } finally {
    bitmap.close();
  }
}

// ---------------------------------------------------------------------------
// Histórico
// ---------------------------------------------------------------------------

export async function listScans(limit = 50): Promise<LabelScan[]> {
  const { data, error } = await supabase
    .from("label_scans")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveProductScan(userId: string, p: Product) {
  const { altoEm: seals } = altoEm(p.nutrients, p.liquid);
  const { error } = await supabase.from("label_scans").insert({
    user_id: userId,
    source: "codigo",
    barcode: p.barcode,
    name: p.name.slice(0, 200),
    brand: p.brand?.slice(0, 120) ?? null,
    image_url: p.imageUrl,
    nova: p.nova,
    alto_em: seals as Json,
    nutrients: p.nutrients as Json,
    liquid: p.liquid,
  });
  if (error) throw new Error(error.message);
}

export async function savePhotoScan(userId: string, name: string, summary: string) {
  const { error } = await supabase.from("label_scans").insert({
    user_id: userId,
    source: "foto",
    name: name.slice(0, 200),
    summary: summary.slice(0, 3000),
  });
  if (error) throw new Error(error.message);
}

export async function deleteScan(id: string) {
  const { error } = await supabase.from("label_scans").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Linha do histórico de volta ao formato de produto (para comparar). */
export function scanToProduct(s: LabelScan): Product {
  return {
    barcode: s.barcode ?? "",
    name: s.name,
    brand: s.brand,
    imageUrl: s.image_url,
    quantity: null,
    nova: (s.nova as Product["nova"]) ?? null,
    liquid: s.liquid,
    nutrients: (s.nutrients ?? {}) as Nutrients,
    ingredients: null,
    additives: 0,
  };
}

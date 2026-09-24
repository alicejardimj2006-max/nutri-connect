// Tradução do conteúdo das trilhas (títulos, lições e atividades), indexada por id.
// O português é o texto original nos arquivos de conteúdo; os demais idiomas são sobrepostos aqui.

import type { Locale } from "./locales";
import type { DictKey } from "./pt-BR";
import en from "./content-en";
import es from "./content-es";
import fr from "./content-fr";

export type ContentOverrides = Record<string, Record<string, unknown>>;

const OVERRIDES: Partial<Record<Locale, ContentOverrides>> = { en, es, fr };

export function contentOverrides(locale: Locale): ContentOverrides | null {
  return OVERRIDES[locale] ?? null;
}

/** Sobrepõe os campos traduzidos de `entry` (id no formato "trail:x", "unit:x", "stop:x", "act:x"). */
export function localizeEntry<T extends object>(
  overrides: ContentOverrides | null,
  key: string,
  entry: T,
): T {
  const ov = overrides?.[key];
  if (!ov) return entry;
  const next: Record<string, unknown> = { ...(entry as Record<string, unknown>) };
  for (const [field, value] of Object.entries(ov)) {
    if (field === "items" && Array.isArray(next.items) && typeof next.items[0] === "object") {
      // Atividade "sort": mantém o grupo de cada item e troca só o texto.
      next.items = (next.items as { text: string; group: number }[]).map((it, i) => ({
        ...it,
        text: (value as string[])[i] ?? it.text,
      }));
    } else {
      next[field] = value;
    }
  }
  return next as T;
}

/** Nome do nível (em português, vindo de getUserLevel) → chave do dicionário. */
export const LEVEL_LABEL_KEYS: Record<string, DictKey> = {
  Semente: "hub.level.1",
  Broto: "hub.level.2",
  Folha: "hub.level.3",
  Flor: "hub.level.4",
  Fruto: "hub.level.5",
  Árvore: "hub.level.6",
  Floresta: "hub.level.7",
  Mestre: "hub.level.8",
};

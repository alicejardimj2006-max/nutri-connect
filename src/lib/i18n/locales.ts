// Idiomas com suporte na plataforma.

export type Locale = "pt-BR" | "en" | "es" | "fr";

export interface LocaleMeta {
  id: Locale;
  /** Nome no próprio idioma (o que aparece no seletor). */
  name: string;
  /** Nome em português, para quando o idioma atual ainda não foi trocado. */
  namePt: string;
  flag: string;
  /** Marcador BCP 47 usado no atributo lang do <html> e em Intl.*. */
  tag: string;
}

export const DEFAULT_LOCALE: Locale = "pt-BR";

export const LOCALES: LocaleMeta[] = [
  {
    id: "pt-BR",
    name: "Português (Brasil)",
    namePt: "Português (Brasil)",
    flag: "🇧🇷",
    tag: "pt-BR",
  },
  { id: "en", name: "English", namePt: "Inglês", flag: "🇺🇸", tag: "en-US" },
  { id: "es", name: "Español", namePt: "Espanhol", flag: "🇪🇸", tag: "es" },
  { id: "fr", name: "Français", namePt: "Francês", flag: "🇫🇷", tag: "fr" },
];

export function isLocale(value: string): value is Locale {
  return LOCALES.some((l) => l.id === value);
}

export function localeMeta(id: Locale): LocaleMeta {
  return LOCALES.find((l) => l.id === id) ?? LOCALES[0];
}

/** Tenta casar o idioma do navegador com um dos idiomas suportados. */
export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  for (const lang of navigator.languages ?? [navigator.language]) {
    const short = lang.slice(0, 2).toLowerCase();
    if (short === "pt") return "pt-BR";
    if (short === "en") return "en";
    if (short === "es") return "es";
    if (short === "fr") return "fr";
  }
  return DEFAULT_LOCALE;
}

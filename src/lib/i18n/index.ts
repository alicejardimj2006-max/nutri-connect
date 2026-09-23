// Idioma da plataforma: carregamento, troca e tradução. Segue o mesmo padrão de
// src/lib/appearance.ts (localStorage + evento customizado, sem Context).

import { DEFAULT_LOCALE, detectBrowserLocale, isLocale, localeMeta, type Locale } from "./locales";
import ptBR, { type DictKey } from "./pt-BR";
import en from "./en";
import es from "./es";
import fr from "./fr";

export type { Locale, LocaleMeta } from "./locales";
export { DEFAULT_LOCALE, LOCALES, detectBrowserLocale, isLocale, localeMeta } from "./locales";
export type { DictKey };

const DICTS: Record<Locale, Record<DictKey, string>> = {
  "pt-BR": ptBR,
  en,
  es,
  fr,
};

export const LOCALE_STORAGE_KEY = "nutriconnect_locale";
export const LOCALE_EVENT = "locale-change";

export function loadLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (raw && isLocale(raw)) return raw;
  } catch {
    // sem armazenamento: segue com o padrão
  }
  return DEFAULT_LOCALE;
}

function applyLocale(locale: Locale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = localeMeta(locale).tag;
}

/** Salva o idioma escolhido, aplica no <html> e avisa o resto do app. */
export function saveLocale(locale: Locale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // sem armazenamento: vale só nesta sessão
  }
  applyLocale(locale);
  window.dispatchEvent(new Event(LOCALE_EVENT));
}

/** Aplica o idioma salvo (ou detectado, na primeira visita) e retorna a limpeza. */
export function initI18n(): () => void {
  let locale = loadLocale();
  try {
    if (!window.localStorage.getItem(LOCALE_STORAGE_KEY)) {
      locale = detectBrowserLocale();
    }
  } catch {
    // ignora
  }
  applyLocale(locale);
  return () => {};
}

/** Traduz uma chave para o idioma atualmente salvo. */
export function t(key: DictKey): string {
  const dict = DICTS[loadLocale()];
  return dict[key] ?? ptBR[key] ?? key;
}

/** Traduz uma chave para um idioma específico (usado pelo hook, que já sabe o locale atual). */
export function translate(locale: Locale, key: DictKey): string {
  const dict = DICTS[locale] ?? ptBR;
  return dict[key] ?? ptBR[key] ?? key;
}

/**
 * Script executado no <head>, antes da primeira pintura, para o atributo lang já
 * nascer certo (evita o <html lang="pt-BR"> piscar antes de trocar para o idioma salvo).
 */
export const LANG_INIT_SCRIPT = `(function(){try{var r=document.documentElement,s=localStorage,v=s.getItem("${LOCALE_STORAGE_KEY}"),tags={"pt-BR":"pt-BR",en:"en-US",es:"es",fr:"fr"};if(v&&tags[v])r.lang=tags[v];}catch(e){}})();`;

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_EVENT,
  loadLocale,
  saveLocale,
  translate,
  type DictKey,
  type Locale,
} from "@/lib/i18n";

/**
 * Idioma atual e função de tradução, reativos a mudanças (mesmo em outra aba).
 * Começa sempre no idioma padrão (igual ao servidor) e só troca depois de montar,
 * para não gerar divergência de hidratação quando a pessoa já salvou outro idioma.
 */
export function useI18n() {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(loadLocale());
    const onChange = () => setLocaleState(loadLocale());
    window.addEventListener(LOCALE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(LOCALE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const setLocale = useCallback((next: Locale) => saveLocale(next), []);
  const t = useCallback((key: DictKey) => translate(locale, key), [locale]);

  return { locale, setLocale, t };
}

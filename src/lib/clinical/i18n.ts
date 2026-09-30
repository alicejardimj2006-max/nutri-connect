// Textos do módulo clínico (painel do profissional e acompanhamento do paciente).
// Ficam num dicionário próprio, como os da apresentação; o português é o canônico.

import { useCallback } from "react";
import { useI18n } from "@/hooks/use-i18n";
import { loadLocale, type Locale } from "@/lib/i18n";
import ptBR, { type ClinicalKey } from "@/lib/i18n/clinical-pt-BR";
import en from "@/lib/i18n/clinical-en";
import es from "@/lib/i18n/clinical-es";
import fr from "@/lib/i18n/clinical-fr";

export type { ClinicalKey };
export type Vars = Record<string, string | number>;

const DICTS: Record<Locale, Partial<Record<ClinicalKey, string>>> = {
  "pt-BR": ptBR,
  en,
  es,
  fr,
};

function interpolate(text: string, vars?: Vars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

export function translateClinical(locale: Locale, key: ClinicalKey, vars?: Vars): string {
  return interpolate(DICTS[locale]?.[key] ?? ptBR[key] ?? key, vars);
}

/** Tradução fora de componentes (mensagens de erro, toasts disparados por funções). */
export function ct(key: ClinicalKey, vars?: Vars): string {
  return translateClinical(loadLocale(), key, vars);
}

export function useClinicalI18n() {
  const { locale } = useI18n();
  const t = useCallback(
    (key: ClinicalKey, vars?: Vars) => translateClinical(locale, key, vars),
    [locale],
  );
  return { t, locale };
}

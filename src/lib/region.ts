// Formatos regionais escolhidos em Configurações → Idioma e região: data, hora e fuso horário.
// As funções de formatação do site passam por aqui antes de montar o texto.
import { APPEARANCE_EVENT, loadAppearance, type Appearance } from "./appearance";

let current: Appearance | null = null;
if (typeof window !== "undefined") {
  window.addEventListener(APPEARANCE_EVENT, () => {
    current = null;
  });
}
const region = (): Appearance => (current ??= loadAppearance());

/** Fusos mais usados por quem está no Brasil e em países de língua portuguesa e espanhola. */
export const TIME_ZONES: { id: string; label: string }[] = [
  { id: "America/Sao_Paulo", label: "Brasília (UTC−3)" },
  { id: "America/Manaus", label: "Manaus (UTC−4)" },
  { id: "America/Cuiaba", label: "Cuiabá (UTC−4)" },
  { id: "America/Fortaleza", label: "Fortaleza / Recife (UTC−3)" },
  { id: "America/Belem", label: "Belém (UTC−3)" },
  { id: "America/Rio_Branco", label: "Rio Branco (UTC−5)" },
  { id: "America/Noronha", label: "Fernando de Noronha (UTC−2)" },
  { id: "America/Argentina/Buenos_Aires", label: "Buenos Aires (UTC−3)" },
  { id: "America/Bogota", label: "Bogotá (UTC−5)" },
  { id: "America/Mexico_City", label: "Cidade do México (UTC−6)" },
  { id: "America/New_York", label: "Nova York" },
  { id: "Europe/Lisbon", label: "Lisboa" },
  { id: "Europe/Madrid", label: "Madri" },
  { id: "Europe/Paris", label: "Paris" },
  { id: "UTC", label: "UTC" },
];

const DATE_LOCALE = { dmy: "en-GB", mdy: "en-US", ymd: "sv-SE" } as const;

function validZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat("pt-BR", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Ajusta o idioma/opções de um Intl.DateTimeFormat conforme as escolhas da pessoa.
 * O fuso só vale para datas com hora (datas “só dia” não podem mudar de dia por causa do fuso).
 */
export function applyRegion(
  tag: string,
  opts: Intl.DateTimeFormatOptions,
): [string, Intl.DateTimeFormatOptions] {
  const r = region();
  const out: Intl.DateTimeFormatOptions = { ...opts };
  let locale = tag;

  if (r.dateFormat !== "auto" && opts.month) {
    if (r.dateFormat === "long") {
      out.month = "long";
    } else if (!opts.weekday) {
      locale = DATE_LOCALE[r.dateFormat];
      out.month = "2-digit";
      if (opts.day) out.day = "2-digit";
    }
  }

  const hasTime = Boolean(opts.hour || opts.minute || opts.timeStyle);
  if (hasTime) {
    if (r.timeFormat !== "auto") out.hour12 = r.timeFormat === "12h";
    if (r.timeZone !== "auto" && validZone(r.timeZone)) out.timeZone = r.timeZone;
  }
  return [locale, out];
}

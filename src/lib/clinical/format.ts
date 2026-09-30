import { localeMeta, type Locale } from "@/lib/i18n";

const tag = (locale: Locale) => localeMeta(locale).tag;

export function formatMoney(cents: number, locale: Locale): string {
  return new Intl.NumberFormat(tag(locale), { style: "currency", currency: "BRL" }).format(
    cents / 100,
  );
}

export function formatNumber(value: number, locale: Locale, digits = 1): string {
  return new Intl.NumberFormat(tag(locale), { maximumFractionDigits: digits }).format(value);
}

export function formatDate(
  iso: string | Date,
  locale: Locale,
  opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" },
): string {
  const d = typeof iso === "string" ? parseDate(iso) : iso;
  return new Intl.DateTimeFormat(tag(locale), opts).format(d);
}

export function formatTime(iso: string | Date, locale: Locale): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat(tag(locale), { hour: "2-digit", minute: "2-digit" }).format(d);
}

export function formatWeekday(date: Date, locale: Locale, style: "long" | "short" = "short") {
  return new Intl.DateTimeFormat(tag(locale), { weekday: style }).format(date);
}

/** Nome do dia da semana (0 = domingo) no idioma atual. */
export function weekdayName(weekday: number, locale: Locale, style: "long" | "short" = "long") {
  // 2023-01-01 foi um domingo.
  return formatWeekday(new Date(2023, 0, 1 + weekday), locale, style);
}

/** Datas "YYYY-MM-DD" viram meia-noite local (sem o desvio de fuso do Date.parse). */
export function parseDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
}

/** "YYYY-MM-DD" no fuso local. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Segunda-feira da semana da data. */
export function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const diff = (d.getDay() + 6) % 7;
  return addDays(d, -diff);
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

export function ageFrom(birthDate?: string | null): number | null {
  if (!birthDate) return null;
  const b = parseDate(birthDate);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

export function initials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "NC"
  );
}

/** "HH:MM:SS" → "HH:MM". */
export function shortTime(time: string | null | undefined): string {
  return time ? time.slice(0, 5) : "";
}

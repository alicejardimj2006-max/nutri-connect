// Tema da semana no Supabase: o tema ativo (ou a prévia), a enquete com resultado e o meu voto,
// o histórico, e as ações de edição e geração da plataforma.

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { localeMeta, type Locale } from "@/lib/i18n";

type ThemeRow = Database["public"]["Functions"]["get_weekly_theme"]["Returns"][number];

export type ThemeStatus = Database["public"]["Enums"]["theme_status"];

export interface PollOption {
  id: string;
  position: number;
  text: string;
  translations: Record<string, string>;
  votes: number;
  /** A pessoa logada votou nesta opção. */
  mine: boolean;
}

export interface RemoteTheme {
  id: string;
  weekStart: string;
  status: ThemeStatus;
  title: string;
  subtitle?: string;
  description: string;
  badge?: string;
  question?: string;
  pollQuestion?: string;
  translations: Record<string, Record<string, string>>;
  source: string;
  poll: PollOption[];
}

export interface ThemeHistoryItem {
  id: string;
  weekStart: string;
  title: string;
  description: string;
  translations: Record<string, Record<string, string>>;
  recipesCount: number;
  postsCount: number;
}

/** Textos do tema já no idioma da pessoa (o português é o texto base). */
export interface LocalizedTheme {
  title: string;
  subtitle?: string;
  description: string;
  badge?: string;
  question?: string;
  pollQuestion?: string;
  options: { id: string; text: string; votes: number; mine: boolean }[];
}

/** "04 de out." a partir de "2026-10-04" (data sem hora: evita voltar um dia por causa do fuso). */
export function formatWeekStart(weekStart: string, locale: Locale): string {
  return new Date(`${weekStart}T12:00:00`).toLocaleDateString(localeMeta(locale).tag, {
    day: "2-digit",
    month: "short",
  });
}

function fail(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error("É preciso estar logado.");
  return id;
}

function toTheme(row: ThemeRow): RemoteTheme {
  return {
    id: row.id,
    weekStart: row.week_start,
    status: row.status,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    description: row.description,
    badge: row.badge ?? undefined,
    question: row.question ?? undefined,
    pollQuestion: row.poll_question ?? undefined,
    translations: (row.translations ?? {}) as RemoteTheme["translations"],
    source: row.source,
    poll: ((row.poll ?? []) as unknown as PollOption[]).map((o) => ({
      ...o,
      translations: (o.translations ?? {}) as Record<string, string>,
    })),
  };
}

export function localizeTheme(theme: RemoteTheme, locale: string): LocalizedTheme {
  const tr = locale === "pt-BR" ? undefined : theme.translations[locale];
  return {
    title: tr?.title || theme.title,
    subtitle: tr?.subtitle || theme.subtitle,
    description: tr?.description || theme.description,
    badge: tr?.badge || theme.badge,
    question: tr?.question || theme.question,
    pollQuestion: tr?.poll_question || theme.pollQuestion,
    options: theme.poll.map((o) => ({
      id: o.id,
      text: (locale !== "pt-BR" && o.translations[locale]) || o.text,
      votes: o.votes,
      mine: o.mine,
    })),
  };
}

// ── Leitura ──────────────────────────────────────────────────────────────────

/** O tema ativo, ou a prévia da próxima semana (só profissionais e a plataforma a veem). */
export async function fetchTheme(
  status: "ativo" | "previa" = "ativo",
): Promise<RemoteTheme | null> {
  const { data, error } = await supabase.rpc("get_weekly_theme", { p_status: status });
  fail(error);
  const row = (data ?? [])[0];
  return row ? toTheme(row) : null;
}

export async function fetchThemeHistory(limit = 6): Promise<ThemeHistoryItem[]> {
  const { data, error } = await supabase.rpc("theme_history", { p_limit: limit });
  fail(error);
  return (data ?? []).map((t) => ({
    id: t.id,
    weekStart: t.week_start,
    title: t.title,
    description: t.description,
    translations: (t.translations ?? {}) as ThemeHistoryItem["translations"],
    recipesCount: t.recipes_count,
    postsCount: t.posts_count,
  }));
}

// ── Votar ────────────────────────────────────────────────────────────────────

/** Vota (ou muda o voto) na enquete do tema ativo. */
export async function voteInPoll(themeId: string, optionId: string): Promise<void> {
  const me = await currentUserId();
  const { error } = await supabase
    .from("theme_poll_votes")
    .upsert(
      { theme_id: themeId, option_id: optionId, user_id: me },
      { onConflict: "theme_id,user_id" },
    );
  fail(error);
}

// ── Plataforma ───────────────────────────────────────────────────────────────

export interface ThemeEdit {
  title: string;
  subtitle: string;
  description: string;
  question: string;
  pollQuestion: string;
  options: { id: string; text: string }[];
}

/** A plataforma edita a prévia (o banco registra quem editou). */
export async function updateTheme(themeId: string, edit: ThemeEdit): Promise<void> {
  const { error } = await supabase
    .from("weekly_themes")
    .update({
      title: edit.title.trim(),
      subtitle: edit.subtitle.trim() || null,
      description: edit.description.trim(),
      question: edit.question.trim() || null,
      poll_question: edit.pollQuestion.trim() || null,
    })
    .eq("id", themeId);
  fail(error);
  for (const option of edit.options) {
    const { error: optionError } = await supabase
      .from("theme_poll_options")
      .update({ text: option.text.trim() })
      .eq("id", option.id);
    fail(optionError);
  }
}

/** A plataforma pede uma nova prévia agora (a função gera com a IA, ou com o tema sazonal). */
export async function regeneratePreview(): Promise<{ source: string }> {
  const { data, error } = await supabase.functions.invoke<{ source?: string; error?: string }>(
    "weekly-theme",
    { body: { force: true } },
  );
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return { source: data?.source ?? "?" };
}

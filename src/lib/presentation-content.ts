// Conteúdo da apresentação editável pelo painel. O código (presentation-*.ts e slides.tsx) continua
// sendo o padrão; o banco guarda só o que o administrador mudou, como pares "caminho → texto".
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PresentationCopy } from "@/lib/i18n/presentation";
import type { Locale } from "@/lib/i18n/locales";
import { readCustom, type Block, type CustomSlide } from "@/lib/custom-slides";

/** Chave de cada documento em presentation_docs: um por idioma e um para o layout. */
export type PresentationKey = Locale | "layout";

/**
 * Alterações em relação ao código: caminho → texto (ex.: "cover.title") ou, para listas, a lista inteira
 * (ex.: "differentials.items"), para que dá para adicionar e remover itens.
 */
export type TextOverrides = Record<string, string | unknown[]>;

/** Layout: ordem dos slides por parte, slides escondidos e fotos da equipe (índice → URL). */
export interface PresentationLayout {
  /** Parte (0–4) → ids dos slides na ordem desejada. */
  order: Record<string, string[]>;
  /** Ids dos slides que não aparecem. */
  hidden: string[];
  /** Slides prontos excluídos (ficam na lixeira e podem voltar). */
  deleted: string[];
  /** Índice do integrante (0–4) → URL da foto. */
  avatars: Record<string, string>;
  /** Slides personalizados (montados com blocos), na ordem em que foram criados. */
  custom: CustomSlide[];
}

export const EMPTY_LAYOUT: PresentationLayout = {
  order: {},
  hidden: [],
  deleted: [],
  avatars: {},
  custom: [],
};

export const PRESENTATION_KEYS: PresentationKey[] = ["pt-BR", "en", "es", "fr", "layout"];

interface PublishedRow {
  key: string;
  published: unknown;
}

type RpcClient = {
  rpc: (
    name: string,
    args?: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
};

/** Versões publicadas de todos os documentos (leitura pública). Sem conexão ou sem a função, volta vazio. */
export async function fetchPublishedPresentation(): Promise<
  Partial<Record<PresentationKey, unknown>>
> {
  try {
    const { data, error } = await (supabase as unknown as RpcClient).rpc("presentation_published");
    if (error || !Array.isArray(data)) return {};
    return Object.fromEntries((data as PublishedRow[]).map((r) => [r.key, r.published]));
  } catch {
    return {};
  }
}

export function usePublishedPresentation() {
  return useQuery({
    queryKey: ["presentation", "published"],
    queryFn: fetchPublishedPresentation,
    staleTime: 60_000,
    retry: false,
  });
}

/** Lê o layout publicado, tolerando dados incompletos ou de outra versão. */
export function readLayout(raw: unknown): PresentationLayout {
  if (!raw || typeof raw !== "object") return EMPTY_LAYOUT;
  const r = raw as Partial<PresentationLayout>;
  return {
    order: r.order && typeof r.order === "object" ? r.order : {},
    hidden: Array.isArray(r.hidden) ? r.hidden.filter((x) => typeof x === "string") : [],
    deleted: Array.isArray(r.deleted) ? r.deleted.filter((x) => typeof x === "string") : [],
    avatars: r.avatars && typeof r.avatars === "object" ? r.avatars : {},
    custom: readCustom(r.custom),
  };
}

/** Lê os textos publicados de um idioma, descartando valores que não são texto nem lista. */
export function readTexts(raw: unknown): TextOverrides {
  if (!raw || typeof raw !== "object") return {};
  return Object.fromEntries(
    Object.entries(raw as Record<string, unknown>).filter(
      (entry): entry is [string, string | unknown[]] =>
        typeof entry[1] === "string" || Array.isArray(entry[1]),
    ),
  );
}

/** Lê o valor num caminho ("a.b.0.c"); undefined se não existir. */
export function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((node, k) => {
    if (node && typeof node === "object") return (node as Record<string, unknown>)[k];
    return undefined;
  }, obj);
}

/** Cópia do conteúdo com um valor trocado no caminho. Não mexe no original. */
export function setPath<T>(obj: T, path: string, value: unknown): T {
  const next = structuredClone(obj);
  const keys = path.split(".");
  const last = keys.pop();
  if (last === undefined) return next;
  let node = next as unknown as Record<string, unknown>;
  for (const k of keys) node = node[k] as Record<string, unknown>;
  node[last] = value;
  return next;
}

/**
 * Compara o conteúdo editado com o do código e devolve só o que mudou. Listas entram inteiras
 * (não se abre item por item), então adicionar ou remover um item fica registrado de forma simples.
 */
export function diffCopy(base: unknown, edited: unknown, prefix = "", out: TextOverrides = {}) {
  if (Array.isArray(base) || Array.isArray(edited)) {
    if (JSON.stringify(base) !== JSON.stringify(edited) && prefix)
      out[prefix] = edited as unknown[];
    return out;
  }
  if (typeof base === "string" || typeof edited === "string") {
    if (base !== edited && prefix) out[prefix] = edited as string;
    return out;
  }
  if (base && typeof base === "object" && edited && typeof edited === "object") {
    for (const k of Object.keys(base)) {
      diffCopy(
        (base as Record<string, unknown>)[k],
        (edited as Record<string, unknown>)[k],
        prefix ? `${prefix}.${k}` : k,
        out,
      );
    }
  }
  return out;
}

/** Todos os campos de texto do conteúdo, como caminho → valor padrão (do código). */
export function flattenTexts(obj: unknown, prefix = "", out: TextOverrides = {}): TextOverrides {
  if (typeof obj === "string") {
    out[prefix] = obj;
  } else if (Array.isArray(obj)) {
    obj.forEach((v, i) => flattenTexts(v, prefix ? `${prefix}.${i}` : String(i), out));
  } else if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      flattenTexts(v, prefix ? `${prefix}.${k}` : k, out);
    }
  }
  return out;
}

/** Copia o conteúdo do código e troca só os campos alterados. Não mexe no original. */
export function applyTexts(copy: PresentationCopy, texts: TextOverrides): PresentationCopy {
  const next = structuredClone(copy);
  for (const [path, value] of Object.entries(texts)) {
    const keys = path.split(".");
    const last = keys.pop();
    if (last === undefined) continue;
    let node = next as unknown as Record<string, unknown>;
    let valid = true;
    for (const k of keys) {
      const child: unknown = node[k];
      if (!child || typeof child !== "object") {
        valid = false;
        break;
      }
      node = child as Record<string, unknown>;
    }
    // Só troca campos que já existem (texto ou lista): um caminho inválido é ignorado, nunca cria campo novo.
    const current = node[last];
    if (valid && typeof current === "string" && typeof value === "string") node[last] = value;
    if (valid && Array.isArray(current) && Array.isArray(value))
      node[last] = structuredClone(value);
  }
  return next;
}

/** Todos os slides na ordem do layout, dentro de cada parte (escondidos inclusive). */
export function orderSlides<T extends { id: string; part: number }>(
  slides: T[],
  layout: PresentationLayout,
): T[] {
  const result: T[] = [];
  const parts = [...new Set(slides.map((s) => s.part))].sort((a, b) => a - b);
  for (const part of parts) {
    const rank = new Map((layout.order[String(part)] ?? []).map((id, i) => [id, i]));
    // Slides fora da lista salva ficam no fim, na ordem do código.
    const own = slides
      .filter((s) => s.part === part)
      .sort((a, b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity));
    result.push(...own);
  }
  return result;
}

/** Slides depois do layout: escondidos saem e cada parte mantém pelo menos um. "capa" nunca some. */
export function arrangeSlides<T extends { id: string; part: number }>(
  slides: T[],
  layout: PresentationLayout,
): T[] {
  const hidden = new Set([...layout.hidden, ...layout.deleted].filter((id) => id !== "capa"));
  const result: T[] = [];
  const parts = [...new Set(slides.map((s) => s.part))].sort((a, b) => a - b);
  for (const part of parts) {
    const sorted = orderSlides(
      slides.filter((s) => s.part === part),
      layout,
    );
    const visible = sorted.filter((s) => !hidden.has(s.id));
    // Uma parte nunca fica sem slide: se tudo estiver escondido, mostra o primeiro.
    result.push(...(visible.length ? visible : sorted.slice(0, 1)));
  }
  return result;
}

/** Índice do primeiro slide de cada parte na lista já organizada. */
export function partStartsOf<T extends { part: number }>(slides: T[], parts: number): number[] {
  return Array.from({ length: parts }, (_, i) => slides.findIndex((s) => s.part === i));
}

// ── Edição sobre a apresentação real ─────────────────────────────────────────
// No modo edição, cada texto do conteúdo leva o próprio caminho escondido em caracteres de largura
// zero. Assim o clique no slide descobre qual campo é, sem mudar os componentes nem o visual.
const MARK_OPEN = "﻿";
const MARK_CLOSE = "‎";
const MARK_DIGITS = ["​", "‌", "‍", "⁠", "⁡", "⁢", "⁣", "⁤"];

function encodeMark(path: string): string {
  return Array.from(path)
    .map((ch) =>
      ch
        .charCodeAt(0)
        .toString(8)
        .padStart(3, "0")
        .split("")
        .map((d) => MARK_DIGITS[Number(d)])
        .join(""),
    )
    .join("");
}

/** Caminho escondido no texto, ou null se o texto não tem marca. */
export function readMark(text: string): string | null {
  const start = text.indexOf(MARK_OPEN);
  if (start < 0) return null;
  const end = text.indexOf(MARK_CLOSE, start);
  if (end < 0) return null;
  const body = text.slice(start + 1, end);
  let out = "";
  for (let i = 0; i + 3 <= body.length; i += 3) {
    const digits = [body[i], body[i + 1], body[i + 2]].map((s) => MARK_DIGITS.indexOf(s));
    if (digits.some((d) => d < 0)) return null;
    out += String.fromCharCode(parseInt(digits.join(""), 8));
  }
  return out || null;
}

/** Copia do conteúdo em que cada texto carrega o próprio caminho (só para exibir e clicar). */
export function markCopy<T>(value: T, path = ""): T {
  if (typeof value === "string") {
    return `${value}${MARK_OPEN}${encodeMark(path)}${MARK_CLOSE}` as T;
  }
  if (Array.isArray(value)) {
    return value.map((v, i) => markCopy(v, path ? `${path}.${i}` : String(i))) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, markCopy(v, path ? `${path}.${k}` : k)]),
    ) as T;
  }
  return value;
}

/** O que o modo edição da apresentação recebe do painel de administração. */
export interface DeckEditor {
  locale: Locale;
  onLocale: (locale: Locale) => void;
  /** Conteúdo em edição (já com os textos alterados). */
  copy: PresentationCopy;
  layout: PresentationLayout;
  /** Clique num texto: caminho do campo e a posição na tela. */
  onText: (path: string, rect: DOMRect) => void;
  /** Clique numa foto da equipe (índice do integrante). */
  onPhoto: (index: number, rect: DOMRect) => void;
  /** Bloco selecionado num slide personalizado. */
  selectedBlock?: string | null;
  onSelectBlock?: (blockId: string | null) => void;
  /** Mudança de posição ou tamanho de um bloco (arrastar ou redimensionar). */
  onPatchBlock?: (
    slideId: string,
    blockId: string,
    patch: Partial<Pick<Block, "x" | "y" | "w" | "h">>,
  ) => void;
  /** Slide que está na tela agora (para o painel saber o que mostrar). */
  onCurrentSlide?: (slideId: string) => void;
  /** Pede para mostrar um slide (o n muda a cada pedido, mesmo para o mesmo slide). */
  focus?: { id: string; n: number } | null;
}

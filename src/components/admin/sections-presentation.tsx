// Apresentação (/apresentacao) editável: textos por idioma, fotos da equipe e ordem dos slides.
// Tudo entra primeiro como rascunho; só vai ao ar quando o administrador publica.
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Eye,
  EyeOff,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import {
  btnCls,
  btnDanger,
  btnPrimary,
  inputCls,
  Panel,
  QueryError,
} from "@/components/admin/admin-ui";
import { adminRpc } from "@/lib/admin-api";
import { supabase } from "@/integrations/supabase/client";
import { SLIDES, type SlideApi, type SlideDef } from "@/components/presentation/slides";
import { StaticContext } from "@/components/presentation/effects";
import { PRESENTERS, avatarOf, initials } from "@/components/presentation/parts";
import { presentationCopy, type PresentationCopy } from "@/lib/i18n/presentation";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import {
  applyTexts,
  diffCopy,
  orderSlides,
  readLayout,
  readTexts,
  setPath,
  type PresentationKey,
  type PresentationLayout,
} from "@/lib/presentation-content";
const ADMIN_KEY = ["admin", "presentation"] as const;
const PUBLIC_KEY = ["presentation", "published"] as const;
const BUCKET = "presentation-photos";
const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

type View = "textos" | "equipe" | "ordem";

interface PresentationRow {
  key: PresentationKey;
  draft: unknown;
  published: unknown;
  updated_at: string;
}

/** Nome de cada bloco de textos, para o administrador achar o que procura. */
const GROUP_TITLE: Record<string, string> = {
  meta: "Título da aba e descrição (SEO)",
  ui: "Interface, botões e legendas",
  parts: "Títulos e subtítulos das partes",
  ninaIntro: "Conheça a Nina",
  cover: "Capa",
  team: "Equipe",
  problem: "Problema",
  solution: "Solução",
  differentials: "Diferenciais",
  personas: "Personas",
  competitors: "Concorrentes",
  comparison: "Comparativo",
  canvas: "Modelo de negócio (canvas)",
  finance: "Planejamento financeiro (use {fee}, {total} etc. como estão)",
  course: "Curso",
  tourIntro: "Plataforma: introdução",
  tour: "Plataforma: telas",
  mock: "Textos das telas de exemplo",
  join: "Convite final",
};

/** JSON com as chaves em ordem, para comparar rascunho e publicado sem depender da ordem de inserção. */
function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableJson((value as Record<string, unknown>)[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

function usePresentationRows() {
  return useQuery({
    queryKey: ADMIN_KEY,
    queryFn: () => adminRpc<PresentationRow[]>("admin_presentation_get"),
  });
}

type PresentationCall =
  "admin_presentation_save_draft" | "admin_presentation_publish" | "admin_presentation_discard";

function usePresentationAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { name: PresentationCall; args: Record<string, unknown>; ok: string }) =>
      adminRpc(v.name, v.args),
    onSuccess: (_data, v) => {
      toast.success(v.ok);
      void qc.invalidateQueries({ queryKey: ADMIN_KEY });
      void qc.invalidateQueries({ queryKey: PUBLIC_KEY });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Não foi possível salvar."),
  });
}

export function PresentationSection() {
  const rows = usePresentationRows();
  const act = usePresentationAction();
  const [view, setView] = useState<View>("textos");
  const [locale, setLocale] = useState<Locale>("pt-BR");

  if (rows.error) return <QueryError error={rows.error} />;
  const byKey = new Map((rows.data ?? []).map((r) => [r.key, r]));
  const row = byKey.get(locale);
  const layoutRow = byKey.get("layout");
  const current = view === "textos" ? row : layoutRow;
  const pending = current ? stableJson(current.draft) !== stableJson(current.published) : false;

  return (
    <Panel
      title="Apresentação"
      hint="Edite aqui o que aparece em /apresentacao. Suas mudanças ficam em rascunho até você clicar em Publicar; o rascunho não aparece para ninguém."
      action={
        <Link to="/apresentacao" className={btnCls} target="_blank" rel="noreferrer">
          <ExternalLink className="h-3.5 w-3.5" /> Abrir apresentação
        </Link>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["textos", "equipe", "ordem"] as View[]).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => setView(v)}
            className={view === v ? btnPrimary : btnCls}
          >
            {v === "textos" ? "Textos" : v === "equipe" ? "Equipe e fotos" : "Ordem e slides"}
          </button>
        ))}
        {view === "textos" && (
          <div className="ml-auto flex gap-1" role="group" aria-label="Idioma">
            {LOCALES.map((l) => (
              <button
                key={l.id}
                type="button"
                aria-pressed={locale === l.id}
                onClick={() => setLocale(l.id)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  locale === l.id ? "border-accent bg-accent-soft" : "border-border bg-card"
                }`}
              >
                {l.id}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mb-4 text-xs text-muted-foreground">
        {pending
          ? "Há alterações ainda não publicadas."
          : "Tudo o que está em rascunho já está publicado."}
      </p>

      {rows.isLoading || !rows.data ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : !row || !layoutRow ? (
        <p className="text-sm text-muted-foreground">
          As linhas da apresentação ainda não existem no banco. Confira se a migration foi aplicada.
        </p>
      ) : view === "textos" ? (
        <TextsEditor key={`${locale}-${row.updated_at}`} locale={locale} row={row} act={act} />
      ) : (
        <LayoutEditor key={layoutRow.updated_at} row={layoutRow} view={view} act={act} />
      )}
    </Panel>
  );
}

// ── Textos (com o slide real ao lado) ─────────────────────────────────────────

type Change = (path: string, value: unknown) => void;

const NOOP_API: SlideApi = { next() {}, goTo() {}, goToId() {}, partStarts: [] };
const PREVIEW_W = 1280;
const PREVIEW_H = 720;

/** Troca os textos de um item recém-criado por "Novo texto", mantendo o formato do item anterior. */
function blankLike(item: unknown): unknown {
  if (typeof item === "string") return "Novo texto";
  if (Array.isArray(item)) return item.map(blankLike);
  if (item && typeof item === "object") {
    return Object.fromEntries(Object.entries(item).map(([k, v]) => [k, blankLike(v)]));
  }
  return item;
}

function FieldText({ value, path, onChange }: { value: string; path: string; onChange: Change }) {
  const long = value.length > 70 || value.includes("\n");
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[11px] text-muted-foreground">{path}</span>
      {long ? (
        <textarea
          className={`${inputCls} min-h-[4.5rem]`}
          value={value}
          onChange={(e) => onChange(path, e.target.value)}
        />
      ) : (
        <input
          className={inputCls}
          value={value}
          onChange={(e) => onChange(path, e.target.value)}
        />
      )}
    </label>
  );
}

/** Lista (de textos ou de blocos): adiciona, remove e reordena itens. */
function FieldList({ list, path, onChange }: { list: unknown[]; path: string; onChange: Change }) {
  const replace = (next: unknown[]) => onChange(path, next);
  const move = (i: number, dir: -1 | 1) => {
    const next = [...list];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    replace(next);
  };
  const remove = (i: number) => replace(list.filter((_, idx) => idx !== i));
  const add = () => {
    const template = list[list.length - 1];
    replace([...list, template === undefined ? "Novo texto" : blankLike(template)]);
  };

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-border p-3">
      <p className="font-mono text-[11px] text-muted-foreground">
        {path} · {list.length} {list.length === 1 ? "item" : "itens"}
      </p>
      {list.map((item, i) => (
        <div key={`${path}.${i}`} className="space-y-2 rounded-lg bg-secondary/40 p-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Item {i + 1}</span>
            <span className="flex shrink-0 gap-1">
              <button
                type="button"
                className={btnCls}
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Subir item"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className={btnCls}
                onClick={() => move(i, 1)}
                disabled={i === list.length - 1}
                aria-label="Descer item"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className={btnDanger}
                onClick={() => remove(i)}
                aria-label="Remover item"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          </div>
          <FieldNode node={item} path={`${path}.${i}`} onChange={onChange} />
        </div>
      ))}
      <button type="button" className={btnCls} onClick={add}>
        <Plus className="h-3.5 w-3.5" /> Adicionar item
      </button>
    </div>
  );
}

/** Desenha cada folha do conteúdo: texto vira campo, lista vira FieldList e objeto vira um bloco de campos. */
function FieldNode({ node, path, onChange }: { node: unknown; path: string; onChange: Change }) {
  if (typeof node === "string") return <FieldText value={node} path={path} onChange={onChange} />;
  if (Array.isArray(node)) return <FieldList list={node} path={path} onChange={onChange} />;
  if (node && typeof node === "object") {
    return (
      <div className="space-y-3">
        {Object.entries(node).map(([k, v]) => (
          <FieldNode key={k} node={v} path={`${path}.${k}`} onChange={onChange} />
        ))}
      </div>
    );
  }
  return null;
}

/** O slide real, desenhado no tamanho de referência e reduzido para caber na coluna. */
function SlidePreview({ slide, copy }: { slide: SlideDef; copy: PresentationCopy }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / PREVIEW_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div
      ref={box}
      className="relative w-full overflow-hidden rounded-2xl border border-border bg-background"
      style={{ height: PREVIEW_H * scale }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: PREVIEW_W, height: PREVIEW_H, transform: `scale(${scale})` }}
      >
        <StaticContext.Provider value={true}>
          <div className="h-full w-full overflow-hidden">{slide.render(copy, NOOP_API)}</div>
        </StaticContext.Provider>
      </div>
    </div>
  );
}

function TextsEditor({
  locale,
  row,
  act,
}: {
  locale: Locale;
  row: PresentationRow;
  act: ReturnType<typeof usePresentationAction>;
}) {
  const base = useMemo(() => presentationCopy(locale), [locale]);
  const saved = useMemo(() => readTexts(row.draft), [row.draft]);
  // O conteúdo inteiro em edição: o slide ao lado usa esta mesma cópia, então mostra cada mudança na hora.
  const [work, setWork] = useState<PresentationCopy>(() => applyTexts(base, saved));
  const [slideId, setSlideId] = useState(SLIDES[0].id);
  const overrides = useMemo(() => diffCopy(base, work), [base, work]);
  const dirty = stableJson(overrides) !== stableJson(saved);
  const pending = stableJson(row.draft) !== stableJson(row.published);
  const slide = SLIDES.find((s) => s.id === slideId) ?? SLIDES[0];

  const groups = Object.keys(work) as (keyof PresentationCopy)[];

  const change: Change = (path, value) => setWork((cur) => setPath(cur, path, value));

  const save = () =>
    act.mutateAsync({
      name: "admin_presentation_save_draft",
      args: { p_key: locale, p_draft: overrides },
      ok: "Rascunho salvo.",
    });

  const publish = async () => {
    try {
      if (dirty) await save();
      await act.mutateAsync({
        name: "admin_presentation_publish",
        args: { p_key: locale },
        ok: "Textos publicados.",
      });
    } catch {
      // O aviso de erro já apareceu pelo hook.
    }
  };

  const discard = async () => {
    try {
      await act.mutateAsync({
        name: "admin_presentation_discard",
        args: { p_key: locale },
        ok: "Rascunho descartado.",
      });
    } catch {
      // O aviso de erro já apareceu pelo hook.
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Campos entre chaves, como {"{n}"} ou {"{fee}"}, são preenchidos pelo sistema: mantenha-os
          no texto. Listas aceitam adicionar, remover e reordenar itens.
        </p>
        {groups.map((group) => (
          <details key={group} className="rounded-2xl border border-border bg-card p-3">
            <summary className="cursor-pointer select-none text-sm font-semibold">
              {GROUP_TITLE[group] ?? group}
            </summary>
            <div className="mt-3">
              <FieldNode node={work[group]} path={group} onChange={change} />
            </div>
          </details>
        ))}
      </div>

      <div className="space-y-3 lg:sticky lg:top-4 lg:self-start">
        <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          Slide
          <select
            className={inputCls}
            value={slide.id}
            onChange={(e) => setSlideId(e.target.value)}
          >
            {SLIDES.map((s, i) => (
              <option key={s.id} value={s.id}>
                {i + 1} · {PRESENTERS[s.part].name} · {s.label ? s.label(work) : s.id}
              </option>
            ))}
          </select>
        </label>
        <SlidePreview key={`${slide.id}-${locale}`} slide={slide} copy={work} />
        <p className="text-xs text-muted-foreground">
          Prévia aproximada: a apresentação real usa o tamanho da tela de quem assiste.
        </p>
      </div>

      <div className="lg:col-span-2">
        <EditorFooter
          dirty={dirty}
          pending={pending}
          busy={act.isPending}
          onSave={() => void save()}
          onPublish={() => void publish()}
          onDiscard={() => void discard()}
        />
      </div>
    </div>
  );
}

function EditorFooter({
  dirty,
  pending,
  busy,
  onSave,
  onPublish,
  onDiscard,
}: {
  dirty: boolean;
  pending: boolean;
  busy: boolean;
  onSave: () => void;
  onPublish: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="sticky bottom-3 flex flex-wrap items-center justify-end gap-2 rounded-2xl border border-border bg-background/95 p-3 shadow-card backdrop-blur">
      <button
        type="button"
        className={btnDanger}
        onClick={onDiscard}
        disabled={busy || !pending || dirty}
      >
        <RotateCcw className="h-3.5 w-3.5" /> Descartar rascunho
      </button>
      <button type="button" className={btnCls} onClick={onSave} disabled={busy || !dirty}>
        Salvar rascunho
      </button>
      <button
        type="button"
        className={btnPrimary}
        onClick={onPublish}
        disabled={busy || (!dirty && !pending)}
      >
        Publicar
      </button>
    </div>
  );
}

// ── Equipe e ordem (um só layout) ─────────────────────────────────────────────

function LayoutEditor({
  row,
  view,
  act,
}: {
  row: PresentationRow;
  view: Exclude<View, "textos">;
  act: ReturnType<typeof usePresentationAction>;
}) {
  const saved = useMemo(() => readLayout(row.draft), [row.draft]);
  const [local, setLocal] = useState<PresentationLayout>(saved);
  const [uploading, setUploading] = useState<number | null>(null);
  const dirty = stableJson(local) !== stableJson(saved);
  const pending = stableJson(row.draft) !== stableJson(row.published);

  const save = () =>
    act.mutateAsync({
      name: "admin_presentation_save_draft",
      args: { p_key: "layout", p_draft: local },
      ok: "Rascunho salvo.",
    });

  const publish = async () => {
    try {
      if (dirty) await save();
      await act.mutateAsync({
        name: "admin_presentation_publish",
        args: { p_key: "layout" },
        ok: "Equipe e ordem publicadas.",
      });
    } catch {
      // O aviso de erro já apareceu pelo hook.
    }
  };

  const discard = async () => {
    try {
      await act.mutateAsync({
        name: "admin_presentation_discard",
        args: { p_key: "layout" },
        ok: "Rascunho descartado.",
      });
    } catch {
      // O aviso de erro já apareceu pelo hook.
    }
  };

  const uploadPhoto = async (index: number, file: File) => {
    if (!PHOTO_TYPES.includes(file.type)) return toast.error("Use uma foto JPEG, PNG ou WebP.");
    if (file.size > MAX_PHOTO_BYTES) return toast.error("A foto passa de 3 MB.");
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `team/${index}-${Date.now()}.${ext}`;
    setUploading(index);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    setUploading(null);
    if (error) return toast.error(`Não foi possível enviar a foto: ${error.message}`);
    const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    setLocal((cur) => ({ ...cur, avatars: { ...cur.avatars, [String(index)]: url } }));
    toast.success("Foto enviada. Salve o rascunho e publique para aparecer na apresentação.");
  };

  const restoreCodePhoto = (index: number) =>
    setLocal((cur) => {
      const avatars = { ...cur.avatars };
      delete avatars[String(index)];
      return { ...cur, avatars };
    });

  const visibleCount = (part: number) =>
    orderSlides(
      SLIDES.filter((s) => s.part === part),
      local,
    ).filter((s) => !local.hidden.includes(s.id)).length;

  const toggleHidden = (id: string) =>
    setLocal((cur) => ({
      ...cur,
      hidden: cur.hidden.includes(id) ? cur.hidden.filter((x) => x !== id) : [...cur.hidden, id],
    }));

  const move = (part: number, index: number, dir: -1 | 1) => {
    const ids = orderSlides(
      SLIDES.filter((s) => s.part === part),
      local,
    ).map((s) => s.id);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setLocal((cur) => ({ ...cur, order: { ...cur.order, [String(part)]: ids } }));
  };

  const copy = presentationCopy("pt-BR");

  return (
    <div className="space-y-4">
      {view === "equipe" ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {PRESENTERS.map((p, i) => {
            const avatar = avatarOf(i, local.avatars);
            const custom = Boolean(local.avatars[String(i)]);
            return (
              <li
                key={p.name}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3"
              >
                <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-secondary text-lg font-bold">
                  {avatar ? (
                    <img src={avatar} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    initials(p.name)
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {custom ? "Foto enviada no painel" : "Foto do código"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <label className={`${btnCls} cursor-pointer`}>
                      <Upload className="h-3.5 w-3.5" />
                      {uploading === i ? "Enviando…" : "Trocar foto"}
                      <input
                        type="file"
                        accept={PHOTO_TYPES.join(",")}
                        className="sr-only"
                        disabled={uploading !== null}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (file) void uploadPhoto(i, file);
                        }}
                      />
                    </label>
                    {custom && (
                      <button type="button" className={btnCls} onClick={() => restoreCodePhoto(i)}>
                        Usar a foto do código
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Os slides mudam de posição só dentro da própria parte, para não trocar quem apresenta. A
            capa nunca some, e cada parte mantém pelo menos um slide visível.
          </p>
          {PRESENTERS.map((p, part) => {
            const items = orderSlides(
              SLIDES.filter((s) => s.part === part),
              local,
            );
            const visible = visibleCount(part);
            return (
              <div key={p.name} className="rounded-2xl border border-border bg-card p-3">
                <p className="mb-2 text-sm font-semibold">
                  {part + 1} · {copy.parts[part].title}{" "}
                  <span className="text-xs text-muted-foreground">({p.name})</span>
                </p>
                <ol className="space-y-2">
                  {items.map((s, i) => {
                    const hidden = local.hidden.includes(s.id);
                    const lastVisible = !hidden && visible === 1;
                    const label = s.label ? s.label(copy) : s.id;
                    return (
                      <li
                        key={s.id}
                        className={`flex items-center gap-2 rounded-xl border border-border px-3 py-2 ${
                          hidden ? "opacity-50" : ""
                        }`}
                      >
                        <span className="flex-1 truncate text-sm">
                          {label}
                          {hidden && (
                            <span className="ml-2 text-xs text-muted-foreground">(escondido)</span>
                          )}
                        </span>
                        <button
                          type="button"
                          className={btnCls}
                          aria-label={`Subir ${label}`}
                          onClick={() => move(part, i, -1)}
                          disabled={i === 0}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          className={btnCls}
                          aria-label={`Descer ${label}`}
                          onClick={() => move(part, i, 1)}
                          disabled={i === items.length - 1}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          className={btnCls}
                          aria-label={hidden ? `Mostrar ${label}` : `Esconder ${label}`}
                          onClick={() => toggleHidden(s.id)}
                          disabled={s.id === "capa" || lastVisible}
                          title={
                            s.id === "capa"
                              ? "A capa sempre aparece"
                              : lastVisible
                                ? "Cada parte precisa de pelo menos um slide"
                                : undefined
                          }
                        >
                          {hidden ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            );
          })}
        </div>
      )}

      <EditorFooter
        dirty={dirty}
        pending={pending}
        busy={act.isPending || uploading !== null}
        onSave={() => void save()}
        onPublish={() => void publish()}
        onDiscard={() => void discard()}
      />
    </div>
  );
}

// Editor da apresentação no admin: a apresentação real (mesmo componente do /apresentacao, com a Nina 3D)
// em tela cheia. Clicar num texto abre o campo para editar; clicar numa foto troca a imagem.
// Tudo fica em rascunho até "Publicar".
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2, Upload, X } from "lucide-react";
import { btnCls, btnDanger, btnPrimary, inputCls } from "@/components/admin/admin-ui";
import { adminRpc } from "@/lib/admin-api";
import { supabase } from "@/integrations/supabase/client";
import { PresentationDeck } from "@/components/presentation/deck";
import { SLIDES } from "@/components/presentation/slides";
import { PRESENTERS, avatarOf, initials } from "@/components/presentation/parts";
import { presentationCopy, type PresentationCopy } from "@/lib/i18n/presentation";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import {
  applyTexts,
  diffCopy,
  getPath,
  orderSlides,
  readLayout,
  readTexts,
  setPath,
  type DeckEditor,
  type PresentationKey,
  type PresentationLayout,
} from "@/lib/presentation-content";

const ADMIN_KEY = ["admin", "presentation"] as const;
const PUBLIC_KEY = ["presentation", "published"] as const;
const BUCKET = "presentation-photos";
const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface PresentationRow {
  key: PresentationKey;
  draft: unknown;
  published: unknown;
  updated_at: string;
}

/** JSON com as chaves em ordem, para comparar rascunho e publicado sem depender da ordem. */
export function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableJson((value as Record<string, unknown>)[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

export function usePresentationRows() {
  return useQuery({
    queryKey: ADMIN_KEY,
    queryFn: () => adminRpc<PresentationRow[]>("admin_presentation_get"),
  });
}

export type PresentationCall =
  "admin_presentation_save_draft" | "admin_presentation_publish" | "admin_presentation_discard";

export function usePresentationAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { name: PresentationCall; args: Record<string, unknown>; ok?: string }) =>
      adminRpc(v.name, v.args),
    onSuccess: (_data, v) => {
      if (v.ok) toast.success(v.ok);
      void qc.invalidateQueries({ queryKey: ADMIN_KEY });
      void qc.invalidateQueries({ queryKey: PUBLIC_KEY });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Não foi possível salvar."),
  });
}

/** Item recém-criado: mesmo formato do anterior, com textos "Novo texto". */
function blankLike(item: unknown): unknown {
  if (typeof item === "string") return "Novo texto";
  if (Array.isArray(item)) return item.map(blankLike);
  if (item && typeof item === "object") {
    return Object.fromEntries(Object.entries(item).map(([k, v]) => [k, blankLike(v)]));
  }
  return item;
}

/** Posição de lista num caminho ("a.items.2.title" → lista "a.items", índice 2). */
function listOf(path: string): { listPath: string; index: number } | null {
  const segs = path.split(".");
  for (let k = segs.length - 2; k >= 0; k--) {
    if (/^\d+$/.test(segs[k]))
      return { listPath: segs.slice(0, k).join("."), index: Number(segs[k]) };
  }
  return null;
}

type Target = { kind: "text"; path: string } | { kind: "photo"; index: number };

export function PresentationEditor({ onClose }: { onClose: () => void }) {
  const rows = usePresentationRows();
  const act = usePresentationAction();
  const [locale, setLocale] = useState<Locale>("pt-BR");
  const [works, setWorks] = useState<Partial<Record<Locale, PresentationCopy>>>({});
  const [layoutEdit, setLayoutEdit] = useState<PresentationLayout | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);

  const byKey = useMemo(() => new Map((rows.data ?? []).map((r) => [r.key, r])), [rows.data]);
  const savedWorks = useMemo(
    () =>
      Object.fromEntries(
        LOCALES.map((l) => [
          l.id,
          applyTexts(presentationCopy(l.id), readTexts(byKey.get(l.id)?.draft)),
        ]),
      ) as Record<Locale, PresentationCopy>,
    [byKey],
  );
  const layoutRow = byKey.get("layout");
  const layoutSaved = useMemo(() => readLayout(layoutRow?.draft), [layoutRow?.draft]);

  const work = works[locale] ?? savedWorks[locale];
  const layout = layoutEdit ?? layoutSaved;

  const setWork = (fn: (c: PresentationCopy) => PresentationCopy) =>
    setWorks((cur) => ({ ...cur, [locale]: fn(cur[locale] ?? savedWorks[locale]) }));
  const setLayout = (fn: (l: PresentationLayout) => PresentationLayout) =>
    setLayoutEdit((cur) => fn(cur ?? layoutSaved));

  const overrides = useMemo(() => diffCopy(presentationCopy(locale), work), [locale, work]);
  const textRow = byKey.get(locale);
  const textDirty = stableJson(overrides) !== stableJson(readTexts(textRow?.draft));
  const layoutDirty = stableJson(layout) !== stableJson(layoutSaved);
  const dirty = textDirty || layoutDirty;
  const pending =
    stableJson(textRow?.draft) !== stableJson(textRow?.published) ||
    stableJson(layoutRow?.draft) !== stableJson(layoutRow?.published);

  const saveAll = async () => {
    if (textDirty)
      await act.mutateAsync({
        name: "admin_presentation_save_draft",
        args: { p_key: locale, p_draft: overrides },
        ok: "Rascunho salvo.",
      });
    if (layoutDirty)
      await act.mutateAsync({
        name: "admin_presentation_save_draft",
        args: { p_key: "layout", p_draft: layout },
        ok: "Rascunho salvo.",
      });
  };

  const run = async (fn: () => Promise<void>) => {
    try {
      await fn();
    } catch {
      // O aviso de erro já apareceu pelo hook.
    }
  };

  const publish = () =>
    run(async () => {
      await saveAll();
      await act.mutateAsync({
        name: "admin_presentation_publish",
        args: { p_key: locale },
      });
      await act.mutateAsync({
        name: "admin_presentation_publish",
        args: { p_key: "layout" },
        ok: "Apresentação publicada.",
      });
    });

  const discard = () =>
    run(async () => {
      await act.mutateAsync({
        name: "admin_presentation_discard",
        args: { p_key: locale },
        ok: "Rascunho descartado.",
      });
      await act.mutateAsync({
        name: "admin_presentation_discard",
        args: { p_key: "layout" },
        ok: "Rascunho descartado.",
      });
      setWorks((cur) => {
        const next = { ...cur };
        delete next[locale];
        return next;
      });
      setLayoutEdit(null);
    });

  const changeLocale = (next: Locale) => {
    if (next === locale) return;
    if (dirty && !window.confirm("Há alterações não salvas. Trocar de idioma mesmo assim?")) return;
    setLocale(next);
    setTarget(null);
  };

  const close = () => {
    if (dirty && !window.confirm("Há alterações não salvas. Sair do editor mesmo assim?")) return;
    onClose();
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
    setLayout((cur) => ({ ...cur, avatars: { ...cur.avatars, [String(index)]: url } }));
    toast.success("Foto trocada. Publique para aparecer para todos.");
  };

  if (rows.error) {
    return (
      <div className="fixed inset-0 z-[60] grid place-items-center bg-background p-6 text-sm">
        <p>{rows.error instanceof Error ? rows.error.message : "Não foi possível carregar."}</p>
        <button type="button" className={btnCls} onClick={onClose}>
          Fechar
        </button>
      </div>
    );
  }
  if (rows.isLoading || !rows.data) {
    return (
      <div className="fixed inset-0 z-[60] grid place-items-center bg-background text-sm text-muted-foreground">
        Carregando a apresentação…
      </div>
    );
  }

  const editor: DeckEditor = {
    locale,
    onLocale: changeLocale,
    copy: work,
    layout,
    onText: (path) => setTarget({ kind: "text", path }),
    onPhoto: (index) => setTarget({ kind: "photo", index }),
  };

  const textValue = target?.kind === "text" ? getPath(work, target.path) : undefined;
  const item = target?.kind === "text" ? listOf(target.path) : null;
  const itemList = item ? (getPath(work, item.listPath) as unknown[]) : null;

  return (
    <div className="fixed inset-0 z-[60]">
      <PresentationDeck editor={editor} />

      {/* Barra do editor, logo abaixo do cabeçalho da apresentação */}
      <div className="fixed inset-x-0 top-14 z-[70] flex flex-wrap items-center gap-2 border-b border-amber-500/40 bg-amber-50 px-3 py-2 text-xs text-foreground dark:bg-amber-950/80">
        <span className="rounded-full bg-amber-500 px-2 py-0.5 font-bold text-white">Editando</span>
        <span className="text-muted-foreground">
          {dirty || pending ? "Alterações não publicadas" : "Tudo publicado"} · clique num texto ou
          numa foto para editar
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button type="button" className={btnCls} onClick={() => setDrawer((d) => !d)}>
            {drawer ? "Fechar ordem" : "Ordem dos slides"}
          </button>
          <button
            type="button"
            className={btnDanger}
            onClick={() => void discard()}
            disabled={act.isPending || !pending || dirty}
          >
            Descartar
          </button>
          <button
            type="button"
            className={btnCls}
            onClick={() => void run(saveAll)}
            disabled={act.isPending || !dirty}
          >
            Salvar rascunho
          </button>
          <button
            type="button"
            className={btnPrimary}
            onClick={() => void publish()}
            disabled={act.isPending || (!dirty && !pending)}
          >
            Publicar
          </button>
          <button type="button" className={btnCls} onClick={close} aria-label="Fechar editor">
            <X className="h-3.5 w-3.5" /> Fechar editor
          </button>
        </div>
      </div>

      {/* Painel do texto clicado */}
      {target?.kind === "text" && typeof textValue === "string" && (
        <div className="fixed bottom-28 right-3 z-[80] max-h-[50vh] w-[min(440px,calc(100vw-1.5rem))] overflow-auto rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="font-mono text-[11px] text-muted-foreground">{target.path}</p>
            <button
              type="button"
              className={btnCls}
              onClick={() => setTarget(null)}
              aria-label="Fechar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {textValue.length > 70 || textValue.includes("\n") ? (
            <textarea
              className={`${inputCls} min-h-[6rem]`}
              value={textValue}
              onChange={(e) => setWork((c) => setPath(c, target.path, e.target.value))}
              autoFocus
            />
          ) : (
            <input
              className={inputCls}
              value={textValue}
              onChange={(e) => setWork((c) => setPath(c, target.path, e.target.value))}
              autoFocus
            />
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">
            Campos entre chaves, como {"{n}"} ou {"{fee}"}, são preenchidos pelo sistema:
            mantenha-os.
          </p>
          {item && itemList && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <span className="text-xs font-semibold text-muted-foreground">
                Item {item.index + 1} de {itemList.length}
              </span>
              <button
                type="button"
                className={btnCls}
                disabled={item.index === 0}
                onClick={() => {
                  const next = [...itemList];
                  [next[item.index - 1], next[item.index]] = [
                    next[item.index],
                    next[item.index - 1],
                  ];
                  setWork((c) => setPath(c, item.listPath, next));
                }}
                aria-label="Subir item"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className={btnCls}
                disabled={item.index === itemList.length - 1}
                onClick={() => {
                  const next = [...itemList];
                  [next[item.index + 1], next[item.index]] = [
                    next[item.index],
                    next[item.index + 1],
                  ];
                  setWork((c) => setPath(c, item.listPath, next));
                }}
                aria-label="Descer item"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className={btnCls}
                onClick={() => {
                  const template = itemList[item.index];
                  const next = [
                    ...itemList.slice(0, item.index + 1),
                    blankLike(template),
                    ...itemList.slice(item.index + 1),
                  ];
                  setWork((c) => setPath(c, item.listPath, next));
                }}
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar item depois
              </button>
              <button
                type="button"
                className={btnDanger}
                disabled={itemList.length <= 1}
                onClick={() => {
                  setWork((c) =>
                    setPath(
                      c,
                      item.listPath,
                      itemList.filter((_, i) => i !== item.index),
                    ),
                  );
                  setTarget(null);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Remover item
              </button>
            </div>
          )}
        </div>
      )}

      {/* Painel da foto clicada */}
      {target?.kind === "photo" && (
        <div className="fixed bottom-28 right-3 z-[80] w-[min(360px,calc(100vw-1.5rem))] rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold">Foto de {PRESENTERS[target.index].name}</p>
            <button
              type="button"
              className={btnCls}
              onClick={() => setTarget(null)}
              aria-label="Fechar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-secondary font-bold">
              {avatarOf(target.index, layout.avatars) ? (
                <img
                  src={avatarOf(target.index, layout.avatars)}
                  alt={PRESENTERS[target.index].name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials(PRESENTERS[target.index].name)
              )}
            </span>
            <div className="flex flex-col gap-2">
              <label className={`${btnPrimary} cursor-pointer`}>
                <Upload className="h-3.5 w-3.5" />
                {uploading === target.index ? "Enviando…" : "Trocar foto"}
                <input
                  type="file"
                  accept={PHOTO_TYPES.join(",")}
                  className="sr-only"
                  disabled={uploading !== null}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) void uploadPhoto(target.index, file);
                  }}
                />
              </label>
              {layout.avatars[String(target.index)] && (
                <button
                  type="button"
                  className={btnCls}
                  onClick={() =>
                    setLayout((cur) => {
                      const avatars = { ...cur.avatars };
                      delete avatars[String(target.index)];
                      return { ...cur, avatars };
                    })
                  }
                >
                  Usar a foto do código
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ordem e slides escondidos: só dentro de cada parte, para não trocar quem apresenta */}
      {drawer && (
        <div className="fixed bottom-28 left-3 top-32 z-[80] w-[min(380px,calc(100vw-1.5rem))] overflow-auto rounded-2xl border border-border bg-card p-4 shadow-soft">
          <p className="mb-3 text-sm font-semibold">Ordem e slides</p>
          <p className="mb-3 text-[11px] text-muted-foreground">
            Os slides mudam de posição só dentro da própria parte. A capa nunca some.
          </p>
          {PRESENTERS.map((p, part) => {
            const items = orderSlides(
              SLIDES.filter((s) => s.part === part),
              layout,
            );
            const visible = items.filter((s) => !layout.hidden.includes(s.id)).length;
            const copy = work;
            return (
              <div key={p.name} className="mb-4">
                <p className="mb-1 text-xs font-semibold">
                  {part + 1} · {p.name}
                </p>
                <ol className="space-y-1">
                  {items.map((s, i) => {
                    const hidden = layout.hidden.includes(s.id);
                    const last = !hidden && visible === 1;
                    const label = s.label ? s.label(copy) : s.id;
                    return (
                      <li
                        key={s.id}
                        className={`flex items-center gap-1 rounded-lg border border-border px-2 py-1 ${hidden ? "opacity-50" : ""}`}
                      >
                        <span className="flex-1 truncate text-xs">{label}</span>
                        <button
                          type="button"
                          className={btnCls}
                          disabled={i === 0}
                          aria-label={`Subir ${label}`}
                          onClick={() => {
                            const ids = items.map((x) => x.id);
                            [ids[i - 1], ids[i]] = [ids[i], ids[i - 1]];
                            setLayout((cur) => ({
                              ...cur,
                              order: { ...cur.order, [String(part)]: ids },
                            }));
                          }}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          className={btnCls}
                          disabled={i === items.length - 1}
                          aria-label={`Descer ${label}`}
                          onClick={() => {
                            const ids = items.map((x) => x.id);
                            [ids[i + 1], ids[i]] = [ids[i], ids[i + 1]];
                            setLayout((cur) => ({
                              ...cur,
                              order: { ...cur.order, [String(part)]: ids },
                            }));
                          }}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          className={btnCls}
                          disabled={s.id === "capa" || last}
                          aria-label={hidden ? `Mostrar ${label}` : `Esconder ${label}`}
                          onClick={() =>
                            setLayout((cur) => ({
                              ...cur,
                              hidden: cur.hidden.includes(s.id)
                                ? cur.hidden.filter((x) => x !== s.id)
                                : [...cur.hidden, s.id],
                            }))
                          }
                        >
                          {hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
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
    </div>
  );
}

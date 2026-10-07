// Cards das colunas laterais de cada página: quais aparecem, a ordem e o lado.
// Vale para todo mundo assim que salva (sem rascunho): é uma troca de cards, não de conteúdo.
import { useMemo, useState } from "react";
import { ArrowDown, ArrowLeftRight, ArrowUp, Plus, RotateCcw, Save, X } from "lucide-react";
import { Badge, Panel, btnCls, btnPrimary, inputCls } from "@/components/admin/admin-ui";
import {
  RAIL_CARDS,
  RAIL_PAGES,
  railSidesOf,
  readRailOverrides,
  type RailGroup,
  type RailOverrides,
} from "@/components/rails-pages";
import { useSaveSiteConfig, useSiteConfigs } from "@/lib/site-config";

type Side = "left" | "right";

export function SiteRailsSection() {
  const configs = useSiteConfigs();
  const save = useSaveSiteConfig();
  const saved = useMemo(() => readRailOverrides(configs.data?.site_rails), [configs.data]);
  const [draft, setDraft] = useState<RailOverrides | null>(null);
  const [pageKey, setPageKey] = useState(RAIL_PAGES[0].key);
  const current = draft ?? saved;
  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(saved);
  const page = RAIL_PAGES.find((p) => p.key === pageKey) ?? RAIL_PAGES[0];
  const sides = railSidesOf(page, current);
  const used = new Set([...sides.left, ...sides.right]);
  const custom = (key: string) => key in current;

  const setSides = (next: { left: string[]; right: string[] }) =>
    setDraft({ ...current, [page.key]: next });

  const move = (side: Side, i: number, dir: -1 | 1) => {
    const list = [...sides[side]];
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    setSides({ ...sides, [side]: list });
  };
  const swapSide = (side: Side, i: number) => {
    const other: Side = side === "left" ? "right" : "left";
    const id = sides[side][i];
    setSides({
      ...sides,
      [side]: sides[side].filter((_, k) => k !== i),
      [other]: [...sides[other], id],
    } as { left: string[]; right: string[] });
  };
  const remove = (side: Side, i: number) =>
    setSides({ ...sides, [side]: sides[side].filter((_, k) => k !== i) });
  const add = (side: Side, id: string) => setSides({ ...sides, [side]: [...sides[side], id] });
  const reset = () => {
    const next = { ...current };
    delete next[page.key];
    setDraft(next);
  };

  // Cards que cabem nesta página (os que dependem de comunidade/desafio só nas páginas deles).
  const available = Object.entries(RAIL_CARDS).filter(
    ([id, c]) => !used.has(id) && (!c.needs || c.needs === page.provides),
  );
  const groups = available.reduce<Partial<Record<RailGroup, [string, string][]>>>(
    (acc, [id, c]) => {
      (acc[c.group] ??= []).push([id, c.label]);
      return acc;
    },
    {},
  );

  const column = (side: Side, title: string) => (
    <div className="min-w-0 flex-1 rounded-2xl border border-border bg-background/60 p-3">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {sides[side].length === 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground">Sem cards.</p>
      ) : (
        <ol className="space-y-1.5">
          {sides[side].map((id, i) => (
            <li
              key={id}
              className="flex items-center gap-1 rounded-xl border border-border bg-card px-2.5 py-2"
            >
              <span className="w-5 text-[11px] tabular-nums text-muted-foreground">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate text-sm">{RAIL_CARDS[id]?.label ?? id}</span>
              <button
                type="button"
                className={btnCls}
                disabled={i === 0}
                onClick={() => move(side, i, -1)}
                aria-label="Subir"
              >
                <ArrowUp className="h-3 w-3" />
              </button>
              <button
                type="button"
                className={btnCls}
                disabled={i === sides[side].length - 1}
                onClick={() => move(side, i, 1)}
                aria-label="Descer"
              >
                <ArrowDown className="h-3 w-3" />
              </button>
              <button
                type="button"
                className={btnCls}
                onClick={() => swapSide(side, i)}
                aria-label="Trocar de lado"
                title="Trocar de lado"
              >
                <ArrowLeftRight className="h-3 w-3" />
              </button>
              <button
                type="button"
                className={btnCls}
                onClick={() => remove(side, i)}
                aria-label="Tirar"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ol>
      )}
      <label className="mt-3 flex items-center gap-2">
        <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <select
          className={inputCls}
          value=""
          onChange={(e) => e.target.value && add(side, e.target.value)}
          aria-label={`Adicionar card na ${title.toLowerCase()}`}
        >
          <option value="">Adicionar card…</option>
          {Object.entries(groups).map(([group, items]) => (
            <optgroup key={group} label={group}>
              {items!.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
    </div>
  );

  return (
    <Panel
      title="Cards das laterais"
      hint="Escolha os cards das colunas de cada página (telas largas). Em telas menores, os cards aparecem na seção “Mais” do fim da página. Salvar publica para todos."
      action={
        <button
          type="button"
          className={btnPrimary}
          disabled={!dirty || save.isPending}
          onClick={() =>
            save.mutate(
              { key: "site_rails", value: Object.keys(current).length ? current : null },
              { onSuccess: () => setDraft(null) },
            )
          }
        >
          <Save className="h-3.5 w-3.5" /> {save.isPending ? "Salvando…" : "Salvar"}
        </button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav aria-label="Páginas" className="space-y-0.5">
          {RAIL_PAGES.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPageKey(p.key)}
              aria-current={p.key === pageKey ? "page" : undefined}
              className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                p.key === pageKey
                  ? "bg-accent-soft font-semibold"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <span className="truncate">{p.label}</span>
              {custom(p.key) && (
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                  title="Personalizada"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-bold">{page.label}</h3>
            {custom(page.key) ? <Badge tone="info">Personalizada</Badge> : <Badge>Padrão</Badge>}
            {page.locked && <Badge tone="warn">Página sem rolagem: o que não couber some</Badge>}
            {custom(page.key) && (
              <button type="button" className={`${btnCls} ml-auto`} onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" /> Voltar ao padrão
              </button>
            )}
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            {column("left", "Coluna esquerda")}
            {column("right", "Coluna direita")}
          </div>
          {dirty && (
            <p className="text-xs font-semibold text-amber-600">Alterações ainda não salvas.</p>
          )}
        </div>
      </div>
    </Panel>
  );
}

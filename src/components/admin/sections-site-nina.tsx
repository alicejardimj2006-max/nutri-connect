// Nina: histórico dos modelos (abrir, girar, ver as ações e escolher qual o site usa) e personalização
// da aparência (cores, cabelo, roupa, acessórios). Tudo fica em platform_settings ("site_nina").
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Eye, Paintbrush, RotateCcw, Save, Star, Trash2 } from "lucide-react";
import { Badge, Panel, btnCls, btnDanger, btnPrimary, inputCls } from "@/components/admin/admin-ui";
import { NinaLive } from "@/components/nina-live";
import { NinaViewer } from "@/components/nina-viewer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LABELS,
  defaultLook,
  NINA_VERSIONS,
  PALETTES,
  modelKey,
  type NinaLook,
  type NinaModel,
  type NinaSiteConfig,
  type NinaVersion,
  type SavedNinaModel,
} from "@/lib/characters/nina-config";
import { useNinaSiteConfig } from "@/lib/nina-model";
import { useSaveSiteConfig } from "@/lib/site-config";

interface Entry {
  key: string;
  name: string;
  date: string;
  description: string;
  model: NinaModel;
  saved?: SavedNinaModel;
}

const versionInfo = (v: NinaVersion) => NINA_VERSIONS.find((x) => x.id === v)!;
const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR");
};

export function SiteNinaSection() {
  const config = useNinaSiteConfig();
  const save = useSaveSiteConfig();
  const [open, setOpen] = useState<Entry | null>(null);
  const [draft, setDraft] = useState<NinaModel | null>(null);
  const editor = useRef<HTMLDivElement>(null);
  const activeKey = modelKey(config.active);

  const entries: Entry[] = useMemo(
    () => [
      ...config.saved.map((s) => ({
        key: `saved-${s.id}`,
        name: s.name,
        date: fmtDate(s.savedAt),
        description: `Personalizada a partir da ${versionInfo(s.version).name}.`,
        model: { version: s.version, look: s.look },
        saved: s,
      })),
      ...NINA_VERSIONS.map((v) => ({
        key: v.id,
        name: v.name,
        date: v.date,
        description: v.description,
        model: { version: v.id, look: defaultLook(v.id) },
      })),
    ],
    [config.saved],
  );

  const publish = (next: NinaSiteConfig, done?: () => void) =>
    save.mutate({ key: "site_nina", value: next }, { onSuccess: done });

  const use = (model: NinaModel) => publish({ ...config, active: model });

  const remove = (s: SavedNinaModel) => {
    if (!window.confirm(`Excluir "${s.name}" do histórico?`)) return;
    publish({ ...config, saved: config.saved.filter((x) => x.id !== s.id) });
  };

  const edit = (model: NinaModel) => {
    setDraft({ version: model.version === "desenho" ? "v2" : model.version, look: model.look });
    setOpen(null);
    requestAnimationFrame(() =>
      editor.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const activeEntry = entries.find((e) => modelKey(e.model) === activeKey);

  return (
    <div className="space-y-4">
      <Panel
        title="Nina em uso no site"
        hint="É a Nina que aparece para todo mundo: na conversa com a Nina, nas trilhas, nos desafios e na apresentação."
      >
        <div className="flex flex-wrap items-center gap-4">
          <NinaLive
            model={config.active}
            framing="bust"
            entrance={false}
            className="h-28 w-24 shrink-0 rounded-2xl bg-secondary"
          />
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-bold">
              {activeEntry?.name ?? "Nina personalizada"}
            </p>
            <p className="text-xs text-muted-foreground">
              {versionInfo(config.active.version).name}
              {activeEntry?.saved ? " · personalizada" : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={btnCls}
              onClick={() =>
                setOpen(
                  activeEntry ?? {
                    key: "active",
                    name: "Nina em uso",
                    date: "",
                    description: "",
                    model: config.active,
                  },
                )
              }
            >
              <Eye className="h-3.5 w-3.5" /> Abrir
            </button>
            <button type="button" className={btnPrimary} onClick={() => edit(config.active)}>
              <Paintbrush className="h-3.5 w-3.5" /> Personalizar
            </button>
          </div>
        </div>
      </Panel>

      <Panel
        title="Histórico de modelos"
        hint="Os modelos que a Nina já teve e as versões personalizadas que você guardou. Abra para girar e ver as ações; escolha qual o site usa."
      >
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {entries.map((e) => {
            const inUse = modelKey(e.model) === activeKey;
            const info = versionInfo(e.model.version);
            return (
              <li
                key={e.key}
                className={`flex flex-col overflow-hidden rounded-2xl border ${inUse ? "border-accent ring-2 ring-accent/30" : "border-border"}`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(e)}
                  className="relative h-48 cursor-pointer bg-gradient-to-b from-secondary/50 to-secondary"
                  aria-label={`Abrir ${e.name}`}
                >
                  <NinaLive model={e.model} entrance={false} className="h-full w-full" />
                  <span className="absolute left-2 top-2 flex gap-1">
                    {inUse && <Badge tone="good">Em uso</Badge>}
                    {e.saved ? <Badge tone="info">Personalizada</Badge> : <Badge>Original</Badge>}
                    {!info.is3d && <Badge tone="warn">2D</Badge>}
                  </span>
                </button>
                <div className="flex flex-1 flex-col gap-2 p-3">
                  <div>
                    <p className="text-sm font-bold">{e.name}</p>
                    <p className="text-[11px] text-muted-foreground">{e.date}</p>
                  </div>
                  <p className="flex-1 text-xs text-muted-foreground">{e.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button type="button" className={btnCls} onClick={() => setOpen(e)}>
                      <Eye className="h-3.5 w-3.5" /> Abrir
                    </button>
                    {info.is3d && (
                      <button type="button" className={btnCls} onClick={() => edit(e.model)}>
                        <Paintbrush className="h-3.5 w-3.5" /> Personalizar
                      </button>
                    )}
                    <button
                      type="button"
                      className={btnPrimary}
                      disabled={inUse || save.isPending}
                      onClick={() => use(e.model)}
                    >
                      {inUse ? <Check className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
                      {inUse ? "Em uso" : "Usar no site"}
                    </button>
                    {e.saved && (
                      <button
                        type="button"
                        className={btnDanger}
                        aria-label={`Excluir ${e.name}`}
                        onClick={() => remove(e.saved!)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>

      <div ref={editor}>
        <Customizer
          draft={draft}
          setDraft={setDraft}
          start={config.active}
          busy={save.isPending}
          onSave={(model, name, andUse) => {
            const saved: SavedNinaModel = {
              ...model,
              id: Math.random().toString(36).slice(2, 10),
              name,
              savedAt: new Date().toISOString(),
            };
            publish(
              {
                active: andUse ? model : config.active,
                saved: [saved, ...config.saved].slice(0, 40),
              },
              () => setDraft(null),
            );
          }}
        />
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>{open.name}</DialogTitle>
                <DialogDescription>
                  {[open.date, open.description].filter(Boolean).join(" · ")}
                </DialogDescription>
              </DialogHeader>
              <NinaViewer model={open.model} />
              <div className="flex flex-wrap justify-end gap-2">
                {versionInfo(open.model.version).is3d && (
                  <button type="button" className={btnCls} onClick={() => edit(open.model)}>
                    <Paintbrush className="h-3.5 w-3.5" /> Personalizar
                  </button>
                )}
                <button
                  type="button"
                  className={btnPrimary}
                  disabled={modelKey(open.model) === activeKey || save.isPending}
                  onClick={() => use(open.model)}
                >
                  <Star className="h-3.5 w-3.5" />
                  {modelKey(open.model) === activeKey ? "Em uso no site" : "Usar no site"}
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ───────────────────────── Personalizador ─────────────────────────

function Customizer({
  draft,
  setDraft,
  start,
  busy,
  onSave,
}: {
  draft: NinaModel | null;
  setDraft: (m: NinaModel | null) => void;
  start: NinaModel;
  busy: boolean;
  onSave: (model: NinaModel, name: string, andUse: boolean) => void;
}) {
  const model = draft ?? {
    version: start.version === "desenho" ? ("v2" as const) : start.version,
    look: start.look,
  };
  const look = model.look;
  const set = <K extends keyof NinaLook>(key: K, value: NinaLook[K]) =>
    setDraft({ ...model, look: { ...look, [key]: value } });

  // O nome sugerido acompanha o estilo escolhido.
  const [name, setName] = useState("");
  useEffect(() => {
    if (!draft) setName("");
  }, [draft]);

  const submit = (andUse: boolean) => {
    const n =
      name.trim() ||
      `Nina ${LABELS.outfit[look.outfit].toLowerCase()}, ${LABELS.hairStyle[look.hairStyle].toLowerCase()}`;
    onSave(model, n.slice(0, 60), andUse);
  };

  return (
    <Panel
      title="Personalizar a Nina"
      hint="Mude cores, cabelo, roupa e acessórios vendo o resultado na hora. Guardar cria um item no histórico; você escolhe se ele já passa a valer no site."
      action={
        <button
          type="button"
          className={btnCls}
          onClick={() => setDraft({ version: model.version, look: defaultLook(model.version) })}
        >
          <RotateCcw className="h-3.5 w-3.5" /> Aparência original
        </button>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="lg:sticky lg:top-4 lg:self-start">
          <NinaViewer model={model} height={420} />
        </div>

        <div className="space-y-5">
          <Group title="Modelo">
            <div className="flex flex-wrap gap-2">
              {NINA_VERSIONS.filter((v) => v.is3d).map((v) => (
                <Choice
                  key={v.id}
                  on={model.version === v.id}
                  onClick={() => setDraft({ ...model, version: v.id })}
                >
                  {v.name}
                </Choice>
              ))}
            </div>
          </Group>

          <Group title="Cores">
            <ColorField
              label="Pele"
              value={look.skin}
              palette={PALETTES.skin}
              onChange={(v) => set("skin", v)}
            />
            <ColorField
              label="Cabelo"
              value={look.hair}
              palette={PALETTES.hair}
              onChange={(v) => set("hair", v)}
            />
            <ColorField
              label="Olhos"
              value={look.eyes}
              palette={PALETTES.eyes}
              onChange={(v) => set("eyes", v)}
            />
          </Group>

          <Group title="Cabelo">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(LABELS.hairStyle) as NinaLook["hairStyle"][]).map((k) => (
                <Choice key={k} on={look.hairStyle === k} onClick={() => set("hairStyle", k)}>
                  {LABELS.hairStyle[k]}
                </Choice>
              ))}
            </div>
            <Toggle label="Franjinha" on={look.bangs} onChange={(v) => set("bangs", v)} />
          </Group>

          <Group title="Roupa">
            <div className="mb-3 flex flex-wrap gap-2">
              {(Object.keys(LABELS.outfit) as NinaLook["outfit"][]).map((k) => (
                <Choice key={k} on={look.outfit === k} onClick={() => set("outfit", k)}>
                  {LABELS.outfit[k]}
                </Choice>
              ))}
            </div>
            <ColorField
              label={outfitColorLabel(look.outfit)}
              value={look.outfitColor}
              palette={PALETTES.outfit}
              onChange={(v) => set("outfitColor", v)}
            />
            {look.outfit !== "moletom" && (
              <ColorField
                label={shirtColorLabel(look.outfit)}
                value={look.shirt}
                palette={PALETTES.shirt}
                onChange={(v) => set("shirt", v)}
              />
            )}
            <ColorField
              label={look.outfit === "vestido" ? "Meia-calça" : "Calça"}
              value={look.pants}
              palette={PALETTES.pants}
              onChange={(v) => set("pants", v)}
            />
            <ColorField
              label="Sapatos"
              value={look.shoes}
              palette={PALETTES.shoes}
              onChange={(v) => set("shoes", v)}
            />
          </Group>

          <Group title="Acessórios">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(LABELS.accessory) as NinaLook["accessory"][]).map((k) => (
                <Choice key={k} on={look.accessory === k} onClick={() => set("accessory", k)}>
                  {LABELS.accessory[k]}
                </Choice>
              ))}
            </div>
            <ColorField
              label="Cor do acessório e dos elásticos"
              value={look.accessoryColor}
              palette={PALETTES.accent}
              onChange={(v) => set("accessoryColor", v)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {(Object.keys(LABELS.glasses) as NinaLook["glasses"][]).map((k) => (
                <Choice key={k} on={look.glasses === k} onClick={() => set("glasses", k)}>
                  {LABELS.glasses[k]}
                </Choice>
              ))}
            </div>
            {look.glasses !== "nenhum" && (
              <ColorField
                label="Armação"
                value={look.glassesColor}
                palette={["#3b2a20", "#1f1f24", "#c0392b", "#3b82c4", "#e86a92", "#e9c86e"]}
                onChange={(v) => set("glassesColor", v)}
              />
            )}
          </Group>

          <Group title="Detalhes">
            <div className="grid gap-1 sm:grid-cols-2">
              <Toggle label="Sardas" on={look.freckles} onChange={(v) => set("freckles", v)} />
              <Toggle label="Bochechas rosadas" on={look.blush} onChange={(v) => set("blush", v)} />
              <Toggle label="Cílios" on={look.lashes} onChange={(v) => set("lashes", v)} />
              <Toggle label="Brincos" on={look.earrings} onChange={(v) => set("earrings", v)} />
              <Toggle label="Crachá" on={look.badge} onChange={(v) => set("badge", v)} />
              <Toggle
                label="Tablet do plano alimentar"
                on={look.tablet}
                onChange={(v) => set("tablet", v)}
              />
            </div>
          </Group>

          <div className="space-y-2 rounded-2xl border border-border p-3">
            <label className="block text-xs font-semibold" htmlFor="nina-name">
              Nome no histórico
            </label>
            <input
              id="nina-name"
              className={inputCls}
              value={name}
              maxLength={60}
              placeholder="Ex.: Nina de moletom para o inverno"
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className={btnCls}
                disabled={busy}
                onClick={() => submit(false)}
              >
                <Save className="h-3.5 w-3.5" /> Guardar no histórico
              </button>
              <button
                type="button"
                className={btnPrimary}
                disabled={busy}
                onClick={() => submit(true)}
              >
                <Star className="h-3.5 w-3.5" /> Guardar e usar no site
              </button>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

const outfitColorLabel = (o: NinaLook["outfit"]) =>
  o === "jaleco"
    ? "Jaleco"
    : o === "moletom"
      ? "Moletom"
      : o === "vestido"
        ? "Vestido"
        : "Detalhes";
const shirtColorLabel = (o: NinaLook["outfit"]) =>
  o === "jaleco" ? "Blusa" : o === "vestido" ? "Gola e faixa" : "Camiseta";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Choice({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition ${on ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card hover:bg-secondary"}`}
    >
      {children}
    </button>
  );
}

function ColorField({
  label,
  value,
  palette,
  onChange,
}: {
  label: string;
  value: string;
  palette: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-40 shrink-0 text-xs font-semibold">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {palette.map((c) => (
          <button
            key={c}
            type="button"
            title={c}
            aria-label={`${label}: ${c}`}
            aria-pressed={value === c}
            onClick={() => onChange(c)}
            className={`h-6 w-6 cursor-pointer rounded-full border shadow-xs transition hover:scale-110 ${value === c ? "ring-2 ring-accent ring-offset-2 ring-offset-card" : "border-border"}`}
            style={{ background: c }}
          />
        ))}
        <label
          className="relative h-6 w-6 cursor-pointer overflow-hidden rounded-full border border-dashed border-border"
          title="Outra cor"
          style={{ background: palette.includes(value) ? undefined : value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={`${label}: outra cor`}
          />
          {palette.includes(value) && (
            <span className="grid h-full place-items-center text-xs text-muted-foreground">+</span>
          )}
        </label>
      </div>
    </div>
  );
}

function Toggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-2 py-1.5 hover:bg-secondary/60">
      <span className="text-xs font-semibold">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition ${on ? "bg-accent" : "bg-border"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? "left-[1.125rem]" : "left-0.5"}`}
        />
      </button>
    </label>
  );
}

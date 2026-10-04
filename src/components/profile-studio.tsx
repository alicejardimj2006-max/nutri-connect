// Ferramentas para montar o perfil: barra de edição, menu de blocos, editor de cada bloco, tema
// (os mesmos cartões de Cores, Texto, Formatos e Perfil e posts do painel de personalização) e
// cabeçalho. Tudo mexe num rascunho; só vale para os outros quando a pessoa salva.
import { useState, type ReactNode } from "react";
import {
  Camera,
  Check,
  ImagePlus,
  LayoutTemplate,
  Palette,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import {
  Group,
  Segmented,
  Slider,
  Switch,
  FreeColor,
  useTr,
} from "@/components/appearance-editor";
import { BLOCK_INFO } from "@/components/profile-blocks";
import { MediaUpload } from "@/components/profile-media";
import { IconGrid, IconPickerButton } from "@/components/profile-icons";
import {
  ColorsSection,
  ProfileSection,
  ShapesSection,
  TextSection,
} from "@/components/personalization-sections";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AppearanceOverride } from "@/hooks/use-appearance";
import { themeToAppearance, BLOCK_TYPES, type Block, type BlockItem, type BlockType, type ProfilePage } from "@/lib/profile-page";
import type { Appearance } from "@/lib/appearance";

export type StudioPanel = "theme" | "header" | "block" | null;

const input =
  "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent";
const ghostBtn =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50";


// ── Barra de edição ──────────────────────────────────────────────────────────

export function StudioBar({
  dirty,
  saving,
  panel,
  onPanel,
  onAdd,
  onReset,
  onSave,
  onCancel,
}: {
  dirty: boolean;
  saving: boolean;
  panel: StudioPanel;
  onPanel: (p: StudioPanel) => void;
  onAdd: () => void;
  onReset: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const tr = useTr();
  const tab = (active: boolean) =>
    `${ghostBtn} ${active ? "!border-accent !bg-accent-soft" : ""}`;
  return (
    <div className="fixed inset-x-3 bottom-20 z-40 mx-auto flex max-w-fit flex-wrap items-center justify-center gap-2 rounded-3xl border border-border bg-card/95 p-2 shadow-card backdrop-blur lg:bottom-5">
      <button type="button" onClick={onAdd} className={ghostBtn}>
        <Plus className="h-3.5 w-3.5" />
        {tr(["Adicionar bloco", "Add block", "Añadir bloque", "Ajouter un bloc"])}
      </button>
      <button type="button" onClick={() => onPanel(panel === "theme" ? null : "theme")} className={tab(panel === "theme")}>
        <Palette className="h-3.5 w-3.5" />
        {tr(["Tema", "Theme", "Tema", "Thème"])}
      </button>
      <button type="button" onClick={() => onPanel(panel === "header" ? null : "header")} className={tab(panel === "header")}>
        <LayoutTemplate className="h-3.5 w-3.5" />
        {tr(["Capa e foto", "Cover and photo", "Portada y foto", "Couverture et photo"])}
      </button>
      <button type="button" onClick={onReset} className={ghostBtn} disabled={saving} title={tr(["Voltar ao perfil padrão", "Back to default profile", "Volver al perfil estándar", "Revenir au profil par défaut"])}>
        <RotateCcw className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{tr(["Padrão", "Default", "Estándar", "Défaut"])}</span>
      </button>
      <span className="mx-1 hidden h-6 w-px bg-border sm:block" />
      <button type="button" onClick={onCancel} className={ghostBtn} disabled={saving}>
        {tr(["Cancelar", "Cancel", "Cancelar", "Annuler"])}
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving || !dirty}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-xs font-bold text-accent-foreground shadow-soft transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Check className="h-3.5 w-3.5" />
        {saving
          ? tr(["Analisando e salvando…", "Checking and saving…", "Analizando y guardando…", "Analyse et enregistrement…"])
          : tr(["Salvar perfil", "Save profile", "Guardar perfil", "Enregistrer le profil"])}
      </button>
    </div>
  );
}

// ── Gaveta lateral ───────────────────────────────────────────────────────────

export function StudioDrawer({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const tr = useTr();
  return (
    <aside className="fixed bottom-0 right-0 top-16 z-50 flex w-full max-w-md flex-col border-l border-border bg-background shadow-card sm:top-20">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
        <h2 className="font-display text-base font-bold text-foreground">{title}</h2>
        <button type="button" onClick={onClose} className="grid h-8 w-8 cursor-pointer place-items-center rounded-full hover:bg-secondary" aria-label={tr(["Fechar", "Close", "Cerrar", "Fermer"])}>
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 pb-28">{children}</div>
    </aside>
  );
}

// ── Adicionar bloco ──────────────────────────────────────────────────────────

export function AddBlockDialog({
  open,
  onClose,
  onPick,
  isProfessional,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (type: BlockType) => void;
  isProfessional: boolean;
}) {
  const tr = useTr();
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{tr(["Adicionar um bloco", "Add a block", "Añadir un bloque", "Ajouter un bloc"])}</DialogTitle>
          <DialogDescription>
            {tr(["Escolha o que quer mostrar. Depois é só arrastar e mudar o tamanho.", "Pick what to show. Then drag it and resize it.", "Elige qué mostrar. Después arrástralo y cambia su tamaño.", "Choisissez ce que vous voulez afficher, puis déplacez-le et redimensionnez-le."])}
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[60vh] gap-2 overflow-y-auto sm:grid-cols-2">
          {BLOCK_TYPES.filter((type) => type !== "pro" || isProfessional).map((type) => {
            const info = BLOCK_INFO[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => onPick(type)}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-3 text-left transition hover:border-accent hover:bg-accent-soft/40"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                  <info.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-foreground">{tr(info.name)}</span>
                  <span className="block text-[11px] text-muted-foreground">{tr(info.hint)}</span>
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Editor de um bloco ───────────────────────────────────────────────────────

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

function ItemsEditor({
  items,
  onChange,
  withUrl,
  max,
}: {
  items: BlockItem[];
  onChange: (items: BlockItem[]) => void;
  withUrl: boolean;
  max: number;
}) {
  const tr = useTr();
  const set = (i: number, patch: Partial<BlockItem>) =>
    onChange(items.map((it, k) => (k === i ? { ...it, ...patch } : it)));
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2 rounded-xl border border-border bg-card p-2">
          <IconPickerButton value={it.emoji} onPick={(emoji) => set(i, { emoji })} label={tr(["Escolher ícone", "Choose icon", "Elegir icono", "Choisir une icône"])} />
          <div className="min-w-0 flex-1 space-y-1.5">
            <input
              value={it.label}
              onChange={(e) => set(i, { label: e.target.value.slice(0, 60) })}
              placeholder={tr(["Nome", "Name", "Nombre", "Nom"])}
              className={input}
            />
            {withUrl && (
              <input
                value={it.url}
                onChange={(e) => set(i, { url: e.target.value.slice(0, 300) })}
                placeholder="https://"
                inputMode="url"
                className={input}
              />
            )}
          </div>
          <button type="button" onClick={() => onChange(items.filter((_, k) => k !== i))} className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full text-destructive hover:bg-destructive/10" aria-label={tr(["Remover", "Remove", "Quitar", "Supprimer"])}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      {items.length < max && (
        <button type="button" onClick={() => onChange([...items, { label: "", url: "", emoji: "" }])} className={ghostBtn}>
          <Plus className="h-3.5 w-3.5" />
          {tr(["Adicionar item", "Add item", "Añadir elemento", "Ajouter un élément"])}
        </button>
      )}
    </div>
  );
}

const TEXT_TYPES: BlockType[] = ["about", "text", "quote", "image"];
const COUNT_TYPES: BlockType[] = ["posts", "recipes", "challenges", "communities"];
const NO_TITLE: BlockType[] = ["stats", "quote", "image", "sticker"];

export function BlockEditor({
  block,
  onChange,
  onDelete,
}: {
  block: Block;
  onChange: (patch: Partial<Block>) => void;
  onDelete: () => void;
}) {
  const tr = useTr();
  const info = BLOCK_INFO[block.type];
  const s = block.style;
  const setStyle = (patch: Partial<Block["style"]>) => onChange({ style: { ...s, ...patch } });
  const setOpts = (patch: Partial<Block["opts"]>) => onChange({ opts: { ...block.opts, ...patch } });

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">{tr(info.hint)}</p>

      {!NO_TITLE.includes(block.type) && (
        <>
          <Field label={tr(["Título do bloco", "Block title", "Título del bloque", "Titre du bloc"])}>
            <input value={block.title} onChange={(e) => onChange({ title: e.target.value.slice(0, 80) })} placeholder={tr(info.name)} className={input} />
          </Field>
          <Switch
            checked={block.opts.hideTitle}
            onChange={(hideTitle) => setOpts({ hideTitle })}
            label={tr(["Esconder o título", "Hide the title", "Ocultar el título", "Masquer le titre"])}
            hint=""
          />
        </>
      )}

      {block.type === "quote" && (
        <Field label={tr(["Quem disse (opcional)", "Who said it (optional)", "Quién lo dijo (opcional)", "Qui l'a dit (facultatif)"])}>
          <input value={block.title} onChange={(e) => onChange({ title: e.target.value.slice(0, 80) })} className={input} />
        </Field>
      )}

      {TEXT_TYPES.includes(block.type) && (
        <Field
          label={block.type === "image" ? tr(["Legenda", "Caption", "Leyenda", "Légende"]) : tr(["Texto", "Text", "Texto", "Texte"])}
          hint={block.type === "about" ? tr(["Se ficar vazio, mostra a sua bio.", "If empty, your bio is shown.", "Si queda vacío, se muestra tu bio.", "Si vide, votre bio est affichée."]) : undefined}
        >
          <textarea
            rows={block.type === "image" ? 2 : 6}
            value={block.text}
            onChange={(e) => onChange({ text: e.target.value.slice(0, 2000) })}
            className={`${input} resize-y`}
          />
        </Field>
      )}

      {block.type === "image" && (
        <Group title={tr(["Foto", "Photo", "Foto", "Photo"])}>
          <MediaUpload target="image" onDone={(url) => onChange({ image: url })}>
            {(open, busy) => (
              <button type="button" onClick={open} disabled={busy} className={ghostBtn}>
                <ImagePlus className="h-3.5 w-3.5" />
                {busy
                  ? tr(["Analisando…", "Checking…", "Analizando…", "Analyse…"])
                  : block.image
                    ? tr(["Trocar foto", "Change photo", "Cambiar foto", "Changer la photo"])
                    : tr(["Escolher foto", "Choose photo", "Elegir foto", "Choisir une photo"])}
              </button>
            )}
          </MediaUpload>
          {block.image && (
            <button type="button" onClick={() => onChange({ image: null })} className="ml-3 cursor-pointer text-xs font-medium text-destructive hover:underline">
              {tr(["Remover foto", "Remove photo", "Quitar foto", "Retirer la photo"])}
            </button>
          )}
        </Group>
      )}

      {block.type === "sticker" && (
        <Group title={tr(["Adesivo", "Sticker", "Adhesivo", "Autocollant"])}>
          <IconGrid value={block.opts.emoji} onPick={(emoji) => setOpts({ emoji })} />
        </Group>
      )}

      {block.type === "links" && (
        <Group title={tr(["Seus links", "Your links", "Tus enlaces", "Vos liens"])} hint={tr(["Só endereços https públicos. Links suspeitos são recusados ao salvar.", "Public https addresses only. Suspicious links are refused when saving.", "Solo direcciones https públicas. Los enlaces sospechosos se rechazan al guardar.", "Adresses https publiques uniquement. Les liens suspects sont refusés."])}>
          <ItemsEditor items={block.items} onChange={(items) => onChange({ items })} withUrl max={12} />
        </Group>
      )}

      {block.type === "favorites" && (
        <Group title={tr(["O que você ama", "What you love", "Lo que amas", "Ce que vous aimez"])}>
          <ItemsEditor items={block.items} onChange={(items) => onChange({ items })} withUrl={false} max={16} />
        </Group>
      )}

      {COUNT_TYPES.includes(block.type) && (
        <Group title={tr(["Quantidade", "Amount", "Cantidad", "Cantidad"])}>
          <Slider label="count" value={block.opts.count} min={1} max={12} step={1} onChange={(count) => setOpts({ count })} display={String(block.opts.count)} />
        </Group>
      )}

      {(block.type === "posts" || block.type === "recipes") && (
        <Group title={tr(["Disposição", "Layout", "Disposición", "Disposition"])}>
          <Segmented
            columns="grid-cols-2"
            options={[
              { id: "list" as const, label: tr(["Lista", "List", "Lista", "Liste"]) },
              { id: "grid" as const, label: tr(["Grade", "Grid", "Cuadrícula", "Grille"]) },
            ]}
            value={block.opts.view}
            onChange={(view) => setOpts({ view })}
          />
        </Group>
      )}

      <div className="space-y-5 border-t border-border pt-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {tr(["Aparência do bloco", "Block look", "Aspecto del bloque", "Apparence du bloc"])}
        </h3>

        <Group title={tr(["Cor de fundo", "Background", "Fondo", "Fond"])} hint={tr(["Sem cor própria, usa a cor dos cartões do tema.", "Without a color, uses the theme card color.", "Sin color, usa el color de las tarjetas del tema.", "Sans couleur, utilise celle des cartes du thème."])}>
          <FreeColor label="bg" value={s.bg} fallback="#ffffff" onChange={(bg) => setStyle({ bg })} resetLabel={tr(["Usar a do tema", "Use theme color", "Usar la del tema", "Utiliser celle du thème"])} />
        </Group>
        <Group title={tr(["Transparência do fundo", "Background opacity", "Opacidad del fondo", "Opacité du fond"])}>
          <Slider label="opacity" value={s.bgOpacity} min={0} max={100} step={5} onChange={(bgOpacity) => setStyle({ bgOpacity })} display={`${s.bgOpacity}%`} />
        </Group>
        <Group title={tr(["Cor do texto", "Text color", "Color del texto", "Couleur du texte"])}>
          <FreeColor label="text" value={s.textColor} fallback="#222222" onChange={(textColor) => setStyle({ textColor })} resetLabel={tr(["Automática", "Automatic", "Automático", "Automatique"])} />
        </Group>
        <Group title={tr(["Borda", "Border", "Borde", "Bordure"])}>
          <Segmented
            columns="grid-cols-2 sm:grid-cols-4"
            options={[
              { id: "none" as const, label: tr(["Sem", "None", "Sin", "Aucune"]) },
              { id: "thin" as const, label: tr(["Fina", "Thin", "Fina", "Fine"]) },
              { id: "accent" as const, label: tr(["Destaque", "Accent", "Acento", "Accent"]) },
              { id: "dashed" as const, label: tr(["Tracejada", "Dashed", "Discontinua", "Pointillée"]) },
            ]}
            value={s.border}
            onChange={(border) => setStyle({ border })}
          />
        </Group>
        <Group title={tr(["Cantos", "Corners", "Esquinas", "Coins"])}>
          <Slider label="radius" value={s.radius ?? 24} min={0} max={40} step={2} onChange={(radius) => setStyle({ radius })} display={`${s.radius ?? 24}px`} />
          {s.radius !== null && (
            <button type="button" onClick={() => setStyle({ radius: null })} className="mt-1 cursor-pointer text-xs font-medium text-muted-foreground underline-offset-2 hover:underline">
              {tr(["Usar os do tema", "Use theme corners", "Usar los del tema", "Utiliser ceux du thème"])}
            </button>
          )}
        </Group>
        <Group title={tr(["Alinhamento do texto", "Text alignment", "Alineación del texto", "Alignement du texte"])}>
          <Segmented
            columns="grid-cols-3"
            options={[
              { id: "left" as const, label: tr(["Esquerda", "Left", "Izquierda", "Gauche"]) },
              { id: "center" as const, label: tr(["Centro", "Center", "Centro", "Centre"]) },
              { id: "right" as const, label: tr(["Direita", "Right", "Derecha", "Droite"]) },
            ]}
            value={s.align}
            onChange={(align) => setStyle({ align })}
          />
        </Group>
        <Group title={tr(["Espaço interno", "Padding", "Espacio interno", "Espacement"])}>
          <Segmented
            columns="grid-cols-3"
            options={[
              { id: "p" as const, label: tr(["Pequeno", "Small", "Pequeño", "Petit"]) },
              { id: "m" as const, label: tr(["Médio", "Medium", "Medio", "Moyen"]) },
              { id: "g" as const, label: tr(["Grande", "Large", "Grande", "Grand"]) },
            ]}
            value={s.pad}
            onChange={(pad) => setStyle({ pad })}
          />
        </Group>
        <Switch checked={s.shadow} onChange={(shadow) => setStyle({ shadow })} label={tr(["Sombra", "Shadow", "Sombra", "Ombre"])} hint="" />
      </div>

      <button type="button" onClick={onDelete} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-destructive/40 px-4 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10">
        <Trash2 className="h-3.5 w-3.5" />
        {tr(["Remover este bloco", "Remove this block", "Quitar este bloque", "Supprimer ce bloc"])}
      </button>
    </div>
  );
}

// ── Tema do perfil ───────────────────────────────────────────────────────────

type ThemeTab = "colors" | "text" | "shapes" | "cards";

export function ThemeEditor({
  theme,
  onChange,
  onImportSiteTheme,
}: {
  theme: Partial<Appearance>;
  onChange: (theme: Partial<Appearance>) => void;
  onImportSiteTheme: () => void;
}) {
  const tr = useTr();
  const [tab, setTab] = useState<ThemeTab>("colors");
  const binding = {
    appearance: themeToAppearance(theme),
    update: (patch: Partial<Appearance>) => onChange({ ...theme, ...patch }),
    reset: () => onChange({}),
  };
  const tabs: { id: ThemeTab; label: string }[] = [
    { id: "colors", label: tr(["Cores", "Colors", "Colores", "Couleurs"]) },
    { id: "text", label: tr(["Texto", "Text", "Texto", "Texte"]) },
    { id: "shapes", label: tr(["Formatos", "Shapes", "Formas", "Formes"]) },
    { id: "cards", label: tr(["Cartões e fotos", "Cards and photos", "Tarjetas y fotos", "Cartes et photos"]) },
  ];
  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">
        {tr(
          [
            "O tema vale só para a sua página: quem visitar vê as suas cores e fontes, não as próprias. Acessibilidade de cada visitante é sempre respeitada.",
            "The theme applies only to your page: visitors see your colors and fonts, not their own. Each visitor's accessibility settings are always respected.",
            "El tema solo vale para tu página: quien visite verá tus colores y fuentes, no los suyos. La accesibilidad de cada visitante siempre se respeta.",
            "Le thème ne s'applique qu'à votre page : les visiteurs voient vos couleurs et polices, pas les leurs. L'accessibilité de chaque visiteur est toujours respectée.",
          ],
        )}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setTab(x.id)}
            aria-pressed={tab === x.id}
            className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${tab === x.id ? "border-accent bg-accent-soft text-foreground" : "border-border text-muted-foreground hover:bg-secondary"}`}
          >
            {x.label}
          </button>
        ))}
      </div>
      <AppearanceOverride value={binding}>
        {tab === "colors" && <ColorsSection />}
        {tab === "text" && <TextSection />}
        {tab === "shapes" && <ShapesSection />}
        {tab === "cards" && <ProfileSection />}
      </AppearanceOverride>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onImportSiteTheme} className={ghostBtn}>
          <Palette className="h-3.5 w-3.5" />
          {tr(["Usar o meu tema do site", "Use my site theme", "Usar mi tema del sitio", "Utiliser mon thème du site"])}
        </button>
        <button type="button" onClick={() => onChange({})} className={ghostBtn}>
          <RotateCcw className="h-3.5 w-3.5" />
          {tr(["Voltar ao tema padrão", "Back to default theme", "Volver al tema estándar", "Revenir au thème par défaut"])}
        </button>
      </div>
    </div>
  );
}

// ── Capa, foto de perfil e cabeçalho ─────────────────────────────────────────

export function HeaderEditor({
  header,
  onChange,
  onMediaDone,
  hasBanner,
  onRemoveBanner,
}: {
  header: ProfilePage["header"];
  onChange: (patch: Partial<ProfilePage["header"]>) => void;
  onMediaDone: () => void | Promise<void>;
  hasBanner: boolean;
  onRemoveBanner: () => void;
}) {
  const tr = useTr();
  return (
    <div className="space-y-6">
      <Group title={tr(["Fotos", "Photos", "Fotos", "Photos"])} hint={tr(["Toda foto é analisada pela IA antes de ser salva.", "Every photo is checked by AI before it is saved.", "Toda foto es analizada por la IA antes de guardarse.", "Chaque photo est analysée par l'IA avant d'être enregistrée."])}>
        <div className="flex flex-wrap gap-2">
          <MediaUpload target="avatar" onDone={onMediaDone}>
            {(open, busy) => (
              <button type="button" onClick={open} disabled={busy} className={ghostBtn}>
                <Camera className="h-3.5 w-3.5" />
                {busy ? tr(["Analisando…", "Checking…", "Analizando…", "Analyse…"]) : tr(["Trocar foto de perfil", "Change profile photo", "Cambiar foto de perfil", "Changer la photo de profil"])}
              </button>
            )}
          </MediaUpload>
          <MediaUpload target="banner" onDone={onMediaDone}>
            {(open, busy) => (
              <button type="button" onClick={open} disabled={busy} className={ghostBtn}>
                <ImagePlus className="h-3.5 w-3.5" />
                {busy ? tr(["Analisando…", "Checking…", "Analizando…", "Analyse…"]) : tr(["Trocar capa", "Change cover", "Cambiar portada", "Changer la couverture"])}
              </button>
            )}
          </MediaUpload>
          {hasBanner && (
            <button type="button" onClick={onRemoveBanner} className={`${ghostBtn} !text-destructive`}>
              <Trash2 className="h-3.5 w-3.5" />
              {tr(["Remover capa", "Remove cover", "Quitar portada", "Retirer la couverture"])}
            </button>
          )}
        </div>
      </Group>
      <Group title={tr(["Altura da capa", "Cover height", "Altura de la portada", "Hauteur de la couverture"])}>
        <Slider label="banner" value={header.bannerHeight} min={120} max={360} step={8} onChange={(bannerHeight) => onChange({ bannerHeight })} display={`${header.bannerHeight}px`} />
      </Group>
      <Group title={tr(["Tamanho da foto de perfil", "Profile photo size", "Tamaño de la foto de perfil", "Taille de la photo de profil"])}>
        <Segmented
          columns="grid-cols-3"
          options={[
            { id: "p" as const, label: tr(["Pequena", "Small", "Pequeña", "Petite"]) },
            { id: "m" as const, label: tr(["Média", "Medium", "Media", "Moyenne"]) },
            { id: "g" as const, label: tr(["Grande", "Large", "Grande", "Grande"]) },
          ]}
          value={header.avatarSize}
          onChange={(avatarSize) => onChange({ avatarSize })}
        />
      </Group>
      <Group title={tr(["Posição da foto e do nome", "Photo and name position", "Posición de la foto y el nombre", "Position de la photo et du nom"])}>
        <Segmented
          columns="grid-cols-2"
          options={[
            { id: "left" as const, label: tr(["À esquerda", "Left", "A la izquierda", "À gauche"]) },
            { id: "center" as const, label: tr(["Centralizada", "Centered", "Centrada", "Centrée"]) },
          ]}
          value={header.avatarPos}
          onChange={(avatarPos) => onChange({ avatarPos, align: avatarPos })}
        />
      </Group>
      <Switch
        checked={header.dim}
        onChange={(dim) => onChange({ dim })}
        label={tr(["Escurecer a base da capa", "Darken the cover's bottom", "Oscurecer la base de la portada", "Assombrir le bas de la couverture"])}
        hint=""
      />
    </div>
  );
}

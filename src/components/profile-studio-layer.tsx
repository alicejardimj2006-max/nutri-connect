// Camada de edição do perfil (barra, menu de blocos e gavetas). Fica separada para ser baixada só
// quando a pessoa clica em "Personalizar perfil": quem apenas visita o perfil não paga esse peso.
import { useTr } from "@/components/appearance-editor";
import {
  AddBlockDialog,
  BlockEditor,
  HeaderEditor,
  StudioBar,
  StudioDrawer,
  ThemeEditor,
  type StudioPanel,
} from "@/components/profile-studio";
import { importSiteTheme, type Block, type BlockType, type ProfilePage } from "@/lib/profile-page";

export default function ProfileStudioLayer({
  draft,
  dirty,
  saving,
  panel,
  onPanel,
  addOpen,
  onAddOpen,
  selected,
  isProfessional,
  hasBanner,
  onAddBlock,
  onPatchBlock,
  onRemoveBlock,
  onDraft,
  onReset,
  onSave,
  onCancel,
  onMediaDone,
  onRemoveBanner,
}: {
  draft: ProfilePage;
  dirty: boolean;
  saving: boolean;
  panel: StudioPanel;
  onPanel: (p: StudioPanel) => void;
  addOpen: boolean;
  onAddOpen: (open: boolean) => void;
  selected: Block | null;
  isProfessional: boolean;
  hasBanner: boolean;
  onAddBlock: (type: BlockType) => void;
  onPatchBlock: (id: string, patch: Partial<Block>) => void;
  onRemoveBlock: (id: string) => void;
  onDraft: (fn: (p: ProfilePage) => ProfilePage) => void;
  onReset: () => void;
  onSave: () => void;
  onCancel: () => void;
  onMediaDone: () => void | Promise<void>;
  onRemoveBanner: () => void;
}) {
  const tr = useTr();
  return (
    <>
      <StudioBar
        dirty={dirty}
        saving={saving}
        panel={panel}
        onPanel={onPanel}
        onAdd={() => onAddOpen(true)}
        onReset={onReset}
        onSave={onSave}
        onCancel={onCancel}
      />
      <AddBlockDialog
        open={addOpen}
        onClose={() => onAddOpen(false)}
        onPick={onAddBlock}
        isProfessional={isProfessional}
      />
      {panel === "theme" && (
        <StudioDrawer
          title={tr(["Tema do perfil", "Profile theme", "Tema del perfil", "Thème du profil"])}
          onClose={() => onPanel(null)}
        >
          <ThemeEditor
            theme={draft.theme}
            onChange={(theme) => onDraft((p) => ({ ...p, theme }))}
            onImportSiteTheme={() => onDraft((p) => ({ ...p, theme: importSiteTheme() }))}
          />
        </StudioDrawer>
      )}
      {panel === "header" && (
        <StudioDrawer
          title={tr(["Capa e foto de perfil", "Cover and profile photo", "Portada y foto de perfil", "Couverture et photo de profil"])}
          onClose={() => onPanel(null)}
        >
          <HeaderEditor
            header={draft.header}
            onChange={(patch) => onDraft((p) => ({ ...p, header: { ...p.header, ...patch } }))}
            onMediaDone={onMediaDone}
            hasBanner={hasBanner}
            onRemoveBanner={onRemoveBanner}
          />
        </StudioDrawer>
      )}
      {panel === "block" && selected && (
        <StudioDrawer
          title={tr(["Ajustes do bloco", "Block settings", "Ajustes del bloque", "Réglages du bloc"])}
          onClose={() => onPanel(null)}
        >
          <BlockEditor
            block={selected}
            onChange={(patch) => onPatchBlock(selected.id, patch)}
            onDelete={() => onRemoveBlock(selected.id)}
          />
        </StudioDrawer>
      )}
    </>
  );
}

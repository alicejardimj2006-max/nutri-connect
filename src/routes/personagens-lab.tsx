// TEMPORÁRIO: laboratório para conferir os personagens 3D (não vai para o commit).
import { createFileRoute } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { AppScreen } from "@/components/app-screen";
import { ClinicalLayout } from "@/components/clinical/layout";
import { CharacterLive, type CharacterAction } from "@/components/character-live";
import { SiteNinaSection } from "@/components/admin/sections-site-nina";
import { DEFAULT_LOOK, DEFAULT_LOOK_V1, type NinaLook, type NinaModel } from "@/lib/characters/nina-config";
import type { CharacterId } from "@/lib/trail-types";

export const Route = createFileRoute("/personagens-lab")({
  validateSearch: (s: Record<string, unknown>) => ({
    a: (s.a as CharacterAction) ?? "idle",
    acts: typeof s.acts === "string" ? s.acts : "",
    only: (s.only as CharacterId | undefined) ?? undefined,
    bust: String(s.bust) === "1" || s.bust === true,
    w: Number(s.w) || 300,
    looks: String(s.looks) === "1" || s.looks === true,
    admin: String(s.admin) === "1" || s.admin === true,
    clinic: String(s.clinic) === "1" || s.clinic === true,
    screen: String(s.screen) === "1" || s.screen === true,
  }),
  component: Lab,
});

const IDS: CharacterId[] = ["nina", "lipe", "tito", "mila", "cadu"];

const LOOKS: NinaModel[] = [
  { version: "v1", look: DEFAULT_LOOK_V1 },
  { version: "v1", look: { ...DEFAULT_LOOK_V1, hairStyle: "coque", outfit: "moletom", outfitColor: "#e86a92", hair: "#1f1410", accessory: "laco", accessoryColor: "#3b82c4", glasses: "redondo", bangs: false, tablet: false } },
  { version: "v1", look: { ...DEFAULT_LOOK_V1, hairStyle: "marias", outfit: "vestido", outfitColor: "#cfe8f7", shirt: "#3b82c4", hair: "#d9a55b", eyes: "#3d6fa8", accessory: "flor", earrings: true } },
  { version: "v2", look: DEFAULT_LOOK },
  ...(
    [
      { hairStyle: "marias", outfit: "vestido", outfitColor: "#f5d6e0", shirt: "#e86a92", hair: "#d9a55b", accessory: "laco", accessoryColor: "#e86a92", eyes: "#3d6fa8", glasses: "redondo", tablet: false },
      { hairStyle: "rabo", outfit: "moletom", outfitColor: "#3b4a6b", hair: "#1f1410", skin: "#8d5a34", accessory: "nenhum", bangs: true, badge: false },
      { hairStyle: "coque", outfit: "camiseta", shirt: "#f4c95d", hair: "#c0392b", accessory: "flor", accessoryColor: "#ffffff", glasses: "quadrado", freckles: false },
      { hairStyle: "solto", outfit: "jaleco", hair: "#3b2416", skin: "#d49a6a", accessory: "tiara", accessoryColor: "#8e6cc2", eyes: "#2f6f4f" },
      { hairStyle: "curto", outfit: "camiseta", shirt: "#3b82c4", hair: "#7b5ea7", accessory: "folha", tablet: false },
    ] as Partial<NinaLook>[]
  ).map((p) => ({ version: "v2" as const, look: { ...DEFAULT_LOOK, ...p } })),
];

function Lab() {
  const { a, acts, only, bust, w, looks, admin, clinic, screen } = Route.useSearch();
  if (screen)
    return (
      <AppScreen>
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          {Array.from({ length: 30 }, (_, i) => (
            <div key={i} className="mb-3 rounded-2xl border bg-card p-6">
              Bloco {i + 1}
            </div>
          ))}
        </div>
      </AppScreen>
    );
  if (clinic)
    return (
      <ClinicalLayout
        title="Teste"
        items={[{ to: "/personagens-lab", label: "Início", icon: Home, exact: true }]}
      >
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} className="mb-3 rounded-2xl border bg-card p-6">
            Bloco {i + 1}
          </div>
        ))}
      </ClinicalLayout>
    );
  if (admin)
    return (
      <div style={{ padding: 16, background: "#f4efe6" }}>
        <SiteNinaSection />
      </div>
    );
  if (looks)
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: 8, background: "#f4efe6" }}>
        {LOOKS.map((model, i) => (
          <CharacterLive
            key={i}
            id="nina"
            model={model}
            action={a}
            framing={bust ? "bust" : "full"}
            entrance={false}
            style={{ width: w, height: (w * 4) / 3, background: "#efe7da" }}
          />
        ))}
      </div>
    );
  const ids = only ? [only] : IDS;
  const actions = acts ? (acts.split(",") as CharacterAction[]) : [a];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: 8, background: "#f4efe6" }}>
      {ids.flatMap((id) =>
        actions.map((action) => (
          <CharacterLive
            key={`${id}-${action}`}
            id={id}
            action={action}
            framing={bust ? "bust" : "full"}
            entrance={false}
            style={{ width: w, height: (w * 4) / 3, background: "#efe7da" }}
          />
        )),
      )}
    </div>
  );
}

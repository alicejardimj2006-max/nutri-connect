import type { CSSProperties } from "react";
import {
  CharacterLive,
  type CharacterAction,
  type Framing,
  type View,
} from "@/components/character-live";
import { Nina3D } from "@/components/nina-3d";
import type { MascotMood } from "@/components/mascots";
import type { NinaModel } from "@/lib/characters/nina-config";
import { useActiveNinaModel } from "@/lib/nina-model";

export type NinaAction = CharacterAction;
export type NinaFraming = Framing;

// Humor equivalente da Nina desenhada (usada enquanto o 3D carrega, na impressão e sem WebGL).
const FALLBACK_MOOD: Record<NinaAction, MascotMood> = {
  idle: "idle",
  talk: "talk",
  wave: "happy",
  happy: "happy",
  hop: "happy",
  cheer: "cheer",
  dance: "cheer",
  think: "talk",
  point: "talk",
  present: "talk",
  spin: "happy",
  jump: "cheer",
  sad: "sad",
};

/**
 * Nutri Nina em 3D, com movimentos, no modelo escolhido no painel (ou em `model`).
 * `live={false}` força a versão desenhada (útil para impressão/PDF).
 */
export function NinaLive({
  action = "idle",
  framing = "full",
  model,
  live = true,
  ...rest
}: {
  model?: NinaModel;
  /** Câmera girada/aproximada (visualizador do painel). */
  view?: View;
  action?: NinaAction;
  framing?: NinaFraming;
  live?: boolean;
  entrance?: boolean;
  className?: string;
  style?: CSSProperties;
  label?: string;
  actionKey?: number;
}) {
  const active = useActiveNinaModel();
  const chosen = model ?? active;
  return (
    <CharacterLive
      id="nina"
      action={action}
      framing={framing}
      model={chosen}
      // A "Nina desenhada" é o próprio desenho (não há 3D).
      live={live && chosen.version !== "desenho"}
      {...rest}
      fallback={
        <div
          className={`absolute inset-0 flex justify-center ${framing === "bust" ? "items-start" : "items-end"}`}
        >
          <div
            className="h-full"
            style={{ aspectRatio: framing === "bust" ? "200 / 233" : "200 / 300" }}
          >
            <Nina3D mood={FALLBACK_MOOD[action]} bust={framing === "bust"} />
          </div>
        </div>
      }
    />
  );
}

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Nina3D } from "@/components/nina-3d";
import type { MascotMood } from "@/components/mascots";
import type { NinaAction, NinaController, NinaFraming } from "@/lib/nina-scene";

export type { NinaAction, NinaFraming };

type SceneModule = typeof import("@/lib/nina-scene");

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

// O módulo 3D é baixado uma vez só; depois disso as Ninas seguintes nascem na mesma pintura.
let sceneModule: SceneModule | null = null;
let scenePromise: Promise<SceneModule> | null = null;
let webglSupport: boolean | null = null;

function loadScene() {
  scenePromise ??= import("@/lib/nina-scene").then((m) => (sceneModule = m));
  return scenePromise;
}

function hasWebGL() {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    webglSupport = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

// useLayoutEffect não roda no servidor; lá usamos useEffect (que também não roda) sem aviso.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Nutri Nina em 3D, com movimentos. Todas as Ninas da página compartilham um único motor WebGL.
 * `live={false}` força a versão desenhada (útil para impressão/PDF).
 */
export function NinaLive({
  action = "idle",
  framing = "full",
  live = true,
  entrance = true,
  className = "",
  style,
  label,
  actionKey,
}: {
  action?: NinaAction;
  framing?: NinaFraming;
  live?: boolean;
  /** Surge com um pulinho elástico ao aparecer. */
  entrance?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Descrição para leitores de tela; sem ela a Nina é tratada como decoração. */
  label?: string;
  /** Mude este número para repetir a mesma ação (ex.: clicar duas vezes em "girar"). */
  actionKey?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<NinaController | null>(null);
  const [ready, setReady] = useState(false);
  const latest = useRef({ action, framing, entrance });
  latest.current = { action, framing, entrance };

  useIsoLayoutEffect(() => {
    if (!live || !host.current || !hasWebGL()) return;
    let cancelled = false;
    const start = (m: SceneModule) => {
      if (cancelled || !host.current) return;
      try {
        controller.current = m.createNina(host.current, latest.current);
        setReady(true);
      } catch {
        // Sem 3D: continua a versão desenhada.
      }
    };
    if (sceneModule) start(sceneModule);
    else loadScene().then(start, () => {});
    return () => {
      cancelled = true;
      controller.current?.dispose();
      controller.current = null;
      setReady(false);
    };
  }, [live]);

  useEffect(() => {
    controller.current?.setAction(action);
  }, [action, actionKey, ready]);

  useEffect(() => {
    controller.current?.setFraming(framing);
  }, [framing, ready]);

  return (
    <div
      ref={host}
      className={`relative ${className}`}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {!ready && (
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
      )}
    </div>
  );
}

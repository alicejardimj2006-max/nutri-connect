import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { CharacterId } from "@/lib/trail-types";
import type { CharacterAction, CharacterController, Framing, View } from "@/lib/characters/scene";
import { modelKey, type NinaModel } from "@/lib/characters/nina-config";

export type { CharacterAction, Framing, View };

type SceneModule = typeof import("@/lib/characters/scene");

// O módulo 3D é baixado uma vez só; depois disso os personagens seguintes nascem na mesma pintura.
let sceneModule: SceneModule | null = null;
let scenePromise: Promise<SceneModule> | null = null;
let webglSupport: boolean | null = null;

function loadScene() {
  scenePromise ??= import("@/lib/characters/scene").then((m) => (sceneModule = m));
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
 * Personagem em 3D, com movimentos. Todos os personagens da página compartilham um único motor WebGL.
 * Enquanto o 3D carrega (e sem WebGL, ou com `live={false}`, para impressão) aparece `fallback`.
 */
export function CharacterLive({
  id,
  action = "idle",
  framing = "full",
  live = true,
  entrance = true,
  className = "",
  style,
  label,
  actionKey,
  fallback,
  model,
  view,
}: {
  id: CharacterId;
  /** Modelo e aparência da Nina (os outros personagens ignoram). */
  model?: NinaModel;
  /** Câmera girada/aproximada (visualizador do painel). */
  view?: View;
  action?: CharacterAction;
  framing?: Framing;
  live?: boolean;
  /** Surge com um pulinho elástico ao aparecer. */
  entrance?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Descrição para leitores de tela; sem ela o personagem é tratado como decoração. */
  label?: string;
  /** Mude este número para repetir a mesma ação (ex.: clicar duas vezes em "girar"). */
  actionKey?: number;
  fallback?: ReactNode;
}) {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<CharacterController | null>(null);
  const [ready, setReady] = useState(false);
  const latest = useRef({ action, framing, entrance, model, view });
  latest.current = { action, framing, entrance, model, view };
  const key = model ? modelKey(model) : "";

  useIsoLayoutEffect(() => {
    if (!live || !host.current || !hasWebGL()) return;
    let cancelled = false;
    const start = (m: SceneModule) => {
      if (cancelled || !host.current) return;
      try {
        controller.current = m.createCharacter(host.current, id, latest.current);
        if (latest.current.view) controller.current.setView(latest.current.view);
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
    // O modelo muda (outra versão ou outra aparência): monta o personagem de novo.
  }, [live, id, key]);

  useEffect(() => {
    controller.current?.setAction(action);
  }, [action, actionKey, ready]);

  useEffect(() => {
    controller.current?.setFraming(framing);
  }, [framing, ready]);

  useEffect(() => {
    if (view) controller.current?.setView(view);
  }, [view?.yaw, view?.pitch, view?.zoom, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={host}
      className={`relative ${className}`}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {!ready && fallback}
    </div>
  );
}

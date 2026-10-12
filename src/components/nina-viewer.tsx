// Visualizador da Nina (painel da administração): arrastar gira, a roda do mouse aproxima, e os
// botões mostram cada ação.
import { useEffect, useRef, useState } from "react";
import { Maximize2, Minus, Pause, Play, Plus, RotateCcw } from "lucide-react";
import type { View } from "@/components/character-live";
import { NinaLive, type NinaAction, type NinaFraming } from "@/components/nina-live";
import type { NinaModel } from "@/lib/characters/nina-config";

const NINA_ACTIONS: { id: NinaAction; label: string }[] = [
  { id: "idle", label: "Parada" },
  { id: "talk", label: "Falar" },
  { id: "wave", label: "Acenar" },
  { id: "happy", label: "Feliz" },
  { id: "cheer", label: "Comemorar" },
  { id: "dance", label: "Dançar" },
  { id: "think", label: "Pensar" },
  { id: "point", label: "Apontar" },
  { id: "present", label: "Apresentar" },
  { id: "spin", label: "Girar" },
  { id: "jump", label: "Pular" },
  { id: "hop", label: "Pulinho" },
  { id: "sad", label: "Triste" },
];

const START: View = { yaw: 0, pitch: 0, zoom: 1 };
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const chip =
  "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

export function NinaViewer({ model, height = 460 }: { model: NinaModel; height?: number }) {
  const [view, setView] = useState<View>(START);
  const [action, setAction] = useState<NinaAction>("idle");
  const [actionKey, setActionKey] = useState(0);
  const [framing, setFraming] = useState<NinaFraming>("full");
  const [auto, setAuto] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const is3d = model.version !== "desenho";

  // Roda do mouse aproxima/afasta (precisa ser não passivo para não rolar a página).
  useEffect(() => {
    const el = stage.current;
    if (!el || !is3d) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setView((v) => ({ ...v, zoom: clamp(v.zoom * (1 - e.deltaY * 0.0015), 0.6, 3) }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [is3d]);

  // Giro automático.
  useEffect(() => {
    if (!auto || !is3d) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setView((v) => ({ ...v, yaw: v.yaw + dt * 0.8 }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [auto, is3d]);

  const play = (id: NinaAction) => {
    setAction(id);
    setActionKey((k) => k + 1);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={stage}
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-b from-secondary/60 to-secondary ${is3d ? "cursor-grab touch-none active:cursor-grabbing" : ""}`}
        style={{ height }}
        onPointerDown={(e) => {
          if (!is3d) return;
          drag.current = { x: e.clientX, y: e.clientY };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          setAuto(false);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x;
          const dy = e.clientY - d.y;
          drag.current = { x: e.clientX, y: e.clientY };
          setView((v) => ({
            ...v,
            yaw: v.yaw - dx * 0.012,
            pitch: clamp(v.pitch + dy * 0.008, -0.45, 0.9),
          }));
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        <NinaLive
          model={model}
          action={action}
          actionKey={actionKey}
          framing={framing}
          view={view}
          entrance={false}
          className="h-full w-full"
          label="Pré-visualização da Nina"
        />
        {is3d ? (
          <div className="absolute right-3 top-3 flex flex-col gap-1.5">
            {[
              {
                icon: Plus,
                label: "Aproximar",
                on: () => setView((v) => ({ ...v, zoom: clamp(v.zoom * 1.2, 0.6, 3) })),
              },
              {
                icon: Minus,
                label: "Afastar",
                on: () => setView((v) => ({ ...v, zoom: clamp(v.zoom / 1.2, 0.6, 3) })),
              },
              {
                icon: auto ? Pause : Play,
                label: auto ? "Parar o giro" : "Girar sozinha",
                on: () => setAuto((a) => !a),
              },
              {
                icon: RotateCcw,
                label: "Voltar para a frente",
                on: () => {
                  setAuto(false);
                  setView(START);
                },
              },
            ].map(({ icon: Icon, label, on }) => (
              <button
                key={label}
                type="button"
                title={label}
                aria-label={label}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={on}
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-card/90 text-foreground shadow-soft transition hover:bg-card"
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        ) : (
          <p className="absolute inset-x-3 top-3 rounded-full bg-card/90 px-3 py-1.5 text-center text-[11px] font-semibold text-muted-foreground">
            Modelo 2D: não gira, mas mostra as expressões.
          </p>
        )}
        {is3d && (
          <p className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-[11px] font-semibold text-muted-foreground/80">
            Arraste para girar · role para aproximar
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {NINA_ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => play(a.id)}
            className={`${chip} ${action === a.id ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card hover:bg-secondary"}`}
          >
            {a.label}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-border" />
        {(
          [
            ["full", "Corpo inteiro"],
            ["bust", "Busto"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFraming(id)}
            className={`${chip} ${framing === id ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:bg-secondary"}`}
          >
            <Maximize2 className="mr-1 inline h-3 w-3" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Sons da interface, sintetizados no aparelho com a Web Audio API (nenhum arquivo é baixado).
// Seguem as escolhas de Configurações → Personalização → Sons. O navegador só libera o áudio depois
// de um toque/clique da pessoa; antes disso o som simplesmente não toca.
import { APPEARANCE_EVENT, loadAppearance, type Appearance, type SoundStyle } from "./appearance";

export type SoundKind = "notification" | "message" | "achievement" | "click";

interface Voice {
  wave: OscillatorType;
  /** Duração de cada nota, em segundos. */
  note: number;
  /** Multiplicador de altura (graves ou agudos). */
  pitch: number;
}

const VOICES: Record<SoundStyle, Voice> = {
  suave: { wave: "sine", note: 0.16, pitch: 1 },
  cristal: { wave: "triangle", note: 0.12, pitch: 1.5 },
  madeira: { wave: "square", note: 0.07, pitch: 0.62 },
};

/** Notas (Hz) de cada som. */
const MELODIES: Record<SoundKind, number[]> = {
  notification: [660, 880],
  message: [520, 700],
  achievement: [523, 659, 784, 1047],
  click: [900],
};

let ctx: AudioContext | null = null;
let current: Appearance | null = null;

function settings(): Appearance {
  if (!current) current = loadAppearance();
  return current;
}

if (typeof window !== "undefined") {
  window.addEventListener(APPEARANCE_EVENT, () => {
    current = null;
  });
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  if (ctx.state === "suspended") void ctx.resume().catch(() => null);
  return ctx;
}

const ENABLED_KEY: Record<SoundKind, keyof Appearance> = {
  notification: "soundNotification",
  message: "soundMessage",
  achievement: "soundAchievement",
  click: "soundClicks",
};

/**
 * Toca o som se a pessoa deixou sons e este tipo ligados. `preview` ignora os interruptores (para os
 * botões "Ouvir" do painel) e aceita um estilo/volume ainda não salvos.
 */
export function playSound(
  kind: SoundKind,
  preview?: { style?: SoundStyle; volume?: number },
): void {
  const s = settings();
  if (!preview && (!s.soundsOn || !s[ENABLED_KEY[kind]])) return;
  const volume = (preview?.volume ?? s.soundVolume) / 100;
  if (volume <= 0) return;

  const ac = audio();
  if (!ac) return;
  const voice = VOICES[preview?.style ?? s.soundStyle];
  const peak = Math.min(0.35, 0.35 * volume * (kind === "click" ? 0.5 : 1));

  let at = ac.currentTime + 0.01;
  for (const hz of MELODIES[kind]) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = voice.wave;
    osc.frequency.value = hz * voice.pitch;
    const len = kind === "click" ? 0.05 : voice.note;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(peak, at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + len);
    osc.connect(gain).connect(ac.destination);
    osc.start(at);
    osc.stop(at + len + 0.02);
    at += len * 0.85;
  }
}

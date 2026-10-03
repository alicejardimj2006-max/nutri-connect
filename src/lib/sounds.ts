// Sons da interface, sintetizados no aparelho com a Web Audio API (nenhum arquivo é baixado).
// Seguem as escolhas de Configurações → Personalização → Sons. O navegador só libera o áudio depois
// de um toque/clique da pessoa; antes disso o som simplesmente não toca.
import {
  APPEARANCE_EVENT,
  inHourWindow,
  loadAppearance,
  type Appearance,
  type SoundStyle,
  type ToneId,
} from "./appearance";

export type SoundKind =
  | "notification"
  | "message"
  | "achievement"
  | "click"
  | "send"
  | "success"
  | "error"
  | "support";

interface Voice {
  wave: OscillatorType;
  /** Duração de cada nota, em segundos. */
  note: number;
  /** Multiplicador de altura (graves ou agudos). */
  pitch: number;
}

/** Timbre geral (o "estilo" escolhido em Sons). */
const VOICES: Record<SoundStyle, Voice> = {
  suave: { wave: "sine", note: 0.16, pitch: 1 },
  cristal: { wave: "triangle", note: 0.12, pitch: 1.5 },
  madeira: { wave: "square", note: 0.07, pitch: 0.62 },
};

/** Melodias (notas em Hz) que a pessoa pode atribuir a cada evento. */
export const TONES: Record<ToneId, number[]> = {
  sino: [660, 880],
  gota: [520, 700],
  digital: [880, 880, 1320],
  harpa: [523, 659, 784, 1047],
  moeda: [988, 1319],
  sopro: [330],
  marimba: [784, 988, 1175],
  alerta: [440, 330],
};

export const TONE_IDS = Object.keys(TONES) as ToneId[];

interface KindConfig {
  enabled: keyof Appearance;
  tone: keyof Appearance;
  /** Eventos que também podem vibrar o aparelho. */
  vibrate?: boolean;
}

const KINDS: Record<SoundKind, KindConfig> = {
  notification: { enabled: "soundNotification", tone: "toneNotification", vibrate: true },
  message: { enabled: "soundMessage", tone: "toneMessage", vibrate: true },
  achievement: { enabled: "soundAchievement", tone: "toneAchievement" },
  click: { enabled: "soundClicks", tone: "toneClick" },
  send: { enabled: "soundSend", tone: "toneSend" },
  success: { enabled: "soundSuccess", tone: "toneSuccess" },
  error: { enabled: "soundError", tone: "toneError" },
  support: { enabled: "soundSupport", tone: "toneSupport" },
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

/**
 * Toca o som se a pessoa deixou sons e este tipo ligados (e não é horário de silêncio).
 * `preview` ignora os interruptores (para os botões "Ouvir" do painel) e aceita estilo, volume e
 * melodia ainda não salvos.
 */
export function playSound(
  kind: SoundKind,
  preview?: { style?: SoundStyle; volume?: number; tone?: ToneId },
): void {
  const s = settings();
  const cfg = KINDS[kind];
  if (!preview) {
    if (!s.soundsOn || !s[cfg.enabled]) return;
    if (s.quietOn && inHourWindow(s.quietFrom, s.quietTo)) return;
  }
  if (!preview && cfg.vibrate && s.vibration && "vibrate" in navigator) {
    navigator.vibrate?.(kind === "message" ? [40] : [60, 40, 60]);
  }
  const volume = (preview?.volume ?? s.soundVolume) / 100;
  if (volume <= 0) return;

  const ac = audio();
  if (!ac) return;
  const voice = VOICES[preview?.style ?? s.soundStyle];
  const tone = preview?.tone ?? (s[cfg.tone] as ToneId);
  const notes = TONES[tone] ?? TONES.sino;
  const peak = Math.min(0.35, 0.35 * volume * (kind === "click" ? 0.5 : 1));

  let at = ac.currentTime + 0.01;
  for (const hz of notes) {
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

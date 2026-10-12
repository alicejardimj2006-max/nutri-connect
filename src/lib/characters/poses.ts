// Poses dos personagens 3D: cada ação é uma função do tempo que devolve os ângulos das juntas e a
// expressão do rosto. Todos os personagens usam as mesmas ações (o esqueleto é o mesmo).

export type CharacterAction =
  | "idle"
  | "talk"
  | "wave"
  | "happy"
  | "cheer"
  | "dance"
  | "think"
  | "point"
  | "present"
  | "spin"
  | "jump"
  | "hop"
  | "sad";

export interface Pose {
  y: number; // salto
  rotY: number; // giro do corpo
  lean: number; // inclinação para a frente
  tilt: number; // inclinação lateral
  headX: number;
  headY: number;
  headZ: number;
  lShX: number;
  lShZ: number;
  lEl: number;
  rShX: number;
  rShZ: number;
  rEl: number;
  lLeg: number;
  rLeg: number;
  mouth: number; // boca aberta (0–1)
  smile: number; // -1 (triste) a 1 (sorrisão)
  squint: number; // olhos apertados de alegria (0–1)
  brow: number; // -1 (triste) a 1 (surpresa)
  squash: number; // achatamento/esticamento (1 = normal)
  lookUp: number; // olhar para cima (pensando)
}

export const POSE_KEYS = [
  "y",
  "rotY",
  "lean",
  "tilt",
  "headX",
  "headY",
  "headZ",
  "lShX",
  "lShZ",
  "lEl",
  "rShX",
  "rShZ",
  "rEl",
  "lLeg",
  "rLeg",
  "mouth",
  "smile",
  "squint",
  "brow",
  "squash",
  "lookUp",
] as const satisfies readonly (keyof Pose)[];

/** Duração das ações que acontecem uma vez só (depois o personagem volta a ficar parado). */
export const ONE_SHOT: Partial<Record<CharacterAction, number>> = {
  spin: 1.4,
  jump: 1.15,
  hop: 0.9,
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

/** Fala: a boca abre e fecha num ritmo irregular, com pausas, como numa conversa. */
function speech(t: number) {
  const pause = Math.sin(t * 0.9) > -0.55 ? 1 : 0;
  return clamp01(0.45 + 0.55 * Math.sin(t * 11) * Math.sin(t * 3.3 + 1)) * pause;
}

/** Pose parada. `holding` = o braço esquerdo segura algo na altura do peito (o tablet da Nina). */
function basePose(t: number, holding: boolean): Pose {
  const breath = Math.sin(t * 1.8);
  return {
    y: 0,
    rotY: 0,
    lean: breath * 0.015,
    tilt: Math.sin(t * 0.7) * 0.03,
    headX: Math.sin(t * 1.1) * 0.02,
    headY: 0,
    headZ: Math.sin(t * 0.9) * 0.04,
    lShX: holding ? -0.35 : 0.05,
    lShZ: holding ? 0.14 : 0.14 - breath * 0.02,
    lEl: holding ? -1.35 : -0.25,
    rShX: 0.05,
    rShZ: -0.14 + breath * 0.02,
    rEl: -0.25,
    lLeg: 0,
    rLeg: 0,
    mouth: 0,
    smile: 0.6,
    squint: 0,
    brow: 0,
    squash: 1 + breath * 0.008,
    lookUp: 0,
  };
}

export function poseFor(action: CharacterAction, t: number, ta: number, holding: boolean): Pose {
  const p = basePose(t, holding);
  // Braço esquerdo em repouso (com ou sem o tablet), ponto de partida das ações que o movem.
  const lEl0 = p.lEl;
  const lShZ0 = p.lShZ;
  switch (action) {
    case "idle":
      return p;
    case "talk":
      return {
        ...p,
        mouth: speech(t),
        smile: 0.55,
        headX: Math.sin(t * 3) * 0.05,
        headZ: Math.sin(t * 1.7) * 0.07,
        rShX: -0.7 + Math.sin(t * 2.3) * 0.25,
        rShZ: -0.28,
        rEl: -1.1 + Math.sin(t * 3.7) * 0.35,
        brow: Math.max(0, Math.sin(t * 2.1)) * 0.4,
      };
    case "wave":
      return {
        ...p,
        rShZ: -2.5 + Math.sin(t * 9) * 0.28,
        rShX: -0.2,
        rEl: -0.5 + Math.sin(t * 9 + 1) * 0.2,
        headZ: -0.12,
        tilt: -0.05,
        y: Math.abs(Math.sin(t * 4.5)) * 0.05,
        smile: 1,
        squint: 0.7,
        mouth: 0.25,
      };
    case "happy": {
      const hop = Math.abs(Math.sin(t * 5));
      return {
        ...p,
        y: hop * 0.28,
        squash: 1 + (hop - 0.5) * 0.08,
        rShZ: -0.7,
        rEl: -0.6,
        lShZ: 0.3,
        smile: 1,
        squint: 0.8,
        mouth: 0.35,
        headZ: Math.sin(t * 5) * 0.08,
      };
    }
    case "cheer": {
      const hop = Math.abs(Math.sin(t * 5.5));
      return {
        ...p,
        y: hop * 0.45,
        squash: 1 + (hop - 0.5) * 0.12,
        rShZ: -2.7 + Math.sin(t * 11) * 0.15,
        rShX: -0.1,
        rEl: -0.3,
        lShZ: 2.6 - Math.sin(t * 11) * 0.15,
        lShX: -0.1,
        lEl: -0.5,
        lLeg: -hop * 0.25,
        rLeg: -hop * 0.25,
        smile: 1,
        squint: 0.8,
        mouth: 0.75,
        brow: 0.6,
      };
    }
    case "dance": {
      const beat = t * 4.2;
      return {
        ...p,
        y: Math.abs(Math.sin(beat)) * 0.1,
        rotY: Math.sin(beat / 2) * 0.45,
        tilt: Math.sin(beat) * 0.12,
        rShZ: -1.3 + Math.sin(beat) * 0.9,
        rShX: -0.3,
        rEl: -1.2,
        lShZ: 1.1 - Math.sin(beat) * 0.6,
        lShX: -0.3,
        lEl: -1.1,
        lLeg: -Math.max(0, Math.sin(beat)) * 0.5,
        rLeg: -Math.max(0, -Math.sin(beat)) * 0.5,
        headZ: Math.sin(beat) * 0.15,
        headX: Math.abs(Math.sin(beat)) * 0.06,
        smile: 1,
        squint: 0.5,
        mouth: 0.3,
      };
    }
    case "think":
      return {
        ...p,
        rShX: -1.25,
        rShZ: 0.4,
        rEl: -2.15,
        headZ: 0.16,
        headX: -0.1,
        headY: 0.22 + Math.sin(t * 0.8) * 0.06,
        tilt: 0.04,
        smile: 0.15,
        brow: 0.8,
        lookUp: 1,
      };
    case "point":
      return {
        ...p,
        rShZ: -1.45 + Math.sin(t * 2) * 0.03,
        rShX: -0.35,
        rEl: -0.1,
        headY: -0.35,
        headZ: -0.06,
        tilt: -0.04,
        smile: 0.9,
        mouth: speech(t) * 0.6,
      };
    case "present":
      return {
        ...p,
        lShX: -1.2,
        lShZ: 0.4,
        lEl: -0.55,
        rShZ: -0.9,
        rShX: -0.6,
        rEl: -0.6 + Math.sin(t * 2.2) * 0.12,
        headY: 0.28 * (Math.sin(t * 0.9) > 0 ? 1 : 0.2),
        headZ: 0.05,
        smile: 0.85,
        mouth: speech(t) * 0.7,
      };
    case "spin": {
      const k = clamp01(ta / ONE_SHOT.spin!);
      const e = ease(k);
      const arc = Math.sin(Math.PI * k);
      return {
        ...p,
        rotY: k >= 1 ? 0 : e * Math.PI * 2,
        y: arc * 0.3,
        rShZ: -0.2 - arc * 1.2,
        lShZ: lShZ0 + arc * 1.2,
        lEl: lEl0 + arc,
        smile: 1,
        squint: arc > 0.2 ? 0.8 : 0,
        mouth: arc * 0.4,
      };
    }
    case "jump": {
      const k = ta / ONE_SHOT.jump!;
      if (k >= 1) return { ...p, smile: 1 };
      if (k < 0.22) {
        const c = k / 0.22;
        return { ...p, squash: 1 - c * 0.18, lean: c * 0.15, rShX: 0.4 * c, smile: 0.8 };
      }
      if (k < 0.82) {
        const a = (k - 0.22) / 0.6;
        const up = Math.sin(Math.PI * a);
        return {
          ...p,
          y: up * 1.05,
          squash: 1 + up * 0.1,
          rShZ: -2.4 * up,
          lShZ: lShZ0 + 2.2 * up,
          lEl: lEl0 + up,
          lLeg: -0.35 * up,
          rLeg: -0.35 * up,
          smile: 1,
          squint: 0.8,
          mouth: 0.6,
          brow: 0.8,
        };
      }
      const l = (k - 0.82) / 0.18;
      return { ...p, squash: 0.86 + l * 0.14, smile: 1, squint: 0.8 * (1 - l) };
    }
    case "hop": {
      const k = ta / ONE_SHOT.hop!;
      if (k >= 1) return { ...p, smile: 1 };
      const up = Math.sin(Math.PI * k);
      return {
        ...p,
        y: up * 0.35,
        squash: 1 + up * 0.06,
        rShZ: -0.2 - up * 0.9,
        lShZ: lShZ0 + up * 0.5,
        smile: 1,
        squint: 0.8,
        mouth: up * 0.4,
      };
    }
    case "sad":
      return {
        ...p,
        lean: 0.16,
        headX: 0.3,
        headZ: Math.sin(t * 0.6) * 0.05,
        rShZ: -0.05,
        rEl: -0.1,
        lShZ: holding ? 0.08 : 0.06,
        smile: -0.8,
        brow: -1,
        squash: 0.98,
      };
  }
}

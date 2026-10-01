// Nutri Nina em 3D (WebGL, three.js). A personagem é montada com formas simples (esferas, cápsulas,
// tornos) num esqueleto articulado, e cada ação é uma pose calculada a cada quadro: sem arquivos de
// modelo, carrega rápido e fica nítida em qualquer tamanho. Este módulo é carregado sob demanda
// (import dinâmico) por components/nina-live.tsx, então o three.js só é baixado quando a Nina aparece.

import * as THREE from "three";

export type NinaAction =
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

export type NinaFraming = "full" | "bust";

export interface NinaController {
  setAction(action: NinaAction): void;
  setFraming(framing: NinaFraming): void;
  dispose(): void;
}

const COLORS = {
  skin: "#f2c6a4",
  skinShade: "#e3a888",
  hair: "#7b4a2b",
  hairDark: "#58321b",
  coat: "#fbf9f4",
  shirt: "#4f9e94",
  pants: "#2f3a4c",
  shoe: "#7a4420",
  ink: "#2a1a10",
  blush: "#f08c7a",
  mouth: "#8a3a33",
  tongue: "#e07a6e",
  tablet: "#3b4759",
  tie: "#b4532a",
  leaf: "#6f9a3c",
  leafDark: "#4f7426",
};

// ───────────────────────── Poses ─────────────────────────

interface Pose {
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
  squint: number; // olhos fechados de alegria (^ ^)
  brow: number; // -1 (triste) a 1 (surpresa)
  squash: number; // achatamento/esticamento (1 = normal)
  lookUp: number; // olhar para cima (pensando)
}

const KEYS = [
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

/** Duração das ações que acontecem uma vez só (depois ela volta a ficar parada). */
const ONE_SHOT: Partial<Record<NinaAction, number>> = { spin: 1.4, jump: 1.15, hop: 0.9 };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

/** Fala: a boca abre e fecha num ritmo irregular, com pausas, como numa conversa. */
function speech(t: number) {
  const pause = Math.sin(t * 0.9) > -0.55 ? 1 : 0;
  return clamp01(0.45 + 0.55 * Math.sin(t * 11) * Math.sin(t * 3.3 + 1)) * pause;
}

function basePose(t: number): Pose {
  const breath = Math.sin(t * 1.8);
  return {
    y: 0,
    rotY: 0,
    lean: breath * 0.015,
    tilt: Math.sin(t * 0.7) * 0.03,
    headX: Math.sin(t * 1.1) * 0.02,
    headY: 0,
    headZ: Math.sin(t * 0.9) * 0.04,
    // Braço esquerdo segura o tablet na altura do peito.
    lShX: -0.35,
    lShZ: 0.14,
    lEl: -1.35,
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

function poseFor(action: NinaAction, t: number, ta: number): Pose {
  const p = basePose(t);
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
        squint: 0.9,
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
        squint: 1,
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
        squint: 1,
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
        squint: 0.6,
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
        lShZ: 0.14 + arc * 1.2,
        lEl: -1.35 + arc,
        smile: 1,
        squint: arc > 0.2 ? 1 : 0,
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
          lShZ: 0.14 + 2.2 * up,
          lEl: -1.35 + up,
          lLeg: -0.35 * up,
          rLeg: -0.35 * up,
          smile: 1,
          squint: 1,
          mouth: 0.6,
          brow: 0.8,
        };
      }
      const l = (k - 0.82) / 0.18;
      return { ...p, squash: 0.86 + l * 0.14, smile: 1, squint: 1 - l };
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
        lShZ: 0.14 + up * 0.5,
        smile: 1,
        squint: 1,
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
        lShZ: 0.08,
        smile: -0.8,
        brow: -1,
        squash: 0.98,
      };
  }
}

// ───────────────────────── Montagem ─────────────────────────

function mat(color: string, opts: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0, ...opts });
}

function canvasTexture(width: number, height: number, draw: (g: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext("2d")!;
  draw(g);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Posiciona um enfeite na superfície da cabeça (esfera de raio r) e o vira para fora. */
function onHead(obj: THREE.Object3D, x: number, y: number, r = 1, lift = 0) {
  const z = Math.sqrt(Math.max(0, r * r - x * x - y * y));
  const n = new THREE.Vector3(x, y, z).normalize();
  obj.position.copy(n.clone().multiplyScalar(r + lift));
  obj.rotation.set(-Math.asin(n.y), Math.atan2(n.x, n.z), 0, "YXZ");
  return obj;
}

interface Rig {
  root: THREE.Group;
  mover: THREE.Group;
  squash: THREE.Group;
  spine: THREE.Group;
  head: THREE.Group;
  lShoulder: THREE.Group;
  rShoulder: THREE.Group;
  lElbow: THREE.Group;
  rElbow: THREE.Group;
  lLeg: THREE.Group;
  rLeg: THREE.Group;
  eyes: THREE.Group[];
  eyeOvals: THREE.Object3D[];
  happyEyes: THREE.Object3D[];
  brows: THREE.Object3D[];
  smile: THREE.Mesh;
  mouthOpen: THREE.Group;
  braids: THREE.Group[][];
  shadow: THREE.Mesh;
  textures: THREE.Texture[];
}

function buildNina(): Rig {
  const textures: THREE.Texture[] = [];
  const m = {
    skin: mat(COLORS.skin, { roughness: 0.75 }),
    skinShade: mat(COLORS.skinShade, { roughness: 0.8 }),
    hair: mat(COLORS.hair, { roughness: 0.5 }),
    hairDark: mat(COLORS.hairDark, { roughness: 0.55 }),
    coat: mat(COLORS.coat, { roughness: 0.7, side: THREE.DoubleSide }),
    shirt: mat(COLORS.shirt, { roughness: 0.7 }),
    pants: mat(COLORS.pants, { roughness: 0.8 }),
    shoe: mat(COLORS.shoe, { roughness: 0.45 }),
    ink: mat(COLORS.ink, { roughness: 0.3 }),
    white: mat("#ffffff", { roughness: 0.2, emissive: "#ffffff", emissiveIntensity: 0.4 }),
    blush: new THREE.MeshBasicMaterial({
      color: COLORS.blush,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    }),
    mouth: mat(COLORS.mouth, { roughness: 0.6 }),
    tongue: mat(COLORS.tongue, { roughness: 0.6 }),
    tablet: mat(COLORS.tablet, { roughness: 0.35 }),
    tie: mat(COLORS.tie, { roughness: 0.4 }),
    leaf: mat(COLORS.leaf, { roughness: 0.5 }),
    leafDark: mat(COLORS.leafDark, { roughness: 0.5 }),
  };
  const mesh = (geo: THREE.BufferGeometry, material: THREE.Material | THREE.Material[]) => {
    const me = new THREE.Mesh(geo, material);
    return me;
  };

  const root = new THREE.Group();
  const mover = new THREE.Group();
  const squash = new THREE.Group();
  root.add(mover);
  mover.add(squash);

  // Sombra no chão.
  const shadowTex = canvasTexture(128, 128, (g) => {
    const grd = g.createRadialGradient(64, 64, 4, 64, 64, 64);
    grd.addColorStop(0, "rgba(52,45,36,0.45)");
    grd.addColorStop(1, "rgba(52,45,36,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
  });
  textures.push(shadowTex);
  const shadow = mesh(
    new THREE.PlaneGeometry(2.4, 1.2),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  root.add(shadow);

  // Quadril e pernas.
  const hips = new THREE.Group();
  hips.position.y = 1.0;
  squash.add(hips);
  const legs = [-1, 1].map((side) => {
    const leg = new THREE.Group();
    leg.position.set(side * 0.27, 0, 0);
    const thigh = mesh(new THREE.CapsuleGeometry(0.2, 0.55, 6, 16), m.pants);
    thigh.position.y = -0.45;
    const shoe = mesh(new THREE.SphereGeometry(0.26, 20, 14), m.shoe);
    shoe.scale.set(0.95, 0.55, 1.25);
    shoe.position.set(0, -0.9, 0.08);
    leg.add(thigh, shoe);
    hips.add(leg);
    return leg;
  });

  // Tronco: blusa verde por dentro e jaleco aberto na frente.
  const spine = new THREE.Group();
  hips.add(spine);
  const profile = [
    [0.74, -0.12],
    [0.72, 0.2],
    [0.64, 0.6],
    [0.54, 0.88],
    [0.42, 1.03],
    [0.22, 1.12],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const shirt = mesh(
    new THREE.LatheGeometry(
      profile.map((v) => new THREE.Vector2(v.x * 0.96, v.y)),
      40,
    ),
    m.shirt,
  );
  shirt.position.y = 0.02;
  const coat = mesh(new THREE.LatheGeometry(profile, 48, 0.46, Math.PI * 2 - 0.92), m.coat);
  spine.add(shirt, coat);
  // Bolsos e gola do jaleco.
  [-1, 1].forEach((side) => {
    const pocket = mesh(new THREE.BoxGeometry(0.26, 0.2, 0.03), m.coat);
    const ang = side * 0.75;
    pocket.position.set(Math.sin(ang) * 0.705, 0.22, Math.cos(ang) * 0.705);
    pocket.rotation.y = ang;
    spine.add(pocket);
  });

  // Pescoço.
  const neck = mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.3, 16), m.skin);
  neck.position.y = 1.18;
  spine.add(neck);

  // Cordão colorido e crachá.
  const lanyardTex = canvasTexture(256, 4, (g) => {
    const grd = g.createLinearGradient(0, 0, 256, 0);
    grd.addColorStop(0, "#f08a2b");
    grd.addColorStop(0.5, "#5db54e");
    grd.addColorStop(1, "#3b82c4");
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 4);
  });
  textures.push(lanyardTex);
  const lanyardMat = mat("#ffffff", { map: lanyardTex, roughness: 0.6 });
  [-1, 1].forEach((side) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.17, 1.12, 0.12),
      new THREE.Vector3(side * 0.3, 0.95, 0.44),
      new THREE.Vector3(side * 0.16, 0.72, 0.6),
      new THREE.Vector3(0, 0.6, 0.64),
    ]);
    spine.add(mesh(new THREE.TubeGeometry(curve, 24, 0.028, 8, false), lanyardMat));
  });
  const badgeTex = canvasTexture(96, 128, (g) => {
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, 96, 128);
    g.fillStyle = "#555f36";
    g.fillRect(0, 0, 96, 26);
    g.fillStyle = "#f2c6a4";
    g.beginPath();
    g.arc(48, 62, 20, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#7b4a2b";
    g.beginPath();
    g.arc(48, 56, 20, Math.PI, 0);
    g.fill();
    g.fillStyle = "#342d24";
    g.font = "bold 18px sans-serif";
    g.textAlign = "center";
    g.fillText("Nina", 48, 110);
  });
  textures.push(badgeTex);
  const badge = mesh(new THREE.BoxGeometry(0.26, 0.34, 0.025), [
    m.coat,
    m.coat,
    m.coat,
    m.coat,
    mat("#ffffff", { map: badgeTex }),
    m.coat,
  ]);
  badge.position.set(0, 0.46, 0.66);
  badge.rotation.x = -0.12;
  spine.add(badge);

  // Braços (ombro → cotovelo → mão).
  const arm = (side: 1 | -1) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.5, 0.92, 0);
    const upper = mesh(new THREE.CapsuleGeometry(0.15, 0.32, 6, 14), m.coat);
    upper.position.y = -0.28;
    const elbow = new THREE.Group();
    elbow.position.y = -0.55;
    const fore = mesh(new THREE.CapsuleGeometry(0.135, 0.26, 6, 14), m.coat);
    fore.position.y = -0.24;
    const cuff = mesh(new THREE.TorusGeometry(0.12, 0.035, 8, 20), m.shirt);
    cuff.rotation.x = Math.PI / 2;
    cuff.position.y = -0.44;
    const hand = mesh(new THREE.SphereGeometry(0.15, 18, 14), m.skin);
    hand.position.y = -0.56;
    hand.scale.set(1, 1.1, 0.85);
    elbow.add(fore, cuff, hand);
    shoulder.add(upper, elbow);
    spine.add(shoulder);
    return { shoulder, elbow, hand };
  };
  const left = arm(1);
  const right = arm(-1);

  // Tablet com a pirâmide alimentar, na mão esquerda.
  const screenTex = canvasTexture(192, 256, (g) => {
    const bg = g.createLinearGradient(0, 0, 0, 256);
    bg.addColorStop(0, "#e6f4fb");
    bg.addColorStop(1, "#bfe0ee");
    g.fillStyle = bg;
    g.fillRect(0, 0, 192, 256);
    const layers = ["#f5c542", "#e0685a", "#f08a2b", "#5db54e"];
    layers.forEach((color, i) => {
      const top = 48 + i * 40;
      const half = 16 + i * 18;
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(96 - half, top + 36);
      g.lineTo(96 + half, top + 36);
      g.lineTo(96 + half - 18, top);
      g.lineTo(96 - half + 18, top);
      g.closePath();
      g.fill();
    });
    g.fillStyle = "#342d24";
    g.font = "bold 20px sans-serif";
    g.textAlign = "center";
    g.fillText("NutriConnect", 96, 32);
  });
  textures.push(screenTex);
  const tablet = new THREE.Group();
  const frame = mesh(new THREE.BoxGeometry(0.62, 0.8, 0.05), m.tablet);
  const screen = mesh(
    new THREE.PlaneGeometry(0.54, 0.7),
    new THREE.MeshStandardMaterial({
      map: screenTex,
      roughness: 0.3,
      emissive: "#ffffff",
      emissiveMap: screenTex,
      emissiveIntensity: 0.35,
    }),
  );
  screen.position.z = 0.027;
  // A mão segura a borda de baixo; a tela fica virada para quem está olhando.
  frame.position.y = 0.3;
  screen.position.y = 0.3;
  tablet.add(frame, screen);
  tablet.position.set(0, -0.05, 0.1);
  tablet.rotation.set(1.7, -0.35, 0);
  left.hand.add(tablet);

  // Cabeça.
  const head = new THREE.Group();
  head.position.y = 1.22;
  spine.add(head);
  const face = new THREE.Group();
  face.position.y = 0.95;
  head.add(face);
  const skull = mesh(new THREE.SphereGeometry(1, 48, 36), m.skin);
  skull.scale.set(1.04, 0.98, 1);
  face.add(skull);
  [-1, 1].forEach((side) => {
    const ear = mesh(new THREE.SphereGeometry(0.17, 16, 12), m.skin);
    ear.position.set(side * 1.0, -0.08, -0.05);
    ear.scale.set(0.6, 1, 0.8);
    face.add(ear);
  });

  // Olhos (ovais com brilho), olhos felizes (^ ^), cílios e sobrancelhas.
  const eyes: THREE.Group[] = [];
  const eyeOvals: THREE.Object3D[] = [];
  const happyEyes: THREE.Object3D[] = [];
  const brows: THREE.Object3D[] = [];
  [-1, 1].forEach((side) => {
    const eye = onHead(new THREE.Group(), side * 0.34, -0.02) as THREE.Group;
    const oval = new THREE.Group();
    const iris = mesh(new THREE.SphereGeometry(0.15, 24, 18), m.ink);
    iris.scale.set(0.85, 1.2, 0.4);
    const shine1 = mesh(new THREE.SphereGeometry(0.05, 12, 10), m.white);
    shine1.position.set(side * -0.035 + 0.02, 0.07, 0.06);
    const shine2 = mesh(new THREE.SphereGeometry(0.024, 10, 8), m.white);
    shine2.position.set(-0.03, -0.06, 0.06);
    const lash = mesh(new THREE.BoxGeometry(0.1, 0.028, 0.02), m.ink);
    lash.position.set(side * 0.13, 0.14, 0.02);
    lash.rotation.z = side * 0.55;
    oval.add(iris, shine1, shine2, lash);
    const happy = mesh(new THREE.TorusGeometry(0.1, 0.026, 8, 18, Math.PI), m.ink);
    happy.visible = false;
    eye.add(oval, happy);
    face.add(eye);
    eyes.push(eye);
    eyeOvals.push(oval);
    happyEyes.push(happy);

    const brow = onHead(new THREE.Group(), side * 0.34, 0.3, 1, 0.01);
    const browBar = mesh(new THREE.CapsuleGeometry(0.026, 0.16, 4, 8), m.hairDark);
    browBar.rotation.z = Math.PI / 2;
    brow.add(browBar);
    brow.userData.side = side;
    face.add(brow);
    brows.push(brow);

    // Bochechas rosadas e sardas.
    const blush = onHead(
      mesh(new THREE.CircleGeometry(0.14, 24), m.blush),
      side * 0.56,
      -0.22,
      1,
      0.012,
    );
    face.add(blush);
    [
      [0.47, -0.12],
      [0.55, -0.1],
      [0.51, -0.05],
    ].forEach(([fx, fy]) => {
      face.add(
        onHead(mesh(new THREE.CircleGeometry(0.014, 8), m.skinShade), side * fx, fy, 1, 0.014),
      );
    });
  });
  const nose = onHead(
    mesh(new THREE.SphereGeometry(0.05, 12, 10), m.skinShade),
    0,
    -0.15,
    1,
    -0.01,
  );
  nose.scale.set(1.2, 0.9, 0.8);
  face.add(nose);

  // Boca: sorriso (arco) e boca aberta (fala e alegria).
  const mouthAnchor = onHead(new THREE.Group(), 0, -0.36);
  const smile = mesh(new THREE.TorusGeometry(0.12, 0.026, 8, 22, Math.PI), m.mouth);
  smile.rotation.z = Math.PI;
  const mouthOpen = new THREE.Group();
  const lips = mesh(new THREE.SphereGeometry(0.11, 20, 14), m.mouth);
  lips.scale.set(1.25, 1, 0.4);
  const tongue = mesh(new THREE.SphereGeometry(0.07, 14, 10), m.tongue);
  tongue.position.set(0, -0.05, 0.02);
  tongue.scale.set(1.2, 0.6, 0.5);
  mouthOpen.add(lips, tongue);
  mouthOpen.scale.y = 0.01;
  mouthAnchor.add(smile, mouthOpen);
  face.add(mouthAnchor);

  // Cabelo: volume atrás, franja e duas tranças com prendedor.
  const back = mesh(new THREE.SphereGeometry(1.1, 40, 30), m.hair);
  back.scale.set(1.02, 1.04, 1.0);
  back.position.set(0, 0.1, -0.26);
  face.add(back);
  // Franja jogada de lado: mechas que caem por cima da testa.
  [
    [-0.62, 0.48, 0.3, 0.75],
    [-0.4, 0.6, 0.33, 0.45],
    [-0.13, 0.65, 0.35, 0.2],
    [0.14, 0.63, 0.34, -0.1],
    [0.4, 0.55, 0.32, -0.38],
    [0.63, 0.4, 0.28, -0.65],
  ].forEach(([x, y, r, rot]) => {
    const lobe = onHead(mesh(new THREE.SphereGeometry(r, 20, 14), m.hair), x, y, 1, 0);
    lobe.scale.set(1.15, 0.72, 0.5);
    lobe.rotateZ(rot);
    face.add(lobe);
  });
  const braids: THREE.Group[][] = [];
  [-1, 1].forEach((side) => {
    const chain: THREE.Group[] = [];
    let parent: THREE.Object3D = face;
    const base = new THREE.Group();
    base.position.set(side * 0.9, -0.3, -0.25);
    face.add(base);
    parent = base;
    [0.2, 0.19, 0.17, 0.15, 0.13].forEach((r, i) => {
      const seg = new THREE.Group();
      seg.position.y = i === 0 ? 0 : -0.24;
      const bead = mesh(new THREE.SphereGeometry(r, 16, 12), i % 2 ? m.hairDark : m.hair);
      bead.scale.set(1, 0.85, 1);
      seg.add(bead);
      parent.add(seg);
      chain.push(seg);
      parent = seg;
    });
    const tie = mesh(new THREE.TorusGeometry(0.1, 0.045, 8, 16), m.tie);
    tie.rotation.x = Math.PI / 2;
    tie.position.y = -0.16;
    const tuft = mesh(new THREE.ConeGeometry(0.13, 0.28, 12), m.hair);
    tuft.rotation.x = Math.PI;
    tuft.position.y = -0.32;
    parent.add(tie, tuft);
    braids.push(chain);
  });
  // Presilha de folha (a marca da nutricionista).
  const clip = onHead(new THREE.Group(), 0.6, 0.66, 1, 0.12);
  [
    [0, 0.5, COLORS.leaf],
    [0.09, -0.5, COLORS.leafDark],
  ].forEach(([dx, rot]) => {
    const leaf = mesh(new THREE.SphereGeometry(0.13, 16, 10), rot === 0.5 ? m.leaf : m.leafDark);
    leaf.scale.set(0.5, 1.1, 0.25);
    leaf.position.x = dx as number;
    leaf.rotation.z = rot as number;
    clip.add(leaf);
  });
  face.add(clip);

  return {
    root,
    mover,
    squash,
    spine,
    head,
    lShoulder: left.shoulder,
    rShoulder: right.shoulder,
    lElbow: left.elbow,
    rElbow: right.elbow,
    lLeg: legs[1],
    rLeg: legs[0],
    eyes,
    eyeOvals,
    happyEyes,
    brows,
    smile,
    mouthOpen,
    braids,
    shadow,
    textures,
  };
}

// ───────────────────────── Palco compartilhado ─────────────────────────
//
// Um único WebGLRenderer (fora da página) desenha todas as Ninas visíveis e copia cada imagem para
// o canvas 2D da respectiva Nina. Assim a página pode ter quantas Ninas quiser sem esbarrar no limite
// de contextos WebGL do navegador, e criar uma Nina nova (a cada resposta numa lição, por exemplo)
// é instantâneo.

const FRAMES: Record<NinaFraming, { center: number; height: number; width: number }> = {
  full: { center: 2.45, height: 5.7, width: 3.6 },
  bust: { center: 3.1, height: 2.7, width: 2.7 },
};

const MAX_BUFFER = 2048;
const BLEND = 0.35;

interface Instance {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  visible: boolean;
  /** Tamanho em pixels reais (CSS × densidade da tela). */
  pw: number;
  ph: number;
  look: { x: number; y: number; tx: number; ty: number };
  update(now: number, dt: number): void;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  fit(): void;
}

interface Engine {
  renderer: THREE.WebGLRenderer;
  instances: Set<Instance>;
  byElement: Map<Element, Instance>;
  io: IntersectionObserver;
  ro: ResizeObserver;
  raf: number;
  last: number;
  bufferW: number;
  bufferH: number;
}

let engine: Engine | null = null;

function pixelRatio() {
  return Math.min(window.devicePixelRatio || 1, 2);
}

function getEngine(): Engine {
  if (engine) return engine;
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.setScissorTest(true);

  const byElement = new Map<Element, Instance>();
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const inst = byElement.get(entry.target);
      if (inst) inst.visible = entry.isIntersecting;
    }
    wake();
  });
  const ro = new ResizeObserver((entries) => {
    for (const entry of entries) byElement.get(entry.target)?.fit();
  });

  window.addEventListener(
    "pointermove",
    (e) => {
      if (!engine) return;
      for (const inst of engine.instances) {
        if (!inst.visible) continue;
        const r = inst.container.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height * 0.3;
        inst.look.tx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth * 0.5)));
        inst.look.ty = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight * 0.5)));
      }
    },
    { passive: true },
  );
  document.addEventListener("visibilitychange", wake);

  engine = {
    renderer,
    instances: new Set(),
    byElement,
    io,
    ro,
    raf: 0,
    last: 0,
    bufferW: 0,
    bufferH: 0,
  };
  return engine;
}

function wake() {
  const e = engine;
  if (!e || e.raf || document.hidden || e.instances.size === 0) return;
  e.last = performance.now();
  e.raf = requestAnimationFrame(loop);
}

function draw(e: Engine, inst: Instance) {
  const { pw, ph } = inst;
  if (!pw || !ph) return;
  if (pw > e.bufferW || ph > e.bufferH) {
    e.bufferW = Math.min(MAX_BUFFER, Math.max(e.bufferW, pw));
    e.bufferH = Math.min(MAX_BUFFER, Math.max(e.bufferH, ph));
    e.renderer.setSize(e.bufferW, e.bufferH, false);
  }
  const w = Math.min(pw, e.bufferW);
  const h = Math.min(ph, e.bufferH);
  e.renderer.setViewport(0, 0, w, h);
  e.renderer.setScissor(0, 0, w, h);
  e.renderer.render(inst.scene, inst.camera);
  // O WebGL desenha a partir do canto inferior esquerdo do buffer.
  const gl = e.renderer.domElement;
  inst.ctx.clearRect(0, 0, pw, ph);
  inst.ctx.drawImage(gl, 0, gl.height - h, w, h, 0, 0, pw, ph);
}

function loop(now: number) {
  const e = engine;
  if (!e) return;
  e.raf = 0;
  if (document.hidden || e.instances.size === 0) return;
  const dt = Math.min(0.05, (now - e.last) / 1000);
  e.last = now;
  for (const inst of e.instances) {
    if (!inst.visible) continue;
    inst.update(now, dt);
    draw(e, inst);
  }
  e.raf = requestAnimationFrame(loop);
}

export function createNina(
  container: HTMLElement,
  options: { action?: NinaAction; framing?: NinaFraming; entrance?: boolean } = {},
): NinaController {
  const e = getEngine();

  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
  canvas.setAttribute("aria-hidden", "true");
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight("#fff4e6", "#9a7a60", 1.9));
  const key = new THREE.DirectionalLight("#ffffff", 2.1);
  key.position.set(3, 6, 6);
  const rim = new THREE.DirectionalLight("#ffd9bf", 1.4);
  rim.position.set(-5, 3, -4);
  const fill = new THREE.DirectionalLight("#e8f0ff", 0.6);
  fill.position.set(-4, 1, 5);
  scene.add(key, rim, fill);

  const rig = buildNina();
  scene.add(rig.root);

  let framing: NinaFraming = options.framing ?? "full";
  const entrance = options.entrance !== false;

  const reduced =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.motion === "reduce";

  // Estado das ações e da mistura entre elas.
  const clock0 = performance.now();
  let action: NinaAction = options.action ?? "idle";
  let prev: NinaAction = action;
  let actionStart = 0;
  let prevStart = 0;
  let blendStart = -10;

  // Piscadas em intervalos irregulares.
  let nextBlink = 1 + Math.random() * 2;
  let blinkStart = -1;

  // Tranças: molas simples que seguem o movimento do corpo com atraso.
  const braidState = rig.braids.map(() => ({ a: 0, v: 0, ax: 0, vx: 0 }));
  let lastY = 0;
  let lastRot = 0;

  const inst: Instance = {
    container,
    canvas,
    ctx,
    visible: true,
    pw: 0,
    ph: 0,
    look: { x: 0, y: 0, tx: 0, ty: 0 },
    scene,
    camera,
    fit() {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      const dpr = pixelRatio();
      inst.pw = Math.round(w * dpr);
      inst.ph = Math.round(h * dpr);
      canvas.width = inst.pw;
      canvas.height = inst.ph;
      camera.aspect = w / h;
      const f = FRAMES[framing];
      const half = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const dist = Math.max(f.height / 2 / half, f.width / 2 / (half * camera.aspect));
      camera.position.set(0, f.center + 0.15, dist);
      camera.lookAt(0, f.center, 0);
      camera.updateProjectionMatrix();
    },
    update(now, dt) {
      const t = (now - clock0) / 1000;
      const look = inst.look;
      const amp = reduced ? 0.35 : 1;
      const cur = poseFor(action, t, t - actionStart);
      let pose = cur;
      const w = clamp01((t - blendStart) / BLEND);
      if (w < 1) {
        const old = poseFor(prev, t, t - prevStart);
        const k = ease(w);
        pose = { ...cur };
        for (const key of KEYS) pose[key] = old[key] + (cur[key] - old[key]) * k;
      }

      // Entrada: surge com um pulinho elástico.
      const pop = !entrance || t >= 0.9 ? 1 : 1 - Math.pow(2, -9 * t) * Math.cos(t * 11);

      look.x += (look.tx - look.x) * Math.min(1, dt * 5);
      look.y += (look.ty - look.y) * Math.min(1, dt * 5);

      rig.mover.position.y = pose.y * amp;
      rig.mover.rotation.y = pose.rotY;
      rig.mover.scale.setScalar(Math.max(0.001, pop));
      rig.squash.scale.set(1 / Math.sqrt(pose.squash), pose.squash, 1 / Math.sqrt(pose.squash));
      rig.spine.rotation.set(pose.lean, 0, pose.tilt);
      rig.head.rotation.set(
        pose.headX + look.y * 0.18 - pose.lookUp * 0.1,
        pose.headY + look.x * 0.4,
        pose.headZ,
      );
      rig.lShoulder.rotation.set(pose.lShX, 0, pose.lShZ);
      rig.rShoulder.rotation.set(pose.rShX, 0, pose.rShZ);
      rig.lElbow.rotation.x = pose.lEl;
      rig.rElbow.rotation.x = pose.rEl;
      rig.lLeg.rotation.x = pose.lLeg;
      rig.rLeg.rotation.x = pose.rLeg;

      const shadowScale = 1 - Math.min(0.5, pose.y * 0.35);
      rig.shadow.scale.set(shadowScale, shadowScale, 1);
      (rig.shadow.material as THREE.MeshBasicMaterial).opacity = shadowScale;

      // Piscar.
      if (t > nextBlink) {
        blinkStart = t;
        nextBlink = t + 2.2 + Math.random() * 3;
      }
      const bp = blinkStart < 0 ? 1 : (t - blinkStart) / 0.16;
      const blink = bp < 1 ? Math.sin(Math.PI * bp) : 0;
      const happy = pose.squint > 0.5;
      rig.eyeOvals.forEach((oval, i) => {
        oval.visible = !happy;
        oval.scale.y = Math.max(0.08, 1 - blink);
        oval.position.set(look.x * 0.035, -look.y * 0.02 + pose.lookUp * 0.05, 0);
        rig.happyEyes[i].visible = happy;
      });
      rig.brows.forEach((brow) => {
        const side = brow.userData.side as number;
        brow.children[0].position.y = pose.brow * 0.05;
        // Tristeza levanta a ponta de dentro da sobrancelha; surpresa só sobe as duas.
        const sad = pose.brow < 0 ? -pose.brow * 0.45 : 0;
        brow.children[0].rotation.set(0, 0, Math.PI / 2 - side * sad);
      });

      // Boca.
      const open = clamp01(pose.mouth);
      rig.mouthOpen.scale.set(0.8 + open * 0.3, Math.max(0.01, open * 1.1), 1);
      rig.mouthOpen.visible = open > 0.04;
      rig.smile.visible = open < 0.35;
      rig.smile.rotation.z = pose.smile >= 0 ? Math.PI : 0;
      rig.smile.position.y = pose.smile >= 0 ? 0.02 : -0.06;
      rig.smile.scale.set(0.7 + Math.abs(pose.smile) * 0.4, 0.4 + Math.abs(pose.smile) * 0.6, 1);

      // Tranças balançando.
      const yVel = (pose.y - lastY) / Math.max(dt, 1e-3);
      const rotVel = (pose.rotY - lastRot) / Math.max(dt, 1e-3);
      lastY = pose.y;
      lastRot = pose.rotY;
      rig.braids.forEach((chain, i) => {
        const s = braidState[i];
        const side = i === 0 ? -1 : 1;
        const target =
          -pose.tilt * 1.6 -
          pose.headZ * 1.3 +
          Math.sin(t * 1.4 + i) * 0.04 +
          side * Math.min(0.5, Math.abs(rotVel) * 0.08);
        s.v += ((target - s.a) * 60 - s.v * 7) * dt;
        s.a += s.v * dt;
        const targetX = Math.max(-0.8, Math.min(0.8, yVel * 0.12));
        s.vx += ((targetX - s.ax) * 50 - s.vx * 6) * dt;
        s.ax += s.vx * dt;
        chain.forEach((seg, j) => {
          if (j === 0) return;
          seg.rotation.z = s.a * (0.4 + j * 0.15);
          seg.rotation.x = s.ax * (0.3 + j * 0.12);
        });
      });
    },
  };

  inst.fit();
  e.instances.add(inst);
  e.byElement.set(container, inst);
  e.io.observe(container);
  e.ro.observe(container);
  // Primeiro quadro já na criação: a Nina aparece sem esperar o próximo ciclo.
  inst.update(performance.now(), 0);
  draw(e, inst);
  wake();

  return {
    setAction(next) {
      if (next === action && !ONE_SHOT[next]) return;
      const t = (performance.now() - clock0) / 1000;
      prev = action;
      prevStart = actionStart;
      action = next;
      actionStart = t;
      blendStart = t;
    },
    setFraming(next) {
      framing = next;
      inst.fit();
    },
    dispose() {
      e.instances.delete(inst);
      e.byElement.delete(container);
      e.io.unobserve(container);
      e.ro.unobserve(container);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((mt) => mt.dispose());
        }
      });
      rig.textures.forEach((tx) => tx.dispose());
      canvas.remove();
    },
  };
}

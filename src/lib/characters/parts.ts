// Peças compartilhadas dos personagens 3D: materiais, texturas geradas no navegador, olhos com íris e
// pálpebras, boca que muda de forma, sobrancelhas, mãos, pernas e sombra. Nada vem de arquivo: tudo é
// montado com formas do three.js, então carrega rápido e fica nítido em qualquer tamanho.

import * as THREE from "three";

export type Framing = "full" | "bust";

export interface Frame {
  center: number;
  height: number;
  width: number;
}

export interface EyeRig {
  side: -1 | 1;
  /** Globo ocular: gira para olhar. */
  ball: THREE.Object3D;
  upper: THREE.Object3D;
  /** Globo, íris e reflexos (some quando o olho vira "^ ^"). */
  open: THREE.Object3D;
  /** Olho fechado de alegria: um arquinho "^". */
  happy: THREE.Object3D;
  /** Ângulos (rotação x) da pálpebra de cima aberta (escondida) e fechada (piscando). */
  upperOpen: number;
  upperClosed: number;
  /** Olho de desenho: olha deslizando o oval (em vez de girar o globo) e pisca achatando. */
  cartoon?: { shift: number };
}

export interface MouthRig {
  /** `open` 0–1; `smile` -1 (triste) a 1 (sorrisão). */
  update(open: number, smile: number): void;
}

/** Corrente de peças que balança com o movimento (tranças, folhas, buquês). */
export interface Spring {
  chain: THREE.Object3D[];
  /** A primeira peça também gira (folha solta) ou fica presa (base da trança). */
  first: boolean;
  amount: number;
  /** Ângulos de repouso de cada peça (somados ao balanço). */
  rest?: { x: number; z: number }[];
}

export interface Rig {
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
  eyes: EyeRig[];
  brows: THREE.Object3D[];
  mouth: MouthRig;
  /** Bochechas que sobem com o sorriso. */
  cheeks: THREE.Object3D[];
  springs: Spring[];
  shadow: THREE.Mesh;
  textures: THREE.Texture[];
  /** O braço esquerdo segura algo na altura do peito (o tablet da Nina). */
  holding: boolean;
  /** Quanto da rotação da cabeça usar (personagens de corpo único giram o corpo todo, menos). */
  headAmount: number;
  /** Iluminação da primeira Nina 3D (sem luz de ambiente nem curva de tons). */
  classic?: boolean;
  frames: Record<Framing, Frame>;
}

/** Mistura duas cores #rrggbb direto nos valores RGB (como num editor de imagem). */
export function mixHex(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = [16, 8, 0].map((sh) => {
    const ca = (pa >> sh) & 255;
    const cb = (pb >> sh) & 255;
    return Math.round(ca + (cb - ca) * t)
      .toString(16)
      .padStart(2, "0");
  });
  return "#" + ch.join("");
}

/** Clareia (k > 0) ou escurece (k < 0) uma cor. */
export const shade = (hex: string, k: number) =>
  mixHex(hex, k < 0 ? "#000000" : "#ffffff", Math.abs(k));

// ───────────────────────── Texturas ─────────────────────────

/** Guarda as texturas criadas para liberar a memória quando o personagem sai da tela. */
export class Kit {
  textures: THREE.Texture[] = [];

  canvas(width: number, height: number, draw: (g: CanvasRenderingContext2D) => void, color = true) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    draw(canvas.getContext("2d")!);
    const tex = new THREE.CanvasTexture(canvas);
    if (color) tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    this.textures.push(tex);
    return tex;
  }

  /** Ruído suave (tons de cinza), para relevo de pele, tecido e casca. */
  noise(
    size: number,
    opts: { scale?: number; octaves?: number; seed?: number; stretchX?: number; stretchY?: number },
  ) {
    const { scale = 8, octaves = 4, seed = 7, stretchX = 1, stretchY = 1 } = opts;
    return this.canvas(
      size,
      size,
      (g) => {
        const img = g.createImageData(size, size);
        const layers = Array.from({ length: octaves }, (_, o) => {
          const cells = Math.max(2, Math.round(scale * 2 ** o));
          return { cells, grid: grid(cells, seed + o * 31) };
        });
        for (let py = 0; py < size; py++) {
          for (let px = 0; px < size; px++) {
            let v = 0;
            let amp = 1;
            let total = 0;
            for (const { cells, grid: gr } of layers) {
              v +=
                sample(
                  gr,
                  cells,
                  ((px / size) * cells) / stretchX,
                  ((py / size) * cells) / stretchY,
                ) * amp;
              total += amp;
              amp *= 0.5;
            }
            const c = Math.round((v / total) * 255);
            const i = (py * size + px) * 4;
            img.data[i] = img.data[i + 1] = img.data[i + 2] = c;
            img.data[i + 3] = 255;
          }
        }
        g.putImageData(img, 0, 0);
      },
      false,
    );
  }

  /** Mancha redonda e suave (sombra no chão, bochechas). */
  blob(rgb: string, alpha: number) {
    return this.canvas(128, 128, (g) => {
      const grd = g.createRadialGradient(64, 64, 2, 64, 64, 64);
      grd.addColorStop(0, `rgba(${rgb},${alpha})`);
      grd.addColorStop(0.55, `rgba(${rgb},${alpha * 0.55})`);
      grd.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = grd;
      g.fillRect(0, 0, 128, 128);
    });
  }
}

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
}

function grid(cells: number, seed: number) {
  const r = rng(seed);
  return Array.from({ length: cells * cells }, () => r());
}

/** Ruído de valor com interpolação suave; repete nas bordas (a textura emenda sem costura). */
function sample(gr: number[], cells: number, x: number, y: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const at = (i: number, j: number) =>
    gr[(((j % cells) + cells) % cells) * cells + (((i % cells) + cells) % cells)];
  const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * sx;
  const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * sx;
  return a + (b - a) * sy;
}

// ───────────────────────── Materiais ─────────────────────────

/** Pele: brilho aveludado quente nas bordas (imita a luz atravessando a pele). */
export function skinMat(color: string, extra: THREE.MeshPhysicalMaterialParameters = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.5,
    sheen: 0.7,
    sheenRoughness: 0.45,
    sheenColor: new THREE.Color("#ff9f86"),
    clearcoat: 0.08,
    clearcoatRoughness: 0.55,
    ...extra,
  });
}

/** Tecido: fosco, com o brilho macio das fibras e uma trama leve. */
export function clothMat(
  color: string,
  bump?: THREE.Texture,
  extra: THREE.MeshPhysicalMaterialParameters = {},
) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.86,
    sheen: 1,
    sheenRoughness: 0.4,
    sheenColor: new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.45),
    bumpMap: bump ?? null,
    bumpScale: 0.6,
    ...extra,
  });
}

/** Superfície lisa e brilhante (casca de maçã, caroço, olhos). */
export function glossyMat(color: string, extra: THREE.MeshPhysicalMaterialParameters = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.35,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    ...extra,
  });
}

export function plainMat(color: string, extra: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0, ...extra });
}

// ───────────────────────── Formas ─────────────────────────

/** Cápsula afinada: raio `r1` em cima e `r2` embaixo, comprimento `len` entre os centros. */
export function taperedCapsule(r1: number, r2: number, len: number, radial = 20) {
  const pts: THREE.Vector2[] = [];
  const cap = 8;
  for (let i = 0; i <= cap; i++) {
    const a = -Math.PI / 2 + (i / cap) * (Math.PI / 2);
    pts.push(new THREE.Vector2(Math.cos(a) * r2, -len / 2 + Math.sin(a) * r2));
  }
  for (let i = 0; i <= cap; i++) {
    const a = (i / cap) * (Math.PI / 2);
    pts.push(new THREE.Vector2(Math.cos(a) * r1, len / 2 + Math.sin(a) * r1));
  }
  pts[0].x = 0.0001;
  pts[pts.length - 1].x = 0.0001;
  return new THREE.LatheGeometry(pts, radial);
}

/** Torno a partir de um perfil (raio, altura), de baixo para cima, com o eixo fechado nas pontas. */
export function lathe(profile: [number, number][], radial = 48, smooth = 3) {
  const raw = profile.map(([r, y]) => new THREE.Vector2(Math.max(0.0001, r), y));
  const curve = new THREE.SplineCurve(raw);
  const pts = curve.getPoints(Math.max(raw.length * smooth, 16));
  return new THREE.LatheGeometry(pts, radial);
}

// ───────────────────────── Superfície ─────────────────────────

const ray = new THREE.Raycaster();
const Z = new THREE.Vector3(0, 0, 1);
const UP = new THREE.Vector3(0, 1, 0);

/**
 * Ponto da superfície de `target` na direção (x, y, frente) a partir do centro dele, no espaço do pai.
 * Serve para encaixar olhos, boca e enfeites em qualquer formato (cabeça, abacate, maçã...).
 */
export function surface(target: THREE.Mesh, x: number, y: number, center?: THREE.Vector3) {
  const parent = target.parent!;
  parent.updateWorldMatrix(true, true);
  const c = (center ?? target.position).clone();
  const dir = new THREE.Vector3(x, y, Math.sqrt(Math.max(0.0001, 1 - x * x - y * y))).normalize();
  const originW = parent.localToWorld(c.clone().addScaledVector(dir, 20));
  const centerW = parent.localToWorld(c.clone());
  ray.set(originW, centerW.sub(originW).normalize());
  const hit = ray.intersectObject(target, false)[0];
  if (!hit) return { position: c.addScaledVector(dir, 1), normal: dir };
  const inv = parent.matrixWorld.clone().invert();
  const normal = (hit.normal ?? hit.face!.normal)
    .clone()
    .transformDirection(target.matrixWorld)
    .transformDirection(inv);
  return { position: parent.worldToLocal(hit.point.clone()), normal };
}

/**
 * Encaixa `obj` na superfície de `target` (no mesmo pai), virado para fora.
 * `forward` puxa a orientação para a frente (olhos de lado continuam olhando para a frente).
 */
export function place<T extends THREE.Object3D>(
  obj: T,
  target: THREE.Mesh,
  x: number,
  y: number,
  opts: { lift?: number; forward?: number; center?: THREE.Vector3; sink?: number } = {},
) {
  const { lift = 0, forward = 0, center, sink = 0 } = opts;
  const { position, normal } = surface(target, x, y, center);
  const z = normal.clone().lerp(Z, forward).normalize();
  const xAxis = UP.clone().cross(z).normalize();
  const yAxis = z.clone().cross(xAxis);
  obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xAxis, yAxis, z));
  obj.position.copy(position).addScaledVector(normal, lift - sink);
  target.parent!.add(obj);
  return obj;
}

/**
 * Encaixa `obj` na frente de `target`, no ponto (x, y) visto de frente (raio paralelo ao eixo z).
 * Bom para rostos em corpos achatados ou irregulares (abacate, brócolis).
 */
export function placeFront<T extends THREE.Object3D>(
  obj: T,
  target: THREE.Mesh,
  x: number,
  y: number,
  opts: { lift?: number; forward?: number; sink?: number } = {},
) {
  const { lift = 0, forward = 0.5, sink = 0 } = opts;
  const parent = target.parent!;
  parent.updateWorldMatrix(true, true);
  const originW = parent.localToWorld(new THREE.Vector3(x, y, 20));
  const dirW = new THREE.Vector3(0, 0, -1).transformDirection(parent.matrixWorld);
  ray.set(originW, dirW);
  const hit = ray.intersectObject(target, false)[0];
  const position = hit ? parent.worldToLocal(hit.point.clone()) : new THREE.Vector3(x, y, 0);
  const normal = hit
    ? (hit.normal ?? hit.face!.normal)
        .clone()
        .transformDirection(target.matrixWorld)
        .transformDirection(parent.matrixWorld.clone().invert())
    : Z.clone();
  const z = normal.clone().lerp(Z, forward).normalize();
  const xAxis = UP.clone().cross(z).normalize();
  const yAxis = z.clone().cross(xAxis);
  obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xAxis, yAxis, z));
  obj.position.copy(position).addScaledVector(normal, lift - sink);
  parent.add(obj);
  return obj;
}

// ───────────────────────── Rosto ─────────────────────────

/** Textura da íris: a altura vira o raio (topo = centro da pupila), a largura dá a volta. */
function irisTexture(kit: Kit, color: string, dark: string, pupil = 0.4) {
  return kit.canvas(256, 128, (g) => {
    const h = 128;
    const base = new THREE.Color(color);
    const deep = new THREE.Color(dark);
    for (let y = 0; y < h; y++) {
      const f = y / h;
      let c: THREE.Color;
      if (f < pupil) c = new THREE.Color("#0b0705");
      else if (f > 0.88) c = deep.clone().lerp(new THREE.Color("#120c08"), 0.55);
      else {
        const k = (f - pupil) / (0.88 - pupil);
        // Mais claro perto da pupila, mais escuro na borda.
        c = base
          .clone()
          .lerp(new THREE.Color("#ffffff"), Math.max(0, 0.22 - k * 0.5))
          .lerp(deep, k * 0.75);
      }
      g.fillStyle = `#${c.getHexString()}`;
      g.fillRect(0, y, 256, 1);
    }
    // Fibras da íris.
    const r = rng(11);
    for (let i = 0; i < 160; i++) {
      const x = r() * 256;
      g.strokeStyle = r() > 0.5 ? "rgba(255,240,215,0.22)" : "rgba(10,6,4,0.25)";
      g.lineWidth = 0.6 + r() * 1.4;
      g.beginPath();
      g.moveTo(x, h * pupil);
      g.lineTo(x + (r() - 0.5) * 6, h * (0.6 + r() * 0.3));
      g.stroke();
    }
  });
}

export interface EyeOptions {
  radius: number;
  iris: string;
  irisDark: string;
  /** Tamanho da íris (ângulo em radianos a partir da frente do globo). */
  irisSize?: number;
  pupil?: number;
  /** Cor da pálpebra (aparece só ao piscar). */
  lid: THREE.Material;
  /** Cor do arquinho "^" e dos cílios. */
  ink: THREE.Material;
  /** Delineado escuro na borda de cima, com pontinhas nos cantos (estilo da Nina desenhada). */
  liner?: boolean;
  side: -1 | 1;
}

/**
 * Olho fofo: globo com íris grande, pupila e dois reflexos de luz; pálpebra que só aparece ao piscar;
 * e, na alegria, o arquinho "^".
 */
export function buildEye(kit: Kit, o: EyeOptions) {
  const r = o.radius;
  const socket = new THREE.Group();
  const open = new THREE.Group();
  const ball = new THREE.Group();
  open.add(ball);
  socket.add(open);

  const sclera = new THREE.Mesh(
    new THREE.SphereGeometry(r, 32, 24),
    glossyMat("#fbf8f4", { roughness: 0.3, clearcoatRoughness: 0.04 }),
  );
  const irisSize = o.irisSize ?? 0.78;
  const iris = new THREE.Mesh(
    new THREE.SphereGeometry(r * 1.004, 48, 14, 0, Math.PI * 2, 0, irisSize),
    new THREE.MeshPhysicalMaterial({
      map: irisTexture(kit, o.iris, o.irisDark, o.pupil ?? 0.42),
      roughness: 0.45,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
    }),
  );
  iris.rotation.x = Math.PI / 2;
  ball.add(sclera, iris);

  // Reflexos de luz: ficam parados enquanto o olho gira (como num olho de verdade).
  const glintMat = new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false });
  const glint = new THREE.Mesh(new THREE.CircleGeometry(r * 0.22, 20), glintMat);
  glint.position.set(-r * 0.3, r * 0.32, r * 1.0);
  const glint2 = new THREE.Mesh(new THREE.CircleGeometry(r * 0.1, 14), glintMat);
  glint2.position.set(r * 0.26, -r * 0.24, r * 1.0);
  open.add(glint, glint2);

  if (o.liner) {
    // Arco escuro acompanhando a borda de cima do olho, inclinado para trás como a superfície do globo.
    const liner = new THREE.Mesh(
      new THREE.TorusGeometry(r * 0.93, r * 0.085, 8, 32, Math.PI * 0.94),
      o.ink,
    );
    liner.position.set(0, r * 0.02, r * 0.38);
    liner.rotation.set(-0.42, 0, Math.PI * 0.03);
    open.add(liner);
    ([-1, 1] as const).forEach((end) => {
      const flick = new THREE.Mesh(new THREE.CapsuleGeometry(r * 0.06, r * 0.2, 4, 8), o.ink);
      flick.position.set(end * r * 1.0, r * 0.12, r * 0.3);
      flick.rotation.z = -end * 0.95;
      open.add(flick);
    });
  }

  // Pálpebra: escondida dentro da cabeça; desce para piscar.
  const upper = new THREE.Group();
  upper.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(r * 1.06, 36, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      o.lid,
    ),
  );
  socket.add(upper);

  // Olho de alegria "^".
  const happy = new THREE.Mesh(new THREE.TorusGeometry(r * 0.62, r * 0.13, 10, 24, Math.PI), o.ink);
  happy.position.set(0, -r * 0.2, r * 0.75);
  happy.visible = false;
  socket.add(happy);

  const rig: EyeRig = {
    side: o.side,
    ball,
    upper,
    open,
    happy,
    upperOpen: -1.15,
    upperClosed: 1.3,
  };
  upper.rotation.x = rig.upperOpen;
  return { socket, rig };
}

/**
 * Olho de desenho, no estilo da primeira Nina 3D: oval escuro com dois brilhos; na alegria, o
 * arquinho "^". Pisca achatando o oval.
 */
export function buildCartoonEye(o: { size: number; ink: THREE.Material; side: -1 | 1 }) {
  const s = o.size;
  const socket = new THREE.Group();
  const open = new THREE.Group();
  const ball = new THREE.Group();
  open.add(ball);
  socket.add(open);
  const oval = new THREE.Mesh(new THREE.SphereGeometry(s, 24, 18), o.ink);
  oval.scale.set(0.85, 1.2, 0.4);
  const white = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    roughness: 0.2,
    emissive: "#ffffff",
    emissiveIntensity: 0.5,
  });
  const shine = new THREE.Mesh(new THREE.SphereGeometry(s * 0.33, 12, 10), white);
  shine.position.set(-o.side * s * 0.23 + s * 0.13, s * 0.47, s * 0.36);
  const shine2 = new THREE.Mesh(new THREE.SphereGeometry(s * 0.16, 10, 8), white);
  shine2.position.set(-s * 0.2, -s * 0.4, s * 0.36);
  ball.add(oval, shine, shine2);
  const happy = new THREE.Mesh(new THREE.TorusGeometry(s * 0.67, s * 0.17, 8, 18, Math.PI), o.ink);
  happy.position.y = -s * 0.15;
  happy.visible = false;
  socket.add(happy);
  const upper = new THREE.Group();
  upper.visible = false;
  socket.add(upper);
  const rig: EyeRig = {
    side: o.side,
    ball,
    upper,
    open,
    happy,
    upperOpen: 0,
    upperClosed: 0,
    cartoon: { shift: s * 0.28 },
  };
  return { socket, rig };
}

/** Sobrancelha em arco, mais grossa perto do nariz. */
export function buildBrow(material: THREE.Material, side: -1 | 1, width: number, thick: number) {
  const group = new THREE.Group();
  const pts = [
    new THREE.Vector3(-side * width * 0.5, -width * 0.06, 0),
    new THREE.Vector3(-side * width * 0.1, width * 0.12, 0.01),
    new THREE.Vector3(side * width * 0.5, width * 0.02, -0.01),
  ];
  const curve = new THREE.CatmullRomCurve3(pts);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, thick, 8, false), material);
  const inner = new THREE.Mesh(new THREE.SphereGeometry(thick * 1.25, 10, 8), material);
  inner.position.copy(pts[0]);
  const outer = new THREE.Mesh(new THREE.SphereGeometry(thick * 0.9, 10, 8), material);
  outer.position.copy(pts[2]);
  const bar = new THREE.Group();
  bar.add(tube, inner, outer);
  group.add(bar);
  group.userData.side = side;
  return group;
}

/**
 * Boca: uma peça só (faixa entre o lábio de cima e o de baixo) com alvos de forma — aberta, sorriso e
 * tristeza — que se misturam continuamente. Fechada, é um risquinho; aberta, vira um "D" com língua.
 * `curve` acompanha a curvatura do rosto.
 */
export function buildMouth(o: {
  width: number;
  height: number;
  color: string;
  curve?: number;
  /** Dentes de cima aparecem quando a boca abre. */
  teeth?: boolean;
}) {
  const w = o.width;
  const h = o.height;
  const t = w * 0.075; // espessura do risquinho
  const k = o.curve ?? 0.6;
  const N = 20;
  const count = (N + 1) * 2;
  const shape = (f: (u: number) => [number, number]) => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i <= N; i++) {
      const u = (i / N) * 2 - 1; // -1…1
      const x = (u * w) / 2;
      const [top, bottom] = f(u);
      const z = -x * x * k;
      arr.set([x, top, z], i * 6);
      arr.set([x, bottom, z], i * 6 + 3);
    }
    return arr;
  };
  const zero = () => [0, 0] as [number, number];
  // Pontas finas, meio mais grosso.
  const base = shape((u) => {
    const s = Math.sqrt(Math.max(0, 1 - u * u));
    return [(t / 2) * s, (-t / 2) * s];
  });
  const delta = (f: (u: number) => [number, number]) => {
    const abs = shape(f);
    const zeroed = shape(zero);
    for (let i = 0; i < abs.length; i++) abs[i] -= zeroed[i];
    return new THREE.BufferAttribute(abs, 3);
  };
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(base, 3));
  const index: number[] = [];
  for (let i = 0; i < N; i++) {
    const a = i * 2;
    index.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
  }
  geo.setIndex(index);
  geo.morphTargetsRelative = true;
  const curveUp = w * 0.2;
  const smileDeltaFn = (u: number) => (u * u - 0.35) * curveUp;
  const frownDeltaFn = (u: number) => (0.3 - u * u) * curveUp * 0.8;
  geo.morphAttributes.position = [
    // Aberta: o lábio de baixo desce em arco; o de cima sobe um pouquinho.
    delta((u) => {
      const s = 1 - u * u;
      return [s * h * 0.12, -Math.pow(s, 0.75) * h];
    }),
    // Sorriso: cantos para cima.
    delta((u) => [smileDeltaFn(u), smileDeltaFn(u)]),
    // Tristeza: cantos para baixo.
    delta((u) => [frownDeltaFn(u), frownDeltaFn(u)]),
  ];
  geo.computeVertexNormals();
  const mouth = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color: o.color,
      roughness: 0.55,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    }),
  );
  mouth.morphTargetInfluences = [0, 0, 0];

  const tongue = new THREE.Mesh(
    new THREE.CircleGeometry(1, 24),
    new THREE.MeshStandardMaterial({
      color: "#e2777a",
      roughness: 0.5,
      polygonOffset: true,
      polygonOffsetFactor: -3,
    }),
  );
  tongue.visible = false;
  const group = new THREE.Group();
  group.add(mouth, tongue);

  // Dentes: faixa branca colada no lábio de cima, com a mesma forma (sorriso/tristeza) da boca.
  let teeth: THREE.Mesh | null = null;
  if (o.teeth) {
    const tg = new THREE.BufferGeometry();
    const teethH = h * 0.22;
    tg.setAttribute(
      "position",
      new THREE.BufferAttribute(
        shape(() => [0, 0]),
        3,
      ),
    );
    tg.setIndex(index);
    tg.morphTargetsRelative = true;
    const trim = (u: number) => Math.max(0, 1 - u * u * 1.25);
    tg.morphAttributes.position = [
      delta((u) => {
        const top = (1 - u * u) * h * 0.12 - h * 0.02;
        return [top * trim(u), (top - teethH * Math.sqrt(trim(u))) * trim(u)];
      }),
      delta((u) => [smileDeltaFn(u), smileDeltaFn(u)]),
      delta((u) => [frownDeltaFn(u), frownDeltaFn(u)]),
    ];
    teeth = new THREE.Mesh(
      tg,
      new THREE.MeshStandardMaterial({
        color: "#fbf8f2",
        roughness: 0.35,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -4,
      }),
    );
    teeth.morphTargetInfluences = [0, 0, 0];
    teeth.visible = false;
    group.add(teeth);
  }

  const rig: MouthRig = {
    update(open, smile) {
      const happy = Math.max(0, smile);
      const sad = Math.max(0, -smile);
      const inf = mouth.morphTargetInfluences!;
      inf[0] = open;
      inf[1] = happy;
      inf[2] = sad;
      if (teeth) {
        const ti = teeth.morphTargetInfluences!;
        ti[0] = open;
        ti[1] = happy;
        ti[2] = sad;
        teeth.visible = open > 0.12;
      }
      // A língua acompanha o lábio de baixo, no meio da boca.
      const bottom = -t / 2 - open * h + -0.35 * curveUp * happy + 0.3 * curveUp * 0.8 * sad;
      tongue.visible = open > 0.18;
      tongue.scale.set(w * 0.2, Math.max(0.001, h * open * 0.3), 1);
      tongue.position.set(0, bottom + h * open * 0.28, 0.002);
    },
  };
  return { group, rig };
}

/** Bochecha rosada: mancha suave colada no rosto. */
export function buildBlush(kit: Kit, size: number, rgb = "240,128,110", alpha = 0.55) {
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(size, 24),
    new THREE.MeshBasicMaterial({
      map: kit.blob(rgb, alpha),
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
    }),
  );
  mesh.scale.y = 0.75;
  return mesh;
}

// ───────────────────────── Corpo ─────────────────────────

/** Mão com palma, polegar e (opcional) quatro dedos levemente curvados. */
export function buildHand(material: THREE.Material, side: -1 | 1, size: number, fingers = true) {
  const hand = new THREE.Group();
  const palm = new THREE.Mesh(new THREE.SphereGeometry(size, 20, 16), material);
  palm.scale.set(1, 1.05, 0.62);
  hand.add(palm);
  const thumb = new THREE.Mesh(taperedCapsule(size * 0.3, size * 0.26, size * 0.55, 12), material);
  thumb.position.set(side * size * 0.75, size * 0.05, size * 0.25);
  thumb.rotation.set(0.5, 0, side * 0.9);
  hand.add(thumb);
  if (fingers) {
    for (let i = 0; i < 4; i++) {
      const f = new THREE.Mesh(
        taperedCapsule(size * 0.21, size * 0.18, size * (0.62 - Math.abs(i - 1.3) * 0.08), 10),
        material,
      );
      f.position.set((i - 1.5) * size * 0.42 * side, -size * 0.95, size * 0.05);
      f.rotation.set(0.35 + i * 0.05, 0, (i - 1.5) * 0.08 * side);
      hand.add(f);
    }
  } else {
    palm.scale.set(1, 1.25, 0.7);
  }
  return hand;
}

/** Braço (ombro → cotovelo → mão). O ombro fica em `at`; o braço pende para baixo. */
export function buildArm(o: {
  side: -1 | 1;
  at: THREE.Vector3;
  upper: number;
  fore: number;
  radius: number;
  sleeve: THREE.Material;
  foreMat?: THREE.Material;
  handMat: THREE.Material;
  handSize: number;
  fingers?: boolean;
  cuff?: THREE.Material;
}) {
  const shoulder = new THREE.Group();
  shoulder.position.copy(o.at);
  const upper = new THREE.Mesh(taperedCapsule(o.radius, o.radius * 0.88, o.upper), o.sleeve);
  upper.position.y = -o.upper / 2;
  const elbow = new THREE.Group();
  elbow.position.y = -o.upper;
  const fore = new THREE.Mesh(
    taperedCapsule(o.radius * 0.88, o.radius * 0.72, o.fore),
    o.foreMat ?? o.sleeve,
  );
  fore.position.y = -o.fore / 2;
  elbow.add(fore);
  if (o.cuff) {
    const cuff = new THREE.Mesh(
      new THREE.TorusGeometry(o.radius * 0.78, o.radius * 0.18, 8, 20),
      o.cuff,
    );
    cuff.rotation.x = Math.PI / 2;
    cuff.position.y = -o.fore * 0.95;
    elbow.add(cuff);
  }
  const hand = buildHand(o.handMat, o.side, o.handSize, o.fingers);
  hand.position.y = -o.fore - o.handSize * 0.75;
  elbow.add(hand);
  shoulder.add(upper, elbow);
  return { shoulder, elbow, hand };
}

/** Perna com sapato arredondado. O quadril fica em `at`. */
export function buildLeg(o: {
  at: THREE.Vector3;
  length: number;
  radius: number;
  material: THREE.Material;
  shoe: THREE.Material;
  shoeSize: number;
  sole?: THREE.Material;
}) {
  const leg = new THREE.Group();
  leg.position.copy(o.at);
  const thigh = new THREE.Mesh(taperedCapsule(o.radius, o.radius * 0.8, o.length), o.material);
  thigh.position.y = -o.length / 2;
  const shoe = new THREE.Mesh(new THREE.SphereGeometry(o.shoeSize, 24, 16), o.shoe);
  shoe.scale.set(0.92, 0.55, 1.3);
  shoe.position.set(0, -o.length - o.radius * 0.2, o.shoeSize * 0.3);
  leg.add(thigh, shoe);
  if (o.sole) {
    const sole = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 24), o.sole);
    sole.scale.set(o.shoeSize * 0.9, o.shoeSize * 0.12, o.shoeSize * 1.25);
    sole.position.set(0, -o.length - o.radius * 0.2 - o.shoeSize * 0.42, o.shoeSize * 0.3);
    leg.add(sole);
  }
  return leg;
}

/** Sombra macia no chão. */
export function buildShadow(kit: Kit, width: number) {
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(width, width * 0.5),
    new THREE.MeshBasicMaterial({
      map: kit.blob("40,32,24", 0.5),
      transparent: true,
      depthWrite: false,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  return shadow;
}

/** Esqueleto básico: raiz → deslocamento → achatamento. */
export function skeleton() {
  const root = new THREE.Group();
  const mover = new THREE.Group();
  const squash = new THREE.Group();
  root.add(mover);
  mover.add(squash);
  return { root, mover, squash };
}

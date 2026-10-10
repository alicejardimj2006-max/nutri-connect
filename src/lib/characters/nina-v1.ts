// Primeira Nina 3D (29/09/2026), preservada como estava: olhos ovais escuros, franja em mechas,
// tranças e tablet. Aceita as cores da personalização. Usa a iluminação "clássica" do motor.

import * as THREE from "three";
import type { NinaLook } from "./nina-config";
import { shade, type EyeRig, type MouthRig, type Rig, type Spring } from "./parts";
import {
  buildAccessory,
  buildGlasses,
  buildHairStyle,
  buildTorso,
  sleeveMats,
  type WardrobeMats,
} from "./wardrobe";

interface Palette {
  skin: string;
  skinShade: string;
  hair: string;
  hairDark: string;
  coat: string;
  shirt: string;
  pants: string;
  shoe: string;
  ink: string;
  blush: string;
  mouth: string;
  tongue: string;
  tablet: string;
  tie: string;
  leaf: string;
  leafDark: string;
  badge: boolean;
  look: NinaLook;
}

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

interface OldRig {
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
  extraSprings: Spring[];
  shadow: THREE.Mesh;
  textures: THREE.Texture[];
}

function buildOld(COLORS: Palette): OldRig {
  const L = COLORS.look;
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
    iris: mat(L.eyes, { roughness: 0.3 }),
    gold: mat("#e9c86e", { roughness: 0.3, metalness: 0.6 }),
    glasses: mat(L.glassesColor, { roughness: 0.35 }),
    button: mat("#d9d4c8", { roughness: 0.35 }),
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
  // Roupa: o jaleco é o original desta Nina; as outras vêm do guarda-roupa compartilhado.
  const wm: WardrobeMats = {
    outfit: m.coat,
    shirt: m.shirt,
    skin: m.skin,
    hair: m.hair,
    accent: m.leaf,
    accentDark: m.leafDark,
    button: m.button,
  };
  if (L.outfit === "jaleco") {
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
  } else {
    buildTorso(spine, L, wm);
  }

  // Pescoço.
  const neck = mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.3, 16), m.skin);
  neck.position.y = 1.18;
  spine.add(neck);

  // Cordão colorido e crachá.
  const lanyardGroup = new THREE.Group();
  lanyardGroup.visible = COLORS.badge;
  spine.add(lanyardGroup);
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
    lanyardGroup.add(mesh(new THREE.TubeGeometry(curve, 24, 0.028, 8, false), lanyardMat));
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
  badge.visible = COLORS.badge;
  badge.rotation.x = -0.12;
  spine.add(badge);

  // Braços (ombro → cotovelo → mão), com as mangas da roupa escolhida.
  const sleeves = sleeveMats(L, wm);
  const arm = (side: 1 | -1) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.5, 0.92, 0);
    const upper = mesh(new THREE.CapsuleGeometry(0.15, 0.32, 6, 14), sleeves.sleeve);
    upper.position.y = -0.28;
    const elbow = new THREE.Group();
    elbow.position.y = -0.55;
    const fore = mesh(new THREE.CapsuleGeometry(0.135, 0.26, 6, 14), sleeves.fore);
    fore.position.y = -0.24;
    const cuff = mesh(new THREE.TorusGeometry(0.12, 0.035, 8, 20), sleeves.cuff ?? m.shirt);
    cuff.visible = !!sleeves.cuff;
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
  if (L.tablet) left.hand.add(tablet);

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
    if (L.earrings) {
      const ring = mesh(new THREE.SphereGeometry(0.04, 10, 8), m.gold);
      ring.position.set(side * 1.0, -0.26, 0.0);
      face.add(ring);
    }
  });

  // Olhos (ovais com brilho), olhos felizes (^ ^), cílios e sobrancelhas.
  const eyes: THREE.Group[] = [];
  const eyeOvals: THREE.Object3D[] = [];
  const happyEyes: THREE.Object3D[] = [];
  const brows: THREE.Object3D[] = [];
  [-1, 1].forEach((side) => {
    const eye = onHead(new THREE.Group(), side * 0.34, -0.02) as THREE.Group;
    const oval = new THREE.Group();
    const iris = mesh(new THREE.SphereGeometry(0.15, 24, 18), m.iris);
    iris.scale.set(0.85, 1.2, 0.4);
    const shine1 = mesh(new THREE.SphereGeometry(0.05, 12, 10), m.white);
    shine1.position.set(side * -0.035 + 0.02, 0.07, 0.06);
    const shine2 = mesh(new THREE.SphereGeometry(0.024, 10, 8), m.white);
    shine2.position.set(-0.03, -0.06, 0.06);
    const lash = mesh(new THREE.BoxGeometry(0.1, 0.028, 0.02), m.ink);
    lash.position.set(side * 0.13, 0.14, 0.02);
    lash.rotation.z = side * 0.55;
    lash.visible = L.lashes;
    oval.add(iris, shine1, shine2, lash);
    const happy = mesh(new THREE.TorusGeometry(0.1, 0.026, 8, 18, Math.PI), m.ink);
    happy.visible = false;
    eye.add(oval, happy);
    face.add(eye);
    eyes.push(eye);
    eyeOvals.push(oval);
    happyEyes.push(happy);

    const brow = onHead(new THREE.Group(), side * 0.34, 0.3, 1, 0.01);
    const bar = new THREE.Group();
    const browBar = mesh(new THREE.CapsuleGeometry(0.026, 0.16, 4, 8), m.hairDark);
    browBar.rotation.z = Math.PI / 2;
    bar.add(browBar);
    brow.add(bar);
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
    blush.visible = L.blush;
    face.add(blush);
    [
      [0.47, -0.12],
      [0.55, -0.1],
      [0.51, -0.05],
    ].forEach(([fx, fy]) => {
      if (!L.freckles) return;
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
    if (!L.bangs) return;
    const lobe = onHead(mesh(new THREE.SphereGeometry(r, 20, 14), m.hair), x, y, 1, 0);
    lobe.scale.set(1.15, 0.72, 0.5);
    lobe.rotateZ(rot);
    face.add(lobe);
  });
  const braids: THREE.Group[][] = [];
  (L.hairStyle === "trancas" ? [-1, 1] : []).forEach((side) => {
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
  // Outros penteados, acessórios e óculos do guarda-roupa (a cabeça desta Nina é o grupo "face").
  const hc = new THREE.Vector3(0, 0, 0);
  const extraSprings = buildHairStyle({
    head: face,
    hc,
    style: L.hairStyle,
    hair: m.hair,
    accent: m.tie,
    braids: false,
  });
  if (L.accessory !== "folha") {
    buildAccessory({ skull, hc, kind: L.accessory, accent: m.leaf, accentDark: m.leafDark });
  }
  buildGlasses({
    skull,
    hc,
    kind: L.glasses,
    material: m.glasses,
    eyeX: 0.34,
    eyeY: -0.02,
    lift: 0.1,
  });

  // Presilha de folha (a marca da nutricionista).
  const clip = onHead(new THREE.Group(), 0.6, 0.66, 1, 0.12);
  clip.visible = L.accessory === "folha";
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
    extraSprings,
    shadow,
    textures,
  };
}

/** Primeira Nina 3D, com as cores da aparência escolhida. */
export function buildNinaV1(look: NinaLook): Rig {
  const old = buildOld({
    skin: look.skin,
    skinShade: shade(look.skin, -0.12),
    hair: look.hair,
    hairDark: shade(look.hair, -0.3),
    coat: look.outfitColor,
    shirt: look.shirt,
    pants: look.pants,
    shoe: look.shoes,
    ink: "#2a1a10",
    blush: "#f08c7a",
    mouth: "#8a3a33",
    tongue: "#e07a6e",
    tablet: "#3b4759",
    tie: "#b4532a",
    leaf: look.accessoryColor,
    leafDark: shade(look.accessoryColor, -0.25),
    badge: look.badge,
    look,
  });
  const eyes: EyeRig[] = old.eyeOvals.map((oval, i) => ({
    side: i === 0 ? -1 : 1,
    ball: oval,
    open: oval,
    happy: old.happyEyes[i],
    upper: new THREE.Group(),
    upperOpen: 0,
    upperClosed: 0,
    cartoon: { shift: 0.04 },
  }));
  // Boca original: arco do sorriso e boca aberta (lábios e língua).
  const mouth: MouthRig = {
    update(open, smile) {
      old.mouthOpen.scale.set(0.8 + open * 0.3, Math.max(0.01, open * 1.1), 1);
      old.mouthOpen.visible = open > 0.04;
      old.smile.visible = open < 0.35;
      old.smile.rotation.z = smile >= 0 ? Math.PI : 0;
      old.smile.position.y = smile >= 0 ? 0.02 : -0.06;
      old.smile.scale.set(0.7 + Math.abs(smile) * 0.4, 0.4 + Math.abs(smile) * 0.6, 1);
    },
  };
  return {
    root: old.root,
    mover: old.mover,
    squash: old.squash,
    spine: old.spine,
    head: old.head,
    lShoulder: old.lShoulder,
    rShoulder: old.rShoulder,
    lElbow: old.lElbow,
    rElbow: old.rElbow,
    lLeg: old.lLeg,
    rLeg: old.rLeg,
    eyes,
    brows: old.brows,
    mouth,
    cheeks: [],
    springs: [
      ...old.braids.map((chain) => ({ chain, first: false, amount: 1 })),
      ...old.extraSprings,
    ],
    shadow: old.shadow,
    textures: old.textures,
    holding: look.tablet,
    headAmount: 1,
    classic: true,
    frames: {
      full: { center: 2.45, height: 5.7, width: 3.6 },
      bust: { center: 3.1, height: 2.7, width: 2.7 },
    },
  };
}

// Nutri Nina em 3D, no estilo da Nina desenhada: cabeça grande e redonda, olhos grandes delineados,
// sardas e testa livre. A aparência (cores, cabelo, roupa, acessórios) vem da personalização feita no
// painel da administração (nina-config.ts); sem personalização, é a Nina de jaleco com tranças.

import * as THREE from "three";
import { DEFAULT_LOOK, type NinaLook } from "./nina-config";
import {
  Kit,
  buildArm,
  buildBlush,
  buildBrow,
  buildEye,
  buildLeg,
  buildMouth,
  buildShadow,
  clothMat,
  glossyMat,
  mixHex,
  place,
  plainMat,
  shade,
  skeleton,
  skinMat,
  type EyeRig,
  type Rig,
} from "./parts";
import {
  buildAccessory,
  buildBadge,
  buildGlasses,
  buildHairStyle,
  buildTablet,
  buildTorso,
  sleeveMats,
} from "./wardrobe";

const INK = "#2a160b";
const MOUTH = "#7a2a22";
const FRECKLE = "#c8845f";

/** Cabelo liso: fios sutis (cor) e o relevo correspondente. */
function hairTextures(kit: Kit, color: string) {
  const strands = (g: CanvasRenderingContext2D, tone: (v: number) => string, alpha: number) => {
    g.fillStyle = tone(0.5);
    g.fillRect(0, 0, 256, 256);
    let s = 3;
    const r = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
    for (let i = 0; i < 500; i++) {
      const x = r() * 256;
      g.strokeStyle = tone(r());
      g.globalAlpha = alpha * (0.4 + r() * 0.6);
      g.lineWidth = 1 + r() * 2.5;
      g.beginPath();
      g.moveTo(x, 0);
      g.bezierCurveTo(x + (r() - 0.5) * 8, 90, x + (r() - 0.5) * 8, 170, x + (r() - 0.5) * 6, 256);
      g.stroke();
    }
    g.globalAlpha = 1;
  };
  const dark = shade(color, -0.3);
  const light = shade(color, 0.18);
  const map = kit.canvas(256, 256, (g) => strands(g, (v) => mixHex(dark, light, v), 0.45));
  const bump = kit.canvas(
    256,
    256,
    (g) => strands(g, (v) => `rgb(${v * 255},${v * 255},${v * 255})`, 0.5),
    false,
  );
  for (const t of [map, bump]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 1);
  }
  return { map, bump };
}

export function buildNina(look: NinaLook = DEFAULT_LOOK): Rig {
  const kit = new Kit();
  const fabric = kit.noise(256, { scale: 48, octaves: 2, seed: 5 });
  fabric.wrapS = fabric.wrapT = THREE.RepeatWrapping;
  fabric.repeat.set(4, 4);
  const hairTex = hairTextures(kit, look.hair);

  const m = {
    skin: skinMat(look.skin),
    skinShade: skinMat(shade(look.skin, -0.1)),
    outfit: clothMat(look.outfitColor, fabric, { side: THREE.DoubleSide, bumpScale: 0.3 }),
    shirt: clothMat(look.shirt, fabric, { bumpScale: 0.3 }),
    pants: clothMat(look.pants, fabric, { bumpScale: 0.3 }),
    shoe: glossyMat(look.shoes, { roughness: 0.4, clearcoatRoughness: 0.3 }),
    sole: plainMat(shade(look.shoes, -0.6), { roughness: 0.9 }),
    // Sem brilho aveludado e com pouca luz de ambiente: senão o cabelo escuro fica acinzentado.
    hair: new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      map: hairTex.map,
      bumpMap: hairTex.bump,
      bumpScale: 0.35,
      roughness: 0.52,
      clearcoat: 0.15,
      clearcoatRoughness: 0.45,
      envMapIntensity: 0.3,
    }),
    brow: plainMat(shade(look.hair, -0.35), { roughness: 0.6 }),
    ink: plainMat(INK, { roughness: 0.5 }),
    freckle: new THREE.MeshBasicMaterial({ color: FRECKLE, transparent: true, opacity: 0.6 }),
    gold: glossyMat("#e9c86e", { roughness: 0.3, metalness: 0.6 }),
    accent: glossyMat(look.accessoryColor, { roughness: 0.4 }),
    accentDark: glossyMat(shade(look.accessoryColor, -0.25), { roughness: 0.45 }),
    glasses: glossyMat(look.glassesColor, { roughness: 0.3 }),
    button: glossyMat("#d9d4c8", { roughness: 0.3 }),
  };

  const { root, mover, squash } = skeleton();
  const shadow = buildShadow(kit, 2.6);
  root.add(shadow);

  // Quadril e pernas (no vestido, meia-calça da cor da calça).
  const hips = new THREE.Group();
  hips.position.y = 0.95;
  squash.add(hips);
  const [rLeg, lLeg] = ([-1, 1] as const).map((side) => {
    const leg = buildLeg({
      at: new THREE.Vector3(side * 0.26, 0, 0),
      length: 0.6,
      radius: look.outfit === "vestido" ? 0.16 : 0.2,
      material: m.pants,
      shoe: m.shoe,
      shoeSize: 0.26,
      sole: m.sole,
    });
    hips.add(leg);
    return leg;
  });

  // Tronco, pescoço, crachá e braços.
  const spine = new THREE.Group();
  hips.add(spine);
  buildTorso(spine, look, m);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.3, 20), m.skin);
  neck.position.y = 1.12;
  spine.add(neck);
  if (look.badge) buildBadge(kit, spine, look, look.outfit === "vestido" ? 0.62 : 0.66);

  const sleeves = sleeveMats(look, m);
  const arm = (side: -1 | 1) => {
    const a = buildArm({
      side,
      at: new THREE.Vector3(side * 0.5, 0.88, 0),
      upper: 0.4,
      fore: 0.34,
      radius: 0.15,
      sleeve: sleeves.sleeve,
      foreMat: sleeves.fore,
      handMat: m.skin,
      handSize: 0.13,
      fingers: false,
      cuff: sleeves.cuff,
    });
    spine.add(a.shoulder);
    return a;
  };
  const left = arm(1);
  const right = arm(-1);
  if (look.tablet) buildTablet(kit, left.hand);

  // Cabeça grande e redonda; o pivô fica no pescoço.
  const head = new THREE.Group();
  head.position.y = 1.18;
  spine.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), m.skin);
  skull.scale.set(1.05, 0.98, 0.95);
  skull.position.y = 0.96;
  head.add(skull);
  const hc = skull.position.clone();

  // Orelhas (com brinquinho, se escolhido).
  ([-1, 1] as const).forEach((side) => {
    const ear = place(new THREE.Group(), skull, side * 0.99, -0.06, { sink: 0.06 });
    const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), m.skinShade);
    lobe.scale.set(0.95, 1.25, 0.5);
    ear.add(lobe);
    if (look.earrings) {
      const ring = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), m.gold);
      ring.position.set(0, -0.15, 0.04);
      ear.add(ring);
    }
  });

  // Olhos grandes, sobrancelhas, bochechas e sardas.
  const eyes: EyeRig[] = [];
  const brows: THREE.Object3D[] = [];
  const cheeks: THREE.Object3D[] = [];
  ([-1, 1] as const).forEach((side) => {
    const { socket, rig } = buildEye(kit, {
      radius: 0.23,
      iris: look.eyes,
      irisDark: shade(look.eyes, -0.55),
      irisSize: 0.9,
      pupil: 0.42,
      lid: m.skin,
      ink: m.ink,
      liner: look.lashes,
      side,
    });
    place(socket, skull, side * 0.41, 0.04, { forward: 0.85, sink: 0.12 });
    eyes.push(rig);
    brows.push(
      place(buildBrow(m.brow, side, 0.32, 0.034), skull, side * 0.41, 0.36, {
        forward: 0.5,
        lift: 0.02,
      }),
    );
    if (look.blush) {
      cheeks.push(
        place(buildBlush(kit, 0.27, "240,140,122", 0.6), skull, side * 0.6, -0.33, {
          lift: 0.004,
        }),
      );
    }
  });
  if (look.freckles) {
    [
      [-0.3, -0.21],
      [-0.17, -0.27],
      [-0.04, -0.2],
      [0.17, -0.25],
      [0.3, -0.2],
      [0.43, -0.27],
      [-0.43, -0.29],
      [0.52, -0.31],
      [-0.09, -0.3],
      [0.09, -0.32],
    ].forEach(([x, y]) => {
      place(new THREE.Mesh(new THREE.CircleGeometry(0.02, 10), m.freckle), skull, x, y, {
        lift: 0.003,
      });
    });
  }
  // Nariz pequeno e boca.
  const nose = place(
    new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), m.skin),
    skull,
    0,
    -0.26,
    { sink: 0.035 },
  );
  nose.scale.set(1.15, 0.8, 0.8);
  const mouth = buildMouth({ width: 0.5, height: 0.34, color: MOUTH, curve: 0.75, teeth: true });
  place(mouth.group, skull, 0, -0.56, { lift: 0.006 });

  buildGlasses({
    skull,
    hc,
    kind: look.glasses,
    material: m.glasses,
    eyeX: 0.41,
    eyeY: 0.04,
    lift: 0.17,
  });

  // Cabelo: calota bem inclinada para trás. Na frente a linha do cabelo fica alta (testa livre) e
  // nos lados desce até a altura do queixo, emoldurando o rosto; atrás cobre a cabeça toda.
  const style = look.hairStyle;
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(1.08, 72, 48, 0, Math.PI * 2, 0, 2.2),
    m.hair,
  );
  cap.position.copy(hc);
  cap.rotation.x = -1.22;
  cap.scale.set(1.05, 1, 0.97);
  // Volume de trás, escondido atrás da cabeça (não aparece embaixo do queixo).
  const back = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 30), m.hair);
  back.position.set(0, hc.y + 0.05, -0.4);
  back.scale.set(1.1, 1.04, 0.86);
  head.add(cap, back);
  // Mechas laterais (no curtinho, só até a altura da boca).
  ([-1, 1] as const).forEach((side) => {
    const short = style === "curto";
    const sideLock = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), m.hair);
    sideLock.position.set(side * 1.0, hc.y - (short ? 0.02 : 0.1), -0.06);
    sideLock.scale.set(0.2, short ? 0.5 : 0.62, 0.5);
    sideLock.rotation.z = side * 0.08;
    head.add(sideLock);
  });
  if (look.bangs) {
    // Franja curtinha, acima das sobrancelhas.
    [
      [-0.32, 0.6, 0.42, 0.17, 0.25],
      [0.05, 0.66, 0.4, 0.16, 0],
      [0.4, 0.6, 0.42, 0.17, -0.25],
    ].forEach(([x, y, sx, sy, rot]) => {
      const lock = place(new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), m.hair), skull, x, y, {
        lift: 0.02,
      });
      lock.scale.set(sx, sy, 0.12);
      lock.rotateZ(rot);
    });
  }
  const springs = buildHairStyle({ head, hc, style, hair: m.hair, accent: m.accent });
  buildAccessory({ skull, hc, kind: look.accessory, accent: m.accent, accentDark: m.accentDark });

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
    lLeg,
    rLeg,
    eyes,
    brows,
    mouth: mouth.rig,
    cheeks,
    springs,
    shadow,
    textures: kit.textures,
    holding: look.tablet,
    headAmount: 1,
    frames: {
      full: { center: 2.3, height: 5.2, width: 3.5 },
      bust: { center: 3.15, height: 2.75, width: 2.75 },
    },
  };
}

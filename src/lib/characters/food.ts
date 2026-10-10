// Base dos personagens-alimento (Lipe, Tito, Mila e Cadu): corpo do próprio alimento com rosto,
// bracinhos e perninhas finos. Cada personagem só descreve o corpo e onde ficam olhos e boca.

import * as THREE from "three";
import {
  Kit,
  buildArm,
  buildBlush,
  buildBrow,
  buildCartoonEye,
  buildLeg,
  buildMouth,
  buildShadow,
  placeFront,
  skeleton,
  type EyeRig,
  type Frame,
  type Rig,
  type Spring,
} from "./parts";

export interface FoodSpec {
  /** Monta o corpo dentro de `head` (o pivô fica no quadril) e devolve onde vai o rosto. */
  dress(head: THREE.Group): { face: THREE.Mesh; springs?: Spring[] };
  eyes: { x: number; y: number; size: number };
  brows?: { y: number; width: number; thick: number; material: THREE.Material; x?: number };
  mouth: { y: number; width: number; color: string };
  /** Cor dos olhos (e do arquinho dos olhos felizes). */
  ink: THREE.Material;
  blush?: { x: number; y: number; size: number; rgb: string; alpha?: number };
  limb: THREE.Material;
  hand?: THREE.Material;
  shoe: THREE.Material;
  arms: {
    x: number;
    y: number;
    z?: number;
    upper: number;
    fore: number;
    radius: number;
    hand: number;
  };
  legs: { gap: number; length: number; radius: number; shoe: number };
  frame: Frame;
  shadow: number;
}

export function buildFood(kit: Kit, spec: FoodSpec): Rig {
  const { root, mover, squash } = skeleton();
  const shadow = buildShadow(kit, spec.shadow);
  root.add(shadow);

  const hips = new THREE.Group();
  hips.position.y = spec.legs.length + spec.legs.shoe * 0.55;
  squash.add(hips);
  const [rLeg, lLeg] = ([-1, 1] as const).map((side) => {
    const leg = buildLeg({
      at: new THREE.Vector3(side * spec.legs.gap, 0.05, 0),
      length: spec.legs.length,
      radius: spec.legs.radius,
      material: spec.limb,
      shoe: spec.shoe,
      shoeSize: spec.legs.shoe,
    });
    hips.add(leg);
    return leg;
  });

  const spine = new THREE.Group();
  hips.add(spine);
  // O corpo é a própria "cabeça": gira inteiro (com menos amplitude) e leva os braços junto.
  const head = new THREE.Group();
  spine.add(head);
  const { face, springs = [] } = spec.dress(head);

  const arm = (side: -1 | 1) => {
    const a = buildArm({
      side,
      at: new THREE.Vector3(side * spec.arms.x, spec.arms.y, spec.arms.z ?? 0),
      upper: spec.arms.upper,
      fore: spec.arms.fore,
      radius: spec.arms.radius,
      sleeve: spec.limb,
      handMat: spec.hand ?? spec.limb,
      handSize: spec.arms.hand,
      fingers: false,
    });
    head.add(a.shoulder);
    return a;
  };
  const left = arm(1);
  const right = arm(-1);

  const eyes: EyeRig[] = [];
  const brows: THREE.Object3D[] = [];
  const cheeks: THREE.Object3D[] = [];
  ([-1, 1] as const).forEach((side) => {
    const { socket, rig } = buildCartoonEye({ size: spec.eyes.size, ink: spec.ink, side });
    placeFront(socket, face, side * spec.eyes.x, spec.eyes.y, {
      lift: spec.eyes.size * 0.05,
      forward: 0.8,
    });
    eyes.push(rig);
    if (spec.brows) {
      const b = spec.brows;
      brows.push(
        placeFront(
          buildBrow(b.material, side, b.width, b.thick),
          face,
          side * (b.x ?? spec.eyes.x),
          b.y,
          {
            lift: b.thick,
            forward: 0.6,
          },
        ),
      );
    }
    if (spec.blush) {
      const bl = spec.blush;
      cheeks.push(
        placeFront(buildBlush(kit, bl.size, bl.rgb, bl.alpha), face, side * bl.x, bl.y, {
          lift: 0.004,
          forward: 0,
        }),
      );
    }
  });
  const mouth = buildMouth({
    width: spec.mouth.width,
    height: spec.mouth.width * 0.62,
    color: spec.mouth.color,
    curve: 0.5,
  });
  placeFront(mouth.group, face, 0, spec.mouth.y, { lift: 0.006, forward: 0.4 });

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
    holding: false,
    headAmount: 0.45,
    frames: { full: spec.frame, bust: spec.frame },
  };
}

/** Cores por vértice num degradê do centro (x, y) para fora — polpa do abacate, por exemplo. */
export function radialColors(
  geo: THREE.BufferGeometry,
  center: THREE.Vector2,
  radius: number,
  inner: string,
  outer: string,
  power = 1.4,
) {
  const pos = geo.attributes.position;
  const a = new THREE.Color(inner);
  const b = new THREE.Color(outer);
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const d = Math.hypot(pos.getX(i) - center.x, pos.getY(i) - center.y) / radius;
    c.copy(a).lerp(b, Math.min(1, Math.pow(d, power)));
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
}

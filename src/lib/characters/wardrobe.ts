// "Guarda-roupa" das Ninas: roupas, crachá, tablet, estilos de cabelo, acessórios e óculos.
// Compartilhado pela Nina fofa e pela primeira Nina 3D (as duas têm o mesmo esqueleto e a cabeça
// do mesmo tamanho, com raio ~1 em volta de `hc`).

import * as THREE from "three";
import type { NinaLook } from "./nina-config";
import { Kit, clothMat, glossyMat, lathe, place, type Spring } from "./parts";

export interface WardrobeMats {
  outfit: THREE.Material;
  shirt: THREE.Material;
  skin: THREE.Material;
  hair: THREE.Material;
  accent: THREE.Material;
  accentDark: THREE.Material;
  button: THREE.Material;
}

const TORSO: [number, number][] = [
  [0.8, -0.18],
  [0.74, 0.15],
  [0.64, 0.55],
  [0.56, 0.84],
  [0.44, 1.0],
  [0.22, 1.08],
];

/** Tronco com a roupa escolhida. Devolve a superfície da frente (para bolsos e botões). */
export function buildTorso(spine: THREE.Group, look: NinaLook, m: WardrobeMats): THREE.Mesh {
  const outfit = look.outfit;
  const center = new THREE.Vector3(0, 0.45, 0);
  let front: THREE.Mesh;
  if (outfit === "jaleco") {
    // Blusa por dentro e jaleco aberto na frente, com lapelas, botões e bolsos.
    const shirt = new THREE.Mesh(
      lathe(
        TORSO.map(([r, y]) => [r * 0.95, y]),
        40,
      ),
      m.shirt,
    );
    front = new THREE.Mesh(
      new THREE.LatheGeometry(
        new THREE.SplineCurve(TORSO.map(([r, y]) => new THREE.Vector2(r, y))).getPoints(30),
        56,
        0.36,
        Math.PI * 2 - 0.72,
      ),
      m.outfit,
    );
    spine.add(shirt, front);
    ([-1, 1] as const).forEach((side) => {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(side * 0.22, 0.06);
      shape.lineTo(side * 0.16, 0.46);
      shape.lineTo(side * 0.02, 0.55);
      shape.closePath();
      const lapel = new THREE.Mesh(
        new THREE.ExtrudeGeometry(shape, {
          depth: 0.025,
          bevelEnabled: true,
          bevelSize: 0.014,
          bevelThickness: 0.012,
          bevelSegments: 2,
        }),
        m.outfit,
      );
      lapel.position.set(side * 0.12, 0.5, 0.56);
      lapel.rotation.set(-0.36, side * 0.4, 0);
      spine.add(lapel);
    });
    [0.2, -0.02].forEach((y) => {
      const button = place(
        new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), m.button),
        front,
        -0.33,
        y - 0.2,
        { center },
      );
      button.scale.z = 0.5;
    });
    ([-1, 1] as const).forEach((side) => {
      place(
        new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.2, 0.025), m.outfit),
        front,
        side * 0.62,
        -0.45,
        { center, lift: 0.006 },
      );
    });
    const chest = place(new THREE.Group(), front, 0.55, 0.28, { center, lift: 0.008 });
    chest.add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.17, 0.02), m.outfit));
    (
      [
        ["#d8473a", -0.04],
        ["#3b6fc4", 0.04],
      ] as const
    ).forEach(([color, x]) => {
      const pen = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.018, 0.16, 4, 8),
        glossyMat(color, { roughness: 0.3 }),
      );
      pen.position.set(x, 0.1, -0.008);
      chest.add(pen);
    });
  } else if (outfit === "vestido") {
    // Vestido rodado até o meio da perna, com golinha e faixa da cor da "blusa".
    front = new THREE.Mesh(
      lathe(
        [
          [1.0, -0.62],
          [0.86, -0.25],
          [0.66, 0.3],
          [0.58, 0.7],
          [0.48, 0.96],
          [0.24, 1.08],
        ],
        56,
      ),
      m.outfit,
    );
    spine.add(front);
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 10, 28), m.shirt);
    collar.rotation.x = Math.PI / 2 - 0.15;
    collar.position.set(0, 1.03, 0.03);
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.63, 0.04, 8, 40), m.shirt);
    belt.rotation.x = Math.PI / 2;
    belt.position.y = 0.42;
    spine.add(collar, belt);
  } else {
    // Camiseta ou moletom: tronco fechado.
    const hoodie = outfit === "moletom";
    front = new THREE.Mesh(lathe(TORSO, 56), hoodie ? m.outfit : m.shirt);
    spine.add(front);
    const collar = new THREE.Mesh(
      new THREE.TorusGeometry(0.2, hoodie ? 0.06 : 0.035, 10, 28),
      hoodie ? m.outfit : m.shirt,
    );
    collar.rotation.x = Math.PI / 2 - 0.15;
    collar.position.set(0, 1.04, 0.03);
    spine.add(collar);
    if (hoodie) {
      // Capuz nas costas, bolso canguru e cordões.
      const hood = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.14, 12, 28), m.outfit);
      hood.position.set(0, 1.0, -0.3);
      hood.rotation.x = Math.PI / 2 + 0.5;
      spine.add(hood);
      place(new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.26, 0.03), m.outfit), front, 0, -0.5, {
        center,
        lift: 0.01,
      });
      ([-1, 1] as const).forEach((side) => {
        const cord = new THREE.Mesh(new THREE.CapsuleGeometry(0.015, 0.22, 4, 8), m.shirt);
        cord.position.set(side * 0.08, 0.86, 0.56);
        cord.rotation.x = -0.4;
        spine.add(cord);
      });
    }
  }
  return front;
}

/** Materiais das mangas: compridas no jaleco e no moletom; curtas na camiseta e no vestido. */
export function sleeveMats(look: NinaLook, m: WardrobeMats) {
  const long = look.outfit === "jaleco" || look.outfit === "moletom";
  const sleeve = look.outfit === "camiseta" ? m.shirt : m.outfit;
  return {
    sleeve,
    fore: long ? sleeve : m.skin,
    cuff: look.outfit === "jaleco" ? m.shirt : look.outfit === "moletom" ? m.outfit : undefined,
  };
}

/** Cordão colorido com o crachá da Nina. */
export function buildBadge(kit: Kit, spine: THREE.Group, look: NinaLook, z = 0.66) {
  const lanyardTex = kit.canvas(256, 4, (g) => {
    const grd = g.createLinearGradient(0, 0, 256, 0);
    grd.addColorStop(0, "#f08a2b");
    grd.addColorStop(0.5, "#5db54e");
    grd.addColorStop(1, "#3b82c4");
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 4);
  });
  const lanyardMat = clothMat("#ffffff", undefined, { map: lanyardTex });
  ([-1, 1] as const).forEach((side) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.16, 1.06, 0.12),
      new THREE.Vector3(side * 0.24, 0.9, z - 0.22),
      new THREE.Vector3(side * 0.12, 0.66, z - 0.06),
      new THREE.Vector3(0, 0.52, z - 0.02),
    ]);
    spine.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.026, 8, false), lanyardMat));
  });
  const badgeTex = kit.canvas(96, 128, (g) => {
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, 96, 128);
    g.fillStyle = "#f2ede6";
    g.fillRect(8, 8, 80, 20);
    g.fillStyle = "#b4532a";
    g.font = "bold 13px serif";
    g.textAlign = "center";
    g.fillText("NutriConnect", 48, 23);
    g.fillStyle = "#f5d6bc";
    g.beginPath();
    g.arc(48, 58, 16, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = look.hair;
    g.beginPath();
    g.arc(48, 53, 16, Math.PI, 0);
    g.fill();
    g.fillStyle = "#334155";
    g.font = "bold 17px sans-serif";
    g.fillText("Nina", 48, 100);
    g.fillStyle = "#64748b";
    g.font = "11px sans-serif";
    g.fillText("Nutricionista", 48, 116);
  });
  const card = glossyMat("#ffffff", { roughness: 0.3 });
  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, 0.02), [
    card,
    card,
    card,
    card,
    glossyMat("#ffffff", { map: badgeTex, roughness: 0.3 }),
    card,
  ]);
  badge.position.set(0, 0.36, z);
  badge.rotation.x = -0.12;
  spine.add(badge);
}

/** Tablet com o plano alimentar, preso na mão. */
export function buildTablet(kit: Kit, hand: THREE.Object3D) {
  const screenTex = kit.canvas(192, 256, (g) => {
    const bg = g.createLinearGradient(0, 0, 0, 256);
    bg.addColorStop(0, "#e6f4fb");
    bg.addColorStop(1, "#bfe0ee");
    g.fillStyle = bg;
    g.fillRect(0, 0, 192, 256);
    g.fillStyle = "#7bbcd6";
    g.fillRect(0, 0, 192, 36);
    g.fillStyle = "#ffffff";
    g.font = "bold 20px sans-serif";
    g.textAlign = "center";
    g.fillText("Plano alimentar", 96, 25);
    const tri = (pts: number[], color: string) => {
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
      g.closePath();
      g.fill();
    };
    tri([96, 56, 52, 160, 140, 160], "#e9573f");
    tri([84, 82, 108, 82, 120, 108, 72, 108], "#f4a93c");
    tri([64, 130, 128, 130, 140, 160, 52, 160], "#f7d354");
    tri([44, 172, 148, 172, 158, 204, 34, 204], "#5db54e");
    tri([36, 208, 156, 208, 160, 236, 32, 236], "#3fa36b");
  });
  const tablet = new THREE.Group();
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.78, 0.045),
    glossyMat("#2a2f36", { roughness: 0.3 }),
  );
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.68),
    new THREE.MeshPhysicalMaterial({
      map: screenTex,
      roughness: 0.15,
      clearcoat: 1,
      emissive: "#ffffff",
      emissiveMap: screenTex,
      emissiveIntensity: 0.45,
    }),
  );
  screen.position.z = 0.024;
  frame.position.y = 0.3;
  screen.position.y = 0.3;
  tablet.add(frame, screen);
  tablet.position.set(0, -0.04, 0.12);
  tablet.rotation.set(1.7, -0.35, 0);
  hand.add(tablet);
}

/** Corrente de elos de cabelo (trança ou mecha presa), pendurada em `base`. */
export function hairChain(
  base: THREE.Object3D,
  material: THREE.Material,
  sizes: number[],
  step: number,
  braided: boolean,
  tie: THREE.Material,
) {
  const chain: THREE.Group[] = [];
  let parent: THREE.Object3D = base;
  sizes.forEach((r, i) => {
    const seg = new THREE.Group();
    seg.position.y = i === 0 ? 0 : -step;
    if (braided) {
      ([-1, 1] as const).forEach((lobe) => {
        const strand = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), material);
        const flip = i % 2 ? 1 : -1;
        strand.scale.set(0.72, 1.05, 0.82);
        strand.position.set(lobe * flip * r * 0.3, lobe * r * 0.25, 0);
        strand.rotation.z = lobe * flip * 0.55;
        seg.add(strand);
      });
    } else {
      const lock = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), material);
      lock.scale.set(0.9, 1.5, 0.85);
      seg.add(lock);
    }
    parent.add(seg);
    chain.push(seg);
    parent = seg;
  });
  const end = sizes[sizes.length - 1];
  if (braided) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(end * 0.7, end * 0.33, 10, 18), tie);
    band.rotation.x = Math.PI / 2;
    band.position.y = -step * 0.7;
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(end * 0.9, step * 1.35, 14), material);
    tuft.rotation.x = Math.PI;
    tuft.position.y = -step * 1.45;
    parent.add(band, tuft);
  } else {
    const tip = new THREE.Mesh(new THREE.ConeGeometry(end * 0.85, step * 1.4, 14), material);
    tip.rotation.x = Math.PI;
    tip.position.y = -step * 1.1;
    parent.add(tip);
  }
  return chain;
}

/**
 * Penteado preso ou solto (tranças, marias-chiquinhas, rabo, coque, solto). O curtinho não tem
 * mechas presas. `braids: false` deixa as tranças para quem chamou (a primeira Nina tem as dela).
 */
export function buildHairStyle(o: {
  head: THREE.Group;
  hc: THREE.Vector3;
  style: NinaLook["hairStyle"];
  hair: THREE.Material;
  accent: THREE.Material;
  braids?: boolean;
}): Spring[] {
  const { head, hc, style, hair, accent } = o;
  const springs: Spring[] = [];
  const tiedBase = (pos: THREE.Vector3, rot: THREE.Euler, bandRadius: number) => {
    const base = new THREE.Group();
    base.position.copy(pos);
    base.rotation.copy(rot);
    head.add(base);
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(bandRadius, bandRadius * 0.45, 10, 18),
      accent,
    );
    band.rotation.x = Math.PI / 2;
    base.add(band);
    return base;
  };
  if (style === "trancas" && o.braids !== false) {
    // Tranças caindo na frente dos ombros.
    ([-1, 1] as const).forEach((side) => {
      const base = new THREE.Group();
      base.position.set(side * 0.9, hc.y - 0.52, -0.12);
      base.rotation.set(-0.18, 0, side * 0.04);
      head.add(base);
      const chain = hairChain(
        base,
        hair,
        [0.2, 0.19, 0.18, 0.165, 0.15, 0.135, 0.12],
        0.21,
        true,
        accent,
      );
      springs.push({ chain, first: false, amount: 0.3 });
    });
  } else if (style === "marias") {
    // Marias-chiquinhas: duas mechas presas no alto, caindo para os lados.
    ([-1, 1] as const).forEach((side) => {
      const base = tiedBase(
        new THREE.Vector3(side * 0.92, hc.y + 0.3, -0.2),
        new THREE.Euler(0, 0, side * 0.35),
        0.11,
      );
      const chain = hairChain(base, hair, [0.2, 0.23, 0.22, 0.19, 0.15], 0.2, false, accent);
      springs.push({ chain, first: false, amount: 0.35 });
    });
  } else if (style === "rabo") {
    // Rabo de cavalo saindo do alto da nuca.
    const base = tiedBase(
      new THREE.Vector3(0, hc.y + 0.45, -0.95),
      new THREE.Euler(0.5, 0, 0),
      0.13,
    );
    const chain = hairChain(base, hair, [0.22, 0.25, 0.24, 0.21, 0.17, 0.13], 0.24, false, accent);
    springs.push({ chain, first: false, amount: 0.5 });
  } else if (style === "coque") {
    // Coque no alto da cabeça.
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 24), hair);
    bun.position.set(0, hc.y + 1.0, -0.32);
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.06, 10, 28), accent);
    band.position.set(0, hc.y + 0.78, -0.26);
    band.rotation.x = Math.PI / 2 - 0.3;
    head.add(bun, band);
  } else if (style === "solto") {
    // Cabelo comprido e solto, caindo atrás dos ombros, com duas mechas na frente.
    const long = new THREE.Mesh(
      lathe(
        [
          [0.0, -1.55],
          [0.55, -1.5],
          [0.95, -1.0],
          [1.05, -0.3],
          [1.0, 0.3],
          [0, 0.4],
        ],
        48,
      ),
      hair,
    );
    long.position.set(0, hc.y, -0.45);
    long.scale.set(1, 1, 0.42);
    head.add(long);
    ([-1, 1] as const).forEach((side) => {
      const base = new THREE.Group();
      base.position.set(side * 0.95, hc.y - 0.55, -0.1);
      head.add(base);
      const chain = hairChain(base, hair, [0.17, 0.17, 0.15, 0.12], 0.22, false, accent);
      springs.push({ chain, first: false, amount: 0.25 });
    });
  }
  return springs;
}

/** Acessório de cabeça (presilha de folha, laço, flor ou tiara), encaixado no crânio. */
export function buildAccessory(o: {
  skull: THREE.Mesh;
  hc: THREE.Vector3;
  kind: NinaLook["accessory"];
  accent: THREE.Material;
  accentDark: THREE.Material;
}) {
  const { skull, kind, accent, accentDark } = o;
  if (kind === "folha") {
    const clip = place(new THREE.Group(), skull, 0.6, 0.66, { lift: 0.13 });
    (
      [
        [0, 0.5, accent],
        [0.09, -0.5, accentDark],
      ] as const
    ).forEach(([dx, rot, mat]) => {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 12), mat);
      leaf.scale.set(0.5, 1.1, 0.22);
      leaf.position.x = dx;
      leaf.rotation.z = rot;
      clip.add(leaf);
    });
  } else if (kind === "laco") {
    const bow = place(new THREE.Group(), skull, 0.58, 0.68, { lift: 0.14 });
    ([-1, 1] as const).forEach((side) => {
      const loop = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 12), accent);
      loop.scale.set(1.3, 0.8, 0.45);
      loop.position.x = side * 0.17;
      loop.rotation.z = side * 0.25;
      bow.add(loop);
    });
    bow.add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), accentDark));
  } else if (kind === "flor") {
    const flower = place(new THREE.Group(), skull, 0.6, 0.66, { lift: 0.12 });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 10), accent);
      petal.position.set(Math.cos(a) * 0.1, Math.sin(a) * 0.1, 0);
      petal.scale.set(1, 1, 0.45);
      flower.add(petal);
    }
    flower.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), glossyMat("#f4c95d")));
  } else if (kind === "tiara") {
    const band = new THREE.Mesh(new THREE.TorusGeometry(1.12, 0.05, 10, 64, Math.PI), accent);
    band.position.copy(o.hc).add(new THREE.Vector3(0, 0.05, -0.12));
    band.rotation.set(-0.55, 0, 0);
    skull.parent!.add(band);
  }
}

/** Óculos redondos ou quadrados na frente dos olhos (em x = ±eyeX, y = eyeY no crânio). */
export function buildGlasses(o: {
  skull: THREE.Mesh;
  hc: THREE.Vector3;
  kind: NinaLook["glasses"];
  material: THREE.Material;
  eyeX: number;
  eyeY: number;
  /** Distância da lente até a pele (olhos saltados precisam de mais). */
  lift: number;
}) {
  const { skull, hc, kind, material } = o;
  if (kind === "nenhum") return;
  const head = skull.parent!;
  const lensFrame = (side: -1 | 1) => {
    let geo: THREE.BufferGeometry;
    if (kind === "redondo") geo = new THREE.TorusGeometry(0.27, 0.024, 10, 40);
    else {
      const s = new THREE.Shape();
      const w = 0.29;
      const h = 0.23;
      const r = 0.08;
      s.moveTo(-w + r, -h);
      s.lineTo(w - r, -h);
      s.quadraticCurveTo(w, -h, w, -h + r);
      s.lineTo(w, h - r);
      s.quadraticCurveTo(w, h, w - r, h);
      s.lineTo(-w + r, h);
      s.quadraticCurveTo(-w, h, -w, h - r);
      s.lineTo(-w, -h + r);
      s.quadraticCurveTo(-w, -h, -w + r, -h);
      const pts = s.getSpacedPoints(48).map((p) => new THREE.Vector3(p.x, p.y, 0));
      geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 64, 0.024, 8, true);
    }
    return place(new THREE.Mesh(geo, material), skull, side * o.eyeX, o.eyeY, {
      forward: 0.9,
      lift: o.lift,
    });
  };
  const lens = [lensFrame(-1), lensFrame(1)];
  head.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          lens[0].position.clone().add(new THREE.Vector3(0.24, 0.04, 0)),
          new THREE.Vector3(0, lens[0].position.y + 0.08, lens[0].position.z + 0.04),
          lens[1].position.clone().add(new THREE.Vector3(-0.24, 0.04, 0)),
        ]),
        12,
        0.022,
        6,
        false,
      ),
      material,
    ),
  );
  ([-1, 1] as const).forEach((side, i) => {
    head.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3([
            lens[i].position.clone().add(new THREE.Vector3(side * 0.27, 0.02, -0.02)),
            new THREE.Vector3(side * 1.0, hc.y + 0.05, 0.2),
            new THREE.Vector3(side * 1.02, hc.y - 0.02, -0.25),
          ]),
          12,
          0.02,
          6,
          false,
        ),
        material,
      ),
    );
  });
}

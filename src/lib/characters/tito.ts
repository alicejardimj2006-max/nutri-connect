// Tito Brócolis: talo verde-claro com um buquê de floretes que balança.

import * as THREE from "three";
import { buildFood } from "./food";
import { Kit, lathe, plainMat, type Spring } from "./parts";

const STALK: [number, number][] = [
  [0, -0.1],
  [0.42, -0.08],
  [0.47, 0.2],
  [0.45, 0.6],
  [0.47, 1.0],
  [0.52, 1.25],
  [0.64, 1.42],
  [0.72, 1.52],
  [0, 1.58],
];

export function buildTito() {
  const kit = new Kit();
  const greens = ["#15803d", "#16a34a", "#1c8f3f"].map((c) => plainMat(c, { roughness: 0.7 }));
  const light = plainMat("#4ade80", { roughness: 0.6 });
  return buildFood(kit, {
    dress(head) {
      const face = new THREE.Mesh(lathe(STALK, 48), plainMat("#bef264", { roughness: 0.55 }));
      face.scale.z = 0.92;
      head.add(face);
      // Buquê: floretes num domo, com bolinhas mais claras por cima.
      const crown = new THREE.Group();
      crown.position.set(0, 1.72, -0.08);
      const put = (x: number, y: number, z: number, r: number, i: number) => {
        const f = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), greens[i % 3]);
        f.position.set(x, y, z);
        crown.add(f);
      };
      put(0, 0.58, 0, 0.4, 1);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        put(Math.sin(a) * 0.48, 0.42, Math.cos(a) * 0.4, 0.34, i);
      }
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        put(Math.sin(a) * 0.8, 0.14 + (i % 2) * 0.06, Math.cos(a) * 0.6, 0.3, i + 2);
      }
      [
        [-0.2, 0.92, 0.25],
        [0.35, 0.78, 0.32],
        [-0.55, 0.6, 0.38],
        [0.62, 0.45, 0.42],
      ].forEach(([x, y, z]) => {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), light);
        dot.position.set(x, y, z);
        crown.add(dot);
      });
      head.add(crown);
      const springs: Spring[] = [{ chain: [crown], first: true, amount: 0.22 }];
      return { face, springs };
    },
    eyes: { x: 0.19, y: 0.86, size: 0.12 },
    brows: { y: 1.1, width: 0.17, thick: 0.022, material: plainMat("#3f6212") },
    mouth: { y: 0.5, width: 0.24, color: "#4e2418" },
    ink: plainMat("#2b2118", { roughness: 0.3 }),
    blush: { x: 0.34, y: 0.64, size: 0.11, rgb: "240,140,122", alpha: 0.45 },
    limb: plainMat("#a3e635"),
    shoe: plainMat("#65a30d", { roughness: 0.45 }),
    arms: { x: 0.46, y: 0.62, upper: 0.3, fore: 0.27, radius: 0.065, hand: 0.085 },
    legs: { gap: 0.2, length: 0.3, radius: 0.075, shoe: 0.16 },
    frame: { center: 1.55, height: 3.5, width: 2.7 },
    shadow: 1.9,
  });
}

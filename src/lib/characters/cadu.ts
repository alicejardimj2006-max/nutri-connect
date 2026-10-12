// Cadu Cenoura: cenoura laranja com risquinhos na casca e três folhas que balançam.

import * as THREE from "three";
import { buildFood } from "./food";
import { Kit, lathe, placeFront, plainMat, type Spring } from "./parts";

const PROFILE: [number, number][] = [
  [0, -0.22],
  [0.07, -0.18],
  [0.22, 0.15],
  [0.38, 0.55],
  [0.5, 0.95],
  [0.58, 1.35],
  [0.58, 1.62],
  [0.45, 1.78],
  [0.2, 1.85],
  [0, 1.86],
];

export function buildCadu() {
  const kit = new Kit();
  const ridge = plainMat("#ea580c");
  return buildFood(kit, {
    dress(head) {
      const face = new THREE.Mesh(lathe(PROFILE, 56), plainMat("#fb923c", { roughness: 0.5 }));
      face.scale.z = 0.95;
      head.add(face);
      // Risquinhos da casca, como no desenho.
      [
        [-0.3, 0.75, 0.14],
        [0.22, 0.55, 0.13],
        [-0.12, 0.3, 0.1],
      ].forEach(([x, y, w]) => {
        const line = new THREE.Mesh(new THREE.TorusGeometry(w, 0.018, 6, 16, Math.PI * 0.6), ridge);
        line.rotation.z = Math.PI * 1.2;
        placeFront(line, face, x, y, { lift: 0.005, forward: 0 });
      });
      // Três folhas em leque (cada uma balança).
      const springs: Spring[] = [];
      (
        [
          [-0.55, 0.42, "#22c55e"],
          [0.05, 0.52, "#16a34a"],
          [0.6, 0.42, "#22c55e"],
        ] as const
      ).forEach(([angle, len, color]) => {
        const pivot = new THREE.Group();
        pivot.position.set(0, 1.8, 0);
        const leaf = new THREE.Mesh(
          new THREE.SphereGeometry(1, 18, 12),
          plainMat(color, { roughness: 0.45 }),
        );
        leaf.scale.set(0.12, len / 2, 0.06);
        leaf.position.y = len / 2;
        pivot.add(leaf);
        head.add(pivot);
        springs.push({ chain: [pivot], first: true, amount: 0.6, rest: [{ x: 0, z: angle }] });
      });
      return { face, springs };
    },
    eyes: { x: 0.22, y: 1.32, size: 0.13 },
    brows: { y: 1.57, width: 0.19, thick: 0.022, material: plainMat("#9a3412") },
    mouth: { y: 1.0, width: 0.26, color: "#6a2410" },
    ink: plainMat("#2b2118", { roughness: 0.3 }),
    blush: { x: 0.42, y: 1.12, size: 0.12, rgb: "255,140,110", alpha: 0.5 },
    limb: plainMat("#fb923c"),
    shoe: plainMat("#c2410c", { roughness: 0.4 }),
    arms: { x: 0.52, y: 1.02, upper: 0.3, fore: 0.27, radius: 0.065, hand: 0.085 },
    legs: { gap: 0.16, length: 0.3, radius: 0.075, shoe: 0.16 },
    frame: { center: 1.35, height: 3.2, width: 2.2 },
    shadow: 1.6,
  });
}

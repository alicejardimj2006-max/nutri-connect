// Mila Maçã: maçã vermelha e lisa, com reflexo, cabinho e uma folha que balança.

import * as THREE from "three";
import { buildFood } from "./food";
import { Kit, lathe, plainMat, type Spring } from "./parts";

const PROFILE: [number, number][] = [
  [0, 0.08],
  [0.22, 0.0],
  [0.6, 0.06],
  [0.88, 0.34],
  [0.98, 0.72],
  [0.95, 1.1],
  [0.82, 1.4],
  [0.55, 1.58],
  [0.25, 1.52],
  [0.08, 1.42],
  [0, 1.4],
];

export function buildMila() {
  const kit = new Kit();
  return buildFood(kit, {
    dress(head) {
      const face = new THREE.Mesh(lathe(PROFILE, 64), plainMat("#ef4444", { roughness: 0.38 }));
      face.scale.z = 0.94;
      // Reflexo de luz na casca.
      const shine = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 12),
        new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.32 }),
      );
      shine.position.set(-0.55, 1.12, 0.62);
      shine.scale.set(0.5, 1, 0.3);
      shine.rotation.z = -0.45;
      // Cabinho saindo da covinha de cima.
      const stem = new THREE.Mesh(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 1.36, 0),
            new THREE.Vector3(0.02, 1.58, 0),
            new THREE.Vector3(0.1, 1.76, 0.02),
          ]),
          12,
          0.045,
          8,
          false,
        ),
        plainMat("#78350f"),
      );
      // Folha presa no cabinho (balança com o movimento).
      const leafPivot = new THREE.Group();
      leafPivot.position.set(0.05, 1.66, 0);
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 18, 12),
        plainMat("#22c55e", { roughness: 0.45 }),
      );
      leaf.scale.set(1.3, 0.5, 0.18);
      leaf.position.x = 0.24;
      leaf.rotation.y = -0.4;
      leafPivot.add(leaf);
      head.add(face, shine, stem, leafPivot);
      const springs: Spring[] = [
        { chain: [leafPivot], first: true, amount: 0.7, rest: [{ x: 0, z: 0.45 }] },
      ];
      return { face, springs };
    },
    eyes: { x: 0.3, y: 0.98, size: 0.14 },
    brows: { y: 1.25, width: 0.21, thick: 0.024, material: plainMat("#7f1d1d") },
    mouth: { y: 0.62, width: 0.3, color: "#5a1416" },
    ink: plainMat("#2b2118", { roughness: 0.3 }),
    blush: { x: 0.56, y: 0.74, size: 0.15, rgb: "255,170,160", alpha: 0.5 },
    limb: plainMat("#dc2626"),
    shoe: plainMat("#b91c1c", { roughness: 0.4 }),
    arms: { x: 0.94, y: 0.7, upper: 0.3, fore: 0.27, radius: 0.07, hand: 0.09 },
    legs: { gap: 0.3, length: 0.3, radius: 0.08, shoe: 0.17 },
    frame: { center: 1.12, height: 2.65, width: 2.5 },
    shadow: 2.1,
  });
}

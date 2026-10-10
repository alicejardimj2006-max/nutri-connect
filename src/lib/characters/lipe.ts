// Lipe Abacate: metade de um abacate (casca verde-escura atrás, polpa clara e caroço na frente).

import * as THREE from "three";
import { buildFood, radialColors } from "./food";
import { Kit, lathe, plainMat } from "./parts";

const PROFILE: [number, number][] = [
  [0, -0.12],
  [0.5, -0.06],
  [0.82, 0.2],
  [0.92, 0.55],
  [0.86, 0.9],
  [0.7, 1.25],
  [0.54, 1.55],
  [0.36, 1.78],
  [0.12, 1.9],
  [0, 1.92],
];

export function buildLipe() {
  const kit = new Kit();
  const limb = plainMat("#4d7c0f");
  return buildFood(kit, {
    dress(head) {
      // Casca: só a metade de trás (o abacate está cortado ao meio).
      const shell = new THREE.Mesh(
        new THREE.LatheGeometry(
          new THREE.SplineCurve(
            PROFILE.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.0001), y)),
          ).getPoints(40),
          64,
          Math.PI / 2,
          Math.PI,
        ),
        plainMat("#4d7c0f", { side: THREE.DoubleSide }),
      );
      shell.scale.z = 0.8;
      // Polpa: lente achatada que preenche o corte, clara no centro.
      const fleshGeo = lathe(
        PROFILE.map(([r, y]) => [r * 0.88, 0.85 + (y - 0.85) * 0.92] as [number, number]),
        64,
      );
      radialColors(fleshGeo, new THREE.Vector2(0, 0.62), 0.9, "#ecf9b4", "#bfe36e", 2);
      const face = new THREE.Mesh(
        fleshGeo,
        plainMat("#ffffff", { vertexColors: true, roughness: 0.55 }),
      );
      face.scale.z = 0.14;
      const pit = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 32, 24),
        plainMat("#a16207", { roughness: 0.35 }),
      );
      pit.position.set(0, 0.42, 0.06);
      pit.scale.z = 0.8;
      const shine = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 12, 10),
        new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.35 }),
      );
      shine.position.set(-0.1, 0.5, 0.29);
      shine.scale.set(0.7, 1, 0.3);
      head.add(shell, face, pit, shine);
      return { face };
    },
    eyes: { x: 0.25, y: 1.12, size: 0.13 },
    brows: { y: 1.38, width: 0.2, thick: 0.024, material: plainMat("#3f6212") },
    mouth: { y: 0.84, width: 0.26, color: "#5a2a1a" },
    ink: plainMat("#2b2118", { roughness: 0.3 }),
    blush: { x: 0.5, y: 0.94, size: 0.13, rgb: "240,140,122", alpha: 0.45 },
    limb,
    shoe: plainMat("#3f6212", { roughness: 0.45 }),
    arms: { x: 0.86, y: 0.62, z: -0.05, upper: 0.3, fore: 0.27, radius: 0.07, hand: 0.09 },
    legs: { gap: 0.3, length: 0.3, radius: 0.08, shoe: 0.17 },
    frame: { center: 1.18, height: 2.8, width: 2.45 },
    shadow: 2,
  });
}

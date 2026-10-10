// Personagens em 3D (WebGL, three.js). Cada personagem é montado com formas simples num esqueleto
// articulado, e cada ação é uma pose calculada a cada quadro: sem arquivos de modelo. Este módulo é
// carregado sob demanda (import dinâmico) por components/character-live.tsx, então o three.js só é
// baixado quando um personagem aparece.

import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { CharacterId } from "@/lib/trail-types";
import { buildCadu } from "./cadu";
import { buildLipe } from "./lipe";
import { buildMila } from "./mila";
import { buildNina } from "./nina";
import { buildNinaV1 } from "./nina-v1";
import { DEFAULT_MODEL, type NinaModel } from "./nina-config";
import { buildTito } from "./tito";
import type { Framing, Rig } from "./parts";
import { ONE_SHOT, POSE_KEYS, clamp01, ease, poseFor, type CharacterAction } from "./poses";

export type { CharacterAction, Framing };

/** Câmera girando em volta do personagem: ângulos em radianos e zoom (1 = enquadramento normal). */
export interface View {
  yaw: number;
  pitch: number;
  zoom: number;
}

export interface CharacterController {
  setAction(action: CharacterAction): void;
  setFraming(framing: Framing): void;
  setView(view: View): void;
  dispose(): void;
}

const BUILDERS: Record<CharacterId, (model: NinaModel) => Rig> = {
  nina: (model) => (model.version === "v1" ? buildNinaV1(model.look) : buildNina(model.look)),
  lipe: buildLipe,
  tito: buildTito,
  mila: buildMila,
  cadu: buildCadu,
};

// ───────────────────────── Palco compartilhado ─────────────────────────
//
// Um único WebGLRenderer (fora da página) desenha todos os personagens visíveis e copia cada imagem
// para o canvas 2D do respectivo personagem. Assim a página pode ter quantos quiser sem esbarrar no
// limite de contextos WebGL do navegador, e criar um novo (a cada resposta numa lição, por exemplo)
// é instantâneo.

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
  classic: boolean;
  fit(): void;
}

interface Engine {
  renderer: THREE.WebGLRenderer;
  environment: THREE.Texture;
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
  // Curva de tons de cinema: realces suaves em vez de branco estourado.
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  renderer.setScissorTest(true);

  // Luz de ambiente de um estúdio (reflexos suaves nos olhos, na casca e no tecido).
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04).texture;
  room.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      (obj.material as THREE.Material).dispose();
    }
  });
  pmrem.dispose();

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
    environment,
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
  // A primeira Nina usa a iluminação de antes (sem curva de tons).
  e.renderer.toneMapping = inst.classic ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
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
  // O horário do quadro pode vir antes do último registrado; tempo negativo desestabiliza as molas.
  const dt = Math.max(0, Math.min(0.05, (now - e.last) / 1000));
  e.last = now;
  for (const inst of e.instances) {
    if (!inst.visible) continue;
    inst.update(now, dt);
    draw(e, inst);
  }
  e.raf = requestAnimationFrame(loop);
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export function createCharacter(
  container: HTMLElement,
  id: CharacterId,
  options: {
    action?: CharacterAction;
    framing?: Framing;
    entrance?: boolean;
    /** Modelo e aparência da Nina (ignorado nos outros personagens). */
    model?: NinaModel;
  } = {},
): CharacterController {
  const e = getEngine();

  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";
  canvas.setAttribute("aria-hidden", "true");
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;

  const rig = BUILDERS[id](options.model ?? DEFAULT_MODEL);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  if (rig.classic) {
    scene.add(new THREE.HemisphereLight("#fff4e6", "#9a7a60", 1.9));
    const key = new THREE.DirectionalLight("#ffffff", 2.1);
    key.position.set(3, 6, 6);
    const rim = new THREE.DirectionalLight("#ffd9bf", 1.4);
    rim.position.set(-5, 3, -4);
    const fill = new THREE.DirectionalLight("#e8f0ff", 0.6);
    fill.position.set(-4, 1, 5);
    scene.add(key, rim, fill);
  } else {
    scene.environment = e.environment;
    scene.environmentIntensity = 0.5;
    scene.add(new THREE.HemisphereLight("#fff4e6", "#8a6e58", 1.1));
    const key = new THREE.DirectionalLight("#fff6ec", 2.4);
    key.position.set(3, 6, 6);
    const rim = new THREE.DirectionalLight("#ffd9bf", 1.8);
    rim.position.set(-5, 3, -4);
    const fill = new THREE.DirectionalLight("#e4eeff", 0.55);
    fill.position.set(-4, 1, 5);
    scene.add(key, rim, fill);
  }
  scene.add(rig.root);
  let view: View = { yaw: 0, pitch: 0, zoom: 1 };

  let framing: Framing = options.framing ?? "full";
  const entrance = options.entrance !== false;

  const reduced =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.motion === "reduce";

  // Estado das ações e da mistura entre elas.
  const clock0 = performance.now();
  let action: CharacterAction = options.action ?? "idle";
  let prev: CharacterAction = action;
  let actionStart = 0;
  let prevStart = 0;
  let blendStart = -10;

  // Piscadas em intervalos irregulares.
  let nextBlink = 1 + Math.random() * 2;
  let blinkStart = -1;

  // Molas (tranças, folhas): seguem o movimento do corpo com atraso.
  const springState = rig.springs.map(() => ({ a: 0, v: 0, ax: 0, vx: 0 }));
  let lastY = 0;
  let lastRot = 0;
  const holding = rig.holding;

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
    classic: !!rig.classic,
    fit() {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      const dpr = pixelRatio();
      inst.pw = Math.round(w * dpr);
      inst.ph = Math.round(h * dpr);
      canvas.width = inst.pw;
      canvas.height = inst.ph;
      camera.aspect = w / h;
      const f = rig.frames[framing];
      const half = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const dist =
        Math.max(f.height / 2 / half, f.width / 2 / (half * camera.aspect)) /
        Math.max(0.2, view.zoom);
      // Câmera numa esfera em volta do centro do enquadramento (girar e aproximar no visualizador).
      const cp = Math.cos(view.pitch);
      camera.position.set(
        Math.sin(view.yaw) * cp * dist,
        f.center + 0.15 + Math.sin(view.pitch) * dist,
        Math.cos(view.yaw) * cp * dist,
      );
      camera.lookAt(0, f.center, 0);
      camera.updateProjectionMatrix();
    },
    update(now, dt) {
      const t = (now - clock0) / 1000;
      const look = inst.look;
      const amp = reduced ? 0.35 : 1;
      const cur = poseFor(action, t, t - actionStart, holding);
      let pose = cur;
      const w = clamp01((t - blendStart) / BLEND);
      if (w < 1) {
        const old = poseFor(prev, t, t - prevStart, holding);
        const k = ease(w);
        pose = { ...cur };
        for (const key of POSE_KEYS) pose[key] = old[key] + (cur[key] - old[key]) * k;
      }

      // Entrada: surge com um pulinho elástico.
      const pop = !entrance || t >= 0.9 ? 1 : 1 - Math.pow(2, -9 * t) * Math.cos(t * 11);

      look.x += (look.tx - look.x) * Math.min(1, dt * 5);
      look.y += (look.ty - look.y) * Math.min(1, dt * 5);

      const ha = rig.headAmount;
      rig.mover.position.y = pose.y * amp;
      rig.mover.rotation.y = pose.rotY;
      rig.mover.scale.setScalar(Math.max(0.001, pop));
      rig.squash.scale.set(1 / Math.sqrt(pose.squash), pose.squash, 1 / Math.sqrt(pose.squash));
      rig.spine.rotation.set(pose.lean, 0, pose.tilt);
      rig.head.rotation.set(
        (pose.headX + look.y * 0.18 - pose.lookUp * 0.1) * ha,
        (pose.headY + look.x * 0.4) * ha,
        pose.headZ * ha,
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

      // Olhos: o globo segue o cursor; a pálpebra só aparece ao piscar (e cai um pouco na tristeza);
      // na alegria o olho vira um arquinho "^".
      const sad = pose.brow < 0 ? -pose.brow : 0;
      const happyEyes = pose.squint > 0.5;
      const close = Math.max(blink, sad * 0.28);
      for (const eye of rig.eyes) {
        if (eye.cartoon) {
          const k = eye.cartoon.shift;
          eye.ball.position.set(look.x * k, (-look.y * 0.6 + pose.lookUp * 0.8) * k, 0);
          eye.open.scale.y = Math.max(0.08, 1 - close);
        } else {
          eye.ball.rotation.set(-look.y * 0.3 - pose.lookUp * 0.4, look.x * 0.55, 0);
          eye.upper.rotation.x = lerp(eye.upperOpen, eye.upperClosed, close);
          eye.upper.visible = close > 0.02 && !happyEyes;
        }
        eye.open.visible = !happyEyes;
        eye.happy.visible = happyEyes;
      }
      rig.brows.forEach((brow) => {
        const side = brow.userData.side as number;
        const bar = brow.children[0];
        bar.position.y = pose.brow * 0.035;
        // Tristeza levanta a ponta de dentro da sobrancelha; surpresa só sobe as duas.
        bar.rotation.z = -side * sad * 0.4;
      });
      rig.cheeks.forEach((cheek) => {
        cheek.scale.setScalar(1 + Math.max(0, pose.smile) * 0.12 + pose.squint * 0.1);
      });

      // Boca.
      rig.mouth.update(clamp01(pose.mouth), Math.max(-1, Math.min(1, pose.smile)));

      // Molas balançando.
      const yVel = (pose.y - lastY) / Math.max(dt, 1e-3);
      const rotVel = (pose.rotY - lastRot) / Math.max(dt, 1e-3);
      lastY = pose.y;
      lastRot = pose.rotY;
      rig.springs.forEach((spring, i) => {
        const s = springState[i];
        const side = i % 2 === 0 ? -1 : 1;
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
        spring.chain.forEach((seg, j) => {
          if (j === 0 && !spring.first) return;
          const rest = spring.rest?.[j];
          seg.rotation.z = (rest?.z ?? 0) + s.a * spring.amount * (0.4 + j * 0.15);
          seg.rotation.x = (rest?.x ?? 0) + s.ax * spring.amount * (0.3 + j * 0.12);
        });
      });
    },
  };

  inst.fit();
  e.instances.add(inst);
  e.byElement.set(container, inst);
  e.io.observe(container);
  e.ro.observe(container);
  // Primeiro quadro já na criação: o personagem aparece sem esperar o próximo ciclo.
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
    setView(next) {
      view = next;
      inst.fit();
      inst.update(performance.now(), 0);
      draw(e, inst);
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

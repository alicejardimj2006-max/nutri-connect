// Modelos e aparência da Nina. A escolha da administração fica em platform_settings ("site_nina")
// e vale para o site todo. Este arquivo não carrega o three.js (é usado também pelos menus do painel).

export type NinaVersion = "v2" | "v1" | "desenho";

export interface NinaVersionInfo {
  id: NinaVersion;
  name: string;
  date: string;
  description: string;
  /** Aceita a personalização completa (cabelo, roupas, acessórios...). */
  customizable: boolean;
  /** É um modelo 3D (o desenho é 2D e não gira). */
  is3d: boolean;
}

export const NINA_VERSIONS: NinaVersionInfo[] = [
  {
    id: "v2",
    name: "Nina fofa",
    date: "09/10/2026",
    description:
      "Cabeça grande e redonda, olhos castanhos grandes com brilho, sardas e tranças. Aceita toda a personalização.",
    customizable: true,
    is3d: true,
  },
  {
    id: "v1",
    name: "Primeira Nina 3D",
    date: "29/09/2026",
    description:
      "O primeiro modelo 3D, criado para a apresentação: olhos ovais escuros, franja em mechas, tranças de bolinhas e tablet. Aceita toda a personalização.",
    customizable: true,
    is3d: true,
  },
  {
    id: "desenho",
    name: "Nina desenhada",
    date: "21/09/2026",
    description:
      "Desenho com aparência 3D (luz e sombra), feito a partir da imagem original. Não gira.",
    customizable: false,
    is3d: false,
  },
];

export type HairStyle = "trancas" | "marias" | "rabo" | "coque" | "solto" | "curto";
export type Outfit = "jaleco" | "camiseta" | "moletom" | "vestido";
export type HeadAccessory = "folha" | "laco" | "flor" | "tiara" | "nenhum";
export type Glasses = "nenhum" | "redondo" | "quadrado";

export interface NinaLook {
  skin: string;
  hair: string;
  eyes: string;
  hairStyle: HairStyle;
  bangs: boolean;
  outfit: Outfit;
  /** Jaleco, moletom ou vestido. */
  outfitColor: string;
  shirt: string;
  pants: string;
  shoes: string;
  accessory: HeadAccessory;
  accessoryColor: string;
  glasses: Glasses;
  glassesColor: string;
  freckles: boolean;
  blush: boolean;
  lashes: boolean;
  earrings: boolean;
  badge: boolean;
  tablet: boolean;
}

export const DEFAULT_LOOK: NinaLook = {
  skin: "#f3c7a5",
  hair: "#5c321a",
  eyes: "#8a5428",
  hairStyle: "trancas",
  bangs: false,
  outfit: "jaleco",
  outfitColor: "#fbfaf7",
  shirt: "#4f9e94",
  pants: "#2b3442",
  shoes: "#6f3d1e",
  accessory: "folha",
  accessoryColor: "#6f9a3c",
  glasses: "nenhum",
  glassesColor: "#3b2a20",
  freckles: true,
  blush: true,
  lashes: true,
  earrings: true,
  badge: true,
  tablet: true,
};

/** Aparência original da primeira Nina 3D (29/09). */
export const DEFAULT_LOOK_V1: NinaLook = {
  ...DEFAULT_LOOK,
  skin: "#f2c6a4",
  hair: "#7b4a2b",
  eyes: "#2a1a10",
  bangs: true,
  outfitColor: "#fbf9f4",
  shirt: "#4f9e94",
  pants: "#2f3a4c",
  shoes: "#7a4420",
  earrings: false,
};

/** Aparência original de cada versão. */
export const defaultLook = (version: NinaVersion) =>
  version === "v1" ? DEFAULT_LOOK_V1 : DEFAULT_LOOK;

export interface NinaModel {
  version: NinaVersion;
  look: NinaLook;
}

export interface SavedNinaModel extends NinaModel {
  id: string;
  name: string;
  savedAt: string;
}

/** O que fica salvo em "site_nina": o modelo em uso e os modelos personalizados guardados. */
export interface NinaSiteConfig {
  active: NinaModel;
  saved: SavedNinaModel[];
}

export const DEFAULT_MODEL: NinaModel = { version: "v2", look: DEFAULT_LOOK };

const VERSION_IDS = new Set(NINA_VERSIONS.map((v) => v.id));
const COLOR = /^#[0-9a-f]{6}$/i;

const OPTIONS = {
  hairStyle: ["trancas", "marias", "rabo", "coque", "solto", "curto"],
  outfit: ["jaleco", "camiseta", "moletom", "vestido"],
  accessory: ["folha", "laco", "flor", "tiara", "nenhum"],
  glasses: ["nenhum", "redondo", "quadrado"],
} as const;

/** Lê uma aparência salva, completando com o padrão da versão o que faltar ou vier inválido. */
export function readLook(raw: unknown, base: NinaLook = DEFAULT_LOOK): NinaLook {
  const r = (raw ?? {}) as Record<string, unknown>;
  const look = { ...base };
  for (const key of Object.keys(DEFAULT_LOOK) as (keyof NinaLook)[]) {
    const v = r[key];
    const def = DEFAULT_LOOK[key];
    if (typeof def === "boolean") {
      if (typeof v === "boolean") (look as Record<string, unknown>)[key] = v;
    } else if (key in OPTIONS) {
      if ((OPTIONS[key as keyof typeof OPTIONS] as readonly string[]).includes(v as string))
        (look as Record<string, unknown>)[key] = v;
    } else if (typeof v === "string" && COLOR.test(v)) {
      (look as Record<string, unknown>)[key] = v.toLowerCase();
    }
  }
  return look;
}

export function readModel(raw: unknown): NinaModel {
  const r = (raw ?? {}) as Record<string, unknown>;
  const version = VERSION_IDS.has(r.version as NinaVersion) ? (r.version as NinaVersion) : "v2";
  return { version, look: readLook(r.look, defaultLook(version)) };
}

export function readNinaSiteConfig(raw: unknown): NinaSiteConfig {
  const r = (raw ?? {}) as Record<string, unknown>;
  const saved = Array.isArray(r.saved)
    ? r.saved.slice(0, 40).flatMap((s) => {
        const o = (s ?? {}) as Record<string, unknown>;
        if (typeof o.id !== "string" || typeof o.name !== "string") return [];
        return [
          {
            ...readModel(o),
            id: o.id.slice(0, 40),
            name: o.name.slice(0, 60),
            savedAt: typeof o.savedAt === "string" ? o.savedAt : "",
          },
        ];
      })
    : [];
  return { active: r.active ? readModel(r.active) : DEFAULT_MODEL, saved };
}

/** Chave estável de um modelo (para recriar o 3D só quando algo muda). */
export const modelKey = (m: NinaModel) => JSON.stringify(m);

// Paletas sugeridas no personalizador (qualquer cor também pode ser escolhida à mão).
export const PALETTES = {
  skin: ["#fde0c8", "#f3c7a5", "#e8b48e", "#d49a6a", "#b87a4b", "#8d5a34", "#6a4026", "#4a2c1a"],
  hair: [
    "#1f1410",
    "#3b2416",
    "#5c321a",
    "#8a5228",
    "#b0682f",
    "#d9a55b",
    "#f0d28a",
    "#c0392b",
    "#7b5ea7",
    "#3d7fc4",
  ],
  eyes: ["#8a5428", "#4a2c16", "#2f6f4f", "#3d6fa8", "#6b7a8a", "#7a5a2a", "#1c1410"],
  outfit: ["#fbfaf7", "#f5d6e0", "#cfe8f7", "#dcefd2", "#fde9b8", "#e9e0f7", "#3b4a6b", "#c0582c"],
  shirt: ["#4f9e94", "#3b82c4", "#e07a5f", "#f4c95d", "#8e6cc2", "#e86a92", "#2b3442", "#ffffff"],
  pants: ["#2b3442", "#3b5b8a", "#5b4636", "#1f1f24", "#6b7280", "#c9b79c"],
  shoes: ["#6f3d1e", "#1f1f24", "#ffffff", "#c0392b", "#3b82c4", "#e86a92"],
  accent: ["#6f9a3c", "#e86a92", "#f4c95d", "#c0392b", "#3b82c4", "#8e6cc2", "#ffffff"],
};

export const LABELS = {
  hairStyle: {
    trancas: "Duas tranças",
    marias: "Marias-chiquinhas",
    rabo: "Rabo de cavalo",
    coque: "Coque",
    solto: "Solto e comprido",
    curto: "Curtinho",
  } satisfies Record<HairStyle, string>,
  outfit: {
    jaleco: "Jaleco de nutricionista",
    camiseta: "Camiseta",
    moletom: "Moletom",
    vestido: "Vestido",
  } satisfies Record<Outfit, string>,
  accessory: {
    folha: "Presilha de folha",
    laco: "Laço",
    flor: "Flor",
    tiara: "Tiara",
    nenhum: "Nenhum",
  } satisfies Record<HeadAccessory, string>,
  glasses: { nenhum: "Sem óculos", redondo: "Redondos", quadrado: "Quadrados" } satisfies Record<
    Glasses,
    string
  >,
};

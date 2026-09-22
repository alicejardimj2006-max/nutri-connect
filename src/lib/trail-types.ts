// Tipos da Trilha de Aprendizado: personagens, atividades, paradas, níveis e progresso.

export type CharacterId = "nina" | "lipe" | "tito" | "mila" | "cadu";

export interface Character {
  id: CharacterId;
  name: string;
  /** Emoji de reserva (o personagem animado é desenhado em SVG). */
  avatar: string;
  role: string;
}

export const CHARACTERS: Record<CharacterId, Character> = {
  nina: { id: "nina", name: "Nutri Nina", avatar: "👩🏽‍⚕️", role: "A nutricionista do grupo" },
  lipe: { id: "lipe", name: "Lipe Abacate", avatar: "🥑", role: "O curioso das gorduras boas" },
  tito: { id: "tito", name: "Tito Brócolis", avatar: "🥦", role: "O gigante das fibras" },
  mila: { id: "mila", name: "Mila Maçã", avatar: "🍎", role: "A fã de vitaminas" },
  cadu: { id: "cadu", name: "Cadu Cenoura", avatar: "🥕", role: "O explorador de cores" },
};

export type ActivityType =
  "dialogue" | "concept" | "quiz" | "true_false" | "multi" | "match" | "order" | "sort" | "fill";

/** Perfil da trilha: o adulto tem visual e conteúdo mais sérios; o infantil é lúdico. */
export type ProfileKind = "adult" | "kid";

export interface BaseActivity {
  id: string;
  type: ActivityType;
}

export interface DialogueActivity extends BaseActivity {
  type: "dialogue";
  character: Character;
  text: string;
}

/** Cartão de explicação: ensina o conceito antes das perguntas (não vale ponto). */
export interface ConceptActivity extends BaseActivity {
  type: "concept";
  character?: Character;
  title: string;
  /** Texto principal (aceita **negrito**). */
  body: string;
  points?: string[];
  /** Dica curta ou curiosidade ("Você sabia?"). */
  tip?: string;
  emoji?: string;
}

export interface QuizActivity extends BaseActivity {
  type: "quiz";
  character?: Character;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TrueFalseActivity extends BaseActivity {
  type: "true_false";
  character?: Character;
  statement: string;
  isTrue: boolean;
  explanation: string;
}

/** Marque todas as corretas. */
export interface MultiActivity extends BaseActivity {
  type: "multi";
  character?: Character;
  question: string;
  options: string[];
  correctIndexes: number[];
  explanation: string;
}

/** Ligue cada item da esquerda ao seu par da direita. */
export interface MatchActivity extends BaseActivity {
  type: "match";
  character?: Character;
  prompt: string;
  pairs: { left: string; right: string }[];
  explanation: string;
}

/** Coloque os itens na ordem certa (`items` já está na ordem correta). */
export interface OrderActivity extends BaseActivity {
  type: "order";
  character?: Character;
  prompt: string;
  items: string[];
  explanation: string;
}

/** Classifique cada item no grupo certo. */
export interface SortActivity extends BaseActivity {
  type: "sort";
  character?: Character;
  prompt: string;
  groups: string[];
  items: { text: string; group: number }[];
  explanation: string;
}

/** Complete a lacuna (___) escolhendo a palavra certa. */
export interface FillActivity extends BaseActivity {
  type: "fill";
  character?: Character;
  sentence: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type Activity =
  | DialogueActivity
  | ConceptActivity
  | QuizActivity
  | TrueFalseActivity
  | MultiActivity
  | MatchActivity
  | OrderActivity
  | SortActivity
  | FillActivity;

/** Atividades que valem ponto (têm resposta certa ou errada). */
export const isGraded = (a: Activity) => a.type !== "dialogue" && a.type !== "concept";

export type LevelNumber = 1 | 2 | 3;

export interface LevelMeta {
  label: string;
  emoji: string;
  /** XP base ao concluir o nível pela primeira vez. */
  xp: number;
  /** Vidas disponíveis no nível. */
  hearts: number;
  /** Fração mínima de acertos (na primeira tentativa) para concluir. */
  minPass: number;
  blurb: string;
}

export const LEVEL_META: Record<LevelNumber, LevelMeta> = {
  1: { label: "Fácil", emoji: "🌱", xp: 30, hearts: 5, minPass: 0.6, blurb: "Descubra o básico" },
  2: { label: "Médio", emoji: "🌿", xp: 50, hearts: 4, minPass: 0.7, blurb: "Coloque em prática" },
  3: {
    label: "Difícil",
    emoji: "🌳",
    xp: 80,
    hearts: 3,
    minPass: 0.75,
    blurb: "Vire especialista",
  },
};

export interface Level {
  id: string;
  level: LevelNumber;
  activities: Activity[];
}

export interface Stop {
  id: string;
  title: string;
  /** Nome do ícone (lucide) usado no visual adulto. */
  iconKey?: string;
  /** Emoji do rosto da parada no mapa. */
  icon: string;
  /** Frase curta do que se aprende nesta parada. */
  summary: string;
  levels: [Level, Level, Level];
}

/** Cenário do bioma da unidade. */
export type SceneId = "meadow" | "orchard" | "kitchen" | "lake";

export interface Unit {
  id: string;
  title: string;
  icon: string;
  description: string;
  scene: SceneId;
  stops: Stop[];
  requiredUnitId?: string;
}

/** Progresso de uma parada: níveis concluídos (0–3) e estrelas (0–3) por nível. */
export interface StopProgress {
  done: 0 | 1 | 2 | 3;
  stars: [number, number, number];
}

/** Uma trilha é um grande tema, formado por unidades (capítulos) e paradas. */
export interface Trail {
  id: string;
  kind: ProfileKind;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  /** Personagem que apresenta a trilha. */
  guide: CharacterId;
  scene: SceneId;
  units: Unit[];
}

export interface TrailProfile {
  id: string;
  name: string;
  kind: ProfileKind;
  /** Personagem escolhido como avatar (perfis infantis). */
  avatar: CharacterId;
}

export interface TrailProgress {
  stops: Record<string, StopProgress>;
  totalXP: number;
  /** Dias seguidos com ao menos um nível concluído. */
  streak: number;
  lastActiveDay: string | null;
  daily: { day: string; xp: number };
  achievements: string[];
  /** Níveis concluídos sem erros (3 estrelas). */
  perfectLevels: number;
  bestCombo: number;
}

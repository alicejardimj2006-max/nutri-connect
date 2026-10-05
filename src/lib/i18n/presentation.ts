// Textos da apresentação do projeto (/apresentacao). Ficam fora dos dicionários planos porque são
// longos e estruturados (listas, personas, canvas). O português é o canônico; os demais idiomas
// precisam seguir o mesmo formato (o TypeScript acusa qualquer campo faltando).

import type { Locale } from "./locales";
import ptBR from "./presentation-pt-BR";
import en from "./presentation-en";
import es from "./presentation-es";
import fr from "./presentation-fr";

export interface Titled {
  title: string;
  text: string;
}

export interface SlideHeading {
  eyebrow: string;
  title: string;
  /** Fala da Nutri Nina neste slide. */
  nina: string;
}

export interface ProblemItem {
  title: string;
  stat: string;
  statLabel: string;
  text: string;
  source: string;
}

export interface Persona {
  name: string;
  age: string;
  role: string;
  city: string;
  quote: string;
  bio: string;
  pains: string[];
  goals: string[];
  digital: string[];
  helps: string;
}

export interface Competitor {
  name: string;
  what: string;
  gap: string;
}

export interface CourseItem {
  title: string;
  learned: string;
  applied: string;
}

export interface TourSlide extends SlideHeading {
  text: string;
  bullets: string[];
}

export interface PresentationCopy {
  meta: { title: string; description: string };
  ui: {
    skip: string;
    prev: string;
    next: string;
    /** "{n}" e "{total}" são substituídos. */
    slideOf: string;
    exportPdf: string;
    fullscreen: string;
    language: string;
    source: string;
    keyboardHint: string;
    goTo: string;
    ninaSays: string;
    flipHint: string;
    /** "{n}" e "{total}" são substituídos. */
    partOf: string;
    presentedBy: string;
    leader: string;
    inThisPart: string;
    partsHint: string;
  };
  /** As 5 partes da apresentação, uma por integrante (mesma ordem de PRESENTERS em slides.tsx). */
  parts: { title: string; subtitle: string }[];
  ninaIntro: SlideHeading & {
    text: string;
    role: string;
    traits: Titled[];
    actionsLabel: string;
    actions: Record<
      "wave" | "talk" | "think" | "present" | "dance" | "cheer" | "spin" | "jump",
      string
    >;
  };
  cover: {
    eyebrow: string;
    title: string;
    highlight: string;
    subtitle: string;
    start: string;
    nina: string;
  };
  problem: SlideHeading & {
    intro: string;
    items: ProblemItem[];
    barPro: string;
    barWeb: string;
  };
  solution: SlideHeading & { text: string; pillars: Titled[] };
  differentials: SlideHeading & { items: Titled[] };
  personas: {
    eyebrow: string;
    userTitle: string;
    proTitle: string;
    ninaUser: string;
    ninaPro: string;
    painsLabel: string;
    goalsLabel: string;
    digitalLabel: string;
    helpsLabel: string;
    ageSuffix: string;
    verifiedStamp: string;
    user: Persona;
    pro: Persona;
  };
  competitors: SlideHeading & {
    directLabel: string;
    directHint: string;
    indirectLabel: string;
    indirectHint: string;
    gapLabel: string;
    pickHint: string;
    direct: Competitor[];
    indirect: Competitor[];
  };
  comparison: SlideHeading & {
    features: string[];
    yes: string;
    partial: string;
    no: string;
    score: string;
    note: string;
  };
  canvas: SlideHeading & { value: string; blocks: { title: string; items: string[] }[] };
  course: SlideHeading & {
    intro: string;
    learnedLabel: string;
    appliedLabel: string;
    stackLabel: string;
    items: CourseItem[];
  };
  tourIntro: SlideHeading & { text: string };
  tour: {
    feed: TourSlide;
    profile: TourSlide;
    appearance: TourSlide;
    trails: TourSlide;
    communities: TourSlide;
    challenges: TourSlide;
    discover: TourSlide;
    care: TourSlide;
  };
  mock: {
    post1Name: string;
    post1Time: string;
    post1Text: string;
    post2Name: string;
    post2Time: string;
    post2Text: string;
    profileName: string;
    profileBio: string;
    nextLevel: string;
    preview: string;
    previewText: string;
    previewButton: string;
    tryIt: string;
    accentLabel: string;
    fontLabel: string;
    modeLabel: string;
    light: string;
    dark: string;
    trailUnit: string;
    trailStops: string[];
    lives: string;
    kidProfile: string;
    adultProfile: string;
    communities: { name: string; members: string }[];
    join: string;
    joined: string;
    challengeTitle: string;
    challengeProgress: string;
    challengeParticipants: string;
    checkIn: string;
    checkedIn: string;
    days: string[];
    recipeTitle: string;
    recipeMeta: string;
    pollQuestion: string;
    pollOptions: string[];
    search: string;
    weekly: string;
    careProName: string;
    careRole: string;
    careWhen: string;
    careJoin: string;
    careTools: string[];
    careAssessment: string;
    careScore: string;
    carePlan: string;
  };
  team: SlideHeading & { text: string; role: string; leaderRole: string; pickHint: string };
  join: SlideHeading & {
    text: string;
    primary: string;
    secondary: string;
    replay: string;
    perks: string[];
  };
}

const COPY: Record<Locale, PresentationCopy> = { "pt-BR": ptBR, en, es, fr };

export function presentationCopy(locale: Locale): PresentationCopy {
  return COPY[locale] ?? ptBR;
}

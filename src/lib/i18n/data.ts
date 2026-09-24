// Rótulos de dados estruturados (categorias, objetivos, profissões, dificuldades, tema da semana).
// O valor salvo continua em português (é ele que filtra e compara); só o texto exibido é traduzido.

import { loadLocale } from "./index";
import type { Locale } from "./locales";

type Row = [pt: string, en: string, es: string, fr: string];

const ROWS: Row[] = [
  // Objetivos da jornada
  [
    "Comer melhor e com prazer",
    "Eat better and enjoy it",
    "Comer mejor y con placer",
    "Mieux manger avec plaisir",
  ],
  [
    "Melhorar minha rotina alimentar",
    "Improve my eating routine",
    "Mejorar mi rutina alimentaria",
    "Améliorer ma routine alimentaire",
  ],
  [
    "Cozinhar mais em casa",
    "Cook more at home",
    "Cocinar más en casa",
    "Cuisiner davantage à la maison",
  ],
  [
    "Aprender receitas práticas",
    "Learn practical recipes",
    "Aprender recetas prácticas",
    "Apprendre des recettes pratiques",
  ],
  [
    "Organização de marmitas",
    "Meal prep organization",
    "Organización de viandas",
    "Organisation des repas préparés",
  ],
  [
    "Alimentação vegetariana",
    "Vegetarian eating",
    "Alimentación vegetariana",
    "Alimentation végétarienne",
  ],
  [
    "Ganho de massa muscular",
    "Muscle mass gain",
    "Ganancia de masa muscular",
    "Prise de masse musculaire",
  ],
  [
    "Emagrecimento consciente",
    "Mindful weight loss",
    "Adelgazamiento consciente",
    "Perte de poids consciente",
  ],
  ["Qualidade de vida", "Quality of life", "Calidad de vida", "Qualité de vie"],
  // Categorias de comunidades
  ["Educação alimentar", "Food education", "Educación alimentaria", "Éducation alimentaire"],
  [
    "Relação com a comida",
    "Relationship with food",
    "Relación con la comida",
    "Rapport à la nourriture",
  ],
  ["Cozinha do dia a dia", "Everyday cooking", "Cocina del día a día", "Cuisine du quotidien"],
  ["Bem-estar e sono", "Well-being and sleep", "Bienestar y sueño", "Bien-être et sommeil"],
  ["Alimentação em família", "Family eating", "Alimentación en familia", "Alimentation en famille"],
  [
    "Saúde e condições clínicas",
    "Health and clinical conditions",
    "Salud y condiciones clínicas",
    "Santé et conditions cliniques",
  ],
  // Categorias de receitas
  ["Café da manhã", "Breakfast", "Desayuno", "Petit-déjeuner"],
  ["Almoço e Jantar", "Lunch and Dinner", "Almuerzo y Cena", "Déjeuner et Dîner"],
  ["Lanches práticos", "Quick snacks", "Meriendas prácticas", "Collations pratiques"],
  ["Sobremesas saudáveis", "Healthy desserts", "Postres saludables", "Desserts sains"],
  ["Vegetariano & Vegano", "Vegetarian & Vegan", "Vegetariano y Vegano", "Végétarien et Végan"],
  // Profissões
  ["Nutricionista", "Nutritionist", "Nutricionista", "Nutritionniste"],
  ["Médico(a)", "Physician", "Médico/a", "Médecin"],
  ["Psicólogo(a)", "Psychologist", "Psicólogo/a", "Psychologue"],
  [
    "Educador(a) físico(a)",
    "Physical educator",
    "Educador/a físico/a",
    "Éducateur(trice) sportif(ve)",
  ],
  ["Fisioterapeuta", "Physiotherapist", "Fisioterapeuta", "Kinésithérapeute"],
  ["Enfermeiro(a)", "Nurse", "Enfermero/a", "Infirmier(ère)"],
  // Dificuldade
  ["Fácil", "Easy", "Fácil", "Facile"],
  ["Médio", "Medium", "Medio", "Moyen"],
  ["Difícil", "Hard", "Difícil", "Difficile"],
  // Distintivos por desafios concluídos
  ["Primeiro Passo", "First Step", "Primer Paso", "Premier Pas"],
  [
    "Constância em Construção",
    "Consistency in the Making",
    "Constancia en Construcción",
    "Régularité en Construction",
  ],
  ["Mestre dos Hábitos", "Habit Master", "Maestro de los Hábitos", "Maître des Habitudes"],
];

const LOCALE_INDEX: Partial<Record<Locale, number>> = { en: 1, es: 2, fr: 3 };

const MAPS: Partial<Record<Locale, Record<string, string>>> = {};
for (const [loc, i] of Object.entries(LOCALE_INDEX) as [Locale, number][]) {
  MAPS[loc] = Object.fromEntries(ROWS.map((r) => [r[0], r[i]]));
}

/** Traduz um rótulo de dado estruturado; se não houver tradução, devolve o valor original. */
export function td(value: string | undefined | null, locale: Locale = loadLocale()): string {
  if (!value) return "";
  return MAPS[locale]?.[value] ?? value;
}

/* ------------------------------ Tema da semana ------------------------------ */

const WEEKLY: Record<string, Partial<Record<Locale, Record<string, unknown>>>> = {
  "tema-alimentos-frescos": {
    en: {
      title: "Real Cooking: Fewer Labels, More Freshness",
      subtitle: "The Community Pulse this week",
      description:
        "This week, our invitation is to look kindly at the fresh, minimally processed foods from the market and the garden. Small changes bring more color, flavor and vitality to the day.",
      badge: "Theme of the Week",
      currentWeek: "Week of September 8–14",
      questionOfTheWeek:
        "Which fresh food you didn't eat before has recently become part of your routine?",
      pollQuestion: "What's your biggest obstacle to cooking more with fresh foods?",
      options: [
        "Lack of time during the week",
        "Fear of food spoiling in the fridge",
        "Lack of ideas for seasonings and recipes",
        "Tiredness at the end of the day",
      ],
    },
    es: {
      title: "Cocina de Verdad: Menos Etiquetas, Más Frescura",
      subtitle: "El Pulso de la Comunidad esta semana",
      description:
        "Esta semana, nuestra invitación es mirar con cariño los alimentos frescos y poco procesados del mercado y de la huerta. Pequeños cambios traen más color, sabor y vitalidad al día.",
      badge: "Tema de la Semana",
      currentWeek: "Semana del 8 al 14 de septiembre",
      questionOfTheWeek:
        "¿Qué alimento fresco que antes no comías pasó a formar parte de tu rutina recientemente?",
      pollQuestion: "¿Cuál es tu mayor obstáculo para cocinar más con alimentos frescos?",
      options: [
        "Falta de tiempo durante la semana",
        "Miedo a que los alimentos se echen a perder en el refrigerador",
        "Falta de ideas de condimentos y recetas",
        "Cansancio al final del día",
      ],
    },
    fr: {
      title: "La Vraie Cuisine : Moins d'Étiquettes, Plus de Fraîcheur",
      subtitle: "Le Pouls de la Communauté cette semaine",
      description:
        "Cette semaine, notre invitation est de porter un regard bienveillant sur les aliments frais et peu transformés du marché et du potager. De petits changements apportent plus de couleur, de saveur et de vitalité à la journée.",
      badge: "Thème de la Semaine",
      currentWeek: "Semaine du 8 au 14 septembre",
      questionOfTheWeek:
        "Quel aliment frais que vous ne mangiez pas avant fait désormais partie de votre routine ?",
      pollQuestion:
        "Quel est votre plus grand obstacle pour cuisiner davantage avec des aliments frais ?",
      options: [
        "Manque de temps en semaine",
        "Peur que les aliments se gâtent au réfrigérateur",
        "Manque d'idées d'assaisonnements et de recettes",
        "Fatigue en fin de journée",
      ],
    },
  },
};

interface ThemeLike {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  badge?: string;
  currentWeek?: string;
  questionOfTheWeek?: string;
  poll?: { question: string; options: { text: string }[] };
}

export function localizeWeeklyTheme<T extends ThemeLike>(theme: T, locale: Locale): T {
  const ov = WEEKLY[theme.id]?.[locale] as
    (Record<string, string> & { options?: string[] }) | undefined;
  if (!ov) return theme;
  return {
    ...theme,
    title: ov.title,
    subtitle: ov.subtitle,
    description: ov.description,
    badge: ov.badge,
    currentWeek: ov.currentWeek,
    questionOfTheWeek: ov.questionOfTheWeek,
    poll: theme.poll && {
      ...theme.poll,
      question: ov.pollQuestion,
      options: theme.poll.options.map((o, i) => ({ ...o, text: ov.options?.[i] ?? o.text })),
    },
  };
}

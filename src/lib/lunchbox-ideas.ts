// Lancheira da semana (N8): ideias prontas de lanche escolar, no espírito do Guia Alimentar e do
// PNAE (comida de verdade, sem ultraprocessados, que aguenta algumas horas fora da geladeira).
// Cada ideia diz o que contém para nunca ser oferecida a quem tem alergia.
import type { Names } from "@/lib/appearance-data";

export type Allergen = "leite" | "gluten" | "ovo" | "amendoim" | "castanhas" | "peixe" | "soja";

export interface LunchIdea {
  id: string;
  emojis: string;
  title: Names;
  items: Names[];
  contains: Allergen[];
  /** Idade mínima (alimentos com risco de engasgo para os menores). */
  minAge?: number;
}

export const AGE_RANGES = ["1-3", "4-6", "7-10", "11-14"] as const;
export type AgeRange = (typeof AGE_RANGES)[number];

export const AGE_NAMES: Record<AgeRange, Names> = {
  "1-3": ["1 a 3 anos", "1 to 3 years", "1 a 3 años", "1 à 3 ans"],
  "4-6": ["4 a 6 anos", "4 to 6 years", "4 a 6 años", "4 à 6 ans"],
  "7-10": ["7 a 10 anos", "7 to 10 years", "7 a 10 años", "7 à 10 ans"],
  "11-14": ["11 a 14 anos", "11 to 14 years", "11 a 14 años", "11 à 14 ans"],
};

/** Palavras que, nas alergias e regras da escola, apontam para cada alergênico. */
const KEYWORDS: Record<Allergen, RegExp> = {
  leite: /leite|lactose|latic|queijo|iogurte|milk|dairy|lactosa|lait/i,
  gluten: /gl[uú]ten|trigo|celíac|celiac|wheat|blé/i,
  ovo: /\bovos?\b|egg|huevo|œuf|oeuf/i,
  amendoim: /amendoim|peanut|man[ií]|cacahu|arachide/i,
  castanhas: /castanh|nozes|noz\b|am[eê]ndoa|oleaginos|nuts?\b|nueces|almendra|noix/i,
  peixe: /peixe|fish|pescado|poisson|frutos do mar|camar[aã]o/i,
  soja: /\bsoja\b|soy/i,
};

/** Alimentos que costumam conter o alergênico mesmo sem citá-lo (para conferir sugestões). */
const HIDDEN: Partial<Record<Allergen, RegExp>> = {
  leite: /manteiga|requeij|creme de leite|chantilly|butter|cream|mantequilla|beurre|crème/i,
  gluten:
    /\bp[aã]o\b|p[aã]es|bolo|biscoito|bolacha|macarr|massa|wrap|aveia|cevada|centeio|muffin|panqueca|bread|cake|cookie|cracker|pasta|oat|pan\b|galleta|avena|pain\b|gâteau|biscuit/i,
  ovo: /omelete|maionese|omelette|mayo/i,
  peixe: /atum|sardinha|salm[aã]o|tuna|sardine|salmon|bacalhau/i,
};

/**
 * Alergênicos citados num texto livre (alergias + regras da escola). Com `strict`, também conta
 * alimentos que costumam conter o alergênico (para conferir uma sugestão, na dúvida descarta).
 */
export function allergensIn(text: string, strict = false): Allergen[] {
  // "Pão sem glúten" é seguro para quem não pode glúten.
  const glutenFree = strict && /sem gl[uú]ten|gluten[- ]free|sin gluten|sans gluten/i.test(text);
  return (Object.keys(KEYWORDS) as Allergen[]).filter(
    (a) =>
      !(a === "gluten" && glutenFree) &&
      (KEYWORDS[a].test(text) || (strict && !!HIDDEN[a]?.test(text))),
  );
}

export const LUNCH_IDEAS: LunchIdea[] = [
  {
    id: "pao-queijo-banana",
    emojis: "🍞🧀🍌",
    title: [
      "Pão integral com queijo branco e banana",
      "Whole-grain bread with white cheese and banana",
      "Pan integral con queso blanco y plátano",
      "Pain complet, fromage frais et banane",
    ],
    items: [
      [
        "1 pão integral com queijo branco",
        "1 whole-grain roll with white cheese",
        "1 pan integral con queso blanco",
        "1 pain complet au fromage frais",
      ],
      ["1 banana", "1 banana", "1 plátano", "1 banane"],
      ["Água", "Water", "Agua", "Eau"],
    ],
    contains: ["leite", "gluten"],
  },
  {
    id: "bolo-cenoura-mexerica",
    emojis: "🥕🍰🍊",
    title: [
      "Bolo de cenoura caseiro e mexerica",
      "Homemade carrot cake and tangerine",
      "Bizcocho casero de zanahoria y mandarina",
      "Gâteau maison aux carottes et mandarine",
    ],
    items: [
      [
        "1 fatia de bolo de cenoura sem cobertura",
        "1 slice of carrot cake, no frosting",
        "1 porción de bizcocho de zanahoria sin cobertura",
        "1 part de gâteau aux carottes sans glaçage",
      ],
      ["1 mexerica", "1 tangerine", "1 mandarina", "1 mandarine"],
    ],
    contains: ["gluten", "ovo"],
  },
  {
    id: "pipoca-maca",
    emojis: "🍿🍎",
    title: [
      "Pipoca de panela e maçã",
      "Stovetop popcorn and apple",
      "Palomitas caseras y manzana",
      "Pop-corn maison et pomme",
    ],
    items: [
      [
        "1 pote de pipoca feita em casa, pouco sal",
        "1 tub of homemade popcorn, lightly salted",
        "1 recipiente de palomitas caseras con poca sal",
        "1 boîte de pop-corn maison peu salé",
      ],
      ["1 maçã", "1 apple", "1 manzana", "1 pomme"],
    ],
    contains: [],
    minAge: 4,
  },
  {
    id: "ovo-cenoura-pao-queijo",
    emojis: "🥚🥕🧀",
    title: [
      "Ovo cozido, palitos de cenoura e pão de queijo",
      "Boiled egg, carrot sticks and cheese bread",
      "Huevo cocido, palitos de zanahoria y pan de queso",
      "Œuf dur, bâtonnets de carotte et pain au fromage",
    ],
    items: [
      ["1 ovo cozido", "1 boiled egg", "1 huevo cocido", "1 œuf dur"],
      ["Palitos de cenoura", "Carrot sticks", "Palitos de zanahoria", "Bâtonnets de carotte"],
      [
        "2 pães de queijo caseiros",
        "2 homemade cheese breads",
        "2 panes de queso caseros",
        "2 pains au fromage maison",
      ],
    ],
    contains: ["ovo", "leite"],
  },
  {
    id: "iogurte-fruta-aveia",
    emojis: "🥣🍓",
    title: [
      "Iogurte natural com fruta e aveia",
      "Plain yogurt with fruit and oats",
      "Yogur natural con fruta y avena",
      "Yaourt nature, fruits et flocons d'avoine",
    ],
    items: [
      [
        "1 iogurte natural em pote térmico (com gelo reutilizável)",
        "1 plain yogurt in an insulated pot (with an ice pack)",
        "1 yogur natural en recipiente térmico (con hielo)",
        "1 yaourt nature en pot isotherme (avec pain de glace)",
      ],
      ["Fruta picada", "Chopped fruit", "Fruta picada", "Fruits coupés"],
      ["1 colher de aveia", "1 spoon of oats", "1 cucharada de avena", "1 cuillère d'avoine"],
    ],
    contains: ["leite", "gluten"],
  },
  {
    id: "sanduiche-frango-uva",
    emojis: "🥪🍇",
    title: [
      "Sanduíche de frango com cenoura e uvas",
      "Chicken and carrot sandwich with grapes",
      "Sándwich de pollo con zanahoria y uvas",
      "Sandwich poulet-carotte et raisins",
    ],
    items: [
      [
        "Pão integral com frango desfiado e cenoura ralada",
        "Whole-grain bread with shredded chicken and grated carrot",
        "Pan integral con pollo desmenuzado y zanahoria rallada",
        "Pain complet, poulet effiloché et carotte râpée",
      ],
      [
        "Uvas (cortadas ao meio para os pequenos)",
        "Grapes (halved for little ones)",
        "Uvas (cortadas por la mitad para los pequeños)",
        "Raisins (coupés en deux pour les petits)",
      ],
    ],
    contains: ["gluten"],
  },
  {
    id: "tapioca-mamao",
    emojis: "🫓🧀🧡",
    title: [
      "Tapioca com queijo e mamão",
      "Tapioca crepe with cheese and papaya",
      "Tapioca con queso y papaya",
      "Crêpe de tapioca au fromage et papaye",
    ],
    items: [
      [
        "1 tapioca com queijo",
        "1 tapioca crepe with cheese",
        "1 tapioca con queso",
        "1 crêpe de tapioca au fromage",
      ],
      ["Mamão em cubos", "Papaya cubes", "Papaya en cubos", "Papaye en cubes"],
    ],
    contains: ["leite"],
  },
  {
    id: "cuscuz-ovo-banana",
    emojis: "🌽🥚🍌",
    title: [
      "Cuscuz de milho com ovo e banana",
      "Corn couscous with egg and banana",
      "Cuscús de maíz con huevo y plátano",
      "Couscous de maïs, œuf et banane",
    ],
    items: [
      [
        "1 pedaço de cuscuz de milho com ovo mexido",
        "1 piece of corn couscous with scrambled egg",
        "1 porción de cuscús de maíz con huevo revuelto",
        "1 part de couscous de maïs à l'œuf brouillé",
      ],
      ["1 banana", "1 banana", "1 plátano", "1 banane"],
    ],
    contains: ["ovo"],
  },
  {
    id: "batata-doce-queijo-tangerina",
    emojis: "🍠🧀🍊",
    title: [
      "Palitos de batata-doce, queijo e tangerina",
      "Sweet potato sticks, cheese and tangerine",
      "Bastones de batata, queso y mandarina",
      "Frites de patate douce au four, fromage et mandarine",
    ],
    items: [
      [
        "Batata-doce assada em palitos",
        "Baked sweet potato sticks",
        "Batata asada en bastones",
        "Patate douce rôtie en bâtonnets",
      ],
      ["Queijo em cubos", "Cheese cubes", "Queso en cubos", "Fromage en dés"],
      ["1 tangerina", "1 tangerine", "1 mandarina", "1 mandarine"],
    ],
    contains: ["leite"],
  },
  {
    id: "frutas-castanhas",
    emojis: "🍉🥝🌰",
    title: [
      "Salada de frutas com castanhas picadas",
      "Fruit salad with chopped nuts",
      "Ensalada de frutas con frutos secos picados",
      "Salade de fruits aux noix concassées",
    ],
    items: [
      [
        "Frutas picadas da estação",
        "Chopped seasonal fruit",
        "Fruta de temporada picada",
        "Fruits de saison coupés",
      ],
      [
        "1 colher de castanhas picadas",
        "1 spoon of chopped nuts",
        "1 cucharada de frutos secos picados",
        "1 cuillère de noix concassées",
      ],
    ],
    contains: ["castanhas"],
    minAge: 4,
  },
  {
    id: "panqueca-banana-morango",
    emojis: "🥞🍓",
    title: [
      "Panquequinhas de banana e aveia com morangos",
      "Banana-oat pancakes with strawberries",
      "Panqueques de plátano y avena con fresas",
      "Pancakes banane-avoine et fraises",
    ],
    items: [
      [
        "3 panquequinhas (banana, ovo e aveia)",
        "3 small pancakes (banana, egg and oats)",
        "3 panqueques (plátano, huevo y avena)",
        "3 petits pancakes (banane, œuf, avoine)",
      ],
      ["Morangos", "Strawberries", "Fresas", "Fraises"],
    ],
    contains: ["ovo", "gluten"],
  },
  {
    id: "wrap-humus-pepino",
    emojis: "🌯🥒",
    title: [
      "Wrap integral com homus e pepino",
      "Whole-grain wrap with hummus and cucumber",
      "Wrap integral con hummus y pepino",
      "Wrap complet houmous-concombre",
    ],
    items: [
      [
        "1 wrap integral com homus e pepino",
        "1 whole-grain wrap with hummus and cucumber",
        "1 wrap integral con hummus y pepino",
        "1 wrap complet houmous-concombre",
      ],
      ["1 fruta", "1 fruit", "1 fruta", "1 fruit"],
    ],
    contains: ["gluten"],
  },
  {
    id: "bolinho-arroz-melancia",
    emojis: "🍙🥒🍉",
    title: [
      "Bolinho de arroz assado, pepino e melancia",
      "Baked rice balls, cucumber and watermelon",
      "Croquetas de arroz al horno, pepino y sandía",
      "Boulettes de riz au four, concombre et pastèque",
    ],
    items: [
      [
        "3 bolinhos de arroz assados (sobra do almoço, ovo e queijo)",
        "3 baked rice balls (leftover rice, egg and cheese)",
        "3 croquetas de arroz al horno (arroz sobrante, huevo y queso)",
        "3 boulettes de riz au four (reste de riz, œuf, fromage)",
      ],
      ["Palitos de pepino", "Cucumber sticks", "Palitos de pepino", "Bâtonnets de concombre"],
      ["Melancia em cubos", "Watermelon cubes", "Sandía en cubos", "Pastèque en cubes"],
    ],
    contains: ["ovo", "leite"],
  },
  {
    id: "abacate-pao-laranja",
    emojis: "🥑🍞🍊",
    title: [
      "Pão com abacate amassado e laranja",
      "Bread with mashed avocado and orange",
      "Pan con aguacate machacado y naranja",
      "Pain à l'avocat écrasé et orange",
    ],
    items: [
      [
        "Pão integral com abacate amassado e limão",
        "Whole-grain bread with mashed avocado and lime",
        "Pan integral con aguacate machacado y limón",
        "Pain complet, avocat écrasé et citron vert",
      ],
      ["Laranja em gomos", "Orange segments", "Naranja en gajos", "Quartiers d'orange"],
    ],
    contains: ["gluten"],
  },
  {
    id: "grao-de-bico-maca",
    emojis: "🫘🍎",
    title: [
      "Grão-de-bico crocante e maçã",
      "Crunchy chickpeas and apple",
      "Garbanzos crujientes y manzana",
      "Pois chiches croustillants et pomme",
    ],
    items: [
      [
        "Grão-de-bico assado com azeite e páprica doce",
        "Roasted chickpeas with olive oil and sweet paprika",
        "Garbanzos asados con aceite y pimentón dulce",
        "Pois chiches rôtis, huile d'olive et paprika doux",
      ],
      ["1 maçã", "1 apple", "1 manzana", "1 pomme"],
    ],
    contains: [],
    minAge: 4,
  },
  {
    id: "muffin-legumes-uva",
    emojis: "🧁🥦🍇",
    title: [
      "Muffin salgado de legumes e uvas",
      "Savory veggie muffin and grapes",
      "Muffin salado de verduras y uvas",
      "Muffin salé aux légumes et raisins",
    ],
    items: [
      [
        "2 muffins de legumes (sobras de brócolis, cenoura, abobrinha)",
        "2 veggie muffins (leftover broccoli, carrot, zucchini)",
        "2 muffins de verduras (sobras de brócoli, zanahoria, calabacín)",
        "2 muffins aux légumes (restes de brocoli, carotte, courgette)",
      ],
      [
        "Uvas (cortadas ao meio para os pequenos)",
        "Grapes (halved for little ones)",
        "Uvas (cortadas por la mitad)",
        "Raisins (coupés en deux)",
      ],
    ],
    contains: ["gluten", "ovo", "leite"],
  },
  {
    id: "frutas-queijo-polvilho",
    emojis: "🍓🧀🥨",
    title: [
      "Frutas, queijo e biscoito de polvilho caseiro",
      "Fruit, cheese and homemade tapioca crackers",
      "Frutas, queso y galletas caseras de almidón",
      "Fruits, fromage et biscuits maison au tapioca",
    ],
    items: [
      ["Frutas picadas", "Chopped fruit", "Fruta picada", "Fruits coupés"],
      ["Queijo em cubos", "Cheese cubes", "Queso en cubos", "Fromage en dés"],
      [
        "Biscoito de polvilho caseiro",
        "Homemade tapioca crackers",
        "Galletas caseras de almidón",
        "Biscuits maison au tapioca",
      ],
    ],
    contains: ["leite"],
  },
  {
    id: "mandioca-frango-manga",
    emojis: "🌿🍗🥭",
    title: [
      "Mandioca cozida com frango e manga",
      "Boiled cassava with chicken and mango",
      "Yuca cocida con pollo y mango",
      "Manioc cuit, poulet et mangue",
    ],
    items: [
      [
        "Pedaços de mandioca cozida",
        "Boiled cassava pieces",
        "Trozos de yuca cocida",
        "Morceaux de manioc cuit",
      ],
      [
        "Frango desfiado temperado",
        "Seasoned shredded chicken",
        "Pollo desmenuzado sazonado",
        "Poulet effiloché assaisonné",
      ],
      ["Manga em cubos", "Mango cubes", "Mango en cubos", "Mangue en cubes"],
    ],
    contains: [],
  },
];

/** Ideias seguras para a criança: sem os alergênicos citados e adequadas à idade. */
export function safeIdeas(age: AgeRange, restrictionsText: string) {
  const avoid = new Set(allergensIn(restrictionsText));
  const minAge = Number(age.split("-")[0]);
  return LUNCH_IDEAS.filter(
    (i) => !i.contains.some((a) => avoid.has(a)) && (i.minAge ?? 0) <= minAge,
  );
}

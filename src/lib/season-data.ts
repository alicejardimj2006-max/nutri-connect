// Calendário da feira (N5): frutas, legumes e verduras da estação por região. Base: calendário de
// comercialização da CEAGESP (Sudeste), com ajustes por região e frutas regionais (Embrapa e
// Guia Alimentar). É uma referência aproximada: a safra muda com o clima de cada ano.
import type { Names } from "@/lib/appearance-data";

export type Region = "N" | "NE" | "CO" | "SE" | "S";
export type FoodKind = "fruta" | "legume" | "verdura";

export interface SeasonFood {
  id: string;
  emoji: string;
  kind: FoodKind;
  name: Names;
  /** Meses de safra (1 a 12) na referência (Sudeste e Centro-Oeste). */
  months: number[];
  /** Meses diferentes em alguma região. */
  regions?: Partial<Record<Region, number[]>>;
  /** Só aparece nestas regiões (fruta regional ou de clima frio). */
  only?: Region[];
  choose: Names;
  keep: Names;
  tip: Names;
}

const ALL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const REGION_NAMES: Record<Region, Names> = {
  N: ["Norte", "North", "Norte", "Nord"],
  NE: ["Nordeste", "Northeast", "Nordeste", "Nord-Est"],
  CO: ["Centro-Oeste", "Center-West", "Centro-Oeste", "Centre-Ouest"],
  SE: ["Sudeste", "Southeast", "Sudeste", "Sud-Est"],
  S: ["Sul", "South", "Sur", "Sud"],
};

export const UF_REGION: Record<string, Region> = {
  AC: "N",
  AP: "N",
  AM: "N",
  PA: "N",
  RO: "N",
  RR: "N",
  TO: "N",
  AL: "NE",
  BA: "NE",
  CE: "NE",
  MA: "NE",
  PB: "NE",
  PE: "NE",
  PI: "NE",
  RN: "NE",
  SE: "NE",
  DF: "CO",
  GO: "CO",
  MT: "CO",
  MS: "CO",
  ES: "SE",
  MG: "SE",
  RJ: "SE",
  SP: "SE",
  PR: "S",
  RS: "S",
  SC: "S",
};

export const UFS = Object.keys(UF_REGION).sort();

export const KIND_NAMES: Record<FoodKind, Names> = {
  fruta: ["Frutas", "Fruits", "Frutas", "Fruits"],
  legume: ["Legumes", "Vegetables", "Hortalizas", "Légumes"],
  verdura: ["Verduras", "Leafy greens", "Verduras de hoja", "Légumes-feuilles"],
};

export const MONTH_NAMES: Names[] = [
  ["Jan", "Jan", "Ene", "Janv"],
  ["Fev", "Feb", "Feb", "Févr"],
  ["Mar", "Mar", "Mar", "Mars"],
  ["Abr", "Apr", "Abr", "Avr"],
  ["Mai", "May", "May", "Mai"],
  ["Jun", "Jun", "Jun", "Juin"],
  ["Jul", "Jul", "Jul", "Juil"],
  ["Ago", "Aug", "Ago", "Août"],
  ["Set", "Sep", "Sep", "Sept"],
  ["Out", "Oct", "Oct", "Oct"],
  ["Nov", "Nov", "Nov", "Nov"],
  ["Dez", "Dec", "Dic", "Déc"],
];

export const SEASON_FOODS: SeasonFood[] = [
  // ───────────── Frutas ─────────────
  {
    id: "abacate",
    emoji: "🥑",
    kind: "fruta",
    name: ["Abacate", "Avocado", "Aguacate", "Avocat"],
    months: [2, 3, 4, 5, 6, 7, 8],
    choose: [
      "Casca firme, que cede um pouco ao apertar perto do cabo.",
      "Firm skin that gives a little near the stem.",
      "Cáscara firme que cede un poco cerca del tallo.",
      "Peau ferme qui cède un peu près de la queue.",
    ],
    keep: [
      "Amadurece fora da geladeira; depois de maduro, geladeira por até 3 dias.",
      "Ripens outside the fridge; once ripe, fridge for up to 3 days.",
      "Madura fuera de la nevera; ya maduro, nevera hasta 3 días.",
      "Mûrit hors du frigo ; mûr, au frigo jusqu'à 3 jours.",
    ],
    tip: [
      "Vai bem no salgado: guacamole, salada ou pasta no pão.",
      "Great savory too: guacamole, salads or spread on bread.",
      "También salado: guacamole, ensaladas o untado en pan.",
      "Aussi en salé : guacamole, salades ou tartiné.",
    ],
  },
  {
    id: "abacaxi",
    emoji: "🍍",
    kind: "fruta",
    name: ["Abacaxi", "Pineapple", "Piña", "Ananas"],
    months: [10, 11, 12, 1],
    regions: { N: [10, 11, 12, 1, 2], NE: [9, 10, 11, 12, 1] },
    choose: [
      "Perfumado na base e com a folha do meio saindo fácil.",
      "Fragrant at the base, with the center leaf pulling out easily.",
      "Perfumada en la base y con la hoja central que sale fácil.",
      "Parfumé à la base, la feuille centrale s'arrache facilement.",
    ],
    keep: [
      "Inteiro fora da geladeira por 2 dias; cortado, pote fechado na geladeira.",
      "Whole at room temperature for 2 days; cut, in a closed jar in the fridge.",
      "Entera a temperatura ambiente 2 días; cortada, en frasco cerrado en la nevera.",
      "Entier 2 jours à température ambiante ; coupé, en boîte au frigo.",
    ],
    tip: [
      "Ferva a casca com canela e cravo: vira um chá ou suco gostoso.",
      "Boil the peel with cinnamon and cloves for a tasty tea or juice.",
      "Hierve la cáscara con canela y clavo: sale un té o jugo rico.",
      "Faites bouillir l'écorce avec cannelle et girofle : une tisane délicieuse.",
    ],
  },
  {
    id: "acerola",
    emoji: "🍒",
    kind: "fruta",
    name: ["Acerola", "Acerola", "Acerola", "Acérola"],
    months: [11, 12, 1, 2, 3],
    regions: { NE: [1, 2, 3, 4, 5, 6, 7, 8, 11, 12] },
    choose: [
      "Bem vermelha e firme, sem partes moles.",
      "Deep red and firm, with no soft spots.",
      "Bien roja y firme, sin partes blandas.",
      "Bien rouge et ferme, sans parties molles.",
    ],
    keep: [
      "Estraga rápido: use em 2 dias ou congele lavada e seca.",
      "Spoils fast: use within 2 days or freeze washed and dried.",
      "Se estropea rápido: úsala en 2 días o congélala lavada y seca.",
      "S'abîme vite : 2 jours, ou congelez lavée et séchée.",
    ],
    tip: [
      "Congelada, rende suco a semana toda.",
      "Frozen, it makes juice all week.",
      "Congelada, rinde jugo toda la semana.",
      "Congelée, elle donne du jus toute la semaine.",
    ],
  },
  {
    id: "banana",
    emoji: "🍌",
    kind: "fruta",
    name: ["Banana", "Banana", "Plátano", "Banane"],
    months: ALL,
    choose: [
      "Compre em pencas com pontos de maturação diferentes para durar a semana.",
      "Buy bunches at different ripeness so they last the week.",
      "Compra racimos en distintos puntos para que duren la semana.",
      "Prenez des régimes à maturités différentes pour toute la semaine.",
    ],
    keep: [
      "Fora da geladeira; madura demais, descasque e congele.",
      "Outside the fridge; overripe, peel and freeze.",
      "Fuera de la nevera; muy madura, pélala y congélala.",
      "Hors du frigo ; trop mûre, épluchez et congelez.",
    ],
    tip: [
      "A casca bem lavada vira farofa ou 'carne louca' de casca de banana.",
      "Well-washed peels become farofa or a pulled 'meat' filling.",
      "La cáscara bien lavada sirve para farofa o un relleno desmechado.",
      "La peau bien lavée devient farofa ou une farce effilochée.",
    ],
  },
  {
    id: "caju",
    emoji: "🍎",
    kind: "fruta",
    name: ["Caju", "Cashew apple", "Marañón", "Pomme de cajou"],
    months: [9, 10, 11, 12],
    regions: { NE: [8, 9, 10, 11, 12] },
    only: ["N", "NE", "CO", "SE"],
    choose: [
      "Inteiro, perfumado e sem machucados.",
      "Whole, fragrant and unbruised.",
      "Entero, perfumado y sin golpes.",
      "Entier, parfumé et sans meurtrissures.",
    ],
    keep: [
      "Geladeira por até 3 dias; a polpa congela bem.",
      "Fridge for up to 3 days; the pulp freezes well.",
      "Nevera hasta 3 días; la pulpa se congela bien.",
      "Frigo jusqu'à 3 jours ; la pulpe se congèle bien.",
    ],
    tip: [
      "O bagaço do suco vira 'carne de caju' refogada com temperos.",
      "Juice pulp becomes sautéed 'cashew meat' with seasonings.",
      "El bagazo del jugo se vuelve 'carne de marañón' salteada.",
      "La pulpe pressée devient une 'viande de cajou' sautée.",
    ],
  },
  {
    id: "caqui",
    emoji: "🟠",
    kind: "fruta",
    name: ["Caqui", "Persimmon", "Caqui", "Kaki"],
    months: [3, 4, 5, 6],
    only: ["SE", "S", "CO"],
    choose: [
      "Casca lisa e brilhante; o mole é para comer logo, o firme dura mais.",
      "Smooth, shiny skin; soft ones to eat now, firm ones last longer.",
      "Piel lisa y brillante; el blando para ya, el firme dura más.",
      "Peau lisse et brillante ; mou à manger vite, ferme se garde.",
    ],
    keep: [
      "Fora da geladeira até amadurecer; depois, geladeira.",
      "Room temperature until ripe; then the fridge.",
      "Fuera de la nevera hasta madurar; luego, nevera.",
      "À température ambiante jusqu'à maturité, puis au frigo.",
    ],
    tip: [
      "Bem maduro, vira doce de colher sem açúcar.",
      "Very ripe, it's a sugar-free spoon dessert.",
      "Muy maduro, es un postre de cuchara sin azúcar.",
      "Très mûr, c'est un dessert à la cuillère sans sucre.",
    ],
  },
  {
    id: "cupuacu",
    emoji: "🟤",
    kind: "fruta",
    name: ["Cupuaçu", "Cupuaçu", "Copoazú", "Cupuaçu"],
    months: [1, 2, 3, 4],
    only: ["N"],
    choose: [
      "Perfume forte e casca sem rachaduras.",
      "Strong scent and an uncracked shell.",
      "Aroma fuerte y cáscara sin grietas.",
      "Parfum intense, coque sans fissures.",
    ],
    keep: [
      "A polpa congela por meses em porções.",
      "The pulp freezes for months in portions.",
      "La pulpa se congela por meses en porciones.",
      "La pulpe se congèle des mois en portions.",
    ],
    tip: [
      "Polpa com leite ou iogurte vira creme sem precisar de muito açúcar.",
      "Pulp with milk or yogurt makes a cream with little sugar.",
      "La pulpa con leche o yogur da una crema con poco azúcar.",
      "La pulpe avec lait ou yaourt donne une crème peu sucrée.",
    ],
  },
  {
    id: "acai",
    emoji: "🫐",
    kind: "fruta",
    name: ["Açaí", "Açaí", "Asaí", "Açaí"],
    months: [8, 9, 10, 11, 12],
    only: ["N"],
    choose: [
      "Prefira batedores com selo de boas práticas (higiene evita doenças).",
      "Choose vendors with hygiene certification (it prevents illness).",
      "Elige vendedores con sello de buenas prácticas de higiene.",
      "Choisissez des vendeurs certifiés pour l'hygiène.",
    ],
    keep: [
      "Batido, geladeira no mesmo dia ou congelado.",
      "Once processed, fridge the same day or freeze.",
      "Procesado, nevera el mismo día o congelado.",
      "Préparé, frigo le jour même ou congélateur.",
    ],
    tip: [
      "No Norte, vai com peixe e farinha no almoço, sem açúcar.",
      "In the North it's eaten with fish and manioc flour, unsweetened.",
      "En el Norte se come con pescado y harina, sin azúcar.",
      "Au Nord, il accompagne poisson et farine, sans sucre.",
    ],
  },
  {
    id: "goiaba",
    emoji: "🍐",
    kind: "fruta",
    name: ["Goiaba", "Guava", "Guayaba", "Goyave"],
    months: [1, 2, 3, 4],
    choose: [
      "Perfumada e cedendo levemente ao toque.",
      "Fragrant and slightly yielding.",
      "Perfumada y que cede un poco al tacto.",
      "Parfumée et légèrement souple.",
    ],
    keep: [
      "Madura, geladeira por até 4 dias.",
      "Ripe, fridge for up to 4 days.",
      "Madura, nevera hasta 4 días.",
      "Mûre, frigo jusqu'à 4 jours.",
    ],
    tip: [
      "Coma com casca: é onde está boa parte das fibras.",
      "Eat the skin: that's where much of the fiber is.",
      "Cómela con cáscara: ahí está gran parte de la fibra.",
      "Mangez la peau : elle concentre les fibres.",
    ],
  },
  {
    id: "jabuticaba",
    emoji: "🫐",
    kind: "fruta",
    name: ["Jabuticaba", "Jabuticaba", "Jaboticaba", "Jaboticaba"],
    months: [9, 10, 11],
    only: ["SE", "CO", "S"],
    choose: [
      "Brilhantes, firmes e sem rachaduras.",
      "Shiny, firm and uncracked.",
      "Brillantes, firmes y sin grietas.",
      "Brillantes, fermes, sans fissures.",
    ],
    keep: [
      "Fermenta rápido: use em 2 dias.",
      "Ferments fast: use within 2 days.",
      "Fermenta rápido: úsala en 2 días.",
      "Fermente vite : 2 jours maximum.",
    ],
    tip: [
      "As cascas viram geleia ou molho para carnes.",
      "Skins make jam or a sauce for meats.",
      "Las cáscaras se vuelven mermelada o salsa para carnes.",
      "Les peaux donnent confiture ou sauce pour viandes.",
    ],
  },
  {
    id: "laranja",
    emoji: "🍊",
    kind: "fruta",
    name: ["Laranja", "Orange", "Naranja", "Orange"],
    months: [5, 6, 7, 8, 9, 10, 11],
    choose: [
      "Pesada para o tamanho (sinal de suco).",
      "Heavy for its size (a sign of juice).",
      "Pesada para su tamaño (señal de jugo).",
      "Lourde pour sa taille (signe de jus).",
    ],
    keep: [
      "Fora da geladeira por 1 semana; na geladeira, 2 a 3.",
      "A week at room temperature; 2 to 3 in the fridge.",
      "Una semana fuera; 2 a 3 en la nevera.",
      "Une semaine à l'air libre ; 2 à 3 au frigo.",
    ],
    tip: [
      "Chupe ou coma em gomos: a fruta inteira sacia mais que o suco.",
      "Eat it in segments: whole fruit fills you more than juice.",
      "Cómela en gajos: la fruta entera sacia más que el jugo.",
      "Mangez-la en quartiers : plus rassasiant que le jus.",
    ],
  },
  {
    id: "limao",
    emoji: "🍋",
    kind: "fruta",
    name: ["Limão", "Lime", "Lima", "Citron vert"],
    months: [12, 1, 2, 3, 4],
    choose: [
      "Casca fina, lisa e brilhante (mais suco).",
      "Thin, smooth, shiny skin (more juice).",
      "Cáscara fina, lisa y brillante (más jugo).",
      "Peau fine, lisse et brillante (plus de jus).",
    ],
    keep: [
      "Geladeira em saco fechado por até 3 semanas.",
      "Fridge in a closed bag for up to 3 weeks.",
      "Nevera en bolsa cerrada hasta 3 semanas.",
      "Frigo en sac fermé jusqu'à 3 semaines.",
    ],
    tip: [
      "Rale a casca antes de espremer e congele as raspas para temperar.",
      "Zest before squeezing and freeze the zest for seasoning.",
      "Ralla la cáscara antes de exprimir y congela la ralladura.",
      "Râpez le zeste avant de presser et congelez-le.",
    ],
  },
  {
    id: "maca",
    emoji: "🍎",
    kind: "fruta",
    name: ["Maçã", "Apple", "Manzana", "Pomme"],
    months: [2, 3, 4, 5],
    choose: [
      "Firme, sem manchas escuras ou partes moles.",
      "Firm, with no dark spots or soft parts.",
      "Firme, sin manchas oscuras ni partes blandas.",
      "Ferme, sans taches ni parties molles.",
    ],
    keep: [
      "Geladeira, longe das verduras (ela acelera o amadurecimento).",
      "Fridge, away from greens (it speeds ripening).",
      "Nevera, lejos de las verduras (acelera la maduración).",
      "Frigo, loin des légumes-feuilles (elle accélère le mûrissement).",
    ],
    tip: [
      "Cascas e miolos fervidos com canela viram chá.",
      "Boiled peels and cores with cinnamon make tea.",
      "Cáscaras y corazones hervidos con canela dan un té.",
      "Peaux et trognons bouillis avec cannelle : une tisane.",
    ],
  },
  {
    id: "mamao",
    emoji: "🧡",
    kind: "fruta",
    name: ["Mamão", "Papaya", "Papaya", "Papaye"],
    months: [8, 9, 10, 11, 12],
    regions: { NE: ALL, N: ALL },
    choose: [
      "Com listras amarelas para comer em poucos dias.",
      "With yellow streaks to eat within a few days.",
      "Con rayas amarillas para comer en pocos días.",
      "Avec des stries jaunes pour quelques jours.",
    ],
    keep: [
      "Amadurece fora; maduro, geladeira por até 5 dias.",
      "Ripens outside; ripe, fridge for up to 5 days.",
      "Madura fuera; ya madura, nevera hasta 5 días.",
      "Mûrit dehors ; mûre, frigo jusqu'à 5 jours.",
    ],
    tip: [
      "Mamão verde ralado vira refogado ou doce.",
      "Grated green papaya becomes a sauté or a sweet.",
      "La papaya verde rallada se saltea o se hace dulce.",
      "La papaye verte râpée se fait sautée ou en confiserie.",
    ],
  },
  {
    id: "manga",
    emoji: "🥭",
    kind: "fruta",
    name: ["Manga", "Mango", "Mango", "Mangue"],
    months: [10, 11, 12, 1],
    regions: { NE: [9, 10, 11, 12, 1] },
    choose: [
      "Perfumada perto do cabo e cedendo levemente.",
      "Fragrant near the stem and slightly yielding.",
      "Perfumado cerca del tallo y que cede un poco.",
      "Parfumée près de la queue et légèrement souple.",
    ],
    keep: [
      "Amadurece fora; madura, geladeira por 3 a 5 dias.",
      "Ripens outside; ripe, fridge for 3 to 5 days.",
      "Madura fuera; maduro, nevera de 3 a 5 días.",
      "Mûrit dehors ; mûre, frigo 3 à 5 jours.",
    ],
    tip: [
      "Manga verde vira salada ou chutney.",
      "Green mango makes salad or chutney.",
      "El mango verde sirve para ensalada o chutney.",
      "La mangue verte donne salade ou chutney.",
    ],
  },
  {
    id: "maracuja",
    emoji: "💛",
    kind: "fruta",
    name: ["Maracujá", "Passion fruit", "Maracuyá", "Fruit de la passion"],
    months: [12, 1, 2, 3, 4],
    choose: [
      "Pesado e com a casca começando a enrugar (mais doce).",
      "Heavy, with skin starting to wrinkle (sweeter).",
      "Pesado y con la cáscara empezando a arrugarse (más dulce).",
      "Lourd, la peau commence à se rider (plus sucré).",
    ],
    keep: [
      "Geladeira por 1 semana; a polpa congela bem.",
      "Fridge for a week; the pulp freezes well.",
      "Nevera una semana; la pulpa se congela bien.",
      "Frigo une semaine ; la pulpe se congèle bien.",
    ],
    tip: [
      "A parte branca da casca, cozida, vira farinha ou doce.",
      "The white pith, cooked, becomes flour or a sweet.",
      "La parte blanca de la cáscara, cocida, da harina o dulce.",
      "La partie blanche de l'écorce, cuite, donne farine ou confiserie.",
    ],
  },
  {
    id: "melancia",
    emoji: "🍉",
    kind: "fruta",
    name: ["Melancia", "Watermelon", "Sandía", "Pastèque"],
    months: [10, 11, 12, 1, 2],
    choose: [
      "Som oco ao bater e mancha amarela onde encostou no chão.",
      "Hollow sound when tapped and a yellow ground spot.",
      "Sonido hueco al golpear y mancha amarilla donde tocó el suelo.",
      "Son creux et tache jaune côté sol.",
    ],
    keep: [
      "Cortada, coberta na geladeira por até 4 dias.",
      "Cut, covered in the fridge for up to 4 days.",
      "Cortada, tapada en la nevera hasta 4 días.",
      "Coupée, couverte au frigo jusqu'à 4 jours.",
    ],
    tip: [
      "A parte branca vira refogado ou doce de casca de melancia.",
      "The white rind makes a sauté or candied rind.",
      "La parte blanca se saltea o se hace dulce de cáscara.",
      "L'écorce blanche se fait sautée ou confite.",
    ],
  },
  {
    id: "morango",
    emoji: "🍓",
    kind: "fruta",
    name: ["Morango", "Strawberry", "Fresa", "Fraise"],
    months: [6, 7, 8, 9, 10],
    regions: { S: [8, 9, 10, 11, 12] },
    only: ["SE", "S", "CO"],
    choose: [
      "Bem vermelho até o cabo, brilhante e sem mofo.",
      "Red up to the stem, shiny and mold-free.",
      "Bien rojo hasta el tallo, brillante y sin moho.",
      "Rouge jusqu'à la queue, brillant, sans moisissure.",
    ],
    keep: [
      "Geladeira sem lavar; lave só na hora de comer.",
      "Fridge unwashed; wash only right before eating.",
      "Nevera sin lavar; lávalo solo al comer.",
      "Frigo sans laver ; lavez juste avant de manger.",
    ],
    tip: [
      "Os cabinhos dão sabor à água gelada.",
      "The tops flavor iced water.",
      "Los tallitos dan sabor al agua fría.",
      "Les queues parfument l'eau fraîche.",
    ],
  },
  {
    id: "pequi",
    emoji: "🟡",
    kind: "fruta",
    name: ["Pequi", "Pequi", "Pequi", "Pequi"],
    months: [10, 11, 12, 1],
    only: ["CO", "SE", "NE"],
    choose: [
      "Caroços inteiros, amarelos e perfumados.",
      "Whole, yellow, fragrant pits.",
      "Carozos enteros, amarillos y perfumados.",
      "Noyaux entiers, jaunes et parfumés.",
    ],
    keep: [
      "Congele os caroços para usar o ano todo.",
      "Freeze the pits to use all year.",
      "Congela los carozos para usarlos todo el año.",
      "Congelez les noyaux pour toute l'année.",
    ],
    tip: [
      "Roa com cuidado: tem espinhos por dentro. Vai no arroz e no frango.",
      "Gnaw gently: it has spines inside. Great with rice and chicken.",
      "Muérdelo con cuidado: tiene espinas. Va con arroz y pollo.",
      "Rongez doucement : épines à l'intérieur. Avec riz et poulet.",
    ],
  },
  {
    id: "pessego",
    emoji: "🍑",
    kind: "fruta",
    name: ["Pêssego", "Peach", "Durazno", "Pêche"],
    months: [10, 11, 12],
    regions: { S: [11, 12, 1] },
    only: ["SE", "S"],
    choose: [
      "Perfumado e cedendo levemente ao toque.",
      "Fragrant and slightly yielding.",
      "Perfumado y que cede un poco.",
      "Parfumée et légèrement souple.",
    ],
    keep: [
      "Amadurece fora; maduro, geladeira por 3 dias.",
      "Ripens outside; ripe, fridge for 3 days.",
      "Madura fuera; maduro, nevera 3 días.",
      "Mûrit dehors ; mûre, frigo 3 jours.",
    ],
    tip: [
      "Assado com canela vira sobremesa sem açúcar.",
      "Baked with cinnamon it's a sugar-free dessert.",
      "Asado con canela es un postre sin azúcar.",
      "Rôtie à la cannelle : dessert sans sucre.",
    ],
  },
  {
    id: "tangerina",
    emoji: "🍊",
    kind: "fruta",
    name: ["Tangerina (mexerica, bergamota)", "Tangerine", "Mandarina", "Mandarine"],
    months: [4, 5, 6, 7],
    regions: { S: [5, 6, 7, 8] },
    choose: [
      "Pesada, com casca brilhante e solta.",
      "Heavy, with shiny, loose skin.",
      "Pesada, con cáscara brillante y suelta.",
      "Lourde, peau brillante et lâche.",
    ],
    keep: [
      "Geladeira por até 2 semanas.",
      "Fridge for up to 2 weeks.",
      "Nevera hasta 2 semanas.",
      "Frigo jusqu'à 2 semaines.",
    ],
    tip: [
      "Casca seca ao sol perfuma chás e bolos.",
      "Sun-dried peel flavors teas and cakes.",
      "La cáscara secada al sol perfuma tés y pasteles.",
      "L'écorce séchée parfume tisanes et gâteaux.",
    ],
  },
  {
    id: "umbu",
    emoji: "🟢",
    kind: "fruta",
    name: ["Umbu", "Umbu", "Umbú", "Umbu"],
    months: [1, 2, 3],
    only: ["NE"],
    choose: [
      "Verde-amarelado, firme e perfumado.",
      "Yellowish green, firm and fragrant.",
      "Verde amarillento, firme y perfumado.",
      "Vert-jaune, ferme et parfumé.",
    ],
    keep: [
      "Geladeira por poucos dias; a polpa congela bem.",
      "Fridge for a few days; the pulp freezes well.",
      "Nevera pocos días; la pulpa se congela bien.",
      "Quelques jours au frigo ; la pulpe se congèle.",
    ],
    tip: [
      "Umbuzada (com leite) é um lanche tradicional do sertão.",
      "Umbuzada (with milk) is a traditional backland snack.",
      "La umbuzada (con leche) es una merienda tradicional.",
      "L'umbuzada (au lait) est un goûter traditionnel.",
    ],
  },
  {
    id: "uva",
    emoji: "🍇",
    kind: "fruta",
    name: ["Uva", "Grapes", "Uva", "Raisin"],
    months: [12, 1, 2, 3],
    regions: { NE: [5, 6, 7, 10, 11, 12] },
    choose: [
      "Cachos com cabinho verde e bagas presas.",
      "Bunches with green stems and attached berries.",
      "Racimos con tallo verde y granos firmes.",
      "Grappes à tige verte et grains bien attachés.",
    ],
    keep: [
      "Geladeira sem lavar por até 1 semana.",
      "Fridge unwashed for up to a week.",
      "Nevera sin lavar hasta una semana.",
      "Frigo sans laver jusqu'à une semaine.",
    ],
    tip: [
      "Congeladas viram um docinho gelado.",
      "Frozen, they're an icy treat.",
      "Congeladas son un dulce helado.",
      "Congelés, c'est une friandise glacée.",
    ],
  },

  // ───────────── Legumes ─────────────
  {
    id: "abobora",
    emoji: "🎃",
    kind: "legume",
    name: ["Abóbora", "Pumpkin", "Calabaza", "Potiron"],
    months: [1, 2, 3, 4, 5],
    regions: { NE: ALL, N: ALL },
    choose: [
      "Casca dura, sem rachaduras, com o cabo seco.",
      "Hard skin, no cracks, dry stem.",
      "Cáscara dura, sin grietas y con el tallo seco.",
      "Peau dure, sans fissures, queue sèche.",
    ],
    keep: [
      "Inteira, semanas em lugar fresco; cortada, geladeira por 5 dias.",
      "Whole, weeks in a cool place; cut, fridge for 5 days.",
      "Entera, semanas en lugar fresco; cortada, nevera 5 días.",
      "Entière, des semaines au frais ; coupée, 5 jours au frigo.",
    ],
    tip: [
      "Sementes torradas com sal viram petisco; a casca pode ir junto no cozido.",
      "Roast the seeds for a snack; the skin can cook with the flesh.",
      "Tuesta las semillas para picar; la cáscara se cocina junto.",
      "Graines grillées en en-cas ; la peau cuit avec la chair.",
    ],
  },
  {
    id: "abobrinha",
    emoji: "🥒",
    kind: "legume",
    name: ["Abobrinha", "Zucchini", "Calabacín", "Courgette"],
    months: [9, 10, 11, 12, 1],
    choose: [
      "Pequena a média, firme e com casca brilhante.",
      "Small to medium, firm, with shiny skin.",
      "Pequeño a mediano, firme y de piel brillante.",
      "Petite à moyenne, ferme, peau brillante.",
    ],
    keep: [
      "Geladeira na gaveta por até 5 dias.",
      "Crisper drawer for up to 5 days.",
      "Cajón de la nevera hasta 5 días.",
      "Bac à légumes jusqu'à 5 jours.",
    ],
    tip: [
      "Ralada crua vai em bolinhos, omeletes e massas.",
      "Grated raw it goes into fritters, omelettes and pasta.",
      "Rallado crudo va en buñuelos, tortillas y pastas.",
      "Râpée crue : galettes, omelettes et pâtes.",
    ],
  },
  {
    id: "batata-doce",
    emoji: "🍠",
    kind: "legume",
    name: ["Batata-doce", "Sweet potato", "Batata", "Patate douce"],
    months: [3, 4, 5, 6, 7, 8],
    choose: [
      "Firme, sem brotos nem partes moles.",
      "Firm, with no sprouts or soft parts.",
      "Firme, sin brotes ni partes blandas.",
      "Ferme, sans germes ni parties molles.",
    ],
    keep: [
      "Fora da geladeira, em lugar seco e escuro.",
      "Outside the fridge, in a dry, dark place.",
      "Fuera de la nevera, en lugar seco y oscuro.",
      "Hors du frigo, au sec et à l'ombre.",
    ],
    tip: [
      "Asse com casca, bem lavada: fica mais saborosa.",
      "Roast it skin-on, well washed: tastier.",
      "Ásala con cáscara, bien lavada: más sabrosa.",
      "Rôtie avec la peau, bien lavée : plus savoureuse.",
    ],
  },
  {
    id: "berinjela",
    emoji: "🍆",
    kind: "legume",
    name: ["Berinjela", "Eggplant", "Berenjena", "Aubergine"],
    months: [10, 11, 12, 1, 2, 3],
    choose: [
      "Pesada, brilhante e com o cabo verde.",
      "Heavy, shiny, with a green stem.",
      "Pesada, brillante y con el tallo verde.",
      "Lourde, brillante, queue verte.",
    ],
    keep: [
      "Geladeira por até 5 dias.",
      "Fridge for up to 5 days.",
      "Nevera hasta 5 días.",
      "Frigo jusqu'à 5 jours.",
    ],
    tip: [
      "Assada inteira na chama vira pastinha (babaganuche).",
      "Charred whole it becomes a dip (baba ganoush).",
      "Asada entera a la llama se hace pasta (babaganush).",
      "Grillée entière, elle devient caviar d'aubergine.",
    ],
  },
  {
    id: "beterraba",
    emoji: "🟣",
    kind: "legume",
    name: ["Beterraba", "Beetroot", "Remolacha", "Betterave"],
    months: [6, 7, 8, 9, 10],
    choose: [
      "Firme, lisa e com folhas viçosas.",
      "Firm, smooth, with fresh leaves.",
      "Firme, lisa y con hojas frescas.",
      "Ferme, lisse, aux feuilles fraîches.",
    ],
    keep: [
      "Separe as folhas; raiz na geladeira por até 2 semanas.",
      "Remove the leaves; root in the fridge for up to 2 weeks.",
      "Separa las hojas; la raíz en la nevera hasta 2 semanas.",
      "Ôtez les fanes ; racine au frigo 2 semaines.",
    ],
    tip: [
      "Folhas e talos refogados com alho são uma delícia.",
      "Leaves and stems sautéed with garlic are delicious.",
      "Hojas y tallos salteados con ajo son deliciosos.",
      "Fanes et tiges sautées à l'ail : un régal.",
    ],
  },
  {
    id: "cenoura",
    emoji: "🥕",
    kind: "legume",
    name: ["Cenoura", "Carrot", "Zanahoria", "Carotte"],
    months: [6, 7, 8, 9, 10, 11],
    choose: [
      "Firme, lisa e de cor viva.",
      "Firm, smooth and brightly colored.",
      "Firme, lisa y de color vivo.",
      "Ferme, lisse, couleur vive.",
    ],
    keep: [
      "Sem as ramas, na geladeira por até 3 semanas.",
      "Without tops, in the fridge for up to 3 weeks.",
      "Sin las hojas, en la nevera hasta 3 semanas.",
      "Sans fanes, au frigo jusqu'à 3 semaines.",
    ],
    tip: [
      "As ramas viram pesto, bolinho ou vão no arroz.",
      "The tops make pesto, fritters or go into rice.",
      "Las hojas se hacen pesto, buñuelos o van en el arroz.",
      "Les fanes : pesto, galettes ou dans le riz.",
    ],
  },
  {
    id: "chuchu",
    emoji: "🫛",
    kind: "legume",
    name: ["Chuchu", "Chayote", "Chayote", "Chayote"],
    months: [4, 5, 6, 7, 8, 9],
    choose: [
      "Verde-claro, firme e sem brotos.",
      "Light green, firm, unsprouted.",
      "Verde claro, firme y sin brotes.",
      "Vert clair, ferme, sans germe.",
    ],
    keep: [
      "Geladeira por até 2 semanas.",
      "Fridge for up to 2 weeks.",
      "Nevera hasta 2 semanas.",
      "Frigo jusqu'à 2 semaines.",
    ],
    tip: [
      "Pega o sabor do tempero: ótimo em refogados e suflês.",
      "It takes on seasonings: great sautéed or in soufflés.",
      "Toma el sabor del aliño: ideal salteado o en suflé.",
      "Il prend les saveurs : parfait sauté ou en soufflé.",
    ],
  },
  {
    id: "inhame",
    emoji: "🥔",
    kind: "legume",
    name: ["Inhame", "Taro", "Ñame", "Taro"],
    months: [4, 5, 6, 7, 8, 9],
    choose: [
      "Firme, sem mofo nem partes moles.",
      "Firm, with no mold or soft parts.",
      "Firme, sin moho ni partes blandas.",
      "Ferme, sans moisissure ni partie molle.",
    ],
    keep: [
      "Lugar seco e arejado, fora da geladeira.",
      "Dry, airy place, outside the fridge.",
      "Lugar seco y aireado, fuera de la nevera.",
      "Au sec et aéré, hors du frigo.",
    ],
    tip: [
      "Cozido e amassado substitui a batata em purês e caldos.",
      "Boiled and mashed it replaces potato in purées and soups.",
      "Cocido y majado reemplaza la papa en purés y caldos.",
      "Cuit et écrasé, il remplace la pomme de terre.",
    ],
  },
  {
    id: "mandioca",
    emoji: "🌿",
    kind: "legume",
    name: ["Mandioca (aipim, macaxeira)", "Cassava", "Yuca", "Manioc"],
    months: [3, 4, 5, 6, 7, 8],
    regions: { N: ALL, NE: ALL },
    choose: [
      "Casca que solta fácil e polpa branca, sem riscos escuros.",
      "Peel that comes off easily and white flesh, no dark streaks.",
      "Cáscara que sale fácil y pulpa blanca, sin vetas oscuras.",
      "Peau qui se détache et chair blanche, sans stries.",
    ],
    keep: [
      "Descascada, congele em porções (dura meses).",
      "Peeled, freeze in portions (keeps for months).",
      "Pelada, congélala en porciones (dura meses).",
      "Épluché, congelez en portions (des mois).",
    ],
    tip: [
      "Cozida, vira purê, escondidinho e bolinho.",
      "Boiled, it becomes purée, bakes and fritters.",
      "Cocida, se hace puré, pastel y buñuelos.",
      "Cuit, il donne purée, gratins et beignets.",
    ],
  },
  {
    id: "milho",
    emoji: "🌽",
    kind: "legume",
    name: ["Milho verde", "Sweet corn", "Maíz tierno", "Maïs doux"],
    months: [12, 1, 2, 3, 4],
    regions: { NE: [5, 6, 7] },
    choose: [
      "Palha verde e grãos que soltam leite ao apertar.",
      "Green husk and kernels that release milk when pressed.",
      "Hojas verdes y granos que sueltan leche al apretar.",
      "Feuilles vertes, grains laiteux à la pression.",
    ],
    keep: [
      "Use logo; debulhado, congela bem.",
      "Use soon; kernels freeze well.",
      "Úsalo pronto; desgranado se congela bien.",
      "À utiliser vite ; égrené, il se congèle.",
    ],
    tip: [
      "O sabugo cozido dá um caldo para sopas e risotos.",
      "Boiled cobs make a stock for soups and risottos.",
      "La mazorca hervida da un caldo para sopas.",
      "Les épis bouillis donnent un bouillon.",
    ],
  },
  {
    id: "pepino",
    emoji: "🥒",
    kind: "legume",
    name: ["Pepino", "Cucumber", "Pepino", "Concombre"],
    months: [10, 11, 12, 1, 2, 3],
    choose: [
      "Firme, verde-escuro e sem partes amareladas.",
      "Firm, dark green, no yellowing.",
      "Firme, verde oscuro y sin partes amarillas.",
      "Ferme, vert foncé, sans jaunissement.",
    ],
    keep: [
      "Geladeira por até 1 semana.",
      "Fridge for up to a week.",
      "Nevera hasta una semana.",
      "Frigo jusqu'à une semaine.",
    ],
    tip: [
      "Em conserva rápida (vinagre, água e sal) dura dias a mais.",
      "Quick-pickled (vinegar, water, salt) it lasts days longer.",
      "En encurtido rápido dura días más.",
      "En pickles rapides, il se garde plus longtemps.",
    ],
  },
  {
    id: "pimentao",
    emoji: "🫑",
    kind: "legume",
    name: ["Pimentão", "Bell pepper", "Pimiento", "Poivron"],
    months: [10, 11, 12, 1, 2, 3],
    choose: [
      "Firme, brilhante e sem rugas.",
      "Firm, shiny and unwrinkled.",
      "Firme, brillante y sin arrugas.",
      "Ferme, brillant, sans rides.",
    ],
    keep: [
      "Geladeira por até 1 semana.",
      "Fridge for up to a week.",
      "Nevera hasta una semana.",
      "Frigo jusqu'à une semaine.",
    ],
    tip: [
      "Assado e sem pele, fica doce e dura dias no azeite.",
      "Roasted and peeled, it turns sweet and keeps in olive oil.",
      "Asado y pelado se vuelve dulce y dura en aceite.",
      "Rôti et pelé, il devient doux et se garde à l'huile.",
    ],
  },
  {
    id: "quiabo",
    emoji: "🌱",
    kind: "legume",
    name: ["Quiabo", "Okra", "Quimbombó", "Gombo"],
    months: [11, 12, 1, 2, 3],
    regions: { NE: ALL, N: ALL },
    choose: [
      "Pequeno e com a ponta que quebra fácil (é novinho).",
      "Small, with a tip that snaps easily (it's young).",
      "Pequeño y con la punta que se quiebra fácil.",
      "Petit, la pointe se casse net (il est jeune).",
    ],
    keep: [
      "Seco, na geladeira, por até 4 dias.",
      "Dry, in the fridge, for up to 4 days.",
      "Seco, en la nevera, hasta 4 días.",
      "Sec, au frigo, jusqu'à 4 jours.",
    ],
    tip: [
      "Refogue em fogo alto, sem tampa, e com um fio de limão: não fica babento.",
      "Sauté on high heat, uncovered, with lemon: no slime.",
      "Saltea a fuego alto, sin tapa y con limón: no babea.",
      "À feu vif, sans couvercle, avec citron : pas gluant.",
    ],
  },
  {
    id: "tomate",
    emoji: "🍅",
    kind: "legume",
    name: ["Tomate", "Tomato", "Tomate", "Tomate"],
    months: [7, 8, 9, 10, 11],
    choose: [
      "Vermelho e firme para hoje; meio verde para a semana.",
      "Red and firm for today; half green for the week.",
      "Rojo y firme para hoy; medio verde para la semana.",
      "Rouge et ferme pour aujourd'hui ; mi-vert pour la semaine.",
    ],
    keep: [
      "Fora da geladeira até amadurecer (mantém o sabor).",
      "Outside the fridge until ripe (keeps the flavor).",
      "Fuera de la nevera hasta madurar (conserva el sabor).",
      "Hors du frigo jusqu'à maturité (garde le goût).",
    ],
    tip: [
      "Maduro demais? Vira molho caseiro para congelar.",
      "Overripe? Make homemade sauce to freeze.",
      "¿Muy maduro? Haz salsa casera para congelar.",
      "Trop mûres ? Une sauce maison à congeler.",
    ],
  },
  {
    id: "vagem",
    emoji: "🫛",
    kind: "legume",
    name: ["Vagem", "Green beans", "Judías verdes", "Haricots verts"],
    months: [8, 9, 10, 11],
    choose: [
      "Verde viva e que quebra com um estalo.",
      "Bright green, snapping crisply.",
      "Verde vivo y que se quiebra con un chasquido.",
      "Vert vif, cassant net.",
    ],
    keep: [
      "Geladeira por até 5 dias; branqueada, congela bem.",
      "Fridge for up to 5 days; blanched, it freezes well.",
      "Nevera hasta 5 días; blanqueada se congela bien.",
      "Frigo 5 jours ; blanchis, ils se congèlent.",
    ],
    tip: [
      "Cozinhe só até ficar verde-brilhante: fica crocante e bonita.",
      "Cook just until bright green: crisp and pretty.",
      "Cocina solo hasta verde brillante: queda crujiente.",
      "Cuisez juste jusqu'au vert vif : croquants.",
    ],
  },

  // ───────────── Verduras ─────────────
  {
    id: "alface",
    emoji: "🥬",
    kind: "verdura",
    name: ["Alface", "Lettuce", "Lechuga", "Laitue"],
    months: [5, 6, 7, 8, 9, 10],
    regions: { N: ALL, NE: ALL },
    choose: [
      "Folhas viçosas, sem bordas escuras.",
      "Crisp leaves without dark edges.",
      "Hojas frescas, sin bordes oscuros.",
      "Feuilles fraîches, sans bords noircis.",
    ],
    keep: [
      "Lavada e bem seca, em pote com papel-toalha na geladeira.",
      "Washed and dried, in a container with paper towel in the fridge.",
      "Lavada y seca, en recipiente con papel en la nevera.",
      "Lavée et séchée, en boîte avec essuie-tout au frigo.",
    ],
    tip: [
      "Folhas murchas voltam a ficar crocantes em água gelada.",
      "Wilted leaves crisp up again in iced water.",
      "Las hojas mustias reviven en agua helada.",
      "Les feuilles flétries reprennent dans l'eau glacée.",
    ],
  },
  {
    id: "brocolis",
    emoji: "🥦",
    kind: "verdura",
    name: ["Brócolis", "Broccoli", "Brócoli", "Brocoli"],
    months: [5, 6, 7, 8, 9],
    choose: [
      "Floretes fechados, verde-escuros, sem amarelar.",
      "Tight, dark green florets, no yellowing.",
      "Ramilletes cerrados, verde oscuro, sin amarillear.",
      "Fleurettes serrées, vert foncé, sans jaunir.",
    ],
    keep: [
      "Geladeira por até 5 dias; branqueado, congela.",
      "Fridge for up to 5 days; blanched, it freezes.",
      "Nevera hasta 5 días; blanqueado se congela.",
      "Frigo 5 jours ; blanchi, il se congèle.",
    ],
    tip: [
      "O talo descascado é macio: vai no refogado, na sopa ou no arroz.",
      "The peeled stem is tender: sauté it, or add to soup or rice.",
      "El tallo pelado es tierno: salteado, en sopa o arroz.",
      "La tige pelée est tendre : sautée, en soupe ou riz.",
    ],
  },
  {
    id: "couve",
    emoji: "🥬",
    kind: "verdura",
    name: ["Couve", "Collard greens", "Col rizada", "Chou cavalier"],
    months: [5, 6, 7, 8, 9, 10],
    regions: { N: ALL, NE: ALL },
    choose: [
      "Folhas firmes e verde-escuras.",
      "Firm, dark green leaves.",
      "Hojas firmes y verde oscuro.",
      "Feuilles fermes, vert foncé.",
    ],
    keep: [
      "Enrolada em pano úmido na geladeira; picada, congela.",
      "Wrapped in a damp cloth in the fridge; shredded, it freezes.",
      "Envuelta en paño húmedo en la nevera; picada se congela.",
      "Dans un linge humide au frigo ; émincé, il se congèle.",
    ],
    tip: [
      "Os talos picadinhos vão no refogado ou no feijão.",
      "Finely chopped stems go into sautés or beans.",
      "Los tallos picados van en el salteado o los frijoles.",
      "Les tiges hachées vont dans les haricots.",
    ],
  },
  {
    id: "couve-flor",
    emoji: "🥦",
    kind: "verdura",
    name: ["Couve-flor", "Cauliflower", "Coliflor", "Chou-fleur"],
    months: [5, 6, 7, 8, 9],
    choose: [
      "Branca, firme e com folhas verdes em volta.",
      "White, firm, with green leaves around.",
      "Blanca, firme y con hojas verdes.",
      "Blanc, ferme, entouré de feuilles vertes.",
    ],
    keep: [
      "Geladeira por até 1 semana.",
      "Fridge for up to a week.",
      "Nevera hasta una semana.",
      "Frigo jusqu'à une semaine.",
    ],
    tip: [
      "As folhas e o talo vão em sopas e refogados.",
      "Leaves and stem go into soups and sautés.",
      "Hojas y tallo van en sopas y salteados.",
      "Feuilles et tige vont en soupes et poêlées.",
    ],
  },
  {
    id: "espinafre",
    emoji: "🌿",
    kind: "verdura",
    name: ["Espinafre", "Spinach", "Espinaca", "Épinards"],
    months: [5, 6, 7, 8, 9],
    choose: [
      "Folhas verde-escuras e firmes.",
      "Dark green, firm leaves.",
      "Hojas verde oscuro y firmes.",
      "Feuilles vert foncé et fermes.",
    ],
    keep: [
      "Geladeira por 3 dias; refogado, congela bem.",
      "Fridge for 3 days; sautéed, it freezes well.",
      "Nevera 3 días; salteado se congela bien.",
      "Frigo 3 jours ; poêlés, ils se congèlent.",
    ],
    tip: [
      "Murcho? Vai em omelete, torta ou molho.",
      "Wilted? Use it in omelettes, pies or sauces.",
      "¿Mustio? Va en tortilla, tarta o salsa.",
      "Flétris ? En omelette, tarte ou sauce.",
    ],
  },
  {
    id: "repolho",
    emoji: "🥬",
    kind: "verdura",
    name: ["Repolho", "Cabbage", "Repollo", "Chou"],
    months: [5, 6, 7, 8, 9, 10],
    choose: [
      "Pesado e com folhas bem fechadas.",
      "Heavy, with tightly packed leaves.",
      "Pesado y con hojas bien cerradas.",
      "Lourd, feuilles bien serrées.",
    ],
    keep: [
      "Inteiro, geladeira por até 3 semanas.",
      "Whole, fridge for up to 3 weeks.",
      "Entero, nevera hasta 3 semanas.",
      "Entier, frigo jusqu'à 3 semaines.",
    ],
    tip: [
      "Rende muito e é barato: salada, refogado e charutinho.",
      "Goes a long way and is cheap: slaw, sautés and rolls.",
      "Rinde mucho y es barato: ensalada, salteado y rollitos.",
      "Économique : salade, poêlée et chou farci.",
    ],
  },
  {
    id: "rucula",
    emoji: "🌿",
    kind: "verdura",
    name: ["Rúcula", "Arugula", "Rúcula", "Roquette"],
    months: [4, 5, 6, 7, 8, 9],
    choose: [
      "Folhas pequenas e verde-vivas (menos amargas).",
      "Small, bright leaves (less bitter).",
      "Hojas pequeñas y verdes (menos amargas).",
      "Petites feuilles vives (moins amères).",
    ],
    keep: [
      "Pote com papel-toalha na geladeira por 3 dias.",
      "Container with paper towel in the fridge for 3 days.",
      "Recipiente con papel en la nevera 3 días.",
      "Boîte avec essuie-tout au frigo 3 jours.",
    ],
    tip: [
      "Murcha, vira pesto ou vai no macarrão quente.",
      "Wilted, make pesto or toss into hot pasta.",
      "Mustia, se hace pesto o va en la pasta caliente.",
      "Flétrie, en pesto ou dans des pâtes chaudes.",
    ],
  },
];

/** Região do estado (UF), ou null se não houver. */
export function regionOf(uf: string | null | undefined): Region | null {
  return (uf && UF_REGION[uf]) || null;
}

export function monthsIn(food: SeasonFood, region: Region) {
  return food.regions?.[region] ?? food.months;
}

export function availableIn(food: SeasonFood, region: Region) {
  return !food.only || food.only.includes(region);
}

export type SeasonPhase = "comecando" | "auge" | "terminando" | "ano-todo";

/** Fase da safra no mês (1 a 12), ou null se não é época. */
export function phaseOf(food: SeasonFood, region: Region, month: number): SeasonPhase | null {
  const months = monthsIn(food, region);
  if (!months.includes(month)) return null;
  if (months.length === 12) return "ano-todo";
  const prev = month === 1 ? 12 : month - 1;
  const next = month === 12 ? 1 : month + 1;
  if (!months.includes(prev)) return "comecando";
  if (!months.includes(next)) return "terminando";
  return "auge";
}

/** Alimentos da estação na região e no mês, do mais típico (auge) ao ano todo. */
export function seasonFoods(region: Region, month: number) {
  const order: Record<SeasonPhase, number> = {
    auge: 0,
    comecando: 1,
    terminando: 2,
    "ano-todo": 3,
  };
  return SEASON_FOODS.filter((f) => availableIn(f, region))
    .map((food) => ({ food, phase: phaseOf(food, region, month) }))
    .filter((x): x is { food: SeasonFood; phase: SeasonPhase } => x.phase !== null)
    .sort((a, b) => order[a.phase] - order[b.phase]);
}

/** Nomes em português do que está na estação (para a Nina), sem os do ano todo. */
export function seasonNamesPt(region: Region, month = new Date().getMonth() + 1) {
  return seasonFoods(region, month)
    .filter((x) => x.phase !== "ano-todo")
    .map((x) => x.food.name[0].toLowerCase());
}

// Comunidade & Jornadas — Armazenamento local reativo (pronto para futura API/DB).

export interface CommunityMember {
  userId: string;
  name: string;
  joinedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export type PostType = "receita" | "experiencia" | "pergunta" | "geral";

export interface RecipeData {
  prepTime: string;
  servings: string;
  difficulty: "Fácil" | "Médio" | "Difícil";
  ingredients: string[];
  steps: string[];
  category: string;
}

export interface Post {
  id: string;
  communityId?: string;
  type: PostType;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title?: string;
  text: string;
  image?: string;
  tags: string[];
  createdAt: string;
  pinned: boolean;
  likes: string[]; // retrocompatibilidade
  supports: string[]; // userIds que apoiaram ("Apoiar")
  preparedBy: string[]; // userIds que prepararam a receita ("Eu preparei")
  comments: Comment[];
  themeId?: string;
  recipeData?: RecipeData;
}

/**
 * pendente: criada, aguardando um profissional aceitar ser admin (ainda não existe publicamente).
 * ativa: tem admin usuário e admin profissional.
 * suspensa: já foi ativa, mas perdeu um dos dois admins.
 */
export type CommunityStatus = "pendente" | "ativa" | "suspensa";

export interface Community {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  objective?: string;
  coverImage?: string;
  /** Quem criou a comunidade (histórico); a administração atual está nos campos abaixo. */
  createdById: string;
  createdByName: string;
  /** Admin usuário (uma pessoa por comunidade, e cada pessoa administra uma comunidade por vez). */
  adminUserId?: string;
  adminUserName?: string;
  /** Admin profissional: sempre um profissional verificado. */
  professionalId?: string;
  professionalName?: string;
  /** Profissionais que já deixaram a administração desta comunidade (não são convidados de volta). */
  formerProfessionalIds?: string[];
  status: CommunityStatus;
  members: CommunityMember[];
  createdAt: string;
}

export type ProfileRole = "paciente" | "profissional";

/** Dados de um profissional já verificado pela plataforma. */
export interface ProfessionalInfo {
  profession: string;
  council: string;
  registration: string;
  uf: string;
  /** Áreas de atuação, no vocabulário de CATEGORIES (usadas para indicar comunidades). */
  specialties: string[];
  verifiedAt: string;
}

export interface PublicProfile {
  userId: string;
  name: string;
  bio: string;
  role?: ProfileRole;
  /** Presente quando role === "profissional" (perfil profissional verificado). */
  professional?: ProfessionalInfo;
}

export type VerificationStatus = "em_analise" | "aprovado" | "recusado";

/** Pedido de verificação de perfil profissional, analisado pelos administradores da plataforma. */
export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  fullName: string;
  profession: string;
  council: string;
  registration: string;
  uf: string;
  specialties: string[];
  bio?: string;
  publicLookupUrl?: string;
  /** Foto da carteira/registro profissional (data URL). */
  documentImage: string;
  /** Selfie segurando o documento (data URL). */
  selfieImage: string;
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedById?: string;
  rejectionReason?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  votedUsers: string[];
}

export interface WeeklyTheme {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  currentWeek: string;
  questionOfTheWeek: string;
  poll: {
    id: string;
    question: string;
    options: PollOption[];
  };
  challengeId?: string;
  featuredRecipeIds: string[];
}

export interface ChallengeTip {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  badgeIcon: string;
  badgeLabel: string;
  duration: string;
  participants: string[];
  completedBy: string[];
  steps: string[];
  tips: string[];
  communityTips: ChallengeTip[];
  /** userId -> índices dos passos concluídos */
  progress: Record<string, number[]>;
  themeId?: string;
  /** Posição na trilha Duolingo (menor = mais cedo na trilha). */
  order?: number;
  /** ID do desafio que precisa ser concluído para desbloquear este. */
  requiredChallengeId?: string;
  /** ID da comunidade associada ao desafio (para aba "Das Minhas Comunidades"). */
  communityId?: string;
  /** ID do profissional que criou o desafio (para aba "Populares"). */
  createdByProfessionalId?: string;
  /** Nome do profissional que criou o desafio. */
  createdByProfessionalName?: string;
}

export interface ChallengeBadgeTier {
  count: number;
  icon: string;
  label: string;
}

/** Distintivos conquistados conforme a quantidade de desafios concluídos. */
export const CHALLENGE_BADGE_TIERS: ChallengeBadgeTier[] = [
  { count: 1, icon: "🥉", label: "Primeiro Passo" },
  { count: 3, icon: "🥈", label: "Constância em Construção" },
  { count: 5, icon: "🥇", label: "Mestre dos Hábitos" },
];

export interface CommunityState {
  communities: Community[];
  posts: Post[];
  profiles: PublicProfile[];
  verifications: VerificationRequest[];
  weeklyTheme: WeeklyTheme;
  challenges: Challenge[];
}

export const JOURNEY_GOALS = [
  "Comer melhor e com prazer",
  "Melhorar minha rotina alimentar",
  "Cozinhar mais em casa",
  "Aprender receitas práticas",
  "Organização de marmitas",
  "Alimentação vegetariana",
  "Ganho de massa muscular",
  "Emagrecimento consciente",
  "Qualidade de vida",
] as const;

export const CATEGORIES = [
  "Educação alimentar",
  "Relação com a comida",
  "Cozinha do dia a dia",
  "Bem-estar e sono",
  "Alimentação em família",
  "Saúde e condições clínicas",
] as const;

export const RECIPE_CATEGORIES = [
  "Todas",
  "Café da manhã",
  "Almoço e Jantar",
  "Lanches práticos",
  "Sobremesas saudáveis",
  "Vegetariano & Vegano",
] as const;

const KEY = "nutriconnect_community_v2";
const EVENT = "community-change";

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

/** Preenche campos novos com padrões seguros em desafios salvos antes desta versão. */
function normalizeChallenge(c: Partial<Challenge> & Pick<Challenge, "id" | "title">): Challenge {
  return {
    description: "",
    category: "",
    badgeIcon: "🎯",
    badgeLabel: "Conquista",
    duration: "",
    participants: [],
    completedBy: [],
    steps: [],
    tips: [],
    communityTips: [],
    progress: {},
    ...c,
  };
}

function id() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

const MARIA_ID = "seed-maria";
const PAC_ID = "seed-paciente-ana";
const PEDRO_ID = "seed-pedro";
const PAC_CARLOS_ID = "seed-paciente-carlos";
const PAC_BEA_ID = "seed-paciente-beatriz";
const HELENA_ID = "seed-helena";

function seed(): CommunityState {
  const now = Date.now();
  const iso = (minus: number) => new Date(now - minus).toISOString();

  const communities: Community[] = [
    {
      id: "c-educacao",
      slug: "educacao-alimentar",
      name: "Educação Alimentar no dia a dia",
      description:
        "Um espaço para aprender sobre alimentos, rótulos e escolhas possíveis — sem culpa e sem regras rígidas.",
      category: "Educação alimentar",
      createdById: PAC_ID,
      createdByName: "Ana Prado",
      adminUserId: PAC_ID,
      adminUserName: "Ana Prado",
      professionalId: MARIA_ID,
      professionalName: "Maria Lorena",
      status: "ativa",
      members: [
        { userId: MARIA_ID, name: "Maria Lorena", joinedAt: iso(86400000 * 20) },
        { userId: PAC_ID, name: "Ana Prado", joinedAt: iso(86400000 * 12) },
      ],
      createdAt: iso(86400000 * 20),
    },
    {
      id: "c-relacao",
      slug: "relacao-com-a-comida",
      name: "Relação saudável com a comida",
      description: "Conversas acolhedoras sobre comer com atenção, fome emocional e autocuidado.",
      category: "Relação com a comida",
      createdById: PAC_BEA_ID,
      createdByName: "Beatriz Lima",
      adminUserId: PAC_BEA_ID,
      adminUserName: "Beatriz Lima",
      professionalId: HELENA_ID,
      professionalName: "Helena Souza",
      status: "ativa",
      members: [
        { userId: HELENA_ID, name: "Helena Souza", joinedAt: iso(86400000 * 15) },
        { userId: PAC_BEA_ID, name: "Beatriz Lima", joinedAt: iso(86400000 * 15) },
      ],
      createdAt: iso(86400000 * 15),
    },
    {
      id: "c-cozinha",
      slug: "cozinha-de-domingo",
      name: "Cozinha e Marmitas da Semana",
      description:
        "Receitas simples, preparo da semana e trocas de ideias sobre o que colocar no prato com praticidade.",
      category: "Cozinha do dia a dia",
      createdById: PAC_CARLOS_ID,
      createdByName: "Carlos Eduardo",
      adminUserId: PAC_CARLOS_ID,
      adminUserName: "Carlos Eduardo",
      professionalId: PEDRO_ID,
      professionalName: "Pedro Costa",
      status: "ativa",
      members: [
        { userId: PAC_CARLOS_ID, name: "Carlos Eduardo", joinedAt: iso(86400000 * 3) },
        { userId: PEDRO_ID, name: "Pedro Costa", joinedAt: iso(86400000 * 3) },
        { userId: PAC_ID, name: "Ana Prado", joinedAt: iso(86400000 * 2) },
      ],
      createdAt: iso(86400000 * 3),
    },
  ];

  const posts: Post[] = [
    {
      id: "p-rec-1",
      type: "receita",
      authorId: MARIA_ID,
      authorName: "Maria Lorena",
      title: "Cumbuca de Aveia Cremosa com Maçã e Canela",
      text: "Uma opção acolhedora para o café da manhã ou lanche da tarde. O aquecimento da maçã libera doçura natural, diminuindo a necessidade de açúcares adicionados e garantindo saciedade por horas.",
      tags: ["Café da manhã", "Fácil", "Fibras", "Conforto"],
      createdAt: iso(86400000 * 1),
      pinned: true,
      likes: [PAC_ID, PAC_CARLOS_ID],
      supports: [PAC_ID, PAC_CARLOS_ID],
      preparedBy: [PAC_ID, PAC_CARLOS_ID, "user-demo-3"],
      recipeData: {
        prepTime: "10 min",
        servings: "1 porção",
        difficulty: "Fácil",
        category: "Café da manhã",
        ingredients: [
          "4 colheres (sopa) de aveia em flocos",
          "150ml de leite ou bebida vegetal morna",
          "1 maçã pequena picada em cubinhos",
          "1 colher (chá) de canela em pó",
          "1 colher (sobremesa) de sementes de chia ou linhaça",
          "Fio de mel ou melaço (opcional)",
        ],
        steps: [
          "Em uma panela pequena, misture a aveia e o leite em fogo baixo até engrossar (cerca de 3 a 4 minutos).",
          "Adicione metade da maçã picada e a canela, mexendo até os pedaços amolecerem levemente.",
          "Transfira para uma cumbuca, decore com o restante da maçã fresca, a chia e finalize com uma pitada de canela por cima.",
        ],
      },
      comments: [
        {
          id: "cm-1",
          postId: "p-rec-1",
          authorId: PAC_ID,
          authorName: "Ana Prado",
          text: "Preparei hoje de manhã! O cheirinho de canela na casa faz toda a diferença.",
          createdAt: iso(86400000 * 0.8),
        },
      ],
    },
    {
      id: "p-exp-1",
      type: "experiencia",
      authorId: PAC_ID,
      authorName: "Ana Prado",
      title: "O dia em que parei de temer o almoço de domingo",
      text: "Durante muito tempo, o almoço em família me dava ansiedade por achar que 'sairia da linha'. Passei a comer com presença, saboreando cada garfada e conversando com calma. Foi o primeiro domingo em anos que me levantei leve, satisfeita e em paz com o prato.",
      tags: ["Relação com a comida", "Conquistas", "Vida Real"],
      createdAt: iso(86400000 * 2),
      pinned: false,
      likes: [MARIA_ID, PEDRO_ID],
      supports: [MARIA_ID, PEDRO_ID, PAC_CARLOS_ID],
      preparedBy: [],
      comments: [
        {
          id: "cm-2",
          postId: "p-exp-1",
          authorId: MARIA_ID,
          authorName: "Maria Lorena",
          text: "Muito feliz com o seu relato, Ana! O objetivo principal sempre é construir paz com o prato e presença com quem amamos.",
          createdAt: iso(86400000 * 1.5),
        },
      ],
    },
    {
      id: "p-esp-1",
      type: "experiencia",
      authorId: PEDRO_ID,
      authorName: "Pedro Costa",
      title: "Regra dos 3 Potes: Como não se perder na correria da semana",
      text: "Você não precisa de 14 marmitas idênticas no congelador. Apenas deixe prontos na geladeira: 1 pote de leguminosa cozida (feijão, lentilha ou grão-de-bico), 1 pote de grão integral (arroz ou quinoa) e 1 pote de vegetais assados. Na hora de comer, basta aquecer e variar a proteína fresca.",
      tags: ["Organização", "Cozinha Prática", "Dica da Comunidade"],
      createdAt: iso(86400000 * 3),
      pinned: false,
      likes: [PAC_ID],
      supports: [PAC_ID, MARIA_ID],
      preparedBy: [],
      comments: [],
    },
    {
      id: "p-rec-2",
      type: "receita",
      authorId: PAC_CARLOS_ID,
      authorName: "Carlos Eduardo",
      title: "Legumes Assados Crocantes de Tabuleiro",
      text: "Minha receita coringa para o jantar da semana. Uso o que estiver sobrando na geladeira com azeite e alecrim!",
      tags: ["Almoço e Jantar", "Vegetais", "Fácil"],
      createdAt: iso(86400000 * 4),
      pinned: false,
      likes: [MARIA_ID],
      supports: [MARIA_ID, PAC_ID],
      preparedBy: [PAC_ID],
      recipeData: {
        prepTime: "30 min",
        servings: "3 porções",
        difficulty: "Fácil",
        category: "Almoço e Jantar",
        ingredients: [
          "2 cenouras fatiadas em rodelas grossas",
          "1 abobrinha média em cubos",
          "1 cebola roxa cortada em pétalas",
          "1 xícara de abóbora cabotiá picada",
          "2 colheres (sopa) de azeite de oliva",
          "Sal, pimenta-do-reino e ramos de alecrim fresco a gosto",
        ],
        steps: [
          "Preaqueça o forno a 200°C.",
          "Em uma assadeira grande, espalhe todos os legumes sem sobrepor para que dourem por igual.",
          "Regue com azeite, tempere com sal, pimenta e espalhe o alecrim.",
          "Asse por cerca de 25 a 30 minutos até ficarem macios por dentro e tostados por fora.",
        ],
      },
      comments: [],
    },
    {
      id: "p-perg-1",
      type: "pergunta",
      authorId: PAC_ID,
      authorName: "Ana Prado",
      title: "Como vocês organizam os lanches da tarde fora de casa?",
      text: "Sempre que passo o dia na rua, acabo recorrendo à primeira cafeteria que vejo. Quais opções práticas e que não estragam na bolsa vocês costumam carregar?",
      tags: ["Dúvida", "Rotina de Trabalho", "Lanches"],
      createdAt: iso(86400000 * 5),
      pinned: false,
      likes: [PEDRO_ID],
      supports: [PEDRO_ID, PAC_CARLOS_ID],
      preparedBy: [],
      comments: [
        {
          id: "cm-3",
          postId: "p-perg-1",
          authorId: PEDRO_ID,
          authorName: "Pedro Costa",
          text: "Misturas de castanhas com frutas secas em potinhos pequenos, frutas mais firmes (como maçã ou pera) e biscoitos integrais de sementes são ótimos coringas de bolsa!",
          createdAt: iso(86400000 * 4.5),
        },
      ],
    },
  ];

  const profiles: PublicProfile[] = [
    {
      userId: MARIA_ID,
      name: "Maria Lorena",
      bio: "Apaixonada por descomplicar a cozinha e criar relações pacíficas com o prato.",
      role: "profissional",
      professional: {
        profession: "Nutricionista",
        council: "CRN",
        registration: "12345",
        uf: "SP",
        specialties: ["Educação alimentar", "Alimentação em família"],
        verifiedAt: iso(86400000 * 60),
      },
    },
    {
      userId: PEDRO_ID,
      name: "Pedro Costa",
      bio: "Focado em alimentação para o dia a dia moderno, rotina ativa e planejamento realista para quem não tem tempo a perder.",
      role: "profissional",
      professional: {
        profession: "Nutricionista",
        council: "CRN",
        registration: "23456",
        uf: "RJ",
        specialties: ["Cozinha do dia a dia", "Saúde e condições clínicas"],
        verifiedAt: iso(86400000 * 45),
      },
    },
    {
      userId: HELENA_ID,
      name: "Helena Souza",
      bio: "Psicóloga com foco em comportamento alimentar, fome emocional e uma relação mais gentil com a comida.",
      role: "profissional",
      professional: {
        profession: "Psicóloga",
        council: "CRP",
        registration: "06/54321",
        uf: "SP",
        specialties: ["Relação com a comida", "Bem-estar e sono"],
        verifiedAt: iso(86400000 * 30),
      },
    },
    {
      userId: PAC_ID,
      name: "Ana Prado",
      bio: "Em busca de mais calma à mesa, testando receitas simples e construindo novos hábitos passo a passo.",
      role: "paciente",
    },
    {
      userId: PAC_CARLOS_ID,
      name: "Carlos Eduardo",
      bio: "Testando receitas práticas para a semana e trocando ideias com a comunidade.",
      role: "paciente",
    },
    {
      userId: PAC_BEA_ID,
      name: "Beatriz Lima",
      bio: "Aprendendo a comer com atenção e a escutar os sinais do corpo, sem culpa.",
      role: "paciente",
    },
  ];

  const weeklyTheme: WeeklyTheme = {
    id: "tema-alimentos-frescos",
    title: "Cozinha de Verdade: Menos Rótulos, Mais Frescor",
    subtitle: "O Pulso da Comunidade nesta semana",
    description:
      "Nesta semana, nosso convite é olhar com carinho para os alimentos in natura da feira e da horta. Pequenas mudanças trazem mais cor, sabor e vitalidade para o dia.",
    badge: "Tema da Semana",
    currentWeek: "Semana de 08 a 14 de Setembro",
    questionOfTheWeek:
      "Qual alimento fresco que você não comia antes passou a fazer parte da sua rotina recentemente?",
    poll: {
      id: "poll-1",
      question: "Qual o seu maior obstáculo para cozinhar mais com alimentos frescos?",
      options: [
        { id: "opt-1", text: "Falta de tempo durante a semana", votes: 48, votedUsers: [] },
        {
          id: "opt-2",
          text: "Medo dos alimentos estragarem na geladeira",
          votes: 34,
          votedUsers: [],
        },
        { id: "opt-3", text: "Falta de ideias de temperos e receitas", votes: 29, votedUsers: [] },
        { id: "opt-4", text: "Cansaço ao final do dia", votes: 41, votedUsers: [] },
      ],
    },
    challengeId: "desafio-3-frescos",
    featuredRecipeIds: ["p-rec-1", "p-rec-2"],
  };

  const challenges: Challenge[] = [
    {
      id: "desafio-agua-consciente",
      title: "Hidratação Sem Complicação",
      description:
        "Mantenha uma garrafa d'água por perto e faça pausas conscientes para beber água ao longo do dia.",
      category: "Hábitos Básicos",
      badgeIcon: "💧",
      badgeLabel: "Sempre Hidratado",
      duration: "Hábito contínuo",
      order: 1,
      createdByProfessionalId: MARIA_ID,
      createdByProfessionalName: "Maria Lorena",
      participants: [
        PAC_ID,
        PAC_CARLOS_ID,
        "user-demo-7",
        "user-demo-8",
        "user-demo-9",
        "user-demo-10",
        "user-demo-11",
        "user-demo-12",
        "user-demo-13",
        "user-demo-14",
        "user-demo-15",
      ],
      completedBy: [PAC_ID, PAC_CARLOS_ID],
      steps: [
        "Comece o dia com um copo d'água ao acordar",
        "Leve sua garrafinha para o trabalho ou estudo",
        "Observe como seu foco e disposição melhoram",
      ],
      tips: [
        "Coloque um lembrete no celular a cada 2 horas até o hábito ficar automático.",
        "Garrafas com marcação de horário ajudam bastante nos primeiros dias.",
      ],
      communityTips: [
        {
          id: "ctip-2",
          authorId: "user-demo-7",
          authorName: "Beatriz Nunes",
          text: "Adicionar rodelas de limão ou hortelã na água ajudou muito a criar o hábito.",
          createdAt: iso(86400000 * 2),
        },
      ],
      progress: {
        [PAC_ID]: [0, 1, 2],
        [PAC_CARLOS_ID]: [0, 1, 2],
        "user-demo-7": [0, 1],
        "user-demo-8": [0],
      },
    },
    {
      id: "desafio-3-frescos",
      title: "Desafio dos 3 Alimentos Frescos",
      description:
        "Monte ao menos uma refeição no dia contendo 3 cores diferentes de vegetais ou frutas in natura.",
      category: "Diversidade & Cores",
      badgeIcon: "🥗",
      badgeLabel: "Colorido & Fresco",
      duration: "7 dias",
      order: 2,
      requiredChallengeId: "desafio-agua-consciente",
      communityId: "c-educacao",
      createdByProfessionalId: MARIA_ID,
      createdByProfessionalName: "Maria Lorena",
      participants: [PAC_ID, PAC_CARLOS_ID, "user-demo-4", "user-demo-5"],
      completedBy: [PAC_ID],
      steps: [
        "Escolha 3 vegetais ou frutas com cores diferentes",
        "Inclua na refeição do almoço ou jantar",
        "Compartilhe sua combinação no Espaço de Hoje",
      ],
      tips: [
        "Use a feira da semana como inspiração: compre o que estiver colorido e na estação.",
        "Vale misturar cru e cozido — uma salada crocante com um legume assado, por exemplo.",
        "Tire uma foto do prato antes de comer, é uma ótima forma de perceber o quanto você já variou.",
      ],
      communityTips: [
        {
          id: "ctip-1",
          authorId: PAC_CARLOS_ID,
          authorName: "Carlos Eduardo",
          text: "Beterraba ralada crua deixa qualquer prato mais vivo e é super rápida de preparar.",
          createdAt: iso(86400000 * 1),
        },
      ],
      progress: {
        [PAC_ID]: [0, 1, 2],
        [PAC_CARLOS_ID]: [0, 1],
        "user-demo-4": [0],
      },
      themeId: "tema-alimentos-frescos",
    },
    {
      id: "desafio-cozinhar-3x",
      title: "Cozinhar em Casa 3 Vezes",
      description:
        "Prepare 3 refeições completas em casa durante esta semana para se reconectar com a cozinha.",
      category: "Culinária & Presença",
      badgeIcon: "🍳",
      badgeLabel: "Cozinha Ativa",
      duration: "Semana atual",
      order: 3,
      requiredChallengeId: "desafio-3-frescos",
      communityId: "c-cozinha",
      createdByProfessionalId: PEDRO_ID,
      createdByProfessionalName: "Pedro Costa",
      participants: [PAC_ID, "user-demo-6"],
      completedBy: [],
      steps: [
        "Defina os 3 dias mais tranquilos para cozinhar",
        "Escolha receitas simples de até 30 minutos",
        "Aproveite para reservar uma porção para o dia seguinte",
      ],
      tips: [
        "Deixe os ingredientes básicos (arroz, feijão, legumes) já lavados e cortados no domingo.",
        "Repita uma receita que já deu certo antes — o objetivo é constância, não novidade.",
      ],
      communityTips: [],
      progress: {
        [PAC_ID]: [0],
        "user-demo-6": [0, 1],
      },
    },
    {
      id: "desafio-mastigar-devagar",
      title: "Comer com Calma e Presença",
      description:
        "Pratique comer pelo menos uma refeição por dia sem distrações, mastigando devagar e prestando atenção nos sabores.",
      category: "Mindful Eating",
      badgeIcon: "🧘",
      badgeLabel: "Presença à Mesa",
      duration: "5 dias",
      order: 4,
      requiredChallengeId: "desafio-cozinhar-3x",
      communityId: "c-relacao",
      createdByProfessionalId: HELENA_ID,
      createdByProfessionalName: "Helena Souza",
      participants: [
        PAC_BEA_ID,
        PAC_ID,
        "user-demo-16",
        "user-demo-17",
        "user-demo-18",
        "user-demo-19",
        "user-demo-20",
        "user-demo-21",
        "user-demo-22",
        "user-demo-23",
        "user-demo-24",
        "user-demo-25",
      ],
      completedBy: [PAC_BEA_ID],
      steps: [
        "Desligue o celular e a TV antes de se sentar para comer",
        "Mastigue cada garfada pelo menos 15 vezes",
        "Ao final da refeição, observe: estava com fome? Se sentiu satisfeito?",
        "Repita por 5 dias consecutivos",
      ],
      tips: [
        "Se for difícil no início, comece com apenas uma refeição por dia.",
        "Coloque os talheres na mesa entre uma garfada e outra.",
      ],
      communityTips: [
        {
          id: "ctip-3",
          authorId: PAC_BEA_ID,
          authorName: "Beatriz Lima",
          text: "Comecei almoçando sem o celular. No terceiro dia já percebi muito mais os sabores!",
          createdAt: iso(86400000 * 3),
        },
      ],
      progress: {
        [PAC_BEA_ID]: [0, 1, 2, 3],
        [PAC_ID]: [0, 1],
        "user-demo-16": [0],
      },
    },
    {
      id: "desafio-preparo-semana",
      title: "Planejamento de Marmitas da Semana",
      description: "Separe 2 horas no domingo para deixar marmitas prontas para 3 dias da semana.",
      category: "Organização",
      badgeIcon: "📦",
      badgeLabel: "Preparador(a) da Semana",
      duration: "1 semana",
      order: 5,
      requiredChallengeId: "desafio-mastigar-devagar",
      communityId: "c-cozinha",
      createdByProfessionalId: PEDRO_ID,
      createdByProfessionalName: "Pedro Costa",
      participants: [
        PAC_CARLOS_ID,
        PAC_ID,
        "user-demo-26",
        "user-demo-27",
        "user-demo-28",
        "user-demo-29",
        "user-demo-30",
        "user-demo-31",
        "user-demo-32",
        "user-demo-33",
      ],
      completedBy: [],
      steps: [
        "Escolha 2 proteínas, 2 acompanhamentos e 2 saladas para a semana",
        "Faça as compras com uma lista pronta (sem improvisar)",
        "Reserve 2 horas no domingo para o preparo em lote",
        "Armazene em potes de vidro separados por dia",
      ],
      tips: [
        "Cozinhar ouvindo música ou podcast torna o preparo mais leve.",
        "Congele metade das porções para não enjoar da mesma refeição.",
      ],
      communityTips: [],
      progress: {
        [PAC_CARLOS_ID]: [0, 1],
        [PAC_ID]: [0],
      },
    },
    {
      id: "desafio-rotulo-consciente",
      title: "Leitura de Rótulos sem Paranoia",
      description:
        "Aprenda a ler rótulos de 3 alimentos que você consome com frequência, sem neura — apenas com curiosidade.",
      category: "Educação Alimentar",
      badgeIcon: "🏷️",
      badgeLabel: "Leitor(a) Consciente",
      duration: "3 dias",
      order: 6,
      requiredChallengeId: "desafio-preparo-semana",
      communityId: "c-educacao",
      createdByProfessionalId: MARIA_ID,
      createdByProfessionalName: "Maria Lorena",
      participants: [
        PAC_ID,
        "user-demo-34",
        "user-demo-35",
        "user-demo-36",
        "user-demo-37",
        "user-demo-38",
        "user-demo-39",
      ],
      completedBy: [],
      steps: [
        "Escolha 3 produtos que você come ou bebe frequentemente",
        "Leia a lista de ingredientes (o primeiro é o que tem mais!)",
        "Compare 2 marcas do mesmo produto e perceba as diferenças",
      ],
      tips: [
        "Não se assuste com nomes químicos — muitos são apenas vitaminas adicionadas.",
        "O número de ingredientes costuma indicar o nível de processamento.",
      ],
      communityTips: [],
      progress: {
        [PAC_ID]: [0],
      },
    },
    {
      id: "desafio-fruta-lanche",
      title: "Troque um Lanche por Fruta",
      description:
        "Durante 5 dias, substitua ao menos um lanche ultraprocessado do dia por uma fruta fresca.",
      category: "Pequenas Trocas",
      badgeIcon: "🍎",
      badgeLabel: "Troca Saudável",
      duration: "5 dias",
      order: 7,
      requiredChallengeId: "desafio-rotulo-consciente",
      createdByProfessionalId: PEDRO_ID,
      createdByProfessionalName: "Pedro Costa",
      participants: [PAC_CARLOS_ID, "user-demo-40", "user-demo-41", "user-demo-42", "user-demo-43"],
      completedBy: [],
      steps: [
        "Identifique o lanche ultraprocessado que você mais consome",
        "Compre 3 frutas diferentes para ter opções",
        "Substitua o lanche por uma fruta, 1 vez por dia, durante 5 dias",
        "Anote como se sentiu após cada troca",
      ],
      tips: [
        "Frutas da estação são mais baratas e saborosas.",
        "Deixe a fruta lavada e cortada na geladeira para facilitar.",
      ],
      communityTips: [],
      progress: {
        [PAC_CARLOS_ID]: [0],
      },
    },
    {
      id: "desafio-gratidao-mesa",
      title: "Gratidão à Mesa",
      description:
        "Por 7 dias, antes de cada refeição principal, faça uma pausa de 10 segundos para agradecer pela comida.",
      category: "Bem-estar Emocional",
      badgeIcon: "🙏",
      badgeLabel: "Gratidão Nutritiva",
      duration: "7 dias",
      order: 8,
      requiredChallengeId: "desafio-fruta-lanche",
      communityId: "c-relacao",
      createdByProfessionalId: HELENA_ID,
      createdByProfessionalName: "Helena Souza",
      participants: [
        PAC_BEA_ID,
        "user-demo-44",
        "user-demo-45",
        "user-demo-46",
        "user-demo-47",
        "user-demo-48",
        "user-demo-49",
        "user-demo-50",
        "user-demo-51",
      ],
      completedBy: [],
      steps: [
        "Antes de comer, olhe para o prato por 10 segundos",
        "Pense em uma coisa boa sobre aquela refeição (sabor, companhia, esforço)",
        "Registre o que sentiu em um caderno ou no celular",
        "Mantenha por 7 dias seguidos",
      ],
      tips: [
        "Pode ser um agradecimento silencioso — não precisa dizer em voz alta.",
        "Se estiver acompanhado, convide a pessoa a fazer junto.",
      ],
      communityTips: [],
      progress: {
        [PAC_BEA_ID]: [0, 1],
      },
    },
  ];

  return { communities, posts, profiles, verifications: [], weeklyTheme, challenges };
}

/** Garante que perfis do seed (inclusive os novos) existam e que profissionais tenham seus dados. */
function mergeSeedProfiles(
  stored: PublicProfile[] | undefined,
  seedProfiles: PublicProfile[],
): PublicProfile[] {
  if (!stored || stored.length === 0) return seedProfiles;
  const merged = stored.map((p) => {
    const seeded = seedProfiles.find((sp) => sp.userId === p.userId);
    return p.role === "profissional" && !p.professional && seeded?.professional
      ? { ...p, professional: seeded.professional }
      : p;
  });
  const missing = seedProfiles.filter((sp) => !stored.some((p) => p.userId === sp.userId));
  return [...merged, ...missing];
}

/** Migra comunidades salvas antes do modelo de admins (usuário + profissional). */
function normalizeCommunity(c: Community, seedCommunities: Community[]): Community {
  if (c.status) return c;
  const seeded = seedCommunities.find((sc) => sc.id === c.id);
  if (seeded) {
    const seedAdmins = seeded.members.filter(
      (m) => m.userId === seeded.adminUserId || m.userId === seeded.professionalId,
    );
    return {
      ...c,
      createdById: seeded.createdById,
      createdByName: seeded.createdByName,
      adminUserId: seeded.adminUserId,
      adminUserName: seeded.adminUserName,
      professionalId: seeded.professionalId,
      professionalName: seeded.professionalName,
      status: "ativa",
      members: [
        ...c.members,
        ...seedAdmins.filter((admin) => !c.members.some((m) => m.userId === admin.userId)),
      ],
    };
  }
  // Sem profissional: fica suspensa até um profissional aceitar ser admin profissional.
  return { ...c, adminUserId: c.createdById, adminUserName: c.createdByName, status: "suspensa" };
}

export function loadState(): CommunityState {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const initial = seed();
      localStorage.setItem(KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as Partial<CommunityState>;
    const defaultSeed = seed();
    // Merge defensively to ensure new models exist
    const state: CommunityState = {
      communities:
        parsed.communities && parsed.communities.length > 0
          ? parsed.communities.map((c) => normalizeCommunity(c, defaultSeed.communities))
          : defaultSeed.communities,
      posts: parsed.posts && parsed.posts.length > 0 ? parsed.posts : defaultSeed.posts,
      profiles: mergeSeedProfiles(parsed.profiles, defaultSeed.profiles),
      verifications: parsed.verifications ?? [],
      weeklyTheme: parsed.weeklyTheme ?? defaultSeed.weeklyTheme,
      challenges:
        parsed.challenges && parsed.challenges.length > 0
          ? parsed.challenges.map((c) => normalizeChallenge(c))
          : defaultSeed.challenges,
    };
    return state;
  } catch {
    return seed();
  }
}

export function saveState(state: CommunityState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(EVENT));
}

export const COMMUNITY_EVENT = EVENT;

function update(fn: (state: CommunityState) => CommunityState) {
  saveState(fn(loadState()));
}

export interface Actor {
  id: string;
  name: string;
}

// Ações Comunitárias: Apoiar post
export function toggleSupport(postId: string, userId: string) {
  update((s) => ({
    ...s,
    posts: s.posts.map((p) => {
      if (p.id !== postId) return p;
      const hasSupported = (p.supports || []).includes(userId);
      const supports = hasSupported
        ? p.supports.filter((u) => u !== userId)
        : [...(p.supports || []), userId];
      return {
        ...p,
        supports,
        likes: supports, // sincroniza
      };
    }),
  }));
}

// Ações Comunitárias: "Eu preparei esta receita"
export function togglePrepared(postId: string, userId: string) {
  update((s) => ({
    ...s,
    posts: s.posts.map((p) => {
      if (p.id !== postId) return p;
      const alreadyPrepared = (p.preparedBy || []).includes(userId);
      const preparedBy = alreadyPrepared
        ? p.preparedBy.filter((u) => u !== userId)
        : [...(p.preparedBy || []), userId];
      return { ...p, preparedBy };
    }),
  }));
}

// Ações Comunitárias: Votar na enquete do tema da semana
export function voteThemePoll(optionId: string, userId: string) {
  update((s) => {
    const theme = s.weeklyTheme;
    if (!theme?.poll) return s;
    const options = theme.poll.options.map((opt) => {
      const hasVoted = opt.votedUsers.includes(userId);
      if (opt.id === optionId) {
        return hasVoted
          ? opt
          : { ...opt, votes: opt.votes + 1, votedUsers: [...opt.votedUsers, userId] };
      }
      // Se votou em outra opção, remove dela
      return {
        ...opt,
        votes: hasVoted ? Math.max(0, opt.votes - 1) : opt.votes,
        votedUsers: opt.votedUsers.filter((u) => u !== userId),
      };
    });
    return {
      ...s,
      weeklyTheme: {
        ...theme,
        poll: { ...theme.poll, options },
      },
    };
  });
}

// Ações Comunitárias: Participar de Desafio
export function toggleJoinChallenge(challengeId: string, userId: string) {
  update((s) => ({
    ...s,
    challenges: s.challenges.map((c) => {
      if (c.id !== challengeId) return c;
      const joined = c.participants.includes(userId);
      if (joined) {
        // Ao sair, o progresso e a conclusão deste desafio são zerados
        const progress = { ...(c.progress || {}) };
        delete progress[userId];
        return {
          ...c,
          participants: c.participants.filter((u) => u !== userId),
          completedBy: c.completedBy.filter((u) => u !== userId),
          progress,
        };
      }
      return { ...c, participants: [...c.participants, userId] };
    }),
  }));
}

// Ações Comunitárias: Marcar/desmarcar um passo do desafio (passo a passo)
export function toggleChallengeStep(challengeId: string, userId: string, stepIndex: number) {
  update((s) => ({
    ...s,
    challenges: s.challenges.map((c) => {
      if (c.id !== challengeId) return c;
      const progress = { ...(c.progress || {}) };
      const current = progress[userId] || [];
      const hasStep = current.includes(stepIndex);
      const nextCompletedSteps = hasStep
        ? current.filter((i) => i !== stepIndex)
        : [...current, stepIndex];
      progress[userId] = nextCompletedSteps;

      const allStepsDone = c.steps.length > 0 && nextCompletedSteps.length === c.steps.length;
      const wasCompleted = c.completedBy.includes(userId);
      let completedBy = c.completedBy;
      if (allStepsDone && !wasCompleted) completedBy = [...c.completedBy, userId];
      if (!allStepsDone && wasCompleted) completedBy = c.completedBy.filter((u) => u !== userId);

      const participants = c.participants.includes(userId)
        ? c.participants
        : [...c.participants, userId];

      return { ...c, progress, completedBy, participants };
    }),
  }));
}

// Ações Comunitárias: Enviar uma dica para um desafio
export function addChallengeTip(challengeId: string, actor: Actor, text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("A dica não pode estar vazia.");
  }

  update((s) => ({
    ...s,
    challenges: s.challenges.map((c) =>
      c.id === challengeId
        ? {
            ...c,
            communityTips: [
              ...(c.communityTips || []),
              {
                id: id(),
                authorId: actor.id,
                authorName: actor.name,
                text: trimmed,
                createdAt: new Date().toISOString(),
              },
            ],
          }
        : c,
    ),
  }));
}

/** Quantos desafios este usuário já concluiu (todos os passos marcados). */
export function getCompletedChallengeCount(userId: string, challenges: Challenge[]) {
  return challenges.filter((c) => c.completedBy.includes(userId)).length;
}

/** Distintivos do usuário, com indicação de quais já foram conquistados. */
export function getEarnedBadges(userId: string, challenges: Challenge[]) {
  const completedCount = getCompletedChallengeCount(userId, challenges);
  return CHALLENGE_BADGE_TIERS.map((tier) => ({
    ...tier,
    achieved: completedCount >= tier.count,
  }));
}

// Criar Publicação Multifacetada (Receita, Experiência, Pergunta)
export function createCommunityPost(input: {
  type: PostType;
  actor: Actor;
  title?: string;
  text: string;
  tags?: string[];
  image?: string;
  communityId?: string;
  recipeData?: RecipeData;
}): Post {
  const trimmedText = input.text.trim();
  if (!trimmedText) {
    throw new Error("A publicação não pode ser vazia.");
  }

  const post: Post = {
    id: id(),
    type: input.type,
    communityId: input.communityId,
    authorId: input.actor.id,
    authorName: input.actor.name,
    title: input.title?.trim(),
    text: trimmedText,
    tags: input.tags || [],
    image: input.image,
    createdAt: new Date().toISOString(),
    pinned: false,
    likes: [],
    supports: [],
    preparedBy: [],
    comments: [],
    recipeData: input.recipeData,
  };

  update((s) => ({ ...s, posts: [post, ...s.posts] }));
  return post;
}

export function createPost(input: {
  communityId: string;
  actor: Actor;
  text: string;
  image?: string;
}) {
  return createCommunityPost({
    type: "geral",
    actor: input.actor,
    text: input.text,
    image: input.image,
    communityId: input.communityId,
  });
}

export function addComment(postId: string, actor: Actor, text: string) {
  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new Error("O comentário não pode ser vazio.");
  }

  update((s) => ({
    ...s,
    posts: s.posts.map((p) =>
      p.id === postId
        ? {
            ...p,
            comments: [
              ...p.comments,
              {
                id: id(),
                postId,
                authorId: actor.id,
                authorName: actor.name,
                text: trimmedText,
                createdAt: new Date().toISOString(),
              },
            ],
          }
        : p,
    ),
  }));
}

export function toggleLike(postId: string, userId: string) {
  toggleSupport(postId, userId);
}

export function removeComment(postId: string, commentId: string) {
  update((s) => ({
    ...s,
    posts: s.posts.map((p) =>
      p.id === postId ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) } : p,
    ),
  }));
}

export function createCommunity(input: {
  name: string;
  description: string;
  category: string;
  objective?: string;
  coverImage?: string;
  actor: Actor;
}) {
  const current = loadState();
  if (current.profiles.find((p) => p.userId === input.actor.id)?.role === "profissional") {
    throw new Error(
      "Apenas usuários criam comunidades. Profissionais entram como admin profissional por convite.",
    );
  }
  if (isCommunityAdmin(input.actor.id, current.communities)) {
    throw new Error("Você já administra uma comunidade. Cada pessoa administra uma por vez.");
  }
  const community: Community = {
    id: id(),
    slug: slugify(input.name) || id(),
    name: input.name,
    description: input.description,
    category: input.category,
    objective: input.objective,
    coverImage: input.coverImage,
    createdById: input.actor.id,
    createdByName: input.actor.name,
    adminUserId: input.actor.id,
    adminUserName: input.actor.name,
    status: "pendente",
    members: [
      {
        userId: input.actor.id,
        name: input.actor.name,
        joinedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  };
  update((s) => ({ ...s, communities: [community, ...s.communities] }));
  return community;
}

export function toggleMembership(communityId: string, actor: Actor) {
  update((s) => ({
    ...s,
    communities: s.communities.map((c) => {
      if (c.id !== communityId) return c;
      // Admins não saem por aqui: usam o fluxo de deixar a administração.
      if (c.adminUserId === actor.id || c.professionalId === actor.id) return c;
      const isMember = c.members.some((m) => m.userId === actor.id);
      return {
        ...c,
        members: isMember
          ? c.members.filter((m) => m.userId !== actor.id)
          : [
              ...c.members,
              {
                userId: actor.id,
                name: actor.name,
                joinedAt: new Date().toISOString(),
              },
            ],
      };
    }),
  }));
}

export function removePost(postId: string) {
  update((s) => ({ ...s, posts: s.posts.filter((p) => p.id !== postId) }));
}

export function togglePin(postId: string) {
  update((s) => ({
    ...s,
    posts: s.posts.map((p) => (p.id === postId ? { ...p, pinned: !p.pinned } : p)),
  }));
}

export function upsertProfile(profile: PublicProfile) {
  update((s) => ({
    ...s,
    profiles: s.profiles.some((p) => p.userId === profile.userId)
      ? s.profiles.map((p) => (p.userId === profile.userId ? { ...p, ...profile } : p))
      : [...s.profiles, profile],
  }));
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function getWeeklyThemes(): WeeklyTheme[] {
  const s = loadState();
  return s.weeklyTheme ? [s.weeklyTheme] : [];
}

export function getWeeklyTheme(): WeeklyTheme | null {
  return loadState().weeklyTheme ?? null;
}

export function getChallenges(): Challenge[] {
  return loadState().challenges || [];
}

export function getCommunityPosts(): Post[] {
  return loadState().posts || [];
}

/** true se a pessoa já é admin (usuário ou profissional) de alguma comunidade. */
export function isCommunityAdmin(userId: string, communities: Community[]): boolean {
  return communities.some((c) => c.adminUserId === userId || c.professionalId === userId);
}

const SEED_AVATARS: Record<string, string> = {
  [MARIA_ID]: "/images/professionals/prof-1.jpg",
  [PEDRO_ID]: "/images/professionals/prof-2.jpg",
};

/** Foto de perfil: a enviada pela pessoa ou a de exemplo, quando existir. */
export function getAvatarSrc(userId: string, explicit?: string): string | undefined {
  return explicit ?? SEED_AVATARS[userId];
}

/** Papel público de um autor (paciente por padrão, quando não há perfil cadastrado). */
export function getAuthorRole(authorId: string, profiles: PublicProfile[]): ProfileRole {
  return profiles.find((p) => p.userId === authorId)?.role ?? "paciente";
}

/**
 * IDs de "amigos": pessoas com quem o usuário compartilha ao menos uma
 * comunidade. É a relação de conexão já existente no app (participação em
 * comunidades), usada como proxy até existir um sistema de amizade dedicado.
 */
export function getFriendIds(userId: string, communities: Community[]): Set<string> {
  const friendIds = new Set<string>();
  for (const community of communities) {
    const isMember = community.members.some((m) => m.userId === userId);
    if (!isMember) continue;
    for (const member of community.members) {
      if (member.userId !== userId) friendIds.add(member.userId);
    }
  }
  return friendIds;
}

// ── Gamificação: XP, Nível e Ofensiva ──────────────────────────────────

const XP_PER_CHALLENGE = 100;
const XP_PER_STEP = 15;

/** XP total do usuário baseado em desafios concluídos e passos completados. */
export function getUserXP(userId: string, challenges: Challenge[]): number {
  let xp = 0;
  for (const c of challenges) {
    if (c.completedBy.includes(userId)) {
      xp += XP_PER_CHALLENGE;
    }
    const steps = c.progress[userId];
    if (steps) {
      xp += steps.length * XP_PER_STEP;
    }
  }
  return xp;
}

/** Nível do usuário baseado no XP acumulado. */
export function getUserLevel(xp: number): {
  level: number;
  label: string;
  xpForNext: number;
  xpInLevel: number;
} {
  const levels = [
    { threshold: 0, label: "Semente" },
    { threshold: 150, label: "Broto" },
    { threshold: 400, label: "Folha" },
    { threshold: 700, label: "Flor" },
    { threshold: 1100, label: "Fruto" },
    { threshold: 1600, label: "Árvore" },
    { threshold: 2200, label: "Floresta" },
  ];
  let current = levels[0];
  let next = levels[1];
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].threshold) {
      current = levels[i];
      next = levels[i + 1] || { threshold: current.threshold + 500, label: "Mestre" };
      break;
    }
  }
  const level = levels.indexOf(current) + 1;
  const xpInLevel = xp - current.threshold;
  const xpForNext = next.threshold - current.threshold;
  return { level, label: current.label, xpForNext, xpInLevel };
}

/** Ofensiva (streak) simplificada baseada em desafios concluídos. */
export function getUserStreak(userId: string, challenges: Challenge[]): number {
  const completedCount = challenges.filter((c) => c.completedBy.includes(userId)).length;
  // Streak simplificado: 1 dia por desafio concluído, mínimo 1 se participa de algo
  if (completedCount > 0) return Math.min(completedCount * 2 + 1, 30);
  const participatingCount = challenges.filter((c) => c.participants.includes(userId)).length;
  return participatingCount > 0 ? 1 : 0;
}

/** Retorna desafios da trilha ordenados por `order`. */
export function getTrailChallenges(challenges: Challenge[]): Challenge[] {
  return challenges.filter((c) => c.order != null).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** Verifica se um desafio está desbloqueado para o usuário. */
export function isChallengeUnlocked(
  challenge: Challenge,
  userId: string,
  challenges: Challenge[],
): boolean {
  if (!challenge.requiredChallengeId) return true;
  const required = challenges.find((c) => c.id === challenge.requiredChallengeId);
  if (!required) return true;
  return required.completedBy.includes(userId);
}

export type Character = {
  name: string;
  avatar: string; // Emoji para o avatar
};

export const CHARACTERS = {
  nina: { name: "Nutri Nina", avatar: "👩🏽‍⚕️" },
  lipe: { name: "Lipe Abacate", avatar: "🥑" },
  tito: { name: "Tito Brócolis", avatar: "🥦" },
  mila: { name: "Mila Maçã", avatar: "🍎" },
};

export type ActivityType = "dialogue" | "quiz" | "true_false";

export interface BaseActivity {
  id: string;
  type: ActivityType;
}

export interface DialogueActivity extends BaseActivity {
  type: "dialogue";
  character: Character;
  text: string;
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

export type Activity = DialogueActivity | QuizActivity | TrueFalseActivity;

export interface Lesson {
  id: string;
  title: string;
  activities: Activity[];
  xpReward: number;
  minPassScore: number; // Porcentagem mínima para passar (ex: 0.7 para 70%)
}

export interface Unit {
  id: string;
  title: string;
  icon: string;
  description: string;
  lessons: Lesson[];
  requiredUnitId?: string;
}

export interface TrailProgress {
  completedLessons: string[];
  lessonScores: Record<string, number>;
  totalXP: number;
}

export const TRAIL_CHANGE_EVENT = "trail-change";
const STORAGE_KEY = "nutriconnect_trail_v1";

export function loadTrailProgress(): TrailProgress {
  if (typeof window === "undefined") {
    return { completedLessons: [], lessonScores: {}, totalXP: 0 };
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Erro ao ler progresso da trilha", e);
    }
  }
  return { completedLessons: [], lessonScores: {}, totalXP: 0 };
}

export function saveTrailProgress(progress: TrailProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event(TRAIL_CHANGE_EVENT));
}

export function completeLesson(
  lessonId: string,
  correctCount: number,
  totalQuestions: number,
  xpReward: number,
): void {
  const progress = loadTrailProgress();

  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
    progress.totalXP += xpReward;
  }

  const currentScore = progress.lessonScores[lessonId] || 0;
  if (correctCount > currentScore) {
    progress.lessonScores[lessonId] = correctCount;
  }

  saveTrailProgress(progress);
}

export function isLessonCompleted(lessonId: string): boolean {
  const progress = loadTrailProgress();
  return progress.completedLessons.includes(lessonId);
}

export function isUnitUnlocked(unit: Unit, units: Unit[]): boolean {
  if (!unit.requiredUnitId) return true;

  const requiredUnit = units.find((u) => u.id === unit.requiredUnitId);
  if (!requiredUnit) return true;

  const progress = loadTrailProgress();
  return requiredUnit.lessons.every((lesson) => progress.completedLessons.includes(lesson.id));
}

export function getTrailXP(): number {
  return loadTrailProgress().totalXP;
}

export const NUTRITION_UNITS: Unit[] = [
  {
    id: "unit-1",
    title: "Bases da Alimentação",
    icon: "🌱",
    description: "Conheça os Nutri-Amigos e descubra o poder dos alimentos.",
    lessons: [
      {
        id: "lesson-1-1",
        title: "O que são Macronutrientes?",
        xpReward: 50,
        minPassScore: 0.65,
        activities: [
          {
            id: "l1-1-1",
            type: "dialogue",
            character: CHARACTERS.nina,
            text: "Olá! Eu sou a Nutri Nina. Que bom ter você aqui! Vamos embarcar numa jornada incrível para conhecer os alimentos.",
          },
          {
            id: "l1-1-2",
            type: "dialogue",
            character: CHARACTERS.lipe,
            text: "E aí! Eu sou o Lipe Abacate. Sabia que nosso corpo é como um carro de corrida? Ele precisa de combustível e boas peças para acelerar!",
          },
          {
            id: "l1-1-3",
            type: "dialogue",
            character: CHARACTERS.nina,
            text: "Exatamente! E os **Macronutrientes** são as peças e a gasolina do corpo. Eles se dividem em três grandes grupos: Carboidratos, Proteínas e Gorduras.",
          },
          {
            id: "l1-1-4",
            type: "quiz",
            character: CHARACTERS.tito,
            question:
              "Qual desses grupos funciona como a 'gasolina rápida' do nosso corpo, dando energia imediata para o cérebro e músculos?",
            options: ["Proteínas", "Gorduras", "Carboidratos", "Fibras"],
            correctIndex: 2,
            explanation:
              "Isso mesmo! Os Carboidratos são a principal fonte de energia. Pães, massas, raízes e frutas são cheios deles.",
          },
          {
            id: "l1-1-5",
            type: "true_false",
            character: CHARACTERS.lipe,
            statement:
              "As gorduras são as grandes vilãs da saúde e não servem para nada no nosso corpo.",
            isTrue: false,
            explanation:
              "As gorduras são super importantes! Elas protegem nossos órgãos e ajudam a absorver vitaminas essenciais.",
          },
          {
            id: "l1-1-6",
            type: "quiz",
            character: CHARACTERS.nina,
            question:
              "E as proteínas? Elas agem como os 'tijolinhos' do nosso corpo. Qual a função delas?",
            options: [
              "Adoçar o sangue",
              "Construir e reparar tecidos como músculos e pele",
              "Substituir a água do corpo",
              "Causar sono após o almoço",
            ],
            correctIndex: 1,
            explanation:
              "Exato! Carnes, ovos e leguminosas (como o feijão) são ricos em proteínas, os tijolos de construção do seu corpo.",
          },
        ],
      },
      {
        id: "lesson-1-2",
        title: "Pequenos Gigantes: Vitaminas",
        xpReward: 50,
        minPassScore: 0.65,
        activities: [
          {
            id: "l1-2-1",
            type: "dialogue",
            character: CHARACTERS.mila,
            text: "Oi! Sou a Mila Maçã. Já falamos dos 'Macros', agora vamos falar dos 'Micros': Vitaminas e Minerais. Eles não dão energia, mas...",
          },
          {
            id: "l1-2-2",
            type: "dialogue",
            character: CHARACTERS.mila,
            text: "...são as ferramentas que regulam todo o funcionamento da máquina. Como o óleo do motor e o sistema elétrico do carro!",
          },
          {
            id: "l1-2-3",
            type: "true_false",
            character: CHARACTERS.nina,
            statement:
              "Uma alimentação muito colorida não faz diferença; o importante é comer pouco.",
            isTrue: false,
            explanation:
              "Cores diferentes nos alimentos significam diferentes vitaminas e minerais! Quanto mais colorido, mais rico.",
          },
          {
            id: "l1-2-4",
            type: "quiz",
            character: CHARACTERS.tito,
            question:
              "Sabe a vitamina C? Aquela famosa contra resfriados. Onde ela é encontrada em grande quantidade?",
            options: [
              "Carnes vermelhas",
              "Frutas cítricas (laranja, acerola)",
              "Óleo de soja",
              "Arroz branco",
            ],
            correctIndex: 1,
            explanation:
              "Perfeito! Frutas cítricas são excelentes fontes de Vitamina C, que fortalece a imunidade.",
          },
          {
            id: "l1-2-5",
            type: "quiz",
            character: CHARACTERS.lipe,
            question: "E para ter ossos fortes, qual é o mineral mais famoso que precisamos?",
            options: ["Sódio", "Zinco", "Cálcio", "Magnésio"],
            correctIndex: 2,
            explanation:
              "Isso! O cálcio, muito presente no leite, queijos e até em vegetais verde-escuros, forma a estrutura dos nossos ossos.",
          },
        ],
      },
      {
        id: "lesson-1-3",
        title: "Água e Fibras",
        xpReward: 50,
        minPassScore: 0.65,
        activities: [
          {
            id: "l1-3-1",
            type: "dialogue",
            character: CHARACTERS.nina,
            text: "Você sabia que cerca de 60% a 70% do seu corpo é água? É muita coisa! E existe algo que ajuda seu intestino a funcionar perfeitamente: as fibras.",
          },
          {
            id: "l1-3-2",
            type: "true_false",
            character: CHARACTERS.tito,
            statement:
              "Podemos substituir o consumo de água por refrigerantes ou sucos adoçados, pois tudo é líquido.",
            isTrue: false,
            explanation:
              "Não! Bebidas açucaradas não hidratam com a mesma eficiência e trazem excesso de calorias. A água pura é insubstituível.",
          },
          {
            id: "l1-3-3",
            type: "quiz",
            character: CHARACTERS.mila,
            question: "O que as FIBRAS, encontradas em frutas e verduras, fazem no nosso corpo?",
            options: [
              "Formam uma vassourinha que limpa o intestino e dá saciedade.",
              "Viram açúcar muito rápido no sangue.",
              "Prejudicam a absorção de nutrientes.",
              "Fazem os cabelos crescerem vermelhos.",
            ],
            correctIndex: 0,
            explanation:
              "Perfeito! Além de ajudar no banheiro, as fibras fazem a gente se sentir cheio (saciado) por mais tempo.",
          },
          {
            id: "l1-3-4",
            type: "true_false",
            character: CHARACTERS.lipe,
            statement:
              "Comer a fruta com casca sempre que possível ajuda a aumentar a ingestão de fibras.",
            isTrue: true,
            explanation:
              "Isso mesmo! A casca e o bagaço são onde mora a maior parte das fibras (como na maçã e na pera).",
          },
        ],
      },
    ],
  },
  {
    id: "unit-2",
    title: "Entendendo os Alimentos",
    icon: "🔍",
    description: "Torne-se um detetive de rótulos e descubra o que realmente está na comida.",
    requiredUnitId: "unit-1",
    lessons: [
      {
        id: "lesson-2-1",
        title: "Processados e Ultraprocessados",
        xpReward: 60,
        minPassScore: 0.65,
        activities: [
          {
            id: "l2-1-1",
            type: "dialogue",
            character: CHARACTERS.nina,
            text: "Vamos falar sobre a jornada da comida. Imagine uma espiga de milho. Ela é um alimento In Natura (direto da natureza).",
          },
          {
            id: "l2-1-2",
            type: "dialogue",
            character: CHARACTERS.lipe,
            text: "Se você cozinhar o milho em lata com sal, vira um alimento Processado. Mas se for um 'salgadinho de milho' de pacote...",
          },
          {
            id: "l2-1-3",
            type: "quiz",
            character: CHARACTERS.tito,
            question:
              "O salgadinho de milho, cheio de corantes, conservantes e aromas de laboratório, é classificado como:",
            options: ["In Natura", "Minimamente Processado", "Ultraprocessado", "Processado Leve"],
            correctIndex: 2,
            explanation:
              "Exato! Ultraprocessados são invenções industriais cheias de aditivos que enganam nosso paladar e nos fazem comer demais.",
          },
          {
            id: "l2-1-4",
            type: "true_false",
            character: CHARACTERS.nina,
            statement:
              "O objetivo para ser saudável é nunca mais colocar um alimento ultraprocessado na boca pelo resto da vida.",
            isTrue: false,
            explanation:
              "O segredo é o equilíbrio! Descascar mais e desembalar menos na maior parte do tempo, mas comer um salgadinho ocasionalmente não vai arruinar sua saúde.",
          },
        ],
      },
      {
        id: "lesson-2-2",
        title: "Lendo a Lista de Ingredientes",
        xpReward: 60,
        minPassScore: 0.7,
        activities: [
          {
            id: "l2-2-1",
            type: "dialogue",
            character: CHARACTERS.mila,
            text: "A lista de ingredientes de um produto esconde um segredo mágico de como ela é ordenada. Quer descobrir?",
          },
          {
            id: "l2-2-2",
            type: "quiz",
            character: CHARACTERS.nina,
            question: "A ordem dos ingredientes no rótulo de um produto é organizada do...",
            options: [
              "...menor quantidade para a maior.",
              "...mais saudável para o menos saudável.",
              "...maior quantidade para a menor (o que tem mais aparece primeiro).",
              "...em ordem alfabética.",
            ],
            correctIndex: 2,
            explanation:
              "Se o primeiro ingrediente é AÇÚCAR, significa que o produto é feito principalmente de açúcar!",
          },
          {
            id: "l2-2-3",
            type: "true_false",
            character: CHARACTERS.lipe,
            statement:
              "O açúcar adicionado só aparece com o nome de 'Açúcar' nas embalagens. Fica fácil de achar.",
            isTrue: false,
            explanation:
              "A indústria usa disfarces: xarope de milho, maltodextrina, açúcar invertido, glicose... Fique de olho de detetive!",
          },
          {
            id: "l2-2-4",
            type: "quiz",
            character: CHARACTERS.tito,
            question:
              "Entre um pão que o primeiro ingrediente é 'Farinha de trigo enriquecida' e outro que é 'Farinha de trigo integral', qual tem mais fibras?",
            options: [
              "O primeiro (farinha enriquecida).",
              "O segundo (farinha integral).",
              "Ambos têm a mesma quantidade.",
              "Nenhum deles tem fibra.",
            ],
            correctIndex: 1,
            explanation:
              "O pão integral verdadeiro sempre deve ter a farinha integral como o primeiro ou segundo ingrediente da lista.",
          },
        ],
      },
      {
        id: "lesson-2-3",
        title: "A Tabela Nutricional",
        xpReward: 60,
        minPassScore: 0.7,
        activities: [
          {
            id: "l2-3-1",
            type: "dialogue",
            character: CHARACTERS.nina,
            text: "Sabe aquela tabelinha preta e branca no verso do pacote? Ela é sua melhor amiga para escolhas rápidas.",
          },
          {
            id: "l2-3-2",
            type: "quiz",
            character: CHARACTERS.lipe,
            question: "A primeira coisa que você DEVE olhar ao ler uma tabela nutricional é:",
            options: [
              "A porção (para qual quantidade aqueles números servem).",
              "As calorias.",
              "A quantidade de ferro.",
              "Se tem glúten.",
            ],
            correctIndex: 0,
            explanation:
              "Cuidado com as pegadinhas! Às vezes um pacote parece ter poucas calorias, mas a tabela está calculada para apenas 2 biscoitos (sendo que o pacote vem 20).",
          },
          {
            id: "l2-3-3",
            type: "true_false",
            character: CHARACTERS.tito,
            statement:
              "Se algo diz '0% de gordura trans', quer dizer que você pode comer pacotes inteiros sem preocupação.",
            isTrue: false,
            explanation:
              "Mesmo sem gordura trans, produtos podem ser riquíssimos em açúcar ou sódio. Sempre observe o quadro geral.",
          },
        ],
      },
    ],
  },
  {
    id: "unit-3",
    title: "Montando Seu Prato",
    icon: "🍽️",
    description:
      "Da teoria à prática! Descubra como montar pratos saborosos e equilibrados no dia a dia.",
    requiredUnitId: "unit-2",
    lessons: [
      {
        id: "lesson-3-1",
        title: "O Prato Equilibrado",
        xpReward: 75,
        minPassScore: 0.65,
        activities: [
          {
            id: "l3-1-1",
            type: "dialogue",
            character: CHARACTERS.nina,
            text: "O método do 'Prato Equilibrado' é uma regra visual simples para almoço e jantar que dispensa balança.",
          },
          {
            id: "l3-1-2",
            type: "quiz",
            character: CHARACTERS.mila,
            question:
              "No modelo ideal do prato equilibrado, METADE (50%) do prato deveria ser preenchida com:",
            options: [
              "Carboidratos (arroz, macarrão, batata)",
              "Proteínas (carnes, ovos)",
              "Vegetais e Saladas (verduras, legumes frescos)",
              "Sobremesa",
            ],
            correctIndex: 2,
            explanation:
              "Isso! Os vegetais enchem o prato de vitaminas, fibras e dão volume e saciedade com poucas calorias.",
          },
          {
            id: "l3-1-3",
            type: "true_false",
            character: CHARACTERS.tito,
            statement:
              "Não se pode colocar Arroz e Batata no mesmo prato, pois são carboidratos brigando por espaço.",
            isTrue: false,
            explanation:
              "Pode sim! O importante é a quantidade. Se usar dois carboidratos, é só diminuir um pouco de cada para caber na cota de 25% (um quarto) do prato.",
          },
        ],
      },
      {
        id: "lesson-3-2",
        title: "O Poder dos Temperos",
        xpReward: 75,
        minPassScore: 0.7,
        activities: [
          {
            id: "l3-2-1",
            type: "dialogue",
            character: CHARACTERS.lipe,
            text: "Comer saudável não significa comer frango seco sem sal. A culinária é mágica e os temperos naturais salvam o sabor!",
          },
          {
            id: "l3-2-2",
            type: "quiz",
            character: CHARACTERS.nina,
            question:
              "Qual dessas opções é a melhor escolha para dar sabor às refeições do dia a dia cuidando da saúde?",
            options: [
              "Cubos de caldo pronto sabor carne/galinha (altamente processados).",
              "Tempero caseiro de alho, cebola e ervas frescas/secas (orégano, manjericão, cúrcuma).",
              "Muito sal refinado puro.",
              "Margarina em grande quantidade.",
            ],
            correctIndex: 1,
            explanation:
              "Isso! Temperos naturais como alho, cebola, páprica, açafrão, orégano trazem muito sabor e ainda são anti-inflamatórios.",
          },
          {
            id: "l3-2-3",
            type: "true_false",
            character: CHARACTERS.mila,
            statement:
              "Adicionar limão por cima dos vegetais escuros (como espinafre ou couve) e no feijão aumenta a absorção do ferro.",
            isTrue: true,
            explanation:
              "Verdadeiríssimo! A vitamina C do limão ajuda o corpo a capturar melhor o ferro de origem vegetal (ferro não-heme).",
          },
        ],
      },
      {
        id: "lesson-3-3",
        title: "Planejamento Descomplicado",
        xpReward: 75,
        minPassScore: 0.7,
        activities: [
          {
            id: "l3-3-1",
            type: "dialogue",
            character: CHARACTERS.nina,
            text: "Deixar para decidir o que comer quando já está com muita fome é a receita certa para acabar pedindo fast food.",
          },
          {
            id: "l3-3-2",
            type: "quiz",
            character: CHARACTERS.lipe,
            question:
              "Qual hábito simples de planejamento previne que vegetais estraguem na gaveta da geladeira?",
            options: [
              "Esconder eles no fundo da gaveta e não olhar.",
              "Higienizar e secar as saladas no fim de semana, guardando em potes para pegar fácil durante a semana.",
              "Lavar cada folha só na hora exata de comer todos os dias.",
              "Comprar o triplo do necessário no mercado.",
            ],
            correctIndex: 1,
            explanation:
              "Perfeito! A tática de lavar as folhas e picar legumes antes reduz a preguiça nos dias de cansaço e garante a salada na mesa.",
          },
        ],
      },
    ],
  },
  {
    id: "unit-4",
    title: "Paz com a Comida",
    icon: "💚",
    description: "Acolhimento, mindful eating e o fim da cultura da restrição.",
    requiredUnitId: "unit-3",
    lessons: [
      {
        id: "lesson-4-1",
        title: "Fome Física vs. Emocional",
        xpReward: 100,
        minPassScore: 0.65,
        activities: [
          {
            id: "l4-1-1",
            type: "dialogue",
            character: CHARACTERS.nina,
            text: "Às vezes a vontade de comer não vem do estômago vazio, mas sim do coração cheio (de ansiedade, tristeza ou tédio). E está tudo bem!",
          },
          {
            id: "l4-1-2",
            type: "quiz",
            character: CHARACTERS.nina,
            question: "Qual característica descreve melhor a FOME EMOCIONAL?",
            options: [
              "Aparece aos poucos, aceita qualquer comida (arroz e feijão servem) e quando saciada te faz parar de comer.",
              "Aparece de repente, é urgente, exige algo específico (ex: chocolate) e pode não passar mesmo depois do estômago cheio.",
              "Só acontece de manhã cedo ao acordar.",
              "Sempre avisa fazendo o estômago roncar bem alto.",
            ],
            correctIndex: 1,
            explanation:
              "Exato! Identificar o tipo de fome é o primeiro passo. A emocional é urgente e direcionada a alimentos de conforto.",
          },
          {
            id: "l4-1-3",
            type: "true_false",
            character: CHARACTERS.tito,
            statement:
              "Comer por emoção é um crime contra a dieta e você deve se sentir extremamente culpado toda vez que acontecer.",
            isTrue: false,
            explanation:
              "A comida conforta, isso é biológico e humano! Apenas não deixe que seja sua ÚNICA ferramenta para lidar com as emoções.",
          },
        ],
      },
      {
        id: "lesson-4-2",
        title: "Atenção Plena (Mindful Eating)",
        xpReward: 100,
        minPassScore: 0.7,
        activities: [
          {
            id: "l4-2-1",
            type: "dialogue",
            character: CHARACTERS.mila,
            text: "Se você comer olhando pro celular no sofá, seu cérebro nem vai registrar que você comeu. A saciedade não vai vir completa.",
          },
          {
            id: "l4-2-2",
            type: "quiz",
            character: CHARACTERS.lipe,
            question: "O que é uma boa prática de 'Atenção Plena' ao comer?",
            options: [
              "Comer em pé na frente da geladeira para ir mais rápido.",
              "Desligar as telas, mastigar devagar e focar no sabor, textura e cheiro do alimento.",
              "Comer assistindo um filme de ação para a comida descer mais fácil.",
              "Engolir sem mastigar para não perder tempo.",
            ],
            correctIndex: 1,
            explanation:
              "Perfeito! Estar presente na refeição ajuda o corpo a mandar o sinal de saciedade no momento certo.",
          },
          {
            id: "l4-2-3",
            type: "true_false",
            character: CHARACTERS.nina,
            statement:
              "Apoiar o talher no prato entre uma garfada e outra é uma ótima estratégia para comer mais devagar.",
            isTrue: true,
            explanation:
              "Essa pausa força o ritmo a desacelerar, dando tempo (cerca de 20 min) pro estômago avisar o cérebro que você está satisfeito.",
          },
        ],
      },
      {
        id: "lesson-4-3",
        title: "Sem Culpa à Mesa",
        xpReward: 100,
        minPassScore: 0.7,
        activities: [
          {
            id: "l4-3-1",
            type: "dialogue",
            character: CHARACTERS.nina,
            text: "Vamos celebrar uma verdade maravilhosa da ciência nutricional atual: a mentalidade do 'Tudo ou Nada' fracassa em 95% das vezes.",
          },
          {
            id: "l4-3-2",
            type: "quiz",
            character: CHARACTERS.nina,
            question:
              "O que costuma acontecer (o efeito elástico) quando uma pessoa faz uma dieta muito extrema, cortando todos os carboidratos e doces?",
            options: [
              "Ela vive feliz para sempre e nunca mais sente fome.",
              "Ela desenvolve uma relação sustentável com a comida.",
              "Ela acaba sofrendo de frustração, desistindo e tendo episódios de compulsão ou excessos compensatórios (chutar o balde).",
              "O corpo esquece que gosta de doce no dia seguinte.",
            ],
            correctIndex: 2,
            explanation:
              "A restrição gera compulsão. Proibir completamente um alimento eleva ele a um 'pedestal', gerando fixação mental nele.",
          },
          {
            id: "l4-3-3",
            type: "true_false",
            character: CHARACTERS.lipe,
            statement:
              "Uma vida saudável tem espaço tanto para o prato de salada no almoço de terça, quanto para o brigadeiro na festa de sábado sem culpa.",
            isTrue: true,
            explanation:
              "Você gabaritou! Constância é o segredo. Uma refeição ruim não estraga uma rotina boa. Seja gentil com você!",
          },
        ],
      },
    ],
  },
];

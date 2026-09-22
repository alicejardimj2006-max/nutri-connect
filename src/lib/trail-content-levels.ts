// Níveis Médio (2) e Difícil (3) de cada parada, além do visual (ícone/resumo) de cada uma.
// Nível Médio: aplica o que foi aprendido. Nível Difícil: situações reais, ordem de passos e várias respostas.
import { CHARACTERS, type Activity, type CharacterId } from "./trail-types";

/** Atividade sem `id` (o id é gerado ao montar a trilha). */
export type Draft = Activity extends infer A ? (A extends Activity ? Omit<A, "id"> : never) : never;

export const c = (id: CharacterId) => CHARACTERS[id];

/**
 * Embaralha as alternativas de forma estável (semente = enunciado). Assim o conteúdo pode ser
 * escrito com a resposta certa primeiro, sem que a certa fique sempre na mesma posição.
 */
export function permutation(length: number, seed: string): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822519);
    h = Math.imul(h ^ (h >>> 13), 3266489917);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
  const order = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export const say = (who: CharacterId, text: string): Draft => ({
  type: "dialogue",
  character: c(who),
  text,
});

export const quiz = (
  who: CharacterId,
  question: string,
  options: string[],
  correctIndex: number,
  explanation: string,
): Draft => {
  const perm = permutation(options.length, question);
  return {
    type: "quiz",
    character: c(who),
    question,
    options: perm.map((i) => options[i]),
    correctIndex: perm.indexOf(correctIndex),
    explanation,
  };
};

export const tf = (
  who: CharacterId,
  statement: string,
  isTrue: boolean,
  explanation: string,
): Draft => ({
  type: "true_false",
  character: c(who),
  statement,
  isTrue,
  explanation,
});

export const multi = (
  who: CharacterId,
  question: string,
  options: string[],
  correctIndexes: number[],
  explanation: string,
): Draft => {
  const perm = permutation(options.length, question);
  return {
    type: "multi",
    character: c(who),
    question,
    options: perm.map((i) => options[i]),
    correctIndexes: correctIndexes.map((i) => perm.indexOf(i)).sort((a, b) => a - b),
    explanation,
  };
};

export const match = (
  who: CharacterId,
  prompt: string,
  pairs: [string, string][],
  explanation: string,
): Draft => ({
  type: "match",
  character: c(who),
  prompt,
  pairs: pairs.map(([left, right]) => ({ left, right })),
  explanation,
});

export const order = (
  who: CharacterId,
  prompt: string,
  items: string[],
  explanation: string,
): Draft => ({
  type: "order",
  character: c(who),
  prompt,
  items,
  explanation,
});

export const slider = (
  who: CharacterId,
  question: string,
  range: { min: number; max: number; step?: number; unit: string },
  target: number,
  tolerance: number,
  explanation: string,
): Draft => ({
  type: "slider",
  character: c(who),
  question,
  min: range.min,
  max: range.max,
  step: range.step,
  unit: range.unit,
  target,
  tolerance,
  explanation,
});

export const scenario = (
  who: CharacterId,
  setup: string,
  question: string,
  options: string[],
  correctIndex: number,
  explanation: string,
): Draft => {
  const perm = permutation(options.length, setup + question);
  return {
    type: "scenario",
    character: c(who),
    setup,
    question,
    options: perm.map((i) => options[i]),
    correctIndex: perm.indexOf(correctIndex),
    explanation,
  };
};

export const reflect = (who: CharacterId, prompt: string, placeholder?: string): Draft => ({
  type: "reflect",
  character: c(who),
  prompt,
  placeholder,
});

export interface StopExtras {
  /** Perguntas fáceis adicionadas ao nível 1 (o conteúdo base tem poucas nas paradas mais curtas). */
  level1Extra?: Draft[];
  icon: string;
  summary: string;
  level2: Draft[];
  level3: Draft[];
}

export const STOP_EXTRAS: Record<string, StopExtras> = {
  // ───────────────────────── Unidade 1 · Bases da Alimentação ─────────────────────────
  "lesson-1-1": {
    icon: "🥑",
    summary: "Carboidratos, proteínas e gorduras: o combustível e as peças do corpo.",
    level2: [
      say("nina", "Hora de praticar! Vamos ligar cada nutriente ao papel que ele faz no corpo."),
      match(
        "nina",
        "Ligue cada nutriente à sua função principal:",
        [
          ["Carboidratos", "Energia rápida"],
          ["Proteínas", "Construir e reparar tecidos"],
          ["Gorduras boas", "Reserva de energia e absorção de vitaminas"],
          ["Vitaminas", "Regular o funcionamento do corpo"],
        ],
        "Cada grupo tem um papel! Por isso o prato ideal mistura vários deles, sem excluir nenhum.",
      ),
      quiz(
        "lipe",
        "Qual refeição reúne carboidrato, proteína e vegetais ao mesmo tempo?",
        [
          "Arroz, feijão, ovo mexido e couve refogada",
          "Refrigerante e batata frita",
          "Só uma maçã",
          "Biscoito recheado e suco de caixinha",
        ],
        0,
        "Arroz (carboidrato), feijão e ovo (proteínas) e couve (vegetal) formam uma refeição completa e barata.",
      ),
      tf(
        "tito",
        "Arroz com feijão é uma dupla que fornece carboidratos e proteínas.",
        true,
        "Isso mesmo! Além disso, o feijão traz fibras e ferro. Uma combinação brasileira e nutritiva.",
      ),
      multi(
        "mila",
        "Marque TODAS as boas fontes de proteína:",
        ["Ovos", "Lentilha", "Peixe", "Alface", "Geleia"],
        [0, 1, 2],
        "Ovos, lentilha e peixe são ricos em proteína. Alface tem muita água e vitaminas, e geleia é basicamente açúcar.",
      ),
    ],
    level3: [
      say("lipe", "Agora é pra especialista! Vou te dar situações do dia a dia. Bora?"),
      quiz(
        "nina",
        "Depois de um treino, Ana quer ajudar os músculos a se recuperarem. Qual lanche faz mais sentido?",
        ["Iogurte natural com frutas e aveia", "Refrigerante", "Balas e chicletes", "Batata chips"],
        0,
        "Proteína (iogurte) + carboidratos (fruta e aveia) ajudam na recuperação e repõem a energia gasta.",
      ),
      tf(
        "lipe",
        "Abacate e azeite de oliva são fontes de gorduras boas (insaturadas).",
        true,
        "Verdade! Gorduras insaturadas ajudam o coração e a absorver as vitaminas A, D, E e K.",
      ),
      multi(
        "tito",
        "Marque as afirmações VERDADEIRAS sobre os carboidratos:",
        [
          "São a principal fonte de energia do cérebro",
          "Versões integrais costumam ter mais fibras",
          "Todo carboidrato é exatamente igual",
          "Existem naturalmente em frutas e raízes",
        ],
        [0, 1, 3],
        "Nem todo carboidrato é igual: os integrais e os naturais (frutas, raízes) vêm com fibras e nutrientes.",
      ),
      order(
        "nina",
        "Coloque do MENOS para o MAIS processado:",
        ["Mandioca cozida", "Farinha de mandioca", "Pão de forma", "Biscoito recheado"],
        "Quanto mais etapas industriais e ingredientes, mais processado. A mandioca cozida está quase como veio da terra.",
      ),
      match(
        "mila",
        "Ligue o alimento ao nutriente que predomina nele:",
        [
          ["Pão integral", "Carboidratos"],
          ["Ovo cozido", "Proteínas"],
          ["Castanhas", "Gorduras boas"],
          ["Laranja", "Vitamina C"],
        ],
        "Saber o que cada alimento oferece ajuda a montar refeições completas.",
      ),
      quiz(
        "cadu",
        "Uma dieta 'só de proteína' seria o ideal?",
        [
          "Sim, porque proteína é o nutriente mais importante",
          "Não: o corpo precisa de todos os grupos em equilíbrio",
          "Sim, porque carboidrato faz mal",
          "Só se for de manhã",
        ],
        1,
        "Nenhum nutriente trabalha sozinho. Equilíbrio e variedade são a base de uma alimentação saudável.",
      ),
    ],
  },

  "lesson-1-2": {
    icon: "🍊",
    summary: "Vitaminas e minerais: pequenos nutrientes com funções gigantes.",
    level2: [
      say(
        "mila",
        "Vamos treinar a memória das vitaminas e minerais. Prepare-se para ligar os pontos!",
      ),
      match(
        "mila",
        "Ligue o nutriente a boas fontes dele:",
        [
          ["Vitamina C", "Acerola e laranja"],
          ["Cálcio", "Leite, iogurte e couve"],
          ["Ferro", "Feijão e folhas verde-escuras"],
          ["Vitamina A", "Cenoura e abóbora"],
        ],
        "Variar as cores e os grupos de alimentos é a forma mais fácil de ter todos esses nutrientes.",
      ),
      quiz(
        "cadu",
        "Por que é bom montar um prato bem colorido?",
        [
          "Cada cor costuma trazer nutrientes diferentes",
          "Só porque fica bonito na foto",
          "Cores diferentes têm as mesmas vitaminas",
          "Para comer menos",
        ],
        0,
        "As cores vêm de pigmentos e nutrientes distintos. Quanto mais cores naturais, mais variedade nutricional.",
      ),
      tf(
        "nina",
        "As vitaminas fornecem calorias (energia) como os carboidratos.",
        false,
        "Vitaminas e minerais não dão energia, mas ajudam o corpo a usar a energia dos outros nutrientes.",
      ),
      multi(
        "lipe",
        "Marque as boas fontes de vitamina C:",
        ["Acerola", "Laranja", "Pão branco", "Goiaba", "Arroz"],
        [0, 1, 3],
        "Acerola, laranja e goiaba estão entre as campeãs de vitamina C. Goiaba tem mais que a laranja!",
      ),
    ],
    level3: [
      say("mila", "Desafio de especialista: agora as vitaminas vão trabalhar em equipe!"),
      quiz(
        "nina",
        "Para o corpo absorver melhor o ferro do feijão, o que combinar na refeição?",
        [
          "Uma fruta cítrica ou umas gotas de limão",
          "Um café logo depois",
          "Um refrigerante",
          "Nada muda a absorção",
        ],
        0,
        "A vitamina C ajuda a absorver o ferro de origem vegetal. Já o café perto da refeição atrapalha.",
      ),
      tf(
        "lipe",
        "Tomar um pouco de sol com moderação ajuda o corpo a produzir vitamina D.",
        true,
        "A pele produz vitamina D com a luz do sol. Ela ajuda a fixar o cálcio nos ossos.",
      ),
      order(
        "tito",
        "Coloque na ordem para preparar um legume preservando os nutrientes:",
        [
          "Lave bem o legume",
          "Corte em pedaços grandes",
          "Cozinhe rápido no vapor, com pouca água",
          "Sirva logo em seguida",
        ],
        "Pedaços grandes, pouca água e tempo curto perdem menos vitaminas, que são sensíveis ao calor e à água.",
      ),
      multi(
        "mila",
        "Quais hábitos ajudam a preservar as vitaminas dos vegetais?",
        [
          "Cozinhar no vapor por pouco tempo",
          "Ferver por horas em muita água",
          "Comer parte deles crus, em saladas",
          "Deixar picados por dias ao sol",
        ],
        [0, 2],
        "Vapor rápido e alguns vegetais crus mantêm mais nutrientes do que longos cozimentos.",
      ),
      quiz(
        "cadu",
        "A vitamina A, presente na cenoura e na abóbora, é importante principalmente para:",
        [
          "A visão e a saúde da pele",
          "Aumentar a massa muscular",
          "Digerir o açúcar",
          "Deixar o cabelo vermelho",
        ],
        0,
        "A vitamina A cuida da visão, da pele e das defesas do corpo. Cadu aprova!",
      ),
    ],
  },

  "lesson-1-3": {
    icon: "💧",
    summary: "Água e fibras: hidratação, saciedade e um intestino feliz.",
    level2: [
      say("tito", "Água e fibras são meus superpoderes! Vamos ver se você já domina."),
      match(
        "nina",
        "Ligue cada item ao que ele representa:",
        [
          ["Água", "Transporta nutrientes e regula a temperatura"],
          ["Fibras", "Ajudam o intestino e dão saciedade"],
          ["Sede", "Sinal de que o corpo já precisa de água"],
          ["Urina bem clara", "Sinal de boa hidratação"],
        ],
        "Observar o corpo é uma ótima forma de saber se você está bem hidratado.",
      ),
      quiz(
        "tito",
        "Qual opção tem MAIS fibras?",
        ["Laranja com bagaço", "Suco de laranja coado", "Refrigerante de laranja", "Gelatina"],
        0,
        "Ao coar o suco, as fibras ficam para trás. A fruta inteira mantém tudo e ainda sacia mais.",
      ),
      tf(
        "mila",
        "Ao comer mais fibras, também é importante beber mais água.",
        true,
        "A água ajuda as fibras a fazerem seu trabalho no intestino sem causar desconforto.",
      ),
      multi(
        "lipe",
        "Marque as boas fontes de fibras:",
        ["Feijão", "Aveia", "Frutas com casca", "Refrigerante", "Pão branco"],
        [0, 1, 2],
        "Leguminosas, cereais integrais e frutas com casca são ricos em fibras.",
      ),
    ],
    level3: [
      say("tito", "Nível especialista! Vamos analisar situações do dia a dia."),
      quiz(
        "nina",
        "Rafa quer trocar o suco de caixinha do lanche da escola. Qual é a melhor troca?",
        [
          "Uma fruta inteira e água",
          "Refrigerante zero",
          "Outra caixinha de sabor diferente",
          "Bala de fruta",
        ],
        0,
        "A fruta inteira traz fibras, vitaminas e sacia, e a água hidrata sem açúcar adicionado.",
      ),
      multi(
        "mila",
        "Quais são possíveis sinais de que você precisa de mais água?",
        ["Urina bem escura", "Boca seca", "Sede", "Cabelo brilhante"],
        [0, 1, 2],
        "Urina escura, boca seca e sede são avisos do corpo. Vale beber água ao longo do dia.",
      ),
      tf(
        "lipe",
        "As fibras alimentares existem apenas em alimentos de origem vegetal.",
        true,
        "Fibras vêm de frutas, legumes, verduras, grãos e sementes. Carnes e leite não têm fibras.",
      ),
      quiz(
        "cadu",
        "A quantidade de água ideal por dia é a mesma para todo mundo?",
        [
          "Sim, sempre 2 litros exatos",
          "Não, varia com idade, clima, atividade e alimentação",
          "Sim, 8 copos para todos",
          "Só importa no verão",
        ],
        1,
        "As necessidades mudam de pessoa para pessoa e de dia para dia. Ouça seu corpo e beba ao longo do dia.",
      ),
      match(
        "tito",
        "Ligue o hábito ao benefício:",
        [
          ["Comer fruta com casca", "Mais fibras"],
          ["Beber água ao longo do dia", "Boa hidratação"],
          ["Trocar pão branco por integral", "Mais saciedade"],
          ["Incluir feijão no prato", "Proteína e fibras juntas"],
        ],
        "Pequenas trocas do dia a dia somam muito ao longo do tempo.",
      ),
    ],
  },

  // ───────────────────────── Unidade 2 · Entendendo os Alimentos ─────────────────────────
  "lesson-2-1": {
    level1Extra: [
      tf(
        "cadu",
        "Frutas, legumes e ovos são exemplos de alimentos in natura.",
        true,
        "Isso mesmo! São alimentos como vêm da natureza, sem passar por indústrias.",
      ),
      quiz(
        "mila",
        "Qual destes alimentos é o MENOS processado?",
        ["Maçã", "Bala de goma", "Biscoito recheado", "Salsicha"],
        0,
        "A maçã vem direto da árvore. Os outros passam por muitas etapas industriais.",
      ),
    ],
    icon: "🌽",
    summary: "In natura, processados e ultraprocessados: como a comida chega ao prato.",
    level2: [
      say("nina", "Vamos treinar o olhar de detetive: quanto processamento tem cada alimento?"),
      match(
        "nina",
        "Ligue o alimento à sua classificação:",
        [
          ["Milho na espiga", "In natura"],
          ["Fubá", "Minimamente processado"],
          ["Milho em lata", "Processado"],
          ["Salgadinho de milho", "Ultraprocessado"],
        ],
        "Quanto mais etapas industriais e aditivos, mais processado o alimento.",
      ),
      quiz(
        "tito",
        "Qual destes é um alimento ultraprocessado?",
        ["Refrigerante", "Feijão cozido", "Ovo cozido", "Iogurte natural"],
        0,
        "Refrigerantes são fórmulas industriais de açúcar, aromas e aditivos. Os outros são alimentos de verdade!",
      ),
      tf(
        "mila",
        "Congelar frutas as transforma em ultraprocessados.",
        false,
        "Congelar é só uma forma de conservar: a fruta continua sendo minimamente processada.",
      ),
      multi(
        "lipe",
        "Marque os alimentos in natura ou minimamente processados:",
        ["Arroz integral", "Leite", "Nuggets", "Macarrão instantâneo", "Fubá"],
        [0, 1, 4],
        "Nuggets e macarrão instantâneo têm muitos aditivos: são ultraprocessados.",
      ),
    ],
    level3: [
      say("nina", "Agora a regra de ouro: 'descasque mais, desembale menos'. Vamos aplicar!"),
      order(
        "tito",
        "Coloque do MENOS para o MAIS processado:",
        ["Tomate fresco", "Tomate pelado em lata", "Ketchup", "Salgadinho sabor pizza"],
        "O tomate muda pouco na lata. O ketchup e o salgadinho levam açúcar, aditivos e aromas.",
      ),
      quiz(
        "cadu",
        "No lanche da escola, qual escolha segue o 'descasque mais, desembale menos'?",
        [
          "Banana e um punhado de castanhas",
          "Biscoito recheado",
          "Salgadinho de pacote",
          "Bebida láctea de caixinha",
        ],
        0,
        "Banana e castanhas praticamente não têm processamento e dão energia por mais tempo.",
      ),
      tf(
        "lipe",
        "Ultraprocessados costumam ter muito açúcar, sódio, gorduras e aditivos.",
        true,
        "Eles são feitos para serem muito saborosos e durarem muito, o que faz a gente comer mais.",
      ),
      multi(
        "nina",
        "Quais são sinais de um ultraprocessado no rótulo?",
        [
          "Lista longa com ingredientes que você não tem em casa",
          "Corantes e aromatizantes",
          "Apenas 'tomate' e 'sal'",
          "Realçadores de sabor",
        ],
        [0, 1, 3],
        "Se a lista parece uma receita de laboratório, provavelmente é ultraprocessado.",
      ),
      quiz(
        "mila",
        "Qual é o objetivo mais realista para uma alimentação saudável?",
        [
          "Nunca mais comer ultraprocessados",
          "Priorizar alimentos de verdade no dia a dia, com flexibilidade",
          "Contar cada ingrediente de cada refeição",
          "Comer só alimentos crus",
        ],
        1,
        "O foco é a maior parte do tempo. Flexibilidade é o que torna o hábito sustentável.",
      ),
    ],
  },

  "lesson-2-2": {
    level1Extra: [
      quiz(
        "cadu",
        "Onde encontramos a lista de ingredientes de um produto?",
        [
          "No verso ou na lateral da embalagem",
          "Só no site do supermercado",
          "Na nota fiscal",
          "Ela não existe",
        ],
        0,
        "Todo alimento embalado traz a lista de ingredientes. Vale sempre dar uma olhada!",
      ),
    ],
    icon: "🔎",
    summary: "Lista de ingredientes: descubra o que realmente tem no pacote.",
    level2: [
      say("mila", "Preparado para investigar rótulos? Vamos praticar com nomes disfarçados!"),
      match(
        "nina",
        "Ligue o nome ao que ele significa no rótulo:",
        [
          ["Xarope de milho", "Um tipo de açúcar"],
          ["Maltodextrina", "Carboidrato de absorção rápida"],
          ["Farinha integral", "Fonte de fibras"],
          ["Glutamato monossódico", "Realçador de sabor"],
        ],
        "O açúcar e os aditivos têm muitos nomes. Reconhecê-los é ganhar poder de escolha.",
      ),
      quiz(
        "tito",
        "Um cereal matinal lista: 'açúcar, farinha de trigo, xarope de glicose...'. O que isso indica?",
        [
          "Que ele é feito principalmente de açúcar e farinha refinada",
          "Que é rico em fibras",
          "Que não tem açúcar",
          "Que é 100% natural",
        ],
        0,
        "Os primeiros ingredientes são os que aparecem em maior quantidade. Açúcar em primeiro lugar é alerta!",
      ),
      tf(
        "lipe",
        "Quanto mais curta e simples a lista de ingredientes, em geral melhor.",
        true,
        "Listas curtas com ingredientes que você reconhece costumam indicar alimentos menos processados.",
      ),
      multi(
        "cadu",
        "Quais nomes indicam açúcar adicionado?",
        ["Xarope de glicose", "Açúcar invertido", "Farinha integral", "Maltodextrina", "Aveia"],
        [0, 1, 3],
        "Xaropes, açúcar invertido e maltodextrina são formas de açúcar adicionadas pela indústria.",
      ),
    ],
    level3: [
      say("mila", "Agora é a prova de detetive: comparar produtos de verdade!"),
      quiz(
        "nina",
        "Produto A: 'aveia, banana, canela'. Produto B: 'açúcar, farinha, gordura hidrogenada, aromatizante'. Qual tem a lista mais simples?",
        ["O produto A", "O produto B", "Os dois são iguais", "Não dá para saber"],
        0,
        "O produto A tem poucos ingredientes reconhecíveis. É um ótimo sinal!",
      ),
      tf(
        "tito",
        "Um produto 'zero açúcar' sempre é um alimento saudável.",
        false,
        "Zero açúcar pode ter adoçantes e outros aditivos. Leia a lista completa antes de decidir.",
      ),
      multi(
        "lipe",
        "Quais são pistas de que um pão 'integral' pode não ser tão integral?",
        [
          "Farinha refinada como primeiro ingrediente",
          "Corante caramelo na lista",
          "Farinha integral como primeiro ingrediente",
          "A cor escura, apenas",
        ],
        [0, 1, 3],
        "Cor escura pode vir de corante! O primeiro ingrediente precisa ser farinha integral.",
      ),
      match(
        "mila",
        "Ligue o termo ao seu significado:",
        [
          ["Farinha de trigo enriquecida", "Refinada, com pouca fibra"],
          ["Ingrediente listado primeiro", "O que existe em maior quantidade"],
          ["Contém leite e soja", "Aviso sobre alérgenos"],
          ["Prazo de validade", "Até quando o fabricante garante a qualidade"],
        ],
        "Cada parte do rótulo tem uma função. Saber ler tudo protege a sua saúde.",
      ),
      quiz(
        "cadu",
        "Qual é a primeira coisa a olhar num rótulo para saber se o produto é uma boa escolha?",
        [
          "Os primeiros ingredientes da lista",
          "As cores da embalagem",
          "Os desenhos do mascote",
          "A frase 'natural' na frente",
        ],
        0,
        "O marketing da frente pode enganar. A lista de ingredientes conta a verdade.",
      ),
    ],
  },

  "lesson-2-3": {
    level1Extra: [
      tf(
        "lipe",
        "A tabela nutricional mostra os valores por porção do produto.",
        true,
        "Sim! Por isso sempre olhamos o tamanho da porção primeiro.",
      ),
      quiz(
        "mila",
        "O 'sódio' que aparece na tabela nutricional é um componente de qual ingrediente?",
        ["Do sal", "Das vitaminas", "Das fibras", "Das gorduras boas"],
        0,
        "O sódio vem principalmente do sal. Em excesso, pode aumentar a pressão arterial.",
      ),
    ],
    icon: "📋",
    summary: "Tabela nutricional: porção, %VD e o que vale comparar.",
    level2: [
      say("nina", "Tabela nutricional na mão! Vamos praticar as contas e as comparações."),
      match(
        "nina",
        "Ligue cada item da tabela ao que ele quer dizer:",
        [
          ["Porção", "A quantidade a que os números se referem"],
          ["Sódio", "Vem do sal; em excesso pesa na pressão"],
          ["Açúcares adicionados", "Açúcar colocado pela indústria"],
          ["Fibra alimentar", "Ajuda a saciedade e o intestino"],
        ],
        "Olhar a porção primeiro evita os números enganosos.",
      ),
      quiz(
        "lipe",
        "Um pacote tem 4 porções de 30 g. Se você comer tudo, os valores da tabela devem ser multiplicados por:",
        ["1", "2", "4", "30"],
        2,
        "A tabela mostra os valores de UMA porção. Comer o pacote inteiro é comer 4 porções.",
      ),
      tf(
        "tito",
        "Os valores diários (%VD) se baseiam em uma dieta de referência de 2.000 kcal.",
        true,
        "É uma referência geral. As necessidades reais variam de pessoa para pessoa.",
      ),
      multi(
        "mila",
        "O que vale olhar ao comparar dois produtos?",
        ["A porção", "Os açúcares adicionados", "A cor da embalagem", "O sódio"],
        [0, 1, 3],
        "Compare sempre na mesma quantidade (por 100 g, por exemplo) e olhe açúcares e sódio.",
      ),
    ],
    level3: [
      say("nina", "Última fase da tabela! Agora entram %VD, comparações e decisões."),
      match(
        "tito",
        "Ligue o %VD à sua interpretação:",
        [
          ["20% VD ou mais por porção", "Alto"],
          ["5% VD ou menos por porção", "Baixo"],
          ["Fibra com %VD alto", "Em geral, ótimo!"],
          ["Sódio com %VD alto", "Atenção ao excesso"],
        ],
        "Para nutrientes que queremos em menor quantidade, %VD alto é alerta. Para fibras, é bem-vindo.",
      ),
      quiz(
        "cadu",
        "Um produto tem 30% do VD de sódio por porção. Isso significa:",
        [
          "Quase um terço do limite diário em uma só porção",
          "Muito pouco sal",
          "Que ele não tem sal",
          "Que é sempre saudável",
        ],
        0,
        "Se você come mais de uma porção, o valor sobe rapidamente. Vale escolher versões com menos sódio.",
      ),
      order(
        "nina",
        "Coloque na ordem os passos para ler uma tabela:",
        [
          "Ver o tamanho da porção",
          "Calcular quanto você realmente vai comer",
          "Olhar açúcares, sódio e gorduras",
          "Comparar com outro produto parecido",
        ],
        "Começar pela porção evita comparar coisas diferentes.",
      ),
      multi(
        "lipe",
        "Quais nutrientes, em geral, devemos limitar?",
        ["Sódio", "Gordura saturada", "Fibra alimentar", "Açúcares adicionados"],
        [0, 1, 3],
        "Já a fibra é um nutriente para buscar mais, não para limitar.",
      ),
      tf(
        "mila",
        "Um alto %VD de fibras é um problema.",
        false,
        "Fibras são amigas: ajudam a saciedade e o intestino. Quanto mais, melhor (com água!).",
      ),
    ],
  },

  // ───────────────────────── Unidade 3 · Montando Seu Prato ─────────────────────────
  "lesson-3-1": {
    level1Extra: [
      tf(
        "cadu",
        "Um prato bem colorido costuma ser mais nutritivo.",
        true,
        "As cores naturais indicam vitaminas e minerais diferentes. Quanto mais cores, melhor!",
      ),
      quiz(
        "nina",
        "No prato equilibrado, quanto é ocupado pelas proteínas?",
        ["Cerca de um quarto", "Metade", "Nada", "O prato todo"],
        0,
        "Um quarto de proteínas, um quarto de carboidratos e metade de vegetais.",
      ),
    ],
    icon: "🍽️",
    summary: "O prato equilibrado: proporções simples para o almoço e o jantar.",
    level2: [
      say("nina", "Vamos montar pratos de verdade! Onde cada grupo de alimentos se encaixa?"),
      match(
        "mila",
        "Ligue a parte do prato ao que deve ocupar:",
        [
          ["Metade do prato", "Vegetais e saladas"],
          ["Um quarto: energia", "Carboidratos (arroz, batata)"],
          ["Um quarto: construção", "Proteínas (feijão, ovo, carne)"],
        ],
        "É uma regra visual simples: sem balança e sem contar calorias.",
      ),
      quiz(
        "lipe",
        "Qual prato está mais equilibrado?",
        [
          "Salada colorida, arroz, feijão e ovo",
          "Só macarrão com molho pronto",
          "Só carne assada",
          "Batata frita e refrigerante",
        ],
        0,
        "Vegetais, carboidrato e proteína juntos: um prato completo e barato.",
      ),
      tf(
        "tito",
        "O feijão é uma boa fonte de proteínas e de fibras.",
        true,
        "Além de proteínas e fibras, o feijão traz ferro. Combina perfeitamente com o arroz!",
      ),
      multi(
        "cadu",
        "Marque os alimentos que podem ocupar o quarto das proteínas:",
        ["Ovo", "Feijão", "Frango", "Macarrão", "Peixe"],
        [0, 1, 2, 4],
        "Macarrão é fonte de carboidrato, o que também é ótimo, mas ocupa outro quarto do prato.",
      ),
    ],
    level3: [
      say("nina", "Situações reais de prato! Vamos usar o que você já sabe."),
      quiz(
        "mila",
        "No restaurante por quilo, você já colocou arroz e batata. O que fazer com o resto do prato?",
        [
          "Reduzir um pouco de cada e completar com muita salada e uma proteína",
          "Colocar só mais batata",
          "Completar com sobremesa",
          "Deixar o prato pela metade",
        ],
        0,
        "Os vegetais preenchem metade, e a proteína completa. Dois carboidratos cabem se dividirem um quarto.",
      ),
      order(
        "lipe",
        "Coloque na ordem para montar o prato sem esquecer nada:",
        [
          "Comece pelos vegetais e saladas",
          "Adicione a fonte de proteína",
          "Complete com o carboidrato",
          "Finalize com um fio de azeite e temperos",
        ],
        "Começar pelos vegetais garante que eles ocupem a metade do prato.",
      ),
      tf(
        "tito",
        "No prato equilibrado, sobremesa doce todos os dias é proibida.",
        false,
        "Nada é proibido! O equilíbrio vale para a semana toda. Fruta de sobremesa é uma ótima ideia.",
      ),
      multi(
        "cadu",
        "Como deixar o prato mais colorido e nutritivo?",
        ["Cenoura ralada", "Beterraba", "Só alimentos brancos", "Folhas verde-escuras"],
        [0, 1, 3],
        "Cada cor natural traz nutrientes diferentes. Quanto mais cores, melhor!",
      ),
      match(
        "nina",
        "Ligue a refeição à sugestão de montagem:",
        [
          ["Almoço", "Salada, arroz, feijão e ovo"],
          ["Lanche", "Fruta com iogurte natural"],
          ["Jantar leve", "Sopa de legumes com frango desfiado"],
          ["Café da manhã", "Pão integral, ovo e fruta"],
        ],
        "Montar refeições é criatividade! Combine vegetais, proteína e uma fonte de energia.",
      ),
    ],
  },

  "lesson-3-2": {
    level1Extra: [
      tf(
        "tito",
        "Alho e cebola são temperos naturais muito usados na cozinha brasileira.",
        true,
        "Eles são a base de muitos refogados e dão sabor sem precisar de muito sal.",
      ),
      quiz(
        "cadu",
        "Qual tempero dá uma cor dourada aos pratos?",
        ["Cúrcuma (açafrão-da-terra)", "Sal refinado", "Açúcar", "Vinagre"],
        0,
        "A cúrcuma tem cor dourada e sabor suave, ótima em arroz, ovos e legumes.",
      ),
    ],
    icon: "🌿",
    summary: "Temperos naturais: muito sabor com pouco sal e sem cubinhos.",
    level2: [
      say("lipe", "Temperos naturais fazem mágica! Vamos conhecê-los melhor."),
      match(
        "lipe",
        "Ligue o tempero ao que ele faz de melhor:",
        [
          ["Alho", "Sabor marcante para refogados"],
          ["Cúrcuma", "Cor dourada e sabor terroso"],
          ["Limão", "Acidez que realça o sabor"],
          ["Orégano", "Erva seca ótima em molhos"],
        ],
        "Ervas, especiarias e cítricos dão sabor sem precisar de muito sal.",
      ),
      quiz(
        "nina",
        "Para reduzir o sal sem perder o sabor, o que usar?",
        [
          "Ervas, limão e alho",
          "Mais cubinhos de caldo",
          "Sal grosso no lugar do fino",
          "Molho pronto",
        ],
        0,
        "Ervas e cítricos dão sabor de sobra. Sal grosso tem o mesmo sódio do fino!",
      ),
      tf(
        "mila",
        "O sal rosa ou do Himalaia não tem sódio.",
        false,
        "Todo sal é feito de sódio e cloro. O tipo muda a cor e o cristal, não o sódio.",
      ),
      multi(
        "cadu",
        "Marque os temperos naturais:",
        ["Salsinha", "Cebolinha", "Caldo em cubo", "Cominho", "Realçador de sabor"],
        [0, 1, 3],
        "Caldos em cubo e realçadores são industrializados e concentrados em sódio.",
      ),
    ],
    level3: [
      say("lipe", "Missão de chef! Vamos aplicar os temperos em situações reais."),
      quiz(
        "nina",
        "O frango grelhado ficou sem graça. Qual combinação melhora o sabor sem exagerar no sal?",
        [
          "Alho, limão, páprica e ervas",
          "Sal em dobro",
          "Um cubo de caldo por porção",
          "Molho de pacote",
        ],
        0,
        "Marinar com alho, limão e ervas dá sabor profundo e ainda deixa a carne mais macia.",
      ),
      tf(
        "tito",
        "Ervas frescas delicadas, como manjericão, devem entrar no final do cozimento.",
        true,
        "O calor prolongado apaga o aroma das ervas delicadas. Coloque no final ou na hora de servir.",
      ),
      order(
        "mila",
        "Coloque na ordem um refogado básico:",
        [
          "Aqueça um fio de azeite",
          "Doure a cebola",
          "Junte o alho por último",
          "Adicione os legumes ou o feijão",
        ],
        "O alho queima rápido e amarga. Entra depois da cebola, quando o refogado já está no ponto.",
      ),
      multi(
        "lipe",
        "Quais são vantagens dos temperos naturais?",
        [
          "Menos sódio no prato",
          "Mais sabor e aroma",
          "Aditivos artificiais",
          "Compostos antioxidantes",
        ],
        [0, 1, 3],
        "Temperos naturais trazem sabor e ainda compostos que fazem bem à saúde.",
      ),
      match(
        "cadu",
        "Ligue a erva ao prato que combina:",
        [
          ["Manjericão", "Massas e molhos de tomate"],
          ["Coentro", "Peixes, caldos e saladas"],
          ["Hortelã", "Sucos, saladas e iogurtes"],
          ["Alecrim", "Assados e batatas"],
        ],
        "Cada erva tem seu casamento perfeito. Vale experimentar combinações novas!",
      ),
    ],
  },

  "lesson-3-3": {
    level1Extra: [
      tf(
        "mila",
        "Fazer uma lista antes de ir ao mercado ajuda a comprar só o necessário.",
        true,
        "A lista evita compras por impulso, economiza dinheiro e reduz desperdício.",
      ),
      quiz(
        "tito",
        "O que é uma marmita planejada?",
        [
          "Uma refeição preparada com antecedência",
          "Um tipo de sobremesa",
          "Um utensílio caro",
          "Um alimento industrial",
        ],
        0,
        "Marmitas prontas facilitam manter a alimentação em dia, mesmo nos dias corridos.",
      ),
      tf(
        "cadu",
        "Congelar porções de comida ajuda a evitar desperdício.",
        true,
        "Congelar em porções permite comer no momento certo, sem perder nada.",
      ),
    ],
    icon: "🛒",
    summary: "Planejamento sem drama: mercado, marmitas e menos desperdício.",
    level2: [
      say("nina", "Planejar é cuidar de você no futuro! Vamos treinar essas estratégias."),
      quiz(
        "nina",
        "Qual é o melhor momento para fazer a lista de compras?",
        [
          "Antes de ir ao mercado, olhando a geladeira e sem fome",
          "Já dentro do mercado, com fome",
          "Depois de passar no caixa",
          "Nunca, comprar por impulso é melhor",
        ],
        0,
        "Lista feita com calma evita compras por impulso e desperdício.",
      ),
      tf(
        "lipe",
        "Ir ao mercado com muita fome ajuda a fazer boas escolhas.",
        false,
        "Com fome, tudo parece mais gostoso e o carrinho enche de ultraprocessados. Vá alimentado!",
      ),
      match(
        "mila",
        "Ligue a estratégia ao benefício:",
        [
          ["Lista de compras", "Evita compras por impulso"],
          ["Congelar porções", "Evita desperdício"],
          ["Cozinhar em lote", "Poupa tempo na semana"],
          ["Lavar folhas no domingo", "Salada pronta em minutos"],
        ],
        "Pequenos preparos reduzem o cansaço nos dias corridos.",
      ),
      multi(
        "tito",
        "Marque os hábitos de planejamento:",
        [
          "Lavar as folhas no domingo",
          "Congelar porções",
          "Comprar sem lista",
          "Cozinhar uma base de feijão para a semana",
        ],
        [0, 1, 3],
        "Feijão pronto no congelador salva qualquer refeição corrida.",
      ),
    ],
    level3: [
      say("nina", "Desafio final de planejamento: organizar uma semana inteira!"),
      order(
        "lipe",
        "Coloque na ordem a rotina de preparo de domingo:",
        [
          "Planejar o cardápio",
          "Fazer a lista de compras",
          "Comprar os itens",
          "Higienizar e guardar",
          "Cozinhar as bases",
        ],
        "Planejar primeiro evita comprar o que não precisa e cozinhar o que não vai usar.",
      ),
      quiz(
        "mila",
        "Sem tempo para cozinhar durante a semana, qual estratégia ajuda mais?",
        [
          "Cozinhar em lote no fim de semana e congelar porções",
          "Pedir delivery todos os dias",
          "Pular refeições",
          "Comer só lanches",
        ],
        0,
        "Refeições congeladas em porções dão praticidade sem abrir mão do que é feito em casa.",
      ),
      tf(
        "cadu",
        "Frutas e legumes da estação costumam ser mais baratos e mais saborosos.",
        true,
        "Na safra há mais oferta, o preço cai e o alimento amadurece no tempo certo.",
      ),
      multi(
        "tito",
        "Como reduzir o desperdício de alimentos?",
        [
          "Usar talos e cascas em receitas",
          "Guardar tudo no fundo da geladeira",
          "Congelar as sobras",
          "Organizar 'o que vence primeiro sai primeiro'",
        ],
        [0, 2, 3],
        "Talos de brócolis, por exemplo, rendem refogados e sopas deliciosos!",
      ),
      match(
        "nina",
        "Ligue a sobra à ideia de reaproveitamento:",
        [
          ["Arroz que sobrou", "Bolinho ou arroz de forno"],
          ["Banana madura", "Panqueca ou bolo"],
          ["Talos de brócolis", "Refogado ou sopa"],
          ["Pão amanhecido", "Torrada ou farofa"],
        ],
        "Reaproveitar é criatividade e economia. Nada precisa ir para o lixo!",
      ),
    ],
  },

  // ───────────────────────── Unidade 4 · Paz com a Comida ─────────────────────────
  "lesson-4-1": {
    level1Extra: [
      tf(
        "mila",
        "A fome física costuma surgir aos poucos, e não de repente.",
        true,
        "Exato! A fome emocional é que costuma chegar de repente e com vontade específica.",
      ),
      quiz(
        "lipe",
        "Se você está triste e com vontade de comer, qual é um bom primeiro passo?",
        ["Perceber e nomear a emoção", "Se culpar", "Comer escondido", "Ignorar o corpo"],
        0,
        "Nomear o que sentimos é o primeiro passo para escolher o que fazer com isso.",
      ),
    ],
    icon: "🫶",
    summary: "Fome física e emocional: escute o corpo e o coração.",
    level2: [
      say("nina", "Escutar o corpo é uma habilidade que se treina. Vamos praticar juntos."),
      match(
        "nina",
        "Ligue cada termo ao seu significado:",
        [
          ["Fome física", "Vem aos poucos e aceita vários alimentos"],
          ["Fome emocional", "Súbita, com vontade específica"],
          ["Saciedade", "Sensação de estar satisfeito"],
          ["Tédio", "Motivo comum para beliscar sem fome"],
        ],
        "Reconhecer a diferença ajuda a responder ao que você realmente precisa.",
      ),
      quiz(
        "mila",
        "Depois de um dia difícil, bate uma vontade de doce. Uma boa primeira pergunta é:",
        [
          "Estou com fome no estômago ou querendo conforto?",
          "Que castigo eu mereço por isso?",
          "Onde está o pacote inteiro?",
          "O que os outros vão pensar?",
        ],
        0,
        "Perguntar com curiosidade e sem julgamento abre caminho para escolhas conscientes.",
      ),
      tf(
        "tito",
        "Fazer uma pausa de alguns minutos pode ajudar a perceber se a fome é física ou emocional.",
        true,
        "Uma pausa curta dá tempo ao corpo e à mente de mostrarem o que realmente estão pedindo.",
      ),
      multi(
        "cadu",
        "Marque alternativas de acolhimento além de comer:",
        ["Dar uma caminhada", "Ligar para alguém querido", "Se punir", "Respirar fundo"],
        [0, 1, 3],
        "Culpa e punição só aumentam o ciclo. Acolher-se é o que ajuda.",
      ),
    ],
    level3: [
      say("nina", "Situações reais e delicadas. Lembre: aqui não existe certo ou errado moral."),
      quiz(
        "nina",
        "Marina come um pote de sorvete depois de uma discussão no trabalho. Qual postura ajuda mais?",
        [
          "Reconhecer a emoção sem culpa e pensar em outras formas de se acolher",
          "Prometer nunca mais comer doce",
          "Pular o jantar como castigo",
          "Se convencer de que não tem força de vontade",
        ],
        0,
        "A comida conforta e isso é humano. O ideal é não ter só ela como ferramenta emocional.",
      ),
      order(
        "mila",
        "Coloque na ordem o 'pause' antes de comer por impulso:",
        [
          "Pare e respire fundo",
          "Pergunte: é fome no estômago?",
          "Nomeie a emoção que está sentindo",
          "Escolha: comer com atenção ou acolher de outra forma",
        ],
        "Esse pequeno ritual devolve a escolha para você, sem regras rígidas.",
      ),
      tf(
        "lipe",
        "Sentir fome emocional é sinal de fraqueza e deve ser eliminado.",
        false,
        "É uma resposta humana. O objetivo é entender, não eliminar.",
      ),
      multi(
        "tito",
        "Marque sinais de fome FÍSICA:",
        [
          "Estômago roncando",
          "Aceita qualquer comida",
          "Urgência por um alimento específico",
          "Surge gradualmente",
        ],
        [0, 1, 3],
        "A fome física é gradual e flexível. A urgência por um alimento específico costuma ser emocional.",
      ),
      match(
        "cadu",
        "Ligue a emoção a uma forma de acolhimento:",
        [
          ["Ansiedade", "Respirar e caminhar"],
          ["Cansaço", "Descansar e dormir bem"],
          ["Solidão", "Conversar com alguém"],
          ["Tédio", "Começar uma atividade nova"],
        ],
        "Cada emoção pede um cuidado. A comida pode fazer parte, mas não precisa ser a única.",
      ),
    ],
  },

  "lesson-4-2": {
    level1Extra: [
      tf(
        "cadu",
        "Comer olhando o celular ajuda a perceber melhor a saciedade.",
        false,
        "Distrações atrapalham: o cérebro nem registra direito que você comeu.",
      ),
      quiz(
        "tito",
        "Mastigar devagar ajuda em quê?",
        ["Perceber o sabor e a saciedade", "Comer mais depressa", "Sentir menos gosto", "Em nada"],
        0,
        "Comer devagar dá tempo ao corpo de avisar que já está satisfeito.",
      ),
    ],
    icon: "🧘",
    summary: "Comer com atenção: sabor, ritmo e sinais de saciedade.",
    level2: [
      say("mila", "Comer com atenção é como um pequeno descanso para a mente. Vamos praticar!"),
      quiz(
        "nina",
        "Em quanto tempo, aproximadamente, o cérebro registra a sensação de saciedade?",
        ["Cerca de 20 minutos", "Imediatamente", "Só no dia seguinte", "Nunca registra"],
        0,
        "Comer devagar dá tempo do cérebro receber o sinal de que você está satisfeito.",
      ),
      match(
        "mila",
        "Ligue a prática ao benefício:",
        [
          ["Sentir o cheiro", "Prepara o apetite e a digestão"],
          ["Notar a textura", "Ajuda a perceber sabores"],
          ["Mastigar devagar", "Facilita a saciedade"],
          ["Desligar telas", "Mais foco na refeição"],
        ],
        "Estar presente transforma a refeição em um momento de prazer.",
      ),
      tf(
        "lipe",
        "Comer muito rápido não interfere na percepção da saciedade.",
        false,
        "Comer depressa pode fazer você passar do ponto antes de o cérebro avisar.",
      ),
      multi(
        "tito",
        "Marque as práticas de atenção plena:",
        [
          "Mastigar bem",
          "Comer no carro com pressa",
          "Desligar as telas",
          "Reparar no cheiro e na cor",
        ],
        [0, 2, 3],
        "Presença é o segredo: menos distrações, mais prazer.",
      ),
    ],
    level3: [
      say("mila", "Agora, a prática no mundo real: corridas, prazos e refeições rápidas."),
      order(
        "nina",
        "Coloque na ordem uma refeição feita com atenção:",
        [
          "Sente-se à mesa, sem telas",
          "Observe a cor e o cheiro",
          "Dê a primeira garfada e mastigue devagar",
          "Faça uma pausa e sinta a saciedade",
        ],
        "Cada etapa aproxima você do prazer de comer e dos sinais do seu corpo.",
      ),
      quiz(
        "lipe",
        "Você tem só 15 minutos para almoçar. O que ainda dá para fazer com atenção?",
        [
          "Guardar o celular, sentar, respirar e mastigar bem",
          "Comer em pé olhando o e-mail",
          "Engolir rápido para sobrar tempo",
          "Pular a refeição",
        ],
        0,
        "Mesmo em pouco tempo, alguns hábitos simples já melhoram a experiência.",
      ),
      tf(
        "cadu",
        "Comer devagar ajuda a perceber quando você já está satisfeito.",
        true,
        "Com mais ritmo, você percebe os sinais de saciedade antes de exagerar.",
      ),
      multi(
        "mila",
        "Quais são benefícios de comer com atenção?",
        [
          "Mais prazer com a comida",
          "Melhor percepção da saciedade",
          "Pior digestão",
          "Menos comer no automático",
        ],
        [0, 1, 3],
        "Comer atento é ganho em prazer e em consciência corporal.",
      ),
      match(
        "nina",
        "Ligue a nota da escala de fome à situação:",
        [
          ["1 a 3", "Muita fome: hora de comer"],
          ["4 a 6", "Confortável e satisfeito"],
          ["7 a 10", "Cheio demais"],
          ["Começou a beliscar sem fome", "Vale checar a emoção"],
        ],
        "Uma escala simples ajuda a acompanhar o que o corpo pede.",
      ),
    ],
  },

  "lesson-4-3": {
    level1Extra: [
      tf(
        "tito",
        "Um doce de vez em quando cabe numa alimentação saudável.",
        true,
        "Claro! Nenhum alimento é proibido. O equilíbrio vale para a semana toda.",
      ),
      quiz(
        "mila",
        "Qual é a atitude mais gentil depois de um exagero?",
        [
          "Seguir a rotina normal, sem culpa",
          "Passar fome no dia seguinte",
          "Se comparar com os outros",
          "Desistir de tudo",
        ],
        0,
        "Voltar ao ritmo normal quebra o ciclo de culpa e compensação.",
      ),
    ],
    icon: "🌈",
    summary: "Sem culpa à mesa: flexibilidade, gentileza e constância.",
    level2: [
      say("nina", "Uma boa relação com a comida também é feita de pensamentos gentis!"),
      quiz(
        "nina",
        "O 'efeito elástico' das dietas radicais é quando:",
        [
          "A restrição extrema leva a compulsões e exageros depois",
          "O corpo emagrece sem esforço",
          "A pessoa perde a vontade de comer doce",
          "O metabolismo fica infinito",
        ],
        0,
        "O que é proibido demais tende a virar desejo. Flexibilidade protege da compulsão.",
      ),
      tf(
        "lipe",
        "Alimentos considerados 'proibidos' costumam ficar ainda mais desejados.",
        true,
        "A proibição aumenta o desejo. Incluir com moderação tira o poder da tentação.",
      ),
      match(
        "mila",
        "Ligue cada ideia ao seu significado:",
        [
          ["Tudo ou nada", "Pensamento que atrapalha"],
          ["Equilíbrio", "Variedade sem alimentos proibidos"],
          ["Autocompaixão", "Tratar-se com gentileza"],
          ["Constância", "Hábito que dura no tempo"],
        ],
        "A mudança sustentável nasce da gentileza e da constância, não da rigidez.",
      ),
      multi(
        "tito",
        "Marque os pensamentos gentis:",
        [
          "Uma refeição não define a minha saúde",
          "Estraguei tudo, desisto",
          "Amanhã sigo normalmente",
          "Posso comer o que gosto com moderação",
        ],
        [0, 2, 3],
        "Falar consigo como falaria com um amigo é a chave.",
      ),
    ],
    level3: [
      say(
        "nina",
        "Última parada da trilha: colocar a gentileza em prática nas festas e nos recomeços.",
      ),
      quiz(
        "mila",
        "Numa festa, Bia comeu bolo e brigadeiro. Qual é a melhor atitude na próxima refeição?",
        [
          "Voltar ao ritmo normal, sem tentar compensar",
          "Ficar sem comer para compensar",
          "Comer só salada por três dias",
          "Se sentir culpada por uma semana",
        ],
        0,
        "Compensar cria um ciclo de restrição e exagero. Voltar ao ritmo normal quebra esse ciclo.",
      ),
      tf(
        "cadu",
        "Pular refeições para compensar um exagero é uma boa estratégia.",
        false,
        "Pular refeições aumenta a fome e a chance de exagerar de novo. Volte ao seu ritmo normal.",
      ),
      order(
        "nina",
        "Coloque na ordem um recomeço gentil depois de um exagero:",
        [
          "Perceba sem julgar",
          "Beba água e acolha-se",
          "Faça a próxima refeição normalmente",
          "Reflita sobre o que aprendeu",
        ],
        "O recomeço gentil é sempre mais eficiente do que o castigo.",
      ),
      multi(
        "lipe",
        "O que ajuda a ter uma relação saudável com a comida?",
        [
          "Comer sem culpa",
          "Variedade",
          "Contar cada caloria obsessivamente",
          "Ouvir os sinais de fome e saciedade",
        ],
        [0, 1, 3],
        "Contagem obsessiva costuma aumentar a ansiedade em vez de trazer saúde.",
      ),
      quiz(
        "tito",
        "Qual é um sinal de que vale buscar ajuda profissional?",
        [
          "Culpa intensa, compulsões ou restrições que atrapalham a vida",
          "Gostar de doce",
          "Comer fora de casa às vezes",
          "Ter um alimento preferido",
        ],
        0,
        "Pedir ajuda é um ato de cuidado. Nutricionistas e psicólogos podem caminhar com você.",
      ),
      match(
        "mila",
        "Ligue quem pode ajudar ao tipo de apoio:",
        [
          ["Nutricionista", "Orienta a alimentação"],
          ["Psicólogo", "Cuida das emoções e do comportamento"],
          ["Família e amigos", "Apoio no dia a dia"],
          ["Você mesmo", "Gentileza e paciência"],
        ],
        "Cuidar de si é uma rede: profissionais, pessoas queridas e você.",
      ),
    ],
  },
};

export const concept = (
  who: CharacterId,
  title: string,
  body: string,
  points: string[] = [],
  tip?: string,
  emoji?: string,
): Draft => ({ type: "concept", character: c(who), title, body, points, tip, emoji });

export const sort = (
  who: CharacterId,
  prompt: string,
  groups: string[],
  items: [string, number][],
  explanation: string,
): Draft => ({
  type: "sort",
  character: c(who),
  prompt,
  groups,
  items: items.map(([text, group]) => ({ text, group })),
  explanation,
});

export const fill = (
  who: CharacterId,
  sentence: string,
  options: string[],
  correctIndex: number,
  explanation: string,
): Draft => {
  const perm = permutation(options.length, sentence);
  return {
    type: "fill",
    character: c(who),
    sentence,
    options: perm.map((i) => options[i]),
    correctIndex: perm.indexOf(correctIndex),
    explanation,
  };
};

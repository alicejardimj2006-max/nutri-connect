// Conteúdo adicional do perfil adulto: cartões de explicação (antes das perguntas de cada nível)
// e atividades extras (cerca de 10 por nível, com tipos variados) para os níveis Fácil, Médio e Difícil.
import {
  concept,
  fill,
  sort,
  quiz,
  tf,
  multi,
  match,
  order,
  scenario,
  slider,
  reflect,
  type Draft,
} from "./trail-content-levels";

export interface AdultExtras {
  /** Um cartão de explicação por nível (1, 2 e 3), exibido antes das perguntas. */
  concepts: [Draft, Draft, Draft];
  /** Atividades extras do nível 1 (além da base e do level1Extra compartilhado). */
  extra1: Draft[];
  extra2: Draft[];
  extra3: Draft[];
}

export const ADULT_EXTRAS: Record<string, AdultExtras> = {
  "lesson-1-1": {
    concepts: [
      concept(
        "nina",
        "Os três macronutrientes",
        "Macronutrientes são os nutrientes de que precisamos em **maiores quantidades**. Eles fornecem energia (calorias) e a matéria-prima para o corpo funcionar.",
        [
          "Carboidratos: energia rápida (4 kcal por grama)",
          "Proteínas: construção e reparo dos tecidos (4 kcal por grama)",
          "Gorduras: reserva de energia e absorção de vitaminas (9 kcal por grama)",
        ],
        "Nenhum grupo é vilão. O que importa é a qualidade e o equilíbrio entre eles.",
      ),
      concept(
        "nina",
        "Como combinar os macronutrientes",
        "Uma refeição completa costuma reunir uma fonte de **carboidrato**, uma de **proteína** e **vegetais**. A combinação dá energia, saciedade e nutrientes ao mesmo tempo.",
        [
          "Arroz, feijão, ovo e couve",
          "Iogurte natural, fruta e aveia",
          "Pão integral, queijo e tomate",
        ],
        "Arroz com feijão é uma dupla clássica: os aminoácidos de um complementam os do outro.",
      ),
      concept(
        "nina",
        "Qualidade importa mais que o grupo",
        "Dentro de cada macronutriente existem escolhas melhores e piores. Vale olhar **de onde** vem cada um, e não só quanto há no prato.",
        [
          "Carboidratos: integrais e raízes x farinhas refinadas e açúcar",
          "Gorduras: insaturadas (azeite, abacate, castanhas) x trans e excesso de saturadas",
          "Proteínas: ovos, leguminosas, peixes x embutidos ultraprocessados",
        ],
      ),
    ],
    extra1: [
      multi(
        "nina",
        "Quais destas opções são fontes de carboidratos complexos (de digestão mais lenta)?",
        ["Arroz integral", "Aveia", "Açúcar refinado", "Batata-doce", "Refrigerante"],
        [0, 1, 3],
        "Arroz integral, aveia e batata-doce liberam energia aos poucos. Açúcar e refrigerante são de absorção muito rápida.",
      ),
      match(
        "tito",
        "Ligue o alimento ao macronutriente que mais se destaca nele:",
        [
          ["Azeite de oliva", "Gordura"],
          ["Claras de ovo", "Proteína"],
          ["Arroz branco", "Carboidrato"],
        ],
        "Quase todo alimento mistura nutrientes, mas cada um tem um que predomina.",
      ),
      order(
        "nina",
        "Coloque em ordem uma forma prática de montar um prato com os três macronutrientes:",
        [
          "Escolha os vegetais coloridos",
          "Adicione uma fonte de carboidrato",
          "Complete com uma fonte de proteína",
          "Finalize com uma gordura boa, como azeite ou castanhas",
        ],
        "Pensar por partes facilita montar uma refeição equilibrada sem precisar pesar nada.",
      ),
      reflect(
        "lipe",
        "Pense na sua última refeição principal: ela teve carboidratos, proteínas e gorduras boas? O que você poderia ajustar?",
        "Escreva livremente sobre sua última refeição…",
      ),
    ],
    extra2: [
      sort(
        "nina",
        "Classifique cada alimento pelo macronutriente que mais predomina nele:",
        ["Carboidratos", "Proteínas", "Gorduras"],
        [
          ["Arroz", 0],
          ["Macarrão", 0],
          ["Ovo", 1],
          ["Frango", 1],
          ["Azeite", 2],
          ["Castanhas", 2],
        ],
        "Muitos alimentos misturam nutrientes, mas cada um tem um grupo predominante.",
      ),
      tf(
        "lipe",
        "Carboidratos à noite engordam mais do que consumidos durante o dia, pois o metabolismo para.",
        false,
        "Mito! O ganho de peso depende do total de calorias no final do dia, não do horário em que o carboidrato foi consumido.",
      ),
      quiz(
        "nina",
        "Qual destas opções é uma refeição que combina os três grandes macronutrientes de forma equilibrada?",
        [
          "Apenas um prato de macarrão",
          "Arroz, feijão, peito de frango grelhado e salada temperada com azeite",
          "Apenas uma maçã grande",
          "Pão de forma branco puro",
        ],
        1,
        "Arroz (carboidrato), Frango/Feijão (proteínas) e Azeite (gordura), além das fibras da salada. Excelente combinação!",
      ),
      scenario(
        "nina",
        "Ana está sem tempo para almoçar e pega só um pão francês com café.",
        "O que ajudaria mais a deixar esse lanche mais completo?",
        [
          "Nada, já está ótimo assim",
          "Acrescentar uma proteína e uma fruta",
          "Só mais café",
          "Trocar por outro pão",
        ],
        1,
        "Um ovo, queijo ou iogurte (proteína) e uma fruta dão mais saciedade e equilíbrio ao lanche de Ana.",
      ),
    ],
    extra3: [
      fill(
        "lipe",
        "As gorduras insaturadas, presentes no azeite e no ___, ajudam a proteger o coração.",
        ["abacate", "refrigerante", "açúcar", "pão branco"],
        0,
        "O abacate é rico em gorduras insaturadas, além de fibras e potássio.",
      ),
      multi(
        "nina",
        "Quais dos alimentos abaixo são considerados excelentes fontes de proteína?",
        ["Ovo", "Azeite de oliva", "Peito de Frango", "Lentilha", "Batata"],
        [0, 2, 3],
        "Ovo, frango e lentilhas são alimentos construtores! O azeite é gordura e a batata é carboidrato.",
      ),
      match(
        "tito",
        "Ligue o macronutriente à sua principal função no corpo:",
        [
          ["Carboidrato", "Energia primária"],
          ["Proteína", "Construção de tecidos"],
          ["Gordura", "Reserva de energia e hormônios"],
        ],
        "Cada macronutriente é como um departamento diferente da mesma fábrica, trabalhando em conjunto!",
      ),
    ],
  },

  "lesson-1-2": {
    concepts: [
      concept(
        "nina",
        "Micronutrientes: pequenos e essenciais",
        "Vitaminas e minerais são **micronutrientes**: o corpo precisa deles em pequenas quantidades, mas sem eles a imunidade, a visão, os ossos e a energia não funcionam bem.",
        [
          "Vitaminas: A, C, D, E, K e as do complexo B",
          "Minerais: cálcio, ferro, zinco, magnésio, potássio",
          "O corpo produz poucos deles: quase tudo vem da alimentação",
        ],
        "Variedade de cores no prato costuma significar variedade de micronutrientes.",
      ),
      concept(
        "nina",
        "Onde encontrar cada um",
        "Nenhum alimento tem tudo. Por isso a **variedade** é a melhor estratégia para cobrir as necessidades.",
        [
          "Vitamina C: acerola, goiaba, laranja, pimentão",
          "Ferro: feijão, lentilha, folhas escuras, carnes",
          "Cálcio: leite e derivados, couve, sardinha",
          "Vitamina A: cenoura, abóbora, manga",
        ],
      ),
      concept(
        "nina",
        "Absorção: o que ajuda e o que atrapalha",
        "Comer não basta: o corpo precisa **absorver**. Alguns nutrientes se ajudam e outros competem entre si.",
        [
          "A vitamina C melhora a absorção do ferro de origem vegetal",
          "Gorduras boas ajudam a absorver as vitaminas A, D, E e K",
          "Café e chás perto das refeições reduzem a absorção do ferro",
        ],
        "Uma dica simples: feijão com laranja de sobremesa ou limão na couve.",
      ),
    ],
    extra1: [
      match(
        "mila",
        "Ligue a vitamina ou mineral à sua função:",
        [
          ["Vitamina D", "Ajuda a absorver cálcio"],
          ["Zinco", "Imunidade e cicatrização"],
          ["Vitamina K", "Coagulação do sangue"],
          ["Magnésio", "Função muscular e nervosa"],
        ],
        "Cada micronutriente tem um papel próprio, e todos trabalham juntos no corpo.",
      ),
      multi(
        "nina",
        "Quais destes são MINERAIS (e não vitaminas)?",
        ["Ferro", "Vitamina C", "Zinco", "Vitamina B12", "Cálcio"],
        [0, 2, 4],
        "Ferro, zinco e cálcio são minerais. Vitamina C e B12 são vitaminas.",
      ),
      order(
        "nina",
        "Coloque em ordem uma forma de melhorar a absorção do ferro de origem vegetal numa refeição:",
        [
          "Prepare o feijão ou a lentilha",
          "Adicione um alimento rico em vitamina C, como limão ou laranja",
          "Evite café ou chá preto na mesma refeição",
          "Sirva e aproveite",
        ],
        "A vitamina C converte o ferro vegetal numa forma mais fácil de absorver.",
      ),
      reflect(
        "mila",
        "Sua alimentação desta semana teve pelo menos 3 cores diferentes de frutas e vegetais por dia? O que poderia colorir mais o seu prato?",
      ),
    ],
    extra2: [
      sort(
        "mila",
        "Onde está o nutriente? Classifique cada alimento:",
        ["Rico em vitamina C", "Rico em cálcio"],
        [
          ["Acerola", 0],
          ["Goiaba", 0],
          ["Laranja", 0],
          ["Leite", 1],
          ["Iogurte", 1],
          ["Queijo", 1],
        ],
        "Frutas cítricas e goiaba lideram em vitamina C. Os laticínios são as fontes mais conhecidas de cálcio.",
      ),
      scenario(
        "nina",
        "Marcos anda sempre cansado e desconfia de anemia por falta de ferro.",
        "Qual combinação ajudaria mais a melhorar a absorção do ferro do feijão que ele come?",
        [
          "Feijão com suco de laranja",
          "Feijão com café",
          "Só tomar suplemento, sem mudar a alimentação",
          "Feijão com chá preto",
        ],
        0,
        "A vitamina C do suco de laranja aumenta a absorção do ferro vegetal. Café e chá preto atrapalham esse processo.",
      ),
      quiz(
        "mila",
        "Qual vitamina o corpo consegue produzir com a exposição moderada ao sol?",
        ["Vitamina D", "Vitamina C", "Vitamina B12", "Vitamina K"],
        0,
        "A pele produz vitamina D com a luz solar. Ela ajuda a fixar o cálcio nos ossos.",
      ),
      tf(
        "nina",
        "Suplementos vitamínicos substituem completamente a necessidade de uma alimentação variada.",
        false,
        "Os alimentos trazem combinações de nutrientes, fibras e outros compostos que suplementos isolados não replicam.",
      ),
    ],
    extra3: [
      fill(
        "nina",
        "O ___ ajuda o corpo a absorver melhor o ferro do feijão.",
        ["limão (vitamina C)", "café", "refrigerante", "chocolate"],
        0,
        "A vitamina C converte o ferro vegetal em uma forma mais fácil de absorver.",
      ),
      multi(
        "mila",
        "Quais destes hábitos ajudam a absorver melhor o ferro dos vegetais?",
        [
          "Comer fruta cítrica junto",
          "Tomar café na mesma refeição",
          "Temperar com limão",
          "Beber chá preto junto",
        ],
        [0, 2],
        "Vitamina C e acidez do limão ajudam. Café e chá preto competem pela absorção do ferro.",
      ),
      slider(
        "mila",
        "Aproximadamente quantos miligramas de vitamina C tem uma laranja média?",
        { min: 0, max: 100, step: 5, unit: " mg" },
        70,
        20,
        "Uma laranja média tem cerca de 70 mg de vitamina C — mais que a necessidade diária de muitos adultos.",
      ),
    ],
  },

  "lesson-1-3": {
    concepts: [
      concept(
        "nina",
        "Água: o nutriente esquecido",
        "A água participa da digestão, regula a temperatura, transporta nutrientes e elimina resíduos. Frutas, verduras e sopas também **contribuem** para a hidratação.",
        [
          "Sede é um sinal tardio: beba ao longo do dia",
          "Urina clara costuma indicar boa hidratação",
          "Bebidas açucaradas não substituem a água",
        ],
      ),
      concept(
        "nina",
        "Fibras: solúveis e insolúveis",
        "Fibras são partes dos vegetais que não digerimos, e cada tipo tem um papel.",
        [
          "Solúveis (aveia, feijão, maçã): ajudam colesterol e glicemia",
          "Insolúveis (integrais, verduras): melhoram o trânsito intestinal",
          "Ambas aumentam a saciedade",
        ],
        "A maioria dos alimentos vegetais tem os dois tipos.",
      ),
      concept(
        "nina",
        "Aumentando as fibras sem desconforto",
        "Aumente **aos poucos** e beba mais água. Prefira alimentos inteiros a suplementos e sucos coados.",
        [
          "Troque o suco coado pela fruta inteira",
          "Inclua uma leguminosa por dia",
          "Escolha grãos integrais e sementes",
        ],
      ),
    ],
    extra1: [
      slider(
        "nina",
        "Muitos guias sugerem, em média, quantos copos de água (200 ml) por dia para um adulto?",
        { min: 2, max: 16, step: 1, unit: " copos" },
        8,
        2,
        "Uma referência comum é cerca de 8 copos (perto de 2 litros), mas a necessidade real varia com clima, corpo e rotina.",
      ),
      match(
        "tito",
        "Ligue o alimento ao tipo de fibra que predomina nele:",
        [
          ["Aveia", "Fibra solúvel"],
          ["Farelo de trigo", "Fibra insolúvel"],
          ["Maçã com casca", "Fibra solúvel e insolúvel"],
        ],
        "Alimentos vegetais costumam trazer os dois tipos de fibra, em proporções diferentes.",
      ),
      multi(
        "tito",
        "Quais destes ajudam a aumentar a ingestão diária de fibras?",
        [
          "Trocar o suco pela fruta inteira",
          "Escolher pão integral",
          "Descascar todos os vegetais",
          "Incluir feijão nas refeições",
        ],
        [0, 1, 3],
        "A fruta inteira e o feijão preservam as fibras. Descascar tudo remove parte delas.",
      ),
      reflect(
        "tito",
        "Quantos copos de água você já bebeu hoje? O que poderia te ajudar a lembrar de beber mais ao longo do dia?",
      ),
    ],
    extra2: [
      sort(
        "tito",
        "Classifique conforme a quantidade de fibras:",
        ["Boa fonte de fibras", "Pouca fibra"],
        [
          ["Feijão", 0],
          ["Aveia", 0],
          ["Maçã com casca", 0],
          ["Refrigerante", 1],
          ["Pão branco", 1],
          ["Suco coado", 1],
        ],
        "Alimentos inteiros e integrais concentram as fibras. Os refinados e os líquidos açucarados têm muito pouco.",
      ),
      scenario(
        "tito",
        "Beatriz aumentou de uma vez o consumo de feijão, farelo e vegetais crus, e agora sente a barriga estufada.",
        "O que ela poderia ter feito diferente?",
        [
          "Aumentar as fibras aos poucos e beber mais água",
          "Não comer fibra nenhuma",
          "Comer tudo de uma vez, o corpo se acostuma rápido",
          "Trocar a água por refrigerante",
        ],
        0,
        "O aumento abrupto de fibra sem água suficiente costuma causar desconforto. O ideal é uma transição gradual.",
      ),
      quiz(
        "nina",
        "Qual destas bebidas hidrata bem, sem açúcar adicionado?",
        ["Água de coco natural", "Refrigerante", "Suco de caixinha adoçado", "Refresco em pó"],
        0,
        "A água de coco natural hidrata bem e não tem açúcar adicionado, diferente das outras opções.",
      ),
      tf(
        "nina",
        "Frutas e vegetais contribuem para a hidratação do corpo, além da água que bebemos.",
        true,
        "Muitas frutas e legumes têm alto teor de água, como melancia, pepino e laranja.",
      ),
    ],
    extra3: [
      fill(
        "tito",
        "Ao aumentar o consumo de fibras, é importante também aumentar a ingestão de ___.",
        ["água", "sal", "açúcar", "gordura"],
        0,
        "A água ajuda as fibras a formarem o bolo fecal e evita desconforto.",
      ),
      multi(
        "nina",
        "Quais sinais podem indicar que você precisa beber mais água?",
        ["Urina bem escura", "Boca seca", "Sede intensa", "Urina bem clara"],
        [0, 1, 2],
        "Urina escura, boca seca e sede são avisos do corpo. Urina clara costuma indicar boa hidratação.",
      ),
      slider(
        "nina",
        "Cerca de quantos por cento do peso corporal de um adulto é água?",
        { min: 30, max: 80, step: 5, unit: "%" },
        60,
        10,
        "Em média, cerca de 60% do corpo adulto é água — por isso ela é tão essencial para tudo funcionar bem.",
      ),
    ],
  },

  "lesson-2-1": {
    concepts: [
      concept(
        "nina",
        "Os quatro grupos do Guia Alimentar",
        "O **Guia Alimentar para a População Brasileira** classifica os alimentos pelo grau de processamento.",
        [
          "In natura ou minimamente processados: frutas, ovos, feijão, carne fresca",
          "Ingredientes culinários: óleo, sal, açúcar",
          "Processados: pão, queijo, conservas",
          "Ultraprocessados: refrigerantes, salgadinhos, nuggets",
        ],
        "Regra de ouro: faça dos in natura a base da alimentação e evite os ultraprocessados.",
      ),
      concept(
        "nina",
        "Por que evitar ultraprocessados",
        "Costumam ter muito açúcar, sódio e gorduras, pouca fibra e vários aditivos. Também são **hiperpalatáveis**: fáceis de comer em excesso.",
        [
          "Formulações industriais, não alimentos inteiros",
          "Ligados a maior consumo calórico total",
          "Substituem refeições de verdade",
        ],
      ),
      concept(
        "nina",
        "Como decidir no dia a dia",
        "Use a regra **descasque mais, desembale menos**. Compare rótulos, cozinhe a base das refeições e deixe os ultraprocessados para ocasiões específicas.",
        [
          "Leia a lista de ingredientes",
          "Tenha lanches in natura à mão",
          "Prefira versões simples quando comprar prontos",
        ],
      ),
    ],
    extra1: [
      match(
        "nina",
        "Ligue o alimento ao seu grupo pelo Guia Alimentar:",
        [
          ["Feijão cru", "In natura"],
          ["Queijo", "Processado"],
          ["Salgadinho de pacote", "Ultraprocessado"],
          ["Óleo de soja", "Ingrediente culinário"],
        ],
        "Cada grupo tem um papel diferente na alimentação, e a proporção entre eles é o que importa.",
      ),
      multi(
        "cadu",
        "Quais destes são exemplos de ultraprocessados?",
        [
          "Macarrão instantâneo",
          "Arroz branco cru",
          "Refrigerante",
          "Salsicha",
          "Feijão cozido em casa",
        ],
        [0, 2, 3],
        "Macarrão instantâneo, refrigerante e salsicha passam por muitas etapas industriais e aditivos.",
      ),
      quiz(
        "nina",
        "Qual destas opções é um exemplo de alimento PROCESSADO (e não ultraprocessado)?",
        [
          "Queijo artesanal feito com leite, sal e coalho",
          "Salgadinho de pacote",
          "Macarrão instantâneo",
          "Refrigerante",
        ],
        0,
        "Processados usam poucos ingredientes e técnicas simples, como sal e fermentação — diferente dos ultraprocessados.",
      ),
      reflect(
        "cadu",
        "Pense no que você comeu ontem: quantas refeições tiveram como base alimentos in natura ou minimamente processados?",
      ),
    ],
    extra2: [
      sort(
        "nina",
        "Classifique conforme o processamento:",
        ["In natura ou minimamente processado", "Ultraprocessado"],
        [
          ["Banana", 0],
          ["Ovo", 0],
          ["Arroz", 0],
          ["Refrigerante", 1],
          ["Salgadinho", 1],
          ["Nuggets", 1],
        ],
        "Se tem lista longa de aditivos e vem pronto para consumo, é ultraprocessado.",
      ),
      scenario(
        "cadu",
        "No supermercado, Rafael escolhe entre dois iogurtes: um com 4 ingredientes e outro com 15, incluindo corantes e conservantes.",
        "Qual escolha segue melhor a lógica do Guia Alimentar?",
        [
          "O de lista mais curta e reconhecível",
          "O de lista mais longa",
          "Tanto faz, são iguais",
          "O mais barato, sempre",
        ],
        0,
        "Listas curtas e reconhecíveis costumam indicar alimentos menos processados e com menos aditivos.",
      ),
      tf(
        "nina",
        "Um produto pode ser considerado ultraprocessado mesmo tendo a palavra 'natural' na embalagem.",
        true,
        "Termos como 'natural' são apelos de marketing. A lista de ingredientes é que conta a verdade.",
      ),
      multi(
        "tito",
        "Quais características costumam indicar um ultraprocessado?",
        [
          "Lista longa de ingredientes irreconhecíveis",
          "Poucos ingredientes caseiros",
          "Corantes e aromatizantes artificiais",
          "Pronto para consumir ou aquecer",
        ],
        [0, 2, 3],
        "Essas são pistas clássicas de um produto muito industrializado.",
      ),
    ],
    extra3: [
      fill(
        "cadu",
        "Uma boa regra para escolher alimentos é: 'descasque mais, ___ menos'.",
        ["desembale", "cozinhe", "mastigue", "compre"],
        0,
        "Alimentos que precisam ser descascados ou preparados costumam ser menos processados.",
      ),
      order(
        "nina",
        "Coloque estes alimentos do MENOS para o MAIS processado:",
        ["Milho na espiga", "Milho em conserva", "Farinha de milho", "Salgadinho de milho"],
        "Quanto mais etapas industriais, mais processado o alimento se torna.",
      ),
      quiz(
        "tito",
        "Ao ler o rótulo de um produto pronto, o que é um bom sinal?",
        [
          "Lista curta, com ingredientes que você reconhece",
          "Lista longa e cheia de siglas",
          "Ausência de lista de ingredientes",
          "Cores vibrantes na embalagem",
        ],
        0,
        "Listas curtas e reconhecíveis costumam indicar menor grau de processamento.",
      ),
    ],
  },

  "lesson-2-2": {
    concepts: [
      concept(
        "nina",
        "A ordem dos ingredientes importa",
        "Por lei, os ingredientes são listados do **maior para o menor** em quantidade. Os três primeiros já dizem quase tudo sobre o produto.",
        [
          "Açúcar em primeiro lugar: produto feito principalmente de açúcar",
          "Farinha integral em primeiro: mais fibras",
        ],
        "Uma lista curta e reconhecível costuma ser um bom sinal.",
      ),
      concept(
        "nina",
        "Nomes que escondem açúcar e aditivos",
        "A indústria usa dezenas de nomes. Aprender a reconhecê-los ajuda a escolher melhor.",
        [
          "Açúcar: xarope de milho, glicose, maltodextrina, açúcar invertido",
          "Realçadores: glutamato monossódico",
          "Corantes e aromatizantes artificiais",
        ],
      ),
      concept(
        "nina",
        "O que a frente da embalagem não conta",
        "Termos como 'natural', 'fit', 'zero' e 'integral' são **apelos de marketing**. A verdade está na lista de ingredientes e na tabela nutricional.",
        [
          "'Integral' exige farinha integral como principal ingrediente",
          "'Zero açúcar' pode ter adoçantes e outros aditivos",
        ],
      ),
    ],
    extra1: [
      multi(
        "mila",
        "Quais destes nomes no rótulo indicam açúcar adicionado?",
        [
          "Xarope de milho",
          "Farinha integral",
          "Açúcar invertido",
          "Maltodextrina",
          "Fibra de aveia",
        ],
        [0, 2, 3],
        "Xarope de milho, açúcar invertido e maltodextrina são formas de açúcar adicionadas pela indústria.",
      ),
      match(
        "nina",
        "Ligue o termo do rótulo ao que ele geralmente significa:",
        [
          ["Glutamato monossódico", "Realçador de sabor"],
          ["Corante artificial", "Cor que não é natural do alimento"],
          ["Conservante", "Aumenta o tempo de prateleira"],
        ],
        "Reconhecer esses termos ajuda a entender o que realmente tem no produto.",
      ),
      order(
        "nina",
        "Coloque em ordem os passos para investigar um rótulo:",
        [
          "Olhe a lista de ingredientes",
          "Identifique os 3 primeiros itens",
          "Procure nomes disfarçados de açúcar",
          "Decida com base no que encontrou",
        ],
        "Seguir uma ordem simples torna o hábito de ler rótulos mais rápido no dia a dia.",
      ),
      reflect(
        "mila",
        "Escolha um produto industrializado que você tem em casa. O que você percebe ao ler a lista de ingredientes dele?",
      ),
    ],
    extra2: [
      sort(
        "mila",
        "Este ingrediente indica açúcar adicionado?",
        ["Indica açúcar", "Não indica açúcar"],
        [
          ["Xarope de glicose", 0],
          ["Maltodextrina", 0],
          ["Açúcar invertido", 0],
          ["Farinha integral", 1],
          ["Aveia", 1],
          ["Sal", 1],
        ],
        "Xaropes, maltodextrina e açúcar invertido são formas de açúcar. Aveia, farinha integral e sal não.",
      ),
      scenario(
        "mila",
        "Duas caixas de cereal: a primeira lista 'aveia, uva-passa, canela'. A segunda lista 'açúcar, farinha de trigo, xarope de milho, corante caramelo, aromatizante'.",
        "Qual é a melhor escolha, olhando só a lista de ingredientes?",
        ["A primeira", "A segunda", "As duas são iguais", "Depende só do preço"],
        0,
        "A primeira lista é curta e reconhecível. A segunda tem açúcar em destaque e vários aditivos.",
      ),
      quiz(
        "nina",
        "'Corante caramelo' na lista de ingredientes é:",
        [
          "Um aditivo para dar cor, sem valor nutritivo",
          "Uma fonte de fibras",
          "Um tipo de açúcar saudável",
          "Um conservante natural",
        ],
        0,
        "É um corante artificial usado só para dar cor ao produto, sem nenhum valor nutricional.",
      ),
      tf(
        "nina",
        "Um produto pode ter açúcar mesmo sem a palavra 'açúcar' aparecer na lista.",
        true,
        "Nomes como xarope de milho, dextrose e maltodextrina são formas de açúcar disfarçadas.",
      ),
    ],
    extra3: [
      fill(
        "nina",
        "O primeiro ingrediente da lista é aquele que existe em ___ quantidade no produto.",
        ["maior", "menor", "nenhuma", "igual"],
        0,
        "A lista segue a ordem decrescente de quantidade.",
      ),
      multi(
        "mila",
        "Quais destes são nomes alternativos para açúcar em rótulos?",
        ["Dextrose", "Melaço", "Farinha integral", "Xarope de glicose-frutose"],
        [0, 1, 3],
        "Dextrose, melaço e xarope de glicose-frutose são todos formas de açúcar.",
      ),
      slider(
        "nina",
        "Aproximadamente quantos ingredientes diferentes costuma ter um alimento ultraprocessado típico?",
        { min: 2, max: 25, step: 1, unit: " ingredientes" },
        15,
        5,
        "Ultraprocessados costumam ter listas longas, muitas vezes com 10 a 20 ingredientes e aditivos.",
      ),
    ],
  },

  "lesson-2-3": {
    concepts: [
      concept(
        "nina",
        "Ler a tabela em 3 passos",
        "A tabela nutricional traz informações padronizadas. O segredo é seguir uma ordem.",
        [
          "1. Veja o tamanho da porção",
          "2. Veja calorias e nutrientes por porção",
          "3. Compare o %VD (valor diário)",
        ],
        "Muitos pacotes trazem várias porções. Comer tudo é multiplicar os valores.",
      ),
      concept(
        "nina",
        "%VD: alto ou baixo?",
        "O %VD mostra quanto da necessidade diária de referência (2.000 kcal) a porção fornece. A Anvisa usa uma regra prática:",
        ["**5% ou menos**: baixo", "**20% ou mais**: alto"],
        "Para fibras, alto é ótimo. Para sódio, açúcares e gorduras saturadas, alto pede atenção.",
      ),
      concept(
        "nina",
        "Comparando produtos",
        "Compare sempre pela **mesma quantidade** (100 g ou 100 ml) e olhe os nutrientes que importam.",
        [
          "Limite: sódio, açúcares adicionados, gordura saturada",
          "Busque: fibras, proteínas, vitaminas e minerais",
        ],
      ),
    ],
    extra1: [
      slider(
        "nina",
        "Um pacote de biscoitos tem 4 porções. Se a tabela mostra 120 kcal por porção, quantas calorias tem o pacote inteiro?",
        { min: 100, max: 800, step: 10, unit: " kcal" },
        480,
        20,
        "4 porções × 120 kcal = 480 kcal. Comer o pacote todo é multiplicar os valores da tabela pelo número de porções.",
      ),
      match(
        "nina",
        "Ligue o termo da tabela ao que ele representa:",
        [
          ["Valor energético", "Calorias da porção"],
          ["%VD", "Porcentagem do valor diário de referência"],
          ["Porção", "Quantidade usada para calcular os valores"],
        ],
        "Entender esses três termos já resolve boa parte da leitura de qualquer tabela.",
      ),
      multi(
        "nina",
        "Antes de comparar dois produtos pela tabela nutricional, é importante:",
        [
          "Olhar o tamanho da porção de cada um",
          "Ignorar a porção e olhar só o total do pacote",
          "Comparar pela mesma quantidade, como 100 g",
          "Escolher pela cor da embalagem",
        ],
        [0, 2],
        "Sem ajustar para a mesma quantidade, a comparação entre produtos não é justa.",
      ),
      reflect(
        "nina",
        "Pegue um alimento embalado perto de você (ou lembre de um). Quantas porções tem o pacote, e quantas você costuma comer de uma vez?",
      ),
    ],
    extra2: [
      sort(
        "lipe",
        "Este nutriente costuma ser para limitar ou buscar?",
        ["Limitar", "Buscar"],
        [
          ["Sódio", 0],
          ["Gordura saturada", 0],
          ["Açúcares adicionados", 0],
          ["Fibra alimentar", 1],
          ["Proteínas", 1],
          ["Vitaminas e minerais", 1],
        ],
        "Não é proibir: é equilibrar. Quanto mais fibras e micronutrientes, melhor.",
      ),
      scenario(
        "lipe",
        "Duas barras de cereal, na mesma porção de 20 g: a barra A tem 90 kcal e 3 g de açúcar; a barra B tem 90 kcal e 12 g de açúcar.",
        "Qual tem menos açúcar adicionado, considerando a mesma porção?",
        ["A barra A", "A barra B", "As duas têm igual", "Não dá para saber"],
        0,
        "Com a mesma porção e mesmas calorias, a barra A tem bem menos açúcar: uma escolha mais equilibrada.",
      ),
      quiz(
        "nina",
        "Se um rótulo mostra '2 porções por embalagem' e você come a embalagem toda, você deve:",
        [
          "Multiplicar os valores da tabela por 2",
          "Dividir os valores por 2",
          "Ignorar a tabela",
          "Usar só o valor de 1 porção",
        ],
        0,
        "Ao comer as duas porções, os valores de calorias e nutrientes também dobram.",
      ),
      tf(
        "nina",
        "Duas porções idênticas em peso (100 g) de produtos diferentes podem ser comparadas diretamente pela tabela.",
        true,
        "Quando a quantidade é igual, a comparação direta entre os nutrientes é justa.",
      ),
    ],
    extra3: [
      fill(
        "tito",
        "Um valor de 20% VD ou mais em uma porção é considerado ___.",
        ["alto", "baixo", "normal", "inexistente"],
        0,
        "Pela regra prática, 5% ou menos é baixo e 20% ou mais é alto.",
      ),
      multi(
        "tito",
        "Ao comparar rótulos, quais nutrientes vale a pena LIMITAR?",
        ["Sódio", "Fibras", "Açúcares adicionados", "Gorduras saturadas"],
        [0, 2, 3],
        "Fibra é o nutriente que vale buscar mais, não limitar.",
      ),
      order(
        "nina",
        "Coloque em ordem os passos para comparar dois produtos parecidos:",
        [
          "Verifique a porção de cada um",
          "Ajuste para a mesma quantidade, como 100 g",
          "Compare sódio, açúcar e gordura saturada",
          "Escolha o que tiver menos desses e mais fibra",
        ],
        "Comparar na mesma base é o que torna a escolha realmente justa.",
      ),
    ],
  },

  "lesson-3-1": {
    concepts: [
      concept(
        "nina",
        "O prato equilibrado",
        "Uma referência visual simples: **metade** do prato de vegetais e saladas, **um quarto** de proteínas e **um quarto** de carboidratos.",
        [
          "Metade: legumes, verduras e saladas",
          "Um quarto: feijão, ovo, carnes, peixe",
          "Um quarto: arroz, batata, mandioca, massas",
        ],
        "É uma referência flexível, não uma regra rígida.",
      ),
      concept(
        "nina",
        "Escolhendo dentro de cada parte",
        "Varie ao longo da semana para cobrir todos os nutrientes.",
        [
          "Vegetais: varie as cores",
          "Proteínas: alterne feijão, ovo, peixe e carnes",
          "Carboidratos: prefira integrais e raízes",
        ],
      ),
      concept(
        "nina",
        "Adaptando à vida real",
        "Marmita, restaurante ou lanche: a lógica é a mesma. Se faltou vegetal numa refeição, compense na seguinte, **sem culpa**.",
        ["No self-service, comece pelas saladas", "Nos lanches, inclua uma fruta ou castanhas"],
      ),
    ],
    extra1: [
      multi(
        "mila",
        "Quais destes alimentos entram na metade 'vegetais' do prato equilibrado?",
        ["Couve refogada", "Arroz", "Salada de tomate e pepino", "Batata frita"],
        [0, 2],
        "Couve e salada de tomate e pepino são vegetais. Arroz e batata frita são carboidratos.",
      ),
      match(
        "nina",
        "Ligue o alimento à parte do prato equilibrado que ele ocupa:",
        [
          ["Feijão", "Proteínas"],
          ["Purê de batata", "Carboidratos"],
          ["Abobrinha grelhada", "Vegetais"],
        ],
        "Saber onde cada alimento se encaixa ajuda a montar o prato sem precisar pesar nada.",
      ),
      order(
        "nina",
        "Coloque em ordem para montar um prato equilibrado num self-service:",
        [
          "Comece enchendo metade do prato de saladas e legumes",
          "Adicione um quarto de proteína",
          "Complete um quarto com carboidrato",
          "Tempere com azeite e ervas",
        ],
        "Começar pelos vegetais garante que eles ocupem a metade do prato.",
      ),
      reflect(
        "mila",
        "Pense no seu almoço de hoje ou de ontem: ele se aproximou do prato equilibrado? O que faltou ou sobrou?",
      ),
    ],
    extra2: [
      sort(
        "nina",
        "Em qual parte do prato equilibrado cada alimento entra?",
        ["Metade: vegetais", "Um quarto: proteínas", "Um quarto: carboidratos"],
        [
          ["Brócolis", 0],
          ["Alface", 0],
          ["Ovo", 1],
          ["Frango", 1],
          ["Arroz", 2],
          ["Batata", 2],
        ],
        "Vegetais ocupam metade; proteínas e carboidratos dividem a outra metade.",
      ),
      scenario(
        "nina",
        "No restaurante por quilo, o prato de Júlia ficou com arroz, macarrão e batata, sem nenhuma salada.",
        "O que ela poderia ajustar para se aproximar do prato equilibrado?",
        [
          "Trocar parte dos carboidratos por saladas e legumes",
          "Adicionar mais um carboidrato",
          "Está ótimo assim",
          "Tirar toda a proteína",
        ],
        0,
        "Reduzir um pouco dos carboidratos (que estão em triplicidade) e incluir vegetais deixa o prato mais equilibrado.",
      ),
      quiz(
        "mila",
        "No prato equilibrado, os carboidratos como arroz, batata e massas costumam ocupar:",
        ["Um quarto do prato", "Metade do prato", "O prato inteiro", "Só a sobremesa"],
        0,
        "Um quarto para carboidratos, um quarto para proteínas e metade para vegetais.",
      ),
      tf(
        "nina",
        "É preciso excluir completamente os carboidratos para ter um prato equilibrado.",
        false,
        "Carboidratos fazem parte do prato equilibrado, só não devem dominar o espaço todo.",
      ),
    ],
    extra3: [
      fill(
        "mila",
        "No prato equilibrado, a ___ do prato deve ser preenchida com vegetais e saladas.",
        ["metade", "quinta parte", "totalidade", "décima parte"],
        0,
        "Metade do prato de vegetais dá volume, fibras e vitaminas com poucas calorias.",
      ),
      multi(
        "tito",
        "Quais são boas fontes de proteína para o quarto do prato equilibrado?",
        ["Feijão", "Ovo", "Batata", "Frango"],
        [0, 1, 3],
        "Feijão, ovo e frango são proteínas. Batata é uma fonte de carboidrato.",
      ),
      slider(
        "tito",
        "Quantos gramas de feijão cozido (cerca de uma concha média) uma pessoa costuma servir numa refeição?",
        { min: 20, max: 200, step: 10, unit: " g" },
        80,
        30,
        "Uma concha média de feijão cozido costuma pesar entre 50 e 110 g, girando em torno de 80 g.",
      ),
    ],
  },

  "lesson-3-2": {
    concepts: [
      concept(
        "nina",
        "Sabor sem excesso de sal",
        "O consumo elevado de sódio está associado à hipertensão. Ervas, especiarias, alho, cebola e cítricos aumentam o sabor e **reduzem a necessidade de sal**.",
        [
          "Prefira temperos naturais a caldos e temperos prontos",
          "Sal grosso tem o mesmo sódio que o refinado",
        ],
      ),
      concept(
        "nina",
        "Guia rápido de ervas e especiarias",
        "Cada tempero combina melhor com certos pratos.",
        [
          "Manjericão: molhos de tomate e massas",
          "Coentro: peixes, caldos e saladas",
          "Alecrim: assados e batatas",
          "Cúrcuma: arroz, ovos e legumes",
        ],
      ),
      concept(
        "nina",
        "Construindo camadas de sabor",
        "Refogar, tostar especiarias, marinar e finalizar com **acidez** (limão ou vinagre) dão profundidade ao prato.",
        [
          "Refogue cebola antes do alho",
          "Ervas delicadas entram no final",
          "Uma pitada de acidez realça o sabor",
        ],
      ),
    ],
    extra1: [
      match(
        "lipe",
        "Ligue o tempero ao prato que combina bem:",
        [
          ["Manjericão", "Molho de tomate"],
          ["Cominho", "Feijão e carnes"],
          ["Canela", "Frutas e doces"],
          ["Coentro", "Peixes e caldos"],
        ],
        "Conhecer essas combinações clássicas facilita variar o sabor das refeições.",
      ),
      multi(
        "cadu",
        "Quais destes são temperos NATURAIS (não industrializados)?",
        ["Alho", "Cebola", "Caldo em cubo", "Orégano", "Tempero pronto com realçador"],
        [0, 1, 3],
        "Alho, cebola e orégano são temperos naturais. Os outros são industrializados e concentram sódio.",
      ),
      order(
        "lipe",
        "Coloque em ordem o preparo de um refogado saboroso:",
        [
          "Aqueça o azeite",
          "Doure a cebola",
          "Adicione o alho por último",
          "Tempere com ervas no final",
        ],
        "O alho queima rápido: entra depois da cebola. Ervas delicadas vão por último.",
      ),
      reflect(
        "cadu",
        "Qual tempero você usa com menos frequência em casa e poderia experimentar essa semana?",
      ),
    ],
    extra2: [
      sort(
        "lipe",
        "Tempero natural ou industrializado?",
        ["Tempero natural", "Industrializado"],
        [
          ["Alho", 0],
          ["Salsinha", 0],
          ["Cominho", 0],
          ["Caldo em cubo", 1],
          ["Tempero pronto com realçador", 1],
          ["Sazon artificial", 1],
        ],
        "Os industrializados concentram sódio e aditivos. Os naturais trazem sabor e compostos benéficos.",
      ),
      scenario(
        "lipe",
        "Pedro acha a comida sem graça e sempre acrescenta bastante sal ou usa caldo em cubo.",
        "O que poderia ajudar Pedro a ter mais sabor sem exagerar no sódio?",
        [
          "Usar ervas, alho, cebola e limão",
          "Adicionar mais um cubo de caldo",
          "Aumentar ainda mais o sal",
          "Comer sem nenhum tempero",
        ],
        0,
        "Ervas, alho, cebola e limão dão camadas de sabor sem depender de tanto sódio.",
      ),
      quiz(
        "nina",
        "Qual destes ajuda a reduzir o sal sem perder sabor?",
        [
          "Limão e ervas frescas",
          "Mais sal grosso",
          "Caldo industrializado",
          "Molho de soja em excesso",
        ],
        0,
        "Limão e ervas frescas realçam o sabor sem aumentar o sódio.",
      ),
      tf(
        "nina",
        "O sal rosa do Himalaia tem bem menos sódio que o sal comum, em quantidades iguais.",
        false,
        "Todo sal é feito de sódio e cloro. A cor muda, mas a quantidade de sódio é praticamente a mesma.",
      ),
    ],
    extra3: [
      fill(
        "cadu",
        "Ervas frescas delicadas, como o manjericão, devem ser adicionadas no ___ do preparo.",
        ["final", "início", "meio", "primeiro minuto"],
        0,
        "O calor prolongado apaga o aroma das ervas delicadas.",
      ),
      multi(
        "lipe",
        "Quais destes trazem sabor com pouco sódio?",
        ["Limão", "Alho", "Caldo em cubo", "Ervas frescas"],
        [0, 1, 3],
        "Limão, alho e ervas frescas dão sabor sem depender de sódio extra.",
      ),
      slider(
        "nina",
        "Aproximadamente quanto sódio (em mg) a Organização Mundial da Saúde recomenda consumir, no máximo, por dia?",
        { min: 500, max: 4000, step: 100, unit: " mg" },
        2000,
        300,
        "A recomendação da OMS é de até 2 g de sódio por dia, o equivalente a cerca de 5 g de sal.",
      ),
    ],
  },

  "lesson-3-3": {
    concepts: [
      concept(
        "nina",
        "Planejar reduz decisões cansadas",
        "Decidir o que comer com fome leva a escolhas rápidas e menos nutritivas. Um cardápio **flexível** e uma lista de compras poupam tempo e dinheiro.",
        ["Defina 3 ou 4 refeições-base da semana", "Anote o que já tem em casa antes de comprar"],
      ),
      concept(
        "nina",
        "Cozinhar em lote",
        "Preparar bases (feijão, arroz, legumes, proteínas) de uma vez e **congelar em porções** economiza tempo nos dias corridos.",
        ["Congele em porções individuais", "Etiquete com nome e data", "Descongele na geladeira"],
      ),
      concept(
        "nina",
        "Zero desperdício",
        "Reaproveitar talos, cascas e sobras reduz o desperdício e o gasto, e ainda traz nutrientes extras.",
        [
          "Organize a geladeira: o que vence primeiro fica na frente",
          "Use talos em refogados e sopas",
        ],
      ),
    ],
    extra1: [
      multi(
        "nina",
        "Quais hábitos ajudam no planejamento das refeições da semana?",
        [
          "Fazer lista de compras",
          "Cozinhar em lote no fim de semana",
          "Comprar sem lista",
          "Congelar porções prontas",
        ],
        [0, 1, 3],
        "Lista, cozinha em lote e congelamento são a base de um planejamento que funciona.",
      ),
      match(
        "nina",
        "Ligue o alimento à melhor forma de guardá-lo:",
        [
          ["Feijão cozido", "Congelar em porções"],
          ["Folhas lavadas", "Geladeira, em pote"],
          ["Frutas maduras", "Consumir logo ou congelar"],
        ],
        "Cada alimento tem uma forma de armazenamento que preserva melhor sua qualidade.",
      ),
      order(
        "nina",
        "Coloque em ordem um domingo de organização das refeições:",
        [
          "Planeje o cardápio da semana",
          "Faça a lista de compras",
          "Cozinhe as bases, como arroz, feijão e proteína",
          "Guarde em potes ou congele em porções",
        ],
        "Planejar antes de comprar evita compras por impulso e desperdício.",
      ),
      reflect(
        "nina",
        "Como está sua organização das refeições para esta semana? O que poderia facilitar os dias mais corridos?",
      ),
    ],
    extra2: [
      sort(
        "nina",
        "Como armazenar melhor cada item?",
        ["Guardar na geladeira", "Congelar em porções"],
        [
          ["Folhas lavadas e secas", 0],
          ["Legumes picados", 0],
          ["Feijão cozido", 1],
          ["Molho caseiro", 1],
          ["Sopa pronta", 1],
          ["Frango cozido em porções", 1],
        ],
        "Congelar preserva preparos prontos por semanas. Folhas e legumes crus duram melhor na geladeira.",
      ),
      scenario(
        "nina",
        "Camila chega cansada do trabalho todos os dias e acaba pedindo delivery quase sempre.",
        "Qual mudança ajudaria mais Camila a cozinhar mais em casa?",
        [
          "Cozinhar em lote no fim de semana e congelar porções",
          "Tentar cozinhar tudo do zero todo dia depois do trabalho",
          "Desistir de cozinhar em casa",
          "Comprar sem planejar",
        ],
        0,
        "Preparar bases no fim de semana e congelar porções resolve justamente o problema do cansaço nos dias de semana.",
      ),
      quiz(
        "nina",
        "Qual é uma vantagem de cozinhar feijão e arroz em maior quantidade e congelar em porções?",
        [
          "Economiza tempo nos dias corridos",
          "Estraga mais rápido",
          "Fica sem sabor",
          "Custa mais caro sempre",
        ],
        0,
        "Congelar em porções permite ter uma refeição pronta rapidamente em dias sem tempo para cozinhar.",
      ),
      tf(
        "cadu",
        "Alimentos da estação costumam ser mais baratos e saborosos.",
        true,
        "Na safra, a oferta é maior, o preço cai e o alimento amadurece no tempo certo.",
      ),
    ],
    extra3: [
      fill(
        "mila",
        "Fazer uma ___ antes de ir ao mercado ajuda a evitar compras por impulso.",
        ["lista", "dieta", "pausa", "receita"],
        0,
        "A lista mantém o foco no que realmente precisa.",
      ),
      multi(
        "tito",
        "Quais atitudes reduzem o desperdício de alimentos?",
        [
          "Usar talos e cascas em receitas",
          "Guardar o que vence primeiro na frente",
          "Comprar mais do que vai usar",
          "Congelar sobras",
        ],
        [0, 1, 3],
        "Aproveitar talos, organizar a geladeira e congelar sobras são hábitos que reduzem o desperdício.",
      ),
      order(
        "nina",
        "Coloque em ordem o reaproveitamento de um talo de brócolis:",
        [
          "Lave bem o talo",
          "Corte em pedaços pequenos",
          "Refogue com alho e azeite",
          "Sirva como acompanhamento",
        ],
        "Talos de brócolis rendem um ótimo refogado, cheio de fibras.",
      ),
    ],
  },

  "lesson-4-1": {
    concepts: [
      concept(
        "nina",
        "Fome física e fome emocional",
        "A **fome física** vem do corpo, aos poucos, e aceita vários alimentos. A **fome emocional** vem de sentimentos, chega de repente e pede algo específico.",
        [
          "Física: gradual, satisfaz com refeição",
          "Emocional: urgente, foca em conforto, pode gerar culpa",
        ],
        "Comer por emoção é humano. O problema é quando é o único recurso.",
      ),
      concept(
        "nina",
        "Escala de fome e gatilhos",
        "Uma escala de 1 a 10 ajuda a perceber o momento: 1 a 3 é muita fome, 4 a 6 é conforto e 7 a 10 é cheio demais. Note também **gatilhos**: estresse, tédio, cansaço, solidão.",
        ["Anote quando e por que vem a vontade", "Repare em padrões de horário e de emoção"],
      ),
      concept(
        "nina",
        "Estratégias de acolhimento",
        "Antes de comer por impulso, faça uma **pausa**: respire, nomeie a emoção e decida com calma. A comida pode ser uma das respostas, mas não a única.",
        ["Caminhar, conversar, descansar, escrever", "Sem culpa nem punição depois"],
      ),
    ],
    extra1: [
      multi(
        "nina",
        "Quais são sinais de fome EMOCIONAL?",
        [
          "Vontade urgente e específica",
          "Aparece aos poucos",
          "Pode gerar culpa depois",
          "Some com qualquer alimento",
        ],
        [0, 2],
        "A fome emocional é urgente, específica e às vezes vem acompanhada de culpa.",
      ),
      match(
        "nina",
        "Ligue o gatilho emocional a uma forma de acolhimento, sem ser a comida:",
        [
          ["Estresse", "Respirar fundo ou caminhar"],
          ["Tédio", "Uma atividade prazerosa"],
          ["Solidão", "Conversar com alguém"],
        ],
        "Cada emoção pede um cuidado diferente. A comida pode ajudar, mas não precisa ser a única resposta.",
      ),
      order(
        "nina",
        "Coloque em ordem uma pausa antes de comer por impulso:",
        [
          "Pare e respire",
          "Pergunte: é fome no estômago?",
          "Nomeie a emoção que sente",
          "Decida com calma o que fazer",
        ],
        "Esse pequeno ritual devolve a escolha para você, sem julgamento.",
      ),
      reflect(
        "nina",
        "Na última vez que comeu por impulso, o que você estava sentindo? Havia outra forma de cuidar de si naquele momento?",
      ),
    ],
    extra2: [
      sort(
        "nina",
        "Fome física ou emocional?",
        ["Fome física", "Fome emocional"],
        [
          ["Surge gradualmente", 0],
          ["Aceita vários alimentos", 0],
          ["Estômago ronca", 0],
          ["Vem de repente", 1],
          ["Vontade de algo específico", 1],
          ["Culpa depois de comer", 1],
        ],
        "A fome física é flexível e gradual. A emocional é urgente e específica.",
      ),
      scenario(
        "nina",
        "Depois de um dia estressante no trabalho, Fernanda sente uma vontade urgente de comer chocolate, mesmo tendo almoçado bem.",
        "O que pode ajudar Fernanda a entender melhor essa vontade?",
        [
          "Fazer uma pausa e perguntar se é fome física ou emocional",
          "Comer o quanto quiser sem pensar",
          "Se proibir de comer chocolate para sempre",
          "Ignorar completamente o que está sentindo",
        ],
        0,
        "A pausa ajuda a identificar a origem da vontade e escolher uma resposta com mais consciência.",
      ),
      quiz(
        "nina",
        "A fome emocional costuma pedir:",
        [
          "Alimentos específicos, geralmente de conforto",
          "Qualquer alimento disponível",
          "Só água",
          "Nada, ela desaparece sozinha",
        ],
        0,
        "A fome emocional costuma ser direcionada a alimentos de conforto, diferente da física.",
      ),
      tf(
        "tito",
        "Sentir vontade de comer por causa de uma emoção é sinal de fraqueza.",
        false,
        "É uma resposta humana e comum. O importante é não deixá-la ser a única ferramenta para lidar com emoções.",
      ),
    ],
    extra3: [
      fill(
        "mila",
        "Antes de comer por impulso, vale ___ e perguntar se a fome é no estômago.",
        ["pausar", "correr", "pular a refeição", "ir ao mercado"],
        0,
        "A pausa devolve a escolha para você.",
      ),
      multi(
        "nina",
        "Quais atitudes ajudam a lidar com a fome emocional, sem culpa?",
        [
          "Reconhecer a emoção sem julgamento",
          "Se punir depois de comer",
          "Buscar outras formas de acolhimento",
          "Pedir ajuda quando for recorrente",
        ],
        [0, 2, 3],
        "Acolhimento e apoio ajudam muito mais do que punição e culpa.",
      ),
      reflect(
        "nina",
        "Quais são 3 formas de se acolher além de comer, que funcionam bem para você?",
        "Ex.: caminhar, ouvir música, ligar para alguém…",
      ),
    ],
  },

  "lesson-4-2": {
    concepts: [
      concept(
        "nina",
        "O que é comer com atenção",
        "Comer com atenção (mindful eating) é estar **presente** na refeição: perceber cores, cheiros, sabores e os sinais de fome e saciedade, sem julgamento.",
        ["Sem telas e sem pressa", "Mastigue bem e perceba as texturas"],
      ),
      concept(
        "nina",
        "Sinais de saciedade",
        "O cérebro leva cerca de **20 minutos** para registrar que você está satisfeito. Comer devagar dá tempo a esse sinal.",
        ["Apoie o talher entre as garfadas", "Pare quando estiver confortável, não cheio"],
      ),
      concept(
        "nina",
        "Atenção em rotina corrida",
        "Nem toda refeição será perfeita. Pequenos gestos já ajudam.",
        [
          "Guarde o celular por 10 minutos",
          "Respire três vezes antes de começar",
          "Escolha uma refeição do dia para praticar",
        ],
      ),
    ],
    extra1: [
      multi(
        "mila",
        "Quais práticas ajudam a comer com mais atenção?",
        [
          "Desligar telas",
          "Mastigar devagar",
          "Comer andando com pressa",
          "Perceber cores e cheiros",
        ],
        [0, 1, 3],
        "Presença e ritmo são a base de comer com mais atenção.",
      ),
      match(
        "nina",
        "Ligue a prática ao benefício:",
        [
          ["Mastigar devagar", "Percebe melhor a saciedade"],
          ["Desligar o celular", "Mais presença na refeição"],
          ["Sentar à mesa", "Menos distração"],
        ],
        "Cada pequeno hábito soma para uma refeição mais consciente.",
      ),
      order(
        "nina",
        "Coloque em ordem uma refeição com atenção plena:",
        [
          "Sente-se sem telas por perto",
          "Observe cor, cheiro e textura",
          "Mastigue devagar",
          "Faça pausas e perceba a saciedade",
        ],
        "Seguir esses passos ajuda o corpo a registrar melhor a refeição.",
      ),
      reflect(
        "nina",
        "Na sua última refeição, você estava presente ou distraído(a)? O que poderia ajudar a estar mais presente na próxima?",
      ),
    ],
    extra2: [
      sort(
        "mila",
        "Esta prática ajuda ou atrapalha a comer com atenção?",
        ["Ajuda", "Atrapalha"],
        [
          ["Desligar as telas", 0],
          ["Mastigar bem", 0],
          ["Sentar à mesa", 0],
          ["Comer no carro com pressa", 1],
          ["Rolar o celular comendo", 1],
          ["Engolir sem mastigar", 1],
        ],
        "Presença e ritmo ajudam a perceber a saciedade.",
      ),
      scenario(
        "mila",
        "Lucas sempre almoça assistindo vídeos no celular e, no final, sente que 'nem percebeu' o que comeu.",
        "O que poderia ajudar Lucas a comer com mais atenção?",
        [
          "Guardar o celular durante a refeição",
          "Comer mais rápido para acabar logo o vídeo",
          "Assistir vídeos ainda mais interessantes",
          "Comer em pé para ganhar tempo",
        ],
        0,
        "Guardar o celular ajuda Lucas a notar sabor, textura e os sinais de saciedade do próprio corpo.",
      ),
      quiz(
        "nina",
        "Comer devagar ajuda principalmente porque:",
        [
          "Dá tempo para o cérebro registrar a saciedade",
          "Faz a comida esfriar mais rápido",
          "Não tem nenhum efeito real",
          "Deixa a refeição sem graça",
        ],
        0,
        "O cérebro leva cerca de 20 minutos para perceber a saciedade — comer devagar acompanha esse ritmo.",
      ),
      tf(
        "nina",
        "Prestar atenção na refeição pode aumentar o prazer de comer.",
        true,
        "Perceber sabores, texturas e cheiros costuma tornar a experiência mais prazerosa, não menos.",
      ),
    ],
    extra3: [
      fill(
        "nina",
        "O cérebro leva cerca de ___ minutos para registrar a sensação de saciedade.",
        ["20", "2", "60", "120"],
        0,
        "Por isso comer devagar evita passar do ponto.",
      ),
      multi(
        "nina",
        "Quais sinais podem indicar saciedade confortável?",
        [
          "Ausência de fome, mas sem estar cheio demais",
          "Barriga estufada e desconfortável",
          "Satisfação tranquila",
          "Vontade de continuar comendo por hábito",
        ],
        [0, 2],
        "Saciedade confortável é um estado tranquilo, sem exagero nem desconforto.",
      ),
      slider(
        "nina",
        "Numa escala de 1 (faminto) a 10 (empanturrado), qual nível costuma indicar um bom ponto para parar de comer?",
        { min: 1, max: 10, step: 1, unit: "" },
        7,
        1,
        "Por volta de 7, a pessoa costuma estar satisfeita e confortável, sem exagerar.",
      ),
    ],
  },

  "lesson-4-3": {
    concepts: [
      concept(
        "nina",
        "Restrição x flexibilidade",
        "Dietas muito restritivas costumam levar a um ciclo de **restrição e compulsão**. A flexibilidade, com espaço para todos os alimentos, é mais sustentável.",
        ["Nenhum alimento é proibido", "O equilíbrio vale para a semana toda"],
      ),
      concept(
        "nina",
        "Diálogo interno gentil",
        "A forma como falamos conosco influencia o comportamento. Troque o **tudo ou nada** por pensamentos realistas e gentis.",
        [
          "'Estraguei tudo' vira 'uma refeição não define minha saúde'",
          "'Preciso compensar' vira 'volto ao meu ritmo'",
        ],
      ),
      concept(
        "nina",
        "Quando buscar ajuda",
        "Culpa intensa, compulsões, restrições que atrapalham a vida ou medo de comer merecem apoio **profissional**. Nutricionistas e psicólogos podem ajudar.",
        ["Buscar ajuda é cuidado, não fraqueza", "Família e amigos também fazem parte da rede"],
      ),
    ],
    extra1: [
      multi(
        "nina",
        "Quais pensamentos são mais gentis e sustentáveis?",
        [
          "Uma refeição não define minha saúde",
          "Estraguei tudo, não adianta mais",
          "Amanhã eu sigo meu ritmo normal",
          "Preciso me punir por ter comido isso",
        ],
        [0, 2],
        "Pensamentos gentis mantêm a constância sem alimentar o ciclo de culpa.",
      ),
      match(
        "nina",
        "Ligue o pensamento ao tipo:",
        [
          ["Comi bolo, mas sigo bem hoje", "Pensamento flexível"],
          ["Comi bolo, agora só fome zero", "Pensamento tudo ou nada"],
          ["Posso incluir doce com equilíbrio", "Pensamento flexível"],
        ],
        "Reconhecer o próprio padrão de pensamento é o primeiro passo para mudá-lo.",
      ),
      order(
        "nina",
        "Coloque em ordem um recomeço gentil depois de um exagero:",
        [
          "Perceba sem se julgar",
          "Beba água e descanse",
          "Volte à próxima refeição normalmente",
          "Reflita com gentileza sobre o que aconteceu",
        ],
        "O recomeço gentil é sempre mais eficiente do que o castigo.",
      ),
      reflect(
        "nina",
        "Como você fala consigo mesmo(a) depois de comer algo que considera 'proibido'? Isso te ajuda ou atrapalha?",
      ),
    ],
    extra2: [
      sort(
        "nina",
        "Pensamento gentil ou 'tudo ou nada'?",
        ["Pensamento gentil", "Tudo ou nada"],
        [
          ["Uma refeição não define minha saúde", 0],
          ["Amanhã sigo meu ritmo", 0],
          ["Posso incluir o que gosto", 0],
          ["Estraguei tudo", 1],
          ["Já que falhei, desisto", 1],
          ["Preciso compensar", 1],
        ],
        "Pensamentos gentis mantêm a constância. O tudo ou nada alimenta o ciclo de culpa.",
      ),
      scenario(
        "nina",
        "Depois de comer um pedaço de bolo na festa, Rodrigo pensa em pular o jantar como forma de 'compensar'.",
        "Qual seria uma atitude mais equilibrada?",
        [
          "Fazer o jantar normalmente, sem compensação",
          "Pular o jantar todo",
          "Comer o dobro no jantar de propósito",
          "Se sentir culpado o resto do dia",
        ],
        0,
        "Compensar com restrição alimenta o ciclo de culpa. Seguir a rotina normalmente quebra esse padrão.",
      ),
      quiz(
        "nina",
        "O ciclo de 'restrição extrema seguida de compulsão' costuma ser causado por:",
        [
          "Regras alimentares muito rígidas",
          "Comer de forma flexível",
          "Ter acompanhamento de uma nutricionista",
          "Comer devagar",
        ],
        0,
        "Regras muito rígidas tendem a gerar desejo intenso pelo que foi proibido, alimentando o ciclo.",
      ),
      tf(
        "nina",
        "Buscar ajuda profissional para lidar com a alimentação é sinal de fraqueza.",
        false,
        "Buscar ajuda é um ato de cuidado. Nutricionistas e psicólogos podem apoiar bastante esse processo.",
      ),
    ],
    extra3: [
      fill(
        "lipe",
        "O pensamento 'tudo ou nada' costuma levar à restrição seguida de ___.",
        ["compulsão", "equilíbrio", "saciedade", "disciplina"],
        0,
        "Quanto mais restrição, maior o risco de exagero depois.",
      ),
      reflect(
        "nina",
        "O que você gostaria de lembrar da próxima vez que sentir culpa por comer algo 'fora da dieta'?",
      ),
    ],
  },
};

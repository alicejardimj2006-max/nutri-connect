import { concept, fill, sort, quiz, tf, multi, match, type Draft } from "./trail-content-levels";

export interface AdultExtras {
  /** Um cartão de explicação por nível (1, 2 e 3), exibido antes das perguntas. */
  concepts: [Draft, Draft, Draft];
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
        ["Arroz, feijão, ovo e couve", "Iogurte natural, fruta e aveia", "Pão integral, queijo e tomate"],
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
    extra2: [
      sort(
        "nina",
        "Classifique cada alimento pelo macronutriente que mais predomina nele:",
        ["Carboidratos", "Proteínas", "Gorduras"],
        [["Arroz", 0], ["Macarrão", 0], ["Ovo", 1], ["Frango", 1], ["Azeite", 2], ["Castanhas", 2]],
        "Muitos alimentos misturam nutrientes, mas cada um tem um grupo predominante.",
      ),
      tf(
        "lipe",
        "Carboidratos à noite engordam mais do que consumidos durante o dia, pois o metabolismo para.",
        false,
        "Mito! O ganho de peso depende do total de calorias no final do dia, não do horário em que o carboidrato foi consumido."
      ),
      quiz(
        "nina",
        "Qual destas opções é uma refeição que combina os três grandes macronutrientes de forma equilibrada?",
        ["Apenas um prato de macarrão", "Arroz, feijão, peito de frango grelhado e salada temperada com azeite", "Apenas uma maçã grande", "Pão de forma branco puro"],
        1,
        "Arroz (carboidrato), Frango/Feijão (proteínas) e Azeite (gordura), além das fibras da salada. Excelente combinação!"
      )
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
        "Ovo, frango e lentilhas são alimentos construtores! O azeite é gordura e a batata é carboidrato."
      ),
      match(
        "tito",
        "Ligue o macronutriente à sua principal função no corpo:",
        [
          { left: "Carboidrato", right: "Energia primária" },
          { left: "Proteína", right: "Construção de tecidos" },
          { left: "Gordura", right: "Reserva de energia e hormônios" }
        ],
        "Cada macronutriente é como um departamento diferente da mesma fábrica, trabalhando em conjunto!"
      )
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
    extra2: [
      sort(
        "mila",
        "Onde está o nutriente? Classifique cada alimento:",
        ["Rico em vitamina C", "Rico em cálcio"],
        [["Acerola", 0], ["Goiaba", 0], ["Laranja", 0], ["Leite", 1], ["Iogurte", 1], ["Queijo", 1]],
        "Frutas cítricas e goiaba lideram em vitamina C. Os laticínios são as fontes mais conhecidas de cálcio.",
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
    extra2: [
      sort(
        "tito",
        "Classifique conforme a quantidade de fibras:",
        ["Boa fonte de fibras", "Pouca fibra"],
        [["Feijão", 0], ["Aveia", 0], ["Maçã com casca", 0], ["Refrigerante", 1], ["Pão branco", 1], ["Suco coado", 1]],
        "Alimentos inteiros e integrais concentram as fibras. Os refinados e os líquidos açucarados têm muito pouco.",
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
        ["Leia a lista de ingredientes", "Tenha lanches in natura à mão", "Prefira versões simples quando comprar prontos"],
      ),
    ],
    extra2: [
      sort(
        "nina",
        "Classifique conforme o processamento:",
        ["In natura ou minimamente processado", "Ultraprocessado"],
        [["Banana", 0], ["Ovo", 0], ["Arroz", 0], ["Refrigerante", 1], ["Salgadinho", 1], ["Nuggets", 1]],
        "Se tem lista longa de aditivos e vem pronto para consumo, é ultraprocessado.",
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
    ],
  },

  "lesson-2-2": {
    concepts: [
      concept(
        "nina",
        "A ordem dos ingredientes importa",
        "Por lei, os ingredientes são listados do **maior para o menor** em quantidade. Os três primeiros já dizem quase tudo sobre o produto.",
        ["Açúcar em primeiro lugar: produto feito principalmente de açúcar", "Farinha integral em primeiro: mais fibras"],
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
        ["'Integral' exige farinha integral como principal ingrediente", "'Zero açúcar' pode ter adoçantes e outros aditivos"],
      ),
    ],
    extra2: [
      sort(
        "mila",
        "Este ingrediente indica açúcar adicionado?",
        ["Indica açúcar", "Não indica açúcar"],
        [["Xarope de glicose", 0], ["Maltodextrina", 0], ["Açúcar invertido", 0], ["Farinha integral", 1], ["Aveia", 1], ["Sal", 1]],
        "Xaropes, maltodextrina e açúcar invertido são formas de açúcar. Aveia, farinha integral e sal não.",
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
    ],
  },

  "lesson-2-3": {
    concepts: [
      concept(
        "nina",
        "Ler a tabela em 3 passos",
        "A tabela nutricional traz informações padronizadas. O segredo é seguir uma ordem.",
        ["1. Veja o tamanho da porção", "2. Veja calorias e nutrientes por porção", "3. Compare o %VD (valor diário)"],
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
        ["Limite: sódio, açúcares adicionados, gordura saturada", "Busque: fibras, proteínas, vitaminas e minerais"],
      ),
    ],
    extra2: [
      sort(
        "lipe",
        "Este nutriente costuma ser para limitar ou buscar?",
        ["Limitar", "Buscar"],
        [["Sódio", 0], ["Gordura saturada", 0], ["Açúcares adicionados", 0], ["Fibra alimentar", 1], ["Proteínas", 1], ["Vitaminas e minerais", 1]],
        "Não é proibir: é equilibrar. Quanto mais fibras e micronutrientes, melhor.",
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
    ],
  },

  "lesson-3-1": {
    concepts: [
      concept(
        "nina",
        "O prato equilibrado",
        "Uma referência visual simples: **metade** do prato de vegetais e saladas, **um quarto** de proteínas e **um quarto** de carboidratos.",
        ["Metade: legumes, verduras e saladas", "Um quarto: feijão, ovo, carnes, peixe", "Um quarto: arroz, batata, mandioca, massas"],
        "É uma referência flexível, não uma regra rígida.",
      ),
      concept(
        "nina",
        "Escolhendo dentro de cada parte",
        "Varie ao longo da semana para cobrir todos os nutrientes.",
        ["Vegetais: varie as cores", "Proteínas: alterne feijão, ovo, peixe e carnes", "Carboidratos: prefira integrais e raízes"],
      ),
      concept(
        "nina",
        "Adaptando à vida real",
        "Marmita, restaurante ou lanche: a lógica é a mesma. Se faltou vegetal numa refeição, compense na seguinte, **sem culpa**.",
        ["No self-service, comece pelas saladas", "Nos lanches, inclua uma fruta ou castanhas"],
      ),
    ],
    extra2: [
      sort(
        "nina",
        "Em qual parte do prato equilibrado cada alimento entra?",
        ["Metade: vegetais", "Um quarto: proteínas", "Um quarto: carboidratos"],
        [["Brócolis", 0], ["Alface", 0], ["Ovo", 1], ["Frango", 1], ["Arroz", 2], ["Batata", 2]],
        "Vegetais ocupam metade; proteínas e carboidratos dividem a outra metade.",
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
    ],
  },

  "lesson-3-2": {
    concepts: [
      concept(
        "nina",
        "Sabor sem excesso de sal",
        "O consumo elevado de sódio está associado à hipertensão. Ervas, especiarias, alho, cebola e cítricos aumentam o sabor e **reduzem a necessidade de sal**.",
        ["Prefira temperos naturais a caldos e temperos prontos", "Sal grosso tem o mesmo sódio que o refinado"],
      ),
      concept(
        "nina",
        "Guia rápido de ervas e especiarias",
        "Cada tempero combina melhor com certos pratos.",
        ["Manjericão: molhos de tomate e massas", "Coentro: peixes, caldos e saladas", "Alecrim: assados e batatas", "Cúrcuma: arroz, ovos e legumes"],
      ),
      concept(
        "nina",
        "Construindo camadas de sabor",
        "Refogar, tostar especiarias, marinar e finalizar com **acidez** (limão ou vinagre) dão profundidade ao prato.",
        ["Refogue cebola antes do alho", "Ervas delicadas entram no final", "Uma pitada de acidez realça o sabor"],
      ),
    ],
    extra2: [
      sort(
        "lipe",
        "Tempero natural ou industrializado?",
        ["Tempero natural", "Industrializado"],
        [["Alho", 0], ["Salsinha", 0], ["Cominho", 0], ["Caldo em cubo", 1], ["Tempero pronto com realçador", 1], ["Sazon artificial", 1]],
        "Os industrializados concentram sódio e aditivos. Os naturais trazem sabor e compostos benéficos.",
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
        ["Organize a geladeira: o que vence primeiro fica na frente", "Use talos em refogados e sopas"],
      ),
    ],
    extra2: [
      sort(
        "nina",
        "Como armazenar melhor cada item?",
        ["Guardar na geladeira", "Congelar em porções"],
        [["Folhas lavadas e secas", 0], ["Legumes picados", 0], ["Feijão cozido", 1], ["Molho caseiro", 1], ["Sopa pronta", 1], ["Frango cozido em porções", 1]],
        "Congelar preserva preparos prontos por semanas. Folhas e legumes crus duram melhor na geladeira.",
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
    ],
  },

  "lesson-4-1": {
    concepts: [
      concept(
        "nina",
        "Fome física e fome emocional",
        "A **fome física** vem do corpo, aos poucos, e aceita vários alimentos. A **fome emocional** vem de sentimentos, chega de repente e pede algo específico.",
        ["Física: gradual, satisfaz com refeição", "Emocional: urgente, foca em conforto, pode gerar culpa"],
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
    extra2: [
      sort(
        "nina",
        "Fome física ou emocional?",
        ["Fome física", "Fome emocional"],
        [["Surge gradualmente", 0], ["Aceita vários alimentos", 0], ["Estômago ronca", 0], ["Vem de repente", 1], ["Vontade de algo específico", 1], ["Culpa depois de comer", 1]],
        "A fome física é flexível e gradual. A emocional é urgente e específica.",
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
        ["Guarde o celular por 10 minutos", "Respire três vezes antes de começar", "Escolha uma refeição do dia para praticar"],
      ),
    ],
    extra2: [
      sort(
        "mila",
        "Esta prática ajuda ou atrapalha a comer com atenção?",
        ["Ajuda", "Atrapalha"],
        [["Desligar as telas", 0], ["Mastigar bem", 0], ["Sentar à mesa", 0], ["Comer no carro com pressa", 1], ["Rolar o celular comendo", 1], ["Engolir sem mastigar", 1]],
        "Presença e ritmo ajudam a perceber a saciedade.",
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
        ["'Estraguei tudo' vira 'uma refeição não define minha saúde'", "'Preciso compensar' vira 'volto ao meu ritmo'"],
      ),
      concept(
        "nina",
        "Quando buscar ajuda",
        "Culpa intensa, compulsões, restrições que atrapalham a vida ou medo de comer merecem apoio **profissional**. Nutricionistas e psicólogos podem ajudar.",
        ["Buscar ajuda é cuidado, não fraqueza", "Família e amigos também fazem parte da rede"],
      ),
    ],
    extra2: [
      sort(
        "nina",
        "Pensamento gentil ou 'tudo ou nada'?",
        ["Pensamento gentil", "Tudo ou nada"],
        [["Uma refeição não define minha saúde", 0], ["Amanhã sigo meu ritmo", 0], ["Posso incluir o que gosto", 0], ["Estraguei tudo", 1], ["Já que falhei, desisto", 1], ["Preciso compensar", 1]],
        "Pensamentos gentis mantêm a constância. O tudo ou nada alimenta o ciclo de culpa.",
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
    ],
  },
};

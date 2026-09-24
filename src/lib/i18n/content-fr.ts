import type { ContentOverrides } from "./content";

const content: ContentOverrides = {
  "trail:nutrientes": {
    title: "Fondamentaux de la Nutrition",
    tagline: "Nutriments et hydratation",
    description:
      "Macronutriments, vitamines, minéraux, eau et fibres : la base pour comprendre ce dont le corps a besoin.",
  },
  "unit:unit-1": {
    title: "Bases de l'Alimentation",
    description: "Rencontrez les Nutri-Amis et découvrez le pouvoir des aliments.",
  },
  "stop:lesson-1-1": {
    title: "Que sont les Macronutriments ?",
    summary: "Glucides, protéines et lipides : le carburant et les pièces du corps.",
  },
  "act:lesson-1-1-l1-c1": {
    title: "Les trois macronutriments",
    body: "Les macronutriments sont les nutriments dont nous avons besoin en **plus grandes quantités**. Ils fournissent de l'énergie (calories) et la matière première pour que le corps fonctionne.",
    points: [
      "Glucides : énergie rapide (4 kcal par gramme)",
      "Protéines : construction et réparation des tissus (4 kcal par gramme)",
      "Lipides : réserve d'énergie et absorption des vitamines (9 kcal par gramme)",
    ],
    tip: "Aucun groupe n'est un méchant. Ce qui compte, c'est la qualité et l'équilibre entre eux.",
  },
  "act:l1-1-1": {
    text: "Salut ! Je suis Nutri Nina. Ravie de t'avoir ici ! Partons pour un voyage incroyable à la découverte des aliments.",
  },
  "act:l1-1-2": {
    text: "Salut ! Je suis Lipe Abacate. Tu savais que notre corps est comme une voiture de course ? Il a besoin de carburant et de bonnes pièces pour accélérer !",
  },
  "act:l1-1-3": {
    text: "Exactement ! Et les **Macronutriments** sont les pièces et l'essence du corps. Ils se divisent en trois grands groupes : Glucides, Protéines et Lipides.",
  },
  "act:l1-1-4": {
    question:
      "Lequel de ces groupes fonctionne comme l'« essence rapide » de notre corps, donnant de l'énergie immédiate au cerveau et aux muscles ?",
    options: ["Protéines", "Lipides", "Glucides", "Fibres"],
    explanation:
      "C'est ça ! Les glucides sont la principale source d'énergie. Pains, pâtes, racines et fruits en sont pleins.",
  },
  "act:l1-1-5": {
    statement:
      "Les lipides sont les grands méchants de la santé et ne servent à rien dans notre corps.",
    explanation:
      "Les lipides sont super importants ! Ils protègent nos organes et aident à absorber des vitamines essentielles.",
  },
  "act:l1-1-6": {
    question:
      "Et les protéines ? Elles agissent comme les « petites briques » de notre corps. Quel est leur rôle ?",
    options: [
      "Sucrer le sang",
      "Construire et réparer les tissus comme les muscles et la peau",
      "Remplacer l'eau du corps",
      "Provoquer du sommeil après le déjeuner",
    ],
    explanation:
      "Exactement ! Les viandes, les œufs et les légumineuses (comme les haricots) sont riches en protéines, les briques de construction de ton corps.",
  },
  "act:lesson-1-1-l1-y1": {
    question:
      "Lesquelles de ces options sont des sources de glucides complexes (à digestion plus lente) ?",
    options: ["Riz complet", "Soda", "Sucre raffiné", "Patate douce", "Flocons d'avoine"],
    explanation:
      "Le riz complet, l'avoine et la patate douce libèrent l'énergie peu à peu. Le sucre et le soda sont absorbés très vite.",
  },
  "act:lesson-1-1-l1-y2": {
    prompt: "Associez l'aliment au macronutriment qui y domine :",
    pairs: [
      {
        left: "Huile d'olive",
        right: "Lipide",
      },
      {
        left: "Blancs d'œuf",
        right: "Protéine",
      },
      {
        left: "Riz blanc",
        right: "Glucide",
      },
    ],
    explanation: "Presque tout aliment mélange des nutriments, mais chacun en a un qui prédomine.",
  },
  "act:lesson-1-1-l1-y3": {
    prompt:
      "Remettez dans l'ordre une façon pratique de composer une assiette avec les trois macronutriments :",
    items: [
      "Choisissez les légumes colorés",
      "Ajoutez une source de glucides",
      "Complétez avec une source de protéines",
      "Terminez avec un bon lipide, comme l'huile d'olive ou les noix",
    ],
    explanation: "Penser par parties facilite la composition d'un repas équilibré sans rien peser.",
  },
  "act:lesson-1-1-l1-y4": {
    prompt:
      "Pensez à votre dernier repas principal : contenait-il des glucides, des protéines et de bons lipides ? Que pourriez-vous ajuster ?",
    placeholder: "Écrivez librement sur votre dernier repas…",
  },
  "act:lesson-1-1-l2-c1": {
    title: "Comment combiner les macronutriments",
    body: "Un repas complet réunit généralement une source de **glucides**, une de **protéines** et des **légumes**. La combinaison apporte énergie, satiété et nutriments en même temps.",
    points: [
      "Riz, haricots, œuf et chou vert",
      "Yaourt nature, fruit et avoine",
      "Pain complet, fromage et tomate",
    ],
    tip: "Le riz aux haricots est un duo classique : les acides aminés de l'un complètent ceux de l'autre.",
  },
  "act:lesson-1-1-l2-1": {
    text: "C'est l'heure de s'entraîner ! Associons chaque nutriment au rôle qu'il joue dans le corps.",
  },
  "act:lesson-1-1-l2-2": {
    prompt: "Associez chaque nutriment à sa fonction principale :",
    pairs: [
      {
        left: "Glucides",
        right: "Énergie rapide",
      },
      {
        left: "Protéines",
        right: "Construire et réparer les tissus",
      },
      {
        left: "Bons lipides",
        right: "Réserve d'énergie et absorption des vitamines",
      },
      {
        left: "Vitamines",
        right: "Réguler le fonctionnement du corps",
      },
    ],
    explanation:
      "Chaque groupe a un rôle ! C'est pourquoi l'assiette idéale en mélange plusieurs, sans en exclure aucun.",
  },
  "act:lesson-1-1-l2-3": {
    question: "Quel repas réunit glucides, protéines et légumes en même temps ?",
    options: [
      "Juste une pomme",
      "Biscuits fourrés et jus en brique",
      "Soda et frites",
      "Riz, haricots, œuf brouillé et chou vert sauté",
    ],
    explanation:
      "Le riz (glucide), les haricots et l'œuf (protéines) et le chou (légume) forment un repas complet et économique.",
  },
  "act:lesson-1-1-l2-4": {
    statement: "Le riz aux haricots est un duo qui fournit des glucides et des protéines.",
    explanation:
      "C'est ça ! En plus, les haricots apportent des fibres et du fer. Une combinaison brésilienne et nutritive.",
  },
  "act:lesson-1-1-l2-5": {
    question: "Cochez TOUTES les bonnes sources de protéines :",
    options: ["Confiture", "Laitue", "Lentilles", "Œufs", "Poisson"],
    explanation:
      "Les œufs, les lentilles et le poisson sont riches en protéines. La laitue contient beaucoup d'eau et de vitamines, et la confiture est surtout du sucre.",
  },
  "act:lesson-1-1-l2-x1": {
    prompt: "Classez chaque aliment selon le macronutriment qui y prédomine :",
    groups: ["Glucides", "Protéines", "Lipides"],
    items: ["Riz", "Pâtes", "Œuf", "Poulet", "Huile d'olive", "Noix"],
    explanation:
      "Beaucoup d'aliments mélangent les nutriments, mais chacun a un groupe prédominant.",
  },
  "act:lesson-1-1-l2-x2": {
    statement:
      "Les glucides le soir font davantage grossir que pendant la journée, car le métabolisme s'arrête.",
    explanation:
      "Mythe ! La prise de poids dépend du total des calories en fin de journée, pas de l'heure à laquelle le glucide a été consommé.",
  },
  "act:lesson-1-1-l2-x3": {
    question:
      "Laquelle de ces options est un repas qui combine les trois grands macronutriments de façon équilibrée ?",
    options: [
      "Juste une assiette de pâtes",
      "Juste une grosse pomme",
      "Du pain de mie blanc seul",
      "Riz, haricots, blanc de poulet grillé et salade assaisonnée à l'huile d'olive",
    ],
    explanation:
      "Riz (glucide), poulet/haricots (protéines) et huile d'olive (lipide), plus les fibres de la salade. Excellente combinaison !",
  },
  "act:lesson-1-1-l2-x4": {
    setup: "Ana n'a pas le temps de déjeuner et prend juste un petit pain avec un café.",
    question: "Qu'est-ce qui aiderait le plus à rendre cette collation plus complète ?",
    options: [
      "Ajouter une protéine et un fruit",
      "Juste plus de café",
      "Rien, c'est déjà très bien comme ça",
      "Le remplacer par un autre pain",
    ],
    explanation:
      "Un œuf, du fromage ou du yaourt (protéine) et un fruit apportent plus de satiété et d'équilibre à la collation d'Ana.",
  },
  "act:lesson-1-1-l3-c1": {
    title: "La qualité compte plus que le groupe",
    body: "Dans chaque macronutriment, il y a de meilleurs et de moins bons choix. Il vaut la peine de regarder **d'où** vient chacun, et pas seulement la quantité dans l'assiette.",
    points: [
      "Glucides : complets et racines plutôt que farines raffinées et sucre",
      "Lipides : insaturés (huile d'olive, avocat, noix) plutôt que trans et excès de saturés",
      "Protéines : œufs, légumineuses, poissons plutôt que charcuteries ultra-transformées",
    ],
  },
  "act:lesson-1-1-l3-1": {
    text: "Maintenant, c'est pour les experts ! Je vais te donner des situations du quotidien. On y va ?",
  },
  "act:lesson-1-1-l3-2": {
    question:
      "Après l'entraînement, Ana veut aider ses muscles à récupérer. Quelle collation a le plus de sens ?",
    options: ["Yaourt nature avec fruits et avoine", "Soda", "Bonbons et chewing-gums", "Chips"],
    explanation:
      "Protéine (yaourt) + glucides (fruit et avoine) aident à la récupération et reconstituent l'énergie dépensée.",
  },
  "act:lesson-1-1-l3-3": {
    statement: "L'avocat et l'huile d'olive sont des sources de bons lipides (insaturés).",
    explanation:
      "Vrai ! Les lipides insaturés aident le cœur et l'absorption des vitamines A, D, E et K.",
  },
  "act:lesson-1-1-l3-4": {
    question: "Cochez les affirmations VRAIES sur les glucides :",
    options: [
      "Ils sont la principale source d'énergie du cerveau",
      "Ils existent naturellement dans les fruits et les racines",
      "Tous les glucides sont exactement pareils",
      "Les versions complètes contiennent généralement plus de fibres",
    ],
    explanation:
      "Tous les glucides ne se valent pas : les complets et les naturels (fruits, racines) viennent avec des fibres et des nutriments.",
  },
  "act:lesson-1-1-l3-5": {
    prompt: "Classez du MOINS au PLUS transformé :",
    items: ["Manioc cuit", "Farine de manioc", "Pain de mie", "Biscuit fourré"],
    explanation:
      "Plus il y a d'étapes industrielles et d'ingrédients, plus c'est transformé. Le manioc cuit est presque tel qu'il est sorti de terre.",
  },
  "act:lesson-1-1-l3-6": {
    prompt: "Associez l'aliment au nutriment qui y prédomine :",
    pairs: [
      {
        left: "Pain complet",
        right: "Glucides",
      },
      {
        left: "Œuf dur",
        right: "Protéines",
      },
      {
        left: "Noix",
        right: "Bons lipides",
      },
      {
        left: "Orange",
        right: "Vitamine C",
      },
    ],
    explanation: "Savoir ce que chaque aliment apporte aide à composer des repas complets.",
  },
  "act:lesson-1-1-l3-7": {
    question: "Un régime « uniquement protéines » serait-il l'idéal ?",
    options: [
      "Non : le corps a besoin de tous les groupes en équilibre",
      "Oui, parce que les glucides font du mal",
      "Seulement le matin",
      "Oui, parce que les protéines sont le nutriment le plus important",
    ],
    explanation:
      "Aucun nutriment ne travaille seul. L'équilibre et la variété sont la base d'une alimentation saine.",
  },
  "act:lesson-1-1-l3-x1": {
    sentence:
      "Les lipides insaturés, présents dans l'huile d'olive et dans l'___, aident à protéger le cœur.",
    options: ["pain blanc", "sucre", "soda", "avocat"],
    explanation: "L'avocat est riche en lipides insaturés, ainsi qu'en fibres et en potassium.",
  },
  "act:lesson-1-1-l3-x2": {
    question:
      "Lesquels des aliments ci-dessous sont considérés comme d'excellentes sources de protéines ?",
    options: ["Pomme de terre", "Œuf", "Blanc de poulet", "Lentilles", "Huile d'olive"],
    explanation:
      "L'œuf, le poulet et les lentilles sont des aliments bâtisseurs ! L'huile d'olive est un lipide et la pomme de terre un glucide.",
  },
  "act:lesson-1-1-l3-x3": {
    prompt: "Associez le macronutriment à sa fonction principale dans le corps :",
    pairs: [
      {
        left: "Glucide",
        right: "Énergie primaire",
      },
      {
        left: "Protéine",
        right: "Construction des tissus",
      },
      {
        left: "Lipide",
        right: "Réserve d'énergie et hormones",
      },
    ],
    explanation:
      "Chaque macronutriment est comme un service différent de la même usine, qui travaillent ensemble !",
  },
  "stop:lesson-1-2": {
    title: "Petits Géants : les Vitamines",
    summary: "Vitamines et minéraux : de petits nutriments aux fonctions géantes.",
  },
  "act:lesson-1-2-l1-c1": {
    title: "Micronutriments : petits et essentiels",
    body: "Les vitamines et les minéraux sont des **micronutriments** : le corps en a besoin en petites quantités, mais sans eux l'immunité, la vue, les os et l'énergie ne fonctionnent pas bien.",
    points: [
      "Vitamines : A, C, D, E, K et celles du complexe B",
      "Minéraux : calcium, fer, zinc, magnésium, potassium",
      "Le corps en produit peu : presque tout vient de l'alimentation",
    ],
    tip: "Une variété de couleurs dans l'assiette signifie généralement une variété de micronutriments.",
  },
  "act:l1-2-1": {
    text: "Salut ! Je suis Mila Maçã. On a parlé des « Macros », parlons maintenant des « Micros » : Vitamines et Minéraux. Ils ne donnent pas d'énergie, mais...",
  },
  "act:l1-2-2": {
    text: "...ce sont les outils qui règlent tout le fonctionnement de la machine. Comme l'huile moteur et le système électrique d'une voiture !",
  },
  "act:l1-2-3": {
    statement:
      "Une alimentation très colorée ne fait aucune différence ; l'important est de manger peu.",
    explanation:
      "Des couleurs différentes dans les aliments signifient des vitamines et des minéraux différents ! Plus c'est coloré, plus c'est riche.",
  },
  "act:l1-2-4": {
    question:
      "Tu connais la vitamine C ? La célèbre contre les rhumes. Où la trouve-t-on en grande quantité ?",
    options: ["Viandes rouges", "Agrumes (orange, acérola)", "Huile de soja", "Riz blanc"],
    explanation:
      "Parfait ! Les agrumes sont d'excellentes sources de vitamine C, qui renforce l'immunité.",
  },
  "act:l1-2-5": {
    question:
      "Et pour avoir des os solides, quel est le minéral le plus célèbre dont nous avons besoin ?",
    options: ["Sodium", "Zinc", "Calcium", "Magnésium"],
    explanation:
      "C'est ça ! Le calcium, très présent dans le lait, les fromages et même dans les légumes vert foncé, forme la structure de nos os.",
  },
  "act:lesson-1-2-l1-y1": {
    prompt: "Associez la vitamine ou le minéral à sa fonction :",
    pairs: [
      {
        left: "Vitamine D",
        right: "Aide à absorber le calcium",
      },
      {
        left: "Zinc",
        right: "Immunité et cicatrisation",
      },
      {
        left: "Vitamine K",
        right: "Coagulation du sang",
      },
      {
        left: "Magnésium",
        right: "Fonction musculaire et nerveuse",
      },
    ],
    explanation:
      "Chaque micronutriment a son propre rôle, et tous travaillent ensemble dans le corps.",
  },
  "act:lesson-1-2-l1-y2": {
    question: "Lesquels de ceux-ci sont des MINÉRAUX (et non des vitamines) ?",
    options: ["Vitamine B12", "Zinc", "Fer", "Calcium", "Vitamine C"],
    explanation:
      "Le fer, le zinc et le calcium sont des minéraux. La vitamine C et la B12 sont des vitamines.",
  },
  "act:lesson-1-2-l1-y3": {
    prompt:
      "Remettez dans l'ordre une façon d'améliorer l'absorption du fer d'origine végétale dans un repas :",
    items: [
      "Préparez les haricots ou les lentilles",
      "Ajoutez un aliment riche en vitamine C, comme le citron ou l'orange",
      "Évitez le café ou le thé noir pendant le même repas",
      "Servez et savourez",
    ],
    explanation: "La vitamine C transforme le fer végétal en une forme plus facile à absorber.",
  },
  "act:lesson-1-2-l1-y4": {
    prompt:
      "Votre alimentation cette semaine comptait-elle au moins 3 couleurs différentes de fruits et légumes par jour ? Qu'est-ce qui pourrait colorer davantage votre assiette ?",
  },
  "act:lesson-1-2-l2-c1": {
    title: "Où trouver chacun",
    body: "Aucun aliment n'a tout. C'est pourquoi la **variété** est la meilleure stratégie pour couvrir les besoins.",
    points: [
      "Vitamine C : acérola, goyave, orange, poivron",
      "Fer : haricots, lentilles, feuilles foncées, viandes",
      "Calcium : lait et produits laitiers, chou vert, sardines",
      "Vitamine A : carotte, citrouille, mangue",
    ],
  },
  "act:lesson-1-2-l2-1": {
    text: "Entraînons la mémoire des vitamines et des minéraux. Prépare-toi à relier les points !",
  },
  "act:lesson-1-2-l2-2": {
    prompt: "Associez le nutriment à de bonnes sources :",
    pairs: [
      {
        left: "Vitamine C",
        right: "Acérola et orange",
      },
      {
        left: "Calcium",
        right: "Lait, yaourt et chou vert",
      },
      {
        left: "Fer",
        right: "Haricots et feuilles vert foncé",
      },
      {
        left: "Vitamine A",
        right: "Carotte et citrouille",
      },
    ],
    explanation:
      "Varier les couleurs et les groupes d'aliments est la façon la plus simple d'avoir tous ces nutriments.",
  },
  "act:lesson-1-2-l2-3": {
    question: "Pourquoi est-il bon de composer une assiette très colorée ?",
    options: [
      "Pour manger moins",
      "Juste parce que c'est joli en photo",
      "Des couleurs différentes ont les mêmes vitamines",
      "Chaque couleur apporte généralement des nutriments différents",
    ],
    explanation:
      "Les couleurs viennent de pigments et de nutriments distincts. Plus il y a de couleurs naturelles, plus il y a de variété nutritionnelle.",
  },
  "act:lesson-1-2-l2-4": {
    statement: "Les vitamines fournissent des calories (de l'énergie) comme les glucides.",
    explanation:
      "Les vitamines et les minéraux ne donnent pas d'énergie, mais aident le corps à utiliser l'énergie des autres nutriments.",
  },
  "act:lesson-1-2-l2-5": {
    question: "Cochez les bonnes sources de vitamine C :",
    options: ["Goyave", "Acérola", "Orange", "Riz", "Pain blanc"],
    explanation:
      "L'acérola, l'orange et la goyave sont parmi les championnes de la vitamine C. La goyave en a plus que l'orange !",
  },
  "act:lesson-1-2-l2-x1": {
    prompt: "Où est le nutriment ? Classez chaque aliment :",
    groups: ["Riche en vitamine C", "Riche en calcium"],
    items: ["Acérola", "Goyave", "Orange", "Lait", "Yaourt", "Fromage"],
    explanation:
      "Les agrumes et la goyave sont en tête pour la vitamine C. Les produits laitiers sont les sources de calcium les plus connues.",
  },
  "act:lesson-1-2-l2-x2": {
    setup: "Marcos est toujours fatigué et soupçonne une anémie par manque de fer.",
    question:
      "Quelle combinaison aiderait le plus à améliorer l'absorption du fer des haricots qu'il mange ?",
    options: [
      "Haricots avec du jus d'orange",
      "Haricots avec du café",
      "Prendre seulement un complément, sans changer l'alimentation",
      "Haricots avec du thé noir",
    ],
    explanation:
      "La vitamine C du jus d'orange augmente l'absorption du fer végétal. Le café et le thé noir gênent ce processus.",
  },
  "act:lesson-1-2-l2-x3": {
    question: "Quelle vitamine le corps peut-il produire avec une exposition modérée au soleil ?",
    options: ["Vitamine C", "Vitamine B12", "Vitamine D", "Vitamine K"],
    explanation:
      "La peau produit de la vitamine D avec la lumière du soleil. Elle aide à fixer le calcium dans les os.",
  },
  "act:lesson-1-2-l2-x4": {
    statement:
      "Les compléments vitaminiques remplacent totalement le besoin d'une alimentation variée.",
    explanation:
      "Les aliments apportent des combinaisons de nutriments, de fibres et d'autres composés que les compléments isolés ne reproduisent pas.",
  },
  "act:lesson-1-2-l3-c1": {
    title: "Absorption : ce qui aide et ce qui gêne",
    body: "Manger ne suffit pas : le corps doit **absorber**. Certains nutriments s'aident et d'autres se font concurrence.",
    points: [
      "La vitamine C améliore l'absorption du fer d'origine végétale",
      "Les bons lipides aident à absorber les vitamines A, D, E et K",
      "Le café et les thés près des repas réduisent l'absorption du fer",
    ],
    tip: "Un conseil simple : des haricots avec de l'orange en dessert, ou du citron sur le chou vert.",
  },
  "act:lesson-1-2-l3-1": {
    text: "Défi d'expert : maintenant les vitamines vont travailler en équipe !",
  },
  "act:lesson-1-2-l3-2": {
    question: "Pour que le corps absorbe mieux le fer des haricots, que combiner au repas ?",
    options: [
      "Un soda",
      "Un agrume ou quelques gouttes de citron",
      "Rien ne change l'absorption",
      "Un café juste après",
    ],
    explanation:
      "La vitamine C aide à absorber le fer d'origine végétale. Le café près du repas, en revanche, la gêne.",
  },
  "act:lesson-1-2-l3-3": {
    statement:
      "Prendre un peu de soleil avec modération aide le corps à produire de la vitamine D.",
    explanation:
      "La peau produit de la vitamine D avec la lumière du soleil. Elle aide à fixer le calcium dans les os.",
  },
  "act:lesson-1-2-l3-4": {
    prompt: "Remettez dans l'ordre la préparation d'un légume en préservant les nutriments :",
    items: [
      "Lavez bien le légume",
      "Coupez-le en gros morceaux",
      "Faites-le cuire rapidement à la vapeur, avec peu d'eau",
      "Servez aussitôt",
    ],
    explanation:
      "De gros morceaux, peu d'eau et un temps court font perdre moins de vitamines, sensibles à la chaleur et à l'eau.",
  },
  "act:lesson-1-2-l3-5": {
    question: "Quelles habitudes aident à préserver les vitamines des légumes ?",
    options: [
      "Cuire à la vapeur peu de temps",
      "Les laisser coupés des jours au soleil",
      "Les faire bouillir des heures dans beaucoup d'eau",
      "En manger une partie crue, en salade",
    ],
    explanation:
      "La cuisson rapide à la vapeur et quelques légumes crus conservent plus de nutriments que les longues cuissons.",
  },
  "act:lesson-1-2-l3-6": {
    question:
      "La vitamine A, présente dans la carotte et la citrouille, est importante surtout pour :",
    options: [
      "Digérer le sucre",
      "Rendre les cheveux roux",
      "La vision et la santé de la peau",
      "Augmenter la masse musculaire",
    ],
    explanation:
      "La vitamine A veille sur la vision, la peau et les défenses du corps. Cadu approuve !",
  },
  "act:lesson-1-2-l3-x1": {
    sentence: "Le ___ aide le corps à mieux absorber le fer des haricots.",
    options: ["café", "chocolat", "citron (vitamine C)", "soda"],
    explanation: "La vitamine C transforme le fer végétal en une forme plus facile à absorber.",
  },
  "act:lesson-1-2-l3-x2": {
    question: "Lesquelles de ces habitudes aident à mieux absorber le fer des végétaux ?",
    options: [
      "Boire du café au même repas",
      "Assaisonner avec du citron",
      "Manger un agrume en même temps",
      "Boire du thé noir en même temps",
    ],
    explanation:
      "La vitamine C et l'acidité du citron aident. Le café et le thé noir concurrencent l'absorption du fer.",
  },
  "act:lesson-1-2-l3-x3": {
    question: "Environ combien de milligrammes de vitamine C contient une orange moyenne ?",
    unit: " mg",
    explanation:
      "Une orange moyenne contient environ 70 mg de vitamine C — plus que le besoin quotidien de nombreux adultes.",
  },
  "stop:lesson-1-3": {
    title: "Eau et Fibres",
    summary: "Eau et fibres : hydratation, satiété et un intestin heureux.",
  },
  "act:lesson-1-3-l1-c1": {
    title: "L'eau : le nutriment oublié",
    body: "L'eau participe à la digestion, régule la température, transporte les nutriments et élimine les déchets. Les fruits, les légumes et les soupes **contribuent** aussi à l'hydratation.",
    points: [
      "La soif est un signal tardif : buvez tout au long de la journée",
      "Une urine claire indique généralement une bonne hydratation",
      "Les boissons sucrées ne remplacent pas l'eau",
    ],
  },
  "act:l1-3-1": {
    text: "Tu savais qu'environ 60 % à 70 % de ton corps est de l'eau ? C'est énorme ! Et il y a quelque chose qui aide ton intestin à fonctionner parfaitement : les fibres.",
  },
  "act:l1-3-2": {
    statement: "On peut remplacer l'eau par des sodas ou des jus sucrés, puisque tout est liquide.",
    explanation:
      "Non ! Les boissons sucrées n'hydratent pas aussi efficacement et apportent un excès de calories. L'eau pure est irremplaçable.",
  },
  "act:l1-3-3": {
    question: "Que font les FIBRES, présentes dans les fruits et légumes, dans notre corps ?",
    options: [
      "Elles forment un petit balai qui nettoie l'intestin et donne de la satiété.",
      "Elles se transforment très vite en sucre dans le sang.",
      "Elles nuisent à l'absorption des nutriments.",
      "Elles font pousser les cheveux roux.",
    ],
    explanation:
      "Parfait ! En plus d'aider aux toilettes, les fibres nous font nous sentir rassasiés plus longtemps.",
  },
  "act:l1-3-4": {
    statement:
      "Manger le fruit avec la peau chaque fois que possible aide à augmenter l'apport en fibres.",
    explanation:
      "Exactement ! La peau et la pulpe sont là où se trouve la plus grande partie des fibres (comme dans la pomme et la poire).",
  },
  "act:lesson-1-3-l1-y1": {
    question:
      "En moyenne, beaucoup de guides suggèrent combien de verres d'eau (200 ml) par jour pour un adulte ?",
    unit: " verres",
    explanation:
      "Une référence courante est d'environ 8 verres (près de 2 litres), mais le besoin réel varie selon le climat, le corps et la routine.",
  },
  "act:lesson-1-3-l1-y2": {
    prompt: "Associez l'aliment au type de fibre qui y prédomine :",
    pairs: [
      {
        left: "Avoine",
        right: "Fibre soluble",
      },
      {
        left: "Son de blé",
        right: "Fibre insoluble",
      },
      {
        left: "Pomme avec la peau",
        right: "Fibre soluble et insoluble",
      },
    ],
    explanation:
      "Les aliments végétaux apportent généralement les deux types de fibres, en proportions différentes.",
  },
  "act:lesson-1-3-l1-y3": {
    question: "Lesquels de ceux-ci aident à augmenter l'apport quotidien en fibres ?",
    options: [
      "Inclure des haricots dans les repas",
      "Choisir du pain complet",
      "Éplucher tous les légumes",
      "Remplacer le jus par le fruit entier",
    ],
    explanation:
      "Le fruit entier et les haricots préservent les fibres. Tout éplucher en retire une partie.",
  },
  "act:lesson-1-3-l1-y4": {
    prompt:
      "Combien de verres d'eau avez-vous déjà bus aujourd'hui ? Qu'est-ce qui pourrait vous aider à penser à boire davantage au fil de la journée ?",
  },
  "act:lesson-1-3-l2-c1": {
    title: "Fibres : solubles et insolubles",
    body: "Les fibres sont des parties des végétaux que nous ne digérons pas, et chaque type a un rôle.",
    points: [
      "Solubles (avoine, haricots, pomme) : aident le cholestérol et la glycémie",
      "Insolubles (céréales complètes, légumes verts) : améliorent le transit intestinal",
      "Les deux augmentent la satiété",
    ],
    tip: "La plupart des aliments végétaux contiennent les deux types.",
  },
  "act:lesson-1-3-l2-1": {
    text: "L'eau et les fibres sont mes super-pouvoirs ! Voyons si tu les maîtrises déjà.",
  },
  "act:lesson-1-3-l2-2": {
    prompt: "Associez chaque élément à ce qu'il représente :",
    pairs: [
      {
        left: "Eau",
        right: "Transporte les nutriments et régule la température",
      },
      {
        left: "Fibres",
        right: "Aident l'intestin et donnent de la satiété",
      },
      {
        left: "Soif",
        right: "Signe que le corps a déjà besoin d'eau",
      },
      {
        left: "Urine très claire",
        right: "Signe d'une bonne hydratation",
      },
    ],
    explanation: "Observer son corps est un excellent moyen de savoir si l'on est bien hydraté.",
  },
  "act:lesson-1-3-l2-3": {
    question: "Quelle option contient LE PLUS de fibres ?",
    options: ["Jus d'orange filtré", "Orange avec la pulpe", "Gélatine", "Soda à l'orange"],
    explanation:
      "Quand on filtre le jus, les fibres restent derrière. Le fruit entier garde tout et rassasie davantage.",
  },
  "act:lesson-1-3-l2-4": {
    statement: "Quand on mange plus de fibres, il est aussi important de boire plus d'eau.",
    explanation:
      "L'eau aide les fibres à faire leur travail dans l'intestin sans causer d'inconfort.",
  },
  "act:lesson-1-3-l2-5": {
    question: "Cochez les bonnes sources de fibres :",
    options: ["Fruits avec la peau", "Avoine", "Soda", "Haricots", "Pain blanc"],
    explanation:
      "Les légumineuses, les céréales complètes et les fruits avec la peau sont riches en fibres.",
  },
  "act:lesson-1-3-l2-x1": {
    prompt: "Classez selon la quantité de fibres :",
    groups: ["Bonne source de fibres", "Peu de fibres"],
    items: ["Haricots", "Avoine", "Pomme avec la peau", "Soda", "Pain blanc", "Jus filtré"],
    explanation:
      "Les aliments entiers et complets concentrent les fibres. Les aliments raffinés et les liquides sucrés en contiennent très peu.",
  },
  "act:lesson-1-3-l2-x2": {
    setup:
      "Beatriz a augmenté d'un coup sa consommation de haricots, de son et de légumes crus, et se sent maintenant le ventre ballonné.",
    question: "Qu'aurait-elle pu faire autrement ?",
    options: [
      "Augmenter les fibres progressivement et boire plus d'eau",
      "Remplacer l'eau par du soda",
      "Tout manger d'un coup, le corps s'habitue vite",
      "Ne manger aucune fibre",
    ],
    explanation:
      "Une augmentation brutale des fibres sans assez d'eau provoque généralement de l'inconfort. Une transition progressive est idéale.",
  },
  "act:lesson-1-3-l2-x3": {
    question: "Laquelle de ces boissons hydrate bien, sans sucre ajouté ?",
    options: ["Eau de coco naturelle", "Boisson en poudre", "Jus en brique sucré", "Soda"],
    explanation:
      "L'eau de coco naturelle hydrate bien et ne contient pas de sucre ajouté, contrairement aux autres options.",
  },
  "act:lesson-1-3-l2-x4": {
    statement:
      "Les fruits et légumes contribuent à l'hydratation du corps, en plus de l'eau que nous buvons.",
    explanation:
      "Beaucoup de fruits et de légumes ont une forte teneur en eau, comme la pastèque, le concombre et l'orange.",
  },
  "act:lesson-1-3-l3-c1": {
    title: "Augmenter les fibres sans inconfort",
    body: "Augmentez **progressivement** et buvez plus d'eau. Préférez les aliments entiers aux compléments et aux jus filtrés.",
    points: [
      "Remplacez le jus filtré par le fruit entier",
      "Incluez une légumineuse par jour",
      "Choisissez des céréales complètes et des graines",
    ],
  },
  "act:lesson-1-3-l3-1": {
    text: "Niveau expert ! Analysons des situations du quotidien.",
  },
  "act:lesson-1-3-l3-2": {
    question:
      "Rafa veut remplacer le jus en brique de sa collation à l'école. Quel est le meilleur échange ?",
    options: [
      "Bonbon aux fruits",
      "Un fruit entier et de l'eau",
      "Une autre brique d'un autre parfum",
      "Soda zéro",
    ],
    explanation:
      "Le fruit entier apporte des fibres et des vitamines et rassasie, et l'eau hydrate sans sucre ajouté.",
  },
  "act:lesson-1-3-l3-3": {
    question: "Quels sont les signes possibles que vous avez besoin de plus d'eau ?",
    options: ["Bouche sèche", "Urine très foncée", "Soif", "Cheveux brillants"],
    explanation:
      "Une urine foncée, une bouche sèche et la soif sont des avertissements du corps. Il vaut la peine de boire de l'eau tout au long de la journée.",
  },
  "act:lesson-1-3-l3-4": {
    statement: "Les fibres alimentaires n'existent que dans les aliments d'origine végétale.",
    explanation:
      "Les fibres viennent des fruits, légumes, céréales et graines. La viande et le lait n'ont pas de fibres.",
  },
  "act:lesson-1-3-l3-5": {
    question: "La quantité idéale d'eau par jour est-elle la même pour tout le monde ?",
    options: [
      "Oui, toujours exactement 2 litres",
      "Ça n'a d'importance qu'en été",
      "Oui, 8 verres pour tous",
      "Non, elle varie selon l'âge, le climat, l'activité et l'alimentation",
    ],
    explanation:
      "Les besoins changent d'une personne à l'autre et d'un jour à l'autre. Écoutez votre corps et buvez tout au long de la journée.",
  },
  "act:lesson-1-3-l3-6": {
    prompt: "Associez l'habitude au bénéfice :",
    pairs: [
      {
        left: "Manger le fruit avec la peau",
        right: "Plus de fibres",
      },
      {
        left: "Boire de l'eau tout au long de la journée",
        right: "Bonne hydratation",
      },
      {
        left: "Remplacer le pain blanc par du complet",
        right: "Plus de satiété",
      },
      {
        left: "Inclure des haricots dans l'assiette",
        right: "Protéines et fibres ensemble",
      },
    ],
    explanation: "Les petits changements du quotidien s'additionnent beaucoup avec le temps.",
  },
  "act:lesson-1-3-l3-x1": {
    sentence:
      "En augmentant la consommation de fibres, il est aussi important d'augmenter l'apport en ___.",
    options: ["sucre", "graisse", "sel", "eau"],
    explanation: "L'eau aide les fibres à former le bol fécal et évite l'inconfort.",
  },
  "act:lesson-1-3-l3-x2": {
    question: "Quels signes peuvent indiquer que vous devez boire plus d'eau ?",
    options: ["Soif intense", "Urine très claire", "Bouche sèche", "Urine très foncée"],
    explanation:
      "Une urine foncée, une bouche sèche et la soif sont des avertissements du corps. Une urine claire indique généralement une bonne hydratation.",
  },
  "act:lesson-1-3-l3-x3": {
    question: "Environ quel pourcentage du poids corporel d'un adulte est de l'eau ?",
    unit: "%",
    explanation:
      "En moyenne, environ 60 % du corps adulte est de l'eau — c'est pourquoi elle est si essentielle pour que tout fonctionne bien.",
  },
  "trail:escolhas": {
    title: "Aliments et Choix",
    tagline: "Étiquettes, assiette et routine",
    description:
      "Du degré de transformation à l'assiette équilibrée : comment lire les étiquettes, assaisonner et planifier la semaine.",
  },
  "unit:unit-2": {
    title: "Comprendre les Aliments",
    description:
      "Devenez un détective des étiquettes et découvrez ce qu'il y a vraiment dans la nourriture.",
  },
  "stop:lesson-2-1": {
    title: "Transformés et Ultra-transformés",
    summary:
      "Bruts, transformés et ultra-transformés : comment la nourriture arrive dans l'assiette.",
  },
  "act:lesson-2-1-l1-c1": {
    title: "Les quatre groupes du Guide Alimentaire",
    body: "Le **Guide Alimentaire pour la Population Brésilienne** classe les aliments selon leur degré de transformation.",
    points: [
      "Bruts ou peu transformés : fruits, œufs, haricots, viande fraîche",
      "Ingrédients culinaires : huile, sel, sucre",
      "Transformés : pain, fromage, conserves",
      "Ultra-transformés : sodas, chips, nuggets",
    ],
    tip: "Règle d'or : faites des aliments bruts la base de l'alimentation et évitez les ultra-transformés.",
  },
  "act:l2-1-1": {
    text: "Parlons du voyage de la nourriture. Imagine un épi de maïs. C'est un aliment brut (directement de la nature).",
  },
  "act:l2-1-2": {
    text: "Si tu fais cuire du maïs en conserve avec du sel, il devient un aliment Transformé. Mais si c'est un « snack au maïs » en sachet...",
  },
  "act:l2-1-3": {
    question:
      "Le snack au maïs, plein de colorants, de conservateurs et d'arômes de laboratoire, est classé comme :",
    options: ["Brut", "Peu transformé", "Ultra-transformé", "Légèrement transformé"],
    explanation:
      "Exactement ! Les ultra-transformés sont des inventions industrielles pleines d'additifs qui trompent notre palais et nous font trop manger.",
  },
  "act:l2-1-4": {
    statement:
      "Pour être en bonne santé, l'objectif est de ne plus jamais mettre un aliment ultra-transformé dans sa bouche pour le reste de sa vie.",
    explanation:
      "Le secret, c'est l'équilibre ! Éplucher plus et déballer moins la plupart du temps, mais manger un snack de temps en temps ne ruinera pas ta santé.",
  },
  "act:lesson-2-1-l1-x1": {
    statement: "Les fruits, les légumes et les œufs sont des exemples d'aliments bruts.",
    explanation:
      "Exactement ! Ce sont des aliments tels qu'ils viennent de la nature, sans passer par l'industrie.",
  },
  "act:lesson-2-1-l1-x2": {
    question: "Lequel de ces aliments est le MOINS transformé ?",
    options: ["Biscuit fourré", "Saucisse", "Pomme", "Bonbon gélifié"],
    explanation:
      "La pomme vient directement de l'arbre. Les autres passent par de nombreuses étapes industrielles.",
  },
  "act:lesson-2-1-l1-y1": {
    prompt: "Associez l'aliment à son groupe selon le Guide Alimentaire :",
    pairs: [
      {
        left: "Haricots crus",
        right: "Brut",
      },
      {
        left: "Fromage",
        right: "Transformé",
      },
      {
        left: "Chips en sachet",
        right: "Ultra-transformé",
      },
      {
        left: "Huile de soja",
        right: "Ingrédient culinaire",
      },
    ],
    explanation:
      "Chaque groupe a un rôle différent dans l'alimentation, et c'est la proportion entre eux qui compte.",
  },
  "act:lesson-2-1-l1-y2": {
    question: "Lesquels de ceux-ci sont des exemples d'ultra-transformés ?",
    options: [
      "Nouilles instantanées",
      "Haricots cuits à la maison",
      "Soda",
      "Riz blanc cru",
      "Saucisse",
    ],
    explanation:
      "Les nouilles instantanées, le soda et la saucisse passent par de nombreuses étapes industrielles et additifs.",
  },
  "act:lesson-2-1-l1-y3": {
    question:
      "Laquelle de ces options est un exemple d'aliment TRANSFORMÉ (et non ultra-transformé) ?",
    options: [
      "Soda",
      "Fromage artisanal fait avec du lait, du sel et de la présure",
      "Chips en sachet",
      "Nouilles instantanées",
    ],
    explanation:
      "Les aliments transformés utilisent peu d'ingrédients et des techniques simples, comme le sel et la fermentation — contrairement aux ultra-transformés.",
  },
  "act:lesson-2-1-l1-y4": {
    prompt:
      "Pensez à ce que vous avez mangé hier : combien de repas avaient pour base des aliments bruts ou peu transformés ?",
  },
  "act:lesson-2-1-l2-c1": {
    title: "Pourquoi éviter les ultra-transformés",
    body: "Ils contiennent généralement beaucoup de sucre, de sodium et de graisses, peu de fibres et plusieurs additifs. Ils sont aussi **hyper-appétents** : faciles à manger en excès.",
    points: [
      "Formulations industrielles, pas des aliments entiers",
      "Liés à une consommation calorique totale plus élevée",
      "Ils remplacent de vrais repas",
    ],
  },
  "act:lesson-2-1-l2-1": {
    text: "Entraînons notre œil de détective : quel niveau de transformation a chaque aliment ?",
  },
  "act:lesson-2-1-l2-2": {
    prompt: "Associez l'aliment à sa classification :",
    pairs: [
      {
        left: "Épi de maïs",
        right: "Brut",
      },
      {
        left: "Semoule de maïs",
        right: "Peu transformé",
      },
      {
        left: "Maïs en conserve",
        right: "Transformé",
      },
      {
        left: "Snack au maïs",
        right: "Ultra-transformé",
      },
    ],
    explanation: "Plus il y a d'étapes industrielles et d'additifs, plus l'aliment est transformé.",
  },
  "act:lesson-2-1-l2-3": {
    question: "Lequel de ceux-ci est un aliment ultra-transformé ?",
    options: ["Yaourt nature", "Haricots cuits", "Soda", "Œuf dur"],
    explanation:
      "Les sodas sont des formules industrielles de sucre, d'arômes et d'additifs. Les autres sont de vrais aliments !",
  },
  "act:lesson-2-1-l2-4": {
    statement: "Congeler les fruits les transforme en ultra-transformés.",
    explanation: "Congeler n'est qu'une façon de conserver : le fruit reste peu transformé.",
  },
  "act:lesson-2-1-l2-5": {
    question: "Cochez les aliments bruts ou peu transformés :",
    options: ["Semoule de maïs", "Riz complet", "Lait", "Nuggets", "Nouilles instantanées"],
    explanation:
      "Les nuggets et les nouilles instantanées contiennent beaucoup d'additifs : ils sont ultra-transformés.",
  },
  "act:lesson-2-1-l2-x1": {
    prompt: "Classez selon la transformation :",
    groups: ["Brut ou peu transformé", "Ultra-transformé"],
    items: ["Banane", "Œuf", "Riz", "Soda", "Chips", "Nuggets"],
    explanation:
      "S'il a une longue liste d'additifs et se consomme prêt à manger, il est ultra-transformé.",
  },
  "act:lesson-2-1-l2-x2": {
    setup:
      "Au supermarché, Rafael hésite entre deux yaourts : l'un avec 4 ingrédients et l'autre avec 15, dont des colorants et des conservateurs.",
    question: "Quel choix suit le mieux la logique du Guide Alimentaire ?",
    options: [
      "Peu importe, ils sont pareils",
      "Le moins cher, toujours",
      "Celui à la liste la plus longue",
      "Celui à la liste la plus courte et reconnaissable",
    ],
    explanation:
      "Les listes courtes et reconnaissables indiquent généralement des aliments moins transformés et avec moins d'additifs.",
  },
  "act:lesson-2-1-l2-x3": {
    statement:
      "Un produit peut être considéré comme ultra-transformé même avec le mot « naturel » sur l'emballage.",
    explanation:
      "Des termes comme « naturel » sont des arguments marketing. C'est la liste des ingrédients qui dit la vérité.",
  },
  "act:lesson-2-1-l2-x4": {
    question: "Quelles caractéristiques indiquent généralement un ultra-transformé ?",
    options: [
      "Prêt à consommer ou à réchauffer",
      "Longue liste d'ingrédients méconnaissables",
      "Colorants et arômes artificiels",
      "Peu d'ingrédients de type maison",
    ],
    explanation: "Ce sont des indices classiques d'un produit très industrialisé.",
  },
  "act:lesson-2-1-l3-c1": {
    title: "Comment décider au quotidien",
    body: "Utilisez la règle **épluchez plus, déballez moins**. Comparez les étiquettes, cuisinez la base des repas et gardez les ultra-transformés pour des occasions précises.",
    points: [
      "Lisez la liste des ingrédients",
      "Gardez des collations brutes à portée de main",
      "Préférez les versions simples quand vous achetez du tout prêt",
    ],
  },
  "act:lesson-2-1-l3-1": {
    text: "Maintenant la règle d'or : « épluche plus, déballe moins ». Appliquons-la !",
  },
  "act:lesson-2-1-l3-2": {
    prompt: "Classez du MOINS au PLUS transformé :",
    items: ["Tomate fraîche", "Tomate pelée en conserve", "Ketchup", "Chips goût pizza"],
    explanation:
      "La tomate change peu en conserve. Le ketchup et les chips contiennent du sucre, des additifs et des arômes.",
  },
  "act:lesson-2-1-l3-3": {
    question: "Pour la collation de l'école, quel choix suit le « épluche plus, déballe moins » ?",
    options: [
      "Boisson lactée en brique",
      "Banane et une poignée de noix",
      "Chips en sachet",
      "Biscuit fourré",
    ],
    explanation:
      "La banane et les noix n'ont pratiquement aucune transformation et donnent de l'énergie plus longtemps.",
  },
  "act:lesson-2-1-l3-4": {
    statement:
      "Les ultra-transformés contiennent généralement beaucoup de sucre, de sodium, de graisses et d'additifs.",
    explanation:
      "Ils sont faits pour être très savoureux et se conserver longtemps, ce qui nous fait manger davantage.",
  },
  "act:lesson-2-1-l3-5": {
    question: "Quels sont les signes d'un ultra-transformé sur l'étiquette ?",
    options: [
      "Seulement « tomate » et « sel »",
      "Exhausteurs de goût",
      "Colorants et arômes",
      "Longue liste avec des ingrédients que vous n'avez pas chez vous",
    ],
    explanation:
      "Si la liste ressemble à une recette de laboratoire, c'est probablement un ultra-transformé.",
  },
  "act:lesson-2-1-l3-6": {
    question: "Quel est l'objectif le plus réaliste pour une alimentation saine ?",
    options: [
      "Ne manger que des aliments crus",
      "Privilégier les vrais aliments au quotidien, avec souplesse",
      "Ne plus jamais manger d'ultra-transformés",
      "Compter chaque ingrédient de chaque repas",
    ],
    explanation:
      "L'accent est mis sur la plupart du temps. La souplesse est ce qui rend l'habitude durable.",
  },
  "act:lesson-2-1-l3-x1": {
    sentence: "Une bonne règle pour choisir ses aliments : « épluche plus, ___ moins ».",
    options: ["cuisine", "déballe", "mâche", "achète"],
    explanation:
      "Les aliments qu'il faut éplucher ou préparer sont généralement moins transformés.",
  },
  "act:lesson-2-1-l3-x2": {
    prompt: "Classez ces aliments du MOINS au PLUS transformé :",
    items: ["Épi de maïs", "Maïs en conserve", "Farine de maïs", "Snack au maïs"],
    explanation: "Plus il y a d'étapes industrielles, plus l'aliment devient transformé.",
  },
  "act:lesson-2-1-l3-x3": {
    question: "En lisant l'étiquette d'un produit tout prêt, qu'est-ce qui est un bon signe ?",
    options: [
      "Absence de liste d'ingrédients",
      "Longue liste pleine de sigles",
      "Liste courte, avec des ingrédients que vous reconnaissez",
      "Couleurs vives sur l'emballage",
    ],
    explanation:
      "Les listes courtes et reconnaissables indiquent généralement un moindre degré de transformation.",
  },
  "stop:lesson-2-2": {
    title: "Lire la Liste des Ingrédients",
    summary: "Liste des ingrédients : découvrez ce qu'il y a vraiment dans le paquet.",
  },
  "act:lesson-2-2-l1-c1": {
    title: "L'ordre des ingrédients compte",
    body: "Selon la loi, les ingrédients sont listés de la **plus grande à la plus petite** quantité. Les trois premiers en disent déjà presque tout sur le produit.",
    points: [
      "Sucre en premier : produit fait principalement de sucre",
      "Farine complète en premier : plus de fibres",
    ],
    tip: "Une liste courte et reconnaissable est généralement un bon signe.",
  },
  "act:l2-2-1": {
    text: "La liste des ingrédients d'un produit cache un secret magique sur la façon dont elle est ordonnée. Tu veux le découvrir ?",
  },
  "act:l2-2-2": {
    question: "L'ordre des ingrédients sur l'étiquette d'un produit est organisé du...",
    options: [
      "...moins grand au plus grand.",
      "...plus sain au moins sain.",
      "...plus grand au plus petit (ce qui est en plus grande quantité apparaît en premier).",
      "...par ordre alphabétique.",
    ],
    explanation:
      "Si le premier ingrédient est le SUCRE, cela signifie que le produit est fait principalement de sucre !",
  },
  "act:l2-2-3": {
    statement:
      "Le sucre ajouté n'apparaît que sous le nom de « Sucre » sur les emballages. C'est facile à repérer.",
    explanation:
      "L'industrie utilise des déguisements : sirop de maïs, maltodextrine, sucre inverti, glucose... Garde tes yeux de détective ouverts !",
  },
  "act:l2-2-4": {
    question:
      "Entre un pain dont le premier ingrédient est « Farine de blé enrichie » et un autre dont c'est « Farine de blé complète », lequel contient le plus de fibres ?",
    options: [
      "Le premier (farine enrichie).",
      "Le second (farine complète).",
      "Les deux en ont la même quantité.",
      "Aucun n'a de fibres.",
    ],
    explanation:
      "Un vrai pain complet doit toujours avoir la farine complète comme premier ou deuxième ingrédient de la liste.",
  },
  "act:lesson-2-2-l1-x1": {
    question: "Où trouve-t-on la liste des ingrédients d'un produit ?",
    options: [
      "Sur le ticket de caisse",
      "Elle n'existe pas",
      "Au dos ou sur le côté de l'emballage",
      "Uniquement sur le site du supermarché",
    ],
    explanation:
      "Tout aliment emballé comporte une liste d'ingrédients. Ça vaut toujours la peine d'y jeter un œil !",
  },
  "act:lesson-2-2-l1-y1": {
    question: "Lesquels de ces noms sur l'étiquette indiquent du sucre ajouté ?",
    options: [
      "Sirop de maïs",
      "Maltodextrine",
      "Farine complète",
      "Sucre inverti",
      "Fibre d'avoine",
    ],
    explanation:
      "Le sirop de maïs, le sucre inverti et la maltodextrine sont des formes de sucre ajoutées par l'industrie.",
  },
  "act:lesson-2-2-l1-y2": {
    prompt: "Associez le terme de l'étiquette à ce qu'il signifie généralement :",
    pairs: [
      {
        left: "Glutamate monosodique",
        right: "Exhausteur de goût",
      },
      {
        left: "Colorant artificiel",
        right: "Couleur qui n'est pas naturelle à l'aliment",
      },
      {
        left: "Conservateur",
        right: "Prolonge la durée de conservation",
      },
    ],
    explanation: "Reconnaître ces termes aide à comprendre ce qu'il y a vraiment dans le produit.",
  },
  "act:lesson-2-2-l1-y3": {
    prompt: "Remettez dans l'ordre les étapes pour enquêter sur une étiquette :",
    items: [
      "Regardez la liste des ingrédients",
      "Identifiez les 3 premiers éléments",
      "Cherchez les noms déguisés en sucre",
      "Décidez en fonction de ce que vous avez trouvé",
    ],
    explanation:
      "Suivre un ordre simple rend l'habitude de lire les étiquettes plus rapide au quotidien.",
  },
  "act:lesson-2-2-l1-y4": {
    prompt:
      "Choisissez un produit industriel que vous avez chez vous. Que remarquez-vous en lisant sa liste d'ingrédients ?",
  },
  "act:lesson-2-2-l2-c1": {
    title: "Des noms qui cachent sucre et additifs",
    body: "L'industrie utilise des dizaines de noms. Apprendre à les reconnaître aide à mieux choisir.",
    points: [
      "Sucre : sirop de maïs, glucose, maltodextrine, sucre inverti",
      "Exhausteurs : glutamate monosodique",
      "Colorants et arômes artificiels",
    ],
  },
  "act:lesson-2-2-l2-1": {
    text: "Prêt à enquêter sur les étiquettes ? Pratiquons avec des noms déguisés !",
  },
  "act:lesson-2-2-l2-2": {
    prompt: "Associez le nom à ce qu'il signifie sur l'étiquette :",
    pairs: [
      {
        left: "Sirop de maïs",
        right: "Un type de sucre",
      },
      {
        left: "Maltodextrine",
        right: "Glucide à absorption rapide",
      },
      {
        left: "Farine complète",
        right: "Source de fibres",
      },
      {
        left: "Glutamate monosodique",
        right: "Exhausteur de goût",
      },
    ],
    explanation:
      "Le sucre et les additifs ont de nombreux noms. Les reconnaître, c'est gagner en pouvoir de choix.",
  },
  "act:lesson-2-2-l2-3": {
    question:
      "Une céréale de petit-déjeuner liste : « sucre, farine de blé, sirop de glucose... ». Qu'est-ce que cela indique ?",
    options: [
      "Qu'elle ne contient pas de sucre",
      "Qu'elle est riche en fibres",
      "Qu'elle est 100 % naturelle",
      "Qu'elle est faite principalement de sucre et de farine raffinée",
    ],
    explanation:
      "Les premiers ingrédients sont ceux qui sont présents en plus grande quantité. Le sucre en premier est une alerte !",
  },
  "act:lesson-2-2-l2-4": {
    statement: "Plus la liste des ingrédients est courte et simple, mieux c'est en général.",
    explanation:
      "Les listes courtes avec des ingrédients que vous reconnaissez indiquent généralement des aliments moins transformés.",
  },
  "act:lesson-2-2-l2-5": {
    question: "Quels noms indiquent du sucre ajouté ?",
    options: ["Sucre inverti", "Avoine", "Maltodextrine", "Farine complète", "Sirop de glucose"],
    explanation:
      "Les sirops, le sucre inverti et la maltodextrine sont des formes de sucre ajoutées par l'industrie.",
  },
  "act:lesson-2-2-l2-x1": {
    prompt: "Cet ingrédient indique-t-il du sucre ajouté ?",
    groups: ["Indique du sucre", "N'indique pas de sucre"],
    items: [
      "Sirop de glucose",
      "Maltodextrine",
      "Sucre inverti",
      "Farine complète",
      "Avoine",
      "Sel",
    ],
    explanation:
      "Les sirops, la maltodextrine et le sucre inverti sont des formes de sucre. L'avoine, la farine complète et le sel ne le sont pas.",
  },
  "act:lesson-2-2-l2-x2": {
    setup:
      "Deux boîtes de céréales : la première liste « avoine, raisins secs, cannelle ». La seconde liste « sucre, farine de blé, sirop de maïs, colorant caramel, arôme ».",
    question: "Quel est le meilleur choix, en regardant uniquement la liste des ingrédients ?",
    options: [
      "Les deux sont pareilles",
      "La première",
      "La seconde",
      "Cela dépend seulement du prix",
    ],
    explanation:
      "La première liste est courte et reconnaissable. La seconde met le sucre en avant et compte plusieurs additifs.",
  },
  "act:lesson-2-2-l2-x3": {
    question: "Le « colorant caramel » dans la liste des ingrédients est :",
    options: [
      "Un conservateur naturel",
      "Un type de sucre sain",
      "Un additif pour donner de la couleur, sans valeur nutritive",
      "Une source de fibres",
    ],
    explanation:
      "C'est un colorant artificiel utilisé uniquement pour donner de la couleur au produit, sans aucune valeur nutritionnelle.",
  },
  "act:lesson-2-2-l2-x4": {
    statement:
      "Un produit peut contenir du sucre même si le mot « sucre » n'apparaît pas dans la liste.",
    explanation:
      "Des noms comme sirop de maïs, dextrose et maltodextrine sont des formes de sucre déguisées.",
  },
  "act:lesson-2-2-l3-c1": {
    title: "Ce que l'avant de l'emballage ne dit pas",
    body: "Des termes comme « naturel », « fit », « zéro » et « complet » sont des **arguments marketing**. La vérité se trouve dans la liste des ingrédients et le tableau nutritionnel.",
    points: [
      "« Complet » exige de la farine complète comme ingrédient principal",
      "« Zéro sucre » peut contenir des édulcorants et d'autres additifs",
    ],
  },
  "act:lesson-2-2-l3-1": {
    text: "Maintenant, c'est l'épreuve du détective : comparer de vrais produits !",
  },
  "act:lesson-2-2-l3-2": {
    question:
      "Produit A : « avoine, banane, cannelle ». Produit B : « sucre, farine, graisse hydrogénée, arôme ». Lequel a la liste la plus simple ?",
    options: ["On ne peut pas savoir", "Le produit A", "Les deux sont pareils", "Le produit B"],
    explanation: "Le produit A a peu d'ingrédients reconnaissables. C'est un excellent signe !",
  },
  "act:lesson-2-2-l3-3": {
    statement: "Un produit « zéro sucre » est toujours un aliment sain.",
    explanation:
      "Zéro sucre peut contenir des édulcorants et d'autres additifs. Lisez la liste complète avant de décider.",
  },
  "act:lesson-2-2-l3-4": {
    question: "Quels sont les indices qu'un pain « complet » n'est peut-être pas si complet ?",
    options: [
      "Farine raffinée comme premier ingrédient",
      "La couleur foncée, seule",
      "Colorant caramel dans la liste",
      "Farine complète comme premier ingrédient",
    ],
    explanation:
      "La couleur foncée peut venir d'un colorant ! Le premier ingrédient doit être de la farine complète.",
  },
  "act:lesson-2-2-l3-5": {
    prompt: "Associez le terme à sa signification :",
    pairs: [
      {
        left: "Farine de blé enrichie",
        right: "Raffinée, avec peu de fibres",
      },
      {
        left: "Ingrédient listé en premier",
        right: "Ce qui existe en plus grande quantité",
      },
      {
        left: "Contient du lait et du soja",
        right: "Avertissement sur les allergènes",
      },
      {
        left: "Date de péremption",
        right: "Jusqu'à quand le fabricant garantit la qualité",
      },
    ],
    explanation:
      "Chaque partie de l'étiquette a une fonction. Savoir tout lire protège votre santé.",
  },
  "act:lesson-2-2-l3-6": {
    question:
      "Quelle est la première chose à regarder sur une étiquette pour savoir si le produit est un bon choix ?",
    options: [
      "Les premiers ingrédients de la liste",
      "Les dessins de la mascotte",
      "Les couleurs de l'emballage",
      "La mention « naturel » sur le devant",
    ],
    explanation: "Le marketing du devant peut tromper. La liste des ingrédients dit la vérité.",
  },
  "act:lesson-2-2-l3-x1": {
    sentence:
      "Le premier ingrédient de la liste est celui qui existe en ___ quantité dans le produit.",
    options: ["égale", "plus petite", "aucune", "plus grande"],
    explanation: "La liste suit l'ordre décroissant de quantité.",
  },
  "act:lesson-2-2-l3-x2": {
    question: "Lesquels de ceux-ci sont des noms alternatifs du sucre sur les étiquettes ?",
    options: ["Sirop de glucose-fructose", "Dextrose", "Mélasse", "Farine complète"],
    explanation:
      "Le dextrose, la mélasse et le sirop de glucose-fructose sont tous des formes de sucre.",
  },
  "act:lesson-2-2-l3-x3": {
    question:
      "Environ combien d'ingrédients différents contient un aliment ultra-transformé typique ?",
    unit: " ingrédients",
    explanation:
      "Les ultra-transformés ont souvent de longues listes, avec fréquemment 10 à 20 ingrédients et additifs.",
  },
  "stop:lesson-2-3": {
    title: "Le Tableau Nutritionnel",
    summary: "Tableau nutritionnel : portion, %VQ et ce qui vaut la peine d'être comparé.",
  },
  "act:lesson-2-3-l1-c1": {
    title: "Lire le tableau en 3 étapes",
    body: "Le tableau nutritionnel donne des informations standardisées. Le secret est de suivre un ordre.",
    points: [
      "1. Regardez la taille de la portion",
      "2. Regardez les calories et les nutriments par portion",
      "3. Comparez le %VQ (valeur quotidienne)",
    ],
    tip: "Beaucoup de paquets contiennent plusieurs portions. Tout manger, c'est multiplier les valeurs.",
  },
  "act:l2-3-1": {
    text: "Tu connais ce petit tableau noir et blanc au dos du paquet ? C'est ton meilleur ami pour faire des choix rapides.",
  },
  "act:l2-3-2": {
    question: "La première chose que vous DEVEZ regarder en lisant un tableau nutritionnel est :",
    options: [
      "La portion (pour quelle quantité ces chiffres sont valables).",
      "Les calories.",
      "La quantité de fer.",
      "S'il contient du gluten.",
    ],
    explanation:
      "Attention aux pièges ! Parfois un paquet semble avoir peu de calories, mais le tableau est calculé pour seulement 2 biscuits (alors que le paquet en contient 20).",
  },
  "act:l2-3-3": {
    statement:
      "Si un produit indique « 0 % de gras trans », cela veut dire qu'on peut manger des paquets entiers sans souci.",
    explanation:
      "Même sans gras trans, les produits peuvent être très riches en sucre ou en sodium. Regardez toujours l'ensemble.",
  },
  "act:lesson-2-3-l1-x1": {
    statement: "Le tableau nutritionnel indique les valeurs par portion du produit.",
    explanation: "Oui ! C'est pourquoi on regarde toujours d'abord la taille de la portion.",
  },
  "act:lesson-2-3-l1-x2": {
    question:
      "Le « sodium » qui apparaît dans le tableau nutritionnel est un composant de quel ingrédient ?",
    options: ["Des bons lipides", "Du sel", "Des fibres", "Des vitamines"],
    explanation:
      "Le sodium vient principalement du sel. En excès, il peut augmenter la tension artérielle.",
  },
  "act:lesson-2-3-l1-y1": {
    question:
      "Un paquet de biscuits contient 4 portions. Si le tableau indique 120 kcal par portion, combien de calories contient le paquet entier ?",
    unit: " kcal",
    explanation:
      "4 portions × 120 kcal = 480 kcal. Manger tout le paquet, c'est multiplier les valeurs du tableau par le nombre de portions.",
  },
  "act:lesson-2-3-l1-y2": {
    prompt: "Associez le terme du tableau à ce qu'il représente :",
    pairs: [
      {
        left: "Valeur énergétique",
        right: "Calories de la portion",
      },
      {
        left: "%VQ",
        right: "Pourcentage de la valeur quotidienne de référence",
      },
      {
        left: "Portion",
        right: "Quantité utilisée pour calculer les valeurs",
      },
    ],
    explanation:
      "Comprendre ces trois termes résout déjà une bonne partie de la lecture de n'importe quel tableau.",
  },
  "act:lesson-2-3-l1-y3": {
    question:
      "Avant de comparer deux produits grâce au tableau nutritionnel, il est important de :",
    options: [
      "Ignorer la portion et ne regarder que le total du paquet",
      "Choisir selon la couleur de l'emballage",
      "Comparer pour la même quantité, comme 100 g",
      "Regarder la taille de la portion de chacun",
    ],
    explanation:
      "Sans ajuster à la même quantité, la comparaison entre produits n'est pas équitable.",
  },
  "act:lesson-2-3-l1-y4": {
    prompt:
      "Prenez un aliment emballé près de vous (ou rappelez-en un). Combien de portions contient le paquet, et combien en mangez-vous d'habitude d'un coup ?",
  },
  "act:lesson-2-3-l2-c1": {
    title: "%VQ : élevé ou faible ?",
    body: "Le %VQ montre quelle part du besoin quotidien de référence (2 000 kcal) la portion fournit. L'Anvisa utilise une règle pratique :",
    points: ["**5 % ou moins** : faible", "**20 % ou plus** : élevé"],
    tip: "Pour les fibres, élevé est excellent. Pour le sodium, les sucres et les graisses saturées, élevé demande de l'attention.",
  },
  "act:lesson-2-3-l2-1": {
    text: "Tableau nutritionnel en main ! Pratiquons les calculs et les comparaisons.",
  },
  "act:lesson-2-3-l2-2": {
    prompt: "Associez chaque élément du tableau à ce qu'il signifie :",
    pairs: [
      {
        left: "Portion",
        right: "La quantité à laquelle les chiffres se rapportent",
      },
      {
        left: "Sodium",
        right: "Vient du sel ; en excès, il pèse sur la tension",
      },
      {
        left: "Sucres ajoutés",
        right: "Sucre ajouté par l'industrie",
      },
      {
        left: "Fibres alimentaires",
        right: "Aident la satiété et l'intestin",
      },
    ],
    explanation: "Regarder d'abord la portion évite les chiffres trompeurs.",
  },
  "act:lesson-2-3-l2-3": {
    question:
      "Un paquet contient 4 portions de 30 g. Si vous mangez tout, les valeurs du tableau doivent être multipliées par :",
    options: ["2", "1", "30", "4"],
    explanation:
      "Le tableau indique les valeurs d'UNE portion. Manger le paquet entier, c'est manger 4 portions.",
  },
  "act:lesson-2-3-l2-4": {
    statement: "Les valeurs quotidiennes (%VQ) reposent sur un régime de référence de 2 000 kcal.",
    explanation:
      "C'est une référence générale. Les besoins réels varient d'une personne à l'autre.",
  },
  "act:lesson-2-3-l2-5": {
    question: "Que faut-il regarder en comparant deux produits ?",
    options: ["La portion", "Le sodium", "La couleur de l'emballage", "Les sucres ajoutés"],
    explanation:
      "Comparez toujours pour la même quantité (par 100 g, par exemple) et regardez les sucres et le sodium.",
  },
  "act:lesson-2-3-l2-x1": {
    prompt: "Ce nutriment est-il plutôt à limiter ou à rechercher ?",
    groups: ["Limiter", "Rechercher"],
    items: [
      "Sodium",
      "Graisses saturées",
      "Sucres ajoutés",
      "Fibres alimentaires",
      "Protéines",
      "Vitamines et minéraux",
    ],
    explanation:
      "Il ne s'agit pas d'interdire : il s'agit d'équilibrer. Plus il y a de fibres et de micronutriments, mieux c'est.",
  },
  "act:lesson-2-3-l2-x2": {
    setup:
      "Deux barres de céréales, pour la même portion de 20 g : la barre A a 90 kcal et 3 g de sucre ; la barre B a 90 kcal et 12 g de sucre.",
    question: "Laquelle contient le moins de sucre ajouté, pour la même portion ?",
    options: ["Les deux en ont autant", "On ne peut pas savoir", "La barre A", "La barre B"],
    explanation:
      "Avec la même portion et les mêmes calories, la barre A a bien moins de sucre : un choix plus équilibré.",
  },
  "act:lesson-2-3-l2-x3": {
    question:
      "Si une étiquette indique « 2 portions par emballage » et que vous mangez tout l'emballage, vous devez :",
    options: [
      "Diviser les valeurs par 2",
      "Ignorer le tableau",
      "Multiplier les valeurs du tableau par 2",
      "N'utiliser que la valeur d'1 portion",
    ],
    explanation:
      "En mangeant les deux portions, les valeurs de calories et de nutriments doublent aussi.",
  },
  "act:lesson-2-3-l2-x4": {
    statement:
      "Deux portions de poids identique (100 g) de produits différents peuvent être comparées directement grâce au tableau.",
    explanation:
      "Quand la quantité est égale, la comparaison directe entre les nutriments est équitable.",
  },
  "act:lesson-2-3-l3-c1": {
    title: "Comparer les produits",
    body: "Comparez toujours pour la **même quantité** (100 g ou 100 ml) et regardez les nutriments qui comptent.",
    points: [
      "Limiter : sodium, sucres ajoutés, graisses saturées",
      "Rechercher : fibres, protéines, vitamines et minéraux",
    ],
  },
  "act:lesson-2-3-l3-1": {
    text: "Dernière étape du tableau ! Maintenant entrent en jeu le %VQ, les comparaisons et les décisions.",
  },
  "act:lesson-2-3-l3-2": {
    prompt: "Associez le %VQ à son interprétation :",
    pairs: [
      {
        left: "20 % VQ ou plus par portion",
        right: "Élevé",
      },
      {
        left: "5 % VQ ou moins par portion",
        right: "Faible",
      },
      {
        left: "Fibres avec %VQ élevé",
        right: "En général, excellent !",
      },
      {
        left: "Sodium avec %VQ élevé",
        right: "Attention à l'excès",
      },
    ],
    explanation:
      "Pour les nutriments que l'on veut en moindre quantité, un %VQ élevé est une alerte. Pour les fibres, il est le bienvenu.",
  },
  "act:lesson-2-3-l3-3": {
    question: "Un produit contient 30 % de la VQ en sodium par portion. Cela signifie :",
    options: [
      "Très peu de sel",
      "Qu'il ne contient pas de sel",
      "Presque un tiers de la limite quotidienne en une seule portion",
      "Qu'il est toujours sain",
    ],
    explanation:
      "Si vous mangez plus d'une portion, la valeur monte rapidement. Il vaut la peine de choisir des versions moins salées.",
  },
  "act:lesson-2-3-l3-4": {
    prompt: "Remettez dans l'ordre les étapes pour lire un tableau :",
    items: [
      "Voir la taille de la portion",
      "Calculer combien vous allez réellement manger",
      "Regarder sucres, sodium et graisses",
      "Comparer avec un autre produit similaire",
    ],
    explanation: "Commencer par la portion évite de comparer des choses différentes.",
  },
  "act:lesson-2-3-l3-5": {
    question: "Quels nutriments devons-nous en général limiter ?",
    options: ["Sodium", "Graisses saturées", "Fibres alimentaires", "Sucres ajoutés"],
    explanation:
      "Les fibres, en revanche, sont un nutriment à rechercher davantage, pas à limiter.",
  },
  "act:lesson-2-3-l3-6": {
    statement: "Un %VQ élevé de fibres est un problème.",
    explanation:
      "Les fibres sont des amies : elles aident la satiété et l'intestin. Plus il y en a, mieux c'est (avec de l'eau !).",
  },
  "act:lesson-2-3-l3-x1": {
    sentence: "Une valeur de 20 % VQ ou plus dans une portion est considérée comme ___.",
    options: ["élevée", "faible", "inexistante", "normale"],
    explanation: "Selon la règle pratique, 5 % ou moins est faible et 20 % ou plus est élevé.",
  },
  "act:lesson-2-3-l3-x2": {
    question: "En comparant les étiquettes, quels nutriments vaut-il la peine de LIMITER ?",
    options: ["Graisses saturées", "Sodium", "Fibres", "Sucres ajoutés"],
    explanation: "Les fibres sont le nutriment qu'il vaut mieux rechercher davantage, pas limiter.",
  },
  "act:lesson-2-3-l3-x3": {
    prompt: "Remettez dans l'ordre les étapes pour comparer deux produits similaires :",
    items: [
      "Vérifiez la portion de chacun",
      "Ajustez à la même quantité, comme 100 g",
      "Comparez sodium, sucre et graisses saturées",
      "Choisissez celui qui en a le moins et le plus de fibres",
    ],
    explanation: "Comparer sur la même base est ce qui rend le choix vraiment équitable.",
  },
  "unit:unit-3": {
    title: "Composer Votre Assiette",
    description:
      "De la théorie à la pratique ! Découvrez comment composer des assiettes savoureuses et équilibrées au quotidien.",
  },
  "stop:lesson-3-1": {
    title: "L'Assiette Équilibrée",
    summary: "L'assiette équilibrée : des proportions simples pour le déjeuner et le dîner.",
  },
  "act:lesson-3-1-l1-c1": {
    title: "L'assiette équilibrée",
    body: "Une référence visuelle simple : **la moitié** de l'assiette de légumes et de salades, **un quart** de protéines et **un quart** de glucides.",
    points: [
      "La moitié : légumes, verdures et salades",
      "Un quart : haricots, œuf, viandes, poisson",
      "Un quart : riz, pomme de terre, manioc, pâtes",
    ],
    tip: "C'est une référence flexible, pas une règle rigide.",
  },
  "act:l3-1-1": {
    text: "La méthode de l'« Assiette Équilibrée » est une règle visuelle simple pour le déjeuner et le dîner qui se passe de balance.",
  },
  "act:l3-1-2": {
    question:
      "Dans le modèle idéal de l'assiette équilibrée, LA MOITIÉ (50 %) de l'assiette devrait être remplie avec :",
    options: [
      "Des glucides (riz, pâtes, pomme de terre)",
      "Des protéines (viandes, œufs)",
      "Des légumes et salades (verdures, légumes frais)",
      "Du dessert",
    ],
    explanation:
      "C'est ça ! Les légumes remplissent l'assiette de vitamines et de fibres, et donnent du volume et de la satiété avec peu de calories.",
  },
  "act:l3-1-3": {
    statement:
      "On ne peut pas mettre du Riz et des Pommes de terre dans la même assiette, car ce sont des glucides qui se disputent la place.",
    explanation:
      "Si, on peut ! L'important, c'est la quantité. Si vous utilisez deux glucides, réduisez un peu chacun pour qu'ils tiennent dans le quota de 25 % (un quart) de l'assiette.",
  },
  "act:lesson-3-1-l1-x1": {
    statement: "Une assiette très colorée est généralement plus nutritive.",
    explanation:
      "Les couleurs naturelles indiquent des vitamines et des minéraux différents. Plus il y a de couleurs, mieux c'est !",
  },
  "act:lesson-3-1-l1-x2": {
    question: "Dans l'assiette équilibrée, quelle place occupent les protéines ?",
    options: ["La moitié", "Aucune", "Environ un quart", "Toute l'assiette"],
    explanation: "Un quart de protéines, un quart de glucides et la moitié de légumes.",
  },
  "act:lesson-3-1-l1-y1": {
    question:
      "Lesquels de ces aliments entrent dans la moitié « légumes » de l'assiette équilibrée ?",
    options: ["Frites", "Chou vert sauté", "Salade de tomate et concombre", "Riz"],
    explanation:
      "Le chou vert et la salade de tomate et concombre sont des légumes. Le riz et les frites sont des glucides.",
  },
  "act:lesson-3-1-l1-y2": {
    prompt: "Associez l'aliment à la partie de l'assiette équilibrée qu'il occupe :",
    pairs: [
      {
        left: "Haricots",
        right: "Protéines",
      },
      {
        left: "Purée de pommes de terre",
        right: "Glucides",
      },
      {
        left: "Courgette grillée",
        right: "Légumes",
      },
    ],
    explanation: "Savoir où chaque aliment se place aide à composer l'assiette sans rien peser.",
  },
  "act:lesson-3-1-l1-y3": {
    prompt: "Remettez dans l'ordre pour composer une assiette équilibrée dans un self-service :",
    items: [
      "Commencez par remplir la moitié de l'assiette de salades et de légumes",
      "Ajoutez un quart de protéines",
      "Complétez un quart avec des glucides",
      "Assaisonnez avec de l'huile d'olive et des herbes",
    ],
    explanation: "Commencer par les légumes garantit qu'ils occupent la moitié de l'assiette.",
  },
  "act:lesson-3-1-l1-y4": {
    prompt:
      "Pensez à votre déjeuner d'aujourd'hui ou d'hier : se rapprochait-il de l'assiette équilibrée ? Qu'est-ce qui manquait ou était en trop ?",
  },
  "act:lesson-3-1-l2-c1": {
    title: "Choisir dans chaque partie",
    body: "Variez au fil de la semaine pour couvrir tous les nutriments.",
    points: [
      "Légumes : variez les couleurs",
      "Protéines : alternez haricots, œuf, poisson et viandes",
      "Glucides : préférez les complets et les racines",
    ],
  },
  "act:lesson-3-1-l2-1": {
    text: "Composons de vraies assiettes ! Où se place chaque groupe d'aliments ?",
  },
  "act:lesson-3-1-l2-2": {
    prompt: "Associez la partie de l'assiette à ce qui doit l'occuper :",
    pairs: [
      {
        left: "La moitié de l'assiette",
        right: "Légumes et salades",
      },
      {
        left: "Un quart : énergie",
        right: "Glucides (riz, pomme de terre)",
      },
      {
        left: "Un quart : construction",
        right: "Protéines (haricots, œuf, viande)",
      },
    ],
    explanation: "C'est une règle visuelle simple : sans balance et sans compter les calories.",
  },
  "act:lesson-3-1-l2-3": {
    question: "Quelle assiette est la plus équilibrée ?",
    options: [
      "Juste des pâtes avec une sauce toute prête",
      "Juste du rôti de bœuf",
      "Frites et soda",
      "Salade colorée, riz, haricots et œuf",
    ],
    explanation: "Légumes, glucides et protéines ensemble : une assiette complète et économique.",
  },
  "act:lesson-3-1-l2-4": {
    statement: "Les haricots sont une bonne source de protéines et de fibres.",
    explanation:
      "En plus des protéines et des fibres, les haricots apportent du fer. Ils vont parfaitement avec le riz !",
  },
  "act:lesson-3-1-l2-5": {
    question: "Cochez les aliments qui peuvent occuper le quart des protéines :",
    options: ["Œuf", "Poulet", "Haricots", "Pâtes", "Poisson"],
    explanation:
      "Les pâtes sont une source de glucides, ce qui est aussi très bien, mais elles occupent un autre quart de l'assiette.",
  },
  "act:lesson-3-1-l2-x1": {
    prompt: "Dans quelle partie de l'assiette équilibrée chaque aliment se place-t-il ?",
    groups: ["La moitié : légumes", "Un quart : protéines", "Un quart : glucides"],
    items: ["Brocoli", "Laitue", "Œuf", "Poulet", "Riz", "Pomme de terre"],
    explanation:
      "Les légumes occupent la moitié ; les protéines et les glucides se partagent l'autre moitié.",
  },
  "act:lesson-3-1-l2-x2": {
    setup:
      "Au restaurant au poids, l'assiette de Júlia s'est retrouvée avec du riz, des pâtes et des pommes de terre, sans aucune salade.",
    question: "Que pourrait-elle ajuster pour se rapprocher de l'assiette équilibrée ?",
    options: [
      "Retirer toutes les protéines",
      "Remplacer une partie des glucides par des salades et des légumes",
      "C'est très bien comme ça",
      "Ajouter un glucide de plus",
    ],
    explanation:
      "Réduire un peu les glucides (qui sont en triple) et inclure des légumes rend l'assiette plus équilibrée.",
  },
  "act:lesson-3-1-l2-x3": {
    question:
      "Dans l'assiette équilibrée, les glucides comme le riz, la pomme de terre et les pâtes occupent généralement :",
    options: [
      "Toute l'assiette",
      "Un quart de l'assiette",
      "La moitié de l'assiette",
      "Seulement le dessert",
    ],
    explanation:
      "Un quart pour les glucides, un quart pour les protéines et la moitié pour les légumes.",
  },
  "act:lesson-3-1-l2-x4": {
    statement: "Il faut exclure complètement les glucides pour avoir une assiette équilibrée.",
    explanation:
      "Les glucides font partie de l'assiette équilibrée, ils ne doivent simplement pas occuper toute la place.",
  },
  "act:lesson-3-1-l3-c1": {
    title: "S'adapter à la vraie vie",
    body: "Gamelle, restaurant ou collation : la logique est la même. S'il a manqué des légumes à un repas, compensez au suivant, **sans culpabilité**.",
    points: [
      "Au self-service, commencez par les salades",
      "Pour les collations, incluez un fruit ou des noix",
    ],
  },
  "act:lesson-3-1-l3-1": {
    text: "De vraies situations d'assiette ! Utilisons ce que tu sais déjà.",
  },
  "act:lesson-3-1-l3-2": {
    question:
      "Au restaurant au poids, vous avez déjà mis du riz et des pommes de terre. Que faire du reste de l'assiette ?",
    options: [
      "Laisser l'assiette à moitié vide",
      "Réduire un peu chacun et compléter avec beaucoup de salade et une protéine",
      "Ajouter seulement plus de pommes de terre",
      "Terminer avec un dessert",
    ],
    explanation:
      "Les légumes remplissent la moitié, et la protéine complète. Deux glucides tiennent s'ils se partagent un quart.",
  },
  "act:lesson-3-1-l3-3": {
    prompt: "Remettez dans l'ordre la composition de l'assiette sans rien oublier :",
    items: [
      "Commencez par les légumes et les salades",
      "Ajoutez la source de protéines",
      "Complétez avec les glucides",
      "Terminez avec un filet d'huile d'olive et des assaisonnements",
    ],
    explanation: "Commencer par les légumes garantit qu'ils occupent la moitié de l'assiette.",
  },
  "act:lesson-3-1-l3-4": {
    statement: "Dans l'assiette équilibrée, un dessert sucré tous les jours est interdit.",
    explanation:
      "Rien n'est interdit ! L'équilibre vaut pour toute la semaine. Un fruit en dessert est une excellente idée.",
  },
  "act:lesson-3-1-l3-5": {
    question: "Comment rendre l'assiette plus colorée et nutritive ?",
    options: [
      "Uniquement des aliments blancs",
      "Betterave",
      "Carotte râpée",
      "Feuilles vert foncé",
    ],
    explanation:
      "Chaque couleur naturelle apporte des nutriments différents. Plus il y a de couleurs, mieux c'est !",
  },
  "act:lesson-3-1-l3-6": {
    prompt: "Associez le repas à la suggestion de composition :",
    pairs: [
      {
        left: "Déjeuner",
        right: "Salade, riz, haricots et œuf",
      },
      {
        left: "Collation",
        right: "Fruit avec yaourt nature",
      },
      {
        left: "Dîner léger",
        right: "Soupe de légumes avec du poulet effiloché",
      },
      {
        left: "Petit-déjeuner",
        right: "Pain complet, œuf et fruit",
      },
    ],
    explanation:
      "Composer des repas, c'est de la créativité ! Combinez légumes, protéines et une source d'énergie.",
  },
  "act:lesson-3-1-l3-x1": {
    sentence:
      "Dans l'assiette équilibrée, la ___ de l'assiette doit être remplie de légumes et de salades.",
    options: ["cinquième partie", "dixième partie", "totalité", "moitié"],
    explanation:
      "La moitié de l'assiette en légumes apporte volume, fibres et vitamines avec peu de calories.",
  },
  "act:lesson-3-1-l3-x2": {
    question:
      "Quelles sont de bonnes sources de protéines pour le quart de l'assiette équilibrée ?",
    options: ["Haricots", "Pomme de terre", "Poulet", "Œuf"],
    explanation:
      "Les haricots, l'œuf et le poulet sont des protéines. La pomme de terre est une source de glucides.",
  },
  "act:lesson-3-1-l3-x3": {
    question:
      "Combien de grammes de haricots cuits (environ une louche moyenne) une personne se sert-elle généralement au cours d'un repas ?",
    unit: " g",
    explanation:
      "Une louche moyenne de haricots cuits pèse généralement entre 50 et 110 g, autour de 80 g en moyenne.",
  },
  "stop:lesson-3-2": {
    title: "Le Pouvoir des Assaisonnements",
    summary:
      "Assaisonnements naturels : beaucoup de goût avec peu de sel et sans cubes de bouillon.",
  },
  "act:lesson-3-2-l1-c1": {
    title: "De la saveur sans excès de sel",
    body: "Une forte consommation de sodium est associée à l'hypertension. Les herbes, les épices, l'ail, l'oignon et les agrumes rehaussent le goût et **réduisent le besoin de sel**.",
    points: [
      "Préférez les assaisonnements naturels aux cubes de bouillon et aux assaisonnements tout prêts",
      "Le gros sel contient autant de sodium que le sel raffiné",
    ],
  },
  "act:l3-2-1": {
    text: "Manger sainement ne veut pas dire manger du poulet sec sans sel. La cuisine est magique et les assaisonnements naturels sauvent le goût !",
  },
  "act:l3-2-2": {
    question:
      "Laquelle de ces options est le meilleur choix pour donner du goût aux repas de tous les jours tout en préservant sa santé ?",
    options: [
      "Cubes de bouillon tout prêts goût bœuf/poulet (très transformés).",
      "Assaisonnement maison d'ail, d'oignon et d'herbes fraîches/séchées (origan, basilic, curcuma).",
      "Beaucoup de sel raffiné pur.",
      "Margarine en grande quantité.",
    ],
    explanation:
      "C'est ça ! Les assaisonnements naturels comme l'ail, l'oignon, le paprika, le curcuma et l'origan apportent beaucoup de goût et sont en plus anti-inflammatoires.",
  },
  "act:l3-2-3": {
    statement:
      "Ajouter du citron sur les légumes verts foncés (comme les épinards ou le chou vert) et sur les haricots augmente l'absorption du fer.",
    explanation:
      "Tout à fait vrai ! La vitamine C du citron aide le corps à mieux capter le fer d'origine végétale (fer non héminique).",
  },
  "act:lesson-3-2-l1-x1": {
    statement:
      "L'ail et l'oignon sont des assaisonnements naturels très utilisés dans la cuisine brésilienne.",
    explanation:
      "Ils sont la base de nombreux sautés et donnent du goût sans avoir besoin de beaucoup de sel.",
  },
  "act:lesson-3-2-l1-x2": {
    question: "Quel assaisonnement donne une couleur dorée aux plats ?",
    options: ["Sel raffiné", "Curcuma", "Sucre", "Vinaigre"],
    explanation:
      "Le curcuma a une couleur dorée et une saveur douce, excellent dans le riz, les œufs et les légumes.",
  },
  "act:lesson-3-2-l1-y1": {
    prompt: "Associez l'assaisonnement au plat qui lui convient bien :",
    pairs: [
      {
        left: "Basilic",
        right: "Sauce tomate",
      },
      {
        left: "Cumin",
        right: "Haricots et viandes",
      },
      {
        left: "Cannelle",
        right: "Fruits et desserts",
      },
      {
        left: "Coriandre",
        right: "Poissons et bouillons",
      },
    ],
    explanation:
      "Connaître ces associations classiques facilite la variation des saveurs des repas.",
  },
  "act:lesson-3-2-l1-y2": {
    question: "Lesquels de ceux-ci sont des assaisonnements NATURELS (non industriels) ?",
    options: [
      "Oignon",
      "Origan",
      "Assaisonnement tout prêt avec exhausteur",
      "Cube de bouillon",
      "Ail",
    ],
    explanation:
      "L'ail, l'oignon et l'origan sont des assaisonnements naturels. Les autres sont industriels et concentrent du sodium.",
  },
  "act:lesson-3-2-l1-y3": {
    prompt: "Remettez dans l'ordre la préparation d'un sauté savoureux :",
    items: [
      "Faites chauffer l'huile d'olive",
      "Faites dorer l'oignon",
      "Ajoutez l'ail en dernier",
      "Assaisonnez avec des herbes à la fin",
    ],
    explanation:
      "L'ail brûle vite : il entre après l'oignon. Les herbes délicates viennent en dernier.",
  },
  "act:lesson-3-2-l1-y4": {
    prompt:
      "Quel assaisonnement utilisez-vous le moins souvent chez vous et pourriez-vous essayer cette semaine ?",
  },
  "act:lesson-3-2-l2-c1": {
    title: "Guide rapide des herbes et épices",
    body: "Chaque assaisonnement se marie mieux avec certains plats.",
    points: [
      "Basilic : sauces tomate et pâtes",
      "Coriandre : poissons, bouillons et salades",
      "Romarin : rôtis et pommes de terre",
      "Curcuma : riz, œufs et légumes",
    ],
  },
  "act:lesson-3-2-l2-1": {
    text: "Les assaisonnements naturels font de la magie ! Apprenons à mieux les connaître.",
  },
  "act:lesson-3-2-l2-2": {
    prompt: "Associez l'assaisonnement à ce qu'il fait de mieux :",
    pairs: [
      {
        left: "Ail",
        right: "Saveur marquée pour les sautés",
      },
      {
        left: "Curcuma",
        right: "Couleur dorée et saveur terreuse",
      },
      {
        left: "Citron",
        right: "Acidité qui rehausse le goût",
      },
      {
        left: "Origan",
        right: "Herbe séchée excellente dans les sauces",
      },
    ],
    explanation:
      "Les herbes, les épices et les agrumes donnent du goût sans avoir besoin de beaucoup de sel.",
  },
  "act:lesson-3-2-l2-3": {
    question: "Pour réduire le sel sans perdre de goût, que faut-il utiliser ?",
    options: [
      "Du gros sel à la place du sel fin",
      "De la sauce toute prête",
      "Des herbes, du citron et de l'ail",
      "Plus de cubes de bouillon",
    ],
    explanation:
      "Les herbes et les agrumes donnent largement du goût. Le gros sel contient le même sodium que le sel fin !",
  },
  "act:lesson-3-2-l2-4": {
    statement: "Le sel rose ou de l'Himalaya ne contient pas de sodium.",
    explanation:
      "Tout sel est fait de sodium et de chlore. Le type change la couleur et le cristal, pas le sodium.",
  },
  "act:lesson-3-2-l2-5": {
    question: "Cochez les assaisonnements naturels :",
    options: ["Cumin", "Exhausteur de goût", "Ciboulette", "Cube de bouillon", "Persil"],
    explanation:
      "Les cubes de bouillon et les exhausteurs sont industriels et concentrés en sodium.",
  },
  "act:lesson-3-2-l2-x1": {
    prompt: "Assaisonnement naturel ou industriel ?",
    groups: ["Assaisonnement naturel", "Industriel"],
    items: [
      "Ail",
      "Persil",
      "Cumin",
      "Cube de bouillon",
      "Assaisonnement tout prêt avec exhausteur",
      "Mélange d'épices artificiel",
    ],
    explanation:
      "Les industriels concentrent du sodium et des additifs. Les naturels apportent du goût et des composés bénéfiques.",
  },
  "act:lesson-3-2-l2-x2": {
    setup:
      "Pedro trouve la nourriture fade et ajoute toujours beaucoup de sel ou utilise des cubes de bouillon.",
    question:
      "Qu'est-ce qui pourrait aider Pedro à avoir plus de goût sans exagérer sur le sodium ?",
    options: [
      "Manger sans aucun assaisonnement",
      "Ajouter un cube de bouillon de plus",
      "Utiliser des herbes, de l'ail, de l'oignon et du citron",
      "Augmenter encore le sel",
    ],
    explanation:
      "Les herbes, l'ail, l'oignon et le citron donnent des couches de saveur sans dépendre d'autant de sodium.",
  },
  "act:lesson-3-2-l2-x3": {
    question: "Lequel de ceux-ci aide à réduire le sel sans perdre de goût ?",
    options: [
      "Plus de gros sel",
      "Citron et herbes fraîches",
      "Excès de sauce soja",
      "Bouillon industriel",
    ],
    explanation: "Le citron et les herbes fraîches rehaussent le goût sans augmenter le sodium.",
  },
  "act:lesson-3-2-l2-x4": {
    statement:
      "Le sel rose de l'Himalaya contient bien moins de sodium que le sel ordinaire, à quantités égales.",
    explanation:
      "Tout sel est fait de sodium et de chlore. La couleur change, mais la quantité de sodium est pratiquement la même.",
  },
  "act:lesson-3-2-l3-c1": {
    title: "Construire des couches de saveur",
    body: "Faire revenir, torréfier les épices, mariner et finir avec de l'**acidité** (citron ou vinaigre) donnent de la profondeur au plat.",
    points: [
      "Faites revenir l'oignon avant l'ail",
      "Les herbes délicates entrent à la fin",
      "Une pointe d'acidité rehausse le goût",
    ],
  },
  "act:lesson-3-2-l3-1": {
    text: "Mission de chef ! Appliquons les assaisonnements dans de vraies situations.",
  },
  "act:lesson-3-2-l3-2": {
    question:
      "Le poulet grillé est fade. Quelle combinaison améliore le goût sans exagérer sur le sel ?",
    options: [
      "Double dose de sel",
      "Ail, citron, paprika et herbes",
      "Sauce en sachet",
      "Un cube de bouillon par portion",
    ],
    explanation:
      "Mariner avec de l'ail, du citron et des herbes donne un goût profond et rend en plus la viande plus tendre.",
  },
  "act:lesson-3-2-l3-3": {
    statement:
      "Les herbes fraîches délicates, comme le basilic, doivent être ajoutées à la fin de la cuisson.",
    explanation:
      "Une chaleur prolongée éteint l'arôme des herbes délicates. Ajoutez-les à la fin ou au moment de servir.",
  },
  "act:lesson-3-2-l3-4": {
    prompt: "Remettez dans l'ordre un sauté de base :",
    items: [
      "Faites chauffer un filet d'huile d'olive",
      "Faites dorer l'oignon",
      "Ajoutez l'ail en dernier",
      "Ajoutez les légumes ou les haricots",
    ],
    explanation:
      "L'ail brûle vite et devient amer. Il entre après l'oignon, quand le sauté est déjà à point.",
  },
  "act:lesson-3-2-l3-5": {
    question: "Quels sont les avantages des assaisonnements naturels ?",
    options: [
      "Moins de sodium dans l'assiette",
      "Composés antioxydants",
      "Additifs artificiels",
      "Plus de goût et d'arôme",
    ],
    explanation:
      "Les assaisonnements naturels apportent du goût et aussi des composés qui font du bien à la santé.",
  },
  "act:lesson-3-2-l3-6": {
    prompt: "Associez l'herbe au plat qui lui convient :",
    pairs: [
      {
        left: "Basilic",
        right: "Pâtes et sauces tomate",
      },
      {
        left: "Coriandre",
        right: "Poissons, bouillons et salades",
      },
      {
        left: "Menthe",
        right: "Jus, salades et yaourts",
      },
      {
        left: "Romarin",
        right: "Rôtis et pommes de terre",
      },
    ],
    explanation:
      "Chaque herbe a son mariage parfait. Ça vaut la peine d'essayer de nouvelles combinaisons !",
  },
  "act:lesson-3-2-l3-x1": {
    sentence:
      "Les herbes fraîches délicates, comme le basilic, doivent être ajoutées à la ___ de la préparation.",
    options: ["première minute", "fin", "moitié", "début"],
    explanation: "Une chaleur prolongée éteint l'arôme des herbes délicates.",
  },
  "act:lesson-3-2-l3-x2": {
    question: "Lesquels de ceux-ci apportent du goût avec peu de sodium ?",
    options: ["Herbes fraîches", "Cube de bouillon", "Ail", "Citron"],
    explanation:
      "Le citron, l'ail et les herbes fraîches donnent du goût sans dépendre de sodium supplémentaire.",
  },
  "act:lesson-3-2-l3-x3": {
    question:
      "Environ combien de sodium (en mg) l'Organisation mondiale de la santé recommande-t-elle de consommer, au maximum, par jour ?",
    unit: " mg",
    explanation:
      "La recommandation de l'OMS est de jusqu'à 2 g de sodium par jour, l'équivalent d'environ 5 g de sel.",
  },
  "stop:lesson-3-3": {
    title: "Planification Simplifiée",
    summary: "Planification sans drame : courses, gamelles et moins de gaspillage.",
  },
  "act:lesson-3-3-l1-c1": {
    title: "Planifier réduit les décisions fatiguées",
    body: "Décider quoi manger quand on a faim mène à des choix rapides et moins nutritifs. Un menu **flexible** et une liste de courses font gagner du temps et de l'argent.",
    points: [
      "Définissez 3 ou 4 repas de base pour la semaine",
      "Notez ce que vous avez déjà chez vous avant d'acheter",
    ],
  },
  "act:l3-3-1": {
    text: "Attendre d'avoir très faim pour décider quoi manger, c'est la recette assurée pour finir par commander du fast-food.",
  },
  "act:l3-3-2": {
    question:
      "Quelle habitude de planification simple évite que les légumes se gâtent dans le bac du réfrigérateur ?",
    options: [
      "Les cacher au fond du bac et ne pas regarder.",
      "Laver et sécher les salades le week-end, en les rangeant dans des boîtes pour les prendre facilement pendant la semaine.",
      "Laver chaque feuille seulement au moment exact de manger, tous les jours.",
      "Acheter le triple du nécessaire au marché.",
    ],
    explanation:
      "Parfait ! La tactique de laver les feuilles et de couper les légumes à l'avance réduit la flemme les jours de fatigue et garantit la salade sur la table.",
  },
  "act:lesson-3-3-l1-x1": {
    statement: "Faire une liste avant d'aller au marché aide à n'acheter que le nécessaire.",
    explanation:
      "La liste évite les achats impulsifs, économise de l'argent et réduit le gaspillage.",
  },
  "act:lesson-3-3-l1-x2": {
    question: "Qu'est-ce qu'une gamelle planifiée ?",
    options: [
      "Un repas préparé à l'avance",
      "Un aliment industriel",
      "Un type de dessert",
      "Un ustensile coûteux",
    ],
    explanation:
      "Les gamelles toutes prêtes facilitent le maintien d'une bonne alimentation, même les jours chargés.",
  },
  "act:lesson-3-3-l1-x3": {
    statement: "Congeler des portions de nourriture aide à éviter le gaspillage.",
    explanation: "Congeler en portions permet de manger au bon moment, sans rien perdre.",
  },
  "act:lesson-3-3-l1-y1": {
    question: "Quelles habitudes aident à planifier les repas de la semaine ?",
    options: [
      "Faire les courses sans liste",
      "Congeler des portions prêtes",
      "Faire une liste de courses",
      "Cuisiner en lot le week-end",
    ],
    explanation:
      "La liste, la cuisine en lot et la congélation sont la base d'une planification qui fonctionne.",
  },
  "act:lesson-3-3-l1-y2": {
    prompt: "Associez l'aliment à la meilleure façon de le conserver :",
    pairs: [
      {
        left: "Haricots cuits",
        right: "Congeler en portions",
      },
      {
        left: "Feuilles lavées",
        right: "Réfrigérateur, dans une boîte",
      },
      {
        left: "Fruits mûrs",
        right: "Consommer vite ou congeler",
      },
    ],
    explanation: "Chaque aliment a un mode de conservation qui préserve au mieux sa qualité.",
  },
  "act:lesson-3-3-l1-y3": {
    prompt: "Remettez dans l'ordre un dimanche d'organisation des repas :",
    items: [
      "Planifiez le menu de la semaine",
      "Faites la liste de courses",
      "Cuisinez les bases, comme le riz, les haricots et la protéine",
      "Rangez dans des boîtes ou congelez en portions",
    ],
    explanation: "Planifier avant d'acheter évite les achats impulsifs et le gaspillage.",
  },
  "act:lesson-3-3-l1-y4": {
    prompt:
      "Comment se passe votre organisation des repas pour cette semaine ? Qu'est-ce qui pourrait faciliter les jours les plus chargés ?",
  },
  "act:lesson-3-3-l2-c1": {
    title: "Cuisiner en lot",
    body: "Préparer des bases (haricots, riz, légumes, protéines) en une seule fois et les **congeler en portions** fait gagner du temps les jours chargés.",
    points: [
      "Congelez en portions individuelles",
      "Étiquetez avec le nom et la date",
      "Décongelez au réfrigérateur",
    ],
  },
  "act:lesson-3-3-l2-1": {
    text: "Planifier, c'est prendre soin de toi dans le futur ! Entraînons ces stratégies.",
  },
  "act:lesson-3-3-l2-2": {
    question: "Quel est le meilleur moment pour faire la liste de courses ?",
    options: [
      "Après être passé en caisse",
      "Déjà dans le magasin, avec faim",
      "Jamais, acheter sur un coup de tête est mieux",
      "Avant d'aller au marché, en regardant le réfrigérateur et sans avoir faim",
    ],
    explanation: "Une liste faite calmement évite les achats impulsifs et le gaspillage.",
  },
  "act:lesson-3-3-l2-3": {
    statement: "Aller au marché avec très faim aide à faire de bons choix.",
    explanation:
      "Avec la faim, tout paraît plus appétissant et le chariot se remplit d'ultra-transformés. Allez-y bien nourri !",
  },
  "act:lesson-3-3-l2-4": {
    prompt: "Associez la stratégie au bénéfice :",
    pairs: [
      {
        left: "Liste de courses",
        right: "Évite les achats impulsifs",
      },
      {
        left: "Congeler des portions",
        right: "Évite le gaspillage",
      },
      {
        left: "Cuisiner en lot",
        right: "Fait gagner du temps dans la semaine",
      },
      {
        left: "Laver les feuilles le dimanche",
        right: "Salade prête en quelques minutes",
      },
    ],
    explanation: "De petites préparations réduisent la fatigue les jours chargés.",
  },
  "act:lesson-3-3-l2-5": {
    question: "Cochez les habitudes de planification :",
    options: [
      "Congeler des portions",
      "Faire les courses sans liste",
      "Cuisiner une base de haricots pour la semaine",
      "Laver les feuilles le dimanche",
    ],
    explanation: "Des haricots tout prêts au congélateur sauvent n'importe quel repas pressé.",
  },
  "act:lesson-3-3-l2-x1": {
    prompt: "Comment mieux conserver chaque élément ?",
    groups: ["Garder au réfrigérateur", "Congeler en portions"],
    items: [
      "Feuilles lavées et séchées",
      "Légumes coupés",
      "Haricots cuits",
      "Sauce maison",
      "Soupe toute prête",
      "Poulet cuit en portions",
    ],
    explanation:
      "Congeler préserve les préparations toutes prêtes pendant des semaines. Les feuilles et légumes crus se conservent mieux au réfrigérateur.",
  },
  "act:lesson-3-3-l2-x2": {
    setup:
      "Camila rentre fatiguée du travail tous les jours et finit presque toujours par commander une livraison.",
    question: "Quel changement aiderait le plus Camila à cuisiner davantage à la maison ?",
    options: [
      "Cuisiner en lot le week-end et congeler des portions",
      "Renoncer à cuisiner à la maison",
      "Essayer de tout cuisiner de zéro chaque jour après le travail",
      "Faire les courses sans planifier",
    ],
    explanation:
      "Préparer des bases le week-end et congeler des portions résout précisément le problème de la fatigue en semaine.",
  },
  "act:lesson-3-3-l2-x3": {
    question:
      "Quel est l'avantage de cuire des haricots et du riz en plus grande quantité et de les congeler en portions ?",
    options: [
      "Ça se gâte plus vite",
      "Ça coûte toujours plus cher",
      "Ça fait gagner du temps les jours chargés",
      "Ça n'a plus de goût",
    ],
    explanation:
      "Congeler en portions permet d'avoir rapidement un repas prêt les jours où l'on n'a pas le temps de cuisiner.",
  },
  "act:lesson-3-3-l2-x4": {
    statement: "Les aliments de saison sont généralement moins chers et plus savoureux.",
    explanation:
      "En pleine saison, l'offre est plus grande, le prix baisse et l'aliment mûrit au bon moment.",
  },
  "act:lesson-3-3-l3-c1": {
    title: "Zéro gaspillage",
    body: "Réutiliser les tiges, les épluchures et les restes réduit le gaspillage et les dépenses, et apporte même des nutriments en plus.",
    points: [
      "Organisez le réfrigérateur : ce qui périme en premier passe devant",
      "Utilisez les tiges dans les sautés et les soupes",
    ],
  },
  "act:lesson-3-3-l3-1": {
    text: "Défi final de planification : organiser une semaine entière !",
  },
  "act:lesson-3-3-l3-2": {
    prompt: "Remettez dans l'ordre la routine de préparation du dimanche :",
    items: [
      "Planifier le menu",
      "Faire la liste de courses",
      "Acheter les articles",
      "Nettoyer et ranger",
      "Cuisiner les bases",
    ],
    explanation:
      "Planifier d'abord évite d'acheter ce dont on n'a pas besoin et de cuisiner ce qu'on n'utilisera pas.",
  },
  "act:lesson-3-3-l3-3": {
    question: "Sans temps pour cuisiner en semaine, quelle stratégie aide le plus ?",
    options: [
      "Cuisiner en lot le week-end et congeler des portions",
      "Sauter des repas",
      "Ne manger que des collations",
      "Commander une livraison tous les jours",
    ],
    explanation:
      "Les repas congelés en portions apportent de la praticité sans renoncer à ce qui est fait maison.",
  },
  "act:lesson-3-3-l3-4": {
    statement: "Les fruits et légumes de saison sont généralement moins chers et plus savoureux.",
    explanation:
      "En pleine saison, il y a plus d'offre, le prix baisse et l'aliment mûrit au bon moment.",
  },
  "act:lesson-3-3-l3-5": {
    question: "Comment réduire le gaspillage alimentaire ?",
    options: [
      "Tout ranger au fond du réfrigérateur",
      "Organiser « premier périmé, premier consommé »",
      "Congeler les restes",
      "Utiliser les tiges et les épluchures dans les recettes",
    ],
    explanation: "Les tiges de brocoli, par exemple, donnent de délicieux sautés et soupes !",
  },
  "act:lesson-3-3-l3-6": {
    prompt: "Associez le reste à l'idée de réutilisation :",
    pairs: [
      {
        left: "Riz qui reste",
        right: "Croquette ou riz au four",
      },
      {
        left: "Banane mûre",
        right: "Crêpe ou gâteau",
      },
      {
        left: "Tiges de brocoli",
        right: "Sauté ou soupe",
      },
      {
        left: "Pain rassis",
        right: "Tartine grillée ou farofa",
      },
    ],
    explanation:
      "Réutiliser, c'est de la créativité et des économies. Rien n'a besoin d'aller à la poubelle !",
  },
  "act:lesson-3-3-l3-x1": {
    sentence: "Faire une ___ avant d'aller au marché aide à éviter les achats impulsifs.",
    options: ["pause", "régime", "recette", "liste"],
    explanation: "La liste garde l'attention sur ce dont on a vraiment besoin.",
  },
  "act:lesson-3-3-l3-x2": {
    question: "Quelles attitudes réduisent le gaspillage alimentaire ?",
    options: [
      "Acheter plus que ce que l'on va utiliser",
      "Congeler les restes",
      "Utiliser les tiges et les épluchures dans les recettes",
      "Garder devant ce qui périme en premier",
    ],
    explanation:
      "Utiliser les tiges, organiser le réfrigérateur et congeler les restes sont des habitudes qui réduisent le gaspillage.",
  },
  "act:lesson-3-3-l3-x3": {
    prompt: "Remettez dans l'ordre la réutilisation d'une tige de brocoli :",
    items: [
      "Lavez bien la tige",
      "Coupez-la en petits morceaux",
      "Faites-la revenir avec de l'ail et de l'huile d'olive",
      "Servez en accompagnement",
    ],
    explanation: "Les tiges de brocoli donnent un excellent sauté, plein de fibres.",
  },
  "trail:bem-estar": {
    title: "Esprit et Bien-être",
    tagline: "Comportement alimentaire",
    description:
      "Faim émotionnelle, pleine conscience et un rapport plus léger à la nourriture, sans culpabilité.",
  },
  "unit:unit-4": {
    title: "La Paix avec la Nourriture",
    description:
      "Bienveillance, alimentation en pleine conscience et fin de la culture de la restriction.",
  },
  "stop:lesson-4-1": {
    title: "Faim Physique vs. Émotionnelle",
    summary: "Faim physique et émotionnelle : écoutez votre corps et votre cœur.",
  },
  "act:lesson-4-1-l1-c1": {
    title: "Faim physique et faim émotionnelle",
    body: "La **faim physique** vient du corps, progressivement, et accepte plusieurs aliments. La **faim émotionnelle** vient des sentiments, arrive soudainement et réclame quelque chose de précis.",
    points: [
      "Physique : progressive, apaisée par un repas",
      "Émotionnelle : urgente, centrée sur le réconfort, peut générer de la culpabilité",
    ],
    tip: "Manger par émotion est humain. Le problème, c'est quand c'est la seule ressource.",
  },
  "act:l4-1-1": {
    text: "Parfois, l'envie de manger ne vient pas de l'estomac vide, mais du cœur plein (d'anxiété, de tristesse ou d'ennui). Et ce n'est pas grave !",
  },
  "act:l4-1-2": {
    question: "Quelle caractéristique décrit le mieux la FAIM ÉMOTIONNELLE ?",
    options: [
      "Elle apparaît peu à peu, accepte n'importe quel aliment (du riz et des haricots conviennent) et, une fois rassasié, te fait arrêter de manger.",
      "Elle apparaît soudainement, est urgente, exige quelque chose de précis (ex. : du chocolat) et peut ne pas passer même l'estomac plein.",
      "Elle n'arrive que tôt le matin au réveil.",
      "Elle prévient toujours en faisant gargouiller très fort l'estomac.",
    ],
    explanation:
      "Exactement ! Identifier le type de faim est la première étape. L'émotionnelle est urgente et orientée vers les aliments réconfort.",
  },
  "act:l4-1-3": {
    statement:
      "Manger par émotion est un crime contre le régime et vous devez vous sentir extrêmement coupable chaque fois que cela arrive.",
    explanation:
      "La nourriture réconforte, c'est biologique et humain ! Ne la laissez simplement pas être votre SEUL outil pour gérer les émotions.",
  },
  "act:lesson-4-1-l1-x1": {
    statement: "La faim physique apparaît généralement peu à peu, et non soudainement.",
    explanation:
      "Exactement ! C'est la faim émotionnelle qui arrive généralement soudainement et avec une envie précise.",
  },
  "act:lesson-4-1-l1-x2": {
    question: "Si vous êtes triste et avez envie de manger, quelle est une bonne première étape ?",
    options: [
      "Percevoir et nommer l'émotion",
      "Ignorer le corps",
      "Se culpabiliser",
      "Manger en cachette",
    ],
    explanation: "Nommer ce que nous ressentons est la première étape pour choisir quoi en faire.",
  },
  "act:lesson-4-1-l1-y1": {
    question: "Quels sont les signes de faim ÉMOTIONNELLE ?",
    options: [
      "Peut générer de la culpabilité ensuite",
      "Disparaît avec n'importe quel aliment",
      "Apparaît peu à peu",
      "Envie urgente et précise",
    ],
    explanation:
      "La faim émotionnelle est urgente, précise et s'accompagne parfois de culpabilité.",
  },
  "act:lesson-4-1-l1-y2": {
    prompt:
      "Associez le déclencheur émotionnel à une façon de prendre soin de soi qui n'est pas la nourriture :",
    pairs: [
      {
        left: "Stress",
        right: "Respirer profondément ou marcher",
      },
      {
        left: "Ennui",
        right: "Une activité agréable",
      },
      {
        left: "Solitude",
        right: "Parler avec quelqu'un",
      },
    ],
    explanation:
      "Chaque émotion appelle un soin différent. La nourriture peut aider, mais n'a pas besoin d'être la seule réponse.",
  },
  "act:lesson-4-1-l1-y3": {
    prompt: "Remettez dans l'ordre une pause avant de manger sur un coup de tête :",
    items: [
      "Arrêtez-vous et respirez",
      "Demandez-vous : est-ce de la faim dans l'estomac ?",
      "Nommez l'émotion que vous ressentez",
      "Décidez calmement quoi faire",
    ],
    explanation: "Ce petit rituel vous rend le choix, sans jugement.",
  },
  "act:lesson-4-1-l1-y4": {
    prompt:
      "La dernière fois que vous avez mangé sur un coup de tête, que ressentiez-vous ? Y avait-il une autre façon de prendre soin de vous à ce moment-là ?",
  },
  "act:lesson-4-1-l2-c1": {
    title: "Échelle de faim et déclencheurs",
    body: "Une échelle de 1 à 10 aide à percevoir le moment : 1 à 3 c'est très faim, 4 à 6 c'est confortable et 7 à 10 c'est trop plein. Notez aussi les **déclencheurs** : stress, ennui, fatigue, solitude.",
    points: ["Notez quand et pourquoi l'envie vient", "Repérez les schémas d'horaire et d'émotion"],
  },
  "act:lesson-4-1-l2-1": {
    text: "Écouter son corps est une compétence qui s'entraîne. Pratiquons ensemble.",
  },
  "act:lesson-4-1-l2-2": {
    prompt: "Associez chaque terme à sa signification :",
    pairs: [
      {
        left: "Faim physique",
        right: "Vient peu à peu et accepte plusieurs aliments",
      },
      {
        left: "Faim émotionnelle",
        right: "Soudaine, avec une envie précise",
      },
      {
        left: "Satiété",
        right: "Sensation d'être rassasié",
      },
      {
        left: "Ennui",
        right: "Motif courant de grignoter sans faim",
      },
    ],
    explanation: "Reconnaître la différence aide à répondre à ce dont vous avez vraiment besoin.",
  },
  "act:lesson-4-1-l2-3": {
    question:
      "Après une journée difficile, une envie de sucré surgit. Une bonne première question est :",
    options: [
      "Que vont penser les autres ?",
      "Ai-je faim dans l'estomac ou envie de réconfort ?",
      "Quelle punition je mérite pour ça ?",
      "Où est le paquet entier ?",
    ],
    explanation:
      "Se demander avec curiosité et sans jugement ouvre la voie à des choix conscients.",
  },
  "act:lesson-4-1-l2-4": {
    statement:
      "Faire une pause de quelques minutes peut aider à percevoir si la faim est physique ou émotionnelle.",
    explanation:
      "Une courte pause donne au corps et à l'esprit le temps de montrer ce qu'ils demandent vraiment.",
  },
  "act:lesson-4-1-l2-5": {
    question: "Cochez des alternatives de bienveillance en dehors de manger :",
    options: [
      "Se punir",
      "Appeler quelqu'un de cher",
      "Faire une promenade",
      "Respirer profondément",
    ],
    explanation:
      "La culpabilité et la punition ne font qu'alimenter le cycle. Prendre soin de soi est ce qui aide.",
  },
  "act:lesson-4-1-l2-x1": {
    prompt: "Faim physique ou émotionnelle ?",
    groups: ["Faim physique", "Faim émotionnelle"],
    items: [
      "Apparaît progressivement",
      "Accepte plusieurs aliments",
      "L'estomac gargouille",
      "Arrive soudainement",
      "Envie de quelque chose de précis",
      "Culpabilité après avoir mangé",
    ],
    explanation:
      "La faim physique est souple et progressive. L'émotionnelle est urgente et précise.",
  },
  "act:lesson-4-1-l2-x2": {
    setup:
      "Après une journée stressante au travail, Fernanda ressent une envie urgente de chocolat, même après avoir bien déjeuné.",
    question: "Qu'est-ce qui peut aider Fernanda à mieux comprendre cette envie ?",
    options: [
      "S'interdire le chocolat pour toujours",
      "Manger autant qu'elle veut sans réfléchir",
      "Faire une pause et se demander si c'est de la faim physique ou émotionnelle",
      "Ignorer complètement ce qu'elle ressent",
    ],
    explanation:
      "La pause aide à identifier l'origine de l'envie et à choisir une réponse avec plus de conscience.",
  },
  "act:lesson-4-1-l2-x3": {
    question: "La faim émotionnelle réclame généralement :",
    options: [
      "Seulement de l'eau",
      "N'importe quel aliment disponible",
      "Rien, elle disparaît toute seule",
      "Des aliments précis, généralement réconfortants",
    ],
    explanation:
      "La faim émotionnelle est généralement orientée vers les aliments réconfort, contrairement à la physique.",
  },
  "act:lesson-4-1-l2-x4": {
    statement: "Avoir envie de manger à cause d'une émotion est un signe de faiblesse.",
    explanation:
      "C'est une réponse humaine et courante. L'important est de ne pas en faire le seul outil pour gérer les émotions.",
  },
  "act:lesson-4-1-l3-c1": {
    title: "Stratégies de bienveillance",
    body: "Avant de manger sur un coup de tête, faites une **pause** : respirez, nommez l'émotion et décidez calmement. La nourriture peut être l'une des réponses, mais pas la seule.",
    points: ["Marcher, parler, se reposer, écrire", "Sans culpabilité ni punition ensuite"],
  },
  "act:lesson-4-1-l3-1": {
    text: "Des situations réelles et délicates. Souviens-toi : ici, il n'y a ni bien ni mal moral.",
  },
  "act:lesson-4-1-l3-2": {
    question:
      "Marina mange un pot de glace après une dispute au travail. Quelle attitude aide le plus ?",
    options: [
      "Se convaincre qu'elle n'a pas de volonté",
      "Sauter le dîner en guise de punition",
      "Promettre de ne plus jamais manger de sucreries",
      "Reconnaître l'émotion sans culpabilité et penser à d'autres façons de prendre soin d'elle",
    ],
    explanation:
      "La nourriture réconforte et c'est humain. L'idéal est de ne pas n'avoir qu'elle comme outil émotionnel.",
  },
  "act:lesson-4-1-l3-3": {
    prompt: "Remettez dans l'ordre la « pause » avant de manger sur un coup de tête :",
    items: [
      "Arrêtez-vous et respirez profondément",
      "Demandez-vous : est-ce de la faim dans l'estomac ?",
      "Nommez l'émotion que vous ressentez",
      "Choisissez : manger en pleine conscience ou prendre soin de vous autrement",
    ],
    explanation: "Ce petit rituel vous rend le choix, sans règles rigides.",
  },
  "act:lesson-4-1-l3-4": {
    statement: "Ressentir de la faim émotionnelle est un signe de faiblesse et doit être éliminé.",
    explanation: "C'est une réponse humaine. Le but est de la comprendre, pas de l'éliminer.",
  },
  "act:lesson-4-1-l3-5": {
    question: "Cochez les signes de faim PHYSIQUE :",
    options: [
      "Urgence pour un aliment précis",
      "Apparaît progressivement",
      "Accepte n'importe quel aliment",
      "Estomac qui gargouille",
    ],
    explanation:
      "La faim physique est progressive et souple. L'urgence pour un aliment précis est généralement émotionnelle.",
  },
  "act:lesson-4-1-l3-6": {
    prompt: "Associez l'émotion à une façon de prendre soin de soi :",
    pairs: [
      {
        left: "Anxiété",
        right: "Respirer et marcher",
      },
      {
        left: "Fatigue",
        right: "Se reposer et bien dormir",
      },
      {
        left: "Solitude",
        right: "Parler avec quelqu'un",
      },
      {
        left: "Ennui",
        right: "Commencer une nouvelle activité",
      },
    ],
    explanation:
      "Chaque émotion appelle un soin. La nourriture peut en faire partie, mais n'a pas besoin d'être la seule.",
  },
  "act:lesson-4-1-l3-x1": {
    sentence:
      "Avant de manger sur un coup de tête, il vaut la peine de ___ et de se demander si la faim est dans l'estomac.",
    options: ["courir", "faire une pause", "aller au marché", "sauter le repas"],
    explanation: "La pause vous rend le choix.",
  },
  "act:lesson-4-1-l3-x2": {
    question: "Quelles attitudes aident à gérer la faim émotionnelle, sans culpabilité ?",
    options: [
      "Se punir après avoir mangé",
      "Reconnaître l'émotion sans jugement",
      "Demander de l'aide quand c'est récurrent",
      "Chercher d'autres façons de prendre soin de soi",
    ],
    explanation:
      "La bienveillance et le soutien aident bien plus que la punition et la culpabilité.",
  },
  "act:lesson-4-1-l3-x3": {
    prompt:
      "Quelles sont 3 façons de prendre soin de vous en dehors de manger qui fonctionnent bien pour vous ?",
    placeholder: "Ex. : marcher, écouter de la musique, appeler quelqu'un…",
  },
  "stop:lesson-4-2": {
    title: "Pleine Conscience (Mindful Eating)",
    summary: "Manger en pleine conscience : saveur, rythme et signes de satiété.",
  },
  "act:lesson-4-2-l1-c1": {
    title: "Qu'est-ce que manger en pleine conscience",
    body: "Manger en pleine conscience (mindful eating), c'est être **présent** au repas : percevoir les couleurs, les odeurs, les saveurs et les signes de faim et de satiété, sans jugement.",
    points: ["Sans écrans et sans hâte", "Mâchez bien et percevez les textures"],
  },
  "act:l4-2-1": {
    text: "Si tu manges en regardant ton téléphone sur le canapé, ton cerveau ne va même pas enregistrer que tu as mangé. La satiété ne viendra pas complètement.",
  },
  "act:l4-2-2": {
    question: "Quelle est une bonne pratique de « Pleine Conscience » en mangeant ?",
    options: [
      "Manger debout devant le réfrigérateur pour aller plus vite.",
      "Éteindre les écrans, mâcher lentement et se concentrer sur le goût, la texture et l'odeur de l'aliment.",
      "Manger en regardant un film d'action pour que la nourriture passe mieux.",
      "Avaler sans mâcher pour ne pas perdre de temps.",
    ],
    explanation:
      "Parfait ! Être présent au repas aide le corps à envoyer le signal de satiété au bon moment.",
  },
  "act:l4-2-3": {
    statement:
      "Poser les couverts dans l'assiette entre deux bouchées est une excellente stratégie pour manger plus lentement.",
    explanation:
      "Cette pause force le rythme à ralentir, laissant le temps (environ 20 min) à l'estomac de prévenir le cerveau que vous êtes rassasié.",
  },
  "act:lesson-4-2-l1-x1": {
    statement: "Manger en regardant son téléphone aide à mieux percevoir la satiété.",
    explanation:
      "Les distractions nuisent : le cerveau n'enregistre même pas vraiment que vous avez mangé.",
  },
  "act:lesson-4-2-l1-x2": {
    question: "À quoi sert de mâcher lentement ?",
    options: [
      "À rien",
      "À manger plus vite",
      "À percevoir le goût et la satiété",
      "À sentir moins de goût",
    ],
    explanation: "Manger lentement laisse au corps le temps de signaler qu'il est déjà rassasié.",
  },
  "act:lesson-4-2-l1-y1": {
    question: "Quelles pratiques aident à manger avec plus de conscience ?",
    options: [
      "Mâcher lentement",
      "Éteindre les écrans",
      "Manger en marchant, pressé",
      "Percevoir les couleurs et les odeurs",
    ],
    explanation: "La présence et le rythme sont la base d'une alimentation plus consciente.",
  },
  "act:lesson-4-2-l1-y2": {
    prompt: "Associez la pratique au bénéfice :",
    pairs: [
      {
        left: "Mâcher lentement",
        right: "Perçoit mieux la satiété",
      },
      {
        left: "Éteindre le téléphone",
        right: "Plus de présence au repas",
      },
      {
        left: "S'asseoir à table",
        right: "Moins de distraction",
      },
    ],
    explanation: "Chaque petite habitude s'ajoute pour un repas plus conscient.",
  },
  "act:lesson-4-2-l1-y3": {
    prompt: "Remettez dans l'ordre un repas en pleine conscience :",
    items: [
      "Asseyez-vous sans écrans à proximité",
      "Observez la couleur, l'odeur et la texture",
      "Mâchez lentement",
      "Faites des pauses et percevez la satiété",
    ],
    explanation: "Suivre ces étapes aide le corps à mieux enregistrer le repas.",
  },
  "act:lesson-4-2-l1-y4": {
    prompt:
      "À votre dernier repas, étiez-vous présent(e) ou distrait(e) ? Qu'est-ce qui pourrait vous aider à être plus présent(e) au prochain ?",
  },
  "act:lesson-4-2-l2-c1": {
    title: "Signaux de satiété",
    body: "Le cerveau met environ **20 minutes** à enregistrer que vous êtes rassasié. Manger lentement laisse du temps à ce signal.",
    points: [
      "Posez les couverts entre les bouchées",
      "Arrêtez-vous quand vous êtes à l'aise, pas plein",
    ],
  },
  "act:lesson-4-2-l2-1": {
    text: "Manger en pleine conscience, c'est comme un petit repos pour l'esprit. Pratiquons !",
  },
  "act:lesson-4-2-l2-2": {
    question: "En combien de temps, environ, le cerveau enregistre-t-il la sensation de satiété ?",
    options: [
      "Environ 20 minutes",
      "Il ne l'enregistre jamais",
      "Immédiatement",
      "Seulement le lendemain",
    ],
    explanation:
      "Manger lentement laisse au cerveau le temps de recevoir le signal que vous êtes rassasié.",
  },
  "act:lesson-4-2-l2-3": {
    prompt: "Associez la pratique au bénéfice :",
    pairs: [
      {
        left: "Sentir l'odeur",
        right: "Prépare l'appétit et la digestion",
      },
      {
        left: "Remarquer la texture",
        right: "Aide à percevoir les saveurs",
      },
      {
        left: "Mâcher lentement",
        right: "Facilite la satiété",
      },
      {
        left: "Éteindre les écrans",
        right: "Plus de concentration sur le repas",
      },
    ],
    explanation: "Être présent transforme le repas en un moment de plaisir.",
  },
  "act:lesson-4-2-l2-4": {
    statement: "Manger très vite n'interfère pas avec la perception de la satiété.",
    explanation:
      "Manger vite peut vous faire dépasser la limite avant que le cerveau ne prévienne.",
  },
  "act:lesson-4-2-l2-5": {
    question: "Cochez les pratiques de pleine conscience :",
    options: [
      "Bien mâcher",
      "Remarquer l'odeur et la couleur",
      "Éteindre les écrans",
      "Manger en voiture, pressé",
    ],
    explanation: "La présence est le secret : moins de distractions, plus de plaisir.",
  },
  "act:lesson-4-2-l2-x1": {
    prompt: "Cette pratique aide-t-elle ou gêne-t-elle l'alimentation en pleine conscience ?",
    groups: ["Aide", "Gêne"],
    items: [
      "Éteindre les écrans",
      "Bien mâcher",
      "S'asseoir à table",
      "Manger en voiture, pressé",
      "Faire défiler le téléphone en mangeant",
      "Avaler sans mâcher",
    ],
    explanation: "La présence et le rythme aident à percevoir la satiété.",
  },
  "act:lesson-4-2-l2-x2": {
    setup:
      "Lucas déjeune toujours en regardant des vidéos sur son téléphone et, à la fin, a l'impression de ne « même pas avoir remarqué » ce qu'il a mangé.",
    question: "Qu'est-ce qui pourrait aider Lucas à manger avec plus de conscience ?",
    options: [
      "Ranger le téléphone pendant le repas",
      "Manger plus vite pour finir la vidéo",
      "Manger debout pour gagner du temps",
      "Regarder des vidéos encore plus intéressantes",
    ],
    explanation:
      "Ranger le téléphone aide Lucas à remarquer le goût, la texture et les signaux de satiété de son propre corps.",
  },
  "act:lesson-4-2-l2-x3": {
    question: "Manger lentement aide principalement parce que :",
    options: [
      "Cela fait refroidir la nourriture plus vite",
      "Cela rend le repas fade",
      "Cela n'a aucun effet réel",
      "Cela laisse au cerveau le temps d'enregistrer la satiété",
    ],
    explanation:
      "Le cerveau met environ 20 minutes à percevoir la satiété — manger lentement suit ce rythme.",
  },
  "act:lesson-4-2-l2-x4": {
    statement: "Prêter attention au repas peut augmenter le plaisir de manger.",
    explanation:
      "Percevoir les saveurs, les textures et les odeurs rend généralement l'expérience plus agréable, pas moins.",
  },
  "act:lesson-4-2-l3-c1": {
    title: "Pleine conscience dans une routine chargée",
    body: "Tous les repas ne seront pas parfaits. De petits gestes aident déjà.",
    points: [
      "Rangez le téléphone pendant 10 minutes",
      "Respirez trois fois avant de commencer",
      "Choisissez un repas de la journée pour pratiquer",
    ],
  },
  "act:lesson-4-2-l3-1": {
    text: "Maintenant, la pratique dans le monde réel : courses, échéances et repas rapides.",
  },
  "act:lesson-4-2-l3-2": {
    prompt: "Remettez dans l'ordre un repas pris en pleine conscience :",
    items: [
      "Asseyez-vous à table, sans écrans",
      "Observez la couleur et l'odeur",
      "Prenez la première bouchée et mâchez lentement",
      "Faites une pause et ressentez la satiété",
    ],
    explanation: "Chaque étape vous rapproche du plaisir de manger et des signaux de votre corps.",
  },
  "act:lesson-4-2-l3-3": {
    question:
      "Vous n'avez que 15 minutes pour déjeuner. Que peut-on encore faire en pleine conscience ?",
    options: [
      "Avaler vite pour qu'il reste du temps",
      "Ranger le téléphone, s'asseoir, respirer et bien mâcher",
      "Manger debout en regardant ses e-mails",
      "Sauter le repas",
    ],
    explanation: "Même en peu de temps, quelques habitudes simples améliorent déjà l'expérience.",
  },
  "act:lesson-4-2-l3-4": {
    statement: "Manger lentement aide à percevoir quand vous êtes déjà rassasié.",
    explanation: "Avec plus de rythme, vous percevez les signaux de satiété avant d'exagérer.",
  },
  "act:lesson-4-2-l3-5": {
    question: "Quels sont les bénéfices de manger en pleine conscience ?",
    options: [
      "Moins de manger en pilote automatique",
      "Plus de plaisir avec la nourriture",
      "Une moins bonne digestion",
      "Une meilleure perception de la satiété",
    ],
    explanation: "Manger avec attention, c'est un gain de plaisir et de conscience corporelle.",
  },
  "act:lesson-4-2-l3-6": {
    prompt: "Associez la note de l'échelle de faim à la situation :",
    pairs: [
      {
        left: "1 à 3",
        right: "Très faim : l'heure de manger",
      },
      {
        left: "4 à 6",
        right: "Confortable et rassasié",
      },
      {
        left: "7 à 10",
        right: "Trop plein",
      },
      {
        left: "A commencé à grignoter sans faim",
        right: "Vaut la peine de vérifier l'émotion",
      },
    ],
    explanation: "Une échelle simple aide à suivre ce que le corps demande.",
  },
  "act:lesson-4-2-l3-x1": {
    sentence: "Le cerveau met environ ___ minutes à enregistrer la sensation de satiété.",
    options: ["20", "2", "120", "60"],
    explanation: "C'est pourquoi manger lentement évite de dépasser la limite.",
  },
  "act:lesson-4-2-l3-x2": {
    question: "Quels signes peuvent indiquer une satiété confortable ?",
    options: [
      "Absence de faim, mais sans être trop plein",
      "Satisfaction tranquille",
      "Envie de continuer à manger par habitude",
      "Ventre gonflé et inconfortable",
    ],
    explanation: "La satiété confortable est un état tranquille, sans excès ni inconfort.",
  },
  "act:lesson-4-2-l3-x3": {
    question:
      "Sur une échelle de 1 (affamé) à 10 (gavé), quel niveau indique généralement un bon moment pour arrêter de manger ?",
    unit: "",
    explanation: "Vers 7, la personne est généralement rassasiée et à l'aise, sans exagérer.",
  },
  "stop:lesson-4-3": {
    title: "Sans Culpabilité à Table",
    summary: "Sans culpabilité à table : souplesse, bienveillance et régularité.",
  },
  "act:lesson-4-3-l1-c1": {
    title: "Restriction vs. souplesse",
    body: "Les régimes très restrictifs mènent souvent à un cycle de **restriction et de compulsion**. La souplesse, avec de la place pour tous les aliments, est plus durable.",
    points: ["Aucun aliment n'est interdit", "L'équilibre vaut pour toute la semaine"],
  },
  "act:l4-3-1": {
    text: "Célébrons une merveilleuse vérité de la science nutritionnelle actuelle : la mentalité du « Tout ou Rien » échoue dans 95 % des cas.",
  },
  "act:l4-3-2": {
    question:
      "Que se passe-t-il généralement (l'effet yo-yo) quand une personne suit un régime très extrême, en supprimant tous les glucides et les sucreries ?",
    options: [
      "Elle vit heureuse pour toujours et n'a plus jamais faim.",
      "Elle développe un rapport durable à la nourriture.",
      "Elle finit par souffrir de frustration, abandonner et avoir des épisodes de compulsion ou d'excès compensatoires (tout lâcher).",
      "Le corps oublie qu'il aime le sucré le lendemain.",
    ],
    explanation:
      "La restriction génère de la compulsion. Interdire complètement un aliment le place sur un « piédestal », créant une fixation mentale sur lui.",
  },
  "act:l4-3-3": {
    statement:
      "Une vie saine a de la place à la fois pour l'assiette de salade au déjeuner du mardi et pour le brigadeiro à la fête du samedi, sans culpabilité.",
    explanation:
      "Vous avez tout bon ! La régularité est le secret. Un mauvais repas ne ruine pas une bonne routine. Soyez bienveillant avec vous-même !",
  },
  "act:lesson-4-3-l1-x1": {
    statement: "Une sucrerie de temps en temps a sa place dans une alimentation saine.",
    explanation: "Bien sûr ! Aucun aliment n'est interdit. L'équilibre vaut pour toute la semaine.",
  },
  "act:lesson-4-3-l1-x2": {
    question: "Quelle est l'attitude la plus bienveillante après un excès ?",
    options: [
      "Avoir faim le lendemain",
      "Se comparer aux autres",
      "Suivre sa routine normale, sans culpabilité",
      "Tout abandonner",
    ],
    explanation: "Reprendre le rythme normal brise le cycle de culpabilité et de compensation.",
  },
  "act:lesson-4-3-l1-y1": {
    question: "Quelles pensées sont les plus bienveillantes et durables ?",
    options: [
      "Demain je reprends mon rythme normal",
      "Je dois me punir d'avoir mangé ça",
      "Un repas ne définit pas ma santé",
      "J'ai tout gâché, ça ne sert plus à rien",
    ],
    explanation:
      "Les pensées bienveillantes maintiennent la régularité sans alimenter le cycle de culpabilité.",
  },
  "act:lesson-4-3-l1-y2": {
    prompt: "Associez la pensée au type :",
    pairs: [
      {
        left: "J'ai mangé du gâteau, mais je m'en sors bien aujourd'hui",
        right: "Pensée souple",
      },
      {
        left: "J'ai mangé du gâteau, maintenant zéro nourriture",
        right: "Pensée tout ou rien",
      },
      {
        left: "Je peux inclure du sucré avec équilibre",
        right: "Pensée souple",
      },
    ],
    explanation: "Reconnaître son propre schéma de pensée est la première étape pour le changer.",
  },
  "act:lesson-4-3-l1-y3": {
    prompt: "Remettez dans l'ordre un recommencement bienveillant après un excès :",
    items: [
      "Constatez sans vous juger",
      "Buvez de l'eau et reposez-vous",
      "Reprenez normalement au repas suivant",
      "Réfléchissez avec bienveillance à ce qui s'est passé",
    ],
    explanation: "Le recommencement bienveillant est toujours plus efficace que la punition.",
  },
  "act:lesson-4-3-l1-y4": {
    prompt:
      "Comment vous parlez-vous après avoir mangé quelque chose que vous jugez « interdit » ? Est-ce que cela vous aide ou vous gêne ?",
  },
  "act:lesson-4-3-l2-c1": {
    title: "Dialogue intérieur bienveillant",
    body: "La façon dont nous nous parlons influence le comportement. Remplacez le **tout ou rien** par des pensées réalistes et bienveillantes.",
    points: [
      "« J'ai tout gâché » devient « un repas ne définit pas ma santé »",
      "« Je dois compenser » devient « je reprends mon rythme »",
    ],
  },
  "act:lesson-4-3-l2-1": {
    text: "Un bon rapport à la nourriture est aussi fait de pensées bienveillantes !",
  },
  "act:lesson-4-3-l2-2": {
    question: "L'« effet yo-yo » des régimes radicaux, c'est quand :",
    options: [
      "Le corps maigrit sans effort",
      "Le métabolisme devient infini",
      "La personne perd l'envie de manger du sucré",
      "La restriction extrême mène ensuite à des compulsions et des excès",
    ],
    explanation:
      "Ce qui est trop interdit a tendance à devenir un désir. La souplesse protège de la compulsion.",
  },
  "act:lesson-4-3-l2-3": {
    statement:
      "Les aliments considérés comme « interdits » deviennent souvent encore plus désirés.",
    explanation:
      "L'interdiction augmente le désir. Les inclure avec modération ôte le pouvoir de la tentation.",
  },
  "act:lesson-4-3-l2-4": {
    prompt: "Associez chaque idée à sa signification :",
    pairs: [
      {
        left: "Tout ou rien",
        right: "Pensée qui gêne",
      },
      {
        left: "Équilibre",
        right: "Variété sans aliments interdits",
      },
      {
        left: "Autocompassion",
        right: "Se traiter avec bienveillance",
      },
      {
        left: "Régularité",
        right: "Habitude qui dure dans le temps",
      },
    ],
    explanation:
      "Le changement durable naît de la bienveillance et de la régularité, pas de la rigidité.",
  },
  "act:lesson-4-3-l2-5": {
    question: "Cochez les pensées bienveillantes :",
    options: [
      "Un repas ne définit pas ma santé",
      "Je peux manger ce que j'aime avec modération",
      "Demain je continue normalement",
      "J'ai tout gâché, j'abandonne",
    ],
    explanation: "Se parler comme on parlerait à un ami est la clé.",
  },
  "act:lesson-4-3-l2-x1": {
    prompt: "Pensée bienveillante ou « tout ou rien » ?",
    groups: ["Pensée bienveillante", "Tout ou rien"],
    items: [
      "Un repas ne définit pas ma santé",
      "Demain je garde mon rythme",
      "Je peux inclure ce que j'aime",
      "J'ai tout gâché",
      "Puisque j'ai échoué, j'abandonne",
      "Je dois compenser",
    ],
    explanation:
      "Les pensées bienveillantes maintiennent la régularité. Le tout ou rien alimente le cycle de culpabilité.",
  },
  "act:lesson-4-3-l2-x2": {
    setup:
      "Après avoir mangé une part de gâteau à la fête, Rodrigo pense sauter le dîner pour « compenser ».",
    question: "Quelle serait une attitude plus équilibrée ?",
    options: [
      "Manger le double au dîner exprès",
      "Se sentir coupable le reste de la journée",
      "Sauter tout le dîner",
      "Dîner normalement, sans compensation",
    ],
    explanation:
      "Compenser par la restriction alimente le cycle de culpabilité. Suivre la routine normalement brise ce schéma.",
  },
  "act:lesson-4-3-l2-x3": {
    question: "Le cycle « restriction extrême suivie de compulsion » est généralement causé par :",
    options: [
      "Des règles alimentaires très rigides",
      "Manger lentement",
      "Manger avec souplesse",
      "Le suivi d'une nutritionniste",
    ],
    explanation:
      "Des règles très rigides tendent à générer un désir intense pour ce qui a été interdit, alimentant le cycle.",
  },
  "act:lesson-4-3-l2-x4": {
    statement:
      "Chercher une aide professionnelle pour gérer son alimentation est un signe de faiblesse.",
    explanation:
      "Chercher de l'aide est un acte de soin. Les nutritionnistes et les psychologues peuvent grandement soutenir ce processus.",
  },
  "act:lesson-4-3-l3-c1": {
    title: "Quand chercher de l'aide",
    body: "Une forte culpabilité, des compulsions, des restrictions qui perturbent la vie ou la peur de manger méritent un soutien **professionnel**. Les nutritionnistes et les psychologues peuvent aider.",
    points: [
      "Chercher de l'aide est un soin, pas une faiblesse",
      "La famille et les amis font aussi partie du réseau",
    ],
  },
  "act:lesson-4-3-l3-1": {
    text: "Dernière étape du parcours : mettre la bienveillance en pratique dans les fêtes et les recommencements.",
  },
  "act:lesson-4-3-l3-2": {
    question:
      "À une fête, Bia a mangé du gâteau et du brigadeiro. Quelle est la meilleure attitude au repas suivant ?",
    options: [
      "Ne manger que de la salade pendant trois jours",
      "Reprendre le rythme normal, sans essayer de compenser",
      "Rester sans manger pour compenser",
      "Se sentir coupable pendant une semaine",
    ],
    explanation:
      "Compenser crée un cycle de restriction et d'excès. Reprendre le rythme normal brise ce cycle.",
  },
  "act:lesson-4-3-l3-3": {
    statement: "Sauter des repas pour compenser un excès est une bonne stratégie.",
    explanation:
      "Sauter des repas augmente la faim et le risque d'exagérer à nouveau. Reprenez votre rythme normal.",
  },
  "act:lesson-4-3-l3-4": {
    prompt: "Remettez dans l'ordre un recommencement bienveillant après un excès :",
    items: [
      "Constatez sans juger",
      "Buvez de l'eau et réconfortez-vous",
      "Prenez le repas suivant normalement",
      "Réfléchissez à ce que vous avez appris",
    ],
    explanation: "Le recommencement bienveillant est toujours plus efficace que la punition.",
  },
  "act:lesson-4-3-l3-5": {
    question: "Qu'est-ce qui aide à avoir un rapport sain à la nourriture ?",
    options: [
      "Écouter les signaux de faim et de satiété",
      "La variété",
      "Compter chaque calorie de façon obsessionnelle",
      "Manger sans culpabilité",
    ],
    explanation:
      "Le comptage obsessionnel augmente généralement l'anxiété au lieu d'apporter de la santé.",
  },
  "act:lesson-4-3-l3-6": {
    question: "Quel est un signe qu'il vaut la peine de chercher une aide professionnelle ?",
    options: [
      "Culpabilité intense, compulsions ou restrictions qui perturbent la vie",
      "Aimer le sucré",
      "Avoir un aliment préféré",
      "Manger parfois au restaurant",
    ],
    explanation:
      "Demander de l'aide est un acte de soin. Les nutritionnistes et les psychologues peuvent vous accompagner.",
  },
  "act:lesson-4-3-l3-7": {
    prompt: "Associez qui peut aider au type de soutien :",
    pairs: [
      {
        left: "Nutritionniste",
        right: "Guide l'alimentation",
      },
      {
        left: "Psychologue",
        right: "S'occupe des émotions et du comportement",
      },
      {
        left: "Famille et amis",
        right: "Soutien au quotidien",
      },
      {
        left: "Vous-même",
        right: "Bienveillance et patience",
      },
    ],
    explanation: "Prendre soin de soi est un réseau : professionnels, proches et vous.",
  },
  "act:lesson-4-3-l3-x1": {
    sentence: "La pensée « tout ou rien » mène généralement à la restriction suivie de ___.",
    options: ["équilibre", "satiété", "discipline", "compulsion"],
    explanation: "Plus il y a de restriction, plus le risque d'excès ensuite est grand.",
  },
  "act:lesson-4-3-l3-x2": {
    prompt:
      "Que souhaiteriez-vous vous rappeler la prochaine fois que vous vous sentez coupable d'avoir mangé quelque chose « hors régime » ?",
  },
  "trail:kid-sabores": {
    title: "Aventure des Saveurs",
    tagline: "Couleurs, fruits et eau",
    description:
      "Découvre les couleurs des aliments, fais connaissance avec les fruits et légumes et deviens ami de l'eau.",
  },
  "unit:kid-unit-1": {
    title: "Le Monde des Couleurs",
    description: "Fruits, légumes et la super boisson : l'eau !",
  },
  "stop:kid-1-1": {
    title: "Arc-en-ciel dans l'Assiette",
    summary: "Chaque couleur de fruit et de légume a un super-pouvoir !",
  },
  "act:kid-1-1-l1-1": {
    title: "Chaque couleur a un super-pouvoir !",
    body: "Les fruits et légumes ont de belles couleurs, et chaque couleur aide le corps à sa manière. **Plus il y a de couleurs dans l'assiette, plus il y a de super-pouvoirs !**",
    points: [
      "🥕 Orange : aide les yeux",
      "🥦 Vert : rend le corps fort",
      "🍅 Rouge : prend soin du cœur",
      "🍇 Violet : aide le cerveau",
    ],
    tip: "Essaie de manger 3 couleurs différentes à chaque repas !",
  },
  "act:kid-1-1-l1-2": {
    text: "Salut ! Je suis Cadu Cenoura ! Tu savais que ma couleur orange est bonne pour tes yeux ?",
  },
  "act:kid-1-1-l1-3": {
    question: "Lequel de ces aliments est ORANGE ?",
    options: ["Brocoli", "Carotte", "Raisin", "Chou-fleur"],
    explanation: "Exactement ! La carotte est orange et nous aide à bien voir.",
  },
  "act:kid-1-1-l1-4": {
    statement: "Une assiette avec plusieurs couleurs est plus nutritive.",
    explanation: "Exactement ! Chaque couleur apporte des nutriments différents.",
  },
  "act:kid-1-1-l1-5": {
    question: "De quelle couleur est le brocoli ?",
    options: ["Noir", "Rose", "Vert", "Bleu"],
    explanation: "Vert ! Les aliments verts aident le corps à devenir fort.",
  },
  "act:kid-1-1-l1-6": {
    prompt: "Associe l'aliment à sa couleur :",
    pairs: [
      {
        left: "Fraise",
        right: "Rouge",
      },
      {
        left: "Banane",
        right: "Jaune",
      },
      {
        left: "Laitue",
        right: "Vert",
      },
      {
        left: "Raisin",
        right: "Violet",
      },
    ],
    explanation: "Très bien ! Chaque fruit a sa couleur.",
  },
  "act:kid-1-1-l1-7": {
    question: "Lesquels de ces aliments sont VERTS ?",
    options: ["Laitue", "Brocoli", "Fraise", "Chou vert"],
    explanation: "Le brocoli, le chou vert et la laitue sont verts ! La fraise est rouge.",
  },
  "act:kid-1-1-l1-8": {
    prompt: "Associe le fruit ou légume à sa couleur :",
    pairs: [
      {
        left: "Carotte",
        right: "Orange",
      },
      {
        left: "Raisin",
        right: "Violet",
      },
      {
        left: "Tomate",
        right: "Rouge",
      },
    ],
    explanation: "Tu es déjà un pro pour associer couleurs et aliments !",
  },
  "act:kid-1-1-l1-9": {
    setup: "À l'heure du goûter, Cadu veut avoir de bons yeux pour bien voir de loin.",
    question: "Quel aliment va aider le plus ?",
    options: ["Biscuit", "Soda", "Carotte", "Bonbon"],
    explanation: "La carotte est orange et pleine de vitamine A, qui aide les yeux à bien voir !",
  },
  "act:kid-1-1-l1-10": {
    prompt: "Quel est ton fruit ou légume coloré préféré ? Pourquoi ?",
  },
  "act:kid-1-1-l2-1": {
    title: "Composer une assiette colorée",
    body: "Pour une assiette de champion, choisis **une couleur de chaque sorte** : quelque chose de vert, quelque chose d'orange ou de jaune, quelque chose de rouge et une protéine, comme des haricots ou un œuf.",
    points: [
      "Vert : feuilles et brocoli",
      "Orange ou jaune : carotte et citrouille",
      "Rouge : tomate et betterave",
    ],
    tip: "Une jolie assiette est une assiette délicieuse !",
  },
  "act:kid-1-1-l2-2": {
    prompt: "Mets chaque aliment dans la bonne couleur :",
    groups: ["Vert", "Rouge", "Orange"],
    items: ["Chou vert", "Laitue", "Tomate", "Fraise", "Carotte", "Orange"],
    explanation: "Bravo ! Tu as tout bien trié.",
  },
  "act:kid-1-1-l2-3": {
    question: "Lesquels de ces aliments sont rouges ?",
    options: ["Tomate", "Laitue", "Fraise", "Cerise", "Banane"],
    explanation:
      "La tomate, la fraise et la cerise sont rouges. La banane est jaune et la laitue est verte !",
  },
  "act:kid-1-1-l2-4": {
    statement: "Manger seulement des aliments d'une seule couleur est le meilleur choix.",
    explanation:
      "Il vaut mieux mélanger ! Chaque couleur apporte quelque chose de différent au corps.",
  },
  "act:kid-1-1-l2-5": {
    sentence: "Une assiette bien ___ est une assiette pleine de super-pouvoirs !",
    options: ["colorée", "vide", "sombre", "triste"],
    explanation: "Colorée ! Plus il y a de couleurs, mieux c'est.",
  },
  "act:kid-1-1-l2-6": {
    prompt: "Compose l'assiette colorée dans l'ordre :",
    items: [
      "Mets les feuilles vertes",
      "Ajoute quelque chose d'orange",
      "Ajoute les haricots",
      "Termine avec une tomate rouge",
    ],
    explanation: "Comme ça, l'assiette est belle et complète !",
  },
  "act:kid-1-1-l2-7": {
    prompt: "Associe l'aliment à la couleur qui manque encore dans l'assiette :",
    pairs: [
      {
        left: "Maïs",
        right: "Jaune",
      },
      {
        left: "Aubergine",
        right: "Violet",
      },
      {
        left: "Poivron rouge",
        right: "Rouge",
      },
    ],
    explanation: "Chaque couleur en plus rend l'assiette plus complète !",
  },
  "act:kid-1-1-l2-8": {
    setup: "Mila compose son assiette : elle a déjà mis du riz et du poulet.",
    question: "Que peut-elle ajouter pour rendre l'assiette plus colorée ?",
    options: [
      "Rien, c'est prêt",
      "Seulement du poulet",
      "Une salade de tomate et de laitue",
      "Plus de riz",
    ],
    explanation:
      "Une salade colorée complète l'assiette avec des vitamines et de nouvelles couleurs !",
  },
  "act:kid-1-1-l2-9": {
    question:
      "Combien de couleurs différentes de vrais aliments est-il bien d'avoir dans l'assiette ?",
    unit: " couleurs",
    explanation: "Un bon objectif est d'avoir au moins 3 couleurs différentes à chaque repas !",
  },
  "act:kid-1-1-l3-1": {
    title: "Couleurs cachées",
    body: "Tout ce qui fait du bien n'est pas coloré à l'extérieur ! Le chou-fleur, l'oignon et l'ail sont clairs, mais ont **plein de nutriments**. Et les couleurs des fruits sont naturelles, différentes des couleurs des bonbons, qui viennent de colorants.",
    points: [
      "Le blanc compte aussi : chou-fleur, oignon, ail",
      "La couleur des fruits est naturelle",
      "La couleur des bonbons vient de colorants",
    ],
    tip: "La couleur des fruits est naturelle. La couleur des bonbons, c'est du colorant !",
  },
  "act:kid-1-1-l3-2": {
    question: "D'où vient la couleur de la betterave ?",
    options: [
      "De la peinture",
      "D'un colorant de bonbon",
      "Du sucre",
      "De la betterave elle-même, elle est naturelle",
    ],
    explanation: "La couleur de la betterave naît avec elle. Elle est totalement naturelle !",
  },
  "act:kid-1-1-l3-3": {
    statement: "Les bonbons colorés ont la même couleur naturelle que les fruits.",
    explanation: "Les bonbons utilisent des colorants. Seuls les fruits ont une couleur naturelle.",
  },
  "act:kid-1-1-l3-4": {
    question: "Quels aliments ont une couleur naturelle ?",
    options: ["Carotte", "Boisson en poudre", "Betterave", "Bonbon gélifié", "Raisin"],
    explanation:
      "La carotte, le raisin et la betterave ont une couleur naturelle. Les bonbons et la boisson en poudre utilisent des colorants.",
  },
  "act:kid-1-1-l3-5": {
    prompt: "Vrai aliment ou aliment en paquet ?",
    groups: ["Vrai aliment", "En paquet"],
    items: ["Fraise", "Carotte", "Raisin", "Bonbon gélifié", "Boisson en poudre", "Chips"],
    explanation: "Les fruits et légumes sont de vrais aliments, directement de la nature.",
  },
  "act:kid-1-1-l3-6": {
    prompt: "Associe la couleur au super-pouvoir :",
    pairs: [
      {
        left: "Orange",
        right: "Aide les yeux",
      },
      {
        left: "Vert",
        right: "Rend le corps fort",
      },
      {
        left: "Rouge",
        right: "Prend soin du cœur",
      },
      {
        left: "Violet",
        right: "Aide le cerveau",
      },
    ],
    explanation: "Maintenant tu sais ce que fait chaque couleur !",
  },
  "act:kid-1-1-l3-7": {
    question:
      "Lesquels de ceux-ci n'ont PAS besoin de colorant, parce que la couleur est déjà naturelle ?",
    options: ["Betterave", "Boisson en poudre", "Bonbon gélifié", "Carotte"],
    explanation: "La betterave et la carotte naissent avec ces belles couleurs !",
  },
  "act:kid-1-1-l3-8": {
    sentence: "La couleur des fruits est ___, mais la couleur des bonbons vient de colorants.",
    options: ["de crayon", "naturelle", "de peinture", "magique"],
    explanation: "Naturelle ! Les fruits naissent avec leur couleur.",
  },
  "act:kid-1-1-l3-9": {
    prompt: "Remets dans l'ordre comment savoir si un aliment a une couleur naturelle :",
    items: [
      "Demande-toi si c'est un vrai fruit ou légume",
      "Regarde s'il a poussé comme ça, de la terre ou de l'arbre",
      "Si oui, sa couleur est naturelle",
      "Si c'est une sucrerie très colorée, la couleur est du colorant",
    ],
    explanation: "Super ! Maintenant tu es un détective des couleurs.",
  },
  "act:kid-1-1-l3-10": {
    prompt:
      "Y a-t-il un aliment coloré que tu n'as jamais goûté ? Et si tu l'essayais un de ces jours ?",
  },
  "stop:kid-1-2": {
    title: "Fruits et Légumes",
    summary: "Découvre les fruits, les légumes et les verdures, et comment en manger plus.",
  },
  "act:kid-1-2-l1-1": {
    title: "Fruits, légumes et verdures sont amis",
    body: "Les **fruits** sont généralement sucrés et poussent sur des arbres ou des plantes. Les **légumes** et les **verdures** vont bien avec le déjeuner et le dîner. Tous ont des vitamines pour que tu grandisses fort !",
    points: [
      "Fruits : pomme, banane, orange",
      "Légumes : carotte, citrouille, chayotte",
      "Verdures : laitue, chou vert, épinard",
    ],
    tip: "Un bon objectif est de manger des fruits et des légumes tous les jours !",
  },
  "act:kid-1-2-l1-2": {
    question: "Laquelle de celles-ci est un FRUIT ?",
    options: ["Pomme de terre", "Chou vert", "Laitue", "Pomme"],
    explanation: "La pomme est un fruit délicieux et plein de fibres.",
  },
  "act:kid-1-2-l1-3": {
    statement: "Les verdures comme la laitue et le chou vert aident le corps à devenir fort.",
    explanation: "Exactement ! Elles ont des vitamines et des minéraux importants.",
  },
  "act:kid-1-2-l1-4": {
    prompt: "Associe le groupe à l'exemple :",
    pairs: [
      {
        left: "Fruit",
        right: "Banane",
      },
      {
        left: "Verdure",
        right: "Laitue",
      },
      {
        left: "Légume",
        right: "Carotte",
      },
    ],
    explanation: "Très bien ! Tu sais déjà séparer les groupes.",
  },
  "act:kid-1-2-l1-5": {
    question: "Quel fruit a une peau jaune et est mou à l'intérieur ?",
    options: ["Fraise", "Banane", "Raisin", "Pastèque"],
    explanation: "La banane ! Idéale pour le goûter.",
  },
  "act:kid-1-2-l1-6": {
    sentence: "Les fruits, verdures et légumes ont plein de ___ pour que le corps grandisse fort.",
    options: ["cailloux", "bonbons", "peintures", "vitamines"],
    explanation: "Des vitamines ! Elles aident le corps à bien fonctionner.",
  },
  "act:kid-1-2-l1-7": {
    prompt: "Associe le fruit à son groupe :",
    pairs: [
      {
        left: "Fraise",
        right: "Fruit",
      },
      {
        left: "Épinard",
        right: "Verdure",
      },
      {
        left: "Chayotte",
        right: "Légume",
      },
    ],
    explanation: "Tu reconnais déjà très bien chaque groupe !",
  },
  "act:kid-1-2-l1-8": {
    question: "Lesquelles de celles-ci sont des FRUITS ?",
    options: ["Courgette", "Raisin", "Mangue", "Carotte"],
    explanation:
      "La mangue et le raisin sont des fruits ! La carotte et la courgette sont des légumes.",
  },
  "act:kid-1-2-l1-9": {
    setup: "Au goûter de l'école, Léo ne veut manger que des biscuits.",
    question: "Quel serait un bon échange, en gardant le goûter savoureux ?",
    options: ["Un fruit coupé", "Plus de biscuits", "Du soda", "Rien"],
    explanation: "Un fruit coupé est sucré, délicieux et plein de vitamines !",
  },
  "act:kid-1-2-l1-10": {
    prompt: "Quel nouveau fruit ou légume accepterais-tu d'essayer cette semaine ?",
  },
  "act:kid-1-2-l2-1": {
    title: "Comment manger plus de fruits et légumes",
    body: "On peut mettre des fruits et des légumes dans **tous les repas** : un fruit au petit-déjeuner et au goûter, des légumes au déjeuner et au dîner. Goûter de nouvelles choses aide à les aimer.",
    points: [
      "Goûte une petite cuillère de chaque nouveauté",
      "Essaie de façons différentes : cru, cuit, rôti",
      "Choisis avec ta famille au marché",
    ],
    tip: "Parfois, il faut goûter 10 fois avant d'aimer. Continue d'essayer !",
  },
  "act:kid-1-2-l2-2": {
    prompt: "Fruit, légume ou verdure ?",
    groups: ["Fruit", "Légume", "Verdure"],
    items: ["Pomme", "Banane", "Carotte", "Citrouille", "Laitue", "Chou vert"],
    explanation: "Exactement ! Chacun a son groupe.",
  },
  "act:kid-1-2-l2-3": {
    statement: "Si tu n'as pas aimé un aliment la première fois, tu ne l'aimeras jamais.",
    explanation: "Notre goût apprend ! Goûter de nouveau aide à aimer.",
  },
  "act:kid-1-2-l2-4": {
    question: "Quelles sont de bonnes idées de goûter ?",
    options: [
      "Fruit coupé",
      "Chips",
      "Carotte avec de la pâte de pois chiches",
      "Bonbon",
      "Yaourt avec des fruits",
    ],
    explanation: "Les fruits, le yaourt et la carotte sont des goûters solides et délicieux.",
  },
  "act:kid-1-2-l2-5": {
    prompt: "Comment laver un fruit avant de le manger ?",
    items: [
      "Lave-toi les mains",
      "Lave le fruit sous l'eau courante",
      "Frotte la peau avec précaution",
      "Sèche-le et mange-le",
    ],
    explanation: "Se laver les mains et laver le fruit protège le ventre.",
  },
  "act:kid-1-2-l2-6": {
    question: "Quel est un bon moment pour manger des fruits ?",
    options: [
      "Seulement à l'anniversaire",
      "Seulement quand on est malade",
      "Au goûter et en dessert",
      "Jamais",
    ],
    explanation: "Les fruits sont super tous les jours !",
  },
  "act:kid-1-2-l2-7": {
    prompt: "Associe l'aliment à sa façon de le préparer :",
    pairs: [
      {
        left: "Carotte",
        right: "Crue ou cuite",
      },
      {
        left: "Banane",
        right: "Éplucher et manger",
      },
      {
        left: "Citrouille",
        right: "Cuite ou rôtie",
      },
    ],
    explanation: "Chaque légume peut être préparé de plusieurs façons délicieuses !",
  },
  "act:kid-1-2-l2-8": {
    setup: "Dudu a goûté du brocoli pour la première fois et n'a pas trop aimé.",
    question: "Que peut-il faire ?",
    options: [
      "Renoncer aux légumes pour toujours",
      "Manger seulement des sucreries",
      "Ne plus jamais manger de légumes",
      "Goûter de nouveau un autre jour, d'une autre façon",
    ],
    explanation:
      "Notre goût change ! Goûter de nouveau, d'une façon différente, aide à découvrir si on aime.",
  },
  "act:kid-1-2-l2-9": {
    question:
      "Parfois, il faut goûter un nouvel aliment plusieurs fois avant de commencer à l'aimer. Environ combien de fois ?",
    unit: " fois",
    explanation:
      "Des études montrent que le goût peut avoir besoin d'environ 10 essais pour s'habituer à une nouvelle saveur !",
  },
  "act:kid-1-2-l2-10": {
    statement:
      "Manger des fruits et légumes de différentes façons, comme crus, cuits ou rôtis, peut aider à les aimer davantage.",
    explanation: "Exactement ! Chaque mode de préparation change le goût et la texture.",
  },
  "act:kid-1-2-l3-1": {
    title: "Le fruit entier, c'est mieux",
    body: "Un fruit entier contient des **fibres**, qui aident le ventre à fonctionner et nous rassasient. Le jus en brique contient beaucoup de sucre ajouté et peu de fibres.",
    points: [
      "Le fruit entier est meilleur que le jus",
      "Le jus en brique contient du sucre ajouté",
      "L'eau est la meilleure boisson",
    ],
    tip: "Un fruit en dessert, c'est une friandise naturelle !",
  },
  "act:kid-1-2-l3-2": {
    question: "Qu'est-ce qui est mieux pour le goûter ?",
    options: ["Soda", "Jus en brique", "Une orange entière", "Bonbon"],
    explanation: "L'orange entière contient des fibres et des vitamines.",
  },
  "act:kid-1-2-l3-3": {
    statement: "Le jus en brique contient autant de fibres que le fruit entier.",
    explanation: "Il a peu de fibres et, souvent, du sucre ajouté.",
  },
  "act:kid-1-2-l3-4": {
    question: "Que font les fibres du fruit ?",
    options: [
      "Abîment les dents",
      "Nous rassasient",
      "Aident le ventre à fonctionner",
      "Rendent le corps plus fort à l'intérieur",
    ],
    explanation: "Les fibres aident le ventre et la satiété.",
  },
  "act:kid-1-2-l3-5": {
    prompt: "Meilleur choix ou seulement de temps en temps ?",
    groups: ["Meilleur choix", "Seulement de temps en temps"],
    items: [
      "Pomme",
      "Banane",
      "Raisin",
      "Jus en brique",
      "Gelatine en sachet",
      "Bonbon aux fruits",
    ],
    explanation: "Les vrais fruits sont le meilleur choix !",
  },
  "act:kid-1-2-l3-6": {
    sentence: "La ___ des fruits aide l'intestin à bien fonctionner.",
    options: ["colle", "fibre", "peinture", "bonbon"],
    explanation: "La fibre aide le ventre.",
  },
  "act:kid-1-2-l3-7": {
    prompt: "Associe le fruit à sa façon de le manger :",
    pairs: [
      {
        left: "Orange",
        right: "Sucer les quartiers",
      },
      {
        left: "Banane",
        right: "Éplucher et manger",
      },
      {
        left: "Pastèque",
        right: "Manger en tranches",
      },
      {
        left: "Raisin",
        right: "Laver et manger à même la grappe",
      },
    ],
    explanation: "Chaque fruit a sa façon délicieuse d'être mangé !",
  },
  "act:kid-1-2-l3-8": {
    question: "Qu'est-ce qui contient LE PLUS de fibres ?",
    options: ["Jus d'orange filtré", "Orange entière", "Soda à l'orange"],
    explanation:
      "L'orange entière garde toutes les fibres. Le jus filtré en perd une bonne partie.",
  },
  "act:kid-1-2-l3-9": {
    setup: "Bia a bu un jus en brique au goûter et, peu après, avait de nouveau faim.",
    question: "Qu'est-ce qui aurait pu aider davantage à tenir la faim ?",
    options: [
      "Rien, c'était bien",
      "Boire plus de jus",
      "Manger le fruit entier",
      "Manger une sucrerie",
    ],
    explanation: "Le fruit entier a des fibres qui rassasient plus que le jus.",
  },
  "act:kid-1-2-l3-10": {
    prompt: "Tu préfères manger le fruit entier ou le boire en jus ? Pourquoi ?",
  },
  "stop:kid-1-3": {
    title: "L'Eau, la Super Boisson",
    summary: "Pourquoi l'eau est si importante et comment en boire plus.",
  },
  "act:kid-1-3-l1-1": {
    title: "L'eau, c'est la vie !",
    body: "Notre corps a besoin de **beaucoup d'eau** pour fonctionner : elle aide la digestion, la peau et garde le corps à la bonne température. Quand on a soif, le corps demande de l'eau !",
    points: [
      "Bois de l'eau toute la journée",
      "Emporte une petite bouteille à l'école",
      "Tu as beaucoup joué ? Bois plus d'eau !",
    ],
    tip: "Un corps bien hydraté a plus d'énergie pour jouer !",
  },
  "act:kid-1-3-l1-2": {
    question: "Quelle est la meilleure boisson pour étancher la soif ?",
    options: ["Lait chocolaté", "Jus en brique", "Soda", "Eau"],
    explanation: "L'eau est la meilleure amie de la soif.",
  },
  "act:kid-1-3-l1-3": {
    statement: "Après avoir beaucoup joué, le corps a besoin de plus d'eau.",
    explanation: "Exactement ! On perd de l'eau en transpirant quand on bouge.",
  },
  "act:kid-1-3-l1-4": {
    question: "Quand devons-nous boire de l'eau ?",
    options: [
      "Seulement le matin",
      "Seulement quand on est malade",
      "Toute la journée",
      "Seulement en été",
    ],
    explanation: "L'eau fait du bien à tout moment de la journée.",
  },
  "act:kid-1-3-l1-5": {
    sentence: "Quand on a ___, c'est un signe que le corps veut de l'eau.",
    options: ["soif", "envie de rire", "sommeil", "froid"],
    explanation: "La soif est l'avertissement du corps.",
  },
  "act:kid-1-3-l1-6": {
    statement: "Le soda étanche la soif aussi bien que l'eau.",
    explanation: "Le soda contient beaucoup de sucre. L'eau est toujours la meilleure.",
  },
  "act:kid-1-3-l1-7": {
    question: "Quels sont les bons moments pour boire de l'eau ?",
    options: ["Toute la journée", "Seulement si on est malade", "Le matin", "Après avoir joué"],
    explanation: "L'eau fait du bien à tout moment, et encore plus après avoir beaucoup joué !",
  },
  "act:kid-1-3-l1-8": {
    setup: "Enzo a la bouche sèche et très soif à la récré.",
    question: "Que doit-il faire ?",
    options: ["Manger un bonbon", "Rien", "Attendre d'être rentré", "Boire de l'eau"],
    explanation:
      "Avoir soif, c'est le corps qui demande de l'eau. Le mieux est de boire tout de suite !",
  },
  "act:kid-1-3-l1-9": {
    question: "Combien de verres d'eau trouves-tu bien de boire au cours d'une journée à l'école ?",
    unit: " verres",
    explanation:
      "Boire de l'eau plusieurs fois au cours de la journée, même en petites quantités, aide beaucoup !",
  },
  "act:kid-1-3-l1-10": {
    prompt: "As-tu déjà bu de l'eau aujourd'hui ? Et si tu buvais un verre maintenant ?",
  },
  "act:kid-1-3-l2-1": {
    title: "De l'eau partout",
    body: "L'eau n'est pas que dans le verre : elle est aussi dans la **pastèque, l'orange et le concombre**. Et elle est super pour les dents. Les sodas et les jus sucrés peuvent causer des caries.",
    points: [
      "La pastèque et l'orange contiennent beaucoup d'eau",
      "L'eau fait du bien aux dents",
      "Les boissons sucrées augmentent le risque de caries",
    ],
    tip: "Astuce : l'eau avec des tranches de fruits est vraiment délicieuse !",
  },
  "act:kid-1-3-l2-2": {
    prompt: "Boisson de tous les jours ou seulement de temps en temps ?",
    groups: ["Tous les jours", "Seulement de temps en temps"],
    items: [
      "Eau",
      "Eau de coco",
      "Eau avec citron sans sucre",
      "Soda",
      "Jus en brique",
      "Lait chocolaté",
    ],
    explanation:
      "L'eau est la boisson de tous les jours. Les boissons sucrées sont pour les occasions spéciales.",
  },
  "act:kid-1-3-l2-3": {
    question: "Quels aliments contiennent beaucoup d'eau ?",
    options: ["Concombre", "Toast", "Biscuit", "Orange", "Pastèque"],
    explanation: "Les fruits et les légumes nous aident à nous hydrater.",
  },
  "act:kid-1-3-l2-4": {
    prompt: "Remets dans l'ordre la journée de l'eau :",
    items: [
      "Bois un verre au réveil",
      "Emporte la petite bouteille à l'école",
      "Bois après avoir joué",
      "Bois un verre avant de dormir",
    ],
    explanation: "Comme ça, tu bois de l'eau toute la journée.",
  },
  "act:kid-1-3-l2-5": {
    statement: "Les boissons sucrées font du bien aux dents.",
    explanation: "Le sucre aide à former des caries.",
  },
  "act:kid-1-3-l2-6": {
    question: "Qu'est-ce qui est mieux pour accompagner le déjeuner ?",
    options: ["Soda", "Eau", "Boisson en poudre", "Bonbon"],
    explanation: "L'eau est la meilleure compagne des repas.",
  },
  "act:kid-1-3-l2-7": {
    prompt: "Associe le fruit à la quantité d'eau qu'il contient :",
    pairs: [
      {
        left: "Pastèque",
        right: "Beaucoup d'eau",
      },
      {
        left: "Concombre",
        right: "Beaucoup d'eau",
      },
      {
        left: "Banane",
        right: "Un peu moins d'eau",
      },
    ],
    explanation: "Les fruits qui contiennent beaucoup d'eau aident beaucoup à l'hydratation !",
  },
  "act:kid-1-3-l2-8": {
    setup: "Dans l'équipe de foot, après l'entraînement, tout le monde est en sueur et a soif.",
    question: "Qu'est-ce qui est mieux pour remplacer l'eau du corps ?",
    options: ["Jus très sucré", "Lait chocolaté", "Soda glacé", "Eau"],
    explanation:
      "Après avoir beaucoup transpiré, l'eau est toujours le meilleur choix pour remplacer ce qui a été perdu.",
  },
  "act:kid-1-3-l2-9": {
    statement: "Manger de la pastèque aide aussi à s'hydrater.",
    explanation:
      "La pastèque est presque entièrement faite d'eau, en plus d'être sucrée et délicieuse !",
  },
  "act:kid-1-3-l2-10": {
    prompt: "Quel fruit riche en eau aimes-tu le plus manger en été ?",
  },
  "act:kid-1-3-l3-1": {
    title: "Comment savoir si j'ai assez bu ?",
    body: "Une astuce est de regarder la couleur du pipi : **clair** est un signe de bonne hydratation ; **foncé** est un signe qu'il est temps de boire plus d'eau.",
    points: [
      "Clair : tout va bien",
      "Foncé : bois plus d'eau",
      "Bouche sèche et très soif : demande de l'eau",
    ],
    tip: "C'est important de surveiller ton corps !",
  },
  "act:kid-1-3-l3-2": {
    question: "Si le pipi est très foncé, que faire ?",
    options: ["Boire plus d'eau", "Boire du soda", "Ne rien faire", "Manger des bonbons"],
    explanation: "Boire de l'eau aide le corps à s'hydrater.",
  },
  "act:kid-1-3-l3-3": {
    statement: "Toutes les personnes ont besoin exactement de la même quantité d'eau.",
    explanation: "Cela dépend de l'âge, de la chaleur et des jeux.",
  },
  "act:kid-1-3-l3-4": {
    question: "Quand devons-nous boire PLUS d'eau ?",
    options: [
      "Après avoir couru",
      "Quand il fait froid et qu'on reste tranquille",
      "Par temps chaud",
      "Quand on est malade avec de la fièvre",
    ],
    explanation: "La chaleur, l'exercice et la fièvre demandent plus d'eau.",
  },
  "act:kid-1-3-l3-5": {
    prompt: "Associe la situation à ce qu'il faut faire :",
    pairs: [
      {
        left: "J'ai soif",
        right: "Boire de l'eau",
      },
      {
        left: "J'ai beaucoup joué",
        right: "Boire de l'eau et se reposer",
      },
      {
        left: "Je vais à l'école",
        right: "Emporter la petite bouteille",
      },
    ],
    explanation: "Tu sais déjà prendre soin de ton hydratation !",
  },
  "act:kid-1-3-l3-6": {
    prompt: "Ai-je besoin de boire de l'eau ?",
    groups: ["J'ai besoin d'eau", "Je suis bien hydraté"],
    items: ["Soif", "Bouche sèche", "Pipi foncé", "Pipi clair", "Pas soif", "Bouche humide"],
    explanation: "Surveille les signes de ton corps.",
  },
  "act:kid-1-3-l3-7": {
    sentence: "L'eau aide le corps à avoir plein d'___ pour jouer.",
    options: ["paresse", "saleté", "énergie", "peinture"],
    explanation: "De l'énergie ! L'eau est le carburant pour jouer.",
  },
  "act:kid-1-3-l3-8": {
    question: "Quels signes montrent que le corps est bien hydraté ?",
    options: ["Pipi très foncé", "Bouche humide", "Pipi clair", "Pas soif"],
    explanation: "Pipi clair, pas soif et bouche humide sont des signes que tout va bien !",
  },
  "act:kid-1-3-l3-9": {
    setup:
      "Après une journée très chaude à jouer dehors, Sofia a la bouche sèche et un peu mal à la tête.",
    question: "Que devrait-elle faire en premier ?",
    options: [
      "Boire de l'eau et se reposer à l'ombre",
      "Manger des chips",
      "Continuer à courir au soleil",
      "Rien, ça passera tout seul",
    ],
    explanation:
      "La bouche sèche et le mal de tête par temps chaud peuvent être un signe de déshydratation. L'eau et l'ombre aident beaucoup !",
  },
  "act:kid-1-3-l3-10": {
    prompt: "Qu'est-ce qui t'aide à penser à boire de l'eau tout au long de la journée ?",
  },
  "trail:kid-corpo": {
    title: "Corps Fort et Heureux",
    tagline: "Routine, dents et hygiène",
    description:
      "Apprends à manger calmement, à prendre soin de tes dents et à garder tes mains et ta nourriture propres.",
  },
  "unit:kid-unit-2": {
    title: "Prendre Soin de Moi",
    description: "Petit-déjeuner, mastication et hygiène.",
  },
  "stop:kid-2-1": {
    title: "Petit-déjeuner de Champion",
    summary: "Commence la journée avec de l'énergie et apprends à composer des goûters solides.",
  },
  "act:kid-2-1-l1-1": {
    title: "Le premier carburant de la journée",
    body: "Pendant la nuit, le corps passe de nombreuses heures sans manger. Le **petit-déjeuner** donne de l'énergie pour étudier, jouer et être attentif.",
    points: [
      "Fruit, pain complet, œuf ou yaourt",
      "Lait ou eau à boire",
      "Mange quelque chose avant de quitter la maison",
    ],
    tip: "Un bon petit-déjeuner aide à l'école !",
  },
  "act:kid-2-1-l1-2": {
    question: "Quel est un petit-déjeuner solide et délicieux ?",
    options: [
      "Rien",
      "Pain complet avec œuf et fruit",
      "Seulement du soda",
      "Seulement des bonbons",
    ],
    explanation: "De l'énergie, des protéines et un fruit : un petit-déjeuner de champion !",
  },
  "act:kid-2-1-l1-3": {
    statement: "Sauter le petit-déjeuner aide à avoir plus d'énergie.",
    explanation: "Sans petit-déjeuner, le corps n'a plus de carburant.",
  },
  "act:kid-2-1-l1-4": {
    prompt: "Associe l'aliment à ce qu'il apporte :",
    pairs: [
      {
        left: "Fruit",
        right: "Vitamines",
      },
      {
        left: "Œuf",
        right: "Protéines",
      },
      {
        left: "Pain complet",
        right: "Énergie",
      },
      {
        left: "Lait",
        right: "Calcium pour les os",
      },
    ],
    explanation: "Chaque aliment a sa mission !",
  },
  "act:kid-2-1-l1-5": {
    sentence: "Le petit-déjeuner est le premier ___ de la journée.",
    options: ["cours", "repas", "jeu", "sieste"],
    explanation: "Repas ! C'est l'heure de recharger.",
  },
  "act:kid-2-1-l1-6": {
    question: "Quelle boisson va avec le petit-déjeuner ?",
    options: ["Lait ou eau", "Jus en poudre", "Soda", "Soda au guarana"],
    explanation: "Le lait et l'eau sont de très bons compagnons.",
  },
  "act:kid-2-1-l1-7": {
    question: "Qu'est-ce qui va dans un petit-déjeuner de champion ?",
    options: ["Bonbon", "Pain complet", "Œuf", "Fruit"],
    explanation: "Le fruit, l'œuf et le pain complet donnent une vraie énergie pour la journée.",
  },
  "act:kid-2-1-l1-8": {
    setup: "Théo s'est réveillé en retard et veut sortir de la maison sans rien manger.",
    question: "Que serait-il mieux qu'il fasse ?",
    options: [
      "Sortir sans rien manger",
      "Manger seulement des bonbons en chemin",
      "Manger quelque chose de rapide, comme un fruit avec du pain",
      "Boire du soda",
    ],
    explanation:
      "Même rapide, un petit goûter avec un fruit et du pain donne de l'énergie pour bien commencer la journée.",
  },
  "act:kid-2-1-l1-9": {
    prompt: "Remets dans l'ordre une matinée de champion :",
    items: [
      "Se réveiller et se laver le visage",
      "Prendre un petit-déjeuner complet",
      "Se brosser les dents",
      "Aller à l'école avec de l'énergie",
    ],
    explanation: "Comme ça, la journée commence en force !",
  },
  "act:kid-2-1-l1-10": {
    prompt: "Qu'est-ce que tu aimes le plus manger au petit-déjeuner ?",
  },
  "act:kid-2-1-l2-1": {
    title: "Composer un petit-déjeuner",
    body: "Choisis **énergie + protéines + fruit** : comme ça, tu gardes de l'énergie plus longtemps.",
    points: [
      "Énergie : pain complet, avoine, tapioca",
      "Protéines : œuf, fromage, yaourt",
      "Fruit : banane, papaye, orange",
    ],
    tip: "Les céréales très sucrées donnent une énergie rapide, mais qui passe vite.",
  },
  "act:kid-2-1-l2-2": {
    prompt: "Super choix ou seulement de temps en temps ?",
    groups: ["Super choix", "Seulement de temps en temps"],
    items: [
      "Fruit",
      "Œuf",
      "Pain complet",
      "Biscuit fourré",
      "Céréales très sucrées",
      "Gâteau industriel",
    ],
    explanation: "Les aliments entiers donnent de l'énergie plus longtemps.",
  },
  "act:kid-2-1-l2-3": {
    prompt: "Organise l'heure du petit-déjeuner :",
    items: ["Lave-toi les mains", "Assieds-toi à table", "Mange calmement", "Brosse-toi les dents"],
    explanation: "Une routine délicieuse et saine !",
  },
  "act:kid-2-1-l2-4": {
    question: "Qu'est-ce qui va bien au petit-déjeuner ?",
    options: ["Yaourt nature", "Banane", "Bonbon", "Soda", "Œuf brouillé"],
    explanation: "La banane, l'œuf et le yaourt sont super.",
  },
  "act:kid-2-1-l2-5": {
    statement: "Le yaourt et les fruits peuvent faire un bon petit-déjeuner.",
    explanation: "Exactement ! C'est délicieux et nutritif.",
  },
  "act:kid-2-1-l2-6": {
    sentence: "Le pain ___ est un bon choix parce qu'il contient des fibres.",
    options: ["de bonbon", "frit", "sucré", "complet"],
    explanation: "Le pain complet a plus de fibres.",
  },
  "act:kid-2-1-l2-7": {
    prompt: "Associe l'aliment au groupe du petit-déjeuner :",
    pairs: [
      {
        left: "Œuf",
        right: "Protéines",
      },
      {
        left: "Banane",
        right: "Fruit",
      },
      {
        left: "Avoine",
        right: "Énergie",
      },
    ],
    explanation: "Un petit-déjeuner complet réunit les trois groupes !",
  },
  "act:kid-2-1-l2-8": {
    setup:
      "Au petit-déjeuner, Ana a seulement bu un verre de jus très sucré et est partie en courant.",
    question: "Qu'est-ce qui manquait pour rendre son petit-déjeuner plus complet ?",
    options: [
      "Plus de sucre dans le jus",
      "Seulement plus de jus",
      "Une protéine, comme un œuf ou du fromage, et quelque chose pour l'énergie",
      "Rien, c'est super",
    ],
    explanation:
      "Le jus seul donne faim vite. Les protéines et l'énergie aident à tenir jusqu'au goûter.",
  },
  "act:kid-2-1-l2-9": {
    statement: "Les céréales très sucrées donnent une énergie qui passe vite.",
    explanation:
      "Le sucre donne de l'énergie rapide, mais elle s'épuise vite, ramenant la faim tôt.",
  },
  "act:kid-2-1-l2-10": {
    prompt:
      "Si tu pouvais composer le petit-déjeuner de tes rêves (mais sain), que mettrais-tu dedans ?",
  },
  "act:kid-2-1-l3-1": {
    title: "Goûter de l'école",
    body: "Le goûter doit **tenir la faim** jusqu'au déjeuner. Un fruit, un yaourt nature et un sandwich au pain complet sont d'excellentes idées.",
    points: [
      "Fruit et eau",
      "Sandwich au pain complet avec du fromage",
      "Évite les biscuits fourrés tous les jours",
    ],
    tip: "Un bon goûter donne de l'énergie jusqu'à l'heure de jouer !",
  },
  "act:kid-2-1-l3-2": {
    question: "Quel goûter choisir pour emporter à l'école ?",
    options: [
      "Chips et soda",
      "Bonbons et chewing-gum",
      "Biscuits fourrés",
      "Sandwich au pain complet et fruit",
    ],
    explanation: "Un goûter complet te donne de l'énergie.",
  },
  "act:kid-2-1-l3-3": {
    question: "Quels sont les bons goûters ?",
    options: ["Chips", "Yaourt nature", "Sandwich complet", "Banane"],
    explanation: "Les fruits, le yaourt et le sandwich complet sont super.",
  },
  "act:kid-2-1-l3-4": {
    statement: "On peut emporter des fruits dans la boîte à goûter.",
    explanation: "Bien sûr ! Lave-les avant de les ranger.",
  },
  "act:kid-2-1-l3-5": {
    prompt: "Goûter malin ou goûter de fête ?",
    groups: ["Goûter malin", "Goûter de fête"],
    items: ["Banane", "Yaourt", "Sandwich complet", "Chips", "Soda", "Gâteau fourré"],
    explanation: "La fête est délicieuse aussi, mais le quotidien demande des aliments entiers.",
  },
  "act:kid-2-1-l3-6": {
    prompt: "Associe l'aliment à l'astuce :",
    pairs: [
      {
        left: "Fruit",
        right: "Lave-le avant",
      },
      {
        left: "Sandwich",
        right: "Range-le dans la boîte à goûter",
      },
      {
        left: "Eau",
        right: "Emporte-la dans la petite bouteille",
      },
    ],
    explanation: "Tu sais déjà préparer la boîte à goûter !",
  },
  "act:kid-2-1-l3-7": {
    sentence: "Un goûter malin aide à avoir de l'___ pour les cours.",
    options: ["énergie", "sommeil", "faim", "paresse"],
    explanation: "De l'énergie pour apprendre et jouer.",
  },
  "act:kid-2-1-l3-8": {
    question: "Quelles sont de bonnes options de goûter à emporter dans la boîte à goûter ?",
    options: ["Fruit", "Yaourt nature", "Chips", "Sandwich complet"],
    explanation: "Le fruit, le sandwich complet et le yaourt sont des goûters malins et délicieux.",
  },
  "act:kid-2-1-l3-9": {
    setup:
      "À l'heure du goûter, les amis de Pedro mangent des chips, et il a envie de manger pareil tous les jours.",
    question: "Que peut-il faire ?",
    options: [
      "Être triste et ne pas goûter",
      "Ne rien manger",
      "Manger son goûter sain la plupart des jours, et des chips parfois",
      "Manger des chips tous les jours aussi",
    ],
    explanation:
      "Il n'y a rien à interdire, mais le goûter malin peut être celui de tous les jours, et les chips, de temps en temps.",
  },
  "act:kid-2-1-l3-10": {
    prompt: "Que pourrais-tu apporter comme goûter malin à l'école cette semaine ?",
  },
  "stop:kid-2-2": {
    title: "Mâcher Calmement",
    summary: "Manger lentement, écouter son ventre et prendre soin de ses dents.",
  },
  "act:kid-2-2-l1-1": {
    title: "Mâcher, c'est commencer la digestion",
    body: "La digestion commence dans la **bouche** ! Quand on mâche bien, la nourriture devient de petits morceaux et le corps en profite mieux. Manger lentement laisse aussi au ventre le temps de dire qu'on est rassasié.",
    points: [
      "Mâche bien avant d'avaler",
      "Mange sans te presser",
      "Arrête-toi quand le ventre le dit",
    ],
    tip: "Le ventre met environ 20 minutes à dire qu'il est plein.",
  },
  "act:kid-2-2-l1-2": {
    question: "Où commence la digestion ?",
    options: ["Dans la bouche", "Dans les cheveux", "Dans l'œil", "Dans le pied"],
    explanation: "Dans la bouche, avec la mastication !",
  },
  "act:kid-2-2-l1-3": {
    statement: "Manger très vite est excellent pour le corps.",
    explanation: "Manger vite gêne la digestion et le signal du ventre.",
  },
  "act:kid-2-2-l1-4": {
    sentence: "Pour bien manger, nous devons bien ___ la nourriture.",
    options: ["cacher", "mâcher", "jeter", "avaler"],
    explanation: "Bien mâcher est la première étape.",
  },
  "act:kid-2-2-l1-5": {
    question: "Qu'est-ce qui aide à manger calmement ?",
    options: [
      "Manger debout",
      "Regarder la télé très fort",
      "S'asseoir à table",
      "Courir avec son assiette",
    ],
    explanation: "S'asseoir à table aide à faire attention.",
  },
  "act:kid-2-2-l1-6": {
    statement: "Parler et sourire à table aide à manger lentement.",
    explanation: "Un repas joyeux est un repas calme.",
  },
  "act:kid-2-2-l1-7": {
    question: "Qu'est-ce qui aide à manger calmement ?",
    options: ["Parler tranquillement", "Courir en mangeant", "Bien mâcher", "S'asseoir à table"],
    explanation:
      "Bien mâcher, s'asseoir à table et parler tranquillement aident à manger calmement.",
  },
  "act:kid-2-2-l1-8": {
    setup: "À l'heure du déjeuner, Duda avale sa nourriture en courant pour aller vite jouer.",
    question: "Que pourrait-elle faire autrement ?",
    options: [
      "Manger encore plus vite",
      "Manger calmement, en mâchant bien",
      "Ne pas déjeuner",
      "Manger en marchant",
    ],
    explanation: "Manger calmement aide la digestion et à percevoir quand elle est rassasiée.",
  },
  "act:kid-2-2-l1-9": {
    prompt: "Remets dans l'ordre une bouchée prise calmement :",
    items: [
      "Mets une petite portion dans la bouche",
      "Mâche très lentement",
      "Perçois la saveur",
      "Avale et respire avant la suivante",
    ],
    explanation: "Doucement mais sûrement : comme ça, le repas est meilleur.",
  },
  "act:kid-2-2-l1-10": {
    prompt:
      "Manges-tu plutôt vite ou lentement ? Qu'est-ce qui pourrait t'aider à manger plus calmement ?",
  },
  "act:kid-2-2-l2-1": {
    title: "Le ventre nous prévient",
    body: "Quand on mange, le ventre envoie un message : **je suis rassasié**. Écouter ce message, c'est super ! Si tu as encore faim, tu peux en reprendre ; si tu es plein, tu peux t'arrêter.",
    points: [
      "Faim : ventre qui gargouille",
      "Rassasié : plus envie d'en manger",
      "Trop plein : ventre serré",
    ],
    tip: "Tu n'as pas besoin de tout finir si tu es déjà rassasié !",
  },
  "act:kid-2-2-l2-2": {
    prompt: "Associe le signal à ce qu'il veut dire :",
    pairs: [
      {
        left: "Ventre qui gargouille",
        right: "J'ai faim",
      },
      {
        left: "Plus envie d'en manger",
        right: "Je suis rassasié",
      },
      {
        left: "Ventre serré",
        right: "J'ai trop mangé",
      },
    ],
    explanation: "Tu sais déjà écouter ton ventre !",
  },
  "act:kid-2-2-l2-3": {
    prompt: "Mets dans l'ordre un repas calme :",
    items: [
      "Assieds-toi à table",
      "Mets une petite portion",
      "Mâche lentement",
      "Écoute ton ventre avant d'en reprendre",
    ],
    explanation: "Comme ça, tu manges au rythme de ton corps.",
  },
  "act:kid-2-2-l2-4": {
    question: "Qu'est-ce qui gêne pour manger calmement ?",
    options: [
      "Regarder la télé en mangeant",
      "Courir",
      "S'asseoir à table",
      "Jouer pendant le repas",
    ],
    explanation: "Les distractions gênent la perception du ventre.",
  },
  "act:kid-2-2-l2-5": {
    statement: "On peut arrêter de manger quand on est rassasié.",
    explanation: "Bien sûr ! Le corps sait ce dont il a besoin.",
  },
  "act:kid-2-2-l2-6": {
    prompt: "Ça aide ou ça gêne ?",
    groups: ["Aide à manger calmement", "Gêne"],
    items: [
      "Mâcher lentement",
      "S'asseoir à table",
      "Bavarder",
      "Manger en courant",
      "Manger avec la tablette",
      "Avaler sans mâcher",
    ],
    explanation: "L'attention et le calme font du bien à la digestion.",
  },
  "act:kid-2-2-l2-7": {
    sentence: "Quand je suis ___, c'est l'heure d'arrêter de manger.",
    options: ["en retard", "endormi", "sale", "rassasié"],
    explanation: "Rassasié, c'est quand le corps dit « ça suffit ».",
  },
  "act:kid-2-2-l2-8": {
    prompt: "Associe le signal du ventre à ce qu'il faut faire :",
    pairs: [
      {
        left: "Ventre rassasié",
        right: "Je peux arrêter",
      },
      {
        left: "Encore faim",
        right: "Je peux en reprendre un peu",
      },
    ],
    explanation: "Écouter son ventre est une compétence qui s'entraîne !",
  },
  "act:kid-2-2-l2-9": {
    setup:
      "Gui est déjà rassasié, mais il reste de la nourriture dans son assiette et il pense qu'il doit tout finir.",
    question: "Que peut-il faire ?",
    options: [
      "Écouter son ventre et s'arrêter quand il est rassasié",
      "Tout manger même s'il est plein",
      "Ne jamais arrêter de manger",
      "Manger jusqu'à se sentir mal",
    ],
    explanation:
      "Ce n'est pas grave de laisser de la nourriture dans l'assiette quand on est déjà rassasié.",
  },
  "act:kid-2-2-l2-10": {
    statement: "Il faut toujours finir tout ce qu'il y a dans l'assiette, même rassasié.",
    explanation: "Écouter son ventre est plus important que de finir toute l'assiette.",
  },
  "act:kid-2-2-l3-1": {
    title: "Prendre soin de ses dents",
    body: "Après avoir mangé, se brosser les dents enlève les petits restes de nourriture qui causent des **caries**. Brosse-toi les dents au moins **deux fois par jour**, avec l'aide d'un adulte si besoin.",
    points: [
      "Brosse-toi les dents le matin et avant de dormir",
      "Utilise du dentifrice au fluor, en petite quantité",
      "Les sucreries collantes demandent un brossage en plus",
    ],
    tip: "Un sourire en bonne santé commence par le brossage !",
  },
  "act:kid-2-2-l3-2": {
    question: "Combien de fois faut-il se brosser les dents par jour, au minimum ?",
    options: ["Aucune", "Deux fois", "Seulement quand ça fait mal", "Une fois par semaine"],
    explanation: "Le matin et le soir, avant de dormir.",
  },
  "act:kid-2-2-l3-3": {
    statement:
      "Les sucreries collantes aident à former des caries si on ne se brosse pas les dents.",
    explanation: "Les petits restes de sucreries nourrissent les bactéries qui abîment les dents.",
  },
  "act:kid-2-2-l3-4": {
    prompt: "Mets le brossage dans l'ordre :",
    items: [
      "Mets un tout petit peu de dentifrice",
      "Brosse toutes tes petites dents",
      "Brosse ta langue",
      "Rince-toi la bouche",
    ],
    explanation: "Tout brosser, sans se presser !",
  },
  "act:kid-2-2-l3-5": {
    question: "Qu'est-ce qui fait du bien aux dents ?",
    options: [
      "Boire du soda à tout moment",
      "Se brosser les dents",
      "Manger des fruits et légumes croquants",
      "De l'eau",
    ],
    explanation: "L'eau, la brosse à dents et les aliments croquants aident.",
  },
  "act:kid-2-2-l3-6": {
    prompt: "Bon pour les dents ou seulement de temps en temps ?",
    groups: ["Bon pour les dents", "Seulement de temps en temps"],
    items: ["Eau", "Carotte crue", "Pomme", "Bonbon", "Soda", "Sucette"],
    explanation: "Les sucreries sont pour les jours de fête, et toujours avec un brossage ensuite.",
  },
  "act:kid-2-2-l3-7": {
    prompt: "Associe l'habitude à la raison :",
    pairs: [
      {
        left: "Se brosser les dents",
        right: "Enlève les restes de nourriture",
      },
      {
        left: "Fil dentaire",
        right: "Nettoie entre les dents",
      },
      {
        left: "Aller chez le dentiste",
        right: "Prend soin de ton sourire",
      },
    ],
    explanation: "Tu sais déjà prendre soin de ton sourire !",
  },
  "act:kid-2-2-l3-8": {
    question: "Qu'est-ce qui aide à bien prendre soin de ses dents ?",
    options: [
      "Utiliser du fil dentaire",
      "Manger des sucreries toute la journée sans se brosser les dents",
      "Aller chez le dentiste",
      "Se brosser les dents le matin et le soir",
    ],
    explanation:
      "Bien se brosser les dents, utiliser du fil dentaire et aller chez le dentiste gardent le sourire en bonne santé.",
  },
  "act:kid-2-2-l3-9": {
    setup:
      "Après avoir mangé une sucrerie collante à la fête, Vitor est allé directement jouer sans se brosser les dents.",
    question: "Qu'aurait-il dû faire ?",
    options: [
      "Se brosser les dents après la sucrerie",
      "Seulement se rincer la bouche avec du soda",
      "Manger plus de sucreries",
      "Ne rien faire",
    ],
    explanation:
      "Les sucreries collantes demandent un brossage en plus, pour ne pas laisser de restes sur les dents.",
  },
  "act:kid-2-2-l3-10": {
    prompt: "Penses-tu à te brosser les dents le matin et le soir tous les jours ?",
  },
  "stop:kid-2-3": {
    title: "Mains Propres, Nourriture Sûre",
    summary:
      "Comment se laver les mains et prendre soin des aliments pour éviter les maux de ventre.",
  },
  "act:kid-2-3-l1-1": {
    title: "Pourquoi se laver les mains ?",
    body: "Sur les mains restent des **germes** invisibles qui peuvent donner mal au ventre. Se les laver avec de l'eau et du savon avant de manger et après être allé aux toilettes te protège, toi et ta famille.",
    points: [
      "Avant de manger",
      "Après être allé aux toilettes",
      "Après avoir joué dehors ou avec des animaux",
    ],
    tip: "Chanter « Joyeux anniversaire » deux fois donne le bon temps pour se laver !",
  },
  "act:kid-2-3-l1-2": {
    question: "Quand devons-nous nous laver les mains ?",
    options: [
      "Avant de manger",
      "Jamais",
      "Seulement le dimanche",
      "Seulement si elles sont noires",
    ],
    explanation: "Avant de manger, toujours !",
  },
  "act:kid-2-3-l1-3": {
    statement: "L'eau et le savon sont importants pour se laver les mains.",
    explanation: "Le savon aide à éliminer les germes.",
  },
  "act:kid-2-3-l1-4": {
    sentence: "On se lave les mains avec de l'eau et du ___.",
    options: ["jus", "terre", "peinture", "savon"],
    explanation: "Du savon, bien sûr !",
  },
  "act:kid-2-3-l1-5": {
    statement: "On n'a besoin de se laver les mains que si elles sont visiblement sales.",
    explanation: "Les germes sont invisibles. Lave-toi toujours les mains aux bons moments.",
  },
  "act:kid-2-3-l1-6": {
    question: "Que peuvent causer les germes ?",
    options: ["Mal au ventre", "Des super-pouvoirs", "Un bon sommeil", "Des cheveux colorés"],
    explanation: "C'est pour ça qu'on se lave les mains !",
  },
  "act:kid-2-3-l1-7": {
    question: "Quand devons-nous nous laver les mains ?",
    options: [
      "Avant de manger",
      "Après les toilettes",
      "Jamais",
      "Après avoir joué avec de la terre",
    ],
    explanation:
      "Avant de manger, après les toilettes et après avoir touché de la terre : toujours se laver !",
  },
  "act:kid-2-3-l1-8": {
    setup: "Rafa a joué au parc avec de la terre et du sable, et maintenant il va déjeuner.",
    question: "Que doit-il faire avant de manger ?",
    options: [
      "Rien, la terre ne fait pas de mal",
      "Juste les essuyer sur ses vêtements",
      "Se laver soigneusement les mains avec de l'eau et du savon",
      "S'asseoir et manger directement",
    ],
    explanation:
      "La terre peut contenir des germes invisibles. Se laver les mains avant de manger est toujours important.",
  },
  "act:kid-2-3-l1-9": {
    prompt: "Remets dans l'ordre comment bien se laver les mains :",
    items: [
      "Mouille tes mains",
      "Mets du savon",
      "Frotte bien, y compris entre les doigts",
      "Rince et sèche",
    ],
    explanation: "Comme ça, les mains sont vraiment propres !",
  },
  "act:kid-2-3-l1-10": {
    prompt: "Penses-tu à te laver les mains avant tous les repas ?",
  },
  "act:kid-2-3-l2-1": {
    title: "Se laver les mains en 4 étapes",
    body: "Mouille, savonne, frotte pendant **20 secondes**, rince et sèche avec une serviette propre. Frotte les paumes, le dos des mains, entre les doigts et les ongles.",
    points: ["Mouille tes mains", "Savonne bien", "Frotte pendant 20 secondes", "Rince et sèche"],
    tip: "Les petits coins entre les doigts cachent des germes !",
  },
  "act:kid-2-3-l2-2": {
    prompt: "Remets dans l'ordre les étapes pour se laver les mains :",
    items: ["Mouille tes mains", "Mets du savon", "Frotte pendant 20 secondes", "Rince et sèche"],
    explanation: "Comme ça, les mains sont bien propres !",
  },
  "act:kid-2-3-l2-3": {
    question: "À quels moments se laver les mains ?",
    options: [
      "Avant de regarder des dessins animés",
      "Avant de manger",
      "Après avoir joué avec de la terre",
      "Après les toilettes",
    ],
    explanation: "Manger, les toilettes et la terre sont les moments importants.",
  },
  "act:kid-2-3-l2-4": {
    statement: "Sécher ses mains avec une serviette propre fait partie du bon lavage.",
    explanation: "Les mains mouillées répandent plus de germes.",
  },
  "act:kid-2-3-l2-5": {
    prompt: "Ai-je besoin de me laver les mains ?",
    groups: ["Besoin de me laver", "Pas besoin maintenant"],
    items: [
      "Avant le goûter",
      "Après les toilettes",
      "Après avoir joué avec de la terre",
      "En regardant des dessins animés",
      "En lisant un livre",
      "Assis sur le canapé",
    ],
    explanation: "Lave-toi toujours les mains avant de manger et après t'être sali.",
  },
  "act:kid-2-3-l2-6": {
    prompt: "Associe le moment au soin :",
    pairs: [
      {
        left: "Je vais manger",
        right: "Me laver les mains",
      },
      {
        left: "J'ai joué avec de la terre",
        right: "Me laver les mains et les ongles",
      },
      {
        left: "Je suis allé aux toilettes",
        right: "Me laver avec du savon",
      },
    ],
    explanation: "Super ! Tu es déjà un expert en hygiène.",
  },
  "act:kid-2-3-l2-7": {
    prompt: "Associe le moment au bon soin :",
    pairs: [
      {
        left: "Avant de manger",
        right: "Me laver les mains",
      },
      {
        left: "Après le parc",
        right: "Me laver les mains et les ongles",
      },
      {
        left: "Après les toilettes",
        right: "Me laver avec du savon",
      },
    ],
    explanation: "Chaque moment demande le même soin : de l'eau et du savon !",
  },
  "act:kid-2-3-l2-8": {
    setup:
      "À l'heure du goûter, les amis de Lara sont allés directement manger sans se laver les mains.",
    question: "Que peut faire Lara ?",
    options: [
      "Ne rien manger",
      "Se laver les mains avant de manger, même si ses amis ne se les lavent pas",
      "Faire pareil et ne pas se laver",
      "Ne manger que la moitié du goûter",
    ],
    explanation: "Chacun s'occupe de sa propre hygiène, même si les amis font autrement.",
  },
  "act:kid-2-3-l2-9": {
    statement:
      "Les germes sont si petits qu'on ne peut pas les voir, mais ils peuvent nous rendre malades.",
    explanation:
      "Comme ils sont invisibles, on se lave toujours les mains, même quand elles semblent propres.",
  },
  "act:kid-2-3-l2-10": {
    prompt: "Combien de fois par jour te laves-tu les mains ? À quels moments ?",
  },
  "act:kid-2-3-l3-1": {
    title: "Nourriture sûre",
    body: "En plus des mains, les aliments ont aussi besoin de soin : **laver les fruits et les verdures**, ranger au réfrigérateur ce qui se gâte et ne pas manger de nourriture qui a une odeur ou un aspect bizarre.",
    points: [
      "Lave les fruits et les verdures",
      "Range au réfrigérateur ce qui se gâte",
      "Odeur ou goût bizarre ? Préviens un adulte",
    ],
    tip: "Si la nourriture a l'air bizarre, ne la mange pas. Appelle un adulte !",
  },
  "act:kid-2-3-l3-2": {
    question: "Que faire avec un fruit avant de le manger ?",
    options: ["Le jeter par terre", "Le peindre", "Rien", "Le laver"],
    explanation: "Laver enlève la saleté et les germes.",
  },
  "act:kid-2-3-l3-3": {
    statement: "Une nourriture à l'odeur bizarre peut être avariée.",
    explanation: "Ne la mange pas et préviens un adulte !",
  },
  "act:kid-2-3-l3-4": {
    prompt: "Mets dans l'ordre le soin du fruit :",
    items: ["Lave-toi les mains", "Lave le fruit", "Sèche-le", "Mange-le"],
    explanation: "D'abord les mains, ensuite le fruit !",
  },
  "act:kid-2-3-l3-5": {
    question: "Qu'est-ce qui doit rester au réfrigérateur ?",
    options: ["Yaourt", "Pain sec", "Lait", "Fruits coupés"],
    explanation: "Les aliments qui se gâtent vite restent au réfrigérateur.",
  },
  "act:kid-2-3-l3-6": {
    prompt: "Réfrigérateur ou peut rester dehors ?",
    groups: ["Au réfrigérateur", "Peut rester dehors"],
    items: ["Lait", "Yaourt", "Viande", "Banane", "Riz cru", "Pâtes sèches"],
    explanation: "Les aliments frais et les produits laitiers demandent le réfrigérateur.",
  },
  "act:kid-2-3-l3-7": {
    prompt: "Associe le soin à la raison :",
    pairs: [
      {
        left: "Laver les fruits",
        right: "Enlève la saleté et les germes",
      },
      {
        left: "Ranger au réfrigérateur",
        right: "Se conserve mieux",
      },
      {
        left: "Prévenir un adulte",
        right: "Aide à rester en sécurité",
      },
    ],
    explanation: "Tu es un gardien des aliments !",
  },
  "act:kid-2-3-l3-8": {
    question: "Qu'est-ce qui aide à garder la nourriture sûre ?",
    options: [
      "Ranger les aliments périssables au réfrigérateur",
      "Prévenir un adulte si quelque chose semble louche",
      "Laver les fruits et les verdures",
      "Manger de la nourriture à l'odeur bizarre",
    ],
    explanation: "Laver, bien ranger et prévenir un adulte sont les bons gestes.",
  },
  "act:kid-2-3-l3-9": {
    setup: "Marina a trouvé un morceau de fromage oublié hors du réfrigérateur depuis deux jours.",
    question: "Que doit-elle faire ?",
    options: [
      "Ne pas le manger et prévenir un adulte",
      "Le manger quand même",
      "Juste le sentir et le manger si elle ne sent rien",
      "Le donner au chien",
    ],
    explanation:
      "Un aliment laissé longtemps hors du réfrigérateur peut se gâter sans en avoir l'air. Le mieux est de prévenir un adulte.",
  },
  "act:kid-2-3-l3-10": {
    prompt:
      "Que ferais-tu si tu trouvais de la nourriture à l'odeur bizarre dans le réfrigérateur ?",
  },
};

export default content;

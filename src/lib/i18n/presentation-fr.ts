import type { PresentationCopy } from "./presentation";

const fr: PresentationCopy = {
  meta: {
    title: "Présentation — NutriConnect",
    description:
      "Découvrez NutriConnect : le problème que nous résolvons, nos atouts, nos personas, nos concurrents et une visite de la plateforme.",
  },
  ui: {
    skip: "Passer la présentation",
    prev: "Diapositive précédente",
    next: "Diapositive suivante",
    slideOf: "{n} sur {total}",
    exportPdf: "Télécharger le PDF",
    fullscreen: "Plein écran",
    language: "Langue",
    source: "Source",
    keyboardHint: "Utilisez les flèches du clavier ou balayez pour naviguer",
    goTo: "Aller à la diapositive",
    ninaSays: "Nutri Nina dit",
    flipHint: "Touchez pour retourner",
  },
  sections: {
    intro: "Introduction",
    problem: "Le problème",
    market: "Marché",
    learning: "Apprentissage",
    tour: "Visite de la plateforme",
    join: "Rejoignez-nous",
  },
  cover: {
    eyebrow: "Projet Transforme-se · Serasa",
    title: "Un réseau social sur",
    highlight: "l'alimentation",
    subtitle:
      "Communauté, éducation et professionnels vérifiés au même endroit, pour mieux manger sans culpabilité et bien entouré.",
    start: "Commencer la présentation",
    nina: "Salut ! Je suis Nutri Nina et je serai votre guide. On y va ?",
  },
  problem: {
    barPro: "Médecins et nutritionnistes",
    barWeb: "Internet",
    eyebrow: "Le problème",
    title: "Bien manger au Brésil est difficile et solitaire",
    intro:
      "Tout le monde veut mieux manger, mais les outils actuels laissent les gens seuls, mal informés ou démotivés.",
    nina: "Ces chiffres montrent pourquoi nous avons créé NutriConnect.",
    items: [
      {
        title: "Désinformation nutritionnelle",
        stat: "68 %",
        statLabel:
          "des vidéos de nutrition analysées sur TikTok et Instagram étaient trompeuses ou fausses",
        text: "Les régimes miracles deviennent viraux plus vite que la science, et ceux qui cherchent de l'aide ne savent pas à qui se fier.",
        source: "Journal of Technology in Behavioral Science, 2025 (300 vidéos)",
      },
      {
        title: "Seul face au changement",
        stat: "61,4 %",
        statLabel: "des adultes des capitales brésiliennes sont en surpoids",
        text: "C'est un défi partagé par la majorité, mais chacun l'affronte seul et beaucoup abandonnent en chemin.",
        source: "Vigitel 2023 · Ministère brésilien de la Santé",
      },
      {
        title: "Manque d'habitude et de motivation",
        stat: "1 sur 5",
        statLabel: "adultes consomme la quantité recommandée de fruits et légumes",
        text: "Les applis de régime se concentrent sur le comptage des calories et ne créent ni habitudes durables ni engagement.",
        source: "Vigitel 2023 · Ministère brésilien de la Santé",
      },
      {
        title: "Nutritionniste trop cher",
        stat: "18 %",
        statLabel:
          "s'informent sur l'alimentation auprès de médecins ou nutritionnistes ; 40 % via internet",
        text: "Une éducation alimentaire de qualité n'atteint pas encore ceux qui ne peuvent pas payer des consultations.",
        source: "Fiesp, 2017 (via Agência Brasil)",
      },
    ],
  },
  solution: {
    eyebrow: "Notre solution",
    title: "NutriConnect : apprendre à mieux manger, ensemble",
    text: "Un réseau social chaleureux où l'on partage recettes et expériences, où l'on apprend grâce à des parcours ludiques et où l'on peut compter sur des professionnels vérifiés.",
    nina: "Imaginez un réseau social qui vous apprend et vous soutient en même temps. C'est nous !",
    pillars: [
      {
        title: "Communauté",
        text: "Fil, communautés thématiques et défis pour que personne ne change ses habitudes seul.",
      },
      {
        title: "Éducation",
        text: "Des parcours d'apprentissage courts et amusants, pour adultes et enfants.",
      },
      {
        title: "Confiance",
        text: "Des nutritionnistes à l'inscription (CRN) vérifiée, avec un badge professionnel.",
      },
    ],
  },
  differentials: {
    eyebrow: "Nos atouts",
    title: "Ce qui nous rend différents",
    nina: "Ce n'est pas un compteur de calories de plus. C'est un endroit où l'on se sent chez soi.",
    items: [
      {
        title: "Réseau social + éducation",
        text: "Nous associons l'échange d'un réseau social à des parcours d'apprentissage, ce que les concurrents proposent séparément.",
      },
      {
        title: "Contenu vérifié",
        text: "Les professionnels passent par une vérification du CRN et reçoivent un badge, et le fil a un onglet rien que pour eux.",
      },
      {
        title: "Gamification",
        text: "Des niveaux de Graine à Maître, des séries, de l'XP, des étapes dorées, des défis et le thème de la semaine.",
      },
      {
        title: "Accueil et inclusion",
        text: "Sans culpabilité ni jugement, en 4 langues, avec des profils enfants et une personnalisation visuelle complète.",
      },
    ],
  },
  personas: {
    eyebrow: "Personas",
    userTitle: "Celle qui veut mieux manger",
    proTitle: "Celui qui enseigne à mieux manger",
    ninaUser: "Voici Juliana. Elle représente ceux qui ont le plus besoin de notre communauté.",
    ninaPro: "Et voici Rafael, l'autre côté du réseau : celui qui apporte une vraie information.",
    painsLabel: "Difficultés",
    goalsLabel: "Objectifs",
    digitalLabel: "Comportement numérique",
    helpsLabel: "Comment NutriConnect aide",
    ageSuffix: "ans",
    verifiedStamp: "CRN vérifié",
    user: {
      name: "Juliana Martins",
      age: "28",
      role: "Analyste administrative",
      city: "São Paulo (SP)",
      quote: "Je sais que je dois changer, mais je n'y arrive pas seule.",
      bio: "Assise toute la journée, elle déjeune à la hâte et commande à emporter le soir. Elle a essayé trois régimes trouvés sur internet et les a tous abandonnés.",
      pains: [
        "Ne sait pas à qui se fier sur les réseaux sociaux",
        "Perd sa motivation sans le soutien des autres",
        "Les consultations chez le nutritionniste pèsent sur son budget",
      ],
      goals: [
        "Avoir une relation plus sereine avec la nourriture",
        "Apprendre à cuisiner des repas simples et sains",
        "Trouver des personnes ayant le même objectif",
      ],
      digital: [
        "Utilise son téléphone pour presque tout",
        "Suit des comptes de recettes sur Instagram et TikTok",
        "Aime les applis avec objectifs et récompenses, comme Duolingo",
      ],
      helps:
        "Des parcours courts avec Nina, des communautés bienveillantes et les conseils de professionnels vérifiés.",
    },
    pro: {
      name: "Rafael Souza",
      age: "34",
      role: "Nutritionniste clinicien (CRN)",
      city: "Belo Horizonte (MG)",
      quote: "La bonne information ne devient pas virale, et ça me frustre.",
      bio: "Il consulte en cabinet et publie du contenu éducatif, mais voit des informations sans base scientifique toucher plus de monde que son travail.",
      pains: [
        "Est en concurrence avec des influenceurs sans formation",
        "A peu de temps pour produire du contenu",
        "A du mal à montrer sa crédibilité en ligne",
      ],
      goals: [
        "Élargir la portée du contenu scientifique",
        "Asseoir son autorité et attirer des patients",
        "Accompagner les gens au-delà du cabinet",
      ],
      digital: [
        "A un compte Instagram professionnel",
        "Échange avec ses patients dans des groupes de messagerie",
        "Cherche des outils simples pour publier",
      ],
      helps:
        "Badge de professionnel vérifié, onglet Professionnels dans le fil et communautés thématiques à animer.",
    },
  },
  competitors: {
    eyebrow: "Concurrents",
    title: "Où les gens cherchent de l'aide aujourd'hui",
    nina: "Chacun résout une partie du problème. Nous rassemblons les pièces.",
    directLabel: "Directs",
    directHint: "Applis d'alimentation et de régime",
    indirectLabel: "Indirects",
    indirectHint: "Là où l'on cherche conseils et motivation",
    gapLabel: "Ce qui manque",
    pickHint: "Touchez un concurrent pour voir les détails",
    direct: [
      {
        name: "Tecnonutri",
        what: "Appli brésilienne de régime avec un fil de photos de repas",
        gap: "Centrée sur les calories, sans parcours éducatifs",
      },
      {
        name: "MyFitnessPal",
        what: "Compteur de calories avec une grande base d'aliments",
        gap: "Communauté limitée aux forums, peu chaleureuse",
      },
      {
        name: "Lifesum",
        what: "Plans alimentaires et suivi des repas",
        gap: "Expérience individuelle, sans réseau social",
      },
      {
        name: "Yazio",
        what: "Compteur de calories et jeûne intermittent",
        gap: "Ni communauté ni professionnels vérifiés",
      },
      {
        name: "FatSecret",
        what: "Journal alimentaire gratuit avec communauté",
        gap: "Interface datée et sans gamification",
      },
    ],
    indirect: [
      {
        name: "Instagram et TikTok",
        what: "Principale source de conseils et de recettes aujourd'hui",
        gap: "Aucune vérification : la désinformation se propage",
      },
      {
        name: "TudoGostoso",
        what: "Le plus grand site de recettes du Brésil",
        gap: "Des recettes sans éducation nutritionnelle ni habitudes",
      },
      {
        name: "Duolingo",
        what: "La référence de l'apprentissage ludique",
        gap: "Ne parle pas d'alimentation",
      },
      {
        name: "Cabinet",
        what: "Suivi individuel avec un nutritionniste",
        gap: "Cher et sans communauté entre les consultations",
      },
    ],
  },
  comparison: {
    eyebrow: "Comparatif",
    title: "Fonction par fonction",
    nina: "Vous voyez ? Personne d'autre ne réunit tout cela au même endroit.",
    features: [
      "Réseau social sur l'alimentation",
      "Éducation nutritionnelle ludique",
      "Professionnels au CRN vérifié",
      "Axé sur les habitudes, sans compter les calories",
      "Recettes de la communauté",
      "Profils enfants sur le même compte",
    ],
    yes: "Oui",
    partial: "Partiel",
    no: "Non",
    score: "Score",
    note: "Analyse réalisée par l'équipe à partir d'informations publiques (sept. 2026). Les fonctions peuvent varier selon la version ou l'offre.",
  },
  canvas: {
    eyebrow: "Modèle économique",
    title: "Business Model Canvas",
    nina: "Nous avons appris pendant la formation qu'une bonne idée a besoin d'un bon modèle économique.",
    value:
      "Apprendre à mieux manger avec du soutien, sans culpabilité et avec une information fiable.",
    blocks: [
      {
        title: "Partenaires clés",
        items: [
          "Nutritionnistes inscrits au CRN",
          "Écoles et ONG d'éducation alimentaire",
          "Marchés et producteurs locaux",
        ],
      },
      {
        title: "Activités clés",
        items: [
          "Création des parcours",
          "Vérification des professionnels",
          "Modération de la communauté",
        ],
      },
      {
        title: "Ressources clés",
        items: ["Plateforme web responsive", "Contenu éducatif", "Marque et mascotte Nina"],
      },
      {
        title: "Proposition de valeur",
        items: [
          "Communauté + éducation + professionnels au même endroit",
          "Gratuit pour commencer",
        ],
      },
      {
        title: "Relation client",
        items: ["Communautés et défis", "Thème de la semaine", "Niveaux, séries et XP"],
      },
      {
        title: "Canaux",
        items: [
          "Site sur mobile et ordinateur",
          "Réseaux sociaux et recommandations",
          "Partenariats avec des écoles",
        ],
      },
      {
        title: "Segments de clientèle",
        items: [
          "Adultes en rééducation alimentaire",
          "Familles avec enfants",
          "Nutritionnistes en quête de visibilité",
        ],
      },
      {
        title: "Structure de coûts",
        items: [
          "Hébergement et base de données",
          "Création et relecture de contenu",
          "Modération et marketing",
        ],
      },
      {
        title: "Sources de revenus",
        items: [
          "Offre premium (freemium)",
          "Profil mis en avant pour les professionnels",
          "Licences pour les écoles et partenariats éthiques",
        ],
      },
    ],
  },
  course: {
    eyebrow: "Transforme-se · Serasa",
    title: "Ce que nous avons appris et où nous l'avons appliqué",
    intro:
      "NutriConnect est né dans la formation en développement front-end de Transforme-se. Chaque écran utilise quelque chose appris en cours.",
    nina: "Tout ce que vous allez voir a été construit avec ce que l'équipe a appris pendant la formation !",
    learnedLabel: "Appris",
    appliedLabel: "Appliqué",
    stackLabel: "Technologies du projet",
    items: [
      {
        title: "HTML, CSS et responsive",
        learned: "Structure sémantique, Flexbox, Grid et mises en page mobile-first.",
        applied:
          "Chaque écran fonctionne sur mobile et ordinateur, avec une barre de navigation façon appli.",
      },
      {
        title: "JavaScript, React et TypeScript",
        learned: "Composants, état, hooks, routage et typage.",
        applied: "Fil, parcours, défis et personnalisation sont des composants React typés.",
      },
      {
        title: "Git, GitHub et travail d'équipe",
        learned: "Gestion de versions, branches, commits et collaboration.",
        applied: "Quatre personnes développant dans le même dépôt, synchronisé avec Lovable.",
      },
      {
        title: "Canvas et pitch",
        learned: "Modèle économique, proposition de valeur et présentation d'une idée.",
        applied: "Le Canvas que vous venez de voir et cette présentation.",
      },
    ],
  },
  tourIntro: {
    eyebrow: "Visite de la plateforme",
    title: "Découvrez maintenant NutriConnect de l'intérieur",
    text: "Nous allons parcourir chaque partie du site : le fil, le profil, la personnalisation, les parcours, les communautés, les défis et les découvertes.",
    nina: "Suivez-moi ! Je vais vous montrer chaque recoin.",
  },
  tour: {
    feed: {
      eyebrow: "Espace du Jour",
      title: "Un fil fait de vraies recettes et histoires",
      text: "C'est ici que la communauté partage ce qu'elle a cuisiné, ce qu'elle a appris et comment elle vit son parcours.",
      nina: "Ici, personne ne juge votre assiette. On célèbre chaque pas !",
      bullets: [
        "Onglets Général, Amis et Professionnels",
        "Publications avec photos, recettes et témoignages",
        "Éditeur d'image avec filtres et recadrage",
        "J'aime, commentaires et partage",
      ],
    },
    profile: {
      eyebrow: "Profil et niveaux",
      title: "Votre parcours, de Graine à Maître",
      text: "Le profil montre l'évolution de chacun : niveau, série de jours, recettes préparées et défis en cours.",
      nina: "Chaque recette, leçon et défi vous fait grandir, comme une petite plante !",
      bullets: [
        "8 niveaux : Graine, Pousse, Feuille, Fleur, Fruit, Arbre, Forêt et Maître",
        "Série de jours consécutifs",
        "Recettes préparées, objectifs et défis actifs",
        "Profil public ou privé, à vous de choisir",
      ],
    },
    appearance: {
      eyebrow: "Personnalisation",
      title: "Un NutriConnect à votre image",
      text: "Chacun compose son propre style, et les options servent aussi d'accessibilité.",
      nina: "Essayez de cliquer sur les couleurs et les polices juste à côté !",
      bullets: [
        "Couleur d'accent et couleur principale",
        "7 polices de titre et 7 de texte",
        "Mode clair, sombre ou automatique",
        "Taille du texte, coins, densité et mouvements réduits",
        "Disponible en portugais, anglais, espagnol et français",
      ],
    },
    trails: {
      eyebrow: "Parcours d'apprentissage",
      title: "Apprendre la nutrition comme un jeu",
      text: "Des leçons courtes organisées en unités et en étapes, avec des activités variées et Nina qui explique tout.",
      nina: "Ma partie préférée ! Chaque étape a des niveaux et peut devenir dorée.",
      bullets: [
        "Étapes à 3 niveaux et étapes dorées",
        "Activités variées, vies et XP",
        "Parcours pour adultes et pour enfants",
        "Profils enfants avec leurs propres personnages",
      ],
    },
    communities: {
      eyebrow: "Communautés",
      title: "Des groupes pour ceux qui ont le même objectif",
      text: "Les communautés thématiques rassemblent des personnes aux intérêts proches, avec leurs propres publications, défis et administrateurs.",
      nina: "Trouver sa tribu change tout pour ne pas abandonner.",
      bullets: [
        "Communautés thématiques sur l'alimentation",
        "Administrateurs et invitations",
        "Publications et défis propres à chaque groupe",
        "Suggestions de communautés à découvrir",
      ],
    },
    challenges: {
      eyebrow: "Défis",
      title: "De petites habitudes, gagnées ensemble",
      text: "Des défis d'habitudes avec un check-in quotidien. L'XP s'ajoute à celle du parcours et fait monter votre niveau.",
      nina: "Partant pour boire plus d'eau cette semaine ? Plein de monde s'y met !",
      bullets: [
        "Défis populaires et des communautés",
        "Check-in quotidien des habitudes",
        "XP qui s'ajoute au parcours",
        "Des participants qui se motivent mutuellement",
      ],
    },
    discover: {
      eyebrow: "Recettes, Explorer et Thème de la Semaine",
      title: "Il y a toujours quelque chose à découvrir",
      text: "Des recettes de la communauté, une recherche par ingrédient et un thème hebdomadaire qui anime la conversation.",
      nina: "Vous avez préparé une recette ? Touchez « Je l'ai préparée » et elle rejoint votre profil !",
      bullets: [
        "Recettes avec le bouton « Je l'ai préparée »",
        "Recherche dans les recettes, témoignages, défis et communautés",
        "Thème de la semaine avec sondage et défi",
        "Archives des thèmes précédents",
      ],
    },
  },
  mock: {
    post1Name: "Ana Beatriz",
    post1Time: "il y a 12 min",
    post1Text: "Premiers overnight oats ! Super bons avec banane et cannelle 🍌",
    post2Name: "Dr Camila Jardim",
    post2Time: "il y a 1 h",
    post2Text:
      "Astuce : commencez votre assiette par les légumes. Les fibres aident à la satiété 🥗",
    profileName: "Juliana Martins",
    profileBio: "J'apprends à mieux manger, un jour à la fois.",
    nextLevel: "Niveau suivant",
    preview: "Aperçu",
    previewText: "Voici le site avec vos choix.",
    previewButton: "Bouton principal",
    tryIt: "Touchez pour essayer",
    accentLabel: "Couleur d'accent",
    fontLabel: "Police des titres",
    modeLabel: "Mode",
    light: "Clair",
    dark: "Sombre",
    trailUnit: "Unité 1 · Bases de l'Alimentation",
    trailStops: ["Macronutriments", "Vitamines", "Eau et fibres", "Étiquettes"],
    lives: "vies",
    kidProfile: "Profil enfant",
    adultProfile: "Vous",
    communities: [
      { name: "Repas de la Semaine", members: "1,2 k membres" },
      { name: "Cuisine Zéro Gaspi", members: "860 membres" },
      { name: "Alimentation des Enfants", members: "540 membres" },
    ],
    join: "Rejoindre",
    joined: "Membre",
    challengeTitle: "7 jours à boire plus d'eau",
    challengeProgress: "Jour 4 sur 7",
    challengeParticipants: "238 participants",
    checkIn: "Faire le check-in du jour",
    checkedIn: "Check-in fait !",
    days: ["L", "M", "M", "J", "V", "S", "D"],
    recipeTitle: "Légumes rôtis aux herbes",
    recipeMeta: "30 min · Facile",
    pollQuestion: "Quel est votre plus grand défi au petit-déjeuner ?",
    pollOptions: ["Manque de temps", "Manque d'idées", "Pas faim"],
    search: "Rechercher par ingrédient ou tag…",
    weekly: "Thème de la semaine",
  },
  team: {
    eyebrow: "Équipe",
    title: "Les personnes derrière NutriConnect",
    text: "Quatre personnes, une formation et l'envie de rendre l'alimentation saine plus accessible et chaleureuse.",
    role: "Développeur·se Front-end",
    nina: "Et voici l'équipe qui m'a créée !",
  },
  join: {
    eyebrow: "Rejoignez-nous",
    title: "Votre parcours commence maintenant",
    text: "Créez votre compte gratuit, rejoignez une communauté et faites le premier pas sur le parcours avec Nina.",
    primary: "Créer mon compte",
    secondary: "J'ai déjà un compte",
    replay: "Revoir la présentation",
    nina: "J'ai hâte de vous voir à l'intérieur ! On commence ?",
    perks: ["Gratuit", "Sans jugement", "Professionnels vérifiés"],
  },
};

export default fr;

import type { ContentOverrides } from "./content";

const content: ContentOverrides = {
  "trail:nutrientes": {
    title: "Fundamentos de la Nutrición",
    tagline: "Nutrientes e hidratación",
    description:
      "Macronutrientes, vitaminas, minerales, agua y fibra: la base para entender lo que necesita el cuerpo.",
  },
  "unit:unit-1": {
    title: "Bases de la Alimentación",
    description: "Conoce a los Nutri-Amigos y descubre el poder de los alimentos.",
  },
  "stop:lesson-1-1": {
    title: "¿Qué son los Macronutrientes?",
    summary: "Carbohidratos, proteínas y grasas: el combustible y las piezas del cuerpo.",
  },
  "act:lesson-1-1-l1-c1": {
    title: "Los tres macronutrientes",
    body: "Los macronutrientes son los nutrientes que necesitamos en **mayores cantidades**. Aportan energía (calorías) y la materia prima para que el cuerpo funcione.",
    points: [
      "Carbohidratos: energía rápida (4 kcal por gramo)",
      "Proteínas: construcción y reparación de los tejidos (4 kcal por gramo)",
      "Grasas: reserva de energía y absorción de vitaminas (9 kcal por gramo)",
    ],
    tip: "Ningún grupo es un villano. Lo que importa es la calidad y el equilibrio entre ellos.",
  },
  "act:l1-1-1": {
    text: "¡Hola! Soy Nutri Nina. ¡Qué bueno tenerte aquí! Vamos a embarcarnos en un viaje increíble para conocer los alimentos.",
  },
  "act:l1-1-2": {
    text: "¡Hola! Soy Lipe Abacate. ¿Sabías que nuestro cuerpo es como un auto de carreras? ¡Necesita combustible y buenas piezas para acelerar!",
  },
  "act:l1-1-3": {
    text: "¡Exacto! Y los **Macronutrientes** son las piezas y la gasolina del cuerpo. Se dividen en tres grandes grupos: Carbohidratos, Proteínas y Grasas.",
  },
  "act:l1-1-4": {
    question:
      "¿Cuál de estos grupos funciona como la 'gasolina rápida' de nuestro cuerpo, dando energía inmediata al cerebro y a los músculos?",
    options: ["Proteínas", "Grasas", "Carbohidratos", "Fibra"],
    explanation:
      "¡Así es! Los carbohidratos son la principal fuente de energía. Panes, pastas, raíces y frutas están llenos de ellos.",
  },
  "act:l1-1-5": {
    statement:
      "Las grasas son las grandes villanas de la salud y no sirven para nada en nuestro cuerpo.",
    explanation:
      "¡Las grasas son súper importantes! Protegen nuestros órganos y ayudan a absorber vitaminas esenciales.",
  },
  "act:l1-1-6": {
    question:
      "¿Y las proteínas? Actúan como los 'ladrillitos' de nuestro cuerpo. ¿Cuál es su función?",
    options: [
      "Endulzar la sangre",
      "Construir y reparar tejidos como músculos y piel",
      "Reemplazar el agua del cuerpo",
      "Causar sueño después del almuerzo",
    ],
    explanation:
      "¡Exacto! Las carnes, los huevos y las legumbres (como el frijol) son ricos en proteínas, los ladrillos de construcción de tu cuerpo.",
  },
  "act:lesson-1-1-l1-y1": {
    question:
      "¿Cuáles de estas opciones son fuentes de carbohidratos complejos (de digestión más lenta)?",
    options: ["Arroz integral", "Refresco", "Azúcar refinada", "Camote", "Avena"],
    explanation:
      "El arroz integral, la avena y el camote liberan energía poco a poco. El azúcar y el refresco se absorben muy rápido.",
  },
  "act:lesson-1-1-l1-y2": {
    prompt: "Une el alimento con el macronutriente que más destaca en él:",
    pairs: [
      {
        left: "Aceite de oliva",
        right: "Grasa",
      },
      {
        left: "Claras de huevo",
        right: "Proteína",
      },
      {
        left: "Arroz blanco",
        right: "Carbohidrato",
      },
    ],
    explanation: "Casi todo alimento mezcla nutrientes, pero cada uno tiene uno que predomina.",
  },
  "act:lesson-1-1-l1-y3": {
    prompt: "Ordena una forma práctica de armar un plato con los tres macronutrientes:",
    items: [
      "Elige las verduras de colores",
      "Añade una fuente de carbohidrato",
      "Completa con una fuente de proteína",
      "Termina con una grasa buena, como aceite de oliva o frutos secos",
    ],
    explanation:
      "Pensar por partes facilita armar una comida equilibrada sin necesidad de pesar nada.",
  },
  "act:lesson-1-1-l1-y4": {
    prompt:
      "Piensa en tu última comida principal: ¿tuvo carbohidratos, proteínas y grasas buenas? ¿Qué podrías ajustar?",
    placeholder: "Escribe libremente sobre tu última comida…",
  },
  "act:lesson-1-1-l2-c1": {
    title: "Cómo combinar los macronutrientes",
    body: "Una comida completa suele reunir una fuente de **carbohidrato**, una de **proteína** y **verduras**. La combinación da energía, saciedad y nutrientes al mismo tiempo.",
    points: [
      "Arroz, frijoles, huevo y col rizada",
      "Yogur natural, fruta y avena",
      "Pan integral, queso y tomate",
    ],
    tip: "El arroz con frijoles es una pareja clásica: los aminoácidos de uno complementan los del otro.",
  },
  "act:lesson-1-1-l2-1": {
    text: "¡Hora de practicar! Vamos a unir cada nutriente con el papel que cumple en el cuerpo.",
  },
  "act:lesson-1-1-l2-2": {
    prompt: "Une cada nutriente con su función principal:",
    pairs: [
      {
        left: "Carbohidratos",
        right: "Energía rápida",
      },
      {
        left: "Proteínas",
        right: "Construir y reparar tejidos",
      },
      {
        left: "Grasas buenas",
        right: "Reserva de energía y absorción de vitaminas",
      },
      {
        left: "Vitaminas",
        right: "Regular el funcionamiento del cuerpo",
      },
    ],
    explanation:
      "¡Cada grupo tiene un papel! Por eso el plato ideal mezcla varios de ellos, sin excluir ninguno.",
  },
  "act:lesson-1-1-l2-3": {
    question: "¿Qué comida reúne carbohidrato, proteína y verduras al mismo tiempo?",
    options: [
      "Solo una manzana",
      "Galletas rellenas y jugo de caja",
      "Refresco y papas fritas",
      "Arroz, frijoles, huevo revuelto y col rizada salteada",
    ],
    explanation:
      "El arroz (carbohidrato), los frijoles y el huevo (proteínas) y la col (verdura) forman una comida completa y económica.",
  },
  "act:lesson-1-1-l2-4": {
    statement: "El arroz con frijoles es una pareja que aporta carbohidratos y proteínas.",
    explanation:
      "¡Así es! Además, el frijol aporta fibra y hierro. Una combinación brasileña y nutritiva.",
  },
  "act:lesson-1-1-l2-5": {
    question: "Marca TODAS las buenas fuentes de proteína:",
    options: ["Mermelada", "Lechuga", "Lentejas", "Huevos", "Pescado"],
    explanation:
      "Los huevos, las lentejas y el pescado son ricos en proteína. La lechuga tiene mucha agua y vitaminas, y la mermelada es básicamente azúcar.",
  },
  "act:lesson-1-1-l2-x1": {
    prompt: "Clasifica cada alimento según el macronutriente que más predomina en él:",
    groups: ["Carbohidratos", "Proteínas", "Grasas"],
    items: ["Arroz", "Pasta", "Huevo", "Pollo", "Aceite de oliva", "Frutos secos"],
    explanation: "Muchos alimentos mezclan nutrientes, pero cada uno tiene un grupo predominante.",
  },
  "act:lesson-1-1-l2-x2": {
    statement:
      "Los carbohidratos por la noche engordan más que durante el día, porque el metabolismo se detiene.",
    explanation:
      "¡Mito! El aumento de peso depende del total de calorías al final del día, no de la hora en que se consumió el carbohidrato.",
  },
  "act:lesson-1-1-l2-x3": {
    question:
      "¿Cuál de estas opciones es una comida que combina los tres grandes macronutrientes de forma equilibrada?",
    options: [
      "Solo un plato de pasta",
      "Solo una manzana grande",
      "Pan de molde blanco solo",
      "Arroz, frijoles, pechuga de pollo a la plancha y ensalada aliñada con aceite de oliva",
    ],
    explanation:
      "Arroz (carbohidrato), pollo/frijoles (proteínas) y aceite de oliva (grasa), además de la fibra de la ensalada. ¡Excelente combinación!",
  },
  "act:lesson-1-1-l2-x4": {
    setup: "Ana no tiene tiempo para almorzar y toma solo un pan francés con café.",
    question: "¿Qué ayudaría más a que esta merienda fuera más completa?",
    options: [
      "Añadir una proteína y una fruta",
      "Solo más café",
      "Nada, ya está perfecto así",
      "Cambiarlo por otro pan",
    ],
    explanation:
      "Un huevo, queso o yogur (proteína) y una fruta dan más saciedad y equilibrio a la merienda de Ana.",
  },
  "act:lesson-1-1-l3-c1": {
    title: "La calidad importa más que el grupo",
    body: "Dentro de cada macronutriente hay mejores y peores opciones. Vale la pena mirar **de dónde** viene cada uno, y no solo cuánto hay en el plato.",
    points: [
      "Carbohidratos: integrales y raíces frente a harinas refinadas y azúcar",
      "Grasas: insaturadas (aceite de oliva, aguacate, frutos secos) frente a trans y exceso de saturadas",
      "Proteínas: huevos, legumbres, pescados frente a embutidos ultraprocesados",
    ],
  },
  "act:lesson-1-1-l3-1": {
    text: "¡Ahora es para expertos! Te voy a dar situaciones del día a día. ¿Vamos?",
  },
  "act:lesson-1-1-l3-2": {
    question:
      "Después de entrenar, Ana quiere ayudar a que sus músculos se recuperen. ¿Qué merienda tiene más sentido?",
    options: [
      "Yogur natural con frutas y avena",
      "Refresco",
      "Caramelos y chicles",
      "Papas fritas de bolsa",
    ],
    explanation:
      "Proteína (yogur) + carbohidratos (fruta y avena) ayudan a la recuperación y reponen la energía gastada.",
  },
  "act:lesson-1-1-l3-3": {
    statement: "El aguacate y el aceite de oliva son fuentes de grasas buenas (insaturadas).",
    explanation:
      "¡Verdad! Las grasas insaturadas ayudan al corazón y a absorber las vitaminas A, D, E y K.",
  },
  "act:lesson-1-1-l3-4": {
    question: "Marca las afirmaciones VERDADERAS sobre los carbohidratos:",
    options: [
      "Son la principal fuente de energía del cerebro",
      "Existen naturalmente en frutas y raíces",
      "Todo carbohidrato es exactamente igual",
      "Las versiones integrales suelen tener más fibra",
    ],
    explanation:
      "No todos los carbohidratos son iguales: los integrales y los naturales (frutas, raíces) vienen con fibra y nutrientes.",
  },
  "act:lesson-1-1-l3-5": {
    prompt: "Ordena de MENOS a MÁS procesado:",
    items: ["Yuca cocida", "Harina de yuca", "Pan de molde", "Galleta rellena"],
    explanation:
      "Cuantas más etapas industriales e ingredientes, más procesado. La yuca cocida está casi como salió de la tierra.",
  },
  "act:lesson-1-1-l3-6": {
    prompt: "Une el alimento con el nutriente que predomina en él:",
    pairs: [
      {
        left: "Pan integral",
        right: "Carbohidratos",
      },
      {
        left: "Huevo cocido",
        right: "Proteínas",
      },
      {
        left: "Frutos secos",
        right: "Grasas buenas",
      },
      {
        left: "Naranja",
        right: "Vitamina C",
      },
    ],
    explanation: "Saber qué ofrece cada alimento ayuda a armar comidas completas.",
  },
  "act:lesson-1-1-l3-7": {
    question: "¿Sería ideal una dieta 'solo de proteína'?",
    options: [
      "No: el cuerpo necesita todos los grupos en equilibrio",
      "Sí, porque el carbohidrato hace mal",
      "Solo si es por la mañana",
      "Sí, porque la proteína es el nutriente más importante",
    ],
    explanation:
      "Ningún nutriente trabaja solo. El equilibrio y la variedad son la base de una alimentación saludable.",
  },
  "act:lesson-1-1-l3-x1": {
    sentence:
      "Las grasas insaturadas, presentes en el aceite de oliva y en el ___, ayudan a proteger el corazón.",
    options: ["pan blanco", "azúcar", "refresco", "aguacate"],
    explanation: "El aguacate es rico en grasas insaturadas, además de fibra y potasio.",
  },
  "act:lesson-1-1-l3-x2": {
    question: "¿Cuáles de los siguientes alimentos se consideran excelentes fuentes de proteína?",
    options: ["Papa", "Huevo", "Pechuga de pollo", "Lentejas", "Aceite de oliva"],
    explanation:
      "¡El huevo, el pollo y las lentejas son alimentos constructores! El aceite de oliva es grasa y la papa es carbohidrato.",
  },
  "act:lesson-1-1-l3-x3": {
    prompt: "Une el macronutriente con su principal función en el cuerpo:",
    pairs: [
      {
        left: "Carbohidrato",
        right: "Energía primaria",
      },
      {
        left: "Proteína",
        right: "Construcción de tejidos",
      },
      {
        left: "Grasa",
        right: "Reserva de energía y hormonas",
      },
    ],
    explanation:
      "¡Cada macronutriente es como un departamento distinto de la misma fábrica, trabajando en conjunto!",
  },
  "stop:lesson-1-2": {
    title: "Pequeños Gigantes: Vitaminas",
    summary: "Vitaminas y minerales: pequeños nutrientes con funciones gigantes.",
  },
  "act:lesson-1-2-l1-c1": {
    title: "Micronutrientes: pequeños y esenciales",
    body: "Las vitaminas y los minerales son **micronutrientes**: el cuerpo los necesita en pequeñas cantidades, pero sin ellos la inmunidad, la visión, los huesos y la energía no funcionan bien.",
    points: [
      "Vitaminas: A, C, D, E, K y las del complejo B",
      "Minerales: calcio, hierro, zinc, magnesio, potasio",
      "El cuerpo produce pocos de ellos: casi todo viene de la alimentación",
    ],
    tip: "La variedad de colores en el plato suele significar variedad de micronutrientes.",
  },
  "act:l1-2-1": {
    text: "¡Hola! Soy Mila Maçã. Ya hablamos de los 'Macros', ahora hablemos de los 'Micros': Vitaminas y Minerales. No dan energía, pero...",
  },
  "act:l1-2-2": {
    text: "...son las herramientas que regulan todo el funcionamiento de la máquina. ¡Como el aceite del motor y el sistema eléctrico de un auto!",
  },
  "act:l1-2-3": {
    statement: "Una alimentación muy colorida no hace diferencia; lo importante es comer poco.",
    explanation:
      "¡Los distintos colores en los alimentos significan distintas vitaminas y minerales! Cuanto más colorido, más rico.",
  },
  "act:l1-2-4": {
    question:
      "¿Conoces la vitamina C? La famosa contra los resfriados. ¿Dónde se encuentra en gran cantidad?",
    options: [
      "Carnes rojas",
      "Frutas cítricas (naranja, acerola)",
      "Aceite de soja",
      "Arroz blanco",
    ],
    explanation:
      "¡Perfecto! Las frutas cítricas son excelentes fuentes de vitamina C, que fortalece la inmunidad.",
  },
  "act:l1-2-5": {
    question: "Y para tener huesos fuertes, ¿cuál es el mineral más famoso que necesitamos?",
    options: ["Sodio", "Zinc", "Calcio", "Magnesio"],
    explanation:
      "¡Eso es! El calcio, muy presente en la leche, los quesos e incluso en verduras de hoja verde oscuro, forma la estructura de nuestros huesos.",
  },
  "act:lesson-1-2-l1-y1": {
    prompt: "Une la vitamina o el mineral con su función:",
    pairs: [
      {
        left: "Vitamina D",
        right: "Ayuda a absorber el calcio",
      },
      {
        left: "Zinc",
        right: "Inmunidad y cicatrización",
      },
      {
        left: "Vitamina K",
        right: "Coagulación de la sangre",
      },
      {
        left: "Magnesio",
        right: "Función muscular y nerviosa",
      },
    ],
    explanation: "Cada micronutriente tiene su propio papel, y todos trabajan juntos en el cuerpo.",
  },
  "act:lesson-1-2-l1-y2": {
    question: "¿Cuáles de estos son MINERALES (y no vitaminas)?",
    options: ["Vitamina B12", "Zinc", "Hierro", "Calcio", "Vitamina C"],
    explanation:
      "El hierro, el zinc y el calcio son minerales. La vitamina C y la B12 son vitaminas.",
  },
  "act:lesson-1-2-l1-y3": {
    prompt: "Ordena una forma de mejorar la absorción del hierro de origen vegetal en una comida:",
    items: [
      "Prepara los frijoles o las lentejas",
      "Añade un alimento rico en vitamina C, como limón o naranja",
      "Evita el café o el té negro en la misma comida",
      "Sirve y disfruta",
    ],
    explanation: "La vitamina C convierte el hierro vegetal en una forma más fácil de absorber.",
  },
  "act:lesson-1-2-l1-y4": {
    prompt:
      "¿Tu alimentación de esta semana tuvo al menos 3 colores distintos de frutas y verduras por día? ¿Qué podría dar más color a tu plato?",
  },
  "act:lesson-1-2-l2-c1": {
    title: "Dónde encontrar cada uno",
    body: "Ningún alimento lo tiene todo. Por eso la **variedad** es la mejor estrategia para cubrir las necesidades.",
    points: [
      "Vitamina C: acerola, guayaba, naranja, pimiento",
      "Hierro: frijoles, lentejas, hojas oscuras, carnes",
      "Calcio: leche y derivados, col rizada, sardinas",
      "Vitamina A: zanahoria, calabaza, mango",
    ],
  },
  "act:lesson-1-2-l2-1": {
    text: "Vamos a entrenar la memoria de las vitaminas y minerales. ¡Prepárate para unir los puntos!",
  },
  "act:lesson-1-2-l2-2": {
    prompt: "Une el nutriente con buenas fuentes de él:",
    pairs: [
      {
        left: "Vitamina C",
        right: "Acerola y naranja",
      },
      {
        left: "Calcio",
        right: "Leche, yogur y col rizada",
      },
      {
        left: "Hierro",
        right: "Frijoles y hojas verde oscuro",
      },
      {
        left: "Vitamina A",
        right: "Zanahoria y calabaza",
      },
    ],
    explanation:
      "Variar los colores y los grupos de alimentos es la forma más fácil de obtener todos estos nutrientes.",
  },
  "act:lesson-1-2-l2-3": {
    question: "¿Por qué es bueno armar un plato muy colorido?",
    options: [
      "Para comer menos",
      "Solo porque queda bonito en la foto",
      "Los colores distintos tienen las mismas vitaminas",
      "Cada color suele aportar nutrientes distintos",
    ],
    explanation:
      "Los colores vienen de pigmentos y nutrientes distintos. Cuantos más colores naturales, más variedad nutricional.",
  },
  "act:lesson-1-2-l2-4": {
    statement: "Las vitaminas aportan calorías (energía) como los carbohidratos.",
    explanation:
      "Las vitaminas y los minerales no dan energía, pero ayudan al cuerpo a usar la energía de los otros nutrientes.",
  },
  "act:lesson-1-2-l2-5": {
    question: "Marca las buenas fuentes de vitamina C:",
    options: ["Guayaba", "Acerola", "Naranja", "Arroz", "Pan blanco"],
    explanation:
      "La acerola, la naranja y la guayaba están entre las campeonas de vitamina C. ¡La guayaba tiene más que la naranja!",
  },
  "act:lesson-1-2-l2-x1": {
    prompt: "¿Dónde está el nutriente? Clasifica cada alimento:",
    groups: ["Rico en vitamina C", "Rico en calcio"],
    items: ["Acerola", "Guayaba", "Naranja", "Leche", "Yogur", "Queso"],
    explanation:
      "Los cítricos y la guayaba lideran en vitamina C. Los lácteos son las fuentes más conocidas de calcio.",
  },
  "act:lesson-1-2-l2-x2": {
    setup: "Marcos siempre anda cansado y sospecha que tiene anemia por falta de hierro.",
    question:
      "¿Qué combinación ayudaría más a mejorar la absorción del hierro de los frijoles que come?",
    options: [
      "Frijoles con jugo de naranja",
      "Frijoles con café",
      "Solo tomar un suplemento, sin cambiar la alimentación",
      "Frijoles con té negro",
    ],
    explanation:
      "La vitamina C del jugo de naranja aumenta la absorción del hierro vegetal. El café y el té negro perjudican ese proceso.",
  },
  "act:lesson-1-2-l2-x3": {
    question: "¿Qué vitamina puede producir el cuerpo con una exposición moderada al sol?",
    options: ["Vitamina C", "Vitamina B12", "Vitamina D", "Vitamina K"],
    explanation:
      "La piel produce vitamina D con la luz solar. Ayuda a fijar el calcio en los huesos.",
  },
  "act:lesson-1-2-l2-x4": {
    statement:
      "Los suplementos vitamínicos reemplazan por completo la necesidad de una alimentación variada.",
    explanation:
      "Los alimentos aportan combinaciones de nutrientes, fibras y otros compuestos que los suplementos aislados no replican.",
  },
  "act:lesson-1-2-l3-c1": {
    title: "Absorción: qué ayuda y qué perjudica",
    body: "Comer no basta: el cuerpo necesita **absorber**. Algunos nutrientes se ayudan y otros compiten entre sí.",
    points: [
      "La vitamina C mejora la absorción del hierro de origen vegetal",
      "Las grasas buenas ayudan a absorber las vitaminas A, D, E y K",
      "El café y los tés cerca de las comidas reducen la absorción del hierro",
    ],
    tip: "Un consejo simple: frijoles con naranja de postre o limón en la col.",
  },
  "act:lesson-1-2-l3-1": {
    text: "Desafío de experto: ¡ahora las vitaminas van a trabajar en equipo!",
  },
  "act:lesson-1-2-l3-2": {
    question:
      "Para que el cuerpo absorba mejor el hierro de los frijoles, ¿qué combinar en la comida?",
    options: [
      "Un refresco",
      "Una fruta cítrica o unas gotas de limón",
      "Nada cambia la absorción",
      "Un café justo después",
    ],
    explanation:
      "La vitamina C ayuda a absorber el hierro de origen vegetal. En cambio, el café cerca de la comida lo perjudica.",
  },
  "act:lesson-1-2-l3-3": {
    statement: "Tomar un poco de sol con moderación ayuda al cuerpo a producir vitamina D.",
    explanation:
      "La piel produce vitamina D con la luz del sol. Ayuda a fijar el calcio en los huesos.",
  },
  "act:lesson-1-2-l3-4": {
    prompt: "Ordena cómo preparar una verdura conservando los nutrientes:",
    items: [
      "Lava bien la verdura",
      "Córtala en trozos grandes",
      "Cocínala rápido al vapor, con poca agua",
      "Sírvela enseguida",
    ],
    explanation:
      "Trozos grandes, poca agua y tiempo corto pierden menos vitaminas, que son sensibles al calor y al agua.",
  },
  "act:lesson-1-2-l3-5": {
    question: "¿Qué hábitos ayudan a conservar las vitaminas de los vegetales?",
    options: [
      "Cocinar al vapor por poco tiempo",
      "Dejarlos picados por días al sol",
      "Hervir por horas en mucha agua",
      "Comer parte de ellos crudos, en ensaladas",
    ],
    explanation:
      "El vapor rápido y algunos vegetales crudos conservan más nutrientes que las cocciones largas.",
  },
  "act:lesson-1-2-l3-6": {
    question:
      "La vitamina A, presente en la zanahoria y en la calabaza, es importante principalmente para:",
    options: [
      "Digerir el azúcar",
      "Poner el cabello rojo",
      "La visión y la salud de la piel",
      "Aumentar la masa muscular",
    ],
    explanation:
      "La vitamina A cuida la visión, la piel y las defensas del cuerpo. ¡Cadu lo aprueba!",
  },
  "act:lesson-1-2-l3-x1": {
    sentence: "El ___ ayuda al cuerpo a absorber mejor el hierro de los frijoles.",
    options: ["café", "chocolate", "limón (vitamina C)", "refresco"],
    explanation: "La vitamina C convierte el hierro vegetal en una forma más fácil de absorber.",
  },
  "act:lesson-1-2-l3-x2": {
    question: "¿Cuáles de estos hábitos ayudan a absorber mejor el hierro de los vegetales?",
    options: [
      "Tomar café en la misma comida",
      "Aliñar con limón",
      "Comer una fruta cítrica junto",
      "Beber té negro junto",
    ],
    explanation:
      "La vitamina C y la acidez del limón ayudan. El café y el té negro compiten por la absorción del hierro.",
  },
  "act:lesson-1-2-l3-x3": {
    question: "¿Aproximadamente cuántos miligramos de vitamina C tiene una naranja mediana?",
    unit: " mg",
    explanation:
      "Una naranja mediana tiene cerca de 70 mg de vitamina C — más que la necesidad diaria de muchos adultos.",
  },
  "stop:lesson-1-3": {
    title: "Agua y Fibras",
    summary: "Agua y fibras: hidratación, saciedad y un intestino feliz.",
  },
  "act:lesson-1-3-l1-c1": {
    title: "Agua: el nutriente olvidado",
    body: "El agua participa en la digestión, regula la temperatura, transporta nutrientes y elimina desechos. Las frutas, las verduras y las sopas también **contribuyen** a la hidratación.",
    points: [
      "La sed es una señal tardía: bebe a lo largo del día",
      "La orina clara suele indicar buena hidratación",
      "Las bebidas azucaradas no sustituyen al agua",
    ],
  },
  "act:l1-3-1": {
    text: "¿Sabías que cerca del 60% al 70% de tu cuerpo es agua? ¡Es mucho! Y hay algo que ayuda a que tu intestino funcione perfectamente: las fibras.",
  },
  "act:l1-3-2": {
    statement:
      "Podemos sustituir el consumo de agua por refrescos o jugos endulzados, ya que todo es líquido.",
    explanation:
      "¡No! Las bebidas azucaradas no hidratan con la misma eficiencia y traen exceso de calorías. El agua pura es insustituible.",
  },
  "act:l1-3-3": {
    question: "¿Qué hacen las FIBRAS, presentes en frutas y verduras, en nuestro cuerpo?",
    options: [
      "Forman una escobita que limpia el intestino y da saciedad.",
      "Se convierten en azúcar muy rápido en la sangre.",
      "Perjudican la absorción de nutrientes.",
      "Hacen que el cabello crezca rojo.",
    ],
    explanation:
      "¡Perfecto! Además de ayudar en el baño, las fibras nos hacen sentir llenos (saciados) por más tiempo.",
  },
  "act:l1-3-4": {
    statement:
      "Comer la fruta con cáscara siempre que sea posible ayuda a aumentar la ingesta de fibras.",
    explanation:
      "¡Así es! La cáscara y el bagazo son donde vive la mayor parte de las fibras (como en la manzana y la pera).",
  },
  "act:lesson-1-3-l1-y1": {
    question:
      "Muchas guías sugieren, en promedio, ¿cuántos vasos de agua (200 ml) al día para un adulto?",
    unit: " vasos",
    explanation:
      "Una referencia común es de unos 8 vasos (cerca de 2 litros), pero la necesidad real varía con el clima, el cuerpo y la rutina.",
  },
  "act:lesson-1-3-l1-y2": {
    prompt: "Une el alimento con el tipo de fibra que predomina en él:",
    pairs: [
      {
        left: "Avena",
        right: "Fibra soluble",
      },
      {
        left: "Salvado de trigo",
        right: "Fibra insoluble",
      },
      {
        left: "Manzana con cáscara",
        right: "Fibra soluble e insoluble",
      },
    ],
    explanation:
      "Los alimentos vegetales suelen traer los dos tipos de fibra, en proporciones distintas.",
  },
  "act:lesson-1-3-l1-y3": {
    question: "¿Cuáles de estos ayudan a aumentar la ingesta diaria de fibras?",
    options: [
      "Incluir frijoles en las comidas",
      "Elegir pan integral",
      "Pelar todos los vegetales",
      "Cambiar el jugo por la fruta entera",
    ],
    explanation:
      "La fruta entera y los frijoles conservan las fibras. Pelar todo elimina parte de ellas.",
  },
  "act:lesson-1-3-l1-y4": {
    prompt:
      "¿Cuántos vasos de agua has bebido hoy? ¿Qué podría ayudarte a recordar beber más a lo largo del día?",
  },
  "act:lesson-1-3-l2-c1": {
    title: "Fibras: solubles e insolubles",
    body: "Las fibras son partes de los vegetales que no digerimos, y cada tipo tiene una función.",
    points: [
      "Solubles (avena, frijoles, manzana): ayudan al colesterol y a la glucemia",
      "Insolubles (integrales, verduras): mejoran el tránsito intestinal",
      "Ambas aumentan la saciedad",
    ],
    tip: "La mayoría de los alimentos vegetales tiene los dos tipos.",
  },
  "act:lesson-1-3-l2-1": {
    text: "¡El agua y las fibras son mis superpoderes! Veamos si ya los dominas.",
  },
  "act:lesson-1-3-l2-2": {
    prompt: "Une cada elemento con lo que representa:",
    pairs: [
      {
        left: "Agua",
        right: "Transporta nutrientes y regula la temperatura",
      },
      {
        left: "Fibras",
        right: "Ayudan al intestino y dan saciedad",
      },
      {
        left: "Sed",
        right: "Señal de que el cuerpo ya necesita agua",
      },
      {
        left: "Orina muy clara",
        right: "Señal de buena hidratación",
      },
    ],
    explanation: "Observar el cuerpo es una excelente forma de saber si estás bien hidratado.",
  },
  "act:lesson-1-3-l2-3": {
    question: "¿Qué opción tiene MÁS fibras?",
    options: ["Jugo de naranja colado", "Naranja con bagazo", "Gelatina", "Refresco de naranja"],
    explanation:
      "Al colar el jugo, las fibras se quedan atrás. La fruta entera conserva todo y además sacia más.",
  },
  "act:lesson-1-3-l2-4": {
    statement: "Al comer más fibras, también es importante beber más agua.",
    explanation:
      "El agua ayuda a las fibras a hacer su trabajo en el intestino sin causar molestias.",
  },
  "act:lesson-1-3-l2-5": {
    question: "Marca las buenas fuentes de fibras:",
    options: ["Frutas con cáscara", "Avena", "Refresco", "Frijoles", "Pan blanco"],
    explanation:
      "Las legumbres, los cereales integrales y las frutas con cáscara son ricos en fibras.",
  },
  "act:lesson-1-3-l2-x1": {
    prompt: "Clasifica según la cantidad de fibras:",
    groups: ["Buena fuente de fibras", "Poca fibra"],
    items: ["Frijoles", "Avena", "Manzana con cáscara", "Refresco", "Pan blanco", "Jugo colado"],
    explanation:
      "Los alimentos enteros e integrales concentran las fibras. Los refinados y los líquidos azucarados tienen muy poca.",
  },
  "act:lesson-1-3-l2-x2": {
    setup:
      "Beatriz aumentó de golpe el consumo de frijoles, salvado y vegetales crudos, y ahora siente la barriga hinchada.",
    question: "¿Qué podría haber hecho distinto?",
    options: [
      "Aumentar las fibras poco a poco y beber más agua",
      "Cambiar el agua por refresco",
      "Comer todo de una vez, el cuerpo se acostumbra rápido",
      "No comer nada de fibra",
    ],
    explanation:
      "El aumento brusco de fibra sin suficiente agua suele causar molestias. Lo ideal es una transición gradual.",
  },
  "act:lesson-1-3-l2-x3": {
    question: "¿Cuál de estas bebidas hidrata bien, sin azúcar añadido?",
    options: ["Agua de coco natural", "Refresco en polvo", "Jugo de caja azucarado", "Refresco"],
    explanation:
      "El agua de coco natural hidrata bien y no tiene azúcar añadido, a diferencia de las otras opciones.",
  },
  "act:lesson-1-3-l2-x4": {
    statement:
      "Las frutas y los vegetales contribuyen a la hidratación del cuerpo, además del agua que bebemos.",
    explanation:
      "Muchas frutas y verduras tienen alto contenido de agua, como la sandía, el pepino y la naranja.",
  },
  "act:lesson-1-3-l3-c1": {
    title: "Aumentar las fibras sin molestias",
    body: "Aumenta **poco a poco** y bebe más agua. Prefiere alimentos enteros a suplementos y jugos colados.",
    points: [
      "Cambia el jugo colado por la fruta entera",
      "Incluye una legumbre al día",
      "Elige granos integrales y semillas",
    ],
  },
  "act:lesson-1-3-l3-1": {
    text: "¡Nivel experto! Vamos a analizar situaciones del día a día.",
  },
  "act:lesson-1-3-l3-2": {
    question:
      "Rafa quiere cambiar el jugo de caja de la merienda escolar. ¿Cuál es el mejor cambio?",
    options: [
      "Caramelo de fruta",
      "Una fruta entera y agua",
      "Otra caja de otro sabor",
      "Refresco cero",
    ],
    explanation:
      "La fruta entera aporta fibras y vitaminas y sacia, y el agua hidrata sin azúcar añadido.",
  },
  "act:lesson-1-3-l3-3": {
    question: "¿Cuáles son posibles señales de que necesitas más agua?",
    options: ["Boca seca", "Orina muy oscura", "Sed", "Cabello brillante"],
    explanation:
      "La orina oscura, la boca seca y la sed son avisos del cuerpo. Vale la pena beber agua a lo largo del día.",
  },
  "act:lesson-1-3-l3-4": {
    statement: "Las fibras alimentarias existen solo en alimentos de origen vegetal.",
    explanation:
      "Las fibras vienen de frutas, verduras, granos y semillas. Las carnes y la leche no tienen fibras.",
  },
  "act:lesson-1-3-l3-5": {
    question: "¿La cantidad ideal de agua por día es la misma para todos?",
    options: [
      "Sí, siempre 2 litros exactos",
      "Solo importa en verano",
      "Sí, 8 vasos para todos",
      "No, varía según la edad, el clima, la actividad y la alimentación",
    ],
    explanation:
      "Las necesidades cambian de persona a persona y de día a día. Escucha a tu cuerpo y bebe a lo largo del día.",
  },
  "act:lesson-1-3-l3-6": {
    prompt: "Une el hábito con el beneficio:",
    pairs: [
      {
        left: "Comer fruta con cáscara",
        right: "Más fibras",
      },
      {
        left: "Beber agua a lo largo del día",
        right: "Buena hidratación",
      },
      {
        left: "Cambiar pan blanco por integral",
        right: "Más saciedad",
      },
      {
        left: "Incluir frijoles en el plato",
        right: "Proteína y fibras juntas",
      },
    ],
    explanation: "Los pequeños cambios del día a día suman mucho con el tiempo.",
  },
  "act:lesson-1-3-l3-x1": {
    sentence: "Al aumentar el consumo de fibras, también es importante aumentar la ingesta de ___.",
    options: ["azúcar", "grasa", "sal", "agua"],
    explanation: "El agua ayuda a las fibras a formar el bolo fecal y evita molestias.",
  },
  "act:lesson-1-3-l3-x2": {
    question: "¿Qué señales pueden indicar que necesitas beber más agua?",
    options: ["Sed intensa", "Orina muy clara", "Boca seca", "Orina muy oscura"],
    explanation:
      "La orina oscura, la boca seca y la sed son avisos del cuerpo. La orina clara suele indicar buena hidratación.",
  },
  "act:lesson-1-3-l3-x3": {
    question: "¿Aproximadamente qué porcentaje del peso corporal de un adulto es agua?",
    unit: "%",
    explanation:
      "En promedio, cerca del 60% del cuerpo adulto es agua — por eso es tan esencial para que todo funcione bien.",
  },
  "trail:escolhas": {
    title: "Alimentos y Elecciones",
    tagline: "Etiquetas, plato y rutina",
    description:
      "Del grado de procesamiento al plato equilibrado: cómo leer etiquetas, condimentar y planificar la semana.",
  },
  "unit:unit-2": {
    title: "Entendiendo los Alimentos",
    description:
      "Conviértete en un detective de etiquetas y descubre qué hay realmente en la comida.",
  },
  "stop:lesson-2-1": {
    title: "Procesados y Ultraprocesados",
    summary: "Sin procesar, procesados y ultraprocesados: cómo llega la comida al plato.",
  },
  "act:lesson-2-1-l1-c1": {
    title: "Los cuatro grupos de la Guía Alimentaria",
    body: "La **Guía Alimentaria para la Población Brasileña** clasifica los alimentos según su grado de procesamiento.",
    points: [
      "Sin procesar o mínimamente procesados: frutas, huevos, frijoles, carne fresca",
      "Ingredientes culinarios: aceite, sal, azúcar",
      "Procesados: pan, queso, conservas",
      "Ultraprocesados: refrescos, snacks, nuggets",
    ],
    tip: "Regla de oro: haz de los alimentos sin procesar la base de tu alimentación y evita los ultraprocesados.",
  },
  "act:l2-1-1": {
    text: "Hablemos del viaje de la comida. Imagina una mazorca de maíz. Es un alimento sin procesar (directo de la naturaleza).",
  },
  "act:l2-1-2": {
    text: "Si cocinas el maíz de lata con sal, se convierte en un alimento Procesado. Pero si es un 'snack de maíz' de bolsa...",
  },
  "act:l2-1-3": {
    question:
      "El snack de maíz, lleno de colorantes, conservantes y aromas de laboratorio, se clasifica como:",
    options: ["Sin procesar", "Mínimamente procesado", "Ultraprocesado", "Procesado leve"],
    explanation:
      "¡Exacto! Los ultraprocesados son inventos industriales llenos de aditivos que engañan a nuestro paladar y nos hacen comer de más.",
  },
  "act:l2-1-4": {
    statement:
      "El objetivo para ser saludable es no volver a poner jamás un alimento ultraprocesado en la boca por el resto de la vida.",
    explanation:
      "¡El secreto es el equilibrio! Pelar más y desenvolver menos la mayor parte del tiempo, pero comer un snack de vez en cuando no arruinará tu salud.",
  },
  "act:lesson-2-1-l1-x1": {
    statement: "Las frutas, las verduras y los huevos son ejemplos de alimentos sin procesar.",
    explanation:
      "¡Así es! Son alimentos tal como vienen de la naturaleza, sin pasar por la industria.",
  },
  "act:lesson-2-1-l1-x2": {
    question: "¿Cuál de estos alimentos es el MENOS procesado?",
    options: ["Galleta rellena", "Salchicha", "Manzana", "Gomita"],
    explanation:
      "La manzana viene directo del árbol. Los otros pasan por muchas etapas industriales.",
  },
  "act:lesson-2-1-l1-y1": {
    prompt: "Une el alimento con su grupo según la Guía Alimentaria:",
    pairs: [
      {
        left: "Frijol crudo",
        right: "Sin procesar",
      },
      {
        left: "Queso",
        right: "Procesado",
      },
      {
        left: "Snack de bolsa",
        right: "Ultraprocesado",
      },
      {
        left: "Aceite de soja",
        right: "Ingrediente culinario",
      },
    ],
    explanation:
      "Cada grupo tiene un papel distinto en la alimentación, y lo que importa es la proporción entre ellos.",
  },
  "act:lesson-2-1-l1-y2": {
    question: "¿Cuáles de estos son ejemplos de ultraprocesados?",
    options: [
      "Fideos instantáneos",
      "Frijoles cocidos en casa",
      "Refresco",
      "Arroz blanco crudo",
      "Salchicha",
    ],
    explanation:
      "Los fideos instantáneos, el refresco y la salchicha pasan por muchas etapas industriales y aditivos.",
  },
  "act:lesson-2-1-l1-y3": {
    question: "¿Cuál de estas opciones es un ejemplo de alimento PROCESADO (y no ultraprocesado)?",
    options: [
      "Refresco",
      "Queso artesanal hecho con leche, sal y cuajo",
      "Snack de bolsa",
      "Fideos instantáneos",
    ],
    explanation:
      "Los procesados usan pocos ingredientes y técnicas simples, como la sal y la fermentación — a diferencia de los ultraprocesados.",
  },
  "act:lesson-2-1-l1-y4": {
    prompt:
      "Piensa en lo que comiste ayer: ¿cuántas comidas tuvieron como base alimentos sin procesar o mínimamente procesados?",
  },
  "act:lesson-2-1-l2-c1": {
    title: "Por qué evitar los ultraprocesados",
    body: "Suelen tener mucho azúcar, sodio y grasas, poca fibra y varios aditivos. También son **hiperpalatables**: fáciles de comer en exceso.",
    points: [
      "Formulaciones industriales, no alimentos enteros",
      "Vinculados a un mayor consumo calórico total",
      "Sustituyen comidas de verdad",
    ],
  },
  "act:lesson-2-1-l2-1": {
    text: "Vamos a entrenar la mirada de detective: ¿cuánto procesamiento tiene cada alimento?",
  },
  "act:lesson-2-1-l2-2": {
    prompt: "Une el alimento con su clasificación:",
    pairs: [
      {
        left: "Maíz en mazorca",
        right: "Sin procesar",
      },
      {
        left: "Harina de maíz",
        right: "Mínimamente procesado",
      },
      {
        left: "Maíz en lata",
        right: "Procesado",
      },
      {
        left: "Snack de maíz",
        right: "Ultraprocesado",
      },
    ],
    explanation: "Cuantas más etapas industriales y aditivos, más procesado es el alimento.",
  },
  "act:lesson-2-1-l2-3": {
    question: "¿Cuál de estos es un alimento ultraprocesado?",
    options: ["Yogur natural", "Frijoles cocidos", "Refresco", "Huevo cocido"],
    explanation:
      "Los refrescos son fórmulas industriales de azúcar, aromas y aditivos. ¡Los otros son alimentos de verdad!",
  },
  "act:lesson-2-1-l2-4": {
    statement: "Congelar las frutas las convierte en ultraprocesados.",
    explanation:
      "Congelar es solo una forma de conservar: la fruta sigue siendo mínimamente procesada.",
  },
  "act:lesson-2-1-l2-5": {
    question: "Marca los alimentos sin procesar o mínimamente procesados:",
    options: ["Harina de maíz", "Arroz integral", "Leche", "Nuggets", "Fideos instantáneos"],
    explanation:
      "Los nuggets y los fideos instantáneos tienen muchos aditivos: son ultraprocesados.",
  },
  "act:lesson-2-1-l2-x1": {
    prompt: "Clasifica según el procesamiento:",
    groups: ["Sin procesar o mínimamente procesado", "Ultraprocesado"],
    items: ["Plátano", "Huevo", "Arroz", "Refresco", "Snack de bolsa", "Nuggets"],
    explanation:
      "Si tiene una lista larga de aditivos y viene listo para consumir, es ultraprocesado.",
  },
  "act:lesson-2-1-l2-x2": {
    setup:
      "En el supermercado, Rafael elige entre dos yogures: uno con 4 ingredientes y otro con 15, incluidos colorantes y conservantes.",
    question: "¿Qué elección sigue mejor la lógica de la Guía Alimentaria?",
    options: [
      "Da igual, son iguales",
      "El más barato, siempre",
      "El de lista más larga",
      "El de lista más corta y reconocible",
    ],
    explanation:
      "Las listas cortas y reconocibles suelen indicar alimentos menos procesados y con menos aditivos.",
  },
  "act:lesson-2-1-l2-x3": {
    statement:
      "Un producto puede considerarse ultraprocesado aunque tenga la palabra 'natural' en el envase.",
    explanation:
      "Términos como 'natural' son reclamos de marketing. La lista de ingredientes es la que dice la verdad.",
  },
  "act:lesson-2-1-l2-x4": {
    question: "¿Qué características suelen indicar un ultraprocesado?",
    options: [
      "Listo para consumir o calentar",
      "Lista larga de ingredientes irreconocibles",
      "Colorantes y aromatizantes artificiales",
      "Pocos ingredientes de tipo casero",
    ],
    explanation: "Estas son pistas clásicas de un producto muy industrializado.",
  },
  "act:lesson-2-1-l3-c1": {
    title: "Cómo decidir en el día a día",
    body: "Usa la regla **pela más, desenvuelve menos**. Compara etiquetas, cocina la base de las comidas y deja los ultraprocesados para ocasiones específicas.",
    points: [
      "Lee la lista de ingredientes",
      "Ten a mano meriendas sin procesar",
      "Prefiere versiones simples cuando compres productos listos",
    ],
  },
  "act:lesson-2-1-l3-1": {
    text: "Ahora la regla de oro: 'pela más, desenvuelve menos'. ¡Vamos a aplicarla!",
  },
  "act:lesson-2-1-l3-2": {
    prompt: "Ordena de MENOS a MÁS procesado:",
    items: ["Tomate fresco", "Tomate pelado en lata", "Kétchup", "Snack sabor pizza"],
    explanation:
      "El tomate cambia poco en la lata. El kétchup y el snack llevan azúcar, aditivos y aromas.",
  },
  "act:lesson-2-1-l3-3": {
    question: "En la merienda de la escuela, ¿qué elección sigue el 'pela más, desenvuelve menos'?",
    options: [
      "Bebida láctea de cajita",
      "Plátano y un puñado de nueces",
      "Snack de bolsa",
      "Galleta rellena",
    ],
    explanation:
      "El plátano y las nueces prácticamente no tienen procesamiento y dan energía por más tiempo.",
  },
  "act:lesson-2-1-l3-4": {
    statement: "Los ultraprocesados suelen tener mucho azúcar, sodio, grasas y aditivos.",
    explanation: "Están hechos para ser muy sabrosos y durar mucho, lo que nos hace comer más.",
  },
  "act:lesson-2-1-l3-5": {
    question: "¿Cuáles son señales de un ultraprocesado en la etiqueta?",
    options: [
      "Solo 'tomate' y 'sal'",
      "Potenciadores de sabor",
      "Colorantes y aromatizantes",
      "Lista larga con ingredientes que no tienes en casa",
    ],
    explanation: "Si la lista parece una receta de laboratorio, probablemente es ultraprocesado.",
  },
  "act:lesson-2-1-l3-6": {
    question: "¿Cuál es el objetivo más realista para una alimentación saludable?",
    options: [
      "Comer solo alimentos crudos",
      "Priorizar alimentos de verdad en el día a día, con flexibilidad",
      "No volver a comer ultraprocesados nunca más",
      "Contar cada ingrediente de cada comida",
    ],
    explanation:
      "El foco es la mayor parte del tiempo. La flexibilidad es lo que hace sostenible el hábito.",
  },
  "act:lesson-2-1-l3-x1": {
    sentence: "Una buena regla para elegir alimentos es: 'pela más, ___ menos'.",
    options: ["cocina", "desenvuelve", "mastica", "compra"],
    explanation: "Los alimentos que hay que pelar o preparar suelen ser menos procesados.",
  },
  "act:lesson-2-1-l3-x2": {
    prompt: "Ordena estos alimentos de MENOS a MÁS procesado:",
    items: ["Maíz en mazorca", "Maíz en conserva", "Harina de maíz", "Snack de maíz"],
    explanation: "Cuantas más etapas industriales, más procesado se vuelve el alimento.",
  },
  "act:lesson-2-1-l3-x3": {
    question: "Al leer la etiqueta de un producto listo, ¿qué es una buena señal?",
    options: [
      "Ausencia de lista de ingredientes",
      "Lista larga y llena de siglas",
      "Lista corta, con ingredientes que reconoces",
      "Colores vibrantes en el envase",
    ],
    explanation: "Las listas cortas y reconocibles suelen indicar un menor grado de procesamiento.",
  },
  "stop:lesson-2-2": {
    title: "Leyendo la Lista de Ingredientes",
    summary: "Lista de ingredientes: descubre qué hay realmente en el paquete.",
  },
  "act:lesson-2-2-l1-c1": {
    title: "El orden de los ingredientes importa",
    body: "Por ley, los ingredientes se enumeran de **mayor a menor** cantidad. Los tres primeros ya dicen casi todo sobre el producto.",
    points: [
      "Azúcar en primer lugar: producto hecho principalmente de azúcar",
      "Harina integral en primer lugar: más fibras",
    ],
    tip: "Una lista corta y reconocible suele ser una buena señal.",
  },
  "act:l2-2-1": {
    text: "La lista de ingredientes de un producto esconde un secreto mágico sobre cómo está ordenada. ¿Quieres descubrirlo?",
  },
  "act:l2-2-2": {
    question: "El orden de los ingredientes en la etiqueta de un producto está organizado de...",
    options: [
      "...menor cantidad a mayor.",
      "...más saludable a menos saludable.",
      "...mayor cantidad a menor (lo que hay más aparece primero).",
      "...en orden alfabético.",
    ],
    explanation:
      "Si el primer ingrediente es AZÚCAR, ¡significa que el producto está hecho principalmente de azúcar!",
  },
  "act:l2-2-3": {
    statement:
      "El azúcar añadido solo aparece con el nombre de 'Azúcar' en los envases. Es fácil de encontrar.",
    explanation:
      "La industria usa disfraces: jarabe de maíz, maltodextrina, azúcar invertido, glucosa... ¡Abre bien los ojos de detective!",
  },
  "act:l2-2-4": {
    question:
      "Entre un pan cuyo primer ingrediente es 'Harina de trigo enriquecida' y otro que es 'Harina de trigo integral', ¿cuál tiene más fibras?",
    options: [
      "El primero (harina enriquecida).",
      "El segundo (harina integral).",
      "Ambos tienen la misma cantidad.",
      "Ninguno tiene fibra.",
    ],
    explanation:
      "El pan integral de verdad siempre debe tener la harina integral como primer o segundo ingrediente de la lista.",
  },
  "act:lesson-2-2-l1-x1": {
    question: "¿Dónde encontramos la lista de ingredientes de un producto?",
    options: [
      "En la factura",
      "No existe",
      "En el reverso o en el lateral del envase",
      "Solo en la web del supermercado",
    ],
    explanation:
      "Todo alimento envasado trae la lista de ingredientes. ¡Vale siempre la pena echarle un vistazo!",
  },
  "act:lesson-2-2-l1-y1": {
    question: "¿Cuáles de estos nombres en la etiqueta indican azúcar añadido?",
    options: [
      "Jarabe de maíz",
      "Maltodextrina",
      "Harina integral",
      "Azúcar invertido",
      "Fibra de avena",
    ],
    explanation:
      "El jarabe de maíz, el azúcar invertido y la maltodextrina son formas de azúcar añadidas por la industria.",
  },
  "act:lesson-2-2-l1-y2": {
    prompt: "Une el término de la etiqueta con lo que suele significar:",
    pairs: [
      {
        left: "Glutamato monosódico",
        right: "Potenciador de sabor",
      },
      {
        left: "Colorante artificial",
        right: "Color que no es natural del alimento",
      },
      {
        left: "Conservante",
        right: "Aumenta el tiempo de conservación",
      },
    ],
    explanation: "Reconocer estos términos ayuda a entender lo que realmente tiene el producto.",
  },
  "act:lesson-2-2-l1-y3": {
    prompt: "Ordena los pasos para investigar una etiqueta:",
    items: [
      "Mira la lista de ingredientes",
      "Identifica los 3 primeros elementos",
      "Busca nombres disfrazados de azúcar",
      "Decide con base en lo que encontraste",
    ],
    explanation:
      "Seguir un orden simple hace que el hábito de leer etiquetas sea más rápido en el día a día.",
  },
  "act:lesson-2-2-l1-y4": {
    prompt:
      "Elige un producto industrializado que tengas en casa. ¿Qué notas al leer su lista de ingredientes?",
  },
  "act:lesson-2-2-l2-c1": {
    title: "Nombres que esconden azúcar y aditivos",
    body: "La industria usa decenas de nombres. Aprender a reconocerlos ayuda a elegir mejor.",
    points: [
      "Azúcar: jarabe de maíz, glucosa, maltodextrina, azúcar invertido",
      "Potenciadores: glutamato monosódico",
      "Colorantes y aromatizantes artificiales",
    ],
  },
  "act:lesson-2-2-l2-1": {
    text: "¿Listo para investigar etiquetas? ¡Vamos a practicar con nombres disfrazados!",
  },
  "act:lesson-2-2-l2-2": {
    prompt: "Une el nombre con lo que significa en la etiqueta:",
    pairs: [
      {
        left: "Jarabe de maíz",
        right: "Un tipo de azúcar",
      },
      {
        left: "Maltodextrina",
        right: "Carbohidrato de absorción rápida",
      },
      {
        left: "Harina integral",
        right: "Fuente de fibras",
      },
      {
        left: "Glutamato monosódico",
        right: "Potenciador de sabor",
      },
    ],
    explanation:
      "El azúcar y los aditivos tienen muchos nombres. Reconocerlos es ganar poder de elección.",
  },
  "act:lesson-2-2-l2-3": {
    question:
      "Un cereal de desayuno enumera: 'azúcar, harina de trigo, jarabe de glucosa...'. ¿Qué indica esto?",
    options: [
      "Que no tiene azúcar",
      "Que es rico en fibras",
      "Que es 100% natural",
      "Que está hecho principalmente de azúcar y harina refinada",
    ],
    explanation:
      "Los primeros ingredientes son los que aparecen en mayor cantidad. ¡Azúcar en primer lugar es una alerta!",
  },
  "act:lesson-2-2-l2-4": {
    statement: "Cuanto más corta y simple sea la lista de ingredientes, en general mejor.",
    explanation:
      "Las listas cortas con ingredientes que reconoces suelen indicar alimentos menos procesados.",
  },
  "act:lesson-2-2-l2-5": {
    question: "¿Qué nombres indican azúcar añadido?",
    options: ["Azúcar invertido", "Avena", "Maltodextrina", "Harina integral", "Jarabe de glucosa"],
    explanation:
      "Los jarabes, el azúcar invertido y la maltodextrina son formas de azúcar añadidas por la industria.",
  },
  "act:lesson-2-2-l2-x1": {
    prompt: "¿Este ingrediente indica azúcar añadido?",
    groups: ["Indica azúcar", "No indica azúcar"],
    items: [
      "Jarabe de glucosa",
      "Maltodextrina",
      "Azúcar invertido",
      "Harina integral",
      "Avena",
      "Sal",
    ],
    explanation:
      "Los jarabes, la maltodextrina y el azúcar invertido son formas de azúcar. La avena, la harina integral y la sal no.",
  },
  "act:lesson-2-2-l2-x2": {
    setup:
      "Dos cajas de cereal: la primera enumera 'avena, pasas, canela'. La segunda enumera 'azúcar, harina de trigo, jarabe de maíz, colorante caramelo, aromatizante'.",
    question: "¿Cuál es la mejor elección, mirando solo la lista de ingredientes?",
    options: ["Las dos son iguales", "La primera", "La segunda", "Depende solo del precio"],
    explanation:
      "La primera lista es corta y reconocible. La segunda tiene azúcar en primer lugar y varios aditivos.",
  },
  "act:lesson-2-2-l2-x3": {
    question: "'Colorante caramelo' en la lista de ingredientes es:",
    options: [
      "Un conservante natural",
      "Un tipo de azúcar saludable",
      "Un aditivo para dar color, sin valor nutritivo",
      "Una fuente de fibras",
    ],
    explanation:
      "Es un colorante artificial usado solo para dar color al producto, sin ningún valor nutricional.",
  },
  "act:lesson-2-2-l2-x4": {
    statement: "Un producto puede tener azúcar aunque la palabra 'azúcar' no aparezca en la lista.",
    explanation:
      "Nombres como jarabe de maíz, dextrosa y maltodextrina son formas de azúcar disfrazadas.",
  },
  "act:lesson-2-2-l3-c1": {
    title: "Lo que el frente del envase no cuenta",
    body: "Términos como 'natural', 'fit', 'cero' e 'integral' son **reclamos de marketing**. La verdad está en la lista de ingredientes y en la tabla nutricional.",
    points: [
      "'Integral' exige harina integral como ingrediente principal",
      "'Cero azúcar' puede tener edulcorantes y otros aditivos",
    ],
  },
  "act:lesson-2-2-l3-1": {
    text: "Ahora es la prueba de detective: ¡comparar productos de verdad!",
  },
  "act:lesson-2-2-l3-2": {
    question:
      "Producto A: 'avena, plátano, canela'. Producto B: 'azúcar, harina, grasa hidrogenada, aromatizante'. ¿Cuál tiene la lista más simple?",
    options: ["No se puede saber", "El producto A", "Los dos son iguales", "El producto B"],
    explanation: "El producto A tiene pocos ingredientes reconocibles. ¡Es una gran señal!",
  },
  "act:lesson-2-2-l3-3": {
    statement: "Un producto 'cero azúcar' siempre es un alimento saludable.",
    explanation:
      "Cero azúcar puede tener edulcorantes y otros aditivos. Lee la lista completa antes de decidir.",
  },
  "act:lesson-2-2-l3-4": {
    question: "¿Cuáles son pistas de que un pan 'integral' puede no ser tan integral?",
    options: [
      "Harina refinada como primer ingrediente",
      "El color oscuro, solamente",
      "Colorante caramelo en la lista",
      "Harina integral como primer ingrediente",
    ],
    explanation:
      "¡El color oscuro puede venir de un colorante! El primer ingrediente debe ser harina integral.",
  },
  "act:lesson-2-2-l3-5": {
    prompt: "Une el término con su significado:",
    pairs: [
      {
        left: "Harina de trigo enriquecida",
        right: "Refinada, con poca fibra",
      },
      {
        left: "Ingrediente enumerado primero",
        right: "Lo que existe en mayor cantidad",
      },
      {
        left: "Contiene leche y soja",
        right: "Aviso sobre alérgenos",
      },
      {
        left: "Fecha de caducidad",
        right: "Hasta cuándo el fabricante garantiza la calidad",
      },
    ],
    explanation: "Cada parte de la etiqueta tiene una función. Saber leerla toda protege tu salud.",
  },
  "act:lesson-2-2-l3-6": {
    question:
      "¿Qué es lo primero que hay que mirar en una etiqueta para saber si el producto es una buena elección?",
    options: [
      "Los primeros ingredientes de la lista",
      "Los dibujos de la mascota",
      "Los colores del envase",
      "La frase 'natural' en el frente",
    ],
    explanation: "El marketing del frente puede engañar. La lista de ingredientes dice la verdad.",
  },
  "act:lesson-2-2-l3-x1": {
    sentence: "El primer ingrediente de la lista es el que existe en ___ cantidad en el producto.",
    options: ["igual", "menor", "ninguna", "mayor"],
    explanation: "La lista sigue el orden decreciente de cantidad.",
  },
  "act:lesson-2-2-l3-x2": {
    question: "¿Cuáles de estos son nombres alternativos para el azúcar en las etiquetas?",
    options: ["Jarabe de glucosa-fructosa", "Dextrosa", "Melaza", "Harina integral"],
    explanation:
      "La dextrosa, la melaza y el jarabe de glucosa-fructosa son todas formas de azúcar.",
  },
  "act:lesson-2-2-l3-x3": {
    question:
      "¿Aproximadamente cuántos ingredientes distintos suele tener un alimento ultraprocesado típico?",
    unit: " ingredientes",
    explanation:
      "Los ultraprocesados suelen tener listas largas, a menudo con 10 a 20 ingredientes y aditivos.",
  },
  "stop:lesson-2-3": {
    title: "La Tabla Nutricional",
    summary: "Tabla nutricional: porción, %VD y qué vale la pena comparar.",
  },
  "act:lesson-2-3-l1-c1": {
    title: "Leer la tabla en 3 pasos",
    body: "La tabla nutricional trae información estandarizada. El secreto es seguir un orden.",
    points: [
      "1. Mira el tamaño de la porción",
      "2. Mira las calorías y los nutrientes por porción",
      "3. Compara el %VD (valor diario)",
    ],
    tip: "Muchos paquetes traen varias porciones. Comerlo todo es multiplicar los valores.",
  },
  "act:l2-3-1": {
    text: "¿Conoces esa tablita en blanco y negro en el reverso del paquete? Es tu mejor amiga para elegir rápido.",
  },
  "act:l2-3-2": {
    question: "Lo primero que DEBES mirar al leer una tabla nutricional es:",
    options: [
      "La porción (para qué cantidad sirven esos números).",
      "Las calorías.",
      "La cantidad de hierro.",
      "Si tiene gluten.",
    ],
    explanation:
      "¡Cuidado con las trampas! A veces un paquete parece tener pocas calorías, pero la tabla está calculada solo para 2 galletas (y el paquete trae 20).",
  },
  "act:l2-3-3": {
    statement:
      "Si algo dice '0% de grasa trans', significa que puedes comer paquetes enteros sin preocupación.",
    explanation:
      "Incluso sin grasa trans, los productos pueden ser riquísimos en azúcar o sodio. Observa siempre el panorama general.",
  },
  "act:lesson-2-3-l1-x1": {
    statement: "La tabla nutricional muestra los valores por porción del producto.",
    explanation: "¡Sí! Por eso siempre miramos primero el tamaño de la porción.",
  },
  "act:lesson-2-3-l1-x2": {
    question: "El 'sodio' que aparece en la tabla nutricional es un componente de qué ingrediente?",
    options: ["De las grasas buenas", "De la sal", "De las fibras", "De las vitaminas"],
    explanation:
      "El sodio viene principalmente de la sal. En exceso, puede aumentar la presión arterial.",
  },
  "act:lesson-2-3-l1-y1": {
    question:
      "Un paquete de galletas tiene 4 porciones. Si la tabla muestra 120 kcal por porción, ¿cuántas calorías tiene el paquete entero?",
    unit: " kcal",
    explanation:
      "4 porciones × 120 kcal = 480 kcal. Comer el paquete entero es multiplicar los valores de la tabla por el número de porciones.",
  },
  "act:lesson-2-3-l1-y2": {
    prompt: "Une el término de la tabla con lo que representa:",
    pairs: [
      {
        left: "Valor energético",
        right: "Calorías de la porción",
      },
      {
        left: "%VD",
        right: "Porcentaje del valor diario de referencia",
      },
      {
        left: "Porción",
        right: "Cantidad usada para calcular los valores",
      },
    ],
    explanation:
      "Entender estos tres términos ya resuelve buena parte de la lectura de cualquier tabla.",
  },
  "act:lesson-2-3-l1-y3": {
    question: "Antes de comparar dos productos por la tabla nutricional, es importante:",
    options: [
      "Ignorar la porción y mirar solo el total del paquete",
      "Elegir por el color del envase",
      "Comparar por la misma cantidad, como 100 g",
      "Mirar el tamaño de la porción de cada uno",
    ],
    explanation: "Sin ajustar a la misma cantidad, la comparación entre productos no es justa.",
  },
  "act:lesson-2-3-l1-y4": {
    prompt:
      "Toma un alimento envasado que tengas cerca (o recuerda uno). ¿Cuántas porciones tiene el paquete y cuántas sueles comer de una vez?",
  },
  "act:lesson-2-3-l2-c1": {
    title: "%VD: ¿alto o bajo?",
    body: "El %VD muestra cuánto de la necesidad diaria de referencia (2.000 kcal) aporta la porción. Anvisa usa una regla práctica:",
    points: ["**5% o menos**: bajo", "**20% o más**: alto"],
    tip: "Para las fibras, alto es excelente. Para el sodio, los azúcares y las grasas saturadas, alto pide atención.",
  },
  "act:lesson-2-3-l2-1": {
    text: "¡Tabla nutricional en mano! Vamos a practicar las cuentas y las comparaciones.",
  },
  "act:lesson-2-3-l2-2": {
    prompt: "Une cada elemento de la tabla con lo que quiere decir:",
    pairs: [
      {
        left: "Porción",
        right: "La cantidad a la que se refieren los números",
      },
      {
        left: "Sodio",
        right: "Viene de la sal; en exceso pesa en la presión",
      },
      {
        left: "Azúcares añadidos",
        right: "Azúcar puesto por la industria",
      },
      {
        left: "Fibra alimentaria",
        right: "Ayuda a la saciedad y al intestino",
      },
    ],
    explanation: "Mirar primero la porción evita los números engañosos.",
  },
  "act:lesson-2-3-l2-3": {
    question:
      "Un paquete tiene 4 porciones de 30 g. Si comes todo, los valores de la tabla deben multiplicarse por:",
    options: ["2", "1", "30", "4"],
    explanation:
      "La tabla muestra los valores de UNA porción. Comer el paquete entero es comer 4 porciones.",
  },
  "act:lesson-2-3-l2-4": {
    statement: "Los valores diarios (%VD) se basan en una dieta de referencia de 2.000 kcal.",
    explanation: "Es una referencia general. Las necesidades reales varían de persona a persona.",
  },
  "act:lesson-2-3-l2-5": {
    question: "¿Qué vale la pena mirar al comparar dos productos?",
    options: ["La porción", "El sodio", "El color del envase", "Los azúcares añadidos"],
    explanation:
      "Compara siempre en la misma cantidad (por 100 g, por ejemplo) y mira los azúcares y el sodio.",
  },
  "act:lesson-2-3-l2-x1": {
    prompt: "¿Este nutriente suele ser para limitar o para buscar?",
    groups: ["Limitar", "Buscar"],
    items: [
      "Sodio",
      "Grasa saturada",
      "Azúcares añadidos",
      "Fibra alimentaria",
      "Proteínas",
      "Vitaminas y minerales",
    ],
    explanation:
      "No se trata de prohibir: se trata de equilibrar. Cuantas más fibras y micronutrientes, mejor.",
  },
  "act:lesson-2-3-l2-x2": {
    setup:
      "Dos barras de cereal, con la misma porción de 20 g: la barra A tiene 90 kcal y 3 g de azúcar; la barra B tiene 90 kcal y 12 g de azúcar.",
    question: "¿Cuál tiene menos azúcar añadido, considerando la misma porción?",
    options: ["Las dos tienen igual", "No se puede saber", "La barra A", "La barra B"],
    explanation:
      "Con la misma porción y las mismas calorías, la barra A tiene mucho menos azúcar: una elección más equilibrada.",
  },
  "act:lesson-2-3-l2-x3": {
    question: "Si una etiqueta muestra '2 porciones por envase' y comes el envase entero, debes:",
    options: [
      "Dividir los valores por 2",
      "Ignorar la tabla",
      "Multiplicar los valores de la tabla por 2",
      "Usar solo el valor de 1 porción",
    ],
    explanation:
      "Al comer las dos porciones, los valores de calorías y nutrientes también se duplican.",
  },
  "act:lesson-2-3-l2-x4": {
    statement:
      "Dos porciones idénticas en peso (100 g) de productos distintos pueden compararse directamente por la tabla.",
    explanation:
      "Cuando la cantidad es igual, la comparación directa entre los nutrientes es justa.",
  },
  "act:lesson-2-3-l3-c1": {
    title: "Comparando productos",
    body: "Compara siempre por la **misma cantidad** (100 g o 100 ml) y mira los nutrientes que importan.",
    points: [
      "Limita: sodio, azúcares añadidos, grasa saturada",
      "Busca: fibras, proteínas, vitaminas y minerales",
    ],
  },
  "act:lesson-2-3-l3-1": {
    text: "¡Última fase de la tabla! Ahora entran el %VD, las comparaciones y las decisiones.",
  },
  "act:lesson-2-3-l3-2": {
    prompt: "Une el %VD con su interpretación:",
    pairs: [
      {
        left: "20% VD o más por porción",
        right: "Alto",
      },
      {
        left: "5% VD o menos por porción",
        right: "Bajo",
      },
      {
        left: "Fibra con %VD alto",
        right: "En general, ¡excelente!",
      },
      {
        left: "Sodio con %VD alto",
        right: "Atención al exceso",
      },
    ],
    explanation:
      "Para los nutrientes que queremos en menor cantidad, un %VD alto es una alerta. Para las fibras, es bienvenido.",
  },
  "act:lesson-2-3-l3-3": {
    question: "Un producto tiene el 30% del VD de sodio por porción. Esto significa:",
    options: [
      "Muy poca sal",
      "Que no tiene sal",
      "Casi un tercio del límite diario en una sola porción",
      "Que siempre es saludable",
    ],
    explanation:
      "Si comes más de una porción, el valor sube rápidamente. Vale la pena elegir versiones con menos sodio.",
  },
  "act:lesson-2-3-l3-4": {
    prompt: "Ordena los pasos para leer una tabla:",
    items: [
      "Ver el tamaño de la porción",
      "Calcular cuánto vas a comer realmente",
      "Mirar azúcares, sodio y grasas",
      "Comparar con otro producto parecido",
    ],
    explanation: "Empezar por la porción evita comparar cosas distintas.",
  },
  "act:lesson-2-3-l3-5": {
    question: "¿Qué nutrientes, en general, debemos limitar?",
    options: ["Sodio", "Grasa saturada", "Fibra alimentaria", "Azúcares añadidos"],
    explanation: "La fibra, en cambio, es un nutriente que conviene buscar más, no limitar.",
  },
  "act:lesson-2-3-l3-6": {
    statement: "Un %VD alto de fibras es un problema.",
    explanation:
      "Las fibras son amigas: ayudan a la saciedad y al intestino. Cuanto más, mejor (¡con agua!).",
  },
  "act:lesson-2-3-l3-x1": {
    sentence: "Un valor de 20% VD o más en una porción se considera ___.",
    options: ["alto", "bajo", "inexistente", "normal"],
    explanation: "Según la regla práctica, 5% o menos es bajo y 20% o más es alto.",
  },
  "act:lesson-2-3-l3-x2": {
    question: "Al comparar etiquetas, ¿qué nutrientes vale la pena LIMITAR?",
    options: ["Grasas saturadas", "Sodio", "Fibras", "Azúcares añadidos"],
    explanation: "La fibra es el nutriente que vale la pena buscar más, no limitar.",
  },
  "act:lesson-2-3-l3-x3": {
    prompt: "Ordena los pasos para comparar dos productos parecidos:",
    items: [
      "Verifica la porción de cada uno",
      "Ajusta a la misma cantidad, como 100 g",
      "Compara sodio, azúcar y grasa saturada",
      "Elige el que tenga menos de estos y más fibra",
    ],
    explanation: "Comparar sobre la misma base es lo que hace la elección realmente justa.",
  },
  "unit:unit-3": {
    title: "Armando Tu Plato",
    description:
      "¡De la teoría a la práctica! Descubre cómo armar platos sabrosos y equilibrados en el día a día.",
  },
  "stop:lesson-3-1": {
    title: "El Plato Equilibrado",
    summary: "El plato equilibrado: proporciones simples para el almuerzo y la cena.",
  },
  "act:lesson-3-1-l1-c1": {
    title: "El plato equilibrado",
    body: "Una referencia visual simple: **la mitad** del plato de verduras y ensaladas, **un cuarto** de proteínas y **un cuarto** de carbohidratos.",
    points: [
      "La mitad: verduras, hortalizas y ensaladas",
      "Un cuarto: frijoles, huevo, carnes, pescado",
      "Un cuarto: arroz, papa, yuca, pastas",
    ],
    tip: "Es una referencia flexible, no una regla rígida.",
  },
  "act:l3-1-1": {
    text: "El método del 'Plato Equilibrado' es una regla visual simple para el almuerzo y la cena que no necesita báscula.",
  },
  "act:l3-1-2": {
    question:
      "En el modelo ideal del plato equilibrado, la MITAD (50%) del plato debería llenarse con:",
    options: [
      "Carbohidratos (arroz, pasta, papa)",
      "Proteínas (carnes, huevos)",
      "Verduras y Ensaladas (hortalizas, verduras frescas)",
      "Postre",
    ],
    explanation:
      "¡Eso es! Las verduras llenan el plato de vitaminas y fibras y dan volumen y saciedad con pocas calorías.",
  },
  "act:l3-1-3": {
    statement:
      "No se puede poner Arroz y Papa en el mismo plato, porque son carbohidratos peleando por espacio.",
    explanation:
      "¡Sí se puede! Lo importante es la cantidad. Si usas dos carbohidratos, solo reduce un poco de cada uno para que quepan en la cuota del 25% (un cuarto) del plato.",
  },
  "act:lesson-3-1-l1-x1": {
    statement: "Un plato muy colorido suele ser más nutritivo.",
    explanation:
      "Los colores naturales indican vitaminas y minerales distintos. ¡Cuantos más colores, mejor!",
  },
  "act:lesson-3-1-l1-x2": {
    question: "En el plato equilibrado, ¿cuánto ocupan las proteínas?",
    options: ["La mitad", "Nada", "Cerca de un cuarto", "El plato entero"],
    explanation: "Un cuarto de proteínas, un cuarto de carbohidratos y la mitad de verduras.",
  },
  "act:lesson-3-1-l1-y1": {
    question: "¿Cuáles de estos alimentos entran en la mitad de 'verduras' del plato equilibrado?",
    options: ["Papas fritas", "Col rizada salteada", "Ensalada de tomate y pepino", "Arroz"],
    explanation:
      "La col rizada y la ensalada de tomate y pepino son verduras. El arroz y las papas fritas son carbohidratos.",
  },
  "act:lesson-3-1-l1-y2": {
    prompt: "Une el alimento con la parte del plato equilibrado que ocupa:",
    pairs: [
      {
        left: "Frijoles",
        right: "Proteínas",
      },
      {
        left: "Puré de papa",
        right: "Carbohidratos",
      },
      {
        left: "Calabacín a la plancha",
        right: "Verduras",
      },
    ],
    explanation:
      "Saber dónde encaja cada alimento ayuda a armar el plato sin necesidad de pesar nada.",
  },
  "act:lesson-3-1-l1-y3": {
    prompt: "Ordena cómo armar un plato equilibrado en un buffet:",
    items: [
      "Empieza llenando la mitad del plato con ensaladas y verduras",
      "Añade un cuarto de proteína",
      "Completa un cuarto con carbohidrato",
      "Aliña con aceite de oliva y hierbas",
    ],
    explanation: "Empezar por las verduras garantiza que ocupen la mitad del plato.",
  },
  "act:lesson-3-1-l1-y4": {
    prompt:
      "Piensa en tu almuerzo de hoy o de ayer: ¿se acercó al plato equilibrado? ¿Qué faltó o qué sobró?",
  },
  "act:lesson-3-1-l2-c1": {
    title: "Eligiendo dentro de cada parte",
    body: "Varía a lo largo de la semana para cubrir todos los nutrientes.",
    points: [
      "Verduras: varía los colores",
      "Proteínas: alterna frijoles, huevo, pescado y carnes",
      "Carbohidratos: prefiere integrales y raíces",
    ],
  },
  "act:lesson-3-1-l2-1": {
    text: "¡Vamos a armar platos de verdad! ¿Dónde encaja cada grupo de alimentos?",
  },
  "act:lesson-3-1-l2-2": {
    prompt: "Une la parte del plato con lo que debe ocuparla:",
    pairs: [
      {
        left: "La mitad del plato",
        right: "Verduras y ensaladas",
      },
      {
        left: "Un cuarto: energía",
        right: "Carbohidratos (arroz, papa)",
      },
      {
        left: "Un cuarto: construcción",
        right: "Proteínas (frijoles, huevo, carne)",
      },
    ],
    explanation: "Es una regla visual simple: sin báscula y sin contar calorías.",
  },
  "act:lesson-3-1-l2-3": {
    question: "¿Qué plato está más equilibrado?",
    options: [
      "Solo pasta con salsa de bote",
      "Solo carne asada",
      "Papas fritas y refresco",
      "Ensalada colorida, arroz, frijoles y huevo",
    ],
    explanation: "Verduras, carbohidrato y proteína juntos: un plato completo y económico.",
  },
  "act:lesson-3-1-l2-4": {
    statement: "Los frijoles son una buena fuente de proteínas y fibras.",
    explanation:
      "Además de proteínas y fibras, los frijoles aportan hierro. ¡Combinan perfectamente con el arroz!",
  },
  "act:lesson-3-1-l2-5": {
    question: "Marca los alimentos que pueden ocupar el cuarto de las proteínas:",
    options: ["Huevo", "Pollo", "Frijoles", "Pasta", "Pescado"],
    explanation:
      "La pasta es fuente de carbohidrato, lo cual también es excelente, pero ocupa otro cuarto del plato.",
  },
  "act:lesson-3-1-l2-x1": {
    prompt: "¿En qué parte del plato equilibrado entra cada alimento?",
    groups: ["La mitad: verduras", "Un cuarto: proteínas", "Un cuarto: carbohidratos"],
    items: ["Brócoli", "Lechuga", "Huevo", "Pollo", "Arroz", "Papa"],
    explanation:
      "Las verduras ocupan la mitad; las proteínas y los carbohidratos se reparten la otra mitad.",
  },
  "act:lesson-3-1-l2-x2": {
    setup:
      "En el restaurante de buffet por peso, el plato de Júlia quedó con arroz, pasta y papa, sin ninguna ensalada.",
    question: "¿Qué podría ajustar para acercarse al plato equilibrado?",
    options: [
      "Quitar toda la proteína",
      "Cambiar parte de los carbohidratos por ensaladas y verduras",
      "Está perfecto así",
      "Añadir un carbohidrato más",
    ],
    explanation:
      "Reducir un poco los carbohidratos (que están por triplicado) e incluir verduras deja el plato más equilibrado.",
  },
  "act:lesson-3-1-l2-x3": {
    question:
      "En el plato equilibrado, los carbohidratos como el arroz, la papa y las pastas suelen ocupar:",
    options: ["El plato entero", "Un cuarto del plato", "La mitad del plato", "Solo el postre"],
    explanation:
      "Un cuarto para los carbohidratos, un cuarto para las proteínas y la mitad para las verduras.",
  },
  "act:lesson-3-1-l2-x4": {
    statement: "Hay que excluir por completo los carbohidratos para tener un plato equilibrado.",
    explanation:
      "Los carbohidratos forman parte del plato equilibrado, solo que no deben dominar todo el espacio.",
  },
  "act:lesson-3-1-l3-c1": {
    title: "Adaptándolo a la vida real",
    body: "Vianda, restaurante o merienda: la lógica es la misma. Si en una comida faltaron verduras, compénsalo en la siguiente, **sin culpa**.",
    points: [
      "En el buffet, empieza por las ensaladas",
      "En las meriendas, incluye una fruta o frutos secos",
    ],
  },
  "act:lesson-3-1-l3-1": {
    text: "¡Situaciones reales de plato! Vamos a usar lo que ya sabes.",
  },
  "act:lesson-3-1-l3-2": {
    question:
      "En el restaurante de buffet por peso, ya pusiste arroz y papa. ¿Qué hacer con el resto del plato?",
    options: [
      "Dejar el plato a la mitad",
      "Reducir un poco de cada uno y completar con mucha ensalada y una proteína",
      "Poner solo más papa",
      "Completar con postre",
    ],
    explanation:
      "Las verduras llenan la mitad, y la proteína completa. Dos carbohidratos caben si comparten un cuarto.",
  },
  "act:lesson-3-1-l3-3": {
    prompt: "Ordena cómo armar el plato sin olvidar nada:",
    items: [
      "Empieza por las verduras y ensaladas",
      "Añade la fuente de proteína",
      "Completa con el carbohidrato",
      "Termina con un chorrito de aceite de oliva y condimentos",
    ],
    explanation: "Empezar por las verduras garantiza que ocupen la mitad del plato.",
  },
  "act:lesson-3-1-l3-4": {
    statement: "En el plato equilibrado, el postre dulce todos los días está prohibido.",
    explanation:
      "¡Nada está prohibido! El equilibrio vale para toda la semana. Fruta de postre es una gran idea.",
  },
  "act:lesson-3-1-l3-5": {
    question: "¿Cómo dejar el plato más colorido y nutritivo?",
    options: ["Solo alimentos blancos", "Remolacha", "Zanahoria rallada", "Hojas verde oscuro"],
    explanation: "Cada color natural aporta nutrientes distintos. ¡Cuantos más colores, mejor!",
  },
  "act:lesson-3-1-l3-6": {
    prompt: "Une la comida con la sugerencia de armado:",
    pairs: [
      {
        left: "Almuerzo",
        right: "Ensalada, arroz, frijoles y huevo",
      },
      {
        left: "Merienda",
        right: "Fruta con yogur natural",
      },
      {
        left: "Cena ligera",
        right: "Sopa de verduras con pollo desmenuzado",
      },
      {
        left: "Desayuno",
        right: "Pan integral, huevo y fruta",
      },
    ],
    explanation:
      "¡Armar comidas es creatividad! Combina verduras, proteína y una fuente de energía.",
  },
  "act:lesson-3-1-l3-x1": {
    sentence: "En el plato equilibrado, la ___ del plato debe llenarse con verduras y ensaladas.",
    options: ["quinta parte", "décima parte", "totalidad", "mitad"],
    explanation:
      "La mitad del plato de verduras da volumen, fibras y vitaminas con pocas calorías.",
  },
  "act:lesson-3-1-l3-x2": {
    question: "¿Cuáles son buenas fuentes de proteína para el cuarto del plato equilibrado?",
    options: ["Frijoles", "Papa", "Pollo", "Huevo"],
    explanation:
      "Los frijoles, el huevo y el pollo son proteínas. La papa es una fuente de carbohidrato.",
  },
  "act:lesson-3-1-l3-x3": {
    question:
      "¿Cuántos gramos de frijoles cocidos (cerca de un cucharón mediano) suele servirse una persona en una comida?",
    unit: " g",
    explanation:
      "Un cucharón mediano de frijoles cocidos suele pesar entre 50 y 110 g, con un promedio de unos 80 g.",
  },
  "stop:lesson-3-2": {
    title: "El Poder de los Condimentos",
    summary: "Condimentos naturales: mucho sabor con poca sal y sin cubitos.",
  },
  "act:lesson-3-2-l1-c1": {
    title: "Sabor sin exceso de sal",
    body: "El alto consumo de sodio se asocia con la hipertensión. Las hierbas, las especias, el ajo, la cebolla y los cítricos aumentan el sabor y **reducen la necesidad de sal**.",
    points: [
      "Prefiere condimentos naturales a los cubitos de caldo y a los condimentos preparados",
      "La sal gruesa tiene el mismo sodio que la refinada",
    ],
  },
  "act:l3-2-1": {
    text: "Comer saludable no significa comer pollo seco sin sal. ¡La cocina es mágica y los condimentos naturales salvan el sabor!",
  },
  "act:l3-2-2": {
    question:
      "¿Cuál de estas opciones es la mejor elección para dar sabor a las comidas del día a día cuidando la salud?",
    options: [
      "Cubitos de caldo listo sabor carne/pollo (altamente procesados).",
      "Condimento casero de ajo, cebolla y hierbas frescas/secas (orégano, albahaca, cúrcuma).",
      "Mucha sal refinada sola.",
      "Margarina en gran cantidad.",
    ],
    explanation:
      "¡Eso es! Los condimentos naturales como el ajo, la cebolla, el pimentón, la cúrcuma y el orégano aportan mucho sabor y además son antiinflamatorios.",
  },
  "act:l3-2-3": {
    statement:
      "Añadir limón sobre las verduras oscuras (como espinaca o col rizada) y en los frijoles aumenta la absorción del hierro.",
    explanation:
      "¡Totalmente cierto! La vitamina C del limón ayuda al cuerpo a captar mejor el hierro de origen vegetal (hierro no hemo).",
  },
  "act:lesson-3-2-l1-x1": {
    statement: "El ajo y la cebolla son condimentos naturales muy usados en la cocina brasileña.",
    explanation: "Son la base de muchos sofritos y dan sabor sin necesidad de mucha sal.",
  },
  "act:lesson-3-2-l1-x2": {
    question: "¿Qué condimento da un color dorado a los platos?",
    options: ["Sal refinada", "Cúrcuma", "Azúcar", "Vinagre"],
    explanation:
      "La cúrcuma tiene color dorado y sabor suave, excelente en arroz, huevos y verduras.",
  },
  "act:lesson-3-2-l1-y1": {
    prompt: "Une el condimento con el plato con el que combina bien:",
    pairs: [
      {
        left: "Albahaca",
        right: "Salsa de tomate",
      },
      {
        left: "Comino",
        right: "Frijoles y carnes",
      },
      {
        left: "Canela",
        right: "Frutas y dulces",
      },
      {
        left: "Cilantro",
        right: "Pescados y caldos",
      },
    ],
    explanation: "Conocer estas combinaciones clásicas facilita variar el sabor de las comidas.",
  },
  "act:lesson-3-2-l1-y2": {
    question: "¿Cuáles de estos son condimentos NATURALES (no industrializados)?",
    options: [
      "Cebolla",
      "Orégano",
      "Condimento preparado con potenciador",
      "Cubito de caldo",
      "Ajo",
    ],
    explanation:
      "El ajo, la cebolla y el orégano son condimentos naturales. Los otros son industrializados y concentran sodio.",
  },
  "act:lesson-3-2-l1-y3": {
    prompt: "Ordena la preparación de un sofrito sabroso:",
    items: [
      "Calienta el aceite de oliva",
      "Dora la cebolla",
      "Añade el ajo al final",
      "Condimenta con hierbas al terminar",
    ],
    explanation:
      "El ajo se quema rápido: entra después de la cebolla. Las hierbas delicadas van al final.",
  },
  "act:lesson-3-2-l1-y4": {
    prompt: "¿Qué condimento usas con menos frecuencia en casa y podrías probar esta semana?",
  },
  "act:lesson-3-2-l2-c1": {
    title: "Guía rápida de hierbas y especias",
    body: "Cada condimento combina mejor con ciertos platos.",
    points: [
      "Albahaca: salsas de tomate y pastas",
      "Cilantro: pescados, caldos y ensaladas",
      "Romero: asados y papas",
      "Cúrcuma: arroz, huevos y verduras",
    ],
  },
  "act:lesson-3-2-l2-1": {
    text: "¡Los condimentos naturales hacen magia! Vamos a conocerlos mejor.",
  },
  "act:lesson-3-2-l2-2": {
    prompt: "Une el condimento con lo que mejor hace:",
    pairs: [
      {
        left: "Ajo",
        right: "Sabor marcado para sofritos",
      },
      {
        left: "Cúrcuma",
        right: "Color dorado y sabor terroso",
      },
      {
        left: "Limón",
        right: "Acidez que realza el sabor",
      },
      {
        left: "Orégano",
        right: "Hierba seca excelente en salsas",
      },
    ],
    explanation: "Las hierbas, las especias y los cítricos dan sabor sin necesidad de mucha sal.",
  },
  "act:lesson-3-2-l2-3": {
    question: "Para reducir la sal sin perder sabor, ¿qué usar?",
    options: [
      "Sal gruesa en lugar de la fina",
      "Salsa lista",
      "Hierbas, limón y ajo",
      "Más cubitos de caldo",
    ],
    explanation:
      "Las hierbas y los cítricos dan sabor de sobra. ¡La sal gruesa tiene el mismo sodio que la fina!",
  },
  "act:lesson-3-2-l2-4": {
    statement: "La sal rosa o del Himalaya no tiene sodio.",
    explanation:
      "Toda la sal está hecha de sodio y cloro. El tipo cambia el color y el cristal, no el sodio.",
  },
  "act:lesson-3-2-l2-5": {
    question: "Marca los condimentos naturales:",
    options: ["Comino", "Potenciador de sabor", "Cebollín", "Cubito de caldo", "Perejil"],
    explanation:
      "Los cubitos de caldo y los potenciadores son industrializados y concentrados en sodio.",
  },
  "act:lesson-3-2-l2-x1": {
    prompt: "¿Condimento natural o industrializado?",
    groups: ["Condimento natural", "Industrializado"],
    items: [
      "Ajo",
      "Perejil",
      "Comino",
      "Cubito de caldo",
      "Condimento preparado con potenciador",
      "Sazonador artificial",
    ],
    explanation:
      "Los industrializados concentran sodio y aditivos. Los naturales aportan sabor y compuestos beneficiosos.",
  },
  "act:lesson-3-2-l2-x2": {
    setup: "A Pedro la comida le parece sosa y siempre añade mucha sal o usa cubitos de caldo.",
    question: "¿Qué podría ayudar a Pedro a tener más sabor sin exagerar con el sodio?",
    options: [
      "Comer sin ningún condimento",
      "Añadir un cubito de caldo más",
      "Usar hierbas, ajo, cebolla y limón",
      "Aumentar aún más la sal",
    ],
    explanation:
      "Las hierbas, el ajo, la cebolla y el limón dan capas de sabor sin depender de tanto sodio.",
  },
  "act:lesson-3-2-l2-x3": {
    question: "¿Cuál de estos ayuda a reducir la sal sin perder sabor?",
    options: [
      "Más sal gruesa",
      "Limón y hierbas frescas",
      "Exceso de salsa de soja",
      "Caldo industrializado",
    ],
    explanation: "El limón y las hierbas frescas realzan el sabor sin aumentar el sodio.",
  },
  "act:lesson-3-2-l2-x4": {
    statement:
      "La sal rosa del Himalaya tiene mucho menos sodio que la sal común, en cantidades iguales.",
    explanation:
      "Toda la sal está hecha de sodio y cloro. El color cambia, pero la cantidad de sodio es prácticamente la misma.",
  },
  "act:lesson-3-2-l3-c1": {
    title: "Construyendo capas de sabor",
    body: "Sofreír, tostar especias, marinar y terminar con **acidez** (limón o vinagre) dan profundidad al plato.",
    points: [
      "Sofríe la cebolla antes que el ajo",
      "Las hierbas delicadas entran al final",
      "Una pizca de acidez realza el sabor",
    ],
  },
  "act:lesson-3-2-l3-1": {
    text: "¡Misión de chef! Vamos a aplicar los condimentos en situaciones reales.",
  },
  "act:lesson-3-2-l3-2": {
    question:
      "El pollo a la parrilla quedó soso. ¿Qué combinación mejora el sabor sin exagerar con la sal?",
    options: [
      "Sal doble",
      "Ajo, limón, pimentón y hierbas",
      "Salsa de sobre",
      "Un cubito de caldo por porción",
    ],
    explanation:
      "Marinar con ajo, limón y hierbas da un sabor profundo y además deja la carne más tierna.",
  },
  "act:lesson-3-2-l3-3": {
    statement:
      "Las hierbas frescas delicadas, como la albahaca, deben entrar al final de la cocción.",
    explanation:
      "El calor prolongado apaga el aroma de las hierbas delicadas. Ponlas al final o a la hora de servir.",
  },
  "act:lesson-3-2-l3-4": {
    prompt: "Ordena un sofrito básico:",
    items: [
      "Calienta un chorrito de aceite de oliva",
      "Dora la cebolla",
      "Añade el ajo al final",
      "Agrega las verduras o los frijoles",
    ],
    explanation:
      "El ajo se quema rápido y amarga. Entra después de la cebolla, cuando el sofrito ya está en su punto.",
  },
  "act:lesson-3-2-l3-5": {
    question: "¿Cuáles son ventajas de los condimentos naturales?",
    options: [
      "Menos sodio en el plato",
      "Compuestos antioxidantes",
      "Aditivos artificiales",
      "Más sabor y aroma",
    ],
    explanation:
      "Los condimentos naturales aportan sabor y además compuestos que hacen bien a la salud.",
  },
  "act:lesson-3-2-l3-6": {
    prompt: "Une la hierba con el plato con el que combina:",
    pairs: [
      {
        left: "Albahaca",
        right: "Pastas y salsas de tomate",
      },
      {
        left: "Cilantro",
        right: "Pescados, caldos y ensaladas",
      },
      {
        left: "Menta",
        right: "Jugos, ensaladas y yogures",
      },
      {
        left: "Romero",
        right: "Asados y papas",
      },
    ],
    explanation: "Cada hierba tiene su pareja perfecta. ¡Vale la pena probar combinaciones nuevas!",
  },
  "act:lesson-3-2-l3-x1": {
    sentence:
      "Las hierbas frescas delicadas, como la albahaca, deben añadirse al ___ de la preparación.",
    options: ["primer minuto", "final", "medio", "inicio"],
    explanation: "El calor prolongado apaga el aroma de las hierbas delicadas.",
  },
  "act:lesson-3-2-l3-x2": {
    question: "¿Cuáles de estos aportan sabor con poco sodio?",
    options: ["Hierbas frescas", "Cubito de caldo", "Ajo", "Limón"],
    explanation: "El limón, el ajo y las hierbas frescas dan sabor sin depender de sodio extra.",
  },
  "act:lesson-3-2-l3-x3": {
    question:
      "¿Aproximadamente cuánto sodio (en mg) recomienda la Organización Mundial de la Salud consumir, como máximo, por día?",
    unit: " mg",
    explanation:
      "La recomendación de la OMS es de hasta 2 g de sodio por día, el equivalente a unos 5 g de sal.",
  },
  "stop:lesson-3-3": {
    title: "Planificación Sin Complicaciones",
    summary: "Planificación sin dramas: compras, viandas y menos desperdicio.",
  },
  "act:lesson-3-3-l1-c1": {
    title: "Planificar reduce las decisiones cansadas",
    body: "Decidir qué comer con hambre lleva a elecciones rápidas y menos nutritivas. Un menú **flexible** y una lista de compras ahorran tiempo y dinero.",
    points: [
      "Define 3 o 4 comidas base de la semana",
      "Anota lo que ya tienes en casa antes de comprar",
    ],
  },
  "act:l3-3-1": {
    text: "Dejar para decidir qué comer cuando ya tienes mucha hambre es la receta segura para terminar pidiendo comida rápida.",
  },
  "act:l3-3-2": {
    question:
      "¿Qué hábito simple de planificación evita que las verduras se echen a perder en el cajón del refrigerador?",
    options: [
      "Esconderlas en el fondo del cajón y no mirar.",
      "Lavar y secar las ensaladas el fin de semana, guardándolas en recipientes para tomarlas fácil durante la semana.",
      "Lavar cada hoja solo en el momento exacto de comer todos los días.",
      "Comprar el triple de lo necesario en el mercado.",
    ],
    explanation:
      "¡Perfecto! La táctica de lavar las hojas y picar las verduras antes reduce la pereza en los días de cansancio y garantiza la ensalada en la mesa.",
  },
  "act:lesson-3-3-l1-x1": {
    statement: "Hacer una lista antes de ir al mercado ayuda a comprar solo lo necesario.",
    explanation: "La lista evita las compras por impulso, ahorra dinero y reduce el desperdicio.",
  },
  "act:lesson-3-3-l1-x2": {
    question: "¿Qué es una vianda planificada?",
    options: [
      "Una comida preparada con antelación",
      "Un alimento industrial",
      "Un tipo de postre",
      "Un utensilio caro",
    ],
    explanation:
      "Las viandas listas facilitan mantener la alimentación al día, incluso en los días ajetreados.",
  },
  "act:lesson-3-3-l1-x3": {
    statement: "Congelar porciones de comida ayuda a evitar el desperdicio.",
    explanation: "Congelar en porciones permite comer en el momento justo, sin perder nada.",
  },
  "act:lesson-3-3-l1-y1": {
    question: "¿Qué hábitos ayudan a planificar las comidas de la semana?",
    options: [
      "Comprar sin lista",
      "Congelar porciones listas",
      "Hacer una lista de compras",
      "Cocinar por lotes el fin de semana",
    ],
    explanation:
      "La lista, cocinar por lotes y congelar son la base de una planificación que funciona.",
  },
  "act:lesson-3-3-l1-y2": {
    prompt: "Une el alimento con la mejor forma de guardarlo:",
    pairs: [
      {
        left: "Frijoles cocidos",
        right: "Congelar en porciones",
      },
      {
        left: "Hojas lavadas",
        right: "Refrigerador, en un recipiente",
      },
      {
        left: "Frutas maduras",
        right: "Consumir pronto o congelar",
      },
    ],
    explanation: "Cada alimento tiene una forma de almacenamiento que preserva mejor su calidad.",
  },
  "act:lesson-3-3-l1-y3": {
    prompt: "Ordena un domingo de organización de las comidas:",
    items: [
      "Planifica el menú de la semana",
      "Haz la lista de compras",
      "Cocina las bases, como arroz, frijoles y proteína",
      "Guarda en recipientes o congela en porciones",
    ],
    explanation: "Planificar antes de comprar evita las compras por impulso y el desperdicio.",
  },
  "act:lesson-3-3-l1-y4": {
    prompt:
      "¿Cómo va tu organización de las comidas para esta semana? ¿Qué podría facilitar los días más ajetreados?",
  },
  "act:lesson-3-3-l2-c1": {
    title: "Cocinar por lotes",
    body: "Preparar bases (frijoles, arroz, verduras, proteínas) de una sola vez y **congelar en porciones** ahorra tiempo en los días ajetreados.",
    points: [
      "Congela en porciones individuales",
      "Etiqueta con nombre y fecha",
      "Descongela en el refrigerador",
    ],
  },
  "act:lesson-3-3-l2-1": {
    text: "¡Planificar es cuidar de tu yo del futuro! Vamos a entrenar estas estrategias.",
  },
  "act:lesson-3-3-l2-2": {
    question: "¿Cuál es el mejor momento para hacer la lista de compras?",
    options: [
      "Después de pasar por la caja",
      "Ya dentro del mercado, con hambre",
      "Nunca, comprar por impulso es mejor",
      "Antes de ir al mercado, mirando el refrigerador y sin hambre",
    ],
    explanation: "Una lista hecha con calma evita las compras por impulso y el desperdicio.",
  },
  "act:lesson-3-3-l2-3": {
    statement: "Ir al mercado con mucha hambre ayuda a hacer buenas elecciones.",
    explanation:
      "Con hambre, todo parece más rico y el carrito se llena de ultraprocesados. ¡Ve bien alimentado!",
  },
  "act:lesson-3-3-l2-4": {
    prompt: "Une la estrategia con el beneficio:",
    pairs: [
      {
        left: "Lista de compras",
        right: "Evita las compras por impulso",
      },
      {
        left: "Congelar porciones",
        right: "Evita el desperdicio",
      },
      {
        left: "Cocinar por lotes",
        right: "Ahorra tiempo en la semana",
      },
      {
        left: "Lavar las hojas el domingo",
        right: "Ensalada lista en minutos",
      },
    ],
    explanation: "Pequeñas preparaciones reducen el cansancio en los días ajetreados.",
  },
  "act:lesson-3-3-l2-5": {
    question: "Marca los hábitos de planificación:",
    options: [
      "Congelar porciones",
      "Comprar sin lista",
      "Cocinar una base de frijoles para la semana",
      "Lavar las hojas el domingo",
    ],
    explanation: "Los frijoles listos en el congelador salvan cualquier comida apurada.",
  },
  "act:lesson-3-3-l2-x1": {
    prompt: "¿Cómo almacenar mejor cada elemento?",
    groups: ["Guardar en el refrigerador", "Congelar en porciones"],
    items: [
      "Hojas lavadas y secas",
      "Verduras picadas",
      "Frijoles cocidos",
      "Salsa casera",
      "Sopa lista",
      "Pollo cocido en porciones",
    ],
    explanation:
      "Congelar conserva las preparaciones listas por semanas. Las hojas y verduras crudas duran mejor en el refrigerador.",
  },
  "act:lesson-3-3-l2-x2": {
    setup:
      "Camila llega cansada del trabajo todos los días y termina pidiendo delivery casi siempre.",
    question: "¿Qué cambio ayudaría más a Camila a cocinar más en casa?",
    options: [
      "Cocinar por lotes el fin de semana y congelar porciones",
      "Renunciar a cocinar en casa",
      "Intentar cocinar todo desde cero todos los días después del trabajo",
      "Comprar sin planificar",
    ],
    explanation:
      "Preparar bases el fin de semana y congelar porciones resuelve justamente el problema del cansancio en los días de semana.",
  },
  "act:lesson-3-3-l2-x3": {
    question:
      "¿Cuál es una ventaja de cocinar frijoles y arroz en mayor cantidad y congelarlos en porciones?",
    options: [
      "Se echa a perder más rápido",
      "Siempre cuesta más",
      "Ahorra tiempo en los días ajetreados",
      "Queda sin sabor",
    ],
    explanation:
      "Congelar en porciones permite tener una comida lista rápidamente en días sin tiempo para cocinar.",
  },
  "act:lesson-3-3-l2-x4": {
    statement: "Los alimentos de temporada suelen ser más baratos y sabrosos.",
    explanation: "En temporada, la oferta es mayor, el precio baja y el alimento madura a tiempo.",
  },
  "act:lesson-3-3-l3-c1": {
    title: "Cero desperdicio",
    body: "Reaprovechar tallos, cáscaras y sobras reduce el desperdicio y el gasto, y además aporta nutrientes extra.",
    points: [
      "Organiza el refrigerador: lo que vence primero va al frente",
      "Usa los tallos en sofritos y sopas",
    ],
  },
  "act:lesson-3-3-l3-1": {
    text: "¡Desafío final de planificación: organizar una semana entera!",
  },
  "act:lesson-3-3-l3-2": {
    prompt: "Ordena la rutina de preparación del domingo:",
    items: [
      "Planificar el menú",
      "Hacer la lista de compras",
      "Comprar los artículos",
      "Higienizar y guardar",
      "Cocinar las bases",
    ],
    explanation:
      "Planificar primero evita comprar lo que no necesitas y cocinar lo que no vas a usar.",
  },
  "act:lesson-3-3-l3-3": {
    question: "Sin tiempo para cocinar durante la semana, ¿qué estrategia ayuda más?",
    options: [
      "Cocinar por lotes el fin de semana y congelar porciones",
      "Saltarse comidas",
      "Comer solo meriendas",
      "Pedir delivery todos los días",
    ],
    explanation:
      "Las comidas congeladas en porciones dan practicidad sin renunciar a lo que se hace en casa.",
  },
  "act:lesson-3-3-l3-4": {
    statement: "Las frutas y verduras de temporada suelen ser más baratas y sabrosas.",
    explanation: "En temporada hay más oferta, el precio baja y el alimento madura a tiempo.",
  },
  "act:lesson-3-3-l3-5": {
    question: "¿Cómo reducir el desperdicio de alimentos?",
    options: [
      "Guardar todo en el fondo del refrigerador",
      "Organizar 'lo que vence primero sale primero'",
      "Congelar las sobras",
      "Usar tallos y cáscaras en recetas",
    ],
    explanation: "¡Los tallos de brócoli, por ejemplo, rinden sofritos y sopas deliciosos!",
  },
  "act:lesson-3-3-l3-6": {
    prompt: "Une la sobra con la idea de reaprovechamiento:",
    pairs: [
      {
        left: "Arroz que sobró",
        right: "Croqueta o arroz al horno",
      },
      {
        left: "Plátano maduro",
        right: "Panqueque o pastel",
      },
      {
        left: "Tallos de brócoli",
        right: "Sofrito o sopa",
      },
      {
        left: "Pan del día anterior",
        right: "Tostada o farofa",
      },
    ],
    explanation: "Reaprovechar es creatividad y ahorro. ¡Nada tiene que ir a la basura!",
  },
  "act:lesson-3-3-l3-x1": {
    sentence: "Hacer una ___ antes de ir al mercado ayuda a evitar las compras por impulso.",
    options: ["pausa", "dieta", "receta", "lista"],
    explanation: "La lista mantiene el foco en lo que realmente necesitas.",
  },
  "act:lesson-3-3-l3-x2": {
    question: "¿Qué actitudes reducen el desperdicio de alimentos?",
    options: [
      "Comprar más de lo que vas a usar",
      "Congelar las sobras",
      "Usar tallos y cáscaras en recetas",
      "Guardar al frente lo que vence primero",
    ],
    explanation:
      "Aprovechar los tallos, organizar el refrigerador y congelar las sobras son hábitos que reducen el desperdicio.",
  },
  "act:lesson-3-3-l3-x3": {
    prompt: "Ordena el reaprovechamiento de un tallo de brócoli:",
    items: [
      "Lava bien el tallo",
      "Córtalo en trozos pequeños",
      "Sofríelo con ajo y aceite de oliva",
      "Sírvelo como acompañamiento",
    ],
    explanation: "Los tallos de brócoli rinden un gran sofrito, lleno de fibras.",
  },
  "trail:bem-estar": {
    title: "Mente y Bienestar",
    tagline: "Comportamiento alimentario",
    description:
      "Hambre emocional, atención plena y una relación más ligera con la comida, sin culpa.",
  },
  "unit:unit-4": {
    title: "Paz con la Comida",
    description: "Acogida, comer con atención y el fin de la cultura de la restricción.",
  },
  "stop:lesson-4-1": {
    title: "Hambre Física vs. Emocional",
    summary: "Hambre física y emocional: escucha al cuerpo y al corazón.",
  },
  "act:lesson-4-1-l1-c1": {
    title: "Hambre física y hambre emocional",
    body: "El **hambre física** viene del cuerpo, poco a poco, y acepta varios alimentos. El **hambre emocional** viene de los sentimientos, llega de repente y pide algo específico.",
    points: [
      "Física: gradual, se satisface con una comida",
      "Emocional: urgente, se centra en el consuelo, puede generar culpa",
    ],
    tip: "Comer por emoción es humano. El problema es cuando es el único recurso.",
  },
  "act:l4-1-1": {
    text: "A veces las ganas de comer no vienen del estómago vacío, sino del corazón lleno (de ansiedad, tristeza o aburrimiento). ¡Y está todo bien!",
  },
  "act:l4-1-2": {
    question: "¿Qué característica describe mejor el HAMBRE EMOCIONAL?",
    options: [
      "Aparece poco a poco, acepta cualquier comida (sirven arroz y frijoles) y cuando se sacia te hace dejar de comer.",
      "Aparece de repente, es urgente, exige algo específico (ej.: chocolate) y puede no pasar incluso con el estómago lleno.",
      "Solo ocurre por la mañana temprano al despertar.",
      "Siempre avisa haciendo que el estómago ruja muy fuerte.",
    ],
    explanation:
      "¡Exacto! Identificar el tipo de hambre es el primer paso. La emocional es urgente y dirigida a alimentos de consuelo.",
  },
  "act:l4-1-3": {
    statement:
      "Comer por emoción es un crimen contra la dieta y debes sentirte extremadamente culpable cada vez que ocurra.",
    explanation:
      "¡La comida consuela, eso es biológico y humano! Solo no dejes que sea tu ÚNICA herramienta para lidiar con las emociones.",
  },
  "act:lesson-4-1-l1-x1": {
    statement: "El hambre física suele surgir poco a poco, y no de repente.",
    explanation:
      "¡Exacto! El hambre emocional es la que suele llegar de repente y con un antojo específico.",
  },
  "act:lesson-4-1-l1-x2": {
    question: "Si estás triste y con ganas de comer, ¿cuál es un buen primer paso?",
    options: [
      "Percibir y nombrar la emoción",
      "Ignorar el cuerpo",
      "Culparte",
      "Comer a escondidas",
    ],
    explanation: "Nombrar lo que sentimos es el primer paso para elegir qué hacer con ello.",
  },
  "act:lesson-4-1-l1-y1": {
    question: "¿Cuáles son señales de hambre EMOCIONAL?",
    options: [
      "Puede generar culpa después",
      "Desaparece con cualquier alimento",
      "Aparece poco a poco",
      "Antojo urgente y específico",
    ],
    explanation: "El hambre emocional es urgente, específica y a veces viene acompañada de culpa.",
  },
  "act:lesson-4-1-l1-y2": {
    prompt: "Une el desencadenante emocional con una forma de cuidarte que no sea la comida:",
    pairs: [
      {
        left: "Estrés",
        right: "Respirar hondo o caminar",
      },
      {
        left: "Aburrimiento",
        right: "Una actividad placentera",
      },
      {
        left: "Soledad",
        right: "Conversar con alguien",
      },
    ],
    explanation:
      "Cada emoción pide un cuidado distinto. La comida puede ayudar, pero no tiene que ser la única respuesta.",
  },
  "act:lesson-4-1-l1-y3": {
    prompt: "Ordena una pausa antes de comer por impulso:",
    items: [
      "Detente y respira",
      "Pregunta: ¿es hambre en el estómago?",
      "Nombra la emoción que sientes",
      "Decide con calma qué hacer",
    ],
    explanation: "Este pequeño ritual te devuelve la elección, sin juicio.",
  },
  "act:lesson-4-1-l1-y4": {
    prompt:
      "La última vez que comiste por impulso, ¿qué sentías? ¿Había otra forma de cuidarte en ese momento?",
  },
  "act:lesson-4-1-l2-c1": {
    title: "Escala de hambre y desencadenantes",
    body: "Una escala del 1 al 10 ayuda a percibir el momento: del 1 al 3 es mucha hambre, del 4 al 6 es comodidad y del 7 al 10 es demasiado lleno. Anota también los **desencadenantes**: estrés, aburrimiento, cansancio, soledad.",
    points: [
      "Anota cuándo y por qué viene el antojo",
      "Fíjate en patrones de horario y de emoción",
    ],
  },
  "act:lesson-4-1-l2-1": {
    text: "Escuchar al cuerpo es una habilidad que se entrena. Vamos a practicar juntos.",
  },
  "act:lesson-4-1-l2-2": {
    prompt: "Une cada término con su significado:",
    pairs: [
      {
        left: "Hambre física",
        right: "Viene poco a poco y acepta varios alimentos",
      },
      {
        left: "Hambre emocional",
        right: "Repentina, con un antojo específico",
      },
      {
        left: "Saciedad",
        right: "Sensación de estar satisfecho",
      },
      {
        left: "Aburrimiento",
        right: "Motivo común para picotear sin hambre",
      },
    ],
    explanation: "Reconocer la diferencia ayuda a responder a lo que realmente necesitas.",
  },
  "act:lesson-4-1-l2-3": {
    question:
      "Después de un día difícil, te da antojo de algo dulce. Una buena primera pregunta es:",
    options: [
      "¿Qué van a pensar los demás?",
      "¿Tengo hambre en el estómago o quiero consuelo?",
      "¿Qué castigo merezco por esto?",
      "¿Dónde está el paquete entero?",
    ],
    explanation: "Preguntar con curiosidad y sin juicio abre el camino a elecciones conscientes.",
  },
  "act:lesson-4-1-l2-4": {
    statement:
      "Hacer una pausa de unos minutos puede ayudar a percibir si el hambre es física o emocional.",
    explanation:
      "Una pausa corta da tiempo al cuerpo y a la mente para mostrar lo que realmente piden.",
  },
  "act:lesson-4-1-l2-5": {
    question: "Marca alternativas de cuidado además de comer:",
    options: ["Castigarte", "Llamar a alguien querido", "Dar un paseo", "Respirar hondo"],
    explanation: "La culpa y el castigo solo aumentan el ciclo. Cuidarte es lo que ayuda.",
  },
  "act:lesson-4-1-l2-x1": {
    prompt: "¿Hambre física o emocional?",
    groups: ["Hambre física", "Hambre emocional"],
    items: [
      "Surge gradualmente",
      "Acepta varios alimentos",
      "El estómago ruge",
      "Viene de repente",
      "Antojo de algo específico",
      "Culpa después de comer",
    ],
    explanation: "El hambre física es flexible y gradual. La emocional es urgente y específica.",
  },
  "act:lesson-4-1-l2-x2": {
    setup:
      "Después de un día estresante en el trabajo, Fernanda siente un antojo urgente de comer chocolate, aunque almorzó bien.",
    question: "¿Qué puede ayudar a Fernanda a entender mejor ese antojo?",
    options: [
      "Prohibirse comer chocolate para siempre",
      "Comer cuanto quiera sin pensar",
      "Hacer una pausa y preguntarse si es hambre física o emocional",
      "Ignorar por completo lo que siente",
    ],
    explanation:
      "La pausa ayuda a identificar el origen del antojo y a elegir una respuesta con más conciencia.",
  },
  "act:lesson-4-1-l2-x3": {
    question: "El hambre emocional suele pedir:",
    options: [
      "Solo agua",
      "Cualquier alimento disponible",
      "Nada, desaparece sola",
      "Alimentos específicos, generalmente de consuelo",
    ],
    explanation:
      "El hambre emocional suele dirigirse a alimentos de consuelo, a diferencia de la física.",
  },
  "act:lesson-4-1-l2-x4": {
    statement: "Sentir ganas de comer por una emoción es señal de debilidad.",
    explanation:
      "Es una respuesta humana y común. Lo importante es no dejar que sea la única herramienta para lidiar con las emociones.",
  },
  "act:lesson-4-1-l3-c1": {
    title: "Estrategias de cuidado",
    body: "Antes de comer por impulso, haz una **pausa**: respira, nombra la emoción y decide con calma. La comida puede ser una de las respuestas, pero no la única.",
    points: ["Caminar, conversar, descansar, escribir", "Sin culpa ni castigo después"],
  },
  "act:lesson-4-1-l3-1": {
    text: "Situaciones reales y delicadas. Recuerda: aquí no existe el bien o el mal moral.",
  },
  "act:lesson-4-1-l3-2": {
    question:
      "Marina se come un pote de helado después de una discusión en el trabajo. ¿Qué actitud ayuda más?",
    options: [
      "Convencerse de que no tiene fuerza de voluntad",
      "Saltarse la cena como castigo",
      "Prometer no volver a comer dulces",
      "Reconocer la emoción sin culpa y pensar en otras formas de cuidarse",
    ],
    explanation:
      "La comida consuela y eso es humano. Lo ideal es no tener solo esa herramienta emocional.",
  },
  "act:lesson-4-1-l3-3": {
    prompt: "Ordena la 'pausa' antes de comer por impulso:",
    items: [
      "Detente y respira hondo",
      "Pregunta: ¿es hambre en el estómago?",
      "Nombra la emoción que sientes",
      "Elige: comer con atención o cuidarte de otra forma",
    ],
    explanation: "Este pequeño ritual te devuelve la elección, sin reglas rígidas.",
  },
  "act:lesson-4-1-l3-4": {
    statement: "Sentir hambre emocional es señal de debilidad y debe eliminarse.",
    explanation: "Es una respuesta humana. El objetivo es entenderla, no eliminarla.",
  },
  "act:lesson-4-1-l3-5": {
    question: "Marca señales de hambre FÍSICA:",
    options: [
      "Urgencia por un alimento específico",
      "Surge gradualmente",
      "Acepta cualquier comida",
      "El estómago ruge",
    ],
    explanation:
      "El hambre física es gradual y flexible. La urgencia por un alimento específico suele ser emocional.",
  },
  "act:lesson-4-1-l3-6": {
    prompt: "Une la emoción con una forma de cuidarte:",
    pairs: [
      {
        left: "Ansiedad",
        right: "Respirar y caminar",
      },
      {
        left: "Cansancio",
        right: "Descansar y dormir bien",
      },
      {
        left: "Soledad",
        right: "Conversar con alguien",
      },
      {
        left: "Aburrimiento",
        right: "Empezar una actividad nueva",
      },
    ],
    explanation:
      "Cada emoción pide un cuidado. La comida puede formar parte, pero no tiene que ser la única.",
  },
  "act:lesson-4-1-l3-x1": {
    sentence:
      "Antes de comer por impulso, vale la pena ___ y preguntarse si el hambre está en el estómago.",
    options: ["correr", "hacer una pausa", "ir al mercado", "saltarse la comida"],
    explanation: "La pausa te devuelve la elección.",
  },
  "act:lesson-4-1-l3-x2": {
    question: "¿Qué actitudes ayudan a lidiar con el hambre emocional, sin culpa?",
    options: [
      "Castigarte después de comer",
      "Reconocer la emoción sin juicio",
      "Pedir ayuda cuando sea recurrente",
      "Buscar otras formas de cuidarte",
    ],
    explanation: "El cuidado y el apoyo ayudan mucho más que el castigo y la culpa.",
  },
  "act:lesson-4-1-l3-x3": {
    prompt: "¿Cuáles son 3 formas de cuidarte además de comer que funcionan bien para ti?",
    placeholder: "Ej.: caminar, escuchar música, llamar a alguien…",
  },
  "stop:lesson-4-2": {
    title: "Atención Plena (Mindful Eating)",
    summary: "Comer con atención: sabor, ritmo y señales de saciedad.",
  },
  "act:lesson-4-2-l1-c1": {
    title: "Qué es comer con atención",
    body: "Comer con atención (mindful eating) es estar **presente** en la comida: percibir colores, olores, sabores y las señales de hambre y saciedad, sin juicio.",
    points: ["Sin pantallas y sin prisa", "Mastica bien y percibe las texturas"],
  },
  "act:l4-2-1": {
    text: "Si comes mirando el celular en el sofá, tu cerebro ni siquiera va a registrar que comiste. La saciedad no va a llegar completa.",
  },
  "act:l4-2-2": {
    question: "¿Qué es una buena práctica de 'Atención Plena' al comer?",
    options: [
      "Comer de pie frente al refrigerador para ir más rápido.",
      "Apagar las pantallas, masticar despacio y enfocarse en el sabor, la textura y el olor del alimento.",
      "Comer viendo una película de acción para que la comida baje más fácil.",
      "Tragar sin masticar para no perder tiempo.",
    ],
    explanation:
      "¡Perfecto! Estar presente en la comida ayuda al cuerpo a enviar la señal de saciedad en el momento justo.",
  },
  "act:l4-2-3": {
    statement:
      "Apoyar los cubiertos en el plato entre un bocado y otro es una gran estrategia para comer más despacio.",
    explanation:
      "Esa pausa obliga al ritmo a desacelerar, dando tiempo (unos 20 min) para que el estómago avise al cerebro que estás satisfecho.",
  },
  "act:lesson-4-2-l1-x1": {
    statement: "Comer mirando el celular ayuda a percibir mejor la saciedad.",
    explanation: "Las distracciones perjudican: el cerebro ni siquiera registra bien que comiste.",
  },
  "act:lesson-4-2-l1-x2": {
    question: "¿En qué ayuda masticar despacio?",
    options: [
      "En nada",
      "Comer más rápido",
      "Percibir el sabor y la saciedad",
      "Sentir menos sabor",
    ],
    explanation: "Comer despacio da tiempo al cuerpo para avisar que ya está satisfecho.",
  },
  "act:lesson-4-2-l1-y1": {
    question: "¿Qué prácticas ayudan a comer con más atención?",
    options: [
      "Masticar despacio",
      "Apagar las pantallas",
      "Comer caminando con prisa",
      "Percibir colores y olores",
    ],
    explanation: "La presencia y el ritmo son la base de comer con más atención.",
  },
  "act:lesson-4-2-l1-y2": {
    prompt: "Une la práctica con el beneficio:",
    pairs: [
      {
        left: "Masticar despacio",
        right: "Percibe mejor la saciedad",
      },
      {
        left: "Apagar el celular",
        right: "Más presencia en la comida",
      },
      {
        left: "Sentarse a la mesa",
        right: "Menos distracción",
      },
    ],
    explanation: "Cada pequeño hábito suma para una comida más consciente.",
  },
  "act:lesson-4-2-l1-y3": {
    prompt: "Ordena una comida con atención plena:",
    items: [
      "Siéntate sin pantallas cerca",
      "Observa el color, el olor y la textura",
      "Mastica despacio",
      "Haz pausas y percibe la saciedad",
    ],
    explanation: "Seguir estos pasos ayuda al cuerpo a registrar mejor la comida.",
  },
  "act:lesson-4-2-l1-y4": {
    prompt:
      "En tu última comida, ¿estabas presente o distraído/a? ¿Qué podría ayudarte a estar más presente en la próxima?",
  },
  "act:lesson-4-2-l2-c1": {
    title: "Señales de saciedad",
    body: "El cerebro tarda unos **20 minutos** en registrar que estás satisfecho. Comer despacio da tiempo a esa señal.",
    points: ["Apoya los cubiertos entre bocados", "Para cuando estés cómodo, no lleno"],
  },
  "act:lesson-4-2-l2-1": {
    text: "Comer con atención es como un pequeño descanso para la mente. ¡Vamos a practicar!",
  },
  "act:lesson-4-2-l2-2": {
    question: "¿En cuánto tiempo, aproximadamente, registra el cerebro la sensación de saciedad?",
    options: ["Unos 20 minutos", "Nunca la registra", "Inmediatamente", "Solo al día siguiente"],
    explanation:
      "Comer despacio da tiempo al cerebro para recibir la señal de que estás satisfecho.",
  },
  "act:lesson-4-2-l2-3": {
    prompt: "Une la práctica con el beneficio:",
    pairs: [
      {
        left: "Sentir el olor",
        right: "Prepara el apetito y la digestión",
      },
      {
        left: "Notar la textura",
        right: "Ayuda a percibir sabores",
      },
      {
        left: "Masticar despacio",
        right: "Facilita la saciedad",
      },
      {
        left: "Apagar las pantallas",
        right: "Más foco en la comida",
      },
    ],
    explanation: "Estar presente convierte la comida en un momento de placer.",
  },
  "act:lesson-4-2-l2-4": {
    statement: "Comer muy rápido no interfiere en la percepción de la saciedad.",
    explanation: "Comer deprisa puede hacer que te pases antes de que el cerebro avise.",
  },
  "act:lesson-4-2-l2-5": {
    question: "Marca las prácticas de atención plena:",
    options: [
      "Masticar bien",
      "Fijarse en el olor y el color",
      "Apagar las pantallas",
      "Comer en el coche con prisa",
    ],
    explanation: "La presencia es el secreto: menos distracciones, más placer.",
  },
  "act:lesson-4-2-l2-x1": {
    prompt: "¿Esta práctica ayuda o perjudica comer con atención?",
    groups: ["Ayuda", "Perjudica"],
    items: [
      "Apagar las pantallas",
      "Masticar bien",
      "Sentarse a la mesa",
      "Comer en el coche con prisa",
      "Deslizar el celular mientras se come",
      "Tragar sin masticar",
    ],
    explanation: "La presencia y el ritmo ayudan a percibir la saciedad.",
  },
  "act:lesson-4-2-l2-x2": {
    setup:
      "Lucas siempre almuerza viendo videos en el celular y, al final, siente que 'ni se dio cuenta' de lo que comió.",
    question: "¿Qué podría ayudar a Lucas a comer con más atención?",
    options: [
      "Guardar el celular durante la comida",
      "Comer más rápido para terminar pronto el video",
      "Comer de pie para ganar tiempo",
      "Ver videos aún más interesantes",
    ],
    explanation:
      "Guardar el celular ayuda a Lucas a notar el sabor, la textura y las señales de saciedad de su propio cuerpo.",
  },
  "act:lesson-4-2-l2-x3": {
    question: "Comer despacio ayuda principalmente porque:",
    options: [
      "Hace que la comida se enfríe más rápido",
      "Deja la comida sin gracia",
      "No tiene ningún efecto real",
      "Da tiempo al cerebro para registrar la saciedad",
    ],
    explanation:
      "El cerebro tarda unos 20 minutos en percibir la saciedad — comer despacio acompaña ese ritmo.",
  },
  "act:lesson-4-2-l2-x4": {
    statement: "Prestar atención a la comida puede aumentar el placer de comer.",
    explanation:
      "Percibir sabores, texturas y olores suele hacer la experiencia más placentera, no menos.",
  },
  "act:lesson-4-2-l3-c1": {
    title: "Atención en una rutina apurada",
    body: "No todas las comidas serán perfectas. Los pequeños gestos ya ayudan.",
    points: [
      "Guarda el celular por 10 minutos",
      "Respira tres veces antes de empezar",
      "Elige una comida del día para practicar",
    ],
  },
  "act:lesson-4-2-l3-1": {
    text: "Ahora, la práctica en el mundo real: prisas, plazos y comidas rápidas.",
  },
  "act:lesson-4-2-l3-2": {
    prompt: "Ordena una comida hecha con atención:",
    items: [
      "Siéntate a la mesa, sin pantallas",
      "Observa el color y el olor",
      "Da el primer bocado y mastica despacio",
      "Haz una pausa y siente la saciedad",
    ],
    explanation: "Cada etapa te acerca al placer de comer y a las señales de tu cuerpo.",
  },
  "act:lesson-4-2-l3-3": {
    question: "Tienes solo 15 minutos para almorzar. ¿Qué todavía se puede hacer con atención?",
    options: [
      "Tragar rápido para que sobre tiempo",
      "Guardar el celular, sentarte, respirar y masticar bien",
      "Comer de pie mirando el correo",
      "Saltarte la comida",
    ],
    explanation: "Incluso en poco tiempo, algunos hábitos simples ya mejoran la experiencia.",
  },
  "act:lesson-4-2-l3-4": {
    statement: "Comer despacio ayuda a percibir cuándo ya estás satisfecho.",
    explanation: "Con más ritmo, percibes las señales de saciedad antes de excederte.",
  },
  "act:lesson-4-2-l3-5": {
    question: "¿Cuáles son beneficios de comer con atención?",
    options: [
      "Menos comer en automático",
      "Más placer con la comida",
      "Peor digestión",
      "Mejor percepción de la saciedad",
    ],
    explanation: "Comer con atención es una ganancia en placer y en conciencia corporal.",
  },
  "act:lesson-4-2-l3-6": {
    prompt: "Une la nota de la escala de hambre con la situación:",
    pairs: [
      {
        left: "1 a 3",
        right: "Mucha hambre: hora de comer",
      },
      {
        left: "4 a 6",
        right: "Cómodo y satisfecho",
      },
      {
        left: "7 a 10",
        right: "Demasiado lleno",
      },
      {
        left: "Empezó a picotear sin hambre",
        right: "Vale la pena revisar la emoción",
      },
    ],
    explanation: "Una escala simple ayuda a seguir lo que el cuerpo pide.",
  },
  "act:lesson-4-2-l3-x1": {
    sentence: "El cerebro tarda unos ___ minutos en registrar la sensación de saciedad.",
    options: ["20", "2", "120", "60"],
    explanation: "Por eso comer despacio evita pasarse.",
  },
  "act:lesson-4-2-l3-x2": {
    question: "¿Qué señales pueden indicar una saciedad cómoda?",
    options: [
      "Ausencia de hambre, pero sin estar demasiado lleno",
      "Satisfacción tranquila",
      "Ganas de seguir comiendo por costumbre",
      "Barriga hinchada e incómoda",
    ],
    explanation: "La saciedad cómoda es un estado tranquilo, sin exceso ni molestia.",
  },
  "act:lesson-4-2-l3-x3": {
    question:
      "En una escala de 1 (hambriento) a 10 (repleto), ¿qué nivel suele indicar un buen punto para dejar de comer?",
    unit: "",
    explanation: "Alrededor de 7, la persona suele estar satisfecha y cómoda, sin excederse.",
  },
  "stop:lesson-4-3": {
    title: "Sin Culpa en la Mesa",
    summary: "Sin culpa en la mesa: flexibilidad, amabilidad y constancia.",
  },
  "act:lesson-4-3-l1-c1": {
    title: "Restricción vs. flexibilidad",
    body: "Las dietas muy restrictivas suelen llevar a un ciclo de **restricción y atracón**. La flexibilidad, con espacio para todos los alimentos, es más sostenible.",
    points: ["Ningún alimento está prohibido", "El equilibrio vale para toda la semana"],
  },
  "act:l4-3-1": {
    text: "Vamos a celebrar una verdad maravillosa de la ciencia nutricional actual: la mentalidad del 'Todo o Nada' fracasa el 95% de las veces.",
  },
  "act:l4-3-2": {
    question:
      "¿Qué suele ocurrir (el efecto rebote) cuando una persona hace una dieta muy extrema, eliminando todos los carbohidratos y dulces?",
    options: [
      "Vive feliz para siempre y nunca más siente hambre.",
      "Desarrolla una relación sostenible con la comida.",
      "Termina sufriendo frustración, abandonando y teniendo episodios de atracones o excesos compensatorios (tirar la toalla).",
      "El cuerpo olvida que le gusta el dulce al día siguiente.",
    ],
    explanation:
      "La restricción genera atracón. Prohibir por completo un alimento lo eleva a un 'pedestal', generando una fijación mental en él.",
  },
  "act:l4-3-3": {
    statement:
      "Una vida saludable tiene espacio tanto para el plato de ensalada en el almuerzo del martes como para el brigadeiro en la fiesta del sábado sin culpa.",
    explanation:
      "¡Lo lograste! La constancia es el secreto. Una mala comida no arruina una buena rutina. ¡Sé amable contigo!",
  },
  "act:lesson-4-3-l1-x1": {
    statement: "Un dulce de vez en cuando cabe en una alimentación saludable.",
    explanation: "¡Claro! Ningún alimento está prohibido. El equilibrio vale para toda la semana.",
  },
  "act:lesson-4-3-l1-x2": {
    question: "¿Cuál es la actitud más amable después de un exceso?",
    options: [
      "Pasar hambre al día siguiente",
      "Compararte con los demás",
      "Seguir la rutina normal, sin culpa",
      "Renunciar a todo",
    ],
    explanation: "Volver al ritmo normal rompe el ciclo de culpa y compensación.",
  },
  "act:lesson-4-3-l1-y1": {
    question: "¿Qué pensamientos son más amables y sostenibles?",
    options: [
      "Mañana sigo mi ritmo normal",
      "Necesito castigarme por haber comido eso",
      "Una comida no define mi salud",
      "Lo arruiné todo, ya no sirve de nada",
    ],
    explanation:
      "Los pensamientos amables mantienen la constancia sin alimentar el ciclo de culpa.",
  },
  "act:lesson-4-3-l1-y2": {
    prompt: "Une el pensamiento con el tipo:",
    pairs: [
      {
        left: "Comí pastel, pero hoy voy bien",
        right: "Pensamiento flexible",
      },
      {
        left: "Comí pastel, ahora solo hambre cero",
        right: "Pensamiento todo o nada",
      },
      {
        left: "Puedo incluir dulce con equilibrio",
        right: "Pensamiento flexible",
      },
    ],
    explanation: "Reconocer tu propio patrón de pensamiento es el primer paso para cambiarlo.",
  },
  "act:lesson-4-3-l1-y3": {
    prompt: "Ordena un reinicio amable después de un exceso:",
    items: [
      "Percibe sin juzgarte",
      "Bebe agua y descansa",
      "Vuelve a la siguiente comida con normalidad",
      "Reflexiona con amabilidad sobre lo que pasó",
    ],
    explanation: "El reinicio amable es siempre más eficaz que el castigo.",
  },
  "act:lesson-4-3-l1-y4": {
    prompt:
      "¿Cómo te hablas a ti mismo/a después de comer algo que consideras 'prohibido'? ¿Te ayuda o te perjudica?",
  },
  "act:lesson-4-3-l2-c1": {
    title: "Diálogo interno amable",
    body: "La forma en que nos hablamos influye en el comportamiento. Cambia el **todo o nada** por pensamientos realistas y amables.",
    points: [
      "'Lo arruiné todo' se convierte en 'una comida no define mi salud'",
      "'Necesito compensar' se convierte en 'vuelvo a mi ritmo'",
    ],
  },
  "act:lesson-4-3-l2-1": {
    text: "¡Una buena relación con la comida también está hecha de pensamientos amables!",
  },
  "act:lesson-4-3-l2-2": {
    question: "El 'efecto rebote' de las dietas radicales es cuando:",
    options: [
      "El cuerpo adelgaza sin esfuerzo",
      "El metabolismo se vuelve infinito",
      "La persona pierde las ganas de comer dulce",
      "La restricción extrema lleva a atracones y excesos después",
    ],
    explanation:
      "Lo que está demasiado prohibido tiende a volverse deseo. La flexibilidad protege del atracón.",
  },
  "act:lesson-4-3-l2-3": {
    statement: "Los alimentos considerados 'prohibidos' suelen volverse aún más deseados.",
    explanation:
      "La prohibición aumenta el deseo. Incluirlos con moderación quita el poder de la tentación.",
  },
  "act:lesson-4-3-l2-4": {
    prompt: "Une cada idea con su significado:",
    pairs: [
      {
        left: "Todo o nada",
        right: "Pensamiento que perjudica",
      },
      {
        left: "Equilibrio",
        right: "Variedad sin alimentos prohibidos",
      },
      {
        left: "Autocompasión",
        right: "Tratarse con amabilidad",
      },
      {
        left: "Constancia",
        right: "Hábito que dura en el tiempo",
      },
    ],
    explanation: "El cambio sostenible nace de la amabilidad y la constancia, no de la rigidez.",
  },
  "act:lesson-4-3-l2-5": {
    question: "Marca los pensamientos amables:",
    options: [
      "Una comida no define mi salud",
      "Puedo comer lo que me gusta con moderación",
      "Mañana sigo con normalidad",
      "Lo arruiné todo, me rindo",
    ],
    explanation: "Hablarte como le hablarías a un amigo es la clave.",
  },
  "act:lesson-4-3-l2-x1": {
    prompt: "¿Pensamiento amable o 'todo o nada'?",
    groups: ["Pensamiento amable", "Todo o nada"],
    items: [
      "Una comida no define mi salud",
      "Mañana sigo mi ritmo",
      "Puedo incluir lo que me gusta",
      "Lo arruiné todo",
      "Ya que fallé, me rindo",
      "Necesito compensar",
    ],
    explanation:
      "Los pensamientos amables mantienen la constancia. El todo o nada alimenta el ciclo de culpa.",
  },
  "act:lesson-4-3-l2-x2": {
    setup:
      "Después de comer un trozo de pastel en la fiesta, Rodrigo piensa en saltarse la cena como forma de 'compensar'.",
    question: "¿Cuál sería una actitud más equilibrada?",
    options: [
      "Comer el doble en la cena a propósito",
      "Sentirse culpable el resto del día",
      "Saltarse toda la cena",
      "Cenar normalmente, sin compensación",
    ],
    explanation:
      "Compensar con restricción alimenta el ciclo de culpa. Seguir la rutina con normalidad rompe ese patrón.",
  },
  "act:lesson-4-3-l2-x3": {
    question: "El ciclo de 'restricción extrema seguida de atracón' suele ser causado por:",
    options: [
      "Reglas alimentarias muy rígidas",
      "Comer despacio",
      "Comer de forma flexible",
      "Tener el acompañamiento de una nutricionista",
    ],
    explanation:
      "Las reglas muy rígidas tienden a generar un deseo intenso por lo que se prohibió, alimentando el ciclo.",
  },
  "act:lesson-4-3-l2-x4": {
    statement: "Buscar ayuda profesional para lidiar con la alimentación es señal de debilidad.",
    explanation:
      "Buscar ayuda es un acto de cuidado. Los nutricionistas y psicólogos pueden apoyar mucho este proceso.",
  },
  "act:lesson-4-3-l3-c1": {
    title: "Cuándo buscar ayuda",
    body: "La culpa intensa, los atracones, las restricciones que perjudican la vida o el miedo a comer merecen apoyo **profesional**. Nutricionistas y psicólogos pueden ayudar.",
    points: [
      "Buscar ayuda es cuidado, no debilidad",
      "La familia y los amigos también forman parte de la red",
    ],
  },
  "act:lesson-4-3-l3-1": {
    text: "Última parada de la ruta: poner la amabilidad en práctica en las fiestas y en los reinicios.",
  },
  "act:lesson-4-3-l3-2": {
    question:
      "En una fiesta, Bia comió pastel y brigadeiro. ¿Cuál es la mejor actitud en la siguiente comida?",
    options: [
      "Comer solo ensalada durante tres días",
      "Volver al ritmo normal, sin intentar compensar",
      "Quedarse sin comer para compensar",
      "Sentirse culpable durante una semana",
    ],
    explanation:
      "Compensar crea un ciclo de restricción y exceso. Volver al ritmo normal rompe ese ciclo.",
  },
  "act:lesson-4-3-l3-3": {
    statement: "Saltarse comidas para compensar un exceso es una buena estrategia.",
    explanation:
      "Saltarse comidas aumenta el hambre y la probabilidad de excederse de nuevo. Vuelve a tu ritmo normal.",
  },
  "act:lesson-4-3-l3-4": {
    prompt: "Ordena un reinicio amable después de un exceso:",
    items: [
      "Percibe sin juzgar",
      "Bebe agua y acompáñate con cariño",
      "Haz la siguiente comida con normalidad",
      "Reflexiona sobre lo que aprendiste",
    ],
    explanation: "El reinicio amable es siempre más eficaz que el castigo.",
  },
  "act:lesson-4-3-l3-5": {
    question: "¿Qué ayuda a tener una relación saludable con la comida?",
    options: [
      "Escuchar las señales de hambre y saciedad",
      "Variedad",
      "Contar cada caloría obsesivamente",
      "Comer sin culpa",
    ],
    explanation: "El conteo obsesivo suele aumentar la ansiedad en lugar de traer salud.",
  },
  "act:lesson-4-3-l3-6": {
    question: "¿Cuál es una señal de que vale la pena buscar ayuda profesional?",
    options: [
      "Culpa intensa, atracones o restricciones que perjudican la vida",
      "Que te guste el dulce",
      "Tener un alimento preferido",
      "Comer fuera de casa a veces",
    ],
    explanation:
      "Pedir ayuda es un acto de cuidado. Nutricionistas y psicólogos pueden caminar contigo.",
  },
  "act:lesson-4-3-l3-7": {
    prompt: "Une quién puede ayudar con el tipo de apoyo:",
    pairs: [
      {
        left: "Nutricionista",
        right: "Orienta la alimentación",
      },
      {
        left: "Psicólogo",
        right: "Cuida las emociones y el comportamiento",
      },
      {
        left: "Familia y amigos",
        right: "Apoyo en el día a día",
      },
      {
        left: "Tú mismo",
        right: "Amabilidad y paciencia",
      },
    ],
    explanation: "Cuidarse es una red: profesionales, personas queridas y tú.",
  },
  "act:lesson-4-3-l3-x1": {
    sentence: "El pensamiento 'todo o nada' suele llevar a la restricción seguida de ___.",
    options: ["equilibrio", "saciedad", "disciplina", "atracón"],
    explanation: "Cuanta más restricción, mayor el riesgo de exceso después.",
  },
  "act:lesson-4-3-l3-x2": {
    prompt:
      "¿Qué te gustaría recordar la próxima vez que sientas culpa por comer algo 'fuera de la dieta'?",
  },
  "trail:kid-sabores": {
    title: "Aventura de los Sabores",
    tagline: "Colores, frutas y agua",
    description:
      "Descubre los colores de los alimentos, conoce frutas y verduras y hazte amigo del agua.",
  },
  "unit:kid-unit-1": {
    title: "Mundo de los Colores",
    description: "¡Frutas, verduras y la superbebida: el agua!",
  },
  "stop:kid-1-1": {
    title: "Arcoíris en el Plato",
    summary: "¡Cada color de fruta y verdura tiene un superpoder!",
  },
  "act:kid-1-1-l1-1": {
    title: "¡Cada color tiene un superpoder!",
    body: "Las frutas y verduras tienen colores preciosos, y cada color ayuda al cuerpo de una manera. **¡Cuantos más colores en el plato, más superpoderes!**",
    points: [
      "🥕 Naranja: ayuda a los ojos",
      "🥦 Verde: deja el cuerpo fuerte",
      "🍅 Rojo: cuida el corazón",
      "🍇 Morado: ayuda al cerebro",
    ],
    tip: "¡Intenta comer 3 colores distintos en cada comida!",
  },
  "act:kid-1-1-l1-2": {
    text: "¡Hola! ¡Soy Cadu Cenoura! ¿Sabías que mi color naranja es bueno para tus ojos?",
  },
  "act:kid-1-1-l1-3": {
    question: "¿Cuál de estos alimentos es NARANJA?",
    options: ["Brócoli", "Zanahoria", "Uva", "Coliflor"],
    explanation: "¡Eso! La zanahoria es naranja y nos ayuda a ver bien.",
  },
  "act:kid-1-1-l1-4": {
    statement: "Un plato con varios colores es más nutritivo.",
    explanation: "¡Así es! Cada color aporta nutrientes distintos.",
  },
  "act:kid-1-1-l1-5": {
    question: "¿De qué color es el brócoli?",
    options: ["Negro", "Rosa", "Verde", "Azul"],
    explanation: "¡Verdecito! Los alimentos verdes ayudan al cuerpo a ponerse fuerte.",
  },
  "act:kid-1-1-l1-6": {
    prompt: "Une el alimento con su color:",
    pairs: [
      {
        left: "Fresa",
        right: "Rojo",
      },
      {
        left: "Plátano",
        right: "Amarillo",
      },
      {
        left: "Lechuga",
        right: "Verde",
      },
      {
        left: "Uva",
        right: "Morado",
      },
    ],
    explanation: "¡Muy bien! Cada fruta tiene su color.",
  },
  "act:kid-1-1-l1-7": {
    question: "¿Cuáles de estos alimentos son VERDES?",
    options: ["Lechuga", "Brócoli", "Fresa", "Col rizada"],
    explanation: "¡El brócoli, la col rizada y la lechuga son verdecitos! La fresa es roja.",
  },
  "act:kid-1-1-l1-8": {
    prompt: "Une la fruta o verdura con su color:",
    pairs: [
      {
        left: "Zanahoria",
        right: "Naranja",
      },
      {
        left: "Uva",
        right: "Morado",
      },
      {
        left: "Tomate",
        right: "Rojo",
      },
    ],
    explanation: "¡Ya eres un experto en combinar colores y alimentos!",
  },
  "act:kid-1-1-l1-9": {
    setup: "A la hora de la merienda, Cadu quiere tener los ojos fuertes para ver bien de lejos.",
    question: "¿Qué alimento va a ayudar más?",
    options: ["Galleta", "Refresco", "Zanahoria", "Caramelo"],
    explanation:
      "¡La zanahoria es naranja y está llena de vitamina A, que ayuda a los ojos a ver bien!",
  },
  "act:kid-1-1-l1-10": {
    prompt: "¿Cuál es tu fruta o verdura colorida favorita? ¿Por qué?",
  },
  "act:kid-1-1-l2-1": {
    title: "Armando un plato colorido",
    body: "Para un plato de campeón, elige **un color de cada tipo**: algo verde, algo naranja o amarillo, algo rojo y una proteína, como frijoles o huevo.",
    points: [
      "Verde: hojas y brócoli",
      "Naranja o amarillo: zanahoria y calabaza",
      "Rojo: tomate y remolacha",
    ],
    tip: "¡Un plato bonito es un plato rico!",
  },
  "act:kid-1-1-l2-2": {
    prompt: "Pon cada alimento en el color correcto:",
    groups: ["Verde", "Rojo", "Naranja"],
    items: ["Col rizada", "Lechuga", "Tomate", "Fresa", "Zanahoria", "Naranja"],
    explanation: "¡Bien! Separaste todo perfectamente.",
  },
  "act:kid-1-1-l2-3": {
    question: "¿Cuáles de estos alimentos son rojos?",
    options: ["Tomate", "Lechuga", "Fresa", "Cereza", "Plátano"],
    explanation:
      "¡El tomate, la fresa y la cereza son rojos. El plátano es amarillo y la lechuga es verde!",
  },
  "act:kid-1-1-l2-4": {
    statement: "Comer solo alimentos de un color es la mejor opción.",
    explanation: "¡Es mejor mezclar! Cada color aporta algo distinto al cuerpo.",
  },
  "act:kid-1-1-l2-5": {
    sentence: "¡Un plato muy ___ es un plato lleno de superpoderes!",
    options: ["colorido", "vacío", "oscuro", "sin gracia"],
    explanation: "¡Colorido! Cuantos más colores, mejor.",
  },
  "act:kid-1-1-l2-6": {
    prompt: "Arma el plato colorido en orden:",
    items: [
      "Pon las hojas verdes",
      "Añade algo naranja",
      "Añade los frijoles",
      "Termina con un tomate rojo",
    ],
    explanation: "¡Así el plato queda precioso y completo!",
  },
  "act:kid-1-1-l2-7": {
    prompt: "Une el alimento con el color que aún falta en el plato:",
    pairs: [
      {
        left: "Maíz",
        right: "Amarillo",
      },
      {
        left: "Berenjena",
        right: "Morado",
      },
      {
        left: "Pimiento rojo",
        right: "Rojo",
      },
    ],
    explanation: "¡Cada color de más deja el plato más completo!",
  },
  "act:kid-1-1-l2-8": {
    setup: "Mila está armando su plato: ya puso arroz y pollo.",
    question: "¿Qué puede añadir para dejar el plato más colorido?",
    options: ["Nada, está listo", "Solo pollo", "Una ensalada de tomate y lechuga", "Más arroz"],
    explanation: "¡Una ensalada colorida completa el plato con vitaminas y colores nuevos!",
  },
  "act:kid-1-1-l2-9": {
    question: "¿Cuántos colores distintos de alimentos de verdad es bueno tener en el plato?",
    unit: " colores",
    explanation: "¡Un buen objetivo es tener al menos 3 colores distintos en cada comida!",
  },
  "act:kid-1-1-l3-1": {
    title: "Colores escondidos",
    body: "¡No todo lo que hace bien es colorido por fuera! La coliflor, la cebolla y el ajo son claros, pero tienen **muchos nutrientes**. Y los colores de las frutas son naturales, distintos de los colores de los caramelos, que vienen de colorantes.",
    points: [
      "El blanco también vale: coliflor, cebolla, ajo",
      "El color de la fruta es natural",
      "El color del caramelo viene de colorante",
    ],
    tip: "¡El color de la fruta es natural. El color del caramelo es colorante!",
  },
  "act:kid-1-1-l3-2": {
    question: "¿De dónde viene el color de la remolacha?",
    options: [
      "De pintura",
      "De colorante de caramelo",
      "De azúcar",
      "De la propia remolacha, es natural",
    ],
    explanation: "El color de la remolacha nace con ella. ¡Es totalmente natural!",
  },
  "act:kid-1-1-l3-3": {
    statement: "Los caramelos de colores tienen el mismo color natural que las frutas.",
    explanation: "Los caramelos usan colorantes. Solo las frutas tienen color natural.",
  },
  "act:kid-1-1-l3-4": {
    question: "¿Qué alimentos tienen color natural?",
    options: ["Zanahoria", "Refresco en polvo", "Remolacha", "Gomita", "Uva"],
    explanation:
      "La zanahoria, la uva y la remolacha tienen color natural. Los caramelos y el refresco en polvo usan colorantes.",
  },
  "act:kid-1-1-l3-5": {
    prompt: "¿Alimento de verdad o de paquete?",
    groups: ["De verdad", "De paquete"],
    items: ["Fresa", "Zanahoria", "Uva", "Gomita", "Refresco en polvo", "Snack de bolsa"],
    explanation: "Las frutas y verduras son alimentos de verdad, directos de la naturaleza.",
  },
  "act:kid-1-1-l3-6": {
    prompt: "Une el color con el superpoder:",
    pairs: [
      {
        left: "Naranja",
        right: "Ayuda a los ojos",
      },
      {
        left: "Verde",
        right: "Deja el cuerpo fuerte",
      },
      {
        left: "Rojo",
        right: "Cuida el corazón",
      },
      {
        left: "Morado",
        right: "Ayuda al cerebro",
      },
    ],
    explanation: "¡Ahora ya sabes qué hace cada color!",
  },
  "act:kid-1-1-l3-7": {
    question: "¿Cuáles de estos NO necesitan colorante, porque el color ya es natural?",
    options: ["Remolacha", "Refresco en polvo", "Gomita", "Zanahoria"],
    explanation: "¡La remolacha y la zanahoria nacen con esos colores preciosos!",
  },
  "act:kid-1-1-l3-8": {
    sentence: "El color de la fruta es ___, pero el color del caramelo viene de colorante.",
    options: ["de lápiz", "natural", "de pintura", "mágico"],
    explanation: "¡Natural! Las frutas nacen con su color.",
  },
  "act:kid-1-1-l3-9": {
    prompt: "Ordena para descubrir si un alimento tiene color natural:",
    items: [
      "Piensa si es una fruta o verdura de verdad",
      "Mira si nació así, de la tierra o del árbol",
      "Si es así, su color es natural",
      "Si es un dulce muy colorido, el color es colorante",
    ],
    explanation: "¡Genial! Ahora eres un detective de colores.",
  },
  "act:kid-1-1-l3-10": {
    prompt:
      "¿Hay algún alimento colorido que nunca hayas probado? ¿Qué tal probarlo uno de estos días?",
  },
  "stop:kid-1-2": {
    title: "Frutas y Verduras",
    summary: "Descubre frutas, verduras y hortalizas, y cómo comer más de ellas.",
  },
  "act:kid-1-2-l1-1": {
    title: "Frutas, verduras y hortalizas son amigas",
    body: "Las **frutas** suelen ser dulcecitas y nacen en árboles o plantas. Las **verduras** y **hortalizas** combinan con el almuerzo y la cena. ¡Todas tienen vitaminas para que crezcas fuerte!",
    points: [
      "Frutas: manzana, plátano, naranja",
      "Verduras: zanahoria, calabaza, chayote",
      "Hortalizas: lechuga, col rizada, espinaca",
    ],
    tip: "¡Una buena meta es comer frutas y verduras todos los días!",
  },
  "act:kid-1-2-l1-2": {
    question: "¿Cuál de estas es una FRUTA?",
    options: ["Papa", "Col rizada", "Lechuga", "Manzana"],
    explanation: "La manzana es una fruta rica y llena de fibras.",
  },
  "act:kid-1-2-l1-3": {
    statement: "Las hortalizas como la lechuga y la col rizada ayudan al cuerpo a ponerse fuerte.",
    explanation: "¡Eso! Tienen vitaminas y minerales importantes.",
  },
  "act:kid-1-2-l1-4": {
    prompt: "Une el grupo con el ejemplo:",
    pairs: [
      {
        left: "Fruta",
        right: "Plátano",
      },
      {
        left: "Hortaliza",
        right: "Lechuga",
      },
      {
        left: "Verdura",
        right: "Zanahoria",
      },
    ],
    explanation: "¡Muy bien! Ya sabes separar los grupos.",
  },
  "act:kid-1-2-l1-5": {
    question: "¿Qué fruta tiene cáscara amarilla y es blanda por dentro?",
    options: ["Fresa", "Plátano", "Uva", "Sandía"],
    explanation: "¡El plátano! Excelente para la merienda.",
  },
  "act:kid-1-2-l1-6": {
    sentence:
      "Las frutas, hortalizas y verduras tienen muchas ___ para que el cuerpo crezca fuerte.",
    options: ["piedritas", "golosinas", "pinturas", "vitaminas"],
    explanation: "¡Vitaminas! Ayudan al cuerpo a funcionar bien.",
  },
  "act:kid-1-2-l1-7": {
    prompt: "Une la fruta con su grupo:",
    pairs: [
      {
        left: "Fresa",
        right: "Fruta",
      },
      {
        left: "Espinaca",
        right: "Hortaliza",
      },
      {
        left: "Chayote",
        right: "Verdura",
      },
    ],
    explanation: "¡Ya reconoces cada grupo perfectamente!",
  },
  "act:kid-1-2-l1-8": {
    question: "¿Cuáles de estas son FRUTAS?",
    options: ["Calabacín", "Uva", "Mango", "Zanahoria"],
    explanation: "¡El mango y la uva son frutas! La zanahoria y el calabacín son verduras.",
  },
  "act:kid-1-2-l1-9": {
    setup: "En la merienda de la escuela, Léo solo quiere comer galletas.",
    question: "¿Cuál sería un buen cambio, manteniendo la merienda rica?",
    options: ["Una fruta picada", "Más galletas", "Refresco", "Nada"],
    explanation: "¡Una fruta picada es dulce, rica y llena de vitaminas!",
  },
  "act:kid-1-2-l1-10": {
    prompt: "¿Qué fruta o verdura nueva te animarías a probar esta semana?",
  },
  "act:kid-1-2-l2-1": {
    title: "Cómo comer más frutas y verduras",
    body: "Se pueden poner frutas y verduras en **todas las comidas**: fruta en el desayuno y en la merienda, verduras en el almuerzo y en la cena. Probar cosas nuevas ayuda a que te gusten.",
    points: [
      "Prueba una cucharadita de cada cosa nueva",
      "Pruébalo de formas distintas: crudo, cocido, asado",
      "Elige junto con la familia en el mercado",
    ],
    tip: "A veces necesitamos probar 10 veces hasta que nos guste. ¡Sigue intentándolo!",
  },
  "act:kid-1-2-l2-2": {
    prompt: "¿Fruta, verdura u hortaliza?",
    groups: ["Fruta", "Verdura", "Hortaliza"],
    items: ["Manzana", "Plátano", "Zanahoria", "Calabaza", "Lechuga", "Col rizada"],
    explanation: "¡Eso! Cada uno tiene su grupo.",
  },
  "act:kid-1-2-l2-3": {
    statement: "Si no te gustó un alimento la primera vez, nunca te va a gustar.",
    explanation: "¡Nuestro paladar aprende! Probar de nuevo ayuda a que te guste.",
  },
  "act:kid-1-2-l2-4": {
    question: "¿Cuáles son buenas ideas de merienda?",
    options: [
      "Fruta picada",
      "Snack de bolsa",
      "Zanahoria con pasta de garbanzo",
      "Caramelo",
      "Yogur con fruta",
    ],
    explanation: "La fruta, el yogur y la zanahoria son meriendas fuertes y ricas.",
  },
  "act:kid-1-2-l2-5": {
    prompt: "¿Cómo lavar una fruta antes de comerla?",
    items: [
      "Lávate las manos",
      "Lava la fruta con agua corriente",
      "Frota la cáscara con cuidado",
      "Sécala y cómela",
    ],
    explanation: "Lavarse las manos y la fruta protege la pancita.",
  },
  "act:kid-1-2-l2-6": {
    question: "¿Cuándo es un buen momento para comer frutas?",
    options: [
      "Solo en el cumpleaños",
      "Solo cuando estás enfermo",
      "En la merienda y de postre",
      "Nunca",
    ],
    explanation: "¡Las frutas son geniales todos los días!",
  },
  "act:kid-1-2-l2-7": {
    prompt: "Une el alimento con la forma de prepararlo:",
    pairs: [
      {
        left: "Zanahoria",
        right: "Cruda o cocida",
      },
      {
        left: "Plátano",
        right: "Pelar y comer",
      },
      {
        left: "Calabaza",
        right: "Cocida o asada",
      },
    ],
    explanation: "¡Cada verdura puede prepararse de muchas formas ricas!",
  },
  "act:kid-1-2-l2-8": {
    setup: "Dudu probó el brócoli por primera vez y no le gustó mucho.",
    question: "¿Qué puede hacer?",
    options: [
      "Renunciar a las verduras para siempre",
      "Comer solo dulces",
      "Nunca más comer verduras",
      "Probar de nuevo otro día, de otra forma",
    ],
    explanation:
      "¡Nuestro paladar cambia! Probar de nuevo, de una forma distinta, ayuda a descubrir si nos gusta.",
  },
  "act:kid-1-2-l2-9": {
    question:
      "A veces necesitamos probar un alimento nuevo varias veces hasta que empieza a gustarnos. ¿Cuántas veces, más o menos?",
    unit: " veces",
    explanation:
      "¡Los estudios muestran que el paladar puede necesitar unos 10 intentos para acostumbrarse a un sabor nuevo!",
  },
  "act:kid-1-2-l2-10": {
    statement:
      "Comer frutas y verduras de formas distintas, como crudas, cocidas o asadas, puede ayudar a que te gusten más.",
    explanation: "¡Así es! Cada forma de preparación cambia el sabor y la textura.",
  },
  "act:kid-1-2-l3-1": {
    title: "La fruta entera es mejor",
    body: "Una fruta entera tiene **fibras**, que ayudan a que la barriga funcione y nos dejan satisfechos. El jugo de cajita tiene mucho azúcar añadido y pocas fibras.",
    points: [
      "La fruta entera es mejor que el jugo",
      "El jugo de cajita tiene azúcar añadido",
      "El agua es la mejor bebida",
    ],
    tip: "¡La fruta de postre es un dulcecito natural!",
  },
  "act:kid-1-2-l3-2": {
    question: "¿Qué es mejor para la merienda?",
    options: ["Refresco", "Jugo de cajita", "Una naranja entera", "Caramelo"],
    explanation: "La naranja entera tiene fibras y vitaminas.",
  },
  "act:kid-1-2-l3-3": {
    statement: "El jugo de cajita tiene tantas fibras como la fruta entera.",
    explanation: "Tiene pocas fibras y, muchas veces, azúcar añadido.",
  },
  "act:kid-1-2-l3-4": {
    question: "¿Qué hace la fibra de la fruta?",
    options: [
      "Estropea los dientes",
      "Nos deja satisfechos",
      "Ayuda a que la barriga funcione",
      "Deja el cuerpo más fuerte por dentro",
    ],
    explanation: "Las fibras ayudan a la barriga y a la saciedad.",
  },
  "act:kid-1-2-l3-5": {
    prompt: "¿Mejor opción o solo de vez en cuando?",
    groups: ["Mejor opción", "Solo de vez en cuando"],
    items: [
      "Manzana",
      "Plátano",
      "Uva",
      "Jugo de cajita",
      "Gelatina de paquete",
      "Caramelo de fruta",
    ],
    explanation: "¡Las frutas de verdad son la mejor opción!",
  },
  "act:kid-1-2-l3-6": {
    sentence: "La ___ de la fruta ayuda al intestino a funcionar bien.",
    options: ["cola", "fibra", "pintura", "golosina"],
    explanation: "La fibra ayuda a la pancita.",
  },
  "act:kid-1-2-l3-7": {
    prompt: "Une la fruta con la forma de comerla:",
    pairs: [
      {
        left: "Naranja",
        right: "Chupar los gajos",
      },
      {
        left: "Plátano",
        right: "Pelar y comer",
      },
      {
        left: "Sandía",
        right: "Comer en rodajas",
      },
      {
        left: "Uva",
        right: "Lavar y comer del racimo",
      },
    ],
    explanation: "¡Cada fruta tiene su forma rica de comerse!",
  },
  "act:kid-1-2-l3-8": {
    question: "¿Qué tiene MÁS fibras?",
    options: ["Jugo de naranja colado", "Naranja entera", "Refresco de naranja"],
    explanation:
      "La naranja entera conserva todas las fibras. El jugo colado pierde buena parte de ellas.",
  },
  "act:kid-1-2-l3-9": {
    setup: "Bia tomó un jugo de cajita en la merienda y, poco después, ya tenía hambre otra vez.",
    question: "¿Qué podría haber ayudado más a aguantar el hambre?",
    options: ["Nada, estaba bien", "Tomar más jugo", "Comer la fruta entera", "Comer un dulce"],
    explanation: "La fruta entera tiene fibras que dan más saciedad que el jugo.",
  },
  "act:kid-1-2-l3-10": {
    prompt: "¿Prefieres comer la fruta entera o tomarla en jugo? ¿Por qué?",
  },
  "stop:kid-1-3": {
    title: "Agua, la Superbebida",
    summary: "Por qué el agua es tan importante y cómo beber más.",
  },
  "act:kid-1-3-l1-1": {
    title: "¡El agua es vida!",
    body: "Nuestro cuerpo necesita **mucha agua** para funcionar: ayuda a la digestión, a la piel y a mantener el cuerpo a la temperatura correcta. ¡Cuando sentimos sed, el cuerpo está pidiendo agua!",
    points: [
      "Bebe agua durante todo el día",
      "Lleva una botellita a la escuela",
      "¿Jugaste mucho? ¡Bebe más agua!",
    ],
    tip: "¡Un cuerpo bien hidratado tiene más energía para jugar!",
  },
  "act:kid-1-3-l1-2": {
    question: "¿Cuál es la mejor bebida para calmar la sed?",
    options: ["Leche con chocolate", "Jugo de cajita", "Refresco", "Agua"],
    explanation: "El agua es la mejor amiga de la sed.",
  },
  "act:kid-1-3-l1-3": {
    statement: "Después de jugar mucho, el cuerpo necesita más agua.",
    explanation: "¡Eso! Perdemos agua sudando cuando nos movemos.",
  },
  "act:kid-1-3-l1-4": {
    question: "¿Cuándo debemos beber agua?",
    options: [
      "Solo por la mañana",
      "Solo cuando estamos enfermos",
      "Durante todo el día",
      "Solo en verano",
    ],
    explanation: "El agua hace bien a cualquier hora del día.",
  },
  "act:kid-1-3-l1-5": {
    sentence: "Cuando sentimos ___, es señal de que el cuerpo quiere agua.",
    options: ["sed", "risa", "sueño", "frío"],
    explanation: "La sed es el aviso del cuerpo.",
  },
  "act:kid-1-3-l1-6": {
    statement: "El refresco calma la sed tan bien como el agua.",
    explanation: "El refresco tiene mucho azúcar. El agua es siempre la mejor.",
  },
  "act:kid-1-3-l1-7": {
    question: "¿Cuáles son buenos momentos para beber agua?",
    options: ["Durante todo el día", "Solo si estás enfermo", "Por la mañana", "Después de jugar"],
    explanation: "El agua hace bien a cualquier hora, ¡y más aún después de jugar mucho!",
  },
  "act:kid-1-3-l1-8": {
    setup: "Enzo tiene la boca seca y mucha sed en el recreo.",
    question: "¿Qué debe hacer?",
    options: ["Comer un caramelo", "Nada", "Esperar hasta llegar a casa", "Beber agua"],
    explanation: "Sentir sed es el cuerpo pidiendo agua. ¡Lo mejor es beber enseguida!",
  },
  "act:kid-1-3-l1-9": {
    question: "¿Cuántos vasos de agua crees que es bueno beber a lo largo de un día en la escuela?",
    unit: " vasos",
    explanation:
      "¡Beber agua varias veces a lo largo del día, incluso en pequeñas cantidades, ayuda mucho!",
  },
  "act:kid-1-3-l1-10": {
    prompt: "¿Ya bebiste agua hoy? ¿Qué tal beber un vaso ahora mismo?",
  },
  "act:kid-1-3-l2-1": {
    title: "Agua en todas partes",
    body: "El agua no está solo en el vaso: también está en la **sandía, la naranja y el pepino**. Y es excelente para los dientes. Los refrescos y los jugos endulzados pueden causar caries.",
    points: [
      "La sandía y la naranja tienen mucha agua",
      "El agua hace bien a los dientes",
      "Las bebidas dulces aumentan el riesgo de caries",
    ],
    tip: "Consejo: ¡el agua con rodajas de fruta queda muy rica!",
  },
  "act:kid-1-3-l2-2": {
    prompt: "¿Bebida para todos los días o solo de vez en cuando?",
    groups: ["Todos los días", "Solo de vez en cuando"],
    items: [
      "Agua",
      "Agua de coco",
      "Agua con limón sin azúcar",
      "Refresco",
      "Jugo de cajita",
      "Leche con chocolate",
    ],
    explanation:
      "El agua es la bebida del día a día. Las bebidas dulces quedan para ocasiones especiales.",
  },
  "act:kid-1-3-l2-3": {
    question: "¿Qué alimentos tienen mucha agua?",
    options: ["Pepino", "Tostada", "Galleta", "Naranja", "Sandía"],
    explanation: "Las frutas y verduras nos ayudan a hidratarnos.",
  },
  "act:kid-1-3-l2-4": {
    prompt: "Ordena el día del agua:",
    items: [
      "Bebe un vaso al despertar",
      "Lleva la botellita a la escuela",
      "Bebe después de jugar",
      "Bebe un vaso antes de dormir",
    ],
    explanation: "Así bebes agua durante todo el día.",
  },
  "act:kid-1-3-l2-5": {
    statement: "Las bebidas dulces hacen bien a los dientes.",
    explanation: "El azúcar ayuda a que se formen caries.",
  },
  "act:kid-1-3-l2-6": {
    question: "¿Qué es mejor para acompañar el almuerzo?",
    options: ["Refresco", "Agua", "Refresco en polvo", "Caramelo"],
    explanation: "El agua es la mejor compañera de las comidas.",
  },
  "act:kid-1-3-l2-7": {
    prompt: "Une la fruta con la cantidad de agua que tiene:",
    pairs: [
      {
        left: "Sandía",
        right: "Mucha agua",
      },
      {
        left: "Pepino",
        right: "Mucha agua",
      },
      {
        left: "Plátano",
        right: "Un poco menos de agua",
      },
    ],
    explanation: "¡Las frutas con mucha agua ayudan mucho a la hidratación!",
  },
  "act:kid-1-3-l2-8": {
    setup: "En el equipo de fútbol, después del entrenamiento, todos están sudados y con sed.",
    question: "¿Qué es mejor para reponer el agua del cuerpo?",
    options: ["Jugo muy dulce", "Leche con chocolate", "Refresco helado", "Agua"],
    explanation:
      "Después de sudar mucho, el agua es siempre la mejor opción para reponer lo perdido.",
  },
  "act:kid-1-3-l2-9": {
    statement: "Comer sandía también ayuda a hidratarse.",
    explanation: "¡La sandía está hecha casi toda de agua, además de ser dulce y rica!",
  },
  "act:kid-1-3-l2-10": {
    prompt: "¿Qué fruta con bastante agua te gusta más comer en verano?",
  },
  "act:kid-1-3-l3-1": {
    title: "¿Cómo saber si bebí suficiente agua?",
    body: "Un consejo es mirar el color del pipí: **clarito** es señal de buena hidratación; **oscuro** es señal de que es hora de beber más agua.",
    points: ["Clarito: todo bien", "Oscuro: bebe más agua", "Boca seca y mucha sed: pide agua"],
    tip: "¡Es importante estar atento a tu cuerpo!",
  },
  "act:kid-1-3-l3-2": {
    question: "Si el pipí está muy oscuro, ¿qué hacer?",
    options: ["Beber más agua", "Tomar refresco", "No hacer nada", "Comer caramelos"],
    explanation: "Beber agua ayuda al cuerpo a hidratarse.",
  },
  "act:kid-1-3-l3-3": {
    statement: "Todas las personas necesitan exactamente la misma cantidad de agua.",
    explanation: "Depende de la edad, del calor y de los juegos.",
  },
  "act:kid-1-3-l3-4": {
    question: "¿Cuándo necesitamos beber MÁS agua?",
    options: [
      "Después de correr",
      "Cuando hace frío y estamos quietecitos",
      "Con calor",
      "Cuando estamos enfermos con fiebre",
    ],
    explanation: "El calor, el ejercicio y la fiebre piden más agua.",
  },
  "act:kid-1-3-l3-5": {
    prompt: "Une la situación con lo que hay que hacer:",
    pairs: [
      {
        left: "Tengo sed",
        right: "Beber agua",
      },
      {
        left: "Jugué mucho",
        right: "Beber agua y descansar",
      },
      {
        left: "Voy a la escuela",
        right: "Llevar la botellita",
      },
    ],
    explanation: "¡Ya sabes cuidar tu hidratación!",
  },
  "act:kid-1-3-l3-6": {
    prompt: "¿Necesito beber agua?",
    groups: ["Necesito agua", "Estoy bien hidratado"],
    items: ["Sed", "Boca seca", "Pipí oscuro", "Pipí clarito", "Sin sed", "Boca húmeda"],
    explanation: "Está atento a las señales del cuerpo.",
  },
  "act:kid-1-3-l3-7": {
    sentence: "El agua ayuda al cuerpo a tener mucha ___ para jugar.",
    options: ["pereza", "suciedad", "energía", "pintura"],
    explanation: "¡Energía! El agua es combustible para jugar.",
  },
  "act:kid-1-3-l3-8": {
    question: "¿Qué señales muestran que el cuerpo está bien hidratado?",
    options: ["Pipí muy oscuro", "Boca húmeda", "Pipí clarito", "Sin sed"],
    explanation: "¡Pipí clarito, sin sed y boca húmeda son señales de que todo está bien!",
  },
  "act:kid-1-3-l3-9": {
    setup:
      "Después de un día muy caluroso jugando afuera, Sofía siente la boca seca y un poco de dolor de cabeza.",
    question: "¿Qué debería hacer primero?",
    options: [
      "Beber agua y descansar a la sombra",
      "Comer un snack",
      "Seguir corriendo al sol",
      "Nada, se le pasará solo",
    ],
    explanation:
      "La boca seca y el dolor de cabeza con calor pueden ser señal de deshidratación. ¡El agua y la sombra ayudan mucho!",
  },
  "act:kid-1-3-l3-10": {
    prompt: "¿Qué te ayuda a recordar beber agua a lo largo del día?",
  },
  "trail:kid-corpo": {
    title: "Cuerpo Fuerte y Feliz",
    tagline: "Rutina, dientes e higiene",
    description:
      "Aprende a comer con calma, cuidar los dientes y mantener las manos y la comida limpitas.",
  },
  "unit:kid-unit-2": {
    title: "Cuidando de Mí",
    description: "Desayuno, masticación e higiene.",
  },
  "stop:kid-2-1": {
    title: "Desayuno de Campeón",
    summary: "Empieza el día con energía y aprende a armar meriendas fuertes.",
  },
  "act:kid-2-1-l1-1": {
    title: "El primer combustible del día",
    body: "Durante la noche, el cuerpo pasa muchas horas sin comer. El **desayuno** da energía para estudiar, jugar y prestar atención.",
    points: [
      "Fruta, pan integral, huevo o yogur",
      "Leche o agua para beber",
      "Come algo antes de salir de casa",
    ],
    tip: "¡Un buen desayuno ayuda en la escuela!",
  },
  "act:kid-2-1-l1-2": {
    question: "¿Cuál es un desayuno fuerte y rico?",
    options: ["Nada", "Pan integral con huevo y fruta", "Solo refresco", "Solo caramelos"],
    explanation: "¡Energía, proteína y fruta: un desayuno de campeón!",
  },
  "act:kid-2-1-l1-3": {
    statement: "Saltarse el desayuno ayuda a tener más energía.",
    explanation: "Sin desayuno, el cuerpo se queda sin combustible.",
  },
  "act:kid-2-1-l1-4": {
    prompt: "Une el alimento con lo que da:",
    pairs: [
      {
        left: "Fruta",
        right: "Vitaminas",
      },
      {
        left: "Huevo",
        right: "Proteína",
      },
      {
        left: "Pan integral",
        right: "Energía",
      },
      {
        left: "Leche",
        right: "Calcio para los huesos",
      },
    ],
    explanation: "¡Cada alimento tiene su misión!",
  },
  "act:kid-2-1-l1-5": {
    sentence: "El desayuno es la primera ___ del día.",
    options: ["clase", "comida", "diversión", "siesta"],
    explanation: "¡Comida! Es la hora de recargar.",
  },
  "act:kid-2-1-l1-6": {
    question: "¿Qué bebida combina con el desayuno?",
    options: ["Leche o agua", "Jugo en polvo", "Refresco", "Gaseosa de guaraná"],
    explanation: "La leche y el agua son excelentes compañías.",
  },
  "act:kid-2-1-l1-7": {
    question: "¿Qué combina en un desayuno de campeón?",
    options: ["Caramelos", "Pan integral", "Huevo", "Fruta"],
    explanation: "La fruta, el huevo y el pan integral dan energía de verdad para el día.",
  },
  "act:kid-2-1-l1-8": {
    setup: "Théo se despertó tarde y quiere salir de casa sin comer nada.",
    question: "¿Qué sería mejor que hiciera?",
    options: [
      "Salir sin comer nada",
      "Comer solo caramelos en el camino",
      "Comer algo rápido, como una fruta con pan",
      "Tomar refresco",
    ],
    explanation:
      "Incluso rápido, una merendita con fruta y pan da energía para que el día empiece bien.",
  },
  "act:kid-2-1-l1-9": {
    prompt: "Ordena una mañana de campeón:",
    items: [
      "Despertar y lavarse la cara",
      "Tomar un desayuno completo",
      "Cepillarse los dientes",
      "Ir a la escuela con energía",
    ],
    explanation: "¡Así el día empieza con todo!",
  },
  "act:kid-2-1-l1-10": {
    prompt: "¿Qué es lo que más te gusta comer en el desayuno?",
  },
  "act:kid-2-1-l2-1": {
    title: "Armando un desayuno",
    body: "Elige **energía + proteína + fruta**: así te quedas con energía por más tiempo.",
    points: [
      "Energía: pan integral, avena, tapioca",
      "Proteína: huevo, queso, yogur",
      "Fruta: plátano, papaya, naranja",
    ],
    tip: "Los cereales muy dulces dan energía rápida, pero pasa deprisa.",
  },
  "act:kid-2-1-l2-2": {
    prompt: "¿Gran elección o solo de vez en cuando?",
    groups: ["Gran elección", "Solo de vez en cuando"],
    items: [
      "Fruta",
      "Huevo",
      "Pan integral",
      "Galleta rellena",
      "Cereal con mucho azúcar",
      "Pastel de paquete",
    ],
    explanation: "Los alimentos enteros dan energía por más tiempo.",
  },
  "act:kid-2-1-l2-3": {
    prompt: "Organiza la hora del desayuno:",
    items: ["Lávate las manos", "Siéntate a la mesa", "Come con calma", "Cepíllate los dientes"],
    explanation: "¡Una rutina rica y saludable!",
  },
  "act:kid-2-1-l2-4": {
    question: "¿Qué combina en el desayuno?",
    options: ["Yogur natural", "Plátano", "Caramelos", "Refresco", "Huevo revuelto"],
    explanation: "El plátano, el huevo y el yogur son excelentes.",
  },
  "act:kid-2-1-l2-5": {
    statement: "El yogur y las frutas pueden formar un buen desayuno.",
    explanation: "¡Eso! Es rico y nutritivo.",
  },
  "act:kid-2-1-l2-6": {
    sentence: "El pan ___ es una buena elección porque tiene fibras.",
    options: ["de caramelo", "frito", "dulce", "integral"],
    explanation: "El pan integral tiene más fibras.",
  },
  "act:kid-2-1-l2-7": {
    prompt: "Une el alimento con el grupo del desayuno:",
    pairs: [
      {
        left: "Huevo",
        right: "Proteína",
      },
      {
        left: "Plátano",
        right: "Fruta",
      },
      {
        left: "Avena",
        right: "Energía",
      },
    ],
    explanation: "¡Un desayuno completo reúne los tres grupos!",
  },
  "act:kid-2-1-l2-8": {
    setup: "En el desayuno, Ana solo tomó un vaso de jugo muy dulce y salió corriendo.",
    question: "¿Qué faltó para que su desayuno fuera más completo?",
    options: [
      "Más azúcar en el jugo",
      "Solo más jugo",
      "Una proteína, como huevo o queso, y algo de energía",
      "Nada, está genial",
    ],
    explanation:
      "El jugo solo da hambre rápido. La proteína y la energía ayudan a aguantar hasta la merienda.",
  },
  "act:kid-2-1-l2-9": {
    statement: "Los cereales muy azucarados dan una energía que se pasa rápido.",
    explanation:
      "El azúcar da energía rápida, pero se acaba pronto, dejando hambre de nuevo temprano.",
  },
  "act:kid-2-1-l2-10": {
    prompt: "Si pudieras armar el desayuno de tus sueños (pero saludable), ¿qué pondrías en él?",
  },
  "act:kid-2-1-l3-1": {
    title: "Merienda de la escuela",
    body: "La merienda necesita **aguantar el hambre** hasta el almuerzo. La fruta, el yogur natural y el sándwich de pan integral son excelentes ideas.",
    points: [
      "Fruta y agua",
      "Sándwich de pan integral con queso",
      "Evita la galleta rellena todos los días",
    ],
    tip: "¡Una buena merienda da energía hasta la hora de jugar!",
  },
  "act:kid-2-1-l3-2": {
    question: "¿Qué merienda elegir para llevar a la escuela?",
    options: [
      "Snack y refresco",
      "Caramelos y chicle",
      "Galleta rellena",
      "Sándwich de pan integral y fruta",
    ],
    explanation: "Una merienda completa te deja con energía.",
  },
  "act:kid-2-1-l3-3": {
    question: "¿Cuáles son buenas meriendas?",
    options: ["Snack de bolsa", "Yogur natural", "Sándwich integral", "Plátano"],
    explanation: "La fruta, el yogur y el sándwich integral son excelentes.",
  },
  "act:kid-2-1-l3-4": {
    statement: "Es posible llevar frutas en la lonchera.",
    explanation: "¡Claro! Lávalas antes de guardarlas.",
  },
  "act:kid-2-1-l3-5": {
    prompt: "¿Merienda inteligente o merienda de fiesta?",
    groups: ["Merienda inteligente", "Merienda de fiesta"],
    items: [
      "Plátano",
      "Yogur",
      "Sándwich integral",
      "Snack de bolsa",
      "Refresco",
      "Pastel con relleno",
    ],
    explanation: "La fiesta también es rica, pero el día a día pide alimentos enteros.",
  },
  "act:kid-2-1-l3-6": {
    prompt: "Une el alimento con el consejo:",
    pairs: [
      {
        left: "Fruta",
        right: "Lávala antes",
      },
      {
        left: "Sándwich",
        right: "Guárdalo en la lonchera",
      },
      {
        left: "Agua",
        right: "Llévala en la botellita",
      },
    ],
    explanation: "¡Ya sabes armar la lonchera!",
  },
  "act:kid-2-1-l3-7": {
    sentence: "Una merienda inteligente ayuda a tener ___ para las clases.",
    options: ["energía", "sueño", "hambre", "pereza"],
    explanation: "Energía para aprender y jugar.",
  },
  "act:kid-2-1-l3-8": {
    question: "¿Cuáles son buenas opciones de merienda para llevar en la lonchera?",
    options: ["Fruta", "Yogur natural", "Snack de bolsa", "Sándwich integral"],
    explanation: "La fruta, el sándwich integral y el yogur son meriendas inteligentes y ricas.",
  },
  "act:kid-2-1-l3-9": {
    setup:
      "A la hora de la merienda, los amigos de Pedro están comiendo snacks de bolsa, y a él le dieron ganas de comer lo mismo todos los días.",
    question: "¿Qué puede hacer?",
    options: [
      "Ponerse triste y no merendar",
      "No comer nada",
      "Comer su merienda saludable la mayoría de los días, y el snack de vez en cuando",
      "Comer snacks todos los días también",
    ],
    explanation:
      "No hace falta prohibir nada, pero la merienda inteligente puede ser la de todos los días, y el snack, de vez en cuando.",
  },
  "act:kid-2-1-l3-10": {
    prompt: "¿Qué podrías llevar de merienda inteligente a la escuela esta semana?",
  },
  "stop:kid-2-2": {
    title: "Masticar con Calma",
    summary: "Comer despacio, escuchar a la pancita y cuidar los dientes.",
  },
  "act:kid-2-2-l1-1": {
    title: "Masticar es empezar la digestión",
    body: "¡La digestión empieza en la **boca**! Cuando masticamos bien, la comida se convierte en pedacitos y el cuerpo la aprovecha mejor. Comer despacio también da tiempo a la barriga para avisar que estamos satisfechos.",
    points: ["Mastica bien antes de tragar", "Come sin prisa", "Para cuando la barriga avise"],
    tip: "La barriga tarda unos 20 minutos en avisar que está llena.",
  },
  "act:kid-2-2-l1-2": {
    question: "¿Dónde empieza la digestión?",
    options: ["En la boca", "En el pelo", "En el ojo", "En el pie"],
    explanation: "¡En la boca, con la masticación!",
  },
  "act:kid-2-2-l1-3": {
    statement: "Comer muy rápido es excelente para el cuerpo.",
    explanation: "Comer rápido perjudica la digestión y el aviso de la barriga.",
  },
  "act:kid-2-2-l1-4": {
    sentence: "Para comer bien, debemos ___ bien la comida.",
    options: ["esconder", "masticar", "tirar", "tragar"],
    explanation: "Masticar bien es el primer paso.",
  },
  "act:kid-2-2-l1-5": {
    question: "¿Qué ayuda a comer con calma?",
    options: ["Comer de pie", "Ver la tele muy alto", "Sentarse a la mesa", "Correr con el plato"],
    explanation: "Sentarse a la mesa ayuda a prestar atención.",
  },
  "act:kid-2-2-l1-6": {
    statement: "Conversar y sonreír en la mesa ayuda a comer despacio.",
    explanation: "Una comida alegre es una comida tranquila.",
  },
  "act:kid-2-2-l1-7": {
    question: "¿Qué ayuda a comer con calma?",
    options: [
      "Conversar tranquilamente",
      "Correr mientras se come",
      "Masticar bien",
      "Sentarse a la mesa",
    ],
    explanation:
      "Masticar bien, sentarse a la mesa y conversar tranquilamente ayudan a comer con calma.",
  },
  "act:kid-2-2-l1-8": {
    setup: "A la hora del almuerzo, Duda traga la comida corriendo para ir a jugar pronto.",
    question: "¿Qué podría hacer distinto?",
    options: [
      "Comer aún más rápido",
      "Comer con calma, masticando bien",
      "No almorzar",
      "Comer caminando",
    ],
    explanation: "Comer con calma ayuda a la digestión y a percibir cuándo está satisfecha.",
  },
  "act:kid-2-2-l1-9": {
    prompt: "Ordena un bocado con calma:",
    items: [
      "Pon una porción pequeña en la boca",
      "Mastica muy despacio",
      "Percibe el sabor",
      "Traga y respira antes del siguiente",
    ],
    explanation: "Despacio y con constancia: así la comida queda más rica.",
  },
  "act:kid-2-2-l1-10": {
    prompt: "¿Sueles comer rápido o despacio? ¿Qué podría ayudarte a comer con más calma?",
  },
  "act:kid-2-2-l2-1": {
    title: "La pancita avisa",
    body: "Cuando comemos, la barriga manda un mensaje: **estoy satisfecha**. ¡Escuchar ese mensaje es genial! Si todavía tienes hambre, puedes repetir; si estás lleno, puedes parar.",
    points: [
      "Hambre: barriga rugiendo",
      "Satisfecho: sin ganas de más",
      "Demasiado lleno: barriga apretada",
    ],
    tip: "¡No necesitas terminar todo si ya estás satisfecho!",
  },
  "act:kid-2-2-l2-2": {
    prompt: "Une la señal con lo que quiere decir:",
    pairs: [
      {
        left: "Barriga rugiendo",
        right: "Tengo hambre",
      },
      {
        left: "Sin ganas de más",
        right: "Estoy satisfecho",
      },
      {
        left: "Barriga apretada",
        right: "Comí demasiado",
      },
    ],
    explanation: "¡Ya sabes escuchar a tu pancita!",
  },
  "act:kid-2-2-l2-3": {
    prompt: "Ordena una comida tranquila:",
    items: [
      "Siéntate a la mesa",
      "Pon una porción pequeña",
      "Mastica despacio",
      "Escucha a la barriga antes de repetir",
    ],
    explanation: "Así comes al ritmo de tu cuerpo.",
  },
  "act:kid-2-2-l2-4": {
    question: "¿Qué perjudica comer con calma?",
    options: [
      "Ver la tele mientras se come",
      "Correr",
      "Sentarse a la mesa",
      "Jugar durante la comida",
    ],
    explanation: "Las distracciones perjudican la percepción de la barriga.",
  },
  "act:kid-2-2-l2-5": {
    statement: "Podemos dejar de comer cuando estamos satisfechos.",
    explanation: "¡Claro! El cuerpo sabe lo que necesita.",
  },
  "act:kid-2-2-l2-6": {
    prompt: "¿Ayuda o perjudica?",
    groups: ["Ayuda a comer con calma", "Perjudica"],
    items: [
      "Masticar despacio",
      "Sentarse a la mesa",
      "Conversar",
      "Comer corriendo",
      "Comer con la tableta",
      "Tragar sin masticar",
    ],
    explanation: "La atención y la calma hacen bien a la digestión.",
  },
  "act:kid-2-2-l2-7": {
    sentence: "Cuando estoy ___, es hora de dejar de comer.",
    options: ["atrasado", "soñoliento", "sucio", "satisfecho"],
    explanation: "Satisfecho es cuando el cuerpo dice 'ya basta'.",
  },
  "act:kid-2-2-l2-8": {
    prompt: "Une la señal de la barriga con lo que hay que hacer:",
    pairs: [
      {
        left: "Barriga satisfecha",
        right: "Puedo parar",
      },
      {
        left: "Todavía con hambre",
        right: "Puedo repetir un poco",
      },
    ],
    explanation: "¡Escuchar a la barriga es una habilidad que se entrena!",
  },
  "act:kid-2-2-l2-9": {
    setup:
      "Gui ya está satisfecho, pero el plato todavía tiene comida y cree que tiene que terminarlo todo.",
    question: "¿Qué puede hacer?",
    options: [
      "Escuchar a la barriga y parar cuando esté satisfecho",
      "Comer todo aunque esté lleno",
      "Nunca dejar de comer",
      "Comer hasta sentirse mal",
    ],
    explanation: "Está bien dejar comida en el plato cuando ya se está satisfecho.",
  },
  "act:kid-2-2-l2-10": {
    statement: "Siempre hay que terminar todo lo que está en el plato, aunque estés satisfecho.",
    explanation: "Escuchar a la barriga es más importante que terminar todo el plato.",
  },
  "act:kid-2-2-l3-1": {
    title: "Cuidando los dientes",
    body: "Después de comer, cepillarse los dientes quita los restitos de comida que causan **caries**. Cepíllate al menos **dos veces al día**, con ayuda de un adulto cuando lo necesites.",
    points: [
      "Cepíllate por la mañana y antes de dormir",
      "Usa pasta con flúor, en poca cantidad",
      "Los dulces pegajosos piden cepillado extra",
    ],
    tip: "¡Una sonrisa saludable empieza con el cepillado!",
  },
  "act:kid-2-2-l3-2": {
    question: "¿Cuántas veces cepillarse los dientes al día, como mínimo?",
    options: ["Ninguna", "Dos veces", "Solo cuando duele", "Una vez por semana"],
    explanation: "Por la mañana y por la noche, antes de dormir.",
  },
  "act:kid-2-2-l3-3": {
    statement: "Los dulces pegajosos ayudan a formar caries si no nos cepillamos.",
    explanation: "Los restitos de dulce alimentan a las bacterias que estropean los dientes.",
  },
  "act:kid-2-2-l3-4": {
    prompt: "Ordena el cepillado:",
    items: [
      "Pon un poquito de pasta",
      "Cepilla todos los dientecitos",
      "Cepilla la lengua",
      "Enjuágate la boca",
    ],
    explanation: "¡Cepillar todo, sin prisa!",
  },
  "act:kid-2-2-l3-5": {
    question: "¿Qué hace bien a los dientes?",
    options: [
      "Beber refresco a todas horas",
      "Cepillarse",
      "Comer frutas y verduras crujientes",
      "Agua",
    ],
    explanation: "El agua, el cepillo y los alimentos crujientes ayudan.",
  },
  "act:kid-2-2-l3-6": {
    prompt: "¿Bueno para los dientes o solo de vez en cuando?",
    groups: ["Bueno para los dientes", "Solo de vez en cuando"],
    items: ["Agua", "Zanahoria cruda", "Manzana", "Caramelo", "Refresco", "Chupetín"],
    explanation: "Los dulces son para el día de fiesta, y siempre con cepillado después.",
  },
  "act:kid-2-2-l3-7": {
    prompt: "Une el hábito con el motivo:",
    pairs: [
      {
        left: "Cepillarse",
        right: "Quita los restitos de comida",
      },
      {
        left: "Hilo dental",
        right: "Limpia entre los dientes",
      },
      {
        left: "Ir al dentista",
        right: "Cuida tu sonrisa",
      },
    ],
    explanation: "¡Ya sabes cuidar tu sonrisa!",
  },
  "act:kid-2-2-l3-8": {
    question: "¿Qué ayuda a cuidar bien los dientes?",
    options: [
      "Usar hilo dental",
      "Comer dulce todo el día sin cepillarse",
      "Ir al dentista",
      "Cepillarse por la mañana y por la noche",
    ],
    explanation:
      "Cepillarse bien, usar hilo dental y visitar al dentista mantienen la sonrisa saludable.",
  },
  "act:kid-2-2-l3-9": {
    setup:
      "Después de comer un dulce pegajoso en la fiesta, Vitor se fue directo a jugar sin cepillarse los dientes.",
    question: "¿Qué debería haber hecho?",
    options: [
      "Cepillarse los dientes después del dulce",
      "Solo enjuagarse la boca con refresco",
      "Comer más dulce",
      "No hacer nada",
    ],
    explanation:
      "Los dulces pegajosos piden cepillado extra, para no dejar restitos en los dientes.",
  },
  "act:kid-2-2-l3-10": {
    prompt: "¿Te acuerdas de cepillarte los dientes por la mañana y por la noche todos los días?",
  },
  "stop:kid-2-3": {
    title: "Manos Limpias, Comida Segura",
    summary: "Cómo lavarse las manos y cuidar los alimentos para evitar el dolor de barriga.",
  },
  "act:kid-2-3-l1-1": {
    title: "¿Por qué lavarse las manos?",
    body: "En las manos quedan **gérmenes** invisibles que pueden dar dolor de barriga. Lavarlas con agua y jabón antes de comer y después de ir al baño te protege a ti y a tu familia.",
    points: [
      "Antes de comer",
      "Después de ir al baño",
      "Después de jugar en la calle o con mascotas",
    ],
    tip: "¡Cantar 'Cumpleaños feliz' dos veces da el tiempo justo para lavarse!",
  },
  "act:kid-2-3-l1-2": {
    question: "¿Cuándo debemos lavarnos las manos?",
    options: ["Antes de comer", "Nunca", "Solo el domingo", "Solo si están negras"],
    explanation: "¡Antes de comer, siempre!",
  },
  "act:kid-2-3-l1-3": {
    statement: "El agua y el jabón son importantes para lavarse las manos.",
    explanation: "El jabón ayuda a eliminar los gérmenes.",
  },
  "act:kid-2-3-l1-4": {
    sentence: "Nos lavamos las manos con agua y ___.",
    options: ["jugo", "tierra", "pintura", "jabón"],
    explanation: "¡Jabón, claro!",
  },
  "act:kid-2-3-l1-5": {
    statement: "Solo hay que lavarse las manos si están visiblemente sucias.",
    explanation: "Los gérmenes son invisibles. Lávate siempre en los momentos correctos.",
  },
  "act:kid-2-3-l1-6": {
    question: "¿Qué pueden causar los gérmenes?",
    options: ["Dolor de barriga", "Superpoderes", "Buen sueño", "Pelo de colores"],
    explanation: "¡Por eso nos lavamos las manos!",
  },
  "act:kid-2-3-l1-7": {
    question: "¿Cuándo debemos lavarnos las manos?",
    options: ["Antes de comer", "Después del baño", "Nunca", "Después de jugar con tierra"],
    explanation: "Antes de comer, después del baño y después de tocar tierra: ¡siempre lavarse!",
  },
  "act:kid-2-3-l1-8": {
    setup: "Rafa jugó en el parque con tierra y arena, y ahora va a almorzar.",
    question: "¿Qué debe hacer antes de comer?",
    options: [
      "Nada, la tierra no hace daño",
      "Solo limpiarse en la ropa",
      "Lavarse bien las manos con agua y jabón",
      "Sentarse y comer directo",
    ],
    explanation:
      "La tierra puede tener gérmenes invisibles. Lavarse las manos antes de comer es siempre importante.",
  },
  "act:kid-2-3-l1-9": {
    prompt: "Ordena cómo lavarse bien las manos:",
    items: ["Moja las manos", "Pon jabón", "Frota bien, incluso entre los dedos", "Enjuaga y seca"],
    explanation: "¡Así las manos quedan limpitas de verdad!",
  },
  "act:kid-2-3-l1-10": {
    prompt: "¿Te acuerdas de lavarte las manos antes de todas las comidas?",
  },
  "act:kid-2-3-l2-1": {
    title: "Lavarse las manos en 4 pasos",
    body: "Moja, enjabona, frota durante **20 segundos**, enjuaga y seca con una toalla limpia. Frota las palmas, el dorso de las manos, entre los dedos y las uñas.",
    points: ["Moja las manos", "Enjabona bien", "Frota durante 20 segundos", "Enjuaga y seca"],
    tip: "¡Los rinconcitos entre los dedos esconden gérmenes!",
  },
  "act:kid-2-3-l2-2": {
    prompt: "Ordena los pasos para lavarse las manos:",
    items: ["Moja las manos", "Pon el jabón", "Frota durante 20 segundos", "Enjuaga y seca"],
    explanation: "¡Así las manos quedan limpitas!",
  },
  "act:kid-2-3-l2-3": {
    question: "¿En qué momentos lavarse las manos?",
    options: [
      "Antes de ver dibujos",
      "Antes de comer",
      "Después de jugar con tierra",
      "Después del baño",
    ],
    explanation: "Comer, el baño y la tierra son los momentos importantes.",
  },
  "act:kid-2-3-l2-4": {
    statement: "Secarse las manos con una toalla limpia forma parte de lavarse bien.",
    explanation: "Las manos mojadas esparcen más gérmenes.",
  },
  "act:kid-2-3-l2-5": {
    prompt: "¿Necesito lavarme las manos?",
    groups: ["Necesito lavarme", "No hace falta ahora"],
    items: [
      "Antes de la merienda",
      "Después del baño",
      "Después de jugar con tierra",
      "Viendo dibujos",
      "Leyendo un libro",
      "Sentado en el sofá",
    ],
    explanation: "Lávate siempre antes de comer y después de ensuciarte.",
  },
  "act:kid-2-3-l2-6": {
    prompt: "Une el momento con el cuidado:",
    pairs: [
      {
        left: "Voy a comer",
        right: "Lavarme las manos",
      },
      {
        left: "Jugué con tierra",
        right: "Lavarme las manos y las uñas",
      },
      {
        left: "Fui al baño",
        right: "Lavarme con jabón",
      },
    ],
    explanation: "¡Genial! Ya eres un experto en higiene.",
  },
  "act:kid-2-3-l2-7": {
    prompt: "Une el momento con el cuidado correcto:",
    pairs: [
      {
        left: "Antes de comer",
        right: "Lavarme las manos",
      },
      {
        left: "Después del parque",
        right: "Lavarme las manos y las uñas",
      },
      {
        left: "Después del baño",
        right: "Lavarme con jabón",
      },
    ],
    explanation: "¡Cada momento pide el mismo cuidado: agua y jabón!",
  },
  "act:kid-2-3-l2-8": {
    setup:
      "A la hora de la merienda, los amigos de Lara se fueron directo a comer sin lavarse las manos.",
    question: "¿Qué puede hacer Lara?",
    options: [
      "No comer nada",
      "Lavarse las manos antes de comer, aunque sus amigos no se las laven",
      "Hacer igual y no lavarse",
      "Comer solo la mitad de la merienda",
    ],
    explanation: "Cada uno cuida de su propia higiene, aunque los amigos hagan distinto.",
  },
  "act:kid-2-3-l2-9": {
    statement: "Los gérmenes son tan pequeños que no se pueden ver, pero pueden enfermarnos.",
    explanation:
      "Como son invisibles, nos lavamos las manos siempre, incluso cuando parecen limpias.",
  },
  "act:kid-2-3-l2-10": {
    prompt: "¿Cuántas veces al día te lavas las manos? ¿En qué momentos?",
  },
  "act:kid-2-3-l3-1": {
    title: "Comida segura",
    body: "Además de las manos, los alimentos también necesitan cuidado: **lavar frutas y hortalizas**, guardar en el refrigerador lo que se echa a perder y no comer comida con olor o aspecto extraño.",
    points: [
      "Lava frutas y hortalizas",
      "Guarda en el refrigerador lo que se echa a perder",
      "¿Olor o sabor raro? Avisa a un adulto",
    ],
    tip: "Si la comida parece rara, no la comas. ¡Llama a un adulto!",
  },
  "act:kid-2-3-l3-2": {
    question: "¿Qué hacer con una fruta antes de comerla?",
    options: ["Tirarla al suelo", "Pintarla", "Nada", "Lavarla"],
    explanation: "Lavar quita la suciedad y los gérmenes.",
  },
  "act:kid-2-3-l3-3": {
    statement: "La comida con olor extraño puede estar echada a perder.",
    explanation: "¡No la comas y avisa a un adulto!",
  },
  "act:kid-2-3-l3-4": {
    prompt: "Ordena el cuidado de la fruta:",
    items: ["Lávate las manos", "Lava la fruta", "Sécala", "Cómela"],
    explanation: "¡Primero las manos, luego la fruta!",
  },
  "act:kid-2-3-l3-5": {
    question: "¿Qué necesita estar en el refrigerador?",
    options: ["Yogur", "Pan seco", "Leche", "Frutas cortadas"],
    explanation: "Los alimentos que se echan a perder rápido se guardan en el refrigerador.",
  },
  "act:kid-2-3-l3-6": {
    prompt: "¿Refrigerador o puede quedarse fuera?",
    groups: ["En el refrigerador", "Puede quedarse fuera"],
    items: ["Leche", "Yogur", "Carne", "Plátano", "Arroz crudo", "Pasta seca"],
    explanation: "Los alimentos frescos y los lácteos piden refrigerador.",
  },
  "act:kid-2-3-l3-7": {
    prompt: "Une el cuidado con el motivo:",
    pairs: [
      {
        left: "Lavar las frutas",
        right: "Quita la suciedad y los gérmenes",
      },
      {
        left: "Guardar en el refrigerador",
        right: "Se conserva mejor",
      },
      {
        left: "Avisar a un adulto",
        right: "Ayuda a estar seguro",
      },
    ],
    explanation: "¡Eres un cuidador de alimentos!",
  },
  "act:kid-2-3-l3-8": {
    question: "¿Qué ayuda a mantener la comida segura?",
    options: [
      "Guardar la comida perecedera en el refrigerador",
      "Avisar a un adulto si algo parece raro",
      "Lavar frutas y hortalizas",
      "Comer comida con olor extraño",
    ],
    explanation: "Lavar, guardar bien y avisar a un adulto son los cuidados correctos.",
  },
  "act:kid-2-3-l3-9": {
    setup: "Marina encontró un trozo de queso olvidado fuera del refrigerador desde hace dos días.",
    question: "¿Qué debe hacer?",
    options: [
      "No comerlo y avisar a un adulto",
      "Comerlo de todos modos",
      "Solo olerlo y comerlo si no siente nada",
      "Dárselo al perro",
    ],
    explanation:
      "La comida fuera del refrigerador mucho tiempo puede echarse a perder sin parecerlo. Lo mejor es avisar a un adulto.",
  },
  "act:kid-2-3-l3-10": {
    prompt: "¿Qué harías si encontraras comida con olor extraño en el refrigerador?",
  },
};

export default content;

// Avaliações da consulta: sinais vitais, dor, questionários validados e testes funcionais.
// Cada instrumento sabe calcular a pontuação e a faixa de gravidade; o resultado fica em
// clinical_assessments e aparece no acompanhamento (para o paciente, quando compartilhado).
//
// PHQ-9 e GAD-7 (Pfizer, uso livre), WHO-5 (OMS, uso livre) e PAR-Q (domínio público) são
// rastreios: não fecham diagnóstico, apoiam a avaliação do profissional.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";
import type { Names } from "@/lib/appearance-data";
import { useClinicalMutation } from "./queries";

export type Assessment = Tables<"clinical_assessments">;
export type Tone = "good" | "mild" | "moderate" | "severe" | "neutral";

export interface Outcome {
  score: number | null;
  severity: string | null;
  label: Names;
  tone: Tone;
  /** Aviso importante para o profissional (ex.: item de risco positivo). */
  alert?: Names;
}

interface Base {
  id: string;
  name: Names;
  short: string;
  about: Names;
  /** Pode ser enviado para o paciente responder na tela dele, durante a chamada. */
  patientCanAnswer: boolean;
}

export interface QuestionnaireInstrument extends Base {
  type: "questionnaire";
  intro: Names;
  questions: Names[];
  options: { label: Names; value: number }[];
  evaluate: (answers: number[]) => Outcome;
  max: number;
}

export interface FieldsInstrument extends Base {
  type: "fields";
  fields: {
    key: string;
    label: Names;
    unit?: string;
    min?: number;
    max?: number;
    step?: number;
    text?: boolean;
    slider?: boolean;
    options?: { value: string; label: Names }[];
  }[];
  evaluate: (data: Record<string, number | string | null>) => Outcome;
}

export type Instrument = QuestionnaireInstrument | FieldsInstrument;

const FREQ4: { label: Names; value: number }[] = [
  { label: ["Nenhuma vez", "Not at all", "Ningún día", "Jamais"], value: 0 },
  { label: ["Vários dias", "Several days", "Varios días", "Plusieurs jours"], value: 1 },
  {
    label: [
      "Mais da metade dos dias",
      "More than half the days",
      "Más de la mitad de los días",
      "Plus de la moitié du temps",
    ],
    value: 2,
  },
  {
    label: [
      "Quase todos os dias",
      "Nearly every day",
      "Casi todos los días",
      "Presque tous les jours",
    ],
    value: 3,
  },
];

const TWO_WEEKS: Names = [
  "Nas últimas 2 semanas, com que frequência você foi incomodado(a) por:",
  "Over the last 2 weeks, how often have you been bothered by:",
  "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado:",
  "Au cours des 2 dernières semaines, à quelle fréquence avez-vous été gêné(e) par :",
];

const sum = (a: number[]) => a.reduce((x, y) => x + (Number.isFinite(y) ? y : 0), 0);

export const INSTRUMENTS: Instrument[] = [
  {
    id: "sinais_vitais",
    type: "fields",
    name: ["Sinais vitais", "Vital signs", "Signos vitales", "Signes vitaux"],
    short: "SV",
    about: [
      "Pressão, frequência cardíaca, temperatura, saturação e glicemia — medidos pelo paciente em casa.",
      "Blood pressure, heart rate, temperature, saturation and glucose — measured by the patient at home.",
      "Presión, frecuencia cardíaca, temperatura, saturación y glucemia — medidos por el paciente en casa.",
      "Tension, fréquence cardiaque, température, saturation et glycémie — mesurées par le patient chez lui.",
    ],
    patientCanAnswer: true,
    fields: [
      {
        key: "pas",
        label: ["Pressão sistólica", "Systolic BP", "Presión sistólica", "Pression systolique"],
        unit: "mmHg",
        min: 50,
        max: 260,
      },
      {
        key: "pad",
        label: ["Pressão diastólica", "Diastolic BP", "Presión diastólica", "Pression diastolique"],
        unit: "mmHg",
        min: 30,
        max: 160,
      },
      {
        key: "fc",
        label: ["Frequência cardíaca", "Heart rate", "Frecuencia cardíaca", "Fréquence cardiaque"],
        unit: "bpm",
        min: 25,
        max: 230,
      },
      {
        key: "fr",
        label: [
          "Frequência respiratória",
          "Respiratory rate",
          "Frecuencia respiratoria",
          "Fréquence respiratoire",
        ],
        unit: "irpm",
        min: 5,
        max: 60,
      },
      {
        key: "temp",
        label: ["Temperatura", "Temperature", "Temperatura", "Température"],
        unit: "°C",
        min: 33,
        max: 43,
        step: 0.1,
      },
      {
        key: "spo2",
        label: [
          "Saturação (SpO₂)",
          "Oxygen saturation (SpO₂)",
          "Saturación (SpO₂)",
          "Saturation (SpO₂)",
        ],
        unit: "%",
        min: 50,
        max: 100,
      },
      {
        key: "glicemia",
        label: ["Glicemia capilar", "Capillary glucose", "Glucemia capilar", "Glycémie capillaire"],
        unit: "mg/dL",
        min: 20,
        max: 600,
      },
      {
        key: "glicemia_momento",
        label: [
          "Momento da glicemia",
          "Glucose timing",
          "Momento de la glucemia",
          "Moment de la glycémie",
        ],
        options: [
          { value: "jejum", label: ["Em jejum", "Fasting", "En ayunas", "À jeun"] },
          {
            value: "pos",
            label: ["Após refeição", "After a meal", "Después de comer", "Après un repas"],
          },
          {
            value: "aleatoria",
            label: ["Outro horário", "Other time", "Otro momento", "Autre moment"],
          },
        ],
      },
    ],
    evaluate: (d) => {
      const pas = Number(d.pas) || 0;
      const pad = Number(d.pad) || 0;
      const spo2 = Number(d.spo2) || 0;
      const alerts: string[] = [];
      if (spo2 && spo2 < 92) alerts.push("SpO₂ < 92%");
      if (pas >= 180 || pad >= 110) alerts.push("PA ≥ 180/110");
      if (Number(d.temp) >= 39) alerts.push("T ≥ 39 °C");
      const alert: Names | undefined = alerts.length
        ? [
            `Atenção: ${alerts.join(", ")}`,
            `Attention: ${alerts.join(", ")}`,
            `Atención: ${alerts.join(", ")}`,
            `Attention : ${alerts.join(", ")}`,
          ]
        : undefined;
      if (!pas || !pad)
        return {
          score: null,
          severity: null,
          label: ["Registrado", "Recorded", "Registrado", "Enregistré"],
          tone: alerts.length ? "severe" : "neutral",
          alert,
        };
      // Faixas da Diretriz Brasileira de Hipertensão (2020).
      if (pas >= 180 || pad >= 110)
        return {
          score: pas,
          severity: "ha3",
          label: [
            "Hipertensão estágio 3",
            "Stage 3 hypertension",
            "Hipertensión estadio 3",
            "HTA grade 3",
          ],
          tone: "severe",
          alert,
        };
      if (pas >= 160 || pad >= 100)
        return {
          score: pas,
          severity: "ha2",
          label: [
            "Hipertensão estágio 2",
            "Stage 2 hypertension",
            "Hipertensión estadio 2",
            "HTA grade 2",
          ],
          tone: "severe",
          alert,
        };
      if (pas >= 140 || pad >= 90)
        return {
          score: pas,
          severity: "ha1",
          label: [
            "Hipertensão estágio 1",
            "Stage 1 hypertension",
            "Hipertensión estadio 1",
            "HTA grade 1",
          ],
          tone: "moderate",
          alert,
        };
      if (pas > 120 || pad > 80)
        return {
          score: pas,
          severity: "pre",
          label: ["Pré-hipertensão", "Prehypertension", "Prehipertensión", "Préhypertension"],
          tone: "mild",
          alert,
        };
      return {
        score: pas,
        severity: "normal",
        label: ["Pressão normal", "Normal blood pressure", "Presión normal", "Tension normale"],
        tone: alerts.length ? "severe" : "good",
        alert,
      };
    },
  },
  {
    id: "dor_eva",
    type: "fields",
    name: ["Dor (EVA)", "Pain (VAS)", "Dolor (EVA)", "Douleur (EVA)"],
    short: "EVA",
    about: [
      "Escala visual analógica de 0 (sem dor) a 10 (pior dor imaginável), com local e características.",
      "Visual analogue scale from 0 (no pain) to 10 (worst imaginable), with site and characteristics.",
      "Escala visual analógica de 0 (sin dolor) a 10 (peor dolor imaginable), con lugar y características.",
      "Échelle visuelle analogique de 0 (aucune douleur) à 10 (pire douleur imaginable), avec site et caractéristiques.",
    ],
    patientCanAnswer: true,
    fields: [
      {
        key: "intensidade",
        label: ["Intensidade (0–10)", "Intensity (0–10)", "Intensidad (0–10)", "Intensité (0–10)"],
        min: 0,
        max: 10,
        step: 1,
        slider: true,
      },
      {
        key: "local",
        label: ["Onde dói", "Where it hurts", "Dónde duele", "Où avez-vous mal"],
        text: true,
      },
      {
        key: "piora",
        label: [
          "O que piora / melhora",
          "What makes it worse / better",
          "Qué empeora / mejora",
          "Ce qui aggrave / soulage",
        ],
        text: true,
      },
    ],
    evaluate: (d) => {
      const v = Number(d.intensidade);
      if (!Number.isFinite(v))
        return {
          score: null,
          severity: null,
          label: ["Registrado", "Recorded", "Registrado", "Enregistré"],
          tone: "neutral",
        };
      if (v === 0)
        return {
          score: 0,
          severity: "sem_dor",
          label: ["Sem dor", "No pain", "Sin dolor", "Pas de douleur"],
          tone: "good",
        };
      if (v <= 3)
        return {
          score: v,
          severity: "leve",
          label: ["Dor leve", "Mild pain", "Dolor leve", "Douleur légère"],
          tone: "mild",
        };
      if (v <= 6)
        return {
          score: v,
          severity: "moderada",
          label: ["Dor moderada", "Moderate pain", "Dolor moderado", "Douleur modérée"],
          tone: "moderate",
        };
      return {
        score: v,
        severity: "intensa",
        label: ["Dor intensa", "Severe pain", "Dolor intenso", "Douleur intense"],
        tone: "severe",
      };
    },
  },
  {
    id: "phq9",
    type: "questionnaire",
    name: ["PHQ-9 · humor", "PHQ-9 · mood", "PHQ-9 · ánimo", "PHQ-9 · humeur"],
    short: "PHQ-9",
    about: [
      "Rastreio de sintomas depressivos nas últimas 2 semanas (0–27).",
      "Screening for depressive symptoms over the last 2 weeks (0–27).",
      "Tamizaje de síntomas depresivos en las últimas 2 semanas (0–27).",
      "Dépistage des symptômes dépressifs sur les 2 dernières semaines (0–27).",
    ],
    patientCanAnswer: true,
    intro: TWO_WEEKS,
    options: FREQ4,
    max: 27,
    questions: [
      [
        "Pouco interesse ou pouco prazer em fazer as coisas",
        "Little interest or pleasure in doing things",
        "Poco interés o placer en hacer cosas",
        "Peu d'intérêt ou de plaisir à faire les choses",
      ],
      [
        "Se sentir “para baixo”, deprimido(a) ou sem perspectiva",
        "Feeling down, depressed, or hopeless",
        "Sentirse decaído(a), deprimido(a) o sin esperanzas",
        "Être triste, déprimé(e) ou désespéré(e)",
      ],
      [
        "Dificuldade para pegar no sono ou permanecer dormindo, ou dormir mais do que de costume",
        "Trouble falling or staying asleep, or sleeping too much",
        "Dificultad para quedarse o permanecer dormido(a), o dormir demasiado",
        "Difficultés à s'endormir ou à rester endormi(e), ou dormir trop",
      ],
      [
        "Se sentir cansado(a) ou com pouca energia",
        "Feeling tired or having little energy",
        "Sentirse cansado(a) o con poca energía",
        "Se sentir fatigué(e) ou manquer d'énergie",
      ],
      [
        "Falta de apetite ou comendo demais",
        "Poor appetite or overeating",
        "Sin apetito o comer en exceso",
        "Avoir peu d'appétit ou manger trop",
      ],
      [
        "Se sentir mal consigo mesmo(a) — ou achar que é um fracasso ou que decepcionou sua família ou a si mesmo(a)",
        "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
        "Sentirse mal con usted mismo(a) — o que es un fracaso o que ha quedado mal con usted o su familia",
        "Avoir une mauvaise opinion de soi-même, ou le sentiment d'être nul(le) ou d'avoir déçu sa famille ou soi-même",
      ],
      [
        "Dificuldade para se concentrar nas coisas, como ler o jornal ou ver televisão",
        "Trouble concentrating on things, such as reading the newspaper or watching television",
        "Dificultad para concentrarse, como al leer el periódico o ver la televisión",
        "Du mal à se concentrer, par exemple pour lire le journal ou regarder la télévision",
      ],
      [
        "Lentidão para se movimentar ou falar a ponto de outras pessoas perceberem — ou o oposto, estar tão agitado(a) que fica se mexendo muito mais que o costume",
        "Moving or speaking so slowly that other people could have noticed — or the opposite, being so fidgety or restless that you've been moving around a lot more than usual",
        "Moverse o hablar tan lento que otras personas podrían notarlo — o lo contrario, estar tan inquieto(a) que se ha movido mucho más de lo normal",
        "Bouger ou parler si lentement que les autres auraient pu le remarquer — ou au contraire être si agité(e) que vous bougiez beaucoup plus que d'habitude",
      ],
      [
        "Pensar em se ferir de alguma maneira ou que seria melhor estar morto(a)",
        "Thoughts that you would be better off dead or of hurting yourself in some way",
        "Pensamientos de que estaría mejor muerto(a) o de lastimarse de alguna manera",
        "Penser qu'il vaudrait mieux mourir ou envisager de vous faire du mal",
      ],
    ],
    evaluate: (a) => {
      const score = sum(a);
      const alert: Names | undefined =
        (a[8] ?? 0) > 0
          ? [
              "Item 9 positivo: avalie o risco de autolesão/suicídio nesta consulta. Em crise: CVV 188 (24 h) ou SAMU 192.",
              "Item 9 positive: assess self-harm/suicide risk in this visit. In crisis: local emergency services.",
              "Ítem 9 positivo: evalúe el riesgo de autolesión/suicidio en esta consulta. En crisis: servicios de emergencia.",
              "Item 9 positif : évaluez le risque d'automutilation/suicide pendant cette consultation. En crise : services d'urgence.",
            ]
          : undefined;
      if (score >= 20)
        return {
          score,
          severity: "grave",
          label: ["Sintomas graves", "Severe", "Grave", "Sévère"],
          tone: "severe",
          alert,
        };
      if (score >= 15)
        return {
          score,
          severity: "moderadamente_grave",
          label: [
            "Moderadamente graves",
            "Moderately severe",
            "Moderadamente grave",
            "Modérément sévère",
          ],
          tone: "severe",
          alert,
        };
      if (score >= 10)
        return {
          score,
          severity: "moderada",
          label: ["Sintomas moderados", "Moderate", "Moderado", "Modéré"],
          tone: "moderate",
          alert,
        };
      if (score >= 5)
        return {
          score,
          severity: "leve",
          label: ["Sintomas leves", "Mild", "Leve", "Léger"],
          tone: "mild",
          alert,
        };
      return {
        score,
        severity: "minima",
        label: ["Mínimos ou ausentes", "Minimal", "Mínimo", "Minimal"],
        tone: "good",
        alert,
      };
    },
  },
  {
    id: "gad7",
    type: "questionnaire",
    name: ["GAD-7 · ansiedade", "GAD-7 · anxiety", "GAD-7 · ansiedad", "GAD-7 · anxiété"],
    short: "GAD-7",
    about: [
      "Rastreio de sintomas de ansiedade nas últimas 2 semanas (0–21).",
      "Screening for anxiety symptoms over the last 2 weeks (0–21).",
      "Tamizaje de síntomas de ansiedad en las últimas 2 semanas (0–21).",
      "Dépistage des symptômes anxieux sur les 2 dernières semaines (0–21).",
    ],
    patientCanAnswer: true,
    intro: TWO_WEEKS,
    options: FREQ4,
    max: 21,
    questions: [
      [
        "Sentir-se nervoso(a), ansioso(a) ou muito tenso(a)",
        "Feeling nervous, anxious, or on edge",
        "Sentirse nervioso(a), ansioso(a) o con los nervios de punta",
        "Un sentiment de nervosité, d'anxiété ou de tension",
      ],
      [
        "Não ser capaz de impedir ou controlar as preocupações",
        "Not being able to stop or control worrying",
        "No poder parar o controlar la preocupación",
        "Ne pas réussir à arrêter de s'inquiéter ou à contrôler ses inquiétudes",
      ],
      [
        "Preocupar-se muito com diversas coisas",
        "Worrying too much about different things",
        "Preocuparse demasiado por distintas cosas",
        "S'inquiéter excessivement à propos de différentes choses",
      ],
      [
        "Dificuldade para relaxar",
        "Trouble relaxing",
        "Dificultad para relajarse",
        "Des difficultés à se détendre",
      ],
      [
        "Ficar tão agitado(a) que se torna difícil permanecer sentado(a)",
        "Being so restless that it is hard to sit still",
        "Estar tan inquieto(a) que es difícil quedarse quieto(a)",
        "Une agitation telle qu'il est difficile de rester tranquille",
      ],
      [
        "Ficar facilmente aborrecido(a) ou irritado(a)",
        "Becoming easily annoyed or irritable",
        "Molestarse o irritarse fácilmente",
        "Être facilement contrarié(e) ou irritable",
      ],
      [
        "Sentir medo como se algo horrível fosse acontecer",
        "Feeling afraid, as if something awful might happen",
        "Sentir miedo de que algo terrible pueda pasar",
        "Avoir peur que quelque chose de terrible arrive",
      ],
    ],
    evaluate: (a) => {
      const score = sum(a);
      if (score >= 15)
        return {
          score,
          severity: "grave",
          label: ["Ansiedade grave", "Severe anxiety", "Ansiedad grave", "Anxiété sévère"],
          tone: "severe",
        };
      if (score >= 10)
        return {
          score,
          severity: "moderada",
          label: ["Ansiedade moderada", "Moderate anxiety", "Ansiedad moderada", "Anxiété modérée"],
          tone: "moderate",
        };
      if (score >= 5)
        return {
          score,
          severity: "leve",
          label: ["Ansiedade leve", "Mild anxiety", "Ansiedad leve", "Anxiété légère"],
          tone: "mild",
        };
      return {
        score,
        severity: "minima",
        label: ["Mínima", "Minimal", "Mínima", "Minimale"],
        tone: "good",
      };
    },
  },
  {
    id: "who5",
    type: "questionnaire",
    name: ["WHO-5 · bem-estar", "WHO-5 · well-being", "WHO-5 · bienestar", "WHO-5 · bien-être"],
    short: "WHO-5",
    about: [
      "Índice de bem-estar da OMS nas últimas 2 semanas (0–100%). Útil para qualquer profissional.",
      "WHO well-being index over the last 2 weeks (0–100%). Useful for any professional.",
      "Índice de bienestar de la OMS en las últimas 2 semanas (0–100%). Útil para cualquier profesional.",
      "Indice de bien-être de l'OMS sur les 2 dernières semaines (0–100 %). Utile pour tout professionnel.",
    ],
    patientCanAnswer: true,
    intro: [
      "Nas últimas 2 semanas…",
      "Over the last 2 weeks…",
      "En las últimas 2 semanas…",
      "Au cours des 2 dernières semaines…",
    ],
    options: [
      { label: ["Em nenhum momento", "At no time", "Nunca", "Jamais"], value: 0 },
      {
        label: ["Algumas vezes", "Some of the time", "Algunas veces", "De temps en temps"],
        value: 1,
      },
      {
        label: [
          "Menos da metade do tempo",
          "Less than half of the time",
          "Menos de la mitad del tiempo",
          "Moins de la moitié du temps",
        ],
        value: 2,
      },
      {
        label: [
          "Mais da metade do tempo",
          "More than half of the time",
          "Más de la mitad del tiempo",
          "Plus de la moitié du temps",
        ],
        value: 3,
      },
      {
        label: [
          "A maior parte do tempo",
          "Most of the time",
          "La mayor parte del tiempo",
          "La plupart du temps",
        ],
        value: 4,
      },
      { label: ["O tempo todo", "All of the time", "Todo el tiempo", "Tout le temps"], value: 5 },
    ],
    max: 100,
    questions: [
      [
        "Eu me senti alegre e de bom humor",
        "I have felt cheerful and in good spirits",
        "Me he sentido alegre y de buen humor",
        "Je me suis senti(e) bien et de bonne humeur",
      ],
      [
        "Eu me senti calmo(a) e tranquilo(a)",
        "I have felt calm and relaxed",
        "Me he sentido tranquilo(a) y relajado(a)",
        "Je me suis senti(e) calme et tranquille",
      ],
      [
        "Eu me senti ativo(a) e com energia",
        "I have felt active and vigorous",
        "Me he sentido activo(a) y enérgico(a)",
        "Je me suis senti(e) plein(e) d'énergie",
      ],
      [
        "Acordei me sentindo descansado(a) e revigorado(a)",
        "I woke up feeling fresh and rested",
        "Me he despertado fresco(a) y descansado(a)",
        "Je me suis réveillé(e) frais/fraîche et dispos(e)",
      ],
      [
        "Meu dia a dia foi cheio de coisas que me interessam",
        "My daily life has been filled with things that interest me",
        "Mi vida diaria ha estado llena de cosas que me interesan",
        "Ma vie quotidienne a été remplie de choses intéressantes",
      ],
    ],
    evaluate: (a) => {
      const score = sum(a) * 4;
      if (score <= 28)
        return {
          score,
          severity: "muito_baixo",
          label: [
            "Bem-estar muito baixo",
            "Very low well-being",
            "Bienestar muy bajo",
            "Bien-être très bas",
          ],
          tone: "severe",
          alert: [
            "Sugere rastrear depressão (PHQ-9).",
            "Consider screening for depression (PHQ-9).",
            "Sugiere tamizar depresión (PHQ-9).",
            "Envisager un dépistage de la dépression (PHQ-9).",
          ],
        };
      if (score <= 50)
        return {
          score,
          severity: "baixo",
          label: ["Bem-estar baixo", "Low well-being", "Bienestar bajo", "Bien-être bas"],
          tone: "moderate",
        };
      return {
        score,
        severity: "bom",
        label: ["Bom bem-estar", "Good well-being", "Buen bienestar", "Bon bien-être"],
        tone: "good",
      };
    },
  },
  {
    id: "parq",
    type: "questionnaire",
    name: [
      "PAR-Q · prontidão para atividade física",
      "PAR-Q · activity readiness",
      "PAR-Q · aptitud para actividad física",
      "Q-AAP · aptitude à l'activité physique",
    ],
    short: "PAR-Q",
    about: [
      "7 perguntas de sim/não antes de iniciar ou intensificar exercícios.",
      "7 yes/no questions before starting or intensifying exercise.",
      "7 preguntas de sí/no antes de iniciar o intensificar ejercicio.",
      "7 questions oui/non avant de commencer ou d'intensifier l'exercice.",
    ],
    patientCanAnswer: true,
    intro: [
      "Responda com sinceridade:",
      "Please answer honestly:",
      "Responda con sinceridad:",
      "Répondez honnêtement :",
    ],
    options: [
      { label: ["Não", "No", "No", "Non"], value: 0 },
      { label: ["Sim", "Yes", "Sí", "Oui"], value: 1 },
    ],
    max: 7,
    questions: [
      [
        "Algum médico já disse que você tem problema no coração e que só deve fazer atividade física recomendada por um médico?",
        "Has a doctor ever said you have a heart condition and should only do physical activity recommended by a doctor?",
        "¿Algún médico le ha dicho que tiene un problema del corazón y que solo debe hacer actividad física recomendada por un médico?",
        "Un médecin vous a-t-il déjà dit que vous aviez un problème cardiaque et que vous ne deviez faire que l'activité physique recommandée par un médecin ?",
      ],
      [
        "Você sente dor no peito quando faz atividade física?",
        "Do you feel pain in your chest when you do physical activity?",
        "¿Siente dolor en el pecho cuando hace actividad física?",
        "Ressentez-vous une douleur à la poitrine pendant l'activité physique ?",
      ],
      [
        "No último mês, você sentiu dor no peito quando NÃO estava fazendo atividade física?",
        "In the past month, have you had chest pain when you were NOT doing physical activity?",
        "En el último mes, ¿ha tenido dolor en el pecho cuando NO estaba haciendo actividad física?",
        "Au cours du dernier mois, avez-vous eu mal à la poitrine sans faire d'activité physique ?",
      ],
      [
        "Você perde o equilíbrio por tontura ou já perdeu a consciência?",
        "Do you lose your balance because of dizziness or do you ever lose consciousness?",
        "¿Pierde el equilibrio por mareos o ha perdido el conocimiento?",
        "Perdez-vous l'équilibre à cause d'étourdissements ou avez-vous déjà perdu connaissance ?",
      ],
      [
        "Você tem algum problema ósseo ou articular que pode piorar com a atividade física?",
        "Do you have a bone or joint problem that could be made worse by physical activity?",
        "¿Tiene algún problema de huesos o articulaciones que podría empeorar con la actividad física?",
        "Avez-vous un problème osseux ou articulaire qui pourrait s'aggraver avec l'activité physique ?",
      ],
      [
        "Algum médico receita atualmente remédio para pressão ou para o coração?",
        "Is a doctor currently prescribing drugs for your blood pressure or heart condition?",
        "¿Algún médico le receta actualmente medicamentos para la presión o el corazón?",
        "Un médecin vous prescrit-il actuellement des médicaments pour la tension ou le cœur ?",
      ],
      [
        "Você sabe de alguma outra razão pela qual não deveria fazer atividade física?",
        "Do you know of any other reason why you should not do physical activity?",
        "¿Conoce alguna otra razón por la que no debería hacer actividad física?",
        "Connaissez-vous une autre raison de ne pas faire d'activité physique ?",
      ],
    ],
    evaluate: (a) => {
      const score = sum(a);
      if (score > 0)
        return {
          score,
          severity: "liberacao_medica",
          label: [
            "Pedir liberação médica",
            "Medical clearance advised",
            "Pedir autorización médica",
            "Avis médical conseillé",
          ],
          tone: "moderate",
          alert: [
            "Houve “sim”: oriente avaliação médica antes de aumentar a intensidade dos exercícios.",
            "At least one “yes”: advise a medical check before increasing exercise intensity.",
            "Hubo un “sí”: indique evaluación médica antes de aumentar la intensidad.",
            "Au moins un « oui » : conseillez un avis médical avant d'intensifier l'exercice.",
          ],
        };
      return {
        score,
        severity: "apto",
        label: ["Apto para começar", "Ready to start", "Apto para empezar", "Apte à commencer"],
        tone: "good",
      };
    },
  },
  {
    id: "teste_funcional",
    type: "fields",
    name: ["Teste funcional", "Functional test", "Prueba funcional", "Test fonctionnel"],
    short: "TF",
    about: [
      "Resultado de testes feitos pela câmera, com o cronômetro da consulta.",
      "Results of tests done over video, using the visit stopwatch.",
      "Resultado de pruebas hechas por la cámara, con el cronómetro de la consulta.",
      "Résultats de tests réalisés en vidéo, avec le chronomètre de la consultation.",
    ],
    patientCanAnswer: false,
    fields: [
      {
        key: "teste",
        label: ["Teste", "Test", "Prueba", "Test"],
        options: [
          {
            value: "sentar_levantar_30s",
            label: [
              "Sentar e levantar em 30 s (repetições)",
              "30-s chair stand (reps)",
              "Sentarse y levantarse en 30 s (rep.)",
              "Lever de chaise 30 s (rép.)",
            ],
          },
          {
            value: "tug",
            label: [
              "Timed Up and Go (segundos)",
              "Timed Up and Go (seconds)",
              "Timed Up and Go (segundos)",
              "Timed Up and Go (secondes)",
            ],
          },
          {
            value: "flexoes",
            label: [
              "Flexões de braço (repetições)",
              "Push-ups (reps)",
              "Flexiones (repeticiones)",
              "Pompes (répétitions)",
            ],
          },
          {
            value: "prancha",
            label: [
              "Prancha (segundos)",
              "Plank (seconds)",
              "Plancha (segundos)",
              "Gainage (secondes)",
            ],
          },
          {
            value: "abdominal_1min",
            label: [
              "Abdominais em 1 min",
              "Sit-ups in 1 min",
              "Abdominales en 1 min",
              "Abdominaux en 1 min",
            ],
          },
          {
            value: "equilibrio_unipodal",
            label: [
              "Equilíbrio em um pé (segundos)",
              "Single-leg stance (seconds)",
              "Equilibrio en un pie (segundos)",
              "Appui unipodal (secondes)",
            ],
          },
          { value: "outro", label: ["Outro", "Other", "Otro", "Autre"] },
        ],
      },
      {
        key: "resultado",
        label: ["Resultado", "Result", "Resultado", "Résultat"],
        min: 0,
        max: 100000,
        step: 0.1,
      },
      {
        key: "observacoes",
        label: [
          "Observações (execução, compensações, dor)",
          "Notes (form, compensations, pain)",
          "Observaciones (ejecución, compensaciones, dolor)",
          "Observations (exécution, compensations, douleur)",
        ],
        text: true,
      },
    ],
    evaluate: (d) => ({
      score:
        Number.isFinite(Number(d.resultado)) && d.resultado !== null && d.resultado !== ""
          ? Number(d.resultado)
          : null,
      severity: null,
      label: ["Registrado", "Recorded", "Registrado", "Enregistré"],
      tone: "neutral",
    }),
  },
];

export const instrument = (id: string) => INSTRUMENTS.find((i) => i.id === id);

/** Resultado de um questionário a partir das respostas. */
export function evaluate(
  inst: Instrument,
  payload: number[] | Record<string, number | string | null>,
): Outcome {
  return inst.type === "questionnaire"
    ? inst.evaluate(payload as number[])
    : inst.evaluate(payload as Record<string, number | string | null>);
}

export const TONE_CLASS: Record<Tone, string> = {
  good: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  mild: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  moderate: "bg-amber-500/20 text-amber-800 dark:text-amber-300",
  severe: "bg-red-500/15 text-red-700 dark:text-red-300",
  neutral: "bg-secondary text-foreground",
};

/** Tom guardado junto do resultado (para pintar o histórico sem recalcular). */
export function toneOf(a: Assessment): Tone {
  const t = (a.data as { tone?: Tone } | null)?.tone;
  return t ?? "neutral";
}

// ─── Banco ───

const fail = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

export async function listAssessments(patientId: string): Promise<Assessment[]> {
  const { data, error } = await supabase
    .from("clinical_assessments")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(200);
  fail(error);
  return data ?? [];
}

export async function saveAssessment(input: {
  patientId: string;
  professionalId: string;
  appointmentId?: string | null;
  instrumentId: string;
  payload: number[] | Record<string, number | string | null>;
  answeredByPatient?: boolean;
  shared?: boolean;
  notes?: string;
}): Promise<Assessment> {
  const inst = instrument(input.instrumentId);
  if (!inst) throw new Error("Instrumento desconhecido.");
  const out = evaluate(inst, input.payload);
  const data = {
    ...(Array.isArray(input.payload) ? { answers: input.payload } : { values: input.payload }),
    label: out.label,
    tone: out.tone,
    alert: out.alert ?? null,
    notes: input.notes?.trim() || null,
  };
  const { data: row, error } = await supabase
    .from("clinical_assessments")
    .insert({
      patient_id: input.patientId,
      professional_id: input.professionalId,
      appointment_id: input.appointmentId ?? null,
      kind: inst.id,
      data: data as unknown as Json,
      score: out.score,
      severity: out.severity,
      answered_by_patient: !!input.answeredByPatient,
      shared_with_patient: input.shared ?? true,
    })
    .select("*")
    .single();
  fail(error);
  return row as Assessment;
}

export async function deleteAssessment(id: string) {
  const { error } = await supabase.from("clinical_assessments").delete().eq("id", id);
  fail(error);
}

export const assessmentsKey = (patientId: string) =>
  ["clinical", "assessments", patientId] as const;

export function useAssessments(patientId: string) {
  return useQuery({
    queryKey: assessmentsKey(patientId),
    queryFn: () => listAssessments(patientId),
    enabled: !!patientId,
  });
}

export function useDeleteAssessment(patientId: string) {
  return useClinicalMutation((id: string) => deleteAssessment(id), {
    invalidate: [assessmentsKey(patientId)],
  });
}

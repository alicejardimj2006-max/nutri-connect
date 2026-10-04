// O que cada profissão costuma coletar e usar numa consulta. As ferramentas da chamada, a anamnese
// complementar e os modelos de evolução mudam conforme a profissão de quem atende — mas todo
// profissional pode abrir qualquer ferramenta.
import type { Names } from "@/lib/appearance-data";

export type ProfessionKey =
  | "nutricao"
  | "medicina"
  | "psicologia"
  | "educacao_fisica"
  | "fisioterapia"
  | "enfermagem"
  | "outra";

/** Converte o nome da profissão cadastrado ("Nutricionista", "Médico(a)"…) numa chave. */
export function professionKey(label: string | null | undefined): ProfessionKey {
  const s = (label ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (s.startsWith("nutri")) return "nutricao";
  if (s.startsWith("medic")) return "medicina";
  if (s.startsWith("psic")) return "psicologia";
  if (s.includes("educador") || s.includes("fisico") || s.includes("personal"))
    return "educacao_fisica";
  if (s.startsWith("fisio")) return "fisioterapia";
  if (s.startsWith("enferm")) return "enfermagem";
  return "outra";
}

export type ToolId =
  | "paciente"
  | "anamnese"
  | "avaliacoes"
  | "medidas"
  | "evolucao"
  | "cuidados"
  | "metas"
  | "documentos"
  | "retorno"
  | "cronometro";

export const TOOL_ORDER: Record<ProfessionKey, ToolId[]> = {
  nutricao: [
    "paciente",
    "anamnese",
    "medidas",
    "evolucao",
    "metas",
    "cuidados",
    "documentos",
    "avaliacoes",
    "retorno",
    "cronometro",
  ],
  medicina: [
    "paciente",
    "anamnese",
    "avaliacoes",
    "evolucao",
    "cuidados",
    "documentos",
    "medidas",
    "metas",
    "retorno",
    "cronometro",
  ],
  psicologia: [
    "paciente",
    "anamnese",
    "avaliacoes",
    "evolucao",
    "cuidados",
    "metas",
    "documentos",
    "retorno",
    "medidas",
    "cronometro",
  ],
  educacao_fisica: [
    "paciente",
    "anamnese",
    "avaliacoes",
    "medidas",
    "cuidados",
    "cronometro",
    "metas",
    "evolucao",
    "documentos",
    "retorno",
  ],
  fisioterapia: [
    "paciente",
    "anamnese",
    "avaliacoes",
    "cronometro",
    "cuidados",
    "evolucao",
    "documentos",
    "medidas",
    "metas",
    "retorno",
  ],
  enfermagem: [
    "paciente",
    "avaliacoes",
    "anamnese",
    "cuidados",
    "evolucao",
    "documentos",
    "medidas",
    "metas",
    "retorno",
    "cronometro",
  ],
  outra: [
    "paciente",
    "anamnese",
    "avaliacoes",
    "evolucao",
    "cuidados",
    "metas",
    "documentos",
    "medidas",
    "retorno",
    "cronometro",
  ],
};

/** Instrumentos de avaliação sugeridos primeiro para cada profissão (ver assessments.ts). */
export const SUGGESTED_INSTRUMENTS: Record<ProfessionKey, string[]> = {
  nutricao: ["sinais_vitais", "who5", "dor_eva"],
  medicina: ["sinais_vitais", "dor_eva", "phq9", "gad7", "who5"],
  psicologia: ["phq9", "gad7", "who5"],
  educacao_fisica: ["parq", "teste_funcional", "sinais_vitais", "dor_eva"],
  fisioterapia: ["dor_eva", "teste_funcional", "sinais_vitais"],
  enfermagem: ["sinais_vitais", "dor_eva", "who5"],
  outra: ["sinais_vitais", "dor_eva", "who5", "phq9", "gad7", "parq", "teste_funcional"],
};

export type CarePlanKind =
  "treino" | "exercicios" | "tarefas" | "cuidados" | "orientacoes" | "medicacoes";

export const CARE_PLAN_KINDS: Record<
  CarePlanKind,
  { label: Names; item: Names; details: Names; frequency: Names }
> = {
  treino: {
    label: ["Treino", "Workout", "Entrenamiento", "Entraînement"],
    item: ["Exercício", "Exercise", "Ejercicio", "Exercice"],
    details: [
      "Séries × repetições / carga",
      "Sets × reps / load",
      "Series × repeticiones / carga",
      "Séries × répétitions / charge",
    ],
    frequency: ["Dias da semana", "Days of the week", "Días de la semana", "Jours de la semaine"],
  },
  exercicios: {
    label: ["Exercícios em casa", "Home exercises", "Ejercicios en casa", "Exercices à domicile"],
    item: ["Exercício", "Exercise", "Ejercicio", "Exercice"],
    details: [
      "Repetições / tempo / cuidados",
      "Reps / time / precautions",
      "Repeticiones / tiempo / cuidados",
      "Répétitions / durée / précautions",
    ],
    frequency: ["Quantas vezes", "How often", "Con qué frecuencia", "Fréquence"],
  },
  tarefas: {
    label: [
      "Tarefas entre sessões",
      "Between-session tasks",
      "Tareas entre sesiones",
      "Tâches entre les séances",
    ],
    item: ["Tarefa", "Task", "Tarea", "Tâche"],
    details: ["Como fazer", "How to do it", "Cómo hacerla", "Comment faire"],
    frequency: ["Quando", "When", "Cuándo", "Quand"],
  },
  cuidados: {
    label: ["Cuidados", "Care instructions", "Cuidados", "Soins"],
    item: ["Cuidado", "Care", "Cuidado", "Soin"],
    details: ["Como fazer", "How to do it", "Cómo hacerlo", "Comment faire"],
    frequency: ["Quando", "When", "Cuándo", "Quand"],
  },
  orientacoes: {
    label: ["Orientações", "Guidance", "Indicaciones", "Conseils"],
    item: ["Orientação", "Guidance", "Indicación", "Conseil"],
    details: ["Detalhes", "Details", "Detalles", "Détails"],
    frequency: ["Quando", "When", "Cuándo", "Quand"],
  },
  medicacoes: {
    label: [
      "Medicações em uso",
      "Current medications",
      "Medicaciones en uso",
      "Médicaments en cours",
    ],
    item: ["Medicamento", "Medication", "Medicamento", "Médicament"],
    details: ["Dose", "Dose", "Dosis", "Dose"],
    frequency: ["Horários", "Schedule", "Horarios", "Horaires"],
  },
};

export const SUGGESTED_CARE_KINDS: Record<ProfessionKey, CarePlanKind[]> = {
  nutricao: ["orientacoes", "tarefas", "medicacoes"],
  medicina: ["medicacoes", "orientacoes", "cuidados"],
  psicologia: ["tarefas", "orientacoes"],
  educacao_fisica: ["treino", "orientacoes"],
  fisioterapia: ["exercicios", "cuidados", "orientacoes"],
  enfermagem: ["cuidados", "medicacoes", "orientacoes"],
  outra: ["orientacoes", "tarefas", "exercicios", "cuidados", "treino", "medicacoes"],
};

// ─── Anamnese complementar por profissão (salva em anamneses.data.especifica) ───

export interface ExtraField {
  key: string;
  label: Names;
  rows?: number;
}

export const EXTRA_ANAMNESIS: Record<ProfessionKey, { title: Names; fields: ExtraField[] } | null> =
  {
    nutricao: null, // a anamnese padrão já é alimentar
    medicina: {
      title: ["Anamnese médica", "Medical history", "Anamnesis médica", "Anamnèse médicale"],
      fields: [
        {
          key: "hda",
          label: [
            "História da doença atual",
            "History of present illness",
            "Historia de la enfermedad actual",
            "Histoire de la maladie",
          ],
          rows: 3,
        },
        {
          key: "revisao_sistemas",
          label: [
            "Revisão de sistemas",
            "Review of systems",
            "Revisión por sistemas",
            "Revue des systèmes",
          ],
          rows: 3,
        },
        {
          key: "exame_fisico",
          label: [
            "Exame físico (o que foi possível observar)",
            "Physical exam (what could be observed)",
            "Examen físico (lo observable)",
            "Examen physique (ce qui a pu être observé)",
          ],
          rows: 2,
        },
        {
          key: "hipoteses",
          label: [
            "Hipóteses diagnósticas",
            "Diagnostic hypotheses",
            "Hipótesis diagnósticas",
            "Hypothèses diagnostiques",
          ],
          rows: 2,
        },
        {
          key: "exames_previos",
          label: [
            "Exames anteriores relevantes",
            "Relevant previous tests",
            "Exámenes previos relevantes",
            "Examens antérieurs pertinents",
          ],
          rows: 2,
        },
      ],
    },
    psicologia: {
      title: [
        "Anamnese psicológica",
        "Psychological history",
        "Anamnesis psicológica",
        "Anamnèse psychologique",
      ],
      fields: [
        {
          key: "demanda",
          label: [
            "Demanda / motivo da procura",
            "Reason for seeking help",
            "Demanda / motivo de consulta",
            "Demande / motif de consultation",
          ],
          rows: 3,
        },
        {
          key: "historico",
          label: [
            "Histórico (tratamentos anteriores, medicação psiquiátrica)",
            "History (previous treatment, psychiatric medication)",
            "Historial (tratamientos previos, medicación psiquiátrica)",
            "Antécédents (suivis précédents, traitement psychiatrique)",
          ],
          rows: 2,
        },
        {
          key: "rede_apoio",
          label: [
            "Rede de apoio e relações",
            "Support network and relationships",
            "Red de apoyo y relaciones",
            "Réseau de soutien et relations",
          ],
          rows: 2,
        },
        {
          key: "rotina",
          label: [
            "Rotina, trabalho e estudo",
            "Routine, work and study",
            "Rutina, trabajo y estudio",
            "Routine, travail et études",
          ],
          rows: 2,
        },
        {
          key: "risco",
          label: [
            "Avaliação de risco (ideação, autolesão, uso de substâncias)",
            "Risk assessment (ideation, self-harm, substance use)",
            "Evaluación de riesgo (ideación, autolesión, sustancias)",
            "Évaluation du risque (idéation, automutilation, substances)",
          ],
          rows: 2,
        },
      ],
    },
    educacao_fisica: {
      title: [
        "Avaliação para o treino",
        "Training assessment",
        "Evaluación para el entrenamiento",
        "Évaluation pour l'entraînement",
      ],
      fields: [
        {
          key: "historico_treino",
          label: [
            "Histórico de treino e modalidades",
            "Training history and sports",
            "Historial de entrenamiento y deportes",
            "Historique d'entraînement et sports",
          ],
          rows: 2,
        },
        {
          key: "objetivo_treino",
          label: [
            "Objetivo do treino",
            "Training goal",
            "Objetivo del entrenamiento",
            "Objectif d'entraînement",
          ],
          rows: 2,
        },
        {
          key: "lesoes",
          label: [
            "Lesões, dores e limitações",
            "Injuries, pain and limitations",
            "Lesiones, dolores y limitaciones",
            "Blessures, douleurs et limites",
          ],
          rows: 2,
        },
        {
          key: "disponibilidade",
          label: [
            "Disponibilidade (dias, horários, local, equipamentos)",
            "Availability (days, times, place, equipment)",
            "Disponibilidad (días, horarios, lugar, equipos)",
            "Disponibilité (jours, horaires, lieu, matériel)",
          ],
          rows: 2,
        },
      ],
    },
    fisioterapia: {
      title: [
        "Avaliação fisioterapêutica",
        "Physiotherapy assessment",
        "Evaluación fisioterapéutica",
        "Bilan de kinésithérapie",
      ],
      fields: [
        {
          key: "queixa_funcional",
          label: [
            "Queixa e limitação funcional",
            "Complaint and functional limitation",
            "Queja y limitación funcional",
            "Plainte et limitation fonctionnelle",
          ],
          rows: 2,
        },
        {
          key: "mecanismo",
          label: [
            "Mecanismo da lesão / início dos sintomas",
            "Injury mechanism / symptom onset",
            "Mecanismo de la lesión / inicio",
            "Mécanisme de la blessure / début",
          ],
          rows: 2,
        },
        {
          key: "dor",
          label: [
            "Dor: local, irradiação, piora e melhora",
            "Pain: site, radiation, aggravating and easing",
            "Dolor: lugar, irradiación, empeora y mejora",
            "Douleur : site, irradiation, aggravation et soulagement",
          ],
          rows: 2,
        },
        {
          key: "observacao",
          label: [
            "Observação postural e de movimento",
            "Postural and movement observation",
            "Observación postural y del movimiento",
            "Observation posturale et du mouvement",
          ],
          rows: 2,
        },
        {
          key: "diagnostico_funcional",
          label: [
            "Diagnóstico cinético-funcional",
            "Functional diagnosis",
            "Diagnóstico cinético-funcional",
            "Diagnostic kinésithérapique",
          ],
          rows: 2,
        },
      ],
    },
    enfermagem: {
      title: [
        "Histórico de enfermagem",
        "Nursing history",
        "Historia de enfermería",
        "Recueil infirmier",
      ],
      fields: [
        {
          key: "necessidades",
          label: [
            "Necessidades e queixas",
            "Needs and complaints",
            "Necesidades y quejas",
            "Besoins et plaintes",
          ],
          rows: 2,
        },
        {
          key: "autocuidado",
          label: [
            "Autocuidado e autonomia",
            "Self-care and autonomy",
            "Autocuidado y autonomía",
            "Autosoins et autonomie",
          ],
          rows: 2,
        },
        {
          key: "pele_feridas",
          label: [
            "Pele, feridas e curativos",
            "Skin, wounds and dressings",
            "Piel, heridas y curaciones",
            "Peau, plaies et pansements",
          ],
          rows: 2,
        },
        {
          key: "diagnosticos",
          label: [
            "Diagnósticos de enfermagem",
            "Nursing diagnoses",
            "Diagnósticos de enfermería",
            "Diagnostics infirmiers",
          ],
          rows: 2,
        },
      ],
    },
    outra: null,
  };

// ─── Modelos de evolução (preenchem os campos SOAP como ponto de partida) ───

export const EVOLUTION_TEMPLATE: Record<
  ProfessionKey,
  { subjective: string; objective: string; assessment: string; plan: string }
> = {
  nutricao: {
    subjective: "Adesão ao plano: \nFome/saciedade: \nIntestino e sono: ",
    objective: "Peso/medidas relatadas: \nRecordatório alimentar: ",
    assessment: "",
    plan: "Ajustes no plano: \nMetas até o retorno: ",
  },
  medicina: {
    subjective: "Queixa principal: \nHDA: \nMedicações em uso: ",
    objective:
      "Sinais vitais (aferidos pelo paciente): \nExame físico observável: \nExames trazidos: ",
    assessment: "Hipóteses diagnósticas: ",
    plan: "Conduta: \nExames solicitados: \nOrientações e sinais de alerta: \nRetorno: ",
  },
  psicologia: {
    subjective: "Temas trazidos na sessão: \nHumor e afeto relatados: ",
    objective: "Observações do comportamento: \nEscalas aplicadas: ",
    assessment: "Avaliação de risco: \nHipótese / compreensão do caso: ",
    plan: "Intervenções realizadas: \nTarefa entre sessões: \nPróxima sessão: ",
  },
  educacao_fisica: {
    subjective: "Como foi a semana de treinos: \nDores/desconfortos: \nPercepção de esforço: ",
    objective: "Testes realizados: \nExecução observada: ",
    assessment: "",
    plan: "Ajustes no treino: \nPróxima reavaliação: ",
  },
  fisioterapia: {
    subjective: "Dor (EVA) e evolução desde a última sessão: \nFunção no dia a dia: ",
    objective: "Testes e amplitude observados: \nExecução dos exercícios: ",
    assessment: "Resposta ao tratamento: ",
    plan: "Exercícios ajustados: \nOrientações: \nPróxima sessão: ",
  },
  enfermagem: {
    subjective: "Queixas: \nAdesão aos cuidados: ",
    objective: "Sinais vitais: \nAspecto da pele/ferida (imagem): ",
    assessment: "Diagnósticos de enfermagem: ",
    plan: "Cuidados prescritos: \nEncaminhamentos: \nRetorno: ",
  },
  outra: { subjective: "", objective: "", assessment: "", plan: "" },
};

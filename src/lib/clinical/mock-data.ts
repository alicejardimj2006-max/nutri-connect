const now = new Date();
const todayStr = now.toISOString().split("T")[0];
const yesterdayStr = new Date(now.getTime() - 86400000).toISOString().split("T")[0];

export const MOCK_MEAL_PLAN: any = {
  id: "mock-plan-1",
  patient_id: "mock-patient",
  professional_id: "mock-pro",
  title: "Plano de Hipertrofia (Exemplo Admin)",
  status: "ativo",
  target_kcal: 2500,
  created_at: now.toISOString(),
  published_at: now.toISOString(),
  meals: [
    {
      id: "meal-1",
      plan_id: "mock-plan-1",
      name: "Café da manhã",
      time_of_day: "08:00",
      position: 0,
      items: [
        {
          id: "item-1",
          meal_id: "meal-1",
          food_id: 1,
          food_name: "Ovo de galinha, inteiro, cozido",
          quantity_g: 100,
          household_measure: "2 unidades médias",
          kcal: 155,
          protein_g: 13,
          carbs_g: 1.1,
          fat_g: 11,
          position: 0,
          substitute_of: null,
          notes: "Temperar com sal e orégano.",
        },
        {
          id: "item-2",
          meal_id: "meal-1",
          food_id: 2,
          food_name: "Pão de forma, integral",
          quantity_g: 50,
          household_measure: "2 fatias",
          kcal: 120,
          protein_g: 4.5,
          carbs_g: 22,
          fat_g: 1.5,
          position: 1,
          substitute_of: null,
          notes: null,
        },
      ],
    },
    {
      id: "meal-2",
      plan_id: "mock-plan-1",
      name: "Almoço",
      time_of_day: "12:30",
      position: 1,
      items: [
        {
          id: "item-3",
          meal_id: "meal-2",
          food_id: 3,
          food_name: "Arroz, tipo 1, cozido",
          quantity_g: 150,
          household_measure: "1 escumadeira cheia",
          kcal: 195,
          protein_g: 3.7,
          carbs_g: 42,
          fat_g: 0.3,
          position: 0,
          substitute_of: null,
          notes: null,
        },
        {
          id: "item-4",
          meal_id: "meal-2",
          food_id: 4,
          food_name: "Feijão, carioca, cozido",
          quantity_g: 100,
          household_measure: "1 concha média",
          kcal: 76,
          protein_g: 4.8,
          carbs_g: 13.6,
          fat_g: 0.5,
          position: 1,
          substitute_of: null,
          notes: null,
        },
        {
          id: "item-5",
          meal_id: "meal-2",
          food_id: 5,
          food_name: "Frango, peito, sem pele, grelhado",
          quantity_g: 120,
          household_measure: "1 filé grande",
          kcal: 190,
          protein_g: 38,
          carbs_g: 0,
          fat_g: 3,
          position: 2,
          substitute_of: null,
          notes: "Grelhar com um fio de azeite.",
        },
      ],
    },
    {
      id: "meal-3",
      plan_id: "mock-plan-1",
      name: "Lanche da tarde",
      time_of_day: "16:00",
      position: 2,
      items: [
        {
          id: "item-6",
          meal_id: "meal-3",
          food_id: 6,
          food_name: "Iogurte natural, desnatado",
          quantity_g: 170,
          household_measure: "1 pote",
          kcal: 70,
          protein_g: 7,
          carbs_g: 10,
          fat_g: 0.2,
          position: 0,
          substitute_of: null,
          notes: null,
        },
        {
          id: "item-7",
          meal_id: "meal-3",
          food_id: 7,
          food_name: "Banana, prata, crua",
          quantity_g: 80,
          household_measure: "1 unidade média",
          kcal: 78,
          protein_g: 1,
          carbs_g: 21,
          fat_g: 0.1,
          position: 1,
          substitute_of: null,
          notes: "Pode adicionar aveia.",
        },
      ],
    },
    {
      id: "meal-4",
      plan_id: "mock-plan-1",
      name: "Jantar",
      time_of_day: "20:00",
      position: 3,
      items: [
        {
          id: "item-8",
          meal_id: "meal-4",
          food_id: 8,
          food_name: "Batata-doce, cozida",
          quantity_g: 150,
          household_measure: "1 unidade média",
          kcal: 116,
          protein_g: 1.9,
          carbs_g: 27,
          fat_g: 0.1,
          position: 0,
          substitute_of: null,
          notes: null,
        },
        {
          id: "item-9",
          meal_id: "meal-4",
          food_id: 9,
          food_name: "Tilápia, filé, grelhado",
          quantity_g: 120,
          household_measure: "1 filé médio",
          kcal: 155,
          protein_g: 31,
          carbs_g: 0,
          fat_g: 3,
          position: 1,
          substitute_of: null,
          notes: null,
        },
      ],
    },
    {
      id: "meal-5",
      plan_id: "mock-plan-1",
      name: "Ceia",
      time_of_day: "22:30",
      position: 4,
      items: [
        {
          id: "item-10",
          meal_id: "meal-5",
          food_id: 10,
          food_name: "Chá de camomila",
          quantity_g: 200,
          household_measure: "1 xícara",
          kcal: 2,
          protein_g: 0,
          carbs_g: 0.4,
          fat_g: 0,
          position: 0,
          substitute_of: null,
          notes: "Sem açúcar.",
        },
        {
          id: "item-11",
          meal_id: "meal-5",
          food_id: 11,
          food_name: "Castanha-do-pará, crua",
          quantity_g: 10,
          household_measure: "2 unidades",
          kcal: 64,
          protein_g: 1.4,
          carbs_g: 1.5,
          fat_g: 6.3,
          position: 1,
          substitute_of: null,
          notes: null,
        },
      ],
    },
  ],
};

export const MOCK_GOALS: any[] = [
  {
    id: "mock-goal-1",
    patient_id: "mock-patient",
    professional_id: "mock-pro",
    icon: "💧",
    title: "Beber mais água",
    description: "Meta de hidratação diária.",
    target_value: 3,
    unit: "litros",
    active: true,
    created_at: now.toISOString(),
  },
  {
    id: "mock-goal-2",
    patient_id: "mock-patient",
    professional_id: "mock-pro",
    icon: "🏃",
    title: "Exercício físico",
    description: "Musculação 4x na semana.",
    target_value: 1,
    unit: "treino",
    active: true,
    created_at: now.toISOString(),
  },
];

export const MOCK_CHECKINS: any[] = [
  { id: "mock-chk-1", goal_id: "mock-goal-1", patient_id: "mock-patient", day: todayStr, value: 3, updated_at: now.toISOString() },
  { id: "mock-chk-2", goal_id: "mock-goal-1", patient_id: "mock-patient", day: yesterdayStr, value: 2, updated_at: now.toISOString() },
  { id: "mock-chk-3", goal_id: "mock-goal-2", patient_id: "mock-patient", day: todayStr, value: 1, updated_at: now.toISOString() },
];

export const MOCK_DIARY: any[] = [
  {
    id: "diary-1",
    patient_id: "mock-patient",
    eaten_at: new Date(now.getTime() - 2 * 3600000).toISOString(),
    meal_type: "almoco",
    description: "Arroz, feijão, frango grelhado e salada.",
    photo_path: null,
    hunger_before: 4,
    satiety_after: 5,
    mood: "😊",
    followed_plan: true,
    created_at: now.toISOString(),
  },
  {
    id: "diary-2",
    patient_id: "mock-patient",
    eaten_at: new Date(now.getTime() - 24 * 3600000).toISOString(),
    meal_type: "jantar",
    description: "Pizza com os amigos.",
    photo_path: null,
    hunger_before: 5,
    satiety_after: 5,
    mood: "😌",
    followed_plan: false,
    created_at: now.toISOString(),
  },
];

export const MOCK_DIARY_COMMENTS: any[] = [
  {
    id: "cmt-1",
    entry_id: "diary-2",
    author_id: "mock-pro",
    body: "Tudo bem sair um pouco do plano, o importante é a constância geral!",
    created_at: now.toISOString(),
  }
];

export const MOCK_NOTES: any[] = [
  {
    id: "note-1",
    patient_id: "mock-patient",
    professional_id: "mock-pro",
    appointment_id: null,
    subjective: "Paciente relatou estar dormindo melhor e com mais disposição nos treinos.",
    objective: "Peso manteve igual, porém com visível melhora na composição corporal.",
    assessment: "Boa adesão ao plano. Ajuste leve necessário nos carboidratos pré-treino.",
    plan: "Aumentar carboidrato no almoço. Manter metas de hidratação.",
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  }
];

export const MOCK_APPOINTMENTS: any[] = [
  {
    id: "appt-1",
    patient_id: "mock-patient",
    professional_id: "mock-pro",
    starts_at: new Date(now.getTime() + 48 * 3600000).toISOString(),
    ends_at: new Date(now.getTime() + 49 * 3600000).toISOString(),
    status: "confirmada",
    modality: "online",
    link: "https://meet.google.com/mock-link",
    payment_status: "pago",
    payment_id: "pay-1",
    price: 250,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  },
  {
    id: "appt-2",
    patient_id: "mock-patient",
    professional_id: "mock-pro",
    starts_at: new Date(now.getTime() - 30 * 24 * 3600000).toISOString(),
    ends_at: new Date(now.getTime() - 30 * 24 * 3600000 + 3600000).toISOString(),
    status: "confirmada",
    modality: "presencial",
    link: null,
    payment_status: "pago",
    payment_id: "pay-2",
    price: 250,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  }
];

export const MOCK_ANTHROPOMETRICS: any[] = [
  {
    id: "anthro-1",
    patient_id: "mock-patient",
    professional_id: "mock-pro",
    measured_at: now.toISOString(),
    weight_kg: 75.5,
    height_cm: 180,
    body_fat_pct: 15,
    muscle_mass_kg: 35,
    visceral_fat: 4,
    notes: "Paciente reduziu 2% de gordura desde a última avaliação.",
    created_at: now.toISOString()
  }
];

export const MOCK_DOCUMENTS: any[] = [
  {
    id: "doc-1",
    patient_id: "mock-patient",
    uploaded_by: "mock-pro",
    title: "Hemograma Completo",
    kind: "exame",
    file_path: "mock/doc-1.html",
    mime_type: "text/html",
    size_bytes: 48000,
    document_date: yesterdayStr,
    notes: "Valores dentro da referência. Ferritina no limite inferior.",
    created_at: now.toISOString()
  }
];

const HEMOGRAMA_ROWS: [string, string, string, string][] = [
  ["Hemácias", "4,92", "milhões/mm³", "4,30 – 5,70"],
  ["Hemoglobina", "14,6", "g/dL", "13,0 – 17,0"],
  ["Hematócrito", "43,8", "%", "39,0 – 50,0"],
  ["VCM", "89,0", "fL", "80,0 – 100,0"],
  ["HCM", "29,7", "pg", "27,0 – 32,0"],
  ["CHCM", "33,3", "g/dL", "31,5 – 36,0"],
  ["RDW", "12,8", "%", "11,5 – 14,5"],
  ["Leucócitos", "6.400", "/mm³", "4.000 – 10.000"],
  ["Neutrófilos", "58", "%", "40 – 70"],
  ["Linfócitos", "32", "%", "20 – 45"],
  ["Plaquetas", "245.000", "/mm³", "150.000 – 450.000"],
  ["Ferritina", "32", "ng/mL", "30 – 400"],
];

/** Laudo de exemplo gerado no navegador (os arquivos mock não existem no Storage). */
export function mockDocumentUrl(path: string): string {
  if (typeof window === "undefined") return "about:blank";
  const rows = HEMOGRAMA_ROWS.map(
    ([n, v, u, r]) => `<tr><td>${n}</td><td><b>${v}</b></td><td>${u}</td><td>${r}</td></tr>`,
  ).join("");
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Hemograma Completo (exemplo)</title>
<style>body{font-family:Georgia,serif;background:#f6f1e7;color:#2b2a26;max-width:760px;margin:40px auto;padding:32px;background-clip:content-box}
main{background:#fffdf8;border:1px solid #e4dccb;border-radius:18px;padding:36px}h1{margin:0 0 4px;color:#4b5a2e}
small{color:#7a7466}table{width:100%;border-collapse:collapse;margin-top:24px;font-family:system-ui,sans-serif;font-size:14px}
th,td{text-align:left;padding:10px 8px;border-bottom:1px solid #eee6d6}th{color:#7a7466;font-weight:600}
.tag{display:inline-block;margin-top:12px;background:#f3e4d7;color:#b5532f;border-radius:99px;padding:4px 12px;font:600 12px system-ui}</style></head>
<body><main><h1>Hemograma Completo</h1><small>Paciente: João (Paciente Exemplo) · Coleta: ${yesterdayStr} · Arquivo: ${path}</small>
<div class="tag">Documento de exemplo — dados fictícios</div>
<table><thead><tr><th>Exame</th><th>Resultado</th><th>Unidade</th><th>Referência</th></tr></thead><tbody>${rows}</tbody></table>
<p style="margin-top:24px;font-size:14px"><b>Observação:</b> ferritina no limite inferior; avaliar ingestão de ferro.</p></main></body></html>`;
  return URL.createObjectURL(new Blob([html], { type: "text/html" }));
}

export const MOCK_MESSAGES: any[] = [
  {
    id: "msg-1",
    patient_id: "mock-patient",
    professional_id: "mock-pro",
    sender_id: "mock-pro",
    body: "Olá! Como está sendo a adaptação com a nova dieta?",
    read_at: now.toISOString(),
    created_at: new Date(now.getTime() - 2 * 3600000).toISOString()
  },
  {
    id: "msg-2",
    patient_id: "mock-patient",
    professional_id: "mock-pro",
    sender_id: "mock-patient",
    body: "Tudo ótimo! A lista de compras ajudou muito.",
    read_at: null,
    created_at: now.toISOString()
  }
];

export const isMockId = (id: string | null | undefined) => !!id && id.startsWith("mock-");

/**
 * Mensagens mock da conversa, com remetentes trocados pelos ids da conversa aberta
 * (o admin pode estar no lugar do paciente ou do profissional).
 */
export function mockMessagesFor(patientId: string, professionalId: string): any[] {
  return MOCK_MESSAGES.map((m) => ({
    attachment_path: null,
    attachment_name: null,
    ...m,
    patient_id: patientId,
    professional_id: professionalId,
    sender_id: m.sender_id === "mock-patient" ? patientId : professionalId,
  }));
}

/** Mensagem enviada numa conversa mock: fica só na memória da sessão. */
export function addMockMessage(fromPatient: boolean, body: string) {
  MOCK_MESSAGES.push({
    id: `msg-${Date.now()}`,
    patient_id: "mock-patient",
    professional_id: "mock-pro",
    sender_id: fromPatient ? "mock-patient" : "mock-pro",
    body: body.trim(),
    read_at: null,
    created_at: new Date().toISOString(),
  });
}

/** Resumos de conversa no mesmo formato de `care.listConversationSummaries`. */
export function mockConversationsFor(uid: string) {
  const summary = (patientId: string, professionalId: string) => {
    const msgs = mockMessagesFor(patientId, professionalId);
    return {
      patientId,
      professionalId,
      last: msgs[msgs.length - 1],
      unread: msgs.filter((m) => !m.read_at && m.sender_id !== uid).length,
    };
  };
  return [summary(uid, "mock-pro"), summary("mock-patient", uid)];
}

export const MOCK_LINKS: any[] = [
  {
    id: "link-1",
    patient_id: "mock-patient",
    professional_id: "mock-pro",
    status: "ativo",
    origin: "solicitacao",
    community_slug: null,
    message: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  }
];

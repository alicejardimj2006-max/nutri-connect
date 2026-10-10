// Modo demonstração do acompanhamento clínico, só para administradores e só no navegador de quem
// ligou (painel → Funcionalidades). Ligado, as telas de paciente e de profissional mostram um
// profissional e um paciente de exemplo, com plano, metas, diário, conversa, consultas e exame.
// Os dados ficam na memória da página: nada vai para o banco. O que não faz sentido simular
// (pagamentos, agenda, convites…) avisa que está indisponível.

import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/use-auth";
import { getUser } from "@/lib/auth";
import { isPlatformAdmin } from "@/lib/community-admin";
import type {
  Appointment,
  CareInvite,
  CareLink,
  DirectoryEntry,
  Payment,
  PersonSummary,
  Professional,
} from "./api";
import type { DiaryComment, DiaryEntry, MealType, Message, PatientDocument } from "./care";
import type {
  AnamnesisData,
  Anthropometric,
  ClinicalNote,
  FullMealPlan,
  Goal,
  GoalCheckin,
  MealPlan,
} from "./records";

/** Ids válidos (formato UUID) para não quebrar nada que espere um id de verdade. */
export const DEMO_PRO = "00000000-0000-4000-a000-00000000de01";
export const DEMO_PATIENT = "00000000-0000-4000-a000-00000000de02";
const DEMO_PATH = "demo/";

const STORAGE_KEY = "nc-demo-clinico";
const EVENT = "nc-demo-clinico";

// ───────────────────────── Liga/desliga ─────────────────────────

function readFlag() {
  try {
    return typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

let enabled = readFlag();

/** O modo vale só para administradores (e só se ligado neste navegador). */
export function demoActive() {
  return enabled && isPlatformAdmin(getUser());
}

export function setDemoEnabled(on: boolean) {
  enabled = on;
  try {
    if (on) window.localStorage.setItem(STORAGE_KEY, "1");
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // sem armazenamento: vale só nesta página
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

/** Ligado neste navegador (o painel mostra o interruptor; as telas mostram a faixa). */
export function useDemoEnabled() {
  return useSyncExternalStore(
    subscribe,
    () => enabled,
    () => false,
  );
}

/** Modo demonstração valendo agora (ligado neste navegador e a pessoa é administradora). */
export function useClinicalDemo() {
  const on = useDemoEnabled();
  const { user } = useAuth();
  return on && isPlatformAdmin(user);
}

/** Bloqueia ações que não são simuladas no modo demonstração. */
export function blockInDemo() {
  if (demoActive())
    throw new Error(
      "Indisponível no modo demonstração. Desligue o modo no painel para usar de verdade.",
    );
}

export const isDemoId = (id: string | null | undefined) => id === DEMO_PRO || id === DEMO_PATIENT;
export const isDemoPath = (path: string) => path.startsWith(DEMO_PATH);

// ───────────────────────── Dados ─────────────────────────

const iso = (d: Date) => d.toISOString();
const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};
const at = (dayOffset: number, hour: number, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
};
/**
 * Cópia profunda: o cache das telas compara referências; devolver os mesmos objetos alterados faria
 * a tela não perceber a mudança (era o que acontecia com o "+/−" das metas nos dados de exemplo).
 */
const copy = <T>(v: T): T => structuredClone(v);

let seq = 0;
const newId = () =>
  `00000000-0000-4000-b000-${(Date.now() + seq++).toString(16).padStart(12, "0").slice(-12)}`;

async function uid() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? "";
}

/** Quem é quem: o administrador ocupa o lugar do paciente ou do profissional na conversa/vínculo. */
function pair(me: string, role: "patient" | "professional") {
  return role === "patient"
    ? { patient: me, professional: DEMO_PRO }
    : { patient: DEMO_PATIENT, professional: me };
}

const PEOPLE: Record<string, PersonSummary> = {
  [DEMO_PRO]: {
    id: DEMO_PRO,
    name: "Dra. Helena Prado (exemplo)",
    avatarUrl: null,
    bio: "Nutricionista de exemplo do modo demonstração.",
  },
  [DEMO_PATIENT]: {
    id: DEMO_PATIENT,
    name: "João Silva (exemplo)",
    avatarUrl: null,
    bio: "Paciente de exemplo do modo demonstração.",
  },
};

const PRO_ROW: Professional = {
  user_id: DEMO_PRO,
  accepting_patients: true,
  address: "Rua das Flores, 100 — São Paulo/SP",
  consultation_duration_min: 50,
  consultation_price_cents: 18000,
  council: "CRN",
  headline: "Nutrição esportiva e comportamental",
  mp_connected: false,
  offers_online: true,
  offers_presential: true,
  online_instructions: null,
  profession: "nutricionista",
  registration: "DEMO-0000",
  specialties: ["Nutrição esportiva", "Comportamento alimentar"],
  timezone: "America/Sao_Paulo",
  uf: "SP",
  updated_at: iso(at(-30, 10)),
  verified_at: iso(at(-60, 10)),
};

const DIRECTORY: DirectoryEntry = {
  id: DEMO_PRO,
  name: PEOPLE[DEMO_PRO].name,
  avatar_url: null,
  bio: PEOPLE[DEMO_PRO].bio,
  accepting_patients: true,
  consultation_duration_min: 50,
  consultation_price_cents: 18000,
  council: "CRN",
  headline: PRO_ROW.headline,
  mp_connected: false,
  offers_online: true,
  offers_presential: true,
  profession: "nutricionista",
  registration: "DEMO-0000",
  specialties: PRO_ROW.specialties,
  uf: "SP",
  verified_at: PRO_ROW.verified_at,
};

/** Estado da demonstração (por paciente), criado na primeira consulta e mantido na memória. */
interface DemoState {
  goals: Goal[];
  checkins: GoalCheckin[];
  diary: DiaryEntry[];
  comments: DiaryComment[];
  notes: ClinicalNote[];
  messages: Message[];
}

const states = new Map<string, DemoState>();

function stateFor(patientId: string, professionalId: string): DemoState {
  const key = patientId;
  const found = states.get(key);
  if (found) return found;
  const goal = (id: string, icon: string, title: string, target: number, unit: string): Goal => ({
    id,
    patient_id: patientId,
    professional_id: professionalId,
    icon,
    title,
    description: null,
    target_value: target,
    unit,
    active: true,
    created_at: iso(at(-20, 9)),
  });
  const goals = [
    goal(newId(), "💧", "Beber água", 8, "copos"),
    goal(newId(), "🥗", "Comer verduras no almoço e no jantar", 2, "refeições"),
    goal(newId(), "🚶", "Caminhar", 30, "minutos"),
  ];
  const checkins: GoalCheckin[] = [-3, -2, -1, 0].flatMap((d) =>
    goals.map((g, i) => ({
      goal_id: g.id,
      patient_id: patientId,
      day: day(d),
      value: Math.max(0, g.target_value - ((i + d + 4) % 3)),
      updated_at: iso(at(d, 20)),
    })),
  );
  const entry = (
    d: number,
    hour: number,
    meal: MealType,
    description: string,
    followed: boolean,
    mood: string,
  ): DiaryEntry => ({
    id: newId(),
    patient_id: patientId,
    eaten_at: iso(at(d, hour)),
    meal_type: meal,
    description,
    photo_path: null,
    hunger_before: 3,
    satiety_after: 4,
    mood,
    followed_plan: followed,
    created_at: iso(at(d, hour, 10)),
  });
  const diary = [
    entry(
      0,
      12,
      "almoco",
      "Arroz, feijão, frango grelhado, salada de alface e tomate.",
      true,
      "😊",
    ),
    entry(0, 8, "cafe_da_manha", "Pão integral com ovo mexido e café com leite.", true, "🙂"),
    entry(-1, 20, "jantar", "Pizza com amigos (2 fatias) e refrigerante.", false, "😌"),
  ];
  const comments: DiaryComment[] = [
    {
      id: newId(),
      entry_id: diary[2].id,
      author_id: professionalId,
      body: "Tudo bem sair do plano de vez em quando! O que conta é a constância da semana. 💚",
      created_at: iso(at(-1, 21)),
    },
  ];
  const notes: ClinicalNote[] = [
    {
      id: newId(),
      patient_id: patientId,
      professional_id: professionalId,
      appointment_id: null,
      subjective: "Relata mais disposição e menos beliscos à tarde. Dorme por volta de 7 h.",
      objective: "Peso 78,4 kg (−1,6 kg em 30 dias). Circunferência da cintura 88 cm.",
      assessment: "Boa adesão ao plano. Hidratação ainda abaixo da meta.",
      plan: "Manter o plano; incluir lanche da tarde com fruta e iogurte; meta de 8 copos de água.",
      created_at: iso(at(-14, 15)),
      updated_at: iso(at(-14, 15)),
    },
  ];
  const message = (minutesAgo: number, fromPro: boolean, body: string, read: boolean): Message => {
    const d = new Date(Date.now() - minutesAgo * 60_000);
    return {
      id: newId(),
      patient_id: patientId,
      professional_id: professionalId,
      sender_id: fromPro ? professionalId : patientId,
      body,
      attachment_name: null,
      attachment_path: null,
      read_at: read ? iso(d) : null,
      created_at: iso(d),
    };
  };
  const messages = [
    message(60 * 26, true, "Oi, João! Como foi a primeira semana com o plano novo?", true),
    message(60 * 25, false, "Foi bem! Só senti fome no meio da tarde.", true),
    message(60 * 24, true, "Ótimo saber. Incluí um lanche às 16h com fruta e iogurte. 😉", true),
    message(35, false, "A lista de compras do plano ajudou muito no mercado!", false),
  ];
  const state = { goals, checkins, diary, comments, notes, messages };
  states.set(key, state);
  return state;
}

function planFor(patientId: string, professionalId: string): FullMealPlan {
  const planId = `${patientId.slice(0, 24)}de0000000001`;
  const meal = (
    id: string,
    name: string,
    time: string,
    position: number,
    items: [string, number, string, number, number, number, number][],
  ) => ({
    id,
    plan_id: planId,
    name,
    notes: null,
    position,
    time_of_day: time,
    items: items.map(([food, grams, measure, kcal, p, c, f], i) => ({
      id: `${id}-${i}`,
      meal_id: id,
      food_id: null,
      food_name: food,
      quantity_g: grams,
      household_measure: measure,
      kcal,
      protein_g: p,
      carbs_g: c,
      fat_g: f,
      notes: null,
      position: i,
      substitute_of: null,
    })),
  });
  return {
    id: planId,
    patient_id: patientId,
    professional_id: professionalId,
    title: "Plano de reeducação alimentar (exemplo)",
    status: "ativo",
    guidelines:
      "Beba água ao longo do dia. Prefira comida de verdade e coma sem pressa. Este é um plano de exemplo.",
    starts_on: day(-14),
    ends_on: day(46),
    published_at: iso(at(-14, 16)),
    created_at: iso(at(-15, 10)),
    updated_at: iso(at(-14, 16)),
    target_kcal: 1900,
    target_protein_g: 100,
    target_carbs_g: 230,
    target_fat_g: 60,
    meals: [
      meal("demo-m1", "Café da manhã", "07:30:00", 0, [
        ["Pão integral", 50, "2 fatias", 124, 4.7, 24.6, 1.7],
        ["Ovo de galinha cozido", 100, "2 unidades", 146, 13.3, 0.6, 9.5],
        ["Mamão papaia", 150, "1/2 unidade", 60, 0.8, 15.4, 0.2],
      ]),
      meal("demo-m2", "Almoço", "12:30:00", 1, [
        ["Arroz integral cozido", 120, "4 colheres de sopa", 149, 3.1, 31, 1.2],
        ["Feijão carioca cozido", 100, "1 concha", 76, 4.8, 13.6, 0.5],
        ["Peito de frango grelhado", 120, "1 filé médio", 191, 38.4, 0, 3],
        ["Salada de folhas e tomate", 100, "1 prato de sobremesa", 18, 1.2, 3.3, 0.2],
      ]),
      meal("demo-m3", "Lanche da tarde", "16:00:00", 2, [
        ["Iogurte natural", 170, "1 pote", 87, 6.8, 9.5, 2.6],
        ["Banana prata", 90, "1 unidade", 88, 1.2, 23.4, 0.1],
      ]),
      meal("demo-m4", "Jantar", "20:00:00", 3, [
        ["Batata-doce cozida", 150, "1 unidade média", 116, 0.9, 27.6, 0.2],
        ["Tilápia grelhada", 120, "1 filé", 154, 31.2, 0, 2.8],
        ["Brócolis cozido", 80, "1 xícara", 20, 1.7, 3.6, 0.4],
      ]),
    ],
  };
}

// ───────────────────────── Funções equivalentes às de api/records/care ─────────────────────────

/** Mesmas assinaturas das funções reais (o módulo real chama estas quando o modo está ligado). */
export const demo = {
  // api.ts
  async fetchPatientPrivate(patientId: string) {
    return {
      id: patientId,
      birth_date: "1990-05-12",
      cpf: null,
      email: "joao.exemplo@nutriconnect.app",
      phone: "(11) 90000-0000",
      sex: "masculino",
      updated_at: iso(at(-30, 10)),
    };
  },
  async getDirectoryEntry(id: string): Promise<DirectoryEntry | null> {
    return id === DEMO_PRO ? DIRECTORY : null;
  },
  async getProfessional(id: string): Promise<Professional | null> {
    return id === DEMO_PRO ? PRO_ROW : { ...PRO_ROW, user_id: id };
  },
  async listAppointments(opts: {
    role: "patient" | "professional";
    from?: string;
    to?: string;
    patientId?: string;
    professionalId?: string;
    limit?: number;
    ascending?: boolean;
  }): Promise<Appointment[]> {
    const p = pair(await uid(), opts.role);
    const appt = (
      start: Date,
      status: Appointment["status"],
      modality: Appointment["modality"],
    ): Appointment => ({
      id: `${p.patient.slice(0, 24)}${start.getTime().toString(16).slice(-12)}`,
      patient_id: p.patient,
      professional_id: p.professional,
      starts_at: iso(start),
      ends_at: iso(new Date(start.getTime() + 50 * 60_000)),
      status,
      modality,
      location: modality === "presencial" ? PRO_ROW.address : null,
      meeting_url: null,
      price_cents: 18000,
      patient_notes: null,
      summary_for_patient:
        status === "realizada" ? "Retorno: manter o plano e incluir o lanche da tarde." : null,
      cancel_reason: null,
      cancelled_at: null,
      cancelled_by: null,
      created_at: iso(at(-20, 10)),
      created_by: p.patient,
      hold_expires_at: null,
      patient_joined_at: null,
      professional_joined_at: null,
      updated_at: iso(at(-20, 10)),
    });
    let list = [
      appt(at(-14, 15), "realizada", "presencial"),
      appt(at(3, 10), "confirmada", "online"),
      appt(at(31, 10), "agendada", "online"),
    ];
    if (opts.from) list = list.filter((a) => a.starts_at >= opts.from!);
    if (opts.to) list = list.filter((a) => a.starts_at < opts.to!);
    if (opts.ascending === false) list.reverse();
    return opts.limit ? list.slice(0, opts.limit) : list;
  },
  async listLinks(role: "patient" | "professional"): Promise<CareLink[]> {
    const p = pair(await uid(), role);
    return [
      {
        id: `${p.patient.slice(0, 24)}de00000000aa`,
        patient_id: p.patient,
        professional_id: p.professional,
        status: "ativo",
        origin: "convite",
        community_slug: null,
        message: null,
        created_at: iso(at(-20, 10)),
        responded_at: iso(at(-20, 11)),
        ended_at: null,
        ended_by: null,
      },
    ];
  },
  async listInvites(): Promise<CareInvite[]> {
    return [];
  },
  async listPaymentsForAppointments(_ids: string[]): Promise<Payment[]> {
    return [];
  },

  // records.ts
  async getAnamnesis(patientId: string, professionalId: string) {
    const data: AnamnesisData = {
      chiefComplaint: "Quer emagrecer com saúde e ter mais disposição.",
      goals: "Perder 5 kg em 3 meses sem dietas restritivas.",
      clinicalHistory: { conditions: [], medications: "Nenhuma", allergies: "Nenhuma" },
      lifestyle: {
        occupation: "Analista (trabalho sentado)",
        physicalActivity: "Caminhada 2x por semana",
        sleepHours: 7,
        waterLiters: 1.2,
        smoking: false,
        alcohol: "Socialmente, fins de semana",
      },
      eating: { mealsPerDay: 4, whoCooks: "Ele mesmo", eatsOut: "Almoço 2x por semana" },
    };
    return {
      id: `${patientId.slice(0, 24)}de00000000bb`,
      patient_id: patientId,
      professional_id: professionalId,
      data,
      created_at: iso(at(-20, 10)),
      updated_at: iso(at(-20, 10)),
    };
  },
  async listNotes(patientId: string): Promise<ClinicalNote[]> {
    return copy(stateFor(patientId, (await uid()) || DEMO_PRO).notes);
  },
  async saveNote(note: Omit<TablesInsert<"clinical_notes">, "professional_id"> & { id?: string }) {
    const s = stateFor(note.patient_id, await uid());
    const now = iso(new Date());
    const found = note.id ? s.notes.find((n) => n.id === note.id) : undefined;
    if (found) Object.assign(found, note, { updated_at: now });
    else
      s.notes.unshift({
        id: newId(),
        appointment_id: note.appointment_id ?? null,
        assessment: note.assessment ?? null,
        objective: note.objective ?? null,
        plan: note.plan ?? null,
        subjective: note.subjective ?? null,
        patient_id: note.patient_id,
        professional_id: await uid(),
        created_at: now,
        updated_at: now,
      });
  },
  async deleteNote(id: string) {
    for (const s of states.values()) s.notes = s.notes.filter((n) => n.id !== id);
  },
  async listAnthropometrics(patientId: string): Promise<Anthropometric[]> {
    const row = (d: number, weight: number, fat: number): Anthropometric => ({
      id: `${patientId.slice(0, 24)}${(1000 - d).toString(16).padStart(12, "0")}`,
      patient_id: patientId,
      professional_id: DEMO_PRO,
      appointment_id: null,
      measured_at: iso(at(d, 15)),
      weight_kg: weight,
      height_cm: 176,
      body_fat_pct: fat,
      body_fat_protocol: null,
      circumferences: { cintura: 88 + (d < -20 ? 3 : 0) },
      skinfolds: {},
      bmr_formula: null,
      bmr_kcal: null,
      activity_factor: null,
      tdee_kcal: null,
      notes: null,
      created_at: iso(at(d, 15)),
    });
    return [row(-44, 80.0, 24.1), row(-14, 78.4, 23.0)];
  },
  async listMealPlans(patientId: string): Promise<MealPlan[]> {
    const { meals: _meals, ...plan } = planFor(patientId, DEMO_PRO);
    return [plan];
  },
  async getMealPlan(planId: string): Promise<FullMealPlan | null> {
    const plan = planFor(DEMO_PATIENT, DEMO_PRO);
    return planId === plan.id ? plan : planFor((await uid()) || DEMO_PATIENT, DEMO_PRO);
  },
  async getActivePlan(patientId: string): Promise<FullMealPlan | null> {
    return planFor(patientId, DEMO_PRO);
  },
  async listGoals(patientId: string): Promise<Goal[]> {
    return copy(stateFor(patientId, DEMO_PRO).goals);
  },
  async saveGoal(
    goal: Omit<TablesInsert<"goals">, "professional_id"> & { id?: string },
    asProfessional: boolean,
  ) {
    const s = stateFor(goal.patient_id, DEMO_PRO);
    const found = goal.id ? s.goals.find((g) => g.id === goal.id) : undefined;
    if (found) Object.assign(found, goal);
    else
      s.goals.push({
        id: newId(),
        patient_id: goal.patient_id,
        professional_id: asProfessional ? await uid() : null,
        icon: goal.icon ?? "🎯",
        title: goal.title,
        description: goal.description ?? null,
        target_value: goal.target_value ?? 1,
        unit: goal.unit ?? "vezes",
        active: goal.active ?? true,
        created_at: iso(new Date()),
      });
  },
  async deleteGoal(id: string) {
    for (const s of states.values()) s.goals = s.goals.filter((g) => g.id !== id);
  },
  async listCheckins(patientId: string, fromDay: string): Promise<GoalCheckin[]> {
    return copy(stateFor(patientId, DEMO_PRO).checkins.filter((c) => c.day >= fromDay));
  },
  async setCheckin(goalId: string, patientId: string, d: string, value: number) {
    const s = stateFor(patientId, DEMO_PRO);
    const found = s.checkins.find((c) => c.goal_id === goalId && c.day === d);
    if (found) Object.assign(found, { value, updated_at: iso(new Date()) });
    else
      s.checkins.push({
        goal_id: goalId,
        patient_id: patientId,
        day: d,
        value,
        updated_at: iso(new Date()),
      });
  },

  // care.ts
  async listDiary(patientId: string, limit = 60): Promise<DiaryEntry[]> {
    return copy(
      [...stateFor(patientId, DEMO_PRO).diary]
        .sort((a, b) => b.eaten_at.localeCompare(a.eaten_at))
        .slice(0, limit),
    );
  },
  async addDiaryEntry(input: {
    eatenAt: string;
    mealType: MealType;
    description: string;
    photo?: File | null;
    hungerBefore?: number | null;
    satietyAfter?: number | null;
    mood?: string | null;
    followedPlan?: boolean | null;
  }) {
    const me = await uid();
    stateFor(me, DEMO_PRO).diary.push({
      id: newId(),
      patient_id: me,
      eaten_at: input.eatenAt,
      meal_type: input.mealType,
      description: input.description.trim(),
      photo_path: null,
      hunger_before: input.hungerBefore ?? null,
      satiety_after: input.satietyAfter ?? null,
      mood: input.mood?.trim() || null,
      followed_plan: input.followedPlan ?? null,
      created_at: iso(new Date()),
    });
  },
  async deleteDiaryEntry(entry: DiaryEntry) {
    const s = stateFor(entry.patient_id, DEMO_PRO);
    s.diary = s.diary.filter((e) => e.id !== entry.id);
  },
  async listDiaryComments(entryIds: string[]): Promise<DiaryComment[]> {
    return copy(
      [...states.values()].flatMap((s) => s.comments).filter((c) => entryIds.includes(c.entry_id)),
    );
  },
  async addDiaryComment(entryId: string, body: string) {
    const me = await uid();
    for (const s of states.values()) {
      if (s.diary.some((e) => e.id === entryId))
        s.comments.push({
          id: newId(),
          entry_id: entryId,
          author_id: me,
          body: body.trim(),
          created_at: iso(new Date()),
        });
    }
  },
  async deleteDiaryComment(id: string) {
    for (const s of states.values()) s.comments = s.comments.filter((c) => c.id !== id);
  },
  async listMessages(patientId: string, professionalId: string): Promise<Message[]> {
    return copy(stateFor(patientId, professionalId).messages);
  },
  async listConversationSummaries(): Promise<
    { patientId: string; professionalId: string; last: Message; unread: number }[]
  > {
    const me = await uid();
    return [pair(me, "patient"), pair(me, "professional")].map((p) => {
      const msgs = stateFor(p.patient, p.professional).messages;
      return {
        patientId: p.patient,
        professionalId: p.professional,
        last: copy(msgs[msgs.length - 1]),
        unread: msgs.filter((m) => !m.read_at && m.sender_id !== me).length,
      };
    });
  },
  async sendMessage(input: {
    patientId: string;
    professionalId: string;
    body: string;
    file?: File | null;
  }) {
    if (input.file) throw new Error("Anexos ficam indisponíveis no modo demonstração.");
    const me = await uid();
    stateFor(input.patientId, input.professionalId).messages.push({
      id: newId(),
      patient_id: input.patientId,
      professional_id: input.professionalId,
      sender_id: me,
      body: input.body.trim(),
      attachment_name: null,
      attachment_path: null,
      read_at: null,
      created_at: iso(new Date()),
    });
  },
  async markConversationRead(patientId: string, professionalId: string) {
    const me = await uid();
    for (const m of stateFor(patientId, professionalId).messages)
      if (m.sender_id !== me && !m.read_at) m.read_at = iso(new Date());
  },
  async listDocuments(patientId: string): Promise<PatientDocument[]> {
    return [
      {
        id: `${patientId.slice(0, 24)}de00000000cc`,
        patient_id: patientId,
        uploaded_by: DEMO_PRO,
        title: "Hemograma completo (exemplo)",
        kind: "exame",
        file_path: `${DEMO_PATH}hemograma.html`,
        mime_type: "text/html",
        size_bytes: 4800,
        document_date: day(-10),
        notes: "Valores dentro da referência; ferritina no limite inferior.",
        created_at: iso(at(-10, 9)),
      },
    ];
  },
};

/** Pessoas de exemplo (as demais vêm do banco). */
export function demoPeople(ids: string[]) {
  return ids.filter(isDemoId).map((id) => PEOPLE[id]);
}

const HEMOGRAMA: [string, string, string, string][] = [
  ["Hemácias", "4,92", "milhões/mm³", "4,30 – 5,70"],
  ["Hemoglobina", "14,6", "g/dL", "13,0 – 17,0"],
  ["Hematócrito", "43,8", "%", "39,0 – 50,0"],
  ["Leucócitos", "6.400", "/mm³", "4.000 – 10.000"],
  ["Plaquetas", "245.000", "/mm³", "150.000 – 450.000"],
  ["Ferritina", "32", "ng/mL", "30 – 400"],
];

/** Endereço do arquivo de exemplo (gerado no navegador; não existe no Storage). */
export function demoFileUrl(path: string) {
  if (typeof window === "undefined") return "about:blank";
  const rows = HEMOGRAMA.map(
    ([n, v, u, r]) => `<tr><td>${n}</td><td><b>${v}</b></td><td>${u}</td><td>${r}</td></tr>`,
  ).join("");
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Hemograma completo (exemplo)</title>
<style>body{font-family:system-ui,sans-serif;background:#f6f1e7;color:#2b2a26;max-width:720px;margin:40px auto;padding:0 16px}
main{background:#fffdf8;border:1px solid #e4dccb;border-radius:18px;padding:32px}h1{margin:0 0 4px}small{color:#7a7466}
table{width:100%;border-collapse:collapse;margin-top:20px;font-size:14px}th,td{text-align:left;padding:9px 6px;border-bottom:1px solid #eee6d6}
.tag{display:inline-block;margin-top:10px;background:#f3e4d7;color:#b5532f;border-radius:99px;padding:3px 12px;font-size:12px;font-weight:600}</style></head>
<body><main><h1>Hemograma completo</h1><small>Paciente: João Silva (exemplo) · Arquivo: ${path}</small>
<div class="tag">Documento de exemplo — dados fictícios</div>
<table><thead><tr><th>Exame</th><th>Resultado</th><th>Unidade</th><th>Referência</th></tr></thead><tbody>${rows}</tbody></table></main></body></html>`;
  return URL.createObjectURL(new Blob([html], { type: "text/html" }));
}

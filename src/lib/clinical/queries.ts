import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import * as api from "./api";
import * as records from "./records";
import * as care from "./care";
import { useAuth } from "@/hooks/use-auth";
import { isPlatformAdmin } from "@/lib/community-admin";
import * as mock from "./mock-data";

export const qk = {
  all: ["clinical"] as const,
  directory: () => ["clinical", "directory"] as const,
  directoryEntry: (id: string) => ["clinical", "directory", id] as const,
  professional: (id: string) => ["clinical", "professional", id] as const,
  slots: (id: string, from: string, to: string) => ["clinical", "slots", id, from, to] as const,
  appointments: (params: object) => ["clinical", "appointments", params] as const,
  links: (role: string) => ["clinical", "links", role] as const,
  invites: () => ["clinical", "invites"] as const,
  rules: (id: string) => ["clinical", "rules", id] as const,
  blocks: (id: string) => ["clinical", "blocks", id] as const,
  people: (ids: string[]) => ["clinical", "people", [...ids].sort().join(",")] as const,
  payments: (ids: string[]) => ["clinical", "payments", [...ids].sort().join(",")] as const,
  patientPrivate: (id: string) => ["clinical", "patient-private", id] as const,
  anamnesis: (patientId: string, proId: string) =>
    ["clinical", "anamnesis", patientId, proId] as const,
  notes: (patientId: string) => ["clinical", "notes", patientId] as const,
  anthropometrics: (patientId: string) => ["clinical", "anthropometrics", patientId] as const,
  plans: (patientId: string) => ["clinical", "plans", patientId] as const,
  plan: (planId: string) => ["clinical", "plan", planId] as const,
  activePlan: (patientId: string) => ["clinical", "active-plan", patientId] as const,
  goals: (patientId: string) => ["clinical", "goals", patientId] as const,
  checkins: (patientId: string, from: string) => ["clinical", "checkins", patientId, from] as const,
  foods: (q: string) => ["clinical", "foods", q] as const,
  diary: (patientId: string) => ["clinical", "diary", patientId] as const,
  diaryComments: (ids: string[]) =>
    ["clinical", "diary-comments", [...ids].sort().join(",")] as const,
  messages: (patientId: string, proId: string) =>
    ["clinical", "messages", patientId, proId] as const,
  conversations: () => ["clinical", "conversations"] as const,
  documents: (patientId: string) => ["clinical", "documents", patientId] as const,
  signed: (bucket: string, paths: string[]) =>
    ["clinical", "signed", bucket, [...paths].sort().join(",")] as const,
};

export function useDirectory() {
  return useQuery({ queryKey: qk.directory(), queryFn: api.listDirectory });
}

export function useDirectoryEntry(id: string) {
  const { user } = useAuth();
  const admin = isPlatformAdmin(user);
  return useQuery({
    queryKey: qk.directoryEntry(id),
    queryFn: async () => {
      if (id.startsWith("mock-") && admin) {
        return {
          id: "mock-pro",
          user_id: "mock-pro",
          name: "Dra. Mock (Nutricionista)",
          avatar_url: null,
          bio: "Profissional de teste",
          profession: "Nutricionista",
          council: "CRN",
          registration: "12345",
          uf: "SP",
          specialties: ["Esportiva"],
          public_lookup_url: null,
        } as any;
      }
      return api.getDirectoryEntry(id);
    },
  });
}

export function useProfessional(id: string | undefined) {
  return useQuery({
    queryKey: qk.professional(id ?? ""),
    queryFn: () => api.getProfessional(id!),
    enabled: !!id,
  });
}

export function useSlots(professionalId: string, from: string, to: string, enabled = true) {
  return useQuery({
    queryKey: qk.slots(professionalId, from, to),
    queryFn: () => api.getSlots(professionalId, from, to),
    enabled,
  });
}

export function useAppointments(
  params: Parameters<typeof api.listAppointments>[0],
  enabled = true,
) {
  const { user } = useAuth();
  const admin = isPlatformAdmin(user);
  return useQuery({
    queryKey: qk.appointments(params),
    queryFn: async () => {
      const data = await api.listAppointments(params);
      if (data.length === 0 && admin) return mock.MOCK_APPOINTMENTS;
      return data;
    },
    enabled,
  });
}

export function useLinks(role: "patient" | "professional", enabled = true) {
  const { user } = useAuth();
  const admin = isPlatformAdmin(user);
  return useQuery({
    queryKey: qk.links(role),
    queryFn: async () => {
      const data = await api.listLinks(role);
      if (data.length === 0 && admin && user) {
        // O admin ocupa o lugar dele na relação, para conversas e telas baterem com o usuário logado.
        return mock.MOCK_LINKS.map((l) =>
          role === "patient" ? { ...l, patient_id: user.id } : { ...l, professional_id: user.id },
        );
      }
      return data;
    },
    enabled,
  });
}

export function useInvites() {
  return useQuery({ queryKey: qk.invites(), queryFn: api.listInvites });
}

export function useAvailabilityRules(professionalId: string | undefined) {
  return useQuery({
    queryKey: qk.rules(professionalId ?? ""),
    queryFn: () => api.listAvailabilityRules(professionalId!),
    enabled: !!professionalId,
  });
}

export function useAvailabilityBlocks(professionalId: string | undefined) {
  return useQuery({
    queryKey: qk.blocks(professionalId ?? ""),
    queryFn: () => api.listAvailabilityBlocks(professionalId!),
    enabled: !!professionalId,
  });
}

/** Nomes/avatares de um conjunto de pessoas (cacheado por conjunto de ids). */
export function usePeople(ids: string[]) {
  const { user } = useAuth();
  const admin = isPlatformAdmin(user);
  return useQuery({
    queryKey: qk.people(ids),
    queryFn: async () => {
      const isMock = ids.some((id) => id.startsWith("mock-"));
      if (isMock && admin) {
        const map = new Map<string, any>();
        if (ids.includes("mock-patient")) {
          map.set("mock-patient", {
            id: "mock-patient",
            name: "João (Paciente Exemplo)",
            avatarUrl: null,
            bio: "Paciente de teste",
          });
        }
        if (ids.includes("mock-pro")) {
          map.set("mock-pro", {
            id: "mock-pro",
            name: "Dra. Mock (Nutricionista)",
            avatarUrl: null,
            bio: "Profissional de teste",
          });
        }
        return map;
      }
      return api.fetchPeople(ids);
    },
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePayments(appointmentIds: string[]) {
  return useQuery({
    queryKey: qk.payments(appointmentIds),
    queryFn: async () => {
      if (appointmentIds.some((id) => id.startsWith("mock-"))) return [];
      return api.listPaymentsForAppointments(appointmentIds);
    },
    enabled: appointmentIds.length > 0,
  });
}

export function usePatientPrivate(patientId: string) {
  const { user } = useAuth();
  const admin = isPlatformAdmin(user);
  return useQuery({
    queryKey: qk.patientPrivate(patientId),
    queryFn: async () => {
      if (patientId.startsWith("mock-") && admin) {
        return {
          id: "mock-patient",
          document_cpf: "111.222.333-44",
          phone: "+5511999999999",
          birth_date: "1990-01-01",
        } as any;
      }
      return api.fetchPatientPrivate(patientId);
    },
  });
}

/**
 * Mutação com toast de sucesso/erro e invalidação das consultas do módulo.
 * Por padrão invalida tudo sob ["clinical"], o que mantém as telas coerentes.
 */
export function useClinicalMutation<TVars, TResult = unknown>(
  fn: (vars: TVars) => Promise<TResult>,
  opts: {
    success?: string | ((result: TResult, vars: TVars) => string | undefined);
    invalidate?: QueryKey[];
    onSuccess?: (result: TResult, vars: TVars) => void;
  } = {},
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: async (result, vars) => {
      const keys = opts.invalidate ?? [qk.all];
      await Promise.all(keys.map((queryKey) => qc.invalidateQueries({ queryKey })));
      const msg = typeof opts.success === "function" ? opts.success(result, vars) : opts.success;
      if (msg) toast.success(msg);
      opts.onSuccess?.(result, vars);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : String(err));
    },
  });
}

const REALTIME_TABLES = [
  "appointments",
  "care_links",
  "payments",
  "messages",
  "diary_comments",
] as const;

/** Atualiza as telas quando a outra ponta agenda, confirma, paga ou responde um pedido. */
export function useClinicalRealtime(userId: string | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!userId) return;
    const channel = supabase.channel(`clinical-${userId}`);
    for (const table of REALTIME_TABLES) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        if (table === "messages") {
          void qc.invalidateQueries({ queryKey: ["clinical", "messages"] });
          void qc.invalidateQueries({ queryKey: ["clinical", "conversations"] });
          return;
        }
        if (table === "diary_comments") {
          void qc.invalidateQueries({ queryKey: ["clinical", "diary-comments"] });
          return;
        }
        void qc.invalidateQueries({ queryKey: ["clinical", "appointments"] });
        void qc.invalidateQueries({ queryKey: ["clinical", "slots"] });
        void qc.invalidateQueries({ queryKey: ["clinical", "links"] });
        void qc.invalidateQueries({ queryKey: ["clinical", "payments"] });
      });
    }
    channel.subscribe();
    // Ferramentas da consulta (avaliações e planos de cuidado) num canal à parte.
    const tools = supabase
      .channel(`clinical-tools-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "care_plans" }, () => {
        void qc.invalidateQueries({ queryKey: ["clinical", "care-plans"] });
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clinical_assessments" },
        () => {
          void qc.invalidateQueries({ queryKey: ["clinical", "assessments"] });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
      void supabase.removeChannel(tools);
    };
  }, [userId, qc]);
}

// ---------------------------------------------------------------------------
// Prontuário
// ---------------------------------------------------------------------------

export function useAnamnesis(patientId: string, professionalId: string | undefined) {
  const { user } = useAuth();
  const admin = isPlatformAdmin(user);
  return useQuery({
    queryKey: qk.anamnesis(patientId, professionalId ?? ""),
    queryFn: async () => {
      if (patientId.startsWith("mock-") && admin) {
        return {
          id: "mock-anamnesis",
          patient_id: "mock-patient",
          professional_id: "mock-pro",
          data: {
            chiefComplaint: "Desejo perder gordura e ganhar massa muscular",
            clinicalHistory: { conditions: [], surgeries: "", medications: "Nenhuma" },
            lifestyle: { physicalActivity: "Musculação 4x na semana", sleepHours: 7, waterLiters: 2 },
            eating: { mealsPerDay: 4, recall24h: "Pão de manhã, arroz e frango almoço/janta" },
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any;
      }
      return records.getAnamnesis(patientId, professionalId!);
    },
    enabled: !!professionalId,
  });
}

export function useNotes(patientId: string) {
  const { user } = useAuth();
  const admin = isPlatformAdmin(user);
  return useQuery({
    queryKey: qk.notes(patientId),
    queryFn: async () => {
      const data = await records.listNotes(patientId);
      if (data.length === 0 && admin) return mock.MOCK_NOTES;
      return data;
    },
    enabled: !!patientId,
  });
}

export function useAnthropometrics(patientId: string | undefined) {
  const { user } = useAuth();
  const admin = isPlatformAdmin(user);
  return useQuery({
    queryKey: qk.anthropometrics(patientId ?? ""),
    queryFn: async () => {
      const data = await records.listAnthropometrics(patientId!);
      if (data.length === 0 && admin) return mock.MOCK_ANTHROPOMETRICS;
      return data;
    },
    enabled: !!patientId,
  });
}

export function useMealPlans(patientId: string) {
  const { user } = useAuth();
  const admin = isPlatformAdmin(user);
  return useQuery({
    queryKey: qk.plans(patientId),
    queryFn: async () => {
      const data = await records.listMealPlans(patientId);
      if (data.length === 0 && admin) return [mock.MOCK_MEAL_PLAN];
      return data;
    },
    enabled: !!patientId,
  });
}

export function useMealPlan(planId: string) {
  const { user } = useAuth();
  const admin = isPlatformAdmin(user);
  return useQuery({
    queryKey: qk.plan(planId),
    queryFn: async () => {
      if (planId.startsWith("mock-") && admin) return mock.MOCK_MEAL_PLAN;
      const data = await records.getMealPlan(planId);
      if (!data && admin) return mock.MOCK_MEAL_PLAN;
      return data;
    },
    enabled: !!planId,
  });
}

export function useActivePlan(patientId: string | undefined) {
  const { user } = useAuth();
  const admin = isPlatformAdmin(user);
  return useQuery({
    queryKey: qk.activePlan(patientId ?? ""),
    queryFn: async () => {
      const data = await records.getActivePlan(patientId!);
      if (!data && admin) return mock.MOCK_MEAL_PLAN;
      return data;
    },
    enabled: !!patientId,
  });
}

export function useGoals(patientId: string | undefined) {
  const { user } = useAuth();
  const admin = isPlatformAdmin(user);
  return useQuery({
    queryKey: qk.goals(patientId ?? ""),
    queryFn: async () => {
      const data = await records.listGoals(patientId!);
      if (data.length === 0 && admin) return mock.MOCK_GOALS;
      return data;
    },
    enabled: !!patientId,
  });
}

export function useCheckins(patientId: string | undefined, fromDay: string) {
  const { user } = useAuth();
  const admin = isPlatformAdmin(user);
  return useQuery({
    queryKey: qk.checkins(patientId ?? "", fromDay),
    queryFn: async () => {
      const data = await records.listCheckins(patientId!, fromDay);
      if (data.length === 0 && admin) return mock.MOCK_CHECKINS;
      return data;
    },
    enabled: !!patientId,
  });
}

export function useFoodSearch(query: string) {
  const q = query.trim().toLowerCase();
  return useQuery({
    queryKey: qk.foods(q),
    queryFn: () => records.searchFoods(q),
    enabled: q.length >= 2,
    staleTime: 10 * 60 * 1000,
  });
}

// ---------------------------------------------------------------------------
// Acompanhamento (diário, mensagens, documentos)
// ---------------------------------------------------------------------------

export function useDiary(patientId: string | undefined) {
  const { user } = useAuth();
  const admin = isPlatformAdmin(user);
  return useQuery({
    queryKey: qk.diary(patientId ?? ""),
    queryFn: async () => {
      const data = await care.listDiary(patientId!);
      if (data.length === 0 && admin) return mock.MOCK_DIARY;
      return data;
    },
    enabled: !!patientId,
  });
}

export function useDiaryComments(entryIds: string[]) {
  const { user } = useAuth();
  const admin = isPlatformAdmin(user);
  return useQuery({
    queryKey: qk.diaryComments(entryIds),
    queryFn: async () => {
      if (entryIds.some((id) => id.startsWith("mock-")) && admin) return mock.MOCK_DIARY_COMMENTS;
      const data = await care.listDiaryComments(entryIds);
      if (data.length === 0 && admin) return mock.MOCK_DIARY_COMMENTS;
      return data;
    },
    enabled: entryIds.length > 0,
  });
}

export function useMessages(patientId: string | undefined, professionalId: string | undefined) {
  const { user } = useAuth();
  const admin = isPlatformAdmin(user);
  return useQuery({
    queryKey: qk.messages(patientId ?? "", professionalId ?? ""),
    queryFn: async () => {
      if (mock.isMockId(patientId) || mock.isMockId(professionalId)) {
        return admin ? mock.mockMessagesFor(patientId!, professionalId!) : [];
      }
      const data = await care.listMessages(patientId!, professionalId!);
      return data;
    },
    enabled: !!patientId && !!professionalId,
  });
}

export function useConversations(enabled = true) {
  const { user } = useAuth();
  const admin = isPlatformAdmin(user);
  return useQuery({
    queryKey: qk.conversations(),
    queryFn: async () => {
      const data = await care.listConversationSummaries();
      if (data.length === 0 && admin && user) return mock.mockConversationsFor(user.id);
      return data;
    },
    enabled,
  });
}

export function useDocuments(patientId: string | undefined) {
  const { user } = useAuth();
  const admin = isPlatformAdmin(user);
  return useQuery({
    queryKey: qk.documents(patientId ?? ""),
    queryFn: async () => {
      const data = await care.listDocuments(patientId!);
      if (data.length === 0 && admin) return mock.MOCK_DOCUMENTS;
      return data;
    },
    enabled: !!patientId,
  });
}

/** Links assinados (1 h) para arquivos privados; renovados a cada 50 min. */
export function useSignedUrls(bucket: care.Bucket, paths: (string | null | undefined)[]) {
  const list = paths.filter((p): p is string => !!p);
  return useQuery({
    queryKey: qk.signed(bucket, list),
    queryFn: async () => {
      const mockPaths = list.filter((p) => p.startsWith("mock/"));
      const real = list.filter((p) => !p.startsWith("mock/"));
      const out = real.length ? await care.signedUrls(bucket, real) : {};
      for (const p of mockPaths) out[p] = mock.mockDocumentUrl(p);
      return out;
    },
    enabled: list.length > 0,
    staleTime: 50 * 60 * 1000,
    refetchInterval: 50 * 60 * 1000,
  });
}

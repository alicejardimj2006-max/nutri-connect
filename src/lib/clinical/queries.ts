import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import * as api from "./api";

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
};

export function useDirectory() {
  return useQuery({ queryKey: qk.directory(), queryFn: api.listDirectory });
}

export function useDirectoryEntry(id: string) {
  return useQuery({ queryKey: qk.directoryEntry(id), queryFn: () => api.getDirectoryEntry(id) });
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
  return useQuery({
    queryKey: qk.appointments(params),
    queryFn: () => api.listAppointments(params),
    enabled,
  });
}

export function useLinks(role: "patient" | "professional", enabled = true) {
  return useQuery({ queryKey: qk.links(role), queryFn: () => api.listLinks(role), enabled });
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
  return useQuery({
    queryKey: qk.people(ids),
    queryFn: () => api.fetchPeople(ids),
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePayments(appointmentIds: string[]) {
  return useQuery({
    queryKey: qk.payments(appointmentIds),
    queryFn: () => api.listPaymentsForAppointments(appointmentIds),
    enabled: appointmentIds.length > 0,
  });
}

export function usePatientPrivate(patientId: string) {
  return useQuery({
    queryKey: qk.patientPrivate(patientId),
    queryFn: () => api.fetchPatientPrivate(patientId),
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

const REALTIME_TABLES = ["appointments", "care_links", "payments"] as const;

/** Atualiza as telas quando a outra ponta agenda, confirma, paga ou responde um pedido. */
export function useClinicalRealtime(userId: string | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!userId) return;
    const channel = supabase.channel(`clinical-${userId}`);
    for (const table of REALTIME_TABLES) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
        void qc.invalidateQueries({ queryKey: ["clinical", "appointments"] });
        void qc.invalidateQueries({ queryKey: ["clinical", "slots"] });
        void qc.invalidateQueries({ queryKey: ["clinical", "links"] });
        void qc.invalidateQueries({ queryKey: ["clinical", "payments"] });
      });
    }
    channel.subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, qc]);
}

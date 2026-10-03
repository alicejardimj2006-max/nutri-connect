import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./professionals";

const KEY = ["social", "professionals"] as const;

export const qkPros = {
  all: KEY,
  list: () => [...KEY, "list"] as const,
  verifications: (withImages: boolean) => [...KEY, "verifications", withImages] as const,
};

/** Profissionais verificados. A lista muda pouco: vale ficar alguns minutos em cache. */
export function useProfessionals(enabled = true) {
  return useQuery({
    queryKey: qkPros.list(),
    queryFn: api.fetchProfessionals,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/** Mesma lista, indexada pelo id da pessoa (para consultar "esta pessoa é profissional?"). */
export function useProfessionalMap(enabled = true) {
  const query = useProfessionals(enabled);
  const map = useMemo(() => new Map((query.data ?? []).map((p) => [p.userId, p])), [query.data]);
  return { map, isLoading: query.isLoading };
}

export function useVerifications(withImages = false, enabled = true) {
  return useQuery({
    queryKey: qkPros.verifications(withImages),
    queryFn: () => api.fetchVerifications(withImages),
    enabled,
  });
}

/** Recarrega profissionais e pedidos (após enviar ou analisar um pedido). */
export function useRefreshProfessionals() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: KEY });
}

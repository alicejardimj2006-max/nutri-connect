// Filtros da lista de comunidades (busca e categoria). Ficam num pequeno estado compartilhado porque
// os cards que os controlam moram nas colunas laterais do site, fora da página da lista.
import { useSyncExternalStore } from "react";

interface CommunityFilters {
  query: string;
  /** "Todas" ou o nome de uma categoria. */
  category: string;
}

const DEFAULTS: CommunityFilters = { query: "", category: "Todas" };
let state: CommunityFilters = DEFAULTS;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function setCommunityFilters(patch: Partial<CommunityFilters>) {
  state = { ...state, ...patch };
  emit();
}

export function resetCommunityFilters() {
  if (state === DEFAULTS) return;
  state = DEFAULTS;
  emit();
}

export function useCommunityFilters(): CommunityFilters {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => state,
    () => DEFAULTS,
  );
}

/** As colunas laterais estão visíveis agora? (O SideRails marca isso no <html>.) */
export function useRailsOn(): boolean {
  return useSyncExternalStore(
    (fn) => {
      const observer = new MutationObserver(fn);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-rails"] });
      return () => observer.disconnect();
    },
    () => document.documentElement.getAttribute("data-rails") === "on",
    () => false,
  );
}

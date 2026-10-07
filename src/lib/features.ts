// Funcionalidades que a administração liga e desliga (configuração "site_features").
// Desligada: some dos menus e das colunas laterais, e o endereço mostra um aviso. Administradores
// continuam entrando, com uma faixa avisando. Sem configuração, tudo fica ligado.
import { useSiteConfig } from "@/lib/site-config";

export type FeatureKey =
  "comunidades" | "desafios" | "nina" | "explorar" | "tema" | "profissionais" | "receitas";

export interface FeatureDef {
  key: FeatureKey;
  label: string;
  description: string;
  /** Endereços que pertencem à funcionalidade (o próprio e os de dentro). */
  paths: string[];
}

export const FEATURES: FeatureDef[] = [
  {
    key: "comunidades",
    label: "Comunidades",
    description: "Lista de comunidades, páginas de cada uma e publicações dentro delas.",
    paths: ["/comunidades"],
  },
  {
    key: "desafios",
    label: "Desafios",
    description: "Desafios em grupo, check-ins e a página de cada desafio.",
    paths: ["/desafios"],
  },
  {
    key: "nina",
    label: "Nina (conversa com IA)",
    description: "A conversa com a Nutri Nina. A Nina continua aparecendo como mascote.",
    paths: ["/nina"],
  },
  {
    key: "explorar",
    label: "Explorar",
    description: "Busca e descoberta de receitas, pessoas e assuntos.",
    paths: ["/explorar"],
  },
  {
    key: "tema",
    label: "Tema da semana",
    description: "A página do tema da semana e seus cards.",
    paths: ["/tema-da-semana"],
  },
  {
    key: "profissionais",
    label: "Profissionais e consultas",
    description: "Busca de profissionais, perfis, agendamento e assinatura de membros.",
    paths: ["/profissionais", "/assinar"],
  },
  {
    key: "receitas",
    label: "Receitas",
    description: "Lista e página de cada receita.",
    paths: ["/receitas"],
  },
];

export type FeatureFlags = Record<FeatureKey, boolean>;

const ALL_ON = Object.fromEntries(FEATURES.map((f) => [f.key, true])) as FeatureFlags;

export function readFeatures(raw: unknown): FeatureFlags {
  if (!raw || typeof raw !== "object") return ALL_ON;
  const r = raw as Record<string, unknown>;
  return Object.fromEntries(FEATURES.map((f) => [f.key, r[f.key] !== false])) as FeatureFlags;
}

export function useFeatures(): FeatureFlags {
  return readFeatures(useSiteConfig("site_features"));
}

/** A funcionalidade dona do endereço, se houver. */
export function featureOfPath(pathname: string): FeatureDef | null {
  const p = pathname.replace(/\/+$/, "") || "/";
  return (
    FEATURES.find((f) => f.paths.some((base) => p === base || p.startsWith(`${base}/`))) ?? null
  );
}

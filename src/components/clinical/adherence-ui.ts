// Peças do painel de adesão (M3) usadas na lista e no relatório.
import type { Names } from "@/lib/appearance-data";
import { daysSince, type AdherenceRow, type Light } from "@/lib/clinical/adherence";

export const LIGHT_STYLE: Record<Light, string> = {
  verde: "bg-primary",
  amarelo: "bg-warning",
  vermelho: "bg-destructive",
};
export const LIGHT_NAMES: Record<Light, Names> = {
  verde: ["Em dia", "On track", "Al día", "À jour"],
  amarelo: ["Oscilando", "Wavering", "Oscilando", "Irrégulier"],
  vermelho: ["Precisa de atenção", "Needs attention", "Necesita atención", "À surveiller"],
};

/** Frase curta sobre o último registro. */
export function lastSeen(row: AdherenceRow, tr: (n: Names) => string) {
  const d = daysSince(row.last_activity);
  if (d === null)
    return tr(["Ainda sem registros", "No logs yet", "Aún sin registros", "Aucun enregistrement"]);
  if (d === 0) return tr(["Registrou hoje", "Logged today", "Registró hoy", "A noté aujourd'hui"]);
  if (d === 1) return tr(["Registrou ontem", "Logged yesterday", "Registró ayer", "A noté hier"]);
  return tr([
    `Sem registrar há ${d} dias`,
    `No logs for ${d} days`,
    `Sin registrar hace ${d} días`,
    `Rien noté depuis ${d} jours`,
  ]);
}

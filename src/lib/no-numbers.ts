// Modo sem números (N7): a pessoa acompanha pela fome, saciedade e emoção, sem ver números.
// A escolha fica na conta (user_settings.no_numbers) e vale em todos os aparelhos.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Names } from "@/lib/appearance-data";
import { getMySettings, updateMySettings } from "@/lib/social/api";
import { qk } from "@/lib/social/queries";
import { useAuth } from "@/hooks/use-auth";

/** true quando a pessoa logada escolheu não ver números. */
export function useNoNumbers(): boolean {
  const { user } = useAuth();
  const settings = useQuery({ queryKey: qk.settings(), queryFn: getMySettings, enabled: !!user });
  return !!settings.data?.no_numbers;
}

export function useSetNoNumbers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (on: boolean) => updateMySettings({ no_numbers: on }),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.settings() }),
  });
}

// ---------------------------------------------------------------------------
// Escalas do diário em palavras (1 a 5)
// ---------------------------------------------------------------------------

export const HUNGER_WORDS: Names[] = [
  ["Sem fome", "Not hungry", "Sin hambre", "Pas faim"],
  ["Pouca fome", "A little hungry", "Poca hambre", "Un peu faim"],
  ["Fome", "Hungry", "Hambre", "Faim"],
  ["Bastante fome", "Quite hungry", "Bastante hambre", "Assez faim"],
  ["Muita fome", "Very hungry", "Mucha hambre", "Très faim"],
];

export const SATIETY_WORDS: Names[] = [
  ["Ainda com fome", "Still hungry", "Aún con hambre", "Encore faim"],
  ["Quase satisfeito(a)", "Almost satisfied", "Casi satisfecho(a)", "Presque rassasié(e)"],
  ["Satisfeito(a)", "Satisfied", "Satisfecho(a)", "Rassasié(e)"],
  ["Bem cheio(a)", "Quite full", "Bastante lleno(a)", "Bien rempli(e)"],
  ["Cheio(a) demais", "Too full", "Demasiado lleno(a)", "Trop plein(e)"],
];

// ---------------------------------------------------------------------------
// Como me senti (diário) e sinais de alerta
// ---------------------------------------------------------------------------

export type Feeling =
  | "tranquilidade"
  | "prazer"
  | "gratidao"
  | "pressa"
  | "distracao"
  | "tedio"
  | "ansiedade"
  | "tristeza"
  | "culpa"
  | "compulsao"
  | "escondido"
  | "compensar"
  | "restricao"
  | "purgar";

export const FEELINGS: { id: Feeling; label: Names; alert?: boolean }[] = [
  { id: "tranquilidade", label: ["Tranquilidade", "Calm", "Tranquilidad", "Sérénité"] },
  { id: "prazer", label: ["Prazer", "Enjoyment", "Placer", "Plaisir"] },
  { id: "gratidao", label: ["Gratidão", "Gratitude", "Gratitud", "Gratitude"] },
  { id: "pressa", label: ["Pressa", "Rushed", "Prisa", "Pressé(e)"] },
  {
    id: "distracao",
    label: [
      "Distração (tela)",
      "Distracted (screen)",
      "Distracción (pantalla)",
      "Distrait(e) (écran)",
    ],
  },
  { id: "tedio", label: ["Tédio", "Boredom", "Aburrimiento", "Ennui"] },
  { id: "ansiedade", label: ["Ansiedade", "Anxiety", "Ansiedad", "Anxiété"] },
  { id: "tristeza", label: ["Tristeza", "Sadness", "Tristeza", "Tristesse"] },
  {
    id: "culpa",
    label: ["Culpa forte", "Strong guilt", "Culpa fuerte", "Forte culpabilité"],
    alert: true,
  },
  {
    id: "compulsao",
    label: ["Perdi o controle", "Lost control", "Perdí el control", "Perte de contrôle"],
    alert: true,
  },
  {
    id: "escondido",
    label: ["Comi escondido(a)", "Ate in secret", "Comí a escondidas", "Mangé en cachette"],
    alert: true,
  },
  {
    id: "compensar",
    label: [
      "Quis compensar depois",
      "Wanted to make up for it",
      "Quise compensar después",
      "Envie de compenser",
    ],
    alert: true,
  },
  {
    id: "restricao",
    label: [
      "Pulei por medo de comer",
      "Skipped out of fear",
      "Me salté por miedo",
      "Sauté par peur",
    ],
    alert: true,
  },
  {
    id: "purgar",
    label: [
      "Vomitei ou usei laxante",
      "Vomited or used laxatives",
      "Vomité o usé laxantes",
      "Vomi ou pris des laxatifs",
    ],
    alert: true,
  },
];

export const ALERT_FEELINGS = new Set<string>(FEELINGS.filter((f) => f.alert).map((f) => f.id));

export const hasAlert = (feelings: readonly string[] | null | undefined) =>
  (feelings ?? []).some((f) => ALERT_FEELINGS.has(f));

export const feelingLabel = (id: string) => FEELINGS.find((f) => f.id === id)?.label;

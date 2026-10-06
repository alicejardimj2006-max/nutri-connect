// Pontuação, níveis e funções liberadas dos profissionais (regras e cálculo ficam no banco:
// ver supabase/migrations/20261005150000_pro_score.sql). Aqui só lemos.

import { supabase } from "@/integrations/supabase/client";
import type { Names } from "@/lib/appearance-data";

export const PRO_LEVEL_NAMES: Record<string, Names> = {
  iniciante: ["Iniciante", "Beginner", "Principiante", "Débutant"],
  ativo: ["Ativo", "Active", "Activo", "Actif"],
  destaque: ["Destaque", "Rising", "Destacado", "En vue"],
  referencia: ["Referência", "Reference", "Referencia", "Référence"],
  excelencia: ["Excelência", "Excellence", "Excelencia", "Excellence"],
};

export const PRO_FEATURE_NAMES: Record<string, Names> = {
  comunidade_admin: [
    "Administrar comunidades",
    "Manage communities",
    "Administrar comunidades",
    "Administrer des communautés",
  ],
  perfil_membros: [
    "Perfil de membros (assinatura paga)",
    "Members profile (paid subscription)",
    "Perfil de miembros (suscripción de pago)",
    "Profil membres (abonnement payant)",
  ],
  conteudo_exclusivo: [
    "Conteúdo exclusivo para membros",
    "Members-only content",
    "Contenido exclusivo para miembros",
    "Contenu réservé aux membres",
  ],
  desconto_membros: [
    "Desconto em consultas para membros",
    "Consultation discount for members",
    "Descuento en consultas para miembros",
    "Réduction sur les consultations pour les membres",
  ],
  destaque_busca: [
    "Destaque nas buscas",
    "Highlighted in search",
    "Destacado en las búsquedas",
    "Mis en avant dans les recherches",
  ],
  selo_excelencia: [
    "Selo de excelência no perfil",
    "Excellence badge on profile",
    "Sello de excelencia en el perfil",
    "Badge d'excellence sur le profil",
  ],
};

export const PRO_EVENT_NAMES: Record<string, Names> = {
  verificacao: ["Perfil verificado", "Profile verified", "Perfil verificado", "Profil vérifié"],
  post_publicado: ["Publicação", "Post", "Publicación", "Publication"],
  receita_publicada: ["Receita publicada", "Recipe posted", "Receta publicada", "Recette publiée"],
  resposta_pergunta: [
    "Resposta a uma pergunta",
    "Answer to a question",
    "Respuesta a una pregunta",
    "Réponse à une question",
  ],
  comentario: ["Comentário", "Comment", "Comentario", "Commentaire"],
  tema_post: [
    "Publicação no tema da semana",
    "Post on the weekly theme",
    "Publicación en el tema de la semana",
    "Publication sur le thème de la semaine",
  ],
  tema_voto: [
    "Voto no tema da semana",
    "Weekly theme vote",
    "Voto en el tema de la semana",
    "Vote sur le thème de la semaine",
  ],
  apoio_recebido: ["Apoio recebido", "Support received", "Apoyo recibido", "Soutien reçu"],
  consulta_realizada: [
    "Consulta realizada",
    "Consultation held",
    "Consulta realizada",
    "Consultation réalisée",
  ],
  denuncia_procedente: [
    "Denúncia procedente",
    "Upheld report",
    "Denuncia procedente",
    "Signalement fondé",
  ],
  cancelamento_tardio: [
    "Cancelamento em cima da hora",
    "Late cancellation",
    "Cancelación de última hora",
    "Annulation tardive",
  ],
  ausencia: ["Ausência", "Absence", "Ausencia", "Absence"],
  conta_suspensa: ["Conta suspensa", "Account suspended", "Cuenta suspendida", "Compte suspendu"],
  ajuste_admin: [
    "Ajuste da administração",
    "Admin adjustment",
    "Ajuste de la administración",
    "Ajustement de l'administration",
  ],
};

export interface ProStatus {
  professionalId: string;
  level: number;
  levelCode: string;
  excellence: boolean;
  /** Só o dono e a administração veem a pontuação exata e o próximo nível. */
  score?: number;
  nextLevel?: number;
  nextLevelCode?: string;
  nextLevelScore?: number;
  feePercent: number;
  features: string[];
}

export interface ProScoreEvent {
  id: string;
  kind: string;
  points: number;
  note?: string;
  createdAt: string;
}

export interface ProRules {
  levels: { level: number; code: string; min_score: number; membership_fee_percent: number }[];
  rules: { kind: string; points: number; daily_cap: number | null; description: string }[];
  features: { feature: string; min_level: number; description: string }[];
}

export async function fetchProStatus(professionalId: string): Promise<ProStatus | null> {
  const { data, error } = await supabase.rpc("get_pro_status", { p_pro: professionalId });
  if (error) throw new Error(error.message);
  const row = data?.[0];
  if (!row) return null;
  return {
    professionalId: row.professional_id,
    level: row.level,
    levelCode: row.level_code,
    excellence: row.excellence,
    score: row.score ?? undefined,
    nextLevel: row.next_level ?? undefined,
    nextLevelCode: row.next_level_code ?? undefined,
    nextLevelScore: row.next_level_score ?? undefined,
    feePercent: row.fee_percent,
    features: row.features,
  };
}

export async function fetchMyProEvents(limit = 30): Promise<ProScoreEvent[]> {
  const { data, error } = await supabase.rpc("get_my_pro_events", { p_limit: limit });
  if (error) throw new Error(error.message);
  return (data ?? []).map((e) => ({
    id: e.id,
    kind: e.kind,
    points: e.points,
    note: e.note ?? undefined,
    createdAt: e.created_at,
  }));
}

export async function fetchProRules(): Promise<ProRules | null> {
  const { data, error } = await supabase.rpc("get_pro_rules");
  if (error) throw new Error(error.message);
  return (data as unknown as ProRules | null) ?? null;
}

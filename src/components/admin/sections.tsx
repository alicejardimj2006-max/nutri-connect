// Lista das seções do console de administração (menu lateral).
import {
  BadgeCheck,
  Banknote,
  Brain,
  CalendarDays,
  Flag,
  FileText,
  History,
  Inbox,
  LayoutDashboard,
  Megaphone,
  Presentation,
  Settings,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type SectionId =
  | "visao"
  | "usuarios"
  | "verificacoes"
  | "contato"
  | "posts"
  | "moderacao"
  | "comunidades"
  | "temas"
  | "apresentacao"
  | "anuncios"
  | "financeiro"
  | "ia"
  | "config"
  | "auditoria";

export interface SectionDef {
  id: SectionId;
  label: string;
  icon: LucideIcon;
  group: string;
}

export const SECTIONS: SectionDef[] = [
  { id: "visao", label: "Visão geral", icon: LayoutDashboard, group: "Painel" },
  { id: "usuarios", label: "Pessoas", icon: Users, group: "Pessoas" },
  { id: "verificacoes", label: "Verificações", icon: BadgeCheck, group: "Pessoas" },
  { id: "contato", label: "Fale conosco", icon: Inbox, group: "Pessoas" },
  { id: "posts", label: "Publicações", icon: FileText, group: "Conteúdo" },
  { id: "moderacao", label: "Moderação", icon: Flag, group: "Conteúdo" },
  { id: "comunidades", label: "Comunidades", icon: UsersRound, group: "Conteúdo" },
  { id: "temas", label: "Temas da semana", icon: CalendarDays, group: "Conteúdo" },
  { id: "apresentacao", label: "Apresentação", icon: Presentation, group: "Conteúdo" },
  { id: "anuncios", label: "Anúncios", icon: Megaphone, group: "Conteúdo" },
  { id: "financeiro", label: "Financeiro", icon: Banknote, group: "Negócio" },
  { id: "ia", label: "Inteligência artificial", icon: Brain, group: "Sistema" },
  { id: "config", label: "Configurações", icon: Settings, group: "Sistema" },
  { id: "auditoria", label: "Auditoria", icon: History, group: "Sistema" },
];

export const isSectionId = (v: unknown): v is SectionId => SECTIONS.some((s) => s.id === v);

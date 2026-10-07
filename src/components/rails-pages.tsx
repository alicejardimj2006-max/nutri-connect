// Quais cards cada página mostra nas laterais (em telas largas). Cada tela tem os seus.
// O padrão fica aqui; a administração pode trocar quais cards aparecem, a ordem e o lado de cada
// página (configuração "site_rails"), sem mexer no código.
import type { ReactNode } from "react";
import {
  ChallengeInfoCard,
  ChallengeStatsCard,
  CommunityAboutCard,
  CommunityCategoriesCard,
  CommunitySearchCard,
  CommunityMembersCard,
  CommunityRulesCard,
  ContactCard,
  EducationalNoticeCard,
  FriendsCard,
  HowBookingCard,
  LegalLinksCard,
  MyChallengesCard,
  MyCommunitiesCard,
  NinaTopicsCard,
  NinaUsageCard,
  NotificationsHelpCard,
  ProfessionalsCard,
  ProfileCard,
  ProTasksCard,
  SearchTipsCard,
  SecurityTipsCard,
  SettingsNavCard,
  ShortcutsCard,
  SuggestedCommunitiesCard,
  TopRecipesCard,
  TrailCard,
  UpcomingAppointmentsCard,
  WeeklyThemeCard,
} from "@/components/rail-cards";
import {
  CommunityRouletteCard,
  CookingTimerCard,
  DailyTipCard,
  ExploreTopicsCard,
  HabitCheckinCard,
  HydrationCard,
  IcebreakerCard,
  MindfulMealCard,
  MoodCard,
  PlateBuilderCard,
  ProMatchCard,
  QuizCard,
  RecipeRouletteCard,
  ShoppingListCard,
  UnitConverterCard,
  WeeklyPledgeCard,
} from "@/components/fun-cards";

export interface RailSet {
  left: ReactNode;
  right: ReactNode;
  /**
   * A página tem a altura da tela e não rola (ex.: conversa da Nina): o que não couber nas colunas
   * não vai para a seção "Mais" do fim da página. Por isso os cards ficam em ordem de importância.
   */
  locked?: boolean;
}

/** O que a página informa aos cards que dependem dela (comunidade aberta, desafio aberto). */
export interface RailContext {
  slug?: string;
  challengeId?: string;
  /** Quantas comunidades sugerir. */
  suggest?: number;
}

export type RailGroup =
  | "Você"
  | "Comunidades"
  | "Desafios e trilha"
  | "Cozinha"
  | "Bem-estar"
  | "Profissionais"
  | "Nina"
  | "Ajuda e conta";

export interface RailCardDef {
  label: string;
  group: RailGroup;
  /** Só funciona numa página de comunidade ou de desafio. */
  needs?: "slug" | "challengeId";
  render: (ctx: RailContext) => ReactNode;
}

export const RAIL_CARDS: Record<string, RailCardDef> = {
  perfil: { label: "Meu perfil", group: "Você", render: () => <ProfileCard /> },
  amigos: { label: "Amigos", group: "Você", render: () => <FriendsCard /> },
  humor: { label: "Como estou hoje", group: "Você", render: () => <MoodCard /> },
  hidratacao: { label: "Água do dia", group: "Bem-estar", render: () => <HydrationCard /> },
  "dica-do-dia": { label: "Dica do dia", group: "Bem-estar", render: () => <DailyTipCard /> },
  "refeicao-consciente": {
    label: "Refeição consciente",
    group: "Bem-estar",
    render: () => <MindfulMealCard />,
  },
  "habito-checkin": {
    label: "Check-in de hábito",
    group: "Bem-estar",
    render: () => <HabitCheckinCard />,
  },
  compromisso: {
    label: "Compromisso da semana",
    group: "Bem-estar",
    render: () => <WeeklyPledgeCard />,
  },
  quiz: { label: "Quiz", group: "Bem-estar", render: () => <QuizCard /> },
  "minhas-comunidades": {
    label: "Minhas comunidades",
    group: "Comunidades",
    render: () => <MyCommunitiesCard />,
  },
  "comunidades-sugeridas": {
    label: "Comunidades sugeridas",
    group: "Comunidades",
    render: (ctx) => <SuggestedCommunitiesCard limit={ctx.suggest ?? 3} />,
  },
  "buscar-comunidades": {
    label: "Buscar comunidades",
    group: "Comunidades",
    render: () => <CommunitySearchCard />,
  },
  "categorias-comunidades": {
    label: "Categorias de comunidades",
    group: "Comunidades",
    render: () => <CommunityCategoriesCard />,
  },
  "roleta-comunidades": {
    label: "Roleta de comunidades",
    group: "Comunidades",
    render: () => <CommunityRouletteCard />,
  },
  "quebra-gelo": { label: "Quebra-gelo", group: "Comunidades", render: () => <IcebreakerCard /> },
  "regras-comunidade": {
    label: "Regras da comunidade",
    group: "Comunidades",
    render: () => <CommunityRulesCard />,
  },
  "sobre-comunidade": {
    label: "Sobre esta comunidade",
    group: "Comunidades",
    needs: "slug",
    render: (ctx) => (ctx.slug ? <CommunityAboutCard slug={ctx.slug} /> : null),
  },
  "membros-comunidade": {
    label: "Membros desta comunidade",
    group: "Comunidades",
    needs: "slug",
    render: (ctx) => (ctx.slug ? <CommunityMembersCard slug={ctx.slug} /> : null),
  },
  trilha: { label: "Trilha (com a Nina)", group: "Desafios e trilha", render: () => <TrailCard /> },
  "tema-da-semana": {
    label: "Tema da semana",
    group: "Desafios e trilha",
    render: () => <WeeklyThemeCard />,
  },
  "meus-desafios": {
    label: "Meus desafios",
    group: "Desafios e trilha",
    render: () => <MyChallengesCard />,
  },
  "estatisticas-desafios": {
    label: "Estatísticas de desafios",
    group: "Desafios e trilha",
    render: () => <ChallengeStatsCard />,
  },
  "info-desafio": {
    label: "Sobre este desafio",
    group: "Desafios e trilha",
    needs: "challengeId",
    render: (ctx) => (ctx.challengeId ? <ChallengeInfoCard id={ctx.challengeId} /> : null),
  },
  "receitas-em-alta": {
    label: "Receitas em alta",
    group: "Cozinha",
    render: () => <TopRecipesCard />,
  },
  "monte-o-prato": { label: "Monte o prato", group: "Cozinha", render: () => <PlateBuilderCard /> },
  "roleta-receitas": {
    label: "Roleta de receitas",
    group: "Cozinha",
    render: () => <RecipeRouletteCard />,
  },
  cronometro: {
    label: "Cronômetro de cozinha",
    group: "Cozinha",
    render: () => <CookingTimerCard />,
  },
  conversor: {
    label: "Conversor de medidas",
    group: "Cozinha",
    render: () => <UnitConverterCard />,
  },
  "lista-compras": {
    label: "Lista de compras",
    group: "Cozinha",
    render: () => <ShoppingListCard />,
  },
  "temas-explorar": {
    label: "Temas para explorar",
    group: "Cozinha",
    render: () => <ExploreTopicsCard />,
  },
  "dicas-busca": { label: "Dicas de busca", group: "Cozinha", render: () => <SearchTipsCard /> },
  profissionais: {
    label: "Profissionais",
    group: "Profissionais",
    render: () => <ProfessionalsCard />,
  },
  "match-profissional": {
    label: "Encontre seu profissional",
    group: "Profissionais",
    render: () => <ProMatchCard />,
  },
  "proximas-consultas": {
    label: "Próximas consultas",
    group: "Profissionais",
    render: () => <UpcomingAppointmentsCard />,
  },
  "como-agendar": {
    label: "Como agendar",
    group: "Profissionais",
    render: () => <HowBookingCard />,
  },
  "tarefas-profissional": {
    label: "Tarefas do profissional",
    group: "Profissionais",
    render: () => <ProTasksCard />,
  },
  "aviso-educativo": {
    label: "Aviso educativo",
    group: "Profissionais",
    render: () => <EducationalNoticeCard />,
  },
  "temas-nina": { label: "Assuntos com a Nina", group: "Nina", render: () => <NinaTopicsCard /> },
  "uso-nina": { label: "Uso da Nina", group: "Nina", render: () => <NinaUsageCard /> },
  atalhos: { label: "Atalhos", group: "Ajuda e conta", render: () => <ShortcutsCard /> },
  "menu-configuracoes": {
    label: "Menu de configurações",
    group: "Ajuda e conta",
    render: () => <SettingsNavCard />,
  },
  "dicas-seguranca": {
    label: "Dicas de segurança",
    group: "Ajuda e conta",
    render: () => <SecurityTipsCard />,
  },
  contato: { label: "Fale conosco", group: "Ajuda e conta", render: () => <ContactCard /> },
  "links-legais": {
    label: "Termos e privacidade",
    group: "Ajuda e conta",
    render: () => <LegalLinksCard />,
  },
  "ajuda-notificacoes": {
    label: "Ajuda das notificações",
    group: "Ajuda e conta",
    render: () => <NotificationsHelpCard />,
  },
};

export interface RailPageDef {
  key: string;
  label: string;
  /** Contexto da página, ou null se o endereço não for dela. Sem `match`, a página monta as colunas sozinha (Espaço). */
  match?: (p: string) => RailContext | null;
  /** Contexto que a página oferece aos cards (para o admin saber quais cabem nela). */
  provides?: "slug" | "challengeId";
  locked?: boolean;
  left: string[];
  right: string[];
}

const last = (path: string) => path.split("/").filter(Boolean).pop() ?? "";
const exact =
  (...paths: string[]) =>
  (p: string): RailContext | null =>
    paths.includes(p) ? {} : null;

export const RAIL_PAGES: RailPageDef[] = [
  {
    key: "espaco",
    label: "Espaço (início)",
    left: ["perfil", "minhas-comunidades", "amigos", "hidratacao"],
    right: ["trilha", "tema-da-semana", "meus-desafios", "dica-do-dia", "comunidades-sugeridas"],
  },
  {
    key: "comunidades",
    label: "Comunidades",
    match: (p) => (p === "/comunidades" ? { suggest: 4 } : null),
    left: ["buscar-comunidades", "categorias-comunidades", "minhas-comunidades"],
    right: ["roleta-comunidades", "quebra-gelo", "comunidades-sugeridas", "regras-comunidade"],
  },
  {
    key: "comunidade",
    label: "Página de uma comunidade",
    provides: "slug",
    match: (p) => (/^\/comunidades\/[^/]+$/.test(p) ? { slug: last(p) } : null),
    left: ["sobre-comunidade", "quebra-gelo", "minhas-comunidades"],
    right: ["membros-comunidade", "roleta-comunidades", "comunidades-sugeridas"],
  },
  {
    key: "desafios",
    label: "Desafios",
    match: exact("/desafios"),
    left: ["perfil", "estatisticas-desafios", "habito-checkin"],
    // A Nina chama para a trilha: tem lugar garantido numa das colunas.
    right: ["trilha", "meus-desafios", "quiz", "tema-da-semana"],
  },
  {
    key: "desafio",
    label: "Página de um desafio",
    provides: "challengeId",
    match: (p) => (/^\/desafios\/[^/]+$/.test(p) ? { challengeId: last(p) } : null),
    left: ["info-desafio", "estatisticas-desafios", "habito-checkin"],
    right: ["meus-desafios", "quiz", "trilha"],
  },
  {
    key: "explorar",
    label: "Explorar",
    locked: true,
    match: exact("/explorar"),
    left: ["temas-explorar", "receitas-em-alta", "monte-o-prato", "amigos"],
    right: ["roleta-receitas", "cronometro", "conversor", "lista-compras", "dicas-busca"],
  },
  {
    key: "tema-da-semana",
    label: "Tema da semana",
    match: exact("/tema-da-semana"),
    left: ["perfil", "compromisso", "meus-desafios"],
    right: ["receitas-em-alta", "quiz", "trilha"],
  },
  {
    key: "nina",
    label: "Nina",
    locked: true,
    match: exact("/nina"),
    left: ["temas-nina", "uso-nina", "humor"],
    right: ["aviso-educativo", "quiz", "refeicao-consciente", "trilha"],
  },
  {
    key: "notificacoes",
    label: "Notificações",
    match: exact("/notificacoes"),
    left: ["perfil", "dica-do-dia", "ajuda-notificacoes"],
    right: ["compromisso", "amigos", "meus-desafios"],
  },
  {
    key: "profissionais",
    label: "Profissionais",
    match: exact("/profissionais"),
    left: ["match-profissional", "perfil", "proximas-consultas"],
    right: ["como-agendar", "aviso-educativo", "comunidades-sugeridas"],
  },
  {
    key: "profissional",
    label: "Página de um profissional",
    match: (p) => (/^\/profissionais\/[^/]+$/.test(p) ? {} : null),
    left: ["perfil", "proximas-consultas"],
    right: ["como-agendar", "aviso-educativo", "comunidades-sugeridas"],
  },
  {
    key: "configuracoes",
    label: "Configurações do perfil",
    match: (p) =>
      p === "/perfil/configuracoes" ||
      p.startsWith("/perfil/configuracoes/") ||
      p === "/perfil/personalizacao" ||
      p === "/perfil/editar"
        ? {}
        : null,
    left: ["perfil", "menu-configuracoes"],
    right: ["dicas-seguranca", "contato", "links-legais"],
  },
  {
    key: "institucionais",
    label: "Sobre, contato e termos",
    match: exact("/sobre", "/contato", "/termos", "/privacidade", "/diretrizes"),
    left: ["links-legais", "contato"],
    right: ["perfil", "atalhos", "aviso-educativo"],
  },
  {
    key: "convites",
    label: "Convites e verificação",
    match: exact("/convites", "/verificacao"),
    left: ["perfil", "atalhos"],
    right: ["regras-comunidade", "contato", "links-legais"],
  },
];

/** Escolha da administração por página: quais cards em cada lado, na ordem. */
export type RailOverrides = Record<string, { left: string[]; right: string[] }>;

/** Lê a configuração salva, descartando cards que não existem mais. */
export function readRailOverrides(raw: unknown): RailOverrides {
  if (!raw || typeof raw !== "object") return {};
  const ids = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x in RAIL_CARDS) : [];
  return Object.fromEntries(
    Object.entries(raw as Record<string, { left?: unknown; right?: unknown }>)
      .filter(([k, v]) => RAIL_PAGES.some((p) => p.key === k) && v && typeof v === "object")
      .map(([k, v]) => [k, { left: ids(v.left), right: ids(v.right) }]),
  );
}

/** Lados da página: a escolha da administração, ou o padrão do código. */
export function railSidesOf(page: RailPageDef, overrides: RailOverrides = {}) {
  return overrides[page.key] ?? { left: page.left, right: page.right };
}

/** Os cards de uma lista, prontos para desenhar (cada um com a sua chave). */
export function renderRailCards(ids: string[], ctx: RailContext): ReactNode[] {
  return ids.flatMap((id) => {
    const def = RAIL_CARDS[id];
    if (!def) return [];
    const node = def.render(ctx);
    return node ? [<RailSlot key={id}>{node}</RailSlot>] : [];
  });
}

function RailSlot({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/** Cards das colunas laterais da página em `pathname`, ou null se a página não usa colunas. */
export function railsFor(pathname: string, overrides: RailOverrides = {}): RailSet | null {
  const p = pathname.replace(/\/+$/, "") || "/";
  for (const page of RAIL_PAGES) {
    const ctx = page.match?.(p);
    if (!ctx) continue;
    const sides = railSidesOf(page, overrides);
    return {
      locked: page.locked,
      left: <>{renderRailCards(sides.left, ctx)}</>,
      right: <>{renderRailCards(sides.right, ctx)}</>,
    };
  }
  // O perfil de cada pessoa é um espaço livre montado por ela: não usa as colunas laterais do site.
  return null;
}

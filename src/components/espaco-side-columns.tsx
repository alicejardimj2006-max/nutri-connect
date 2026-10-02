import {
  ChallengesPanel,
  MyCommunitiesPanel,
  ProfessionalsPanel,
  ProfileSummaryCard,
  ShortcutsPanel,
  SuggestedCommunitiesPanel,
  TrailCard,
  WeeklyThemePanel,
} from "@/components/side-panels";

/** Coluna esquerda: quem sou eu na rede, minhas comunidades e atalhos. */
export function EspacoLeftColumn() {
  return (
    <aside className="space-y-5 text-left">
      <ProfileSummaryCard />
      <MyCommunitiesPanel />
      <ShortcutsPanel />
    </aside>
  );
}

/** Coluna direita: trilha com a Nina, tema da semana, desafios e sugestões. */
export function EspacoRightColumn() {
  return (
    <aside className="space-y-5 text-left">
      <TrailCard />
      <WeeklyThemePanel />
      <ChallengesPanel />
      <SuggestedCommunitiesPanel />
      <ProfessionalsPanel />
    </aside>
  );
}

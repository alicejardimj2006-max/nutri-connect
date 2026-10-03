import {
  MyChallengesCard,
  MyCommunitiesCard,
  ProfessionalsCard,
  ProfileCard,
  SuggestedCommunitiesCard,
  TrailCard,
  WeeklyThemeCard,
} from "@/components/rail-cards";

/** Coluna esquerda do Espaço: quem sou eu na rede e minhas comunidades. */
export function EspacoLeftColumn() {
  return (
    <aside className="space-y-5 text-left">
      <ProfileCard />
      <MyCommunitiesCard />
    </aside>
  );
}

/** Coluna direita do Espaço: trilha com a Nina, tema da semana, desafios e sugestões. */
export function EspacoRightColumn() {
  return (
    <aside className="space-y-5 text-left">
      <TrailCard />
      <WeeklyThemeCard />
      <MyChallengesCard />
      <SuggestedCommunitiesCard />
      <ProfessionalsCard />
    </aside>
  );
}

import {
  FriendsCard,
  MyChallengesCard,
  MyCommunitiesCard,
  ProfileCard,
  SuggestedCommunitiesCard,
  TrailCard,
  WeeklyThemeCard,
} from "@/components/rail-cards";
import { DailyTipCard, HydrationCard } from "@/components/fun-cards";
import { Wing } from "@/components/rails-wing";

/** Lateral esquerda do Espaço: quem sou eu na rede, comunidades, amigos e a água do dia. */
export function EspacoLeftColumn() {
  return (
    <Wing>
      <ProfileCard />
      <MyCommunitiesCard />
      <FriendsCard />
      <HydrationCard />
    </Wing>
  );
}

/** Lateral direita do Espaço: trilha com a Nina, tema da semana, desafios, dica do dia e sugestões. */
export function EspacoRightColumn() {
  return (
    <Wing>
      <TrailCard />
      <WeeklyThemeCard />
      <MyChallengesCard />
      <DailyTipCard />
      <SuggestedCommunitiesCard limit={4} />
    </Wing>
  );
}

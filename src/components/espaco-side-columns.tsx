import {
  FriendsCard,
  MyChallengesCard,
  MyCommunitiesCard,
  NotificationsHelpCard,
  ProfessionalsCard,
  ProfileCard,
  ShortcutsCard,
  SuggestedCommunitiesCard,
  TopRecipesCard,
  TrailCard,
  UpcomingAppointmentsCard,
  WeeklyThemeCard,
} from "@/components/rail-cards";
import { Wing } from "@/components/rails-wing";

/** Lateral esquerda do Espaço: quem sou eu na rede, comunidades, atalhos e amigos. */
export function EspacoLeftColumn() {
  return (
    <Wing>
      <ProfileCard />
      <MyCommunitiesCard />
      <ShortcutsCard />
      <FriendsCard />
      <UpcomingAppointmentsCard />
      <NotificationsHelpCard />
    </Wing>
  );
}

/** Lateral direita do Espaço: trilha com a Nina, tema da semana, desafios, receitas e sugestões. */
export function EspacoRightColumn() {
  return (
    <Wing>
      <TrailCard />
      <WeeklyThemeCard />
      <MyChallengesCard />
      <TopRecipesCard />
      <SuggestedCommunitiesCard limit={4} />
      <ProfessionalsCard />
    </Wing>
  );
}

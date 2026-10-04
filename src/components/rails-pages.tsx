// Quais cards cada página mostra nas laterais (em telas largas). Cada tela tem os seus.
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

const last = (path: string) => path.split("/").filter(Boolean).pop() ?? "";

/** Cards das colunas laterais da página em `pathname`, ou null se a página não usa colunas. */
export function railsFor(pathname: string): RailSet | null {
  const p = pathname.replace(/\/+$/, "") || "/";

  if (p === "/comunidades") {
    return {
      left: (
        <>
          <CommunitySearchCard />
          <CommunityCategoriesCard />
          <MyCommunitiesCard />
        </>
      ),
      right: (
        <>
          <CommunityRouletteCard />
          <IcebreakerCard />
          <SuggestedCommunitiesCard limit={4} />
          <CommunityRulesCard />
        </>
      ),
    };
  }
  if (/^\/comunidades\/[^/]+$/.test(p)) {
    const slug = last(p);
    return {
      left: (
        <>
          <CommunityAboutCard slug={slug} />
          <IcebreakerCard />
          <MyCommunitiesCard />
        </>
      ),
      right: (
        <>
          <CommunityMembersCard slug={slug} />
          <CommunityRouletteCard />
          <SuggestedCommunitiesCard />
        </>
      ),
    };
  }
  if (p === "/desafios") {
    return {
      left: (
        <>
          <ProfileCard />
          <ChallengeStatsCard />
          <HabitCheckinCard />
        </>
      ),
      right: (
        <>
          <MyChallengesCard />
          <QuizCard />
          <WeeklyThemeCard />
          <TrailCard />
        </>
      ),
    };
  }
  if (/^\/desafios\/[^/]+$/.test(p)) {
    return {
      left: (
        <>
          <ChallengeInfoCard id={last(p)} />
          <ChallengeStatsCard />
          <HabitCheckinCard />
        </>
      ),
      right: (
        <>
          <MyChallengesCard />
          <QuizCard />
          <TrailCard />
        </>
      ),
    };
  }
  if (p === "/explorar") {
    // A página tem a altura da tela (como o Espaço): o que não couber nas colunas não aparece.
    return {
      locked: true,
      left: (
        <>
          <ExploreTopicsCard />
          <TopRecipesCard />
          <PlateBuilderCard />
          <FriendsCard />
        </>
      ),
      right: (
        <>
          <RecipeRouletteCard />
          <CookingTimerCard />
          <UnitConverterCard />
          <ShoppingListCard />
          <SearchTipsCard />
        </>
      ),
    };
  }
  if (p === "/tema-da-semana") {
    return {
      left: (
        <>
          <ProfileCard />
          <WeeklyPledgeCard />
          <MyChallengesCard />
        </>
      ),
      right: (
        <>
          <TopRecipesCard />
          <QuizCard />
          <TrailCard />
        </>
      ),
    };
  }
  if (p === "/nina") {
    return {
      locked: true,
      left: (
        <>
          <NinaTopicsCard />
          <NinaUsageCard />
          <MoodCard />
        </>
      ),
      right: (
        <>
          <EducationalNoticeCard />
          <QuizCard />
          <MindfulMealCard />
          <TrailCard />
        </>
      ),
    };
  }
  if (p === "/notificacoes") {
    return {
      left: (
        <>
          <ProfileCard />
          <DailyTipCard />
          <NotificationsHelpCard />
        </>
      ),
      right: (
        <>
          <WeeklyPledgeCard />
          <FriendsCard />
          <MyChallengesCard />
        </>
      ),
    };
  }
  // O perfil de cada pessoa é um espaço livre montado por ela: não usa as colunas laterais do site.
  if (p === "/profissionais") {
    return {
      left: (
        <>
          <ProMatchCard />
          <ProfileCard />
          <UpcomingAppointmentsCard />
        </>
      ),
      right: (
        <>
          <HowBookingCard />
          <EducationalNoticeCard />
          <SuggestedCommunitiesCard />
        </>
      ),
    };
  }
  if (/^\/profissionais\/[^/]+$/.test(p)) {
    return {
      left: (
        <>
          <ProfileCard />
          <UpcomingAppointmentsCard />
        </>
      ),
      right: (
        <>
          <HowBookingCard />
          <EducationalNoticeCard />
          <SuggestedCommunitiesCard />
        </>
      ),
    };
  }
  if (p === "/perfil/configuracoes" || p.startsWith("/perfil/configuracoes/") || p === "/perfil/personalizacao" || p === "/perfil/editar") {
    return {
      left: (
        <>
          <ProfileCard />
          <SettingsNavCard />
        </>
      ),
      right: (
        <>
          <SecurityTipsCard />
          <ContactCard />
          <LegalLinksCard />
        </>
      ),
    };
  }
  if (["/sobre", "/contato", "/termos", "/privacidade", "/diretrizes"].includes(p)) {
    return {
      left: (
        <>
          <LegalLinksCard />
          <ContactCard />
        </>
      ),
      right: (
        <>
          <ProfileCard />
          <ShortcutsCard />
          <EducationalNoticeCard />
        </>
      ),
    };
  }
  if (p === "/convites" || p === "/verificacao") {
    return {
      left: (
        <>
          <ProfileCard />
          <ShortcutsCard />
        </>
      ),
      right: (
        <>
          <HowBookingCard />
          <ContactCard />
          <LegalLinksCard />
        </>
      ),
    };
  }
  return null;
}

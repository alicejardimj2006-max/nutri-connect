// Quais cards cada página mostra nas laterais (em telas largas). Cada tela tem os seus.
import type { ReactNode } from "react";
import {
  ChallengeInfoCard,
  ChallengeStatsCard,
  CommunityAboutCard,
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

export interface RailSet {
  left: ReactNode;
  right: ReactNode;
}

const last = (path: string) => path.split("/").filter(Boolean).pop() ?? "";

/** Cards das colunas laterais da página em `pathname`, ou null se a página não usa colunas. */
export function railsFor(pathname: string): RailSet | null {
  const p = pathname.replace(/\/+$/, "") || "/";

  if (p === "/comunidades") {
    return {
      left: (
        <>
          <ProfileCard />
          <MyCommunitiesCard />
        </>
      ),
      right: (
        <>
          <SuggestedCommunitiesCard limit={5} />
          <CommunityRulesCard />
          <ProfessionalsCard />
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
          <MyCommunitiesCard />
        </>
      ),
      right: (
        <>
          <CommunityMembersCard slug={slug} />
          <SuggestedCommunitiesCard />
          <WeeklyThemeCard />
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
        </>
      ),
      right: (
        <>
          <MyChallengesCard />
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
        </>
      ),
      right: (
        <>
          <MyChallengesCard />
          <WeeklyThemeCard />
          <TrailCard />
        </>
      ),
    };
  }
  if (p === "/explorar") {
    return {
      left: (
        <>
          <ProfileCard />
          <FriendsCard />
        </>
      ),
      right: (
        <>
          <SearchTipsCard />
          <ProfessionalsCard limit={4} />
          <SuggestedCommunitiesCard />
        </>
      ),
    };
  }
  if (p === "/receitas" || /^\/receitas\/[^/]+$/.test(p)) {
    return {
      left: (
        <>
          <TopRecipesCard />
          <MyCommunitiesCard />
        </>
      ),
      right: (
        <>
          <WeeklyThemeCard />
          <TrailCard />
          <ProfessionalsCard />
        </>
      ),
    };
  }
  if (p === "/tema-da-semana") {
    return {
      left: (
        <>
          <ProfileCard />
          <MyChallengesCard />
        </>
      ),
      right: (
        <>
          <TopRecipesCard />
          <TrailCard />
          <SuggestedCommunitiesCard />
        </>
      ),
    };
  }
  if (p === "/nina") {
    return {
      left: (
        <>
          <NinaTopicsCard />
          <NinaUsageCard />
        </>
      ),
      right: (
        <>
          <TrailCard />
          <EducationalNoticeCard />
          <ProfessionalsCard />
        </>
      ),
    };
  }
  if (p === "/notificacoes") {
    return {
      left: (
        <>
          <ProfileCard />
          <NotificationsHelpCard />
        </>
      ),
      right: (
        <>
          <FriendsCard />
          <MyChallengesCard />
          <WeeklyThemeCard />
        </>
      ),
    };
  }
  if (/^\/perfil\/(?!configuracoes|editar|personalizacao)[^/]+$/.test(p)) {
    return {
      left: (
        <>
          <ProfileCard />
          <ShortcutsCard />
        </>
      ),
      right: (
        <>
          <FriendsCard />
          <MyChallengesCard />
          <TrailCard />
        </>
      ),
    };
  }
  if (p === "/profissionais" || /^\/profissionais\/[^/]+$/.test(p)) {
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

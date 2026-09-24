import { t } from "./i18n";
// Perfis da trilha: uma conta de adulto pode ter perfis infantis (crianças usam a conta do responsável,
// sem rede social). Cada perfil tem o seu próprio progresso (veja setTrailScope em learning-trail.ts).
import { useCallback, useEffect, useState } from "react";
import type { CharacterId, TrailProfile } from "./trail-types";

export const ADULT_PROFILE_ID = "adult";
export const MAX_KID_PROFILES = 4;
export const PROFILES_EVENT = "trail-profiles-change";

/** Personagens que a criança pode escolher como avatar. */
export const KID_AVATARS: CharacterId[] = ["lipe", "tito", "mila", "cadu", "nina"];

const profilesKey = (userId: string) => `nutriconnect_trail_profiles:${userId}`;
const activeKey = (userId: string) => `nutriconnect_trail_active:${userId}`;

const adultProfile = (name: string): TrailProfile => ({
  id: ADULT_PROFILE_ID,
  name,
  kind: "adult",
  avatar: "nina",
});

/** Lista de perfis da conta: o do responsável sempre vem primeiro. */
export function loadProfiles(userId: string, userName: string): TrailProfile[] {
  if (typeof window === "undefined") return [adultProfile(userName)];
  let kids: TrailProfile[] = [];
  try {
    const raw = localStorage.getItem(profilesKey(userId));
    if (raw) kids = (JSON.parse(raw) as TrailProfile[]).filter((p) => p.kind === "kid");
  } catch {
    kids = [];
  }
  return [adultProfile(userName), ...kids];
}

function saveKids(userId: string, profiles: TrailProfile[]) {
  localStorage.setItem(
    profilesKey(userId),
    JSON.stringify(profiles.filter((p) => p.kind === "kid")),
  );
  window.dispatchEvent(new Event(PROFILES_EVENT));
}

export function getActiveProfileId(userId: string): string {
  if (typeof window === "undefined") return ADULT_PROFILE_ID;
  return localStorage.getItem(activeKey(userId)) ?? ADULT_PROFILE_ID;
}

export function setActiveProfileId(userId: string, profileId: string) {
  localStorage.setItem(activeKey(userId), profileId);
  window.dispatchEvent(new Event(PROFILES_EVENT));
}

export function addKidProfile(userId: string, userName: string, name: string, avatar: CharacterId) {
  const current = loadProfiles(userId, userName);
  const kids = current.filter((p) => p.kind === "kid");
  if (kids.length >= MAX_KID_PROFILES) throw new Error(t("err.kidLimit"));
  const profile: TrailProfile = {
    id: `kid-${Date.now().toString(36)}`,
    name: name.trim() || "Criança",
    kind: "kid",
    avatar,
  };
  saveKids(userId, [...kids, profile]);
  return profile;
}

export function removeKidProfile(userId: string, userName: string, profileId: string) {
  const kids = loadProfiles(userId, userName).filter((p) => p.kind === "kid" && p.id !== profileId);
  saveKids(userId, kids);
  localStorage.removeItem(`nutriconnect_trail_v3:${userId}:${profileId}`);
  if (getActiveProfileId(userId) === profileId) setActiveProfileId(userId, ADULT_PROFILE_ID);
}

/** Perfis da conta e o perfil ativo, sempre atualizados. */
export function useTrailProfiles(userId: string, userName: string) {
  const read = useCallback(() => {
    const profiles = loadProfiles(userId, userName);
    const wanted = getActiveProfileId(userId);
    const active = profiles.find((p) => p.id === wanted) ?? profiles[0];
    return { profiles, active };
  }, [userId, userName]);

  const [state, setState] = useState(read);

  useEffect(() => {
    const sync = () => setState(read());
    sync();
    window.addEventListener(PROFILES_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PROFILES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [read]);

  return {
    ...state,
    select: (profileId: string) => setActiveProfileId(userId, profileId),
    addKid: (name: string, avatar: CharacterId) => addKidProfile(userId, userName, name, avatar),
    removeKid: (profileId: string) => removeKidProfile(userId, userName, profileId),
  };
}

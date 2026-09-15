import { useEffect, useState } from "react";
import { COMMUNITY_EVENT, loadState, type CommunityState } from "@/lib/community";

const EMPTY: CommunityState = { communities: [], posts: [], profiles: [] };

export function useCommunity() {
  const [state, setState] = useState<CommunityState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => setState(loadState());
    sync();
    setHydrated(true);
    window.addEventListener(COMMUNITY_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(COMMUNITY_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { ...state, hydrated };
}

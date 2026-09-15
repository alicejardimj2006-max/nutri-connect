import { useEffect, useState } from "react";
import { COMMUNITY_EVENT, loadState, type CommunityState } from "@/lib/community";

const EMPTY: CommunityState = {
  communities: [],
  posts: [],
  profiles: [],
  weeklyTheme: {
    id: "tema-alimentos-frescos",
    title: "Cozinha de Verdade: Menos Rótulos, Mais Frescor",
    subtitle: "O Pulso da Comunidade nesta semana",
    description: "Nesta semana, nosso convite é olhar com carinho para os alimentos in natura.",
    badge: "Tema da Semana",
    currentWeek: "Semana Atual",
    questionOfTheWeek: "Qual alimento fresco passou a fazer parte da sua rotina?",
    poll: {
      id: "poll-1",
      question: "Qual o seu maior obstáculo para cozinhar mais com alimentos frescos?",
      options: [],
    },
    featuredRecipeIds: [],
  },
  challenges: [],
  professionals: [],
};

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

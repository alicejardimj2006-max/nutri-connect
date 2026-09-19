import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Compass } from "lucide-react";
import { AuthGateLoading, SiteHeader } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";
import { useCommunity } from "@/hooks/use-community";
import { PostCard } from "@/components/community-cards";
import { ShareModal } from "@/components/share-modal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { getAuthorRole, getFriendIds, type Post } from "@/lib/community";
import { cn } from "@/lib/utils";

type FeedTab = "geral" | "amigos" | "profissionais";

const FEED_TABS: { id: FeedTab; label: string }[] = [
  { id: "geral", label: "Geral" },
  { id: "amigos", label: "Amigos" },
  { id: "profissionais", label: "Profissionais" },
];

const EMPTY_STATE_COPY: Record<FeedTab, string> = {
  geral: "Nenhuma publicação encontrada nesta categoria ainda.",
  amigos: "Seus amigos ainda não fizeram nenhuma publicação.",
  profissionais: "Nenhum profissional publicou por aqui ainda.",
};

export const Route = createFileRoute("/espaco")({
  head: () => ({
    meta: [
      { title: "Espaço de Hoje | NutriConnect" },
      {
        name: "description",
        content: "Receitas e experiências compartilhadas pela comunidade NutriConnect.",
      },
      { property: "og:title", content: "Espaço de Hoje | NutriConnect" },
      {
        property: "og:description",
        content: "Acompanhe o feed diário da comunidade NutriConnect.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EspacoDeHojePage,
});

function EspacoDeHojePage() {
  const { user, hydrated: authHydrated } = useRequireAuth();
  const { posts, communities, profiles, hydrated } = useCommunity();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  // Guarda a posição de rolagem de cada aba para restaurar ao voltar,
  // e começar do topo ao entrar numa aba ainda não visitada.
  const scrollPositions = useRef<Record<FeedTab, number>>({
    geral: 0,
    amigos: 0,
    profissionais: 0,
  });
  const activeTabRef = useRef<FeedTab>("geral");

  useEffect(() => {
    if (!carouselApi) return;
    setActiveTabIndex(carouselApi.selectedScrollSnap());

    const onSelect = () => {
      const newIndex = carouselApi.selectedScrollSnap();
      const newTab = FEED_TABS[newIndex].id;
      const oldTab = activeTabRef.current;

      setActiveTabIndex(newIndex);

      if (newTab !== oldTab) {
        scrollPositions.current[oldTab] = window.scrollY;
        activeTabRef.current = newTab;
        window.scrollTo(0, scrollPositions.current[newTab]);
      }
    };

    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  // Ordem do feed geral: destaque (geral), receita, experiencia, pergunta
  const destaque = posts.find((p) => p.type === "geral") || null;
  const receita = posts.find((p) => p.type === "receita") || null;
  const experiencia = posts.find((p) => p.type === "experiencia") || null;
  const pergunta = posts.find((p) => p.type === "pergunta") || null;

  // Add rest of the posts in case there are more
  const rest = posts.filter(
    (p) => p !== destaque && p !== receita && p !== experiencia && p !== pergunta,
  );

  const geralPosts = [destaque, receita, experiencia, pergunta, ...rest].filter(
    Boolean,
  ) as typeof posts;

  const friendIds = useMemo(
    () => (user ? getFriendIds(user.id, communities) : new Set<string>()),
    [user, communities],
  );

  const amigosPosts = useMemo(
    () =>
      posts.filter(
        (p) => friendIds.has(p.authorId) && getAuthorRole(p.authorId, profiles) !== "profissional",
      ),
    [posts, friendIds, profiles],
  );

  const profissionaisPosts = useMemo(
    () => posts.filter((p) => getAuthorRole(p.authorId, profiles) === "profissional"),
    [posts, profiles],
  );

  const postsByTab: Record<FeedTab, Post[]> = {
    geral: geralPosts,
    amigos: amigosPosts,
    profissionais: profissionaisPosts,
  };

  if (!authHydrated || !user) return <AuthGateLoading />;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-8">
        {/* Navegação discreta entre tipos de publicação */}
        <div className="mx-auto mb-6 flex w-fit items-center gap-1 rounded-full border border-border/60 bg-card/50 p-1">
          {FEED_TABS.map((tab, index) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => carouselApi?.scrollTo(index)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition cursor-pointer",
                activeTabIndex === index
                  ? "bg-secondary text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feed centralizado, deslizável entre abas (arraste para o lado no celular) */}
        <div className="mx-auto w-full max-w-2xl">
          {!hydrated ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Carregando o Espaço de Hoje…
            </div>
          ) : (
            <Carousel setApi={setCarouselApi} opts={{ align: "start" }} className="w-full">
              <CarouselContent className="items-start">
                {FEED_TABS.map((tab) => {
                  const tabPosts = postsByTab[tab.id];
                  return (
                    <CarouselItem key={tab.id}>
                      {tabPosts.length > 0 ? (
                        <div className="space-y-8">
                          {tabPosts.map((post) => (
                            <PostCard key={post.id} post={post} />
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center max-w-lg mx-auto">
                          <Compass className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <p className="text-base text-muted-foreground font-medium mb-6">
                            {EMPTY_STATE_COPY[tab.id]}
                          </p>
                          <ShareModal
                            triggerButton={
                              <button className="rounded-full bg-secondary border border-border px-6 py-2.5 text-sm font-bold text-foreground hover:bg-muted transition">
                                Fazer primeira publicação
                              </button>
                            }
                          />
                        </div>
                      )}
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>
          )}
        </div>
      </main>
    </div>
  );
}

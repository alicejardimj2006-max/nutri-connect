import { td } from "@/lib/i18n/data";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { MessageCircle, UserCheck, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AdminPerson } from "@/components/person-chip";
import { useProfessionalMap } from "@/lib/social/professionals-queries";
import { CATEGORIES } from "@/lib/community";
import { communityCover, type RemoteCommunity } from "@/lib/social/communities";
import { resetCommunityFilters, useCommunityFilters, useRailsOn } from "@/lib/community-filters";
import { CommunityCategoriesCard, CommunitySearchCard } from "@/components/rail-cards";
import { useCommunities } from "@/lib/social/communities-queries";
import { useI18n } from "@/hooks/use-i18n";

export const Route = createFileRoute("/comunidades/")({
  head: () => ({
    meta: [
      { title: "Comunidades — NutriConnect" },
      {
        name: "description",
        content: "Participe de comunidades temáticas sobre alimentação equilibrada.",
      },
      { property: "og:title", content: "Comunidades — NutriConnect" },
      {
        property: "og:description",
        content: "Feed de publicações e comunidades temáticas no NutriConnect.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComunidadesPage,
});

function ComunidadesPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  // As comunidades vêm do banco, que já esconde as pendentes de quem não pode vê-las.
  const communitiesQuery = useCommunities(false, !!user);
  const hydrated = !communitiesQuery.isLoading;
  const communities = useMemo(() => communitiesQuery.data ?? [], [communitiesQuery.data]);
  // Busca e categorias são cards das colunas laterais (ou aparecem aqui em cima, se as colunas não
  // estiverem visíveis); o estado é compartilhado e volta ao padrão ao sair da página.
  const { query: searchTerm, category } = useCommunityFilters();
  const railsOn = useRailsOn();
  useEffect(() => resetCommunityFilters, []);

  const filtered = useMemo(() => {
    return communities.filter((c) => {
      if (category !== "Todas" && c.category !== category) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        if (
          !c.name.toLowerCase().includes(q) &&
          !c.description.toLowerCase().includes(q) &&
          !c.category.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [communities, category, searchTerm]);

  const featured = useMemo(() => communities.slice(0, 3), [communities]);
  const showFeatured = !searchTerm && category === "Todas" && featured.length > 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {/* Comunidades em destaque */}
      {showFeatured && (
        <section>
          <h2 className="text-xl font-bold font-display text-foreground mb-6">
            {t("comunidades.featured")}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>
        </section>
      )}

      <div className={showFeatured ? "mt-12 border-t border-border pt-12" : ""}>
        {!railsOn && (
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <CommunitySearchCard />
            <CommunityCategoriesCard />
          </div>
        )}

        <section className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <CommunityCard key={c.id} community={c} />
          ))}
          {hydrated && filtered.length === 0 && communities.length > 0 && (
            <p className="text-sm text-muted-foreground col-span-full">
              {t("comunidades.noResults")}
            </p>
          )}
          {hydrated && communities.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full">
              {t("comunidades.noneYet")}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function CommunityCard({ community: c }: { community: RemoteCommunity }) {
  const professionals = useProfessionalMap();
  const { t } = useI18n();
  const STATUS_LABEL = {
    pendente: t("comunidades.status.pendente"),
    suspensa: t("comunidades.status.suspensa"),
  } as const;
  const isMember = c.isMember;
  const pro = c.professionalId ? professionals.map.get(c.professionalId)?.info : undefined;

  const coverImage = communityCover(c);

  return (
    // O card inteiro é clicável (link esticado no título); os admins são links próprios acima dele.
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card transition hover:shadow-lg focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
      <div className="h-32 w-full relative">
        <img src={coverImage} alt="" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {isMember && (
          <span
            role="img"
            aria-label={t("comunidades.youAreMember")}
            title={t("comunidades.youAreMember")}
            className="absolute top-3 right-3 grid h-7 w-7 place-items-center rounded-full bg-card/90 text-accent shadow-xs backdrop-blur-sm"
          >
            <UserCheck className="h-4 w-4" />
          </span>
        )}
        <div className="absolute top-3 left-3">
          <span className="rounded-full bg-card/90 px-3 py-1 text-[10px] font-bold text-foreground backdrop-blur-sm shadow-xs uppercase tracking-wider">
            {td(c.category)}
          </span>
        </div>
        {c.status !== "ativa" && (
          <span className="absolute bottom-3 left-3 rounded-full bg-warning px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-warning-foreground shadow-xs">
            {STATUS_LABEL[c.status]}
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-foreground font-display leading-tight transition-colors group-hover:text-accent">
          <Link
            to="/comunidades/$slug"
            params={{ slug: c.slug }}
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {c.name}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">{c.description}</p>

        <div className="mt-5 space-y-2.5 border-t border-border/60 pt-4">
          <AdminPerson
            raised
            label={t("comunidades.adminUser")}
            userId={c.adminUserId}
            name={c.adminName}
            vacantText={t("comunidades.awaitingNomination")}
          />
          <AdminPerson
            raised
            label={t("comunidades.adminProfessional")}
            detail={
              pro
                ? `${td(pro.profession)} · ${pro.council} ${pro.registration}/${pro.uf}`
                : undefined
            }
            userId={c.professionalId}
            name={c.professionalName}
            verified
            vacantText={t("comunidades.status.pendente")}
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] font-medium text-muted-foreground border-t border-border/60 pt-4">
          <span className="inline-flex items-center gap-1">
            <Users className="h-4 w-4 text-accent" /> {c.memberCount} {t("comunidades.members")}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-4 w-4 text-accent" />
            {c.postCount} {t("comunidades.posts")}
          </span>
        </div>
      </div>
    </article>
  );
}

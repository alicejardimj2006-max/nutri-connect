import { td } from "@/lib/i18n/data";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MessageCircle, UserCheck, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AdminPerson } from "@/components/person-chip";
import { useCommunity } from "@/hooks/use-community";
import { getProfessionalInfo } from "@/lib/community-admin";
import { CATEGORIES, type Community } from "@/lib/community";
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
  const { communities: allCommunities, posts, hydrated } = useCommunity();
  // Comunidades pendentes ainda não existem publicamente: só quem as criou as vê.
  const communities = useMemo(
    () => allCommunities.filter((c) => c.status !== "pendente" || c.adminUserId === user?.id),
    [allCommunities, user?.id],
  );
  const [category, setCategory] = useState<string>("Todas");
  const [searchTerm, setSearchTerm] = useState("");

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

      <div
        className={`grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)] ${showFeatured ? "mt-12 border-t border-border pt-12" : ""}`}
      >
        <aside className="min-w-0 space-y-6">
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <h2 className="text-sm font-semibold text-foreground mb-4">{t("common.search")}</h2>
            <input
              type="text"
              placeholder={t("comunidades.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              {t("comunidades.categories")}
            </h2>
            <div className="flex overflow-x-auto no-scrollbar gap-2 lg:flex-col lg:items-start pb-2 lg:pb-0">
              {["Todas", ...CATEGORIES].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                    category === c
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  {c === "Todas" ? t("comunidades.categoryAll") : td(c)}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
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

function CommunityCard({ community: c }: { community: Community }) {
  const { posts, profiles } = useCommunity();
  const { user } = useAuth();
  const { t } = useI18n();
  const STATUS_LABEL = {
    pendente: t("comunidades.status.pendente"),
    suspensa: t("comunidades.status.suspensa"),
  } as const;
  const isMember = !!user && c.members.some((m) => m.userId === user.id);
  const pro = c.professionalId ? getProfessionalInfo(profiles, c.professionalId) : undefined;

  let coverImage = c.coverImage || "/images/communities/friends-dinner.jpg";
  if (!c.coverImage) {
    if (c.id === "c-educacao") coverImage = "/images/communities/friends-dinner.jpg";
    if (c.id === "c-relacao") coverImage = "/images/experiences/cooking.jpg";
    if (c.id === "c-cozinha") coverImage = "/images/hero/kitchen-prep.jpg";
  }

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
            name={c.adminUserName}
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
            <Users className="h-4 w-4 text-accent" /> {c.members.length} {t("comunidades.members")}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-4 w-4 text-accent" />
            {posts.filter((p) => p.communityId === c.id).length} {t("comunidades.posts")}
          </span>
        </div>
      </div>
    </article>
  );
}

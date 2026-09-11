import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { BadgeCheck } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useAuth } from "@/hooks/use-auth";
import { useCommunity } from "@/hooks/use-community";
import { formatDate, initials } from "@/lib/community";

export const Route = createFileRoute("/perfil/$userId")({
  head: () => ({
    meta: [
      { title: "Perfil público — NutriConnect" },
      { name: "description", content: "Perfil público com biografia, selo de verificação e publicações na comunidade." },
      { property: "og:title", content: "Perfil público — NutriConnect" },
      { property: "og:description", content: "Conheça membros e nutricionistas responsáveis das comunidades NutriConnect." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicProfilePage,
});

function PublicProfilePage() {
  const { userId } = useParams({ from: "/perfil/$userId" });
  const { user } = useAuth();
  const { profiles, posts, communities, hydrated } = useCommunity();

  const stored = profiles.find((p) => p.userId === userId);
  const fromPost = posts.find((p) => p.authorId === userId);
  const isSelf = user?.id === userId;

  const profile =
    stored ??
    (isSelf && user
      ? { userId, name: user.name, role: user.role, bio: "Este perfil ainda não tem biografia." }
      : fromPost
        ? { userId, name: fromPost.authorName, role: fromPost.authorRole, bio: "Membro da comunidade NutriConnect." }
        : null);

  const myPosts = posts.filter((p) => p.authorId === userId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const moderating = communities.filter((c) => c.responsible?.userId === userId);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        {!hydrated ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : !profile ? (
          <>
            <h1 className="text-2xl font-bold text-primary">Perfil não encontrado</h1>
            <Link to="/comunidades" className="mt-3 inline-block text-sm font-semibold text-accent hover:underline">
              Voltar para comunidades
            </Link>
          </>
        ) : (
          <>
            <header className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="flex flex-wrap items-center gap-4">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-primary-soft text-2xl font-bold text-primary">
                  {initials(profile.name)}
                </span>
                <div>
                  <h1 className="flex items-center gap-2 text-2xl font-bold text-primary">
                    {profile.name}
                    {profile.role === "nutricionista" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                        <BadgeCheck className="h-4 w-4" /> Perfil verificado
                      </span>
                    )}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {profile.role === "nutricionista" ? "Nutricionista" : "Membro da comunidade"}
                    {"credential" in profile && profile.credential ? ` · ${profile.credential}` : ""}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-foreground">{profile.bio}</p>
              {isSelf && (
                <Link
                  to={user?.role === "nutricionista" ? "/nutricionista/perfil" : "/paciente/perfil"}
                  className="mt-4 inline-block rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground transition hover:opacity-90"
                >
                  Editar meu perfil
                </Link>
              )}
            </header>

            {moderating.length > 0 && (
              <section className="mt-6 rounded-2xl border bg-card p-5 shadow-card">
                <h2 className="text-base font-semibold text-foreground">Comunidades sob responsabilidade</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {moderating.map((c) => (
                    <li key={c.id}>
                      <Link
                        to="/comunidades/$slug"
                        params={{ slug: c.slug }}
                        className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-muted"
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-6">
              <h2 className="text-base font-semibold text-foreground">Publicações na comunidade</h2>
              <div className="mt-3 space-y-4">
                {myPosts.map((p) => {
                  const c = communities.find((x) => x.id === p.communityId);
                  return (
                    <article key={p.id} className="rounded-2xl border bg-card p-5 shadow-card">
                      <p className="text-xs text-muted-foreground">
                        {c && (
                          <Link to="/comunidades/$slug" params={{ slug: c.slug }} className="text-accent hover:underline">
                            {c.name}
                          </Link>
                        )}{" "}
                        · {formatDate(p.createdAt)}
                      </p>
                      <p className="mt-2 whitespace-pre-line text-sm text-foreground">{p.text}</p>
                      {p.image && <img src={p.image} alt="Foto da publicação" className="mt-3 max-h-72 rounded-xl object-cover" />}
                    </article>
                  );
                })}
                {myPosts.length === 0 && <p className="text-sm text-muted-foreground">Ainda sem publicações.</p>}
              </div>
            </section>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

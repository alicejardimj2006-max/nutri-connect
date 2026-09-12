import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BadgeCheck, MessageCircle, Plus, ShieldQuestion, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useCommunity } from "@/hooks/use-community";
import {
  CATEGORIES,
  assumeResponsibility,
  createCommunity,
  formatDate,
  initials,
  toggleMembership,
  type Actor,
  type Community,
} from "@/lib/community";

export const Route = createFileRoute("/comunidades/")({
  head: () => ({
    meta: [
      { title: "Comunidades — NutriConnect" },
      {
        name: "description",
        content:
          "Participe de comunidades temáticas sobre alimentação equilibrada, moderadas por nutricionistas responsáveis.",
      },
      { property: "og:title", content: "Comunidades — NutriConnect" },
      {
        property: "og:description",
        content: "Feed de publicações, grupos temáticos e moderação profissional no NutriConnect.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComunidadesPage,
});

function ComunidadesPage() {
  const { user } = useAuth();
  const { communities, posts, hydrated } = useCommunity();
  const [category, setCategory] = useState<string>("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [creating, setCreating] = useState(false);

  const actor: Actor | null = user ? { id: user.id, name: user.name, role: user.role } : null;

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

  const featured = useMemo(() => {
    return communities.filter((c) => c.status === "ativa").slice(0, 3);
  }, [communities]);

  const pending = communities.filter((c) => c.status === "aguardando");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Rede de cuidado</p>
          <h1 className="mt-1 text-3xl font-bold font-display text-primary md:text-4xl">
            Comunidades
          </h1>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">
            Encontre um grupo que combine com a sua jornada. Participe de grupos específicos para
            conversar, aprender e construir hábitos junto com outras pessoas.
          </p>
        </div>
        <button
          onClick={() => setCreating((v) => !v)}
          className="inline-flex items-center gap-2 self-start rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground shadow-soft transition hover:bg-accent/90"
        >
          <Plus className="h-4 w-4" />
          Criar comunidade
        </button>
      </header>

      {creating && <CreateForm actor={actor} onDone={() => setCreating(false)} />}

      {hydrated && actor?.role === "nutricionista" && pending.length > 0 && (
        <section className="mt-8 rounded-2xl border border-accent/40 bg-accent-soft p-5">
          <div className="flex items-start gap-3">
            <ShieldQuestion className="mt-0.5 h-5 w-5 text-accent" />
            <div className="flex-1">
              <h2 className="text-base font-semibold text-foreground">
                Deseja assumir a moderação destas comunidades?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Elas foram sugeridas por pacientes e aguardam um profissional responsável para
                iniciar as publicações.
              </p>
              <ul className="mt-4 space-y-3">
                {pending.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card p-3 shadow-sm border border-border"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Sugerida por {c.createdByName} · {formatDate(c.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        assumeResponsibility(c.id, actor);
                        toast.success("Você agora é o nutricionista responsável desta comunidade.");
                      }}
                      className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground transition hover:opacity-90"
                    >
                      Assumir moderação
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Comunidades em destaque */}
      {!searchTerm && category === "Todas" && featured.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold font-display text-foreground mb-6">
            Comunidades em destaque
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-12 border-t border-border pt-12 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6">
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <h2 className="text-sm font-semibold text-foreground mb-4">Buscar</h2>
            <input
              type="text"
              placeholder="Buscar comunidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <h2 className="text-sm font-semibold text-foreground mb-4">Categorias temáticas</h2>
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
                  {c}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="grid gap-5 sm:grid-cols-2">
          {filtered.map((c) => (
            <CommunityCard key={c.id} community={c} />
          ))}
          {hydrated && filtered.length === 0 && communities.length > 0 && (
            <p className="text-sm text-muted-foreground col-span-full">
              Nenhuma comunidade encontrada para essa busca.
            </p>
          )}
          {hydrated && communities.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full">
              Ainda não existem comunidades disponíveis.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function CommunityCard({ community: c }: { community: Community }) {
  const { posts } = useCommunity();
  const { user } = useAuth();

  let coverImage = c.coverImage || "/images/communities/friends-dinner.jpg";
  if (!c.coverImage) {
    if (c.id === "c-educacao") coverImage = "/images/communities/friends-dinner.jpg";
    if (c.id === "c-relacao") coverImage = "/images/experiences/cooking.jpg";
    if (c.id === "c-cozinha") coverImage = "/images/hero/kitchen-prep.jpg";
  }

  return (
    <article className="flex flex-col rounded-3xl border border-border bg-card shadow-card overflow-hidden transition hover:shadow-lg">
      <div className="h-32 w-full relative">
        <img src={coverImage} alt={c.name} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="rounded-full bg-card/90 px-3 py-1 text-[10px] font-bold text-foreground backdrop-blur-sm shadow-xs uppercase tracking-wider">
            {c.category}
          </span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-3 mb-2">
          {c.status === "aguardando" ? (
            <span className="rounded-full bg-warning/20 px-2.5 py-1 text-[10px] font-semibold text-warning-foreground">
              Aguardando nutricionista
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-semibold text-primary">
              <BadgeCheck className="h-3 w-3" /> Comunidade ativa
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold text-foreground font-display leading-tight">{c.name}</h3>
        <p className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">{c.description}</p>

        {c.responsible ? (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-xs shrink-0">
              {initials(c.responsible.name)}
            </span>
            <div className="text-xs">
              <p className="text-muted-foreground">Nutricionista responsável</p>
              <p className="font-semibold text-foreground text-sm">{c.responsible.name}</p>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-border border-dashed bg-secondary/10 p-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-muted text-sm font-bold text-muted-foreground shadow-xs shrink-0">
              <ShieldQuestion className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-warning/90">Aguardando nutricionista responsável</p>
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between text-[11px] font-medium text-muted-foreground border-t border-border/60 pt-4">
          <span className="inline-flex items-center gap-1">
            <Users className="h-4 w-4 text-accent" /> {c.members.length} membros
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-4 w-4 text-accent" />
            {posts.filter((p) => p.communityId === c.id).length} publicações
          </span>
        </div>

        <div className="mt-5 flex gap-2">
          {c.status === "ativa" && user && (
            <button
              onClick={() => {
                toggleMembership(c.id, { id: user.id, name: user.name, role: user.role });
              }}
              className={`flex-1 rounded-full px-4 py-2 text-[13px] font-semibold transition shadow-soft ${
                c.members.some((m) => m.id === user.id)
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
                  : "bg-primary-soft text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20"
              }`}
            >
              {c.members.some((m) => m.id === user.id) ? "Você participa" : "Participar"}
            </button>
          )}
          <Link
            to="/comunidades/$slug"
            params={{ slug: c.slug }}
            className={`text-center rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90 ${
              c.status !== "ativa" || !user ? "flex-1" : ""
            }`}
          >
            Ver comunidade
          </Link>
        </div>
      </div>
    </article>
  );
}

function CreateForm({ actor, onDone }: { actor: Actor | null; onDone: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [objective, setObjective] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);

  if (!actor) {
    return (
      <div className="mt-6 rounded-2xl border bg-card p-5 text-sm text-muted-foreground shadow-card">
        Entre na sua conta para sugerir uma nova comunidade.{" "}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          Fazer login
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim() || !description.trim()) {
          toast.error("Preencha o nome e a descrição da comunidade.");
          return;
        }
        createCommunity({
          name: name.trim(),
          description: description.trim(),
          objective: objective.trim(),
          coverImage: coverImage.trim(),
          category,
          actor,
        });
        toast.success(
          actor.role === "nutricionista"
            ? "Comunidade criada e ativada."
            : "Comunidade criada. Agora ela aguarda um nutricionista responsável.",
        );
        onDone();
      }}
      className="mt-6 rounded-2xl border bg-card p-5 shadow-card"
    >
      <h2 className="text-base font-semibold text-foreground">Nova comunidade</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {actor.role === "nutricionista"
          ? "Como profissional, você será o responsável e a comunidade é ativada na hora."
          : "Sua sugestão ficará como “aguardando nutricionista” até um profissional assumir."}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Nome</span>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Café da manhã sem pressa"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Categoria</span>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Descrição</span>
          <textarea
            rows={3}
            className="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Sobre o que a comunidade conversa?"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Objetivo</span>
          <textarea
            rows={3}
            className="textarea"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Qual o objetivo prático desta comunidade?"
          />
        </label>
      </div>
      <div className="mt-4 block">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">
            Imagem/Capa (opcional)
          </span>
          <input
            className="input"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="URL da imagem (ex: /images/communities/group.jpg)"
          />
        </label>
      </div>
      <div className="mt-4 flex gap-3">
        <button className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90">
          Criar comunidade
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-full border px-5 py-2.5 text-sm font-semibold text-foreground"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

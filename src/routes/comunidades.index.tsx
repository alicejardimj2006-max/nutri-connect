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
  type Actor,
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
  const [creating, setCreating] = useState(false);

  const actor: Actor | null = user ? { id: user.id, name: user.name, role: user.role } : null;

  const filtered = useMemo(
    () => (category === "Todas" ? communities : communities.filter((c) => c.category === category)),
    [communities, category],
  );

  const recentPosts = useMemo(
    () =>
      [...posts]
        .filter((p) => communities.find((c) => c.id === p.communityId)?.status === "ativa")
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, 4),
    [posts, communities],
  );

  const pending = communities.filter((c) => c.status === "aguardando");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Rede de cuidado</p>
          <h1 className="mt-1 text-3xl font-bold text-primary md:text-4xl">Comunidades</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Espaços temáticos para trocar experiências sobre alimentação, sempre com um
            nutricionista responsável acompanhando as conversas.
          </p>
        </div>
        <button
          onClick={() => setCreating((v) => !v)}
          className="inline-flex items-center gap-2 self-start rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-soft transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Criar nova comunidade
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
                Elas foram sugeridas por pacientes e só ficam públicas com um profissional
                responsável.
              </p>
              <ul className="mt-4 space-y-3">
                {pending.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card p-3"
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

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-6">
          <div className="rounded-2xl border bg-card p-4 shadow-card">
            <h2 className="text-sm font-semibold text-foreground">Categorias temáticas</h2>
            <div className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:items-start">
              {["Todas", ...CATEGORIES].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    category === c
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-[var(--card)] p-4 shadow-card">
            <h2 className="text-sm font-semibold text-foreground">Últimas publicações</h2>
            <ul className="mt-3 space-y-3">
              {recentPosts.map((p) => {
                const c = communities.find((x) => x.id === p.communityId);
                return (
                  <li key={p.id} className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{p.authorName}</span> em{" "}
                    {c && (
                      <Link
                        to="/comunidades/$slug"
                        params={{ slug: c.slug }}
                        className="text-accent hover:underline"
                      >
                        {c.name}
                      </Link>
                    )}
                    <p className="mt-1 line-clamp-2">{p.text}</p>
                  </li>
                );
              })}
              {recentPosts.length === 0 && (
                <li className="text-xs text-muted-foreground">Ainda sem publicações.</li>
              )}
            </ul>
          </div>
        </aside>

        <section className="grid gap-5 sm:grid-cols-2">
          {filtered.map((c) => (
            <article
              key={c.id}
              className="flex flex-col rounded-2xl border bg-card p-5 shadow-card"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                  {c.category}
                </span>
                {c.status === "aguardando" ? (
                  <span className="rounded-full bg-warning/20 px-3 py-1 text-xs font-semibold text-warning-foreground">
                    Aguardando nutricionista responsável
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <BadgeCheck className="h-3.5 w-3.5" /> Ativa
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-primary">{c.name}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{c.description}</p>

              {c.responsible && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-secondary/60 p-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {initials(c.responsible.name)}
                  </span>
                  <div className="text-xs">
                    <p className="font-semibold text-foreground">{c.responsible.name}</p>
                    <p className="text-muted-foreground">
                      Responsável · {c.responsible.credential}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {c.members.length} membros
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {posts.filter((p) => p.communityId === c.id).length} publicações
                </span>
              </div>

              <Link
                to="/comunidades/$slug"
                params={{ slug: c.slug }}
                className="mt-4 inline-flex justify-center rounded-full border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-secondary"
              >
                Entrar na comunidade
              </Link>
            </article>
          ))}
          {hydrated && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma comunidade nesta categoria ainda.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function CreateForm({ actor, onDone }: { actor: Actor | null; onDone: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
        createCommunity({ name: name.trim(), description: description.trim(), category, actor });
        toast.success(
          actor.role === "nutricionista"
            ? "Comunidade criada e ativada."
            : "Comunidade sugerida! Ela ficará pública quando um nutricionista assumir a moderação.",
        );
        onDone();
      }}
      className="mt-6 rounded-2xl border bg-card p-5 shadow-card"
    >
      <h2 className="text-base font-semibold text-foreground">Nova comunidade</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {actor.role === "nutricionista"
          ? "Como profissional, você será o responsável e a comunidade é ativada na hora."
          : "Sua sugestão ficará como “aguardando nutricionista responsável” até um profissional assumir."}
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
      <label className="mt-4 block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Descrição</span>
        <textarea
          rows={3}
          className="textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Sobre o que a comunidade conversa?"
        />
      </label>
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

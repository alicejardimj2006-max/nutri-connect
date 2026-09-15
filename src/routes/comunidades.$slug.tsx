import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { BadgeCheck, Heart, ImagePlus, MessageCircle, Pin, ShieldQuestion, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useCommunity } from "@/hooks/use-community";
import {
  addComment,
  assumeResponsibility,
  createPost,
  formatDate,
  initials,
  removeComment,
  removePost,
  toggleLike,
  toggleMembership,
  togglePin,
  type Actor,
  type Post,
} from "@/lib/community";

export const Route = createFileRoute("/comunidades/$slug")({
  head: () => ({
    meta: [
      { title: "Comunidade — NutriConnect" },
      { name: "description", content: "Feed da comunidade com publicações, comentários e moderação profissional." },
      { property: "og:title", content: "Comunidade — NutriConnect" },
      { property: "og:description", content: "Publicações, receitas e conversas acolhedoras sobre alimentação." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommunityFeed,
});

function CommunityFeed() {
  const { slug } = useParams({ from: "/comunidades/$slug" });
  const { user } = useAuth();
  const { communities, posts, hydrated } = useCommunity();
  const actor: Actor | null = user ? { id: user.id, name: user.name, role: user.role } : null;

  const community = communities.find((c) => c.slug === slug);
  const feed = useMemo(
    () =>
      posts
        .filter((p) => p.communityId === community?.id)
        .sort((a, b) => (a.pinned !== b.pinned ? (a.pinned ? -1 : 1) : a.createdAt < b.createdAt ? 1 : -1)),
    [posts, community?.id],
  );

  if (!hydrated) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-sm text-muted-foreground">Carregando…</div>;
  }

  if (!community) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-2xl font-bold text-primary">Comunidade não encontrada</h1>
        <Link to="/comunidades" className="mt-3 inline-block text-sm font-semibold text-accent hover:underline">
          Voltar para comunidades
        </Link>
      </div>
    );
  }

  const isModerator = !!actor && community.responsible?.userId === actor.id;
  const isMember = !!actor && community.members.some((m) => m.userId === actor.id);
  const canPost = !!actor && community.status === "ativa" && (isMember || isModerator);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/comunidades" className="text-sm font-medium text-muted-foreground hover:text-foreground">
        ← Comunidades
      </Link>

      <header className="mt-4 rounded-2xl border bg-card p-6 shadow-card">
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          {community.category}
        </span>
        <h1 className="mt-3 text-3xl font-bold text-primary">{community.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{community.description}</p>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          {community.responsible ? (
            <Link
              to="/perfil/$userId"
              params={{ userId: community.responsible.userId }}
              className="flex items-center gap-3 rounded-xl bg-secondary/70 px-3 py-2 transition hover:bg-secondary"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {initials(community.responsible.name)}
              </span>
              <span className="text-sm">
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  {community.responsible.name}
                  <BadgeCheck className="h-4 w-4 text-accent" />
                </span>
                <span className="text-xs text-muted-foreground">
                  Nutricionista responsável · {community.responsible.credential}
                </span>
              </span>
            </Link>
          ) : (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-accent/40 bg-accent-soft px-4 py-3">
              <ShieldQuestion className="h-5 w-5 text-accent" />
              <div className="text-sm">
                <p className="font-semibold text-foreground">Aguardando nutricionista responsável</p>
                <p className="text-xs text-muted-foreground">
                  A comunidade só fica aberta a publicações quando um profissional assumir a moderação.
                </p>
              </div>
              {actor?.role === "nutricionista" && (
                <button
                  onClick={() => {
                    assumeResponsibility(community.id, actor);
                    toast.success("Você assumiu a moderação desta comunidade.");
                  }}
                  className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground transition hover:opacity-90"
                >
                  Deseja assumir a moderação?
                </button>
              )}
            </div>
          )}

          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-4 w-4" /> {community.members.length} membros
          </span>

          {actor && community.status === "ativa" && !isModerator && (
            <button
              onClick={() => toggleMembership(community.id, actor)}
              className={`ml-auto rounded-full px-4 py-2 text-xs font-semibold transition ${
                isMember
                  ? "border border-primary/40 text-primary hover:bg-secondary"
                  : "bg-accent text-accent-foreground hover:opacity-90"
              }`}
            >
              {isMember ? "Sair da comunidade" : "Participar"}
            </button>
          )}
        </div>
      </header>

      {canPost ? (
        <Composer communityId={community.id} actor={actor} />
      ) : (
        <p className="mt-6 rounded-2xl border bg-card p-5 text-sm text-muted-foreground shadow-card">
          {!actor ? (
            <>
              <Link to="/login" className="font-semibold text-accent hover:underline">
                Entre na sua conta
              </Link>{" "}
              para participar e publicar nesta comunidade.
            </>
          ) : community.status !== "ativa" ? (
            "As publicações serão liberadas assim que um nutricionista assumir a responsabilidade."
          ) : (
            "Participe da comunidade para publicar."
          )}
        </p>
      )}

      <section className="mt-6 space-y-5">
        {feed.map((post) => (
          <PostCard key={post.id} post={post} actor={actor} isModerator={isModerator} />
        ))}
        {feed.length === 0 && (
          <p className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground shadow-card">
            Ainda não há publicações por aqui.
          </p>
        )}
      </section>
    </div>
  );
}

function Composer({ communityId, actor }: { communityId: string; actor: Actor }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) {
          toast.error("Escreva algo para publicar.");
          return;
        }
        createPost({ communityId, actor, text: text.trim(), ...(image ? { image } : {}) });
        setText("");
        setImage(undefined);
        toast.success("Publicado na comunidade!");
      }}
      className="mt-6 rounded-2xl border bg-card p-5 shadow-card"
    >
      <textarea
        rows={3}
        className="textarea"
        placeholder="Compartilhe uma refeição, uma dúvida ou uma conquista do seu dia…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {image && <img src={image} alt="Prévia da imagem da publicação" className="mt-3 max-h-64 rounded-xl object-cover" />}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => setImage(String(reader.result));
            reader.readAsDataURL(file);
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary"
        >
          <ImagePlus className="h-4 w-4" /> Adicionar foto
        </button>
        <button className="ml-auto rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90">
          Publicar
        </button>
      </div>
    </form>
  );
}

function PostCard({ post, actor, isModerator }: { post: Post; actor: Actor | null; isModerator: boolean }) {
  const [comment, setComment] = useState("");
  const liked = !!actor && post.likes.includes(actor.id);

  return (
    <article className={`rounded-2xl border bg-card p-5 shadow-card ${post.pinned ? "border-accent/50" : ""}`}>
      {post.pinned && (
        <p className="mb-3 inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
          <Pin className="h-3.5 w-3.5" /> Orientação fixada
        </p>
      )}
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary">
          {initials(post.authorName)}
        </span>
        <div>
          <Link
            to="/perfil/$userId"
            params={{ userId: post.authorId }}
            className="flex items-center gap-1 text-sm font-semibold text-foreground hover:underline"
          >
            {post.authorName}
            {post.authorRole === "nutricionista" && <BadgeCheck className="h-4 w-4 text-accent" />}
          </Link>
          <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
        </div>
        {isModerator && (
          <div className="ml-auto flex gap-1">
            <button
              onClick={() => togglePin(post.id)}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label={post.pinned ? "Desafixar publicação" : "Fixar publicação"}
            >
              <Pin className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                removePost(post.id);
                toast.success("Publicação removida pela moderação.");
              }}
              className="rounded-lg p-2 text-destructive transition hover:bg-destructive/10"
              aria-label="Remover publicação"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <p className="mt-3 whitespace-pre-line text-sm text-foreground">{post.text}</p>
      {post.image && (
        <img src={post.image} alt="Foto compartilhada na publicação" className="mt-3 max-h-96 w-full rounded-xl object-cover" />
      )}

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <button
          onClick={() => {
            if (!actor) return toast.error("Entre na sua conta para curtir.");
            toggleLike(post.id, actor.id);
          }}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-semibold transition ${
            liked ? "bg-accent-soft text-accent" : "hover:bg-secondary"
          }`}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} /> {post.likes.length} curtidas
        </button>
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="h-4 w-4" /> {post.comments.length} comentários
        </span>
      </div>

      <div className="mt-4 space-y-3 border-t pt-4">
        {post.comments.map((c) => (
          <div key={c.id} className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
              {initials(c.authorName)}
            </span>
            <div className="flex-1 rounded-xl bg-secondary/60 px-3 py-2">
              <p className="flex items-center gap-1 text-xs font-semibold text-foreground">
                {c.authorName}
                {c.authorRole === "nutricionista" && <BadgeCheck className="h-3.5 w-3.5 text-accent" />}
                <span className="ml-auto font-normal text-muted-foreground">{formatDate(c.createdAt)}</span>
              </p>
              <p className="mt-1 text-sm text-foreground">{c.text}</p>
            </div>
            {isModerator && (
              <button
                onClick={() => {
                  removeComment(post.id, c.id);
                  toast.success("Comentário removido.");
                }}
                className="rounded-lg p-2 text-destructive transition hover:bg-destructive/10"
                aria-label="Remover comentário"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        {actor && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!comment.trim()) return;
              addComment(post.id, actor, comment.trim());
              setComment("");
            }}
            className="flex gap-2"
          >
            <input
              className="input"
              placeholder="Escreva um comentário acolhedor…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90">
              Comentar
            </button>
          </form>
        )}
      </div>
    </article>
  );
}

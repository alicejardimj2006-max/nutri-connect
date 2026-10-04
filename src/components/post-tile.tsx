// Miniatura de um post na grade do Explorar (como no Instagram): um pedaço da foto ou do texto, o tipo
// e os números. Clicar abre o post inteiro num modal (post-modal.tsx).
import { ChefHat, HelpCircle, MessageCircle, MessagesSquare, Heart, Sparkles } from "lucide-react";
import type { Post, PostType } from "@/lib/community";
import { engagement } from "@/lib/trending";

const TYPE_ICON: Record<PostType, typeof ChefHat> = {
  receita: ChefHat,
  experiencia: Sparkles,
  pergunta: HelpCircle,
  geral: MessagesSquare,
};

/** Fundo dos posts sem foto: cada tipo com o seu tom. */
const TYPE_TONE: Record<PostType, string> = {
  receita: "from-accent-soft to-card",
  experiencia: "from-primary-soft to-card",
  pergunta: "from-secondary to-card",
  geral: "from-muted to-card",
};

export function PostTile({ post, onOpen }: { post: Post; onOpen: (post: Post) => void }) {
  const Icon = TYPE_ICON[post.type] ?? MessagesSquare;
  const headline = post.title || post.text;
  const hot = engagement(post) >= 8;
  return (
    <button
      type="button"
      onClick={() => onOpen(post)}
      className="group relative block aspect-square w-full cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card text-left shadow-xs transition hover:shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:rounded-2xl"
      aria-label={headline ? headline.slice(0, 80) : post.authorName}
    >
      {post.image ? (
        <img
          src={post.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div className={`flex h-full w-full bg-gradient-to-br p-2.5 sm:p-4 ${TYPE_TONE[post.type] ?? TYPE_TONE.geral}`}>
          <p className="line-clamp-6 break-words text-[11px] font-semibold leading-snug text-foreground sm:line-clamp-8 sm:text-sm">
            {headline}
          </p>
        </div>
      )}

      {/* Faixa com o começo do texto, só nas fotos. */}
      {post.image && headline && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2 pt-8 sm:p-3 sm:pt-10">
          <p className="line-clamp-2 text-[10px] font-semibold leading-tight text-white sm:text-xs">{headline}</p>
        </div>
      )}

      <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-card/90 text-accent shadow-xs backdrop-blur-sm sm:right-2.5 sm:top-2.5 sm:h-7 sm:w-7">
        <Icon className="h-3.5 w-3.5" />
      </span>
      {hot && (
        <span className="absolute left-1.5 top-1.5 rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-accent-foreground shadow-xs sm:left-2.5 sm:top-2.5">
          🔥
        </span>
      )}

      {/* Números ao passar o mouse (no toque, o post inteiro está a um clique). */}
      <div className="pointer-events-none absolute inset-0 hidden items-center justify-center gap-4 bg-black/45 text-sm font-bold text-white opacity-0 transition group-hover:opacity-100 sm:flex">
        <span className="inline-flex items-center gap-1.5">
          <Heart className="h-4 w-4 fill-current" /> {post.supports.length + post.likes.length}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="h-4 w-4 fill-current" /> {post.comments.length}
        </span>
      </div>
    </button>
  );
}

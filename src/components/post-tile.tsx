// Miniatura de um post na grade do Explorar (como no Instagram): um pedaço da foto ou do texto, quem
// postou (foto e @), o tipo (cada um com a sua cor) e os números. Clicar abre o post inteiro num modal.
import { ChefHat, HelpCircle, Heart, MessageCircle, MessagesSquare, Sparkles } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { initials, type Post, type PostType } from "@/lib/community";
import { pickName, type Names } from "@/lib/appearance-data";
import { engagement } from "@/lib/trending";

const TYPE_ICON: Record<PostType, typeof ChefHat> = {
  receita: ChefHat,
  experiencia: Sparkles,
  pergunta: HelpCircle,
  geral: MessagesSquare,
};

const TYPE_LABEL: Record<PostType, Names> = {
  receita: ["Receita", "Recipe", "Receta", "Recette"],
  experiencia: ["Experiência", "Experience", "Experiencia", "Expérience"],
  pergunta: ["Pergunta", "Question", "Pregunta", "Question"],
  geral: ["Conversa", "Chat", "Conversación", "Discussion"],
};

/** Quem postou: foto e @, sempre legíveis (sobre foto ou sobre fundo liso). */
function Author({ post, onImage }: { post: Post; onImage: boolean }) {
  const handle = post.authorUsername ? `@${post.authorUsername}` : post.authorName;
  return (
    <span
      className={`absolute left-1.5 top-1.5 flex max-w-[72%] items-center gap-1 rounded-full py-0.5 pl-0.5 pr-2 text-[10px] font-semibold shadow-xs sm:left-2.5 sm:top-2.5 sm:gap-1.5 sm:pr-2.5 sm:text-xs ${
        onImage ? "bg-black/55 text-white backdrop-blur-sm" : "bg-card/90 text-foreground backdrop-blur-sm"
      }`}
    >
      <span className="grid h-5 w-5 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-soft text-[8px] font-extrabold text-primary sm:h-6 sm:w-6 sm:text-[9px]">
        {post.authorAvatar ? (
          <img src={post.authorAvatar} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          initials(post.authorName)
        )}
      </span>
      <span className="truncate">{handle}</span>
    </span>
  );
}

export function PostTile({ post, onOpen }: { post: Post; onOpen: (post: Post) => void }) {
  const { locale } = useI18n();
  const type: PostType = post.type in TYPE_ICON ? post.type : "geral";
  const Icon = TYPE_ICON[type];
  const typeName = pickName(TYPE_LABEL[type], locale);
  const title = post.title?.trim();
  const body = post.text?.trim();
  const hot = engagement(post) >= 8;
  const hearts = post.supports.length + post.likes.length;

  return (
    <button
      type="button"
      data-post-type={type}
      onClick={() => onOpen(post)}
      className="post-tile group relative block aspect-square w-full cursor-pointer overflow-hidden rounded-xl border-2 text-left shadow-xs transition hover:shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:rounded-2xl"
      aria-label={`${typeName}: ${(title || body || post.authorName).slice(0, 80)}`}
    >
      {post.image ? (
        <>
          <img
            src={post.image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          {(title || body) && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-2 pt-9 sm:p-3 sm:pt-12">
              <p className="line-clamp-2 text-[10px] font-semibold leading-tight text-white sm:text-xs">{title || body}</p>
            </div>
          )}
        </>
      ) : (
        // Sem foto: o texto vira um pequeno cartaz, no tom do tipo do post.
        <div className="relative flex h-full w-full flex-col overflow-hidden px-2.5 pb-2 pt-9 sm:px-4 sm:pb-3 sm:pt-12">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-25 blur-xl sm:h-36 sm:w-36"
            style={{ background: "var(--pt)" }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 top-0 w-1"
            style={{ background: "var(--pt)" }}
          />
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <span
              aria-hidden="true"
              className="hidden font-display text-5xl font-black leading-[0.8] opacity-40 sm:block"
              style={{ color: "var(--pt)" }}
            >
              “
            </span>
            {title ? (
              <>
                <p className="line-clamp-3 font-display text-[12px] font-bold leading-tight text-foreground sm:line-clamp-3 sm:text-lg">
                  {title}
                </p>
                {body && (
                  <p className="mt-1 hidden text-xs leading-snug text-muted-foreground sm:line-clamp-3 sm:block">{body}</p>
                )}
              </>
            ) : (
              <p className="line-clamp-5 font-display text-[11px] font-semibold italic leading-snug text-foreground sm:line-clamp-5 sm:text-base">
                {body}
              </p>
            )}
          </div>
          <span className="post-type-label relative shrink-0 pt-1 text-[8px] font-bold uppercase tracking-wider sm:text-[10px]">
            {typeName}
          </span>
        </div>
      )}

      <Author post={post} onImage={!!post.image} />

      {/* Tipo do post: ícone na cor do tipo. */}
      <span
        className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full text-white shadow-xs sm:right-2.5 sm:top-2.5 sm:h-7 sm:w-7"
        style={{ background: "var(--pt)" }}
        title={typeName}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      {hot && (
        <span className="absolute bottom-1.5 right-1.5 rounded-full bg-card/90 px-1.5 py-0.5 text-[10px] shadow-xs sm:bottom-2.5 sm:right-2.5">
          🔥
        </span>
      )}

      {/* Números ao passar o mouse (no toque, o post inteiro está a um clique). */}
      <div className="pointer-events-none absolute inset-0 hidden items-center justify-center gap-4 bg-black/45 text-sm font-bold text-white opacity-0 transition group-hover:opacity-100 sm:flex">
        <span className="inline-flex items-center gap-1.5">
          <Heart className="h-4 w-4 fill-current" /> {hearts}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="h-4 w-4 fill-current" /> {post.comments.length}
        </span>
      </div>
    </button>
  );
}

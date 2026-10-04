// Miniatura de um post na grade do Explorar (como no Instagram): o texto do post em formato de
// cartaz, quem postou (foto e @), o tipo (cada um com a sua cor) e os números. Se o post tem foto, ela
// vira o fundo, escurecido. Clicar abre o post inteiro num modal.
import { ChefHat, HelpCircle, Heart, MessageCircle, MessagesSquare, Sparkles } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { initials, type Post, type PostType } from "@/lib/community";
import { pickName, type Names } from "@/lib/appearance-data";
import { normalizePostType, postDisplayImage, usePostTypeColor } from "@/lib/post-type";
import { engagement } from "@/lib/trending";
import { EmojiIcon } from "@/components/emoji-icon";

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
  const type = normalizePostType(post.type);
  const color = usePostTypeColor(type);
  const Icon = TYPE_ICON[type];
  const typeName = pickName(TYPE_LABEL[type], locale);
  const image = postDisplayImage(post);
  const title = post.title?.trim();
  const body = post.text?.trim();
  const hot = engagement(post) >= 8;
  const hearts = post.supports.length + post.likes.length;
  const tinted = `color-mix(in srgb, ${color} 18%, var(--card))`;

  const textMain = image ? "text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.55)]" : "text-foreground";
  const textSoft = image ? "text-white/85 [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]" : "text-muted-foreground";

  return (
    <button
      type="button"
      data-post-type={type}
      onClick={() => onOpen(post)}
      className="post-tile group relative block aspect-square w-full cursor-pointer overflow-hidden rounded-xl border-2 text-left shadow-xs transition hover:shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:rounded-2xl"
      style={{
        borderColor: color,
        backgroundColor: image ? "#1c1917" : tinted,
        boxShadow: `0 6px 20px -10px color-mix(in srgb, ${color} 70%, transparent)`,
      }}
      aria-label={`${typeName}: ${(title || body || post.authorName).slice(0, 80)}`}
    >
      {image && (
        <>
          <img
            src={image}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          {/* Escurece a foto para o texto ler bem. */}
          <div className="absolute inset-0 bg-black/55" />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to top, color-mix(in srgb, ${color} 45%, #000) 0%, transparent 65%)`, opacity: 0.7 }}
          />
        </>
      )}

      {/* O texto como cartaz, no tom do tipo do post. */}
      <div className="relative flex h-full w-full flex-col overflow-hidden px-3 pb-2.5 pt-10 sm:px-4 sm:pb-3 sm:pt-12">
        {!image && (
          <>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-40 blur-xl sm:h-36 sm:w-36"
              style={{ background: color }}
            />
            <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 top-0 w-1.5" style={{ background: color }} />
          </>
        )}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <span
            aria-hidden="true"
            className="hidden font-display text-5xl font-black leading-[0.8] sm:block"
            style={{ color, opacity: image ? 0.9 : 0.45 }}
          >
            “
          </span>
          {title ? (
            <>
              <p className={`line-clamp-3 font-display text-[14px] font-bold leading-tight sm:text-lg ${textMain}`}>{title}</p>
              {body && <p className={`mt-1 hidden text-xs leading-snug sm:line-clamp-3 sm:block ${textSoft}`}>{body}</p>}
            </>
          ) : (
            <p className={`line-clamp-5 font-display text-[13px] font-semibold italic leading-snug sm:text-base ${textMain}`}>{body}</p>
          )}
        </div>
        <span
          className="relative mt-1 w-fit shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider sm:text-[10px]"
          style={image ? { background: color, color: "#fff" } : { color }}
        >
          {typeName}
        </span>
      </div>

      <Author post={post} onImage={!!image} />

      {/* Tipo do post: ícone na cor do tipo. */}
      <span
        className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full text-white shadow-xs sm:right-2.5 sm:top-2.5 sm:h-7 sm:w-7"
        style={{ background: color }}
        title={typeName}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      {hot && (
        <span className="absolute bottom-1.5 right-1.5 grid h-5 w-5 place-items-center rounded-full bg-card/90 text-orange-500 shadow-xs sm:bottom-2.5 sm:right-2.5">
          <EmojiIcon emoji="🔥" className="h-3 w-3" />
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

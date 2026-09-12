import { Link } from "@tanstack/react-router";
import {
  Heart,
  ChefHat,
  MessageSquare,
  BadgeCheck,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Send,
  HelpCircle,
  BookOpen,
  Award,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import {
  type Post,
  type WeeklyTheme,
  type Challenge,
  type ProfessionalMember,
  toggleSupport,
  togglePrepared,
  addComment,
  voteThemePoll,
  toggleJoinChallenge,
  formatDate,
  initials,
} from "@/lib/community";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const currentUserId = user?.id || "guest";
  const hasSupported = (post.supports || []).includes(currentUserId);
  const supportCount = (post.supports || []).length;

  const hasPrepared = (post.preparedBy || []).includes(currentUserId);
  const preparedCount = (post.preparedBy || []).length;

  const handleSupport = () => {
    if (!user) {
      toast.info("Faça login para apoiar esta publicação.");
      return;
    }
    toggleSupport(post.id, user.id);
  };

  const handlePrepared = () => {
    if (!user) {
      toast.info("Faça login para registrar que preparou esta receita.");
      return;
    }
    togglePrepared(post.id, user.id);
    if (!hasPrepared) {
      toast.success("Que ótimo! Adicionamos este preparo à sua jornada.");
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info("Faça login para comentar.");
      return;
    }
    const trimmed = commentText.trim();
    if (!trimmed) return;

    try {
      addComment(post.id, { id: user.id, name: user.name, role: user.role }, trimmed);
      setCommentText("");
      toast.success("Comentário publicado!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível publicar o comentário.");
    }
  };

  let displayImage = post.image;
  if (!displayImage) {
    if (post.id === "p-rec-1") displayImage = "/images/recipes/oatmeal.jpg";
    else if (post.id === "p-rec-2") displayImage = "/images/recipes/roasted-veg.jpg";
    else if (post.type === "receita") displayImage = "/images/recipes/default-recipe.jpg";
    else if (post.id === "p-exp-1") displayImage = "/images/experiences/cooking.jpg";
  }

  let avatarImage = post.authorAvatar;
  if (!avatarImage) {
    if (post.authorId === "seed-nutri-maria") avatarImage = "/images/professionals/prof-1.jpg";
    else if (post.authorId === "seed-nutri-pedro") avatarImage = "/images/professionals/prof-2.jpg";
  }

  // --- RENDERS COMUNS ---
  const renderAuthorInfo = (isSpecialist = false) => (
    <div className="flex items-center gap-3 mb-4">
      <Link
        to="/perfil/$userId"
        params={{ userId: post.authorId }}
        className={`grid overflow-hidden place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary transition hover:opacity-80 shrink-0 ${isSpecialist ? "h-12 w-12" : "h-10 w-10"}`}
      >
        {avatarImage ? (
          <img src={avatarImage} alt={post.authorName} className="h-full w-full object-cover" />
        ) : (
          initials(post.authorName)
        )}
      </Link>
      <div>
        <div className="flex items-center gap-1.5">
          <Link
            to="/perfil/$userId"
            params={{ userId: post.authorId }}
            className={`font-semibold text-foreground hover:underline ${isSpecialist ? "text-base" : "text-sm"}`}
          >
            {post.authorName}
          </Link>
          {post.authorRole === "nutricionista" && (
            <BadgeCheck
              className="h-4 w-4 text-accent"
              title="Profissional de nutrição verificado"
            />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {isSpecialist && post.authorSpecialty ? post.authorSpecialty : formatDate(post.createdAt)}
        </p>
      </div>
    </div>
  );

  const renderCommentsSection = () =>
    showComments && (
      <div className="mt-4 border-t border-border/60 pt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
        {post.comments && post.comments.length > 0 ? (
          <div className="space-y-3">
            {post.comments.map((c) => (
              <div key={c.id} className="rounded-2xl bg-secondary/40 p-3.5 text-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-foreground flex items-center gap-1 text-xs">
                    {c.authorName}
                    {c.authorRole === "nutricionista" && (
                      <BadgeCheck className="h-3 w-3 text-accent" />
                    )}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDate(c.createdAt)}
                  </span>
                </div>
                <p className="text-foreground/90 leading-relaxed text-xs">{c.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4 bg-secondary/20 rounded-2xl">
            Seja a primeira pessoa a conversar.
          </p>
        )}

        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Deixe uma palavra ou dúvida..."
            className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent transition-colors shadow-sm"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground hover:bg-accent/90 disabled:opacity-50 transition shadow-sm"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    );

  const renderActions = (isQuestion = false, isRecipe = false) => (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/50">
      <div className="flex items-center gap-2">
        {!isQuestion && (
          <button
            type="button"
            onClick={handleSupport}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition shadow-xs ${
              hasSupported
                ? "bg-accent-soft text-accent border border-accent/20"
                : "bg-secondary text-foreground hover:bg-muted border border-transparent"
            }`}
          >
            <Heart className={`h-4 w-4 ${hasSupported ? "fill-accent text-accent" : ""}`} />
            <span>{hasSupported ? "Apoiado" : "Apoiar"}</span>
            {supportCount > 0 && <span className="opacity-80 ml-1">({supportCount})</span>}
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition shadow-xs ${
            isQuestion
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-foreground hover:bg-muted border border-transparent"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Conversa</span>
          <span className="opacity-80 ml-1">({post.comments?.length || 0})</span>
        </button>
      </div>

      {isRecipe && (
        <div className="flex flex-col items-end">
          <button
            type="button"
            onClick={handlePrepared}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition shadow-xs ${
              hasPrepared
                ? "bg-primary text-primary-foreground"
                : "bg-primary-soft text-primary hover:bg-primary/20 border border-primary/20"
            }`}
          >
            <ChefHat className="h-4 w-4" />
            <span>{hasPrepared ? "Eu preparei!" : "Eu preparei"}</span>
          </button>
          {preparedCount > 0 && (
            <span className="text-[10px] text-muted-foreground font-medium mt-1">
              💚 {preparedCount}{" "}
              {preparedCount === 1 ? "pessoa já preparou" : "pessoas já prepararam"}
            </span>
          )}
        </div>
      )}
    </div>
  );

  // --- RECEITA ---
  if (post.type === "receita") {
    return (
      <article className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm overflow-hidden flex flex-col transition hover:shadow-md">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-accent">
          <ChefHat className="h-4 w-4" /> Receita Comunitária
        </div>

        {renderAuthorInfo()}

        {displayImage && (
          <div className="my-4 -mx-6 h-64 sm:h-80 overflow-hidden">
            <img
              src={displayImage}
              alt="Receita"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <h3 className="text-2xl font-extrabold font-display text-foreground mb-3">{post.title}</h3>
        <p className="text-base text-foreground/80 leading-relaxed mb-6">{post.text}</p>

        {post.recipeData && (
          <div className="rounded-2xl border border-border bg-secondary/30 p-5 mb-2">
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-foreground mb-4 pb-4 border-b border-border/50">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-accent" /> {post.recipeData.prepTime}
              </span>
              <span>·</span>
              <span>{post.recipeData.servings}</span>
              <span>·</span>
              <span className="text-primary">{post.recipeData.difficulty}</span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Ingredientes
                </h4>
                <ul className="space-y-2 text-sm text-foreground">
                  {post.recipeData.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-accent font-bold">•</span> <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Preparo
                </h4>
                <ol className="space-y-3 text-sm text-foreground list-decimal list-inside">
                  {post.recipeData.steps.map((step, i) => (
                    <li key={i} className="leading-relaxed">
                      <span className="text-foreground/90">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {renderActions(false, true)}
        {renderCommentsSection()}
      </article>
    );
  }

  // --- EXPERIÊNCIA ---
  if (post.type === "experiencia") {
    return (
      <article className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm transition hover:shadow-md">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-primary">
          <Sparkles className="h-4 w-4" /> História da Comunidade
        </div>

        {renderAuthorInfo()}

        {post.title && (
          <h3 className="text-xl font-bold font-display text-foreground mb-2">{post.title}</h3>
        )}
        <p className="text-base text-foreground/90 leading-relaxed mb-4 whitespace-pre-line text-pretty">
          {post.text}
        </p>

        {displayImage && (
          <div className="mb-4 overflow-hidden rounded-2xl shadow-sm aspect-[16/9]">
            <img
              src={displayImage}
              alt="Experiência"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {renderActions()}
        {renderCommentsSection()}
      </article>
    );
  }

  // --- ESPECIALISTA ---
  if (post.type === "especialista") {
    return (
      <article className="rounded-3xl border-2 border-primary/20 bg-primary-soft/10 p-6 shadow-sm transition hover:shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <BookOpen className="h-4 w-4" /> Dica de Especialista
          </div>
          <Link
            to="/perfil/$userId"
            params={{ userId: post.authorId }}
            className="text-xs font-bold text-accent hover:underline"
          >
            Ver profissional
          </Link>
        </div>

        {renderAuthorInfo(true)}

        <div className="bg-card rounded-2xl p-5 border border-primary/10 shadow-xs mb-2">
          {post.title && (
            <h3 className="text-lg font-bold font-display text-foreground mb-2">{post.title}</h3>
          )}
          <p className="text-sm sm:text-base text-foreground/90 leading-relaxed whitespace-pre-line text-pretty">
            {post.text}
          </p>
        </div>

        {renderActions()}
        {renderCommentsSection()}
      </article>
    );
  }

  // --- PERGUNTA ---
  if (post.type === "pergunta") {
    return (
      <article className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm transition hover:shadow-md">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-accent">
          <HelpCircle className="h-4 w-4" /> Dúvida
        </div>

        {renderAuthorInfo()}

        <h3 className="text-xl sm:text-2xl font-bold font-display text-foreground mb-3 text-pretty leading-snug">
          {post.title || post.text}
        </h3>
        {post.title && (
          <p className="text-base text-foreground/80 leading-relaxed mb-4">{post.text}</p>
        )}

        {renderActions(true)}
        {renderCommentsSection()}
      </article>
    );
  }

  // --- GERAL (Fallback) ---
  return (
    <article className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm transition hover:shadow-md">
      {renderAuthorInfo()}
      {post.title && (
        <h3 className="text-lg font-bold font-display text-foreground mb-2">{post.title}</h3>
      )}
      <p className="text-base text-foreground/90 leading-relaxed mb-4 whitespace-pre-line text-pretty">
        {post.text}
      </p>
      {displayImage && (
        <div className="mb-4 overflow-hidden rounded-2xl shadow-sm aspect-[16/9]">
          <img
            src={displayImage}
            alt="Postagem"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      {renderActions()}
      {renderCommentsSection()}
    </article>
  );
}

interface WeeklyThemeCardProps {
  theme: WeeklyTheme;
  compact?: boolean;
}

export function WeeklyThemeCard({ theme, compact = false }: WeeklyThemeCardProps) {
  const { user } = useAuth();
  const currentUserId = user?.id || "guest";

  const totalVotes = theme?.poll?.options
    ? theme.poll.options.reduce((acc, opt) => acc + (opt.votes || 0), 0)
    : 0;

  const handleVote = (optionId: string) => {
    if (!user) {
      toast.info("Faça login para participar da enquete da semana.");
      return;
    }
    voteThemePoll(optionId, user.id);
    toast.success("Voto registrado! Obrigado por contribuir com o pulso da comunidade.");
  };

  if (!theme) return null;

  let themeImage = null;
  if (theme.id === "tema-alimentos-frescos") {
    themeImage = "/images/themes/fresh-ingredients.jpg";
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-card shadow-card flex flex-col">
      {/* Capa Editorial do Tema */}
      {themeImage && !compact && (
        <div className="h-48 sm:h-64 w-full relative">
          <img
            src={themeImage}
            alt={theme.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[10px] font-bold text-accent-foreground tracking-wide uppercase">
              <Sparkles className="h-3 w-3" /> {theme.badge || "Tema da Semana"}
            </span>
          </div>
        </div>
      )}

      <div
        className={`p-6 sm:p-8 ${!themeImage || compact ? "bg-gradient-to-br from-card via-card to-accent-soft/30" : ""}`}
      >
        {(!themeImage || compact) && (
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5" /> {theme.badge || "Tema da Semana"}
            </span>
            <span className="text-xs font-medium text-muted-foreground">{theme.currentWeek}</span>
          </div>
        )}

        {themeImage && !compact && (
          <div className="text-[11px] font-medium text-muted-foreground mb-3">
            {theme.currentWeek}
          </div>
        )}

        <h2 className="text-xl sm:text-2xl font-extrabold text-foreground font-display leading-tight">
          {theme.title}
        </h2>
        <p className="mt-2 text-sm text-foreground/80 leading-relaxed max-w-2xl">
          {theme.description}
        </p>

        {/* Pergunta da Semana */}
        {theme.questionOfTheWeek && (
          <div className="mt-5 rounded-2xl border border-accent/20 bg-card/90 p-4 backdrop-blur-xs">
            <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">
              Pergunta da Semana
            </p>
            <p className="text-sm font-medium text-foreground">“{theme.questionOfTheWeek}”</p>
          </div>
        )}

        {/* Enquete Interativa */}
        {!compact && theme.poll && theme.poll.options && (
          <div className="mt-6 border-t border-border/80 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Enquete: {theme.poll.question}
            </h3>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {theme.poll.options.map((opt) => {
                const hasVoted = (opt.votedUsers || []).includes(currentUserId);
                const percentage =
                  totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleVote(opt.id)}
                    className={`group relative overflow-hidden rounded-xl border p-3 text-left transition cursor-pointer ${
                      hasVoted
                        ? "border-accent bg-accent-soft/40 shadow-xs"
                        : "border-border bg-card hover:border-accent/60 hover:bg-secondary/40"
                    }`}
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-accent/15 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="relative flex items-center justify-between text-xs font-medium">
                      <span className="text-foreground pr-2">{opt.text}</span>
                      <span className="font-bold text-accent">{percentage}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground text-right">
              {totalVotes} membros já participaram desta reflexão
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/tema-da-semana"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
          >
            <span>Ver todas as reflexões e receitas deste tema</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

interface ChallengeCardProps {
  challenge: Challenge;
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const { user } = useAuth();
  const currentUserId = user?.id || "guest";
  const participants = challenge?.participants || [];
  const isJoined = participants.includes(currentUserId);

  const handleJoin = () => {
    if (!user) {
      toast.info("Faça login para entrar no desafio.");
      return;
    }
    toggleJoinChallenge(challenge.id, user.id);
    if (!isJoined) {
      toast.success("Você entrou no desafio! Sua jornada agradece cada pequeno passo.");
    } else {
      toast.info("Você saiu do desafio.");
    }
  };

  if (!challenge) return null;

  let challengeImage = null;
  if (challenge.id === "desafio-3-frescos") {
    challengeImage = "/images/challenges/salad-bowl.jpg";
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between transition hover:shadow-sm overflow-hidden">
      <div>
        {/* Cover image or colored header */}
        {challengeImage ? (
          <div className="h-28 w-full relative">
            <img
              src={challengeImage}
              alt={challenge.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute top-3 left-3 grid h-8 w-8 place-items-center rounded-lg bg-card/90 text-lg shadow-xs backdrop-blur-sm">
              {challenge.badgeIcon || "🎯"}
            </div>
            <div className="absolute top-3 right-3 rounded-full bg-card/90 px-2.5 py-0.5 text-[11px] font-bold text-foreground backdrop-blur-sm shadow-xs">
              {challenge.duration || "Semana"}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 p-5 pb-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-xl shadow-xs">
              {challenge.badgeIcon || "🎯"}
            </span>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {challenge.duration || "Semana"}
            </span>
          </div>
        )}

        <div className={`px-5 ${challengeImage ? "pt-4" : "pt-2"}`}>
          <h3 className="text-base font-bold text-foreground font-display">{challenge.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            {challenge.description}
          </p>
        </div>

        {challenge.steps && challenge.steps.length > 0 && (
          <div className="mt-4 space-y-1.5 px-5">
            <p className="text-[11px] font-semibold text-foreground/80 uppercase tracking-wider">
              Passos sugeridos:
            </p>
            <ul className="space-y-1 text-xs text-foreground/90">
              {challenge.steps.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-accent font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-border/60 pt-3 flex items-center justify-between px-5 pb-5">
        <span className="text-xs text-muted-foreground">👥 {participants.length} participando</span>
        <button
          type="button"
          onClick={handleJoin}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
            isJoined
              ? "bg-primary-soft text-primary font-bold"
              : "bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs"
          }`}
        >
          {isJoined ? "Participando ✓" : "Participar"}
        </button>
      </div>
    </div>
  );
}

interface ProfessionalCardProps {
  professional: ProfessionalMember;
}

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  if (!professional) return null;

  let avatarImage = null;
  if (professional.userId === "seed-nutri-maria") avatarImage = "/images/professionals/prof-1.jpg";
  else if (professional.userId === "seed-nutri-pedro")
    avatarImage = "/images/professionals/prof-2.jpg";
  else if (professional.userId === "seed-nutri-camila")
    avatarImage = "/images/professionals/prof-3.jpg";

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-start gap-3 mb-3">
          <span className="grid h-12 w-12 overflow-hidden place-items-center rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-xs shrink-0">
            {avatarImage ? (
              <img
                src={avatarImage}
                alt={professional.name}
                className="h-full w-full object-cover"
              />
            ) : (
              initials(professional.name || "Nutri")
            )}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-foreground truncate font-display">
                {professional.name}
              </h3>
              <BadgeCheck className="h-4 w-4 text-accent shrink-0" title="Registro verificado" />
            </div>
            <p className="text-xs text-accent font-medium">{professional.specialty}</p>
            <p className="text-[11px] text-muted-foreground">{professional.crn}</p>
          </div>
        </div>

        <p className="text-xs text-foreground/80 line-clamp-3 leading-relaxed mb-3">
          {professional.bio}
        </p>

        {professional.focus && professional.focus.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {professional.focus.slice(0, 3).map((f) => (
              <span
                key={f}
                className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        <div className="text-[11px] text-muted-foreground space-y-0.5">
          <p>📍 {professional.location}</p>
          <p>
            📚 {professional.articlesCount || 0} publicações · 🥗 {professional.recipesCount || 0}{" "}
            receitas
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
        <Link
          to="/perfil/$userId"
          params={{ userId: professional.userId }}
          className="text-xs font-semibold text-primary hover:underline"
        >
          Ver publicações
        </Link>
        <Link
          to="/paciente/agendamentos"
          className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 shadow-xs"
        >
          Agendar consulta
        </Link>
      </div>
    </div>
  );
}

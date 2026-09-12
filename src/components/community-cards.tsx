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

  const badgeConfig = {
    receita: {
      label: "Receita Comunitária",
      bg: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
      icon: ChefHat,
    },
    experiencia: {
      label: "Minha Experiência",
      bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
      icon: Sparkles,
    },
    especialista: {
      label: "Conteúdo de Especialista",
      bg: "bg-primary-soft text-primary font-semibold",
      icon: BookOpen,
    },
    pergunta: {
      label: "Pergunta da Comunidade",
      bg: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
      icon: HelpCircle,
    },
    geral: { label: "Compartilhamento", bg: "bg-secondary text-foreground", icon: MessageSquare },
  }[post.type || "geral"];

  const BadgeIcon = badgeConfig.icon;

  return (
    <article className="rounded-2xl border border-border/90 bg-card p-5 shadow-xs transition hover:shadow-sm">
      {/* Topo do Card: Autor e Tipo */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/perfil/$userId"
            params={{ userId: post.authorId }}
            className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary transition hover:opacity-80"
          >
            {initials(post.authorName)}
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <Link
                to="/perfil/$userId"
                params={{ userId: post.authorId }}
                className="text-sm font-semibold text-foreground hover:underline"
              >
                {post.authorName}
              </Link>
              {post.authorRole === "nutricionista" && (
                <span
                  className="inline-flex items-center gap-0.5 rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent"
                  title="Profissional de nutrição verificado"
                >
                  <BadgeCheck className="h-3 w-3" /> Especialista
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {post.authorSpecialty ||
                (post.authorRole === "nutricionista" ? "Nutricionista" : "Membro da comunidade")}
              {" · "}
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${badgeConfig.bg}`}
        >
          <BadgeIcon className="h-3.5 w-3.5" />
          <span>{badgeConfig.label}</span>
        </span>
      </div>

      {/* Conteúdo principal */}
      <div className="mt-4">
        {post.title && (
          <h3 className="text-base font-bold text-foreground font-display mb-1.5">{post.title}</h3>
        )}
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
          {post.text}
        </p>

        {/* Bloco de Receita se aplicável */}
        {post.type === "receita" && post.recipeData && (
          <div className="mt-4 rounded-xl border border-border/80 bg-secondary/30 p-4">
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-3 border-b border-border/60 pb-2">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Clock className="h-3.5 w-3.5 text-accent" /> {post.recipeData.prepTime}
              </span>
              <span>·</span>
              <span>{post.recipeData.servings}</span>
              <span>·</span>
              <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground">
                {post.recipeData.difficulty}
              </span>
              <span>·</span>
              <span className="text-accent font-medium">{post.recipeData.category}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Ingredientes
                </h4>
                <ul className="space-y-1 text-xs text-foreground">
                  {post.recipeData.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-accent">•</span>
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Preparo simples
                </h4>
                <ol className="space-y-1.5 text-xs text-foreground list-decimal list-inside">
                  {post.recipeData.steps.map((step, i) => (
                    <li key={i} className="leading-snug">
                      <span className="text-foreground/90">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Barra de Ações Comunitárias */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3 text-xs">
        <div className="flex items-center gap-2">
          {/* Botão Apoiar (sem vaidade de like, foco em acolhimento) */}
          <button
            type="button"
            onClick={handleSupport}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition cursor-pointer ${
              hasSupported
                ? "bg-accent-soft text-accent font-semibold"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
            title="Demonstrar apoio e incentivo a esta pessoa"
          >
            <Heart className={`h-3.5 w-3.5 ${hasSupported ? "fill-accent text-accent" : ""}`} />
            <span>{hasSupported ? "Apoiado" : "Apoiar"}</span>
            {supportCount > 0 && <span className="text-[11px] opacity-80">({supportCount})</span>}
          </button>

          {/* Botão "Eu preparei" para receitas */}
          {post.type === "receita" && (
            <button
              type="button"
              onClick={handlePrepared}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition cursor-pointer ${
                hasPrepared
                  ? "bg-primary-soft text-primary font-semibold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              title="Registrar que você preparou esta receita"
            >
              <ChefHat className="h-3.5 w-3.5" />
              <span>{hasPrepared ? "Eu preparei!" : "Eu preparei"}</span>
              {preparedCount > 0 && (
                <span className="text-[11px] opacity-80">({preparedCount})</span>
              )}
            </button>
          )}

          {/* Botão de Comentários */}
          <button
            type="button"
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Conversa ({post.comments?.length || 0})</span>
          </button>
        </div>

        {post.type === "receita" && preparedCount > 0 && (
          <span className="text-[11px] text-muted-foreground font-medium">
            💚 {preparedCount}{" "}
            {preparedCount === 1 ? "pessoa da comunidade já preparou" : "pessoas já prepararam"}
          </span>
        )}
      </div>

      {/* Área de comentários expansível */}
      {showComments && (
        <div className="mt-4 border-t border-border/60 pt-3 space-y-3">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Deixe uma palavra de carinho ou dúvida..."
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground hover:bg-accent/90 flex items-center gap-1"
            >
              <Send className="h-3 w-3" />
            </button>
          </form>

          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-2">
              {post.comments.map((c) => (
                <div key={c.id} className="rounded-xl bg-secondary/50 p-3 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      {c.authorName}
                      {c.authorRole === "nutricionista" && (
                        <BadgeCheck className="h-3 w-3 text-accent" />
                      )}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-foreground/90">{c.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              Seja a primeira pessoa a compartilhar um pensamento acolhedor aqui.
            </p>
          )}
        </div>
      )}
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

  return (
    <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-card via-card to-accent-soft/30 p-6 sm:p-8 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground tracking-wide uppercase">
          <Sparkles className="h-3.5 w-3.5" /> {theme.badge || "Tema da Semana"}
        </span>
        <span className="text-xs font-medium text-muted-foreground">{theme.currentWeek}</span>
      </div>

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

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between transition hover:shadow-sm">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-xl shadow-xs">
            {challenge.badgeIcon || "🎯"}
          </span>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {challenge.duration || "Semana"}
          </span>
        </div>

        <h3 className="text-base font-bold text-foreground font-display">{challenge.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {challenge.description}
        </p>

        {challenge.steps && challenge.steps.length > 0 && (
          <div className="mt-4 space-y-1.5">
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

      <div className="mt-5 border-t border-border/60 pt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          👥 {participants.length} pessoas participando
        </span>
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

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-start gap-3 mb-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-xs">
            {initials(professional.name || "Nutri")}
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

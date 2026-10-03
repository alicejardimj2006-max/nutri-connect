import { td } from "@/lib/i18n/data";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { CalendarCheck, Heart, ImagePlus, MessageCircle, Pin, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { AdminPerson } from "@/components/person-chip";
import { PostCardFrame } from "@/components/post-card-frame";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PostImage } from "@/components/post-image";
import { useAuth } from "@/hooks/use-auth";
import { useCommunity } from "@/hooks/use-community";
import { useI18n } from "@/hooks/use-i18n";
import { getProfessionalInfo } from "@/lib/community-admin";
import { formatDate, initials, type Post } from "@/lib/community";
import type { RemoteCommunity } from "@/lib/social/communities";
import {
  useCommunityBySlug,
  useJoinCommunity,
  useLeaveAdmin,
  useLeaveCommunity,
  useTogglePostPin,
} from "@/lib/social/communities-queries";
import {
  useAddComment,
  useCreatePost,
  useDeleteComment,
  useDeletePost,
  useFeed,
  useFeedRealtime,
  useToggleReaction,
} from "@/lib/social/feed-queries";

export const Route = createFileRoute("/comunidades/$slug")({
  head: () => ({
    meta: [
      { title: "Comunidade — NutriConnect" },
      {
        name: "description",
        content: "Feed da comunidade com publicações e comentários.",
      },
      { property: "og:title", content: "Comunidade — NutriConnect" },
      {
        property: "og:description",
        content: "Publicações, receitas e conversas acolhedoras sobre alimentação.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommunityFeed,
});

const DEFAULT_COVER = "/images/communities/friends-dinner.jpg";

function CommunityFeed() {
  const { slug } = useParams({ from: "/comunidades/$slug" });
  const { user } = useAuth();
  const { t } = useI18n();
  // Dados de profissional (profissão, conselho) ainda vêm do espelho local; o resto, do banco.
  const { profiles } = useCommunity();

  // O banco já esconde comunidades pendentes de quem não pode vê-las.
  const communityQuery = useCommunityBySlug(slug);
  const community = communityQuery.data ?? undefined;
  const feedQuery = useFeed(
    { scope: "comunidade", community: community?.id, limit: 50 },
    !!user && !!community,
  );
  useFeedRealtime(user?.id);
  const feed = feedQuery.data ?? [];

  if (communityQuery.isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-sm text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (!community) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-2xl font-bold text-primary">{t("cf.notFound")}</h1>
        <Link
          to="/comunidades"
          className="mt-3 inline-block text-sm font-semibold text-accent hover:underline"
        >
          {t("cf.back")}
        </Link>
      </div>
    );
  }

  const isAdminUser = !!user && community.adminUserId === user.id;
  const isAdminPro = !!user && community.professionalId === user.id;
  const isModerator = isAdminUser || isAdminPro;
  const isMember = community.isMember;
  // Só em comunidade ativa se publica (o banco também exige).
  const canPost = !!user && (isMember || isModerator) && community.status === "ativa";
  const pro = community.professionalId
    ? getProfessionalInfo(profiles, community.professionalId)
    : undefined;
  const coverImage = community.coverImage || DEFAULT_COVER;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <Link
        to="/comunidades"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-4"
      >
        &larr; {t("cf.back")}
      </Link>

      <header className="rounded-3xl border border-border bg-card shadow-card overflow-hidden">
        <div className="h-48 sm:h-64 w-full relative">
          <img src={coverImage} alt={community.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-card/90 px-3 py-1 text-[10px] font-bold text-foreground backdrop-blur-sm shadow-xs uppercase tracking-wider mb-2">
                {td(community.category)}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold font-display text-white">
                {community.name}
              </h1>
            </div>

            {user && (
              <MembershipAction
                variant="cover"
                community={community}
                isMember={isMember}
                isAdmin={isModerator}
                isPro={isAdminPro}
              />
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 justify-between items-start">
            <div className="max-w-2xl">
              <p className="text-base text-muted-foreground leading-relaxed">
                {community.description}
              </p>

              {community.objective && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">{t("invites.objective")} </span>
                  {community.objective}
                </p>
              )}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <AdminPerson
                  label={t("comunidades.adminUser")}
                  userId={community.adminUserId}
                  name={community.adminName}
                  vacantText={t("comunidades.awaitingNomination")}
                />
                <AdminPerson
                  label={t("comunidades.adminProfessional")}
                  detail={
                    pro
                      ? `${td(pro.profession)} · ${pro.council} ${pro.registration}/${pro.uf}`
                      : undefined
                  }
                  userId={community.professionalId}
                  name={community.professionalName}
                  verified
                  vacantText={t("comunidades.status.pendente")}
                />
              </div>
              {community.professionalId && user && community.professionalId !== user.id && (
                <Link
                  to="/profissionais/$professionalId"
                  params={{ professionalId: community.professionalId }}
                  search={{ comunidade: community.slug }}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-accent/40 px-4 py-2 text-xs font-semibold text-accent transition hover:bg-accent-soft"
                >
                  <CalendarCheck className="h-4 w-4" />
                  {t("comunidades.bookWithPro").replace("{name}", community.professionalName ?? "")}
                </Link>
              )}
            </div>

            <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
                <Users className="h-4 w-4 text-accent" /> {community.memberCount}{" "}
                {t("comunidades.members")}
              </span>

              {user && (
                <MembershipAction
                  variant="inline"
                  community={community}
                  isMember={isMember}
                  isAdmin={isModerator}
                  isPro={isAdminPro}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {community.status !== "ativa" && (
        <p className="mt-6 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm text-foreground">
          {community.status === "pendente"
            ? t("cf.pendingText")
            : `${t("cf.suspended")} ${[
                !community.adminUserId && t("cf.missingUser"),
                !community.professionalId && t("cf.missingPro"),
              ]
                .filter(Boolean)
                .join(t("cf.and"))}. ${t("cf.resume")}`}
        </p>
      )}

      {canPost ? (
        <Composer communityId={community.id} />
      ) : (
        <p className="mt-6 rounded-2xl border bg-card p-5 text-sm text-muted-foreground shadow-card">
          {!user ? (
            <>
              <Link to="/login" className="font-semibold text-accent hover:underline">
                {t("cf.signIn")}
              </Link>{" "}
              {t("cf.toParticipate")}
            </>
          ) : community.status !== "ativa" ? (
            t("cf.paused")
          ) : (
            t("cf.joinToPost")
          )}
        </p>
      )}

      <section className="mt-6 space-y-5">
        {feed.map((post) => (
          <CommunityPostCard
            key={post.id}
            post={post}
            userId={user?.id ?? null}
            isModerator={isModerator}
          />
        ))}
        {feed.length === 0 && !feedQuery.isLoading && (
          <p className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground shadow-card">
            {t("cf.noPosts")}
          </p>
        )}
      </section>
    </div>
  );
}

function MembershipAction({
  variant,
  community,
  isMember,
  isAdmin,
  isPro,
}: {
  variant: "cover" | "inline";
  community: RemoteCommunity;
  isMember: boolean;
  isAdmin: boolean;
  isPro: boolean;
}) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const join = useJoinCommunity();
  const leave = useLeaveCommunity();
  const leaveAdmin = useLeaveAdmin();
  const cover = variant === "cover";
  const base = cover
    ? "hidden sm:inline-flex rounded-full px-5 py-2.5 text-sm font-bold shadow-soft transition"
    : "sm:hidden w-full rounded-full px-5 py-2.5 text-sm font-bold transition";
  const secondary = cover
    ? "bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border border-white/30"
    : "border border-border bg-secondary text-foreground hover:bg-muted";
  const primary = cover
    ? "bg-accent text-accent-foreground hover:bg-accent/90"
    : "bg-accent text-accent-foreground hover:bg-accent/90 shadow-soft";

  if (isAdmin) {
    const consequence = isPro
      ? t("cf.consPro")
      : community.status === "pendente"
        ? t("cf.consPending")
        : t("cf.consUser");
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button type="button" className={`${base} ${secondary}`}>
            {t("cf.leaveAdmin")}
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cf.leaveAdminQ")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cf.leaveText")} {consequence}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cf.keepAdmin")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await leaveAdmin.mutateAsync(community.id);
                  toast.success(t("cf.leftToast"));
                  navigate({ to: "/comunidades" });
                } catch {
                  // o aviso de erro já é mostrado pelo hook
                }
              }}
            >
              {t("cf.leaveAdmin")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <button
      type="button"
      disabled={join.isPending || leave.isPending}
      onClick={() => (isMember ? leave.mutate(community.id) : join.mutate(community.id))}
      className={`${base} ${isMember ? secondary : primary} disabled:opacity-60`}
    >
      {isMember ? t("cf.leaveCommunity") : t("cf.join")}
    </button>
  );
}

function Composer({ communityId }: { communityId: string }) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!text.trim()) {
          toast.error(t("cf.writeSomething"));
          return;
        }
        try {
          // Publica no banco (a foto vai para o Storage); o feed da comunidade atualiza sozinho.
          await createPost.mutateAsync({
            type: "geral",
            text: text.trim(),
            image,
            communityId,
          });
          setText("");
          setImage(undefined);
          toast.success(t("cf.published"));
        } catch {
          // o aviso de erro já é mostrado pelo hook
        }
      }}
      className="mt-6 rounded-2xl border bg-card p-5 shadow-card"
    >
      <textarea
        rows={3}
        className="textarea"
        placeholder={t("cf.composerPlaceholder")}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {image && (
        <img
          src={image}
          alt={t("cf.previewAlt")}
          className="mt-3 max-h-64 rounded-xl object-cover"
        />
      )}
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
          <ImagePlus className="h-4 w-4" /> {t("cf.addPhoto")}
        </button>
        <button
          disabled={createPost.isPending}
          className="ml-auto rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {t("cf.postToCommunity")}
        </button>
      </div>
    </form>
  );
}

function CommunityPostCard({
  post,
  userId,
  isModerator,
}: {
  post: Post;
  userId: string | null;
  isModerator: boolean;
}) {
  const [comment, setComment] = useState("");
  const { t } = useI18n();
  const supported = !!userId && post.supports.includes(userId);
  const toggleReaction = useToggleReaction();
  const togglePin = useTogglePostPin();
  const deletePost = useDeletePost();
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();

  return (
    <PostCardFrame
      size="sm"
      className={`rounded-2xl border bg-card shadow-card ${post.pinned ? "border-accent/50" : ""}`}
    >
      {post.pinned && (
        <p className="mb-3 inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
          <Pin className="h-3.5 w-3.5" /> {t("cf.pinnedTag")}
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
          </Link>
          <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
        </div>
        {isModerator && (
          <div className="ml-auto flex gap-1">
            <button
              onClick={() => togglePin.mutate(post.id)}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label={post.pinned ? t("cf.unpin") : t("cf.pin")}
            >
              <Pin className="h-4 w-4" />
            </button>
            <button
              onClick={() =>
                deletePost.mutate(post.id, {
                  onSuccess: () => toast.success(t("cf.removedPost")),
                })
              }
              className="rounded-lg p-2 text-destructive transition hover:bg-destructive/10"
              aria-label={t("cf.removePost")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {post.image && (
        <PostImage src={post.image} alt={t("cf.photoAlt")} className="mt-3 w-full rounded-xl" />
      )}
      <p className="mt-3 whitespace-pre-line text-justify hyphens-auto text-sm leading-relaxed text-foreground">
        {post.text}
      </p>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <button
          onClick={() => {
            if (!userId) return toast.error(t("cf.loginToSupport"));
            toggleReaction.mutate({ postId: post.id, kind: "apoiar", on: !supported, userId });
          }}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-semibold transition ${
            supported ? "bg-accent-soft text-accent" : "hover:bg-secondary"
          }`}
        >
          <Heart className={`h-4 w-4 ${supported ? "fill-current" : ""}`} /> {post.supports.length}{" "}
          {post.supports.length === 1 ? t("cf.supportOne") : t("cf.supportMany")}
        </button>
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="h-4 w-4" /> {post.comments.length} {t("cf.comments")}
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
                <span className="ml-auto font-normal text-muted-foreground">
                  {formatDate(c.createdAt)}
                </span>
              </p>
              <p className="mt-1 text-sm text-foreground">{c.text}</p>
            </div>
            {(isModerator || c.authorId === userId) && (
              <button
                onClick={() =>
                  deleteComment.mutate(c.id, {
                    onSuccess: () => toast.success(t("cf.commentRemoved")),
                  })
                }
                className="rounded-lg p-2 text-destructive transition hover:bg-destructive/10"
                aria-label={t("cf.removeComment")}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        {userId && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!comment.trim()) return;
              try {
                await addComment.mutateAsync({ postId: post.id, text: comment.trim() });
                setComment("");
              } catch {
                // o aviso de erro já é mostrado pelo hook
              }
            }}
            className="flex gap-2"
          >
            <input
              className="input"
              placeholder={t("cf.commentPlaceholder")}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90">
              {t("cf.comment")}
            </button>
          </form>
        )}
      </div>
    </PostCardFrame>
  );
}

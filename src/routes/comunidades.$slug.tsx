import { td } from "@/lib/i18n/data";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Heart, ImagePlus, MessageCircle, Pin, Trash2, Users } from "lucide-react";
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
import { getProfessionalInfo, isPlatformAdmin, leaveAsAdmin } from "@/lib/community-admin";
import {
  addComment,
  createPost,
  formatDate,
  initials,
  removeComment,
  removePost,
  toggleLike,
  toggleMembership,
  togglePin,
  type Actor,
  type Community,
  type Post,
} from "@/lib/community";

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

function CommunityFeed() {
  const { slug } = useParams({ from: "/comunidades/$slug" });
  const { user } = useAuth();
  const { t } = useI18n();
  const { communities, posts, profiles, hydrated } = useCommunity();
  const actor: Actor | null = user ? { id: user.id, name: user.name } : null;

  const community = communities.find((c) => c.slug === slug);
  // Comunidade pendente ainda não existe publicamente: só quem a criou (ou a plataforma) a vê.
  const hiddenPending =
    community?.status === "pendente" &&
    community.adminUserId !== actor?.id &&
    !isPlatformAdmin(user);
  const feed = useMemo(
    () =>
      posts
        .filter((p) => p.communityId === community?.id)
        .sort((a, b) =>
          a.pinned !== b.pinned ? (a.pinned ? -1 : 1) : a.createdAt < b.createdAt ? 1 : -1,
        ),
    [posts, community?.id],
  );

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-sm text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (!community || hiddenPending) {
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

  const isAdminUser = !!actor && community.adminUserId === actor.id;
  const isAdminPro = !!actor && community.professionalId === actor.id;
  const isModerator = isAdminUser || isAdminPro;
  const isMember = !!actor && community.members.some((m) => m.userId === actor.id);
  const canPost = !!actor && (isMember || isModerator) && community.status === "ativa";
  const pro = community.professionalId
    ? getProfessionalInfo(profiles, community.professionalId)
    : undefined;

  let coverImage = "/images/communities/friends-dinner.jpg";
  if (community.id === "c-educacao") coverImage = "/images/communities/friends-dinner.jpg";
  if (community.id === "c-relacao") coverImage = "/images/experiences/cooking.jpg";
  if (community.id === "c-cozinha") coverImage = "/images/hero/kitchen-prep.jpg";

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

            {actor && (
              <MembershipAction
                variant="cover"
                community={community}
                actor={actor}
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
                  name={community.adminUserName}
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
            </div>

            <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
                <Users className="h-4 w-4 text-accent" /> {community.members.length}{" "}
                {t("comunidades.members")}
              </span>

              {actor && (
                <MembershipAction
                  variant="inline"
                  community={community}
                  actor={actor}
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
        <Composer communityId={community.id} actor={actor} />
      ) : (
        <p className="mt-6 rounded-2xl border bg-card p-5 text-sm text-muted-foreground shadow-card">
          {!actor ? (
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
          <PostCard key={post.id} post={post} actor={actor} isModerator={isModerator} />
        ))}
        {feed.length === 0 && (
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
  actor,
  isMember,
  isAdmin,
  isPro,
}: {
  variant: "cover" | "inline";
  community: Community;
  actor: Actor;
  isMember: boolean;
  isAdmin: boolean;
  isPro: boolean;
}) {
  const navigate = useNavigate();
  const { t } = useI18n();
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
              onClick={() => {
                leaveAsAdmin(community.id, actor);
                toast.success(t("cf.leftToast"));
                navigate({ to: "/comunidades" });
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
      onClick={() => toggleMembership(community.id, actor)}
      className={`${base} ${isMember ? secondary : primary}`}
    >
      {isMember ? t("cf.leaveCommunity") : t("cf.join")}
    </button>
  );
}

function Composer({ communityId, actor }: { communityId: string; actor: Actor }) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) {
          toast.error(t("cf.writeSomething"));
          return;
        }
        createPost({ communityId, actor, text: text.trim(), ...(image ? { image } : {}) });
        setText("");
        setImage(undefined);
        toast.success(t("cf.published"));
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
        <button className="ml-auto rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90">
          {t("cf.postToCommunity")}
        </button>
      </div>
    </form>
  );
}

function PostCard({
  post,
  actor,
  isModerator,
}: {
  post: Post;
  actor: Actor | null;
  isModerator: boolean;
}) {
  const [comment, setComment] = useState("");
  const { t } = useI18n();
  const liked = !!actor && post.likes.includes(actor.id);

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
              onClick={() => togglePin(post.id)}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label={post.pinned ? t("cf.unpin") : t("cf.pin")}
            >
              <Pin className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                removePost(post.id);
                toast.success(t("cf.removedPost"));
              }}
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
            if (!actor) return toast.error(t("cf.loginToSupport"));
            toggleLike(post.id, actor.id);
          }}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-semibold transition ${
            liked ? "bg-accent-soft text-accent" : "hover:bg-secondary"
          }`}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} /> {post.likes.length}{" "}
          {post.likes.length === 1 ? t("cf.supportOne") : t("cf.supportMany")}
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
            {isModerator && (
              <button
                onClick={() => {
                  removeComment(post.id, c.id);
                  toast.success(t("cf.commentRemoved"));
                }}
                className="rounded-lg p-2 text-destructive transition hover:bg-destructive/10"
                aria-label={t("cf.removeComment")}
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

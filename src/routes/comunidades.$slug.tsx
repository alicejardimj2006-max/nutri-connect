import { td } from "@/lib/i18n/data";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { CalendarCheck, ImagePlus, Pin, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { AdminPerson } from "@/components/person-chip";
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
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { useProfessionalMap } from "@/lib/social/professionals-queries";
import { communityCover, type RemoteCommunity } from "@/lib/social/communities";
import {
  useCommunityBySlug,
  useJoinCommunity,
  useLeaveAdmin,
  useLeaveCommunity,
  useTogglePostPin,
} from "@/lib/social/communities-queries";
import { PostCard } from "@/components/community-cards";
import { useCreatePost, useDeletePost, useFeed, useFeedRealtime } from "@/lib/social/feed-queries";

type Actor = { id: string; name: string };

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
  const actor: Actor | null = user ? { id: user.id, name: user.name } : null;
  // Dados de profissional (profissão, conselho) vêm da tabela professionals; o resto, do banco.
  const professionals = useProfessionalMap(!!user);

  // O banco já esconde comunidades pendentes de quem não pode vê-las.
  const communityQuery = useCommunityBySlug(slug);
  const community = communityQuery.data ?? undefined;
  const hydrated = !communityQuery.isLoading;
  // Publicações da comunidade, do banco (fixadas primeiro).
  const remoteFeed = useFeed(
    { scope: "comunidade", community: community?.id, limit: 40 },
    !!user && !!community,
  );
  useFeedRealtime(user?.id);
  const feed = useMemo(
    () =>
      [...(remoteFeed.data ?? [])].sort((a, b) =>
        a.pinned !== b.pinned ? (a.pinned ? -1 : 1) : a.createdAt < b.createdAt ? 1 : -1,
      ),
    [remoteFeed.data],
  );

  if (!hydrated) {
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

  const isAdminUser = !!actor && community.adminUserId === actor.id;
  const isAdminPro = !!actor && community.professionalId === actor.id;
  const isModerator = isAdminUser || isAdminPro;
  const isMember = community.isMember;
  const canPost = !!actor && (isMember || isModerator) && community.status === "ativa";
  const pro = community.professionalId
    ? professionals.map.get(community.professionalId)?.info
    : undefined;

  const coverImage = communityCover(community);

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
              {community.professionalId && actor && community.professionalId !== actor.id && (
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
        <Composer communityId={community.id} />
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
          <div key={post.id}>
            {(isModerator || post.pinned) && (
              <ModeratorBar postId={post.id} pinned={!!post.pinned} canModerate={isModerator} />
            )}
            <PostCard post={post} />
          </div>
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
  community: RemoteCommunity;
  actor: Actor;
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
  const create = useCreatePost();
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
        create.mutate(
          { type: "geral", communityId, text: text.trim(), ...(image ? { image } : {}) },
          {
            onSuccess: () => {
              setText("");
              setImage(undefined);
              toast.success(t("cf.published"));
            },
          },
        );
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
          disabled={create.isPending}
          className="ml-auto rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {t("cf.postToCommunity")}
        </button>
      </div>
    </form>
  );
}

/** Fixar e remover publicações (admins da comunidade). */
function ModeratorBar({
  postId,
  pinned,
  canModerate,
}: {
  postId: string;
  pinned: boolean;
  canModerate: boolean;
}) {
  const { t } = useI18n();
  const remove = useDeletePost();
  const togglePin = useTogglePostPin();
  return (
    <div className="mb-1.5 flex items-center gap-1 px-1">
      {pinned && (
        <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
          <Pin className="h-3.5 w-3.5" /> {t("cf.pinnedTag")}
        </span>
      )}
      {canModerate && (
        <span className="ml-auto flex gap-1">
          <button
            type="button"
            onClick={() => togglePin.mutate(postId)}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label={pinned ? t("cf.unpin") : t("cf.pin")}
            title={pinned ? t("cf.unpin") : t("cf.pin")}
          >
            <Pin className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              remove.mutate(postId, { onSuccess: () => toast.success(t("cf.removedPost")) })
            }
            className="rounded-lg p-2 text-destructive transition hover:bg-destructive/10"
            aria-label={t("cf.removePost")}
            title={t("cf.removePost")}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </span>
      )}
    </div>
  );
}

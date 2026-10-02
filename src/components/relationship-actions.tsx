import { Check, Clock, UserCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/hooks/use-i18n";
import type { Relationship } from "@/lib/social/api";
import {
  useFollowProfessional,
  useRemoveFriendship,
  useRequestFriendship,
  useUnfollowProfessional,
} from "@/lib/social/queries";

/**
 * Botões de relação. Regras do banco: usuário comum ↔ usuário comum = amizade (pedido + aceite);
 * qualquer pessoa → profissional = seguir; profissional → usuário comum não existe.
 */
export function RelationshipActions({
  userId,
  name,
  relationship,
  targetIsProfessional,
  viewerIsProfessional,
}: {
  userId: string;
  name: string;
  relationship: Relationship;
  targetIsProfessional: boolean;
  viewerIsProfessional: boolean;
}) {
  const { t } = useI18n();
  const requestFriendship = useRequestFriendship();
  const removeFriendship = useRemoveFriendship();
  const follow = useFollowProfessional();
  const unfollow = useUnfollowProfessional();
  const busy =
    requestFriendship.isPending ||
    removeFriendship.isPending ||
    follow.isPending ||
    unfollow.isPending;

  const base =
    "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition disabled:opacity-60 cursor-pointer";
  const primary = `${base} bg-accent text-accent-foreground shadow-soft hover:bg-accent/90`;
  const outline = `${base} border border-border bg-card text-foreground shadow-xs hover:bg-secondary`;

  if (targetIsProfessional) {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {relationship === "seguindo" ? (
          <button
            type="button"
            disabled={busy}
            className={outline}
            onClick={() =>
              unfollow.mutate(userId, {
                onSuccess: () =>
                  toast.success(t("profile.unfollowedToast").replace("{name}", name)),
              })
            }
            title={t("profile.unfollow")}
          >
            <Check className="h-4 w-4" /> {t("profile.followingBadge")}
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            className={primary}
            onClick={() =>
              follow.mutate(userId, {
                onSuccess: () => toast.success(t("profile.followedToast").replace("{name}", name)),
              })
            }
          >
            <UserPlus className="h-4 w-4" /> {t("profile.follow")}
          </button>
        )}
      </div>
    );
  }

  // Profissionais não têm amizade com usuários comuns.
  if (viewerIsProfessional) return null;

  const remove = (message: string) =>
    removeFriendship.mutate(userId, { onSuccess: () => toast.success(message) });

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {relationship === "amigo" ? (
        <button
          type="button"
          disabled={busy}
          className={outline}
          onClick={() => remove(t("profile.friendRemovedToast"))}
          title={t("profile.removeFriend")}
        >
          <UserCheck className="h-4 w-4" /> {t("profile.friendsBadge")}
        </button>
      ) : relationship === "pedido_enviado" ? (
        <button
          type="button"
          disabled={busy}
          className={outline}
          onClick={() => remove(t("profile.requestCancelledToast"))}
          title={t("profile.cancelRequest")}
        >
          <Clock className="h-4 w-4" /> {t("profile.requestSent")}
        </button>
      ) : relationship === "pedido_recebido" ? (
        <>
          {/* Pedir amizade a quem já pediu a você aceita o pedido (regra do banco). */}
          <button
            type="button"
            disabled={busy}
            className={primary}
            onClick={() =>
              requestFriendship.mutate(userId, {
                onSuccess: () => toast.success(t("profile.friendAcceptedToast")),
              })
            }
          >
            <Check className="h-4 w-4" /> {t("profile.acceptRequest")}
          </button>
          <button
            type="button"
            disabled={busy}
            className={outline}
            onClick={() => remove(t("profile.requestCancelledToast"))}
          >
            {t("profile.declineRequest")}
          </button>
        </>
      ) : (
        <button
          type="button"
          disabled={busy}
          className={primary}
          onClick={() =>
            requestFriendship.mutate(userId, {
              onSuccess: () => toast.success(t("profile.friendRequestSentToast")),
            })
          }
        >
          <UserPlus className="h-4 w-4" /> {t("profile.addFriend")}
        </button>
      )}
    </div>
  );
}

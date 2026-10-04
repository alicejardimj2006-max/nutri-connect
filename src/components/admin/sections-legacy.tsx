import { td } from "@/lib/i18n/data";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { syncVerifications } from "@/lib/profile-sync";
import { PostImage } from "@/components/post-image";
import { ModerationPanel } from "@/components/moderation-panel";
import { useCommunity } from "@/hooks/use-community";
import { useI18n } from "@/hooks/use-i18n";
import { formatDate, type Community, type VerificationRequest } from "@/lib/community";
import {
  designateAdminUser,
  needsAdminUser,
  needsProfessional,
  rankEngagedMembers,
  rankProfessionalsFor,
  reviewVerification,
} from "@/lib/community-admin";

/** Pedidos de verificação profissional (aguardando e já analisados). */
export function VerificationsSection({ user }: { user: { id: string; name: string; isAdmin?: boolean } }) {
  const { t } = useI18n();
  const state = useCommunity();

  // Admins veem todos os pedidos, com links temporários para as imagens privadas.
  useEffect(() => {
    if (user.isAdmin) void syncVerifications(true);
  }, [user.isAdmin]);

  const pending = state.verifications.filter((v) => v.status === "em_analise");
  const reviewed = state.verifications.filter((v) => v.status !== "em_analise");

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">{t("admin.awaiting")}</h2>
        {pending.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
            {t("admin.noPending")}
          </p>
        ) : (
          pending.map((v) => <VerificationCard key={v.id} request={v} reviewer={{ id: user.id, name: user.name }} />)
        )}
      </section>

      {reviewed.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">{t("admin.reviewed")}</h2>
          <ul className="divide-y divide-border/60 rounded-2xl border border-border/70 bg-card">
            {reviewed.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <span className="text-sm text-foreground">
                  {v.fullName}{" "}
                  <span className="text-muted-foreground">
                    · {td(v.profession)} {v.council} {v.registration}/{v.uf}
                  </span>
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    v.status === "aprovado" ? "bg-accent-soft text-accent" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {v.status === "aprovado" ? t("admin.approved") : t("admin.rejectedLabel")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/** Comunidades que ainda precisam de administrador ou de profissional. */
export function CommunitiesSection() {
  const { t } = useI18n();
  const state = useCommunity();
  const attention = state.communities.filter((c) => c.status !== "ativa");
  return (
    <div className="space-y-4">
      {attention.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
          {t("admin.allComplete")}
        </p>
      ) : (
        attention.map((c) => <CommunityCase key={c.id} community={c} />)
      )}
    </div>
  );
}

/** Fila de denúncias (inclui as abertas pela moderação automática por IA). */
export function ModerationSection() {
  return <ModerationPanel />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
    </div>
  );
}

function VerificationCard({
  request: v,
  reviewer,
}: {
  request: VerificationRequest;
  reviewer: { id: string; name: string };
}) {
  const { t } = useI18n();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <article className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-foreground">{v.fullName}</h3>
        <span className="text-xs text-muted-foreground">
          {t("admin.sentOn")} {formatDate(v.submittedAt)}
        </span>
      </div>

      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        <Row label={t("admin.account")} value={v.userName} />
        <Row label={t("verify.profession")} value={td(v.profession)} />
        <Row label={t("verify.registration")} value={`${v.council} ${v.registration}/${v.uf}`} />
        <Row label={t("verify.fields")} value={v.specialties.map((s) => td(s)).join(", ")} />
      </dl>
      {v.bio && <p className="mt-3 text-sm text-muted-foreground">{v.bio}</p>}
      {v.publicLookupUrl && (
        <a
          href={v.publicLookupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-semibold text-accent hover:underline"
        >
          {t("admin.publicLookup")}
        </a>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <figure>
          <PostImage src={v.documentImage} alt={t("admin.docAlt")} className="rounded-xl" />
          <figcaption className="mt-1 text-[11px] text-muted-foreground">
            {t("admin.docCaption")}
          </figcaption>
        </figure>
        <figure>
          <PostImage src={v.selfieImage} alt={t("admin.selfieAlt")} className="rounded-xl" />
          <figcaption className="mt-1 text-[11px] text-muted-foreground">
            {t("admin.selfieAlt")}
          </figcaption>
        </figure>
      </div>

      {rejecting ? (
        <div className="mt-4 space-y-3">
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("admin.rejectReason")}
            className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-destructive"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={async () => {
                try {
                  await reviewVerification({
                    requestId: v.id,
                    reviewer,
                    approve: false,
                    reason,
                  });
                  toast.success(t("admin.rejectedToast"));
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : t("reset.error"));
                }
              }}
              className="rounded-full bg-destructive px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {t("admin.confirmReject")}
            </button>
            <button
              type="button"
              onClick={() => setRejecting(false)}
              className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground"
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={async () => {
              try {
                await reviewVerification({ requestId: v.id, reviewer, approve: true });
                toast.success(`${v.fullName} ${t("admin.approvedToast")}`);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : t("reset.error"));
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-accent/90"
          >
            <Check className="h-4 w-4" /> {t("admin.approve")}
          </button>
          <button
            type="button"
            onClick={() => setRejecting(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary"
          >
            <X className="h-4 w-4" /> {t("admin.reject")}
          </button>
        </div>
      )}
    </article>
  );
}

function CommunityCase({ community: c }: { community: Community }) {
  const { t } = useI18n();
  const state = useCommunity();
  const invited = needsProfessional(c) ? rankProfessionalsFor(c, state) : [];
  const candidates = needsAdminUser(c) ? rankEngagedMembers(c, state) : [];

  return (
    <article className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-display text-lg font-bold text-foreground">{c.name}</h3>
        <span className="rounded-full bg-warning/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground">
          {c.status === "pendente"
            ? t("comunidades.status.pendente")
            : t("comunidades.status.suspensa")}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{td(c.category)}</p>

      {needsProfessional(c) && (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-foreground">
            {t("admin.missingPro")}
          </p>
          {invited.length === 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">{t("admin.noProAvailable")}</p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              {t("admin.invitedTo")} {invited.map((r) => r.profile.name).join(", ")}.{" "}
              {t("admin.firstToAccept")}
            </p>
          )}
        </div>
      )}

      {needsAdminUser(c) && (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-foreground">
            {t("admin.missingUser")}
          </p>
          {candidates.length === 0 ? (
            <p className="mt-1 text-sm text-muted-foreground">{t("admin.noEligible")}</p>
          ) : (
            <ul className="mt-2 divide-y divide-border/60 rounded-xl border border-border/70">
              {candidates.map((m) => (
                <li
                  key={m.userId}
                  className="flex flex-wrap items-center justify-between gap-2 p-3"
                >
                  <span className="text-sm text-foreground">
                    {m.name}{" "}
                    <span className="text-xs text-muted-foreground">
                      · {m.posts} {t("admin.stats")}, {m.comments} {t("admin.statsComments")},{" "}
                      {m.supports} {t("admin.statsSupports")}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        designateAdminUser(c.id, m.userId);
                        toast.success(`${m.name} ${t("admin.designated")} ${c.name}.`);
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : t("admin.designateError"));
                      }
                    }}
                    className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground transition hover:bg-accent/90"
                  >
                    {t("admin.designate")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  );
}

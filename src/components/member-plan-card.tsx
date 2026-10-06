// Cartão do perfil de membros na página do profissional: o plano, o botão de assinar e, para quem
// já é membro (ou para o próprio profissional), o conteúdo exclusivo.
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, Crown, Lock } from "lucide-react";
import { useTr } from "@/components/appearance-editor";
import { useAuth } from "@/hooks/use-auth";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { formatDate, formatMoney } from "@/lib/clinical/format";
import {
  useCancelSubscription,
  useMemberContent,
  useMemberPlan,
  useMySubscriptions,
} from "@/lib/social/members-queries";

export function MemberPlanCard({ professionalId }: { professionalId: string }) {
  const tr = useTr();
  const { user } = useAuth();
  const { locale } = useClinicalI18n();
  const plan = useMemberPlan(professionalId, !!user);
  const subs = useMySubscriptions(!!user && user.id !== professionalId);
  const cancel = useCancelSubscription();
  const isSelf = user?.id === professionalId;
  const p = plan.data;
  const canRead = !!p && (p.isMember || isSelf);
  const content = useMemberContent(professionalId, canRead);
  if (!user || !p) return null;
  // Quem não é dono só vê a oferta quando ela está disponível.
  if (!p.active && !isSelf && !p.isMember) return null;

  const mine = (subs.data ?? []).find(
    (s) =>
      s.professionalId === professionalId &&
      ["ativa", "cancelando", "inadimplente"].includes(s.status),
  );

  return (
    <section className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent-soft/60 via-card to-card p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
          <Crown className="h-5 w-5 text-accent" /> {p.title}
        </h2>
        <p className="shrink-0 text-right">
          <span className="font-display text-xl font-extrabold text-foreground">
            {formatMoney(p.priceCents, locale)}
          </span>
          <span className="text-xs text-muted-foreground">
            {" "}
            /{tr(["mês", "month", "mes", "mois"])}
          </span>
        </p>
      </div>
      {p.description && <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>}

      <ul className="mt-3 space-y-1.5 text-sm text-foreground">
        {p.discountPercent > 0 && (
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            {p.discountPercent}%{" "}
            {tr([
              "de desconto nas consultas",
              "off consultations",
              "de descuento en consultas",
              "de réduction sur les consultations",
            ])}
          </li>
        )}
        {p.benefits.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            {b}
          </li>
        ))}
        {p.contentCount > 0 && (
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            {p.contentCount}{" "}
            {tr([
              "conteúdos exclusivos",
              "exclusive posts",
              "contenidos exclusivos",
              "contenus exclusifs",
            ])}
          </li>
        )}
      </ul>

      {isSelf ? (
        <Link
          to="/painel/membros"
          className="mt-4 inline-block text-xs font-semibold text-accent hover:underline"
        >
          {tr([
            "Gerenciar meu perfil de membros",
            "Manage my members profile",
            "Gestionar mi perfil de miembros",
            "Gérer mon profil membres",
          ])}
        </Link>
      ) : p.isMember ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-full bg-accent px-3 py-1 font-semibold text-accent-foreground">
            {tr(["Você é membro", "You are a member", "Eres miembro", "Vous êtes membre"])}
          </span>
          {mine?.currentPeriodEnd && (
            <span className="text-muted-foreground">
              {mine.status === "cancelando"
                ? tr(["Acesso até", "Access until", "Acceso hasta", "Accès jusqu'au"])
                : tr(["Renova em", "Renews on", "Se renueva el", "Renouvellement le"])}{" "}
              {formatDate(mine.currentPeriodEnd, locale, { day: "numeric", month: "short" })}
            </span>
          )}
          {mine && mine.status !== "cancelando" && (
            <button
              type="button"
              disabled={cancel.isPending}
              onClick={() =>
                cancel.mutate(mine.id, {
                  onSuccess: () =>
                    toast.success(
                      tr([
                        "Assinatura cancelada: o acesso continua até o fim do período.",
                        "Subscription cancelled: access continues until the period ends.",
                        "Suscripción cancelada: el acceso sigue hasta el fin del período.",
                        "Abonnement annulé : l'accès continue jusqu'à la fin de la période.",
                      ]),
                    ),
                })
              }
              className="cursor-pointer font-semibold text-destructive hover:underline"
            >
              {tr([
                "Cancelar assinatura",
                "Cancel subscription",
                "Cancelar suscripción",
                "Annuler l'abonnement",
              ])}
            </button>
          )}
        </div>
      ) : (
        <Link
          to="/assinar/$professionalId"
          params={{ professionalId }}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground shadow-soft transition hover:bg-accent/90"
        >
          {tr(["Virar membro", "Become a member", "Hacerme miembro", "Devenir membre"])}
        </Link>
      )}

      {canRead && (
        <div className="mt-5 border-t border-border/60 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            {tr([
              "Conteúdo exclusivo",
              "Exclusive content",
              "Contenido exclusivo",
              "Contenu exclusif",
            ])}
          </h3>
          {(content.data ?? []).length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {tr(["Em breve.", "Coming soon.", "Próximamente.", "Bientôt."])}
            </p>
          ) : (
            <ul className="mt-2 space-y-3">
              {(content.data ?? []).map((c) => (
                <li key={c.id} className="rounded-xl bg-secondary/40 p-3">
                  <p className="text-sm font-semibold text-foreground">{c.title}</p>
                  <p className="mt-1 whitespace-pre-line text-sm text-foreground/90">{c.body}</p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {formatDate(c.createdAt, locale, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {!canRead && p.contentCount > 0 && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          {tr([
            "O conteúdo exclusivo abre para membros.",
            "Exclusive content opens for members.",
            "El contenido exclusivo se abre para miembros.",
            "Le contenu exclusif s'ouvre aux membres.",
          ])}
        </p>
      )}
    </section>
  );
}

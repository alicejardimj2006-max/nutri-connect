// Assinatura do perfil de membros de um profissional. O formulário do Stripe fica embutido na página.
import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { AuthGateLoading } from "@/components/site-chrome";
import { Loading } from "@/components/clinical/ui";
import { useTr } from "@/components/appearance-editor";
import { useRequireAuth } from "@/hooks/use-auth";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { formatMoney } from "@/lib/clinical/format";
import { createMemberCheckout } from "@/lib/social/members";
import { useMemberPlan } from "@/lib/social/members-queries";
import { AppScreen } from "@/components/app-screen";

export const Route = createFileRoute("/assinar/$professionalId")({
  head: () => ({ meta: [{ title: "Virar membro — NutriConnect" }] }),
  component: SubscribePage,
});

type StripeModules = {
  stripePromise: Promise<import("@stripe/stripe-js").Stripe | null>;
  Provider: typeof import("@stripe/react-stripe-js").EmbeddedCheckoutProvider;
  Checkout: typeof import("@stripe/react-stripe-js").EmbeddedCheckout;
};

function SubscribePage() {
  const { professionalId } = Route.useParams();
  const { user, hydrated } = useRequireAuth();
  const tr = useTr();
  const { locale } = useClinicalI18n();
  const plan = useMemberPlan(professionalId, !!user);
  const p = plan.data;
  const payable = !!user && !!p && p.active && !p.isMember && user.id !== professionalId;

  const [stripe, setStripe] = useState<StripeModules | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!payable) return;
    let cancelled = false;
    void (async () => {
      try {
        const [{ clientSecret: secret, publishableKey }, js, react] = await Promise.all([
          createMemberCheckout(professionalId),
          import("@stripe/stripe-js"),
          import("@stripe/react-stripe-js"),
        ]);
        if (cancelled) return;
        setStripe({
          stripePromise: js.loadStripe(publishableKey),
          Provider: react.EmbeddedCheckoutProvider,
          Checkout: react.EmbeddedCheckout,
        });
        setClientSecret(secret);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [payable, professionalId]);

  if (!hydrated || !user) return <AuthGateLoading />;

  return (
    <AppScreen>
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
        <Link
          to="/profissionais/$professionalId"
          params={{ professionalId }}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />{" "}
          {tr(["Voltar ao perfil", "Back to profile", "Volver al perfil", "Retour au profil"])}
        </Link>
        <h1 className="font-display text-2xl font-extrabold">
          {tr(["Virar membro", "Become a member", "Hacerme miembro", "Devenir membre"])}
        </h1>

        {plan.isLoading ? (
          <div className="mt-8">
            <Loading />
          </div>
        ) : !p || (!p.active && !p.isMember) ? (
          <Notice>
            {tr([
              "Este perfil de membros não está disponível agora.",
              "This members profile is not available right now.",
              "Este perfil de miembros no está disponible ahora.",
              "Ce profil membres n'est pas disponible pour le moment.",
            ])}
          </Notice>
        ) : p.isMember ? (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary-soft/50 p-5">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm font-semibold">
              {tr([
                "Você já é membro.",
                "You are already a member.",
                "Ya eres miembro.",
                "Vous êtes déjà membre.",
              ])}
            </p>
          </div>
        ) : user.id === professionalId ? (
          <Notice>
            {tr([
              "Você não pode assinar o próprio perfil.",
              "You can't subscribe to your own profile.",
              "No puedes suscribirte a tu propio perfil.",
              "Vous ne pouvez pas vous abonner à votre propre profil.",
            ])}
          </Notice>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <aside className="space-y-3">
              <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
                <p className="font-display font-bold">{p.title}</p>
                <p className="mt-1 text-2xl font-extrabold">
                  {formatMoney(p.priceCents, locale)}
                  <span className="text-xs font-normal text-muted-foreground">
                    {" "}
                    /{tr(["mês", "month", "mes", "mois"])}
                  </span>
                </p>
                {p.discountPercent > 0 && (
                  <p className="mt-2 text-sm text-foreground">
                    {p.discountPercent}%{" "}
                    {tr([
                      "de desconto nas consultas",
                      "off consultations",
                      "de descuento en consultas",
                      "de réduction sur les consultations",
                    ])}
                  </p>
                )}
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                  {p.benefits.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </section>
              <p className="px-1 text-[11px] leading-snug text-muted-foreground">
                {tr([
                  "Cobrança mensal no cartão, pelo Stripe. Cancele quando quiser: o acesso vale até o fim do período pago. Veja os",
                  "Monthly card charge through Stripe. Cancel anytime: access lasts until the end of the paid period. See the",
                  "Cobro mensual con tarjeta, por Stripe. Cancela cuando quieras: el acceso vale hasta el fin del período pagado. Mira los",
                  "Prélèvement mensuel par carte, via Stripe. Annulez quand vous voulez : l'accès dure jusqu'à la fin de la période payée. Voir les",
                ])}{" "}
                <Link to="/termos" className="underline">
                  {tr([
                    "Termos de Uso",
                    "Terms of Use",
                    "Términos de Uso",
                    "Conditions d'utilisation",
                  ])}
                </Link>
                .
              </p>
            </aside>
            <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Lock className="h-4 w-4 text-primary" />{" "}
                {tr(["Pagamento seguro", "Secure payment", "Pago seguro", "Paiement sécurisé"])}
              </div>
              {error ? (
                <p className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{error}</p>
              ) : stripe && clientSecret ? (
                <stripe.Provider
                  stripe={stripe.stripePromise}
                  options={{ fetchClientSecret: () => Promise.resolve(clientSecret) }}
                >
                  <stripe.Checkout />
                </stripe.Provider>
              ) : (
                <div className="py-10">
                  <Loading />
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </AppScreen>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-2xl border border-border/70 bg-card p-6 text-sm">{children}</div>
  );
}

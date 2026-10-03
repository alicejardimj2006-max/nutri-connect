import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarClock, CheckCircle2, Clock, Lock, MapPin, Video } from "lucide-react";
import { AuthGateLoading, SiteHeader } from "@/components/site-chrome";
import { SiteFooter } from "@/components/site-footer";
import { Avatar, Loading } from "@/components/clinical/ui";
import { useRequireAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { usePeople } from "@/lib/clinical/queries";
import { createCheckoutSession } from "@/lib/clinical/payments";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { formatDate, formatMoney, formatTime } from "@/lib/clinical/format";

export const Route = createFileRoute("/pagamento/$appointmentId")({
  head: () => ({ meta: [{ title: "Pagamento da consulta — NutriConnect" }] }),
  component: PagamentoPage,
});

type StripeModules = {
  stripePromise: Promise<import("@stripe/stripe-js").Stripe | null>;
  Provider: typeof import("@stripe/react-stripe-js").EmbeddedCheckoutProvider;
  Checkout: typeof import("@stripe/react-stripe-js").EmbeddedCheckout;
};

/** Minutos e segundos que faltam até a reserva do horário vencer. */
function useCountdown(until: string | null | undefined) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!until) return;
    const tick = () => setLeft(Math.max(0, Math.floor((new Date(until).getTime() - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [until]);
  return left;
}

function PagamentoPage() {
  const { appointmentId } = Route.useParams();
  const { user, hydrated } = useRequireAuth();
  const { locale } = useClinicalI18n();

  const appt = useQuery({
    queryKey: ["payment-page", "appointment", appointmentId],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("id", appointmentId)
        .maybeSingle();
      return data;
    },
  });
  const people = usePeople(appt.data ? [appt.data.professional_id] : []);
  const pro = appt.data ? people.data?.get(appt.data.professional_id) : undefined;

  const left = useCountdown(appt.data?.hold_expires_at);
  const expired = left === 0;
  const payable =
    !!appt.data &&
    appt.data.patient_id === user?.id &&
    appt.data.status === "aguardando_pagamento" &&
    !expired;

  // Carrega o Stripe só no navegador e só quando há algo a pagar.
  const [stripe, setStripe] = useState<StripeModules | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!payable) return;
    let cancelled = false;
    void (async () => {
      try {
        const [{ clientSecret: secret, publishableKey }, js, react] = await Promise.all([
          createCheckoutSession(appointmentId),
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
  }, [payable, appointmentId]);

  if (!hydrated || !user) return <AuthGateLoading />;

  const a = appt.data;
  const mm = left === null ? "--" : String(Math.floor(left / 60)).padStart(2, "0");
  const ss = left === null ? "--" : String(left % 60).padStart(2, "0");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Link
          to="/acompanhamento/consultas"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Minhas consultas
        </Link>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Pagamento da consulta</h1>

        {appt.isLoading ? (
          <div className="mt-8">
            <Loading />
          </div>
        ) : !a || a.patient_id !== user.id ? (
          <Notice title="Consulta não encontrada">
            Não encontramos essa consulta na sua conta.
          </Notice>
        ) : a.status !== "aguardando_pagamento" && !["agendada", "confirmada"].includes(a.status) ? (
          <Notice title="Esta consulta não está aguardando pagamento">
            O horário pode ter sido cancelado ou já ter passado.
          </Notice>
        ) : ["agendada", "confirmada"].includes(a.status) ? (
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary-soft/50 p-5">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold">Pagamento confirmado!</p>
              <p className="mt-1 text-sm text-muted-foreground">Sua consulta está agendada.</p>
              <Link
                to="/acompanhamento/consultas"
                className="mt-3 inline-block rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground"
              >
                Ver minhas consultas
              </Link>
            </div>
          </div>
        ) : expired ? (
          <Notice title="O tempo para pagar acabou">
            O horário foi liberado. Escolha um novo horário para agendar.
            <Link
              to="/profissionais"
              className="mt-3 block w-fit rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground"
            >
              Buscar profissionais
            </Link>
          </Notice>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[22rem_1fr] lg:items-start">
            {/* Resumo da consulta */}
            <aside className="space-y-4 lg:sticky lg:top-24">
              <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Resumo
                </h2>
                <div className="mt-4 flex items-center gap-3">
                  <Avatar name={pro?.name ?? "…"} url={pro?.avatarUrl} size="md" />
                  <div className="min-w-0">
                    <p className="truncate font-display font-bold">{pro?.name ?? "…"}</p>
                    <p className="text-xs text-muted-foreground">Consulta de nutrição</p>
                  </div>
                </div>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex items-start gap-2.5">
                    <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <div>
                      <dt className="sr-only">Data e hora</dt>
                      <dd className="font-medium capitalize">
                        {formatDate(a.starts_at, locale, {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </dd>
                      <dd className="text-muted-foreground">
                        {formatTime(a.starts_at, locale)} – {formatTime(a.ends_at, locale)}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    {a.modality === "online" ? (
                      <Video className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    ) : (
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    )}
                    <div>
                      <dt className="sr-only">Modalidade</dt>
                      <dd className="font-medium">
                        {a.modality === "online" ? "On-line" : "Presencial"}
                      </dd>
                      {a.modality !== "online" && a.location && (
                        <dd className="text-muted-foreground">{a.location}</dd>
                      )}
                    </div>
                  </div>
                </dl>
                <div className="mt-5 flex items-end justify-between border-t border-border/60 pt-4">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-display text-2xl font-extrabold text-foreground">
                    {formatMoney(a.price_cents, locale)}
                  </span>
                </div>
              </section>

              <section className="rounded-2xl border border-accent/30 bg-accent-soft/60 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-accent">
                  <Clock className="h-4 w-4" /> Horário reservado por {mm}:{ss}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Depois disso o horário é liberado para outras pessoas.
                </p>
              </section>

              <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
                Cancelamento com pelo menos 24 horas de antecedência dá direito ao estorno. Veja os{" "}
                <Link to="/termos" className="underline">
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link to="/privacidade" className="underline">
                  Política de Privacidade
                </Link>
                .
              </p>
            </aside>

            {/* Formulário do Stripe */}
            <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs sm:p-6">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Lock className="h-4 w-4 text-primary" /> Pagamento seguro
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  Processado pelo Stripe
                </span>
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
              <p className="mt-4 text-center text-[11px] text-muted-foreground">
                Não guardamos os dados do seu cartão.
              </p>
            </section>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 rounded-2xl border border-border/70 bg-card p-6">
      <p className="font-display text-lg font-bold">{title}</p>
      <div className="mt-1 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

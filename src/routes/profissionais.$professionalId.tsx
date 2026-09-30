import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarCheck,
  Clock,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Settings,
  Video,
} from "lucide-react";
import { SiteHeader } from "@/components/site-chrome";
import { VerifiedBadge } from "@/components/person-chip";
import { SlotPicker } from "@/components/clinical/slot-picker";
import {
  Avatar,
  Card,
  EmptyState,
  Field,
  LinkStatusBadge,
  Loading,
  buttonPrimary,
  buttonSecondary,
  inputClass,
  plainText,
} from "@/components/clinical/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import * as api from "@/lib/clinical/api";
import type { AppointmentModality, Slot } from "@/lib/clinical/api";
import {
  useClinicalMutation,
  useDirectoryEntry,
  useLinks,
  useProfessional,
} from "@/lib/clinical/queries";
import { formatDate, formatMoney, formatTime } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { startCheckout } from "@/lib/clinical/payments";
import { td } from "@/lib/i18n/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profissionais/$professionalId")({
  validateSearch: (search: Record<string, unknown>): { comunidade?: string } => ({
    comunidade: typeof search.comunidade === "string" ? search.comunidade : undefined,
  }),
  head: () => ({ meta: [{ title: "Agendar consulta — NutriConnect" }] }),
  component: ProfessionalPage,
});

function ProfessionalPage() {
  const { professionalId } = Route.useParams();
  const { comunidade } = Route.useSearch();
  const { t, locale } = useClinicalI18n();
  const { user, hydrated } = useAuth();
  const entry = useDirectoryEntry(professionalId);
  const pro = useProfessional(professionalId);
  const links = useLinks("patient", !!user);

  if (entry.isLoading || pro.isLoading) {
    return (
      <Shell>
        <Loading />
      </Shell>
    );
  }
  const p = entry.data;
  if (!p || !pro.data) {
    return (
      <Shell>
        <EmptyState icon={HeartHandshake} title={t("pro.notFound")} />
      </Shell>
    );
  }

  const isSelf = user?.id === professionalId;
  const link = links.data?.find(
    (l) =>
      l.professional_id === professionalId && (l.status === "ativo" || l.status === "pendente"),
  );

  return (
    <Shell>
      <Link
        to="/profissionais"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("pro.back")}
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div className="min-w-0 space-y-4">
          <Card>
            <div className="flex items-start gap-4">
              <Avatar name={p.name ?? ""} url={p.avatar_url} size="lg" />
              <div className="min-w-0">
                <h1 className="flex items-center gap-1.5 font-display text-2xl font-extrabold">
                  {p.name} <VerifiedBadge className="h-5 w-5" />
                </h1>
                <p className="text-sm text-muted-foreground">
                  {td(p.profession, locale)} · {p.council} {p.registration}/{p.uf}
                </p>
                {p.headline && <p className="mt-2 text-sm text-foreground">{p.headline}</p>}
              </div>
            </div>
            {p.bio && <p className="mt-4 text-sm leading-relaxed text-foreground">{p.bio}</p>}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(p.specialties ?? []).map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  {td(s, locale)}
                </span>
              ))}
            </div>
            <Link
              to="/perfil/$userId"
              params={{ userId: professionalId }}
              className="mt-4 inline-block text-xs font-semibold text-accent hover:underline"
            >
              {t("pro.seeProfile")}
            </Link>
          </Card>

          <Card title={t("pro.howItWorks")}>
            <dl className="space-y-3 text-sm">
              <Row icon={CalendarCheck} label={t("pro.price")}>
                {p.consultation_price_cents
                  ? formatMoney(p.consultation_price_cents, locale)
                  : t("directory.free")}
              </Row>
              <Row icon={Clock} label={t("pro.duration")}>
                {t("pro.minutes", { n: p.consultation_duration_min ?? 60 })}
              </Row>
              {p.offers_presential && (
                <Row icon={MapPin} label={t("modality.presencial")}>
                  {pro.data.address || t("pro.addressOnBooking")}
                </Row>
              )}
              {p.offers_online && (
                <Row icon={Video} label={t("modality.online")}>
                  {pro.data.online_instructions || t("pro.onlineDefault")}
                </Row>
              )}
            </dl>
          </Card>

          {user && !isSelf && (
            <LinkCard
              professionalId={professionalId}
              professionalName={p.name ?? ""}
              link={link}
              communitySlug={comunidade}
            />
          )}
        </div>

        <div className="min-w-0">
          {isSelf ? (
            <Card>
              <p className="text-sm text-muted-foreground">{t("pro.selfNotice")}</p>
              <Link to="/painel/configuracoes" className={cn(buttonSecondary, "mt-3")}>
                <Settings className="h-4 w-4" /> {t("pro.editSettings")}
              </Link>
            </Card>
          ) : !p.accepting_patients ? (
            <EmptyState icon={CalendarCheck} title={t("directory.notAccepting")} />
          ) : (
            <BookingCard
              professionalId={professionalId}
              offersOnline={!!p.offers_online}
              offersPresential={!!p.offers_presential}
              priceCents={p.consultation_price_cents ?? 0}
              needsPayment={!!p.mp_connected && (p.consultation_price_cents ?? 0) > 0}
              loggedIn={!!user}
              authReady={hydrated}
              communitySlug={comunidade}
            />
          )}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-background text-foreground", plainText)}>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:pb-12">
        {children}
      </main>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
      <div>
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className="text-foreground">{children}</dd>
      </div>
    </div>
  );
}

function BookingCard({
  professionalId,
  offersOnline,
  offersPresential,
  priceCents,
  needsPayment,
  loggedIn,
  authReady,
  communitySlug,
}: {
  professionalId: string;
  offersOnline: boolean;
  offersPresential: boolean;
  priceCents: number;
  needsPayment: boolean;
  loggedIn: boolean;
  authReady: boolean;
  communitySlug?: string;
}) {
  const { t, locale } = useClinicalI18n();
  const navigate = useNavigate();
  const [modality, setModality] = useState<AppointmentModality>(
    offersOnline ? "online" : "presencial",
  );
  const [slot, setSlot] = useState<Slot | null>(null);
  const [notes, setNotes] = useState("");

  const book = useClinicalMutation(
    (s: Slot) =>
      api.bookAppointment({
        professionalId,
        startsAt: s.starts_at,
        modality,
        notes,
        communitySlug,
      }),
    {
      success: (appt) =>
        appt.status === "aguardando_pagamento" ? t("booking.goingToPayment") : t("booking.done"),
      onSuccess: async (appt) => {
        if (appt.status === "aguardando_pagamento") {
          try {
            window.location.href = await startCheckout(appt.id);
            return;
          } catch {
            // Sem checkout disponível: o paciente paga depois pela lista de consultas.
          }
        }
        navigate({ to: "/acompanhamento/consultas" });
      },
    },
  );

  return (
    <Card title={t("booking.title")}>
      {offersOnline && offersPresential && (
        <div className="mb-4 flex w-fit items-center gap-1 rounded-full border border-border bg-background p-1">
          {(["online", "presencial"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModality(m)}
              aria-pressed={modality === m}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition",
                modality === m ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {m === "online" ? (
                <Video className="h-3.5 w-3.5" />
              ) : (
                <MapPin className="h-3.5 w-3.5" />
              )}
              {t(`modality.${m}`)}
            </button>
          ))}
        </div>
      )}

      <SlotPicker
        professionalId={professionalId}
        modality={modality}
        value={slot?.starts_at}
        onChange={setSlot}
      />

      <Field label={t("booking.notes")} hint={t("common.optional")} className="mt-5">
        <textarea
          rows={3}
          className={cn(inputClass, "resize-none")}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("booking.notesPlaceholder")}
        />
      </Field>

      {slot && (
        <div className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm">
          <p className="font-semibold text-foreground">
            {formatDate(slot.starts_at, locale, { weekday: "long", day: "numeric", month: "long" })}{" "}
            · {formatTime(slot.starts_at, locale)}
          </p>
          <p className="text-xs text-muted-foreground">
            {t(`modality.${modality}`)}
            {priceCents > 0 && ` · ${formatMoney(priceCents, locale)}`}
            {needsPayment && ` · ${t("booking.payOnline")}`}
            {!needsPayment && priceCents > 0 && ` · ${t("booking.payDirect")}`}
          </p>
        </div>
      )}

      <div className="mt-5 flex justify-end">
        {authReady && !loggedIn ? (
          <Link
            to="/login"
            search={{ redirect: `/profissionais/${professionalId}` }}
            className={buttonPrimary}
          >
            {t("booking.loginToBook")}
          </Link>
        ) : (
          <button
            type="button"
            className={buttonPrimary}
            disabled={!slot || book.isPending}
            onClick={() => slot && book.mutate(slot)}
          >
            <CalendarCheck className="h-4 w-4" />
            {needsPayment ? t("booking.bookAndPay") : t("booking.book")}
          </button>
        )}
      </div>
    </Card>
  );
}

function LinkCard({
  professionalId,
  professionalName,
  link,
  communitySlug,
}: {
  professionalId: string;
  professionalName: string;
  link?: api.CareLink;
  communitySlug?: string;
}) {
  const { t } = useClinicalI18n();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const request = useClinicalMutation(
    () => api.requestLink({ professionalId, message, communitySlug }),
    { success: t("link.requested"), onSuccess: () => setOpen(false) },
  );

  if (link?.status === "ativo") {
    return (
      <Card>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-foreground">
            {t("link.youAreFollowed", { name: professionalName })}
          </p>
          <LinkStatusBadge status="ativo" />
        </div>
        <Link
          to="/acompanhamento/mensagens"
          search={{ com: professionalId }}
          className={cn(buttonSecondary, "mt-3")}
        >
          <MessageCircle className="h-4 w-4" /> {t("link.sendMessage")}
        </Link>
      </Card>
    );
  }
  if (link?.status === "pendente") {
    return (
      <Card>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{t("link.pendingText")}</p>
          <LinkStatusBadge status="pendente" />
        </div>
      </Card>
    );
  }
  return (
    <Card>
      <p className="text-sm text-muted-foreground">{t("link.requestText")}</p>
      <button type="button" className={cn(buttonSecondary, "mt-3")} onClick={() => setOpen(true)}>
        <HeartHandshake className="h-4 w-4" /> {t("link.request")}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("link.requestTitle", { name: professionalName })}</DialogTitle>
            <DialogDescription>{t("link.requestDialogText")}</DialogDescription>
          </DialogHeader>
          <Field label={t("link.message")} hint={t("common.optional")}>
            <textarea
              rows={4}
              className={cn(inputClass, "resize-none")}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("link.messagePlaceholder")}
            />
          </Field>
          <DialogFooter>
            <button type="button" className={buttonSecondary} onClick={() => setOpen(false)}>
              {t("common.back")}
            </button>
            <button
              type="button"
              className={buttonPrimary}
              disabled={request.isPending}
              onClick={() => request.mutate(undefined)}
            >
              {t("link.send")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Copy, MessageCircle, Search, TicketPlus, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LinkRequests } from "@/components/clinical/link-requests";
import {
  Avatar,
  Card,
  EmptyState,
  Field,
  LinkStatusBadge,
  Loading,
  PageHeader,
  Tabs,
  buttonGhost,
  buttonPrimary,
  buttonSecondary,
  inputClass,
} from "@/components/clinical/ui";
import * as api from "@/lib/clinical/api";
import type { CareInvite } from "@/lib/clinical/api";
import { useClinicalMutation, useInvites, useLinks, usePeople, qk } from "@/lib/clinical/queries";
import { formatDate } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/pacientes/")({
  component: PatientsPage,
});

type Tab = "ativos" | "pedidos" | "encerrados";

function PatientsPage() {
  const { t, locale } = useClinicalI18n();
  const links = useLinks("professional");
  const [tab, setTab] = useState<Tab>("ativos");
  const [query, setQuery] = useState("");
  const [inviting, setInviting] = useState(false);

  const all = useMemo(() => links.data ?? [], [links.data]);
  const people = usePeople(all.map((l) => l.patient_id));
  const groups = useMemo(() => {
    // Um paciente pode ter vínculos antigos e um atual: mostra só o mais recente de cada.
    const latest = new Map<string, api.CareLink>();
    for (const l of all) if (!latest.has(l.patient_id)) latest.set(l.patient_id, l);
    const list = [...latest.values()];
    return {
      ativos: list.filter((l) => l.status === "ativo"),
      pedidos: all.filter((l) => l.status === "pendente"),
      encerrados: list.filter((l) => l.status === "encerrado" || l.status === "recusado"),
    };
  }, [all]);

  const q = query.trim().toLowerCase();
  const visible = groups[tab].filter(
    (l) => !q || (people.data?.get(l.patient_id)?.name ?? "").toLowerCase().includes(q),
  );

  return (
    <>
      <PageHeader
        title={t("patients.title")}
        subtitle={t("patients.subtitle")}
        action={
          <button type="button" className={buttonPrimary} onClick={() => setInviting(true)}>
            <TicketPlus className="h-4 w-4" /> {t("patients.invite")}
          </button>
        }
      />

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "ativos", label: t("patients.active"), count: groups.ativos.length },
          { value: "pedidos", label: t("patients.requests"), count: groups.pedidos.length },
          { value: "encerrados", label: t("patients.ended"), count: groups.encerrados.length },
        ]}
      />

      {tab === "pedidos" ? (
        <Card>{links.isLoading ? <Loading /> : <LinkRequests links={all} />}</Card>
      ) : (
        <Card padded={false}>
          <div className="border-b border-border/60 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                className={cn(inputClass, "pl-10")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("patients.search")}
              />
            </div>
          </div>
          {links.isLoading ? (
            <Loading />
          ) : visible.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={Users}
                title={tab === "ativos" ? t("patients.emptyActive") : t("patients.emptyEnded")}
                text={tab === "ativos" ? t("patients.emptyActiveText") : undefined}
              />
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {visible.map((l) => {
                const person = people.data?.get(l.patient_id);
                return (
                  <li key={l.id}>
                    <Link
                      to="/painel/pacientes/$patientId"
                      params={{ patientId: l.patient_id }}
                      className="flex items-center gap-3 px-4 py-3 transition hover:bg-secondary/50"
                    >
                      <Avatar name={person?.name ?? "…"} url={person?.avatarUrl} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {person?.name ?? "…"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t(`link.origin.${l.origin}`)} ·{" "}
                          {l.status === "ativo"
                            ? t("patientHome.since", {
                                date: formatDate(l.responded_at ?? l.created_at, locale),
                              })
                            : formatDate(l.ended_at ?? l.responded_at ?? l.created_at, locale)}
                        </p>
                      </div>
                      <LinkStatusBadge status={l.status} />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      <InvitesCard />
      {inviting && <InviteDialog onClose={() => setInviting(false)} />}
    </>
  );
}

function inviteUrl(code: string) {
  return `${window.location.origin}/convite/${code}`;
}

function inviteState(inv: CareInvite): "usado" | "revogado" | "expirado" | "ativo" {
  if (inv.used_at) return "usado";
  if (inv.revoked_at) return "revogado";
  if (new Date(inv.expires_at) < new Date()) return "expirado";
  return "ativo";
}

function copy(text: string, done: string) {
  void navigator.clipboard.writeText(text).then(() => toast.success(done));
}

function InvitesCard() {
  const { t, locale } = useClinicalI18n();
  const invites = useInvites();
  const revoke = useClinicalMutation((code: string) => api.revokeInvite(code), {
    success: t("invites.revoked"),
    invalidate: [qk.invites()],
  });
  if (!invites.data?.length) return null;

  return (
    <Card title={t("invites.title")} className="mt-4">
      <ul className="divide-y divide-border/60">
        {invites.data.map((inv) => {
          const state = inviteState(inv);
          return (
            <li key={inv.code} className="flex flex-wrap items-center gap-2 py-2.5 text-sm">
              <code className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs font-bold">
                {inv.code}
              </code>
              <span className="min-w-0 flex-1 truncate text-foreground">
                {inv.invitee_name || inv.invitee_email || t("invites.noName")}
              </span>
              <span className="text-xs text-muted-foreground">
                {t(`invites.state.${state}`)} ·{" "}
                {formatDate(inv.created_at, locale, { day: "numeric", month: "short" })}
              </span>
              {state === "ativo" && (
                <>
                  <button
                    type="button"
                    className={buttonGhost}
                    onClick={() => copy(inviteUrl(inv.code), t("invites.copied"))}
                  >
                    <Copy className="h-3.5 w-3.5" /> {t("invites.copy")}
                  </button>
                  <button
                    type="button"
                    className={buttonGhost}
                    onClick={() => revoke.mutate(inv.code)}
                  >
                    {t("invites.revoke")}
                  </button>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function InviteDialog({ onClose }: { onClose: () => void }) {
  const { t } = useClinicalI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [created, setCreated] = useState<CareInvite | null>(null);
  const create = useClinicalMutation(
    () => api.createInvite({ inviteeName: name, inviteeEmail: email }),
    {
      invalidate: [qk.invites()],
      onSuccess: (inv) => setCreated(inv),
    },
  );

  const url = created ? inviteUrl(created.code) : "";
  const whatsapp = created
    ? `https://wa.me/?text=${encodeURIComponent(t("invites.whatsappText", { url }))}`
    : "";

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("invites.dialogTitle")}</DialogTitle>
          <DialogDescription>{t("invites.dialogText")}</DialogDescription>
        </DialogHeader>
        {created ? (
          <div className="space-y-3">
            <div className="rounded-2xl bg-secondary p-4 text-center">
              <p className="text-xs text-muted-foreground">{t("invites.code")}</p>
              <p className="font-mono text-3xl font-extrabold tracking-widest text-foreground">
                {created.code}
              </p>
              <p className="mt-2 break-all text-xs text-muted-foreground">{url}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                className={buttonSecondary}
                onClick={() => copy(url, t("invites.copied"))}
              >
                <Copy className="h-4 w-4" /> {t("invites.copyLink")}
              </button>
              <a href={whatsapp} target="_blank" rel="noreferrer" className={buttonSecondary}>
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
            <p className="text-center text-xs text-muted-foreground">{t("invites.validity")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Field label={t("invites.name")} hint={t("common.optional")}>
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label={t("invites.email")} hint={t("common.optional")}>
              <input
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
          </div>
        )}
        <DialogFooter>
          <button type="button" className={buttonSecondary} onClick={onClose}>
            {created ? t("common.close") : t("common.cancel")}
          </button>
          {!created && (
            <button
              type="button"
              className={buttonPrimary}
              disabled={create.isPending}
              onClick={() => create.mutate(undefined)}
            >
              {t("invites.generate")}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

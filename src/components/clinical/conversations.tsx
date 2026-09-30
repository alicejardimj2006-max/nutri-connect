import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useConversations, useLinks, usePeople } from "@/lib/clinical/queries";
import { formatDate, formatTime, isSameDay } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { cn } from "@/lib/utils";
import { ChatThread } from "./chat";
import { Avatar, EmptyState, Loading, buttonGhost } from "./ui";

interface Contact {
  otherId: string;
  patientId: string;
  professionalId: string;
  active: boolean;
}

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return desktop;
}

/** Lista de conversas + conversa aberta. Serve ao paciente e ao profissional. */
export function Conversations({
  role,
  meId,
  initialOtherId,
}: {
  role: "patient" | "professional";
  meId: string;
  initialOtherId?: string;
}) {
  const { t, locale } = useClinicalI18n();
  const links = useLinks(role);
  const summaries = useConversations();

  const contacts = useMemo(() => {
    const map = new Map<string, Contact>();
    for (const l of links.data ?? []) {
      if (l.status !== "ativo" && l.status !== "encerrado") continue;
      const otherId = role === "patient" ? l.professional_id : l.patient_id;
      const prev = map.get(otherId);
      map.set(otherId, {
        otherId,
        patientId: l.patient_id,
        professionalId: l.professional_id,
        active: (prev?.active ?? false) || l.status === "ativo",
      });
    }
    const last = (c: Contact) =>
      summaries.data?.find(
        (s) => s.patientId === c.patientId && s.professionalId === c.professionalId,
      );
    return [...map.values()].sort((a, b) => {
      const la = last(a)?.last.created_at ?? "";
      const lb = last(b)?.last.created_at ?? "";
      return lb.localeCompare(la) || Number(b.active) - Number(a.active);
    });
  }, [links.data, summaries.data, role]);

  const people = usePeople(contacts.map((c) => c.otherId));
  const isDesktop = useIsDesktop();
  const [selected, setSelected] = useState<string | null>(initialOtherId ?? null);
  const current = contacts.find((c) => c.otherId === selected) ?? null;
  // No desktop abre a primeira conversa; no celular a lista vem primeiro.
  const desktopCurrent = current ?? contacts[0] ?? null;

  if (links.isLoading) return <Loading />;
  if (!contacts.length) {
    return (
      <EmptyState
        icon={MessageCircle}
        title={t("chat.noContacts")}
        text={role === "patient" ? t("chat.noContactsPatient") : t("chat.noContactsPro")}
      />
    );
  }

  const list = (
    <ul className="divide-y divide-border/60">
      {contacts.map((c) => {
        const person = people.data?.get(c.otherId);
        const s = summaries.data?.find(
          (x) => x.patientId === c.patientId && x.professionalId === c.professionalId,
        );
        const isCurrent = isDesktop && desktopCurrent?.otherId === c.otherId;
        const when = s ? new Date(s.last.created_at) : null;
        return (
          <li key={c.otherId}>
            <button
              type="button"
              onClick={() => setSelected(c.otherId)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-secondary/60",
                isCurrent && "bg-secondary",
              )}
            >
              <Avatar name={person?.name ?? "…"} url={person?.avatarUrl} />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {person?.name ?? "…"}
                  </span>
                  {when && (
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {isSameDay(when, new Date())
                        ? formatTime(when, locale)
                        : formatDate(when, locale, { day: "numeric", month: "short" })}
                    </span>
                  )}
                </span>
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-muted-foreground">
                    {s
                      ? `${s.last.sender_id === meId ? `${t("chat.you")}: ` : ""}${s.last.body || t("chat.attachment")}`
                      : c.active
                        ? t("chat.startConversation")
                        : t("link.status.encerrado")}
                  </span>
                  {!!s?.unread && (
                    <span className="shrink-0 rounded-full bg-accent px-1.5 text-[11px] font-bold text-accent-foreground">
                      {s.unread}
                    </span>
                  )}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  const thread = (c: Contact, withBack: boolean) => {
    const person = people.data?.get(c.otherId);
    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
          {withBack && (
            <button
              type="button"
              className={cn(buttonGhost, "px-2")}
              aria-label={t("common.back")}
              onClick={() => setSelected(null)}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <Avatar name={person?.name ?? "…"} url={person?.avatarUrl} size="sm" />
          <p className="truncate text-sm font-semibold text-foreground">{person?.name}</p>
        </div>
        <ChatThread
          key={`${c.patientId}:${c.professionalId}`}
          patientId={c.patientId}
          professionalId={c.professionalId}
          meId={meId}
          canSend={c.active}
          className="flex-1"
        />
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs">
      {isDesktop ? (
        <div className="grid h-[calc(100dvh-12rem)] min-h-[480px] grid-cols-[300px_1fr]">
          <div className="overflow-y-auto border-r border-border/60">{list}</div>
          {desktopCurrent && thread(desktopCurrent, false)}
        </div>
      ) : (
        <div className="h-[calc(100dvh-20rem)] min-h-[420px]">
          {current ? thread(current, true) : <div className="h-full overflow-y-auto">{list}</div>}
        </div>
      )}
    </div>
  );
}

import { Check, Users, X } from "lucide-react";
import * as api from "@/lib/clinical/api";
import type { CareLink } from "@/lib/clinical/api";
import { useClinicalMutation, usePeople } from "@/lib/clinical/queries";
import { formatDate } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { Avatar, EmptyState, buttonPrimary, buttonSecondary } from "./ui";

/** Pedidos de acompanhamento aguardando resposta do profissional. */
export function LinkRequests({ links }: { links: CareLink[] }) {
  const { t, locale } = useClinicalI18n();
  const pending = links.filter((l) => l.status === "pendente");
  const people = usePeople(pending.map((l) => l.patient_id));
  const respond = useClinicalMutation(
    (v: { id: string; accept: boolean }) => api.respondLink(v.id, v.accept),
    { success: (_, v) => (v.accept ? t("link.accepted") : t("link.declined")) },
  );

  if (!pending.length) {
    return <EmptyState icon={Users} title={t("requests.empty")} />;
  }

  return (
    <ul className="divide-y divide-border/60">
      {pending.map((l) => {
        const person = people.data?.get(l.patient_id);
        return (
          <li key={l.id} className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0">
            <div className="flex min-w-0 flex-1 gap-3">
              <Avatar name={person?.name ?? "…"} url={person?.avatarUrl} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{person?.name ?? "…"}</p>
                <p className="text-xs text-muted-foreground">
                  {t(`link.origin.${l.origin}`)}
                  {l.community_slug && ` · ${l.community_slug}`} ·{" "}
                  {formatDate(l.created_at, locale, { day: "numeric", month: "short" })}
                </p>
                {l.message && (
                  <p className="mt-1.5 rounded-xl bg-secondary px-3 py-2 text-xs leading-relaxed text-foreground">
                    “{l.message}”
                  </p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 justify-end gap-2">
              <button
                type="button"
                className={buttonSecondary}
                disabled={respond.isPending}
                onClick={() => respond.mutate({ id: l.id, accept: false })}
              >
                <X className="h-4 w-4" /> {t("requests.decline")}
              </button>
              <button
                type="button"
                className={buttonPrimary}
                disabled={respond.isPending}
                onClick={() => respond.mutate({ id: l.id, accept: true })}
              >
                <Check className="h-4 w-4" /> {t("requests.accept")}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

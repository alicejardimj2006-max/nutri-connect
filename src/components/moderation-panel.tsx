import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type QueueItem = {
  target_type: "post" | "comment" | "user";
  target_id: string;
  reports: number;
  reasons: string[];
  last_report_at: string;
  hidden: boolean;
  preview: string | null;
  author_name: string | null;
};

const TARGETS: Record<string, string> = { post: "Publicação", comment: "Comentário", user: "Perfil" };
const REASONS: Record<string, string> = {
  spam: "Spam/golpe",
  desinformacao: "Desinformação",
  ofensivo: "Ofensivo",
  assedio: "Assédio",
  inadequado: "Impróprio",
  outro: "Outro",
};

/** Fila de denúncias (inclui as abertas pela moderação automática por IA). */
export function ModerationPanel({ onCount }: { onCount?: (n: number) => void }) {
  const [items, setItems] = useState<QueueItem[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc("moderation_queue");
    if (error) {
      toast.error("Não foi possível carregar as denúncias.");
      setItems([]);
      return;
    }
    const rows = (data ?? []) as QueueItem[];
    setItems(rows);
    onCount?.(rows.length);
  }, [onCount]);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (item: QueueItem, hide: boolean) => {
    const key = `${item.target_type}:${item.target_id}`;
    setBusy(key);
    const { error } = await supabase.rpc("resolve_reports", {
      p_target_type: item.target_type,
      p_target_id: item.target_id,
      p_hide: hide,
    });
    setBusy(null);
    if (error) return void toast.error("Não foi possível registrar a decisão.");
    toast.success(hide ? "Conteúdo mantido oculto." : "Conteúdo restaurado.");
    await load();
  };

  if (items === null) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
        Nenhuma denúncia pendente.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const key = `${item.target_type}:${item.target_id}`;
        return (
          <li key={key} className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="rounded-full bg-secondary px-2.5 py-0.5 font-bold">
                {TARGETS[item.target_type]}
              </span>
              <span className="text-muted-foreground">
                {item.reports} denúncia(s) · {item.reasons.map((r) => REASONS[r] ?? r).join(", ")}
              </span>
              {item.hidden && (
                <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 font-bold text-destructive">
                  Oculto
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Autor: {item.author_name ?? "—"}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-foreground">
              {item.preview || "(sem texto)"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy === key}
                onClick={() => decide(item, true)}
                className="rounded-full bg-destructive px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                Manter oculto
              </button>
              <button
                type="button"
                disabled={busy === key}
                onClick={() => decide(item, false)}
                className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold hover:bg-secondary disabled:opacity-60"
              >
                Restaurar (improcedente)
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

import { useState } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type Target = "post" | "comment" | "user";

const REASONS: { value: string; label: string }[] = [
  { value: "spam", label: "Spam, golpe ou venda enganosa" },
  { value: "desinformacao", label: "Desinformação de saúde" },
  { value: "ofensivo", label: "Ofensivo ou discriminatório" },
  { value: "assedio", label: "Assédio ou ameaça" },
  { value: "inadequado", label: "Conteúdo impróprio (sexual, violento, envolve menores)" },
  { value: "outro", label: "Outro motivo" },
];

/** Botão “Denunciar” com formulário. Grava em reports; a equipe revisa no /admin. */
export function ReportButton({
  targetType,
  targetId,
  className = "",
  label = "Denunciar",
}: {
  targetType: Target;
  targetId: string;
  className?: string;
  label?: string;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);

  if (!user) return null;

  const send = async () => {
    setSending(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason,
      details: details.trim() || null,
    });
    setSending(false);
    if (error) {
      // 23505 = já denunciou este mesmo item.
      if (error.code === "23505") toast.info("Você já denunciou este conteúdo. Obrigado!");
      else toast.error("Não foi possível enviar a denúncia. Tente novamente.");
    } else {
      toast.success("Denúncia enviada. Nossa equipe vai analisar.");
    }
    setOpen(false);
    setDetails("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={label}
        aria-label={label}
        className={`inline-flex items-center gap-1 text-[10px] text-muted-foreground transition hover:text-destructive cursor-pointer ${className}`}
      >
        <Flag className="h-3 w-3" />
        <span>{label}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display">Denunciar</DialogTitle>
            <DialogDescription>
              Sua denúncia é anônima para o autor. Veja as{" "}
              <a href="/diretrizes" target="_blank" rel="noreferrer" className="underline">
                Diretrizes da Comunidade
              </a>
              .
            </DialogDescription>
          </DialogHeader>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-foreground">Motivo</span>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-foreground">
              Detalhes (opcional)
            </span>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-border px-4 py-2 text-xs font-semibold hover:bg-secondary"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={sending}
              onClick={send}
              className="rounded-full bg-destructive px-5 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {sending ? "Enviando…" : "Enviar denúncia"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

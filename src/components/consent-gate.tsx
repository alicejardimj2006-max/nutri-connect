import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { LEGAL_VERSION } from "@/lib/legal";

/**
 * Pede o aceite dos Termos e da Política de Privacidade na versão atual (e, opcionalmente, o
 * consentimento para dados de saúde). Aparece para quem está logado e ainda não aceitou esta
 * versão — contas novas e antigas, e toda vez que LEGAL_VERSION mudar. O aceite fica registrado
 * na tabela consents (data, hora e versão), como prova do consentimento (LGPD, art. 8º).
 */
export function ConsentGate() {
  const { user } = useAuth();
  const [needs, setNeeds] = useState(false);
  const [terms, setTerms] = useState(false);
  const [health, setHealth] = useState(false);
  const [saving, setSaving] = useState(false);
  const userId = user?.id;

  useEffect(() => {
    setNeeds(false);
    if (!userId) return;
    let cancelled = false;
    void (async () => {
      const { data, error } = await supabase
        .from("consents")
        .select("version")
        .eq("user_id", userId)
        .eq("kind", "termos")
        .eq("version", LEGAL_VERSION)
        .limit(1);
      // Se a consulta falhar (ex.: sem rede), não trava o uso; tentamos de novo no próximo login.
      if (!cancelled && !error && (data?.length ?? 0) === 0) setNeeds(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!userId || !needs) return null;

  const accept = async () => {
    setSaving(true);
    const first = await supabase.rpc("record_consent", {
      p_kind: "termos",
      p_version: LEGAL_VERSION,
      p_granted: true,
    });
    const second = health
      ? await supabase.rpc("record_consent", {
          p_kind: "saude",
          p_version: LEGAL_VERSION,
          p_granted: true,
        })
      : null;
    setSaving(false);
    if (first.error || second?.error) {
      toast.error("Não foi possível registrar o aceite. Tente novamente.");
      return;
    }
    setNeeds(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 sm:items-center"
    >
      <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-3xl bg-card p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h2 id="consent-title" className="font-display text-xl font-bold text-foreground">
            Antes de continuar
          </h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Atualizamos nossos documentos. Para usar o NutriConnect, leia e aceite os Termos de Uso e
          a Política de Privacidade (você tem 18 anos ou mais e os dados do seu cadastro são
          verdadeiros).
        </p>

        <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
          />
          <span>
            Li e aceito os{" "}
            <a href="/termos" target="_blank" rel="noreferrer" className="text-primary underline">
              Termos de Uso
            </a>
            , a{" "}
            <a
              href="/privacidade"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              Política de Privacidade
            </a>{" "}
            e as{" "}
            <a
              href="/diretrizes"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              Diretrizes da Comunidade
            </a>
            . <span className="text-destructive">*</span>
          </span>
        </label>

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-border/70 bg-secondary/30 p-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={health}
            onChange={(e) => setHealth(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
          />
          <span>
            <span className="font-semibold">Dados de saúde (opcional).</span> Consinto que o
            NutriConnect trate meus dados de saúde (diário alimentar, metas, medidas, planos e
            consultas) para o acompanhamento com profissionais. Posso revogar quando quiser em
            Configurações → Privacidade. Sem este consentimento você usa a rede social, mas não o
            acompanhamento clínico.
          </span>
        </label>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary"
          >
            Não aceito — sair
          </button>
          <button
            type="button"
            disabled={!terms || saving}
            onClick={accept}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary-hover disabled:opacity-50"
          >
            {saving ? "Salvando…" : "Aceitar e continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}

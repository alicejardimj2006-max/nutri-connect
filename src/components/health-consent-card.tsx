import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { LEGAL_VERSION } from "@/lib/legal";

/** Direitos do titular (LGPD): consentimento de saúde, cópia dos dados e exclusão da conta. */
export function HealthConsentCard() {
  const { user } = useAuth();
  const userId = user?.id;
  const [granted, setGranted] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("consents")
      .select("granted")
      .eq("user_id", userId)
      .eq("kind", "saude")
      .order("created_at", { ascending: false })
      .limit(1);
    setGranted(data?.[0]?.granted ?? false);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = async (value: boolean) => {
    setSaving(true);
    const { error } = await supabase.rpc("record_consent", {
      p_kind: "saude",
      p_version: LEGAL_VERSION,
      p_granted: value,
    });
    setSaving(false);
    if (error) return void toast.error("Não foi possível salvar. Tente novamente.");
    setGranted(value);
    toast.success(value ? "Consentimento registrado." : "Consentimento revogado.");
  };

  const exportData = async () => {
    setExporting(true);
    const { data, error } = await supabase.rpc("export_my_data");
    setExporting(false);
    if (error || !data) return void toast.error("Não foi possível gerar o arquivo agora.");
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nutriconnect-meus-dados.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
      <h2 className="text-sm font-bold font-display text-foreground">Seus dados (LGPD)</h2>
      <div className="mt-2 flex items-center justify-between gap-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Consentimento para dados de saúde</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Necessário para o acompanhamento com profissionais (diário, metas, medidas, planos e
            consultas). Você pode revogar quando quiser.
          </p>
        </div>
        <Switch
          checked={granted === true}
          disabled={granted === null || saving}
          onCheckedChange={toggle}
        />
      </div>
      <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
        <button
          type="button"
          onClick={exportData}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary disabled:opacity-60"
        >
          <Download className="h-3.5 w-3.5" />
          {exporting ? "Gerando…" : "Baixar meus dados (JSON)"}
        </button>
        <Link
          to="/perfil/configuracoes/conta"
          className="inline-flex items-center rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary"
        >
          Excluir minha conta
        </Link>
        <Link
          to="/privacidade"
          className="inline-flex items-center px-2 py-2 text-xs font-semibold text-primary underline"
        >
          Política de Privacidade
        </Link>
      </div>
    </section>
  );
}

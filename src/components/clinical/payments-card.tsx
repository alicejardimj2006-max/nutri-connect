import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, CreditCard, Unplug } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { connectMercadoPago, disconnectMercadoPago } from "@/lib/clinical/payments";
import { qk, useClinicalMutation, useProfessional } from "@/lib/clinical/queries";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { Card, buttonGhost, buttonPrimary } from "./ui";

/** Conexão da conta Mercado Pago do profissional (recebimento direto, com split). */
export function PaymentsCard({ professionalId }: { professionalId: string }) {
  const { t } = useClinicalI18n();
  const pro = useProfessional(professionalId);
  const fee = useQuery({
    queryKey: ["clinical", "platform-fee"],
    queryFn: async () => {
      const { data } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "platform_fee_percent")
        .maybeSingle();
      return Number(data?.value ?? 10);
    },
    staleTime: Infinity,
  });
  const connect = useClinicalMutation(() => connectMercadoPago());
  const disconnect = useClinicalMutation(() => disconnectMercadoPago(), {
    success: t("mp.disconnected"),
    invalidate: [qk.professional(professionalId), qk.directory()],
  });

  const connected = !!pro.data?.mp_connected;
  const hasPrice = (pro.data?.consultation_price_cents ?? 0) > 0;

  return (
    <Card title={t("mp.title")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
          <CreditCard className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1 text-sm">
          {connected ? (
            <p className="flex items-center gap-1.5 font-semibold text-primary">
              <CheckCircle2 className="h-4 w-4" /> {t("mp.connected")}
            </p>
          ) : (
            <p className="font-semibold text-foreground">{t("mp.notConnected")}</p>
          )}
          <p className="mt-0.5 text-muted-foreground">
            {connected
              ? t("mp.connectedText", { fee: fee.data ?? 10 })
              : t("mp.notConnectedText", { fee: fee.data ?? 10 })}
          </p>
          {connected && !hasPrice && <p className="mt-1 text-xs text-warning">{t("mp.noPrice")}</p>}
        </div>
        {connected ? (
          <button
            type="button"
            className={buttonGhost}
            disabled={disconnect.isPending}
            onClick={() =>
              window.confirm(t("mp.disconnectConfirm")) && disconnect.mutate(undefined)
            }
          >
            <Unplug className="h-4 w-4" /> {t("mp.disconnect")}
          </button>
        ) : (
          <button
            type="button"
            className={buttonPrimary}
            disabled={connect.isPending}
            onClick={() => connect.mutate(undefined)}
          >
            {t("mp.connect")}
          </button>
        )}
      </div>
    </Card>
  );
}

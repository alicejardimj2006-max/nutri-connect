import { useQuery } from "@tanstack/react-query";
import { CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfessional } from "@/lib/clinical/queries";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { Card } from "./ui";

/** Como o profissional recebe: pagamentos pelo Stripe, na conta da plataforma, com taxa por consulta. */
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

  const hasPrice = (pro.data?.consultation_price_cents ?? 0) > 0;

  return (
    <Card title={t("mp.title")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
          <CreditCard className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1 text-sm">
          <p className="text-muted-foreground">{t("mp.stripeText", { fee: fee.data ?? 10 })}</p>
          {!hasPrice && <p className="mt-1 text-xs text-warning">{t("mp.noPrice")}</p>}
        </div>
      </div>
    </Card>
  );
}

import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PaymentsCard } from "@/components/clinical/payments-card";
import { ExternalLink } from "lucide-react";
import {
  Card,
  Field,
  Loading,
  PageHeader,
  buttonGhost,
  buttonPrimary,
  inputClass,
} from "@/components/clinical/ui";
import { useAuth } from "@/hooks/use-auth";
import * as api from "@/lib/clinical/api";
import { useClinicalMutation, useProfessional } from "@/lib/clinical/queries";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { CATEGORIES } from "@/lib/community";
import { td } from "@/lib/i18n/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/configuracoes")({
  validateSearch: (search: Record<string, unknown>): { mp?: "conectado" | "erro" } => ({
    mp: search.mp === "conectado" || search.mp === "erro" ? search.mp : undefined,
  }),
  component: ProfessionalSettingsPage,
});

const TIMEZONES = [
  "America/Sao_Paulo",
  "America/Manaus",
  "America/Cuiaba",
  "America/Belem",
  "America/Fortaleza",
  "America/Recife",
  "America/Porto_Velho",
  "America/Rio_Branco",
  "America/Noronha",
];

function ProfessionalSettingsPage() {
  const { user } = useAuth();
  const { t, locale } = useClinicalI18n();
  const pro = useProfessional(user?.id);
  const { mp } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  // Retorno da autorização do Mercado Pago.
  useEffect(() => {
    if (!mp) return;
    if (mp === "conectado") toast.success(t("mp.connectedToast"));
    else toast.error(t("mp.errorToast"));
    void pro.refetch();
    navigate({ search: {}, replace: true });
  }, [mp]); // eslint-disable-line react-hooks/exhaustive-deps

  const [form, setForm] = useState({
    headline: "",
    accepting_patients: true,
    price: "0",
    consultation_duration_min: 60,
    offers_online: true,
    offers_presential: true,
    address: "",
    online_instructions: "",
    timezone: "America/Sao_Paulo",
    specialties: [] as string[],
  });

  useEffect(() => {
    const p = pro.data;
    if (!p) return;
    setForm({
      headline: p.headline ?? "",
      accepting_patients: p.accepting_patients,
      price: (p.consultation_price_cents / 100).toFixed(2).replace(".", ","),
      consultation_duration_min: p.consultation_duration_min,
      offers_online: p.offers_online,
      offers_presential: p.offers_presential,
      address: p.address ?? "",
      online_instructions: p.online_instructions ?? "",
      timezone: p.timezone,
      specialties: p.specialties,
    });
  }, [pro.data]);

  const save = useClinicalMutation(
    () =>
      api.updateProfessionalSettings(user!.id, {
        headline: form.headline.trim() || null,
        accepting_patients: form.accepting_patients,
        consultation_price_cents:
          Math.round(Number(form.price.replace(/\./g, "").replace(",", ".")) * 100) || 0,
        consultation_duration_min: form.consultation_duration_min,
        offers_online: form.offers_online,
        offers_presential: form.offers_presential,
        address: form.address.trim() || null,
        online_instructions: form.online_instructions.trim() || null,
        timezone: form.timezone,
        specialties: form.specialties,
      }),
    { success: t("settingsPro.saved") },
  );

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const noModality = !form.offers_online && !form.offers_presential;

  if (pro.isLoading || !user) return <Loading />;

  return (
    <>
      <PageHeader
        title={t("settingsPro.title")}
        subtitle={t("settingsPro.subtitle")}
        action={
          <Link
            to="/profissionais/$professionalId"
            params={{ professionalId: user.id }}
            className={buttonGhost}
          >
            <ExternalLink className="h-4 w-4" /> {t("settingsPro.publicPage")}
          </Link>
        }
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(undefined);
        }}
        className="space-y-4"
      >
        <Card title={t("settingsPro.profile")}>
          <div className="space-y-4">
            <Field label={t("settingsPro.headline")} hint={t("settingsPro.headlineHint")}>
              <input
                className={inputClass}
                maxLength={90}
                value={form.headline}
                onChange={(e) => set("headline", e.target.value)}
              />
            </Field>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                {t("settingsPro.specialties")}
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => {
                  const active = form.specialties.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        set(
                          "specialties",
                          active
                            ? form.specialties.filter((s) => s !== c)
                            : [...form.specialties, c],
                        )
                      }
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-secondary",
                      )}
                    >
                      {td(c, locale)}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--color-primary)]"
                checked={form.accepting_patients}
                onChange={(e) => set("accepting_patients", e.target.checked)}
              />
              {t("settingsPro.accepting")}
            </label>
          </div>
        </Card>

        <Card title={t("settingsPro.consultation")}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("settingsPro.price")} hint={t("settingsPro.priceHint")}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-2.5 text-sm text-muted-foreground">
                  R$
                </span>
                <input
                  inputMode="decimal"
                  className={cn(inputClass, "pl-10")}
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                />
              </div>
            </Field>
            <Field label={t("settingsPro.duration")}>
              <select
                className={inputClass}
                value={form.consultation_duration_min}
                onChange={(e) => set("consultation_duration_min", Number(e.target.value))}
              >
                {[30, 40, 45, 50, 60, 75, 90].map((m) => (
                  <option key={m} value={m}>
                    {t("pro.minutes", { n: m })}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("settingsPro.timezone")}>
              <select
                className={inputClass}
                value={form.timezone}
                onChange={(e) => set("timezone", e.target.value)}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace("America/", "").replace("_", " ")}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--color-primary)]"
                  checked={form.offers_presential}
                  onChange={(e) => set("offers_presential", e.target.checked)}
                />
                {t("modality.presencial")}
              </label>
              <Field label={t("settingsPro.address")}>
                <textarea
                  rows={2}
                  disabled={!form.offers_presential}
                  className={cn(inputClass, "resize-none")}
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                />
              </Field>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--color-primary)]"
                  checked={form.offers_online}
                  onChange={(e) => set("offers_online", e.target.checked)}
                />
                {t("modality.online")}
              </label>
              <Field label={t("settingsPro.onlineInstructions")}>
                <textarea
                  rows={2}
                  disabled={!form.offers_online}
                  className={cn(inputClass, "resize-none")}
                  value={form.online_instructions}
                  onChange={(e) => set("online_instructions", e.target.value)}
                  placeholder={t("pro.onlineDefault")}
                />
              </Field>
            </div>
          </div>
          {noModality && (
            <p className="mt-2 text-xs text-destructive">{t("settingsPro.noModality")}</p>
          )}
        </Card>

        <PaymentsCard professionalId={user.id} />

        <div className="flex justify-end">
          <button type="submit" className={buttonPrimary} disabled={save.isPending || noModality}>
            {t("common.save")}
          </button>
        </div>
      </form>
    </>
  );
}

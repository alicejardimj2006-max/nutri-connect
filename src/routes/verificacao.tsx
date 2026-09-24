import { td } from "@/lib/i18n/data";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, BadgeCheck, Clock, ImagePlus, ShieldCheck, XCircle } from "lucide-react";
import { AuthGateLoading, SiteHeader } from "@/components/site-chrome";
import { VerifiedBadge } from "@/components/person-chip";
import { useRequireAuth } from "@/hooks/use-auth";
import { useCommunity } from "@/hooks/use-community";
import { CATEGORIES, formatDate } from "@/lib/community";
import {
  BR_STATES,
  PROFESSIONS,
  getLatestVerification,
  getProfessionalInfo,
  submitVerification,
} from "@/lib/community-admin";
import { fileToDataUrl } from "@/lib/image";
import { useI18n } from "@/hooks/use-i18n";

export const Route = createFileRoute("/verificacao")({
  head: () => ({ meta: [{ title: "Verificação profissional — NutriConnect" }] }),
  component: VerificationPage,
});

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary";

function VerificationPage() {
  const { user, hydrated } = useRequireAuth();
  const { t } = useI18n();
  const { profiles, verifications, hydrated: dataHydrated } = useCommunity();

  if (!hydrated || !user) return <AuthGateLoading />;

  const professional = getProfessionalInfo(profiles, user.id);
  const isVerified = profiles.find((p) => p.userId === user.id)?.role === "profissional";
  const latest = getLatestVerification(verifications, user.id);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <Link
          to="/perfil/$userId"
          params={{ userId: user.id }}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("edit.back")}</span>
        </Link>

        <h1 className="font-display text-3xl font-extrabold text-foreground">
          {t("verify.title")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("verify.intro")}</p>

        {!dataHydrated ? (
          <p className="mt-8 text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : isVerified ? (
          <section className="mt-8 rounded-2xl border border-accent/30 bg-card p-5 shadow-xs sm:p-6">
            <div className="flex items-center gap-2 text-accent">
              <BadgeCheck className="h-5 w-5" />
              <h2 className="font-display text-lg font-bold text-foreground">
                {t("verify.isVerified")}
              </h2>
            </div>
            {professional && (
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <Info label={t("verify.profession")} value={td(professional.profession)} />
                <Info
                  label={t("verify.registration")}
                  value={`${professional.council} ${professional.registration}/${professional.uf}`}
                />
                <Info
                  label={t("verify.fields")}
                  value={professional.specialties.map((s) => td(s)).join(", ")}
                />
                <Info label={t("verify.verifiedAt")} value={formatDate(professional.verifiedAt)} />
              </dl>
            )}
            <p className="mt-4 text-sm text-muted-foreground">{t("verify.badgeText")}</p>
            <Link
              to="/convites"
              className="mt-4 inline-flex rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-accent/90"
            >
              {t("verify.seeInvites")}
            </Link>
          </section>
        ) : latest?.status === "em_analise" ? (
          <section className="mt-8 rounded-2xl border border-border/70 bg-card p-5 shadow-xs sm:p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <h2 className="font-display text-lg font-bold text-foreground">
                {t("verify.inReview")}
              </h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("verify.inReviewText1")} {formatDate(latest.submittedAt)}.{" "}
              {t("verify.inReviewText2")} {latest.council} {latest.registration}/{latest.uf}.{" "}
              {t("verify.inReviewText3")}
            </p>
          </section>
        ) : (
          <>
            {latest?.status === "recusado" && (
              <section className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 sm:p-6">
                <div className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  <h2 className="font-display text-lg font-bold">{t("verify.rejected")}</h2>
                </div>
                <p className="mt-2 text-sm text-foreground">
                  {latest.rejectionReason || t("verify.rejectedDefault")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{t("verify.rejectedHint")}</p>
              </section>
            )}
            <VerificationForm userId={user.id} userName={user.name} />
          </>
        )}

        <ul className="mt-10 space-y-2 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            {t("verify.note1")}
          </li>
          <li className="flex items-start gap-2">
            <VerifiedBadge className="mt-0.5 h-4 w-4" />
            {t("verify.note2")}
          </li>
        </ul>
      </main>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-foreground">{value}</dd>
    </div>
  );
}

function Label({
  text,
  hint,
  children,
}: {
  text: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">
        {text}
        {hint && <span className="font-normal"> — {hint}</span>}
      </span>
      {children}
    </label>
  );
}

function VerificationForm({ userId, userName }: { userId: string; userName: string }) {
  const { t } = useI18n();
  const [fullName, setFullName] = useState(userName);
  const [profession, setProfession] = useState<string>(PROFESSIONS[0].label);
  const [registration, setRegistration] = useState("");
  const [uf, setUf] = useState<string>("SP");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [lookupUrl, setLookupUrl] = useState("");
  const [documentImage, setDocumentImage] = useState("");
  const [selfieImage, setSelfieImage] = useState("");
  const [declared, setDeclared] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const council = PROFESSIONS.find((p) => p.label === profession)?.council ?? "";

  const toggleSpecialty = (name: string) =>
    setSpecialties((current) =>
      current.includes(name) ? current.filter((s) => s !== name) : [...current, name],
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || registration.trim().length < 3) {
      toast.error(t("verify.errNameReg"));
      return;
    }
    if (specialties.length === 0) {
      toast.error(t("verify.errSpecialty"));
      return;
    }
    if (!documentImage || !selfieImage) {
      toast.error(t("verify.errImages"));
      return;
    }
    if (!declared) {
      toast.error(t("verify.errDeclare"));
      return;
    }
    setSubmitting(true);
    try {
      submitVerification({
        userId,
        userName,
        fullName: fullName.trim(),
        profession,
        council,
        registration: registration.trim(),
        uf,
        specialties,
        bio: bio.trim() || undefined,
        publicLookupUrl: lookupUrl.trim() || undefined,
        documentImage,
        selfieImage,
      });
      toast.success(t("verify.sent"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("verify.sendError"));
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-6 rounded-2xl border border-border/70 bg-card p-5 shadow-xs sm:p-6"
    >
      <h2 className="font-display text-lg font-bold text-foreground">{t("verify.formTitle")}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Label text={t("verify.fullName")} hint={t("verify.fullNameHint")}>
          <input
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </Label>
        <Label text={t("verify.profession")}>
          <select
            className={inputClass}
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
          >
            {PROFESSIONS.map((p) => (
              <option key={p.label} value={p.label}>
                {td(p.label)}
              </option>
            ))}
          </select>
        </Label>
        <Label text={`${t("verify.regNumber")} (${council})`}>
          <input
            className={inputClass}
            value={registration}
            onChange={(e) => setRegistration(e.target.value)}
            placeholder={t("verify.regPlaceholder")}
            required
          />
        </Label>
        <Label text={t("verify.state")}>
          <select className={inputClass} value={uf} onChange={(e) => setUf(e.target.value)}>
            {BR_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Label>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-muted-foreground">
          {t("verify.fields")} <span className="font-normal">— {t("verify.fieldsHint")}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = specialties.includes(c);
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                onClick={() => toggleSpecialty(c)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-secondary"
                }`}
              >
                {td(c)}
              </button>
            );
          })}
        </div>
      </div>

      <Label text={t("verify.intro2")} hint={t("verify.optionalShown")}>
        <textarea
          rows={3}
          className={`${inputClass} resize-none`}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={t("verify.introPlaceholder")}
        />
      </Label>

      <Label text={t("verify.lookupLabel")} hint={t("verify.optionalFaster")}>
        <input
          type="url"
          className={inputClass}
          value={lookupUrl}
          onChange={(e) => setLookupUrl(e.target.value)}
          placeholder="https://"
        />
      </Label>

      <div className="grid gap-4 sm:grid-cols-2">
        <ImageUpload
          label={t("verify.docLabel")}
          hint={t("verify.docHint")}
          value={documentImage}
          onChange={setDocumentImage}
        />
        <ImageUpload
          label={t("verify.selfieLabel")}
          hint={t("verify.selfieHint")}
          value={selfieImage}
          onChange={setSelfieImage}
        />
      </div>

      <label className="flex items-start gap-2.5 text-xs leading-relaxed text-foreground">
        <input
          type="checkbox"
          checked={declared}
          onChange={(e) => setDeclared(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
        />
        <span>{t("verify.declare")}</span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-accent-foreground shadow-soft transition hover:bg-accent/90 disabled:opacity-60"
      >
        {t("verify.submit")}
      </button>
    </form>
  );
}

function ImageUpload({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (dataUrl: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      onChange(await fileToDataUrl(file));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("verify.imageError"));
    }
  };

  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">
        {label} <span className="font-normal">— {hint}</span>
      </p>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-border">
          <img src={value} alt={label} className="h-40 w-full object-cover" />
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="absolute bottom-2 right-2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white transition hover:bg-black/80"
          >
            {t("verify.replace")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background text-sm text-muted-foreground transition hover:bg-secondary"
        >
          <ImagePlus className="h-6 w-6" />
          <span>{t("verify.uploadImage")}</span>
        </button>
      )}
    </div>
  );
}

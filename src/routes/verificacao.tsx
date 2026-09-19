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

export const Route = createFileRoute("/verificacao")({
  head: () => ({ meta: [{ title: "Verificação profissional — NutriConnect" }] }),
  component: VerificationPage,
});

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary";

function VerificationPage() {
  const { user, hydrated } = useRequireAuth();
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
          <span>Voltar para o perfil</span>
        </Link>

        <h1 className="font-display text-3xl font-extrabold text-foreground">
          Verificação profissional
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Se você atua na área da saúde ou do bem-estar, verifique seu perfil para se tornar
          profissional verificado. Conferimos seu registro no conselho da categoria antes de
          aprovar.
        </p>

        {!dataHydrated ? (
          <p className="mt-8 text-sm text-muted-foreground">Carregando…</p>
        ) : isVerified ? (
          <section className="mt-8 rounded-2xl border border-accent/30 bg-card p-5 shadow-xs sm:p-6">
            <div className="flex items-center gap-2 text-accent">
              <BadgeCheck className="h-5 w-5" />
              <h2 className="font-display text-lg font-bold text-foreground">
                Seu perfil é profissional verificado
              </h2>
            </div>
            {professional && (
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <Info label="Profissão" value={professional.profession} />
                <Info
                  label="Registro"
                  value={`${professional.council} ${professional.registration}/${professional.uf}`}
                />
                <Info label="Áreas de atuação" value={professional.specialties.join(", ")} />
                <Info label="Verificado em" value={formatDate(professional.verifiedAt)} />
              </dl>
            )}
            <p className="mt-4 text-sm text-muted-foreground">
              Seu selo aparece nas suas publicações e no perfil, e você pode aceitar convites para
              ser admin profissional de comunidades.
            </p>
            <Link
              to="/convites"
              className="mt-4 inline-flex rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-accent/90"
            >
              Ver convites de comunidades
            </Link>
          </section>
        ) : latest?.status === "em_analise" ? (
          <section className="mt-8 rounded-2xl border border-border/70 bg-card p-5 shadow-xs sm:p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <h2 className="font-display text-lg font-bold text-foreground">Pedido em análise</h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Recebemos seus dados em {formatDate(latest.submittedAt)}. Nossa equipe está conferindo
              seu registro {latest.council} {latest.registration}/{latest.uf}. Você receberá o selo
              assim que o pedido for aprovado.
            </p>
          </section>
        ) : (
          <>
            {latest?.status === "recusado" && (
              <section className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 sm:p-6">
                <div className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  <h2 className="font-display text-lg font-bold">Seu último pedido foi recusado</h2>
                </div>
                <p className="mt-2 text-sm text-foreground">
                  {latest.rejectionReason || "A equipe não conseguiu confirmar as informações."}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Você pode corrigir os dados e enviar um novo pedido abaixo.
                </p>
              </section>
            )}
            <VerificationForm userId={user.id} userName={user.name} />
          </>
        )}

        <ul className="mt-10 space-y-2 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            Os documentos são vistos só pela equipe da plataforma e não aparecem no seu perfil.
          </li>
          <li className="flex items-start gap-2">
            <VerifiedBadge className="mt-0.5 h-4 w-4" />
            Com o perfil verificado você ganha o selo, aparece na aba Profissionais e pode ser
            convidado como admin profissional de uma comunidade.
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
      toast.error("Informe seu nome completo e o número do registro profissional.");
      return;
    }
    if (specialties.length === 0) {
      toast.error("Escolha ao menos uma área de atuação.");
      return;
    }
    if (!documentImage || !selfieImage) {
      toast.error("Envie a foto do documento e a selfie com o documento.");
      return;
    }
    if (!declared) {
      toast.error("Confirme a declaração de veracidade para enviar.");
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
      toast.success("Pedido enviado! Avisaremos quando a análise terminar.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível enviar o pedido.");
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-6 rounded-2xl border border-border/70 bg-card p-5 shadow-xs sm:p-6"
    >
      <h2 className="font-display text-lg font-bold text-foreground">Dados profissionais</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Label text="Nome completo" hint="como consta no registro">
          <input
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </Label>
        <Label text="Profissão">
          <select
            className={inputClass}
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
          >
            {PROFESSIONS.map((p) => (
              <option key={p.label} value={p.label}>
                {p.label}
              </option>
            ))}
          </select>
        </Label>
        <Label text={`Número do registro (${council})`}>
          <input
            className={inputClass}
            value={registration}
            onChange={(e) => setRegistration(e.target.value)}
            placeholder="Ex: 12345"
            required
          />
        </Label>
        <Label text="UF do conselho">
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
          Áreas de atuação <span className="font-normal">— usadas para indicar comunidades</span>
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
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <Label text="Apresentação profissional" hint="opcional, aparece no seu perfil">
        <textarea
          rows={3}
          className={`${inputClass} resize-none`}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Conte como você atua e o que gosta de compartilhar."
        />
      </Label>

      <Label text="Link de consulta pública do conselho" hint="opcional, agiliza a análise">
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
          label="Carteira ou registro profissional"
          hint="frente, com número e nome legíveis"
          value={documentImage}
          onChange={setDocumentImage}
        />
        <ImageUpload
          label="Selfie segurando o documento"
          hint="rosto e documento visíveis"
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
        <span>
          Declaro que as informações são verdadeiras e autorizo a plataforma a conferi-las junto ao
          conselho profissional.
        </span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-accent-foreground shadow-soft transition hover:bg-accent/90 disabled:opacity-60"
      >
        Enviar para verificação
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

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      onChange(await fileToDataUrl(file));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível usar essa imagem.");
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
            Trocar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background text-sm text-muted-foreground transition hover:bg-secondary"
        >
          <ImagePlus className="h-6 w-6" />
          <span>Enviar imagem</span>
        </button>
      )}
    </div>
  );
}

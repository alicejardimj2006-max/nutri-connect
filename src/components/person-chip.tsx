import { Link } from "@tanstack/react-router";
import { BadgeCheck } from "lucide-react";
import { getAvatarSrc, initials } from "@/lib/community";
import { useI18n } from "@/hooks/use-i18n";

/** Selo de profissional verificado. */
export function VerifiedBadge({ className = "h-3.5 w-3.5" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <BadgeCheck
      role="img"
      aria-label={t("verified.professional")}
      className={`shrink-0 text-accent ${className}`}
    />
  );
}

interface AdminPersonProps {
  /** Ex.: "Admin usuário" ou "Admin profissional". */
  label: string;
  userId?: string;
  name?: string;
  verified?: boolean;
  /** Complemento sob o rótulo (ex.: "Nutricionista · CRN 12345/SP"). */
  detail?: string;
  /** Texto quando a vaga está em aberto. */
  vacantText: string;
  /** Sobe acima de um link que cobre o card inteiro, para o perfil continuar clicável. */
  raised?: boolean;
}

/** Pessoa que administra uma comunidade, no mesmo formato de quem aparece numa publicação. */
export function AdminPerson({
  label,
  userId,
  name,
  verified,
  detail,
  vacantText,
  raised,
}: AdminPersonProps) {
  const caption = (
    <>
      <span className="block truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {detail && <span className="block truncate text-[10px] text-muted-foreground">{detail}</span>}
    </>
  );

  if (!userId || !name) {
    return (
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-dashed border-border text-xs text-muted-foreground">
          ?
        </span>
        <span className="min-w-0">
          <span className="block truncate text-xs font-semibold text-muted-foreground">
            {vacantText}
          </span>
          {caption}
        </span>
      </div>
    );
  }

  const avatar = getAvatarSrc(userId);

  return (
    <Link
      to="/perfil/$userId"
      params={{ userId }}
      className={`group/person flex min-w-0 items-center gap-2.5 ${raised ? "relative z-10" : ""}`}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-soft text-[11px] font-bold text-primary">
        {avatar ? (
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          initials(name)
        )}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1">
          <span className="truncate text-xs font-semibold text-foreground group-hover/person:underline">
            {name}
          </span>
          {verified && <VerifiedBadge />}
        </span>
        {caption}
      </span>
    </Link>
  );
}

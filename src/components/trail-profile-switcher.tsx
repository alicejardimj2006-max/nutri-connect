import { useState } from "react";
import { toast } from "sonner";
import { Check, ChevronDown, Plus, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Mascot } from "@/components/mascots";
import { CHARACTERS, type CharacterId, type TrailProfile } from "@/lib/learning-trail";
import { KID_AVATARS, MAX_KID_PROFILES } from "@/lib/trail-profiles";
import { useI18n } from "@/hooks/use-i18n";

/** Avatar redondo do perfil: o responsável usa um ícone; a criança usa o personagem escolhido. */
export function ProfileAvatar({ profile, size = 36 }: { profile: TrailProfile; size?: number }) {
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full ${
        profile.kind === "adult"
          ? "bg-primary text-primary-foreground"
          : "bg-gradient-to-br from-amber-200 to-pink-200"
      }`}
      style={{ width: size, height: size }}
    >
      {profile.kind === "adult" ? (
        <UserRound style={{ width: size * 0.55, height: size * 0.55 }} />
      ) : (
        <Mascot
          id={profile.avatar}
          size={size * 0.95}
          style={{ animation: "none", marginTop: size * 0.08 }}
        />
      )}
    </span>
  );
}

/**
 * Troca entre o perfil do responsável e os perfis infantis. Crianças usam a conta do responsável
 * (sem rede social): o perfil infantil só mostra as trilhas, com visual e conteúdo próprios.
 */
export function ProfileSwitcher({
  profiles,
  active,
  onSelect,
  onAddKid,
  onRemoveKid,
}: {
  profiles: TrailProfile[];
  active: TrailProfile;
  onSelect: (id: string) => void;
  onAddKid: (name: string, avatar: CharacterId) => void;
  onRemoveKid: (id: string) => void;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<CharacterId>("lipe");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const kids = profiles.filter((p) => p.kind === "kid");

  const reset = () => {
    setAdding(false);
    setName("");
    setAvatar("lipe");
    setConfirmId(null);
  };

  const create = () => {
    if (!name.trim()) {
      toast.error(t("ps.enterName"));
      return;
    }
    try {
      onAddKid(name, avatar);
      toast.success(t("ps.created").replace("{name}", name.trim()));
      reset();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("ps.createError"));
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border-2 border-border bg-card py-1.5 pl-1.5 pr-3.5 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md"
          aria-label={t("ps.switch")}
        >
          <ProfileAvatar profile={active} size={36} />
          <span className="leading-tight">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {active.kind === "kid" ? t("ps.kidProfile") : t("ps.guardianProfile")}
            </span>
            <span className="block max-w-[10rem] truncate text-sm font-bold text-foreground">
              {active.name}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl p-3">
        <p className="px-2 pb-2 pt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {t("ps.whoStudies")}
        </p>
        <ul className="space-y-1">
          {profiles.map((p) => {
            const isActive = p.id === active.id;
            return (
              <li key={p.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    onSelect(p.id);
                    setOpen(false);
                  }}
                  className={`flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left transition ${
                    isActive ? "bg-primary-soft/60" : "hover:bg-secondary"
                  }`}
                >
                  <ProfileAvatar profile={p} size={38} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-foreground">
                      {p.name}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {p.kind === "adult"
                        ? t("ps.guardianDesc")
                        : t("ps.kidDesc").replace("{avatar}", CHARACTERS[p.avatar].name)}
                    </span>
                  </span>
                  {isActive && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </button>
                {p.kind === "kid" &&
                  (confirmId === p.id ? (
                    <button
                      type="button"
                      onClick={() => {
                        onRemoveKid(p.id);
                        setConfirmId(null);
                      }}
                      className="cursor-pointer rounded-lg bg-destructive px-2.5 py-1.5 text-[11px] font-bold text-destructive-foreground"
                    >
                      {t("ps.deleteQ")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(p.id)}
                      aria-label={t("ps.deleteAria").replace("{name}", p.name)}
                      className="cursor-pointer rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ))}
              </li>
            );
          })}
        </ul>

        <div className="mt-2 border-t border-border pt-2">
          {adding ? (
            <div className="space-y-3 rounded-xl bg-secondary/40 p-3">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-foreground">
                  {t("ps.kidName")}
                </span>
                <input
                  autoFocus
                  value={name}
                  maxLength={24}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && create()}
                  placeholder={t("ps.kidNamePh")}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </label>
              <div>
                <span className="mb-1.5 block text-xs font-bold text-foreground">
                  {t("ps.pickFriend")}
                </span>
                <div className="flex flex-wrap gap-2">
                  {KID_AVATARS.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setAvatar(id)}
                      aria-label={CHARACTERS[id].name}
                      aria-pressed={avatar === id}
                      className={`grid h-12 w-12 cursor-pointer place-items-center overflow-hidden rounded-xl border-2 bg-card transition ${
                        avatar === id
                          ? "border-primary shadow-md"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <Mascot id={id} size={42} style={{ animation: "none" }} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={create}
                  className="flex-1 cursor-pointer rounded-lg bg-primary py-2 text-sm font-bold text-primary-foreground transition hover:brightness-110"
                >
                  {t("ps.create")}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={kids.length >= MAX_KID_PROFILES}
              onClick={() => setAdding(true)}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm font-semibold text-primary transition hover:bg-primary-soft/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft">
                <Plus className="h-4 w-4" />
              </span>
              {kids.length >= MAX_KID_PROFILES ? t("ps.limit") : t("ps.addKid")}
            </button>
          )}
        </div>

        <p className="mt-2 flex gap-2 rounded-lg bg-secondary/50 p-2.5 text-[11px] leading-snug text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          {t("ps.note")}
        </p>
      </PopoverContent>
    </Popover>
  );
}

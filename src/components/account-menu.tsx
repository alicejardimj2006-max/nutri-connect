// Menu da conta: abre pela foto (computador) ou pela aba Perfil (celular). Reúne as áreas que não
// cabem na barra principal: acompanhamento, painel clínico, profissionais, configurações e admin.
import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  CalendarDays,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  Shield,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { useTr } from "@/components/settings-ui";
import { signOut } from "@/lib/auth";

export function AccountMenu({
  trigger,
  side = "bottom",
}: {
  trigger: ReactNode;
  side?: "top" | "bottom";
}) {
  const { user } = useAuth();
  const { t } = useI18n();
  const tr = useTr();
  const navigate = useNavigate();
  if (!user) return null;

  const item = "flex cursor-pointer items-center gap-2.5 py-2";
  const exit = async () => {
    await signOut();
    toast.success(t("settings.signout.success"));
    navigate({ to: "/login" });
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" side={side} sideOffset={8} className="w-64">
        <DropdownMenuLabel className="font-normal">
          <span className="block truncate text-sm font-semibold text-foreground">{user.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/perfil/$userId" params={{ userId: user.id }} className={item}>
            <UserRound className="h-4 w-4" />
            {tr(["Meu perfil", "My profile", "Mi perfil", "Mon profil"])}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/acompanhamento" className={item}>
            <HeartPulse className="h-4 w-4" />
            {tr(["Meu acompanhamento", "My care", "Mi seguimiento", "Mon suivi"])}
          </Link>
        </DropdownMenuItem>
        {user.professional && (
          <DropdownMenuItem asChild>
            <Link to="/painel" className={item}>
              <LayoutDashboard className="h-4 w-4" />
              {t("nav.clinic")}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link to="/profissionais" className={item}>
            <Stethoscope className="h-4 w-4" />
            {tr([
              "Encontrar profissional",
              "Find a professional",
              "Encontrar profesional",
              "Trouver un professionnel",
            ])}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="lg:hidden">
          <Link to="/tema-da-semana" className={item}>
            <CalendarDays className="h-4 w-4" />
            {t("weekly.badge")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user.professional ? (
          <DropdownMenuItem asChild>
            <Link to="/convites" className={item}>
              <Mail className="h-4 w-4" />
              {t("profile.invites")}
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link to="/verificacao" className={item}>
              <BadgeCheck className="h-4 w-4" />
              {t("profile.proVerification")}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link to="/perfil/configuracoes" className={item}>
            <Settings className="h-4 w-4" />
            {t("settings.title")}
          </Link>
        </DropdownMenuItem>
        {user.isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className={item}>
              <Shield className="h-4 w-4" />
              {t("profile.adminPanel")}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => void exit()}
          className={`${item} text-destructive focus:text-destructive`}
        >
          <LogOut className="h-4 w-4" />
          {t("settings.signout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

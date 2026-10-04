import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Globe,
  Heart,
  Info,
  LogOut,
  MessageCircle,
  FileText,
  Palette,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { useState } from "react";
import { Database, Search } from "lucide-react";
import { useTr } from "@/components/settings-ui";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { signOut } from "@/lib/auth";

export const Route = createFileRoute("/perfil/configuracoes/")({
  head: () => ({ meta: [{ title: "Configurações — NutriConnect" }] }),
  component: ConfiguracoesPage,
});

function SectionTitle({
  icon: Icon,
  tone,
  title,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-bold font-display text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

function LinkCard({
  to,
  icon,
  tone,
  title,
  hint,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  title: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-xs transition hover:bg-secondary/50 sm:p-6"
    >
      <SectionTitle icon={icon} tone={tone} title={title} hint={hint} />
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </Link>
  );
}

function ConfiguracoesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const tr = useTr();
  const [query, setQuery] = useState("");

  if (!user) return null;

  const cards = [
    {
      to: "/perfil/configuracoes/conta",
      icon: UserCog,
      tone: "bg-primary-soft text-primary",
      title: t("settings.section.account.title"),
      hint: t("settings.section.account.hint"),
      keywords: "senha e-mail email telefone cpf sessão aparelhos segurança excluir conta password security",
    },
    {
      to: "/perfil/configuracoes/privacidade",
      icon: ShieldCheck,
      tone: "bg-chart-2/15 text-chart-2",
      title: t("settings.section.privacy.title"),
      hint: t("settings.section.privacy.hint"),
      keywords: "perfil privado bloqueio bloqueados consentimento saúde lgpd contato visível",
    },
    {
      to: "/perfil/configuracoes/notificacoes",
      icon: Bell,
      tone: "bg-chart-3/15 text-chart-3",
      title: t("settings.section.notifications.title"),
      hint: t("settings.section.notifications.hint"),
      keywords: "avisos silêncio horário navegador push alertas notifications quiet",
    },
    {
      to: "/perfil/personalizacao",
      icon: Palette,
      tone: "bg-chart-4/15 text-chart-4",
      title: t("settings.section.appearance.title"),
      hint: t("settings.section.appearance.hint"),
      keywords: "tema cores fontes sons escuro modo layout acessibilidade contraste personalizar",
    },
    {
      to: "/perfil/configuracoes/idioma",
      icon: Globe,
      tone: "bg-accent-soft text-accent",
      title: tr(["Idioma e região", "Language and region", "Idioma y región", "Langue et région"]),
      hint: tr(["Idioma, formato de data e hora e fuso horário", "Language, date and time format and time zone", "Idioma, formato de fecha y hora y zona horaria", "Langue, format de date et d'heure et fuseau horaire"]),
      keywords: "idioma língua data hora fuso horário region language time zone",
    },
    {
      to: "/perfil/configuracoes/dados",
      icon: Database,
      tone: "bg-chart-5/15 text-chart-5",
      title: tr(["Dados e histórico", "Data and history", "Datos e historial", "Données et historique"]),
      hint: tr(["Baixar seus dados, apagar conversas e ver consentimentos", "Download your data, delete conversations and view consents", "Descargar tus datos, borrar conversaciones y ver consentimientos", "Télécharger vos données, supprimer des conversations et voir les consentements"]),
      keywords: "baixar exportar dados lgpd apagar nina conversas histórico consentimentos trilha",
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast.success(t("settings.signout.success"));
    navigate({ to: "/login" });
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-8">
      <Link
        to="/perfil/$userId"
        params={{ userId: user.id }}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Voltar para o perfil</span>
      </Link>

      <h1 className="sr-only">
        {t("settings.title")}
      </h1>
      <div className="mb-6" />

      <div className="space-y-5">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tr(["Buscar nas configurações (senha, sons, fuso, dados…)", "Search settings (password, sounds, time zone, data…)", "Buscar en ajustes (contraseña, sonidos, zona horaria, datos…)", "Rechercher dans les réglages (mot de passe, sons, fuseau, données…)"])}
            className="w-full rounded-2xl border border-border/70 bg-card py-3 pl-10 pr-4 text-sm text-foreground shadow-xs outline-none focus:border-accent"
          />
        </label>

        {cards
          .filter((c) => {
            const q = query.trim().toLowerCase();
            return !q || `${c.title} ${c.hint} ${c.keywords}`.toLowerCase().includes(q);
          })
          .map((c) => (
            <LinkCard key={c.to} to={c.to} icon={c.icon} tone={c.tone} title={c.title} hint={c.hint} />
          ))}

        <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">{t("settings.signout")}</p>
              <p className="text-[11px] text-muted-foreground">
                Você será desconectado e voltará para a tela de login.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-destructive/40 px-5 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>{t("settings.signout")}</span>
            </button>
          </div>
        </section>

        {/* Sobre — antes ficava no rodapé */}
        <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
          <SectionTitle
            icon={Info}
            tone="bg-accent-soft text-accent"
            title={t("settings.section.about.title")}
            hint="Nossa proposta e como falar com a gente"
          />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Sua alimentação. Sua jornada. Uma rede viva para descobrir, compartilhar, aprender e
            construir hábitos melhores juntos. Incentivamos a conexão saudável com a alimentação,
            sem culpa e sem julgamento corporal.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link
              to="/sobre"
              className="flex items-center gap-2.5 rounded-xl border border-border/70 px-4 py-3 text-sm font-medium text-foreground transition hover:bg-secondary"
            >
              <Heart className="h-4 w-4 text-accent" />
              {t("settings.section.about.link.about")}
            </Link>
            <Link
              to="/contato"
              className="flex items-center gap-2.5 rounded-xl border border-border/70 px-4 py-3 text-sm font-medium text-foreground transition hover:bg-secondary"
            >
              <MessageCircle className="h-4 w-4 text-accent" />
              {t("settings.section.about.link.contact")}
            </Link>
            <Link
              to="/termos"
              className="flex items-center gap-2.5 rounded-xl border border-border/70 px-4 py-3 text-sm font-medium text-foreground transition hover:bg-secondary"
            >
              <FileText className="h-4 w-4 text-accent" />
              Termos de Uso
            </Link>
            <Link
              to="/privacidade"
              className="flex items-center gap-2.5 rounded-xl border border-border/70 px-4 py-3 text-sm font-medium text-foreground transition hover:bg-secondary"
            >
              <ShieldCheck className="h-4 w-4 text-accent" />
              Política de Privacidade
            </Link>
            <Link
              to="/diretrizes"
              className="flex items-center gap-2.5 rounded-xl border border-border/70 px-4 py-3 text-sm font-medium text-foreground transition hover:bg-secondary"
            >
              <Heart className="h-4 w-4 text-accent" />
              Diretrizes da Comunidade
            </Link>
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} NutriConnect. Sua caminhada, no seu ritmo.
          </p>
        </section>
      </div>
    </div>
  );
}

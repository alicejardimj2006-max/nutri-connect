import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  Heart,
  Info,
  LogOut,
  Mail,
  MessageCircle,
  Palette,
  UserCog,
} from "lucide-react";
import { AuthGateLoading, SiteHeader } from "@/components/site-chrome";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRequireAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth";

export const Route = createFileRoute("/perfil/configuracoes")({
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

function ConfiguracoesPage() {
  const { user, hydrated } = useRequireAuth();
  const navigate = useNavigate();

  if (!hydrated || !user) return <AuthGateLoading />;

  const handleSignOut = () => {
    signOut();
    toast.success("Você saiu da sua conta.");
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 sm:px-6 py-8">
        <Link
          to="/perfil/$userId"
          params={{ userId: user.id }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para o perfil</span>
        </Link>

        <h1 className="text-3xl font-extrabold font-display text-foreground mb-1">Configurações</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Aparência, conta e informações sobre o NutriConnect. Para mudar seu nome, bio ou jornada,
          use{" "}
          <Link
            to="/perfil/editar"
            className="font-semibold text-accent hover:underline underline-offset-2"
          >
            Editar perfil
          </Link>
          .
        </p>

        <div className="space-y-5">
          {/* Aparência */}
          <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs flex items-center justify-between gap-4">
            <SectionTitle
              icon={Palette}
              tone="bg-chart-4/15 text-chart-4"
              title="Aparência"
              hint="Tema claro ou escuro"
            />
            <ThemeToggle />
          </section>

          {/* Conta */}
          <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
            <SectionTitle
              icon={UserCog}
              tone="bg-primary-soft text-primary"
              title="Conta"
              hint="Acesso e segurança"
            />
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-secondary/40 px-3 py-2.5 text-sm text-foreground">
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="mt-4 flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">Sair da conta</p>
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
                <span>Sair</span>
              </button>
            </div>
          </section>

          {/* Sobre — antes ficava no rodapé */}
          <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
            <SectionTitle
              icon={Info}
              tone="bg-accent-soft text-accent"
              title="Sobre o NutriConnect"
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
                Nosso Manifesto
              </Link>
              <Link
                to="/contato"
                className="flex items-center gap-2.5 rounded-xl border border-border/70 px-4 py-3 text-sm font-medium text-foreground transition hover:bg-secondary"
              >
                <MessageCircle className="h-4 w-4 text-accent" />
                Fale Conosco
              </Link>
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground">
              © {new Date().getFullYear()} NutriConnect. Sua caminhada, no seu ritmo.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Compass,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Users,
  Salad,
  Flame,
  Award,
  BookOpen
} from "lucide-react";
import { Section } from "@/components/dashboard-shell";
import { useAuth } from "@/hooks/use-auth";
import { getWeeklyThemes, getChallenges } from "@/lib/community";
import { WeeklyThemeCard, ChallengeCard } from "@/components/community-cards";

export const Route = createFileRoute("/paciente/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const activeTheme = getWeeklyThemes()[0];
  const challenges = getChallenges();
  const activeChallenge = challenges.length > 0 ? challenges[0] : null;
  const firstName = user?.name?.split(" ")[0] || "Usuário";

  return (
    <div className="space-y-6">
      {/* Social Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Sua comunidade alimentar
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Olá, {firstName}! Bem-vindo à rede.
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Descubra novas práticas, participe de comunidades e compartilhe sua jornada com pessoas que têm os mesmos objetivos que você.
              {activeTheme && (
                <span className="block mt-1 text-primary font-medium">
                  Tema da Semana: {activeTheme.title}
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/espaco"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              <Compass className="h-4 w-4" />
              Descobrir
            </Link>
            <Link
              to="/minha-jornada"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card/80 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Minha Jornada
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {activeTheme && (
          <Section title="O Pulso da Comunidade">
            <WeeklyThemeCard theme={activeTheme} compact={true} />
          </Section>
        )}
        
        {activeChallenge && (
          <Section title="Seu Desafio Atual">
            <ChallengeCard challenge={activeChallenge} />
          </Section>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Explore a Rede">
          <div className="grid gap-4 sm:grid-cols-2">
            <Shortcut to="/comunidades" icon={Users} label="Comunidades" description="Encontre seu grupo" />
            <Shortcut to="/receitas" icon={Salad} label="Receitas" description="Inspire-se na cozinha" />
            <Shortcut to="/profissionais" icon={Award} label="Profissionais" description="Especialistas da rede" />
            <Shortcut to="/tema-da-semana" icon={BookOpen} label="Tema da Semana" description="Aprenda e discuta" />
          </div>
        </Section>
        
        <Section title="Suas Conexões">
          <div className="grid gap-4 sm:grid-cols-2">
            <Shortcut to="/minha-jornada" icon={Flame} label="Metas & Hábitos" description="Acompanhe sua rotina" />
            <Shortcut to="/paciente/mensagens" icon={MessageSquare} label="Mensagens" description="Conversas diretas" />
          </div>
        </Section>
      </div>
    </div>
  );
}

function Shortcut({ to, icon: Icon, label, description }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string; description?: string }) {
  return (
    <Link to={to} className="flex flex-col justify-center gap-2 rounded-2xl border bg-card p-5 shadow-card transition hover:border-primary hover:shadow-soft">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <span className="font-semibold text-sm">{label}</span>
      </div>
      {description && <p className="text-xs text-muted-foreground ml-[52px]">{description}</p>}
    </Link>
  );
}


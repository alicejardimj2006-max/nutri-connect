import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquareHeart, Compass, ArrowRight, Sparkles, MessageCircle, BookOpen, Star, Salad, Users, CalendarDays } from "lucide-react";
import { StatCard, Section } from "@/components/dashboard-shell";
import { useAuth } from "@/hooks/use-auth";
import { getWeeklyThemes } from "@/lib/community";
import { ShareModal } from "@/components/share-modal";

export const Route = createFileRoute("/nutricionista/dashboard")({
  component: NutriDash,
});

const proximas = [
  { h: "09:00", p: "Ana Souza", tipo: "Retorno" },
  { h: "10:30", p: "Bruno Lima", tipo: "Avaliação" },
  { h: "14:00", p: "Cainã Lopes de Andrade", tipo: "Retorno" },
];

function NutriDash() {
  const { user } = useAuth();
  const activeTheme = getWeeklyThemes()[0];
  const displayName = user?.name || "Nutricionista";

  return (
    <div className="space-y-6">
      {/* Banner de Presença na Rede */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Sua presença na rede hoje
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {displayName}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Como profissional da rede, você pode compartilhar conhecimento, responder dúvidas e se conectar com diversas comunidades de alimentação.
              {activeTheme && (
                <span className="block mt-1 text-primary font-medium">
                  Tema da Semana: {activeTheme.title}
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ShareModal
              triggerButton={
                <button className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90">
                  <MessageSquareHeart className="h-4 w-4" />
                  Publicar Conteúdo
                </button>
              }
            />
            <Link
              to="/espaco"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card/80 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Espaço de Hoje
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Publicações" value="12" icon={BookOpen} hint="Últimos 30 dias" />
        <StatCard label="Respostas" value="48" icon={MessageCircle} hint="Dúvidas esclarecidas" />
        <StatCard label="Receitas" value="5" icon={Salad} hint="Criadas por você" />
        <StatCard label="Reputação" value="4.9" icon={Star} hint="Média de avaliações" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Sua Atuação">
          <div className="grid gap-4 sm:grid-cols-2">
            <Shortcut to="/comunidades" icon={Users} label="Comunidades" description="Grupos que você lidera" />
            <Shortcut to="/receitas" icon={Salad} label="Receitas" description="Gerencie suas receitas" />
            <Shortcut to="/tema-da-semana" icon={BookOpen} label="Tema da Semana" description="Discussões ativas" />
            <Shortcut to="/nutricionista/mensagens" icon={MessageCircle} label="Mensagens" description="Conversas na rede" />
          </div>
        </Section>

        <Section title="Agenda & Consultas">
          <div className="mb-4">
            <Link to="/nutricionista/agenda" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <CalendarDays className="h-4 w-4" />
              Ver agenda completa
            </Link>
          </div>
          <ul className="divide-y rounded-2xl border bg-card">
            {proximas.map((c) => (
              <li key={c.h + c.p} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 text-sm font-semibold text-primary">{c.h}</div>
                  <div>
                    <div className="text-sm font-medium">{c.p}</div>
                    <div className="text-xs text-muted-foreground">{c.tipo}</div>
                  </div>
                </div>
                <Link to="/nutricionista/agenda" className="rounded-full border px-3 py-1 text-xs font-semibold hover:bg-muted transition">Abrir</Link>
              </li>
            ))}
            {proximas.length === 0 && (
              <li className="p-4 text-center text-sm text-muted-foreground">Sem consultas próximas</li>
            )}
          </ul>
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


import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  CheckCircle2,
  Award,
  Sparkles,
  Plus,
  ArrowRight,
  Flame,
  Target,
  Trophy,
  Filter,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useCommunity } from "@/hooks/use-community";
import { ChallengeCard } from "@/components/community-cards";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/desafios")({
  head: () => ({
    meta: [
      { title: "Desafios de Hábitos — NutriConnect" },
      {
        name: "description",
        content:
          "Pequenos desafios saudáveis focados em participação, cozinha caseira e hábitos acolhedores sem cobrança corporal.",
      },
    ],
  }),
  component: DesafiosPage,
});

function DesafiosPage() {
  const { challenges, hydrated } = useCommunity();
  const { user } = useAuth();
  const [filter, setFilter] = useState<"todos" | "meus" | "populares">("todos");

  const currentUserId = user?.id || "guest";

  const filteredChallenges = challenges.filter((c) => {
    if (filter === "meus") return c.participants.includes(currentUserId);
    if (filter === "populares") return c.participants.length >= 10;
    return true;
  });

  const joinedCount = challenges.filter((c) => c.participants.includes(currentUserId)).length;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-8">
        {/* Cabeçalho */}
        <div className="border-b border-border/70 pb-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent mb-2">
              <Award className="h-3.5 w-3.5" />
              <span>Passo a Passo</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-foreground">
              Desafios de Hábitos
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Desafios práticos para construir uma rotina mais acolhedora com a comida. Sem metas
              punitivas, sem contagem de calorias. Apenas constância, curiosidade e prazer de
              cozinhar.
            </p>
          </div>

          {/* Widget de Constância do Usuário */}
          <div className="rounded-2xl border bg-card p-4 shadow-card flex items-center gap-4 shrink-0">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-xl">
              🔥 5d
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sua Ofensiva
              </div>
              <div className="text-sm font-bold text-foreground">
                {joinedCount} desafios em andamento
              </div>
            </div>
          </div>
        </div>

        {/* Banner de Filosofia */}
        <div className="rounded-3xl border border-primary/20 bg-primary-soft/30 p-6 sm:p-8 mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-display text-primary">
              Como funcionam os desafios no NutriConnect?
            </h2>
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed max-w-2xl">
              Você escolhe um hábito simples para experimentar durante a semana. Ao participar, você
              se conecta com outras pessoas fazendo a mesma coisa e pode trocar fotos, dicas e
              reflexões no <b>Espaço de Hoje</b>.
            </p>
          </div>
          <Link
            to="/espaco"
            className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition shrink-0"
          >
            Ver o Espaço de Hoje
          </Link>
        </div>

        {/* CONTROLES DE FILTRO */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-1 rounded-full bg-secondary p-1">
            {(["todos", "meus", "populares"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
                  filter === tab
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "todos"
                  ? "Todos os Desafios"
                  : tab === "meus"
                    ? `Meus Desafios (${joinedCount})`
                    : "Mais Populares"}
              </button>
            ))}
          </div>

          <span className="text-xs text-muted-foreground font-medium">
            Exibindo {filteredChallenges.length} desafios disponíveis
          </span>
        </div>

        {/* Grid de Desafios */}
        {!hydrated ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Carregando desafios…
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="py-16 text-center rounded-3xl border bg-card p-8">
            <p className="text-sm text-muted-foreground">
              Você ainda não entrou em nenhum desafio nesta aba.
            </p>
            <button
              onClick={() => setFilter("todos")}
              className="mt-3 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground"
            >
              Explorar Todos os Desafios
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredChallenges.map((c) => (
              <ChallengeCard key={c.id} challenge={c} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

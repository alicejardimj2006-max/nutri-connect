import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Award, Sparkles, Plus, ArrowRight } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useCommunity } from "@/hooks/use-community";
import { ChallengeCard } from "@/components/community-cards";

export const Route = createFileRoute("/desafios")({
  head: () => ({
    meta: [
      { title: "Desafios de Hábitos — NutriConnect" },
      {
        name: "description",
        content: "Pequenos desafios saudáveis focados em participação, cozinha caseira e hábitos acolhedores sem cobrança corporal.",
      },
    ],
  }),
  component: DesafiosPage,
});

function DesafiosPage() {
  const { challenges, hydrated } = useCommunity();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-8">
        {/* Cabeçalho */}
        <div className="border-b border-border/70 pb-6 mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent mb-2">
            <Award className="h-3.5 w-3.5" />
            <span>Passo a Passo</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-foreground">
            Desafios de Hábitos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Desafios práticos para construir uma rotina mais acolhedora com a comida. Sem metas punitivas,
            sem contagem de calorias. Apenas constância, curiosidade e prazer de cozinhar.
          </p>
        </div>

        {/* Banner de Filosofia */}
        <div className="rounded-3xl border border-primary/20 bg-primary-soft/30 p-6 sm:p-8 mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-display text-primary">
              Como funcionam os desafios no NutriConnect?
            </h2>
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed max-w-2xl">
              Você escolhe um hábito simples para experimentar durante a semana. Ao participar, você se conecta com outras pessoas fazendo a mesma coisa e pode trocar fotos, dicas e reflexões no <b>Espaço de Hoje</b>.
            </p>
          </div>
          <Link
            to="/espaco"
            className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition shrink-0"
          >
            Ver o Espaço de Hoje
          </Link>
        </div>

        {/* Grid de Desafios */}
        {!hydrated ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Carregando desafios…
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {challenges.map((c) => (
              <ChallengeCard key={c.id} challenge={c} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

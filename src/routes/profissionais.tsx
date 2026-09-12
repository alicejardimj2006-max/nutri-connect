import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Search, BadgeCheck, Calendar, MapPin, Sparkles, MessageSquare } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useCommunity } from "@/hooks/use-community";
import { ProfessionalCard } from "@/components/community-cards";

export const Route = createFileRoute("/profissionais")({
  head: () => ({
    meta: [
      { title: "Especialistas e Nutricionistas — NutriConnect" },
      {
        name: "description",
        content: "Conheça nutricionistas verificados que compartilham conhecimento na comunidade e oferecem acompanhamento individualizado.",
      },
    ],
  }),
  component: ProfissionaisPage,
});

function ProfissionaisPage() {
  const { professionals, hydrated } = useCommunity();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFocus, setSelectedFocus] = useState("Todos");

  const allFocusAreas = [
    "Todos",
    "Reeducação Alimentar",
    "Planejamento de Marmitas",
    "Alimentação em Família",
    "Vegetarianismo",
    "Hipertrofia",
  ];

  const filteredProfessionals = professionals.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFocus =
      selectedFocus === "Todos" || p.focus.some((f) => f.toLowerCase() === selectedFocus.toLowerCase());
    return matchesSearch && matchesFocus;
  });

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-8">
        {/* Cabeçalho */}
        <div className="border-b border-border/70 pb-6 mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent mb-2">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Rede de Cuidado Profissional</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-foreground">
            Especialistas e Nutricionistas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Profissionais registrados que participam ativamente da comunidade: tirando dúvidas,
            publicando orientações baseadas em evidências e disponíveis para consultas sob medida.
          </p>
        </div>

        {/* Busca e Filtros */}
        <div className="space-y-4 mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, especialidade ou cidade..."
              className="w-full rounded-full border border-border bg-card pl-10 pr-4 py-2.5 text-xs text-foreground outline-none focus:border-accent shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {allFocusAreas.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedFocus(f)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedFocus === f
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Profissionais */}
        {!hydrated ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Carregando especialistas…
          </div>
        ) : filteredProfessionals.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProfessionals.map((prof) => (
              <ProfessionalCard key={prof.id} professional={prof} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center max-w-md mx-auto">
            <h3 className="text-base font-bold text-foreground font-display">
              Nenhum especialista encontrado
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Tente buscar com outros termos ou selecione outra área de foco.
            </p>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

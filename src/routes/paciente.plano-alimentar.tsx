import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, CheckCircle2, ShoppingCart, RefreshCw, ChevronRight, Sparkles, Info, Scale } from "lucide-react";
import { toast } from "sonner";
import { Section } from "@/components/dashboard-shell";

export const Route = createFileRoute("/paciente/plano-alimentar")({
  component: Plano,
});

interface MealItem {
  id: string;
  alimento: string;
  qtd: string;
  substitutos: string[];
  done?: boolean;
}

interface Meal {
  id: string;
  nome: string;
  hora: string;
  kcal: number;
  itens: MealItem[];
  obs?: string;
}

const initialRefeicoes: Meal[] = [
  {
    id: "m1",
    nome: "Café da manhã",
    hora: "07:00",
    kcal: 380,
    itens: [
      { id: "i1", alimento: "Ovos mexidos com azeite", qtd: "2 unidades", substitutos: ["Omelete de claras", "Tofu mexido (80g)"] },
      { id: "i2", alimento: "Pão de fermentação natural / integral", qtd: "1 fatia (40g)", substitutos: ["Tapioca (2 col. sopa)", "Cuscuz (3 col. sopa)"] },
      { id: "i3", alimento: "Mamão papaia", qtd: "1/2 unidade", substitutos: ["Melão (1 fatia)", "Morangos (8 unidades)"] },
      { id: "i4", alimento: "Café preto sem açúcar", qtd: "1 xícara (150ml)", substitutos: ["Chá verde", "Chá de hibisco"] },
    ],
    obs: "Evitar açúcar adicionado. Pode usar canela em pó nas frutas.",
  },
  {
    id: "m2",
    nome: "Lanche da Manhã",
    hora: "10:00",
    kcal: 210,
    itens: [
      { id: "i5", alimento: "Iogurte natural desnatado / kefir", qtd: "1 pote (170g)", substitutos: ["Iogurte vegetal de coco"] },
      { id: "i6", alimento: "Granola sem açúcar com castanhas", qtd: "2 col. sopa (20g)", substitutos: ["Aveia em flocos", "Sementes de girassol"] },
    ],
  },
  {
    id: "m3",
    nome: "Almoço",
    hora: "12:30",
    kcal: 620,
    itens: [
      { id: "i7", alimento: "Arroz integral / multigrãos", qtd: "4 col. sopa (120g)", substitutos: ["Batata doce assada (120g)", "Quinoa cozida (4 col. sopa)"] },
      { id: "i8", alimento: "Feijão carioca / preto temperado com alho", qtd: "1 concha média (100g)", substitutos: ["Lentilha cozida", "Grão de bico"] },
      { id: "i9", alimento: "Filé de frango grelhado com ervas", qtd: "150g", substitutos: ["Patinho moído (140g)", "Filé de tilápia assado (160g)", "Tofu grelhado (160g)"] },
      { id: "i10", alimento: "Salada verde (Alface, Rúcula, Tomate)", qtd: "À vontade", substitutos: ["Couve refogada", "Salada de pepino e brócolis"] },
    ],
    obs: "Usar no máximo 1 colher de chá de azeite extra virgem para temperar a salada.",
  },
  {
    id: "m4",
    nome: "Café da tarde",
    hora: "16:00",
    kcal: 260,
    itens: [
      { id: "i11", alimento: "Banana prata", qtd: "1 unidade média", substitutos: ["Maçã", "Pera"] },
      { id: "i12", alimento: "Pasta de amendoim integral", qtd: "1 col. sopa (15g)", substitutos: ["Mix de castanhas do pará e caju (20g)"] },
    ],
  },
  {
    id: "m5",
    nome: "Jantar",
    hora: "19:30",
    kcal: 440,
    itens: [
      { id: "i13", alimento: "Omelete de vegetais com ESPINAFRE e tomate", qtd: "3 ovos", substitutos: ["Sopa de legumes com frango desfocado (300ml)"] },
      { id: "i14", alimento: "Salada de folhas verdes com azeite de oliva", qtd: "1 prato fundo", substitutos: ["Legumes no vapor (abobrinha, cenoura)"] },
    ],
  },
  {
    id: "m6",
    nome: "Ceia",
    hora: "22:00",
    kcal: 40,
    itens: [
      { id: "i15", alimento: "Chá de camomila ou mulungu quente", qtd: "1 xícara (200ml)", substitutos: ["Chá de erva doce"] },
    ],
    obs: "Opcional. Ajuda no relaxamento e qualidade do sono.",
  },
];

function Plano() {
  const [refeicoes, setRefeicoes] = useState<Meal[]>(initialRefeicoes);
  const [activeTab, setActiveTab] = useState<"plano" | "compras">("plano");
  const [selectedSubstitutos, setSelectedSubstitutos] = useState<{ alimento: string; subs: string[] } | null>(null);

  const toggleItemDone = (mealId: string, itemId: string) => {
    setRefeicoes((prev) =>
      prev.map((m) => {
        if (m.id !== mealId) return m;
        return {
          ...m,
          itens: m.itens.map((it) => (it.id === itemId ? { ...it, done: !it.done } : it)),
        };
      })
    );
  };

  const totalKcal = refeicoes.reduce((acc, m) => acc + m.kcal, 0);
  const totalItens = refeicoes.flatMap((m) => m.itens).length;
  const completedItens = refeicoes.flatMap((m) => m.itens).filter((it) => it.done).length;
  const progressPercent = Math.round((completedItens / totalItens) * 100);

  const handleDownloadPDF = () => {
    toast.success("Gerando PDF do seu plano alimentar com recomendações da Dra. Camila...");
    setTimeout(() => {
      toast.info("Download concluído! Arquivo 'Plano_Alimentar_NutriConnect.pdf' salvo.");
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* CARD DE RESUMO MACRONUTRIENTES */}
      <div className="rounded-3xl border bg-card p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary mb-2">
              <Sparkles className="h-3.5 w-3.5" /> Prescrito por Dra. Camila Jardim (CRN-3 48921)
            </span>
            <h1 className="font-display text-2xl font-bold">Seu Plano Alimentar Atual</h1>
            <p className="text-xs text-muted-foreground mt-1">Objetivo: Reeducação Alimentar & Perda de Gordura com Manutenção de Massa Magra</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab("plano")}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                activeTab === "plano" ? "bg-primary text-primary-foreground shadow-xs" : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              Cardápio Diário
            </button>
            <button
              onClick={() => setActiveTab("compras")}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === "compras" ? "bg-primary text-primary-foreground shadow-xs" : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              <ShoppingCart className="h-3.5 w-3.5" /> Lista de Compras
            </button>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-secondary transition"
            >
              <Download className="h-3.5 w-3.5" /> Baixar PDF
            </button>
          </div>
        </div>

        {/* BARRAS DE METAS DO DIA */}
        <div className="mt-8 grid gap-4 sm:grid-cols-4 border-t pt-6">
          <div className="rounded-2xl bg-secondary/40 p-4">
            <div className="text-xs text-muted-foreground font-semibold">Energia Total</div>
            <div className="text-xl font-extrabold text-foreground mt-0.5">{totalKcal} kcal</div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-border overflow-hidden">
              <div className="h-full bg-primary" style={{ width: "100%" }} />
            </div>
          </div>

          <div className="rounded-2xl bg-secondary/40 p-4">
            <div className="text-xs text-muted-foreground font-semibold">Proteínas (30%)</div>
            <div className="text-xl font-extrabold text-foreground mt-0.5">145 g</div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-border overflow-hidden">
              <div className="h-full bg-accent" style={{ width: "85%" }} />
            </div>
          </div>

          <div className="rounded-2xl bg-secondary/40 p-4">
            <div className="text-xs text-muted-foreground font-semibold">Carboidratos (45%)</div>
            <div className="text-xl font-extrabold text-foreground mt-0.5">215 g</div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-border overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: "70%" }} />
            </div>
          </div>

          <div className="rounded-2xl bg-secondary/40 p-4">
            <div className="text-xs text-muted-foreground font-semibold">Gorduras Bons (25%)</div>
            <div className="text-xl font-extrabold text-foreground mt-0.5">55 g</div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-border overflow-hidden">
              <div className="h-full bg-amber-500" style={{ width: "60%" }} />
            </div>
          </div>
        </div>

        {/* BARRA DE PROGRESSO DIÁRIO */}
        <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-primary-soft/40 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <div>
              <div className="text-xs font-bold text-foreground">Progresso das refeições de hoje</div>
              <div className="text-xs text-muted-foreground">{completedItens} de {totalItens} itens concluídos ({progressPercent}%)</div>
            </div>
          </div>
          <div className="w-32 h-2.5 rounded-full bg-background overflow-hidden border">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {activeTab === "plano" ? (
        /* GRID DE REFEIÇÕES */
        <div className="grid gap-6 lg:grid-cols-2">
          {refeicoes.map((r) => (
            <div key={r.id} className="rounded-3xl border bg-card p-6 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-bold text-foreground">{r.nome}</h3>
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                      {r.kcal} kcal
                    </span>
                  </div>
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    {r.hora}
                  </span>
                </div>

                <ul className="mt-4 divide-y divide-border/60">
                  {r.itens.map((it) => (
                    <li key={it.id} className="flex items-center justify-between py-3">
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={!!it.done}
                          onChange={() => toggleItemDone(r.id, it.id)}
                          className="h-4 w-4 rounded accent-primary cursor-pointer"
                        />
                        <span className={`text-xs sm:text-sm font-medium ${it.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {it.alimento}
                        </span>
                      </label>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground font-semibold bg-secondary px-2 py-0.5 rounded-md">
                          {it.qtd}
                        </span>
                        {it.substitutos.length > 0 && (
                          <button
                            onClick={() => setSelectedSubstitutos({ alimento: it.alimento, subs: it.substitutos })}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary transition"
                            title="Ver opções de substituição"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {r.obs && (
                  <div className="mt-4 rounded-xl bg-accent-soft/50 p-3 text-xs text-accent font-medium flex items-start gap-2">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{r.obs}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LISTA DE COMPRAS GERADA AUTOMATICAMENTE */
        <div className="rounded-3xl border bg-card p-8 shadow-card space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold">Lista de Compras Semanal</h2>
            <p className="text-xs text-muted-foreground mt-1">Gerada automaticamente a partir dos ingredientes do seu plano alimentar.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border p-5 bg-secondary/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Hortifruti & Frutas</h3>
              <ul className="space-y-2 text-xs text-foreground">
                <li className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> 2 Bananas Prata</li>
                <li className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> 1 Mamão Papaia</li>
                <li className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> 1 Maço de Alface Crespa</li>
                <li className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> 1 Maço de Rúcula</li>
                <li className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> 500g de Tomate Italiano</li>
              </ul>
            </div>

            <div className="rounded-2xl border p-5 bg-secondary/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent mb-3">Proteínas & Laticínios</h3>
              <ul className="space-y-2 text-xs text-foreground">
                <li className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> 2 Dúzias de Ovos caipira</li>
                <li className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> 1kg de Filé de Frango</li>
                <li className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> 4 Potes de Iogurte Natural</li>
                <li className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> 500g de Filé de Tilápia</li>
              </ul>
            </div>

            <div className="rounded-2xl border p-5 bg-secondary/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3">Grãos & Mercearia</h3>
              <ul className="space-y-2 text-xs text-foreground">
                <li className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> 1kg de Arroz Integral</li>
                <li className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> 1kg de Feijão Preto</li>
                <li className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> 1 Pote de Pasta de Amendoim</li>
                <li className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> 1 Pote de Granola sem açúcar</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE OPÇÕES DE SUBSTITUIÇÃO */}
      {selectedSubstitutos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-xl">
            <h3 className="font-display text-lg font-bold text-foreground">
              Substitutos para "{selectedSubstitutos.alimento}"
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Você pode trocar este item por qualquer uma das opções aprovadas pela sua nutricionista sem alterar o valor calórico:
            </p>

            <ul className="mt-4 space-y-2">
              {selectedSubstitutos.subs.map((s, idx) => (
                <li key={idx} className="flex items-center justify-between rounded-xl border bg-secondary/40 p-3 text-xs font-semibold">
                  <span>{s}</span>
                  <button
                    onClick={() => {
                      toast.success(`Substituição aplicada! '${s}' selecionado.`);
                      setSelectedSubstitutos(null);
                    }}
                    className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground hover:bg-primary-hover"
                  >
                    Usar Este
                  </button>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setSelectedSubstitutos(null)}
              className="mt-6 w-full rounded-full border border-border bg-background py-2.5 text-xs font-semibold text-foreground hover:bg-secondary"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


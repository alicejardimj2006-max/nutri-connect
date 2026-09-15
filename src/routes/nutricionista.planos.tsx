import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Section } from "@/components/dashboard-shell";
import {
  Calculator,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  FileText,
  CheckCircle2,
  Download,
} from "lucide-react";

export const Route = createFileRoute("/nutricionista/planos")({
  component: Planos,
});

interface MealItem {
  id: string;
  alimento: string;
  qtd: string;
  subs: string;
}

interface MealBlock {
  id: string;
  nome: string;
  hora: string;
  itens: MealItem[];
  obs: string;
}

const templates = [
  {
    title: "Emagrecimento Consciente (1.600 kcal)",
    vET: 1600,
    prot: 120,
    carb: 160,
    gord: 45,
  },
  {
    title: "Hipertrofia & Força (2.600 kcal)",
    vET: 2600,
    prot: 180,
    carb: 320,
    gord: 65,
  },
  {
    title: "Reeducação & Equilíbrio (2.000 kcal)",
    vET: 2000,
    prot: 140,
    carb: 220,
    gord: 55,
  },
];

const pacientesMock = [
  { id: "p1", nome: "João Silva", objetivo: "Perda de Gordura", peso: 75.4 },
  { id: "p2", nome: "Mariana Oliveira", objetivo: "Hipertrofia", peso: 62.0 },
  { id: "p3", nome: "Carlos Eduardo", objetivo: "Controle Glicêmico", peso: 84.2 },
];

function Planos() {
  const [selectedPaciente, setSelectedPaciente] = useState(pacientesMock[0].id);
  const [vet, setVet] = useState(2000);
  const [prot, setProt] = useState(140);
  const [carb, setCarb] = useState(220);
  const [gord, setGord] = useState(55);

  const [refeicoes, setRefeicoes] = useState<MealBlock[]>([
    {
      id: "b1",
      nome: "Café da Manhã",
      hora: "07:30",
      obs: "Preferir pães integrais de fermentação natural.",
      itens: [
        { id: "i1", alimento: "Ovos mexidos", qtd: "2 unidades", subs: "Tofu mexido (80g)" },
        { id: "i2", alimento: "Pão integral", qtd: "1 fatia", subs: "Tapioca (2 col. sopa)" },
        { id: "i3", alimento: "Mamão papaia", qtd: "1/2 fatia", subs: "Melão ou Morango" },
      ],
    },
    {
      id: "b2",
      nome: "Almoço",
      hora: "12:30",
      obs: "Salada colorida à vontade com azeite de oliva.",
      itens: [
        { id: "i4", alimento: "Arroz integral", qtd: "4 col. sopa", subs: "Batata doce (120g)" },
        { id: "i5", alimento: "Feijão preto", qtd: "1 concha", subs: "Lentilha cozida" },
        {
          id: "i6",
          alimento: "Filé de frango grelhado",
          qtd: "150g",
          subs: "Tilápia assada ou Tofu",
        },
      ],
    },
  ]);

  const [showPreview, setShowPreview] = useState(false);

  const handleApplyTemplate = (tpl: (typeof templates)[0]) => {
    setVet(tpl.vET);
    setProt(tpl.prot);
    setCarb(tpl.carb);
    setGord(tpl.gord);
    toast.success(`Modelo "${tpl.title}" aplicado com sucesso!`);
  };

  const handleAddItem = (blockId: string) => {
    setRefeicoes((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        return {
          ...b,
          itens: [
            ...b.itens,
            {
              id: Date.now().toString(),
              alimento: "Novo alimento",
              qtd: "1 porção",
              subs: "Opção alternativa",
            },
          ],
        };
      }),
    );
  };

  const handleRemoveItem = (blockId: string, itemId: string) => {
    setRefeicoes((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        return { ...b, itens: b.itens.filter((i) => i.id !== itemId) };
      }),
    );
  };

  const handleSave = () => {
    const pac = pacientesMock.find((p) => p.id === selectedPaciente);
    toast.success(`Plano alimentar publicado e enviado para o app de ${pac?.nome}!`);
  };

  return (
    <div className="space-y-8">
      {/* HEADER E CONTROLES DE MODELO */}
      <Section title="Prescrição de Plano Alimentar">
        <div className="grid gap-6 md:grid-cols-2">
          {/* SELEÇÃO DO PACIENTE */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-foreground">
              Selecionar Paciente
            </label>
            <select
              value={selectedPaciente}
              onChange={(e) => setSelectedPaciente(e.target.value)}
              className="input"
            >
              {pacientesMock.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} — ({p.objetivo}, {p.peso} kg)
                </option>
              ))}
            </select>
          </div>

          {/* ATALHO DE MODELOS PRÉ-CONFIGURADOS */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-foreground flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Carregar Modelo Rápido
            </label>
            <div className="flex flex-wrap gap-2">
              {templates.map((t) => (
                <button
                  key={t.title}
                  type="button"
                  onClick={() => handleApplyTemplate(t)}
                  className="rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary-soft hover:text-primary transition"
                >
                  {t.title.split(" ")[0]} ({t.vET} kcal)
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CALCULADORA DE MACROS */}
        <div className="mt-6 rounded-2xl border bg-secondary/30 p-5 grid gap-4 sm:grid-cols-4">
          <div>
            <span className="text-xs text-muted-foreground font-semibold">Meta Calórica (VET)</span>
            <div className="flex items-center gap-1 mt-1">
              <input
                type="number"
                value={vet}
                onChange={(e) => setVet(Number(e.target.value))}
                className="w-24 rounded-lg border bg-background px-2.5 py-1 text-sm font-extrabold text-foreground"
              />
              <span className="text-xs font-bold text-muted-foreground">kcal</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-muted-foreground font-semibold">Proteínas</span>
            <div className="flex items-center gap-1 mt-1">
              <input
                type="number"
                value={prot}
                onChange={(e) => setProt(Number(e.target.value))}
                className="w-20 rounded-lg border bg-background px-2.5 py-1 text-sm font-extrabold text-foreground"
              />
              <span className="text-xs font-bold text-muted-foreground">g</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-muted-foreground font-semibold">Carboidratos</span>
            <div className="flex items-center gap-1 mt-1">
              <input
                type="number"
                value={carb}
                onChange={(e) => setCarb(Number(e.target.value))}
                className="w-20 rounded-lg border bg-background px-2.5 py-1 text-sm font-extrabold text-foreground"
              />
              <span className="text-xs font-bold text-muted-foreground">g</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-muted-foreground font-semibold">Gorduras</span>
            <div className="flex items-center gap-1 mt-1">
              <input
                type="number"
                value={gord}
                onChange={(e) => setGord(Number(e.target.value))}
                className="w-20 rounded-lg border bg-background px-2.5 py-1 text-sm font-extrabold text-foreground"
              />
              <span className="text-xs font-bold text-muted-foreground">g</span>
            </div>
          </div>
        </div>
      </Section>

      {/* CONSTRUTOR DE REFEIÇÕES */}
      <Section title="Refeições do Plano">
        <div className="space-y-6">
          {refeicoes.map((b) => (
            <div key={b.id} className="rounded-3xl border bg-card p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <input
                    value={b.nome}
                    onChange={(e) =>
                      setRefeicoes((prev) =>
                        prev.map((x) => (x.id === b.id ? { ...x, nome: e.target.value } : x)),
                      )
                    }
                    className="font-display font-bold text-lg bg-transparent border-b border-dashed border-border outline-none focus:border-primary"
                  />
                  <input
                    value={b.hora}
                    onChange={(e) =>
                      setRefeicoes((prev) =>
                        prev.map((x) => (x.id === b.id ? { ...x, hora: e.target.value } : x)),
                      )
                    }
                    className="w-16 rounded-full bg-primary/10 px-2 py-0.5 text-center text-xs font-bold text-primary outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleAddItem(b.id)}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground hover:bg-secondary/80"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar Item
                </button>
              </div>

              {/* LISTA DE ITENS */}
              <div className="space-y-3">
                {b.itens.map((it) => (
                  <div
                    key={it.id}
                    className="grid gap-2 sm:grid-cols-[1.5fr_1fr_1.5fr_auto] items-center rounded-2xl border bg-secondary/20 p-3"
                  >
                    <input
                      value={it.alimento}
                      onChange={(e) =>
                        setRefeicoes((prev) =>
                          prev.map((x) =>
                            x.id === b.id
                              ? {
                                  ...x,
                                  itens: x.itens.map((i) =>
                                    i.id === it.id ? { ...i, alimento: e.target.value } : i,
                                  ),
                                }
                              : x,
                          ),
                        )
                      }
                      className="w-full rounded-xl border bg-background px-3 py-1.5 text-xs outline-none"
                      placeholder="Nome do alimento"
                    />
                    <input
                      value={it.qtd}
                      onChange={(e) =>
                        setRefeicoes((prev) =>
                          prev.map((x) =>
                            x.id === b.id
                              ? {
                                  ...x,
                                  itens: x.itens.map((i) =>
                                    i.id === it.id ? { ...i, qtd: e.target.value } : i,
                                  ),
                                }
                              : x,
                          ),
                        )
                      }
                      className="w-full rounded-xl border bg-background px-3 py-1.5 text-xs outline-none"
                      placeholder="Quantidade"
                    />
                    <input
                      value={it.subs}
                      onChange={(e) =>
                        setRefeicoes((prev) =>
                          prev.map((x) =>
                            x.id === b.id
                              ? {
                                  ...x,
                                  itens: x.itens.map((i) =>
                                    i.id === it.id ? { ...i, subs: e.target.value } : i,
                                  ),
                                }
                              : x,
                          ),
                        )
                      }
                      className="w-full rounded-xl border bg-background px-3 py-1.5 text-xs outline-none"
                      placeholder="Substituto sugerido"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(b.id, it.id)}
                      className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* OBSERVAÇÃO DO BLOCO */}
              <div>
                <input
                  value={b.obs}
                  onChange={(e) =>
                    setRefeicoes((prev) =>
                      prev.map((x) => (x.id === b.id ? { ...x, obs: e.target.value } : x)),
                    )
                  }
                  className="w-full rounded-xl border border-dashed bg-background px-3 py-2 text-xs outline-none"
                  placeholder="Recomendações preparatórias para esta refeição..."
                />
              </div>
            </div>
          ))}
        </div>

        {/* BARRA DE AÇÕES DA PRESCRIÇÃO */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-xs font-semibold hover:bg-secondary"
          >
            <Eye className="h-4 w-4" /> Pré-visualizar Plano
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary-hover transition cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" /> Salvar & Publicar para Paciente
          </button>
        </div>
      </Section>

      {/* MODAL DE PREVIEW */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-display text-xl font-bold">Pré-visualização do Plano</h3>
              <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
                {vet} kcal / dia
              </span>
            </div>

            <div className="space-y-4">
              {refeicoes.map((r) => (
                <div key={r.id} className="rounded-2xl border bg-secondary/30 p-4">
                  <div className="flex justify-between font-bold text-sm">
                    <span>{r.nome}</span>
                    <span className="text-primary">{r.hora}</span>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs">
                    {r.itens.map((it) => (
                      <li key={it.id} className="flex justify-between">
                        <span>{it.alimento}</span>
                        <span className="text-muted-foreground">{it.qtd}</span>
                      </li>
                    ))}
                  </ul>
                  {r.obs && <p className="mt-2 text-[11px] text-accent font-medium">{r.obs}</p>}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowPreview(false)}
              className="mt-4 w-full rounded-full border bg-background py-2.5 text-xs font-semibold hover:bg-secondary"
            >
              Fechar Pré-visualização
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

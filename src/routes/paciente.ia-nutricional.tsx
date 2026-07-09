import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Download, Loader2, ChefHat } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Section } from "@/components/dashboard-shell";
import { recomendarReceitas, type RecomendacaoReceitas } from "@/lib/recomendar-receitas.functions";
import jsPDF from "jspdf";

export const Route = createFileRoute("/paciente/ia-nutricional")({
  component: IaNutricional,
});

type FormState = {
  objetivo: string;
  condicoesMedicas: string;
  estadoPsicologico: string;
  restricoes: string;
  preferencias: string;
  observacoes: string;
};

const initial: FormState = {
  objetivo: "Perda de peso",
  condicoesMedicas: "",
  estadoPsicologico: "",
  restricoes: "",
  preferencias: "",
  observacoes: "",
};

function IaNutricional() {
  const [form, setForm] = useState<FormState>(initial);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecomendacaoReceitas | null>(null);
  const gerar = useServerFn(recomendarReceitas);

  const upd = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.condicoesMedicas.trim() && !form.estadoPsicologico.trim()) {
      toast.error("Preencha ao menos uma das análises (médica ou psicológica).");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const out = await gerar({ data: form });
      setResult(out);
      toast.success("Recomendações geradas!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar recomendações.");
    } finally {
      setLoading(false);
    }
  };

  const baixarPdf = () => {
    if (!result) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const width = doc.internal.pageSize.getWidth() - margin * 2;
    const pageH = doc.internal.pageSize.getHeight();
    let y = margin;

    const check = (h = 16) => {
      if (y + h > pageH - margin) {
        doc.addPage();
        y = margin;
      }
    };
    const write = (text: string, size = 11, style: "normal" | "bold" = "normal", color: [number, number, number] = [30, 30, 30]) => {
      doc.setFont("helvetica", style);
      doc.setFontSize(size);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, width);
      for (const line of lines) {
        check(size + 4);
        doc.text(line, margin, y);
        y += size + 4;
      }
    };

    write("NutriConnect — Recomendações Nutricionais IA", 18, "bold", [76, 175, 80]);
    y += 6;
    write(`Objetivo: ${form.objetivo}`, 11, "bold");
    y += 8;
    write("Análise Nutricional", 14, "bold", [76, 175, 80]);
    write(result.analise);
    y += 8;

    write("Receitas Recomendadas", 14, "bold", [76, 175, 80]);
    result.receitas.forEach((r, i) => {
      y += 6;
      check(30);
      write(`${i + 1}. ${r.nome}  (${r.refeicao})`, 12, "bold");
      write(r.descricao);
      write(`Benefícios: ${r.beneficios}`, 10, "normal", [90, 90, 90]);
      write(`Tempo: ${r.tempoPreparo} · Porções: ${r.porcoes} · Calorias: ${r.calorias}`, 10, "normal", [90, 90, 90]);
      write("Ingredientes:", 11, "bold");
      r.ingredientes.forEach((it) => write(`  • ${it}`));
      write("Modo de preparo:", 11, "bold");
      r.modoPreparo.forEach((s, idx) => write(`  ${idx + 1}. ${s}`));
    });

    y += 10;
    write("Recomendações Gerais", 14, "bold", [76, 175, 80]);
    result.recomendacoesGerais.forEach((rec) => write(`• ${rec}`));

    doc.save("nutriconnect-recomendacoes.pdf");
  };

  return (
    <div className="space-y-6">
      <Section
        title="IA Nutricional Inteligente"
        action={
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Powered by IA
          </span>
        }
      >
        <p className="mb-4 text-sm text-muted-foreground">
          Descreva sua análise médica e estado psicológico. A IA vai interpretar o contexto e recomendar receitas específicas para o seu caso.
        </p>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <F label="Objetivo">
            <select className="input" value={form.objetivo} onChange={upd("objetivo")}>
              <option>Perda de peso</option>
              <option>Ganho de massa</option>
              <option>Manutenção</option>
              <option>Controle glicêmico</option>
              <option>Redução de colesterol</option>
              <option>Melhora da imunidade</option>
            </select>
          </F>
          <F label="Restrições e alergias">
            <input className="input" placeholder="Ex: sem glúten, sem lactose" value={form.restricoes} onChange={upd("restricoes")} />
          </F>
          <F label="Análise médica / condições clínicas" full>
            <textarea rows={3} className="input" placeholder="Ex: hipertensão leve, pré-diabetes, colesterol LDL 160, gastrite…" value={form.condicoesMedicas} onChange={upd("condicoesMedicas")} />
          </F>
          <F label="Estado psicológico / emocional" full>
            <textarea rows={3} className="input" placeholder="Ex: ansiedade, compulsão por doces à noite, estresse elevado, insônia…" value={form.estadoPsicologico} onChange={upd("estadoPsicologico")} />
          </F>
          <F label="Preferências alimentares">
            <input className="input" placeholder="Ex: vegetariano, adora peixes" value={form.preferencias} onChange={upd("preferencias")} />
          </F>
          <F label="Observações adicionais">
            <input className="input" placeholder="Rotina, prática de atividades…" value={form.observacoes} onChange={upd("observacoes")} />
          </F>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Analisando com IA…" : "Gerar recomendações"}
            </button>
          </div>
        </form>
        <style>{`.input{width:100%;border:1px solid var(--border);background:var(--background);border-radius:0.65rem;padding:0.55rem 0.75rem;font-size:0.875rem;outline:none;resize:vertical} .input:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in oklch, var(--primary) 20%, transparent)}`}</style>
      </Section>

      {result && (
        <Section
          title="Resultado da análise"
          action={
            <button onClick={baixarPdf} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              <Download className="h-4 w-4" /> Baixar PDF
            </button>
          }
        >
          <div className="mb-6 rounded-2xl bg-primary-soft/50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-primary">Análise nutricional</h3>
            <p className="whitespace-pre-line text-sm leading-relaxed">{result.analise}</p>
          </div>

          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <ChefHat className="h-4 w-4 text-primary" /> Receitas recomendadas
          </h3>
          <div className="grid gap-4 lg:grid-cols-2">
            {result.receitas.map((r, i) => (
              <div key={i} className="rounded-2xl border bg-secondary/40 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold">{r.nome}</h4>
                    <span className="text-xs text-muted-foreground">{r.refeicao}</span>
                  </div>
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">{r.calorias}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{r.descricao}</p>
                <p className="mt-2 rounded-lg bg-accent px-2 py-1 text-[11px] text-accent-foreground">💚 {r.beneficios}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  <span className="rounded-full border px-2 py-0.5">⏱ {r.tempoPreparo}</span>
                  <span className="rounded-full border px-2 py-0.5">🍽 {r.porcoes}</span>
                </div>
                <div className="mt-3">
                  <p className="text-xs font-semibold">Ingredientes</p>
                  <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                    {r.ingredientes.map((it, k) => <li key={k}>• {it}</li>)}
                  </ul>
                </div>
                <div className="mt-3">
                  <p className="text-xs font-semibold">Modo de preparo</p>
                  <ol className="mt-1 space-y-1 text-xs text-muted-foreground">
                    {r.modoPreparo.map((s, k) => <li key={k}>{k + 1}. {s}</li>)}
                  </ol>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border p-4">
            <h3 className="mb-2 text-sm font-semibold">Recomendações gerais</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {result.recomendacoesGerais.map((r, i) => <li key={i}>• {r}</li>)}
            </ul>
          </div>
        </Section>
      )}
    </div>
  );
}

function F({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

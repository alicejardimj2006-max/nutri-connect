import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Section } from "@/components/dashboard-shell";

export const Route = createFileRoute("/nutricionista/planos")({
  component: Planos,
});

const refs = ["Café da manhã", "Lanche", "Almoço", "Café da tarde", "Jantar", "Ceia"];

function Planos() {
  const [dados, setDados] = useState<Record<string, string>>({});
  const [obs, setObs] = useState("");

  return (
    <Section title="Criar plano alimentar">
      <div className="grid gap-4 lg:grid-cols-2">
        {refs.map((r) => (
          <div key={r} className="rounded-2xl border bg-secondary/40 p-4">
            <label className="mb-2 block text-sm font-semibold">{r}</label>
            <textarea
              rows={3}
              value={dados[r] ?? ""}
              onChange={(e) => setDados({ ...dados, [r]: e.target.value })}
              className="w-full resize-none rounded-lg border bg-background p-3 text-sm outline-none focus:border-primary"
              placeholder="Alimentos, quantidades e horário…"
            />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <label className="mb-2 block text-sm font-semibold">Observações</label>
        <textarea rows={3} value={obs} onChange={(e) => setObs(e.target.value)} className="w-full resize-none rounded-lg border bg-background p-3 text-sm outline-none focus:border-primary" placeholder="Recomendações adicionais…" />
      </div>
      <button onClick={() => toast.success("Plano salvo com sucesso!")} className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90">
        Salvar plano
      </button>
    </Section>
  );
}

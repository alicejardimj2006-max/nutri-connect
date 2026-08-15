import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { Section } from "@/components/dashboard-shell";

export const Route = createFileRoute("/nutricionista/pacientes")({
  component: Pacientes,
});

const pacientes = [
  { id: 1, nome: "Ana Souza", obj: "Perda de peso", peso: "68 kg", altura: "1,65 m", ultima: "05 nov" },
  { id: 2, nome: "Bruno Lima", obj: "Ganho de massa", peso: "72 kg", altura: "1,78 m", ultima: "02 nov" },
  { id: 3, nome: "João Silva", obj: "Perda de peso", peso: "75,4 kg", altura: "1,75 m", ultima: "09 nov" },
  { id: 4, nome: "Carla Mendes", obj: "Manutenção", peso: "60 kg", altura: "1,68 m", ultima: "28 out" },
];

function Pacientes() {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<typeof pacientes[number] | null>(null);
  const filtered = pacientes.filter((p) => p.nome.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Section title="Meus pacientes">
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar por nome…" className="w-full rounded-full border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:border-primary" />
          </div>
          <ul className="divide-y">
            {filtered.map((p) => (
              <li key={p.id}>
                <button onClick={() => setSel(p)} className={`w-full py-3 text-left transition ${sel?.id === p.id ? "" : "hover:bg-secondary/50"}`}>
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                      {p.nome.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{p.nome}</div>
                      <div className="text-xs text-muted-foreground">{p.obj} · última: {p.ultima}</div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Section>

        <Section title={sel ? sel.nome : "Selecione um paciente"} action={sel && <button className="rounded-full border px-3 py-1 text-xs font-semibold hover:bg-muted">Editar</button>}>
          {sel ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Info l="Peso" v={sel.peso} />
                <Info l="Altura" v={sel.altura} />
                <Info l="Objetivo" v={sel.obj} />
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold">Histórico</h4>
                <ul className="space-y-2 text-sm">
                  <li className="rounded-lg bg-secondary/50 p-2">05 nov · Retorno — Boa aderência ao plano.</li>
                  <li className="rounded-lg bg-secondary/50 p-2">12 out · Retorno — Ajuste de carboidratos.</li>
                  <li className="rounded-lg bg-secondary/50 p-2">20 set · Avaliação inicial — Plano criado.</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <button className="rounded-full border px-4 py-2 text-xs font-semibold hover:bg-muted">Ver evolução</button>
                <button className="rounded-full border px-4 py-2 text-xs font-semibold hover:bg-muted">Ver consultas</button>
                <button className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">Plano alimentar</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Escolha um paciente na lista ao lado para ver os detalhes.</p>
          )}
        </Section>
      </div>
    </div>
  );
}

function Info({ l, v }: { l: string; v: string }) {
  return <div className="rounded-xl border bg-secondary/40 p-3"><div className="text-xs text-muted-foreground">{l}</div><div className="mt-1 text-sm font-semibold">{v}</div></div>;
}

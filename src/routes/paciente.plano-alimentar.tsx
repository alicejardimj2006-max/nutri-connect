import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Section } from "@/components/dashboard-shell";

export const Route = createFileRoute("/paciente/plano-alimentar")({
  component: Plano,
});

const refeicoes = [
  { nome: "Café da manhã", hora: "07:00", itens: [{ a: "Ovos mexidos", q: "2 unid" }, { a: "Pão integral", q: "1 fatia" }, { a: "Mamão", q: "1 fatia média" }], obs: "Evite açúcar adicionado." },
  { nome: "Lanche", hora: "10:00", itens: [{ a: "Iogurte natural", q: "1 pote" }, { a: "Granola sem açúcar", q: "2 col. sopa" }], obs: "" },
  { nome: "Almoço", hora: "12:30", itens: [{ a: "Arroz integral", q: "4 col. sopa" }, { a: "Feijão", q: "1 concha" }, { a: "Frango grelhado", q: "150 g" }, { a: "Salada verde", q: "à vontade" }], obs: "Azeite: 1 col. chá." },
  { nome: "Café da tarde", hora: "16:00", itens: [{ a: "Fruta da estação", q: "1 unid" }, { a: "Castanhas", q: "1 punhado" }], obs: "" },
  { nome: "Jantar", hora: "19:30", itens: [{ a: "Omelete com legumes", q: "3 ovos" }, { a: "Salada de folhas", q: "à vontade" }], obs: "" },
  { nome: "Ceia", hora: "22:00", itens: [{ a: "Chá de camomila", q: "1 xícara" }], obs: "Opcional." },
];

function Plano() {
  return (
    <div className="space-y-16">
      <Section
        title="Meu plano alimentar"
        action={
          <button onClick={() => toast.success("Preparando PDF…")} className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted">
            <Download className="h-4 w-4" /> Baixar PDF
          </button>
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {refeicoes.map((r) => (
            <div key={r.nome} className="rounded-2xl border bg-secondary/40 p-10">
              <div className="flex gap-10 items-center justify-between">
                <h3 className="text-sm font-semibold">{r.nome}</h3>
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">{r.hora}</span>
              </div>
              <ul className="mt-5 divide-y">
                {r.itens.map((it) => (
                  <li key={it.a} className="flex gap-10 items-center justify-between py-10 text-sm">
                    <span>{it.a}</span><span className="text-muted-foreground">{it.q}</span>
                  </li>
                ))}
              </ul>
              {r.obs && <p className="mt-6 rounded-lg bg-accent px-7 py-5 text-xs text-accent-foreground">{r.obs}</p>}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

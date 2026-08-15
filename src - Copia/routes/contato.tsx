import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — NutriConnect" },
      { name: "description", content: "Fale com a equipe NutriConnect" },
      { property: "og:title", content: "Contato — NutriConnect" },
      { property: "og:description", content: "Estamos aqui para ajudar" },
    ],
  }),
  component: Contato,
});

function Contato() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight">Fale com a gente</h1>
        <p className="mt-3 text-muted-foreground">Dúvidas, sugestões ou parcerias? Envie sua mensagem</p>

        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            {[
              { i: Mail, t: "E-mail", v: "contato@nutriconnect.com" },
              { i: Phone, t: "Telefone", v: "+55 (11) 4002-8922" },
              { i: MapPin, t: "Endereço", v: "Av. Paulista, 1000 — São Paulo" },
            ].map((c) => (
              <div key={c.t} className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-card">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                  <c.i className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{c.t}</div>
                  <div className="text-sm text-muted-foreground">{c.v}</div>
                </div>
              </div>
            ))}
          </div>

          <form
            className="space-y-4 rounded-2xl border bg-card p-6 shadow-card"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Mensagem enviada! Retornaremos em breve");
              (e.target as HTMLFormElement).reset();
            }}
          >
            <Field label="Nome"><input required className="input" placeholder="Seu nome" /></Field>
            <Field label="E-mail"><input required type="email" className="input" placeholder="voce@email.com" /></Field>
            <Field label="Mensagem"><textarea required rows={5} className="input resize-none" placeholder="Como podemos ajudar?" /></Field>
            <button className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90">
              Enviar mensagem
            </button>
          </form>
        </div>
      </main>
      <SiteFooter />
      <style>{`.input{width:100%;border:1px solid var(--border);background:var(--background);border-radius:0.75rem;padding:0.65rem 0.9rem;font-size:0.875rem;outline:none;transition:all .15s} .input:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in oklch, var(--primary) 20%, transparent)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

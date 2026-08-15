import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { CalendarCheck, UtensilsCrossed, LineChart, MessageSquare, FileText, Users } from "lucide-react";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços — NutriConnect" },
      { name: "description", content: "Consulta online, plano alimentar personalizado, acompanhamento por chat e muito mais." },
      { property: "og:title", content: "Serviços — NutriConnect" },
      { property: "og:description", content: "Tudo que você precisa para cuidar da sua alimentação." },
    ],
  }),
  component: Servicos,
});

const services = [
  { icon: CalendarCheck, t: "Consulta online", d: "Agende consultas com nutricionistas certificados." },
  { icon: UtensilsCrossed, t: "Plano alimentar", d: "Cardápios personalizados de acordo com o seu objetivo." },
  { icon: LineChart, t: "Evolução monitorada", d: "Gráficos de peso, IMC e metas em tempo real." },
  { icon: MessageSquare, t: "Chat direto", d: "Fale com seu nutricionista entre as consultas." },
  { icon: FileText, t: "Prescrições em PDF", d: "Baixe seu plano alimentar para levar aonde quiser." },
  { icon: Users, t: "Para profissionais", d: "Ferramentas completas para gestão de pacientes." },
];

function Servicos() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight">Serviços</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">Uma plataforma completa para pacientes e nutricionistas.</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.t} className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

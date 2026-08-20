import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — NutriConnect" },
      { name: "description", content: "Conheça a NutriConnect, a plataforma que aproxima pacientes e nutricionistas." },
      { property: "og:title", content: "Sobre — NutriConnect" },
      { property: "og:description", content: "Nutrição personalizada, humanizada e conectada." },
    ],
  }),
  component: Sobre,
});

function Sobre() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight">Sobre a NutriConnect</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Somos uma plataforma que conecta pacientes e nutricionistas em um único ambiente digital, com foco em acompanhamento personalizado, evolução mensurável e uma experiência acolhedora
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border bg-card p-6 shadow-lg shadow-card transition hover:shadow-soft">
            <h2 className="text-xl font-semibold">Nossa missão</h2>
            <p className="mt-2 text-muted-foreground">Tornar o cuidado nutricional acessível, contínuo e centrado no paciente</p>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-lg shadow-card transition hover:shadow-soft">
            <h2 className="text-xl font-semibold">Nossa visão</h2>
            <p className="mt-2 text-muted-foreground">Ser a principal ponte entre profissionais da nutrição e pessoas que buscam uma vida mais saudável</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

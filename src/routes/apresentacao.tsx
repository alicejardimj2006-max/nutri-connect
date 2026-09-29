import { createFileRoute } from "@tanstack/react-router";
import { PresentationDeck } from "@/components/presentation/deck";

export const Route = createFileRoute("/apresentacao")({
  head: () => ({
    meta: [
      { title: "Apresentação — NutriConnect" },
      {
        name: "description",
        content:
          "Conheça o NutriConnect: o problema que resolvemos, nossos diferenciais, personas, concorrentes e um tour pela plataforma.",
      },
      { property: "og:title", content: "Apresentação — NutriConnect" },
      {
        property: "og:description",
        content: "Uma rede social sobre alimentação, apresentada slide a slide.",
      },
    ],
  }),
  component: PresentationDeck,
});

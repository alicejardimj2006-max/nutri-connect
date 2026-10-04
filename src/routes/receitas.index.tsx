import { createFileRoute, redirect } from "@tanstack/react-router";

// As receitas agora são uma das páginas do Explorar.
export const Route = createFileRoute("/receitas/")({
  beforeLoad: () => {
    throw redirect({ to: "/explorar", search: { tipo: "receita" }, replace: true });
  },
});

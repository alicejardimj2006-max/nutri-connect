import { createFileRoute, redirect } from "@tanstack/react-router";

// Não há página própria para um tipo de post: o post abre em modal no Explorar.
export const Route = createFileRoute("/receitas/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/explorar", search: { post: params.id }, replace: true });
  },
});

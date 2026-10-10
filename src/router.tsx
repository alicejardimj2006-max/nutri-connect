import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Telas internas rolam a área de conteúdo, não a janela: ela também volta ao topo ao trocar de página.
    scrollToTopSelectors: ["[data-app-main]"],
    defaultPreloadStaleTime: 0,
  });

  return router;
};

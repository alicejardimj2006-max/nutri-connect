import { Wing } from "@/components/rails-wing";
import {
  RAIL_PAGES,
  railSidesOf,
  readRailOverrides,
  renderRailCards,
} from "@/components/rails-pages";
import { useSiteConfig } from "@/lib/site-config";
import { useFeatures } from "@/lib/features";

// Colunas do Espaço: o padrão está em rails-pages ("espaco"); a administração pode trocar.
const ESPACO = RAIL_PAGES.find((p) => p.key === "espaco")!;
const CTX = { suggest: 4 };

function useEspacoSides() {
  return railSidesOf(ESPACO, readRailOverrides(useSiteConfig("site_rails")));
}

/** Lateral esquerda do Espaço: quem sou eu na rede, comunidades, amigos e a água do dia. */
export function EspacoLeftColumn() {
  return <Wing>{renderRailCards(useEspacoSides().left, CTX, useFeatures())}</Wing>;
}

/** Lateral direita do Espaço: trilha com a Nina, tema da semana, desafios, dica do dia e sugestões. */
export function EspacoRightColumn() {
  return <Wing>{renderRailCards(useEspacoSides().right, CTX, useFeatures())}</Wing>;
}

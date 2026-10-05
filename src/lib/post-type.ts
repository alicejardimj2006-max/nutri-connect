// Cor de cada tipo de post (receita = laranja, experiência = verde, pergunta = azul, conversa = roxo).
// A cor é aplicada direto no estilo de cada cartão, sem depender de regras globais de CSS: assim o
// cartão do feed, o modal e as miniaturas do Explorar sempre têm a mesma cor, em qualquer tema.
import { useSyncExternalStore, type CSSProperties } from "react";
import type { Post, PostType } from "@/lib/community";

const COLORS: Record<PostType, { light: string; dark: string }> = {
  receita: { light: "#d9692a", dark: "#f08a4b" },
  experiencia: { light: "#4f8a4b", dark: "#78b873" },
  pergunta: { light: "#3b7bbf", dark: "#6aa6e6" },
  geral: { light: "#8a5fb0", dark: "#b48ad6" },
};

export function normalizePostType(type: string | undefined): PostType {
  return type && type in COLORS ? (type as PostType) : "geral";
}

/** O site está no tema escuro? (acompanha a troca de tema sem recarregar) */
export function useIsDark(): boolean {
  return useSyncExternalStore(
    (notify) => {
      const observer = new MutationObserver(notify);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      return () => observer.disconnect();
    },
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
}

export function usePostTypeColor(type: string | undefined): string {
  const dark = useIsDark();
  const colors = COLORS[normalizePostType(type)];
  return dark ? colors.dark : colors.light;
}

/** Estilo do cartão de um tipo: define --pt e tinge a borda e o fundo. */
export function usePostTypeStyle(type: string | undefined, tint = true): CSSProperties | undefined {
  const color = usePostTypeColor(type);
  if (!type) return undefined;
  // Cor bem presente: fundo tingido, borda grossa na cor cheia e um leve brilho.
  const tinted = `color-mix(in srgb, ${color} 15%, var(--card))`;
  return {
    ["--pt" as string]: color,
    ["--post-fade" as string]: tinted,
    ...(tint
      ? {
          borderColor: color,
          borderWidth: 2,
          backgroundColor: tinted,
          boxShadow: `0 6px 22px -10px color-mix(in srgb, ${color} 70%, transparent)`,
        }
      : {}),
  } as CSSProperties;
}

/** Foto que representa o post: a dele ou, nas receitas e nos exemplos antigos, uma foto padrão. */
export function postDisplayImage(post: Post): string | undefined {
  if (post.image) return post.image;
  if (post.id === "p-rec-1") return "/images/recipes/default-recipe.jpg";
  if (post.id === "p-rec-2") return "/images/recipes/roasted-veg.jpg";
  if (post.type === "receita") return "/images/recipes/default-recipe.jpg";
  if (post.id === "p-exp-1") return "/images/experiences/cooking.jpg";
  return undefined;
}

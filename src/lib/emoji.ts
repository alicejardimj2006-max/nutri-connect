// Utilitários puros para emojis (sem dependências de tela).

// Pictogramas, símbolos coloridos e bandeiras; exclui setas, ✓ e outros sinais de texto.
const EMOJI_RE =
  /(?:[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\u{2702}-\u{2712}\u{2721}-\u{2728}\u{2733}-\u{2734}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2764}\u{2795}-\u{2797}\u{27B0}\u{27BF}\u{2B50}\u{2B55}\u{23E9}-\u{23FA}\u{231A}\u{231B}]\u{FE0F}?(?:\u{200D}[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}]\u{FE0F}?)*|[\u{1F3FB}-\u{1F3FF}])/gu;

/** Tira os emojis de um texto (e o espaço que sobra ao lado). */
export function stripEmoji(text: string): string {
  if (!EMOJI_RE.test(text)) return text;
  EMOJI_RE.lastIndex = 0;
  return text
    .replace(EMOJI_RE, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([.,!?;:])/g, "$1")
    .replace(/^[ \t]+|[ \t]+$/gm, "");
}

/** Divide um texto que começa com emoji em [ícone, resto]. */
export function splitLeadingEmoji(text: string): { emoji: string | null; rest: string } {
  const m = /^((?:[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}]\u{FE0F}?)+)\s*/u.exec(text);
  return m ? { emoji: Array.from(m[1])[0], rest: text.slice(m[0].length) } : { emoji: null, rest: text };
}

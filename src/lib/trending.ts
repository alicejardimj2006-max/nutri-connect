// Ordem do Explorar: os posts que mais engajaram e mais recentes ficam à frente, mas com uma pitada de
// sorte, para a mistura não ser sempre igual. A "sorte" é fixa durante a visita (mesma semente),
// então a grade não embaralha a cada clique.
import type { Post } from "@/lib/community";

/** Gerador pseudoaleatório simples e repetível. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pontos de engajamento: comentar e preparar valem mais que apoiar. */
export function engagement(post: Post): number {
  return (
    post.supports.length * 2 +
    post.likes.length +
    post.comments.length * 3 +
    post.preparedBy.length * 3
  );
}

export function trendingMix(posts: Post[], seed: number): Post[] {
  const rnd = mulberry32(Math.floor(seed * 1e9));
  const now = Date.now();
  return posts
    .map((post) => {
      const ageHours = Math.max(1, (now - Date.parse(post.createdAt)) / 36e5);
      const score = (engagement(post) + 1) / Math.pow(ageHours + 2, 0.7);
      // Variação de ±40%: mistura os tipos sem perder o que está em alta.
      return { post, score: score * (0.6 + rnd() * 0.8) };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.post);
}

// Gera a PRÉVIA do tema da semana a partir das buscas (domingo a sexta).
// Chamada pelo pg_cron no sábado (header x-cron-secret) ou por um admin no /admin.
// No domingo, public.activate_weekly_theme() transforma a prévia em tema ativo.
//
// Segredos: CRON_SECRET, LOVABLE_API_KEY. Opcional: THEME_AI_MODEL, THEME_MIN_SEARCHES.
import { HttpError, env, json, serve } from "../_shared/http.ts";
import { adminClient, requireUser } from "../_shared/supabase.ts";

type Lang = "en" | "es" | "fr";
interface ThemeText {
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  question: string;
  poll_question: string;
  poll_options: string[];
}
type Generated = ThemeText & { translations: Record<Lang, ThemeText> };

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const LANGS: Lang[] = ["en", "es", "fr"];

function localDate(d = new Date()): Date {
  // Data no fuso de São Paulo (UTC-3, sem horário de verão desde 2019).
  return new Date(d.getTime() - 3 * 3600_000);
}
const iso = (d: Date) => d.toISOString().slice(0, 10);
function nextSunday(): string {
  const today = localDate();
  const add = (7 - today.getUTCDay()) % 7 || 7;
  return iso(new Date(today.getTime() + add * 86_400_000));
}

async function authorize(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (secret) {
    if (secret !== env("CRON_SECRET")) throw new HttpError(401, "Segredo inválido.");
    return;
  }
  const user = await requireUser(req);
  const { data } = await adminClient()
    .from("platform_admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!data) throw new HttpError(403, "Apenas administradores da plataforma.");
}

function seasonalContext(weekStart: string): string {
  const [, m, d] = weekStart.split("-").map(Number);
  const dates: Record<number, string> = {
    1: "verão, férias escolares, calor e hidratação, frutas da estação (manga, melancia)",
    2: "verão, Carnaval, volta às aulas e lancheira",
    3: "início do outono, Dia Mundial da Água (22/3), Dia do Consumidor",
    4: "outono, Páscoa (chocolate com equilíbrio), Dia Mundial da Saúde (7/4)",
    5: "outono, Dia das Mães, frio chegando, sopas e caldos",
    6: "inverno, festas juninas (milho, amendoim, pinhão), Dia Mundial do Meio Ambiente",
    7: "inverno, férias escolares, comidas quentes e caseiras",
    8: "inverno, Dia dos Pais, Agosto Dourado (amamentação)",
    9: "início da primavera, Setembro Amarelo (saúde emocional e alimentação), flores comestíveis",
    10: "primavera, Dia das Crianças, Dia Mundial da Alimentação (16/10), Outubro Rosa",
    11: "primavera, Novembro Azul, Black Friday e consumo consciente",
    12: "verão chegando, festas de fim de ano, ceias equilibradas, calor",
  };
  return `Semana começando em ${d}/${m}: ${dates[m] ?? ""}.`;
}

const SYSTEM = `Você é a editora de conteúdo do NutriConnect, uma rede social de educação alimentar
brasileira, acolhedora e baseada em ciência. Escreva o "tema da semana" a partir do que as pessoas
buscaram. Regras: linguagem simples e gentil; sem terrorismo nutricional, sem dietas da moda, sem
contar calorias, sem prometer emagrecimento; foco em hábitos, comida de verdade e cultura alimentar
brasileira. Responda APENAS com um JSON válido, sem texto antes ou depois.`;

function userPrompt(terms: { term: string; hits: number }[], seasonal: string, recent: string[], useSeason: boolean) {
  return `Termos mais buscados de domingo a sexta (termo: buscas):
${terms.length ? terms.map((t) => `- ${t.term}: ${t.hits}`).join("\n") : "- (poucas buscas nesta semana)"}

${useSeason ? "Como houve poucas buscas, combine os termos (se houver) com o contexto sazonal:" : "Contexto sazonal (use só se combinar com os termos):"}
${seasonal}

Não repita estes temas recentes: ${recent.length ? recent.join(" | ") : "(nenhum)"}

Formato exato do JSON:
{
  "title": "título curto e convidativo (até 60 caracteres)",
  "subtitle": "frase curta (até 70 caracteres)",
  "description": "2 ou 3 frases explicando o convite da semana (até 320 caracteres)",
  "badge": "Tema da Semana",
  "question": "pergunta aberta para a comunidade (até 120 caracteres)",
  "poll_question": "pergunta da enquete (até 100 caracteres)",
  "poll_options": ["4 opções curtas (até 50 caracteres cada)"],
  "translations": {
    "en": { mesmos campos traduzidos, incluindo poll_options },
    "es": { ... },
    "fr": { ... }
  }
}`;
}

function parseJson(text: string): Generated {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Resposta da IA sem JSON.");
  const g = JSON.parse(text.slice(start, end + 1)) as Generated;
  const ok = (t: ThemeText | undefined) =>
    !!t && !!t.title && !!t.description && Array.isArray(t.poll_options) && t.poll_options.length >= 2;
  if (!ok(g)) throw new Error("JSON da IA incompleto.");
  g.poll_options = g.poll_options.slice(0, 4);
  g.translations = Object.fromEntries(
    LANGS.filter((l) => ok(g.translations?.[l])).map((l) => [l, g.translations[l]]),
  ) as Generated["translations"];
  return g;
}

async function generateWithAi(prompt: string): Promise<Generated> {
  const key = env("LOVABLE_API_KEY");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: Deno.env.get("THEME_AI_MODEL") ?? "google/gemini-2.5-flash",
      temperature: 0.8,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Gateway de IA respondeu ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const body = await res.json();
  return parseJson(body?.choices?.[0]?.message?.content ?? "");
}

// Reserva sem IA (se o gateway falhar): um tema por estação, em português.
function fallbackTheme(weekStart: string, recent: string[]): Generated {
  const m = Number(weekStart.split("-")[1]);
  const season =
    m <= 2 || m === 12 ? "verao" : m <= 5 ? "outono" : m <= 8 ? "inverno" : "primavera";
  const themes: Record<string, ThemeText> = {
    verao: {
      title: "Verão Leve: Frutas, Água e Comida Fresca",
      subtitle: "Um convite da estação",
      description: "Calor pede hidratação e refeições frescas. Nesta semana, vamos explorar frutas da estação, saladas completas e ideias para levar água sempre por perto.",
      badge: "Tema da Semana",
      question: "Qual fruta da estação você mais gosta de comer no calor?",
      poll_question: "O que mais atrapalha você a beber água?",
      poll_options: ["Esqueço", "Não sinto sede", "Não gosto do gosto", "Falta garrafinha"],
    },
    outono: {
      title: "Outono na Panela: Sopas, Caldos e Afeto",
      subtitle: "Um convite da estação",
      description: "Os dias mais frescos combinam com preparos caseiros. Nesta semana, a proposta é redescobrir sopas e caldos simples, nutritivos e que rendem para a semana toda.",
      badge: "Tema da Semana",
      question: "Qual sopa lembra a sua infância?",
      poll_question: "O que impede você de cozinhar mais em casa?",
      poll_options: ["Tempo", "Falta de ideias", "Cansaço", "Louça para lavar"],
    },
    inverno: {
      title: "Inverno Aconchegante e Equilibrado",
      subtitle: "Um convite da estação",
      description: "No frio, a vontade de comer muda. Nesta semana, vamos falar de comidas quentinhas, festas juninas com equilíbrio e como manter frutas e verduras no prato.",
      badge: "Tema da Semana",
      question: "Qual comida quentinha não pode faltar no seu inverno?",
      poll_question: "No frio, o que mais sai do seu prato?",
      poll_options: ["Saladas", "Frutas", "Água", "Nada muda"],
    },
    primavera: {
      title: "Primavera Colorida no Prato",
      subtitle: "Um convite da estação",
      description: "Mais cores no prato significam mais variedade de nutrientes. Nesta semana, o desafio é montar refeições com pelo menos três cores diferentes de vegetais.",
      badge: "Tema da Semana",
      question: "Qual vegetal colorido você quer experimentar nesta semana?",
      poll_question: "Quantas cores costumam aparecer no seu almoço?",
      poll_options: ["Uma", "Duas", "Três", "Quatro ou mais"],
    },
  };
  // Atemporais, usados quando o da estação já saiu recentemente.
  const evergreen: ThemeText[] = [
    {
      title: "Comida de Verdade no Dia a Dia",
      subtitle: "Um convite para a semana",
      description: "Menos ultraprocessados e mais comida feita em casa, sem perfeição. Nesta semana, vamos trocar ideias de refeições simples com ingredientes que você já tem.",
      badge: "Tema da Semana",
      question: "Qual refeição simples você faz de olhos fechados?",
      poll_question: "Qual ultraprocessado é mais difícil de largar?",
      poll_options: ["Biscoito recheado", "Refrigerante", "Salgadinho", "Embutidos"],
    },
    {
      title: "Comer com Atenção, Sem Pressa",
      subtitle: "Um convite para a semana",
      description: "Mastigar devagar e prestar atenção à fome e à saciedade muda a relação com a comida. Nesta semana, a proposta é fazer ao menos uma refeição por dia sem telas.",
      badge: "Tema da Semana",
      question: "Em que momento do dia você come com mais pressa?",
      poll_question: "Onde você costuma almoçar?",
      poll_options: ["À mesa", "No trabalho", "Em frente à TV", "No celular"],
    },
    {
      title: "Lanches Práticos Que Matam a Fome",
      subtitle: "Um convite para a semana",
      description: "Um bom lanche evita chegar com muita fome à próxima refeição. Nesta semana, vamos montar combinações práticas de fruta, castanhas, iogurte e preparos caseiros.",
      badge: "Tema da Semana",
      question: "Qual é o seu lanche coringa?",
      poll_question: "Quando bate a fome entre as refeições, você…",
      poll_options: ["Belisca o que tiver", "Leva lanche de casa", "Compra algo na rua", "Espera a próxima refeição"],
    },
  ];
  const pick = [themes[season], ...evergreen].find((t) => !recent.includes(t.title)) ?? evergreen[0];
  return { ...pick, translations: {} as Generated["translations"] };
}

serve(async (req) => {
  await authorize(req);
  const body = (await req.json().catch(() => ({}))) as { week_start?: string; force?: boolean };
  const weekStart = body.week_start ?? nextSunday();
  if (new Date(`${weekStart}T12:00:00Z`).getUTCDay() !== 0) throw new HttpError(400, "week_start precisa ser um domingo.");

  const db = adminClient();
  const { data: existing } = await db.from("weekly_themes").select("id, status").eq("week_start", weekStart).maybeSingle();
  if (existing && existing.status !== "previa") throw new HttpError(409, "O tema desta semana já está no ar.");
  if (existing && !body.force) return json({ ok: true, skipped: "prévia já existe", id: existing.id });

  // Buscas de domingo a sexta da semana anterior ao tema.
  const from = iso(new Date(new Date(`${weekStart}T12:00:00Z`).getTime() - 7 * 86_400_000));
  const to = iso(new Date(new Date(`${weekStart}T12:00:00Z`).getTime() - 2 * 86_400_000));
  const { data: termRows, error: termError } = await db.rpc("top_search_terms", { p_from: from, p_to: to, p_limit: 30 });
  if (termError) throw new HttpError(500, termError.message);
  const terms = ((termRows ?? []) as { term: string; hits: number }[]).map((t) => ({ term: t.term, hits: Number(t.hits) }));
  const totalHits = terms.reduce((a, t) => a + t.hits, 0);
  const minSearches = Number(Deno.env.get("THEME_MIN_SEARCHES") ?? 20);
  const useSeason = totalHits < minSearches;

  const { data: recentRows } = await db.from("weekly_themes").select("title").order("week_start", { ascending: false }).limit(8);
  const recent = (recentRows ?? []).map((r) => r.title as string);

  let theme: Generated;
  let source: "ia" | "sazonal" = useSeason ? "sazonal" : "ia";
  try {
    theme = await generateWithAi(userPrompt(terms, seasonalContext(weekStart), recent, useSeason));
  } catch (err) {
    console.error("weekly-theme: IA indisponível, usando tema sazonal", err);
    theme = fallbackTheme(weekStart, recent);
    source = "sazonal";
  }

  const row = {
    week_start: weekStart,
    status: "previa",
    title: theme.title,
    subtitle: theme.subtitle,
    description: theme.description,
    badge: theme.badge || "Tema da Semana",
    question: theme.question,
    poll_question: theme.poll_question,
    translations: Object.fromEntries(
      Object.entries(theme.translations ?? {}).map(([l, t]) => [l, {
        title: t.title, subtitle: t.subtitle, description: t.description, badge: t.badge,
        question: t.question, poll_question: t.poll_question,
      }]),
    ),
    source,
    source_terms: terms.slice(0, 10),
  };

  let themeId = existing?.id as string | undefined;
  if (themeId) {
    await db.from("theme_poll_options").delete().eq("theme_id", themeId);
    const { error } = await db.from("weekly_themes").update(row).eq("id", themeId);
    if (error) throw new HttpError(500, error.message);
  } else {
    const { data, error } = await db.from("weekly_themes").insert(row).select("id").single();
    if (error) throw new HttpError(500, error.message);
    themeId = data.id;
  }

  const options = theme.poll_options.map((text, i) => ({
    theme_id: themeId,
    position: i,
    text,
    translations: Object.fromEntries(
      LANGS.filter((l) => theme.translations?.[l]?.poll_options?.[i]).map((l) => [l, theme.translations[l].poll_options[i]]),
    ),
  }));
  const { error: optError } = await db.from("theme_poll_options").insert(options);
  if (optError) throw new HttpError(500, optError.message);

  return json({ ok: true, id: themeId, week_start: weekStart, source, terms: terms.length, total_hits: totalHits });
});

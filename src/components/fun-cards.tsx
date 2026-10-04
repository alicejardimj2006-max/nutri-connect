// Cards interativos das páginas: pequenos jogos, ferramentas e rituais do dia a dia. Cada página
// escolhe os seus em rails-pages.tsx. O progresso fica só neste aparelho (localStorage), sem dados
// de saúde enviados a servidor. Textos nos 4 idiomas, no mesmo formato do restante do site.
import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Apple,
  Carrot,
  CheckCircle2,
  ChefHat,
  Cherry,
  Citrus,
  Heart,
  LeafyGreen,
  Leaf,
  PartyPopper,
  Sparkles,
  Star,
  type LucideIcon,
  Copy,
  Dices,
  Flame,
  GlassWater,
  Lightbulb,
  MessageCircle,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Scale,
  Search,
  Shuffle,
  ShoppingBasket,
  Target,
  Timer,
  Trophy,
  Utensils,
  Wind,
  X,
} from "lucide-react";
import { EmojiIcon } from "@/components/emoji-icon";
import { Panel } from "@/components/rail-cards";
import { useAuth } from "@/hooks/use-auth";
import { useCommunity } from "@/hooks/use-community";
import { useI18n } from "@/hooks/use-i18n";
import { pickName, type Names } from "@/lib/appearance-data";
import { td } from "@/lib/i18n/data";
import { playSound } from "@/lib/sounds";
import { themeText } from "@/lib/social/feed";
import { useActiveTheme, useFeed } from "@/lib/social/feed-queries";

// ───────────────────────────── Ajudantes ─────────────────────────────

function useTr() {
  const { locale } = useI18n();
  return useCallback((names: Names) => pickName(names, locale), [locale]);
}

/** Estado salvo neste aparelho, separado por pessoa. Nunca quebra se o navegador bloquear o armazenamento. */
function useLocal<T>(name: string, initial: T) {
  const { user } = useAuth();
  const key = `nc_fun_${name}_${user?.id ?? "anon"}`;
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* sem armazenamento: segue só nesta sessão */
    }
  }, [key]);
  const set = useCallback(
    (next: T | ((prev: T) => T)) =>
      setValue((prev) => {
        const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(v));
        } catch {
          /* ignorar */
        }
        return v;
      }),
    [key],
  );
  return [value, set] as const;
}

const pad = (n: number) => String(n).padStart(2, "0");
/** Data local no formato AAAA-MM-DD. */
const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Semente do dia: a "dica do dia" muda sozinha à meia-noite. */
function dayNumber() {
  return Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
}

/** Chuva de emojis para comemorar. `fire()` dispara de novo. */
function useBurst() {
  const [id, setId] = useState(0);
  const fire = useCallback(() => setId((n) => n + 1), []);
  return [id, fire] as const;
}

// Confete de ícones nas cores da marca (sem emojis).
const BURST: { icon: LucideIcon; color: string }[] = [
  { icon: PartyPopper, color: "#d9692a" },
  { icon: Sparkles, color: "#c58a12" },
  { icon: Carrot, color: "#d9692a" },
  { icon: Apple, color: "#d6456b" },
  { icon: LeafyGreen, color: "#4f8a4b" },
  { icon: Citrus, color: "#e8b13b" },
  { icon: Star, color: "#c58a12" },
  { icon: Heart, color: "#d6456b" },
  { icon: Cherry, color: "#be185d" },
  { icon: Leaf, color: "#4f8a4b" },
];

function Burst({ id }: { id: number }) {
  if (!id) return null;
  return (
    <div key={id} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      {BURST.map(({ icon: Icon, color }, i) => {
        const angle = (i / BURST.length) * Math.PI * 2;
        const radius = 90 + (i % 3) * 28;
        return (
          <span
            key={i}
            className="nc-burst absolute left-1/2 top-1/2"
            style={
              {
                "--dx": `${Math.round(Math.cos(angle) * radius)}px`,
                "--dy": `${Math.round(Math.sin(angle) * radius)}px`,
                animationDelay: `${(i % 4) * 40}ms`,
              } as React.CSSProperties
            }
          >
            <Icon className="h-5 w-5" style={{ color }} strokeWidth={2.2} />
          </span>
        );
      })}
    </div>
  );
}

const iconBtn =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-[11px] font-semibold text-foreground transition hover:bg-secondary/70 active:scale-95";
const primaryBtn =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";
const note = "mt-3 text-[10px] leading-snug text-muted-foreground";

function Bar({ value, max }: { value: number; max: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-secondary">
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-500"
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  );
}

// ───────────────────────────── Hidratação ─────────────────────────────

const GLASSES = 8;
const GLASS_ML = 250;

/** Copos de água do dia: toque num copo para encher até ele. */
export function HydrationCard() {
  const tr = useTr();
  const today = dayKey();
  const [log, setLog] = useLocal<Record<string, number>>("water", {});
  const [burst, fire] = useBurst();
  const count = log[today] ?? 0;

  const setCount = (n: number) => {
    const next = Math.max(0, Math.min(GLASSES, n));
    setLog({ [today]: next });
    if (next === GLASSES && count < GLASSES) {
      fire();
      playSound("achievement");
    } else {
      playSound("click");
    }
  };

  return (
    <Panel
      title={tr(["Água de hoje", "Today's water", "Agua de hoy", "L'eau du jour"])}
      className="relative"
      action={
        count > 0 ? (
          <button type="button" onClick={() => setCount(0)} className="cursor-pointer text-muted-foreground hover:text-foreground" aria-label={tr(["Zerar", "Reset", "Reiniciar", "Réinitialiser"])}>
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        ) : undefined
      }
    >
      <Burst id={burst} />
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: GLASSES }, (_, i) => {
          const filled = i < count;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setCount(filled && i === count - 1 ? i : i + 1)}
              aria-label={`${i + 1}`}
              aria-pressed={filled}
              className={`grid h-12 cursor-pointer place-items-center rounded-2xl border transition active:scale-90 ${
                filled
                  ? "border-accent/40 bg-accent/15 text-accent"
                  : "border-border/70 bg-secondary/40 text-muted-foreground hover:bg-secondary"
              }`}
            >
              <GlassWater className={`h-6 w-6 transition-transform ${filled ? "scale-110" : ""}`} fill={filled ? "currentColor" : "none"} fillOpacity={0.25} />
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="font-bold text-foreground">
          {count}/{GLASSES} {tr(["copos", "glasses", "vasos", "verres"])}
        </span>
        <span className="text-muted-foreground">{count * GLASS_ML} ml</span>
      </div>
      <div className="mt-1.5">
        <Bar value={count} max={GLASSES} />
      </div>
      <p className={note}>
        {count >= GLASSES
          ? tr(["Meta do dia batida! 🎉", "Daily goal reached! 🎉", "¡Meta del día lograda! 🎉", "Objectif du jour atteint ! 🎉"])
          : tr(
              [
                "Cada copo = 250 ml. A necessidade de água varia de pessoa para pessoa.",
                "Each glass = 250 ml. Water needs vary from person to person.",
                "Cada vaso = 250 ml. La necesidad de agua varía de persona a persona.",
                "Chaque verre = 250 ml. Les besoins en eau varient d'une personne à l'autre.",
              ],
            )}
      </p>
    </Panel>
  );
}

// ───────────────────────────── Dica do dia ─────────────────────────────

const TIPS: Names[] = [
  ["Prefira água a bebidas adoçadas: refrigerantes e sucos de caixinha trazem muito açúcar.", "Prefer water over sweetened drinks: sodas and boxed juices carry a lot of sugar.", "Prefiere el agua a las bebidas azucaradas: gaseosas y jugos de caja traen mucha azúcar.", "Préférez l'eau aux boissons sucrées : sodas et jus en boîte contiennent beaucoup de sucre."],
  ["Comer com atenção, sem telas, ajuda a perceber a saciedade.", "Eating mindfully, without screens, helps you notice fullness.", "Comer con atención, sin pantallas, ayuda a percibir la saciedad.", "Manger en pleine conscience, sans écrans, aide à ressentir la satiété."],
  ["Frutas, legumes e verduras de cores variadas trazem nutrientes diferentes.", "Fruits and vegetables of different colors bring different nutrients.", "Frutas y verduras de colores variados aportan nutrientes diferentes.", "Les fruits et légumes de couleurs variées apportent des nutriments différents."],
  ["Uma lista de compras reduz o desperdício e as compras por impulso.", "A shopping list reduces waste and impulse buying.", "Una lista de compras reduce el desperdicio y las compras por impulso.", "Une liste de courses réduit le gaspillage et les achats impulsifs."],
  ["Sempre que puder, faça as refeições em horários regulares e em boa companhia.", "Whenever you can, eat at regular times and in good company.", "Siempre que puedas, come en horarios regulares y en buena compañía.", "Dès que possible, mangez à heures régulières et en bonne compagnie."],
  ["Leia o rótulo: quanto menor a lista de ingredientes, em geral mais natural é o alimento.", "Read the label: the shorter the ingredient list, the more natural the food usually is.", "Lee la etiqueta: cuanto más corta la lista de ingredientes, más natural suele ser el alimento.", "Lisez l'étiquette : plus la liste d'ingrédients est courte, plus l'aliment est en général naturel."],
  ["Alimentos in natura ou minimamente processados devem ser a base da alimentação (Guia Alimentar).", "Fresh or minimally processed foods should be the basis of your diet (Brazilian Dietary Guidelines).", "Los alimentos frescos o mínimamente procesados deben ser la base de la alimentación (Guía Alimentaria).", "Les aliments frais ou peu transformés doivent être la base de l'alimentation (Guide alimentaire)."],
  ["Arroz com feijão é uma combinação tradicional, saborosa e nutritiva.", "Rice and beans is a traditional, tasty and nutritious combination.", "Arroz con frijoles es una combinación tradicional, sabrosa y nutritiva.", "Riz et haricots : une combinaison traditionnelle, savoureuse et nutritive."],
  ["Cozinhar em casa dá controle sobre o sal, o açúcar e a gordura do prato.", "Cooking at home gives you control over the salt, sugar and fat in your meal.", "Cocinar en casa te da control sobre la sal, el azúcar y la grasa del plato.", "Cuisiner à la maison permet de contrôler le sel, le sucre et les graisses."],
  ["Dormir bem influencia o apetite e a disposição durante o dia.", "Sleeping well affects appetite and energy during the day.", "Dormir bien influye en el apetito y en la energía durante el día.", "Bien dormir influence l'appétit et l'énergie pendant la journée."],
  ["Pequenas caminhadas ao longo do dia também somam para a saúde.", "Short walks throughout the day add up for your health.", "Las caminatas cortas a lo largo del día también suman para la salud.", "De petites marches tout au long de la journée comptent aussi pour la santé."],
  ["Dúvidas sobre a sua alimentação? Um(a) nutricionista orienta de forma individual.", "Questions about your diet? A nutritionist can guide you individually.", "¿Dudas sobre tu alimentación? Un(a) nutricionista orienta de forma individual.", "Des questions sur votre alimentation ? Un(e) nutritionniste vous guide individuellement."],
];

export function DailyTipCard() {
  const tr = useTr();
  const [shift, setShift] = useState(0);
  const tip = TIPS[(dayNumber() + shift) % TIPS.length];
  return (
    <Panel title={tr(["Dica do dia", "Tip of the day", "Consejo del día", "Astuce du jour"])}>
      <div className="flex gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
          <Lightbulb className="h-5 w-5" />
        </span>
        <p key={shift} className="nc-pop-in text-sm leading-relaxed text-foreground">
          {tr(tip)}
        </p>
      </div>
      <div className="mt-3 flex justify-end">
        <button type="button" className={iconBtn} onClick={() => setShift((n) => n + 1)}>
          <Shuffle className="h-3 w-3" />
          {tr(["Outra dica", "Another tip", "Otro consejo", "Autre astuce"])}
        </button>
      </div>
    </Panel>
  );
}

// ───────────────────────────── Quiz relâmpago ─────────────────────────────

interface Question {
  q: Names;
  options: [Names, Names, Names];
  answer: 0 | 1 | 2;
  why: Names;
}

const QUESTIONS: Question[] = [
  {
    q: ["Qual destes alimentos é fonte de vitamina C?", "Which of these foods is a source of vitamin C?", "¿Cuál de estos alimentos es fuente de vitamina C?", "Lequel de ces aliments est une source de vitamine C ?"],
    options: [["Arroz branco", "White rice", "Arroz blanco", "Riz blanc"], ["Laranja", "Orange", "Naranja", "Orange"], ["Pão francês", "French bread", "Pan francés", "Pain"]],
    answer: 1,
    why: ["Frutas cítricas, como laranja e acerola, são ricas em vitamina C.", "Citrus fruits, like oranges and acerola, are rich in vitamin C.", "Las frutas cítricas, como la naranja y la acerola, son ricas en vitamina C.", "Les agrumes, comme l'orange et l'acérola, sont riches en vitamine C."],
  },
  {
    q: ["Segundo o Guia Alimentar brasileiro, qual deve ser a base da alimentação?", "According to the Brazilian Dietary Guidelines, what should be the basis of your diet?", "Según la Guía Alimentaria brasileña, ¿cuál debe ser la base de la alimentación?", "Selon le Guide alimentaire brésilien, quelle doit être la base de l'alimentation ?"],
    options: [["Ultraprocessados", "Ultra-processed foods", "Ultraprocesados", "Ultra-transformés"], ["Alimentos in natura ou minimamente processados", "Fresh or minimally processed foods", "Alimentos frescos o mínimamente procesados", "Aliments frais ou peu transformés"], ["Suplementos", "Supplements", "Suplementos", "Compléments"]],
    answer: 1,
    why: ["Priorize alimentos frescos, como frutas, legumes, feijões, arroz e ovos.", "Prioritize fresh foods such as fruits, vegetables, beans, rice and eggs.", "Prioriza alimentos frescos, como frutas, verduras, frijoles, arroz y huevos.", "Privilégiez les aliments frais : fruits, légumes, haricots, riz et œufs."],
  },
  {
    q: ["Qual destes é uma boa fonte de ferro de origem vegetal?", "Which of these is a good plant source of iron?", "¿Cuál de estos es una buena fuente de hierro de origen vegetal?", "Lequel de ces aliments est une bonne source de fer végétal ?"],
    options: [["Feijão", "Beans", "Frijoles", "Haricots"], ["Refrigerante", "Soda", "Gaseosa", "Soda"], ["Margarina", "Margarine", "Margarina", "Margarine"]],
    answer: 0,
    why: ["Feijões e lentilhas têm ferro. Combinar com uma fonte de vitamina C ajuda a absorver melhor.", "Beans and lentils contain iron. Pairing them with vitamin C helps absorption.", "Los frijoles y las lentejas tienen hierro. Combinarlos con vitamina C ayuda a absorberlo.", "Haricots et lentilles contiennent du fer. Les associer à la vitamine C aide l'absorption."],
  },
  {
    q: ["As fibras alimentares ajudam principalmente em quê?", "What do dietary fibers mainly help with?", "¿En qué ayudan principalmente las fibras alimentarias?", "À quoi servent principalement les fibres alimentaires ?"],
    options: [["No funcionamento do intestino", "Bowel function", "El funcionamiento del intestino", "Le fonctionnement de l'intestin"], ["Na queda de cabelo", "Hair loss", "La caída del cabello", "La chute des cheveux"], ["Na visão noturna", "Night vision", "La visión nocturna", "La vision nocturne"]],
    answer: 0,
    why: ["Frutas, verduras, grãos integrais e leguminosas são ricos em fibras.", "Fruits, vegetables, whole grains and legumes are rich in fiber.", "Las frutas, verduras, cereales integrales y legumbres son ricos en fibra.", "Fruits, légumes, céréales complètes et légumineuses sont riches en fibres."],
  },
  {
    q: ["Qual é a melhor bebida para se hidratar no dia a dia?", "What is the best everyday drink for hydration?", "¿Cuál es la mejor bebida para hidratarse a diario?", "Quelle est la meilleure boisson pour s'hydrater au quotidien ?"],
    options: [["Refrigerante", "Soda", "Gaseosa", "Soda"], ["Suco de caixinha", "Boxed juice", "Jugo de caja", "Jus en boîte"], ["Água", "Water", "Agua", "Eau"]],
    answer: 2,
    why: ["A água hidrata sem açúcar adicionado.", "Water hydrates with no added sugar.", "El agua hidrata sin azúcar añadido.", "L'eau hydrate sans sucre ajouté."],
  },
  {
    q: ["Qual destes alimentos é fonte de cálcio?", "Which of these foods is a source of calcium?", "¿Cuál de estos alimentos es fuente de calcio?", "Lequel de ces aliments est une source de calcium ?"],
    options: [["Açúcar", "Sugar", "Azúcar", "Sucre"], ["Óleo", "Oil", "Aceite", "Huile"], ["Leite e iogurte", "Milk and yogurt", "Leche y yogur", "Lait et yaourt"]],
    answer: 2,
    why: ["Leite e derivados são as fontes mais conhecidas; couve e sardinha também têm cálcio.", "Milk and dairy are the best-known sources; kale and sardines also have calcium.", "La leche y derivados son las fuentes más conocidas; la col rizada y las sardinas también tienen calcio.", "Le lait et ses dérivés sont les sources les plus connues ; le chou kale et les sardines aussi."],
  },
  {
    q: ["Qual destes é um exemplo de ultraprocessado?", "Which of these is an example of an ultra-processed food?", "¿Cuál de estos es un ejemplo de ultraprocesado?", "Lequel de ces produits est ultra-transformé ?"],
    options: [["Salgadinho de pacote", "Packaged chips", "Snack de paquete", "Chips en sachet"], ["Feijão cozido em casa", "Home-cooked beans", "Frijoles cocidos en casa", "Haricots cuits maison"], ["Banana", "Banana", "Plátano", "Banane"]],
    answer: 0,
    why: ["Ultraprocessados levam muitos aditivos e costumam ter excesso de sal, açúcar e gordura.", "Ultra-processed foods contain many additives and often too much salt, sugar and fat.", "Los ultraprocesados llevan muchos aditivos y suelen tener exceso de sal, azúcar y grasa.", "Les ultra-transformés contiennent beaucoup d'additifs, de sel, de sucre et de gras."],
  },
  {
    q: ["Quais nutrientes fornecem energia ao corpo?", "Which nutrients provide energy to the body?", "¿Qué nutrientes aportan energía al cuerpo?", "Quels nutriments fournissent de l'énergie au corps ?"],
    options: [["Só vitaminas", "Vitamins only", "Solo vitaminas", "Seulement les vitamines"], ["Carboidratos, proteínas e gorduras", "Carbohydrates, proteins and fats", "Carbohidratos, proteínas y grasas", "Glucides, protéines et lipides"], ["Água e sais minerais", "Water and minerals", "Agua y sales minerales", "Eau et sels minéraux"]],
    answer: 1,
    why: ["Esses são os macronutrientes. Vitaminas, minerais e água não fornecem calorias.", "Those are the macronutrients. Vitamins, minerals and water provide no calories.", "Son los macronutrientes. Las vitaminas, los minerales y el agua no aportan calorías.", "Ce sont les macronutriments. Vitamines, minéraux et eau n'apportent pas de calories."],
  },
];

const ROUND = 5;

function shuffled<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function QuizCard() {
  const tr = useTr();
  const [best, setBest] = useLocal<number>("quiz_best", 0);
  const [burst, fire] = useBurst();
  const [round, setRound] = useState<Question[]>(() => QUESTIONS.slice(0, ROUND));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const finished = index >= ROUND;

  // Sorteia a rodada só no navegador (evita diferença com o HTML do servidor).
  useEffect(() => setRound(shuffled(QUESTIONS).slice(0, ROUND)), []);

  const q = round[Math.min(index, ROUND - 1)];

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const right = i === q.answer;
    if (right) setScore((s) => s + 1);
    playSound(right ? "success" : "error");
  };

  const next = () => {
    const last = index + 1 >= ROUND;
    setIndex((n) => n + 1);
    setPicked(null);
    if (last) {
      const final = score;
      if (final > best) setBest(final);
      if (final >= 4) {
        fire();
        playSound("achievement");
      }
    }
  };

  const again = () => {
    setRound(shuffled(QUESTIONS).slice(0, ROUND));
    setIndex(0);
    setPicked(null);
    setScore(0);
  };

  return (
    <Panel
      title={tr(["Quiz relâmpago", "Quick quiz", "Quiz relámpago", "Quiz éclair"])}
      className="relative"
      action={
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
          <Trophy className="h-3 w-3" />
          {best}/{ROUND}
        </span>
      }
    >
      <Burst id={burst} />
      {finished ? (
        <div className="py-2 text-center">
          <p className="text-3xl font-black text-foreground">
            {score}/{ROUND}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {score >= 4
              ? tr(["Mandou bem! 🌟", "Great job! 🌟", "¡Muy bien! 🌟", "Bravo ! 🌟"])
              : score >= 2
                ? tr(["Quase lá! Tente de novo.", "Almost there! Try again.", "¡Casi! Inténtalo de nuevo.", "Presque ! Réessayez."])
                : tr(["Que tal rever a trilha de aprendizado?", "How about revisiting the learning trail?", "¿Y si repasas la ruta de aprendizaje?", "Et si vous revoyiez le parcours d'apprentissage ?"])}
          </p>
          <button type="button" className={`${primaryBtn} mt-3`} onClick={again}>
            <RotateCcw className="h-3.5 w-3.5" />
            {tr(["Jogar de novo", "Play again", "Jugar de nuevo", "Rejouer"])}
          </button>
        </div>
      ) : (
        <div>
          <Bar value={index + (picked !== null ? 1 : 0)} max={ROUND} />
          <p className="mt-3 text-sm font-semibold leading-snug text-foreground">{tr(q.q)}</p>
          <div className="mt-3 space-y-2">
            {q.options.map((opt, i) => {
              const isAnswer = i === q.answer;
              const state =
                picked === null
                  ? "border-border/70 bg-secondary/40 hover:bg-secondary"
                  : isAnswer
                    ? "border-emerald-500/50 bg-emerald-500/15 text-foreground"
                    : i === picked
                      ? "border-destructive/50 bg-destructive/10 text-foreground"
                      : "border-border/50 bg-secondary/20 opacity-60";
              return (
                <button
                  key={i}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => choose(i)}
                  className={`w-full cursor-pointer rounded-xl border px-3 py-2 text-left text-xs font-medium transition active:scale-[0.98] disabled:cursor-default ${state}`}
                >
                  {tr(opt)}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="nc-pop-in mt-3 rounded-xl bg-accent-soft/60 p-3 text-xs leading-relaxed text-foreground">
              {tr(q.why)}
              <div className="mt-2 text-right">
                <button type="button" className={primaryBtn} onClick={next}>
                  {index + 1 >= ROUND
                    ? tr(["Ver resultado", "See result", "Ver resultado", "Voir le résultat"])
                    : tr(["Próxima", "Next", "Siguiente", "Suivante"])}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}

// ───────────────────────────── Monte seu prato ─────────────────────────────

type Group = "veg" | "protein" | "carb";
interface Food {
  emoji: string;
  name: Names;
  group: Group;
}

const FOODS: Food[] = [
  { emoji: "🥗", name: ["Salada", "Salad", "Ensalada", "Salade"], group: "veg" },
  { emoji: "🥦", name: ["Brócolis", "Broccoli", "Brócoli", "Brocoli"], group: "veg" },
  { emoji: "🥕", name: ["Cenoura", "Carrot", "Zanahoria", "Carotte"], group: "veg" },
  { emoji: "🫘", name: ["Feijão", "Beans", "Frijoles", "Haricots"], group: "protein" },
  { emoji: "🥚", name: ["Ovo", "Egg", "Huevo", "Œuf"], group: "protein" },
  { emoji: "🐟", name: ["Peixe", "Fish", "Pescado", "Poisson"], group: "protein" },
  { emoji: "🍚", name: ["Arroz", "Rice", "Arroz", "Riz"], group: "carb" },
  { emoji: "🍠", name: ["Batata-doce", "Sweet potato", "Batata", "Patate douce"], group: "carb" },
  { emoji: "🌽", name: ["Milho", "Corn", "Maíz", "Maïs"], group: "carb" },
];

const MAX_ON_PLATE = 6;

/** Cor de cada grupo do prato (verduras, proteínas, energia). */
const GROUP_COLOR: Record<Group, string> = { veg: "#4f8a4b", protein: "#d9692a", carb: "#c58a12" };
/** Cor de cada humor, do mais animado ao mais difícil. */
const MOOD_COLORS = ["#4f8a4b", "#84a331", "#c58a12", "#d6456b"];

/** Monte o prato tocando nos alimentos: o card avalia o equilíbrio (metade legumes e verduras). */
export function PlateBuilderCard() {
  const tr = useTr();
  const [plate, setPlate] = useState<number[]>([]);
  const counts = useMemo(() => {
    const c: Record<Group, number> = { veg: 0, protein: 0, carb: 0 };
    plate.forEach((i) => (c[FOODS[i].group] += 1));
    return c;
  }, [plate]);

  const message = (() => {
    if (plate.length === 0)
      return tr(["Toque nos alimentos para montar o seu prato.", "Tap the foods to build your plate.", "Toca los alimentos para armar tu plato.", "Touchez les aliments pour composer votre assiette."]);
    if (counts.veg === 0)
      return tr(["Faltam legumes e verduras: eles devem ocupar cerca de metade do prato.", "Vegetables are missing: they should fill about half the plate.", "Faltan verduras: deben ocupar cerca de la mitad del plato.", "Il manque des légumes : ils devraient occuper environ la moitié de l'assiette."]);
    if (counts.protein === 0)
      return tr(["Falta uma fonte de proteína: feijão, ovo, peixe, carnes…", "A protein source is missing: beans, egg, fish, meat…", "Falta una fuente de proteína: frijoles, huevo, pescado, carne…", "Il manque une source de protéines : haricots, œuf, poisson, viande…"]);
    if (counts.carb === 0)
      return tr(["Falta uma fonte de energia: arroz, batata, mandioca, milho…", "An energy source is missing: rice, potato, cassava, corn…", "Falta una fuente de energía: arroz, papa, mandioca, maíz…", "Il manque une source d'énergie : riz, pomme de terre, manioc, maïs…"]);
    if (counts.veg * 2 >= plate.length)
      return tr(["Prato colorido e equilibrado! 🌈", "A colorful, balanced plate! 🌈", "¡Plato colorido y equilibrado! 🌈", "Une assiette colorée et équilibrée ! 🌈"]);
    return tr(["Quase! Tente deixar metade do prato com legumes e verduras.", "Almost! Try to make half the plate vegetables.", "¡Casi! Intenta que la mitad del plato sean verduras.", "Presque ! Essayez de remplir la moitié de l'assiette de légumes."]);
  })();

  const add = (i: number) => {
    if (plate.length >= MAX_ON_PLATE) return;
    setPlate((p) => [...p, i]);
    playSound("click");
  };

  return (
    <Panel
      title={tr(["Monte seu prato", "Build your plate", "Arma tu plato", "Composez votre assiette"])}
      action={
        plate.length > 0 ? (
          <button type="button" onClick={() => setPlate([])} className="cursor-pointer text-muted-foreground hover:text-foreground" aria-label={tr(["Limpar", "Clear", "Limpiar", "Vider"])}>
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        ) : undefined
      }
    >
      <div className="mx-auto grid h-32 w-32 grid-cols-3 content-center gap-1 rounded-full border-4 border-border bg-secondary/40 p-3 shadow-inner">
        {Array.from({ length: MAX_ON_PLATE }, (_, slot) => (
          <button
            key={slot}
            type="button"
            disabled={plate[slot] === undefined}
            onClick={() => setPlate((p) => p.filter((_, k) => k !== slot))}
            className="grid h-8 w-8 cursor-pointer place-items-center rounded-full text-xl transition hover:scale-110 disabled:cursor-default"
            aria-label={plate[slot] !== undefined ? tr(FOODS[plate[slot]].name) : undefined}
          >
            {plate[slot] !== undefined ? (
              <span className="nc-pop-in" style={{ color: GROUP_COLOR[FOODS[plate[slot]].group] }}>
                <EmojiIcon emoji={FOODS[plate[slot]].emoji} className="h-5 w-5" />
              </span>
            ) : null}
          </button>
        ))}
      </div>
      <p key={message} className="nc-pop-in mt-3 min-h-[2.5rem] text-center text-xs font-medium leading-snug text-foreground">
        {message}
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-1.5">
        {FOODS.map((f, i) => (
          <button
            key={i}
            type="button"
            onClick={() => add(i)}
            disabled={plate.length >= MAX_ON_PLATE}
            className={`${iconBtn} disabled:opacity-40`}
          >
            <span style={{ color: GROUP_COLOR[f.group] }}>
              <EmojiIcon emoji={f.emoji} className="h-4 w-4" />
            </span>
            {tr(f.name)}
          </button>
        ))}
      </div>
      <p className={note}>
        {tr(
          [
            "Inspirado no Guia Alimentar para a População Brasileira. Não substitui orientação profissional.",
            "Inspired by the Brazilian Dietary Guidelines. It does not replace professional advice.",
            "Inspirado en la Guía Alimentaria brasileña. No sustituye la orientación profesional.",
            "Inspiré du Guide alimentaire brésilien. Ne remplace pas un avis professionnel.",
          ],
        )}
      </p>
    </Panel>
  );
}

// ───────────────────────────── Roleta de receitas ─────────────────────────────

export function RecipeRouletteCard() {
  const tr = useTr();
  const feed = useFeed({ scope: "todos", type: "receita", limit: 40 });
  const recipes = feed.data ?? [];
  const [shown, setShown] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => void (timer.current && window.clearInterval(timer.current)), []);

  if (recipes.length === 0) return null;

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    let ticks = 0;
    timer.current = window.setInterval(() => {
      ticks += 1;
      setShown(Math.floor(Math.random() * recipes.length));
      playSound("click");
      if (ticks >= 12) {
        if (timer.current) window.clearInterval(timer.current);
        setSpinning(false);
        playSound("success");
      }
    }, 90);
  };

  const recipe = shown !== null ? recipes[shown] : null;
  return (
    <Panel title={tr(["Roleta de receitas", "Recipe roulette", "Ruleta de recetas", "Roulette de recettes"])}>
      <div className="grid min-h-[5rem] place-items-center rounded-2xl bg-secondary/40 p-3 text-center">
        {recipe ? (
          <div className={spinning ? "opacity-60" : "nc-pop-in"}>
            <p className="text-sm font-bold text-foreground">{recipe.title || "—"}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{recipe.authorName}</p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {tr(["Sem ideia do que cozinhar? Gire a roleta!", "No idea what to cook? Spin the roulette!", "¿Sin idea de qué cocinar? ¡Gira la ruleta!", "Pas d'idée de quoi cuisiner ? Tournez la roulette !"])}
          </p>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <button type="button" className={primaryBtn} onClick={spin} disabled={spinning}>
          <Dices className={`h-3.5 w-3.5 ${spinning ? "animate-spin" : ""}`} />
          {tr(["Girar", "Spin", "Girar", "Tourner"])}
        </button>
        {recipe && !spinning && (
          <Link to="/explorar" search={{ post: recipe.id }} className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
            <ChefHat className="h-3.5 w-3.5" />
            {tr(["Ver receita", "See recipe", "Ver receta", "Voir la recette"])}
          </Link>
        )}
      </div>
    </Panel>
  );
}

// ───────────────────────────── Timer de cozinha ─────────────────────────────

const PRESETS = [3, 5, 10, 15, 30];
const fmt = (s: number) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

export function CookingTimerCard() {
  const tr = useTr();
  const [minutes, setMinutes] = useState(10);
  const [left, setLeft] = useState(10 * 60);
  const [running, setRunning] = useState(false);
  const [burst, fire] = useBurst();
  const endsAt = useRef(0);

  useEffect(() => {
    if (!running) return;
    const tick = () => {
      const remaining = Math.max(0, Math.round((endsAt.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        setRunning(false);
        fire();
        playSound("achievement");
      }
    };
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [running, fire]);

  const total = minutes * 60;
  const choose = (m: number) => {
    setRunning(false);
    setMinutes(m);
    setLeft(m * 60);
  };
  const toggle = () => {
    if (running) return setRunning(false);
    const from = left === 0 ? total : left;
    setLeft(from);
    endsAt.current = Date.now() + from * 1000;
    setRunning(true);
  };

  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const progress = total > 0 ? left / total : 0;

  return (
    <Panel title={tr(["Timer de cozinha", "Kitchen timer", "Temporizador de cocina", "Minuteur de cuisine"])} className="relative">
      <Burst id={burst} />
      <div className="relative mx-auto h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="7" className="stroke-secondary" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            className="stroke-accent transition-[stroke-dashoffset] duration-300"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - progress)}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className={`text-xl font-black tabular-nums ${left === 0 ? "text-accent" : "text-foreground"}`}>{fmt(left)}</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {PRESETS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => choose(m)}
            className={`${iconBtn} ${m === minutes ? "!bg-accent !text-accent-foreground" : ""}`}
          >
            {m} min
          </button>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-2">
        <button type="button" className={primaryBtn} onClick={toggle}>
          {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {running ? tr(["Pausar", "Pause", "Pausar", "Pause"]) : tr(["Iniciar", "Start", "Iniciar", "Démarrer"])}
        </button>
        <button type="button" className={iconBtn} onClick={() => choose(minutes)}>
          <RotateCcw className="h-3 w-3" />
          {tr(["Zerar", "Reset", "Reiniciar", "Réinit."])}
        </button>
      </div>
      {left === 0 && !running && (
        <p className="nc-pop-in mt-2 text-center text-xs font-bold text-accent">
          {tr(["Tempo! Pode tirar do fogo 🍳", "Time's up! 🍳", "¡Tiempo! 🍳", "Temps écoulé ! 🍳"])}
        </p>
      )}
    </Panel>
  );
}

// ───────────────────────────── Medidas da cozinha ─────────────────────────────

interface Ingredient {
  name: Names;
  /** Gramas de 1 xícara de chá (240 ml). `null` = líquido medido em ml. */
  gramsPerCup: number | null;
}

const INGREDIENTS: Ingredient[] = [
  { name: ["Água / leite", "Water / milk", "Agua / leche", "Eau / lait"], gramsPerCup: null },
  { name: ["Farinha de trigo", "Wheat flour", "Harina de trigo", "Farine de blé"], gramsPerCup: 120 },
  { name: ["Açúcar refinado", "Granulated sugar", "Azúcar refinada", "Sucre en poudre"], gramsPerCup: 180 },
  { name: ["Arroz cru", "Raw rice", "Arroz crudo", "Riz cru"], gramsPerCup: 185 },
  { name: ["Aveia em flocos", "Rolled oats", "Avena en hojuelas", "Flocons d'avoine"], gramsPerCup: 90 },
  { name: ["Óleo", "Oil", "Aceite", "Huile"], gramsPerCup: 220 },
];

// Fração de 1 xícara de chá (240 ml).
const UNITS: { name: Names; cup: number }[] = [
  { name: ["xícara", "cup", "taza", "tasse"], cup: 1 },
  { name: ["colher de sopa", "tablespoon", "cucharada", "cuillère à soupe"], cup: 15 / 240 },
  { name: ["colher de chá", "teaspoon", "cucharadita", "cuillère à café"], cup: 5 / 240 },
];

export function UnitConverterCard() {
  const tr = useTr();
  const [amount, setAmount] = useState("1");
  const [unit, setUnit] = useState(0);
  const [ing, setIng] = useState(1);

  const qty = Number(amount.replace(",", "."));
  const cups = Number.isFinite(qty) ? qty * UNITS[unit].cup : 0;
  const item = INGREDIENTS[ing];
  const result = item.gramsPerCup === null ? Math.round(cups * 240) : Math.round(cups * item.gramsPerCup);

  const field =
    "w-full rounded-xl border border-input bg-background px-2.5 py-2 text-xs text-foreground outline-none focus:border-accent";
  return (
    <Panel title={tr(["Medidas da cozinha", "Kitchen measures", "Medidas de cocina", "Mesures de cuisine"])}>
      <div className="grid grid-cols-[4.5rem_1fr] gap-2">
        <input
          type="number"
          min="0"
          step="0.25"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={field}
          aria-label={tr(["Quantidade", "Amount", "Cantidad", "Quantité"])}
        />
        <select value={unit} onChange={(e) => setUnit(Number(e.target.value))} className={field}>
          {UNITS.map((u, i) => (
            <option key={i} value={i}>
              {tr(u.name)}
            </option>
          ))}
        </select>
      </div>
      <select value={ing} onChange={(e) => setIng(Number(e.target.value))} className={`${field} mt-2`}>
        {INGREDIENTS.map((x, i) => (
          <option key={i} value={i}>
            {tr(x.name)}
          </option>
        ))}
      </select>
      <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-accent-soft/60 py-3 text-foreground">
        <Scale className="h-4 w-4 text-accent" />
        <span className="text-lg font-black tabular-nums">≈ {result}</span>
        <span className="text-xs font-semibold">{item.gramsPerCup === null ? "ml" : "g"}</span>
      </div>
      <p className={note}>
        {tr(
          [
            "Valores aproximados: xícara de chá de 240 ml. Varia com a marca e com o jeito de medir.",
            "Approximate values: 240 ml cup. They vary with brand and how you measure.",
            "Valores aproximados: taza de 240 ml. Varían con la marca y la forma de medir.",
            "Valeurs approximatives : tasse de 240 ml. Elles varient selon la marque et la mesure.",
          ],
        )}
      </p>
    </Panel>
  );
}

// ───────────────────────────── Lista de compras ─────────────────────────────

interface ShopItem {
  id: string;
  text: string;
  done: boolean;
}

export function ShoppingListCard() {
  const tr = useTr();
  const [items, setItems] = useLocal<ShopItem[]>("shopping", []);
  const [draft, setDraft] = useState("");

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim().slice(0, 60);
    if (!text) return;
    setItems((list) => [{ id: crypto.randomUUID(), text, done: false }, ...list].slice(0, 40));
    setDraft("");
    playSound("click");
  };
  const done = items.filter((i) => i.done).length;

  return (
    <Panel
      title={tr(["Lista de compras", "Shopping list", "Lista de compras", "Liste de courses"])}
      action={
        done > 0 ? (
          <button type="button" className="cursor-pointer text-[11px] font-semibold text-primary hover:underline" onClick={() => setItems((l) => l.filter((i) => !i.done))}>
            {tr(["Limpar marcados", "Clear checked", "Quitar marcados", "Retirer cochés"])}
          </button>
        ) : undefined
      }
    >
      <form onSubmit={add} className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={60}
          placeholder={tr(["Ex.: tomate, aveia…", "E.g. tomato, oats…", "Ej.: tomate, avena…", "Ex. : tomate, avoine…"])}
          className="min-w-0 flex-1 rounded-xl border border-input bg-background px-2.5 py-2 text-xs outline-none focus:border-accent"
        />
        <button type="submit" className={primaryBtn} aria-label={tr(["Adicionar", "Add", "Añadir", "Ajouter"])}>
          <Plus className="h-3.5 w-3.5" />
        </button>
      </form>
      {items.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <ShoppingBasket className="h-4 w-4" />
          {tr(["Anote o que falta para as suas receitas.", "Jot down what your recipes need.", "Anota lo que falta para tus recetas.", "Notez ce qu'il manque pour vos recettes."])}
        </p>
      ) : (
        <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto">
          {items.map((it) => (
            <li key={it.id} className="group flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-secondary/60">
              <button
                type="button"
                onClick={() => setItems((l) => l.map((x) => (x.id === it.id ? { ...x, done: !x.done } : x)))}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
                aria-pressed={it.done}
              >
                <CheckCircle2 className={`h-4 w-4 shrink-0 ${it.done ? "text-accent" : "text-muted-foreground/50"}`} />
                <span className={`truncate text-xs ${it.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{it.text}</span>
              </button>
              <button type="button" onClick={() => setItems((l) => l.filter((x) => x.id !== it.id))} className="cursor-pointer text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100 focus:opacity-100" aria-label={tr(["Remover", "Remove", "Quitar", "Retirer"])}>
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

// ───────────────────────────── Hábitos do dia ─────────────────────────────

const HABITS: { id: string; emoji: string; name: Names }[] = [
  { id: "water", emoji: "💧", name: ["Bebi água", "Drank water", "Bebí agua", "J'ai bu de l'eau"] },
  { id: "veg", emoji: "🥦", name: ["Comi legumes ou verduras", "Ate vegetables", "Comí verduras", "J'ai mangé des légumes"] },
  { id: "move", emoji: "🚶", name: ["Me movimentei", "I got moving", "Me moví", "J'ai bougé"] },
  { id: "sleep", emoji: "😴", name: ["Dormi bem", "Slept well", "Dormí bien", "J'ai bien dormi"] },
];

/** Dias em sequência com pelo menos 3 hábitos marcados (hoje conta se já tiver 3, senão começa de ontem). */
function habitStreak(log: Record<string, string[]>) {
  let streak = 0;
  const d = new Date();
  if ((log[dayKey(d)]?.length ?? 0) < 3) d.setDate(d.getDate() - 1);
  while ((log[dayKey(d)]?.length ?? 0) >= 3) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function HabitCheckinCard() {
  const tr = useTr();
  const [log, setLog] = useLocal<Record<string, string[]>>("habits", {});
  const [burst, fire] = useBurst();
  const today = dayKey();
  const marked = log[today] ?? [];
  const streak = habitStreak(log);

  const toggle = (id: string) => {
    const has = marked.includes(id);
    const nextList = has ? marked.filter((x) => x !== id) : [...marked, id];
    // Guarda só os últimos 60 dias.
    const keep = Object.fromEntries(Object.entries({ ...log, [today]: nextList }).sort().slice(-60));
    setLog(keep);
    if (!has && nextList.length === HABITS.length) {
      fire();
      playSound("achievement");
    } else {
      playSound(has ? "click" : "success");
    }
  };

  return (
    <Panel
      title={tr(["Hábitos de hoje", "Today's habits", "Hábitos de hoy", "Habitudes du jour"])}
      className="relative"
      action={
        <span className={`inline-flex items-center gap-1 text-xs font-bold ${streak > 0 ? "text-accent" : "text-muted-foreground"}`}>
          <Flame className="h-3.5 w-3.5" />
          {streak}
        </span>
      }
    >
      <Burst id={burst} />
      <ul className="space-y-1.5">
        {HABITS.map((h) => {
          const on = marked.includes(h.id);
          return (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => toggle(h.id)}
                aria-pressed={on}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-left text-xs font-medium transition active:scale-[0.98] ${
                  on ? "border-accent/40 bg-accent/10 text-foreground" : "border-border/70 bg-secondary/40 text-muted-foreground hover:bg-secondary"
                }`}
              >
                <span className="text-accent">
                  <EmojiIcon emoji={h.emoji} className="h-5 w-5" />
                </span>
                <span className="flex-1">{tr(h.name)}</span>
                <CheckCircle2 className={`h-4 w-4 ${on ? "text-accent" : "text-muted-foreground/40"}`} />
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-3">
        <Bar value={marked.length} max={HABITS.length} />
      </div>
      <p className={note}>
        {tr(
          [
            "Marque 3 ou mais por dia para manter a sequência 🔥",
            "Check 3 or more a day to keep your streak 🔥",
            "Marca 3 o más al día para mantener la racha 🔥",
            "Cochez 3 ou plus par jour pour garder votre série 🔥",
          ],
        )}
      </p>
    </Panel>
  );
}

// ───────────────────────────── Compromisso da semana ─────────────────────────────

/** Segunda-feira da semana de `d`, no formato AAAA-MM-DD. */
function weekStart(d = new Date()) {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return dayKey(x);
}

export function WeeklyPledgeCard() {
  const tr = useTr();
  const { locale } = useI18n();
  const theme = useActiveTheme();
  const [log, setLog] = useLocal<Record<string, number[]>>("pledge", {});
  const [burst, fire] = useBurst();
  const week = weekStart();
  const days = log[week] ?? [];
  const todayIndex = (new Date().getDay() + 6) % 7;
  const labels = useMemo(() => {
    const monday = new Date(week + "T12:00:00");
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d).replace(".", "");
    });
  }, [week, locale]);

  const title = theme.data ? themeText(theme.data, locale).title : null;

  const toggle = (i: number) => {
    if (i > todayIndex) return;
    const has = days.includes(i);
    const next = has ? days.filter((x) => x !== i) : [...days, i];
    setLog({ [week]: next });
    if (!has && next.length === 7) {
      fire();
      playSound("achievement");
    } else {
      playSound(has ? "click" : "success");
    }
  };

  return (
    <Panel title={tr(["Compromisso da semana", "Weekly pledge", "Compromiso de la semana", "Engagement de la semaine"])} className="relative">
      <Burst id={burst} />
      {title && <p className="mb-3 text-sm font-semibold leading-snug text-foreground">{title}</p>}
      <p className="mb-2 text-[11px] text-muted-foreground">
        {tr(["Toque nos dias em que você praticou:", "Tap the days you practiced:", "Toca los días que practicaste:", "Touchez les jours où vous avez pratiqué :"])}
      </p>
      <div className="grid grid-cols-7 gap-1.5">
        {labels.map((label, i) => {
          const on = days.includes(i);
          const future = i > todayIndex;
          return (
            <button
              key={i}
              type="button"
              disabled={future}
              onClick={() => toggle(i)}
              aria-pressed={on}
              className={`grid h-12 cursor-pointer place-items-center rounded-xl border text-[10px] font-bold uppercase transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 ${
                on
                  ? "border-accent bg-accent text-accent-foreground"
                  : i === todayIndex
                    ? "border-accent/50 bg-accent/10 text-foreground"
                    : "border-border/70 bg-secondary/40 text-muted-foreground hover:bg-secondary"
              }`}
            >
              <span>{on ? "✓" : label.slice(0, 3)}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1">
          <Bar value={days.length} max={7} />
        </div>
        <span className="text-xs font-bold text-foreground">{days.length}/7</span>
      </div>
      <Link to="/tema-da-semana" className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline">
        <Target className="h-3 w-3" />
        {tr(["Ver o tema", "See the theme", "Ver el tema", "Voir le thème"])}
      </Link>
    </Panel>
  );
}

// ───────────────────────────── Comunidades ─────────────────────────────

export function CommunityRouletteCard() {
  const tr = useTr();
  const { user } = useAuth();
  const { communities } = useCommunity();
  const pool = useMemo(() => {
    const notMine = user ? communities.filter((c) => !c.members.some((m) => m.userId === user.id)) : communities;
    return notMine.length > 0 ? notMine : communities;
  }, [communities, user]);
  const [shown, setShown] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => () => void (timer.current && window.clearInterval(timer.current)), []);

  if (pool.length === 0) return null;

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    let ticks = 0;
    timer.current = window.setInterval(() => {
      ticks += 1;
      setShown(Math.floor(Math.random() * pool.length));
      playSound("click");
      if (ticks >= 10) {
        if (timer.current) window.clearInterval(timer.current);
        setSpinning(false);
        playSound("success");
      }
    }, 100);
  };

  const c = shown !== null ? pool[shown] : null;
  return (
    <Panel title={tr(["Sorteie uma comunidade", "Pick a community", "Sortea una comunidad", "Tirez une communauté"])}>
      <div className="grid min-h-[5rem] place-items-center rounded-2xl bg-secondary/40 p-3 text-center">
        {c ? (
          <div className={spinning ? "opacity-60" : "nc-pop-in"}>
            <p className="text-sm font-bold text-foreground">{c.name}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {td(c.category)} · {c.members.length} {tr(["membros", "members", "miembros", "membres"])}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {tr(["Quer conhecer gente nova? Sorteie uma comunidade!", "Want to meet new people? Pick a community!", "¿Quieres conocer gente nueva? ¡Sortea una comunidad!", "Envie de rencontrer du monde ? Tirez une communauté !"])}
          </p>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <button type="button" className={primaryBtn} onClick={spin} disabled={spinning}>
          <Dices className={`h-3.5 w-3.5 ${spinning ? "animate-spin" : ""}`} />
          {tr(["Sortear", "Pick", "Sortear", "Tirer"])}
        </button>
        {c && !spinning && (
          <Link to="/comunidades/$slug" params={{ slug: c.slug }} className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
            <MessageCircle className="h-3.5 w-3.5" />
            {tr(["Conhecer", "Visit", "Conocer", "Découvrir"])}
          </Link>
        )}
      </div>
    </Panel>
  );
}

const STARTERS: Names[] = [
  ["Qual receita da sua infância você nunca esqueceu?", "Which childhood recipe do you never forget?", "¿Qué receta de tu infancia nunca olvidas?", "Quelle recette de votre enfance n'oubliez-vous jamais ?"],
  ["Qual hábito simples mais melhorou a sua rotina alimentar?", "Which simple habit improved your eating routine the most?", "¿Qué hábito sencillo mejoró más tu rutina alimentaria?", "Quelle habitude simple a le plus amélioré votre alimentation ?"],
  ["Qual é o seu lanche saudável favorito para levar na bolsa?", "What's your favorite healthy snack to carry around?", "¿Cuál es tu merienda saludable favorita para llevar?", "Quel est votre en-cas sain préféré à emporter ?"],
  ["Qual ingrediente você descobriu há pouco tempo e amou?", "Which ingredient did you recently discover and love?", "¿Qué ingrediente descubriste hace poco y amaste?", "Quel ingrédient avez-vous découvert récemment et adoré ?"],
  ["Como você organiza as compras da semana?", "How do you organize your weekly shopping?", "¿Cómo organizas las compras de la semana?", "Comment organisez-vous vos courses de la semaine ?"],
  ["Que prato típico da sua região todo mundo deveria provar?", "Which dish from your region should everyone try?", "¿Qué plato típico de tu región todos deberían probar?", "Quel plat de votre région tout le monde devrait-il goûter ?"],
];

export function IcebreakerCard() {
  const tr = useTr();
  const [i, setI] = useState(() => dayNumber() % STARTERS.length);
  const [copied, setCopied] = useState(false);
  const text = tr(STARTERS[i % STARTERS.length]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* sem permissão para copiar */
    }
  };

  return (
    <Panel title={tr(["Puxe assunto", "Start a chat", "Inicia una charla", "Lancez la conversation"])}>
      <p key={i} className="nc-pop-in rounded-2xl bg-secondary/40 p-3 text-sm font-medium leading-relaxed text-foreground">
        “{text}”
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={iconBtn} onClick={() => setI((n) => n + 1)}>
          <Shuffle className="h-3 w-3" />
          {tr(["Outra", "Another", "Otra", "Autre"])}
        </button>
        <button type="button" className={iconBtn} onClick={copy}>
          <Copy className="h-3 w-3" />
          {copied ? tr(["Copiado!", "Copied!", "¡Copiado!", "Copié !"]) : tr(["Copiar", "Copy", "Copiar", "Copier"])}
        </button>
      </div>
    </Panel>
  );
}

// ───────────────────────────── Explorar e profissionais ─────────────────────────────

const TOPICS: Names[] = [
  ["receitas", "recipes", "recetas", "recettes"],
  ["café da manhã", "breakfast", "desayuno", "petit-déjeuner"],
  ["lanche saudável", "healthy snack", "merienda saludable", "en-cas sain"],
  ["proteína", "protein", "proteína", "protéines"],
  ["vegetariano", "vegetarian", "vegetariano", "végétarien"],
  ["sem glúten", "gluten free", "sin gluten", "sans gluten"],
  ["fibras", "fiber", "fibra", "fibres"],
  ["hidratação", "hydration", "hidratación", "hydratation"],
];

/** Atalhos de busca: preenchem o campo da página Explorar. */
export function ExploreTopicsCard() {
  const tr = useTr();
  return (
    <Panel title={tr(["Temas para explorar", "Topics to explore", "Temas para explorar", "Thèmes à explorer"])}>
      <div className="flex flex-wrap gap-1.5">
        {TOPICS.map((topic, i) => (
          <button
            key={i}
            type="button"
            className={iconBtn}
            onClick={() => {
              window.dispatchEvent(new CustomEvent("explore:query", { detail: tr(topic) }));
              playSound("click");
            }}
          >
            <Search className="h-3 w-3" />
            {tr(topic)}
          </button>
        ))}
      </div>
    </Panel>
  );
}

const PRO_GOALS: { label: Names; query: string }[] = [
  { label: ["Alimentação no dia a dia", "Everyday eating", "Alimentación diaria", "Alimentation au quotidien"], query: "nutri" },
  { label: ["Esporte e performance", "Sports and performance", "Deporte y rendimiento", "Sport et performance"], query: "esport" },
  { label: ["Gestação e infância", "Pregnancy and childhood", "Embarazo e infancia", "Grossesse et enfance"], query: "materno" },
  { label: ["Relação com a comida", "Relationship with food", "Relación con la comida", "Rapport à la nourriture"], query: "comportamental" },
];

/** Escolha um objetivo e a lista de profissionais filtra sozinha. */
export function ProMatchCard() {
  const tr = useTr();
  const [goal, setGoal] = useState<number | null>(null);
  return (
    <Panel title={tr(["Qual profissional combina com você?", "Which professional fits you?", "¿Qué profesional te conviene?", "Quel professionnel vous convient ?"])}>
      <div className="space-y-1.5">
        {PRO_GOALS.map((g, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={goal === i}
            onClick={() => {
              setGoal(i);
              window.dispatchEvent(new CustomEvent("pros:query", { detail: g.query }));
              playSound("click");
            }}
            className={`flex w-full cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition active:scale-[0.98] ${
              goal === i ? "border-accent/50 bg-accent/10 text-foreground" : "border-border/70 bg-secondary/40 text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Utensils className="h-3.5 w-3.5 shrink-0" />
            {tr(g.label)}
          </button>
        ))}
      </div>
      {goal !== null && (
        <button
          type="button"
          className="mt-2 cursor-pointer text-[11px] font-semibold text-primary hover:underline"
          onClick={() => {
            setGoal(null);
            window.dispatchEvent(new CustomEvent("pros:query", { detail: "" }));
          }}
        >
          {tr(["Limpar filtro", "Clear filter", "Quitar filtro", "Effacer le filtre"])}
        </button>
      )}
    </Panel>
  );
}

// ───────────────────────────── Bem-estar ─────────────────────────────

const MOODS: { emoji: string; label: Names; reply: Names }[] = [
  { emoji: "😄", label: ["Ótima", "Great", "Genial", "Super"], reply: ["Que bom! Anote o que fez bem hoje para repetir depois.", "Wonderful! Note what felt good today to repeat it.", "¡Qué bien! Anota lo que te hizo bien hoy para repetirlo.", "Super ! Notez ce qui vous a fait du bien pour le refaire."] },
  { emoji: "🙂", label: ["Boa", "Good", "Buena", "Bien"], reply: ["Ótimo ritmo. Um copo de água e uma pausa para comer com calma ajudam a manter.", "Nice pace. A glass of water and a calm meal help keep it going.", "Buen ritmo. Un vaso de agua y una comida tranquila ayudan a mantenerlo.", "Beau rythme. Un verre d'eau et un repas au calme aident à le garder."] },
  { emoji: "😐", label: ["Normal", "Okay", "Normal", "Moyenne"], reply: ["Dias assim acontecem. Escolha uma coisa pequena e gentil para o seu prato hoje.", "Days like this happen. Pick one small, kind thing for your plate today.", "Estos días pasan. Elige algo pequeño y amable para tu plato hoy.", "Ça arrive. Choisissez une petite chose bienveillante pour votre assiette."] },
  { emoji: "😔", label: ["Pesada", "Heavy", "Pesada", "Difficile"], reply: ["Sinto muito. Se a comida estiver pesando, conversar com um(a) profissional pode ajudar.", "I'm sorry. If food is weighing on you, talking to a professional can help.", "Lo siento. Si la comida te pesa, hablar con un(a) profesional puede ayudar.", "Désolé. Si la nourriture vous pèse, parler à un(e) professionnel(le) peut aider."] },
];

export function MoodCard() {
  const tr = useTr();
  const [log, setLog] = useLocal<Record<string, number>>("mood", {});
  const today = dayKey();
  const picked = log[today] ?? null;
  return (
    <Panel title={tr(["Como está a sua relação com a comida hoje?", "How is your relationship with food today?", "¿Cómo está tu relación con la comida hoy?", "Comment va votre rapport à la nourriture aujourd'hui ?"])}>
      <div className="grid grid-cols-4 gap-1.5">
        {MOODS.map((m, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={picked === i}
            onClick={() => {
              setLog({ [today]: i });
              playSound("click");
            }}
            className={`grid cursor-pointer place-items-center gap-0.5 rounded-xl border py-2 transition active:scale-90 ${
              picked === i ? "border-accent bg-accent/10" : "border-border/70 bg-secondary/40 hover:bg-secondary"
            }`}
          >
            <span style={{ color: MOOD_COLORS[i] }}>
              <EmojiIcon emoji={m.emoji} className="h-7 w-7" />
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground">{tr(m.label)}</span>
          </button>
        ))}
      </div>
      {picked !== null && (
        <div key={picked} className="nc-pop-in mt-3 rounded-xl bg-accent-soft/60 p-3 text-xs leading-relaxed text-foreground">
          {tr(MOODS[picked].reply)}
          {picked === 3 && (
            <Link to="/profissionais" className="mt-2 block text-[11px] font-bold text-primary hover:underline">
              {tr(["Encontrar um(a) profissional →", "Find a professional →", "Encontrar un(a) profesional →", "Trouver un(e) professionnel(le) →"])}
            </Link>
          )}
        </div>
      )}
      <p className={note}>
        {tr(
          [
            "Registro só seu, guardado neste aparelho.",
            "A private log, saved on this device only.",
            "Registro solo tuyo, guardado en este dispositivo.",
            "Un journal privé, enregistré sur cet appareil uniquement.",
          ],
        )}
      </p>
    </Panel>
  );
}

const MEAL_TIPS: Names[] = [
  ["Mastigue devagar e sinta os sabores.", "Chew slowly and taste the flavors.", "Mastica despacio y siente los sabores.", "Mâchez lentement et savourez."],
  ["Pouse os talheres entre uma garfada e outra.", "Put your cutlery down between bites.", "Apoya los cubiertos entre bocado y bocado.", "Posez vos couverts entre deux bouchées."],
  ["Respire fundo e observe a cor e o cheiro do prato.", "Breathe deeply and notice the color and smell of your plate.", "Respira hondo y observa el color y el olor del plato.", "Respirez profondément et observez la couleur et l'odeur de l'assiette."],
  ["Perceba a saciedade: você ainda sente fome?", "Notice fullness: are you still hungry?", "Percibe la saciedad: ¿todavía tienes hambre?", "Écoutez votre satiété : avez-vous encore faim ?"],
];

/** Refeição com calma: respiração guiada e um relógio de 20 minutos. */
export function MindfulMealCard() {
  const tr = useTr();
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [burst, fire] = useBurst();
  const GOAL = 20 * 60;

  useEffect(() => {
    if (!running) return;
    const started = Date.now() - seconds * 1000;
    const id = window.setInterval(() => {
      const s = Math.floor((Date.now() - started) / 1000);
      setSeconds(s);
      if (s >= GOAL) {
        setRunning(false);
        fire();
        playSound("achievement");
      }
    }, 500);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const tip = MEAL_TIPS[Math.floor(seconds / 30) % MEAL_TIPS.length];
  return (
    <Panel title={tr(["Refeição com calma", "Mindful meal", "Comida con calma", "Repas en pleine conscience"])} className="relative">
      <Burst id={burst} />
      <div className="grid place-items-center py-2">
        <div className={`grid h-20 w-20 place-items-center rounded-full bg-accent/15 text-accent ${running ? "nc-breathe" : ""}`}>
          <Wind className="h-7 w-7" />
        </div>
      </div>
      <p className="text-center text-2xl font-black tabular-nums text-foreground">{fmt(seconds)}</p>
      <p key={running ? tip[0] : "idle"} className="nc-pop-in mt-1 min-h-[2.25rem] text-center text-xs text-muted-foreground">
        {running
          ? tr(tip)
          : tr(["Comer com calma leva cerca de 20 minutos. Vamos tentar?", "A calm meal takes about 20 minutes. Shall we try?", "Una comida con calma dura unos 20 minutos. ¿Probamos?", "Un repas calme dure environ 20 minutes. On essaie ?"])}
      </p>
      <div className="mt-2 flex justify-center gap-2">
        <button type="button" className={primaryBtn} onClick={() => setRunning((r) => !r)}>
          {running ? <Pause className="h-3.5 w-3.5" /> : <Timer className="h-3.5 w-3.5" />}
          {running ? tr(["Pausar", "Pause", "Pausar", "Pause"]) : tr(["Começar", "Start", "Empezar", "Commencer"])}
        </button>
        {seconds > 0 && (
          <button
            type="button"
            className={iconBtn}
            onClick={() => {
              setRunning(false);
              setSeconds(0);
            }}
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        )}
      </div>
    </Panel>
  );
}


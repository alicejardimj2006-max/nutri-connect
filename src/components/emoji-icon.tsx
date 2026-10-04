// O site não usa emojis: onde um dado ou texto traz um emoji, mostramos um ícone elegante no lugar.
// `EmojiIcon` converte um emoji no ícone equivalente (herda a cor do texto); `stripEmoji` limpa textos.
import {
  Activity,
  Angry,
  Annoyed,
  Apple,
  Award,
  Backpack,
  Banana,
  BarChart3,
  Bean,
  Bed,
  Beef,
  Bike,
  Bird,
  Book,
  BookOpen,
  Brain,
  Brush,
  Bubbles,
  Bug,
  Cake,
  CakeSlice,
  Camera,
  Candy,
  Carrot,
  Cherry,
  CircleAlert,
  CircleHelp,
  CheckCircle2,
  Citrus,
  ClipboardList,
  Clover,
  Cloud,
  Coffee,
  Coins,
  Compass,
  CookingPot,
  Cookie,
  Croissant,
  Crown,
  Dna,
  Droplet,
  Droplets,
  Dumbbell,
  Ear,
  Egg,
  EggFried,
  Fish,
  FlaskConical,
  Flame,
  Flower,
  Flower2,
  Footprints,
  Frown,
  Gem,
  Grape,
  Hand,
  HandHeart,
  Handshake,
  Heart,
  HeartPulse,
  Laptop,
  LeafyGreen,
  Leaf,
  Laugh,
  Lightbulb,
  Link as LinkIcon,
  Lock,
  Mail,
  Map as MapIcon,
  MapPin,
  Medal,
  Megaphone,
  Meh,
  MessageCircle,
  Milk,
  Moon,
  Music,
  Nut,
  Package,
  Palette,
  PartyPopper,
  PersonStanding,
  Phone,
  Pill,
  Pizza,
  Rabbit,
  Rainbow,
  Rocket,
  Ruler,
  Salad,
  Sandwich,
  Scale,
  Search,
  Shield,
  ShoppingBasket,
  ShoppingCart,
  Smartphone,
  Smile,
  Soup,
  Sparkles,
  Sprout,
  Star,
  Stethoscope,
  Sun,
  Tag,
  Target,
  ThumbsDown,
  ThumbsUp,
  TreeDeciduous,
  TreePine,
  Trophy,
  Type,
  UserRound,
  Users,
  Utensils,
  UtensilsCrossed,
  Vegan,
  Waves,
  Wheat,
  Wind,
  Zap,
  Calendar,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
export { splitLeadingEmoji, stripEmoji } from "@/lib/emoji";

const GROUPS: [string, LucideIcon][] = [
  // Frutas e legumes
  ["🍎🍐🥭🥝🍏", Apple],
  ["🍊🍋🍍", Citrus],
  ["🍌", Banana],
  ["🍇🫐", Grape],
  ["🍓🍉🍑🍒🍅", Cherry],
  ["🥑🧄🧅🥔🍆", Vegan],
  ["🥦🥬🥒", LeafyGreen],
  ["🥕🍠", Carrot],
  ["🌽🍚🌾", Wheat],
  ["🥥🌰", Nut],
  ["🫘", Bean],
  ["🌶", Flame],
  // Pratos e bebidas
  ["🥗", Salad],
  ["🍲🍜🍛🥣", Soup],
  ["🥘", CookingPot],
  ["🍝🍽", UtensilsCrossed],
  ["🥚", Egg],
  ["🍳", EggFried],
  ["🐟🍣🍤", Fish],
  ["🍗", Beef],
  ["🥩", Beef],
  ["🍞🥐🥖", Croissant],
  ["🧀🥛", Milk],
  ["🍕", Pizza],
  ["🍔🥪🌮", Sandwich],
  ["🍰🧁", CakeSlice],
  ["🎂", Cake],
  ["🍫🍪", Cookie],
  ["🍬", Candy],
  ["🍯💧", Droplet],
  ["☕🍵", Coffee],
  // Natureza
  ["🌱", Sprout],
  ["🌿🍃🍀", Leaf],
  ["🌳", TreeDeciduous],
  ["🌲", TreePine],
  ["🌻🌺", Flower],
  ["🌸🌼🌷", Flower2],
  ["☀🌞", Sun],
  ["🌙", Moon],
  ["☁", Cloud],
  ["🌈", Rainbow],
  ["♨🏊", Waves],
  ["🦋🕊🦉", Bird],
  ["🐝🐞", Bug],
  ["🦘", Rabbit],
  ["🍀", Clover],
  // Símbolos
  ["✨", Sparkles],
  ["⭐🌟🤩", Star],
  ["🔥", Flame],
  ["💦", Droplets],
  ["🎉🎊", PartyPopper],
  ["🏆", Trophy],
  ["🏅🥇🥈🥉", Medal],
  ["👑", Crown],
  ["🎯", Target],
  ["💎", Gem],
  ["⚡", Zap],
  ["✅", CheckCircle2],
  ["❤💚💛🧡💙💜🤍😍🥰", Heart],
  ["❗", CircleAlert],
  ["❓🤔", CircleHelp],
  ["💯", Award],
  ["🔒", Lock],
  ["🔗", LinkIcon],
  ["📧", Mail],
  ["📞", Phone],
  ["📍", MapPin],
  // Pessoas e gestos
  ["🤝", Handshake],
  ["💬💭", MessageCircle],
  ["👥👯", Users],
  ["👣🚶", Footprints],
  ["🏃", Activity],
  ["🧘", PersonStanding],
  ["🚴", Bike],
  ["💪", Dumbbell],
  ["👍", ThumbsUp],
  ["👎", ThumbsDown],
  ["👏🙏🙌🫶🤗", HandHeart],
  ["👆👋", Hand],
  ["👂", Ear],
  ["😴", Bed],
  ["👩", UserRound],
  // Rostos
  ["😄😆", Laugh],
  ["😊🙂😌😋😎😅🦷", Smile],
  ["😐", Meh],
  ["😔", Frown],
  ["😣", Annoyed],
  ["😤", Angry],
  // Objetos
  ["📚📖", BookOpen],
  ["📘", Book],
  ["📋", ClipboardList],
  ["📅", CalendarDays],
  ["🗓", Calendar],
  ["📱📵", Smartphone],
  ["💻", Laptop],
  ["📸", Camera],
  ["📊", BarChart3],
  ["📣", Megaphone],
  ["🎨", Palette],
  ["🖌", Brush],
  ["🔤", Type],
  ["🎵💃", Music],
  ["🚀", Rocket],
  ["🧭", Compass],
  ["🗺", MapIcon],
  ["🛒", ShoppingCart],
  ["🧺", ShoppingBasket],
  ["📦", Package],
  ["🏷", Tag],
  ["🔍🔎🕵", Search],
  ["💡", Lightbulb],
  ["🧠", Brain],
  ["🧬", Dna],
  ["🩺⚕🥼", Stethoscope],
  ["💊", Pill],
  ["🧪", FlaskConical],
  ["⚖", Scale],
  ["📏", Ruler],
  ["🧼🫧", Bubbles],
  ["🛡", Shield],
  ["🎒", Backpack],
  ["💰🪙", Coins],
  ["🫀", HeartPulse],
  ["🌀", Wind],
  ["🍴", Utensils],
];

const MAP = new Map<string, LucideIcon>();
for (const [chars, icon] of GROUPS) {
  for (const ch of Array.from(chars)) if (!MAP.has(ch)) MAP.set(ch, icon);
}

// Cor natural de cada emoji, para os cenários decorativos (frutas vermelhas, folhas verdes...).
const TINTS: [string, string][] = [
  ["🍎🍓🍒🍅🌶🍉❤🐞", "#e04848"],
  ["🍊🥕🍠🧡🔥", "#f08a2b"],
  ["🍋🍌🌽🌻🌼⭐🌟✨☀🌞💛🏆🏅🥇👑🐝🪙💰", "#e8b21c"],
  ["🍐🥝🍏🥦🥬🥒🌿🍃🍀🌱🌳🌲🥗💚🥑", "#4f9a4b"],
  ["🍇🫐💜🔮", "#8a5fb0"],
  ["🌸🌷🌺🦋💗🍑", "#e0679b"],
  ["💧💦💙🐟🫧🧼♨🕊", "#3b8fd6"],
  ["🍳🥚🥛🧀🍚🍽🍲🥣🧺🧄", "#b98a5a"],
];
const TINT = new Map<string, string>();
for (const [chars, color] of TINTS) {
  for (const ch of Array.from(chars)) if (!TINT.has(ch)) TINT.set(ch, color);
}

const firstChar = (emoji: string) => Array.from(emoji.replace(/[️‍]/g, ""))[0];

/** Ícone equivalente a um emoji (ou null se não houver). Só olha o primeiro emoji do texto. */
export function iconForEmoji(emoji: string | undefined | null): LucideIcon | null {
  if (!emoji) return null;
  const first = firstChar(emoji);
  return (first && MAP.get(first)) || null;
}

/** Cor natural do emoji (ou undefined). */
export function tintForEmoji(emoji: string | undefined | null): string | undefined {
  if (!emoji) return undefined;
  const first = firstChar(emoji);
  return first ? TINT.get(first) : undefined;
}

type IconNode = [string, Record<string, string | number>][];

/** Contorno do ícone (grade 24×24) como um único caminho SVG, para desenhar em canvas. */
function iconPathData(Icon: LucideIcon): string {
  // O componente do lucide é um forwardRef que só repassa o `iconNode` para o <Icon> interno.
  const render = (
    Icon as unknown as { render?: (p: object, r: null) => { props?: { iconNode?: IconNode } } }
  ).render;
  const node = render?.({}, null)?.props?.iconNode ?? [];
  const n = (v: string | number | undefined) => Number(v ?? 0);
  return node
    .map(([tag, a]) => {
      switch (tag) {
        case "path":
          return String(a.d);
        case "circle":
        case "ellipse": {
          const rx = n(a.rx ?? a.r);
          const ry = n(a.ry ?? a.r);
          const cx = n(a.cx);
          const cy = n(a.cy);
          return `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0`;
        }
        case "line":
          return `M${n(a.x1)} ${n(a.y1)}L${n(a.x2)} ${n(a.y2)}`;
        case "rect": {
          const x = n(a.x);
          const y = n(a.y);
          const w = n(a.width);
          const h = n(a.height);
          const r = Math.min(n(a.rx ?? a.ry), w / 2, h / 2);
          return r
            ? `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`
            : `M${x} ${y}h${w}v${h}h${-w}z`;
        }
        case "polyline":
        case "polygon": {
          const pts = String(a.points)
            .trim()
            .split(/[\s,]+/)
            .map(Number);
          let d = "";
          for (let i = 0; i + 1 < pts.length; i += 2)
            d += `${i ? "L" : "M"}${pts[i]} ${pts[i + 1]}`;
          return tag === "polygon" ? d + "z" : d;
        }
        default:
          return "";
      }
    })
    .join("");
}

const PATHS = new Map<string, Path2D | null>();

/** Caminho (24×24) do ícone equivalente ao emoji, para desenhar em canvas. */
export function emojiIconPath(emoji: string): Path2D | null {
  if (typeof Path2D === "undefined") return null;
  if (!PATHS.has(emoji)) {
    const Icon = iconForEmoji(emoji) ?? Sparkles;
    const d = iconPathData(Icon);
    PATHS.set(emoji, d ? new Path2D(d) : null);
  }
  return PATHS.get(emoji) ?? null;
}

/** Emoji → ícone. Sem equivalente, mostra um ícone neutro (nunca o emoji). `tinted` pinta com a cor natural. */
export function EmojiIcon({
  emoji,
  className = "h-4 w-4",
  strokeWidth,
  fallback = Sparkles,
  tinted = false,
  size,
}: {
  emoji: string | undefined | null;
  className?: string;
  strokeWidth?: number;
  fallback?: LucideIcon | null;
  tinted?: boolean;
  /** Tamanho em px (em vez das classes h-/w-). */
  size?: number;
}) {
  const Icon = iconForEmoji(emoji) ?? fallback;
  if (!Icon) return null;
  const color = tinted ? tintForEmoji(emoji) : undefined;
  return (
    <Icon
      className={className}
      strokeWidth={strokeWidth}
      aria-hidden="true"
      style={color || size ? { color, width: size, height: size } : undefined}
    />
  );
}

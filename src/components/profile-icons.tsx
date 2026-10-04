// Ícones que a pessoa pode escolher para adesivos, favoritos e links do perfil (no lugar de emojis).
// O que fica salvo é o id curto do ícone; perfis antigos que guardaram um emoji continuam aparecendo
// (convertido no ícone equivalente).
import { useState } from "react";
import {
  Apple,
  Bike,
  Bird,
  BookOpen,
  Camera,
  Carrot,
  Cherry,
  Citrus,
  Coffee,
  Cookie,
  Crown,
  Dumbbell,
  Egg,
  Fish,
  Flame,
  Flower2,
  Gem,
  Globe,
  Grape,
  Heart,
  LeafyGreen,
  Leaf,
  Link as LinkIcon,
  Milk,
  Moon,
  Music,
  Palette,
  Pizza,
  Rocket,
  Salad,
  Smile,
  Soup,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Target,
  TreeDeciduous,
  Trophy,
  Droplets,
  Wheat,
  CakeSlice,
  Bean,
  type LucideIcon,
} from "lucide-react";
import { iconForEmoji } from "@/components/emoji-icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const PROFILE_ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  apple: { icon: Apple, label: "Maçã" },
  carrot: { icon: Carrot, label: "Cenoura" },
  salad: { icon: Salad, label: "Salada" },
  leafy: { icon: LeafyGreen, label: "Folhas" },
  citrus: { icon: Citrus, label: "Cítricos" },
  cherry: { icon: Cherry, label: "Cereja" },
  grape: { icon: Grape, label: "Uva" },
  wheat: { icon: Wheat, label: "Grãos" },
  bean: { icon: Bean, label: "Feijão" },
  egg: { icon: Egg, label: "Ovo" },
  fish: { icon: Fish, label: "Peixe" },
  milk: { icon: Milk, label: "Leite" },
  soup: { icon: Soup, label: "Sopa" },
  pizza: { icon: Pizza, label: "Pizza" },
  cake: { icon: CakeSlice, label: "Bolo" },
  cookie: { icon: Cookie, label: "Biscoito" },
  coffee: { icon: Coffee, label: "Café" },
  water: { icon: Droplets, label: "Água" },
  leaf: { icon: Leaf, label: "Folha" },
  sprout: { icon: Sprout, label: "Broto" },
  tree: { icon: TreeDeciduous, label: "Árvore" },
  flower: { icon: Flower2, label: "Flor" },
  sun: { icon: Sun, label: "Sol" },
  moon: { icon: Moon, label: "Lua" },
  flame: { icon: Flame, label: "Chama" },
  star: { icon: Star, label: "Estrela" },
  sparkle: { icon: Sparkles, label: "Brilho" },
  heart: { icon: Heart, label: "Coração" },
  smile: { icon: Smile, label: "Sorriso" },
  trophy: { icon: Trophy, label: "Troféu" },
  crown: { icon: Crown, label: "Coroa" },
  gem: { icon: Gem, label: "Joia" },
  target: { icon: Target, label: "Alvo" },
  dumbbell: { icon: Dumbbell, label: "Treino" },
  bike: { icon: Bike, label: "Bicicleta" },
  book: { icon: BookOpen, label: "Livro" },
  music: { icon: Music, label: "Música" },
  camera: { icon: Camera, label: "Foto" },
  palette: { icon: Palette, label: "Arte" },
  rocket: { icon: Rocket, label: "Foguete" },
  bird: { icon: Bird, label: "Pássaro" },
  globe: { icon: Globe, label: "Mundo" },
  link: { icon: LinkIcon, label: "Link" },
};

export const PROFILE_ICON_IDS = Object.keys(PROFILE_ICONS);

/** Ícone guardado no perfil: um id da lista ou (perfis antigos) um emoji. */
export function ProfileIcon({
  value,
  className = "h-4 w-4",
  fallback = Sparkles,
  strokeWidth,
}: {
  value: string | undefined | null;
  className?: string;
  fallback?: LucideIcon;
  strokeWidth?: number;
}) {
  const Icon = (value && PROFILE_ICONS[value]?.icon) || iconForEmoji(value) || fallback;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}

/** Grade de ícones para escolher. */
export function IconGrid({ value, onPick }: { value: string; onPick: (id: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-1">
      {PROFILE_ICON_IDS.map((id) => {
        const { icon: Icon, label } = PROFILE_ICONS[id];
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            onClick={() => onPick(id)}
            className={`grid h-9 w-9 cursor-pointer place-items-center rounded-lg transition hover:bg-secondary ${
              active ? "bg-accent-soft text-accent ring-1 ring-accent" : "text-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
          </button>
        );
      })}
    </div>
  );
}

/** Botão pequeno que abre a grade de ícones. */
export function IconPickerButton({
  value,
  onPick,
  label = "Escolher ícone",
}: {
  value: string;
  onPick: (id: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          title={label}
          className="grid h-10 w-12 shrink-0 cursor-pointer place-items-center rounded-xl border border-input bg-background text-foreground transition hover:bg-secondary"
        >
          <ProfileIcon value={value} className="h-5 w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <IconGrid
          value={value}
          onPick={(id) => {
            onPick(id);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

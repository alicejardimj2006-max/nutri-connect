import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";
import {
  Award,
  Bell,
  ChefHat,
  Compass,
  Home,
  Palette,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { EspacoLeftColumn, EspacoRightColumn } from "@/components/espaco-side-columns";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { pickName, type Names } from "@/lib/appearance-data";

/** Páginas que ganham os cards laterais em telas largas (o Espaço, o painel clínico e as telas de formulário têm layout próprio). */
const RAIL_PAGES =
  /^\/(comunidades|desafios|explorar|receitas|tema-da-semana|nina|notificacoes|profissionais)(\/|$)|^\/perfil\/(?!configuracoes|editar|personalizacao)[^/]+$/;

const MIN_VIEWPORT = 1440;
const MIN_RAIL = 240;

interface Geometry {
  left: number;
  right: number;
  width: number;
  top: number;
}

const SHORTCUTS: { to: string; icon: ComponentType<{ className?: string }>; names: Names }[] = [
  { to: "/espaco", icon: Home, names: ["Espaço", "Space", "Espacio", "Espace"] },
  { to: "/receitas", icon: ChefHat, names: ["Receitas", "Recipes", "Recetas", "Recettes"] },
  { to: "/explorar", icon: Compass, names: ["Explorar", "Explore", "Explorar", "Explorer"] },
  { to: "/comunidades", icon: Users, names: ["Comunidades", "Communities", "Comunidades", "Communautés"] },
  { to: "/desafios", icon: Award, names: ["Desafios", "Challenges", "Desafíos", "Défis"] },
  { to: "/tema-da-semana", icon: Sparkles, names: ["Tema da semana", "Weekly theme", "Tema de la semana", "Thème de la semaine"] },
  { to: "/notificacoes", icon: Bell, names: ["Notificações", "Notifications", "Notificaciones", "Notifications"] },
  { to: "/perfil/personalizacao", icon: Palette, names: ["Personalização", "Personalization", "Personalización", "Personnalisation"] },
  { to: "/perfil/configuracoes", icon: Settings, names: ["Configurações", "Settings", "Ajustes", "Réglages"] },
];

function Shortcuts() {
  const { locale } = useI18n();
  return (
    <section className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {pickName(["Atalhos", "Shortcuts", "Atajos", "Raccourcis"], locale)}
      </h2>
      <ul className="grid grid-cols-1 gap-0.5">
        {SHORTCUTS.map((s) => (
          <li key={s.to}>
            <Link
              to={s.to}
              className="flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium text-foreground transition hover:bg-secondary"
              activeProps={{ className: "bg-primary-soft text-primary" }}
            >
              <s.icon className="h-4 w-4 text-accent" />
              {pickName(s.names, locale)}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const railScroll =
  "max-h-[var(--rail-h)] space-y-5 overflow-y-auto overscroll-contain pb-2 pr-1 [scrollbar-width:thin]";

/**
 * Cards nas laterais das páginas, em telas largas. Eles ocupam o espaço que sobra ao lado do
 * conteúdo (medido a partir da própria página) e rolam sozinhos. Em telas menores não aparecem.
 */
export function SideRails() {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const enabled = !!user && RAIL_PAGES.test(pathname);
  const [geo, setGeo] = useState<Geometry | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const off = () => {
      root.removeAttribute("data-rails");
      root.style.removeProperty("--rails-main-max");
      setGeo(null);
    };
    if (!enabled) {
      off();
      return;
    }

    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const main = document.querySelector("main");
        const vw = window.innerWidth;
        if (!main || vw < MIN_VIEWPORT) return off();
        const railW = vw >= 1800 ? 380 : vw >= 1600 ? 340 : 300;
        // Páginas de conteúdo estreito se alargam para dividir a tela com os cards.
        root.style.setProperty("--rails-main-max", `${Math.min(1024, vw - 2 * (railW + 40))}px`);
        root.setAttribute("data-rails", "on");
        const rect = main.getBoundingClientRect();
        const space = Math.min(rect.left, vw - rect.right) - 24;
        const width = Math.min(railW, Math.floor(space));
        if (width < MIN_RAIL) return off();
        const header = document.querySelector<HTMLElement>("[data-site-header]");
        const next = {
          left: Math.round(rect.left - 24 - width),
          right: Math.round(rect.right + 24),
          width,
          top: (header?.offsetHeight ?? 64) + 20,
        };
        setGeo((prev) =>
          prev &&
          prev.left === next.left &&
          prev.right === next.right &&
          prev.width === next.width &&
          prev.top === next.top
            ? prev
            : next,
        );
      });
    };

    measure();
    // A página pode montar o conteúdo depois da troca de rota.
    const timers = [120, 500, 1200].map((ms) => window.setTimeout(measure, ms));
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    const main = document.querySelector("main");
    if (main) observer.observe(main);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(window.clearTimeout);
      observer.disconnect();
      window.removeEventListener("resize", measure);
      off();
    };
  }, [enabled, pathname]);

  if (!enabled || !geo) return null;

  const style = (side: "left" | "right"): React.CSSProperties =>
    ({
      left: side === "left" ? geo.left : geo.right,
      top: geo.top,
      width: geo.width,
      "--rail-h": `calc(100dvh - ${geo.top + 20}px)`,
    }) as React.CSSProperties;

  return (
    <>
      <aside aria-label="Atalhos e perfil" className="fixed z-30 text-left" style={style("left")}>
        <div className={railScroll}>
          <EspacoLeftColumn />
          <Shortcuts />
        </div>
      </aside>
      <aside aria-label="Sugestões" className="fixed z-30 text-left" style={style("right")}>
        <div className={railScroll}>
          <EspacoRightColumn />
        </div>
      </aside>
    </>
  );
}

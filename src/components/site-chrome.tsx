import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Leaf, Search, Bell, Home, Users, Award, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ShareModal } from "@/components/share-modal";

const SCROLL_STEP = 8;

/**
 * true quando o usuário rola para baixo (recolher); false ao rolar para cima ou perto do topo.
 * Reinicia a cada troca de página.
 */
function useHideOnScroll(pathname: string) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(false);
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const delta = y - lastY;
      if (y < 64) setHidden(false);
      else if (delta > SCROLL_STEP) setHidden(true);
      else if (delta < -SCROLL_STEP) setHidden(false);
      if (Math.abs(delta) > SCROLL_STEP) lastY = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return hidden;
}

export function SiteHeader() {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const hidden = useHideOnScroll(pathname);

  return (
    <>
    <header
      data-site-header
      data-hidden={hidden}
      className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur-md shadow-xs max-lg:transition-transform max-lg:duration-300 max-lg:data-[hidden=true]:-translate-y-[calc(100%+0.5rem)]"
    >
      {/* Cabeçalho mobile */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:hidden">
        <Link
          to="/notificacoes"
          className="grid h-10 w-10 place-items-center rounded-full text-foreground transition hover:bg-secondary"
          aria-label="Notificações"
          title="Notificações"
        >
          <Bell className="h-5 w-5" />
        </Link>

        <Link to="/" className="flex items-center">
          <span className="text-lg font-bold tracking-tight leading-none text-foreground font-display">
            Nutri<span className="text-accent">Connect</span>
          </span>
        </Link>

        <Link
          to="/explorar"
          className="grid h-10 w-10 place-items-center rounded-full text-foreground transition hover:bg-secondary"
          aria-label="Pesquisar"
          title="Pesquisar"
        >
          <Search className="h-5 w-5" />
        </Link>
      </div>

      {/* Cabeçalho desktop — reúne os atalhos que no mobile ficam na barra inferior */}
      <div className="relative mx-auto hidden h-16 max-w-7xl items-center justify-between gap-4 px-6 lg:flex">
        {user ? (
          <nav aria-label="Navegação principal" className="flex items-center gap-1">
            <Link
              to="/espaco"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "text-accent" }}
            >
              <Home className="h-4 w-4" />
              Espaço
            </Link>
            <Link
              to="/comunidades"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "text-accent" }}
            >
              <Users className="h-4 w-4" />
              Comunidades
            </Link>
            <Link
              to="/desafios"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "text-accent" }}
            >
              <Award className="h-4 w-4" />
              Desafios
            </Link>
          </nav>
        ) : (
          <span />
        )}

        <Link
          to="/"
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center"
        >
          <span className="text-lg font-bold tracking-tight leading-none text-foreground font-display">
            Nutri<span className="text-accent">Connect</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/explorar"
            className="grid h-10 w-10 place-items-center rounded-full text-foreground transition hover:bg-secondary"
            aria-label="Pesquisar"
            title="Pesquisar"
          >
            <Search className="h-5 w-5" />
          </Link>

          <Link
            to="/notificacoes"
            className="grid h-10 w-10 place-items-center rounded-full text-foreground transition hover:bg-secondary"
            aria-label="Notificações"
            title="Notificações"
          >
            <Bell className="h-5 w-5" />
          </Link>

          {user && (
            <ShareModal
              triggerButton={
                <button
                  type="button"
                  className="ml-1 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-soft transition hover:bg-accent/90 cursor-pointer"
                  aria-label="Compartilhar no Espaço de Hoje"
                >
                  <Plus className="h-4 w-4" />
                  Postar
                </button>
              }
            />
          )}

          {user && (
            <Link
              to="/perfil/$userId"
              params={{ userId: user.id }}
              className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary transition hover:opacity-80"
              activeProps={{ className: "ring-2 ring-accent" }}
              aria-label="Perfil"
              title="Perfil"
            >
              {user.name.charAt(0).toUpperCase()}
            </Link>
          )}
        </div>
      </div>
    </header>

    {/* Logo flutuante: fica fixo no celular enquanto a barra superior está recolhida */}
    <Link
      to="/"
      aria-label="NutriConnect — página inicial"
      aria-hidden={!hidden}
      tabIndex={hidden ? 0 : -1}
      className={`fixed left-1/2 top-3 z-40 -translate-x-1/2 rounded-full border border-border/60 bg-background/75 px-4 py-1.5 shadow-lg backdrop-blur-md transition-all duration-300 lg:hidden ${
        hidden ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
      }`}
    >
      <span className="font-display text-base font-bold leading-none tracking-tight text-foreground">
        Nutri<span className="text-accent">Connect</span>
      </span>
    </Link>

    {/* Barra de navegação inferior estilo app — atalhos essenciais no mobile */}
    {user && (
      <nav
        data-site-bottom-nav
        data-hidden={hidden}
        aria-label="Navegação principal"
        className="transition-transform duration-300 data-[hidden=true]:translate-y-[calc(100%+1rem)] fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-border bg-background/95 backdrop-blur-md shadow-[0_-4px_16px_-8px_rgba(0,0,0,0.15)] pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <Link
          to="/espaco"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium text-muted-foreground"
          activeProps={{ className: "text-accent" }}
        >
          <Home className="h-5 w-5" />
          <span>Espaço</span>
        </Link>

        <Link
          to="/comunidades"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium text-muted-foreground"
          activeProps={{ className: "text-accent" }}
        >
          <Users className="h-5 w-5" />
          <span>Comunidades</span>
        </Link>

        <div className="flex flex-1 items-center justify-center">
          <ShareModal
            triggerButton={
              <button
                type="button"
                className="grid h-12 w-12 -translate-y-3 place-items-center rounded-full bg-accent text-accent-foreground shadow-soft transition hover:bg-accent/90 cursor-pointer"
                aria-label="Compartilhar no Espaço de Hoje"
              >
                <Plus className="h-6 w-6" />
              </button>
            }
          />
        </div>

        <Link
          to="/desafios"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium text-muted-foreground"
          activeProps={{ className: "text-accent" }}
        >
          <Award className="h-5 w-5" />
          <span>Desafios</span>
        </Link>

        <Link
          to="/perfil/$userId"
          params={{ userId: user.id }}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium text-muted-foreground"
          activeProps={{ className: "text-accent" }}
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-primary-soft text-[10px] font-bold text-primary">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <span>Perfil</span>
        </Link>
      </nav>
    )}
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/60 text-foreground pb-20 lg:pb-0">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Leaf className="h-4 w-4" />
            </span>
            <span className="font-bold font-display text-lg">NutriConnect</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Sua alimentação. Sua jornada. Uma rede viva para descobrir, compartilhar, aprender e
            construir hábitos melhores juntos.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-primary font-display uppercase tracking-wider">
            Explorar
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/espaco" className="hover:text-accent transition">
                Espaço de Hoje
              </Link>
            </li>
            <li>
              <Link to="/tema-da-semana" className="hover:text-accent transition">
                Tema da Semana
              </Link>
            </li>
            <li>
              <Link to="/receitas" className="hover:text-accent transition">
                Receitas Comunitárias
              </Link>
            </li>
            <li>
              <Link to="/desafios" className="hover:text-accent transition">
                Desafios de Hábitos
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-primary font-display uppercase tracking-wider">
            Comunidade
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/sobre" className="hover:text-accent transition">
                Nosso Manifesto
              </Link>
            </li>
            <li>
              <Link to="/contato" className="hover:text-accent transition">
                Fale Conosco
              </Link>
            </li>
            <li>
              <span className="text-xs text-muted-foreground/80">
                Cuidado sem julgamento corporal
              </span>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-primary font-display uppercase tracking-wider">
            Compromisso
          </h4>
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            Incentivamos a conexão saudável com a alimentação, sem culpa e sem julgamento
            corporal.
          </p>
          <div className="mt-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} NutriConnect. Sua caminhada, no seu ritmo.
          </div>
        </div>
      </div>
    </footer>
  );
}

export function AuthGateLoading() {
  return (
    <div className="grid min-h-screen place-items-center text-muted-foreground text-sm">
      Carregando…
    </div>
  );
}

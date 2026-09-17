import { Link } from "@tanstack/react-router";
import { Leaf, Search, Sparkles, User, LogOut, Home, Users, Award, Plus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth";
import { ShareModal } from "@/components/share-modal";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const links = [
    { to: "/espaco", label: "Espaço de Hoje" },
    { to: "/comunidades", label: "Comunidades" },
    { to: "/tema-da-semana", label: "Tema da Semana" },
    { to: "/receitas", label: "Receitas" },
    { to: "/desafios", label: "Desafios" },
  ] as const;

  return (
    <>
    <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Leaf className="h-5 w-5" />
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight leading-none text-foreground font-display">
              Nutri<span className="text-accent">Connect</span>
            </span>
            <span className="text-[10px] text-muted-foreground tracking-wider uppercase font-sans mt-0.5">
              Rede & Jornadas
            </span>
          </div>
        </Link>

        {/* Links desktop */}
        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline decoration-accent/40 underline-offset-8"
              activeProps={{
                className: "text-foreground font-semibold underline decoration-accent decoration-2",
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Ações desktop */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/buscar"
            className="flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/50 hover:text-foreground shadow-xs"
            title="Buscar receitas, experiências, pessoas"
          >
            <Search className="h-3.5 w-3.5 text-accent" />
            <span>Buscar</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/perfil/$userId"
                params={{ userId: user.id }}
                className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-xs"
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground px-2"
              >
                Entrar
              </Link>
              <Link
                to="/cadastro"
                className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90"
              >
                Começar jornada
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          className="lg:hidden rounded-lg p-2 text-foreground hover:bg-secondary"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          <div className="space-y-1.5">
            <span className="block h-0.5 w-5 bg-foreground rounded-full" />
            <span className="block h-0.5 w-5 bg-foreground rounded-full" />
            <span className="block h-0.5 w-5 bg-foreground rounded-full" />
          </div>
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="border-t bg-card/95 backdrop-blur px-4 py-4 lg:hidden shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col gap-2">
            <Link
              to="/buscar"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium"
            >
              <Search className="h-4 w-4 text-accent" /> Buscar no NutriConnect
            </Link>

            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground font-semibold" }}
              >
                {l.label}
              </Link>
            ))}

            <div className="my-2 border-t pt-2">
              {user ? (
                <div className="space-y-2">
                  <Link
                    to="/perfil/$userId"
                    params={{ userId: user.id }}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-xl bg-primary-soft p-3 text-sm font-semibold text-primary"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" /> Meu Perfil
                    </span>
                    <span className="text-xs opacity-75">{user.name}</span>
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sair da conta
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-border p-2.5 text-center text-sm font-medium hover:bg-secondary"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/cadastro"
                    onClick={() => setOpen(false)}
                    className="rounded-xl bg-accent p-2.5 text-center text-sm font-semibold text-accent-foreground"
                  >
                    Criar conta
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>

    {/* Barra de navegação inferior estilo app — atalhos essenciais no mobile */}
    {user && (
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-border bg-background/95 backdrop-blur-md shadow-[0_-4px_16px_-8px_rgba(0,0,0,0.15)] pb-[env(safe-area-inset-bottom)] lg:hidden"
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
          <span>Grupos</span>
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

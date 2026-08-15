import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { useState } from "react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/", label: "Início" },
    { to: "/sobre", label: "Sobre" },
    { to: "/servicos", label: "Serviços" },
    { to: "/contato", label: "Contato" },
  ] as const;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Nutri<span className="text-primary">Connect</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: true }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="text-sm font-medium text-foreground hover:text-primary"
          >
            Entrar
          </Link>
          <Link
            to="/cadastro"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90"
          >
            Criar conta
          </Link>
        </div>

        <button
          className="md:hidden rounded-md p-2 hover:bg-muted"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          <div className="space-y-1">
            <span className="block h-0.5 w-5 bg-foreground" />
            <span className="block h-0.5 w-5 bg-foreground" />
            <span className="block h-0.5 w-5 bg-foreground" />
          </div>
        </button>
      </div>

      {open && (
        <div className="border-t bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
            <Link to="/login" onClick={() => setOpen(false)} className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted">
              Entrar
            </Link>
            <Link to="/cadastro" onClick={() => setOpen(false)} className="mt-1 rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground">
              Criar conta
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-primary/20 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-primary shadow-xs">
              <Leaf className="h-4 w-4" />
            </span>
            <span className="font-bold text-white">NutriConnect</span>
          </div>
          <p className="mt-3 text-sm text-white/80">
            Nutrição personalizada, ao alcance de todos
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Contato</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li>contato@nutriconnect.com</li>
            <li>+55 (11) 4002-8922</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Redes sociais</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li><a href="#" className="transition hover:text-white hover:underline">Instagram</a></li>
            <li><a href="#" className="transition hover:text-white hover:underline">Facebook</a></li>
            <li><a href="#" className="transition hover:text-white hover:underline">LinkedIn</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Legal</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li><a href="#" className="transition hover:text-white hover:underline">Política de Privacidade</a></li>
            <li><a href="#" className="transition hover:text-white hover:underline">Termos de Uso</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/20 py-4 text-center text-xs text-white/75">
        © {new Date().getFullYear()} NutriConnect. Todos os direitos reservados.
      </div>
    </footer>
  );
}

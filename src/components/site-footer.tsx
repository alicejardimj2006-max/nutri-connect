import { Link } from "@tanstack/react-router";
import { COMPANY } from "@/lib/legal";

/** Rodapé das páginas públicas: documentos legais e identificação de quem opera o site. */
export function SiteFooter() {
  const identification = [COMPANY.legalName, COMPANY.cnpj && `CNPJ ${COMPANY.cnpj}`, COMPANY.address]
    .filter(Boolean)
    .join(" · ");
  return (
    <footer className="border-t bg-card/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-muted-foreground sm:px-6">
        <nav className="flex flex-wrap gap-x-5 gap-y-2 font-medium">
          <Link to="/termos" className="hover:text-foreground">
            Termos de Uso
          </Link>
          <Link to="/privacidade" className="hover:text-foreground">
            Política de Privacidade
          </Link>
          <Link to="/diretrizes" className="hover:text-foreground">
            Diretrizes da Comunidade
          </Link>
          <Link to="/contato" className="hover:text-foreground">
            Fale conosco
          </Link>
          <Link to="/sobre" className="hover:text-foreground">
            Sobre
          </Link>
        </nav>
        <p>
          © {new Date().getFullYear()} {COMPANY.name}. O conteúdo da plataforma é educativo e não
          substitui a consulta com nutricionista ou médico(a).
        </p>
        {identification && <p>{identification}</p>}
      </div>
    </footer>
  );
}

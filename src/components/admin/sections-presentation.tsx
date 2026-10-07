// Apresentação (/apresentacao) no admin: mostra o que está publicado e o que está em rascunho, e abre
// o editor, que é a própria apresentação em tela cheia.
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Pencil } from "lucide-react";
import { btnCls, btnPrimary, Panel, QueryError } from "@/components/admin/admin-ui";
import {
  PresentationEditor,
  stableJson,
  usePresentationRows,
} from "@/components/admin/presentation-editor";

const NAMES: Record<string, string> = {
  "pt-BR": "Português",
  en: "Inglês",
  es: "Espanhol",
  fr: "Francês",
  layout: "Equipe, fotos e ordem",
};

export function PresentationSection() {
  const rows = usePresentationRows();
  const [open, setOpen] = useState(false);

  if (rows.error) return <QueryError error={rows.error} />;
  const list = rows.data ?? [];

  return (
    <>
      <Panel
        title="Apresentação"
        hint="Edite a própria apresentação, com a mesma aparência que o usuário vê. Nada vai ao ar sem Publicar."
      >
        <ul className="mb-4 grid gap-2 sm:grid-cols-2">
          {list.map((r) => {
            const pending = stableJson(r.draft) !== stableJson(r.published);
            return (
              <li
                key={r.key}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm"
              >
                <span className="font-medium">{NAMES[r.key] ?? r.key}</span>
                <span
                  className={
                    pending
                      ? "text-xs font-semibold text-amber-600"
                      : "text-xs text-muted-foreground"
                  }
                >
                  {pending ? "alterações não publicadas" : "publicado"}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={btnPrimary}
            onClick={() => setOpen(true)}
            disabled={!rows.data}
          >
            <Pencil className="h-3.5 w-3.5" /> Editar apresentação
          </button>
          <Link to="/apresentacao" className={btnCls} target="_blank" rel="noreferrer">
            <ExternalLink className="h-3.5 w-3.5" /> Ver publicada
          </Link>
        </div>
      </Panel>
      {open && <PresentationEditor onClose={() => setOpen(false)} />}
    </>
  );
}

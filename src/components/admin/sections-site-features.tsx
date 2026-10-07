// Ligar e desligar partes da plataforma. Desligada: some dos menus e das laterais, e o endereço
// mostra um aviso. Administradores continuam entrando, com uma faixa avisando.
import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { Badge, Panel, btnPrimary } from "@/components/admin/admin-ui";
import { FEATURES, readFeatures, type FeatureFlags } from "@/lib/features";
import { useSaveSiteConfig, useSiteConfigs } from "@/lib/site-config";

export function SiteFeaturesSection() {
  const configs = useSiteConfigs();
  const save = useSaveSiteConfig();
  const saved = useMemo(() => readFeatures(configs.data?.site_features), [configs.data]);
  const [draft, setDraft] = useState<FeatureFlags | null>(null);
  const current = draft ?? saved;
  const dirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(saved);
  const offCount = FEATURES.filter((f) => !current[f.key]).length;

  return (
    <Panel
      title="Funcionalidades"
      hint="Desligar esconde a funcionalidade dos menus e das colunas laterais, e o endereço dela passa a mostrar um aviso de pausa. Nada é apagado: ao ligar de novo, tudo volta como estava."
      action={
        <button
          type="button"
          className={btnPrimary}
          disabled={!dirty || save.isPending}
          onClick={() => {
            const off = FEATURES.filter((f) => !current[f.key]).map((f) => f.label);
            if (off.length && !window.confirm(`Desligar para todos: ${off.join(", ")}?`)) return;
            save.mutate(
              { key: "site_features", value: off.length ? current : null },
              { onSuccess: () => setDraft(null) },
            );
          }}
        >
          <Save className="h-3.5 w-3.5" /> {save.isPending ? "Salvando…" : "Salvar"}
        </button>
      }
    >
      <p className="mb-3 text-xs text-muted-foreground">
        {offCount === 0 ? "Tudo ligado." : `${offCount} desligada(s).`}
        {dirty && (
          <span className="ml-2 font-semibold text-amber-600">Alterações ainda não salvas.</span>
        )}
      </p>
      <ul className="divide-y divide-border rounded-2xl border border-border">
        {FEATURES.map((f) => {
          const on = current[f.key];
          return (
            <li key={f.key} className="flex items-center gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  {f.label}
                  {!on && <Badge tone="warn">Desligada</Badge>}
                </p>
                <p className="text-xs text-muted-foreground">{f.description}</p>
                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/80">
                  {f.paths.join(" · ")}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`${on ? "Desligar" : "Ligar"} ${f.label}`}
                onClick={() => setDraft({ ...current, [f.key]: !on })}
                className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition ${on ? "bg-accent" : "bg-border"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[1.375rem]" : "left-0.5"}`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

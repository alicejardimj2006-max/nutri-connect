// Nível profissional: pontuação, o que falta para subir, funções liberadas, histórico e as regras.
// Os números vêm do banco (get_pro_status / get_my_pro_events / get_pro_rules).
import { useState } from "react";
import { Award, BadgeCheck, ChevronDown, Lock, Unlock } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { useTr } from "@/components/appearance-editor";
import { pickName } from "@/lib/appearance-data";
import { formatDate } from "@/lib/community";
import { PRO_EVENT_NAMES, PRO_FEATURE_NAMES, PRO_LEVEL_NAMES } from "@/lib/social/pro-score";
import { useMyProEvents, useProRules, useProStatus } from "@/lib/social/pro-score-queries";

export function ProLevelBadge({ professionalId }: { professionalId: string }) {
  const { locale } = useI18n();
  const status = useProStatus(professionalId);
  const s = status.data;
  if (!s) return null;
  const name = PRO_LEVEL_NAMES[s.levelCode];
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-bold text-accent">
      {s.excellence ? <BadgeCheck className="h-3.5 w-3.5" /> : <Award className="h-3.5 w-3.5" />}
      {name ? pickName(name, locale) : s.levelCode} · {s.level}/5
    </span>
  );
}

export function ProScoreCard({ professionalId }: { professionalId: string }) {
  const { locale } = useI18n();
  const tr = useTr();
  const status = useProStatus(professionalId);
  const events = useMyProEvents(15);
  const rules = useProRules();
  const [showRules, setShowRules] = useState(false);
  const s = status.data;
  if (!s) return null;

  const levelName = (code: string) => {
    const n = PRO_LEVEL_NAMES[code];
    return n ? pickName(n, locale) : code;
  };
  const score = s.score ?? 0;
  const levels = rules.data?.levels ?? [];
  const current = levels.find((l) => l.level === s.level);
  const floor = current?.min_score ?? 0;
  const next = s.nextLevelScore;
  const pct = next ? Math.min(100, Math.round(((score - floor) / (next - floor)) * 100)) : 100;
  const featureRules = rules.data?.features ?? [];

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
          {s.excellence ? (
            <BadgeCheck className="h-5 w-5 text-accent" />
          ) : (
            <Award className="h-5 w-5 text-accent" />
          )}
          {tr([
            "Seu nível profissional",
            "Your professional level",
            "Tu nivel profesional",
            "Votre niveau professionnel",
          ])}
        </h2>
        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent">
          {levelName(s.levelCode)} · {s.level}/5
        </span>
      </div>

      <p className="mt-3 text-3xl font-extrabold font-display text-foreground">
        {score}{" "}
        <span className="text-sm font-medium text-muted-foreground">
          {tr(["pontos", "points", "puntos", "points"])}
        </span>
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {next && s.nextLevelCode
          ? `${next - score} ${tr(["pontos para", "points to reach", "puntos para", "points pour"])} ${levelName(s.nextLevelCode)}`
          : tr([
              "Você está no nível máximo.",
              "You are at the top level.",
              "Estás en el nivel máximo.",
              "Vous êtes au niveau maximum.",
            ])}
      </p>
      {s.level === 4 && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          {tr([
            "A excelência exige 1500 pontos e 90 dias sem denúncia procedente.",
            "Excellence needs 1500 points and 90 days without an upheld report.",
            "La excelencia exige 1500 puntos y 90 días sin denuncia procedente.",
            "L'excellence exige 1500 points et 90 jours sans signalement fondé.",
          ])}
        </p>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        {tr([
          "Parte da plataforma nas assinaturas do seu perfil de membros:",
          "Platform share on your members-profile subscriptions:",
          "Parte de la plataforma en las suscripciones de tu perfil de miembros:",
          "Part de la plateforme sur les abonnements de votre profil membres :",
        ])}{" "}
        <b className="text-foreground">{s.feePercent}%</b>
      </p>

      <h3 className="mt-4 text-xs font-bold uppercase tracking-wider text-foreground">
        {tr(["Funções", "Features", "Funciones", "Fonctions"])}
      </h3>
      <ul className="mt-2 space-y-1.5">
        {featureRules.map((f) => {
          const open = s.features.includes(f.feature);
          const name = PRO_FEATURE_NAMES[f.feature];
          return (
            <li
              key={f.feature}
              className={`flex items-center gap-2 text-xs ${open ? "text-foreground" : "text-muted-foreground"}`}
            >
              {open ? (
                <Unlock className="h-3.5 w-3.5 shrink-0 text-accent" />
              ) : (
                <Lock className="h-3.5 w-3.5 shrink-0" />
              )}
              <span>{name ? pickName(name, locale) : f.feature}</span>
              {!open && (
                <span className="ml-auto shrink-0 text-[10px]">
                  {tr(["nível", "level", "nivel", "niveau"])} {f.min_level}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <h3 className="mt-4 text-xs font-bold uppercase tracking-wider text-foreground">
        {tr(["Últimos pontos", "Recent points", "Últimos puntos", "Derniers points"])}
      </h3>
      {(events.data ?? []).length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {tr([
            "Nada por aqui ainda.",
            "Nothing here yet.",
            "Nada por aquí todavía.",
            "Rien pour l'instant.",
          ])}
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-border/60">
          {(events.data ?? []).map((e) => {
            const name = PRO_EVENT_NAMES[e.kind];
            return (
              <li key={e.id} className="flex items-center justify-between gap-3 py-1.5 text-xs">
                <span className="min-w-0 truncate text-foreground">
                  {name ? pickName(name, locale) : e.kind}
                  {e.note ? ` — ${e.note}` : ""}
                  <span className="ml-2 text-muted-foreground">{formatDate(e.createdAt)}</span>
                </span>
                <span
                  className={`shrink-0 font-bold ${e.points >= 0 ? "text-accent" : "text-destructive"}`}
                >
                  {e.points > 0 ? `+${e.points}` : e.points}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setShowRules((v) => !v)}
        className="mt-4 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-accent hover:underline"
      >
        {tr(["Como pontuar", "How scoring works", "Cómo puntuar", "Comment marquer des points"])}
        <ChevronDown className={`h-3.5 w-3.5 transition ${showRules ? "rotate-180" : ""}`} />
      </button>
      {showRules && (
        <div className="mt-2 space-y-3 text-xs">
          <ul className="space-y-1">
            {(rules.data?.rules ?? []).map((r) => {
              const name = PRO_EVENT_NAMES[r.kind];
              return (
                <li key={r.kind} className="flex justify-between gap-3">
                  <span className="text-foreground">{name ? pickName(name, locale) : r.kind}</span>
                  <span
                    className={
                      r.points >= 0 ? "font-bold text-accent" : "font-bold text-destructive"
                    }
                  >
                    {r.points > 0 ? `+${r.points}` : r.points}
                    {r.daily_cap
                      ? ` (${tr(["máx.", "max", "máx.", "max"])} ${r.daily_cap}/${tr(["dia", "day", "día", "jour"])})`
                      : ""}
                  </span>
                </li>
              );
            })}
          </ul>
          <ul className="space-y-1 border-t border-border pt-2">
            {levels.map((l) => (
              <li key={l.level} className="flex justify-between gap-3">
                <span className="text-foreground">
                  {l.level}. {levelName(l.code)}
                </span>
                <span className="text-muted-foreground">
                  {l.min_score}+ · {tr(["taxa", "fee", "tasa", "frais"])} {l.membership_fee_percent}
                  %
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

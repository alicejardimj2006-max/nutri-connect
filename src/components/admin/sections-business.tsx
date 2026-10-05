import { useState } from "react";
import { Download, Save } from "lucide-react";
import {
  Badge,
  Empty,
  Pagination,
  Panel,
  QueryError,
  SearchBox,
  StackedBars,
  StatCard,
  btnCls,
  btnPrimary,
  dateTime,
  inputCls,
  useDebounced,
} from "@/components/admin/admin-ui";
import {
  adminActions,
  adminRpc,
  downloadCsv,
  money,
  useAdminAction,
  useAdminPayments,
  useAiStats,
  useAuditLog,
  useOverview,
  useSettings,
  type AdminPayment,
} from "@/lib/admin-api";
import { Banknote, BrainCircuit, Flag, Percent, RotateCcw, Users } from "lucide-react";
import { LEGAL_VERSION } from "@/lib/legal";

// ── Financeiro ───────────────────────────────────────────────────────────────

const PAY_LABEL: Record<AdminPayment["status"], string> = {
  pendente: "Pendente",
  em_processamento: "Em processamento",
  aprovado: "Aprovado",
  recusado: "Recusado",
  reembolsado: "Reembolsado",
  cancelado: "Cancelado",
};
const PAY_TONE: Record<AdminPayment["status"], "default" | "good" | "warn" | "bad" | "info"> = {
  pendente: "warn",
  em_processamento: "info",
  aprovado: "good",
  recusado: "bad",
  reembolsado: "default",
  cancelado: "default",
};
const PAGE = 25;

export function FinanceSection() {
  const overview = useOverview();
  const [status, setStatus] = useState("todos");
  const [offset, setOffset] = useState(0);
  const pays = useAdminPayments({ status, offset, limit: PAGE });
  const list = pays.data ?? [];
  const o = overview.data;

  const exportAll = async () => {
    const rows: AdminPayment[] = [];
    for (let off = 0; off < 2000; off += 100) {
      const page = await adminRpc<AdminPayment[]>("admin_payments", {
        p_status: status,
        p_limit: 100,
        p_offset: off,
      });
      rows.push(...page);
      if (page.length < 100) break;
    }
    downloadCsv(
      `pagamentos-${new Date().toISOString().slice(0, 10)}.csv`,
      rows.map((p) => ({
        id: p.id,
        paciente: p.patient_name,
        profissional: p.professional_name,
        valor_reais: (p.amount_cents / 100).toFixed(2).replace(".", ","),
        taxa_plataforma_reais: (p.platform_fee_cents / 100).toFixed(2).replace(".", ","),
        situacao: p.status,
        forma: p.method ?? "",
        origem: p.provider,
        criado_em: p.created_at,
        pago_em: p.paid_at ?? "",
        reembolsado_em: p.refunded_at ?? "",
      })),
    );
    void adminActions.log("exportou_pagamentos", "export", "pagamentos", { total: rows.length });
  };

  return (
    <div className="space-y-4">
      {o && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total aprovado"
            value={money(o.paid_cents)}
            icon={Banknote}
            tone="good"
          />
          <StatCard label="Taxa da plataforma" value={money(o.fees_cents)} icon={Percent} />
          <StatCard label="Reembolsado" value={money(o.refunded_cents)} icon={RotateCcw} />
          <StatCard
            label="Consultas próximas"
            value={o.appointments_upcoming}
            sub={`${o.appointments_7d} marcadas em 7 dias`}
            icon={Users}
          />
        </div>
      )}
      <Panel
        title="Pagamentos"
        hint="Os pagamentos são processados pelo Stripe; aqui você acompanha o resultado."
        action={
          <button type="button" onClick={exportAll} className={btnCls}>
            <Download className="h-3.5 w-3.5" /> Exportar CSV
          </button>
        }
      >
        <div className="no-scrollbar mb-4 flex max-w-full gap-1.5 overflow-x-auto">
          {[
            "todos",
            "aprovado",
            "pendente",
            "em_processamento",
            "reembolsado",
            "recusado",
            "cancelado",
          ].map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={status === s}
              onClick={() => {
                setStatus(s);
                setOffset(0);
              }}
              className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                status === s
                  ? "border-accent bg-accent-soft text-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "todos" ? "Todos" : PAY_LABEL[s as AdminPayment["status"]]}
            </button>
          ))}
        </div>
        {pays.error ? (
          <QueryError error={pays.error} />
        ) : pays.isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : list.length === 0 ? (
          <Empty>Nenhum pagamento por aqui.</Empty>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border/70">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="bg-secondary/50 text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Quando</th>
                  <th className="px-4 py-2.5 font-semibold">Paciente → Profissional</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Valor</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Taxa</th>
                  <th className="px-4 py-2.5 font-semibold">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-card">
                {list.map((p) => (
                  <tr key={p.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                      {dateTime(p.created_at)}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {p.patient_name} <span className="text-muted-foreground">→</span>{" "}
                      {p.professional_name}
                      <span className="block text-[11px] text-muted-foreground">
                        {p.provider === "manual" ? "Registro manual" : "Online"}
                        {p.method ? ` · ${p.method}` : ""}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                      {money(p.amount_cents)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-muted-foreground">
                      {money(p.platform_fee_cents)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={PAY_TONE[p.status]}>{PAY_LABEL[p.status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination offset={offset} limit={PAGE} total={list[0]?.total ?? 0} onChange={setOffset} />
      </Panel>
    </div>
  );
}

// ── Inteligência artificial ──────────────────────────────────────────────────

export function AiSection() {
  const [days, setDays] = useState(14);
  const stats = useAiStats(days);
  const s = stats.data;
  const dm = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;

  return (
    <div className="space-y-4">
      <Panel
        title="Uso da IA"
        hint="Nina, resumos clínicos e a análise automática de publicações e fotos."
        action={
          <select
            aria-label="Período"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className={`${inputCls} !w-auto`}
          >
            {[7, 14, 30, 60].map((d) => (
              <option key={d} value={d}>
                Últimos {d} dias
              </option>
            ))}
          </select>
        }
      >
        {stats.error ? (
          <QueryError error={stats.error} />
        ) : !s ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Pessoas usando hoje" value={s.users_today} icon={Users} />
              <StatCard
                label={`Conversas com a Nina (${days} dias)`}
                value={s.nina_messages}
                icon={BrainCircuit}
              />
              <StatCard
                label="Conteúdos barrados pela IA"
                value={s.flagged_total}
                sub={`${s.flagged_pending} aguardando revisão`}
                icon={Flag}
                tone={s.flagged_pending > 0 ? "alert" : "default"}
              />
              <StatCard
                label="Acertos da IA na revisão"
                value={
                  s.upheld + s.overturned > 0
                    ? `${Math.round((s.upheld / (s.upheld + s.overturned)) * 100)}%`
                    : "—"
                }
                sub={`${s.upheld} confirmadas · ${s.overturned} revertidas`}
                icon={BrainCircuit}
                tone="good"
              />
            </div>
            <div className="mt-5">
              <StackedBars
                labels={s.by_day.map((d) => dm(d.day))}
                series={[
                  { name: "Nina", color: "#8a5fb0", values: s.by_day.map((d) => d.nina) },
                  {
                    name: "Resumos clínicos",
                    color: "#0f9aa8",
                    values: s.by_day.map((d) => d.summary),
                  },
                  {
                    name: "Moderação",
                    color: "#d9692a",
                    values: s.by_day.map((d) => d.moderation),
                  },
                ]}
              />
              <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                <span>{dm(s.by_day[0]?.day ?? "0000-00-00")}</span>
                <span>hoje</span>
              </div>
            </div>
            {s.top_today.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Quem mais usou hoje
                </h3>
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {s.top_today.map((t, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2 text-sm"
                    >
                      <span className="truncate">{t.name}</span>
                      <b>{t.count}</b>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </Panel>
      <LimitsPanel />
    </div>
  );
}

const AI_LIMITS = [
  ["ai_limit_nina", "Perguntas à Nina por pessoa/dia", 500],
  ["ai_limit_summary", "Resumos clínicos por pessoa/dia", 500],
  ["ai_limit_moderation", "Análises de publicação e foto por pessoa/dia", 2000],
] as const;

function NumberSetting({
  settingKey,
  label,
  max,
  unit,
}: {
  settingKey: string;
  label: string;
  max: number;
  unit?: string;
}) {
  const settings = useSettings();
  const current = settings.data?.[settingKey];
  const [value, setValue] = useState<string | null>(null);
  const shown = value ?? (current !== undefined ? String(current) : "");
  const save = useAdminAction(adminActions.setSetting, "Configuração salva.");
  const changed = value !== null && value !== String(current);
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="block min-w-[14rem] flex-1 space-y-1.5">
        <span className="text-xs font-semibold text-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={max}
            step={settingKey === "platform_fee_percent" ? 0.5 : 1}
            value={shown}
            onChange={(e) => setValue(e.target.value)}
            className={`${inputCls} max-w-[10rem]`}
          />
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
        </div>
      </label>
      <button
        type="button"
        disabled={!changed || shown === "" || save.isPending}
        onClick={() =>
          save.mutate(
            { key: settingKey, value: Number(shown) },
            { onSuccess: () => setValue(null) },
          )
        }
        className={btnPrimary}
      >
        <Save className="h-3.5 w-3.5" /> Salvar
      </button>
    </div>
  );
}

function LimitsPanel() {
  return (
    <Panel
      title="Limites diários"
      hint="Valem para cada pessoa e começam a valer na hora. Use 0 para desligar o recurso."
    >
      <div className="space-y-4">
        {AI_LIMITS.map(([key, label, max]) => (
          <NumberSetting key={key} settingKey={key} label={label} max={max} />
        ))}
      </div>
    </Panel>
  );
}

// ── Configurações ────────────────────────────────────────────────────────────

export function SettingsSection() {
  return (
    <div className="space-y-4">
      <Panel
        title="Pagamentos e consultas"
        hint="Mudam só as consultas novas; as já marcadas mantêm o que foi combinado."
      >
        <div className="space-y-4">
          <NumberSetting
            settingKey="platform_fee_percent"
            label="Taxa da plataforma sobre cada consulta"
            max={50}
            unit="%"
          />
          <NumberSetting
            settingKey="payment_hold_minutes"
            label="Tempo para pagar e segurar o horário"
            max={240}
            unit="minutos"
          />
          <NumberSetting
            settingKey="min_booking_notice_hours"
            label="Antecedência mínima para marcar"
            max={168}
            unit="horas"
          />
        </div>
      </Panel>
      <LimitsPanel />
      <Panel title="Sobre esta versão">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Versão dos documentos legais
            </dt>
            <dd className="mt-0.5 text-foreground">{LEGAL_VERSION}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Pagamentos
            </dt>
            <dd className="mt-0.5 text-foreground">
              Stripe (chaves e webhook ficam nos segredos do Supabase)
            </dd>
          </div>
        </dl>
      </Panel>
    </div>
  );
}

// ── Auditoria ────────────────────────────────────────────────────────────────

const ACTION_LABEL: Record<string, string> = {
  conta_suspensa: "Suspendeu uma conta",
  conta_reativada: "Reativou uma conta",
  admin_concedido: "Concedeu permissão de administrador",
  admin_removido: "Removeu permissão de administrador",
  post_ocultado: "Ocultou uma publicação",
  post_restaurado: "Restaurou uma publicação",
  post_fixado: "Fixou uma publicação",
  post_desafixado: "Desafixou uma publicação",
  post_apagado: "Apagou uma publicação",
  configuracao_alterada: "Alterou uma configuração",
  anuncio_criado: "Criou um anúncio",
  anuncio_editado: "Editou um anúncio",
  anuncio_apagado: "Apagou um anúncio",
  tema_criado: "Criou um tema da semana",
  tema_editado: "Editou um tema da semana",
  fale_conosco_status: "Mudou o status de uma mensagem",
  exportou_pessoas: "Exportou a lista de pessoas",
  exportou_pagamentos: "Exportou os pagamentos",
};

export function AuditSection() {
  const log = useAuditLog();
  const [query, setQuery] = useState("");
  const q = useDebounced(query).toLowerCase();
  const rows = (log.data ?? []).filter(
    (r) =>
      !q ||
      r.admin_name.toLowerCase().includes(q) ||
      (ACTION_LABEL[r.action] ?? r.action).toLowerCase().includes(q) ||
      JSON.stringify(r.details).toLowerCase().includes(q) ||
      (r.target_id ?? "").toLowerCase().includes(q),
  );
  return (
    <Panel
      title="Auditoria"
      hint="Registro de tudo que os administradores fizeram neste painel (as 300 ações mais recentes)."
      action={
        <button
          type="button"
          onClick={() =>
            downloadCsv(
              `auditoria-${new Date().toISOString().slice(0, 10)}.csv`,
              rows.map((r) => ({
                quando: r.created_at,
                quem: r.admin_name,
                acao: ACTION_LABEL[r.action] ?? r.action,
                alvo: `${r.target_type ?? ""} ${r.target_id ?? ""}`.trim(),
                detalhes: r.details,
              })),
            )
          }
          className={btnCls}
        >
          <Download className="h-3.5 w-3.5" /> Exportar CSV
        </button>
      }
    >
      <div className="mb-4">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Filtrar por pessoa, ação ou detalhe…"
        />
      </div>
      {log.error ? (
        <QueryError error={log.error} />
      ) : log.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : rows.length === 0 ? (
        <Empty>Nenhum registro.</Empty>
      ) : (
        <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start gap-3 bg-card px-4 py-3">
              <span className="w-32 shrink-0 text-xs text-muted-foreground">
                {dateTime(r.created_at)}
              </span>
              <div className="min-w-0 flex-1 basis-60">
                <p className="text-sm text-foreground">
                  <b>{r.admin_name || "—"}</b> · {ACTION_LABEL[r.action] ?? r.action}
                </p>
                {(r.target_id || Object.keys(r.details ?? {}).length > 0) && (
                  <p className="mt-0.5 break-all text-[11px] text-muted-foreground">
                    {r.target_type ? `${r.target_type}: ` : ""}
                    {r.target_id}
                    {Object.keys(r.details ?? {}).length > 0
                      ? ` · ${JSON.stringify(r.details)}`
                      : ""}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Banknote,
  CalendarClock,
  Flag,
  Inbox,
  MessageSquare,
  Sparkles,
  UserPlus,
  Users,
  UserX,
  EyeOff,
  ShieldCheck,
  FileText,
  Percent,
} from "lucide-react";
import { BarChart, Panel, QueryError, StatCard } from "@/components/admin/admin-ui";
import { money, useOverview, useSettings } from "@/lib/admin-api";
import type { SectionId } from "@/components/admin/sections";

const dm = (day: string) => {
  const d = new Date(day + "T12:00:00");
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export function OverviewSection({ go }: { go: (id: SectionId) => void }) {
  const { data: o, error, isLoading } = useOverview();
  const settings = useSettings();

  if (error) return <QueryError error={error} />;
  if (isLoading || !o) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  const attention = [
    { id: "moderacao" as const, label: "Denúncias pendentes", value: o.reports_pending, sub: o.reports_ai_pending ? `${o.reports_ai_pending} vindas da IA` : undefined, icon: Flag },
    { id: "verificacoes" as const, label: "Verificações aguardando", value: o.verifications_pending, icon: BadgeCheck },
    { id: "contato" as const, label: "Mensagens novas (Fale conosco)", value: o.contact_new, icon: Inbox },
    { id: "comunidades" as const, label: "Comunidades com pendência", value: o.communities_attention, icon: Users },
    { id: "posts" as const, label: "Posts ocultos", value: o.posts_hidden, icon: EyeOff },
    { id: "usuarios" as const, label: "Contas suspensas", value: o.suspended, icon: UserX },
  ];
  const urgent = attention.filter((a) => a.value > 0).length;

  const limits = settings.data ?? {};
  const usage = [
    { label: "Nina (perguntas)", used: o.nina_today, limit: limits.ai_limit_nina },
    { label: "Resumos clínicos", used: o.summary_today, limit: limits.ai_limit_summary },
    { label: "Análises de moderação", used: o.moderation_today, limit: limits.ai_limit_moderation },
  ];

  return (
    <div className="space-y-5">
      <Panel
        title="Atenção agora"
        hint={urgent === 0 ? "Tudo em dia. Nada esperando por você." : `${urgent} ${urgent === 1 ? "assunto precisa" : "assuntos precisam"} da sua atenção.`}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {attention.map((a) => (
            <StatCard key={a.id} label={a.label} value={a.value} sub={a.sub} icon={a.icon} tone={a.value > 0 ? "alert" : "good"} onClick={() => go(a.id)} />
          ))}
        </div>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pessoas na plataforma" value={o.users_total} sub={`+${o.users_7d} nos últimos 7 dias`} icon={Users} />
        <StatCard label="Profissionais verificados" value={o.pros} sub={`${o.admins} administrador${o.admins === 1 ? "" : "es"}`} icon={ShieldCheck} />
        <StatCard label="Publicações" value={o.posts_total} sub={`${o.posts_today} nas últimas 24 h · ${o.posts_7d} em 7 dias`} icon={FileText} />
        <StatCard label="Comentários (7 dias)" value={o.comments_7d} icon={MessageSquare} />
        <StatCard label="Consultas próximas" value={o.appointments_upcoming} sub={`${o.appointments_7d} marcadas nos últimos 7 dias`} icon={CalendarClock} />
        <StatCard label="Recebido (aprovado)" value={money(o.paid_cents)} sub={`reembolsado: ${money(o.refunded_cents)}`} icon={Banknote} />
        <StatCard label="Taxa da plataforma" value={money(o.fees_cents)} sub={settings.data?.platform_fee_percent !== undefined ? `${settings.data.platform_fee_percent}% por consulta` : undefined} icon={Percent} />
        <StatCard label="Novos em 30 dias" value={o.users_30d} icon={UserPlus} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Novas pessoas por dia" hint="Últimos 30 dias">
          <BarChart data={o.signups.map((p) => ({ label: dm(p.day), value: p.n }))} color="#3b7bbf" />
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>{dm(o.signups[0]?.day ?? new Date().toISOString().slice(0, 10))}</span>
            <span>hoje</span>
          </div>
        </Panel>
        <Panel title="Publicações por dia" hint="Últimos 30 dias">
          <BarChart data={o.posts_series.map((p) => ({ label: dm(p.day), value: p.n }))} color="#d9692a" />
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>{dm(o.posts_series[0]?.day ?? new Date().toISOString().slice(0, 10))}</span>
            <span>hoje</span>
          </div>
        </Panel>
      </div>

      <Panel title="Uso da IA hoje" hint="Contagem de usos hoje em relação ao limite diário por pessoa" action={<button type="button" onClick={() => go("ia")} className="text-xs font-semibold text-accent hover:underline">Ver detalhes →</button>}>
        <div className="grid gap-4 sm:grid-cols-3">
          {usage.map((u) => (
            <div key={u.label} className="rounded-2xl bg-secondary/50 p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-accent" /> {u.label}
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-foreground">{u.used}</p>
              <p className="text-[11px] text-muted-foreground">limite por pessoa: {u.limit ?? "—"} por dia</p>
            </div>
          ))}
        </div>
      </Panel>

      {urgent === 0 && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5" /> Os números acima são ao vivo: recarregue para atualizar.
        </p>
      )}
      {urgent > 0 && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertTriangle className="h-3.5 w-3.5" /> Clique em um cartão de atenção para ir direto ao assunto.
        </p>
      )}
    </div>
  );
}

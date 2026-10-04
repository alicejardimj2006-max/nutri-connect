import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Download,
  ExternalLink,
  Mail,
  MoreHorizontal,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  Badge,
  ConfirmDialog,
  Empty,
  Pagination,
  Panel,
  QueryError,
  SearchBox,
  btnCls,
  dateTime,
  inputCls,
  shortDate,
  useDebounced,
} from "@/components/admin/admin-ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  adminActions,
  adminRpc,
  downloadCsv,
  useAdminAction,
  useAdminUsers,
  useContactMessages,
  type AdminUser,
} from "@/lib/admin-api";
import { initials } from "@/lib/community";
import { supabase } from "@/integrations/supabase/client";

const PAGE = 25;
const FILTERS = [
  ["todos", "Todas"],
  ["pacientes", "Pacientes"],
  ["profissionais", "Profissionais"],
  ["admins", "Administradores"],
  ["suspensos", "Suspensas"],
] as const;

// ── Pessoas ──────────────────────────────────────────────────────────────────

export function UsersSection({ me }: { me: string }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("todos");
  const [offset, setOffset] = useState(0);
  const q = useDebounced(query);
  const users = useAdminUsers({ query: q, filter, offset, limit: PAGE });
  const list = users.data ?? [];
  const total = list[0]?.total ?? 0;
  const [suspend, setSuspend] = useState<AdminUser | null>(null);
  const [toggleAdmin, setToggleAdmin] = useState<AdminUser | null>(null);

  const suspendAction = useAdminAction(adminActions.setSuspended, "Conta atualizada.");
  const adminAction = useAdminAction(adminActions.setAdmin, "Permissão atualizada.");

  const exportAll = async () => {
    try {
      const rows: AdminUser[] = [];
      for (let o = 0; o < 2000; o += 100) {
        const page = await adminRpc<AdminUser[]>("admin_search_users", {
          p_query: q,
          p_filter: filter,
          p_limit: 100,
          p_offset: o,
        });
        rows.push(...page);
        if (page.length < 100) break;
      }
      downloadCsv(
        `pessoas-${new Date().toISOString().slice(0, 10)}.csv`,
        rows.map((u) => ({
          id: u.id,
          nome: u.name,
          usuario: u.username,
          email: u.email ?? "",
          tipo: u.verified ? "profissional" : "paciente",
          administrador: u.is_admin ? "sim" : "não",
          suspensa: u.suspended_at ? "sim" : "não",
          publicacoes: u.posts_count,
          denuncias_pendentes: u.reports_pending,
          criada_em: u.created_at,
        })),
      );
      void adminActions.log("exportou_pessoas", "export", "pessoas", {
        filtro: filter,
        total: rows.length,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível exportar.");
    }
  };

  return (
    <div className="space-y-4">
      <Panel
        title="Pessoas"
        hint="Busque por nome, @usuário ou e-mail. Suspenda contas, conceda permissões e exporte a lista."
        action={
          <button type="button" onClick={exportAll} className={btnCls}>
            <Download className="h-3.5 w-3.5" /> Exportar CSV
          </button>
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <SearchBox
            value={query}
            onChange={(v) => {
              setQuery(v);
              setOffset(0);
            }}
            placeholder="Nome, @usuário ou e-mail…"
          />
          <div className="no-scrollbar flex max-w-full gap-1.5 overflow-x-auto">
            {FILTERS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={filter === id}
                onClick={() => {
                  setFilter(id);
                  setOffset(0);
                }}
                className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  filter === id
                    ? "border-accent bg-accent-soft text-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {users.error ? (
            <QueryError error={users.error} />
          ) : users.isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : list.length === 0 ? (
            <Empty>Nenhuma pessoa encontrada.</Empty>
          ) : (
            <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70">
              {list.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center gap-3 bg-card px-4 py-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary-soft text-xs font-extrabold text-primary">
                    {initials(u.name)}
                  </span>
                  <div className="min-w-0 flex-1 basis-56">
                    <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-foreground">
                      <span className="truncate">{u.name || "(sem nome)"}</span>
                      {u.verified && <Badge tone="info">Profissional</Badge>}
                      {u.is_admin && <Badge tone="good">Admin</Badge>}
                      {u.suspended_at && <Badge tone="bad">Suspensa</Badge>}
                      {u.reports_pending > 0 && (
                        <Badge tone="warn">
                          {u.reports_pending} denúncia{u.reports_pending > 1 ? "s" : ""}
                        </Badge>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      @{u.username} · {u.email ?? "sem e-mail"}
                    </p>
                  </div>
                  <div className="hidden text-right text-xs text-muted-foreground sm:block">
                    <p>{u.posts_count} publicações</p>
                    <p>desde {shortDate(u.created_at)}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button type="button" className={btnCls} aria-label={`Ações para ${u.name}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60">
                      <DropdownMenuItem asChild>
                        <Link
                          to="/perfil/$userId"
                          params={{ userId: u.id }}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" /> Abrir perfil
                        </Link>
                      </DropdownMenuItem>
                      {u.email && (
                        <DropdownMenuItem asChild>
                          <a
                            href={`mailto:${u.email}`}
                            className="flex cursor-pointer items-center gap-2"
                          >
                            <Mail className="h-4 w-4" /> Enviar e-mail
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {u.id !== me && !u.is_admin && (
                        <DropdownMenuItem
                          onClick={() =>
                            u.suspended_at
                              ? suspendAction.mutate({ user: u.id, suspend: false, reason: "" })
                              : setSuspend(u)
                          }
                          className="flex cursor-pointer items-center gap-2"
                        >
                          {u.suspended_at ? (
                            <UserCheck className="h-4 w-4" />
                          ) : (
                            <UserX className="h-4 w-4 text-destructive" />
                          )}
                          {u.suspended_at ? "Reativar conta" : "Suspender conta"}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => setToggleAdmin(u)}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        {u.is_admin ? (
                          <ShieldOff className="h-4 w-4" />
                        ) : (
                          <ShieldCheck className="h-4 w-4" />
                        )}
                        {u.is_admin ? "Remover administrador" : "Tornar administrador"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          )}
          <Pagination offset={offset} limit={PAGE} total={total} onChange={setOffset} />
        </div>
      </Panel>

      <ConfirmDialog
        open={!!suspend}
        title={`Suspender ${suspend?.name ?? ""}?`}
        description="A pessoa continua podendo entrar e ler, mas não consegue publicar nem comentar. Ela recebe um aviso com o motivo."
        confirmLabel="Suspender"
        danger
        askReason
        busy={suspendAction.isPending}
        onClose={() => setSuspend(null)}
        onConfirm={(reason) =>
          suspend &&
          suspendAction.mutate(
            { user: suspend.id, suspend: true, reason },
            { onSuccess: () => setSuspend(null) },
          )
        }
      />
      <ConfirmDialog
        open={!!toggleAdmin}
        title={
          toggleAdmin?.is_admin
            ? `Remover ${toggleAdmin?.name} dos administradores?`
            : `Tornar ${toggleAdmin?.name} administrador?`
        }
        description={
          toggleAdmin?.is_admin
            ? "A pessoa perde o acesso a este painel."
            : "A pessoa passa a ter acesso total a este painel, inclusive para suspender contas."
        }
        confirmLabel={toggleAdmin?.is_admin ? "Remover" : "Conceder"}
        danger={!!toggleAdmin?.is_admin}
        busy={adminAction.isPending}
        onClose={() => setToggleAdmin(null)}
        onConfirm={() =>
          toggleAdmin &&
          adminAction.mutate(
            { user: toggleAdmin.id, make: !toggleAdmin.is_admin },
            { onSuccess: () => setToggleAdmin(null) },
          )
        }
      />
    </div>
  );
}

// ── Fale conosco ─────────────────────────────────────────────────────────────

const STATUS_LABEL = {
  novo: "Nova",
  em_atendimento: "Em atendimento",
  resolvido: "Resolvida",
} as const;
const STATUS_TONE = { novo: "warn", em_atendimento: "info", resolvido: "good" } as const;

export function ContactSection() {
  const messages = useContactMessages();
  const [filter, setFilter] = useState<"todas" | "novo" | "em_atendimento" | "resolvido">("novo");
  const [openId, setOpenId] = useState<string | null>(null);
  const setStatus = useAdminAction(async (p: { id: string; status: keyof typeof STATUS_LABEL }) => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ status: p.status })
      .eq("id", p.id);
    if (error) throw new Error(error.message);
    void adminActions.log("fale_conosco_status", "contact_message", p.id, { status: p.status });
  }, "Status atualizado.");

  const all = messages.data ?? [];
  const list = filter === "todas" ? all : all.filter((m) => m.status === filter);

  return (
    <Panel title="Fale conosco" hint="Mensagens enviadas pelo formulário de contato do site.">
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(["novo", "em_atendimento", "resolvido", "todas"] as const).map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
            className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === id
                ? "border-accent bg-accent-soft text-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {id === "todas" ? "Todas" : STATUS_LABEL[id]}{" "}
            <span className="opacity-60">
              {id === "todas" ? all.length : all.filter((m) => m.status === id).length}
            </span>
          </button>
        ))}
      </div>
      {messages.error ? (
        <QueryError error={messages.error} />
      ) : messages.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : list.length === 0 ? (
        <Empty>Nenhuma mensagem aqui.</Empty>
      ) : (
        <ul className="space-y-2">
          {list.map((m) => {
            const open = openId === m.id;
            return (
              <li key={m.id} className="rounded-2xl border border-border/70 bg-card">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : m.id)}
                  className="flex w-full cursor-pointer flex-wrap items-center gap-3 px-4 py-3 text-left"
                >
                  <div className="min-w-0 flex-1 basis-60">
                    <p className="truncate text-sm font-semibold text-foreground">{m.subject}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.name} · {m.email}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[m.status]}>{STATUS_LABEL[m.status]}</Badge>
                  <span className="text-xs text-muted-foreground">{dateTime(m.created_at)}</span>
                </button>
                {open && (
                  <div className="border-t border-border/60 px-4 py-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {m.message}
                    </p>
                    {m.phone && (
                      <p className="mt-2 text-xs text-muted-foreground">Telefone: {m.phone}</p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <a
                        href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + m.subject)}`}
                        className={btnCls}
                      >
                        <Mail className="h-3.5 w-3.5" /> Responder por e-mail
                      </a>
                      <select
                        aria-label="Mudar status"
                        value={m.status}
                        onChange={(e) =>
                          setStatus.mutate({
                            id: m.id,
                            status: e.target.value as keyof typeof STATUS_LABEL,
                          })
                        }
                        className={`${inputCls} !w-auto`}
                      >
                        {(Object.keys(STATUS_LABEL) as (keyof typeof STATUS_LABEL)[]).map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

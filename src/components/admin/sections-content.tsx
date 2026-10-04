import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, ExternalLink, Pencil, Pin, PinOff, Plus, Trash2 } from "lucide-react";
import {
  Badge,
  ConfirmDialog,
  Empty,
  Pagination,
  Panel,
  QueryError,
  SearchBox,
  btnCls,
  btnDanger,
  btnPrimary,
  dateTime,
  inputCls,
  shortDate,
  useDebounced,
} from "@/components/admin/admin-ui";
import {
  adminActions,
  useAdminAction,
  useAdminPosts,
  useAnnouncements,
  useThemes,
  type AdminPost,
  type Announcement,
  type ThemeRow,
} from "@/lib/admin-api";
import { supabase } from "@/integrations/supabase/client";
import { usePostTypeColor } from "@/lib/post-type";

const PAGE = 20;
const TYPE_LABEL = { receita: "Receita", experiencia: "Experiência", pergunta: "Pergunta", geral: "Conversa" } as const;

// ── Publicações ──────────────────────────────────────────────────────────────

function PostRow({ post, onDelete }: { post: AdminPost; onDelete: (p: AdminPost) => void }) {
  const color = usePostTypeColor(post.type);
  const hide = useAdminAction(adminActions.postHidden, post.hidden ? "Publicação restaurada." : "Publicação ocultada.");
  const pin = useAdminAction(adminActions.postPinned, post.pinned ? "Publicação desafixada." : "Publicação fixada.");
  return (
    <li className="flex flex-wrap gap-4 rounded-2xl border-2 bg-card p-4" style={{ borderColor: `color-mix(in srgb, ${color} 55%, var(--border))` }}>
      {post.image_url && <img src={post.image_url} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" loading="lazy" />}
      <div className="min-w-0 flex-1 basis-64">
        <p className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white" style={{ background: color }}>
            {TYPE_LABEL[post.type]}
          </span>
          {post.hidden && <Badge tone="bad">Oculta</Badge>}
          {post.pinned && <Badge tone="info">Fixada</Badge>}
          {post.reports_pending > 0 && <Badge tone="warn">{post.reports_pending} denúncia{post.reports_pending > 1 ? "s" : ""}</Badge>}
          <span className="text-muted-foreground">
            por <b className="font-semibold text-foreground">{post.author_name}</b> (@{post.author_username}) · {dateTime(post.created_at)}
          </span>
        </p>
        {post.title && <p className="mt-1 font-display text-sm font-bold text-foreground">{post.title}</p>}
        <p className="mt-0.5 line-clamp-3 text-sm text-muted-foreground">{post.body}</p>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {post.reactions} reações · {post.comments} comentários
        </p>
      </div>
      <div className="flex flex-wrap items-start gap-2">
        <Link to="/explorar" search={{ post: post.id }} className={btnCls} title="Abrir a publicação">
          <ExternalLink className="h-3.5 w-3.5" /> Ver
        </Link>
        <button type="button" disabled={hide.isPending} onClick={() => hide.mutate({ post: post.id, hidden: !post.hidden })} className={btnCls}>
          {post.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          {post.hidden ? "Restaurar" : "Ocultar"}
        </button>
        <button type="button" disabled={pin.isPending} onClick={() => pin.mutate({ post: post.id, pinned: !post.pinned })} className={btnCls}>
          {post.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
          {post.pinned ? "Desafixar" : "Fixar"}
        </button>
        <button type="button" onClick={() => onDelete(post)} className={btnDanger}>
          <Trash2 className="h-3.5 w-3.5" /> Apagar
        </button>
      </div>
    </li>
  );
}

export function PostsSection() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("todos");
  const [offset, setOffset] = useState(0);
  const q = useDebounced(query);
  const posts = useAdminPosts({ query: q, status, offset, limit: PAGE });
  const list = posts.data ?? [];
  const [toDelete, setToDelete] = useState<AdminPost | null>(null);
  const del = useAdminAction(adminActions.deletePost, "Publicação apagada.");

  return (
    <Panel title="Publicações" hint="Todas as publicações da rede, incluindo as ocultas. Ocultar mantém o registro; apagar remove de vez.">
      <div className="flex flex-wrap items-center gap-3">
        <SearchBox value={query} onChange={(v) => { setQuery(v); setOffset(0); }} placeholder="Texto, título ou autor…" />
        <div className="no-scrollbar flex max-w-full gap-1.5 overflow-x-auto">
          {(
            [
              ["todos", "Todas"],
              ["denunciados", "Denunciadas"],
              ["ocultos", "Ocultas"],
              ["fixados", "Fixadas"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={status === id}
              onClick={() => { setStatus(id); setOffset(0); }}
              className={`shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                status === id ? "border-accent bg-accent-soft text-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        {posts.error ? (
          <QueryError error={posts.error} />
        ) : posts.isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : list.length === 0 ? (
          <Empty>Nenhuma publicação encontrada.</Empty>
        ) : (
          <ul className="space-y-3">
            {list.map((p) => (
              <PostRow key={p.id} post={p} onDelete={setToDelete} />
            ))}
          </ul>
        )}
        <Pagination offset={offset} limit={PAGE} total={list[0]?.total ?? 0} onChange={setOffset} />
      </div>
      <ConfirmDialog
        open={!!toDelete}
        title="Apagar esta publicação?"
        description="Isso remove a publicação, as reações e os comentários. Não dá para desfazer."
        confirmLabel="Apagar"
        danger
        busy={del.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && del.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
      />
    </Panel>
  );
}

// ── Temas da semana ──────────────────────────────────────────────────────────

const STATUS_LABEL = { previa: "Prévia", ativo: "Ativo", encerrado: "Encerrado" } as const;
const STATUS_TONE = { previa: "info", ativo: "good", encerrado: "default" } as const;

interface ThemeForm {
  id?: string;
  week_start: string;
  status: ThemeRow["status"];
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  question: string;
  poll_question: string;
}

const emptyTheme = (): ThemeForm => {
  // Próximo domingo.
  const d = new Date();
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
  return { week_start: d.toISOString().slice(0, 10), status: "previa", title: "", subtitle: "", badge: "", description: "", question: "", poll_question: "" };
};

export function ThemesSection() {
  const themes = useThemes();
  const [form, setForm] = useState<ThemeForm | null>(null);
  const save = useAdminAction(async (f: ThemeForm) => {
    if (new Date(f.week_start + "T12:00:00").getDay() !== 0) throw new Error("A semana precisa começar num domingo.");
    if (f.title.trim().length < 3 || f.description.trim().length < 10) throw new Error("Preencha o título e a descrição.");
    const { data: me } = await supabase.auth.getUser();
    // Só um tema pode estar ativo por vez: o anterior é encerrado.
    if (f.status === "ativo") {
      const q = supabase.from("weekly_themes").update({ status: "encerrado" }).eq("status", "ativo");
      const { error } = f.id ? await q.neq("id", f.id) : await q;
      if (error) throw new Error(error.message);
    }
    const row = {
      week_start: f.week_start,
      status: f.status,
      title: f.title.trim(),
      subtitle: f.subtitle.trim() || null,
      badge: f.badge.trim() || null,
      description: f.description.trim(),
      question: f.question.trim() || null,
      poll_question: f.poll_question.trim() || null,
      edited_by: me.user?.id ?? null,
      edited_at: new Date().toISOString(),
      ...(f.status === "ativo" ? { activated_at: new Date().toISOString() } : {}),
    };
    const res = f.id
      ? await supabase.from("weekly_themes").update(row).eq("id", f.id)
      : await supabase.from("weekly_themes").insert({ ...row, source: "admin" });
    if (res.error) throw new Error(res.error.code === "23505" ? "Já existe um tema para essa semana." : res.error.message);
    void adminActions.log(f.id ? "tema_editado" : "tema_criado", "theme", f.id ?? f.week_start, { title: f.title, status: f.status });
    setForm(null);
  }, "Tema salvo.");

  const edit = (t: ThemeRow) =>
    setForm({
      id: t.id,
      week_start: t.week_start,
      status: t.status,
      title: t.title,
      subtitle: t.subtitle ?? "",
      badge: t.badge ?? "",
      description: t.description,
      question: t.question ?? "",
      poll_question: t.poll_question ?? "",
    });

  const field = (label: string, node: React.ReactNode, wide = false) => (
    <label className={`block space-y-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {node}
    </label>
  );

  return (
    <div className="space-y-4">
      <Panel
        title="Temas da semana"
        hint="O tema ativo aparece para todos; a prévia aparece só para profissionais. As traduções existentes não são alteradas."
        action={
          <button type="button" className={btnPrimary} onClick={() => setForm(emptyTheme())}>
            <Plus className="h-3.5 w-3.5" /> Novo tema
          </button>
        }
      >
        {form && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate(form);
            }}
            className="mb-5 grid gap-3 rounded-2xl border border-accent/40 bg-accent-soft/30 p-4 sm:grid-cols-2"
          >
            {field("Semana (domingo)", <input type="date" required value={form.week_start} onChange={(e) => setForm({ ...form, week_start: e.target.value })} className={inputCls} />)}
            {field(
              "Situação",
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ThemeRow["status"] })} className={inputCls}>
                {(Object.keys(STATUS_LABEL) as ThemeRow["status"][]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>,
            )}
            {field("Título", <input required maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />, true)}
            {field("Subtítulo", <input maxLength={160} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={inputCls} />)}
            {field("Selo", <input maxLength={40} value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className={inputCls} />)}
            {field("Descrição", <textarea required rows={4} maxLength={1200} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-y`} />, true)}
            {field("Pergunta da semana", <input maxLength={240} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className={inputCls} />, true)}
            {field("Pergunta da enquete", <input maxLength={240} value={form.poll_question} onChange={(e) => setForm({ ...form, poll_question: e.target.value })} className={inputCls} />, true)}
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button type="button" onClick={() => setForm(null)} className={btnCls}>
                Cancelar
              </button>
              <button type="submit" disabled={save.isPending} className={btnPrimary}>
                {save.isPending ? "Salvando…" : "Salvar tema"}
              </button>
            </div>
          </form>
        )}

        {themes.error ? (
          <QueryError error={themes.error} />
        ) : themes.isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (themes.data ?? []).length === 0 ? (
          <Empty>Nenhum tema ainda.</Empty>
        ) : (
          <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70">
            {(themes.data ?? []).map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-3 bg-card px-4 py-3">
                <div className="min-w-0 flex-1 basis-60">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                    {t.title} <Badge tone={STATUS_TONE[t.status]}>{STATUS_LABEL[t.status]}</Badge>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Semana de {shortDate(t.week_start)} · origem: {t.source}
                  </p>
                </div>
                <button type="button" onClick={() => edit(t)} className={btnCls}>
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

// ── Anúncios ─────────────────────────────────────────────────────────────────

const LEVELS = { info: "Informação", aviso: "Aviso", sucesso: "Novidade" } as const;
const toLocal = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date(iso).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

export function AnnouncementsSection() {
  const list = useAnnouncements();
  const [form, setForm] = useState<(Partial<Announcement> & { title: string }) | null>(null);
  const [toDelete, setToDelete] = useState<Announcement | null>(null);
  const save = useAdminAction(async (a: Partial<Announcement> & { title: string }) => {
    await adminActions.saveAnnouncement(a);
    setForm(null);
  }, "Anúncio salvo.");
  const del = useAdminAction(adminActions.deleteAnnouncement, "Anúncio apagado.");
  const toggle = useAdminAction((a: Announcement) => adminActions.saveAnnouncement({ ...a, active: !a.active }));

  return (
    <Panel
      title="Anúncios"
      hint="Avisos que aparecem no topo do site para todas as pessoas logadas. Use para manutenção, novidades ou comunicados."
      action={
        <button type="button" className={btnPrimary} onClick={() => setForm({ title: "", body: "", level: "info", active: true })}>
          <Plus className="h-3.5 w-3.5" /> Novo anúncio
        </button>
      }
    >
      {form && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(form);
          }}
          className="mb-5 grid gap-3 rounded-2xl border border-accent/40 bg-accent-soft/30 p-4 sm:grid-cols-2"
        >
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-xs font-semibold text-foreground">Título</span>
            <input required maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
          </label>
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-xs font-semibold text-foreground">Texto (opcional)</span>
            <textarea rows={3} maxLength={600} value={form.body ?? ""} onChange={(e) => setForm({ ...form, body: e.target.value })} className={`${inputCls} resize-none`} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-foreground">Tipo</span>
            <select value={form.level ?? "info"} onChange={(e) => setForm({ ...form, level: e.target.value as Announcement["level"] })} className={inputCls}>
              {(Object.keys(LEVELS) as Announcement["level"][]).map((l) => (
                <option key={l} value={l}>
                  {LEVELS[l]}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-foreground">Link (opcional)</span>
            <input value={form.link_url ?? ""} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="https://… ou /pagina" className={inputCls} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-foreground">Começa em (opcional)</span>
            <input type="datetime-local" value={toLocal(form.starts_at ?? null)} onChange={(e) => setForm({ ...form, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })} className={inputCls} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-foreground">Termina em (opcional)</span>
            <input type="datetime-local" value={toLocal(form.ends_at ?? null)} onChange={(e) => setForm({ ...form, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })} className={inputCls} />
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
            <input type="checkbox" checked={form.active ?? true} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 accent-[var(--color-accent)]" />
            Publicado (visível dentro do período)
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" onClick={() => setForm(null)} className={btnCls}>
              Cancelar
            </button>
            <button type="submit" disabled={save.isPending} className={btnPrimary}>
              {save.isPending ? "Salvando…" : "Salvar anúncio"}
            </button>
          </div>
        </form>
      )}

      {list.error ? (
        <QueryError error={list.error} />
      ) : list.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : (list.data ?? []).length === 0 ? (
        <Empty>Nenhum anúncio criado.</Empty>
      ) : (
        <ul className="space-y-2">
          {(list.data ?? []).map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3">
              <div className="min-w-0 flex-1 basis-60">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                  {a.title}
                  <Badge tone={a.level === "aviso" ? "warn" : a.level === "sucesso" ? "good" : "info"}>{LEVELS[a.level]}</Badge>
                  <Badge tone={a.active ? "good" : "default"}>{a.active ? "Publicado" : "Rascunho"}</Badge>
                </p>
                {a.body && <p className="line-clamp-2 text-xs text-muted-foreground">{a.body}</p>}
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {a.starts_at ? `de ${dateTime(a.starts_at)} ` : ""}
                  {a.ends_at ? `até ${dateTime(a.ends_at)}` : "sem data para terminar"}
                </p>
              </div>
              <button type="button" onClick={() => toggle.mutate(a)} className={btnCls}>
                {a.active ? "Despublicar" : "Publicar"}
              </button>
              <button type="button" onClick={() => setForm(a)} className={btnCls}>
                <Pencil className="h-3.5 w-3.5" /> Editar
              </button>
              <button type="button" onClick={() => setToDelete(a)} className={btnDanger} aria-label="Apagar anúncio">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={!!toDelete}
        title="Apagar este anúncio?"
        confirmLabel="Apagar"
        danger
        busy={del.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && del.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}
      />
    </Panel>
  );
}

void toast;

// O que a IA barrou antes de publicar: conteúdo, foto, motivo e quem tentou. O administrador mantém a
// decisão ou libera (a IA errou: a publicação/comentário vai ao ar em nome da pessoa).
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bot, CalendarDays, Check, ImageOff, Send, ShieldBan } from "lucide-react";
import {
  Badge,
  Empty,
  Pagination,
  Panel,
  QueryError,
  SearchBox,
  StatCard,
  btnCls,
  btnPrimary,
  dateTime,
  useDebounced,
} from "@/components/admin/admin-ui";
import { adminRpc, useAdminAction } from "@/lib/admin-api";
import { supabase } from "@/integrations/supabase/client";

const PAGE = 20;
const BUCKET = "ai-rejections";

export const CODE_LABEL: Record<string, string> = {
  fora_do_tema: "Fora do tema",
  imagem_fora_do_tema: "Foto fora do tema",
  imagem_nao_combina: "Foto não combina",
  spam: "Spam",
  desinformacao: "Desinformação",
  ofensivo: "Ofensivo",
  assedio: "Assédio",
  inadequado: "Inadequado",
};

const STATUS = [
  { id: "pendente", label: "A revisar" },
  { id: "mantida", label: "Mantidos" },
  { id: "liberada", label: "Liberados" },
  { id: "", label: "Todos" },
] as const;

interface Rejection {
  id: string;
  user_id: string;
  user_name: string;
  user_username: string;
  kind: "post" | "comment";
  post_id: string | null;
  title: string | null;
  body: string;
  tags: string[];
  recipe: unknown;
  context: { type?: string; communityId?: string };
  community_name: string | null;
  image_path: string | null;
  code: string;
  message: string;
  status: "pendente" | "mantida" | "liberada";
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  published_id: string | null;
  created_at: string;
  user_rejections_30d: number;
  total: number;
}

interface Summary {
  pending: number;
  today: number;
  last_7d: number;
  by_code: Record<string, number>;
}

export function useAiRejectionsSummary() {
  return useQuery({
    queryKey: ["admin", "ai-rejections", "summary"],
    queryFn: async () => (await adminRpc<Summary[]>("admin_ai_rejections_summary"))[0] ?? null,
    retry: false,
  });
}

/** Foto barrada: bucket privado, aberto com link assinado de 10 minutos. */
function RejectedImage({ path }: { path: string }) {
  const url = useQuery({
    queryKey: ["admin", "ai-rejections", "img", path],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 600);
      if (error) throw error;
      return data.signedUrl;
    },
    staleTime: 5 * 60_000,
  });
  if (url.isError)
    return (
      <span className="grid h-28 w-28 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground">
        <ImageOff className="h-5 w-5" />
      </span>
    );
  return url.data ? (
    <a href={url.data} target="_blank" rel="noreferrer" className="shrink-0">
      <img src={url.data} alt="Foto barrada" className="h-28 w-28 rounded-xl object-cover" />
    </a>
  ) : (
    <span className="h-28 w-28 shrink-0 animate-pulse rounded-xl bg-secondary" />
  );
}

/** Liberar: copia a foto para o bucket público (na pasta do administrador) e publica em nome da pessoa. */
async function release(r: Rejection) {
  let imageUrl: string | null = null;
  if (r.kind === "post" && r.image_path) {
    const { data: blob, error } = await supabase.storage.from(BUCKET).download(r.image_path);
    if (error) throw new Error(`Não foi possível abrir a foto: ${error.message}`);
    const { data: auth } = await supabase.auth.getUser();
    const ext = r.image_path.split(".").pop() ?? "jpg";
    const dest = `${auth.user?.id}/${crypto.randomUUID()}.${ext}`;
    const up = await supabase.storage
      .from("post-images")
      .upload(dest, blob, { contentType: blob.type || "image/jpeg", upsert: false });
    if (up.error) throw new Error(`Não foi possível copiar a foto: ${up.error.message}`);
    imageUrl = supabase.storage.from("post-images").getPublicUrl(dest).data.publicUrl;
  }
  return adminRpc("admin_ai_rejection_decide", {
    p_id: r.id,
    p_release: true,
    p_image_url: imageUrl,
  });
}

function RejectionRow({ r }: { r: Rejection }) {
  const keep = useAdminAction(
    () => adminRpc("admin_ai_rejection_decide", { p_id: r.id, p_release: false }),
    "Decisão da IA mantida.",
  );
  const free = useAdminAction(() => release(r), "Conteúdo liberado e publicado.");
  const busy = keep.isPending || free.isPending;

  return (
    <li className="flex flex-wrap gap-4 rounded-2xl border border-border bg-card p-4">
      {r.image_path && <RejectedImage path={r.image_path} />}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge tone="bad">{CODE_LABEL[r.code] ?? r.code}</Badge>
          <Badge>{r.kind === "post" ? "Publicação" : "Comentário"}</Badge>
          {r.context?.type && <Badge>{r.context.type}</Badge>}
          {r.community_name && <Badge tone="info">{r.community_name}</Badge>}
          {r.status === "mantida" && <Badge tone="warn">Mantido</Badge>}
          {r.status === "liberada" && <Badge tone="good">Liberado</Badge>}
          <span className="text-muted-foreground">{dateTime(r.created_at)}</span>
        </div>
        <p className="text-sm">
          <strong>{r.user_name}</strong>{" "}
          <span className="text-muted-foreground">@{r.user_username}</span>
          {r.user_rejections_30d > 2 && (
            <span className="ml-2 text-xs font-semibold text-rose-600">
              {r.user_rejections_30d} barrados nos últimos 30 dias
            </span>
          )}
        </p>
        {r.title && <p className="font-semibold">{r.title}</p>}
        {r.body && <p className="whitespace-pre-wrap text-sm text-foreground/90">{r.body}</p>}
        {r.tags.length > 0 && (
          <p className="text-xs text-muted-foreground">{r.tags.map((t) => `#${t}`).join(" ")}</p>
        )}
        {r.recipe != null && <p className="text-xs text-muted-foreground">Inclui uma receita.</p>}
        <p className="rounded-xl bg-secondary/60 px-3 py-2 text-xs">
          <span className="font-semibold">O que a pessoa viu:</span> {r.message}
        </p>
        {r.status !== "pendente" && r.reviewed_by_name && (
          <p className="text-xs text-muted-foreground">
            Revisado por {r.reviewed_by_name} em {dateTime(r.reviewed_at)}
          </p>
        )}
        {r.status === "pendente" && (
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              className={btnCls}
              disabled={busy}
              onClick={() => keep.mutate(undefined)}
            >
              <Check className="h-3.5 w-3.5" /> A IA acertou
            </button>
            <button
              type="button"
              className={btnPrimary}
              disabled={busy}
              onClick={() => {
                if (
                  window.confirm(
                    r.kind === "post"
                      ? "Publicar este conteúdo em nome da pessoa? Ela será avisada."
                      : "Publicar este comentário em nome da pessoa? Ela será avisada.",
                  )
                )
                  free.mutate(undefined);
              }}
            >
              <Send className="h-3.5 w-3.5" /> Liberar e publicar
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

export function AiRejectionsSection() {
  const [status, setStatus] = useState<string>("pendente");
  const [code, setCode] = useState<string>("");
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const q = useDebounced(query);
  const summary = useAiRejectionsSummary();
  const list = useQuery({
    queryKey: ["admin", "ai-rejections", status, code, q, offset],
    queryFn: () =>
      adminRpc<Rejection[]>("admin_ai_rejections", {
        p_status: status || null,
        p_code: code || null,
        p_search: q,
        p_limit: PAGE,
        p_offset: offset,
      }),
  });
  const rows = list.data ?? [];
  const s = summary.data;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="A revisar"
          value={s?.pending ?? "–"}
          icon={Bot}
          tone={s?.pending ? "alert" : "default"}
        />
        <StatCard label="Barrados hoje" value={s?.today ?? "–"} icon={ShieldBan} />
        <StatCard label="Últimos 7 dias" value={s?.last_7d ?? "–"} icon={CalendarDays} />
      </div>

      <Panel
        title="Barrados pela IA"
        hint="Publicações e comentários que a IA reprovou antes de irem ao ar. O conteúdo fica guardado por 30 dias só para esta revisão."
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {STATUS.map((o) => (
            <button
              key={o.id}
              type="button"
              aria-pressed={status === o.id}
              className={status === o.id ? btnPrimary : btnCls}
              onClick={() => {
                setStatus(o.id);
                setOffset(0);
              }}
            >
              {o.label}
            </button>
          ))}
          <select
            className="rounded-full border border-border bg-card px-3 py-2 text-xs"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setOffset(0);
            }}
            aria-label="Motivo"
          >
            <option value="">Todos os motivos</option>
            {Object.entries(CODE_LABEL).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
                {s?.by_code?.[id] ? ` (${s.by_code[id]})` : ""}
              </option>
            ))}
          </select>
          <div className="min-w-[14rem] flex-1">
            <SearchBox
              value={query}
              onChange={(v) => {
                setQuery(v);
                setOffset(0);
              }}
              placeholder="Buscar por texto ou pessoa"
            />
          </div>
        </div>

        <QueryError error={list.error ?? summary.error} />
        {list.isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : rows.length === 0 ? (
          <Empty icon={Bot}>Nada por aqui.</Empty>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => (
              <RejectionRow key={r.id} r={r} />
            ))}
          </ul>
        )}
        <Pagination offset={offset} limit={PAGE} total={rows[0]?.total ?? 0} onChange={setOffset} />
      </Panel>
    </div>
  );
}

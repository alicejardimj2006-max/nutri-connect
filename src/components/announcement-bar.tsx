// Avisos da administração (anúncios) e aviso de conta suspensa. Aparecem como cartões flutuantes no
// canto da tela (sem empurrar o conteúdo, porque várias páginas têm a altura exata da tela).
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

interface Announcement {
  id: string;
  title: string;
  body: string;
  level: "info" | "aviso" | "sucesso";
  link_url: string | null;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

const KEY = "nutriconnect_dismissed_announcements";

function readDismissed(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

const STYLE = {
  info: { icon: Info, color: "#3b7bbf" },
  aviso: { icon: AlertTriangle, color: "#c58a12" },
  sucesso: { icon: CheckCircle2, color: "#4f8a4b" },
} as const;

export function AnnouncementBar() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState<string[]>([]);
  useEffect(() => setDismissed(readDismissed()), []);

  const list = useQuery({
    queryKey: ["announcements", user?.id],
    enabled: !!user,
    staleTime: 5 * 60_000,
    retry: false,
    queryFn: async () => {
      const res = await supabase
        .from("announcements" as never)
        .select("id, title, body, level, link_url, active, starts_at, ends_at")
        .order("created_at", { ascending: false })
        .limit(10);
      // Antes da migration a tabela não existe: sem avisos, sem erro.
      if (res.error) return [] as Announcement[];
      return (res.data ?? []) as unknown as Announcement[];
    },
  });

  if (!user) return null;
  const now = Date.now();
  const visible = (list.data ?? []).filter(
    (a) =>
      a.active &&
      !dismissed.includes(a.id) &&
      (!a.starts_at || new Date(a.starts_at).getTime() <= now) &&
      (!a.ends_at || new Date(a.ends_at).getTime() > now),
  );
  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next.slice(-50)));
    } catch {
      /* sem armazenamento: some só até recarregar */
    }
  };

  if (!user.suspendedAt && visible.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-20 z-[60] flex flex-col items-end gap-2 lg:inset-x-auto lg:bottom-5 lg:right-5 lg:w-96">
      {user.suspendedAt && (
        <div className="pointer-events-auto w-full rounded-2xl border-2 border-destructive bg-card p-4 shadow-card">
          <p className="flex items-center gap-2 text-sm font-bold text-destructive">
            <ShieldAlert className="h-4 w-4" /> Sua conta está suspensa
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Você pode ler o conteúdo, mas não pode publicar nem comentar. Se acha que foi um engano,{" "}
            <Link to="/contato" className="font-semibold text-accent underline-offset-2 hover:underline">
              fale com a equipe
            </Link>
            .
          </p>
        </div>
      )}
      {visible.slice(0, 2).map((a) => {
        const s = STYLE[a.level] ?? STYLE.info;
        const body = (
          <>
            <p className="text-sm font-bold text-foreground">{a.title}</p>
            {a.body && <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{a.body}</p>}
          </>
        );
        return (
          <div
            key={a.id}
            className="pointer-events-auto flex w-full items-start gap-3 rounded-2xl border-2 bg-card p-4 shadow-card"
            style={{ borderColor: s.color }}
          >
            <s.icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: s.color }} />
            <div className="min-w-0 flex-1">
              {a.link_url ? (
                a.link_url.startsWith("/") ? (
                  <Link to={a.link_url as never} className="block hover:opacity-80">
                    {body}
                  </Link>
                ) : (
                  <a href={a.link_url} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80">
                    {body}
                  </a>
                )
              ) : (
                body
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(a.id)}
              className="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label="Dispensar aviso"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Send, Trash2 } from "lucide-react";
import { AuthGateLoading, SiteHeader } from "@/components/site-chrome";
import { Mascot } from "@/components/mascots";
import { useRequireAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { supabase } from "@/integrations/supabase/client";
import { NINA_DAILY_LIMIT, askNutriAssistant } from "@/lib/nutri-assistant.functions";

export const Route = createFileRoute("/nina")({
  head: () => ({
    meta: [
      { title: "Nina — NutriConnect" },
      {
        name: "description",
        content: "Converse com a Nina, a assistente de educação alimentar do NutriConnect.",
      },
    ],
  }),
  component: NinaPage,
});

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function NinaPage() {
  const { user, hydrated } = useRequireAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const historyKey = ["nina-history", user?.id];
  const [draft, setDraft] = useState("");

  // As perguntas prontas dos cards laterais preenchem o campo de texto.
  useEffect(() => {
    const onPrompt = (e: Event) => setDraft(String((e as CustomEvent<string>).detail ?? ""));
    window.addEventListener("nina:prompt", onPrompt);
    return () => window.removeEventListener("nina:prompt", onPrompt);
  }, []);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [used, setUsed] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const history = useQuery({
    queryKey: historyKey,
    enabled: !!user,
    queryFn: async (): Promise<ChatMessage[]> => {
      const { data, error: err } = await supabase
        .from("nina_messages")
        .select("id, role, content")
        .order("created_at", { ascending: false })
        .limit(100);
      if (err) throw err;
      return (data ?? []).reverse() as ChatMessage[];
    },
  });

  useEffect(() => {
    if (!user) return;
    supabase.rpc("ai_usage_today", { p_kind: "nina" }).then(({ data }) => setUsed(data ?? 0));
  }, [user]);

  const messages = history.data ?? [];
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, pending, sending]);

  if (!hydrated || !user) return <AuthGateLoading />;

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setDraft("");
    setError(null);
    setPending(text);
    setSending(true);
    try {
      const res = await askNutriAssistant({ data: { message: text } });
      if (res.used !== undefined) setUsed(res.used);
      if ("error" in res) {
        setError(res.error);
        setDraft(text);
      } else {
        await queryClient.invalidateQueries({ queryKey: historyKey });
      }
    } catch (err) {
      console.error("nina", err);
      // Em desenvolvimento, mostra o motivo real para facilitar o diagnóstico.
      const detail = import.meta.env.DEV && err instanceof Error ? ` (${err.message})` : "";
      setError(t("nina.error") + detail);
      setDraft(text);
    } finally {
      setPending(null);
      setSending(false);
    }
  };

  const clear = async () => {
    if (!window.confirm(t("nina.clearConfirm"))) return;
    await supabase.from("nina_messages").delete().eq("user_id", user.id);
    await queryClient.invalidateQueries({ queryKey: historyKey });
  };

  const bubble = (m: { role: "user" | "assistant"; content: string }, key: string) => (
    <div key={key} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
      <p
        className={
          m.role === "user"
            ? "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-sm text-accent-foreground"
            : "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-secondary px-4 py-2.5 text-sm text-foreground"
        }
      >
        {m.content}
      </p>
    </div>
  );

  return (
    // Altura da tela: a página não rola; só a conversa rola por dentro.
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-4 pb-24 pt-6 sm:px-6 lg:pb-6">
        <div className="mb-4 flex shrink-0 items-center gap-4">
          <Mascot id="nina" mood={sending ? "talk" : "idle"} size={72} />
          <div className="min-w-0 flex-1">
            <h1 className="sr-only">{t("nina.title")}</h1>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <Trash2 className="h-3.5 w-3.5" /> {t("nina.clear")}
            </button>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain rounded-2xl border border-border/70 bg-card p-4">
          {history.isLoading && (
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
          )}
          {!history.isLoading && messages.length === 0 && !pending && (
            <p className="m-auto max-w-sm text-center text-sm text-muted-foreground">
              {t("nina.empty")}
            </p>
          )}
          {messages.map((m) => bubble(m, m.id))}
          {pending && bubble({ role: "user", content: pending }, "pending")}
          {sending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <div ref={bottomRef} />
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <form onSubmit={send} className="mt-3 flex shrink-0 items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            rows={2}
            maxLength={2000}
            placeholder={t("nina.placeholder")}
            className="min-h-[3rem] flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            aria-label={t("nina.send")}
            className="grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground shadow-soft transition hover:bg-accent/90 disabled:pointer-events-none disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>

        <p className="mt-3 shrink-0 text-xs text-muted-foreground">
          {used !== null && (
            <span className="mr-2 font-semibold">
              {used}/{NINA_DAILY_LIMIT} {t("nina.usage")}
            </span>
          )}
          {t("nina.disclaimer")}
        </p>
      </main>
    </div>
  );
}

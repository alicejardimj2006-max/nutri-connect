import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCheck,
  FileText,
  Loader2,
  MessageCircle,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as care from "@/lib/clinical/care";
import { qk, useClinicalMutation, useMessages, useSignedUrls } from "@/lib/clinical/queries";
import { formatDate, formatTime, isSameDay } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { cn } from "@/lib/utils";
import { EmptyState, Loading, buttonGhost, inputClass } from "./ui";

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

export function ChatThread({
  patientId,
  professionalId,
  meId,
  canSend,
  className,
}: {
  patientId: string;
  professionalId: string;
  meId: string;
  canSend: boolean;
  className?: string;
}) {
  const { t, locale } = useClinicalI18n();
  const qc = useQueryClient();
  const messages = useMessages(patientId, professionalId);
  const list = useMemo(() => messages.data ?? [], [messages.data]);
  const attachments = useSignedUrls(
    "chat-attachments",
    list.map((m) => m.attachment_path),
  );
  const bottom = useRef<HTMLDivElement>(null);
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const send = useClinicalMutation(
    () => care.sendMessage({ patientId, professionalId, body, file }),
    {
      invalidate: [qk.messages(patientId, professionalId), qk.conversations()],
      onSuccess: () => {
        setBody("");
        setFile(null);
      },
    },
  );

  // Rola para a última mensagem e marca como lidas as recebidas.
  const unread = list.some((m) => !m.read_at && m.sender_id !== meId);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [list.length]);
  useEffect(() => {
    if (!unread) return;
    void care
      .markConversationRead(patientId, professionalId)
      .then(() => qc.invalidateQueries({ queryKey: qk.conversations() }));
  }, [unread, patientId, professionalId, qc]);

  const submit = () => {
    if ((!body.trim() && !file) || send.isPending) return;
    send.mutate(undefined);
  };

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4" aria-live="polite">
        {messages.isLoading ? (
          <Loading />
        ) : list.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title={t("chat.empty")}
            text={canSend ? t("chat.emptyText") : undefined}
          />
        ) : (
          list.map((m, i) => {
            const mine = m.sender_id === meId;
            const newDay =
              i === 0 || !isSameDay(new Date(list[i - 1].created_at), new Date(m.created_at));
            const url = m.attachment_path ? attachments.data?.[m.attachment_path] : undefined;
            const isImage = !!m.attachment_path && IMAGE_EXT.test(m.attachment_path);
            return (
              <div key={m.id}>
                {newDay && (
                  <p className="my-3 text-center text-[11px] font-medium text-muted-foreground">
                    {formatDate(m.created_at, locale, {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                )}
                <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-xs",
                      mine
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md bg-secondary text-foreground",
                    )}
                  >
                    {m.attachment_path &&
                      (isImage ? (
                        url ? (
                          <a href={url} target="_blank" rel="noreferrer">
                            <img
                              src={url}
                              alt={m.attachment_name ?? ""}
                              className="mb-1 max-h-60 rounded-xl object-cover"
                            />
                          </a>
                        ) : (
                          <div className="mb-1 h-32 w-48 animate-pulse rounded-xl bg-background/30" />
                        )
                      ) : (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(
                            "mb-1 flex items-center gap-2 rounded-xl px-2 py-1.5 underline-offset-2 hover:underline",
                            mine ? "bg-primary-foreground/10" : "bg-background",
                          )}
                        >
                          <FileText className="h-4 w-4 shrink-0" />
                          <span className="truncate">
                            {m.attachment_name ?? t("chat.attachment")}
                          </span>
                        </a>
                      ))}
                    {m.body && <p className="whitespace-pre-line break-words">{m.body}</p>}
                    <p
                      className={cn(
                        "mt-0.5 flex items-center justify-end gap-1 text-[10px]",
                        mine ? "text-primary-foreground/70" : "text-muted-foreground",
                      )}
                    >
                      {formatTime(m.created_at, locale)}
                      {mine &&
                        (m.read_at ? (
                          <CheckCheck className="h-3 w-3" aria-label={t("chat.read")} />
                        ) : (
                          <Check className="h-3 w-3" aria-label={t("chat.sent")} />
                        ))}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottom} />
      </div>

      {canSend ? (
        <div className="border-t border-border/60 p-3">
          {file && (
            <div className="mb-2 flex items-center gap-2 rounded-xl bg-secondary px-3 py-1.5 text-xs">
              <Paperclip className="h-3.5 w-3.5" />
              <span className="flex-1 truncate">{file.name}</span>
              <button type="button" aria-label={t("common.remove")} onClick={() => setFile(null)}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                if (f.size > care.MAX_UPLOAD_BYTES) return toast.error(t("errors.fileTooLarge"));
                setFile(f);
              }}
            />
            <button
              type="button"
              className={buttonGhost}
              aria-label={t("chat.attach")}
              title={t("chat.attach")}
              onClick={() => fileInput.current?.click()}
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <textarea
              rows={1}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder={t("chat.placeholder")}
              aria-label={t("chat.placeholder")}
              className={cn(inputClass, "max-h-32 min-h-10 resize-none")}
            />
            <button
              type="button"
              onClick={submit}
              disabled={(!body.trim() && !file) || send.isPending}
              aria-label={t("chat.send")}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground shadow-soft transition hover:bg-accent/90 disabled:opacity-50"
            >
              {send.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <p className="border-t border-border/60 p-3 text-center text-xs text-muted-foreground">
          {t("chat.readOnly")}
        </p>
      )}
    </div>
  );
}

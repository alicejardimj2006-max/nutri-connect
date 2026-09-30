import { useRef, useState } from "react";
import { FileImage, FileText, FolderOpen, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import * as care from "@/lib/clinical/care";
import type { DocumentKind, PatientDocument } from "@/lib/clinical/care";
import {
  qk,
  useClinicalMutation,
  useDocuments,
  usePeople,
  useSignedUrls,
} from "@/lib/clinical/queries";
import { formatDate, formatNumber, toDateKey } from "@/lib/clinical/format";
import { useClinicalI18n, type ClinicalKey } from "@/lib/clinical/i18n";
import {
  Card,
  EmptyState,
  Field,
  Loading,
  buttonGhost,
  buttonPrimary,
  buttonSecondary,
  inputClass,
} from "./ui";

const KINDS: DocumentKind[] = ["exame", "documento", "plano", "outro"];

function formatSize(bytes: number | null, locale: Parameters<typeof formatNumber>[1]) {
  if (!bytes) return "";
  return bytes > 1024 * 1024
    ? `${formatNumber(bytes / 1024 / 1024, locale)} MB`
    : `${formatNumber(bytes / 1024, locale, 0)} KB`;
}

export function DocumentsPanel({
  patientId,
  meId,
  canUpload,
}: {
  patientId: string;
  meId: string;
  canUpload: boolean;
}) {
  const { t, locale } = useClinicalI18n();
  const docs = useDocuments(patientId);
  const list = docs.data ?? [];
  const urls = useSignedUrls(
    "patient-files",
    list.map((d) => d.file_path),
  );
  const people = usePeople(list.map((d) => d.uploaded_by));
  const [open, setOpen] = useState(false);

  const remove = useClinicalMutation((d: PatientDocument) => care.deleteDocument(d), {
    success: t("docs.deleted"),
    invalidate: [qk.documents(patientId)],
  });

  return (
    <div className="space-y-4">
      {canUpload && !open && (
        <div className="flex justify-end">
          <button type="button" className={buttonPrimary} onClick={() => setOpen(true)}>
            <Upload className="h-4 w-4" /> {t("docs.upload")}
          </button>
        </div>
      )}
      {open && <UploadForm patientId={patientId} onClose={() => setOpen(false)} />}

      {docs.isLoading ? (
        <Loading />
      ) : list.length === 0 ? (
        !open && (
          <EmptyState
            icon={FolderOpen}
            title={t("docs.empty")}
            text={canUpload ? t("docs.emptyText") : undefined}
          />
        )
      ) : (
        <Card padded={false}>
          <ul className="divide-y divide-border/60">
            {list.map((d) => {
              const isImage = d.mime_type?.startsWith("image/");
              const Icon = isImage ? FileImage : FileText;
              const url = urls.data?.[d.file_path];
              const uploader =
                d.uploaded_by === meId ? t("docs.byYou") : people.data?.get(d.uploaded_by)?.name;
              return (
                <li key={d.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-sm font-semibold text-foreground hover:underline"
                    >
                      {d.title}
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {[
                        t(`docs.kind.${d.kind}` as ClinicalKey),
                        d.document_date && formatDate(d.document_date, locale),
                        uploader,
                        formatSize(d.size_bytes, locale),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {d.notes && <p className="mt-0.5 text-xs text-foreground">{d.notes}</p>}
                  </div>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonSecondary}
                    aria-disabled={!url}
                  >
                    {t("docs.open")}
                  </a>
                  {(d.uploaded_by === meId || d.patient_id === meId) && (
                    <button
                      type="button"
                      className={buttonGhost}
                      aria-label={t("common.remove")}
                      onClick={() => window.confirm(t("docs.deleteConfirm")) && remove.mutate(d)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

function UploadForm({ patientId, onClose }: { patientId: string; onClose: () => void }) {
  const { t } = useClinicalI18n();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<DocumentKind>("exame");
  const [date, setDate] = useState(toDateKey(new Date()));
  const [notes, setNotes] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const upload = useClinicalMutation(
    () =>
      care.uploadDocument({
        patientId,
        title: title || file!.name,
        kind,
        file: file!,
        documentDate: date,
        notes,
      }),
    { success: t("docs.uploaded"), invalidate: [qk.documents(patientId)], onSuccess: onClose },
  );

  return (
    <Card title={t("docs.upload")}>
      <div className="space-y-3">
        <input
          ref={input}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            if (f.size > care.MAX_UPLOAD_BYTES) return toast.error(t("errors.fileTooLarge"));
            setFile(f);
            if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
          }}
        />
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-6 text-sm text-muted-foreground transition hover:bg-secondary"
        >
          <Upload className="h-5 w-5" />
          {file ? file.name : t("docs.chooseFile")}
        </button>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label={t("docs.fileTitle")} className="sm:col-span-3">
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("docs.titlePlaceholder")}
            />
          </Field>
          <Field label={t("docs.kind")}>
            <select
              className={inputClass}
              value={kind}
              onChange={(e) => setKind(e.target.value as DocumentKind)}
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {t(`docs.kind.${k}` as ClinicalKey)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("docs.date")}>
            <input
              type="date"
              className={inputClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field label={t("docs.notes")} hint={t("common.optional")}>
            <input
              className={inputClass}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
        </div>
        <p className="text-xs text-muted-foreground">{t("docs.privacy")}</p>
        <div className="flex justify-end gap-2">
          <button type="button" className={buttonSecondary} onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button
            type="button"
            className={buttonPrimary}
            disabled={!file || upload.isPending}
            onClick={() => upload.mutate(undefined)}
          >
            {upload.isPending ? t("docs.uploading") : t("docs.send")}
          </button>
        </div>
      </div>
    </Card>
  );
}

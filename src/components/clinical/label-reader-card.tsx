// Leitor de rótulos com IA: foto do rótulo → a Nina explica o que observar (limite diário próprio).
import { Fragment, useRef, useState } from "react";
import { Camera, ScanLine, X } from "lucide-react";
import { useTr } from "@/components/appearance-editor";
import { Card, buttonGhost } from "./ui";
import { useI18n } from "@/hooks/use-i18n";
import { fileToDataUrl } from "@/lib/image";
import { LABEL_DAILY_LIMIT, readFoodLabel, type LabelError } from "@/lib/label-reader.functions";
import { cn } from "@/lib/utils";

/** Negrito com **texto**, preservando as quebras de linha da resposta. */
function Answer({ text }: { text: string }) {
  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-foreground">
      {text
        .split("\n")
        .map((line, i) =>
          line.trim() ? (
            <p key={i}>
              {line
                .split(/(\*\*[^*]+\*\*)/g)
                .map((part, j) =>
                  part.startsWith("**") && part.endsWith("**") ? (
                    <strong key={j}>{part.slice(2, -2)}</strong>
                  ) : (
                    <Fragment key={j}>{part}</Fragment>
                  ),
                )}
            </p>
          ) : null,
        )}
    </div>
  );
}

export function LabelReaderCard() {
  const tr = useTr();
  const { locale } = useI18n();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [used, setUsed] = useState<number | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const ERRORS: Record<LabelError, string> = {
    limit: tr([
      `Você chegou ao limite de ${LABEL_DAILY_LIMIT} leituras por hoje. Volte amanhã!`,
      `You reached the limit of ${LABEL_DAILY_LIMIT} scans for today. Come back tomorrow!`,
      `Llegaste al límite de ${LABEL_DAILY_LIMIT} lecturas por hoy. ¡Vuelve mañana!`,
      `Vous avez atteint la limite de ${LABEL_DAILY_LIMIT} lectures pour aujourd'hui. Revenez demain !`,
    ]),
    unavailable: tr([
      "A leitura de rótulos não está disponível no momento.",
      "Label reading is not available right now.",
      "La lectura de etiquetas no está disponible ahora.",
      "La lecture d'étiquettes n'est pas disponible pour le moment.",
    ]),
    image: tr([
      "Não deu para usar essa imagem. Tente outra foto.",
      "This image couldn't be used. Try another photo.",
      "No se pudo usar esta imagen. Prueba otra foto.",
      "Cette image n'a pas pu être utilisée. Essayez une autre photo.",
    ]),
    failed: tr([
      "A Nina não conseguiu ler o rótulo. Tente novamente.",
      "Nina couldn't read the label. Please try again.",
      "Nina no pudo leer la etiqueta. Inténtalo de nuevo.",
      "Nina n'a pas pu lire l'étiquette. Réessayez.",
    ]),
  };

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInput.current) fileInput.current.value = "";
    if (!file) return;
    setAnalyzing(true);
    setResult(null);
    setError(null);
    try {
      // Resolução suficiente para ler a letra miúda do rótulo.
      const dataUrl = await fileToDataUrl(file, 1400, 0.82);
      setPreview(dataUrl);
      const res = await readFoodLabel({ data: { image: dataUrl, locale } });
      if (res.used !== undefined) setUsed(res.used);
      if ("error" in res) setError(ERRORS[res.error]);
      else setResult(res.answer);
    } catch (err) {
      console.error("label reader", err);
      setError(err instanceof Error && err.message ? err.message : ERRORS.failed);
    } finally {
      setAnalyzing(false);
    }
  };

  const clear = () => {
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const pick = () => fileInput.current?.click();

  return (
    <Card
      className="relative overflow-hidden border-t-8 border-t-primary/80"
      title={
        <div className="flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-primary" />
          <span>
            {tr([
              "Leitor de rótulos",
              "Label reader",
              "Lector de etiquetas",
              "Lecteur d'étiquettes",
            ])}
          </span>
        </div>
      }
      action={
        (result || error) && (
          <button
            type="button"
            className={cn(buttonGhost, "h-8 px-2 text-xs text-muted-foreground")}
            onClick={clear}
            aria-label={tr(["Limpar", "Clear", "Limpiar", "Effacer"])}
          >
            <X className="h-4 w-4" />
          </button>
        )
      }
    >
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={handleCapture}
      />

      {!preview && !analyzing && (
        <div className="text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            {tr([
              "Fotografe a lista de ingredientes ou a tabela nutricional e a Nina explica o que observar.",
              "Take a photo of the ingredient list or nutrition facts and Nina explains what to look for.",
              "Fotografía la lista de ingredientes o la tabla nutricional y Nina te explica qué observar.",
              "Photographiez la liste des ingrédients ou le tableau nutritionnel et Nina explique quoi observer.",
            ])}
          </p>
          <button
            type="button"
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-bold text-primary-foreground shadow-soft transition hover:bg-primary/90"
            onClick={pick}
          >
            <Camera className="h-5 w-5" />
            {tr([
              "Fotografar rótulo",
              "Scan a label",
              "Fotografiar etiqueta",
              "Scanner une étiquette",
            ])}
          </button>
        </div>
      )}

      {analyzing && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
              <ScanLine className="h-8 w-8 animate-pulse" />
            </div>
          </div>
          <p className="font-semibold text-foreground">
            {tr([
              "A Nina está lendo o rótulo…",
              "Nina is reading the label…",
              "Nina está leyendo la etiqueta…",
              "Nina lit l'étiquette…",
            ])}
          </p>
        </div>
      )}

      {preview && !analyzing && (result || error) && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="mb-4 overflow-hidden rounded-xl bg-secondary">
            <img
              src={preview}
              alt={tr([
                "Rótulo fotografado",
                "Scanned label",
                "Etiqueta fotografiada",
                "Étiquette scannée",
              ])}
              className="h-32 w-full object-cover opacity-80"
            />
          </div>
          {result ? (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <Answer text={result} />
            </div>
          ) : (
            <p className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </p>
          )}
          <button
            type="button"
            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
            onClick={() => {
              clear();
              pick();
            }}
          >
            <Camera className="h-4 w-4" />
            {tr([
              "Ler outro rótulo",
              "Scan another label",
              "Leer otra etiqueta",
              "Lire une autre étiquette",
            ])}
          </button>
        </div>
      )}

      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        {used !== null &&
          `${used}/${LABEL_DAILY_LIMIT} ${tr(["hoje", "today", "hoy", "aujourd'hui"])} · `}
        {tr([
          "Conteúdo educativo; não substitui um(a) nutricionista.",
          "Educational content; not a substitute for a dietitian.",
          "Contenido educativo; no sustituye a un(a) nutricionista.",
          "Contenu éducatif ; ne remplace pas un(e) diététicien(ne).",
        ])}
      </p>
    </Card>
  );
}

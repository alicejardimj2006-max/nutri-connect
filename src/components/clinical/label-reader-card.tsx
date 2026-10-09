import { useRef, useState } from "react";
import { Camera, Loader2, ScanLine, X } from "lucide-react";
import { toast } from "sonner";
import { Card, buttonGhost } from "./ui";
import { askNutriAssistant } from "@/lib/nutri-assistant.functions";
import { supabase } from "@/integrations/supabase/client";
import { fileToDataUrl } from "@/lib/image";
import { cn } from "@/lib/utils";

export function LabelReaderCard() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setAnalyzing(true);
      setResult(null);
      const dataUrl = await fileToDataUrl(file, 400, 0.5);
      setImagePreview(dataUrl);

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          kind: "nina",
          system: "Você é a Nina, assistente de educação alimentar do NutriConnect. Seja direta e fácil de entender.",
          messages: [{ role: "user", content: "Analise este rótulo ou tabela nutricional. Me diga se é uma boa escolha de forma resumida e muito fácil de entender, e aponte se tem ingredientes escondidos (ex: muito açúcar ou conservantes ruins). Seja direto." }],
          image: dataUrl,
        },
      });

      if (error) {
        toast.error("Erro ao chamar a IA. Verifique sua conexão.");
        setImagePreview(null);
      } else if (data?.ok && data.text) {
        setResult(data.text);
      } else {
        toast.error(data?.status === 400 ? "A imagem é inválida ou muito grande." : "A IA não conseguiu responder no momento.");
        setImagePreview(null);
      }
    } catch (err) {
      console.error("Label reader error:", err);
      toast.error(err instanceof Error ? err.message : "Não foi possível ler a imagem.");
      setImagePreview(null);
    } finally {
      setAnalyzing(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const clear = () => {
    setImagePreview(null);
    setResult(null);
  };

  return (
    <Card
      className="relative overflow-hidden border-t-8 border-t-primary/80"
      title={
        <div className="flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-primary" />
          <span>Leitor de Rótulos com IA</span>
        </div>
      }
      action={
        result && (
          <button
            type="button"
            className={cn(buttonGhost, "h-8 px-2 text-xs text-muted-foreground")}
            onClick={clear}
          >
            <X className="h-4 w-4" />
          </button>
        )
      }
    >
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCapture}
      />

      {!imagePreview && !analyzing && (
        <div className="text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            Tire uma foto dos ingredientes ou tabela nutricional para saber se é uma boa escolha.
          </p>
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-bold text-primary-foreground shadow-soft transition hover:bg-primary/90"
            onClick={() => fileInput.current?.click()}
          >
            <Camera className="h-5 w-5" />
            Escanear Produto
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
          <p className="font-semibold text-foreground">A Nina está analisando...</p>
          <p className="text-xs text-muted-foreground">Lendo ingredientes e tabela nutricional</p>
        </div>
      )}

      {result && imagePreview && !analyzing && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="mb-4 overflow-hidden rounded-xl bg-secondary">
            <img 
              src={imagePreview} 
              alt="Rótulo escaneado" 
              className="h-32 w-full object-cover opacity-80"
            />
          </div>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <p className="whitespace-pre-wrap text-sm text-foreground">
              {result}
            </p>
          </div>
          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-secondary"
            onClick={() => {
              clear();
              fileInput.current?.click();
            }}
          >
            <Camera className="h-4 w-4" /> Escanear outro produto
          </button>
        </div>
      )}
    </Card>
  );
}

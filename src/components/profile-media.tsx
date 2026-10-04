// Troca de foto de perfil, capa e fotos dos blocos: escolhe o arquivo, edita (corte, filtros…) no
// mesmo editor das fotos de post e envia. A IA analisa ANTES de salvar: se reprovar, nada é
// gravado e a pessoa vê o motivo.
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ImageEditor } from "@/components/image-editor";
import { useTr } from "@/components/appearance-editor";
import { DEFAULT_EDITS } from "@/lib/image-edit";
import { ProfileRejectedError, uploadProfileImage } from "@/lib/profile-page";

export type MediaTarget = "avatar" | "banner" | "image";

const MAX_FILE = 12 * 1024 * 1024;

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Reduz a foto ao tamanho de uso (mantém o envio leve) e converte para JPEG. */
async function fit(dataUrl: string, target: MediaTarget): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = dataUrl;
  });
  const max = target === "avatar" ? 640 : 1920;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.88);
}

/**
 * Botão que abre a escolha de foto. `children` recebe `open` e `busy` para desenhar o gatilho que
 * quiser (botão, câmera sobre a foto…). `onDone` recebe o endereço da foto já aprovada e salva.
 */
export function MediaUpload({
  target,
  onDone,
  children,
}: {
  target: MediaTarget;
  onDone: (url: string) => void | Promise<void>;
  children: (open: () => void, busy: boolean) => ReactNode;
}) {
  const tr = useTr();
  const input = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      toast.error(tr(["Use uma imagem JPG, PNG ou WebP.", "Use a JPG, PNG or WebP image.", "Usa una imagen JPG, PNG o WebP.", "Utilisez une image JPG, PNG ou WebP."]));
      return;
    }
    if (file.size > MAX_FILE) {
      toast.error(tr(["A imagem é grande demais (máximo de 12 MB).", "The image is too large (12 MB max).", "La imagen es demasiado grande (máximo 12 MB).", "L'image est trop grande (12 Mo max)."]));
      return;
    }
    setSource(await readFile(file));
  };

  const send = async (edited: string) => {
    setSource(null);
    setBusy(true);
    try {
      const url = await uploadProfileImage(target, await fit(edited, target));
      await onDone(url);
      toast.success(tr(["Foto salva!", "Photo saved!", "¡Foto guardada!", "Photo enregistrée !"]));
    } catch (err) {
      if (err instanceof ProfileRejectedError) {
        toast.error(tr(["Foto não aprovada", "Photo not approved", "Foto no aprobada", "Photo non approuvée"]), {
          description: err.message,
          duration: 10000,
        });
      } else {
        toast.error(err instanceof Error ? err.message : tr(["Não foi possível enviar a foto.", "Could not upload the photo.", "No se pudo enviar la foto.", "Impossible d'envoyer la photo."]));
      }
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => void pick(e.target.files?.[0])}
      />
      {children(() => input.current?.click(), busy)}
      {source && (
        <ImageEditor
          open
          src={source}
          initial={
            target === "avatar"
              ? { ...DEFAULT_EDITS, aspect: "1:1" }
              : target === "banner"
                ? { ...DEFAULT_EDITS, aspect: "free", customRatio: 3.2 }
                : undefined
          }
          onCancel={() => {
            setSource(null);
            if (input.current) input.current.value = "";
          }}
          onApply={(dataUrl) => void send(dataUrl)}
        />
      )}
    </>
  );
}

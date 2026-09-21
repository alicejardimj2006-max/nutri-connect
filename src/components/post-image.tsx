import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/** Altura máxima da foto no post (deixa espaço para parte do texto no card não expandido). */
const MAX_HEIGHT = "clamp(10rem, calc(100dvh - 32rem), 26rem)";

interface PostImageProps {
  src: string;
  alt: string;
  /** Classes do contêiner (margens, largura, cantos). Sem largura própria: o contêiner ocupa o que o pai der. */
  className?: string;
}

/**
 * Imagem de publicação: preenche a largura do contêiner, sem cortes (o enquadramento é o que a
 * pessoa definiu no editor), até uma altura máxima. Acima dela a foto é reduzida por inteiro,
 * para que o card não expandido (limitado à altura da tela) ainda mostre parte do texto quando
 * a foto está no topo. Abre em tela cheia ao clicar.
 */
export function PostImage({ src, alt, className = "" }: PostImageProps) {
  const [open, setOpen] = useState(false);
  const [ratio, setRatio] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Ampliar imagem: ${alt}`}
        // Foto limitada pela altura: o próprio botão encolhe até a largura da foto, então
        // cantos arredondados e sombra acompanham a foto (sem faixas ao redor).
        style={ratio ? { maxWidth: `calc(${MAX_HEIGHT} * ${ratio})` } : undefined}
        className={`mx-auto block cursor-zoom-in overflow-hidden p-0 ${className}`}
      >
        <img
          src={src}
          alt={alt}
          onLoad={(e) => setRatio(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)}
          className="block h-auto w-full rounded-[inherit]"
          loading="lazy"
        />
      </button>
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[1000] flex cursor-zoom-out items-center justify-center bg-black/90 p-2 sm:p-6"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar imagem"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            >
              <X className="h-5 w-5" />
            </button>
            <img src={src} alt={alt} className="max-h-full max-w-full object-contain" />
          </div>,
          document.body,
        )}
    </>
  );
}

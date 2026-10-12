// Casca das telas internas: a página tem a altura da tela (não rola) e o conteúdo rola por dentro,
// abaixo do cabeçalho. O feed e o Explorar não usam esta casca (continuam rolando a janela).
import { useCallback, useLayoutEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { SiteHeader } from "@/components/site-chrome";
import { cn } from "@/lib/utils";

// ───────── Encaixe da seção "Mais" das colunas laterais ─────────
// Quando a página não rola, os cards das colunas que não couberam aparecem no fim da área que rola.

let slot: HTMLElement | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function useRailsMoreSlot() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => slot,
    () => null,
  );
}

function RailsMoreSlot() {
  const mine = useRef<HTMLElement | null>(null);
  const ref = useCallback((el: HTMLDivElement | null) => {
    if (el) {
      mine.current = el;
      slot = el;
      notify();
    } else if (slot === mine.current) {
      // Só limpa se ainda for o nosso (a página nova pode já ter se registrado).
      slot = null;
      notify();
    }
  }, []);
  return <div ref={ref} />;
}

/**
 * Tela interna com a altura da tela.
 * - `scroll` (padrão): a área de conteúdo inteira rola por dentro.
 * - `scroll={false}`: a página divide a altura entre as próprias colunas (cada uma rola sozinha),
 *   como no painel da administração.
 */
export function AppScreen({
  children,
  className,
  mainClassName,
  scroll = true,
  header,
}: {
  children: ReactNode;
  className?: string;
  mainClassName?: string;
  scroll?: boolean;
  /** Cabeçalho próprio (padrão: o do site). */
  header?: ReactNode;
}) {
  return (
    <div
      className={cn("flex h-dvh flex-col overflow-hidden bg-background text-foreground", className)}
    >
      {header ?? <SiteHeader />}
      <main
        data-app-main={scroll ? "" : undefined}
        data-no-bottom-pad
        className={cn(
          "min-h-0 w-full flex-1",
          scroll
            ? "overflow-y-auto overscroll-contain pb-28 lg:pb-10"
            : "flex flex-col overflow-hidden pb-24 lg:pb-0",
          mainClassName,
        )}
      >
        {children}
        {scroll && <RailsMoreSlot />}
      </main>
    </div>
  );
}

/**
 * Coluna de cards que não rola: mostra, na ordem, só os cards que cabem inteiros na altura
 * disponível (os demais ficam escondidos até sobrar espaço, por exemplo numa tela mais alta).
 */
export function FitColumn({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Esconde com visibility (sem mudar o layout): assim medir não dispara outra medição.
    const fit = () => {
      let full = false;
      for (const c of Array.from(el.children) as HTMLElement[]) {
        if (!full && c.offsetTop + c.offsetHeight > el.clientHeight) full = true;
        c.style.visibility = full ? "hidden" : "";
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    Array.from(el.children).forEach((c) => ro.observe(c));
    return () => ro.disconnect();
  }, [children]);
  return (
    <div ref={ref} className={cn("relative h-full overflow-hidden", className)}>
      {children}
    </div>
  );
}

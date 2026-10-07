// Edição direta no slide: o texto clicado vira uma caixa de digitação no mesmo lugar, com a mesma fonte,
// tamanho e cor. O texto original fica invisível por baixo (guardando o espaço), e o slide se atualiza
// enquanto se digita.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { readMark } from "@/lib/presentation-content";

const MARKS = new RegExp("\uFEFF|\u200E|\u200B|\u200C|\u200D|[\u2060-\u2064]", "g");
const clean = (s: string) => s.replace(MARKS, "");
const squash = (s: string) => clean(s).replace(/\s+/g, " ").trim();

/** Elemento que contém o texto inteiro do campo (títulos animados são quebrados em várias palavras). */
export function findTextContainer(
  root: HTMLElement,
  path: string,
  value: string,
): HTMLElement | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const want = squash(value);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (readMark(n.textContent ?? "") !== path) continue;
    for (let el = n.parentElement; el && el !== root; el = el.parentElement) {
      if (!want || squash(el.textContent ?? "").includes(want)) return el;
    }
    return n.parentElement;
  }
  return null;
}

/** Caminho do texto clicado: o elemento mais próximo cujo conteúdo tem exatamente um campo marcado. */
export function pathAt(target: HTMLElement, root: HTMLElement): string | null {
  for (let el: HTMLElement | null = target; el && el !== root; el = el.parentElement) {
    const found = new Set<string>();
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const p = readMark(n.textContent ?? "");
      if (p) found.add(p);
      if (found.size > 1) return null;
    }
    if (found.size === 1) return [...found][0];
  }
  return null;
}

const COPIED = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "lineHeight",
  "letterSpacing",
  "textTransform",
  "textAlign",
  "color",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
] as const;

export function InlineTextEditor({
  root,
  path,
  value,
  onChange,
  onDone,
}: {
  /** Área rolável do slide (o editor fica posicionado dentro dela). */
  root: HTMLElement;
  path: string;
  value: string;
  onChange: (value: string) => void;
  onDone: () => void;
}) {
  const box = useRef<HTMLTextAreaElement>(null);
  const initial = useRef(value);
  const [frame, setFrame] = useState<{ style: React.CSSProperties } | null>(null);

  // A cada mudança (o slide pode ter refeito o elemento), acha o texto, esconde o original e copia o visual.
  useLayoutEffect(() => {
    const el = findTextContainer(root, path, value);
    if (!el) return;
    const prev = el.style.visibility;
    el.style.visibility = "hidden";
    const measure = () => {
      const r = el.getBoundingClientRect();
      const base = root.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const style: React.CSSProperties = {
        left: r.left - base.left + root.scrollLeft,
        top: r.top - base.top + root.scrollTop,
        width: Math.max(r.width, 40),
        minHeight: r.height,
      };
      for (const k of COPIED) (style as Record<string, string>)[k] = cs[k];
      if (cs.color === "rgba(0, 0, 0, 0)" || cs.webkitTextFillColor === "transparent")
        style.color = "inherit";
      setFrame({ style });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      ro.disconnect();
      el.style.visibility = prev;
    };
  }, [root, path, value]);

  // Altura acompanha o texto digitado.
  useLayoutEffect(() => {
    const t = box.current;
    if (!t) return;
    t.style.height = "auto";
    t.style.height = `${t.scrollHeight}px`;
  }, [value, frame]);

  // Foco uma vez, quando a caixa aparece, com o cursor no fim do texto.
  const focused = useRef(false);
  const ready = frame !== null;
  useEffect(() => {
    const t = box.current;
    if (!ready || !t || focused.current) return;
    focused.current = true;
    t.focus();
    t.setSelectionRange(t.value.length, t.value.length);
  }, [ready]);

  if (!frame) return null;
  return (
    <textarea
      ref={box}
      data-nc-inline
      value={value}
      spellCheck
      onChange={(e) => onChange(e.target.value)}
      onBlur={onDone}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Escape") {
          onChange(initial.current);
          onDone();
        } else if (e.key === "Enter" && !e.shiftKey && !initial.current.includes("\n")) {
          e.preventDefault();
          onDone();
        }
      }}
      className="absolute z-40 resize-none overflow-hidden rounded-md bg-background/70 outline outline-2 outline-offset-2 outline-[#b4532a] backdrop-blur-[1px]"
      style={{ ...frame.style, margin: 0, border: 0 }}
    />
  );
}

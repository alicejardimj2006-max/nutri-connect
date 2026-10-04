import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  APPEARANCE_EVENT,
  DEFAULT_APPEARANCE,
  loadAppearance,
  resetAppearance,
  saveAppearance,
  type Appearance,
} from "@/lib/appearance";

interface AppearanceBinding {
  appearance: Appearance;
  update: (patch: Partial<Appearance>) => void;
  reset: () => void;
}

const Override = createContext<AppearanceBinding | null>(null);

/**
 * Faz os controles de personalização (cores, texto, formatos…) editarem OUTRA aparência em vez da
 * da própria pessoa. Usado para montar o tema do perfil com os mesmos cartões do painel.
 */
export function AppearanceOverride({
  value,
  children,
}: {
  value: AppearanceBinding;
  children: ReactNode;
}) {
  return createElement(Override.Provider, { value }, children);
}

/** Aparência atual da pessoa (atualiza sozinha quando muda aqui ou vem da conta). */
export function useAppearance(): AppearanceBinding {
  const override = useContext(Override);
  const [appearance, setAppearance] = useState<Appearance>(DEFAULT_APPEARANCE);

  useEffect(() => {
    const sync = () => setAppearance(loadAppearance());
    sync();
    window.addEventListener(APPEARANCE_EVENT, sync);
    return () => window.removeEventListener(APPEARANCE_EVENT, sync);
  }, []);

  if (override) return override;
  return {
    appearance,
    update: (patch: Partial<Appearance>) => saveAppearance({ ...appearance, ...patch }),
    reset: resetAppearance,
  };
}

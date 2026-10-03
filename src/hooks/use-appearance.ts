import { useEffect, useState } from "react";
import {
  APPEARANCE_EVENT,
  DEFAULT_APPEARANCE,
  loadAppearance,
  resetAppearance,
  saveAppearance,
  type Appearance,
} from "@/lib/appearance";

/** Aparência atual da pessoa (atualiza sozinha quando muda aqui ou vem da conta). */
export function useAppearance() {
  const [appearance, setAppearance] = useState<Appearance>(DEFAULT_APPEARANCE);

  useEffect(() => {
    const sync = () => setAppearance(loadAppearance());
    sync();
    window.addEventListener(APPEARANCE_EVENT, sync);
    return () => window.removeEventListener(APPEARANCE_EVENT, sync);
  }, []);

  return {
    appearance,
    update: (patch: Partial<Appearance>) => saveAppearance({ ...appearance, ...patch }),
    reset: resetAppearance,
  };
}

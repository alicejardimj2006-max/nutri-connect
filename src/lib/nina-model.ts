// Modelo da Nina em uso no site, escolhido no painel da administração ("site_nina").
import { useMemo } from "react";
import {
  readNinaSiteConfig,
  type NinaModel,
  type NinaSiteConfig,
} from "@/lib/characters/nina-config";
import { useSiteConfig } from "@/lib/site-config";

export function useNinaSiteConfig(): NinaSiteConfig {
  const raw = useSiteConfig("site_nina");
  return useMemo(() => readNinaSiteConfig(raw), [raw]);
}

/** Modelo e aparência da Nina que o site mostra para todo mundo. */
export function useActiveNinaModel(): NinaModel {
  return useNinaSiteConfig().active;
}

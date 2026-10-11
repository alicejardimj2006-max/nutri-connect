import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAppearance } from "@/hooks/use-appearance";
import type { Appearance } from "@/lib/appearance";
import {
  currentSubscription,
  deviceTimezone,
  enablePush,
  refreshSubscription,
  registerServiceWorker,
  savePushSettings,
} from "@/lib/push";

/** O que da Personalização vale também para o push. */
export function pushPatch(
  ap: Pick<Appearance, "quietOn" | "quietFrom" | "quietTo" | "notifPreview">,
) {
  return {
    quiet_from: ap.quietOn ? ap.quietFrom : null,
    quiet_to: ap.quietOn ? ap.quietTo : null,
    show_preview: ap.notifPreview,
    timezone: deviceTimezone(),
  };
}

/**
 * Registra o service worker e, com o push ativo neste aparelho, mantém o servidor em dia:
 * a inscrição na conta logada, o fuso do aparelho e o horário de silêncio e a prévia
 * escolhidos em Notificações (que valem para o site e para o push).
 */
export function usePushSync() {
  const { user } = useAuth();
  const { appearance: ap } = useAppearance();
  const synced = useRef<string>("");

  useEffect(() => registerServiceWorker(), []);

  // Troca de conta no mesmo aparelho: a inscrição passa para quem está logado.
  useEffect(() => {
    if (!user) return;
    refreshSubscription().catch((err) => console.warn("push", err));
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // O navegador renovou a inscrição: inscreve de novo (a permissão já foi dada).
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "push-resubscribe" && user) enablePush().catch(() => {});
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [user]);

  const { quietOn, quietFrom, quietTo, notifPreview } = ap;
  useEffect(() => {
    if (!user) return;
    const patch = pushPatch({ quietOn, quietFrom, quietTo, notifPreview });
    const key = `${user.id}:${JSON.stringify(patch)}`;
    if (synced.current === key) return;
    let cancelled = false;
    void (async () => {
      if (!(await currentSubscription()) || cancelled) return;
      try {
        await savePushSettings(user.id, patch);
        synced.current = key;
      } catch (err) {
        console.warn("push_settings", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, quietOn, quietFrom, quietTo, notifPreview]);
}

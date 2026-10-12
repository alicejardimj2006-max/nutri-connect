// App Android: botão "Baixar o app" (só para quem abre o site num celular Android, nunca dentro do
// próprio app) e a faixa do topo, que dá para fechar. O APK de teste fica nas Releases do GitHub,
// atualizado pelo GitHub Actions a cada nova versão (ver mobile/README.md).
import { useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";
import { useTr } from "@/components/settings-ui";
import { isNativeApp } from "@/lib/push";
import { cn } from "@/lib/utils";

export const ANDROID_APK_URL =
  "https://github.com/alicejardimj2006-max/nutri-connect/releases/download/android-teste/NutriConnect.apk";

const BANNER_KEY = "nc_android_banner_until";

/** true num navegador Android (fora do app). Só depois de montar, para não divergir do servidor. */
export function useAndroidBrowser() {
  const [android, setAndroid] = useState(false);
  useEffect(() => {
    setAndroid(/android/i.test(navigator.userAgent) && !isNativeApp());
  }, []);
  return android;
}

function useInstallTexts() {
  const tr = useTr();
  return {
    label: tr([
      "Baixar o app Android",
      "Get the Android app",
      "Descargar la app Android",
      "Télécharger l'app Android",
    ]),
    hint: tr([
      "Versão de teste: o Android vai pedir para permitir a instalação deste app.",
      "Test version: Android will ask you to allow installing this app.",
      "Versión de prueba: Android pedirá permitir la instalación de esta app.",
      "Version de test : Android vous demandera d'autoriser l'installation.",
    ]),
  };
}

export function AndroidDownloadButton({
  className,
  showHint = true,
}: {
  className?: string;
  showHint?: boolean;
}) {
  const android = useAndroidBrowser();
  const { label, hint } = useInstallTexts();
  if (!android) return null;
  return (
    <div>
      <a
        href={ANDROID_APK_URL}
        className={cn(
          "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90",
          className,
        )}
      >
        <Smartphone className="h-4 w-4" />
        {label}
      </a>
      {showHint && <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Faixa do topo para quem está logado no celular Android; fechada, volta só em 30 dias. */
export function AndroidAppBanner() {
  const tr = useTr();
  const android = useAndroidBrowser();
  const { label } = useInstallTexts();
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!android) return;
    try {
      const until = Number(window.localStorage.getItem(BANNER_KEY) ?? 0);
      setHidden(until > Date.now());
    } catch {
      setHidden(false);
    }
  }, [android]);

  if (!android || hidden) return null;

  const close = () => {
    setHidden(true);
    try {
      window.localStorage.setItem(BANNER_KEY, String(Date.now() + 30 * 86_400_000));
    } catch {
      /* sem armazenamento: só some agora */
    }
  };

  return (
    <div className="flex items-center gap-3 border-b border-border/60 bg-accent-soft/60 px-4 py-2 text-xs text-foreground">
      <Smartphone className="h-4 w-4 shrink-0 text-accent" />
      <span className="min-w-0 flex-1">
        {tr([
          "O NutriConnect agora tem app para Android.",
          "NutriConnect now has an Android app.",
          "NutriConnect ahora tiene app para Android.",
          "NutriConnect a maintenant une app Android.",
        ])}
      </span>
      <a
        href={ANDROID_APK_URL}
        onClick={close}
        className="font-semibold text-accent hover:underline"
      >
        {label}
      </a>
      <button
        type="button"
        onClick={close}
        className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
        aria-label={tr(["Fechar", "Close", "Cerrar", "Fermer"])}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

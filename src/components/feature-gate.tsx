// Página de uma funcionalidade desligada pela administração: aviso no lugar do conteúdo.
// Administradores continuam vendo a página, com uma faixa no topo.
import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Power } from "lucide-react";
import { SiteHeader } from "@/components/site-chrome";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { isPlatformAdmin } from "@/lib/community-admin";
import { featureOfPath, useFeatures } from "@/lib/features";
import type { Locale } from "@/lib/i18n/locales";

const TEXT: Record<Locale, { title: string; body: string; back: string; admin: string }> = {
  "pt-BR": {
    title: "Esta área está pausada",
    body: "A equipe do NutriConnect desativou esta parte da plataforma por enquanto. Volte em breve!",
    back: "Ir para o início",
    admin: "Funcionalidade desligada para o público. Você vê porque é administrador.",
  },
  en: {
    title: "This area is paused",
    body: "The NutriConnect team has turned this part of the platform off for now. Check back soon!",
    back: "Go to home",
    admin: "Feature turned off for the public. You can see it because you are an admin.",
  },
  es: {
    title: "Esta área está en pausa",
    body: "El equipo de NutriConnect desactivó esta parte de la plataforma por ahora. ¡Vuelve pronto!",
    back: "Ir al inicio",
    admin: "Función desactivada para el público. La ves porque eres administrador.",
  },
  fr: {
    title: "Cet espace est en pause",
    body: "L'équipe NutriConnect a désactivé cette partie de la plateforme pour le moment. Revenez bientôt !",
    back: "Aller à l'accueil",
    admin: "Fonction désactivée pour le public. Vous la voyez car vous êtes administrateur.",
  },
};

export function FeatureGate({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const features = useFeatures();
  const { user } = useAuth();
  const { locale } = useI18n();
  const feature = featureOfPath(pathname);
  const t = TEXT[locale] ?? TEXT["pt-BR"];

  if (!feature || features[feature.key]) return <>{children}</>;

  if (isPlatformAdmin(user)) {
    return (
      <>
        <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white">
          <Power className="h-3.5 w-3.5" /> {feature.label}: {t.admin}
        </div>
        {children}
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-secondary">
          <Power className="h-6 w-6 text-muted-foreground" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold">{t.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.body}</p>
        <Link
          to="/espaco"
          className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground"
        >
          {t.back}
        </Link>
      </main>
    </div>
  );
}

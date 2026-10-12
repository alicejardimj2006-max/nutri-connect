import { FitColumn } from "@/components/app-screen";
import { ClinicalDemoBanner } from "@/components/clinical/demo-banner";
import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-chrome";
import {
  EducationalNoticeCard,
  ProTasksCard,
  ProfileCard,
  UpcomingAppointmentsCard,
} from "@/components/rail-cards";
import { useAppearance } from "@/hooks/use-appearance";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { plainText } from "./ui";

export interface ClinicalNavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Só marca como ativo quando a URL é exatamente esta (para a página inicial da área). */
  exact?: boolean;
  badge?: number;
}

/**
 * Casca das áreas clínicas: mantém o cabeçalho da rede social e adiciona uma
 * navegação secundária (lateral no desktop, abas roláveis no celular).
 */
export function ClinicalLayout({
  title,
  subtitle,
  items,
  children,
}: {
  title: string;
  subtitle?: string;
  items: ClinicalNavItem[];
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { appearance } = useAppearance();
  const { user } = useAuth();
  const isActive = (item: ClinicalNavItem) =>
    item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + "/");

  return (
    // Altura da tela: a página não rola. O menu e os cards laterais ficam parados e só a coluna do
    // conteúdo rola por dentro.
    <div
      className={cn("flex h-dvh flex-col overflow-hidden bg-background text-foreground", plainText)}
    >
      <SiteHeader />
      <div className="mx-auto flex min-h-0 w-full max-w-[120rem] flex-1 gap-8 px-4 pt-4 sm:px-6 lg:pt-8 xl:px-8 2xl:px-12">
        <aside className="hidden w-56 shrink-0 overflow-y-auto pb-6 lg:block">
          <div>
            <p className="px-3 font-display text-lg font-bold text-foreground">{title}</p>
            {subtitle && <p className="px-3 text-xs text-muted-foreground">{subtitle}</p>}
            <nav className="mt-4 space-y-1" aria-label={title}>
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                      active
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    {!!item.badge && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 text-[11px] font-bold",
                          active ? "bg-primary-foreground/20" : "bg-accent text-accent-foreground",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main
          data-app-main
          data-no-bottom-pad
          className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain pb-28 lg:pb-10"
        >
          <nav
            className="-mx-4 mb-5 flex gap-1.5 overflow-x-auto border-b border-border/60 px-4 pb-3 lg:hidden"
            aria-label={title}
          >
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                  {!!item.badge && (
                    <span className="rounded-full bg-accent px-1.5 text-[10px] text-accent-foreground">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <ClinicalDemoBanner />
          {children}
        </main>

        {/* Cards laterais (telas largas): o que importa para o acompanhamento, sem sair da área */}
        {appearance.sidePanels && (
          // Cards interativos: a coluna não rola; mostra os que cabem inteiros.
          <aside className="hidden w-72 shrink-0 pb-6 xl:block 2xl:w-80">
            <FitColumn className="flex flex-col gap-5 [&>div:empty]:hidden">
              <div>
                <ProfileCard />
              </div>
              <div>{user?.professional ? <ProTasksCard /> : <UpcomingAppointmentsCard />}</div>
              <div>
                <EducationalNoticeCard />
              </div>
            </FitColumn>
          </aside>
        )}
      </div>
    </div>
  );
}

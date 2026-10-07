import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { AuthGateLoading, SiteHeader } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { isPlatformAdmin } from "@/lib/community-admin";
import { useOverview } from "@/lib/admin-api";
import { SECTIONS, isSectionId, type SectionId } from "@/components/admin/sections";
import { OverviewSection } from "@/components/admin/sections-overview";
import { ContactSection, UsersSection } from "@/components/admin/sections-people";
import {
  AiRejectionsSection,
  useAiRejectionsSummary,
} from "@/components/admin/sections-ai-rejections";
import { SiteFeaturesSection } from "@/components/admin/sections-site-features";
import { SiteRailsSection } from "@/components/admin/sections-site-rails";
import { PresentationSection } from "@/components/admin/sections-presentation";
import {
  AnnouncementsSection,
  PostsSection,
  ThemesSection,
} from "@/components/admin/sections-content";
import {
  AiSection,
  AuditSection,
  FinanceSection,
  SettingsSection,
} from "@/components/admin/sections-business";
import {
  CommunitiesSection,
  ModerationSection,
  VerificationsSection,
} from "@/components/admin/sections-legacy";

export const Route = createFileRoute("/admin")({
  validateSearch: (search: Record<string, unknown>): { secao?: SectionId } => ({
    secao: isSectionId(search.secao) ? search.secao : undefined,
  }),
  head: () => ({ meta: [{ title: "Administração — NutriConnect" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, hydrated } = useRequireAuth();
  const { t } = useI18n();
  const { secao } = Route.useSearch();
  const navigate = useNavigate();
  const section: SectionId = secao ?? "visao";
  const admin = !!user && isPlatformAdmin(user);
  const overview = useOverview();
  const aiRejections = useAiRejectionsSummary();

  if (!hydrated || !user) return <AuthGateLoading />;

  if (!admin) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-16 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-3 font-display text-2xl font-bold">{t("admin.restricted")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("admin.restrictedText")}</p>
        </main>
      </div>
    );
  }

  const go = (id: SectionId) => void navigate({ to: "/admin", search: { secao: id } });
  const o = overview.data;
  const badges: Partial<Record<SectionId, number>> = {
    moderacao: o?.reports_pending,
    ia_barrados: aiRejections.data?.pending,
    verificacoes: o?.verifications_pending,
    contato: o?.contact_new,
    comunidades: o?.communities_attention,
  };
  const groups = SECTIONS.reduce<Record<string, typeof SECTIONS>>((acc, s) => {
    (acc[s.group] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[96rem] flex-1 px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-6">
        <h1 className="sr-only">{t("admin.title")}</h1>

        {/* Menu: lateral no computador, faixa rolável no celular */}
        <nav aria-label="Seções da administração" className="mb-5 lg:mb-0">
          <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:hidden">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(s.id)}
                aria-current={section === s.id ? "page" : undefined}
                className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                  section === s.id
                    ? "border-accent bg-accent-soft text-foreground"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                <s.icon className="h-3.5 w-3.5" />
                {s.label}
                {!!badges[s.id] && (
                  <span className="rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white">
                    {badges[s.id]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="sticky top-20 hidden space-y-4 rounded-3xl border border-border/80 bg-card p-3 shadow-xs lg:block">
            <p className="flex items-center gap-2 px-3 pt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-accent" /> Administração
            </p>
            {Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  {group}
                </p>
                <ul className="space-y-0.5">
                  {items.map((s) => {
                    const active = section === s.id;
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => go(s.id)}
                          aria-current={active ? "page" : undefined}
                          className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition ${
                            active
                              ? "bg-accent-soft font-bold text-foreground"
                              : "font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                          }`}
                        >
                          <s.icon className={`h-4 w-4 shrink-0 ${active ? "text-accent" : ""}`} />
                          <span className="flex-1">{s.label}</span>
                          {!!badges[s.id] && (
                            <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                              {badges[s.id]}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <div className="min-w-0">
          {section === "visao" && <OverviewSection go={go} />}
          {section === "usuarios" && <UsersSection me={user.id} />}
          {section === "verificacoes" && <VerificationsSection user={user} />}
          {section === "contato" && <ContactSection />}
          {section === "posts" && <PostsSection />}
          {section === "moderacao" && <ModerationSection />}
          {section === "ia_barrados" && <AiRejectionsSection />}
          {section === "comunidades" && <CommunitiesSection />}
          {section === "temas" && <ThemesSection />}
          {section === "apresentacao" && <PresentationSection />}
          {section === "anuncios" && <AnnouncementsSection />}
          {section === "site_cards" && <SiteRailsSection />}
          {section === "site_features" && <SiteFeaturesSection />}
          {section === "financeiro" && <FinanceSection />}
          {section === "ia" && <AiSection />}
          {section === "config" && <SettingsSection />}
          {section === "auditoria" && <AuditSection />}
        </div>
      </main>
    </div>
  );
}

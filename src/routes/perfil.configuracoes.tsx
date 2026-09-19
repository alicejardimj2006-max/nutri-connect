import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronRight,
  Eye,
  ShieldAlert,
  Database,
  Download,
  Trash2,
  Lock,
  Globe,
  MapPin,
  MessageCircle,
  FileText,
  UserCog,
  Palette,
  LogOut,
  Ban,
  AlertTriangle,
} from "lucide-react";
import { AuthGateLoading, SiteHeader } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth";
import {
  getPrivacySettings,
  updatePrivacySettings,
  requestDataExport,
  requestAccountDeletion,
  submitPrivacyRequest,
} from "@/lib/privacy";

export const Route = createFileRoute("/perfil/configuracoes")({
  head: () => ({ meta: [{ title: "Privacidade e Segurança — NutriConnect" }] }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const { user, hydrated } = useRequireAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"geral" | "privacidade" | "dados" | "seguranca">(
    "geral",
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      getPrivacySettings().then((res) => {
        setSettings(res);
        setLoading(false);
      });
    }
  }, [user]);

  if (!hydrated || !user || loading) return <AuthGateLoading />;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Você saiu da sua conta.");
    navigate({ to: "/login" });
  };

  const handleUpdate = async (field: string, value: any) => {
    try {
      await updatePrivacySettings({ [field]: value });
      setSettings((prev: any) => ({ ...prev, [field]: value }));
      toast.success("Configuração atualizada com sucesso.");
    } catch (e: any) {
      toast.error(e.message || "Erro ao atualizar");
    }
  };

  const handleExport = async () => {
    try {
      await requestDataExport();
      toast.success("Solicitação de exportação (LGPD) enviada. Você receberá um e-mail em breve.");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeletion = async () => {
    if (
      !confirm(
        "ATENÇÃO: Isso registrará uma solicitação irreversível de exclusão de conta e apagará seus dados. Deseja continuar?",
      )
    )
      return;
    try {
      setIsDeleting(true);
      await requestAccountDeletion();
      toast.success("Sua conta foi colocada em fila de exclusão.");
      navigate({ to: "/login" });
    } catch (e: any) {
      toast.error(e.message);
      setIsDeleting(false);
    }
  };

  const renderGeral = () => (
    <div className="space-y-6">
      <Link
        to="/perfil/personalizacao"
        className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition hover:bg-secondary/50"
      >
        <div className="flex items-center gap-4">
          <div className="bg-chart-4/15 text-chart-4 p-3 rounded-xl">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Personalização</h3>
            <p className="text-xs text-muted-foreground">Cores, fontes e tema visual</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </Link>

      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-primary-soft text-primary p-3 rounded-xl">
            <UserCog className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Conta</h3>
            <p className="text-xs text-muted-foreground">Acesso e credenciais</p>
          </div>
        </div>
        <div className="bg-secondary/40 p-4 rounded-xl text-sm mb-4">
          <span className="font-bold block mb-1">E-mail conectado:</span>
          {user.email}
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 border border-destructive/40 text-destructive font-bold py-3 rounded-xl hover:bg-destructive/10 transition"
        >
          <LogOut className="w-4 h-4" /> Sair da conta
        </button>
      </section>
    </div>
  );

  const renderPrivacidade = () => (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-accent" /> Visibilidade do Perfil
        </h3>

        <label className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <p className="text-sm font-bold">Quem pode ver meu perfil?</p>
          </div>
          <select
            value={settings?.profile_visibility || "public"}
            onChange={(e) => handleUpdate("profile_visibility", e.target.value)}
            className="bg-secondary text-sm font-medium rounded-lg px-3 py-2 border-0 outline-none"
          >
            <option value="public">Todos (Público)</option>
            <option value="private">Privado</option>
          </select>
        </label>

        <label className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <p className="text-sm font-bold">Quem pode me enviar mensagens?</p>
            <p className="text-xs text-muted-foreground">
              O chat direto ainda não está disponível.
            </p>
          </div>
          <select
            value={settings?.message_allowance || "everyone"}
            onChange={(e) => handleUpdate("message_allowance", e.target.value)}
            className="bg-secondary text-sm font-medium rounded-lg px-3 py-2 border-0 outline-none"
          >
            <option value="everyone">Qualquer pessoa</option>
            <option value="nobody">Ninguém</option>
          </select>
        </label>

        <label className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-bold">Permitir que me encontrem</p>
            <p className="text-xs text-muted-foreground">Nas buscas da plataforma.</p>
          </div>
          <select
            value={settings?.discoverability}
            onChange={(e) => handleUpdate("discoverability", e.target.value)}
            className="bg-secondary text-sm font-medium rounded-lg px-3 py-2 border-0 outline-none"
          >
            <option value="everyone">Sim, todos</option>
            <option value="contacts_only">Só meus contatos</option>
            <option value="nobody">Não</option>
          </select>
        </label>
      </section>

      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-500" /> Localização
        </h3>
        <label className="flex items-center justify-between py-3 border-b border-border cursor-pointer">
          <div>
            <p className="text-sm font-bold">Usar localização (Interno)</p>
            <p className="text-xs text-muted-foreground max-w-[200px] sm:max-w-xs">
              Preparado para futuras recomendações (ainda inativo).
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings?.use_location_for_features}
            onChange={(e) => handleUpdate("use_location_for_features", e.target.checked)}
            className="w-5 h-5 accent-primary"
          />
        </label>
        <label className="flex items-center justify-between py-3 cursor-pointer">
          <div>
            <p className="text-sm font-bold">Mostrar localização publicamente</p>
            <p className="text-xs text-muted-foreground">
              Exibirá cidade/estado no seu perfil no futuro.
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings?.show_location}
            onChange={(e) => handleUpdate("show_location", e.target.checked)}
            className="w-5 h-5 accent-primary"
          />
        </label>
      </section>
    </div>
  );

  const renderDados = () => (
    <div className="space-y-6">
      <div className="bg-primary-soft/30 border border-primary/20 rounded-2xl p-5 text-sm text-foreground/90 leading-relaxed shadow-sm">
        <h3 className="font-black text-primary flex items-center gap-2 mb-2">
          <Database className="w-5 h-5" /> Centro de Dados (LGPD)
        </h3>
        <p>
          A Lei Geral de Proteção de Dados garante que você tenha total controle sobre suas
          informações. Nesta área você pode exercer seus direitos como titular.
        </p>
      </div>

      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h4 className="font-bold text-sm">Baixar meus dados</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Registra uma solicitação para a equipe enviar seus dados (em breve).
            </p>
          </div>
          <button
            onClick={handleExport}
            className="shrink-0 bg-secondary text-foreground hover:bg-secondary/80 font-bold px-4 py-2 rounded-xl text-sm transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Solicitar
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h4 className="font-bold text-sm">Atualizar dados privados</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Edite CPF, telefone e data de nascimento na página de Perfil.
            </p>
          </div>
          <Link
            to="/perfil/editar"
            className="shrink-0 bg-secondary text-foreground hover:bg-secondary/80 font-bold px-4 py-2 rounded-xl text-sm transition"
          >
            Editar
          </Link>
        </div>

        <div className="pt-2">
          <div className="bg-destructive/5 rounded-xl border border-destructive/20 p-4">
            <h4 className="font-bold text-sm text-destructive flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" /> Solicitar Exclusão da Conta
            </h4>
            <p className="text-xs text-muted-foreground mb-4">
              Isto fará uma solicitação para exclusão da sua conta. Até a funcionalidade automática
              ser concluída, sua conta passará por revisão manual antes da exclusão definitiva.
            </p>
            <button
              onClick={handleDeletion}
              disabled={isDeleting}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold px-6 py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" /> {isDeleting ? "Processando..." : "Solicitar Exclusão"}
            </button>
          </div>
        </div>
      </section>

      {requests.length > 0 && (
        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-accent" /> Histórico de Solicitações
          </h3>
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="text-sm p-3 border border-border rounded-lg bg-secondary/20"
              >
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-foreground">
                    {req.type === "portability"
                      ? "Exportação"
                      : req.type === "deletion"
                        ? "Exclusão"
                        : req.type}
                  </strong>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground bg-secondary px-2 py-1 rounded">
                    {req.status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>ID: {req.id.slice(0, 8)}...</span>
                  <span>{new Date(req.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );

  const renderSeguranca = () => (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Lock className="w-5 h-5 text-amber-500" /> Controles de Segurança
        </h3>

        <Link
          to="/desafios"
          className="flex items-center justify-between py-3 border-b border-border"
        >
          <div>
            <p className="text-sm font-bold">Minhas Denúncias</p>
            <p className="text-xs text-muted-foreground">
              Acompanhe as denúncias que você realizou.
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Link>

        <Link
          to="/desafios"
          className="flex items-center justify-between py-3 border-b border-border"
        >
          <div>
            <p className="text-sm font-bold text-destructive flex items-center gap-2">
              <Ban className="w-4 h-4" /> Contas Bloqueadas
            </p>
            <p className="text-xs text-muted-foreground">Gerencie pessoas que você bloqueou.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Link>
      </section>

      <p className="text-center text-[10px] text-muted-foreground/60 uppercase tracking-widest font-bold">
        Sessão ativa criptografada
      </p>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 sm:px-6 py-8">
        <Link
          to="/perfil/$userId"
          params={{ userId: user.id }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para o perfil</span>
        </Link>

        <h1 className="text-3xl font-extrabold font-display text-foreground mb-2">
          Configurações e Privacidade
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Gerencie sua experiência, segurança e dados pessoais na plataforma.
        </p>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto pb-2 mb-6 gap-2 no-scrollbar border-b border-border">
          {[
            { id: "geral", label: "Geral", icon: <UserCog className="w-4 h-4" /> },
            { id: "privacidade", label: "Privacidade", icon: <ShieldAlert className="w-4 h-4" /> },
            { id: "dados", label: "Dados (LGPD)", icon: <Database className="w-4 h-4" /> },
            { id: "seguranca", label: "Segurança", icon: <Lock className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab.id ? "bg-card border-t border-l border-r border-border text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {activeTab === "geral" && renderGeral()}
          {activeTab === "privacidade" && renderPrivacidade()}
          {activeTab === "dados" && renderDados()}
          {activeTab === "seguranca" && renderSeguranca()}
        </div>

        <div className="mt-12 text-center text-[10px] text-muted-foreground pb-8">
          NutriConnect &copy; {new Date().getFullYear()} • Plataforma adequada ao ECA Digital e
          LGPD.
        </div>
      </main>
    </div>
  );
}

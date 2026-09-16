import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, User, Heart, Palette, LogOut } from "lucide-react";
import { AuthGateLoading, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRequireAuth } from "@/hooks/use-auth";
import { signOut, updateCurrentUser } from "@/lib/auth";
import { JOURNEY_GOALS } from "@/lib/community";
import { Field } from "./login";

export const Route = createFileRoute("/perfil/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — NutriConnect" }] }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const { user, hydrated } = useRequireAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [goal, setGoal] = useState<string>(JOURNEY_GOALS[0]);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setBio(user.bio || "");
    setPhone(user.phone || "");
    setGoal(user.journeyGoal || user.goal || JOURNEY_GOALS[0]);
  }, [user]);

  if (!hydrated || !user) return <AuthGateLoading />;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      toast.error("O nome não pode ficar em branco.");
      return;
    }
    updateCurrentUser({
      name: cleanName,
      bio: bio.trim(),
      phone: phone.trim(),
      goal,
      journeyGoal: goal,
    });
    toast.success("Configurações salvas com sucesso!");
  };

  const handleSignOut = () => {
    signOut();
    toast.success("Você saiu da sua conta.");
    navigate({ to: "/login" });
  };

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

        <h1 className="text-3xl font-extrabold font-display text-foreground mb-1">Configurações</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Gerencie suas informações, sua jornada e a aparência do NutriConnect.
        </p>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Perfil */}
          <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">
                <User className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold font-display text-foreground">Meu perfil</p>
                <p className="text-[11px] text-muted-foreground">Nome, bio e contato</p>
              </div>
            </div>
            <div className="space-y-4">
              <Field label="Nome completo">
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como gostaria de ser chamado(a)?"
                />
              </Field>
              <Field label="Bio">
                <textarea
                  rows={3}
                  className="textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Fale um pouco sobre a sua jornada alimentar..."
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Telefone">
                  <input
                    className="input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </Field>
                <Field label="E-mail">
                  <input
                    className="input opacity-60"
                    value={user.email}
                    disabled
                    title="O e-mail não pode ser alterado"
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* Jornada */}
          <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-soft text-accent">
                <Heart className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold font-display text-foreground">Minha jornada</p>
                <p className="text-[11px] text-muted-foreground">
                  Qual o foco da sua caminhada alimentar?
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {JOURNEY_GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGoal(g)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer ${
                    goal === g
                      ? "bg-accent text-accent-foreground font-semibold shadow-xs"
                      : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </section>

          {/* Aparência */}
          <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-chart-4/15 text-chart-4">
                <Palette className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold font-display text-foreground">Aparência</p>
                <p className="text-[11px] text-muted-foreground">Tema claro ou escuro</p>
              </div>
            </div>
            <ThemeToggle />
          </section>

          <button
            type="submit"
            className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90 cursor-pointer"
          >
            Salvar alterações
          </button>
        </form>

        {/* Sair da conta */}
        <section className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-foreground">Sair da conta</p>
            <p className="text-[11px] text-muted-foreground">
              Você será desconectado e voltará para a tela de login.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-destructive/40 px-5 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/10 cursor-pointer shrink-0"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </button>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

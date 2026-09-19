import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Heart, User } from "lucide-react";
import { AuthGateLoading, SiteHeader } from "@/components/site-chrome";
import { useRequireAuth } from "@/hooks/use-auth";
import { JOURNEY_GOALS } from "@/lib/community";
import { Field } from "./login";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/perfil/editar")({
  head: () => ({ meta: [{ title: "Editar perfil • NutriConnect" }] }),
  component: EditProfilePage,
});

function EditProfilePage() {
  const { user, hydrated } = useRequireAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [goal, setGoal] = useState<string>(JOURNEY_GOALS[0]);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch profile and private_profile from Supabase
    async function loadData() {
      try {
        const { data: pubData } = await supabase
          .from("profiles")
          .select("display_name, bio")
          .eq("id", user.id)
          .single();

        const { data: privData } = await supabase
          .from("private_profiles")
          .select("phone")
          .eq("user_id", user.id)
          .single();

        setName(pubData?.display_name || user.name || "");
        setBio(pubData?.bio || "");
        setPhone(privData?.phone || "");
        // Goal não está no schema oficial do backend ainda, então mantemos o fallback do metadata (temporário)
        setGoal(user.user_metadata?.journeyGoal || user.user_metadata?.goal || JOURNEY_GOALS[0]);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, [user]);

  if (!hydrated || !user || loadingData) return <AuthGateLoading />;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      toast.error("O nome não pode ficar em branco.");
      return;
    }

    setSaving(true);

    try {
      // Atualiza tabela pública
      const { error: pubError } = await supabase
        .from("profiles")
        .update({
          display_name: cleanName,
          bio: bio.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (pubError) throw pubError;

      // Atualiza tabela privada
      const { error: privError } = await supabase
        .from("private_profiles")
        .update({
          phone: phone.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (privError) throw privError;

      // Atualiza metadados JWT (opcional, para persistir 'goal')
      await supabase.auth.updateUser({
        data: {
          journeyGoal: goal,
          name: cleanName,
        },
      });

      toast.success("Perfil atualizado!");
      navigate({ to: "/perfil/$userId", params: { userId: user.id } });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
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

        <h1 className="text-3xl font-extrabold font-display text-foreground mb-1">Editar perfil</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Como você aparece para a comunidade: nome, bio, contato e o foco da sua jornada.
        </p>

        <form onSubmit={handleSave} className="space-y-5">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition hover:bg-accent/90 cursor-pointer"
            >
              Salvar alterações
            </button>
            <Link
              to="/perfil/$userId"
              params={{ userId: user.id }}
              className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

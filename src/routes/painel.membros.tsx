// Perfil de membros do profissional: conta de recebimento (Stripe), plano e preço, assinantes,
// ganhos e conteúdo exclusivo. A função só abre a partir do nível Destaque (ver pro_features).
import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Crown, Lock, Percent, Trash2, Users, Wallet } from "lucide-react";
import {
  Avatar,
  Card,
  Field,
  Loading,
  PageHeader,
  Stat,
  buttonPrimary,
  buttonSecondary,
  inputClass,
} from "@/components/clinical/ui";
import { useTr } from "@/components/appearance-editor";
import { useAuth } from "@/hooks/use-auth";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import { formatDate, formatMoney } from "@/lib/clinical/format";
import { startConnectOnboarding } from "@/lib/social/members";
import {
  useConnectStatus,
  useDeleteMemberContent,
  useEarnings,
  useMemberContent,
  useMemberPlan,
  usePublishMemberContent,
  useSaveMemberPlan,
  useSubscribers,
} from "@/lib/social/members-queries";
import { useProStatus } from "@/lib/social/pro-score-queries";

export const Route = createFileRoute("/painel/membros")({
  component: MembersPanel,
});

function MembersPanel() {
  const { user } = useAuth();
  const tr = useTr();
  const status = useProStatus(user?.id);
  if (!user) return null;
  if (status.isLoading) return <Loading />;

  const unlocked = status.data?.features.includes("perfil_membros");
  if (!unlocked) {
    return (
      <>
        <PageHeader
          title={tr([
            "Perfil de membros",
            "Members profile",
            "Perfil de miembros",
            "Profil membres",
          ])}
        />
        <Card>
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-semibold text-foreground">
                {tr([
                  "Esta função abre no nível Destaque",
                  "This feature unlocks at the Rising level",
                  "Esta función se abre en el nivel Destacado",
                  "Cette fonction s'ouvre au niveau En vue",
                ])}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {tr([
                  "Publique, responda perguntas e participe do tema da semana para ganhar pontos. Veja o seu progresso no início do painel.",
                  "Post, answer questions and join the weekly theme to earn points. See your progress on the panel home.",
                  "Publica, responde preguntas y participa en el tema de la semana para ganar puntos. Mira tu progreso en el inicio del panel.",
                  "Publiez, répondez aux questions et participez au thème de la semaine pour gagner des points. Voyez votre progression à l'accueil du panneau.",
                ])}
              </p>
              <Link to="/painel" className={`${buttonSecondary} mt-3`}>
                {tr(["Ver meu nível", "See my level", "Ver mi nivel", "Voir mon niveau"])}
              </Link>
            </div>
          </div>
        </Card>
      </>
    );
  }
  return <Unlocked userId={user.id} />;
}

function Unlocked({ userId }: { userId: string }) {
  const tr = useTr();
  const { locale } = useClinicalI18n();
  const plan = useMemberPlan(userId);
  const connect = useConnectStatus();
  const subscribers = useSubscribers();
  const earnings = useEarnings(30);
  const [connecting, setConnecting] = useState(false);

  // Volta do cadastro no Stripe: confere de novo a conta.
  const { refetch } = connect;
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("conexao")) void refetch();
  }, [refetch]);

  const connected = !!connect.data?.chargesEnabled;
  const e = earnings.data;

  const onboard = async () => {
    setConnecting(true);
    try {
      window.location.href = await startConnectOnboarding();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
      setConnecting(false);
    }
  };

  return (
    <>
      <PageHeader
        title={tr(["Perfil de membros", "Members profile", "Perfil de miembros", "Profil membres"])}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icon={Users}
          label={tr(["Assinantes", "Subscribers", "Suscriptores", "Abonnés"])}
          value={
            (subscribers.data ?? []).filter((s) => ["ativa", "cancelando"].includes(s.status))
              .length
          }
        />
        <Stat
          icon={Wallet}
          label={tr([
            "Recebido (30 dias)",
            "Received (30 days)",
            "Recibido (30 días)",
            "Reçu (30 jours)",
          ])}
          value={formatMoney(e?.netCents ?? 0, locale)}
        />
        <Stat
          icon={Percent}
          label={tr([
            "Parte da plataforma",
            "Platform share",
            "Parte de la plataforma",
            "Part de la plateforme",
          ])}
          value={formatMoney(e?.feeCents ?? 0, locale)}
        />
        <Stat
          icon={Crown}
          label={tr([
            "Taxa do seu nível",
            "Your level's fee",
            "Tasa de tu nivel",
            "Frais de votre niveau",
          ])}
          value={`${plan.data?.feePercent ?? 20}%`}
        />
      </div>

      <Card
        className="mt-4"
        title={tr([
          "Conta de recebimento",
          "Payout account",
          "Cuenta de cobro",
          "Compte de réception",
        ])}
      >
        {connect.isLoading ? (
          <Loading />
        ) : connected ? (
          <p className="text-sm text-foreground">
            {tr([
              "Conta conectada. As mensalidades são divididas na hora: a sua parte vai direto para o Stripe.",
              "Account connected. Payments are split instantly: your share goes straight to Stripe.",
              "Cuenta conectada. Los pagos se dividen al instante: tu parte va directo a Stripe.",
              "Compte connecté. Les paiements sont répartis aussitôt : votre part va directement sur Stripe.",
            ])}
          </p>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground">
              {tr([
                "Para receber as mensalidades você cadastra seus dados no Stripe (uma vez). A plataforma só retém a taxa do seu nível.",
                "To receive payments you register your details with Stripe (once). The platform only keeps your level's fee.",
                "Para cobrar registras tus datos en Stripe (una vez). La plataforma solo retiene la tasa de tu nivel.",
                "Pour être payé, vous renseignez vos données chez Stripe (une fois). La plateforme ne retient que les frais de votre niveau.",
              ])}
            </p>
            <button
              type="button"
              onClick={onboard}
              disabled={connecting}
              className={`${buttonPrimary} mt-3`}
            >
              {connect.data?.connected
                ? tr([
                    "Continuar cadastro no Stripe",
                    "Continue Stripe setup",
                    "Continuar registro en Stripe",
                    "Continuer l'inscription Stripe",
                  ])
                : tr([
                    "Conectar ao Stripe",
                    "Connect to Stripe",
                    "Conectar con Stripe",
                    "Se connecter à Stripe",
                  ])}
            </button>
          </div>
        )}
      </Card>

      <PlanForm connected={connected} />

      <Card
        className="mt-4"
        title={tr(["Assinantes", "Subscribers", "Suscriptores", "Abonnés"])}
        padded={false}
      >
        {(subscribers.data ?? []).length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            {tr([
              "Ninguém assinou ainda.",
              "No subscribers yet.",
              "Aún no hay suscriptores.",
              "Aucun abonné pour l'instant.",
            ])}
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {(subscribers.data ?? []).map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={s.name} url={s.avatarUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    @{s.username} ·{" "}
                    {formatDate(s.createdAt, locale, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                  {s.status}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatMoney(s.priceCents, locale)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ContentManager userId={userId} />
    </>
  );
}

function PlanForm({ connected }: { connected: boolean }) {
  const tr = useTr();
  const { user } = useAuth();
  const plan = useMemberPlan(user?.id);
  const save = useSaveMemberPlan();
  const p = plan.data;
  const [title, setTitle] = useState("Perfil de membros");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("29,90");
  const [discount, setDiscount] = useState(10);
  const [benefits, setBenefits] = useState("");
  const [active, setActive] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!p || loaded) return;
    setTitle(p.title);
    setDescription(p.description);
    setPrice((p.priceCents / 100).toFixed(2).replace(".", ","));
    setDiscount(p.discountPercent);
    setBenefits(p.benefits.join("\n"));
    setActive(p.active);
    setLoaded(true);
  }, [p, loaded]);

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const priceCents = Math.round(parseFloat(price.replace(/\./g, "").replace(",", ".")) * 100);
    if (!Number.isFinite(priceCents) || priceCents < 1000 || priceCents > 50000) {
      toast.error(
        tr([
          "A mensalidade deve ficar entre R$ 10 e R$ 500.",
          "Monthly price must be between R$ 10 and R$ 500.",
          "La mensualidad debe estar entre R$ 10 y R$ 500.",
          "La mensualité doit être comprise entre R$ 10 et R$ 500.",
        ]),
      );
      return;
    }
    save.mutate(
      {
        title,
        description,
        priceCents,
        discountPercent: discount,
        benefits: benefits
          .split("\n")
          .map((b) => b.trim())
          .filter(Boolean)
          .slice(0, 8),
        active,
      },
      {
        onSuccess: () =>
          toast.success(
            tr(["Plano salvo.", "Plan saved.", "Plan guardado.", "Offre enregistrée."]),
          ),
      },
    );
  };

  return (
    <Card
      className="mt-4"
      title={tr([
        "Seu plano de membros",
        "Your members plan",
        "Tu plan de miembros",
        "Votre offre membres",
      ])}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label={tr(["Nome do plano", "Plan name", "Nombre del plan", "Nom de l'offre"])}>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            required
          />
        </Field>
        <Field label={tr(["Descrição", "Description", "Descripción", "Description"])}>
          <textarea
            className={inputClass}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={tr([
              "Mensalidade (R$ 10 a 500)",
              "Monthly price (R$ 10–500)",
              "Mensualidad (R$ 10–500)",
              "Mensualité (R$ 10–500)",
            ])}
          >
            <input
              className={inputClass}
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </Field>
          <Field
            label={`${tr(["Desconto nas consultas para membros", "Consultation discount for members", "Descuento en consultas para miembros", "Réduction sur les consultations pour les membres"])}: ${discount}%`}
          >
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </Field>
        </div>
        <Field
          label={tr([
            "Benefícios (um por linha, até 8)",
            "Benefits (one per line, up to 8)",
            "Beneficios (uno por línea, hasta 8)",
            "Avantages (un par ligne, jusqu'à 8)",
          ])}
        >
          <textarea
            className={inputClass}
            rows={4}
            value={benefits}
            onChange={(e) => setBenefits(e.target.value)}
            placeholder={"Receitas exclusivas\nLives mensais"}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={active}
            disabled={!connected}
            onChange={(e) => setActive(e.target.checked)}
          />
          {tr([
            "Aceitar novos membros",
            "Accept new members",
            "Aceptar nuevos miembros",
            "Accepter de nouveaux membres",
          ])}
          {!connected && (
            <span className="text-xs text-muted-foreground">
              (
              {tr([
                "conecte a conta de recebimento",
                "connect your payout account",
                "conecta tu cuenta de cobro",
                "connectez votre compte",
              ])}
              )
            </span>
          )}
        </label>
        <button type="submit" disabled={save.isPending} className={buttonPrimary}>
          {tr(["Salvar plano", "Save plan", "Guardar plan", "Enregistrer"])}
        </button>
      </form>
    </Card>
  );
}

function ContentManager({ userId }: { userId: string }) {
  const tr = useTr();
  const { locale } = useClinicalI18n();
  const content = useMemberContent(userId);
  const publish = usePublishMemberContent();
  const remove = useDeleteMemberContent();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  return (
    <Card
      className="mt-4"
      title={tr([
        "Conteúdo exclusivo",
        "Exclusive content",
        "Contenido exclusivo",
        "Contenu exclusif",
      ])}
    >
      <form
        className="space-y-3"
        onSubmit={(ev) => {
          ev.preventDefault();
          publish.mutate(
            { title: title.trim(), body: body.trim() },
            {
              onSuccess: () => {
                setTitle("");
                setBody("");
                toast.success(
                  tr([
                    "Publicado para os membros.",
                    "Published for members.",
                    "Publicado para los miembros.",
                    "Publié pour les membres.",
                  ]),
                );
              },
            },
          );
        }}
      >
        <input
          className={inputClass}
          placeholder={tr(["Título", "Title", "Título", "Titre"])}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          required
        />
        <textarea
          className={inputClass}
          rows={4}
          placeholder={tr([
            "Texto, receita, orientação…",
            "Text, recipe, guidance…",
            "Texto, receta, orientación…",
            "Texte, recette, conseils…",
          ])}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={8000}
          required
        />
        <button type="submit" disabled={publish.isPending} className={buttonPrimary}>
          {tr([
            "Publicar para membros",
            "Publish for members",
            "Publicar para miembros",
            "Publier pour les membres",
          ])}
        </button>
      </form>

      <ul className="mt-4 divide-y divide-border/60">
        {(content.data ?? []).map((c) => (
          <li key={c.id} className="flex items-start gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{c.title}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">{c.body}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {formatDate(c.createdAt, locale, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <button
              type="button"
              aria-label={tr(["Apagar", "Delete", "Borrar", "Supprimer"])}
              onClick={() => remove.mutate(c.id)}
              className="rounded-lg p-2 text-destructive transition hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

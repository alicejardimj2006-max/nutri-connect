// Modo sem números (N7): interruptor e cartão de apoio quando aparecem sinais de alerta no diário.
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { EyeOff, HeartHandshake, Phone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTr } from "@/components/settings-ui";
import { useNoNumbers, useSetNoNumbers } from "@/lib/no-numbers";
import { cn } from "@/lib/utils";

/** Interruptor do modo sem números, com a explicação. */
export function NoNumbersToggle({ className }: { className?: string }) {
  const tr = useTr();
  const on = useNoNumbers();
  const set = useSetNoNumbers();
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-xs",
        className,
      )}
    >
      <div className="flex gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-accent">
          <EyeOff className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {tr(["Modo sem números", "No-numbers mode", "Modo sin números", "Mode sans chiffres"])}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {tr([
              "Esconde peso, porcentagens, quantidades e tabelas. Você acompanha pela fome, saciedade e como se sente. Sua nutri continua vendo tudo.",
              "Hides weight, percentages, amounts and tables. You follow hunger, fullness and how you feel. Your dietitian still sees everything.",
              "Oculta peso, porcentajes, cantidades y tablas. Te guías por el hambre, la saciedad y cómo te sientes. Tu nutri sigue viéndolo todo.",
              "Masque le poids, les pourcentages, les quantités et les tableaux. Vous suivez la faim, la satiété et vos ressentis. Votre diététicien(ne) voit toujours tout.",
            ])}
          </p>
        </div>
      </div>
      <Switch
        checked={on}
        disabled={set.isPending}
        onCheckedChange={(v) =>
          set.mutate(v, { onError: (err) => toast.error((err as Error).message) })
        }
        aria-label={tr([
          "Modo sem números",
          "No-numbers mode",
          "Modo sin números",
          "Mode sans chiffres",
        ])}
      />
    </div>
  );
}

/**
 * Apoio quando a pessoa marca um sinal de alerta (culpa forte, perda de controle, comer escondido,
 * compensar, restringir, purgar). Acolhe e mostra caminhos de ajuda; nada é enviado sozinho.
 */
export function SupportCard({ hasCare, className }: { hasCare: boolean; className?: string }) {
  const tr = useTr();
  return (
    <div
      role="note"
      className={cn("rounded-2xl border border-accent/30 bg-accent-soft/40 p-4", className)}
    >
      <p className="flex items-center gap-2 text-sm font-bold text-foreground">
        <HeartHandshake className="h-4 w-4 text-accent" />
        {tr([
          "Obrigada por contar. Você não está sozinho(a).",
          "Thank you for sharing. You're not alone.",
          "Gracias por contarlo. No estás solo(a).",
          "Merci de l'avoir partagé. Vous n'êtes pas seul(e).",
        ])}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-foreground/85">
        {tr([
          "Esses sentimentos são comuns e merecem cuidado, não culpa. Conversar com um(a) nutricionista ou psicólogo(a) ajuda muito, e falar disso é um passo de coragem.",
          "These feelings are common and deserve care, not guilt. Talking to a dietitian or psychologist helps a lot, and bringing it up takes courage.",
          "Estos sentimientos son comunes y merecen cuidado, no culpa. Hablar con un(a) nutricionista o psicólogo(a) ayuda mucho, y contarlo es un paso valiente.",
          "Ces ressentis sont fréquents et méritent du soin, pas de la culpabilité. En parler à un(e) diététicien(ne) ou psychologue aide beaucoup, et c'est un acte de courage.",
        ])}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {hasCare ? (
          <Link
            to="/acompanhamento/mensagens"
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            {tr([
              "Falar com a minha nutri",
              "Talk to my dietitian",
              "Hablar con mi nutri",
              "Parler à mon/ma diététicien(ne)",
            ])}
          </Link>
        ) : (
          <Link
            to="/profissionais"
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            {tr([
              "Encontrar um(a) profissional",
              "Find a professional",
              "Encontrar un(a) profesional",
              "Trouver un(e) professionnel(le)",
            ])}
          </Link>
        )}
        <a
          href="tel:188"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary"
        >
          <Phone className="h-3.5 w-3.5" />
          {tr([
            "CVV: ligue 188",
            "CVV (Brazil): call 188",
            "CVV (Brasil): llama al 188",
            "CVV (Brésil) : appelez le 188",
          ])}
        </a>
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        {tr([
          "O CVV atende 24 horas, de graça, por telefone (188) e pelo chat em cvv.org.br. Em emergência, ligue 192 (SAMU).",
          "CVV answers 24/7, free, by phone (188) and chat at cvv.org.br. In an emergency, call 192 (SAMU).",
          "El CVV atiende 24 horas, gratis, por teléfono (188) y chat en cvv.org.br. En emergencia, llama al 192 (SAMU).",
          "Le CVV répond 24 h/24, gratuitement, par téléphone (188) et chat sur cvv.org.br. En urgence, appelez le 192 (SAMU).",
        ])}
      </p>
    </div>
  );
}

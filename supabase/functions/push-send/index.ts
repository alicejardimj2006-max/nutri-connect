// Envia as notificações push (app instalável).
// - Chamada pelo pg_cron a cada minuto (header x-cron-secret): pede a public.push_claim() os
//   lembretes na hora, os avisos de consulta e os avisos do site da fila, e entrega a cada aparelho.
// - Chamada por alguém logado com { test: true }: manda um aviso de teste aos aparelhos da pessoa.
// Aparelhos que não existem mais (resposta 404/410) são removidos.
//
// Segredos: CRON_SECRET, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY. Opcional: VAPID_SUBJECT.
import webpush from "npm:web-push@3.6.7";
import { HttpError, env, json, serve } from "../_shared/http.ts";
import { adminClient, requireUser } from "../_shared/supabase.ts";

type Locale = "pt-BR" | "en" | "es" | "fr";
type Names = [string, string, string, string];

interface Item {
  user_id: string;
  kind: "lembrete" | "consulta" | "aviso" | "teste";
  payload: Record<string, unknown>;
}

const LOCALES: Locale[] = ["pt-BR", "en", "es", "fr"];
const pick = (names: Names, locale: Locale) => names[Math.max(0, LOCALES.indexOf(locale))];
const str = (v: unknown) => (typeof v === "string" ? v : "");

// Texto de cada aviso do site ({name} = quem fez a ação). Mesmo sentido do que aparece em /notificacoes.
const AVISOS: Record<string, Names> = {
  reacao: [
    "{name} apoiou a sua publicação",
    "{name} supported your post",
    "{name} apoyó tu publicación",
    "{name} a soutenu votre publication",
  ],
  comentario: [
    "{name} comentou na sua publicação",
    "{name} commented on your post",
    "{name} comentó tu publicación",
    "{name} a commenté votre publication",
  ],
  seguidor: [
    "{name} começou a seguir você",
    "{name} started following you",
    "{name} empezó a seguirte",
    "{name} a commencé à vous suivre",
  ],
  amizade_pedido: [
    "{name} quer ser seu amigo(a)",
    "{name} wants to be your friend",
    "{name} quiere ser tu amigo(a)",
    "{name} veut devenir votre ami(e)",
  ],
  amizade_aceita: [
    "{name} aceitou o seu pedido de amizade",
    "{name} accepted your friend request",
    "{name} aceptó tu solicitud de amistad",
    "{name} a accepté votre demande d'ami",
  ],
  consulta_agendada: [
    "{name} agendou uma consulta",
    "{name} booked an appointment",
    "{name} agendó una consulta",
    "{name} a réservé une consultation",
  ],
  consulta_confirmada: [
    "{name} confirmou a sua consulta",
    "{name} confirmed your appointment",
    "{name} confirmó tu consulta",
    "{name} a confirmé votre consultation",
  ],
  consulta_cancelada: [
    "{name} cancelou a consulta",
    "{name} cancelled the appointment",
    "{name} canceló la consulta",
    "{name} a annulé la consultation",
  ],
  consulta_remarcada: [
    "{name} remarcou a consulta",
    "{name} rescheduled the appointment",
    "{name} reprogramó la consulta",
    "{name} a reprogrammé la consultation",
  ],
  consulta_sala: [
    "{name} entrou na sala da consulta",
    "{name} joined the appointment room",
    "{name} entró a la sala de la consulta",
    "{name} est entré(e) dans la salle",
  ],
  mensagem: [
    "{name} enviou uma mensagem",
    "{name} sent a message",
    "{name} envió un mensaje",
    "{name} a envoyé un message",
  ],
  plano_cuidado: [
    "{name} enviou um plano de cuidado para você",
    "{name} sent you a care plan",
    "{name} te envió un plan de cuidado",
    "{name} vous a envoyé un plan de soins",
  ],
  plano_publicado: [
    "{name} publicou um plano alimentar para você",
    "{name} published a meal plan for you",
    "{name} publicó un plan alimentario para ti",
    "{name} a publié un plan alimentaire pour vous",
  ],
  avaliacao_registrada: [
    "{name} registrou uma avaliação no seu acompanhamento",
    "{name} recorded an assessment in your care record",
    "{name} registró una evaluación en tu seguimiento",
    "{name} a enregistré une évaluation dans votre suivi",
  ],
  acompanhamento_pedido: [
    "{name} pediu para ser acompanhado(a) por você",
    "{name} asked you to follow their care",
    "{name} pidió que lo(a) acompañes",
    "{name} vous demande de suivre son parcours",
  ],
  convite_aceito: [
    "{name} aceitou o seu convite",
    "{name} accepted your invitation",
    "{name} aceptó tu invitación",
    "{name} a accepté votre invitation",
  ],
  acompanhamento_aceito: [
    "{name} passou a acompanhar você",
    "{name} is now following your care",
    "{name} ahora te acompaña",
    "{name} vous accompagne désormais",
  ],
  diario_comentario: [
    "{name} comentou no seu diário alimentar",
    "{name} commented on your food diary",
    "{name} comentó tu diario alimentario",
    "{name} a commenté votre journal alimentaire",
  ],
  membro_novo: [
    "{name} virou membro do seu perfil",
    "{name} became a member of your profile",
    "{name} se hizo miembro de tu perfil",
    "{name} est devenu(e) membre de votre profil",
  ],
  tema_previa: [
    "Vem aí um novo Tema da Semana",
    "A new Weekly Theme is coming",
    "Se viene un nuevo Tema de la Semana",
    "Un nouveau Thème de la semaine arrive",
  ],
  tema_ativo: [
    "Saiu o novo Tema da Semana!",
    "The new Weekly Theme is out!",
    "¡Salió el nuevo Tema de la Semana!",
    "Le nouveau Thème de la semaine est là !",
  ],
  conteudo_oculto: [
    "Um conteúdo seu foi ocultado pela moderação",
    "One of your items was hidden by moderation",
    "Un contenido tuyo fue ocultado por moderación",
    "L'un de vos contenus a été masqué par la modération",
  ],
  conteudo_liberado: [
    "Um conteúdo seu foi liberado pela moderação",
    "One of your items was restored by moderation",
    "Un contenido tuyo fue liberado por moderación",
    "L'un de vos contenus a été rétabli par la modération",
  ],
};

const GENERIC: Names = [
  "Você tem um novo aviso",
  "You have a new notice",
  "Tienes un nuevo aviso",
  "Vous avez un nouvel avis",
];
const SOMEONE: Names = ["Alguém", "Someone", "Alguien", "Quelqu'un"];

function compose(item: Item): { title: string; body: string; url: string; tag: string } {
  const p = item.payload;
  const locale = (LOCALES.includes(p.locale as Locale) ? p.locale : "pt-BR") as Locale;
  const url = str(p.url) || "/notificacoes";
  const tag = str(p.tag) || item.kind;
  const preview = p.preview !== false;
  const title = "NutriConnect";
  if (!preview) return { title, body: pick(GENERIC, locale), url, tag };

  if (item.kind === "teste") {
    return {
      title,
      body: pick(
        [
          "Tudo certo! As notificações estão chegando neste aparelho. 💚",
          "All set! Notifications are reaching this device. 💚",
          "¡Listo! Las notificaciones llegan a este dispositivo. 💚",
          "C'est bon ! Les notifications arrivent sur cet appareil. 💚",
        ],
        locale,
      ),
      url,
      tag,
    };
  }
  if (item.kind === "lembrete") {
    return { title: str(p.title) || title, body: str(p.body), url, tag };
  }
  if (item.kind === "consulta") {
    const minutes = Number(p.minutes) || 60;
    const when =
      minutes >= 90
        ? pick(
            [`em ${Math.round(minutes / 60)} h`, `in ${Math.round(minutes / 60)} h`, `en ${Math.round(minutes / 60)} h`, `dans ${Math.round(minutes / 60)} h`],
            locale,
          )
        : pick([`em ${minutes} min`, `in ${minutes} min`, `en ${minutes} min`, `dans ${minutes} min`], locale);
    const other = str(p.other);
    return {
      title,
      body: other
        ? pick(
            [
              `Sua consulta com ${other} começa ${when}.`,
              `Your appointment with ${other} starts ${when}.`,
              `Tu consulta con ${other} empieza ${when}.`,
              `Votre consultation avec ${other} commence ${when}.`,
            ],
            locale,
          )
        : pick(
            [
              `Sua consulta começa ${when}.`,
              `Your appointment starts ${when}.`,
              `Tu consulta empieza ${when}.`,
              `Votre consultation commence ${when}.`,
            ],
            locale,
          ),
      url,
      tag,
    };
  }
  // Aviso do site.
  const names = AVISOS[str(p.type)];
  const name = str(p.actor) || pick(SOMEONE, locale);
  return { title, body: names ? pick(names, locale).replace("{name}", name) : pick(GENERIC, locale), url, tag };
}

async function deliver(items: Item[]) {
  if (!items.length) return { sent: 0, removed: 0 };
  const admin = adminClient();
  const users = [...new Set(items.map((i) => i.user_id))];
  const { data: subs, error } = await admin
    .from("push_subscriptions")
    .select("endpoint, user_id, p256dh, auth, failures")
    .in("user_id", users);
  if (error) throw new HttpError(500, error.message);

  let sent = 0;
  const gone: string[] = [];
  const ok: string[] = [];
  const failed: { endpoint: string; failures: number }[] = [];
  await Promise.all(
    items.flatMap((item) => {
      const message = JSON.stringify(compose(item));
      return (subs ?? [])
        .filter((s) => s.user_id === item.user_id)
        .map(async (s) => {
          try {
            await webpush.sendNotification(
              { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
              message,
              { TTL: 60 * 60 * 6, urgency: item.kind === "consulta" ? "high" : "normal" },
            );
            sent++;
            ok.push(s.endpoint);
          } catch (err) {
            const status = (err as { statusCode?: number }).statusCode;
            if (status === 404 || status === 410) gone.push(s.endpoint);
            else {
              console.error("push-send", status, String((err as Error).message).slice(0, 200));
              failed.push({ endpoint: s.endpoint, failures: (s.failures ?? 0) + 1 });
            }
          }
        });
    }),
  );

  if (gone.length) await admin.from("push_subscriptions").delete().in("endpoint", gone);
  if (ok.length) {
    await admin
      .from("push_subscriptions")
      .update({ last_success_at: new Date().toISOString(), failures: 0 })
      .in("endpoint", [...new Set(ok)]);
  }
  for (const f of failed) {
    // Muitas falhas seguidas: o aparelho provavelmente não existe mais.
    if (f.failures >= 10) await admin.from("push_subscriptions").delete().eq("endpoint", f.endpoint);
    else await admin.from("push_subscriptions").update({ failures: f.failures }).eq("endpoint", f.endpoint);
  }
  return { sent, removed: gone.length };
}

serve(async (req) => {
  if (req.method !== "POST") throw new HttpError(405, "Método não permitido.");
  webpush.setVapidDetails(
    Deno.env.get("VAPID_SUBJECT") ?? "mailto:suporte@nutriconnect.com.br",
    env("VAPID_PUBLIC_KEY"),
    env("VAPID_PRIVATE_KEY"),
  );

  const cron = req.headers.get("x-cron-secret");
  if (cron !== null) {
    if (cron !== env("CRON_SECRET")) throw new HttpError(401, "Não autorizado.");
    const { data, error } = await adminClient().rpc("push_claim");
    if (error) throw new HttpError(500, error.message);
    return json({ ok: true, ...(await deliver((data ?? []) as Item[])) });
  }

  // Teste pedido pela própria pessoa (botão "Testar" nas configurações).
  const user = await requireUser(req);
  const body = (await req.json().catch(() => ({}))) as { test?: boolean; locale?: string };
  if (!body.test) throw new HttpError(400, "Pedido inválido.");
  const result = await deliver([
    {
      user_id: user.id,
      kind: "teste",
      payload: { url: "/perfil/configuracoes/notificacoes", tag: "teste", locale: body.locale },
    },
  ]);
  return json({ ok: true, ...result });
});

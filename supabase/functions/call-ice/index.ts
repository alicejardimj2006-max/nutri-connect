// Servidores ICE da videoconsulta. STUN públicos resolvem a maioria das redes; para redes mais
// fechadas (4G, empresas, NAT simétrico) é preciso um TURN, que retransmite a mídia criptografada.
//
// Só entrega credenciais a quem é paciente ou profissional de uma consulta on-line com a sala aberta.
//
// Segredos opcionais (o primeiro configurado vale):
//  - CLOUDFLARE_TURN_KEY_ID + CLOUDFLARE_TURN_API_TOKEN: credenciais temporárias do TURN da Cloudflare.
//  - TURN_URLS (separadas por vírgula) + TURN_USERNAME + TURN_CREDENTIAL: um TURN próprio (ex.: coturn).
import { HttpError, json, serve } from "../_shared/http.ts";
import { adminClient, requireUser } from "../_shared/supabase.ts";

const STUN: RTCIceServer[] = [
  { urls: ["stun:stun.cloudflare.com:3478", "stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
];

interface RTCIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

async function turnServers(): Promise<RTCIceServer[]> {
  const keyId = Deno.env.get("CLOUDFLARE_TURN_KEY_ID");
  const token = Deno.env.get("CLOUDFLARE_TURN_API_TOKEN");
  if (keyId && token) {
    const res = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${keyId}/credentials/generate-ice-servers`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ttl: 4 * 60 * 60 }),
      },
    ).catch(() => null);
    if (res?.ok) {
      const body = (await res.json().catch(() => null)) as { iceServers?: RTCIceServer | RTCIceServer[] } | null;
      const list = body?.iceServers;
      if (list) return Array.isArray(list) ? list : [list];
    } else {
      console.error("TURN da Cloudflare indisponível", res?.status);
    }
  }
  const urls = Deno.env.get("TURN_URLS");
  if (urls) {
    return [
      {
        urls: urls.split(",").map((u) => u.trim()).filter(Boolean),
        username: Deno.env.get("TURN_USERNAME") ?? undefined,
        credential: Deno.env.get("TURN_CREDENTIAL") ?? undefined,
      },
    ];
  }
  return [];
}

serve(async (req) => {
  const user = await requireUser(req);
  const { appointmentId } = (await req.json().catch(() => ({}))) as { appointmentId?: string };
  if (!appointmentId || !/^[0-9a-f-]{36}$/i.test(appointmentId)) {
    throw new HttpError(400, "Consulta inválida.");
  }

  const { data: appt } = await adminClient()
    .from("appointments")
    .select("patient_id, professional_id, modality, status, starts_at, ends_at")
    .eq("id", appointmentId)
    .maybeSingle();
  if (!appt || ![appt.patient_id, appt.professional_id].includes(user.id)) {
    throw new HttpError(404, "Consulta não encontrada.");
  }
  const now = Date.now();
  const open =
    appt.modality === "online" &&
    ["agendada", "confirmada", "realizada"].includes(appt.status) &&
    now >= new Date(appt.starts_at).getTime() - 30 * 60_000 &&
    now <= new Date(appt.ends_at).getTime() + 60 * 60_000;
  if (!open) throw new HttpError(403, "A sala desta consulta não está aberta agora.");

  const turn = await turnServers();
  return json({ iceServers: [...STUN, ...turn], relay: turn.length > 0 });
});

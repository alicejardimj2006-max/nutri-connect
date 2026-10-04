// Sala de videoconsulta do NutriConnect: sala de espera (teste de câmera e microfone), chamada,
// chat e, para o profissional, o prontuário da consulta — tudo dentro do site.
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  Maximize,
  MessageSquare,
  Mic,
  MicOff,
  Minimize,
  MonitorOff,
  MonitorUp,
  NotebookPen,
  PhoneOff,
  RefreshCw,
  Send,
  ShieldCheck,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTr } from "@/components/settings-ui";
import type { Names } from "@/lib/appearance-data";
import type { Appointment, PersonSummary } from "@/lib/clinical/api";
import * as api from "@/lib/clinical/api";
import * as records from "@/lib/clinical/records";
import { useClinicalMutation, useNotes } from "@/lib/clinical/queries";
import { formatDate, formatTime } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import {
  useAudioLevel,
  type CallRole,
  type ChatMessage,
  type Devices,
  type MediaError,
  type PeerPresence,
  type Quality,
  type useConsultationCall,
  type useLocalMedia,
} from "@/lib/clinical/video-call";

type Local = ReturnType<typeof useLocalMedia>;
type Call = ReturnType<typeof useConsultationCall>;

// ─────────────────────────────── Peças ───────────────────────────────

export function RoomShell({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-[#0d0f12] text-white">
      {children}
    </div>
  );
}

export function RoomAvatar({ person, size = 96 }: { person?: PersonSummary; size?: number }) {
  const initials = (person?.name ?? "…")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return person?.avatarUrl ? (
    <img
      src={person.avatarUrl}
      alt=""
      className="shrink-0 rounded-full object-cover ring-4 ring-white/10"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 font-display font-bold ring-4 ring-white/10"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}

function VideoEl({
  stream,
  muted,
  mirror,
  fit = "cover",
  sinkId,
  className,
}: {
  stream: MediaStream | null;
  muted?: boolean;
  mirror?: boolean;
  fit?: "cover" | "contain";
  sinkId?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (v.srcObject !== stream) v.srcObject = stream;
    if (stream) void v.play().catch(() => {});
  }, [stream]);
  useEffect(() => {
    const v = ref.current as (HTMLVideoElement & { setSinkId?: (id: string) => Promise<void> }) | null;
    if (v?.setSinkId && sinkId) void v.setSinkId(sinkId).catch(() => {});
  }, [sinkId]);
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={cn(
        "h-full w-full",
        fit === "cover" ? "object-cover" : "object-contain",
        mirror && "-scale-x-100",
        className,
      )}
    />
  );
}

function RoundButton({
  on = true,
  danger,
  label,
  onClick,
  children,
  badge,
  wide,
  disabled,
}: {
  on?: boolean;
  danger?: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
  badge?: number;
  wide?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={!danger ? on : undefined}
      disabled={disabled}
      className={cn(
        "relative grid h-12 cursor-pointer place-items-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40",
        wide ? "w-16" : "w-12",
        danger
          ? "bg-red-600 hover:bg-red-500"
          : on
            ? "bg-white/12 hover:bg-white/20"
            : "bg-white text-[#0d0f12] hover:bg-white/90",
      )}
    >
      {children}
      {!!badge && (
        <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}

function QualityBadge({ quality, relayed }: { quality: Quality | null; relayed: boolean }) {
  const tr = useTr();
  if (!quality) return null;
  const meta = {
    boa: { Icon: SignalHigh, color: "text-emerald-400", text: tr(["Conexão boa", "Good connection", "Conexión buena", "Bonne connexion"]) },
    instavel: { Icon: SignalMedium, color: "text-amber-300", text: tr(["Conexão instável", "Unstable connection", "Conexión inestable", "Connexion instable"]) },
    ruim: { Icon: SignalLow, color: "text-red-400", text: tr(["Conexão fraca", "Weak connection", "Conexión débil", "Connexion faible"]) },
  }[quality];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium backdrop-blur"
      title={relayed ? tr(["Via servidor de retransmissão", "Via relay server", "Vía servidor de retransmisión", "Via un serveur relais"]) : undefined}
    >
      <meta.Icon className={cn("h-3.5 w-3.5", meta.color)} />
      <span className="hidden sm:inline">{meta.text}</span>
    </span>
  );
}

/** Relógio da consulta: quanto falta para o horário de término. */
function ConsultClock({ appt, now }: { appt: Appointment; now: number }) {
  const tr = useTr();
  const { locale } = useClinicalI18n();
  const end = new Date(appt.ends_at).getTime();
  const left = Math.round((end - now) / 60_000);
  const over = left < 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur",
        over ? "bg-amber-500/25 text-amber-200" : left <= 5 ? "bg-amber-500/20 text-amber-100" : "bg-black/45",
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      {over
        ? tr(["Passou do horário", "Past end time", "Pasó del horario", "Horaire dépassé"])
        : `${tr(["Termina às", "Ends at", "Termina a las", "Se termine à"])} ${formatTime(appt.ends_at, locale)} · ${left} min`}
    </span>
  );
}

// ─────────────────────────────── Avisos (sala fechada etc.) ───────────────────────────────

export function RoomNotice({
  icon,
  title,
  text,
  backTo,
  children,
}: {
  icon: ReactNode;
  title: string;
  text?: string;
  backTo: string;
  children?: ReactNode;
}) {
  const tr = useTr();
  return (
    <RoomShell>
      <div className="m-auto flex max-w-md flex-col items-center px-6 text-center">
        <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-white/8 text-white/85">{icon}</div>
        <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
        {text && <p className="mt-2 text-sm leading-relaxed text-white/65">{text}</p>}
        {children}
        <Link
          to={backTo}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/18"
        >
          <ArrowLeft className="h-4 w-4" />
          {tr(["Voltar às consultas", "Back to appointments", "Volver a las consultas", "Retour aux consultations"])}
        </Link>
      </div>
    </RoomShell>
  );
}

// ─────────────────────────────── Sala de espera ───────────────────────────────

const ERROR_TEXT: Record<MediaError, Names> = {
  denied: [
    "O navegador bloqueou a câmera e o microfone. Clique no cadeado ao lado do endereço do site, permita câmera e microfone e tente de novo.",
    "Your browser blocked the camera and microphone. Click the lock next to the address bar, allow camera and microphone, and try again.",
    "El navegador bloqueó la cámara y el micrófono. Haz clic en el candado junto a la dirección, permite cámara y micrófono e inténtalo de nuevo.",
    "Le navigateur a bloqué la caméra et le micro. Cliquez sur le cadenas près de l'adresse, autorisez caméra et micro, puis réessayez.",
  ],
  notfound: [
    "Não encontramos câmera nem microfone neste aparelho. Você ainda pode entrar e ouvir/ver a outra pessoa.",
    "No camera or microphone found on this device. You can still join and see/hear the other person.",
    "No encontramos cámara ni micrófono en este dispositivo. Aún puedes entrar y ver/oír a la otra persona.",
    "Aucune caméra ni micro trouvés sur cet appareil. Vous pouvez quand même entrer et voir/entendre l'autre personne.",
  ],
  insecure: [
    "A chamada só funciona em conexão segura (https).",
    "Calls only work over a secure connection (https).",
    "La llamada solo funciona con conexión segura (https).",
    "L'appel ne fonctionne qu'en connexion sécurisée (https).",
  ],
  other: [
    "Não deu para ligar a câmera e o microfone. Feche outros apps que estejam usando a câmera e tente de novo.",
    "Couldn't start the camera and microphone. Close other apps using the camera and try again.",
    "No se pudo encender la cámara y el micrófono. Cierra otras apps que usen la cámara e inténtalo de nuevo.",
    "Impossible de démarrer la caméra et le micro. Fermez les autres applis qui l'utilisent et réessayez.",
  ],
};

function DeviceSelect({
  label,
  list,
  value,
  onChange,
}: {
  label: string;
  list: MediaDeviceInfo[];
  value: string;
  onChange: (id: string) => void;
}) {
  if (list.length < 2) return null;
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-white/50">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full cursor-pointer rounded-xl border border-white/12 bg-white/6 px-3 text-sm text-white outline-none focus:border-emerald-400"
      >
        {list.map((d, i) => (
          <option key={d.deviceId} value={d.deviceId} className="bg-[#1a1d22]">
            {d.label || `${label} ${i + 1}`}
          </option>
        ))}
      </select>
    </label>
  );
}

function PeerStatus({ peer, name }: { peer: PeerPresence | null; name: string }) {
  const tr = useTr();
  const first = name.split(" ")[0] || name;
  const [dot, text] = !peer
    ? ["bg-white/30", tr([`${first} ainda não entrou`, `${first} hasn't joined yet`, `${first} aún no ha entrado`, `${first} n'est pas encore arrivé(e)`])]
    : peer.inCall
      ? ["bg-emerald-400 animate-pulse", tr([`${first} já está na consulta`, `${first} is already in the call`, `${first} ya está en la consulta`, `${first} est déjà dans l'appel`])]
      : ["bg-amber-300", tr([`${first} está na sala de espera`, `${first} is in the waiting room`, `${first} está en la sala de espera`, `${first} est en salle d'attente`])];
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-xs font-medium">
      <span className={cn("h-2 w-2 rounded-full", dot)} />
      {text}
    </span>
  );
}

export function Lobby({
  appt,
  other,
  role,
  local,
  call,
  sinkId,
  setSinkId,
  onJoin,
  backTo,
}: {
  appt: Appointment;
  other?: PersonSummary;
  role: CallRole;
  local: Local;
  call: Call;
  sinkId: string;
  setSinkId: (id: string) => void;
  onJoin: () => void;
  backTo: string;
}) {
  const tr = useTr();
  const { locale } = useClinicalI18n();
  const level = useAudioLevel(local.stream, local.mic);
  const devices: Devices = local.devices;
  const canSink =
    typeof HTMLMediaElement !== "undefined" && "setSinkId" in HTMLMediaElement.prototype && devices.audiooutput.length > 1;

  return (
    <RoomShell>
      <header className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <Link
          to={backTo}
          aria-label={tr(["Voltar", "Back", "Volver", "Retour"])}
          className="grid h-9 w-9 place-items-center rounded-full bg-white/8 transition hover:bg-white/15"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="font-display text-lg font-bold">
          Nutri<span className="text-emerald-400">Connect</span>
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-white/55">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="hidden sm:inline">
            {tr(["Chamada criptografada, sem gravação", "Encrypted call, never recorded", "Llamada cifrada, sin grabación", "Appel chiffré, jamais enregistré"])}
          </span>
        </span>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-6 overflow-y-auto px-4 pb-6 sm:px-6 lg:grid-cols-[1.45fr_1fr] lg:gap-10">
        {/* Prévia da câmera */}
        <section className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-[#1a1d22] shadow-2xl ring-1 ring-white/8 sm:aspect-video">
          {local.stream && local.cam ? (
            <VideoEl stream={local.stream} muted mirror />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              {local.starting ? (
                <Loader2 className="h-8 w-8 animate-spin text-white/60" />
              ) : local.stream ? (
                <div className="flex flex-col items-center gap-2 text-white/60">
                  <VideoOff className="h-8 w-8" />
                  <span className="text-sm">{tr(["Câmera desligada", "Camera off", "Cámara apagada", "Caméra coupée"])}</span>
                </div>
              ) : (
                <div className="flex max-w-sm flex-col items-center gap-4 px-6 text-center">
                  <Video className="h-9 w-9 text-white/60" />
                  {local.error && <p className="text-sm leading-relaxed text-white/70">{tr(ERROR_TEXT[local.error])}</p>}
                  <button
                    type="button"
                    onClick={() => void local.start()}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0d0f12] transition hover:bg-white/90"
                  >
                    {local.error ? <RefreshCw className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                    {local.error
                      ? tr(["Tentar de novo", "Try again", "Intentar de nuevo", "Réessayer"])
                      : tr(["Ativar câmera e microfone", "Turn on camera and microphone", "Activar cámara y micrófono", "Activer caméra et micro"])}
                  </button>
                </div>
              )}
            </div>
          )}

          {local.stream && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
              <RoundButton
                on={local.mic}
                disabled={!local.hasAudio}
                label={local.mic ? tr(["Desligar microfone", "Mute", "Silenciar", "Couper le micro"]) : tr(["Ligar microfone", "Unmute", "Activar micrófono", "Activer le micro"])}
                onClick={local.toggleMic}
              >
                {local.mic ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </RoundButton>
              <RoundButton
                on={local.cam}
                disabled={!local.hasVideo}
                label={local.cam ? tr(["Desligar câmera", "Turn camera off", "Apagar cámara", "Couper la caméra"]) : tr(["Ligar câmera", "Turn camera on", "Encender cámara", "Activer la caméra"])}
                onClick={local.toggleCam}
              >
                {local.cam ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </RoundButton>
            </div>
          )}

          {local.stream && local.hasAudio && (
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-[11px] backdrop-blur">
              <Mic className="h-3.5 w-3.5" />
              <span className="flex h-2 w-16 overflow-hidden rounded-full bg-white/15" aria-hidden>
                <span className="h-full rounded-full bg-emerald-400 transition-[width] duration-75" style={{ width: `${Math.round(level * 100)}%` }} />
              </span>
            </div>
          )}
        </section>

        {/* Quem, quando e entrar */}
        <section className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <RoomAvatar person={other} size={76} />
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-emerald-400">
            {role === "patient"
              ? tr(["Sua consulta com", "Your appointment with", "Tu consulta con", "Votre consultation avec"])
              : tr(["Consulta com", "Appointment with", "Consulta con", "Consultation avec"])}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight text-white">{other?.name ?? "…"}</h1>
          <p className="mt-2 text-sm text-white/60">
            {formatDate(appt.starts_at, locale, { weekday: "long", day: "numeric", month: "long" })} ·{" "}
            {formatTime(appt.starts_at, locale)}–{formatTime(appt.ends_at, locale)}
          </p>
          <div className="mt-4">
            {call.channelState === "ready" ? (
              <PeerStatus peer={call.peer} name={other?.name ?? ""} />
            ) : call.channelState === "connecting" ? (
              <span className="inline-flex items-center gap-2 text-xs text-white/55">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {tr(["Abrindo a sala…", "Opening the room…", "Abriendo la sala…", "Ouverture de la salle…"])}
              </span>
            ) : null}
          </div>

          {call.channelState === "error" && (
            <p className="mt-4 rounded-2xl bg-red-500/15 px-4 py-3 text-sm leading-relaxed text-red-100">
              {tr([
                "Não foi possível abrir a sala agora. Atualize a página; se continuar, fale com a equipe pelo Fale conosco.",
                "We couldn't open the room right now. Refresh the page; if it persists, contact the team.",
                "No se pudo abrir la sala ahora. Actualiza la página; si continúa, contacta al equipo.",
                "Impossible d'ouvrir la salle pour l'instant. Actualisez la page ; si cela continue, contactez l'équipe.",
              ])}
            </p>
          )}

          <div className="mt-6 grid w-full max-w-sm gap-3 text-left">
            <DeviceSelect
              label={tr(["Microfone", "Microphone", "Micrófono", "Micro"])}
              list={devices.audioinput}
              value={local.audioId}
              onChange={(id) => void local.switchDevice("audio", id)}
            />
            <DeviceSelect
              label={tr(["Câmera", "Camera", "Cámara", "Caméra"])}
              list={devices.videoinput}
              value={local.videoId}
              onChange={(id) => void local.switchDevice("video", id)}
            />
            {canSink && (
              <DeviceSelect
                label={tr(["Saída de som", "Speaker", "Salida de audio", "Sortie audio"])}
                list={devices.audiooutput}
                value={sinkId}
                onChange={setSinkId}
              />
            )}
          </div>

          <button
            type="button"
            onClick={onJoin}
            disabled={call.channelState !== "ready"}
            className="mt-7 inline-flex h-13 w-full max-w-sm cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Video className="h-5 w-5" />
            {tr(["Entrar na consulta", "Join the appointment", "Entrar a la consulta", "Rejoindre la consultation"])}
          </button>
          <p className="mt-3 flex max-w-sm items-start gap-1.5 text-[11px] leading-relaxed text-white/45">
            <Lock className="mt-0.5 h-3 w-3 shrink-0" />
            {tr([
              "O áudio e o vídeo vão direto entre vocês dois, criptografados. Nada é gravado.",
              "Audio and video go straight between the two of you, encrypted. Nothing is recorded.",
              "El audio y el video van directo entre ustedes dos, cifrados. Nada se graba.",
              "L'audio et la vidéo passent directement entre vous deux, chiffrés. Rien n'est enregistré.",
            ])}
          </p>
        </section>
      </main>
    </RoomShell>
  );
}

// ─────────────────────────────── Chamada ───────────────────────────────

type Panel = "chat" | "notes" | null;

export function CallView({
  appt,
  other,
  role,
  local,
  call,
  sinkId,
  now,
  onLeave,
}: {
  appt: Appointment;
  other?: PersonSummary;
  role: CallRole;
  local: Local;
  call: Call;
  sinkId: string;
  now: number;
  onLeave: () => void;
}) {
  const tr = useTr();
  const rootRef = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [seen, setSeen] = useState(0);
  const [full, setFull] = useState(false);
  const peer = call.peer;
  const first = (other?.name ?? "").split(" ")[0];

  const unread = panel === "chat" ? 0 : call.messages.filter((m) => !m.mine).length - seen;
  useEffect(() => {
    if (panel === "chat") setSeen(call.messages.filter((m) => !m.mine).length);
  }, [panel, call.messages]);

  // Mensagem nova com o chat fechado: um balão acima dos controles por alguns segundos.
  const lastCount = useRef(0);
  const [preview, setPreview] = useState<ChatMessage | null>(null);
  useEffect(() => {
    const theirs = call.messages.filter((m) => !m.mine);
    if (theirs.length > lastCount.current && panel !== "chat") setPreview(theirs[theirs.length - 1]);
    lastCount.current = theirs.length;
  }, [call.messages, panel]);
  useEffect(() => {
    if (!preview) return;
    const id = window.setTimeout(() => setPreview(null), 6000);
    return () => window.clearTimeout(id);
  }, [preview]);
  useEffect(() => {
    if (panel === "chat") setPreview(null);
  }, [panel]);

  useEffect(() => {
    const onFs = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);
  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void rootRef.current?.requestFullscreen?.().catch(() => {});
  };

  const remoteHasVideo = !!call.remoteStream?.getVideoTracks().length;
  const showRemoteVideo = call.callState === "connected" || call.callState === "reconnecting";
  const remoteCamOff = !peer?.cam && !peer?.sharing;
  const selfStream = useMemo(
    () => (call.screenTrack ? new MediaStream([call.screenTrack]) : local.stream),
    [call.screenTrack, local.stream],
  );

  const status =
    call.callState === "connected"
      ? null
      : call.callState === "reconnecting"
        ? tr(["Reconectando…", "Reconnecting…", "Reconectando…", "Reconnexion…"])
        : call.callState === "connecting"
          ? tr(["Conectando…", "Connecting…", "Conectando…", "Connexion…"])
          : !peer
            ? tr([`Aguardando ${first} entrar…`, `Waiting for ${first} to join…`, `Esperando a que ${first} entre…`, `En attente de ${first}…`])
            : !peer.inCall
              ? tr([`${first} está na sala de espera e já vai entrar`, `${first} is in the waiting room and will join soon`, `${first} está en la sala de espera y ya entra`, `${first} est en salle d'attente et arrive`])
              : tr(["Conectando…", "Connecting…", "Conectando…", "Connexion…"]);

  return (
    <RoomShell>
      <div ref={rootRef} className="relative flex min-h-0 flex-1 bg-[#0d0f12]">
        {/* Palco */}
        <div className="relative min-w-0 flex-1 overflow-hidden">
          {showRemoteVideo && (
            <VideoEl
              stream={call.remoteStream}
              sinkId={sinkId}
              fit={peer?.sharing ? "contain" : "cover"}
              className={cn("absolute inset-0 bg-black", (remoteCamOff || !remoteHasVideo) && "opacity-0")}
            />
          )}

          {(!showRemoteVideo || remoteCamOff || !remoteHasVideo) && (
            <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(ellipse_at_center,#1d2a26_0%,#0d0f12_70%)]">
              <div className="flex flex-col items-center px-6 text-center">
                <span className={cn("rounded-full", !showRemoteVideo && "animate-[pulse_2.4s_ease-in-out_infinite]")}>
                  <RoomAvatar person={other} size={120} />
                </span>
                <p className="mt-5 font-display text-2xl font-bold text-white">{other?.name}</p>
                {status ? (
                  <p className="mt-2 inline-flex items-center gap-2 text-sm text-white/65">
                    {call.callState !== "waiting" && <Loader2 className="h-4 w-4 animate-spin" />}
                    {status}
                  </p>
                ) : (
                  <p className="mt-2 inline-flex items-center gap-2 text-sm text-white/55">
                    <VideoOff className="h-4 w-4" />
                    {tr(["Câmera desligada", "Camera off", "Cámara apagada", "Caméra coupée"])}
                  </p>
                )}
              </div>
            </div>
          )}

          {call.callState === "reconnecting" && showRemoteVideo && !remoteCamOff && (
            <div className="absolute inset-0 grid place-items-center bg-black/55 backdrop-blur-sm">
              <p className="inline-flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                {status}
              </p>
            </div>
          )}

          {/* Topo: quem, relógio, qualidade */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-center gap-2 bg-gradient-to-b from-black/60 to-transparent p-3 pb-10 sm:p-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/45 py-1 pl-1 pr-3 text-sm font-semibold backdrop-blur">
              <RoomAvatar person={other} size={26} />
              <span className="max-w-[9rem] truncate sm:max-w-none">{other?.name}</span>
              {peer?.inCall && !peer.mic && <MicOff className="h-3.5 w-3.5 text-red-400" />}
            </span>
            <ConsultClock appt={appt} now={now} />
            <QualityBadge quality={call.quality} relayed={call.relayed} />
            <span className="ml-auto hidden items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] text-white/70 backdrop-blur sm:inline-flex">
              <Lock className="h-3 w-3" />
              {tr(["Criptografada", "Encrypted", "Cifrada", "Chiffré"])}
            </span>
          </div>

          {/* Você (miniatura) */}
          <div className="absolute right-3 top-14 z-10 aspect-[3/4] w-24 overflow-hidden rounded-2xl bg-[#1a1d22] shadow-xl ring-1 ring-white/15 sm:bottom-24 sm:right-4 sm:top-auto sm:aspect-video sm:w-52">
            {selfStream && (local.cam || call.sharing) ? (
              <VideoEl stream={selfStream} muted mirror={!call.sharing} fit={call.sharing ? "contain" : "cover"} />
            ) : (
              <div className="grid h-full place-items-center text-white/50">
                <VideoOff className="h-5 w-5" />
              </div>
            )}
            {!local.mic && (
              <span className="absolute bottom-1.5 left-1.5 grid h-6 w-6 place-items-center rounded-full bg-red-600">
                <MicOff className="h-3.5 w-3.5" />
              </span>
            )}
            {call.sharing && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold">
                {tr(["Sua tela", "Your screen", "Tu pantalla", "Votre écran"])}
              </span>
            )}
          </div>

          {preview && (
            <button
              type="button"
              onClick={() => setPanel("chat")}
              className="nc-rise absolute bottom-24 left-1/2 z-10 flex w-[min(22rem,calc(100%-2rem))] -translate-x-1/2 cursor-pointer items-start gap-2.5 rounded-2xl bg-white/95 p-3 text-left text-[#0d0f12] shadow-2xl"
            >
              <RoomAvatar person={other} size={30} />
              <span className="min-w-0">
                <span className="block text-xs font-bold">{other?.name}</span>
                <span className="line-clamp-2 text-sm">{preview.text}</span>
              </span>
            </button>
          )}

          {/* Controles */}
          <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/70 to-transparent px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-10">
            <div className="flex items-center gap-2 rounded-full bg-black/55 p-2 shadow-2xl ring-1 ring-white/10 backdrop-blur-md sm:gap-3">
              <RoundButton
                on={local.mic}
                disabled={!local.hasAudio}
                label={local.mic ? tr(["Desligar microfone", "Mute", "Silenciar", "Couper le micro"]) : tr(["Ligar microfone", "Unmute", "Activar micrófono", "Activer le micro"])}
                onClick={local.toggleMic}
              >
                {local.mic ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </RoundButton>
              <RoundButton
                on={local.cam}
                disabled={!local.hasVideo}
                label={local.cam ? tr(["Desligar câmera", "Turn camera off", "Apagar cámara", "Couper la caméra"]) : tr(["Ligar câmera", "Turn camera on", "Encender cámara", "Activer la caméra"])}
                onClick={local.toggleCam}
              >
                {local.cam ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </RoundButton>
              {call.canShare && (
                <span className="hidden sm:contents">
                  <RoundButton
                    on={!call.sharing}
                    label={call.sharing ? tr(["Parar de compartilhar", "Stop sharing", "Dejar de compartir", "Arrêter le partage"]) : tr(["Compartilhar tela", "Share screen", "Compartir pantalla", "Partager l'écran"])}
                    onClick={() => (call.sharing ? call.stopShare() : void call.startShare())}
                  >
                    {call.sharing ? <MonitorOff className="h-5 w-5" /> : <MonitorUp className="h-5 w-5" />}
                  </RoundButton>
                </span>
              )}
              <RoundButton
                on={panel !== "chat"}
                label={tr(["Chat", "Chat", "Chat", "Chat"])}
                badge={unread > 0 ? unread : undefined}
                onClick={() => setPanel(panel === "chat" ? null : "chat")}
              >
                <MessageSquare className="h-5 w-5" />
              </RoundButton>
              {role === "professional" && (
                <RoundButton
                  on={panel !== "notes"}
                  label={tr(["Prontuário da consulta", "Visit notes", "Notas de la consulta", "Notes de consultation"])}
                  onClick={() => setPanel(panel === "notes" ? null : "notes")}
                >
                  <NotebookPen className="h-5 w-5" />
                </RoundButton>
              )}
              <span className="hidden sm:contents">
                <RoundButton
                  label={full ? tr(["Sair da tela cheia", "Exit full screen", "Salir de pantalla completa", "Quitter le plein écran"]) : tr(["Tela cheia", "Full screen", "Pantalla completa", "Plein écran"])}
                  onClick={toggleFull}
                >
                  {full ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </RoundButton>
              </span>
              <RoundButton danger wide label={tr(["Sair da consulta", "Leave", "Salir de la consulta", "Quitter"])} onClick={onLeave}>
                <PhoneOff className="h-5 w-5" />
              </RoundButton>
            </div>
          </div>
        </div>

        {/* Painel lateral (no celular, sobe por cima do vídeo) */}
        {panel && (
          <aside className="absolute inset-x-0 bottom-0 z-20 flex h-[68%] flex-col rounded-t-3xl bg-[#16191e] shadow-2xl ring-1 ring-white/10 sm:static sm:h-auto sm:w-[22rem] sm:rounded-none sm:border-l sm:border-white/8 sm:ring-0">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
              <h2 className="text-sm font-bold text-white">
                {panel === "chat"
                  ? tr(["Chat da consulta", "Appointment chat", "Chat de la consulta", "Chat de la consultation"])
                  : tr(["Prontuário da consulta", "Visit notes", "Notas de la consulta", "Notes de consultation"])}
              </h2>
              <button
                type="button"
                onClick={() => setPanel(null)}
                aria-label={tr(["Fechar", "Close", "Cerrar", "Fermer"])}
                className="grid h-8 w-8 cursor-pointer place-items-center rounded-full hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {panel === "chat" ? (
              <ChatPanel messages={call.messages} onSend={call.sendChat} other={other} />
            ) : (
              <NotesPanel appt={appt} />
            )}
          </aside>
        )}
      </div>
    </RoomShell>
  );
}

function ChatPanel({
  messages,
  onSend,
  other,
}: {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  other?: PersonSummary;
}) {
  const tr = useTr();
  const { locale } = useClinicalI18n();
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);
  const submit = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };
  return (
    <>
      <div ref={listRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <p className="mt-8 text-center text-xs leading-relaxed text-white/45">
            {tr([
              "Mande links, dúvidas ou anotações rápidas por aqui. As mensagens somem quando a consulta termina.",
              "Send links, questions or quick notes here. Messages disappear when the appointment ends.",
              "Envía enlaces, dudas o notas rápidas aquí. Los mensajes desaparecen al terminar la consulta.",
              "Envoyez liens, questions ou notes rapides ici. Les messages disparaissent à la fin de la consultation.",
            ])}
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={cn("flex flex-col", m.mine ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm",
                  m.mine ? "rounded-br-md bg-emerald-600" : "rounded-bl-md bg-white/10",
                )}
              >
                {m.text}
              </div>
              <span className="mt-0.5 px-1 text-[10px] text-white/40">
                {m.mine ? tr(["Você", "You", "Tú", "Vous"]) : other?.name?.split(" ")[0]} · {formatTime(new Date(m.at), locale)}
              </span>
            </div>
          ))
        )}
      </div>
      <form
        className="flex items-end gap-2 border-t border-white/8 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={tr(["Escreva uma mensagem…", "Write a message…", "Escribe un mensaje…", "Écrire un message…"])}
          className="max-h-28 min-h-10 flex-1 resize-none rounded-2xl border border-white/12 bg-white/6 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-emerald-400"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          aria-label={tr(["Enviar", "Send", "Enviar", "Envoyer"])}
          className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full bg-emerald-500 transition hover:bg-emerald-400 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </>
  );
}

const fieldClass =
  "w-full resize-none rounded-xl border border-white/12 bg-white/6 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-emerald-400";

/** Para o profissional: evolução (SOAP) ligada à consulta, resumo para o paciente e conclusão. */
function NotesPanel({ appt }: { appt: Appointment }) {
  const tr = useTr();
  const { t } = useClinicalI18n();
  const notes = useNotes(appt.patient_id);
  const existing = notes.data?.find((n) => n.appointment_id === appt.id);
  const [soap, setSoap] = useState({ subjective: "", objective: "", assessment: "", plan: "" });
  const [summary, setSummary] = useState(appt.summary_for_patient ?? "");
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current || !notes.data) return;
    loaded.current = true;
    if (existing) {
      setSoap({
        subjective: existing.subjective ?? "",
        objective: existing.objective ?? "",
        assessment: existing.assessment ?? "",
        plan: existing.plan ?? "",
      });
    }
  }, [notes.data, existing]);

  const saveNote = useClinicalMutation(
    () =>
      records.saveNote({
        id: existing?.id,
        patient_id: appt.patient_id,
        appointment_id: appt.id,
        subjective: soap.subjective.trim() || null,
        objective: soap.objective.trim() || null,
        assessment: soap.assessment.trim() || null,
        plan: soap.plan.trim() || null,
      }),
    { success: tr(["Prontuário salvo", "Notes saved", "Notas guardadas", "Notes enregistrées"]) },
  );
  const finish = useClinicalMutation(
    () =>
      api.updateAppointment(appt.id, {
        summary_for_patient: summary.trim() || null,
        status: "realizada",
      }),
    { success: tr(["Consulta concluída", "Appointment completed", "Consulta concluida", "Consultation terminée"]) },
  );
  const saveSummary = useClinicalMutation(
    () => api.updateAppointment(appt.id, { summary_for_patient: summary.trim() || null }),
    { success: t("appt.saved") },
  );

  const fields: [keyof typeof soap, Names][] = [
    ["subjective", ["Subjetivo (relato)", "Subjective", "Subjetivo", "Subjectif"]],
    ["objective", ["Objetivo (medidas, exames)", "Objective", "Objetivo", "Objectif"]],
    ["assessment", ["Avaliação", "Assessment", "Evaluación", "Évaluation"]],
    ["plan", ["Plano / condutas", "Plan", "Plan", "Plan"]],
  ];

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
      <section className="space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
          {tr(["Evolução (só você vê)", "Progress note (only you)", "Evolución (solo tú)", "Évolution (vous seul)"])}
        </p>
        {fields.map(([key, label]) => (
          <label key={key} className="block">
            <span className="mb-1 block text-xs text-white/70">{tr(label)}</span>
            <textarea
              rows={2}
              value={soap[key]}
              onChange={(e) => setSoap((s) => ({ ...s, [key]: e.target.value }))}
              className={fieldClass}
            />
          </label>
        ))}
        <button
          type="button"
          disabled={saveNote.isPending}
          onClick={() => saveNote.mutate(undefined)}
          className="w-full cursor-pointer rounded-full bg-white/10 py-2 text-sm font-semibold transition hover:bg-white/18 disabled:opacity-50"
        >
          {saveNote.isPending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : tr(["Salvar evolução", "Save note", "Guardar evolución", "Enregistrer"])}
        </button>
      </section>

      <section className="space-y-2.5 border-t border-white/8 pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
          {tr(["Orientações para o paciente", "Guidance for the patient", "Indicaciones para el paciente", "Conseils pour le patient"])}
        </p>
        <textarea
          rows={4}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder={tr([
            "O paciente vê este resumo na página das consultas.",
            "The patient sees this summary on their appointments page.",
            "El paciente ve este resumen en su página de consultas.",
            "Le patient voit ce résumé sur sa page de consultations.",
          ])}
          className={fieldClass}
        />
        <div className="flex gap-2">
          <button
            type="button"
            disabled={saveSummary.isPending}
            onClick={() => saveSummary.mutate(undefined)}
            className="flex-1 cursor-pointer rounded-full bg-white/10 py-2 text-sm font-semibold transition hover:bg-white/18 disabled:opacity-50"
          >
            {tr(["Salvar", "Save", "Guardar", "Enregistrer"])}
          </button>
          {appt.status !== "realizada" && (
            <button
              type="button"
              disabled={finish.isPending}
              onClick={() => finish.mutate(undefined)}
              className="inline-flex flex-[1.4] cursor-pointer items-center justify-center gap-1.5 rounded-full bg-emerald-500 py-2 text-sm font-semibold transition hover:bg-emerald-400 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              {tr(["Concluir consulta", "Complete", "Concluir", "Terminer"])}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────── Depois de sair ───────────────────────────────

export function LeftView({
  appt,
  role,
  other,
  onRejoin,
  backTo,
  canRejoin,
}: {
  appt: Appointment;
  role: CallRole;
  other?: PersonSummary;
  onRejoin: () => void;
  backTo: string;
  canRejoin: boolean;
}) {
  const tr = useTr();
  const [notes, setNotes] = useState(false);
  return (
    <RoomShell>
      <div className="m-auto flex w-full max-w-md flex-col items-center px-6 py-8 text-center">
        <RoomAvatar person={other} size={72} />
        <h1 className="mt-5 font-display text-2xl font-bold text-white">
          {tr(["Você saiu da consulta", "You left the appointment", "Saliste de la consulta", "Vous avez quitté la consultation"])}
        </h1>
        <p className="mt-2 text-sm text-white/60">
          {role === "patient"
            ? tr([
                "As orientações do profissional aparecem na sua página de consultas.",
                "Your professional's guidance will show on your appointments page.",
                "Las indicaciones del profesional aparecen en tu página de consultas.",
                "Les conseils du professionnel apparaîtront sur votre page de consultations.",
              ])
            : tr([
                "Registre a evolução e as orientações enquanto está fresco.",
                "Write down the notes and guidance while it's fresh.",
                "Registra la evolución y las indicaciones mientras está fresco.",
                "Notez l'évolution et les conseils tant que c'est frais.",
              ])}
        </p>
        <div className="mt-7 flex w-full flex-col gap-2.5">
          {canRejoin && (
            <button
              type="button"
              onClick={onRejoin}
              className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-500 font-semibold transition hover:bg-emerald-400"
            >
              <Video className="h-4 w-4" />
              {tr(["Voltar para a consulta", "Rejoin", "Volver a la consulta", "Revenir à la consultation"])}
            </button>
          )}
          {role === "professional" && (
            <button
              type="button"
              onClick={() => setNotes((v) => !v)}
              className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-white/10 font-semibold transition hover:bg-white/18"
            >
              <NotebookPen className="h-4 w-4" />
              {tr(["Prontuário da consulta", "Visit notes", "Notas de la consulta", "Notes de consultation"])}
            </button>
          )}
          <Link
            to={backTo}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white/10 font-semibold transition hover:bg-white/18"
          >
            <ArrowLeft className="h-4 w-4" />
            {role === "patient"
              ? tr(["Minhas consultas", "My appointments", "Mis consultas", "Mes consultations"])
              : tr(["Voltar à agenda", "Back to schedule", "Volver a la agenda", "Retour à l'agenda"])}
          </Link>
        </div>
      </div>
      {notes && role === "professional" && (
        <div className="absolute inset-x-0 bottom-0 flex h-[75%] flex-col rounded-t-3xl bg-[#16191e] ring-1 ring-white/10 sm:inset-y-0 sm:left-auto sm:right-0 sm:h-auto sm:w-[24rem] sm:rounded-none">
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
            <h2 className="text-sm font-bold text-white">{tr(["Prontuário da consulta", "Visit notes", "Notas de la consulta", "Notes de consultation"])}</h2>
            <button
              type="button"
              onClick={() => setNotes(false)}
              aria-label={tr(["Fechar", "Close", "Cerrar", "Fermer"])}
              className="grid h-8 w-8 cursor-pointer place-items-center rounded-full hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <NotesPanel appt={appt} />
        </div>
      )}
    </RoomShell>
  );
}

// Videoconsulta dentro do site (WebRTC). Áudio e vídeo vão direto entre os dois navegadores,
// criptografados; o Supabase Realtime só leva a "conversa de combinação" (oferta, resposta e
// candidatos ICE), a presença na sala e o chat. O canal é privado: só o paciente e o profissional
// daquela consulta entram (ver a migration 20261004130000_video_consultations.sql).
//
// Quem liga é sempre o profissional; o paciente atende. Cada aba tem uma sessão própria e cada
// conexão um id: se alguém recarrega a página ou a rede cai, o profissional liga de novo e o
// paciente descarta a conexão velha. Os transceptores de áudio e vídeo são criados logo na oferta,
// então ligar/desligar câmera, trocar de aparelho ou compartilhar a tela nunca renegocia a chamada.
import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type CallRole = "patient" | "professional";
export type Quality = "boa" | "instavel" | "ruim";

export interface PeerPresence {
  userId: string;
  role: CallRole;
  session: string;
  /** Já entrou na chamada (false = está na sala de espera, testando câmera e microfone). */
  inCall: boolean;
  mic: boolean;
  cam: boolean;
  sharing: boolean;
  at: number;
}

export interface ChatMessage {
  id: string;
  from: string;
  text: string;
  at: number;
  mine: boolean;
}

type Signal =
  | { kind: "offer" | "answer"; from: string; to: string; pc: string; sdp: RTCSessionDescriptionInit }
  | { kind: "candidate"; from: string; to: string; pc: string; candidate: RTCIceCandidateInit }
  | { kind: "restart"; from: string; to: string; pc: string };

const DEFAULT_ICE: RTCIceServer[] = [
  { urls: ["stun:stun.cloudflare.com:3478", "stun:stun.l.google.com:19302"] },
];

const rid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

// ─────────────────────────────── Câmera e microfone ───────────────────────────────

export type MediaError = "denied" | "notfound" | "insecure" | "other";

export interface Devices {
  audioinput: MediaDeviceInfo[];
  videoinput: MediaDeviceInfo[];
  audiooutput: MediaDeviceInfo[];
}

const AUDIO: MediaTrackConstraints = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };
const VIDEO: MediaTrackConstraints = { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } };

function mediaError(err: unknown): MediaError {
  const name = (err as { name?: string })?.name;
  if (name === "NotAllowedError" || name === "SecurityError") return "denied";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "notfound";
  return "other";
}

/** Câmera e microfone da pessoa: liga, troca de aparelho, liga/desliga cada um. */
export function useLocalMedia() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<MediaError | null>(null);
  const [starting, setStarting] = useState(false);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [devices, setDevices] = useState<Devices>({ audioinput: [], videoinput: [], audiooutput: [] });
  const [audioId, setAudioId] = useState<string>("");
  const [videoId, setVideoId] = useState<string>("");
  const streamRef = useRef<MediaStream | null>(null);
  /** Avisado quando um aparelho é trocado, para a chamada trocar a faixa enviada. */
  const onReplace = useRef<(kind: "audio" | "video", track: MediaStreamTrack | null) => void>(() => {});

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const list = await navigator.mediaDevices.enumerateDevices().catch(() => []);
    setDevices({
      audioinput: list.filter((d) => d.kind === "audioinput" && d.deviceId),
      videoinput: list.filter((d) => d.kind === "videoinput" && d.deviceId),
      audiooutput: list.filter((d) => d.kind === "audiooutput" && d.deviceId),
    });
  }, []);

  const start = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(window.isSecureContext ? "notfound" : "insecure");
      return;
    }
    setStarting(true);
    setError(null);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    let s: MediaStream | null = null;
    try {
      s = await navigator.mediaDevices.getUserMedia({ audio: AUDIO, video: VIDEO });
    } catch (err) {
      // Sem câmera (ou câmera ocupada): tenta só o microfone, depois só a câmera.
      const first = mediaError(err);
      s = await navigator.mediaDevices.getUserMedia({ audio: AUDIO }).catch(() => null);
      if (!s) s = await navigator.mediaDevices.getUserMedia({ video: VIDEO }).catch(() => null);
      if (!s) setError(first);
    }
    streamRef.current = s;
    setStream(s);
    if (s) {
      s.getAudioTracks().forEach((t) => (t.enabled = mic));
      s.getVideoTracks().forEach((t) => (t.enabled = cam));
      setAudioId(s.getAudioTracks()[0]?.getSettings().deviceId ?? "");
      setVideoId(s.getVideoTracks()[0]?.getSettings().deviceId ?? "");
    }
    setStarting(false);
    void refreshDevices();
  }, [mic, cam, refreshDevices]);

  useEffect(() => {
    const md = typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
    md?.addEventListener?.("devicechange", refreshDevices);
    return () => {
      md?.removeEventListener?.("devicechange", refreshDevices);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [refreshDevices]);

  const switchDevice = useCallback(
    async (kind: "audio" | "video", deviceId: string) => {
      const constraints =
        kind === "audio"
          ? { audio: { ...AUDIO, deviceId: { exact: deviceId } } }
          : { video: { ...VIDEO, deviceId: { exact: deviceId } } };
      const fresh = await navigator.mediaDevices.getUserMedia(constraints).catch(() => null);
      const track = kind === "audio" ? fresh?.getAudioTracks()[0] : fresh?.getVideoTracks()[0];
      if (!track) return false;
      track.enabled = kind === "audio" ? mic : cam;
      const current = streamRef.current ?? new MediaStream();
      const old = kind === "audio" ? current.getAudioTracks() : current.getVideoTracks();
      old.forEach((t) => {
        current.removeTrack(t);
        t.stop();
      });
      current.addTrack(track);
      const next = new MediaStream(current.getTracks());
      streamRef.current = next;
      setStream(next);
      if (kind === "audio") setAudioId(deviceId);
      else setVideoId(deviceId);
      onReplace.current(kind, track);
      return true;
    },
    [mic, cam],
  );

  const toggleMic = useCallback(() => {
    setMic((on) => {
      streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !on));
      return !on;
    });
  }, []);
  const toggleCam = useCallback(() => {
    setCam((on) => {
      streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !on));
      return !on;
    });
  }, []);

  /** Desliga câmera e microfone (a luz da câmera apaga). */
  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  const hasAudio = !!stream?.getAudioTracks().length;
  const hasVideo = !!stream?.getVideoTracks().length;

  return {
    stream,
    error,
    starting,
    start,
    stop,
    mic: mic && hasAudio,
    cam: cam && hasVideo,
    hasAudio,
    hasVideo,
    toggleMic,
    toggleCam,
    devices,
    audioId,
    videoId,
    switchDevice,
    onReplace,
  };
}

/** Volume do microfone (0–1), para a barrinha que mostra que o som está chegando. */
export function useAudioLevel(stream: MediaStream | null, enabled = true) {
  const [level, setLevel] = useState(0);
  useEffect(() => {
    const track = stream?.getAudioTracks()[0];
    if (!track || !enabled || typeof window === "undefined") {
      setLevel(0);
      return;
    }
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    const source = ctx.createMediaStreamSource(new MediaStream([track]));
    source.connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    let frame = 0;
    let last = 0;
    const tick = (t: number) => {
      frame = requestAnimationFrame(tick);
      if (t - last < 80) return;
      last = t;
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (const v of data) sum += ((v - 128) / 128) ** 2;
      setLevel(Math.min(1, Math.sqrt(sum / data.length) * 4));
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      source.disconnect();
      void ctx.close();
    };
  }, [stream, enabled]);
  return level;
}

// ─────────────────────────────── A chamada ───────────────────────────────

export type ChannelState = "connecting" | "ready" | "error";
export type CallState = "waiting" | "connecting" | "connected" | "reconnecting";

export function useConsultationCall({
  appointmentId,
  userId,
  role,
  localStream,
  inCall,
  mic,
  cam,
  onReplace,
}: {
  appointmentId: string;
  userId: string;
  role: CallRole;
  localStream: MediaStream | null;
  inCall: boolean;
  mic: boolean;
  cam: boolean;
  onReplace: MutableRefObject<(kind: "audio" | "video", track: MediaStreamTrack | null) => void>;
}) {
  const [session] = useState(rid);
  const [startedAt] = useState(() => Date.now());
  const [channelState, setChannelState] = useState<ChannelState>("connecting");
  const [peer, setPeer] = useState<PeerPresence | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callState, setCallState] = useState<CallState>("waiting");
  const [quality, setQuality] = useState<Quality | null>(null);
  const [relayed, setRelayed] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  /** "sessão:conexão" do outro lado com quem a conexão atual fala. */
  const linkRef = useRef<{ session: string; pc: string } | null>(null);
  const pending = useRef<RTCIceCandidateInit[]>([]);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const iceRef = useRef<RTCIceServer[]>(DEFAULT_ICE);
  const localRef = useRef(localStream);
  localRef.current = localStream;
  const screenRef = useRef<MediaStreamTrack | null>(null);
  const inCallRef = useRef(inCall);
  inCallRef.current = inCall;
  const lostTimer = useRef<number | undefined>(undefined);

  const send = useCallback((event: string, payload: object) => {
    void channelRef.current?.send({ type: "broadcast", event, payload });
  }, []);

  const closePc = useCallback(() => {
    window.clearTimeout(lostTimer.current);
    const pc = pcRef.current;
    pcRef.current = null;
    linkRef.current = null;
    pending.current = [];
    if (pc) {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.close();
    }
    setRemoteStream(null);
    setQuality(null);
    setRelayed(false);
    setCallState("waiting");
  }, []);

  /** Coloca nossas faixas (microfone, câmera ou tela) nos transceptores da conexão. */
  const attachLocal = useCallback(async (pc: RTCPeerConnection) => {
    const stream = localRef.current;
    for (const t of pc.getTransceivers()) {
      const kind = t.receiver.track?.kind;
      const track =
        kind === "video"
          ? (screenRef.current ?? stream?.getVideoTracks()[0] ?? null)
          : (stream?.getAudioTracks()[0] ?? null);
      try {
        t.direction = "sendrecv";
        await t.sender.replaceTrack(track);
      } catch {
        /* conexão fechada no meio do caminho */
      }
    }
  }, []);

  const createPc = useCallback(
    (remoteSession: string, pcId: string) => {
      closePc();
      const pc = new RTCPeerConnection({ iceServers: iceRef.current, bundlePolicy: "max-bundle" });
      pcRef.current = pc;
      linkRef.current = { session: remoteSession, pc: pcId };
      setCallState("connecting");
      const remote = new MediaStream();
      pc.ontrack = (e) => {
        if (!remote.getTracks().includes(e.track)) remote.addTrack(e.track);
        setRemoteStream(new MediaStream(remote.getTracks()));
      };
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          send("signal", {
            kind: "candidate",
            from: session,
            to: remoteSession,
            pc: pcId,
            candidate: e.candidate.toJSON(),
          } satisfies Signal);
        }
      };
      pc.onconnectionstatechange = () => {
        if (pcRef.current !== pc) return;
        const st = pc.connectionState;
        window.clearTimeout(lostTimer.current);
        if (st === "connected") setCallState("connected");
        else if (st === "disconnected" || st === "failed") {
          setCallState("reconnecting");
          // A rede às vezes volta sozinha; se não voltar, recomeça a ligação.
          lostTimer.current = window.setTimeout(
            () => {
              if (pcRef.current !== pc || pc.connectionState === "connected") return;
              if (role === "professional") void callRef.current(remoteSession);
              else send("signal", { kind: "restart", from: session, to: remoteSession, pc: pcId } satisfies Signal);
            },
            st === "failed" ? 300 : 5000,
          );
        }
      };
      return pc;
    },
    [closePc, role, send, session],
  );

  /** Profissional liga para a sessão do paciente. */
  const call = useCallback(
    async (remoteSession: string) => {
      const pcId = rid();
      const pc = createPc(remoteSession, pcId);
      pc.addTransceiver("audio", { direction: "sendrecv" });
      pc.addTransceiver("video", { direction: "sendrecv" });
      await attachLocal(pc);
      const offer = await pc.createOffer();
      if (pcRef.current !== pc) return;
      await pc.setLocalDescription(offer);
      send("signal", {
        kind: "offer",
        from: session,
        to: remoteSession,
        pc: pcId,
        sdp: pc.localDescription!.toJSON(),
      } satisfies Signal);
    },
    [attachLocal, createPc, send, session],
  );
  const callRef = useRef(call);
  callRef.current = call;

  const flush = async (pc: RTCPeerConnection) => {
    const list = pending.current;
    pending.current = [];
    for (const c of list) await pc.addIceCandidate(c).catch(() => {});
  };

  const handleSignal = useCallback(
    async (s: Signal) => {
      if (s.to !== session || !inCallRef.current) return;
      const link = linkRef.current;
      const same = link?.session === s.from && link?.pc === s.pc;
      if (s.kind === "offer" && role === "patient") {
        let pc = pcRef.current;
        if (!pc || !same) pc = createPc(s.from, s.pc);
        await pc.setRemoteDescription(s.sdp);
        await attachLocal(pc);
        await flush(pc);
        const answer = await pc.createAnswer();
        if (pcRef.current !== pc) return;
        await pc.setLocalDescription(answer);
        send("signal", {
          kind: "answer",
          from: session,
          to: s.from,
          pc: s.pc,
          sdp: pc.localDescription!.toJSON(),
        } satisfies Signal);
      } else if (s.kind === "answer" && role === "professional") {
        const pc = pcRef.current;
        if (pc && same && pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription(s.sdp);
          await flush(pc);
        }
      } else if (s.kind === "candidate") {
        const pc = pcRef.current;
        if (pc && same && pc.remoteDescription) await pc.addIceCandidate(s.candidate).catch(() => {});
        else if (!pc || same) pending.current.push(s.candidate);
      } else if (s.kind === "restart" && role === "professional" && link?.session === s.from) {
        await call(s.from);
      }
    },
    [attachLocal, call, createPc, role, send, session],
  );
  const signalRef = useRef(handleSignal);
  signalRef.current = handleSignal;

  // Canal privado da sala: presença, sinais e chat.
  useEffect(() => {
    let cancelled = false;
    let ch: RealtimeChannel | null = null;
    setChannelState("connecting");
    void (async () => {
      try {
        await supabase.realtime.setAuth();
      } catch {
        /* sem sessão: o canal privado vai recusar e a tela explica */
      }
      if (cancelled) return;
      ch = supabase.channel(`consulta:${appointmentId}`, {
        config: { private: true, presence: { key: session }, broadcast: { self: false } },
      });
      ch.on("presence", { event: "sync" }, () => {
        const state = ch!.presenceState<PeerPresence>();
        const others = Object.values(state)
          .flat()
          .filter((p) => p.userId && p.userId !== userId && p.session !== session)
          .sort((a, b) => Number(b.inCall) - Number(a.inCall) || b.at - a.at);
        const next = others[0] ?? null;
        setPeer((prev) =>
          prev &&
          next &&
          prev.session === next.session &&
          prev.inCall === next.inCall &&
          prev.mic === next.mic &&
          prev.cam === next.cam &&
          prev.sharing === next.sharing
            ? prev
            : next,
        );
      });
      ch.on("broadcast", { event: "signal" }, ({ payload }) => {
        queue.current = queue.current
          .then(() => signalRef.current(payload as Signal))
          .catch((err) => console.warn("videoconsulta: sinal", err));
      });
      ch.on("broadcast", { event: "chat" }, ({ payload }) => {
        const m = payload as Omit<ChatMessage, "mine">;
        if (!m?.text) return;
        setMessages((list) => (list.some((x) => x.id === m.id) ? list : [...list, { ...m, mine: false }]));
      });
      ch.subscribe((status) => {
        if (cancelled) return;
        if (status === "SUBSCRIBED") {
          channelRef.current = ch;
          setChannelState("ready");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setChannelState("error");
        }
      });
    })();
    return () => {
      cancelled = true;
      channelRef.current = null;
      if (ch) {
        void ch.untrack().catch(() => {});
        void supabase.removeChannel(ch);
      }
      closePc();
    };
  }, [appointmentId, userId, session, closePc]);

  // Servidores ICE (com TURN, quando configurado) para redes mais fechadas.
  useEffect(() => {
    if (!inCall) return;
    let alive = true;
    void supabase.functions
      .invoke<{ iceServers?: RTCIceServer[] }>("call-ice", { body: { appointmentId } })
      .then(({ data }) => {
        if (alive && data?.iceServers?.length) iceRef.current = data.iceServers;
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [appointmentId, inCall]);

  // Presença: avisa o outro lado se estamos na espera ou na chamada, e como estão câmera e microfone.
  useEffect(() => {
    if (channelState !== "ready") return;
    void channelRef.current
      ?.track({ userId, role, session, inCall, mic, cam, sharing, at: startedAt } satisfies PeerPresence)
      .catch(() => {});
  }, [channelState, userId, role, session, inCall, mic, cam, sharing, startedAt]);

  // Quem liga é o profissional, sempre que o paciente (uma nova sessão dele) entra na chamada.
  const peerSession = peer?.inCall ? peer.session : null;
  useEffect(() => {
    if (!inCall || channelState !== "ready") return;
    if (!peerSession) {
      if (pcRef.current) closePc();
      return;
    }
    if (role === "professional" && linkRef.current?.session !== peerSession) {
      void call(peerSession).catch((err) => console.warn("videoconsulta: ligar", err));
    }
    if (role === "patient" && linkRef.current && linkRef.current.session !== peerSession) closePc();
  }, [inCall, channelState, peerSession, role, call, closePc]);

  // Saiu da chamada (voltou para a espera ou encerrou).
  useEffect(() => {
    if (!inCall) closePc();
  }, [inCall, closePc]);

  // Aparelho trocado: troca a faixa enviada sem renegociar.
  useEffect(() => {
    onReplace.current = (kind, track) => {
      const pc = pcRef.current;
      if (!pc || (kind === "video" && screenRef.current)) return;
      const t = pc.getTransceivers().find((x) => x.receiver.track?.kind === kind);
      void t?.sender.replaceTrack(track).catch(() => {});
    };
  }, [onReplace]);

  // Primeira faixa chegou depois da conexão (câmera liberada tarde): coloca nos transceptores.
  useEffect(() => {
    const pc = pcRef.current;
    if (pc && localStream) void attachLocal(pc);
  }, [localStream, attachLocal]);

  // Qualidade da conexão (atraso e perda de pacotes), a cada 3 s.
  useEffect(() => {
    if (callState !== "connected") return;
    let prevLost = 0;
    let prevRecv = 0;
    const id = window.setInterval(async () => {
      const pc = pcRef.current;
      if (!pc) return;
      const stats = await pc.getStats().catch(() => null);
      if (!stats) return;
      let rtt = 0;
      let lost = 0;
      let recv = 0;
      let localId = "";
      stats.forEach((r) => {
        if (r.type === "candidate-pair" && r.state === "succeeded" && r.nominated) {
          rtt = r.currentRoundTripTime ?? rtt;
          localId = r.localCandidateId;
        }
        if (r.type === "inbound-rtp") {
          lost += r.packetsLost ?? 0;
          recv += r.packetsReceived ?? 0;
        }
      });
      const dl = lost - prevLost;
      const dr = recv - prevRecv;
      prevLost = lost;
      prevRecv = recv;
      const loss = dl + dr > 0 ? dl / (dl + dr) : 0;
      setQuality(rtt < 0.3 && loss < 0.03 ? "boa" : rtt < 0.7 && loss < 0.1 ? "instavel" : "ruim");
      const local = localId ? stats.get(localId) : null;
      setRelayed(local?.candidateType === "relay");
    }, 3000);
    return () => window.clearInterval(id);
  }, [callState]);

  const replaceVideo = useCallback((track: MediaStreamTrack | null) => {
    const pc = pcRef.current;
    const t = pc?.getTransceivers().find((x) => x.receiver.track?.kind === "video");
    void t?.sender.replaceTrack(track).catch(() => {});
  }, []);

  const stopShare = useCallback(() => {
    const track = screenRef.current;
    screenRef.current = null;
    track?.stop();
    setSharing(false);
    replaceVideo(localRef.current?.getVideoTracks()[0] ?? null);
  }, [replaceVideo]);

  const startShare = useCallback(async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) return false;
    const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false }).catch(() => null);
    const track = display?.getVideoTracks()[0];
    if (!track) return false;
    track.contentHint = "detail";
    screenRef.current = track;
    track.onended = () => stopShare();
    setSharing(true);
    replaceVideo(track);
    return true;
  }, [replaceVideo, stopShare]);

  useEffect(() => () => screenRef.current?.stop(), []);

  const sendChat = useCallback(
    (text: string) => {
      const clean = text.trim().slice(0, 2000);
      if (!clean) return;
      const m = { id: rid(), from: userId, text: clean, at: Date.now() };
      setMessages((list) => [...list, { ...m, mine: true }]);
      send("chat", m);
    },
    [send, userId],
  );

  return {
    channelState,
    peer,
    remoteStream,
    callState,
    quality,
    relayed,
    sharing,
    screenTrack: sharing ? screenRef.current : null,
    startShare,
    stopShare,
    canShare: typeof navigator !== "undefined" && !!navigator.mediaDevices?.getDisplayMedia,
    messages,
    sendChat,
  };
}

/** Situação da sala calculada pela consulta (o banco faz a mesma conta nas políticas do canal). */
export type RoomState = "aberta" | "cedo" | "encerrada" | "presencial" | "aguardando_pagamento";

export const ROOM_OPENS_MIN = 30;
export const ROOM_CLOSES_MIN = 60;

export function roomState(
  appt: { modality: string; status: string; starts_at: string; ends_at: string },
  now = Date.now(),
): RoomState {
  if (appt.modality !== "online") return "presencial";
  if (appt.status === "aguardando_pagamento") return "aguardando_pagamento";
  if (!["agendada", "confirmada", "realizada"].includes(appt.status)) return "encerrada";
  if (now < new Date(appt.starts_at).getTime() - ROOM_OPENS_MIN * 60_000) return "cedo";
  if (now > new Date(appt.ends_at).getTime() + ROOM_CLOSES_MIN * 60_000) return "encerrada";
  return "aberta";
}

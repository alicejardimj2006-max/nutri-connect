import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, CalendarX, CreditCard, Loader2, MapPin } from "lucide-react";
import { useRequireAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useTr } from "@/components/settings-ui";
import { CallView, LeftView, Lobby, RoomNotice, RoomShell } from "@/components/clinical/video-room";
import type { Appointment } from "@/lib/clinical/api";
import { usePeople } from "@/lib/clinical/queries";
import { formatDate, formatTime } from "@/lib/clinical/format";
import { useClinicalI18n } from "@/lib/clinical/i18n";
import {
  ROOM_OPENS_MIN,
  roomState,
  useConsultationCall,
  useLocalMedia,
  type CallRole,
} from "@/lib/clinical/video-call";

export const Route = createFileRoute("/consulta/$appointmentId")({
  head: () => ({ meta: [{ title: "Videoconsulta — NutriConnect" }, { name: "robots", content: "noindex" }] }),
  component: ConsultationRoomPage,
});

function ConsultationRoomPage() {
  const { appointmentId } = Route.useParams();
  const { user, hydrated } = useRequireAuth();
  const tr = useTr();

  const appt = useQuery({
    queryKey: ["clinical", "appointment", appointmentId],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("appointments").select("*").eq("id", appointmentId).maybeSingle();
      if (error) throw error;
      return data as Appointment | null;
    },
  });

  if (!hydrated || !user || appt.isLoading) {
    return (
      <RoomShell>
        <Loader2 className="m-auto h-8 w-8 animate-spin text-white/60" />
      </RoomShell>
    );
  }
  const a = appt.data;
  if (!a || (user.id !== a.patient_id && user.id !== a.professional_id)) {
    return (
      <RoomNotice
        icon={<CalendarX className="h-7 w-7" />}
        title={tr(["Consulta não encontrada", "Appointment not found", "Consulta no encontrada", "Consultation introuvable"])}
        text={tr([
          "Esta sala não existe ou não é sua.",
          "This room doesn't exist or isn't yours.",
          "Esta sala no existe o no es tuya.",
          "Cette salle n'existe pas ou n'est pas la vôtre.",
        ])}
        backTo="/acompanhamento/consultas"
      />
    );
  }
  const role: CallRole = user.id === a.professional_id ? "professional" : "patient";
  return <Room appt={a} role={role} userId={user.id} />;
}

function Room({ appt, role, userId }: { appt: Appointment; role: CallRole; userId: string }) {
  const tr = useTr();
  const { locale } = useClinicalI18n();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const otherId = role === "patient" ? appt.professional_id : appt.patient_id;
  const people = usePeople([otherId]);
  const other = people.data?.get(otherId);
  const backTo = role === "patient" ? "/acompanhamento/consultas" : "/painel/agenda";
  const state = roomState(appt, now);

  const [phase, setPhase] = useState<"lobby" | "call" | "left">("lobby");
  const [sinkId, setSinkId] = useState("");
  const open = state === "aberta";
  const local = useLocalMedia();
  const call = useConsultationCall({
    appointmentId: appt.id,
    userId,
    role,
    localStream: local.stream,
    inCall: open && phase === "call",
    mic: local.mic,
    cam: local.cam,
    onReplace: local.onReplace,
  });

  // A câmera liga sozinha ao abrir a sala (o navegador pede a permissão uma vez).
  const { start } = local;
  useEffect(() => {
    if (open) void start();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (other?.name) document.title = `${tr(["Consulta com", "Appointment with", "Consulta con", "Consultation avec"])} ${other.name} — NutriConnect`;
  }, [other?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  // Durante a chamada: a tela não apaga e fechar a aba pede confirmação.
  useEffect(() => {
    if (phase !== "call") return;
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
    void nav.wakeLock?.request("screen").then((l) => (lock = l)).catch(() => {});
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
      void lock?.release().catch(() => {});
    };
  }, [phase]);

  const join = () => {
    setPhase("call");
    // Registra a entrada (comprovante de presença) e avisa a outra pessoa.
    void supabase.rpc("join_consultation", { p_appointment: appt.id }).then(() => {}, () => {});
  };

  if (state === "presencial") {
    return (
      <RoomNotice
        icon={<MapPin className="h-7 w-7" />}
        title={tr(["Esta consulta é presencial", "This is an in-person appointment", "Esta consulta es presencial", "Cette consultation est en présentiel"])}
        text={appt.location ?? undefined}
        backTo={backTo}
      />
    );
  }
  if (state === "aguardando_pagamento") {
    return (
      <RoomNotice
        icon={<CreditCard className="h-7 w-7" />}
        title={tr(["Falta confirmar o pagamento", "Payment pending", "Falta confirmar el pago", "Paiement en attente"])}
        text={tr([
          "A sala abre assim que o pagamento da consulta for confirmado.",
          "The room opens once the appointment payment is confirmed.",
          "La sala se abre cuando se confirme el pago de la consulta.",
          "La salle ouvre dès que le paiement est confirmé.",
        ])}
        backTo={backTo}
      />
    );
  }
  if (state === "encerrada") {
    return (
      <RoomNotice
        icon={<CalendarX className="h-7 w-7" />}
        title={tr(["A sala desta consulta está fechada", "This appointment's room is closed", "La sala de esta consulta está cerrada", "La salle de cette consultation est fermée"])}
        text={
          appt.status === "cancelada"
            ? tr(["A consulta foi cancelada.", "The appointment was cancelled.", "La consulta fue cancelada.", "La consultation a été annulée."])
            : tr(["O horário da consulta já passou.", "The appointment time has passed.", "El horario de la consulta ya pasó.", "L'horaire de la consultation est passé."])
        }
        backTo={backTo}
      />
    );
  }
  if (state === "cedo") {
    const opensAt = new Date(appt.starts_at).getTime() - ROOM_OPENS_MIN * 60_000;
    const left = Math.max(0, opensAt - now);
    const h = Math.floor(left / 3_600_000);
    const m = Math.floor((left % 3_600_000) / 60_000);
    const s = Math.floor((left % 60_000) / 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      <RoomNotice
        icon={<CalendarClock className="h-7 w-7" />}
        title={tr(["A sala ainda não abriu", "The room isn't open yet", "La sala aún no abrió", "La salle n'est pas encore ouverte"])}
        text={`${formatDate(appt.starts_at, locale, { weekday: "long", day: "numeric", month: "long" })} · ${formatTime(appt.starts_at, locale)}. ${tr([
          `A sala abre ${ROOM_OPENS_MIN} minutos antes; deixe esta página aberta.`,
          `The room opens ${ROOM_OPENS_MIN} minutes before; keep this page open.`,
          `La sala abre ${ROOM_OPENS_MIN} minutos antes; deja esta página abierta.`,
          `La salle ouvre ${ROOM_OPENS_MIN} minutes avant ; gardez cette page ouverte.`,
        ])}`}
        backTo={backTo}
      >
        <p className="mt-6 font-display text-4xl font-bold tabular-nums">
          {h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`}
        </p>
      </RoomNotice>
    );
  }

  if (phase === "left") {
    return (
      <LeftView
        appt={appt}
        role={role}
        other={other}
        backTo={backTo}
        canRejoin={open}
        onRejoin={() => {
          void local.start().then(join);
        }}
      />
    );
  }
  if (phase === "call") {
    return (
      <CallView
        appt={appt}
        other={other}
        role={role}
        local={local}
        call={call}
        sinkId={sinkId}
        now={now}
        onLeave={() => {
          setPhase("left");
          local.stop();
        }}
      />
    );
  }
  return (
    <Lobby
      appt={appt}
      other={other}
      role={role}
      local={local}
      call={call}
      sinkId={sinkId}
      setSinkId={setSinkId}
      onJoin={join}
      backTo={backTo}
    />
  );
}

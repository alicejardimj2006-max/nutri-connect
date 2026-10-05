-- Videoconsulta dentro do site: a chamada acontece na sala do NutriConnect (WebRTC), sem link externo.
--
-- A sinalização (oferta/resposta/candidatos ICE), a presença e o chat da sala passam por um canal
-- PRIVADO do Realtime chamado "consulta:<id da consulta>". As políticas abaixo só deixam entrar o
-- paciente e o profissional daquela consulta, e só na janela da sala (30 min antes até 1 h depois).
-- O áudio e o vídeo vão direto entre os dois navegadores, criptografados (DTLS-SRTP).

alter table public.appointments
  add column if not exists patient_joined_at timestamptz,
  add column if not exists professional_joined_at timestamptz;

-- ─── Quem pode entrar na sala ────────────────────────────────────────────────
create or replace function public.consultation_room_state(p_appointment uuid)
returns text language plpgsql stable security definer set search_path = public as $$
declare
  a public.appointments;
begin
  select * into a from public.appointments where id = p_appointment;
  if not found or auth.uid() is null or auth.uid() not in (a.patient_id, a.professional_id) then
    return 'nao_encontrada';
  end if;
  if a.modality <> 'online' then return 'presencial'; end if;
  if a.status = 'aguardando_pagamento' then return 'aguardando_pagamento'; end if;
  if a.status not in ('agendada', 'confirmada', 'realizada') then return 'encerrada'; end if;
  if now() < a.starts_at - interval '30 minutes' then return 'cedo'; end if;
  if now() > a.ends_at + interval '60 minutes' then return 'encerrada'; end if;
  return 'aberta';
end;
$$;
revoke execute on function public.consultation_room_state(uuid) from public, anon;
grant execute on function public.consultation_room_state(uuid) to authenticated;

-- Usada pelas políticas do Realtime: o tópico precisa ser "consulta:<uuid>" de uma sala aberta.
create or replace function public.consultation_topic_allowed(p_topic text)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare
  appt uuid;
begin
  if p_topic is null or left(p_topic, 9) <> 'consulta:' then return false; end if;
  begin
    appt := substr(p_topic, 10)::uuid;
  exception when others then
    return false;
  end;
  return public.consultation_room_state(appt) = 'aberta';
end;
$$;
revoke execute on function public.consultation_topic_allowed(text) from public, anon;
grant execute on function public.consultation_topic_allowed(text) to authenticated;

drop policy if exists "consulta: participantes recebem" on realtime.messages;
create policy "consulta: participantes recebem" on realtime.messages
  for select to authenticated
  using (
    realtime.messages.extension in ('broadcast', 'presence')
    and public.consultation_topic_allowed(realtime.topic())
  );

drop policy if exists "consulta: participantes enviam" on realtime.messages;
create policy "consulta: participantes enviam" on realtime.messages
  for insert to authenticated
  with check (
    realtime.messages.extension in ('broadcast', 'presence')
    and public.consultation_topic_allowed(realtime.topic())
  );

-- ─── Entrada na sala ─────────────────────────────────────────────────────────
-- Registra a primeira entrada de cada lado (serve de comprovante de presença) e avisa a outra pessoa.
create or replace function public.join_consultation(p_appointment uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  a public.appointments;
  me uuid := auth.uid();
  state text := public.consultation_room_state(p_appointment);
  first_time boolean := false;
begin
  if state <> 'aberta' then
    return jsonb_build_object('state', state);
  end if;
  select * into a from public.appointments where id = p_appointment;

  if me = a.patient_id and a.patient_joined_at is null then
    update public.appointments set patient_joined_at = now() where id = a.id;
    first_time := true;
  elsif me = a.professional_id and a.professional_joined_at is null then
    update public.appointments set professional_joined_at = now() where id = a.id;
    first_time := true;
  end if;

  if first_time then
    perform public.notify(
      case when me = a.patient_id then a.professional_id else a.patient_id end,
      'consulta_sala', me, 'appointment', a.id::text,
      jsonb_build_object('starts_at', a.starts_at, 'modality', a.modality)
    );
  end if;

  return jsonb_build_object('state', state);
end;
$$;
revoke execute on function public.join_consultation(uuid) from public, anon;
grant execute on function public.join_consultation(uuid) to authenticated;

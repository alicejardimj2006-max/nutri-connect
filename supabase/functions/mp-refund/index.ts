// Estorno de uma consulta cancelada paga pelo Mercado Pago.
// Regra: cancelamento pelo profissional sempre estorna; pelo paciente, só com
// antecedência mínima (platform_settings.refund_min_notice_hours, padrão 24 h).
import { HttpError, json, serve } from "../_shared/http.ts";
import { refundPayment, sellerToken } from "../_shared/mp.ts";
import { adminClient, requireUser, settingInt } from "../_shared/supabase.ts";

serve(async (req) => {
  const user = await requireUser(req);
  const { appointmentId } = (await req.json().catch(() => ({}))) as { appointmentId?: string };
  if (!appointmentId) throw new HttpError(400, "Consulta não informada.");

  const db = adminClient();
  const { data: appt } = await db
    .from("appointments")
    .select("*")
    .eq("id", appointmentId)
    .maybeSingle();
  if (!appt || (appt.patient_id !== user.id && appt.professional_id !== user.id)) {
    throw new HttpError(404, "Consulta não encontrada.");
  }
  if (appt.status !== "cancelada") throw new HttpError(409, "A consulta não está cancelada.");

  const { data: payment } = await db
    .from("payments")
    .select("*")
    .eq("appointment_id", appt.id)
    .eq("provider", "mercado_pago")
    .eq("status", "aprovado")
    .maybeSingle();
  if (!payment?.mp_payment_id) return json({ refunded: false, reason: "sem pagamento on-line" });

  const minHours = await settingInt("refund_min_notice_hours", 24);
  const byProfessional = appt.cancelled_by === appt.professional_id;
  const notice =
    new Date(appt.starts_at).getTime() - new Date(appt.cancelled_at ?? Date.now()).getTime();
  if (!byProfessional && notice < minHours * 3_600_000) {
    return json({ refunded: false, reason: "fora do prazo", minHours });
  }

  await refundPayment(await sellerToken(appt.professional_id), payment.mp_payment_id);
  await db
    .from("payments")
    .update({ status: "reembolsado", refunded_at: new Date().toISOString() })
    .eq("id", payment.id);
  return json({ refunded: true });
});

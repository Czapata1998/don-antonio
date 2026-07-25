import { formatoCOP, NEGOCIO } from '@/lib/mock-data'
import type { ReservaEmailData } from '@/lib/emails'

/* ─────────────────────────────────────────────────────────────────
   Envío de SMS al barbero vía Twilio (REST API, sin SDK).
   Credenciales por variables de entorno:
     TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM, BARBER_PHONE
   Si faltan, devuelve { enviado:false } (modo simulado).
   ───────────────────────────────────────────────────────────────── */

export interface SmsResultado {
  enviado: boolean
  sid?: string
  error?: string
}

/** Texto corto y claro para el SMS del barbero. */
export function textoSmsBarbero(d: ReservaEmailData): string {
  const servicios =
    d.servicios.length === 1
      ? d.servicios[0].nombre
      : `${d.servicios[0].nombre} +${d.servicios.length - 1}`
  return `${NEGOCIO.nombre}: nueva cita
${d.nombre} - ${d.fecha} ${d.hora}
${servicios} - ${formatoCOP(d.total)}
Tel: ${d.celular} - Cod: ${d.codigo}`
}

export async function enviarSmsBarbero(
  d: ReservaEmailData,
): Promise<SmsResultado> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM
  const to = process.env.BARBER_PHONE

  if (!sid || !token || !from || !to) {
    console.warn(
      '[sms] Twilio no configurado (TWILIO_ACCOUNT_SID/AUTH_TOKEN/FROM, BARBER_PHONE) → modo simulado.',
    )
    return { enviado: false }
  }

  try {
    const body = new URLSearchParams({
      To: to,
      From: from,
      Body: textoSmsBarbero(d),
    })
    const auth = Buffer.from(`${sid}:${token}`).toString('base64')
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      },
    )
    const json = (await res.json()) as { sid?: string; message?: string }
    if (!res.ok) {
      console.error('[sms] Twilio respondió error:', json?.message)
      return { enviado: false, error: json?.message || `HTTP ${res.status}` }
    }
    return { enviado: true, sid: json.sid }
  } catch (e) {
    console.error('[sms] fallo al enviar:', e)
    return { enviado: false, error: (e as Error).message }
  }
}

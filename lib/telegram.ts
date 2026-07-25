import { formatoCOP, NEGOCIO } from '@/lib/mock-data'
import { waLink, type ReservaEmailData } from '@/lib/emails'

/* ─────────────────────────────────────────────────────────────────
   Aviso GRATIS al barbero vía bot de Telegram (push al celular).
   Variables de entorno:
     TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
   Si faltan, devuelve { enviado:false } (modo simulado).

   Setup (3 min):
     1) En Telegram, escribe a @BotFather → /newbot → copia el TOKEN.
     2) Escríbele algo a tu bot nuevo desde tu cuenta.
     3) Abre https://api.telegram.org/bot<TOKEN>/getUpdates y copia el
        "chat":{"id": ...} → ese es TELEGRAM_CHAT_ID.
   ───────────────────────────────────────────────────────────────── */

export interface TelegramResultado {
  enviado: boolean
  error?: string
}

function escaparHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Mensaje enriquecido (Telegram soporta HTML básico). */
export function textoTelegram(d: ReservaEmailData): string {
  const servicios = d.servicios
    .map((s) => `• ${escaparHtml(s.nombre)} — ${formatoCOP(s.precio)}`)
    .join('\n')
  const wa = `${waLink(d.celular)}?text=${encodeURIComponent(
    `Hola ${d.nombre.split(' ')[0]}, te confirmo tu cita ${d.codigo} en ${NEGOCIO.nombre} para el ${d.fecha} a las ${d.hora}.`,
  )}`
  return (
    `💈 <b>Nueva cita · ${NEGOCIO.nombre}</b>\n\n` +
    `🗓️ <b>${escaparHtml(d.fecha)} · ${escaparHtml(d.hora)}</b> (${d.duracionTotal} min)\n` +
    `👤 ${escaparHtml(d.nombre)}\n` +
    `📱 ${escaparHtml(d.celular)}\n` +
    `✉️ ${escaparHtml(d.email)}\n\n` +
    `${servicios}\n` +
    `💵 <b>Total: ${formatoCOP(d.total)}</b>\n` +
    `🔖 Código: <code>${escaparHtml(d.codigo)}</code>\n\n` +
    `<a href="${wa}">Escribir al cliente por WhatsApp</a>`
  )
}

export async function enviarTelegramBarbero(
  d: ReservaEmailData,
): Promise<TelegramResultado> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.warn(
      '[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID no configurados → modo simulado.',
    )
    return { enviado: false }
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: textoTelegram(d),
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      },
    )
    const json = (await res.json()) as { ok?: boolean; description?: string }
    if (!res.ok || !json.ok) {
      console.error('[telegram] error:', json?.description)
      return { enviado: false, error: json?.description || `HTTP ${res.status}` }
    }
    return { enviado: true }
  } catch (e) {
    console.error('[telegram] fallo al enviar:', e)
    return { enviado: false, error: (e as Error).message }
  }
}

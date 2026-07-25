'use server'

import path from 'node:path'
import nodemailer from 'nodemailer'
import {
  DIAS,
  NEGOCIO,
  type ReservaPayload,
  type ReservaResultado,
} from '@/lib/mock-data'
import {
  emailBarbero,
  emailCliente,
  type ReservaEmailData,
} from '@/lib/emails'
import { enviarSmsBarbero } from '@/lib/sms'
import { enviarTelegramBarbero } from '@/lib/telegram'
import { crearReserva } from '@/lib/repo'

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function generarCodigo() {
  return `DA-${Math.floor(1000 + Math.random() * 9000)}`
}

let transporterCache: nodemailer.Transporter | null = null
function getTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) return null
  if (!transporterCache) {
    transporterCache = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    })
  }
  return transporterCache
}

export async function enviarReserva(
  payload: ReservaPayload,
): Promise<ReservaResultado> {
  const { servicios, diaId, hora, datos } = payload

  // ── Validación en servidor (no confiamos en el cliente) ──────────
  if (!Array.isArray(servicios) || servicios.length === 0)
    return { ok: false, error: 'Selecciona al menos un servicio.' }
  if (!datos?.nombre || datos.nombre.trim().length < 2)
    return { ok: false, error: 'Falta el nombre.' }
  if (!datos?.celular || datos.celular.replace(/\D/g, '').length < 7)
    return { ok: false, error: 'El celular no es válido.' }
  if (!datos?.email || !RE_EMAIL.test(datos.email.trim()))
    return { ok: false, error: 'El correo del cliente no es válido.' }
  const dia = DIAS.find((d) => d.id === diaId)
  if (!dia || !hora) return { ok: false, error: 'Falta día u hora.' }

  // Recalcular totales en el servidor
  const total = servicios.reduce((a, s) => a + (s.precio || 0), 0)
  const duracionTotal = servicios.reduce((a, s) => a + (s.duracion || 0), 0)
  const codigo = generarCodigo()

  // ── Persistir la reserva (fuente de verdad del panel) ────────────
  // Se guarda ANTES de notificar; si el horario ya se ocupó, se aborta.
  const guardada = await crearReserva({
    codigo,
    fechaISO: dia.fecha,
    hora,
    servicios: servicios.map((s) => ({
      id: s.id,
      nombre: s.nombre,
      precio: s.precio,
      duracion: s.duracion,
    })),
    total,
    duracionTotal,
    datos: {
      nombre: datos.nombre.trim(),
      celular: datos.celular.trim(),
      email: datos.email.trim(),
    },
  })
  if (!guardada.ok) {
    return { ok: false, error: guardada.error }
  }

  const data: ReservaEmailData = {
    codigo,
    nombre: datos.nombre.trim(),
    email: datos.email.trim(),
    celular: datos.celular.trim(),
    servicios: servicios.map((s) => ({
      nombre: s.nombre,
      precio: s.precio,
      duracion: s.duracion,
    })),
    total,
    duracionTotal,
    fecha: `${dia.etiqueta} ${dia.numero}`,
    hora,
  }

  // Avisos al barbero, independientes del correo (cada uno con su fallback).
  const smsPromise = enviarSmsBarbero(data)
  const telegramPromise = enviarTelegramBarbero(data)

  const transporter = getTransporter()
  const entregados: string[] = []

  if (transporter) {
    const remitente = `"${NEGOCIO.nombre}" <${process.env.GMAIL_USER}>`
    const barberoTo = process.env.BARBER_EMAIL || process.env.GMAIL_USER!
    const cli = emailCliente(data)
    const bar = emailBarbero(data)

    // Logo embebido (CID) para que se vea inline aunque el cliente bloquee
    // imágenes remotas. Referenciado en las plantillas como cid:logoDA.
    const logoAdjunto = {
      filename: 'don-antonio.jpg',
      path: path.join(process.cwd(), 'public', 'logo-don-antonio.jpg'),
      cid: 'logoDA',
    }

    // Enviar ambos correos en paralelo, tolerante a fallos
    const [resCliente, resBarbero] = await Promise.allSettled([
      transporter.sendMail({
        from: remitente,
        to: data.email,
        replyTo: barberoTo,
        subject: cli.subject,
        html: cli.html,
        text: cli.text,
        attachments: [logoAdjunto],
      }),
      transporter.sendMail({
        from: remitente,
        to: barberoTo,
        replyTo: data.email,
        subject: bar.subject,
        html: bar.html,
        text: bar.text,
        attachments: [logoAdjunto],
      }),
    ])

    if (resCliente.status === 'fulfilled')
      entregados.push(...(resCliente.value.accepted as string[]).map(String))
    else console.error('[reserva] fallo correo cliente:', resCliente.reason)
    if (resBarbero.status === 'fulfilled')
      entregados.push(...(resBarbero.value.accepted as string[]).map(String))
    else console.error('[reserva] fallo correo barbero:', resBarbero.reason)
  } else {
    console.warn(
      '[reserva] GMAIL_USER / GMAIL_APP_PASSWORD no configurados → correos en modo simulado.',
      { codigo, cliente: data.email },
    )
  }

  const [sms, telegram] = await Promise.all([smsPromise, telegramPromise])
  const enviadoEmail = entregados.length > 0

  console.info('[reserva] canales →', {
    codigo,
    correo: enviadoEmail,
    sms: sms.enviado,
    telegram: telegram.enviado,
  })

  // Aviso si había credenciales de correo pero ambos fallaron
  const error =
    transporter && !enviadoEmail
      ? 'La reserva quedó, pero no pudimos enviar los correos.'
      : undefined

  return {
    ok: true,
    codigo,
    enviado: enviadoEmail,
    entregados,
    sms: sms.enviado || telegram.enviado,
    error,
  }
}

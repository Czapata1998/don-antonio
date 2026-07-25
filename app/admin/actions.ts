'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import {
  COOKIE_SESION,
  cookieOpts,
  crearToken,
  passwordCorrecta,
  requireAdmin,
} from '@/lib/auth'
import {
  setEstadoReserva,
  crearBloqueo,
  quitarBloqueo,
  upsertServicio,
  toggleServicio,
  updateHorario,
  type EstadoReserva,
} from '@/lib/repo'

// ── Sesión ──────────────────────────────────────────────────────────
export async function iniciarSesion(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const password = String(formData.get('password') ?? '')
  if (!passwordCorrecta(password)) {
    return { error: 'Contraseña incorrecta. Intenta de nuevo.' }
  }
  const store = await cookies()
  store.set(COOKIE_SESION, crearToken(), cookieOpts)
  redirect('/admin')
}

export async function cerrarSesion() {
  const store = await cookies()
  store.delete(COOKIE_SESION)
  redirect('/admin/login')
}

// ── Reservas ────────────────────────────────────────────────────────
export async function marcarEstado(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id'))
  const estado = String(formData.get('estado')) as EstadoReserva
  if (!['pendiente', 'atendida', 'cancelada'].includes(estado)) return
  await setEstadoReserva(id, estado)
  revalidatePath('/admin')
  revalidatePath('/admin/agenda')
  revalidatePath('/admin/clientes')
}

// ── Bloqueos de horario ─────────────────────────────────────────────
export async function bloquearFranja(formData: FormData) {
  await requireAdmin()
  const fecha = String(formData.get('fecha'))
  const hora = String(formData.get('hora'))
  const motivo = String(formData.get('motivo') ?? '').trim() || undefined
  if (!fecha || !hora) return
  await crearBloqueo(fecha, hora, motivo)
  revalidatePath('/admin/agenda')
}

export async function liberarFranja(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id'))
  if (!id) return
  await quitarBloqueo(id)
  revalidatePath('/admin/agenda')
}

// ── Servicios ───────────────────────────────────────────────────────
export async function guardarServicio(formData: FormData) {
  await requireAdmin()
  await upsertServicio({
    id: String(formData.get('id') ?? '') || undefined,
    categoria: String(formData.get('categoria') ?? 'Cortes'),
    nombre: String(formData.get('nombre') ?? '').trim(),
    descripcion: String(formData.get('descripcion') ?? '').trim(),
    precio: Number(formData.get('precio') ?? 0),
    duracion: Number(formData.get('duracion') ?? 0),
    activo: formData.get('activo') === 'on',
    orden: Number(formData.get('orden') ?? 0),
  })
  revalidatePath('/admin/servicios')
}

export async function alternarServicio(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id'))
  const activo = formData.get('activo') === 'true'
  await toggleServicio(id, activo)
  revalidatePath('/admin/servicios')
}

// ── Horario / jornada laboral ───────────────────────────────────────
export async function guardarHorario(formData: FormData) {
  await requireAdmin()
  const apertura = Number(formData.get('apertura') ?? 9)
  const cierre = Number(formData.get('cierre') ?? 18)
  if (!Number.isFinite(apertura) || !Number.isFinite(cierre) || cierre <= apertura) {
    return
  }
  const diasCerrados: number[] = []
  for (let d = 0; d < 7; d++) {
    if (formData.get(`dia-${d}`) === 'on') diasCerrados.push(d)
  }
  await updateHorario({ apertura, cierre, diasCerrados })
  // Todo lo que depende de la jornada.
  revalidatePath('/admin/horario')
  revalidatePath('/admin')
  revalidatePath('/admin/agenda')
}

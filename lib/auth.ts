import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const COOKIE_SESION = 'da_admin'
const DURACION_MS = 7 * 24 * 60 * 60 * 1000 // 7 días

function secreto(): string {
  return process.env.ADMIN_SESSION_SECRET || 'dev-secret-cambiar'
}

function firmar(payload: string): string {
  return createHmac('sha256', secreto()).update(payload).digest('hex')
}

// Token = "<expira>.<firma>". Simple y suficiente para un único barbero.
export function crearToken(): string {
  const expira = String(Date.now() + DURACION_MS)
  return `${expira}.${firmar(expira)}`
}

export function tokenValido(token: string | undefined | null): boolean {
  if (!token) return false
  const [expira, firma] = token.split('.')
  if (!expira || !firma) return false
  if (Number(expira) < Date.now()) return false
  const esperada = firmar(expira)
  const a = Buffer.from(firma)
  const b = Buffer.from(esperada)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function passwordCorrecta(intento: string): boolean {
  const real = process.env.ADMIN_PASSWORD
  if (!real) return false
  const a = Buffer.from(intento)
  const b = Buffer.from(real)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

// Guardia para layouts/páginas/acciones del panel (runtime node).
export async function requireAdmin() {
  const store = await cookies()
  if (!tokenValido(store.get(COOKIE_SESION)?.value)) {
    redirect('/admin/login')
  }
}

export async function haySesion(): Promise<boolean> {
  const store = await cookies()
  return tokenValido(store.get(COOKIE_SESION)?.value)
}

export const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: DURACION_MS / 1000,
}

import 'server-only'
import { prisma } from '@/lib/db'
import {
  gridHoras,
  HORARIO,
  DIAS_CERRADOS_DEFAULT,
  construirDias,
  type Slot,
  type Servicio,
  type DiaDisponible,
} from '@/lib/mock-data'

export type EstadoReserva = 'pendiente' | 'atendida' | 'cancelada'

export interface Horario {
  apertura: number
  cierre: number
  pasoMin: number
  diasCerrados: number[]
}

// ── Utilidades de tiempo ────────────────────────────────────────────
const aMinutos = (hora: string) => {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

// Slots de la grilla que cubre una cita que empieza en `hora` y dura `duracion`.
function slotsCubiertos(hora: string, duracion: number, h: Horario): string[] {
  const inicio = aMinutos(hora)
  const fin = inicio + Math.max(duracion, h.pasoMin)
  return gridHoras(h.apertura, h.cierre, h.pasoMin).filter((x) => {
    const t = aMinutos(x)
    return t >= inicio && t < fin
  })
}

// Fecha (medianoche local) a partir de un ISO yyyy-mm-dd.
function fechaDesdeISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d, 0, 0, 0, 0)
}
function rangoDia(iso: string): { desde: Date; hasta: Date } {
  const desde = fechaDesdeISO(iso)
  const hasta = new Date(desde)
  hasta.setDate(desde.getDate() + 1)
  return { desde, hasta }
}

// ── Horario / jornada del barbero (config editable desde /admin) ─────
export async function getHorario(): Promise<Horario> {
  const c = await prisma.config.findUnique({ where: { id: 1 } })
  if (!c) {
    return {
      apertura: HORARIO.apertura,
      cierre: HORARIO.cierre,
      pasoMin: HORARIO.pasoMin,
      diasCerrados: [...DIAS_CERRADOS_DEFAULT],
    }
  }
  return {
    apertura: c.apertura,
    cierre: c.cierre,
    pasoMin: c.pasoMin,
    diasCerrados: c.diasCerrados
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number),
  }
}

export async function updateHorario(data: {
  apertura: number
  cierre: number
  diasCerrados: number[]
}) {
  const dias = [...new Set(data.diasCerrados)].sort((a, b) => a - b).join(',')
  return prisma.config.upsert({
    where: { id: 1 },
    create: { id: 1, apertura: data.apertura, cierre: data.cierre, diasCerrados: dias },
    update: { apertura: data.apertura, cierre: data.cierre, diasCerrados: dias },
  })
}

// Próximos días abiertos (respeta los días cerrados configurados).
export async function getDiasDisponibles(cantidad = 6): Promise<DiaDisponible[]> {
  const h = await getHorario()
  return construirDias(h.diasCerrados, cantidad)
}

// ── Servicios ───────────────────────────────────────────────────────
export async function getServiciosActivos(): Promise<Servicio[]> {
  const filas = await prisma.servicio.findMany({
    where: { activo: true },
    orderBy: [{ orden: 'asc' }, { precio: 'asc' }],
  })
  return filas.map((s) => ({
    id: s.id,
    categoria: s.categoria as Servicio['categoria'],
    nombre: s.nombre,
    descripcion: s.descripcion,
    precio: s.precio,
    duracion: s.duracion,
  }))
}

export async function getTodosLosServicios() {
  return prisma.servicio.findMany({ orderBy: [{ orden: 'asc' }, { nombre: 'asc' }] })
}

// ── Disponibilidad de horarios ──────────────────────────────────────
// Si se pasa `duracionMin`, un horario de inicio solo está disponible cuando
// el servicio COMPLETO cabe (todos sus slots libres y termina antes del cierre).
// Así la agenda queda congruente y el barbero no se solapa citas.
export async function getSlots(
  fechaISO: string,
  duracionMin = 0,
): Promise<Slot[]> {
  const h = await getHorario()
  const { desde, hasta } = rangoDia(fechaISO)

  // Día cerrado → sin horarios.
  if (h.diasCerrados.includes(desde.getDay())) return []

  const grid = gridHoras(h.apertura, h.cierre, h.pasoMin)
  const cierreMin = h.cierre * 60

  const [reservas, bloqueos] = await Promise.all([
    prisma.reserva.findMany({
      where: { fecha: { gte: desde, lt: hasta }, estado: { not: 'cancelada' } },
      select: { hora: true, duracionTotal: true },
    }),
    prisma.bloqueo.findMany({
      where: { fecha: { gte: desde, lt: hasta } },
      select: { hora: true },
    }),
  ])

  const ocupados = new Set<string>()
  for (const r of reservas)
    for (const s of slotsCubiertos(r.hora, r.duracionTotal, h)) ocupados.add(s)
  for (const b of bloqueos) ocupados.add(b.hora)

  // Sin duración: ocupación slot a slot (se usa en el panel para bloquear).
  if (!duracionMin) {
    return grid.map((hora) => ({ hora, ocupado: ocupados.has(hora) }))
  }

  // Con duración: el inicio solo sirve si el servicio entero cabe y está libre.
  return grid.map((hora) => {
    const cabe = aMinutos(hora) + duracionMin <= cierreMin
    const necesita = slotsCubiertos(hora, duracionMin, h)
    const libre = cabe && !necesita.some((s) => ocupados.has(s))
    return { hora, ocupado: !libre }
  })
}

// ── Crear reserva (persistencia del sitio público) ──────────────────
export interface CrearReservaInput {
  codigo: string
  fechaISO: string
  hora: string
  servicios: { id: string; nombre: string; precio: number; duracion: number }[]
  total: number
  duracionTotal: number
  datos: { nombre: string; celular: string; email: string }
}

export type CrearReservaResultado =
  | { ok: true; codigo: string }
  | { ok: false; error: string }

export async function crearReserva(
  input: CrearReservaInput,
): Promise<CrearReservaResultado> {
  const h = await getHorario()
  const { desde, hasta } = rangoDia(input.fechaISO)
  const celular = input.datos.celular.trim()

  // El día no debe estar cerrado y el servicio debe terminar antes del cierre.
  if (h.diasCerrados.includes(desde.getDay())) {
    return { ok: false, error: 'Ese día la barbería está cerrada.' }
  }
  if (aMinutos(input.hora) + input.duracionTotal > h.cierre * 60) {
    return {
      ok: false,
      error: 'El servicio no alcanza a terminar antes del cierre. Elige un horario más temprano.',
    }
  }
  const necesarios = slotsCubiertos(input.hora, input.duracionTotal, h)

  try {
    await prisma.$transaction(async (tx) => {
      // Re-validar que la franja siga libre (evita doble-booking).
      const [reservas, bloqueos] = await Promise.all([
        tx.reserva.findMany({
          where: { fecha: { gte: desde, lt: hasta }, estado: { not: 'cancelada' } },
          select: { hora: true, duracionTotal: true },
        }),
        tx.bloqueo.findMany({
          where: { fecha: { gte: desde, lt: hasta } },
          select: { hora: true },
        }),
      ])
      const ocupados = new Set<string>()
      for (const r of reservas)
        for (const s of slotsCubiertos(r.hora, r.duracionTotal, h)) ocupados.add(s)
      for (const b of bloqueos) ocupados.add(b.hora)
      if (necesarios.some((s) => ocupados.has(s))) {
        throw new Error('SLOT_OCUPADO')
      }

      const cliente = await tx.cliente.upsert({
        where: { celular },
        create: {
          nombre: input.datos.nombre.trim(),
          celular,
          email: input.datos.email.trim(),
        },
        update: {
          nombre: input.datos.nombre.trim(),
          email: input.datos.email.trim(),
        },
      })

      await tx.reserva.create({
        data: {
          codigo: input.codigo,
          clienteId: cliente.id,
          fecha: desde,
          hora: input.hora,
          estado: 'pendiente',
          total: input.total,
          duracionTotal: input.duracionTotal,
          servicios: {
            create: input.servicios.map((s) => ({
              servicioId: s.id,
              nombre: s.nombre,
              precio: s.precio,
              duracion: s.duracion,
            })),
          },
        },
      })
    })
    return { ok: true, codigo: input.codigo }
  } catch (e) {
    if (e instanceof Error && e.message === 'SLOT_OCUPADO')
      return { ok: false, error: 'Ese horario se acaba de ocupar. Elige otro, por favor.' }
    console.error('[repo.crearReserva] error:', e)
    return { ok: false, error: 'No pudimos guardar la reserva. Intenta de nuevo.' }
  }
}

// ── Agenda / dashboard ──────────────────────────────────────────────
const incluirServicios = { servicios: true, cliente: true } as const

export async function listAgenda(fechaISO: string) {
  const { desde, hasta } = rangoDia(fechaISO)
  return prisma.reserva.findMany({
    where: { fecha: { gte: desde, lt: hasta } },
    include: incluirServicios,
    orderBy: { hora: 'asc' },
  })
}

export async function listProximas(limite = 8) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return prisma.reserva.findMany({
    where: { fecha: { gte: hoy }, estado: 'pendiente' },
    include: incluirServicios,
    orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
    take: limite,
  })
}

export async function resumenHoy() {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const { desde, hasta } = rangoDia(
    `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(
      hoy.getDate(),
    ).padStart(2, '0')}`,
  )
  const citasHoy = await prisma.reserva.findMany({
    where: { fecha: { gte: desde, lt: hasta }, estado: { not: 'cancelada' } },
    select: { total: true, estado: true },
  })
  const [totalClientes, pendientesFuturas] = await Promise.all([
    prisma.cliente.count(),
    prisma.reserva.count({ where: { fecha: { gte: hasta }, estado: 'pendiente' } }),
  ])
  return {
    citasHoy: citasHoy.length,
    ingresosHoy: citasHoy.reduce((a, c) => a + c.total, 0),
    totalClientes,
    pendientesFuturas,
  }
}

// ── Clientes ────────────────────────────────────────────────────────
export async function listClientes() {
  const clientes = await prisma.cliente.findMany({
    include: { reservas: { select: { total: true, estado: true, fecha: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return clientes.map((c) => {
    const atendidas = c.reservas.filter((r) => r.estado === 'atendida')
    const activas = c.reservas.filter((r) => r.estado !== 'cancelada')
    const ultima = activas.reduce<Date | null>(
      (max, r) => (!max || r.fecha > max ? r.fecha : max),
      null,
    )
    return {
      id: c.id,
      nombre: c.nombre,
      celular: c.celular,
      email: c.email,
      visitas: atendidas.length,
      reservasActivas: activas.length,
      gastoTotal: atendidas.reduce((a, r) => a + r.total, 0),
      ultimaVisita: ultima,
    }
  })
}

export async function getCliente(id: string) {
  return prisma.cliente.findUnique({
    where: { id },
    include: {
      reservas: {
        include: { servicios: true },
        orderBy: [{ fecha: 'desc' }, { hora: 'desc' }],
      },
    },
  })
}

// ── Mutaciones (panel) ──────────────────────────────────────────────
export async function setEstadoReserva(id: string, estado: EstadoReserva) {
  return prisma.reserva.update({ where: { id }, data: { estado } })
}

export async function upsertServicio(data: {
  id?: string
  categoria: string
  nombre: string
  descripcion: string
  precio: number
  duracion: number
  activo: boolean
  orden: number
}) {
  if (data.id) {
    return prisma.servicio.update({
      where: { id: data.id },
      data: {
        categoria: data.categoria,
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        duracion: data.duracion,
        activo: data.activo,
        orden: data.orden,
      },
    })
  }
  const id = data.nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return prisma.servicio.create({ data: { ...data, id: id || `svc-${Date.now()}` } })
}

export async function toggleServicio(id: string, activo: boolean) {
  return prisma.servicio.update({ where: { id }, data: { activo } })
}

export async function crearBloqueo(fechaISO: string, hora: string, motivo?: string) {
  const { desde } = rangoDia(fechaISO)
  return prisma.bloqueo.upsert({
    where: { fecha_hora: { fecha: desde, hora } },
    create: { fecha: desde, hora, motivo },
    update: { motivo },
  })
}

export async function quitarBloqueo(id: string) {
  return prisma.bloqueo.delete({ where: { id } })
}

export async function listBloqueos(fechaISO: string) {
  const { desde, hasta } = rangoDia(fechaISO)
  return prisma.bloqueo.findMany({
    where: { fecha: { gte: desde, lt: hasta } },
    orderBy: { hora: 'asc' },
  })
}

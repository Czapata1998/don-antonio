import { PrismaClient } from '@prisma/client'
import { SERVICIOS, DIAS } from '../lib/mock-data'

const prisma = new PrismaClient()

function fechaDesdeISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d, 0, 0, 0, 0)
}

const servicioPorId = new Map(SERVICIOS.map((s) => [s.id, s]))

function armarReserva(
  codigo: string,
  ids: string[],
  fechaISO: string,
  hora: string,
  estado: 'pendiente' | 'atendida' | 'cancelada',
) {
  const servicios = ids.map((id) => servicioPorId.get(id)!)
  const total = servicios.reduce((a, s) => a + s.precio, 0)
  const duracionTotal = servicios.reduce((a, s) => a + s.duracion, 0)
  return {
    codigo,
    fecha: fechaDesdeISO(fechaISO),
    hora,
    estado,
    total,
    duracionTotal,
    servicios,
  }
}

async function main() {
  // ── Configuración de jornada (fila única) ──────────────────────────
  await prisma.config.upsert({
    where: { id: 1 },
    // pasoMin no es configurable por el barbero → se fuerza a 30 (turnos de
    // media hora). apertura/cierre/diasCerrados sí los maneja él, no se tocan.
    update: { pasoMin: 30 },
    create: { id: 1, apertura: 9, cierre: 18, pasoMin: 30, diasCerrados: '0' },
  })

  // ── Servicios (fuente de verdad = catálogo del sitio) ──────────────
  for (let i = 0; i < SERVICIOS.length; i++) {
    const s = SERVICIOS[i]
    await prisma.servicio.upsert({
      where: { id: s.id },
      create: { ...s, activo: true, orden: i },
      update: {
        categoria: s.categoria,
        nombre: s.nombre,
        descripcion: s.descripcion,
        precio: s.precio,
        duracion: s.duracion,
        orden: i,
      },
    })
  }

  // ── Clientes + reservas demo (para que el panel se vea vivo) ───────
  // Los códigos usan prefijo DEMO- (el sitio genera DA-####, así no chocan).
  // Se anclan a los días de ESTA semana (DIAS se recalcula en cada seed).
  const demo = [
    {
      cliente: { nombre: 'Andrés Gómez', celular: '3011112233', email: 'andres@ejemplo.com' },
      reservas: [
        armarReserva('DEMO-1042', ['corte-clasico'], DIAS[0].fecha, '09:00', 'atendida'),
        armarReserva('DEMO-1103', ['corte-lavado', 'perfilado-barba'], DIAS[1].fecha, '11:00', 'pendiente'),
      ],
    },
    {
      cliente: { nombre: 'Julián Rivera', celular: '3024445566', email: 'julian@ejemplo.com' },
      reservas: [
        armarReserva('DEMO-1077', ['afeitado-navaja'], DIAS[0].fecha, '10:30', 'atendida'),
        armarReserva('DEMO-1120', ['corte-clasico', 'perfilado-cejas'], DIAS[0].fecha, '15:00', 'pendiente'),
      ],
    },
    {
      cliente: { nombre: 'Marcela Ossa', celular: '3037778899', email: 'marcela@ejemplo.com' },
      reservas: [
        armarReserva('DEMO-1131', ['diseno-decoracion'], DIAS[2].fecha, '16:00', 'pendiente'),
        armarReserva('DEMO-1099', ['corte-lavado'], DIAS[1].fecha, '14:00', 'cancelada'),
      ],
    },
  ]

  // Borrar demos anteriores (y los DA-* de seeds viejos) para RE-ANCLAR las
  // fechas al día actual. No toca reservas reales del sitio (esas quedan).
  await prisma.reserva.deleteMany({
    where: {
      OR: [
        { codigo: { startsWith: 'DEMO-' } },
        { codigo: { in: ['DA-1042', 'DA-1103', 'DA-1077', 'DA-1120', 'DA-1131', 'DA-1099'] } },
      ],
    },
  })

  for (const { cliente, reservas } of demo) {
    const c = await prisma.cliente.upsert({
      where: { celular: cliente.celular },
      create: cliente,
      update: { nombre: cliente.nombre, email: cliente.email },
    })
    for (const r of reservas) {
      await prisma.reserva.create({
        data: {
          codigo: r.codigo,
          clienteId: c.id,
          fecha: r.fecha,
          hora: r.hora,
          estado: r.estado,
          total: r.total,
          duracionTotal: r.duracionTotal,
          servicios: {
            create: r.servicios.map((s) => ({
              servicioId: s.id,
              nombre: s.nombre,
              precio: s.precio,
              duracion: s.duracion,
            })),
          },
        },
      })
    }
  }

  const [servicios, clientes, reservas] = await Promise.all([
    prisma.servicio.count(),
    prisma.cliente.count(),
    prisma.reserva.count(),
  ])
  console.log(`✔ Seed listo: ${servicios} servicios, ${clientes} clientes, ${reservas} reservas.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

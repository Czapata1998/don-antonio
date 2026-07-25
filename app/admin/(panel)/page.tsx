import { CalendarClock, Coins, Users, CalendarDays } from 'lucide-react'
import { listAgenda, listProximas, resumenHoy } from '@/lib/repo'
import { formatoCOP } from '@/lib/mock-data'
import { fechaLarga, isoLocal } from '@/lib/format'
import { StatCard } from '@/components/admin/stat-card'
import { CitaCard, type CitaVista } from '@/components/admin/cita-card'
import { AutoRefresh } from '@/components/admin/auto-refresh'

export const dynamic = 'force-dynamic'

type ReservaBD = Awaited<ReturnType<typeof listAgenda>>[number]

function aVista(r: ReservaBD): CitaVista {
  return {
    id: r.id,
    hora: r.hora,
    estado: r.estado,
    total: r.total,
    duracionTotal: r.duracionTotal,
    fecha: r.fecha,
    cliente: { nombre: r.cliente.nombre, celular: r.cliente.celular },
    servicios: r.servicios.map((s) => ({ id: s.id, nombre: s.nombre })),
  }
}

export default async function DashboardPage() {
  const hoy = new Date()
  const hoyISO = isoLocal(hoy)
  const [resumen, agenda, proximas] = await Promise.all([
    resumenHoy(),
    listAgenda(hoyISO),
    listProximas(6),
  ])

  const citasHoy = agenda.map(aVista)
  const proximasVista = proximas.map(aVista).filter((c) => c.fecha > hoy || isoLocal(c.fecha) !== hoyISO)

  return (
    <div className="mx-auto max-w-4xl">
      <AutoRefresh />
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm capitalize text-marfil-tenue">{fechaLarga(hoy)}</p>
          <h1 className="font-heading text-2xl font-bold text-marfil">Tu día de hoy</h1>
        </div>
        <span className="mt-1 flex shrink-0 items-center gap-1.5 rounded-full bg-[rgb(var(--marfil-rgb)/0.06)] px-2.5 py-1 text-[11px] text-marfil-tenue">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[rgb(159_230_160)]" />
          En vivo
        </span>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Citas hoy" value={String(resumen.citasHoy)} icon={CalendarClock} />
        <StatCard
          label="Ingresos hoy"
          value={formatoCOP(resumen.ingresosHoy)}
          icon={Coins}
          hint="Reservas no canceladas"
        />
        <StatCard
          label="Próximas"
          value={String(resumen.pendientesFuturas)}
          icon={CalendarDays}
          hint="Pendientes futuras"
        />
        <StatCard label="Clientes" value={String(resumen.totalClientes)} icon={Users} />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-heading text-lg font-bold text-marfil">Agenda de hoy</h2>
        {citasHoy.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-marfil-tenue">
            No hay citas para hoy todavía.
          </p>
        ) : (
          <div className="space-y-4">
            {citasHoy.map((c) => (
              <CitaCard key={c.id} cita={c} />
            ))}
          </div>
        )}
      </section>

      {proximasVista.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 font-heading text-lg font-bold text-marfil">Próximas citas</h2>
          <div className="space-y-4">
            {proximasVista.map((c) => (
              <CitaCard key={c.id} cita={c} mostrarFecha />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

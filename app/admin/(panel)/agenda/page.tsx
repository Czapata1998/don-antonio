import Link from 'next/link'
import { Ban, Plus } from 'lucide-react'
import { listAgenda, listBloqueos, getSlots } from '@/lib/repo'
import { DIAS } from '@/lib/mock-data'
import { fechaLarga, isoLocal } from '@/lib/format'
import { CitaCard, type CitaVista } from '@/components/admin/cita-card'
import { AutoRefresh } from '@/components/admin/auto-refresh'
import { bloquearFranja, liberarFranja } from '@/app/admin/actions'

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

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>
}) {
  const { d } = await searchParams
  const hoyISO = isoLocal(new Date())
  const seleccionado = d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : hoyISO
  const fecha = new Date(`${seleccionado}T00:00:00`)

  const [agenda, bloqueos, slots] = await Promise.all([
    listAgenda(seleccionado),
    listBloqueos(seleccionado),
    getSlots(seleccionado),
  ])
  const citas = agenda.map(aVista)
  const libres = slots.filter((s) => !s.ocupado).map((s) => s.hora)

  return (
    <div className="mx-auto max-w-4xl">
      <AutoRefresh />
      <header className="mb-5">
        <h1 className="font-heading text-2xl font-bold text-marfil">Agenda</h1>
        <p className="text-sm capitalize text-marfil-tenue">{fechaLarga(fecha)}</p>
      </header>

      {/* Selector de día */}
      <div className="no-scrollbar -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
        {DIAS.map((dia) => {
          const activo = dia.fecha === seleccionado
          return (
            <Link
              key={dia.id}
              href={`/admin/agenda?d=${dia.fecha}`}
              className={`flex shrink-0 flex-col items-center rounded-xl px-4 py-2.5 text-center transition-colors ${
                activo
                  ? 'bg-laton text-primary-foreground'
                  : 'border border-border bg-card text-marfil hover:border-laton'
              }`}
            >
              <span className="text-[11px] font-medium uppercase tracking-wide opacity-80">
                {dia.etiqueta}
              </span>
              <span className="font-heading text-lg font-bold">{dia.numero}</span>
            </Link>
          )
        })}
      </div>

      {/* Citas del día */}
      <section>
        {citas.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-marfil-tenue">
            Sin citas este día.
          </p>
        ) : (
          <div className="space-y-4">
            {citas.map((c) => (
              <CitaCard key={c.id} cita={c} />
            ))}
          </div>
        )}
      </section>

      {/* Bloqueos de horario */}
      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-bold text-marfil">
          <Ban className="h-4 w-4 text-laton-claro" />
          Franjas bloqueadas
        </h2>

        {bloqueos.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {bloqueos.map((b) => (
              <form key={b.id} action={liberarFranja}>
                <input type="hidden" name="id" value={b.id} />
                <button
                  type="submit"
                  title="Liberar franja"
                  className="group inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-marfil transition-colors hover:border-[rgb(248_113_113/0.5)]"
                >
                  <span className="font-heading font-bold tabular-nums">{b.hora}</span>
                  {b.motivo && <span className="text-xs text-marfil-tenue">· {b.motivo}</span>}
                  <span className="text-marfil-tenue transition-colors group-hover:text-[rgb(248_113_113)]">
                    ✕
                  </span>
                </button>
              </form>
            ))}
          </div>
        )}

        <form
          action={bloquearFranja}
          className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-card p-4"
        >
          <input type="hidden" name="fecha" value={seleccionado} />
          <label className="flex flex-col gap-1">
            <span className="text-xs text-marfil-tenue">Hora</span>
            <select
              name="hora"
              className="rounded-lg border border-border bg-negro-base px-3 py-2 text-sm text-marfil outline-none focus:border-laton"
            >
              {libres.length === 0 && <option value="">Sin horas libres</option>}
              {libres.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs text-marfil-tenue">Motivo (opcional)</span>
            <input
              name="motivo"
              placeholder="Almuerzo, mandado…"
              className="w-full rounded-lg border border-border bg-negro-base px-3 py-2 text-sm text-marfil outline-none placeholder:text-marfil-tenue/60 focus:border-laton"
            />
          </label>
          <button
            type="submit"
            disabled={libres.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-laton px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Bloquear
          </button>
        </form>
      </section>
    </div>
  )
}

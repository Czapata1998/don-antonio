import { Check, Clock, Phone, X, RotateCcw } from 'lucide-react'
import { formatoCOP } from '@/lib/mock-data'
import { fechaCorta } from '@/lib/format'
import { marcarEstado } from '@/app/admin/actions'
import { EstadoBadge } from '@/components/admin/estado-badge'

export interface CitaVista {
  id: string
  hora: string
  estado: string
  total: number
  duracionTotal: number
  fecha: Date
  cliente: { nombre: string; celular: string }
  servicios: { id: string; nombre: string }[]
}

function AccionEstado({
  id,
  estado,
  children,
  tono,
}: {
  id: string
  estado: string
  children: React.ReactNode
  tono: 'ok' | 'no' | 'neutro'
}) {
  const clases =
    tono === 'ok'
      ? 'bg-[rgb(159_230_160/0.14)] text-[rgb(159_230_160)] hover:bg-[rgb(159_230_160/0.24)]'
      : tono === 'no'
        ? 'bg-[rgb(248_113_113/0.12)] text-[rgb(248_113_113)] hover:bg-[rgb(248_113_113/0.22)]'
        : 'bg-[rgb(var(--marfil-rgb)/0.06)] text-marfil-tenue hover:text-marfil'
  return (
    <form action={marcarEstado} className="flex-1">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="estado" value={estado} />
      <button
        type="submit"
        className={`flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${clases}`}
      >
        {children}
      </button>
    </form>
  )
}

export function CitaCard({
  cita,
  mostrarFecha = false,
}: {
  cita: CitaVista
  mostrarFecha?: boolean
}) {
  const cancelada = cita.estado === 'cancelada'
  return (
    <div
      className={`rounded-xl border border-border bg-card p-4 sm:p-5 ${
        cancelada ? 'opacity-60' : ''
      }`}
    >
      {/* Encabezado: hora + cliente + estado */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="shrink-0 font-heading text-xl font-bold tabular-nums text-laton-claro">
            {cita.hora}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-marfil">{cita.cliente.nombre}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-marfil-tenue">
              <Phone className="h-3 w-3 shrink-0" />
              <span className="truncate">{cita.cliente.celular}</span>
            </p>
          </div>
        </div>
        <span className="shrink-0">
          <EstadoBadge estado={cita.estado} />
        </span>
      </div>

      {/* Servicios */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {cita.servicios.map((s) => (
          <span
            key={s.id}
            className="rounded-md bg-[rgb(var(--marfil-rgb)/0.06)] px-2 py-1 text-xs text-marfil"
          >
            {s.nombre}
          </span>
        ))}
      </div>

      {/* Meta: fecha · duración · precio */}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3.5">
        <span className="flex items-center gap-1.5 text-xs text-marfil-tenue">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          {mostrarFecha && <span className="capitalize">{fechaCorta(cita.fecha)} · </span>}
          {cita.duracionTotal} min
        </span>
        <span className="font-heading text-base font-bold text-marfil">
          {formatoCOP(cita.total)}
        </span>
      </div>

      {/* Acciones: botones grandes, ancho completo en móvil */}
      <div className="mt-3 flex items-stretch gap-2">
        {cita.estado === 'pendiente' ? (
          <>
            <AccionEstado id={cita.id} estado="atendida" tono="ok">
              <Check className="h-4 w-4" /> Atendida
            </AccionEstado>
            <AccionEstado id={cita.id} estado="cancelada" tono="no">
              <X className="h-4 w-4" /> Cancelar
            </AccionEstado>
          </>
        ) : (
          <AccionEstado id={cita.id} estado="pendiente" tono="neutro">
            <RotateCcw className="h-4 w-4" /> Reabrir cita
          </AccionEstado>
        )}
      </div>
    </div>
  )
}

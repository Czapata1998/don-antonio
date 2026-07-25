import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Mail, Phone } from 'lucide-react'
import { getCliente } from '@/lib/repo'
import { formatoCOP } from '@/lib/mock-data'
import { fechaCorta } from '@/lib/format'
import { EstadoBadge } from '@/components/admin/estado-badge'

export const dynamic = 'force-dynamic'

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cliente = await getCliente(id)
  if (!cliente) notFound()

  const activas = cliente.reservas.filter((r) => r.estado !== 'cancelada')
  const atendidas = activas.filter((r) => r.estado === 'atendida')
  const gastoTotal = atendidas.reduce((a, r) => a + r.total, 0)

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/clientes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-marfil-tenue transition-colors hover:text-marfil"
      >
        <ArrowLeft className="h-4 w-4" />
        Clientes
      </Link>

      <header className="rounded-xl border border-border bg-card p-5">
        <h1 className="font-heading text-2xl font-bold text-marfil">{cliente.nombre}</h1>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-marfil-tenue">
          <span className="flex items-center gap-1.5">
            <Phone className="h-4 w-4" />
            {cliente.celular}
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="h-4 w-4" />
            {cliente.email}
          </span>
        </div>
        <div className="mt-4 flex gap-6">
          <div>
            <p className="font-heading text-xl font-bold text-marfil">{atendidas.length}</p>
            <p className="text-xs text-marfil-tenue">Visitas</p>
          </div>
          <div>
            <p className="font-heading text-xl font-bold text-marfil">{formatoCOP(gastoTotal)}</p>
            <p className="text-xs text-marfil-tenue">Total gastado</p>
          </div>
          <div>
            <p className="font-heading text-xl font-bold text-marfil">{cliente.reservas.length}</p>
            <p className="text-xs text-marfil-tenue">Reservas</p>
          </div>
        </div>
      </header>

      <h2 className="mb-3 mt-6 font-heading text-lg font-bold text-marfil">Historial</h2>
      <div className="space-y-2.5">
        {cliente.reservas.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm text-marfil">
                <span className="font-medium capitalize">{fechaCorta(r.fecha)}</span>
                <span className="text-marfil-tenue">· {r.hora}</span>
              </p>
              <p className="mt-0.5 truncate text-xs text-marfil-tenue">
                {r.servicios.map((s) => s.nombre).join(', ')}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="font-heading text-sm font-bold text-marfil">
                {formatoCOP(r.total)}
              </span>
              <EstadoBadge estado={r.estado} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

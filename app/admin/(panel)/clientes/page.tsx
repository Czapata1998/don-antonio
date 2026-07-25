import Link from 'next/link'
import { ChevronRight, Users } from 'lucide-react'
import { listClientes } from '@/lib/repo'
import { formatoCOP } from '@/lib/mock-data'
import { fechaCorta } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const clientes = await listClientes()

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-center gap-2">
        <h1 className="font-heading text-2xl font-bold text-marfil">Clientes</h1>
        <span className="rounded-full bg-[rgb(var(--marfil-rgb)/0.08)] px-2.5 py-0.5 text-sm text-marfil-tenue">
          {clientes.length}
        </span>
      </header>

      {clientes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card/40 p-8 text-center text-sm text-marfil-tenue">
          <Users className="mx-auto mb-2 h-6 w-6 opacity-50" />
          Aún no hay clientes. Aparecerán aquí en cuanto alguien reserve.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="hidden grid-cols-[1.6fr_1fr_0.7fr_1fr_1fr_auto] gap-3 bg-negro-carbon px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-marfil-tenue md:grid">
            <span>Cliente</span>
            <span>Celular</span>
            <span className="text-center">Visitas</span>
            <span className="text-right">Gastado</span>
            <span className="text-right">Última</span>
            <span />
          </div>
          <ul className="divide-y divide-border">
            {clientes.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/admin/clientes/${c.id}`}
                  className="grid grid-cols-2 items-center gap-3 bg-card px-4 py-3 transition-colors hover:bg-[rgb(var(--marfil-rgb)/0.03)] md:grid-cols-[1.6fr_1fr_0.7fr_1fr_1fr_auto]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-marfil">{c.nombre}</p>
                    <p className="truncate text-xs text-marfil-tenue md:hidden">{c.celular}</p>
                  </div>
                  <span className="hidden text-sm text-marfil-tenue md:block">{c.celular}</span>
                  <span className="hidden text-center text-sm text-marfil md:block">
                    {c.visitas}
                  </span>
                  <span className="text-right font-heading text-sm font-bold text-marfil md:text-marfil">
                    {formatoCOP(c.gastoTotal)}
                  </span>
                  <span className="hidden text-right text-xs text-marfil-tenue md:block">
                    {c.ultimaVisita ? fechaCorta(c.ultimaVisita) : '—'}
                  </span>
                  <ChevronRight className="hidden h-4 w-4 text-marfil-tenue md:block" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

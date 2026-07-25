'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  CalendarClock,
  Users,
  Scissors,
  Clock,
  LogOut,
} from 'lucide-react'
import { cerrarSesion } from '@/app/admin/actions'

const items = [
  { href: '/admin', label: 'Hoy', icon: CalendarClock, exact: true },
  { href: '/admin/agenda', label: 'Agenda', icon: CalendarDays, exact: false },
  { href: '/admin/clientes', label: 'Clientes', icon: Users, exact: false },
  { href: '/admin/servicios', label: 'Servicios', icon: Scissors, exact: false },
  { href: '/admin/horario', label: 'Horario', icon: Clock, exact: false },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 z-30 flex shrink-0 flex-col gap-2 border-b border-border bg-negro-carbon px-3 py-3 md:top-0 md:h-screen md:w-60 md:border-b-0 md:border-r md:py-6">
      <div className="mb-1 flex items-center justify-between gap-2 px-1 md:mb-2 md:px-2">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-laton text-primary-foreground">
            <Scissors className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="font-heading text-sm font-bold text-marfil">Don Antonio</p>
            <p className="text-[11px] text-marfil-tenue">Panel · Sergio</p>
          </div>
        </div>
        {/* Logout en móvil (en desktop va abajo) */}
        <form action={cerrarSesion} className="md:hidden">
          <button
            type="submit"
            aria-label="Cerrar sesión"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-marfil-tenue transition-colors hover:bg-[rgb(var(--marfil-rgb)/0.06)] hover:text-marfil"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Móvil: 5 pestañas equiespaciadas (ícono + etiqueta apilados).
          Desktop: lista vertical con ícono + etiqueta en línea. */}
      <nav className="flex gap-1 md:flex-col">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const activo = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium leading-none transition-colors md:flex-none md:flex-row md:gap-3 md:px-3 md:py-2.5 md:text-sm ${
                activo
                  ? 'bg-[rgb(var(--laton-rgb)/0.15)] text-laton-claro'
                  : 'text-marfil-tenue hover:bg-[rgb(var(--marfil-rgb)/0.06)] hover:text-marfil'
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0 md:h-4 md:w-4" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <form action={cerrarSesion} className="mt-auto hidden md:block">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-marfil-tenue transition-colors hover:bg-[rgb(var(--marfil-rgb)/0.06)] hover:text-marfil"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </form>
    </aside>
  )
}

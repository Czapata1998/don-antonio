'use client'

import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useState } from 'react'
import { Scissors } from 'lucide-react'
import { Logo } from '@/components/logo'
import { useBooking } from '@/components/booking/booking-context'

const spring = { type: 'spring' as const, stiffness: 280, damping: 30 }

export function Navbar() {
  const { abrir } = useBooking()
  const { scrollY } = useScroll()
  const [compacto, setCompacto] = useState(false)
  // El CTA flotante móvil solo aparece tras dejar atrás el hero,
  // para no duplicar el botón "Reservar mi cita" en la misma pantalla.
  const [mostrarCtaMovil, setMostrarCtaMovil] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    setCompacto(y > 40)
    const alturaHero = typeof window !== 'undefined' ? window.innerHeight : 800
    setMostrarCtaMovil(y > alturaHero * 0.72)
  })

  return (
    <>
      {/* ── Barra estándar (glass pill) · Clásico / Neón ── */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...spring, delay: 0.1 }}
        className="nav-standard fixed inset-x-0 top-0 z-50 flex justify-center px-4"
      >
        <motion.nav
          animate={{ paddingTop: compacto ? 8 : 14, paddingBottom: compacto ? 8 : 14 }}
          transition={spring}
          className="glass glass-edge mt-3 flex w-full max-w-5xl items-center justify-between gap-4 rounded-2xl px-4 sm:px-6"
        >
          <span className="flex items-center gap-3">
            {/* Poste de barbería animado (solo Clásico Oro) */}
            <span className="barber-pole clasico-only h-8 shrink-0" aria-hidden="true" />
            <Logo size={compacto ? 34 : 40} withWordmark />
          </span>
          <button
            onClick={abrir}
            className="shimmer-on-hover hidden items-center gap-2 rounded-full bg-laton px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-[0.97] sm:inline-flex"
          >
            <Scissors className="h-4 w-4" />
            Reservar cita
          </button>
        </motion.nav>
      </motion.header>

      {/* ── Barra retro con marquesina · Vintage Drip ── */}
      <header className="nav-vintage fixed inset-x-0 top-0 z-50 flex-col">
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...spring, delay: 0.1 }}
          className="flex flex-col"
        >
          {/* Marquesina que se desplaza sin fin */}
          <div className="marquee bg-laton text-primary-foreground">
            <div className="marquee-track py-1.5 text-[11px] font-bold uppercase tracking-[0.22em]">
              {[0, 1].map((half) => (
                <span key={half} className="flex shrink-0 items-center">
                  {Array.from({ length: 4 }).flatMap((_, i) =>
                    ['Cortes', 'Barba', 'Cejas', 'Diseños', 'Afeitado'].map(
                      (w) => (
                        <span key={`${half}-${i}-${w}`} className="flex items-center">
                          <span className="px-3">{w}</span>
                          {/* Rombo geométrico (guiño Art Déco / marca), no la estrellita tipo IA */}
                          <span
                            aria-hidden="true"
                            className="inline-block h-[5px] w-[5px] rotate-45 bg-current opacity-70"
                          />
                        </span>
                      ),
                    ),
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Barra principal crema */}
          <div className="border-b-2 border-[rgb(var(--laton-rgb)/0.35)] bg-card/92 backdrop-blur-md">
            <motion.div
              animate={{ paddingTop: compacto ? 6 : 10, paddingBottom: compacto ? 6 : 10 }}
              transition={spring}
              className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 sm:px-6"
            >
              <Logo size={compacto ? 34 : 42} withWordmark />
              <button
                onClick={abrir}
                className="shimmer-on-hover hidden items-center gap-2 rounded-full border-2 border-[rgb(var(--laton-profundo-rgb)/0.55)] bg-laton px-5 py-2 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-transform hover:scale-[1.03] active:scale-[0.97] sm:inline-flex"
              >
                <Scissors className="h-4 w-4" />
                Reservar
              </button>
            </motion.div>
          </div>
        </motion.div>
      </header>

      {/* ── Masthead Art Déco · simétrico, con reglas y diamantes de oro ── */}
      <header className="nav-deco fixed inset-x-0 top-0 z-50 flex-col">
        <motion.div
          initial={{ y: -70, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...spring, delay: 0.1 }}
          className="border-b border-[rgb(var(--laton-rgb)/0.3)] bg-[rgb(var(--negro-base)/0.82)] backdrop-blur-md"
          style={{ boxShadow: '0 1px 0 0 rgb(var(--laton-rgb) / 0.12)' }}
        >
          <motion.div
            animate={{ paddingTop: compacto ? 8 : 14, paddingBottom: compacto ? 8 : 14 }}
            transition={spring}
            className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 sm:px-8"
          >
            <Logo size={compacto ? 32 : 38} />

            {/* Wordmark centrado con reglas y diamantes (desktop) */}
            <div className="hidden flex-1 items-center justify-center gap-3 sm:flex">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-[rgb(var(--laton-rgb)/0.75)] lg:w-12" />
              <span className="h-1.5 w-1.5 rotate-45 bg-laton" />
              <span className="font-heading text-sm font-semibold uppercase tracking-[0.4em] text-marfil lg:text-base">
                Don Antonio
              </span>
              <span className="h-1.5 w-1.5 rotate-45 bg-laton" />
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-[rgb(var(--laton-rgb)/0.75)] lg:w-12" />
            </div>

            {/* Wordmark compacto centrado (móvil) */}
            <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 font-heading text-xs font-semibold uppercase tracking-[0.32em] text-marfil sm:hidden">
              Don Antonio
            </span>

            <button
              onClick={abrir}
              className="shimmer-on-hover hidden items-center gap-2 border border-laton px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-laton-claro transition-colors hover:bg-laton hover:text-primary-foreground sm:inline-flex"
            >
              Reservar
            </button>
          </motion.div>
        </motion.div>
      </header>

      {/* CTA flotante en móvil — solo tras dejar atrás el hero (evita duplicar el botón) */}
      <AnimatePresence>
        {mostrarCtaMovil && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={spring}
            className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 sm:hidden"
          >
            <button
              onClick={abrir}
              className="shimmer-on-hover flex w-full items-center justify-center gap-2 rounded-full bg-laton px-6 py-4 text-base font-semibold text-primary-foreground shadow-[0_0_30px_-4px_rgb(var(--laton-rgb)/0.6)] active:scale-[0.97]"
            >
              <Scissors className="h-5 w-5" />
              Reservar mi cita
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

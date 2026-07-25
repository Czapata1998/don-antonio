'use client'

import { motion } from 'framer-motion'
import { Scissors, CalendarDays, User } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'

const spring = { type: 'spring' as const, stiffness: 280, damping: 30 }

const PASOS = [
  {
    icono: Scissors,
    titulo: 'Elige servicio',
    texto: 'Marca lo que necesitas. Puedes combinar corte y barba.',
  },
  {
    icono: CalendarDays,
    titulo: 'Elige hora',
    texto: 'Mira los horarios libres y toca el que te quede mejor.',
  },
  {
    icono: User,
    titulo: 'Deja tus datos',
    texto: 'Solo tu nombre y celular. Sin registros ni claves.',
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="Cómo funciona"
          title="Reservar en 3 toques"
          description="Hecho para que cualquiera lo use sin pensarlo."
        />

        <div className="relative mt-14">
          {/* Línea dorada que conecta los pasos (desktop) */}
          <svg
            className="absolute left-0 right-0 top-7 hidden md:block"
            height="4"
            width="100%"
            preserveAspectRatio="none"
            viewBox="0 0 100 4"
            aria-hidden="true"
          >
            <motion.line
              x1="16"
              y1="2"
              x2="84"
              y2="2"
              stroke="url(#line)"
              strokeWidth="0.5"
              strokeDasharray="0 0"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
            <defs>
              <linearGradient id="line" x1="0" x2="100" y1="0" y2="0">
                <stop style={{ stopColor: 'var(--laton-profundo)' }} />
                <stop offset="0.5" style={{ stopColor: 'var(--laton-claro)' }} />
                <stop offset="1" style={{ stopColor: 'var(--laton-profundo)' }} />
              </linearGradient>
            </defs>
          </svg>

          <ol className="grid gap-5 md:grid-cols-3">
            {PASOS.map((p, i) => (
              <motion.li
                key={p.titulo}
                initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ ...spring, delay: i * 0.15 }}
                className="glass glass-edge relative flex flex-col items-center rounded-2xl p-7 text-center"
              >
                <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-laton text-primary-foreground shadow-[0_0_24px_-6px_rgb(var(--laton-rgb)/0.7)]">
                  <p.icono className="h-6 w-6" />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-card font-heading text-xs font-bold text-foreground ring-1 ring-[rgb(var(--laton-rgb)/0.4)]">
                    {i + 1}
                  </span>
                </span>
                <h3 className="mt-5 font-heading text-lg font-semibold text-marfil">
                  {p.titulo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-marfil-tenue">
                  {p.texto}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

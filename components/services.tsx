'use client'

import { motion } from 'framer-motion'
import { Scissors, Sparkles, Eye, PenTool, Clock } from 'lucide-react'
import type { Categoria } from '@/lib/mock-data'
import { SERVICIOS, formatoCOP } from '@/lib/mock-data'
import { AnimatedNumber } from '@/components/animated-number'
import { SectionHeading } from '@/components/section-heading'

const ICONOS: Record<Categoria, typeof Scissors> = {
  Cortes: Scissors,
  Barba: Sparkles,
  Cejas: Eye,
  Diseños: PenTool,
}

const spring = { type: 'spring' as const, stiffness: 280, damping: 30 }

export function Services() {
  return (
    <section id="servicios" className="relative px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="Servicios"
          title="Lo que hacemos"
          description="Precios claros, sin sorpresas. Elige uno o combínalos."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICIOS.map((s, i) => {
            const Icono = ICONOS[s.categoria]
            return (
              <motion.article
                key={s.id}
                initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ ...spring, delay: (i % 3) * 0.1 }}
                whileHover={{ y: -6 }}
                className="glass glass-edge shimmer-on-hover group flex flex-col rounded-2xl p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgb(var(--laton-rgb)/0.12)] text-laton-claro ring-1 ring-[rgb(var(--laton-rgb)/0.25)]">
                    <Icono className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wider text-marfil-tenue">
                    {s.categoria}
                  </span>
                </div>

                <h3 className="mt-5 font-heading text-xl font-semibold text-marfil">
                  {s.nombre}
                </h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-marfil-tenue">
                  {s.descripcion}
                </p>

                <div className="mt-6 flex items-end justify-between border-t border-border pt-4">
                  <span className="flex items-center gap-1.5 text-sm text-marfil-tenue">
                    <Clock className="h-4 w-4" />
                    {s.duracion} min
                  </span>
                  <AnimatedNumber
                    value={s.precio}
                    format={formatoCOP}
                    className="font-heading text-xl font-bold text-gradient-laton"
                  />
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

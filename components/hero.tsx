'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, Scissors } from 'lucide-react'
import { Logo } from '@/components/logo'
import { useBooking } from '@/components/booking/booking-context'

const spring = { type: 'spring' as const, stiffness: 280, damping: 30 }

const reveal = {
  hidden: { opacity: 0, y: 26, filter: 'blur(8px)' },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { ...spring, delay: 0.3 + i * 0.12 },
  }),
}

export function Hero() {
  const { abrir } = useBooking()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 120])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 pt-28 pb-20"
    >
      <motion.div
        style={{ y, opacity }}
        className="hero-copy relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        <motion.div
          custom={0}
          variants={reveal}
          initial="hidden"
          animate="show"
          className="hero-logo relative"
        >
          {/* Halo de spray tricolor tras el logo (Quinchía Street) */}
          <span className="deco-sunburst deco-only" aria-hidden="true" />
          {/* Foco de luz que respira (Clásico Oro) */}
          <span className="clasico-spotlight clasico-only" aria-hidden="true" />
          <span className="relative z-[1] block">
            <Logo size={96} />
            {/* Barrido dorado automático sobre el logo (Clásico Oro) */}
            <span className="clasico-sheen clasico-only" aria-hidden="true" />
          </span>
        </motion.div>

        {/* Línea dorada que se dibuja sola */}
        <motion.svg
          width="180"
          height="12"
          viewBox="0 0 180 12"
          className="hero-line my-7"
          aria-hidden="true"
        >
          <motion.path
            d="M2 6 C 50 1, 130 1, 178 6"
            fill="none"
            stroke="url(#g)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, delay: 0.6, ease: 'easeInOut' }}
          />
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="180" y2="0">
              <stop style={{ stopColor: 'var(--laton-profundo)' }} />
              <stop offset="0.5" style={{ stopColor: 'var(--laton-claro)' }} />
              <stop offset="1" style={{ stopColor: 'var(--laton-profundo)' }} />
            </linearGradient>
          </defs>
        </motion.svg>

        <motion.h1
          custom={1}
          variants={reveal}
          initial="hidden"
          animate="show"
          className="font-heading text-balance text-4xl font-bold leading-[1.05] tracking-tight text-marfil sm:text-6xl"
        >
          Tu estilo,
          <br />
          en buenas manos.
        </motion.h1>

        <motion.p
          custom={2}
          variants={reveal}
          initial="hidden"
          animate="show"
          className="vintage-flicker mt-3 font-script text-3xl text-laton-claro sm:text-4xl"
        >
          Don Antonio
        </motion.p>

        {/* Subrayado dibujado a mano que se traza solo (Vintage Drip) */}
        <span className="vintage-only mx-auto mt-1 w-[190px]" aria-hidden="true">
          <svg viewBox="0 0 190 12" className="vintage-underline w-full" fill="none">
            <path
              d="M4 7 C 40 2, 66 11, 96 6 S 160 2, 186 7"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <motion.p
          custom={3}
          variants={reveal}
          initial="hidden"
          animate="show"
          className="mt-5 max-w-md text-pretty text-base leading-relaxed text-marfil-tenue"
        >
          Barbería en Quinchía. Cortes, barba, cejas y diseños,
          con el oficio de siempre.
        </motion.p>

        <motion.div
          custom={4}
          variants={reveal}
          initial="hidden"
          animate="show"
          className="hero-cta mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <button
            onClick={abrir}
            className="shimmer-on-hover flex items-center gap-2 rounded-full bg-laton px-8 py-4 text-base font-semibold text-primary-foreground shadow-[0_0_40px_-8px_rgb(var(--laton-rgb)/0.6)] transition-transform hover:scale-[1.03] active:scale-[0.97]"
          >
            <Scissors className="h-5 w-5" />
            Reservar mi cita
          </button>
          <a
            href="#servicios"
            className="glass glass-edge flex items-center gap-2 rounded-full px-7 py-4 text-base font-medium text-marfil transition-transform hover:scale-[1.03]"
          >
            Ver servicios
            <ArrowRight className="h-4 w-4 text-laton-claro" />
          </a>
        </motion.div>
      </motion.div>
    </section>
  )
}

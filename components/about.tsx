'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

const spring = { type: 'spring' as const, stiffness: 280, damping: 30 }

export function About() {
  return (
    <section id="sobre" className="relative px-4 py-24">
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-80px' }}
          transition={spring}
          className="glass glass-edge relative overflow-hidden rounded-2xl p-1.5"
        >
          {/* Retrato real, teñido según el tema activo */}
          <div className="foto relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image
              src="/gallery/about-portrait.jpg"
              alt="Corte y barba en Don Antonio"
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-cover"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ ...spring, delay: 0.1 }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-laton-claro">
            La barbería
          </span>
          <p className="mt-4 font-script text-4xl text-marfil">Don Antonio</p>
          <h2 className="mt-2 font-heading text-2xl font-bold leading-snug text-marfil text-balance sm:text-3xl">
            Tu corte, sin apuros.
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-marfil-tenue">
            En Quinchía, cada corte se hace con calma. Nada de cortes en serie:
            te atendemos con tiempo, buena conversa y un resultado que se nota.
          </p>
          <p className="mt-4 text-pretty text-base leading-relaxed text-marfil-tenue">
            Cortes, barba, cejas y diseños. Sentate en la silla y salí
            sintiéndote como nuevo.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

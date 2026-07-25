'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { SectionHeading } from '@/components/section-heading'

const spring = { type: 'spring' as const, stiffness: 280, damping: 30 }

const TRABAJOS = [
  { src: '/gallery/cut-1.jpg', alt: 'Perfilado de barba y corte a tijera', span: 'sm:row-span-2' },
  { src: '/gallery/cut-2.jpg', alt: 'Degradado con toalla caliente', span: '' },
  { src: '/gallery/cut-3.jpg', alt: 'Corte a tijera sobre un fade', span: '' },
  { src: '/gallery/cut-5.jpg', alt: 'Barbero dando estilo a un cliente', span: 'sm:col-span-2' },
  { src: '/gallery/cut-4.jpg', alt: 'Corte con máquina, detalle del degradado', span: '' },
  { src: '/gallery/cut-6.jpg', alt: 'Retoque con máquina en la nuca', span: '' },
]

export function Gallery() {
  return (
    <section id="galeria" className="relative px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="Galería"
          title="Trabajos recientes"
          description="Un vistazo a lo que sale de la silla."
        />

        <div className="mt-12 grid grid-cols-2 gap-4 sm:auto-rows-[220px] sm:grid-cols-3">
          {TRABAJOS.map((t, i) => (
            <motion.div
              key={t.src}
              initial={{ opacity: 0, scale: 0.94, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ ...spring, delay: (i % 3) * 0.08 }}
              className={`glass glass-edge group relative overflow-hidden rounded-2xl p-1.5 ${t.span}`}
            >
              <div className="foto relative h-full min-h-[190px] w-full rounded-xl">
                <Image
                  src={t.src}
                  alt={t.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

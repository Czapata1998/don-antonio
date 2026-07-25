'use client'

import { motion } from 'framer-motion'

const spring = { type: 'spring' as const, stiffness: 280, damping: 30 }

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={spring}
      className="section-head mx-auto flex max-w-2xl flex-col items-center text-center"
    >
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-laton-claro">
        {eyebrow}
      </span>
      <span className="deco-divider deco-only" aria-hidden="true" />
      <span className="vintage-divider" aria-hidden="true" />
      <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-marfil text-balance sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-pretty text-base leading-relaxed text-marfil-tenue">
          {description}
        </p>
      )}
    </motion.div>
  )
}

'use client'

import { useEffect } from 'react'
import {
  animate,
  useInView,
  useMotionValue,
  useTransform,
  motion,
} from 'framer-motion'
import { useRef } from 'react'

/**
 * Contador animado (number ticker) que sube hasta `value`.
 * Si `trigger` es 'inView' anima al entrar en pantalla; si es 'always'
 * anima cada vez que cambia el valor (útil en el resumen vivo del flujo).
 */
export function AnimatedNumber({
  value,
  format,
  trigger = 'inView',
  className,
}: {
  value: number
  format: (n: number) => string
  trigger?: 'inView' | 'always'
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const mv = useMotionValue(0)
  const display = useTransform(mv, (v) => format(Math.round(v)))

  useEffect(() => {
    if (trigger === 'inView' && !inView) return
    const controls = animate(mv, value, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
    })
    return () => controls.stop()
  }, [value, inView, trigger, mv])

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  )
}

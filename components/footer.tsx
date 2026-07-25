'use client'

import { motion } from 'framer-motion'
import { MapPin, Clock, Phone } from 'lucide-react'
import { WhatsAppIcon } from '@/components/icons/whatsapp'
import { Logo } from '@/components/logo'
import { WHATSAPP } from '@/lib/mock-data'

const spring = { type: 'spring' as const, stiffness: 280, damping: 30 }

export function Footer() {
  return (
    <footer id="contacto" className="relative px-4 pb-28 pt-12 sm:pb-16">
      <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-60px' }}
        transition={spring}
        className="glass glass-edge mx-auto max-w-5xl rounded-2xl p-8 sm:p-10"
      >
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Logo size={48} withWordmark />
            <p className="mt-4 font-script text-2xl text-laton-claro">
              Don Antonio
            </p>
            <p className="mt-1 text-sm leading-relaxed text-marfil-tenue">
              Barbería en Quinchía. Tu estilo, en buenas manos.
            </p>
          </div>

          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3 text-marfil-tenue">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-laton-claro" />
              <span>Quinchía, Risaralda, Colombia</span>
            </li>
            <li className="flex items-start gap-3 text-marfil-tenue">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-laton-claro" />
              <span>Lun a Sáb · 9:00 a 18:00</span>
            </li>
            <li className="flex items-start gap-3 text-marfil-tenue">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-laton-claro" />
              <span>+57 300 000 0000</span>
            </li>
          </ul>

          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-marfil-tenue">
              ¿Dudas? Escríbenos directo.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noreferrer"
              className="glass glass-edge flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-[var(--wa)] transition-transform hover:scale-[1.03]"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Escribir por WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-marfil-tenue sm:flex-row">
          <span>© {new Date().getFullYear()} Don Antonio · Quinchía</span>
          <span className="font-script text-base text-laton-claro">
            Hecho con oficio
          </span>
        </div>
      </motion.div>
    </footer>
  )
}

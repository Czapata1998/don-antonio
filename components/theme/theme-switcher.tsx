'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Palette, X } from 'lucide-react'
import { useTheme } from '@/components/theme/theme-context'

const spring = { type: 'spring' as const, stiffness: 320, damping: 32 }

export function ThemeSwitcher() {
  const { tema, setTema, temas } = useTheme()
  const [abierto, setAbierto] = useState(false)

  // Cerrar con Escape
  useEffect(() => {
    if (!abierto) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [abierto])

  return (
    <>
      {/* Pestaña lateral persistente */}
      <motion.button
        type="button"
        onClick={() => setAbierto(true)}
        style={{ position: 'fixed', left: 0, top: '50%', y: '-50%' }}
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ ...spring, delay: 0.6 }}
        aria-label="Cambiar tema visual"
        aria-expanded={abierto}
        className="glass glass-edge z-[60] flex flex-col items-center gap-2 rounded-r-2xl border-l-0 py-4 pl-2.5 pr-3 text-laton-claro shadow-lg"
      >
        <Palette className="h-5 w-5" />
        <span
          className="font-heading text-[11px] font-bold uppercase tracking-[0.25em]"
          style={{ writingMode: 'vertical-rl' }}
        >
          Tema
        </span>
      </motion.button>

      <AnimatePresence>
        {abierto && (
          <>
            {/* Telón */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setAbierto(false)}
              className="fixed inset-0 z-[70] bg-negro-base/70 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.aside
              initial={{ x: '-105%' }}
              animate={{ x: 0 }}
              exit={{ x: '-105%' }}
              transition={spring}
              role="dialog"
              aria-modal="true"
              aria-label="Selector de tema"
              style={{ background: 'var(--card)', position: 'fixed', top: 0, bottom: 0, left: 0 }}
              className="glass-edge z-[80] flex w-[88vw] max-w-sm flex-col rounded-r-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between gap-3 border-b border-border p-5">
                <div>
                  <p className="font-heading text-lg font-bold text-marfil">
                    Temas
                  </p>
                  <p className="text-xs text-marfil-tenue">
                    Prueba el estilo y quédate con tu favorito.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  aria-label="Cerrar"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-marfil transition-colors hover:bg-[rgb(var(--marfil-rgb)/0.08)]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {temas.map((t) => {
                  const activo = t.id === tema
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTema(t.id)}
                      aria-pressed={activo}
                      className={`group relative flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all ${
                        activo
                          ? 'bg-[rgb(var(--laton-rgb)/0.12)] ring-2 ring-laton'
                          : 'glass glass-edge hover:scale-[1.01]'
                      }`}
                    >
                      {/* Muestras de color */}
                      <span className="flex shrink-0 items-center">
                        {t.swatch.map((c, i) => (
                          <span
                            key={c + i}
                            className="h-10 w-7 rounded-md ring-1 ring-black/10 first:rounded-l-xl last:rounded-r-xl"
                            style={{
                              background: c,
                              marginLeft: i === 0 ? 0 : -8,
                              zIndex: 3 - i,
                            }}
                          />
                        ))}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="font-heading font-semibold text-marfil">
                            {t.nombre}
                          </span>
                          <span className="rounded-full bg-[rgb(var(--marfil-rgb)/0.08)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-marfil-tenue">
                            {t.modo}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-marfil-tenue">
                          {t.tagline}
                        </span>
                      </span>

                      <AnimatePresence>
                        {activo && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={spring}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-laton text-primary-foreground"
                          >
                            <Check className="h-4 w-4" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  )
                })}

                <p className="px-1 pt-2 text-[11px] leading-relaxed text-marfil-tenue">
                  Más prototipos en camino. Tu elección se guarda en este
                  navegador.
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

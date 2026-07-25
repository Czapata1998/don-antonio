'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  Check,
  Clock,
  Loader2,
  X,
  Scissors,
} from 'lucide-react'
import { WhatsAppIcon } from '@/components/icons/whatsapp'
import {
  SERVICIOS,
  DIAS,
  formatoCOP,
  WHATSAPP,
  type Servicio,
  type Slot,
  type DiaDisponible,
} from '@/lib/mock-data'
import { enviarReserva } from '@/app/actions/reservar'
import {
  getServiciosPublicos,
  getSlotsPublicos,
  getDiasPublicos,
} from '@/app/actions/disponibilidad'
import { AnimatedNumber } from '@/components/animated-number'
import { FloatingInput } from '@/components/booking/floating-input'
import { useBooking } from '@/components/booking/booking-context'

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const spring = { type: 'spring' as const, stiffness: 280, damping: 30 }

type Paso = 1 | 2 | 3 | 'ok'

export function BookingFlow() {
  const { abierto, cerrar } = useBooking()
  const [paso, setPaso] = useState<Paso>(1)
  const [seleccion, setSeleccion] = useState<string[]>([])
  const [diaId, setDiaId] = useState<string>(DIAS[0].id)
  const [hora, setHora] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [celular, setCelular] = useState('')
  const [email, setEmail] = useState('')
  const [cargando, setCargando] = useState(false)
  const [codigo, setCodigo] = useState<string | null>(null)
  const [enviado, setEnviado] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null)
  const [direccion, setDireccion] = useState(1) // dirección de la transición
  const [catalogo, setCatalogo] = useState<Servicio[]>(SERVICIOS)
  const [dias, setDias] = useState<DiaDisponible[]>(DIAS)
  const [slots, setSlots] = useState<Slot[]>([])
  const [cargandoSlots, setCargandoSlots] = useState(false)

  const servicios = useMemo(
    () => catalogo.filter((s) => seleccion.includes(s.id)),
    [catalogo, seleccion],
  )
  const total = servicios.reduce((a, s) => a + s.precio, 0)
  const duracionTotal = servicios.reduce((a, s) => a + s.duracion, 0)
  const dia = dias.find((d) => d.id === diaId) ?? dias[0]

  // Catálogo + días reales desde la BD al abrir (reflejan el panel/jornada).
  useEffect(() => {
    if (!abierto) return
    let cancelado = false
    getServiciosPublicos()
      .then((s) => {
        if (!cancelado && s.length) setCatalogo(s)
      })
      .catch(() => {})
    getDiasPublicos()
      .then((d) => {
        if (!cancelado && d.length) setDias(d)
      })
      .catch(() => {})
    return () => {
      cancelado = true
    }
  }, [abierto])

  // Horarios del día: solo se ofrecen inicios donde el servicio elegido cabe
  // completo (según su duración total y el cierre configurado).
  useEffect(() => {
    if (!abierto) return
    let cancelado = false
    setCargandoSlots(true)
    setSlots([])
    getSlotsPublicos(dia.fecha, duracionTotal)
      .then((s) => {
        if (!cancelado) setSlots(s)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelado) setCargandoSlots(false)
      })
    return () => {
      cancelado = true
    }
  }, [abierto, dia.fecha, duracionTotal])

  const reset = () => {
    setPaso(1)
    setSeleccion([])
    setDiaId(DIAS[0].id)
    setHora(null)
    setNombre('')
    setCelular('')
    setEmail('')
    setCargando(false)
    setCodigo(null)
    setEnviado(false)
    setErrorEnvio(null)
  }

  const cerrarTodo = () => {
    cerrar()
    setTimeout(reset, 350)
  }

  const avanzar = () => {
    setDireccion(1)
    setPaso((p) => (p === 1 ? 2 : p === 2 ? 3 : p))
  }
  const retroceder = () => {
    setDireccion(-1)
    setPaso((p) => (p === 3 ? 2 : p === 2 ? 1 : p))
  }

  const confirmar = async () => {
    if (!hora) return
    setCargando(true)
    setErrorEnvio(null)
    try {
      const res = await enviarReserva({
        servicios,
        diaId,
        hora,
        datos: { nombre, celular, email },
      })
      if (res.ok && res.codigo) {
        setCodigo(res.codigo)
        setEnviado(!!res.enviado)
        if (res.error) setErrorEnvio(res.error)
        setDireccion(1)
        setPaso('ok')
      } else {
        setErrorEnvio(res.error || 'No pudimos completar la reserva.')
      }
    } catch {
      setErrorEnvio('Hubo un problema de conexión. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  const puedeAvanzar =
    (paso === 1 && seleccion.length > 0) ||
    (paso === 2 && hora !== null) ||
    (paso === 3 &&
      nombre.trim().length > 1 &&
      celular.trim().length >= 7 &&
      RE_EMAIL.test(email.trim()))

  const pasoNum = paso === 'ok' ? 3 : paso
  const progreso = paso === 'ok' ? 100 : (pasoNum / 3) * 100

  const toggleServicio = (id: string) =>
    setSeleccion((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    )

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
      scale: 0.97,
    }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
      scale: 0.97,
    }),
  }

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex justify-center overflow-y-auto bg-negro-base/80 px-4 py-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Reservar cita"
        >
          <motion.div
            initial={{ y: 40, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 30, scale: 0.98, opacity: 0 }}
            transition={spring}
            className="glass glass-edge relative my-auto flex w-full max-w-lg flex-col rounded-2xl"
          >
            {/* Barra superior: progreso + cerrar */}
            <div className="flex items-center gap-3 p-5 pb-3">
              {paso !== 1 && paso !== 'ok' ? (
                <button
                  onClick={retroceder}
                  aria-label="Atrás"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-marfil transition-colors hover:bg-[rgb(var(--marfil-rgb)/0.08)]"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              ) : (
                <span className="h-9 w-9" />
              )}

              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[rgb(var(--marfil-rgb)/0.1)]">
                <motion.div
                  className="h-full rounded-full bg-laton"
                  animate={{ width: `${progreso}%` }}
                  transition={spring}
                />
              </div>

              <button
                onClick={cerrarTodo}
                aria-label="Cerrar"
                className="flex h-9 w-9 items-center justify-center rounded-full text-marfil transition-colors hover:bg-[rgb(var(--marfil-rgb)/0.08)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative overflow-hidden px-5 pb-5">
              <AnimatePresence mode="wait" custom={direccion}>
                {/* PASO 1 — Servicios */}
                {paso === 1 && (
                  <motion.div
                    key="p1"
                    custom={direccion}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={spring}
                  >
                    <h2 className="font-heading text-xl font-bold text-marfil">
                      ¿Qué te hacemos hoy?
                    </h2>
                    <p className="mt-1 text-sm text-marfil-tenue">
                      Elige uno o varios. Puedes combinar.
                    </p>

                    <div className="mt-5 space-y-2.5">
                      {catalogo.map((s) => {
                        const activo = seleccion.includes(s.id)
                        return (
                          <ServicioRow
                            key={s.id}
                            servicio={s}
                            activo={activo}
                            onToggle={() => toggleServicio(s.id)}
                          />
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* PASO 2 — Día y hora */}
                {paso === 2 && (
                  <motion.div
                    key="p2"
                    custom={direccion}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={spring}
                  >
                    <h2 className="font-heading text-xl font-bold text-marfil">
                      Elige día y hora
                    </h2>

                    <div className="no-scrollbar -mx-1 mt-4 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
                      {dias.map((d) => {
                        const activo = d.id === diaId
                        return (
                          <button
                            key={d.id}
                            onClick={() => {
                              setDiaId(d.id)
                              setHora(null)
                            }}
                            className={`relative flex shrink-0 snap-start flex-col items-center rounded-xl px-4 py-3 transition-colors ${
                              activo
                                ? 'bg-laton text-primary-foreground'
                                : 'glass glass-edge text-marfil'
                            }`}
                          >
                            <span className="text-[11px] font-medium uppercase tracking-wide opacity-80">
                              {d.etiqueta}
                            </span>
                            <span className="font-heading text-lg font-bold">
                              {d.numero}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    <div className="mt-5 grid grid-cols-4 gap-2">
                      {cargandoSlots &&
                        Array.from({ length: 12 }).map((_, i) => (
                          <div
                            key={`sk-${i}`}
                            className="h-[42px] animate-pulse rounded-lg bg-[rgb(var(--marfil-rgb)/0.06)]"
                          />
                        ))}
                      {!cargandoSlots &&
                        slots.every((s) => s.ocupado) &&
                        slots.length > 0 && (
                          <p className="col-span-4 py-3 text-center text-sm text-marfil-tenue">
                            No quedan horarios libres este día. Prueba otro.
                          </p>
                        )}
                      {!cargandoSlots &&
                        slots.map((slot, i) => {
                        const activo = hora === slot.hora
                        return (
                          <motion.button
                            key={slot.hora}
                            disabled={slot.ocupado}
                            onClick={() => setHora(slot.hora)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(i * 0.012, 0.3) }}
                            className={`relative rounded-lg py-2.5 text-sm font-medium transition-colors ${
                              slot.ocupado
                                ? 'cursor-not-allowed bg-[rgb(var(--marfil-rgb)/0.04)] text-marfil-tenue/40 line-through'
                                : activo
                                  ? 'text-primary-foreground'
                                  : 'glass glass-edge text-marfil hover:text-laton-claro'
                            }`}
                          >
                            {activo && (
                              <motion.span
                                layoutId="slot-activo"
                                transition={spring}
                                className="absolute inset-0 rounded-lg bg-laton shadow-[0_0_18px_-4px_rgb(var(--laton-rgb)/0.8)]"
                              />
                            )}
                            <span className="relative z-10">{slot.hora}</span>
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* PASO 3 — Datos */}
                {paso === 3 && (
                  <motion.div
                    key="p3"
                    custom={direccion}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={spring}
                  >
                    <h2 className="font-heading text-xl font-bold text-marfil">
                      Casi listo
                    </h2>
                    <p className="mt-1 text-sm text-marfil-tenue">
                      Solo necesitamos saber cómo llamarte.
                    </p>

                    <div className="mt-5 space-y-3">
                      <FloatingInput
                        label="Tu nombre"
                        value={nombre}
                        onChange={setNombre}
                        autoComplete="name"
                      />
                      <FloatingInput
                        label="Celular"
                        value={celular}
                        onChange={setCelular}
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                      />
                      <FloatingInput
                        label="Correo electrónico"
                        value={email}
                        onChange={setEmail}
                        type="email"
                        autoComplete="email"
                      />
                    </div>
                    <p className="mt-2 px-1 text-xs text-marfil-tenue">
                      Te enviamos la confirmación a tu correo. Sergio también
                      recibe el aviso.
                    </p>

                    <div className="glass glass-edge mt-5 rounded-xl p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-laton-claro">
                        Tu reserva
                      </p>
                      <ul className="mt-3 space-y-1.5 text-sm text-marfil">
                        {servicios.map((s) => (
                          <li key={s.id} className="flex justify-between gap-3">
                            <span>{s.nombre}</span>
                            <span className="text-marfil-tenue">
                              {formatoCOP(s.precio)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm">
                        <span className="text-marfil-tenue">
                          {dia.etiqueta} {dia.numero} · {hora} · {duracionTotal}{' '}
                          min
                        </span>
                        <span className="font-heading font-bold text-gradient-laton">
                          {formatoCOP(total)}
                        </span>
                      </div>
                    </div>

                    {errorEnvio && (
                      <p
                        role="alert"
                        className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                      >
                        {errorEnvio}
                      </p>
                    )}
                  </motion.div>
                )}

                {/* CONFIRMACIÓN */}
                {paso === 'ok' && (
                  <motion.div
                    key="ok"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={spring}
                    className="flex flex-col items-center py-4 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.12, 1] }}
                      transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut', times: [0, 0.7, 1] }}
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-[rgb(var(--laton-rgb)/0.14)] ring-1 ring-[rgb(var(--laton-rgb)/0.4)]"
                    >
                      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
                        <motion.path
                          d="M10 21 L17 28 L30 13"
                          fill="none"
                          style={{ stroke: 'var(--laton-claro)' }}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, delay: 0.35, ease: 'easeInOut' }}
                        />
                      </svg>
                    </motion.div>

                    <h2 className="mt-5 font-heading text-2xl font-bold text-marfil">
                      ¡Reserva confirmada!
                    </h2>
                    <p className="mt-1 text-sm text-marfil-tenue">
                      Te esperamos, {nombre.split(' ')[0] || 'crack'}.
                    </p>
                    {enviado ? (
                      <p className="mt-2 text-sm text-laton-claro">
                        ✉️ Enviamos la confirmación a{' '}
                        <span className="font-medium">{email}</span>.
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-marfil-tenue">
                        Guarda tu código por si acaso.
                      </p>
                    )}

                    {/* Ticket de vidrio */}
                    <div className="glass glass-edge mt-6 w-full rounded-xl p-5 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-script text-2xl text-laton-claro">
                          Don Antonio
                        </span>
                        <span className="rounded-full bg-[rgb(var(--laton-rgb)/0.14)] px-3 py-1 font-heading text-xs font-bold text-laton-claro">
                          {codigo}
                        </span>
                      </div>
                      <ul className="mt-4 space-y-1.5 text-sm text-marfil">
                        {servicios.map((s) => (
                          <li key={s.id} className="flex justify-between gap-3">
                            <span>{s.nombre}</span>
                            <span className="text-marfil-tenue">
                              {formatoCOP(s.precio)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                        <span className="flex items-center gap-1.5 text-sm text-marfil-tenue">
                          <Clock className="h-4 w-4" />
                          {dia.etiqueta} {dia.numero} · {hora}
                        </span>
                        <span className="font-heading text-lg font-bold text-gradient-laton">
                          {formatoCOP(total)}
                        </span>
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                        `Hola, soy ${nombre}. Confirmo mi cita ${codigo} para ${dia.etiqueta} ${dia.numero} a las ${hora}.`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-laton px-6 py-3.5 font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.97]"
                    >
                      <WhatsAppIcon className="h-5 w-5" />
                      Avísame por WhatsApp
                    </a>
                    <button
                      onClick={cerrarTodo}
                      className="mt-2 py-2 text-sm text-marfil-tenue transition-colors hover:text-marfil"
                    >
                      Listo, cerrar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pie: resumen vivo + acción */}
            {paso !== 'ok' && (
              <div className="glass glass-edge sticky bottom-0 flex items-center justify-between gap-4 rounded-b-2xl p-4">
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-marfil-tenue">
                    {duracionTotal > 0 ? `${duracionTotal} min` : 'Sin elegir'}
                  </span>
                  <AnimatedNumber
                    value={total}
                    format={formatoCOP}
                    trigger="always"
                    className="font-heading text-xl font-bold text-gradient-laton"
                  />
                </div>

                {paso === 3 ? (
                  <button
                    onClick={confirmar}
                    disabled={!puedeAvanzar || cargando}
                    className="shimmer-on-hover flex min-w-[170px] items-center justify-center gap-2 rounded-full bg-laton px-6 py-3.5 font-semibold text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                  >
                    {cargando ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Scissors className="h-5 w-5" />
                        Confirmar reserva
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={avanzar}
                    disabled={!puedeAvanzar}
                    className="flex min-w-[140px] items-center justify-center gap-2 rounded-full bg-laton px-6 py-3.5 font-semibold text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                  >
                    Continuar
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ServicioRow({
  servicio,
  activo,
  onToggle,
}: {
  servicio: Servicio
  activo: boolean
  onToggle: () => void
}) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.98 }}
      className={`flex w-full items-center gap-3 rounded-xl p-3.5 text-left transition-colors ${
        activo
          ? 'bg-[rgb(var(--laton-rgb)/0.12)] ring-1 ring-laton'
          : 'glass glass-edge'
      }`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
          activo
            ? 'border-laton bg-laton text-primary-foreground'
            : 'border-[rgb(var(--marfil-rgb)/0.25)]'
        }`}
      >
        <AnimatePresence>
          {activo && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={spring}
            >
              <Check className="h-4 w-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      <span className="flex-1">
        <span className="block font-medium text-marfil">{servicio.nombre}</span>
        <span className="block text-xs text-marfil-tenue">
          {servicio.duracion} min · {servicio.categoria}
        </span>
      </span>

      <span className="font-heading font-bold text-laton-claro">
        {formatoCOP(servicio.precio)}
      </span>
    </motion.button>
  )
}

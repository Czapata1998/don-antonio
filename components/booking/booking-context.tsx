'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

interface BookingContextValue {
  abierto: boolean
  abrir: () => void
  cerrar: () => void
}

const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [abierto, setAbierto] = useState(false)

  const abrir = useCallback(() => setAbierto(true), [])
  const cerrar = useCallback(() => setAbierto(false), [])

  const value = useMemo(
    () => ({ abierto, abrir, cerrar }),
    [abierto, abrir, cerrar],
  )

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  )
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking debe usarse dentro de BookingProvider')
  return ctx
}

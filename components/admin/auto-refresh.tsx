'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Refresca los datos del panel cada `seconds` segundos (server components
 * dinámicos), para que las nuevas reservas del sitio aparezcan casi en
 * tiempo real sin que el barbero tenga que recargar.
 */
export function AutoRefresh({ seconds = 25 }: { seconds?: number }) {
  const router = useRouter()
  useEffect(() => {
    const id = setInterval(() => router.refresh(), seconds * 1000)
    const onFocus = () => router.refresh()
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(id)
      window.removeEventListener('focus', onFocus)
    }
  }, [router, seconds])
  return null
}

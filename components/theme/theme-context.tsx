'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  DEFAULT_THEME,
  STORAGE_KEY,
  THEMES,
  applyThemeAttr,
  themeById,
  type ThemeId,
} from '@/lib/themes'

interface ThemeContextValue {
  tema: ThemeId
  setTema: (id: ThemeId) => void
  temas: typeof THEMES
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Estado inicial = lo que el script anti-flash ya escribió en <html>,
  // así el primer render del cliente coincide con lo pintado.
  const [tema, setTemaState] = useState<ThemeId>(DEFAULT_THEME)

  useEffect(() => {
    let inicial: ThemeId = DEFAULT_THEME
    try {
      const guardado = localStorage.getItem(STORAGE_KEY)
      if (guardado) inicial = themeById(guardado).id
    } catch {
      /* localStorage no disponible */
    }
    setTemaState(inicial)
    applyThemeAttr(themeById(inicial).attr)
  }, [])

  const setTema = useCallback((id: ThemeId) => {
    const meta = themeById(id)
    setTemaState(meta.id)
    applyThemeAttr(meta.attr)
    try {
      localStorage.setItem(STORAGE_KEY, meta.id)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({ tema, setTema, temas: THEMES }),
    [tema, setTema],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider')
  return ctx
}

/**
 * Registro de temas del sitio.
 *
 * Cada tema es solo metadata + un `id` que se escribe en
 * `document.documentElement.dataset.theme`. Toda la pintura ocurre en
 * `app/globals.css` bajo `:root` (tema por defecto) y los selectores
 * `[data-theme='...']`. Para añadir un prototipo nuevo basta con:
 *   1. Añadir su bloque de variables en globals.css
 *   2. Añadir una entrada aquí
 * Los componentes no se tocan.
 */

export type ThemeId = 'clasico' | 'vintage-drip' | 'neon-nocturno' | 'street'

export interface ThemeMeta {
  id: ThemeId
  /** `data-theme` a escribir; `null` = usar `:root` (sin atributo) */
  attr: string | null
  nombre: string
  /** Frase corta que vende el carácter del tema */
  tagline: string
  /** Tres muestras de color [fondo, superficie, acento] */
  swatch: [string, string, string]
  /** Apariencia base para hints de UI */
  modo: 'oscuro' | 'claro'
}

export const THEMES: ThemeMeta[] = [
  {
    id: 'clasico',
    attr: 'clasico',
    nombre: 'Clásico Oro',
    tagline: 'Negro carbón y latón. Elegante, nocturno, atemporal.',
    swatch: ['#0f0f0f', '#1a1814', '#c9a24b'],
    modo: 'oscuro',
  },
  {
    id: 'vintage-drip',
    attr: 'vintage-drip',
    nombre: 'Vintage Drip',
    tagline: 'Papel beige y mocca con actitud de calle. Old school, joven.',
    swatch: ['#e9dcc2', '#f4ead2', '#b5632a'],
    modo: 'claro',
  },
  {
    id: 'neon-nocturno',
    attr: 'neon-nocturno',
    nombre: 'Neón Nocturno',
    tagline: 'Azabache azulado y cian eléctrico. Urbano, moderno, con flow.',
    swatch: ['#0b0f14', '#141b24', '#22d3ee'],
    modo: 'oscuro',
  },
  {
    id: 'street',
    attr: 'street',
    nombre: 'Quinchía Street',
    tagline: 'Concreto y grafiti con los colores de Quinchía: oro, sangre y monte. Urbano, joven, con barrio.',
    swatch: ['#f5c518', '#e5402f', '#2fae5f'],
    modo: 'oscuro',
  },
]

export const DEFAULT_THEME: ThemeId = 'clasico'
export const STORAGE_KEY = 'da-theme'

export function themeById(id: string | null | undefined): ThemeMeta {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}

/** Aplica el tema al <html>. Compartido por el provider y el script anti-flash. */
export function applyThemeAttr(attr: string | null) {
  const el = document.documentElement
  if (attr) el.setAttribute('data-theme', attr)
  else el.removeAttribute('data-theme')
}

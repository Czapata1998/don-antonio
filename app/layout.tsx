import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import {
  Inter,
  Sora,
  Sacramento,
  Yellowtail,
  Bebas_Neue,
  Permanent_Marker,
} from 'next/font/google'
import { DEFAULT_THEME, STORAGE_KEY, THEMES } from '@/lib/themes'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})
const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})
const sacramento = Sacramento({
  variable: '--font-sacramento',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
})
// Script de rótulo vintage (1950s) — usado por el tema "Vintage Drip"
const yellowtail = Yellowtail({
  variable: '--font-script-vintage',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
})
// Condensada de póster callejero — titulares del tema "Quinchía Street"
const bebas = Bebas_Neue({
  variable: '--font-street',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
})
// Rotulador de grafiti — wordmark "Don Antonio" en "Quinchía Street"
const permanentMarker = Permanent_Marker({
  variable: '--font-marker',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Don Antonio · Barbería en Quinchía',
  description:
    'Reserva tu cita en segundos. Cortes, barba, cejas y diseños en Quinchía, Risaralda. Tu estilo, en buenas manos.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: true,
}

// Aplica el tema guardado antes del primer paint (evita parpadeo)
const noFlashScript = `(function(){try{var k=${JSON.stringify(
  STORAGE_KEY,
)};var d=${JSON.stringify(
  DEFAULT_THEME,
)};var ids=${JSON.stringify(
  THEMES.map((t) => t.id),
)};var attrs=${JSON.stringify(
  Object.fromEntries(THEMES.map((t) => [t.id, t.attr])),
)};var s=localStorage.getItem(k);var id=ids.indexOf(s)>-1?s:d;var a=attrs[id];if(a){document.documentElement.setAttribute('data-theme',a);}else{document.documentElement.removeAttribute('data-theme');}}catch(e){}})();`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${inter.variable} ${sora.variable} ${sacramento.variable} ${yellowtail.variable} ${bebas.variable} ${permanentMarker.variable} bg-background`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

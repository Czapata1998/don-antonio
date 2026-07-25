'use client'

/**
 * Fondo "aurora" oscuro: manchas de latón muy tenue que se mueven
 * lentamente sobre el negro, simulando luz dorada filtrándose.
 * Se respeta prefers-reduced-motion vía la regla global en globals.css.
 */
export function AuroraBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      <div
        className="animate-aurora absolute -left-1/4 top-[-10%] h-[60vh] w-[60vh] rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--laton-profundo-rgb)/0.22), transparent 70%)' }}
      />
      <div
        className="animate-aurora absolute right-[-15%] top-[20%] h-[55vh] w-[55vh] rounded-full blur-[110px]"
        style={{
          background: 'radial-gradient(circle, rgb(var(--laton-rgb)/0.15), transparent 70%)',
          animationDelay: '-8s',
        }}
      />
      <div
        className="animate-aurora absolute bottom-[-15%] left-[25%] h-[50vh] w-[50vh] rounded-full blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgb(var(--laton-profundo-rgb)/0.18), transparent 70%)',
          animationDelay: '-16s',
        }}
      />
    </div>
  )
}

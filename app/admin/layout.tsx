import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Panel · Don Antonio',
  robots: { index: false, follow: false },
}

// Envoltura del panel: fija la paleta Clásico Oro (independiente del
// tema público) y el fondo. La protección va en (panel)/layout.tsx.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="admin-root min-h-screen font-sans">{children}</div>
}

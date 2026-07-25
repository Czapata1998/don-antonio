import { requireAdmin } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/sidebar'

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar />
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  )
}

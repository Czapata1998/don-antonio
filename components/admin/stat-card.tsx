import type { LucideIcon } from 'lucide-react'

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string
  value: string
  icon: LucideIcon
  hint?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-marfil-tenue">
          {label}
        </span>
        <Icon className="h-4 w-4 text-laton-claro" />
      </div>
      <p className="mt-2 font-heading text-2xl font-bold text-marfil">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-marfil-tenue">{hint}</p>}
    </div>
  )
}

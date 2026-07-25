import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * Slot del logo real (monograma DA sobre negro).
 * Reemplazable fácilmente: solo cambia el src del Image o el componente entero.
 */
export function Logo({
  className,
  size = 40,
  withWordmark = false,
}: {
  className?: string
  size?: number
  withWordmark?: boolean
}) {
  return (
    <span className={cn('flex items-center gap-3', className)}>
      <span
        className="relative shrink-0 overflow-hidden rounded-full ring-1 ring-[rgb(var(--marfil-rgb)/0.15)]"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo-don-antonio.jpg"
          alt="Logo Don Antonio Barbería"
          fill
          sizes="64px"
          className="object-cover"
          priority
        />
      </span>
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-heading text-sm font-bold tracking-[0.18em] text-marfil">
            DON ANTONIO
          </span>
          <span className="font-script text-laton-claro text-base leading-tight">
            Barbería
          </span>
        </span>
      )}
    </span>
  )
}

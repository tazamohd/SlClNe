import { cn } from '@/lib/cn'

export function Avatar({
  name,
  size = 32,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  const initial = (name.trim()[0] ?? '?').toUpperCase()
  return (
    <span
      style={{ width: size, height: size, fontSize: Math.round(size * 0.35) }}
      className={cn(
        'flex flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient font-bold text-white',
        className,
      )}
    >
      {initial}
    </span>
  )
}

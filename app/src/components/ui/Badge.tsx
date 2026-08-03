import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { PR_BADGE, ST_BADGE, SVC_BADGE, type BadgePalette } from '@/data/generated/badges'

/** Status pill.
 *
 *  Colours come from the design's palette tables rather than a tone enum,
 *  because the mapping (`in_progress` → blue, `pending` → orange) is data the
 *  backend will eventually own. Only blue, orange, navy and slate appear —
 *  green/red/yellow are forbidden brand-wide (README §7). */
export function Badge({
  children,
  background,
  color,
  className,
  strong,
}: {
  children: ReactNode
  background: string
  color: string
  className?: string
  /** Priority pills use a solid fill and heavier weight. */
  strong?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs capitalize',
        strong ? 'font-semibold' : 'font-medium',
        className
      )}
      style={{ background, color }}
    >
      {children}
    </span>
  )
}

const FALLBACK = ['rgba(100,116,139,.1)', '#64748B'] as const

function lookup(palette: BadgePalette, key: string) {
  return palette[key] ?? FALLBACK
}

/** Service-type pill (maintenance, repair, diagnostic…). */
export function ServiceBadge({ value, label }: { value: string; label?: string }) {
  const [bg, fg] = lookup(SVC_BADGE, value)
  return (
    <Badge background={bg} color={fg}>
      {label ?? value.replace(/_/g, ' ')}
    </Badge>
  )
}

/** Job-status pill (pending, in_progress, completed…). */
export function StatusBadge({ value, label }: { value: string; label?: string }) {
  const [bg, fg] = lookup(ST_BADGE, value)
  return (
    <Badge background={bg} color={fg}>
      {label ?? value.replace(/_/g, ' ')}
    </Badge>
  )
}

/** Priority pill — solid fill, white text. */
export function PriorityBadge({ value, label }: { value: string; label?: string }) {
  const [bg] = lookup(PR_BADGE, value)
  return (
    <Badge background={bg} color="#fff" strong>
      {label ?? value}
    </Badge>
  )
}

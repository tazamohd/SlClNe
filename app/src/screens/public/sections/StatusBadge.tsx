import { useT } from '@/providers/PreferencesProvider'
import { cn } from '@/lib/cn'

/** The one status vocabulary shared by Security & Data and Integrations —
 *  so "what's real today" reads the same way on both pages. Brand palette
 *  only (blue/bright/orange/navy, no red/green — README §7): status is
 *  carried by the label text, not colour alone, so it never depends on colour
 *  perception. */
export type StatusKind = 'live' | 'testing' | 'planned' | 'custom' | 'relationship' | 'enterprise'

const STATUS_LABEL: Record<StatusKind, string> = {
  live: 'Live',
  testing: 'In testing',
  planned: 'Planned',
  custom: 'Custom',
  relationship: 'Ecosystem relationship',
  enterprise: 'Enterprise option',
}

const STATUS_CLASS: Record<StatusKind, string> = {
  live: 'border-salis-blue/60 text-salis-blue bg-salis-blue/[.06]',
  testing: 'border-salis-bright/60 text-salis-bright bg-salis-bright/[.08]',
  planned: 'border-default text-muted bg-surface',
  custom: 'border-salis-orange/60 text-salis-orange bg-salis-orange/[.06]',
  relationship:
    'border-salis-navy/50 text-salis-navy bg-salis-navy/[.05] dark:border-salis-bright/40 dark:text-salis-bright',
  enterprise: 'border-salis-orange/60 text-salis-orange bg-salis-orange/[.06]',
}

export function StatusBadge({ status }: { status: StatusKind }) {
  const t = useT()
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide',
        STATUS_CLASS[status]
      )}
    >
      {t(STATUS_LABEL[status])}
    </span>
  )
}

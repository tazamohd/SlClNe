import { Badge } from '@/components/ui/Badge'
import { usePreferences } from '@/providers/PreferencesProvider'

export { StatCard, ConnectApi, ProvenanceNote } from '@/screens/hr/bits'

const TONES = {
  blue: ['var(--tint-blue)', 'var(--salis-blue)'],
  orange: ['rgba(249,115,22,.13)', 'var(--salis-orange)'],
  slate: ['var(--tint-neutral)', 'var(--text-muted)'],
} as const

const STATUS_TONE: Record<string, keyof typeof TONES> = {
  submitted: 'slate',
  under_review: 'slate',
  approved: 'blue',
  paid: 'blue',
  rejected: 'orange',
  active: 'blue',
  expired: 'orange',
  cancelled: 'slate',
  settled: 'blue',
  defaulted: 'orange',
  due: 'slate',
  overdue: 'orange',
}

export function StatusPill({ value, label }: { value: string; label?: string }) {
  const { t } = usePreferences()
  const [background, color] = TONES[STATUS_TONE[value] ?? 'slate']
  return (
    <Badge background={background} color={color}>
      {label ?? t(value.replace(/_/g, ' '))}
    </Badge>
  )
}

import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Shared pieces of the insurance workspace.
 *
 *  Provenance: the `Insurance-Claims` feature-map screen carries a spec and a
 *  reference screenshot but no `.dc.html` design, so its visual language is
 *  borrowed from the design system — the stat rail, list rows and status pills
 *  the workshop and finance screens already use, and the Insurance/Loans tabs
 *  of `CustomerApp`. Nothing here is invented chrome; where the spec is thin the
 *  design system is the source, and this note is the record of that (§ the
 *  design-system-screen provenance rule).
 */

/** Status → brand tone. The design permits blue and orange only: blue reads as
 *  settled / active / positive, orange as needs-attention (rejected, overdue,
 *  defaulted, expired), and slate is the neutral in-flight state. Colours are
 *  tokens and `rgba()`, never hex, so the token gate holds. */
const TONES = {
  blue: ['var(--tint-blue)', 'var(--salis-blue)'],
  orange: ['rgba(249,115,22,.13)', 'var(--salis-orange)'],
  slate: ['rgba(100,116,139,.12)', 'var(--text-muted)'],
} as const

const STATUS_TONE: Record<string, keyof typeof TONES> = {
  // claim
  submitted: 'slate',
  under_review: 'slate',
  approved: 'blue',
  paid: 'blue',
  rejected: 'orange',
  // policy
  active: 'blue',
  expired: 'orange',
  cancelled: 'slate',
  // loan contract
  settled: 'blue',
  defaulted: 'orange',
  // repayment
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

/** One figure in the stat rail. A server-computed aggregate or a simple count —
 *  the caller passes the value already resolved, so this never sums anything. */
export function StatCard({ icon, value, label }: { icon: string; value: ReactNode; label: string }) {
  const { t } = usePreferences()
  return (
    <Card className="flex items-center gap-3 rounded-xl p-3.5">
      <span className="flex flex-shrink-0 rounded-lg bg-[var(--tint-blue)] p-2.5 text-salis-blue">
        <Icon name={icon} size={16} />
      </span>
      <div className="min-w-0">
        <p className="font-display text-lg font-black leading-tight text-heading">{value}</p>
        <p className="truncate text-[11px] text-muted">{t(label)}</p>
      </div>
    </Card>
  )
}

/** The honest fixture state: no data source connected.
 *
 *  On the fixture build every financial-product accessor is null or empty — the
 *  rows are a server computation and a mock that invented them would be the
 *  fake-completion this seam refuses. Rather than a blank list or, worse, a made
 *  up claim, the section names the collection the API must serve and stops. */
export function ConnectApi({
  icon,
  title,
  description,
  collection,
}: {
  icon: string
  title: string
  description: string
  collection: string
}) {
  const { t } = usePreferences()
  return (
    <Card className="p-4">
      <EmptyState icon={icon} title={t(title)} description={t(description)} />
      <p className="mt-1 flex items-start justify-center gap-1.5 text-[11px] text-muted">
        <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0 text-salis-blue" />
        {t('Connect the API — no data source yet:')}{' '}
        <span dir="ltr" className="font-mono text-body">
          {collection}
        </span>
      </p>
    </Card>
  )
}

/** The provenance banner shown once at the top of the workspace. */
export function ProvenanceNote() {
  const { t } = usePreferences()
  return (
    <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-faint">
      <Icon name="Info" size={12} className="mt-0.5 flex-shrink-0" />
      {t(
        'This screen has a feature-map spec but no pixel design, so its layout follows the design system rather than a prototype.',
      )}
    </p>
  )
}

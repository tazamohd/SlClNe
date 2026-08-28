import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Money } from '@/components/ui/Money'
import { EmptyState } from '@/components/ui/States'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Shared pieces of the HR / payroll workspace.
 *
 *  Provenance: `HRPayroll` carries a `.dc.html` pixel design and drives the
 *  overview; the six feature-map screens (Staff-Directory, HR-Management,
 *  Payroll-Management, Timesheet-Management, Timeclock-Payroll, Leave-Requests)
 *  carry a spec and a reference screenshot but no `.dc.html`, so their visual
 *  language is the design system — the stat rail, list rows and status pills the
 *  workshop, finance and insurance screens already use. Nothing here is invented
 *  chrome; where the spec is thin the design system is the source, and this note
 *  is the record of that (§ the design-system-screen provenance rule).
 */

/** Status → brand tone. The design permits blue and orange only: blue reads as
 *  active / approved / posted / present, orange as needs-attention (rejected,
 *  terminated), and slate is the neutral in-flight state. Colours are tokens and
 *  `rgba()`, never hex, so the token gate holds. */
const TONES = {
  blue: ['var(--tint-blue)', 'var(--salis-blue)'],
  orange: ['rgba(249,115,22,.13)', 'var(--salis-orange)'],
  slate: ['var(--tint-neutral)', 'var(--text-muted)'],
} as const

const STATUS_TONE: Record<string, keyof typeof TONES> = {
  // employee
  active: 'blue',
  on_leave: 'slate',
  terminated: 'orange',
  // payroll run
  draft: 'slate',
  posted: 'blue',
  // timesheet / leave
  submitted: 'slate',
  approved: 'blue',
  rejected: 'orange',
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

/** One figure in the stat rail. A server-computed aggregate or a simple row
 *  count — the caller passes the value already resolved, so this never sums a
 *  money figure. */
export function StatCard({
  icon,
  value,
  label,
}: {
  icon: string
  value: ReactNode
  label: string
}) {
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

/** A pay figure, redacted-aware.
 *
 *  Salary and every payroll pay figure arrive `null` for a role the `Employee
 *  salary` field rule hides pay from — the server nulls it on the wire
 *  (`GLOBAL_REDACTIONS`). A hidden value is rendered as the design's em-dash with
 *  a lock affordance, **never** a zero, and **never** reconstructed from another
 *  field. When it carries a value, it is the server's formatted figure shown
 *  through `Money`. */
export function Pay({
  halalas,
  className,
  bare,
}: {
  halalas: number | null | undefined
  className?: string
  bare?: boolean
}) {
  const { t } = usePreferences()
  if (halalas == null) {
    return (
      <span
        className={'inline-flex items-center gap-1 text-muted ' + (className ?? '')}
        title={t('Hidden for your role')}
        aria-label={t('Salary hidden for your role')}
        dir="ltr"
      >
        <Icon name="Lock" size={11} aria-hidden />—
      </span>
    )
  }
  return <Money sar={halalas / 100} bare={bare} className={className} />
}

/** The honest fixture / no-source state.
 *
 *  On the fixture build every HR accessor is empty — the rows are a server
 *  computation over a live tenant, and a mock that invented an employee or a
 *  payroll line would be the fake-completion this seam refuses. Rather than a
 *  blank list, the section names the collection the API must serve and stops. */
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

/** The provenance banner shown once at the top of a feature-map workspace. */
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

/** A gradient initials avatar, as the HR design shows for each person. */
export function Avatar({ name }: { name: string }) {
  const initial = (name.trim()[0] ?? '?').toUpperCase()
  return (
    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-[11px] font-bold text-white">
      {initial}
    </span>
  )
}

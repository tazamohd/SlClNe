import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/Badge'
import { useDateFormat } from '@/lib/formatDate'
import { usePreferences } from '@/providers/PreferencesProvider'
import { type Part, availableOf, reservedOf } from './partFields'

/* ──────────────────────────────────────────────────────────────── small parts */

/** Stock level against the part's own reorder point.
 *
 *  The reference screenshot tints "In Stock" green. Blue here — green is
 *  forbidden brand-wide (handoff README §7), and blue already carries positive
 *  state everywhere else in this app. */
export function StockBadge({ part }: { part: Part }) {
  const { t } = usePreferences()
  if (part.stock <= 0) {
    return (
      <Badge background="rgba(249,115,22,.16)" color="var(--salis-orange)">
        {t('Out of Stock')}
      </Badge>
    )
  }
  return part.stock <= part.reorder ? (
    <Badge background="var(--tint-orange)" color="var(--salis-orange)">
      {t('Low Stock')}
    </Badge>
  ) : (
    <Badge background="var(--tint-blue)" color="var(--salis-blue)">
      {t('In Stock')}
    </Badge>
  )
}

/** A quantity. Always LTR and monospaced — Arabic must not reorder its digits —
 *  and `null` renders as "not recorded" rather than as a zero nobody wrote. */
export function Qty({ value, muted }: { value: number | null; muted?: boolean }) {
  if (value === null) return <Unknown />
  return (
    <span
      className={muted ? 'font-mono text-[13px] text-muted' : 'font-mono text-[13px]'}
      dir="ltr"
    >
      {value}
    </span>
  )
}

export function Figure({
  label,
  value,
  tone,
}: {
  label: string
  value: number | null
  tone?: 'blue'
}) {
  const { t } = usePreferences()
  return (
    <span className="flex flex-col">
      <span className="text-[11px] text-muted">{t(label)}</span>
      <span
        className={
          tone === 'blue'
            ? 'font-mono text-sm font-semibold text-salis-blue'
            : 'font-mono text-sm font-semibold text-heading'
        }
        dir="ltr"
      >
        {value === null ? '—' : value}
      </span>
    </span>
  )
}

/** The three figures every dialog on a part starts with, plus whatever the
 *  dialog projects — so On Hand, Reserved and Available are always read the
 *  same way, from the same accessors. */
export function FigureStrip({ part, children }: { part: Part; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 rounded border border-border bg-inset px-3.5 py-2.5">
      <Figure label="On Hand" value={part.stock} />
      <Figure label="Reserved" value={reservedOf(part)} />
      <Figure label="Available" value={availableOf(part)} />
      {children}
    </div>
  )
}

/** A value this dataset does not carry. Distinct from zero on purpose. */
export function Unknown(): ReactNode {
  const { t } = usePreferences()
  return (
    <span className="text-[13px] text-muted" title={t('Not recorded in this dataset')}>
      —
    </span>
  )
}

/** A ledger timestamp in the session's locale, Latin digits, Gregorian. */
export function DateCell({ value }: { value: string }) {
  const { dateTime } = useDateFormat()
  const parsed = new Date(value)
  const text = Number.isNaN(parsed.getTime()) ? value : dateTime(parsed, 'short')
  return (
    <span className="font-mono text-[13px] text-muted" dir="ltr">
      {text}
    </span>
  )
}

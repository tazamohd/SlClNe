import { cn } from '@/lib/cn'

/** SAR amount, formatted per handoff README §7:
 *  comma thousands, 2 decimals, JetBrains Mono — `SAR 12,450.75`.
 *
 *  Always LTR. An Arabic page would otherwise let the bidi algorithm move the
 *  currency prefix to the wrong end of the number.
 *
 *  Formatting lives here rather than at each call site so a change to the
 *  convention — or a second currency — is one edit, not three hundred. */
export function Money({
  sar,
  className,
  /** Drop the "SAR" prefix, for columns that carry it in the header. */
  bare,
}: {
  sar: number
  className?: string
  bare?: boolean
}) {
  return (
    <span dir="ltr" className={cn('font-mono', className)}>
      {formatSar(sar, { bare })}
    </span>
  )
}

export function formatSar(sar: number, { bare }: { bare?: boolean } = {}): string {
  const amount = sar.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return bare ? amount : `SAR ${amount}`
}

/** Parses the design's pre-formatted strings ("SAR 1,840") back to a number.
 *
 *  The mock tables store money as display strings; the real API will return
 *  numbers. Screens call this so they can format consistently now and drop it
 *  the day the field becomes numeric. */
export function parseSar(value: string): number {
  const digits = value.replace(/[^\d.-]/g, '')
  const parsed = Number.parseFloat(digits)
  return Number.isFinite(parsed) ? parsed : 0
}

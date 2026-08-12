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
  /* An amount that is not a finite number is not an amount. A division by an
   * empty collection arrives here as NaN and an unbounded ratio as ∞; printing
   * "SAR NaN" invents a figure and "SAR ∞" invents a bigger one. The em dash is
   * the design's "no value", and it is the only honest answer — `Opportunities`
   * guards its average deal by hand for exactly this reason, and nothing
   * stopped the next screen from forgetting. */
  if (!Number.isFinite(sar)) return '—'

  const amount = sar.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  /* Anything in (−0.005, 0) formats as "-0.00": a reconciliation residue that
   * rounds away, rendered as a credit the ledger does not have. Rounding to
   * zero has to lose the sign with it. Narrow on purpose — −0.005 still rounds
   * to −0.01 and keeps its sign, and no other amount is touched. */
  const settled = amount === '-0.00' ? '0.00' : amount
  return bare ? settled : `SAR ${settled}`
}

/** Parses the design's pre-formatted strings ("SAR 1,840") back to a number.
 *
 *  The mock tables store money as display strings; the real API will return
 *  numbers. Screens call this so they can format consistently now and drop it
 *  the day the field becomes numeric. */
export function parseSar(value: string): number {
  /* A ledger writes a negative in brackets: "(1,200)" is −1,200. The brackets
   * are exactly what the punctuation strip removes, so they are read first —
   * otherwise the sign goes with them and any total meeting one swings by
   * twice the amount. */
  const bracketed = /^\(.*\)$/.test(value.replace(/SAR/gi, '').trim())
  const digits = value.replace(/[^\d.-]/g, '')
  const parsed = Number.parseFloat(digits)
  if (!Number.isFinite(parsed)) return 0
  return bracketed ? -Math.abs(parsed) : parsed
}

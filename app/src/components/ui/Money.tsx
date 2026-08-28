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

export function formatSar(
  sar: number,
  { bare, decimals = 2, parens }: { bare?: boolean; decimals?: number; parens?: boolean } = {},
): string {
  if (!Number.isFinite(sar)) return '—'

  const abs = parens ? Math.abs(sar) : sar
  const amount = abs.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  const settled = amount === '-0.00' ? '0.00' : amount
  const prefixed = bare ? settled : `SAR ${settled}`
  return parens && sar < 0 ? `(${prefixed})` : prefixed
}

/** Parses the design's pre-formatted strings ("SAR 1,840") back to a number.
 *
 *  The mock tables store money as display strings; the real API will return
 *  numbers. Screens call this so they can format consistently now and drop it
 *  the day the field becomes numeric. */
/** Label + SAR amount on one row, used in invoice/estimate/delivery summaries.
 *  Pass `sar` for values already in riyals or `halalas` for wire-format values. */
export function SummaryRow({
  label,
  sar,
  halalas,
  muted,
}: {
  label: string
  sar?: number
  halalas?: number
  muted?: boolean
}) {
  const amount = halalas != null ? halalas / 100 : (sar ?? 0)
  return (
    <div className="flex justify-between text-[13px] text-body">
      <span>{label}</span>
      <Money sar={amount} className={muted ? 'text-muted' : 'font-semibold'} />
    </div>
  )
}

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

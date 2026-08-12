import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { Money, formatSar, parseSar } from '@/components/ui/Money'
import { renderWithProviders } from '../helpers/render'
import { ACCOUNTS_COA, INVOICES } from '@/data/generated/tables'

/** SAR formatting and parsing.
 *
 *  Every figure on every screen goes through these two functions, and the mock
 *  tables store money as display strings, so a parsing slip is a wrong invoice
 *  rather than a cosmetic bug. */

describe('formatSar', () => {
  it('writes the handoff convention: SAR, comma thousands, two decimals', () => {
    expect(formatSar(12_450.75)).toBe('SAR 12,450.75')
    expect(formatSar(1_546.75)).toBe('SAR 1,546.75')
    expect(formatSar(1)).toBe('SAR 1.00')
  })

  it('shows zero as a real amount, not an empty cell', () => {
    // An empty cell reads as "unknown"; a settled invoice is a known 0.00.
    expect(formatSar(0)).toBe('SAR 0.00')
  })

  it('keeps the sign on a negative — a credit note is not a debit', () => {
    expect(formatSar(-1_234.5)).toBe('SAR -1,234.50')
    expect(formatSar(-0.5)).toBe('SAR -0.50')
  })

  it('separates thousands at every magnitude a workshop ledger reaches', () => {
    expect(formatSar(999)).toBe('SAR 999.00')
    expect(formatSar(1_000)).toBe('SAR 1,000.00')
    expect(formatSar(842_500)).toBe('SAR 842,500.00')
    expect(formatSar(1_284_500)).toBe('SAR 1,284,500.00')
    expect(formatSar(1_234_567_890.12)).toBe('SAR 1,234,567,890.12')
  })

  it('always shows two decimals, padding and truncating alike', () => {
    expect(formatSar(1_234.5)).toBe('SAR 1,234.50')
    expect(formatSar(1_234.567)).toBe('SAR 1,234.57')
    expect(formatSar(1_234.564)).toBe('SAR 1,234.56')
  })

  it('rounds half away from zero at the halaba', () => {
    expect(formatSar(0.005)).toBe('SAR 0.01')
    expect(formatSar(2.675)).toBe('SAR 2.68')
    expect(formatSar(12_450.755)).toBe('SAR 12,450.76')
  })

  it('absorbs binary floating-point noise from a summed column', () => {
    // 0.1 + 0.2 is the classic; a total assembled from line items lands here
    // constantly and must not render 0.30000000000000004.
    expect(formatSar(0.1 + 0.2)).toBe('SAR 0.30')
    expect(formatSar(1_345 * 0.15)).toBe('SAR 201.75')
  })

  it('drops the prefix on request, for a column that carries it in the header', () => {
    expect(formatSar(12_450.75, { bare: true })).toBe('12,450.75')
    expect(formatSar(0, { bare: true })).toBe('0.00')
    expect(formatSar(12_450.75, {})).toBe('SAR 12,450.75')
  })

  it('loses the sign on a residue that rounds away to nothing (F-007)', () => {
    // A residue of -0.004 is what a reconciliation difference produces. It used
    // to print "SAR -0.00", which reads as a credit the ledger does not have.
    expect(formatSar(-0.004)).toBe('SAR 0.00')
    expect(formatSar(-0)).toBe('SAR 0.00')
    // Narrow: an amount that genuinely rounds to a halala keeps its sign.
    expect(formatSar(-0.005)).toBe('SAR -0.01')
  })

  it('refuses a non-finite amount rather than printing one (F-007)', () => {
    // A division by an empty collection used to reach the screen as "SAR NaN" /
    // "SAR ∞". `Opportunities` guards its average deal by hand for this reason;
    // nothing stopped the next screen from forgetting.
    expect(formatSar(Number.NaN)).toBe('—')
    expect(formatSar(Number.POSITIVE_INFINITY)).toBe('—')
    expect(formatSar(Number.NEGATIVE_INFINITY)).toBe('—')
    expect(formatSar(Number.NaN, { bare: true })).toBe('—')
  })
})

describe('parseSar', () => {
  it('reads the display strings the mock tables actually store', () => {
    expect(parseSar('SAR 1,840')).toBe(1840)
    expect(parseSar('SAR 12,450.75')).toBe(12_450.75)
    expect(parseSar('SAR 1,284,500')).toBe(1_284_500)
    expect(parseSar('SAR 0')).toBe(0)
  })

  it('reads every money string in the seeded tables as a finite number', () => {
    // The screens sum these; one unparseable row would poison a whole total
    // with NaN, and `formatSar` would happily print it.
    const strings = [
      ...INVOICES.map((invoice) => invoice.amount),
      ...ACCOUNTS_COA.map((account) => account.balance),
    ]
    expect(strings.length).toBeGreaterThan(10)
    for (const value of strings) {
      const parsed = parseSar(value)
      expect(Number.isFinite(parsed), `${value} parsed to ${parsed}`).toBe(true)
      expect(parsed).toBeGreaterThanOrEqual(0)
    }
  })

  it('keeps a leading minus', () => {
    expect(parseSar('-SAR 50')).toBe(-50)
    expect(parseSar('SAR -1,234.50')).toBe(-1234.5)
  })

  it('returns 0 for anything it cannot read, rather than NaN', () => {
    // NaN would propagate silently through every `reduce` on the screen.
    expect(parseSar('')).toBe(0)
    expect(parseSar('—')).toBe(0)
    expect(parseSar('pending')).toBe(0)
    expect(parseSar('SAR')).toBe(0)
  })

  it('round-trips whatever formatSar wrote', () => {
    for (const amount of [0, 1, 999.99, 1_234.5, 842_500, 1_234_567_890.12, -1_234.5]) {
      expect(parseSar(formatSar(amount))).toBe(amount)
      expect(parseSar(formatSar(amount, { bare: true }))).toBe(amount)
    }
  })

  it('reads an accounting-style negative in brackets as negative (F-007)', () => {
    // "(1,200)" is how a ledger writes -1,200. Reading it as +1,200 was a 2,400
    // swing in any total that met one. No seeded row uses the form today, which
    // is why it never bit.
    expect(parseSar('(1,200)')).toBe(-1200)
    expect(parseSar('SAR (1,200.50)')).toBe(-1200.5)
    expect(parseSar('(pending)')).toBe(0)
  })
})

describe('<Money>', () => {
  it('pins the amount LTR so bidi cannot move the currency to the wrong end', () => {
    // The whole reason formatting lives in one component: on an Arabic page the
    // bidi algorithm would otherwise render "SAR 1,234.50" with the prefix
    // trailing the digits.
    renderWithProviders(createElement(Money, { sar: 1_234.5 }), { language: 'ar' })
    const amount = screen.getByText('SAR 1,234.50')
    expect(amount).toHaveAttribute('dir', 'ltr')
    expect(amount.className).toContain('font-mono')
    expect(document.documentElement.dir).toBe('rtl')
  })

  it('stays LTR and monospaced on an English page too', () => {
    renderWithProviders(createElement(Money, { sar: 0 }))
    expect(screen.getByText('SAR 0.00')).toHaveAttribute('dir', 'ltr')
  })

  it('renders bare when the column header carries the currency', () => {
    renderWithProviders(createElement(Money, { sar: 45, bare: true, className: 'font-semibold' }))
    const amount = screen.getByText('45.00')
    expect(amount).toHaveAttribute('dir', 'ltr')
    expect(amount.className).toContain('font-semibold')
  })
})

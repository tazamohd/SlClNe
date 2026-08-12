import { describe, expect, it } from 'vitest'
import { formatSar, parseSar } from '@/components/ui/Money'

/** F-007 — the three money-formatting defects, pinned as the behaviour the fix
 *  must produce.
 *
 *  `src/components/ui/Money.tsx` belongs to agent 04 and is not editable from
 *  this domain, so the defects are pinned here instead of patched. The exact
 *  patch requested is in the handover; these are the assertions it has to
 *  satisfy.
 *
 *  These were `it.fails` until the patch landed: the assertions stated the
 *  correct answer while the code gave the wrong one, so the defect was named
 *  out loud in the test report rather than skipped into silence, and each one
 *  turned red — "expected to fail, but passed" — on the day it was fixed. They
 *  now stand as ordinary tests.
 *
 *  `tests/unit/money.test.ts` covers the same three cases from the other side,
 *  and was updated in the same commit.
 */

describe('F-007 · a rounding residue must not read as a credit', () => {
  it('rounds a residue to zero and loses the sign with it', () => {
    expect(formatSar(-0.004)).toBe('SAR 0.00')
  })

  it('shows negative zero as zero', () => {
    expect(formatSar(-0)).toBe('SAR 0.00')
    expect(formatSar(-0, { bare: true })).toBe('0.00')
  })

  it('leaves an amount that genuinely rounds to a halala alone', () => {
    // Already true, and asserted so the fix stays narrow: −0.005 rounds to
    // −0.01 and keeps its sign, and every other negative is untouched.
    expect(formatSar(-0.005)).toBe('SAR -0.01')
    expect(formatSar(-1_234.5)).toBe('SAR -1,234.50')
  })
})

describe('F-007 · a non-finite amount is not an amount', () => {
  it('renders a non-finite amount as the design’s em dash', () => {
    expect(formatSar(Number.NaN)).toBe('—')
    expect(formatSar(Number.POSITIVE_INFINITY)).toBe('—')
    expect(formatSar(Number.NEGATIVE_INFINITY)).toBe('—')
    expect(formatSar(Number.NaN, { bare: true })).toBe('—')
  })
})

describe('F-007 · an accounting negative is written in brackets', () => {
  it('reads brackets as the negative they are', () => {
    expect(parseSar('(1,200)')).toBe(-1200)
    expect(parseSar('SAR (1,200.50)')).toBe(-1200.5)
    expect(parseSar('(0.00)')).toBeCloseTo(0)
  })

  it('still reads every form that already worked', () => {
    expect(parseSar('SAR 1,840')).toBe(1840)
    expect(parseSar('-SAR 50')).toBe(-50)
    expect(parseSar('SAR -1,234.50')).toBe(-1234.5)
    expect(parseSar('')).toBe(0)
    expect(parseSar('—')).toBe(0)
    // …and one that does not: a bracketed non-number is still unreadable.
    expect(parseSar('(pending)')).toBe(0)
  })
})

describe('F-007 · why these three mattered here', () => {
  it('no longer shows a rounding residue as a credit on a settled invoice', () => {
    // The accounting screens divide, and the finance screens compare against
    // zero. A balance that rendered "SAR -0.00" read as money owed *to* the
    // customer on an invoice that is settled.
    const residue = -0.004
    expect(residue < 0).toBe(true)
    expect(formatSar(residue)).not.toContain('-')
  })

  it('no longer turns an average over an empty collection into a figure', () => {
    const total = 0
    const count = 0
    expect(formatSar(total / count)).toBe('—')
  })
})

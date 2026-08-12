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
 *  ### How to read `it.fails`
 *
 *  Each `it.fails` below states the **correct** answer, which the code does not
 *  give yet. Vitest records it as a known failure, so the suite is green and
 *  the defect is named out loud in the test report rather than skipped into
 *  silence. **The day the patch lands each one turns red — "expected to fail,
 *  but passed" — and that is the signal to delete the `.fails` and let it stand
 *  as an ordinary test.** A defect that goes quiet when it is fixed teaches
 *  nobody anything; one that shouts is a ratchet.
 *
 *  `tests/unit/money.test.ts` pins the *current* behaviour of the same three
 *  cases, with a DEFECT comment on each. That file belongs to agent 07 and the
 *  patch has to update it in the same commit, or the fix fails its own suite.
 */

describe('F-007 · a rounding residue must not read as a credit', () => {
  it('is what it does today: a residue prints as a negative zero', () => {
    // −0.004 is what a reconciliation difference leaves behind. It rounds away
    // to nothing, and prints with the sign still attached.
    expect(formatSar(-0.004)).toBe('SAR -0.00')
    expect(formatSar(-0)).toBe('SAR -0.00')
  })

  it.fails('rounds a residue to zero and loses the sign with it', () => {
    expect(formatSar(-0.004)).toBe('SAR 0.00')
  })

  it.fails('shows negative zero as zero', () => {
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
  it('is what it does today: NaN and infinity print as money', () => {
    expect(formatSar(Number.NaN)).toBe('SAR NaN')
    expect(formatSar(Number.POSITIVE_INFINITY)).toBe('SAR ∞')
  })

  it.fails('renders a non-finite amount as the design’s em dash', () => {
    expect(formatSar(Number.NaN)).toBe('—')
    expect(formatSar(Number.POSITIVE_INFINITY)).toBe('—')
    expect(formatSar(Number.NEGATIVE_INFINITY)).toBe('—')
    expect(formatSar(Number.NaN, { bare: true })).toBe('—')
  })
})

describe('F-007 · an accounting negative is written in brackets', () => {
  it('is what it does today: brackets are stripped and the sign goes with them', () => {
    // A 2,400 swing in any total that meets one.
    expect(parseSar('(1,200)')).toBe(1200)
  })

  it.fails('reads brackets as the negative they are', () => {
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

describe('F-007 · why these three matter here', () => {
  it('shows a residue of a fraction of a halala as a credit on a settled invoice', () => {
    // The accounting screens divide, and the finance screens compare against
    // zero. A balance that renders "SAR -0.00" reads as money owed *to* the
    // customer on an invoice that is settled.
    const residue = -0.004
    expect(formatSar(residue)).toContain('-')
    expect(residue < 0).toBe(true)
    expect(Math.round(residue * 100)).toBe(-0)
  })

  it('turns an average over an empty collection into a printed figure', () => {
    const total = 0
    const count = 0
    expect(formatSar(total / count)).toBe('SAR NaN')
  })
})

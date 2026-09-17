import { describe, expect, it } from 'vitest'
import { isoDate, percentChange } from '@/screens/dashboard-metrics'

/** The Dashboard's Total Revenue KPI used to render a hardcoded
 *  `value="$128,450"` and a fabricated `+12%` badge regardless of what the
 *  period actually did. Wiring it to `GET /invoices/summary` means a real
 *  division now runs on every render, including the period when there is no
 *  prior month to compare against (a zero base) — exactly the shape that used
 *  to render `NaN%` or `Infinity%` elsewhere in the app. */

describe('percentChange', () => {
  it('computes a normal increase and decrease', () => {
    expect(percentChange(150, 100)).toBe(50)
    expect(percentChange(50, 100)).toBe(-50)
  })

  it('is null on a zero base rather than Infinity or NaN', () => {
    expect(percentChange(100, 0)).toBeNull()
    expect(percentChange(0, 0)).toBeNull()
  })

  it('is null on a negative base rather than a nonsensical sign flip', () => {
    expect(percentChange(100, -50)).toBeNull()
  })

  it('is null on non-finite input instead of propagating NaN/Infinity', () => {
    expect(percentChange(NaN, 100)).toBeNull()
    expect(percentChange(100, NaN)).toBeNull()
    expect(percentChange(Infinity, 100)).toBeNull()
    expect(percentChange(100, Infinity)).toBeNull()
  })

  it('never returns a non-finite number', () => {
    for (const [current, previous] of [
      [0, 0],
      [1, 0],
      [-1, 0],
      [NaN, 5],
      [5, NaN],
      [Infinity, 5],
      [5, -Infinity],
    ] as const) {
      const result = percentChange(current, previous)
      expect(result === null || Number.isFinite(result)).toBe(true)
    }
  })
})

describe('isoDate', () => {
  it('formats as yyyy-mm-dd', () => {
    expect(isoDate(new Date('2026-09-17T14:30:00Z'))).toBe('2026-09-17')
    expect(isoDate(new Date('2026-01-05T00:00:00Z'))).toBe('2026-01-05')
  })
})

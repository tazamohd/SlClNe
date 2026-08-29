/** The business rules, tested at their boundaries.
 *
 *  Each case is the rule as `MASTER_BUSINESS_RULES.md` words it, plus the value
 *  exactly on the limit and the first value past it — the two places a rule
 *  is actually wrong.
 */
import { describe, expect, it } from 'vitest'
import { formatSar, parseSarToHalalas, sarToHalalas } from '@salis/contract'
import {
  checkApprovalCeiling,
  checkBayFree,
  checkEstimateFresh,
  checkJournalBalanced,
  checkMovement,
  checkPayment,
  checkQcIndependence,
  checkRefund,
  checkReservation,
  checkSelfApproval,
  checkStageTransition,
  computeInvoiceTotals,
  movementDelta,
} from '@salis/contract/rules'

describe('money', () => {
  it('round-trips every money shape the design bundle carries', () => {
    expect(parseSarToHalalas('SAR 1,840')).toBe(184_000)
    expect(formatSar(184_000)).toBe('SAR 1,840')
    expect(parseSarToHalalas('SAR 45')).toBe(4_500)
    expect(formatSar(4_500)).toBe('SAR 45')
    expect(parseSarToHalalas('SAR 450,000')).toBe(45_000_000)
    expect(formatSar(45_000_000)).toBe('SAR 450,000')
    expect(sarToHalalas(420)).toBe(42_000)
  })

  it('computes total = subtotal + tax − discount at the ZATCA rate', () => {
    const totals = computeInvoiceTotals([{ qty: 1, unitPriceHalalas: 42_000 }])
    expect(totals.subtotalHalalas).toBe(42_000)
    expect(totals.taxHalalas).toBe(6_300)
    expect(totals.totalHalalas).toBe(48_300)
  })

  it('taxes the discounted net, not the gross', () => {
    const totals = computeInvoiceTotals([{ qty: 2, unitPriceHalalas: 50_000 }], 10_000)
    expect(totals.subtotalHalalas).toBe(100_000)
    expect(totals.discountHalalas).toBe(10_000)
    expect(totals.taxHalalas).toBe(13_500)
    expect(totals.totalHalalas).toBe(103_500)
  })

  it('rounds once at the total rather than on every line', () => {
    const lines = Array.from({ length: 500 }, () => ({ qty: 1, unitPriceHalalas: 333 }))
    const totals = computeInvoiceTotals(lines)
    expect(totals.subtotalHalalas).toBe(166_500)
    expect(totals.taxHalalas).toBe(24_975)
  })

  it('caps a discount at the subtotal instead of producing a negative total', () => {
    const totals = computeInvoiceTotals([{ qty: 1, unitPriceHalalas: 1_000 }], 5_000)
    expect(totals.discountHalalas).toBe(1_000)
    expect(totals.totalHalalas).toBe(0)
  })
})

describe('payments', () => {
  const base = { balanceHalalas: 100_000, invoiceStatus: 'unpaid' }

  it('accepts a payment exactly equal to the balance', () => {
    expect(checkPayment({ ...base, amountHalalas: 100_000 })).toBeNull()
  })

  it('refuses one halala more than the balance', () => {
    expect(checkPayment({ ...base, amountHalalas: 100_001 })?.message).toMatch(/exceed/i)
  })

  it('refuses a payment against a cancelled invoice', () => {
    expect(
      checkPayment({ ...base, amountHalalas: 1, invoiceStatus: 'cancelled' })?.message,
    ).toMatch(/cancelled/i)
  })

  it('refuses a payment against a draft invoice', () => {
    expect(checkPayment({ ...base, amountHalalas: 1, invoiceStatus: 'draft' })).not.toBeNull()
  })

  it('refuses a refund larger than what was collected', () => {
    expect(checkRefund({ refundHalalas: 100, collectedHalalas: 100 })).toBeNull()
    expect(checkRefund({ refundHalalas: 101, collectedHalalas: 100 })).not.toBeNull()
  })

  it('requires journal debits to equal credits', () => {
    expect(
      checkJournalBalanced([
        { debitHalalas: 100, creditHalalas: 0 },
        { debitHalalas: 0, creditHalalas: 100 },
      ]),
    ).toBeNull()
    expect(
      checkJournalBalanced([
        { debitHalalas: 100, creditHalalas: 0 },
        { debitHalalas: 0, creditHalalas: 99 },
      ]),
    ).not.toBeNull()
  })
})

describe('approval ceilings', () => {
  it('lets a manager approve exactly SAR 50,000 and not a halala more', () => {
    expect(checkApprovalCeiling('manager', 5_000_000).allowed).toBe(true)
    expect(checkApprovalCeiling('manager', 5_000_001).allowed).toBe(false)
  })

  it('gives the owner no ceiling', () => {
    expect(checkApprovalCeiling('owner', 999_999_999).allowed).toBe(true)
  })

  it('refuses every role whose ceiling is zero', () => {
    for (const role of ['technician', 'qc', 'frontdesk', 'callcenter', 'supplier', 'customer'] as const) {
      expect(checkApprovalCeiling(role, 1).allowed, role).toBe(false)
    }
  })

  it('says what the ceiling is rather than only refusing', () => {
    const decision = checkApprovalCeiling('advisor', 600_000)
    expect(decision.message).toContain('SAR 5,000')
    expect(decision.message).toMatch(/escalat/i)
  })
})

describe('segregation of duties', () => {
  it('stops the submitter approving their own request', () => {
    expect(checkSelfApproval({ actorUserId: 'u1', submittedByUserId: 'u1' })).not.toBeNull()
    expect(checkSelfApproval({ actorUserId: 'u1', submittedByUserId: 'u2' })).toBeNull()
  })

  it('stops the technician passing QC on their own repair', () => {
    expect(checkQcIndependence({ actorUserId: 'u1', performedByUserId: 'u1' })).not.toBeNull()
    expect(checkQcIndependence({ actorUserId: 'u1', performedByUserId: null })).toBeNull()
  })
})

describe('workshop', () => {
  it('walks the stage machine and refuses a skipped gate', () => {
    expect(checkStageTransition('checkin', 'inspection')).toBeNull()
    expect(checkStageTransition('checkin', 'delivery')).not.toBeNull()
    expect(checkStageTransition('repair', 'delivery')).not.toBeNull()
    expect(checkStageTransition('qc', 'delivery')).toBeNull()
  })

  it('refuses a transition to the stage the job is already at', () => {
    expect(checkStageTransition('repair', 'repair')).not.toBeNull()
  })

  it('refuses to approve an expired estimate', () => {
    expect(checkEstimateFresh({ validUntil: '2020-01-01T00:00:00.000Z' })).not.toBeNull()
    expect(checkEstimateFresh({ validUntil: null })).toBeNull()
  })

  it('refuses to double-book a bay but allows a back-to-back booking', () => {
    const existing = [
      { bay: 'Bay 1', scheduledDate: '2026-07-26', startMinute: 540, durationMins: 90 },
    ]
    expect(
      checkBayFree(
        { bay: 'Bay 1', scheduledDate: '2026-07-26', startMinute: 600, durationMins: 30 },
        existing,
      ),
    ).not.toBeNull()
    expect(
      checkBayFree(
        { bay: 'Bay 1', scheduledDate: '2026-07-26', startMinute: 630, durationMins: 30 },
        existing,
      ),
    ).toBeNull()
    expect(
      checkBayFree(
        { bay: 'Bay 2', scheduledDate: '2026-07-26', startMinute: 600, durationMins: 30 },
        existing,
      ),
    ).toBeNull()
  })
})

describe('inventory', () => {
  it('signs each movement type correctly', () => {
    expect(movementDelta('in', 5)).toBe(5)
    expect(movementDelta('out', 5)).toBe(-5)
    expect(movementDelta('damage', 5)).toBe(-5)
    expect(movementDelta('transfer', 5)).toBe(-5)
  })

  it('refuses to take stock negative unless the part is backorderable', () => {
    const part = { onHand: 3, reserved: 0, backorderable: false }
    expect(checkMovement({ ...part, type: 'out', qty: 3 })).toBeNull()
    expect(checkMovement({ ...part, type: 'out', qty: 4 })).not.toBeNull()
    expect(checkMovement({ ...part, backorderable: true, type: 'out', qty: 4 })).toBeNull()
  })

  it('only lets unreserved stock be consumed', () => {
    expect(
      checkMovement({ onHand: 10, reserved: 8, backorderable: false, type: 'out', qty: 3 }),
    ).not.toBeNull()
    expect(
      checkMovement({ onHand: 10, reserved: 8, backorderable: false, type: 'out', qty: 2 }),
    ).toBeNull()
  })

  it('keeps reserved within on-hand', () => {
    expect(checkReservation({ qty: 2, onHand: 10, reserved: 8 })).toBeNull()
    expect(checkReservation({ qty: 3, onHand: 10, reserved: 8 })).not.toBeNull()
  })
})

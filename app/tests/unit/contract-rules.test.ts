import { describe, expect, it } from 'vitest'
import {
  rules,
  canTransition,
  JOB_STAGE_TRANSITIONS,
  type JobStage,
  jobStatus,
  jobStage,
  jobPriority,
  jobService,
  jobCardCreate,
  vehicleStatus,
  vehicleCreate,
  customerCreate,
  customerType,
  movementType,
  movementCreate,
  partCreate,
} from '@contract'

// ─── Money rules ────────────────────────────────────────────────────────────

describe('computeInvoiceTotals', () => {
  it('computes subtotal + 15% VAT for a simple invoice', () => {
    const lines = [
      { qty: 2, unitPriceHalalas: 25000 },
      { qty: 1, unitPriceHalalas: 50000 },
    ]
    const totals = rules.computeInvoiceTotals(lines)
    // subtotal = 2*25000 + 1*50000 = 100000
    expect(totals.subtotalHalalas).toBe(100000)
    // tax = 100000 * 1500 / 10000 = 15000
    expect(totals.taxHalalas).toBe(15000)
    expect(totals.discountHalalas).toBe(0)
    // total = 100000 + 15000 = 115000
    expect(totals.totalHalalas).toBe(115000)
  })

  it('applies a discount before computing VAT', () => {
    const lines = [{ qty: 1, unitPriceHalalas: 100000 }]
    const totals = rules.computeInvoiceTotals(lines, 20000)
    expect(totals.subtotalHalalas).toBe(100000)
    expect(totals.discountHalalas).toBe(20000)
    // net = 100000 - 20000 = 80000
    // tax = 80000 * 1500 / 10000 = 12000
    expect(totals.taxHalalas).toBe(12000)
    expect(totals.totalHalalas).toBe(80000 + 12000)
  })

  it('caps the discount at the subtotal', () => {
    const lines = [{ qty: 1, unitPriceHalalas: 10000 }]
    const totals = rules.computeInvoiceTotals(lines, 99999)
    expect(totals.discountHalalas).toBe(10000)
    expect(totals.totalHalalas).toBe(0)
  })

  it('treats a negative discount as zero', () => {
    const lines = [{ qty: 1, unitPriceHalalas: 10000 }]
    const totals = rules.computeInvoiceTotals(lines, -5000)
    expect(totals.discountHalalas).toBe(0)
  })

  it('returns zeros for an empty invoice', () => {
    const totals = rules.computeInvoiceTotals([])
    expect(totals.subtotalHalalas).toBe(0)
    expect(totals.taxHalalas).toBe(0)
    expect(totals.totalHalalas).toBe(0)
  })

  it('uses a custom VAT rate when provided', () => {
    const lines = [{ qty: 1, unitPriceHalalas: 100000 }]
    const totals = rules.computeInvoiceTotals(lines, 0, 0) // zero VAT
    expect(totals.taxHalalas).toBe(0)
    expect(totals.totalHalalas).toBe(100000)
  })

  it('rounds the tax at the total, not per line', () => {
    // 3 lines of 333 halalas each = 999 subtotal, tax = 999*1500/10000 = 149.85 -> 150
    const lines = [
      { qty: 1, unitPriceHalalas: 333 },
      { qty: 1, unitPriceHalalas: 333 },
      { qty: 1, unitPriceHalalas: 333 },
    ]
    const totals = rules.computeInvoiceTotals(lines)
    expect(totals.subtotalHalalas).toBe(999)
    expect(totals.taxHalalas).toBe(150) // rounded half-up
  })
})

describe('roundHalfUp', () => {
  it('rounds positive halves up', () => {
    expect(rules.roundHalfUp(0.5)).toBe(1)
    expect(rules.roundHalfUp(1.5)).toBe(2)
  })

  it('rounds negative halves away from zero', () => {
    expect(rules.roundHalfUp(-0.5)).toBe(-1)
    expect(rules.roundHalfUp(-1.5)).toBe(-2)
  })

  it('leaves integers alone', () => {
    expect(rules.roundHalfUp(0)).toBe(0)
    expect(rules.roundHalfUp(42)).toBe(42)
    expect(rules.roundHalfUp(-42)).toBe(-42)
  })
})

describe('checkPayment', () => {
  it('allows a payment within the balance', () => {
    expect(rules.checkPayment({ amountHalalas: 5000, balanceHalalas: 10000, invoiceStatus: 'issued' })).toBeNull()
  })

  it('allows a payment exactly at the balance', () => {
    expect(rules.checkPayment({ amountHalalas: 10000, balanceHalalas: 10000, invoiceStatus: 'issued' })).toBeNull()
  })

  it('rejects a payment exceeding the balance', () => {
    const result = rules.checkPayment({ amountHalalas: 10001, balanceHalalas: 10000, invoiceStatus: 'issued' })
    expect(result).not.toBeNull()
    expect(result!.code).toBe('rule_violated')
  })

  it('rejects a payment on a cancelled invoice', () => {
    const result = rules.checkPayment({ amountHalalas: 1, balanceHalalas: 10000, invoiceStatus: 'cancelled' })
    expect(result).not.toBeNull()
    expect(result!.message).toContain('cancelled')
  })

  it('rejects a payment on a draft invoice', () => {
    const result = rules.checkPayment({ amountHalalas: 1, balanceHalalas: 10000, invoiceStatus: 'draft' })
    expect(result).not.toBeNull()
    expect(result!.message).toContain('issued')
  })

  it('rejects a zero or negative payment', () => {
    expect(rules.checkPayment({ amountHalalas: 0, balanceHalalas: 10000, invoiceStatus: 'issued' })).not.toBeNull()
    expect(rules.checkPayment({ amountHalalas: -1, balanceHalalas: 10000, invoiceStatus: 'issued' })).not.toBeNull()
  })
})

describe('checkRefund', () => {
  it('allows a refund within collected amount', () => {
    expect(rules.checkRefund({ refundHalalas: 5000, collectedHalalas: 10000 })).toBeNull()
  })

  it('rejects a refund exceeding collected amount', () => {
    const result = rules.checkRefund({ refundHalalas: 10001, collectedHalalas: 10000 })
    expect(result).not.toBeNull()
    expect(result!.code).toBe('rule_violated')
  })
})

describe('checkJournalBalanced', () => {
  it('passes when debits equal credits', () => {
    const lines = [
      { debitHalalas: 10000, creditHalalas: 0 },
      { debitHalalas: 0, creditHalalas: 10000 },
    ]
    expect(rules.checkJournalBalanced(lines)).toBeNull()
  })

  it('fails when debits and credits differ', () => {
    const lines = [
      { debitHalalas: 10000, creditHalalas: 0 },
      { debitHalalas: 0, creditHalalas: 9999 },
    ]
    const result = rules.checkJournalBalanced(lines)
    expect(result).not.toBeNull()
  })

  it('requires at least two lines', () => {
    expect(rules.checkJournalBalanced([{ debitHalalas: 10000, creditHalalas: 0 }])).not.toBeNull()
    expect(rules.checkJournalBalanced([])).not.toBeNull()
  })
})

// ─── Workshop rules ─────────────────────────────────────────────────────────

describe('JOB_STAGE_TRANSITIONS', () => {
  it('defines a directed graph from checkin to closed', () => {
    expect(JOB_STAGE_TRANSITIONS.checkin).toContain('inspection')
    expect(JOB_STAGE_TRANSITIONS.inspection).toContain('estimate')
    expect(JOB_STAGE_TRANSITIONS.repair).toContain('qc')
    expect(JOB_STAGE_TRANSITIONS.closed).toEqual([])
  })

  it('allows QC to send back to repair (rework)', () => {
    expect(canTransition('qc', 'repair')).toBe(true)
  })

  it('allows estimate to go back to inspection', () => {
    expect(canTransition('estimate', 'inspection')).toBe(true)
  })

  it('blocks skipping stages', () => {
    expect(canTransition('checkin', 'repair')).toBe(false)
    expect(canTransition('checkin', 'qc')).toBe(false)
    expect(canTransition('inspection', 'delivery')).toBe(false)
    expect(canTransition('repair', 'delivery')).toBe(false)
  })

  it('blocks moving out of closed', () => {
    for (const stage of jobStage.options) {
      expect(canTransition('closed', stage)).toBe(false)
    }
  })
})

describe('checkStageTransition', () => {
  it('passes for a valid forward transition', () => {
    expect(rules.checkStageTransition('checkin', 'inspection')).toBeNull()
    expect(rules.checkStageTransition('repair', 'qc')).toBeNull()
  })

  it('fails for a same-stage no-op', () => {
    const result = rules.checkStageTransition('repair', 'repair')
    expect(result).not.toBeNull()
    expect(result!.message).toContain('already at')
  })

  it('fails for an illegal skip', () => {
    const result = rules.checkStageTransition('checkin', 'delivery')
    expect(result).not.toBeNull()
    expect(result!.message).toContain('cannot move')
  })
})

describe('checkInvoiceable', () => {
  it('passes at delivery, invoiced, and closed', () => {
    expect(rules.checkInvoiceable({ stage: 'delivery', status: '' })).toBeNull()
    expect(rules.checkInvoiceable({ stage: 'invoiced', status: '' })).toBeNull()
    expect(rules.checkInvoiceable({ stage: 'closed', status: '' })).toBeNull()
  })

  it('fails before delivery', () => {
    for (const stage of ['checkin', 'inspection', 'estimate', 'repair', 'qc'] as const) {
      expect(rules.checkInvoiceable({ stage, status: '' })).not.toBeNull()
    }
  })
})

describe('checkEstimateFresh', () => {
  it('passes for a non-expired estimate', () => {
    const future = new Date(Date.now() + 86400000).toISOString()
    expect(rules.checkEstimateFresh({ validUntil: future })).toBeNull()
  })

  it('fails for an expired estimate', () => {
    const past = new Date(Date.now() - 86400000).toISOString()
    const result = rules.checkEstimateFresh({ validUntil: past })
    expect(result).not.toBeNull()
    expect(result!.message).toContain('expired')
  })

  it('passes when there is no validity date', () => {
    expect(rules.checkEstimateFresh({ validUntil: null })).toBeNull()
  })
})

describe('overlaps (bay booking)', () => {
  const slotA: rules.BaySlot = { bay: 'Bay 1', scheduledDate: '2026-07-28', startMinute: 600, durationMins: 60 }

  it('detects overlapping slots in the same bay and date', () => {
    const slotB = { ...slotA, startMinute: 630, durationMins: 60 }
    expect(rules.overlaps(slotA, slotB)).toBe(true)
  })

  it('allows adjacent slots (half-open intervals)', () => {
    const slotB = { ...slotA, startMinute: 660, durationMins: 60 }
    expect(rules.overlaps(slotA, slotB)).toBe(false)
  })

  it('does not collide across different bays', () => {
    const slotB = { ...slotA, bay: 'Bay 2' }
    expect(rules.overlaps(slotA, slotB)).toBe(false)
  })

  it('does not collide across different dates', () => {
    const slotB = { ...slotA, scheduledDate: '2026-07-29' }
    expect(rules.overlaps(slotA, slotB)).toBe(false)
  })
})

describe('checkBayFree', () => {
  it('passes when no existing slot overlaps', () => {
    const candidate: rules.BaySlot = { bay: 'Bay 1', scheduledDate: '2026-07-28', startMinute: 600, durationMins: 60 }
    expect(rules.checkBayFree(candidate, [])).toBeNull()
  })

  it('fails when a slot overlaps', () => {
    const existing: rules.BaySlot = { bay: 'Bay 1', scheduledDate: '2026-07-28', startMinute: 600, durationMins: 60 }
    const candidate: rules.BaySlot = { bay: 'Bay 1', scheduledDate: '2026-07-28', startMinute: 630, durationMins: 60 }
    expect(rules.checkBayFree(candidate, [existing])).not.toBeNull()
  })
})

// ─── Inventory rules ────────────────────────────────────────────────────────

describe('movementDelta', () => {
  it('increases stock for in and return', () => {
    expect(rules.movementDelta('in', 10)).toBe(10)
    expect(rules.movementDelta('return', 5)).toBe(5)
  })

  it('decreases stock for out, damage, transfer, adjust_down', () => {
    expect(rules.movementDelta('out', 10)).toBe(-10)
    expect(rules.movementDelta('damage', 3)).toBe(-3)
    expect(rules.movementDelta('transfer', 5)).toBe(-5)
    expect(rules.movementDelta('adjust_down', 2)).toBe(-2)
  })

  it('uses the raw qty for adjust (can be positive)', () => {
    expect(rules.movementDelta('adjust', 10)).toBe(10)
  })
})

describe('checkMovement', () => {
  it('allows a consumption within unreserved stock', () => {
    expect(rules.checkMovement({
      type: 'out', qty: 5, onHand: 10, reserved: 3, backorderable: false,
    })).toBeNull()
  })

  it('rejects consuming reserved stock', () => {
    const result = rules.checkMovement({
      type: 'out', qty: 8, onHand: 10, reserved: 5, backorderable: false,
    })
    expect(result).not.toBeNull()
    expect(result!.message).toContain('unreserved')
  })

  it('rejects going negative for a non-backorderable part', () => {
    const result = rules.checkMovement({
      type: 'out', qty: 11, onHand: 10, reserved: 0, backorderable: false,
    })
    expect(result).not.toBeNull()
    expect(result!.message).toContain('negative')
  })

  it('allows going negative for a backorderable part', () => {
    expect(rules.checkMovement({
      type: 'out', qty: 15, onHand: 10, reserved: 0, backorderable: true,
    })).toBeNull()
  })

  it('rejects zero or negative movement qty', () => {
    expect(rules.checkMovement({
      type: 'in', qty: 0, onHand: 10, reserved: 0, backorderable: false,
    })).not.toBeNull()
    expect(rules.checkMovement({
      type: 'in', qty: -1, onHand: 10, reserved: 0, backorderable: false,
    })).not.toBeNull()
  })

  it('allows a from-reservation consumption within the reserved amount', () => {
    expect(rules.checkMovement({
      type: 'out', qty: 3, onHand: 10, reserved: 5, backorderable: false, fromReservation: true,
    })).toBeNull()
  })

  it('rejects a from-reservation consumption exceeding the reserved amount', () => {
    const result = rules.checkMovement({
      type: 'out', qty: 6, onHand: 10, reserved: 5, backorderable: false, fromReservation: true,
    })
    expect(result).not.toBeNull()
    expect(result!.message).toContain('reserved')
  })
})

describe('checkReservation', () => {
  it('allows reserving within on-hand', () => {
    expect(rules.checkReservation({ qty: 5, onHand: 10, reserved: 3 })).toBeNull()
  })

  it('rejects reserving more than on-hand', () => {
    const result = rules.checkReservation({ qty: 5, onHand: 10, reserved: 8 })
    expect(result).not.toBeNull()
  })
})

describe('checkReservationRelease', () => {
  it('allows releasing within reserved amount', () => {
    expect(rules.checkReservationRelease({ qty: 3, reserved: 5 })).toBeNull()
  })

  it('rejects releasing more than reserved', () => {
    expect(rules.checkReservationRelease({ qty: 6, reserved: 5 })).not.toBeNull()
  })
})

// ─── Procurement rules ──────────────────────────────────────────────────────

describe('checkReceive (procurement)', () => {
  it('passes when receiving within ordered quantity', () => {
    expect(rules.checkReceive({ orderedQty: 10, receivedQty: 3, incomingQty: 5 })).toEqual({ kind: 'ok' })
  })

  it('passes when receiving exactly to the ordered quantity', () => {
    expect(rules.checkReceive({ orderedQty: 10, receivedQty: 5, incomingQty: 5 })).toEqual({ kind: 'ok' })
  })

  it('signals over-receipt when exceeding ordered quantity', () => {
    const result = rules.checkReceive({ orderedQty: 10, receivedQty: 8, incomingQty: 5 })
    expect(result.kind).toBe('over')
    if (result.kind === 'over') {
      expect(result.overBy).toBe(3)
    }
  })

  it('rejects zero or negative incoming quantity', () => {
    expect(rules.checkReceive({ orderedQty: 10, receivedQty: 0, incomingQty: 0 }).kind).toBe('invalid')
    expect(rules.checkReceive({ orderedQty: 10, receivedQty: 0, incomingQty: -1 }).kind).toBe('invalid')
  })

  it('rejects non-integer incoming quantity', () => {
    expect(rules.checkReceive({ orderedQty: 10, receivedQty: 0, incomingQty: 1.5 }).kind).toBe('invalid')
  })
})

describe('checkPurchaseOrderApprovable', () => {
  it('passes for a draft PO', () => {
    expect(rules.checkPurchaseOrderApprovable('draft')).toBeNull()
  })

  it('rejects an already-approved PO', () => {
    const result = rules.checkPurchaseOrderApprovable('approved')
    expect(result).not.toBeNull()
    expect(result!.message).toContain('already approved')
  })

  it('rejects a sent or received PO', () => {
    expect(rules.checkPurchaseOrderApprovable('sent')).not.toBeNull()
    expect(rules.checkPurchaseOrderApprovable('received')).not.toBeNull()
  })
})

describe('requisitionEstimatedTotalHalalas', () => {
  it('sums qty * estUnitPriceHalalas across lines', () => {
    const lines = [
      { qty: 10, estUnitPriceHalalas: 5000 },
      { qty: 5, estUnitPriceHalalas: 3000 },
    ]
    expect(rules.requisitionEstimatedTotalHalalas(lines)).toBe(10 * 5000 + 5 * 3000)
  })

  it('returns 0 for an empty list', () => {
    expect(rules.requisitionEstimatedTotalHalalas([])).toBe(0)
  })
})

// ─── Loan amortisation ──────────────────────────────────────────────────────

describe('amortisedInstalmentHalalas', () => {
  it('divides evenly for a zero-rate loan', () => {
    // 120000 halalas / 12 months = 10000 per month
    expect(rules.amortisedInstalmentHalalas(120000, 0, 12)).toBe(10000)
  })

  it('computes the annuity instalment for a positive rate', () => {
    // 1,000,000 halalas (SAR 10,000) at 1200 bps (12%) over 12 months
    const instalment = rules.amortisedInstalmentHalalas(1_000_000, 1200, 12)
    expect(instalment).toBeGreaterThan(1_000_000 / 12) // must exceed simple division
    expect(Number.isInteger(instalment)).toBe(true)
  })

  it('returns 0 for a zero principal', () => {
    expect(rules.amortisedInstalmentHalalas(0, 1200, 12)).toBe(0)
  })

  it('throws for a non-positive term', () => {
    expect(() => rules.amortisedInstalmentHalalas(100000, 1200, 0)).toThrow()
    expect(() => rules.amortisedInstalmentHalalas(100000, 1200, -1)).toThrow()
  })
})

describe('buildRepaymentPlan', () => {
  it('produces exactly termMonths entries', () => {
    const plan = rules.buildRepaymentPlan(120000, 0, 12)
    expect(plan).toHaveLength(12)
  })

  it('ends with a zero balance', () => {
    const plan = rules.buildRepaymentPlan(1_000_000, 1200, 12)
    expect(plan[plan.length - 1].balanceAfterHalalas).toBe(0)
  })

  it('sums principal portions to exactly the original principal', () => {
    const plan = rules.buildRepaymentPlan(1_000_000, 1200, 12)
    const totalPrincipal = plan.reduce((sum, entry) => sum + entry.principalHalalas, 0)
    expect(totalPrincipal).toBe(1_000_000)
  })

  it('has monotonically decreasing interest for a fixed-rate loan', () => {
    const plan = rules.buildRepaymentPlan(1_000_000, 1200, 12)
    for (let i = 1; i < plan.length; i++) {
      expect(plan[i].interestHalalas).toBeLessThanOrEqual(plan[i - 1].interestHalalas)
    }
  })

  it('never produces negative entries', () => {
    const plan = rules.buildRepaymentPlan(500_000, 500, 24)
    for (const entry of plan) {
      expect(entry.amountDueHalalas).toBeGreaterThan(0)
      expect(entry.interestHalalas).toBeGreaterThanOrEqual(0)
      expect(entry.principalHalalas).toBeGreaterThanOrEqual(0)
      expect(entry.balanceAfterHalalas).toBeGreaterThanOrEqual(0)
    }
  })

  it('sequences are 1-based and contiguous', () => {
    const plan = rules.buildRepaymentPlan(100000, 1000, 6)
    expect(plan.map((e) => e.sequence)).toEqual([1, 2, 3, 4, 5, 6])
  })
})

// ─── HR rules ───────────────────────────────────────────────────────────────

describe('payrollLineNetHalalas', () => {
  it('computes net = gross + allowances - deductions', () => {
    expect(rules.payrollLineNetHalalas(500000, 50000, 30000)).toBe(520000)
  })

  it('returns gross when allowances and deductions are zero', () => {
    expect(rules.payrollLineNetHalalas(500000, 0, 0)).toBe(500000)
  })
})

describe('sumPayrollLines', () => {
  it('sums each column across the lines', () => {
    const lines = [
      { grossHalalas: 500000, allowancesHalalas: 50000, deductionsHalalas: 30000, netHalalas: 520000 },
      { grossHalalas: 400000, allowancesHalalas: 40000, deductionsHalalas: 20000, netHalalas: 420000 },
    ]
    const totals = rules.sumPayrollLines(lines)
    expect(totals.grossHalalas).toBe(900000)
    expect(totals.allowancesHalalas).toBe(90000)
    expect(totals.deductionsHalalas).toBe(50000)
    expect(totals.netHalalas).toBe(940000)
  })

  it('returns zeros for an empty payroll', () => {
    const totals = rules.sumPayrollLines([])
    expect(totals.grossHalalas).toBe(0)
    expect(totals.netHalalas).toBe(0)
  })
})

// ─── Approval rules ─────────────────────────────────────────────────────────

describe('checkSelfApproval', () => {
  it('blocks the submitter from approving their own document', () => {
    const result = rules.checkSelfApproval({ actorUserId: 'user-1', submittedByUserId: 'user-1' })
    expect(result).not.toBeNull()
    expect(result!.message).toContain('cannot also approve')
  })

  it('allows a different person to approve', () => {
    expect(rules.checkSelfApproval({ actorUserId: 'user-2', submittedByUserId: 'user-1' })).toBeNull()
  })

  it('allows approval when no submitter is recorded', () => {
    expect(rules.checkSelfApproval({ actorUserId: 'user-1', submittedByUserId: null })).toBeNull()
  })
})

describe('checkQcIndependence', () => {
  it('blocks the repairer from passing QC on their own work', () => {
    const result = rules.checkQcIndependence({ actorUserId: 'tech-1', performedByUserId: 'tech-1' })
    expect(result).not.toBeNull()
    expect(result!.message).toContain('quality check')
  })

  it('allows a different person to pass QC', () => {
    expect(rules.checkQcIndependence({ actorUserId: 'qc-1', performedByUserId: 'tech-1' })).toBeNull()
  })

  it('allows QC when no performer is recorded', () => {
    expect(rules.checkQcIndependence({ actorUserId: 'qc-1', performedByUserId: null })).toBeNull()
  })
})

// ─── Entity schema validation ───────────────────────────────────────────────

describe('jobCardCreate schema', () => {
  it('accepts a minimal valid job card', () => {
    const result = jobCardCreate.safeParse({
      customerName: 'Ahmed Al-Rashid',
      vehicleLabel: 'Toyota Camry 2022',
      service: 'maintenance',
      priority: 'medium',
    })
    expect(result.success).toBe(true)
  })

  it('defaults status to pending and stage to checkin', () => {
    const result = jobCardCreate.parse({
      customerName: 'Ahmed Al-Rashid',
      vehicleLabel: 'Toyota Camry 2022',
      service: 'maintenance',
      priority: 'medium',
    })
    expect(result.status).toBe('pending')
    expect(result.stage).toBe('checkin')
  })

  it('rejects an empty customer name', () => {
    expect(jobCardCreate.safeParse({
      customerName: '',
      vehicleLabel: 'Toyota Camry 2022',
      service: 'maintenance',
      priority: 'medium',
    }).success).toBe(false)
  })

  it('rejects an invalid service type', () => {
    expect(jobCardCreate.safeParse({
      customerName: 'Ahmed',
      vehicleLabel: 'Camry',
      service: 'car_wash',
      priority: 'medium',
    }).success).toBe(false)
  })

  it('accepts all 8 service types', () => {
    for (const svc of jobService.options) {
      expect(jobCardCreate.safeParse({
        customerName: 'Test',
        vehicleLabel: 'Test',
        service: svc,
        priority: 'medium',
      }).success).toBe(true)
    }
  })

  it('accepts all 4 priority levels', () => {
    for (const pr of jobPriority.options) {
      expect(jobCardCreate.safeParse({
        customerName: 'Test',
        vehicleLabel: 'Test',
        service: 'maintenance',
        priority: pr,
      }).success).toBe(true)
    }
  })
})

describe('vehicleCreate schema', () => {
  it('accepts a minimal valid vehicle', () => {
    expect(vehicleCreate.safeParse({
      plate: 'RUH 4821',
      makeModel: 'Toyota Camry 2022',
    }).success).toBe(true)
  })

  it('defaults status to active and mileage to 0', () => {
    const result = vehicleCreate.parse({
      plate: 'RUH 4821',
      makeModel: 'Toyota Camry 2022',
    })
    expect(result.status).toBe('active')
    expect(result.mileageKm).toBe(0)
  })

  it('rejects negative mileage', () => {
    expect(vehicleCreate.safeParse({
      plate: 'RUH 4821',
      makeModel: 'Toyota Camry 2022',
      mileageKm: -1,
    }).success).toBe(false)
  })

  it('accepts all vehicle statuses', () => {
    for (const st of vehicleStatus.options) {
      expect(vehicleCreate.safeParse({
        plate: 'RUH 4821',
        makeModel: 'Toyota Camry',
        status: st,
      }).success).toBe(true)
    }
  })
})

describe('customerCreate schema', () => {
  it('accepts a minimal valid customer', () => {
    expect(customerCreate.safeParse({
      name: 'Ahmed Al-Rashid',
      phone: '+966 50 123 4567',
    }).success).toBe(true)
  })

  it('rejects an empty name', () => {
    expect(customerCreate.safeParse({
      name: '',
      phone: '+966 50 123 4567',
    }).success).toBe(false)
  })

  it('defaults type to individual', () => {
    const result = customerCreate.parse({
      name: 'Ahmed',
      phone: '+966 50 123 4567',
    })
    expect(result.type).toBe('individual')
  })

  it('accepts both customer types', () => {
    for (const ct of customerType.options) {
      expect(customerCreate.safeParse({
        name: 'Test',
        phone: '+966 50 123 4567',
        type: ct,
      }).success).toBe(true)
    }
  })
})

describe('movementCreate schema', () => {
  it('accepts a valid consumption', () => {
    expect(movementCreate.safeParse({
      type: 'out',
      qty: 5,
    }).success).toBe(true)
  })

  it('rejects zero or negative qty', () => {
    expect(movementCreate.safeParse({ type: 'in', qty: 0 }).success).toBe(false)
    expect(movementCreate.safeParse({ type: 'in', qty: -1 }).success).toBe(false)
  })

  it('requires toBranchId for a transfer', () => {
    expect(movementCreate.safeParse({ type: 'transfer', qty: 5 }).success).toBe(false)
    expect(movementCreate.safeParse({
      type: 'transfer',
      qty: 5,
      toBranchId: '01HX5N3KVGADWQ1JY6PXZG7RQP',
    }).success).toBe(true)
  })

  it('only allows fromReservation on out type', () => {
    expect(movementCreate.safeParse({ type: 'in', qty: 5, fromReservation: true }).success).toBe(false)
    expect(movementCreate.safeParse({ type: 'out', qty: 5, fromReservation: true }).success).toBe(true)
  })

  it('accepts all movement types', () => {
    for (const mt of movementType.options) {
      const data: Record<string, unknown> = { type: mt, qty: 1 }
      if (mt === 'transfer') data.toBranchId = '01HX5N3KVGADWQ1JY6PXZG7RQP'
      expect(movementCreate.safeParse(data).success).toBe(true)
    }
  })
})

describe('partCreate schema', () => {
  it('accepts a valid part', () => {
    expect(partCreate.safeParse({
      name: 'Front Brake Pads',
      sku: 'BP-001',
      priceHalalas: 25000,
    }).success).toBe(true)
  })

  it('defaults reorderLevel and openingStock to 0', () => {
    const result = partCreate.parse({
      name: 'Oil Filter',
      sku: 'OF-001',
      priceHalalas: 4500,
    })
    expect(result.reorderLevel).toBe(0)
    expect(result.openingStock).toBe(0)
    expect(result.backorderable).toBe(false)
  })

  it('rejects a negative price', () => {
    expect(partCreate.safeParse({
      name: 'Part',
      sku: 'P-001',
      priceHalalas: -100,
    }).success).toBe(false)
  })

  it('rejects a non-integer price', () => {
    expect(partCreate.safeParse({
      name: 'Part',
      sku: 'P-001',
      priceHalalas: 100.5,
    }).success).toBe(false)
  })
})

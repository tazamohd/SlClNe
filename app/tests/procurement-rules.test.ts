import { describe, expect, it } from 'vitest'
import { approvalLimit, canApprove, sodCounterpart, sodRuleFor, sodViolation } from '@/data/rbac'
import { REQUISITION_ROWS } from '@/screens/network/Procurement'
import { VAT_RATE, checkReceive, poTotals } from '@/screens/network/ProcurementPurchaseOrder'

/** The three procurement lines of the business-invariant list (plan Part 5b):
 *
 *    Purchase order cannot exceed the approval ceiling
 *    Receiving quantity ≤ ordered quantity (over-receipt needs approval)
 *    Supplier create / payment approve is an SOD pair
 *
 *  The server owns enforcement the day it has procurement endpoints; until
 *  then these prove the client rules that anticipate it, so the two cannot
 *  drift apart unnoticed when the endpoints land. */

/* ═══════════════════════════════════ receiving ≤ ordered, over-receipt named */

describe('checkReceive — the receiving invariant', () => {
  it('refuses a quantity that is not a positive whole number', () => {
    for (const qty of [0, -1, 2.5, Number.NaN]) {
      const outcome = checkReceive({ ordered: 10, received: 0, qty })
      expect(outcome.kind).toBe('invalid')
    }
  })

  it('accepts receipts up to and including the ordered quantity', () => {
    expect(checkReceive({ ordered: 10, received: 0, qty: 4 })).toEqual({ kind: 'ok' })
    expect(checkReceive({ ordered: 10, received: 4, qty: 6 })).toEqual({ kind: 'ok' })
  })

  it('never accepts over-receipt silently — it names the excess', () => {
    expect(checkReceive({ ordered: 10, received: 8, qty: 5 })).toEqual({ kind: 'over', overBy: 3 })
    // A line already fully received cannot take one more unit quietly.
    expect(checkReceive({ ordered: 10, received: 10, qty: 1 })).toEqual({ kind: 'over', overBy: 1 })
  })

  it('holds across a sequence of partial receipts', () => {
    let received = 0
    for (const qty of [3, 3, 4]) {
      expect(checkReceive({ ordered: 10, received, qty }).kind).toBe('ok')
      received += qty
    }
    expect(received).toBe(10)
    expect(checkReceive({ ordered: 10, received, qty: 1 }).kind).toBe('over')
  })
})

/* ═══════════════════════════════════════════ totals, in halalas end to end */

describe('poTotals — integer halalas, VAT at the KSA rate', () => {
  it('is zero for an empty order', () => {
    expect(poTotals([])).toEqual({ subtotalHalalas: 0, vatHalalas: 0, totalHalalas: 0 })
  })

  it('sums lines and adds 15% VAT', () => {
    const totals = poTotals([
      { qty: 50, unitPriceHalalas: 2800 }, // SAR 28 × 50 = 1,400
      { qty: 40, unitPriceHalalas: 3200 }, // SAR 32 × 40 = 1,280
      { qty: 30, unitPriceHalalas: 1800 }, // SAR 18 × 30 = 540
      { qty: 60, unitPriceHalalas: 1200 }, // SAR 12 × 60 = 720
    ])
    expect(totals.subtotalHalalas).toBe(394_000)
    expect(totals.vatHalalas).toBe(59_100)
    expect(totals.totalHalalas).toBe(453_100)
    expect(VAT_RATE).toBe(0.15)
  })

  it('rounds VAT to whole halalas rather than carrying fractions', () => {
    const totals = poTotals([{ qty: 1, unitPriceHalalas: 101 }])
    expect(totals.vatHalalas).toBe(15) // 15.15 rounds down
    expect(Number.isInteger(totals.totalHalalas)).toBe(true)
  })
})

/* ═══════════════════════════ the ceiling: authority and limit both required */

describe('the approval ceiling on the procurement module', () => {
  it('lets procurement approve up to its 20,000 SAR limit, inclusive', () => {
    expect(approvalLimit('procurement')).toBe(20_000)
    expect(canApprove('procurement', 19_999, 'procurement')).toBe(true)
    expect(canApprove('procurement', 20_000, 'procurement')).toBe(true)
    expect(canApprove('procurement', 20_001, 'procurement')).toBe(false)
  })

  it('the designed escalation case: REQ-0517 at 28,000 is above the agent ceiling', () => {
    const req = REQUISITION_ROWS.find((r) => r.id === 'REQ-0517')
    expect(req?.amount).toBe(28_000)
    expect(canApprove('procurement', req!.amount, 'procurement')).toBe(false)
    expect(canApprove('manager', req!.amount, 'procurement')).toBe(true) // 50k ceiling
    expect(canApprove('owner', req!.amount, 'procurement')).toBe(true) // unlimited
  })

  it('a ceiling without authority approves nothing: parts may raise but not approve', () => {
    // parts holds procurement:"vc" and a 10,000 SAR ceiling — the ceiling is
    // for the approvals module, and F-002 settled that both questions must
    // hold. No amount makes parts an approver here.
    expect(canApprove('parts', 1, 'procurement')).toBe(false)
    expect(approvalLimit('parts')).toBe(10_000)
  })

  it('superadmin has an unlimited ceiling and still cannot approve a tenant PO', () => {
    expect(approvalLimit('superadmin')).toBeNull()
    expect(canApprove('superadmin', 100, 'procurement')).toBe(false)
  })
})

/* ═══════════════════════════════════════════ the SOD pairs procurement owns */

describe('segregation of duties on procurement activities', () => {
  it('raise / approve purchase order are a pair, both directions', () => {
    expect(sodCounterpart('Raise purchase order')).toBe('Approve purchase order')
    expect(sodCounterpart('Approve purchase order')).toBe('Raise purchase order')
    expect(sodRuleFor('Raise purchase order')?.risk).toBe('high')
  })

  it('create supplier / approve supplier payment are a pair', () => {
    expect(sodCounterpart('Create supplier')).toBe('Approve supplier payment')
    expect(sodRuleFor('Create supplier')?.risk).toBe('high')
  })

  it('the record-level check refuses the raiser approving their own order', () => {
    const history = [{ activity: 'Raise purchase order', actor: 'user-a' }]
    expect(sodViolation('Approve purchase order', 'user-a', history)).toBeDefined()
    expect(sodViolation('Approve purchase order', 'user-b', history)).toBeUndefined()
  })

  it('the check is by person, not by role — two managers are two people', () => {
    const history = [{ activity: 'Raise purchase order', actor: 'manager-1' }]
    expect(sodViolation('Approve purchase order', 'manager-2', history)).toBeUndefined()
  })
})

/* ═══════════════════════════════════════ the fixture matches the design source */

describe('the requisition fixture is the full design set', () => {
  it('carries all seven rows from ProcurementPortal.Requisitions.dc.html', () => {
    expect(REQUISITION_ROWS).toHaveLength(7)
    const ids = REQUISITION_ROWS.map((r) => r.id)
    expect(new Set(ids).size).toBe(7)
    // The two rows the data/network.ts transcription dropped.
    expect(ids).toContain('REQ-0504')
    expect(ids).toContain('REQ-0498')
  })

  it('has the design status distribution, so every tab has honest content', () => {
    const byStatus = (status: string) => REQUISITION_ROWS.filter((r) => r.status === status).length
    expect(byStatus('pending')).toBe(4)
    expect(byStatus('approved')).toBe(1)
    expect(byStatus('converted')).toBe(1)
    expect(byStatus('rejected')).toBe(1)
  })
})

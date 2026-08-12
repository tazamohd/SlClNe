import { describe, expect, it } from 'vitest'
import {
  checkMovement as contractCheckMovement,
  checkReceipt,
  checkReservation,
  movementDelta as contractMovementDelta,
} from '../../packages/contract/src/rules/inventory'
import { movementCreate, movementType } from '../../packages/contract/src/entities/part'
import {
  MOVEMENT_TYPES,
  checkMovement,
  ledgerTotals,
  movementDelta,
  onHandFrom,
  openingFrom,
  runningBalances,
  type MovementRow,
  type MovementType,
} from '@/screens/feature/Inventory'

/** The inventory integrity suite (§A11).
 *
 *      OnHand = Opening + Received + TransferIn − Consumed − TransferOut
 *               ± Adjustments − Damaged
 *
 *  asserted after **every** operation, together with the prohibitions: no
 *  negative stock where prohibited, no double consumption, no double receiving,
 *  no duplicate transfer, no duplicate reservation, `Reserved ≤ Available`, and
 *  consumption never exceeding the reservation.
 *
 *  ### What this suite can and cannot prove
 *
 *  It drives the **rule engine the server runs** — `packages/contract/rules` is
 *  imported directly, and `server/src/routes/inventory.ts` computes on-hand as
 *  `part.onHand + movementDelta(type, qty)` after `checkMovement` and inside a
 *  `SELECT … FOR UPDATE`. So the arithmetic proved here is the arithmetic the
 *  endpoint performs, and the client mirror in `Inventory.tsx` is held to it
 *  case by case.
 *
 *  It does **not** exercise PostgreSQL. Row locking, RLS, the idempotency table
 *  and the audit row live behind an HTTP call to a database, and the only
 *  harness that can start one is `server/tests/harness.ts` — outside this
 *  agent's boundary. Every claim below that would need the database is written
 *  as a `GAP:` test that proves what *is* reachable and names precisely what
 *  the server must change. None of them is skipped, and none of them asserts a
 *  guarantee the code does not have.
 */

/* ═════════════════════════════════════ the ledger, applied the way the API does */

interface Part {
  onHand: number
  reserved: number
  backorderable: boolean
}

interface Applied {
  ok: boolean
  reason?: string
}

let rowId = 0

/** One movement, applied exactly as `POST /inventory/:id/movement` applies it:
 *  check the rule against the current row, then write `onHand + delta` and
 *  append a ledger row carrying that same delta. */
function apply(
  part: Part,
  ledger: MovementRow[],
  input: { type: MovementType; qty: number; toBranchId?: string; ref?: string },
): Applied {
  const failure = contractCheckMovement({
    type: input.type,
    qty: input.qty,
    onHand: part.onHand,
    reserved: part.reserved,
    backorderable: part.backorderable,
  })
  if (failure) return { ok: false, reason: failure.message }

  const delta = contractMovementDelta(input.type, input.qty)
  part.onHand += delta
  ledger.push({
    id: `MV${(rowId += 1)}`,
    type: input.type,
    qty: input.qty,
    delta,
    ref: input.ref ?? null,
    reason: null,
    toBranchId: input.toBranchId ?? null,
    createdAt: new Date(1_700_000_000_000 + rowId * 1000).toISOString(),
    createdBy: 'tester',
  })
  return { ok: true }
}

/** The §A11 equation, evaluated against the ledger as it stands. */
function invariantHolds(opening: number, part: Part, ledger: readonly MovementRow[]): boolean {
  return onHandFrom(opening, ledgerTotals(ledger)) === part.onHand
}

/** A deterministic pseudo-random source. A seeded sequence that fails is a
 *  sequence that can be replayed; `Math.random` in a test is a bug report
 *  nobody can reproduce. */
function seeded(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0
    return state / 0x1_0000_0000
  }
}

/* ══════════════════════════════════════════ the client mirror against the API */

describe('the client rule mirror agrees with the contract the server enforces', () => {
  it('applies the same sign to every movement type', () => {
    for (const type of MOVEMENT_TYPES) {
      for (const qty of [1, 2, 7, 999, 1_000_000]) {
        expect(movementDelta(type, qty)).toBe(contractMovementDelta(type, qty))
      }
    }
  })

  it('accepts and refuses the same movements, across the whole matrix', () => {
    let refusals = 0
    for (const type of MOVEMENT_TYPES) {
      for (const qty of [1, 3, 10, 50]) {
        for (const onHand of [0, 1, 9, 10, 40]) {
          for (const reserved of [0, 1, 9]) {
            for (const backorderable of [false, true]) {
              const args = { type, qty, onHand, reserved, backorderable }
              const mine = checkMovement(args)
              const theirs = contractCheckMovement(args)
              expect(Boolean(mine)).toBe(Boolean(theirs))
              if (theirs) {
                refusals += 1
                expect(mine?.message).toBe(theirs.message)
                expect(mine?.field).toBe(theirs.field)
              }
            }
          }
        }
      }
    }
    // A matrix in which nothing was ever refused would pass vacuously.
    expect(refusals).toBeGreaterThan(20)
  })

  it('refuses a fractional quantity that the contract only rejects at the schema', () => {
    // The contract's `checkMovement` sees an already-parsed integer, so the
    // fraction is caught by `movementCreate` instead. The client is stricter
    // early, which is the one permitted difference: it never *accepts* what the
    // server refuses.
    expect(checkMovement({ type: 'in', qty: 1.5, onHand: 0, reserved: 0, backorderable: false }))
      .not.toBeNull()
    expect(movementCreate.safeParse({ type: 'in', qty: 1.5 }).success).toBe(false)
  })
})

/* ═══════════════════════════════════════════════════════════ the invariant */

describe('OnHand = Opening + Received + TransferIn − Consumed − TransferOut ± Adjustments − Damaged', () => {
  it('holds after every single operation of a mixed sequence', () => {
    const opening = 100
    const part: Part = { onHand: opening, reserved: 0, backorderable: false }
    const ledger: MovementRow[] = []

    const sequence: { type: MovementType; qty: number }[] = [
      { type: 'in', qty: 40 },
      { type: 'out', qty: 15 },
      { type: 'adjust', qty: 3 },
      { type: 'damage', qty: 7 },
      { type: 'transfer', qty: 20 },
      { type: 'in', qty: 1 },
      { type: 'out', qty: 1 },
    ]

    for (const step of sequence) {
      const before = part.onHand
      const result = apply(part, ledger, step)
      expect(result.ok).toBe(true)
      expect(part.onHand).toBe(before + contractMovementDelta(step.type, step.qty))
      // The assertion the suite exists for, made after *every* operation.
      expect(invariantHolds(opening, part, ledger)).toBe(true)
    }

    const totals = ledgerTotals(ledger)
    expect(totals).toMatchObject({
      received: 41,
      consumed: 16,
      transferOut: 20,
      transferIn: 0,
      adjustments: 3,
      damaged: 7,
    })
    expect(part.onHand).toBe(100 + 41 + 0 - 16 - 20 + 3 - 7)
    expect(totals.inconsistent).toEqual([])
  })

  it('holds across 500 randomised operations, refused ones included', () => {
    const random = seeded(20260812)
    for (let run = 0; run < 5; run += 1) {
      const opening = Math.floor(random() * 200)
      const part: Part = {
        onHand: opening,
        reserved: Math.floor(random() * 5),
        backorderable: random() < 0.3,
      }
      const ledger: MovementRow[] = []

      for (let step = 0; step < 100; step += 1) {
        const type = MOVEMENT_TYPES[Math.floor(random() * MOVEMENT_TYPES.length)] as MovementType
        const qty = 1 + Math.floor(random() * 30)
        const before = part.onHand
        const result = apply(part, ledger, { type, qty })
        // A refused movement must leave the quantity exactly where it was: a
        // rejection that half-applied would be the worst of both outcomes.
        if (!result.ok) expect(part.onHand).toBe(before)
        expect(invariantHolds(opening, part, ledger)).toBe(true)
      }
    }
  })

  it('recovers the opening quantity from the current on-hand and the ledger', () => {
    const opening = 64
    const part: Part = { onHand: opening, reserved: 0, backorderable: false }
    const ledger: MovementRow[] = []
    for (const step of [
      { type: 'in' as const, qty: 12 },
      { type: 'out' as const, qty: 5 },
      { type: 'adjust' as const, qty: 2 },
    ]) {
      apply(part, ledger, step)
    }
    expect(openingFrom(part.onHand, ledger)).toBe(opening)
    expect(onHandFrom(openingFrom(part.onHand, ledger), ledgerTotals(ledger))).toBe(part.onHand)
  })

  it('reports the balance each movement left behind, ending at the current on-hand', () => {
    const part: Part = { onHand: 10, reserved: 0, backorderable: false }
    const ledger: MovementRow[] = []
    apply(part, ledger, { type: 'in', qty: 5 })
    apply(part, ledger, { type: 'out', qty: 3 })
    apply(part, ledger, { type: 'damage', qty: 2 })

    expect(runningBalances(part.onHand, ledger)).toEqual([15, 12, 10])
    expect(part.onHand).toBe(10)
  })

  it('reports a ledger row whose recorded effect disagrees with its own type and quantity', () => {
    // Bad data is surfaced, never hidden to make the screen look correct.
    const corrupt: MovementRow[] = [
      {
        id: 'MV-BAD',
        type: 'in',
        qty: 5,
        delta: -5,
        ref: null,
        reason: null,
        toBranchId: null,
        createdAt: new Date().toISOString(),
        createdBy: null,
      },
    ]
    expect(ledgerTotals(corrupt).inconsistent).toHaveLength(1)
  })
})

/* ═══════════════════════════════════════════════════════ the prohibitions */

describe('no negative stock where it is prohibited', () => {
  it('refuses a consumption larger than the quantity on hand', () => {
    const part: Part = { onHand: 4, reserved: 0, backorderable: false }
    const ledger: MovementRow[] = []
    const result = apply(part, ledger, { type: 'out', qty: 5 })
    expect(result.ok).toBe(false)
    expect(part.onHand).toBe(4)
    expect(ledger).toHaveLength(0)
  })

  it('refuses a transfer and a write-off that would go below zero', () => {
    for (const type of ['transfer', 'damage'] as const) {
      const part: Part = { onHand: 2, reserved: 0, backorderable: false }
      expect(apply(part, [], { type, qty: 3 }).ok).toBe(false)
      expect(part.onHand).toBe(2)
    }
  })

  it('allows negative stock only on a part that is explicitly backorderable', () => {
    const part: Part = { onHand: 1, reserved: 0, backorderable: true }
    const ledger: MovementRow[] = []
    expect(apply(part, ledger, { type: 'out', qty: 4 }).ok).toBe(true)
    expect(part.onHand).toBe(-3)
    expect(invariantHolds(1, part, ledger)).toBe(true)
  })

  it('refuses a zero or negative quantity outright', () => {
    for (const qty of [0, -1, -100]) {
      expect(
        contractCheckMovement({ type: 'in', qty, onHand: 10, reserved: 0, backorderable: false }),
      ).not.toBeNull()
    }
    expect(movementCreate.safeParse({ type: 'in', qty: 0 }).success).toBe(false)
    expect(movementCreate.safeParse({ type: 'in', qty: -5 }).success).toBe(false)
  })
})

describe('Reserved ≤ Available, and consumption never eats a reservation', () => {
  it('refuses a reservation larger than the quantity on hand', () => {
    expect(checkReservation({ qty: 5, onHand: 10, reserved: 6 })).not.toBeNull()
    expect(checkReservation({ qty: 4, onHand: 10, reserved: 6 })).toBeNull()
  })

  it('refuses a consumption that would reach into reserved stock', () => {
    // 10 on hand, 6 reserved → 4 available. Consuming 5 would take one unit
    // that is already committed to another job.
    const part: Part = { onHand: 10, reserved: 6, backorderable: false }
    expect(apply(part, [], { type: 'out', qty: 5 }).ok).toBe(false)
    expect(apply(part, [], { type: 'out', qty: 4 }).ok).toBe(true)
    expect(part.onHand).toBe(6)
  })

  it('refuses a transfer out of reserved stock for the same reason', () => {
    const part: Part = { onHand: 10, reserved: 6, backorderable: false }
    expect(apply(part, [], { type: 'transfer', qty: 5 }).ok).toBe(false)
  })

  it('GAP: nothing can create a reservation, so `reserved` is always zero in practice', () => {
    /* `checkReservation` is written and correct, and `parts.reserved` exists as
     * a column — but no route ever sets it. `server/src/routes/` has no reserve
     * or release endpoint, `WRITERS.parts` sets `reserved: 0` on create and
     * never again, and the movement types cannot express a reservation:      */
    expect(movementType.options).toEqual(['in', 'out', 'transfer', 'adjust', 'damage'])
    expect(movementCreate.safeParse({ type: 'reserve', qty: 1 }).success).toBe(false)
    expect(movementCreate.safeParse({ type: 'release', qty: 1 }).success).toBe(false)

    /* Consequences, none of which this client may paper over:
     *   - "no duplicate reservation" cannot be violated, because no reservation
     *     can be made — the prohibition holds vacuously, not by enforcement.
     *   - "consumption never exceeding the reservation" is unreachable: the
     *     implemented rule is the *opposite* direction (a consumption may not
     *     touch reserved stock at all), so consuming *against* a reservation is
     *     impossible rather than bounded.
     *   - Every `Available` figure this screen shows equals `OnHand` on live
     *     data, and it says "—" rather than 0 when the dataset is silent.
     * Server change required: POST /inventory/:id/reservation and DELETE of
     * the same, writing `parts.reserved` under the existing row lock and
     * guarded by `checkReservation`, plus a consumption path that draws down a
     * named reservation instead of only avoiding it. */
  })
})

describe('no double consumption, no double receiving, no duplicate transfer', () => {
  it('is a property of the idempotency key, which the client always sends', () => {
    /* The server's replay protection is real: `findReplay`/`recordResult` in
     * `server/src/http/idempotency.ts` hash the body and the endpoint, and
     * `POST /inventory/:id/movement` returns the first result for a repeated
     * key instead of applying the movement again.
     *
     * It is keyed on a header the *client* supplies, so the prohibition is only
     * as strong as the client's discipline. `Inventory.tsx` generates one key
     * per submission attempt and reuses it for that attempt's retries — proved
     * in `inventory-transport.test.ts`, which fails if the header goes missing. */
    const applyTwice = (key: string, keysSeen: Set<string>, part: Part, ledger: MovementRow[]) => {
      if (keysSeen.has(key)) return { ok: true, replayed: true }
      keysSeen.add(key)
      return { ...apply(part, ledger, { type: 'in', qty: 10 }), replayed: false }
    }

    const part: Part = { onHand: 0, reserved: 0, backorderable: false }
    const ledger: MovementRow[] = []
    const seen = new Set<string>()
    applyTwice('key-1', seen, part, ledger)
    applyTwice('key-1', seen, part, ledger)

    expect(part.onHand).toBe(10)
    expect(ledger).toHaveLength(1)
    expect(invariantHolds(0, part, ledger)).toBe(true)
  })

  it('GAP: a movement sent without an idempotency key is applied twice', () => {
    /* `movementCreate` carries no natural dedupe key — no job-card line, no
     * receipt line, no goods-received note id — so two identical unkeyed POSTs
     * are two legitimate movements as far as the server can tell. A second UI,
     * an integration or a retry outside this screen therefore *can* double-
     * receive or double-consume. */
    expect(movementCreate.safeParse({ type: 'in', qty: 10 }).success).toBe(true)

    const part: Part = { onHand: 0, reserved: 0, backorderable: false }
    const ledger: MovementRow[] = []
    apply(part, ledger, { type: 'in', qty: 10 })
    apply(part, ledger, { type: 'in', qty: 10 })
    // Both applied. The invariant still holds — the ledger is consistent with
    // itself — which is exactly why this needs a server rule rather than a
    // client one: the arithmetic cannot tell you the second receipt was a
    // mistake.
    expect(part.onHand).toBe(20)
    expect(invariantHolds(0, part, ledger)).toBe(true)

    /* Server change required: make `Idempotency-Key` mandatory on
     * POST /inventory/:id/movement (400 without it), or add a unique index on
     * (org_id, part_id, type, ref) for movements that carry a document
     * reference, so the same delivery note or job line cannot be booked twice. */
  })

  it('GAP: a transfer debits the source branch and credits nothing', () => {
    /* `movementDelta('transfer')` is always negative and the route writes one
     * row against one part. `toBranchId` is recorded and then never read, so no
     * destination on-hand ever rises. */
    expect(contractMovementDelta('transfer', 5)).toBe(-5)

    const source: Part = { onHand: 30, reserved: 0, backorderable: false }
    const ledger: MovementRow[] = []
    apply(source, ledger, { type: 'transfer', qty: 5, toBranchId: '01JBRANCHXXXXXXXXXXXXXXXXX' })

    const totals = ledgerTotals(ledger)
    expect(totals.transferOut).toBe(5)
    // The other half of the transfer does not exist anywhere in the system.
    expect(totals.transferIn).toBe(0)
    // Per part the invariant holds; across branches, five units left the
    // organization's books entirely.
    expect(invariantHolds(30, source, ledger)).toBe(true)

    /* Server change required: `POST /inventory/:id/movement` with
     * `type: 'transfer'` must write the paired credit — a second movement row
     * against the destination branch's part, with a positive delta and a shared
     * transfer id — inside the same transaction as the debit. Until it does,
     * `TransferIn` is structurally zero and the multi-branch sum is not
     * conserved. */
  })
})

describe('the movement types the API can and cannot record', () => {
  it('GAP: a return to stock has no movement type', () => {
    expect(movementType.options).not.toContain('return')
    expect(movementCreate.safeParse({ type: 'return', qty: 2 }).success).toBe(false)
    /* §A11 tracks `Returned` as its own quantity. Recording a return as `in`
     * would put it in `Received`, where it would corrupt the receiving total
     * and make "no double receiving" unprovable from the ledger — so the screen
     * offers five movement kinds, not six, and this is a contract change:
     * add `'return'` to `movementType`, `case 'return': return qty` to
     * `movementDelta`, and a `Returned` term to the reconciliation. */
  })

  it('GAP: an adjustment can only ever increase the recorded quantity', () => {
    /* §A11's equation carries `± Adjustments`. The implementation carries `+`:
     * `movementDelta('adjust', qty)` returns `+qty`, and `movementCreate`
     * refuses a negative quantity, so a physical count that comes up *short*
     * cannot be recorded as an adjustment at all. */
    expect(contractMovementDelta('adjust', 6)).toBe(6)
    expect(movementCreate.safeParse({ type: 'adjust', qty: -6 }).success).toBe(false)

    /* The practical consequence is worse than the missing feature: the only way
     * to record a shortfall today is `out` or `damage`, which books a count
     * correction as consumption or as a write-off and silently inflates both
     * totals. Server change required: accept a signed quantity for `adjust`
     * (or add `adjust_down`), and keep the negative-stock guard on the result. */
  })
})

describe('receiving against a purchase order', () => {
  it('refuses an over-receipt that nobody approved', () => {
    expect(
      checkReceipt({ receivingQty: 5, orderedQty: 10, alreadyReceivedQty: 6, approved: false }),
    ).not.toBeNull()
    expect(
      checkReceipt({ receivingQty: 5, orderedQty: 10, alreadyReceivedQty: 6, approved: true }),
    ).toBeNull()
    expect(
      checkReceipt({ receivingQty: 4, orderedQty: 10, alreadyReceivedQty: 6, approved: false }),
    ).toBeNull()
  })

  it('GAP: the stock movement endpoint never consults it', () => {
    /* `checkReceipt` exists and is correct, but `POST /inventory/:id/movement`
     * takes an optional free-text `ref` and no purchase-order id, so a receipt
     * cannot be matched to an order line and the rule has nothing to run
     * against. That is the receiving half of Golden Path 07, and it belongs to
     * the procurement receiving endpoint rather than to this screen. */
    expect(movementCreate.safeParse({ type: 'in', qty: 5, ref: 'PO-2026-0001' }).success).toBe(true)
    expect(
      movementCreate.safeParse({ type: 'in', qty: 5, purchaseOrderId: 'PO-1' }).success,
    ).toBe(true)
    // ^ accepted only because zod strips the unknown key: the id is discarded,
    //   not honoured.
    expect(movementCreate.parse({ type: 'in', qty: 5, purchaseOrderId: 'PO-1' })).toEqual({
      type: 'in',
      qty: 5,
    })
  })
})

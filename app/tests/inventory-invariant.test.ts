import { describe, expect, it } from 'vitest'
import {
  checkMovement as contractCheckMovement,
  checkReceipt,
  checkReservation,
  checkReservationRelease,
  movementDelta as contractMovementDelta,
} from '../../packages/contract/src/rules/inventory'
import {
  movementCreate,
  movementType,
  reservationBody,
} from '../../packages/contract/src/entities/part'
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
 *  and the audit row live behind an HTTP call to a database; those halves are
 *  proven in `server/tests/inventory-enforcement.test.ts`. The `GAP:` tests
 *  this file used to carry — no reservations, uncredited transfers,
 *  increase-only adjustments, no return type, optional idempotency — were
 *  closed when the server implemented F-017, and each is now asserted as the
 *  real rule rather than documented as a hole.
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
 *  check the rule against the current row, then write the delta and append the
 *  ledger row(s). A transfer appends *two* rows — the debit and the paired
 *  credit against the destination — and leaves the organization's on-hand
 *  unchanged, which is how the route conserves the books (F-017). A
 *  consumption drawing on a reservation releases it as it goes. */
function apply(
  part: Part,
  ledger: MovementRow[],
  input: {
    type: MovementType
    qty: number
    toBranchId?: string
    ref?: string
    fromReservation?: boolean
  },
): Applied {
  const failure = contractCheckMovement({
    type: input.type,
    qty: input.qty,
    onHand: part.onHand,
    reserved: part.reserved,
    backorderable: part.backorderable,
    fromReservation: input.fromReservation,
  })
  if (failure) return { ok: false, reason: failure.message }

  const delta = contractMovementDelta(input.type, input.qty)
  const isTransfer = input.type === 'transfer'
  part.onHand += isTransfer ? 0 : delta
  if (input.type === 'out' && input.fromReservation) part.reserved -= input.qty
  const pushRow = (rowDelta: number) =>
    ledger.push({
      id: `MV${(rowId += 1)}`,
      type: input.type,
      qty: input.qty,
      delta: rowDelta,
      ref: input.ref ?? null,
      reason: null,
      toBranchId: input.toBranchId ?? null,
      createdAt: new Date(1_700_000_000_000 + rowId * 1000).toISOString(),
      createdBy: 'tester',
    })
  pushRow(delta)
  if (isTransfer) pushRow(input.qty)
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

    const sequence: { type: MovementType; qty: number; toBranchId?: string }[] = [
      { type: 'in', qty: 40 },
      { type: 'out', qty: 15 },
      { type: 'adjust', qty: 3 },
      { type: 'damage', qty: 7 },
      { type: 'transfer', qty: 20, toBranchId: '01JBRANCHDESTINATION000001' },
      { type: 'return', qty: 2 },
      { type: 'adjust_down', qty: 1 },
      { type: 'in', qty: 1 },
      { type: 'out', qty: 1 },
    ]

    for (const step of sequence) {
      const before = part.onHand
      const result = apply(part, ledger, step)
      expect(result.ok).toBe(true)
      // A transfer relocates rather than consumes: its paired rows sum to
      // zero, so the organization's on-hand does not move.
      const expectedDelta =
        step.type === 'transfer' ? 0 : contractMovementDelta(step.type, step.qty)
      expect(part.onHand).toBe(before + expectedDelta)
      // The assertion the suite exists for, made after *every* operation.
      expect(invariantHolds(opening, part, ledger)).toBe(true)
    }

    const totals = ledgerTotals(ledger)
    expect(totals).toMatchObject({
      received: 41,
      consumed: 16,
      transferOut: 20,
      transferIn: 20,
      adjustments: 2,
      returned: 2,
      damaged: 7,
    })
    expect(part.onHand).toBe(100 + 41 + 20 + 2 - 16 - 20 + 2 - 7)
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

  it('reservations are real: the contract carries the body, the bound and the release rule', () => {
    /* The gap this test used to document is closed: the server now exposes
     * POST /inventory/:id/reservation and its DELETE, writing `parts.reserved`
     * under the movement row lock, guarded by `checkReservation` — proven over
     * HTTP in `server/tests/inventory-enforcement.test.ts`. What is provable
     * here is the shared contract those routes parse and enforce with. */
    expect(reservationBody.safeParse({ qty: 4, ref: 'JOB-1' }).success).toBe(true)
    expect(reservationBody.safeParse({ qty: 0 }).success).toBe(false)
    expect(reservationBody.safeParse({ qty: -3 }).success).toBe(false)

    // Reserved ≤ on hand, and a release never exceeds the hold.
    expect(checkReservation({ qty: 5, onHand: 10, reserved: 6 })).not.toBeNull()
    expect(checkReservation({ qty: 4, onHand: 10, reserved: 6 })).toBeNull()
    expect(checkReservationRelease({ qty: 7, reserved: 6 })).not.toBeNull()
    expect(checkReservationRelease({ qty: 6, reserved: 6 })).toBeNull()

    // A reservation still is not a movement type — it is a hold, not a ledger
    // entry, so it cannot masquerade as receiving or consumption.
    expect(movementCreate.safeParse({ type: 'reserve', qty: 1 }).success).toBe(false)
    expect(movementCreate.safeParse({ type: 'release', qty: 1 }).success).toBe(false)
  })

  it('a consumption can draw down its own reservation, bounded by the hold', () => {
    const part: Part = { onHand: 10, reserved: 6, backorderable: false }
    const ledger: MovementRow[] = []

    // Bounded: seven exceeds the six held.
    expect(
      apply(part, ledger, { type: 'out', qty: 7, fromReservation: true }).reason,
    ).toMatch(/more than is reserved/)
    expect(part.onHand).toBe(10)
    expect(part.reserved).toBe(6)

    // Within the hold: on-hand and the hold fall together.
    expect(apply(part, ledger, { type: 'out', qty: 5, fromReservation: true }).ok).toBe(true)
    expect(part.onHand).toBe(5)
    expect(part.reserved).toBe(1)
    expect(invariantHolds(10, part, ledger)).toBe(true)

    // And the schema refuses the flag on anything that is not a consumption.
    expect(movementCreate.safeParse({ type: 'in', qty: 1, fromReservation: true }).success).toBe(
      false,
    )
    expect(movementCreate.safeParse({ type: 'out', qty: 1, fromReservation: true }).success).toBe(
      true,
    )
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

  it('the ledger arithmetic alone cannot catch a double booking — the mandatory key does', () => {
    /* `movementCreate` still carries no natural dedupe key — no job-card line,
     * no goods-received-note id — which is exactly why the server now refuses
     * a movement without an `Idempotency-Key` header outright (400) and
     * replays the first result for a repeated key. Both halves are proven over
     * HTTP in `server/tests/inventory-enforcement.test.ts`; what this shows is
     * why no client-side arithmetic could substitute for that rule. */
    expect(movementCreate.safeParse({ type: 'in', qty: 10 }).success).toBe(true)

    const part: Part = { onHand: 0, reserved: 0, backorderable: false }
    const ledger: MovementRow[] = []
    apply(part, ledger, { type: 'in', qty: 10 })
    apply(part, ledger, { type: 'in', qty: 10 })
    // Both applied and the invariant still holds — the ledger is consistent
    // with itself. The arithmetic cannot tell you the second receipt was a
    // retry, so the enforcement has to live at the request boundary.
    expect(part.onHand).toBe(20)
    expect(invariantHolds(0, part, ledger)).toBe(true)
  })

  it('a transfer books the paired credit, so the organization’s sum is conserved', () => {
    // The debit row's sign is still negative — that is the row the caller
    // requests — but the route writes the matching credit in the same
    // transaction (proven over HTTP in inventory-enforcement.test.ts).
    expect(contractMovementDelta('transfer', 5)).toBe(-5)

    const source: Part = { onHand: 30, reserved: 0, backorderable: false }
    const ledger: MovementRow[] = []
    apply(source, ledger, { type: 'transfer', qty: 5, toBranchId: '01JBRANCHDESTINATION000001' })

    // A destination is mandatory and must be a branch id, not a name; the
    // branches directory (`GET /branches`) is what a picker lists.
    expect(movementCreate.safeParse({ type: 'transfer', qty: 5 }).success).toBe(false)
    expect(
      movementCreate.safeParse({ type: 'transfer', qty: 5, toBranchId: 'Riyadh Central' }).success,
    ).toBe(false)
    expect(
      movementCreate.safeParse({
        type: 'transfer',
        qty: 5,
        toBranchId: '01JBRANCHDESTINATION000001',
      }).success,
    ).toBe(true)

    const totals = ledgerTotals(ledger)
    expect(ledger).toHaveLength(2)
    expect(totals.transferOut).toBe(5)
    expect(totals.transferIn).toBe(5)
    // Five units moved; none left the organization's books.
    expect(source.onHand).toBe(30)
    expect(invariantHolds(30, source, ledger)).toBe(true)
  })
})

describe('the movement types the API records', () => {
  it('books a return as Returned, never as Received', () => {
    /* §A11 tracks `Returned` as its own quantity; folding it into `in` would
     * corrupt the receiving total and make "no double receiving" unprovable
     * from the ledger. `return` is now its own type with its own term. */
    expect(movementType.options).toContain('return')
    expect(movementCreate.safeParse({ type: 'return', qty: 2 }).success).toBe(true)
    expect(contractMovementDelta('return', 2)).toBe(2)

    const part: Part = { onHand: 5, reserved: 0, backorderable: false }
    const ledger: MovementRow[] = []
    apply(part, ledger, { type: 'return', qty: 2 })
    const totals = ledgerTotals(ledger)
    expect(totals.returned).toBe(2)
    expect(totals.received).toBe(0)
    expect(part.onHand).toBe(7)
    expect(invariantHolds(5, part, ledger)).toBe(true)
  })

  it('records a shortfall as adjust_down, with the negative-stock guard on the result', () => {
    /* §A11's equation carries `± Adjustments`. The minus direction is its own
     * type rather than a signed quantity, because "qty is always positive and
     * the type decides the sign" is the rule that stops a caller turning a
     * receipt into a consumption — a signed adjust would be its one exception. */
    expect(movementType.options).toContain('adjust_down')
    expect(contractMovementDelta('adjust', 6)).toBe(6)
    expect(contractMovementDelta('adjust_down', 6)).toBe(-6)
    expect(movementCreate.safeParse({ type: 'adjust', qty: -6 }).success).toBe(false)
    expect(movementCreate.safeParse({ type: 'adjust_down', qty: 6 }).success).toBe(true)

    const part: Part = { onHand: 10, reserved: 0, backorderable: false }
    const ledger: MovementRow[] = []
    expect(apply(part, ledger, { type: 'adjust_down', qty: 3 }).ok).toBe(true)
    expect(part.onHand).toBe(7)
    const totals = ledgerTotals(ledger)
    // A count correction is an adjustment — it inflates neither consumption
    // nor damage, the misbookings the old gap forced.
    expect(totals.adjustments).toBe(-3)
    expect(totals.consumed).toBe(0)
    expect(totals.damaged).toBe(0)
    expect(invariantHolds(10, part, ledger)).toBe(true)

    // The guard is on the result: a count cannot take stock below zero.
    expect(apply(part, ledger, { type: 'adjust_down', qty: 8 }).ok).toBe(false)
    expect(part.onHand).toBe(7)
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

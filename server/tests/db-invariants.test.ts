/** Money and quantity invariants, asserted at the database rather than the API.
 *
 *  Every rule here is already validated by a Zod contract before a request
 *  reaches a handler. That is not the same claim as "the column cannot hold a
 *  bad value": a seed script, a migration, a repair query typed at 2am, or a
 *  future route that forgets the contract all write to the same table. These
 *  tests bypass the API deliberately — raw SQL under the platform-scoped auth
 *  plane — so what they prove is that the *storage* refuses, not the handler.
 *
 *  Each case names the constraint it exercises, because a failure here should
 *  say which invariant moved rather than only that an insert did not throw.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { sql } from 'drizzle-orm'
import { withAuthPlane } from '../src/auth/context'
import { createDb, type DbHandle } from '../src/db/client'
import { resetDatabase, SEED } from './harness'

let handle: DbHandle

beforeAll(async () => {
  const env = await resetDatabase()
  handle = createDb(env.DATABASE_URL)
}, 120_000)

afterAll(async () => {
  if (handle) await handle.close()
})

/** A 26-character ULID-shaped id, unique per call. */
let n = 0
const id = () => `01TEST${String(++n).padStart(20, '0')}`

/** Runs one statement outside every handler, and reports the constraint that
 *  rejected it (PostgreSQL 23514) or `null` when the row was accepted. */
async function rejectedBy(statement: ReturnType<typeof sql>): Promise<string | null> {
  try {
    await withAuthPlane(handle.db, async (tx) => {
      await tx.execute(statement)
    })
    return null
  } catch (error) {
    const e = error as { code?: string; constraint_name?: string; message?: string }
    if (e.code !== '23514') throw error
    return e.constraint_name ?? e.message ?? 'unknown'
  }
}

const org = () => sql.raw(`'${SEED.orgId}'`)

describe('money invariants live in the database, not only the contract', () => {
  it('rejects a negative part price', async () => {
    expect(
      await rejectedBy(sql`
        insert into parts (id, org_id, name, sku, price_halalas)
        values (${id()}, ${org()}, 'bad price', ${'SKU-' + id()}, -1)`),
    ).toBe('parts_price_non_negative')
  })

  it('rejects a negative part cost', async () => {
    expect(
      await rejectedBy(sql`
        insert into parts (id, org_id, name, sku, price_halalas, cost_halalas)
        values (${id()}, ${org()}, 'bad cost', ${'SKU-' + id()}, 100, -1)`),
    ).toBe('parts_cost_non_negative')
  })

  /** The distinction the column exists to keep: unknown is not zero. A part may
   *  be entered before anyone knows what it cost, and the same constraint that
   *  rejects -1 must still admit NULL — otherwise the fix for a negative cost
   *  would quietly become "every unrecorded cost is now free". */
  it('still accepts an unrecorded cost, because NULL means unknown', async () => {
    expect(
      await rejectedBy(sql`
        insert into parts (id, org_id, name, sku, price_halalas, cost_halalas)
        values (${id()}, ${org()}, 'unknown cost', ${'SKU-' + id()}, 100, null)`),
    ).toBeNull()
  })

  it('rejects a payment of zero, which is not a payment', async () => {
    expect(
      await rejectedBy(sql`
        insert into payments (id, org_id, paid_on, method, amount_halalas)
        values (${id()}, ${org()}, current_date, 'cash', 0)`),
    ).toBe('payments_amount_positive')
  })

  it('rejects a negative estimate line price', async () => {
    expect(
      await rejectedBy(sql`
        insert into estimate_lines (id, org_id, estimate_id, description, kind, qty, unit_price_halalas)
        values (${id()}, ${org()}, ${id()}, 'bad line', 'part', 1, -1)`),
    ).toBe('estimate_lines_unit_price_non_negative')
  })
})

describe('quantity invariants live in the database, not only the contract', () => {
  it('rejects a zero-quantity estimate line', async () => {
    expect(
      await rejectedBy(sql`
        insert into estimate_lines (id, org_id, estimate_id, description, kind, qty, unit_price_halalas)
        values (${id()}, ${org()}, ${id()}, 'zero qty', 'part', 0, 100)`),
    ).toBe('estimate_lines_qty_positive')
  })

  it('rejects a zero-quantity invoice line', async () => {
    expect(
      await rejectedBy(sql`
        insert into invoice_lines (id, org_id, invoice_id, description, kind, qty, unit_price_halalas)
        values (${id()}, ${org()}, ${id()}, 'zero qty', 'part', 0, 100)`),
    ).toBe('invoice_lines_qty_positive')
  })

  /** `qty` carries magnitude and `type` carries direction — a signed `qty`
   *  would let a caller turn a receipt into a consumption. The database now
   *  holds that rule too. `delta` stays signed on purpose and is not asserted
   *  here, because summing it is how on-hand is reconstructed. */
  it('rejects a non-positive inventory movement quantity', async () => {
    expect(
      await rejectedBy(sql`
        insert into inventory_movements (id, org_id, part_id, type, qty, delta)
        values (${id()}, ${org()}, ${id()}, 'in', 0, 0)`),
    ).toBe('inventory_movements_qty_positive')
  })

  it('accepts a negative movement delta, which is how a consumption is recorded', async () => {
    expect(
      await rejectedBy(sql`
        insert into inventory_movements (id, org_id, part_id, type, qty, delta)
        values (${id()}, ${org()}, ${id()}, 'out', 3, -3)`),
    ).toBeNull()
  })

  it('rejects negative stock on a part', async () => {
    expect(
      await rejectedBy(sql`
        insert into parts (id, org_id, name, sku, price_halalas, on_hand)
        values (${id()}, ${org()}, 'negative stock', ${'SKU-' + id()}, 100, -1)`),
    ).toBe('parts_on_hand_non_negative')
  })

  it('rejects a feedback rating outside 1-5', async () => {
    expect(
      await rejectedBy(sql`
        insert into customer_feedback (id, org_id, rating)
        values (${id()}, ${org()}, 6)`),
    ).toBe('customer_feedback_rating_range')
  })
})

describe('invariants that are deliberately absent', () => {
  /** A bank statement line is a debit or a credit; the sign is the data. A
   *  blanket `>= 0` over every `*_halalas` column would have broken this, which
   *  is why the sweep classified columns instead of pattern-matching names. */
  it('accepts a negative bank statement amount', async () => {
    expect(
      await rejectedBy(sql`
        insert into bank_statements (id, org_id, statement_date, description, amount_halalas, direction)
        values (${id()}, ${org()}, current_date, 'bank charge', -2500, 'debit')`),
    ).toBeNull()
  })

  /** An authorised over-receipt is a real event — a supplier ships a bonus
   *  carton and the ledger has to be able to say so. The `received <= ordered`
   *  rule is enforced in the receiving route, which can see the approval; a
   *  CHECK here cannot, and would reject the approved case. */
  it('accepts an over-receipt, because approval is not visible to a CHECK', async () => {
    expect(
      await rejectedBy(sql`
        insert into purchase_order_lines
          (id, org_id, purchase_order_id, description, qty, received_qty, unit_price_halalas)
        values (${id()}, ${org()}, ${id()}, 'bonus carton', 5, 8, 100)`),
    ).toBeNull()
  })
})

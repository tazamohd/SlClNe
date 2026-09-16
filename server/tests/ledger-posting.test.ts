/** DF-001 / DF-002 / DF-003 / DF-004 — the four findings, each pinned.
 *
 *  All four were the same shape: a rule or a ledger existed, was unit-tested or
 *  seeded, and nothing in the request path ever reached it. So these assertions
 *  are deliberately about the *call*, not about the arithmetic — the arithmetic
 *  already had tests, and having them was exactly what made the gap invisible.
 *
 *  Every figure below is read back out of PostgreSQL rather than from the
 *  response, because the claim being made is that the ledger moved, not that a
 *  handler returned a number.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { sql } from 'drizzle-orm'
import { ulid } from 'ulid'
import { withAuthPlane } from '../src/auth'
import { startHarness, type Harness } from './harness'

let harness: Harness

beforeAll(async () => {
  harness = await startHarness()
}, 120_000)

afterAll(async () => {
  await harness?.close()
})

function post(url: string, bearer: string, body: unknown, key?: string) {
  return harness.app.inject({
    method: 'POST',
    url: `/api/v1${url}`,
    headers: {
      authorization: `Bearer ${bearer}`,
      ...(key ? { 'idempotency-key': key } : {}),
    },
    payload: body as Record<string, unknown>,
  })
}

/** Reads on the platform-scope plane, so the assertion sees what was actually
 *  written rather than what a principal is allowed to see.
 *
 *  Not `handle.db.execute` directly: that connects with no request context, and
 *  `app_org()` is then NULL, so `p_tenant` matches nothing and every read comes
 *  back empty. The first draft of this file did exactly that and the tests
 *  reported "no journal entry was written" when one had been — the isolation
 *  working correctly, mistaken for the feature failing. */
async function rows<T>(statement: ReturnType<typeof sql>): Promise<T[]> {
  return withAuthPlane(harness.handle.db, async (tx) => {
    const result = await tx.execute(statement)
    return result as unknown as T[]
  })
}

async function accountBalance(code: string): Promise<number> {
  const [row] = await rows<{ balance_halalas: string }>(
    sql`select balance_halalas from chart_of_accounts where code = ${code}`,
  )
  return Number(row?.balance_halalas ?? 0)
}

async function draftInvoice(bearer: string, overrides: Record<string, unknown> = {}) {
  return post(
    '/invoices',
    bearer,
    {
      customerName: 'Ledger Test Customer',
      dueDate: '2026-12-31',
      lines: [{ description: 'Labour', kind: 'labour', qty: 1, unitPriceHalalas: 100_000 }],
      ...overrides,
    },
    `inv-${Math.random().toString(36).slice(2)}`,
  )
}

describe('DF-001 · issuing an invoice posts to the general ledger', () => {
  it('debits receivables and credits revenue and VAT, and moves the balances', async () => {
    const accountant = await harness.token('accountant')

    const before = {
      receivable: await accountBalance('1100'),
      revenue: await accountBalance('4000'),
      vat: await accountBalance('2100'),
    }

    const created = await draftInvoice(accountant)
    expect(created.statusCode, created.body).toBe(201)
    const invoice = created.json() as {
      _id: string
      code: string
      subtotalHalalas: number
      taxHalalas: number
      totalHalalas: number
      discountHalalas: number
    }

    const issued = await post(`/invoices/${invoice._id}/issue`, accountant, {})
    expect(issued.statusCode, issued.body).toBe(200)

    /* The entry exists, is posted, and names the invoice that produced it. */
    const [entry] = await rows<{ id: string; status: string; debit_halalas: string; credit_halalas: string }>(
      sql`select id, status, debit_halalas, credit_halalas
            from journal_entries
           where source = 'invoice' and source_id = ${invoice._id}`,
    )
    expect(entry, 'issuing an invoice must write a journal entry').toBeTruthy()
    expect(entry.status).toBe('posted')
    expect(Number(entry.debit_halalas)).toBe(Number(entry.credit_halalas))

    const lines = await rows<{ account_code: string; debit_halalas: string; credit_halalas: string }>(
      sql`select account_code, debit_halalas, credit_halalas
            from journal_lines where journal_entry_id = ${entry.id} order by sort`,
    )
    const byAccount = new Map(
      lines.map((line) => [
        line.account_code,
        { debit: Number(line.debit_halalas), credit: Number(line.credit_halalas) },
      ]),
    )

    const net = invoice.subtotalHalalas - invoice.discountHalalas
    expect(byAccount.get('1100')?.debit).toBe(invoice.totalHalalas)
    expect(byAccount.get('4000')?.credit).toBe(net)
    expect(byAccount.get('2100')?.credit).toBe(invoice.taxHalalas)

    /* Debits equal credits — the invariant `checkJournalBalanced` states and
     * which, before this, nothing asserted about a real posting. */
    const debits = lines.reduce((sum, line) => sum + Number(line.debit_halalas), 0)
    const credits = lines.reduce((sum, line) => sum + Number(line.credit_halalas), 0)
    expect(debits).toBe(credits)

    /* And the account balances actually moved, which is what the trial balance
     * reads. A posting that writes lines but leaves balances untouched would
     * satisfy every assertion above and still be useless. */
    expect(await accountBalance('1100')).toBe(before.receivable + invoice.totalHalalas)
    expect(await accountBalance('4000')).toBe(before.revenue + net)
    expect(await accountBalance('2100')).toBe(before.vat + invoice.taxHalalas)
  })

  it('posts a payment as cash in and receivables down, leaving revenue alone', async () => {
    const accountant = await harness.token('accountant')

    const created = await draftInvoice(accountant)
    const invoice = created.json() as { _id: string; totalHalalas: number }
    await post(`/invoices/${invoice._id}/issue`, accountant, {})

    const before = {
      cash: await accountBalance('1000'),
      receivable: await accountBalance('1100'),
      revenue: await accountBalance('4000'),
    }

    const amount = 40_000
    const paid = await post(
      `/invoices/${invoice._id}/payments`,
      accountant,
      { amountHalalas: amount, method: 'Cash' },
      `pay-${Math.random().toString(36).slice(2)}`,
    )
    expect(paid.statusCode, paid.body).toBe(201)

    expect(await accountBalance('1000')).toBe(before.cash + amount)
    expect(await accountBalance('1100')).toBe(before.receivable - amount)
    /* Revenue was recognised at issue. Recognising it again on collection would
     * double the month's sales — the mistake this assertion exists to catch. */
    expect(await accountBalance('4000')).toBe(before.revenue)
  })
})

describe('DF-002 · checkInvoiceable is enforced, not merely defined', () => {
  it('refuses an invoice against a job card that has not reached delivery', async () => {
    const accountant = await harness.token('accountant')
    const [job] = await rows<{ id: string; stage: string }>(
      sql`select id, stage from job_cards where stage = 'repair' limit 1`,
    )
    expect(job, 'the seed must carry a job still in repair').toBeTruthy()

    const response = await draftInvoice(accountant, { jobCardId: job.id })
    expect(response.statusCode, response.body).toBe(422)
    expect(response.json<{ error: { message: string } }>().error.message).toMatch(/delivery/i)
  })

  it('allows one against a job card that has', async () => {
    const accountant = await harness.token('accountant')
    const [job] = await rows<{ id: string }>(
      sql`select id from job_cards where stage in ('delivery','invoiced','closed') limit 1`,
    )
    expect(job).toBeTruthy()

    const response = await draftInvoice(accountant, { jobCardId: job.id })
    expect(response.statusCode, response.body).toBe(201)
  })
})

describe('DF-004 · receiving moves stock and says what it could not move', () => {
  it('raises on-hand, writes a movement, and posts inventory against payables', async () => {
    const procurement = await harness.token('procurement')

    const [line] = await rows<{ id: string; part_sku: string; unit_price_halalas: string }>(
      sql`select l.id, l.part_sku, l.unit_price_halalas
            from purchase_order_lines l
            join purchase_orders o on o.id = l.purchase_order_id
           where o.code = 'PO-0001' and l.part_sku = 'OF-TY-118'`,
    )
    expect(line).toBeTruthy()

    const [order] = await rows<{ id: string }>(sql`select id from purchase_orders where code = 'PO-0001'`)
    const [partBefore] = await rows<{ id: string; on_hand: number }>(
      sql`select id, on_hand from parts where sku = ${line.part_sku}`,
    )
    const payableBefore = await accountBalance('2000')
    const inventoryBefore = await accountBalance('1200')

    const qty = 5
    const received = await post(
      `/procurement/purchase-orders/${order.id}/receive`,
      procurement,
      { lines: [{ lineId: line.id, qty }] },
      `rcv-${Math.random().toString(36).slice(2)}`,
    )
    expect(received.statusCode, received.body).toBe(200)

    const body = received.json() as {
      stocked: { partSku: string; qty: number; onHand: number }[]
      notStocked: { reason: string }[]
    }
    expect(body.stocked).toHaveLength(1)
    expect(body.stocked[0]?.partSku).toBe(line.part_sku)
    expect(body.notStocked).toHaveLength(0)

    /* The point of the finding: `received_qty` and `parts.on_hand` used to be
     * two ledgers with nothing reconciling them. */
    const [partAfter] = await rows<{ on_hand: number }>(
      sql`select on_hand from parts where sku = ${line.part_sku}`,
    )
    expect(partAfter.on_hand).toBe(partBefore.on_hand + qty)

    const movements = await rows<{ delta: number; type: string; ref: string }>(
      sql`select delta, type, ref from inventory_movements
           where part_id = ${partBefore.id} and ref = 'PO-0001' order by created_at desc limit 1`,
    )
    expect(movements[0]?.type).toBe('in')
    expect(movements[0]?.delta).toBe(qty)

    const value = qty * Number(line.unit_price_halalas)
    expect(await accountBalance('1200')).toBe(inventoryBefore + value)
    expect(await accountBalance('2000')).toBe(payableBefore + value)
  })

  it('reports a line it cannot stock instead of skipping it quietly', async () => {
    const procurement = await harness.token('procurement')
    const [order] = await rows<{ id: string }>(sql`select id from purchase_orders where code = 'PO-0001'`)

    /* A line naming a SKU this organization does not carry. The old behaviour
     * moved no stock at all and said nothing; the failure mode being guarded
     * against now is moving stock for the resolvable lines and staying silent
     * about this one. */
    const lineId = ulid()
    const [inserted] = await rows<{ id: string }>(
      sql`insert into purchase_order_lines
            (id, org_id, branch_id, purchase_order_id, part_sku, description, qty, received_qty, unit_price_halalas, sort)
          select
            ${lineId}, o.org_id, o.branch_id, o.id, 'NO-SUCH-SKU-9999',
            'Freight and handling', 1, 0, 25000, 99
          from purchase_orders o where o.id = ${order.id}
          returning id`,
    )
    expect(inserted).toBeTruthy()

    const received = await post(
      `/procurement/purchase-orders/${order.id}/receive`,
      procurement,
      { lines: [{ lineId: inserted.id, qty: 1 }] },
      `rcv-${Math.random().toString(36).slice(2)}`,
    )
    expect(received.statusCode, received.body).toBe(200)

    const body = received.json() as {
      stocked: unknown[]
      notStocked: { partSku: string | null; reason: string }[]
    }
    expect(body.stocked).toHaveLength(0)
    expect(body.notStocked).toHaveLength(1)
    expect(body.notStocked[0]?.partSku).toBe('NO-SUCH-SKU-9999')
    expect(body.notStocked[0]?.reason).toMatch(/could not be stocked/i)
  })
})

describe('DF-003 · every posted entry balances', () => {
  it('holds for every journal entry the request path wrote', async () => {
    const [totals] = await rows<{ entries: number; unbalanced: number }>(
      sql`select
            count(*)::int as entries,
            count(*) filter (
              where coalesce(l.debit, 0) <> coalesce(l.credit, 0)
                 or coalesce(l.debit, 0) <> e.debit_halalas
            )::int as unbalanced
          from journal_entries e
          left join lateral (
            select sum(debit_halalas) as debit, sum(credit_halalas) as credit
              from journal_lines where journal_entry_id = e.id
          ) l on true
          where e.source is not null`,
    )
    expect(totals.entries, 'the suite above must have posted something').toBeGreaterThan(0)
    expect(totals.unbalanced).toBe(0)
  })
})

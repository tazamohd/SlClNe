/** F-016 — the seed becomes the database, so the seed must be coherent.
 *
 *  Three defects were pinned by the wave agents and are closed here:
 *
 *  1. Estimates and invoices carried no `job_card_id`, so every job's cost
 *     summary was legitimately empty.
 *  2. Three of five receipts settled invoices that did not exist — money
 *     against nothing, exactly what the no-orphan audit exists to catch.
 *  3. INV-2026-0142's header implied SAR 150 of net revenue no line carried.
 *
 *  F-008 — the unbalanced chart of accounts — is deliberately NOT touched:
 *  it stays visible, by design, this tranche.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { sql } from 'drizzle-orm'
import { createDb, type DbHandle } from '../src/db/client'
import type { Env } from '../src/env'
import { resetDatabase, SEED } from './harness'

let handle: DbHandle
let env: Env

async function query<T>(text: ReturnType<typeof sql>): Promise<T[]> {
  return handle.db.transaction(async (tx) => {
    await tx.execute(
      sql`select set_config('app.org_id', ${SEED.orgId}, true), set_config('app.scope', 'all', true)`,
    )
    return (await tx.execute(text)) as unknown as T[]
  })
}

beforeAll(async () => {
  env = await resetDatabase()
  handle = createDb(env.DATABASE_URL, 3)
})

afterAll(async () => {
  await handle?.close()
})

describe('jobs, estimates and invoices form one chain', () => {
  it('gives every estimate a job card that exists', async () => {
    const rows = await query<{ code: string; job: string | null }>(sql`
      select e.code, j.id as job
      from estimates e left join job_cards j on j.id = e.job_card_id
      where e.org_id = ${SEED.orgId}
    `)
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) {
      expect(row.job, `estimate ${row.code} has no job`).toBeTruthy()
    }
  })

  it('gives every design invoice a job card, so its cost summary has data', async () => {
    const rows = await query<{ code: string; job: string | null }>(sql`
      select i.code, j.id as job
      from invoices i left join job_cards j on j.id = i.job_card_id
      where i.org_id = ${SEED.orgId} and i.code like 'INV-2026-01%'
    `)
    const designInvoices = rows.filter((row) =>
      ['INV-2026-0138', 'INV-2026-0139', 'INV-2026-0140', 'INV-2026-0141', 'INV-2026-0142'].includes(
        row.code,
      ),
    )
    expect(designInvoices).toHaveLength(5)
    for (const row of designInvoices) {
      expect(row.job, `invoice ${row.code} has no job`).toBeTruthy()
    }
  })

  it('links the job and the invoice through the same customer', async () => {
    const rows = await query<{ code: string; invoiceCustomer: string; jobCustomer: string }>(sql`
      select i.code, i.customer_name as "invoiceCustomer", j.customer_name as "jobCustomer"
      from invoices i join job_cards j on j.id = i.job_card_id
      where i.org_id = ${SEED.orgId}
    `)
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) {
      expect(row.jobCustomer, row.code).toBe(row.invoiceCustomer)
    }
  })
})

describe('no receipt is an orphan', () => {
  it('finds an invoice for every seeded receipt', async () => {
    const orphans = await query<{ code: string; invoice_code: string }>(sql`
      select r.code, r.invoice_code
      from receipts r left join invoices i
        on i.code = r.invoice_code and i.org_id = r.org_id
      where r.org_id = ${SEED.orgId} and i.id is null
    `)
    expect(
      orphans.map((row) => `${row.code} -> ${row.invoice_code}`),
      'receipts with no invoice',
    ).toEqual([])
  })

  it('seeds the three historical invoices the receipts settle, with matching money', async () => {
    const rows = await query<{ code: string; customer_name: string; total: string; status: string }>(
      sql`
        select code, customer_name, total_halalas::text as total, status
        from invoices
        where org_id = ${SEED.orgId}
          and code in ('INV-2026-0124', 'INV-2026-0128', 'INV-2026-0131')
        order by code
      `,
    )
    expect(rows).toEqual([
      { code: 'INV-2026-0124', customer_name: 'Najd Fleet Services', total: '4290000', status: 'paid' },
      { code: 'INV-2026-0128', customer_name: 'Mohammed Hassan', total: '231000', status: 'paid' },
      // RCP-2026-0309 is still pending, so the money has not cleared and the
      // invoice legitimately stays unpaid.
      { code: 'INV-2026-0131', customer_name: 'Gulf Transport Co.', total: '1840000', status: 'unpaid' },
    ])
  })

  it('pays each cleared receipt’s invoice in full and leaves the pending one owing', async () => {
    const rows = await query<{ code: string; total: string; paid: string }>(sql`
      select i.code, i.total_halalas::text as total, i.paid_halalas::text as paid
      from invoices i
      where i.org_id = ${SEED.orgId}
        and i.code in ('INV-2026-0124', 'INV-2026-0128', 'INV-2026-0131')
      order by i.code
    `)
    expect(rows[0]).toMatchObject({ code: 'INV-2026-0124', paid: rows[0]!.total })
    expect(rows[1]).toMatchObject({ code: 'INV-2026-0128', paid: rows[1]!.total })
    expect(rows[2]).toMatchObject({ code: 'INV-2026-0131', paid: '0' })
  })
})

describe('INV-2026-0142 agrees with itself', () => {
  it('has lines whose net sum equals the header subtotal, and a total of SAR 1,840', async () => {
    const [invoice] = await query<{ id: string; subtotal: string; tax: string; total: string }>(sql`
      select id, subtotal_halalas::text as subtotal, tax_halalas::text as tax,
             total_halalas::text as total
      from invoices where org_id = ${SEED.orgId} and code = 'INV-2026-0142'
    `)
    expect(invoice).toBeDefined()
    const lines = await query<{ net: string }>(sql`
      select (sum(qty * unit_price_halalas))::text as net
      from invoice_lines where org_id = ${SEED.orgId} and invoice_id = ${invoice!.id}
    `)
    // SAR 1,600 net + SAR 240 VAT = SAR 1,840 — the figure the invoice list
    // and the receipt both show. The reconciling line is the seeded SAR 150
    // consumables line; the five design lines are untouched.
    expect(lines[0]?.net).toBe('160000')
    expect(invoice!.subtotal).toBe('160000')
    expect(Number(invoice!.subtotal) + Number(invoice!.tax)).toBe(184000)
    expect(invoice!.total).toBe('184000')
  })

  it('keeps the five design lines exactly as the design shows them', async () => {
    const rows = await query<{ description: string; unit: string }>(sql`
      select l.description, l.unit_price_halalas::text as unit
      from invoice_lines l join invoices i on i.id = l.invoice_id
      where l.org_id = ${SEED.orgId} and i.code = 'INV-2026-0142'
      order by l.sort
    `)
    expect(rows.map((row) => row.description)).toEqual([
      'Brake pads — front (genuine)',
      'Brake rotors — front (pair)',
      'Brake fluid DOT 4 · 1L',
      'Brake service · 1.5 hr',
      'Diagnostic scan',
      'Workshop consumables',
    ])
    expect(rows[5]?.unit).toBe('15000')
  })
})

describe('F-030 — appointments reconcile with the technician roster', () => {
  it('gives every appointment a technician_id that resolves to a real technician row', async () => {
    const rows = await query<{ time: string; tech: string; tid: string | null }>(sql`
      select a.time_label as time, a.technician_name as tech, t.id as tid
      from appointments a
      left join technicians t
        on t.id = a.technician_id and t.org_id = a.org_id and t.deleted_at is null
      where a.org_id = ${SEED.orgId}
    `)
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) {
      expect(row.tid, `appointment ${row.time} (${row.tech}) has no roster technician`).toBeTruthy()
    }
  })

  it('links each appointment to the technician whose name it shows', async () => {
    const mismatches = await query<{ time: string; tech: string; roster: string }>(sql`
      select a.time_label as time, a.technician_name as tech, t.name as roster
      from appointments a
      join technicians t on t.id = a.technician_id and t.org_id = a.org_id
      where a.org_id = ${SEED.orgId} and a.technician_name is distinct from t.name
    `)
    expect(mismatches).toEqual([])
  })

  it('groups the whole schedule under the roster, leaving no appointment unassigned', async () => {
    const [counts] = await query<{ total: string; assigned: string }>(sql`
      select count(*)::text as total,
             count(technician_id)::text as assigned
      from appointments where org_id = ${SEED.orgId}
    `)
    expect(counts!.assigned).toBe(counts!.total)
  })
})

describe('F-008 stays visible', () => {
  it('does not balance the chart of accounts on the sly', async () => {
    const rows = await query<{ type: string; balance: string }>(sql`
      select type, sum(balance_halalas)::text as balance
      from chart_of_accounts where org_id = ${SEED.orgId}
      group by type
    `)
    const of = (type: string) => Number(rows.find((row) => row.type === type)?.balance ?? 0)
    // The imbalance the wave pinned: liabilities + equity − assets = SAR 257,050.
    expect(of('Liabilities') + of('Equity') - of('Assets')).toBe(25_705_000)
  })
})

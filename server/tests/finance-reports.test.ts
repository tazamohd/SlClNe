/** F-028 — the financial aggregate endpoints (§A10).
 *
 *  The point these prove is the §A10 discipline made real: the server computes
 *  a cross-record money total, the client only displays it. Each endpoint is
 *  tested two ways — the number it returns equals the sum of the rows it
 *  aggregates (so a screen that displays it displays the truth), and another
 *  organization's rows never reach the total (so the truth is only ever the
 *  caller's own). The trial balance additionally proves it does not lie to look
 *  tidy: F-008's SAR 257,050 imbalance is surfaced, not hidden.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { SEED, startHarness, type Harness } from './harness'

let harness: Harness

const auth = (token: string) => ({ headers: { authorization: `Bearer ${token}` } })

beforeAll(async () => {
  harness = await startHarness()
}, 120_000)

afterAll(async () => {
  await harness?.close()
})

/** A token for the neighbouring tenant, used by every isolation assertion. */
async function neighbourToken(): Promise<string> {
  return harness.token('owner', { orgId: SEED.otherOrgId, branchId: SEED.otherBranchId })
}

/** Every invoice the caller can see, as the list endpoint presents it. Used to
 *  reconstruct the aggregate the summary endpoint is supposed to have computed. */
async function allInvoices(token: string): Promise<Record<string, number>[]> {
  const res = await harness.app.inject({
    method: 'GET',
    url: '/api/v1/invoices?pageSize=200',
    ...auth(token),
  })
  expect(res.statusCode, res.body).toBe(200)
  return (res.json() as { rows: Record<string, number>[] }).rows
}

const sumBy = (rows: Record<string, number>[], key: string): number =>
  rows.reduce((total, row) => total + (Number(row[key]) || 0), 0)

describe('GET /invoices/summary', () => {
  it('returns totals equal to the sum of every invoice in the tenant, not the page', async () => {
    const owner = await harness.token('owner')
    const rows = await allInvoices(owner)

    const res = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/invoices/summary',
      ...auth(owner),
    })
    expect(res.statusCode, res.body).toBe(200)
    const summary = res.json() as {
      count: number
      invoicedHalalas: number
      vatHalalas: number
      paidHalalas: number
      outstandingHalalas: number
      byStatus: { status: string; invoicedHalalas: number }[]
    }

    /* The §A10 guarantee, asserted directly: the server's total equals the sum
     * of the rows — computed over all of them, which the paginated client can
     * never do for itself. */
    expect(summary.count).toBe(rows.length)
    expect(summary.invoicedHalalas).toBe(sumBy(rows, 'totalHalalas'))
    expect(summary.vatHalalas).toBe(sumBy(rows, 'taxHalalas'))
    expect(summary.paidHalalas).toBe(sumBy(rows, 'paidHalalas'))
    expect(summary.outstandingHalalas).toBe(
      sumBy(rows, 'totalHalalas') - sumBy(rows, 'paidHalalas'),
    )
    /* Money stays a whole number of halalas — never a float. */
    expect(Number.isInteger(summary.invoicedHalalas)).toBe(true)

    /* The status split sums back to the headline. */
    const grouped = summary.byStatus.reduce((t, s) => t + s.invoicedHalalas, 0)
    expect(grouped).toBe(summary.invoicedHalalas)
  })

  it('never lets another organization contribute to the total', async () => {
    const owner = await harness.token('owner')
    const neighbour = await neighbourToken()

    const ours = (
      await harness.app.inject({ method: 'GET', url: '/api/v1/invoices/summary', ...auth(owner) })
    ).json() as { count: number; invoicedHalalas: number }

    const theirs = (
      await harness.app.inject({
        method: 'GET',
        url: '/api/v1/invoices/summary',
        ...auth(neighbour),
      })
    ).json() as { count: number; invoicedHalalas: number; vatHalalas: number; outstandingHalalas: number }

    /* The neighbour seed is exactly one invoice: total 115000, VAT 15000,
     * unpaid. The neighbour's summary is that one invoice and nothing of ours. */
    expect(theirs.count).toBe(1)
    expect(theirs.invoicedHalalas).toBe(115000)
    expect(theirs.vatHalalas).toBe(15000)
    expect(theirs.outstandingHalalas).toBe(115000)

    /* And our total does not include their 115000 — the isolation is the same
     * boundary as the arithmetic. */
    expect(ours.count).toBeGreaterThan(theirs.count)
    expect(ours.invoicedHalalas).not.toBe(theirs.invoicedHalalas)
  })

  it('refuses a role without the invoices grant', async () => {
    const technician = await harness.token('technician')
    const res = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/invoices/summary',
      ...auth(technician),
    })
    expect(res.statusCode).toBe(403)
  })
})

describe('GET /accounting/tax/return', () => {
  it('reports output VAT as the sum of charged VAT, at the configured rate', async () => {
    const accountant = await harness.token('accountant')
    const rows = await allInvoices(accountant)

    const res = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/accounting/tax/return',
      ...auth(accountant),
    })
    expect(res.statusCode, res.body).toBe(200)
    const ret = res.json() as {
      rateBps: number
      outputVatHalalas: number
      inputVatModelled: boolean
      inputVatHalalas: number
      netVatPayableHalalas: number
    }

    /* Output VAT is the VAT actually charged on issued invoices — the sum of
     * `taxHalalas` for everything not draft or cancelled. */
    const expected = rows
      .filter((r) => r.status !== 'draft' && r.status !== 'cancelled')
      .reduce((t, r) => t + (Number(r.taxHalalas) || 0), 0)
    expect(ret.outputVatHalalas).toBe(expected)

    /* The rate is configuration (§A37), echoed so the figure names the rate it
     * was reported under — not a literal in the handler. Default is 1500 bps. */
    expect(ret.rateBps).toBe(1500)

    /* Input VAT is honestly declared unmodelled, so its zero reads as "not
     * tracked", not "reconciled". */
    expect(ret.inputVatModelled).toBe(false)
    expect(ret.netVatPayableHalalas).toBe(ret.outputVatHalalas - ret.inputVatHalalas)
  })

  it('does not include another tenant in the return, and is accounting-gated', async () => {
    const accountant = await harness.token('accountant')
    const neighbour = await neighbourToken()

    const ours = (
      await harness.app.inject({
        method: 'GET',
        url: '/api/v1/accounting/tax/return',
        ...auth(accountant),
      })
    ).json() as { outputVatHalalas: number }
    const theirs = (
      await harness.app.inject({
        method: 'GET',
        url: '/api/v1/accounting/tax/return',
        ...auth(neighbour),
      })
    ).json() as { outputVatHalalas: number }

    /* The neighbour's single unpaid invoice carries 15000 VAT and nothing else. */
    expect(theirs.outputVatHalalas).toBe(15000)
    expect(ours.outputVatHalalas).not.toBe(theirs.outputVatHalalas)

    const technician = await harness.token('technician')
    const refused = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/accounting/tax/return',
      ...auth(technician),
    })
    expect(refused.statusCode).toBe(403)
  })
})

describe('GET /accounting/reports/trial-balance', () => {
  it('surfaces F-008: the seeded ledger is out by SAR 257,050 and is not forced to balance', async () => {
    const accountant = await harness.token('accountant')
    const res = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/accounting/reports/trial-balance',
      ...auth(accountant),
    })
    expect(res.statusCode, res.body).toBe(200)
    const tb = res.json() as {
      totals: { debitHalalas: number; creditHalalas: number; differenceHalalas: number }
      balanced: boolean
      balanceSheet: {
        assetsHalalas: number
        liabilitiesHalalas: number
        equityHalalas: number
        liabilitiesPlusEquityHalalas: number
        differenceHalalas: number
        balanced: boolean
      }
      profitAndLoss: { revenueHalalas: number; expenseHalalas: number; netHalalas: number }
      journal: { postedDebitHalalas: number; postedCreditHalalas: number }
      accounts: { code: string; debitHalalas: number; creditHalalas: number }[]
    }

    /* The balance-sheet identity, from the seeded chart of accounts. */
    expect(tb.balanceSheet.assetsHalalas).toBe(268350000) // SAR 2,683,500
    expect(tb.balanceSheet.liabilitiesHalalas).toBe(14055000) // SAR 140,550
    expect(tb.balanceSheet.equityHalalas).toBe(280000000) // SAR 2,800,000
    expect(tb.balanceSheet.liabilitiesPlusEquityHalalas).toBe(294055000) // SAR 2,940,550

    /* F-008, surfaced as a real number: assets − (liabilities + equity) =
     * −SAR 257,050. Not zero, not hidden. */
    expect(tb.balanceSheet.differenceHalalas).toBe(-25705000)
    expect(tb.balanceSheet.balanced).toBe(false)

    /* The full trial balance is likewise reported honestly — debit and credit
     * columns do not tie, and `balanced` says so rather than being coerced. */
    expect(tb.totals.debitHalalas).toBe(364110000) // assets + expense
    expect(tb.totals.creditHalalas).toBe(422505000) // liabilities + equity + revenue
    expect(tb.totals.differenceHalalas).toBe(-58395000)
    expect(tb.balanced).toBe(false)

    /* The P&L roll-up. */
    expect(tb.profitAndLoss.revenueHalalas).toBe(128450000) // SAR 1,284,500
    expect(tb.profitAndLoss.expenseHalalas).toBe(95760000) // SAR 957,600
    expect(tb.profitAndLoss.netHalalas).toBe(32690000)

    /* The journals themselves balance per entry — reported beside the COA so a
     * reader sees the journals tie while the account balances do not. */
    expect(tb.journal.postedDebitHalalas).toBe(tb.journal.postedCreditHalalas)

    /* Every account lands on exactly one side. */
    for (const account of tb.accounts) {
      expect(account.debitHalalas === 0 || account.creditHalalas === 0).toBe(true)
    }
  })

  it('is tenant-scoped: a tenant with no chart of accounts gets zeros, not ours', async () => {
    const neighbour = await neighbourToken()
    const res = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/accounting/reports/trial-balance',
      ...auth(neighbour),
    })
    expect(res.statusCode, res.body).toBe(200)
    const tb = res.json() as {
      accounts: unknown[]
      balanceSheet: { assetsHalalas: number; differenceHalalas: number }
      totals: { debitHalalas: number; creditHalalas: number }
    }
    /* The neighbour seed carries no accounts. Its trial balance is empty and
     * every total is zero — our SAR 257,050 imbalance never leaks across. */
    expect(tb.accounts).toHaveLength(0)
    expect(tb.balanceSheet.assetsHalalas).toBe(0)
    expect(tb.balanceSheet.differenceHalalas).toBe(0)
    expect(tb.totals.debitHalalas).toBe(0)
    expect(tb.totals.creditHalalas).toBe(0)
  })

  it('refuses a role without the accounting grant', async () => {
    const technician = await harness.token('technician')
    const res = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/accounting/reports/trial-balance',
      ...auth(technician),
    })
    expect(res.statusCode).toBe(403)
  })
})

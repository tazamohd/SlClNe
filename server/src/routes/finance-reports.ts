/** Financial aggregate endpoints — the §A10 core (F-028).
 *
 *  Agent 12 built the accounting reports and refused, correctly, to sum a
 *  column of money in the browser: a read is paginated, so a client that adds
 *  up the rows it holds is adding up one page and calling it the year. The
 *  server owns aggregates. These are those aggregates.
 *
 *  Three disciplines hold in every handler here:
 *
 *  1. **The total is computed in SQL, over the whole tenant scope**, never over
 *     a page. `sum(...)` runs inside the request's RLS transaction, so a total
 *     is exactly the caller's own organization's rows and nothing else — the
 *     isolation is the same boundary as the arithmetic.
 *  2. **Money stays integer halalas.** Every sum is a `bigint` cast, returned
 *     as an integer count of halalas; nothing here divides by 100.
 *  3. **Reality is reported, not smoothed.** The trial balance surfaces F-008's
 *     SAR 257,050 imbalance as a real number rather than forcing the books to
 *     tie. A report that hides a bad figure to look correct is the one thing
 *     §A10 exists to forbid.
 */
import { sql, type SQL, type SQLWrapper } from 'drizzle-orm'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { chartOfAccounts, invoices, journalEntries } from '../db/schema'
import { withTenant, type Tx } from '../db/tenant'
import { badRequest } from '../http/errors'
import { principalOf } from '../http/context'
import { requirePermission } from '../security/permissions'
import type { Database } from '../db/client'
import type { Env } from '../env'

export interface FinanceReportDeps {
  db: Database
  env: Env
}

/** `tx.execute` returns the driver's row list; the postgres-js driver types it
 *  loosely, so it is narrowed here the same way `db/client.ts` does — one cast,
 *  in one place, rather than a generic on every call. */
async function rows<T>(tx: Tx, query: SQL): Promise<T[]> {
  return (await tx.execute(query)) as unknown as T[]
}

/** `?from=YYYY-MM-DD&to=YYYY-MM-DD`, either bound optional. A bad date is a 400
 *  rather than a silently-ignored filter, because a range that quietly does
 *  nothing looks exactly like a range that found everything. */
interface DateRange {
  from: string | null
  to: string | null
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function parseRange(request: FastifyRequest): DateRange {
  const query = (request.query ?? {}) as Record<string, unknown>
  const read = (key: 'from' | 'to'): string | null => {
    const value = query[key]
    if (value === undefined || value === '') return null
    if (typeof value !== 'string' || !ISO_DATE.test(value)) {
      throw badRequest(`"${key}" must be a YYYY-MM-DD date.`, key)
    }
    return value
  }
  return { from: read('from'), to: read('to') }
}

/** The range predicate for a date column, as a list of SQL fragments to `and`
 *  into a WHERE. Empty when the caller named no bounds. */
function rangeOn(column: SQLWrapper, range: DateRange): SQL[] {
  const parts: SQL[] = []
  if (range.from) parts.push(sql`${column} >= ${range.from}`)
  if (range.to) parts.push(sql`${column} <= ${range.to}`)
  return parts
}

function whereFrom(parts: SQL[]): SQL {
  if (parts.length === 0) return sql`true`
  return sql.join(parts, sql` and `)
}

export function registerFinanceReportRoutes(app: FastifyInstance, deps: FinanceReportDeps): void {
  /* ----------------------------------------------------- GET /invoices/summary
   * What SalesReports and the invoice dashboards need: the period's invoiced,
   * paid, outstanding and VAT totals, computed over every invoice in scope
   * rather than the page on screen. Gated on `invoices:v` — the same grant the
   * Sales Reports card is shown under (server/src/registry.ts, ReportSuite). */
  app.get('/invoices/summary', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'invoices', 'v')
    const range = parseRange(request)
    const status = statusFilter(request)

    return withTenant(deps.db, principal, async (tx) => {
      const parts: SQL[] = [sql`${invoices.deletedAt} is null`, ...rangeOn(invoices.createdAt, range)]
      if (status) parts.push(sql`${invoices.status} = ${status}`)
      const where = whereFrom(parts)

      /* One pass for the headline totals. Each `sum` is a bigint cast so the
       * figure is exact integer halalas, never a float. `coalesce(...,0)` turns
       * the empty-scope null into a zero. */
      const [totals] = await rows<{
        count: number
        invoiced: number
        subtotal: number
        vat: number
        discount: number
        paid: number
        outstanding: number
      }>(tx, sql`
        select
          count(*)::int                                                   as count,
          coalesce(sum(${invoices.totalHalalas}), 0)::bigint              as invoiced,
          coalesce(sum(${invoices.subtotalHalalas}), 0)::bigint           as subtotal,
          coalesce(sum(${invoices.taxHalalas}), 0)::bigint                as vat,
          coalesce(sum(${invoices.discountHalalas}), 0)::bigint           as discount,
          coalesce(sum(${invoices.paidHalalas}), 0)::bigint               as paid,
          coalesce(sum(${invoices.totalHalalas} - ${invoices.paidHalalas}), 0)::bigint as outstanding
        from ${invoices}
        where ${where}
      `)

      /* The same window, grouped by status, so a dashboard can show the split
       * without a second round trip. Computed in SQL for the same reason the
       * headline is: the client must not re-derive it from rows it does not
       * hold all of. */
      const byStatus = await rows<{
        status: string
        count: number
        invoiced: number
        outstanding: number
      }>(tx, sql`
        select
          ${invoices.status}                                              as status,
          count(*)::int                                                   as count,
          coalesce(sum(${invoices.totalHalalas}), 0)::bigint              as invoiced,
          coalesce(sum(${invoices.totalHalalas} - ${invoices.paidHalalas}), 0)::bigint as outstanding
        from ${invoices}
        where ${where}
        group by ${invoices.status}
        order by ${invoices.status}
      `)

      return {
        range,
        count: num(totals?.count),
        invoicedHalalas: num(totals?.invoiced),
        subtotalHalalas: num(totals?.subtotal),
        vatHalalas: num(totals?.vat),
        discountHalalas: num(totals?.discount),
        paidHalalas: num(totals?.paid),
        outstandingHalalas: num(totals?.outstanding),
        byStatus: byStatus.map((row) => ({
          status: row.status,
          count: num(row.count),
          invoicedHalalas: num(row.invoiced),
          outstandingHalalas: num(row.outstanding),
        })),
      }
    })
  })

  /* ------------------------------------------------- GET /accounting/tax/return
   * TaxManagement's figure: output VAT collected over the period, at the
   * configurable ZATCA rate (§A37). The collected amount is the *sum of the VAT
   * that was actually charged* — each invoice's `taxHalalas`, itself computed at
   * issue time by `computeInvoiceTotals` — not a fresh multiplication of a base
   * by a rate here. The rate is echoed, read from configuration, so the
   * consumer can show "output VAT at 15%" with the 15% coming from a setting and
   * never from a literal in this file. Input VAT is not modelled (expenses carry
   * no tax split), and the response says so rather than reporting a fabricated
   * zero as if it were a reconciled figure. Gated on `accounting:v`. */
  app.get('/accounting/tax/return', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'accounting', 'v')
    const range = parseRange(request)

    return withTenant(deps.db, principal, async (tx) => {
      /* A draft invoice has charged nothing and a cancelled one has un-charged
       * it, so neither contributes VAT to a return. Everything issued does. */
      const parts: SQL[] = [
        sql`${invoices.deletedAt} is null`,
        sql`${invoices.status} not in ('draft', 'cancelled')`,
        ...rangeOn(invoices.createdAt, range),
      ]
      const where = whereFrom(parts)

      const [row] = await rows<{
        count: number
        taxable: number
        output_vat: number
        gross: number
      }>(tx, sql`
        select
          count(*)::int                                                       as count,
          coalesce(sum(${invoices.subtotalHalalas} - ${invoices.discountHalalas}), 0)::bigint as taxable,
          coalesce(sum(${invoices.taxHalalas}), 0)::bigint                    as output_vat,
          coalesce(sum(${invoices.totalHalalas}), 0)::bigint                  as gross
        from ${invoices}
        where ${where}
      `)

      const outputVat = num(row?.output_vat)
      const inputVat = 0 // Not modelled: expenses carry no VAT split (see report).

      return {
        range,
        /* The rate the figure is reported under, from configuration. */
        rateBps: deps.env.VAT_RATE_BPS,
        invoiceCount: num(row?.count),
        taxableSalesHalalas: num(row?.taxable),
        grossSalesHalalas: num(row?.gross),
        outputVatHalalas: outputVat,
        /* Input VAT is not yet modelled; surfaced explicitly so a zero is read
         * as "not tracked", not as "reconciled to nothing owed". */
        inputVatModelled: false,
        inputVatHalalas: inputVat,
        netVatPayableHalalas: outputVat - inputVat,
      }
    })
  })

  /* ---------------------------------- GET /accounting/reports/trial-balance
   * A trial balance over the chart of accounts, plus a P&L roll-up and a
   * journal-entry roll-up — the endpoint AGGREGATE_GAP.ledger named. It reports
   * reality: the seeded ledger does not balance (F-008 — assets are out against
   * liabilities plus equity by SAR 257,050), and this surfaces that as a real
   * `balanceSheet.differenceHalalas` rather than forcing the columns to tie.
   * Gated on `accounting:v`. */
  app.get('/accounting/reports/trial-balance', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'accounting', 'v')

    return withTenant(deps.db, principal, async (tx) => {
      /* Each account's balance placed on its normal side: assets and expenses
       * are debit-normal, liabilities/equity/revenue are credit-normal. The
       * CASE runs in SQL so the placement is one statement, not a client loop. */
      const accounts = await rows<{
        code: string
        name: string
        type: string
        debit: number
        credit: number
      }>(tx, sql`
        select
          ${chartOfAccounts.code}    as code,
          ${chartOfAccounts.name}    as name,
          ${chartOfAccounts.type}    as type,
          case when ${chartOfAccounts.type} in ('Assets', 'Expense')
               then ${chartOfAccounts.balanceHalalas} else 0 end::bigint as debit,
          case when ${chartOfAccounts.type} in ('Liabilities', 'Equity', 'Revenue')
               then ${chartOfAccounts.balanceHalalas} else 0 end::bigint as credit
        from ${chartOfAccounts}
        where ${chartOfAccounts.deletedAt} is null
        order by ${chartOfAccounts.code}
      `)

      /* Sub-totals by class, so both the trial balance and the balance-sheet
       * identity fall out of one aggregation rather than a re-scan per figure. */
      const [byClass] = await rows<{
        assets: number
        liabilities: number
        equity: number
        revenue: number
        expense: number
      }>(tx, sql`
        select
          coalesce(sum(${chartOfAccounts.balanceHalalas}) filter (where ${chartOfAccounts.type} = 'Assets'), 0)::bigint      as assets,
          coalesce(sum(${chartOfAccounts.balanceHalalas}) filter (where ${chartOfAccounts.type} = 'Liabilities'), 0)::bigint as liabilities,
          coalesce(sum(${chartOfAccounts.balanceHalalas}) filter (where ${chartOfAccounts.type} = 'Equity'), 0)::bigint      as equity,
          coalesce(sum(${chartOfAccounts.balanceHalalas}) filter (where ${chartOfAccounts.type} = 'Revenue'), 0)::bigint     as revenue,
          coalesce(sum(${chartOfAccounts.balanceHalalas}) filter (where ${chartOfAccounts.type} = 'Expense'), 0)::bigint     as expense
        from ${chartOfAccounts}
        where ${chartOfAccounts.deletedAt} is null
      `)

      /* The journal side. Each posted entry balances (debits = credits per
       * entry, enforced by `checkJournalBalanced`), so this roll-up is expected
       * to tie — it is reported beside the COA precisely so a reader can see
       * that the journals balance while the account balances do not. */
      const [journal] = await rows<{
        posted_debit: number
        posted_credit: number
        posted_count: number
        draft_count: number
      }>(tx, sql`
        select
          coalesce(sum(${journalEntries.debitHalalas})  filter (where ${journalEntries.status} = 'posted'), 0)::bigint  as posted_debit,
          coalesce(sum(${journalEntries.creditHalalas}) filter (where ${journalEntries.status} = 'posted'), 0)::bigint  as posted_credit,
          count(*) filter (where ${journalEntries.status} = 'posted')::int                                              as posted_count,
          count(*) filter (where ${journalEntries.status} <> 'posted')::int                                             as draft_count
        from ${journalEntries}
        where ${journalEntries.deletedAt} is null
      `)

      const assets = num(byClass?.assets)
      const liabilities = num(byClass?.liabilities)
      const equity = num(byClass?.equity)
      const revenue = num(byClass?.revenue)
      const expense = num(byClass?.expense)

      const totalDebit = assets + expense
      const totalCredit = liabilities + equity + revenue
      const liabilitiesPlusEquity = liabilities + equity

      return {
        accounts: accounts.map((r) => ({
          code: r.code,
          name: r.name,
          type: r.type,
          debitHalalas: num(r.debit),
          creditHalalas: num(r.credit),
        })),
        /* The full trial balance. Not forced to balance: `balanced` is the
         * honest answer, and it is false for the seeded ledger. */
        totals: {
          debitHalalas: totalDebit,
          creditHalalas: totalCredit,
          differenceHalalas: totalDebit - totalCredit,
        },
        balanced: totalDebit === totalCredit,
        /* The balance-sheet identity, Assets = Liabilities + Equity. F-008: the
         * seed is out by SAR 257,050, and `differenceHalalas` says so. */
        balanceSheet: {
          assetsHalalas: assets,
          liabilitiesHalalas: liabilities,
          equityHalalas: equity,
          liabilitiesPlusEquityHalalas: liabilitiesPlusEquity,
          differenceHalalas: assets - liabilitiesPlusEquity,
          balanced: assets === liabilitiesPlusEquity,
        },
        profitAndLoss: {
          revenueHalalas: revenue,
          expenseHalalas: expense,
          netHalalas: revenue - expense,
        },
        journal: {
          postedDebitHalalas: num(journal?.posted_debit),
          postedCreditHalalas: num(journal?.posted_credit),
          postedCount: num(journal?.posted_count),
          draftCount: num(journal?.draft_count),
        },
      }
    })
  })
}

/** The `?filter[status]=` a dashboard passes through, validated to a plain
 *  token so it can be interpolated safely and a garbage value is a 400. */
function statusFilter(request: FastifyRequest): string | null {
  const query = (request.query ?? {}) as Record<string, unknown>
  const raw = query['filter[status]'] ?? (query.filter as Record<string, unknown> | undefined)?.status
  if (raw === undefined || raw === '') return null
  if (typeof raw !== 'string' || !/^[a-z_]+$/.test(raw)) {
    throw badRequest('An invoice status filter must be a lowercase token.', 'filter[status]')
  }
  return raw
}

/** The driver returns bigint sums as strings and counts as numbers; both come
 *  back here as a plain number of halalas. A null (no rows) reads as zero. */
function num(value: number | string | null | undefined): number {
  if (value == null) return 0
  return typeof value === 'number' ? value : Number(value)
}


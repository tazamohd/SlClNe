import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { parseSar } from '@/components/ui/Money'
import { WorkshopEstimate } from '@/screens/workshop/WorkshopEstimate'
import { InvoiceCreate } from '@/screens/finance/InvoiceCreate'
import { Payments } from '@/screens/finance/Payments'
import { JournalEntries } from '@/screens/accounting/Accounting'
import { Opportunities } from '@/screens/crm/Crm'
import { FinancialReports } from '@/screens/accounting/Reports'
import {
  ACCOUNTS_COA,
  EXPENSES_DATA,
  INVOICES,
  JOURNAL_ENTRIES,
  OPPORTUNITIES,
} from '@/data/generated/tables'
import { renderScreen } from '../helpers/render'

/** Derived figures.
 *
 *  Every assertion here compares one thing the screen shows against another
 *  thing the same screen shows — the footer against its own rows, the headline
 *  against the table beneath it. Restating the arithmetic as a constant would
 *  only prove that this file and the screen were typed by the same person; the
 *  failure worth catching is a total that stops agreeing with its line items.
 */

const VAT_RATE = 0.15

/** The value rendered inside a StatCard, by its label. Labels repeat elsewhere
 *  on these screens — "Revenue" is both a headline stat and a bar in the P&L —
 *  so this picks the paragraph the metric card renders its figure in. */
function statValue(label: string): number {
  const labels = screen.getAllByText(label)
  // A feature-kit stat card puts the figure right after the label…
  const sibling = labels
    .map((node) => node.nextElementSibling)
    .find((node) => node instanceof HTMLElement && node.className.includes('font-display'))
  if (sibling) return parseSar(sibling.textContent ?? '')
  // …while a `KpiCard` holds the label in its header row and the figure in the
  // first paragraph of the tile below it.
  const tile = labels
    .map((node) => node.parentElement?.parentElement?.querySelector('p'))
    .find((node): node is HTMLParagraphElement => node instanceof HTMLParagraphElement)
  if (!tile) throw new Error(`no metric card labelled "${label}"`)
  return parseSar(tile.textContent ?? '')
}

/** The amount in a labelled summary row, with the label text removed first so
 *  a label like "VAT (15%)" cannot contribute its own digits. */
function summaryAmount(container: HTMLElement, label: string): number {
  const row = within(container).getByText(label).parentElement
  return parseSar((row?.textContent ?? '').replace(label, ''))
}

/** Balance of every account of one type in the seeded chart of accounts. */
function accountTotal(type: string): number {
  return ACCOUNTS_COA.filter((account) => account.type === type).reduce(
    (sum, account) => sum + parseSar(account.balance),
    0
  )
}

/** The money column of every body row in a table. Defaults to the last cell;
 *  the invoice table keeps a remove button in that position. */
function lineTotals(table: HTMLTableElement, column = -1): number[] {
  return [...table.querySelectorAll('tbody tr')].map((row) => {
    const cell = column < 0 ? row.lastElementChild : row.children[column]
    return parseSar(cell?.textContent ?? '')
  })
}

describe('estimate totals', () => {
  it('derives the subtotal from the parts and labour lines it renders', () => {
    const { container } = renderScreen(WorkshopEstimate, { role: 'owner' })
    const tables = [...container.querySelectorAll('table')] as HTMLTableElement[]
    expect(tables).toHaveLength(2)

    const lines = tables.flatMap((table) => lineTotals(table))
    expect(lines).toHaveLength(7)
    expect(lines.every((amount) => amount > 0)).toBe(true)

    const summed = lines.reduce((total, amount) => total + amount, 0)
    expect(summaryAmount(container, 'Subtotal')).toBeCloseTo(summed, 2)
  })

  it('adds 15% ZATCA VAT and carries it into the grand total', () => {
    const { container } = renderScreen(WorkshopEstimate, { role: 'owner' })
    const subtotal = summaryAmount(container, 'Subtotal')
    const vat = summaryAmount(container, 'VAT (15%)')
    const grand = summaryAmount(container, 'Grand Total')

    expect(vat).toBeCloseTo(subtotal * VAT_RATE, 2)
    expect(grand).toBeCloseTo(subtotal + vat, 2)
    expect(grand).toBeGreaterThan(subtotal)
  })

  it('multiplies each labour line by its own hours and rate', () => {
    const { container } = renderScreen(WorkshopEstimate, { role: 'owner' })
    const labour = ([...container.querySelectorAll('table')] as HTMLTableElement[])[1]
    for (const row of labour.querySelectorAll('tbody tr')) {
      const cells = [...row.children].map((cell) => cell.textContent ?? '')
      const hours = Number.parseFloat(cells[1])
      const rate = Number.parseFloat(cells[2].replace(/[^\d.]/g, ''))
      expect(parseSar(cells[3])).toBeCloseTo(hours * rate, 2)
    }
  })

  it('offers approval to a role within its ceiling and escalation to one below it', () => {
    const { container, unmount } = renderScreen(WorkshopEstimate, { role: 'advisor' })
    const grand = summaryAmount(container, 'Grand Total')
    expect(grand).toBeLessThan(5_000)
    expect(screen.queryByText(/Above your approval limit/)).not.toBeInTheDocument()
    unmount()

    renderScreen(WorkshopEstimate, { role: 'technician' })
    expect(
      screen.getByText(/Your role cannot approve estimates/)
    ).toBeInTheDocument()
  })
})

describe('invoice recompute', () => {
  it('drops exactly the removed line from the subtotal, VAT and total', async () => {
    const user = userEvent.setup()
    const { container } = renderScreen(InvoiceCreate, { role: 'accountant' })
    const summary = screen.getByText('Invoice Summary').parentElement as HTMLElement

    const table = container.querySelector('table') as HTMLTableElement
    const before = lineTotals(table, 3)
    const subtotalBefore = summaryAmount(summary, 'Subtotal')
    expect(subtotalBefore).toBeCloseTo(
      before.reduce((total, amount) => total + amount, 0),
      2
    )

    const removed = before[0]
    expect(removed).toBeGreaterThan(0)
    await user.click(screen.getAllByRole('button', { name: /^Remove:/ })[0])

    const after = lineTotals(container.querySelector('table') as HTMLTableElement, 3)
    expect(after).toHaveLength(before.length - 1)

    const subtotalAfter = summaryAmount(summary, 'Subtotal')
    expect(subtotalAfter).toBeCloseTo(subtotalBefore - removed, 2)
    expect(summaryAmount(summary, 'VAT (15%)')).toBeCloseTo(subtotalAfter * VAT_RATE, 2)
    expect(summaryAmount(summary, 'Total')).toBeCloseTo(subtotalAfter * (1 + VAT_RATE), 2)
  })

  it('recomputes when a quantity changes, not only when a line goes', async () => {
    const user = userEvent.setup()
    const { container } = renderScreen(InvoiceCreate, { role: 'accountant' })
    const summary = screen.getByText('Invoice Summary').parentElement as HTMLElement
    const before = summaryAmount(summary, 'Subtotal')

    const table = container.querySelector('table') as HTMLTableElement
    const firstRow = table.querySelector('tbody tr') as HTMLTableRowElement
    const unit = parseSar((firstRow.children[3].textContent ?? ''))
    const qty = within(firstRow).getByLabelText('Qty')

    await user.clear(qty)
    await user.type(qty, '3')

    expect(summaryAmount(summary, 'Subtotal')).toBeCloseTo(before - unit + unit * 3, 2)
  })

  it('adds an empty line without moving the total', async () => {
    const user = userEvent.setup()
    const { container } = renderScreen(InvoiceCreate, { role: 'accountant' })
    const summary = screen.getByText('Invoice Summary').parentElement as HTMLElement
    const before = summaryAmount(summary, 'Total')
    const rows = (container.querySelector('table') as HTMLTableElement).querySelectorAll('tbody tr')

    await user.click(screen.getByRole('button', { name: /Add Line/ }))

    const table = container.querySelector('table') as HTMLTableElement
    expect(table.querySelectorAll('tbody tr')).toHaveLength(rows.length + 1)
    expect(summaryAmount(summary, 'Total')).toBeCloseTo(before, 2)
  })

  it('refuses to send an invoice with nothing on it', async () => {
    const user = userEvent.setup()
    const { container } = renderScreen(InvoiceCreate, { role: 'accountant' })
    for (const button of screen.getAllByRole('button', { name: /^Remove:/ })) {
      await user.click(button)
    }
    const summary = screen.getByText('Invoice Summary').parentElement as HTMLElement
    expect(summaryAmount(summary, 'Subtotal')).toBe(0)
    expect((container.querySelector('table') as HTMLTableElement).querySelectorAll('tbody tr'))
      .toHaveLength(0)

    await user.click(screen.getByRole('button', { name: /Issue invoice/ }))
    expect(await screen.findByText(/Add at least one line item/)).toBeInTheDocument()
  })
})

describe('ledger balance', () => {
  it('sums debits and credits from the entries and reports the batch balanced', async () => {
    const { container } = renderScreen(JournalEntries, { role: 'accountant' })
    // Wait for the repository read, not for a figure: the skeleton rows would
    // otherwise be counted as entries.
    await screen.findByText(JOURNAL_ENTRIES[0].narration)
    expect(screen.getByText('Ledger is balanced')).toBeInTheDocument()

    const rows = [
      ...(container.querySelector('table') as HTMLTableElement).querySelectorAll('tbody tr'),
    ]
    expect(rows).toHaveLength(JOURNAL_ENTRIES.length)

    // Debit and credit are the 5th and 6th columns.
    const debit = rows.reduce((total, row) => total + parseSar(row.children[4].textContent ?? ''), 0)
    const credit = rows.reduce(
      (total, row) => total + parseSar(row.children[5].textContent ?? ''),
      0
    )
    expect(debit).toBeCloseTo(credit, 2)

    const banner = screen.getByText('Ledger is balanced').parentElement as HTMLElement
    const figures = (banner.textContent ?? '').match(/SAR [\d,]+\.\d\d/g) ?? []
    expect(figures).toHaveLength(2)
    expect(parseSar(figures[0])).toBeCloseTo(debit, 2)
    expect(parseSar(figures[1])).toBeCloseTo(credit, 2)
  })

  it('reports the report and the ledger the same revenue figure', async () => {
    renderScreen(FinancialReports, { role: 'accountant' })
    const revenue = accountTotal('Revenue')
    const expense = accountTotal('Expense')
    await screen.findByText(EXPENSES_DATA[0].category)
    expect(statValue('Revenue')).toBeCloseTo(revenue, 2)
    expect(statValue('Expenses')).toBeCloseTo(expense, 2)
    expect(statValue('Net Profit')).toBeCloseTo(revenue - expense, 2)
  })

  it('derives receivable from the invoices that are not paid', async () => {
    renderScreen(FinancialReports, { role: 'accountant' })
    await screen.findByText(EXPENSES_DATA[0].category)
    const unpaid = INVOICES.filter((invoice) => invoice.status !== 'paid').reduce(
      (total, invoice) => total + parseSar(invoice.amount),
      0
    )
    expect(statValue('Receivable')).toBeCloseTo(unpaid, 2)
    expect(unpaid).toBeGreaterThan(0)
  })

  it('says out loud that the seeded balance sheet does not balance', async () => {
    // DEFECT (reported, not fixed): the design's account balances were written
    // to look plausible, not to satisfy Assets = Liabilities + Equity. They are
    // out by SAR 257,050. The screen is honest about it rather than hiding the
    // gap, and this pins that behaviour: when the seed data is replaced with a
    // balanced set the warning must disappear, and this test says so.
    renderScreen(FinancialReports, { role: 'accountant' })
    await screen.findByText(EXPENSES_DATA[0].category)

    const assets = accountTotal('Assets')
    const claims = accountTotal('Liabilities') + accountTotal('Equity')
    expect(Math.abs(claims - assets)).toBeCloseTo(257_050, 2)
    expect(
      screen.getByText('Assets do not equal liabilities plus equity in the seeded ledger.')
    ).toBeInTheDocument()
  })
})

describe('collections and pipeline', () => {
  it('splits outstanding from collected using the invoice status, not a fixed figure', async () => {
    renderScreen(Payments, { role: 'accountant' })
    await screen.findByText(INVOICES[0].cust)

    const paid = INVOICES.filter((invoice) => invoice.status === 'paid')
    const owed = INVOICES.filter((invoice) => invoice.status !== 'paid')
    const sum = (rows: typeof INVOICES) =>
      rows.reduce((total, invoice) => total + parseSar(invoice.amount), 0)

    expect(statValue('Outstanding')).toBeCloseTo(sum(owed), 2)
    expect(statValue('Collected')).toBeCloseTo(sum(paid), 2)
    // The design's own headline figures (8,090 / 61,420) contradicted the rows
    // printed under them; these must not come back.
    expect(statValue('Outstanding')).not.toBe(8_090)
    expect(statValue('Collected')).not.toBe(61_420)
    expect(statValue('Outstanding') + statValue('Collected')).toBeCloseTo(sum(INVOICES), 2)
  })

  it('weights the pipeline by probability, so the forecast sits below the gross', async () => {
    const { container } = renderScreen(Opportunities, { role: 'owner' })
    await screen.findByText(OPPORTUNITIES[0].company)

    const gross = statValue('Gross Pipeline')
    const weighted = statValue('Weighted Forecast')
    expect(weighted).toBeLessThan(gross)
    expect(gross).toBeCloseTo(
      OPPORTUNITIES.reduce((total, o) => total + parseSar(o.value), 0),
      2
    )

    // The weighted column on each row must add up to the headline forecast.
    const rows = [
      ...(container.querySelector('table') as HTMLTableElement).querySelectorAll('tbody tr'),
    ]
    expect(rows).toHaveLength(OPPORTUNITIES.length)
    const perRow = rows.map((row) => {
      const probability = Number.parseInt(row.children[4].textContent ?? '', 10) / 100
      return parseSar(row.children[2].textContent ?? '') * probability
    })
    expect(weighted).toBeCloseTo(
      perRow.reduce((total, amount) => total + amount, 0),
      2
    )
    for (const [index, row] of rows.entries()) {
      expect(parseSar(row.children[5].textContent ?? '')).toBeCloseTo(perRow[index], 2)
    }
  })

  it('averages the deal size over the opportunities it actually has', async () => {
    renderScreen(Opportunities, { role: 'owner' })
    await screen.findByText(OPPORTUNITIES[0].company)
    expect(statValue('Average Deal')).toBeCloseTo(
      statValue('Gross Pipeline') / OPPORTUNITIES.length,
      2
    )
  })
})

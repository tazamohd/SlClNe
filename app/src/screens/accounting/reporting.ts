/** Shared machinery for the reporting screens.
 *
 *  ── The one rule these helpers exist to keep ─────────────────────────────
 *
 *  A report shows figures; it does not invent them. Every money figure a report
 *  renders is a value the **server** computed — an invoice's `totalHalalas`, an
 *  account's `balanceHalalas`, a payment's `amountHalalas` — displayed as-is.
 *  Nothing here sums a column of money to manufacture a period total, because a
 *  read is paginated: a browser that adds up the rows it happens to hold is
 *  adding up one page and calling it the year. The server owns aggregates and
 *  does not expose them yet (there is no `GET …/summary` in the registry), so a
 *  report that needs a cross-row total says so — see `AGGREGATE_GAP` — rather
 *  than printing arithmetic it cannot stand behind. This is the §A10 line:
 *  the server computes, the client displays.
 *
 *  What the client *may* do, and all these helpers do, is: filter the rows it
 *  was given, count them, sort them, chart one server figure per row, and hand
 *  the visible rows back as CSV. None of that is a financial calculation.
 */

/** The financial aggregate a report would ask the server for, and cannot. One
 *  string per screen so the gap notice and its GAP: test name the same thing. */
export const AGGREGATE_GAP = {
  /** No endpoint sums invoice revenue for a period. */
  sales: 'GET /invoices/summary (period revenue, VAT and receivable totals)',
  /** No endpoint returns a VAT-return figure. */
  tax: 'GET /accounting/tax/return (output VAT for a filing period)',
  /** No endpoint returns a trial balance or P&L roll-up. */
  ledger: 'GET /accounting/reports/trial-balance (debit/credit and P&L roll-up)',
} as const

/* --------------------------------------------------------------- date range */

/** A row as any collection presents it: entity metadata plus display fields. */
type DatedRow = Record<string, unknown>

/** The best ISO instant a row carries, or null when it carries none.
 *
 *  Server rows always have `_createdAt`; issued invoices also carry `issuedAt`,
 *  which is the date that matters for a revenue report, so it wins. Design-bundle
 *  fixtures predate both columns and return null — a null date is *kept* by the
 *  range filter rather than dropped, because "this row has no date" must not read
 *  as "this row is outside your range". */
export function rowDateIso(row: DatedRow, preferred?: string): string | null {
  const candidates = [preferred, 'issuedAt', '_createdAt', 'receiptDate']
  for (const key of candidates) {
    if (!key) continue
    const value = row[key]
    if (typeof value === 'string' && value) {
      const iso = value.length === 10 ? `${value}T00:00:00Z` : value
      const parsed = Date.parse(iso)
      if (!Number.isNaN(parsed)) return new Date(parsed).toISOString()
    }
  }
  return null
}

/** True when `iso` falls within `[from, to]` inclusive. An empty bound is open;
 *  a null date passes, so a fixture row with no timestamp is never filtered out
 *  by a range it cannot be measured against. `from`/`to` are `YYYY-MM-DD`. */
export function inDateRange(iso: string | null, from: string, to: string): boolean {
  if (!iso) return true
  const day = iso.slice(0, 10)
  if (from && day < from) return false
  if (to && day > to) return false
  return true
}

/* ---------------------------------------------------------------------- CSV */

/** One cell, escaped for RFC-4180: quote when it holds a comma, quote or
 *  newline, and double any embedded quote. Everything is coerced to string
 *  first so a number or a boolean cannot slip through unquoted-but-unsafe. */
function csvCell(value: unknown): string {
  const text = value == null ? '' : String(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** A CSV document from a header row and body rows. Pure — returns the text so a
 *  test can assert on it without a DOM. The rows passed in are the ones already
 *  on screen, so the export and the table can never disagree. */
export function toCsv(headers: readonly string[], rows: readonly (readonly unknown[])[]): string {
  const lines = [headers.map(csvCell).join(',')]
  for (const row of rows) lines.push(row.map(csvCell).join(','))
  return lines.join('\r\n')
}

/** Hands a CSV to the browser as a download, or returns false where the
 *  platform cannot (a sandbox with no `createObjectURL`, a test in jsdom). The
 *  caller decides what to tell the user; this never throws. */
export function downloadCsv(filename: string, csv: string): boolean {
  if (typeof document === 'undefined') return false
  const url = globalThis.URL ?? window.URL
  if (typeof url?.createObjectURL !== 'function') return false
  try {
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' })
    const href = url.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    url.revokeObjectURL(href)
    return true
  } catch {
    return false
  }
}

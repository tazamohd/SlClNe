import { describe, expect, it } from 'vitest'
import {
  AGGREGATE_GAP,
  inDateRange,
  rowDateIso,
  toCsv,
} from '@/screens/accounting/reporting'

/** The reporting helpers, proven where they earn their keep: the CSV escaping a
 *  spreadsheet trusts, the date filter that must not drop an undated fixture
 *  row, and the row-date resolution that prefers the date a revenue report
 *  cares about. */

describe('toCsv', () => {
  it('escapes commas, quotes and newlines per RFC-4180', () => {
    const csv = toCsv(
      ['Invoice', 'Customer'],
      [
        ['INV-1', 'Ahmed, Al-Rashid'],
        ['INV-2', 'A "quoted" name'],
        ['INV-3', 'line\nbreak'],
      ],
    )
    const lines = csv.split('\r\n')
    expect(lines[0]).toBe('Invoice,Customer')
    expect(lines[1]).toBe('INV-1,"Ahmed, Al-Rashid"')
    expect(lines[2]).toBe('INV-2,"A ""quoted"" name"')
    // The embedded newline is inside the quoted cell, so the record spans lines.
    expect(csv).toContain('"line\nbreak"')
  })

  it('coerces non-strings without dropping them', () => {
    expect(toCsv(['n'], [[0], [false], [null]])).toBe('n\r\n0\r\nfalse\r\n')
  })
})

describe('inDateRange', () => {
  it('keeps a row with no date rather than filtering it out', () => {
    // A fixture row carries no timestamp; a range it cannot be measured against
    // must not silently exclude it.
    expect(inDateRange(null, '2026-01-01', '2026-12-31')).toBe(true)
  })

  it('is inclusive on both bounds and open when a bound is empty', () => {
    expect(inDateRange('2026-07-14T09:00:00.000Z', '2026-07-14', '2026-07-14')).toBe(true)
    expect(inDateRange('2026-07-13T09:00:00.000Z', '2026-07-14', '')).toBe(false)
    expect(inDateRange('2026-07-15T09:00:00.000Z', '', '2026-07-14')).toBe(false)
    expect(inDateRange('2026-07-15T09:00:00.000Z', '', '')).toBe(true)
  })
})

describe('rowDateIso', () => {
  it('prefers issuedAt — the date a revenue report is about — over createdAt', () => {
    const iso = rowDateIso({ issuedAt: '2026-07-14T09:00:00.000Z', _createdAt: '2026-01-01T00:00:00.000Z' })
    expect(iso).toBe('2026-07-14T09:00:00.000Z')
  })

  it('reads a preferred key, then a plain date column', () => {
    expect(rowDateIso({ receiptDate: '2026-07-22' }, 'receiptDate')?.slice(0, 10)).toBe('2026-07-22')
    expect(rowDateIso({ _createdAt: '2026-03-03T00:00:00.000Z' })?.slice(0, 10)).toBe('2026-03-03')
  })

  it('returns null when no column parses to a date', () => {
    expect(rowDateIso({ status: 'paid' })).toBeNull()
    expect(rowDateIso({ issuedAt: 'not a date' })).toBeNull()
  })
})

describe('AGGREGATE_GAP', () => {
  it('names a server endpoint for each aggregate a report cannot compute itself', () => {
    // The gap notice and its GAP: test cite the same string; this pins that the
    // strings exist and read as endpoints, not prose.
    expect(AGGREGATE_GAP.sales).toMatch(/^GET /)
    expect(AGGREGATE_GAP.tax).toMatch(/^GET /)
    expect(AGGREGATE_GAP.ledger).toMatch(/^GET /)
  })
})

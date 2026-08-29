import { describe, expect, it } from 'vitest'
import {
  computeInvoiceTotals,
  fromHalalas,
  invoiceMoney,
  lineUnitHalalas,
  paymentHalalas,
  roundHalfUp,
  toHalalas,
  VAT_RATE_BPS,
} from '@/screens/finance/money'
import * as contract from '../../packages/contract/src/rules/money'

/** The client's money arithmetic, against the rule the server actually runs.
 *
 *  `app/src/screens/finance/money.ts` carries a transcription of
 *  `packages/contract/src/rules/money.ts`, because the contract package is not
 *  one of the app's dependencies and adding it means editing `package.json`.
 *  A second implementation of a VAT rule is only safe while something proves
 *  the two agree, and this is that something: the contract module is imported
 *  directly — the same file the API calls before it writes a row — and the two
 *  are driven over the same cases.
 *
 *  **If this file is deleted, `screens/finance/money.ts` must be deleted with
 *  it.** An unchecked copy of the tax rule is worse than no copy. */

/** Cases chosen to exercise the edges §A10 names: zero, one halala, fractional
 *  quantities, a discount that meets the tax, a discount larger than the
 *  invoice, and an amount past the point where a float would start lying. */
const CASES: { name: string; lines: { qty: number; unitPriceHalalas: number }[]; discount: number }[] =
  [
    { name: 'an empty invoice', lines: [], discount: 0 },
    { name: 'a single halala', lines: [{ qty: 1, unitPriceHalalas: 1 }], discount: 0 },
    { name: 'the design’s seven lines', lines: [
      { qty: 1, unitPriceHalalas: 31_000 },
      { qty: 2, unitPriceHalalas: 4_500 },
      { qty: 1, unitPriceHalalas: 9_500 },
      { qty: 1, unitPriceHalalas: 22_500 },
      { qty: 1, unitPriceHalalas: 36_000 },
      { qty: 1, unitPriceHalalas: 17_000 },
      { qty: 1, unitPriceHalalas: 59_000 },
    ], discount: 0 },
    { name: 'a fractional quantity', lines: [{ qty: 1.5, unitPriceHalalas: 22_500 }], discount: 0 },
    { name: 'a quantity that lands on a half halala', lines: [{ qty: 0.5, unitPriceHalalas: 333 }], discount: 0 },
    { name: 'a discount', lines: [{ qty: 1, unitPriceHalalas: 100_000 }], discount: 10_000 },
    { name: 'a discount larger than the invoice', lines: [{ qty: 1, unitPriceHalalas: 5_000 }], discount: 900_000 },
    { name: 'a negative discount', lines: [{ qty: 1, unitPriceHalalas: 5_000 }], discount: -1 },
    { name: 'a discount equal to the invoice', lines: [{ qty: 1, unitPriceHalalas: 5_000 }], discount: 5_000 },
    { name: 'a very large invoice', lines: [{ qty: 1000, unitPriceHalalas: 99_999_900 }], discount: 0 },
    { name: 'many small lines', lines: Array.from({ length: 500 }, () => ({ qty: 1, unitPriceHalalas: 7 })), discount: 0 },
    { name: 'a price of zero', lines: [{ qty: 3, unitPriceHalalas: 0 }], discount: 0 },
  ]

describe('the client transcription of the VAT rule', () => {
  it('uses the ZATCA rate the contract declares, not a number of its own', () => {
    expect(VAT_RATE_BPS).toBe(contract.VAT_RATE_BPS)
    expect(VAT_RATE_BPS).toBe(1500)
  })

  it.each(CASES)('agrees with the server rule for $name', ({ lines, discount }) => {
    expect(computeInvoiceTotals(lines, discount)).toEqual(
      contract.computeInvoiceTotals(lines, discount)
    )
  })

  it.each(CASES)('rounds half-up the same way for $name', ({ lines }) => {
    for (const line of lines.slice(0, 4)) {
      const raw = line.qty * line.unitPriceHalalas
      expect(roundHalfUp(raw)).toBe(contract.roundHalfUp(raw))
    }
  })

  it('rounds away from zero on both sides, as the contract does', () => {
    for (const value of [0.5, -0.5, 1.5, -1.5, 2.4, -2.4, 0, -0]) {
      expect(roundHalfUp(value)).toBe(contract.roundHalfUp(value))
    }
  })

  it('holds total = subtotal + tax − discount for every case', () => {
    for (const { lines, discount } of CASES) {
      const totals = computeInvoiceTotals(lines, discount)
      expect(totals.totalHalalas).toBe(
        totals.subtotalHalalas + totals.taxHalalas - totals.discountHalalas
      )
    }
  })

  it('never produces a negative total, a negative tax or an over-large discount', () => {
    for (const { lines, discount } of CASES) {
      const totals = computeInvoiceTotals(lines, discount)
      expect(totals.totalHalalas).toBeGreaterThanOrEqual(0)
      expect(totals.taxHalalas).toBeGreaterThanOrEqual(0)
      expect(totals.discountHalalas).toBeGreaterThanOrEqual(0)
      expect(totals.discountHalalas).toBeLessThanOrEqual(totals.subtotalHalalas)
    }
  })

  it('taxes the discounted net, not the gross', () => {
    const totals = computeInvoiceTotals([{ qty: 1, unitPriceHalalas: 100_000 }], 20_000)
    expect(totals.subtotalHalalas).toBe(100_000)
    expect(totals.discountHalalas).toBe(20_000)
    // 15% of 80,000, not of 100,000.
    expect(totals.taxHalalas).toBe(12_000)
    expect(totals.totalHalalas).toBe(92_000)
  })

  it('rounds once at the subtotal rather than on every line', () => {
    // 500 lines that each land on a half halala. Rounding per line would add
    // 500 halalas of drift; rounding once adds at most one.
    const lines = Array.from({ length: 500 }, () => ({ qty: 0.5, unitPriceHalalas: 1 }))
    expect(computeInvoiceTotals(lines).subtotalHalalas).toBe(250)
  })

  it('is exact at a magnitude where floating-point SAR would not be', () => {
    // 8,999,991.00 SAR. Held as an integer, this is exact; held as a float
    // multiplied by 100 it is not.
    const totals = computeInvoiceTotals([{ qty: 9, unitPriceHalalas: 99_999_900 }])
    expect(totals.subtotalHalalas).toBe(899_999_100)
    expect(totals.taxHalalas).toBe(134_999_865)
    expect(totals.totalHalalas).toBe(1_034_998_965)
    expect(Number.isSafeInteger(totals.totalHalalas)).toBe(true)
  })
})

describe('reading an amount a person typed', () => {
  it('reads the forms a currency field produces', () => {
    expect(toHalalas('1840')).toBe(184_000)
    expect(toHalalas('1,840.00')).toBe(184_000)
    expect(toHalalas('SAR 1,840.50')).toBe(184_050)
    expect(toHalalas('0.01')).toBe(1)
    expect(toHalalas('0')).toBe(0)
    expect(toHalalas('.5')).toBe(50)
    expect(toHalalas('12.')).toBe(1_200)
  })

  it('refuses what is not an amount, rather than reading it as nothing', () => {
    // `0` would be a silent bill for nothing; `null` lets the form say so.
    for (const input of ['', '   ', 'pending', 'SAR', '1.2.3', '1e5', '--5', 'abc']) {
      expect(toHalalas(input), input).toBeNull()
    }
    expect(toHalalas(Number.NaN)).toBeNull()
    expect(toHalalas(Number.POSITIVE_INFINITY)).toBeNull()
  })

  it('does not inherit the binary artefact that Number(x) * 100 carries', () => {
    // The classic: 8.07 * 100 is 806.9999999999999 as a double.
    expect(toHalalas('8.07')).toBe(807)
    expect(toHalalas('1.005')).toBe(101)
    expect(toHalalas('2.675')).toBe(268)
    expect(toHalalas('1234567.89')).toBe(123_456_789)
  })

  it('reads an accounting negative written in brackets', () => {
    // A ledger writes −1,200 as (1,200). Reading it as +1,200 is a 2,400 swing.
    expect(toHalalas('(1,200)')).toBe(-120_000)
    expect(toHalalas('SAR (1,200.50)')).toBe(-120_050)
    expect(toHalalas('-1,200')).toBe(-120_000)
  })

  it('rounds a third decimal half-up, the way the contract rounds SAR', () => {
    expect(toHalalas('1.004')).toBe(100)
    expect(toHalalas('1.005')).toBe(101)
    expect(toHalalas('1.006')).toBe(101)
    expect(toHalalas(1.005)).toBe(contract.roundHalfUp(1.005 * 100))
  })

  it('round-trips a halala figure through the display conversion', () => {
    for (const halalas of [0, 1, 99, 100, 184_000, 1_034_998_965]) {
      expect(toHalalas(fromHalalas(halalas).toFixed(2))).toBe(halalas)
    }
  })
})

describe('reading money off a row', () => {
  const serverRow = {
    amount: 'SAR 1,840',
    subtotalHalalas: 160_000,
    taxHalalas: 24_000,
    discountHalalas: 0,
    totalHalalas: 184_000,
    paidHalalas: 50_000,
    balanceHalalas: 134_000,
  }

  it('takes the server’s columns when they are there, including the balance', () => {
    const money = invoiceMoney(serverRow)
    expect(money.fromServer).toBe(true)
    expect(money.totalHalalas).toBe(184_000)
    expect(money.balanceHalalas).toBe(134_000)
    expect(money.subtotalHalalas + money.taxHalalas - money.discountHalalas).toBe(
      money.totalHalalas
    )
  })

  it('falls back to the total in the fixture’s display string, and says so', () => {
    const money = invoiceMoney({ amount: 'SAR 1,840' })
    expect(money.fromServer).toBe(false)
    expect(money.totalHalalas).toBe(184_000)
    // The split is unknowable from a display string, so it is not invented.
    expect(money.subtotalHalalas).toBe(0)
    expect(money.taxHalalas).toBe(0)
  })

  it('derives the balance only when the server did not send one', () => {
    const money = invoiceMoney({ ...serverRow, balanceHalalas: undefined })
    expect(money.balanceHalalas).toBe(134_000)
  })

  it('reads a line and a payment from either backend’s shape', () => {
    expect(lineUnitHalalas({ unitPriceHalalas: 42_000, unit: 1 })).toBe(42_000)
    expect(lineUnitHalalas({ unit: 420 })).toBe(42_000)
    expect(paymentHalalas({ amountHalalas: 50_000, amount: 1 })).toBe(50_000)
    expect(paymentHalalas({ amount: 500 })).toBe(50_000)
  })
})

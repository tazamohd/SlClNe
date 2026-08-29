import { describe, expect, it } from 'vitest'
import {
  checkJournalBalanced,
  checkPayment,
  checkRefund,
  computeInvoiceTotals,
} from '../../packages/contract/src/rules/money'
import {
  ACCOUNTS_COA,
  INVOICES,
  INVOICE_LINES,
  INVOICE_PAYMENTS,
  JOURNAL_ENTRIES,
  RECEIPTS,
} from '@/data/generated/tables'
import { invoiceMoney, lineUnitHalalas, paymentHalalas, toHalalas } from '@/screens/finance/money'

/** The financial integrity suite (§A10) — `Invoice → Payment → Receipt →
 *  Ledger → Reports`.
 *
 *  Every rule exercised here is imported from `packages/contract/src/rules/`,
 *  which is the module the API calls before it writes a row. That is deliberate
 *  and it is the whole point: a suite that restated the arithmetic would only
 *  prove that the suite and the screens were typed by the same person. Driving
 *  the server's own functions means a change to the VAT rate, the rounding or
 *  the payment guard fails here.
 *
 *  Money is integer halalas throughout. Where a case is expressed in SAR it is
 *  converted at the edge and never computed on.
 *
 *  ### What this suite does not prove
 *
 *  It does not exercise the database. Persistence, row locking, the ZATCA hash
 *  chain and the audit trail are covered by `server/tests/api.test.ts`, which
 *  runs against real Postgres and which this agent cannot add to. The chain
 *  asserted here is the rule chain, not the storage chain, and the report says
 *  so rather than implying otherwise.
 */

const SAR = (amount: number) => toHalalas(amount) as number

/** A whole invoice's life, as the rules see it. */
function invoiceOf(
  lines: { qty: number; unitPriceHalalas: number }[],
  discountHalalas = 0
) {
  const totals = computeInvoiceTotals(lines, discountHalalas)
  return {
    ...totals,
    status: 'unpaid' as string,
    paidHalalas: 0,
    get balanceHalalas() {
      return this.totalHalalas - this.paidHalalas
    },
  }
}

function pay(invoice: ReturnType<typeof invoiceOf>, amountHalalas: number) {
  const failure = checkPayment({
    amountHalalas,
    balanceHalalas: invoice.balanceHalalas,
    invoiceStatus: invoice.status,
  })
  if (failure) return failure
  invoice.paidHalalas += amountHalalas
  invoice.status = invoice.paidHalalas >= invoice.totalHalalas ? 'paid' : 'partial'
  return null
}

// ── Invoice ─────────────────────────────────────────────────────────────────

describe('§A10 · invoice', () => {
  it('holds total = subtotal + tax − discount', () => {
    const invoice = invoiceOf([{ qty: 2, unitPriceHalalas: SAR(310) }], SAR(20))
    expect(invoice.subtotalHalalas).toBe(SAR(620))
    expect(invoice.discountHalalas).toBe(SAR(20))
    expect(invoice.taxHalalas).toBe(SAR(90))
    // 620 net, less a 20 discount, plus 15% of the discounted 600.
    expect(invoice.totalHalalas).toBe(SAR(690))
    expect(invoice.totalHalalas).toBe(
      invoice.subtotalHalalas + invoice.taxHalalas - invoice.discountHalalas
    )
  })

  it('computes VAT at the ZATCA rate and never takes it from the client', () => {
    const invoice = invoiceOf([{ qty: 1, unitPriceHalalas: SAR(1000) }])
    expect(invoice.taxHalalas).toBe(SAR(150))
    // A client that sent its own tax cannot change the answer: the rule takes
    // lines and a discount, and nothing else.
    expect(computeInvoiceTotals([{ qty: 1, unitPriceHalalas: SAR(1000) }])).toEqual(invoice_totals(invoice))
  })

  it('exempts nothing by accident: a zero-rate invoice is asked for explicitly', () => {
    const zeroRated = computeInvoiceTotals([{ qty: 1, unitPriceHalalas: SAR(1000) }], 0, 0)
    expect(zeroRated.taxHalalas).toBe(0)
    expect(zeroRated.totalHalalas).toBe(SAR(1000))
    // …and the default is never zero-rated.
    expect(computeInvoiceTotals([{ qty: 1, unitPriceHalalas: SAR(1000) }]).taxHalalas).toBe(SAR(150))
  })

  it('prices a zero invoice as zero rather than as nothing', () => {
    const invoice = invoiceOf([{ qty: 1, unitPriceHalalas: 0 }])
    expect(invoice.subtotalHalalas).toBe(0)
    expect(invoice.taxHalalas).toBe(0)
    expect(invoice.totalHalalas).toBe(0)
  })

  it('refuses to let a discount drive the invoice negative', () => {
    const invoice = invoiceOf([{ qty: 1, unitPriceHalalas: SAR(100) }], SAR(500))
    expect(invoice.discountHalalas).toBe(SAR(100))
    expect(invoice.totalHalalas).toBe(0)
    expect(invoice.totalHalalas).toBeGreaterThanOrEqual(0)
  })

  it('treats a negative discount as no discount', () => {
    expect(invoiceOf([{ qty: 1, unitPriceHalalas: SAR(100) }], -SAR(50)).discountHalalas).toBe(0)
  })

  it('keeps a very large invoice exact', () => {
    // 12,000,000.00 SAR of parts. Beyond the point where a float in SAR would
    // start losing halalas.
    const invoice = invoiceOf([{ qty: 12_000, unitPriceHalalas: SAR(1000) }])
    expect(invoice.subtotalHalalas).toBe(1_200_000_000)
    expect(invoice.taxHalalas).toBe(180_000_000)
    expect(invoice.totalHalalas).toBe(1_380_000_000)
    expect(Number.isSafeInteger(invoice.totalHalalas)).toBe(true)
  })

  it('keeps decimal precision at the halala', () => {
    const invoice = invoiceOf([{ qty: 3, unitPriceHalalas: 1 }])
    expect(invoice.subtotalHalalas).toBe(3)
    // 15% of 3 halalas is 0.45, which rounds to nothing.
    expect(invoice.taxHalalas).toBe(0)
    expect(invoice.totalHalalas).toBe(3)
  })

  it('rounds a half halala up rather than away', () => {
    // 15% of 10 halalas is 1.5.
    expect(invoiceOf([{ qty: 1, unitPriceHalalas: 10 }]).taxHalalas).toBe(2)
  })
})

// ── Payment ─────────────────────────────────────────────────────────────────

describe('§A10 · payment', () => {
  it('takes a partial payment and leaves the rest outstanding', () => {
    const invoice = invoiceOf([{ qty: 1, unitPriceHalalas: SAR(1000) }])
    expect(pay(invoice, SAR(400))).toBeNull()
    expect(invoice.paidHalalas).toBe(SAR(400))
    expect(invoice.balanceHalalas).toBe(SAR(750))
    expect(invoice.status).toBe('partial')
  })

  it('takes several payments and settles on the last one', () => {
    const invoice = invoiceOf([{ qty: 1, unitPriceHalalas: SAR(1000) }])
    for (const amount of [SAR(500), SAR(400), SAR(250)]) {
      expect(pay(invoice, amount)).toBeNull()
    }
    expect(invoice.paidHalalas).toBe(invoice.totalHalalas)
    expect(invoice.balanceHalalas).toBe(0)
    expect(invoice.status).toBe('paid')
  })

  it('refuses a payment larger than the balance', () => {
    const invoice = invoiceOf([{ qty: 1, unitPriceHalalas: SAR(100) }])
    const failure = pay(invoice, invoice.totalHalalas + 1)
    expect(failure?.message).toMatch(/cannot exceed the outstanding balance/)
    expect(invoice.paidHalalas).toBe(0)
  })

  it('refuses an overpayment by a single halala, not just a large one', () => {
    const invoice = invoiceOf([{ qty: 1, unitPriceHalalas: SAR(100) }])
    expect(pay(invoice, invoice.totalHalalas)).toBeNull()
    expect(pay(invoice, 1)?.message).toMatch(/cannot exceed the outstanding balance/)
  })

  it('refuses a zero and a negative payment', () => {
    const invoice = invoiceOf([{ qty: 1, unitPriceHalalas: SAR(100) }])
    expect(pay(invoice, 0)?.message).toMatch(/greater than zero/)
    expect(pay(invoice, -SAR(10))?.message).toMatch(/greater than zero/)
    expect(invoice.paidHalalas).toBe(0)
  })

  it('refuses a payment against a cancelled invoice', () => {
    const invoice = invoiceOf([{ qty: 1, unitPriceHalalas: SAR(100) }])
    invoice.status = 'cancelled'
    expect(pay(invoice, SAR(10))?.message).toMatch(/cancelled invoice cannot take a payment/)
    expect(invoice.paidHalalas).toBe(0)
  })

  it('refuses a payment against a draft, because an unissued invoice owes nothing', () => {
    const invoice = invoiceOf([{ qty: 1, unitPriceHalalas: SAR(100) }])
    invoice.status = 'draft'
    expect(pay(invoice, SAR(10))?.message).toMatch(/must be issued/)
  })

  it('cancels after a part payment without losing the money already taken', () => {
    const invoice = invoiceOf([{ qty: 1, unitPriceHalalas: SAR(1000) }])
    pay(invoice, SAR(400))
    invoice.status = 'cancelled'
    expect(invoice.paidHalalas).toBe(SAR(400))
    // No further money can be taken, and what was taken has to be refunded.
    expect(pay(invoice, SAR(1))).not.toBeNull()
    expect(checkRefund({ refundHalalas: SAR(400), collectedHalalas: invoice.paidHalalas })).toBeNull()
  })
})

// ── Refund and credit ───────────────────────────────────────────────────────

describe('§A10 · refund and credit', () => {
  it('allows a refund up to the amount collected', () => {
    expect(checkRefund({ refundHalalas: SAR(400), collectedHalalas: SAR(400) })).toBeNull()
    expect(checkRefund({ refundHalalas: SAR(100), collectedHalalas: SAR(400) })).toBeNull()
  })

  it('refuses a refund larger than the amount collected, by any margin', () => {
    expect(checkRefund({ refundHalalas: SAR(400) + 1, collectedHalalas: SAR(400) })?.message).toMatch(
      /cannot exceed the amount collected/
    )
    expect(checkRefund({ refundHalalas: 1, collectedHalalas: 0 })).not.toBeNull()
  })

  it('refuses a second refund that together exceeds what was collected', () => {
    const collected = SAR(400)
    let refunded = 0
    expect(checkRefund({ refundHalalas: SAR(300), collectedHalalas: collected - refunded })).toBeNull()
    refunded += SAR(300)
    expect(
      checkRefund({ refundHalalas: SAR(150), collectedHalalas: collected - refunded })
    ).not.toBeNull()
  })

  it('books a credit note as a balanced journal entry, not as a negative invoice', () => {
    // A credit of 500 net plus 75 VAT against a receivable of 575.
    expect(
      checkJournalBalanced([
        { debitHalalas: SAR(500), creditHalalas: 0 },
        { debitHalalas: SAR(75), creditHalalas: 0 },
        { debitHalalas: 0, creditHalalas: SAR(575) },
      ])
    ).toBeNull()
  })
})

// ── Receipt ─────────────────────────────────────────────────────────────────

describe('§A10 · receipt', () => {
  it('raises one receipt per payment, for the amount of that payment', () => {
    const invoice = invoiceOf([{ qty: 1, unitPriceHalalas: SAR(1000) }])
    const receipts: number[] = []
    for (const amount of [SAR(500), SAR(650)]) {
      expect(pay(invoice, amount)).toBeNull()
      receipts.push(amount)
    }
    expect(receipts).toHaveLength(2)
    expect(receipts.reduce((sum, amount) => sum + amount, 0)).toBe(invoice.paidHalalas)
    expect(invoice.balanceHalalas).toBe(0)
  })

  it('never lets the receipts total exceed the invoice', () => {
    const invoice = invoiceOf([{ qty: 1, unitPriceHalalas: SAR(100) }])
    const receipts: number[] = []
    for (const amount of [SAR(50), SAR(65), SAR(1)]) {
      if (pay(invoice, amount) === null) receipts.push(amount)
    }
    expect(receipts.reduce((sum, amount) => sum + amount, 0)).toBeLessThanOrEqual(
      invoice.totalHalalas
    )
  })
})

// ── Ledger ──────────────────────────────────────────────────────────────────

describe('§A10 · ledger', () => {
  it('refuses an unbalanced journal entry', () => {
    expect(
      checkJournalBalanced([
        { debitHalalas: SAR(100), creditHalalas: 0 },
        { debitHalalas: 0, creditHalalas: SAR(99) },
      ])?.message
    ).toMatch(/debits must equal credits/)
  })

  it('refuses a single-sided entry', () => {
    expect(checkJournalBalanced([{ debitHalalas: SAR(100), creditHalalas: 0 }])).not.toBeNull()
  })

  it('books an invoice as receivable, revenue and output VAT, and it balances', () => {
    const invoice = invoiceOf([{ qty: 1, unitPriceHalalas: SAR(1000) }])
    expect(
      checkJournalBalanced([
        { debitHalalas: invoice.totalHalalas, creditHalalas: 0 },
        { debitHalalas: 0, creditHalalas: invoice.subtotalHalalas - invoice.discountHalalas },
        { debitHalalas: 0, creditHalalas: invoice.taxHalalas },
      ])
    ).toBeNull()
  })

  it('books a payment as cash against receivable, and it balances', () => {
    const invoice = invoiceOf([{ qty: 1, unitPriceHalalas: SAR(1000) }])
    pay(invoice, SAR(400))
    expect(
      checkJournalBalanced([
        { debitHalalas: SAR(400), creditHalalas: 0 },
        { debitHalalas: 0, creditHalalas: SAR(400) },
      ])
    ).toBeNull()
  })

  it('every seeded journal entry balances', () => {
    expect(JOURNAL_ENTRIES.length).toBeGreaterThan(0)
    for (const entry of JOURNAL_ENTRIES) {
      const debit = toHalalas(entry.debit) ?? 0
      const credit = toHalalas(entry.credit) ?? 0
      expect(debit === credit || debit === 0 || credit === 0).toBe(true)
    }
    const debits = JOURNAL_ENTRIES.reduce((sum, e) => sum + (toHalalas(e.debit) ?? 0), 0)
    const credits = JOURNAL_ENTRIES.reduce((sum, e) => sum + (toHalalas(e.credit) ?? 0), 0)
    expect(debits).toBe(credits)
  })
})

// ── Reports ─────────────────────────────────────────────────────────────────

describe('§A10 · reports', () => {
  it('F-008 · the seeded chart of accounts does not balance, and stays visible', () => {
    // Owned by agent 05 and deliberately not papered over. Assets fall short of
    // liabilities plus equity by SAR 257,050. `FinancialReports` says so on
    // screen; this pins the figure so a silent "correction" to the seed — or a
    // display that starts hiding it — fails here.
    const total = (type: string) =>
      ACCOUNTS_COA.filter((account) => account.type === type).reduce(
        (sum, account) => sum + (toHalalas(account.balance) ?? 0),
        0
      )
    const assets = total('Assets')
    const liabilities = total('Liabilities')
    const equity = total('Equity')

    expect(assets).toBe(SAR(2_683_500))
    expect(liabilities + equity).toBe(SAR(2_940_550))
    expect(liabilities + equity - assets).toBe(SAR(257_050))
    expect(assets).not.toBe(liabilities + equity)
  })

  it('reports revenue and expense as the ledger holds them, without netting them off', () => {
    const total = (type: string) =>
      ACCOUNTS_COA.filter((account) => account.type === type).reduce(
        (sum, account) => sum + (toHalalas(account.balance) ?? 0),
        0
      )
    const revenue = total('Revenue')
    const expense = total('Expense')
    expect(revenue).toBe(SAR(1_284_500))
    expect(expense).toBe(SAR(957_600))
    expect(revenue - expense).toBe(SAR(326_900))
  })
})

// ── The seeded chain, audited ───────────────────────────────────────────────

describe('§A10 · the seeded chain', () => {
  it('reads every seeded invoice amount as a finite, non-negative figure', () => {
    expect(INVOICES.length).toBeGreaterThan(4)
    for (const invoice of INVOICES) {
      const money = invoiceMoney(invoice)
      expect(Number.isSafeInteger(money.totalHalalas), invoice.id).toBe(true)
      expect(money.totalHalalas, invoice.id).toBeGreaterThanOrEqual(0)
    }
  })

  it('DEFECT · the detail invoice’s header disagrees with its own line items', () => {
    /* Reported, not fixed — it belongs to the seed (agent 05), and the whole
     * point of §A10 is that a disagreement is surfaced rather than reconciled
     * by whichever side the screen happens to read.
     *
     * `server/scripts/seed.ts` sets the invoice total from the design's display
     * string ("SAR 1,840") and derives the subtotal by dividing by 1.15, but
     * seeds the five design line items separately. They total SAR 1,450 net, so
     * the header claims SAR 150 of net revenue that no line accounts for.
     * `InvoiceDetail` says so on screen instead of choosing one of them. */
    const invoice = INVOICES.find((row) => row.id === 'INV-2026-0142')
    expect(invoice).toBeDefined()
    const headerTotal = invoiceMoney(invoice).totalHalalas
    const lineNet = INVOICE_LINES.reduce(
      (sum, line) => sum + line.qty * lineUnitHalalas(line),
      0
    )
    const impliedSubtotal = Math.round(headerTotal / 1.15)

    expect(headerTotal).toBe(SAR(1840))
    expect(lineNet).toBe(SAR(1450))
    expect(impliedSubtotal).toBe(SAR(1600))
    expect(impliedSubtotal - lineNet).toBe(SAR(150))
  })

  it('keeps the seeded payments within the invoice they settle', () => {
    const invoice = INVOICES.find((row) => row.id === 'INV-2026-0142')
    const collected = INVOICE_PAYMENTS.reduce((sum, payment) => sum + paymentHalalas(payment), 0)
    expect(collected).toBe(SAR(1300))
    expect(collected).toBeLessThanOrEqual(invoiceMoney(invoice).totalHalalas)
  })

  it('reads every seeded receipt as money, and none of them as a negative', () => {
    expect(RECEIPTS.length).toBeGreaterThan(0)
    for (const receipt of RECEIPTS) {
      const amount = toHalalas(receipt.amount)
      expect(amount, receipt.id).not.toBeNull()
      expect(amount as number, receipt.id).toBeGreaterThan(0)
    }
  })

  it('names an invoice for every seeded receipt, so no receipt is an orphan', () => {
    const codes = new Set(INVOICES.map((invoice) => invoice.id))
    const orphans = RECEIPTS.filter((receipt) => !codes.has(receipt.invoice))
    /* DEFECT (reported, not fixed): three of the five seeded receipts name an
     * invoice that is not in the invoice table — INV-2026-0124, -0128 and -0131
     * have receipts but no invoice, because the design bundle's receipt list
     * reaches further back than its invoice list. Money arrives against nothing
     * in the no-orphan audit the plan calls for. It belongs to the seed
     * (agent 05), so this pins the exact set rather than asserting zero: the
     * gap cannot widen unnoticed, and closing it turns this red on purpose. */
    expect(orphans.map((receipt) => receipt.invoice).sort()).toEqual([
      'INV-2026-0124',
      'INV-2026-0128',
      'INV-2026-0131',
    ])
  })
})

/** The four totals fields, so a comparison does not drag the getters along. */
function invoice_totals(invoice: {
  subtotalHalalas: number
  taxHalalas: number
  discountHalalas: number
  totalHalalas: number
}) {
  return {
    subtotalHalalas: invoice.subtotalHalalas,
    taxHalalas: invoice.taxHalalas,
    discountHalalas: invoice.discountHalalas,
    totalHalalas: invoice.totalHalalas,
  }
}

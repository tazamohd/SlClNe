/** Bank statement lines (F-028) — the bank side of a reconciliation.
 *
 *  One row per line on an imported statement, so BankReconciliation can match
 *  the recorded receipts against what the bank actually shows. Read-only across
 *  the wire; the only write is the `match` action, which links a line to a book
 *  entry. Money is integer halalas.
 */
import { z } from 'zod'
import { ulid } from '../primitives'
import { appRow } from './common'

/** Reconciling a statement line to a book entry. The receipt reference is
 *  optional — a line can be flagged reconciled without naming the exact
 *  receipt — and nothing else is accepted, so the action cannot smuggle a
 *  change to the amount or the tenant. */
export const bankStatementMatch = z
  .object({
    receiptId: ulid.optional(),
  })
  .strict()

export type BankStatementMatch = z.infer<typeof bankStatementMatch>

export const bankStatementRow = appRow({
  date: z.string(),
  description: z.string(),
  reference: z.string(),
  account: z.string(),
  amount: z.string(),
  amountHalalas: z.number().int(),
  direction: z.enum(['credit', 'debit']),
  matched: z.boolean(),
  matchedReceiptId: z.string().nullable(),
})

export type BankStatementRow = z.infer<typeof bankStatementRow>

/** Auto-loan contracts and their repayment schedules (financial products).
 *
 *  A contract is a financed principal at a rate over a term; its monthly
 *  instalment is a real amortised figure the server computes at origination
 *  (`rules/loans.ts`), never a placeholder. The repayments are the month-by-month
 *  schedule that instalment implies. Both are read-only across the wire — money
 *  is decided by the server, in integer halalas — so the client only displays.
 */
import { z } from 'zod'
import { ulid } from '../primitives'
import { appRow } from './common'

export const loanContractStatus = z.enum(['active', 'settled', 'defaulted', 'cancelled'])
export type LoanContractStatus = z.infer<typeof loanContractStatus>

export const loanRepaymentStatus = z.enum(['due', 'paid', 'overdue'])
export type LoanRepaymentStatus = z.infer<typeof loanRepaymentStatus>

export const loanContractRow = appRow({
  /** `LN-2026-0001` — the human contract number the design shows. */
  contractNumber: z.string(),
  borrower: z.string(),
  customerId: ulid.nullable(),
  /** `"SAR 60,000"` — formatted from `principalHalalas` at the boundary. */
  principal: z.string(),
  principalHalalas: z.number().int().min(0),
  /** Annual interest rate in basis points (600 = 6.00%). */
  rateBps: z.number().int().min(0),
  termMonths: z.number().int().min(1),
  start: z.string(),
  status: loanContractStatus,
  /** The amortised monthly instalment, computed by the server at origination. */
  monthlyInstalment: z.string(),
  monthlyInstalmentHalalas: z.number().int().min(0),
})
export type LoanContractRow = z.infer<typeof loanContractRow>

export const loanRepaymentRow = appRow({
  contractId: ulid.nullable(),
  contractNumber: z.string(),
  /** 1-based instalment number within the contract. */
  sequence: z.number().int().min(1),
  dueDate: z.string(),
  amountDue: z.string(),
  amountDueHalalas: z.number().int().min(0),
  amountPaid: z.string(),
  amountPaidHalalas: z.number().int().min(0),
  paidDate: z.string().nullable(),
  status: loanRepaymentStatus,
})
export type LoanRepaymentRow = z.infer<typeof loanRepaymentRow>

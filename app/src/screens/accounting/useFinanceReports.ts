import { useQuery } from '@tanstack/react-query'
import {
  financeReports,
  productReports,
  type InsuranceClaimsSummary,
  type InvoiceSummary,
  type LoansSummary,
  type ReportRange,
  type TaxReturn,
  type TrialBalance,
} from '@/data/repository'

/** The server-computed financial aggregates (§A10), read through TanStack Query.
 *
 *  There is deliberately no fixture fallback. `financeReports` is null on a
 *  build with no API, so each hook stays `disabled` there — nothing is fetched
 *  and the caller renders the honest `AggregateGapNotice` instead. A period
 *  total, a VAT return or a trial balance is a cross-record sum the server owns;
 *  the client displays what these return and never adds up a page of rows to
 *  fill the gap, which is the entire reason the endpoints exist (F-028).
 */

/** `GET /invoices/summary` for a period and optional status. Feeds SalesReports'
 *  revenue / paid / outstanding / VAT totals. */
export function useInvoicesSummary(range: ReportRange & { status?: string }) {
  return useQuery<InvoiceSummary>({
    queryKey: ['finance-report', 'invoices-summary', range],
    queryFn: () => financeReports!.invoicesSummary(range),
    enabled: financeReports !== null,
  })
}

/** `GET /accounting/tax/return` — TaxManagement's output-VAT figure at the
 *  configured rate. Input VAT arrives `inputVatModelled:false`; the screen
 *  honours that rather than showing a net payable that is not modelled. */
export function useTaxReturn(range: ReportRange) {
  return useQuery<TaxReturn>({
    queryKey: ['finance-report', 'tax-return', range],
    queryFn: () => financeReports!.taxReturn(range),
    enabled: financeReports !== null,
  })
}

/** `GET /accounting/reports/trial-balance` — the trial balance, P&L roll-up and
 *  the balance-sheet identity block that carries F-008's real imbalance. */
export function useTrialBalance() {
  return useQuery<TrialBalance>({
    queryKey: ['finance-report', 'trial-balance'],
    queryFn: () => financeReports!.trialBalance(),
    enabled: financeReports !== null,
  })
}

/** `GET /insurance/claims/summary` — claim totals by status (F-035). Feeds the
 *  Insurance report. Null accessor on a fixture build, so the report keeps its
 *  honest gap; the figures are the server's, never a page the client summed. */
export function useInsuranceClaimsSummary() {
  return useQuery<InsuranceClaimsSummary>({
    queryKey: ['product-report', 'insurance-claims-summary'],
    queryFn: () => productReports!.insuranceClaimsSummary(),
    enabled: productReports !== null,
  })
}

/** `GET /loans/summary` — loan portfolio outstanding/overdue (F-035). Feeds the
 *  Loan report; same disabled-on-fixture discipline. */
export function useLoansSummary() {
  return useQuery<LoansSummary>({
    queryKey: ['product-report', 'loans-summary'],
    queryFn: () => productReports!.loansSummary(),
    enabled: productReports !== null,
  })
}

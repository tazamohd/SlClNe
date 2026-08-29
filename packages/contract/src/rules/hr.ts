/** HR / payroll arithmetic, shared client↔server so one definition is the
 *  authority.
 *
 *  Money is an integer count of halalas throughout — a payroll line's net is
 *  `gross + allowances − deductions`, and a run's totals are the column sums of
 *  its lines. Both are computed on the server (the line net on write, the run
 *  totals when the run is posted and frozen), never sent by the client. Kept
 *  here as pure functions so the posting route and its test agree by
 *  construction, the way the loan amortisation does.
 */

/** A payroll line's net pay: earnings plus allowances, less deductions. Every
 *  input is integer halalas, so the result is too — no rounding, no float. */
export function payrollLineNetHalalas(
  grossHalalas: number,
  allowancesHalalas: number,
  deductionsHalalas: number,
): number {
  return grossHalalas + allowancesHalalas - deductionsHalalas
}

/** The four column totals a payroll run freezes when it is posted: the sums of
 *  its lines' gross, allowances, deductions and net. The net total equals
 *  `gross + allowances − deductions` across the run, so a run's own invariant is
 *  the line invariant summed. */
export interface PayrollTotals {
  grossHalalas: number
  allowancesHalalas: number
  deductionsHalalas: number
  netHalalas: number
}

export function sumPayrollLines(
  lines: readonly {
    grossHalalas: number
    allowancesHalalas: number
    deductionsHalalas: number
    netHalalas: number
  }[],
): PayrollTotals {
  const totals: PayrollTotals = {
    grossHalalas: 0,
    allowancesHalalas: 0,
    deductionsHalalas: 0,
    netHalalas: 0,
  }
  for (const line of lines) {
    totals.grossHalalas += line.grossHalalas
    totals.allowancesHalalas += line.allowancesHalalas
    totals.deductionsHalalas += line.deductionsHalalas
    totals.netHalalas += line.netHalalas
  }
  return totals
}

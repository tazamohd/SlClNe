/** Loan amortisation — the origination instalment and the repayment schedule.
 *
 *  A loan's monthly instalment is the closed-form amortised payment; the
 *  schedule is the month-by-month split of each instalment into interest and
 *  principal. Both live here, as pure functions, so the server computes them at
 *  origination (the enforcement point) and a screen can show the same figures
 *  without re-deriving one.
 *
 *  **Integer-safe.** Money is an integer count of halalas throughout. The only
 *  non-integer step is the compounding factor `(1 + i)^n` used to derive the
 *  level instalment, whose result is immediately rounded to a whole halala
 *  (`roundHalfUp`). Every value that is ever stored — the instalment and each
 *  scheduled repayment — is an integer, and each month's interest is a
 *  half-up rounding of `balance · rateBps / (10000 · 12)` over the integer
 *  running balance. The final instalment is adjusted to clear the balance
 *  exactly, so the schedule collects precisely principal + total interest with
 *  no fractional halala created or lost.
 */
import { roundHalfUp } from './money'

/** Basis points are hundredths of a percent: 10 000 bps = 1.0 (100%). */
const BPS_PER_UNIT = 10_000
const MONTHS_PER_YEAR = 12

/** One month's interest on an outstanding balance, in integer halalas:
 *  `balance · rateBps / (10000 · 12)`, rounded half-up at the last halala. */
export function monthlyInterestHalalas(balanceHalalas: number, rateBps: number): number {
  return roundHalfUp((balanceHalalas * rateBps) / (BPS_PER_UNIT * MONTHS_PER_YEAR))
}

/** The level monthly instalment that amortises `principalHalalas` over
 *  `termMonths` at `rateBps` annual, as an integer count of halalas.
 *
 *  A zero-rate loan divides the principal evenly, rounded half-up; the schedule
 *  then absorbs any remainder in the final instalment. Otherwise the standard
 *  annuity formula `P·i / (1 − (1+i)^−n)` gives the payment, with `i` the
 *  monthly rate. The `Math.pow` is the one floating-point step, and its product
 *  with the principal is rounded to a whole halala before it is ever used —
 *  nothing fractional is returned or stored. */
export function amortisedInstalmentHalalas(
  principalHalalas: number,
  rateBps: number,
  termMonths: number,
): number {
  if (!Number.isInteger(termMonths) || termMonths <= 0) {
    throw new Error('loan term must be a positive whole number of months')
  }
  if (principalHalalas <= 0) return 0
  if (rateBps === 0) return roundHalfUp(principalHalalas / termMonths)
  const i = rateBps / (BPS_PER_UNIT * MONTHS_PER_YEAR)
  const factor = Math.pow(1 + i, termMonths)
  return roundHalfUp((principalHalalas * i * factor) / (factor - 1))
}

export interface RepaymentPlanEntry {
  /** 1-based instalment number. */
  sequence: number
  /** What is owed this month, integer halalas. */
  amountDueHalalas: number
  /** The interest portion of this instalment. */
  interestHalalas: number
  /** The principal portion of this instalment. */
  principalHalalas: number
  /** Outstanding principal after this instalment is paid. */
  balanceAfterHalalas: number
}

/** The full amortised schedule for a loan.
 *
 *  Each month: interest is computed on the running balance in integer halalas,
 *  the principal portion is the instalment minus that interest, and the balance
 *  is reduced by the principal portion. The final instalment is set to clear
 *  the balance exactly (`balance + interest`), so the amounts collect precisely
 *  `principalHalalas + Σ interest` with no drift, and no instalment ever
 *  amortises more principal than remains. */
export function buildRepaymentPlan(
  principalHalalas: number,
  rateBps: number,
  termMonths: number,
  instalmentHalalas: number = amortisedInstalmentHalalas(principalHalalas, rateBps, termMonths),
): RepaymentPlanEntry[] {
  if (!Number.isInteger(termMonths) || termMonths <= 0) {
    throw new Error('loan term must be a positive whole number of months')
  }
  const plan: RepaymentPlanEntry[] = []
  let balance = principalHalalas
  for (let sequence = 1; sequence <= termMonths; sequence += 1) {
    const interestHalalas = monthlyInterestHalalas(balance, rateBps)
    const isLast = sequence === termMonths
    let principalPortion: number
    let amountDueHalalas: number
    if (isLast) {
      /* Clear whatever remains, so the total collected is exact. */
      principalPortion = balance
      amountDueHalalas = balance + interestHalalas
    } else {
      amountDueHalalas = instalmentHalalas
      principalPortion = amountDueHalalas - interestHalalas
      /* Never amortise more than the outstanding principal — a high enough rate
       * or a short term could otherwise drive the balance negative. */
      if (principalPortion > balance) {
        principalPortion = balance
        amountDueHalalas = balance + interestHalalas
      }
    }
    balance -= principalPortion
    plan.push({
      sequence,
      amountDueHalalas,
      interestHalalas,
      principalHalalas: principalPortion,
      balanceAfterHalalas: balance,
    })
  }
  return plan
}

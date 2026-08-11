/** Server-side authorization — the actual boundary.
 *
 *  The client's `app/src/data/rbac.ts` hides and disables; it decides what a
 *  screen shows. This decides what happens. Both read the same matrix
 *  (`packages/contract/src/rbac.ts`) and `tests/authz-matrix.test.ts` asserts
 *  the two tables are *identical*, not merely similar.
 *
 *  Two corrections live here rather than in the contract package, which this
 *  agent does not own; both are recorded in the report:
 *
 *  - the grant alphabet has six letters and `x` is **export**, not delete
 *    (`./actions.ts`), and
 *  - approval needs authority *and* ceiling, not the ceiling alone
 *    (`./approvals.ts`, finding F-002).
 */
import { fieldHidden } from '@salis/contract'
import { checkSelfApproval } from '@salis/contract/rules'
import { approvalRequired, forbidden } from '../http/errors'
import type { Principal } from '../db/tenant'
import { describeAction, granted, type GrantAction, type ModuleId } from './actions'
import { approvalDecision, canApprove } from './approvals'

export { GRANT_ACTIONS, describeAction, granted, isGrantAction } from './actions'
export type { GrantAction } from './actions'
export { approvalDecision, canApprove, ceilingHalalas } from './approvals'

/** Throws unless `principal` holds `action` on `module`. */
export function requirePermission(
  principal: Principal,
  module: ModuleId | string,
  action: GrantAction,
): void {
  if (!granted(module, action, principal.role)) {
    throw forbidden(`The ${principal.role} role may not ${describeAction(action)} ${module}.`)
  }
}

export function hasPermission(
  principal: Principal,
  module: ModuleId | string,
  action: GrantAction,
): boolean {
  return granted(module, action, principal.role)
}

/** Throws unless `principal` may approve `amountHalalas` on `module`.
 *
 *  Above the ceiling the answer is *escalate*, not *deny outright* — the
 *  message says so, because a screen that only says "forbidden" sends the user
 *  to ask an administrator for a permission that would not help. Without the
 *  `a` grant at all it really is a refusal, and the message says that instead. */
export function requireApproval(
  principal: Principal,
  amountHalalas?: number,
  module: ModuleId | string = 'approvals',
): void {
  const decision = approvalDecision(principal.role, amountHalalas, module)
  if (decision.allowed) return
  if (decision.reason === 'authority') {
    throw forbidden(decision.message ?? `The ${principal.role} role may not approve ${module}.`)
  }
  throw approvalRequired(decision.message ?? "That amount is above this role's approval ceiling.")
}

export function mayApprove(
  principal: Principal,
  amountHalalas?: number,
  module: ModuleId | string = 'approvals',
): boolean {
  return canApprove(principal.role, amountHalalas, module)
}

/** Segregation of duties: the person who raised something may not approve it.
 *
 *  This is the *submitter* half of the control, answerable from a column on the
 *  record. The general form — "whoever performed activity A on this record may
 *  not perform its counterpart" — needs the audit trail and lives in `./sod.ts`. */
export function requireDifferentApprover(
  principal: Principal,
  submittedByUserId: string | null,
): void {
  const failure = checkSelfApproval({
    actorUserId: principal.userId,
    submittedByUserId,
  })
  if (failure) throw forbidden(failure.message)
}

export interface RedactionRule {
  ruleField: string
  rowKeys: readonly string[]
}

/** Redactions that apply to **every** presented row, whatever collection it
 *  came from.
 *
 *  F-005. Two `FIELD_RULES` entries — "Employee salary" and "Branch P&L" — hide
 *  a field only from roles that the module gate already turns away, so they
 *  fire nowhere and look like protection they do not provide. There is no HR
 *  payroll or branch-P&L payload on the server yet for them to guard, so the
 *  honest reading is: they are **defence in depth, not working redaction**, and
 *  they are recorded as such in `DEFENCE_IN_DEPTH_FIELDS` below and in
 *  `app/src/data/rbac.ts`.
 *
 *  Recording it is not enough on its own, because the rule stays dead until
 *  someone remembers it. So the keys those values would arrive under are
 *  redacted globally rather than per collection: the day agent 14 adds
 *  `salaryHalalas` to a payload, or agent 12 adds `netProfitHalalas`, the rule
 *  starts firing without anyone wiring it up. `tests/authz-fields.test.ts`
 *  fails if a collection emits one of these keys, so the coverage cannot rot
 *  quietly either.
 */
export const GLOBAL_REDACTIONS: readonly RedactionRule[] = [
  {
    ruleField: 'Employee salary',
    rowKeys: [
      'salary',
      'salaryHalalas',
      'basicSalaryHalalas',
      'grossPayHalalas',
      'netPayHalalas',
      'allowancesHalalas',
      'deductionsHalalas',
    ],
  },
  {
    ruleField: 'Branch P&L',
    rowKeys: [
      'branchPnl',
      'branchProfitHalalas',
      'grossProfitHalalas',
      'netProfitHalalas',
      'operatingProfitHalalas',
      'ebitdaHalalas',
    ],
  },
]

/** The two rules that guard nothing today, named so nobody counts them as
 *  redaction that works. */
export const DEFENCE_IN_DEPTH_FIELDS: readonly string[] = GLOBAL_REDACTIONS.map(
  (rule) => rule.ruleField,
)

/** Field-level redaction. Applied on the way out, so a redacted field is never
 *  serialised — hiding it in CSS would still have put it on the wire. */
export function redact<T extends Record<string, unknown>>(
  principal: Principal,
  row: T,
  rules: readonly RedactionRule[] = [],
): T {
  let result = row
  for (const rule of [...rules, ...GLOBAL_REDACTIONS]) {
    if (!fieldHidden(rule.ruleField, principal.role)) continue
    for (const key of rule.rowKeys) {
      if (!(key in result)) continue
      if (result === row) result = { ...row }
      ;(result as Record<string, unknown>)[key] = null
    }
  }
  return result
}

/** Server-side authorization — the actual boundary.
 *
 *  The client's `app/src/data/rbac.ts` hides and disables; it decides what a
 *  screen shows. This decides what happens. The two read the same matrix
 *  (`packages/contract/src/rbac.ts`), and `tests/rbac-parity.test.ts` fails if
 *  they ever stop agreeing.
 */
import {
  can,
  canApprove,
  fieldHidden,
  formatSar,
  type Action,
  type ModuleId,
} from '@salis/contract'
import { checkApprovalCeiling, checkSelfApproval } from '@salis/contract/rules'
import { approvalRequired, forbidden } from '../http/errors'
import type { Principal } from '../db/tenant'

/** Throws unless `principal` holds `action` on `module`. */
export function requirePermission(principal: Principal, module: ModuleId, action: Action): void {
  if (!can(module, action, principal.role)) {
    throw forbidden(`The ${principal.role} role may not ${describe(action)} ${module}.`)
  }
}

export function hasPermission(principal: Principal, module: ModuleId, action: Action): boolean {
  return can(module, action, principal.role)
}

/** Throws unless `principal` may approve `amountHalalas`.
 *
 *  Above the ceiling the answer is *escalate*, not *deny outright* — the
 *  message says so, because a screen that only says "forbidden" sends the user
 *  to ask an administrator for a permission that would not help. */
export function requireApproval(principal: Principal, amountHalalas: number): void {
  const decision = checkApprovalCeiling(principal.role, amountHalalas)
  if (!decision.allowed) {
    throw approvalRequired(
      decision.message ??
        `${formatSar(amountHalalas)} exceeds this role's approval ceiling.`,
    )
  }
}

export function mayApprove(principal: Principal, amountHalalas?: number): boolean {
  return canApprove(principal.role, amountHalalas)
}

/** Segregation of duties: the person who raised something may not approve it. */
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

/** Field-level redaction. Applied on the way out, so a redacted field is never
 *  serialised — hiding it in CSS would still have put it on the wire. */
export function redact<T extends Record<string, unknown>>(
  principal: Principal,
  row: T,
  rules: readonly { ruleField: string; rowKeys: readonly string[] }[],
): T {
  let result = row
  for (const rule of rules) {
    if (!fieldHidden(rule.ruleField, principal.role)) continue
    if (result === row) result = { ...row }
    for (const key of rule.rowKeys) {
      ;(result as Record<string, unknown>)[key] = null
    }
  }
  return result
}

function describe(action: Action): string {
  switch (action) {
    case 'v':
      return 'view'
    case 'c':
      return 'create'
    case 'e':
      return 'edit'
    case 'x':
      return 'delete'
    case 'a':
      return 'approve'
  }
}

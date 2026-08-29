/** Approval authority and approval ceiling — two questions, both of which must
 *  answer yes.
 *
 *  F-002. `@salis/contract`'s `canApprove` reads the ceiling alone, so
 *  `superadmin` (`limitSar: null`) answers yes to approving any business
 *  document while its grant on `approvals` is `vx` — view and export, no
 *  approve at all. A platform administrator administers the platform; it does
 *  not release a tenant's purchase orders. The mirror case is `qc`, which holds
 *  `a` on `jobcards` with a ceiling of zero: it passes quality and releases no
 *  money.
 *
 *  So the ceiling cannot be read on its own in either direction, and the
 *  corrected rule matches `app/src/data/rbac.ts`:
 *
 *    1. the role must hold `a` on the module the decision belongs to, and
 *    2. the amount, when there is one, must sit within the role's ceiling.
 *
 *  Amounts here are **halalas**, matching the database. `ROLE_META.limitSar` is
 *  in SAR, which is why the conversion happens in one place.
 */
import { ROLE_META, formatSar, type RoleId } from '@salis/contract'
import { granted, type ModuleId } from './actions'

/** Approval ceiling in halalas. `null` = unlimited, `0` = may not approve. */
export function ceilingHalalas(role: string): number | null {
  const meta = (ROLE_META as Record<string, { limitSar: number | null } | undefined>)[role]
  /* An unrecognised role has no ceiling rather than an unlimited one — the
   * server-side half of F-006. `principalFromClaims` already refuses a token
   * whose role is not one of the fourteen, so this is defence in depth, and it
   * is the direction that stays safe when something upstream changes. */
  if (!meta) return 0
  return meta.limitSar === null ? null : meta.limitSar * 100
}

export interface ApprovalDecision {
  allowed: boolean
  ceilingHalalas: number | null
  /** Why it was refused, in the words the screen should show. */
  message?: string
  /** `authority` means no grant at all; `ceiling` means escalate to someone
   *  senior. A screen that conflates them sends the user to ask for a
   *  permission that would not have helped. */
  reason?: 'authority' | 'ceiling'
}

/** May `role` approve `amountHalalas` on `module`? */
export function canApprove(
  role: string,
  amountHalalas?: number,
  module: ModuleId | string = 'approvals',
): boolean {
  if (!granted(module, 'a', role)) return false
  const ceiling = ceilingHalalas(role)
  /* Authority without a money ceiling, e.g. QC on job cards: it may decide,
   * but not about an amount. */
  if (ceiling === 0) return amountHalalas === undefined
  if (ceiling === null) return true
  return amountHalalas === undefined || amountHalalas <= ceiling
}

/** The same decision with the reason attached, for the API's error body. */
export function approvalDecision(
  role: string,
  amountHalalas: number | undefined,
  module: ModuleId | string = 'approvals',
): ApprovalDecision {
  const ceiling = ceilingHalalas(role)
  if (!granted(module, 'a', role)) {
    return {
      allowed: false,
      ceilingHalalas: ceiling,
      reason: 'authority',
      message: `The ${role} role holds no approval authority on ${module}.`,
    }
  }
  if (ceiling === 0) {
    if (amountHalalas === undefined) return { allowed: true, ceilingHalalas: 0 }
    return {
      allowed: false,
      ceilingHalalas: 0,
      reason: 'ceiling',
      message: `The ${role} role may decide on ${module} but may not approve an amount.`,
    }
  }
  if (ceiling === null || amountHalalas === undefined || amountHalalas <= ceiling) {
    return { allowed: true, ceilingHalalas: ceiling }
  }
  return {
    allowed: false,
    ceilingHalalas: ceiling,
    reason: 'ceiling',
    message:
      `${formatSar(amountHalalas)} is above this role's ceiling of ${formatSar(ceiling)}. ` +
      'It must be escalated.',
  }
}

export type { RoleId }

/** Approval ceilings and segregation of duties.
 *
 *  `MASTER_BUSINESS_RULES.md` §Approvals and §Segregation of duties. */
import { approvalCeilingHalalas, canApprove, SOD, type RoleId } from '../rbac'
import { formatSar } from '../primitives'
import type { RuleFailure } from './money'

export interface ApprovalDecision {
  allowed: boolean
  /** Halalas the role may approve up to. `null` = unlimited. */
  ceilingHalalas: number | null
  /** Why it was refused, in the words the screen should show. */
  message?: string
}

/** A value above the role's ceiling must escalate rather than be approved. */
export function checkApprovalCeiling(role: RoleId, amountHalalas: number): ApprovalDecision {
  const ceiling = approvalCeilingHalalas(role)
  if (ceiling === 0) {
    return { allowed: false, ceilingHalalas: 0, message: 'This role may not approve.' }
  }
  if (canApprove(role, amountHalalas)) {
    return { allowed: true, ceilingHalalas: ceiling }
  }
  return {
    allowed: false,
    ceilingHalalas: ceiling,
    message: `${formatSar(amountHalalas)} is above this role's ceiling of ${formatSar(
      ceiling as number,
    )}. It must be escalated.`,
  }
}

/** The approver must not be the submitter — the first and most-broken SOD pair,
 *  and the one that lets a single person move money on their own say-so. */
export function checkSelfApproval(args: {
  actorUserId: string
  submittedByUserId: string | null
}): RuleFailure | null {
  if (args.submittedByUserId && args.actorUserId === args.submittedByUserId) {
    return {
      code: 'rule_violated',
      message: 'The person who raised this cannot also approve it.',
    }
  }
  return null
}

/** A technician cannot pass QC on a repair they performed. */
export function checkQcIndependence(args: {
  actorUserId: string
  performedByUserId: string | null
}): RuleFailure | null {
  if (args.performedByUserId && args.actorUserId === args.performedByUserId) {
    return {
      code: 'rule_violated',
      message: 'The technician who performed the repair cannot pass its quality check.',
    }
  }
  return null
}

/** The declared conflicting-duty pairs, exposed so a screen can explain one. */
export const SOD_PAIRS = SOD

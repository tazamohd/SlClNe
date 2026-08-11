/** The RBAC engine, ported 1:1 from `gms-data.js`.
 *
 *  The backend must run the identical rules — the frontend hides and disables,
 *  the API layer re-checks on every request (README §3). Keep this file and the
 *  server's authorization module in lockstep. */
import {
  ROLES,
  PERMS,
  SCREEN_MODULE,
  RBAC_UNGATED,
  FIELD_RULES,
  SOD,
} from './generated/rbac'
import { NAV } from './generated/nav'
import type { Action, NavGroup, Role, RoleId, SodRule } from './types'

export { ROLES, PERMS, SCREEN_MODULE, RBAC_UNGATED, FIELD_RULES, SOD }

export const DEFAULT_ROLE: RoleId = 'owner'

export function roleMeta(id: string): Role {
  return (ROLES as readonly Role[]).find((r) => r.id === id) ?? (ROLES[0] as Role)
}

export function isRoleId(id: string | null | undefined): id is RoleId {
  return !!id && ROLES.some((r) => r.id === id)
}

/** Does `role` hold `action` on `module`? */
export function can(module: string, action: Action, role: string): boolean {
  return (PERMS[module]?.[role] ?? '').includes(action)
}

/** May `role` open `screen`? Screens with no module mapping are open by design
 *  — those are the auth, error and design-reference pages in RBAC_UNGATED. */
export function canScreen(screen: string, role: string): boolean {
  const module = SCREEN_MODULE[screen]
  if (!module) return true
  return can(module, 'v', role)
}

/** Sidebar for a role. Items the role can't view are removed entirely, and a
 *  group with nothing left in it disappears too — screens never grey out
 *  (chat decision: "Hide it entirely"). */
export function navFor(role: string, nav: readonly NavGroup[] = NAV): NavGroup[] {
  return nav
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.screen || canScreen(item.screen, role)),
    }))
    .filter((group) => group.items.length > 0)
}

/** Field-level redaction — hide the value, don't just disable the input. */
export function fieldHidden(field: string, role: string): boolean {
  const rule = FIELD_RULES.find((f) => f.field === field)
  return !!rule && rule.hidden.includes(role)
}

/** Approval ceiling in SAR. `null` = unlimited, `0` = cannot approve at all. */
export function approvalLimit(role: string): number | null {
  return roleMeta(role).limit
}

/** Approval rights are derived, never stored: any role with a non-zero limit
 *  implicitly gets `approvals: "va"`. Encoding it here keeps the matrix and the
 *  Approval Inbox from ever disagreeing (README §11). */
export function canApprove(role: string, amountSar?: number, module = 'approvals'): boolean {
  // Authority and ceiling are separate questions, and the matrix is explicit
  // that they are: `qc` holds approve on jobcards with a ceiling of zero — it
  // passes quality, it does not release money — while `superadmin` has an
  // unlimited ceiling and approve only on ai, admin and settings, because a
  // platform administrator administers the platform rather than approving a
  // tenant's purchase orders.
  //
  // Reading the ceiling alone answered yes for superadmin on every business
  // document, which is both a tenant-boundary violation and a disagreement with
  // the Approval Inbox, since that screen reads the matrix. Both must hold.
  if (!can(module, 'a', role)) return false
  const limit = approvalLimit(role)
  if (limit === 0) return amountSar === undefined // authority without a money ceiling, e.g. QC
  if (limit === null) return true
  return amountSar === undefined || amountSar <= limit
}

/** Where a role lands after sign-in (README §4). */
const LOGIN_DESTINATION: Partial<Record<RoleId, string>> = {
  supplier: '/supplier-portal',
  customer: '/customer-portal',
  technician: '/technician-portal',
  superadmin: '/super-admin',
  callcenter: '/call-center',
  procurement: '/procurement-portal',
}

export function destinationFor(role: string): string {
  return LOGIN_DESTINATION[role as RoleId] ?? '/dashboard'
}

// ── Segregation of duties ────────────────────────────────────────────────────

/** The SOD table pairs *activities*, not roles: "Perform repair" must not be
 *  done by whoever will "Pass quality check". That is a question about people
 *  and records — did this actor perform the counterpart on this job? — and the
 *  permission matrix cannot answer it. Four of the six pairs are held on both
 *  sides by a single role (owner, manager, advisor, accountant, procurement),
 *  so a role check cannot express the control at all.
 *
 *  Until a record carries who performed each step, screens use a role proxy and
 *  say so. The proxy is wrong in both directions: it blocks every technician,
 *  including one who never touched the job, and it lets a manager who performed
 *  the repair sign off their own work.
 *
 *  The real check belongs on the server, over the audit log, which already
 *  records actor, action, entity and entityId for exactly this purpose:
 *
 *      the actor who performed activity A on entity X
 *      may not perform the counterpart activity B on entity X
 *
 *  `sodViolation` implements that and is ready for the first caller with the
 *  data; `sodRuleFor` lets a screen name its activity instead of hardcoding a
 *  role, so the table is load-bearing rather than documentation. */

/** The rule pairing this activity with its counterpart, if the table has one. */
export function sodRuleFor(activity: string): SodRule | undefined {
  return SOD.find((rule) => rule.a === activity || rule.b === activity)
}

/** The activity that must not share a holder with this one. */
export function sodCounterpart(activity: string): string | undefined {
  const rule = sodRuleFor(activity)
  if (!rule) return undefined
  return rule.a === activity ? rule.b : rule.a
}

/** Whether `actor` performing `activity` would breach segregation of duties,
 *  given who performed what on this record already. `history` is the record's
 *  audit trail — the actor identity must be the *user*, not the role, because
 *  two managers are two people and the control is about one person doing both. */
export function sodViolation(
  activity: string,
  actor: string,
  history: readonly { activity: string; actor: string }[]
): SodRule | undefined {
  const counterpart = sodCounterpart(activity)
  if (!counterpart) return undefined
  const conflicted = history.some(
    (entry) => entry.activity === counterpart && entry.actor === actor
  )
  return conflicted ? sodRuleFor(activity) : undefined
}

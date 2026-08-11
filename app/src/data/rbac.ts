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
} from './generated/rbac'
import { NAV } from './generated/nav'
import type { Action, NavGroup, Role, RoleId } from './types'

export { ROLES, PERMS, SCREEN_MODULE, RBAC_UNGATED, FIELD_RULES }
export { SOD } from './generated/rbac'

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

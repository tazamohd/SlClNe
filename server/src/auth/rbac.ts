/** RBAC engine — the server-side re-check the frontend's rbac.ts assumes.
 *
 *  README §3 / API_ENDPOINTS.md: "all responses re-check RBAC on the server
 *  (never trust the client)". PERMS/ROLES are ported verbatim from the design
 *  bundle (rbac-data.ts), so this stays in lockstep with app/src/data/rbac.ts. */
import { ROLES, PERMS } from './rbac-data.js'

export { ROLES, PERMS }

export type Action = 'v' | 'c' | 'e' | 'x' | 'a'

interface RoleMeta {
  id: string
  label: string
  ar: string
  icon: string
  demo: { name: string; ar: string; email: string }
  scope: string
  limit: number | null
  color: string
}

const rolesTyped = ROLES as unknown as readonly RoleMeta[]
const permsTyped = PERMS as unknown as Record<string, Record<string, string>>

export const DEFAULT_ROLE = 'owner'

export function roleMeta(id: string): RoleMeta {
  return rolesTyped.find((r) => r.id === id) ?? rolesTyped[0]
}

export function isRoleId(id: string | null | undefined): boolean {
  return !!id && rolesTyped.some((r) => r.id === id)
}

/** Does `role` hold `action` on `module`? */
export function can(module: string, action: Action, role: string): boolean {
  return (permsTyped[module]?.[role] ?? '').includes(action)
}

/** Approval ceiling in SAR. null = unlimited, 0 = cannot approve. */
export function approvalLimit(role: string): number | null {
  return roleMeta(role).limit
}

/** Where a role lands after sign-in (mirrors destinationFor in app rbac.ts). */
const LOGIN_DESTINATION: Record<string, string> = {
  supplier: '/supplier-portal',
  customer: '/customer-portal',
  technician: '/technician-portal',
  superadmin: '/super-admin',
  callcenter: '/call-center',
  procurement: '/procurement-portal',
}

export function destinationFor(role: string): string {
  return LOGIN_DESTINATION[role] ?? '/dashboard'
}

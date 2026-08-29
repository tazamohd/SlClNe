/** The grant alphabet, and the one authoritative reading of it.
 *
 *  `PERMS` uses **six** letters, not five:
 *
 *      v = view · c = create · e = edit · d = delete · a = approve · x = export
 *
 *  `project/handoff/RBAC.md` §Actions documents five and calls `x` delete.
 *  The data settles it and the handoff is wrong: `dashboard/owner`,
 *  `hr/manager` and `accounting/manager` are all `vx`, and nobody deletes a
 *  dashboard — `vx` is view-plus-download. `d` is delete: it appears as `vced`
 *  for the roles that may remove an appointment and `vcedax` for the full set.
 *  `app/src/data/types.ts` carries the corrected reading, and F-001 records the
 *  evidence.
 *
 *  This is not a documentation nicety. Read the other way round, `accountant`
 *  (`audit: 'vx'`, `jobcards: 'vx'`, `estimates: 'vx'`, `inventory: 'vx'`)
 *  holds delete on the audit log and on job cards; `technician` (`portaltech:
 *  'vx'`) and `customer` (`portalcustomer: 'vx'`) hold delete on their portals.
 *
 *  `@salis/contract` still declares the five-letter enum. Rather than cast a
 *  narrow type over a wider alphabet — which is how the wrong reading survives
 *  a refactor — the server reads the live `PERMS` table through the six-letter
 *  type declared here. The matrix *data* is still the contract's, and
 *  `tests/authz-matrix.test.ts` proves the server and the client enforce the
 *  identical table.
 */
import { MODULE_IDS, PERMS, ROLE_IDS, type ModuleId, type RoleId } from '@salis/contract'

export const GRANT_ACTIONS = ['v', 'c', 'e', 'd', 'a', 'x'] as const

/** v=view, c=create, e=edit, d=delete, a=approve, x=export. */
export type GrantAction = (typeof GRANT_ACTIONS)[number]

const LABELS: Record<GrantAction, string> = {
  v: 'view',
  c: 'create',
  e: 'edit',
  d: 'delete',
  a: 'approve',
  x: 'export',
}

export function describeAction(action: GrantAction): string {
  return LABELS[action]
}

export function isGrantAction(value: string): value is GrantAction {
  return (GRANT_ACTIONS as readonly string[]).includes(value)
}

/** Does `role` hold `action` on `module`?
 *
 *  Reads the live `PERMS` rather than a server-side copy of it: a copy is a
 *  thing that drifts, and the drift is silent because both halves keep passing
 *  their own tests. Unknown module, unknown role and absent grant all fail
 *  closed. */
export function granted(module: string, action: GrantAction, role: string): boolean {
  const row = (PERMS as Record<string, Record<string, string> | undefined>)[module]
  if (!row) return false
  return (row[role] ?? '').includes(action)
}

/** Every letter that actually occurs in the matrix. Used by the parity test to
 *  assert the alphabet rather than assume it. */
export function grantLettersInMatrix(): string[] {
  const letters = new Set<string>()
  for (const module of MODULE_IDS) {
    for (const role of ROLE_IDS) {
      for (const letter of PERMS[module][role]) letters.add(letter)
    }
  }
  return [...letters].sort()
}

export type { ModuleId, RoleId }

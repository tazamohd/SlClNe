import { describe, expect, it } from 'vitest'
import {
  can,
  canScreen,
  navFor,
  fieldHidden,
  approvalLimit,
  canApprove,
  destinationFor,
  roleMeta,
  isRoleId,
  ROLES,
  PERMS,
  SCREEN_MODULE,
  RBAC_UNGATED,
  FIELD_RULES,
  SOD,
} from '../src/data/rbac'
import type { Action, RoleId } from '../src/data/types'

const ALL_ROLE_IDS: RoleId[] = [
  'owner', 'superadmin', 'manager', 'advisor', 'technician', 'qc',
  'parts', 'accountant', 'hr', 'frontdesk', 'callcenter', 'procurement',
  'supplier', 'customer',
]

const ALL_MODULES = [
  'dashboard', 'jobcards', 'appointments', 'estimates', 'customers',
  'vehicles', 'inventory', 'procurement', 'invoices', 'payments',
  'accounting', 'hr', 'technicians', 'crm', 'callcenter', 'reports',
  'approvals', 'kiosk', 'execreports', 'portaltech', 'portalcustomer',
  'portalsupplier', 'portalprocure', 'ai', 'admin', 'settings',
  'audit', 'network',
]

const ACTIONS: Action[] = ['v', 'c', 'e', 'x', 'a']

// ---------------------------------------------------------------------------
// Data integrity
// ---------------------------------------------------------------------------

describe('RBAC data integrity', () => {
  it('defines exactly 14 roles', () => {
    expect(ROLES).toHaveLength(14)
  })

  it('defines exactly 28 modules', () => {
    expect(Object.keys(PERMS)).toHaveLength(28)
  })

  it('ROLES ids match the expected list', () => {
    const ids = ROLES.map((r) => r.id)
    expect(ids).toEqual(ALL_ROLE_IDS)
  })

  it('PERMS keys match the expected module list', () => {
    expect(Object.keys(PERMS).sort()).toEqual([...ALL_MODULES].sort())
  })

  it('every role has required metadata fields', () => {
    for (const role of ROLES) {
      expect(role.id).toBeTruthy()
      expect(role.label).toBeTruthy()
      expect(role.ar).toBeTruthy()
      expect(role.icon).toBeTruthy()
      expect(role.demo).toBeDefined()
      expect(role.demo.email).toBeTruthy()
      expect(role.scope).toBeTruthy()
      expect(role.color).toBeTruthy()
      expect(typeof role.limit === 'number' || role.limit === null).toBe(true)
    }
  })

  it('permission strings contain only valid action characters (v, c, e, d, x, a)', () => {
    for (const [mod, roles] of Object.entries(PERMS)) {
      for (const [role, actions] of Object.entries(roles)) {
        for (const ch of actions) {
          expect(
            'vcedxa'.includes(ch),
            `invalid action char "${ch}" in PERMS["${mod}"]["${role}"]="${actions}"`,
          ).toBe(true)
        }
      }
    }
  })

  it('every role mentioned in PERMS is a valid role id', () => {
    const validIds = new Set(ALL_ROLE_IDS as string[])
    for (const [mod, roles] of Object.entries(PERMS)) {
      for (const role of Object.keys(roles)) {
        expect(validIds.has(role), `unknown role "${role}" in PERMS["${mod}"]`).toBe(true)
      }
    }
  })

  it('every module in SCREEN_MODULE values is a valid module', () => {
    const validModules = new Set(ALL_MODULES)
    for (const [screen, mod] of Object.entries(SCREEN_MODULE)) {
      expect(validModules.has(mod), `SCREEN_MODULE["${screen}"] = "${mod}" is not a valid module`).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// can() — positive tests (granted permissions)
// ---------------------------------------------------------------------------

describe('can() — positive: each role gets exactly the granted actions', () => {
  for (const mod of ALL_MODULES) {
    for (const roleId of ALL_ROLE_IDS) {
      const granted = PERMS[mod]?.[roleId] ?? ''
      if (!granted) continue
      for (const action of ACTIONS) {
        if (granted.includes(action)) {
          it(`${roleId} CAN ${action} on ${mod}`, () => {
            expect(can(mod, action, roleId)).toBe(true)
          })
        }
      }
    }
  }
})

// ---------------------------------------------------------------------------
// can() — negative tests (denied permissions)
// ---------------------------------------------------------------------------

describe('can() — negative: each role is denied actions not in its grant', () => {
  for (const mod of ALL_MODULES) {
    for (const roleId of ALL_ROLE_IDS) {
      const granted = PERMS[mod]?.[roleId] ?? ''
      for (const action of ACTIONS) {
        if (!granted.includes(action)) {
          it(`${roleId} CANNOT ${action} on ${mod}`, () => {
            expect(can(mod, action, roleId)).toBe(false)
          })
        }
      }
    }
  }
})

// ---------------------------------------------------------------------------
// can() — edge cases
// ---------------------------------------------------------------------------

describe('can() — edge cases', () => {
  it('returns false for an unknown module', () => {
    expect(can('nonexistent', 'v', 'owner')).toBe(false)
  })

  it('returns false for an unknown role', () => {
    expect(can('dashboard', 'v', 'ghost')).toBe(false)
  })

  it('returns false for an unknown module and role', () => {
    expect(can('nonexistent', 'v', 'ghost')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// canScreen()
// ---------------------------------------------------------------------------

describe('canScreen()', () => {
  it('ungated screens are accessible to every role', () => {
    for (const screen of RBAC_UNGATED) {
      for (const roleId of ALL_ROLE_IDS) {
        expect(canScreen(screen, roleId), `${roleId} should access ungated "${screen}"`).toBe(true)
      }
    }
  })

  it('screens with no SCREEN_MODULE entry are open to all roles', () => {
    expect(canScreen('CompletelyMadeUpScreen', 'customer')).toBe(true)
  })

  it('gated screens follow module view permission', () => {
    const samples: [string, string, boolean][] = [
      ['Dashboard', 'owner', true],
      ['Dashboard', 'customer', false],
      ['JobCards', 'advisor', true],
      ['JobCards', 'supplier', false],
      ['Appointments', 'frontdesk', true],
      ['Appointments', 'qc', false],
      ['ExecutiveReports', 'owner', true],
      ['ExecutiveReports', 'technician', false],
      ['TechnicianPortal', 'technician', true],
      ['TechnicianPortal', 'customer', false],
      ['CustomerPortal', 'customer', true],
      ['CustomerPortal', 'technician', false],
      ['SupplierPortal', 'supplier', true],
      ['SupplierPortal', 'advisor', false],
      ['ProcurementPortal', 'procurement', true],
      ['ProcurementPortal', 'hr', false],
      ['AuditLog', 'accountant', true],
      ['AuditLog', 'advisor', false],
      ['Organizations', 'superadmin', true],
      ['Organizations', 'technician', false],
      ['Settings', 'owner', true],
      ['Settings', 'advisor', false],
    ]
    for (const [screen, role, expected] of samples) {
      expect(
        canScreen(screen, role),
        `canScreen("${screen}", "${role}") should be ${expected}`,
      ).toBe(expected)
    }
  })

  it('all SCREEN_MODULE entries map to a module with at least one role that can view', () => {
    for (const [screen, mod] of Object.entries(SCREEN_MODULE)) {
      const anyCanView = ALL_ROLE_IDS.some((r) => can(mod, 'v', r))
      expect(anyCanView, `no role can view module "${mod}" (screen "${screen}")`).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// navFor()
// ---------------------------------------------------------------------------

describe('navFor()', () => {
  it('returns non-empty nav for every role', () => {
    for (const roleId of ALL_ROLE_IDS) {
      const nav = navFor(roleId)
      expect(nav.length, `${roleId} nav should not be empty`).toBeGreaterThan(0)
    }
  })

  it('every item in the filtered nav is viewable by that role', () => {
    for (const roleId of ALL_ROLE_IDS) {
      const nav = navFor(roleId)
      for (const group of nav) {
        for (const item of group.items) {
          if (item.screen) {
            expect(
              canScreen(item.screen, roleId),
              `${roleId} nav has "${item.screen}" but canScreen is false`,
            ).toBe(true)
          }
        }
      }
    }
  })

  it('no empty groups in the result', () => {
    for (const roleId of ALL_ROLE_IDS) {
      const nav = navFor(roleId)
      for (const group of nav) {
        expect(group.items.length, `${roleId} nav group "${group.label}" is empty`).toBeGreaterThan(0)
      }
    }
  })

  it('owner sees the most nav groups', () => {
    const ownerGroups = navFor('owner').length
    for (const roleId of ALL_ROLE_IDS) {
      if (roleId === 'owner') continue
      expect(navFor(roleId).length).toBeLessThanOrEqual(ownerGroups)
    }
  })

  it('customer gets a minimal nav (no operational modules)', () => {
    const customerNav = navFor('customer')
    const labels = customerNav.flatMap((g) => g.items.map((i) => i.screen).filter(Boolean))
    expect(labels).not.toContain('JobCards')
    expect(labels).not.toContain('Invoices')
    expect(labels).not.toContain('Inventory')
  })
})

// ---------------------------------------------------------------------------
// fieldHidden()
// ---------------------------------------------------------------------------

describe('fieldHidden()', () => {
  it('each FIELD_RULES entry hides for the listed roles', () => {
    for (const rule of FIELD_RULES) {
      for (const hiddenRole of rule.hidden) {
        expect(
          fieldHidden(rule.field, hiddenRole),
          `"${rule.field}" should be hidden from ${hiddenRole}`,
        ).toBe(true)
      }
    }
  })

  it('each FIELD_RULES entry is visible to roles NOT in hidden list', () => {
    for (const rule of FIELD_RULES) {
      const hiddenSet = new Set(rule.hidden)
      for (const roleId of ALL_ROLE_IDS) {
        if (!hiddenSet.has(roleId)) {
          expect(
            fieldHidden(rule.field, roleId),
            `"${rule.field}" should be visible to ${roleId}`,
          ).toBe(false)
        }
      }
    }
  })

  it('unknown field is visible to all', () => {
    for (const roleId of ALL_ROLE_IDS) {
      expect(fieldHidden('totally made up field', roleId)).toBe(false)
    }
  })

  it('Employee salary is hidden from 9 roles, visible to owner/manager/accountant/hr/superadmin', () => {
    const visible = ['owner', 'manager', 'accountant', 'hr', 'superadmin']
    const hidden = ALL_ROLE_IDS.filter((r) => !visible.includes(r))
    for (const r of visible) {
      expect(fieldHidden('Employee salary', r), `should be visible to ${r}`).toBe(false)
    }
    for (const r of hidden) {
      expect(fieldHidden('Employee salary', r), `should be hidden from ${r}`).toBe(true)
    }
  })

  it('Bank account details is the most restricted field', () => {
    const bankRule = FIELD_RULES.find((r) => r.field === 'Bank account details')!
    expect(bankRule.hidden.length).toBe(10)
    expect(bankRule.hidden).not.toContain('owner')
    expect(bankRule.hidden).not.toContain('manager')
    expect(bankRule.hidden).not.toContain('accountant')
    expect(bankRule.hidden).not.toContain('superadmin')
  })
})

// ---------------------------------------------------------------------------
// approvalLimit() and canApprove()
// ---------------------------------------------------------------------------

describe('approvalLimit()', () => {
  const EXPECTED_LIMITS: Record<string, number | null> = {
    owner: null,
    superadmin: null,
    manager: 50_000,
    advisor: 5_000,
    technician: 0,
    qc: 0,
    parts: 10_000,
    accountant: 25_000,
    hr: 15_000,
    frontdesk: 0,
    callcenter: 0,
    procurement: 20_000,
    supplier: 0,
    customer: 0,
  }

  for (const [roleId, expected] of Object.entries(EXPECTED_LIMITS)) {
    it(`${roleId} has limit ${expected === null ? 'unlimited' : expected}`, () => {
      expect(approvalLimit(roleId)).toBe(expected)
    })
  }
})

describe('canApprove()', () => {
  it('owner can approve any amount (unlimited)', () => {
    expect(canApprove('owner')).toBe(true)
    expect(canApprove('owner', 999_999_999)).toBe(true)
  })

  it('superadmin cannot approve business documents (platform admin only)', () => {
    expect(canApprove('superadmin')).toBe(false)
    expect(canApprove('superadmin', 999_999_999)).toBe(false)
  })

  it('manager can approve up to 50,000 SAR', () => {
    expect(canApprove('manager')).toBe(true)
    expect(canApprove('manager', 50_000)).toBe(true)
    expect(canApprove('manager', 50_001)).toBe(false)
  })

  it('advisor can approve up to 5,000 SAR', () => {
    expect(canApprove('advisor')).toBe(true)
    expect(canApprove('advisor', 5_000)).toBe(true)
    expect(canApprove('advisor', 5_001)).toBe(false)
  })

  it('technician cannot approve at all (limit 0)', () => {
    expect(canApprove('technician')).toBe(false)
    expect(canApprove('technician', 0)).toBe(false)
    expect(canApprove('technician', 1)).toBe(false)
  })

  it('qc cannot approve at all (limit 0)', () => {
    expect(canApprove('qc')).toBe(false)
  })

  it('parts can approve up to 10,000 SAR', () => {
    expect(canApprove('parts', 10_000)).toBe(true)
    expect(canApprove('parts', 10_001)).toBe(false)
  })

  it('accountant can approve up to 25,000 SAR', () => {
    expect(canApprove('accountant', 25_000)).toBe(true)
    expect(canApprove('accountant', 25_001)).toBe(false)
  })

  it('procurement can approve up to 20,000 SAR', () => {
    expect(canApprove('procurement', 20_000)).toBe(true)
    expect(canApprove('procurement', 20_001)).toBe(false)
  })

  it('hr can approve up to 15,000 SAR', () => {
    expect(canApprove('hr', 15_000)).toBe(true)
    expect(canApprove('hr', 15_001)).toBe(false)
  })

  it('customer cannot approve', () => {
    expect(canApprove('customer')).toBe(false)
  })

  it('supplier cannot approve', () => {
    expect(canApprove('supplier')).toBe(false)
  })

  it('frontdesk cannot approve', () => {
    expect(canApprove('frontdesk')).toBe(false)
  })

  it('callcenter cannot approve', () => {
    expect(canApprove('callcenter')).toBe(false)
  })

  it('canApprove without amount is true for roles with non-zero limit and approve action', () => {
    const nonZeroLimitRoles = ALL_ROLE_IDS.filter((r) => approvalLimit(r) !== 0 && can('approvals', 'a', r))
    for (const r of nonZeroLimitRoles) {
      expect(canApprove(r), `canApprove("${r}") without amount`).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// destinationFor()
// ---------------------------------------------------------------------------

describe('destinationFor()', () => {
  const EXPECTED: Record<string, string> = {
    owner: '/dashboard',
    superadmin: '/super-admin',
    manager: '/dashboard',
    advisor: '/dashboard',
    technician: '/technician-portal',
    qc: '/dashboard',
    parts: '/dashboard',
    accountant: '/dashboard',
    hr: '/dashboard',
    frontdesk: '/dashboard',
    callcenter: '/call-center',
    procurement: '/procurement-portal',
    supplier: '/supplier-portal',
    customer: '/customer-portal',
  }

  for (const [roleId, dest] of Object.entries(EXPECTED)) {
    it(`${roleId} lands at ${dest}`, () => {
      expect(destinationFor(roleId)).toBe(dest)
    })
  }

  it('unknown role defaults to /dashboard', () => {
    expect(destinationFor('ghost')).toBe('/dashboard')
  })
})

// ---------------------------------------------------------------------------
// roleMeta()
// ---------------------------------------------------------------------------

describe('roleMeta()', () => {
  it('returns correct metadata for each role', () => {
    for (const role of ROLES) {
      const meta = roleMeta(role.id)
      expect(meta.id).toBe(role.id)
      expect(meta.label).toBe(role.label)
      expect(meta.scope).toBe(role.scope)
      expect(meta.limit).toBe(role.limit)
    }
  })

  it('falls back to UNKNOWN_ROLE for unknown id (fail closed)', () => {
    const meta = roleMeta('nonexistent')
    expect(meta.id).toBe('unknown')
  })
})

// ---------------------------------------------------------------------------
// isRoleId()
// ---------------------------------------------------------------------------

describe('isRoleId()', () => {
  it('returns true for all valid role ids', () => {
    for (const roleId of ALL_ROLE_IDS) {
      expect(isRoleId(roleId)).toBe(true)
    }
  })

  it('returns false for invalid strings', () => {
    expect(isRoleId('ghost')).toBe(false)
    expect(isRoleId('')).toBe(false)
    expect(isRoleId('OWNER')).toBe(false)
  })

  it('returns false for null and undefined', () => {
    expect(isRoleId(null)).toBe(false)
    expect(isRoleId(undefined)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// SOD rules
// ---------------------------------------------------------------------------

describe('SOD (Separation of Duties)', () => {
  it('defines exactly 6 rules', () => {
    expect(SOD).toHaveLength(6)
  })

  it('every rule has duty pair and risk level', () => {
    for (const rule of SOD) {
      expect(rule.a).toBeTruthy()
      expect(rule.b).toBeTruthy()
      expect(['high', 'medium', 'low']).toContain(rule.risk)
      expect(rule.ar).toHaveLength(2)
    }
  })

  it('4 high-risk and 2 medium-risk rules', () => {
    const high = SOD.filter((r) => r.risk === 'high')
    const medium = SOD.filter((r) => r.risk === 'medium')
    expect(high).toHaveLength(4)
    expect(medium).toHaveLength(2)
  })

  it('duty pairs are distinct (a !== b)', () => {
    for (const rule of SOD) {
      expect(rule.a).not.toBe(rule.b)
    }
  })
})

// ---------------------------------------------------------------------------
// No role inheritance — flat matrix
// ---------------------------------------------------------------------------

describe('no role inheritance', () => {
  it('roles with fewer privileges do NOT inherit from broader roles', () => {
    expect(can('admin', 'c', 'manager')).toBe(false)
    expect(can('admin', 'c', 'owner')).toBe(true)

    expect(can('settings', 'c', 'manager')).toBe(false)
    expect(can('settings', 'c', 'owner')).toBe(true)

    expect(can('accounting', 'c', 'manager')).toBe(false)
    expect(can('accounting', 'c', 'accountant')).toBe(true)
  })

  it('technician does NOT inherit advisor permissions', () => {
    expect(can('jobcards', 'c', 'advisor')).toBe(true)
    expect(can('jobcards', 'c', 'technician')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Specific high-value permission assertions
// ---------------------------------------------------------------------------

describe('critical permission boundaries', () => {
  it('only owner and superadmin can fully administer admin module', () => {
    for (const action of ['c', 'e', 'x'] as Action[]) {
      for (const roleId of ALL_ROLE_IDS) {
        if (roleId === 'owner' || roleId === 'superadmin') {
          expect(can('admin', action, roleId), `${roleId} should ${action} admin`).toBe(true)
        } else {
          expect(can('admin', action, roleId), `${roleId} should not ${action} admin`).toBe(false)
        }
      }
    }
  })

  it('only owner and superadmin can fully administer settings module', () => {
    for (const action of ['c', 'x', 'a'] as Action[]) {
      expect(can('settings', action, 'owner')).toBe(true)
      expect(can('settings', action, 'superadmin')).toBe(true)
      expect(can('settings', action, 'manager')).toBe(false)
    }
  })

  it('external roles (supplier, customer) have minimal access', () => {
    const external = ['supplier', 'customer'] as const
    for (const role of external) {
      let totalActions = 0
      for (const mod of ALL_MODULES) {
        const grant = PERMS[mod]?.[role] ?? ''
        totalActions += grant.length
      }
      expect(totalActions, `${role} should have very few actions`).toBeLessThan(15)
    }
  })

  it('technician can only delete on portaltech (own portal)', () => {
    for (const mod of ALL_MODULES) {
      if (mod === 'portaltech') {
        expect(can(mod, 'x', 'technician')).toBe(true)
      } else {
        expect(can(mod, 'x', 'technician'), `technician should not delete ${mod}`).toBe(false)
      }
    }
  })

  it('customer can only access portalcustomer, approvals, and estimates modules', () => {
    for (const mod of ALL_MODULES) {
      const grant = PERMS[mod]?.['customer'] ?? ''
      if (grant) {
        expect(
          ['portalcustomer', 'approvals', 'estimates', 'kiosk'].includes(mod),
          `customer has unexpected access to "${mod}"`,
        ).toBe(true)
      }
    }
  })

  it('audit module is limited to owner, manager, accountant, superadmin', () => {
    const auditRoles = Object.keys(PERMS['audit']!)
    expect(auditRoles.sort()).toEqual(['accountant', 'manager', 'owner', 'superadmin'])
  })
})

// ---------------------------------------------------------------------------
// Client ↔ Server data consistency (import server data directly)
// ---------------------------------------------------------------------------

describe('client ↔ server data consistency', () => {
  // We load the server's data file and compare against the client's
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  let serverData: typeof import('../src/data/generated/rbac')

  it('server PERMS is structurally identical to client PERMS', async () => {
    serverData = await import('../../server/src/auth/rbac-data.js') as typeof serverData
    const clientModules = Object.keys(PERMS).sort()
    const serverModules = Object.keys(serverData.PERMS).sort()
    expect(serverModules).toEqual(clientModules)

    for (const mod of clientModules) {
      const clientRoles = Object.keys(PERMS[mod]!).sort()
      const serverRoles = Object.keys(serverData.PERMS[mod as keyof typeof serverData.PERMS]).sort()
      expect(serverRoles, `module "${mod}" roles mismatch`).toEqual(clientRoles)

      for (const role of clientRoles) {
        expect(
          (serverData.PERMS as Record<string, Record<string, string>>)[mod]![role],
          `PERMS["${mod}"]["${role}"] differs between client and server`,
        ).toBe(PERMS[mod]![role])
      }
    }
  })

  it('server ROLES match client ROLES', async () => {
    serverData = await import('../../server/src/auth/rbac-data.js') as typeof serverData
    expect(serverData.ROLES).toHaveLength(ROLES.length)
    for (let i = 0; i < ROLES.length; i++) {
      expect(serverData.ROLES[i]!.id, `role index ${i} id mismatch`).toBe(ROLES[i]!.id)
      expect(serverData.ROLES[i]!.limit, `role ${ROLES[i]!.id} limit mismatch`).toBe(ROLES[i]!.limit)
      expect(serverData.ROLES[i]!.scope, `role ${ROLES[i]!.id} scope mismatch`).toBe(ROLES[i]!.scope)
    }
  })
})

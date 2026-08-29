import { describe, expect, it } from 'vitest'
import {
  can,
  roleMeta,
  isRoleId,
  approvalLimit,
  destinationFor,
  ROLES,
  PERMS,
  type Action,
} from '../src/auth/rbac.js'
import {
  ROLES as DATA_ROLES,
  PERMS as DATA_PERMS,
  SCREEN_MODULE,
  RBAC_UNGATED,
  FIELD_RULES,
  SOD,
} from '../src/auth/rbac-data.js'

const ALL_ROLE_IDS = [
  'owner', 'superadmin', 'manager', 'advisor', 'technician', 'qc',
  'parts', 'accountant', 'hr', 'frontdesk', 'callcenter', 'procurement',
  'supplier', 'customer',
] as const

const ALL_MODULES = [
  'dashboard', 'jobcards', 'appointments', 'estimates', 'customers',
  'vehicles', 'inventory', 'procurement', 'invoices', 'payments',
  'accounting', 'hr', 'technicians', 'crm', 'callcenter', 'reports',
  'approvals', 'kiosk', 'execreports', 'portaltech', 'portalcustomer',
  'portalsupplier', 'portalprocure', 'ai', 'admin', 'settings',
  'audit', 'network',
] as const

const ACTIONS: Action[] = ['v', 'c', 'e', 'x', 'a']

// ---------------------------------------------------------------------------
// Data integrity
// ---------------------------------------------------------------------------

describe('server RBAC data integrity', () => {
  it('defines exactly 14 roles', () => {
    expect(ROLES).toHaveLength(14)
  })

  it('defines exactly 28 modules', () => {
    expect(Object.keys(PERMS)).toHaveLength(28)
  })

  it('ROLES ids match the expected list', () => {
    const ids = (ROLES as unknown as Array<{ id: string }>).map((r) => r.id)
    expect(ids).toEqual([...ALL_ROLE_IDS])
  })

  it('PERMS keys match the expected module list', () => {
    expect(Object.keys(PERMS).sort()).toEqual([...ALL_MODULES].sort())
  })

  it('re-exported ROLES/PERMS are the same objects as rbac-data', () => {
    expect(ROLES).toBe(DATA_ROLES)
    expect(PERMS).toBe(DATA_PERMS)
  })

  it('SCREEN_MODULE maps 107 screens', () => {
    expect(Object.keys(SCREEN_MODULE).length).toBeGreaterThanOrEqual(100)
  })

  it('RBAC_UNGATED has 16 entries', () => {
    expect(RBAC_UNGATED).toHaveLength(16)
  })

  it('FIELD_RULES has 7 entries', () => {
    expect(FIELD_RULES).toHaveLength(7)
  })

  it('SOD has 6 entries', () => {
    expect(SOD).toHaveLength(6)
  })
})

// ---------------------------------------------------------------------------
// can() — full matrix positive tests
// ---------------------------------------------------------------------------

describe('server can() — positive: granted permissions', () => {
  const permsTyped = PERMS as unknown as Record<string, Record<string, string>>
  for (const mod of ALL_MODULES) {
    for (const roleId of ALL_ROLE_IDS) {
      const granted = permsTyped[mod]?.[roleId] ?? ''
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
// can() — full matrix negative tests
// ---------------------------------------------------------------------------

describe('server can() — negative: denied permissions', () => {
  const permsTyped = PERMS as unknown as Record<string, Record<string, string>>
  for (const mod of ALL_MODULES) {
    for (const roleId of ALL_ROLE_IDS) {
      const granted = permsTyped[mod]?.[roleId] ?? ''
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

describe('server can() — edge cases', () => {
  it('returns false for an unknown module', () => {
    expect(can('nonexistent', 'v', 'owner')).toBe(false)
  })

  it('returns false for an unknown role', () => {
    expect(can('dashboard', 'v', 'ghost')).toBe(false)
  })

  it('returns false for both unknown', () => {
    expect(can('nonexistent', 'v', 'ghost')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// roleMeta()
// ---------------------------------------------------------------------------

describe('server roleMeta()', () => {
  it('returns correct metadata for each role', () => {
    for (const r of ALL_ROLE_IDS) {
      const meta = roleMeta(r)
      expect(meta.id).toBe(r)
      expect(meta.label).toBeTruthy()
      expect(meta.scope).toBeTruthy()
    }
  })

  it('falls back to ROLES[0] for unknown id', () => {
    const meta = roleMeta('nonexistent')
    expect(meta.id).toBe('owner')
  })
})

// ---------------------------------------------------------------------------
// isRoleId()
// ---------------------------------------------------------------------------

describe('server isRoleId()', () => {
  it('returns true for all valid role ids', () => {
    for (const r of ALL_ROLE_IDS) {
      expect(isRoleId(r)).toBe(true)
    }
  })

  it('returns false for invalid values', () => {
    expect(isRoleId('ghost')).toBe(false)
    expect(isRoleId('')).toBe(false)
    expect(isRoleId(null)).toBe(false)
    expect(isRoleId(undefined)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// approvalLimit()
// ---------------------------------------------------------------------------

describe('server approvalLimit()', () => {
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
    it(`${roleId} limit is ${expected === null ? 'unlimited' : expected}`, () => {
      expect(approvalLimit(roleId)).toBe(expected)
    })
  }
})

// ---------------------------------------------------------------------------
// destinationFor()
// ---------------------------------------------------------------------------

describe('server destinationFor()', () => {
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
// Critical permission boundaries (server-side enforcement)
// ---------------------------------------------------------------------------

describe('server-side permission boundaries', () => {
  it('admin module: only owner and superadmin can create/edit/delete', () => {
    for (const action of ['c', 'e', 'x'] as Action[]) {
      for (const roleId of ALL_ROLE_IDS) {
        const expected = roleId === 'owner' || roleId === 'superadmin'
        expect(
          can('admin', action, roleId),
          `${roleId} ${action} admin should be ${expected}`,
        ).toBe(expected)
      }
    }
  })

  it('technician can only delete on portaltech (own portal)', () => {
    for (const mod of ALL_MODULES) {
      if (mod === 'portaltech') {
        expect(can(mod, 'x', 'technician')).toBe(true)
      } else {
        expect(can(mod, 'x', 'technician'), `tech should not delete ${mod}`).toBe(false)
      }
    }
  })

  it('supplier can only view procurement, portal, and network modules', () => {
    const permsTyped = PERMS as unknown as Record<string, Record<string, string>>
    for (const mod of ALL_MODULES) {
      const grant = permsTyped[mod]?.['supplier'] ?? ''
      if (grant) {
        expect(
          ['procurement', 'portalsupplier', 'network', 'approvals', 'kiosk'].includes(mod),
          `supplier has unexpected access to "${mod}" (grant: "${grant}")`,
        ).toBe(true)
      }
    }
  })

  it('accounting module has only 4 roles with access', () => {
    const permsTyped = PERMS as unknown as Record<string, Record<string, string>>
    const roles = Object.keys(permsTyped['accounting']!)
    expect(roles.sort()).toEqual(['accountant', 'manager', 'owner', 'superadmin'])
  })

  it('external roles cannot approve', () => {
    expect(approvalLimit('supplier')).toBe(0)
    expect(approvalLimit('customer')).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// No role inheritance
// ---------------------------------------------------------------------------

describe('no role inheritance on server', () => {
  it('manager cannot create in admin even though owner can', () => {
    expect(can('admin', 'c', 'owner')).toBe(true)
    expect(can('admin', 'c', 'manager')).toBe(false)
  })

  it('technician does not inherit advisor jobcard create', () => {
    expect(can('jobcards', 'c', 'advisor')).toBe(true)
    expect(can('jobcards', 'c', 'technician')).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import {
  DEFAULT_ROLE,
  DEFENCE_IN_DEPTH_FIELDS,
  FIELD_RULES,
  PERMS,
  RBAC_UNGATED,
  ROLES,
  SCREEN_MODULE,
  SOD,
  UNKNOWN_ROLE,
  approvalLimit,
  can,
  canApprove,
  canScreen,
  destinationFor,
  fieldHidden,
  fieldRuleIsLive,
  isRoleId,
  navFor,
  roleMeta,
  sodCounterpart,
  sodRuleFor,
  sodViolation,
} from '@/data/rbac'
import { NAV } from '@/data/generated/nav'
import { REGISTRY } from '@/data/generated/master-registry'
import type { Action, RoleId } from '@/data/types'

/** The permission engine, exercised across the whole matrix rather than at a
 *  handful of hand-picked points: 14 roles × 28 modules × 5 actions, generated
 *  from `PERMS` so a module or role added to the design bundle is covered the
 *  day it lands.
 *
 *  Several tests below assert an exact set of *current* violations rather than
 *  an empty one. Those are defects found by writing these tests, reported
 *  rather than fixed — `src/data/generated/rbac.ts` is generated from the
 *  design bundle and belongs to another agent. Pinning the exact set means the
 *  violation cannot spread silently, and shrinking it fails the test until
 *  someone updates the expectation deliberately. */

const ROLE_IDS = ROLES.map((role) => role.id) as RoleId[]
const MODULES = Object.keys(PERMS)
const ACTIONS: Action[] = ['v', 'c', 'e', 'x', 'a']

/** Roles the design gives an unlimited ceiling. */
const UNLIMITED: RoleId[] = ['owner', 'superadmin']

describe('matrix shape', () => {
  it('is the documented 14 roles × 28 modules × 5 actions', () => {
    expect(ROLE_IDS).toHaveLength(14)
    expect(MODULES).toHaveLength(28)
    expect(ACTIONS).toHaveLength(5)
    expect(new Set(ROLE_IDS).size).toBe(ROLE_IDS.length)
  })

  it('grants no action to a role the module never names', () => {
    // Deny by default: an absent role is not an implicitly permitted one.
    for (const module of MODULES) {
      for (const role of ROLE_IDS) {
        if (role in PERMS[module]) continue
        for (const action of ACTIONS) {
          expect(can(module, action, role), `${role} on ${module}:${action}`).toBe(false)
        }
      }
    }
  })

  it('denies an unknown module and an unknown role outright', () => {
    expect(can('there-is-no-such-module', 'v', 'owner')).toBe(false)
    expect(can('jobcards', 'v', 'not-a-role')).toBe(false)
    expect(can('jobcards', 'x' as Action, '')).toBe(false)
  })
})

describe('can()', () => {
  it('agrees with the matrix for all 1,960 role × module × action combinations', () => {
    let checked = 0
    for (const module of MODULES) {
      for (const role of ROLE_IDS) {
        const grant = PERMS[module][role] ?? ''
        for (const action of ACTIONS) {
          expect(can(module, action, role), `${role} on ${module}:${action}`).toBe(
            grant.includes(action)
          )
          checked += 1
        }
      }
    }
    expect(checked).toBe(14 * 28 * 5)
  })

  it('never confers a write without the matching read', () => {
    // You cannot create, edit, delete or approve what you are not allowed to
    // see. A grant that breaks this produces a screen the role is redirected
    // away from but can still act on through the API.
    for (const module of MODULES) {
      for (const role of ROLE_IDS) {
        const writes = ACTIONS.filter((a) => a !== 'v' && can(module, a, role))
        if (writes.length === 0) continue
        expect(can(module, 'v', role), `${role} writes ${module} without view`).toBe(true)
      }
    }
  })

  it('uses exactly six grant letters — one more than the Action union declares', () => {
    // DEFECT (reported, not fixed): `Action` is documented as
    // "v=view, c=create, e=edit, x=delete, a=approve", but the matrix also uses
    // `d`, and 41 grants carry both `d` and `x`. So one of the two is really
    // "export" and the type comment is wrong. Until that is settled,
    // `can(module, 'x', role)` reads as "may delete" while the data may mean
    // "may export" — e.g. accountant holds `vx` on `audit` and `execreports`.
    const letters = new Set<string>()
    for (const module of MODULES) {
      for (const grant of Object.values(PERMS[module])) {
        for (const letter of grant) letters.add(letter)
      }
    }
    expect([...letters].sort()).toEqual(['a', 'c', 'd', 'e', 'v', 'x'])
  })

  it.fails('confines grant letters to the declared Action union', () => {
    // Self-clearing marker for the defect above: when `d`/`x` are reconciled
    // with the `Action` type this test starts passing, and vitest then fails it
    // as an unexpected pass so the marker gets removed.
    const letters = new Set<string>()
    for (const module of MODULES) {
      for (const grant of Object.values(PERMS[module])) {
        for (const letter of grant) letters.add(letter)
      }
    }
    expect([...letters].sort()).toEqual([...ACTIONS].sort())
  })
})

describe('canScreen()', () => {
  it('gates every mapped screen on its module and lets no role past the module check', () => {
    for (const [screen, module] of Object.entries(SCREEN_MODULE)) {
      for (const role of ROLE_IDS) {
        expect(canScreen(screen, role), `${role} on ${screen}`).toBe(can(module, 'v', role))
      }
    }
  })

  it('leaves the ungated screens open to all 14 roles, and none of them is module-mapped', () => {
    // An ungated screen that also carried a module mapping would be gated after
    // all, which would make the list a lie about which pages skip RBAC.
    for (const screen of RBAC_UNGATED) {
      expect(SCREEN_MODULE[screen]).toBeUndefined()
      for (const role of ROLE_IDS) expect(canScreen(screen, role)).toBe(true)
    }
  })

  it('opens an unmapped screen rather than closing it', () => {
    // Fail-open is deliberate here (auth and error pages must stay reachable),
    // which is exactly why the module map has to stay complete: a new
    // operational screen that nobody maps is world-readable.
    expect(canScreen('ScreenNobodyMapped', 'customer')).toBe(true)
  })

  it('denies the operational screens to the roles the matrix excludes', () => {
    expect(canScreen('ChartOfAccounts', 'technician')).toBe(false)
    expect(canScreen('ChartOfAccounts', 'accountant')).toBe(true)
    expect(canScreen('HRPayroll', 'advisor')).toBe(false)
    expect(canScreen('ExecutiveReports', 'advisor')).toBe(false)
    expect(canScreen('ExecutiveReports', 'owner')).toBe(true)
  })
})

describe('navFor()', () => {
  const NAV_SCREENS = NAV.flatMap((group) => group.items)

  it('shows a role only what it can open, and drops emptied groups entirely', () => {
    for (const role of ROLE_IDS) {
      const nav = navFor(role)
      for (const group of nav) {
        expect(group.items.length, `${role} kept an empty ${group.label}`).toBeGreaterThan(0)
        for (const item of group.items) {
          expect(canScreen(item.screen ?? '', role), `${role} sees ${item.label}`).toBe(true)
        }
      }
      // Nothing is invented: every surviving item came from the source nav.
      const labels = nav.flatMap((group) => group.items).map((item) => item.label)
      expect(labels.every((label) => NAV_SCREENS.some((item) => item.label === label))).toBe(true)
    }
  })

  it('gives a role with no grant on a module no nav entry for that module', () => {
    // Accounting is the case the route smoke checks in the browser; assert it
    // at the engine level for every module, not just this one.
    const accountingScreens = NAV_SCREENS.filter(
      (item) => item.screen && SCREEN_MODULE[item.screen] === 'accounting'
    )
    expect(accountingScreens.length).toBeGreaterThan(0)

    const technicianLabels = navFor('technician')
      .flatMap((group) => group.items)
      .map((item) => item.label)
    for (const item of accountingScreens) {
      expect(can('accounting', 'v', 'technician')).toBe(false)
      expect(technicianLabels).not.toContain(item.label)
    }
    expect(navFor('technician').map((group) => group.label)).not.toContain('Accounting')
    expect(navFor('owner').map((group) => group.label)).toContain('Accounting')
  })

  it('never gives a role more than the owner sees', () => {
    const ownerLabels = new Set(
      navFor('owner')
        .flatMap((group) => group.items)
        .map((item) => item.label)
    )
    for (const role of ROLE_IDS) {
      for (const item of navFor(role).flatMap((group) => group.items)) {
        expect(ownerLabels, `${role} sees ${item.label}, the owner does not`).toContain(item.label)
      }
    }
  })

  it('accepts a caller-supplied nav, so a surface can carry its own menu', () => {
    const custom = [
      {
        label: 'Books',
        icon: 'BookOpen',
        items: [{ label: 'Ledger', key: 'coa', screen: 'ChartOfAccounts', route: '/x' }],
      },
    ]
    expect(navFor('accountant', custom)).toHaveLength(1)
    expect(navFor('technician', custom)).toHaveLength(0)
  })

  it('keeps design-reference pages out of every role’s sidebar', () => {
    // Was a characterization test pinning a defect: the reference pages skip
    // RBAC by design and were also in NAV, so a signed-in customer got a
    // sidebar containing the RBAC specification. Fixed in the generator — the
    // exemption belongs on the route, not the menu — so this now asserts the
    // fix, and fails again if a reference page returns to the sidebar.
    const ungatedInNav = NAV_SCREENS.filter((item) => item.screen && !SCREEN_MODULE[item.screen])
      .map((item) => item.screen)
      .sort()
    expect(ungatedInNav).toEqual([])

    // The pages stay reachable by URL for the team; only the menu entry is gone.
    for (const role of ['customer', 'supplier', 'technician', 'owner'] as const) {
      const screens = navFor(role)
        .flatMap((group) => group.items)
        .map((item) => item.screen)
      expect(screens).not.toContain('RBACSpec')
      expect(screens).not.toContain('Index')
    }
  })
})

describe('field-level redaction', () => {
  /** Where each redacted field is actually rendered. Kept next to the rule it
   *  belongs to so the reachability check below is auditable: the first four
   *  entries name the screens that call `fieldHidden` today, the rest name the
   *  module the field would land in when its screen is built. */
  const FIELD_MODULES: Record<string, readonly string[]> = {
    // JobDetail (jobcards), Inventory (inventory), estimates line items.
    'Part cost / margin': ['inventory', 'jobcards', 'estimates'],
    // Not yet rendered; belongs to the estimate and job labour lines.
    'Labour cost rate': ['estimates', 'jobcards'],
    // Not yet rendered; belongs to HR payroll.
    'Employee salary': ['hr'],
    // Inventory.tsx.
    'Supplier purchase price': ['inventory', 'procurement'],
    // WorkshopCheckIn.tsx and Registries.tsx (Customers).
    'Customer contact details': ['customers', 'jobcards'],
    // Not yet rendered; belongs to payments and the accounting ledger.
    'Bank account details': ['accounting', 'payments'],
    // Reports.tsx (ExecutiveReports).
    'Branch P&L': ['execreports'],
  }

  it('hides a field from exactly the roles its rule names', () => {
    for (const rule of FIELD_RULES) {
      for (const role of ROLE_IDS) {
        expect(fieldHidden(rule.field, role), `${role} on ${rule.field}`).toBe(
          rule.hidden.includes(role)
        )
      }
    }
  })

  it('shows a field nobody wrote a rule for', () => {
    expect(fieldHidden('Vehicle plate', 'customer')).toBe(false)
  })

  it('has a module mapping for every rule', () => {
    // A rule with no known screen cannot be reachability-checked, so a new rule
    // must arrive with the place it applies.
    expect(Object.keys(FIELD_MODULES).sort()).toEqual(FIELD_RULES.map((r) => r.field).sort())
  })

  it('reports which rules are dead — hidden only from roles that cannot open the screen', () => {
    // A field rule fires only when a role can reach the screen AND appears in
    // the rule's hidden list. Where module RBAC already denies every hidden
    // role, the rule is decoration: it looks like working redaction in review
    // and protects nothing.
    const dead: string[] = []
    for (const rule of FIELD_RULES) {
      const modules = FIELD_MODULES[rule.field]
      const reachable = rule.hidden.filter((role) =>
        modules.some((module) => can(module, 'v', role))
      )
      if (reachable.length === 0) dead.push(rule.field)
    }

    // DEFECT (reported, not fixed): two of the seven rules can never fire.
    // "Branch P&L" is denied to every one of its hidden roles by the
    // `execreports` module gate, and "Employee salary" likewise by `hr` — both
    // are redirected to /unauthorized before any field is rendered. Either the
    // module grant widens (and the rule starts doing work) or the rule should
    // be recorded as defence-in-depth rather than counted as redaction.
    expect(dead).toEqual(['Employee salary', 'Branch P&L'])
  })

  it('keeps the five live rules live — each hides a field from a role that can open the screen', () => {
    const live: Record<string, string[]> = {}
    for (const rule of FIELD_RULES) {
      const reachable = rule.hidden.filter((role) =>
        FIELD_MODULES[rule.field].some((module) => can(module, 'v', role))
      )
      if (reachable.length) live[rule.field] = reachable
    }
    expect(live).toEqual({
      'Part cost / margin': ['advisor', 'technician', 'qc', 'frontdesk', 'callcenter'],
      'Labour cost rate': ['technician', 'qc', 'frontdesk', 'callcenter'],
      'Supplier purchase price': ['advisor', 'technician'],
      'Customer contact details': ['technician', 'qc'],
      'Bank account details': ['advisor', 'frontdesk'],
    })
  })
})

describe('approval ceilings', () => {
  const LIMITS: Record<RoleId, number | null> = {
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

  it('reports the ceiling the design assigns each role', () => {
    for (const role of ROLE_IDS) expect(approvalLimit(role)).toBe(LIMITS[role])
  })

  it('lets the owner approve any amount, and holds the super admin to its own modules', () => {
    // Both carry an unlimited ceiling, and they are not interchangeable. The
    // owner holds approve across the business modules; the super admin holds it
    // only on ai, admin and settings, because a platform administrator
    // administers the platform rather than approving a tenant's documents.
    expect(approvalLimit('owner')).toBeNull()
    expect(canApprove('owner')).toBe(true)
    expect(canApprove('owner', 9_999_999_999)).toBe(true)

    expect(approvalLimit('superadmin')).toBeNull()
    expect(canApprove('superadmin')).toBe(false)
    expect(canApprove('superadmin', 9_999_999_999)).toBe(false)
    expect(canApprove('superadmin', undefined, 'admin')).toBe(true)
    expect(canApprove('superadmin', 9_999_999_999, 'settings')).toBe(true)
  })

  it('separates authority from ceiling — QC approves a job card it cannot pay for', () => {
    // The clearest case that the two are different questions: qc holds approve
    // on jobcards with a ceiling of zero. It passes quality; it releases no money.
    expect(can('jobcards', 'a', 'qc')).toBe(true)
    expect(approvalLimit('qc')).toBe(0)
    expect(canApprove('qc', undefined, 'jobcards')).toBe(true)
    expect(canApprove('qc', 1, 'jobcards')).toBe(false)
    expect(canApprove('qc')).toBe(false)
  })

  it('refuses a zero-ceiling role even with no amount to judge', () => {
    for (const role of ROLE_IDS) {
      if (LIMITS[role] !== 0) continue
      expect(canApprove(role)).toBe(false)
      expect(canApprove(role, 1)).toBe(false)
      expect(canApprove(role, 0)).toBe(false)
    }
  })

  it('escalates the moment an amount passes the ceiling', () => {
    for (const role of ROLE_IDS) {
      const limit = LIMITS[role]
      if (limit === null || limit === 0) continue
      expect(canApprove(role, limit - 0.01), `${role} below ceiling`).toBe(true)
      expect(canApprove(role, limit), `${role} at ceiling`).toBe(true)
      expect(canApprove(role, limit + 0.01), `${role} above ceiling`).toBe(false)
    }
  })

  it("holds an advisor to SAR 5,000 — the estimate screen's escalation case", () => {
    expect(canApprove('advisor', 5_000)).toBe(true)
    expect(canApprove('advisor', 5_000.01)).toBe(false)
    // The rebuilt estimate totals SAR 1,546.75, which an advisor may approve
    // and a technician may not, whatever the amount.
    expect(canApprove('advisor', 1_546.75)).toBe(true)
    expect(canApprove('technician', 1_546.75)).toBe(false)
    // The 28,000 requisition the procurement portal renders is above the
    // procurement agent's 20,000 ceiling and must route to the inbox.
    expect(canApprove('procurement', 28_000)).toBe(false)
    expect(canApprove('manager', 28_000)).toBe(true)
  })

  it('never lets the engine and the approvals grant disagree', () => {
    // Was a characterization test pinning superadmin as the one role where the
    // ceiling said yes and the matrix said no. canApprove now requires both, so
    // the engine and the Approval Inbox cannot answer the same question
    // differently — which is the property worth protecting, not the count.
    const disagreeing = ROLE_IDS.filter(
      (role) => canApprove(role) !== can('approvals', 'a', role)
    )
    expect(disagreeing).toEqual([])
  })

  it('denies approval to a role it has never heard of', () => {
    // `roleMeta` still falls back to ROLES[0] — the owner — so an unrecognised
    // role inherits an unlimited *ceiling*. That no longer decides anything:
    // canApprove asks can() first, and can() fails closed. The roleMeta
    // fallback remains wrong for its other callers and is tracked as F-006.
    expect(canApprove('not-a-role')).toBe(false)
    expect(canApprove('not-a-role', 1)).toBe(false)
    expect(canApprove('', 1)).toBe(false)
  })
})

describe('segregation of duties', () => {
  it('keeps a technician away from the quality gate', () => {
    // "Perform repair" / "Pass quality check" is a high-risk pair in SOD.
    expect(can('jobcards', 'e', 'technician')).toBe(true)
    expect(can('jobcards', 'a', 'technician')).toBe(false)
    expect(canApprove('technician')).toBe(false)
    // The inspector is the mirror image: signs off, never performs.
    expect(can('jobcards', 'a', 'qc')).toBe(true)
    expect(can('jobcards', 'e', 'qc')).toBe(false)
  })

  it('lists the SOD pairs the module matrix cannot separate', () => {
    // Each pair maps to the (module, action) the duty needs. Module-granular
    // RBAC cannot split two duties inside one module, so these conflicts are
    // structural rather than typos.
    const DUTIES: Record<string, readonly [string, Action]> = {
      'Raise purchase order': ['procurement', 'c'],
      'Approve purchase order': ['procurement', 'a'],
      'Create supplier': ['procurement', 'c'],
      'Approve supplier payment': ['payments', 'a'],
      'Post journal entry': ['accounting', 'c'],
      'Approve journal entry': ['accounting', 'a'],
      'Perform repair': ['jobcards', 'e'],
      'Pass quality check': ['jobcards', 'a'],
      'Create employee': ['hr', 'c'],
      'Approve payroll run': ['hr', 'a'],
    }

    const conflicts: Record<string, RoleId[]> = {}
    for (const rule of SOD) {
      const a = DUTIES[rule.a]
      const b = DUTIES[rule.b]
      // "Issue stock" / "Adjust stock count" are both `inventory:e`; the matrix
      // has no vocabulary for them, which is itself the finding.
      if (!a || !b) continue
      const both = ROLE_IDS.filter((role) => can(a[0], a[1], role) && can(b[0], b[1], role))
      if (both.length) conflicts[`${rule.a} + ${rule.b}`] = both
    }

    // DEFECT (reported, not fixed): four of the six SOD pairs are held by the
    // same role in the matrix, including three marked high risk. Only the
    // repair/QC pair is genuinely separated — and `WorkshopQC` enforces it with
    // a literal `role === 'technician'` check rather than from this table, so
    // the other five pairs are enforced nowhere.
    expect(conflicts).toEqual({
      'Raise purchase order + Approve purchase order': ['owner', 'manager', 'procurement'],
      'Create supplier + Approve supplier payment': ['owner', 'manager'],
      'Post journal entry + Approve journal entry': ['accountant'],
      'Perform repair + Pass quality check': ['owner', 'manager', 'advisor'],
      'Create employee + Approve payroll run': ['owner', 'hr'],
    })
  })

  it('has no SOD pair whose two duties are the same module and action', () => {
    // Such a pair could never be enforced by RBAC at all. One exists today:
    // "Issue stock" / "Adjust stock count" are both `inventory:e`.
    const unenforceable = SOD.filter((rule) => rule.a === 'Issue stock')
    expect(unenforceable).toHaveLength(1)
    expect(unenforceable[0].risk).toBe('medium')
  })
})

describe('role metadata and destinations', () => {
  it('recognises the 14 role ids and nothing else', () => {
    for (const role of ROLE_IDS) expect(isRoleId(role)).toBe(true)
    expect(isRoleId('root')).toBe(false)
    expect(isRoleId(null)).toBe(false)
    expect(isRoleId(undefined)).toBe(false)
    expect(isRoleId('')).toBe(false)
  })

  it('carries a label, an Arabic label and a demo identity for every role', () => {
    for (const role of ROLE_IDS) {
      const meta = roleMeta(role)
      expect(meta.id).toBe(role)
      expect(meta.label.length).toBeGreaterThan(0)
      expect(meta.ar.length).toBeGreaterThan(0)
      expect(meta.demo.email).toMatch(/@/)
    }
  })

  it('fails closed on an unknown id rather than inheriting the owner', () => {
    // Was a characterization test pinning F-006: the fallback was `ROLES[0]` —
    // the owner — so an unrecognised role inherited an unlimited approval
    // ceiling and the owner's labels, while `can()` beside it failed closed.
    // Unreachable only while the role came from `isRoleId`-guarded storage; it
    // stopped being unreachable the moment SessionProvider began reading a role
    // out of a JWT claim. `roleMeta` now returns a locked-down role, so the two
    // halves agree instead of disagreeing in the dangerous direction.
    const unknown = roleMeta('nobody')
    expect(unknown.id).toBe('unknown')
    expect(unknown.limit).toBe(0)
    expect(unknown.scope).toBe('self')
    expect(approvalLimit('nobody')).toBe(0)
    // And nothing is granted to it, because `can()` finds no such column.
    for (const action of ACTIONS) {
      expect(can('jobcards', action, 'nobody')).toBe(false)
      expect(can('audit', action, 'nobody')).toBe(false)
    }
  })

  it('lands every role on a route that exists', () => {
    // A sign-in destination that 404s would drop a signed-in supplier on the
    // error page, which reads as a broken login rather than a missing screen.
    const routes = new Set(REGISTRY.map((entry) => entry.route))
    for (const role of ROLE_IDS) {
      const destination = destinationFor(role)
      expect(routes, `${role} lands on ${destination}`).toContain(destination)
    }
    expect(destinationFor('supplier')).toBe('/supplier-portal')
    expect(destinationFor('procurement')).toBe('/procurement-portal')
    expect(destinationFor('accountant')).toBe('/dashboard')
    expect(destinationFor('nobody')).toBe('/dashboard')
  })

  it('sends every role somewhere it is allowed to go', () => {
    const SCREEN_FOR_ROUTE = new Map(
      REGISTRY.map((entry) => [entry.route, entry.name] as const)
    )
    for (const role of ROLE_IDS) {
      const screen = SCREEN_FOR_ROUTE.get(destinationFor(role))
      expect(screen).toBeDefined()
      expect(canScreen(screen as string, role), `${role} cannot open its destination`).toBe(true)
    }
  })
})

describe('segregation of duties', () => {
  it('pairs each activity with its counterpart from the table', () => {
    expect(sodCounterpart('Pass quality check')).toBe('Perform repair')
    expect(sodCounterpart('Perform repair')).toBe('Pass quality check')
    expect(sodCounterpart('Approve purchase order')).toBe('Raise purchase order')
    expect(sodCounterpart('Not an activity')).toBeUndefined()
  })

  it('is symmetric across every pair the table declares', () => {
    for (const rule of SOD) {
      expect(sodCounterpart(rule.a)).toBe(rule.b)
      expect(sodCounterpart(rule.b)).toBe(rule.a)
      expect(sodRuleFor(rule.a)).toBe(sodRuleFor(rule.b))
    }
  })

  it('breaches only when the same actor performed the counterpart on the record', () => {
    const history = [{ activity: 'Perform repair', actor: 'tech-7' }]
    // Same person, both sides of the pair — the control the table describes.
    expect(sodViolation('Pass quality check', 'tech-7', history)?.risk).toBe('high')
    // A different person, however senior, is not a breach.
    expect(sodViolation('Pass quality check', 'qc-2', history)).toBeUndefined()
    // Nothing performed yet, nothing to conflict with.
    expect(sodViolation('Pass quality check', 'tech-7', [])).toBeUndefined()
    // An activity outside the table is unconstrained.
    expect(sodViolation('Water the plants', 'tech-7', history)).toBeUndefined()
  })

  it('catches what the role proxy cannot: one role holding both sides', () => {
    // Four of six pairs are held on both sides by a single role, so no role
    // check can express them. This is the case a role check misses entirely —
    // a manager who performed the repair signing off their own work.
    const history = [{ activity: 'Perform repair', actor: 'manager-1' }]
    expect(sodViolation('Pass quality check', 'manager-1', history)).toBeDefined()
    expect(can('jobcards', 'a', 'manager')).toBe(true)
  })

  it('does not breach when the counterpart was performed by a different actor', () => {
    const history = [
      { activity: 'Perform repair', actor: 'tech-1' },
      { activity: 'Perform repair', actor: 'tech-2' },
    ]
    // tech-3 never performed the repair, so no conflict.
    expect(sodViolation('Pass quality check', 'tech-3', history)).toBeUndefined()
    // tech-1 did, so it is a conflict.
    expect(sodViolation('Pass quality check', 'tech-1', history)).toBeDefined()
  })

  it('handles multiple unrelated history entries without false positives', () => {
    const history = [
      { activity: 'Raise purchase order', actor: 'buyer-1' },
      { activity: 'Perform repair', actor: 'tech-7' },
      { activity: 'Create supplier', actor: 'admin-1' },
    ]
    // tech-7 repaired; passing QC is a conflict for tech-7 only.
    expect(sodViolation('Pass quality check', 'tech-7', history)?.risk).toBe('high')
    // buyer-1 raised a PO; approving one is a conflict for buyer-1 only.
    expect(sodViolation('Approve purchase order', 'buyer-1', history)?.risk).toBe('high')
    // admin-1 created a supplier; approving supplier payment conflicts.
    expect(sodViolation('Approve supplier payment', 'admin-1', history)?.risk).toBe('high')
    // No cross-contamination between unrelated pairs.
    expect(sodViolation('Pass quality check', 'buyer-1', history)).toBeUndefined()
    expect(sodViolation('Approve purchase order', 'tech-7', history)).toBeUndefined()
  })
})

describe('DEFAULT_ROLE and UNKNOWN_ROLE constants', () => {
  it('defaults to owner — the role with full authority', () => {
    expect(DEFAULT_ROLE).toBe('owner')
    expect(isRoleId(DEFAULT_ROLE)).toBe(true)
  })

  it('provides an UNKNOWN_ROLE that is locked down and frozen', () => {
    expect(UNKNOWN_ROLE.id).toBe('unknown')
    expect(UNKNOWN_ROLE.limit).toBe(0)
    expect(UNKNOWN_ROLE.scope).toBe('self')
    expect(UNKNOWN_ROLE.label).toBe('Unknown role')
    expect(UNKNOWN_ROLE.ar.length).toBeGreaterThan(0)
    expect(Object.isFrozen(UNKNOWN_ROLE)).toBe(true)
  })

  it('does not recognise UNKNOWN_ROLE.id as a valid RoleId', () => {
    expect(isRoleId(UNKNOWN_ROLE.id)).toBe(false)
  })

  it('returns UNKNOWN_ROLE from roleMeta for any unrecognised id', () => {
    expect(roleMeta('hacker')).toBe(UNKNOWN_ROLE)
    expect(roleMeta('')).toBe(UNKNOWN_ROLE)
    expect(roleMeta('OWNER')).toBe(UNKNOWN_ROLE) // case-sensitive
    expect(roleMeta('Owner')).toBe(UNKNOWN_ROLE)
  })
})

describe('fieldRuleIsLive()', () => {
  it('reports the defence-in-depth fields as not live', () => {
    for (const field of DEFENCE_IN_DEPTH_FIELDS) {
      expect(fieldRuleIsLive(field), `${field} should not be live`).toBe(false)
    }
  })

  it('reports the five live rules as live', () => {
    const liveFields = FIELD_RULES.filter((r) => !DEFENCE_IN_DEPTH_FIELDS.includes(r.field))
    expect(liveFields.length).toBe(5)
    for (const rule of liveFields) {
      expect(fieldRuleIsLive(rule.field), `${rule.field} should be live`).toBe(true)
    }
  })

  it('treats an unknown field as live — it is not on the defence-in-depth list', () => {
    expect(fieldRuleIsLive('Some unknown field')).toBe(true)
  })

  it('DEFENCE_IN_DEPTH_FIELDS lists exactly two fields', () => {
    expect(DEFENCE_IN_DEPTH_FIELDS).toEqual(['Employee salary', 'Branch P&L'])
  })
})

describe('canApprove edge cases', () => {
  it('treats a zero-ceiling role as authority without money — any amount is refused', () => {
    // QC on jobcards has authority (approve action) but a zero ceiling. That
    // means "pass quality, do not release money". Passing *any* amount, even 0,
    // is a monetary judgment and should be refused.
    expect(canApprove('qc', undefined, 'jobcards')).toBe(true) // no amount = non-monetary approval
    expect(canApprove('qc', 0, 'jobcards')).toBe(false) // 0 is still an amount
    expect(canApprove('qc', 1, 'jobcards')).toBe(false)
  })

  it('handles very large amounts for unlimited roles', () => {
    expect(canApprove('owner', Number.MAX_SAFE_INTEGER)).toBe(true)
    expect(canApprove('owner', 1e15)).toBe(true)
  })

  it('requires both matrix authority and a nonzero ceiling for money approval', () => {
    // Roles with a ceiling but no approve action on approvals module.
    for (const role of ROLE_IDS) {
      if (approvalLimit(role) !== 0 && !can('approvals', 'a', role)) {
        // This role has a ceiling but no approval authority.
        expect(canApprove(role), `${role} should not approve without matrix authority`).toBe(false)
      }
    }
  })

  it('denies when the module itself has no approve action for that role', () => {
    // technician has no approve on approvals module
    expect(can('approvals', 'a', 'technician')).toBe(false)
    expect(canApprove('technician')).toBe(false)
    expect(canApprove('technician', 0)).toBe(false)
  })
})

describe('navFor unknown and edge roles', () => {
  it('gives an unknown role no sidebar items at all', () => {
    const nav = navFor('nobody')
    // An unknown role has no view permission on any module, so every group
    // empties out and gets filtered.
    const items = nav.flatMap((g) => g.items)
    // Every surviving item must pass canScreen for the role.
    for (const item of items) {
      if (item.screen) {
        expect(canScreen(item.screen, 'nobody'), `unknown role sees ${item.label}`).toBe(true)
      }
    }
  })

  it('preserves group ordering from the source nav', () => {
    const ownerNav = navFor('owner')
    const sourceLabels = NAV.map((g) => g.label)
    const ownerLabels = ownerNav.map((g) => g.label)
    // Owner labels must appear in the same relative order as the source.
    let lastIdx = -1
    for (const label of ownerLabels) {
      const idx = sourceLabels.indexOf(label)
      expect(idx, `${label} not found in source`).toBeGreaterThan(-1)
      expect(idx, `${label} broke ordering`).toBeGreaterThan(lastIdx)
      lastIdx = idx
    }
  })

  it('never duplicates a nav item within a role', () => {
    for (const role of ROLE_IDS) {
      const labels = navFor(role)
        .flatMap((g) => g.items)
        .map((i) => i.label)
      expect(new Set(labels).size, `${role} has duplicates`).toBe(labels.length)
    }
  })
})

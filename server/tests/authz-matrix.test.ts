/** The server's matrix and the client's must be the same table.
 *
 *  `rbac-parity.test.ts` already checks that `@salis/contract` and
 *  `app/src/data/generated/rbac.ts` agree. This suite checks the half that
 *  matters for authorization and that nothing had asserted: that the *server's
 *  enforcement* reads that table, letter for letter, with the right meaning
 *  attached to each letter — and that the six-letter reading is what the API
 *  actually applies over HTTP, not merely what a comment says.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { MODULE_IDS, PERMS, ROLE_IDS, type RoleId } from '@salis/contract'
import { PERMS as APP_PERMS } from '../../app/src/data/generated/rbac'
import { buildApp } from '../src/app'
import {
  GRANT_ACTIONS,
  describeAction,
  granted,
  grantLettersInMatrix,
  isGrantAction,
} from '../src/security/actions'
import { canApprove, ceilingHalalas } from '../src/security/approvals'
import { DEFENCE_IN_DEPTH_FIELDS, GLOBAL_REDACTIONS, redact } from '../src/security/permissions'
import { pairStatus, sodViolation, activitiesOf } from '../src/security/sod'
import { createDb, type DbHandle } from '../src/db/client'
import type { Principal } from '../src/db/tenant'
import { resetDatabase, SEED } from './harness'
import { SignJWT } from 'jose'

let app: FastifyInstance
let handle: DbHandle
let sign: (role: RoleId) => Promise<string>

beforeAll(async () => {
  const env = await resetDatabase()
  handle = createDb(env.DATABASE_URL, 5)
  app = await buildApp({ db: handle.db, env })
  await app.ready()
  const key = new TextEncoder().encode(env.JWT_SECRET as string)
  sign = (role) =>
    new SignJWT({ role, org_id: SEED.orgId, branch_id: SEED.mainBranchId })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(`01JMATRIX${role.toUpperCase().padEnd(17, 'X').slice(0, 17)}`)
      .setIssuer(env.JWT_ISSUER)
      .setAudience(env.JWT_AUDIENCE)
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(key)
})

afterAll(async () => {
  await app?.close()
  await handle?.close()
})

describe('the server enforces the identical table the client renders', () => {
  it('matches on every one of the 392 module × role cells, string for string', () => {
    const differences: string[] = []
    for (const module of MODULE_IDS) {
      for (const role of ROLE_IDS) {
        const server = PERMS[module][role]
        const client = (APP_PERMS as Record<string, Record<string, string>>)[module]?.[role] ?? ''
        if (server !== client) differences.push(`${module}/${role}: "${server}" vs "${client}"`)
      }
    }
    expect(differences).toEqual([])
    expect(MODULE_IDS.length * ROLE_IDS.length).toBe(392)
  })

  it('answers every one of the 2,352 role × module × action questions from the table', () => {
    // Not a sample: 14 roles × 28 modules × 6 actions, generated from PERMS, so
    // a module or role added to the design bundle is covered the day it lands.
    let checked = 0
    for (const module of MODULE_IDS) {
      for (const role of ROLE_IDS) {
        const grant = PERMS[module][role]
        for (const action of GRANT_ACTIONS) {
          expect(granted(module, action, role), `${role} on ${module}:${action}`).toBe(
            grant.includes(action),
          )
          checked += 1
        }
      }
    }
    expect(checked).toBe(14 * 28 * 6)
  })

  it('fails closed on an unknown module and an unknown role', () => {
    for (const action of GRANT_ACTIONS) {
      expect(granted('no-such-module', action, 'owner')).toBe(false)
      expect(granted('jobcards', action, 'not-a-role')).toBe(false)
      expect(granted('jobcards', action, '')).toBe(false)
    }
  })
})

describe('the grant alphabet', () => {
  it('is six letters, and x is export while d is delete', () => {
    expect(grantLettersInMatrix()).toEqual(['a', 'c', 'd', 'e', 'v', 'x'])
    expect([...GRANT_ACTIONS].sort()).toEqual(['a', 'c', 'd', 'e', 'v', 'x'])
    expect(describeAction('x')).toBe('export')
    expect(describeAction('d')).toBe('delete')
    expect(isGrantAction('d')).toBe(true)
    expect(isGrantAction('z')).toBe(false)
  })

  it('names the roles the wrong reading would have handed a delete grant', () => {
    // This is F-001 stated as a test rather than a note. Under `x = delete`
    // every one of these holds delete on a module it may only look at and
    // download. The audit log is the one that matters most: the audit standard
    // requires it to be immutable, and the database enforces that with a
    // trigger — but the API would have been offering the operation.
    const wouldHaveHadDelete: string[] = []
    for (const module of MODULE_IDS) {
      for (const role of ROLE_IDS) {
        const grant = PERMS[module][role]
        if (grant.includes('x') && !grant.includes('d')) wouldHaveHadDelete.push(`${role}/${module}`)
      }
    }
    expect(wouldHaveHadDelete).toContain('accountant/audit')
    expect(wouldHaveHadDelete).toContain('accountant/jobcards')
    expect(wouldHaveHadDelete).toContain('technician/portaltech')
    expect(wouldHaveHadDelete).toContain('customer/portalcustomer')
    expect(wouldHaveHadDelete.length).toBeGreaterThan(20)

    // And none of them actually has it.
    for (const cell of wouldHaveHadDelete) {
      const [role, module] = cell.split('/') as [string, string]
      expect(granted(module, 'd', role), `${cell} must not hold delete`).toBe(false)
    }
  })

  it('refuses the delete over HTTP for a role that only holds export', async () => {
    // accountant: customers = "vx". It may read and download customers. It may
    // not remove one, and the API is where that is decided.
    expect(PERMS.customers.accountant).toBe('vx')
    const token = await sign('accountant')
    const list = await app.inject({
      method: 'GET',
      url: '/api/v1/customers?pageSize=1',
      headers: { authorization: `Bearer ${token}` },
    })
    expect(list.statusCode, list.body).toBe(200)
    const row = (list.json() as { rows: { _id: string }[] }).rows[0]
    expect(row).toBeDefined()

    const remove = await app.inject({
      method: 'DELETE',
      url: `/api/v1/customers/${row!._id}`,
      headers: { authorization: `Bearer ${token}` },
    })
    expect(remove.statusCode, remove.body).toBe(403)
    expect(remove.json().error.message).toMatch(/may not delete/)

    // Bulk delete is the same decision by another route.
    const bulk = await app.inject({
      method: 'POST',
      url: '/api/v1/customers/bulk-delete',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      payload: JSON.stringify({ ids: [row!._id] }),
    })
    expect(bulk.statusCode).toBe(403)

    // The row is still there, so the 403 was a refusal and not a slow success.
    const after = await app.inject({
      method: 'GET',
      url: `/api/v1/customers/${row!._id}`,
      headers: { authorization: `Bearer ${token}` },
    })
    expect(after.statusCode).toBe(200)
  })

  it('lets a role that does hold delete through', async () => {
    expect(PERMS.customers.manager).toContain('d')
    const token = await sign('manager')
    const list = await app.inject({
      method: 'GET',
      url: '/api/v1/customers?pageSize=1',
      headers: { authorization: `Bearer ${token}` },
    })
    const row = (list.json() as { rows: { _id: string }[] }).rows[0]
    const remove = await app.inject({
      method: 'DELETE',
      url: `/api/v1/customers/${row!._id}`,
      headers: { authorization: `Bearer ${token}` },
    })
    expect(remove.statusCode, remove.body).toBe(204)
  })

  it('keeps soft-deleted rows behind the delete grant, not the export grant', async () => {
    const accountant = await sign('accountant')
    const refused = await app.inject({
      method: 'GET',
      url: '/api/v1/customers?includeDeleted=true',
      headers: { authorization: `Bearer ${accountant}` },
    })
    expect(refused.statusCode).toBe(403)

    const manager = await sign('manager')
    const allowed = await app.inject({
      method: 'GET',
      url: '/api/v1/customers?includeDeleted=true',
      headers: { authorization: `Bearer ${manager}` },
    })
    expect(allowed.statusCode, allowed.body).toBe(200)
  })
})

describe('approval authority and ceiling are separate questions (F-002)', () => {
  it('refuses the super admin every business approval despite an unlimited ceiling', () => {
    expect(ceilingHalalas('superadmin')).toBeNull()
    expect(PERMS.approvals.superadmin).toBe('vx')
    expect(canApprove('superadmin')).toBe(false)
    expect(canApprove('superadmin', 9_999_999_999)).toBe(false)
    expect(canApprove('superadmin', 9_999_999_999, 'invoices')).toBe(false)
    // Its own modules, where it does hold approve, still work.
    expect(canApprove('superadmin', undefined, 'admin')).toBe(true)
    expect(canApprove('superadmin', 9_999_999_999, 'settings')).toBe(true)
  })

  it('lets QC approve a job card it may not spend a halala on', () => {
    expect(ceilingHalalas('qc')).toBe(0)
    expect(canApprove('qc', undefined, 'jobcards')).toBe(true)
    expect(canApprove('qc', 1, 'jobcards')).toBe(false)
    expect(canApprove('qc')).toBe(false)
  })

  it('never lets the engine and the approvals grant disagree', () => {
    const disagreeing = ROLE_IDS.filter((role: RoleId) => canApprove(role) !== granted('approvals', 'a', role))
    expect(disagreeing).toEqual([])
  })

  it('escalates exactly at the ceiling, in halalas', () => {
    for (const role of ROLE_IDS) {
      const ceiling = ceilingHalalas(role)
      if (ceiling === null || ceiling === 0) continue
      expect(canApprove(role, ceiling, 'approvals'), `${role} at ceiling`).toBe(true)
      expect(canApprove(role, ceiling + 1, 'approvals'), `${role} above ceiling`).toBe(false)
    }
  })

  it('gives a role it has never heard of no ceiling at all (F-006, server side)', () => {
    // Fails closed: 0, not "unlimited". `principalFromClaims` already refuses a
    // token whose role is not one of the fourteen, so this is the second line.
    expect(ceilingHalalas('root')).toBe(0)
    expect(ceilingHalalas('')).toBe(0)
    expect(canApprove('root', 1)).toBe(false)
    expect(canApprove('root')).toBe(false)
  })
})

describe('field redaction', () => {
  const principal = (role: string): Principal => ({
    userId: 'u',
    orgId: SEED.orgId,
    branchId: SEED.mainBranchId,
    role: role as RoleId,
    scope: 'branch',
  })

  it('names the two rules that guard nothing today rather than counting them as working', () => {
    // F-005. Every role in these two rules' hidden lists is already turned away
    // by the module gate, so neither rule can fire on any surface that exists.
    // They are kept, and they are kept *labelled*.
    expect([...DEFENCE_IN_DEPTH_FIELDS].sort()).toEqual(['Branch P&L', 'Employee salary'])
  })

  it('applies them globally, so they start working the day a payload carries the value', () => {
    // Not opt-in per collection: the failure mode being avoided is a new HR or
    // reporting payload shipping without anyone remembering to wire the rule.
    const row = { name: 'A Technician', salaryHalalas: 1_200_000, netProfitHalalas: 5_000 }
    const hidden = redact(principal('technician'), row)
    expect(hidden.salaryHalalas).toBeNull()
    expect(hidden.netProfitHalalas).toBeNull()
    expect(hidden.name).toBe('A Technician')

    // The owner sees both, and the original object is never mutated.
    const shown = redact(principal('owner'), row)
    expect(shown.salaryHalalas).toBe(1_200_000)
    expect(row.salaryHalalas).toBe(1_200_000)
  })

  it('leaves a row alone when it carries none of the keys', () => {
    const row = { name: 'A Customer', phone: '+966 55 000 0000' }
    expect(redact(principal('technician'), row)).toBe(row)
  })

  it('has a key list for each defence-in-depth rule', () => {
    for (const rule of GLOBAL_REDACTIONS) expect(rule.rowKeys.length).toBeGreaterThan(0)
  })
})

describe('segregation of duties over the audit trail (F-004)', () => {
  it('reads an activity off an audit row rather than off a role', () => {
    expect(
      activitiesOf({
        actorId: 'u1',
        action: 'transition',
        entity: 'job_card',
        before: { stage: 'repair' },
        after: { stage: 'qc' },
      }),
    ).toEqual(['Perform repair'])
    expect(
      activitiesOf({
        actorId: 'u1',
        action: 'transition',
        entity: 'job_card',
        before: { stage: 'qc' },
        after: { stage: 'delivery' },
      }),
    ).toEqual(['Pass quality check'])
    expect(
      activitiesOf({
        actorId: 'u1',
        action: 'movement',
        entity: 'part',
        before: {},
        after: { type: 'out' },
      }),
    ).toEqual(['Issue stock'])
  })

  it('catches the case a role check cannot: one person on both sides', () => {
    const trail = [
      {
        actorId: 'manager-1',
        action: 'transition',
        entity: 'job_card',
        before: { stage: 'inspection' },
        after: { stage: 'repair' },
      },
    ]
    expect(sodViolation('Pass quality check', 'manager-1', trail)?.risk).toBe('high')
    expect(sodViolation('Pass quality check', 'qc-2', trail)).toBeUndefined()
    expect(sodViolation('Pass quality check', 'manager-1', [])).toBeUndefined()
    expect(sodViolation('Water the plants', 'manager-1', trail)).toBeUndefined()
  })

  it('reports honestly which pairs it enforces and which it cannot', () => {
    const status = pairStatus()
    expect(status.enforced.sort()).toEqual([
      // Procurement joined once its routes began writing audit rows (F-022): the
      // raise writes a `create` and the approval an `approve` on
      // `purchase_order`, so the pair is observable in the trail.
      'Issue stock + Adjust stock count',
      'Perform repair + Pass quality check',
      'Raise purchase order + Approve purchase order',
    ])
    // The rest have no audit signature because no route performs one side yet,
    // and each says why rather than being quietly absent.
    expect(status.unenforced.map((entry) => entry.pair).sort()).toEqual([
      'Create employee + Approve payroll run',
      'Create supplier + Approve supplier payment',
      'Post journal entry + Approve journal entry',
    ])
    for (const entry of status.unenforced) expect(entry.why.length).toBeGreaterThan(10)
  })
})

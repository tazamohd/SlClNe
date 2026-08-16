/** F-029 (2) / F-004 client half — the audit-history reads.
 *
 *  `GET /estimates/:id/history` and `GET /jobs/:id/history` return the audit
 *  trail for one record so a screen can show who did what and flag a
 *  segregation-of-duties conflict per row. The reads are permission-gated on the
 *  record's own module and tenant-scoped twice over: the record is resolved
 *  under RLS (a foreign id 404s before any trail is read) and the audit_log
 *  read is itself RLS-scoped on org.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { sql } from 'drizzle-orm'
import { ulid } from 'ulid'
import type { RoleId } from '@salis/contract'
import type { DbHandle } from '../src/db/client'
import { createDb } from '../src/db/client'
import { buildApp } from '../src/app'
import type { FastifyInstance } from 'fastify'
import type { Env } from '../src/env'
import { resetDatabase, SEED } from './harness'
import { SignJWT } from 'jose'

let app: FastifyInstance
let handle: DbHandle
let env: Env

const MANAGER = '01JHISTMANAGER00000000001'
const OWNER = '01JHISTOWNER000000000001X'

async function token(role: RoleId, sub: string, orgId = SEED.orgId): Promise<string> {
  const key = new TextEncoder().encode(env.JWT_SECRET as string)
  return new SignJWT({ role, org_id: orgId, branch_id: SEED.mainBranchId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(sub)
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(key)
}

function get(url: string, bearer: string) {
  return app.inject({ method: 'GET', url: `/api/v1${url}`, headers: { authorization: `Bearer ${bearer}` } })
}
function post(url: string, bearer: string, body: unknown) {
  return app.inject({
    method: 'POST',
    url: `/api/v1${url}`,
    headers: { authorization: `Bearer ${bearer}`, 'content-type': 'application/json' },
    payload: JSON.stringify(body),
  })
}

async function asOrg<T>(fn: (tx: Parameters<Parameters<DbHandle['db']['transaction']>[0]>[0]) => Promise<T>): Promise<T> {
  return handle.db.transaction(async (tx) => {
    await tx.execute(
      sql`select set_config('app.org_id', ${SEED.orgId}, true), set_config('app.scope', 'all', true), set_config('app.user_id', ${SEED.systemUserId}, true)`,
    )
    return fn(tx)
  })
}

beforeAll(async () => {
  env = await resetDatabase()
  handle = createDb(env.DATABASE_URL, 5)
  app = await buildApp({ db: handle.db, env })
  await app.ready()
}, 120_000)

afterAll(async () => {
  await app?.close()
  await handle?.close()
})

describe('GET /estimates/:id/history', () => {
  it('returns the create then approve trail with the two distinct actors', async () => {
    const manager = await token('manager', MANAGER)
    const create = await post('/estimates', manager, {
      customerName: 'History Customer',
      vehicleLabel: 'Toyota Camry 2022',
      lines: [{ description: 'Brake pads', kind: 'part', qty: 1, unitPriceHalalas: 20000 }],
    })
    expect(create.statusCode, create.body).toBe(201)
    const code = (create.json() as { id: string }).id

    const owner = await token('owner', OWNER)
    const approve = await post(`/estimates/${code}/approve`, owner, {})
    expect(approve.statusCode, approve.body).toBe(200)

    const history = await get(`/estimates/${code}/history`, manager)
    expect(history.statusCode, history.body).toBe(200)
    const body = history.json() as {
      entries: { action: string; actorId: string }[]
      sodConflicts: unknown[]
    }
    const actions = body.entries.map((e) => e.action)
    expect(actions).toContain('create')
    expect(actions).toContain('approve')
    const creator = body.entries.find((e) => e.action === 'create')?.actorId
    const approver = body.entries.find((e) => e.action === 'approve')?.actorId
    expect(creator).toBe(MANAGER)
    expect(approver).toBe(OWNER)
    expect(creator).not.toBe(approver)
    /* Estimates carry no audit SOD signature — their raise/approve control is
     * the submittedBy column — so no trail-level conflict is claimed. */
    expect(body.sodConflicts).toEqual([])
  })

  it("404s another organization's estimate before reading any trail", async () => {
    const manager = await token('manager', MANAGER)
    const create = await post('/estimates', manager, {
      customerName: 'Scoped',
      vehicleLabel: 'Nissan Altima 2021',
      lines: [{ description: 'Oil', kind: 'part', qty: 1, unitPriceHalalas: 5000 }],
    })
    const code = (create.json() as { id: string }).id
    const stranger = await token('manager', '01JHISTSTRANGER0000000001', SEED.otherOrgId)
    const history = await get(`/estimates/${code}/history`, stranger)
    expect(history.statusCode).toBe(404)
  })

  it('refuses a role without view on the module (403)', async () => {
    const manager = await token('manager', MANAGER)
    const create = await post('/estimates', manager, {
      customerName: 'Gated',
      vehicleLabel: 'Kia Optima 2020',
      lines: [{ description: 'Filter', kind: 'part', qty: 1, unitPriceHalalas: 3000 }],
    })
    const code = (create.json() as { id: string }).id
    // supplier holds no estimates grant at all.
    const supplier = await token('supplier', '01JHISTSUPPLIER0000000001')
    const history = await get(`/estimates/${code}/history`, supplier)
    expect(history.statusCode).toBe(403)
  })
})

describe('GET /jobs/:id/history', () => {
  async function freshJob(code: string): Promise<string> {
    const id = ulid()
    await asOrg(async (tx) => {
      await tx.execute(sql`
        insert into job_cards (id, org_id, branch_id, code, customer_name, vehicle_label, service, status, stage)
        values (${id}, ${SEED.orgId}, ${SEED.mainBranchId}, ${code}, 'History Job', 'Toyota Camry', 'general', 'pending', 'checkin')
      `)
    })
    return id
  }

  it('annotates the repair and QC transitions with their SOD activities', async () => {
    const jobId = await freshJob('HIST-JOB-1')
    const manager = await token('manager', MANAGER)
    for (const to of ['inspection', 'estimate', 'repair', 'qc'] as const) {
      const step = await post(`/jobs/${jobId}/transition`, manager, { to })
      expect(step.statusCode, step.body).toBe(200)
    }
    const owner = await token('owner', OWNER)
    const pass = await post(`/jobs/${jobId}/transition`, owner, { to: 'delivery' })
    expect(pass.statusCode, pass.body).toBe(200)

    const history = await get(`/jobs/${jobId}/history`, manager)
    expect(history.statusCode, history.body).toBe(200)
    const body = history.json() as {
      entries: { action: string; activities: string[]; actorId: string }[]
      sodConflicts: unknown[]
    }
    const repairEntry = body.entries.find((e) => e.activities.includes('Perform repair'))
    const qcEntry = body.entries.find((e) => e.activities.includes('Pass quality check'))
    expect(repairEntry?.actorId).toBe(MANAGER)
    expect(qcEntry?.actorId).toBe(OWNER)
    /* Enforcement held: repair and QC were different actors, so no conflict. */
    expect(body.sodConflicts).toEqual([])
  })

  it('flags a single actor who evidences both sides of a pair', async () => {
    /* A trail in which one actor performed the repair leg AND the QC leg — the
     * state server-side enforcement prevents, constructed directly in the audit
     * log so the *read's* conflict detection is what is under test. */
    const jobId = await freshJob('HIST-JOB-2')
    const rogue = '01JHISTROGUEACTOR00000001'
    await asOrg(async (tx) => {
      await tx.execute(sql`
        insert into audit_log (id, org_id, actor_id, actor_role, action, entity, entity_id, before, after)
        values
          (${ulid()}, ${SEED.orgId}, ${rogue}, 'manager', 'transition', 'job_card', ${jobId},
            ${sql.raw("'{\"stage\":\"estimate\"}'::jsonb")}, ${sql.raw("'{\"stage\":\"repair\"}'::jsonb")}),
          (${ulid()}, ${SEED.orgId}, ${rogue}, 'manager', 'transition', 'job_card', ${jobId},
            ${sql.raw("'{\"stage\":\"qc\"}'::jsonb")}, ${sql.raw("'{\"stage\":\"delivery\"}'::jsonb")})
      `)
    })
    const manager = await token('manager', MANAGER)
    const history = await get(`/jobs/${jobId}/history`, manager)
    const body = history.json() as { sodConflicts: { actorId: string; a: string; b: string }[] }
    expect(body.sodConflicts).toHaveLength(1)
    expect(body.sodConflicts[0]?.actorId).toBe(rogue)
    expect([body.sodConflicts[0]?.a, body.sodConflicts[0]?.b].sort()).toEqual(
      ['Pass quality check', 'Perform repair'].sort(),
    )
  })

  it("404s another organization's job", async () => {
    const jobId = await freshJob('HIST-JOB-3')
    const stranger = await token('manager', '01JHISTSTRANGER0000000002', SEED.otherOrgId)
    const history = await get(`/jobs/${jobId}/history`, stranger)
    expect(history.statusCode).toBe(404)
  })
})

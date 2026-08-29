/** F-014 and F-015 — the QC gate and the technician's own-scope view.
 *
 *  F-014: the qc role holds `jobcards: 'va'` — approve, not edit. The
 *  transition route demanded `e` for every step, so the one role named for the
 *  quality gate was refused at the quality gate. The gate transition
 *  (qc → delivery) is an approval and now accepts `a`; every other transition
 *  still needs `e`.
 *
 *  F-015: `assigned_tech_id` holds a `technicians.id`; principals carry a user
 *  id. Both consumers of the column compared across the namespaces: the r_own
 *  RLS policy (an assigned technician saw none of their jobs) and
 *  `checkQcIndependence` (the record-level self-QC check could never fire).
 *  Both now resolve through `technicians.user_id`.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { SignJWT } from 'jose'
import { sql } from 'drizzle-orm'
import { ulid } from 'ulid'
import type { FastifyInstance } from 'fastify'
import type { RoleId } from '@salis/contract'
import { buildApp } from '../src/app'
import { createDb, type DbHandle } from '../src/db/client'
import type { Env } from '../src/env'
import { resetDatabase, SEED } from './harness'

let app: FastifyInstance
let handle: DbHandle
let env: Env

const QC_USER = '01JQCWORKSHOPINSPECTOR001'
const MANAGER = '01JQCWORKSHOPMANAGER00001'
const MALLORY = '01JQCWORKSHOPMALLORY00001'

async function token(role: RoleId, sub: string): Promise<string> {
  const key = new TextEncoder().encode(env.JWT_SECRET as string)
  return new SignJWT({ role, org_id: SEED.orgId, branch_id: SEED.mainBranchId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(sub)
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(key)
}

function post(url: string, bearer: string, body: unknown) {
  return app.inject({
    method: 'POST',
    url: `/api/v1${url}`,
    headers: { authorization: `Bearer ${bearer}`, 'content-type': 'application/json' },
    payload: JSON.stringify(body),
  })
}

function get(url: string, bearer: string) {
  return app.inject({
    method: 'GET',
    url: `/api/v1${url}`,
    headers: { authorization: `Bearer ${bearer}` },
  })
}

/** Writes fixture rows across RLS with an org-scoped context — the same way
 *  `api.test.ts` reads the audit log. */
async function asOrg<T>(fn: (tx: Parameters<Parameters<DbHandle['db']['transaction']>[0]>[0]) => Promise<T>): Promise<T> {
  return handle.db.transaction(async (tx) => {
    await tx.execute(
      sql`select set_config('app.org_id', ${SEED.orgId}, true), set_config('app.scope', 'all', true), set_config('app.user_id', ${SEED.systemUserId}, true)`,
    )
    return fn(tx)
  })
}

async function freshJob(code: string, stage = 'checkin'): Promise<string> {
  const id = ulid()
  await asOrg(async (tx) => {
    await tx.execute(sql`
      insert into job_cards (id, org_id, branch_id, code, customer_name, vehicle_label, service, status, stage)
      values (${id}, ${SEED.orgId}, ${SEED.mainBranchId}, ${code}, 'QC Fixture', 'Toyota Camry', 'general', 'pending', ${stage})
    `)
  })
  return id
}

/** Manager-driven legs to qc; the QC gate itself is what each test varies. */
async function driveToQc(jobId: string, driver: string): Promise<void> {
  for (const stage of ['inspection', 'estimate', 'repair', 'qc'] as const) {
    const response = await post(`/jobs/${jobId}/transition`, driver, { to: stage })
    expect(response.statusCode, `${stage}: ${response.body}`).toBe(200)
  }
}

beforeAll(async () => {
  env = await resetDatabase()
  handle = createDb(env.DATABASE_URL, 5)
  app = await buildApp({ db: handle.db, env })
  await app.ready()
})

afterAll(async () => {
  await app?.close()
  await handle?.close()
})

describe('F-014 · the qc role operates the QC gate it is named for', () => {
  it('lets a qc token pass qc → delivery on a job it did not repair', async () => {
    const jobId = await freshJob('QC-PASS-1')
    const manager = await token('manager', MANAGER)
    await driveToQc(jobId, manager)

    const qc = await token('qc', QC_USER)
    const response = await post(`/jobs/${jobId}/transition`, qc, { to: 'delivery' })
    expect(response.statusCode, response.body).toBe(200)
    expect(response.json().stage).toBe('delivery')
  })

  it('still refuses the qc role every transition that is not the gate', async () => {
    const jobId = await freshJob('QC-EDIT-1')
    const qc = await token('qc', QC_USER)
    const response = await post(`/jobs/${jobId}/transition`, qc, { to: 'inspection' })
    expect(response.statusCode, response.body).toBe(403)
    expect(response.json().error.message).toMatch(/may not edit/)

    // And qc → repair (send it back) is a workflow move, not an approval.
    const atQc = await freshJob('QC-EDIT-2', 'qc')
    const back = await post(`/jobs/${atQc}/transition`, qc, { to: 'repair' })
    expect(back.statusCode, back.body).toBe(403)
  })

  it('still refuses a technician the gate: edit authority is not approve authority', async () => {
    const jobId = await freshJob('QC-TECH-1', 'qc')
    const tech = await token('technician', SEED.techUserId)
    const response = await post(`/jobs/${jobId}/transition`, tech, { to: 'delivery' })
    expect(response.statusCode, response.body).toBe(403)
    expect(response.json().error.message).toMatch(/may not approve/)
  })

  it('refuses a role with no job-card authority at all before reading the body', async () => {
    const jobId = await freshJob('QC-HR-1', 'qc')
    const hr = await token('hr', '01JQCWORKSHOPHRUSER000001')
    // The body is deliberately invalid: an outsider must get the plain 403,
    // not a validation message that leaks the transition schema.
    const response = await post(`/jobs/${jobId}/transition`, hr, { to: 'not-a-stage' })
    expect(response.statusCode, response.body).toBe(403)
  })
})

describe('F-015 · the record-level QC check resolves the technician to a user', () => {
  it('refuses the assigned technician’s own user at the gate, even with a clean trail', async () => {
    /* Mallory is a manager (holds `a`) who is also registered as a technician.
     * The job is assigned to her technician row, but every transition —
     * including the repair leg — was performed by someone else, so the
     * audit-trail SOD check has nothing on her. Only the record-level check
     * can refuse this, and before F-015 it compared her user id to a
     * technicians.id and never fired. */
    const techRowId = ulid()
    await asOrg(async (tx) => {
      await tx.execute(sql`
        insert into technicians (id, org_id, branch_id, name, user_id)
        values (${techRowId}, ${SEED.orgId}, ${SEED.mainBranchId}, 'Mallory (also a manager)', ${MALLORY})
      `)
    })
    const jobId = await freshJob('QC-SELF-1')
    await asOrg(async (tx) => {
      await tx.execute(
        sql`update job_cards set assigned_tech_id = ${techRowId} where id = ${jobId}`,
      )
    })
    const manager = await token('manager', MANAGER)
    await driveToQc(jobId, manager)

    const mallory = await token('manager', MALLORY)
    const refused = await post(`/jobs/${jobId}/transition`, mallory, { to: 'delivery' })
    expect(refused.statusCode, refused.body).toBe(403)
    expect(refused.json().error.message).toMatch(/cannot pass its quality check/)

    // Somebody else still can — otherwise a broken endpoint would pass above.
    const qc = await token('qc', QC_USER)
    const passed = await post(`/jobs/${jobId}/transition`, qc, { to: 'delivery' })
    expect(passed.statusCode, passed.body).toBe(200)
  })
})

describe('F-015 · an own-scoped technician sees exactly their assigned jobs', () => {
  it('lists the seeded job assigned to the demo technician’s row, and only it', async () => {
    const tech = await token('technician', SEED.techUserId)
    const list = await get('/jobs?pageSize=200', tech)
    expect(list.statusCode, list.body).toBe(200)
    const rows = (list.json() as { rows: { id: string }[] }).rows
    expect(rows.map((row) => row.id)).toEqual([SEED.assignedJobCode])

    // Reachable by id as well as by list.
    const byId = await get(`/jobs/${SEED.assignedJobCode}`, tech)
    expect(byId.statusCode, byId.body).toBe(200)
  })

  it('still shows an unrelated technician nothing — by list and by id', async () => {
    const stranger = await token('technician', '01JQCWORKSHOPSTRANGER0001')
    const list = await get('/jobs?pageSize=200', stranger)
    expect((list.json() as { rows: unknown[] }).rows).toHaveLength(0)
    const byId = await get(`/jobs/${SEED.assignedJobCode}`, stranger)
    expect(byId.statusCode).toBe(404)
  })
})

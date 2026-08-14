/** Segregation of duties, enforced through the API (F-004).
 *
 *  The unit-level half of this control is in `authz-matrix.test.ts`. This is
 *  the half that matters: that the *route* refuses, that the refusal survives
 *  as an audit record even though the transaction it interrupted rolled back,
 *  and that a second person is still able to do the thing the first person was
 *  refused — otherwise the control would just be a broken endpoint.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { SignJWT } from 'jose'
import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { RoleId } from '@salis/contract'
import { buildApp } from '../src/app'
import { withAuthPlane } from '../src/auth/context'
import { createDb, type DbHandle } from '../src/db/client'
import { auditLog, jobCards } from '../src/db/schema'
import type { Env } from '../src/env'
import { resetDatabase, SEED } from './harness'

let app: FastifyInstance
let handle: DbHandle
let env: Env

const ALICE = '01JSODALICEMANAGER0000001'
const BOB = '01JSODBOBMANAGER000000001'

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
    headers: {
      authorization: `Bearer ${bearer}`,
      'content-type': 'application/json',
      /* Movements now require replay protection (F-017); a fresh key per call
       * keeps each POST a distinct business effect. Other routes ignore it. */
      'idempotency-key': `sod-test-${crypto.randomUUID()}`,
    },
    payload: JSON.stringify(body),
  })
}

/** Walks a fresh job to `qc`, with `driver` performing the repair leg.
 *
 *  The check-in and estimate legs are not SOD activities — no signature matches
 *  them — so who performs them is irrelevant and Bob does them throughout. */
async function driveToQc(jobId: string, driver: string): Promise<void> {
  const opener = await token('manager', BOB)
  for (const stage of ['inspection', 'estimate'] as const) {
    const response = await post(`/jobs/${jobId}/transition`, opener, { to: stage })
    expect(response.statusCode, `${stage}: ${response.body}`).toBe(200)
  }
  // The repair leg, performed by `driver` — this is the audit row the quality
  // gate will later find.
  const repair = await post(`/jobs/${jobId}/transition`, driver, { to: 'repair' })
  expect(repair.statusCode, repair.body).toBe(200)
  const toQc = await post(`/jobs/${jobId}/transition`, driver, { to: 'qc' })
  expect(toQc.statusCode, toQc.body).toBe(200)
}

async function freshJob(code: string): Promise<string> {
  const id = `01JSODJOB${code.padEnd(17, '0').slice(0, 17)}`
  await withAuthPlane(handle.db, async (tx) => {
    await tx.insert(jobCards).values({
      id,
      orgId: SEED.orgId,
      branchId: SEED.mainBranchId,
      code: `SOD-${code}`,
      customerName: 'SOD Fixture',
      vehicleLabel: 'Toyota Camry',
      service: 'general',
      status: 'pending',
      stage: 'checkin',
    })
  })
  return id
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

describe('Perform repair / Pass quality check', () => {
  it('refuses the quality gate to the person who performed the repair', async () => {
    // Alice is a *manager*, which holds both `jobcards:e` and `jobcards:a`. No
    // role check can express this pair — that is the whole finding. The audit
    // trail can, because it knows who moved the job through repair.
    const jobId = await freshJob('QCSELF')
    const alice = await token('manager', ALICE)
    await driveToQc(jobId, alice)

    const response = await post(`/jobs/${jobId}/transition`, alice, { to: 'delivery' })
    expect(response.statusCode, response.body).toBe(403)
    expect(response.json().error.code).toBe('forbidden')
    expect(response.json().error.message).toMatch(/Perform repair/)
    expect(response.json().error.message).toMatch(/Pass quality check/)
  })

  it('lets somebody else pass it', async () => {
    // Without this the test above would pass on a broken endpoint.
    const jobId = await freshJob('QCOTHER')
    const alice = await token('manager', ALICE)
    const bob = await token('manager', BOB)
    await driveToQc(jobId, alice)

    const response = await post(`/jobs/${jobId}/transition`, bob, { to: 'delivery' })
    expect(response.statusCode, response.body).toBe(200)
    expect(response.json().stage ?? response.json().status).toBeDefined()
  })

  it('records the refusal even though the transaction it stopped rolled back', async () => {
    // The audit row is written in its own transaction on purpose: the one it
    // interrupts is about to roll back, and the single event most worth keeping
    // would otherwise be the only one that vanished.
    const jobId = await freshJob('QCAUDIT')
    const alice = await token('manager', ALICE)
    await driveToQc(jobId, alice)
    await post(`/jobs/${jobId}/transition`, alice, { to: 'delivery' })

    const rows = await withAuthPlane(handle.db, async (tx) =>
      tx
        .select({ reason: auditLog.reason, actorId: auditLog.actorId, action: auditLog.action })
        .from(auditLog)
        .where(and(eq(auditLog.entity, 'job_card'), eq(auditLog.entityId, jobId))),
    )
    const refusal = rows.find((row) => row.reason?.startsWith('sod_violation'))
    expect(refusal).toBeDefined()
    expect(refusal?.actorId).toBe(ALICE)
    expect(refusal?.action).toBe('reject')
    expect(refusal?.reason).toContain('Perform repair + Pass quality check')

    // And the job really did not move.
    const [job] = await withAuthPlane(handle.db, async (tx) =>
      tx.select({ stage: jobCards.stage }).from(jobCards).where(eq(jobCards.id, jobId)),
    )
    expect(job?.stage).toBe('qc')
  })

  it('still refuses when the assignment was changed to cover the tracks', async () => {
    // `checkQcIndependence` compares the actor to whoever is *currently*
    // assigned. Reassigning the job to someone else defeats it. The audit trail
    // does not care who is assigned now — it records who did the work.
    const jobId = await freshJob('QCREASS')
    const alice = await token('manager', ALICE)
    await driveToQc(jobId, alice)
    await withAuthPlane(handle.db, async (tx) => {
      await tx.update(jobCards).set({ assignedTechId: BOB }).where(eq(jobCards.id, jobId))
    })

    const response = await post(`/jobs/${jobId}/transition`, alice, { to: 'delivery' })
    expect(response.statusCode, response.body).toBe(403)
    expect(response.json().error.message).toMatch(/Perform repair/)
  })
})

describe('Issue stock / Adjust stock count', () => {
  it('refuses an adjustment from whoever issued stock from the same part', async () => {
    // The pair the permission matrix cannot express *at all*: both duties are
    // `inventory:e`, so no grant separates them. The movement type on the audit
    // row does.
    const parts = await app.inject({
      method: 'GET',
      url: '/api/v1/inventory?q=Oil Filter',
      headers: { authorization: `Bearer ${await token('parts', ALICE)}` },
    })
    const part = (parts.json() as { rows: { _id: string }[] }).rows[0]
    expect(part).toBeDefined()

    const alice = await token('parts', ALICE)
    const issue = await post(`/inventory/${part!._id}/movement`, alice, {
      type: 'out',
      qty: 1,
      ref: 'JOB-SOD',
    })
    expect(issue.statusCode, issue.body).toBe(200)

    const adjust = await post(`/inventory/${part!._id}/movement`, alice, {
      type: 'adjust',
      qty: 5,
      reason: 'recount',
    })
    expect(adjust.statusCode, adjust.body).toBe(403)
    expect(adjust.json().error.message).toMatch(/Issue stock/)
  })

  it('lets a different storekeeper adjust it', async () => {
    const parts = await app.inject({
      method: 'GET',
      url: '/api/v1/inventory?q=Brake Pad',
      headers: { authorization: `Bearer ${await token('parts', ALICE)}` },
    })
    const part = (parts.json() as { rows: { _id: string }[] }).rows[0]
    expect(part).toBeDefined()

    const issued = await post(`/inventory/${part!._id}/movement`, await token('parts', ALICE), {
      type: 'out',
      qty: 1,
    })
    expect(issued.statusCode, issued.body).toBe(200)

    const adjusted = await post(`/inventory/${part!._id}/movement`, await token('parts', BOB), {
      type: 'adjust',
      qty: 3,
      reason: 'recount',
    })
    expect(adjusted.statusCode, adjusted.body).toBe(200)
  })

  it('leaves an unrelated part alone', async () => {
    // The control is per record, not per person. Alice issuing from one part
    // must not lock her out of every part in the warehouse.
    const parts = await app.inject({
      method: 'GET',
      url: '/api/v1/inventory?q=Air Filter',
      headers: { authorization: `Bearer ${await token('parts', ALICE)}` },
    })
    const part = (parts.json() as { rows: { _id: string }[] }).rows[0]
    if (!part) return
    const adjusted = await post(`/inventory/${part._id}/movement`, await token('parts', ALICE), {
      type: 'adjust',
      qty: 2,
      reason: 'recount',
    })
    expect(adjusted.statusCode, adjusted.body).toBe(200)
  })
})

/** F-029 (4) — server-computed workshop analytics.
 *
 *  `GET /reports/workshop` sums every figure in SQL over the tenant scope: job
 *  counts by status/stage, service mix, the QC pass rate read from the audit
 *  trail, bay time, technician hours and the diagnostic-report total. This pins
 *  the arithmetic and the tenant isolation.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { sql } from 'drizzle-orm'
import { ulid } from 'ulid'
import type { RoleId } from '@salis/contract'
import { SignJWT } from 'jose'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../src/app'
import { createDb, type DbHandle } from '../src/db/client'
import type { Env } from '../src/env'
import { resetDatabase, SEED } from './harness'

let app: FastifyInstance
let handle: DbHandle
let env: Env

const MANAGER = '01JWRMANAGER0000000000001'
const OWNER = '01JWROWNER00000000000001X'

async function token(role: RoleId, sub: string, orgId: string = SEED.orgId): Promise<string> {
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

interface Report {
  jobs: { total: number; byStatus: { status: string; count: number }[]; byStage: { stage: string; count: number }[]; serviceMix: { service: string; count: number }[] }
  qc: { decisions: number; passes: number; reworks: number; passRatePct: number | null }
  bay: { appointments: number; totalBayMinutes: number; averageBayMinutes: number }
  technicians: { technicianId: string; name: string; appointments: number; bayMinutes: number; hours: number }[]
  diagnostics: { rateBps: number; subtotalHalalas: number; taxHalalas: number; totalHalalas: number }
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

describe('GET /reports/workshop', () => {
  it('counts jobs consistently across status, stage and service breakdowns', async () => {
    const manager = await token('manager', MANAGER)
    const report = (await get('/reports/workshop', manager)).json() as Report
    expect(report.jobs.total).toBeGreaterThan(0)
    const statusSum = report.jobs.byStatus.reduce((s, r) => s + r.count, 0)
    const stageSum = report.jobs.byStage.reduce((s, r) => s + r.count, 0)
    const svcSum = report.jobs.serviceMix.reduce((s, r) => s + r.count, 0)
    expect(statusSum).toBe(report.jobs.total)
    expect(stageSum).toBe(report.jobs.total)
    expect(svcSum).toBe(report.jobs.total)
  })

  it('reports averageBayMinutes as the mean of the booked durations', async () => {
    const manager = await token('manager', MANAGER)
    const report = (await get('/reports/workshop', manager)).json() as Report
    expect(report.bay.appointments).toBeGreaterThan(0)
    const expectedAvg = Math.round(report.bay.totalBayMinutes / report.bay.appointments)
    expect(report.bay.averageBayMinutes).toBe(expectedAvg)
    // Every technician's hours is their bay minutes over 60, to one decimal.
    for (const tech of report.technicians) {
      expect(tech.hours).toBe(Math.round((tech.bayMinutes / 60) * 10) / 10)
    }
  })

  it('computes the QC pass rate from the audit trail: one pass reads as 100%', async () => {
    // A fresh job driven all the way through QC by two distinct actors.
    const jobId = ulid()
    await asOrg(async (tx) => {
      await tx.execute(sql`
        insert into job_cards (id, org_id, branch_id, code, customer_name, vehicle_label, service, status, stage)
        values (${jobId}, ${SEED.orgId}, ${SEED.mainBranchId}, 'WR-QC-1', 'Report Job', 'Toyota Camry', 'general', 'pending', 'checkin')
      `)
    })
    const manager = await token('manager', MANAGER)
    for (const to of ['inspection', 'estimate', 'repair', 'qc'] as const) {
      expect((await post(`/jobs/${jobId}/transition`, manager, { to })).statusCode).toBe(200)
    }
    const owner = await token('owner', OWNER)
    expect((await post(`/jobs/${jobId}/transition`, owner, { to: 'delivery' })).statusCode).toBe(200)

    const report = (await get('/reports/workshop', manager)).json() as Report
    expect(report.qc.decisions).toBe(1)
    expect(report.qc.passes).toBe(1)
    expect(report.qc.reworks).toBe(0)
    expect(report.qc.passRatePct).toBe(100)
  })

  it('computes the diagnostic-report total: subtotal + VAT at the configured rate', async () => {
    const manager = await token('manager', MANAGER)
    const report = (await get('/reports/workshop', manager)).json() as Report
    expect(report.diagnostics.rateBps).toBe(env.VAT_RATE_BPS)
    const expectedTax = Math.round((report.diagnostics.subtotalHalalas * env.VAT_RATE_BPS) / 10_000)
    expect(report.diagnostics.taxHalalas).toBe(expectedTax)
    expect(report.diagnostics.totalHalalas).toBe(
      report.diagnostics.subtotalHalalas + report.diagnostics.taxHalalas,
    )
  })

  it('is tenant-scoped: the neighbour org sees none of this org’s jobs or appointments', async () => {
    const stranger = await token('manager', '01JWRSTRANGER00000000001', SEED.otherOrgId)
    const report = (await get('/reports/workshop', stranger)).json() as Report
    expect(report.jobs.total).toBe(0)
    expect(report.bay.appointments).toBe(0)
    expect(report.technicians).toHaveLength(0)
    // The QC pass rate over no decisions is undefined, not a fabricated zero.
    expect(report.qc.passRatePct).toBeNull()
  })

  it('refuses a role without job-card view (403)', async () => {
    const supplier = await token('supplier', '01JWRSUPPLIER00000000001')
    expect((await get('/reports/workshop', supplier)).statusCode).toBe(403)
  })
})

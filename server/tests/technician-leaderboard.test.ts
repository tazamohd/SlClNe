/** BLK-004 — `GET /reports/technician-leaderboard`.
 *
 *  The screen this feeds used to render ten invented technicians with invented
 *  job counts, ratings, efficiency and revenue. The endpoint replaces that with
 *  figures the workshop can prove, so what is worth pinning is not "it returns
 *  rows" but that each figure *follows the records*: a job completed moves a
 *  count, an invoice raised against it moves the money, a rating left on it
 *  moves the average, and a rating left on somebody else's job moves neither.
 *
 *  It also pins what is deliberately absent — no `rank`, no `efficiency`, no
 *  reading of `technicians.rating` — because a column nothing computes is the
 *  defect being removed.
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

const OWNER = '01JTLOWNER00000000000001X'
const MANAGER = '01JTLMANAGER000000000001'

async function token(
  role: RoleId,
  sub: string,
  orgId: string = SEED.orgId,
  branchId: string = SEED.mainBranchId,
): Promise<string> {
  const key = new TextEncoder().encode(env.JWT_SECRET as string)
  return new SignJWT({ role, org_id: orgId, branch_id: branchId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(sub)
    .setIssuer(env.JWT_ISSUER)
    .setAudience(env.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(key)
}

function get(bearer: string) {
  return app.inject({
    method: 'GET',
    url: '/api/v1/reports/technician-leaderboard',
    headers: { authorization: `Bearer ${bearer}` },
  })
}

interface LeaderRow {
  technicianId: string
  name: string
  specialty: string | null
  jobsAssigned: number
  jobsCompleted: number
  invoiceCount: number
  invoicedHalalas: number
  ratedJobs: number
  avgRatingTenths: number | null
}

interface Leaderboard {
  rankedBy: string
  completedStatuses: string[]
  excludedInvoiceStatuses: string[]
  counted: {
    technicians: number
    jobCards: number
    assignedJobCards: number
    completedJobCards: number
    ratedJobCards: number
    invoices: number
  }
  rows: LeaderRow[]
}

async function asOrg<T>(
  fn: (tx: Parameters<Parameters<DbHandle['db']['transaction']>[0]>[0]) => Promise<T>,
  orgId: string = SEED.orgId,
): Promise<T> {
  return handle.db.transaction(async (tx) => {
    await tx.execute(
      sql`select set_config('app.org_id', ${orgId}, true), set_config('app.scope', 'all', true), set_config('app.user_id', ${SEED.systemUserId}, true)`,
    )
    return fn(tx)
  })
}

/** A technician, some job cards assigned to them, and optionally an invoice and
 *  a customer rating against the first of those jobs. Written straight to the
 *  database because this endpoint reads records, and a test that could only
 *  arrange them through the API would be testing the API's writers instead. */
async function arrange(options: {
  name: string
  branchId?: string
  orgId?: string
  jobs: { code: string; status: string }[]
  invoice?: { code: string; jobIndex: number; totalHalalas: number; status: string }
  rating?: { jobIndex: number; rating: number }
}): Promise<{ techId: string; jobIds: string[] }> {
  const orgId = options.orgId ?? SEED.orgId
  const branchId = options.branchId ?? SEED.mainBranchId
  const techId = ulid()
  const jobIds = options.jobs.map(() => ulid())

  await asOrg(async (tx) => {
    await tx.execute(sql`
      insert into technicians (id, org_id, branch_id, name, specialty, active_jobs, rating)
      values (${techId}, ${orgId}, ${branchId}, ${options.name}, 'Engine', 0, 4.9)
    `)
    for (const [index, job] of options.jobs.entries()) {
      await tx.execute(sql`
        insert into job_cards (id, org_id, branch_id, code, customer_name, vehicle_label, service, status, stage, assigned_tech_id)
        values (${jobIds[index]}, ${orgId}, ${branchId}, ${job.code}, 'Leaderboard Customer', 'Toyota Camry',
                'maintenance', ${job.status}, 'checkin', ${techId})
      `)
    }
    if (options.invoice) {
      await tx.execute(sql`
        insert into invoices (id, org_id, branch_id, code, customer_name, job_card_id, due_date, status, total_halalas)
        values (${ulid()}, ${orgId}, ${branchId}, ${options.invoice.code}, 'Leaderboard Customer',
                ${jobIds[options.invoice.jobIndex]}, '2026-12-31', ${options.invoice.status}, ${options.invoice.totalHalalas})
      `)
    }
    if (options.rating) {
      await tx.execute(sql`
        insert into customer_feedback (id, org_id, branch_id, rating, comment, job_card_id, customer_name)
        values (${ulid()}, ${orgId}, ${branchId}, ${options.rating.rating}, 'Test feedback',
                ${jobIds[options.rating.jobIndex]}, 'Leaderboard Customer')
      `)
    }
  }, orgId)

  return { techId, jobIds }
}

function rowFor(report: Leaderboard, techId: string): LeaderRow {
  const found = report.rows.find((row) => row.technicianId === techId)
  if (!found) throw new Error(`expected technician ${techId} in the leaderboard`)
  return found
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

describe('GET /reports/technician-leaderboard', () => {
  it('counts a technician’s completed jobs, and only the completed ones', async () => {
    const { techId } = await arrange({
      name: 'Leaderboard Counted',
      jobs: [
        { code: 'TL-C-1', status: 'completed' },
        { code: 'TL-C-2', status: 'delivered' },
        { code: 'TL-C-3', status: 'in_progress' },
        { code: 'TL-C-4', status: 'pending' },
      ],
    })

    const report = (await get(await token('manager', MANAGER))).json() as Leaderboard
    const row = rowFor(report, techId)
    expect(row.jobsAssigned).toBe(4)
    /* `delivered` is past `completed`, so both count as finished work — and the
     * response names the rule rather than leaving the reader to infer it. */
    expect(row.jobsCompleted).toBe(2)
    expect(report.completedStatuses).toEqual(['completed', 'delivered'])
  })

  it('sums the invoiced value of the completed jobs, and leaves drafts out', async () => {
    const issued = await arrange({
      name: 'Leaderboard Invoiced',
      jobs: [{ code: 'TL-I-1', status: 'completed' }],
      invoice: { code: 'TL-INV-1', jobIndex: 0, totalHalalas: 184000, status: 'unpaid' },
    })
    const drafted = await arrange({
      name: 'Leaderboard Drafted',
      jobs: [{ code: 'TL-I-2', status: 'completed' }],
      invoice: { code: 'TL-INV-2', jobIndex: 0, totalHalalas: 999000, status: 'draft' },
    })
    const unfinished = await arrange({
      name: 'Leaderboard Unfinished',
      jobs: [{ code: 'TL-I-3', status: 'in_progress' }],
      invoice: { code: 'TL-INV-3', jobIndex: 0, totalHalalas: 500000, status: 'unpaid' },
    })

    const report = (await get(await token('manager', MANAGER))).json() as Leaderboard
    expect(rowFor(report, issued.techId).invoicedHalalas).toBe(184000)
    expect(rowFor(report, issued.techId).invoiceCount).toBe(1)
    /* A draft is not money anyone owes. */
    expect(rowFor(report, drafted.techId).invoicedHalalas).toBe(0)
    /* The work is not finished, so it is not on the completed-jobs total. */
    expect(rowFor(report, unfinished.techId).invoicedHalalas).toBe(0)
    expect(report.excludedInvoiceStatuses).toEqual(['draft', 'cancelled'])
  })

  it('averages the customer feedback left on their jobs, in tenths, and null when none', async () => {
    const rated = await arrange({
      name: 'Leaderboard Rated',
      jobs: [{ code: 'TL-R-1', status: 'completed' }],
      rating: { jobIndex: 0, rating: 5 },
    })
    const unrated = await arrange({
      name: 'Leaderboard Unrated',
      jobs: [{ code: 'TL-R-2', status: 'completed' }],
    })

    /* A second rating, on a second job of the same technician: 5 and 4 average
     * to 4.5. */
    const second = await arrangeExtraJob(rated.techId)
    await asOrg(async (tx) => {
      await tx.execute(sql`
        insert into customer_feedback (id, org_id, branch_id, rating, comment, job_card_id, customer_name)
        values (${ulid()}, ${SEED.orgId}, ${SEED.mainBranchId}, 4, 'Second', ${second.jobId}, 'Leaderboard Customer')
      `)
    })

    const report = (await get(await token('manager', MANAGER))).json() as Leaderboard
    const row = rowFor(report, rated.techId)
    expect(row.ratedJobs).toBe(2)
    expect(row.avgRatingTenths).toBe(45)

    /* An average over no ratings is undefined, not 0.0 — and `technicians.rating`
     * (seeded 4.9 by `arrange`) is never read in its place. */
    const none = rowFor(report, unrated.techId)
    expect(none.ratedJobs).toBe(0)
    expect(none.avgRatingTenths).toBeNull()
  })

  it('carries no rank, no efficiency and no stored rating — and orders by completed jobs', async () => {
    const report = (await get(await token('owner', OWNER))).json() as Leaderboard
    expect(report.rankedBy).toBe('jobsCompleted')
    for (const row of report.rows) {
      expect(row).not.toHaveProperty('rank')
      expect(row).not.toHaveProperty('efficiency')
      expect(row).not.toHaveProperty('rating')
    }
    const completed = report.rows.map((row) => row.jobsCompleted)
    expect([...completed].sort((a, b) => b - a)).toEqual(completed)
  })

  it('says how much was counted, and the totals agree with the rows', async () => {
    const report = (await get(await token('manager', MANAGER))).json() as Leaderboard
    expect(report.counted.technicians).toBe(report.rows.length)
    expect(report.counted.assignedJobCards).toBe(
      report.rows.reduce((sum, row) => sum + row.jobsAssigned, 0),
    )
    expect(report.counted.ratedJobCards).toBe(
      report.rows.reduce((sum, row) => sum + row.ratedJobs, 0),
    )
    expect(report.counted.jobCards).toBeGreaterThanOrEqual(report.counted.assignedJobCards)
    expect(report.counted.completedJobCards).toBeGreaterThanOrEqual(
      report.rows.reduce((sum, row) => sum + row.jobsCompleted, 0),
    )
  })

  it('is tenant-scoped: a neighbour org sees none of this org’s technicians or money', async () => {
    await arrange({
      name: 'Leaderboard Neighbour',
      orgId: SEED.otherOrgId,
      branchId: SEED.otherBranchId,
      jobs: [{ code: 'TL-X-1', status: 'completed' }],
      invoice: { code: 'TL-INV-X', jobIndex: 0, totalHalalas: 700000, status: 'paid' },
    })

    const mine = (await get(await token('manager', MANAGER))).json() as Leaderboard
    expect(mine.rows.some((row) => row.name === 'Leaderboard Neighbour')).toBe(false)

    const stranger = (
      await get(
        await token('manager', '01JTLSTRANGER00000000001', SEED.otherOrgId, SEED.otherBranchId),
      )
    ).json() as Leaderboard
    expect(stranger.rows.some((row) => row.name === 'Leaderboard Neighbour')).toBe(true)
    expect(stranger.rows.some((row) => row.name === 'Leaderboard Counted')).toBe(false)
    /* Their own money is theirs and is all they see of it. */
    expect(stranger.rows.find((row) => row.name === 'Leaderboard Neighbour')?.invoicedHalalas).toBe(700000)
    expect(mine.rows.some((row) => row.invoicedHalalas === 700000)).toBe(false)
  })

  it('refuses the roles that may see the technician roster but not staff performance', async () => {
    /* `technicians:v` is held by advisor, technician, qc and frontdesk; this
     * ranking is gated on `hr:v`, which none of them holds. No cell moved to
     * make that true. */
    for (const [role, sub] of [
      ['advisor', '01JTLADVISOR0000000000001'],
      ['technician', '01JTLTECH0000000000000001'],
      ['qc', '01JTLQC000000000000000001'],
      ['frontdesk', '01JTLFRONT000000000000001'],
      ['supplier', '01JTLSUPPLIER00000000001X'],
    ] as [RoleId, string][]) {
      expect((await get(await token(role, sub))).statusCode).toBe(403)
    }
  })

  it('allows the roles the hr module already grants view to', async () => {
    for (const [role, sub] of [
      ['owner', OWNER],
      ['manager', MANAGER],
      ['hr', '01JTLHR000000000000000001'],
      ['accountant', '01JTLACCT0000000000000001'],
    ] as [RoleId, string][]) {
      expect((await get(await token(role, sub))).statusCode).toBe(200)
    }
  })
})

/** A second completed job for an existing technician, so a second rating can be
 *  left on a different job rather than twice on the same one. */
async function arrangeExtraJob(techId: string): Promise<{ jobId: string }> {
  const jobId = ulid()
  await asOrg(async (tx) => {
    await tx.execute(sql`
      insert into job_cards (id, org_id, branch_id, code, customer_name, vehicle_label, service, status, stage, assigned_tech_id)
      values (${jobId}, ${SEED.orgId}, ${SEED.mainBranchId}, ${'TL-R-1B-' + jobId.slice(-4)}, 'Leaderboard Customer',
              'Toyota Camry', 'maintenance', 'completed', 'checkin', ${techId})
    `)
  })
  return { jobId }
}

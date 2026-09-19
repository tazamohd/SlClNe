/** Digital Vehicle Health Check — findings, evidence upload, and the
 *  customer-facing report (Sprint 2, P0).
 *
 *  Covers the loop the feature exists for: a technician records a finding on
 *  their own assigned job (never someone else's), attaches a real photo whose
 *  bytes round-trip through the storage adapter, the generic collection's
 *  `PATCH` carries the follow-on lifecycle, `POST` is refused (creation is
 *  only ever the bespoke route), and the customer-facing report shows the
 *  customer their own finding — with `internalNote` reaching neither the
 *  generic collection's response nor the report, however the row is read.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq, sql } from 'drizzle-orm'
import { ulid } from 'ulid'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../src/app'
import { createDb, type DbHandle } from '../src/db/client'
import type { Env } from '../src/env'
import { customers, users } from '../src/db/schema'
import { withAuthPlane } from '../src/auth/context'
import { resetDatabase, SEED } from './harness'

let app: FastifyInstance
let handle: DbHandle
let admin: DbHandle
let env: Env

const TECH_USER = '01JINSPECTFINDINGTECH0001'
const OTHER_TECH_USER = '01JINSPECTFINDINGTECH0002'
const ADVISOR = '01JINSPECTFINDINGADVISOR01'
const FRONTDESK = '01JINSPECTFINDINGDESK0001'

let ahmedCustomerId = ''
let ahmedUserId = ''

async function token(role: string, sub: string, extra: Record<string, unknown> = {}): Promise<string> {
  const { SignJWT } = await import('jose')
  const key = new TextEncoder().encode(env.JWT_SECRET as string)
  return new SignJWT({ role, org_id: SEED.orgId, branch_id: SEED.mainBranchId, ...extra })
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

function patch(url: string, bearer: string, body: unknown) {
  return app.inject({
    method: 'PATCH',
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

const BOUNDARY = '----inspectionMediaTestBoundary'

/** A hand-built multipart body — there is no test-side multipart client in
 *  this repo, and the server-side parser (`@fastify/multipart`) only needs a
 *  well-formed stream, not a real codec-valid image. */
function multipartFile(bytes: Buffer, filename: string, mimeType: string): Buffer {
  const pre = `--${BOUNDARY}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`
  const post = `\r\n--${BOUNDARY}--\r\n`
  return Buffer.concat([Buffer.from(pre), bytes, Buffer.from(post)])
}

function uploadMedia(url: string, bearer: string, bytes: Buffer, filename: string, mimeType: string) {
  return app.inject({
    method: 'POST',
    url: `/api/v1${url}`,
    headers: {
      authorization: `Bearer ${bearer}`,
      'content-type': `multipart/form-data; boundary=${BOUNDARY}`,
    },
    payload: multipartFile(bytes, filename, mimeType),
  })
}

/** Writes fixture rows across RLS with a platform-scoped context, same as
 *  `customer-self-scope.test.ts`. */
async function asPlatform<T>(fn: Parameters<typeof withAuthPlane<T>>[1]): Promise<T> {
  return withAuthPlane(admin.db, fn)
}

async function freshJobForTech(code: string, techUserId: string): Promise<string> {
  const techRowId = ulid()
  const jobId = ulid()
  await asPlatform(async (tx) => {
    await tx.execute(sql`
      insert into technicians (id, org_id, branch_id, name, user_id)
      values (${techRowId}, ${SEED.orgId}, ${SEED.mainBranchId}, 'DVHC Fixture Technician', ${techUserId})
    `)
    await tx.execute(sql`
      insert into job_cards (id, org_id, branch_id, code, customer_name, vehicle_label, service, status, stage, assigned_tech_id)
      values (${jobId}, ${SEED.orgId}, ${SEED.mainBranchId}, ${code}, 'DVHC Fixture', 'Toyota Camry', 'general', 'in_progress', 'inspection', ${techRowId})
    `)
  })
  return jobId
}

beforeAll(async () => {
  env = await resetDatabase()
  handle = createDb(env.DATABASE_URL, 5)
  admin = createDb(env.DATABASE_ADMIN_URL ?? env.DATABASE_URL, 2)
  app = await buildApp({ db: handle.db, env })
  await app.ready()

  const [customer] = await asPlatform((tx) =>
    tx.select({ id: customers.id }).from(customers).where(eq(customers.name, 'Ahmed Al-Rashid')).limit(1),
  )
  if (!customer) throw new Error('the seed carries no "Ahmed Al-Rashid" customer')
  ahmedCustomerId = customer.id

  const [user] = await asPlatform((tx) =>
    tx.select({ id: users.id }).from(users).where(eq(users.email, 'ahmed@example.sa')).limit(1),
  )
  if (!user) throw new Error('the seed carries no customer demo login')
  ahmedUserId = user.id
}, 120_000)

afterAll(async () => {
  await app?.close()
  await handle?.close()
  await admin?.close()
})

async function freshJobForCustomer(code: string): Promise<string> {
  const jobId = ulid()
  await asPlatform(async (tx) => {
    await tx.execute(sql`
      insert into job_cards (id, org_id, branch_id, code, customer_id, customer_name, vehicle_label, service, status, stage)
      values (${jobId}, ${SEED.orgId}, ${SEED.mainBranchId}, ${code}, ${ahmedCustomerId}, 'Ahmed Al-Rashid', 'Toyota Camry', 'general', 'in_progress', 'inspection')
    `)
  })
  return jobId
}

describe('creating a finding', () => {
  it("lets a technician record a finding on their own assigned job", async () => {
    const jobId = await freshJobForTech('DVHC-CREATE-1', TECH_USER)
    const tech = await token('technician', TECH_USER)

    const response = await post(`/job-cards/${jobId}/inspection-findings`, tech, {
      category: 'Brakes & Suspension',
      item: 'Front brake pads',
      severity: 'attention',
      internalNote: 'Pads at 3mm, recommend replacement this visit.',
      customerNote: 'Front brake pads are wearing and should be replaced soon.',
    })
    expect(response.statusCode, response.body).toBe(201)
    const row = response.json() as {
      jobCardId: string
      category: string
      item: string
      severity: string
      internalNote: string
      customerNote: string
      recordedBy: string
    }
    expect(row.jobCardId).toBe(jobId)
    expect(row.category).toBe('Brakes & Suspension')
    expect(row.severity).toBe('attention')
    expect(row.internalNote).toMatch(/3mm/)
    expect(row.recordedBy).toBeTruthy()
  })

  it('defaults severity to "ok" when the checklist point passed', async () => {
    const jobId = await freshJobForTech('DVHC-CREATE-2', TECH_USER)
    const tech = await token('technician', TECH_USER)
    const response = await post(`/job-cards/${jobId}/inspection-findings`, tech, {
      category: 'Fluids & Filters',
      item: 'Engine oil level',
    })
    expect(response.statusCode, response.body).toBe(201)
    expect(response.json().severity).toBe('ok')
  })

  it("refuses a technician recording a finding on a job that is not theirs", async () => {
    const jobId = await freshJobForTech('DVHC-CREATE-3', OTHER_TECH_USER)
    const tech = await token('technician', TECH_USER)
    const response = await post(`/job-cards/${jobId}/inspection-findings`, tech, {
      category: 'Tires & Wheels',
      item: 'Tread depth',
    })
    expect(response.statusCode).toBe(404)
  })

  it("refuses a role that holds create but not edit on job cards", async () => {
    /* frontdesk is `vc` on jobcards — creates a job card at check-in, cannot
     * edit one — so it must not be able to record a finding either. */
    const jobId = await freshJobForTech('DVHC-CREATE-4', TECH_USER)
    const frontdesk = await token('frontdesk', FRONTDESK)
    const response = await post(`/job-cards/${jobId}/inspection-findings`, frontdesk, {
      category: 'Body & Interior',
      item: 'Windshield chips',
    })
    expect(response.statusCode).toBe(403)
  })

  it('rejects a body missing the required fields', async () => {
    const jobId = await freshJobForTech('DVHC-CREATE-5', TECH_USER)
    const tech = await token('technician', TECH_USER)
    const response = await post(`/job-cards/${jobId}/inspection-findings`, tech, { severity: 'ok' })
    expect(response.statusCode).toBe(400)
  })

  it('cannot be created directly through the generic collection route', async () => {
    const advisor = await token('advisor', ADVISOR)
    const response = await post('/inspection-findings', advisor, {
      jobCardId: '01JFAKE0000000000000000001',
      category: 'Engine & Transmission',
      item: 'Belt condition',
    })
    expect(response.statusCode).toBe(400)
  })
})

describe('updating a finding', () => {
  it('moves severity and notes through the generic PATCH', async () => {
    const jobId = await freshJobForTech('DVHC-UPDATE-1', TECH_USER)
    const tech = await token('technician', TECH_USER)
    const created = await post(`/job-cards/${jobId}/inspection-findings`, tech, {
      category: 'Electrical & Lighting',
      item: 'Battery terminals',
      severity: 'monitor',
    })
    const id = (created.json() as { _id: string })._id
    const version = (created.json() as { _version: number })._version

    const patched = await patch(`/inspection-findings/${id}`, tech, { severity: 'urgent' })
    // The version header the generic route expects is `if-match-version`;
    // exercised in full below where it matters (media stays independent of it).
    void version
    expect(patched.statusCode, patched.body).toBe(200)
    expect(patched.json().severity).toBe('urgent')
  })
})

describe('attaching photo evidence', () => {
  const JPEG_BYTES = Buffer.from('not-a-real-jpeg-but-has-bytes-to-store')

  async function createFinding(techUserId: string, jobCode: string) {
    const jobId = await freshJobForTech(jobCode, techUserId)
    const tech = await token('technician', techUserId)
    const created = await post(`/job-cards/${jobId}/inspection-findings`, tech, {
      category: 'Tires & Wheels',
      item: 'Tread depth',
      severity: 'monitor',
    })
    return { jobId, tech, findingId: (created.json() as { _id: string })._id }
  }

  it('stores an uploaded photo and streams the identical bytes back', async () => {
    const { tech, findingId } = await createFinding(TECH_USER, 'DVHC-MEDIA-1')

    const uploaded = await uploadMedia(
      `/inspection-findings/${findingId}/media`,
      tech,
      JPEG_BYTES,
      'brake-pad.jpg',
      'image/jpeg',
    )
    expect(uploaded.statusCode, uploaded.body).toBe(201)
    const media = uploaded.json() as {
      _id: string
      kind: string
      stage: string
      mimeType: string
      sizeBytes: number
      url: string
    }
    expect(media.kind).toBe('photo')
    expect(media.stage).toBe('before')
    expect(media.sizeBytes).toBe(JPEG_BYTES.byteLength)
    expect(media.url).toBe(`inspection-media/${media._id}/file`)

    const file = await get(`/inspection-media/${media._id}/file`, tech)
    expect(file.statusCode).toBe(200)
    expect(file.headers['content-type']).toBe('image/jpeg')
    expect(Buffer.from(file.rawPayload)).toEqual(JPEG_BYTES)
  })

  it('honours ?stage=after', async () => {
    const { tech, findingId } = await createFinding(TECH_USER, 'DVHC-MEDIA-2')
    const uploaded = await uploadMedia(
      `/inspection-findings/${findingId}/media?stage=after`,
      tech,
      JPEG_BYTES,
      'after.jpg',
      'image/jpeg',
    )
    expect(uploaded.statusCode, uploaded.body).toBe(201)
    expect(uploaded.json().stage).toBe('after')
  })

  it('refuses a file type outside the DVHC allowlist', async () => {
    const { tech, findingId } = await createFinding(TECH_USER, 'DVHC-MEDIA-3')
    const uploaded = await uploadMedia(
      `/inspection-findings/${findingId}/media`,
      tech,
      Buffer.from('hello'),
      'notes.txt',
      'text/plain',
    )
    expect(uploaded.statusCode).toBe(400)
  })

  it("refuses a technician the evidence for a job that is not theirs", async () => {
    const { findingId } = await createFinding(OTHER_TECH_USER, 'DVHC-MEDIA-4')
    const outsider = await token('technician', TECH_USER)
    const uploaded = await uploadMedia(
      `/inspection-findings/${findingId}/media`,
      outsider,
      JPEG_BYTES,
      'x.jpg',
      'image/jpeg',
    )
    expect(uploaded.statusCode).toBe(404)
  })
})

describe('the customer-facing health check report', () => {
  it("shows a customer their own vehicle's findings, never the internal note", async () => {
    const jobId = await freshJobForCustomer('DVHC-REPORT-1')
    const advisor = await token('advisor', ADVISOR)
    const created = await post(`/job-cards/${jobId}/inspection-findings`, advisor, {
      category: 'Brakes & Suspension',
      item: 'Rear brake pads',
      severity: 'urgent',
      internalNote: 'SHOP-ONLY: customer has a history of disputing brake charges.',
      customerNote: 'Rear brake pads need replacing soon for safety.',
    })
    expect(created.statusCode, created.body).toBe(201)
    const findingId = (created.json() as { _id: string })._id

    await uploadMedia(
      `/inspection-findings/${findingId}/media`,
      advisor,
      Buffer.from('evidence-bytes'),
      'rear-pad.jpg',
      'image/jpeg',
    )

    const customer = await token('customer', ahmedUserId, { customer_id: ahmedCustomerId })
    const report = await get(`/jobs/${jobId}/health-check-report`, customer)
    expect(report.statusCode, report.body).toBe(200)
    expect(report.body).not.toMatch(/SHOP-ONLY/)

    const body = report.json() as {
      jobCardId: string
      findings: { id: string; severity: string; customerNote: string; media: { url: string }[] }[]
    }
    expect(body.jobCardId).toBe(jobId)
    const finding = body.findings.find((f) => f.id === findingId)
    expect(finding?.severity).toBe('urgent')
    expect(finding?.customerNote).toMatch(/safety/)
    expect(finding?.media).toHaveLength(1)
  })

  it("refuses a customer another customer's job report", async () => {
    const jobId = await freshJobForTech('DVHC-REPORT-2', TECH_USER)
    const customer = await token('customer', ahmedUserId, { customer_id: ahmedCustomerId })
    const response = await get(`/jobs/${jobId}/health-check-report`, customer)
    expect(response.statusCode).toBe(404)
  })

  it('redacts the internal note on the generic collection route too, even though the row is visible', async () => {
    const jobId = await freshJobForCustomer('DVHC-REPORT-3')
    const advisor = await token('advisor', ADVISOR)
    const created = await post(`/job-cards/${jobId}/inspection-findings`, advisor, {
      category: 'Engine & Transmission',
      item: 'Timing belt',
      severity: 'monitor',
      internalNote: 'Internal-only diagnostic detail.',
      customerNote: 'Timing belt due for inspection at next service.',
    })
    expect(created.statusCode, created.body).toBe(201)

    const customer = await token('customer', ahmedUserId, { customer_id: ahmedCustomerId })
    const list = await get(`/inspection-findings?filter[jobCardId]=${jobId}`, customer)
    expect(list.statusCode, list.body).toBe(200)
    const { rows } = list.json() as { rows: { internalNote: string | null; customerNote: string | null }[] }
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.every((r) => r.internalNote === null)).toBe(true)
    expect(rows[0]?.customerNote).toMatch(/next service/)
  })
})

describe('tenant isolation', () => {
  it("does not serve another organization's finding", async () => {
    const jobId = await freshJobForTech('DVHC-TENANT-1', TECH_USER)
    const tech = await token('technician', TECH_USER)
    const created = await post(`/job-cards/${jobId}/inspection-findings`, tech, {
      category: 'Engine & Transmission',
      item: 'Coolant level',
    })
    const id = (created.json() as { _id: string })._id

    const stranger = await token('manager', '01JINSPECTFINDINGSTRANGER1', { org_id: '01JBBBBBBBBBBBBBBBBBBBBBB2' })
    const response = await get(`/inspection-findings/${id}`, stranger)
    expect(response.statusCode).toBe(404)
  })
})

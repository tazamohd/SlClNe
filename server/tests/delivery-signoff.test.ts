/** Customer sign-off at delivery — signature capture, the checklist/odometer
 *  `PATCH`, and RLS isolation (Sprint 2, P0 backlog item 4).
 *
 *  Covers the loop the feature exists for: an advisor captures a real
 *  signature image on hand-off, whose bytes round-trip through the storage
 *  adapter; a second signature for the same job is refused rather than
 *  silently replacing the first; the checklist and odometer are filled in
 *  afterwards through the generic collection's `PATCH`; direct `POST` is
 *  refused (creation is only ever the bespoke multipart route); and RLS
 *  narrows a sign-off to the job's own technician/advisor and to the
 *  customer whose vehicle it is, the same discipline
 *  `inspection-findings.test.ts` established for DVHC.
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

const TECH_USER = '01JSIGNOFFTECH00000000001'
const OTHER_TECH_USER = '01JSIGNOFFTECH00000000002'
const ADVISOR = '01JSIGNOFFADVISOR0000001'
const FRONTDESK = '01JSIGNOFFDESK000000001'

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

const BOUNDARY = '----deliverySignoffTestBoundary'

/** A hand-built multipart body — same approach `inspection-findings.test.ts`
 *  uses: `@fastify/multipart` only needs a well-formed stream, not a real
 *  codec-valid image. */
function multipartFile(bytes: Buffer, filename: string, mimeType: string): Buffer {
  const pre = `--${BOUNDARY}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`
  const post = `\r\n--${BOUNDARY}--\r\n`
  return Buffer.concat([Buffer.from(pre), bytes, Buffer.from(post)])
}

function uploadSignature(url: string, bearer: string, bytes: Buffer, filename: string, mimeType: string) {
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

async function asPlatform<T>(fn: Parameters<typeof withAuthPlane<T>>[1]): Promise<T> {
  return withAuthPlane(admin.db, fn)
}

async function freshJobForTech(code: string, techUserId: string): Promise<string> {
  const techRowId = ulid()
  const jobId = ulid()
  await asPlatform(async (tx) => {
    await tx.execute(sql`
      insert into technicians (id, org_id, branch_id, name, user_id)
      values (${techRowId}, ${SEED.orgId}, ${SEED.mainBranchId}, 'Sign-off Fixture Technician', ${techUserId})
    `)
    await tx.execute(sql`
      insert into job_cards (id, org_id, branch_id, code, customer_name, vehicle_label, service, status, stage, assigned_tech_id)
      values (${jobId}, ${SEED.orgId}, ${SEED.mainBranchId}, ${code}, 'Sign-off Fixture', 'Honda Accord', 'general', 'in_progress', 'delivery', ${techRowId})
    `)
  })
  return jobId
}

async function freshJobForCustomer(code: string): Promise<string> {
  const jobId = ulid()
  await asPlatform(async (tx) => {
    await tx.execute(sql`
      insert into job_cards (id, org_id, branch_id, code, customer_id, customer_name, vehicle_label, service, status, stage)
      values (${jobId}, ${SEED.orgId}, ${SEED.mainBranchId}, ${code}, ${ahmedCustomerId}, 'Ahmed Al-Rashid', 'Toyota Camry', 'general', 'in_progress', 'delivery')
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

const SIGNATURE_BYTES = Buffer.from('not-a-real-png-but-has-bytes-to-store')

describe('capturing the signature', () => {
  it('lets an advisor capture a signature for a job card', async () => {
    const jobId = await freshJobForTech('SIGNOFF-CREATE-1', TECH_USER)
    const advisor = await token('advisor', ADVISOR)

    const uploaded = await uploadSignature(
      `/job-cards/${jobId}/delivery-signoff`,
      advisor,
      SIGNATURE_BYTES,
      'signature.png',
      'image/png',
    )
    expect(uploaded.statusCode, uploaded.body).toBe(201)
    const row = uploaded.json() as {
      jobCardId: string
      signedByName: string
      agreedAt: string
      checklist: Record<string, boolean>
      odometerOut: number | null
      mimeType: string
      sizeBytes: number
      url: string
      _id: string
    }
    expect(row.jobCardId).toBe(jobId)
    expect(row.signedByName).toBe('Sign-off Fixture')
    expect(row.agreedAt).toBeTruthy()
    expect(row.checklist).toEqual({})
    expect(row.odometerOut).toBeNull()
    expect(row.mimeType).toBe('image/png')
    expect(row.sizeBytes).toBe(SIGNATURE_BYTES.byteLength)
    expect(row.url).toBe(`delivery-signoffs/${row._id}/signature`)
  })

  it('streams the identical signature bytes back', async () => {
    const jobId = await freshJobForTech('SIGNOFF-CREATE-2', TECH_USER)
    const advisor = await token('advisor', ADVISOR)
    const uploaded = await uploadSignature(
      `/job-cards/${jobId}/delivery-signoff`,
      advisor,
      SIGNATURE_BYTES,
      'signature.png',
      'image/png',
    )
    const id = (uploaded.json() as { _id: string })._id

    const file = await get(`/delivery-signoffs/${id}/signature`, advisor)
    expect(file.statusCode).toBe(200)
    expect(file.headers['content-type']).toBe('image/png')
    expect(Buffer.from(file.rawPayload)).toEqual(SIGNATURE_BYTES)
  })

  it('refuses a second signature for the same job card', async () => {
    const jobId = await freshJobForTech('SIGNOFF-CREATE-3', TECH_USER)
    const advisor = await token('advisor', ADVISOR)
    const first = await uploadSignature(
      `/job-cards/${jobId}/delivery-signoff`,
      advisor,
      SIGNATURE_BYTES,
      'signature.png',
      'image/png',
    )
    expect(first.statusCode, first.body).toBe(201)

    const second = await uploadSignature(
      `/job-cards/${jobId}/delivery-signoff`,
      advisor,
      SIGNATURE_BYTES,
      'signature-2.png',
      'image/png',
    )
    expect(second.statusCode).toBe(409)
  })

  it('refuses a file type outside the accepted signature type', async () => {
    const jobId = await freshJobForTech('SIGNOFF-CREATE-4', TECH_USER)
    const advisor = await token('advisor', ADVISOR)
    const uploaded = await uploadSignature(
      `/job-cards/${jobId}/delivery-signoff`,
      advisor,
      Buffer.from('hello'),
      'signature.jpg',
      'image/jpeg',
    )
    expect(uploaded.statusCode).toBe(400)
  })

  it('refuses a role that holds create but not edit on job cards', async () => {
    /* frontdesk is `vc` on jobcards — creates a job card at check-in, cannot
     * edit one — so it must not be able to capture a sign-off either. */
    const jobId = await freshJobForTech('SIGNOFF-CREATE-5', TECH_USER)
    const frontdesk = await token('frontdesk', FRONTDESK)
    const uploaded = await uploadSignature(
      `/job-cards/${jobId}/delivery-signoff`,
      frontdesk,
      SIGNATURE_BYTES,
      'signature.png',
      'image/png',
    )
    expect(uploaded.statusCode).toBe(403)
  })

  it("refuses a technician the sign-off for a job that is not theirs", async () => {
    const jobId = await freshJobForTech('SIGNOFF-CREATE-6', OTHER_TECH_USER)
    const outsider = await token('technician', TECH_USER)
    const uploaded = await uploadSignature(
      `/job-cards/${jobId}/delivery-signoff`,
      outsider,
      SIGNATURE_BYTES,
      'signature.png',
      'image/png',
    )
    expect(uploaded.statusCode).toBe(404)
  })

  it('cannot be created directly through the generic collection route', async () => {
    const advisor = await token('advisor', ADVISOR)
    const response = await post('/delivery-signoffs', advisor, {
      jobCardId: '01JFAKE0000000000000000001',
      signedByName: 'Someone',
    })
    expect(response.statusCode).toBe(400)
  })
})

describe('completing the checklist', () => {
  async function captureSignature(techUserId: string, jobCode: string) {
    const jobId = await freshJobForTech(jobCode, techUserId)
    const advisor = await token('advisor', ADVISOR)
    const uploaded = await uploadSignature(
      `/job-cards/${jobId}/delivery-signoff`,
      advisor,
      SIGNATURE_BYTES,
      'signature.png',
      'image/png',
    )
    return { jobId, advisor, id: (uploaded.json() as { _id: string })._id }
  }

  it('moves the checklist and odometer through the generic PATCH', async () => {
    const { advisor, id } = await captureSignature(TECH_USER, 'SIGNOFF-UPDATE-1')

    const patched = await patch(`/delivery-signoffs/${id}`, advisor, {
      checklist: {
        customerNotified: true,
        keysReturned: true,
        documentsReady: true,
        invoiceAttached: true,
        cleaned: true,
        qualityCheck: true,
      },
      odometerOut: 42195,
    })
    expect(patched.statusCode, patched.body).toBe(200)
    const row = patched.json() as { checklist: Record<string, boolean>; odometerOut: number }
    expect(row.checklist.qualityCheck).toBe(true)
    expect(row.odometerOut).toBe(42195)
  })
})

describe('reading a sign-off', () => {
  it("shows a customer their own vehicle's sign-off", async () => {
    const jobId = await freshJobForCustomer('SIGNOFF-REPORT-1')
    const advisor = await token('advisor', ADVISOR)
    const uploaded = await uploadSignature(
      `/job-cards/${jobId}/delivery-signoff`,
      advisor,
      SIGNATURE_BYTES,
      'signature.png',
      'image/png',
    )
    const id = (uploaded.json() as { _id: string })._id

    const customer = await token('customer', ahmedUserId, { customer_id: ahmedCustomerId })
    const response = await get(`/delivery-signoffs/${id}`, customer)
    expect(response.statusCode, response.body).toBe(200)
    expect(response.json().jobCardId).toBe(jobId)

    const file = await get(`/delivery-signoffs/${id}/signature`, customer)
    expect(file.statusCode).toBe(200)
  })

  it("refuses a technician the sign-off for a job that is not theirs", async () => {
    const jobId = await freshJobForTech('SIGNOFF-REPORT-2', OTHER_TECH_USER)
    const advisor = await token('advisor', ADVISOR)
    const uploaded = await uploadSignature(
      `/job-cards/${jobId}/delivery-signoff`,
      advisor,
      SIGNATURE_BYTES,
      'signature.png',
      'image/png',
    )
    const id = (uploaded.json() as { _id: string })._id

    const outsider = await token('technician', TECH_USER)
    const response = await get(`/delivery-signoffs/${id}`, outsider)
    expect(response.statusCode).toBe(404)
  })
})

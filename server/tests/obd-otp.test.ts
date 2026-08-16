/** F-029 (5) — OBD commands and customer-approval OTP as adapter-plus-mock (§40).
 *
 *  Neither integration is faked live. The OBD bridge and the SMS transport both
 *  default to refusing with a 503 naming what is missing; a test drives them
 *  through the *mock* to prove the contract, and the reading a mock scan
 *  produces is really persisted (the device↔dtc link). The status endpoint
 *  reports both as EXTERNAL_DEPENDENCY.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { sql } from 'drizzle-orm'
import { SignJWT } from 'jose'
import type { FastifyInstance } from 'fastify'
import type { RoleId } from '@salis/contract'
import { buildApp } from '../src/app'
import { createDb, type DbHandle } from '../src/db/client'
import type { Env } from '../src/env'
import { memoryTransport, type MemoryTransport } from '../src/auth/otp'
import { mockObdBridge, unconfiguredObdBridge } from '../src/integrations/obd'
import { resetDatabase, SEED } from './harness'

let handle: DbHandle
let env: Env
/** The default (unconfigured) app, to prove the refusal, and a mock-wired one to
 *  prove the contract. */
let liveApp: FastifyInstance
let mockApp: FastifyInstance
let codes: MemoryTransport

const MANAGER = '01JOBDMANAGER00000000001X'

async function tokenFor(_app: FastifyInstance, role: RoleId, sub: string, orgId: string = SEED.orgId): Promise<string> {
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
function post(app: FastifyInstance, url: string, bearer: string, body: unknown = {}) {
  return app.inject({
    method: 'POST',
    url: `/api/v1${url}`,
    headers: { authorization: `Bearer ${bearer}`, 'content-type': 'application/json' },
    payload: JSON.stringify(body),
  })
}
function get(app: FastifyInstance, url: string, bearer: string) {
  return app.inject({ method: 'GET', url: `/api/v1${url}`, headers: { authorization: `Bearer ${bearer}` } })
}

/** A seeded OBD device's code, and a customer id with a phone, read directly. */
let deviceCode: string
let estimateWithCustomer: string
let customerPhone: string

beforeAll(async () => {
  env = await resetDatabase()
  handle = createDb(env.DATABASE_URL, 5)
  liveApp = await buildApp({ db: handle.db, env })
  codes = memoryTransport()
  mockApp = await buildApp({ db: handle.db, env, obdBridge: mockObdBridge, otpTransport: codes })
  await liveApp.ready()
  await mockApp.ready()

  await handle.db.transaction(async (tx) => {
    await tx.execute(
      sql`select set_config('app.org_id', ${SEED.orgId}, true), set_config('app.scope', 'all', true), set_config('app.user_id', ${SEED.systemUserId}, true)`,
    )
    /* A device with no seeded readings, so this test's rescan/clear counts are
     * exactly what it wrote (the seed attaches a couple of readings to one
     * device for the read-back history). */
    const device = await tx.execute(
      sql`select code from obd_devices where id not in (select device_id from obd_dtc_readings) limit 1`,
    )
    deviceCode = (device[0] as { code: string }).code
    /* Attach a customer (with a phone) to a seeded estimate so the OTP flow has
     * a destination on record. */
    const customer = await tx.execute(sql`select id, phone from customers where phone is not null limit 1`)
    const cust = customer[0] as { id: string; phone: string }
    customerPhone = cust.phone
    await tx.execute(sql`update estimates set customer_id = ${cust.id} where code = 'EST-0230'`)
    estimateWithCustomer = 'EST-0230'
  })
})

afterAll(async () => {
  await liveApp?.close()
  await mockApp?.close()
  await handle?.close()
})

describe('OBD device commands — §40 adapter-plus-mock', () => {
  it('the default bridge refuses a re-scan with a 503 naming the missing config', async () => {
    expect(unconfiguredObdBridge.configured).toBe(false)
    const advisor = await tokenFor(liveApp, 'manager', MANAGER)
    const response = await post(liveApp, `/diagnostics/devices/${deviceCode}/rescan`, advisor)
    expect(response.statusCode).toBe(503)
    const body = response.json() as { error: { code: string; message: string } }
    expect(body.error.code).toBe('external_dependency_unavailable')
    expect(body.error.message).toContain('OBD_BRIDGE_URL')
  })

  it('the mock bridge records the readings a re-scan produced, flagged as a mock', async () => {
    const manager = await tokenFor(mockApp, 'manager', MANAGER)
    const scan = await post(mockApp, `/diagnostics/devices/${deviceCode}/rescan`, manager)
    expect(scan.statusCode, scan.body).toBe(200)
    const result = scan.json() as { command: string; found: number; mock: boolean; dtcs: { code: string }[] }
    expect(result.command).toBe('rescan')
    expect(result.mock).toBe(true)
    expect(result.found).toBe(3) // the three KB codes the mock echoes

    // The readings are really persisted and reachable by the device path.
    const readings = await get(mockApp, `/diagnostics/devices/${deviceCode}/readings`, manager)
    const rows = (readings.json() as { rows: { dtc: string; cleared: boolean; mock: boolean }[] }).rows
    expect(rows).toHaveLength(3)
    expect(rows.every((r) => r.mock === true && r.cleared === false)).toBe(true)
  })

  it('clear-codes closes out the readings and zeroes the device', async () => {
    const manager = await tokenFor(mockApp, 'manager', MANAGER)
    const cleared = await post(mockApp, `/diagnostics/devices/${deviceCode}/clear-codes`, manager)
    expect(cleared.statusCode, cleared.body).toBe(200)
    const result = cleared.json() as { status: string; cleared: number; mock: boolean }
    expect(result.status).toBe('clear')
    expect(result.cleared).toBe(3)

    const readings = await get(mockApp, `/diagnostics/devices/${deviceCode}/readings`, manager)
    const rows = (readings.json() as { rows: { cleared: boolean }[] }).rows
    expect(rows.every((r) => r.cleared === true)).toBe(true)
  })

  it('refuses a role without job-card edit (403)', async () => {
    // parts holds jobcards:v but not :e — a command changes device state.
    const parts = await tokenFor(mockApp, 'parts', '01JOBDPARTS0000000000001X')
    const response = await post(mockApp, `/diagnostics/devices/${deviceCode}/rescan`, parts)
    expect(response.statusCode).toBe(403)
  })

  it("404s a device command from another organization", async () => {
    const stranger = await tokenFor(mockApp, 'manager', '01JOBDSTRANGER00000000001', SEED.otherOrgId)
    const response = await post(mockApp, `/diagnostics/devices/${deviceCode}/rescan`, stranger)
    expect(response.statusCode).toBe(404)
  })

  it('reports both integrations as EXTERNAL_DEPENDENCY with the dependency named', async () => {
    const manager = await tokenFor(liveApp, 'manager', MANAGER)
    const status = (await get(liveApp, '/diagnostics/integrations', manager)).json() as {
      integrations: { id: string; configured: boolean; dependency: string; requires: string[] }[]
    }
    const obd = status.integrations.find((i) => i.id === 'obd')
    const otp = status.integrations.find((i) => i.id === 'otp_sms')
    expect(obd?.configured).toBe(false)
    expect(obd?.dependency).toContain('OBD bridge')
    expect(otp?.configured).toBe(false)
    expect(otp?.dependency).toContain('SMS')
  })
})

describe('customer-approval OTP — §40 SMS as EXTERNAL_DEPENDENCY', () => {
  it('the unconfigured transport refuses to send with a 503', async () => {
    const advisor = await tokenFor(liveApp, 'manager', MANAGER)
    const response = await post(liveApp, `/estimates/${estimateWithCustomer}/request-approval-otp`, advisor)
    expect(response.statusCode).toBe(503)
    expect((response.json() as { error: { code: string } }).error.code).toBe('external_dependency_unavailable')
  })

  it('the memory transport completes the flow: request, a wrong code refuses, the right code verifies', async () => {
    const advisor = await tokenFor(mockApp, 'manager', MANAGER)
    const requested = await post(mockApp, `/estimates/${estimateWithCustomer}/request-approval-otp`, advisor)
    expect(requested.statusCode, requested.body).toBe(202)
    const body = requested.json() as { challengeId: string; destination: string }
    expect(body.challengeId).toBeTruthy()
    // The destination is masked and the code is never in the response.
    expect(body.destination).not.toBe(customerPhone)
    expect(JSON.stringify(body)).not.toContain('"code"')

    // A wrong code refuses with attemptsLeft, never verifying — on the same
    // challenge, so the 60s resend throttle is not in play.
    const wrong = await post(mockApp, `/estimates/${estimateWithCustomer}/verify-approval-otp`, advisor, { code: '000000' })
    expect(wrong.statusCode).toBe(401)
    const wrongBody = wrong.json() as { verified: boolean; reason: string; attemptsLeft: number }
    expect(wrongBody.verified).toBe(false)
    expect(wrongBody.reason).toBe('wrong_code')
    expect(typeof wrongBody.attemptsLeft).toBe('number')

    const code = codes.codeFor(customerPhone)
    expect(code).toBeTruthy()
    const verified = await post(mockApp, `/estimates/${estimateWithCustomer}/verify-approval-otp`, advisor, { code })
    expect(verified.statusCode, verified.body).toBe(200)
    expect((verified.json() as { verified: boolean }).verified).toBe(true)
  })
})

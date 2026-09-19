/** `GET /organization` — the caller's own tenant's VAT/CR registration
 *  identity (BLK-004: wires ZATCASettings/VATSettings off their hardcoded
 *  literals). Authenticated but ungated on purpose — see the route's own
 *  docstring — so this proves it answers for any signed-in role, stays
 *  scoped to the caller's own tenant, and reports a genuinely unset field
 *  as null rather than inventing a value.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../src/app'
import type { DbHandle } from '../src/db/client'
import { createDb } from '../src/db/client'
import type { Env } from '../src/env'
import { resetDatabase, SEED } from './harness'
import { SignJWT } from 'jose'
import type { RoleId } from '@salis/contract'

let app: FastifyInstance
let handle: DbHandle
let env: Env

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

function get(url: string, bearer?: string) {
  return app.inject({
    method: 'GET',
    url: `/api/v1${url}`,
    headers: bearer ? { authorization: `Bearer ${bearer}` } : {},
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

describe('GET /organization', () => {
  it('returns the seeded organization\'s real VAT number, not a fabricated one', async () => {
    const owner = await token('owner', '01JORGREADOWNER000000001')
    const res = await get('/organization', owner)
    expect(res.statusCode, res.body).toBe(200)
    const body = res.json() as { name: string; vatNumber: string | null; crNumber: string | null }
    expect(body.name).toBe('SALIS AUTO Riyadh')
    expect(body.vatNumber).toBe('300123456700003')
  })

  it('reports an unset CR number as null rather than inventing one', async () => {
    const owner = await token('owner', '01JORGREADOWNER000000002')
    const res = await get('/organization', owner)
    const body = res.json() as { crNumber: string | null }
    expect(body.crNumber).toBeNull()
  })

  it('answers for any authenticated role — the screen carries no RBAC module', async () => {
    const technician = await token('technician', '01JORGREADTECH0000000001')
    const res = await get('/organization', technician)
    expect(res.statusCode, res.body).toBe(200)
  })

  it('401s with no token', async () => {
    const res = await get('/organization')
    expect(res.statusCode).toBe(401)
  })

  it("never returns another organization's identity", async () => {
    const stranger = await token('owner', '01JORGREADSTRANGER000001', SEED.otherOrgId)
    const res = await get('/organization', stranger)
    expect(res.statusCode, res.body).toBe(200)
    const body = res.json() as { name: string }
    expect(body.name).toBe('Neighbouring Garage')
    expect(body.name).not.toBe('SALIS AUTO Riyadh')
  })
})

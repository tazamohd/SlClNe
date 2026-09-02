/** Tenant and branch isolation, proved at the HTTP boundary.
 *
 *  Agent 05 built row-level security and it holds at the database. That is not
 *  the same claim as "the API cannot leak across tenants": a handler could
 *  bypass RLS by running outside `withTenant`, present a row it fetched under a
 *  different context, or answer 403 where it should answer 404. So every case
 *  here goes through `app.inject` with a real token, twice where it matters —
 *  once by asking for the collection, once by pasting the neighbour's id
 *  straight into the URL.
 *
 *  **A cross-tenant read is 404, never 403.** A 403 says "that record exists
 *  and you may not have it", which is exactly the fact the isolation was
 *  protecting. The distinction is asserted rather than described: the same
 *  suite checks that a genuine permission refusal *is* 403, so the two are not
 *  being collapsed into one status by accident.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { SignJWT } from 'jose'
import { eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { RoleId } from '@salis/contract'
import { buildApp } from '../src/app'
import { withAuthPlane } from '../src/auth/context'
import { createDb, type DbHandle } from '../src/db/client'
import { customers, invoices, jobCards } from '../src/db/schema'
import type { Env } from '../src/env'
import { resetDatabase, SEED } from './harness'

let app: FastifyInstance
let handle: DbHandle
let env: Env

/** Ids the tokens below must never be able to reach. */
const neighbour = { customerId: '', invoiceId: '' }
const home = { customerId: '', invoiceId: '', jobId: '', branchTwoCustomerId: '' }

interface TokenShape {
  role: RoleId
  orgId?: string
  branchId?: string | null
  sub?: string
}

async function token(shape: TokenShape): Promise<string> {
  const key = new TextEncoder().encode(env.JWT_SECRET as string)
  return (
    new SignJWT({
      role: shape.role,
      org_id: shape.orgId ?? SEED.orgId,
      branch_id: shape.branchId === undefined ? SEED.mainBranchId : shape.branchId,
      /* Every token in this file claims the widest scope it could. The server
       * derives scope from the role instead, so the claim must have no effect —
       * which is itself one of the things under test. */
      scope: 'platform',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(shape.sub ?? `01JISO${shape.role.toUpperCase().padEnd(20, 'X').slice(0, 20)}`)
      .setIssuer(env.JWT_ISSUER)
      .setAudience(env.JWT_AUDIENCE)
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(key)
  )
}

function get(url: string, bearer: string) {
  return app.inject({ method: 'GET', url: `/api/v1${url}`, headers: { authorization: `Bearer ${bearer}` } })
}

function send(method: 'PATCH' | 'DELETE' | 'POST', url: string, bearer: string, body?: unknown) {
  return app.inject({
    method,
    url: `/api/v1${url}`,
    headers: {
      authorization: `Bearer ${bearer}`,
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
    },
    ...(body === undefined ? {} : { payload: JSON.stringify(body) }),
  })
}

beforeAll(async () => {
  env = await resetDatabase()
  handle = createDb(env.DATABASE_URL, 5)
  app = await buildApp({ db: handle.db, env })
  await app.ready()

  await withAuthPlane(handle.db, async (tx) => {
    const [otherCustomer] = await tx
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.orgId, SEED.otherOrgId))
      .limit(1)
    const [otherInvoice] = await tx
      .select({ id: invoices.id })
      .from(invoices)
      .where(eq(invoices.orgId, SEED.otherOrgId))
      .limit(1)
    const [ownCustomer] = await tx
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.orgId, SEED.orgId))
      .limit(1)
    const [ownInvoice] = await tx
      .select({ id: invoices.id })
      .from(invoices)
      .where(eq(invoices.orgId, SEED.orgId))
      .limit(1)
    const [ownJob] = await tx
      .select({ id: jobCards.id })
      .from(jobCards)
      .where(eq(jobCards.orgId, SEED.orgId))
      .limit(1)

    neighbour.customerId = otherCustomer?.id ?? ''
    neighbour.invoiceId = otherInvoice?.id ?? ''
    home.customerId = ownCustomer?.id ?? ''
    home.invoiceId = ownInvoice?.id ?? ''
    home.jobId = ownJob?.id ?? ''

    /* A record that lives in the organization's *second* branch, so the branch
     * cases have something real to fail to reach rather than something absent. */
    home.branchTwoCustomerId = '01JISOBRANCH2CUSTOMER00001'
    await tx.insert(customers).values({
      id: home.branchTwoCustomerId,
      orgId: SEED.orgId,
      branchId: SEED.secondBranchId,
      name: 'Jeddah Branch Customer',
      phone: '+966 55 222 2222',
      type: 'individual',
    })
  })

  expect(neighbour.customerId).not.toBe('')
  expect(neighbour.invoiceId).not.toBe('')
  expect(home.customerId).not.toBe('')
})

afterAll(async () => {
  await app?.close()
  await handle?.close()
})

describe('Organization A → Organization B', () => {
  it('cannot see the neighbour’s rows in a list', async () => {
    const bearer = await token({ role: 'owner' })
    const response = await get('/customers?pageSize=200', bearer)
    expect(response.statusCode, response.body).toBe(200)
    const ids = (response.json() as { rows: { _id: string }[] }).rows.map((r) => r._id)
    expect(ids).toContain(home.customerId)
    expect(ids).not.toContain(neighbour.customerId)
  })

  it('gets 404, not 403, for the neighbour’s id pasted into the URL', async () => {
    const bearer = await token({ role: 'owner' })
    const response = await get(`/customers/${neighbour.customerId}`, bearer)
    expect(response.statusCode).toBe(404)
    // The status *and* the code, because a 404 carrying `forbidden` would leak
    // the same fact in the body.
    expect(response.json().error.code).toBe('not_found')
  })

  it('gets the same 404 for an id that never existed', async () => {
    // The two cases must be indistinguishable. If they were not, the 404 would
    // be an existence oracle with extra steps.
    const bearer = await token({ role: 'owner' })
    const real = await get(`/customers/${neighbour.customerId}`, bearer)
    const imaginary = await get('/customers/01JNOSUCHRECORDATALL000001', bearer)
    expect(imaginary.statusCode).toBe(real.statusCode)
    expect(imaginary.json().error.code).toBe(real.json().error.code)
    expect(imaginary.json().error.message).toBe(real.json().error.message)
  })

  it('cannot read the neighbour’s invoice by id', async () => {
    const bearer = await token({ role: 'accountant' })
    expect((await get(`/invoices/${neighbour.invoiceId}`, bearer)).statusCode).toBe(404)
  })

  it('cannot write to the neighbour’s rows either', async () => {
    const bearer = await token({ role: 'owner' })
    const patched = await send('PATCH', `/customers/${neighbour.customerId}`, bearer, {
      name: 'Renamed by another tenant',
    })
    expect(patched.statusCode).toBe(404)
    const deleted = await send('DELETE', `/customers/${neighbour.customerId}`, bearer)
    expect(deleted.statusCode).toBe(404)

    // Still there, unchanged, when read as its owner.
    const [row] = await withAuthPlane(handle.db, async (tx) =>
      tx.select().from(customers).where(eq(customers.id, neighbour.customerId)),
    )
    expect(row?.name).toBe('Neighbour Customer')
    expect(row?.deletedAt).toBeNull()
  })

  it('cannot claim the neighbour’s organization by editing the token’s org_id', async () => {
    // A token minted for org B is a valid token; it just sees org B. What it
    // must not do is see org A. This is the mirror of every case above and it
    // catches a handler that keys off something other than the principal.
    const bearer = await token({ role: 'owner', orgId: SEED.otherOrgId, branchId: SEED.otherBranchId })
    const response = await get(`/customers/${home.customerId}`, bearer)
    expect(response.statusCode).toBe(404)
    const list = await get('/customers?pageSize=200', bearer)
    const ids = (list.json() as { rows: { _id: string }[] }).rows.map((r) => r._id)
    expect(ids).toEqual([neighbour.customerId])
  })

  it('cannot create a row into the neighbour’s organization', async () => {
    const bearer = await token({ role: 'owner' })
    const response = await send('POST', '/customers', bearer, {
      orgId: SEED.otherOrgId,
      name: 'Planted',
      phone: '+966 55 999 9999',
    })
    // Refused rather than silently re-homed, so the caller learns.
    expect(response.statusCode).toBe(400)
    expect(response.json().error.field).toBe('orgId')
  })
})

describe('Admin A → Organization B', () => {
  it('gives an owner no more reach across the tenant boundary than anyone else', async () => {
    const bearer = await token({ role: 'owner' })
    expect((await get(`/customers/${neighbour.customerId}`, bearer)).statusCode).toBe(404)
    expect((await get(`/invoices/${neighbour.invoiceId}`, bearer)).statusCode).toBe(404)
  })

  it('gives a manager none either', async () => {
    const bearer = await token({ role: 'manager' })
    expect((await get(`/customers/${neighbour.customerId}`, bearer)).statusCode).toBe(404)
  })

  it('documents the one role that does cross tenants, deliberately', async () => {
    // `superadmin` carries `scope: 'platform'` by design (`RBAC.md`: "sees all
    // tenants") — it is the platform operator, not a tenant administrator. This
    // is asserted rather than left implicit, because it is the single hole in
    // an otherwise total boundary and it should fail loudly if it is ever
    // granted to a second role.
    const bearer = await token({ role: 'superadmin' })
    const response = await get(`/customers/${neighbour.customerId}`, bearer)
    expect(response.statusCode, response.body).toBe(200)

    const platformRoles = (
      ['owner', 'superadmin', 'manager', 'advisor', 'technician', 'qc', 'parts', 'accountant',
        'hr', 'frontdesk', 'callcenter', 'procurement', 'supplier', 'customer'] as RoleId[]
    ).filter((role) => role === 'superadmin')
    expect(platformRoles).toEqual(['superadmin'])
  })
})

describe('Branch A → Branch B', () => {
  it('keeps a branch-scoped role inside its own branch', async () => {
    const bearer = await token({ role: 'manager', branchId: SEED.mainBranchId })
    const list = await get('/customers?pageSize=200', bearer)
    const ids = (list.json() as { rows: { _id: string }[] }).rows.map((r) => r._id)
    expect(ids).not.toContain(home.branchTwoCustomerId)
  })

  it('gets 404 for the other branch’s id in the URL', async () => {
    const bearer = await token({ role: 'manager', branchId: SEED.mainBranchId })
    const response = await get(`/customers/${home.branchTwoCustomerId}`, bearer)
    expect(response.statusCode).toBe(404)
    expect(response.json().error.code).toBe('not_found')
  })

  it('lets the same role reach the record from the branch that owns it', async () => {
    // Otherwise the test above would pass for the wrong reason — a record
    // nobody can see is not evidence of isolation.
    const bearer = await token({ role: 'manager', branchId: SEED.secondBranchId })
    const response = await get(`/customers/${home.branchTwoCustomerId}`, bearer)
    expect(response.statusCode, response.body).toBe(200)
  })

  it('cannot write across the branch boundary', async () => {
    const bearer = await token({ role: 'manager', branchId: SEED.mainBranchId })
    expect(
      (await send('PATCH', `/customers/${home.branchTwoCustomerId}`, bearer, { name: 'X' })).statusCode,
    ).toBe(404)
    expect((await send('DELETE', `/customers/${home.branchTwoCustomerId}`, bearer)).statusCode).toBe(404)
  })
})

describe('User A → Branch B', () => {
  it('holds an own-scoped role to its own records', async () => {
    // A technician's scope is `own`: job cards narrow to the ones assigned to
    // them. The seeded jobs are assigned to somebody else, so an unrelated
    // technician sees none of them — by collection and by id.
    const bearer = await token({ role: 'technician', sub: '01JISOTECHNOBODYELSE00001' })
    const list = await get('/jobs?pageSize=200', bearer)
    expect(list.statusCode, list.body).toBe(200)
    expect((list.json() as { rows: unknown[] }).rows).toHaveLength(0)

    const byId = await get(`/jobs/${home.jobId}`, bearer)
    expect(byId.statusCode).toBe(404)
    expect(byId.json().error.code).toBe('not_found')
  })

  it('holds a technician out of the other branch as well', async () => {
    const bearer = await token({
      role: 'technician',
      branchId: SEED.secondBranchId,
      sub: '01JISOTECHOTHERBRANCH0001',
    })
    expect((await get(`/customers/${home.customerId}`, bearer)).statusCode).toBe(404)
  })

  it('ignores a widened scope claim in the token', async () => {
    // Every token in this file claims `scope: 'platform'`. If that claim were
    // trusted, the technician above would have seen every job in the platform.
    // It saw none, and the owner token below still sees only its own tenant.
    const bearer = await token({ role: 'owner' })
    const list = await get('/customers?pageSize=200', bearer)
    const ids = (list.json() as { rows: { _id: string }[] }).rows.map((r) => r._id)
    expect(ids).not.toContain(neighbour.customerId)
  })
})

describe('404 and 403 mean different things', () => {
  it('answers 403 for a permission refusal on a record that is in reach', async () => {
    // The contrast that makes the 404s above meaningful. A technician may not
    // create customers, and that refusal is a 403 because nothing about the
    // existence of a record is being disclosed.
    const bearer = await token({ role: 'technician' })
    const response = await send('POST', '/customers', bearer, {
      name: 'Nope',
      phone: '+966 55 111 1111',
    })
    expect(response.statusCode).toBe(403)
    expect(response.json().error.code).toBe('forbidden')
  })

  it('answers 404 when the same role reaches across a tenant, not 403', async () => {
    const bearer = await token({ role: 'accountant' })
    const cross = await get(`/customers/${neighbour.customerId}`, bearer)
    expect(cross.statusCode).toBe(404)

    // And 403 where it genuinely lacks the grant on a record it can see.
    const refused = await send('DELETE', `/customers/${home.customerId}`, bearer)
    expect(refused.statusCode).toBe(403)
  })

  it('requires a token at all before either question is asked', async () => {
    const anonymous = await app.inject({ method: 'GET', url: `/api/v1/customers/${home.customerId}` })
    expect(anonymous.statusCode).toBe(401)
  })
})

describe('the authentication plane does not widen anything', () => {
  it('is the only module that opens a platform-scoped transaction', async () => {
    // `withAuthPlane` deliberately spans tenants — a login has no tenant yet.
    // That is safe only while it stays confined to `src/auth/**`, so this test
    // is the fence rather than the comment that asks nicely.
    const { readdirSync, readFileSync, statSync } = await import('node:fs')
    const { join, relative } = await import('node:path')
    const { fileURLToPath } = await import('node:url')
    /* `URL.pathname` gives `/C:/…` on Windows, which `join` turns into
     * `C:\C:\…`; the walk threw ENOENT and this fence never actually ran
     * there. `fileURLToPath` is the portable spelling. */
    const root = fileURLToPath(new URL('../src', import.meta.url))

    const offenders: string[] = []
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)
        if (statSync(full).isDirectory()) {
          walk(full)
          continue
        }
        if (!entry.endsWith('.ts')) continue
        const rel = relative(root, full).replace(/\\/g, '/')
        if (rel.startsWith('auth/')) continue
        const source = readFileSync(full, 'utf8')
        if (source.includes('withAuthPlane')) offenders.push(rel)
        /* The other way to reach every tenant is to set the GUC to the literal
         * `platform` by hand. `db/tenant.ts` sets it from `principal.scope`,
         * which is derived from the role and never read off a token — that is
         * the sanctioned mechanism, and it is not what this looks for. */
        if (/set_config\(\s*'app\.scope',\s*'platform'/.test(source)) {
          offenders.push(`${rel} (hardcodes platform scope)`)
        }
      }
    }
    walk(root)
    expect(offenders).toEqual([])
  })
})

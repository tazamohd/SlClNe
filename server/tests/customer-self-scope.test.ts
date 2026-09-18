/** The `self` scope: what a customer principal can reach, and what it cannot.
 *
 *  Until `drizzle/0014` the scope narrowed nothing a customer cares about.
 *  `0001_rls.sql` narrows `self` by branch, and again by an owner column on the
 *  four tables that have one — `assigned_tech_id`, `technician_id`,
 *  `created_by`, `user_id`. None of those is the customer. So a self-scoped
 *  read of `vehicles` returned every vehicle in the branch, and a read of
 *  `job_cards` returned none of the customer's own.
 *
 *  Nobody had noticed because the customer role held `v` on nothing: the portal
 *  rendered four error alerts instead of leaking. Granting it the five modules
 *  its screens read is what makes the leak reachable, so the grant and the
 *  policy have to land together, and this file is what says they did.
 *
 *  Three claims, and the third is the one that survives future work:
 *
 *    1. A customer sees their own rows. Exactly their own — the counts here are
 *       against a seed where the branch holds five vehicles and one is Ahmed's.
 *    2. A customer cannot reach another customer's row, by listing or by id.
 *    3. Every RLS-enabled table denies `self` unless it was deliberately
 *       opened. That one is structural rather than exemplary: a table added by
 *       a later migration fails it, which is the only way a deny-by-default
 *       rule stays true after the person who wrote it has moved on.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq, sql } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { customers, users } from '../src/db/schema'
import { withAuthPlane } from '../src/auth/context'
import { createDb, type DbHandle } from '../src/db/client'
import { startHarness, SEED, type Harness } from './harness'

let harness: Harness
let app: FastifyInstance
let admin: DbHandle

/** The two customers this file plays off against each other. Ahmed is the one
 *  the demo customer login is, and the one carrying a row in every table the
 *  portal reads; Fatima is a different customer in the same branch, which is
 *  the interesting neighbour — a different *tenant* was already covered by
 *  `isolation.test.ts`, and passing that test tells you nothing about whether
 *  two customers of the same workshop are separated. */
const ahmed = { customerId: '', vehicleId: '', invoiceId: '', userId: '' }
const fatima = { customerId: '', vehicleId: '', invoiceId: '' }

async function idOfCustomer(name: string): Promise<string> {
  const [row] = await withAuthPlane(admin.db, (tx) =>
    tx.select({ id: customers.id }).from(customers).where(eq(customers.name, name)).limit(1),
  )
  if (!row) throw new Error(`the seed carries no customer named "${name}"`)
  return row.id
}

async function firstOwned(table: 'vehicles' | 'invoices', customerId: string): Promise<string> {
  const rows = await withAuthPlane(admin.db, (tx) =>
    tx.execute(sql`
      select id from ${sql.identifier(table)}
       where customer_id = ${customerId} and org_id = ${SEED.orgId}
       limit 1
    `),
  )
  const id = (rows as unknown as { id: string }[])[0]?.id
  if (!id) throw new Error(`the seed links no ${table} row to that customer`)
  return id
}

beforeAll(async () => {
  harness = await startHarness()
  app = harness.app
  admin = createDb(harness.env.DATABASE_ADMIN_URL ?? harness.env.DATABASE_URL, 2)

  ahmed.customerId = await idOfCustomer('Ahmed Al-Rashid')
  fatima.customerId = await idOfCustomer('Fatima Al-Zahrani')
  ahmed.vehicleId = await firstOwned('vehicles', ahmed.customerId)
  ahmed.invoiceId = await firstOwned('invoices', ahmed.customerId)
  fatima.vehicleId = await firstOwned('vehicles', fatima.customerId)
  fatima.invoiceId = await firstOwned('invoices', fatima.customerId)

  const [row] = await withAuthPlane(admin.db, (tx) =>
    tx.select({ id: users.id }).from(users).where(eq(users.email, 'ahmed@example.sa')).limit(1),
  )
  if (!row) throw new Error('the seed carries no customer demo login')
  ahmed.userId = row.id
}, 120_000)

afterAll(async () => {
  await admin?.close()
  await harness?.close()
})

function get(url: string, bearer: string) {
  return app.inject({
    method: 'GET',
    url: `/api/v1${url}`,
    headers: { authorization: `Bearer ${bearer}` },
  })
}

async function customerToken(customerId: string | null, sub = ahmed.userId) {
  return harness.token('customer', { customerId, sub })
}

function rowsOf(payload: string): unknown[] {
  const body = JSON.parse(payload) as { rows?: unknown }
  return Array.isArray(body.rows) ? body.rows : []
}

describe('a customer reads their own records', () => {
  it('sees exactly the rows linked to them, not the branch', async () => {
    const bearer = await customerToken(ahmed.customerId)
    const staff = await harness.token('manager')

    for (const path of ['/vehicles', '/invoices', '/jobs', '/estimates', '/appointments']) {
      const mine = await get(path, bearer)
      const theirs = await get(path, staff)
      expect(mine.statusCode, path).toBe(200)
      expect(theirs.statusCode, path).toBe(200)

      const own = rowsOf(mine.payload)
      const all = rowsOf(theirs.payload)
      /* The seed gives Ahmed one row in each of these. The assertion that
       * matters is not the 1 — it is that it is fewer than what staff see, so
       * the policy is doing something rather than passing everything. */
      expect(own.length, `${path}: rows a customer sees`).toBe(1)
      expect(all.length, `${path}: rows staff see`).toBeGreaterThan(own.length)
    }
  })

  it('reads the service catalogue, which is nobody in particular’s', async () => {
    const bearer = await customerToken(ahmed.customerId)
    const response = await get('/services', bearer)
    expect(response.statusCode).toBe(200)
    expect(rowsOf(response.payload).length).toBeGreaterThan(0)
  })

  it('is refused a module it holds nothing on', async () => {
    const bearer = await customerToken(ahmed.customerId)
    /* `inventory` is not in the customer's row of the matrix at all, so this is
     * the permission check answering, not the policy. */
    expect((await get('/inventory', bearer)).statusCode).toBe(403)
  })

  it('gets nothing from the rest of the jobcards module it was granted', async () => {
    /* `jobcards: 'v'` is granted for `jobs` and `services`, and the module also
     * carries the workshop's knowledge base and every diagnostic table. The
     * grant cannot distinguish them — `r_self` does, by denying by default. So
     * these answer 200 with an empty page rather than 403: authorized to ask,
     * with no rows to be told about. */
    const bearer = await customerToken(ahmed.customerId)
    for (const path of ['/kb/procedures', '/kb/dtc', '/diagnostics/findings']) {
      const response = await get(path, bearer)
      expect(response.statusCode, path).toBe(200)
      expect(rowsOf(response.payload), path).toHaveLength(0)
    }
  })
})

describe('one customer cannot reach another', () => {
  it('does not list the neighbour’s rows', async () => {
    const bearer = await customerToken(ahmed.customerId)
    const vehicleIds = rowsOf((await get('/vehicles', bearer)).payload).map(
      (row) => (row as { _id: string })._id,
    )
    expect(vehicleIds).toContain(ahmed.vehicleId)
    expect(vehicleIds).not.toContain(fatima.vehicleId)
  })

  it('is answered 404, not 403, when it asks by id', async () => {
    const bearer = await customerToken(ahmed.customerId)
    /* 404 rather than 403 for the same reason `isolation.test.ts` insists on
     * it: 403 would confirm the row exists, which is the fact being kept. */
    expect((await get(`/vehicles/${fatima.vehicleId}`, bearer)).statusCode).toBe(404)
    expect((await get(`/invoices/${fatima.invoiceId}`, bearer)).statusCode).toBe(404)
    expect((await get(`/vehicles/${ahmed.vehicleId}`, bearer)).statusCode).toBe(200)
  })

  it('sees nothing at all when the account carries no customer link', async () => {
    /* The fail-closed case, and the one a mistake is most likely to produce: a
     * portal account nobody linked. `app_customer()` is NULL, and NULL matches
     * no row — so the answer is an empty portal, never a full one. */
    const bearer = await customerToken(null)
    for (const path of ['/vehicles', '/invoices', '/jobs', '/estimates', '/appointments']) {
      const response = await get(path, bearer)
      expect(response.statusCode, path).toBe(200)
      expect(rowsOf(response.payload), path).toHaveLength(0)
    }
  })
})

describe('booking an appointment', () => {
  const booking = {
    scheduledDate: '2026-08-14',
    timeLabel: '11:00 AM',
    startMinute: 660,
    durationMins: 60,
    customerName: 'Ahmed Al-Rashid',
    vehicleLabel: 'Toyota Camry',
    plate: 'ABC 1234',
    serviceLabel: 'Oil Change',
    bay: 'Reception',
    status: 'awaiting',
  }

  async function book(bearer: string, body: Record<string, unknown>) {
    return app.inject({
      method: 'POST',
      url: '/api/v1/appointments',
      headers: { authorization: `Bearer ${bearer}`, 'content-type': 'application/json' },
      payload: JSON.stringify(body),
    })
  }

  it('lands against the booking customer, and they can read it back', async () => {
    const bearer = await customerToken(ahmed.customerId)
    const created = await book(bearer, booking)
    expect(created.statusCode).toBe(201)

    const id = (JSON.parse(created.payload) as { _id: string })._id
    const rows = await withAuthPlane(admin.db, (tx) =>
      tx.execute(sql`select customer_id from appointments where id = ${id}`),
    )
    expect((rows as unknown as { customer_id: string }[])[0]?.customer_id).toBe(ahmed.customerId)
    expect((await get(`/appointments/${id}`, bearer)).statusCode).toBe(200)
  })

  it('cannot be filed against somebody else by asking', async () => {
    /* The body names the customer as a string, and the server has never read an
     * id from it. This asserts that stays true: whatever the request says, the
     * row is stamped from the principal. */
    const bearer = await customerToken(ahmed.customerId)
    const created = await book(bearer, {
      ...booking,
      timeLabel: '12:00 PM',
      startMinute: 720,
      customerId: fatima.customerId,
      customerName: 'Fatima Al-Zahrani',
    })
    if (created.statusCode === 201) {
      const id = (JSON.parse(created.payload) as { _id: string })._id
      const rows = await withAuthPlane(admin.db, (tx) =>
        tx.execute(sql`select customer_id from appointments where id = ${id}`),
      )
      expect((rows as unknown as { customer_id: string }[])[0]?.customer_id).toBe(ahmed.customerId)
    } else {
      /* Refusing the unknown key outright is the other acceptable answer, and
       * the stricter one. What must not happen is a 201 against Fatima. */
      expect(created.statusCode).toBeGreaterThanOrEqual(400)
      expect(created.statusCode).toBeLessThan(500)
    }
  })
})

describe('the deny-by-default rule itself', () => {
  /* The plumbing the request path writes under whatever principal is in hand:
   * the audit row for a customer's booking, its idempotency record, and the
   * organization row. Denying these would break the mutation the grants exist
   * to allow. Named here as well as in the migration so the two have to be
   * changed together. */
  const plumbing = ['audit_log', 'idempotency_keys', 'organizations']

  it('covers every table row-level security is enabled on', async () => {
    const rows = await withAuthPlane(admin.db, (tx) =>
      tx.execute(sql`
        select c.relname as table_name
          from pg_class c
          join pg_namespace n on n.oid = c.relnamespace
         where c.relrowsecurity
           and c.relkind = 'r'
           and n.nspname = current_schema()
           and not exists (
             select 1 from pg_policy p
              where p.polrelid = c.oid and p.polname = 'r_self')
         order by 1
      `),
    )
    const uncovered = (rows as unknown as { table_name: string }[]).map((row) => row.table_name)
    /* A table here is a table a self-scoped principal is not narrowed on. If a
     * migration adds one, this is where it shows up — before it reaches a
     * customer's browser. */
    expect(uncovered).toEqual(plumbing.slice().sort())
  })

  it('leaves the technician’s own-scope policy alone', async () => {
    /* `0014` rewrote `r_own` to stop claiming `self`, which is what had been
     * hiding a customer's own job card from them. The technician portal reads
     * through the same policy, so this checks the rewrite did not take `own`
     * with it. */
    const bearer = await harness.token('technician', { sub: SEED.techUserId })
    const response = await get('/jobs', bearer)
    expect(response.statusCode).toBe(200)
    expect(rowsOf(response.payload).length).toBeGreaterThan(0)
  })
})

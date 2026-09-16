/** Gated CSV export — the `x` grant made real.
 *
 *  The RBAC matrix grants `x` (export) on thirteen modules, but until the
 *  generic export route existed no endpoint consumed it: the capability the
 *  matrix promised was unbuilt, and the persona lab had to skip every `x` cell.
 *  This suite pins the route that closes that gap — `GET /{path}/export` — on
 *  the four properties that make it a *control* rather than a download button:
 *
 *    1. a role that holds `x` gets a well-formed, spreadsheet-safe CSV;
 *    2. a role that holds `v` but not `x` is refused — export is a stricter gate
 *       than view, which is the entire reason the export column exists;
 *    3. the field-level redaction `presentRow` applies is honoured on the CSV,
 *       so an exporter never receives a column their role may not see;
 *    4. the RLS scope holds, so an export carries only the caller's own org;
 *    5. the export is written to the audit log (DF-006), so "who took the
 *       customer list, and when" is answerable from `audit_log` — the one
 *       question a bulk-egress control exists to answer.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { and, desc, eq } from 'drizzle-orm'
import { withAuthPlane } from '../src/auth/context'
import { auditLog } from '../src/db/schema'
import { collectionByKey } from '../src/registry'
import { presentRow, toCsv } from '../src/routes/collections'
import type { Principal } from '../src/db/tenant'
import { SEED, startHarness, type Harness } from './harness'

let harness: Harness

const auth = (token: string, body?: unknown) => ({
  headers: {
    authorization: `Bearer ${token}`,
    ...(body === undefined ? {} : { 'content-type': 'application/json' }),
  },
  ...(body === undefined ? {} : { payload: body as object }),
})

/** The rows of a CSV body, split on the RFC-4180 CRLF the serialiser emits. The
 *  trailing empty element (from the final terminator) is dropped. */
function csvLines(body: string): string[] {
  return body.split('\r\n').filter((line) => line.length > 0)
}

beforeAll(async () => {
  harness = await startHarness()
}, 120_000)

afterAll(async () => {
  await harness?.close()
})

/* ─────────────────────────────────────────────── a role that holds `x` */

describe('a role holding the export grant gets a spreadsheet-safe CSV', () => {
  it('serves text/csv as a dated attachment, with a header row and data', async () => {
    const owner = await harness.token('owner')
    const res = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/customers/export',
      ...auth(owner),
    })

    expect(res.statusCode, res.body).toBe(200)
    expect(res.headers['content-type']).toBe('text/csv; charset=utf-8')
    expect(res.headers['content-disposition']).toMatch(
      /^attachment; filename="customer-\d{4}-\d{2}-\d{2}\.csv"$/,
    )

    const lines = csvLines(res.body)
    // A header plus at least one seeded customer.
    expect(lines.length).toBeGreaterThan(1)
    const header = lines[0]!.split(',')
    expect(header).toContain('_id')
    expect(header).toContain('name')
    expect(header).toContain('phone')
  })

  it('neutralises formula-injection cells and quotes delimiters (OWASP)', async () => {
    const owner = await harness.token('owner')
    /* A name that a spreadsheet would execute as a formula, and a phone that
     * legitimately starts with `+` — both must arrive neutralised, not live. */
    const created = await harness.app.inject({
      method: 'POST',
      url: '/api/v1/customers',
      ...auth(owner, { name: '=cmd|calc,DROP', phone: '+966551112222' }),
    })
    expect(created.statusCode, created.body).toBe(201)

    const res = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/customers/export?q=cmd',
      ...auth(owner),
    })
    expect(res.statusCode, res.body).toBe(200)

    // The formula lead is defused with a leading apostrophe, and because the
    // value also carries a comma the whole cell is RFC-4180 quoted — so the
    // guard character sits *inside* the quotes where no parser can peel it off.
    expect(res.body).toContain(`"'=cmd|calc,DROP"`)
    // No cell begins with a *live* formula: every `=` here is preceded by the
    // apostrophe guard (or the RFC-4180 opening quote around it), never by a
    // start-of-cell boundary.
    expect(res.body).not.toMatch(/(^|[",])=cmd/m)
    // The phone's leading `+` is neutralised too.
    expect(res.body).toContain(`'+966551112222`)
  })
})

/* ─────────────────────────── export is a stricter gate than view (`x` ≠ `v`) */

describe('export refuses a role that may view but not export', () => {
  it('lets an advisor list customers but 403s their export', async () => {
    const advisor = await harness.token('advisor')

    // The advisor holds `customers: 'vce'` — view, create, edit, but no `x`.
    const list = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/customers',
      ...auth(advisor),
    })
    expect(list.statusCode, 'advisor may list on screen').toBe(200)

    const exported = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/customers/export',
      ...auth(advisor),
    })
    expect(exported.statusCode, 'but may not walk out with the whole table').toBe(403)
    expect((exported.json() as { error?: { code?: string } }).error?.code).toBe('forbidden')
  })
})

/* ──────────────────────────── the redaction `presentRow` applies is honoured */

describe('a redacted field never reaches the exported CSV', () => {
  /* The export route serialises exactly what `presentRow` returns, so a field
   * the role is hidden from is nulled before it is ever a cell. No *live* role
   * both holds `inventory:x` and is hidden from part cost — the x-holders
   * (owner, manager, parts, accountant, procurement) are none of them in the
   * "Part cost / margin" hidden list — so this is defence in depth on the HTTP
   * route and cannot be exercised through it. It is proved instead at the unit
   * boundary the export path shares with the list route, the same way
   * `hr.test.ts` proves salary redaction: `toCsv(presentRow(...))`. */
  function principal(role: Principal['role']): Principal {
    return { userId: '01JEXPORTUSERXXXXXXXXXXXXX', orgId: SEED.orgId, branchId: SEED.mainBranchId, role, scope: 'all' }
  }

  /** A raw parts row shaped as the driver returns it, with a distinctive cost. */
  const rawPart = {
    id: '01JPARTROWFOREXPORTTEST01',
    version: 1,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    name: 'Brake pad set',
    sku: 'BP-EXPORT-1',
    onHand: 8,
    reorderLevel: 2,
    priceHalalas: 20000,
    costHalalas: 133337,
    reserved: 1,
  }

  it('omits part cost for a hidden role but keeps it for a permitted one', () => {
    const def = collectionByKey('parts')!

    const hidden = toCsv([presentRow(def, principal('technician'), rawPart)])
    const shown = toCsv([presentRow(def, principal('parts'), rawPart)])

    // The header keeps the column in both — a redacted field is nulled, not
    // dropped, so every row still lines up — but its value is present only for
    // the role permitted to see it.
    expect(hidden.split('\r\n')[0]).toContain('costHalalas')
    expect(hidden).not.toContain('133337')
    expect(shown).toContain('133337')
  })
})

/* ─────────────────────────────────────────────── RLS holds across the export */

describe('an export carries only the caller’s own tenant', () => {
  it('excludes another org’s rows from the neighbour’s export', async () => {
    const homeOwner = await harness.token('owner')
    const homeList = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/customers?pageSize=1',
      ...auth(homeOwner),
    })
    const homeId = (homeList.json() as { rows?: { _id?: string }[] }).rows?.[0]?._id
    expect(homeId, 'the home org must have a seeded customer to test against').toBeTruthy()

    const otherOwner = await harness.token('owner', {
      orgId: SEED.otherOrgId,
      branchId: SEED.otherBranchId,
    })
    const neighbour = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/customers/export',
      ...auth(otherOwner),
    })
    expect(neighbour.statusCode, neighbour.body).toBe(200)

    // The neighbour's own rows are there…
    expect(csvLines(neighbour.body).length).toBeGreaterThan(1)
    // …but the home org's record — reachable by the home owner a line above — is
    // invisible across the tenant boundary, exactly as it is on the list route.
    expect(neighbour.body).not.toContain(homeId as string)
  })
})

/* ──────────────────────────────────────────── the egress is on the record */

describe('a bulk export is audited (DF-006)', () => {
  /** The newest audit row for a collection's entity, read on the auth plane —
   *  a direct `db.execute` carries no tenant context, so `app_org()` is null
   *  and RLS matches nothing. */
  async function latestExportAudit(entity: string) {
    const [row] = await withAuthPlane(harness.handle.db, async (tx) =>
      tx
        .select()
        .from(auditLog)
        .where(and(eq(auditLog.entity, entity), eq(auditLog.action, 'export')))
        .orderBy(desc(auditLog.id))
        .limit(1),
    )
    return row
  }

  it('records the actor, the collection, the row count and the narrowing', async () => {
    const owner = await harness.token('owner')
    const res = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/customers/export?q=a&sort=createdAt:desc',
      ...auth(owner),
    })
    expect(res.statusCode, res.body).toBe(200)
    /* The data rows the caller actually received, header line excluded. */
    const received = csvLines(res.body).length - 1

    const row = await latestExportAudit('customer')
    expect(row, 'the export must have written an audit row').toBeDefined()
    expect(row!.action).toBe('export')
    expect(row!.actorRole).toBe('owner')
    /* An act on a set, not on a record. */
    expect(row!.entityId).toBeNull()

    const after = row!.after as {
      collection: string
      format: string
      rowCount: number
      totalInScope: number
      truncated: boolean
      query: { q: string | null; sort: string | null; includeDeleted: boolean }
    }
    expect(after.collection).toBe('customers')
    expect(after.format).toBe('csv')
    /* The log's count is the count that left, not an estimate. */
    expect(after.rowCount).toBe(received)
    expect(after.truncated).toBe(false)
    /* *Which* rows left: an export of every customer and an export of one
     * search are different disclosures. */
    expect(after.query.q).toBe('a')
    expect(after.query.sort).toBe('createdAt:desc')
    expect(after.query.includeDeleted).toBe(false)
  })

  it('writes nothing when the export is refused', async () => {
    /* advisor holds `customers:vce` — view, but no `x`. Nothing was disclosed,
     * so there is nothing to record; the gate throws before the transaction
     * opens. */
    const before = await latestExportAudit('customer')
    const advisor = await harness.token('advisor')
    const refused = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/customers/export',
      ...auth(advisor),
    })
    expect(refused.statusCode).toBe(403)
    const after = await latestExportAudit('customer')
    expect(after?.id).toBe(before?.id)
  })

  it('does not surface one org\'s export to another', async () => {
    const otherOwner = await harness.token('owner', {
      orgId: SEED.otherOrgId,
      branchId: SEED.otherBranchId,
    })
    const res = await harness.app.inject({
      method: 'GET',
      url: '/api/v1/vehicles/export',
      ...auth(otherOwner),
    })
    expect(res.statusCode, res.body).toBe(200)

    /* The row landed under the neighbour's org, which is what makes the log
     * readable per tenant rather than a shared pile. */
    const row = await latestExportAudit('vehicle')
    expect(row!.orgId).toBe(SEED.otherOrgId)
  })
})

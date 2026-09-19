/** `GET /audit-log` — the org-wide audit feed (BLK-004: wires AuditLog off
 *  its fixtures). Same append-only table `history-read.test.ts` reads one
 *  entity at a time; this reads the flat, most-recent-first feed across the
 *  tenant, gated on `audit:v`, with the actor's name joined in and a
 *  derived `category` (auth / data / system) the route's own docstring
 *  defines as a partition of the rows it already reads.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { sql } from 'drizzle-orm'
import { ulid } from 'ulid'
import type { RoleId } from '@salis/contract'
import type { DbHandle } from '../src/db/client'
import { createDb } from '../src/db/client'
import { buildApp } from '../src/app'
import type { FastifyInstance } from 'fastify'
import type { Env } from '../src/env'
import { resetDatabase, SEED } from './harness'
import { SignJWT } from 'jose'

let app: FastifyInstance
let handle: DbHandle
let env: Env

const OWNER = '01JAUDITOWNER0000000000X1'
const TECHNICIAN = '01JAUDITTECH00000000000X1'

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

async function asOrg<T>(
  orgId: string,
  fn: (tx: Parameters<Parameters<DbHandle['db']['transaction']>[0]>[0]) => Promise<T>,
): Promise<T> {
  return handle.db.transaction(async (tx) => {
    await tx.execute(
      sql`select set_config('app.org_id', ${orgId}, true), set_config('app.scope', 'all', true), set_config('app.user_id', ${SEED.systemUserId}, true)`,
    )
    return fn(tx)
  })
}

interface RawAuditRow {
  actorId: string | null
  actorRole: string | null
  action: string
  entity: string
  entityId: string
  source?: 'api' | 'seed' | 'job' | 'import'
  reason?: string
  ip?: string
  orgId?: string
}

async function insertAudit(row: RawAuditRow): Promise<string> {
  const id = ulid()
  await asOrg(row.orgId ?? SEED.orgId, async (tx) => {
    await tx.execute(sql`
      insert into audit_log (id, org_id, actor_id, actor_role, action, entity, entity_id, source, reason, ip)
      values (
        ${id}, ${row.orgId ?? SEED.orgId}, ${row.actorId}, ${row.actorRole}, ${row.action},
        ${row.entity}, ${row.entityId}, ${row.source ?? 'api'}, ${row.reason ?? null}, ${row.ip ?? null}
      )
    `)
  })
  return id
}

interface AuditLogBody {
  entries: {
    id: string
    actorId: string | null
    actorName: string | null
    action: string
    entity: string
    entityId: string | null
    category: 'auth' | 'data' | 'system'
    ip: string | null
  }[]
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

describe('GET /audit-log', () => {
  it('refuses a role with no view grant on audit (403)', async () => {
    const technician = await token('technician', TECHNICIAN)
    const res = await get('/audit-log', technician)
    expect(res.statusCode).toBe(403)
  })

  it('returns only the caller organization\'s entries, never another tenant\'s', async () => {
    const marker = `own-org-${ulid()}`
    const foreignMarker = `foreign-org-${ulid()}`
    await insertAudit({ actorId: OWNER, actorRole: 'owner', action: 'create', entity: 'customer', entityId: marker, reason: marker })
    await insertAudit({
      actorId: OWNER,
      actorRole: 'owner',
      action: 'create',
      entity: 'customer',
      entityId: foreignMarker,
      reason: foreignMarker,
      orgId: SEED.otherOrgId,
    })

    const owner = await token('owner', OWNER)
    const res = await get('/audit-log?limit=200', owner)
    expect(res.statusCode, res.body).toBe(200)
    const body = res.json() as AuditLogBody
    const entityIds = body.entries.map((e) => e.entityId)
    expect(entityIds).toContain(marker)
    expect(entityIds).not.toContain(foreignMarker)
  })

  it("joins the actor's name from the users table", async () => {
    const marker = `named-actor-${ulid()}`
    await insertAudit({
      actorId: SEED.techUserId,
      actorRole: 'technician',
      action: 'update',
      entity: 'job_card',
      entityId: marker,
    })

    const owner = await token('owner', OWNER)
    const res = await get('/audit-log?limit=200', owner)
    expect(res.statusCode, res.body).toBe(200)
    const body = res.json() as AuditLogBody
    const entry = body.entries.find((e) => e.entityId === marker)
    expect(entry?.actorName).toBe('Saeed Al-Zahrani')
  })

  it('classifies session and password_reset rows as auth, unattended/non-api rows as system, everything else as data', async () => {
    const authMarker = `auth-${ulid()}`
    const systemMarkerNoActor = `system-noactor-${ulid()}`
    const systemMarkerSeed = `system-seed-${ulid()}`
    const dataMarker = `data-${ulid()}`

    await insertAudit({ actorId: OWNER, actorRole: 'owner', action: 'create', entity: 'session', entityId: authMarker })
    await insertAudit({ actorId: null, actorRole: null, action: 'update', entity: 'invoice', entityId: systemMarkerNoActor })
    await insertAudit({ actorId: OWNER, actorRole: 'owner', action: 'create', entity: 'job_card', entityId: systemMarkerSeed, source: 'seed' })
    await insertAudit({ actorId: OWNER, actorRole: 'owner', action: 'create', entity: 'invoice', entityId: dataMarker })

    const owner = await token('owner', OWNER)
    const res = await get('/audit-log?limit=200', owner)
    const body = res.json() as AuditLogBody
    const byMarker = new Map(body.entries.map((e) => [e.entityId, e]))
    expect(byMarker.get(authMarker)?.category).toBe('auth')
    expect(byMarker.get(systemMarkerNoActor)?.category).toBe('system')
    expect(byMarker.get(systemMarkerSeed)?.category).toBe('system')
    expect(byMarker.get(dataMarker)?.category).toBe('data')
  })

  it('?category=auth narrows to session and password_reset rows only', async () => {
    const authMarker = `catfilter-auth-${ulid()}`
    const dataMarker = `catfilter-data-${ulid()}`
    await insertAudit({ actorId: OWNER, actorRole: 'owner', action: 'delete', entity: 'session', entityId: authMarker })
    await insertAudit({ actorId: OWNER, actorRole: 'owner', action: 'create', entity: 'invoice', entityId: dataMarker })

    const owner = await token('owner', OWNER)
    const res = await get('/audit-log?category=auth&limit=200', owner)
    expect(res.statusCode, res.body).toBe(200)
    const body = res.json() as AuditLogBody
    const entities = new Set(body.entries.map((e) => e.entity))
    expect([...entities]).toEqual(['session'])
    expect(body.entries.some((e) => e.entityId === dataMarker)).toBe(false)
    expect(body.entries.some((e) => e.entityId === authMarker)).toBe(true)
  })

  it('?q= searches action, entity and reason', async () => {
    const needle = `needle-${ulid()}`
    await insertAudit({
      actorId: OWNER,
      actorRole: 'owner',
      action: 'update',
      entity: 'invoice',
      entityId: ulid(),
      reason: `contains ${needle} in its reason`,
    })

    const owner = await token('owner', OWNER)
    const res = await get(`/audit-log?q=${encodeURIComponent(needle)}&limit=200`, owner)
    expect(res.statusCode, res.body).toBe(200)
    const body = res.json() as AuditLogBody
    expect(body.entries.some((e) => (e as { reason?: string }).reason?.includes(needle))).toBe(true)
  })

  it('caps the result at ?limit=', async () => {
    for (let i = 0; i < 5; i++) {
      await insertAudit({ actorId: OWNER, actorRole: 'owner', action: 'create', entity: 'customer', entityId: ulid() })
    }
    const owner = await token('owner', OWNER)
    const res = await get('/audit-log?limit=3', owner)
    const body = res.json() as AuditLogBody
    expect(body.entries.length).toBeLessThanOrEqual(3)
  })
})

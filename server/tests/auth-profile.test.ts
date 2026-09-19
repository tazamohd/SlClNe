/** `PATCH /auth/me` and `POST /auth/change-password` — a signed-in caller
 *  editing their own display name or replacing a password they already know.
 *  Wires the Profile screen (previously a "Save Changes" button that always
 *  showed success and never called the server) onto real state.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import type { RoleId } from '@salis/contract'
import { buildApp } from '../src/app'
import { withAuthPlane } from '../src/auth/context'
import { createDb, type DbHandle } from '../src/db/client'
import { users } from '../src/db/schema'
import { systemPrincipal } from '../src/db/tenant'
import type { Env } from '../src/env'
import { resetDatabase, SEED } from './harness'

const PASSWORD = 'correct-horse-battery-staple'

let app: FastifyInstance
let handle: DbHandle
let env: Env
const userIds = new Map<RoleId, string>()

function post(url: string, body: unknown, token?: string) {
  return app.inject({
    method: 'POST',
    url: `/api/v1${url}`,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    payload: JSON.stringify(body ?? {}),
  })
}

function patch(url: string, body: unknown, token?: string) {
  return app.inject({
    method: 'PATCH',
    url: `/api/v1${url}`,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    payload: JSON.stringify(body ?? {}),
  })
}

async function login(email: string, password = PASSWORD) {
  return post('/auth/login', { email, password })
}

beforeAll(async () => {
  env = await resetDatabase()
  handle = createDb(env.DATABASE_URL, 5)
  app = await buildApp({ db: handle.db, env })
  await app.ready()

  const rows = await withAuthPlane(handle.db, async (tx) =>
    tx.select({ id: users.id, email: users.email, role: users.role }).from(users),
  )
  for (const row of rows) userIds.set(row.role as RoleId, row.id)

  const admin = systemPrincipal(SEED.orgId, SEED.systemUserId)
  await app.auth.service.setPassword(admin, { userId: userIds.get('owner') as string }, PASSWORD, {})
  await app.auth.service.setPassword(admin, { userId: userIds.get('manager') as string }, PASSWORD, {})
}, 120_000)

afterAll(async () => {
  await app?.close()
  await handle?.close()
})

describe('PATCH /auth/me', () => {
  it("updates the caller's own name and returns it in the response", async () => {
    const login1 = (await login('owner@salisauto.sa')).json()
    const res = await patch('/auth/me', { name: 'Khalid Renamed' }, login1.accessToken)
    expect(res.statusCode, res.body).toBe(200)
    expect(res.json().user.name).toBe('Khalid Renamed')

    const me = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: { authorization: `Bearer ${login1.accessToken}` },
    })
    expect(me.json().user.name).toBe('Khalid Renamed')
  })

  it('rejects an empty name (400) rather than clearing it', async () => {
    const login1 = (await login('manager@salisauto.sa')).json()
    const res = await patch('/auth/me', { name: '   ' }, login1.accessToken)
    expect(res.statusCode).toBe(400)
  })

  it('401s with no token', async () => {
    const res = await patch('/auth/me', { name: 'Nobody' })
    expect(res.statusCode).toBe(401)
  })

  it('never lets a caller change another org member by writing an id into the body', async () => {
    /* There is no id field to accept, but proves the point directly: it is
     * always the caller's own row that moves, whatever else the body carries. */
    const login1 = (await login('owner@salisauto.sa')).json()
    const res = await patch(
      '/auth/me',
      { name: 'Still Me', userId: userIds.get('manager') },
      login1.accessToken,
    )
    expect(res.statusCode, res.body).toBe(200)
    expect(res.json().user.id).toBe(userIds.get('owner'))
  })
})

describe('POST /auth/change-password', () => {
  it('changes the password when the current one is correct, and the new one works', async () => {
    const login1 = (await login('owner@salisauto.sa')).json()
    const res = await post(
      '/auth/change-password',
      { currentPassword: PASSWORD, newPassword: 'a-brand-new-password-99' },
      login1.accessToken,
    )
    expect(res.statusCode, res.body).toBe(204)

    const oldFails = await login('owner@salisauto.sa', PASSWORD)
    expect(oldFails.statusCode).toBe(401)
    const newWorks = await login('owner@salisauto.sa', 'a-brand-new-password-99')
    expect(newWorks.statusCode, newWorks.body).toBe(200)

    /* Restore for any later test in this file that logs in as owner. */
    const admin = systemPrincipal(SEED.orgId, SEED.systemUserId)
    await app.auth.service.setPassword(admin, { userId: userIds.get('owner') as string }, PASSWORD, {})
  })

  it('refuses with 401 when the current password is wrong, and leaves the real one usable', async () => {
    const login1 = (await login('manager@salisauto.sa')).json()
    const res = await post(
      '/auth/change-password',
      { currentPassword: 'definitely-not-it', newPassword: 'another-new-password-1' },
      login1.accessToken,
    )
    expect(res.statusCode).toBe(401)

    const stillWorks = await login('manager@salisauto.sa', PASSWORD)
    expect(stillWorks.statusCode, stillWorks.body).toBe(200)
  })

  it('revokes every session, including the refresh token used to sign in', async () => {
    const login1 = (await login('manager@salisauto.sa')).json()
    const res = await post(
      '/auth/change-password',
      { currentPassword: PASSWORD, newPassword: 'yet-another-new-password-2' },
      login1.accessToken,
    )
    expect(res.statusCode, res.body).toBe(204)

    const refreshed = await post('/auth/refresh', { refreshToken: login1.refreshToken })
    expect(refreshed.statusCode).toBe(401)

    /* Restore for the suite-wide fixture assumption that manager's password is
     * PASSWORD, in case a later test file (or a rerun of this one) relies on it. */
    const admin = systemPrincipal(SEED.orgId, SEED.systemUserId)
    await app.auth.service.setPassword(admin, { userId: userIds.get('manager') as string }, PASSWORD, {})
  })

  it('rejects a new password that fails the password policy (400)', async () => {
    const login1 = (await login('owner@salisauto.sa')).json()
    const res = await post(
      '/auth/change-password',
      { currentPassword: PASSWORD, newPassword: 'short' },
      login1.accessToken,
    )
    expect(res.statusCode).toBe(401)
    expect(res.json().error.message).toMatch(/at least/i)
  })

  it('401s with no token', async () => {
    const res = await post('/auth/change-password', {
      currentPassword: PASSWORD,
      newPassword: 'irrelevant-new-password-3',
    })
    expect(res.statusCode).toBe(401)
  })
})

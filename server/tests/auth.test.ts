import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { api, setupDb, teardownDb, login, EMAILS } from './helpers.js'

beforeAll(setupDb)
afterAll(teardownDb)

describe('auth chain', () => {
  it('logs in and returns {accessToken, refreshToken, user} with embedded role', async () => {
    const res = await api.post('/auth/login').send({ email: EMAILS.owner, password: 'salis1234' })
    expect(res.status).toBe(200)
    expect(typeof res.body.accessToken).toBe('string')
    expect(typeof res.body.refreshToken).toBe('string')
    expect(res.body.user.role).toBe('owner')
    expect(res.body.user.email).toBe(EMAILS.owner)
    // Never leak the password hash.
    expect(res.body.user.passwordHash).toBeUndefined()
  })

  it('rejects a wrong password with a 401 error envelope (no account enumeration)', async () => {
    const res = await api.post('/auth/login').send({ email: EMAILS.owner, password: 'nope' })
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('invalid_credentials')
    // Same message for unknown email.
    const res2 = await api.post('/auth/login').send({ email: 'ghost@salisauto.sa', password: 'x' })
    expect(res2.status).toBe(401)
    expect(res2.body.error.message).toBe(res.body.error.message)
  })

  it('validates the login body (422 with field)', async () => {
    const res = await api.post('/auth/login').send({ email: 'not-an-email', password: '' })
    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe('validation_failed')
    expect(res.body.error.field).toBeDefined()
  })

  it('GET /auth/me returns the signed-in user for a valid token', async () => {
    const token = await login(EMAILS.accountant)
    const res = await api.get('/auth/me').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.user.role).toBe('accountant')
  })

  it('rejects a protected route with no token (401)', async () => {
    const res = await api.get('/auth/me')
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('unauthorized')
  })

  it('refresh rotates tokens; logout revokes the refresh token', async () => {
    const loginRes = await api.post('/auth/login').send({ email: EMAILS.owner, password: 'salis1234' })
    const { refreshToken } = loginRes.body

    const refreshRes = await api.post('/auth/refresh').send({ refreshToken })
    expect(refreshRes.status).toBe(200)
    expect(refreshRes.body.accessToken).toBeTruthy()
    // Old refresh token was rotated → now invalid.
    const reuse = await api.post('/auth/refresh').send({ refreshToken })
    expect(reuse.status).toBe(401)

    // Logout the new one, then it cannot refresh.
    const newRefresh = refreshRes.body.refreshToken
    const logout = await api.post('/auth/logout').send({ refreshToken: newRefresh })
    expect(logout.status).toBe(204)
    const afterLogout = await api.post('/auth/refresh').send({ refreshToken: newRefresh })
    expect(afterLogout.status).toBe(401)
  })
})

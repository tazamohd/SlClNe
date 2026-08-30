import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { api, setupDb, teardownDb, login, EMAILS } from './helpers.js'
import { escapeIlike } from '../src/security.js'

beforeAll(setupDb)
afterAll(teardownDb)

describe('security headers', () => {
  it('sets X-Content-Type-Options on every response', async () => {
    const res = await api.get('/health')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
  })

  it('sets X-Frame-Options to DENY', async () => {
    const res = await api.get('/health')
    expect(res.headers['x-frame-options']).toBe('DENY')
  })

  it('sets Strict-Transport-Security', async () => {
    const res = await api.get('/health')
    expect(res.headers['strict-transport-security']).toContain('max-age=')
  })

  it('sets Content-Security-Policy', async () => {
    const res = await api.get('/health')
    expect(res.headers['content-security-policy']).toContain("default-src 'none'")
  })

  it('sets Referrer-Policy', async () => {
    const res = await api.get('/health')
    expect(res.headers['referrer-policy']).toBe('no-referrer')
  })

  it('does not expose X-Powered-By', async () => {
    const res = await api.get('/health')
    expect(res.headers['x-powered-by']).toBeUndefined()
  })
})

describe('rate limiting on auth endpoints', () => {
  it('returns RateLimit headers on login', async () => {
    const res = await api.post('/api/v1/auth/login').send({ email: EMAILS.owner, password: 'salis1234' })
    expect(res.headers['ratelimit-limit']).toBeDefined()
    expect(res.headers['ratelimit-remaining']).toBeDefined()
  })
})

/** An unknown path answers 401 before it answers 404, and that is the posture
 *  rather than a defect: `app.ts` authenticates everything not named in
 *  `PUBLIC_PATHS` or `isPublicAuthPath`, so an anonymous caller cannot map
 *  which endpoints exist by reading status codes off guessed paths. This used
 *  to be asserted as an anonymous GET expecting 404, which asked the server to
 *  disclose exactly that. The 404 is reachable with a token, and that is where
 *  the handling of an absurd path belongs. */
describe('unknown paths', () => {
  const longPath = '/a'.repeat(300)

  it('does not tell an anonymous caller whether the route exists', async () => {
    const res = await api.get(longPath)
    expect(res.status).toBe(401)
    expect(res.body.error.message).not.toContain('aaa')
  })

  it('answers an authenticated caller 404 without echoing the path back', async () => {
    const token = await login(EMAILS.owner)
    const res = await api.get(longPath).set({ Authorization: `Bearer ${token}` })
    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('not_found')
    /* Bounded, and bounded because the path is never interpolated at all —
     * a reflected path is worth nothing to the caller and is one more piece of
     * attacker-controlled text in a log line and an error body. */
    expect(res.body.error.message.length).toBeLessThan(300)
    expect(res.body.error.message).not.toContain('aaa')
  })
})

describe('escapeIlike', () => {
  it('escapes percent signs', () => {
    expect(escapeIlike('100%')).toBe('100\\%')
  })

  it('escapes underscores', () => {
    expect(escapeIlike('a_b')).toBe('a\\_b')
  })

  it('escapes backslashes', () => {
    expect(escapeIlike('a\\b')).toBe('a\\\\b')
  })

  it('passes through normal text', () => {
    expect(escapeIlike('hello world')).toBe('hello world')
  })
})

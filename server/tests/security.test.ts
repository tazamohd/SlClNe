import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { api, setupDb, teardownDb, EMAILS } from './helpers.js'
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
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
  })

  it('does not expose X-Powered-By', async () => {
    const res = await api.get('/health')
    expect(res.headers['x-powered-by']).toBeUndefined()
  })
})

describe('rate limiting on auth endpoints', () => {
  it('returns RateLimit headers on login', async () => {
    const res = await api.post('/auth/login').send({ email: EMAILS.owner, password: 'salis1234' })
    expect(res.headers['ratelimit-limit']).toBeDefined()
    expect(res.headers['ratelimit-remaining']).toBeDefined()
  })
})

describe('404 path truncation', () => {
  it('truncates excessively long paths in 404 messages', async () => {
    const longPath = '/a'.repeat(300)
    const res = await api.get(longPath)
    expect(res.status).toBe(404)
    expect(res.body.error.message.length).toBeLessThan(300)
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

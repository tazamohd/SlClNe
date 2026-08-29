import { afterEach, describe, expect, it, vi } from 'vitest'
import { authenticate, demoPassword, AuthError } from './auth'
import { ApiError } from './http/client'
import { ROLES } from './rbac'
import type { Role } from './types'

const owner = (ROLES as readonly Role[]).find((r) => r.id === 'owner')!

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

/** A minimal JSON `Response`, matching what `ApiClient` reads (`ok`, `status`,
 *  `json()`). */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

describe('demoPassword', () => {
  it('is the design demo password in mock mode', () => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    expect(demoPassword()).toBe('Demo@1234')
  })

  it("is the backend's seeded password in API mode", () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.test')
    expect(demoPassword()).toBe('salis1234')
  })
})

describe('authenticate — mock mode (no API base URL)', () => {
  it('signs in a demo role with the shared password', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    const session = await authenticate(owner.demo.email.toUpperCase(), 'Demo@1234')
    expect(session.user.role).toBe('owner')
    expect(session.user.email).toBe(owner.demo.email)
    // No server → no tokens.
    expect(session.accessToken).toBeNull()
    expect(session.refreshToken).toBeNull()
  })

  it('rejects a wrong password with an AuthError', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    await expect(authenticate(owner.demo.email, 'nope')).rejects.toBeInstanceOf(AuthError)
  })

  it('rejects an unknown email with an AuthError', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    await expect(authenticate('stranger@example.com', 'Demo@1234')).rejects.toBeInstanceOf(AuthError)
  })
})

describe('authenticate — API mode (base URL set)', () => {
  it('posts to /auth/login and returns the server session', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.test')
    const serverUser = {
      id: 'u1',
      email: 'owner@salisauto.test',
      name: 'Owner',
      ar: 'المالك',
      role: 'owner',
      scope: 'all',
      orgId: 'org1',
      branchId: null,
      roleLabel: 'Owner',
      approvalLimit: null,
      destination: '/dashboard',
    }
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toBe('https://api.test/auth/login')
      return jsonResponse({ accessToken: 'a.b.c', refreshToken: 'r-tok', user: serverUser })
    })
    vi.stubGlobal('fetch', fetchMock)

    const session = await authenticate('owner@salisauto.test', 'salis1234')
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(session.accessToken).toBe('a.b.c')
    expect(session.refreshToken).toBe('r-tok')
    expect(session.user).toEqual(serverUser)
  })

  it('surfaces a 401 as an ApiError', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.test')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({ error: { code: 'invalid_credentials', message: 'Email or password is incorrect' } }, 401),
      ),
    )
    await expect(authenticate('owner@salisauto.test', 'wrong')).rejects.toBeInstanceOf(ApiError)
  })
})

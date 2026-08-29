/** The auth seam — the login half of the mock/HTTP switch.
 *
 *  Symmetric with `createRepository` in `./repository`: when
 *  `VITE_API_BASE_URL` is set, `authenticate` posts to the real `/auth/login`
 *  and persists the returned tokens; when it is not (the deployed Pages demo,
 *  `npm run dev`, the test suite), it validates against the design bundle's
 *  demo roles and synthesizes a tokenless session. Every screen already reads
 *  role/permissions through `SessionProvider`, so nothing downstream knows
 *  which path ran.
 *
 *  The HTTP layer is imported dynamically inside the API branch only, so the
 *  mock build never pulls the transport (mirroring `createRepository`). */
import { ROLES } from './rbac'
import { destinationFor } from './rbac'
import type { Role } from './types'
import type { AuthUser, Session } from './http/auth'
import { readStored, writeStored, clearStored, STORAGE_KEYS } from '../lib/storage'

/** The configured API base URL, or undefined for the mock path. The single
 *  source of truth for "are we live?", shared with `createRepository`. */
export function apiBaseUrl(): string | undefined {
  return import.meta.env?.VITE_API_BASE_URL || undefined
}

/** Sign-in failure that carries the same human message the API's `ApiError`
 *  does, so the login screen shows one toast without caring which path threw. */
export class AuthError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

/** The demo password the login screen prefills. Live mode uses the backend's
 *  seeded password; mock mode uses the design bundle's shared demo password. */
export function demoPassword(): string {
  return apiBaseUrl() ? 'salis1234' : 'Demo@1234'
}

/** The password the MOCK path validates against — always the design-bundle
 *  value, since mock mode is exactly "no API base URL". */
const MOCK_DEMO_PASSWORD = 'Demo@1234'

/** Authenticate, live or mock, and persist the resulting session. Throws
 *  `ApiError` (live, 401) or `AuthError` (mock) on bad credentials. */
export async function authenticate(email: string, password: string): Promise<Session> {
  const base = apiBaseUrl()
  const normalizedEmail = email.trim().toLowerCase()

  if (base) {
    const { AuthApi } = await import('./http/auth')
    const session = await new AuthApi({ baseUrl: base }).login(normalizedEmail, password)
    persistSession(session)
    return session
  }

  const role = (ROLES as readonly Role[]).find((r) => r.demo.email === normalizedEmail)
  if (!role || password !== MOCK_DEMO_PASSWORD) {
    throw new AuthError('invalid_credentials', 'Email or password is incorrect')
  }
  const session: Session = { accessToken: null, refreshToken: null, user: mockUser(role) }
  persistSession(session)
  return session
}

/** Exchange the stored refresh token for a new access token. Wired into the
 *  API client as its `onAuthFailure` hook: on a 401 it returns a fresh token
 *  to replay the request, or null (and clears the session) when refresh is
 *  impossible. Mock mode has no tokens, so it always returns null. */
export async function refreshSession(): Promise<string | null> {
  const base = apiBaseUrl()
  if (!base) return null
  const refreshToken = readStored(STORAGE_KEYS.refresh)
  if (!refreshToken) {
    clearSession()
    return null
  }
  try {
    const { AuthApi } = await import('./http/auth')
    const session = await new AuthApi({ baseUrl: base }).refresh(refreshToken)
    persistSession(session)
    return session.accessToken
  } catch {
    clearSession()
    return null
  }
}

/** End the session: best-effort remote logout (revokes the refresh token),
 *  then clear local storage regardless of whether the network call succeeded. */
export async function endSession(): Promise<void> {
  const base = apiBaseUrl()
  const refreshToken = readStored(STORAGE_KEYS.refresh)
  if (base && refreshToken) {
    try {
      const { AuthApi } = await import('./http/auth')
      await new AuthApi({ baseUrl: base }).logout(refreshToken)
    } catch {
      /* the token still gets cleared locally below */
    }
  }
  clearSession()
}

/** The signed-in user restored from a prior session, or null. */
export function storedUser(): AuthUser | null {
  const raw = readStored(STORAGE_KEYS.user)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

function persistSession(session: Session): void {
  if (session.accessToken) writeStored(STORAGE_KEYS.token, session.accessToken)
  else clearStored(STORAGE_KEYS.token)
  if (session.refreshToken) writeStored(STORAGE_KEYS.refresh, session.refreshToken)
  else clearStored(STORAGE_KEYS.refresh)
  writeStored(STORAGE_KEYS.user, JSON.stringify(session.user))
  // Keep the legacy role key in sync so mock init and RoleSelection still work.
  writeStored(STORAGE_KEYS.role, session.user.role)
}

function clearSession(): void {
  clearStored(STORAGE_KEYS.token)
  clearStored(STORAGE_KEYS.refresh)
  clearStored(STORAGE_KEYS.user)
  clearStored(STORAGE_KEYS.role)
}

/** Build a session user from a design-bundle demo role — the mock counterpart
 *  of the server's `publicUser`. Tokens are null; org/branch are demo scopes. */
function mockUser(role: Role): AuthUser {
  return {
    id: `demo-${role.id}`,
    email: role.demo.email,
    name: role.demo.name,
    ar: role.demo.ar,
    role: role.id,
    scope: role.scope,
    orgId: 'demo-org',
    branchId: 'demo-branch',
    roleLabel: role.label,
    approvalLimit: role.limit,
    destination: destinationFor(role.id),
  }
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  DEFAULT_ROLE,
  can,
  canApprove,
  canScreen,
  fieldHidden,
  isRoleId,
  navFor,
  roleMeta,
} from '@/data/rbac'
import type { Action, NavGroup, Role, RoleId } from '@/data/types'
import { API_URL, setAccessTokenProvider } from '@/data/repository'
import { usePreferences } from './PreferencesProvider'
import { clearStored, readStored, writeStored, STORAGE_KEYS } from '@/lib/storage'
import {
  activeDemoAccount,
  registerDemoAccount,
  setActiveDemoAccount,
  REGISTERED_ROLE,
  type DemoAccount,
} from '@/data/demo-accounts'

/** Who is signed in, and what they may do.
 *
 *  Two modes, chosen by whether `VITE_API_URL` is set, because the app has to
 *  keep working with no server at all:
 *
 *  - **Live.** `POST /auth/login` returns an access token and a refresh token.
 *    The role, the name and the entitlements come from `GET /auth/me`, so they
 *    are the server's answer and not a guess. The access token is refreshed
 *    before it expires and the session ends when the server says it has.
 *  - **Demo.** The design's role-picker: a role id in `localStorage`, no
 *    network, every screen renders. This is what every build does today.
 *
 *  **This provider is not a security boundary and must never be read as one.**
 *  `can`, `canScreen` and `canApprove` decide what a screen *shows*. The API
 *  re-checks every request against the same matrix, and a caller who edits the
 *  role in `localStorage` gets a differently-shaped sidebar and exactly the
 *  same 403s. In live mode the role is not even writable: it comes from a
 *  signed token the client cannot mint.
 *
 *  **Where the tokens live.** The access token is held in memory only — it is
 *  never written to storage, so it does not survive a tab close and cannot be
 *  read out of `localStorage` later. The refresh token *is* persisted, because
 *  "stay signed in" is not otherwise implementable in a SPA, and that is a
 *  real exposure to XSS. Two things bound it: the token names a session row the
 *  server can revoke, and presenting a rotated-out token kills the whole family
 *  and is audited. Moving it to an httpOnly cookie is the durable fix and is
 *  recorded as outstanding rather than implied by silence.
 */

/** Persisted refresh token. Deliberately not added to `STORAGE_KEYS`, which
 *  belongs to another agent's module. */
const REFRESH_KEY = 'salis-refresh'

/** Demo mode's *account* role, as opposed to the role it is currently acting
 *  as. They differ only for the all-access `test` identity, which is the one
 *  account allowed to walk the product as somebody else. Persisted separately
 *  from `STORAGE_KEYS.role` so a reload does not lose the right to switch
 *  back. */
const BASE_ROLE_KEY = 'salis-base-role'

/** The role that may act as another one. Mirrors the server's
 *  `SWITCHABLE_BASE_ROLE`; `POST /auth/switch-role` refuses for anyone else, so
 *  this only decides whether the control is offered, never whether it works. */
const SWITCHABLE_BASE_ROLE: RoleId = 'test'

/** How long before expiry the access token is renewed. Sixty seconds is enough
 *  for a slow network and short enough that a clock skew does not strand a
 *  session on an expired token. */
const RENEW_MARGIN_SECONDS = 60

export type SessionStatus = 'loading' | 'anonymous' | 'authenticated' | 'expired'

/** What an attempt to exchange the stored refresh token produced.
 *  `offline` is deliberately not `expired`: they need different behaviour and
 *  collapsing them signs people out on a flaky connection. */
type RenewOutcome = 'ok' | 'none' | 'offline' | 'expired'

export type SignInResult = { ok: true; role: RoleId } | { ok: false; message: string }

export interface SessionUser {
  id: string
  email: string
  name: string
  /** The role in force: the acting role when the account is acting as one. */
  role: RoleId
  /** The role the account itself holds. Equal to `role` for every account that
   *  has never switched. */
  baseRole?: RoleId
  orgId: string
  branchId: string | null
}

export type RegisterInput = {
  name: string
  email: string
  password: string
  phone?: string
  organizationName?: string
}

export type RegisterResult =
  | { ok: true; role: RoleId }
  | { ok: false; message: string; field?: string }

export type SwitchRoleResult = { ok: true; role: RoleId } | { ok: false; message: string }

export interface SessionDevice {
  id: string
  current: boolean
  userAgent: string | null
  ip: string | null
  createdAt: string
  expiresAt: string
  lastRotatedAt: string
}

interface SessionValue {
  role: RoleId
  roleMeta: Role
  /** Display name for the signed-in user, localized. */
  userName: string
  /** Localized role label, for the sidebar badge. */
  roleLabel: string
  signedIn: boolean
  /** `loading` only ever occurs in live mode, while the stored refresh token is
   *  being exchanged. Demo mode is synchronous. */
  status: SessionStatus
  /** True once a session that existed has ended — expired or revoked. Distinct
   *  from never having signed in, because the two need different screens. */
  expired: boolean
  /** Null in demo mode: there is no server-side user behind a picked role. */
  user: SessionUser | null
  /** True when this session came from the API rather than the role picker. */
  live: boolean
  /** Demo mode's sign-in. `account` is passed when the identity came from the
   *  registration form rather than a role card, so the shell shows the person's
   *  own name instead of the role's demo persona. */
  signIn: (role: RoleId, account?: DemoAccount) => void
  /** The account's own role, as opposed to the one it is acting as. */
  baseRole: RoleId
  /** May this account act as another role? True only for the `test` account.
   *  The server refuses everyone else, so this only hides a control. */
  canSwitchRole: boolean
  /** Act as `next`. Live mode asks the server, which re-checks and audits the
   *  switch; demo mode rewrites the stored role. */
  switchRole: (next: RoleId) => Promise<SwitchRoleResult>
  /** Create an account from scratch and sign in as it. */
  register: (input: RegisterInput) => Promise<RegisterResult>
  /** Live mode. The role in the success case comes from the server's response,
   *  so the caller can route on it without having guessed it from the form. */
  signInWithPassword: (email: string, password: string) => Promise<SignInResult>
  signOut: () => void
  /** Called by anything that receives a 401 from the API, so one rejected
   *  request ends the session rather than every subsequent one failing. */
  reportSessionInvalid: () => void
  /** The signed-in user's devices. Empty in demo mode. */
  listDevices: () => Promise<SessionDevice[]>
  revokeDevice: (id: string) => Promise<boolean>
  revokeAllDevices: () => Promise<number>
  can: (module: string, action: Action) => boolean
  canScreen: (screen: string) => boolean
  canApprove: (amountSar?: number) => boolean
  fieldHidden: (field: string) => boolean
  /** Sidebar filtered to this role. */
  nav: NavGroup[]
}

const SessionContext = createContext<SessionValue | null>(null)

const LIVE = API_URL !== ''

function authUrl(path: string): string {
  return `${API_URL.replace(/\/$/, '')}/auth${path}`
}

interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: SessionUser
}

async function authFetch(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<{ ok: boolean; status: number; body: unknown }> {
  const headers = new Headers(init.headers)
  headers.set('accept', 'application/json')
  if (init.body) headers.set('content-type', 'application/json')
  if (init.token) headers.set('authorization', `Bearer ${init.token}`)
  let response: Response
  try {
    response = await fetch(authUrl(path), { ...init, headers, credentials: 'include' })
  } catch {
    return { ok: false, status: 0, body: null }
  }
  const text = await response.text()
  return {
    ok: response.ok,
    status: response.status,
    body: text ? (JSON.parse(text) as unknown) : null,
  }
}

function errorMessage(body: unknown, fallback: string): string {
  const envelope = body as { error?: { message?: string } } | null
  return envelope?.error?.message ?? fallback
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const { rtl } = usePreferences()

  /* Demo mode's role, and live mode's fallback while nobody is signed in. */
  const [demoRole, setDemoRole] = useState<RoleId>(() => {
    const stored = readStored(STORAGE_KEYS.role)
    return isRoleId(stored) ? stored : DEFAULT_ROLE
  })
  const [demoSignedIn, setDemoSignedIn] = useState(() => isRoleId(readStored(STORAGE_KEYS.role)))

  /* The account's own role in demo mode. Absent for every session that predates
   * role switching, and for one that signed in through a role card, where the
   * account *is* the role — so it falls back to the acting role. */
  const [demoBaseRole, setDemoBaseRole] = useState<RoleId>(() => {
    const stored = readStored(BASE_ROLE_KEY)
    if (isRoleId(stored)) return stored
    const acting = readStored(STORAGE_KEYS.role)
    return isRoleId(acting) ? acting : DEFAULT_ROLE
  })

  /* A registered identity, when this demo session signed up rather than
   * picking a card. It supplies the name; the role still comes from the
   * matrix. */
  const [demoAccount, setDemoAccount] = useState<DemoAccount | null>(() => activeDemoAccount())

  const [status, setStatus] = useState<SessionStatus>(LIVE ? 'loading' : 'anonymous')
  const [user, setUser] = useState<SessionUser | null>(null)

  /* In memory only, and in a ref rather than state: the repository reads it on
   * every request, and a re-render between a refresh and the next call would
   * otherwise send the stale one. */
  const accessTokenRef = useRef<string | null>(null)
  const renewTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setAccessTokenProvider(() => accessTokenRef.current)
    return () => setAccessTokenProvider(() => null)
  }, [])

  const clearSession = useCallback((next: SessionStatus) => {
    accessTokenRef.current = null
    if (renewTimer.current) clearTimeout(renewTimer.current)
    renewTimer.current = null
    clearStored(REFRESH_KEY)
    setUser(null)
    setStatus(next)
  }, [])

  /* `adopt` schedules the next `renew`, and `renew` calls `adopt`. The timer
   * reaches the current `renew` through a ref, so neither function has to name
   * the other in a dependency array and neither can go stale. */
  const renewRef = useRef<() => Promise<RenewOutcome>>(async () => 'none')

  /** Applies a token pair and schedules the next renewal. */
  const adopt = useCallback((tokens: TokenResponse) => {
    accessTokenRef.current = tokens.accessToken
    writeStored(REFRESH_KEY, tokens.refreshToken)
    setUser(tokens.user)
    setStatus('authenticated')
    if (renewTimer.current) clearTimeout(renewTimer.current)
    const delay = Math.max(5, tokens.expiresIn - RENEW_MARGIN_SECONDS) * 1000
    renewTimer.current = setTimeout(() => void renewRef.current(), delay)
  }, [])

  /** Exchanges the stored refresh token. Rotating, so the stored value is
   *  replaced every time — a refresh token is spent by using it. */
  const renew = useCallback(async (): Promise<RenewOutcome> => {
    const refreshToken = readStored(REFRESH_KEY)
    if (!refreshToken) return 'none'
    const result = await authFetch('/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
    if (result.status === 0) {
      /* A network failure is not a revocation. Ending the session on one would
       * sign people out every time a train goes into a tunnel. The stored token
       * is left alone so the next attempt can still use it. */
      return 'offline'
    }
    if (!result.ok) {
      clearSession('expired')
      return 'expired'
    }
    adopt(result.body as TokenResponse)
    return 'ok'
  }, [adopt, clearSession])

  useEffect(() => {
    renewRef.current = renew
  }, [renew])

  useEffect(() => {
    if (!LIVE) return
    let cancelled = false
    void (async () => {
      const outcome = await renew()
      if (cancelled) return
      /* `expired` has already set its own status. `none` means nobody was
       * signed in; `offline` means we could not tell, and the honest state for
       * "we could not tell" is signed out rather than a spinner that never
       * resolves. */
      if (outcome === 'none' || outcome === 'offline') setStatus('anonymous')
    })()
    return () => {
      cancelled = true
      if (renewTimer.current) clearTimeout(renewTimer.current)
    }
  }, [renew])

  const signIn = useCallback((next: RoleId, account?: DemoAccount) => {
    /* Demo mode only. In live mode the role comes from a signed token and this
     * is deliberately inert — a role picker that silently overrode a real
     * session would be a privilege-escalation button. */
    if (LIVE) return
    writeStored(STORAGE_KEYS.role, next)
    /* Signing in through a role card makes the account *be* that role: it is
     * not an all-access account acting as one, so the right to switch has to be
     * re-earned by signing in as `test` rather than left over from a previous
     * session. */
    writeStored(BASE_ROLE_KEY, next)
    setActiveDemoAccount(account ?? null)
    setDemoAccount(account ?? null)
    setDemoRole(next)
    setDemoBaseRole(next)
    setDemoSignedIn(true)
  }, [])

  const signInWithPassword = useCallback(
    async (email: string, password: string): Promise<SignInResult> => {
      if (!LIVE) {
        return { ok: false, message: 'This build has no API configured. Pick a demo role instead.' }
      }
      const result = await authFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      if (!result.ok) {
        return {
          ok: false,
          message:
            result.status === 0
              ? 'The server could not be reached.'
              : errorMessage(result.body, 'That email or password is not correct.'),
        }
      }
      const tokens = result.body as TokenResponse
      adopt(tokens)
      /* `isRoleId` guards the boundary: a role the client does not know is not
       * silently treated as one it does. `roleMeta` fails closed on it either
       * way, and the API decides regardless — this only picks a landing page. */
      return { ok: true, role: isRoleId(tokens.user?.role) ? tokens.user.role : DEFAULT_ROLE }
    },
    [adopt],
  )

  const signOut = useCallback(() => {
    if (LIVE) {
      const refreshToken = readStored(REFRESH_KEY)
      if (refreshToken) {
        /* Fire and forget: the local session ends whether or not the server is
         * reachable, and the token is spent server-side when it is. */
        void authFetch('/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) })
      }
      clearSession('anonymous')
      return
    }
    clearStored(STORAGE_KEYS.role)
    clearStored(BASE_ROLE_KEY)
    setActiveDemoAccount(null)
    setDemoAccount(null)
    setDemoRole(DEFAULT_ROLE)
    setDemoBaseRole(DEFAULT_ROLE)
    setDemoSignedIn(false)
  }, [clearSession])

  const reportSessionInvalid = useCallback(() => {
    if (!LIVE) return
    clearSession('expired')
  }, [clearSession])

  const switchRole = useCallback(
    async (next: RoleId): Promise<SwitchRoleResult> => {
      if (!isRoleId(next)) return { ok: false, message: 'That is not a role this system defines.' }

      if (!LIVE) {
        if (demoBaseRole !== SWITCHABLE_BASE_ROLE) {
          return { ok: false, message: 'This account may not act as another role.' }
        }
        /* Only the acting role moves. The base role stays `test`, which is what
         * lets the tester come back from a role that could not have got here. */
        writeStored(STORAGE_KEYS.role, next)
        setDemoRole(next)
        return { ok: true, role: next }
      }

      if (!accessTokenRef.current) return { ok: false, message: 'You are not signed in.' }
      const result = await authFetch('/switch-role', {
        method: 'POST',
        body: JSON.stringify({ role: next }),
        token: accessTokenRef.current,
      })
      if (result.status === 401) reportSessionInvalid()
      if (!result.ok) {
        return {
          ok: false,
          message:
            result.status === 0
              ? 'The server could not be reached.'
              : errorMessage(result.body, 'That role switch was refused.'),
        }
      }
      /* The server answers with a fresh token pair carrying the acting role —
       * adopting it is what stops the app from spending the rest of the access
       * token's life claiming the previous one. */
      const tokens = result.body as TokenResponse
      adopt(tokens)
      return { ok: true, role: isRoleId(tokens.user?.role) ? tokens.user.role : next }
    },
    [adopt, demoBaseRole, reportSessionInvalid],
  )

  const register = useCallback(
    async (input: RegisterInput): Promise<RegisterResult> => {
      if (!LIVE) {
        const outcome = registerDemoAccount({
          name: input.name,
          email: input.email,
          organizationName: input.organizationName,
        })
        if (!outcome.ok) return { ok: false, message: outcome.message, field: outcome.field }
        /* Signed in immediately, as the live path does: an account created by a
         * flow that then asks you to sign in separately is two flows. */
        writeStored(STORAGE_KEYS.role, outcome.account.role)
        writeStored(BASE_ROLE_KEY, outcome.account.role)
        setActiveDemoAccount(outcome.account)
        setDemoAccount(outcome.account)
        setDemoRole(outcome.account.role)
        setDemoBaseRole(outcome.account.role)
        setDemoSignedIn(true)
        return { ok: true, role: outcome.account.role }
      }

      const result = await authFetch('/register', {
        method: 'POST',
        body: JSON.stringify(input),
      })
      if (!result.ok) {
        const body = result.body as { error?: { message?: string; field?: string } } | null
        return {
          ok: false,
          message:
            result.status === 0
              ? 'The server could not be reached.'
              : errorMessage(result.body, 'That registration was refused.'),
          field: body?.error?.field,
        }
      }
      const tokens = result.body as TokenResponse
      adopt(tokens)
      return { ok: true, role: isRoleId(tokens.user?.role) ? tokens.user.role : REGISTERED_ROLE }
    },
    [adopt],
  )

  const listDevices = useCallback(async (): Promise<SessionDevice[]> => {
    if (!LIVE || !accessTokenRef.current) return []
    const result = await authFetch('/sessions', { token: accessTokenRef.current })
    /* A 401 here is the server saying this session is over — most likely
     * because an administrator revoked it. One rejected request ends the
     * session rather than every subsequent one failing on its own. */
    if (result.status === 401) reportSessionInvalid()
    if (!result.ok) return []
    return ((result.body as { sessions?: SessionDevice[] }).sessions ?? []).slice()
  }, [reportSessionInvalid])

  const revokeDevice = useCallback(
    async (id: string): Promise<boolean> => {
      if (!LIVE || !accessTokenRef.current) return false
      const result = await authFetch(`/sessions/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        token: accessTokenRef.current,
      })
      if (result.status === 401) reportSessionInvalid()
      return result.ok
    },
    [reportSessionInvalid],
  )

  const revokeAllDevices = useCallback(async (): Promise<number> => {
    if (!LIVE || !accessTokenRef.current) return 0
    const result = await authFetch('/sessions/revoke-all', {
      method: 'POST',
      body: JSON.stringify({}),
      token: accessTokenRef.current,
    })
    if (!result.ok) return 0
    const revoked = (result.body as { revoked?: number }).revoked ?? 0
    clearSession('anonymous')
    return revoked
  }, [clearSession])

  const role: RoleId = LIVE ? (user?.role ?? DEFAULT_ROLE) : demoRole
  const baseRole: RoleId = LIVE
    ? (isRoleId(user?.baseRole) ? user.baseRole : (user?.role ?? DEFAULT_ROLE))
    : demoBaseRole
  const signedIn = LIVE ? status === 'authenticated' : demoSignedIn

  const value = useMemo<SessionValue>(() => {
    const meta = roleMeta(role)
    return {
      role,
      roleMeta: meta,
      userName: LIVE
        ? (user?.name ?? meta.label)
        : /* A registered identity keeps its own name while acting under any
           * role; a role card shows the role's demo persona. */
          (demoAccount?.name ?? (rtl ? meta.demo.ar : meta.demo.name)),
      roleLabel: rtl ? meta.ar : meta.label,
      signedIn,
      status: LIVE ? status : demoSignedIn ? 'authenticated' : 'anonymous',
      expired: status === 'expired',
      user,
      live: LIVE,
      signIn,
      baseRole,
      canSwitchRole: baseRole === SWITCHABLE_BASE_ROLE,
      switchRole,
      register,
      signInWithPassword,
      signOut,
      reportSessionInvalid,
      listDevices,
      revokeDevice,
      revokeAllDevices,
      can: (module, action) => can(module, action, role),
      canScreen: (screen) => canScreen(screen, role),
      canApprove: (amountSar) => canApprove(role, amountSar),
      fieldHidden: (field) => fieldHidden(field, role),
      nav: navFor(role),
    }
  }, [
    role,
    baseRole,
    demoAccount,
    switchRole,
    register,
    rtl,
    signedIn,
    status,
    demoSignedIn,
    user,
    signIn,
    signInWithPassword,
    signOut,
    reportSessionInvalid,
    listDevices,
    revokeDevice,
    revokeAllDevices,
  ])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext)
  if (!value) throw new Error('useSession must be used within a SessionProvider')
  return value
}

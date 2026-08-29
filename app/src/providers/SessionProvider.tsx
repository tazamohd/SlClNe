import {
  createContext,
  useCallback,
  useContext,
  useMemo,
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
import type { AuthUser, Session } from '@/data/http/auth'
import { storedUser, endSession } from '@/data/auth'
import { usePreferences } from './PreferencesProvider'
import { readStored, STORAGE_KEYS } from '@/lib/storage'

/** Who is signed in, and what they may do.
 *
 *  The identity comes from the session `authenticate()` persisted — a real user
 *  (JWT-backed) when `VITE_API_BASE_URL` is set, or a design-bundle demo user
 *  otherwise. Either way it lands here as an `AuthUser`; nothing outside this
 *  file changes, because every screen asks questions (`can`, `canScreen`)
 *  rather than reading the role directly. A stored role key (legacy / the
 *  RoleSelection flow) still counts as signed-in for the mock demo. */

interface SessionValue {
  role: RoleId
  roleMeta: Role
  /** The signed-in user, or null before sign-in. */
  user: AuthUser | null
  /** Display name for the signed-in user, localized. */
  userName: string
  /** Localized role label, for the sidebar badge. */
  roleLabel: string
  signedIn: boolean
  signIn: (session: Session) => void
  signOut: () => void
  can: (module: string, action: Action) => boolean
  canScreen: (screen: string) => boolean
  canApprove: (amountSar?: number) => boolean
  fieldHidden: (field: string) => boolean
  /** Sidebar filtered to this role. */
  nav: NavGroup[]
}

const SessionContext = createContext<SessionValue | null>(null)

/** Role a restored session resolves to: the stored user's role, else the
 *  legacy role key (mock/RoleSelection), else the default. */
function roleFrom(user: AuthUser | null): RoleId {
  if (user && isRoleId(user.role)) return user.role
  const stored = readStored(STORAGE_KEYS.role)
  return isRoleId(stored) ? stored : DEFAULT_ROLE
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const { rtl } = usePreferences()
  const [user, setUser] = useState<AuthUser | null>(() => storedUser())
  const [role, setRole] = useState<RoleId>(() => roleFrom(storedUser()))
  const [signedIn, setSignedIn] = useState(
    () => !!storedUser() || isRoleId(readStored(STORAGE_KEYS.role)),
  )

  // `authenticate()` has already persisted the session before this runs; the
  // provider only reflects it into React state.
  const signIn = useCallback((session: Session) => {
    setUser(session.user)
    setRole(isRoleId(session.user.role) ? session.user.role : DEFAULT_ROLE)
    setSignedIn(true)
  }, [])

  const signOut = useCallback(() => {
    void endSession() // best-effort remote logout; clears local storage
    setUser(null)
    setRole(DEFAULT_ROLE)
    setSignedIn(false)
  }, [])

  const value = useMemo<SessionValue>(() => {
    const meta = roleMeta(role)
    return {
      role,
      roleMeta: meta,
      user,
      userName: rtl ? (user?.ar ?? meta.demo.ar) : (user?.name ?? meta.demo.name),
      roleLabel: rtl ? meta.ar : meta.label,
      signedIn,
      signIn,
      signOut,
      can: (module, action) => can(module, action, role),
      canScreen: (screen) => canScreen(screen, role),
      canApprove: (amountSar) => canApprove(role, amountSar),
      fieldHidden: (field) => fieldHidden(field, role),
      nav: navFor(role),
    }
  }, [role, rtl, signedIn, user, signIn, signOut])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext)
  if (!value) throw new Error('useSession must be used within a SessionProvider')
  return value
}

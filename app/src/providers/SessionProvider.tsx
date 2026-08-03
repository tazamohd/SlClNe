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
import { usePreferences } from './PreferencesProvider'
import { clearStored, readStored, writeStored, STORAGE_KEYS } from '@/lib/storage'

/** Who is signed in, and what they may do.
 *
 *  Today the role comes from localStorage — the design's demo-login mechanism.
 *  In production this provider reads a JWT carrying `role` and `tenant_id`
 *  claims; nothing outside this file needs to change, because every screen asks
 *  questions (`can`, `canScreen`) rather than reading the role directly. */

interface SessionValue {
  role: RoleId
  roleMeta: Role
  /** Display name for the signed-in user, localized. */
  userName: string
  /** Localized role label, for the sidebar badge. */
  roleLabel: string
  signedIn: boolean
  signIn: (role: RoleId) => void
  signOut: () => void
  can: (module: string, action: Action) => boolean
  canScreen: (screen: string) => boolean
  canApprove: (amountSar?: number) => boolean
  fieldHidden: (field: string) => boolean
  /** Sidebar filtered to this role. */
  nav: NavGroup[]
}

const SessionContext = createContext<SessionValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const { rtl } = usePreferences()
  const [role, setRole] = useState<RoleId>(() => {
    const stored = readStored(STORAGE_KEYS.role)
    return isRoleId(stored) ? stored : DEFAULT_ROLE
  })
  const [signedIn, setSignedIn] = useState(() => isRoleId(readStored(STORAGE_KEYS.role)))

  const signIn = useCallback((next: RoleId) => {
    writeStored(STORAGE_KEYS.role, next)
    setRole(next)
    setSignedIn(true)
  }, [])

  const signOut = useCallback(() => {
    clearStored(STORAGE_KEYS.role)
    setRole(DEFAULT_ROLE)
    setSignedIn(false)
  }, [])

  const value = useMemo<SessionValue>(() => {
    const meta = roleMeta(role)
    return {
      role,
      roleMeta: meta,
      userName: rtl ? meta.demo.ar : meta.demo.name,
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
  }, [role, rtl, signedIn, signIn, signOut])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext)
  if (!value) throw new Error('useSession must be used within a SessionProvider')
  return value
}

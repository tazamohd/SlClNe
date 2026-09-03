import { createContext, useContext } from 'react'

/** Which chrome a screen is rendering inside.
 *
 *  A page header asks this before drawing breadcrumbs: they make sense under
 *  the operational sidebar, where the nav tree gives every route a place, and
 *  not inside a portal, the customer app or the auth chain, which have no tree
 *  to crumb from. `null` — no provider — reads as "bare", the honest default
 *  for a screen mounted outside any shell (tests, print views). */
export type ShellKind = 'app' | 'portal' | 'customer-app' | 'public' | 'auth' | 'bare'

export interface ShellValue {
  kind: ShellKind
}

export const ShellContext = createContext<ShellValue | null>(null)

export function useShell(): ShellValue {
  return useContext(ShellContext) ?? { kind: 'bare' }
}

import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useSession } from '@/providers/SessionProvider'
import { AppShell } from '@/components/shell/AppShell'
import { CustomerAppShell } from '@/components/shell/CustomerAppShell'

/** Guards an operational route.
 *
 *  Two separate checks, deliberately: not signed in → Login (you may well be
 *  allowed, you just haven't proved who you are); signed in but the role lacks
 *  the module → Unauthorized (a redirect to Login would be a lie).
 *
 *  This is convenience, not security. The API re-checks every request — a
 *  guard that only lives in the client is a guard an attacker skips. */
export function RequireAccess({
  screen,
  children,
  shell = 'app',
}: {
  /** Screen name as used in SCREEN_MODULE, e.g. "JobCards". */
  screen: string
  children: ReactNode
  /** Which chrome to render inside. The customer app is a separate surface
   *  with its own 430px frame and bottom tab bar, not the operational shell. */
  shell?: 'app' | 'customer-app'
}) {
  const { signedIn, canScreen } = useSession()
  const location = useLocation()

  if (!signedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  if (!canScreen(screen)) {
    return <Navigate to="/unauthorized" replace />
  }
  const Shell = shell === 'customer-app' ? CustomerAppShell : AppShell
  return <Shell>{children}</Shell>
}

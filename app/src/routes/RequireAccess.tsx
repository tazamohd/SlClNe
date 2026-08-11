import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useSession } from '@/providers/SessionProvider'
import { AppShell } from '@/components/shell/AppShell'
import { CustomerAppShell } from '@/components/shell/CustomerAppShell'

/** Guards an operational route.
 *
 *  Four outcomes, and the differences between them are the point:
 *
 *  - **Still deciding.** In live mode the stored refresh token is being
 *    exchanged. Rendering the login screen here would flash it at somebody who
 *    turns out to be signed in, so the route waits instead.
 *  - **Session ended.** A session that existed has expired or been revoked →
 *    `/session-expired`, which says so. Sending them to `/login` would read as
 *    "you were never signed in", and the difference matters when the cause was
 *    an administrator revoking the session.
 *  - **Never signed in** → `/login`.
 *  - **Signed in, wrong role** → `/unauthorized`. A redirect to `/login` would
 *    be a lie: they proved who they are, and the answer is still no.
 *
 *  **This is convenience, not security.** Every one of these decisions is made
 *  again on the server, from the same matrix, on every request. Editing the
 *  role in `localStorage` reshapes the sidebar and changes nothing the API will
 *  do — and in live mode the role comes from a signed token, so it is not
 *  editable at all. A guard that only lives in the client is a guard an
 *  attacker skips by not using the client.
 */
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
  const { signedIn, canScreen, status, expired } = useSession()
  const location = useLocation()

  if (status === 'loading') {
    /* Deliberately nothing rather than a spinner: this resolves in one request
     * and a flash of loading chrome is worse than a frame of blank. */
    return null
  }
  if (expired) {
    return <Navigate to="/session-expired" state={{ from: location.pathname }} replace />
  }
  if (!signedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  if (!canScreen(screen)) {
    return <Navigate to="/unauthorized" replace />
  }
  const Shell = shell === 'customer-app' ? CustomerAppShell : AppShell
  return <Shell>{children}</Shell>
}

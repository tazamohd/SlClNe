import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useSession } from '@/providers/SessionProvider'
import { AppShell } from '@/components/shell/AppShell'
import { CustomerAppShell } from '@/components/shell/CustomerAppShell'
import type { Shell } from '@/screens/registry'

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
  shell,
}: {
  /** Screen name as used in SCREEN_MODULE, e.g. "JobCards". */
  screen: string
  children: ReactNode
  /** Which chrome to render inside.
   *
   *  Three meanings, and they are deliberately distinct: omitted is the
   *  operational shell, `null` is no chrome at all, and a component is whatever
   *  the owning domain supplies. The last one exists because `PortalShell`,
   *  `PublicShell` and `KioskShell` are not built yet — a string union naming
   *  them would be a file every portal and website agent had to edit at the
   *  same moment to add its own case. The customer app keeps its string for the
   *  same reason it always had one: it is a separate surface with its own 430px
   *  frame and bottom tab bar, not the operational shell. */
  shell?: 'app' | 'customer-app' | Shell | null
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
  const Chrome = resolveShell(shell)
  return Chrome ? <Chrome>{children}</Chrome> : <>{children}</>
}

function resolveShell(shell: 'app' | 'customer-app' | Shell | null | undefined): Shell | null {
  if (shell === undefined || shell === 'app') return AppShell
  if (shell === 'customer-app') return CustomerAppShell
  return shell
}

import { Navigate, Route, Routes } from 'react-router-dom'
import { SCREENS } from '@/data/generated/screens'
import { RequireAccess } from './RequireAccess'
import { PendingScreen } from '@/screens/PendingScreen'

import { Splash } from '@/screens/auth/Splash'
import { Welcome } from '@/screens/auth/Welcome'
import { LanguageSelection } from '@/screens/auth/LanguageSelection'
import { RegionSelection } from '@/screens/auth/RegionSelection'
import { Login } from '@/screens/auth/Login'
import {
  AccountLocked,
  LogoutConfirmation,
  SessionExpired,
  Unauthorized,
} from '@/screens/auth/StatusScreens'
import { Dashboard } from '@/screens/Dashboard'

/** Screens that render without the app shell and without a role check —
 *  the auth chain and the terminal-state pages. */
const PUBLIC_SCREENS: Record<string, React.ComponentType> = {
  Splash,
  Welcome,
  LanguageSelection,
  RegionSelection,
  Login,
  Unauthorized,
  SessionExpired,
  AccountLocked,
  LogoutConfirmation,
}

/** Rebuilt operational screens. Everything in SCREENS not listed here gets a
 *  PendingScreen, so the nav never dead-ends while the port is in progress. */
const APP_SCREENS: Record<string, React.ComponentType> = {
  Dashboard,
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/splash" replace />} />

      {SCREENS.map((screen) => {
        const Public = PUBLIC_SCREENS[screen.name]
        if (Public) {
          return <Route key={screen.name} path={screen.route} element={<Public />} />
        }

        const Implemented = APP_SCREENS[screen.name]
        return (
          <Route
            key={screen.name}
            path={screen.route}
            element={
              <RequireAccess screen={screen.name}>
                {Implemented ? <Implemented /> : <PendingScreen screen={screen} />}
              </RequireAccess>
            }
          />
        )
      })}

      {/* Routes the design references but SCREEN_MAP doesn't list. */}
      <Route path="/logout-confirmation" element={<LogoutConfirmation />} />
      <Route path="/support" element={<Navigate to="/call-center" replace />} />
      <Route path="*" element={<Navigate to="/error404" replace />} />
    </Routes>
  )
}

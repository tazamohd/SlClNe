import { Navigate, Route, Routes } from 'react-router-dom'
import { SCREENS } from '@/data/generated/screens'
import { SPEC_SCREENS } from '@/data/generated/spec-screens'
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
import { ForgotPassword, ResetPassword } from '@/screens/auth/PasswordScreens'
import {
  BiometricSetup,
  CreatePIN,
  OTPVerification,
  TwoFactorVerification,
} from '@/screens/auth/VerificationScreens'
import { Dashboard } from '@/screens/Dashboard'
import { JobCards } from '@/screens/workshop/JobCards'
import { JobDetail } from '@/screens/workshop/JobDetail'
import { WorkshopCheckIn } from '@/screens/workshop/WorkshopCheckIn'
import { WorkshopInspection } from '@/screens/workshop/WorkshopInspection'
import { WorkshopEstimate } from '@/screens/workshop/WorkshopEstimate'
import { WorkshopQC } from '@/screens/workshop/WorkshopQC'
import { WorkshopSignature } from '@/screens/workshop/WorkshopSignature'
import { WorkshopDelivery } from '@/screens/workshop/WorkshopDelivery'
import { Invoices } from '@/screens/finance/Invoices'
import { InvoiceDetail } from '@/screens/finance/InvoiceDetail'
import { InvoiceCreate } from '@/screens/finance/InvoiceCreate'
import { Payments } from '@/screens/finance/Payments'

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
  ForgotPassword,
  ResetPassword,
  OTPVerification,
  TwoFactorVerification,
  CreatePIN,
  BiometricSetup,
}

/** Rebuilt operational screens. Everything in SCREENS not listed here gets a
 *  PendingScreen, so the nav never dead-ends while the port is in progress. */
const APP_SCREENS: Record<string, React.ComponentType> = {
  Dashboard,
  JobCards,
  JobDetail,
  WorkshopCheckIn,
  WorkshopInspection,
  WorkshopEstimate,
  WorkshopQC,
  WorkshopSignature,
  WorkshopDelivery,
  Invoices,
  InvoiceDetail,
  InvoiceCreate,
  Payments,
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

      {/* Feature-map screens with no `.dc.html` design. They carry a spec and
          a reference screenshot under project/spec-shots/, so the route and nav
          entry exist and PendingScreen names what to build from. Screens that
          do have a design are already routed above. */}
      {SPEC_SCREENS.filter((spec) => !spec.designScreen).map((spec) => (
        <Route
          key={spec.id}
          path={spec.route}
          element={
            <RequireAccess screen={spec.name}>
              <PendingScreen
                screen={{
                  name: spec.title,
                  route: spec.route,
                  hasMobile: false,
                  purpose: spec.purpose,
                }}
                specId={spec.id}
              />
            </RequireAccess>
          }
        />
      ))}

      {/* Routes the design references but SCREEN_MAP doesn't list. */}
      <Route path="/logout-confirmation" element={<LogoutConfirmation />} />
      <Route path="/support" element={<Navigate to="/call-center" replace />} />
      <Route path="*" element={<Navigate to="/error404" replace />} />
    </Routes>
  )
}

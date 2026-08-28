import { lazy, useMemo } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { SPEC_SCREENS } from '@/data/generated/spec-screens'
import { FEATURE_DEF_BY_ROUTE } from '@/screens/feature/definitions'
import { FeatureScreenView } from '@/screens/feature/FeatureScreenView'
import { PendingScreen } from '@/screens/PendingScreen'
import { RequireAccess } from './RequireAccess'

const specByRoute = new Map(
  SPEC_SCREENS.filter((s) => !s.designScreen).map((s) => [s.route, s]),
)

// hr & payroll
const HRManagement = lazy(() =>
  import('@/screens/admin/HRScreens').then((m) => ({ default: m.HRManagement })),
)
const StaffDirectory = lazy(() =>
  import('@/screens/admin/HRScreens').then((m) => ({ default: m.StaffDirectory })),
)
const StaffScheduling = lazy(() =>
  import('@/screens/admin/HRScreens').then((m) => ({ default: m.StaffScheduling })),
)
const StaffPerformanceReview = lazy(() =>
  import('@/screens/admin/HRScreens').then((m) => ({ default: m.StaffPerformanceReview })),
)
const TimesheetManagement = lazy(() =>
  import('@/screens/admin/HRScreens').then((m) => ({ default: m.TimesheetManagement })),
)
const TimeclockPayroll = lazy(() =>
  import('@/screens/admin/HRScreens').then((m) => ({ default: m.TimeclockPayroll })),
)
const PayrollManagement = lazy(() =>
  import('@/screens/admin/HRScreens').then((m) => ({ default: m.PayrollManagement })),
)
const LeaveRequests = lazy(() =>
  import('@/screens/admin/HRScreens').then((m) => ({ default: m.LeaveRequests })),
)
const TrainingLMS = lazy(() =>
  import('@/screens/admin/HRScreens').then((m) => ({ default: m.TrainingLMS })),
)

/** Real implementations for spec-screen routes. When a route is listed here,
 *  it takes priority over the generic FeatureScreenView placeholder. */
const SPEC_IMPLEMENTATIONS: Record<string, React.ComponentType> = {
  '/hr-management': HRManagement,
  '/staff-directory': StaffDirectory,
  '/staff-scheduling': StaffScheduling,
  '/staff-performance-review': StaffPerformanceReview,
  '/timesheet-management': TimesheetManagement,
  '/timeclock-payroll': TimeclockPayroll,
  '/payroll-management': PayrollManagement,
  '/leave-requests': LeaveRequests,
  '/training-lms': TrainingLMS,
}

export default function SpecScreenResolver() {
  const { pathname } = useLocation()
  const spec = useMemo(() => specByRoute.get(pathname), [pathname])

  if (!spec) return <Navigate to="/error404" replace />

  const Implemented = SPEC_IMPLEMENTATIONS[spec.route]
  const def = FEATURE_DEF_BY_ROUTE.get(spec.route)
  return (
    <RequireAccess screen={spec.name}>
      {Implemented ? (
        <Implemented />
      ) : def ? (
        <FeatureScreenView def={def} />
      ) : (
        <PendingScreen
          screen={{
            name: spec.title,
            route: spec.route,
            hasMobile: false,
            purpose: spec.purpose,
          }}
          specId={spec.id}
        />
      )}
    </RequireAccess>
  )
}

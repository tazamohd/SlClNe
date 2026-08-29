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

// Spec-screen routes that have graduated from the generic FeatureScreenView
// to a dedicated component with typed columns, DataTable, and real data.
// Lazy-loaded alongside this resolver so they stay out of the main bundle.

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

// insurance / warranty / contracts
const InsuranceClaims = lazy(() =>
  import('@/screens/insurance/InsuranceClaims').then((m) => ({ default: m.InsuranceClaims })),
)
const WarrantyManagement = lazy(() =>
  import('@/screens/insurance/WarrantyManagement').then((m) => ({ default: m.WarrantyManagement })),
)
const ContractManagement = lazy(() =>
  import('@/screens/insurance/ContractManagement').then((m) => ({ default: m.ContractManagement })),
)

// fleet / loaner / towing
const FleetTracking = lazy(() =>
  import('@/screens/fleet/FleetTracking').then((m) => ({ default: m.FleetTracking })),
)
const LoanerVehicles = lazy(() =>
  import('@/screens/fleet/LoanerVehicles').then((m) => ({ default: m.LoanerVehicles })),
)
const TowingAssistance = lazy(() =>
  import('@/screens/fleet/TowingAssistance').then((m) => ({ default: m.TowingAssistance })),
)
const TowingServices = lazy(() =>
  import('@/screens/fleet/TowingServices').then((m) => ({ default: m.TowingServices })),
)

/** Real implementations for spec-screen routes. When a route is listed here,
 *  it takes priority over the generic FeatureScreenView placeholder. */
const SPEC_CUSTOM_SCREENS: Record<string, React.ComponentType> = {
  '/hr-management': HRManagement,
  '/staff-directory': StaffDirectory,
  '/staff-scheduling': StaffScheduling,
  '/staff-performance-review': StaffPerformanceReview,
  '/timesheet-management': TimesheetManagement,
  '/timeclock-payroll': TimeclockPayroll,
  '/payroll-management': PayrollManagement,
  '/leave-requests': LeaveRequests,
  '/training-lms': TrainingLMS,
  '/insurance-claims': InsuranceClaims,
  '/warranty-management': WarrantyManagement,
  '/contract-management': ContractManagement,
  '/fleet-tracking': FleetTracking,
  '/loaner-vehicles': LoanerVehicles,
  '/towing-assistance': TowingAssistance,
  '/towing-services': TowingServices,
}

export default function SpecScreenResolver() {
  const { pathname } = useLocation()
  const spec = useMemo(() => specByRoute.get(pathname), [pathname])

  if (!spec) return <Navigate to="/error404" replace />

  const Custom = SPEC_CUSTOM_SCREENS[spec.route]
  const def = FEATURE_DEF_BY_ROUTE.get(spec.route)
  return (
    <RequireAccess screen={spec.name}>
      {Custom ? (
        <Custom />
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

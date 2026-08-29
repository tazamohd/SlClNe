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

// settings
const SystemSettings = lazy(() =>
  import('@/screens/admin/SettingsScreens').then((m) => ({ default: m.SystemSettings })),
)
const UserSettings = lazy(() =>
  import('@/screens/admin/SettingsScreens').then((m) => ({ default: m.UserSettings })),
)
const SecuritySettings = lazy(() =>
  import('@/screens/admin/SettingsScreens').then((m) => ({ default: m.SecuritySettings })),
)
const FinancialSettings = lazy(() =>
  import('@/screens/admin/SettingsScreens').then((m) => ({ default: m.FinancialSettings })),
)
const ZATCASettings = lazy(() =>
  import('@/screens/admin/SettingsScreens').then((m) => ({ default: m.ZATCASettings })),
)
const VATSettings = lazy(() =>
  import('@/screens/admin/SettingsScreens').then((m) => ({ default: m.VATSettings })),
)
const ZakatSettings = lazy(() =>
  import('@/screens/admin/SettingsScreens').then((m) => ({ default: m.ZakatSettings })),
)

// admin / compliance
const UserProfile = lazy(() =>
  import('@/screens/admin/ComplianceScreens').then((m) => ({ default: m.UserProfile })),
)
const RoleManagement = lazy(() =>
  import('@/screens/admin/ComplianceScreens').then((m) => ({ default: m.RoleManagement })),
)
const ComplianceManagement = lazy(() =>
  import('@/screens/admin/ComplianceScreens').then((m) => ({ default: m.ComplianceManagement })),
)
const SafetyIncidents = lazy(() =>
  import('@/screens/admin/ComplianceScreens').then((m) => ({ default: m.SafetyIncidents })),
)
const EnvironmentalCompliance = lazy(() =>
  import('@/screens/admin/ComplianceScreens').then((m) => ({ default: m.EnvironmentalCompliance })),
)
const ISOQualityManagement = lazy(() =>
  import('@/screens/admin/ComplianceScreens').then((m) => ({ default: m.ISOQualityManagement })),
)
const EquipmentCalibration = lazy(() =>
  import('@/screens/admin/ComplianceScreens').then((m) => ({ default: m.EquipmentCalibration })),
)

// system / infrastructure
const NotificationsScreen = lazy(() =>
  import('@/screens/admin/SystemScreens').then((m) => ({ default: m.NotificationsScreen })),
)
const AccountingIntegration = lazy(() =>
  import('@/screens/admin/SystemScreens').then((m) => ({ default: m.AccountingIntegration })),
)
const SMSIntegration = lazy(() =>
  import('@/screens/admin/SystemScreens').then((m) => ({ default: m.SMSIntegration })),
)
const SecurityCameras = lazy(() =>
  import('@/screens/admin/SystemScreens').then((m) => ({ default: m.SecurityCameras })),
)
const MobileDeviceManagement = lazy(() =>
  import('@/screens/admin/SystemScreens').then((m) => ({ default: m.MobileDeviceManagement })),
)
const DocumentManagement = lazy(() =>
  import('@/screens/admin/SystemScreens').then((m) => ({ default: m.DocumentManagement })),
)
const DocumentOCR = lazy(() =>
  import('@/screens/admin/SystemScreens').then((m) => ({ default: m.DocumentOCR })),
)
const DataImportExport = lazy(() =>
  import('@/screens/admin/SystemScreens').then((m) => ({ default: m.DataImportExport })),
)
const DataBackup = lazy(() =>
  import('@/screens/admin/SystemScreens').then((m) => ({ default: m.DataBackup })),
)
const DigitalSignage = lazy(() =>
  import('@/screens/admin/SystemScreens').then((m) => ({ default: m.DigitalSignage })),
)

// organization / multi-site
const FranchiseManagement = lazy(() =>
  import('@/screens/admin/OrganizationScreens').then((m) => ({ default: m.FranchiseManagement })),
)
const GlobalizationLayer = lazy(() =>
  import('@/screens/admin/OrganizationScreens').then((m) => ({ default: m.GlobalizationLayer })),
)
const MultiLocationDashboard = lazy(() =>
  import('@/screens/admin/OrganizationScreens').then((m) => ({ default: m.MultiLocationDashboard })),
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
  // settings
  '/system-settings': SystemSettings,
  '/user-settings': UserSettings,
  '/security-settings': SecuritySettings,
  '/financial-settings': FinancialSettings,
  '/zatca-settings': ZATCASettings,
  '/vat-settings': VATSettings,
  '/zakat-settings': ZakatSettings,
  // admin / compliance
  '/user-profile': UserProfile,
  '/role-management': RoleManagement,
  '/compliance-management': ComplianceManagement,
  '/safety-incidents': SafetyIncidents,
  '/environmental-compliance': EnvironmentalCompliance,
  '/iso-quality-management': ISOQualityManagement,
  '/equipment-calibration': EquipmentCalibration,
  // system / infrastructure
  '/notifications': NotificationsScreen,
  '/accounting-integration': AccountingIntegration,
  '/sms-integration': SMSIntegration,
  '/security-cameras': SecurityCameras,
  '/mobile-device-management': MobileDeviceManagement,
  '/document-management': DocumentManagement,
  '/document-ocr': DocumentOCR,
  '/data-import-export': DataImportExport,
  '/data-backup': DataBackup,
  '/digital-signage': DigitalSignage,
  // organization / multi-site
  '/franchise-management': FranchiseManagement,
  '/globalization-layer': GlobalizationLayer,
  '/multi-location-dashboard': MultiLocationDashboard,
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

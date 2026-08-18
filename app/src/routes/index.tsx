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
import { PublicPortalLanding } from '@/screens/website/Landing'
import { PublicPortalAbout } from '@/screens/website/About'
import { PublicPortalServices } from '@/screens/website/Services'
import { PublicPortalMarketplace } from '@/screens/website/Marketplace'
import { PublicPortalInsurance } from '@/screens/website/Insurance'
import { PublicPortalLoans } from '@/screens/website/Loans'
import { PublicPortalBlog } from '@/screens/website/Blog'
import { PublicPortalFAQ } from '@/screens/website/FAQ'
import { PublicPortalContact } from '@/screens/website/Contact'
import { PublicPortalSupport } from '@/screens/website/Support'
import { CustomerPortal, CustomerPortalBooking } from '@/screens/portals/CustomerPortal'
import { SupplierPortal, SupplierPortalOrders } from '@/screens/portals/SupplierPortal'
import { TechnicianPortal, TechnicianPortalJobDetail } from '@/screens/portals/TechnicianPortal'
import { KioskCheckIn } from '@/screens/portals/KioskCheckIn'
import { Register } from '@/screens/auth/Register'
import { RoleSelection } from '@/screens/auth/RoleSelection'
import { SocialLogin } from '@/screens/auth/SocialLogin'
import { SSOLogin } from '@/screens/auth/SSOLogin'
import { OrganizationSelection } from '@/screens/auth/OrganizationSelection'
import { WorkspaceSelection } from '@/screens/auth/WorkspaceSelection'
import { ProfileCompletion } from '@/screens/auth/ProfileCompletion'
import { Onboarding } from '@/screens/auth/Onboarding'
import { InviteAcceptance } from '@/screens/auth/InviteAcceptance'
import { Error404 } from '@/screens/auth/Error404'
import { Maintenance } from '@/screens/auth/Maintenance'
import { PrivacyPolicy } from '@/screens/auth/PrivacyPolicy'
import { TermsConditions } from '@/screens/auth/TermsConditions'
import { Dashboard } from '@/screens/Dashboard'
import { JobCards } from '@/screens/workshop/JobCards'
import { JobDetail } from '@/screens/workshop/JobDetail'
import { JobCardDetail } from '@/screens/workshop/JobCardDetail'
import { AppointmentCalendar } from '@/screens/workshop/AppointmentCalendar'
import { ApprovalInbox } from '@/screens/workshop/ApprovalInbox'
import { CustomerApproval } from '@/screens/workshop/CustomerApproval'
import { DiagnosticReport } from '@/screens/workshop/DiagnosticReport'
import { EstimateDetail } from '@/screens/workshop/EstimateDetail'
import { OBDDiagnostics } from '@/screens/workshop/OBDDiagnostics'
import { TechnicianKB } from '@/screens/workshop/TechnicianKB'
import { TechnicianSchedule } from '@/screens/workshop/TechnicianSchedule'
import { WorkshopReports } from '@/screens/workshop/WorkshopReports'
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
import {
  Customers,
  Estimates,
  FleetManagement,
  Technicians,
  Vehicles,
} from '@/screens/registry/Registries'
import { Appointments } from '@/screens/registry/Appointments'
import {
  PartsNetworkDashboard,
  PartsNetworkIncoming,
  PartsNetworkMembers,
  PartsNetworkOrders,
  PartsNetworkRequests,
} from '@/screens/network/PartsNetwork'
import {
  PartsNetworkQuotations,
  PartsNetworkSendRequest,
  PartsSupplyNetwork,
  ProcurementPortal,
  ProcurementRequisitions,
} from '@/screens/network/Procurement'
import {
  ChartOfAccounts,
  Departments,
  Expenses,
  JournalEntries,
  Receipts,
} from '@/screens/accounting/Accounting'
import {
  BIDashboard,
  ExecutiveReports,
  FinancialReports,
  FinancialStatements,
  OperationalReports,
} from '@/screens/accounting/Reports'
import { BankReconciliation } from '@/screens/accounting/BankReconciliation'
import { CustomReports } from '@/screens/accounting/CustomReports'
import { InsuranceReports } from '@/screens/accounting/InsuranceReports'
import { InvoicePreview } from '@/screens/accounting/InvoicePreview'
import { LoanReports } from '@/screens/accounting/LoanReports'
import { Reports } from '@/screens/accounting/ReportsHub'
import { ReportsAnalytics } from '@/screens/accounting/ReportsAnalytics'
import { SalesReports } from '@/screens/accounting/SalesReports'
import { TaxManagement } from '@/screens/accounting/TaxManagement'
import {
  AgentDashboard,
  AgentRegistry,
  Campaigns,
  ConversationHistory,
  CRMTasks,
  CustomerSegments,
  EmailMarketing,
  Integrations,
  LeadPipeline,
  Opportunities,
  SMSCampaigns,
  WhatsAppCampaigns,
} from '@/screens/crm/Crm'
import {
  CustomerAppAppointments,
  CustomerAppGarage,
  CustomerAppHome,
  CustomerAppInsurance,
  CustomerAppLoans,
  CustomerAppMarketplace,
  CustomerAppNotifications,
  CustomerAppOrders,
  CustomerAppProfile,
  CustomerAppServiceTracking,
  CustomerAppWallet,
} from '@/screens/customer-app/CustomerApp'
import { CRMCalendar } from '@/screens/crm/CRMCalendar'
import { CustomerFeedback } from '@/screens/crm/CustomerFeedback'
import { LeadDetail } from '@/screens/crm/LeadDetail'
import { FleetContract } from '@/screens/registry/FleetContract'
import { InventoryReports } from '@/screens/accounting/InventoryReports'
import { HRPayroll } from '@/screens/admin/HRPayroll'
import { AIAnalytics } from '@/screens/ai/AIAnalytics'
import { AIAssistant } from '@/screens/ai/AIAssistant'
import { AutomationRules } from '@/screens/ai/AutomationRules'
import { KnowledgeBase } from '@/screens/ai/KnowledgeBase'
import { ModelSettings } from '@/screens/ai/ModelSettings'
import { PromptLibrary } from '@/screens/ai/PromptLibrary'
import { WorkflowBuilder } from '@/screens/ai/WorkflowBuilder'
import { AdvancedSettings } from '@/screens/admin/AdvancedSettings'
import { AuditLog } from '@/screens/admin/AuditLog'
import { Backup } from '@/screens/admin/Backup'
import { Branches } from '@/screens/admin/Branches'
import { GlobalSearch } from '@/screens/admin/GlobalSearch'
import { NotificationCenter } from '@/screens/admin/NotificationCenter'
import { OEMIntegrations } from '@/screens/admin/OEMIntegrations'
import { Organizations } from '@/screens/admin/Organizations'
import { Profile } from '@/screens/admin/Profile'
import { RolesPermissions } from '@/screens/admin/RolesPermissions'
import { Settings } from '@/screens/admin/Settings'
import { Subscription } from '@/screens/admin/Subscription'
import { SuperAdmin } from '@/screens/admin/SuperAdmin'
import { SystemIntegrations } from '@/screens/admin/SystemIntegrations'
import { Templates } from '@/screens/admin/Templates'
import { UsersTeams } from '@/screens/admin/UsersTeams'
import { Inventory } from '@/screens/feature/Inventory'
import { FeatureScreenView } from '@/screens/feature/FeatureScreenView'
import { FEATURE_DEF_BY_ROUTE } from '@/screens/feature/definitions'

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
  // Public marketing site: each page ships its own site header/nav/footer.
  'PublicPortal.Landing': PublicPortalLanding,
  'PublicPortal.About': PublicPortalAbout,
  'PublicPortal.Services': PublicPortalServices,
  'PublicPortal.Marketplace': PublicPortalMarketplace,
  'PublicPortal.Insurance': PublicPortalInsurance,
  'PublicPortal.Loans': PublicPortalLoans,
  'PublicPortal.Blog': PublicPortalBlog,
  'PublicPortal.FAQ': PublicPortalFAQ,
  'PublicPortal.Contact': PublicPortalContact,
  'PublicPortal.Support': PublicPortalSupport,
  // Standalone portals: the designs ship their own chrome (sidebar/header or
  // phone frame), so they render outside AppShell like the auth chain does.
  CustomerPortal,
  'CustomerPortal.Booking': CustomerPortalBooking,
  SupplierPortal,
  'SupplierPortal.Orders': SupplierPortalOrders,
  TechnicianPortal,
  'TechnicianPortal.JobDetail': TechnicianPortalJobDetail,
  KioskCheckIn,
  Register,
  RoleSelection,
  SocialLogin,
  SSOLogin,
  OrganizationSelection,
  WorkspaceSelection,
  ProfileCompletion,
  Onboarding,
  InviteAcceptance,
  Error404,
  Maintenance,
  PrivacyPolicy,
  TermsConditions,
}

/** Rebuilt operational screens. Everything in SCREENS not listed here gets a
 *  PendingScreen, so the nav never dead-ends while the port is in progress. */
const APP_SCREENS: Record<string, React.ComponentType> = {
  Dashboard,
  JobCards,
  JobDetail,
  JobCardDetail,
  AppointmentCalendar,
  ApprovalInbox,
  CustomerApproval,
  DiagnosticReport,
  EstimateDetail,
  OBDDiagnostics,
  TechnicianKB,
  TechnicianSchedule,
  WorkshopReports,
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
  Inventory,
  Customers,
  Vehicles,
  Estimates,
  Technicians,
  FleetManagement,
  Appointments,
  // Dotted design names map to sub-routes like /parts-network/requests.
  PartsNetwork: PartsNetworkDashboard,
  'PartsNetwork.Requests': PartsNetworkRequests,
  'PartsNetwork.Quotations': PartsNetworkQuotations,
  'PartsNetwork.Orders': PartsNetworkOrders,
  'PartsNetwork.Members': PartsNetworkMembers,
  'PartsNetwork.Incoming': PartsNetworkIncoming,
  'PartsNetwork.SendRequest': PartsNetworkSendRequest,
  PartsSupplyNetwork,
  ProcurementPortal,
  'ProcurementPortal.Requisitions': ProcurementRequisitions,
  ChartOfAccounts,
  JournalEntries,
  Expenses,
  Receipts,
  Departments,
  FinancialReports,
  FinancialStatements,
  ExecutiveReports,
  OperationalReports,
  BIDashboard,
  BankReconciliation,
  CustomReports,
  InsuranceReports,
  InvoicePreview,
  LoanReports,
  Reports,
  ReportsAnalytics,
  SalesReports,
  TaxManagement,
  LeadPipeline,
  Opportunities,
  Campaigns,
  EmailMarketing,
  SMSCampaigns,
  WhatsAppCampaigns,
  CustomerSegments,
  CRMTasks,
  AgentRegistry,
  AgentDashboard,
  ConversationHistory,
  Integrations,
  CRMCalendar,
  CustomerFeedback,
  LeadDetail,
  FleetContract,
  InventoryReports,
  HRPayroll,
  AIAnalytics,
  AIAssistant,
  AutomationRules,
  KnowledgeBase,
  ModelSettings,
  PromptLibrary,
  WorkflowBuilder,
  AdvancedSettings,
  AuditLog,
  Backup,
  Branches,
  GlobalSearch,
  NotificationCenter,
  OEMIntegrations,
  Organizations,
  Profile,
  RolesPermissions,
  Settings,
  Subscription,
  SuperAdmin,
  SystemIntegrations,
  Templates,
  UsersTeams,
}

/** Customer-app screens. Rendered in `CustomerAppShell`, not `AppShell`. */
const CUSTOMER_APP_SCREENS: Record<string, React.ComponentType> = {
  'CustomerApp.Home': CustomerAppHome,
  'CustomerApp.Garage': CustomerAppGarage,
  'CustomerApp.Appointments': CustomerAppAppointments,
  'CustomerApp.ServiceTracking': CustomerAppServiceTracking,
  'CustomerApp.Wallet': CustomerAppWallet,
  'CustomerApp.Orders': CustomerAppOrders,
  'CustomerApp.Marketplace': CustomerAppMarketplace,
  'CustomerApp.Notifications': CustomerAppNotifications,
  'CustomerApp.Insurance': CustomerAppInsurance,
  'CustomerApp.Loans': CustomerAppLoans,
  'CustomerApp.Profile': CustomerAppProfile,
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

        const CustomerScreen = CUSTOMER_APP_SCREENS[screen.name]
        if (CustomerScreen) {
          return (
            <Route
              key={screen.name}
              path={screen.route}
              element={
                <RequireAccess screen={screen.name} shell="customer-app">
                  <CustomerScreen />
                </RequireAccess>
              }
            />
          )
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
      {SPEC_SCREENS.filter((spec) => !spec.designScreen).map((spec) => {
        const def = FEATURE_DEF_BY_ROUTE.get(spec.route)
        return (
          <Route
            key={spec.id}
            path={spec.route}
            element={
              <RequireAccess screen={spec.name}>
                {def ? (
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
            }
          />
        )
      })}

      {/* Routes the design references but SCREEN_MAP doesn't list. */}
      <Route path="/customer-app" element={<Navigate to="/customer-app/home" replace />} />
      <Route path="/logout-confirmation" element={<LogoutConfirmation />} />
      <Route path="/support" element={<Navigate to="/call-center" replace />} />
      <Route path="*" element={<Navigate to="/error404" replace />} />
    </Routes>
  )
}

import { Navigate, Route, Routes } from 'react-router-dom'
import type { ComponentType } from 'react'
import { SCREENS } from '@/data/generated/screens'
import { SPEC_SCREENS } from '@/data/generated/spec-screens'
import { RequireAccess } from './RequireAccess'
import { PendingScreen } from '@/screens/PendingScreen'
import { composeScreens, type DomainScreens, type Shell } from '@/screens/registry'
import { CustomerAppShell } from '@/components/shell/CustomerAppShell'

import { SCREENS as WORKSHOP_SCREENS } from '@/screens/domains/workshop'
import { SCREENS as CRM_SCREENS } from '@/screens/domains/crm'
import { SCREENS as PARTS_SCREENS } from '@/screens/domains/parts'
import { SCREENS as PROCUREMENT_SCREENS } from '@/screens/domains/procurement'
import { SCREENS as ACCOUNTING_SCREENS } from '@/screens/domains/accounting'
import { SCREENS as INSURANCE_SCREENS } from '@/screens/domains/insurance'
import { SCREENS as HR_SCREENS } from '@/screens/domains/hr'
import { SCREENS as AI_SCREENS } from '@/screens/domains/ai'
import { SCREENS as PORTALS_SCREENS } from '@/screens/domains/portals'
import { SCREENS as WEBSITE_SCREENS } from '@/screens/domains/website'

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

/** The three maps above predate the domain barrels and stay where they are —
 *  moving 80 working screens to prove a point is the kind of churn §57 warns
 *  about. They are folded in as three more domains, so the same double-claim
 *  check covers them: a W2 agent that re-declares `JobCards` in its own barrel
 *  gets an error naming both sides, not a silent overwrite. */
const asDomain = (
  screens: Record<string, ComponentType>,
  shell: Shell | null | undefined,
  ungated = false
): DomainScreens =>
  Object.fromEntries(
    Object.entries(screens).map(([name, component]) => [name, { component, shell, ungated }])
  )

const SCREEN_ENTRIES = composeScreens({
  'legacy:auth': asDomain(PUBLIC_SCREENS, null, true),
  'legacy:customer-app': asDomain(CUSTOMER_APP_SCREENS, CustomerAppShell),
  'legacy:app': asDomain(APP_SCREENS, undefined),
  workshop: WORKSHOP_SCREENS,
  crm: CRM_SCREENS,
  parts: PARTS_SCREENS,
  procurement: PROCUREMENT_SCREENS,
  accounting: ACCOUNTING_SCREENS,
  insurance: INSURANCE_SCREENS,
  hr: HR_SCREENS,
  ai: AI_SCREENS,
  portals: PORTALS_SCREENS,
  website: WEBSITE_SCREENS,
})

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/splash" replace />} />

      {SCREENS.map((screen) => {
        const entry = SCREEN_ENTRIES[screen.name]

        // Ungated screens render outside RequireAccess entirely rather than
        // passing a flag through it: the guard redirects anyone without a
        // session to /login, and /login is one of these screens.
        if (entry?.ungated) {
          const Ungated = entry.component
          const UngatedShell = entry.shell
          return (
            <Route
              key={screen.name}
              path={screen.route}
              element={
                UngatedShell ? (
                  <UngatedShell>
                    <Ungated />
                  </UngatedShell>
                ) : (
                  <Ungated />
                )
              }
            />
          )
        }

        const Implemented = entry?.component
        return (
          <Route
            key={screen.name}
            path={screen.route}
            element={
              <RequireAccess screen={screen.name} shell={entry?.shell}>
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
        // A domain that has built the real screen outranks both the kit and the
        // placeholder — that is how a feature-map route graduates.
        const owned = SCREEN_ENTRIES[spec.name]
        const Owned = owned?.component
        return (
          <Route
            key={spec.id}
            path={spec.route}
            element={
              <RequireAccess screen={spec.name} shell={owned?.shell}>
                {Owned ? (
                  <Owned />
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

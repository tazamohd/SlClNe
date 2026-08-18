import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import type { ComponentType } from 'react'
import { SCREENS } from '@/data/generated/screens'
import { SPEC_SCREENS } from '@/data/generated/spec-screens'
import { RequireAccess } from './RequireAccess'
import { PendingScreen } from '@/screens/PendingScreen'
import {
  composeScreens,
  entryOf,
  type DomainScreens,
  type ScreenEntry,
  type Shell,
} from '@/screens/registry'
import { CustomerAppShell } from '@/components/shell/CustomerAppShell'
import { PortalShell } from '@/components/shell/PortalShell'
import { PublicShell } from '@/components/shell/PublicShell'
import { Loading } from '@/components/ui/States'
import { FeatureScreenView } from '@/screens/feature/FeatureScreenView'
import { FEATURE_DEF_BY_ROUTE } from '@/screens/feature/definitions'

/** Everything below reaches its screen through `React.lazy(() => import(...))`
 *  rather than a static import. The routes, guards, shells and screen-name
 *  mapping are byte-for-byte what they were — only the loading strategy changed.
 *  Vite emits one chunk per dynamic-import target, so the auth chain and the
 *  operational shell are all the first paint needs, and each ERP domain, the
 *  marketing site and the customer portal arrive on the navigation that first
 *  reaches them. See `vite.config.ts` for how those chunks are grouped.
 *
 *  The barrel tables below mirror the screen names each domain declares in
 *  `screens/domains/*`. The barrel stays the module the code actually loads —
 *  these tables only say which lazy chunk a name resolves to, and the same
 *  `composeScreens` double-claim check still runs over them. A name added to a
 *  barrel needs a line here to route; that coupling is the price of splitting a
 *  file whose imports are the whole product. */

/** Wrap a named module export in `React.lazy`. Repeated calls with the same
 *  import specifier resolve to one chunk, so a module that exports several
 *  screens is split once, not per screen. */
function lazyNamed(
  load: () => Promise<Record<string, unknown>>,
  name: string
): ComponentType {
  return lazy(async () => ({ default: (await load())[name] as ComponentType }))
}

type BarrelModule = { SCREENS: DomainScreens }

/** Turn a domain barrel into lazy entries: each named screen becomes a chunk
 *  that pulls the barrel on first render, and `meta` carries the sync chrome the
 *  router needs before the chunk lands (a portal/public shell, or `ungated`). */
function lazyBarrel(
  load: () => Promise<BarrelModule>,
  names: readonly string[],
  meta: Omit<ScreenEntry, 'component'> = {}
): DomainScreens {
  return Object.fromEntries(
    names.map((name) => [
      name,
      {
        ...meta,
        component: lazy(async () => ({
          default: entryOf((await load()).SCREENS[name]).component,
        })),
      },
    ])
  )
}

// Also routed on its own below, so it gets a name of its own.
const LogoutConfirmation = lazyNamed(
  () => import('@/screens/auth/StatusScreens'),
  'LogoutConfirmation'
)

/** Screens that render without the app shell and without a role check —
 *  the auth chain and the terminal-state pages. */
const PUBLIC_SCREENS: Record<string, ComponentType> = {
  Splash: lazyNamed(() => import('@/screens/auth/Splash'), 'Splash'),
  Welcome: lazyNamed(() => import('@/screens/auth/Welcome'), 'Welcome'),
  LanguageSelection: lazyNamed(() => import('@/screens/auth/LanguageSelection'), 'LanguageSelection'),
  RegionSelection: lazyNamed(() => import('@/screens/auth/RegionSelection'), 'RegionSelection'),
  Login: lazyNamed(() => import('@/screens/auth/Login'), 'Login'),
  Unauthorized: lazyNamed(() => import('@/screens/auth/StatusScreens'), 'Unauthorized'),
  SessionExpired: lazyNamed(() => import('@/screens/auth/StatusScreens'), 'SessionExpired'),
  AccountLocked: lazyNamed(() => import('@/screens/auth/StatusScreens'), 'AccountLocked'),
  LogoutConfirmation,
  ForgotPassword: lazyNamed(() => import('@/screens/auth/PasswordScreens'), 'ForgotPassword'),
  ResetPassword: lazyNamed(() => import('@/screens/auth/PasswordScreens'), 'ResetPassword'),
  OTPVerification: lazyNamed(() => import('@/screens/auth/VerificationScreens'), 'OTPVerification'),
  TwoFactorVerification: lazyNamed(() => import('@/screens/auth/VerificationScreens'), 'TwoFactorVerification'),
  CreatePIN: lazyNamed(() => import('@/screens/auth/VerificationScreens'), 'CreatePIN'),
  BiometricSetup: lazyNamed(() => import('@/screens/auth/VerificationScreens'), 'BiometricSetup'),
  Error404: lazyNamed(() => import('@/screens/auth/Error404'), 'Error404'),
  Maintenance: lazyNamed(() => import('@/screens/auth/Maintenance'), 'Maintenance'),
}

/** Rebuilt operational screens. Everything in SCREENS not listed here gets a
 *  PendingScreen, so the nav never dead-ends while the port is in progress. */
const APP_SCREENS: Record<string, ComponentType> = {
  Dashboard: lazyNamed(() => import('@/screens/Dashboard'), 'Dashboard'),
  JobCards: lazyNamed(() => import('@/screens/workshop/JobCards'), 'JobCards'),
  JobDetail: lazyNamed(() => import('@/screens/workshop/JobDetail'), 'JobDetail'),
  WorkshopCheckIn: lazyNamed(() => import('@/screens/workshop/WorkshopCheckIn'), 'WorkshopCheckIn'),
  WorkshopInspection: lazyNamed(() => import('@/screens/workshop/WorkshopInspection'), 'WorkshopInspection'),
  WorkshopEstimate: lazyNamed(() => import('@/screens/workshop/WorkshopEstimate'), 'WorkshopEstimate'),
  WorkshopQC: lazyNamed(() => import('@/screens/workshop/WorkshopQC'), 'WorkshopQC'),
  WorkshopSignature: lazyNamed(() => import('@/screens/workshop/WorkshopSignature'), 'WorkshopSignature'),
  WorkshopDelivery: lazyNamed(() => import('@/screens/workshop/WorkshopDelivery'), 'WorkshopDelivery'),
  Invoices: lazyNamed(() => import('@/screens/finance/Invoices'), 'Invoices'),
  InvoiceDetail: lazyNamed(() => import('@/screens/finance/InvoiceDetail'), 'InvoiceDetail'),
  InvoiceCreate: lazyNamed(() => import('@/screens/finance/InvoiceCreate'), 'InvoiceCreate'),
  Payments: lazyNamed(() => import('@/screens/finance/Payments'), 'Payments'),
  Inventory: lazyNamed(() => import('@/screens/feature/Inventory'), 'Inventory'),
  Customers: lazyNamed(() => import('@/screens/registry/Registries'), 'Customers'),
  Vehicles: lazyNamed(() => import('@/screens/registry/Registries'), 'Vehicles'),
  Estimates: lazyNamed(() => import('@/screens/registry/Registries'), 'Estimates'),
  Technicians: lazyNamed(() => import('@/screens/registry/Registries'), 'Technicians'),
  FleetManagement: lazyNamed(() => import('@/screens/registry/Registries'), 'FleetManagement'),
  Appointments: lazyNamed(() => import('@/screens/registry/Appointments'), 'Appointments'),
  // Dotted design names map to sub-routes like /parts-network/requests.
  PartsNetwork: lazyNamed(() => import('@/screens/network/PartsNetwork'), 'PartsNetworkDashboard'),
  'PartsNetwork.Requests': lazyNamed(() => import('@/screens/network/PartsNetwork'), 'PartsNetworkRequests'),
  'PartsNetwork.Quotations': lazyNamed(() => import('@/screens/network/Procurement'), 'PartsNetworkQuotations'),
  'PartsNetwork.Orders': lazyNamed(() => import('@/screens/network/PartsNetwork'), 'PartsNetworkOrders'),
  'PartsNetwork.Members': lazyNamed(() => import('@/screens/network/PartsNetwork'), 'PartsNetworkMembers'),
  'PartsNetwork.Incoming': lazyNamed(() => import('@/screens/network/PartsNetwork'), 'PartsNetworkIncoming'),
  'PartsNetwork.SendRequest': lazyNamed(() => import('@/screens/network/Procurement'), 'PartsNetworkSendRequest'),
  PartsSupplyNetwork: lazyNamed(() => import('@/screens/network/Procurement'), 'PartsSupplyNetwork'),
  ProcurementPortal: lazyNamed(() => import('@/screens/network/Procurement'), 'ProcurementPortal'),
  'ProcurementPortal.Requisitions': lazyNamed(() => import('@/screens/network/Procurement'), 'ProcurementRequisitions'),
  ChartOfAccounts: lazyNamed(() => import('@/screens/accounting/Accounting'), 'ChartOfAccounts'),
  JournalEntries: lazyNamed(() => import('@/screens/accounting/Accounting'), 'JournalEntries'),
  Expenses: lazyNamed(() => import('@/screens/accounting/Accounting'), 'Expenses'),
  Receipts: lazyNamed(() => import('@/screens/accounting/Accounting'), 'Receipts'),
  Departments: lazyNamed(() => import('@/screens/accounting/Accounting'), 'Departments'),
  FinancialReports: lazyNamed(() => import('@/screens/accounting/Reports'), 'FinancialReports'),
  FinancialStatements: lazyNamed(() => import('@/screens/accounting/Reports'), 'FinancialStatements'),
  ExecutiveReports: lazyNamed(() => import('@/screens/accounting/Reports'), 'ExecutiveReports'),
  OperationalReports: lazyNamed(() => import('@/screens/accounting/Reports'), 'OperationalReports'),
  BIDashboard: lazyNamed(() => import('@/screens/accounting/Reports'), 'BIDashboard'),
  LeadPipeline: lazyNamed(() => import('@/screens/crm/Crm'), 'LeadPipeline'),
  Opportunities: lazyNamed(() => import('@/screens/crm/Crm'), 'Opportunities'),
  Campaigns: lazyNamed(() => import('@/screens/crm/Crm'), 'Campaigns'),
  EmailMarketing: lazyNamed(() => import('@/screens/crm/Crm'), 'EmailMarketing'),
  SMSCampaigns: lazyNamed(() => import('@/screens/crm/Crm'), 'SMSCampaigns'),
  WhatsAppCampaigns: lazyNamed(() => import('@/screens/crm/Crm'), 'WhatsAppCampaigns'),
  CustomerSegments: lazyNamed(() => import('@/screens/crm/Crm'), 'CustomerSegments'),
  CRMTasks: lazyNamed(() => import('@/screens/crm/Crm'), 'CRMTasks'),
  AgentRegistry: lazyNamed(() => import('@/screens/crm/Crm'), 'AgentRegistry'),
  AgentDashboard: lazyNamed(() => import('@/screens/crm/Crm'), 'AgentDashboard'),
  ConversationHistory: lazyNamed(() => import('@/screens/crm/Crm'), 'ConversationHistory'),
  Integrations: lazyNamed(() => import('@/screens/crm/Crm'), 'Integrations'),
  Settings: lazyNamed(() => import('@/screens/admin/Settings'), 'Settings'),
  RolesPermissions: lazyNamed(() => import('@/screens/admin/RolesPermissions'), 'RolesPermissions'),
  Profile: lazyNamed(() => import('@/screens/admin/Profile'), 'Profile'),
  NotificationCenter: lazyNamed(() => import('@/screens/admin/NotificationCenter'), 'NotificationCenter'),
  GlobalSearch: lazyNamed(() => import('@/screens/admin/GlobalSearch'), 'GlobalSearch'),
  AuditLog: lazyNamed(() => import('@/screens/admin/AuditLog'), 'AuditLog'),
}

/** Customer-app screens. Rendered in `CustomerAppShell`, not `AppShell`. */
const CUSTOMER_APP_SCREENS: Record<string, ComponentType> = {
  'CustomerApp.Home': lazyNamed(() => import('@/screens/customer-app/CustomerApp'), 'CustomerAppHome'),
  'CustomerApp.Garage': lazyNamed(() => import('@/screens/customer-app/CustomerApp'), 'CustomerAppGarage'),
  'CustomerApp.Appointments': lazyNamed(() => import('@/screens/customer-app/CustomerApp'), 'CustomerAppAppointments'),
  'CustomerApp.ServiceTracking': lazyNamed(() => import('@/screens/customer-app/CustomerApp'), 'CustomerAppServiceTracking'),
  'CustomerApp.Wallet': lazyNamed(() => import('@/screens/customer-app/CustomerApp'), 'CustomerAppWallet'),
  'CustomerApp.Orders': lazyNamed(() => import('@/screens/customer-app/CustomerApp'), 'CustomerAppOrders'),
  'CustomerApp.Marketplace': lazyNamed(() => import('@/screens/customer-app/CustomerApp'), 'CustomerAppMarketplace'),
  'CustomerApp.Notifications': lazyNamed(() => import('@/screens/customer-app/CustomerApp'), 'CustomerAppNotifications'),
  'CustomerApp.Insurance': lazyNamed(() => import('@/screens/customer-app/CustomerApp'), 'CustomerAppInsurance'),
  'CustomerApp.Loans': lazyNamed(() => import('@/screens/customer-app/CustomerApp'), 'CustomerAppLoans'),
  'CustomerApp.Profile': lazyNamed(() => import('@/screens/customer-app/CustomerApp'), 'CustomerAppProfile'),
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
  'auth-extra': lazyBarrel(
    () => import('@/screens/domains/auth-extra'),
    ['Register', 'SSOLogin', 'SocialLogin', 'RoleSelection', 'WorkspaceSelection', 'OrganizationSelection', 'ProfileCompletion', 'InviteAcceptance', 'Onboarding'],
    { ungated: true }
  ),
  dashboard: lazyBarrel(() => import('@/screens/domains/dashboard'), [
    'Dashboard-Home',
    'Dashboard-Main',
    'Calendar',
  ]),
  workshop: lazyBarrel(() => import('@/screens/domains/workshop'), [
    'JobCardDetail',
    'ApprovalInbox',
    'EstimateDetail',
    'AppointmentCalendar',
    'TechnicianSchedule',
    'TechnicianKB',
    'OBDDiagnostics',
    'DiagnosticReport',
    'WorkshopReports',
    'CustomerApproval',
    'Workshop-Calendar',
    'Vehicles-List',
    'Vehicle-History',
    'Vehicle-Inspections',
    'Fleet-Tracking',
    'Towing-Assistance',
  ]),
  crm: lazyBarrel(() => import('@/screens/domains/crm'), [
    'CustomerDetail',
    'VehicleDetail',
    'CustomerFeedback',
    'FleetContract',
    'LeadDetail',
    'CRMCalendar',
    'Customers-List',
  ]),
  parts: lazyBarrel(() => import('@/screens/domains/parts'), ['InventoryReports']),
  procurement: lazyBarrel(() => import('@/screens/domains/procurement'), ['PurchaseOrder']),
  accounting: lazyBarrel(() => import('@/screens/domains/accounting'), [
    'InvoicePreview',
    'TaxManagement',
    'BankReconciliation',
    'Reports',
    'ReportsAnalytics',
    'SalesReports',
    'CustomReports',
    'InsuranceReports',
    'LoanReports',
    'General-Ledger',
    'Trial-Balance',
    'Balance-Sheet',
    'Income-Statement',
    'Cash-Flow-Statement',
    'Accounts-Receivable',
    'Accounts-Payable',
    'Bank-Account-Management',
    'Budget-Management',
    'Capital-Management',
  ]),
  insurance: lazyBarrel(() => import('@/screens/domains/insurance'), ['Insurance-Claims']),
  ai: lazyBarrel(() => import('@/screens/domains/ai'), [
    'AIAssistant',
    'AIAnalytics',
    'PromptLibrary',
    'ModelSettings',
    'KnowledgeBase',
  ]),
  'call-center': lazyBarrel(() => import('@/screens/domains/call-center'), ['CallCenter', 'CallCenter.Logs']),
  admin: lazyBarrel(() => import('@/screens/domains/admin'), [
    'AdvancedSettings',
    'AutomationRules',
    'Backup',
    'Branches',
    'Organizations',
    'Subscription',
    'SuperAdmin',
    'Templates',
    'UsersTeams',
    'WorkflowBuilder',
  ]),
  hr: lazyBarrel(() => import('@/screens/domains/hr'), [
    'HRPayroll',
    'Staff-Directory',
    'HR-Management',
    'Payroll-Management',
    'Timesheet-Management',
    'Timeclock-Payroll',
    'Leave-Requests',
    'Staff-Scheduling',
    'Staff-Performance-Review',
  ]),
  portals: lazyBarrel(
    () => import('@/screens/domains/portals'),
    ['TechnicianPortal', 'TechnicianPortal.JobDetail', 'CustomerPortal', 'CustomerPortal.Booking', 'SupplierPortal', 'SupplierPortal.Orders', 'Kiosk-Check-In'],
    { shell: PortalShell }
  ),
  website: lazyBarrel(
    () => import('@/screens/domains/website'),
    [
      'PublicPortal.Landing',
      'PublicPortal.About',
      'PublicPortal.Services',
      'PublicPortal.Marketplace',
      'PublicPortal.Insurance',
      'PublicPortal.Loans',
      'PublicPortal.Blog',
      'PublicPortal.FAQ',
      'PublicPortal.Contact',
      'PublicPortal.Support',
      'PrivacyPolicy',
      'TermsConditions',
    ],
    { shell: PublicShell, ungated: true }
  ),
})

export function AppRoutes() {
  return (
    // One boundary for the whole table: a lazy screen suspends here to the
    // linear loading bar, never to a heavier stand-in, until its chunk lands.
    <Suspense fallback={<Loading />}>
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
    </Suspense>
  )
}

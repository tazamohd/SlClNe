import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { SCREENS } from '@/data/generated/screens'
import { SPEC_SCREENS } from '@/data/generated/spec-screens'
import { RequireAccess } from './RequireAccess'
import { PendingScreen } from '@/screens/PendingScreen'
import { FEATURE_DEF_BY_ROUTE } from '@/screens/feature/definitions'

/**
 * Route-level code-splitting. Every screen below is loaded on demand via
 * `React.lazy`, so the initial bundle carries only the shell, the router, and
 * this map — not all ~130 screens. Screens are named exports (and several
 * modules export multiple screens), so each factory unwraps the wanted export
 * into the `{ default }` shape `React.lazy` requires. Exports themselves are
 * untouched; only the import mechanism changed.
 */

// auth
const Splash = lazy(() => import('@/screens/auth/Splash').then((m) => ({ default: m.Splash })))
const Welcome = lazy(() => import('@/screens/auth/Welcome').then((m) => ({ default: m.Welcome })))
const LanguageSelection = lazy(() =>
  import('@/screens/auth/LanguageSelection').then((m) => ({ default: m.LanguageSelection })),
)
const RegionSelection = lazy(() =>
  import('@/screens/auth/RegionSelection').then((m) => ({ default: m.RegionSelection })),
)
const Login = lazy(() => import('@/screens/auth/Login').then((m) => ({ default: m.Login })))
const AccountLocked = lazy(() =>
  import('@/screens/auth/StatusScreens').then((m) => ({ default: m.AccountLocked })),
)
const LogoutConfirmation = lazy(() =>
  import('@/screens/auth/StatusScreens').then((m) => ({ default: m.LogoutConfirmation })),
)
const SessionExpired = lazy(() =>
  import('@/screens/auth/StatusScreens').then((m) => ({ default: m.SessionExpired })),
)
const Unauthorized = lazy(() =>
  import('@/screens/auth/StatusScreens').then((m) => ({ default: m.Unauthorized })),
)
const ForgotPassword = lazy(() =>
  import('@/screens/auth/PasswordScreens').then((m) => ({ default: m.ForgotPassword })),
)
const ResetPassword = lazy(() =>
  import('@/screens/auth/PasswordScreens').then((m) => ({ default: m.ResetPassword })),
)
const BiometricSetup = lazy(() =>
  import('@/screens/auth/VerificationScreens').then((m) => ({ default: m.BiometricSetup })),
)
const CreatePIN = lazy(() =>
  import('@/screens/auth/VerificationScreens').then((m) => ({ default: m.CreatePIN })),
)
const OTPVerification = lazy(() =>
  import('@/screens/auth/VerificationScreens').then((m) => ({ default: m.OTPVerification })),
)
const TwoFactorVerification = lazy(() =>
  import('@/screens/auth/VerificationScreens').then((m) => ({ default: m.TwoFactorVerification })),
)
const Register = lazy(() => import('@/screens/auth/Register').then((m) => ({ default: m.Register })))
const RoleSelection = lazy(() =>
  import('@/screens/auth/RoleSelection').then((m) => ({ default: m.RoleSelection })),
)
const SocialLogin = lazy(() =>
  import('@/screens/auth/SocialLogin').then((m) => ({ default: m.SocialLogin })),
)
const SSOLogin = lazy(() => import('@/screens/auth/SSOLogin').then((m) => ({ default: m.SSOLogin })))
const OrganizationSelection = lazy(() =>
  import('@/screens/auth/OrganizationSelection').then((m) => ({ default: m.OrganizationSelection })),
)
const WorkspaceSelection = lazy(() =>
  import('@/screens/auth/WorkspaceSelection').then((m) => ({ default: m.WorkspaceSelection })),
)
const ProfileCompletion = lazy(() =>
  import('@/screens/auth/ProfileCompletion').then((m) => ({ default: m.ProfileCompletion })),
)
const Onboarding = lazy(() =>
  import('@/screens/auth/Onboarding').then((m) => ({ default: m.Onboarding })),
)
const InviteAcceptance = lazy(() =>
  import('@/screens/auth/InviteAcceptance').then((m) => ({ default: m.InviteAcceptance })),
)
const Error404 = lazy(() => import('@/screens/auth/Error404').then((m) => ({ default: m.Error404 })))
const Maintenance = lazy(() =>
  import('@/screens/auth/Maintenance').then((m) => ({ default: m.Maintenance })),
)
const PrivacyPolicy = lazy(() =>
  import('@/screens/auth/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy })),
)
const TermsConditions = lazy(() =>
  import('@/screens/auth/TermsConditions').then((m) => ({ default: m.TermsConditions })),
)

// website (public marketing)
const PublicPortalLanding = lazy(() =>
  import('@/screens/website/Landing').then((m) => ({ default: m.PublicPortalLanding })),
)
const PublicPortalAbout = lazy(() =>
  import('@/screens/website/About').then((m) => ({ default: m.PublicPortalAbout })),
)
const PublicPortalServices = lazy(() =>
  import('@/screens/website/Services').then((m) => ({ default: m.PublicPortalServices })),
)
const PublicPortalMarketplace = lazy(() =>
  import('@/screens/website/Marketplace').then((m) => ({ default: m.PublicPortalMarketplace })),
)
const PublicPortalInsurance = lazy(() =>
  import('@/screens/website/Insurance').then((m) => ({ default: m.PublicPortalInsurance })),
)
const PublicPortalLoans = lazy(() =>
  import('@/screens/website/Loans').then((m) => ({ default: m.PublicPortalLoans })),
)
const PublicPortalBlog = lazy(() =>
  import('@/screens/website/Blog').then((m) => ({ default: m.PublicPortalBlog })),
)
const PublicPortalFAQ = lazy(() =>
  import('@/screens/website/FAQ').then((m) => ({ default: m.PublicPortalFAQ })),
)
const PublicPortalContact = lazy(() =>
  import('@/screens/website/Contact').then((m) => ({ default: m.PublicPortalContact })),
)
const PublicPortalSupport = lazy(() =>
  import('@/screens/website/Support').then((m) => ({ default: m.PublicPortalSupport })),
)

// standalone portals
const CustomerPortal = lazy(() =>
  import('@/screens/portals/CustomerPortal').then((m) => ({ default: m.CustomerPortal })),
)
const CustomerPortalBooking = lazy(() =>
  import('@/screens/portals/CustomerPortal').then((m) => ({ default: m.CustomerPortalBooking })),
)
const SupplierPortal = lazy(() =>
  import('@/screens/portals/SupplierPortal').then((m) => ({ default: m.SupplierPortal })),
)
const SupplierPortalOrders = lazy(() =>
  import('@/screens/portals/SupplierPortal').then((m) => ({ default: m.SupplierPortalOrders })),
)
const TechnicianPortal = lazy(() =>
  import('@/screens/portals/TechnicianPortal').then((m) => ({ default: m.TechnicianPortal })),
)
const TechnicianPortalJobDetail = lazy(() =>
  import('@/screens/portals/TechnicianPortal').then((m) => ({
    default: m.TechnicianPortalJobDetail,
  })),
)
const KioskCheckIn = lazy(() =>
  import('@/screens/portals/KioskCheckIn').then((m) => ({ default: m.KioskCheckIn })),
)

// core / workshop
const Dashboard = lazy(() => import('@/screens/Dashboard').then((m) => ({ default: m.Dashboard })))
const JobCards = lazy(() =>
  import('@/screens/workshop/JobCards').then((m) => ({ default: m.JobCards })),
)
const JobDetail = lazy(() =>
  import('@/screens/workshop/JobDetail').then((m) => ({ default: m.JobDetail })),
)
const JobCardDetail = lazy(() =>
  import('@/screens/workshop/JobCardDetail').then((m) => ({ default: m.JobCardDetail })),
)
const AppointmentCalendar = lazy(() =>
  import('@/screens/workshop/AppointmentCalendar').then((m) => ({ default: m.AppointmentCalendar })),
)
const ApprovalInbox = lazy(() =>
  import('@/screens/workshop/ApprovalInbox').then((m) => ({ default: m.ApprovalInbox })),
)
const CustomerApproval = lazy(() =>
  import('@/screens/workshop/CustomerApproval').then((m) => ({ default: m.CustomerApproval })),
)
const DiagnosticReport = lazy(() =>
  import('@/screens/workshop/DiagnosticReport').then((m) => ({ default: m.DiagnosticReport })),
)
const EstimateDetail = lazy(() =>
  import('@/screens/workshop/EstimateDetail').then((m) => ({ default: m.EstimateDetail })),
)
const OBDDiagnostics = lazy(() =>
  import('@/screens/workshop/OBDDiagnostics').then((m) => ({ default: m.OBDDiagnostics })),
)
const TechnicianKB = lazy(() =>
  import('@/screens/workshop/TechnicianKB').then((m) => ({ default: m.TechnicianKB })),
)
const TechnicianSchedule = lazy(() =>
  import('@/screens/workshop/TechnicianSchedule').then((m) => ({ default: m.TechnicianSchedule })),
)
const WorkshopReports = lazy(() =>
  import('@/screens/workshop/WorkshopReports').then((m) => ({ default: m.WorkshopReports })),
)
const WorkshopCheckIn = lazy(() =>
  import('@/screens/workshop/WorkshopCheckIn').then((m) => ({ default: m.WorkshopCheckIn })),
)
const WorkshopInspection = lazy(() =>
  import('@/screens/workshop/WorkshopInspection').then((m) => ({ default: m.WorkshopInspection })),
)
const WorkshopEstimate = lazy(() =>
  import('@/screens/workshop/WorkshopEstimate').then((m) => ({ default: m.WorkshopEstimate })),
)
const WorkshopQC = lazy(() =>
  import('@/screens/workshop/WorkshopQC').then((m) => ({ default: m.WorkshopQC })),
)
const WorkshopSignature = lazy(() =>
  import('@/screens/workshop/WorkshopSignature').then((m) => ({ default: m.WorkshopSignature })),
)
const WorkshopDelivery = lazy(() =>
  import('@/screens/workshop/WorkshopDelivery').then((m) => ({ default: m.WorkshopDelivery })),
)

// finance
const Invoices = lazy(() =>
  import('@/screens/finance/Invoices').then((m) => ({ default: m.Invoices })),
)
const InvoiceDetail = lazy(() =>
  import('@/screens/finance/InvoiceDetail').then((m) => ({ default: m.InvoiceDetail })),
)
const InvoiceCreate = lazy(() =>
  import('@/screens/finance/InvoiceCreate').then((m) => ({ default: m.InvoiceCreate })),
)
const Payments = lazy(() =>
  import('@/screens/finance/Payments').then((m) => ({ default: m.Payments })),
)

// registry
const Customers = lazy(() =>
  import('@/screens/registry/Registries').then((m) => ({ default: m.Customers })),
)
const Estimates = lazy(() =>
  import('@/screens/registry/Registries').then((m) => ({ default: m.Estimates })),
)
const FleetManagement = lazy(() =>
  import('@/screens/registry/Registries').then((m) => ({ default: m.FleetManagement })),
)
const Technicians = lazy(() =>
  import('@/screens/registry/Registries').then((m) => ({ default: m.Technicians })),
)
const Vehicles = lazy(() =>
  import('@/screens/registry/Registries').then((m) => ({ default: m.Vehicles })),
)
const Appointments = lazy(() =>
  import('@/screens/registry/Appointments').then((m) => ({ default: m.Appointments })),
)
const CustomerDetail = lazy(() =>
  import('@/screens/registry/CustomerDetail').then((m) => ({ default: m.CustomerDetail })),
)
const VehicleDetail = lazy(() =>
  import('@/screens/registry/VehicleDetail').then((m) => ({ default: m.VehicleDetail })),
)
const FleetContract = lazy(() =>
  import('@/screens/registry/FleetContract').then((m) => ({ default: m.FleetContract })),
)

// network / procurement
const PartsNetworkDashboard = lazy(() =>
  import('@/screens/network/PartsNetwork').then((m) => ({ default: m.PartsNetworkDashboard })),
)
const PartsNetworkIncoming = lazy(() =>
  import('@/screens/network/PartsNetwork').then((m) => ({ default: m.PartsNetworkIncoming })),
)
const PartsNetworkMembers = lazy(() =>
  import('@/screens/network/PartsNetwork').then((m) => ({ default: m.PartsNetworkMembers })),
)
const PartsNetworkOrders = lazy(() =>
  import('@/screens/network/PartsNetwork').then((m) => ({ default: m.PartsNetworkOrders })),
)
const PartsNetworkRequests = lazy(() =>
  import('@/screens/network/PartsNetwork').then((m) => ({ default: m.PartsNetworkRequests })),
)
const PartsNetworkQuotations = lazy(() =>
  import('@/screens/network/Procurement').then((m) => ({ default: m.PartsNetworkQuotations })),
)
const PartsNetworkSendRequest = lazy(() =>
  import('@/screens/network/Procurement').then((m) => ({ default: m.PartsNetworkSendRequest })),
)
const PartsSupplyNetwork = lazy(() =>
  import('@/screens/network/Procurement').then((m) => ({ default: m.PartsSupplyNetwork })),
)
const ProcurementPortal = lazy(() =>
  import('@/screens/network/Procurement').then((m) => ({ default: m.ProcurementPortal })),
)
const ProcurementRequisitions = lazy(() =>
  import('@/screens/network/Procurement').then((m) => ({ default: m.ProcurementRequisitions })),
)
const PurchaseOrder = lazy(() =>
  import('@/screens/network/PurchaseOrder').then((m) => ({ default: m.PurchaseOrder })),
)

// accounting
const ChartOfAccounts = lazy(() =>
  import('@/screens/accounting/Accounting').then((m) => ({ default: m.ChartOfAccounts })),
)
const Departments = lazy(() =>
  import('@/screens/accounting/Accounting').then((m) => ({ default: m.Departments })),
)
const Expenses = lazy(() =>
  import('@/screens/accounting/Accounting').then((m) => ({ default: m.Expenses })),
)
const JournalEntries = lazy(() =>
  import('@/screens/accounting/Accounting').then((m) => ({ default: m.JournalEntries })),
)
const Receipts = lazy(() =>
  import('@/screens/accounting/Accounting').then((m) => ({ default: m.Receipts })),
)
const BIDashboard = lazy(() =>
  import('@/screens/accounting/Reports').then((m) => ({ default: m.BIDashboard })),
)
const ExecutiveReports = lazy(() =>
  import('@/screens/accounting/Reports').then((m) => ({ default: m.ExecutiveReports })),
)
const FinancialReports = lazy(() =>
  import('@/screens/accounting/Reports').then((m) => ({ default: m.FinancialReports })),
)
const FinancialStatements = lazy(() =>
  import('@/screens/accounting/Reports').then((m) => ({ default: m.FinancialStatements })),
)
const OperationalReports = lazy(() =>
  import('@/screens/accounting/Reports').then((m) => ({ default: m.OperationalReports })),
)
const BankReconciliation = lazy(() =>
  import('@/screens/accounting/BankReconciliation').then((m) => ({ default: m.BankReconciliation })),
)
const CustomReports = lazy(() =>
  import('@/screens/accounting/CustomReports').then((m) => ({ default: m.CustomReports })),
)
const InsuranceReports = lazy(() =>
  import('@/screens/accounting/InsuranceReports').then((m) => ({ default: m.InsuranceReports })),
)
const InvoicePreview = lazy(() =>
  import('@/screens/accounting/InvoicePreview').then((m) => ({ default: m.InvoicePreview })),
)
const LoanReports = lazy(() =>
  import('@/screens/accounting/LoanReports').then((m) => ({ default: m.LoanReports })),
)
const Reports = lazy(() =>
  import('@/screens/accounting/ReportsHub').then((m) => ({ default: m.Reports })),
)
const ReportsAnalytics = lazy(() =>
  import('@/screens/accounting/ReportsAnalytics').then((m) => ({ default: m.ReportsAnalytics })),
)
const SalesReports = lazy(() =>
  import('@/screens/accounting/SalesReports').then((m) => ({ default: m.SalesReports })),
)
const TaxManagement = lazy(() =>
  import('@/screens/accounting/TaxManagement').then((m) => ({ default: m.TaxManagement })),
)
const InventoryReports = lazy(() =>
  import('@/screens/accounting/InventoryReports').then((m) => ({ default: m.InventoryReports })),
)

// crm
const AgentDashboard = lazy(() =>
  import('@/screens/crm/Crm').then((m) => ({ default: m.AgentDashboard })),
)
const AgentRegistry = lazy(() =>
  import('@/screens/crm/Crm').then((m) => ({ default: m.AgentRegistry })),
)
const Campaigns = lazy(() => import('@/screens/crm/Crm').then((m) => ({ default: m.Campaigns })))
const ConversationHistory = lazy(() =>
  import('@/screens/crm/Crm').then((m) => ({ default: m.ConversationHistory })),
)
const CRMTasks = lazy(() => import('@/screens/crm/Crm').then((m) => ({ default: m.CRMTasks })))
const CustomerSegments = lazy(() =>
  import('@/screens/crm/Crm').then((m) => ({ default: m.CustomerSegments })),
)
const EmailMarketing = lazy(() =>
  import('@/screens/crm/Crm').then((m) => ({ default: m.EmailMarketing })),
)
const Integrations = lazy(() =>
  import('@/screens/crm/Crm').then((m) => ({ default: m.Integrations })),
)
const LeadPipeline = lazy(() =>
  import('@/screens/crm/Crm').then((m) => ({ default: m.LeadPipeline })),
)
const Opportunities = lazy(() =>
  import('@/screens/crm/Crm').then((m) => ({ default: m.Opportunities })),
)
const SMSCampaigns = lazy(() =>
  import('@/screens/crm/Crm').then((m) => ({ default: m.SMSCampaigns })),
)
const WhatsAppCampaigns = lazy(() =>
  import('@/screens/crm/Crm').then((m) => ({ default: m.WhatsAppCampaigns })),
)
const CRMCalendar = lazy(() =>
  import('@/screens/crm/CRMCalendar').then((m) => ({ default: m.CRMCalendar })),
)
const CustomerFeedback = lazy(() =>
  import('@/screens/crm/CustomerFeedback').then((m) => ({ default: m.CustomerFeedback })),
)
const LeadDetail = lazy(() =>
  import('@/screens/crm/LeadDetail').then((m) => ({ default: m.LeadDetail })),
)

// customer-app
const CustomerAppAppointments = lazy(() =>
  import('@/screens/customer-app/CustomerApp').then((m) => ({
    default: m.CustomerAppAppointments,
  })),
)
const CustomerAppGarage = lazy(() =>
  import('@/screens/customer-app/CustomerApp').then((m) => ({ default: m.CustomerAppGarage })),
)
const CustomerAppHome = lazy(() =>
  import('@/screens/customer-app/CustomerApp').then((m) => ({ default: m.CustomerAppHome })),
)
const CustomerAppInsurance = lazy(() =>
  import('@/screens/customer-app/CustomerApp').then((m) => ({ default: m.CustomerAppInsurance })),
)
const CustomerAppLoans = lazy(() =>
  import('@/screens/customer-app/CustomerApp').then((m) => ({ default: m.CustomerAppLoans })),
)
const CustomerAppMarketplace = lazy(() =>
  import('@/screens/customer-app/CustomerApp').then((m) => ({ default: m.CustomerAppMarketplace })),
)
const CustomerAppNotifications = lazy(() =>
  import('@/screens/customer-app/CustomerApp').then((m) => ({
    default: m.CustomerAppNotifications,
  })),
)
const CustomerAppOrders = lazy(() =>
  import('@/screens/customer-app/CustomerApp').then((m) => ({ default: m.CustomerAppOrders })),
)
const CustomerAppProfile = lazy(() =>
  import('@/screens/customer-app/CustomerApp').then((m) => ({ default: m.CustomerAppProfile })),
)
const CustomerAppServiceTracking = lazy(() =>
  import('@/screens/customer-app/CustomerApp').then((m) => ({
    default: m.CustomerAppServiceTracking,
  })),
)
const CustomerAppWallet = lazy(() =>
  import('@/screens/customer-app/CustomerApp').then((m) => ({ default: m.CustomerAppWallet })),
)

// meta / native
const FlowSpec = lazy(() => import('@/screens/meta/Specs').then((m) => ({ default: m.FlowSpec })))
const IndexPage = lazy(() => import('@/screens/meta/Specs').then((m) => ({ default: m.IndexPage })))
const RBACSpec = lazy(() => import('@/screens/meta/Specs').then((m) => ({ default: m.RBACSpec })))
const NativeAndroid = lazy(() =>
  import('@/screens/meta/Native').then((m) => ({ default: m.NativeAndroid })),
)
const NativeIOS = lazy(() =>
  import('@/screens/meta/Native').then((m) => ({ default: m.NativeIOS })),
)

// ui pattern library
const UICardView = lazy(() =>
  import('@/screens/ui/Views').then((m) => ({ default: m.UICardView })),
)
const UIListView = lazy(() =>
  import('@/screens/ui/Views').then((m) => ({ default: m.UIListView })),
)
const UITableView = lazy(() =>
  import('@/screens/ui/Views').then((m) => ({ default: m.UITableView })),
)
const UICalendarView = lazy(() =>
  import('@/screens/ui/ViewsAlt').then((m) => ({ default: m.UICalendarView })),
)
const UIKanbanView = lazy(() =>
  import('@/screens/ui/ViewsAlt').then((m) => ({ default: m.UIKanbanView })),
)
const UITimelineView = lazy(() =>
  import('@/screens/ui/ViewsAlt').then((m) => ({ default: m.UITimelineView })),
)
const UIAttachments = lazy(() =>
  import('@/screens/ui/Media').then((m) => ({ default: m.UIAttachments })),
)
const UIMapView = lazy(() => import('@/screens/ui/Media').then((m) => ({ default: m.UIMapView })))
const UIMediaGallery = lazy(() =>
  import('@/screens/ui/Media').then((m) => ({ default: m.UIMediaGallery })),
)
const UIAdvancedFilters = lazy(() =>
  import('@/screens/ui/Insights').then((m) => ({ default: m.UIAdvancedFilters })),
)
const UICharts = lazy(() =>
  import('@/screens/ui/Insights').then((m) => ({ default: m.UICharts })),
)
const UIExportCenter = lazy(() =>
  import('@/screens/ui/Transfer').then((m) => ({ default: m.UIExportCenter })),
)
const UIImportCenter = lazy(() =>
  import('@/screens/ui/Transfer').then((m) => ({ default: m.UIImportCenter })),
)
const UIEmptyStates = lazy(() =>
  import('@/screens/ui/States').then((m) => ({ default: m.UIEmptyStates })),
)
const UIFormValidation = lazy(() =>
  import('@/screens/ui/States').then((m) => ({ default: m.UIFormValidation })),
)
const UILoadingStates = lazy(() =>
  import('@/screens/ui/States').then((m) => ({ default: m.UILoadingStates })),
)
const UIActivityFeed = lazy(() =>
  import('@/screens/ui/Collaboration').then((m) => ({ default: m.UIActivityFeed })),
)
const UIComments = lazy(() =>
  import('@/screens/ui/Collaboration').then((m) => ({ default: m.UIComments })),
)
const UIMessages = lazy(() =>
  import('@/screens/ui/Collaboration').then((m) => ({ default: m.UIMessages })),
)
const UIModalsActions = lazy(() =>
  import('@/screens/ui/ModalsCore').then((m) => ({ default: m.UIModalsActions })),
)
const UIModalsCRUD = lazy(() =>
  import('@/screens/ui/ModalsCore').then((m) => ({ default: m.UIModalsCRUD })),
)
const UIModalsStatus = lazy(() =>
  import('@/screens/ui/ModalsCore').then((m) => ({ default: m.UIModalsStatus })),
)
const UIModalsCapture = lazy(() =>
  import('@/screens/ui/ModalsFlow').then((m) => ({ default: m.UIModalsCapture })),
)
const UIModalsData = lazy(() =>
  import('@/screens/ui/ModalsFlow').then((m) => ({ default: m.UIModalsData })),
)
const UIModalsLifecycle = lazy(() =>
  import('@/screens/ui/ModalsFlow').then((m) => ({ default: m.UIModalsLifecycle })),
)

// call center
const CallCenter = lazy(() =>
  import('@/screens/callcenter/CallCenter').then((m) => ({ default: m.CallCenter })),
)
const CallCenterLogs = lazy(() =>
  import('@/screens/callcenter/CallCenter').then((m) => ({ default: m.CallCenterLogs })),
)

// admin
const HRPayroll = lazy(() =>
  import('@/screens/admin/HRPayroll').then((m) => ({ default: m.HRPayroll })),
)
const AdvancedSettings = lazy(() =>
  import('@/screens/admin/AdvancedSettings').then((m) => ({ default: m.AdvancedSettings })),
)
const AuditLog = lazy(() =>
  import('@/screens/admin/AuditLog').then((m) => ({ default: m.AuditLog })),
)
const Backup = lazy(() => import('@/screens/admin/Backup').then((m) => ({ default: m.Backup })))
const Branches = lazy(() =>
  import('@/screens/admin/Branches').then((m) => ({ default: m.Branches })),
)
const GlobalSearch = lazy(() =>
  import('@/screens/admin/GlobalSearch').then((m) => ({ default: m.GlobalSearch })),
)
const NotificationCenter = lazy(() =>
  import('@/screens/admin/NotificationCenter').then((m) => ({ default: m.NotificationCenter })),
)
const OEMIntegrations = lazy(() =>
  import('@/screens/admin/OEMIntegrations').then((m) => ({ default: m.OEMIntegrations })),
)
const Organizations = lazy(() =>
  import('@/screens/admin/Organizations').then((m) => ({ default: m.Organizations })),
)
const Profile = lazy(() => import('@/screens/admin/Profile').then((m) => ({ default: m.Profile })))
const RolesPermissions = lazy(() =>
  import('@/screens/admin/RolesPermissions').then((m) => ({ default: m.RolesPermissions })),
)
const Settings = lazy(() =>
  import('@/screens/admin/Settings').then((m) => ({ default: m.Settings })),
)
const Subscription = lazy(() =>
  import('@/screens/admin/Subscription').then((m) => ({ default: m.Subscription })),
)
const SuperAdmin = lazy(() =>
  import('@/screens/admin/SuperAdmin').then((m) => ({ default: m.SuperAdmin })),
)
const SystemIntegrations = lazy(() =>
  import('@/screens/admin/SystemIntegrations').then((m) => ({ default: m.SystemIntegrations })),
)
const Templates = lazy(() =>
  import('@/screens/admin/Templates').then((m) => ({ default: m.Templates })),
)
const UsersTeams = lazy(() =>
  import('@/screens/admin/UsersTeams').then((m) => ({ default: m.UsersTeams })),
)

// ai
const AIAnalytics = lazy(() =>
  import('@/screens/ai/AIAnalytics').then((m) => ({ default: m.AIAnalytics })),
)
const AIAssistant = lazy(() =>
  import('@/screens/ai/AIAssistant').then((m) => ({ default: m.AIAssistant })),
)
const AutomationRules = lazy(() =>
  import('@/screens/ai/AutomationRules').then((m) => ({ default: m.AutomationRules })),
)
const KnowledgeBase = lazy(() =>
  import('@/screens/ai/KnowledgeBase').then((m) => ({ default: m.KnowledgeBase })),
)
const ModelSettings = lazy(() =>
  import('@/screens/ai/ModelSettings').then((m) => ({ default: m.ModelSettings })),
)
const PromptLibrary = lazy(() =>
  import('@/screens/ai/PromptLibrary').then((m) => ({ default: m.PromptLibrary })),
)
const WorkflowBuilder = lazy(() =>
  import('@/screens/ai/WorkflowBuilder').then((m) => ({ default: m.WorkflowBuilder })),
)

// feature
const Inventory = lazy(() =>
  import('@/screens/feature/Inventory').then((m) => ({ default: m.Inventory })),
)
const FeatureScreenView = lazy(() =>
  import('@/screens/feature/FeatureScreenView').then((m) => ({ default: m.FeatureScreenView })),
)

/** Lightweight, brand-consistent fallback shown while a route chunk loads.
 *  Blue only; logical CSS. */
function RouteFallback() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-page"
      role="status"
      aria-live="polite"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-salis-blue border-t-transparent" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}

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
  // The project's own reference pages: flow spec, RBAC matrix, screen index,
  // and the native-shell mockups.
  FlowSpec,
  RBACSpec,
  Index: IndexPage,
  'Native.Android': NativeAndroid,
  'Native.iOS': NativeIOS,
  // Internal pattern library — reference galleries for the design system.
  'UI.ListView': UIListView,
  'UI.TableView': UITableView,
  'UI.CardView': UICardView,
  'UI.KanbanView': UIKanbanView,
  'UI.CalendarView': UICalendarView,
  'UI.TimelineView': UITimelineView,
  'UI.MapView': UIMapView,
  'UI.MediaGallery': UIMediaGallery,
  'UI.Attachments': UIAttachments,
  'UI.Charts': UICharts,
  'UI.AdvancedFilters': UIAdvancedFilters,
  'UI.ExportCenter': UIExportCenter,
  'UI.ImportCenter': UIImportCenter,
  'UI.EmptyStates': UIEmptyStates,
  'UI.LoadingStates': UILoadingStates,
  'UI.FormValidation': UIFormValidation,
  'UI.ActivityFeed': UIActivityFeed,
  'UI.Comments': UIComments,
  'UI.Messages': UIMessages,
  'UI.Modals.CRUD': UIModalsCRUD,
  'UI.Modals.Actions': UIModalsActions,
  'UI.Modals.Status': UIModalsStatus,
  'UI.Modals.Data': UIModalsData,
  'UI.Modals.Capture': UIModalsCapture,
  'UI.Modals.Lifecycle': UIModalsLifecycle,
  CallCenter,
  'CallCenter.Logs': CallCenterLogs,
  CustomerDetail,
  VehicleDetail,
  PurchaseOrder,
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
    <Suspense fallback={<RouteFallback />}>
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
    </Suspense>
  )
}

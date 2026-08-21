# Screen Map — SALIS AUTO

Every screen in the design, grouped by module.
Columns: **Name** (component / route), **Desktop** file, **Mobile** file (if any), **Suggested route**, **Purpose**.

Legend: 🖥 desktop only · 📱 mobile only · 🖥📱 both.

## Core (132 screens)

| Screen | Route | Files | Purpose |
|---|---|---|---|
| **AccountLocked** | `/account-locked` | 🖥📱 `AccountLocked.dc.html` · `AccountLocked.Mobile.dc.html` | Account locked — recover flow |
| **AdvancedSettings** | `/advanced-settings` | 🖥📱 `AdvancedSettings.dc.html` · `AdvancedSettings.Mobile.dc.html` | Power-user settings |
| **AgentDashboard** | `/agent-dashboard` | 🖥📱 `AgentDashboard.dc.html` · `AgentDashboard.Mobile.dc.html` | AI agent runtime dashboard |
| **AgentRegistry** | `/agent-registry` | 🖥📱 `AgentRegistry.dc.html` · `AgentRegistry.Mobile.dc.html` | Deployed AI agents |
| **AIAnalytics** | `/aianalytics` | 🖥📱 `AIAnalytics.dc.html` · `AIAnalytics.Mobile.dc.html` | AI usage & cost analytics |
| **AIAssistant** | `/aiassistant` | 🖥📱 `AIAssistant.dc.html` · `AIAssistant.Mobile.dc.html` | Conversational AI helper |
| **AppointmentCalendar** | `/appointment-calendar` | 🖥📱 `AppointmentCalendar.dc.html` · `AppointmentCalendar.Mobile.dc.html` | Calendar view of bookings |
| **Appointments** | `/appointments` | 🖥📱 `Appointments.dc.html` · `Appointments.Mobile.dc.html` | Booking list |
| **ApprovalInbox** | `/approval-inbox` | 🖥 `ApprovalInbox.dc.html` | Approve/reject items above your delegated limit |
| **AuditLog** | `/audit-log` | 🖥📱 `AuditLog.dc.html` · `AuditLog.Mobile.dc.html` | System audit trail |
| **AutomationRules** | `/automation-rules` | 🖥📱 `AutomationRules.dc.html` · `AutomationRules.Mobile.dc.html` | Trigger-based automations |
| **Backup** | `/backup` | 🖥📱 `Backup.dc.html` · `Backup.Mobile.dc.html` | Backups & exports |
| **BankReconciliation** | `/bank-reconciliation` | 🖥📱 `BankReconciliation.dc.html` · `BankReconciliation.Mobile.dc.html` | Bank feed reconciliation |
| **BIDashboard** | `/bidashboard` | 🖥📱 `BIDashboard.dc.html` · `BIDashboard.Mobile.dc.html` | BI dashboard — executive charts |
| **BiometricSetup** | `/biometric-setup` | 🖥📱 `BiometricSetup.dc.html` · `BiometricSetup.Mobile.dc.html` | Enrol Face ID / Touch ID |
| **Branches** | `/branches` | 🖥📱 `Branches.dc.html` · `Branches.Mobile.dc.html` | Branch registry |
| **CallCenter** | `/call-center` | 🖥 `CallCenter.dc.html` | Contact-centre queue + call logs |
| **Campaigns** | `/campaigns` | 🖥📱 `Campaigns.dc.html` · `Campaigns.Mobile.dc.html` | Marketing campaigns |
| **ChartOfAccounts** | `/chart-of-accounts` | 🖥📱 `ChartOfAccounts.dc.html` · `ChartOfAccounts.Mobile.dc.html` | Accounting — chart of accounts |
| **ConversationHistory** | `/conversation-history` | 🖥📱 `ConversationHistory.dc.html` · `ConversationHistory.Mobile.dc.html` | AI conversation logs |
| **CreatePIN** | `/create-pin` | 🖥📱 `CreatePIN.dc.html` · `CreatePIN.Mobile.dc.html` | Choose device PIN |
| **CRMCalendar** | `/crmcalendar` | 🖥📱 `CRMCalendar.dc.html` · `CRMCalendar.Mobile.dc.html` | CRM calendar view |
| **CRMTasks** | `/crmtasks` | 🖥📱 `CRMTasks.dc.html` · `CRMTasks.Mobile.dc.html` | CRM task queue |
| **CustomerApproval** | `/customer-approval` | 🖥 `CustomerApproval.dc.html` | Customer signs off on estimate (e-signature, itemised) |
| **CustomerDetail** | `/customer-detail` | 🖥📱 `CustomerDetail.dc.html` · `CustomerDetail.Mobile.dc.html` | Customer 360 (contact, vehicles, jobs, invoices) |
| **CustomerFeedback** | `/customer-feedback` | 🖥📱 `CustomerFeedback.dc.html` · `CustomerFeedback.Mobile.dc.html` | CSAT / feedback |
| **CustomerPortal** | `/customer-portal` | 🖥 `CustomerPortal.dc.html` | Customer self-service portal |
| **Customers** | `/customers` | 🖥📱 `Customers.dc.html` · `Customers.Mobile.dc.html` | Customer directory |
| **CustomerSegments** | `/customer-segments` | 🖥📱 `CustomerSegments.dc.html` · `CustomerSegments.Mobile.dc.html` | Customer segmentation |
| **CustomReports** | `/custom-reports` | 🖥📱 `CustomReports.dc.html` · `CustomReports.Mobile.dc.html` | User-built report builder |
| **Dashboard** | `/dashboard` | 🖥📱 `Dashboard.dc.html` · `Dashboard.Mobile.dc.html` | Role-adaptive KPI home |
| **Departments** | `/departments` | 🖥📱 `Departments.dc.html` · `Departments.Mobile.dc.html` | Departments per branch |
| **DiagnosticReport** | `/diagnostic-report` | 🖥 `DiagnosticReport.dc.html` | OBD report generation + share to reception / customer / storekeeper / supervisor |
| **EmailMarketing** | `/email-marketing` | 🖥📱 `EmailMarketing.dc.html` · `EmailMarketing.Mobile.dc.html` | Email marketing composer |
| **Error404** | `/error404` | 🖥📱 `Error404.dc.html` · `Error404.Mobile.dc.html` | 404 — page not found |
| **EstimateDetail** | `/estimate-detail` | 🖥📱 `EstimateDetail.dc.html` · `EstimateDetail.Mobile.dc.html` | Full estimate — line items |
| **Estimates** | `/estimates` | 🖥📱 `Estimates.dc.html` · `Estimates.Mobile.dc.html` | Estimate list |
| **ExecutiveReports** | `/executive-reports` | 🖥📱 `ExecutiveReports.dc.html` · `ExecutiveReports.Mobile.dc.html` | Board / CEO KPIs |
| **Expenses** | `/expenses` | 🖥📱 `Expenses.dc.html` · `Expenses.Mobile.dc.html` | Expense claims / ledger |
| **FinancialReports** | `/financial-reports` | 🖥📱 `FinancialReports.dc.html` · `FinancialReports.Mobile.dc.html` | Balance sheet, P&L, cash flow, trial balance |
| **FinancialStatements** | `/financial-statements` | 🖥📱 `FinancialStatements.dc.html` · `FinancialStatements.Mobile.dc.html` | IFRS financial statements |
| **FleetContract** | `/fleet-contract` | 🖥📱 `FleetContract.dc.html` · `FleetContract.Mobile.dc.html` | Fleet contract detail |
| **FleetManagement** | `/fleet-management` | 🖥📱 `FleetManagement.dc.html` · `FleetManagement.Mobile.dc.html` | Fleet accounts overview |
| **FlowSpec** | `/flow-spec` | 🖥 `FlowSpec.dc.html` | Cross-screen workflow specification (approvals, notifications) |
| **ForgotPassword** | `/forgot-password` | 🖥📱 `ForgotPassword.dc.html` · `ForgotPassword.Mobile.dc.html` | Password recovery start |
| **GlobalSearch** | `/global-search` | 🖥📱 `GlobalSearch.dc.html` · `GlobalSearch.Mobile.dc.html` | Cross-entity search |
| **HRPayroll** | `/hrpayroll` | 🖥📱 `HRPayroll.dc.html` · `HRPayroll.Mobile.dc.html` | (no purpose listed yet) |
| **Index** | `/index` | 🖥 `Index.dc.html` | Full screen index for internal navigation |
| **InsuranceReports** | `/insurance-reports` | 🖥📱 `InsuranceReports.dc.html` · `InsuranceReports.Mobile.dc.html` | Insurance claim reports |
| **Integrations** | `/integrations` | 🖥📱 `Integrations.dc.html` · `Integrations.Mobile.dc.html` | 3rd-party integrations |
| **Inventory** | `/inventory` | 🖥📱 `Inventory.dc.html` · `Inventory.Mobile.dc.html` | Spare-parts stock |
| **InventoryReports** | `/inventory-reports` | 🖥📱 `InventoryReports.dc.html` · `InventoryReports.Mobile.dc.html` | Stock reports |
| **InviteAcceptance** | `/invite-acceptance` | 🖥📱 `InviteAcceptance.dc.html` · `InviteAcceptance.Mobile.dc.html` | Accept a team invite |
| **InvoiceCreate** | `/invoice-create` | 🖥📱 `InvoiceCreate.dc.html` · `InvoiceCreate.Mobile.dc.html` | Compose a new invoice |
| **InvoiceDetail** | `/invoice-detail` | 🖥📱 `InvoiceDetail.dc.html` · `InvoiceDetail.Mobile.dc.html` | Full invoice — line items + totals + ZATCA |
| **InvoicePreview** | `/invoice-preview` | 🖥📱 `InvoicePreview.dc.html` · `InvoicePreview.Mobile.dc.html` | PDF-style invoice preview |
| **Invoices** | `/invoices` | 🖥📱 `Invoices.dc.html` · `Invoices.Mobile.dc.html` | Invoice ledger |
| **JobCardDetail** | `/job-card-detail` | 🖥📱 `JobCardDetail.dc.html` · `JobCardDetail.Mobile.dc.html` | Alias for JobDetail |
| **JobCards** | `/job-cards` | 🖥📱 `JobCards.dc.html` · `JobCards.Mobile.dc.html` | List of active job cards |
| **JobDetail** | `/job-detail` | 🖥📱 `JobDetail.dc.html` · `JobDetail.Mobile.dc.html` | Deep-dive on a single job |
| **JournalEntries** | `/journal-entries` | 🖥📱 `JournalEntries.dc.html` · `JournalEntries.Mobile.dc.html` | Accounting — journal entries |
| **KioskCheckIn** | `/kiosk-check-in` | 🖥 `KioskCheckIn.dc.html` | In-branch tablet for walk-ins |
| **KnowledgeBase** | `/knowledge-base` | 🖥📱 `KnowledgeBase.dc.html` · `KnowledgeBase.Mobile.dc.html` | Knowledge base articles |
| **LanguageSelection** | `/language-selection` | 🖥📱 `LanguageSelection.dc.html` · `LanguageSelection.Mobile.dc.html` | Pick UI language + notification opt-in |
| **LeadDetail** | `/lead-detail` | 🖥📱 `LeadDetail.dc.html` · `LeadDetail.Mobile.dc.html` | CRM lead deep-dive |
| **LeadPipeline** | `/lead-pipeline` | 🖥📱 `LeadPipeline.dc.html` · `LeadPipeline.Mobile.dc.html` | Kanban lead pipeline |
| **LoanReports** | `/loan-reports` | 🖥📱 `LoanReports.dc.html` · `LoanReports.Mobile.dc.html` | Auto-loan / financing reports |
| **Login** | `/login` | 🖥📱 `Login.dc.html` · `Login.Mobile.dc.html` | Sign in — 14 demo roles fill credentials |
| **LogoutConfirmation** | `/logout-confirmation` | 🖥📱 `LogoutConfirmation.dc.html` · `LogoutConfirmation.Mobile.dc.html` | Confirm sign-out |
| **Maintenance** | `/maintenance` | 🖥📱 `Maintenance.dc.html` · `Maintenance.Mobile.dc.html` | System maintenance banner |
| **ModelSettings** | `/model-settings` | 🖥📱 `ModelSettings.dc.html` · `ModelSettings.Mobile.dc.html` | AI model config |
| **NotificationCenter** | `/notification-center` | 🖥📱 `NotificationCenter.dc.html` · `NotificationCenter.Mobile.dc.html` | System notifications inbox |
| **OBDDiagnostics** | `/obddiagnostics` | 🖥 `OBDDiagnostics.dc.html` | Live vehicle sensor stream + DTC lookup |
| **OEMIntegrations** | `/oemintegrations` | 🖥 `OEMIntegrations.dc.html` | OEM diagnostic tool integrations |
| **Onboarding** | `/onboarding` | 🖥📱 `Onboarding.dc.html` · `Onboarding.Mobile.dc.html` | Multi-step onboarding |
| **OperationalReports** | `/operational-reports` | 🖥📱 `OperationalReports.dc.html` · `OperationalReports.Mobile.dc.html` | Ops-level reports |
| **Opportunities** | `/opportunities` | 🖥📱 `Opportunities.dc.html` · `Opportunities.Mobile.dc.html` | CRM opportunities |
| **Organizations** | `/organizations` | 🖥📱 `Organizations.dc.html` · `Organizations.Mobile.dc.html` | Multi-tenant orgs list |
| **OrganizationSelection** | `/organization-selection` | 🖥📱 `OrganizationSelection.dc.html` · `OrganizationSelection.Mobile.dc.html` | Pick which organization to enter |
| **OTPVerification** | `/otpverification` | 🖥📱 `OTPVerification.dc.html` · `OTPVerification.Mobile.dc.html` | 6-digit OTP verify (email or SMS) |
| **PartsNetwork** | `/parts-network` | 🖥 `PartsNetwork.dc.html` | B2B parts marketplace (RFQ send, quotes in/out, members) |
| **PartsSupplyNetwork** | `/parts-supply-network` | 🖥 `PartsSupplyNetwork.dc.html` | Admin-side supply-chain view |
| **Payments** | `/payments` | 🖥📱 `Payments.dc.html` · `Payments.Mobile.dc.html` | Payments received / recorded |
| **PrivacyPolicy** | `/privacy-policy` | 🖥📱 `PrivacyPolicy.dc.html` · `PrivacyPolicy.Mobile.dc.html` | Legal — privacy policy |
| **ProcurementPortal** | `/procurement-portal` | 🖥 `ProcurementPortal.dc.html` | External procurement view (requisitions) |
| **Profile** | `/profile` | 🖥📱 `Profile.dc.html` · `Profile.Mobile.dc.html` | User profile |
| **ProfileCompletion** | `/profile-completion` | 🖥📱 `ProfileCompletion.dc.html` · `ProfileCompletion.Mobile.dc.html` | Complete missing profile fields |
| **PromptLibrary** | `/prompt-library` | 🖥📱 `PromptLibrary.dc.html` · `PromptLibrary.Mobile.dc.html` | Curated prompts |
| **PurchaseOrder** | `/purchase-order` | 🖥📱 `PurchaseOrder.dc.html` · `PurchaseOrder.Mobile.dc.html` | Purchase order detail |
| **RBACSpec** | `/rbacspec` | 🖥 `RBACSpec.dc.html` | Reference specification for the RBAC engine |
| **Receipts** | `/receipts` | 🖥📱 `Receipts.dc.html` · `Receipts.Mobile.dc.html` | Payment receipts |
| **RegionSelection** | `/region-selection` | 🖥📱 `RegionSelection.dc.html` · `RegionSelection.Mobile.dc.html` | Choose country / region |
| **Register** | `/register` | 🖥📱 `Register.dc.html` · `Register.Mobile.dc.html` | Public sign-up (customer or supplier) |
| **Reports** | `/reports` | 🖥📱 `Reports.dc.html` · `Reports.Mobile.dc.html` | Standard operational reports |
| **ReportsAnalytics** | `/reports-analytics` | 🖥📱 `ReportsAnalytics.dc.html` · `ReportsAnalytics.Mobile.dc.html` | Analytics overview |
| **ResetPassword** | `/reset-password` | 🖥📱 `ResetPassword.dc.html` · `ResetPassword.Mobile.dc.html` | Password recovery complete |
| **RoleSelection** | `/role-selection` | 🖥📱 `RoleSelection.dc.html` · `RoleSelection.Mobile.dc.html` | Post-invite role picker |
| **RolesPermissions** | `/roles-permissions` | 🖥📱 `RolesPermissions.dc.html` · `RolesPermissions.Mobile.dc.html` | Editable RBAC matrix (14 roles × 28 modules) |
| **SalesReports** | `/sales-reports` | 🖥📱 `SalesReports.dc.html` · `SalesReports.Mobile.dc.html` | Revenue reports |
| **SessionExpired** | `/session-expired` | 🖥📱 `SessionExpired.dc.html` · `SessionExpired.Mobile.dc.html` | Re-authenticate after idle |
| **Settings** | `/settings` | 🖥📱 `Settings.dc.html` · `Settings.Mobile.dc.html` | General tenant settings |
| **SMSCampaigns** | `/smscampaigns` | 🖥📱 `SMSCampaigns.dc.html` · `SMSCampaigns.Mobile.dc.html` | SMS campaign composer |
| **SocialLogin** | `/social-login` | 🖥📱 `SocialLogin.dc.html` · `SocialLogin.Mobile.dc.html` | Google/Apple sign-in |
| **Splash** | `/splash` | 🖥📱 `Splash.dc.html` · `Splash.Mobile.dc.html` | App launch — brand splash |
| **SSOLogin** | `/ssologin` | 🖥📱 `SSOLogin.dc.html` · `SSOLogin.Mobile.dc.html` | Enterprise SSO handshake |
| **Subscription** | `/subscription` | 🖥📱 `Subscription.dc.html` · `Subscription.Mobile.dc.html` | Tenant subscription & billing |
| **SuperAdmin** | `/super-admin` | 🖥 `SuperAdmin.dc.html` | Platform control plane (multi-garage tenant admin) |
| **SupplierPortal** | `/supplier-portal` | 🖥 `SupplierPortal.dc.html` | External supplier view (orders, quotes) |
| **SystemIntegrations** | `/system-integrations` | 🖥 `SystemIntegrations.dc.html` | ERP / accounting / SMS integrations |
| **TaxManagement** | `/tax-management` | 🖥📱 `TaxManagement.dc.html` · `TaxManagement.Mobile.dc.html` | VAT / tax config (15% Saudi) |
| **TechnicianKB** | `/technician-kb` | 🖥 `TechnicianKB.dc.html` | Technician knowledge base (procedures, torque, DTCs) |
| **TechnicianPortal** | `/technician-portal` | 🖥 `TechnicianPortal.dc.html` | Mobile-first workflow for on-floor techs |
| **Technicians** | `/technicians` | 🖥📱 `Technicians.dc.html` · `Technicians.Mobile.dc.html` | Technician directory |
| **TechnicianSchedule** | `/technician-schedule` | 🖥📱 `TechnicianSchedule.dc.html` · `TechnicianSchedule.Mobile.dc.html` | Assign & schedule technicians |
| **Templates** | `/templates` | 🖥📱 `Templates.dc.html` · `Templates.Mobile.dc.html` | Reusable message/document templates |
| **TermsConditions** | `/terms-conditions` | 🖥📱 `TermsConditions.dc.html` · `TermsConditions.Mobile.dc.html` | Legal — terms & conditions |
| **TwoFactorVerification** | `/two-factor-verification` | 🖥📱 `TwoFactorVerification.dc.html` · `TwoFactorVerification.Mobile.dc.html` | TOTP / SMS 2FA |
| **Unauthorized** | `/unauthorized` | 🖥📱 `Unauthorized.dc.html` · `Unauthorized.Mobile.dc.html` | 403 — access denied |
| **UsersTeams** | `/users-teams` | 🖥📱 `UsersTeams.dc.html` · `UsersTeams.Mobile.dc.html` | Users & teams |
| **VehicleDetail** | `/vehicle-detail` | 🖥📱 `VehicleDetail.dc.html` · `VehicleDetail.Mobile.dc.html` | Vehicle 360 (history, docs, insurance) |
| **Vehicles** | `/vehicles` | 🖥📱 `Vehicles.dc.html` · `Vehicles.Mobile.dc.html` | Vehicle registry |
| **Welcome** | `/welcome` | 🖥📱 `Welcome.dc.html` · `Welcome.Mobile.dc.html` | First-run welcome |
| **WhatsAppCampaigns** | `/whats-app-campaigns` | 🖥📱 `WhatsAppCampaigns.dc.html` · `WhatsAppCampaigns.Mobile.dc.html` | WhatsApp campaign composer |
| **WorkflowBuilder** | `/workflow-builder` | 🖥📱 `WorkflowBuilder.dc.html` · `WorkflowBuilder.Mobile.dc.html` | Visual workflow designer |
| **WorkshopCheckIn** | `/workshop-check-in` | 🖥📱 `WorkshopCheckIn.dc.html` · `WorkshopCheckIn.Mobile.dc.html` | Vehicle intake at the workshop |
| **WorkshopDelivery** | `/workshop-delivery` | 🖥📱 `WorkshopDelivery.dc.html` · `WorkshopDelivery.Mobile.dc.html` | Handover & final invoice |
| **WorkshopEstimate** | `/workshop-estimate` | 🖥📱 `WorkshopEstimate.dc.html` · `WorkshopEstimate.Mobile.dc.html` | Draft estimate for customer approval |
| **WorkshopInspection** | `/workshop-inspection` | 🖥📱 `WorkshopInspection.dc.html` · `WorkshopInspection.Mobile.dc.html` | Multi-point inspection |
| **WorkshopQC** | `/workshop-qc` | 🖥📱 `WorkshopQC.dc.html` · `WorkshopQC.Mobile.dc.html` | Quality-control checklist |
| **WorkshopReports** | `/workshop-reports` | 🖥📱 `WorkshopReports.dc.html` · `WorkshopReports.Mobile.dc.html` | Workshop throughput reports |
| **WorkshopSignature** | `/workshop-signature` | 🖥📱 `WorkshopSignature.dc.html` · `WorkshopSignature.Mobile.dc.html` | Customer signature on delivery |
| **WorkspaceSelection** | `/workspace-selection` | 🖥📱 `WorkspaceSelection.dc.html` · `WorkspaceSelection.Mobile.dc.html` | Pick which workspace to enter |

## CustomerApp (11 screens)

| Screen | Route | Files | Purpose |
|---|---|---|---|
| **CustomerApp.Appointments** | `/customer-app/appointments` | 🖥 `CustomerApp.Appointments.dc.html` | Booking list |
| **CustomerApp.Garage** | `/customer-app/garage` | 🖥 `CustomerApp.Garage.dc.html` | Customer mobile app — Garage |
| **CustomerApp.Home** | `/customer-app/home` | 🖥 `CustomerApp.Home.dc.html` | Customer mobile app — Home |
| **CustomerApp.Insurance** | `/customer-app/insurance` | 🖥 `CustomerApp.Insurance.dc.html` | Customer mobile app — Insurance |
| **CustomerApp.Loans** | `/customer-app/loans` | 🖥 `CustomerApp.Loans.dc.html` | Customer mobile app — Loans |
| **CustomerApp.Marketplace** | `/customer-app/marketplace` | 🖥 `CustomerApp.Marketplace.dc.html` | Customer mobile app — Marketplace |
| **CustomerApp.Notifications** | `/customer-app/notifications` | 🖥 `CustomerApp.Notifications.dc.html` | Customer mobile app — Notifications |
| **CustomerApp.Orders** | `/customer-app/orders` | 🖥 `CustomerApp.Orders.dc.html` | Customer mobile app — Orders |
| **CustomerApp.Profile** | `/customer-app/profile` | 🖥 `CustomerApp.Profile.dc.html` | User profile |
| **CustomerApp.ServiceTracking** | `/customer-app/service-tracking` | 🖥 `CustomerApp.ServiceTracking.dc.html` | Customer mobile app — ServiceTracking |
| **CustomerApp.Wallet** | `/customer-app/wallet` | 🖥 `CustomerApp.Wallet.dc.html` | Customer mobile app — Wallet |

## PublicPortal (31 screens)

| Screen | Route | Files | Purpose |
|---|---|---|---|
| **PublicPortal.About** | `/public-portal/about` | 🖥 `PublicPortal.About.dc.html` | Public website — About |
| **PublicPortal.Accounting** | `/public-portal/accounting` | 🖥 | Public website — Accounting product page |
| **PublicPortal.AI** | `/public-portal/ai` | 🖥 | Public website — AI & Automation product page |
| **PublicPortal.Blog** | `/public-portal/blog` | 🖥 `PublicPortal.Blog.dc.html` | Public website — Blog |
| **PublicPortal.Careers** | `/public-portal/careers` | 🖥 | Public website — Careers |
| **PublicPortal.Contact** | `/public-portal/contact` | 🖥 `PublicPortal.Contact.dc.html` | Public website — Contact |
| **PublicPortal.CRM** | `/public-portal/crm` | 🖥 | Public website — CRM product page |
| **PublicPortal.CustomerPortal** | `/public-portal/customer-portal` | 🖥 | Public website — Customer Portal product page |
| **PublicPortal.FAQ** | `/public-portal/faq` | 🖥 `PublicPortal.FAQ.dc.html` | Public website — FAQ |
| **PublicPortal.Features** | `/public-portal/features` | 🖥 | Public website — Features overview |
| **PublicPortal.Fleet** | `/public-portal/fleet` | 🖥 | Public website — Fleet Management product page |
| **PublicPortal.Industries** | `/public-portal/industries` | 🖥 | Public website — Industries served |
| **PublicPortal.Insurance** | `/public-portal/insurance` | 🖥 `PublicPortal.Insurance.dc.html` | Public website — Insurance |
| **PublicPortal.Integrations** | `/public-portal/integrations` | 🖥 | Public website — Integration partners |
| **PublicPortal.Landing** | `/public-portal/landing` | 🖥 `PublicPortal.Landing.dc.html` | Public website — Landing |
| **PublicPortal.Loans** | `/public-portal/loans` | 🖥 `PublicPortal.Loans.dc.html` | Public website — Loans |
| **PublicPortal.Marketplace** | `/public-portal/marketplace` | 🖥 `PublicPortal.Marketplace.dc.html` | Public website — Marketplace |
| **PublicPortal.MiniERP** | `/public-portal/mini-erp` | 🖥 | Public website — Mini ERP product page |
| **PublicPortal.Pricing** | `/public-portal/pricing` | 🖥 | Public website — Pricing plans |
| **PublicPortal.Products** | `/public-portal/products` | 🖥 | Public website — Product suite overview |
| **PublicPortal.RequestDemo** | `/public-portal/request-demo` | 🖥 | Public website — Request a demo form |
| **PublicPortal.Services** | `/public-portal/services` | 🖥 `PublicPortal.Services.dc.html` | Public website — Services |
| **PublicPortal.Solutions** | `/public-portal/solutions` | 🖥 | Public website — Solutions overview |
| **PublicPortal.SpareParts** | `/public-portal/spare-parts` | 🖥 | Public website — Spare Parts product page |
| **PublicPortal.SupplierPortal** | `/public-portal/supplier-portal` | 🖥 | Public website — Supplier Portal product page |
| **PublicPortal.Support** | `/public-portal/support` | 🖥 `PublicPortal.Support.dc.html` | Public website — Support |
| **PublicPortal.TechnicianPortal** | `/public-portal/technician-portal` | 🖥 | Public website — Technician Portal product page |
| **PublicPortal.Workshop** | `/public-portal/workshop` | 🖥 | Public website — Workshop Management product page |
| **CookiePolicy** | `/cookie-policy` | 🖥 | Legal — cookie policy |

## UI (25 screens)

| Screen | Route | Files | Purpose |
|---|---|---|---|
| **UI.ActivityFeed** | `/ui/activity-feed` | 🖥 `UI.ActivityFeed.dc.html` | UI pattern reference — ActivityFeed |
| **UI.AdvancedFilters** | `/ui/advanced-filters` | 🖥 `UI.AdvancedFilters.dc.html` | UI pattern reference — AdvancedFilters |
| **UI.Attachments** | `/ui/attachments` | 🖥 `UI.Attachments.dc.html` | UI pattern reference — Attachments |
| **UI.CalendarView** | `/ui/calendar-view` | 🖥 `UI.CalendarView.dc.html` | UI pattern reference — CalendarView |
| **UI.CardView** | `/ui/card-view` | 🖥 `UI.CardView.dc.html` | UI pattern reference — CardView |
| **UI.Charts** | `/ui/charts` | 🖥 `UI.Charts.dc.html` | UI pattern reference — Charts |
| **UI.Comments** | `/ui/comments` | 🖥 `UI.Comments.dc.html` | UI pattern reference — Comments |
| **UI.EmptyStates** | `/ui/empty-states` | 🖥 `UI.EmptyStates.dc.html` | UI pattern reference — EmptyStates |
| **UI.ExportCenter** | `/ui/export-center` | 🖥 `UI.ExportCenter.dc.html` | UI pattern reference — ExportCenter |
| **UI.FormValidation** | `/ui/form-validation` | 🖥 `UI.FormValidation.dc.html` | UI pattern reference — FormValidation |
| **UI.ImportCenter** | `/ui/import-center` | 🖥 `UI.ImportCenter.dc.html` | UI pattern reference — ImportCenter |
| **UI.KanbanView** | `/ui/kanban-view` | 🖥 `UI.KanbanView.dc.html` | UI pattern reference — KanbanView |
| **UI.ListView** | `/ui/list-view` | 🖥 `UI.ListView.dc.html` | UI pattern reference — ListView |
| **UI.LoadingStates** | `/ui/loading-states` | 🖥 `UI.LoadingStates.dc.html` | UI pattern reference — LoadingStates |
| **UI.MapView** | `/ui/map-view` | 🖥 `UI.MapView.dc.html` | UI pattern reference — MapView |
| **UI.MediaGallery** | `/ui/media-gallery` | 🖥 `UI.MediaGallery.dc.html` | UI pattern reference — MediaGallery |
| **UI.Messages** | `/ui/messages` | 🖥 `UI.Messages.dc.html` | UI pattern reference — Messages |
| **UI.Modals.Actions** | `/ui/modals/actions` | 🖥 `UI.Modals.Actions.dc.html` | Modal pattern reference — Actions |
| **UI.Modals.Capture** | `/ui/modals/capture` | 🖥 `UI.Modals.Capture.dc.html` | Modal pattern reference — Capture |
| **UI.Modals.CRUD** | `/ui/modals/crud` | 🖥 `UI.Modals.CRUD.dc.html` | Modal pattern reference — CRUD |
| **UI.Modals.Data** | `/ui/modals/data` | 🖥 `UI.Modals.Data.dc.html` | Modal pattern reference — Data |
| **UI.Modals.Lifecycle** | `/ui/modals/lifecycle` | 🖥 `UI.Modals.Lifecycle.dc.html` | Modal pattern reference — Lifecycle |
| **UI.Modals.Status** | `/ui/modals/status` | 🖥 `UI.Modals.Status.dc.html` | Modal pattern reference — Status |
| **UI.TableView** | `/ui/table-view` | 🖥 `UI.TableView.dc.html` | UI pattern reference — TableView |
| **UI.TimelineView** | `/ui/timeline-view` | 🖥 `UI.TimelineView.dc.html` | UI pattern reference — TimelineView |

## Native (2 screens)

| Screen | Route | Files | Purpose |
|---|---|---|---|
| **Native.Android** | `/native/android` | 🖥 `Native.Android.dc.html` | Native shell frame — Android |
| **Native.iOS** | `/native/i-os` | 🖥 `Native.iOS.dc.html` | Native shell frame — iOS |

## CallCenter (1 screens)

| Screen | Route | Files | Purpose |
|---|---|---|---|
| **CallCenter.Logs** | `/call-center/logs` | 🖥 `CallCenter.Logs.dc.html` | (no purpose listed yet) |

## CustomerPortal (1 screens)

| Screen | Route | Files | Purpose |
|---|---|---|---|
| **CustomerPortal.Booking** | `/customer-portal/booking` | 🖥 `CustomerPortal.Booking.dc.html` | (no purpose listed yet) |

## PartsNetwork (6 screens)

| Screen | Route | Files | Purpose |
|---|---|---|---|
| **PartsNetwork.Incoming** | `/parts-network/incoming` | 🖥 `PartsNetwork.Incoming.dc.html` | (no purpose listed yet) |
| **PartsNetwork.Members** | `/parts-network/members` | 🖥 `PartsNetwork.Members.dc.html` | (no purpose listed yet) |
| **PartsNetwork.Orders** | `/parts-network/orders` | 🖥 `PartsNetwork.Orders.dc.html` | (no purpose listed yet) |
| **PartsNetwork.Quotations** | `/parts-network/quotations` | 🖥 `PartsNetwork.Quotations.dc.html` | (no purpose listed yet) |
| **PartsNetwork.Requests** | `/parts-network/requests` | 🖥 `PartsNetwork.Requests.dc.html` | (no purpose listed yet) |
| **PartsNetwork.SendRequest** | `/parts-network/send-request` | 🖥 `PartsNetwork.SendRequest.dc.html` | (no purpose listed yet) |

## ProcurementPortal (1 screens)

| Screen | Route | Files | Purpose |
|---|---|---|---|
| **ProcurementPortal.Requisitions** | `/procurement-portal/requisitions` | 🖥 `ProcurementPortal.Requisitions.dc.html` | (no purpose listed yet) |

## SupplierPortal (1 screens)

| Screen | Route | Files | Purpose |
|---|---|---|---|
| **SupplierPortal.Orders** | `/supplier-portal/orders` | 🖥 `SupplierPortal.Orders.dc.html` | (no purpose listed yet) |

## TechnicianPortal (1 screens)

| Screen | Route | Files | Purpose |
|---|---|---|---|
| **TechnicianPortal.JobDetail** | `/technician-portal/job-detail` | 🖥 `TechnicianPortal.JobDetail.dc.html` | Deep-dive on a single job |


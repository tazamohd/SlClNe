// Generates tracker-data.json from the repository — never hand-maintained.
// Source of truth: app/src/data/generated/{screens,spec-screens}.ts + app/src/routes/index.tsx
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const app = path.resolve(here, '../../app')
const read = (p) => fs.readFileSync(path.join(app, p), 'utf8')
const grab = (p) => { const s = read(p); const i = s.indexOf('= ['); const j = s.lastIndexOf(']'); return JSON.parse(s.slice(i + 2, j + 1)) }

const SCREENS = grab('src/data/generated/screens.ts')
const SPEC = grab('src/data/generated/spec-screens.ts')
const routes = read('src/routes/index.tsx')
const defs = read('src/screens/feature/definitions.ts')

const implemented = new Set()
for (const m of routes.matchAll(/(?:^|\n)\s+'([A-Za-z][\w.]*)':/g)) implemented.add(m[1])
for (const m of routes.matchAll(/(?:^|\n)\s+([A-Z][\w]*),/g)) implemented.add(m[1])
const kitRoutes = new Set([...defs.matchAll(/route: '([^']+)'/g)].map((m) => m[1]))

/** Plan domain assignment. First match wins; order matters. */
const RULES = [
  ['ui',          /^UI\./,                                    'Shared UI system',        'Part 2.3'],
  ['reference',   /^(Index|FlowSpec|RBACSpec)$/,              'Reference artefacts',     'Part 5.2'],
  ['website',     /^PublicPortal\./,                          'Public website',          'G11'],
  ['portals',     /^(CustomerPortal|TechnicianPortal|SupplierPortal|ProcurementPortal|KioskCheckIn|Native|CallCenter)/, 'Portals & kiosk', 'G10'],
  ['customerapp', /^CustomerApp\./,                           'Customer mobile app',     'G10'],
  ['auth',        /^(Splash|Welcome|LanguageSelection|RegionSelection|Login|Register|SSOLogin|SocialLogin|ForgotPassword|ResetPassword|OTPVerification|TwoFactorVerification|CreatePIN|BiometricSetup|RoleSelection|WorkspaceSelection|OrganizationSelection|ProfileCompletion|InviteAcceptance|Onboarding|TermsConditions|PrivacyPolicy|Maintenance|Error404|Unauthorized|SessionExpired|AccountLocked|LogoutConfirmation)$/, 'Auth & onboarding', 'G3'],
  ['workshop',    /^(Dashboard|JobCards|JobDetail|JobCardDetail|Workshop|Appointments|AppointmentCalendar|OBDDiagnostics|DiagnosticReport|TechnicianKB|TechnicianSchedule|Technicians|Estimates|EstimateDetail|ApprovalInbox|CustomerApproval|WorkshopReports)/, 'Workshop & Mini ERP', 'G5'],
  ['crm',         /^(Customers|CustomerDetail|CustomerFeedback|Vehicles|VehicleDetail|FleetManagement|FleetContract|Lead|Opportunities|Campaigns|EmailMarketing|SMSCampaigns|WhatsAppCampaigns|CustomerSegments|CRM)/, 'Customers, vehicles & CRM', 'G4/G8'],
  ['parts',       /^(Inventory|Parts)/,                       'Parts & inventory',       'G6'],
  ['procurement', /^(Procurement|PurchaseOrder)/,             'Procurement',             'G6'],
  ['accounting',  /^(Invoice|Invoices|Payments|ChartOfAccounts|JournalEntries|Expenses|Receipts|Departments|BankReconciliation|TaxManagement|HRPayroll|Financial|Executive|Operational|BIDashboard|Reports|ReportsAnalytics|CustomReports|SalesReports|InsuranceReports|LoanReports|InventoryReports)/, 'Accounting & reporting', 'G7'],
  ['ai',          /^(AI|Agent|ConversationHistory|PromptLibrary|KnowledgeBase|WorkflowBuilder|AutomationRules|ModelSettings)/, 'AI & automation', 'G9'],
  ['admin',       /^(Organizations|Branches|UsersTeams|RolesPermissions|Templates|Settings|AdvancedSettings|Backup|Subscription|SuperAdmin|SystemIntegrations|OEMIntegrations|Integrations|AuditLog|GlobalSearch|NotificationCenter|Profile)/, 'Administration', 'G9'],
]

const domainOf = (name) => (RULES.find(([, re]) => re.test(name)) ?? ['other', null, 'Unclassified', '—'])

const domains = new Map()
const push = (id, label, group, item) => {
  if (!domains.has(id)) domains.set(id, { id, label, group, items: [] })
  domains.get(id).items.push(item)
}

for (const s of SCREENS) {
  const [id, , label, group] = domainOf(s.name)
  push(id, label, group, {
    name: s.name,
    route: s.route,
    status: implemented.has(s.name) ? 'built' : 'pending',
    mobile: s.hasMobile ? 'designed' : 'responsive',
    // A built screen with a designed mobile layout still owes that layout.
    mobileDone: false,
    source: 'design',
  })
}

for (const s of SPEC) {
  if (s.designScreen) continue
  push('featuremap', 'Feature map (no design)', 'G12', {
    name: s.title,
    route: s.route,
    status: kitRoutes.has(s.route) ? 'kit' : 'pending',
    mobile: 'responsive',
    mobileDone: false,
    source: 'spec',
  })
}

const order = ['workshop','crm','parts','procurement','accounting','ai','admin','auth','portals','customerapp','website','ui','featuremap','reference','other']
const out = {
  generatedAt: null, // stamped by the caller — keeps this script deterministic
  domains: order.filter((id) => domains.has(id)).map((id) => domains.get(id)),
}
out.totals = out.domains.reduce((a, d) => {
  for (const i of d.items) {
    a.total++
    if (i.status === 'built' || i.status === 'kit') a.built++
    if (i.mobile === 'designed') a.designedMobile++
  }
  return a
}, { total: 0, built: 0, designedMobile: 0 })

process.stdout.write(JSON.stringify(out, null, 2))

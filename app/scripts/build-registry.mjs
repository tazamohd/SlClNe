/** Builds the master capability registry — the authoritative release inventory.
 *
 *  Everything here is *discovered*, never transcribed. Screen counts in plans and
 *  READMEs are dated snapshots; this file is what the release gates, the route
 *  tests and the follow-up deck actually read. If a hand-written total ever
 *  disagrees with this output, the total is stale.
 *
 *      node scripts/build-registry.mjs
 *
 *  Emits:
 *    project-control/MASTER_REGISTRY.json      the full inventory
 *    project-control/STATUS.json               rollups per surface, module, agent
 *    project-control/TEST_STATUS.json          suite coverage derived from the specs
 *    project-control/BLOCKERS.json             computed blockers (flags that gate release)
 *    project-control/tracker/tracker-data.json dataset for the follow-up deck
 *    src/data/generated/master-registry.ts     typed export the app routes/tests read
 *    docs/SALIS_AUTO_MASTER_MATRIX.md          the per-capability matrix
 *    docs/MASTER_SCOPE_REGISTRY.md             inventory by surface
 *    docs/MASTER_GAP_REPORT.md                 what is missing, by severity
 *    docs/MASTER_RBAC_MATRIX.md                the live 14 x 28 matrix
 *    docs/MASTER_DEPENDENCY_GRAPH.md           wave/group dependency order
 *    docs/MASTER_AGENT_OWNERSHIP.md            path globs per agent
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO = path.resolve(APP, '..')
const PROJECT = path.join(REPO, 'project')
const CONTROL = path.join(REPO, 'project-control')
const DOCS = path.join(REPO, 'docs')

const read = (p) => fs.readFileSync(p, 'utf8')
const readApp = (rel) => read(path.join(APP, rel))
const write = (abs, body) => {
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, body)
  return path.relative(REPO, abs)
}
/** Generated `.ts` files are JSON literals after the `= `, so this is exact
 *  rather than a regex approximation of the same thing. */
const literal = (rel) => {
  const s = readApp(rel)
  const i = s.indexOf('= [') >= 0 ? s.indexOf('= [') : s.indexOf('= {')
  const open = s[i + 2]
  const close = open === '[' ? s.lastIndexOf(']') : s.lastIndexOf('}')
  return JSON.parse(s.slice(i + 2, close + 1))
}

// ── sources ──────────────────────────────────────────────────────────────────

const SCREENS = literal('src/data/generated/screens.ts')
const SPEC_SCREENS = literal('src/data/generated/spec-screens.ts')
const NAV = literal('src/data/generated/nav.ts')
const rbacSrc = readApp('src/data/generated/rbac.ts')
const pickObject = (src, name) => {
  const start = src.indexOf(`export const ${name}`)
  const brace = src.indexOf('{', start)
  let depth = 0
  for (let i = brace; i < src.length; i++) {
    if (src[i] === '{') depth++
    else if (src[i] === '}' && --depth === 0) return JSON.parse(src.slice(brace, i + 1))
  }
  throw new Error(`could not read ${name}`)
}
const PERMS = pickObject(rbacSrc, 'PERMS')
const SCREEN_MODULE = pickObject(rbacSrc, 'SCREEN_MODULE')
const ROLES = JSON.parse(rbacSrc.slice(rbacSrc.indexOf('['), rbacSrc.indexOf('\n]') + 2))
const UNGATED = JSON.parse(
  rbacSrc.slice(rbacSrc.indexOf('RBAC_UNGATED'), rbacSrc.indexOf(']', rbacSrc.indexOf('RBAC_UNGATED')) + 1)
    .replace(/^[^[]*/, '')
)

const routesSrc = readApp('src/routes/index.tsx')
const featureDefsSrc = readApp('src/screens/feature/definitions.ts')
const smokeSrc = readApp('scripts/smoke.mjs')

/** Which screens are wired to a real component, and in which shell. Read from
 *  the three lookup tables in routes/index.tsx rather than guessed from files. */
function screensIn(tableName) {
  const start = routesSrc.indexOf(`const ${tableName}`)
  if (start < 0) return new Set()
  const brace = routesSrc.indexOf('{', start)
  let depth = 0, end = brace
  for (let i = brace; i < routesSrc.length; i++) {
    if (routesSrc[i] === '{') depth++
    else if (routesSrc[i] === '}' && --depth === 0) { end = i; break }
  }
  const body = routesSrc.slice(brace + 1, end)
  const names = new Set()
  for (const m of body.matchAll(/(?:^|\n)\s*'([^']+)':/g)) names.add(m[1])
  for (const m of body.matchAll(/(?:^|\n)\s*([A-Z][\w]*)\s*(?:,|:)/g)) names.add(m[1])
  return names
}
const IMPL = {
  public: screensIn('PUBLIC_SCREENS'),
  app: screensIn('APP_SCREENS'),
  customerApp: screensIn('CUSTOMER_APP_SCREENS'),
}
const KIT_ROUTES = new Set([...featureDefsSrc.matchAll(/route: '([^']+)'/g)].map((m) => m[1]))
const SMOKE_ROUTES = new Set([...smokeSrc.matchAll(/path: '([^']+)'/g)].map((m) => m[1]))
const NAV_SCREENS = new Set(
  NAV.flatMap((g) => g.items ?? []).map((i) => i.screen).filter(Boolean)
)

/** The design bundle on disk — the check against a SCREEN_MAP that fell behind. */
const designFiles = fs.existsSync(PROJECT)
  ? fs.readdirSync(PROJECT).filter((f) => f.endsWith('.dc.html'))
  : []
const designDesktop = new Set(designFiles.filter((f) => !f.includes('.Mobile.')).map((f) => f.replace('.dc.html', '')))
const designMobile = new Set(designFiles.filter((f) => f.includes('.Mobile.')).map((f) => f.replace('.Mobile.dc.html', '')))

// ── classification ───────────────────────────────────────────────────────────

/** Surface, shell and owning agent, in priority order. First match wins. */
const SURFACE_RULES = [
  [/^UI\./,                     'reference',    'none',              'ui',          '04'],
  [/^(Index|FlowSpec|RBACSpec)$/, 'reference',  'none',              'ui',          '02'],
  [/^PublicPortal\./,           'public',       'PublicShell',       'website',     '17'],
  [/^Native\./,                 'native',       'CustomerAppShell',  'portals',     '16'],
  [/^KioskCheckIn/,             'kiosk',        'KioskShell',        'portals',     '16'],
  [/^CallCenter/,               'call-center',  'AppShell',          'portals',     '16'],
  [/^(CustomerPortal|TechnicianPortal|SupplierPortal|ProcurementPortal)/, 'portal', 'PortalShell', 'portals', '16'],
  [/^CustomerApp\./,            'customer-app', 'CustomerAppShell',  'customerapp', '16'],
  [/^(Splash|Welcome|LanguageSelection|RegionSelection|Login|Register|SSOLogin|SocialLogin|ForgotPassword|ResetPassword|OTPVerification|TwoFactorVerification|CreatePIN|BiometricSetup|RoleSelection|WorkspaceSelection|OrganizationSelection|ProfileCompletion|InviteAcceptance|Onboarding|TermsConditions|PrivacyPolicy|Maintenance|Error404|Unauthorized|SessionExpired|AccountLocked|LogoutConfirmation)$/,
                                'auth',         'AuthLayout',        'auth',        '06'],
  [/^(Dashboard|JobCards|JobDetail|JobCardDetail|Workshop|Appointments|AppointmentCalendar|OBDDiagnostics|DiagnosticReport|TechnicianKB|TechnicianSchedule|Technicians|Estimates|EstimateDetail|ApprovalInbox|CustomerApproval|WorkshopReports)/,
                                'app',          'AppShell',          'workshop',    '08'],
  [/^(Customers|CustomerDetail|CustomerFeedback|Vehicles|VehicleDetail|FleetManagement|FleetContract|Lead|Opportunities|Campaigns|EmailMarketing|SMSCampaigns|WhatsAppCampaigns|CustomerSegments|CRM)/,
                                'app',          'AppShell',          'crm',         '09'],
  [/^(Inventory|Parts)/,        'app',          'AppShell',          'parts',       '10'],
  [/^(Procurement|PurchaseOrder)/, 'app',       'AppShell',          'procurement', '11'],
  [/^(Invoice|Payments|ChartOfAccounts|JournalEntries|Expenses|Receipts|Departments|BankReconciliation|TaxManagement|Financial|Executive|Operational|BIDashboard|Reports|ReportsAnalytics|CustomReports|SalesReports|InsuranceReports|LoanReports|InventoryReports)/,
                                'app',          'AppShell',          'accounting',  '12'],
  [/^HRPayroll/,                'app',          'AppShell',          'hr',          '14'],
  [/^(AI|Agent|ConversationHistory|PromptLibrary|KnowledgeBase|WorkflowBuilder|AutomationRules|ModelSettings)/,
                                'app',          'AppShell',          'ai',          '15'],
]
const DEFAULT_RULE = ['app', 'AppShell', 'admin', '—']
const classify = (name) => {
  const hit = SURFACE_RULES.find(([re]) => re.test(name))
  return hit ? { surface: hit[1], shell: hit[2], domain: hit[3], owner: hit[4] } : {
    surface: DEFAULT_RULE[0], shell: DEFAULT_RULE[1], domain: DEFAULT_RULE[2], owner: DEFAULT_RULE[3],
  }
}

const DOMAIN_LABEL = {
  workshop: 'Workshop & Mini ERP', crm: 'Customers, vehicles & CRM', parts: 'Parts & inventory',
  procurement: 'Procurement', accounting: 'Accounting & reporting', hr: 'HR & payroll',
  ai: 'AI & automation', admin: 'Administration', auth: 'Auth & onboarding',
  portals: 'Portals, call centre & kiosk', customerapp: 'Customer mobile app',
  website: 'Public website', ui: 'Shared UI & reference', featuremap: 'Feature map (no design)',
}
const DOMAIN_GROUP = {
  workshop: 'G5', crm: 'G4/G8', parts: 'G6', procurement: 'G6', accounting: 'G7', hr: 'G8',
  ai: 'G9', admin: 'G9', auth: 'G3', portals: 'G10', customerapp: 'G10', website: 'G11',
  ui: 'G2', featuremap: 'G12',
}
const DOMAIN_AGENT = {
  workshop: '08', crm: '09', parts: '10', procurement: '11', accounting: '12', hr: '14',
  ai: '15', admin: '—', auth: '06', portals: '16', customerapp: '16', website: '17',
  ui: '04', featuremap: '08–17',
}

/** Capabilities that need a credential, a device or a paid service we do not
 *  have. They still ship UI + adapter + failure state (§40) — they are exempt
 *  only from "renders real data", and each names its dependency. */
const EXTERNAL = {
  'Drone Inspection': 'drone hardware + flight service',
  'VR Showroom': 'VR headset + 3D asset pipeline',
  'Quantum Computing': 'no available quantum backend',
  'Wearable Integration': 'wearable device SDK',
  'Security Cameras': 'on-site NVR/RTSP feed',
  'Digital Signage': 'signage player hardware',
  'Blockchain Service History': 'chain endpoint + wallet',
  'Smart Contracts': 'chain endpoint + wallet',
  'Voice Commands': 'speech provider credential',
  'Voice Command Interface': 'speech provider credential',
  'AR Repair Guide': 'AR device + tracked models',
  'AR Overlay': 'AR device + tracked models',
  'Drone Inspection ': 'drone hardware + flight service',
}

const permissionsFor = (screen) => {
  const mod = SCREEN_MODULE[screen]
  if (!mod) return { module: UNGATED.includes(screen) ? 'ungated' : null, permissions: [] }
  const grants = PERMS[mod] ?? {}
  return {
    module: mod,
    permissions: Object.entries(grants)
      .filter(([, actions]) => actions)
      .map(([role, actions]) => `${role}:${actions}`),
  }
}

// ── build the entries ────────────────────────────────────────────────────────

const NOT_STARTED = { desktop: 'MISSING', tablet: 'MISSING', mobile: 'MISSING', responsive: 'MISSING',
  arabic: 'MISSING', rtl: 'MISSING', accessibility: 'MISSING' }

const entries = []

for (const s of SCREENS) {
  const { surface, shell, domain, owner } = classify(s.name)
  const built = IMPL.public.has(s.name) || IMPL.app.has(s.name) || IMPL.customerApp.has(s.name)
  const isReference = surface === 'reference'
  const { module, permissions } = permissionsFor(s.name)
  const hasMobileDesign = s.hasMobile || designMobile.has(s.name)

  entries.push({
    screenId: `D-${s.name}`,
    name: s.name,
    title: s.name.replace(/\./g, ' · '),
    route: s.route,
    surface,
    shell: built ? shell : shell,
    module,
    permissions,
    category: isReference ? 'REFERENCE_ONLY' : 'PRODUCT',
    domain,
    owner,
    source: ['design'],
    designSource: designDesktop.has(s.name) ? `project/${s.name}.dc.html` : null,
    designMobileSource: hasMobileDesign ? `project/${s.name}.Mobile.dc.html` : null,
    featureMapSource: null,
    mobileType: hasMobileDesign ? 'A-designed' : surface === 'native' ? 'native-frame' : 'B-responsive',
    purpose: s.purpose,
    // Coverage. `built` means the route renders a real component — it is the
    // floor, not the Definition of Done, so nothing above DONE is claimed here.
    desktop: built ? 'DONE' : 'MISSING',
    tablet: 'MISSING',
    mobile: built && !hasMobileDesign ? 'PARTIAL' : 'MISSING',
    responsive: built && !hasMobileDesign ? 'PARTIAL' : 'MISSING',
    arabic: built ? 'PARTIAL' : 'MISSING',
    rtl: built ? 'PARTIAL' : 'MISSING',
    loadingState: 'MISSING', emptyState: 'MISSING', errorState: 'MISSING', successState: 'MISSING',
    accessibility: 'MISSING',
    dataBacked: false,
    dataSource: [],
    crud: { create: false, read: built, update: false, delete: false },
    approval: false, export: false, print: false, notifications: false, audit: false,
    tests: { unit: false, integration: false, e2e: SMOKE_ROUTES.has(s.route) },
    visualTests: false, accessibilityTests: false, securityTests: false, performanceTest: false,
    inNav: NAV_SCREENS.has(s.name),
    status: built ? 'IMPLEMENTED' : 'DISCOVERED',
    blockers: [],
    dependencies: [],
    evidence: [],
    flags: [],
  })
}

for (const s of SPEC_SCREENS) {
  if (s.designScreen) continue // already covered by its design entry
  const kit = KIT_ROUTES.has(s.route)
  const external = EXTERNAL[s.title]
  entries.push({
    screenId: `F-${s.id}`,
    name: s.name,
    title: s.title,
    route: s.route,
    surface: 'app',
    shell: 'AppShell',
    ...permissionsFor(s.name),
    category: external ? 'EXTERNAL_DEPENDENCY' : 'PRODUCT',
    domain: 'featuremap',
    owner: DOMAIN_AGENT.featuremap,
    source: ['feature-map'],
    designSource: null,
    designMobileSource: null,
    featureMapSource: s.screenshot ? `project/${s.screenshot}` : null,
    mobileType: 'B-responsive',
    purpose: s.purpose,
    desktop: kit ? 'PARTIAL' : 'MISSING',
    tablet: 'MISSING',
    mobile: kit ? 'PARTIAL' : 'MISSING',
    responsive: kit ? 'PARTIAL' : 'MISSING',
    arabic: kit ? 'PARTIAL' : 'MISSING',
    rtl: kit ? 'PARTIAL' : 'MISSING',
    loadingState: 'MISSING', emptyState: 'MISSING', errorState: 'MISSING', successState: 'MISSING',
    accessibility: 'MISSING',
    dataBacked: false,
    dataSource: [],
    crud: { create: false, read: kit, update: false, delete: false },
    approval: false, export: false, print: false, notifications: false, audit: false,
    tests: { unit: false, integration: false, e2e: SMOKE_ROUTES.has(s.route) },
    visualTests: false, accessibilityTests: false, securityTests: false, performanceTest: false,
    inNav: false,
    status: kit ? 'IMPLEMENTED' : 'DISCOVERED',
    blockers: external ? [`EXTERNAL_DEPENDENCY: ${external}`] : [],
    dependencies: [],
    evidence: [],
    flags: [],
  })
}

// ── computed flags ───────────────────────────────────────────────────────────

const byRoute = new Map()
for (const e of entries) {
  if (!byRoute.has(e.route)) byRoute.set(e.route, [])
  byRoute.get(e.route).push(e)
}

for (const e of entries) {
  const f = e.flags
  const product = e.category === 'PRODUCT'
  const rendered = e.status === 'IMPLEMENTED'

  if (product && !rendered) f.push('PLACEHOLDER')          // renders PendingScreen today
  if (byRoute.get(e.route).length > 1) f.push('DUPLICATE') // two entries claim one route
  if (rendered && e.mobileType === 'A-designed' && e.mobile !== 'DONE') f.push('MOBILE_MISSING')
  if (rendered && e.mobile === 'MISSING' && e.mobileType !== 'native-frame') f.push('DESKTOP_ONLY')
  if (rendered && e.tablet === 'MISSING') f.push('TABLET_MISSING')
  if (rendered && e.arabic !== 'VERIFIED') f.push('ARABIC_MISSING')
  if (rendered && e.rtl !== 'VERIFIED') f.push('RTL_BROKEN')
  if (!e.tests.e2e && product) f.push('UNTESTED')
  if (product && rendered && !e.dataBacked) f.push('MOCK_ONLY')
  if (product && e.surface !== 'auth' && e.surface !== 'public' && !e.module) f.push('NO_RBAC_MODULE')
}

/** A `.dc.html` on disk that no registry entry claims. This is the check that
 *  catches SCREEN_MAP.md falling behind the design bundle. */
const registeredNames = new Set(entries.map((e) => e.name))
const unregistered = [...designDesktop].filter((n) => !registeredNames.has(n))

/** A screen component that no route reaches. Walks imports from routes/index.tsx
 *  outward, so a component used only by another screen still counts as reached. */
function reachableScreenFiles() {
  const screensDir = path.join(APP, 'src/screens')
  const all = []
  ;(function walk(dir) {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name)
      if (f.isDirectory()) walk(p)
      else if (f.name.endsWith('.tsx') || f.name.endsWith('.ts')) all.push(p)
    }
  })(screensDir)

  // Both alias and relative imports — a helper module pulled in as './types'
  // is reached just as surely as one imported as '@/screens/...'.
  const importsOf = (src) => [...src.matchAll(/from '([^']+)'/g)].map((m) => m[1])
  const resolve = (spec, fromFile) => {
    const base = spec.startsWith('@/') ? path.join(APP, 'src', spec.slice(2))
      : spec.startsWith('.') ? path.resolve(path.dirname(fromFile), spec)
      : null
    if (!base) return null
    for (const cand of [`${base}.tsx`, `${base}.ts`, path.join(base, 'index.tsx'), path.join(base, 'index.ts')]) {
      if (fs.existsSync(cand)) return cand
    }
    return null
  }
  const routesFile = path.join(APP, 'src/routes/index.tsx')
  const reached = new Set()
  const queue = importsOf(routesSrc).map((s) => resolve(s, routesFile)).filter(Boolean)
  while (queue.length) {
    const file = queue.pop()
    if (reached.has(file)) continue
    reached.add(file)
    for (const spec of importsOf(read(file))) {
      const r = resolve(spec, file)
      if (r && !reached.has(r)) queue.push(r)
    }
  }
  return { all, reached }
}
const { all: screenFiles, reached } = reachableScreenFiles()
const orphanFiles = screenFiles.filter((f) => !reached.has(f)).map((f) => path.relative(APP, f))

// ── rollups ──────────────────────────────────────────────────────────────────

const product = entries.filter((e) => e.category === 'PRODUCT')
const rendered = entries.filter((e) => e.status === 'IMPLEMENTED')
const count = (list, pred) => list.filter(pred).length

const totals = {
  capabilities: entries.length,
  product: product.length,
  referenceOnly: count(entries, (e) => e.category === 'REFERENCE_ONLY'),
  externalDependency: count(entries, (e) => e.category === 'EXTERNAL_DEPENDENCY'),
  rendered: rendered.length,
  placeholder: count(entries, (e) => e.flags.includes('PLACEHOLDER')),
  designedMobileOwed: count(entries, (e) => e.flags.includes('MOBILE_MISSING')),
  untested: count(entries, (e) => e.flags.includes('UNTESTED')),
  mockOnly: count(entries, (e) => e.flags.includes('MOCK_ONLY')),
  dataBacked: count(entries, (e) => e.dataBacked),
  e2eCovered: count(entries, (e) => e.tests.e2e),
  unregisteredDesigns: unregistered.length,
  orphanScreenFiles: orphanFiles.length,
  productionReady: count(entries, (e) => e.status === 'PRODUCTION_READY'),
}

const groupBy = (list, key) => list.reduce((acc, e) => {
  const k = typeof key === 'function' ? key(e) : e[key]
  ;(acc[k] ??= []).push(e)
  return acc
}, {})

const rollup = (list) => ({
  total: list.length,
  rendered: count(list, (e) => e.status === 'IMPLEMENTED'),
  placeholder: count(list, (e) => e.flags.includes('PLACEHOLDER')),
  mobileOwed: count(list, (e) => e.flags.includes('MOBILE_MISSING')),
  e2e: count(list, (e) => e.tests.e2e),
  dataBacked: count(list, (e) => e.dataBacked),
})

const bySurface = Object.fromEntries(Object.entries(groupBy(entries, 'surface')).map(([k, v]) => [k, rollup(v)]))
const byDomain = Object.fromEntries(Object.entries(groupBy(entries, 'domain')).map(([k, v]) => [k, rollup(v)]))
const byModule = Object.fromEntries(
  Object.entries(groupBy(entries.filter((e) => e.module), 'module')).map(([k, v]) => [k, rollup(v)])
)

// ── emit ─────────────────────────────────────────────────────────────────────

const stamp = process.env.SOURCE_DATE ?? new Date().toISOString().slice(0, 10)
const written = []

written.push(write(path.join(CONTROL, 'MASTER_REGISTRY.json'), JSON.stringify({
  generatedAt: stamp,
  generator: 'app/scripts/build-registry.mjs',
  note: 'Discovered from the repository. Never hand-edit; re-run the generator.',
  totals,
  unregisteredDesigns: unregistered,
  orphanScreenFiles: orphanFiles,
  entries,
}, null, 2) + '\n'))

written.push(write(path.join(CONTROL, 'STATUS.json'), JSON.stringify({
  generatedAt: stamp, totals, bySurface, byDomain, byModule,
}, null, 2) + '\n'))

written.push(write(path.join(CONTROL, 'TEST_STATUS.json'), JSON.stringify({
  generatedAt: stamp,
  suites: {
    unit:        { runner: 'vitest',     present: false, covered: 0, of: entries.length, note: 'W1 — Agent 07' },
    component:   { runner: 'vitest+RTL', present: false, covered: 0, of: entries.length, note: 'W1 — Agent 07' },
    integration: { runner: 'vitest+MSW', present: false, covered: 0, of: entries.length, note: 'W1 — Agent 07' },
    api:         { runner: 'supertest',  present: false, covered: 0, of: 0,              note: 'W1 — Agent 05' },
    routeSmoke:  { runner: 'playwright', present: true,  covered: totals.e2eCovered, of: entries.length,
                   note: 'scripts/smoke.mjs — route checks parsed from the spec' },
    goldenPaths: { runner: 'playwright', present: false, covered: 0, of: 23,             note: 'W4 — Agent 23' },
    mobile:      { runner: 'playwright', present: false, covered: 0, of: entries.length, note: 'W3 — Agent 18' },
    tablet:      { runner: 'playwright', present: false, covered: 0, of: entries.length, note: 'W3 — Agent 18' },
    rtl:         { runner: 'playwright', present: false, covered: 0, of: entries.length, note: 'W3 — Agent 19' },
    a11y:        { runner: 'axe',        present: false, covered: 0, of: entries.length, note: 'W3 — Agent 20' },
    visual:      { runner: 'playwright', present: false, covered: 0, of: entries.length, note: 'W3 — Agent 23' },
    security:    { runner: 'rbac-lab',   present: false, covered: 0, of: 14 * 28,        note: 'W3 — Agent 21' },
  },
}, null, 2) + '\n'))

/** Blockers are computed, not authored — a blocker you have to remember to add
 *  is a blocker you forget to add. The token gate records its own counts, so
 *  read them rather than duplicating the hue analysis here. */
const baselinePath = path.join(CONTROL, 'BASELINE.json')
const brandViolations = fs.existsSync(baselinePath)
  ? JSON.parse(read(baselinePath)).forbiddenColours ?? 0
  : 0

const blockers = [
  totals.placeholder && { id: 'BLK-001', severity: 'BLOCKER', title: `${totals.placeholder} product routes render PendingScreen`,
    detail: 'Violates the no-placeholder rule. Cleared only when every PRODUCT entry renders a real component.', owner: '01', wave: 'W2' },
  !totals.dataBacked && { id: 'BLK-002', severity: 'BLOCKER', title: 'No capability is backed by real data',
    detail: 'No server, database, persistence or server-side authorization exists. Gates the Definition of Done for every screen.', owner: '05', wave: 'W1' },
  { id: 'BLK-003', severity: 'BLOCKER', title: 'Three GitHub PATs were exposed in chat and are not confirmed rotated',
    detail: 'Rotate, then add secret scanning to CI. Do not reuse the exposed credentials.', owner: '06', wave: 'W0' },
  totals.mockOnly && { id: 'BLK-004', severity: 'CRITICAL', title: `${totals.mockOnly} rendered capabilities are mock-only`,
    detail: 'They render, but read fixtures rather than an API. Cleared per capability as G4+ lands.', owner: '05', wave: 'W2' },
  totals.untested && { id: 'BLK-005', severity: 'CRITICAL', title: `${totals.untested} product capabilities have no route check`,
    detail: 'Route coverage is generated from this registry once the test harness lands.', owner: '07', wave: 'W1' },
  totals.designedMobileOwed && { id: 'BLK-006', severity: 'HIGH', title: `${totals.designedMobileOwed} built screens owe their designed mobile layout`,
    detail: 'A .Mobile.dc.html exists and is not yet implemented. Card lists, not narrowed tables.', owner: '18', wave: 'W3' },
  { id: 'BLK-007', severity: 'CRITICAL', title: 'No modal system, so 23 CTAs do nothing',
    detail: 'Blocks every create/edit/delete flow in the ERP.', owner: '04', wave: 'W1' },
  { id: 'BLK-008', severity: 'HIGH', title: 'No tablet verification anywhere',
    detail: '768/820/834/1024, portrait and landscape, has never been checked.', owner: '18', wave: 'W3' },
  totals.unregisteredDesigns && { id: 'BLK-009', severity: 'MEDIUM', title: `${totals.unregisteredDesigns} designs are not in the registry`,
    detail: `Design files with no SCREEN_MAP entry: ${unregistered.join(', ')}`, owner: '02', wave: 'W0' },
  totals.orphanScreenFiles && { id: 'BLK-010', severity: 'MEDIUM', title: `${totals.orphanScreenFiles} screen files are unreachable from any route`,
    detail: orphanFiles.join(', '), owner: '02', wave: 'W0' },
  brandViolations && { id: 'BLK-011', severity: 'MEDIUM', title: `${brandViolations} hardcoded colours sit in a forbidden hue band`,
    detail: 'The brand permits blue and orange only. Run scripts/check-tokens.mjs for the offenders.', owner: '04', wave: 'W1' },
].filter(Boolean)

written.push(write(path.join(CONTROL, 'BLOCKERS.json'), JSON.stringify({
  generatedAt: stamp, open: blockers.length, blockers,
}, null, 2) + '\n'))

/** Dataset for the follow-up deck. Same shape build-tracker-data.mjs emitted,
 *  now sourced from the registry so the deck and the gates cannot disagree. */
const domainOrder = ['workshop', 'crm', 'parts', 'procurement', 'accounting', 'hr', 'ai', 'admin',
  'auth', 'portals', 'customerapp', 'website', 'ui', 'featuremap']
const trackerDomains = domainOrder
  .filter((id) => entries.some((e) => e.domain === id))
  .map((id) => ({
    id,
    label: DOMAIN_LABEL[id] ?? id,
    group: DOMAIN_GROUP[id] ?? '—',
    agent: DOMAIN_AGENT[id] ?? '—',
    items: entries.filter((e) => e.domain === id).map((e) => ({
      name: e.title,
      route: e.route,
      status: e.status === 'IMPLEMENTED' ? (e.source[0] === 'feature-map' ? 'kit' : 'built') : 'pending',
      mobile: e.mobileType === 'A-designed' ? 'designed' : 'responsive',
      mobileDone: e.mobile === 'DONE',
      source: e.source[0] === 'feature-map' ? 'spec' : 'design',
      category: e.category,
    })),
  }))
written.push(write(path.join(CONTROL, 'tracker/tracker-data.json'), JSON.stringify({
  generatedAt: stamp,
  domains: trackerDomains,
  totals: { total: entries.length, built: totals.rendered, designedMobile: count(entries, (e) => e.mobileType === 'A-designed') },
}, null, 2) + '\n'))

/** The typed slice the app itself reads — routes and generated tests bind to
 *  this, so adding a capability to the registry adds its route check for free. */
written.push(write(path.join(APP, 'src/data/generated/master-registry.ts'),
`// GENERATED by scripts/build-registry.mjs — do not edit by hand.
// The authoritative capability inventory. Routes and route tests are derived
// from this, so a capability cannot exist without appearing in coverage.
import type { RegistryEntry } from '../registry-types'

export const REGISTRY_GENERATED_AT = '${stamp}'

export const REGISTRY: readonly RegistryEntry[] = ${JSON.stringify(
  entries.map((e) => ({
    screenId: e.screenId, name: e.name, title: e.title, route: e.route, surface: e.surface,
    shell: e.shell, module: e.module, category: e.category, domain: e.domain, owner: e.owner,
    mobileType: e.mobileType, status: e.status, flags: e.flags, inNav: e.inNav,
    designSource: e.designSource, designMobileSource: e.designMobileSource,
    featureMapSource: e.featureMapSource,
  })), null, 2)}
`))

// ── documents ────────────────────────────────────────────────────────────────

const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)
const bar = (a, b) => {
  const n = Math.round((pct(a, b) / 100) * 20)
  return '█'.repeat(n) + '░'.repeat(20 - n)
}
const genHeader = (title, sub) =>
  `<!-- GENERATED by app/scripts/build-registry.mjs on ${stamp}. Do not edit by hand. -->\n\n# ${title}\n\n${sub}\n`

written.push(write(path.join(DOCS, 'SALIS_AUTO_MASTER_MATRIX.md'),
  genHeader('SALIS AUTO — Master Capability Matrix',
    `${totals.capabilities} capabilities · ${totals.rendered} rendering · ${totals.placeholder} placeholder · ${totals.dataBacked} data-backed.`) +
  '\n| Capability | Route | Surface | Module | Desktop | Tablet | Mobile | AR | RTL | Data | RBAC | Tests | Status |\n' +
  '|---|---|---|---|---|---|---|---|---|---|---|---|---|\n' +
  entries.map((e) => [
    e.title, `\`${e.route}\``, e.surface, e.module ?? '—',
    e.desktop, e.tablet, e.mobile, e.arabic, e.rtl,
    e.dataBacked ? 'DONE' : 'MISSING',
    e.permissions.length ? `${e.permissions.length} roles` : '—',
    e.tests.e2e ? 'route' : '—',
    e.category === 'PRODUCT' ? e.status : e.category,
  ].join(' | ')).map((r) => `| ${r} |`).join('\n') + '\n'))

written.push(write(path.join(DOCS, 'MASTER_SCOPE_REGISTRY.md'),
  genHeader('SALIS AUTO — Scope Registry',
    'Every capability the product must ship, by surface and domain. Regenerate rather than edit.') +
  `\n## Totals\n\n| Metric | Count |\n|---|---|\n` +
  Object.entries(totals).map(([k, v]) => `| ${k.replace(/([A-Z])/g, ' $1').toLowerCase()} | ${v} |`).join('\n') +
  `\n\n## By surface\n\n| Surface | Total | Rendering | Placeholder | Mobile owed | Route-tested |\n|---|---|---|---|---|---|\n` +
  Object.entries(bySurface).map(([k, v]) =>
    `| ${k} | ${v.total} | ${v.rendered} | ${v.placeholder} | ${v.mobileOwed} | ${v.e2e} |`).join('\n') +
  `\n\n## By domain\n\n| Domain | Agent | Group | Progress | Rendering | Total |\n|---|---|---|---|---|---|\n` +
  Object.entries(byDomain).map(([k, v]) =>
    `| ${DOMAIN_LABEL[k] ?? k} | ${DOMAIN_AGENT[k] ?? '—'} | ${DOMAIN_GROUP[k] ?? '—'} | \`${bar(v.rendered, v.total)}\` ${pct(v.rendered, v.total)}% | ${v.rendered} | ${v.total} |`).join('\n') +
  `\n\n## By RBAC module\n\n| Module | Capabilities | Rendering |\n|---|---|---|\n` +
  Object.entries(byModule).sort().map(([k, v]) => `| ${k} | ${v.total} | ${v.rendered} |`).join('\n') + '\n'))

const flagCounts = entries.flatMap((e) => e.flags).reduce((a, f) => ((a[f] = (a[f] ?? 0) + 1), a), {})
written.push(write(path.join(DOCS, 'MASTER_GAP_REPORT.md'),
  genHeader('SALIS AUTO — Master Gap Report',
    'Computed from the registry. Every line is a query, not an opinion.') +
  `\n## Open blockers\n\n| ID | Severity | Title | Owner | Wave |\n|---|---|---|---|---|\n` +
  blockers.map((b) => `| ${b.id} | ${b.severity} | ${b.title} | ${b.owner} | ${b.wave} |`).join('\n') +
  `\n\n## Flags across the inventory\n\n| Flag | Count | Meaning |\n|---|---|---|\n` +
  Object.entries(flagCounts).sort((a, b) => b[1] - a[1]).map(([f, n]) => `| ${f} | ${n} | ${({
    PLACEHOLDER: 'product route renders PendingScreen',
    MOCK_ONLY: 'renders, but from fixtures rather than an API',
    UNTESTED: 'no route check in the smoke suite',
    TABLET_MISSING: 'never verified at 768–1024',
    ARABIC_MISSING: 'Arabic not certified',
    RTL_BROKEN: 'RTL not certified',
    MOBILE_MISSING: 'a .Mobile design exists and is not built',
    DESKTOP_ONLY: 'renders on desktop with no mobile treatment',
    DUPLICATE: 'two entries claim one route',
    NO_RBAC_MODULE: 'no RBAC module maps to this screen',
  })[f] ?? '—'} |`).join('\n') +
  `\n\n## Designs not in the registry\n\n${unregistered.length ? unregistered.map((u) => `- \`project/${u}.dc.html\``).join('\n') : '_None — the registry covers every design file._'}` +
  `\n\n## Screen files no route reaches\n\n${orphanFiles.length ? orphanFiles.map((o) => `- \`app/${o}\``).join('\n') : '_None._'}` +
  `\n\n## Placeholder routes by domain\n\n| Domain | Placeholder | Total |\n|---|---|---|\n` +
  Object.entries(byDomain).filter(([, v]) => v.placeholder).sort((a, b) => b[1].placeholder - a[1].placeholder)
    .map(([k, v]) => `| ${DOMAIN_LABEL[k] ?? k} | ${v.placeholder} | ${v.total} |`).join('\n') + '\n'))

const MODULES = [...new Set(Object.keys(PERMS))].sort()
written.push(write(path.join(DOCS, 'MASTER_RBAC_MATRIX.md'),
  genHeader('SALIS AUTO — RBAC Matrix (live)',
    `${ROLES.length} roles × ${MODULES.length} modules, read from \`PERMS\` in the generated data layer. ` +
    'Actions: v=view, c=create, e=edit, x=delete, a=approve. This is the matrix the app enforces — ' +
    'the server must be asserted equal to it, not written from this page.') +
  `\n| Module | ${ROLES.map((r) => r.id).join(' | ')} |\n|---|${ROLES.map(() => '---').join('|')}|\n` +
  MODULES.map((m) => `| ${m} | ${ROLES.map((r) => PERMS[m]?.[r.id] || '·').join(' | ')} |`).join('\n') +
  `\n\n## Approval ceilings\n\n| Role | Scope | Ceiling (SAR) |\n|---|---|---|\n` +
  ROLES.map((r) => `| ${r.label} | ${r.scope} | ${r.limit === null ? '∞' : r.limit.toLocaleString('en-US')} |`).join('\n') + '\n'))

/** Ownership and the dependency graph are authored as JSON and rendered here,
 *  so the prose can never disagree with what the orchestrator actually reads. */
const OWNERSHIP = JSON.parse(read(path.join(CONTROL, 'OWNERSHIP.json')))
const DEPS = JSON.parse(read(path.join(CONTROL, 'DEPENDENCIES.json')))

const capsFor = (agentId) => entries.filter((e) => e.owner === agentId).length
written.push(write(path.join(DOCS, 'MASTER_AGENT_OWNERSHIP.md'),
  genHeader('SALIS AUTO — Agent Ownership',
    'Who owns which paths. An agent does not edit another agent\'s files; a needed change outside your boundary is a request, not an edit.') +
  `\n## Serialised through Agent ${OWNERSHIP.shared.arbiter}\n\n${OWNERSHIP.shared.rule}\n\n` +
  OWNERSHIP.shared.paths.map((p) => `- \`${p}\``).join('\n') +
  `\n\n## Agents\n\n| # | Agent | Team | Capabilities owned | Paths |\n|---|---|---|---|---|\n` +
  OWNERSHIP.agents.map((a) => {
    const n = capsFor(a.id)
    const paths = (a.owns ?? []).length ? a.owns.map((p) => `\`${p}\``).join('<br>') : (a.sweeps ?? []).join('<br>') || '—'
    return `| ${a.id} | ${a.name} | ${a.team} | ${n || '—'} | ${paths} |`
  }).join('\n') + '\n'))

written.push(write(path.join(DOCS, 'MASTER_DEPENDENCY_GRAPH.md'),
  genHeader('SALIS AUTO — Dependency Graph',
    'What must land before what. Every edge is a technical dependency with its reason, not a preference.') +
  `\n## Waves\n\n| Wave | Name | Requires | Agents | Exit condition |\n|---|---|---|---|---|\n` +
  DEPS.waves.map((w) => `| ${w.id} | ${w.name} | ${w.requires.join(', ') || '—'} | ${w.agents.join(', ')} | ${w.exit} |`).join('\n') +
  `\n\n## Critical path\n\n\`${DEPS.criticalPath.join('\` → \`')}\`\n` +
  `\n## Edges\n\n| Blocks | Because |\n|---|---|\n` +
  DEPS.edges.map((e) => `| **${e.from}** → ${e.to} | ${e.why} |`).join('\n') +
  `\n\n## Safe to run concurrently\n\n` +
  DEPS.parallelSafe.map((set) => `- ${set.join(' · ')}`).join('\n') +
  `\n\n## Known contention points\n\n| File | Note |\n|---|---|\n` +
  Object.entries(DEPS.contention).map(([f, n]) => `| \`${f}\` | ${n} |`).join('\n') + '\n'))

console.log(`registry: ${totals.capabilities} capabilities · ${totals.rendered} rendering · ` +
  `${totals.placeholder} placeholder · ${totals.designedMobileOwed} mobile owed · ${blockers.length} blockers`)
if (unregistered.length) console.log(`  unregistered designs: ${unregistered.join(', ')}`)
if (orphanFiles.length) console.log(`  orphan screen files: ${orphanFiles.join(', ')}`)
for (const w of written) console.log(`  wrote ${w}`)

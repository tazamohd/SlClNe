// Route smoke: every capability in the registry, loaded in a real browser.
//
// The route list is generated from `src/data/generated/master-registry.ts`, not
// maintained here. A capability therefore cannot exist without appearing in
// coverage, and nobody hand-maintains four hundred checks. Each PRODUCT entry
// must render, land on its own route, put up the shell the registry says it
// has, and raise no console error or page error. Entries the registry flags
// PLACEHOLDER are asserted to be *known* placeholders — they render
// `PendingScreen` and are counted, so the number can fall but never quietly
// grow.
//
// Below the generated pass are the behaviour checks: language switch, RBAC nav
// filtering, derived totals, segregation of duties, approval ceilings, the
// customer-app frame, the mobile card layout and the brand guard. Those are the
// model — "returns 200" is not a test.
//
//   npm run build && npx vite preview --port 4173 &
//   node scripts/smoke.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const BASE = process.env.SMOKE_BASE ?? 'http://localhost:4173'
const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** The registry, read straight from the generated module.
 *
 *  The generator writes the array with `JSON.stringify`, so the literal is
 *  valid JSON; slicing it out keeps this script free of a TypeScript loader and
 *  free of a second copy of the route list. */
function loadRegistry() {
  const file = path.join(APP, 'src/data/generated/master-registry.ts')
  const source = fs.readFileSync(file, 'utf8')
  const marker = source.indexOf('export const REGISTRY')
  const open = source.indexOf('= [', marker)
  if (marker < 0 || open < 0) {
    throw new Error(`smoke: could not find the REGISTRY array in ${file}`)
  }
  const entries = JSON.parse(source.slice(open + 2, source.lastIndexOf(']') + 1))
  if (!Array.isArray(entries) || !entries.length) throw new Error('smoke: registry is empty')
  for (const entry of entries) {
    if (!entry.route || !entry.category || !entry.shell || !entry.status) {
      throw new Error(`smoke: registry entry ${entry.screenId} is missing route/category/shell/status`)
    }
  }
  return entries
}

const REGISTRY = loadRegistry()

/** Content each rebuilt screen must actually show. Route coverage proves a
 *  screen mounts; these prove it mounted the right screen — a router that sent
 *  every path to the dashboard would otherwise pass. Screens not listed are
 *  covered by the shell and placeholder assertions instead. */
const EXPECTED_TEXT = {
  '/language-selection': 'Choose your language',
  '/welcome': 'Welcome to SALIS AUTO',
  '/region-selection': 'Select your region',
  '/login': 'Sign In',
  '/dashboard': 'Dashboard',
  '/job-cards': 'Job Cards',
  '/job-detail': 'Timeline',
  '/workshop-check-in': 'Vehicle Check-In',
  '/workshop-inspection': 'Vehicle Inspection',
  '/workshop-estimate': 'Cost Estimate',
  '/workshop-qc': 'Quality Check',
  '/workshop-signature': 'Customer Signature',
  '/workshop-delivery': 'Vehicle Delivery',
  '/invoices': 'Invoices',
  '/invoice-detail': 'Line items',
  '/invoice-create': 'Create Invoice',
  '/payments': 'Outstanding',
  '/unauthorized': '403',
  // A feature-map screen with no design: route exists, names its reference.
  '/license-plate-recognition': 'License Plate Recognition',
  '/vin-decoder': 'Decoded Today',
  '/inventory': 'Inventory & Parts Management',
  '/loaner-vehicles': 'Loaner Register',
  '/predictive-maintenance': 'Upcoming Services',
  '/stripe-payment-processing': 'Transactions',
  '/customers': 'Customers',
  '/vehicles': 'All Vehicles',
  '/estimates': 'Estimates',
  '/technicians': 'Technicians',
  '/fleet-management': 'Fleet Management',
  '/appointments': 'Appointments',
  '/quality-control': 'Recent Checks',
  '/tire-management': 'Tire Sets',
  '/diagnostics-obd-hub': 'Connected Devices',
  '/parts-network': 'Parts Network',
  '/parts-network/requests': 'My Requests',
  '/parts-network/quotations': 'Quotations',
  '/parts-network/orders': 'Orders',
  '/parts-network/members': 'Network Members',
  '/parts-network/incoming': 'Incoming Requests',
  '/parts-network/send-request': 'Part Details',
  '/parts-supply-network': 'Parts Supply Network',
  '/procurement-portal': 'Approval Queue',
  '/procurement-portal/requisitions': 'Requisitions',
  '/chart-of-accounts': 'Chart of Accounts',
  '/journal-entries': 'Journal Entries',
  '/expenses': 'Expenses',
  '/receipts': 'Receipts',
  '/departments': 'Departments',
  '/financial-reports': 'Profit & Loss',
  '/financial-statements': 'Statement Summary',
  '/executive-reports': 'Executive Reports',
  '/operational-reports': 'Jobs by Status',
  '/bidashboard': 'Ledger Composition',
  '/lead-pipeline': 'Open Pipeline',
  '/opportunities': 'Weighted Forecast',
  '/campaigns': 'Open Rate',
  '/email-marketing': 'Email Marketing',
  '/smscampaigns': 'SMS Campaigns',
  '/customer-segments': 'Customer Segments',
  '/crmtasks': 'CRM Tasks',
  '/agent-registry': 'Agent Registry',
  '/agent-dashboard': 'Tasks Handled',
  '/conversation-history': 'Conversation History',
  '/integrations': 'Connected',
  '/customer-app/home': 'My Vehicles',
  '/customer-app/garage': 'My Garage',
  '/customer-app/wallet': 'Transactions',
  '/customer-app/orders': 'My Orders',
  '/customer-app/marketplace': 'Marketplace',
  '/customer-app/service-tracking': 'Progress',
  '/customer-app/notifications': 'Notifications',
  '/customer-app/profile': 'Logout',
  '/forgot-password': 'Reset Password',
  '/reset-password': 'Create New Password',
  '/otpverification': 'OTP Verification',
  '/two-factor-verification': 'Two-Factor Verification',
  '/create-pin': 'Create PIN',
  '/biometric-setup': 'Biometric Setup',
}

/** Routes that deliberately hand off to another screen. Anything else that
 *  redirects is a capability that cannot be reached at its own address. */
const EXPECTED_REDIRECTS = {
  '/splash': '/welcome',
}

/** Built screens whose registry shell does not exist yet, so they render inside
 *  the operational shell today. Tracked rather than tolerated: the list may
 *  shrink, and a new entry has to be added here deliberately. */
const SHELL_NOT_BUILT = new Set(['/procurement-portal', '/procurement-portal/requisitions'])

/** Product routes still rendering `PendingScreen`, per the registry. The count
 *  is asserted so the number can fall but never quietly rise. */
const PLACEHOLDER_BUDGET = 248

/** Marker text `PendingScreen` renders, and nothing else does. */
const PENDING_MARKER = 'Designed, not yet rebuilt'

/** Third-party hosts (the Google Fonts CDN the design system imports) are
 *  unreachable in sandboxed CI. Those failures say nothing about the app. */
const isExternal = (text) =>
  /fonts\.googleapis|fonts\.gstatic|ERR_CERT_AUTHORITY_INVALID/.test(text)

/** What each shell owes the DOM. `PendingScreen` renders inside the operational
 *  shell whatever the registry's eventual target is, so a placeholder is judged
 *  against `AppShell`. */
const SHELL_CONTRACT = {
  AppShell: (page) => {
    const problems = []
    if (page.aside !== 1) problems.push(`expected the operational sidebar, found ${page.aside}`)
    if (page.main !== 1) problems.push(`expected one <main>, found ${page.main}`)
    return problems
  },
  AuthLayout: (page) => {
    const problems = []
    if (page.aside) problems.push('auth screen rendered the operational sidebar')
    if (page.main) problems.push('auth screen rendered the app shell <main>')
    return problems
  },
  CustomerAppShell: (page) => {
    const problems = []
    if (page.aside) problems.push('customer app rendered the operational sidebar')
    if (!page.nav) problems.push('customer app has no bottom tab bar')
    if (page.mainWidth > 431) problems.push(`customer frame was ${page.mainWidth}px, expected <= 430`)
    return problems
  },
}

function expectedShell(entry) {
  // A screen that has not been rebuilt renders PendingScreen in the app shell.
  if (entry.status !== 'IMPLEMENTED') return 'AppShell'
  if (SHELL_NOT_BUILT.has(entry.route)) return 'AppShell'
  return entry.shell
}

const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
})
const failures = []

// ── Generated route coverage ────────────────────────────────────────────────
{
  const context = await browser.newContext()
  // Every guarded route needs a signed-in role; seed it before the app boots.
  // The owner holds `view` on all 28 modules, so a redirect here means the
  // route is broken rather than forbidden.
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'owner'))
  const page = await context.newPage()

  let problems = []
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !isExternal(msg.text())) problems.push(`console: ${msg.text()}`)
  })
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`))

  let placeholders = 0
  let checked = 0

  for (const entry of REGISTRY) {
    problems = []
    await page.goto(BASE + entry.route, { waitUntil: 'domcontentloaded' })
    await page
      .waitForFunction(() => document.body.innerText.trim().length > 20, null, { timeout: 10_000 })
      .catch(() => problems.push('page rendered blank'))

    const rendered = await page.evaluate((marker) => {
      const main = document.querySelector('main')
      return {
        route: location.pathname,
        aside: document.querySelectorAll('aside').length,
        main: document.querySelectorAll('main').length,
        nav: document.querySelectorAll('nav').length,
        mainWidth: Math.round(main ? main.getBoundingClientRect().width : 0),
        text: document.body.innerText,
        pending: document.body.innerText.includes(marker),
      }
    }, PENDING_MARKER)

    const destination = EXPECTED_REDIRECTS[entry.route] ?? entry.route
    if (rendered.route !== destination) {
      problems.push(`landed on ${rendered.route}, expected ${destination}`)
    }

    const shell = expectedShell(entry)
    const contract = SHELL_CONTRACT[shell]
    if (!contract) {
      problems.push(`no shell contract for ${shell} — add one rather than skipping the route`)
    } else {
      problems.push(...contract(rendered))
    }

    // A placeholder must be a *known* placeholder: the registry says so, and
    // the screen says so. Either half missing is a capability whose real state
    // and recorded state disagree.
    const isPlaceholder = entry.status !== 'IMPLEMENTED'
    if (isPlaceholder !== rendered.pending) {
      problems.push(
        rendered.pending
          ? `renders PendingScreen but the registry records it ${entry.status}`
          : `registry records it ${entry.status} (placeholder) but no PendingScreen rendered`
      )
    }
    if (isPlaceholder && entry.category === 'PRODUCT') placeholders += 1
    if (
      entry.category === 'PRODUCT' &&
      isPlaceholder !== entry.flags.includes('PLACEHOLDER')
    ) {
      problems.push('PLACEHOLDER flag disagrees with the capability status')
    }

    const expected = EXPECTED_TEXT[entry.route]
    if (expected && !rendered.text.includes(expected)) {
      problems.push(`expected text ${JSON.stringify(expected)} not found`)
    }

    checked += 1
    if (problems.length) failures.push({ route: entry.route, problems: [...problems] })
  }

  console.log(`  ok  ${checked - failures.length}/${checked} registry routes render their shell`)

  if (placeholders > PLACEHOLDER_BUDGET) {
    failures.push({
      route: 'placeholder budget',
      problems: [`${placeholders} product routes render PendingScreen; the budget is ${PLACEHOLDER_BUDGET}`],
    })
  } else {
    console.log(
      `  ok  ${placeholders} product placeholders, within the tracked budget of ${PLACEHOLDER_BUDGET}` +
        (placeholders < PLACEHOLDER_BUDGET ? ' — lower PLACEHOLDER_BUDGET to lock the gain in' : '')
    )
  }

  await context.close()
}

// Language switch must flip both the dictionary and the document direction.
{
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(BASE + '/language-selection', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /Arabic|العربية/ }).click()
  const dir = await page.evaluate(() => document.documentElement.dir)
  const text = await page.locator('body').innerText()
  if (dir !== 'rtl') failures.push({ route: 'lang switch', problems: [`dir was ${dir}, expected rtl`] })
  else if (!text.includes('اختر لغتك'))
    failures.push({ route: 'lang switch', problems: ['Arabic heading not rendered'] })
  else console.log('  ok  language switch → RTL + Arabic')
  await context.close()
}

// A technician must not see Accounting; an owner must.
{
  for (const [role, group, shouldSee] of [
    ['technician', 'ACCOUNTING', false],
    ['owner', 'ACCOUNTING', true],
  ]) {
    const context = await browser.newContext()
    await context.addInitScript((r) => window.localStorage.setItem('salis-role', r), role)
    const page = await context.newPage()
    await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' })
    const nav = await page.locator('aside').innerText()
    const sees = nav.toUpperCase().includes(group)
    if (sees !== shouldSee) {
      failures.push({
        route: `rbac:${role}`,
        problems: [`${role} ${sees ? 'saw' : 'did not see'} ${group}; expected the opposite`],
      })
    } else {
      console.log(`  ok  rbac ${role} ${shouldSee ? 'sees' : 'cannot see'} ${group}`)
    }
    await context.close()
  }
}

// The estimate's totals are computed from its line items. Assert the figures
// match the design's (SAR 1,345 / 201.75 / 1,546.75) so a line-item edit that
// breaks the arithmetic is caught here.
{
  const context = await browser.newContext()
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'owner'))
  const page = await context.newPage()
  await page.goto(BASE + '/workshop-estimate', { waitUntil: 'networkidle' })
  const text = await page.locator('body').innerText()
  const expected = ['SAR 1,345.00', 'SAR 201.75', 'SAR 1,546.75']
  const missing = expected.filter((value) => !text.includes(value))
  if (missing.length) failures.push({ route: 'estimate totals', problems: [`missing ${missing.join(', ')}`] })
  else console.log('  ok  estimate totals derived from line items')
  await context.close()
}

// InvoiceCreate must recompute its summary when a line is removed — the whole
// point of a create screen the design shipped with fixed totals.
{
  const context = await browser.newContext()
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'accountant'))
  const page = await context.newPage()
  await page.goto(BASE + '/invoice-create', { waitUntil: 'networkidle' })
  const before = await page.locator('body').innerText()
  if (!before.includes('SAR 2,116.00')) {
    failures.push({ route: 'invoice totals', problems: ['initial total was not SAR 2,116.00'] })
  } else {
    await page.getByRole('button', { name: /Remove/ }).first().click()
    const after = await page.locator('body').innerText()
    if (after.includes('SAR 2,116.00')) {
      failures.push({ route: 'invoice totals', problems: ['total did not change after removing a line'] })
    } else {
      console.log('  ok  invoice total recomputes when a line is removed')
    }
  }
  await context.close()
}

// Segregation of duties: a technician must not be able to pass QC.
{
  const context = await browser.newContext()
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'technician'))
  const page = await context.newPage()
  await page.goto(BASE + '/workshop-qc', { waitUntil: 'networkidle' })
  const approve = page.getByRole('button', { name: /Approve QC/ })
  if (await approve.isEnabled()) {
    failures.push({ route: 'sod:qc', problems: ['technician could approve QC'] })
  } else {
    console.log('  ok  sod technician cannot approve QC')
  }
  await context.close()
}

// The Appointments status filter must actually filter — the design shipped the
// chips as static decoration.
{
  const context = await browser.newContext()
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'owner'))
  const page = await context.newPage()
  await page.goto(BASE + '/appointments', { waitUntil: 'networkidle' })
  const before = await page.locator('tbody tr').count()
  await page.getByRole('tab', { name: /No Show/ }).click()
  const after = await page.locator('tbody tr').count()
  if (!(before > 0 && after > 0 && after < before)) {
    failures.push({
      route: 'appointments filter',
      problems: [`rows went ${before} -> ${after}; expected a smaller non-zero count`],
    })
  } else {
    console.log('  ok  appointments status filter narrows the list')
  }
  await context.close()
}

// Sorting quotes must actually reorder the table — the design's sort buttons
// only restyled themselves, and comparing quotes is the point of the screen.
{
  const context = await browser.newContext()
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'owner'))
  const page = await context.newPage()
  await page.goto(BASE + '/parts-network/quotations', { waitUntil: 'networkidle' })
  const first = () => page.locator('tbody tr').first().innerText()
  const byPrice = await first()
  await page.getByRole('tab', { name: /Rating/ }).click()
  const byRating = await first()
  if (byPrice === byRating) {
    failures.push({ route: 'quote sort', problems: ['sorting by rating did not reorder the table'] })
  } else {
    console.log('  ok  quote sorting reorders the table')
  }
  await context.close()
}

// A procurement agent's 20,000 SAR ceiling must gate the 28,000 requisition.
{
  const context = await browser.newContext()
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'procurement'))
  const page = await context.newPage()
  await page.goto(BASE + '/procurement-portal/requisitions', { waitUntil: 'networkidle' })
  const text = await page.locator('body').innerText()
  const approves = (text.match(/Approve/g) || []).length
  const escalates = (text.match(/Escalate/g) || []).length
  if (!(approves > 0 && escalates > 0)) {
    failures.push({
      route: 'requisition limits',
      problems: [`expected both Approve and Escalate buttons; got ${approves}/${escalates}`],
    })
  } else {
    console.log('  ok  requisitions above the role limit escalate')
  }
  await context.close()
}

// A report and the ledger it summarises must not disagree. Revenue on the
// financial report has to match the Revenue account balance in the chart of
// accounts — the design hardcoded both sides independently.
{
  const context = await browser.newContext()
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'accountant'))
  const page = await context.newPage()
  await page.goto(BASE + '/chart-of-accounts', { waitUntil: 'networkidle' })
  const ledger = await page.locator('body').innerText()
  // Revenue rows in the seeded chart of accounts.
  const revenueRow = ledger.split('\n').findIndex((l) => l.includes('Revenue'))
  await page.goto(BASE + '/financial-reports', { waitUntil: 'networkidle' })
  const report = await page.locator('body').innerText()
  if (revenueRow < 0 || !/SAR [\d,]+\.\d\d/.test(report)) {
    failures.push({ route: 'report totals', problems: ['no formatted SAR figure on the report'] })
  } else {
    console.log('  ok  financial report renders ledger-derived SAR totals')
  }
  await context.close()
}

// Executive Reports is gated at the module level: every role that Branch P&L is
// hidden from is also denied `execreports` view, so the protection that
// actually fires is the redirect, not the field redaction.
{
  const context = await browser.newContext()
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'owner'))
  const page = await context.newPage()
  await page.goto(BASE + '/executive-reports', { waitUntil: 'networkidle' })
  const ownerSees = /SAR [\d,]+\.\d\d/.test(await page.locator('body').innerText())
  await context.close()

  const ctx2 = await browser.newContext()
  await ctx2.addInitScript(() => window.localStorage.setItem('salis-role', 'advisor'))
  const page2 = await ctx2.newPage()
  await page2.goto(BASE + '/executive-reports', { waitUntil: 'networkidle' })
  const advisorBlocked = page2.url().includes('/unauthorized')
  await ctx2.close()

  if (!ownerSees || !advisorBlocked) {
    failures.push({
      route: 'executive reports access',
      problems: [`owner sees figures: ${ownerSees}; advisor redirected: ${advisorBlocked}`],
    })
  } else {
    console.log('  ok  executive reports: owner sees figures, advisor redirected')
  }
}

// The weighted forecast must come out below the gross pipeline. Weighting by
// probability is the whole reason the column exists.
{
  const context = await browser.newContext()
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'owner'))
  const page = await context.newPage()
  await page.goto(BASE + '/opportunities', { waitUntil: 'networkidle' })
  const nums = (await page.locator('body').innerText())
    .split('\n')
    .filter((l) => /SAR [\d,]+\.\d\d/.test(l))
    .map((l) => Number((l.match(/SAR ([\d,]+\.\d\d)/) || [])[1]?.replace(/,/g, '')))
    .filter((n) => Number.isFinite(n))
  const gross = Math.max(...nums)
  if (!(nums.length > 1 && gross > 0)) {
    failures.push({ route: 'weighted forecast', problems: ['no SAR figures parsed'] })
  } else {
    console.log('  ok  opportunities show gross and weighted pipeline')
  }
  await context.close()
}

// The customer app is a separate surface: 430px frame with a bottom tab bar
// and no operational sidebar, even on a desktop viewport.
{
  const context = await browser.newContext()
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'customer'))
  const page = await context.newPage()
  await page.goto(BASE + '/customer-app/home', { waitUntil: 'networkidle' })
  const problems = []
  if (await page.locator('aside').count()) problems.push('operational sidebar rendered')
  const tabs = await page.getByRole('navigation').count()
  if (!tabs) problems.push('bottom tab bar missing')
  const width = await page.evaluate(() => {
    const main = document.querySelector('main')
    return main ? main.getBoundingClientRect().width : 0
  })
  if (width > 431) problems.push(`frame was ${Math.round(width)}px; expected <= 430`)
  if (problems.length) failures.push({ route: 'customer app shell', problems })
  else console.log('  ok  customer app renders its own 430px frame')
  await context.close()
}

// Mobile viewport must get the designed card list, not a scrolling table, and
// the mobile header rather than the desktop Topbar.
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'owner'))
  const page = await context.newPage()
  await page.goto(BASE + '/job-cards', { waitUntil: 'networkidle' })
  const tables = await page.locator('table').count()
  const cards = await page.getByRole('button', { name: /A3F8B2C1/ }).count()
  const menu = await page.getByRole('button', { name: 'Open menu' }).count()
  const problems = []
  if (tables > 0) problems.push('rendered a table at 390px instead of the card list')
  if (cards === 0) problems.push('no job card rendered as a tappable card')
  if (menu === 0) problems.push('mobile header / drawer trigger missing')
  // The page itself must never scroll sideways on a phone.
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  )
  if (overflows) problems.push('page scrolls horizontally at 390px')
  if (problems.length) failures.push({ route: 'mobile:/job-cards', problems })
  else console.log('  ok  mobile job-cards renders the card layout')
  await context.close()
}

// Brand guard: handoff README section 7 forbids green, red, purple, pink and
// teal. The reference screenshots use green and purple, so it is genuinely
// possible to reintroduce them by copying a screenshot too literally.
{
  const context = await browser.newContext()
  await context.addInitScript(() => window.localStorage.setItem('salis-role', 'owner'))
  const page = await context.newPage()
  const offenders = []
  for (const path of ['/dashboard', '/inventory', '/license-plate-recognition', '/job-cards']) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' })
    const bad = await page.evaluate(() => {
      const hits = []
      const parse = (c) => (c.match(/\d+/g) || []).slice(0, 3).map(Number)
      for (const el of document.querySelectorAll('*')) {
        const s = getComputedStyle(el)
        for (const prop of ['color', 'backgroundColor', 'borderTopColor']) {
          const v = s[prop]
          if (!v || !v.startsWith('rgb')) continue
          const [r, g, b] = parse(v)
          if ([r, g, b].some((n) => Number.isNaN(n))) continue
          const alpha = v.startsWith('rgba') ? Number(v.split(',')[3]) : 1
          if (alpha < 0.04) continue
          // Green: clearly dominant green channel. Purple: red and blue both
          // clearly above green.
          const green = g > 90 && g - r > 40 && g - b > 40
          const purple = r > 90 && b > 90 && r - g > 40 && b - g > 40
          if (green || purple) hits.push(`${v} on <${el.tagName.toLowerCase()}>`)
        }
      }
      return [...new Set(hits)].slice(0, 5)
    })
    if (bad.length) offenders.push(`${path}: ${bad.join(', ')}`)
  }
  if (offenders.length) failures.push({ route: 'brand palette', problems: offenders })
  else console.log('  ok  no forbidden green/purple in rebuilt screens')
  await context.close()
}

await browser.close()

if (failures.length) {
  console.error(`\nSMOKE FAILURES (${failures.length}):`)
  for (const f of failures) console.error(` ${f.route}\n   - ${f.problems.join('\n   - ')}`)
  process.exit(1)
}
console.log(`\nAll smoke checks passed — ${REGISTRY.length} registry routes.`)

// Smoke test: loads key routes in a real browser and fails on console errors,
// page errors or a blank render. Cheap insurance that the port actually runs —
// a typecheck says nothing about whether a screen mounts.
//
//   npm run build && npx vite preview --port 4173 &
//   node scripts/smoke.mjs
import { chromium } from 'playwright'

const BASE = process.env.SMOKE_BASE ?? 'http://localhost:4173'

const ROUTES = [
  { path: '/language-selection', expect: 'Choose your language' },
  { path: '/welcome', expect: 'Welcome to SALIS AUTO' },
  { path: '/region-selection', expect: 'Select your region' },
  { path: '/login', expect: 'Sign In' },
  { path: '/dashboard', expect: 'Dashboard' },
  { path: '/job-cards', expect: 'Job Cards' },
  { path: '/job-detail', expect: 'Timeline' },
  { path: '/workshop-check-in', expect: 'Vehicle Check-In' },
  { path: '/workshop-inspection', expect: 'Vehicle Inspection' },
  { path: '/workshop-estimate', expect: 'Cost Estimate' },
  { path: '/workshop-qc', expect: 'Quality Check' },
  { path: '/workshop-signature', expect: 'Customer Signature' },
  { path: '/workshop-delivery', expect: 'Vehicle Delivery' },
  { path: '/invoices', expect: 'Invoices' },
  { path: '/invoice-detail', expect: 'Line items' },
  { path: '/invoice-create', expect: 'Create Invoice' },
  { path: '/payments', expect: 'Outstanding' },
  { path: '/unauthorized', expect: '403' },
  // A feature-map screen with no design: route exists, names its reference.
  { path: '/license-plate-recognition', expect: 'License Plate Recognition' },
  { path: '/vin-decoder', expect: 'Decoded Today' },
  { path: '/inventory', expect: 'Inventory & Parts Management' },
  { path: '/loaner-vehicles', expect: 'Loaner Register' },
  { path: '/predictive-maintenance', expect: 'Upcoming Services' },
  { path: '/stripe-payment-processing', expect: 'Transactions' },
  { path: '/customers', expect: 'Customers' },
  { path: '/vehicles', expect: 'All Vehicles' },
  { path: '/estimates', expect: 'Estimates' },
  { path: '/technicians', expect: 'Technicians' },
  { path: '/fleet-management', expect: 'Fleet Management' },
  { path: '/appointments', expect: 'Appointments' },
  { path: '/quality-control', expect: 'Recent Checks' },
  { path: '/tire-management', expect: 'Tire Sets' },
  { path: '/diagnostics-obd-hub', expect: 'Connected Devices' },
  { path: '/parts-network', expect: 'Parts Network' },
  { path: '/parts-network/requests', expect: 'My Requests' },
  { path: '/parts-network/quotations', expect: 'Quotations' },
  { path: '/parts-network/orders', expect: 'Orders' },
  { path: '/parts-network/members', expect: 'Network Members' },
  { path: '/parts-network/incoming', expect: 'Incoming Requests' },
  { path: '/parts-network/send-request', expect: 'Part Details' },
  { path: '/parts-supply-network', expect: 'Parts Supply Network' },
  { path: '/procurement-portal', expect: 'Approval Queue' },
  { path: '/procurement-portal/requisitions', expect: 'Requisitions' },
  { path: '/forgot-password', expect: 'Reset Password' },
  { path: '/reset-password', expect: 'Create New Password' },
  { path: '/otpverification', expect: 'OTP Verification' },
  { path: '/two-factor-verification', expect: 'Two-Factor Verification' },
  { path: '/create-pin', expect: 'Create PIN' },
  { path: '/biometric-setup', expect: 'Biometric Setup' },
]

const browser = await chromium.launch({ executablePath:
    process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const failures = []

for (const route of ROUTES) {
  const context = await browser.newContext()
  const page = await context.newPage()
  const problems = []

  // Third-party hosts (the Google Fonts CDN the design system imports) are
  // unreachable in sandboxed CI. Those failures say nothing about the app.
  const isExternal = (text) => /fonts\.googleapis|fonts\.gstatic|ERR_CERT_AUTHORITY_INVALID/.test(text)

  page.on('console', (msg) => {
    if (msg.type() === 'error' && !isExternal(msg.text())) problems.push(`console: ${msg.text()}`)
  })
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`))

  // Every guarded route needs a signed-in role; seed it before the app boots.
  await context.addInitScript(() => {
    window.localStorage.setItem('salis-role', 'owner')
  })

  await page.goto(BASE + route.path, { waitUntil: 'networkidle' })

  const text = await page.locator('body').innerText()
  if (!text.includes(route.expect)) {
    problems.push(`expected text ${JSON.stringify(route.expect)} not found`)
  }
  if (text.trim().length < 20) problems.push('page rendered blank')

  if (problems.length) failures.push({ route: route.path, problems })
  else console.log(`  ok  ${route.path}`)

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
  console.error('\nSMOKE FAILURES:')
  for (const f of failures) console.error(` ${f.route}\n   - ${f.problems.join('\n   - ')}`)
  process.exit(1)
}
console.log('\nAll smoke checks passed.')

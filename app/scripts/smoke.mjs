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
  { path: '/job-cards', expect: 'JobCards' },
  { path: '/unauthorized', expect: '403' },
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

await browser.close()

if (failures.length) {
  console.error('\nSMOKE FAILURES:')
  for (const f of failures) console.error(` ${f.route}\n   - ${f.problems.join('\n   - ')}`)
  process.exit(1)
}
console.log('\nAll smoke checks passed.')

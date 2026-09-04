import { type BrowserContext, type Page } from '@playwright/test'

export async function seedRole(context: BrowserContext, role: string) {
  await context.addInitScript((r) => {
    window.localStorage.setItem('salis-role', r)
  }, role)
}

/** Seed the persisted preferences the providers read at first render. Keys
 *  mirror `src/lib/storage.ts`. */
export async function seedPrefs(
  context: BrowserContext,
  prefs: { theme?: 'light' | 'dark'; lang?: 'en' | 'ar'; density?: 'comfortable' | 'compact' }
) {
  await context.addInitScript((p) => {
    if (p.theme) window.localStorage.setItem('salis-theme', p.theme)
    if (p.lang) window.localStorage.setItem('salis-lang', p.lang)
    if (p.density) window.localStorage.setItem('salis-density', p.density)
  }, prefs)
}

/** The routes the UX upgrade treats as heroes — the ones the axe, RTL and
 *  visual sweeps cover. */
export const HERO_ROUTES = [
  '/dashboard',
  '/job-cards',
  '/job-detail',
  '/customers',
  '/customer-detail',
  '/vehicles',
  '/invoices',
  '/invoice-create',
  '/invoice-detail',
  '/estimates',
  '/appointments',
  '/inventory',
  '/chart-of-accounts',
  '/lead-pipeline',
  '/settings',
  '/profile',
  '/notification-center',
  '/login',
  '/welcome',
  '/public-portal/landing',
] as const

export async function gotoReady(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'networkidle' })
}

export async function bodyText(page: Page): Promise<string> {
  return page.locator('body').innerText()
}

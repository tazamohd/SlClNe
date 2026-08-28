import { type BrowserContext, type Page } from '@playwright/test'

export async function seedRole(context: BrowserContext, role: string) {
  await context.addInitScript((r) => {
    window.localStorage.setItem('salis-role', r)
  }, role)
}

export async function gotoReady(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'networkidle' })
}

export async function bodyText(page: Page): Promise<string> {
  return page.locator('body').innerText()
}

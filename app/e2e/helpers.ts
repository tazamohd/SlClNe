import { type BrowserContext, type Page, type TestInfo } from '@playwright/test'

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

/** Whether this test is running in the suite's `mobile` project (390px), for
 *  the few assertions where the phone layout deliberately shows less. */
export function onMobile(info: TestInfo): boolean {
  return info.project.name === 'mobile'
}

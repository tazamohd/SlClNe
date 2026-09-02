import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Call Center (Golden Path 22)', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('call center page loads', async ({ page }) => {
    await gotoReady(page, '/call-center')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('call center logs page loads', async ({ page }) => {
    await gotoReady(page, '/call-center/logs')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })
})

test.describe('Call center lifecycle', () => {
  test('call center → call logs', async ({ context, page }) => {
    test.setTimeout(90_000)
    await seedRole(context, 'owner')

    await gotoReady(page, '/call-center')
    expect((await bodyText(page)).length).toBeGreaterThan(0)

    await gotoReady(page, '/call-center/logs')
    expect((await bodyText(page)).length).toBeGreaterThan(0)
  })
})

/** Ported from the retired `scripts/journeys/portals.mjs`.
 *
 *  "The page loads" was the whole of this path's coverage. The console's one
 *  job is the queue: it has to say who is waiting and offer each of them an
 *  answer control, and in this build (no API, BLK-002) that control is
 *  disabled — which is where this golden path honestly stops. */
test.describe('Call centre — the live queue', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('the queue names every caller waiting, and this build cannot answer them', async ({ page }) => {
    await gotoReady(page, '/call-center')
    await expect(page.getByRole('heading', { name: 'Agent Console' })).toBeVisible()

    const answer = page.getByRole('button', { name: /^Answer call from / })
    const waiting = await answer.count()
    expect(waiting).toBeGreaterThan(0)

    // The badge over the queue counts the callers the queue actually lists.
    const badge = page.getByRole('heading', { name: 'Live Queue' }).locator('xpath=following-sibling::*[1]')
    expect((await badge.innerText()).trim()).toBe(String(waiting))

    for (const call of await answer.all()) {
      // A queued call that names nobody cannot be worked.
      const caller = ((await call.getAttribute('aria-label')) ?? '').replace(/^Answer call from/, '').trim()
      expect(caller.length).toBeGreaterThan(0)
      // No live API, so the call cannot be taken — refused, never faked.
      await expect(call).toBeDisabled()
    }
  })
})

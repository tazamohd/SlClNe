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
 *  "The page loads" was the whole of this path's coverage. This used to
 *  continue into a queue golden path: the console had to say who was
 *  waiting and offer each of them a disabled answer control (no API,
 *  BLK-002). That queue — like the rest of the console — turned out to be
 *  entirely invented fixture data (BLK-004, project-control/
 *  SOURCE_RECONCILIATION.md): no calls/callQueue/callLogs backend exists
 *  anywhere, and a fictional but visible queue is the same false-success
 *  problem as a fictional answered call. `CallCenter.tsx` now renders a
 *  single honest "no data source yet" state instead, so there is no queue,
 *  no badge and no answer controls left to test — "the page loads" above
 *  is what remains of this golden path. */
test.describe('Call centre — no telephony backend', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('the console says plainly that it has no data source, rather than showing an invented queue', async ({ page }) => {
    await gotoReady(page, '/call-center')
    await expect(page.getByRole('heading', { name: 'Agent Console' })).toBeVisible()
    await expect(page.getByText('Call-center console has no data source yet')).toBeVisible()
    expect(await page.getByRole('button', { name: /^Answer call from / }).count()).toBe(0)
  })
})

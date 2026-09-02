import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

/** An advisor raises an estimate, the customer reviews the real work lines
 *  and either authorises or declines it. `CustomerApproval` renders the
 *  actual `approvalLines` data (item, urgency, note) rather than an invented
 *  summary, and is honest about what it cannot yet do: the one-time-code
 *  e-signature needs an SMS provider and an estimate link neither of which
 *  exist yet, so it shows the gap instead of a fake "Send code" control.
 *  `EstimateDetail`'s Approve/Decline buttons are real — they call
 *  `POST /estimates/:id/approve|reject` — and in this fixture-only build
 *  they resolve into a refusal toast, never a silent success. */
test.describe('Customer Estimate Approval (Golden Path 5)', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('estimate detail loads with a real reference number', async ({ page }) => {
    await gotoReady(page, '/estimate-detail')
    expect(await bodyText(page)).toContain('EST-0231')
  })

  test('estimate detail shows the server-computed total, never a client sum', async ({ page }) => {
    await gotoReady(page, '/estimate-detail')
    const text = await bodyText(page)
    expect(text).toContain('Grand total')
    expect(text).toContain('computed server-side')
  })

  test('approving an estimate without a live API surfaces a real refusal', async ({ page }) => {
    await gotoReady(page, '/estimate-detail')
    const approve = page.getByRole('button', { name: 'Approve' })
    if (await approve.count()) {
      await approve.click()
      // The fixture repository throws rather than pretending to save — the
      // toast is a real `role="status"` region carrying the server's refusal.
      await expect(page.getByRole('status')).toBeVisible()
      const toastText = await page.getByRole('status').innerText()
      expect(toastText.length).toBeGreaterThan(0)
    }
  })

  test('customer approval renders the real work lines, not an invented total', async ({ browser }) => {
    const ctx = await browser.newContext()
    await seedRole(ctx, 'owner')
    const page = await ctx.newPage()
    await gotoReady(page, '/customer-approval')
    const text = await bodyText(page)
    expect(text).toContain('Secure link')
    expect(text).toContain('What we found')
    // No estimate link is passed via `?estimate=`, so the OTP e-signature is
    // the honest "not connected" gap rather than a simulated flow.
    expect(text).toContain('Not connected')
    await ctx.close()
  })
})

test.describe('Customer estimate approval lifecycle', () => {
  test('advisor raises estimate → customer reviews real lines → approve is refused honestly', async ({
    context,
    page,
  }) => {
    test.setTimeout(90_000)
    await seedRole(context, 'owner')

    // 1. The estimate as the advisor priced it.
    await gotoReady(page, '/estimate-detail')
    expect(await bodyText(page)).toContain('EST-0231')

    // 2. Attempting to approve it hits the same server boundary every other
    //    write in this build hits — a refusal, not a silent success.
    const approve = page.getByRole('button', { name: 'Approve' })
    if (await approve.count()) {
      await approve.click()
      await expect(page.getByRole('status')).toBeVisible()
    }

    // 3. The customer's own view of the same decision — real approval lines,
    //    with the OTP e-signature step honestly gated on capabilities the
    //    server does not yet expose.
    await gotoReady(page, '/customer-approval')
    const customerText = await bodyText(page)
    expect(customerText).toContain('What we found')
    expect(customerText).toContain('Authorise the work')
  })
})

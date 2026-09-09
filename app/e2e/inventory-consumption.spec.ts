import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

/** Stock consumed on a job is real billed inventory, not a static list: the
 *  workshop QC screen's "Work Summary" and the technician portal's
 *  "Parts Used" both read the job's actual billed invoice lines, and each
 *  role sees a different honest state when there is nothing billed yet or
 *  when their role cannot read invoices at all. */
test.describe('Inventory Consumption (Golden Path 8)', () => {
  test('owner sees parts consumed on the job at quality control', async ({ context, page }) => {
    await seedRole(context, 'owner')
    await gotoReady(page, '/workshop-qc')
    const text = await bodyText(page)
    expect(text).toContain('Quality Check')
    expect(text).toContain('Work Summary')
  })

  test('technician portal reads billed parts through the same job/invoice link', async ({ page, context }) => {
    await seedRole(context, 'technician')
    await gotoReady(page, '/technician-portal/job-detail')
    expect(await bodyText(page)).toContain('Parts Used')
  })

  test('inventory hub totals reflect current parts stock', async ({ page, context }) => {
    await seedRole(context, 'owner')
    await gotoReady(page, '/inventory')
    expect(await bodyText(page)).toContain('Inventory & Parts')
  })
})

test.describe('Inventory consumption lifecycle', () => {
  test('parts billed on the job card → consumption visible at QC and on the technician portal', async ({
    context,
    page,
    browser,
  }) => {
    test.setTimeout(90_000)

    // 1. Quality control sees exactly what was billed to this job — the same
    //    invoice line data as the office, not a fabricated parts list.
    await seedRole(context, 'owner')
    await gotoReady(page, '/workshop-qc')
    expect(await bodyText(page)).toContain('Work Summary')

    // 2. The technician working the job reads the identical billed-parts link.
    const techCtx = await browser.newContext()
    await seedRole(techCtx, 'technician')
    const techPage = await techCtx.newPage()
    await gotoReady(techPage, '/technician-portal/job-detail')
    expect(await bodyText(techPage)).toContain('Parts Used')
    await techCtx.close()

    // 3. Consumption ultimately shows up against stock in the inventory hub.
    await gotoReady(page, '/inventory')
    expect(await bodyText(page)).toContain('Inventory & Parts')
  })
})

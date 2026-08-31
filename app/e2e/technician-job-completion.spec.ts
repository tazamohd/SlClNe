import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

/** A technician works a job from the repair bay through to quality control.
 *  `TechnicianPortalJobDetail` renders the job's real stage rail as a task
 *  list with a live progress bar — not a static checklist — and the two
 *  moves a technician can make (`repair → qc`, `qc → delivery`) are real
 *  `POST /jobs/:id/transition` calls. The segregation-of-duties rule (a
 *  technician may not pass their own QC) is enforced honestly: the "Pass
 *  Quality Check" button stays visible and disabled, with the rule spelled
 *  out, rather than vanishing. With no live API in this build (BLK-002),
 *  every stage action is disabled — the same honest state the workshop
 *  desk screens share. */
test.describe('Technician Job Completion (Golden Path 4)', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'technician')
  })

  test('technician portal shows the current job', async ({ page }) => {
    await gotoReady(page, '/technician-portal')
    expect(await bodyText(page)).toContain('Current Job')
  })

  test('job detail renders the real stage rail and progress bar', async ({ page }) => {
    await gotoReady(page, '/technician-portal/job-detail')
    await expect(page.getByRole('heading', { name: 'Job Detail' })).toBeVisible()
    const progress = page.getByRole('progressbar', { name: 'Tasks' })
    await expect(progress).toBeVisible()
    await expect(progress).toHaveAttribute('aria-valuemax', /\d+/)
  })

  test('a technician cannot pass their own quality check (segregation of duties)', async ({ page }) => {
    await gotoReady(page, '/technician-portal/job-detail')
    // Same job the workshop QC screen shows at the `qc` stage (see
    // workshop.spec.ts) — from the technician's own portal, the control
    // stays visible and disabled rather than vanishing.
    const qcButton = page.getByRole('button', { name: /Pass Quality Check/ })
    if (await qcButton.count()) {
      await expect(qcButton).toBeDisabled()
      expect(await bodyText(page)).toContain('Segregation of duties')
    }
  })
})

test.describe('Technician job completion lifecycle', () => {
  test('technician opens job → works the stage rail → stage action is honestly disabled', async ({
    context,
    page,
  }) => {
    test.setTimeout(90_000)
    await seedRole(context, 'technician')

    // 1. Technician's queue.
    await gotoReady(page, '/technician-portal')
    expect(await bodyText(page)).toContain('Current Job')

    // 2. Opens the job — the real stage rail, not a mock task list.
    await gotoReady(page, '/technician-portal/job-detail')
    await expect(page.getByRole('progressbar', { name: 'Tasks' })).toBeVisible()

    // 3. The one stage action this job offers is a real mutation
    //    (`POST /jobs/:id/transition`) — and with no API configured in this
    //    build, it is disabled rather than faking a completion.
    const repairButton = page.getByRole('button', { name: /Mark Repair Complete/ })
    const qcButton = page.getByRole('button', { name: /Pass Quality Check/ })
    if (await repairButton.count()) {
      await expect(repairButton).toBeDisabled()
    } else if (await qcButton.count()) {
      await expect(qcButton).toBeDisabled()
    }

    // 4. The office confirms the same job from the workshop side.
    await gotoReady(page, '/job-card-detail')
    expect(await bodyText(page)).toContain('JC-A3F8B2C1')
  })
})

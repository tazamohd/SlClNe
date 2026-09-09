import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Report Generation (Golden Path 18)', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'owner')
  })

  test('reports hub loads with the available reports and the saved-report shelf', async ({ page }) => {
    await gotoReady(page, '/reports')
    const text = await bodyText(page)
    expect(text).toContain('Available reports')
    expect(text).toContain('Sales Reports')
    expect(text).toContain('Financial Reports')
    expect(text).toContain('Saved reports')
  })

  test('reports analytics page loads', async ({ page }) => {
    await gotoReady(page, '/reports-analytics')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('financial reports page loads', async ({ page }) => {
    await gotoReady(page, '/financial-reports')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('executive reports page loads', async ({ page }) => {
    await gotoReady(page, '/executive-reports')
    const text = await bodyText(page)
    expect(text).toContain('SAR')
  })

  test('operational reports page loads', async ({ page }) => {
    await gotoReady(page, '/operational-reports')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('workshop reports page loads', async ({ page }) => {
    await gotoReady(page, '/workshop-reports')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('sales reports page loads', async ({ page }) => {
    await gotoReady(page, '/sales-reports')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('inventory reports page loads', async ({ page }) => {
    await gotoReady(page, '/inventory-reports')
    const text = await bodyText(page)
    expect(text).toContain('Stock')
  })

  test('insurance reports page loads', async ({ page }) => {
    await gotoReady(page, '/insurance-reports')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('loan reports page loads', async ({ page }) => {
    await gotoReady(page, '/loan-reports')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('custom reports page loads', async ({ page }) => {
    await gotoReady(page, '/custom-reports')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('BI dashboard page loads', async ({ page }) => {
    await gotoReady(page, '/bidashboard')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })
})

test.describe('Report generation lifecycle', () => {
  test('reports hub → financial → executive → inventory → BI dashboard', async ({ context, page }) => {
    test.setTimeout(90_000)
    await seedRole(context, 'owner')

    await gotoReady(page, '/reports')
    expect(await bodyText(page)).toContain('Available reports')

    await gotoReady(page, '/financial-reports')
    expect((await bodyText(page)).length).toBeGreaterThan(0)

    await gotoReady(page, '/executive-reports')
    expect(await bodyText(page)).toContain('SAR')

    await gotoReady(page, '/inventory-reports')
    expect(await bodyText(page)).toContain('Stock')

    await gotoReady(page, '/bidashboard')
    expect((await bodyText(page)).length).toBeGreaterThan(0)
  })
})

/** Ported from the retired `scripts/journeys/workshop-finance.mjs`.
 *
 *  Everything above proves a report screen renders. The builder is the one
 *  report surface where the user decides what the report *is* — the source,
 *  the columns, the rows — and the only assertion that matters there is that
 *  the file they take away is the report they were looking at. An export that
 *  quietly ships the unfiltered set, or yesterday's columns, is worse than no
 *  export, and nothing else in this suite would notice.
 *
 *  Pinned to a desktop viewport in both projects on purpose: below the mobile
 *  breakpoint `ReportSuite` renders a different builder with no column chips
 *  and no row search, so there is no chosen-columns-and-filter export to
 *  check there. */
test.describe('Report generation — the custom report builder', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'accountant')
  })

  test('the exported file is the report on screen: the chosen columns, the filtered rows', async ({ page }) => {
    // `downloadCsv` builds a Blob and clicks an anchor at it, so the file the
    // user receives *is* that Blob. Record it rather than trusting the click.
    await page.addInitScript(() => {
      const bucket: string[] = []
      ;(window as unknown as { __exports: string[] }).__exports = bucket
      const real = URL.createObjectURL.bind(URL)
      URL.createObjectURL = (blob: Blob) => {
        try {
          void blob.text().then((text) => bucket.push(text))
        } catch {
          /* not a Blob — nothing to record */
        }
        return real(blob)
      }
    })
    await gotoReady(page, '/custom-reports')

    const preview = page.getByRole('table', { name: 'Custom report results' })
    await expect(preview).toBeVisible()
    // `DataTable` renders five pulsing skeleton rows while its query is in
    // flight; reading them would be reporting on a loading state.
    await expect(preview.locator('.animate-pulse')).toHaveCount(0)
    const rows = preview.locator('tbody tr')
    expect(await rows.count()).toBeGreaterThan(0)

    // The preview shows the columns that are switched on, and no others.
    const chosen = page.locator('button[aria-pressed="true"]')
    const headers = await preview.locator('thead th').allInnerTexts()
    expect(headers.length).toBe(await chosen.count())

    // Turning a column off takes it out of the report.
    const dropped = (await chosen.nth(1).innerText()).trim()
    await chosen.nth(1).click()
    await expect(preview.locator('thead th')).toHaveCount(headers.length - 1)
    const kept = (await preview.locator('thead th').allInnerTexts()).map((head) => head.trim())
    expect(kept.some((head) => head.toLowerCase() === dropped.toLowerCase())).toBe(false)

    // Narrowing it narrows the rows, and only to rows that match.
    const needle = (await rows.first().locator('td').first().innerText()).trim()
    expect(needle.length).toBeGreaterThan(0)
    await page.getByLabel('Search rows').fill(needle)
    await expect(rows.filter({ hasNotText: needle })).toHaveCount(0)
    const narrowed = await rows.count()
    expect(narrowed).toBeGreaterThan(0)

    // The file is that report: those columns, those rows, and nothing else.
    await page.getByRole('button', { name: 'Export CSV' }).click()
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __exports: string[] }).__exports.length))
      .toBeGreaterThan(0)
    const csv = await page.evaluate(() => {
      const taken = (window as unknown as { __exports: string[] }).__exports
      return taken[taken.length - 1]
    })

    const lines = csv.replace(/^﻿/, '').trim().split('\n')
    expect(lines.length).toBe(narrowed + 1)
    for (const head of kept) expect(lines[0].toLowerCase()).toContain(head.toLowerCase())
    expect(lines[0].toLowerCase()).not.toContain(dropped.toLowerCase())
    for (const line of lines.slice(1)) expect(line).toContain(needle)
  })
})

import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Accounting Reconciliation (Golden Path 17)', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'accountant')
  })

  test('chart of accounts page loads', async ({ page }) => {
    await gotoReady(page, '/chart-of-accounts')
    const text = await bodyText(page)
    expect(text).toContain('Chart of Accounts')
  })

  test('journal entries page loads', async ({ page }) => {
    await gotoReady(page, '/journal-entries')
    const text = await bodyText(page)
    expect(text).toContain('Journal Entries')
  })

  test('bank reconciliation page loads with the book side and no pretend bank side', async ({ page }) => {
    await gotoReady(page, '/bank-reconciliation')
    const text = await bodyText(page)
    expect(text).toContain('Bank Reconciliation')
    expect(text).toContain('Receipts in view')
    expect(text).toContain('No bank feed connected')
  })

  test('financial reports page loads', async ({ page }) => {
    await gotoReady(page, '/financial-reports')
    const text = await bodyText(page)
    expect(text).toContain('Profit & Loss')
  })

  test('financial statements page loads', async ({ page }) => {
    await gotoReady(page, '/financial-statements')
    const text = await bodyText(page)
    expect(text).toContain('Statement Summary')
  })

  test('tax management page loads', async ({ page }) => {
    await gotoReady(page, '/tax-management')
    const text = await bodyText(page)
    expect(text).toContain('Output VAT')
  })

  test('expenses page loads', async ({ page }) => {
    await gotoReady(page, '/expenses')
    const text = await bodyText(page)
    expect(text).toContain('Expenses')
  })

  test('receipts page loads', async ({ page }) => {
    await gotoReady(page, '/receipts')
    const text = await bodyText(page)
    expect(text).toContain('Receipts')
  })
})

test.describe('Accounting reconciliation lifecycle', () => {
  test('chart of accounts → journal entries → bank reconciliation → financial reports → tax', async ({ context, page }) => {
    test.setTimeout(90_000)
    await seedRole(context, 'accountant')

    await gotoReady(page, '/chart-of-accounts')
    expect(await bodyText(page)).toContain('Chart of Accounts')

    await gotoReady(page, '/journal-entries')
    expect(await bodyText(page)).toContain('Journal Entries')

    await gotoReady(page, '/bank-reconciliation')
    expect(await bodyText(page)).toContain('Receipts in view')

    await gotoReady(page, '/financial-reports')
    expect(await bodyText(page)).toContain('Profit & Loss')

    await gotoReady(page, '/financial-statements')
    expect(await bodyText(page)).toContain('Statement Summary')

    await gotoReady(page, '/tax-management')
    expect(await bodyText(page)).toContain('Output VAT')
  })
})

/** Ported from the retired `scripts/journeys/workshop-finance.mjs`.
 *
 *  Reconciliation is a two-sided match: the cash the system recorded against
 *  the lines the bank reports. A screen that shows only one side has not
 *  reconciled anything, and "the page loads" above cannot tell the two apart.
 *  So: the book side has to agree with the figure printed over it, and the
 *  bank side has to say plainly that it does not exist rather than presenting
 *  an unreconciled ledger as a matched one.
 *
 *  Pinned to a desktop viewport in both projects: the mobile layout drops the
 *  statement panel and renders the book side as cards, so neither half of this
 *  is on the screen there. */
test.describe('Accounting reconciliation — the two sides of the match', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'accountant')
  })

  test('the receipts figure and the book-side table are describing the same receipts', async ({ page }) => {
    await gotoReady(page, '/bank-reconciliation')

    const book = page.getByRole('table', { name: 'Recorded cash receipts (book side)' })
    await expect(book).toBeVisible()
    await expect(book.locator('.animate-pulse')).toHaveCount(0)
    const listed = await book.locator('tbody tr').count()
    expect(listed).toBeGreaterThan(0)

    // The headline an accountant reads and the rows they check have to be the
    // same receipts; a stat that disagrees with its own table is the defect
    // this measurement exists to catch.
    const lines = (await bodyText(page)).split('\n').map((line) => line.trim())
    const at = lines.indexOf('Receipts in view')
    expect(at).toBeGreaterThan(-1)
    const figure = lines.slice(at + 1, at + 4).find((line) => /^\d[\d,]*$/.test(line))
    expect(Number(String(figure).replace(/,/g, ''))).toBe(listed)

    // Every recorded receipt carries an amount — a cash row with no money on
    // it cannot be reconciled against anything.
    for (const row of await book.locator('tbody tr').all()) {
      expect(await row.innerText()).toMatch(/SAR|ر\.س/)
    }
  })

  test('there is no bank side to match against, and the screen names the collection it is missing', async ({ page }) => {
    await gotoReady(page, '/bank-reconciliation')

    // The honest state of this path today: no statement table at all, an
    // import control that is present and refused, and the missing server
    // collection named rather than implied.
    await expect(page.getByRole('table', { name: 'Imported bank statement lines' })).toHaveCount(0)
    const text = await bodyText(page)
    expect(text).toContain('No bank statement source connected')
    expect(text).toContain('Missing server collection: bankStatements')
    await expect(page.getByRole('button', { name: 'Import statement' })).toBeDisabled()
  })
})

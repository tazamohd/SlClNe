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

  test('bank reconciliation page loads', async ({ page }) => {
    await gotoReady(page, '/bank-reconciliation')
    const text = await bodyText(page)
    expect(text).toContain('Unmatched')
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
    expect(await bodyText(page)).toContain('Unmatched')

    await gotoReady(page, '/financial-reports')
    expect(await bodyText(page)).toContain('Profit & Loss')

    await gotoReady(page, '/financial-statements')
    expect(await bodyText(page)).toContain('Statement Summary')

    await gotoReady(page, '/tax-management')
    expect(await bodyText(page)).toContain('Output VAT')
  })
})

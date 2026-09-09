import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Accounting screens', () => {
  test.beforeEach(async ({ context }) => {
    await seedRole(context, 'accountant')
  })

  test('chart of accounts loads', async ({ page }) => {
    await gotoReady(page, '/chart-of-accounts')
    const text = await bodyText(page)
    expect(text).toContain('Chart of Accounts')
  })

  test('journal entries loads', async ({ page }) => {
    await gotoReady(page, '/journal-entries')
    const text = await bodyText(page)
    expect(text).toContain('Journal Entries')
  })

  test('expenses loads', async ({ page }) => {
    await gotoReady(page, '/expenses')
    const text = await bodyText(page)
    expect(text).toContain('Expenses')
  })

  test('financial reports renders SAR totals', async ({ page }) => {
    await gotoReady(page, '/financial-reports')
    const text = await bodyText(page)
    expect(text).toContain('Profit & Loss')
    expect(text).toMatch(/SAR [\d,]+\.\d\d/)
  })

  test('financial statements loads', async ({ page }) => {
    await gotoReady(page, '/financial-statements')
    const text = await bodyText(page)
    expect(text).toContain('Statement Summary')
  })

  test('tax management loads', async ({ page }) => {
    await gotoReady(page, '/tax-management')
    const text = await bodyText(page)
    expect(text).toContain('Output VAT')
  })

  test('bank reconciliation loads', async ({ page }) => {
    await gotoReady(page, '/bank-reconciliation')
    const text = await bodyText(page)
    expect(text).toContain('Receipts in view')
    expect(text).toContain('No bank feed connected')
  })

  test('receipts page loads', async ({ page }) => {
    await gotoReady(page, '/receipts')
    const text = await bodyText(page)
    expect(text).toContain('Receipts')
  })
})

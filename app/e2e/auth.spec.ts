import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('Login flow', () => {
  test('login page renders with Sign In heading and demo role cards', async ({ page }) => {
    await gotoReady(page, '/login')
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#pw')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
    const text = await bodyText(page)
    expect(text).toContain('Quick access — pick a role')
  })

  test('clicking a demo role card fills credentials', async ({ page }) => {
    await gotoReady(page, '/login')
    const ownerCard = page.getByRole('button', { name: /Owner/ }).first()
    await ownerCard.click()
    const emailValue = await page.locator('#email').inputValue()
    expect(emailValue).toContain('@')
    const pwValue = await page.locator('#pw').inputValue()
    expect(pwValue).toBe('Demo@1234')
  })

  test('signing in as owner navigates to dashboard', async ({ page }) => {
    await gotoReady(page, '/login')
    await page.getByRole('button', { name: /Owner/ }).first().click()
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL('**/dashboard', { timeout: 5000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('signing in as technician navigates to technician portal', async ({ page }) => {
    await gotoReady(page, '/login')
    await page.getByRole('button', { name: /Technician/ }).first().click()
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL('**/technician-portal', { timeout: 5000 })
    expect(page.url()).toContain('/technician-portal')
  })

  test('submitting empty form shows error toast', async ({ page }) => {
    await gotoReady(page, '/login')
    await page.getByRole('button', { name: 'Sign In' }).click()
    const text = await bodyText(page)
    expect(text).toContain('Please fill in all fields')
  })

  test('unauthenticated user is redirected to login from guarded routes', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    await page.waitForURL('**/login', { timeout: 5000 })
    expect(page.url()).toContain('/login')
  })

  test('forgot password link navigates to reset screen', async ({ page }) => {
    await gotoReady(page, '/login')
    await page.getByRole('link', { name: /Forgot password/ }).click()
    await page.waitForURL('**/forgot-password', { timeout: 5000 })
    const text = await bodyText(page)
    expect(text).toContain('Reset Password')
  })

  test('register link navigates to registration screen', async ({ page }) => {
    await gotoReady(page, '/login')
    await page.getByRole('link', { name: /Register/ }).click()
    await page.waitForURL('**/register', { timeout: 5000 })
    const text = await bodyText(page)
    expect(text).toContain("Don't have an account?")
  })
})

test.describe('Auth status screens', () => {
  test('unauthorized page shows 403', async ({ page }) => {
    await gotoReady(page, '/unauthorized')
    const text = await bodyText(page)
    expect(text).toContain('403')
  })

  test('error404 page renders', async ({ page }) => {
    await gotoReady(page, '/error404')
    const text = await bodyText(page)
    expect(text).toContain("doesn't exist or has been moved")
  })

  test('maintenance page renders', async ({ page }) => {
    await gotoReady(page, '/maintenance')
    const text = await bodyText(page)
    expect(text).toContain('System Under Maintenance')
  })
})

test.describe('Auth onboarding screens', () => {
  test('splash screen renders', async ({ page }) => {
    await gotoReady(page, '/splash')
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('welcome screen renders', async ({ page }) => {
    await gotoReady(page, '/welcome')
    const text = await bodyText(page)
    expect(text).toContain('Welcome to SALIS AUTO')
  })

  test('language selection renders', async ({ page }) => {
    await gotoReady(page, '/language-selection')
    const text = await bodyText(page)
    expect(text).toContain('Choose your language')
  })

  test('OTP verification screen renders', async ({ page }) => {
    await gotoReady(page, '/otpverification')
    const text = await bodyText(page)
    expect(text).toContain('OTP Verification')
  })
})

import { test, expect } from '@playwright/test'
import { seedRole, gotoReady, bodyText } from './helpers'

test.describe('User Invitation + RBAC (Golden Path 16)', () => {
  test('invite acceptance page loads', async ({ page }) => {
    await gotoReady(page, '/invite-acceptance')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('role selection page loads', async ({ page }) => {
    await gotoReady(page, '/role-selection')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test('registration page loads', async ({ page }) => {
    await gotoReady(page, '/register')
    const text = await bodyText(page)
    expect(text.length).toBeGreaterThan(0)
  })

  test.describe('owner views', () => {
    test.beforeEach(async ({ context }) => {
      await seedRole(context, 'owner')
    })

    test('users & teams page loads', async ({ page }) => {
      await gotoReady(page, '/users-teams')
      const text = await bodyText(page)
      expect(text).toContain('Users & Teams')
    })

    test('roles & permissions page loads', async ({ page }) => {
      await gotoReady(page, '/roles-permissions')
      const text = await bodyText(page)
      expect(text).toContain('Permission Matrix')
    })
  })
})

test.describe('User invitation lifecycle', () => {
  test('invite → role selection → admin manages users & roles', async ({ context, page }) => {
    test.setTimeout(90_000)

    // Public: accept invite
    await gotoReady(page, '/invite-acceptance')
    expect((await bodyText(page)).length).toBeGreaterThan(0)

    // Public: pick a role
    await gotoReady(page, '/role-selection')
    expect((await bodyText(page)).length).toBeGreaterThan(0)

    // Owner manages users & teams
    await seedRole(context, 'owner')

    await gotoReady(page, '/users-teams')
    expect(await bodyText(page)).toContain('Users & Teams')

    await gotoReady(page, '/roles-permissions')
    expect(await bodyText(page)).toContain('Permission Matrix')
  })
})

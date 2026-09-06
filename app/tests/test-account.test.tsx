import { beforeEach, describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  PERMS,
  ROLES,
  SCREEN_MODULE,
  FIELD_RULES,
  approvalLimit,
  can,
  canApprove,
  canScreen,
  destinationFor,
  navFor,
  roleMeta,
} from '@/data/rbac'
import { NAV } from '@/data/generated/nav'
import { clearDemoAccounts, listDemoAccounts } from '@/data/demo-accounts'
import { useSession } from '@/providers/SessionProvider'
import { TestRoleBar } from '@/components/shell/TestRoleBar'
import { Register } from '@/screens/auth/Register'
import { Login } from '@/screens/auth/Login'
import { STORAGE_KEYS } from '@/lib/storage'
import type { Action } from '@/data/types'
import { renderWithProviders } from './helpers/render'

/** The `test` identity: the account added so one login can walk the whole
 *  product, plus the two things that makes it worth having — a role switcher
 *  that takes it into the portals, and a registration flow that creates an
 *  account from scratch instead of apologising for not existing.
 *
 *  Everything here is the *client's* half. It hides and offers; the server
 *  re-checks the switch against the account's own row and re-checks every
 *  permission on every request (`server/tests/auth-test-account.test.ts`), so a
 *  passing test on this side is not a security claim and is not written as one.
 */

const ACTIONS: Action[] = ['v', 'c', 'e', 'd', 'a', 'x']

/** Renders the acting role, so a switch is observable rather than inferred. */
function RoleProbe() {
  const { role, baseRole, canSwitchRole } = useSession()
  return (
    <p>
      acting:{role} base:{baseRole} switchable:{String(canSwitchRole)}
    </p>
  )
}

beforeEach(() => {
  window.localStorage.clear()
  clearDemoAccounts()
})

describe('the test role in the matrix', () => {
  it('is one of the demo identities, with its own credentials and persona', () => {
    const meta = roleMeta('test')
    expect(meta.id).toBe('test')
    expect(meta.demo.email).toBe('test@salisauto.sa')
    expect(meta.demo.name).toBe('Test User')
    expect(meta.ar).toBeTruthy()
  })

  it('holds every action on every module — that is what "do everything" means', () => {
    for (const module of Object.keys(PERMS)) {
      for (const action of ACTIONS) {
        expect(can(module, action, 'test'), `test on ${module}:${action}`).toBe(true)
      }
    }
  })

  it('covers the garage roles, the customer portal and the supplier portal alike', () => {
    // Named explicitly rather than left to the sweep above, because these three
    // are the ask: the workshop floor, and both external portals.
    expect(can('jobcards', 'e', 'test')).toBe(true)
    expect(can('inventory', 'e', 'test')).toBe(true)
    expect(can('portalcustomer', 'v', 'test')).toBe(true)
    expect(can('portalsupplier', 'v', 'test')).toBe(true)
    expect(can('portaltech', 'v', 'test')).toBe(true)
    expect(can('portalprocure', 'v', 'test')).toBe(true)
  })

  it('can open every screen the app maps to a module', () => {
    for (const screenName of Object.keys(SCREEN_MODULE)) {
      expect(canScreen(screenName, 'test'), `test on ${screenName}`).toBe(true)
    }
  })

  it('sees the whole sidebar — no group is filtered away', () => {
    expect(navFor('test')).toHaveLength(NAV.length)
    const items = navFor('test').flatMap((group) => group.items)
    expect(items).toHaveLength(NAV.flatMap((group) => group.items).length)
  })

  it('approves without a ceiling, and is not redacted anywhere', () => {
    expect(approvalLimit('test')).toBeNull()
    expect(canApprove('test')).toBe(true)
    expect(canApprove('test', 9_999_999_999)).toBe(true)
    for (const rule of FIELD_RULES) {
      expect(rule.hidden).not.toContain('test')
    }
  })

  it('stays inside its own organization: scope is `all`, never `platform`', () => {
    // The one thing an all-access account must *not* have. `platform` is the
    // super admin's, and it crosses the tenant boundary.
    expect(roleMeta('test').scope).toBe('all')
    expect(roleMeta('superadmin').scope).toBe('platform')
  })

  it('lands on the dashboard after signing in', () => {
    expect(destinationFor('test')).toBe('/dashboard')
  })
})

describe('TestRoleBar', () => {
  it('renders nothing for an ordinary account', () => {
    renderWithProviders(<TestRoleBar />, { role: 'owner' })
    expect(screen.queryByTestId('test-role-bar')).toBeNull()
  })

  it('offers every role to the test account', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TestRoleBar />, { role: 'test' })
    await user.click(screen.getByRole('button', { expanded: false }))
    const options = await screen.findAllByRole('option')
    expect(options).toHaveLength(ROLES.length)
  })

  it('switches the acting role while the account stays the test one', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <TestRoleBar />
        <RoleProbe />
      </>,
      { role: 'test' }
    )
    expect(screen.getByText(/acting:test base:test switchable:true/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { expanded: false }))
    await user.click(await screen.findByRole('option', { name: /Supplier/ }))

    await waitFor(() =>
      expect(screen.getByText(/acting:supplier base:test switchable:true/)).toBeInTheDocument()
    )
    // Still switchable: the way back out of an external portal is the point.
    expect(window.localStorage.getItem(STORAGE_KEYS.role)).toBe('supplier')
  })

  it('does not offer the switcher to a role the test account switched into', async () => {
    // The base role is what decides, so a session that signed in *as* the
    // supplier gets no switcher even though the test account acting as one
    // does.
    renderWithProviders(<TestRoleBar />, { role: 'supplier' })
    expect(screen.queryByTestId('test-role-bar')).toBeNull()
  })
})

describe('registration, from scratch', () => {
  async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>, email: string) {
    await user.type(screen.getByLabelText('Full Name'), 'Sara Al-Harbi')
    await user.type(screen.getByLabelText('Email'), email)
    await user.type(screen.getByLabelText('Phone'), '+966 55 000 1111')
    await user.type(screen.getByLabelText('Password'), 'a-perfectly-fine-password')
    await user.type(screen.getByLabelText('Confirm Password'), 'a-perfectly-fine-password')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Register' }))
  }

  it('creates an account and signs it in as the owner of its own workshop', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <>
        <Register />
        <RoleProbe />
      </>,
      { route: '/register' }
    )
    await fillAndSubmit(user, 'sara@example.sa')

    await waitFor(() => expect(listDemoAccounts()).toHaveLength(1))
    expect(listDemoAccounts()[0]).toMatchObject({ email: 'sara@example.sa', role: 'owner' })
    await waitFor(() =>
      expect(screen.getByText(/acting:owner base:owner switchable:false/)).toBeInTheDocument()
    )
  })

  it('refuses an address that already has an account, on the field that owns it', async () => {
    const user = userEvent.setup()
    const { unmount } = renderWithProviders(<Register />, { route: '/register' })
    await fillAndSubmit(user, 'twice@example.sa')
    await waitFor(() => expect(listDemoAccounts()).toHaveLength(1))
    unmount()

    renderWithProviders(<Register />, { route: '/register' })
    await fillAndSubmit(user, 'twice@example.sa')
    expect(await screen.findByText(/already has an account/)).toBeInTheDocument()
    expect(listDemoAccounts()).toHaveLength(1)
  })

  it('will not shadow a seeded demo identity', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Register />, { route: '/register' })
    await fillAndSubmit(user, 'owner@salisauto.sa')
    expect(await screen.findByText(/already has an account/)).toBeInTheDocument()
    expect(listDemoAccounts()).toHaveLength(0)
  })

  it('holds the password to the length the server would demand', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Register />, { route: '/register' })
    await user.type(screen.getByLabelText('Full Name'), 'Short')
    await user.type(screen.getByLabelText('Email'), 'short@example.sa')
    await user.type(screen.getByLabelText('Phone'), '+966 55 000 1111')
    await user.type(screen.getByLabelText('Password'), 'shortish')
    await user.type(screen.getByLabelText('Confirm Password'), 'shortish')
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Register' }))

    expect(await screen.findByText(/at least 12 characters/)).toBeInTheDocument()
    expect(listDemoAccounts()).toHaveLength(0)
  })

  it('lets the registered account sign in again afterwards', async () => {
    const user = userEvent.setup()
    const { unmount } = renderWithProviders(<Register />, { route: '/register' })
    await fillAndSubmit(user, 'returning@example.sa')
    await waitFor(() => expect(listDemoAccounts()).toHaveLength(1))
    unmount()
    window.localStorage.removeItem(STORAGE_KEYS.role)

    renderWithProviders(
      <>
        <Login />
        <RoleProbe />
      </>,
      { route: '/login' }
    )
    await user.type(screen.getByLabelText('Email'), 'returning@example.sa')
    await user.type(screen.getByLabelText('Password'), 'Demo@1234')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() =>
      expect(screen.getByText(/acting:owner base:owner switchable:false/)).toBeInTheDocument()
    )
  })
})

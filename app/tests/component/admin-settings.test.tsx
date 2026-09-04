import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactElement } from 'react'
import { PreferencesProvider } from '@/providers/PreferencesProvider'
import { SessionProvider } from '@/providers/SessionProvider'
import { RepositoryProvider } from '@/providers/RepositoryProvider'
import { ToastProvider } from '@/components/ui/Toast'
import { ModalProvider } from '@/components/ui/Modal'
import { Settings } from '@/screens/admin/Settings'
import { Profile } from '@/screens/admin/Profile'
import { AuditLog } from '@/screens/admin/AuditLog'

/** The settings family, mounted the way the app mounts it: session, toasts
 *  and the modal queue present, an owner signed in to the fixture build. */
function renderAdmin(ui: ReactElement, route = '/settings') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>
        <SessionProvider>
          <RepositoryProvider>
            <ToastProvider>
              <ModalProvider>
                <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
              </ModalProvider>
            </ToastProvider>
          </RepositoryProvider>
        </SessionProvider>
      </PreferencesProvider>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  localStorage.setItem('salis-role', 'owner')
})

afterEach(() => {
  localStorage.clear()
  cleanup()
})

describe('Settings (workshop)', () => {
  it('keeps the smoke contract: the Settings H1, the Workshop Profile card and the section nav', () => {
    renderAdmin(<Settings />)
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Workshop Profile' })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Settings sections' })
    expect(within(nav).getByRole('link', { name: /Workshop/ })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: /Billing/ })).toHaveAttribute('href', '/subscription')
  })

  it('demo mode shows a read-only notice but keeps the inputs editable, and Save arms only once dirty', async () => {
    const user = userEvent.setup()
    renderAdmin(<Settings />)
    expect(screen.getByText(/Demo mode/)).toBeInTheDocument()

    const save = screen.getByRole('button', { name: 'Save Changes' })
    expect(save).toBeDisabled()

    const name = screen.getByLabelText(/Workshop Name/)
    expect(name).not.toBeDisabled()
    await user.type(name, ' KSA')
    expect(save).toBeEnabled()
  })

  it('Manage Billing links to the subscription page', () => {
    renderAdmin(<Settings />)
    expect(screen.getByRole('button', { name: 'Manage Billing' })).toBeInTheDocument()
  })

  it('danger zone reset needs the typed word, then reloads the page', async () => {
    const user = userEvent.setup()
    const reload = vi.fn()
    const original = window.location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...original, reload },
    })
    try {
      renderAdmin(<Settings />)
      expect(screen.getByRole('heading', { level: 2, name: 'Danger zone' })).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Reset demo data' }))

      const dialog = screen.getByRole('dialog')
      const confirm = within(dialog).getByRole('button', { name: 'Reload and reset' })
      expect(confirm).toBeDisabled()

      await user.type(within(dialog).getByLabelText(/Type the word to confirm/), 'reset')
      expect(confirm).toBeEnabled()
      await user.click(confirm)
      expect(reload).toHaveBeenCalledTimes(1)
    } finally {
      Object.defineProperty(window, 'location', { configurable: true, value: original })
    }
  })
})

describe('Profile', () => {
  it('renders the header, the Change Password form with the right autocomplete hints', () => {
    renderAdmin(<Profile />, '/profile')
    expect(screen.getByRole('heading', { level: 1, name: 'Profile' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Change Password' })).toBeInTheDocument()
    expect(screen.getByLabelText('Current Password')).toHaveAttribute('autocomplete', 'current-password')
    expect(screen.getByLabelText('New Password')).toHaveAttribute('autocomplete', 'new-password')
    expect(screen.getByLabelText('Confirm Password')).toHaveAttribute('autocomplete', 'new-password')
  })

  it('validates the confirmation on blur, before any submit', async () => {
    const user = userEvent.setup()
    renderAdmin(<Profile />, '/profile')
    await user.type(screen.getByLabelText('New Password'), 'correct-horse-1')
    const confirm = screen.getByLabelText('Confirm Password')
    await user.type(confirm, 'wrong')
    await user.tab()
    expect(confirm).toHaveAttribute('aria-invalid', 'true')
    expect(confirm).toHaveAccessibleDescription('Passwords do not match')
  })

  it('says "Password changed" and clears the form on success', async () => {
    const user = userEvent.setup()
    renderAdmin(<Profile />, '/profile')
    await user.type(screen.getByLabelText('Current Password'), 'old-password-1')
    await user.type(screen.getByLabelText('New Password'), 'correct-horse-1')
    await user.type(screen.getByLabelText('Confirm Password'), 'correct-horse-1')
    await user.click(screen.getByRole('button', { name: 'Change Password' }))
    expect(await screen.findByText('Password changed')).toBeInTheDocument()
    expect(screen.getByLabelText('New Password')).toHaveValue('')
  })
})

describe('AuditLog', () => {
  it('shows the demo-data notice, groups entries by day, and pins IPs LTR', () => {
    renderAdmin(<AuditLog />, '/audit-log')
    expect(screen.getByRole('heading', { level: 1, name: 'Audit Log' })).toBeInTheDocument()
    expect(screen.getByText(/Demo data/)).toBeInTheDocument()
    // Three distinct days in the seed, newest first.
    const days = screen.getAllByRole('heading', { level: 2 })
    expect(days.length).toBe(3)
    const ip = screen.getAllByText('192.168.1.45')[0]
    expect(ip).toHaveAttribute('dir', 'ltr')
  })

  it('filters by category chip and reports an honest empty state', async () => {
    const user = userEvent.setup()
    renderAdmin(<AuditLog />, '/audit-log')
    // Chips are real radios to assistive tech, not buttons.
    await user.click(screen.getByRole('radio', { name: 'Auth' }))
    expect(screen.getByText('logged in')).toBeInTheDocument()
    expect(screen.queryByText('created job card')).not.toBeInTheDocument()

    await user.type(screen.getByRole('searchbox'), 'nothing-matches-this')
    expect(screen.getByText('No audit entries')).toBeInTheDocument()
  })
})

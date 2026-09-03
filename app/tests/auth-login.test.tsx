import { describe, expect, it } from 'vitest'
import { Navigate, Route, Routes } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Login } from '@/screens/auth/Login'
import { STORAGE_KEYS } from '@/lib/storage'
import { setViewportWidth } from '@/test-setup'
import { renderWithProviders } from './helpers/render'

/** The prototype validated with toasts that vanished before a screen reader
 *  finished them, hid the role picker's purpose, and offered no way to change
 *  the language and region chosen two screens earlier. */

function mount(route = '/login', state?: { email: string }) {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace state={state} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<h1>Dashboard landed</h1>} />
      <Route path="/technician-portal" element={<h1>Technician landed</h1>} />
    </Routes>,
    { route }
  )
}

const email = () => document.getElementById('email') as HTMLInputElement
const password = () => document.getElementById('pw') as HTMLInputElement

describe('Login', () => {
  it('refuses an empty submit with a summary, not a toast', async () => {
    const user = userEvent.setup()
    mount()
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    const summary = screen.getByRole('alert')
    expect(summary).toHaveTextContent('Please fill in all fields')
    expect(screen.getByText('Please enter your email address.')).toBeInTheDocument()
    expect(screen.getByText('Please enter your password.')).toBeInTheDocument()
    expect(email()).toHaveAttribute('aria-invalid', 'true')
  })

  it('validates the email inline when the field is left', async () => {
    const user = userEvent.setup()
    mount()
    await user.type(email(), 'not-an-address')
    await user.tab()
    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument()
    // No submit yet, so no summary.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await user.clear(email())
    await user.type(email(), 'owner@salis.example')
    await user.tab()
    expect(screen.queryByText('Please enter a valid email address.')).not.toBeInTheDocument()
  })

  it('marks the email for autofill and pins it left-to-right', () => {
    mount()
    expect(email()).toHaveAttribute('autocomplete', 'email')
    expect(email()).toHaveAttribute('dir', 'ltr')
    expect(password()).toHaveAttribute('autocomplete', 'current-password')
  })

  it('summarises what the first three steps chose, with a way back', () => {
    window.localStorage.setItem(STORAGE_KEYS.region, 'Jeddah')
    mount()
    expect(screen.getByText('English · Jeddah')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Change' })).toHaveAttribute('href', '/region-selection')
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/region-selection')
  })

  it('opens the demo panel on a desktop and folds it on a phone', () => {
    const { unmount } = mount()
    const desktopToggle = screen.getByRole('button', { name: 'Explore with a demo role' })
    expect(desktopToggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Quick access — pick a role')).toBeVisible()
    unmount()

    setViewportWidth(390)
    mount()
    const phoneToggle = screen.getByRole('button', { name: 'Explore with a demo role' })
    expect(phoneToggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('Quick access — pick a role')).not.toBeVisible()
  })

  it('fills the credentials from a role card and signs in through the real form', async () => {
    const user = userEvent.setup()
    mount()
    const owner = screen.getAllByRole('button', { name: /Owner/ })[0]!
    await user.click(owner)

    expect(owner).toHaveAttribute('aria-pressed', 'true')
    expect(email().value).toContain('@')
    expect(password().value).toBe('Demo@1234')

    await user.click(screen.getByRole('button', { name: 'Sign In' }))
    expect(await screen.findByText('Dashboard landed', {}, { timeout: 3000 })).toBeInTheDocument()
  })

  it('names the reason when the demo password is wrong', async () => {
    const user = userEvent.setup()
    mount()
    await user.click(screen.getAllByRole('button', { name: /Owner/ })[0]!)
    await user.clear(password())
    await user.type(password(), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Pick a demo role to fill valid credentials.'
      )
    )
    expect(screen.queryByText('Dashboard landed')).not.toBeInTheDocument()
  })

  it('prefills the email a session-expired screen passed along', () => {
    mount('/', { email: 'advisor@salis.example' })
    expect(email().value).toBe('advisor@salis.example')
  })
})

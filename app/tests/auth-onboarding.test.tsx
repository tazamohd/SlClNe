import { describe, expect, it } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Onboarding, ONBOARDING_DRAFT_KEY, EMPTY_DRAFT } from '@/screens/auth/Onboarding'
import { renderWithProviders } from './helpers/render'

/** The wizard used to accept nothing, remember nothing, and end on a button
 *  that did nothing. */

function mount() {
  return renderWithProviders(
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/dashboard" element={<h1>Dashboard landed</h1>} />
    </Routes>,
    { route: '/onboarding' }
  )
}

function seed(draft: Partial<typeof EMPTY_DRAFT>) {
  window.localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify({ ...EMPTY_DRAFT, ...draft }))
}

const storedDraft = () => JSON.parse(window.localStorage.getItem(ONBOARDING_DRAFT_KEY) ?? 'null')

describe('Onboarding', () => {
  it('says which step this is and keeps the smoke heading', () => {
    mount()
    expect(screen.getByRole('heading', { name: 'Welcome to SALIS AUTO' })).toBeInTheDocument()
    expect(document.body.textContent).toContain('Step 1 of 5 · Organization')
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
  })

  it('refuses to continue past an empty organisation name', async () => {
    const user = userEvent.setup()
    mount()
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByText('Please enter your organization name.')).toBeInTheDocument()
    expect(document.body.textContent).toContain('Step 1 of 5')
  })

  it('drafts what is typed and says so', async () => {
    const user = userEvent.setup()
    mount()
    expect(screen.getByText('Drafts save automatically')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Organization Name/), 'Salis Riyadh')
    await waitFor(() => expect(storedDraft()?.organization?.name).toBe('Salis Riyadh'))
    expect(screen.getByText('Saved just now')).toBeInTheDocument()
  })

  it('advances with the values and comes back to them', async () => {
    const user = userEvent.setup()
    mount()
    await user.type(screen.getByLabelText(/Organization Name/), 'Salis Riyadh')
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(document.body.textContent).toContain('Step 2 of 5 · Branch Setup')
    expect(storedDraft()?.step).toBe(1)

    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(document.body.textContent).toContain('Step 1 of 5')
    expect(screen.getByLabelText(/Organization Name/)).toHaveValue('Salis Riyadh')
  })

  it('reopens where the draft left off', () => {
    seed({ step: 1, branch: { name: 'Main Workshop', city: 'Riyadh', bays: '4' } })
    mount()
    expect(document.body.textContent).toContain('Step 2 of 5 · Branch Setup')
    expect(screen.getByLabelText(/Branch Name/)).toHaveValue('Main Workshop')
    expect(screen.getByLabelText(/Service Bays/)).toHaveAttribute('dir', 'ltr')
  })

  it('has real switches on the preferences step', async () => {
    const user = userEvent.setup()
    seed({ step: 3 })
    mount()
    expect(document.body.textContent).toContain('Step 4 of 5 · Preferences')
    const switches = screen.getAllByRole('switch')
    expect(switches).toHaveLength(3)

    const notifications = screen.getByRole('switch', { name: 'Notifications' })
    expect(notifications).toHaveAttribute('aria-checked', 'true')
    await user.click(notifications)
    expect(notifications).toHaveAttribute('aria-checked', 'false')
  })

  it('finishes on the dashboard and forgets the draft', async () => {
    const user = userEvent.setup()
    seed({ step: 4, organization: { name: 'Salis Riyadh', cr: '', vat: '' } })
    mount()
    expect(document.body.textContent).toContain('Step 5 of 5 · Complete')
    await user.click(screen.getByRole('button', { name: 'Get Started' }))

    expect(await screen.findByText('Dashboard landed')).toBeInTheDocument()
    expect(window.localStorage.getItem(ONBOARDING_DRAFT_KEY)).toBeNull()
    expect(screen.getByText('Workspace ready')).toBeInTheDocument()
  })
})
